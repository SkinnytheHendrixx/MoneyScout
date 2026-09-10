import { execFile } from "node:child_process";
import { mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { and, asc, eq, gt, inArray, isNull, lt, sql } from "drizzle-orm";
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
  type GatewayExecutionPhase,
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
// Process-local cancellation bookkeeping, scoped to the exact lease
// acquisition it was registered for -- not just the logical run ID. Two
// workers (or a worker and a reconciler) can transiently coexist for the
// same run ID during recovery/lease races; keying by run ID alone would let
// a stale worker's cleanup delete or abort a newer worker's controller.
// This is local bookkeeping only: the database lease remains the
// authoritative ownership record.
type GatewayControllerEntry = {
  leaseOwner: string | null;
  controller: AbortController;
};
const activeAbortControllers = new Map<number, GatewayControllerEntry>();

function registerGatewayController(
  runId: number,
  leaseOwner: string | null,
  controller: AbortController,
): void {
  activeAbortControllers.set(runId, { leaseOwner, controller });
}

function releaseGatewayController(runId: number, leaseOwner: string | null): void {
  const entry = activeAbortControllers.get(runId);
  if (entry && entry.leaseOwner === leaseOwner) activeAbortControllers.delete(runId);
}

type GatewayStartInput = {
  buildJobId: number;
  idempotencyKey: string;
  repairDefects?: PersistedQaDefect[];
};

function branchFor(buildJobId: number, attemptNumber: number): string {
  return `money-scout/build-${buildJobId}-attempt-${attemptNumber}`;
}

/**
 * CAS guard for `builder_gateway_runs.lease_owner`. Drizzle's `eq(col,
 * null)` compiles to `col = NULL`, which SQL never evaluates true (NULL
 * comparisons are unknown), so a genuinely-unowned row (lease_owner IS
 * NULL, e.g. a never-claimed QUEUED run) must use `isNull` instead.
 */
function leaseOwnerMatch(expected: string | null) {
  return expected === null
    ? isNull(builderGatewayRunsTable.leaseOwner)
    : eq(builderGatewayRunsTable.leaseOwner, expected);
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
  // CAS guard: this call always fires from the pre-provider PREPARING
  // window, before the RUNNING transition. If this worker's lease has
  // already been reclaimed (recovery, or a fresh claim), it must not
  // mutate the newer owner's row.
  expectedLeaseOwner: string;
}): Promise<void> {
  const [updated] = await db
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
    .where(
      and(
        eq(builderGatewayRunsTable.id, input.run.id),
        eq(builderGatewayRunsTable.leaseOwner, input.expectedLeaseOwner),
        eq(builderGatewayRunsTable.status, "PREPARING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (!updated) {
    logger.warn(
      { gatewayRunId: input.run.id },
      "Builder Gateway pre-provider capability block skipped: lease ownership changed since observation",
    );
    return;
  }
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
}

async function blockRunForMissingMoneySafety(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  job: typeof buildJobsTable.$inferSelect;
  code: string;
  provider: string;
  // CAS guard: see blockRunForCapability.
  expectedLeaseOwner: string;
}): Promise<void> {
  const now = new Date();
  const [updated] = await db
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
    .where(
      and(
        eq(builderGatewayRunsTable.id, input.run.id),
        eq(builderGatewayRunsTable.leaseOwner, input.expectedLeaseOwner),
        eq(builderGatewayRunsTable.status, "PREPARING"),
        eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
      ),
    )
    .returning();
  if (!updated) {
    logger.warn(
      { gatewayRunId: input.run.id },
      "Builder Gateway pre-provider money-safety block skipped: lease ownership changed since observation",
    );
    return;
  }
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

/**
 * Case B: the provider boundary may have been crossed (durable
 * `executionPhase` is no longer PRE_PROVIDER) but no authoritative provider
 * execution identity/outcome is available. An expired local lease proves
 * only that Money Scout lost local worker ownership; it does not prove the
 * external provider did nothing. This must never be resolved by requeuing.
 */
async function blockRunForUncertainProviderOutcome(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  // CAS guard: only apply this verdict if the row still reflects the exact
  // lease ownership it was observed under. If some other actor (a fresh
  // worker claim, another recovery pass, or the original worker completing
  // first) already changed the row, this write must no-op rather than
  // clobber whatever that actor recorded.
  expectedLeaseOwner: string | null;
  // Set only when called from lease recovery, whose "expired" observation
  // may be stale by the time this write executes: the still-alive worker
  // could have renewed its lease (see the repository-finalization CAS in
  // executeBuilderGatewayRun) in the gap between recovery's read and this
  // write. Requiring the lease to still be expired *at write time* closes
  // that race -- a renewal that lands first makes this write a no-op.
  requireLeaseExpired?: boolean;
  // Set only when the provider's cost/usage were already durably recorded
  // *before* the uncertain boundary was crossed -- the repository-
  // finalization case, where the provider result is fully known and only
  // the repository mutation outcome (did the push land?) is uncertain.
  // Resetting a known real cost back to null here would under-count spend
  // actually incurred against the Bet's budget; preserving it is more
  // correct than pretending a known cost is unknown.
  preserveKnownCost?: boolean;
}): Promise<void> {
  const now = new Date();
  const reason = input.preserveKnownCost
    ? "A local Builder Gateway worker lease expired or was lost after the durable Asset repository mutation boundary was crossed (a git push may already have been dispatched). The known provider cost is preserved, but whether the push landed cannot be proven from the durable remote repository state, and no automatic push retry is safe."
    : "A local Builder Gateway worker lease expired or was lost after the external provider boundary was crossed. The external outcome and cost cannot be proven zero, and no authoritative provider-side recovery is available for this execution.";
  const summary = input.preserveKnownCost
    ? "REPOSITORY_MUTATION_OUTCOME_UNCERTAIN"
    : "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN";
  const [updated] = await db
    .update(builderGatewayRunsTable)
    .set({
      status: "BLOCKED",
      terminalOutcome: "RESOURCE_BLOCKED",
      // executionPhase is deliberately left untouched here: it stays
      // PROVIDER_DISPATCH_ATTEMPTED/PROVIDER_RUN_CONFIRMED/
      // REPOSITORY_FINALIZATION_ATTEMPTED rather than being reset to
      // PRE_PROVIDER or advanced to TERMINAL_RECONCILED, because the
      // outcome was never actually reconciled.
      ...(input.preserveKnownCost
        ? {}
        : {
            actualExternalCashCostCents: null,
            costProvenance: "PROVIDER_EXECUTION_OUTCOME_UNCERTAIN",
          }),
      resultSummary: summary,
      challenge: {
        kind: summary,
        reason,
        retryable_by_automation: false,
        human_attestation_cannot_satisfy: true,
      },
      isolatedWorkspacePath: null,
      finishedAt: now,
      leaseOwner: null,
      leaseExpiresAt: null,
      updatedAt: now,
    })
    .where(
      and(
        eq(builderGatewayRunsTable.id, input.run.id),
        leaseOwnerMatch(input.expectedLeaseOwner),
        inArray(builderGatewayRunsTable.status, [
          "PREPARING",
          "RUNNING",
          "CANCELLING",
        ]),
        ...(input.requireLeaseExpired
          ? [lt(builderGatewayRunsTable.leaseExpiresAt, new Date())]
          : []),
      ),
    )
    .returning();
  if (!updated) {
    logger.warn(
      { gatewayRunId: input.run.id },
      "Builder Gateway uncertain-outcome write skipped: run ownership/state changed since observation",
    );
    return;
  }
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, input.run.buildJobId));
  if (!job) return;
  await db
    .update(buildJobsTable)
    .set({
      status: "BLOCKED",
      blockedReason: summary,
      updatedAt: now,
    })
    .where(eq(buildJobsTable.id, job.id));
  if (job.factoryRunId) {
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: "BUILDER_BLOCKED",
        blockerCode: summary,
        nextAction: input.preserveKnownCost
          ? "A prior Builder Gateway run's durable Asset repository mutation outcome is uncertain after local worker/process loss (a git push may already have been dispatched). A human must verify the exact remote repository state before any further automated action; do not redispatch or push again."
          : "A prior Builder Gateway run's external provider outcome is uncertain after local worker/process loss. A human must verify the exact provider-side execution before any further automated action; do not redispatch this logical run.",
        updatedAt: now,
      })
      .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
  }
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "VERIFY_UNCERTAIN_BUILDER_PROVIDER_EXECUTION",
    title: input.preserveKnownCost
      ? "Verify an uncertain Builder Gateway repository mutation"
      : "Verify an uncertain Builder Gateway provider execution",
    whyNeeded: input.preserveKnownCost
      ? "Money Scout lost authoritative ownership of a Builder Gateway run after it may have crossed the durable Asset repository mutation boundary (git push). Automation cannot prove whether the push landed, and must never push a replacement result while that is unresolved."
      : "Money Scout lost local ownership of a Builder Gateway run after it may have crossed the external provider boundary. Automation cannot prove whether the provider executed, and therefore cannot prove the cost or entitlement consumption is zero.",
    instructions: input.preserveKnownCost
      ? "Check the durable Asset repository's exact branch state (and the coding provider's dashboard if needed) for this exact run before taking any action. Do not push or resume this run automatically."
      : "Check the coding provider's own dashboard/billing/run history for this exact run before taking any action. Do not resume this run automatically.",
    blockedStage: `BUILDER_GATEWAY:${input.run.id}`,
    requiredCapabilityKey: "BUILDER_GATEWAY_UNCERTAIN_EXECUTION_REVIEW",
    provider: input.run.provider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: {
      builder_gateway_run_id: input.run.id,
      build_job_id: input.run.buildJobId,
      provider_run_id: input.run.providerRunId,
      provider_thread_id: input.run.providerThreadId,
    },
    inherentlyHumanAuthority: true,
  });
}

