import { and, desc, eq, inArray } from "drizzle-orm";
import {
  capabilitiesTable,
  db,
  humanActionsTable,
  type HumanActionResumePayload,
} from "@workspace/db";
import type { ExhaustionCertificate, ResolutionProblem } from "./autonomous-resolution-engine";
import {
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
} from "./lifecycle-state";

export type HumanActionUrgency = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
export type HumanActionVerificationMode =
  | "AUTOMATED_CHECK"
  | "HUMAN_ATTESTATION"
  | "EXTERNAL_CALLBACK";

export type HumanActionResumeAction =
  | "RUN_RESEARCH"
  | "RUN_VALIDATION"
  | "PLAN_EXPERIMENT"
  | "EXECUTE_EXPERIMENT"
  | "RUN_RESOLUTION"
  | "RECHECK_MONETIZATION_PLAN"
  | "NO_AUTOMATIC_RESUME";

export type HumanGateCandidate = {
  actionType: string;
  title: string;
  whyNeeded: string;
  instructions: string;
  blockedStage: string;
  requiredCapabilityKey: string | null;
  provider: string | null;
  verificationMode: HumanActionVerificationMode;
  urgency: HumanActionUrgency;
};

export type CreateHumanActionInput = HumanGateCandidate & {
  opportunityId: number;
  resumeAction: HumanActionResumeAction;
  resumePayload?: HumanActionResumePayload;
  exhaustionCertificate?: ExhaustionCertificate | null;
  inherentlyHumanAuthority?: boolean;
};

export const HUMAN_ACTION_NOTIFICATION_POLICY: Record<HumanActionUrgency, {
  immediate: boolean;
  includeInDailySummary: boolean;
  suggestedChannels: string[];
}> = {
  CRITICAL: {
    immediate: true,
    includeInDailySummary: true,
    suggestedChannels: ["IN_APP", "PUSH_OR_EMAIL", "OPTIONAL_SMS"],
  },
  HIGH: {
    immediate: true,
    includeInDailySummary: true,
    suggestedChannels: ["IN_APP", "PUSH_OR_EMAIL"],
  },
  NORMAL: {
    immediate: false,
    includeInDailySummary: true,
    suggestedChannels: ["IN_APP", "DAILY_SUMMARY"],
  },
  LOW: {
    immediate: false,
    includeInDailySummary: false,
    suggestedChannels: ["IN_APP"],
  },
};

export function humanGateCreationAllowed(input: {
  exhaustionCertificate?: ExhaustionCertificate | null;
  inherentlyHumanAuthority?: boolean;
}): boolean {
  return input.inherentlyHumanAuthority === true || input.exhaustionCertificate?.humanEscalationEligible === true;
}

export function resumeActionForResolutionProblem(problem: ResolutionProblem): HumanActionResumeAction {
  if (
    problem === "POLICY_AMBIGUITY" ||
    problem === "DEMAND_UNCERTAINTY" ||
    problem === "KILL_RISK_INCOMPLETE" ||
    problem === "RESEARCH_BUDGET_EXHAUSTED" ||
    problem === "RESEARCH_EXECUTION_FAILURE"
  ) return "RUN_RESEARCH";

  if (
    problem === "VALIDATION_PREREQUISITE_REGRESSION" ||
    problem === "VALIDATION_EVIDENCE_FAILURE" ||
    problem === "VALIDATION_BUDGET_EXHAUSTED" ||
    problem === "VALIDATION_EXECUTION_FAILURE" ||
    problem === "VALIDATION_WATCH" ||
    problem === "VALIDATION_REJECT_CHALLENGE"
  ) return "RUN_VALIDATION";

  return "RECHECK_MONETIZATION_PLAN";
}

export function capabilityIsUsable(input: {
  status: string;
  accessLevel?: string | null;
  expiresAt: Date | null;
}, now = new Date()): boolean {
  return (
    input.status === "AVAILABLE" &&
    input.accessLevel === "AUTOMATION_READY" &&
    (!input.expiresAt || input.expiresAt.getTime() > now.getTime())
  );
}

export async function getCapability(capabilityKey: string) {
  const [capability] = await db
    .select()
    .from(capabilitiesTable)
    .where(eq(capabilitiesTable.key, capabilityKey));
  return capability ?? null;
}

export async function hasCapability(capabilityKey: string): Promise<boolean> {
  const capability = await getCapability(capabilityKey);
  return capability ? capabilityIsUsable(capability) : false;
}

export async function setCapabilityAvailable(input: {
  key: string;
  provider: string;
  accessLevel?: string;
  verificationMethod: string;
  metadata?: Record<string, unknown>;
  expiresAt?: Date | null;
}) {
  const now = new Date();
  const accessLevel = input.accessLevel ?? "AUTOMATION_READY";
  const [capability] = await db
    .insert(capabilitiesTable)
    .values({
      key: input.key,
      provider: input.provider,
      status: "AVAILABLE",
      accessLevel,
      verificationMethod: input.verificationMethod,
      metadata: input.metadata ?? {},
      verifiedAt: now,
      expiresAt: input.expiresAt ?? null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: capabilitiesTable.key,
      set: {
        provider: input.provider,
        status: "AVAILABLE",
        accessLevel,
        verificationMethod: input.verificationMethod,
        metadata: input.metadata ?? {},
        verifiedAt: now,
        expiresAt: input.expiresAt ?? null,
        updatedAt: now,
      },
    })
    .returning();
  return capability;
}

