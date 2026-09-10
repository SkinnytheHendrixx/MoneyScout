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
import {
  authorizePublicReleaseSafely,
  authorizeReleaseSpendSafely,
  runControlledReleaseTickSafely,
  surfacePreviewVisibilityViolations,
} from "../src/lib/controlled-release-safety";
import { createOrReuseHumanAction } from "../src/lib/human-gates";

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Release Safety ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/release-safety-${suffix}`,
  opportunityType: "api",
  thesis: "Adversarial fixture for controlled release safety boundaries.",
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

async function createReleaseFixture(label: string, values: Partial<typeof releaseJobsTable.$inferInsert> = {}) {
  const [build] = await db.insert(buildJobsTable).values({
    opportunityId: opportunity.id,
    evaluationCycleId: null,
    idempotencyKey: `release-safety-build-${label}-${suffix}`,
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
    workspaceKey: `release-safety-workspace-${label}-${suffix}`,
    provider: "ZERO_COST_TEST_BUILDER",
    adapterKind: "GENERIC_HTTP",
    costMode: "ZERO_CASH",
    status: "QA_PENDING",
    providerRunId: `builder-${label}-${suffix}`,
    repositoryUrl: `https://github.com/example/${label}-${suffix}`,
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
  const [release] = await db.insert(releaseJobsTable).values({
    buildJobId: build.id,
    builderWorkspaceId: workspace.id,
    opportunityId: opportunity.id,
    evaluationCycleId: null,
    idempotencyKey: `release-safety-${label}-${suffix}`,
    status: "READY_FOR_PREVIEW",
    productShape: "API",
    targetKind: "HOSTED_API",
    plan,
    releaseProvider: "ZERO_COST_OLD_RELEASE",
    releaseCostMode: "ZERO_CASH",
    previewIdempotencyKey: `release-safety-${label}-preview-${suffix}`,
    productionIdempotencyKey: `release-safety-${label}-production-${suffix}`,
    externalSpendCeilingCents: 0,
    externalSpendUsedCents: 0,
    ...values,
  }).returning();
  assert.ok(release);
  return release;
}

const visibilityViolation = await createReleaseFixture("visibility", {
  status: "BLOCKED",
  blockedReason: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
  previewProviderRunId: `preview-public-${suffix}`,
  previewUrl: `https://accidentally-public.example.test/${suffix}`,
  previewVisibility: "PUBLIC",
  previewHealthPassed: true,
  previewFinishedAt: new Date(),
  lastErrorCode: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
});

await authorizeReleaseSpendSafely({
  releaseJobId: visibilityViolation.id,
  ceilingCents: 500,
  authorizedBy: "ZERO_COST_TEST",
});
let [visibilityAfterSpend] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, visibilityViolation.id));
assert.equal(visibilityAfterSpend?.status, "BLOCKED", "budget authority must not clear an unrelated safety block");
assert.equal(visibilityAfterSpend?.blockedReason, "PREVIEW_VISIBILITY_SAFETY_VIOLATION");
assert.equal(visibilityAfterSpend?.externalSpendCeilingCents, 500);
assert.equal(visibilityAfterSpend?.plan.economics.externalSpendCeilingCents, 500);
await assert.rejects(
  authorizePublicReleaseSafely({ releaseJobId: visibilityViolation.id, authorizedBy: "ZERO_COST_TEST" }),
  /healthy private preview/i,
  "an accidentally public preview can never qualify for public-release authority",
);

await surfacePreviewVisibilityViolations();
const [visibilityAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "UNAUTHORIZED_PUBLIC_PREVIEW"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PREVIEW_VISIBILITY:${visibilityViolation.id}`),
));
assert.ok(visibilityAction);
assert.equal(visibilityAction.status, "OPEN");
assert.equal(visibilityAction.urgency, "CRITICAL");

const inFlight = await createReleaseFixture("provider-continuity", {
  status: "PRODUCTION_DEPLOYING",
  previewProviderRunId: `preview-ok-${suffix}`,
  previewUrl: `https://private.example.test/${suffix}`,
  previewVisibility: "PRIVATE",
  previewHealthPassed: true,
  previewFinishedAt: new Date(),
  productionProviderRunId: `old-provider-production-${suffix}`,
  publicReleaseAuthorizedAt: new Date(),
  publicReleaseAuthorizedBy: "ZERO_COST_TEST",
});

