import {
  createAutonomousResolutionPlan,
  createExhaustionCertificate,
  type ExhaustionCertificate,
  type ResolutionAttempt,
  type ResolutionAttemptStatus,
  type ResolutionMethod,
  type ResolutionProblem,
} from "./autonomous-resolution-engine";

export const RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD = 1.0;
export const RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD = 0.15;
export const RESOLUTION_RESEARCH_SEARCH_LIMIT = 4;
export const RESOLUTION_MAX_OUTPUT_TOKENS = 2_500;
export const RESOLUTION_MAX_STEPS_PER_ADVANCE = 7;

export type ResolutionRecommendation =
  | "CONTINUE_RESOLUTION"
  | "RETURN_TO_RESEARCH"
  | "RETURN_TO_VALIDATION"
  | "PLAN_EXPERIMENT"
  | "WATCH_FOR_DELTA"
  | "BUILD_SUPPORTED"
  | "KILL_SUPPORTED"
  | "ESCALATE_IF_EXHAUSTED";

export type ResolutionFinding = {
  claim: string;
  sourceUrl: string | null;
  sourceTitle: string | null;
  classification: "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";
};

export type ResolutionExperimentProposal = {
  type: string;
  hypothesis: string;
  successSignal: string;
  failureSignal: string;
} | null;

export type ResolutionWorkerResult = {
  method: ResolutionMethod;
  status: Exclude<ResolutionAttemptStatus, "NOT_ATTEMPTED" | "RUNNING" | "NOT_APPLICABLE">;
  conclusion: string;
  rationale: string;
  confidence: "HIGH" | "MEDIUM" | "LOW";
  recommendation: ResolutionRecommendation;
  findings: ResolutionFinding[];
  derivedBounds: string[];
  watchTriggers: string[];
  experiment: ResolutionExperimentProposal;
  unresolvedQuestions: string[];
};

export type ResolutionWorkerContext = {
  opportunity: {
    id: number;
    name: string;
    sourcePlatform: string;
    sourceUrl: string;
    opportunityType: string;
    thesis: string;
    verdict: string;
  };
  problem: ResolutionProblem;
  unresolvedQuestion: string;
  priorAttempts: ResolutionAttempt[];
  evidence: Array<{
    claim: string;
    classification: string;
    evaluationDimension: string;
    sourceUrl: string;
    sourceTitle: string;
    observedDate: string;
  }>;
};

export type ResolutionWorkerExecution = {
  result: ResolutionWorkerResult;
  inputTokens: number;
  outputTokens: number;
  searchCount: number;
  estimatedExternalCostUsd: number;
};

export type ResolutionWorkerRunner = (
  method: ResolutionMethod,
  context: ResolutionWorkerContext,
) => Promise<ResolutionWorkerExecution>;

export type ResolutionAdvanceResult = {
  attempts: ResolutionAttempt[];
  executions: ResolutionWorkerExecution[];
  exhaustionCertificate: ExhaustionCertificate;
  resolvedInternally: boolean;
  activeMonitoring: boolean;
  stoppedForBudget: boolean;
  totalExternalCostUsd: number;
  nextMethod: ResolutionMethod | null;
};

const attemptedMethodSet = (attempts: ResolutionAttempt[]): Set<ResolutionMethod> =>
  new Set(
    attempts
      .filter((attempt) => attempt.status !== "NOT_ATTEMPTED" && attempt.status !== "RUNNING")
      .map((attempt) => attempt.method),
  );

export function nextResolutionMethod(
  problem: ResolutionProblem,
  attempts: ResolutionAttempt[],
): ResolutionMethod | null {
  if (attempts.some((attempt) => attempt.status === "ACTIVE_MONITORING")) return null;
  const attempted = attemptedMethodSet(attempts);
  const plan = createAutonomousResolutionPlan(problem);
  return plan.steps.find((step) => !attempted.has(step.method))?.method ?? null;
}

