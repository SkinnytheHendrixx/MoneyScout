import assert from "node:assert/strict";
import {
  createAutonomousResolutionPlan,
  createExhaustionCertificate,
  type ResolutionAttempt,
} from "../src/lib/autonomous-resolution-engine";

{
  const plan = createAutonomousResolutionPlan("COMMERCIAL_PRICING_UNRESOLVED");
  assert.equal(plan.humanEscalationEligible, false);
  assert.deepEqual(plan.steps.map((step) => step.method), [
    "DIRECT_RESEARCH",
    "PROXY_RESEARCH",
    "ECONOMIC_INFERENCE",
    "ADVERSARIAL_REVIEW",
    "ALTERNATIVE_THESIS",
    "SAFE_EXPERIMENT",
    "WATCH_FOR_DELTA",
  ]);
  assert.ok(plan.governingRules.some((rule) => rule.includes("Exact pricing")));
}

{
  const plan = createAutonomousResolutionPlan("POLICY_AMBIGUITY");
  assert.equal(plan.steps.some((step) => step.method === "ECONOMIC_INFERENCE"), false);
  assert.equal(plan.steps.some((step) => step.method === "ADVERSARIAL_REVIEW"), true);
  assert.equal(plan.steps.some((step) => step.method === "ALTERNATIVE_THESIS"), true);
}

{
  const certificate = createExhaustionCertificate({
    problem: "COMMERCIAL_PRICING_UNRESOLVED",
    unresolvedQuestion: "What price should be tested?",
    attempts: [],
  });
  assert.equal(certificate.issued, false);
  assert.equal(certificate.humanEscalationEligible, false);
  assert.ok(certificate.blockingMethods.includes("DIRECT_RESEARCH"));
  assert.ok(certificate.blockingMethods.includes("SAFE_EXPERIMENT"));
}

{
  const plan = createAutonomousResolutionPlan("COMMERCIAL_PRICING_UNRESOLVED");
  const attempts: ResolutionAttempt[] = plan.steps.map((step) => ({
    method: step.method,
    status: step.method === "WATCH_FOR_DELTA" ? "ACTIVE_MONITORING" : "EXHAUSTED",
    summary: "No internal resolution yet.",
  }));
  const certificate = createExhaustionCertificate({
    problem: "COMMERCIAL_PRICING_UNRESOLVED",
    unresolvedQuestion: "What price should be tested?",
    attempts,
  });
  assert.equal(certificate.issued, false);
  assert.equal(certificate.humanEscalationEligible, false);
  assert.deepEqual(certificate.activeMethods, ["WATCH_FOR_DELTA"]);
}

{
  const plan = createAutonomousResolutionPlan("COMMERCIAL_PRICING_UNRESOLVED");
  const attempts: ResolutionAttempt[] = plan.steps.map((step) => ({
    method: step.method,
    status: step.method === "ECONOMIC_INFERENCE" ? "RESOLVED" : "EXHAUSTED",
    summary: "Resolution work complete.",
  }));
  const certificate = createExhaustionCertificate({
    problem: "COMMERCIAL_PRICING_UNRESOLVED",
    unresolvedQuestion: "What price should be tested?",
    attempts,
  });
  assert.equal(certificate.issued, false);
  assert.equal(certificate.humanEscalationEligible, false);
  assert.ok(certificate.reason.includes("Internal resolution succeeded"));
}

{
  const plan = createAutonomousResolutionPlan("VALIDATION_REJECT_CHALLENGE");
  const attempts: ResolutionAttempt[] = plan.steps.map((step) => ({
    method: step.method,
    status: "EXHAUSTED" as const,
    summary: "Applicable internal path was attempted and did not resolve the question.",
  }));
  const certificate = createExhaustionCertificate({
    problem: "VALIDATION_REJECT_CHALLENGE",
    unresolvedQuestion: "Does the blocking factor actually invalidate the opportunity?",
    attempts,
    requestedEscalationType: "TRUE_JUDGMENT",
  });
  assert.equal(certificate.issued, true);
  assert.equal(certificate.humanEscalationEligible, true);
  assert.equal(certificate.escalationType, "TRUE_JUDGMENT");
  assert.equal(certificate.blockingMethods.length, 0);
}

console.log("PASS zero-cost autonomous resolution engine");
