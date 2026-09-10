import { and, asc, eq, inArray } from "drizzle-orm";
import {
  assetsTable,
  betCostAttributionsTable,
  betEventsTable,
  betsTable,
  buildJobsTable,
  db,
  releaseJobsTable,
  type BetStatus,
} from "@workspace/db";
import { reconcileResourceEnvelope, type BetCostSource } from "./bet-kernel";
import { logger } from "./logger";

const DEFAULT_INTERVAL_MS = 5_000;
let timer: NodeJS.Timeout | null = null;
let running = false;

async function loadSources(betId: number): Promise<BetCostSource[]> {
  const builds = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.betId, betId));
  const buildIds = builds.map((row) => row.id);
  const releases = buildIds.length
    ? await db
        .select()
        .from(releaseJobsTable)
        .where(inArray(releaseJobsTable.buildJobId, buildIds))
    : [];
  const assets = buildIds.length
    ? await db
        .select()
        .from(assetsTable)
        .where(inArray(assetsTable.buildJobId, buildIds))
    : [];
  return [
    ...builds.map((row) => ({
      sourceType: "BUILD" as const,
      sourceId: row.id,
      bucket: "build" as const,
      committedCents: row.externalSpendCeilingCents,
      consumedCents: row.externalSpendUsedCents,
      updatedAt: row.updatedAt,
    })),
    ...releases.map((row) => ({
      sourceType: "RELEASE" as const,
      sourceId: row.id,
      bucket: "release" as const,
      committedCents: row.externalSpendCeilingCents,
      consumedCents: row.externalSpendUsedCents,
      updatedAt: row.updatedAt,
    })),
    ...assets.map((row) => ({
      sourceType: "ASSET_OPERATIONS" as const,
      sourceId: row.id,
      bucket: "operations" as const,
      committedCents: row.authorities.externalSpendCeilingCents,
      consumedCents: row.externalSpendUsedCents,
      updatedAt: row.updatedAt,
    })),
  ];
}

