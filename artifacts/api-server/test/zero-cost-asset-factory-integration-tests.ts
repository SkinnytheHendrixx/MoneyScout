import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import { chmod, mkdir, mkdtemp, rename, rm, writeFile } from "node:fs/promises";
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

// A provider exception thrown after the boundary was crossed but before
// any authoritative terminal result is returned must never be treated as
// TERMINAL_RECONCILED: Money Scout cannot prove the provider failed,
// stopped, declined to charge, or declined to consume entitlement. It
// becomes a durable, human-only uncertain/blocked state instead.
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
const [uncertainResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, uncertain.run.id));
assert.equal(
  uncertainResult?.status,
  "BLOCKED",
  "a provider exception after dispatch is never marked FAILED as if it were an authoritative terminal report",
);
assert.equal(uncertainResult?.terminalOutcome, "RESOURCE_BLOCKED");
assert.equal(
  uncertainResult?.executionPhase,
  "PROVIDER_DISPATCH_ATTEMPTED",
  "a bare exception is never marked TERMINAL_RECONCILED: no authoritative provider result was ever obtained",
);
assert.equal(
  uncertainResult?.actualExternalCashCostCents,
  null,
  "uncertain provider cost remains unknown rather than becoming zero",
);
assert.equal(
  uncertainResult?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);
assert.equal(
  uncertainCalls,
  1,
  "uncertain potentially charged execution is never retried blindly",
);
const [uncertainAction] = await db
  .select()
  .from(humanActionsTable)
  .where(
    and(
      eq(humanActionsTable.opportunityId, opportunity.id),
      eq(
        humanActionsTable.actionType,
        "VERIFY_UNCERTAIN_BUILDER_PROVIDER_EXECUTION",
      ),
    ),
  );
assert.equal(uncertainAction?.resumeAction, "NO_AUTOMATIC_RESUME");
// A second explicit call and a full recovery tick must both be unable to
// redispatch this logical run: it is BLOCKED (not QUEUED), and its lease
// was cleared rather than left to look "expired and recoverable".
await executeBuilderGatewayRun(uncertain.run.id, uncertainDriver);
await runBuilderGatewayTick(uncertainDriver);
assert.equal(
  uncertainCalls,
  1,
  "neither a direct retry nor a Gateway tick can redispatch an uncertain run",
);
const [uncertainAfterTick] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, uncertain.run.id));
assert.equal(uncertainAfterTick?.status, "BLOCKED");
assert.equal(uncertainAfterTick?.leaseExpiresAt, null);

// The same uncertainty applies even when the local AbortController fired:
// cancellation intent/signal is not proof the provider actually stopped.
const abortRaceUncertain = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-abort-race-uncertain-${suffix}`,
});
const abortRaceDriver: BuilderProviderDriver = {
  ...fixtureDriver,
  async run() {
    // Simulate a real cancellation race: an operator/system cancels this
    // exact run while the provider call is genuinely in flight, and the
    // in-flight call then fails locally with no authoritative result.
    await cancelBuilderGatewayRun(
      abortRaceUncertain.run.id,
      "operator requested cancel mid-flight",
    );
    throw new Error("aborted while the provider call was in flight");
  },
};
await executeBuilderGatewayRun(abortRaceUncertain.run.id, abortRaceDriver);
const [abortRaceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, abortRaceUncertain.run.id));
assert.equal(
  abortRaceResult?.status,
  "BLOCKED",
  "an abort signal firing after dispatch does not convert uncertainty into a proven-safe cancellation",
);
assert.notEqual(abortRaceResult?.status, "CANCELLED");
assert.equal(
  abortRaceResult?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);
assert.equal(abortRaceResult?.executionPhase, "PROVIDER_DISPATCH_ATTEMPTED");

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

// ---------------------------------------------------------------------------
// Blocker 1: durable Builder Gateway execution-phase recovery. An expired
// local worker lease proves only that Money Scout lost local ownership; it
// never proves the external provider did nothing. Every scenario below
// discovers its run purely through directly-written database state (never
// by continuing an in-memory call on the same driver instance), the same
// way a real process restart would surface it.
// ---------------------------------------------------------------------------
const recoverySuffix = `${suffix}-recovery`;

let recoveryDriverCalls = 0;
const recoveryFixtureDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RECOVERY_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    recoveryDriverCalls += 1;
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "recovered.ts"),
      "export const recovered = true;\n",
    );
    return {
      providerRunId: `recovery-${recoveryDriverCalls}`,
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Recovered fixture implementation ready.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};

// Case A: a lease that expired before the provider boundary was ever
// crossed is provably safe to requeue, and recovers to a full successful
// re-execution from durable repository state.
const [preProviderRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-recover-pre-provider-${recoverySuffix}`,
    provider: "ZERO_COST_RECOVERY_FIXTURE",
    status: "PREPARING",
    executionPhase: "PRE_PROVIDER",
    attemptNumber: 500,
    repairNumber: 0,
    branchName: "money-scout/recovery-pre-provider",
    leaseOwner: "stale-worker-a",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
await runBuilderGatewayTick(recoveryFixtureDriver);
const [recoveredPreProvider] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, preProviderRun!.id));
assert.equal(
  recoveredPreProvider?.status,
  "SUCCEEDED",
  "a provably pre-provider expired lease safely recovers and re-executes",
);
assert.equal(recoveredPreProvider?.executionPhase, "TERMINAL_RECONCILED");
assert.equal(
  recoveryDriverCalls,
  1,
  "recovery dispatches exactly one fresh provider execution when none had occurred",
);

// Case B: a lease that expired after the provider boundary was crossed,
// with no durable provider identity, must never be requeued. It becomes a
// durable, explicit, human-only uncertain/blocked condition instead.
const [dispatchedNoIdentity] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-recover-uncertain-${recoverySuffix}`,
    provider: "ZERO_COST_RECOVERY_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_DISPATCH_ATTEMPTED",
    attemptNumber: 501,
    repairNumber: 0,
    branchName: "money-scout/recovery-uncertain",
    leaseOwner: "stale-worker-b",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const callsBeforeUncertain = recoveryDriverCalls;
await runBuilderGatewayTick(recoveryFixtureDriver);
const [uncertainRecovered] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, dispatchedNoIdentity!.id));
assert.equal(
  uncertainRecovered?.status,
  "BLOCKED",
  "a lease lost after the provider boundary was crossed never resolves back to queued",
);
assert.equal(uncertainRecovered?.terminalOutcome, "RESOURCE_BLOCKED");
assert.equal(
  uncertainRecovered?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);
assert.equal(
  uncertainRecovered?.actualExternalCashCostCents,
  null,
  "unknown cost after an uncertain provider boundary crossing never becomes zero",
);
assert.equal(
  uncertainRecovered?.executionPhase,
  "PROVIDER_DISPATCH_ATTEMPTED",
  "the durable phase is never silently advanced past what is actually known",
);
assert.equal(
  recoveryDriverCalls,
  callsBeforeUncertain,
  "an uncertain, potentially-dispatched run is never blindly redispatched",
);
const [uncertainRecoveryAction] = await db
  .select()
  .from(humanActionsTable)
  .where(
    and(
      eq(humanActionsTable.opportunityId, opportunity.id),
      eq(
        humanActionsTable.actionType,
        "VERIFY_UNCERTAIN_BUILDER_PROVIDER_EXECUTION",
      ),
    ),
  );
assert.equal(
  uncertainRecoveryAction?.resumeAction,
  "NO_AUTOMATIC_RESUME",
  "an uncertain provider execution is a genuine human-only boundary, never auto-resumed",
);

// Case C: a durable provider execution identity is known and the driver
// supports authoritative reconciliation. The exact execution is reconciled;
// it is never replaced with a fresh dispatch.
let reconcileCalls = 0;
let reconcileRunAttempts = 0;
const reconcilingDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RECONCILING_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    reconcileRunAttempts += 1;
    throw new Error(
      "A known provider execution must be reconciled, never redispatched.",
    );
  },
  async reconcile(input) {
    reconcileCalls += 1;
    return {
      providerRunId: input.providerRunId,
      terminalOutcome: "PROVIDER_FAILURE",
      summary: "Reconciled: the provider reports this execution failed.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 7,
      costProvenance: "AUTHORITATIVE_RECONCILED_FIXTURE_REPORT",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
const [knownIdentityRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-recover-known-identity-${recoverySuffix}`,
    provider: "ZERO_COST_RECONCILING_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_RUN_CONFIRMED",
    providerRunId: "known-provider-run-123",
    attemptNumber: 502,
    repairNumber: 0,
    branchName: "money-scout/recovery-known-identity",
    leaseOwner: "stale-worker-c",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