/**
 * Case C: a durable provider execution identity is known. If the driver
 * exposes authoritative reconciliation for that exact execution, use it
 * instead of ever dispatching a replacement run. A reconciled
 * IMPLEMENTATION_READY claim is only trusted once the exact branch is
 * verified as actually pushed to the durable Asset repository; provider
 * self-report alone can never complete a Build.
 */
async function reconcileKnownProviderRun(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  repository: typeof assetRepositoriesTable.$inferSelect;
  driver: BuilderProviderDriver;
  // CAS guard: see blockRunForUncertainProviderOutcome. A stale reconciler
  // must never overwrite a row a newer owner has already moved on.
  expectedLeaseOwner: string | null;
  // See blockRunForUncertainProviderOutcome. Set only when called from
  // lease recovery.
  requireLeaseExpired?: boolean;
}): Promise<boolean> {
  if (!input.driver.reconcile || !input.run.providerRunId) return false;
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, input.run.buildJobId));
  if (!job) return false;
  const controller = new AbortController();
  registerGatewayController(input.run.id, input.expectedLeaseOwner, controller);
  try {
    const result = await input.driver.reconcile({
      providerRunId: input.run.providerRunId,
      providerThreadId: input.run.providerThreadId,
      signal: controller.signal,
    });
    let resultCommitSha: string | null = null;
    if (result.terminalOutcome === "IMPLEMENTATION_READY") {
      if (!input.repository.repositoryUrl) return false;
      const token = await repositoryCredentialAvailable(
        input.repository.repositoryUrl,
      );
      if (!token) return false;
      try {
        const remote = await git(
          tmpdir(),
          ["ls-remote", input.repository.repositoryUrl, `refs/heads/${input.run.branchName}`],
          gatewayGitEnvironment(token),
        );
        resultCommitSha = remote.stdout.trim().split(/\s+/)[0] || null;
      } catch {
        resultCommitSha = null;
      }
      if (!resultCommitSha || !/^[0-9a-f]{40,64}$/i.test(resultCommitSha))
        return false;
    }
    const now = new Date();
    const gatewayStatus =
      result.terminalOutcome === "IMPLEMENTATION_READY"
        ? "SUCCEEDED"
        : gatewayStatusForOutcome(result.terminalOutcome);
    const [updated] = await db
      .update(builderGatewayRunsTable)
      .set({
        status: gatewayStatus,
        terminalOutcome: result.terminalOutcome,
        executionPhase: "TERMINAL_RECONCILED",
        providerRunId: result.providerRunId,
        resultCommitSha: resultCommitSha ?? undefined,
        usage: result.usage,
        actualExternalCashCostCents: result.actualExternalCashCostCents,
        costProvenance: result.costProvenance,
        entitlementConsumption: result.entitlementConsumption,
        resultSummary: `Reconciled after worker/process loss: ${result.summary}`.slice(
          0,
          4_000,
        ),
        challenge:
          result.terminalOutcome === "IMPLEMENTATION_READY"
            ? null
            : result.challenge,
        isolatedWorkspacePath: null,
        finishedAt: now,
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, input.run.id),
          leaseOwnerMatch(input.expectedLeaseOwner),
          inArray(builderGatewayRunsTable.status, [
            "PREPARING",
            "RUNNING",
            "CANCELLING",
          ]),
          ...(input.requireLeaseExpired
            ? [lt(builderGatewayRunsTable.leaseExpiresAt, new Date())]
            : []),
        ),
      )
      .returning();
    if (!updated) {
      logger.warn(
        { gatewayRunId: input.run.id },
        "Builder Gateway reconciliation write skipped: run ownership/state changed since observation",
      );
      return false;
    }
    if (resultCommitSha)
      await db
        .update(buildJobsTable)
        .set({ resultCommitSha, updatedAt: now })
        .where(eq(buildJobsTable.id, job.id));
    else if (job.factoryRunId) {
      const factoryStatus = factoryStatusForOutcome(result.terminalOutcome);
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: factoryStatus,
          blockerCode: result.terminalOutcome,
          nextAction:
            "Reconciled the exact prior provider execution after worker/process loss; no replacement run was dispatched.",
          finishedAt: factoryStatus === "BUILDER_BLOCKED" ? null : now,
          updatedAt: now,
        })
        .where(eq(assetFactoryRunsTable.id, job.factoryRunId));
    }
    await reconcileObservedCashCost(
      job,
      input.run.id,
      result.actualExternalCashCostCents,
    );
    return true;
  } catch (error) {
    logger.warn(
      { err: error, gatewayRunId: input.run.id },
      "Builder Gateway reconciliation attempt failed; leaving execution durably uncertain",
    );
    return false;
  } finally {
    releaseGatewayController(input.run.id, input.expectedLeaseOwner);
  }
}