export async function reconcileBet(betId: number) {
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, betId));
  if (!bet) return null;
  const now = new Date();
  const sources = await loadSources(bet.id);
  for (const source of sources) {
    await db
      .insert(betCostAttributionsTable)
      .values({
        betId: bet.id,
        sourceType: source.sourceType,
        sourceId: source.sourceId,
        resourceBucket: source.bucket.toUpperCase(),
        committedCents: source.committedCents,
        consumedCents: source.consumedCents,
        sourceUpdatedAt: source.updatedAt,
        reconciledAt: now,
      })
      .onConflictDoUpdate({
        target: [
          betCostAttributionsTable.betId,
          betCostAttributionsTable.sourceType,
          betCostAttributionsTable.sourceId,
        ],
        set: {
          resourceBucket: source.bucket.toUpperCase(),
          committedCents: source.committedCents,
          consumedCents: source.consumedCents,
          sourceUpdatedAt: source.updatedAt,
          reconciledAt: now,
        },
      });
  }
  const reconciliation = reconcileResourceEnvelope(
    bet.resourceEnvelope,
    sources,
    now,
  );
  const committed = reconciliation.envelope.externalCash.committed;
  const consumed = reconciliation.envelope.externalCash.consumed;
  const remaining = reconciliation.envelope.externalCash.remaining;
  const protectedTerminal =
    bet.status === "SUCCEEDED" || bet.status === "WITHDRAWN";
  const status: BetStatus =
    reconciliation.exhausted && !protectedTerminal ? "EXHAUSTED" : bet.status;
  const changed =
    bet.committedExternalCashCents !== committed ||
    bet.consumedExternalCashCents !== consumed ||
    bet.remainingExternalCashCents !== remaining ||
    bet.status !== status;
  const [updated] = await db
    .update(betsTable)
    .set({
      resourceEnvelope: reconciliation.envelope,
      committedExternalCashCents: committed,
      consumedExternalCashCents: consumed,
      remainingExternalCashCents: remaining,
      status,
      blockerCode:
        status === "EXHAUSTED"
          ? "BET_RESOURCE_ENVELOPE_EXHAUSTED"
          : bet.blockerCode,
      nextAction:
        status === "EXHAUSTED"
          ? "Stop downstream work; explicitly revise and reapprove the Bet or withdraw it."
          : bet.nextAction,
      updatedAt: now,
    })
    .where(eq(betsTable.id, bet.id))
    .returning();
  if (status === "EXHAUSTED") {
    await db
      .update(buildJobsTable)
      .set({
        status: "BLOCKED",
        blockedReason: "BET_RESOURCE_ENVELOPE_EXHAUSTED",
        updatedAt: now,
      })
      .where(
        and(
          eq(buildJobsTable.betId, bet.id),
          inArray(buildJobsTable.status, [
            "READY_FOR_BUILDER",
            "BUILDER_DISPATCHED",
            "BUILDING",
            "QA_PENDING",
          ]),
        ),
      );
    const buildIds = sources
      .filter((source) => source.sourceType === "BUILD")
      .map((source) => source.sourceId);
    if (buildIds.length) {
      await db
        .update(releaseJobsTable)
        .set({
          status: "BLOCKED",
          blockedReason: "BET_RESOURCE_ENVELOPE_EXHAUSTED",
          lastErrorCode: "BET_RESOURCE_ENVELOPE_EXHAUSTED",
          lastErrorMessage:
            "Release stopped before another provider side effect because its Bet allocation is exhausted.",
          updatedAt: now,
        })
        .where(
          and(
            inArray(releaseJobsTable.buildJobId, buildIds),
            inArray(releaseJobsTable.status, [
              "READY_FOR_PREVIEW",
              "PREVIEW_READY",
              "WAITING_FOR_PUBLIC_AUTHORITY",
            ]),
          ),
        );
    }
  }
  if (changed && updated) {
    await db.insert(betEventsTable).values({
      betId: bet.id,
      opportunityId: bet.opportunityId,
      eventType:
        status === "EXHAUSTED" && bet.status !== "EXHAUSTED"
          ? "BET_EXHAUSTED"
          : "BET_RESOURCES_RECONCILED",
      summary:
        status === "EXHAUSTED"
          ? "Downstream commitment or consumption reached the Bet envelope; further work is stopped."
          : "Bet resource usage reconciled from authoritative downstream records.",
      metadata: {
        committed_cents: committed,
        consumed_cents: consumed,
        remaining_cents: remaining,
        source_count: sources.length,
      },
      occurredAt: now,
    });
  }
  return { bet: updated, sources, changed };
}

export async function runBetReconciliationWorkerTick(): Promise<{
  reconciled: number;
}> {
  if (running) return { reconciled: 0 };
  running = true;
  try {
    const bets = await db
      .select({ id: betsTable.id })
      .from(betsTable)
      .where(
        and(
          inArray(betsTable.status, [
            "APPROVED",
            "ACTIVE",
            "PAUSED",
            "EXHAUSTED",
          ]),
        ),
      )
      .orderBy(asc(betsTable.id))
      .limit(25);
    for (const bet of bets) await reconcileBet(bet.id);
    return { reconciled: bets.length };
  } finally {
    running = false;
  }
}

export function startBetReconciliationWorker(): void {
  if (timer) return;
  const configured = Number(
    process.env.MONEY_SCOUT_BET_RECONCILIATION_MS ?? "",
  );
  const interval =
    Number.isFinite(configured) && configured >= 1_000
      ? configured
      : DEFAULT_INTERVAL_MS;
  timer = setInterval(
    () =>
      void runBetReconciliationWorkerTick().catch((error) =>
        logger.error({ err: error }, "Bet reconciliation tick failed"),
      ),
    interval,
  );
  timer.unref();
  void runBetReconciliationWorkerTick().catch((error) =>
    logger.error({ err: error }, "Initial Bet reconciliation failed"),
  );
}
