import { and, asc, eq, inArray, lte, sql } from "drizzle-orm";
import {
  assetEventsTable,
  assetHealthChecksTable,
  assetIncidentsTable,
  assetObservationsTable,
  assetsTable,
  buildJobsTable,
  db,
  opportunitiesTable,
  releaseJobsTable,
  type AssetHealthStatus,
  type AssetObservationProvenance,
  type AssetObservationType,
  type PersistedAssetAuthorities,
  type PersistedAssetOperationsPolicy,
  type ReleaseTargetKind,
} from "@workspace/db";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";

const DEFAULT_WORKER_INTERVAL_MS = 10_000;
const MIN_WORKER_INTERVAL_MS = 2_000;
const DEFAULT_HEALTH_INTERVAL_SECONDS = 300;
const DEFAULT_UNHEALTHY_THRESHOLD = 3;
const HEALTH_TIMEOUT_MS = 8_000;
let timer: NodeJS.Timeout | null = null;
let tickRunning = false;

function workerIntervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_ASSET_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_WORKER_INTERVAL_MS
    ? configured
    : DEFAULT_WORKER_INTERVAL_MS;
}

function healthIntervalSeconds(): number {
  const configured = Number(process.env.MONEY_SCOUT_ASSET_HEALTH_INTERVAL_SECONDS ?? "");
  return Number.isFinite(configured) && configured >= 60
    ? Math.floor(configured)
    : DEFAULT_HEALTH_INTERVAL_SECONDS;
}

export function assetKeyForOpportunity(opportunityId: number): string {
  return `opportunity-${opportunityId}:asset-v1`;
}

export function targetSupportsHttpHealthProbe(targetKind: ReleaseTargetKind): boolean {
  return targetKind === "HOSTED_WEB" || targetKind === "HOSTED_API";
}

function defaultAuthorities(): PersistedAssetAuthorities {
  return {
    schemaVersion: 1,
    publicReleaseAuthorized: true,
    customerChargingAuthorized: false,
    outboundAuthorized: false,
    advertisingAuthorized: false,
    customDomainAuthorized: false,
    productionCredentialsAuthorized: false,
    externalSpendCeilingCents: 0,
  };
}

function defaultOperationsPolicy(): PersistedAssetOperationsPolicy {
  return {
    schemaVersion: 1,
    healthCheckIntervalSeconds: healthIntervalSeconds(),
    unhealthyAfterConsecutiveFailures: DEFAULT_UNHEALTHY_THRESHOLD,
    allowReadOnlyHealthChecks: true,
    allowTelemetryIngestion: true,
    allowExternalSpend: false,
    allowCustomerCharging: false,
    allowOutbound: false,
    allowAdvertising: false,
    autoKill: false,
    nextGate: "MONETIZATION_AND_OPERATIONS_INSTRUMENTATION",
  };
}

