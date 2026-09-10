import {
  and,
  asc,
  desc,
  eq,
  gte,
  inArray,
  isNull,
  lte,
  or,
  sql,
} from "drizzle-orm";
import {
  assetEconomicReviewsTable,
  assetEventsTable,
  assetObservationsTable,
  assetTelemetrySyncsTable,
  assetsTable,
  db,
  type AssetEconomicStatus,
  type AssetInstrumentationStatus,
  type AssetObservationType,
  type PersistedAssetTelemetryCoverage,
} from "@workspace/db";
import {
  configuredAssetTelemetryAdapter,
  type AssetTelemetryAdapter,
  type AssetTelemetryObservation,
} from "./asset-telemetry-adapter";
import {
  createOrReuseHumanAction,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
} from "./human-gates";
import { recordAssetObservation } from "./asset-operations-worker";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

const DEFAULT_WORKER_INTERVAL_MS = 10_000;
const MIN_WORKER_INTERVAL_MS = 2_000;
const DEFAULT_TELEMETRY_INTERVAL_SECONDS = 300;
const TELEMETRY_RETRY_SECONDS = 60;
let timer: NodeJS.Timeout | null = null;
let tickRunning = false;

function workerIntervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_ASSET_ECONOMICS_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_WORKER_INTERVAL_MS
    ? configured
    : DEFAULT_WORKER_INTERVAL_MS;
}

function telemetryIntervalSeconds(): number {
  const configured = Number(process.env.MONEY_SCOUT_ASSET_TELEMETRY_INTERVAL_SECONDS ?? "");
  return Number.isInteger(configured) && configured >= 60
    ? Math.min(configured, 86_400)
    : DEFAULT_TELEMETRY_INTERVAL_SECONDS;
}

function nextSync(seconds: number): Date {
  return new Date(Date.now() + seconds * 1_000);
}

