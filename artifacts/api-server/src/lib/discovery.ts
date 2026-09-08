import { createHash } from "node:crypto";
import { and, desc, eq, inArray, lt, notInArray, sql } from "drizzle-orm";
import {
  db,
  discoveryActorObservationsTable,
  discoveryActorsTable,
  discoveryCandidatesTable,
  discoveryClusterSnapshotsTable,
  discoveryRunsTable,
} from "@workspace/db";
import { logger } from "./logger";

export type DiscoveryAnomalyType =
  | "HIGH_USAGE_THIN_SUPPLY"
  | "HIGH_USAGE_CONCENTRATED"
  | "HIGH_USAGE_FRAGMENTED"
  | "EMERGING_CLUSTER"
  | "MATERIAL_SNAPSHOT_CHANGE";

export const DISCOVERY_PAGE_SIZE = 1_000;
export const DISCOVERY_PACING_MS = 500;
export const DISCOVERY_MAX_RETRIES = 3;
export const DISCOVERY_FORMULA_VERSION = "discovery-v0.1";
export const DISCOVERY_HEARTBEAT_STALE_MS = 2 * 60 * 1_000;
export const DISCOVERY_DETAILED_RUN_RETENTION = 30;
export const DISCOVERY_STORE_URL = "https://api.apify.com/v2/store";

type JsonObject = Record<string, unknown>;

export interface NormalizedActor {
  actorKey: string;
  actorId: string | null;
  username: string;
  name: string;
  title: string;
  url: string;
  description: string;
  categories: string[];
  platformMatches: string[];
  sourcePlatform: string;
  categoryKeys: string[];
  totalUsers: number;
  totalUsers7Days: number;
  totalUsers30Days: number;
  totalUsers90Days: number;
  totalRuns: number;
  totalBuilds: number;
  lastRunStartedAt: Date | null;
  actorReviewCount: number | null;
  actorReviewRating: number | null;
  bookmarkCount: number | null;
  pricingModel: string | null;
  minimalMaxTotalChargeUsd: number | null;
  metadataHash: string;
  selectedRaw: JsonObject;
}

export interface StorePage {
  total: number;
  offset: number;
  limit: number;
  items: unknown[];
}

export interface TraversalProgress {
  offset: number;
  total: number;
  pagesFetched: number;
  requestCount: number;
  retryCount: number;
  uniqueActorCount: number;
  duplicateActorCount: number;
}

export interface TraversalSuccess {
  ok: true;
  total: number;
  pages: StorePage[];
  actors: NormalizedActor[];
  progress: TraversalProgress;
}

export interface TraversalFailure {
  ok: false;
  error: string;
  pages: StorePage[];
  actors: NormalizedActor[];
  progress: TraversalProgress;
}

export type TraversalResult = TraversalSuccess | TraversalFailure;

export interface TraversalOptions {
  fetchPage: (offset: number, limit: number) => Promise<StorePage>;
  sleep?: (milliseconds: number) => Promise<void>;
  pacingMs?: number;
  pageSize?: number;
  maxRetries?: number;
  onProgress?: (progress: TraversalProgress) => Promise<void>;
}

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const textValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const numberValue = (value: unknown, fallback = 0) => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && Number.isFinite(Number(value))) return Number(value);
  return fallback;
};

const firstDefined = (...values: unknown[]) => values.find((value) => value != null);

const getPath = (object: unknown, paths: string[][]) => {
  for (const path of paths) {
    let value: unknown = object;
    for (const part of path) {
      if (!value || typeof value !== "object") {
        value = undefined;
        break;
      }
      value = (value as JsonObject)[part];
    }
    if (value != null) return value;
  }
  return undefined;
};

const normalizeList = (value: unknown) =>
  Array.isArray(value)
    ? value
        .map((item) => (typeof item === "string" ? item.trim().toLowerCase() : ""))
        .filter(Boolean)
    : [];

const sha256 = (value: string) => createHash("sha256").update(value).digest("hex");

