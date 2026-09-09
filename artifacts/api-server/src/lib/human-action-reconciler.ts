import { and, desc, eq, gte } from "drizzle-orm";
import {
  db,
  opportunitiesTable,
  opportunityRuntimeStateTable,
  researchRunsTable,
} from "@workspace/db";
import {
  createExhaustionCertificate,
  type ResolutionAttempt,
  type ResolutionAttemptStatus,
  type ResolutionMethod,
  type ResolutionProblem,
} from "./autonomous-resolution-engine";
import {
  createOrReuseHumanAction,
  resumeActionForResolutionProblem,
  type HumanGateCandidate,
} from "./human-gates";
import { getActiveEvaluationCycle, recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";

const RESOLUTION_PROBLEMS = new Set<ResolutionProblem>([
  "POLICY_AMBIGUITY",
  "DEMAND_UNCERTAINTY",
  "KILL_RISK_INCOMPLETE",
  "RESEARCH_BUDGET_EXHAUSTED",
  "RESEARCH_EXECUTION_FAILURE",
  "VALIDATION_PREREQUISITE_REGRESSION",
  "VALIDATION_EVIDENCE_FAILURE",
  "VALIDATION_BUDGET_EXHAUSTED",
  "VALIDATION_EXECUTION_FAILURE",
  "VALIDATION_WATCH",
  "VALIDATION_REJECT_CHALLENGE",
  "COMMERCIAL_BUYER_UNRESOLVED",
  "COMMERCIAL_PRICING_UNRESOLVED",
  "COMMERCIAL_DISTRIBUTION_UNRESOLVED",
]);

const RESOLUTION_METHODS = new Set<ResolutionMethod>([
  "DIRECT_RESEARCH",
  "PROXY_RESEARCH",
  "ECONOMIC_INFERENCE",
  "ADVERSARIAL_REVIEW",
  "ALTERNATIVE_THESIS",
  "SAFE_EXPERIMENT",
  "WATCH_FOR_DELTA",
]);

const ATTEMPT_STATUSES = new Set<ResolutionAttemptStatus>([
  "NOT_ATTEMPTED",
  "RUNNING",
  "RESOLVED",
  "EXHAUSTED",
  "NOT_APPLICABLE",
  "ACTIVE_MONITORING",
]);

type ResolutionNote = {
  opportunity_id?: number;
  evaluation_cycle_id?: number | null;
  problem?: ResolutionProblem;
  unresolved_question?: string;
  method?: ResolutionMethod;
  status?: ResolutionAttemptStatus;
  summary?: string;
  rationale?: string;
  unresolved_questions?: string[];
  human_gate_candidate?: unknown;
};

const parseNote = (value: string | null): Partial<ResolutionNote> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Partial<ResolutionNote>
      : {};
  } catch {
    return {};
  }
};

const normalizeCapabilityKey = (platform: string): string =>
  `${platform.toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "")}_AUTOMATION_ACCESS`;

const accessGateLanguage = /\b(login|log in|logged in|authenticated|authentication|account|seller account|publisher account|developer account|sign[ -]?up|kyc|identity verification|verify identity|accept (?:the )?terms|seller dashboard|publisher dashboard|developer dashboard|partner dashboard|paywall|paid access|requires? access|behind authentication|members? only)\b/i;

const stringField = (
  object: Record<string, unknown>,
  camel: string,
  snake: string,
): string | null => {
  const value = object[camel] ?? object[snake];
  return typeof value === "string" && value.trim() ? value.trim() : null;
};

