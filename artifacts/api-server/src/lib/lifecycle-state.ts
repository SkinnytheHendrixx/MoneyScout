import { and, desc, eq } from "drizzle-orm";
import {
  db,
  evaluationCyclesTable,
  lifecycleEventsTable,
  opportunityRuntimeStateTable,
} from "@workspace/db";

export type ActivityStateInput = {
  activeEvaluationCycleId?: number | null;
  currentActivityKey: string;
  currentActivityLabel: string;
  activityStatus: "IDLE" | "RUNNING" | "WAITING" | "BLOCKED" | "COMPLETE";
  activityStartedAt?: Date | null;
  expectedDurationSeconds?: number | null;
  stageIndex?: number | null;
  stageCount?: number | null;
  nextAction?: string | null;
  etaBasis?: string | null;
  lastReconciledAt?: Date | null;
  lifecycleTransition?: boolean;
};

export async function getActiveEvaluationCycle(opportunityId: number) {
  const [cycle] = await db
    .select()
    .from(evaluationCyclesTable)
    .where(
      and(
        eq(evaluationCyclesTable.opportunityId, opportunityId),
        eq(evaluationCyclesTable.status, "ACTIVE"),
      ),
    )
    .orderBy(desc(evaluationCyclesTable.cycleNumber));
  return cycle ?? null;
}

export async function getEvaluationCycleStart(opportunityId: number): Promise<Date | null> {
  const active = await getActiveEvaluationCycle(opportunityId);
  return active?.startedAt ?? null;
}

export async function ensureActiveEvaluationCycle(input: {
  opportunityId: number;
  triggerType: string;
  triggerReason: string;
  triggerMetadata?: Record<string, unknown>;
  startedAt?: Date;
}) {
  const existing = await getActiveEvaluationCycle(input.opportunityId);
  if (existing) return existing;

  const [latest] = await db
    .select({ cycleNumber: evaluationCyclesTable.cycleNumber })
    .from(evaluationCyclesTable)
    .where(eq(evaluationCyclesTable.opportunityId, input.opportunityId))
    .orderBy(desc(evaluationCyclesTable.cycleNumber));

  const [created] = await db
    .insert(evaluationCyclesTable)
    .values({
      opportunityId: input.opportunityId,
      cycleNumber: (latest?.cycleNumber ?? 0) + 1,
      status: "ACTIVE",
      triggerType: input.triggerType,
      triggerReason: input.triggerReason,
      triggerMetadata: input.triggerMetadata ?? {},
      startedAt: input.startedAt ?? new Date(),
    })
    .returning();

  if (!created) throw new Error("Failed to create evaluation cycle");
  await setOpportunityActivity(input.opportunityId, {
    activeEvaluationCycleId: created.id,
    currentActivityKey: "EVALUATION_CYCLE_ACTIVE",
    currentActivityLabel: "Evaluation cycle active",
    activityStatus: "WAITING",
    activityStartedAt: created.startedAt,
    expectedDurationSeconds: null,
    stageIndex: null,
    stageCount: null,
    nextAction: "Continue the current evaluation cycle.",
    etaBasis: "STAGE_DEPENDENT",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: input.opportunityId,
    evaluationCycleId: created.id,
    eventType: "EVALUATION_CYCLE_STARTED",
    summary: input.triggerReason,
    metadata: {
      trigger_type: input.triggerType,
      ...input.triggerMetadata,
    },
    occurredAt: created.startedAt,
  });
  return created;
}

export async function startNewEvaluationCycle(input: {
  opportunityId: number;
  triggerType: string;
  triggerReason: string;
  triggerMetadata?: Record<string, unknown>;
  startedAt?: Date;
}) {
  const now = input.startedAt ?? new Date();
  const current = await getActiveEvaluationCycle(input.opportunityId);
  if (current) {
    await db
      .update(evaluationCyclesTable)
      .set({ status: "COMPLETED", completedAt: now })
      .where(eq(evaluationCyclesTable.id, current.id));
    await recordLifecycleEvent({
      opportunityId: input.opportunityId,
      evaluationCycleId: current.id,
      eventType: "EVALUATION_CYCLE_COMPLETED",
      summary: "The prior evaluation cycle was closed before a materially new cycle began.",
      occurredAt: now,
    });
  }
  return ensureActiveEvaluationCycle({ ...input, startedAt: now });
}

