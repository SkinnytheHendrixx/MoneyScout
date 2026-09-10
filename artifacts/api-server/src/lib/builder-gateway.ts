import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { and, asc, eq, inArray, lt, sql } from "drizzle-orm";
import {
  assetFactoryRunsTable,
  assetRepositoriesTable,
  betCostAttributionsTable,
  betsTable,
  builderGatewayRunsTable,
  builderWorkspacesTable,
  buildJobsTable,
  db,
  type BuilderTerminalOutcome,
  type BuilderUsage,
  type PersistedQaDefect,
} from "@workspace/db";
import { validateBuilderRepositoryOutput } from "./asset-repo-contract";
import {
  configuredCodexBuilderDriver,
  sanitizedBuilderEnvironment,
  type BuilderProviderDriver,
} from "./builder-provider-driver";
import { factoryBetMayProgress } from "./asset-factory";
import {
  createOrReuseHumanAction,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
} from "./human-gates";
import { logger } from "./logger";

const execFileAsync = promisify(execFile);
const EMPTY_USAGE: BuilderUsage = {
  model: null,
  inputTokens: null,
  cachedInputTokens: null,
  outputTokens: null,
  reasoningTokens: null,
  durationMs: null,
  entitlementUnits: null,
};
const activeAbortControllers = new Map<number, AbortController>();

type GatewayStartInput = {
  buildJobId: number;
  idempotencyKey: string;
  repairDefects?: PersistedQaDefect[];
};

function branchFor(buildJobId: number, attemptNumber: number): string {
  return `money-scout/build-${buildJobId}-attempt-${attemptNumber}`;
}

export async function createOrReuseBuilderGatewayRun(input: GatewayStartInput) {
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, input.buildJobId));
  if (
    !job?.assetRepositoryId ||
    !job.factoryRunId ||
    job.contract.schemaVersion !== 2
  ) {
    throw new Error("BUILDER_GATEWAY_REQUIRES_FACTORY_BUILD_V2");
  }
  const existing = (
    await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.idempotencyKey, input.idempotencyKey))
  )[0];
  if (existing) {
    if (
      existing.buildJobId !== job.id ||
      existing.assetRepositoryId !== job.assetRepositoryId
    )
      throw new Error("BUILDER_GATEWAY_IDEMPOTENCY_CONFLICT");
    return { run: existing, reused: true };
  }
  const prior = await db
    .select()
    .from(builderGatewayRunsTable)
    .where(eq(builderGatewayRunsTable.buildJobId, job.id))
    .orderBy(asc(builderGatewayRunsTable.attemptNumber));
  const attemptNumber = prior.length + 1;
  const [created] = await db
    .insert(builderGatewayRunsTable)
    .values({
      buildJobId: job.id,
      assetRepositoryId: job.assetRepositoryId,
      idempotencyKey: input.idempotencyKey,
      provider: "OPENAI_CODEX_SDK",
      status: "QUEUED",
      attemptNumber,
      repairNumber: input.repairDefects?.length
        ? prior.filter((item) => item.repairNumber > 0).length + 1
        : 0,
      branchName: branchFor(job.id, attemptNumber),
      usage: EMPTY_USAGE,
      actualExternalCashCostCents: null,
      costProvenance: "UNKNOWN_UNTIL_PROVIDER_REPORTS",
      entitlementConsumption: {},
      requestPayload: { repair_defects: input.repairDefects ?? [] },
    })
    .onConflictDoNothing({ target: builderGatewayRunsTable.idempotencyKey })
    .returning();
  const run =
    created ??
    (
      await db
        .select()
        .from(builderGatewayRunsTable)
        .where(eq(builderGatewayRunsTable.idempotencyKey, input.idempotencyKey))
    )[0];
  if (!run) throw new Error("BUILDER_GATEWAY_RUN_CREATE_FAILED");
  return { run, reused: !created };
}

function gatewayGitEnvironment(token: string): NodeJS.ProcessEnv {
  return {
    ...sanitizedBuilderEnvironment(),
    GIT_TERMINAL_PROMPT: "0",
    MONEY_SCOUT_GATEWAY_GIT_TOKEN: token,
  };
}