function candidateFromNotes(input: {
  platform: string;
  problem: ResolutionProblem;
  unresolvedQuestion: string;
  notes: Array<Partial<ResolutionNote>>;
}): HumanGateCandidate | null {
  const explicit = [...input.notes].reverse()
    .map((note) => note.human_gate_candidate)
    .find((value) => value && typeof value === "object" && !Array.isArray(value)) as Record<string, unknown> | undefined;
  if (explicit) {
    const actionType = stringField(explicit, "actionType", "action_type");
    const title = stringField(explicit, "title", "title");
    const whyNeeded = stringField(explicit, "whyNeeded", "why_needed");
    const instructions = stringField(explicit, "instructions", "instructions");
    const blockedStage = stringField(explicit, "blockedStage", "blocked_stage");
    const requiredCapabilityKey = stringField(explicit, "requiredCapabilityKey", "required_capability_key");
    const provider = stringField(explicit, "provider", "provider");
    const verificationMode = explicit.verificationMode ?? explicit.verification_mode;
    const urgency = explicit.urgency;
    if (
      actionType &&
      title &&
      whyNeeded &&
      instructions &&
      blockedStage &&
      (verificationMode === "AUTOMATED_CHECK" || verificationMode === "HUMAN_ATTESTATION" || verificationMode === "EXTERNAL_CALLBACK") &&
      (urgency === "CRITICAL" || urgency === "HIGH" || urgency === "NORMAL" || urgency === "LOW")
    ) {
      return {
        actionType: actionType.slice(0, 120),
        title: title.slice(0, 300),
        whyNeeded: whyNeeded.slice(0, 2_000),
        instructions: instructions.slice(0, 2_000),
        blockedStage: blockedStage.slice(0, 160),
        requiredCapabilityKey: requiredCapabilityKey
          ? requiredCapabilityKey.toUpperCase().replace(/[^A-Z0-9_:-]/g, "_").slice(0, 160)
          : null,
        provider: provider?.slice(0, 160) ?? input.platform,
        verificationMode,
        urgency,
      };
    }
  }

  const text = [
    input.unresolvedQuestion,
    ...input.notes.flatMap((note) => [
      note.summary ?? "",
      note.rationale ?? "",
      ...(Array.isArray(note.unresolved_questions) ? note.unresolved_questions : []),
    ]),
  ].join("\n");
  if (!accessGateLanguage.test(text)) return null;

  return {
    actionType: "CREATE_OR_CONNECT_PLATFORM_ACCOUNT",
    title: `Connect ${input.platform} access for Money Scout`,
    whyNeeded: `Money Scout exhausted the applicable internal research paths for ${input.problem}. The remaining material evidence appears to require authenticated ${input.platform} access rather than another public-search pass.`,
    instructions: `Create or verify the required ${input.platform} account if necessary, then connect usable authorized access for Money Scout through a supported OAuth, API, or integration path. Account creation alone does not resolve this action, and passwords or raw secrets should not be pasted into the action.`,
    blockedStage: `AUTONOMOUS_RESOLUTION:${input.problem}`,
    requiredCapabilityKey: normalizeCapabilityKey(input.platform),
    provider: input.platform,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
  };
}

function genericExhaustionGate(problem: ResolutionProblem, unresolvedQuestion: string): HumanGateCandidate {
  return {
    actionType: "REVIEW_EXHAUSTED_UNCERTAINTY",
    title: `Decision required: ${problem.replaceAll("_", " ").toLowerCase()}`,
    whyNeeded: `Every applicable internal resolution method was exhausted and the remaining question still matters to the opportunity: ${unresolvedQuestion}`,
    instructions: "Review the concise evidence summary and provide only the missing judgment or authority. Money Scout should not ask you to repeat research it has already exhausted.",
    blockedStage: `AUTONOMOUS_RESOLUTION:${problem}`,
    requiredCapabilityKey: null,
    provider: null,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "NORMAL",
  };
}

