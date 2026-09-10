import { and, asc, desc, eq, inArray, sql } from "drizzle-orm";
import {
  buildJobsTable,
  builderWorkspacesTable,
  db,
  humanActionsTable,
  qaRunsTable,
  releaseEventsTable,
  releaseJobsTable,
  type PersistedReleasePlan,
  type ReleaseTargetKind,
} from "@workspace/db";
import {
  configuredReleaseAdapter,
  type ReleaseAgentAdapter,
  type ReleaseResult,
  type ReleaseStage,
} from "./release-agent-adapter";
import {
  createOrReuseHumanAction,
  markHumanActionResolved,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
} from "./human-gates";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

const DEFAULT_INTERVAL_MS = 3_000;
const MIN_INTERVAL_MS = 1_000;
const MAX_CONFIRMED_FAILED_ATTEMPTS = 3;
let timer: NodeJS.Timeout | null = null;
let tickRunning = false;

function intervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_RELEASE_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_INTERVAL_MS
    ? configured
    : DEFAULT_INTERVAL_MS;
}

function targetKindForProductShape(productShape: string): ReleaseTargetKind {
  switch (productShape.toUpperCase()) {
    case "WEB_APP": return "HOSTED_WEB";
    case "API": return "HOSTED_API";
    case "SCRAPER": return "SCHEDULED_WORKER";
    case "AUTOMATION": return "AUTOMATION_RUNTIME";
    case "MARKETPLACE_PRODUCT": return "MARKETPLACE_PUBLICATION";
    case "DATA_PRODUCT": return "DATA_DELIVERY";
    case "BOT": return "BOT_RUNTIME";
    case "EXTENSION": return "EXTENSION_STORE";
    default: return "GENERIC_RELEASE";
  }
}

function previewPurpose(targetKind: ReleaseTargetKind): PersistedReleasePlan["preview"]["purpose"] {
  return targetKind === "MARKETPLACE_PUBLICATION" || targetKind === "EXTENSION_STORE"
    ? "PACKAGE_VALIDATION"
    : "DEPLOYMENT_HEALTH_VERIFICATION";
}

function releaseKey(buildJobId: number): string {
  return `build-${buildJobId}:controlled-release-v1`;
}

function stageKey(buildJobId: number, stage: ReleaseStage, attempt = 1): string {
  return `build-${buildJobId}:release:${stage.toLowerCase()}:attempt-${attempt}`;
}

function remainingSpend(job: typeof releaseJobsTable.$inferSelect): number {
  return Math.max(0, job.externalSpendCeilingCents - job.externalSpendUsedCents);
}

