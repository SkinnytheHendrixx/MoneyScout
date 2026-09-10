import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { mkdir, mkdtemp, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { and, eq } from "drizzle-orm";
import {
  assetFactoryRunsTable,
  assetRepositoriesTable,
  betCostAttributionsTable,
  betsTable,
  buildJobsTable,
  builderGatewayRunsTable,
  builderWorkspacesTable,
  db,
  evidenceTable,
  humanActionsTable,
  opportunitiesTable,
  pool,
  prepareAssetFactorySchema,
  productDefinitionsTable,
} from "@workspace/db";
import {
  factoryBetMayProgress,
  reconcileFactoryExecutionStates,
  runAssetFactoryTick,
  startAssetFactoryRun,
} from "../src/lib/asset-factory";
import type { AssetRepositoryProvisioner } from "../src/lib/asset-repository-provisioner";
import type { BuilderAgentAdapter } from "../src/lib/builder-agent-adapter";
import type {
  QaAgentAdapter,
  QaDispatchInput,
} from "../src/lib/qa-agent-adapter";
import {
  cancelBuilderGatewayRun,
  createOrReuseBuilderGatewayRun,
  executeBuilderGatewayRun,
  runBuilderGatewayTick,
} from "../src/lib/builder-gateway";
import type { BuilderProviderDriver } from "../src/lib/builder-provider-driver";
import { runBuilderWorkspaceTick } from "../src/lib/builder-workspace-worker";
import { runQaDebugTick } from "../src/lib/qa-debug-worker";
import { setCapabilityAvailable } from "../src/lib/human-gates";

const exec = promisify(execFile);
await prepareAssetFactorySchema(pool);

const suffix = `${Date.now()}-${Math.floor(Math.random() * 1_000_000)}`;
const [opportunity] = await db
  .insert(opportunitiesTable)
  .values({
    name: `[TEST] Factory ${suffix}`,
    sourcePlatform: "TEST",
    sourceUrl: `https://example.test/factory/${suffix}`,
    opportunityType: "monitor alert automation dashboard",
    thesis: "Teams need recurring monitoring with visible change alerts.",
    firstSeen: "2026-09-10",
    lastResearched: "2026-09-10",
    status: "TEST",
    overallScore: 90,
    policyStatus: "GREEN",
    verdict: "BUILD",
    engineFamily: "TEST",
  })
  .returning();
assert.ok(opportunity);

await db.insert(evidenceTable).values([
  {
    opportunityId: opportunity.id,
    claim: "Operations teams have explicit budgets for monitoring.",
    sourceUrl: "https://evidence.test/buyer",
    sourceTitle: "Buyer evidence",
    observedDate: "2026-09-10",
    classification: "FACT",
    evaluationDimension: "underwriting:buyer_budget_clarity",
  },
  {
    opportunityId: opportunity.id,
    claim: "Manual change review recurs every week.",
    sourceUrl: "https://evidence.test/problem",
    sourceTitle: "Problem evidence",
    observedDate: "2026-09-10",
    classification: "FACT",
    evaluationDimension: "underwriting:problem_intensity_recurrence",
  },
  {
    opportunityId: opportunity.id,
    claim: "Comparable monitoring tools have paid plans.",
    sourceUrl: "https://evidence.test/price",
    sourceTitle: "Paid analog",
    observedDate: "2026-09-10",
    classification: "FACT",
    evaluationDimension: "underwriting:monetization_proof_price_tolerance",
  },
  {
    opportunityId: opportunity.id,
    claim: "The category marketplace is an accessible initial channel.",
    sourceUrl: "https://evidence.test/channel",
    sourceTitle: "Channel",
    observedDate: "2026-09-10",
    classification: "FACT",
    evaluationDimension:
      "underwriting:distribution_accessibility_acquisition_economics",
  },
  {
    opportunityId: opportunity.id,
    claim: "A representative monitor and alert flow is technically feasible.",
    sourceUrl: "https://evidence.test/technical",
    sourceTitle: "Technical evidence",
    observedDate: "2026-09-10",
    classification: "FACT",
    evaluationDimension: "underwriting:build_complexity_technical_uncertainty",
  },
]);

const resourceBucket = (unit: string) => ({
  allocated: 0,
  committed: 0,
  consumed: 0,
  remaining: 0,
  unit,
});
const [bet] = await db
  .insert(betsTable)
  .values({
    opportunityId: opportunity.id,
    evaluationCycleId: null,
    idempotencyKey: `factory-bet-${suffix}`,
    status: "APPROVED",
    decisionContract: {
      schemaVersion: 1,
      thesis: "Build a competitive monitoring workflow.",
      rationale:
        "Validated buyer/problem/paid-analog evidence supports a reversible zero-cash build.",
      underwritingReference: {
        evaluationCycleId: null,
        snapshotRef: "fixture",
      },
      upside: { status: "UNKNOWN", evidenceRefs: [] },
      keyRisks: ["Retention unknown"],
      unknowns: ["Load volume unknown"],
      reversibility: {
        level: "HIGH",
        downsideExposure: {
          status: "KNOWN",
          lower: 0,
          upper: 0,
          unit: "cents",
          evidenceRefs: ["fixture"],
        },
        notes: [],
      },
      successCriteria: ["Independent QA passes the complete workflow."],
      failureCriteria: ["The complete product cannot fit the envelope."],
      iterateCriteria: ["Repair normal implementation defects."],
      decisionHorizon: {
        status: "UNKNOWN",
        earliestAt: null,
        latestAt: null,
        evidenceRefs: [],
      },
      humanCapabilityDependencies: [],
      expectedMaintenanceBurden: {
        status: "BOUNDED",
        lower: 0,
        upper: 2,
        unit: "hours/month",
        evidenceRefs: ["fixture"],
      },
      expectedSupportBurden: { status: "UNKNOWN", evidenceRefs: [] },
      expectedOperationalComplexity: {
        status: "BOUNDED",
        level: "MEDIUM",
        evidenceRefs: ["fixture"],
        notes: [],
      },
    },
    resourceEnvelope: {
      schemaVersion: 1,
      externalCash: resourceBucket("cents"),
      providerServices: resourceBucket("cents"),
      research: resourceBucket("cents"),
      build: resourceBucket("cents"),
      release: resourceBucket("cents"),
      experiment: resourceBucket("cents"),
      operations: resourceBucket("cents"),
      autonomousCapacity: resourceBucket("units"),
      humanDependencyBurden: resourceBucket("actions"),
      accountingAsOf: null,
    },
    buildEnvelope: {
      schemaVersion: 1,
      maximumExternalBuildSpendCents: 0,
      allowedExternalServiceBudgetCents: 0,
      acceptableBuildComplexity: "MEDIUM",
      acceptableMaintenanceBurden: "MEDIUM",
      acceptableOperatingCost: {
        status: "BOUNDED",
        lower: 0,
        upper: 2_000,
        unit: "cents/month",
        evidenceRefs: ["fixture"],
      },
      requiredReversibility: "HIGH",
      permittedProductScope: ["AUTOMATION"],
      requiredAcceptanceCriteria: ["Clean checkout verification passes."],
      onlyExistingZeroCashCapabilities: true,
      hardConstraints: ["No production credentials."],
    },
    nextAction: "Enter Asset Factory.",
    allocatedExternalCashCents: 0,
    remainingExternalCashCents: 0,
    approvedAt: new Date(),
    approvedBy: "ZERO_CASH_POLICY",
  })
  .returning();
assert.ok(bet);

// Bet gates are strict for every non-approved state; legacy null-Bet validity is covered by #69 regression tests.
assert.equal(factoryBetMayProgress("APPROVED"), true);
assert.equal(factoryBetMayProgress("ACTIVE"), true);
for (const status of [
  "PROPOSED",
  "PAUSED",
  "WITHDRAWN",
  "EXHAUSTED",
  "SUCCEEDED",
] as const)
  assert.equal(
    factoryBetMayProgress(status),
    false,
    `${status} must block new Factory progression`,
  );
const noBet = await startAssetFactoryRun({
  opportunityId: opportunity.id,
  requestedBetId: bet.id + 999_999,
  provisioner: null,
});
assert.equal(noBet.kind, "BET_REQUIRED");
await db
  .update(betsTable)
  .set({ status: "PAUSED" })
  .where(eq(betsTable.id, bet.id));
assert.equal(
  (
    await startAssetFactoryRun({
      opportunityId: opportunity.id,
      requestedBetId: bet.id,
      provisioner: null,
    })
  ).kind,
  "BET_INACTIVE",
);
await db
  .update(betsTable)
  .set({ status: "APPROVED" })
  .where(eq(betsTable.id, bet.id));

// Missing repository access creates one precise Human Action and resumes automatically when capability appears.
const blocked = await startAssetFactoryRun({
  opportunityId: opportunity.id,
  requestedBetId: bet.id,
  provisioner: null,
});
assert.equal(blocked.kind, "RUN");
if (blocked.kind !== "RUN") throw new Error("Expected durable Factory run");
assert.equal(blocked.run.status, "REPOSITORY_BLOCKED");
const [repoAction] = await db
  .select()
  .from(humanActionsTable)
  .where(
    and(
      eq(humanActionsTable.opportunityId, opportunity.id),
      eq(humanActionsTable.actionType, "CONNECT_ASSET_REPOSITORY_PROVIDER"),
    ),
  );
assert.equal(
  repoAction?.requiredCapabilityKey,
  "ASSET_REPOSITORY_PROVISIONER_ACCESS",
);

await db
  .update(opportunitiesTable)
  .set({
    thesis:
      "Teams need recurring monitoring, history, and visible change alerts.",
  })
  .where(eq(opportunitiesTable.id, opportunity.id));
const revised = await startAssetFactoryRun({
  opportunityId: opportunity.id,
  requestedBetId: bet.id,
  provisioner: null,
});
assert.equal(revised.kind, "RUN");
if (revised.kind !== "RUN") throw new Error("Expected revised Factory run");
assert.notEqual(
  revised.run.id,
  blocked.run.id,
  "material upstream change creates a new Factory run",
);
assert.equal(
  (
    await db
      .select()
      .from(assetFactoryRunsTable)
      .where(eq(assetFactoryRunsTable.id, blocked.run.id))
  )[0]?.status,
  "CANCELLED",
  "pre-Build Factory version is superseded without mutation",
);
const definitionVersions = await db
  .select()
  .from(productDefinitionsTable)
  .where(eq(productDefinitionsTable.betId, bet.id));
assert.deepEqual(
  definitionVersions.map((item) => item.version).sort(),
  [1, 2],
  "material change creates a new Product Definition version",
);
assert.equal(
  definitionVersions.find((item) => item.version === 2)?.previousDefinitionId,
  definitionVersions.find((item) => item.version === 1)?.id,
);
const activeRunId = revised.run.id;

const root = await mkdtemp(path.join(tmpdir(), "money-scout-factory-test-"));
const sourceRepo = path.join(root, "source");
const bareRepo = path.join(root, "asset.git");
let provisions = 0;
const localProvisioner: AssetRepositoryProvisioner = {
  provider: "ZERO_COST_LOCAL_GIT_FIXTURE",
  async provision(input) {
    provisions += 1;
    if (provisions === 1) {
      await mkdir(sourceRepo, { recursive: true });
      await exec("git", ["init", "-b", "main"], { cwd: sourceRepo });
      await exec("git", ["config", "user.name", "Factory Fixture"], {
        cwd: sourceRepo,
      });
      await exec("git", ["config", "user.email", "fixture@example.invalid"], {
        cwd: sourceRepo,
      });
      for (const [name, content] of Object.entries(input.manifestFiles)) {
        const target = path.join(sourceRepo, name);
        await mkdir(path.dirname(target), { recursive: true });
        await writeFile(target, content);
      }
      await exec("git", ["add", "-A"], { cwd: sourceRepo });
      await exec(
        "git",
        ["commit", "-m", "Initialize frozen Factory contracts"],
        { cwd: sourceRepo },
      );
      await exec("git", ["clone", "--bare", sourceRepo, bareRepo], {
        cwd: root,
      });
    }
    const sha = (
      await exec("git", ["rev-parse", "HEAD"], { cwd: sourceRepo })
    ).stdout.trim();
    return {
      provider: this.provider,
      repositoryExternalId: `local:${bet.id}`,
      repositoryUrl: bareRepo,
      defaultBranch: "main",
      baseCommitSha: sha,
    };
  },
};
await runAssetFactoryTick(localProvisioner);
const [readyRun] = await db
  .select()
  .from(assetFactoryRunsTable)
  .where(eq(assetFactoryRunsTable.id, activeRunId));
assert.equal(
  readyRun?.status,
  "READY_FOR_BUILDER",
  "Factory resumes after repository capability becomes available",
);
assert.ok(
  readyRun?.productDefinitionId &&
    readyRun.architecturePlanId &&
    readyRun.assetRepositoryId &&
    readyRun.buildJobId,
);
const repeated = await startAssetFactoryRun({
  opportunityId: opportunity.id,
  requestedBetId: bet.id,
  provisioner: localProvisioner,
});
assert.equal(repeated.kind, "RUN");
if (repeated.kind === "RUN")
  assert.equal(
    repeated.run.id,
    activeRunId,
    "repeated execution reuses the durable Factory run",
  );
assert.equal(
  (
    await db
      .select()
      .from(assetRepositoriesTable)
      .where(eq(assetRepositoriesTable.betId, bet.id))
  ).length,
  1,
  "retry cannot duplicate the Asset repository",
);
assert.equal(
  (
    await db
      .select()
      .from(productDefinitionsTable)
      .where(eq(productDefinitionsTable.betId, bet.id))
  )[0]?.status,
  "FROZEN",
);
const [factoryBuild] = await db
  .select()
  .from(buildJobsTable)
  .where(eq(buildJobsTable.id, readyRun!.buildJobId!));
assert.equal(factoryBuild?.contract.schemaVersion, 2);

// Gateway: idempotent start, isolated local checkout, exact pushed commit, IMPLEMENTATION_READY only.
let providerCalls = 0;
let providerWorkspace = "";
const fixtureDriverUsage = {
  model: "fixture",
  inputTokens: 10,
  cachedInputTokens: 5,
  outputTokens: 2,
  reasoningTokens: 1,
  durationMs: 5,
  entitlementUnits: 1,
};
const fixtureDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_FIXTURE_DRIVER",
  billing: {
    mode: "ZERO_COST_FIXTURE",
    enforceableMaximumIncrementalCostCents: 0,
    enforcementMechanism: "deterministic local fixture",
    payAsYouGoFallbackPossible: false,
  },
  async run(request) {
    providerCalls += 1;
    providerWorkspace = request.workingDirectory;
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "asset.ts"),
      "export const built = true;\n",
    );
    return {
      providerRunId: `fixture-${providerCalls}`,
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Fixture implementation ready.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
const firstGateway = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-${suffix}`,
});
const duplicateGateway = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-${suffix}`,
});
assert.equal(duplicateGateway.run.id, firstGateway.run.id);
assert.equal(duplicateGateway.reused, true);
await executeBuilderGatewayRun(firstGateway.run.id, fixtureDriver);
assert.equal(
  providerCalls,
  1,
  "duplicate start cannot duplicate provider execution",
);
const [gatewayResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, firstGateway.run.id));
assert.equal(gatewayResult?.terminalOutcome, "IMPLEMENTATION_READY");
assert.equal(
  gatewayResult?.actualExternalCashCostCents,
  null,
  "unknown cash cost remains unknown",
);
assert.equal(
  gatewayResult?.usage.inputTokens,
  10,
  "usage is separate from cash cost",
);
assert.match(gatewayResult?.resultCommitSha ?? "", /^[0-9a-f]{40}$/);
assert.notEqual(
  providerWorkspace,
  sourceRepo,
  "coding provider receives a disposable isolated checkout",
);
assert.equal(
  (
    await exec(
      "git",
      ["rev-parse", `refs/heads/${gatewayResult!.branchName}`],
      { cwd: bareRepo },
    )
  ).stdout.trim(),
  gatewayResult?.resultCommitSha,
  "Gateway pushes and records the exact same commit",
);