async function recordAssetEvent(input: {
  assetId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(assetEventsTable).values({
    assetId: input.assetId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

export async function recordAssetObservation(input: {
  assetId: number;
  observationType: AssetObservationType;
  source: string;
  idempotencyKey: string;
  provenance: AssetObservationProvenance;
  amountCents?: number | null;
  quantity?: number | null;
  unit?: string | null;
  externalReference?: string | null;
  metadata?: Record<string, unknown>;
  observedAt: Date;
}) {
  if (!Number.isInteger(input.assetId) || input.assetId <= 0) throw new Error("INVALID_ASSET_ID");
  if (!input.idempotencyKey.trim()) throw new Error("OBSERVATION_IDEMPOTENCY_KEY_REQUIRED");
  if ((input.observationType === "REVENUE" || input.observationType === "COST") &&
      (!Number.isInteger(input.amountCents) || Number(input.amountCents) < 0)) {
    throw new Error("NONNEGATIVE_AMOUNT_CENTS_REQUIRED");
  }
  if (input.observationType === "TRANSACTION" && input.quantity != null &&
      (!Number.isInteger(input.quantity) || input.quantity <= 0)) {
    throw new Error("POSITIVE_TRANSACTION_QUANTITY_REQUIRED");
  }

  return db.transaction(async (tx) => {
    const [asset] = await tx.select().from(assetsTable).where(eq(assetsTable.id, input.assetId));
    if (!asset) throw new Error("ASSET_NOT_FOUND");

    const [created] = await tx
      .insert(assetObservationsTable)
      .values({
        assetId: input.assetId,
        observationType: input.observationType,
        source: input.source.slice(0, 200),
        idempotencyKey: input.idempotencyKey.slice(0, 500),
        provenance: input.provenance,
        amountCents: input.amountCents ?? null,
        quantity: input.quantity ?? null,
        unit: input.unit?.slice(0, 100) ?? null,
        externalReference: input.externalReference?.slice(0, 500) ?? null,
        metadata: input.metadata ?? {},
        observedAt: input.observedAt,
      })
      .onConflictDoNothing({ target: assetObservationsTable.idempotencyKey })
      .returning();

    if (!created) {
      const [existing] = await tx
        .select()
        .from(assetObservationsTable)
        .where(eq(assetObservationsTable.idempotencyKey, input.idempotencyKey));
      return { observation: existing ?? null, created: false };
    }

    if (input.provenance === "FACT") {
      const updates: Record<string, unknown> = { updatedAt: new Date() };
      if (input.observationType === "REVENUE") {
        updates.totalObservedRevenueCents = sql`${assetsTable.totalObservedRevenueCents} + ${input.amountCents ?? 0}`;
        updates.revenueInstrumentationStatus = "INSTRUMENTED";
      } else if (input.observationType === "COST") {
        updates.totalObservedCostCents = sql`${assetsTable.totalObservedCostCents} + ${input.amountCents ?? 0}`;
        updates.costInstrumentationStatus = "INSTRUMENTED";
      } else if (input.observationType === "TRANSACTION") {
        updates.totalObservedTransactions = sql`${assetsTable.totalObservedTransactions} + ${input.quantity ?? 1}`;
      } else if (input.observationType === "USAGE") {
        updates.usageInstrumentationStatus = "INSTRUMENTED";
      } else if (input.observationType === "SUPPORT") {
        updates.supportInstrumentationStatus = "INSTRUMENTED";
      }
      await tx.update(assetsTable).set(updates).where(eq(assetsTable.id, input.assetId));
    }

    await tx.insert(assetEventsTable).values({
      assetId: input.assetId,
      opportunityId: asset.opportunityId,
      eventType: "ASSET_OBSERVATION_INGESTED",
      summary: `${input.observationType} operating observation ingested with ${input.provenance} provenance.`,
      metadata: {
        observation_id: created.id,
        observation_type: input.observationType,
        provenance: input.provenance,
        source: input.source,
      },
    });

    return { observation: created, created: true };
  });
}

async function recordActivationCosts(assetId: number, release: typeof releaseJobsTable.$inferSelect): Promise<void> {
  const [build] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, release.buildJobId));
  if (build && build.externalSpendUsedCents > 0) {
    await recordAssetObservation({
      assetId,
      observationType: "COST",
      source: "BUILD_ACCOUNTING",
      idempotencyKey: `asset-${assetId}:build-${build.id}:external-cost`,
      provenance: "FACT",
      amountCents: build.externalSpendUsedCents,
      unit: "USD_CENTS",
      externalReference: `build_job:${build.id}`,
      metadata: { build_job_id: build.id },
      observedAt: build.finishedAt ?? build.updatedAt,
    });
  }
  if (release.externalSpendUsedCents > 0) {
    await recordAssetObservation({
      assetId,
      observationType: "COST",
      source: "CONTROLLED_RELEASE",
      idempotencyKey: `asset-${assetId}:release-${release.id}:external-cost`,
      provenance: "FACT",
      amountCents: release.externalSpendUsedCents,
      unit: "USD_CENTS",
      externalReference: `release_job:${release.id}`,
      metadata: { release_job_id: release.id },
      observedAt: release.finishedAt ?? release.updatedAt,
    });
  }
}

export async function activateAssetsFromCompletedReleases(): Promise<number> {
  const releases = await db
    .select()
    .from(releaseJobsTable)
    .where(and(
      eq(releaseJobsTable.status, "COMPLETE"),
      eq(releaseJobsTable.productionVisibility, "PUBLIC"),
      eq(releaseJobsTable.productionHealthPassed, true),
    ))
    .orderBy(asc(releaseJobsTable.id))
    .limit(100);

  let activated = 0;
  for (const release of releases) {
    if (!release.productionUrl) continue;
    const [existing] = await db
      .select()
      .from(assetsTable)
      .where(eq(assetsTable.opportunityId, release.opportunityId));

    if (existing) {
      if (release.id > existing.currentReleaseJobId) {
        await db.update(assetsTable).set({
          currentReleaseJobId: release.id,
          buildJobId: release.buildJobId,
          evaluationCycleId: release.evaluationCycleId,
          productShape: release.productShape,
          targetKind: release.targetKind,
          productionUrl: release.productionUrl,
          repositoryUrl: release.plan.artifact.repositoryUrl,
          branchName: release.plan.artifact.branchName,
          releaseProvider: release.releaseProvider,
          healthStatus: targetSupportsHttpHealthProbe(release.targetKind) ? "UNKNOWN" : "NOT_APPLICABLE",
          consecutiveHealthFailures: 0,
          nextHealthCheckAt: targetSupportsHttpHealthProbe(release.targetKind) ? new Date() : null,
          nextTelemetrySyncAt: new Date(),
          lastErrorCode: null,
          lastErrorMessage: null,
          updatedAt: new Date(),
        }).where(eq(assetsTable.id, existing.id));
        await recordAssetEvent({
          assetId: existing.id,
          opportunityId: existing.opportunityId,
          eventType: "ASSET_RELEASE_UPDATED",
          summary: "A newer QA-passed, publicly verified release became the Asset's current release.",
          metadata: { release_job_id: release.id, production_url: release.productionUrl },
        });
        await recordActivationCosts(existing.id, release);
      }
      continue;
    }

    const [opportunity] = await db
      .select({ name: opportunitiesTable.name })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, release.opportunityId));
    if (!opportunity) continue;

    const supportsProbe = targetSupportsHttpHealthProbe(release.targetKind);
    const [asset] = await db.insert(assetsTable).values({
      assetKey: assetKeyForOpportunity(release.opportunityId),
      opportunityId: release.opportunityId,
      activationReleaseJobId: release.id,
      currentReleaseJobId: release.id,
      buildJobId: release.buildJobId,
      evaluationCycleId: release.evaluationCycleId,
      nameSnapshot: opportunity.name,
      productShape: release.productShape,
      targetKind: release.targetKind,
      productionUrl: release.productionUrl,
      repositoryUrl: release.plan.artifact.repositoryUrl,
      branchName: release.plan.artifact.branchName,
      releaseProvider: release.releaseProvider,
      status: "ACTIVE",
      operatingMode: "MONITOR_ONLY",
      healthStatus: supportsProbe ? "UNKNOWN" : "NOT_APPLICABLE",
      authorities: defaultAuthorities(),
      operationsPolicy: defaultOperationsPolicy(),
      nextHealthCheckAt: supportsProbe ? new Date() : null,
      nextTelemetrySyncAt: new Date(),
    }).onConflictDoNothing({ target: assetsTable.opportunityId }).returning();
    if (!asset) continue;

    activated += 1;
    await recordActivationCosts(asset.id, release);
    await recordAssetEvent({
      assetId: asset.id,
      opportunityId: asset.opportunityId,
      eventType: "ASSET_ACTIVATED",
      summary: "Verified public release became a first-class operating Asset in monitor-only mode.",
      metadata: {
        activation_release_job_id: release.id,
        production_url: release.productionUrl,
        target_kind: release.targetKind,
        commercial_authorities: asset.authorities,
      },
    });
    await recordLifecycleEvent({
      opportunityId: asset.opportunityId,
      evaluationCycleId: asset.evaluationCycleId,
      eventType: "ASSET_ACTIVATED",
      summary: "Publicly verified product is now an operating Asset with bounded monitoring authority.",
      metadata: { asset_id: asset.id, release_job_id: release.id, operating_mode: "MONITOR_ONLY" },
    });
    await db.update(opportunitiesTable).set({ status: "ASSET_ACTIVE" }).where(eq(opportunitiesTable.id, asset.opportunityId));
    await setOpportunityActivity(asset.opportunityId, {
      activeEvaluationCycleId: asset.evaluationCycleId,
      currentActivityKey: "ASSET_MONITORING",
      currentActivityLabel: "Operating Asset under autonomous monitoring",
      activityStatus: "RUNNING",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: "INSTRUMENT REVENUE, COST, USAGE, SUPPORT, AND COMMERCIAL OPERATIONS",
      etaBasis: "CONTINUOUS_OPERATIONS",
      lifecycleTransition: true,
    });
  }
  return activated;
}

