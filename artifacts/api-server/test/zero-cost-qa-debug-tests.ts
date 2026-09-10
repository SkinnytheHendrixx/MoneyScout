import assert from "node:assert/strict";
import { asc, eq } from "drizzle-orm";
import {
  buildJobsTable,
  builderWorkspacesTable,
  db,
  opportunitiesTable,
  pool,
  prepareQaDebugSchema,
  qaRunsTable,
} from "@workspace/db";
import type { BuilderAgentAdapter } from "../src/lib/builder-agent-adapter";
import type { QaAgentAdapter, QaDispatchInput } from "../src/lib/qa-agent-adapter";
import { configuredQaAdapter } from "../src/lib/qa-agent-adapter";
import { runQaDebugTick } from "../src/lib/qa-debug-worker";

const firstMigration = await prepareQaDebugSchema(pool);
assert.ok(firstMigration.requiredTables.includes("qa_runs"));
assert.ok(firstMigration.requiredTables.includes("qa_run_events"));
const secondMigration = await prepareQaDebugSchema(pool);
assert.equal(secondMigration.appliedMigrationIds.length, 0, "QA runtime migration must be idempotent");

const oldQaUrl = process.env.MONEY_SCOUT_QA_ADAPTER_URL;
delete process.env.MONEY_SCOUT_QA_ADAPTER_URL;
assert.equal(configuredQaAdapter(), null, "QA adapter must be absent when no backend is configured");
if (oldQaUrl !== undefined) process.env.MONEY_SCOUT_QA_ADAPTER_URL = oldQaUrl;

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Autonomous QA ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/qa/${suffix}`,
  opportunityType: "api",
  thesis: "Fixture opportunity for autonomous QA repair and retest.",
  firstSeen: "2026-09-09",
  lastResearched: "2026-09-09",
  status: "TEST",
  overallScore: 0,
  policyStatus: "GREEN",
  verdict: "BUILD",
  engineFamily: "TEST",
}).returning();
assert.ok(opportunity);

const acceptanceCriterion = "Representative request returns the exact expected structured output.";
const contract = {
  schemaVersion: 1 as const,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  product: { primaryShape: "API", builderProfile: "BACKEND_API" },
  firstTransaction: { target: "paid API trial" },
  scope: { externalSpendCeilingUsd: 0, minimumSellableOutcome: "One working endpoint" },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: [acceptanceCriterion],
  autonomy: { externalPublicationAllowed: false, customerChargingAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};

const [job] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-qa-${suffix}`,
  status: "QA_PENDING",
  productShape: "API",
  supportingShapes: [],
  builderProfile: "BACKEND_API",
  contract,
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
}).returning();
assert.ok(job);

const [workspace] = await db.insert(builderWorkspacesTable).values({
  buildJobId: job.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  workspaceKey: `test-workspace-${suffix}`,
  provider: "ZERO_COST_TEST_BUILDER",
  adapterKind: "TEST",
  costMode: "ZERO_CASH",
  status: "QA_PENDING",
  providerRunId: `initial-build-${job.id}`,
  repositoryUrl: `https://github.com/example/qa-build-${job.id}`,
  branchName: "builder-output",
  progressPercent: 100,
  statusSummary: "Fixture build ready for QA.",
}).returning();
assert.ok(workspace);