let repairRequestDefects: Array<Record<string, unknown>> = [];
let repairWorkspace = "";
const repairDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  async run(request) {
    providerCalls += 1;
    repairRequestDefects = request.repairDefects;
    repairWorkspace = request.workingDirectory;
    return {
      providerRunId: `fixture-repair-${providerCalls}`,
      terminalOutcome: "IMPLEMENTATION_READY",
      summary:
        "Exact defect was already resolved at the pinned commit; explicit no-op.",
      challenge: null,
      allowNoop: true,
      usage: {
        model: "fixture",
        inputTokens: 3,
        cachedInputTokens: 0,
        outputTokens: 1,
        reasoningTokens: 0,
        durationMs: 2,
        entitlementUnits: 1,
      },
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
const repairGateway = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-repair-${suffix}`,
  repairDefects: [
    {
      key: "QA-EXACT",
      category: "FUNCTIONAL",
      severity: "HIGH",
      summary: "Exact fixture defect",
      evidence: "qa evidence",
      repairGuidance: "repair only this",
      humanOnly: false,
    },
  ],
});
await executeBuilderGatewayRun(repairGateway.run.id, repairDriver);
const [repairResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, repairGateway.run.id));
assert.equal(
  repairRequestDefects[0]?.key,
  "QA-EXACT",
  "repair gets the exact structured QA defect bundle",
);
assert.notEqual(
  repairWorkspace,
  providerWorkspace,
  "repair uses a fresh disposable provider execution",
);
assert.equal(
  repairResult?.baseCommitSha,
  gatewayResult?.resultCommitSha,
  "repair starts from the exact prior failed branch HEAD",
);
assert.equal(
  repairResult?.resultCommitSha,
  gatewayResult?.resultCommitSha,
  "an explicitly justified no-op remains commit-pinned",
);

const leaseRow = {
  buildJobId: factoryBuild!.id,
  assetRepositoryId: readyRun!.assetRepositoryId!,
  provider: "LEASE_FIXTURE",
  status: "RUNNING",
  terminalOutcome: null,
  attemptNumber: 90,
  repairNumber: 0,
  branchName: "money-scout/lease-fixture",
  usage: {
    model: null,
    inputTokens: null,
    cachedInputTokens: null,
    outputTokens: null,
    reasoningTokens: null,
    durationMs: null,
    entitlementUnits: null,
  },
  actualExternalCashCostCents: null,
  costProvenance: "FIXTURE",
  entitlementConsumption: {},
  requestPayload: {},
};
const [activeLease] = await db
  .insert(builderGatewayRunsTable)
  .values({ ...leaseRow, idempotencyKey: `lease-a-${suffix}` })
  .returning();
await assert.rejects(
  () =>
    db.insert(builderGatewayRunsTable).values({
      ...leaseRow,
      idempotencyKey: `lease-b-${suffix}`,
      attemptNumber: 91,
    }),
  (error: unknown) =>
    (error as { cause?: { constraint?: string } }).cause?.constraint ===
    "builder_gateway_runs_active_branch_unique",
  "one active writer lease is allowed per Asset branch",
);
await db
  .delete(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, activeLease!.id));

await setCapabilityAvailable({
  key: "BUILDER_PROVIDER_SPEND_AUTHORITY",
  provider: "OWNER_POLICY",
  verificationMethod: "TEST_OWNER_ATTESTATION",
  metadata: { maximum_external_cash_cents: 10_000 },
});
const meteredDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  provider: "METERED_FIXTURE_MUST_NOT_RUN",
  billing: {
    mode: "METERED",
    enforceableMaximumIncrementalCostCents: null,
    enforcementMechanism: null,
    payAsYouGoFallbackPossible: true,
  },
  async run() {
    throw new Error(
      "Metered provider was called without fail-closed reservation",
    );
  },
};
const financiallyBlocked = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-metered-block-${suffix}`,
});
await executeBuilderGatewayRun(financiallyBlocked.run.id, meteredDriver);
const [blockedCostRun] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, financiallyBlocked.run.id));
assert.equal(
  blockedCostRun?.terminalOutcome,
  "RESOURCE_BLOCKED",
  "broad spend capability cannot bypass missing per-run enforcement/reservation",
);
assert.equal(blockedCostRun?.actualExternalCashCostCents, null);
assert.equal(
  blockedCostRun?.costProvenance,
  "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
);
assert.equal(
  (
    await db
      .select()
      .from(humanActionsTable)
      .where(
        and(
          eq(humanActionsTable.opportunityId, opportunity.id),
          eq(
            humanActionsTable.actionType,
            "CONNECT_SAFE_BUILDER_PROVIDER_BILLING",
          ),
        ),
      )
  ).length,
  0,
  "missing shared financial infrastructure is a structured blocker, not a human-attestation action",
);