function outageIncidentKey(asset: typeof assetsTable.$inferSelect): string {
  const anchor = asset.lastHealthyAt ?? asset.activatedAt;
  return `asset-${asset.id}:availability-outage:${anchor.getTime()}`;
}

async function resolveAvailabilityIncident(asset: typeof assetsTable.$inferSelect): Promise<void> {
  const [open] = await db
    .select()
    .from(assetIncidentsTable)
    .where(and(
      eq(assetIncidentsTable.assetId, asset.id),
      eq(assetIncidentsTable.incidentType, "AVAILABILITY"),
      eq(assetIncidentsTable.status, "OPEN"),
    ));
  if (!open) return;
  const now = new Date();
  await db.update(assetIncidentsTable).set({ status: "RESOLVED", resolvedAt: now, updatedAt: now }).where(eq(assetIncidentsTable.id, open.id));
  await recordAssetEvent({
    assetId: asset.id,
    opportunityId: asset.opportunityId,
    eventType: "ASSET_INCIDENT_RESOLVED",
    summary: "Availability incident resolved after a healthy autonomous probe.",
    metadata: { incident_id: open.id },
  });
  await recordLifecycleEvent({
    opportunityId: asset.opportunityId,
    evaluationCycleId: asset.evaluationCycleId,
    eventType: "ASSET_HEALTH_RECOVERED",
    summary: "Operating Asset recovered to healthy status.",
    metadata: { asset_id: asset.id, incident_id: open.id },
  });
}

