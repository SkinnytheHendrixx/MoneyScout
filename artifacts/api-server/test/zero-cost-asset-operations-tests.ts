import assert from "node:assert/strict";
import { eq } from "drizzle-orm";
import {
  assetIncidentsTable,
  assetObservationsTable,
  assetsTable,
  buildJobsTable,
  builderWorkspacesTable,
  db,
  opportunitiesTable,
  pool,
  prepareAssetOperationsSchema,
  releaseJobsTable,
  type PersistedReleasePlan,
} from "@workspace/db";
import {
  activateAssetsFromCompletedReleases,
  probeAssetHealth,
  recordAssetObservation,
  targetSupportsHttpHealthProbe,
} from "../src/lib/asset-operations-worker";

const migration1 = await prepareAssetOperationsSchema(pool);
assert.ok(migration1.requiredTables.includes("assets"));
assert.ok(migration1.requiredTables.includes("asset_health_checks"));
assert.ok(migration1.requiredTables.includes("asset_observations"));
assert.ok(migration1.requiredTables.includes("asset_incidents"));
const migration2 = await prepareAssetOperationsSchema(pool);
assert.equal(migration2.appliedMigrationIds.length, 0, "asset operations migration must be idempotent");
assert.equal(targetSupportsHttpHealthProbe("HOSTED_WEB"), true);
assert.equal(targetSupportsHttpHealthProbe("HOSTED_API"), true);
assert.equal(targetSupportsHttpHealthProbe("MARKETPLACE_PUBLICATION"), false);

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Operating Asset ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/asset-${suffix}`,
  opportunityType: "web_app",
  thesis: "Fixture for autonomous Asset activation and operations.",
  firstSeen: "2026-09-10",
  lastResearched: "2026-09-10",
  status: "BUILD_COMPLETE",
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
  product: { primaryShape: "WEB_APP", builderProfile: "FULL_STACK_WEB" },
  firstTransaction: { target: "paid checkout" },
  scope: { externalSpendCeilingUsd: 10, minimumSellableOutcome: "One live app" },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: ["Public app is healthy."],
  autonomy: { externalPublicationAllowed: false, customerChargingAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};
const [build] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-asset-build-${suffix}`,
  status: "COMPLETE",
  productShape: "WEB_APP",
  supportingShapes: [],
  builderProfile: "FULL_STACK_WEB",
  contract,
  externalSpendCeilingCents: 1_000,
  externalSpendUsedCents: 125,
}).returning();
assert.ok(build);

const [workspace] = await db.insert(builderWorkspacesTable).values({
  buildJobId: build.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  workspaceKey: `test-asset-workspace-${suffix}`,
  provider: "ZERO_COST_TEST_BUILDER",
  adapterKind: "GENERIC_HTTP",
  costMode: "ZERO_CASH",
  status: "QA_PENDING",
  repositoryUrl: `https://github.com/example/asset-${suffix}`,
  branchName: "production",
  progressPercent: 100,
}).returning();
assert.ok(workspace);

const plan: PersistedReleasePlan = {
  schemaVersion: 1,
  buildJobId: build.id,
  opportunityId: opportunity.id,
  productShape: "WEB_APP",
  targetKind: "HOSTED_WEB",
  artifact: { repositoryUrl: workspace.repositoryUrl!, branchName: workspace.branchName! },
  preview: { required: true, visibility: "PRIVATE", purpose: "DEPLOYMENT_HEALTH_VERIFICATION" },
  production: {
    publicReleaseRequired: true,
    explicitHumanAuthorityRequired: true,
    customDomainRequired: false,
    customerChargingAuthorized: false,
    productionCredentialsAuthorized: false,
    outboundAuthorized: false,
  },
  economics: { externalSpendCeilingCents: 500 },
  nextGate: "ASSET_CREATION_AND_OPERATIONS",
};
const now = new Date();
const [release] = await db.insert(releaseJobsTable).values({
  buildJobId: build.id,
  builderWorkspaceId: workspace.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-asset-release-${suffix}`,
  status: "COMPLETE",
  productShape: "WEB_APP",
  targetKind: "HOSTED_WEB",
  plan,
  releaseProvider: "ZERO_COST_TEST_RELEASE",
  releaseCostMode: "ZERO_CASH",
  previewProviderRunId: `preview-${suffix}`,
  previewIdempotencyKey: `preview-key-${suffix}`,
  previewUrl: `https://private.example.test/${suffix}`,
  previewVisibility: "PRIVATE",
  previewHealthPassed: true,
  previewDispatchAttemptCount: 1,
  productionProviderRunId: `production-${suffix}`,
  productionIdempotencyKey: `production-key-${suffix}`,
  productionUrl: `https://public.example.test/${suffix}`,
  productionVisibility: "PUBLIC",
  productionHealthPassed: true,
  productionDispatchAttemptCount: 1,
  externalSpendCeilingCents: 500,
  externalSpendUsedCents: 50,
  publicReleaseAuthorizedAt: now,
  publicReleaseAuthorizedBy: "ZERO_COST_TEST",
  previewFinishedAt: now,
  productionFinishedAt: now,
  finishedAt: now,
}).returning();
assert.ok(release);