await runBuilderGatewayTick(reconcilingDriver);
const [reconciledRun] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, knownIdentityRun!.id));
assert.equal(reconciledRun?.status, "FAILED");
assert.equal(reconciledRun?.terminalOutcome, "PROVIDER_FAILURE");
assert.equal(reconciledRun?.executionPhase, "TERMINAL_RECONCILED");
assert.equal(
  reconciledRun?.providerRunId,
  "known-provider-run-123",
  "a known provider execution identity is reconciled, never replaced with a new one",
);
assert.equal(reconciledRun?.actualExternalCashCostCents, 7);
assert.equal(
  reconcileCalls,
  1,
  "the exact known execution is reconciled exactly once",
);
assert.equal(
  reconcileRunAttempts,
  0,
  "a known provider execution is never redispatched through a fresh run()",
);

// Case D: a durable provider execution identity is known, but the driver
// does not support reconciliation (the honest state for the real Codex SDK
// driver today). Money Scout must not fabricate recovery: the run remains
// uncertain/blocked and the known identity is preserved rather than
// discarded or replaced by a fresh dispatch.
const [orphanedIdentityRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-recover-orphaned-identity-${recoverySuffix}`,
    provider: "ZERO_COST_RECOVERY_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_RUN_CONFIRMED",
    providerRunId: "orphaned-provider-run-456",
    attemptNumber: 503,
    repairNumber: 0,
    branchName: "money-scout/recovery-orphaned-identity",
    leaseOwner: "stale-worker-d",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const callsBeforeOrphan = recoveryDriverCalls;
await runBuilderGatewayTick(recoveryFixtureDriver);
const [orphanRecovered] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, orphanedIdentityRun!.id));
assert.equal(orphanRecovered?.status, "BLOCKED");
assert.equal(
  orphanRecovered?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);
assert.equal(
  orphanRecovered?.providerRunId,
  "orphaned-provider-run-456",
  "a known identity is preserved, not discarded, even when reconciliation is unsupported",
);
assert.equal(
  recoveryDriverCalls,
  callsBeforeOrphan,
  "an unsupported reconciliation path never falls back to a fresh dispatch",
);

// Case D2 (fail-closed even without a driver at all): the same orphaned
// identity, recovered with no driver configured, must still refuse to
// fabricate a resolution.
const [orphanedNoDriverRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-recover-orphaned-no-driver-${recoverySuffix}`,
    provider: "ZERO_COST_RECOVERY_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_DISPATCH_ATTEMPTED",
    attemptNumber: 504,
    repairNumber: 0,
    branchName: "money-scout/recovery-orphaned-no-driver",
    leaseOwner: "stale-worker-e",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
await runBuilderGatewayTick(null);
const [orphanNoDriverRecovered] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, orphanedNoDriverRun!.id));
assert.equal(orphanNoDriverRecovered?.status, "BLOCKED");
assert.equal(
  orphanNoDriverRecovered?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);

// Terminal runs are never replayed, even if a lease field looks stale
// (defense in depth beyond the status filter alone).
await db
  .update(builderGatewayRunsTable)
  .set({ leaseExpiresAt: new Date(Date.now() - 60_000) })
  .where(eq(builderGatewayRunsTable.id, gatewayResult!.id));
await runBuilderGatewayTick(recoveryFixtureDriver);
const [stillTerminal] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, gatewayResult!.id));
assert.equal(
  stillTerminal?.status,
  "SUCCEEDED",
  "a terminal run is never reopened by recovery even if its lease field looks stale",
);
assert.equal(stillTerminal?.terminalOutcome, gatewayResult?.terminalOutcome);
assert.equal(stillTerminal?.resultCommitSha, gatewayResult?.resultCommitSha);

// Cancellation after local process/controller loss must never claim
// BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT once the provider boundary may have
// been crossed. Cancellation intent alone is not proof of a safe outcome.
const [cancelUncertainTarget] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-cancel-uncertain-${recoverySuffix}`,
    provider: "ZERO_COST_RECOVERY_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_DISPATCH_ATTEMPTED",
    attemptNumber: 505,
    repairNumber: 0,
    branchName: "money-scout/cancel-uncertain",
    leaseOwner: "stale-worker-f",
    // The lease is still technically live; only the local controller for
    // this specific run id is absent, exactly as it would be after this
    // process restarted while a different process (or none) held the run.
    leaseExpiresAt: new Date(Date.now() + 10 * 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
await cancelBuilderGatewayRun(
  cancelUncertainTarget!.id,
  "Operator requested stop after apparent process loss",
);
const [cancelledUncertain] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, cancelUncertainTarget!.id));
assert.notEqual(
  cancelledUncertain?.costProvenance,
  "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
  "cancellation intent alone can never prove no provider side effect occurred",
);
assert.equal(cancelledUncertain?.status, "BLOCKED");
assert.equal(
  cancelledUncertain?.costProvenance,
  "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
);
assert.equal(cancelledUncertain?.actualExternalCashCostCents, null);

// Cancellation before the provider boundary was ever crossed remains safe
// and immediate (regression: the earlier `cancelRun` scenario above already
// exercises this through the public API; this asserts the phase directly).
const [safeCancelSource] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, cancelRun.run.id));
assert.equal(
  safeCancelSource?.executionPhase,
  "TERMINAL_RECONCILED",
  "a pre-provider cancellation finalizes cleanly to a terminal phase",
);
assert.equal(
  safeCancelSource?.costProvenance,
  "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
  "a genuinely pre-provider cancellation may still claim no provider side effect occurred",
);
assert.equal(safeCancelSource?.terminalOutcome, "CANCELLED");

// ---------------------------------------------------------------------------
// Concurrency: exactly one live lease owner may cross the provider boundary.
// Lease recovery and provider dispatch use database compare-and-swap
// predicates rather than a stale in-memory belief of ownership, so a worker
// that has lost its lease cannot dispatch, and two racing recovery passes
// cannot both claim the same expired lease.
// ---------------------------------------------------------------------------

// A worker that loses lease ownership between claiming the run and crossing
// the provider boundary must never call the driver. This exercises the real
// dispatch CAS under genuine async interleaving (not just sequential calls):
// the row is hijacked by a raw concurrent write while the worker is still
// legitimately mid-flight preparing its worktree.
const [raceTargetRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-race-dispatch-${recoverySuffix}`,
    provider: "ZERO_COST_RACE_FIXTURE",
    status: "QUEUED",
    attemptNumber: 507,
    repairNumber: 0,
    branchName: "money-scout/race-dispatch",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let raceDriverCalled = false;
const raceDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RACE_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    raceDriverCalled = true;
    throw new Error("must never be called once lease ownership is lost");
  },
};
// Race the worker's own in-flight worktree preparation with an
// unconditional, repeated hijack attempt on every event-loop turn (no
// artificial delay -- an added sleep would only hand the worker a head
// start and make the window harder to hit). The hijack write is idempotent
// and safe to repeat: once the worker's dispatch CAS has already committed
// past PRE_PROVIDER, later hijack writes targeting `executionPhase =
// PRE_PROVIDER` simply stop matching and become no-ops.
const raceExecution = executeBuilderGatewayRun(raceTargetRun!.id, raceDriver);
let hijacked = false;
for (let attempt = 0; attempt < 5_000 && !hijacked; attempt += 1) {
  const hijackAttempt = await db
    .update(builderGatewayRunsTable)
    .set({ leaseOwner: "hijacked-by-another-worker", updatedAt: new Date() })
    .where(
      and(
        eq(builderGatewayRunsTable.id, raceTargetRun!.id),
        eq(builderGatewayRunsTable.status, "RUNNING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (hijackAttempt.length) {
    hijacked = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  hijacked,
  "test setup: expected to observe and hijack the RUNNING pre-provider window before dispatch",
);
await raceExecution;
assert.equal(
  raceDriverCalled,
  false,
  "a worker that lost lease ownership before the provider boundary must never call the driver",
);
const [raceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, raceTargetRun!.id));
assert.equal(
  raceResult?.executionPhase,
  "PRE_PROVIDER",
  "a failed dispatch CAS must not advance the execution phase",
);
assert.equal(
  raceResult?.leaseOwner,
  "hijacked-by-another-worker",
  "the row is left exactly as the new owner set it; the stale worker never touches it",
);

// Once a worker loses its execution lease, it may not mutate authoritative
// Gateway execution state anywhere between initial claim and provider
// dispatch -- not just at the dispatch CAS itself. Each scenario below
// hijacks the row during a distinct earlier pre-provider window and
// asserts the corresponding write becomes a no-op rather than mutating a
// newer owner's row.

// (a) Hijacked during worktree preparation, before the RUNNING transition:
// the transition itself is CAS-guarded and must not overwrite the new
// owner's leaseOwner/status/workspace path.
const [runningRaceRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-race-running-${recoverySuffix}`,
    provider: "ZERO_COST_RACE_RUNNING_FIXTURE",
    status: "QUEUED",
    attemptNumber: 509,
    repairNumber: 0,
    branchName: "money-scout/race-running",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let runningRaceDriverCalled = false;
const runningRaceDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RACE_RUNNING_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    runningRaceDriverCalled = true;
    throw new Error(
      "must never be called once lease ownership is lost before RUNNING",
    );
  },
};
const runningRaceExecution = executeBuilderGatewayRun(
  runningRaceRun!.id,
  runningRaceDriver,
);
let runningHijacked = false;
for (let attempt = 0; attempt < 5_000 && !runningHijacked; attempt += 1) {
  const hijackAttempt = await db
    .update(builderGatewayRunsTable)
    .set({ leaseOwner: "hijacked-before-running", updatedAt: new Date() })
    .where(
      and(
        eq(builderGatewayRunsTable.id, runningRaceRun!.id),
        eq(builderGatewayRunsTable.status, "PREPARING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (hijackAttempt.length) {
    runningHijacked = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  runningHijacked,
  "test setup: expected to observe and hijack the PREPARING pre-provider window before the RUNNING transition",
);
await runningRaceExecution;
assert.equal(
  runningRaceDriverCalled,
  false,
  "a worker that lost lease ownership before RUNNING must never reach dispatch or call the driver",
);
const [runningRaceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, runningRaceRun!.id));
assert.equal(
  runningRaceResult?.status,
  "PREPARING",
  "a failed RUNNING-transition CAS must not advance status",
);
assert.equal(
  runningRaceResult?.isolatedWorkspacePath,
  null,
  "a stale worker must not overwrite the workspace path of a row it no longer owns",
);
assert.equal(
  runningRaceResult?.leaseOwner,
  "hijacked-before-running",
  "the row is left exactly as the new owner set it",
);

// (b) Hijacked after the RUNNING transition but before the final provider
// gate is evaluated, with the final gate deterministically forced to
// fail (the build's spend ceiling is pushed above the Bet's envelope
// maximum -- a precondition set up front, not raced, so the final gate
// reliably returns not-allowed regardless of exact timing): the
// resulting pre-provider cancellation write is CAS-guarded and must not
// cancel or clear a newer owner's lease.
const [finalGateRaceRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-race-finalgate-${recoverySuffix}`,
    provider: "ZERO_COST_RACE_FINALGATE_FIXTURE",
    status: "QUEUED",
    attemptNumber: 510,
    repairNumber: 0,
    branchName: "money-scout/race-finalgate",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let finalGateRaceDriverCalled = false;
const finalGateRaceDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RACE_FINALGATE_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    finalGateRaceDriverCalled = true;
    throw new Error(
      "must never be called once lease ownership is lost before the final gate",
    );
  },
};
await db
  .update(buildJobsTable)
  .set({ externalSpendCeilingCents: 100_000, updatedAt: new Date() })
  .where(eq(buildJobsTable.id, factoryBuild!.id));
const finalGateRaceExecution = executeBuilderGatewayRun(
  finalGateRaceRun!.id,
  finalGateRaceDriver,
);
let finalGateHijacked = false;
for (let attempt = 0; attempt < 5_000 && !finalGateHijacked; attempt += 1) {
  const hijackAttempt = await db
    .update(builderGatewayRunsTable)
    .set({ leaseOwner: "hijacked-before-final-gate", updatedAt: new Date() })
    .where(
      and(
        eq(builderGatewayRunsTable.id, finalGateRaceRun!.id),
        eq(builderGatewayRunsTable.status, "RUNNING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (hijackAttempt.length) {
    finalGateHijacked = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  finalGateHijacked,
  "test setup: expected to observe and hijack the RUNNING pre-provider window before the final gate",
);
await finalGateRaceExecution;
await db
  .update(buildJobsTable)
  .set({ externalSpendCeilingCents: 100, updatedAt: new Date() })
  .where(eq(buildJobsTable.id, factoryBuild!.id));
assert.equal(
  finalGateRaceDriverCalled,
  false,
  "a worker that lost lease ownership before the final gate must never call the driver",
);
const [finalGateRaceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, finalGateRaceRun!.id));
assert.notEqual(
  finalGateRaceResult?.status,
  "CANCELLED",
  "a stale worker's failed final gate must not cancel the newer owner's run",
);
assert.equal(
  finalGateRaceResult?.leaseOwner,
  "hijacked-before-final-gate",
  "the row is left exactly as the new owner set it",
);
assert.notEqual(
  finalGateRaceResult?.leaseExpiresAt,
  null,
  "a stale worker must not clear the newer owner's lease",
);

// (c) Hijacked before an early pre-provider blocking path (here: the
// unenforceable-cost money-safety block, which fires before any worktree
// work begins): the block write is CAS-guarded and must not mutate a
// newer owner's row.
const [earlyBlockRaceRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-race-early-block-${recoverySuffix}`,
    provider: "ZERO_COST_RACE_EARLY_BLOCK_FIXTURE",
    status: "QUEUED",
    attemptNumber: 511,
    repairNumber: 0,
    branchName: "money-scout/race-early-block",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let earlyBlockRaceDriverCalled = false;
const earlyBlockRaceDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RACE_EARLY_BLOCK_FIXTURE",
  billing: {
    mode: "METERED",
    enforceableMaximumIncrementalCostCents: null,
    enforcementMechanism: null,
    payAsYouGoFallbackPossible: true,
  },
  async run() {
    earlyBlockRaceDriverCalled = true;
    throw new Error(
      "must never be called once lease ownership is lost before an early block",
    );
  },
};
const earlyBlockRaceExecution = executeBuilderGatewayRun(
  earlyBlockRaceRun!.id,
  earlyBlockRaceDriver,
);
let earlyBlockHijacked = false;
for (let attempt = 0; attempt < 5_000 && !earlyBlockHijacked; attempt += 1) {
  const hijackAttempt = await db
    .update(builderGatewayRunsTable)
    .set({
      leaseOwner: "hijacked-before-early-block",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(builderGatewayRunsTable.id, earlyBlockRaceRun!.id),
        eq(builderGatewayRunsTable.status, "PREPARING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (hijackAttempt.length) {
    earlyBlockHijacked = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  earlyBlockHijacked,
  "test setup: expected to observe and hijack the PREPARING pre-provider window before an early blocking path",
);
await earlyBlockRaceExecution;
assert.equal(
  earlyBlockRaceDriverCalled,
  false,
  "a worker that lost lease ownership before an early block must never call the driver",
);
const [earlyBlockRaceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, earlyBlockRaceRun!.id));
assert.notEqual(
  earlyBlockRaceResult?.status,
  "BLOCKED",
  "a stale worker's early blocking path must not mutate a newer owner's row",
);
assert.equal(
  earlyBlockRaceResult?.leaseOwner,
  "hijacked-before-early-block",
  "the row is left exactly as the new owner set it",
);

// Two concurrent recovery ticks racing to reclaim and execute the same
// expired pre-provider lease must never both succeed: the CAS predicate
// (id + stale status + PRE_PROVIDER + stale lease owner/identity + stale
// expiry + still-expired) lets only one requeue win, and the logical run is
// dispatched to the provider at most once.
const [concurrentRecoveryRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-race-recovery-${recoverySuffix}`,
    provider: "ZERO_COST_RACE_RECOVERY_FIXTURE",
    status: "PREPARING",
    executionPhase: "PRE_PROVIDER",
    attemptNumber: 508,
    repairNumber: 0,
    branchName: "money-scout/race-recovery",
    leaseOwner: "stale-worker-concurrent",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let raceRecoveryDriverCalls = 0;
const raceRecoveryDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RACE_RECOVERY_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    raceRecoveryDriverCalls += 1;
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "race-recovered.ts"),
      "export const raceRecovered = true;\n",
    );
    return {
      providerRunId: `race-recovery-${raceRecoveryDriverCalls}`,
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Race-recovered fixture implementation ready.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
await Promise.all([
  runBuilderGatewayTick(raceRecoveryDriver),
  runBuilderGatewayTick(raceRecoveryDriver),
]);
const [raceRecoveryResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, concurrentRecoveryRun!.id));
assert.equal(
  raceRecoveryResult?.status,
  "SUCCEEDED",
  "the row is safely recovered and executed exactly once despite two concurrent recovery ticks",
);
assert.equal(
  raceRecoveryDriverCalls,
  1,
  "two concurrent recovery passes racing the same expired lease cannot dispatch the provider twice",
);

// Normal single-worker execution is unaffected by the CAS guards (already
// exercised throughout this file by firstGateway/repairGateway/etc.; assert
// once more explicitly here for a direct, colocated regression signal).
const normalRun = await createOrReuseBuilderGatewayRun({
  buildJobId: factoryBuild!.id,
  idempotencyKey: `gateway-normal-after-concurrency-${recoverySuffix}`,
});
await executeBuilderGatewayRun(normalRun.run.id, fixtureDriver);
const [normalResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, normalRun.run.id));
assert.equal(normalResult?.status, "SUCCEEDED");
assert.equal(normalResult?.executionPhase, "TERMINAL_RECONCILED");

// ---------------------------------------------------------------------------
// Final ownership audit: downstream effects derived from a worker's result
// may occur only after that worker has durably committed authoritative
// ownership of that result, process-local cancellation bookkeeping must be
// scoped to the exact lease acquisition (not just the run ID), and a worker
// that lost its lease may not mutate the durable Asset repository either.
// ---------------------------------------------------------------------------

// Requirements #1/#2: a stale worker whose CAS fails on a non-ready
// provider result must not reconcile cost or mutate the Factory Run.
// Hijack the row from *inside* the driver's own run() call, guaranteeing
// (with no wall-clock race at all) that ownership changes before the
// Gateway's terminal write executes.
const [factoryRunBefore] = await db
  .select()
  .from(assetFactoryRunsTable)
  .where(eq(assetFactoryRunsTable.id, readyRun!.id));
const [nonReadyHijackRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-non-ready-hijack-${recoverySuffix}`,
    provider: "ZERO_COST_NON_READY_HIJACK_FIXTURE",
    status: "QUEUED",
    attemptNumber: 514,
    repairNumber: 0,
    branchName: "money-scout/non-ready-hijack",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const nonReadyHijackDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_NON_READY_HIJACK_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    await db
      .update(builderGatewayRunsTable)
      .set({
        leaseOwner: "hijacked-after-non-ready-result",
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, nonReadyHijackRun!.id));
    return {
      providerRunId: "non-ready-hijack-run",
      terminalOutcome: "PROVIDER_FAILURE",
      summary: "Fixture reports a real provider failure with a real cost.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 42,
      costProvenance: "AUTHORITATIVE_FIXTURE_PROVIDER_TERMINAL_REPORT",
      entitlementConsumption: {},
    };
  },
};
await executeBuilderGatewayRun(nonReadyHijackRun!.id, nonReadyHijackDriver);
const [nonReadyHijackResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, nonReadyHijackRun!.id));
assert.notEqual(
  nonReadyHijackResult?.status,
  "FAILED",
  "a stale worker's non-ready result write must not overwrite a newer owner's row",
);
assert.equal(
  nonReadyHijackResult?.leaseOwner,
  "hijacked-after-non-ready-result",
  "the row is left exactly as the new owner set it",
);
const nonReadyCostAttributions = await db
  .select()
  .from(betCostAttributionsTable)
  .where(
    and(
      eq(betCostAttributionsTable.sourceType, "BUILDER_GATEWAY_RUN"),
      eq(betCostAttributionsTable.sourceId, nonReadyHijackRun!.id),
    ),
  );
assert.equal(
  nonReadyCostAttributions.length,
  0,
  "a stale worker's real observed cost must never be reconciled once its terminal-write CAS fails",
);
const [factoryRunAfterNonReady] = await db
  .select()
  .from(assetFactoryRunsTable)
  .where(eq(assetFactoryRunsTable.id, readyRun!.id));
assert.equal(
  factoryRunAfterNonReady?.status,
  factoryRunBefore?.status,
  "a stale worker's non-ready result must not mutate the Factory Run",
);
assert.equal(
  factoryRunAfterNonReady?.blockerCode,
  factoryRunBefore?.blockerCode,
);

// Requirement #3: a stale worker whose *local* terminal write (the catch
// path, with an authoritative provider result already in hand) loses its
// CAS must not reconcile cost either. Force a local validation failure
// (the fixture makes no file changes and does not claim allowNoop) after
// an authoritative IMPLEMENTATION_READY result carrying a real cost, and
// hijack ownership from inside run() before that result can be recorded.
const [catchHijackRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-catch-hijack-${recoverySuffix}`,
    provider: "ZERO_COST_CATCH_HIJACK_FIXTURE",
    status: "QUEUED",
    attemptNumber: 515,
    repairNumber: 0,
    branchName: "money-scout/catch-hijack",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const catchHijackDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_CATCH_HIJACK_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    await db
      .update(builderGatewayRunsTable)
      .set({
        leaseOwner: "hijacked-before-catch-write",
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, catchHijackRun!.id));
    return {
      providerRunId: "catch-hijack-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Fixture claims success without making any change.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 7,
      costProvenance: "AUTHORITATIVE_FIXTURE_PROVIDER_TERMINAL_REPORT",
      entitlementConsumption: {},
    };
  },
};
await executeBuilderGatewayRun(catchHijackRun!.id, catchHijackDriver);
const [catchHijackResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, catchHijackRun!.id));
assert.notEqual(
  catchHijackResult?.status,
  "FAILED",
  "a stale worker's local terminal write must not overwrite a newer owner's row",
);
assert.equal(catchHijackResult?.leaseOwner, "hijacked-before-catch-write");
const catchCostAttributions = await db
  .select()
  .from(betCostAttributionsTable)
  .where(
    and(
      eq(betCostAttributionsTable.sourceType, "BUILDER_GATEWAY_RUN"),
      eq(betCostAttributionsTable.sourceId, catchHijackRun!.id),
    ),
  );
