import assert from "node:assert/strict";
import {
  RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD,
  RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
  buildResolutionWorkerSystemPrompt,
  buildResolutionWorkerUserPrompt,
  executeAutonomousResolutionAdvance,
  methodAllowsWebSearch,
  nextResolutionMethod,
  validateResolutionWorkerResult,
  type ResolutionWorkerContext,
  type ResolutionWorkerExecution,
} from "../src/lib/autonomous-resolution-workers";
import type { ResolutionAttempt, ResolutionMethod } from "../src/lib/autonomous-resolution-engine";

const context: ResolutionWorkerContext = {
  opportunity: {
    id: 42,
    name: "Pricing test",
    sourcePlatform: "Apify",
    sourceUrl: "https://apify.com/store",
    opportunityType: "scraper",
    thesis: "Operators may pay for recurring structured output.",
    verdict: "RESEARCH",
  },
  problem: "COMMERCIAL_PRICING_UNRESOLVED",
  unresolvedQuestion: "Can the opportunity support a defensible paid price?",
  priorAttempts: [],
  evidence: [{
    claim: "A paid substitute exists.",
    classification: "FACT",
    evaluationDimension: "commercial_value",
    sourceUrl: "https://example.com/pricing",
    sourceTitle: "Example pricing",
    observedDate: "2026-09-09",
  }],
};

assert.equal(nextResolutionMethod(context.problem, []), "DIRECT_RESEARCH");
assert.equal(methodAllowsWebSearch("DIRECT_RESEARCH"), true);
assert.equal(methodAllowsWebSearch("PROXY_RESEARCH"), true);
assert.equal(methodAllowsWebSearch("ECONOMIC_INFERENCE"), false);
assert.match(buildResolutionWorkerSystemPrompt("ECONOMIC_INFERENCE"), /defensibly|defensible|bounds/i);
assert.match(buildResolutionWorkerSystemPrompt("ADVERSARIAL_REVIEW"), /absence of evidence/i);
assert.match(buildResolutionWorkerUserPrompt("PROXY_RESEARCH", context), /A paid substitute exists/);
assert.ok(RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD > 0);
assert.ok(RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD < RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD);

const parsed = validateResolutionWorkerResult("ECONOMIC_INFERENCE", {
  status: "RESOLVED",
  conclusion: "A bounded paid hypothesis is supportable.",
  rationale: "Paid substitutes and value created support a testable range.",
  confidence: "MEDIUM",
  recommendation: "RETURN_TO_VALIDATION",
  findings: [{
    claim: "A price can be bounded without pretending an exact willingness-to-pay point is known.",
    source_url: null,
    source_title: null,
    classification: "INFERENCE",
  }],
  derived_bounds: ["Test a bounded range rather than requiring an exact observed price."],
  watch_triggers: [],
  experiment: null,
  unresolved_questions: [],
});
assert.equal(parsed.status, "RESOLVED");
assert.equal(parsed.derivedBounds.length, 1);
assert.equal(parsed.humanGateCandidate, null);

assert.throws(() => validateResolutionWorkerResult("DIRECT_RESEARCH", {
  status: "ACTIVE_MONITORING",
  conclusion: "Wait.",
  rationale: "Time matters.",
  confidence: "LOW",
  recommendation: "WATCH_FOR_DELTA",
  findings: [],
  derived_bounds: [],
  watch_triggers: ["usage rises"],
  experiment: null,
  unresolved_questions: [],
}), /Only WATCH_FOR_DELTA/);