const bridge: BuilderAgentAdapter = {
  provider: "ZERO_COST_GATEWAY_BRIDGE",
  costMode: "ZERO_CASH",
  async dispatch() {
    return {
      providerRunId: String(repairResult!.id),
      repositoryUrl: bareRepo,
      branchName: repairResult!.branchName,
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "IMPLEMENTATION_READY claim",
      externalCostCents: 0,
      terminalOutcome: "IMPLEMENTATION_READY",
      resultCommitSha: repairResult!.resultCommitSha,
      gatewayRunId: repairResult!.id,
    };
  },
  async getStatus(providerRunId) {
    return {
      providerRunId,
      repositoryUrl: bareRepo,
      branchName: repairResult!.branchName,
      workspaceUrl: null,
      state: "SUCCEEDED",
      progressPercent: 100,
      summary: "IMPLEMENTATION_READY claim",
      externalCostCents: 0,
      terminalOutcome: "IMPLEMENTATION_READY",
      resultCommitSha: repairResult!.resultCommitSha,
      gatewayRunId: repairResult!.id,
    };
  },
};
let workspace: typeof builderWorkspacesTable.$inferSelect | undefined;
for (let tick = 0; tick < 100 && !workspace; tick += 1) {
  await runBuilderWorkspaceTick(bridge);
  [workspace] = await db
    .select()
    .from(builderWorkspacesTable)
    .where(eq(builderWorkspacesTable.buildJobId, factoryBuild!.id));
}
assert.equal(
  workspace?.status,
  "QA_PENDING",
  "builder claim advances only to independent QA pending",
);
assert.equal(workspace?.resultCommitSha, repairResult?.resultCommitSha);
assert.equal(
  (
    await db
      .select()
      .from(buildJobsTable)
      .where(eq(buildJobsTable.id, factoryBuild!.id))
  )[0]?.status,
  "QA_PENDING",
);
await reconcileFactoryExecutionStates();
assert.equal(
  (
    await db
      .select()
      .from(assetFactoryRunsTable)
      .where(eq(assetFactoryRunsTable.id, activeRunId))
  )[0]?.status,
  "QA_PENDING",
);

