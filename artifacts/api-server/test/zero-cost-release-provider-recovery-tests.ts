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
import { runControlledReleaseTickSafely } from "../src/lib/controlled-release-safety";

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db.insert(opportunitiesTable).values({
  name: `[TEST] Release Provider Recovery ${suffix}`,
  sourcePlatform: "TEST",
  sourceUrl: `https://example.test/release-provider-recovery-${suffix}`,
  opportunityType: "api",
  thesis: "Fixture for recovery of an in-flight release when the original provider returns.",
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
const [build] = await db.insert(buildJobsTable).values({
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `release-provider-recovery-build-${suffix}`,
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
  workspaceKey: `release-provider-recovery-workspace-${suffix}`,
  provider: "ZERO_COST_TEST_BUILDER",
  adapterKind: "GENERIC_HTTP",
  costMode: "ZERO_CASH",
  status: "QA_PENDING",
  providerRunId: `builder-${suffix}`,
  repositoryUrl: `https://github.com/example/recovery-${suffix}`,
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
  idempotencyKey: `release-provider-recovery-${suffix}`,
  status: "BLOCKED",
  productShape: "API",
  targetKind: "HOSTED_API",
  plan,
  releaseProvider: "ZERO_COST_ORIGINAL_RELEASE",
  releaseCostMode: "ZERO_CASH",
  previewProviderRunId: `preview-ok-${suffix}`,
  previewIdempotencyKey: `preview-recovery-${suffix}`,
  previewUrl: `https://private.example.test/recovery-${suffix}`,
  previewVisibility: "PRIVATE",
  previewHealthPassed: true,
  previewFinishedAt: new Date(),
  productionProviderRunId: `production-in-flight-${suffix}`,
  productionIdempotencyKey: `production-recovery-${suffix}`,
  publicReleaseAuthorizedAt: new Date(),
  publicReleaseAuthorizedBy: "ZERO_COST_TEST",
  blockedReason: "RELEASE_PROVIDER_CONTINUITY_REQUIRED",
  lastErrorCode: "RELEASE_PROVIDER_CONTINUITY_REQUIRED",
  externalSpendCeilingCents: 0,
  externalSpendUsedCents: 0,
}).returning();
assert.ok(release);

await createOrReuseHumanAction({
  opportunityId: opportunity.id,
  actionType: "RESTORE_RELEASE_PROVIDER_ACCESS",
  title: "Restore access to the in-flight release provider",
  whyNeeded: "Fixture provider continuity blocker.",
  instructions: "Restore the original release provider.",
  blockedStage: `CONTROLLED_RELEASE_PROVIDER_CONTINUITY:${release.id}`,
  requiredCapabilityKey: null,
  provider: "ZERO_COST_ORIGINAL_RELEASE",
  verificationMode: "HUMAN_ATTESTATION",
  urgency: "HIGH",
  resumeAction: "NO_AUTOMATIC_RESUME",
  resumePayload: { release_job_id: release.id },
  inherentlyHumanAuthority: true,
});

let polls = 0;
let dispatches = 0;
const restoredAdapter: ReleaseAgentAdapter = {
  provider: "ZERO_COST_ORIGINAL_RELEASE",
  costMode: "ZERO_CASH",
  async dispatch() {
    dispatches += 1;
    throw new Error("restored in-flight release must be polled, never redispatched");
  },
  async getStatus(providerRunId) {
    polls += 1;
    assert.equal(providerRunId, release.productionProviderRunId);
    return {
      providerRunId,
      state: "RUNNING",
      stage: "PRODUCTION",
      url: null,
      visibility: "UNKNOWN",
      healthChecksPassed: null,
      retryable: false,
      summary: "Original provider run is still in progress.",
      externalCostCents: 0,
      metadata: {},
    };
  },
};

await runControlledReleaseTickSafely(restoredAdapter);
const [resumed] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, release.id));
assert.equal(resumed?.status, "PRODUCTION_DEPLOYING");
assert.equal(resumed?.blockedReason, null);
assert.equal(resumed?.productionProviderRunId, release.productionProviderRunId);
assert.equal(dispatches, 0);
assert.equal(polls, 1, "restored provider should immediately resume polling the preserved run");

const [action] = await db.select().from(humanActionsTable).where(and(
  eq(humanActionsTable.opportunityId, opportunity.id),
  eq(humanActionsTable.actionType, "RESTORE_RELEASE_PROVIDER_ACCESS"),
  eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PROVIDER_CONTINUITY:${release.id}`),
));
assert.equal(action?.status, "RESOLVED", "provider continuity blocker should resolve automatically when the original provider returns");

await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunity.id));
console.log("PASS zero-cost release provider recovery");
