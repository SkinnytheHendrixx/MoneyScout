export type ResolutionProblem =
  | "POLICY_AMBIGUITY"
  | "DEMAND_UNCERTAINTY"
  | "KILL_RISK_INCOMPLETE"
  | "RESEARCH_BUDGET_EXHAUSTED"
  | "VALIDATION_PREREQUISITE_REGRESSION"
  | "VALIDATION_EVIDENCE_FAILURE"
  | "VALIDATION_BUDGET_EXHAUSTED"
  | "VALIDATION_WATCH"
  | "COMMERCIAL_BUYER_UNRESOLVED"
  | "COMMERCIAL_PRICING_UNRESOLVED"
  | "COMMERCIAL_DISTRIBUTION_UNRESOLVED";

export type ResolutionMethod =
  | "DIRECT_RESEARCH"
  | "PROXY_RESEARCH"
  | "ECONOMIC_INFERENCE"
  | "ADVERSARIAL_REVIEW"
  | "ALTERNATIVE_THESIS"
  | "SAFE_EXPERIMENT"
  | "WATCH_FOR_DELTA";

export type ResolutionAttemptStatus =
  | "NOT_ATTEMPTED"
  | "RUNNING"
  | "RESOLVED"
  | "EXHAUSTED"
  | "NOT_APPLICABLE"
  | "ACTIVE_MONITORING";

export type HumanEscalationType =
  | "CAPITAL_APPROVAL"
  | "EXTERNAL_SIDE_EFFECT_APPROVAL"
  | "TRUE_JUDGMENT";

export type ResolutionStep = {
  order: number;
  method: ResolutionMethod;
  objective: string;
  requiredBeforeHumanEscalation: boolean;
  mayUseExternalPaidResearch: boolean;
};

export type ResolutionAttempt = {
  method: ResolutionMethod;
  status: ResolutionAttemptStatus;
  summary: string;
};

export type AutonomousResolutionPlan = {
  schemaVersion: 1;
  problem: ResolutionProblem;
  objective: string;
  governingRules: string[];
  steps: ResolutionStep[];
  defaultNextMethod: ResolutionMethod;
  humanEscalationEligible: false;
  humanEscalationRule: string;
};

export type ExhaustionCertificate = {
  schemaVersion: 1;
  problem: ResolutionProblem;
  issued: boolean;
  humanEscalationEligible: boolean;
  escalationType: HumanEscalationType | null;
  unresolvedQuestion: string;
  completedMethods: ResolutionMethod[];
  exhaustedMethods: ResolutionMethod[];
  activeMethods: ResolutionMethod[];
  blockingMethods: ResolutionMethod[];
  reason: string;
};

const objectiveFor = (problem: ResolutionProblem): string => {
  switch (problem) {
    case "POLICY_AMBIGUITY":
      return "Resolve whether the opportunity is actually prohibited, conditionally permitted, or safely executable without treating vague language as a fatal block.";
    case "DEMAND_UNCERTAINTY":
      return "Determine whether buyer demand is economically meaningful using direct and proxy evidence before parking the opportunity on WATCH.";
    case "KILL_RISK_INCOMPLETE":
      return "Resolve each remaining fatal-risk hypothesis and distinguish confirmed blockers from merely unproven concerns.";
    case "RESEARCH_BUDGET_EXHAUSTED":
      return "Use zero-cost reasoning, existing evidence, proxy analysis, and safe experiments before requesting more research capital.";
    case "VALIDATION_PREREQUISITE_REGRESSION":
      return "Explain and resolve the conflict between current research prerequisites and the validation state before escalating.";
    case "VALIDATION_EVIDENCE_FAILURE":
      return "Determine whether the failed evidence run is a tooling failure, evidence gap, or thesis problem without blindly retrying paid work.";
    case "VALIDATION_BUDGET_EXHAUSTED":
      return "Resolve remaining underwriting uncertainty with existing evidence, inference, and safe experiments before requesting more capital.";
    case "VALIDATION_WATCH":
      return "Determine whether WATCH is truly the correct temporal outcome or whether additional internal reasoning can reach BUILD, experiment, or REJECT.";
    case "COMMERCIAL_BUYER_UNRESOLVED":
      return "Infer or bound the first paying buyer from validated evidence, adjacent buyers, workflows, and purchase authority before human escalation.";
    case "COMMERCIAL_PRICING_UNRESOLVED":
      return "Derive a defensible monetization hypothesis from direct prices, paid substitutes, buyer budgets, economic value, labor displacement, and unit economics before requiring an exact observed price.";
    case "COMMERCIAL_DISTRIBUTION_UNRESOLVED":
      return "Identify the narrowest evidenced acquisition path from marketplace access, buyer concentration, adjacent channels, and switching behavior before human escalation.";
  }
};

const economicInferenceApplicable = (problem: ResolutionProblem): boolean =>
  problem !== "POLICY_AMBIGUITY" && problem !== "KILL_RISK_INCOMPLETE";

const alternativeThesisApplicable = (problem: ResolutionProblem): boolean =>
  problem !== "VALIDATION_EVIDENCE_FAILURE" && problem !== "RESEARCH_BUDGET_EXHAUSTED" && problem !== "VALIDATION_BUDGET_EXHAUSTED";

const watchApplicable = (problem: ResolutionProblem): boolean =>
  problem === "DEMAND_UNCERTAINTY" ||
  problem === "VALIDATION_WATCH" ||
  problem === "COMMERCIAL_BUYER_UNRESOLVED" ||
  problem === "COMMERCIAL_PRICING_UNRESOLVED" ||
  problem === "COMMERCIAL_DISTRIBUTION_UNRESOLVED";

