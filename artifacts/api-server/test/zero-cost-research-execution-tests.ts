import assert from "node:assert/strict";
import { executeResearchWorkflow } from "../src/lib/research-execution";
import { determineResearchPlan, type ResearchPlanInput } from "../src/lib/research-orchestrator";

const base: ResearchPlanInput = {
  opportunityVerdict: "RESEARCH",
  policyStatus: null,
  demandConclusion: null,
  killRiskOutcome: null,
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
    runKillRiskCheck: async () => {
      calls.push("kill-risk");
      state = { ...state, killRiskOutcome: "CLEAR", externalCostUsd: 0.7 };
    },
  });
  assert.deepEqual(calls, ["policy", "demand", "kill-risk"]);
  assert.deepEqual(result.stepsExecuted, ["POLICY_CHECK", "DEMAND_CHECK", "KILL_RISK_CHECK"]);
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
    runKillRiskCheck: async () => {
      calls.push("kill-risk");
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
    runKillRiskCheck: async () => {
      throw new Error("kill risk should not run for weak demand");
    },
  });
  assert.equal(demandCalls, 1);
  assert.equal(result.finalPlan.phase, "WATCH");
  assert.equal(result.finalPlan.automaticExternalCallsEnabled, false);
}

{
  let state: ResearchPlanInput = {
    ...base,
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    externalCostUsd: 0.5,
  };
  let killCalls = 0;
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      throw new Error("policy should not run");
    },
    runDemandCheck: async () => {
      throw new Error("demand should not run");
    },
    runKillRiskCheck: async () => {
      killCalls += 1;
      state = { ...state, killRiskOutcome: "INCOMPLETE", externalCostUsd: 0.8 };
    },
  });
  assert.equal(killCalls, 1);
  assert.equal(result.finalPlan.phase, "KILL_RISK_REVIEW_REQUIRED");
  assert.equal(result.finalPlan.automaticExternalCallsEnabled, false);
}

{
  const state: ResearchPlanInput = {
    ...base,
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    externalCostUsd: 1.1,
  };
  let calls = 0;
  const result = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => { calls += 1; },
    runDemandCheck: async () => { calls += 1; },
    runKillRiskCheck: async () => { calls += 1; },
  });
  assert.equal(calls, 0);
  assert.equal(result.finalPlan.phase, "BUDGET_EXHAUSTED");
}

console.log("PASS zero-cost autonomous research execution");
