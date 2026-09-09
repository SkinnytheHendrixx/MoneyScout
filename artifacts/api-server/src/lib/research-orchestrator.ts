import type { ResolutionProblem } from "./autonomous-resolution-engine";

export const RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD = 1.5;
export const RESEARCH_STAGE_EXTERNAL_COST_CEILING_USD = 0.5;

export type ResearchPolicyStatus = "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | null;
export type ResearchDemandConclusion = "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN" | null;
export type ResearchKillRiskOutcome = "CLEAR" | "BLOCKED" | "INCOMPLETE" | null;

export type ResearchPhase =
  | "POLICY_REQUIRED"
  | "DEMAND_REQUIRED"
  | "KILL_RISK_REQUIRED"
  | "AUTONOMOUS_RESOLUTION_REQUIRED"
  | "WATCH"
  | "VALIDATION_READY"
  | "REJECTED"
  | "BUDGET_EXHAUSTED"
  | "STOPPED";

export type ResearchNextAction =
  | "RUN_POLICY_CHECK"
  | "RUN_DEMAND_CHECK"
  | "RUN_KILL_RISK_CHECK"
  | "RESOLVE_AUTONOMOUSLY"
  | "REGISTER_WATCH"
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
  resolutionProblem: ResolutionProblem | null;
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
  resolutionProblem: ResolutionProblem | null = null,
): ResearchPlan => ({
  phase,
  nextAction,
  stopReason,
  resolutionProblem,
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

const resolve = (
  input: ResearchPlanInput,
  problem: ResolutionProblem,
  reason: string,
): ResearchPlan => plan(
  input,
  "AUTONOMOUS_RESOLUTION_REQUIRED",
  "RESOLVE_AUTONOMOUSLY",
  reason,
  problem,
);

export const determineResearchPlan = (input: ResearchPlanInput): ResearchPlan => {
  if (input.opportunityVerdict === "KILL") {
    return plan(input, "STOPPED", "STOP", "Opportunity is already killed.");
  }

  if (input.externalCostUsd >= RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD) {
    return resolve(
      input,
      "RESEARCH_BUDGET_EXHAUSTED",
      "The bounded paid-research budget is exhausted. Exhaustion of a research budget is not proof that the opportunity failed; zero-cost internal resolution must run before owner escalation.",
    );
  }

  if (input.policyStatus === null) {
    return plan(input, "POLICY_REQUIRED", "RUN_POLICY_CHECK");
  }

  if (input.policyStatus !== "GREEN") {
    return resolve(
      input,
      "POLICY_AMBIGUITY",
      input.policyStatus === "RED"
        ? "The first policy pass found a blocking conflict. Before treating it as fatal, autonomous resolution must verify the primary rule, search exceptions and adjacent interpretations, challenge the blocker, and test alternative product shapes when applicable."
        : "Policy evidence is ambiguous or incomplete. Do not convert ambiguity into owner homework or a fatal verdict until autonomous resolution is exhausted.",
    );
  }

  if (input.demandConclusion === null) {
    return plan(input, "DEMAND_REQUIRED", "RUN_DEMAND_CHECK");
  }

  if (input.demandConclusion !== "SUPPORTED") {
    return resolve(
      input,
      "DEMAND_UNCERTAINTY",
      input.demandConclusion === "UNSUPPORTED"
        ? "The first demand pass found evidence against the thesis. Autonomous resolution must adversarially verify that conclusion, inspect paid substitutes and adjacent demand, test alternate buyers or packaging, and select a cheap falsifying experiment before rejection."
        : "Demand is weak or unresolved. Run direct and proxy research, inference, adversarial review, alternative-thesis analysis, and safe experiments before WATCH or human escalation.",
    );
  }

  if (input.killRiskOutcome === null) {
    if (input.externalCostUsd + RESEARCH_STAGE_EXTERNAL_COST_CEILING_USD > RESEARCH_TOTAL_EXTERNAL_COST_CEILING_USD) {
      return resolve(
        input,
        "RESEARCH_BUDGET_EXHAUSTED",
        "Insufficient paid-research budget remains for the bounded kill-risk stage. Use autonomous zero-cost resolution before requesting more capital.",
      );
    }
    return plan(input, "KILL_RISK_REQUIRED", "RUN_KILL_RISK_CHECK");
  }

  if (input.killRiskOutcome !== "CLEAR") {
    return resolve(
      input,
      "KILL_RISK_INCOMPLETE",
      input.killRiskOutcome === "BLOCKED"
        ? "A fatal-risk worker reported a blocker. Because false-positive kill decisions are costly, autonomous resolution must independently challenge and verify the claimed fatal condition before the opportunity can be rejected."
        : "One or more fatal-risk classes remain unresolved. Exhaust internal research and reasoning before owner escalation.",
    );
  }

  return plan(input, "VALIDATION_READY", "VALIDATE_OPPORTUNITY");
};
