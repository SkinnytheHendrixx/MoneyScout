import assert from "node:assert/strict";
import { count, eq } from "drizzle-orm";
import {
  betCostAttributionsTable,
  betsTable,
  buildJobsTable,
  db,
  opportunitiesTable,
} from "@workspace/db";
import { reconcileBet } from "../src/lib/bet-reconciliation-worker";
import { approveBet, createBetProposal } from "../src/routes/bets";

const [opportunity] = await db
  .insert(opportunitiesTable)
  .values({
    name: "Bet integration fixture",
    sourcePlatform: "FIXTURE",
    sourceUrl: "https://example.test/bet-fixture",
    opportunityType: "api",
    thesis: "A bounded fixture thesis.",
    firstSeen: "2026-09-10",
    lastResearched: "2026-09-10",
    status: "Active",
    overallScore: "80",
    policyStatus: "GREEN",
    verdict: "BUILD",
    engineFamily: "TEST",
  })
  .returning();
if (!opportunity) throw new Error("fixture opportunity missing");

const estimate = {
  status: "UNKNOWN" as const,
  lower: null,
  upper: null,
  unit: null,
  evidenceRefs: [],
  rationale: "Unknown remains unknown.",
};
const makeBucket = (allocated: number | null, unit = "USD_CENTS") => ({
  allocated,
  committed: 0,
  consumed: 0,
  remaining: allocated,
  unit,
});
const proposalInput = {
  opportunityId: opportunity.id,
  evaluationCycleId: null,
  idempotencyKey: `bet-integration:${opportunity.id}`,
  decisionContract: {
    schemaVersion: 1 as const,
    thesis: opportunity.thesis,
    rationale:
      "Fixture verifies durable zero-cash allocation without external side effects.",
    underwritingReference: {
      evaluationCycleId: null,
      snapshotRef: "fixture:underwriting",
    },
    upside: estimate,
    keyRisks: ["Economics remain unknown."],
    unknowns: ["No observed revenue."],
    reversibility: {
      level: "HIGH" as const,
      downsideExposure: estimate,
      notes: [],
    },
    successCriteria: ["The bounded Build passes independent QA."],
    failureCriteria: ["The resource envelope is exceeded."],
    iterateCriteria: [
      "Scope can shrink without changing the commercial thesis.",
    ],
    decisionHorizon: {
      status: "UNKNOWN" as const,
      earliestAt: null,
      latestAt: null,
      evidenceRefs: [],
    },
    humanCapabilityDependencies: [],
    expectedMaintenanceBurden: estimate,
    expectedSupportBurden: estimate,
    expectedOperationalComplexity: {
      status: "UNKNOWN" as const,
      level: null,
      evidenceRefs: [],
      notes: [],
    },
  },
  resourceEnvelope: {
    schemaVersion: 1 as const,
    externalCash: makeBucket(0),
    providerServices: makeBucket(0),
    research: makeBucket(null),
    build: makeBucket(0),
    release: makeBucket(0),
    experiment: makeBucket(null),
    operations: makeBucket(0),
    autonomousCapacity: makeBucket(8, "AGENT_HOURS"),
    humanDependencyBurden: makeBucket(null, "HUMAN_ACTIONS"),
    accountingAsOf: null,
  },
  buildEnvelope: {
    schemaVersion: 1 as const,
    maximumExternalBuildSpendCents: 0,
    allowedExternalServiceBudgetCents: 0,
    acceptableBuildComplexity: "LOW" as const,
    acceptableMaintenanceBurden: "LOW" as const,
    acceptableOperatingCost: estimate,
    requiredReversibility: "HIGH" as const,
    permittedProductScope: ["API"],
    requiredAcceptanceCriteria: ["Representative workflow passes."],
    onlyExistingZeroCashCapabilities: true,
    hardConstraints: ["No paid provider calls."],
  },
};

try {
  const proposed = await createBetProposal(proposalInput);
  assert.equal(
    proposed.bet.status,
    "PROPOSED",
    "a BUILD Opportunity must not automatically imply allocated capital",
  );
  const reusedProposal = await createBetProposal(proposalInput);
  assert.equal(reusedProposal.reused, true);
  assert.equal(reusedProposal.bet.id, proposed.bet.id);

  const approved = await approveBet({ betId: proposed.bet.id });
  assert.equal(approved.kind, "APPROVED");
  if (approved.kind !== "APPROVED")
    throw new Error("fixture Bet was not approved");
  assert.equal(approved.bet.approvedBy, "ZERO_CASH_POLICY");
  const repeatedApproval = await approveBet({ betId: proposed.bet.id });
  assert.equal(repeatedApproval.kind, "APPROVED");
  if (repeatedApproval.kind === "APPROVED")
    assert.equal(repeatedApproval.reused, true);

  const [build] = await db
    .insert(buildJobsTable)
    .values({
      opportunityId: opportunity.id,
      betId: proposed.bet.id,
      idempotencyKey: `bet-integration-build:${proposed.bet.id}`,
      status: "READY_FOR_BUILDER",
      productShape: "API",
      supportingShapes: [],
      builderProfile: "BACKEND_API",
      contract: {
        schemaVersion: 1,
        opportunityId: opportunity.id,
        evaluationCycleId: null,
        product: {},
        firstTransaction: {},
        scope: {},
        workspace: {},
        acceptanceCriteria: [],
        autonomy: {},
        nextGate: "BUILDER_WORKSPACE",
        investment: {
          betId: proposed.bet.id,
          buildEnvelope: proposalInput.buildEnvelope,
          grantsDownstreamAuthority: false,
        },
      },
      externalSpendCeilingCents: 0,
      externalSpendUsedCents: 0,
    })
    .returning();
  if (!build) throw new Error("fixture build missing");

  await reconcileBet(proposed.bet.id);
  await reconcileBet(proposed.bet.id);
  const [attributionCount] = await db
    .select({ value: count() })
    .from(betCostAttributionsTable)
    .where(eq(betCostAttributionsTable.betId, proposed.bet.id));
  assert.equal(
    attributionCount?.value,
    1,
    "repeated reconciliation must upsert one attribution per existing cost source",
  );
  let [reconciled] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, proposed.bet.id));
  assert.equal(reconciled?.consumedExternalCashCents, 0);

  await db
    .update(buildJobsTable)
    .set({ externalSpendUsedCents: 1, updatedAt: new Date() })
    .where(eq(buildJobsTable.id, build.id));
  await reconcileBet(proposed.bet.id);
  [reconciled] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, proposed.bet.id));
  assert.equal(
    reconciled?.status,
    "EXHAUSTED",
    "unexpected spend beyond a zero-cash envelope must stop the Bet safely",
  );
  assert.equal(reconciled?.consumedExternalCashCents, 1);
} finally {
  await db
    .delete(buildJobsTable)
    .where(eq(buildJobsTable.opportunityId, opportunity.id));
  await db.delete(betsTable).where(eq(betsTable.opportunityId, opportunity.id));
  await db
    .delete(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunity.id));
}

console.log("PASS zero-cost durable Bet integration and reconciliation");
