export const RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD = 1.5;
export const RESEARCH_STAGE_EXTERNAL_COST_CEILING_USD = 0.5;

export type ResearchPolicyStatus = "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | null;
export type ResearchDemandConclusion = "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN" | null;
export type ResearchKillRiskOutcome = "CLEAR" | "BLOCKED" | "INCOMPLETE" | null;

export type ResearchPhase =
  | "POLICY_REQUIRED"
  | "DEMAND_REQUIRED"
  | "KILL_RISK_REQUIRED"
  | "HUMAN_REVIEW_REQUIRED"
  | "KILL_RISK_REVIEW_REQUIRED"
  | "WATCH"
  | "VALIDATION_READY"
  | "REJECTED"
  | "BUDGET_EXHAUSTED"
  | "STOPPED";

export type ResearchNextAction =
  | "RUN_POLICY_CHECK"
  | "RUN_DEMAND_CHECK"
  | "RUN_KILL_RISK_CHECK"
  | "HUMAN_POLICY_REVIEW"
  | "HUMAN_KILL_RISK_REVIEW"
  | "WATCH_FOR_MORE_EVIDENCE"
  | "VALIDATE_OPPORTUNITY"
  | "STOP";

export type ResearchPlanInput = {
  opportunityVerdict: string;
  policyStatus: ResearchPolicyStatus;
  demandConclusion: ResearchDemandConclusion;
  killRiskOutcome: ResearchKillRiskOutcome;
  externalCostUsd: number;
};

export type ResearchPlan = {
  phase: ResearchPhase;
  nextAction: ResearchNextAction;
  stopReason: string | null;
  automaticExternalCallsEnabled: boolean;
  externalCostUsd: number;
  totalExternalCostCeilingUsd: number;
  remainingExternalBudgetUsd: number;
  stageExternalCostCeilingUsd: number;
};

const plan = (
  input: ResearchPlanInput,
  phase: ResearchPhase,
  nextAction: ResearchNextAction,
  stopReason: string | null = null,
): ResearchPlan => ({
  phase,
  nextAction,
  stopReason,
  automaticExternalCallsEnabled:
    nextAction === "RUN_POLICY_CHECK" ||
    nextAction === "RUN_DEMAND_CHECK" ||
    nextAction === "RUN_KILL_RISK_CHECK",
  externalCostUsd: input.externalCostUsd,
  totalExternalCostCeilingUsd: RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD,
  remainingExternalBudgetUsd: Math.max(
    0,
    Number((RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD - input.externalCostUsd).toFixed(4)),
  ),
  stageExternalCostCeilingUsd: RESEARCH_STAGE_EXTERNAL_COST_CEILING_USD,
});

export const determineResearchPlan = (input: ResearchPlanInput): ResearchPlan => {
  if (input.opportunityVerdict === "KILL") {
    return plan(input, "STOPPED", "STOP", "Opportunity is already killed.");
  }

  if (input.externalCostUsd >= RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD) {
    return plan(
      input,
      "BUDGET_EXHAUSTED",
      "STOP",
      "Research external-service budget is exhausted; no automatic paid retry is allowed.",
    );
  }

  if (input.policyStatus === "RED") {
    return plan(input, "REJECTED", "STOP", "Policy review found a clear blocking conflict.");
  }

  if (input.policyStatus === null) {
    return plan(input, "POLICY_REQUIRED", "RUN_POLICY_CHECK");
  }

  if (input.policyStatus === "UNKNOWN" || input.policyStatus === "YELLOW") {
    return plan(
      input,
      "HUMAN_REVIEW_REQUIRED",
      "HUMAN_POLICY_REVIEW",
      input.policyStatus === "UNKNOWN"
        ? "Policy evidence is unresolved; do not spend again automatically."
        : "Policy constraints require human review before deeper validation.",
    );
  }

  if (input.demandConclusion === null) {
    return plan(input, "DEMAND_REQUIRED", "RUN_DEMAND_CHECK");
  }

  if (input.demandConclusion === "UNSUPPORTED") {
    return plan(input, "REJECTED", "STOP", "Demand Check found affirmative evidence against the thesis.");
  }

  if (input.demandConclusion === "WEAK" || input.demandConclusion === "UNKNOWN") {
    return plan(
      input,
      "WATCH",
      "WATCH_FOR_MORE_EVIDENCE",
      input.demandConclusion === "WEAK"
        ? "Demand evidence exists but a major gap remains; do not auto-retry paid research."
        : "Demand remains unresolved; wait for new evidence rather than repeating the same paid check.",
    );
  }

  if (input.killRiskOutcome === null) {
    if (input.externalCostUsd + RESEARCH_STAGE_EXTERNAL_COST_CEILING_USD > RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD) {
      return plan(
        input,
        "BUDGET_EXHAUSTED",
        "STOP",
        "Insufficient remaining research budget for the bounded kill-risk stage.",
      );
    }
    return plan(input, "KILL_RISK_REQUIRED", "RUN_KILL_RISK_CHECK");
  }

  if (input.killRiskOutcome === "BLOCKED") {
    return plan(input, "REJECTED", "STOP", "Kill-risk screen found a confirmed fatal risk.");
  }

  if (input.killRiskOutcome === "INCOMPLETE") {
    return plan(
      input,
      "KILL_RISK_REVIEW_REQUIRED",
      "HUMAN_KILL_RISK_REVIEW",
      "One or more fatal-risk classes remain unresolved after the bounded kill-risk collection; do not auto-retry.",
    );
  }

  return plan(input, "VALIDATION_READY", "VALIDATE_OPPORTUNITY");
};