async function recordReleaseEvent(input: {
  releaseJobId: number;
  buildJobId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(releaseEventsTable).values({
    releaseJobId: input.releaseJobId,
    buildJobId: input.buildJobId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function ensureReleaseJobsForQaPassedBuilds(): Promise<number> {
  const completedBuilds = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.status, "COMPLETE"))
    .orderBy(asc(buildJobsTable.id))
    .limit(100);

  let createdCount = 0;
  for (const build of completedBuilds) {
    const [existing] = await db.select({ id: releaseJobsTable.id }).from(releaseJobsTable).where(eq(releaseJobsTable.buildJobId, build.id));
    if (existing) continue;

    const [qa] = await db
      .select()
      .from(qaRunsTable)
      .where(and(eq(qaRunsTable.buildJobId, build.id), eq(qaRunsTable.status, "PASSED")))
      .orderBy(desc(qaRunsTable.roundNumber))
      .limit(1);
    if (!qa) continue;

    const [workspace] = await db
      .select()
      .from(builderWorkspacesTable)
      .where(eq(builderWorkspacesTable.buildJobId, build.id));
    if (!workspace?.repositoryUrl || !workspace.branchName) continue;

    const targetKind = targetKindForProductShape(build.productShape);
    const plan: PersistedReleasePlan = {
      schemaVersion: 1,
      buildJobId: build.id,
      opportunityId: build.opportunityId,
      productShape: build.productShape,
      targetKind,
      artifact: {
        repositoryUrl: workspace.repositoryUrl,
        branchName: workspace.branchName,
      },
      preview: {
        required: true,
        visibility: "PRIVATE",
        purpose: previewPurpose(targetKind),
      },
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

    const [created] = await db.insert(releaseJobsTable).values({
      buildJobId: build.id,
      builderWorkspaceId: workspace.id,
      opportunityId: build.opportunityId,
      evaluationCycleId: build.evaluationCycleId,
      idempotencyKey: releaseKey(build.id),
      status: "READY_FOR_PREVIEW",
      productShape: build.productShape,
      targetKind,
      plan,
      previewIdempotencyKey: stageKey(build.id, "PREVIEW"),
      productionIdempotencyKey: stageKey(build.id, "PRODUCTION"),
      externalSpendCeilingCents: 0,
      externalSpendUsedCents: 0,
    }).onConflictDoNothing({ target: releaseJobsTable.buildJobId }).returning();

    if (!created) continue;
    createdCount += 1;
    await recordReleaseEvent({
      releaseJobId: created.id,
      buildJobId: build.id,
      opportunityId: build.opportunityId,
      eventType: "RELEASE_JOB_CREATED",
      summary: "QA-passed build entered the controlled release pipeline.",
      metadata: { target_kind: targetKind, qa_run_id: qa.id },
    });
    await recordLifecycleEvent({
      opportunityId: build.opportunityId,
      evaluationCycleId: build.evaluationCycleId,
      eventType: "CONTROLLED_RELEASE_CREATED",
      summary: "QA-passed build is queued for private preview before any public release authority is requested.",
      metadata: { release_job_id: created.id, build_job_id: build.id, target_kind: targetKind },
    });
  }
  return createdCount;
}

async function blockForReleaseAdapter(job: typeof releaseJobsTable.$inferSelect) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "CONNECT_RELEASE_AGENT",
    title: "Connect an automation-ready release backend",
    whyNeeded: "The build passed QA, but Money Scout has no deployment/publication backend it can invoke autonomously.",
    instructions: "Connect a supported release bridge with automation-ready access. Prefer an existing account or zero-cash path. This grants deployment capability only, not permission to publish this product publicly.",
    blockedStage: `CONTROLLED_RELEASE_ADAPTER:${job.id}`,
    requiredCapabilityKey: "DEPLOYMENT_AGENT_ACCESS",
    provider: "RELEASE_BACKEND",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { release_job_id: job.id },
    inherentlyHumanAuthority: true,
  });
  await db.update(releaseJobsTable).set({
    status: "BLOCKED",
    blockedReason: "DEPLOYMENT_AGENT_ACCESS_REQUIRED",
    lastErrorCode: "DEPLOYMENT_AGENT_ACCESS_REQUIRED",
    lastErrorMessage: "No automation-ready controlled release adapter is configured.",
    updatedAt: new Date(),
  }).where(eq(releaseJobsTable.id, job.id));
}

async function ensurePublicAuthorityAction(job: typeof releaseJobsTable.$inferSelect) {
  if (job.publicReleaseAuthorizedAt) return;
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "AUTHORIZE_PUBLIC_RELEASE",
    title: "Authorize this build to go public",
    whyNeeded: "Money Scout has verified a private preview. Making the product publicly reachable is an external side effect and requires explicit per-release authority.",
    instructions: "Review the verified preview and use the release authorization control to approve public deployment. This does not authorize charging customers, buying a domain, outbound messaging, or ad spend.",
    blockedStage: `CONTROLLED_RELEASE_PUBLIC:${job.id}`,
    requiredCapabilityKey: null,
    provider: job.releaseProvider,
    verificationMode: "AUTOMATED_CHECK",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { release_job_id: job.id, preview_url: job.previewUrl },
    inherentlyHumanAuthority: true,
  });
}