export function methodAllowsWebSearch(method: ResolutionMethod): boolean {
  return method === "DIRECT_RESEARCH" || method === "PROXY_RESEARCH";
}

export function buildResolutionWorkerSystemPrompt(method: ResolutionMethod): string {
  const shared = [
    "You are an autonomous opportunity-resolution worker for Money Scout.",
    "Your job is to resolve a specific uncertainty, not to invent reasons to stop.",
    "Missing evidence is not negative evidence.",
    "Do not promote a minor obstacle into a fatal blocker without affirmative support.",
    "Do not require exact pricing when a defensible paid range or bounded hypothesis can be derived.",
    "Preserve uncertainty explicitly. Never fabricate sources, prices, buyers, policies, or transaction evidence.",
    "A recommendation to KILL requires affirmative evidence that survives adversarial challenge, not merely lack of proof.",
    "If the question is resolvable by a reversible experiment, prefer PLAN_EXPERIMENT over human escalation.",
    "Human escalation is not available to you as a shortcut.",
  ];

  const methodInstruction: Record<ResolutionMethod, string> = {
    DIRECT_RESEARCH:
      "Search for primary or direct evidence that answers the unresolved question. Prefer official policy, visible pricing, transactions, budgeted jobs, named buyers, first-party operator statements, primary technical documentation, and observable commercial behavior.",
    PROXY_RESEARCH:
      "Search deliberately for indirect but economically relevant evidence: paid substitutes, service pricing, buyer budgets, labor costs, adjacent products, analogous workflows, procurement behavior, public complaints, switching behavior, and comparable marketplace activity. Do not repeat the direct-research search strategy.",
    ECONOMIC_INFERENCE:
      "Use existing evidence and prior attempts to derive defensible bounds. For pricing, reason from paid substitutes, value created, labor displaced, buyer budget, variable cost, and required margin. For distribution or demand, derive plausible economic ranges rather than falsely precise point estimates.",
    ADVERSARIAL_REVIEW:
      "Actively try to disprove the apparent obstacle and also try to disprove the optimistic interpretation. Identify where the current case relies on absence of evidence, weak proxies, correlated sources, stale facts, or unjustified inference. Resolve only if one side survives this challenge.",
    ALTERNATIVE_THESIS:
      "Test whether the validated economic opportunity survives under a different buyer, packaging, product shape, distribution path, workflow, or monetization model. Do not rescue a bad market with arbitrary feature creep.",
    SAFE_EXPERIMENT:
      "Design the cheapest reversible experiment that can settle the remaining uncertainty. Prefer zero-cost or negligible-cost tests, explicit falsification criteria, and no unauthorized external side effects. Do not propose vague 'get more feedback' steps.",
    WATCH_FOR_DELTA:
      "If time is genuinely the missing variable, define concrete observable signals that would change the decision. Monitoring must be specific enough for a future deterministic reconciler to detect material change without re-running generic research.",
  };

  return [...shared, methodInstruction[method]].join(" ");
}

const compactHistory = (attempts: ResolutionAttempt[]): string =>
  attempts.length
    ? attempts
        .map((attempt) => `${attempt.method}: ${attempt.status} - ${attempt.summary}`)
        .join("\n")
    : "No prior resolution attempts.";

const compactEvidence = (context: ResolutionWorkerContext): string => {
  const rows = context.evidence.slice(-60);
  if (!rows.length) return "No persisted evidence is available.";
  return rows
    .map(
      (item, index) =>
        `${index + 1}. [${item.classification}/${item.evaluationDimension}] ${item.claim} | ${item.sourceTitle} | ${item.sourceUrl} | ${item.observedDate}`,
    )
    .join("\n");
};