export async function setOpportunityActivity(
  opportunityId: number,
  input: ActivityStateInput,
): Promise<void> {
  const now = new Date();
  const values = {
    opportunityId,
    activeEvaluationCycleId: input.activeEvaluationCycleId,
    currentActivityKey: input.currentActivityKey,
    currentActivityLabel: input.currentActivityLabel,
    activityStatus: input.activityStatus,
    activityStartedAt: input.activityStartedAt ?? null,
    expectedDurationSeconds: input.expectedDurationSeconds ?? null,
    stageIndex: input.stageIndex ?? null,
    stageCount: input.stageCount ?? null,
    nextAction: input.nextAction ?? null,
    etaBasis: input.etaBasis ?? null,
    lastReconciledAt: input.lastReconciledAt ?? null,
    lastLifecycleTransitionAt: input.lifecycleTransition ? now : undefined,
    updatedAt: now,
  };

  await db
    .insert(opportunityRuntimeStateTable)
    .values(values)
    .onConflictDoUpdate({
      target: opportunityRuntimeStateTable.opportunityId,
      set: {
        activeEvaluationCycleId: values.activeEvaluationCycleId,
        currentActivityKey: values.currentActivityKey,
        currentActivityLabel: values.currentActivityLabel,
        activityStatus: values.activityStatus,
        activityStartedAt: values.activityStartedAt,
        expectedDurationSeconds: values.expectedDurationSeconds,
        stageIndex: values.stageIndex,
        stageCount: values.stageCount,
        nextAction: values.nextAction,
        etaBasis: values.etaBasis,
        lastReconciledAt: values.lastReconciledAt,
        ...(input.lifecycleTransition ? { lastLifecycleTransitionAt: now } : {}),
        updatedAt: now,
      },
    });
}

export async function recordLifecycleEvent(input: {
  opportunityId: number;
  evaluationCycleId?: number | null;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
  occurredAt?: Date;
}): Promise<void> {
  await db.insert(lifecycleEventsTable).values({
    opportunityId: input.opportunityId,
    evaluationCycleId: input.evaluationCycleId ?? null,
    eventType: input.eventType,
    summary: input.summary,
    metadata: input.metadata ?? {},
    occurredAt: input.occurredAt ?? new Date(),
  });
}

export function activityEstimateForStage(stage: string): {
  label: string;
  expectedDurationSeconds: number;
  stageIndex: number;
  stageCount: number;
} {
  switch (stage) {
    case "policy-checks":
      return { label: "Checking policy and platform constraints", expectedDurationSeconds: 120, stageIndex: 1, stageCount: 3 };
    case "demand-checks":
      return { label: "Researching buyer demand", expectedDurationSeconds: 180, stageIndex: 2, stageCount: 3 };
    case "kill-screen/collect":
      return { label: "Challenging fatal-risk hypotheses", expectedDurationSeconds: 180, stageIndex: 3, stageCount: 3 };
    case "validation-evidence":
      return { label: "Underwriting the opportunity", expectedDurationSeconds: 240, stageIndex: 1, stageCount: 1 };
    case "DIRECT_RESEARCH":
      return { label: "Searching for direct evidence", expectedDurationSeconds: 180, stageIndex: 1, stageCount: 7 };
    case "PROXY_RESEARCH":
      return { label: "Searching proxy and adjacent evidence", expectedDurationSeconds: 180, stageIndex: 2, stageCount: 7 };
    case "ECONOMIC_INFERENCE":
      return { label: "Deriving economic bounds", expectedDurationSeconds: 90, stageIndex: 3, stageCount: 7 };
    case "ADVERSARIAL_REVIEW":
      return { label: "Adversarially challenging the conclusion", expectedDurationSeconds: 90, stageIndex: 4, stageCount: 7 };
    case "ALTERNATIVE_THESIS":
      return { label: "Testing alternative business theses", expectedDurationSeconds: 90, stageIndex: 5, stageCount: 7 };
    case "SAFE_EXPERIMENT":
      return { label: "Selecting the cheapest falsifying experiment", expectedDurationSeconds: 60, stageIndex: 6, stageCount: 7 };
    case "WATCH_FOR_DELTA":
      return { label: "Defining material-change watch signals", expectedDurationSeconds: 60, stageIndex: 7, stageCount: 7 };
    default:
      return { label: stage.replaceAll("_", " "), expectedDurationSeconds: 120, stageIndex: 1, stageCount: 1 };
  }
}
