import assert from "node:assert/strict";
import http from "node:http";
import { eq } from "drizzle-orm";
import {
  assetEconomicReviewsTable,
  assetIncidentsTable,
  assetRemediationRunsTable,
  assetTelemetrySyncsTable,
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
  reviewAssetEconomics,
  syncAssetTelemetry,
} from "../src/lib/asset-economics-worker";
import { activateAssetsFromCompletedReleases } from "../src/lib/asset-operations-worker";
import { runAssetRemediationTick } from "../src/lib/asset-remediation-worker";
import type { AssetTelemetryAdapter } from "../src/lib/asset-telemetry-adapter";
import type { BuilderAgentAdapter } from "../src/lib/builder-agent-adapter";
import type { QaAgentAdapter } from "../src/lib/qa-agent-adapter";
import type { ReleaseAgentAdapter } from "../src/lib/release-agent-adapter";

const migration = await prepareAssetOperationsSchema(pool);
for (const table of ["asset_telemetry_syncs", "asset_economic_reviews", "asset_remediation_runs", "asset_remediation_events"]) {
  assert.ok(migration.requiredTables.includes(table as never), `Task #74 migration must require ${table}`);
}
assert.equal((await prepareAssetOperationsSchema(pool)).appliedMigrationIds.length, 0, "Task #74 runtime migration must be idempotent");

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Autonomous operating Asset ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/autonomous-asset-${suffix}`,
  opportunityType: "web_app",
  thesis: "Fixture for authoritative telemetry and bounded autonomous maintenance.",
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
  scope: { externalSpendCeilingUsd: 0, minimumSellableOutcome: "One live app" },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: ["The existing product behavior remains functional."],
  autonomy: { externalPublicationAllowed: false, customerChargingAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};
const [build] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-autonomous-asset-build-${suffix}`,
  status: "COMPLETE",
  productShape: "WEB_APP",
  supportingShapes: [],
  builderProfile: "FULL_STACK_WEB",
  contract,
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
}).returning();
assert.ok(build);

const [workspace] = await db.insert(builderWorkspacesTable).values({
  buildJobId: build.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  workspaceKey: `test-autonomous-workspace-${suffix}`,
  provider: "ZERO_COST_BUILDER",
  adapterKind: "GENERIC_HTTP",
  costMode: "ZERO_CASH",
  status: "QA_PENDING",
  providerRunId: `original-builder-run-${suffix}`,
  repositoryUrl: `https://github.com/example/autonomous-asset-${suffix}`,
  branchName: "production",
  progressPercent: 100,
}).returning();
assert.ok(workspace);

const releasePlan: PersistedReleasePlan = {
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
  economics: { externalSpendCeilingCents: 0 },
  nextGate: "ASSET_CREATION_AND_OPERATIONS",
};
const activatedAt = new Date();
const [release] = await db.insert(releaseJobsTable).values({
  buildJobId: build.id,
  builderWorkspaceId: workspace.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `test-autonomous-release-${suffix}`,
  status: "COMPLETE",
  productShape: "WEB_APP",
  targetKind: "HOSTED_WEB",
  plan: releasePlan,
  releaseProvider: "ZERO_COST_RELEASE",
  releaseCostMode: "ZERO_CASH",
  previewProviderRunId: `preview-${suffix}`,
  previewIdempotencyKey: `preview-key-${suffix}`,
  previewUrl: `https://private.example.test/${suffix}`,
  previewVisibility: "PRIVATE",
  previewHealthPassed: true,
  productionProviderRunId: `production-${suffix}`,
  productionIdempotencyKey: `production-key-${suffix}`,
  productionUrl: `https://public.example.test/${suffix}`,
  productionVisibility: "PUBLIC",
  productionHealthPassed: true,
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
  publicReleaseAuthorizedAt: activatedAt,
  publicReleaseAuthorizedBy: "ZERO_COST_TEST",
  previewFinishedAt: activatedAt,
  productionFinishedAt: activatedAt,
  finishedAt: activatedAt,
}).returning();
assert.ok(release);

await activateAssetsFromCompletedReleases();
let [asset] = await db.select().from(assetsTable).where(eq(assetsTable.opportunityId, opportunity.id));
assert.ok(asset);
assert.ok(asset.nextTelemetrySyncAt, "new Assets must immediately enter telemetry scheduling");

