import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  buildJobsTable,
  assetFactoryRunsTable,
  builderWorkspacesTable,
  db,
  qaRunEventsTable,
  qaRunsTable,
  type PersistedBuildContract,
  type PersistedQaAcceptanceResult,
  type PersistedQaDefect,
} from "@workspace/db";
import {
  configuredBuilderAdapter,
  type BuilderAgentAdapter,
  type BuilderStatusResult,
} from "./builder-agent-adapter";
import {
  createOrReuseHumanAction,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
} from "./human-gates";
import {
  recordLifecycleEvent,
  setOpportunityActivity,
} from "./lifecycle-state";
import { logger } from "./logger";
import { createInProcessBuilderGatewayAdapter } from "./in-process-builder-gateway-adapter";
import {
  configuredQaAdapter,
  type QaAgentAdapter,
  type QaResult,
} from "./qa-agent-adapter";

const DEFAULT_INTERVAL_MS = 3_000;
const MIN_INTERVAL_MS = 1_000;
const DEFAULT_MAX_REPAIR_ROUNDS = 4;
let workerTimer: NodeJS.Timeout | null = null;
let tickRunning = false;

const intervalMs = (): number => {
  const configured = Number(process.env.MONEY_SCOUT_QA_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_INTERVAL_MS
    ? configured
    : DEFAULT_INTERVAL_MS;
};

const maxRepairRounds = (): number => {
  const configured = Number(process.env.MONEY_SCOUT_QA_MAX_REPAIR_ROUNDS ?? "");
  if (!Number.isInteger(configured) || configured < 1)
    return DEFAULT_MAX_REPAIR_ROUNDS;
  return Math.min(8, configured);
};

const normalizeCriterion = (value: string): string =>
  value.trim().replace(/\s+/g, " ").toLowerCase();

async function recordQaEvent(input: {
  qaRunId: number;
  buildJobId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(qaRunEventsTable).values({
    qaRunId: input.qaRunId,
    buildJobId: input.buildJobId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function recordExternalCost(
  buildJobId: number,
  costCents: number | undefined,
): Promise<void> {
  if (!costCents || costCents <= 0) return;
  await db
    .update(buildJobsTable)
    .set({
      externalSpendUsedCents: sql`${buildJobsTable.externalSpendUsedCents} + ${Math.round(costCents)}`,
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, buildJobId));
}

function remainingSpend(job: typeof buildJobsTable.$inferSelect): number {
  return Math.max(
    0,
    job.externalSpendCeilingCents - job.externalSpendUsedCents,
  );
}

function qaIdempotencyKey(workspaceKey: string, roundNumber: number): string {
  return `${workspaceKey}:qa-round-${roundNumber}`.slice(0, 500);
}

function repairIdempotencyKey(
  workspaceKey: string,
  roundNumber: number,
): string {
  return `${workspaceKey}:qa-round-${roundNumber}:repair-1`.slice(0, 500);
}

function missingArtifactDefects(
  workspace: typeof builderWorkspacesTable.$inferSelect,
): PersistedQaDefect[] {
  const missing = [
    !workspace.repositoryUrl ? "repository URL" : null,
    !workspace.branchName ? "branch name" : null,
    !workspace.resultCommitSha ? "exact commit SHA" : null,
  ]
    .filter(Boolean)
    .join(" and ");
  return [
    {
      key: "BUILD_ARTIFACT_MISSING",
      category: "BUILD_FAILURE",
      severity: "HIGH",
      summary: `Independent QA cannot inspect the build because the builder did not preserve a ${missing}.`,
      evidence: `Builder workspace ${workspace.id} reached the QA/debug boundary without a complete inspectable artifact reference.`,
      repairGuidance:
        "Repair the builder output and preserve an inspectable repository URL, branch, and exact commit containing the implemented contract.",
      humanOnly: false,
    },
  ];
}

function resultDefects(result: QaResult): PersistedQaDefect[] {
  if (result.defects.length > 0) {
    return result.requiresHumanAction
      ? result.defects.map((defect) => ({ ...defect, humanOnly: true }))
      : result.defects;
  }
  return [
    {
      key:
        result.state === "BLOCKED"
          ? "QA_BLOCKED_WITHOUT_DIAGNOSIS"
          : "QA_FAILED_WITHOUT_DIAGNOSIS",
      category: result.state === "BLOCKED" ? "ENVIRONMENT" : "UNKNOWN",
      severity: "HIGH",
      summary:
        result.summary ??
        `QA ended in ${result.state} without a structured defect diagnosis.`,
      evidence: null,
      repairGuidance:
        result.state === "BLOCKED"
          ? "Diagnose the QA environment boundary and make the build testable without production-only side effects."
          : "Reproduce the failed QA state and repair the smallest verified cause before retesting.",
      humanOnly: result.requiresHumanAction,
    },
  ];
}

function verificationDefects(input: {
  criteria: string[];
  acceptanceResults: PersistedQaAcceptanceResult[];
  baselineChecksPassed: boolean | null;
  providerDefects: PersistedQaDefect[];
}): PersistedQaDefect[] {
  const defects = [...input.providerDefects];
  if (input.baselineChecksPassed !== true) {
    defects.push({
      key: "BASELINE_CHECKS_NOT_VERIFIED",
      category: "TEST_FAILURE",
      severity: "HIGH",
      summary:
        "The QA provider did not prove that the baseline technical checks passed.",
      evidence:
        input.baselineChecksPassed === false
          ? "At least one baseline check failed."
          : "Baseline check result was absent or unknown.",
      repairGuidance:
        "Make the project reproducibly installable/runnable and clear applicable build, typecheck, test, secret-safety, and forbidden-side-effect checks.",
      humanOnly: false,
    });
  }

  const byCriterion = new Map(
    input.acceptanceResults.map((result) => [
      normalizeCriterion(result.criterion),
      result,
    ]),
  );
  input.criteria.forEach((criterion, index) => {
    const result = byCriterion.get(normalizeCriterion(criterion));
    if (result?.status === "PASS") return;
    defects.push({
      key: `ACCEPTANCE_NOT_VERIFIED_${index + 1}`,
      category: "ACCEPTANCE_GAP",
      severity: "HIGH",
      summary: `Acceptance criterion was not independently verified: ${criterion}`,
      evidence:
        result?.evidence ??
        `QA status for this criterion was ${result?.status ?? "MISSING"}.`,
      repairGuidance:
        "Repair the implementation or its executable verification so this exact acceptance criterion can be demonstrated as PASS.",
      humanOnly: false,
    });
  });
  return defects;
}

async function createNextQaRound(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  roundNumber: number,
) {
  const contract = job.contract as PersistedBuildContract;
  const [created] = await db
    .insert(qaRunsTable)
    .values({
      buildJobId: job.id,
      builderWorkspaceId: workspace.id,
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      roundNumber,
      status: "PENDING",
      qaProvider: "UNCONFIGURED",
      qaCostMode: "ZERO_CASH",
      qaIdempotencyKey: qaIdempotencyKey(workspace.workspaceKey, roundNumber),
      repositoryUrl: workspace.repositoryUrl,
      branchName: workspace.branchName,
      commitSha: workspace.resultCommitSha ?? job.resultCommitSha,
      acceptanceCriteria: contract.acceptanceCriteria,
    })
    .onConflictDoNothing({
      target: [qaRunsTable.buildJobId, qaRunsTable.roundNumber],
    })
    .returning();

  if (created) {
    await db
      .update(buildJobsTable)
      .set({ status: "QA_PENDING", blockedReason: null, updatedAt: new Date() })
      .where(eq(buildJobsTable.id, job.id));
    await recordQaEvent({
      qaRunId: created.id,
      buildJobId: job.id,
      eventType: "QA_ROUND_CREATED",
      summary: `Independent QA round ${roundNumber} created.`,
      metadata: {
        round_number: roundNumber,
        qa_idempotency_key: created.qaIdempotencyKey,
      },
    });
    return created;
  }

  const [existing] = await db
    .select()
    .from(qaRunsTable)
    .where(
      and(
        eq(qaRunsTable.buildJobId, job.id),
        eq(qaRunsTable.roundNumber, roundNumber),
      ),
    );
  if (!existing)
    throw new Error(
      `Unable to create or recover QA round ${roundNumber} for build job ${job.id}`,
    );
  return existing;
}

async function latestQaRun(buildJobId: number) {
  const [run] = await db
    .select()
    .from(qaRunsTable)
    .where(eq(qaRunsTable.buildJobId, buildJobId))
    .orderBy(desc(qaRunsTable.roundNumber))
    .limit(1);
  return run ?? null;
}

async function ensureCurrentQaRun(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
) {
  const latest = await latestQaRun(job.id);
  if (!latest) return createNextQaRound(job, workspace, 1);
  if (latest.status === "RETEST_PENDING") {
    return createNextQaRound(job, workspace, latest.roundNumber + 1);
  }
  return latest;
}

async function blockForQaCapability(
  job: typeof buildJobsTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "CONNECT_QA_AGENT",
    title: "Connect an automation-ready QA runner",
    whyNeeded:
      "The build is ready for independent verification, but Money Scout has no QA backend it can invoke autonomously.",
    instructions:
      "Connect a supported or self-hosted QA runner. Prefer a zero-cash or existing-account backend. Configure credentials through the platform's secret/integration mechanism, not in this task.",
    blockedStage: `AUTONOMOUS_QA:${job.id}`,
    requiredCapabilityKey: "QA_AGENT_ACCESS",
    provider: "QA_AGENT",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { build_job_id: job.id, qa_run_id: run.id },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(qaRunsTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: "QA_AGENT_ACCESS_REQUIRED",
      lastErrorMessage: "No automation-ready QA adapter is configured.",
      updatedAt: new Date(),
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "QA_AGENT_ACCESS_REQUIRED",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function blockForRepairCapability(
  job: typeof buildJobsTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  provider: string | null,
) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "CONNECT_REPAIR_CAPABLE_BUILDER",
    title: "Connect builder repair capability",
    whyNeeded:
      "Independent QA found repairable defects, but the configured coding backend cannot accept structured repair jobs.",
    instructions:
      "Connect or update the coding-agent bridge so Money Scout can submit bounded repair jobs against the existing builder workspace. Do not publish or deploy anything as part of this action.",
    blockedStage: `AUTONOMOUS_QA_REPAIR:${job.id}`,
    requiredCapabilityKey: "BUILDER_REPAIR_ACCESS",
    provider: provider ?? "CODING_AGENT",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { build_job_id: job.id, qa_run_id: run.id },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(qaRunsTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: "BUILDER_REPAIR_ACCESS_REQUIRED",
      lastErrorMessage: "No repair-capable builder adapter is configured.",
      updatedAt: new Date(),
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "QA_REPAIR_CAPABILITY_REQUIRED",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function blockForSpend(
  job: typeof buildJobsTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  stage: "QA" | "REPAIR",
  provider: string,
) {
  const code =
    stage === "QA"
      ? "QA_SHARED_MONEY_SAFETY_RESERVATION_REQUIRED"
      : "QA_REPAIR_SHARED_MONEY_SAFETY_RESERVATION_REQUIRED";
  const detail = `${provider} ${stage.toLowerCase()} execution is fail-closed until a shared atomic per-run Money Safety reservation and enforceable provider maximum exist. Remaining budget and human request text are insufficient.`;
  await db
    .update(qaRunsTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: code,
      lastErrorMessage: detail,
      updatedAt: new Date(),
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({ status: "BLOCKED", blockedReason: code, updatedAt: new Date() })
    .where(eq(buildJobsTable.id, job.id));
}

async function blockForHumanDefectBoundary(
  job: typeof buildJobsTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
) {
  const defects = run.defects as PersistedQaDefect[];
  const headline = defects[0]?.summary ?? "QA reached a human-only boundary.";
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "RESOLVE_QA_HUMAN_BOUNDARY",
    title: "Resolve QA human-only boundary",
    whyNeeded: `Independent QA found a defect or dependency that automation is not authorized to resolve: ${headline}`,
    instructions:
      "Review the preserved defect bundle and provide only the missing authority, access, or decision. Do not redo the technical QA work Money Scout already completed.",
    blockedStage: `AUTONOMOUS_QA_HUMAN_BOUNDARY:${job.id}:round-${run.roundNumber}`,
    requiredCapabilityKey: null,
    provider: run.qaProvider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: defects.some((defect) => defect.severity === "CRITICAL")
      ? "CRITICAL"
      : "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { build_job_id: job.id, qa_run_id: run.id, defects },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(qaRunsTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: "QA_HUMAN_BOUNDARY",
      lastErrorMessage: headline.slice(0, 4_000),
      updatedAt: new Date(),
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "QA_HUMAN_BOUNDARY",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function blockForExhaustion(
  job: typeof buildJobsTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
) {
  const defects = run.defects as PersistedQaDefect[];
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "REVIEW_QA_REPAIR_EXHAUSTION",
    title: "Review build after autonomous repair exhaustion",
    whyNeeded: `Money Scout completed ${maxRepairRounds()} autonomous repair cycles and independent QA still finds material defects. Another blind repair cycle is not justified.`,
    instructions:
      "Review the concise remaining defect bundle and decide whether to authorize a different technical approach, increase resources, or kill the build. The prior QA and repair history is preserved.",
    blockedStage: `AUTONOMOUS_QA_EXHAUSTED:${job.id}`,
    requiredCapabilityKey: null,
    provider: run.qaProvider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "NORMAL",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { build_job_id: job.id, qa_run_id: run.id, defects },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(qaRunsTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: "QA_REPAIR_EXHAUSTED",
      lastErrorMessage:
        "Autonomous repair limit reached with unresolved defects.",
      updatedAt: new Date(),
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "QA_REPAIR_EXHAUSTED",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function finalizeQaPass(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  result: QaResult,
) {
  const now = new Date();
  await db
    .update(qaRunsTable)
    .set({
      status: "PASSED",
      qaProvider: result.providerRunId ? run.qaProvider : run.qaProvider,
      qaProviderRunId: result.providerRunId,
      acceptanceResults: result.acceptanceResults,
      defects: [],
      baselineChecksPassed: "true",
      resultMetadata: { ...result.metadata, qa_summary: result.summary },
      repositoryUrl: result.repositoryUrl ?? run.repositoryUrl,
      branchName: result.branchName ?? run.branchName,
      qaFinishedAt: now,
      lastErrorCode: null,
      lastErrorMessage: null,
      updatedAt: now,
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "COMPLETE",
      blockedReason: null,
      finishedAt: now,
      updatedAt: now,
    })
    .where(eq(buildJobsTable.id, job.id));
  await db
    .update(builderWorkspacesTable)
    .set({
      statusSummary:
        "Independent QA passed every required acceptance criterion. Ready for controlled deployment/launch.",
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await setOpportunityActivity(job.opportunityId, {
    activeEvaluationCycleId: job.evaluationCycleId,
    currentActivityKey: "BUILD_QA_PASSED",
    currentActivityLabel: "Build passed independent QA",
    activityStatus: "COMPLETE",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: "CONTROLLED DEPLOYMENT / LAUNCH",
    etaBasis: "NEXT_AUTONOMY_LAYER_PENDING",
    lifecycleTransition: true,
  });
  await recordQaEvent({
    qaRunId: run.id,
    buildJobId: job.id,
    eventType: "QA_PASSED",
    summary:
      "Independent QA passed baseline checks and every Build Contract acceptance criterion.",
    metadata: {
      round_number: run.roundNumber,
      provider_run_id: result.providerRunId,
    },
  });
  await recordLifecycleEvent({
    opportunityId: job.opportunityId,
    evaluationCycleId: job.evaluationCycleId,
    eventType: "BUILD_QA_PASSED",
    summary:
      "Build passed independent QA and is eligible for the controlled deployment layer.",
    metadata: {
      build_job_id: job.id,
      builder_workspace_id: workspace.id,
      qa_run_id: run.id,
      qa_round: run.roundNumber,
    },
  });
}

async function applyQaResult(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  result: QaResult,
) {
  await recordExternalCost(job.id, result.externalCostCents);
  const now = new Date();
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    await db
      .update(qaRunsTable)
      .set({
        status: "RUNNING",
        qaProviderRunId: result.providerRunId,
        repositoryUrl: result.repositoryUrl ?? run.repositoryUrl,
        branchName: result.branchName ?? run.branchName,
        resultMetadata: {
          ...result.metadata,
          progress_percent: result.progressPercent,
          qa_summary: result.summary,
        },
        updatedAt: now,
      })
      .where(eq(qaRunsTable.id, run.id));
    return;
  }

  if (result.state === "PASSED") {
    const defects = verificationDefects({
      criteria: run.acceptanceCriteria as string[],
      acceptanceResults: result.acceptanceResults,
      baselineChecksPassed: result.baselineChecksPassed,
      providerDefects: result.defects,
    });
    if (defects.length === 0) {
      await finalizeQaPass(job, workspace, run, result);
      return;
    }
    await db
      .update(qaRunsTable)
      .set({
        status: "DEFECTS_FOUND",
        qaProviderRunId: result.providerRunId,
        acceptanceResults: result.acceptanceResults,
        defects,
        baselineChecksPassed:
          result.baselineChecksPassed == null
            ? null
            : String(result.baselineChecksPassed),
        resultMetadata: {
          ...result.metadata,
          qa_summary: result.summary,
          provider_state: result.state,
        },
        qaFinishedAt: now,
        updatedAt: now,
      })
      .where(eq(qaRunsTable.id, run.id));
    await recordQaEvent({
      qaRunId: run.id,
      buildJobId: job.id,
      eventType: "QA_PASS_REJECTED_FOR_INCOMPLETE_EVIDENCE",
      summary:
        "QA provider reported PASS, but Money Scout rejected acceptance because baseline or criterion evidence was incomplete.",
      metadata: { defect_count: defects.length },
    });
    return;
  }

  const defects = resultDefects(result);
  await db
    .update(qaRunsTable)
    .set({
      status: "DEFECTS_FOUND",
      qaProviderRunId: result.providerRunId,
      acceptanceResults: result.acceptanceResults,
      defects,
      baselineChecksPassed:
        result.baselineChecksPassed == null
          ? null
          : String(result.baselineChecksPassed),
      resultMetadata: {
        ...result.metadata,
        qa_summary: result.summary,
        provider_state: result.state,
        requires_human_action: result.requiresHumanAction,
        human_action: result.humanAction,
      },
      qaFinishedAt: now,
      updatedAt: now,
    })
    .where(eq(qaRunsTable.id, run.id));
  await recordQaEvent({
    qaRunId: run.id,
    buildJobId: job.id,
    eventType: "QA_DEFECTS_FOUND",
    summary: `Independent QA found ${defects.length} defect${defects.length === 1 ? "" : "s"}.`,
    metadata: {
      round_number: run.roundNumber,
      provider_state: result.state,
      defects,
    },
  });
}

async function dispatchQa(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  adapter: QaAgentAdapter,
) {
  const now = new Date();
  await db
    .update(qaRunsTable)
    .set({
      status: "DISPATCHING",
      qaProvider: adapter.provider,
      qaCostMode: adapter.costMode,
      qaDispatchAttemptCount: run.qaDispatchAttemptCount + 1,
      updatedAt: now,
    })
    .where(eq(qaRunsTable.id, run.id));
  try {
    const result = await adapter.dispatch({
      qaRunId: run.id,
      buildJobId: job.id,
      opportunityId: job.opportunityId,
      roundNumber: run.roundNumber,
      idempotencyKey: run.qaIdempotencyKey,
      repositoryUrl: workspace.repositoryUrl!,
      branchName: workspace.branchName!,
      commitSha: run.commitSha,
      acceptanceCriteria: run.acceptanceCriteria as string[],
      contract: job.contract as PersistedBuildContract,
    });
    await applyQaResult(
      job,
      workspace,
      { ...run, qaProvider: adapter.provider },
      result,
    );
    await recordQaEvent({
      qaRunId: run.id,
      buildJobId: job.id,
      eventType: "QA_DISPATCHED",
      summary: "Independent QA contract dispatched.",
      metadata: {
        provider: adapter.provider,
        provider_run_id: result.providerRunId,
        round_number: run.roundNumber,
      },
    });
    await setOpportunityActivity(job.opportunityId, {
      activeEvaluationCycleId: job.evaluationCycleId,
      currentActivityKey: "BUILD_QA_RUNNING",
      currentActivityLabel: `Independent QA round ${run.roundNumber}`,
      activityStatus:
        result.state === "RUNNING" || result.state === "QUEUED"
          ? "RUNNING"
          : "WAITING",
      activityStartedAt: now,
      expectedDurationSeconds: 900,
      nextAction:
        "Verify Build Contract acceptance criteria and baseline technical checks.",
      etaBasis: "QA_WORKSPACE_ESTIMATE",
      lifecycleTransition: true,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown QA dispatch failure";
    await db
      .update(qaRunsTable)
      .set({
        status: "PENDING",
        lastErrorCode: "QA_DISPATCH_TRANSIENT",
        lastErrorMessage: message.slice(0, 4_000),
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    logger.warn(
      { err: error, buildJobId: job.id, qaRunId: run.id },
      "QA dispatch failed before a provider run was confirmed; retrying with the same idempotency key",
    );
  }
}

async function pollQa(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  adapter: QaAgentAdapter,
) {
  if (!run.qaProviderRunId) {
    await db
      .update(qaRunsTable)
      .set({
        status: "PENDING",
        lastErrorCode: "QA_PROVIDER_RUN_ID_MISSING",
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    return;
  }
  try {
    const result = await adapter.getStatus(run.qaProviderRunId);
    await applyQaResult(job, workspace, run, result);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown QA status failure";
    await db
      .update(qaRunsTable)
      .set({
        lastErrorCode: "QA_POLL_TRANSIENT",
        lastErrorMessage: message.slice(0, 4_000),
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    logger.warn(
      { err: error, buildJobId: job.id, qaRunId: run.id },
      "QA polling failed; durable provider run will be polled again",
    );
  }
}

async function finishRepair(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  result: BuilderStatusResult,
) {
  await recordExternalCost(job.id, result.externalCostCents);
  const now = new Date();
  if (
    result.terminalOutcome === "ARCHITECTURE_CHALLENGE" ||
    result.terminalOutcome === "PRODUCT_CONTRACT_CHALLENGE"
  ) {
    await db
      .update(qaRunsTable)
      .set({
        status: "CANCELLED",
        repairProviderRunId: result.providerRunId,
        lastErrorCode: result.terminalOutcome,
        lastErrorMessage: result.summary,
        repairFinishedAt: now,
        updatedAt: now,
      })
      .where(eq(qaRunsTable.id, run.id));
    await db
      .update(buildJobsTable)
      .set({
        status: "BLOCKED",
        blockedReason: result.terminalOutcome,
        updatedAt: now,
      })
      .where(eq(buildJobsTable.id, job.id));
    if (job.factoryRunId)
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: "CHALLENGED",
          blockerCode: result.terminalOutcome,
          nextAction:
            result.terminalOutcome === "ARCHITECTURE_CHALLENGE"
              ? "Route new technical evidence to Architecture Composer, not QA repair."
              : "Route contradiction evidence to Product Definition versioning; builder cannot rewrite scope.",
          updatedAt: now,
        })
        .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
    await recordQaEvent({
      qaRunId: run.id,
      buildJobId: job.id,
      eventType: result.terminalOutcome,
      summary: result.summary ?? result.terminalOutcome,
      metadata: {
        challenge: result.challenge,
        provider_run_id: result.providerRunId,
      },
    });
    return;
  }
  if (
    job.contract.schemaVersion === 2 &&
    result.state === "SUCCEEDED" &&
    (result.terminalOutcome !== "IMPLEMENTATION_READY" ||
      !result.resultCommitSha)
  ) {
    await db
      .update(qaRunsTable)
      .set({
        status: "REPAIR_PENDING",
        lastErrorCode: "REPAIR_RESULT_NOT_COMMIT_PINNED",
        lastErrorMessage:
          "Factory repair requires IMPLEMENTATION_READY and an exact commit SHA.",
        updatedAt: now,
      })
      .where(eq(qaRunsTable.id, run.id));
    return;
  }
  const failed = result.state === "FAILED" || result.state === "CANCELLED";
  const defects = failed
    ? [
        ...(run.defects as PersistedQaDefect[]),
        {
          key: "REPAIR_RUN_FAILED",
          category: "BUILD_FAILURE",
          severity: "HIGH" as const,
          summary: result.summary ?? `Repair run ended in ${result.state}.`,
          evidence: `Builder repair provider run ${result.providerRunId} ended in ${result.state}.`,
          repairGuidance:
            "Independent QA should re-diagnose the current workspace before another repair decision.",
          humanOnly: false,
        },
      ]
    : (run.defects as PersistedQaDefect[]);
  await db
    .update(qaRunsTable)
    .set({
      status: "RETEST_PENDING",
      repairProviderRunId: result.providerRunId,
      defects,
      repairFinishedAt: now,
      lastErrorCode: failed ? `REPAIR_${result.state}` : null,
      lastErrorMessage: failed ? result.summary : null,
      updatedAt: now,
    })
    .where(eq(qaRunsTable.id, run.id));
  await db
    .update(builderWorkspacesTable)
    .set({
      repositoryUrl: result.repositoryUrl ?? workspace.repositoryUrl,
      branchName: result.branchName ?? workspace.branchName,
      resultCommitSha: result.resultCommitSha ?? workspace.resultCommitSha,
      workspaceUrl: result.workspaceUrl ?? workspace.workspaceUrl,
      status: "QA_PENDING",
      statusSummary: failed
        ? "Repair run ended unsuccessfully; independent QA will re-diagnose the current workspace."
        : "Repair completed; independent QA retest is queued.",
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "QA_PENDING",
      resultCommitSha: result.resultCommitSha ?? job.resultCommitSha,
      blockedReason: null,
      updatedAt: now,
    })
    .where(eq(buildJobsTable.id, job.id));
  await recordQaEvent({
    qaRunId: run.id,
    buildJobId: job.id,
    eventType: failed
      ? "REPAIR_FAILED_RETEST_QUEUED"
      : "REPAIR_COMPLETED_RETEST_QUEUED",
    summary: failed
      ? "Repair run failed; current workspace will be independently re-diagnosed rather than blindly replayed."
      : "Repair completed; a fresh independent QA round will retest the build.",
    metadata: { provider_run_id: result.providerRunId, state: result.state },
  });
  await setOpportunityActivity(job.opportunityId, {
    activeEvaluationCycleId: job.evaluationCycleId,
    currentActivityKey: "BUILD_QA_RETEST_PENDING",
    currentActivityLabel: failed
      ? "Repair failed; QA re-diagnosis queued"
      : "Repair complete; QA retest queued",
    activityStatus: "WAITING",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: "RUN INDEPENDENT QA RETEST",
    etaBasis: "DURABLE_QA_LOOP",
    lifecycleTransition: true,
  });
}

async function dispatchRepair(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  adapter: BuilderAgentAdapter,
) {
  if (!adapter.repair)
    return blockForRepairCapability(job, run, adapter.provider);
  if (!workspace.providerRunId) {
    const defects = [
      ...(run.defects as PersistedQaDefect[]),
      {
        key: "BUILDER_RUN_REFERENCE_MISSING",
        category: "BUILD_FAILURE",
        severity: "HIGH" as const,
        summary:
          "The builder workspace has no provider run reference for a targeted repair.",
        evidence: `Builder workspace ${workspace.id} does not preserve provider_run_id.`,
        repairGuidance:
          "Restore the builder run reference or reconstruct the build in the same durable workspace before repair.",
        humanOnly: false,
      },
    ];
    await db
      .update(qaRunsTable)
      .set({ defects, status: "RETEST_PENDING", updatedAt: new Date() })
      .where(eq(qaRunsTable.id, run.id));
    return;
  }
  const key =
    run.repairIdempotencyKey ??
    repairIdempotencyKey(workspace.workspaceKey, run.roundNumber);
  const now = new Date();
  await db
    .update(qaRunsTable)
    .set({
      status: "REPAIRING",
      repairIdempotencyKey: key,
      repairAttemptCount: run.repairAttemptCount + 1,
      repairStartedAt: run.repairStartedAt ?? now,
      updatedAt: now,
    })
    .where(eq(qaRunsTable.id, run.id));
  try {
    const result = await adapter.repair({
      workspaceKey: workspace.workspaceKey,
      buildJobId: job.id,
      opportunityId: job.opportunityId,
      providerRunId: workspace.providerRunId,
      idempotencyKey: key,
      repositoryUrl: workspace.repositoryUrl,
      branchName: workspace.branchName,
      defects: run.defects as PersistedQaDefect[],
      acceptanceCriteria: run.acceptanceCriteria as string[],
      contract: job.contract as PersistedBuildContract,
    });
    await recordExternalCost(job.id, result.externalCostCents);
    await db
      .update(qaRunsTable)
      .set({ repairProviderRunId: result.providerRunId, updatedAt: new Date() })
      .where(eq(qaRunsTable.id, run.id));
    await recordQaEvent({
      qaRunId: run.id,
      buildJobId: job.id,
      eventType: "REPAIR_DISPATCHED",
      summary:
        "Structured QA defects dispatched to the builder for bounded repair.",
      metadata: {
        provider: adapter.provider,
        provider_run_id: result.providerRunId,
        defect_count: (run.defects as PersistedQaDefect[]).length,
      },
    });
    if (
      result.state === "SUCCEEDED" ||
      result.state === "FAILED" ||
      result.state === "CANCELLED"
    ) {
      await finishRepair(
        job,
        workspace,
        { ...run, repairProviderRunId: result.providerRunId },
        result,
      );
    } else {
      await setOpportunityActivity(job.opportunityId, {
        activeEvaluationCycleId: job.evaluationCycleId,
        currentActivityKey: "BUILD_REPAIR_RUNNING",
        currentActivityLabel: `Builder repairing QA round ${run.roundNumber} defects`,
        activityStatus: "RUNNING",
        activityStartedAt: now,
        expectedDurationSeconds: 1_200,
        nextAction:
          "Complete bounded repair, then automatically rerun independent QA.",
        etaBasis: "BUILDER_REPAIR_ESTIMATE",
        lifecycleTransition: true,
      });
    }
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Unknown repair dispatch failure";
    await db
      .update(qaRunsTable)
      .set({
        status: "REPAIR_PENDING",
        lastErrorCode: "REPAIR_DISPATCH_TRANSIENT",
        lastErrorMessage: message.slice(0, 4_000),
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    logger.warn(
      { err: error, buildJobId: job.id, qaRunId: run.id },
      "Repair dispatch failed before a provider run was confirmed; retrying with the same idempotency key",
    );
  }
}

async function pollRepair(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  adapter: BuilderAgentAdapter,
) {
  if (!run.repairProviderRunId) {
    await db
      .update(qaRunsTable)
      .set({
        status: "REPAIR_PENDING",
        lastErrorCode: "REPAIR_PROVIDER_RUN_ID_MISSING",
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    return;
  }
  try {
    const result = await adapter.getStatus(run.repairProviderRunId);
    if (
      result.state === "SUCCEEDED" ||
      result.state === "FAILED" ||
      result.state === "CANCELLED"
    ) {
      await finishRepair(job, workspace, run, result);
    } else {
      await db
        .update(qaRunsTable)
        .set({ updatedAt: new Date() })
        .where(eq(qaRunsTable.id, run.id));
    }
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown repair status failure";
    await db
      .update(qaRunsTable)
      .set({
        lastErrorCode: "REPAIR_POLL_TRANSIENT",
        lastErrorMessage: message.slice(0, 4_000),
        updatedAt: new Date(),
      })
      .where(eq(qaRunsTable.id, run.id));
    logger.warn(
      { err: error, buildJobId: job.id, qaRunId: run.id },
      "Repair polling failed; durable provider run will be polled again",
    );
  }
}

async function unblockConfiguredQa(adapter: QaAgentAdapter): Promise<void> {
  await setCapabilityAvailable({
    key: "QA_AGENT_ACCESS",
    provider: adapter.provider,
    accessLevel: "AUTOMATION_READY",
    verificationMethod: "QA_ADAPTER_CONFIGURED",
    metadata: { cost_mode: adapter.costMode },
  });
  await resolveOpenActionsForCapability({
    capabilityKey: "QA_AGENT_ACCESS",
    resolutionData: {
      detected_automatically: true,
      provider: adapter.provider,
    },
  });
  const blocked = await db
    .select()
    .from(buildJobsTable)
    .where(
      and(
        eq(buildJobsTable.status, "BLOCKED"),
        eq(buildJobsTable.blockedReason, "QA_AGENT_ACCESS_REQUIRED"),
      ),
    );
  for (const job of blocked) {
    await db
      .update(buildJobsTable)
      .set({ status: "QA_PENDING", blockedReason: null, updatedAt: new Date() })
      .where(eq(buildJobsTable.id, job.id));
    await db
      .update(qaRunsTable)
      .set({
        status: "PENDING",
        qaProvider: adapter.provider,
        qaCostMode: adapter.costMode,
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(qaRunsTable.buildJobId, job.id),
          eq(qaRunsTable.status, "HUMAN_BLOCKED"),
          eq(qaRunsTable.lastErrorCode, "QA_AGENT_ACCESS_REQUIRED"),
        ),
      );
  }
}

async function unblockRepairCapability(
  adapter: BuilderAgentAdapter,
): Promise<void> {
  if (!adapter.repair) return;
  await setCapabilityAvailable({
    key: "BUILDER_REPAIR_ACCESS",
    provider: adapter.provider,
    accessLevel: "AUTOMATION_READY",
    verificationMethod: "BUILDER_REPAIR_ADAPTER_CONFIGURED",
    metadata: { cost_mode: adapter.costMode },
  });
  await resolveOpenActionsForCapability({
    capabilityKey: "BUILDER_REPAIR_ACCESS",
    resolutionData: {
      detected_automatically: true,
      provider: adapter.provider,
    },
  });
  const blocked = await db
    .select()
    .from(buildJobsTable)
    .where(
      and(
        eq(buildJobsTable.status, "BLOCKED"),
        eq(buildJobsTable.blockedReason, "QA_REPAIR_CAPABILITY_REQUIRED"),
      ),
    );
  for (const job of blocked) {
    await db
      .update(buildJobsTable)
      .set({ status: "QA_PENDING", blockedReason: null, updatedAt: new Date() })
      .where(eq(buildJobsTable.id, job.id));
    await db
      .update(qaRunsTable)
      .set({
        status: "REPAIR_PENDING",
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(qaRunsTable.buildJobId, job.id),
          eq(qaRunsTable.status, "HUMAN_BLOCKED"),
          eq(qaRunsTable.lastErrorCode, "BUILDER_REPAIR_ACCESS_REQUIRED"),
        ),
      );
  }
}

async function processQaRun(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  run: typeof qaRunsTable.$inferSelect,
  qaAdapter: QaAgentAdapter | null,
  builderAdapter: BuilderAgentAdapter | null,
) {
  if (
    run.status === "PASSED" ||
    run.status === "HUMAN_BLOCKED" ||
    run.status === "CANCELLED"
  )
    return;

  if (run.status === "PENDING" || run.status === "DISPATCHING") {
    if (
      !workspace.repositoryUrl ||
      !workspace.branchName ||
      (job.contract.schemaVersion === 2 && !run.commitSha)
    ) {
      const defects = missingArtifactDefects(workspace);
      await db
        .update(qaRunsTable)
        .set({
          status: "DEFECTS_FOUND",
          defects,
          qaFinishedAt: new Date(),
          lastErrorCode: "BUILD_ARTIFACT_MISSING",
          lastErrorMessage: defects[0]?.summary,
          updatedAt: new Date(),
        })
        .where(eq(qaRunsTable.id, run.id));
      await recordQaEvent({
        qaRunId: run.id,
        buildJobId: job.id,
        eventType: "QA_PREREQUISITE_DEFECT",
        summary: defects[0]!.summary,
        metadata: { defects },
      });
      return;
    }
    if (!qaAdapter) return blockForQaCapability(job, run);
    if (qaAdapter.costMode === "METERED" || qaAdapter.costMode === "UNKNOWN")
      return blockForSpend(job, run, "QA", qaAdapter.provider);
    return dispatchQa(job, workspace, run, qaAdapter);
  }

  if (run.status === "RUNNING") {
    if (!qaAdapter || qaAdapter.provider !== run.qaProvider)
      return blockForQaCapability(job, run);
    return pollQa(job, workspace, run, qaAdapter);
  }

  if (run.status === "DEFECTS_FOUND" || run.status === "REPAIR_PENDING") {
    const defects = run.defects as PersistedQaDefect[];
    const metadata = run.resultMetadata as Record<string, unknown>;
    if (
      defects.some((defect) => defect.humanOnly) ||
      metadata.requires_human_action === true
    ) {
      return blockForHumanDefectBoundary(job, run);
    }
    if (run.roundNumber > maxRepairRounds())
      return blockForExhaustion(job, run);
    if (!builderAdapter?.repair)
      return blockForRepairCapability(
        job,
        run,
        builderAdapter?.provider ?? null,
      );
    if (
      builderAdapter.costMode === "METERED" ||
      builderAdapter.costMode === "UNKNOWN"
    )
      return blockForSpend(job, run, "REPAIR", builderAdapter.provider);
    return dispatchRepair(job, workspace, run, builderAdapter);
  }

  if (run.status === "REPAIRING") {
    if (!builderAdapter) return blockForRepairCapability(job, run, null);
    return pollRepair(job, workspace, run, builderAdapter);
  }
}

export async function runQaDebugTick(
  qaAdapterOverride?: QaAgentAdapter | null,
  builderAdapterOverride?: BuilderAgentAdapter | null,
): Promise<void> {
  const qaAdapter =
    qaAdapterOverride === undefined ? configuredQaAdapter() : qaAdapterOverride;
  const builderAdapter =
    builderAdapterOverride === undefined
      ? configuredBuilderAdapter()
      : builderAdapterOverride;
  const internalGateway =
    builderAdapterOverride === undefined
      ? createInProcessBuilderGatewayAdapter()
      : null;
  if (qaAdapter) await unblockConfiguredQa(qaAdapter);
  if (builderAdapter?.repair) await unblockRepairCapability(builderAdapter);
  const jobs = await db
    .select()
    .from(buildJobsTable)
    .where(inArray(buildJobsTable.status, ["QA_PENDING", "FAILED"]))
    .orderBy(asc(buildJobsTable.id))
    .limit(5);
  for (const job of jobs) {
    const [workspace] = await db
      .select()
      .from(builderWorkspacesTable)
      .where(eq(builderWorkspacesTable.buildJobId, job.id));
    if (!workspace) {
      const now = new Date();
      await db
        .update(buildJobsTable)
        .set({
          status: "FAILED",
          blockedReason: "QA_BUILDER_WORKSPACE_MISSING",
          updatedAt: now,
        })
        .where(eq(buildJobsTable.id, job.id));
      await recordLifecycleEvent({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        eventType: "QA_PREREQUISITE_FAILED",
        summary:
          "Build cannot enter QA because its durable builder workspace is missing.",
        metadata: { build_job_id: job.id },
      });
      await setOpportunityActivity(job.opportunityId, {
        activeEvaluationCycleId: job.evaluationCycleId,
        currentActivityKey: "QA_PREREQUISITE_FAILED",
        currentActivityLabel: "Build QA prerequisite failed",
        activityStatus: "BLOCKED",
        activityStartedAt: now,
        expectedDurationSeconds: null,
        nextAction:
          "Reconcile the missing durable builder workspace before QA can continue.",
        etaBasis: "INTERNAL_STATE_FAILURE",
        lifecycleTransition: true,
      });
      continue;
    }
    const run = await ensureCurrentQaRun(job, workspace);
    const effectiveBuilder =
      builderAdapter ??
      (job.contract.schemaVersion === 2 ? internalGateway : null);
    await processQaRun(job, workspace, run, qaAdapter, effectiveBuilder);
  }
}

export function startQaDebugWorker(): void {
  if (workerTimer) return;
  const tick = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runQaDebugTick();
    } catch (error) {
      logger.error({ err: error }, "Autonomous QA/debug worker tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void tick();
  workerTimer = setInterval(() => void tick(), intervalMs());
  workerTimer.unref?.();
}

export function stopQaDebugWorker(): void {
  if (workerTimer) clearInterval(workerTimer);
  workerTimer = null;
}
