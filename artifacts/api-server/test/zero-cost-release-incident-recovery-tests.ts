import assert from "node:assert/strict";
import { and, eq } from "drizzle-orm";
import {
  buildJobsTable,
  builderWorkspacesTable,
  db,
  humanActionsTable,
  opportunitiesTable,
  releaseJobsTable,
  type PersistedReleasePlan,
} from "@workspace/db";
import type { ReleaseAgentAdapter } from "../src/lib/release-agent-adapter";
import { createOrReuseHumanAction } from "../src/lib/human-gates";
import {
  recheckProductionReleaseSafely,
  retryPrivatePreviewAfterSafetyCorrection,
  runControlledReleaseTickSafely,
} from "../src/lib/controlled-release-safety";

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Release Incident Recovery ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/release-incident-${suffix}`,
  opportunityType: "api",
  thesis: "Fixture for safe recovery from release incidents.",
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
  firstTransaction: { target: "fixture" },
  scope: { externalSpendCeilingUsd: 0, minimumSellableOutcome: "fixture" },
  workspace: { productionCredentialsAllowed: false },
  acceptanceCriteria: ["Fixture acceptance criterion."],
  autonomy: { externalPublicationAllowed: false, customerChargingAllowed: false },
  nextGate: "BUILDER_WORKSPACE",
};

async function makeBase(label: string) {
  const [build] = await db.insert(buildJobsTable).values({
    opportunityId: opportunity.id,
    evaluationCycleId: null,
    idempotencyKey: `incident-build-${label}-${suffix}`,
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
    workspaceKey: `incident-workspace-${label}-${suffix}`,
    provider: "ZERO_COST_TEST_BUILDER",
    adapterKind: "GENERIC_HTTP",
    costMode: "ZERO_CASH",
    status: "QA_PENDING",
    providerRunId: `builder-${label}-${suffix}`,
    repositoryUrl: `https://github.com/example/incident-${label}-${suffix}`,
    branchName: "qa-passed",
    progressPercent: 100,
  }).returning();
  assert.ok(workspace);
  const plan: PersistedReleasePlan = {
    schemaVersion: 1,
    buildJobId: build.id,
    opportunityId: opportunity.id,
    productShape: "API",
    targetKind: "HOSTED_API",
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
  return { build, workspace, plan };
}

const previewBase = await makeBase("preview");
const [previewRelease] = await db.insert(releaseJobsTable).values({
  buildJobId: previewBase.build.id,
  builderWorkspaceId: previewBase.workspace.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `incident-preview-${suffix}`,
  status: "BLOCKED",
  productShape: "API",
  targetKind: "HOSTED_API",
  plan: previewBase.plan,
  releaseProvider: "ZERO_COST_TEST_RELEASE",
  releaseCostMode: "ZERO_CASH",
  previewProviderRunId: `unsafe-preview-${suffix}`,
  previewIdempotencyKey: `unsafe-preview-key-${suffix}`,
  previewUrl: `https://public.example.test/unsafe-${suffix}`,
  previewVisibility: "PUBLIC",
  previewHealthPassed: true,
  previewDispatchAttemptCount: 1,
  previewFinishedAt: new Date(),
  productionIdempotencyKey: `preview-production-${suffix}`,
  blockedReason: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
  lastErrorCode: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
}).returning();
assert.ok(previewRelease);

await createOrReuseHumanAction({
  opportunityId: opportunity.id,
  actionType: "UNAUTHORIZED_PUBLIC_PREVIEW",
  title: "Restrict an unintended public preview",
  whyNeeded: "Fixture preview exposure.",
  instructions: "Restrict the preview, then retry privately.",
  blockedStage: `CONTROLLED_RELEASE_PREVIEW_VISIBILITY:${previewRelease.id}`,
  requiredCapabilityKey: null,
  provider: "ZERO_COST_TEST_RELEASE",
  verificationMode: "AUTOMATED_CHECK",
  urgency: "CRITICAL",
  resumeAction: "NO_AUTOMATIC_RESUME",
  resumePayload: { release_job_id: previewRelease.id },
  inherentlyHumanAuthority: true,
});

const priorPreviewKey = previewRelease.previewIdempotencyKey;
await retryPrivatePreviewAfterSafetyCorrection({ releaseJobId: previewRelease.id, attestedBy: "ZERO_COST_TEST" });
let [previewRecovered] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, previewRelease.id));
assert.equal(previewRecovered?.status, "READY_FOR_PREVIEW");
assert.equal(previewRecovered?.blockedReason, null);
assert.equal(previewRecovered?.previewProviderRunId, null);
assert.equal(previewRecovered?.previewUrl, null);
assert.equal(previewRecovered?.previewVisibility, null);
assert.equal(previewRecovered?.previewHealthPassed, null);
assert.equal(previewRecovered?.previewFinishedAt, null);
assert.notEqual(previewRecovered?.previewIdempotencyKey, priorPreviewKey, "safety retry must use a fresh preview idempotency key");
const recoveredPreviewKey = previewRecovered!.previewIdempotencyKey;
const [previewAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "UNAUTHORIZED_PUBLIC_PREVIEW"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PREVIEW_VISIBILITY:${previewRelease.id}`),
));
assert.equal(previewAction?.status, "RESOLVED");

let freshPreviewDispatches = 0;
const freshPreviewAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_TEST_RELEASE",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    assert.equal(input.stage, "PREVIEW");
    assert.equal(input.idempotencyKey, recoveredPreviewKey);
    freshPreviewDispatches += 1;
    return {
      providerRunId: `safe-preview-${suffix}`,
      state: "SUCCEEDED",
      stage: "PREVIEW",
      url: `https://private.example.test/recovered-${suffix}`,
      visibility: "PRIVATE",
      healthChecksPassed: true,
      retryable: false,
      summary: "Recovered private preview is healthy.",
      externalCostCents: 0,
      metadata: {},
    };
  },
  async getStatus(providerRunId) {
    throw new Error(`Unexpected poll for terminal recovered preview ${providerRunId}`);
  },
};
await runControlledReleaseTickSafely(freshPreviewAdapter);
[previewRecovered] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, previewRelease.id));
assert.equal(previewRecovered?.status, "PREVIEW_READY");
assert.equal(previewRecovered?.previewVisibility, "PRIVATE");
assert.equal(previewRecovered?.previewHealthPassed, true);
assert.equal(freshPreviewDispatches, 1, "corrected exposure must result in exactly one fresh private preview dispatch");