export function buildResolutionWorkerUserPrompt(
  method: ResolutionMethod,
  context: ResolutionWorkerContext,
): string {
  return `Resolution method: ${method}\nProblem: ${context.problem}\nUnresolved question: ${context.unresolvedQuestion}\n\nOpportunity\nName: ${context.opportunity.name}\nPlatform: ${context.opportunity.sourcePlatform}\nURL: ${context.opportunity.sourceUrl}\nType: ${context.opportunity.opportunityType}\nCurrent verdict: ${context.opportunity.verdict}\nThesis: ${context.opportunity.thesis}\n\nPrior resolution attempts\n${compactHistory(context.priorAttempts)}\n\nPersisted evidence\n${compactEvidence(context)}\n\nReturn a conservative structured result. Use RESOLVED only when this method actually settles the unresolved question well enough to change or preserve a decision. Use EXHAUSTED when this method has been genuinely attempted but cannot settle it. Use ACTIVE_MONITORING only for WATCH_FOR_DELTA when concrete future triggers are defined. Do not repeat prior attempts. If a bounded hypothesis or experiment is sufficient to continue autonomously, say so instead of asking for a human.`;
}

export function validateResolutionWorkerResult(
  method: ResolutionMethod,
  value: unknown,
): ResolutionWorkerResult {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Resolution worker returned no structured object");
  }
  const raw = value as Record<string, unknown>;
  const status = raw.status;
  const confidence = raw.confidence;
  const recommendation = raw.recommendation;
  const allowedStatuses = new Set(["RESOLVED", "EXHAUSTED", "ACTIVE_MONITORING"]);
  const allowedConfidence = new Set(["HIGH", "MEDIUM", "LOW"]);
  const allowedRecommendations = new Set<ResolutionRecommendation>([
    "CONTINUE_RESOLUTION",
    "RETURN_TO_RESEARCH",
    "RETURN_TO_VALIDATION",
    "PLAN_EXPERIMENT",
    "WATCH_FOR_DELTA",
    "BUILD_SUPPORTED",
    "KILL_SUPPORTED",
    "ESCALATE_IF_EXHAUSTED",
  ]);
  if (
    typeof status !== "string" ||
    !allowedStatuses.has(status) ||
    typeof raw.conclusion !== "string" ||
    typeof raw.rationale !== "string" ||
    typeof confidence !== "string" ||
    !allowedConfidence.has(confidence) ||
    typeof recommendation !== "string" ||
    !allowedRecommendations.has(recommendation as ResolutionRecommendation)
  ) {
    throw new Error("Resolution worker structured output failed validation");
  }
  if (status === "ACTIVE_MONITORING" && method !== "WATCH_FOR_DELTA") {
    throw new Error("Only WATCH_FOR_DELTA may enter ACTIVE_MONITORING");
  }

  const findings: ResolutionFinding[] = Array.isArray(raw.findings)
    ? raw.findings
        .filter((item): item is Record<string, unknown> => !!item && typeof item === "object" && !Array.isArray(item))
        .filter((item) => typeof item.claim === "string")
        .map((item): ResolutionFinding => {
          const classification: ResolutionFinding["classification"] =
            item.classification === "FACT" ||
            item.classification === "CLAIM" ||
            item.classification === "INFERENCE"
              ? item.classification
              : "UNKNOWN";
          return {
            claim: String(item.claim).trim().slice(0, 2_000),
            sourceUrl: typeof item.source_url === "string" && item.source_url.trim() ? item.source_url.trim() : null,
            sourceTitle: typeof item.source_title === "string" && item.source_title.trim() ? item.source_title.trim().slice(0, 500) : null,
            classification,
          };
        })
        .slice(0, 20)
    : [];

  const strings = (input: unknown, max: number): string[] =>
    Array.isArray(input)
      ? input
          .filter((item): item is string => typeof item === "string" && item.trim().length > 0)
          .map((item) => item.trim().slice(0, 1_000))
          .slice(0, max)
      : [];

  let experiment: ResolutionExperimentProposal = null;
  if (raw.experiment && typeof raw.experiment === "object" && !Array.isArray(raw.experiment)) {
    const exp = raw.experiment as Record<string, unknown>;
    if (
      typeof exp.type === "string" &&
      typeof exp.hypothesis === "string" &&
      typeof exp.success_signal === "string" &&
      typeof exp.failure_signal === "string"
    ) {
      experiment = {
        type: exp.type.slice(0, 120),
        hypothesis: exp.hypothesis.slice(0, 1_000),
        successSignal: exp.success_signal.slice(0, 1_000),
        failureSignal: exp.failure_signal.slice(0, 1_000),
      };
    }
  }

  const watchTriggers = strings(raw.watch_triggers, 12);
  if (status === "ACTIVE_MONITORING" && watchTriggers.length === 0) {
    throw new Error("ACTIVE_MONITORING requires at least one concrete watch trigger");
  }

  return {
    method,
    status: status as ResolutionWorkerResult["status"],
    conclusion: raw.conclusion.trim().slice(0, 3_000),
    rationale: raw.rationale.trim().slice(0, 4_000),
    confidence: confidence as ResolutionWorkerResult["confidence"],
    recommendation: recommendation as ResolutionRecommendation,
    findings,
    derivedBounds: strings(raw.derived_bounds, 12),
    watchTriggers,
    experiment,
    unresolvedQuestions: strings(raw.unresolved_questions, 12),
  };
}

