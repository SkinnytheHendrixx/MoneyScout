import assert from "node:assert/strict";
import {
  chooseCheapestFalsifyingExperiment,
  parseStoredExperimentPlan,
} from "../src/lib/experiment-planner";
import {
  evaluateValidation,
  UNDERWRITING_FACTORS,
  type EvidenceConfidence,
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

const baseAssessments = (): UnderwritingAssessment[] => UNDERWRITING_FACTORS.map((factor) => ({
  factor,
  strength: "ADEQUATE" as const,
  evidenceQuality: quality(),
}));

const unresolved = (factor: typeof UNDERWRITING_FACTORS[number]) => {
  const assessments = baseAssessments();
  const index = assessments.findIndex((item) => item.factor === factor);
  assessments[index] = {
    ...assessments[index],
    evidenceQuality: quality("LOW"),
  };
  const validationResult = evaluateValidation({
    opportunityVerdict: "TEST",
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    killScreenOverall: "CLEAR",
    assessments,
  });
  assert.equal(validationResult.verdict, "NEEDS_MORE_VALIDATION");
  return { assessments, validationResult };
};

const monetization = unresolved("monetization_proof_price_tolerance");
const monetizationPlan = chooseCheapestFalsifyingExperiment({
  ...monetization,
  sourcePlatform: "Apify",
});
assert.equal(monetizationPlan?.experimentType, "PAID_COMMITMENT_TEST");
assert.deepEqual(monetizationPlan?.targetFactors, ["monetization_proof_price_tolerance"]);
assert.equal(monetizationPlan?.costClass, "VERY_LOW");
assert.equal(monetizationPlan?.reversibility, "HIGH");
assert.match(monetizationPlan?.falsificationQuestion ?? "", /monetary commitment/i);

const unitEconomics = unresolved("unit_economics_pricing_power");
const unitPlan = chooseCheapestFalsifyingExperiment(unitEconomics);
assert.equal(unitPlan?.experimentType, "UNIT_COST_BENCHMARK");
assert.equal(unitPlan?.timeToSignal, "HOURS");
assert.match(unitPlan?.nonGoals.join(" ") ?? "", /CAC/i);

const build = unresolved("build_complexity_technical_uncertainty");
const buildPlan = chooseCheapestFalsifyingExperiment(build);
assert.equal(buildPlan?.experimentType, "TECHNICAL_SPIKE");
assert.equal(buildPlan?.timeToSignal, "HOURS");
assert.match(buildPlan?.nonGoals.join(" ") ?? "", /production reliability/i);

const trajectory = unresolved("demand_trajectory_durability");
const apifyTrajectoryPlan = chooseCheapestFalsifyingExperiment({
  ...trajectory,
  sourcePlatform: "APIFY",
});
assert.equal(apifyTrajectoryPlan?.experimentType, "MINIMAL_MARKETPLACE_LAUNCH");
assert.match(apifyTrajectoryPlan?.nonGoals.join(" ") ?? "", /Usage is not revenue/i);

const allResolvedAssessments = baseAssessments();
const allResolvedResult = evaluateValidation({
  opportunityVerdict: "TEST",
  policyStatus: "GREEN",
  demandConclusion: "SUPPORTED",
  killScreenOverall: "CLEAR",
  assessments: allResolvedAssessments,
});
assert.equal(allResolvedResult.verdict, "BUILD_READY");
assert.equal(chooseCheapestFalsifyingExperiment({
  validationResult: allResolvedResult,
  assessments: allResolvedAssessments,
}), null);

assert.ok(monetizationPlan);
const stored = parseStoredExperimentPlan(JSON.stringify(monetizationPlan));
assert.equal(stored?.planKey, monetizationPlan.planKey);
assert.equal(stored?.schemaVersion, 1);
assert.equal(parseStoredExperimentPlan("not json"), null);

const serialized = JSON.stringify(monetizationPlan).toLowerCase();
assert.ok(!serialized.includes("probability_of_success"));
assert.ok(!serialized.includes("conversion_threshold"));
assert.ok(!serialized.includes("tam_estimate"));

console.log("PASS zero-cost cheapest falsifying experiment planner");
