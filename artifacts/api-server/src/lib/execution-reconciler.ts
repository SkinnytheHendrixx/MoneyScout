import { desc, eq } from "drizzle-orm";
import {
  db,
  opportunitiesTable,
  opportunityRuntimeStateTable,
  researchRunsTable,
} from "@workspace/db";
import type { ResolutionProblem } from "./autonomous-resolution-engine";
import {
  enqueueExecutionJob,
  executionIdempotencyKey,
  type ExecutionAction,
} from "./execution-kernel";
import { internalAutomationHeaders } from "./internal-automation-auth";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

const RECONCILER_DEFAULT_INTERVAL_MS = 2_500;
const RECONCILER_MIN_INTERVAL_MS = 1_000;
let reconcilerTimer: NodeJS.Timeout | null = null;
let reconcilerRunning = false;

const parseObject = (value: string | null): Record<string, unknown> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : {};
  } catch {
    return {};
  }
};

const stringValue = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

function intervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_EXECUTION_RECONCILER_MS ?? "");
  if (Number.isFinite(configured) && configured >= RECONCILER_MIN_INTERVAL_MS) return configured;
  return RECONCILER_DEFAULT_INTERVAL_MS;
}

async function enqueueForRuntimeState(input: {
  opportunityId: number;
  evaluationCycleId: number | null;
  action: ExecutionAction;
  discriminator: string;
  payload?: Record<string, unknown>;
  priority?: number;
}) {
  return enqueueExecutionJob({
    opportunityId: input.opportunityId,
    evaluationCycleId: input.evaluationCycleId,
    action: input.action,
    payload: input.payload ?? {},
    idempotencyKey: executionIdempotencyKey({
      opportunityId: input.opportunityId,
      evaluationCycleId: input.evaluationCycleId,
      action: input.action,
      discriminator: input.discriminator,
    }),
    priority: input.priority ?? 70,
  });
}