// Isolate the production-recheck scenario below. The preview recovery behavior has
// already been verified through its terminal private-preview result above.
await db.update(releaseJobsTable).set({ status: "FAILED" }).where(eq(releaseJobsTable.id, previewRelease.id));

const productionBase = await makeBase("production");
const productionRunId = `production-recheck-${suffix}`;
const [productionRelease] = await db.insert(releaseJobsTable).values({
  buildJobId: productionBase.build.id,
  builderWorkspaceId: productionBase.workspace.id,
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `incident-production-${suffix}`,
  status: "BLOCKED",
  productShape: "API",
  targetKind: "HOSTED_API",
  plan: productionBase.plan,
  releaseProvider: "ZERO_COST_TEST_RELEASE",
  releaseCostMode: "METERED",
  previewProviderRunId: `healthy-preview-${suffix}`,
  previewIdempotencyKey: `healthy-preview-key-${suffix}`,
  previewUrl: `https://private.example.test/${suffix}`,
  previewVisibility: "PRIVATE",
  previewHealthPassed: true,
  previewDispatchAttemptCount: 1,
  previewFinishedAt: new Date(),
  productionProviderRunId: productionRunId,
  productionIdempotencyKey: `production-key-${suffix}`,
  productionUrl: `https://public.example.test/${suffix}`,
  productionVisibility: "UNKNOWN",
  productionHealthPassed: false,
  productionDispatchAttemptCount: 1,
  productionFinishedAt: new Date(),
  publicReleaseAuthorizedAt: new Date(),
  publicReleaseAuthorizedBy: "ZERO_COST_TEST",
  externalSpendCeilingCents: 500,
  externalSpendUsedCents: 75,
  blockedReason: "PRODUCTION_RELEASE_NOT_SAFELY_VERIFIED",
  lastErrorCode: "PRODUCTION_RELEASE_NOT_SAFELY_VERIFIED",
}).returning();
assert.ok(productionRelease);

await createOrReuseHumanAction({
  opportunityId: opportunity.id,
  actionType: "PRODUCTION_RELEASE_NEEDS_INTERVENTION",
  title: "Production release needs intervention",
  whyNeeded: "Fixture production health issue.",
  instructions: "Correct the provider-side issue, then recheck the existing deployment.",
  blockedStage: `CONTROLLED_RELEASE_PRODUCTION_HEALTH:${productionRelease.id}`,
  requiredCapabilityKey: null,
  provider: "ZERO_COST_TEST_RELEASE",
  verificationMode: "HUMAN_ATTESTATION",
  urgency: "CRITICAL",
  resumeAction: "NO_AUTOMATIC_RESUME",
  resumePayload: { release_job_id: productionRelease.id, provider_run_id: productionRunId },
  inherentlyHumanAuthority: true,
});

await recheckProductionReleaseSafely({ releaseJobId: productionRelease.id, attestedBy: "ZERO_COST_TEST" });
let [productionRecovered] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, productionRelease.id));
assert.equal(productionRecovered?.status, "PRODUCTION_DEPLOYING");
assert.equal(productionRecovered?.productionProviderRunId, productionRunId);
assert.ok(productionRecovered?.productionFinishedAt, "terminal marker must remain so cost cannot be counted twice on recheck");
const [productionAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "PRODUCTION_RELEASE_NEEDS_INTERVENTION"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PRODUCTION_HEALTH:${productionRelease.id}`),
));
assert.equal(productionAction?.status, "RESOLVED");

let dispatches = 0;
let polls = 0;
const recheckAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_TEST_RELEASE",
  costMode: "METERED",
  async dispatch() {
    dispatches += 1;
    throw new Error("production incident recovery must never redispatch");
  },
  async getStatus(providerRunId) {
    polls += 1;
    assert.equal(providerRunId, productionRunId);
    return {
      providerRunId,
      state: "SUCCEEDED",
      stage: "PRODUCTION",
      url: `https://public.example.test/${suffix}`,
      visibility: "PUBLIC",
      healthChecksPassed: true,
      retryable: false,
      summary: "Existing production deployment is now healthy.",
      externalCostCents: 75,
      metadata: {},
    };
  },
};

await runControlledReleaseTickSafely(recheckAdapter);
[productionRecovered] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, productionRelease.id));
assert.equal(productionRecovered?.status, "COMPLETE");
assert.equal(productionRecovered?.productionHealthPassed, true);
assert.equal(productionRecovered?.productionVisibility, "PUBLIC");
assert.equal(productionRecovered?.externalSpendUsedCents, 75, "rechecking an already-accounted terminal provider run must not double-count cost");
assert.equal(dispatches, 0);
assert.equal(polls, 1);

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost release incident recovery");