async function openAvailabilityIncident(
  asset: typeof assetsTable.$inferSelect,
  evidence: Record<string, unknown>,
): Promise<void> {
  const now = new Date();
  const [existingOpen] = await db
    .select()
    .from(assetIncidentsTable)
    .where(and(
      eq(assetIncidentsTable.assetId, asset.id),
      eq(assetIncidentsTable.incidentType, "AVAILABILITY"),
      eq(assetIncidentsTable.status, "OPEN"),
    ));
  if (existingOpen) {
    await db.update(assetIncidentsTable).set({ evidence, updatedAt: now }).where(eq(assetIncidentsTable.id, existingOpen.id));
    return;
  }

  const key = outageIncidentKey(asset);
  const [incident] = await db.insert(assetIncidentsTable).values({
    assetId: asset.id,
    incidentKey: key,
    incidentType: "AVAILABILITY",
    severity: "HIGH",
    status: "OPEN",
    summary: `Asset failed ${asset.operationsPolicy.unhealthyAfterConsecutiveFailures} consecutive autonomous health probes.`,
    evidence,
    detectedAt: now,
    updatedAt: now,
  }).onConflictDoUpdate({
    target: assetIncidentsTable.incidentKey,
    set: { status: "OPEN", severity: "HIGH", evidence, resolvedAt: null, detectedAt: now, updatedAt: now },
  }).returning();

  await recordAssetEvent({
    assetId: asset.id,
    opportunityId: asset.opportunityId,
    eventType: "ASSET_INCIDENT_OPEN",
    summary: "Repeated health failures opened a durable availability incident; Money Scout did not auto-kill or spend money.",
    metadata: { incident_id: incident?.id, ...evidence },
  });
  await recordLifecycleEvent({
    opportunityId: asset.opportunityId,
    evaluationCycleId: asset.evaluationCycleId,
    eventType: "ASSET_HEALTH_INCIDENT",
    summary: "Asset is unhealthy after repeated read-only health checks; bounded autonomous remediation is eligible when zero-cash repair/QA/release capabilities are available.",
    metadata: { asset_id: asset.id, incident_id: incident?.id, ...evidence },
  });
  await db.update(opportunitiesTable).set({ status: "ASSET_DEGRADED" }).where(eq(opportunitiesTable.id, asset.opportunityId));
  await setOpportunityActivity(asset.opportunityId, {
    activeEvaluationCycleId: asset.evaluationCycleId,
    currentActivityKey: "ASSET_INCIDENT_OPEN",
    currentActivityLabel: "Asset availability incident detected",
    activityStatus: "RUNNING",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction: "RUN BOUNDED AUTONOMOUS REMEDIATION OR SURFACE THE EXACT MISSING CAPABILITY",
    etaBasis: "AUTONOMOUS_REMEDIATION",
    lifecycleTransition: true,
  });
}