export async function reconcileExhaustedHumanActions(): Promise<{
  scanned: number;
  created: number;
  reused: number;
  suppressedBecauseCapabilityAvailable: number;
}> {
  const blockedStates = await db
    .select()
    .from(opportunityRuntimeStateTable)
    .where(eq(opportunityRuntimeStateTable.currentActivityKey, "HUMAN_REVIEW_ELIGIBLE"));

  let created = 0;
  let reused = 0;
  let suppressedBecauseCapabilityAvailable = 0;

  for (const runtime of blockedStates) {
    if (runtime.activityStatus !== "BLOCKED") continue;
    const [opportunity] = await db
      .select({
        id: opportunitiesTable.id,
        sourcePlatform: opportunitiesTable.sourcePlatform,
      })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, runtime.opportunityId));
    if (!opportunity) continue;

    const cycle = await getActiveEvaluationCycle(opportunity.id);
    const runs = await db
      .select()
      .from(researchRunsTable)
      .where(
        cycle
          ? and(
              eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"),
              gte(researchRunsTable.startedAt, cycle.startedAt),
            )
          : eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"),
      )
      .orderBy(desc(researchRunsTable.id));
    const notes = runs
      .map((run) => parseNote(run.notes))
      .filter((note) => note.opportunity_id === opportunity.id);
    const latestProblem = notes.find((note) => note.problem && RESOLUTION_PROBLEMS.has(note.problem))?.problem;
    if (!latestProblem) continue;
    const problem = latestProblem;
    const problemNotes = notes.filter((note) => note.problem === problem).reverse();
    const unresolvedQuestion = [...problemNotes].reverse()
      .find((note) => typeof note.unresolved_question === "string" && note.unresolved_question.trim())
      ?.unresolved_question ?? "The remaining unresolved question was not preserved.";

    const attempts: ResolutionAttempt[] = [];
    for (const note of problemNotes) {
      if (!note.method || !RESOLUTION_METHODS.has(note.method) || !note.status || !ATTEMPT_STATUSES.has(note.status)) continue;
      const summary = typeof note.summary === "string" ? note.summary : note.method;
      const existing = attempts.findIndex((attempt) => attempt.method === note.method);
      const attempt: ResolutionAttempt = { method: note.method, status: note.status, summary };
      if (existing >= 0) attempts[existing] = attempt;
      else attempts.push(attempt);
    }

    const certificate = createExhaustionCertificate({ problem, unresolvedQuestion, attempts });
    if (!certificate.humanEscalationEligible) continue;
    const candidate = candidateFromNotes({
      platform: opportunity.sourcePlatform,
      problem,
      unresolvedQuestion,
      notes: problemNotes,
    }) ?? genericExhaustionGate(problem, unresolvedQuestion);
    const resumeAction = candidate.requiredCapabilityKey
      ? resumeActionForResolutionProblem(problem)
      : "NO_AUTOMATIC_RESUME";
    const outcome = await createOrReuseHumanAction({
      ...candidate,
      opportunityId: opportunity.id,
      resumeAction,
      resumePayload: {
        problem,
        unresolved_question: unresolvedQuestion,
      },
      exhaustionCertificate: certificate,
    });

    if (outcome.capabilityAlreadyAvailable) {
      suppressedBecauseCapabilityAvailable += 1;
      await setOpportunityActivity(opportunity.id, {
        activeEvaluationCycleId: cycle?.id ?? null,
        currentActivityKey: "AVAILABLE_CAPABILITY_NOT_CONSUMED",
        currentActivityLabel: "Required access exists; automation must consume it before escalating",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: `Capability ${candidate.requiredCapabilityKey} is already automation-ready. Human escalation is suppressed; the execution kernel must resume the blocked stage using that capability.`,
        etaBasis: "AUTONOMY_RECOVERY_REQUIRED",
        lifecycleTransition: true,
      });
      await recordLifecycleEvent({
        opportunityId: opportunity.id,
        evaluationCycleId: cycle?.id ?? null,
        eventType: "HUMAN_GATE_SUPPRESSED_CAPABILITY_AVAILABLE",
        summary: `Human escalation suppressed because ${candidate.requiredCapabilityKey} is already available.`,
        metadata: { problem, required_capability_key: candidate.requiredCapabilityKey },
      });
    } else if (outcome.action) {
      const wasCreatedNow = outcome.action.createdAt.getTime() > Date.now() - 5_000;
      if (wasCreatedNow) created += 1;
      else reused += 1;
    }
  }

  return {
    scanned: blockedStates.length,
    created,
    reused,
    suppressedBecauseCapabilityAvailable,
  };
}