assert.equal(
  catchCostAttributions.length,
  0,
  "a stale worker's local-terminal-path cost must never be reconciled once its terminal-write CAS fails",
);

// Requirements #4/#5: process-local cancellation bookkeeping must be
// scoped to the exact lease acquisition, not just the run ID. A stale
// worker's cleanup must not delete a newer owner's controller, and
// cancellation must target the current acquisition.
let releaseStaleWorker: (() => void) | null = null;
const staleWorkerGate = new Promise<void>((resolve) => {
  releaseStaleWorker = resolve;
});
const staleWorkerDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_STALE_CONTROLLER_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    await staleWorkerGate;
    throw new Error(
      "stale worker resolving long after being superseded by a newer owner",
    );
  },
};
const [controllerRaceRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-controller-race-${recoverySuffix}`,
    provider: "ZERO_COST_STALE_CONTROLLER_FIXTURE",
    status: "QUEUED",
    attemptNumber: 516,
    repairNumber: 0,
    branchName: "money-scout/controller-race",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const staleWorkerExecution = executeBuilderGatewayRun(
  controllerRaceRun!.id,
  staleWorkerDriver,
);
let staleRegistered = false;
for (let attempt = 0; attempt < 1_000 && !staleRegistered; attempt += 1) {
  const [current] = await db
    .select()
    .from(builderGatewayRunsTable)
    .where(eq(builderGatewayRunsTable.id, controllerRaceRun!.id));
  if (
    current?.status === "RUNNING" &&
    current.executionPhase === "PROVIDER_DISPATCH_ATTEMPTED"
  ) {
    staleRegistered = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  staleRegistered,
  "test setup: expected the stale worker to reach the dispatch phase",
);
// Simulate lease recovery reassigning this run while the stale worker is
// still alive (stuck inside its provider call): force it back to a fresh
// QUEUED/PRE_PROVIDER state exactly as Case A recovery would.
await db
  .update(builderGatewayRunsTable)
  .set({
    status: "QUEUED",
    leaseOwner: null,
    leaseExpiresAt: null,
    executionPhase: "PRE_PROVIDER",
    updatedAt: new Date(),
  })
  .where(eq(builderGatewayRunsTable.id, controllerRaceRun!.id));
// A newer worker claims the freshly-requeued run for real, registering its
// own controller under the same run ID -- this must overwrite, not merge
// with, the stale worker's map entry.
let releaseNewOwner: (() => void) | null = null;
const newOwnerGate = new Promise<void>((resolve) => {
  releaseNewOwner = resolve;
});
let newOwnerObservedAbort = false;
const newOwnerDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_NEW_OWNER_CONTROLLER_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await newOwnerGate;
    newOwnerObservedAbort = request.signal.aborted;
    throw new Error("new owner observed cancellation");
  },
};
const newOwnerExecution = executeBuilderGatewayRun(
  controllerRaceRun!.id,
  newOwnerDriver,
);
let newOwnerRegistered = false;
for (let attempt = 0; attempt < 1_000 && !newOwnerRegistered; attempt += 1) {
  const [current] = await db
    .select()
    .from(builderGatewayRunsTable)
    .where(eq(builderGatewayRunsTable.id, controllerRaceRun!.id));
  if (
    current?.status === "RUNNING" &&
    current.executionPhase === "PROVIDER_DISPATCH_ATTEMPTED"
  ) {
    newOwnerRegistered = true;
    break;
  }
  await new Promise((resolve) => setImmediate(resolve));
}
assert.ok(
  newOwnerRegistered,
  "test setup: expected the new owner to reach the dispatch phase",
);
// Release the stale worker now: it finally rejects and runs its cleanup.
// This must not delete the new owner's controller registration.
releaseStaleWorker!();
await staleWorkerExecution;
// Cancel the run. If the stale worker's cleanup had wrongly deleted the
// new owner's controller, this would find no controller to abort and the
// new owner's provider call would run to completion unaware of the
// cancellation request.
await cancelBuilderGatewayRun(
  controllerRaceRun!.id,
  "operator requested cancel targeting the current acquisition",
);
releaseNewOwner!();
await newOwnerExecution;
assert.equal(
  newOwnerObservedAbort,
  true,
  "cancellation must abort the current acquisition's controller, proving a stale worker's cleanup did not delete it",
);

// Requirement #6: a worker whose provider call outlives its lease (and is
// reassigned while still in flight) must not push to the durable Asset
// repository, even after it produces a real, validated diff.
const [pushRaceRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-push-race-${recoverySuffix}`,
    provider: "ZERO_COST_PUSH_RACE_FIXTURE",
    status: "QUEUED",
    attemptNumber: 517,
    repairNumber: 0,
    branchName: "money-scout/push-race",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const pushRaceDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_PUSH_RACE_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "push-race.ts"),
      "export const pushRace = true;\n",
    );
    // Simulate the provider call outliving the lease: by the time it
    // returns, recovery has already reassigned this run to a fresh owner.
    await db
      .update(builderGatewayRunsTable)
      .set({ leaseOwner: "hijacked-before-push", updatedAt: new Date() })
      .where(eq(builderGatewayRunsTable.id, pushRaceRun!.id));
    return {
      providerRunId: "push-race-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Fixture implementation ready after outliving its lease.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
await executeBuilderGatewayRun(pushRaceRun!.id, pushRaceDriver);
const [pushRaceResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, pushRaceRun!.id));
assert.notEqual(
  pushRaceResult?.status,
  "SUCCEEDED",
  "a worker that lost ownership before finalization must not record success",
);
assert.equal(
  pushRaceResult?.resultCommitSha,
  null,
  "no commit is recorded against a row this worker lost ownership of",
);
assert.equal(pushRaceResult?.leaseOwner, "hijacked-before-push");
await assert.rejects(
  () =>
    exec("git", ["rev-parse", `refs/heads/${pushRaceResult!.branchName}`], {
      cwd: bareRepo,
    }),
  "a worker that lost ownership before finalization must never push to the durable Asset repository",
);

