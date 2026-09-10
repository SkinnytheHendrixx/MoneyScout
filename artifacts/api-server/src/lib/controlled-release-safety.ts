import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  humanActionsTable,
  releaseJobsTable,
  type PersistedReleasePlan,
} from "@workspace/db";
import {
  configuredReleaseAdapter,
  type ReleaseAgentAdapter,
} from "./release-agent-adapter";
import {
  createOrReuseHumanAction,
  markHumanActionResolved,
} from "./human-gates";
import { logger } from "./logger";
import { runControlledReleaseTick } from "./controlled-release-worker";

const DEFAULT_INTERVAL_MS = 3_000;
const MIN_INTERVAL_MS = 1_000;
let timer: NodeJS.Timeout | null = null;
let tickRunning = false;

function intervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_RELEASE_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_INTERVAL_MS
    ? configured
    : DEFAULT_INTERVAL_MS;
}

const spendBlockReasons = new Set([
  "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED",
  "RELEASE_PRODUCTION_SPEND_AUTHORITY_REQUIRED",
]);

function nextStatusAfterSpendUnlock(job: typeof releaseJobsTable.$inferSelect) {
  return job.previewHealthPassed === true
    ? "WAITING_FOR_PUBLIC_AUTHORITY" as const
    : "READY_FOR_PREVIEW" as const;
}

async function resolveScopedAction(input: {
  opportunityId: number;
  actionType: string;
  blockedStage: string;
  resolutionData: Record<string, unknown>;
}) {
  const actions = await db
    .select()
    .from(humanActionsTable)
    .where(and(
      eq(humanActionsTable.opportunityId, input.opportunityId),
      eq(humanActionsTable.actionType, input.actionType),
      eq(humanActionsTable.blockedStage, input.blockedStage),
      inArray(humanActionsTable.status, ["OPEN", "VERIFYING"]),
    ));
  for (const action of actions) {
    await markHumanActionResolved({
      actionId: action.id,
      resolutionData: input.resolutionData,
    });
  }
}

export async function authorizePublicReleaseSafely(input: {
  releaseJobId: number;
  authorizedBy?: string;
}) {
  const [job] = await db
    .select()
    .from(releaseJobsTable)
    .where(eq(releaseJobsTable.id, input.releaseJobId));
  if (!job) throw new Error("RELEASE_JOB_NOT_FOUND");
  if (job.status === "COMPLETE") return job;
  if (job.previewHealthPassed !== true || job.previewVisibility !== "PRIVATE") {
    throw new Error("PUBLIC_RELEASE_NOT_ELIGIBLE: a healthy private preview is required first");
  }
  if (job.productionProviderRunId || job.productionFinishedAt) {
    throw new Error("PUBLIC_RELEASE_AUTHORITY_ALREADY_CONSUMED: production has already been attempted for this release");
  }
  if (!["PREVIEW_READY", "WAITING_FOR_PUBLIC_AUTHORITY", "BLOCKED"].includes(job.status)) {
    throw new Error(`PUBLIC_RELEASE_NOT_ELIGIBLE: release is in ${job.status}`);
  }

  const now = new Date();
  const preserveBlock = job.status === "BLOCKED";
  const [updated] = await db
    .update(releaseJobsTable)
    .set({
      publicReleaseAuthorizedAt: job.publicReleaseAuthorizedAt ?? now,
      publicReleaseAuthorizedBy: input.authorizedBy ?? "HUMAN_ATTESTATION",
      status: preserveBlock ? "BLOCKED" : "WAITING_FOR_PUBLIC_AUTHORITY",
      blockedReason: preserveBlock ? job.blockedReason : null,
      updatedAt: now,
    })
    .where(eq(releaseJobsTable.id, job.id))
    .returning();

  await resolveScopedAction({
    opportunityId: job.opportunityId,
    actionType: "AUTHORIZE_PUBLIC_RELEASE",
    blockedStage: `CONTROLLED_RELEASE_PUBLIC:${job.id}`,
    resolutionData: {
      release_job_id: job.id,
      authorized_at: now.toISOString(),
      scope: "PUBLIC_RELEASE_ONLY",
    },
  });

  return updated ?? job;
}

