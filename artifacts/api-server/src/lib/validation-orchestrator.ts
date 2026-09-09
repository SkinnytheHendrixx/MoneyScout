import {
  evaluateValidation,
  type KillScreenOverall,
  type UnderwritingAssessment,
  type ValidationResult,
  type ValidationVerdict,
} from "./validation-engine";

export const VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD = 0.5;
export const VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD = 0.5;

export type ValidationEvidenceRunStatus = "NONE" | "RUNNING" | "COMPLETED" | "FAILED";

export type ValidationPhase =
  | "NOT_ELIGIBLE"
  | "EVIDENCE_REQUIRED"
  | "EVIDENCE_IN_PROGRESS"
  | "NEEDS_MORE_VALIDATION"
  | "BUILD_READY"
  | "WATCH"
  | "REJECTED"
  | "STOPPED";

export type ValidationNextAction =
  | "RUN_VALIDATION_EVIDENCE"
  | "PLAN_EXPERIMENT"
  | "HUMAN_REVIEW"
  | "APPLY_BUILD"
  | "APPLY_WATCH"
  | "APPLY_REJECT"
  | "STOP";

export type ValidationPlanInput = {
  opportunityVerdict: string;
  policyStatus: string | null;
  demandConclusion: string | null;
  killScreenOverall: KillScreenOverall | null;
  evidenceRunStatus: ValidationEvidenceRunStatus;
  validationExternalCostUsd: number;
  assessments: UnderwritingAssessment[];
};

export type ValidationPlan = {
  phase: ValidationPhase;
  nextAction: ValidationNextAction;
  stopReason: string | null;
  automaticExternalCallsEnabled: boolean;
  validationExternalCostUsd: number;
  totalExternalCostCeilingUsd: number;
  remainingExternalBudgetUsd: number;
  stageExternalCostCeilingUsd: number;
  result: ValidationResult | null;
};

const plan = (
  input: ValidationPlanInput,
  phase: ValidationPhase,
  nextAction: ValidationNextAction,
  stopReason: string | null = null,
  result: ValidationResult | null = null,
): ValidationPlan => ({
  phase,
  nextAction,
  stopReason,
  automaticExternalCallsEnabled: nextAction === "RUN_VALIDATION_EVIDENCE",
  validationExternalCostUsd: input.validationExternalCostUsd,
  totalExternalCostCeilingUsd: VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD,
  remainingExternalBudgetUsd: Math.max(
    0,
    Number((VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD - input.validationExternalCostUsd).toFixed(4)),
  ),
  stageExternalCostCeilingUsd: VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD,
  result,
});

const planFromResult = (input: ValidationPlanInput, result: ValidationResult): ValidationPlan => {
  const mapping: Record<ValidationVerdict, { phase: ValidationPhase; action: ValidationNextAction }> = {
    BUILD_READY: { phase: "BUILD_READY", action: "APPLY_BUILD" },
    WATCH: { phase: "WATCH", action: "APPLY_WATCH" },
    REJECT: { phase: "REJECTED", action: "APPLY_REJECT" },
    NEEDS_MORE_VALIDATION: { phase: "NEEDS_MORE_VALIDATION", action: "PLAN_EXPERIMENT" },
  };
  const mapped = mapping[result.verdict];
  return plan(input, mapped.phase, mapped.action, result.rationale, result);
};

export const determineValidationPlan = (input: ValidationPlanInput): ValidationPlan => {
  if (input.opportunityVerdict === "KILL") {
    return plan(input, "STOPPED", "STOP", "Opportunity is already killed.");
  }
  if (input.opportunityVerdict === "BUILD") {
    return plan(input, "BUILD_READY", "STOP", "Opportunity is already build-ready and promoted to BUILD.");
  }
  if (input.opportunityVerdict === "WATCH") {
    return plan(input, "WATCH", "STOP", "Opportunity is already on WATCH.");
  }
  if (input.opportunityVerdict !== "TEST") {
    return plan(input, "NOT_ELIGIBLE", "STOP", "Validation orchestration requires a TEST opportunity.");
  }

  if (input.policyStatus === "RED" || input.demandConclusion === "UNSUPPORTED" || input.killScreenOverall === "BLOCKED") {
    const result = evaluateValidation({
      opportunityVerdict: input.opportunityVerdict,
      policyStatus: input.policyStatus ?? "UNKNOWN",
      demandConclusion: input.demandConclusion,
      killScreenOverall: input.killScreenOverall ?? "INCOMPLETE",
      assessments: input.assessments,
    });
    return plan(input, "REJECTED", "APPLY_REJECT", result.rationale, result);
  }

  if (input.policyStatus !== "GREEN" || input.demandConclusion !== "SUPPORTED" || input.killScreenOverall !== "CLEAR") {
    return plan(
      input,
      "NEEDS_MORE_VALIDATION",
      "HUMAN_REVIEW",
      "Research prerequisites are no longer fully resolved; no validation spend is permitted until GREEN policy, SUPPORTED demand, and a CLEAR kill screen are restored.",
    );
  }

  if (input.evidenceRunStatus === "RUNNING") {
    return plan(input, "EVIDENCE_IN_PROGRESS", "STOP", "A validation evidence collection is already running.");
  }

  if (input.evidenceRunStatus === "FAILED") {
    return plan(
      input,
      "NEEDS_MORE_VALIDATION",
      "HUMAN_REVIEW",
      "The bounded validation evidence collection failed. No automatic retry is allowed because the failed attempt may already have incurred external cost.",
    );
  }

  if (input.evidenceRunStatus === "NONE") {
    if (
      input.validationExternalCostUsd + VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD >
      VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD
    ) {
      return plan(
        input,
        "NEEDS_MORE_VALIDATION",
        "HUMAN_REVIEW",
        "Insufficient validation budget remains for the single bounded evidence-collection stage.",
      );
    }
    return plan(input, "EVIDENCE_REQUIRED", "RUN_VALIDATION_EVIDENCE");
  }

  return planFromResult(
    input,
    evaluateValidation({
      opportunityVerdict: input.opportunityVerdict,
      policyStatus: input.policyStatus,
      demandConclusion: input.demandConclusion,
      killScreenOverall: input.killScreenOverall,
      assessments: input.assessments,
    }),
  );
};

export type ValidationExecutionResult = {
  evidenceCollectionExecuted: boolean;
  finalPlan: ValidationPlan;
};

export type ValidationExecutionDependencies = {
  readPlan: () => Promise<ValidationPlan>;
  runValidationEvidence: () => Promise<void>;
};

export async function executeValidationWorkflow(
  dependencies: ValidationExecutionDependencies,
): Promise<ValidationExecutionResult> {
  let plan = await dependencies.readPlan();
  let evidenceCollectionExecuted = false;

  if (plan.nextAction === "RUN_VALIDATION_EVIDENCE" && plan.automaticExternalCallsEnabled) {
    await dependencies.runValidationEvidence();
    evidenceCollectionExecuted = true;
    plan = await dependencies.readPlan();
  }

  return { evidenceCollectionExecuted, finalPlan: plan };
}