// Requirement #7: the authoritative (non-hijacked) worker must still
// finalize and push normally -- the ownership CAS does not break the
// common case.
const [authoritativePushRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-authoritative-push-${recoverySuffix}`,
    provider: "ZERO_COST_AUTHORITATIVE_PUSH_FIXTURE",
    status: "QUEUED",
    attemptNumber: 518,
    repairNumber: 0,
    branchName: "money-scout/authoritative-push",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const authoritativePushDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_AUTHORITATIVE_PUSH_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "authoritative-push.ts"),
      "export const authoritativePush = true;\n",
    );
    return {
      providerRunId: "authoritative-push-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Fixture implementation ready with uninterrupted ownership.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: null,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
await executeBuilderGatewayRun(authoritativePushRun!.id, authoritativePushDriver);
const [authoritativePushResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, authoritativePushRun!.id));
assert.equal(
  authoritativePushResult?.status,
  "SUCCEEDED",
  "the authoritative worker must still finalize and push normally",
);
assert.match(authoritativePushResult?.resultCommitSha ?? "", /^[0-9a-f]{40}$/);
assert.equal(
  (
    await exec(
      "git",
      ["rev-parse", `refs/heads/${authoritativePushResult!.branchName}`],
      { cwd: bareRepo },
    )
  ).stdout.trim(),
  authoritativePushResult?.resultCommitSha,
  "the authoritative worker's push reaches the durable Asset repository",
);

// Requirement #8: recovery's reconciliation write must not clobber a run
// whose still-alive worker renewed its lease (via repository finalization)
// between recovery's stale expired-lease observation and recovery's own
// write. The renewal happens from inside driver.reconcile() to land
// deterministically between recovery's read and its write.
const [reconcileRenewalRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-reconcile-renewal-${recoverySuffix}`,
    provider: "ZERO_COST_RECONCILE_RENEWAL_FIXTURE",
    status: "RUNNING",
    executionPhase: "PROVIDER_RUN_CONFIRMED",
    providerRunId: "reconcile-renewal-provider-run",
    attemptNumber: 519,
    repairNumber: 0,
    branchName: "money-scout/reconcile-renewal",
    leaseOwner: "reconcile-renewal-owner",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
let reconcileRenewalCalls = 0;
const reconcileRenewalDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_RECONCILE_RENEWAL_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    throw new Error("must not be called: this run is not QUEUED");
  },
  async reconcile(input) {
    reconcileRenewalCalls += 1;
    // Simulate the still-alive original worker renewing its lease (exactly
    // as the repository-finalization CAS does) between recovery's expired-
    // lease observation and this reconciliation write.
    await db
      .update(builderGatewayRunsTable)
      .set({
        leaseExpiresAt: new Date(Date.now() + 5 * 60_000),
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, reconcileRenewalRun!.id));
    return {
      providerRunId: input.providerRunId,
      terminalOutcome: "PROVIDER_FAILURE",
      summary: "Reconciled report arriving after a concurrent renewal.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 3,
      costProvenance: "AUTHORITATIVE_RECONCILED_FIXTURE_REPORT",
      entitlementConsumption: {},
    };
  },
};
await runBuilderGatewayTick(reconcileRenewalDriver);
const [reconcileRenewalResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, reconcileRenewalRun!.id));
assert.equal(
  reconcileRenewalCalls,
  1,
  "reconciliation is still attempted based on the stale expired-lease observation",
);
assert.equal(
  reconcileRenewalResult?.status,
  "RUNNING",
  "a lease renewed during reconciliation must not be overwritten by a now-stale recovery write",
);
assert.equal(reconcileRenewalResult?.leaseOwner, "reconcile-renewal-owner");
assert.notEqual(
  reconcileRenewalResult?.actualExternalCashCostCents,
  3,
  "a stale reconciliation write must not attach cost to a row it no longer authoritatively owns",
);

