import { and, asc, eq, inArray } from "drizzle-orm";
import {
  buildJobsTable,
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
import { enqueueExecutionJob, executionIdempotencyKey } from "./execution-kernel";
import { createOrReuseHumanAction } from "./human-gates";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

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
  `build-${job.id}:opp-${job.opportunityId}:${job.idempotencyKey}`.slice(0, 500);

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
  const existing = await db
    .select()
    .from(builderWorkspacesTable)
    .where(eq(builderWorkspacesTable.buildJobId, job.id));
  if (existing[0]) return existing[0];

  const [created] = await db
    .insert(builderWorkspacesTable)
    .values({
      buildJobId: job.id,
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      workspaceKey: workspaceKeyFor(job),
      provider: adapter?.provider ?? "UNCONFIGURED",
      adapterKind: "GENERIC_HTTP",
      costMode: adapter?.costMode ?? "ZERO_CASH",
      status: "PROVISIONING",
      statusSummary: "Durable builder workspace created; checking builder capability.",
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
  if (!raced) throw new Error(`Unable to create builder workspace for build job ${job.id}`);
  return raced;
}

async function blockForBuilderCapability(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
) {
  const outcome = await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "CONNECT_BUILDER_AGENT",
    title: "Connect an automation-ready coding agent",
    whyNeeded: "This RevOpp is ready to build, but Money Scout has no configured coding-agent backend it can dispatch autonomously.",
    instructions: "Connect a supported/self-hosted coding-agent bridge for Money Scout. Prefer a zero-cash or existing-account backend. Do not paste raw credentials into this task; configure them through the platform's secret/integration mechanism, then confirm access is automation-ready.",
    blockedStage: `BUILDER_WORKSPACE:${job.id}`,
    requiredCapabilityKey: "BUILDER_AGENT_ACCESS",
    provider: "CODING_AGENT",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "RUN_BUILDER_WORKSPACE",
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
  return outcome;
}

async function blockForSpendAuthority(
  job: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "AUTHORIZE_BUILDER_SPEND",
    title: "Authorize coding-agent spend",
    whyNeeded: "The configured coding-agent backend is metered, while this Build Job currently authorizes $0 of external build spend.",
    instructions: "Approve a bounded build budget or connect a zero-cash coding backend. Money Scout will not treat BUILD status itself as spending authority.",
    blockedStage: `BUILDER_WORKSPACE_SPEND:${job.id}`,
    requiredCapabilityKey: null,
    provider: workspace.provider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "NORMAL",
    resumeAction: "RUN_BUILDER_WORKSPACE",
    resumePayload: { build_job_id: job.id },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(builderWorkspacesTable)
    .set({ status: "HUMAN_BLOCKED", statusSummary: "Waiting for bounded builder-spend authority.", updatedAt: new Date() })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({ status: "BLOCKED", blockedReason: "BUILDER_SPEND_AUTHORITY_REQUIRED", updatedAt: new Date() })
    .where(eq(buildJobsTable.id, job.id));
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
      statusSummary: "Dispatching minimum sellable product contract to coding agent.",
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));

  const result = await adapter.dispatch({
    workspaceKey: workspace.workspaceKey,
    buildJobId: job.id,
    opportunityId: job.opportunityId,
    builderProfile: job.builderProfile,
    productShape: job.productShape,
    idempotencyKey: workspace.workspaceKey,
    contract: job.contract as PersistedBuildContract,
  });
  const nextStatus = result.state === "SUCCEEDED" ? "QA_PENDING" : "RUNNING";
  await db
    .update(builderWorkspacesTable)
    .set({
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: nextStatus,
      providerRunId: result.providerRunId,
      repositoryUrl: result.repositoryUrl,
      branchName: result.branchName,
      workspaceUrl: result.workspaceUrl,
      progressPercent: result.progressPercent,
      statusSummary: result.summary ?? "Coding agent accepted the build contract.",
      dispatchedAt: now,
      lastPolledAt: now,
      ...(nextStatus === "QA_PENDING" ? { finishedAt: now } : {}),
      updatedAt: now,
    })
    .where(eq(builderWorkspacesTable.id, workspace.id));
  await db
    .update(buildJobsTable)
    .set({
      status: nextStatus === "QA_PENDING" ? "QA_PENDING" : "BUILDING",
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
      repository_url: result.repositoryUrl,
      branch_name: result.branchName,
      state: result.state,
    },
  });
  if (nextStatus === "QA_PENDING") await queueQaGate(job, workspace.id, result);
  else await setOpportunityActivity(job.opportunityId, {
    activeEvaluationCycleId: job.evaluationCycleId,
    currentActivityKey: "BUILDER_RUNNING",
    currentActivityLabel: "Coding agent is building the minimum sellable product",
    activityStatus: "RUNNING",
    activityStartedAt: now,
    expectedDurationSeconds: 1_800,
    nextAction: "Monitor builder progress, then automatically hand completed output into QA/debug.",
    etaBasis: "BUILDER_WORKSPACE_ESTIMATE",
    lifecycleTransition: true,
  });
}