const windowStart = new Date(asset.activatedAt.getTime() - 1_000);
const windowEnd = new Date(asset.activatedAt.getTime() + 60_000);
let telemetryCollectCalls = 0;
const telemetry: AssetTelemetryAdapter = {
  provider: "ZERO_COST_TELEMETRY",
  costMode: "ZERO_CASH",
  async collect() {
    telemetryCollectCalls += 1;
    return {
      cursor: "cursor-1",
      observations: [
        { eventId: "revenue-1", observationType: "REVENUE", amountCents: 10_000, quantity: null, unit: "USD_CENTS", externalReference: "charge-1", observedAt: new Date(asset.activatedAt.getTime() + 10_000), metadata: {} },
        { eventId: "cost-1", observationType: "COST", amountCents: 2_500, quantity: null, unit: "USD_CENTS", externalReference: "provider-cost-1", observedAt: new Date(asset.activatedAt.getTime() + 12_000), metadata: {} },
        { eventId: "transaction-1", observationType: "TRANSACTION", amountCents: null, quantity: 2, unit: "TRANSACTIONS", externalReference: "batch-1", observedAt: new Date(asset.activatedAt.getTime() + 10_000), metadata: {} },
      ],
      coverage: [
        { kind: "REVENUE", windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), complete: true },
        { kind: "COST", windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), complete: true },
        { kind: "TRANSACTION", windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), complete: true },
      ],
      summary: "Complete authoritative zero-cost fixture.",
      externalCostCents: 0,
    };
  },
};

assert.equal((await syncAssetTelemetry(asset, telemetry)).synced, true);
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.operatingMode, "OPERATING");
assert.equal(asset.revenueInstrumentationStatus, "INSTRUMENTED");
assert.equal(asset.costInstrumentationStatus, "INSTRUMENTED");
assert.equal(asset.totalObservedRevenueCents, 10_000);
assert.equal(asset.totalObservedCostCents, 2_500);
assert.equal(asset.totalObservedTransactions, 2);
assert.equal(asset.economicsStatus, "MEASURED_POSITIVE");

let reviews = await db.select().from(assetEconomicReviewsTable).where(eq(assetEconomicReviewsTable.assetId, asset.id));
const measured = reviews.find((item) => item.status === "MEASURED_POSITIVE");
assert.ok(measured);
assert.equal(measured.revenueCents, 10_000);
assert.equal(measured.costCents, 2_500);
assert.equal(measured.contributionMarginCents, 7_500);
assert.equal(measured.revenueComplete, true);
assert.equal(measured.costComplete, true);

const firstTotalRevenue = asset.totalObservedRevenueCents;
const firstTotalCost = asset.totalObservedCostCents;
await syncAssetTelemetry(asset, telemetry);
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.totalObservedRevenueCents, firstTotalRevenue, "provider event replay must not double-count revenue");
assert.equal(asset.totalObservedCostCents, firstTotalCost, "provider event replay must not double-count cost");
assert.ok(telemetryCollectCalls >= 2, "idempotency must protect replay even when the provider is called again");

const [successfulSync] = await db.select().from(assetTelemetrySyncsTable).where(eq(assetTelemetrySyncsTable.assetId, asset.id));
assert.ok(successfulSync);
await reviewAssetEconomics({
  assetId: asset.id,
  syncId: successfulSync.id + 1_000_000,
  coverage: [{ kind: "REVENUE", windowStart: windowStart.toISOString(), windowEnd: windowEnd.toISOString(), complete: true }],
});
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.economicsStatus, "INCOMPLETE", "missing authoritative cost coverage must never be interpreted as zero cost");
reviews = await db.select().from(assetEconomicReviewsTable).where(eq(assetEconomicReviewsTable.assetId, asset.id));
assert.ok(reviews.some((item) => item.status === "INCOMPLETE" && item.costComplete === false));

let meteredCollectCalls = 0;
const meteredTelemetry: AssetTelemetryAdapter = {
  provider: "METERED_TELEMETRY",
  costMode: "METERED",
  async collect() {
    meteredCollectCalls += 1;
    throw new Error("metered telemetry should not be invoked without a hard per-call ceiling");
  },
};
await syncAssetTelemetry(asset, meteredTelemetry);
assert.equal(meteredCollectCalls, 0, "generic metered telemetry must be blocked before provider invocation");