// ---------------------------------------------------------------------
// Final defect: a lease can expire while `git push` is genuinely still in
// flight. A fixed lease-renewal window is not a correctness mechanism --
// once REPOSITORY_FINALIZATION_ATTEMPTED is durably recorded (before the
// push runs), lease expiry alone must never let recovery conclude the
// repository mutation did not happen, requeue the run, or push a
// replacement result. Recovery must instead deterministically reconcile
// the exact remote branch SHA against the durably recorded
// resultCommitSha.
// ---------------------------------------------------------------------

// Requirement #1 and #2: the finalization phase (and the full provider
// result needed to reconcile it later) is durably written *before* the
// push runs, and an exception thrown after that boundary -- including one
// thrown by the push itself -- must never be concluded as a clean local
// failure. Simulated here by making the durable Asset repository
// unreachable (a directory rename) from inside driver.run(), which lands
// deterministically before the push is ever attempted, with no wall-clock
// dependency.
const finalizationDurabilityBranch = "money-scout/finalization-durability";
const [finalizationDurabilityRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-finalization-durability-${recoverySuffix}`,
    provider: "ZERO_COST_FINALIZATION_DURABILITY_FIXTURE",
    status: "QUEUED",
    attemptNumber: 520,
    repairNumber: 0,
    branchName: finalizationDurabilityBranch,
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const hiddenBareRepo = `${bareRepo}.finalization-durability-hidden`;
const finalizationDurabilityDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_FINALIZATION_DURABILITY_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "finalization-durability.ts"),
      "export const finalizationDurability = true;\n",
    );
    // Break the push target deterministically before finalization is ever
    // attempted. The worker has no way to know yet.
    await rename(bareRepo, hiddenBareRepo);
    return {
      providerRunId: "finalization-durability-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary:
        "Fixture implementation ready before the durable Asset repository becomes unreachable.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 11,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
try {
  await executeBuilderGatewayRun(
    finalizationDurabilityRun!.id,
    finalizationDurabilityDriver,
  );
} finally {
  await rename(hiddenBareRepo, bareRepo);
}
const [finalizationDurabilityResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, finalizationDurabilityRun!.id));
assert.match(
  finalizationDurabilityResult?.resultCommitSha ?? "",
  /^[0-9a-f]{40}$/,
  "Requirement #1: the intended commit SHA is durably recorded before git push runs",
);
assert.equal(
  finalizationDurabilityResult?.executionPhase,
  "REPOSITORY_FINALIZATION_ATTEMPTED",
  "Requirement #1: the finalization phase is durably persisted before the push attempt and is never silently advanced past when the mutation outcome cannot be proven",
);
assert.notEqual(
  finalizationDurabilityResult?.status,
  "SUCCEEDED",
  "a push that never reached the remote must never be recorded as a success",
);
assert.notEqual(
  finalizationDurabilityResult?.status,
  "FAILED",
  "Requirement #2: an exception thrown after crossing the repository-mutation boundary must never be concluded as a clean local failure -- that could let a repair flow dispatch a fresh, possibly duplicate, attempt",
);
assert.equal(
  finalizationDurabilityResult?.status,
  "BLOCKED",
  "an unreachable durable Asset repository after the mutation boundary was crossed resolves to a durably uncertain/blocked state, never an automatic retry",
);
assert.equal(
  finalizationDurabilityResult?.actualExternalCashCostCents,
  11,
  "the provider result (including cost) was already made durable before the push attempt, so it survives even though the push itself failed",
);

// Requirements #2, #3, #5: a lease that expires after the push already
// landed (but before the local worker recorded success) must be
// reconciled by recovery from the exact remote SHA, without ever pushing
// again. The "already pushed" state is constructed directly (bypassing
// the Gateway) so the scenario is exact and reproducible rather than
// timing-dependent.
const alreadyPushedBranch = "money-scout/already-pushed-reconciliation";
const alreadyPushedClone = await mkdtemp(
  path.join(tmpdir(), "money-scout-already-pushed-"),
);
await exec("git", ["clone", "-q", bareRepo, alreadyPushedClone]);
await exec("git", ["checkout", "-q", "-B", alreadyPushedBranch], {
  cwd: alreadyPushedClone,
});
await exec("git", ["config", "user.email", "fixture@money-scout.invalid"], {
  cwd: alreadyPushedClone,
});
await exec("git", ["config", "user.name", "Money Scout Fixture"], {
  cwd: alreadyPushedClone,
});
await writeFile(
  path.join(alreadyPushedClone, "already-pushed.txt"),
  "already pushed before the local worker recorded success\n",
);
await exec("git", ["add", "-A"], { cwd: alreadyPushedClone });
await exec("git", ["commit", "-q", "-m", "already pushed"], {
  cwd: alreadyPushedClone,
});
await exec(
  "git",
  ["push", "-q", "origin", `HEAD:refs/heads/${alreadyPushedBranch}`],
  { cwd: alreadyPushedClone },
);
const alreadyPushedSha = (
  await exec("git", ["rev-parse", "HEAD"], { cwd: alreadyPushedClone })
).stdout.trim();
await rm(alreadyPushedClone, { recursive: true, force: true });
const [alreadyPushedRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-already-pushed-${recoverySuffix}`,
    provider: "ZERO_COST_ALREADY_PUSHED_FIXTURE",
    status: "RUNNING",
    executionPhase: "REPOSITORY_FINALIZATION_ATTEMPTED",
    providerRunId: "already-pushed-provider-run",
    resultCommitSha: alreadyPushedSha,
    attemptNumber: 521,
    repairNumber: 0,
    branchName: alreadyPushedBranch,
    leaseOwner: "already-pushed-stale-owner",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: fixtureDriverUsage,
    actualExternalCashCostCents: 13,
    costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
    entitlementConsumption: { fixture_units: 1 },
    resultSummary: "Durably recorded before the push that then actually landed.",
    requestPayload: {},
  })
  .returning();
