import assert from "node:assert/strict";
import {
  assessAllUnderwritingFactors,
  assessUnderwritingFactor,
  parsePersistedUnderwritingDimension,
  type FactorAssessmentEvidence,
} from "../src/lib/factor-assessment-workers";
import type { UnderwritingFactor } from "../src/lib/validation-engine";
import type { ValidationEvidenceDirection, ValidationEvidenceKind } from "../src/lib/validation-evidence-collector";

const evidence = (
  id: number,
  factor: UnderwritingFactor,
  evidenceKind: ValidationEvidenceKind,
  direction: ValidationEvidenceDirection,
  host: string,
  classification: FactorAssessmentEvidence["classification"] = "FACT",
): FactorAssessmentEvidence => ({
  id,
  factor,
  evidenceKind,
  direction,
  classification,
  claim: `${factor} ${evidenceKind} ${direction}`,
  sourceUrl: `https://${host}/source-${id}`,
  sourceTitle: `Source ${id}`,
  observedDate: "2026-09-08",
});

{
  const results = assessAllUnderwritingFactors([]);
  assert.equal(results.length, 13);
  assert.ok(results.every((item) => item.strength === "UNKNOWN"));
  assert.ok(results.every((item) => item.evidenceQuality.confidence === "UNKNOWN"));
}

{
  const factor = "monetization_proof_price_tolerance" as const;
  const result = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PRICING", "SUPPORTS", "pricing.example.com"),
    evidence(2, factor, "PRICING", "SUPPORTS", "catalog.example.org"),
  ]);
  assert.equal(result.strength, "UNKNOWN", "listed pricing alone must not establish willingness to pay");
}

{
  const factor = "monetization_proof_price_tolerance" as const;
  const result = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PAID_COMPETITOR", "SUPPORTS", "competitor.example.com"),
    evidence(2, factor, "PAID_SUBSTITUTE", "SUPPORTS", "jobs.example.org"),
  ]);
  assert.equal(result.strength, "ADEQUATE");
  assert.equal(result.evidenceQuality.confidence, "MEDIUM");
  assert.equal(result.evidenceQuality.recency, "UNKNOWN", "collection date must not masquerade as source recency");
}

{
  const factor = "unit_economics_pricing_power" as const;
  const pricingOnly = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PRICING", "SUPPORTS", "pricing.example.com"),
    evidence(2, factor, "PRICING", "SUPPORTS", "other-pricing.example.org"),
  ]);
  assert.equal(pricingOnly.strength, "UNKNOWN", "price without cost evidence is not unit economics");

  const priceAndCost = assessUnderwritingFactor(factor, [
    evidence(3, factor, "PRICING", "SUPPORTS", "pricing.example.com"),
    evidence(4, factor, "PLATFORM_FEE", "SUPPORTS", "platform.example.org"),
  ]);
  assert.equal(priceAndCost.strength, "ADEQUATE");
  assert.equal(priceAndCost.evidenceQuality.confidence, "MEDIUM");
}

{
  const factor = "economic_headroom" as const;
  const withoutWedge = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PRICING", "SUPPORTS", "pricing.example.com"),
    evidence(2, factor, "BUYER_BUDGET", "SUPPORTS", "buyers.example.org"),
  ]);
  assert.equal(withoutWedge.strength, "UNKNOWN", "economic headroom requires a reachable wedge, not TAM-like proxies");

  const withWedge = assessUnderwritingFactor(factor, [
    evidence(3, factor, "REACHABLE_WEDGE", "SUPPORTS", "market.example.com"),
    evidence(4, factor, "PRICING", "SUPPORTS", "pricing.example.org"),
  ]);
  assert.equal(withWedge.strength, "ADEQUATE");
}

{
  const factor = "falsifiability_feedback_velocity" as const;
  const partial = assessUnderwritingFactor(factor, [
    evidence(1, factor, "TEST_DESIGN", "SUPPORTS", "channel.example.com"),
    evidence(2, factor, "VALIDATION_COST", "SUPPORTS", "cost.example.org"),
  ]);
  assert.equal(partial.strength, "UNKNOWN", "a test without evidence of time-to-signal is not resolved falsifiability");

  const resolved = assessUnderwritingFactor(factor, [
    evidence(3, factor, "TEST_DESIGN", "SUPPORTS", "channel.example.com"),
    evidence(4, factor, "TIME_TO_SIGNAL", "SUPPORTS", "telemetry.example.org"),
  ]);
  assert.equal(resolved.strength, "ADEQUATE");
}

{
  const factor = "problem_intensity_recurrence" as const;
  const mixed = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PROBLEM_WORKAROUND", "SUPPORTS", "forum.example.com"),
    evidence(2, factor, "REPEAT_DEMAND", "CONTRADICTS", "usage.example.org"),
  ]);
  assert.equal(mixed.strength, "WEAK");
  assert.equal(mixed.evidenceQuality.consistency, "LOW");
}

{
  const factor = "problem_intensity_recurrence" as const;
  const blocked = assessUnderwritingFactor(factor, [
    evidence(1, factor, "PROBLEM_WORKAROUND", "CONTRADICTS", "source-a.example.com"),
    evidence(2, factor, "REPEAT_DEMAND", "CONTRADICTS", "source-b.example.org"),
  ]);
  assert.equal(blocked.strength, "BLOCKING", "corroborated independent factual contradictions can establish blocking economics");
}

{
  const factor = "buyer_budget_clarity" as const;
  const oneSource = assessUnderwritingFactor(factor, [
    evidence(1, factor, "BUYER_BUDGET", "SUPPORTS", "single.example.com"),
  ]);
  assert.equal(oneSource.strength, "ADEQUATE");
  assert.equal(oneSource.evidenceQuality.independence, "LOW");
  assert.equal(oneSource.evidenceQuality.confidence, "LOW", "one source must not become medium-confidence underwriting");
}

{
  assert.deepEqual(
    parsePersistedUnderwritingDimension("underwriting:buyer_budget_clarity:SUPPORTS:BUYER_BUDGET"),
    { factor: "buyer_budget_clarity", direction: "SUPPORTS", evidenceKind: "BUYER_BUDGET" },
  );
  assert.equal(parsePersistedUnderwritingDimension("underwriting:not_a_factor:SUPPORTS:BUYER_BUDGET"), null);
  assert.equal(parsePersistedUnderwritingDimension("underwriting:buyer_budget_clarity:MADE_UP:BUYER_BUDGET"), null);
  assert.equal(parsePersistedUnderwritingDimension("underwriting:buyer_budget_clarity:SUPPORTS:NOT_REAL"), null);
}

console.log("PASS zero-cost factor-specific underwriting assessment workers");
