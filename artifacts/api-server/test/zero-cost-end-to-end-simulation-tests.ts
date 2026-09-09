import assert from "node:assert/strict";
import { executeResearchWorkflow } from "../src/lib/research-execution";
import { determineResearchPlan, type ResearchPlanInput } from "../src/lib/research-orchestrator";
import {
  determineValidationPlan,
  type ValidationPlanInput,
} from "../src/lib/validation-orchestrator";
import {
  UNDERWRITING_FACTORS,
  type UnderwritingAssessment,
} from "../src/lib/validation-engine";

const quality = (confidence: "HIGH" | "MEDIUM" | "LOW" = "HIGH") => ({
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

const assessments = (): UnderwritingAssessment[] =>
  UNDERWRITING_FACTORS.map((factor) => ({
    factor,
    strength: "ADEQUATE" as const,
    evidenceQuality: quality(),
  }));

async function simulateResearch(fixture: {
  policy: "GREEN" | "YELLOW" | "RED" | "UNKNOWN";
  demand?: "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN";
  killRisk?: "CLEAR" | "BLOCKED" | "INCOMPLETE";
}) {
  let state: ResearchPlanInput = {
    opportunityVerdict: "RESEARCH",
    policyStatus: null,
    demandConclusion: null,
    killRiskOutcome: null,
    externalCostUsd: 0,
  };
  const calls: string[] = [];

  const execution = await executeResearchWorkflow({
    readPlan: async () => determineResearchPlan(state),
    runPolicyCheck: async () => {
      calls.push("POLICY_CHECK");
      state = { ...state, policyStatus: fixture.policy, externalCostUsd: 0.1 };
    },
    runDemandCheck: async () => {
      calls.push("DEMAND_CHECK");
      state = { ...state, demandConclusion: fixture.demand ?? "UNKNOWN", externalCostUsd: 0.2 };
    },
    runKillRiskCheck: async () => {
      calls.push("KILL_RISK_CHECK");
      state = { ...state, killRiskOutcome: fixture.killRisk ?? "INCOMPLETE", externalCostUsd: 0.3 };
    },
  });

  return { calls, state, execution };
}

// Happy path: all research gates clear and the canonical validation profile is build-ready.
{
  const research = await simulateResearch({
    policy: "GREEN",
    demand: "SUPPORTED",
    killRisk: "CLEAR",
  });
  assert.deepEqual(research.calls, ["POLICY_CHECK", "DEMAND_CHECK", "KILL_RISK_CHECK"]);
  assert.equal(research.execution.finalPlan.phase, "VALIDATION_READY");

  const input: ValidationPlanInput = {
    opportunityVerdict: "TEST",
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    killScreenOverall: "CLEAR",
    evidenceRunStatus: "COMPLETED",
    validationExternalCostUsd: 0.3,
    assessments: assessments(),
  };
  const validation = determineValidationPlan(input);
  assert.equal(validation.phase, "BUILD_READY");
  assert.equal(validation.nextAction, "APPLY_BUILD");
}

// Weak demand stops further paid stages, but it routes to autonomous resolution rather than dead-end WATCH.
{
  const research = await simulateResearch({ policy: "GREEN", demand: "WEAK" });
  assert.deepEqual(research.calls, ["POLICY_CHECK", "DEMAND_CHECK"]);
  assert.equal(research.execution.finalPlan.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(research.execution.finalPlan.resolutionProblem, "DEMAND_UNCERTAINTY");
}

// A reported fatal kill risk must be independently challenged before a terminal decision.
{
  const research = await simulateResearch({
    policy: "GREEN",
    demand: "SUPPORTED",
    killRisk: "BLOCKED",
  });
  assert.deepEqual(research.calls, ["POLICY_CHECK", "DEMAND_CHECK", "KILL_RISK_CHECK"]);
  assert.equal(research.execution.finalPlan.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(research.execution.finalPlan.resolutionProblem, "KILL_RISK_INCOMPLETE");
}

// Cleared research plus one unresolved underwriting factor must request a falsifying experiment,
// not silently promote the opportunity or spend again on generic validation.
{
  const profile = assessments();
  profile[3] = {
    ...profile[3],
    strength: "UNKNOWN",
    evidenceQuality: quality("LOW"),
  };

  const validation = determineValidationPlan({
    opportunityVerdict: "TEST",
    policyStatus: "GREEN",
    demandConclusion: "SUPPORTED",
    killScreenOverall: "CLEAR",
    evidenceRunStatus: "COMPLETED",
    validationExternalCostUsd: 0.25,
    assessments: profile,
  });
  assert.equal(validation.phase, "NEEDS_MORE_VALIDATION");
  assert.equal(validation.nextAction, "PLAN_EXPERIMENT");
  assert.equal(validation.automaticExternalCallsEnabled, false);
}

// Policy ambiguity spends once and then routes to deeper autonomous resolution, preserving no-retry behavior without owner homework.
{
  const research = await simulateResearch({ policy: "UNKNOWN" });
  assert.deepEqual(research.calls, ["POLICY_CHECK"]);
  assert.equal(research.execution.finalPlan.phase, "AUTONOMOUS_RESOLUTION_REQUIRED");
  assert.equal(research.execution.finalPlan.resolutionProblem, "POLICY_AMBIGUITY");
  assert.equal(research.execution.finalPlan.automaticExternalCallsEnabled, false);
}

console.log("PASS zero-cost end-to-end Money Scout simulation harness");