const parseDate = (value: unknown) => {
  if (typeof value !== "string" && !(value instanceof Date)) return null;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export function normalizeActor(raw: unknown): NormalizedActor | null {
  if (!raw || typeof raw !== "object") return null;
  const actor = raw as JsonObject;
  const username = textValue(firstDefined(actor.username, getPath(actor, [["user", "username"]])));
  const name = textValue(actor.name, username);
  if (!username && !name) return null;

  const normalizedUsername = (username || name).toLowerCase().replace(/\s+/g, "-");
  const title = textValue(firstDefined(actor.title, actor.name), normalizedUsername);
  const categories = normalizeList(firstDefined(actor.categories, actor.category));
  const platformMatches = normalizeList(
    firstDefined(actor.platforms, actor.platform, getPath(actor, [["stats", "platforms"]])),
  );
  const sourcePlatform = platformMatches[0] ?? "apify";
  const categoryKeys = categories.length > 0 ? categories : ["uncategorized"];
  const actorId = textValue(firstDefined(actor.id, actor.actorId), "") || null;
  const url =
    textValue(firstDefined(actor.url, actor.storeUrl), "") ||
    `https://apify.com/${normalizedUsername}`;
  const description = textValue(firstDefined(actor.description, actor.readme), "");
  const stats = (actor.stats as JsonObject | undefined) ?? {};
  const users = numberValue(firstDefined(stats.totalUsers, actor.totalUsers));
  const users7Days = numberValue(
    firstDefined(stats.totalUsers7Days, stats.totalUsersLast7Days, actor.totalUsers7Days),
  );
  const users30Days = numberValue(
    firstDefined(stats.totalUsers30Days, stats.totalUsersLast30Days, actor.totalUsers30Days, users),
  );
  const users90Days = numberValue(
    firstDefined(stats.totalUsers90Days, stats.totalUsersLast90Days, actor.totalUsers90Days, users30Days),
  );
  const selectedRaw: JsonObject = {
    id: actorId,
    username: normalizedUsername,
    name,
    title,
    url,
    description,
    categories,
    platformMatches,
    stats: {
      totalUsers: users,
      totalUsers7Days: users7Days,
      totalUsers30Days: users30Days,
      totalUsers90Days: users90Days,
      totalRuns: numberValue(firstDefined(stats.totalRuns, actor.totalRuns)),
      totalBuilds: numberValue(firstDefined(stats.totalBuilds, actor.totalBuilds)),
      lastRunStartedAt: firstDefined(stats.lastRunStartedAt, actor.lastRunStartedAt) ?? null,
      actorReviewCount: firstDefined(stats.actorReviewCount, actor.actorReviewCount) ?? null,
      actorReviewRating: firstDefined(stats.actorReviewRating, actor.actorReviewRating) ?? null,
      bookmarkCount: firstDefined(stats.bookmarkCount, actor.bookmarkCount) ?? null,
    },
    pricing: firstDefined(actor.currentPricingInfo, actor.pricing, null),
  };
  const pricing = firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined;
  const pricingModel =
    textValue(firstDefined(pricing?.pricingModel, pricing?.model, actor.pricingModel), "") || null;
  const minimalMaxTotalChargeUsd = pricing
    ? numberValue(firstDefined(pricing.minimalMaxTotalChargeUsd, pricing.maxTotalChargeUsd), 0) || null
    : null;
  const metadataHash = sha256(JSON.stringify(selectedRaw));

  return {
    actorKey: `apify:${normalizedUsername}`,
    actorId,
    username: normalizedUsername,
    name: name || normalizedUsername,
    title,
    url,
    description,
    categories,
    platformMatches,
    sourcePlatform,
    categoryKeys,
    totalUsers: users,
    totalUsers7Days: users7Days,
    totalUsers30Days: users30Days,
    totalUsers90Days: users90Days,
    totalRuns: numberValue(firstDefined(stats.totalRuns, actor.totalRuns)),
    totalBuilds: numberValue(firstDefined(stats.totalBuilds, actor.totalBuilds)),
    lastRunStartedAt: parseDate(firstDefined(stats.lastRunStartedAt, actor.lastRunStartedAt)),
    actorReviewCount: firstDefined(stats.actorReviewCount, actor.actorReviewCount) == null
      ? null
      : numberValue(firstDefined(stats.actorReviewCount, actor.actorReviewCount)),
    actorReviewRating: firstDefined(stats.actorReviewRating, actor.actorReviewRating) == null
      ? null
      : numberValue(firstDefined(stats.actorReviewRating, actor.actorReviewRating)),
    bookmarkCount: firstDefined(stats.bookmarkCount, actor.bookmarkCount) == null
      ? null
      : numberValue(firstDefined(stats.bookmarkCount, actor.bookmarkCount)),
    pricingModel,
    minimalMaxTotalChargeUsd,
    metadataHash,
    selectedRaw,
  };
}

export function parseStorePage(raw: unknown, requestedOffset: number, requestedLimit: number): StorePage {
  const root = (raw && typeof raw === "object" ? raw : {}) as JsonObject;
  const data = (root.data && typeof root.data === "object" ? root.data : root) as JsonObject;
  const items = Array.isArray(data.items) ? data.items : [];
  return {
    total: numberValue(data.total, 0),
    offset: numberValue(data.offset, requestedOffset),
    limit: numberValue(data.limit, requestedLimit),
    items,
  };
}

async function fetchWithRetry(
  fetchPage: (offset: number, limit: number) => Promise<StorePage>,
  offset: number,
  limit: number,
  maxRetries: number,
  sleepFn: (milliseconds: number) => Promise<void>,
  pacingMs: number,
  firstRequest: boolean,
) {
  if (!firstRequest) await sleepFn(pacingMs);
  let retryCount = 0;
  while (true) {
    try {
      return { page: await fetchPage(offset, limit), retryCount };
    } catch (error) {
      if (retryCount >= maxRetries) throw error;
      retryCount += 1;
      await sleepFn(Math.min(10_000, pacingMs * 2 ** retryCount));
    }
  }
}

export async function traverseStore(options: TraversalOptions): Promise<TraversalResult> {
  const pageSize = options.pageSize ?? DISCOVERY_PAGE_SIZE;
  const pacingMs = Math.max(options.pacingMs ?? DISCOVERY_PACING_MS, DISCOVERY_PACING_MS);
  const maxRetries = options.maxRetries ?? DISCOVERY_MAX_RETRIES;
  const sleepFn = options.sleep ?? sleep;
  const pages: StorePage[] = [];
  const actors: NormalizedActor[] = [];
  const seenKeys = new Set<string>();
  const progress: TraversalProgress = {
    offset: 0,
    total: 0,
    pagesFetched: 0,
    requestCount: 0,
    retryCount: 0,
    uniqueActorCount: 0,
    duplicateActorCount: 0,
  };

  try {
    const first = await fetchWithRetry(
      options.fetchPage,
      0,
      pageSize,
      maxRetries,
      sleepFn,
      pacingMs,
      true,
    );
    progress.requestCount += 1;
    progress.retryCount += first.retryCount;
    if (first.page.offset !== 0 || first.page.limit !== pageSize || first.page.total < 0) {
      throw new Error("Apify Store returned an invalid first page");
    }
    progress.total = first.page.total;
    pages.push(first.page);
    progress.pagesFetched = 1;
    const firstActors = first.page.items.map(normalizeActor).filter((actor): actor is NormalizedActor => Boolean(actor));
    for (const actor of firstActors) {
      if (seenKeys.has(actor.actorKey)) progress.duplicateActorCount += 1;
      else {
        seenKeys.add(actor.actorKey);
        actors.push(actor);
      }
    }
    progress.uniqueActorCount = actors.length;
    await options.onProgress?.({ ...progress });

    const expectedOffsets = [];
    for (let offset = pageSize; offset < progress.total; offset += pageSize) {
      expectedOffsets.push(offset);
    }
    for (const offset of expectedOffsets) {
      const next = await fetchWithRetry(
        options.fetchPage,
        offset,
        pageSize,
        maxRetries,
        sleepFn,
        pacingMs,
        false,
      );
      progress.requestCount += 1;
      progress.retryCount += next.retryCount;
      const expectedLength = Math.min(pageSize, progress.total - offset);
      if (
        next.page.offset !== offset ||
        next.page.limit !== pageSize ||
        next.page.items.length !== expectedLength
      ) {
        throw new Error(`Apify Store coverage gap at offset ${offset}`);
      }
      pages.push(next.page);
      progress.pagesFetched += 1;
      progress.offset = offset;
      for (const actor of next.page.items
        .map(normalizeActor)
        .filter((candidate): candidate is NormalizedActor => Boolean(candidate))) {
        if (seenKeys.has(actor.actorKey)) progress.duplicateActorCount += 1;
        else {
          seenKeys.add(actor.actorKey);
          actors.push(actor);
        }
      }
      progress.uniqueActorCount = actors.length;
      await options.onProgress?.({ ...progress });
    }
    if (progress.total === 0 && first.page.items.length !== 0) {
      throw new Error("Apify Store reported zero total with non-empty results");
    }
    if (actors.length !== progress.total) {
      throw new Error(
        `Apify Store returned ${progress.total} records but ${actors.length} unique actors were normalized`,
      );
    }
    return { ok: true, total: progress.total, pages, actors, progress };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown discovery traversal failure";
    return { ok: false, error: message, pages, actors: [], progress };
  }
}

export interface ClusterSnapshotInput {
  clusterKey: string;
  sourcePlatform: string;
  category: string;
  actorCount: number;
  activeActorCount: number;
  aggregateTotalUsers30Days: number;
  aggregateTotalUsers7Days: number;
  aggregateTotalUsers90Days: number;
  usagePercentile: number;
  thinSupplyPercentile: number;
  hhi: number;
  concentrationPercentile: number;
  fragmentationPercentile: number;
  persistence: boolean;
  emergence: boolean;
  recentUsageMix: number;
  pricingModelCounts: Record<string, number>;
}

export interface ScoredCluster extends ClusterSnapshotInput {
  primaryAnomalyType: DiscoveryAnomalyType;
  anomalyTags: DiscoveryAnomalyType[];
  priorityScore: number;
  scoreBreakdown: Record<string, number>;
}

const percentile = (values: number[], value: number) => {
  if (values.length <= 1) return 1;
  const lower = values.filter((candidate) => candidate <= value).length - 1;
  return Math.max(0, Math.min(1, lower / (values.length - 1)));
};

export function aggregateClusters(
  actors: NormalizedActor[],
  previous: Array<Pick<ClusterSnapshotInput, "clusterKey" | "aggregateTotalUsers30Days" | "actorCount">> = [],
): ClusterSnapshotInput[] {
  const grouped = new Map<string, NormalizedActor[]>();
  for (const actor of actors) {
    for (const category of actor.categoryKeys) {
      const clusterKey = `${actor.sourcePlatform}:${category}`;
      const group = grouped.get(clusterKey) ?? [];
      group.push(actor);
      grouped.set(clusterKey, group);
    }
  }
  const usageValues = [...grouped.values()].map((group) =>
    group.reduce((total, actor) => total + actor.totalUsers30Days, 0),
  );
  const supplyValues = [...grouped.values()].map((group) => 1 / Math.max(1, group.length));
  const snapshots: ClusterSnapshotInput[] = [];
  for (const [clusterKey, group] of grouped) {
    const [sourcePlatform, category] = clusterKey.split(":");
    const aggregateTotalUsers30Days = group.reduce((total, actor) => total + actor.totalUsers30Days, 0);
    const aggregateTotalUsers7Days = group.reduce((total, actor) => total + actor.totalUsers7Days, 0);
    const aggregateTotalUsers90Days = group.reduce((total, actor) => total + actor.totalUsers90Days, 0);
    const shares = group.map((actor) =>
      aggregateTotalUsers30Days > 0 ? actor.totalUsers30Days / aggregateTotalUsers30Days : 0,
    );
    const hhi = shares.reduce((total, share) => total + share * share, 0);
    const prior = previous.find((snapshot) => snapshot.clusterKey === clusterKey);
    snapshots.push({
      clusterKey,
      sourcePlatform,
      category,
      actorCount: group.length,
      activeActorCount: group.filter((actor) => actor.totalUsers30Days > 0).length,
      aggregateTotalUsers30Days,
      aggregateTotalUsers7Days,
      aggregateTotalUsers90Days,
      usagePercentile: percentile(usageValues, aggregateTotalUsers30Days),
      thinSupplyPercentile: percentile(supplyValues, 1 / Math.max(1, group.length)),
      hhi,
      concentrationPercentile: hhi,
      fragmentationPercentile: Math.max(0, 1 - hhi),
      persistence: Boolean(prior),
      emergence: !prior && aggregateTotalUsers30Days > 0,
      recentUsageMix:
        aggregateTotalUsers30Days > 0
          ? Math.min(1, aggregateTotalUsers7Days / aggregateTotalUsers30Days)
          : 0,
      pricingModelCounts: group.reduce<Record<string, number>>((counts, actor) => {
        const key = actor.pricingModel ?? "unknown";
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
    });
  }
  return snapshots;
}

export function scoreClusters(
  snapshots: ClusterSnapshotInput[],
  previous: Array<Pick<ClusterSnapshotInput, "clusterKey" | "aggregateTotalUsers30Days" | "actorCount">> = [],
): ScoredCluster[] {
  return snapshots.map((snapshot) => {
    const prior = previous.find((candidate) => candidate.clusterKey === snapshot.clusterKey);
    const materialChange =
      Boolean(prior) &&
      (Math.abs(snapshot.aggregateTotalUsers30Days - (prior?.aggregateTotalUsers30Days ?? 0)) /
        Math.max(1, prior?.aggregateTotalUsers30Days ?? 0) >=
        0.25 ||
        Math.abs(snapshot.actorCount - (prior?.actorCount ?? 0)) >= 2);
    const thinEligible =
      snapshot.actorCount <= 3 && snapshot.usagePercentile >= 0.75 && snapshot.thinSupplyPercentile >= 0.75;
    const concentrationEligible =
      snapshot.actorCount >= 2 &&
      !thinEligible &&
      snapshot.usagePercentile >= 0.8 &&
      snapshot.concentrationPercentile >= 0.65;
    const fragmentationEligible =
      snapshot.actorCount >= 5 &&
      snapshot.usagePercentile >= 0.8 &&
      snapshot.fragmentationPercentile >= 0.65;
    const emergingEligible = snapshot.emergence && snapshot.recentUsageMix >= 0.25;
    const scores = {
      HIGH_USAGE_THIN_SUPPLY: thinEligible ? 60 + snapshot.usagePercentile * 20 : 0,
      HIGH_USAGE_CONCENTRATED: concentrationEligible
        ? 55 + snapshot.usagePercentile * 15 + snapshot.concentrationPercentile * 10
        : 0,
      HIGH_USAGE_FRAGMENTED: fragmentationEligible
        ? 45 + snapshot.usagePercentile * 15 + snapshot.fragmentationPercentile * 10
        : 0,
      EMERGING_CLUSTER: emergingEligible ? 40 + snapshot.recentUsageMix * 20 : 0,
      MATERIAL_SNAPSHOT_CHANGE: materialChange ? 35 : 0,
    } satisfies Record<DiscoveryAnomalyType, number>;
    const eligible = (Object.entries(scores) as Array<[DiscoveryAnomalyType, number]>)
      .filter(([, score]) => score > 0)
      .sort((a, b) => b[1] - a[1]);
    const [primaryAnomalyType, priorityScore] = eligible[0] ?? ["EMERGING_CLUSTER", 0];
    const anomalyTags = eligible.map(([type]) => type);
    return {
      ...snapshot,
      primaryAnomalyType,
      anomalyTags,
      priorityScore,
      scoreBreakdown: scores,
    };
  });
}

export function buildDiscoveryKey(clusterKey: string, primaryAnomalyType: DiscoveryAnomalyType) {
  return `apify:${clusterKey}:${primaryAnomalyType}`;
}

function storeUrl(offset: number, limit: number) {
  const url = new URL(DISCOVERY_STORE_URL);
  url.searchParams.set("limit", String(limit));
  url.searchParams.set("offset", String(offset));
  url.searchParams.set("sortBy", "lastUpdate");
  url.searchParams.set("includeUnrunnableActors", "true");
  url.searchParams.set("responseFormat", "full");
  return url.toString();
}

export async function fetchApifyStorePage(offset: number, limit: number): Promise<StorePage> {
  const response = await fetch(storeUrl(offset, limit));
  if (!response.ok) {
    throw new Error(`Apify Store request failed with HTTP ${response.status}`);
  }
  return parseStorePage(await response.json(), offset, limit);
}

const actorInsert = (actor: NormalizedActor, runId: number) => ({
  actorKey: actor.actorKey,
  actorId: actor.actorId,
  username: actor.username,
  name: actor.name,
  title: actor.title,
  url: actor.url,
  description: actor.description,
  categories: actor.categories,
  platformMatches: actor.platformMatches,
  lastSeenAt: new Date(),
  latestCompleteRunId: runId,
  latestMetadataHash: actor.metadataHash,
  latestMetadata: actor.selectedRaw,
});

export async function persistDiscoveryResult(runId: number, traversal: TraversalSuccess): Promise<void> {
  const actorKeys = traversal.actors.map((actor) => actor.actorKey);
  await db.transaction(async (tx) => {
    const existingActors = actorKeys.length
      ? await tx
          .select()
          .from(discoveryActorsTable)
          .where(inArray(discoveryActorsTable.actorKey, actorKeys))
      : [];
    const existingByKey = new Map(existingActors.map((actor) => [actor.actorKey, actor]));
    for (let index = 0; index < traversal.actors.length; index += 500) {
      const batch = traversal.actors.slice(index, index + 500);
      if (batch.length === 0) continue;
      await tx
        .insert(discoveryActorsTable)
        .values(batch.map((actor) => actorInsert(actor, runId)))
        .onConflictDoUpdate({
          target: discoveryActorsTable.actorKey,
          set: {
            lastSeenAt: new Date(),
            latestCompleteRunId: runId,
            latestMetadataHash: sqlExcluded("latest_metadata_hash"),
            latestMetadata: sqlExcluded("latest_metadata"),
            title: sqlExcluded("title"),
            name: sqlExcluded("name"),
            description: sqlExcluded("description"),
            categories: sqlExcluded("categories"),
            platformMatches: sqlExcluded("platform_matches"),
          },
        });
    }
    const savedActors = actorKeys.length
      ? await tx
          .select()
          .from(discoveryActorsTable)
          .where(inArray(discoveryActorsTable.actorKey, actorKeys))
      : [];
    const actorIdByKey = new Map(savedActors.map((actor) => [actor.actorKey, actor.id]));
    const observations = traversal.actors
      .map((actor) => {
        const actorId = actorIdByKey.get(actor.actorKey);
        if (!actorId) return null;
        const previous = existingByKey.get(actor.actorKey);
        return {
          runId,
          actorId,
          actorKey: actor.actorKey,
          categoryKeys: actor.categoryKeys,
          platformKeys: actor.platformMatches,
          totalUsers: actor.totalUsers,
          totalUsers7Days: actor.totalUsers7Days,
          totalUsers30Days: actor.totalUsers30Days,
          totalUsers90Days: actor.totalUsers90Days,
          totalRuns: actor.totalRuns,
          totalBuilds: actor.totalBuilds,
          lastRunStartedAt: actor.lastRunStartedAt,
          actorReviewCount: actor.actorReviewCount,
          actorReviewRating: actor.actorReviewRating,
          bookmarkCount: actor.bookmarkCount,
          pricingModel: actor.pricingModel,
          minimalMaxTotalChargeUsd: actor.minimalMaxTotalChargeUsd,
          metadataHash: actor.metadataHash,
          changedSincePrevious: previous?.latestMetadataHash !== actor.metadataHash,
          selectedRaw: previous?.latestMetadataHash !== actor.metadataHash ? actor.selectedRaw : null,
        };
      })
      .filter((observation): observation is NonNullable<typeof observation> => Boolean(observation));
    for (let index = 0; index < observations.length; index += 500) {
      const batch = observations.slice(index, index + 500);
      if (batch.length > 0) {
        await tx
          .insert(discoveryActorObservationsTable)
          .values(batch)
          .onConflictDoNothing({
            target: [discoveryActorObservationsTable.runId, discoveryActorObservationsTable.actorId],
          });
      }
    }

    const previousRun = await tx
      .select({ id: discoveryRunsTable.id })
      .from(discoveryRunsTable)
      .where(and(eq(discoveryRunsTable.status, "COMPLETE"), lt(discoveryRunsTable.id, runId)))
      .orderBy(desc(discoveryRunsTable.id))
      .limit(1);
    const previousSnapshots = previousRun[0]
      ? await tx
          .select()
          .from(discoveryClusterSnapshotsTable)
          .where(eq(discoveryClusterSnapshotsTable.runId, previousRun[0].id))
      : [];
    const previousForScoring = previousSnapshots.map((snapshot) => ({
      clusterKey: snapshot.clusterKey,
      aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
      actorCount: snapshot.actorCount,
    }));
    const scored = scoreClusters(aggregateClusters(traversal.actors, previousForScoring), previousForScoring);
    const savedSnapshots =
      scored.length === 0
        ? []
        : await tx
            .insert(discoveryClusterSnapshotsTable)
            .values(
              scored.map((snapshot) => ({
                runId,
                clusterKey: snapshot.clusterKey,
                sourcePlatform: snapshot.sourcePlatform,
                category: snapshot.category,
                actorCount: snapshot.actorCount,
                activeActorCount: snapshot.activeActorCount,
                aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
                aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
                aggregateTotalUsers90Days: snapshot.aggregateTotalUsers90Days,
                usagePercentile: snapshot.usagePercentile,
                thinSupplyPercentile: snapshot.thinSupplyPercentile,
                hhi: snapshot.hhi,
                concentrationPercentile: snapshot.concentrationPercentile,
                fragmentationPercentile: snapshot.fragmentationPercentile,
                persistence: snapshot.persistence,
                emergence: snapshot.emergence,
                recentUsageMix: snapshot.recentUsageMix,
                pricingModelCounts: snapshot.pricingModelCounts,
                formulaVersion: DISCOVERY_FORMULA_VERSION,
              })),
            )
            .returning();
    const snapshotIdByKey = new Map(savedSnapshots.map((snapshot) => [snapshot.clusterKey, snapshot.id]));
    for (const snapshot of scored.filter((candidate) => candidate.priorityScore > 0)) {
      const discoveryKey = buildDiscoveryKey(snapshot.clusterKey, snapshot.primaryAnomalyType);
      const snapshotId = snapshotIdByKey.get(snapshot.clusterKey);
      const sourceSnapshotIds = snapshotId ? [snapshotId] : [];
      await tx
        .insert(discoveryCandidatesTable)
        .values({
          discoveryKey,
          clusterKey: snapshot.clusterKey,
          sourcePlatform: snapshot.sourcePlatform,
          category: snapshot.category,
          primaryAnomalyType: snapshot.primaryAnomalyType,
          anomalyTags: snapshot.anomalyTags,
          status: "NEW",
          lastSeenAt: new Date(),
          occurrenceCount: 1,
          latestPriorityScore: snapshot.priorityScore,
          scoreBreakdown: snapshot.scoreBreakdown,
          structureObservations: {
            actorCount: snapshot.actorCount,
            activeActorCount: snapshot.activeActorCount,
            hhi: snapshot.hhi,
            persistence: snapshot.persistence,
            emergence: snapshot.emergence,
            recentUsageMix: snapshot.recentUsageMix,
            usageSignal: "Apify Store usage telemetry; not revenue or validated demand.",
          },
          sourceSnapshotIds,
        })
        .onConflictDoUpdate({
          target: discoveryCandidatesTable.discoveryKey,
          set: {
            lastSeenAt: new Date(),
            occurrenceCount: sqlIncrement("occurrence_count"),
            latestPriorityScore: snapshot.priorityScore,
            anomalyTags: snapshot.anomalyTags,
            scoreBreakdown: snapshot.scoreBreakdown,
            structureObservations: {
              actorCount: snapshot.actorCount,
              activeActorCount: snapshot.activeActorCount,
              hhi: snapshot.hhi,
              persistence: snapshot.persistence,
              emergence: snapshot.emergence,
              recentUsageMix: snapshot.recentUsageMix,
              usageSignal: "Apify Store usage telemetry; not revenue or validated demand.",
            },
            sourceSnapshotIds,
          },
        });
    }
    await tx
      .update(discoveryRunsTable)
      .set({
        status: "COMPLETE",
        coverageStatus: "COMPLETE",
        finishedAt: new Date(),
        lastHeartbeatAt: new Date(),
        advertisedTotal: traversal.total,
        observedTotal: traversal.actors.length,
        expectedPages: Math.ceil(traversal.total / DISCOVERY_PAGE_SIZE),
        pagesFetched: traversal.progress.pagesFetched,
        currentOffset: traversal.progress.offset,
        requestCount: traversal.progress.requestCount,
        retryCount: traversal.progress.retryCount,
        uniqueActorCount: traversal.progress.uniqueActorCount,
        duplicateActorCount: traversal.progress.duplicateActorCount,
        clusterCount: scored.length,
        candidateCount: scored.filter((candidate) => candidate.priorityScore > 0).length,
        error: null,
      })
      .where(eq(discoveryRunsTable.id, runId));

    const detailedRunsToKeep = await tx
      .select({ id: discoveryRunsTable.id })
      .from(discoveryRunsTable)
      .where(eq(discoveryRunsTable.status, "COMPLETE"))
      .orderBy(desc(discoveryRunsTable.startedAt))
      .limit(DISCOVERY_DETAILED_RUN_RETENTION);
    if (detailedRunsToKeep.length > 0) {
      await tx
        .delete(discoveryActorObservationsTable)
        .where(
          notInArray(
            discoveryActorObservationsTable.runId,
            detailedRunsToKeep.map((run) => run.id),
          ),
        );
    }
  });
}

function sqlExcluded(column: string) {
  return sql.raw(`excluded.${column}`);
}

function sqlIncrement(column: string) {
  return sql.raw(`"${column}" + 1`);
}

export async function reconcileStaleDiscoveryRuns(): Promise<void> {
  const stale = await db
    .update(discoveryRunsTable)
    .set({
      status: "INTERRUPTED",
      coverageStatus: "INCOMPLETE",
      finishedAt: new Date(),
      error: "Server restarted while the run heartbeat was stale.",
    })
    .where(
      eq(discoveryRunsTable.status, "RUNNING"),
    )
    .returning({ id: discoveryRunsTable.id });
  if (stale.length > 0) {
    logger.warn({ runIds: stale.map((run) => run.id) }, "Marked stale discovery runs interrupted");
  }
}

export async function getActiveDiscoveryRun() {
  const [run] = await db
    .select()
    .from(discoveryRunsTable)
    .where(eq(discoveryRunsTable.status, "RUNNING"))
    .orderBy(desc(discoveryRunsTable.startedAt))
    .limit(1);
  return run;
}

export function discoveryQueryDefinition() {
  return {
    endpoint: DISCOVERY_STORE_URL,
    includeUnrunnableActors: true,
    responseFormat: "full",
    sortBy: "lastUpdate",
    pageSize: DISCOVERY_PAGE_SIZE,
  };
}