async function blockForSpend(job: typeof releaseJobsTable.$inferSelect, stage: ReleaseStage) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "AUTHORIZE_RELEASE_SPEND",
    title: "Set a bounded release budget",
    whyNeeded: `The configured release backend is metered and the ${stage.toLowerCase()} step has no remaining authorized release budget.`,
    instructions: "Use the release budget control to set an explicit ceiling. Money Scout will not borrow unused Research or Build budget and will not infer spend authority from a BUILD verdict.",
    blockedStage: `CONTROLLED_RELEASE_SPEND:${job.id}:${stage}`,
    requiredCapabilityKey: null,
    provider: job.releaseProvider,
    verificationMode: "AUTOMATED_CHECK",
    urgency: "NORMAL",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { release_job_id: job.id, stage },
    inherentlyHumanAuthority: true,
  });
  await db.update(releaseJobsTable).set({
    status: "BLOCKED",
    blockedReason: `RELEASE_${stage}_SPEND_AUTHORITY_REQUIRED`,
    lastErrorCode: `RELEASE_${stage}_SPEND_AUTHORITY_REQUIRED`,
    lastErrorMessage: "Metered release execution is blocked because no bounded release budget remains.",
    updatedAt: new Date(),
  }).where(eq(releaseJobsTable.id, job.id));
}

async function blockForProductionHealth(job: typeof releaseJobsTable.$inferSelect, result: ReleaseResult) {
  await createOrReuseHumanAction({
    opportunityId: job.opportunityId,
    actionType: "PRODUCTION_RELEASE_NEEDS_INTERVENTION",
    title: "Production release needs intervention",
    whyNeeded: "The release backend reports a production result that is not safely verifiable as healthy and public. Money Scout will not blindly redeploy or claim launch success.",
    instructions: "Review the preserved production URL/provider result and provide only the missing authority or provider-side correction. Money Scout has stopped further external side effects.",
    blockedStage: `CONTROLLED_RELEASE_PRODUCTION_HEALTH:${job.id}`,
    requiredCapabilityKey: null,
    provider: job.releaseProvider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "CRITICAL",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { release_job_id: job.id, provider_run_id: result.providerRunId, url: result.url },
    inherentlyHumanAuthority: true,
  });
  await db.update(releaseJobsTable).set({
    status: "BLOCKED",
    blockedReason: "PRODUCTION_RELEASE_NOT_SAFELY_VERIFIED",
    lastErrorCode: "PRODUCTION_RELEASE_NOT_SAFELY_VERIFIED",
    lastErrorMessage: (result.summary ?? "Production release could not be safely verified.").slice(0, 4_000),
    productionUrl: result.url,
    productionVisibility: result.visibility,
    productionHealthPassed: result.healthChecksPassed,
    updatedAt: new Date(),
  }).where(eq(releaseJobsTable.id, job.id));
}

async function applyTerminalCostAndUpdate(
  job: typeof releaseJobsTable.$inferSelect,
  values: Partial<typeof releaseJobsTable.$inferInsert>,
  externalCostCents: number,
) {
  await db.update(releaseJobsTable).set({
    ...values,
    ...(externalCostCents > 0
      ? { externalSpendUsedCents: sql`${releaseJobsTable.externalSpendUsedCents} + ${externalCostCents}` }
      : {}),
    updatedAt: new Date(),
  }).where(eq(releaseJobsTable.id, job.id));
}