const server = http.createServer((_req, res) => {
  res.statusCode = 200;
  res.end("healthy");
});
await new Promise<void>((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});
const address = server.address();
assert.ok(address && typeof address === "object");
const liveUrl = `http://127.0.0.1:${address.port}`;
await db.update(assetsTable).set({ productionUrl: liveUrl, status: "DEGRADED", healthStatus: "UNHEALTHY", consecutiveHealthFailures: 3, updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));

const [incident] = await db.insert(assetIncidentsTable).values({
  assetId: asset.id,
  incidentKey: `test-remediation-incident-${suffix}`,
  incidentType: "AVAILABILITY",
  severity: "HIGH",
  status: "OPEN",
  summary: "Synthetic availability outage for autonomous maintenance.",
  evidence: { http_status: 503, fixture: true },
}).returning();
assert.ok(incident);

let repairCalls = 0;
const builderAdapter: BuilderAgentAdapter = {
  provider: "ZERO_COST_BUILDER",
  costMode: "ZERO_CASH",
  async dispatch() { throw new Error("new-build dispatch is not part of Asset remediation"); },
  async getStatus(providerRunId) {
    return { providerRunId, repositoryUrl: workspace.repositoryUrl, branchName: workspace.branchName, workspaceUrl: null, state: "SUCCEEDED", progressPercent: 100, summary: "repair done", externalCostCents: 0 };
  },
  async repair() {
    repairCalls += 1;
    return { providerRunId: `repair-${repairCalls}`, repositoryUrl: workspace.repositoryUrl, branchName: workspace.branchName, workspaceUrl: null, state: "SUCCEEDED", progressPercent: 100, summary: "bounded repair complete", externalCostCents: 0 };
  },
};

let qaCalls = 0;
const qaAdapter: QaAgentAdapter = {
  provider: "ZERO_COST_QA",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    qaCalls += 1;
    return {
      providerRunId: `qa-${qaCalls}`,
      state: "PASSED",
      progressPercent: 100,
      summary: "independent maintenance QA passed",
      repositoryUrl: input.repositoryUrl,
      branchName: input.branchName,
      acceptanceResults: input.acceptanceCriteria.map((criterion) => ({ criterion, status: "PASS" as const, evidence: "fixture pass" })),
      defects: [],
      baselineChecksPassed: true,
      requiresHumanAction: false,
      humanAction: null,
      externalCostCents: 0,
      metadata: {},
    };
  },
  async getStatus() { throw new Error("fixture QA completes on dispatch"); },
};

let releaseCalls = 0;
const releaseAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_RELEASE",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    releaseCalls += 1;
    if (input.stage === "PREVIEW") {
      return { providerRunId: `maintenance-preview-${releaseCalls}`, state: "SUCCEEDED", stage: "PREVIEW", url: `http://127.0.0.1:${address.port}/private-preview`, visibility: "PRIVATE", healthChecksPassed: true, retryable: false, summary: "private preview healthy", externalCostCents: 0, metadata: {} };
    }
    assert.equal(input.plan.production.explicitHumanAuthorityRequired, false, "same-surface maintenance should inherit existing public authority");
    assert.equal(input.plan.maintenance?.samePublicSurfaceRequired, true);
    assert.equal(input.plan.maintenance?.surfaceExpansionAllowed, false);
    assert.equal(input.plan.maintenance?.customerChargingExpansionAllowed, false);
    return { providerRunId: `maintenance-production-${releaseCalls}`, state: "SUCCEEDED", stage: "PRODUCTION", url: liveUrl, visibility: "PUBLIC", healthChecksPassed: true, retryable: false, summary: "same-surface production healthy", externalCostCents: 0, metadata: {} };
  },
  async getStatus() { throw new Error("fixture release completes on dispatch"); },
};

const adapters = { builder: builderAdapter, qa: qaAdapter, release: releaseAdapter };
const tick1 = await runAssetRemediationTick(adapters);
assert.ok(tick1.createdRunId, "open availability incident should create a durable remediation run");
await runAssetRemediationTick(adapters);
await runAssetRemediationTick(adapters);
await runAssetRemediationTick(adapters);
await runAssetRemediationTick(adapters);