export function createAutonomousResolutionPlan(problem: ResolutionProblem): AutonomousResolutionPlan {
  const raw: Array<Omit<ResolutionStep, "order"> | null> = [
    {
      method: "DIRECT_RESEARCH",
      objective: "Search specifically for primary evidence that directly answers the unresolved question.",
      requiredBeforeHumanEscalation: true,
      mayUseExternalPaidResearch: true,
    },
    {
      method: "PROXY_RESEARCH",
      objective: "Search adjacent evidence such as paid substitutes, comparable buyers, neighboring markets, public complaints, service pricing, procurement behavior, or analogous platform activity.",
      requiredBeforeHumanEscalation: true,
      mayUseExternalPaidResearch: true,
    },
    economicInferenceApplicable(problem)
      ? {
          method: "ECONOMIC_INFERENCE",
          objective: "Use the accumulated evidence to derive defensible bounds rather than requiring a falsely precise observed answer.",
          requiredBeforeHumanEscalation: true,
          mayUseExternalPaidResearch: false,
        }
      : null,
    {
      method: "ADVERSARIAL_REVIEW",
      objective: "Actively challenge the obstacle, search for contrary evidence, and test whether absence of proof is being mistaken for proof of failure.",
      requiredBeforeHumanEscalation: true,
      mayUseExternalPaidResearch: false,
    },
    alternativeThesisApplicable(problem)
      ? {
          method: "ALTERNATIVE_THESIS",
          objective: "Test whether a different buyer, packaging, product shape, distribution path, or monetization model preserves the validated economic opportunity.",
          requiredBeforeHumanEscalation: true,
          mayUseExternalPaidResearch: false,
        }
      : null,
    {
      method: "SAFE_EXPERIMENT",
      objective: "Choose the cheapest reversible experiment that can resolve the remaining uncertainty without unauthorized side effects or blind paid retries.",
      requiredBeforeHumanEscalation: true,
      mayUseExternalPaidResearch: false,
    },
    watchApplicable(problem)
      ? {
          method: "WATCH_FOR_DELTA",
          objective: "If the answer genuinely depends on time, define the exact external signals that would change the decision and monitor those signals instead of repeating the same research.",
          requiredBeforeHumanEscalation: true,
          mayUseExternalPaidResearch: false,
        }
      : null,
  ];

  const steps = raw.filter((step): step is Omit<ResolutionStep, "order"> => step != null)
    .map((step, index) => ({ ...step, order: index + 1 }));

  return {
    schemaVersion: 1,
    problem,
    objective: objectiveFor(problem),
    governingRules: [
      "Missing evidence is not negative evidence.",
      "A small obstacle must not be promoted to a fatal blocker without affirmative support.",
      "Exact pricing is not required when a defensible paid range or bounded pricing hypothesis can be derived.",
      "Prefer internally resolvable reasoning or experiments over human review.",
      "Do not repeat the same paid research merely because the previous result was inconclusive.",
      "Human escalation is forbidden until every applicable internal resolution method is resolved, exhausted, or not applicable.",
    ],
    steps,
    defaultNextMethod: steps[0].method,
    humanEscalationEligible: false,
    humanEscalationRule: "An Exhaustion Certificate must be issued before any knowledge-gap escalation can reach the owner. Capital approval and irreversible external side-effect approval remain separate owner decisions.",
  };
}

export function createExhaustionCertificate(input: {
  problem: ResolutionProblem;
  unresolvedQuestion: string;
  attempts: ResolutionAttempt[];
  requestedEscalationType?: HumanEscalationType;
}): ExhaustionCertificate {
  const plan = createAutonomousResolutionPlan(input.problem);
  const attemptsByMethod = new Map(input.attempts.map((attempt) => [attempt.method, attempt]));
  const required = plan.steps.filter((step) => step.requiredBeforeHumanEscalation);
  const blockingMethods: ResolutionMethod[] = [];
  const activeMethods: ResolutionMethod[] = [];
  const completedMethods: ResolutionMethod[] = [];
  const exhaustedMethods: ResolutionMethod[] = [];
  let resolvedInternally = false;

  for (const step of required) {
    const attempt = attemptsByMethod.get(step.method);
    if (!attempt || attempt.status === "NOT_ATTEMPTED" || attempt.status === "RUNNING") {
      blockingMethods.push(step.method);
      continue;
    }
    if (attempt.status === "ACTIVE_MONITORING") {
      activeMethods.push(step.method);
      continue;
    }
    if (attempt.status === "RESOLVED") {
      completedMethods.push(step.method);
      resolvedInternally = true;
      continue;
    }
    if (attempt.status === "EXHAUSTED" || attempt.status === "NOT_APPLICABLE") {
      exhaustedMethods.push(step.method);
    }
  }

  const issued = !resolvedInternally && blockingMethods.length === 0 && activeMethods.length === 0;
  const requested = input.requestedEscalationType ?? "TRUE_JUDGMENT";

  return {
    schemaVersion: 1,
    problem: input.problem,
    issued,
    humanEscalationEligible: issued,
    escalationType: issued ? requested : null,
    unresolvedQuestion: input.unresolvedQuestion,
    completedMethods,
    exhaustedMethods,
    activeMethods,
    blockingMethods,
    reason: resolvedInternally
      ? "Internal resolution succeeded; human escalation is not permitted."
      : blockingMethods.length > 0
        ? `Human escalation is blocked because required internal methods remain unattempted or incomplete: ${blockingMethods.join(", ")}.`
        : activeMethods.length > 0
          ? `Human escalation is blocked while temporal monitoring remains active: ${activeMethods.join(", ")}.`
          : "Every applicable internal resolution method is exhausted or not applicable; human escalation may now be considered.",
  };
}