async function applyReleaseResult(job: typeof releaseJobsTable.$inferSelect, result: ReleaseResult) {
  const now = new Date();
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    await db.update(releaseJobsTable).set({
      releaseProvider: job.releaseProvider,
      ...(result.stage === "PREVIEW"
        ? { status: "PREVIEW_DEPLOYING", previewProviderRunId: result.providerRunId }
        : { status: "PRODUCTION_DEPLOYING", productionProviderRunId: result.providerRunId }),
      updatedAt: now,
    }).where(eq(releaseJobsTable.id, job.id));
    return;
  }

  if (result.stage === "PREVIEW") {
    if (result.state === "SUCCEEDED") {
      if (result.visibility !== "PRIVATE") {
        await applyTerminalCostAndUpdate(job, {
          status: "BLOCKED",
          blockedReason: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
          previewProviderRunId: result.providerRunId,
          previewUrl: result.url,
          previewVisibility: result.visibility,
          previewHealthPassed: result.healthChecksPassed,
          previewFinishedAt: now,
          lastErrorCode: "PREVIEW_VISIBILITY_SAFETY_VIOLATION",
          lastErrorMessage: "Preview stage became publicly visible even though the release contract required PRIVATE visibility.",
        }, result.externalCostCents);
        await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: "PREVIEW_SAFETY_VIOLATION", summary: "Release backend violated the private-preview boundary; production is blocked.", metadata: { visibility: result.visibility, url: result.url } });
        return;
      }
      if (result.healthChecksPassed !== true) {
        await applyTerminalCostAndUpdate(job, {
          status: "FAILED",
          previewProviderRunId: result.providerRunId,
          previewUrl: result.url,
          previewVisibility: result.visibility,
          previewHealthPassed: result.healthChecksPassed,
          previewFinishedAt: now,
          lastErrorCode: "PREVIEW_HEALTH_NOT_VERIFIED",
          lastErrorMessage: (result.summary ?? "Private preview did not pass deployment health verification.").slice(0, 4_000),
        }, result.externalCostCents);
        return;
      }
      await applyTerminalCostAndUpdate(job, {
        status: "PREVIEW_READY",
        blockedReason: null,
        previewProviderRunId: result.providerRunId,
        previewUrl: result.url,
        previewVisibility: result.visibility,
        previewHealthPassed: true,
        previewFinishedAt: now,
        lastErrorCode: null,
        lastErrorMessage: null,
      }, result.externalCostCents);
      await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: "PRIVATE_PREVIEW_VERIFIED", summary: "Private preview is healthy; public-release authority is now the next gate.", metadata: { url: result.url, provider_run_id: result.providerRunId } });
      return;
    }

    if (result.retryable && job.previewDispatchAttemptCount < MAX_CONFIRMED_FAILED_ATTEMPTS) {
      const nextAttempt = job.previewDispatchAttemptCount + 1;
      await applyTerminalCostAndUpdate(job, {
        status: "READY_FOR_PREVIEW",
        previewProviderRunId: null,
        previewIdempotencyKey: stageKey(job.buildJobId, "PREVIEW", nextAttempt),
        lastErrorCode: `PREVIEW_${result.state}`,
        lastErrorMessage: (result.summary ?? `Preview run ${result.state.toLowerCase()}.`).slice(0, 4_000),
      }, result.externalCostCents);
      return;
    }
    await applyTerminalCostAndUpdate(job, {
      status: "FAILED",
      previewProviderRunId: result.providerRunId,
      previewFinishedAt: now,
      lastErrorCode: `PREVIEW_${result.state}`,
      lastErrorMessage: (result.summary ?? `Preview run ${result.state.toLowerCase()}.`).slice(0, 4_000),
    }, result.externalCostCents);
    return;
  }

  if (result.state === "SUCCEEDED") {
    if (result.visibility !== "PUBLIC" || result.healthChecksPassed !== true) {
      await applyTerminalCostAndUpdate(job, {
        productionProviderRunId: result.providerRunId,
        productionUrl: result.url,
        productionVisibility: result.visibility,
        productionHealthPassed: result.healthChecksPassed,
        productionFinishedAt: now,
      }, result.externalCostCents);
      await blockForProductionHealth(job, result);
      return;
    }
    await applyTerminalCostAndUpdate(job, {
      status: "COMPLETE",
      blockedReason: null,
      productionProviderRunId: result.providerRunId,
      productionUrl: result.url,
      productionVisibility: "PUBLIC",
      productionHealthPassed: true,
      productionFinishedAt: now,
      finishedAt: now,
      lastErrorCode: null,
      lastErrorMessage: null,
    }, result.externalCostCents);
    await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: "PUBLIC_RELEASE_VERIFIED", summary: "Authorized public release is healthy and externally reachable.", metadata: { url: result.url, provider_run_id: result.providerRunId, target_kind: job.targetKind } });
    await recordLifecycleEvent({ opportunityId: job.opportunityId, evaluationCycleId: job.evaluationCycleId, eventType: "PUBLIC_RELEASE_COMPLETE", summary: "Controlled public release completed and is ready to become an operating Asset.", metadata: { release_job_id: job.id, build_job_id: job.buildJobId, production_url: result.url, target_kind: job.targetKind } });
    await setOpportunityActivity(job.opportunityId, { activeEvaluationCycleId: job.evaluationCycleId, currentActivityKey: "PUBLIC_RELEASE_COMPLETE", currentActivityLabel: "Product is live and release-verified", activityStatus: "COMPLETE", activityStartedAt: now, expectedDurationSeconds: null, nextAction: "CREATE ASSET AND START OPERATIONS", etaBasis: "NEXT_AUTONOMY_LAYER_PENDING", lifecycleTransition: true });
    return;
  }

  if (result.retryable && job.productionDispatchAttemptCount < MAX_CONFIRMED_FAILED_ATTEMPTS) {
    const nextAttempt = job.productionDispatchAttemptCount + 1;
    await applyTerminalCostAndUpdate(job, {
      status: "WAITING_FOR_PUBLIC_AUTHORITY",
      productionProviderRunId: null,
      productionIdempotencyKey: stageKey(job.buildJobId, "PRODUCTION", nextAttempt),
      lastErrorCode: `PRODUCTION_${result.state}`,
      lastErrorMessage: (result.summary ?? `Production run ${result.state.toLowerCase()}.`).slice(0, 4_000),
    }, result.externalCostCents);
    return;
  }
  await applyTerminalCostAndUpdate(job, {
    status: "FAILED",
    productionProviderRunId: result.providerRunId,
    productionFinishedAt: now,
    lastErrorCode: `PRODUCTION_${result.state}`,
    lastErrorMessage: (result.summary ?? `Production run ${result.state.toLowerCase()}.`).slice(0, 4_000),
  }, result.externalCostCents);
}