let [run] = await db.select().from(assetRemediationRunsTable).where(eq(assetRemediationRunsTable.incidentId, incident.id));
assert.ok(run);
assert.equal(run.status, "COMPLETE");
assert.equal(run.externalSpendUsedCents, 0);
assert.equal(repairCalls, 1);
assert.equal(qaCalls, 1);
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
const [resolvedIncident] = await db.select().from(assetIncidentsTable).where(eq(assetIncidentsTable.id, incident.id));
assert.equal(asset.status, "ACTIVE");
assert.equal(asset.healthStatus, "HEALTHY");
assert.ok(asset.lastRemediationAt);
assert.equal(resolvedIncident.status, "RESOLVED");
assert.equal(asset.authorities.customerChargingAuthorized, false);
assert.equal(asset.authorities.outboundAuthorized, false);
assert.equal(asset.authorities.advertisingAuthorized, false);
assert.equal(asset.authorities.customDomainAuthorized, false);
assert.equal(asset.authorities.productionCredentialsAuthorized, false);

await db.update(assetsTable).set({ status: "DEGRADED", healthStatus: "UNHEALTHY", updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
const [surfaceIncident] = await db.insert(assetIncidentsTable).values({
  assetId: asset.id,
  incidentKey: `test-remediation-surface-${suffix}`,
  incidentType: "AVAILABILITY",
  severity: "HIGH",
  status: "OPEN",
  summary: "Synthetic outage for public-surface safety test.",
  evidence: { fixture: "surface-mismatch" },
}).returning();
assert.ok(surfaceIncident);

const surfaceChangingRelease: ReleaseAgentAdapter = {
  ...releaseAdapter,
  async dispatch(input) {
    if (input.stage === "PREVIEW") return releaseAdapter.dispatch(input);
    return { providerRunId: "unsafe-production", state: "SUCCEEDED", stage: "PRODUCTION", url: "https://different-public-surface.example.test", visibility: "PUBLIC", healthChecksPassed: true, retryable: false, summary: "provider tried a different URL", externalCostCents: 0, metadata: {} };
  },
};
const unsafeAdapters = { builder: builderAdapter, qa: qaAdapter, release: surfaceChangingRelease };
await runAssetRemediationTick(unsafeAdapters);
await runAssetRemediationTick(unsafeAdapters);
await runAssetRemediationTick(unsafeAdapters);
await runAssetRemediationTick(unsafeAdapters);
[run] = await db.select().from(assetRemediationRunsTable).where(eq(assetRemediationRunsTable.incidentId, surfaceIncident.id));
assert.equal(run?.status, "BLOCKED", "maintenance must block rather than adopt a different public surface");
[asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(asset.productionUrl, liveUrl, "unsafe maintenance result must not replace the Asset public URL");

await db.update(assetIncidentsTable).set({ status: "RESOLVED", resolvedAt: new Date(), updatedAt: new Date() }).where(eq(assetIncidentsTable.id, surfaceIncident.id));
await db.update(assetsTable).set({ status: "DEGRADED", healthStatus: "UNHEALTHY", updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
const [meteredIncident] = await db.insert(assetIncidentsTable).values({
  assetId: asset.id,
  incidentKey: `test-remediation-metered-${suffix}`,
  incidentType: "AVAILABILITY",
  severity: "HIGH",
  status: "OPEN",
  summary: "Synthetic outage for metered-backend safety test.",
  evidence: { fixture: "metered" },
}).returning();
assert.ok(meteredIncident);
let meteredRepairCalls = 0;
const meteredBuilder: BuilderAgentAdapter = {
  ...builderAdapter,
  costMode: "METERED",
  async repair(input) {
    meteredRepairCalls += 1;
    return builderAdapter.repair!(input);
  },
};
await runAssetRemediationTick({ builder: meteredBuilder, qa: qaAdapter, release: releaseAdapter });
const [meteredRun] = await db.select().from(assetRemediationRunsTable).where(eq(assetRemediationRunsTable.incidentId, meteredIncident.id));
assert.equal(meteredRun?.status, "BLOCKED");
assert.equal(meteredRepairCalls, 0, "generic metered repair must be blocked before provider invocation when no hard per-call ceiling is enforceable");

await new Promise<void>((resolve) => server.close(() => resolve()));
console.log("PASS zero-cost autonomous Asset monetization and remediation");
