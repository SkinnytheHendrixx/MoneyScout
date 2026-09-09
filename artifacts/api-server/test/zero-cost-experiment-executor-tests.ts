import assert from "node:assert/strict";
import {
  AUTOMATIC_EXPERIMENT_EXTERNAL_COST_CEILING_USD,
  clearExperimentExecutorAdaptersForTests,
  executeRegisteredExperiment,
  experimentExecutionCapability,
  parseStoredExperimentExecution,
  registerExperimentExecutorAdapter,
  storedExecutionStatusFromOutcome,
  validateExperimentExecutionResult,
  type StoredExperimentExecution,
} from "../src/lib/experiment-executor";
import type { FalsifyingExperimentPlan } from "../src/lib/experiment-planner";

const technicalPlan: FalsifyingExperimentPlan = {
  schemaVersion: 1,
  planKey: "TECHNICAL_SPIKE:build_complexity_technical_uncertainty",
  experimentType: "TECHNICAL_SPIKE",
  targetFactors: ["build_complexity_technical_uncertainty"],
  hypothesis: "The critical dependency can complete a representative path.",
  falsificationQuestion: "Does the critical dependency fail on the representative path?",
  procedure: ["Exercise one representative path."],
  evidenceProduced: ["Observed technical feasibility"],
  costClass: "VERY_LOW",
  timeToSignal: "HOURS",
  reversibility: "HIGH",
  selectionBasis: "Zero-cost fixture.",
  nonGoals: ["Not production reliability."],
};

assert.equal(AUTOMATIC_EXPERIMENT_EXTERNAL_COST_CEILING_USD, 0);

const paidCapability = experimentExecutionCapability({
  engineFamily: "APIFY_STORE_DISCOVERY",
  experimentType: "PAID_COMMITMENT_TEST",
});
assert.equal(paidCapability.mode, "EXPLICIT_EXTERNAL_ACTION_REQUIRED");
assert.equal(paidCapability.automaticExecutionAllowed, false);

const launchCapability = experimentExecutionCapability({
  engineFamily: "APIFY_STORE_DISCOVERY",
  experimentType: "MINIMAL_MARKETPLACE_LAUNCH",
});
assert.equal(launchCapability.mode, "EXPLICIT_EXTERNAL_ACTION_REQUIRED");
assert.equal(launchCapability.automaticExecutionAllowed, false);

clearExperimentExecutorAdaptersForTests();
const missingAdapter = experimentExecutionCapability({
  engineFamily: "APIFY_STORE_DISCOVERY",
  experimentType: "TECHNICAL_SPIKE",
});
assert.equal(missingAdapter.mode, "ADAPTER_REQUIRED");
assert.equal(missingAdapter.automaticExecutionAllowed, false);

registerExperimentExecutorAdapter(
  "APIFY_STORE_DISCOVERY",
  "TECHNICAL_SPIKE",
  async () => ({
    outcome: "SUPPORTED",
    summary: "Representative dependency path completed.",
    observations: [
      {
        factor: "build_complexity_technical_uncertainty",
        direction: "SUPPORTS",
        evidenceKind: "TECH_DEPENDENCY",
        classification: "FACT",
        claim: "The representative dependency path completed under the bounded spike.",
      },
    ],
    metrics: { completed: true, attempts: 1 },
    externalCostUsd: 0,
  }),
);

const ready = experimentExecutionCapability({
  engineFamily: "APIFY_STORE_DISCOVERY",
  experimentType: "TECHNICAL_SPIKE",
});
assert.equal(ready.mode, "AUTOMATIC_INTERNAL");
assert.equal(ready.automaticExecutionAllowed, true);

const executed = await executeRegisteredExperiment({
  experimentId: 9,
  opportunityId: 3,
  engineFamily: "APIFY_STORE_DISCOVERY",
  sourcePlatform: "APIFY",
  sourceUrl: "https://apify.com/example",
  opportunityType: "Discovery test",
  thesis: "Fixture thesis",
  plan: technicalPlan,
});
assert.equal(executed.result.outcome, "SUPPORTED");
assert.equal(executed.result.observations.length, 1);
assert.equal(executed.result.externalCostUsd, 0);

assert.throws(
  () => validateExperimentExecutionResult(technicalPlan, {
    outcome: "SUPPORTED",
    summary: "Bad factor",
    observations: [
      {
        factor: "buyer_budget_clarity",
        direction: "SUPPORTS",
        evidenceKind: "TECH_DEPENDENCY",
        classification: "FACT",
        claim: "Invalid cross-factor write.",
      },
    ],
    externalCostUsd: 0,
  }),
  /non-target factor/,
);

assert.throws(
  () => validateExperimentExecutionResult(technicalPlan, {
    outcome: "SUPPORTED",
    summary: "Bad evidence kind",
    observations: [
      {
        factor: "build_complexity_technical_uncertainty",
        direction: "SUPPORTS",
        evidenceKind: "PAID_COMPETITOR",
        classification: "FACT",
        claim: "Invalid kind for a technical spike.",
      },
    ],
    externalCostUsd: 0,
  }),
  /not allowed/,
);

assert.throws(
  () => validateExperimentExecutionResult(technicalPlan, {
    outcome: "SUPPORTED",
    summary: "Paid generic executor",
    observations: [
      {
        factor: "build_complexity_technical_uncertainty",
        direction: "SUPPORTS",
        evidenceKind: "TECH_DEPENDENCY",
        classification: "FACT",
        claim: "Observed result.",
      },
    ],
    externalCostUsd: 0.01,
  }),
  /zero-dollar external-service spend ceiling/,
);

assert.throws(
  () => validateExperimentExecutionResult(technicalPlan, {
    outcome: "FALSIFIED",
    summary: "Missing contradiction",
    observations: [
      {
        factor: "build_complexity_technical_uncertainty",
        direction: "SUPPORTS",
        evidenceKind: "TECH_DEPENDENCY",
        classification: "FACT",
        claim: "Contradiction missing.",
      },
    ],
    externalCostUsd: 0,
  }),
  /requires at least one contradicting observation/,
);

assert.equal(storedExecutionStatusFromOutcome("SUPPORTED"), "COMPLETED");
assert.equal(storedExecutionStatusFromOutcome("FALSIFIED"), "FALSIFIED");
assert.equal(storedExecutionStatusFromOutcome("INCONCLUSIVE"), "INCONCLUSIVE");

const stored: StoredExperimentExecution = {
  schemaVersion: 1,
  plan: technicalPlan,
  execution: {
    status: "COMPLETED",
    outcome: "SUPPORTED",
    summary: "Done",
    adapterKey: "APIFY_STORE_DISCOVERY:TECHNICAL_SPIKE",
    startedAt: "2026-09-09T00:00:00.000Z",
    finishedAt: "2026-09-09T00:01:00.000Z",
    externalCostUsd: 0,
    observations: executed.result.observations,
    metrics: executed.result.metrics ?? {},
    retryPolicy: "NO_AUTOMATIC_RETRY",
  },
};
assert.equal(parseStoredExperimentExecution(JSON.stringify(stored))?.execution.outcome, "SUPPORTED");

assert.throws(
  () => registerExperimentExecutorAdapter("*", "CHANNEL_SMOKE_TEST", async () => ({
    outcome: "INCONCLUSIVE",
    summary: "Should never register",
    observations: [],
  })),
  /cannot be registered for automatic execution/,
);

clearExperimentExecutorAdaptersForTests();
console.log("PASS zero-cost experiment executor");
