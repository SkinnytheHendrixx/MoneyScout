import assert from "node:assert/strict";
import type {
  BetBuildEnvelope,
  BetDecisionContract,
  BetResourceEnvelope,
} from "@workspace/db";
import {
  approvalRequiresHumanCapitalAuthority,
  assertBetTransition,
  betCanInitiateBuild,
  BET_DOES_NOT_GRANT_AUTHORITY,
  buildInvestmentContract,
  reconcileResourceEnvelope,
  validateBetBuildEnvelope,
  validateBetDecisionContract,
  validateBetResourceEnvelope,
} from "../src/lib/bet-kernel";
import { createBuildJobContract } from "../src/lib/build-orchestrator";
import { createCommercialBuildBrief } from "../src/lib/commercial-build-brief";
import { createMonetizationExecutionPlan } from "../src/lib/monetization-execution-plan";

const bucket = (allocated: number | null, unit = "USD_CENTS") => ({
  allocated,
  committed: 0,
  consumed: 0,
  remaining: allocated,
  unit,
});
const resources: BetResourceEnvelope = {
  schemaVersion: 1,
  externalCash: bucket(1_000),
  providerServices: bucket(1_000),
  research: bucket(null),
  build: bucket(600),
  release: bucket(200),
  experiment: bucket(null),
  operations: bucket(200),
  autonomousCapacity: bucket(40, "AGENT_HOURS"),
  humanDependencyBurden: bucket(null, "HUMAN_ACTIONS"),
  accountingAsOf: null,
};
const zeroCash: BetResourceEnvelope = {
  ...resources,
  externalCash: bucket(0),
  providerServices: bucket(0),
  build: bucket(0),
  release: bucket(0),
  operations: bucket(0),
};
const unknownEstimate = {
  status: "UNKNOWN" as const,
  lower: null,
  upper: null,
  unit: null,
  evidenceRefs: [],
  rationale: "No defensible numeric input is available.",
};
const decision: BetDecisionContract = {
  schemaVersion: 1,
  thesis: "A narrow paid workflow may replace recurring manual work.",
  rationale:
    "Underwriting evidence supports a reversible bounded implementation test.",
  underwritingReference: {
    evaluationCycleId: 12,
    snapshotRef: "underwriting:cycle-12",
  },
  upside: unknownEstimate,
  keyRisks: ["Distribution conversion remains unknown."],
  unknowns: ["Realized willingness to pay is not yet observed."],
  reversibility: {
    level: "HIGH",
    downsideExposure: unknownEstimate,
    notes: ["No irreversible public action is required to build."],
  },
  successCriteria: [
    "An independently verified Build satisfies the approved commercial workflow.",
  ],
  failureCriteria: ["The Build cannot fit the approved resource envelope."],
  iterateCriteria: [
    "A reversible scope reduction preserves the same commercial thesis.",
  ],
  decisionHorizon: {
    status: "UNKNOWN",
    earliestAt: null,
    latestAt: null,
    evidenceRefs: [],
  },
  humanCapabilityDependencies: [],
  expectedMaintenanceBurden: unknownEstimate,
  expectedSupportBurden: unknownEstimate,
  expectedOperationalComplexity: {
    status: "UNKNOWN",
    level: null,
    evidenceRefs: [],
    notes: [],
  },
};
const buildEnvelope: BetBuildEnvelope = {
  schemaVersion: 1,
  maximumExternalBuildSpendCents: 600,
  allowedExternalServiceBudgetCents: 600,
  acceptableBuildComplexity: "MEDIUM",
  acceptableMaintenanceBurden: "LOW",
  acceptableOperatingCost: unknownEstimate,
  requiredReversibility: "HIGH",
  permittedProductScope: ["MARKETPLACE_PRODUCT"],
  requiredAcceptanceCriteria: [
    "Representative customer workflow passes independent QA.",
  ],
  onlyExistingZeroCashCapabilities: false,
  hardConstraints: [
    "No provider call without a separately enforced hard ceiling and authority.",
  ],
};

assert.equal(
  validateBetDecisionContract(decision).length,
  0,
  "explicit UNKNOWN economics must remain valid without fabricated bounds",
);
assert.equal(validateBetResourceEnvelope(resources).length, 0);
assert.equal(
  validateBetResourceEnvelope(zeroCash).length,
  0,
  "a zero-cash Bet is valid",
);
assert.equal(validateBetBuildEnvelope(buildEnvelope).length, 0);
assert.equal(approvalRequiresHumanCapitalAuthority(resources), true);
assert.equal(approvalRequiresHumanCapitalAuthority(zeroCash), false);