/**
 * Case D: the durable execution phase is REPOSITORY_FINALIZATION_ATTEMPTED,
 * meaning the provider's terminal result is already known and durably
 * recorded on this row (see the finalization-claim write in
 * executeBuilderGatewayRun), and a `git push` to the durable Asset
 * repository may have been dispatched before this worker's lease was lost.
 * A local timeout or lease expiry proves nothing about whether that push
 * landed: Git gives an exact, checkable answer, so reconciliation here is
 * deterministic rather than provider-driver-dependent (unlike Case C, this
 * never needs `driver.reconcile()`).
 *
 * Exactly one of three outcomes is ever recorded:
 *  - the remote branch already points at the exact intended
 *    `resultCommitSha`: the mutation succeeded; reconcile success without
 *    ever pushing again.
 *  - anything else (branch missing, branch points elsewhere, or the remote
 *    could not be queried at all): the outcome cannot be proven. This is
 *    deliberately conservative -- a branch that does not yet show the
 *    intended commit does not prove a dispatched push failed or is not
 *    still in flight, so it is never treated as safe to requeue or
 *    re-push. It becomes a durably blocked/uncertain run requiring human
 *    verification, exactly like Case B.
 */
async function reconcileRepositoryFinalization(input: {
  run: typeof builderGatewayRunsTable.$inferSelect;
  // See blockRunForUncertainProviderOutcome. Set only when called from lease
  // recovery, whose "expired" observation may be stale by the time this
  // write executes.
  requireLeaseExpired?: boolean;
}): Promise<void> {
  const { run } = input;
  if (!run.resultCommitSha) {
    // The finalization-claim write always records resultCommitSha before
    // the push runs, so this should be unreachable; it remains as defense
    // in depth against ever treating an unidentified mutation as safe.
    await blockRunForUncertainProviderOutcome({
      run,
      expectedLeaseOwner: run.leaseOwner,
      requireLeaseExpired: input.requireLeaseExpired,
      preserveKnownCost: true,
    });
    return;
  }
  const [repository] = await db
    .select()
    .from(assetRepositoriesTable)
    .where(eq(assetRepositoriesTable.id, run.assetRepositoryId));
  let remoteSha: string | null = null;
  let remoteCheckSucceeded = false;
  if (repository?.repositoryUrl) {
    try {
      const token = await repositoryCredentialAvailable(
        repository.repositoryUrl,
      );
      if (token) {
        const remote = await git(
          tmpdir(),
          [
            "ls-remote",
            repository.repositoryUrl,
            `refs/heads/${run.branchName}`,
          ],
          gatewayGitEnvironment(token),
        );
        remoteSha = remote.stdout.trim().split(/\s+/)[0] || null;
        remoteCheckSucceeded = true;
      }
    } catch {
      remoteCheckSucceeded = false;
    }
  }
  if (remoteCheckSucceeded && remoteSha === run.resultCommitSha) {
    const now = new Date();
    const [updated] = await db
      .update(builderGatewayRunsTable)
      .set({
        status: "SUCCEEDED",
        terminalOutcome: "IMPLEMENTATION_READY",
        executionPhase: "TERMINAL_RECONCILED",
        challenge: null,
        resultSummary:
          `Reconciled after worker/process loss: the durable Asset repository already contains the exact intended commit. ${run.resultSummary ?? ""}`.slice(
            0,
            4_000,
          ),
        isolatedWorkspacePath: null,
        finishedAt: now,
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          leaseOwnerMatch(run.leaseOwner),
          inArray(builderGatewayRunsTable.status, ["RUNNING", "CANCELLING"]),
          eq(
            builderGatewayRunsTable.executionPhase,
            "REPOSITORY_FINALIZATION_ATTEMPTED",
          ),
          ...(input.requireLeaseExpired
            ? [lt(builderGatewayRunsTable.leaseExpiresAt, new Date())]
            : []),
        ),
      )
      .returning();
    if (!updated) {
      logger.warn(
        { gatewayRunId: run.id },
        "Builder Gateway repository-finalization reconciliation skipped: run ownership/state changed since observation",
      );
      return;
    }
    const [job] = await db
      .select()
      .from(buildJobsTable)
      .where(eq(buildJobsTable.id, run.buildJobId));
    if (!job) return;
    await db
      .update(buildJobsTable)
      .set({ resultCommitSha: run.resultCommitSha, updatedAt: now })
      .where(eq(buildJobsTable.id, job.id));
    // The full provider result (including cost) was already made durable by
    // the finalization-claim write before the push ran; it is read back
    // from the row here rather than re-derived, since no in-memory result
    // object exists in a recovery pass.
    await reconcileObservedCashCost(
      job,
      run.id,
      run.actualExternalCashCostCents,
    );
    return;
  }
  // Remote branch missing, pointing elsewhere, or unqueryable: none of
  // these prove the dispatched push definitely failed or is not still in
  // flight. Remain durably uncertain/blocked -- never requeue, never push
  // again, and never assume failure.
  await blockRunForUncertainProviderOutcome({
    run,
    expectedLeaseOwner: run.leaseOwner,
    requireLeaseExpired: input.requireLeaseExpired,
    preserveKnownCost: true,
  });
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
  // A unique lease identity per acquisition attempt, not just per
  // (process, run). Without the nonce, a stale worker retrying the same
  // run under the same pid would compute the exact same string as a fresh
  // claim, making lease-owner CAS checks meaningless.
  const leaseOwner = `gateway:${process.pid}:${runId}:${Date.now()}:${Math.random().toString(36).slice(2, 10)}`;
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
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          eq(builderGatewayRunsTable.status, "PREPARING"),
          eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
        ),
      );
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
      expectedLeaseOwner: leaseOwner,
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
      expectedLeaseOwner: leaseOwner,
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
      expectedLeaseOwner: leaseOwner,
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
      expectedLeaseOwner: leaseOwner,
    });
    return;
  }
  let worktree: Awaited<ReturnType<typeof prepareWorktree>> | null = null;
  let observedProviderResult: Awaited<
    ReturnType<BuilderProviderDriver["run"]>
  > | null = null;
  // Set only once this worker's own CAS write below actually crosses the
  // provider boundary. Distinguishes "driver.run() threw with no
  // authoritative result after we dispatched" (durably uncertain) from
  // "something failed locally before we ever attempted dispatch" (safely
  // terminal).
  let providerBoundaryCrossed = false;
  // Set only once the repository-finalization CAS below actually persists
  // REPOSITORY_FINALIZATION_ATTEMPTED (durably, before `git push` runs). An
  // exception past this point -- including one thrown by `git push` itself
  // (network drop, timeout, a rejected response after GitHub already
  // accepted the ref update) -- must never be concluded as a clean local
  // failure: that could mark the run FAILED and let a downstream repair
  // flow dispatch a fresh attempt against a repository that may already
  // carry this exact commit.
  let repositoryMutationBoundaryCrossed = false;
  const controller = new AbortController();
  registerGatewayController(run.id, leaseOwner, controller);
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
    // Once a worker loses its execution lease, it may not mutate
    // authoritative Gateway execution state -- worktree preparation above
    // involves real subprocess/filesystem I/O and is exactly where a lease
    // can expire out from under a still-running worker. This transition to
    // RUNNING is therefore itself CAS-guarded: it only applies if this
    // worker still provably holds the exact lease it acquired at claim
    // time. If lost, stop immediately without running the final provider
    // gate, without calling the provider, and without any further row
    // mutation.
    const runningClaim = await db
      .update(builderGatewayRunsTable)
      .set({
        status: "RUNNING",
        isolatedWorkspacePath: worktree.repositoryPath,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          eq(builderGatewayRunsTable.status, "PREPARING"),
          eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
          gt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
        ),
      )
      .returning();
    if (runningClaim.length !== 1) {
      logger.warn(
        { gatewayRunId: run.id },
        "Builder Gateway lost lease ownership during worktree preparation; stopping before the RUNNING transition",
      );
      return;
    }
    const finalGate = await revalidateImmediatelyBeforeProviderSideEffect({
      jobId: job.id,
      driver,
    });
    if (!finalGate.allowed) {
      const finalGateCancel = await db
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
        .where(
          and(
            eq(builderGatewayRunsTable.id, run.id),
            eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
            eq(builderGatewayRunsTable.status, "RUNNING"),
            eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
          ),
        )
        .returning();
      if (!finalGateCancel.length)
        logger.warn(
          { gatewayRunId: run.id },
          "Builder Gateway lost lease ownership before the final provider gate; skipped a stale pre-provider cancellation",
        );
      return;
    }
    // Durably record that the external provider boundary is about to be
    // crossed before making the call, and only if this worker still
    // provably holds the exact valid execution lease it acquired. This CAS
    // is the final authority check: the worker's in-memory belief that it
    // owns the run is not sufficient, because its lease may have already
    // expired and been reclaimed by lease recovery (which would otherwise
    // have requeued/reassigned this run believing the provider boundary
    // was never crossed). A crash at any point from here onward, including
    // mid-flight inside driver.run(), must never be recoverable by blind
    // requeue: the local process cannot prove the provider did nothing.
    const dispatchClaim = await db
      .update(builderGatewayRunsTable)
      .set({
        executionPhase: "PROVIDER_DISPATCH_ATTEMPTED",
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          eq(builderGatewayRunsTable.status, "RUNNING"),
          eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
          gt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
        ),
      )
      .returning();
    if (dispatchClaim.length !== 1) {
      // Lost lease ownership before crossing the provider boundary. Do not
      // call the provider, do not claim any provider execution occurred,
      // and do not touch this row further: some other durable owner
      // (lease recovery, or a fresh claim) is now solely responsible for
      // its fate.
      logger.warn(
        { gatewayRunId: run.id },
        "Builder Gateway lost lease ownership before the provider boundary; stopping without dispatch",
      );
      return;
    }
    providerBoundaryCrossed = true;
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
      const nonReadyWrite = await db
        .update(builderGatewayRunsTable)
        .set({
          status: gatewayStatus,
          terminalOutcome: result.terminalOutcome,
          executionPhase: "TERMINAL_RECONCILED",
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
        .where(
          and(
            eq(builderGatewayRunsTable.id, run.id),
            eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          ),
        )
        .returning();
      if (!nonReadyWrite.length) {
        // Downstream effects derived from a worker's result may occur only
        // after that worker has successfully committed authoritative
        // ownership of that result. Ownership was lost between the
        // dispatch CAS and this write; do not reconcile cost or mutate the
        // Factory Run from a result this worker is no longer authoritative
        // for. The real provider result (including any real cost) is
        // logged but not attached to current economic state; it awaits
        // future authoritative reconciliation of the row's actual owner.
        logger.warn(
          {
            gatewayRunId: run.id,
            terminalOutcome: result.terminalOutcome,
            actualExternalCashCostCents: result.actualExternalCashCostCents,
          },
          "Builder Gateway lost lease ownership before recording a non-ready provider result; skipping cost reconciliation and Factory Run mutation",
        );
        return;
      }
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
    // Once a worker loses its execution lease, it may not mutate the
    // durable Asset repository either -- git push is the first irreversible
    // external mutation past this point. A provider call can legitimately
    // run long enough to outlive the original lease TTL with zero
    // contention, so a plain "is my lease still fresh?" read is not
    // sufficient (another worker could race between that read and the
    // push). Instead, atomically re-claim exclusive ownership here: the CAS
    // requires this worker's exact leaseOwner and status='RUNNING'.
    //
    // Critically, this write also durably persists the REPOSITORY_
    // FINALIZATION_ATTEMPTED phase and the full provider result (resultCommitSha,
    // usage, cost, provenance, entitlement consumption, summary) *before* the
    // push runs. A fixed lease-renewal window is not a correctness
    // mechanism -- git push itself can stall arbitrarily long (network
    // stalls, GitHub outages, process death) well past any renewed TTL.
    // Once this phase is durably recorded, lease expiry alone must never
    // let recovery conclude the repository mutation did not happen, requeue
    // this run, or push a replacement result: recovery instead
    // authoritatively reconciles the exact remote branch SHA against the
    // resultCommitSha recorded right here (see
    // reconcileRepositoryFinalization below). Because the full result is
    // already durable at this point, recovery never needs the in-memory
    // `result` object to reconcile cost/usage/outcome.
    const finalizationClaim = await db
      .update(builderGatewayRunsTable)
      .set({
        executionPhase: "REPOSITORY_FINALIZATION_ATTEMPTED",
        leaseExpiresAt: new Date(Date.now() + 5 * 60_000),
        providerRunId: result.providerRunId,
        baseCommitSha: attemptBaseCommitSha,
        resultCommitSha,
        usage: result.usage,
        actualExternalCashCostCents: result.actualExternalCashCostCents,
        costProvenance: result.costProvenance,
        entitlementConsumption: result.entitlementConsumption,
        resultSummary: result.summary,
        updatedAt: new Date(),
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          eq(builderGatewayRunsTable.status, "RUNNING"),
          eq(builderGatewayRunsTable.executionPhase, "PROVIDER_DISPATCH_ATTEMPTED"),
        ),
      )
      .returning();
    if (finalizationClaim.length !== 1) {
      logger.warn(
        { gatewayRunId: run.id },
        "Builder Gateway lost lease ownership before repository finalization; refusing to push to the durable Asset repository",
      );
      return;
    }
    // REPOSITORY_FINALIZATION_ATTEMPTED is now durable. From this point on,
    // any exception (including from the push call itself) must be
    // reconciled against the durable repository state, never concluded as
    // a clean local failure.
    repositoryMutationBoundaryCrossed = true;
    await git(
      worktree.repositoryPath,
      ["push", "origin", `HEAD:refs/heads/${run.branchName}`],
      worktree.gitEnv,
    );
    const now = new Date();
    // The push has landed. This write only flips terminal status/phase and
    // clears the lease -- all result data was already made durable by the
    // finalization-claim write above, so a crash between the push
    // succeeding and this write reaching the database loses nothing:
    // recovery's ls-remote reconciliation (reconcileRepositoryFinalization)
    // will see the exact same resultCommitSha already on the row and the
    // exact same SHA on the remote branch, and reconcile success itself.
    // The CAS requires executionPhase still be exactly
    // REPOSITORY_FINALIZATION_ATTEMPTED: if recovery already reconciled (or
    // blocked) this run while the push was in flight, this write must be a
    // no-op rather than clobber whatever recovery already recorded as the
    // authoritative outcome.
    const successWrite = await db
      .update(builderGatewayRunsTable)
      .set({
        status: "SUCCEEDED",
        terminalOutcome: "IMPLEMENTATION_READY",
        executionPhase: "TERMINAL_RECONCILED",
        challenge: null,
        isolatedWorkspacePath: null,
        finishedAt: now,
        leaseOwner: null,
        leaseExpiresAt: null,
        updatedAt: now,
      })
      .where(
        and(
          eq(builderGatewayRunsTable.id, run.id),
          eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          eq(builderGatewayRunsTable.status, "RUNNING"),
          eq(
            builderGatewayRunsTable.executionPhase,
            "REPOSITORY_FINALIZATION_ATTEMPTED",
          ),
        ),
      )
      .returning();
    if (!successWrite.length) {
      // A stale finalizer (its own push landed only after recovery already
      // reconciled or blocked this run while the lease was expired) must
      // never overwrite a newer authoritative state. Ownership derived
      // downstream (Build Job, cost reconciliation) may occur only after
      // this exact write wins its own CAS, so neither happens below when it
      // doesn't. The commit was genuinely pushed; if recovery has not
      // already independently reconciled it as such, its own next pass will
      // observe the exact same resultCommitSha durably recorded on this row
      // (written above, before the push) match the remote branch and
      // reconcile it -- this worker does not need to.
      logger.warn(
        { gatewayRunId: run.id, resultCommitSha },
        "Builder Gateway lost lease ownership before recording a successful result; the pushed commit is not recorded against this row by this worker",
      );
      return;
    }
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
    if (repositoryMutationBoundaryCrossed) {
      // The durable Asset repository mutation boundary was already crossed
      // (REPOSITORY_FINALIZATION_ATTEMPTED is durably recorded) when this
      // exception fired -- most likely `git push` itself threw (network
      // drop, timeout, a rejected response after GitHub may have already
      // accepted the ref update). This can never be concluded as a clean
      // local failure: doing so would let a downstream repair flow
      // dispatch a fresh attempt against a repository that may already
      // carry this exact commit. Re-read the row fresh (this worker's own
      // finalization-claim write, not the stale pre-loop `run`, has the
      // durable resultCommitSha needed to reconcile) and deterministically
      // reconcile against the remote branch, exactly as lease-expiry
      // recovery would. This runs in-process with the lease still
      // potentially valid, so no lease-expiry requirement is imposed.
      logger.warn(
        { err: error, gatewayRunId: run.id, cancelled },
        "Builder Gateway repository mutation threw after crossing the finalization boundary; reconciling against the durable remote branch instead of concluding failure",
      );
      const [freshRun] = await db
        .select()
        .from(builderGatewayRunsTable)
        .where(eq(builderGatewayRunsTable.id, run.id));
      if (freshRun)
        await reconcileRepositoryFinalization({ run: freshRun });
    } else if (providerBoundaryCrossed && !observedProviderResult) {
      // The provider boundary was crossed (this worker's own CAS proved
      // it), but driver.run() threw before returning any authoritative
      // terminal result. An exception here does NOT prove the provider
      // failed, stopped, declined to charge, declined to consume
      // entitlement, or reached any terminal state at all -- it only
      // proves the local call failed. Whether the abort signal fired is
      // irrelevant: cancellation intent is not proof that the provider
      // actually stopped. This must remain durably uncertain rather than
      // being marked TERMINAL_RECONCILED.
      logger.warn(
        { err: error, gatewayRunId: run.id, cancelled },
        "Builder Gateway provider call threw after crossing the provider boundary with no authoritative result; leaving execution durably uncertain",
      );
      await blockRunForUncertainProviderOutcome({
        run,
        expectedLeaseOwner: leaseOwner,
      });
    } else {
      const terminalWrite = await db
        .update(builderGatewayRunsTable)
        .set({
          status: cancelled ? "CANCELLED" : "FAILED",
          terminalOutcome: cancelled ? "CANCELLED" : "PROVIDER_FAILURE",
          executionPhase: "TERMINAL_RECONCILED",
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
        .where(
          and(
            eq(builderGatewayRunsTable.id, run.id),
            eq(builderGatewayRunsTable.leaseOwner, leaseOwner),
          ),
        )
        .returning();
      if (!terminalWrite.length) {
        // Ownership was lost before this local terminal result could be
        // durably recorded. Downstream effects derived from a worker's
        // result may occur only after that worker has successfully
        // committed authoritative ownership of that result: do not
        // reconcile any observed cost from a write this worker's CAS did
        // not win.
        logger.warn(
          {
            err: error,
            gatewayRunId: run.id,
            actualExternalCashCostCents:
              observedProviderResult?.actualExternalCashCostCents ?? null,
          },
          "Builder Gateway lost lease ownership before recording a local terminal result; skipping cost reconciliation",
        );
      } else {
        logger.warn(
          { err: error, gatewayRunId: run.id },
          "Builder Gateway run stopped safely",
        );
        await reconcileObservedCashCost(
          job,
          run.id,
          observedProviderResult?.actualExternalCashCostCents ?? null,
        );
      }
    }
  } finally {
    releaseGatewayController(run.id, leaseOwner);
    if (worktree) await rm(worktree.root, { recursive: true, force: true });
  }
}

export async function cancelBuilderGatewayRun(runId: number, reason: string) {
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
  // Cancellation must target the exact current acquisition, not an
  // obsolete one: only abort the locally-registered controller if it still
  // belongs to the lease owner this row was just observed under. A
  // controller registered under a different (stale or not-yet-overwritten)
  // leaseOwner is never aborted here.
  const controllerEntry = activeAbortControllers.get(runId);
  const hasCurrentController =
    controllerEntry !== undefined &&
    controllerEntry.leaseOwner === updated.leaseOwner;
  if (hasCurrentController) controllerEntry.controller.abort(reason);
  if (!hasCurrentController) {
    // The local controller for this exact acquisition is gone: this run
    // may belong to a different worker/process, or that worker crashed.
    // Cancellation intent alone is never proof that cancellation succeeded
    // or that no provider side effect occurred.
    if (updated.executionPhase === "PRE_PROVIDER") {
      const [cancelled] = await db
        .update(builderGatewayRunsTable)
        .set({
          status: "CANCELLED",
          terminalOutcome: "CANCELLED",
          executionPhase: "TERMINAL_RECONCILED",
          actualExternalCashCostCents: null,
          costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
          finishedAt: new Date(),
          leaseOwner: null,
          leaseExpiresAt: null,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(builderGatewayRunsTable.id, runId),
            leaseOwnerMatch(updated.leaseOwner),
          ),
        )
        .returning();
      return cancelled ?? updated;
    }
    if (updated.executionPhase === "REPOSITORY_FINALIZATION_ATTEMPTED") {
      // The durable Asset repository mutation boundary may already have
      // been crossed with no local controller left to confirm or deny it,
      // and a dispatched `git push` cannot be aborted after the fact.
      // Cancellation intent is not proof of anything here: deterministically
      // reconcile against the remote branch instead of blindly blocking.
      await reconcileRepositoryFinalization({ run: updated });
      return (
        (
          await db
            .select()
            .from(builderGatewayRunsTable)
            .where(eq(builderGatewayRunsTable.id, runId))
        )[0] ?? updated
      );
    }
    // The provider boundary may already have been crossed with no local
    // controller left to confirm or deny it. Do not claim
    // BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT; transition durably to an honest
    // uncertain/blocked state instead.
    await blockRunForUncertainProviderOutcome({
      run: updated,
      expectedLeaseOwner: updated.leaseOwner,
    });
    return (
      (
        await db
          .select()
          .from(builderGatewayRunsTable)
          .where(eq(builderGatewayRunsTable.id, runId))
      )[0] ?? updated
    );
  }
  return updated;
}

/**
 * Phase-aware recovery for expired local worker leases. An expired lease
 * proves only that Money Scout lost local worker ownership; it never
 * proves the external provider did nothing. Recovery must therefore branch
 * on the durable execution phase rather than blindly requeuing every
 * expired PREPARING/RUNNING/CANCELLING run.
 */
async function recoverExpiredGatewayLeases(
  driver: BuilderProviderDriver | null,
): Promise<void> {
  const expired = await db
    .select()
    .from(builderGatewayRunsTable)
    .where(
      and(
        inArray(builderGatewayRunsTable.status, [
          "PREPARING",
          "RUNNING",
          "CANCELLING",
        ]),
        lt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
      ),
    );
  for (const staleRun of expired) {
    // Re-read immediately before acting: another tick or worker may already
    // have claimed or resolved this run since the query above.
    const [run] = await db
      .select()
      .from(builderGatewayRunsTable)
      .where(
        and(
          eq(builderGatewayRunsTable.id, staleRun.id),
          inArray(builderGatewayRunsTable.status, [
            "PREPARING",
            "RUNNING",
            "CANCELLING",
          ]),
          lt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
        ),
      );
    if (!run) continue;
    if (run.executionPhase === "REPOSITORY_FINALIZATION_ATTEMPTED") {
      // The durable Asset repository mutation boundary was already crossed
      // (or about to be) before this lease expired -- a `git push` may
      // still be genuinely in flight. This is checked before the
      // CANCELLING branch below because the same deterministic reconciliation
      // applies whether or not a cancellation was also requested: cancellation
      // intent proves nothing about whether the push landed. Never requeue,
      // never push again -- only ls-remote reconciliation may resolve this.
      await reconcileRepositoryFinalization({ run, requireLeaseExpired: true });
      continue;
    }
    if (run.status === "CANCELLING") {
      if (run.executionPhase === "PRE_PROVIDER") {
        // A cancellation was requested and durable state proves the
        // external provider boundary was never crossed: finalize as
        // cancelled rather than resurrecting a run the operator asked to
        // stop. CAS-guarded against the exact stale observation: if
        // anything about this row changed since we re-read it above (a
        // fresh claim, another recovery pass, a lease renewal), this write
        // must not overwrite it.
        const [cancelledStale] = await db
          .update(builderGatewayRunsTable)
          .set({
            status: "CANCELLED",
            terminalOutcome: "CANCELLED",
            executionPhase: "TERMINAL_RECONCILED",
            actualExternalCashCostCents: null,
            costProvenance: "BLOCKED_BEFORE_PROVIDER_SIDE_EFFECT",
            finishedAt: new Date(),
            leaseOwner: null,
            leaseExpiresAt: null,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(builderGatewayRunsTable.id, run.id),
              eq(builderGatewayRunsTable.status, "CANCELLING"),
              eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
              leaseOwnerMatch(run.leaseOwner),
              eq(builderGatewayRunsTable.leaseExpiresAt, run.leaseExpiresAt!),
            ),
          )
          .returning();
        if (!cancelledStale)
          logger.warn(
            { gatewayRunId: run.id },
            "Builder Gateway recovery skipped a stale-lease cancellation: run state changed since observation",
          );
        continue;
      }
      // Cancellation was requested but the provider boundary may already
      // have been crossed with no worker left to confirm or deny it.
      let reconciled = false;
      if (driver && run.providerRunId) {
        const [repository] = await db
          .select()
          .from(assetRepositoriesTable)
          .where(eq(assetRepositoriesTable.id, run.assetRepositoryId));
        if (repository)
          reconciled = await reconcileKnownProviderRun({
            run,
            repository,
            driver,
            expectedLeaseOwner: run.leaseOwner,
            requireLeaseExpired: true,
          });
      }
      if (!reconciled)
        await blockRunForUncertainProviderOutcome({
          run,
          expectedLeaseOwner: run.leaseOwner,
          requireLeaseExpired: true,
        });
      continue;
    }
    if (run.executionPhase === "PRE_PROVIDER") {
      // Case A: durable state proves the external provider boundary was
      // never crossed. Safe to requeue -- but only if the row still
      // represents the exact stale lease this pass observed. The CAS below
      // requires run ID, the expected stale status, PRE_PROVIDER, the
      // exact stale lease owner/identity, and the exact stale expiry
      // (itself a version token: a renewed or reclaimed lease would carry
      // a different owner and/or a later expiry). If a live owner renewed
      // or another recovery pass already reassigned this run, the update
      // affects zero rows and this stale observation is never made
      // authoritative.
      const [recovered] = await db
        .update(builderGatewayRunsTable)
        .set({
          status: "QUEUED",
          leaseOwner: null,
          leaseExpiresAt: null,
          resultSummary:
            "Recovered an expired local execution lease before the external provider boundary was crossed; retrying reproducibly from repository state.",
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(builderGatewayRunsTable.id, run.id),
            eq(builderGatewayRunsTable.status, run.status),
            eq(builderGatewayRunsTable.executionPhase, "PRE_PROVIDER"),
            leaseOwnerMatch(run.leaseOwner),
            eq(builderGatewayRunsTable.leaseExpiresAt, run.leaseExpiresAt!),
            lt(builderGatewayRunsTable.leaseExpiresAt, new Date()),
          ),
        )
        .returning();
      if (!recovered)
        logger.warn(
          { gatewayRunId: run.id },
          "Builder Gateway recovery skipped a stale-lease requeue: run state changed since observation",
        );
      continue;
    }
    // The provider boundary may already have been crossed. Never requeue
    // blindly. Case C: reconcile the exact known execution when the driver
    // supports it. Case B otherwise: remain durably uncertain/blocked.
    let reconciled = false;
    if (driver && run.providerRunId) {
      const [repository] = await db
        .select()
        .from(assetRepositoriesTable)
        .where(eq(assetRepositoriesTable.id, run.assetRepositoryId));
      if (repository)
        reconciled = await reconcileKnownProviderRun({
          run,
          repository,
          driver,
          expectedLeaseOwner: run.leaseOwner,
          requireLeaseExpired: true,
        });
    }
    if (!reconciled)
      await blockRunForUncertainProviderOutcome({
        run,
        expectedLeaseOwner: run.leaseOwner,
        requireLeaseExpired: true,
      });
  }
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
  await recoverExpiredGatewayLeases(driver);
  const queued = await db
    .select({ id: builderGatewayRunsTable.id })
    .from(builderGatewayRunsTable)
    .where(eq(builderGatewayRunsTable.status, "QUEUED"))
    .orderBy(asc(builderGatewayRunsTable.id))
    .limit(2);
  for (const run of queued) await executeBuilderGatewayRun(run.id, driver);
  return queued.map((run) => run.id);
}