async function queueQaGate(
  job: typeof buildJobsTable.$inferSelect,
  workspaceId: number,
  result: BuilderStatusResult,
) {
  const queued = await enqueueExecutionJob({
    opportunityId: job.opportunityId,
    evaluationCycleId: job.evaluationCycleId,
    action: "RUN_QA_DEBUG",
    payload: { build_job_id: job.id, builder_workspace_id: workspaceId },
    idempotencyKey: executionIdempotencyKey({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      action: "RUN_QA_DEBUG",
      discriminator: `build-${job.id}`,
    }),
    priority: 80,
  });
  await setOpportunityActivity(job.opportunityId, {
    activeEvaluationCycleId: job.evaluationCycleId,
    currentActivityKey: "BUILD_QA_PENDING",
    currentActivityLabel: "Builder finished; autonomous QA/debug is queued",
    activityStatus: "WAITING",
    activityStartedAt: new Date(),
    expectedDurationSeconds: null,
    nextAction: "RUN QA DEBUG",
    etaBasis: "DURABLE_EXECUTION_QUEUE",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: job.opportunityId,
    evaluationCycleId: job.evaluationCycleId,
    eventType: "BUILDER_OUTPUT_QA_QUEUED",
    summary: "Coding-agent output reached QA_PENDING and the next autonomous gate was durably queued.",
    metadata: {
      build_job_id: job.id,
      builder_workspace_id: workspaceId,
      provider_run_id: result.providerRunId,
      execution_job_id: queued.job.id,
    },
  });
}

async function pollWorkspace(
  workspace: typeof builderWorkspacesTable.$inferSelect,
  adapter: BuilderAgentAdapter,
) {
  if (!workspace.providerRunId) return;
  const [job] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, workspace.buildJobId));
  if (!job) return;
  const result = await adapter.getStatus(workspace.providerRunId);
  const now = new Date();

  if (result.state === "FAILED" || result.state === "CANCELLED") {
    await db.update(builderWorkspacesTable).set({
      status: result.state === "CANCELLED" ? "CANCELLED" : "FAILED",
      progressPercent: result.progressPercent,
      statusSummary: result.summary ?? `Coding-agent run ${result.state.toLowerCase()}.`,
      lastPolledAt: now,
      finishedAt: now,
      lastErrorCode: `BUILDER_${result.state}`,
      lastErrorMessage: result.summary,
      updatedAt: now,
    }).where(eq(builderWorkspacesTable.id, workspace.id));
    await db.update(buildJobsTable).set({ status: "FAILED", blockedReason: `BUILDER_${result.state}`, updatedAt: now })
      .where(eq(buildJobsTable.id, job.id));
    await queueQaGate(job, workspace.id, result);
    return;
  }

  if (result.state === "SUCCEEDED") {
    await db.update(builderWorkspacesTable).set({
      status: "QA_PENDING",
      repositoryUrl: result.repositoryUrl ?? workspace.repositoryUrl,
      branchName: result.branchName ?? workspace.branchName,
      workspaceUrl: result.workspaceUrl ?? workspace.workspaceUrl,
      progressPercent: 100,
      statusSummary: result.summary ?? "Coding-agent build completed; independent QA is required.",
      lastPolledAt: now,
      finishedAt: now,
      updatedAt: now,
    }).where(eq(builderWorkspacesTable.id, workspace.id));
    await db.update(buildJobsTable).set({ status: "QA_PENDING", blockedReason: null, updatedAt: now })
      .where(eq(buildJobsTable.id, job.id));
    await recordWorkspaceEvent({
      workspaceId: workspace.id,
      buildJobId: job.id,
      eventType: "BUILDER_COMPLETED",
      summary: "Coding-agent run completed; builder output is waiting for independent QA/debug.",
      metadata: { provider_run_id: result.providerRunId, repository_url: result.repositoryUrl },
    });
    await queueQaGate(job, workspace.id, result);
    return;
  }

  await db.update(builderWorkspacesTable).set({
    status: "RUNNING",
    repositoryUrl: result.repositoryUrl ?? workspace.repositoryUrl,
    branchName: result.branchName ?? workspace.branchName,
    workspaceUrl: result.workspaceUrl ?? workspace.workspaceUrl,
    progressPercent: result.progressPercent,
    statusSummary: result.summary ?? "Coding-agent run is still active.",
    lastPolledAt: now,
    updatedAt: now,
  }).where(eq(builderWorkspacesTable.id, workspace.id));
}

