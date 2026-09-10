import { and, asc, eq, inArray } from "drizzle-orm";
import {
  buildJobsTable,
  betsTable,
  assetFactoryRunsTable,
  assetRepositoriesTable,
  builderWorkspaceEventsTable,
  builderWorkspacesTable,
  db,
  type PersistedBuildContract,
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
import { betCanInitiateBuild } from "./bet-kernel";
import { createInProcessBuilderGatewayAdapter } from "./in-process-builder-gateway-adapter";

const DEFAULT_INTERVAL_MS = 3_000;
const MIN_INTERVAL_MS = 1_000;
let workerTimer: NodeJS.Timeout | null = null;
let tickRunning = false;

const intervalMs = (): number => {
  const configured = Number(process.env.MONEY_SCOUT_BUILDER_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_INTERVAL_MS
    ? configured
    : DEFAULT_INTERVAL_MS;
};

const workspaceKeyFor = (job: typeof buildJobsTable.$inferSelect): string =>
  `build-${job.id}:opp-${job.opportunityId}:${job.idempotencyKey}`.slice(
    0,
    500,
  );

async function recordWorkspaceEvent(input: {
  workspaceId: number;
  buildJobId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(builderWorkspaceEventsTable).values({
    workspaceId: input.workspaceId,
    buildJobId: input.buildJobId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function createOrReuseWorkspace(
  job: typeof buildJobsTable.$inferSelect,
  adapter: BuilderAgentAdapter | null,
) {
  const [existing] = await db
    .select()
    .from(builderWorkspacesTable)
    .where(eq(builderWorkspacesTable.buildJobId, job.id));
  if (existing) return existing;
  const [created] = await db
    .insert(builderWorkspacesTable)
    .values({
      buildJobId: job.id,
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      workspaceKey: workspaceKeyFor(job),
      provider: adapter?.provider ?? "UNCONFIGURED",
      adapterKind: "GENERIC_HTTP",
      costMode: adapter?.costMode ?? "UNKNOWN",
      status: "PROVISIONING",
      statusSummary:
        "Durable builder workspace created; checking builder capability.",
    })
    .onConflictDoNothing({ target: builderWorkspacesTable.buildJobId })
    .returning();
  if (created) {
    await db
      .update(buildJobsTable)
      .set({ builderWorkspaceId: String(created.id), updatedAt: new Date() })
      .where(eq(buildJobsTable.id, job.id));
    await recordWorkspaceEvent({
      workspaceId: created.id,
      buildJobId: job.id,
      eventType: "WORKSPACE_CREATED",
      summary: "Durable isolated builder workspace record created.",
      metadata: { workspace_key: created.workspaceKey },
    });
    return created;
  }
  const [raced] = await db
    .select()
    .from(builderWorkspacesTable)
    .where(eq(builderWorkspacesTable.buildJobId, job.id));
  if (!raced)
    throw new Error(
      `Unable to create builder workspace for build job ${job.id}`,
    );
  return raced;
}

async function blockForBuilderCapability(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "CONNECT_BUILDER_AGENT",
    title: "Connect an automation-ready coding agent",
    whyNeeded:
      "This RevOpp is ready to build, but Money Scout has no configured coding-agent backend it can dispatch autonomously.",
    instructions:
      "Connect a supported or self-hosted coding-agent bridge. Prefer a zero-cash or existing-account backend. Configure credentials through the platform's secret/integration mechanism, not in this task.",
    blockedStage: `BUILDER_WORKSPACE:${job.id}`,
    requiredCapabilityKey: "BUILDER_AGENT_ACCESS",
    provider: "CODING_AGENT",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { build_job_id: job.id },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(builderWorkspacesTable)
    .set({
      status: "HUMAN_BLOCKED",
      statusSummary: "Waiting for an automation-ready coding-agent connection.",
      updatedAt: new Date(),
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "BUILDER_AGENT_ACCESS_REQUIRED",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function blockForSpendAuthority(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
) {
  await db
    .update(builderWorkspacesTable)
    .set({
      status: "HUMAN_BLOCKED",
      statusSummary:
        "Real provider execution is fail-closed until a shared atomic per-run Money Safety reservation and enforceable provider maximum exist. Budget remaining and request-body attestation are insufficient.",
      updatedAt: new Date(),
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: "SHARED_MONEY_SAFETY_RESERVATION_REQUIRED",
      updatedAt: new Date(),
    })
    .where(eq(buildJobsTable.id, job.id));
}

async function betAllowsDispatch(
  job: typeof buildJobsTable.$inferSelect,
): Promise<{ allowed: boolean; reason: string | null }> {
  if (job.betId == null) return { allowed: true, reason: null }; // Legacy pre-#76 Build.
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, job.betId));
  if (!bet || !betCanInitiateBuild(bet.status))
    return { allowed: false, reason: "BET_NOT_ACTIVE" };
  if (
    job.externalSpendCeilingCents >
    bet.buildEnvelope.maximumExternalBuildSpendCents
  )
    return { allowed: false, reason: "BET_BUILD_ENVELOPE_EXCEEDED" };
  if (
    job.externalSpendUsedCents >
    bet.buildEnvelope.maximumExternalBuildSpendCents
  )
    return { allowed: false, reason: "BET_BUILD_ENVELOPE_EXCEEDED" };
  return { allowed: true, reason: null };
}

async function blockForBet(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  reason: string,
) {
  await db
    .update(builderWorkspacesTable)
    .set({
      status: "READY",
      statusSummary:
        "Build dispatch stopped at its Bet resource/state boundary.",
      updatedAt: new Date(),
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({ status: "BLOCKED", blockedReason: reason, updatedAt: new Date() })
    .where(eq(buildJobsTable.id, job.id));
}

async function markQaPending(
  job: typeof buildJobsTable.$inferSelect,
  workspaceId: number,
  result: BuilderStatusResult,
  failed = false,
) {
  const now = new Date();
  await setOpportunityActivity(job.opportunityId, {
    activeEvaluationCycleId: job.evaluationCycleId,
    currentActivityKey: failed ? "BUILD_DEBUG_PENDING" : "BUILD_QA_PENDING",
    currentActivityLabel: failed
      ? "Builder stopped with a defect; autonomous debug/QA is the next gate"
      : "Builder finished; autonomous QA/debug is the next gate",
    activityStatus: "WAITING",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: "RUN QA DEBUG",
    etaBasis: "INTERNAL_CAPABILITY_NEXT_TASK",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: job.opportunityId,
    evaluationCycleId: job.evaluationCycleId,
    eventType: failed
      ? "BUILDER_FAILURE_DEBUG_PENDING"
      : "BUILDER_OUTPUT_QA_PENDING",
    summary: failed
      ? "Coding-agent run ended unsuccessfully; builder state is preserved for the autonomous debug/QA layer."
      : "Coding-agent output reached QA_PENDING; independent QA/debug is the next autonomous layer.",
    metadata: {
      build_job_id: job.id,
      builder_workspace_id: workspaceId,
      provider_run_id: result.providerRunId,
      builder_state: result.state,
    },
  });
}

async function dispatchBuild(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
  adapter: BuilderAgentAdapter,
) {
  const now = new Date();
  await db
    .update(builderWorkspacesTable)
    .set({
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: "DISPATCHING",
      dispatchAttemptCount: workspace.dispatchAttemptCount + 1,
      statusSummary:
        "Dispatching minimum sellable product contract to coding agent.",
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  const [repository] = job.assetRepositoryId
    ? await db
        .select()
        .from(assetRepositoriesTable)
        .where(eq(assetRepositoriesTable.id, job.assetRepositoryId))
    : [];
  const result = await adapter.dispatch({
    workspaceKey: workspace.workspaceKey,
    buildJobId: job.id,
    opportunityId: job.opportunityId,
    builderProfile: job.builderProfile,
    productShape: job.productShape,
    idempotencyKey: workspace.workspaceKey,
    contract: job.contract as PersistedBuildContract,
    repositoryUrl: repository?.repositoryUrl ?? undefined,
    branchName: workspace.branchName ?? undefined,
    baseCommitSha: repository?.baseCommitSha,
    frozenManifestFiles: repository?.manifestFiles,
  });
  const completed =
    result.state === "SUCCEEDED" &&
    (job.contract.schemaVersion === 1 ||
      (result.terminalOutcome === "IMPLEMENTATION_READY" &&
        Boolean(result.resultCommitSha)));
  await db
    .update(builderWorkspacesTable)
    .set({
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: completed ? "QA_PENDING" : "RUNNING",
      providerRunId: result.providerRunId,
      gatewayRunId: result.gatewayRunId,
      resultCommitSha: result.resultCommitSha,
      repositoryUrl: result.repositoryUrl ?? repository?.repositoryUrl ?? null,
      branchName: result.branchName,
      workspaceUrl: result.workspaceUrl,
      progressPercent: result.progressPercent,
      statusSummary:
        result.summary ?? "Coding agent accepted the build contract.",
      dispatchedAt: now,
      lastPolledAt: now,
      ...(completed ? { finishedAt: now } : {}),
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({
      status: completed ? "QA_PENDING" : "BUILDING",
      blockedReason: null,
      updatedAt: now,
    })
    .where(eq(buildJobsTable.id, job.id));
  await recordWorkspaceEvent({
    workspaceId: workspace.id,
    buildJobId: job.id,
    eventType: "BUILDER_DISPATCHED",
    summary: "Build Contract dispatched to coding-agent backend.",
    metadata: {
      provider: adapter.provider,
      provider_run_id: result.providerRunId,
      gateway_run_id: result.gatewayRunId,
      repository_url: result.repositoryUrl ?? repository?.repositoryUrl,
      branch_name: result.branchName,
      state: result.state,
      terminal_outcome: result.terminalOutcome,
      result_commit_sha: result.resultCommitSha,
    },
  });
  if (completed) await markQaPending(job, workspace.id, result);
  else
    await setOpportunityActivity(job.opportunityId, {
      activeEvaluationCycleId: job.evaluationCycleId,
      currentActivityKey: "BUILDER_RUNNING",
      currentActivityLabel:
        "Coding agent is building the minimum sellable product",
      activityStatus: "RUNNING",
      activityStartedAt: now,
      expectedDurationSeconds: 1_800,
      nextAction:
        "Monitor builder progress, then hand completed output into autonomous QA/debug.",
      etaBasis: "BUILDER_WORKSPACE_ESTIMATE",
      lifecycleTransition: true,
    });
}

async function pollWorkspace(
  workspace: typeof builderWorkspacesTable.$inferSelect,
  adapter: BuilderAgentAdapter,
) {
  if (!workspace.providerRunId) return;
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, workspace.buildJobId));
  if (!job) return;
  const result = await adapter.getStatus(workspace.providerRunId);
  const now = new Date();
  if (
    result.terminalOutcome === "ARCHITECTURE_CHALLENGE" ||
    result.terminalOutcome === "PRODUCT_CONTRACT_CHALLENGE"
  ) {
    const blocker = result.terminalOutcome;
    await db
      .update(builderWorkspacesTable)
      .set({
        status: "FAILED",
        progressPercent: result.progressPercent,
        statusSummary: result.summary ?? blocker,
        lastPolledAt: now,
        finishedAt: now,
        lastErrorCode: blocker,
        lastErrorMessage: result.summary,
        updatedAt: now,
      })
      .where(eq(builderWorkspacesTable.id, workspace.id));
    await db
      .update(buildJobsTable)
      .set({ status: "BLOCKED", blockedReason: blocker, updatedAt: now })
      .where(eq(buildJobsTable.id, job.id));
    if (job.factoryRunId)
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: "CHALLENGED",
          blockerCode: blocker,
          nextAction:
            blocker === "ARCHITECTURE_CHALLENGE"
              ? "Route structured evidence to Architecture Composer; this is not a QA repair."
              : "Route contradiction evidence to Product Definition versioning; builder cannot change scope.",
          updatedAt: now,
        })
        .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
    await recordWorkspaceEvent({
      workspaceId: workspace.id,
      buildJobId: job.id,
      eventType: blocker,
      summary: result.summary ?? blocker,
      metadata: {
        challenge: result.challenge,
        provider_run_id: result.providerRunId,
      },
    });
    return;
  }
  if (result.state === "FAILED" || result.state === "CANCELLED") {
    if (job.contract.schemaVersion === 2) {
      const dependencyBlocked =
        result.terminalOutcome === "DEPENDENCY_BLOCKED" ||
        result.terminalOutcome === "RESOURCE_BLOCKED";
      const workspaceStatus = dependencyBlocked
        ? "HUMAN_BLOCKED"
        : result.state === "CANCELLED"
          ? "CANCELLED"
          : "FAILED";
      const blocker = result.terminalOutcome ?? `BUILDER_${result.state}`;
      await db
        .update(builderWorkspacesTable)
        .set({
          status: workspaceStatus,
          gatewayRunId: result.gatewayRunId ?? workspace.gatewayRunId,
          progressPercent: result.progressPercent,
          statusSummary: result.summary ?? blocker,
          lastPolledAt: now,
          finishedAt: now,
          lastErrorCode: blocker,
          lastErrorMessage: result.summary,
          updatedAt: now,
        })
        .where(eq(builderWorkspacesTable.id, workspace.id));
      await db
        .update(buildJobsTable)
        .set({
          status: dependencyBlocked
            ? "BLOCKED"
            : result.state === "CANCELLED"
              ? "CANCELLED"
              : "FAILED",
          blockedReason: blocker,
          updatedAt: now,
        })
        .where(eq(buildJobsTable.id, job.id));
      if (job.factoryRunId)
        await db
          .update(assetFactoryRunsTable)
          .set({
            status: dependencyBlocked
              ? "BUILDER_BLOCKED"
              : result.state === "CANCELLED"
                ? "CANCELLED"
                : "FAILED",
            blockerCode: blocker,
            nextAction: dependencyBlocked
              ? "Satisfy the precise Gateway capability/financial safety requirement; no provider side effect was attempted."
              : "Review the normalized Builder Gateway terminal result; do not send it to QA as an implementation defect.",
            finishedAt: dependencyBlocked ? null : now,
            updatedAt: now,
          })
          .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
      return;
    }
    await db
      .update(builderWorkspacesTable)
      .set({
        status: result.state === "CANCELLED" ? "CANCELLED" : "FAILED",
        progressPercent: result.progressPercent,
        statusSummary:
          result.summary ?? `Coding-agent run ${result.state.toLowerCase()}.`,
        lastPolledAt: now,
        finishedAt: now,
        lastErrorCode: `BUILDER_${result.state}`,
        lastErrorMessage: result.summary,
        updatedAt: now,
      })
      .where(eq(builderWorkspacesTable.id, workspace.id));
    await db
      .update(buildJobsTable)
      .set({
        status: "FAILED",
        blockedReason: `BUILDER_${result.state}`,
        updatedAt: now,
      })
      .where(eq(buildJobsTable.id, job.id));
    await markQaPending(job, workspace.id, result, true);
    return;
  }
  if (result.state === "SUCCEEDED") {
    if (
      job.contract.schemaVersion === 2 &&
      (result.terminalOutcome !== "IMPLEMENTATION_READY" ||
        !result.resultCommitSha)
    ) {
      await db
        .update(builderWorkspacesTable)
        .set({
          status: "FAILED",
          lastErrorCode: "BUILDER_RESULT_NOT_COMMIT_PINNED",
          lastErrorMessage:
            "Factory Builds require IMPLEMENTATION_READY plus an exact commit SHA.",
          finishedAt: now,
          updatedAt: now,
        })
        .where(eq(builderWorkspacesTable.id, workspace.id));
      await db
        .update(buildJobsTable)
        .set({
          status: "FAILED",
          blockedReason: "BUILDER_RESULT_NOT_COMMIT_PINNED",
          updatedAt: now,
        })
        .where(eq(buildJobsTable.id, job.id));
      return;
    }
    await db
      .update(builderWorkspacesTable)
      .set({
        status: "QA_PENDING",
        gatewayRunId: result.gatewayRunId ?? workspace.gatewayRunId,
        resultCommitSha: result.resultCommitSha ?? workspace.resultCommitSha,
        repositoryUrl: result.repositoryUrl ?? workspace.repositoryUrl,
        branchName: result.branchName ?? workspace.branchName,
        workspaceUrl: result.workspaceUrl ?? workspace.workspaceUrl,
        progressPercent: 100,
        statusSummary:
          result.summary ??
          "Builder claims IMPLEMENTATION_READY; independent QA is required.",
        lastPolledAt: now,
        finishedAt: now,
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
    await recordWorkspaceEvent({
      workspaceId: workspace.id,
      buildJobId: job.id,
      eventType: "BUILDER_IMPLEMENTATION_READY",
      summary:
        "Builder made an IMPLEMENTATION_READY claim for an exact commit; independent QA remains authoritative.",
      metadata: {
        provider_run_id: result.providerRunId,
        gateway_run_id: result.gatewayRunId,
        repository_url: result.repositoryUrl,
        branch_name: result.branchName,
        result_commit_sha: result.resultCommitSha,
      },
    });
    await markQaPending(job, workspace.id, result);
    return;
  }
  await db
    .update(builderWorkspacesTable)
    .set({
      status: "RUNNING",
      repositoryUrl: result.repositoryUrl ?? workspace.repositoryUrl,
      branchName: result.branchName ?? workspace.branchName,
      workspaceUrl: result.workspaceUrl ?? workspace.workspaceUrl,
      progressPercent: result.progressPercent,
      statusSummary: result.summary ?? "Coding-agent run is still active.",
      lastPolledAt: now,
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
}

async function unblockConfiguredBuilder(
  adapter: BuilderAgentAdapter,
): Promise<void> {
  await setCapabilityAvailable({
    key: "BUILDER_AGENT_ACCESS",
    provider: adapter.provider,
    accessLevel: "AUTOMATION_READY",
    verificationMethod: "BUILDER_ADAPTER_CONFIGURED",
    metadata: { cost_mode: adapter.costMode },
  });
  await resolveOpenActionsForCapability({
    capabilityKey: "BUILDER_AGENT_ACCESS",
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
        eq(buildJobsTable.blockedReason, "BUILDER_AGENT_ACCESS_REQUIRED"),
      ),
    );
  for (const job of blocked) {
    const [workspace] = await db
      .select()
      .from(builderWorkspacesTable)
      .where(eq(builderWorkspacesTable.buildJobId, job.id));
    if (workspace)
      await db
        .update(builderWorkspacesTable)
        .set({
          provider: adapter.provider,
          costMode: adapter.costMode,
          status: "READY",
          statusSummary:
            "Builder capability detected; dispatch is eligible to resume.",
          updatedAt: new Date(),
        })
        .where(eq(builderWorkspacesTable.id, workspace.id));
    await db
      .update(buildJobsTable)
      .set({
        status: "READY_FOR_BUILDER",
        blockedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(buildJobsTable.id, job.id));
  }

  // A Build blocked at a metered/unknown provider boundary may take a
  // separately configured, contractually zero-cash path without acquiring
  // spend authority. This does not resume the blocked paid Gateway run; it
  // only makes the Build eligible for the verified zero-cash adapter.
  if (adapter.costMode !== "ZERO_CASH") return;
  const financiallyBlocked = await db
    .select()
    .from(buildJobsTable)
    .where(
      and(
        eq(buildJobsTable.status, "BLOCKED"),
        inArray(buildJobsTable.blockedReason, [
          "PROVIDER_RUN_MAXIMUM_COST_NOT_ENFORCEABLE",
          "SHARED_MONEY_SAFETY_RESERVATION_REQUIRED",
          "ENTITLEMENT_PAYG_FALLBACK_NOT_FAIL_CLOSED",
          "ENTITLEMENT_ENFORCEMENT_UNVERIFIED",
          "BUILDER_PROVIDER_FINANCIAL_SAFETY_BLOCKED",
        ]),
      ),
    );
  for (const job of financiallyBlocked) {
    const gate = await betAllowsDispatch(job);
    if (!gate.allowed) continue;
    await db
      .update(buildJobsTable)
      .set({
        status: "READY_FOR_BUILDER",
        blockedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(buildJobsTable.id, job.id));
  }
}

async function unblockEligibleBets(): Promise<void> {
  const blocked = await db
    .select()
    .from(buildJobsTable)
    .where(
      and(
        eq(buildJobsTable.status, "BLOCKED"),
        inArray(buildJobsTable.blockedReason, [
          "BET_NOT_ACTIVE",
          "BET_BUILD_ENVELOPE_EXCEEDED",
        ]),
      ),
    );
  for (const job of blocked) {
    const gate = await betAllowsDispatch(job);
    if (!gate.allowed) continue;
    await db
      .update(buildJobsTable)
      .set({
        status: "READY_FOR_BUILDER",
        blockedReason: null,
        updatedAt: new Date(),
      })
      .where(eq(buildJobsTable.id, job.id));
  }
}

export async function runBuilderWorkspaceTick(
  adapterOverride?: BuilderAgentAdapter | null,
): Promise<void> {
  const configuredAdapter =
    adapterOverride === undefined
      ? configuredBuilderAdapter()
      : adapterOverride;
  const internalGateway =
    adapterOverride === undefined
      ? createInProcessBuilderGatewayAdapter()
      : null;
  if (configuredAdapter) {
    await unblockConfiguredBuilder(configuredAdapter);
  }
  await unblockEligibleBets();
  const readyJobs = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.status, "READY_FOR_BUILDER"))
    .orderBy(asc(buildJobsTable.id))
    .limit(5);
  for (const job of readyJobs) {
    const adapter =
      configuredAdapter ??
      (job.contract.schemaVersion === 2 ? internalGateway : null);
    const workspace = await createOrReuseWorkspace(job, adapter);
    const betGate = await betAllowsDispatch(job);
    if (!betGate.allowed) {
      await blockForBet(job, workspace, betGate.reason ?? "BET_NOT_ACTIVE");
      continue;
    }
    if (!adapter) {
      await blockForBuilderCapability(job, workspace);
      continue;
    }
    if (adapter.costMode === "METERED" || adapter.costMode === "UNKNOWN") {
      await blockForSpendAuthority(job, workspace);
      continue;
    }
    if (!workspace.providerRunId && workspace.status !== "QA_PENDING") {
      try {
        await dispatchBuild(job, workspace, adapter);
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unknown builder dispatch failure";
        await db
          .update(builderWorkspacesTable)
          .set({
            status: "READY",
            lastErrorCode: "BUILDER_DISPATCH_TRANSIENT",
            lastErrorMessage: message.slice(0, 4_000),
            statusSummary:
              "Dispatch failed before a provider run was confirmed; the workspace idempotency key makes retry safe.",
            updatedAt: new Date(),
          })
          .where(eq(builderWorkspacesTable.id, workspace.id));
        logger.warn(
          { err: error, buildJobId: job.id },
          "Builder dispatch failed; will retry with the same idempotency key",
        );
      }
    }
  }
  const running = await db
    .select()
    .from(builderWorkspacesTable)
    .where(inArray(builderWorkspacesTable.status, ["DISPATCHING", "RUNNING"]))
    .orderBy(asc(builderWorkspacesTable.id))
    .limit(10);
  for (const workspace of running) {
    const adapter =
      workspace.provider === internalGateway?.provider
        ? internalGateway
        : configuredAdapter?.provider === workspace.provider
          ? configuredAdapter
          : null;
    if (!adapter) continue;
    try {
      const [job] = await db
        .select()
        .from(buildJobsTable)
        .where(eq(buildJobsTable.id, workspace.buildJobId));
      if (job) {
        const gate = await betAllowsDispatch(job);
        if (!gate.allowed && workspace.providerRunId && adapter.cancel) {
          await adapter.cancel(
            workspace.providerRunId,
            `Build cancelled because ${gate.reason ?? "Bet became inactive"}.`,
          );
        }
      }
      await pollWorkspace(workspace, adapter);
    } catch (error) {
      logger.warn(
        { err: error, workspaceId: workspace.id },
        "Builder status poll failed; durable provider run will be polled again",
      );
    }
  }
}

export function startBuilderWorkspaceWorker(): void {
  if (workerTimer) return;
  const run = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runBuilderWorkspaceTick();
    } catch (error) {
      logger.error({ err: error }, "Builder workspace worker tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void run();
  workerTimer = setInterval(() => void run(), intervalMs());
  workerTimer.unref?.();
}