async function git(cwd: string, args: string[], env: NodeJS.ProcessEnv) {
  return execFileAsync("git", args, { cwd, env, maxBuffer: 10 * 1024 * 1024 });
}

async function repositoryCredentialAvailable(
  repositoryUrl: string,
): Promise<string | null> {
  if (/^(file:\/\/|\/)/.test(repositoryUrl)) return "LOCAL_NO_CREDENTIAL";
  return process.env.MONEY_SCOUT_BUILDER_GATEWAY_REPO_TOKEN?.trim() || null;
}

async function blockRunForCapability(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  opportunityId: number;
  code: string;
  actionType: string;
  title: string;
  whyNeeded: string;
  instructions: string;
  capabilityKey: string;
  provider: string;
  outcome?: BuilderTerminalOutcome;
}): Promise<void> {
  await createOrReuseHumanAction({
    opportunityId: input.opportunityId,
    actionType: input.actionType,
    title: input.title,
    whyNeeded: input.whyNeeded,
    instructions: input.instructions,
    blockedStage: `BUILDER_GATEWAY:${input.run.id}`,
    requiredCapabilityKey: input.capabilityKey,
    provider: input.provider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: {
      builder_gateway_run_id: input.run.id,
      build_job_id: input.run.buildJobId,
    },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(builderGatewayRunsTable)
    .set({
      status: "BLOCKED",
      terminalOutcome: input.outcome ?? "DEPENDENCY_BLOCKED",
      actualExternalCashCostCents: null,
      costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
      resultSummary: input.code,
      finishedAt: new Date(),
      leaseOwner: null,
      leaseExpiresAt: null,
      updatedAt: new Date(),
    })
    .where(eq(builderGatewayRunsTable.id, input.run.id));
}

async function blockRunForMissingMoneySafety(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  job: typeof buildJobsTable.$inferSelect;
  code: string;
  provider: string;
}): Promise<void> {
  const now = new Date();
  await db
    .update(builderGatewayRunsTable)
    .set({
      status: "BLOCKED",
      terminalOutcome: "RESOURCE_BLOCKED",
      actualExternalCashCostCents: null,
      costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
      resultSummary: input.code,
      challenge: {
        kind: "MISSING_SHARED_MONEY_SAFETY_PRIMITIVE",
        provider: input.provider,
        retryable_by_automation: false,
        human_attestation_cannot_satisfy: true,
        requirement:
          "Atomically reserve the provider-enforced maximum incremental cost for this exact run, or prove a no-paygo entitlement path.",
      },
      finishedAt: now,
      leaseOwner: null,
      leaseExpiresAt: null,
      updatedAt: now,
    })
    .where(eq(builderGatewayRunsTable.id, input.run.id));
  await db
    .update(buildJobsTable)
    .set({ status: "BLOCKED", blockedReason: input.code, updatedAt: now })
    .where(eq(buildJobsTable.id, input.job.id));
  if (input.job.factoryRunId) {
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: "BUILDER_BLOCKED",
        blockerCode: input.code,
        nextAction:
          "Add the shared Money Safety per-run reservation primitive or a verified no-paygo entitlement. Human request text, broad budget, and remaining capital cannot unblock this run.",
        updatedAt: now,
      })
      .where(eq(assetFactoryRunsTable.id, input.job.factoryRunId));
  }
}