export async function authorizeReleaseSpendSafely(input: {
  releaseJobId: number;
  ceilingCents: number;
  authorizedBy?: string;
}) {
  if (!Number.isInteger(input.ceilingCents) || input.ceilingCents <= 0) {
    throw new Error("RELEASE_SPEND_CEILING_INVALID");
  }
  const [job] = await db
    .select()
    .from(releaseJobsTable)
    .where(eq(releaseJobsTable.id, input.releaseJobId));
  if (!job) throw new Error("RELEASE_JOB_NOT_FOUND");
  if (job.status === "COMPLETE") throw new Error("RELEASE_ALREADY_COMPLETE");
  if (input.ceilingCents < job.externalSpendUsedCents) {
    throw new Error("RELEASE_SPEND_CEILING_BELOW_ALREADY_USED");
  }

  const clearsSpendBlock = job.status === "BLOCKED" && !!job.blockedReason && spendBlockReasons.has(job.blockedReason);
  const plan = job.plan as PersistedReleasePlan;
  const updatedPlan: PersistedReleasePlan = {
    ...plan,
    economics: {
      ...plan.economics,
      externalSpendCeilingCents: input.ceilingCents,
    },
  };

  const [updated] = await db
    .update(releaseJobsTable)
    .set({
      externalSpendCeilingCents: input.ceilingCents,
      plan: updatedPlan,
      status: clearsSpendBlock ? nextStatusAfterSpendUnlock(job) : job.status,
      blockedReason: clearsSpendBlock ? null : job.blockedReason,
      lastErrorCode: clearsSpendBlock ? null : job.lastErrorCode,
      lastErrorMessage: clearsSpendBlock ? null : job.lastErrorMessage,
      updatedAt: new Date(),
    })
    .where(eq(releaseJobsTable.id, job.id))
    .returning();

  const stage = job.blockedReason === "RELEASE_PRODUCTION_SPEND_AUTHORITY_REQUIRED"
    ? "PRODUCTION"
    : job.blockedReason === "RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED"
      ? "PREVIEW"
      : null;
  if (stage) {
    await resolveScopedAction({
      opportunityId: job.opportunityId,
      actionType: "AUTHORIZE_RELEASE_SPEND",
      blockedStage: `CONTROLLED_RELEASE_SPEND:${job.id}:${stage}`,
      resolutionData: {
        release_job_id: job.id,
        ceiling_cents: input.ceilingCents,
        authorized_by: input.authorizedBy ?? "HUMAN_ATTESTATION",
      },
    });
  }

  return updated ?? job;
}

async function createProviderContinuityAction(job: typeof releaseJobsTable.$inferSelect) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "RESTORE_RELEASE_PROVIDER_ACCESS",
    title: "Restore access to the in-flight release provider",
    whyNeeded: `A ${job.status === "PRODUCTION_DEPLOYING" || job.productionProviderRunId ? "production" : "preview"} release is already in flight with ${job.releaseProvider}. Money Scout will not replay that external action through a different provider because the original outcome could be uncertain.`,
    instructions: `Restore automation-ready access to ${job.releaseProvider} so Money Scout can poll the existing provider run. Do not start a replacement deployment manually unless the preserved run has been conclusively resolved.`,
    blockedStage: `CONTROLLED_RELEASE_PROVIDER_CONTINUITY:${job.id}`,
    requiredCapabilityKey: null,
    provider: job.releaseProvider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: {
      release_job_id: job.id,
      preview_provider_run_id: job.previewProviderRunId,
      production_provider_run_id: job.productionProviderRunId,
      expected_provider: job.releaseProvider,
    },
    inherentlyHumanAuthority: true,
  });
}