const replaceAttempt = (
  attempts: ResolutionAttempt[],
  result: ResolutionWorkerResult,
): ResolutionAttempt[] => {
  const next = attempts.filter((attempt) => attempt.method !== result.method);
  next.push({ method: result.method, status: result.status, summary: result.conclusion });
  return next;
};

export async function executeAutonomousResolutionAdvance(input: {
  context: ResolutionWorkerContext;
  priorExternalCostUsd: number;
  runWorker: ResolutionWorkerRunner;
}): Promise<ResolutionAdvanceResult> {
  let attempts = [...input.context.priorAttempts];
  let totalExternalCostUsd = Number(input.priorExternalCostUsd.toFixed(4));
  const executions: ResolutionWorkerExecution[] = [];
  let stoppedForBudget = false;
  let resolvedInternally = attempts.some((attempt) => attempt.status === "RESOLVED");
  let activeMonitoring = attempts.some((attempt) => attempt.status === "ACTIVE_MONITORING");

  for (let step = 0; step < RESOLUTION_MAX_STEPS_PER_ADVANCE; step += 1) {
    if (resolvedInternally || activeMonitoring) break;
    const method = nextResolutionMethod(input.context.problem, attempts);
    if (!method) break;
    if (
      totalExternalCostUsd + RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD >
      RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD
    ) {
      stoppedForBudget = true;
      break;
    }

    const execution = await input.runWorker(method, {
      ...input.context,
      priorAttempts: attempts,
    });
    if (execution.estimatedExternalCostUsd < 0 || !Number.isFinite(execution.estimatedExternalCostUsd)) {
      throw new Error("Resolution worker returned an invalid external-cost estimate");
    }
    totalExternalCostUsd = Number((totalExternalCostUsd + execution.estimatedExternalCostUsd).toFixed(4));
    executions.push(execution);
    attempts = replaceAttempt(attempts, execution.result);

    if (execution.result.status === "RESOLVED") resolvedInternally = true;
    if (execution.result.status === "ACTIVE_MONITORING") activeMonitoring = true;
    if (totalExternalCostUsd >= RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD && !resolvedInternally && !activeMonitoring) {
      stoppedForBudget = true;
      break;
    }
  }

  const exhaustionCertificate = createExhaustionCertificate({
    problem: input.context.problem,
    unresolvedQuestion: input.context.unresolvedQuestion,
    attempts,
  });

  return {
    attempts,
    executions,
    exhaustionCertificate,
    resolvedInternally,
    activeMonitoring,
    stoppedForBudget,
    totalExternalCostUsd,
    nextMethod: nextResolutionMethod(input.context.problem, attempts),
  };
}