export function realProviderExecutionGate(input: {
  nodeEnvironment: string | undefined;
  billing: BuilderProviderDriver["billing"];
  atomicReservationAvailable: boolean;
}): { allowed: boolean; blocker: string | null } {
  if (input.billing.mode === "ZERO_COST_FIXTURE") {
    return input.nodeEnvironment === "test"
      ? { allowed: true, blocker: null }
      : { allowed: false, blocker: "ZERO_COST_FIXTURE_FORBIDDEN_OUTSIDE_TEST" };
  }
  if (input.billing.mode === "ENTITLEMENT") {
    if (input.billing.payAsYouGoFallbackPossible) {
      return {
        allowed: false,
        blocker: "ENTITLEMENT_PAYG_FALLBACK_NOT_FAIL_CLOSED",
      };
    }
    return input.billing.enforcementMechanism
      ? { allowed: true, blocker: null }
      : { allowed: false, blocker: "ENTITLEMENT_ENFORCEMENT_UNVERIFIED" };
  }
  if (
    input.billing.enforceableMaximumIncrementalCostCents == null ||
    !input.billing.enforcementMechanism
  ) {
    return {
      allowed: false,
      blocker: "PROVIDER_RUN_MAXIMUM_COST_NOT_ENFORCEABLE",
    };
  }
  if (!input.atomicReservationAvailable) {
    return {
      allowed: false,
      blocker: "SHARED_MONEY_SAFETY_RESERVATION_REQUIRED",
    };
  }
  return { allowed: true, blocker: null };
}

async function prepareWorktree(input: {
  repositoryUrl: string;
  defaultBranch: string;
  baseCommitSha: string;
  branchName: string;
  token: string;
}): Promise<{
  root: string;
  repositoryPath: string;
  gitEnv: NodeJS.ProcessEnv;
}> {
  const root = await mkdtemp(path.join(tmpdir(), "money-scout-builder-"));
  const repositoryPath = path.join(root, "repository");
  const gitEnv = gatewayGitEnvironment(input.token);
  if (input.token !== "LOCAL_NO_CREDENTIAL") {
    const askPass = path.join(root, "git-askpass.sh");
    await writeFile(
      askPass,
      "#!/bin/sh\ncase \"$1\" in *sername*) printf '%s' 'x-access-token' ;; *) printf '%s' \"$MONEY_SCOUT_GATEWAY_GIT_TOKEN\" ;; esac\n",
      { mode: 0o700 },
    );
    gitEnv.GIT_ASKPASS = askPass;
  }
  await git(
    root,
    ["clone", "--no-checkout", input.repositoryUrl, repositoryPath],
    gitEnv,
  );
  await git(
    repositoryPath,
    ["checkout", "-B", input.branchName, input.baseCommitSha],
    gitEnv,
  );
  await git(
    repositoryPath,
    ["config", "user.name", "Money Scout Builder Gateway"],
    gitEnv,
  );
  await git(
    repositoryPath,
    ["config", "user.email", "builder-gateway@money-scout.invalid"],
    gitEnv,
  );
  return { root, repositoryPath, gitEnv };
}

async function manifestContents(
  repositoryPath: string,
  paths: string[],
): Promise<Record<string, string>> {
  const entries = await Promise.all(
    paths.map(
      async (name) =>
        [
          name,
          await readFile(path.join(repositoryPath, name), "utf8"),
        ] as const,
    ),
  );
  return Object.fromEntries(entries);
}

async function changedPaths(
  repositoryPath: string,
  gitEnv: NodeJS.ProcessEnv,
): Promise<string[]> {
  const result = await git(
    repositoryPath,
    ["status", "--porcelain", "--untracked-files=all"],
    gitEnv,
  );
  return result.stdout
    .split("\n")
    .map((line) => line.slice(3).trim())
    .filter(Boolean);
}

