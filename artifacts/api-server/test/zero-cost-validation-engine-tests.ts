import assert from "node:assert/strict";
import {
  evaluateValidation,
  UNDERWRITING_FACTORS,
  type EvidenceConfidence,
  type FactorStrength,
  type UnderwritingAssessment,
} from "../src/lib/validation-engine";

const quality = (confidence: EvidenceConfidence = "HIGH") => ({
  confidence,
  directness: confidence,
  sourceAuthority: confidence,
  independence: confidence,
  recency: confidence,
  sampleAdequacy: confidence,
  consistency: confidence,
  strongestClassification: "FACT" as const,
  evidenceCount: 3,
  contradictionCount: 0,
});

const assessments = (
  strength: FactorStrength = "ADEQUATE",
  confidence: EvidenceConfidence = "HIGH",
): UnderwritingAssessment[] =>
  UNDERWRITING_FACTORS.map((factor) => ({ factor, strength, evidenceQuality: quality(confidence) }));

const eligible = {
  opportunityVerdict: "TEST",
  policyStatus: "GREEN",
  demandConclusion: "SUPPORTED",
  killScreenOverall: "CLEAR" as const,
};

assert.equal(evaluateValidation({ ...eligible, assessments: assessments() }).verdict, "BUILD_READY");
assert.equal(
  evaluateValidation({ ...eligible, opportunityVerdict: "RESEARCH", assessments: assessments() }).verdict,
  "NEEDS_MORE_VALIDATION",
);
assert.equal(
  evaluateValidation({ ...eligible, killScreenOverall: "INCOMPLETE", assessments: assessments() }).verdict,
  "NEEDS_MORE_VALIDATION",
);
assert.equal(
  evaluateValidation({ ...eligible, killScreenOverall: "BLOCKED", assessments: assessments() }).verdict,
  "REJECT",
);

const missing = assessments().slice(0, 10);
const missingResult = evaluateValidation({ ...eligible, assessments: missing });
assert.equal(missingResult.verdict, "NEEDS_MORE_VALIDATION");
assert.ok(missingResult.missingFactors.length === 3);

const unknown = assessments();
unknown[2] = { ...unknown[2], strength: "UNKNOWN" };
assert.equal(evaluateValidation({ ...eligible, assessments: unknown }).verdict, "NEEDS_MORE_VALIDATION");

const lowConfidence = assessments();
lowConfidence[3] = { ...lowConfidence[3], evidenceQuality: quality("LOW") };
const lowConfidenceResult = evaluateValidation({ ...eligible, assessments: lowConfidence });
assert.equal(lowConfidenceResult.verdict, "NEEDS_MORE_VALIDATION");
assert.ok(lowConfidenceResult.lowConfidenceFactors.includes("monetization_proof_price_tolerance"));

const weak = assessments();
weak[7] = { ...weak[7], strength: "WEAK" };
const weakResult = evaluateValidation({ ...eligible, assessments: weak });
assert.equal(weakResult.verdict, "WATCH");
assert.ok(weakResult.weakFactors.includes("economic_headroom"));

const blocked = assessments();
blocked[10] = { ...blocked[10], strength: "BLOCKING" };
const blockedResult = evaluateValidation({ ...eligible, assessments: blocked });
assert.equal(blockedResult.verdict, "REJECT");
assert.ok(blockedResult.blockingFactors.includes("unit_economics_pricing_power"));

const allStrong = assessments("STRONG", "MEDIUM");
const strongResult = evaluateValidation({ ...eligible, assessments: allStrong });
assert.equal(strongResult.verdict, "BUILD_READY");
assert.equal(strongResult.groupProfile.OPPORTUNITY_QUALITY.length, 8);
assert.equal(strongResult.groupProfile.BET_ECONOMICS.length, 4);
assert.equal(strongResult.groupProfile.UNCERTAINTY_RESOLUTION.length, 1);

console.log("PASS zero-cost canonical underwriting validation engine");