let qaInput: QaDispatchInput | null = null;
const independentQa: QaAgentAdapter = {
  provider: "ZERO_COST_INDEPENDENT_QA_FIXTURE",
  costMode: "ZERO_CASH",
  async dispatch(input) {
    if (input.buildJobId === factoryBuild!.id) qaInput = input;
    return {
      providerRunId: `qa-${factoryBuild!.id}`,
      state: "PASSED",
      progressPercent: 100,
      summary: "Independent fixture verified the exact commit.",
      repositoryUrl: input.repositoryUrl,
      branchName: input.branchName,
      acceptanceResults: input.acceptanceCriteria.map((criterion) => ({
        criterion,
        status: "PASS",
        evidence: `Verified at ${input.commitSha}`,
      })),
      defects: [],
      baselineChecksPassed: true,
      requiresHumanAction: false,
      humanAction: null,
      externalCostCents: 0,
      metadata: { verified_commit_sha: input.commitSha },
    };
  },
  async getStatus() {
    throw new Error("Immediate QA fixture must not poll");
  },
};
for (let tick = 0; tick < 100; tick += 1) {
  await runQaDebugTick(independentQa, bridge);
  const [current] = await db
    .select({ status: buildJobsTable.status })
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, factoryBuild!.id));
  if (current?.status === "COMPLETE") break;
}
assert.equal(
  qaInput?.commitSha,
  repairResult?.resultCommitSha,
  "#70 receives the exact Gateway commit rather than a floating branch",
);
assert.equal(
  (
    await db
      .select()
      .from(buildJobsTable)
      .where(eq(buildJobsTable.id, factoryBuild!.id))
  )[0]?.status,
  "COMPLETE",
  "only #70 success completes the Build",
);
await reconcileFactoryExecutionStates();
assert.equal(
  (
    await db
      .select()
      .from(assetFactoryRunsTable)
      .where(eq(assetFactoryRunsTable.id, activeRunId))
  )[0]?.status,
  "COMPLETE",
);

