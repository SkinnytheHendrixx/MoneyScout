import { and, asc, eq, inArray } from "drizzle-orm";
import {
  db,
  executionJobEventsTable,
  executionJobsTable,
} from "@workspace/db";
import { enqueueExecutionJob, executionIdempotencyKey } from "./execution-kernel";
import { logger } from "./logger";
import { orchestrateBuild } from "../routes/build-orchestrator";

const DEFAULT_INTERVAL_MS = 1_500;
const MIN_INTERVAL_MS = 1_000;
let timer: NodeJS.Timeout | null = null;
let running = false;

function intervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_BUILD_ORCHESTRATOR_MS ?? "");
  if (Number.isFinite(configured) && configured >= MIN_INTERVAL_MS) return configured;
  return DEFAULT_INTERVAL_MS;
}

const BET_WAIT_CODES = ["BUILD_ORCHESTRATOR_NOT_IMPLEMENTED", "APPROVED_BET_REQUIRED", "BET_NOT_ACTIVE", "BET_ENVELOPE_INVALID"] as const;
const stillEligibleJob = (jobId: number) => and(
  eq(executionJobsTable.id, jobId),
  eq(executionJobsTable.status, "WAITING"),
  inArray(executionJobsTable.lastErrorCode, [...BET_WAIT_CODES]),
);

async function markExecutionSucceeded(
  job: typeof executionJobsTable.$inferSelect,
  result: Record<string, unknown>,
): Promise<boolean> {
  const now = new Date();
  const [updated] = await db
    .update(executionJobsTable)
    .set({
      status: "SUCCEEDED",
      result,
      finishedAt: now,
      leaseExpiresAt: null,
      lastErrorClass: null,
      lastErrorCode: null,
      lastErrorMessage: null,
      updatedAt: now,
    })
    .where(stillEligibleJob(job.id))
    .returning({ id: executionJobsTable.id });
  if (!updated) return false;

  await db.insert(executionJobEventsTable).values({
    jobId: job.id,
    opportunityId: job.opportunityId,
    eventType: "JOB_SUCCEEDED",
    summary: "RUN_BUILD_ORCHESTRATOR created a durable build contract and handed it to the builder-workspace gate.",
    metadata: result,
  });
  return true;
}

async function processWaitingBuildOrchestratorJob(
  job: typeof executionJobsTable.$inferSelect,
): Promise<void> {
  const result = await orchestrateBuild(job.opportunityId);

  if (result.kind === "READY") {
    await markExecutionSucceeded(job, {
      status: "READY_FOR_BUILDER",
      build_job_id: result.buildJob.id,
      bet_id: result.bet.id,
      product_shape: result.contract.product.primaryShape,
      builder_profile: result.contract.product.builderProfile,
      minimum_sellable_outcome: result.contract.product.minimumSellableOutcome,
      external_spend_ceiling_usd: 0,
      next_action: "BUILDER_WORKSPACE",
      reused: result.reused,
    });
    return;
  }

  if (result.kind === "BET_REQUIRED" || result.kind === "BET_INACTIVE" || result.kind === "BET_ENVELOPE_INVALID") {
    const code = result.kind === "BET_REQUIRED" ? "APPROVED_BET_REQUIRED" : result.kind === "BET_INACTIVE" ? "BET_NOT_ACTIVE" : "BET_ENVELOPE_INVALID";
    const [updated] = await db.update(executionJobsTable).set({ lastErrorClass: "AUTHORIZATION_REQUIRED", lastErrorCode: code, lastErrorMessage: result.kind === "BET_REQUIRED" ? "A Build cannot begin until a separate Bet decision contract and resource allocation are explicitly approved." : result.kind === "BET_INACTIVE" ? "The selected Bet is not in an approved/active state." : "The Build Envelope exceeds the approved Bet allocation.", updatedAt: new Date() }).where(and(eq(executionJobsTable.id, job.id), eq(executionJobsTable.lastErrorCode, "BUILD_ORCHESTRATOR_NOT_IMPLEMENTED"))).returning({ id: executionJobsTable.id });
    if (updated) await db.insert(executionJobEventsTable).values({ jobId: job.id, opportunityId: job.opportunityId, eventType: "JOB_WAITING_FOR_BET", summary: "Build orchestration stopped safely until a valid approved Bet exists.", metadata: { blocker_code: code, external_cost_cents: 0, authority_granted: false } });
    return;
  }

  if (result.kind === "BLOCKED") {
    const now = new Date();
    const [updated] = await db
      .update(executionJobsTable)
      .set({
        status: "FAILED_TERMINAL",
        finishedAt: now,
        leaseExpiresAt: null,
        lastErrorClass: "STAGE_FAILURE",
        lastErrorCode: "BUILD_PLAN_NO_LONGER_READY",
        lastErrorMessage: result.contract.blockers.join(" ").slice(0, 4_000),
        updatedAt: now,
      })
      .where(stillEligibleJob(job.id))
      .returning({ id: executionJobsTable.id });
    if (!updated) return;

    await enqueueExecutionJob({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      parentJobId: job.id,
      action: "RECHECK_MONETIZATION_PLAN",
      payload: {},
      idempotencyKey: executionIdempotencyKey({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        action: "RECHECK_MONETIZATION_PLAN",
        discriminator: `build-readiness-drift-${job.id}`,
      }),
      priority: 85,
    });
    return;
  }

  const now = new Date();
  await db
    .update(executionJobsTable)
    .set({
      status: "FAILED_TERMINAL",
      finishedAt: now,
      leaseExpiresAt: null,
      lastErrorClass: "STAGE_FAILURE",
      lastErrorCode: "BUILD_OPPORTUNITY_NOT_FOUND",
      lastErrorMessage: "The opportunity no longer exists when the Build Orchestrator attempted to run.",
      updatedAt: now,
    })
    .where(stillEligibleJob(job.id));
}

export async function runBuildOrchestratorWorkerTick(): Promise<{ processedJobId: number | null }> {
  if (running) return { processedJobId: null };
  running = true;
  try {
    const [job] = await db
      .select()
      .from(executionJobsTable)
      .where(
        and(
          eq(executionJobsTable.action, "RUN_BUILD_ORCHESTRATOR"),
          eq(executionJobsTable.status, "WAITING"),
          inArray(executionJobsTable.lastErrorCode, [...BET_WAIT_CODES]),
        ),
      )
      .orderBy(asc(executionJobsTable.createdAt), asc(executionJobsTable.id))
      .limit(1);

    if (!job) return { processedJobId: null };
    await processWaitingBuildOrchestratorJob(job);
    return { processedJobId: job.id };
  } finally {
    running = false;
  }
}

export function startBuildOrchestratorWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  void runBuildOrchestratorWorkerTick().catch((error) => {
    logger.error({ err: error }, "Build Orchestrator initial tick failed");
  });
  timer = setInterval(() => {
    void runBuildOrchestratorWorkerTick().catch((error) => {
      logger.error({ err: error }, "Build Orchestrator worker tick failed");
    });
  }, intervalMs());
  timer.unref();
}

export function stopBuildOrchestratorWorkerForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  running = false;
}
