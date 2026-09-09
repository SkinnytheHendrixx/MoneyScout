import assert from "node:assert/strict";
import {
  VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD,
  VALIDATION_EVIDENCE_MAX_SEARCH_USES,
  parseValidationEvidenceCollectorOutput,
} from "../src/lib/validation-evidence-collector";
import { UNDERWRITING_FACTORS } from "../src/lib/validation-engine";

assert.equal(VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD, 0.5);
assert.equal(VALIDATION_EVIDENCE_MAX_SEARCH_USES, 8);
assert.equal(UNDERWRITING_FACTORS.length, 13);

const sources = new Map([
  ["pricing.example.com/plans", { url: "https://pricing.example.com/plans", title: "Paid plans" }],
  ["jobs.example.com/task", { url: "https://jobs.example.com/task", title: "Budgeted manual task" }],
  ["docs.example.com/api", { url: "https://docs.example.com/api", title: "Technical documentation" }],
  ["reviews.example.com/tool", { url: "https://reviews.example.com/tool", title: "Customer reviews" }],
]);

const rawCoverage = UNDERWRITING_FACTORS.map((factor) => ({
  factor,
  status: factor === "economic_headroom" ? "UNRESOLVED" : "EVIDENCED",
  open_question: factor === "economic_headroom" ? "What reachable paid volume exists?" : null,
}));

const parsed = parseValidationEvidenceCollectorOutput({
  coverage: rawCoverage,
  findings: [
    {
      ref: "f1",
      claim: "A paid plan is publicly listed for the adjacent workflow.",
      source_url: "https://pricing.example.com/plans",
      source_title: "ignored model title",
      classification: "FACT",
      factor: "monetization_proof_price_tolerance",
      direction: "SUPPORTS",
      evidence_kind: "PRICING",
    },
    {
      ref: "f2",
      claim: "A budgeted job shows buyers already pay humans for the workflow.",
      source_url: "https://jobs.example.com/task",
      source_title: "ignored model title",
      classification: "FACT",
      factor: "buyer_budget_clarity",
      direction: "SUPPORTS",
      evidence_kind: "BUYER_BUDGET",
    },
    {
      ref: "f3",
      claim: "Official docs identify multiple required API integrations.",
      source_url: "https://docs.example.com/api",
      source_title: "ignored model title",
      classification: "FACT",
      factor: "build_complexity_technical_uncertainty",
      direction: "CONTEXT",
      evidence_kind: "BUILD_REQUIREMENT",
    },
    {
      ref: "f4",
      claim: "Reviews report recurring workflow pain.",
      source_url: "https://reviews.example.com/tool",
      source_title: "ignored model title",
      classification: "CLAIM",
      factor: "problem_intensity_recurrence",
      direction: "SUPPORTS",
      evidence_kind: "PROBLEM_WORKAROUND",
    },
    {
      ref: "bad",
      claim: "This source was never returned by search.",
      source_url: "https://invented.example.com/nope",
      source_title: "invented",
      classification: "FACT",
      factor: "unit_economics_pricing_power",
      direction: "SUPPORTS",
      evidence_kind: "VARIABLE_COST",
    },
  ],
}, sources);

assert.equal(parsed.findings.length, 4);
assert.ok(!parsed.findings.some((finding) => finding.ref === "bad"));
assert.equal(parsed.coverage.length, 13);
assert.deepEqual(parsed.coverage.map((item) => item.factor), UNDERWRITING_FACTORS);
assert.equal(
  parsed.coverage.find((item) => item.factor === "monetization_proof_price_tolerance")?.status,
  "EVIDENCED",
);
assert.equal(
  parsed.coverage.find((item) => item.factor === "economic_headroom")?.status,
  "UNRESOLVED",
);
assert.equal(
  parsed.coverage.find((item) => item.factor === "unit_economics_pricing_power")?.status,
  "UNRESOLVED",
  "A model-declared EVIDENCED factor must downgrade when its only finding fails source verification.",
);

const duplicateAndMissing = parseValidationEvidenceCollectorOutput({
  coverage: [
    { factor: "buyer_budget_clarity", status: "EVIDENCED", open_question: null },
    { factor: "buyer_budget_clarity", status: "UNRESOLVED", open_question: "duplicate should be ignored" },
  ],
  findings: [
    {
      ref: "same",
      claim: "First finding survives.",
      source_url: "https://jobs.example.com/task",
      source_title: "ignored",
      classification: "FACT",
      factor: "buyer_budget_clarity",
      direction: "SUPPORTS",
      evidence_kind: "BUYER_BUDGET",
    },
    {
      ref: "same",
      claim: "Duplicate ref must be ignored.",
      source_url: "https://pricing.example.com/plans",
      source_title: "ignored",
      classification: "FACT",
      factor: "monetization_proof_price_tolerance",
      direction: "SUPPORTS",
      evidence_kind: "PRICING",
    },
  ],
}, sources);

assert.equal(duplicateAndMissing.findings.length, 1);
assert.equal(duplicateAndMissing.coverage.length, 13);
assert.equal(
  duplicateAndMissing.coverage.find((item) => item.factor === "buyer_budget_clarity")?.status,
  "EVIDENCED",
);
assert.equal(
  duplicateAndMissing.coverage.find((item) => item.factor === "monetization_proof_price_tolerance")?.status,
  "UNRESOLVED",
);

for (const finding of parsed.findings) {
  assert.equal("score" in finding, false);
  assert.equal("strength" in finding, false);
  assert.equal("confidence" in finding, false);
}

console.log("PASS zero-cost validation evidence collector source filtering and 13-factor coverage");