async function potentialSecrets(
  repositoryPath: string,
  paths: string[],
): Promise<string[]> {
  const matches: string[] = [];
  const secretPattern =
    /(-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'][A-Za-z0-9_\-\/+=]{16,})/i;
  for (const name of paths) {
    try {
      const value = await readFile(path.join(repositoryPath, name), "utf8");
      if (secretPattern.test(value)) matches.push(name);
    } catch {
      // Deleted and binary files are handled by Git/QA; they are not readable secret text.
    }
  }
  return matches;
}

async function reconcileObservedCashCost(
  job: typeof buildJobsTable.$inferSelect,
  gatewayRunId: number,
  cents: number | null,
): Promise<void> {
  if (cents == null || cents <= 0 || !job.betId) return;
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(betCostAttributionsTable)
      .where(
        and(
          eq(betCostAttributionsTable.betId, job.betId!),
          eq(betCostAttributionsTable.sourceType, "BUILDER_GATEWAY_RUN"),
          eq(betCostAttributionsTable.sourceId, gatewayRunId),
        ),
      );
    const delta = cents - (existing?.consumedCents ?? 0);
    if (delta > 0) {
      await tx
        .update(buildJobsTable)
        .set({
          externalSpendUsedCents: sql`${buildJobsTable.externalSpendUsedCents} + ${delta}`,
          updatedAt: new Date(),
        })
        .where(eq(buildJobsTable.id, job.id));
    }
    await tx
      .insert(betCostAttributionsTable)
      .values({
        betId: job.betId!,
        sourceType: "BUILDER_GATEWAY_RUN",
        sourceId: gatewayRunId,
        resourceBucket: "build",
        committedCents: 0,
        consumedCents: cents,
        sourceUpdatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: [
          betCostAttributionsTable.betId,
          betCostAttributionsTable.sourceType,
          betCostAttributionsTable.sourceId,
        ],
        set: {
          consumedCents: cents,
          sourceUpdatedAt: new Date(),
          reconciledAt: new Date(),
        },
      });
  });
}

function gatewayStatusForOutcome(
  outcome: BuilderTerminalOutcome,
): "SUCCEEDED" | "CHALLENGED" | "BLOCKED" | "FAILED" | "CANCELLED" {
  if (outcome === "IMPLEMENTATION_READY") return "SUCCEEDED";
  if (
    outcome === "ARCHITECTURE_CHALLENGE" ||
    outcome === "PRODUCT_CONTRACT_CHALLENGE"
  )
    return "CHALLENGED";
  if (outcome === "DEPENDENCY_BLOCKED" || outcome === "RESOURCE_BLOCKED")
    return "BLOCKED";
  if (outcome === "CANCELLED") return "CANCELLED";
  return "FAILED";
}

function factoryStatusForOutcome(
  outcome: BuilderTerminalOutcome,
): "CHALLENGED" | "BUILDER_BLOCKED" | "FAILED" | "CANCELLED" {
  if (
    outcome === "ARCHITECTURE_CHALLENGE" ||
    outcome === "PRODUCT_CONTRACT_CHALLENGE"
  )
    return "CHALLENGED";
  if (outcome === "DEPENDENCY_BLOCKED" || outcome === "RESOURCE_BLOCKED")
    return "BUILDER_BLOCKED";
  if (outcome === "CANCELLED") return "CANCELLED";
  return "FAILED";
}

async function revalidateImmediatelyBeforeProviderSideEffect(input: {
  jobId: number;
  driver: BuilderProviderDriver;
}): Promise<{ allowed: true } | { allowed: false; reason: string }> {
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, input.jobId));
  if (!job?.betId)
    return { allowed: false, reason: "BET_REQUIRED_AT_PROVIDER_BOUNDARY" };
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, job.betId));
  if (!bet || !factoryBetMayProgress(bet.status))
    return { allowed: false, reason: "BET_INACTIVE_AT_PROVIDER_BOUNDARY" };
  if (
    job.externalSpendCeilingCents >
      bet.buildEnvelope.maximumExternalBuildSpendCents ||
    job.externalSpendUsedCents > job.externalSpendCeilingCents
  ) {
    return {
      allowed: false,
      reason: "BUILD_ENVELOPE_EXCEEDED_AT_PROVIDER_BOUNDARY",
    };
  }
  // Metered execution cannot currently reach this boundary because the shared
  // atomic reservation primitive is deliberately unavailable. When it exists,
  // its exact-run reservation and scoped spend authority must be revalidated
  // here in one transaction rather than inferred from remaining budget.
  return { allowed: true };
}