// Cancellation before provider execution is durable and prevents the call.
const cancelRun = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-cancel-${suffix}`,
});
await cancelBuilderGatewayRun(cancelRun.run.id, "Bet paused by fixture");
await executeBuilderGatewayRun(cancelRun.run.id, fixtureDriver);
assert.equal(providerCalls, 2);
assert.equal(
  (
    await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.id, cancelRun.run.id))
  )[0]?.terminalOutcome,
  "CANCELLED",
);

const providerCapabilityResume = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-provider-resume-${suffix}`,
});
await executeBuilderGatewayRun(providerCapabilityResume.run.id, null);
assert.equal(
  (
    await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.id, providerCapabilityResume.run.id))
  )[0]?.status,
  "BLOCKED",
);
await runBuilderGatewayTick(fixtureDriver);
const [resumedProviderRun] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, providerCapabilityResume.run.id));
assert.equal(
  resumedProviderRun?.status,
  "SUCCEEDED",
  "Gateway resumes automatically after its required provider capability is machine-verified",
);
assert.equal(providerCalls, 3);
const [providerAction] = await db
  .select()
  .from(humanActionsTable)
  .where(
    and(
      eq(humanActionsTable.opportunityId, opportunity.id),
      eq(humanActionsTable.actionType, "CONNECT_CODEX_BUILDER_PROVIDER"),
    ),
  );