let qaDispatches = 0;
const qaInputs: QaDispatchInput[] = [];
const fakeQa: QaAgentAdapter = {
  provider: "ZERO_COST_TEST_QA",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    qaDispatches += 1;
    qaInputs.push(input);
    if (qaDispatches === 1) {
      return {
        providerRunId: `qa-${job.id}-1`,
        state: "FAILED",
        progressPercent: 100,
        summary: "Response payload shape is wrong.",
        repositoryUrl: input.repositoryUrl,
        branchName: input.branchName,
        acceptanceResults: [{ criterion: acceptanceCriterion, status: "FAIL", evidence: "Fixture assertion failed." }],
        defects: [{
          key: "RESPONSE_SCHEMA_MISMATCH",
          category: "ACCEPTANCE_GAP",
          severity: "HIGH",
          summary: "Endpoint returns the wrong response field.",
          evidence: "Expected result.value but received result.output.",
          repairGuidance: "Rename the response field and update the executable contract test.",
          humanOnly: false,
        }],
        baselineChecksPassed: true,
        requiresHumanAction: false,
        humanAction: null,
        externalCostCents: 0,
        metadata: { fixture: true },
      };
    }
    return {
      providerRunId: `qa-${job.id}-2`,
      state: "PASSED",
      progressPercent: 100,
      summary: "All acceptance and baseline checks passed.",
      repositoryUrl: input.repositoryUrl,
      branchName: input.branchName,
      acceptanceResults: [{ criterion: acceptanceCriterion, status: "PASS", evidence: "Fixture request matched exact expected output." }],
      defects: [],
      baselineChecksPassed: true,
      requiresHumanAction: false,
      humanAction: null,
      externalCostCents: 0,
      metadata: { fixture: true },
    };
  },
  async getStatus(providerRunId) {
    throw new Error(`Unexpected QA poll in immediate fixture: ${providerRunId}`);
  },
};

let repairs = 0;
const fakeBuilder: BuilderAgentAdapter = {
  provider: "ZERO_COST_TEST_BUILDER",
  costMode: "ZERO_CASH",
  async dispatch() {
    throw new Error("Initial builder dispatch must not run during QA fixture");
  },
  async getStatus(providerRunId) {
    return {
      providerRunId,
      repositoryUrl: workspace.repositoryUrl,
      branchName: workspace.branchName,
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "Fixture repair complete.",
      externalCostCents: 0,
    };
  },
  async repair(input) {
    repairs += 1;
    assert.equal(input.defects[0]?.key, "RESPONSE_SCHEMA_MISMATCH");
    assert.equal(input.acceptanceCriteria[0], acceptanceCriterion);
    return {
      providerRunId: `repair-${job.id}-${repairs}`,
      repositoryUrl: workspace.repositoryUrl,
      branchName: workspace.branchName,
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "Fixture defect repaired.",
      externalCostCents: 0,
    };
  },
};

await runQaDebugTick(fakeQa, fakeBuilder);
let runs = await db.select().from(qaRunsTable).where(eq(qaRunsTable.buildJobId, job.id)).orderBy(asc(qaRunsTable.roundNumber));
assert.equal(runs.length, 1);
assert.equal(runs[0]?.status, "DEFECTS_FOUND");
assert.equal(qaDispatches, 1);
assert.equal(repairs, 0);

await runQaDebugTick(fakeQa, fakeBuilder);
runs = await db.select().from(qaRunsTable).where(eq(qaRunsTable.buildJobId, job.id)).orderBy(asc(qaRunsTable.roundNumber));
assert.equal(runs[0]?.status, "RETEST_PENDING");
assert.equal(repairs, 1, "failed QA should trigger one targeted repair");

await runQaDebugTick(fakeQa, fakeBuilder);
runs = await db.select().from(qaRunsTable).where(eq(qaRunsTable.buildJobId, job.id)).orderBy(asc(qaRunsTable.roundNumber));
assert.equal(runs.length, 2, "successful repair must create a fresh independent QA round");
assert.equal(runs[1]?.status, "PASSED");
assert.equal(qaDispatches, 2);
assert.equal(qaInputs[0]?.idempotencyKey, `${workspace.workspaceKey}:qa-round-1`);
assert.equal(qaInputs[1]?.idempotencyKey, `${workspace.workspaceKey}:qa-round-2`);

const [completedJob] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, job.id));
assert.equal(completedJob?.status, "COMPLETE", "build must only complete after independent QA passes");
assert.ok(completedJob?.finishedAt);

await runQaDebugTick(fakeQa, fakeBuilder);
assert.equal(qaDispatches, 2, "completed build must not create duplicate QA rounds");
assert.equal(repairs, 1, "completed build must not repeat repair");

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost autonomous QA debug retest loop");
