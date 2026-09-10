import assert from "node:assert/strict";
import {
  createHttpBuilderAdapter,
  type BuilderRepairInput,
} from "../src/lib/builder-agent-adapter";
import {
  createHttpQaAdapter,
  type QaDispatchInput,
} from "../src/lib/qa-agent-adapter";

const contract = {
  schemaVersion: 1 as const,
  opportunityId: 1,
  evaluationCycleId: null,
  product: { primaryShape: "API" },
  firstTransaction: { target: "test" },
  scope: { externalSpendCeilingUsd: 5 },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: ["Returns expected output."],
  autonomy: { externalPublicationAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};

const qaInput: QaDispatchInput = {
  qaRunId: 1,
  buildJobId: 1,
  opportunityId: 1,
  roundNumber: 1,
  idempotencyKey: "qa-cost-test",
  repositoryUrl: "https://github.com/example/test",
  branchName: "test",
  acceptanceCriteria: contract.acceptanceCriteria,
  contract,
};

const repairInput: BuilderRepairInput = {
  workspaceKey: "workspace-cost-test",
  buildJobId: 1,
  opportunityId: 1,
  providerRunId: "initial-build",
  idempotencyKey: "repair-cost-test",
  repositoryUrl: "https://github.com/example/test",
  branchName: "test",
  defects: [{
    key: "TEST_DEFECT",
    category: "TEST_FAILURE",
    severity: "HIGH",
    summary: "Fixture defect.",
    evidence: "Fixture evidence.",
    repairGuidance: "Fix fixture defect.",
    humanOnly: false,
  }],
  acceptanceCriteria: contract.acceptanceCriteria,
  contract,
};

const originalFetch = globalThis.fetch;
try {
  let qaCalls = 0;
  globalThis.fetch = async () => {
    qaCalls += 1;
    if (qaCalls === 1) {
      return new Response(JSON.stringify({
        provider_run_id: "qa-metered-1",
        state: "RUNNING",
        progress_percent: 50,
        external_cost_cents: 125,
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({
      provider_run_id: "qa-metered-1",
      state: "PASSED",
      progress_percent: 100,
      external_cost_cents: 125,
      baseline_checks_passed: true,
      acceptance_results: [{ criterion: "Returns expected output.", status: "PASS", evidence: "Fixture passed." }],
      defects: [],
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const qa = createHttpQaAdapter({
    provider: "METERED_QA_FIXTURE",
    baseUrl: "https://qa.example.test",
    token: null,
    costMode: "METERED",
  });
  const qaRunning = await qa.dispatch(qaInput);
  assert.equal(qaRunning.state, "RUNNING");
  assert.equal(qaRunning.externalCostCents, 0, "non-terminal QA must not hit the spend ledger");
  const qaTerminal = await qa.getStatus("qa-metered-1");
  assert.equal(qaTerminal.state, "PASSED");
  assert.equal(qaTerminal.externalCostCents, 125, "terminal QA must reconcile provider cost exactly once");

  let repairCalls = 0;
  globalThis.fetch = async () => {
    repairCalls += 1;
    if (repairCalls === 1) {
      return new Response(JSON.stringify({
        provider_run_id: "repair-metered-1",
        state: "SUCCEEDED",
        progress_percent: 100,
        external_cost_cents: 200,
      }), { status: 200, headers: { "content-type": "application/json" } });
    }
    return new Response(JSON.stringify({
      provider_run_id: "repair-metered-1",
      state: "SUCCEEDED",
      progress_percent: 100,
      external_cost_cents: 200,
    }), { status: 200, headers: { "content-type": "application/json" } });
  };

  const builder = createHttpBuilderAdapter({
    provider: "METERED_BUILDER_FIXTURE",
    baseUrl: "https://builder.example.test",
    token: null,
    costMode: "METERED",
  });
  assert.ok(builder.repair);
  const repairDispatch = await builder.repair(repairInput);
  assert.equal(repairDispatch.state, "RUNNING", "metered immediate repair completion must be reconciled through durable status");
  assert.equal(repairDispatch.externalCostCents, 0, "repair dispatch must not hit the spend ledger before terminal reconciliation");
  const repairTerminal = await builder.getStatus("repair-metered-1");
  assert.equal(repairTerminal.state, "SUCCEEDED");
  assert.equal(repairTerminal.externalCostCents, 200, "terminal repair status must reconcile the provider cost once");

  console.log("PASS zero-cost build-stage terminal cost accounting");
} finally {
  globalThis.fetch = originalFetch;
}