export async function createOrReuseHumanAction(input: CreateHumanActionInput) {
  if (!humanGateCreationAllowed(input)) {
    throw new Error(
      "HUMAN_GATE_NOT_ELIGIBLE: internal research must be exhausted or the action must require inherently human authority.",
    );
  }

  if (input.requiredCapabilityKey && await hasCapability(input.requiredCapabilityKey)) {
    return { action: null, capabilityAlreadyAvailable: true } as const;
  }

  const existing = await db
    .select()
    .from(humanActionsTable)
    .where(
      and(
        eq(humanActionsTable.opportunityId, input.opportunityId),
        eq(humanActionsTable.actionType, input.actionType),
        eq(humanActionsTable.blockedStage, input.blockedStage),
        inArray(humanActionsTable.status, ["OPEN", "VERIFYING"]),
      ),
    )
    .orderBy(desc(humanActionsTable.id));
  if (existing[0]) return { action: existing[0], capabilityAlreadyAvailable: false } as const;

  const cycle = await getActiveEvaluationCycle(input.opportunityId);
  const now = new Date();
  const [action] = await db
    .insert(humanActionsTable)
    .values({
      opportunityId: input.opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      status: "OPEN",
      urgency: input.urgency,
      actionType: input.actionType,
      title: input.title,
      whyNeeded: input.whyNeeded,
      instructions: input.instructions,
      blockedStage: input.blockedStage,
      requiredCapabilityKey: input.requiredCapabilityKey,
      requiredCapabilityProvider: input.provider,
      verificationMode: input.verificationMode,
      resumeAction: input.resumeAction,
      resumePayload: input.resumePayload ?? {},
      createdAt: now,
      updatedAt: now,
    })
    .returning();
  if (!action) throw new Error("Failed to create human action");

  await setOpportunityActivity(input.opportunityId, {
    activeEvaluationCycleId: cycle?.id ?? null,
    currentActivityKey: `HUMAN_BLOCKED_${input.actionType}`,
    currentActivityLabel: input.title,
    activityStatus: "BLOCKED",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: input.instructions,
    etaBasis: "HUMAN_ACTION_REQUIRED",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: input.opportunityId,
    evaluationCycleId: cycle?.id ?? null,
    eventType: "HUMAN_ACTION_CREATED",
    summary: input.title,
    metadata: {
      human_action_id: action.id,
      action_type: input.actionType,
      urgency: input.urgency,
      blocked_stage: input.blockedStage,
      required_capability_key: input.requiredCapabilityKey,
      required_capability_provider: input.provider,
      resume_action: input.resumeAction,
      notification_policy: HUMAN_ACTION_NOTIFICATION_POLICY[input.urgency],
    },
    occurredAt: now,
  });

  return { action, capabilityAlreadyAvailable: false } as const;
}

export async function markHumanActionVerifying(actionId: number) {
  const now = new Date();
  const [updated] = await db
    .update(humanActionsTable)
    .set({ status: "VERIFYING", updatedAt: now })
    .where(eq(humanActionsTable.id, actionId))
    .returning();
  return updated ?? null;
}

export async function markHumanActionResolved(input: {
  actionId: number;
  resolutionData: Record<string, unknown>;
}) {
  const now = new Date();
  const [updated] = await db
    .update(humanActionsTable)
    .set({
      status: "RESOLVED",
      resolutionData: input.resolutionData,
      resolvedAt: now,
      updatedAt: now,
    })
    .where(eq(humanActionsTable.id, input.actionId))
    .returning();
  if (!updated) return null;

  await recordLifecycleEvent({
    opportunityId: updated.opportunityId,
    evaluationCycleId: updated.evaluationCycleId,
    eventType: "HUMAN_ACTION_RESOLVED",
    summary: updated.title,
    metadata: {
      human_action_id: updated.id,
      action_type: updated.actionType,
      required_capability_key: updated.requiredCapabilityKey,
      resume_action: updated.resumeAction,
    },
    occurredAt: now,
  });
  await setOpportunityActivity(updated.opportunityId, {
    activeEvaluationCycleId: updated.evaluationCycleId,
    currentActivityKey: "HUMAN_ACTION_RESOLVED",
    currentActivityLabel: "Human bottleneck resolved; resuming automation",
    activityStatus: "WAITING",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: updated.resumeAction.replaceAll("_", " "),
    etaBasis: "AUTOMATIC_RESUME_PENDING",
    lifecycleTransition: true,
  });
  return updated;
}

export async function resolveOpenActionsForCapability(input: {
  capabilityKey: string;
  resolutionData: Record<string, unknown>;
}) {
  const actions = await db
    .select()
    .from(humanActionsTable)
    .where(
      and(
        eq(humanActionsTable.requiredCapabilityKey, input.capabilityKey),
        inArray(humanActionsTable.status, ["OPEN", "VERIFYING"]),
      ),
    )
    .orderBy(humanActionsTable.id);

  const resolved = [];
  for (const action of actions) {
    const updated = await markHumanActionResolved({
      actionId: action.id,
      resolutionData: input.resolutionData,
    });
    if (updated) resolved.push(updated);
  }
  return resolved;
}