export async function enforceReleaseProviderContinuity(adapter: ReleaseAgentAdapter | null): Promise<number> {
  if (!adapter) return 0;
  const candidates = await db
    .select()
    .from(releaseJobsTable)
    .where(inArray(releaseJobsTable.status, ["PREVIEW_DEPLOYING", "PRODUCTION_DEPLOYING", "BLOCKED"]));
  let blocked = 0;
  for (const job of candidates) {
    const previewInFlight = !!job.previewProviderRunId && !job.previewFinishedAt;
    const productionInFlight = !!job.productionProviderRunId && !job.productionFinishedAt;
    const genericAdapterBlock = job.status === "BLOCKED" && job.blockedReason === "DEPLOYMENT_AGENT_ACCESS_REQUIRED";
    if (!previewInFlight && !productionInFlight) continue;
    if (job.releaseProvider === "UNCONFIGURED" || job.releaseProvider === adapter.provider) continue;
    if (job.status !== "PREVIEW_DEPLOYING" && job.status !== "PRODUCTION_DEPLOYING" && !genericAdapterBlock) continue;

    await db
      .update(releaseJobsTable)
      .set({
        status: "BLOCKED",
        blockedReason: "RELEASE_PROVIDER_CONTINUITY_REQUIRED",
        lastErrorCode: "RELEASE_PROVIDER_CONTINUITY_REQUIRED",
        lastErrorMessage: `Existing provider run belongs to ${job.releaseProvider}; configured adapter ${adapter.provider} cannot safely replace it.`,
        updatedAt: new Date(),
      })
      .where(eq(releaseJobsTable.id, job.id));
    await createProviderContinuityAction(job);
    blocked += 1;
  }
  return blocked;
}

export async function surfacePreviewVisibilityViolations(): Promise<number> {
  const jobs = await db
    .select()
    .from(releaseJobsTable)
    .where(and(
      eq(releaseJobsTable.status, "BLOCKED"),
      eq(releaseJobsTable.blockedReason, "PREVIEW_VISIBILITY_SAFETY_VIOLATION"),
    ));
  for (const job of jobs) {
    await createOrReuseHumanAction({
      opportunityId: job.opportunityId,
      actionType: "UNAUTHORIZED_PUBLIC_PREVIEW",
      title: "Restrict an unintended public preview",
      whyNeeded: "The release backend made a preview publicly reachable before public-release authority existed. Money Scout stopped production, but the unintended public exposure itself requires immediate correction.",
      instructions: "Restrict or remove the unintended public preview at the hosting provider. Do not authorize production until the exposure is corrected and a private preview can be verified again.",
      blockedStage: `CONTROLLED_RELEASE_PREVIEW_VISIBILITY:${job.id}`,
      requiredCapabilityKey: null,
      provider: job.releaseProvider,
      verificationMode: "HUMAN_ATTESTATION",
      urgency: "CRITICAL",
      resumeAction: "NO_AUTOMATIC_RESUME",
      resumePayload: {
        release_job_id: job.id,
        preview_url: job.previewUrl,
        preview_provider_run_id: job.previewProviderRunId,
      },
      inherentlyHumanAuthority: true,
    });
  }
  return jobs.length;
}

export async function runControlledReleaseTickSafely(
  adapterOverride?: ReleaseAgentAdapter | null,
): Promise<{ createdReleaseJobs: number; processedReleaseJobId: number | null; providerContinuityBlocks: number; previewSafetyActions: number }> {
  const adapter = adapterOverride === undefined ? configuredReleaseAdapter() : adapterOverride;
  const providerContinuityBlocks = await enforceReleaseProviderContinuity(adapter);
  const result = await runControlledReleaseTick(adapter);
  const previewSafetyActions = await surfacePreviewVisibilityViolations();
  return { ...result, providerContinuityBlocks, previewSafetyActions };
}

export function startControlledReleaseSafetyWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runControlledReleaseTickSafely();
    } catch (error) {
      logger.error({ err: error }, "Controlled release safety worker tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void tick();
  timer = setInterval(() => void tick(), intervalMs());
  timer.unref?.();
}

export function stopControlledReleaseSafetyWorkerForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  tickRunning = false;
}