assert.equal(providerAction?.status, "RESOLVED");

// Every authoritative terminal provider report is cost-accounted once, including
// failures and cancellations. An uncertain throw remains UNKNOWN and is never
// blindly retried under the same durable run identity.
const expandedBuildEnvelope = {
  ...bet.buildEnvelope,
  maximumExternalBuildSpendCents: 100,
  allowedExternalServiceBudgetCents: 100,
  onlyExistingZeroCashCapabilities: false,
};
await db
  .update(betsTable)
  .set({ buildEnvelope: expandedBuildEnvelope })
  .where(eq(betsTable.id, bet.id));
await db
  .update(buildJobsTable)
  .set({ externalSpendCeilingCents: 100, externalSpendUsedCents: 0 })
  .where(eq(buildJobsTable.id, factoryBuild!.id));

let failureCalls = 0;
const chargedFailureDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  async run() {
    failureCalls += 1;
    return {
      providerRunId: "fixture-charged-failure",
      terminalOutcome: "PROVIDER_FAILURE",
      summary: "Provider reported a failed terminal run.",
      challenge: null,
      allowNoop: false,
      usage: { ...fixtureDriverUsage, durationMs: 7 },
      actualExternalCashCostCents: 13,
      costProvenance: "AUTHORITATIVE_FIXTURE_PROVIDER_TERMINAL_REPORT",
      entitlementConsumption: {},
    };
  },
};
const chargedFailure = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-cost-failure-${suffix}`,
});
await executeBuilderGatewayRun(chargedFailure.run.id, chargedFailureDriver);
await executeBuilderGatewayRun(chargedFailure.run.id, chargedFailureDriver);
const [chargedFailureResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, chargedFailure.run.id));
assert.equal(chargedFailureResult?.status, "FAILED");
assert.equal(chargedFailureResult?.actualExternalCashCostCents, 13);
assert.equal(
  failureCalls,
  1,
  "a terminal failed provider run cannot be replayed and charged twice",
);

const chargedCancellationDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  async run() {
    return {
      providerRunId: "fixture-charged-cancellation",
      terminalOutcome: "CANCELLED",
      summary: "Provider reported cancellation after consuming resources.",
      challenge: null,
      allowNoop: false,
      usage: { ...fixtureDriverUsage, durationMs: 4 },
      actualExternalCashCostCents: 5,
      costProvenance: "AUTHORITATIVE_FIXTURE_PROVIDER_TERMINAL_REPORT",
      entitlementConsumption: {},
    };
  },
};
const chargedCancellation = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-cost-cancel-${suffix}`,
});
await executeBuilderGatewayRun(
  chargedCancellation.run.id,
  chargedCancellationDriver,
);
assert.equal(
  (
    await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.id, chargedCancellation.run.id))
  )[0]?.actualExternalCashCostCents,
  5,
);