async function dispatchStage(job: typeof releaseJobsTable.$inferSelect, adapter: ReleaseAgentAdapter, stage: ReleaseStage) {
  if (adapter.costMode === "METERED" && remainingSpend(job) <= 0) return blockForSpend(job, stage);
  const isPreview = stage === "PREVIEW";
  const now = new Date();
  await db.update(releaseJobsTable).set({
    releaseProvider: adapter.provider,
    releaseCostMode: adapter.costMode,
    status: isPreview ? "PREVIEW_DEPLOYING" : "PRODUCTION_DEPLOYING",
    ...(isPreview
      ? { previewDispatchAttemptCount: job.previewDispatchAttemptCount + 1 }
      : { productionDispatchAttemptCount: job.productionDispatchAttemptCount + 1 }),
    blockedReason: null,
    updatedAt: now,
  }).where(eq(releaseJobsTable.id, job.id));

  try {
    const result = await adapter.dispatch({
      releaseJobId: job.id,
      buildJobId: job.buildJobId,
      opportunityId: job.opportunityId,
      stage,
      targetKind: job.targetKind,
      idempotencyKey: isPreview ? job.previewIdempotencyKey : job.productionIdempotencyKey,
      repositoryUrl: job.plan.artifact.repositoryUrl,
      branchName: job.plan.artifact.branchName,
      plan: job.plan,
    });
    if (result.stage !== stage) throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: expected ${stage}, received ${result.stage}`);
    await applyReleaseResult({
      ...job,
      releaseProvider: adapter.provider,
      releaseCostMode: adapter.costMode,
      previewDispatchAttemptCount: isPreview ? job.previewDispatchAttemptCount + 1 : job.previewDispatchAttemptCount,
      productionDispatchAttemptCount: isPreview ? job.productionDispatchAttemptCount : job.productionDispatchAttemptCount + 1,
    }, result);
    await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: `${stage}_DISPATCHED`, summary: `${stage === "PREVIEW" ? "Private preview" : "Authorized production release"} dispatched to the release backend.`, metadata: { provider: adapter.provider, provider_run_id: result.providerRunId, idempotency_key: isPreview ? job.previewIdempotencyKey : job.productionIdempotencyKey } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown release dispatch failure";
    await db.update(releaseJobsTable).set({
      status: isPreview ? "READY_FOR_PREVIEW" : "WAITING_FOR_PUBLIC_AUTHORITY",
      lastErrorCode: "RELEASE_DISPATCH_TRANSIENT",
      lastErrorMessage: message.slice(0, 4_000),
      updatedAt: new Date(),
    }).where(eq(releaseJobsTable.id, job.id));
    logger.warn({ err: error, releaseJobId: job.id, stage }, "Release dispatch failed before a provider run was confirmed; same idempotency key will be reused");
  }
}

async function pollStage(job: typeof releaseJobsTable.$inferSelect, adapter: ReleaseAgentAdapter, stage: ReleaseStage) {
  const runId = stage === "PREVIEW" ? job.previewProviderRunId : job.productionProviderRunId;
  if (!runId) {
    await db.update(releaseJobsTable).set({
      status: stage === "PREVIEW" ? "READY_FOR_PREVIEW" : "WAITING_FOR_PUBLIC_AUTHORITY",
      lastErrorCode: "RELEASE_PROVIDER_RUN_ID_MISSING",
      updatedAt: new Date(),
    }).where(eq(releaseJobsTable.id, job.id));
    return;
  }
  try {
    const result = await adapter.getStatus(runId);
    if (result.stage !== stage) throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: polled ${stage}, received ${result.stage}`);
    await applyReleaseResult(job, result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown release status failure";
    await db.update(releaseJobsTable).set({ lastErrorCode: "RELEASE_POLL_TRANSIENT", lastErrorMessage: message.slice(0, 4_000), updatedAt: new Date() }).where(eq(releaseJobsTable.id, job.id));
    logger.warn({ err: error, releaseJobId: job.id, stage }, "Release polling failed; durable provider run will be polled again");
  }
}