async function readPlan(port: number, opportunityId: number, kind: "research" | "validation") {
  const path = kind === "research" ? "research-plan" : "validation-plan";
  const response = await fetch(`http://127.0.0.1:${port}/api/opportunities/${opportunityId}/${path}`, {
    method: "GET",
    headers: internalAutomationHeaders(),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) return null;
  const raw = await response.json().catch(() => null);
  return raw && typeof raw === "object" && !Array.isArray(raw)
    ? raw as Record<string, unknown>
    : null;
}

async function reconcileResolutionQueue(port: number, state: typeof opportunityRuntimeStateTable.$inferSelect) {
  for (const kind of ["research", "validation"] as const) {
    const plan = await readPlan(port, state.opportunityId, kind);
    if (!plan || plan.nextAction !== "RESOLVE_AUTONOMOUSLY") continue;
    const problem = stringValue(plan.resolutionProblem);
    const unresolved = stringValue(plan.stopReason);
    if (!problem || !unresolved) continue;
    await enqueueForRuntimeState({
      opportunityId: state.opportunityId,
      evaluationCycleId: state.activeEvaluationCycleId,
      action: "RUN_RESOLUTION",
      payload: { problem, unresolved_question: unresolved },
      discriminator: `${kind}-${problem}`,
      priority: 90,
    });
    return true;
  }
  return false;
}

type ResolutionRunNote = {
  opportunity_id?: number;
  problem?: ResolutionProblem;
  unresolved_question?: string;
  method?: string;
  status?: string;
  recommendation?: string;
  summary?: string;
};

async function latestResolutionNote(opportunityId: number): Promise<{ runId: number; note: ResolutionRunNote } | null> {
  const runs = await db
    .select({ id: researchRunsTable.id, notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"))
    .orderBy(desc(researchRunsTable.id))
    .limit(200);
  for (const run of runs) {
    const note = parseObject(run.notes) as ResolutionRunNote;
    if (note.opportunity_id === opportunityId) return { runId: run.id, note };
  }
  return null;
}

async function reconcileResolutionComplete(state: typeof opportunityRuntimeStateTable.$inferSelect) {
  const latest = await latestResolutionNote(state.opportunityId);
  if (!latest || latest.note.status !== "RESOLVED") return false;
  const recommendation = latest.note.recommendation;
  const problem = latest.note.problem;
  const unresolved = latest.note.unresolved_question;
  let action: ExecutionAction | null = null;
  let payload: Record<string, unknown> = {};

  if (recommendation === "RETURN_TO_RESEARCH") action = "RUN_RESEARCH";
  else if (recommendation === "RETURN_TO_VALIDATION") action = "RUN_VALIDATION";
  else if (recommendation === "PLAN_EXPERIMENT") action = "PLAN_EXPERIMENT";
  else if (recommendation === "BUILD_SUPPORTED") {
    action = problem?.startsWith("COMMERCIAL_") ? "RECHECK_MONETIZATION_PLAN" : "RUN_VALIDATION";
  } else if (recommendation === "KILL_SUPPORTED") {
    await db
      .update(opportunitiesTable)
      .set({
        verdict: "KILL",
        killReason: latest.note.summary ?? "Autonomous resolution confirmed the blocking thesis after adversarial review.",
      })
      .where(eq(opportunitiesTable.id, state.opportunityId));
    await setOpportunityActivity(state.opportunityId, {
      activeEvaluationCycleId: state.activeEvaluationCycleId,
      currentActivityKey: "KILL_CONFIRMED",
      currentActivityLabel: "Autonomous resolution confirmed the kill decision",
      activityStatus: "COMPLETE",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: "No further execution unless a future explicitly monitored condition reopens the thesis.",
      etaBasis: "TERMINAL_DECISION",
      lifecycleTransition: true,
    });
    await recordLifecycleEvent({
      opportunityId: state.opportunityId,
      evaluationCycleId: state.activeEvaluationCycleId,
      eventType: "EXECUTION_KERNEL_KILL_CONFIRMED",
      summary: latest.note.summary ?? "Autonomous resolution confirmed KILL.",
      metadata: { resolution_run_id: latest.runId, problem },
    });
    return true;
  } else if (recommendation === "CONTINUE_RESOLUTION" && problem && unresolved) {
    action = "RUN_RESOLUTION";
    payload = { problem, unresolved_question: unresolved };
  }

  if (!action) return false;
  await enqueueForRuntimeState({
    opportunityId: state.opportunityId,
    evaluationCycleId: state.activeEvaluationCycleId,
    action,
    payload,
    discriminator: `resolution-run-${latest.runId}-${recommendation}`,
    priority: 85,
  });
  return true;
}

async function reconcileInterruptedState(
  state: typeof opportunityRuntimeStateTable.$inferSelect,
  failedAction: "RUN_RESEARCH" | "RUN_VALIDATION",
) {
  await enqueueForRuntimeState({
    opportunityId: state.opportunityId,
    evaluationCycleId: state.activeEvaluationCycleId,
    action: "RECONCILE_OPPORTUNITY",
    payload: {
      failed_job_id: `runtime-${state.opportunityId}-${state.updatedAt.toISOString()}`,
      failed_action: failedAction,
      failure_class: "INTERRUPTED_UNKNOWN_OUTCOME",
      error_code: state.currentActivityKey,
      error_message: state.nextAction ?? `${failedAction} was interrupted before a durable successor completed.`,
      original_payload: {},
    },
    discriminator: `${state.currentActivityKey}-${state.updatedAt.toISOString()}`,
    priority: 95,
  });
}

export async function runExecutionHandoffReconciliation(port: number): Promise<{
  scanned: number;
  queuedOrRecovered: number;
}> {
  const states = await db.select().from(opportunityRuntimeStateTable).orderBy(opportunityRuntimeStateTable.opportunityId);
  let queuedOrRecovered = 0;

  for (const state of states) {
    let handled = false;
    switch (state.currentActivityKey) {
      case "RESEARCH_QUEUED":
        await enqueueForRuntimeState({
          opportunityId: state.opportunityId,
          evaluationCycleId: state.activeEvaluationCycleId,
          action: "RUN_RESEARCH",
          discriminator: "runtime-research-queued",
          priority: 80,
        });
        handled = true;
        break;
      case "VALIDATION_QUEUED":
        await enqueueForRuntimeState({
          opportunityId: state.opportunityId,
          evaluationCycleId: state.activeEvaluationCycleId,
          action: "RUN_VALIDATION",
          discriminator: "runtime-validation-queued",
          priority: 80,
        });
        handled = true;
        break;
      case "RESOLUTION_QUEUED":
        handled = await reconcileResolutionQueue(port, state);
        break;
      case "EXPERIMENT_PLANNING":
        await enqueueForRuntimeState({
          opportunityId: state.opportunityId,
          evaluationCycleId: state.activeEvaluationCycleId,
          action: "PLAN_EXPERIMENT",
          discriminator: "runtime-experiment-planning",
          priority: 75,
        });
        handled = true;
        break;
      case "RESOLUTION_COMPLETE":
        handled = await reconcileResolutionComplete(state);
        break;
      case "READY_FOR_INTERNAL_BUILD":
        await enqueueForRuntimeState({
          opportunityId: state.opportunityId,
          evaluationCycleId: state.activeEvaluationCycleId,
          action: "RECHECK_MONETIZATION_PLAN",
          discriminator: "validated-build-ready",
          priority: 65,
        });
        handled = true;
        break;
      case "RESEARCH_INTERRUPTED":
        await reconcileInterruptedState(state, "RUN_RESEARCH");
        handled = true;
        break;
      case "VALIDATION_INTERRUPTED":
        await reconcileInterruptedState(state, "RUN_VALIDATION");
        handled = true;
        break;
      default:
        break;
    }
    if (handled) queuedOrRecovered += 1;
  }

  return { scanned: states.length, queuedOrRecovered };
}

export async function runExecutionReconcilerTick(port: number) {
  if (reconcilerRunning) return { scanned: 0, queuedOrRecovered: 0 };
  reconcilerRunning = true;
  try {
    return await runExecutionHandoffReconciliation(port);
  } finally {
    reconcilerRunning = false;
  }
}

export function startExecutionReconciler(port: number): void {
  if (reconcilerTimer || process.env.NODE_ENV === "test") return;
  void runExecutionReconcilerTick(port).catch((error) => {
    logger.error({ err: error }, "Execution handoff reconciliation initial tick failed");
  });
  reconcilerTimer = setInterval(() => {
    void runExecutionReconcilerTick(port).catch((error) => {
      logger.error({ err: error }, "Execution handoff reconciliation tick failed");
    });
  }, intervalMs());
  reconcilerTimer.unref();
}

export function stopExecutionReconcilerForTests(): void {
  if (reconcilerTimer) clearInterval(reconcilerTimer);
  reconcilerTimer = null;
  reconcilerRunning = false;
}