let uncertainCalls = 0;
const uncertainDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  async run() {
    uncertainCalls += 1;
    throw new Error("connection lost after provider accepted the run");
  },
};
const uncertain = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-uncertain-${suffix}`,
});
await executeBuilderGatewayRun(uncertain.run.id, uncertainDriver);
await executeBuilderGatewayRun(uncertain.run.id, uncertainDriver);
const [uncertainResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, uncertain.run.id));
assert.equal(uncertainResult?.status, "FAILED");
assert.equal(
  uncertainResult?.actualExternalCashCostCents,
  null,
  "uncertain provider cost remains unknown rather than becoming zero",
);
assert.match(
  uncertainResult?.costProvenance ?? "",
  /UNKNOWN_PENDING_AUTHORITATIVE_REPORT/,
);
assert.equal(
  uncertainCalls,
  1,
  "uncertain potentially charged execution is never retried blindly",
);

const [costedBuild] = await db
  .select()
  .from(buildJobsTable)
  .where(eq(buildJobsTable.id, factoryBuild!.id));
assert.equal(
  costedBuild?.externalSpendUsedCents,
  18,
  "failed and cancelled provider costs both count toward the Build envelope",
);
const costAttributions = await db
  .select()
  .from(betCostAttributionsTable)
  .where(eq(betCostAttributionsTable.betId, bet.id));
assert.equal(
  costAttributions
    .filter((item) => item.sourceType === "BUILDER_GATEWAY_RUN")
    .reduce((sum, item) => sum + item.consumedCents, 0),
  18,
);

await db
  .delete(opportunitiesTable)
  .where(eq(opportunitiesTable.id, opportunity.id));
await rm(root, { recursive: true, force: true });
console.log("PASS zero-cost Asset Factory/Gateway integration");