for (const status of [
  "PROPOSED",
  "PAUSED",
  "WITHDRAWN",
  "EXHAUSTED",
  "SUCCEEDED",
] as const) {
  assert.equal(
    betCanInitiateBuild(status),
    false,
    status + " Bet must not initiate a new Build",
  );
}
assert.equal(betCanInitiateBuild("APPROVED"), true);
assert.equal(betCanInitiateBuild("ACTIVE"), true);
assert.throws(
  () => assertBetTransition("WITHDRAWN", "ACTIVE"),
  /INVALID_BET_TRANSITION/,
);

assert.deepEqual(
  BET_DOES_NOT_GRANT_AUTHORITY,
  {
    customerCharging: false,
    outbound: false,
    advertising: false,
    publicRelease: false,
    productionCredentials: false,
    customDomain: false,
    externalSpend: false,
  },
  "capital allocation must not imply any commercial or provider side-effect authority",
);

const sources = [
  {
    sourceType: "BUILD" as const,
    sourceId: 10,
    bucket: "build" as const,
    committedCents: 500,
    consumedCents: 250,
    updatedAt: new Date("2026-09-10T00:00:00Z"),
  },
  {
    sourceType: "RELEASE" as const,
    sourceId: 20,
    bucket: "release" as const,
    committedCents: 150,
    consumedCents: 100,
    updatedAt: new Date("2026-09-10T00:01:00Z"),
  },
  {
    sourceType: "ASSET_OPERATIONS" as const,
    sourceId: 30,
    bucket: "operations" as const,
    committedCents: 100,
    consumedCents: 50,
    updatedAt: new Date("2026-09-10T00:02:00Z"),
  },
];
const at = new Date("2026-09-10T01:00:00Z");
const first = reconcileResourceEnvelope(resources, sources, at);
const repeated = reconcileResourceEnvelope(first.envelope, sources, at);
assert.deepEqual(
  repeated,
  first,
  "repeated reconciliation must not double-count committed or consumed capital",
);
assert.equal(first.envelope.externalCash.committed, 750);
assert.equal(first.envelope.externalCash.consumed, 400);
assert.equal(first.envelope.externalCash.remaining, 600);
assert.equal(first.envelope.build.consumed, 250);
assert.equal(first.envelope.release.consumed, 100);
assert.equal(first.envelope.operations.consumed, 50);
assert.equal(first.exhausted, false);
const exceeded = reconcileResourceEnvelope(
  resources,
  [{ ...sources[0], consumedCents: 601 }],
  at,
);
assert.equal(
  exceeded.exhausted,
  true,
  "exceeding any known Bet bucket must stop safely",
);
assert.equal(exceeded.envelope.build.remaining, 0);

const investment = buildInvestmentContract({
  betId: 77,
  buildEnvelope,
  resourceEnvelope: resources,
});
assert.equal(investment.betId, 77);
assert.deepEqual(
  investment.buildEnvelope,
  buildEnvelope,
  "future Asset Factory constraints must be persisted machine-readably",
);
assert.equal(
  investment.downstreamExternalSpendCeilingCents,
  0,
  "Bet allocation must not override provider-side spend protection",
);
assert.deepEqual(investment.authority, BET_DOES_NOT_GRANT_AUTHORITY);

const brief = createCommercialBuildBrief({
  opportunityId: 901,
  name: "Bounded workflow",
  sourcePlatform: "Fixture",
  sourceUrl: "https://example.test",
  opportunityType: "marketplace product",
  thesis: "Recurring workflow",
  engineFamily: "TEST",
  verdict: "BUILD",
  policyStatus: "GREEN",
  buyerEvidence: ["Named buyers perform the workflow."],
  problemEvidence: ["The task recurs."],
  monetizationEvidence: ["Paid substitutes exist."],
  monetizationConfidenceState: "STRONGLY_INFERRED",
  distributionEvidence: ["An evidenced marketplace is reachable."],
  technicalEvidence: ["The workflow is technically feasible."],
});
const plan = createMonetizationExecutionPlan(brief);
const legacy = createBuildJobContract({
  brief,
  monetizationPlan: plan,
  evaluationCycleId: 12,
});
assert.equal(
  legacy.investment,
  undefined,
  "legacy historical Build contracts remain valid without fabricated Bets",
);
const attributed = createBuildJobContract({
  brief,
  monetizationPlan: plan,
  evaluationCycleId: 12,
  betId: 77,
  buildEnvelope,
});
assert.equal(attributed.investment?.betId, 77);
assert.equal(attributed.investment?.grantsDownstreamAuthority, false);
assert.equal(attributed.workspace.customerChargingAllowed, false);
assert.equal(attributed.workspace.externalPublicationAllowed, false);
assert.equal(attributed.workspace.productionCredentialsAllowed, false);

console.log("PASS zero-cost Bet and capital allocation kernel");