// Read-only durable Asset repository: any code path that tried to push
// again would fail loudly. Reconciliation only ever reads (`git
// ls-remote`), so this proves no second push is attempted.
await chmod(bareRepo, 0o555);
const noRedispatchDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_ALREADY_PUSHED_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    throw new Error(
      "must not be called: a run whose repository mutation was already attempted must never be redispatched",
    );
  },
};
try {
  await runBuilderGatewayTick(noRedispatchDriver);
} finally {
  await chmod(bareRepo, 0o755);
}
const [alreadyPushedResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, alreadyPushedRun!.id));
assert.equal(
  alreadyPushedResult?.status,
  "SUCCEEDED",
  "Requirement #3: recovery reconciles success from the exact remote SHA without redispatching",
);
assert.equal(alreadyPushedResult?.terminalOutcome, "IMPLEMENTATION_READY");
assert.equal(alreadyPushedResult?.executionPhase, "TERMINAL_RECONCILED");
assert.equal(alreadyPushedResult?.resultCommitSha, alreadyPushedSha);
assert.equal(
  alreadyPushedResult?.actualExternalCashCostCents,
  13,
  "cost is reconciled from the durably-stored provider result, not re-derived -- no in-memory result exists during recovery",
);
assert.equal(alreadyPushedResult?.leaseOwner, null);
const [alreadyPushedBuildJob] = await db
  .select()
  .from(buildJobsTable)
  .where(eq(buildJobsTable.id, factoryBuild!.id));
assert.equal(alreadyPushedBuildJob?.resultCommitSha, alreadyPushedSha);
assert.equal(
  (
    await exec("git", ["rev-parse", `refs/heads/${alreadyPushedBranch}`], {
      cwd: bareRepo,
    })
  ).stdout.trim(),
  alreadyPushedSha,
  "Requirement #5: the exact already-pushed SHA is not pushed a second time -- the branch still points at the same commit reconciliation observed",
);