async function unblockConfiguredAdapter(adapter: ReleaseAgentAdapter) {
  await setCapabilityAvailable({ key: "DEPLOYMENT_AGENT_ACCESS", provider: adapter.provider, accessLevel: "AUTOMATION_READY", verificationMethod: "RELEASE_ADAPTER_CONFIGURED", metadata: { cost_mode: adapter.costMode } });
  await resolveOpenActionsForCapability({ capabilityKey: "DEPLOYMENT_AGENT_ACCESS", resolutionData: { detected_automatically: true, provider: adapter.provider } });
  const blocked = await db.select().from(releaseJobsTable).where(and(eq(releaseJobsTable.status, "BLOCKED"), eq(releaseJobsTable.blockedReason, "DEPLOYMENT_AGENT_ACCESS_REQUIRED")));
  for (const job of blocked) {
    await db.update(releaseJobsTable).set({ status: job.previewHealthPassed === true ? "PREVIEW_READY" : "READY_FOR_PREVIEW", blockedReason: null, releaseProvider: adapter.provider, releaseCostMode: adapter.costMode, lastErrorCode: null, lastErrorMessage: null, updatedAt: new Date() }).where(eq(releaseJobsTable.id, job.id));
  }
}

async function unblockSpendIfBudgetAppeared() {
  const blocked = await db.select().from(releaseJobsTable).where(and(eq(releaseJobsTable.status, "BLOCKED"), inArray(releaseJobsTable.blockedReason, ["RELEASE_PREVIEW_SPEND_AUTHORITY_REQUIRED", "RELEASE_PRODUCTION_SPEND_AUTHORITY_REQUIRED"])));
  for (const job of blocked) {
    if (remainingSpend(job) <= 0) continue;
    await db.update(releaseJobsTable).set({ status: job.previewHealthPassed === true ? "WAITING_FOR_PUBLIC_AUTHORITY" : "READY_FOR_PREVIEW", blockedReason: null, lastErrorCode: null, lastErrorMessage: null, updatedAt: new Date() }).where(eq(releaseJobsTable.id, job.id));
  }
}