const methodExecution = (
  method: ResolutionMethod,
  status: "RESOLVED" | "EXHAUSTED" | "ACTIVE_MONITORING",
  cost = 0.05,
): ResolutionWorkerExecution => ({
  result: {
    method,
    status,
    conclusion: `${method} ${status}`,
    rationale: "Fixture reasoning.",
    confidence: "MEDIUM",
    recommendation: status === "ACTIVE_MONITORING" ? "WATCH_FOR_DELTA" : "CONTINUE_RESOLUTION",
    findings: [],
    derivedBounds: [],
    watchTriggers: status === "ACTIVE_MONITORING" ? ["A concrete material delta occurs."] : [],
    experiment: null,
    unresolvedQuestions: [],
    humanGateCandidate: null,
  },
  inputTokens: 100,
  outputTokens: 100,
  searchCount: methodAllowsWebSearch(method) ? 1 : 0,
  estimatedExternalCostUsd: cost,
});

{
  const calls: ResolutionMethod[] = [];
  const result = await executeAutonomousResolutionAdvance({
    context,
    priorExternalCostUsd: 0,
    runWorker: async (method) => {
      calls.push(method);
      if (method === "ECONOMIC_INFERENCE") return methodExecution(method, "RESOLVED");
      return methodExecution(method, "EXHAUSTED");
    },
  });
  assert.deepEqual(calls, ["DIRECT_RESEARCH", "PROXY_RESEARCH", "ECONOMIC_INFERENCE"]);
  assert.equal(result.resolvedInternally, true);
  assert.equal(result.exhaustionCertificate.humanEscalationEligible, false);
  assert.equal(result.nextMethod, "ADVERSARIAL_REVIEW");
}

{
  const calls: ResolutionMethod[] = [];
  const watchContext: ResolutionWorkerContext = {
    ...context,
    problem: "DEMAND_UNCERTAINTY",
  };
  const result = await executeAutonomousResolutionAdvance({
    context: watchContext,
    priorExternalCostUsd: 0,
    runWorker: async (method) => {
      calls.push(method);
      if (method === "WATCH_FOR_DELTA") return methodExecution(method, "ACTIVE_MONITORING");
      return methodExecution(method, "EXHAUSTED");
    },
  });
  assert.equal(calls.at(-1), "WATCH_FOR_DELTA");
  assert.equal(result.activeMonitoring, true);
  assert.equal(result.exhaustionCertificate.humanEscalationEligible, false);
  assert.deepEqual(result.exhaustionCertificate.activeMethods, ["WATCH_FOR_DELTA"]);
}

{
  const completed: ResolutionAttempt[] = [
    { method: "DIRECT_RESEARCH", status: "EXHAUSTED", summary: "done" },
    { method: "PROXY_RESEARCH", status: "EXHAUSTED", summary: "done" },
    { method: "ECONOMIC_INFERENCE", status: "EXHAUSTED", summary: "done" },
    { method: "ADVERSARIAL_REVIEW", status: "EXHAUSTED", summary: "done" },
    { method: "ALTERNATIVE_THESIS", status: "EXHAUSTED", summary: "done" },
    { method: "SAFE_EXPERIMENT", status: "EXHAUSTED", summary: "done" },
    { method: "WATCH_FOR_DELTA", status: "EXHAUSTED", summary: "done" },
  ];
  const result = await executeAutonomousResolutionAdvance({
    context: { ...context, priorAttempts: completed },
    priorExternalCostUsd: 0.4,
    runWorker: async () => {
      throw new Error("No worker should run after every method is exhausted");
    },
  });
  assert.equal(result.executions.length, 0);
  assert.equal(result.exhaustionCertificate.issued, true);
  assert.equal(result.exhaustionCertificate.humanEscalationEligible, true);
}

{
  let calls = 0;
  const result = await executeAutonomousResolutionAdvance({
    context,
    priorExternalCostUsd:
      RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD - RESOLUTION_STAGE_EXTERNAL_COST_RESERVE_USD + 0.01,
    runWorker: async (method) => {
      calls += 1;
      return methodExecution(method, "EXHAUSTED");
    },
  });
  assert.equal(calls, 0);
  assert.equal(result.stoppedForBudget, true);
  assert.equal(result.exhaustionCertificate.humanEscalationEligible, false);
}

console.log("PASS zero-cost autonomous resolution workers");