// Requirement #4: recovery must never conclude success (or safely retry)
// when the remote branch does not show the exact intended commit -- it
// must remain durably uncertain/blocked pending human verification. Being
// conservative here is deliberate: a mismatch does not prove a dispatched
// push failed or is not still in flight.
const [unresolvedFinalizationRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-unresolved-finalization-${recoverySuffix}`,
    provider: "ZERO_COST_UNRESOLVED_FINALIZATION_FIXTURE",
    status: "RUNNING",
    executionPhase: "REPOSITORY_FINALIZATION_ATTEMPTED",
    providerRunId: "unresolved-finalization-provider-run",
    resultCommitSha: "f".repeat(40),
    attemptNumber: 522,
    repairNumber: 0,
    branchName: "money-scout/unresolved-finalization-never-pushed",
    leaseOwner: "unresolved-finalization-stale-owner",
    leaseExpiresAt: new Date(Date.now() - 60_000),
    usage: fixtureDriverUsage,
    actualExternalCashCostCents: 17,
    costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
    entitlementConsumption: { fixture_units: 1 },
    resultSummary:
      "Durably recorded before a push that never reached the remote branch.",
    requestPayload: {},
  })
  .returning();
const unresolvedFinalizationDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_UNRESOLVED_FINALIZATION_FIXTURE",
  billing: fixtureDriver.billing,
  async run() {
    throw new Error(
      "must not be called: an unresolved repository mutation must never be redispatched",
    );
  },
};
await runBuilderGatewayTick(unresolvedFinalizationDriver);
const [unresolvedFinalizationResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, unresolvedFinalizationRun!.id));
assert.equal(unresolvedFinalizationResult?.status, "BLOCKED");
assert.equal(
  unresolvedFinalizationResult?.terminalOutcome,
  "RESOURCE_BLOCKED",
);
assert.equal(
  unresolvedFinalizationResult?.executionPhase,
  "REPOSITORY_FINALIZATION_ATTEMPTED",
  "the repository-finalization phase is left untouched: the mutation outcome was never actually reconciled",
);
assert.equal(unresolvedFinalizationResult?.leaseOwner, null);
assert.equal(
  unresolvedFinalizationResult?.actualExternalCashCostCents,
  17,
  "the known provider cost, already durable before the uncertain repository boundary, is preserved rather than reset to null -- the cost is known even though the repository outcome is not",
);
const [unresolvedFinalizationAction] = await db
  .select()
  .from(humanActionsTable)
  .where(
    and(
      eq(humanActionsTable.opportunityId, opportunity.id),
      eq(
        humanActionsTable.actionType,
        "VERIFY_UNCERTAIN_BUILDER_PROVIDER_EXECUTION",
      ),
      eq(
        humanActionsTable.blockedStage,
        `BUILDER_GATEWAY:${unresolvedFinalizationRun!.id}`,
      ),
    ),
  );
assert.equal(
  unresolvedFinalizationAction?.resumeAction,
  "NO_AUTOMATIC_RESUME",
  "an unresolved repository mutation is a genuine human-only boundary, never auto-resumed",
);
await assert.rejects(
  () =>
    exec(
      "git",
      [
        "rev-parse",
        `refs/heads/${unresolvedFinalizationResult!.branchName}`,
      ],
      { cwd: bareRepo },
    ),
  "the branch was genuinely never pushed in this scenario",
);

// Requirement #6: a stale finalizer's own success write must never
// overwrite a newer authoritative state. A post-receive hook on the
// durable Asset repository fires synchronously as part of `git push` --
// verified independently to run before the push command returns to the
// caller -- so it deterministically lands between the finalization-claim
// write and the worker's own success write, exactly the window a
// concurrent recovery pass could otherwise race into. The hook simulates
// exactly that: a recovery pass concluding BLOCKED for this run while the
// push was still in flight.
const [staleFinalizerRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-stale-finalizer-${recoverySuffix}`,
    provider: "ZERO_COST_STALE_FINALIZER_FIXTURE",
    status: "QUEUED",
    attemptNumber: 523,
    repairNumber: 0,
    branchName: "money-scout/stale-finalizer",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const staleFinalizerHookPath = path.join(bareRepo, "hooks", "post-receive");
const staleFinalizerHookScript = `#!/bin/sh
psql '${process.env.DATABASE_URL}' -v ON_ERROR_STOP=1 -c "UPDATE builder_gateway_runs SET status='BLOCKED', terminal_outcome='RESOURCE_BLOCKED', execution_phase='TERMINAL_RECONCILED', lease_owner=NULL, lease_expires_at=NULL, finished_at=now(), updated_at=now() WHERE id=${staleFinalizerRun!.id} AND execution_phase='REPOSITORY_FINALIZATION_ATTEMPTED'" >&2
`;
await writeFile(staleFinalizerHookPath, staleFinalizerHookScript, {
  mode: 0o755,
});
const staleFinalizerDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_STALE_FINALIZER_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "stale-finalizer.ts"),
      "export const staleFinalizer = true;\n",
    );
    return {
      providerRunId: "stale-finalizer-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary:
        "Fixture implementation ready; a concurrent recovery pass wins the race during the push.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 19,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
try {
  await executeBuilderGatewayRun(staleFinalizerRun!.id, staleFinalizerDriver);
} finally {
  await rm(staleFinalizerHookPath, { force: true });
}
const [staleFinalizerResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, staleFinalizerRun!.id));
assert.equal(
  staleFinalizerResult?.status,
  "BLOCKED",
  "Requirement #6: the recovery pass that won the race (simulated by the hook) remains the authoritative outcome",
);
assert.equal(staleFinalizerResult?.terminalOutcome, "RESOURCE_BLOCKED");
assert.notEqual(
  staleFinalizerResult?.status,
  "SUCCEEDED",
  "the stale finalizer's own success write must not overwrite the newer authoritative BLOCKED state",
);
assert.equal(
  (
    await exec(
      "git",
      ["rev-parse", `refs/heads/${staleFinalizerResult!.branchName}`],
      { cwd: bareRepo },
    )
  ).stdout.trim(),
  staleFinalizerResult?.resultCommitSha,
  "the push itself genuinely succeeded (the hook only races the bookkeeping write, not the mutation) -- the durable repository matches the intended commit even though Money Scout's own row was already claimed by another authoritative writer",
);

// Requirement #7: ordinary successful finalization still works end to end
// through the new phase machinery -- REPOSITORY_FINALIZATION_ATTEMPTED is
// not left behind, and durable result data recorded before the push
// survives all the way to the terminal write.
const [ordinaryFinalizationRun] = await db
  .insert(builderGatewayRunsTable)
  .values({
    buildJobId: factoryBuild!.id,
    assetRepositoryId: readyRun!.assetRepositoryId!,
    idempotencyKey: `gateway-ordinary-finalization-${recoverySuffix}`,
    provider: "ZERO_COST_ORDINARY_FINALIZATION_FIXTURE",
    status: "QUEUED",
    attemptNumber: 524,
    repairNumber: 0,
    branchName: "money-scout/ordinary-finalization",
    usage: leaseRow.usage,
    actualExternalCashCostCents: null,
    costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
    entitlementConsumption: {},
    requestPayload: {},
  })
  .returning();
const ordinaryFinalizationDriver: BuilderProviderDriver = {
  provider: "ZERO_COST_ORDINARY_FINALIZATION_FIXTURE",
  billing: fixtureDriver.billing,
  async run(request) {
    await mkdir(path.join(request.workingDirectory, "src"), {
      recursive: true,
    });
    await writeFile(
      path.join(request.workingDirectory, "src", "ordinary-finalization.ts"),
      "export const ordinaryFinalization = true;\n",
    );
    return {
      providerRunId: "ordinary-finalization-run",
      terminalOutcome: "IMPLEMENTATION_READY",
      summary: "Fixture implementation ready with an uninterrupted finalization.",
      challenge: null,
      allowNoop: false,
      usage: fixtureDriverUsage,
      actualExternalCashCostCents: 23,
      costProvenance: "FIXTURE_NO_EXTERNAL_PROVIDER",
      entitlementConsumption: { fixture_units: 1 },
    };
  },
};
await executeBuilderGatewayRun(
  ordinaryFinalizationRun!.id,
  ordinaryFinalizationDriver,
);
const [ordinaryFinalizationResult] = await db
  .select()
  .from(builderGatewayRunsTable)
  .where(eq(builderGatewayRunsTable.id, ordinaryFinalizationRun!.id));
assert.equal(ordinaryFinalizationResult?.status, "SUCCEEDED");
assert.equal(
  ordinaryFinalizationResult?.terminalOutcome,
  "IMPLEMENTATION_READY",
);
assert.equal(
  ordinaryFinalizationResult?.executionPhase,
  "TERMINAL_RECONCILED",
  "the new REPOSITORY_FINALIZATION_ATTEMPTED phase is not left behind on an ordinary successful run",
);
assert.equal(ordinaryFinalizationResult?.actualExternalCashCostCents, 23);
assert.equal(
  (
    await exec(
      "git",
      ["rev-parse", `refs/heads/${ordinaryFinalizationResult!.branchName}`],
      { cwd: bareRepo },
    )
  ).stdout.trim(),
  ordinaryFinalizationResult?.resultCommitSha,
  "the durable Asset repository carries the exact recorded commit",
);

await db
  .delete(opportunitiesTable)
  .where(eq(opportunitiesTable.id, opportunity.id));
await rm(root, { recursive: true, force: true });
console.log("PASS zero-cost Asset Factory/Gateway integration");