export async function authorizePublicRelease(input: { releaseJobId: number; authorizedBy?: string }) {
  const [job] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, input.releaseJobId));
  if (!job) throw new Error("RELEASE_JOB_NOT_FOUND");
  if (job.previewHealthPassed !== true || job.previewVisibility !== "PRIVATE") {
    throw new Error("PUBLIC_RELEASE_NOT_ELIGIBLE: a healthy private preview is required first");
  }
  if (job.status === "COMPLETE") return job;
  const now = new Date();
  const [updated] = await db.update(releaseJobsTable).set({ publicReleaseAuthorizedAt: job.publicReleaseAuthorizedAt ?? now, publicReleaseAuthorizedBy: input.authorizedBy ?? "HUMAN_ATTESTATION", status: "WAITING_FOR_PUBLIC_AUTHORITY", blockedReason: null, updatedAt: now }).where(eq(releaseJobsTable.id, job.id)).returning();
  const actions = await db.select().from(humanActionsTable).where(and(eq(humanActionsTable.opportunityId, job.opportunityId), eq(humanActionsTable.actionType, "AUTHORIZE_PUBLIC_RELEASE"), eq(humanActionsTable.blockedStage, `CONTROLLED_RELEASE_PUBLIC:${job.id}`), inArray(humanActionsTable.status, ["OPEN", "VERIFYING"])));
  for (const action of actions) await markHumanActionResolved({ actionId: action.id, resolutionData: { release_job_id: job.id, authorized_at: now.toISOString(), scope: "PUBLIC_RELEASE_ONLY" } });
  await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: "PUBLIC_RELEASE_AUTHORIZED", summary: "Explicit per-release public deployment authority recorded.", metadata: { authorized_by: input.authorizedBy ?? "HUMAN_ATTESTATION" } });
  return updated ?? job;
}

export async function authorizeReleaseSpend(input: { releaseJobId: number; ceilingCents: number; authorizedBy?: string }) {
  if (!Number.isInteger(input.ceilingCents) || input.ceilingCents <= 0) throw new Error("RELEASE_SPEND_CEILING_INVALID");
  const [job] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, input.releaseJobId));
  if (!job) throw new Error("RELEASE_JOB_NOT_FOUND");
  if (input.ceilingCents < job.externalSpendUsedCents) throw new Error("RELEASE_SPEND_CEILING_BELOW_ALREADY_USED");
  const [updated] = await db.update(releaseJobsTable).set({ externalSpendCeilingCents: input.ceilingCents, blockedReason: null, status: job.previewHealthPassed === true ? "WAITING_FOR_PUBLIC_AUTHORITY" : "READY_FOR_PREVIEW", updatedAt: new Date() }).where(eq(releaseJobsTable.id, job.id)).returning();
  const actions = await db.select().from(humanActionsTable).where(and(eq(humanActionsTable.opportunityId, job.opportunityId), eq(humanActionsTable.actionType, "AUTHORIZE_RELEASE_SPEND"), inArray(humanActionsTable.status, ["OPEN", "VERIFYING"])));
  for (const action of actions) await markHumanActionResolved({ actionId: action.id, resolutionData: { release_job_id: job.id, ceiling_cents: input.ceilingCents, authorized_by: input.authorizedBy ?? "HUMAN_ATTESTATION" } });
  await recordReleaseEvent({ releaseJobId: job.id, buildJobId: job.buildJobId, opportunityId: job.opportunityId, eventType: "RELEASE_SPEND_AUTHORIZED", summary: `Bounded release budget set to ${input.ceilingCents} cents.`, metadata: { ceiling_cents: input.ceilingCents, authorized_by: input.authorizedBy ?? "HUMAN_ATTESTATION" } });
  return updated ?? job;
}