async function recordAssetEvent(input: {
  assetId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(assetEventsTable).values({
    assetId: input.assetId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

function syncKey(assetId: number, scheduledAt: Date): string {
  return `asset-${assetId}:telemetry:${scheduledAt.toISOString()}`.slice(0, 500);
}

function observationKey(provider: string, assetId: number, eventId: string): string {
  return `asset-${assetId}:telemetry:${provider}:${eventId}`.slice(0, 500);
}

function sourceName(provider: string): string {
  return `TELEMETRY:${provider}`.slice(0, 200);
}

function instrumentedStatus(
  current: AssetInstrumentationStatus,
  kind: AssetObservationType,
  observations: AssetTelemetryObservation[],
  coverage: PersistedAssetTelemetryCoverage[],
): AssetInstrumentationStatus {
  if (observations.some((observation) => observation.observationType === kind)) return "INSTRUMENTED";
  if (coverage.some((item) => item.kind === kind)) return "INSTRUMENTED";
  return current === "UNINSTRUMENTED" || current === "ERROR" ? "CONNECTED" : current;
}

async function latestSuccessfulSync(assetId: number) {
  const [sync] = await db
    .select()
    .from(assetTelemetrySyncsTable)
    .where(and(
      eq(assetTelemetrySyncsTable.assetId, assetId),
      eq(assetTelemetrySyncsTable.status, "SUCCEEDED"),
    ))
    .orderBy(desc(assetTelemetrySyncsTable.createdAt), desc(assetTelemetrySyncsTable.id))
    .limit(1);
  return sync ?? null;
}

function completeCoverage(
  coverage: PersistedAssetTelemetryCoverage[],
  kind: "REVENUE" | "COST",
): PersistedAssetTelemetryCoverage | null {
  const candidates = coverage
    .filter((item) => item.kind === kind && item.complete)
    .sort((a, b) => new Date(b.windowEnd).getTime() - new Date(a.windowEnd).getTime());
  return candidates[0] ?? null;
}

export async function reviewAssetEconomics(input: {
  assetId: number;
  syncId: number;
  coverage: PersistedAssetTelemetryCoverage[];
}) {
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, input.assetId));
  if (!asset) throw new Error("ASSET_NOT_FOUND");

  const revenueCoverage = completeCoverage(input.coverage, "REVENUE");
  const costCoverage = completeCoverage(input.coverage, "COST");
  const reviewKey = `asset-${asset.id}:economic-review:sync-${input.syncId}`.slice(0, 500);

  if (!revenueCoverage || !costCoverage) {
    const [review] = await db.insert(assetEconomicReviewsTable).values({
      assetId: asset.id,
      idempotencyKey: reviewKey,
      status: "INCOMPLETE",
      revenueComplete: Boolean(revenueCoverage),
      costComplete: Boolean(costCoverage),
      evidence: {
        telemetry_sync_id: input.syncId,
        reason: "Contribution margin remains unknown until authoritative revenue and cost coverage overlap.",
        coverage: input.coverage,
      },
    }).onConflictDoNothing({ target: assetEconomicReviewsTable.idempotencyKey }).returning();

    await db.update(assetsTable).set({
      economicsStatus: "INCOMPLETE",
      lastEconomicReviewAt: new Date(),
      updatedAt: new Date(),
    }).where(eq(assetsTable.id, asset.id));
    return review ?? null;
  }

  const windowStart = new Date(Math.max(
    new Date(revenueCoverage.windowStart).getTime(),
    new Date(costCoverage.windowStart).getTime(),
  ));
  const windowEnd = new Date(Math.min(
    new Date(revenueCoverage.windowEnd).getTime(),
    new Date(costCoverage.windowEnd).getTime(),
  ));

  if (windowEnd.getTime() <= windowStart.getTime()) {
    const [review] = await db.insert(assetEconomicReviewsTable).values({
      assetId: asset.id,
      idempotencyKey: reviewKey,
      status: "INCOMPLETE",
      revenueComplete: true,
      costComplete: true,
      evidence: {
        telemetry_sync_id: input.syncId,
        reason: "Authoritative revenue and cost windows do not overlap, so contribution margin is not measurable.",
        coverage: input.coverage,
      },
    }).onConflictDoNothing({ target: assetEconomicReviewsTable.idempotencyKey }).returning();
    await db.update(assetsTable).set({ economicsStatus: "INCOMPLETE", lastEconomicReviewAt: new Date(), updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
    return review ?? null;
  }

  const observations = await db
    .select()
    .from(assetObservationsTable)
    .where(and(
      eq(assetObservationsTable.assetId, asset.id),
      eq(assetObservationsTable.provenance, "FACT"),
      inArray(assetObservationsTable.observationType, ["REVENUE", "COST", "TRANSACTION"]),
      gte(assetObservationsTable.observedAt, windowStart),
      lte(assetObservationsTable.observedAt, windowEnd),
    ));

  const revenueCents = observations
    .filter((item) => item.observationType === "REVENUE")
    .reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  const costCents = observations
    .filter((item) => item.observationType === "COST")
    .reduce((sum, item) => sum + (item.amountCents ?? 0), 0);
  const transactionCount = observations
    .filter((item) => item.observationType === "TRANSACTION")
    .reduce((sum, item) => sum + (item.quantity ?? 1), 0);
  const contributionMarginCents = revenueCents - costCents;
  const status: AssetEconomicStatus = contributionMarginCents > 0
    ? "MEASURED_POSITIVE"
    : contributionMarginCents < 0
      ? "MEASURED_NEGATIVE"
      : "MEASURED_BREAK_EVEN";

  const [review] = await db.insert(assetEconomicReviewsTable).values({
    assetId: asset.id,
    idempotencyKey: reviewKey,
    status,
    windowStart,
    windowEnd,
    revenueComplete: true,
    costComplete: true,
    revenueCents,
    costCents,
    contributionMarginCents,
    transactionCount,
    evidence: {
      telemetry_sync_id: input.syncId,
      basis: "FACT observations inside overlapping authoritative provider coverage windows.",
      auto_kill_allowed: false,
    },
  }).onConflictDoNothing({ target: assetEconomicReviewsTable.idempotencyKey }).returning();

  await db.update(assetsTable).set({
    economicsStatus: status,
    lastEconomicReviewAt: new Date(),
    updatedAt: new Date(),
  }).where(eq(assetsTable.id, asset.id));

  if (review) {
    await recordAssetEvent({
      assetId: asset.id,
      opportunityId: asset.opportunityId,
      eventType: "ASSET_ECONOMIC_REVIEW",
      summary: `Measured contribution margin for the authoritative window is ${contributionMarginCents} cents (${status}).`,
      metadata: {
        economic_review_id: review.id,
        window_start: windowStart.toISOString(),
        window_end: windowEnd.toISOString(),
        revenue_cents: revenueCents,
        cost_cents: costCents,
        contribution_margin_cents: contributionMarginCents,
        transaction_count: transactionCount,
        status,
        auto_kill_allowed: false,
      },
    });
  }
  return review ?? null;
}

async function createTelemetryCapabilityAction(asset: typeof assetsTable.$inferSelect, reason: string) {
  await createOrReuseHumanAction({
    opportunityId: asset.opportunityId,
    actionType: "CONNECT_ASSET_TELEMETRY",
    title: "Connect authoritative operating telemetry",
    whyNeeded: reason,
    instructions: "Connect an automation-ready read-only telemetry bridge for this Asset's payment, cost, usage, or support systems. Money Scout needs provider-level event IDs and explicit coverage windows; do not paste passwords or raw secrets here.",
    blockedStage: `ASSET_TELEMETRY:${asset.id}`,
    requiredCapabilityKey: "ASSET_TELEMETRY_ACCESS",
    provider: "OPERATING_TELEMETRY",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "NORMAL",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { asset_id: asset.id },
    inherentlyHumanAuthority: true,
  });
}

async function recordUnauthorizedTelemetryCost(
  asset: typeof assetsTable.$inferSelect,
  provider: string,
  syncId: number,
  costCents: number,
) {
  const observation = await recordAssetObservation({
    assetId: asset.id,
    observationType: "COST",
    source: "ASSET_TELEMETRY_ADAPTER",
    idempotencyKey: `asset-${asset.id}:telemetry-sync-${syncId}:unexpected-cost`,
    provenance: "FACT",
    amountCents: costCents,
    unit: "USD_CENTS",
    externalReference: `asset_telemetry_sync:${syncId}`,
    metadata: { provider, unauthorized_cost: true },
    observedAt: new Date(),
  });
  if (observation.created) {
    await db.update(assetsTable).set({
      externalSpendUsedCents: sql`${assetsTable.externalSpendUsedCents} + ${costCents}`,
      updatedAt: new Date(),
    }).where(eq(assetsTable.id, asset.id));
  }
}

export async function syncAssetTelemetry(
  asset: typeof assetsTable.$inferSelect,
  adapter: AssetTelemetryAdapter,
) {
  const scheduledAt = asset.nextTelemetrySyncAt ?? asset.activatedAt;
  const idempotencyKey = syncKey(asset.id, scheduledAt);
  const previous = await latestSuccessfulSync(asset.id);
  const cursorBefore = previous?.cursorAfter ?? null;
  const since = previous?.finishedAt ?? asset.activatedAt;
  const startedAt = new Date();

  if (adapter.costMode === "METERED") {
    await createTelemetryCapabilityAction(
      asset,
      "The configured telemetry backend is metered. Money Scout's generic operating-data path will not execute a metered sync until the provider exposes a verifiable per-call cost ceiling.",
    );
    await db.insert(assetTelemetrySyncsTable).values({
      assetId: asset.id,
      idempotencyKey,
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: "BLOCKED",
      cursorBefore,
      errorCode: "METERED_TELEMETRY_REQUIRES_BOUNDED_CALL_CONTRACT",
      errorMessage: "Metered telemetry is blocked because a per-call hard cost ceiling is not enforceable through this adapter contract.",
      startedAt,
      finishedAt: new Date(),
    }).onConflictDoNothing({ target: assetTelemetrySyncsTable.idempotencyKey });
    await db.update(assetsTable).set({ nextTelemetrySyncAt: nextSync(900), updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
    return { synced: false, reason: "METERED_TELEMETRY_REQUIRES_BOUNDED_CALL_CONTRACT" } as const;
  }

  try {
    const result = await adapter.collect({
      assetId: asset.id,
      assetKey: asset.assetKey,
      opportunityId: asset.opportunityId,
      productionUrl: asset.productionUrl,
      cursor: cursorBefore,
      since,
      idempotencyKey,
    });

    const [sync] = await db.insert(assetTelemetrySyncsTable).values({
      assetId: asset.id,
      idempotencyKey,
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: result.externalCostCents > 0 ? "FAILED" : "SUCCEEDED",
      cursorBefore,
      cursorAfter: result.cursor,
      coverage: result.coverage,
      observationCount: result.observations.length,
      externalCostCents: result.externalCostCents,
      errorCode: result.externalCostCents > 0 ? "ZERO_CASH_TELEMETRY_REPORTED_COST" : null,
      errorMessage: result.externalCostCents > 0 ? "A telemetry adapter configured as ZERO_CASH reported external cost." : null,
      startedAt,
      finishedAt: new Date(),
    }).onConflictDoNothing({ target: assetTelemetrySyncsTable.idempotencyKey }).returning();

    const effectiveSync = sync ?? (await db.select().from(assetTelemetrySyncsTable).where(eq(assetTelemetrySyncsTable.idempotencyKey, idempotencyKey)))[0];
    if (!effectiveSync) throw new Error("ASSET_TELEMETRY_SYNC_PERSISTENCE_FAILED");

    if (result.externalCostCents > 0) {
      await recordUnauthorizedTelemetryCost(asset, adapter.provider, effectiveSync.id, result.externalCostCents);
      await createOrReuseHumanAction({
        opportunityId: asset.opportunityId,
        actionType: "TELEMETRY_UNEXPECTED_EXTERNAL_COST",
        title: "Telemetry backend violated its zero-cash contract",
        whyNeeded: `The configured telemetry backend reported ${result.externalCostCents} cents of external cost even though it was configured ZERO_CASH. Money Scout stopped further syncs.`,
        instructions: "Review or replace the telemetry integration. Do not authorize additional spend merely to clear this incident; first establish a backend with a trustworthy bounded-cost contract.",
        blockedStage: `ASSET_TELEMETRY_COST_VIOLATION:${asset.id}`,
        requiredCapabilityKey: null,
        provider: adapter.provider,
        verificationMode: "HUMAN_ATTESTATION",
        urgency: "CRITICAL",
        resumeAction: "NO_AUTOMATIC_RESUME",
        resumePayload: { asset_id: asset.id, telemetry_sync_id: effectiveSync.id },
        inherentlyHumanAuthority: true,
      });
      await db.update(assetsTable).set({
        revenueInstrumentationStatus: "ERROR",
        costInstrumentationStatus: "ERROR",
        nextTelemetrySyncAt: nextSync(900),
        updatedAt: new Date(),
      }).where(eq(assetsTable.id, asset.id));
      return { synced: false, reason: "ZERO_CASH_TELEMETRY_REPORTED_COST" } as const;
    }

    for (const observation of result.observations) {
      await recordAssetObservation({
        assetId: asset.id,
        observationType: observation.observationType,
        source: sourceName(adapter.provider),
        idempotencyKey: observationKey(adapter.provider, asset.id, observation.eventId),
        provenance: "FACT",
        amountCents: observation.amountCents,
        quantity: observation.quantity,
        unit: observation.unit,
        externalReference: observation.externalReference ?? observation.eventId,
        metadata: {
          ...observation.metadata,
          telemetry_provider: adapter.provider,
          telemetry_sync_id: effectiveSync.id,
        },
        observedAt: observation.observedAt,
      });
    }

    const [fresh] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
    if (!fresh) throw new Error("ASSET_NOT_FOUND_AFTER_TELEMETRY");
    const revenueStatus = instrumentedStatus(fresh.revenueInstrumentationStatus, "REVENUE", result.observations, result.coverage);
    const costStatus = instrumentedStatus(fresh.costInstrumentationStatus, "COST", result.observations, result.coverage);
    const usageStatus = instrumentedStatus(fresh.usageInstrumentationStatus, "USAGE", result.observations, result.coverage);
    const supportStatus = instrumentedStatus(fresh.supportInstrumentationStatus, "SUPPORT", result.observations, result.coverage);

    await db.update(assetsTable).set({
      operatingMode: "OPERATING",
      revenueInstrumentationStatus: revenueStatus,
      costInstrumentationStatus: costStatus,
      usageInstrumentationStatus: usageStatus,
      supportInstrumentationStatus: supportStatus,
      lastTelemetrySyncAt: new Date(),
      nextTelemetrySyncAt: nextSync(telemetryIntervalSeconds()),
      operationsPolicy: { ...fresh.operationsPolicy, nextGate: "AUTONOMOUS_OPERATIONS" },
      updatedAt: new Date(),
    }).where(eq(assetsTable.id, asset.id));

    await recordAssetEvent({
      assetId: asset.id,
      opportunityId: asset.opportunityId,
      eventType: "ASSET_TELEMETRY_SYNCED",
      summary: `Authoritative operating telemetry synchronized from ${adapter.provider}.`,
      metadata: {
        telemetry_sync_id: effectiveSync.id,
        observation_count: result.observations.length,
        coverage: result.coverage,
        cursor_advanced: result.cursor !== cursorBefore,
      },
    });
    await reviewAssetEconomics({ assetId: asset.id, syncId: effectiveSync.id, coverage: result.coverage });
    await setOpportunityActivity(asset.opportunityId, {
      activeEvaluationCycleId: asset.evaluationCycleId,
      currentActivityKey: "ASSET_OPERATING",
      currentActivityLabel: "Asset operating with authoritative telemetry",
      activityStatus: "RUNNING",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: "CONTINUE MEASUREMENT, HEALTH MONITORING, AND BOUNDED REMEDIATION",
      etaBasis: "CONTINUOUS_OPERATIONS",
      lifecycleTransition: true,
    });
    return { synced: true, syncId: effectiveSync.id } as const;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown telemetry sync failure";
    await db.insert(assetTelemetrySyncsTable).values({
      assetId: asset.id,
      idempotencyKey,
      provider: adapter.provider,
      costMode: adapter.costMode,
      status: "FAILED",
      cursorBefore,
      errorCode: "ASSET_TELEMETRY_SYNC_FAILED",
      errorMessage: message.slice(0, 4_000),
      startedAt,
      finishedAt: new Date(),
    }).onConflictDoNothing({ target: assetTelemetrySyncsTable.idempotencyKey });
    await db.update(assetsTable).set({
      nextTelemetrySyncAt: nextSync(TELEMETRY_RETRY_SECONDS),
      lastErrorCode: "ASSET_TELEMETRY_SYNC_FAILED",
      lastErrorMessage: message.slice(0, 4_000),
      updatedAt: new Date(),
    }).where(eq(assetsTable.id, asset.id));
    logger.warn({ err: error, assetId: asset.id, provider: adapter.provider }, "Asset telemetry sync failed");
    return { synced: false, reason: "ASSET_TELEMETRY_SYNC_FAILED" } as const;
  }
}

async function ensureTelemetryCapability(adapter: AssetTelemetryAdapter | null) {
  if (!adapter) return;
  await setCapabilityAvailable({
    key: "ASSET_TELEMETRY_ACCESS",
    provider: adapter.provider,
    accessLevel: "AUTOMATION_READY",
    verificationMethod: "ASSET_TELEMETRY_ADAPTER_CONFIGURED",
    metadata: { cost_mode: adapter.costMode, read_only: true },
  });
  await resolveOpenActionsForCapability({
    capabilityKey: "ASSET_TELEMETRY_ACCESS",
    resolutionData: { detected_automatically: true, provider: adapter.provider, read_only: true },
  });
}

async function nextDueAsset() {
  const now = new Date();
  const [asset] = await db
    .select()
    .from(assetsTable)
    .where(and(
      inArray(assetsTable.status, ["ACTIVE", "DEGRADED"]),
      or(isNull(assetsTable.nextTelemetrySyncAt), lte(assetsTable.nextTelemetrySyncAt, now)),
    ))
    .orderBy(asc(assetsTable.nextTelemetrySyncAt), asc(assetsTable.id))
    .limit(1);
  return asset ?? null;
}

export async function runAssetEconomicsTick(
  adapterOverride?: AssetTelemetryAdapter | null,
): Promise<{ assetId: number | null; synced: boolean; reason?: string }> {
  const adapter = adapterOverride === undefined ? configuredAssetTelemetryAdapter() : adapterOverride;
  await ensureTelemetryCapability(adapter);
  const asset = await nextDueAsset();
  if (!asset) return { assetId: null, synced: false };

  if (!asset.operationsPolicy.allowTelemetryIngestion) {
    await db.update(assetsTable).set({ nextTelemetrySyncAt: nextSync(telemetryIntervalSeconds()), updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
    return { assetId: asset.id, synced: false, reason: "TELEMETRY_DISABLED_BY_POLICY" };
  }
  if (!adapter) {
    await createTelemetryCapabilityAction(asset, "Money Scout cannot distinguish real operating revenue/cost/usage from unknowns until a read-only provider telemetry bridge is connected.");
    await db.update(assetsTable).set({ nextTelemetrySyncAt: nextSync(900), updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
    return { assetId: asset.id, synced: false, reason: "ASSET_TELEMETRY_ACCESS_REQUIRED" };
  }

  const result = await syncAssetTelemetry(asset, adapter);
  if (result.synced) return { assetId: asset.id, synced: true };
  return { assetId: asset.id, synced: false, reason: result.reason };
}

export function startAssetEconomicsWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runAssetEconomicsTick();
    } catch (error) {
      logger.error({ err: error }, "Asset economics worker tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void tick();
  timer = setInterval(() => void tick(), workerIntervalMs());
  timer.unref?.();
  logger.info({ intervalMs: workerIntervalMs() }, "Asset economics worker started");
}

export function stopAssetEconomicsWorkerForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  tickRunning = false;
}