export async function resumeBuilderWorkspace(buildJobId: number): Promise<void> {
  const [job] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, buildJobId));
  if (!job) throw new Error(`Build job ${buildJobId} not found`);
  const [workspace] = await db.select().from(builderWorkspacesTable).where(eq(builderWorkspacesTable.buildJobId, buildJobId));
  if (workspace?.status === "HUMAN_BLOCKED") {
    await db.update(builderWorkspacesTable).set({ status: "READY", statusSummary: "Human bottleneck cleared; builder dispatch will resume.", updatedAt: new Date() })
      .where(eq(builderWorkspacesTable.id, workspace.id));
  }
  if (job.status === "BLOCKED") {
    await db.update(buildJobsTable).set({ status: "READY_FOR_BUILDER", blockedReason: null, updatedAt: new Date() })
      .where(eq(buildJobsTable.id, job.id));
  }
}

export async function runBuilderWorkspaceTick(adapterOverride?: BuilderAgentAdapter | null): Promise<void> {
  const adapter = adapterOverride === undefined ? configuredBuilderAdapter() : adapterOverride;
  const readyJobs = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.status, "READY_FOR_BUILDER"))
    .orderBy(asc(buildJobsTable.id))
    .limit(5);

  for (const job of readyJobs) {
    const workspace = await createOrReuseWorkspace(job, adapter);
    if (!adapter) {
      await blockForBuilderCapability(job, workspace);
      continue;
    }
    if (adapter.costMode === "METERED" && job.externalSpendCeilingCents <= job.externalSpendUsedCents) {
      await blockForSpendAuthority(job, workspace);
      continue;
    }
    if (!workspace.providerRunId && workspace.status !== "QA_PENDING") {
      try {
        await dispatchBuild(job, workspace, adapter);
      } catch (error) {
        const message = error instanceof Error ? error.message : "Unknown builder dispatch failure";
        await db.update(builderWorkspacesTable).set({
          status: "READY",
          lastErrorCode: "BUILDER_DISPATCH_TRANSIENT",
          lastErrorMessage: message.slice(0, 4_000),
          statusSummary: "Builder dispatch failed before a provider run was confirmed; idempotent retry remains safe.",
          updatedAt: new Date(),
        }).where(eq(builderWorkspacesTable.id, workspace.id));
        logger.warn({ err: error, buildJobId: job.id }, "Builder dispatch failed; will retry using workspace idempotency key");
      }
    }
  }

  if (!adapter) return;
  const running = await db
    .select()
    .from(builderWorkspacesTable)
    .where(and(
      inArray(builderWorkspacesTable.status, ["DISPATCHING", "RUNNING"]),
      eq(builderWorkspacesTable.provider, adapter.provider),
    ))
    .orderBy(asc(builderWorkspacesTable.id))
    .limit(10);
  for (const workspace of running) {
    try {
      await pollWorkspace(workspace, adapter);
    } catch (error) {
      logger.warn({ err: error, workspaceId: workspace.id }, "Builder status poll failed; provider run remains durable for later polling");
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
