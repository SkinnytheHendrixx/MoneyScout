import assert from "node:assert/strict";
import {
  determineValidationPlan,
  executeValidationWorkflow,
  VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD,
  VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD,
  type ValidationPlan,
} from "../src/lib/validation-orchestrator";
import {
  UNDERWRITING_FACTORS,
  type EvidenceConfidence,
  type FactorStrength,
  type UnderwritingAssessment,
} from "../src/lib/validation-engine";

const quality = (confidence: EvidenceConfidence = "MEDIUM") => ({
  confidence,
  directness: "MEDIUM" as const,
  sourceAuthority: "MEDIUM" as const,
  independence: "MEDIUM" as const,
  recency: "UNKNOWN" as const,
  sampleAdequacy: "MEDIUM" as const,
  consistency: "HIGH" as const,
  strongestClassification: "FACT" as const,
  evidenceCount: 2,
  contradictionCount: 0,
});

const assessments = (
  strength: FactorStrength = "ADEQUATE",
  confidence: EvidenceConfidence = "MEDIUM",
): UnderwritingAssessment[] => UNDERWRITING_FACTORS.map((factor) => ({
  factor,
  strength,
  evidenceQuality: quality(confidence),
}));

const base = {
  opportunityVerdict: "TEST",
  policyStatus: "GREEN",
  demandConclusion: "SUPPORTED",
  killScreenOverall: "CLEAR" as const,
  validationExternalCostUsd: 0,
};

assert.equal(VALIDATION_TOTAL_EXTERNAL_COST_CEILING_USD, 0.5);
assert.equal(VALIDATION_STAGE_EXTERNAL_COST_CEILING_USD, 0.5);

const notEligible = determineValidationPlan({
  ...base,
  opportunityVerdict: "RESEARCH",
  evidenceRunStatus: "NONE",
  assessments: [],
});
assert.equal(notEligible.phase, "NOT_ELIGIBLE");
assert.equal(notEligible.nextAction, "STOP");
assert.equal(notEligible.automaticExternalCallsEnabled, false);

const collect = determineValidationPlan({
  ...base,
  evidenceRunStatus: "NONE",
  assessments: [],
});
assert.equal(collect.phase, "EVIDENCE_REQUIRED");
assert.equal(collect.nextAction, "RUN_VALIDATION_EVIDENCE");
assert.equal(collect.automaticExternalCallsEnabled, true);

const failed = determineValidationPlan({
  ...base,
  evidenceRunStatus: "FAILED",
  assessments: [],
});
assert.equal(failed.phase, "NEEDS_MORE_VALIDATION");
assert.equal(failed.nextAction, "HUMAN_REVIEW");
assert.equal(failed.automaticExternalCallsEnabled, false);

const buildReady = determineValidationPlan({
  ...base,
  validationExternalCostUsd: 0.32,
  evidenceRunStatus: "COMPLETED",
  assessments: assessments(),
});
assert.equal(buildReady.phase, "BUILD_READY");
assert.equal(buildReady.nextAction, "APPLY_BUILD");
assert.equal(buildReady.result?.verdict, "BUILD_READY");

const weakAssessments = assessments();
weakAssessments[4] = { ...weakAssessments[4], strength: "WEAK" };
const watch = determineValidationPlan({
  ...base,
  evidenceRunStatus: "COMPLETED",
  assessments: weakAssessments,
});
assert.equal(watch.phase, "WATCH");
assert.equal(watch.nextAction, "APPLY_WATCH");

const blockedAssessments = assessments();
blockedAssessments[10] = { ...blockedAssessments[10], strength: "BLOCKING" };
const reject = determineValidationPlan({
  ...base,
  evidenceRunStatus: "COMPLETED",
  assessments: blockedAssessments,
});
assert.equal(reject.phase, "REJECTED");
assert.equal(reject.nextAction, "APPLY_REJECT");

const lowConfidenceAssessments = assessments();
lowConfidenceAssessments[7] = {
  ...lowConfidenceAssessments[7],
  evidenceQuality: quality("LOW"),
};
const needsMore = determineValidationPlan({
  ...base,
  evidenceRunStatus: "COMPLETED",
  assessments: lowConfidenceAssessments,
});
assert.equal(needsMore.phase, "NEEDS_MORE_VALIDATION");
assert.equal(needsMore.nextAction, "HUMAN_REVIEW");
assert.equal(needsMore.automaticExternalCallsEnabled, false);

const fatalGate = determineValidationPlan({
  ...base,
  killScreenOverall: "BLOCKED",
  evidenceRunStatus: "NONE",
  assessments: [],
});
assert.equal(fatalGate.phase, "REJECTED");
assert.equal(fatalGate.nextAction, "APPLY_REJECT");
assert.equal(fatalGate.automaticExternalCallsEnabled, false);

let paidCalls = 0;
let readCount = 0;
const afterCollection: ValidationPlan = determineValidationPlan({
  ...base,
  validationExternalCostUsd: 0.22,
  evidenceRunStatus: "COMPLETED",
  assessments: assessments(),
});
const execution = await executeValidationWorkflow({
  readPlan: async () => {
    readCount += 1;
    return readCount === 1 ? collect : afterCollection;
  },
  runValidationEvidence: async () => {
    paidCalls += 1;
  },
});
assert.equal(paidCalls, 1);
assert.equal(execution.evidenceCollectionExecuted, true);
assert.equal(execution.finalPlan.phase, "BUILD_READY");

let failedRetryCalls = 0;
const failedExecution = await executeValidationWorkflow({
  readPlan: async () => failed,
  runValidationEvidence: async () => {
    failedRetryCalls += 1;
  },
});
assert.equal(failedRetryCalls, 0);
assert.equal(failedExecution.evidenceCollectionExecuted, false);
assert.equal(failedExecution.finalPlan.phase, "NEEDS_MORE_VALIDATION");

console.log("PASS zero-cost validation orchestrator");
