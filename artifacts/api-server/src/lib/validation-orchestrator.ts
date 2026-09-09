import type { ResolutionProblem } from "./autonomous-resolution-engine";
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
  | "AUTONOMOUS_RESOLUTION_REQUIRED"
  | "BUILD_READY"
  | "WATCH"
  | "REJECTED"
  | "STOPPED";

export type ValidationNextAction =
  | "RUN_VALIDATION_EVIDENCE"
  | "PLAN_EXPERIMENT"
  | "RESOLVE_AUTONOMOUSLY"
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
  resolutionProblem: ResolutionProblem | null;
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
  resolutionProblem: ResolutionProblem | null = null,
): ValidationPlan => ({
  phase,
  nextAction,
  stopReason,
  resolutionProblem,
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

const resolve = (
  input: ValidationPlanInput,
  problem: ResolutionProblem,
  reason: string,
  result: ValidationResult | null = null,
): ValidationPlan => plan(
  input,
  "AUTONOMOUS_RESOLUTION_REQUIRED",
  "RESOLVE_AUTONOMOUSLY",
  reason,
  result,
  problem,
);

const planFromResult = (input: ValidationPlanInput, result: ValidationResult): ValidationPlan => {
  const mapping: Record<ValidationVerdict, () => ValidationPlan> = {
    BUILD_READY: () => plan(input, "BUILD_READY", "APPLY_BUILD", result.rationale, result),
    NEEDS_MORE_VALIDATION: () => plan(input, "NEEDS_MORE_VALIDATION", "PLAN_EXPERIMENT", result.rationale, result),
    WATCH: () => resolve(
      input,
      "VALIDATION_WATCH",
      `${result.rationale} WATCH is not terminal: autonomous resolution must exhaust research, inference, adversarial review, alternative-thesis analysis, and safe experiments before temporal monitoring is accepted.`,
      result,
    ),
    REJECT: () => resolve(
      input,
      "VALIDATION_REJECT_CHALLENGE",
      `${result.rationale} A model-generated rejection must be independently challenged before it can become a terminal KILL.`,
      result,
    ),
  };
  return mapping[result.verdict]();
};

export const determineValidationPlan = (input: ValidationPlanInput): ValidationPlan => {
  if (input.opportunityVerdict === "KILL") {
    return plan(input, "STOPPED", "STOP", "Opportunity is already killed.");
  }
  if (input.opportunityVerdict === "BUILD") {
    return plan(input, "BUILD_READY", "STOP", "Opportunity is already build-ready and promoted to BUILD.");
  }
  if (input.opportunityVerdict === "WATCH") {
    return resolve(
      input,
      "VALIDATION_WATCH",
      "Opportunity is on WATCH. Do not leave it parked indefinitely; autonomous resolution must determine whether new internal work can resolve it or whether explicit delta monitoring is the correct next state.",
    );
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
    return resolve(
      input,
      "VALIDATION_REJECT_CHALLENGE",
      `${result.rationale} Hard-negative prerequisites must be independently challenged before a reversible AI assessment is persisted as KILL.`,
      result,
    );
  }

  if (input.policyStatus !== "GREEN" || input.demandConclusion !== "SUPPORTED" || input.killScreenOverall !== "CLEAR") {
    return resolve(
      input,
      "VALIDATION_PREREQUISITE_REGRESSION",
      "Research prerequisites are no longer fully resolved. Autonomous resolution must explain the conflict and exhaust internal paths before owner review or additional spend.",
    );
  }

  if (input.evidenceRunStatus === "RUNNING") {
    return plan(input, "EVIDENCE_IN_PROGRESS", "STOP", "A validation evidence collection is already running.");
  }

  if (input.evidenceRunStatus === "FAILED") {
    return resolve(
      input,
      "VALIDATION_EVIDENCE_FAILURE",
      "The bounded validation evidence collection failed. No blind paid retry is allowed; autonomous resolution must determine whether existing evidence, proxy research, inference, or a safe experiment can resolve the uncertainty.",
    );
  }

  if (input.evidenceRunStatus === "NONE") {
    if (
      input.validationExternalCostUsd + VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD >
      VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD
    ) {
      return resolve(
        input,
        "VALIDATION_BUDGET_EXHAUSTED",
        "Insufficient validation budget remains for the bounded evidence stage. Exhaust zero-cost internal resolution before requesting additional capital.",
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
