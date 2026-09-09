import assert from "node:assert/strict";
import { executeResearchWorkflow } from "../src/lib/research-execution";
import { determineResearchPlan, type ResearchPlanInput } from "../src/lib/research-orchestrator";

const base: ResearchPlanInput = {
  opportunityVerdict: "RESEARCH",
  policyStatus: null,
  demandConclusion: null,
  externalCostUsd: 0,
};

{
  let state: ResearchPlanInput = { ...base };
  const calls: string[] = [];
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      calls.push("policy");
      state = { ...state, policyStatus: "GREEN", externalCostUsd: 0.2 };
    },
    runDemandCheck: async () => {
      calls.push("demand");
      state = { ...state, demandConclusion: "SUPPORTED", externalCostUsd: 0.45 };
    },
  });
  assert.deepEqual(calls, ["policy", "demand"]);
  assert.deepEqual(result.stepsExecuted, ["POLICY_CHECK", "DEMAND_CHECK"]);
  assert.equal(result.finalPlan.phase, "VALIDATION_READY");
}

{
  let state: ResearchPlanInput = { ...base };
  const calls: string[] = [];
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      calls.push("policy");
      state = { ...state, policyStatus: "UNKNOWN", externalCostUsd: 0.2 };
    },
    runDemandCheck: async () => {
      calls.push("demand");
    },
  });
  assert.deepEqual(calls, ["policy"]);
  assert.equal(result.finalPlan.phase, "HUMAN_REVIEW_REQUIRED");
  assert.equal(result.finalPlan.automaticExternalCallsEnabled, false);
}

{
  let state: ResearchPlanInput = {
    ...base,
    policyStatus: "GREEN",
    externalCostUsd: 0.3,
  };
  let demandCalls = 0;
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      throw new Error("policy should not run");
    },
    runDemandCheck: async () => {
      demandCalls += 1;
      state = { ...state, demandConclusion: "WEAK", externalCostUsd: 0.48 };
    },
  });
  assert.equal(demandCalls, 1);
  assert.equal(result.finalPlan.phase, "WATCH");
  assert.equal(result.finalPlan.automaticExternalCallsEnabled, false);
}

{
  const state: ResearchPlanInput = {
    ...base,
    policyStatus: "GREEN",
    externalCostUsd: 1,
  };
  let calls = 0;
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      calls += 1;
    },
    runDemandCheck: async () => {
      calls += 1;
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.finalPlan.phase, "BUDGET_EXHAUSTED");
}

console.log("PASS zero-cost autonomous research execution");