let unsafeDispatches = 0;
let unsafePolls = 0;
const replacementAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_NEW_RELEASE",
  costMode: "ZERO_CASH",
  async dispatch() {
    unsafeDispatches += 1;
    throw new Error("replacement provider must never receive this in-flight release");
  },
  async getStatus() {
    unsafePolls += 1;
    throw new Error("replacement provider must never poll a foreign provider run");
  },
};

await runControlledReleaseTickSafely(replacementAdapter);
const [continuityBlocked] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, inFlight.id));
assert.equal(continuityBlocked?.status, "BLOCKED");
assert.equal(continuityBlocked?.blockedReason, "RELEASE_PROVIDER_CONTINUITY_REQUIRED");
assert.equal(continuityBlocked?.releaseProvider, "ZERO_COST_OLD_RELEASE", "provider ownership of the in-flight run must be preserved");
assert.equal(unsafeDispatches, 0);
assert.equal(unsafePolls, 0);
await assert.rejects(
  authorizePublicReleaseSafely({ releaseJobId: inFlight.id, authorizedBy: "ZERO_COST_TEST" }),
  /already been attempted/i,
  "public-release authority cannot be reissued after production has begun",
);
const [continuityAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "RESTORE_RELEASE_PROVIDER_ACCESS"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PROVIDER_CONTINUITY:${inFlight.id}`),
));
assert.ok(continuityAction);
assert.equal(continuityAction.status, "OPEN");

const spendA = await createReleaseFixture("spend-a", {
  status: "BLOCKED",
  blockedReason: "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED",
  lastErrorCode: "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED",
});
const spendB = await createReleaseFixture("spend-b", {
  status: "BLOCKED",
  blockedReason: "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED",
  lastErrorCode: "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED",
});

for (const release of [spendA, spendB]) {
  await createOrReuseHumanAction({
    opportunityId: opportunity.id,
    actionType: "AUTHORIZE_RELEASE_SPEND",
    title: "Set a bounded release budget",
    whyNeeded: "Fixture metered release budget gate.",
    instructions: "Authorize only this release budget.",
    blockedStage: `CONTROLLED_RELEASE_SPEND:${release.id}:PREVIEW`,
    requiredCapabilityKey: null,
    provider: "ZERO_COST_TEST_RELEASE",
    verificationMode: "AUTOMATED_CHECK",
    urgency: "NORMAL",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { release_job_id: release.id, stage: "PREVIEW" },
    inherentlyHumanAuthority: true,
  });
}

await authorizeReleaseSpendSafely({ releaseJobId: spendA.id, ceilingCents: 250, authorizedBy: "ZERO_COST_TEST" });
const [spendAAfter] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, spendA.id));
const [spendBAfter] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, spendB.id));
assert.equal(spendAAfter?.status, "READY_FOR_PREVIEW");
assert.equal(spendAAfter?.blockedReason, null);
assert.equal(spendBAfter?.status, "BLOCKED", "one release budget approval must not unlock another release");
assert.equal(spendBAfter?.blockedReason, "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED");

const [spendAAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "AUTHORIZE_RELEASE_SPEND"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_SPEND:${spendA.id}:PREVIEW`),
));
const [spendBAction] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "AUTHORIZE_RELEASE_SPEND"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_SPEND:${spendB.id}:PREVIEW`),
));
assert.equal(spendAAction?.status, "RESOLVED");
assert.equal(spendBAction?.status, "OPEN");

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost controlled release safety");