async function processReleaseJob(job: typeof releaseJobsTable.$inferSelect, adapter: ReleaseAgentAdapter | null) {
  if (job.status === "READY_FOR_PREVIEW") {
    if (!adapter) return blockForReleaseAdapter(job);
    return dispatchStage(job, adapter, "PREVIEW");
  }
  if (job.status === "PREVIEW_DEPLOYING") {
    if (!adapter || adapter.provider !== job.releaseProvider) return blockForReleaseAdapter(job);
    return pollStage(job, adapter, "PREVIEW");
  }
  if (job.status === "PREVIEW_READY") {
    await db.update(releaseJobsTable).set({ status: "WAITING_FOR_PUBLIC_AUTHORITY", updatedAt: new Date() }).where(eq(releaseJobsTable.id, job.id));
    await ensurePublicAuthorityAction(job);
    await setOpportunityActivity(job.opportunityId, { activeEvaluationCycleId: job.evaluationCycleId, currentActivityKey: "PUBLIC_RELEASE_AUTHORITY_PENDING", currentActivityLabel: "Private preview verified; public release needs authority", activityStatus: "BLOCKED", activityStartedAt: new Date(), expectedDurationSeconds: null, nextAction: "AUTHORIZE PUBLIC RELEASE", etaBasis: "HUMAN_ACTION_REQUIRED", lifecycleTransition: true });
    return;
  }
  if (job.status === "WAITING_FOR_PUBLIC_AUTHORITY") {
    if (!job.publicReleaseAuthorizedAt) return ensurePublicAuthorityAction(job);
    if (!adapter) return blockForReleaseAdapter(job);
    return dispatchStage(job, adapter, "PRODUCTION");
  }
  if (job.status === "PRODUCTION_DEPLOYING") {
    if (!adapter || adapter.provider !== job.releaseProvider) return blockForReleaseAdapter(job);
    return pollStage(job, adapter, "PRODUCTION");
  }
}

export async function runControlledReleaseTick(adapterOverride?: ReleaseAgentAdapter | null): Promise<{ createdReleaseJobs: number; processedReleaseJobId: number | null }> {
  if (tickRunning) return { createdReleaseJobs: 0, processedReleaseJobId: null };
  tickRunning = true;
  try {
    const adapter = adapterOverride === undefined ? configuredReleaseAdapter() : adapterOverride;
    const createdReleaseJobs = await ensureReleaseJobsForQaPassedBuilds();
    if (adapter) await unblockConfiguredAdapter(adapter);
    await unblockSpendIfBudgetAppeared();
    const [job] = await db.select().from(releaseJobsTable).where(inArray(releaseJobsTable.status, ["READY_FOR_PREVIEW", "PREVIEW_DEPLOYING", "PREVIEW_READY", "WAITING_FOR_PUBLIC_AUTHORITY", "PRODUCTION_DEPLOYING"])).orderBy(asc(releaseJobsTable.id)).limit(1);
    if (job) await processReleaseJob(job, adapter);
    return { createdReleaseJobs, processedReleaseJobId: job?.id ?? null };
  } finally {
    tickRunning = false;
  }
}

export function startControlledReleaseWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    try {
      await runControlledReleaseTick();
    } catch (error) {
      logger.error({ err: error }, "Controlled release worker tick failed");
    }
  };
  void tick();
  timer = setInterval(() => void tick(), intervalMs());
  timer.unref?.();
}

export function stopControlledReleaseWorkerForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  tickRunning = false;
}
