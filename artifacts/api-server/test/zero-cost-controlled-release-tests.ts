import assert from "node:assert/strict";
import { and, eq } from "drizzle-orm";
import {
  buildJobsTable,
  builderWorkspacesTable,
  db,
  humanActionsTable,
  opportunitiesTable,
  pool,
  prepareControlledReleaseSchema,
  qaRunsTable,
  releaseJobsTable,
} from "@workspace/db";
import type {
  ReleaseAgentAdapter,
  ReleaseDispatchInput,
} from "../src/lib/release-agent-adapter";
import {
  authorizePublicRelease,
  runControlledReleaseTick,
} from "../src/lib/controlled-release-worker";

const migration1 = await prepareControlledReleaseSchema(pool);
assert.ok(migration1.requiredTables.includes("release_jobs"));
assert.ok(migration1.requiredTables.includes("release_events"));
const migration2 = await prepareControlledReleaseSchema(pool);
assert.equal(migration2.appliedMigrationIds.length, 0, "controlled release migration must be idempotent");

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Controlled Release ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/release-${suffix}`,
  opportunityType: "api",
  thesis: "Fixture opportunity for zero-cost release verification.",
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
const [build] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-release-build-${suffix}`,
  status: "COMPLETE",
  productShape: "API",
  supportingShapes: [],
  builderProfile: "BACKEND_API",
  contract,
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
}).returning();
assert.ok(build);

const [workspace] = await db.insert(builderWorkspacesTable).values({
  buildJobId: build.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  workspaceKey: `test-release-workspace-${suffix}`,
  provider: "ZERO_COST_TEST_BUILDER",
  adapterKind: "GENERIC_HTTP",
  costMode: "ZERO_CASH",
  status: "QA_PENDING",
  providerRunId: `builder-run-${suffix}`,
  repositoryUrl: `https://github.com/example/release-${suffix}`,
  branchName: "qa-passed",
  progressPercent: 100,
  statusSummary: "Fixture build passed QA.",
}).returning();
assert.ok(workspace);

await db.insert(qaRunsTable).values({
  buildJobId: build.id,
  builderWorkspaceId: workspace.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  roundNumber: 1,
  status: "PASSED",
  qaProvider: "ZERO_COST_TEST_QA",
  qaCostMode: "ZERO_CASH",
  qaProviderRunId: `qa-run-${suffix}`,
  qaIdempotencyKey: `qa-release-${suffix}`,
  repositoryUrl: workspace.repositoryUrl,
  branchName: workspace.branchName,
  acceptanceCriteria: contract.acceptanceCriteria,
  acceptanceResults: [{ criterion: contract.acceptanceCriteria[0]!, status: "PASS", evidence: "fixture" }],
  defects: [],
  baselineChecksPassed: "true",
});

let previewDispatches = 0;
let productionDispatches = 0;
const captured: ReleaseDispatchInput[] = [];
const fakeAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_TEST_RELEASE",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    captured.push(input);
    if (input.stage === "PREVIEW") {
      previewDispatches += 1;
      return {
        providerRunId: `preview-${build.id}`,
        state: "SUCCEEDED",
        stage: "PREVIEW",
        url: `https://private.example.test/${build.id}`,
        visibility: "PRIVATE",
        healthChecksPassed: true,
        retryable: false,
        summary: "Private fixture preview healthy.",
        externalCostCents: 0,
        metadata: {},
      };
    }
    productionDispatches += 1;
    return {
      providerRunId: `production-${build.id}`,
      state: "SUCCEEDED",
      stage: "PRODUCTION",
      url: `https://public.example.test/${build.id}`,
      visibility: "PUBLIC",
      healthChecksPassed: true,
      retryable: false,
      summary: "Public fixture release healthy.",
      externalCostCents: 0,
      metadata: {},
    };
  },
  async getStatus(providerRunId) {
    throw new Error(`Unexpected status poll for immediately terminal fixture run ${providerRunId}`);
  },
};

await runControlledReleaseTick(fakeAdapter);
assert.equal(previewDispatches, 1, "QA-passed build should receive exactly one private preview dispatch");
assert.equal(productionDispatches, 0, "production must not dispatch during preview");

let [release] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.buildJobId, build.id));
assert.ok(release);
assert.equal(release.previewVisibility, "PRIVATE");
assert.equal(release.previewHealthPassed, true);
assert.equal(release.status, "PREVIEW_READY");

await runControlledReleaseTick(fakeAdapter);
[release] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.buildJobId, build.id));
assert.equal(release?.status, "WAITING_FOR_PUBLIC_AUTHORITY");
assert.equal(productionDispatches, 0, "verified preview alone must never authorize public release");

const [authorityAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "AUTHORIZE_PUBLIC_RELEASE"),
));
assert.ok(authorityAction, "public release should appear as a structured Needs You action");
assert.equal(authorityAction.status, "OPEN");

await runControlledReleaseTick(fakeAdapter);
assert.equal(productionDispatches, 0, "repeated worker ticks must remain blocked without explicit authority");

await authorizePublicRelease({ releaseJobId: release!.id, authorizedBy: "ZERO_COST_TEST" });
await runControlledReleaseTick(fakeAdapter);
assert.equal(productionDispatches, 1, "authorized production release should dispatch exactly once");

[release] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.buildJobId, build.id));
assert.equal(release?.status, "COMPLETE");
assert.equal(release?.productionVisibility, "PUBLIC");
assert.equal(release?.productionHealthPassed, true);
assert.equal(release?.productionUrl, `https://public.example.test/${build.id}`);
assert.ok(release?.publicReleaseAuthorizedAt);

await runControlledReleaseTick(fakeAdapter);
await runControlledReleaseTick(fakeAdapter);
assert.equal(previewDispatches, 1, "completed release must never repeat private preview");
assert.equal(productionDispatches, 1, "completed release must never repeat public deployment");
assert.equal(captured[0]?.plan.production.customerChargingAuthorized, false);
assert.equal(captured[1]?.plan.production.customerChargingAuthorized, false);
assert.equal(captured[1]?.plan.production.customDomainRequired, false);
assert.equal(captured[1]?.plan.production.outboundAuthorized, false);

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost controlled release");
