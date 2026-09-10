import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import {
  buildJobsTable,
  builderWorkspacesTable,
  db,
  opportunitiesTable,
  pool,
  prepareBuilderWorkspaceSchema,
} from "@workspace/db";
import type {
  BuilderAgentAdapter,
  BuilderDispatchInput,
} from "../src/lib/builder-agent-adapter";
import { configuredBuilderAdapter } from "../src/lib/builder-agent-adapter";
import { runBuilderWorkspaceTick } from "../src/lib/builder-workspace-worker";

const firstMigration = await prepareBuilderWorkspaceSchema(pool);
assert.ok(firstMigration.requiredTables.includes("builder_workspaces"));
assert.ok(firstMigration.requiredTables.includes("builder_workspace_events"));
const secondMigration = await prepareBuilderWorkspaceSchema(pool);
assert.equal(secondMigration.appliedMigrationIds.length, 0, "builder runtime migration must be idempotent");

const oldUrl = process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL;
delete process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL;
assert.equal(configuredBuilderAdapter(), null, "builder adapter must be absent when no backend is configured");
if (oldUrl !== undefined) process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL = oldUrl;

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Builder Workspace ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/${suffix}`,
  opportunityType: "api",
  thesis: "Fixture opportunity for zero-cost builder workspace verification.",
  firstSeen: "2026-09-09",
  lastResearched: "2026-09-09",
  status: "TEST",
  overallScore: 0,
  policyStatus: "GREEN",
  verdict: "BUILD",
  engineFamily: "TEST",
}).returning();
assert.ok(opportunity);

const contract = {
  schemaVersion: 1 as const,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  product: { primaryShape: "API", builderProfile: "BACKEND_API" },
  firstTransaction: { target: "paid API trial" },
  scope: { externalSpendCeilingUsd: 0, minimumSellableOutcome: "One working endpoint" },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: ["Representative request returns expected structured output."],
  autonomy: { externalPublicationAllowed: false, customerChargingAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};
const [job] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-builder-${suffix}`,
  status: "READY_FOR_BUILDER",
  productShape: "API",
  supportingShapes: [],
  builderProfile: "BACKEND_API",
  contract,
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
}).returning();
assert.ok(job);

let dispatches = 0;
let captured: BuilderDispatchInput | null = null;
const fakeAdapter: BuilderAgentAdapter = {
  provider: "ZERO_COST_TEST_BUILDER",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    dispatches += 1;
    captured = input;
    return {
      providerRunId: `run-${job.id}`,
      repositoryUrl: `https://github.com/example/build-${job.id}`,
      branchName: "builder-output",
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "Fixture builder completed.",
    };
  },
  async getStatus(providerRunId) {
    return {
      providerRunId,
      repositoryUrl: `https://github.com/example/build-${job.id}`,
      branchName: "builder-output",
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "Fixture builder completed.",
    };
  },
};

await runBuilderWorkspaceTick(fakeAdapter);
assert.equal(dispatches, 1, "READY_FOR_BUILDER should dispatch exactly once");
assert.equal(captured?.buildJobId, job.id);
assert.equal(captured?.contract.acceptanceCriteria[0], contract.acceptanceCriteria[0]);

const [workspace] = await db.select().from(builderWorkspacesTable).where(eq(builderWorkspacesTable.buildJobId, job.id));
assert.ok(workspace);
assert.equal(workspace.status, "QA_PENDING");
assert.equal(workspace.provider, "ZERO_COST_TEST_BUILDER");
assert.equal(workspace.providerRunId, `run-${job.id}`);
assert.equal(workspace.progressPercent, 100);

const [updatedJob] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, job.id));
assert.equal(updatedJob?.status, "QA_PENDING");

await runBuilderWorkspaceTick(fakeAdapter);
assert.equal(dispatches, 1, "a completed durable workspace must never be dispatched a second time");

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost builder workspace");
