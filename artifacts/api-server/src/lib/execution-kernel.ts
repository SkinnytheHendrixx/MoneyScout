import {
  and,
  asc,
  desc,
  eq,
  inArray,
  isNotNull,
  lte,
} from "drizzle-orm";
import {
  db,
  executionJobEventsTable,
  executionJobsTable,
  humanActionsTable,
  opportunitiesTable,
} from "@workspace/db";
import { createOrReuseHumanAction } from "./human-gates";
import { internalAutomationHeaders } from "./internal-automation-auth";
import { getActiveEvaluationCycle, recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

export type ExecutionAction =
  | "RUN_RESEARCH"
  | "RUN_VALIDATION"
  | "RUN_RESOLUTION"
  | "PLAN_EXPERIMENT"
  | "EXECUTE_EXPERIMENT"
  | "RECHECK_MONETIZATION_PLAN"
  | "RUN_BUILD_ORCHESTRATOR"
  | "RECONCILE_OPPORTUNITY";

export type ExecutionJobStatus =
  | "QUEUED"
  | "RUNNING"
  | "WAITING"
  | "HUMAN_BLOCKED"
  | "WATCHING"
  | "SUCCEEDED"
  | "FAILED_TERMINAL"
  | "CANCELLED";

export type ExecutionFailureClass =
  | "TRANSIENT_INFRASTRUCTURE"
  | "PROVIDER_NOT_READY"
  | "ALREADY_RUNNING"
  | "AUTHORIZATION_REQUIRED"
  | "STAGE_FAILURE"
  | "INTERRUPTED_UNKNOWN_OUTCOME"
  | "INTERNAL_CAPABILITY_MISSING"
  | "UNSUPPORTED_ACTION"
  | "UNKNOWN";

export type EnqueueExecutionJobInput = {
  opportunityId: number;
  evaluationCycleId?: number | null;
  parentJobId?: number | null;
  action: ExecutionAction;
  payload?: Record<string, unknown>;
  idempotencyKey: string;
  priority?: number;
  availableAt?: Date;
};

export type FailureDecision = {
  failureClass: ExecutionFailureClass;
  safeAutomaticRetry: boolean;
  retryDelayMs: number | null;
  errorCode: string | null;
};

const KERNEL_DEFAULT_INTERVAL_MS = 2_000;
const KERNEL_MIN_INTERVAL_MS = 1_000;
const JOB_LEASE_MS = 10 * 60_000;
const PROVIDER_RETRY_MS = 5 * 60_000;
const ALREADY_RUNNING_RETRY_MS = 30_000;
const TRANSIENT_RETRY_MS = 60_000;
const MAX_SAFE_AUTOMATIC_ATTEMPTS = 4;
const TERMINAL_STATUSES: ExecutionJobStatus[] = ["SUCCEEDED", "FAILED_TERMINAL", "CANCELLED"];
const ZERO_COST_RETRY_ACTIONS = new Set<ExecutionAction>([
  "PLAN_EXPERIMENT",
  "EXECUTE_EXPERIMENT",
  "RECHECK_MONETIZATION_PLAN",
  "RECONCILE_OPPORTUNITY",
]);

let kernelTimer: NodeJS.Timeout | null = null;
let kernelTickRunning = false;

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const cleanText = (value: unknown, max = 2_000): string | null =>
  typeof value === "string" && value.trim() ? value.trim().slice(0, max) : null;

const resolvedIntervalMs = (): number => {
  const configured = Number(process.env.MONEY_SCOUT_EXECUTION_KERNEL_MS ?? "");
  if (Number.isFinite(configured) && configured >= KERNEL_MIN_INTERVAL_MS) return configured;
  return KERNEL_DEFAULT_INTERVAL_MS;
};

const apiBaseUrl = (port: number): string => `http://127.0.0.1:${port}/api`;

export function executionIdempotencyKey(input: {
  opportunityId: number;
  evaluationCycleId?: number | null;
  action: ExecutionAction;
  discriminator: string;
}): string {
  const cycle = input.evaluationCycleId == null ? "no-cycle" : `cycle-${input.evaluationCycleId}`;
  return `opp-${input.opportunityId}:${cycle}:${input.action}:${input.discriminator}`.slice(0, 500);
}

async function recordJobEvent(input: {
  jobId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(executionJobEventsTable).values({
    jobId: input.jobId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

export async function enqueueExecutionJob(input: EnqueueExecutionJobInput) {
  const cycle = input.evaluationCycleId === undefined
    ? await getActiveEvaluationCycle(input.opportunityId)
    : null;
  const evaluationCycleId = input.evaluationCycleId === undefined
    ? cycle?.id ?? null
    : input.evaluationCycleId;
  const now = new Date();
  const [created] = await db
    .insert(executionJobsTable)
    .values({
      opportunityId: input.opportunityId,
      evaluationCycleId,
      parentJobId: input.parentJobId ?? null,
      action: input.action,
      payload: input.payload ?? {},
      status: "QUEUED",
      priority: Math.max(0, Math.min(100, input.priority ?? 50)),
      idempotencyKey: input.idempotencyKey,
      availableAt: input.availableAt ?? now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: executionJobsTable.idempotencyKey })
    .returning();

  if (created) {
    await recordJobEvent({
      jobId: created.id,
      opportunityId: created.opportunityId,
      eventType: "JOB_ENQUEUED",
      summary: `${created.action} queued for autonomous execution.`,
      metadata: { idempotency_key: created.idempotencyKey, evaluation_cycle_id: created.evaluationCycleId },
    });
    await recordLifecycleEvent({
      opportunityId: created.opportunityId,
      evaluationCycleId: created.evaluationCycleId,
      eventType: "EXECUTION_JOB_ENQUEUED",
      summary: `${created.action} queued.`,
      metadata: { execution_job_id: created.id, action: created.action },
    });
    return { job: created, reused: false } as const;
  }

  const [existing] = await db
    .select()
    .from(executionJobsTable)
    .where(eq(executionJobsTable.idempotencyKey, input.idempotencyKey));
  if (!existing) throw new Error("Execution job conflict occurred but the existing job could not be read");
  return { job: existing, reused: true } as const;
}

export function classifyExecutionFailure(input: {
  action: ExecutionAction;
  status: number | null;
  errorCode?: string | null;
  message?: string | null;
}): FailureDecision {
  const code = input.errorCode?.toUpperCase() ?? null;
  const text = `${input.message ?? ""} ${code ?? ""}`.toLowerCase();

  if (
    code === "AI_PROVIDER_UNAVAILABLE" ||
    code === "AI_PROVIDER_UNVERIFIED" ||
    code === "RUNTIME_STALE" ||
    text.includes("provider is unavailable") ||
    text.includes("provider approval is unverified")
  ) {
    return {
      failureClass: "PROVIDER_NOT_READY",
      safeAutomaticRetry: true,
      retryDelayMs: PROVIDER_RETRY_MS,
      errorCode: code,
    };
  }

  if (
    input.status === 409 &&
    (text.includes("already running") || text.includes("already in progress"))
  ) {
    return {
      failureClass: "ALREADY_RUNNING",
      safeAutomaticRetry: true,
      retryDelayMs: ALREADY_RUNNING_RETRY_MS,
      errorCode: code,
    };
  }

  if (
    code === "PILOT_SPEND_APPROVAL_REQUIRED" ||
    text.includes("explicit approval") ||
    text.includes("authorization required") ||
    text.includes("external action required")
  ) {
    return {
      failureClass: "AUTHORIZATION_REQUIRED",
      safeAutomaticRetry: false,
      retryDelayMs: null,
      errorCode: code,
    };
  }

  if (input.status == null || input.status === 408 || input.status === 425 || input.status === 429 || input.status === 503 || input.status === 504) {
    return {
      failureClass: "TRANSIENT_INFRASTRUCTURE",
      safeAutomaticRetry: ZERO_COST_RETRY_ACTIONS.has(input.action),
      retryDelayMs: TRANSIENT_RETRY_MS,
      errorCode: code,
    };
  }

  if (input.status != null && input.status >= 500) {
    return {
      failureClass: "STAGE_FAILURE",
      safeAutomaticRetry: ZERO_COST_RETRY_ACTIONS.has(input.action),
      retryDelayMs: TRANSIENT_RETRY_MS,
      errorCode: code,
    };
  }

  if (text.includes("no executor adapter") || text.includes("not implemented") || text.includes("unsupported")) {
    return {
      failureClass: "INTERNAL_CAPABILITY_MISSING",
      safeAutomaticRetry: false,
      retryDelayMs: null,
      errorCode: code,
    };
  }

  return {
    failureClass: "UNKNOWN",
    safeAutomaticRetry: ZERO_COST_RETRY_ACTIONS.has(input.action),
    retryDelayMs: TRANSIENT_RETRY_MS,
    errorCode: code,
  };
}

async function claimNextDueJob() {
  const now = new Date();
  const candidates = await db
    .select()
    .from(executionJobsTable)
    .where(
      and(
        inArray(executionJobsTable.status, ["QUEUED", "WAITING"]),
        lte(executionJobsTable.availableAt, now),
      ),
    )
    .orderBy(desc(executionJobsTable.priority), asc(executionJobsTable.createdAt), asc(executionJobsTable.id))
    .limit(10);

  for (const candidate of candidates) {
    const [claimed] = await db
      .update(executionJobsTable)
      .set({
        status: "RUNNING",
        attemptCount: candidate.attemptCount + 1,
        startedAt: candidate.startedAt ?? now,
        leaseExpiresAt: new Date(now.getTime() + JOB_LEASE_MS),
        updatedAt: now,
      })
      .where(
        and(
          eq(executionJobsTable.id, candidate.id),
          inArray(executionJobsTable.status, ["QUEUED", "WAITING"]),
        ),
      )
      .returning();
    if (claimed) {
      await recordJobEvent({
        jobId: claimed.id,
        opportunityId: claimed.opportunityId,
        eventType: "JOB_CLAIMED",
        summary: `${claimed.action} claimed for attempt ${claimed.attemptCount}.`,
      });
      return claimed;
    }
  }
  return null;
}

async function markJobSucceeded(job: typeof executionJobsTable.$inferSelect, result: Record<string, unknown>) {
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
    .where(eq(executionJobsTable.id, job.id))
    .returning();
  if (updated) {
    await recordJobEvent({
      jobId: updated.id,
      opportunityId: updated.opportunityId,
      eventType: "JOB_SUCCEEDED",
      summary: `${updated.action} completed successfully.`,
    });
  }
  return updated ?? job;
}

async function markJobWaiting(input: {
  job: typeof executionJobsTable.$inferSelect;
  decision: FailureDecision;
  code: string | null;
  message: string;
}) {
  const delay = input.decision.retryDelayMs ?? TRANSIENT_RETRY_MS;
  const now = new Date();
  const [updated] = await db
    .update(executionJobsTable)
    .set({
      status: "WAITING",
      availableAt: new Date(now.getTime() + delay),
      leaseExpiresAt: null,
      lastErrorClass: input.decision.failureClass,
      lastErrorCode: input.code,
      lastErrorMessage: input.message.slice(0, 4_000),
      updatedAt: now,
    })
    .where(eq(executionJobsTable.id, input.job.id))
    .returning();
  if (updated) {
    await recordJobEvent({
      jobId: updated.id,
      opportunityId: updated.opportunityId,
      eventType: "JOB_WAITING_RETRY",
      summary: `${updated.action} is waiting for a safe retry condition.`,
      metadata: {
        failure_class: input.decision.failureClass,
        error_code: input.code,
        retry_after_ms: delay,
      },
    });
  }
}

async function markJobHumanBlocked(input: {
  job: typeof executionJobsTable.$inferSelect;
  failureClass: ExecutionFailureClass;
  errorCode: string | null;
  message: string;
}) {
  const now = new Date();
  await db
    .update(executionJobsTable)
    .set({
      status: "HUMAN_BLOCKED",
      leaseExpiresAt: null,
      lastErrorClass: input.failureClass,
      lastErrorCode: input.errorCode,
      lastErrorMessage: input.message.slice(0, 4_000),
      updatedAt: now,
    })
    .where(eq(executionJobsTable.id, input.job.id));
  await setOpportunityActivity(input.job.opportunityId, {
    activeEvaluationCycleId: input.job.evaluationCycleId,
    currentActivityKey: "EXECUTION_HUMAN_BLOCKED",
    currentActivityLabel: "Autonomous execution needs human authority",
    activityStatus: "BLOCKED",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: input.message.slice(0, 2_000),
    etaBasis: "HUMAN_ACTION_REQUIRED",
    lifecycleTransition: true,
  });
  await recordJobEvent({
    jobId: input.job.id,
    opportunityId: input.job.opportunityId,
    eventType: "JOB_HUMAN_BLOCKED",
    summary: input.message,
    metadata: { failure_class: input.failureClass, error_code: input.errorCode },
  });
}

async function markJobFailedAndQueueRecovery(input: {
  job: typeof executionJobsTable.$inferSelect;
  failureClass: ExecutionFailureClass;
  errorCode: string | null;
  message: string;
}) {
  const now = new Date();
  await db
    .update(executionJobsTable)
    .set({
      status: "FAILED_TERMINAL",
      finishedAt: now,
      leaseExpiresAt: null,
      lastErrorClass: input.failureClass,
      lastErrorCode: input.errorCode,
      lastErrorMessage: input.message.slice(0, 4_000),
      updatedAt: now,
    })
    .where(eq(executionJobsTable.id, input.job.id));
  await recordJobEvent({
    jobId: input.job.id,
    opportunityId: input.job.opportunityId,
    eventType: "JOB_FAILED_RECOVERY_QUEUED",
    summary: `${input.job.action} failed without a safe blind retry; deterministic recovery was queued.`,
    metadata: { failure_class: input.failureClass, error_code: input.errorCode },
  });
  await enqueueExecutionJob({
    opportunityId: input.job.opportunityId,
    evaluationCycleId: input.job.evaluationCycleId,
    parentJobId: input.job.id,
    action: "RECONCILE_OPPORTUNITY",
    payload: {
      failed_job_id: input.job.id,
      failed_action: input.job.action,
      failure_class: input.failureClass,
      error_code: input.errorCode,
      error_message: input.message.slice(0, 2_000),
      original_payload: asObject(input.job.payload),
    },
    idempotencyKey: executionIdempotencyKey({
      opportunityId: input.job.opportunityId,
      evaluationCycleId: input.job.evaluationCycleId,
      action: "RECONCILE_OPPORTUNITY",
      discriminator: `failed-job-${input.job.id}`,
    }),
    priority: 90,
  });
}

async function parseResponse(response: Response): Promise<{
  body: Record<string, unknown>;
  raw: string;
}> {
  const raw = await response.text().catch(() => "");
  if (!raw) return { body: {}, raw: "" };
  try {
    return { body: asObject(JSON.parse(raw)), raw };
  } catch {
    return { body: {}, raw };
  }
}

async function dispatchHttpJob(job: typeof executionJobsTable.$inferSelect, port: number) {
  const payload = asObject(job.payload);
  let method = "POST";
  let path: string;
  let body: string | undefined;

  switch (job.action as ExecutionAction) {
    case "RUN_RESEARCH":
      path = `/opportunities/${job.opportunityId}/research/advance`;
      break;
    case "RUN_VALIDATION":
      path = `/opportunities/${job.opportunityId}/validation/advance`;
      break;
    case "RUN_RESOLUTION":
      path = `/opportunities/${job.opportunityId}/resolution/advance`;
      body = JSON.stringify({
        problem: payload.problem,
        unresolved_question: payload.unresolved_question,
      });
      break;
    case "PLAN_EXPERIMENT":
      path = `/opportunities/${job.opportunityId}/experiments/plan`;
      break;
    case "EXECUTE_EXPERIMENT": {
      const experimentId = Number(payload.experiment_id);
      if (!Number.isInteger(experimentId) || experimentId <= 0) {
        throw new Error("EXECUTE_EXPERIMENT requires a positive experiment_id");
      }
      path = `/opportunities/${job.opportunityId}/experiments/${experimentId}/execute`;
      break;
    }
    case "RECHECK_MONETIZATION_PLAN":
      method = "GET";
      path = `/opportunities/${job.opportunityId}/monetization-plan`;
      break;
    default:
      throw new Error(`HTTP dispatcher does not support action ${job.action}`);
  }

  const response = await fetch(`${apiBaseUrl(port)}${path}`, {
    method,
    headers: {
      ...internalAutomationHeaders(),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body,
    signal: AbortSignal.timeout(420_000),
  });
  const parsed = await parseResponse(response);
  if (response.ok) return parsed.body;

  const code = cleanText(parsed.body.error, 200);
  const message = cleanText(parsed.body.message, 2_000)
    ?? cleanText(parsed.body.error, 2_000)
    ?? parsed.raw.slice(0, 2_000)
    ?? `HTTP ${response.status}`;
  const decision = classifyExecutionFailure({
    action: job.action as ExecutionAction,
    status: response.status,
    errorCode: code,
    message,
  });
  const error = new Error(message) as Error & {
    executionDecision?: FailureDecision;
    status?: number;
    errorCode?: string | null;
  };
  error.executionDecision = decision;
  error.status = response.status;
  error.errorCode = code;
  throw error;
}

async function enqueueExperimentExecutionFromPlan(
  job: typeof executionJobsTable.$inferSelect,
  result: Record<string, unknown>,
): Promise<void> {
  const experimentId = Number(result.experiment_id);
  if (!Number.isInteger(experimentId) || experimentId <= 0) return;
  await enqueueExecutionJob({
    opportunityId: job.opportunityId,
    evaluationCycleId: job.evaluationCycleId,
    parentJobId: job.id,
    action: "EXECUTE_EXPERIMENT",
    payload: { experiment_id: experimentId },
    idempotencyKey: executionIdempotencyKey({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      action: "EXECUTE_EXPERIMENT",
      discriminator: `experiment-${experimentId}`,
    }),
    priority: 70,
  });
}

async function handleMonetizationPlanResult(
  job: typeof executionJobsTable.$inferSelect,
  result: Record<string, unknown>,
): Promise<void> {
  const status = cleanText(result.status, 100);
  const autonomy = asObject(result.autonomy);
  const nextGate = cleanText(autonomy.nextGate, 100);
  if (status === "READY_FOR_INTERNAL_BUILD" || nextGate === "BUILD_ORCHESTRATOR") {
    await enqueueExecutionJob({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      parentJobId: job.id,
      action: "RUN_BUILD_ORCHESTRATOR",
      payload: {},
      idempotencyKey: executionIdempotencyKey({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        action: "RUN_BUILD_ORCHESTRATOR",
        discriminator: "commercial-plan-ready",
      }),
      priority: 60,
    });
  }
}

async function reconcileOpportunityJob(job: typeof executionJobsTable.$inferSelect) {
  const payload = asObject(job.payload);
  const failedAction = cleanText(payload.failed_action, 100) as ExecutionAction | null;
  const errorMessage = cleanText(payload.error_message, 2_000) ?? "Execution failed without a preserved error message.";
  const originalPayload = asObject(payload.original_payload);

  if (failedAction === "RUN_RESEARCH") {
    await enqueueExecutionJob({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      parentJobId: job.id,
      action: "RUN_RESOLUTION",
      payload: {
        problem: "RESEARCH_EXECUTION_FAILURE",
        unresolved_question: `Research execution failed and a blind paid retry is forbidden. Determine the safest autonomous recovery path. Failure: ${errorMessage}`,
      },
      idempotencyKey: executionIdempotencyKey({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        action: "RUN_RESOLUTION",
        discriminator: `research-execution-failure-${payload.failed_job_id ?? job.id}`,
      }),
      priority: 95,
    });
    return { recovery: "RUN_RESOLUTION", problem: "RESEARCH_EXECUTION_FAILURE" };
  }

  if (failedAction === "RUN_VALIDATION") {
    await enqueueExecutionJob({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      parentJobId: job.id,
      action: "RUN_RESOLUTION",
      payload: {
        problem: "VALIDATION_EXECUTION_FAILURE",
        unresolved_question: `Validation execution failed and a blind paid retry is forbidden. Determine the safest autonomous recovery path. Failure: ${errorMessage}`,
      },
      idempotencyKey: executionIdempotencyKey({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        action: "RUN_RESOLUTION",
        discriminator: `validation-execution-failure-${payload.failed_job_id ?? job.id}`,
      }),
      priority: 95,
    });
    return { recovery: "RUN_RESOLUTION", problem: "VALIDATION_EXECUTION_FAILURE" };
  }

  if (failedAction === "EXECUTE_EXPERIMENT") {
    const experimentId = Number(originalPayload.experiment_id);
    if (Number.isInteger(experimentId) && experimentId > 0) {
      await enqueueExecutionJob({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        parentJobId: job.id,
        action: "EXECUTE_EXPERIMENT",
        payload: { experiment_id: experimentId },
        idempotencyKey: executionIdempotencyKey({
          opportunityId: job.opportunityId,
          evaluationCycleId: job.evaluationCycleId,
          action: "EXECUTE_EXPERIMENT",
          discriminator: `experiment-${experimentId}-recovery-${job.id}`,
        }),
        priority: 80,
      });
      return { recovery: "RETRY_ZERO_COST_EXPERIMENT", experiment_id: experimentId };
    }
  }

  if (failedAction === "RUN_RESOLUTION") {
    const problem = cleanText(originalPayload.problem, 200);
    const unresolvedQuestion = cleanText(originalPayload.unresolved_question, 4_000);
    const gate = await createOrReuseHumanAction({
      opportunityId: job.opportunityId,
      actionType: "AUTHORIZE_BOUNDED_RESOLUTION_RETRY",
      title: "Approve bounded AI retry after uncertain provider failure",
      whyNeeded: "An autonomous resolution worker failed with an uncertain paid-call outcome. Money Scout will not blindly repeat a potentially billable model call.",
      instructions: "Approve one bounded retry only if you want Money Scout to continue this resolution cycle. No additional research is being delegated to you.",
      blockedStage: `EXECUTION_KERNEL:RUN_RESOLUTION:${payload.failed_job_id ?? job.id}`,
      requiredCapabilityKey: null,
      provider: null,
      verificationMode: "HUMAN_ATTESTATION",
      urgency: "NORMAL",
      resumeAction: "RUN_RESOLUTION",
      resumePayload: {
        problem,
        unresolved_question: unresolvedQuestion,
      },
      inherentlyHumanAuthority: true,
    });
    if (gate.action) {
      await db
        .update(executionJobsTable)
        .set({ status: "HUMAN_BLOCKED", updatedAt: new Date() })
        .where(eq(executionJobsTable.id, job.id));
    }
    return { recovery: "HUMAN_CAPITAL_AUTHORITY", human_action_id: gate.action?.id ?? null };
  }

  return { recovery: "NO_SAFE_AUTOMATIC_PATH", failed_action: failedAction };
}

async function executeClaimedJob(job: typeof executionJobsTable.$inferSelect, port: number): Promise<void> {
  try {
    if (job.action === "RUN_BUILD_ORCHESTRATOR") {
      const message = "Build Orchestrator is not implemented yet. The durable job is preserved so Task #68 can activate it without losing the commercial handoff.";
      await db
        .update(executionJobsTable)
        .set({
          status: "WAITING",
          availableAt: new Date(Date.now() + 24 * 60 * 60_000),
          leaseExpiresAt: null,
          lastErrorClass: "INTERNAL_CAPABILITY_MISSING",
          lastErrorCode: "BUILD_ORCHESTRATOR_NOT_IMPLEMENTED",
          lastErrorMessage: message,
          updatedAt: new Date(),
        })
        .where(eq(executionJobsTable.id, job.id));
      await setOpportunityActivity(job.opportunityId, {
        activeEvaluationCycleId: job.evaluationCycleId,
        currentActivityKey: "BUILD_ORCHESTRATOR_PENDING",
        currentActivityLabel: "Validated build is queued for the Build Orchestrator",
        activityStatus: "WAITING",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: message,
        etaBasis: "INTERNAL_CAPABILITY_PENDING",
        lifecycleTransition: true,
      });
      return;
    }

    const result = job.action === "RECONCILE_OPPORTUNITY"
      ? await reconcileOpportunityJob(job)
      : await dispatchHttpJob(job, port);
    const completed = await markJobSucceeded(job, asObject(result));

    if (job.action === "PLAN_EXPERIMENT") {
      await enqueueExperimentExecutionFromPlan(completed, asObject(result));
    } else if (job.action === "RECHECK_MONETIZATION_PLAN") {
      await handleMonetizationPlanResult(completed, asObject(result));
    }
  } catch (error) {
    const typed = error as Error & {
      executionDecision?: FailureDecision;
      status?: number;
      errorCode?: string | null;
    };
    const message = error instanceof Error ? error.message : "Unknown execution-kernel failure";
    const decision = typed.executionDecision ?? classifyExecutionFailure({
      action: job.action as ExecutionAction,
      status: typed.status ?? null,
      errorCode: typed.errorCode ?? null,
      message,
    });

    if (decision.safeAutomaticRetry && job.attemptCount < MAX_SAFE_AUTOMATIC_ATTEMPTS) {
      await markJobWaiting({
        job,
        decision,
        code: typed.errorCode ?? decision.errorCode,
        message,
      });
      return;
    }

    if (decision.failureClass === "PROVIDER_NOT_READY" || decision.failureClass === "ALREADY_RUNNING") {
      await markJobWaiting({
        job,
        decision,
        code: typed.errorCode ?? decision.errorCode,
        message,
      });
      return;
    }

    if (decision.failureClass === "AUTHORIZATION_REQUIRED") {
      await markJobHumanBlocked({
        job,
        failureClass: decision.failureClass,
        errorCode: typed.errorCode ?? decision.errorCode,
        message,
      });
      return;
    }

    await markJobFailedAndQueueRecovery({
      job,
      failureClass: decision.failureClass,
      errorCode: typed.errorCode ?? decision.errorCode,
      message,
    });
  }
}

export async function recoverExpiredExecutionJobs(now = new Date()): Promise<number> {
  const expired = await db
    .select()
    .from(executionJobsTable)
    .where(
      and(
        eq(executionJobsTable.status, "RUNNING"),
        isNotNull(executionJobsTable.leaseExpiresAt),
        lte(executionJobsTable.leaseExpiresAt, now),
      ),
    )
    .orderBy(executionJobsTable.id);

  let recovered = 0;
  for (const job of expired) {
    await db
      .update(executionJobsTable)
      .set({
        status: "FAILED_TERMINAL",
        finishedAt: now,
        leaseExpiresAt: null,
        lastErrorClass: "INTERRUPTED_UNKNOWN_OUTCOME",
        lastErrorCode: "LEASE_EXPIRED",
        lastErrorMessage: "The runtime stopped or the job exceeded its lease before reporting a terminal result. Blind paid replay is forbidden.",
        updatedAt: now,
      })
      .where(eq(executionJobsTable.id, job.id));
    await enqueueExecutionJob({
      opportunityId: job.opportunityId,
      evaluationCycleId: job.evaluationCycleId,
      parentJobId: job.id,
      action: "RECONCILE_OPPORTUNITY",
      payload: {
        failed_job_id: job.id,
        failed_action: job.action,
        failure_class: "INTERRUPTED_UNKNOWN_OUTCOME",
        error_code: "LEASE_EXPIRED",
        error_message: "Runtime interruption created an uncertain outcome; reconcile durable stage state before any replay.",
        original_payload: asObject(job.payload),
      },
      idempotencyKey: executionIdempotencyKey({
        opportunityId: job.opportunityId,
        evaluationCycleId: job.evaluationCycleId,
        action: "RECONCILE_OPPORTUNITY",
        discriminator: `lease-expired-${job.id}`,
      }),
      priority: 100,
    });
    await recordJobEvent({
      jobId: job.id,
      opportunityId: job.opportunityId,
      eventType: "JOB_LEASE_EXPIRED",
      summary: "Job lease expired; deterministic recovery queued instead of blind replay.",
    });
    recovered += 1;
  }
  return recovered;
}

export async function reconcileResolvedHumanActionJobs(): Promise<number> {
  const resolved = await db
    .select()
    .from(humanActionsTable)
    .where(eq(humanActionsTable.status, "RESOLVED"))
    .orderBy(desc(humanActionsTable.resolvedAt));
  let queued = 0;
  for (const action of resolved.slice(0, 200)) {
    if (action.resumeAction === "NO_AUTOMATIC_RESUME") continue;
    const resume = action.resumeAction as ExecutionAction;
    if (!["RUN_RESEARCH", "RUN_VALIDATION", "PLAN_EXPERIMENT", "EXECUTE_EXPERIMENT", "RUN_RESOLUTION", "RECHECK_MONETIZATION_PLAN"].includes(resume)) {
      continue;
    }
    const outcome = await enqueueExecutionJob({
      opportunityId: action.opportunityId,
      evaluationCycleId: action.evaluationCycleId,
      action: resume,
      payload: asObject(action.resumePayload),
      idempotencyKey: executionIdempotencyKey({
        opportunityId: action.opportunityId,
        evaluationCycleId: action.evaluationCycleId,
        action: resume,
        discriminator: `human-action-${action.id}`,
      }),
      priority: 90,
    });
    if (!outcome.reused) queued += 1;
  }
  return queued;
}

export async function runExecutionKernelTick(port: number): Promise<{
  recoveredExpiredJobs: number;
  recoveredHumanActions: number;
  processedJobId: number | null;
}> {
  if (kernelTickRunning) return { recoveredExpiredJobs: 0, recoveredHumanActions: 0, processedJobId: null };
  kernelTickRunning = true;
  try {
    const recoveredExpiredJobs = await recoverExpiredExecutionJobs();
    const recoveredHumanActions = await reconcileResolvedHumanActionJobs();
    const job = await claimNextDueJob();
    if (job) await executeClaimedJob(job, port);
    return {
      recoveredExpiredJobs,
      recoveredHumanActions,
      processedJobId: job?.id ?? null,
    };
  } finally {
    kernelTickRunning = false;
  }
}

export function startExecutionKernel(port: number): void {
  if (kernelTimer || process.env.NODE_ENV === "test") return;
  void runExecutionKernelTick(port).catch((error) => {
    logger.error({ err: error }, "Execution kernel initial tick failed");
  });
  kernelTimer = setInterval(() => {
    void runExecutionKernelTick(port).catch((error) => {
      logger.error({ err: error }, "Execution kernel tick failed");
    });
  }, resolvedIntervalMs());
  kernelTimer.unref();
}

export function stopExecutionKernelForTests(): void {
  if (kernelTimer) clearInterval(kernelTimer);
  kernelTimer = null;
  kernelTickRunning = false;
}

export async function executionQueueSnapshot(opportunityId?: number) {
  const rows = opportunityId == null
    ? await db.select().from(executionJobsTable).orderBy(desc(executionJobsTable.createdAt)).limit(500)
    : await db
        .select()
        .from(executionJobsTable)
        .where(eq(executionJobsTable.opportunityId, opportunityId))
        .orderBy(desc(executionJobsTable.createdAt))
        .limit(200);
  return {
    jobs: rows,
    active: rows.filter((row) => !TERMINAL_STATUSES.includes(row.status as ExecutionJobStatus)),
  };
}