export async function probeAssetHealth(
  asset: typeof assetsTable.$inferSelect,
  fetchImpl: typeof fetch = fetch,
): Promise<AssetHealthStatus> {
  if (!targetSupportsHttpHealthProbe(asset.targetKind) || !asset.operationsPolicy.allowReadOnlyHealthChecks) {
    if (asset.healthStatus !== "NOT_APPLICABLE" || asset.nextHealthCheckAt) {
      await db.update(assetsTable).set({ healthStatus: "NOT_APPLICABLE", nextHealthCheckAt: null, updatedAt: new Date() }).where(eq(assetsTable.id, asset.id));
    }
    return "NOT_APPLICABLE";
  }

  const started = Date.now();
  let status: AssetHealthStatus = "UNHEALTHY";
  let reachable = false;
  let httpStatus: number | null = null;
  let errorCode: string | null = null;
  let errorMessage: string | null = null;

  try {
    const response = await fetchImpl(asset.productionUrl, {
      method: "GET",
      redirect: "follow",
      headers: { "user-agent": "money-scout-asset-health/1.0" },
      signal: AbortSignal.timeout(HEALTH_TIMEOUT_MS),
    });
    httpStatus = response.status;
    reachable = true;
    status = response.status < 400 ? "HEALTHY" : response.status < 500 ? "DEGRADED" : "UNHEALTHY";
    try { await response.body?.cancel(); } catch { /* best effort */ }
  } catch (error) {
    errorCode = error instanceof Error && error.name ? error.name : "HEALTH_PROBE_FAILED";
    errorMessage = error instanceof Error ? error.message.slice(0, 1_000) : "Health probe failed";
  }

  const now = new Date();
  const latencyMs = Date.now() - started;
  const unhealthy = status === "UNHEALTHY";
  const failureCount = unhealthy ? asset.consecutiveHealthFailures + 1 : 0;
  const nextHealthCheckAt = new Date(now.getTime() + asset.operationsPolicy.healthCheckIntervalSeconds * 1_000);
  const nextAssetStatus = status === "HEALTHY" ? "ACTIVE" : "DEGRADED";

  await db.transaction(async (tx) => {
    await tx.insert(assetHealthChecksTable).values({
      assetId: asset.id,
      status,
      probeKind: "HTTP_GET_READ_ONLY",
      url: asset.productionUrl,
      reachable,
      httpStatus,
      latencyMs,
      errorCode,
      errorMessage,
      checkedAt: now,
    });
    await tx.update(assetsTable).set({
      status: asset.status === "PAUSED" || asset.status === "KILLED" || asset.status === "ARCHIVED" ? asset.status : nextAssetStatus,
      healthStatus: status,
      consecutiveHealthFailures: failureCount,
      lastHealthCheckAt: now,
      nextHealthCheckAt,
      lastHealthyAt: status === "HEALTHY" ? now : asset.lastHealthyAt,
      lastErrorCode: unhealthy ? (errorCode ?? (httpStatus ? `HTTP_${httpStatus}` : "ASSET_UNHEALTHY")) : null,
      lastErrorMessage: unhealthy ? (errorMessage ?? `Health probe returned HTTP ${httpStatus}`) : null,
      updatedAt: now,
    }).where(eq(assetsTable.id, asset.id));
  });

  if (status === "HEALTHY") {
    await resolveAvailabilityIncident(asset);
    if (asset.healthStatus !== "HEALTHY") {
      await recordAssetEvent({ assetId: asset.id, opportunityId: asset.opportunityId, eventType: "ASSET_HEALTHY", summary: "Autonomous read-only probe verified the Asset is healthy.", metadata: { http_status: httpStatus, latency_ms: latencyMs } });
      await db.update(opportunitiesTable).set({ status: "ASSET_ACTIVE" }).where(eq(opportunitiesTable.id, asset.opportunityId));
      await setOpportunityActivity(asset.opportunityId, {
        activeEvaluationCycleId: asset.evaluationCycleId,
        currentActivityKey: "ASSET_MONITORING",
        currentActivityLabel: "Operating Asset is healthy",
        activityStatus: "RUNNING",
        activityStartedAt: now,
        expectedDurationSeconds: null,
        nextAction: "CONTINUE OPERATIONS AND COLLECT ATTRIBUTABLE ECONOMIC SIGNALS",
        etaBasis: "CONTINUOUS_OPERATIONS",
        lifecycleTransition: true,
      });
    }
  } else if (unhealthy && failureCount >= asset.operationsPolicy.unhealthyAfterConsecutiveFailures) {
    await openAvailabilityIncident(asset, { http_status: httpStatus, reachable, latency_ms: latencyMs, failure_count: failureCount, error_code: errorCode });
  } else if (status !== asset.healthStatus) {
    await recordAssetEvent({ assetId: asset.id, opportunityId: asset.opportunityId, eventType: "ASSET_HEALTH_CHANGED", summary: `Asset health changed from ${asset.healthStatus} to ${status}.`, metadata: { http_status: httpStatus, latency_ms: latencyMs, failure_count: failureCount } });
  }
  return status;
}

async function checkOneDueAsset(): Promise<boolean> {
  const now = new Date();
  const [asset] = await db
    .select()
    .from(assetsTable)
    .where(and(
      inArray(assetsTable.status, ["ACTIVE", "DEGRADED"]),
      lte(assetsTable.nextHealthCheckAt, now),
    ))
    .orderBy(asc(assetsTable.nextHealthCheckAt), asc(assetsTable.id))
    .limit(1);
  if (!asset) return false;
  await probeAssetHealth(asset);
  return true;
}

export async function runAssetOperationsTick(): Promise<{ activated: number; checked: boolean }> {
  const activated = await activateAssetsFromCompletedReleases();
  const checked = await checkOneDueAsset();
  return { activated, checked };
}

export function startAssetOperationsWorker(): void {
  if (timer) return;
  const run = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runAssetOperationsTick();
    } catch (error) {
      logger.error({ err: error }, "Asset operations tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void run();
  timer = setInterval(() => void run(), workerIntervalMs());
  timer.unref?.();
  logger.info({ intervalMs: workerIntervalMs() }, "Asset operations worker started");
}
