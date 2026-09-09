import assert from "node:assert/strict";
import { determineResearchPlan } from "../src/lib/research-orchestrator";

const base = {
  opportunityVerdict: "RESEARCH",
  policyStatus: null,
  demandConclusion: null,
  externalCostUsd: 0,
} as const;

assert.equal(determineResearchPlan(base).nextAction, "RUN_POLICY_CHECK");
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN" }).nextAction,
  "RUN_DEMAND_CHECK",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "SUPPORTED" }).phase,
  "VALIDATION_READY",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "UNSUPPORTED" }).phase,
  "REJECTED",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "RED" }).nextAction,
  "STOP",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "UNKNOWN" }).nextAction,
  "HUMAN_POLICY_REVIEW",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "YELLOW" }).nextAction,
  "HUMAN_POLICY_REVIEW",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "WEAK" }).nextAction,
  "WATCH_FOR_MORE_EVIDENCE",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "UNKNOWN" }).nextAction,
  "WATCH_FOR_MORE_EVIDENCE",
);
assert.equal(
  determineResearchPlan({ ...base, policyStatus: "GREEN", demandConclusion: "SUPPORTED", externalCostUsd: 1 }).phase,
  "BUDGET_EXHAUSTED",
);
assert.equal(
  determineResearchPlan({ ...base, opportunityVerdict: "KILL" }).phase,
  "STOPPED",
);

console.log("PASS zero-cost research orchestrator state machine");
