import assert from "node:assert/strict";
import { determineResearchPlan } from "../src/lib/research-orchestrator";

const base = {
  opportunityVerdict: "RESEARCH",
  policyStatus: null,
  demandConclusion: null,
  killRiskOutcome: null,
  externalCostUsd: 0,
} as const;

assert.equal(determineResearchPlan(base).nextAction, "RUN_POLICY_CHECK");
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN" }).nextAction,
  "RUN_DEMAND_CHECK",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "SUPPORTED" }).nextAction,
  "RUN_KILL_RISK_CHECK",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "SUPPORTED", killRiskOutcome: "CLEAR" }).phase,
  "VALIDATION_READY",
);

for (const policyStatus of ["RED", "UNKNOWN", "YELLOW"] as const) {
  const result = determineResearchPlan({ ...base, policyStatus });
  assert.equal(result.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(result.nextAction, "RESOLVE_AUTONOMOUSLY");
  assert.equal(result.resolutionProblem, "POLICY_AMBIGUITY");
  assert.equal(result.automaticExternalCallsEnabled, false);
}

for (const demandConclusion of ["WEAK", "UNKNOWN", "UNSUPPORTED"] as const) {
  const result = determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion });
  assert.equal(result.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(result.nextAction, "RESOLVE_AUTONOMOUSLY");
  assert.equal(result.resolutionProblem, "DEMAND_UNCERTAINTY");
}

for (const killRiskOutcome of ["BLOCKED", "INCOMPLETE"] as const) {
  const result = determineResearchPlan({
    ...base,
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    killRiskOutcome,
  });
  assert.equal(result.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(result.nextAction, "RESOLVE_AUTONOMOUSLY");
  assert.equal(result.resolutionProblem, "KILL_RISK_INCOMPLETE");
}

const insufficientKillRiskBudget = determineResearchPlan({
  ...base,
  policyStatus: "GREEN",
  demandConclusion: "SUPPORTED",
  externalCostUsd: 1.1,
});
assert.equal(insufficientKillRiskBudget.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
assert.equal(insufficientKillRiskBudget.resolutionProblem, "RESEARCH_BUDGET_EXHAUSTED");

const exhausted = determineResearchPlan({
  ...base,
  policyStatus: "GREEN",
  demandConclusion: "SUPPORTED",
  externalCostUsd: 1.5,
});
assert.equal(exhausted.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
assert.equal(exhausted.resolutionProblem, "RESEARCH_BUDGET_EXHAUSTED");

assert.equal(
  determineResearchPlan({ ...base, opportunityVerdict: "KILL" }).phase,
  "STOPPED",
);

console.log("PASS zero-cost research orchestrator state machine");