assert.equal(await activateAssetsFromCompletedReleases(), 1, "verified public release should activate one Asset");
assert.equal(await activateAssetsFromCompletedReleases(), 0, "activation must be idempotent");

let [asset] = await db.select().from(assetsTable).where(eq(assetsTable.opportunityId, opportunity.id));
assert.ok(asset);
assert.equal(asset.activationReleaseJobId, release.id);
assert.equal(asset.currentReleaseJobId, release.id);
assert.equal(asset.status, "ACTIVE");
assert.equal(asset.operatingMode, "MONITOR_ONLY");
assert.equal(asset.authorities.publicReleaseAuthorized, true);
assert.equal(asset.authorities.customerChargingAuthorized, false);
assert.equal(asset.authorities.outboundAuthorized, false);
assert.equal(asset.authorities.advertisingAuthorized, false);
assert.equal(asset.authorities.customDomainAuthorized, false);
assert.equal(asset.operationsPolicy.allowExternalSpend, false);
assert.equal(asset.operationsPolicy.autoKill, false);
assert.equal(asset.revenueInstrumentationStatus, "UNINSTRUMENTED");
assert.equal(asset.totalObservedRevenueCents, 0);
assert.equal(asset.totalObservedCostCents, 175, "known build and release cash costs should be attributed as FACT observations");

const costs = await db.select().from(assetObservationsTable).where(eq(assetObservationsTable.assetId, asset.id));
assert.equal(costs.filter((item) => item.observationType === "COST" && item.provenance === "FACT").length, 2);

await recordAssetObservation({
  assetId: asset.id,
  observationType: "REVENUE",
  source: "UNVERIFIED_TEST_SOURCE",
  idempotencyKey: `claim-revenue-${suffix}`,
  provenance: "CLAIM",
  amountCents: 10_000,
  unit: "USD_CENTS",
  observedAt: now,
});
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.totalObservedRevenueCents, 0, "CLAIM revenue must never be promoted into observed revenue totals");
assert.equal(asset.revenueInstrumentationStatus, "UNINSTRUMENTED");

const factRevenue = {
  assetId: asset.id,
  observationType: "REVENUE" as const,
  source: "ZERO_COST_PAYMENT_FIXTURE",
  idempotencyKey: `fact-revenue-${suffix}`,
  provenance: "FACT" as const,
  amountCents: 5_000,
  unit: "USD_CENTS",
  observedAt: now,
};
assert.equal((await recordAssetObservation(factRevenue)).created, true);
assert.equal((await recordAssetObservation(factRevenue)).created, false, "duplicate telemetry must be idempotent");
await recordAssetObservation({
  assetId: asset.id,
  observationType: "TRANSACTION",
  source: "ZERO_COST_PAYMENT_FIXTURE",
  idempotencyKey: `fact-transactions-${suffix}`,
  provenance: "FACT",
  quantity: 2,
  unit: "TRANSACTIONS",
  observedAt: now,
});
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.totalObservedRevenueCents, 5_000);
assert.equal(asset.totalObservedTransactions, 2);
assert.equal(asset.revenueInstrumentationStatus, "INSTRUMENTED");

const healthyFetch: typeof fetch = async () => new Response("ok", { status: 200 });
await probeAssetHealth(asset, healthyFetch);
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.healthStatus, "HEALTHY");
assert.equal(asset.status, "ACTIVE");
assert.equal(asset.consecutiveHealthFailures, 0);

const unhealthyFetch: typeof fetch = async () => new Response("unavailable", { status: 503 });
for (let attempt = 1; attempt <= 3; attempt += 1) {
  await probeAssetHealth(asset, unhealthyFetch);
  [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
  assert.equal(asset.consecutiveHealthFailures, attempt);
}
assert.equal(asset.healthStatus, "UNHEALTHY");
assert.equal(asset.status, "DEGRADED");
assert.notEqual(asset.status, "KILLED", "health failures must never auto-kill the Asset");
assert.equal(asset.authorities.customerChargingAuthorized, false, "health state must not broaden commercial authority");

let [incident] = await db.select().from(assetIncidentsTable).where(eq(assetIncidentsTable.assetId, asset.id));
assert.ok(incident);
assert.equal(incident.status, "OPEN");
assert.equal(incident.incidentType, "AVAILABILITY");

await probeAssetHealth(asset, healthyFetch);
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
[incident] = await db.select().from(assetIncidentsTable).where(eq(assetIncidentsTable.assetId, asset.id));
assert.equal(asset.healthStatus, "HEALTHY");
assert.equal(asset.status, "ACTIVE");
assert.equal(asset.consecutiveHealthFailures, 0);
assert.equal(incident?.status, "RESOLVED");

console.log("PASS zero-cost asset operations kernel");