export async function executeBuilderGatewayRun(
  runId: number,
  driverOverride?: BuilderProviderDriver | null,
): Promise<void> {
  const leaseOwner = `gateway:${process.pid}:${runId}`;
  const [run] = await db
    .update(builderGatewayRunsTable)
    .set({
      status: "PREPARING",
      leaseOwner,
      leaseExpiresAt: new Date(Date.now() + 15 * 60_000),
      startedAt: new Date(),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(builderGatewayRunsTable.id, runId),
        eq(builderGatewayRunsTable.status, "QUEUED"),
      ),
    )
    .returning();
  if (!run) return;
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, run.buildJobId));
  const [repository] = await db
    .select()
    .from(assetRepositoriesTable)
    .where(eq(assetRepositoriesTable.id, run.assetRepositoryId));
  const [bet] = job?.betId
    ? await db.select().from(betsTable).where(eq(betsTable.id, job.betId))
    : [];
  if (!job || !repository || !bet || !factoryBetMayProgress(bet.status)) {
    await db
      .update(builderGatewayRunsTable)
      .set({
        status: "CANCELLED",
        terminalOutcome: "CANCELLED",
        actualExternalCashCostCents: null,
        costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
        resultSummary:
          "Bet/build/repository became ineligible before provider execution.",
        finishedAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, run.id));
    return;
  }
  if (!repository.repositoryUrl || !repository.baseCommitSha) {
    await blockRunForCapability({
      run,
      opportunityId: job.opportunityId,
      code: "ASSET_REPOSITORY_NOT_PROVISIONED",
      actionType: "CONNECT_ASSET_REPOSITORY_PROVIDER",
      title: "Finish Asset repository provisioning",
      whyNeeded:
        "The Builder Gateway has no exact repository URL/base commit to check out.",
      instructions:
        "Connect or repair the narrow repository provisioner; do not give repository credentials to the coding agent.",
      capabilityKey: "ASSET_REPOSITORY_PROVISIONER_ACCESS",
      provider: repository.provider,
    });
    return;
  }
  const token = await repositoryCredentialAvailable(repository.repositoryUrl);
  if (!token) {
    await blockRunForCapability({
      run,
      opportunityId: job.opportunityId,
      code: "BUILDER_GATEWAY_REPOSITORY_ACCESS_REQUIRED",
      actionType: "CONNECT_BUILDER_GATEWAY_REPOSITORY_ACCESS",
      title: "Connect narrow Builder Gateway repository access",
      whyNeeded:
        "The Gateway must clone and push the private Asset repository while withholding Git credentials from the coding agent.",
      instructions:
        "Configure a narrow repository credential in the Gateway secret store. Never place it in the repository, Build Contract, or coding-agent environment.",
      capabilityKey: "BUILDER_GATEWAY_REPOSITORY_ACCESS",
      provider: repository.provider,
    });
    return;
  }
  const driver =
    driverOverride === undefined
      ? configuredCodexBuilderDriver()
      : driverOverride;
  if (!driver) {
    await blockRunForCapability({
      run,
      opportunityId: job.opportunityId,
      code: "CODEX_BUILDER_PROVIDER_ACCESS_REQUIRED",
      actionType: "CONNECT_CODEX_BUILDER_PROVIDER",
      title: "Connect the Codex Builder Gateway provider",
      whyNeeded:
        "The safe Gateway boundary is ready, but no official Codex SDK credential is configured for real autonomous coding.",
      instructions:
        "Connect Codex through the Gateway secret store and declare whether execution uses a bounded paid API budget or an existing entitlement. Do not put the credential in an Asset repository.",
      capabilityKey: "CODEX_BUILDER_PROVIDER_ACCESS",
      provider: "OPENAI_CODEX_SDK",
    });
    return;
  }
  const executionGate = realProviderExecutionGate({
    nodeEnvironment: process.env.NODE_ENV,
    billing: driver.billing,
    atomicReservationAvailable: false,
  });
  if (!executionGate.allowed) {
    await blockRunForMissingMoneySafety({
      run,
      job,
      code:
        executionGate.blocker ?? "BUILDER_PROVIDER_FINANCIAL_SAFETY_BLOCKED",
      provider: driver.provider,
    });
    return;
  }
  let worktree: Awaited<ReturnType<typeof prepareWorktree>> | null = null;
  let observedProviderResult: Awaited<
    ReturnType<BuilderProviderDriver["run"]>
  > | null = null;
  const controller = new AbortController();
  activeAbortControllers.set(run.id, controller);
  try {
    const payload = run.requestPayload as {
      repair_defects?: PersistedQaDefect[];
    };
    const isRepair = Boolean(payload.repair_defects?.length);
    const attemptBaseCommitSha = isRepair
      ? (job.resultCommitSha ?? repository.baseCommitSha)
      : repository.baseCommitSha;
    worktree = await prepareWorktree({
      repositoryUrl: repository.repositoryUrl,
      defaultBranch: repository.defaultBranch,
      baseCommitSha: attemptBaseCommitSha,
      branchName: run.branchName,
      token,
    });
    const authoritativeFiles = repository.manifestFiles;
    const originals = await manifestContents(
      worktree.repositoryPath,
      Object.keys(authoritativeFiles),
    );
    if (JSON.stringify(originals) !== JSON.stringify(authoritativeFiles))
      throw new Error("GATEWAY_REPOSITORY_MANIFEST_BASE_MISMATCH");
    await db
      .update(builderGatewayRunsTable)
      .set({
        status: "RUNNING",
        isolatedWorkspacePath: worktree.repositoryPath,
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, run.id));
    const finalGate = await revalidateImmediatelyBeforeProviderSideEffect({
      jobId: job.id,
      driver,
    });
    if (!finalGate.allowed) {
      await db
        .update(builderGatewayRunsTable)
        .set({
          status: "CANCELLED",
          terminalOutcome: "CANCELLED",
          resultSummary: finalGate.reason,
          actualExternalCashCostCents: null,
          costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
          isolatedWorkspacePath: null,
          finishedAt: new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(builderGatewayRunsTable.id, run.id));
      return;
    }
    const result = await driver.run({
      workingDirectory: worktree.repositoryPath,
      buildContract: job.contract,
      repairDefects: payload.repair_defects ?? [],
      signal: controller.signal,
    });
    observedProviderResult = result;
    if (result.terminalOutcome !== "IMPLEMENTATION_READY") {
      const gatewayStatus = gatewayStatusForOutcome(result.terminalOutcome);
      const factoryStatus = factoryStatusForOutcome(result.terminalOutcome);
      await db
        .update(builderGatewayRunsTable)
        .set({
          status: gatewayStatus,
          terminalOutcome: result.terminalOutcome,
          providerRunId: result.providerRunId,
          baseCommitSha: attemptBaseCommitSha,
          usage: result.usage,
          actualExternalCashCostCents: result.actualExternalCashCostCents,
          costProvenance: result.costProvenance,
          entitlementConsumption: result.entitlementConsumption,
          resultSummary: result.summary,
          challenge: result.challenge,
          isolatedWorkspacePath: null,
          finishedAt: new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(eq(builderGatewayRunsTable.id, run.id));
      await reconcileObservedCashCost(
        job,
        run.id,
        result.actualExternalCashCostCents,
      );
      if (job.factoryRunId)
        await db
          .update(assetFactoryRunsTable)
          .set({
            status: factoryStatus,
            blockerCode: result.terminalOutcome,
            nextAction:
              result.terminalOutcome === "ARCHITECTURE_CHALLENGE"
                ? "Route discovered evidence to Architecture Composer versioning; do not create a QA repair."
                : result.terminalOutcome === "PRODUCT_CONTRACT_CHALLENGE"
                  ? "Route contradiction evidence to Product Definition versioning; builder cannot rewrite scope."
                  : result.terminalOutcome === "DEPENDENCY_BLOCKED" ||
                      result.terminalOutcome === "RESOURCE_BLOCKED"
                    ? "Resolve the precise structured builder dependency/resource outcome; do not route it to QA."
                    : "Review the terminal provider result; do not retry a potentially charged run blindly.",
            finishedAt: factoryStatus === "BUILDER_BLOCKED" ? null : new Date(),
            updatedAt: new Date(),
          })
          .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
      return;
    }
    const changes = await changedPaths(
      worktree.repositoryPath,
      worktree.gitEnv,
    );
    const resultingManifests = await manifestContents(
      worktree.repositoryPath,
      Object.keys(authoritativeFiles),
    );
    const validationDefects = validateBuilderRepositoryOutput({
      originalManifestFiles: authoritativeFiles,
      resultingManifestFiles: resultingManifests,
      changedPaths: changes,
      branchName: run.branchName,
      expectedBranchName: run.branchName,
      secretMatches: await potentialSecrets(worktree.repositoryPath, changes),
      allowNoop: result.allowNoop,
    });
    if (validationDefects.length)
      throw new Error(
        `GATEWAY_OUTPUT_VALIDATION_FAILED:${validationDefects.join(",")}`,
      );
    let resultCommitSha = attemptBaseCommitSha;
    if (changes.length) {
      await git(worktree.repositoryPath, ["add", "-A"], worktree.gitEnv);
      await git(
        worktree.repositoryPath,
        [
          "commit",
          "-m",
          `Money Scout Build ${job.id} attempt ${run.attemptNumber}`,
        ],
        worktree.gitEnv,
      );
      resultCommitSha = (
        await git(
          worktree.repositoryPath,
          ["rev-parse", "HEAD"],
          worktree.gitEnv,
        )
      ).stdout.trim();
    }
    if (!/^[0-9a-f]{40,64}$/i.test(resultCommitSha))
      throw new Error("GATEWAY_RESULT_COMMIT_SHA_INVALID");
    await git(
      worktree.repositoryPath,
      ["push", "origin", `HEAD:refs/heads/${run.branchName}`],
      worktree.gitEnv,
    );
    const now = new Date();
    await db
      .update(builderGatewayRunsTable)
      .set({
        status: "SUCCEEDED",
        terminalOutcome: "IMPLEMENTATION_READY",
        providerRunId: result.providerRunId,
        baseCommitSha: attemptBaseCommitSha,
        resultCommitSha,
        usage: result.usage,
        actualExternalCashCostCents: result.actualExternalCashCostCents,
        costProvenance: result.costProvenance,
        entitlementConsumption: result.entitlementConsumption,
        resultSummary: result.summary,
        challenge: null,
        isolatedWorkspacePath: null,
        finishedAt: now,
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(eq(builderGatewayRunsTable.id, run.id));
    await db
      .update(buildJobsTable)
      .set({ resultCommitSha, updatedAt: now })
      .where(eq(buildJobsTable.id, job.id));
    await reconcileObservedCashCost(
      job,
      run.id,
      result.actualExternalCashCostCents,
    );
  } catch (error) {
    const cancelled = controller.signal.aborted;
    const message =
      error instanceof Error
        ? error.message
        : "Unknown Builder Gateway failure";
    await db
      .update(builderGatewayRunsTable)
      .set({
        status: cancelled ? "CANCELLED" : "FAILED",
        terminalOutcome: cancelled ? "CANCELLED" : "PROVIDER_FAILURE",
        providerRunId: observedProviderResult?.providerRunId,
        usage: observedProviderResult?.usage ?? run.usage,
        actualExternalCashCostCents:
          observedProviderResult?.actualExternalCashCostCents ?? null,
        costProvenance:
          observedProviderResult?.costProvenance ??
          (cancelled
            ? "PROVIDER_CANCELLATION_COST_UNKNOWN_PENDING_AUTHORITATIVE_REPORT"
            : "PROVIDER_FAILURE_COST_UNKNOWN_PENDING_AUTHORITATIVE_REPORT"),
        entitlementConsumption:
          observedProviderResult?.entitlementConsumption ??
          run.entitlementConsumption,
        resultSummary: message.slice(0, 4_000),
        isolatedWorkspacePath: null,
        finishedAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, run.id));
    await reconcileObservedCashCost(
      job,
      run.id,
      observedProviderResult?.actualExternalCashCostCents ?? null,
    );
    logger.warn(
      { err: error, gatewayRunId: run.id },
      "Builder Gateway run stopped safely",
    );
  } finally {
    activeAbortControllers.delete(run.id);
    if (worktree) await rm(worktree.root, { recursive: true, force: true });
  }
}

export async function cancelBuilderGatewayRun(runId: number, reason: string) {
  activeAbortControllers.get(runId)?.abort(reason);
  const [updated] = await db
    .update(builderGatewayRunsTable)
    .set({
      cancellationRequestedAt: new Date(),
      status: "CANCELLING",
      resultSummary: reason.slice(0, 4_000),
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(builderGatewayRunsTable.id, runId),
        inArray(builderGatewayRunsTable.status, [
          "QUEUED",
          "PREPARING",
          "RUNNING",
        ]),
      ),
    )
    .returning();
  if (!updated)
    return (
      (
        await db
          .select()
          .from(builderGatewayRunsTable)
          .where(eq(builderGatewayRunsTable.id, runId))
      )[0] ?? null
    );
  if (!activeAbortControllers.has(runId)) {
    const [cancelled] = await db
      .update(builderGatewayRunsTable)
      .set({
        status: "CANCELLED",
        terminalOutcome: "CANCELLED",
        actualExternalCashCostCents: null,
        costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
        finishedAt: new Date(),
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: new Date(),
      })
      .where(eq(builderGatewayRunsTable.id, runId))
      .returning();
    return cancelled ?? updated;
  }
  return updated;
}

export async function runBuilderGatewayTick(
  driverOverride?: BuilderProviderDriver | null,
): Promise<number[]> {
  const driver =
    driverOverride === undefined
      ? configuredCodexBuilderDriver()
      : driverOverride;
  if (driver) {
    await setCapabilityAvailable({
      key: "CODEX_BUILDER_PROVIDER_ACCESS",
      provider: driver.provider,
      verificationMethod: driverOverride
        ? "TEST_DRIVER_INJECTION"
        : "CODEX_SDK_CREDENTIAL_CONFIGURED",
      metadata: { billing_mode: driver.billing.mode },
    });
    await resolveOpenActionsForCapability({
      capabilityKey: "CODEX_BUILDER_PROVIDER_ACCESS",
      resolutionData: {
        detected_automatically: true,
        provider: driver.provider,
      },
    });
    const resumable = await db
      .select()
      .from(builderGatewayRunsTable)
      .where(
        and(
          eq(builderGatewayRunsTable.status, "BLOCKED"),
          eq(
            builderGatewayRunsTable.resultSummary,
            "CODEX_BUILDER_PROVIDER_ACCESS_REQUIRED",
          ),
        ),
      );
    for (const blocked of resumable) {
      await db
        .update(builderGatewayRunsTable)
        .set({
          status: "QUEUED",
          terminalOutcome: null,
          resultSummary:
            "Provider capability detected; resuming from durable repository state.",
          finishedAt: null,
          updatedAt: new Date(),
        })
        .where(eq(builderGatewayRunsTable.id, blocked.id));
      await db
        .update(buildJobsTable)
        .set({ status: "BUILDING", blockedReason: null, updatedAt: new Date() })
        .where(eq(buildJobsTable.id, blocked.buildJobId));
      await db
        .update(builderWorkspacesTable)
        .set({
          status: "RUNNING",
          lastErrorCode: null,
          lastErrorMessage: null,
          statusSummary:
            "Provider capability detected; Gateway execution is resuming.",
          updatedAt: new Date(),
        })
        .where(eq(builderWorkspacesTable.gatewayRunId, blocked.id));
    }
  }
  await db
    .update(builderGatewayRunsTable)
    .set({
      status: "QUEUED",
      leaseOwner: null,
      leaseExpiresAt: null,
      resultSummary:
        "Recovered an expired local execution lease; retrying reproducibly from repository state.",
      updatedAt: new Date(),
    })
    .where(
      and(
        inArray(builderGatewayRunsTable.status, ["PREPARING", "RUNNING"]),
        lt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
      ),
    );
  const queued = await db
    .select({ id: builderGatewayRunsTable.id })
    .from(builderGatewayRunsTable)
    .where(eq(builderGatewayRunsTable.status, "QUEUED"))
    .orderBy(asc(builderGatewayRunsTable.id))
    .limit(2);
  for (const run of queued) await executeBuilderGatewayRun(run.id, driver);
  return queued.map((run) => run.id);
}
