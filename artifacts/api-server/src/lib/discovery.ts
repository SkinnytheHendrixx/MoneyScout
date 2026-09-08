import { createHash } from "node:crypto";
import {
  and,
  asc,
  desc,
  eq,
  gt,
  inArray,
  isNotNull,
  isNull,
  lt,
  notInArray,
  or,
  sql,
} from "drizzle-orm";
import {
  db,
  discoveryActorObservationsTable,
  discoveryActorsTable,
  discoveryCandidatesTable,
  discoveryClusterSnapshotsTable,
  discoveryObservationLinksTable,
  discoveryRunsTable,
  discoveryStagingActorsTable,
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
export const DISCOVERY_REQUEST_TIMEOUT_MS = 30_000;
export const DISCOVERY_BATCH_SIZE = 500;
export const DISCOVERY_FORMULA_VERSION = "discovery-v0.2";
export const DISCOVERY_NORMALIZATION_VERSION = "normalization-v0.2";
export const DISCOVERY_PLATFORM_ALIAS_VERSION = "platform-aliases-v1";
export const DISCOVERY_HEARTBEAT_STALE_MS = 2 * 60 * 1_000;
export const DISCOVERY_DETAILED_RUN_RETENTION = 3;
export const DISCOVERY_QUALIFICATION_THRESHOLD = 60;
export const DISCOVERY_CANDIDATE_CAP = 10;
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
  totalUsers: number | null;
  totalUsers7Days: number | null;
  totalUsers30Days: number | null;
  totalUsers90Days: number | null;
  totalRuns: number | null;
  totalBuilds: number | null;
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
  effectivePageSize: number;
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
  fetchPage: (offset: number, limit: number, signal?: AbortSignal) => Promise<StorePage>;
  sleep?: (milliseconds: number) => Promise<void>;
  pacingMs?: number;
  pageSize?: number;
  maxRetries?: number;
  requestTimeoutMs?: number;
  signal?: AbortSignal;
  onProgress?: (progress: TraversalProgress) => Promise<void>;
  onActors?: (actors: NormalizedActor[]) => Promise<void>;
  collectActors?: boolean;
}

const sleep = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const textValue = (value: unknown, fallback = "") =>
  typeof value === "string" ? value.trim() : fallback;

const numberValue = (value: unknown, fallback: number | null = null) => {
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

const canonicalizeCategory = (value: unknown) => {
  if (typeof value !== "string" || !value.trim()) return "UNKNOWN";
  const canonical = value
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return canonical || "UNKNOWN";
};

const PLATFORM_ALIASES = [
  { canonical: "AMAZON", terms: ["amazon"], specificity: 100 },
  { canonical: "FACEBOOK", terms: ["facebook", "fb.com"], specificity: 90 },
  { canonical: "GITHUB", terms: ["github", "github.com"], specificity: 90 },
  { canonical: "GOOGLE", terms: ["google", "google.com"], specificity: 100 },
  { canonical: "INSTAGRAM", terms: ["instagram", "instagram.com"], specificity: 90 },
  { canonical: "LINKEDIN", terms: ["linkedin", "linkedin.com"], specificity: 90 },
  { canonical: "REDDIT", terms: ["reddit", "reddit.com"], specificity: 90 },
  { canonical: "SHOPIFY", terms: ["shopify", "shopify.com"], specificity: 90 },
  { canonical: "TIKTOK", terms: ["tiktok", "tiktok.com"], specificity: 90 },
  { canonical: "TWITTER", terms: ["twitter", "twitter.com", "x.com"], specificity: 90 },
  { canonical: "WALMART", terms: ["walmart", "walmart.com"], specificity: 90 },
  { canonical: "YOUTUBE", terms: ["youtube", "youtube.com"], specificity: 90 },
] as const;

const escapedTerm = (term: string) => term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function matchPlatforms(values: unknown[]) {
  const text = values
    .flatMap((value) => (Array.isArray(value) ? value : [value]))
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();
  const matches = PLATFORM_ALIASES
    .filter((alias) =>
      alias.terms.some((term) =>
        new RegExp(`(^|[^a-z0-9])${escapedTerm(term)}([^a-z0-9]|$)`, "i").test(text),
      ),
    )
    .sort((left, right) => right.specificity - left.specificity || left.canonical.localeCompare(right.canonical));
  const canonicalMatches = [...new Set(matches.map((match) => match.canonical))];
  return canonicalMatches.length === 1 ? canonicalMatches : ["UNKNOWN"];
}

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
  const rawCategories = firstDefined(actor.categories, actor.category);
  const categories = (Array.isArray(rawCategories) ? rawCategories : [rawCategories])
    .map(canonicalizeCategory)
    .filter((value, index, values) => value !== "UNKNOWN" || index === values.indexOf(value));
  const actorId = textValue(firstDefined(actor.id, actor.actorId), "") || null;
  const url =
    textValue(firstDefined(actor.url, actor.storeUrl), "") ||
    `https://apify.com/${normalizedUsername}`;
  const description = textValue(firstDefined(actor.description, actor.readme), "");
  const stats = (actor.stats as JsonObject | undefined) ?? {};
  const platformMatches = matchPlatforms([
    firstDefined(actor.platforms, actor.platform, getPath(actor, [["stats", "platforms"]])),
    actor.title,
    actor.name,
    actor.username,
    actor.description,
    actor.readme,
    actor.url,
    actor.storeUrl,
  ]);
  const normalizedPlatforms = platformMatches.length > 0 ? platformMatches : ["UNKNOWN"];
  const sourcePlatform = normalizedPlatforms[0];
  const categoryKeys = categories.length > 0 ? categories : ["UNKNOWN"];
  const users = numberValue(firstDefined(stats.totalUsers, actor.totalUsers));
  const users7Days = numberValue(
    firstDefined(stats.totalUsers7Days, stats.totalUsersLast7Days, actor.totalUsers7Days),
  );
  const users30Days = numberValue(
    firstDefined(stats.totalUsers30Days, stats.totalUsersLast30Days, actor.totalUsers30Days),
  );
  const users90Days = numberValue(
    firstDefined(stats.totalUsers90Days, stats.totalUsersLast90Days, actor.totalUsers90Days),
  );
  const selectedRaw: JsonObject = {
    id: actorId,
    username: normalizedUsername,
    name,
    title,
    url,
    description,
    categories,
    platformMatches: normalizedPlatforms,
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
    pricingModel: textValue(firstDefined(
      (firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined)?.pricingModel,
      (firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined)?.model,
      actor.pricingModel,
    ), "") || null,
    minimalMaxTotalChargeUsd: numberValue(firstDefined(
      (firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined)?.minimalMaxTotalChargeUsd,
      (firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined)?.maxTotalChargeUsd,
    )),
  };
  const pricing = firstDefined(actor.currentPricingInfo, actor.pricing) as JsonObject | undefined;
  const pricingModel =
    textValue(firstDefined(pricing?.pricingModel, pricing?.model, actor.pricingModel), "") || null;
  const minimalMaxTotalChargeUsd = pricing
    ? numberValue(firstDefined(pricing.minimalMaxTotalChargeUsd, pricing.maxTotalChargeUsd))
    : null;
  const metadataHash = sha256(JSON.stringify(selectedRaw));

  return {
    actorKey: actorId ? `apify:id:${actorId}` : `apify:username:${normalizedUsername}`,
    actorId,
    username: normalizedUsername,
    name: name || normalizedUsername,
    title,
    url,
    description,
    categories,
    platformMatches: normalizedPlatforms,
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
  if (!Array.isArray(data.items)) {
    throw new Error("Apify Store response omitted an items array");
  }
  const total = numberValue(data.total);
  const offset = numberValue(data.offset);
  const limit = numberValue(data.limit);
  if (
    total === null ||
    offset === null ||
    limit === null ||
    !Number.isInteger(total) ||
    !Number.isInteger(offset) ||
    !Number.isInteger(limit) ||
    total < 0 ||
    offset < 0 ||
    limit <= 0
  ) {
    throw new Error("Apify Store response contained malformed pagination metadata");
  }
  return {
    total,
    offset,
    limit,
    items: data.items,
  };
}

async function fetchWithRetry(
  fetchPage: (offset: number, limit: number, signal?: AbortSignal) => Promise<StorePage>,
  offset: number,
  limit: number,
  maxRetries: number,
  sleepFn: (milliseconds: number) => Promise<void>,
  pacingMs: number,
  firstRequest: boolean,
  requestTimeoutMs: number,
  signal?: AbortSignal,
) {
  if (!firstRequest) await sleepFn(pacingMs);
  let retryCount = 0;
  while (true) {
    try {
      throwIfAborted(signal);
      return {
        page: await fetchPageWithTimeout(fetchPage, offset, limit, signal, requestTimeoutMs),
        retryCount,
      };
    } catch (error) {
      if (retryCount >= maxRetries) throw error;
      retryCount += 1;
      await sleepFn(Math.min(10_000, pacingMs * 2 ** retryCount));
      throwIfAborted(signal);
    }
  }
}

function throwIfAborted(signal?: AbortSignal) {
  if (!signal?.aborted) return;
  const reason = signal.reason;
  throw reason instanceof Error ? reason : new Error("Discovery request cancelled");
}

async function fetchPageWithTimeout(
  fetchPage: (offset: number, limit: number, signal?: AbortSignal) => Promise<StorePage>,
  offset: number,
  limit: number,
  parentSignal: AbortSignal | undefined,
  timeoutMs: number,
) {
  throwIfAborted(parentSignal);
  const controller = new AbortController();
  let timedOut = false;
  let rejectParent!: (error: Error) => void;
  const parentFailure = new Promise<never>((_, reject) => {
    rejectParent = reject;
  });
  const abortFromParent = () => {
    const reason =
      parentSignal?.reason instanceof Error
        ? parentSignal.reason
        : new Error("Discovery request cancelled");
    controller.abort(reason);
    rejectParent(reason);
  };
  parentSignal?.addEventListener("abort", abortFromParent, { once: true });
  let rejectTimeout!: (error: Error) => void;
  const timeoutFailure = new Promise<never>((_, reject) => {
    rejectTimeout = reject;
  });
  const timeout = setTimeout(() => {
    timedOut = true;
    const error = new Error(`Discovery request timed out after ${timeoutMs}ms`);
    controller.abort(error);
    rejectTimeout(error);
  }, timeoutMs);
  try {
    const request = fetchPage(offset, limit, controller.signal);
    try {
      return await Promise.race([request, timeoutFailure, parentFailure]);
    } catch (error) {
      if (timedOut) {
        throw new Error(`Discovery request timed out after ${timeoutMs}ms`);
      }
      throw error;
    }
  } finally {
    clearTimeout(timeout);
    parentSignal?.removeEventListener("abort", abortFromParent);
  }
}

export async function traverseStore(options: TraversalOptions): Promise<TraversalResult> {
  const requestedPageSize = options.pageSize ?? DISCOVERY_PAGE_SIZE;
  const pageSize = Number.isFinite(requestedPageSize)
    ? Math.min(DISCOVERY_PAGE_SIZE, Math.max(1, Math.floor(requestedPageSize)))
    : DISCOVERY_PAGE_SIZE;
  const pacingMs = Math.max(options.pacingMs ?? DISCOVERY_PACING_MS, DISCOVERY_PACING_MS);
  const maxRetries = options.maxRetries ?? DISCOVERY_MAX_RETRIES;
  const requestTimeoutMs = Math.max(
    options.requestTimeoutMs ?? DISCOVERY_REQUEST_TIMEOUT_MS,
    1,
  );
  const sleepFn = options.sleep ?? sleep;
  const pages: StorePage[] = [];
  const actors: NormalizedActor[] = [];
  const seenKeys = new Set<string>();
  const progress: TraversalProgress = {
    offset: 0,
    total: 0,
    effectivePageSize: pageSize,
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
      requestTimeoutMs,
      options.signal,
    );
    progress.requestCount += 1;
    progress.retryCount += first.retryCount;
    if (
      first.page.offset !== 0 ||
      first.page.limit <= 0 ||
      first.page.limit > pageSize ||
      first.page.total < 0 ||
      first.page.items.length !== Math.min(first.page.limit, first.page.total)
    ) {
      throw new Error("Apify Store returned an invalid first page");
    }
    progress.total = first.page.total;
    progress.effectivePageSize = first.page.limit;
    if (options.collectActors !== false) pages.push(first.page);
    progress.pagesFetched = 1;
    const pageSignatures = new Set([sha256(JSON.stringify(first.page.items))]);
    const firstActors = first.page.items.map(normalizeActor).filter((actor): actor is NormalizedActor => Boolean(actor));
    const firstUniqueActors: NormalizedActor[] = [];
    for (const actor of firstActors) {
      if (seenKeys.has(actor.actorKey)) progress.duplicateActorCount += 1;
      else {
        seenKeys.add(actor.actorKey);
        firstUniqueActors.push(actor);
      }
    }
    await options.onActors?.(firstUniqueActors);
    if (options.collectActors !== false) actors.push(...firstUniqueActors);
    progress.uniqueActorCount = seenKeys.size;
    await options.onProgress?.({ ...progress });

    const expectedOffsets = [];
    for (let offset = progress.effectivePageSize; offset < progress.total; offset += progress.effectivePageSize) {
      expectedOffsets.push(offset);
    }
    for (const offset of expectedOffsets) {
      const next = await fetchWithRetry(
        options.fetchPage,
        offset,
        progress.effectivePageSize,
        maxRetries,
        sleepFn,
        pacingMs,
        false,
        requestTimeoutMs,
        options.signal,
      );
      progress.requestCount += 1;
      progress.retryCount += next.retryCount;
      const expectedLength = Math.min(progress.effectivePageSize, progress.total - offset);
      if (
        next.page.offset !== offset ||
        next.page.limit !== progress.effectivePageSize ||
        next.page.total !== progress.total ||
        next.page.items.length !== expectedLength
      ) {
        throw new Error(`Apify Store coverage gap at offset ${offset}`);
      }
      const signature = sha256(JSON.stringify(next.page.items));
      if (pageSignatures.has(signature)) {
        throw new Error(`Apify Store returned a repeated page at offset ${offset}`);
      }
      pageSignatures.add(signature);
      if (options.collectActors !== false) pages.push(next.page);
      progress.pagesFetched += 1;
      progress.offset = offset;
      const pageActors: NormalizedActor[] = [];
      for (const actor of next.page.items
        .map(normalizeActor)
        .filter((candidate): candidate is NormalizedActor => Boolean(candidate))) {
        if (seenKeys.has(actor.actorKey)) progress.duplicateActorCount += 1;
        else {
          seenKeys.add(actor.actorKey);
          pageActors.push(actor);
        }
      }
      await options.onActors?.(pageActors);
      if (options.collectActors !== false) actors.push(...pageActors);
       progress.uniqueActorCount = seenKeys.size;
      await options.onProgress?.({ ...progress });
    }
    if (progress.total === 0 && first.page.items.length !== 0) {
      throw new Error("Apify Store reported zero total with non-empty results");
    }
    if (progress.uniqueActorCount !== progress.total) {
      throw new Error(
        `Apify Store returned ${progress.total} records but ${progress.uniqueActorCount} unique actors were normalized`,
      );
    }
    return { ok: true, total: progress.total, pages, actors, progress };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown discovery traversal failure";
    return { ok: false, error: message, pages, actors: [], progress };
  }
}

function stagedActorValues(runId: number, actor: NormalizedActor) {
  return {
    runId,
    actorKey: actor.actorKey,
    actorId: actor.actorId,
    username: actor.username,
    name: actor.name,
    title: actor.title,
    url: actor.url,
    description: actor.description,
    categories: actor.categories,
    platformMatches: actor.platformMatches,
    categoryKeys: actor.categoryKeys,
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
    selectedRaw: actor.selectedRaw,
  };
}

export async function clearDiscoveryStaging(runId: number) {
  await db.delete(discoveryStagingActorsTable).where(eq(discoveryStagingActorsTable.runId, runId));
}

export async function traverseStoreToStaging(
  runId: number,
  options: Omit<TraversalOptions, "onActors" | "collectActors">,
) {
  await clearDiscoveryStaging(runId);
  const result = await traverseStore({
    ...options,
    collectActors: false,
    onActors: async (actors) => {
      if (actors.length === 0) return;
      await db
        .insert(discoveryStagingActorsTable)
        .values(actors.map((actor) => stagedActorValues(runId, actor)))
        .onConflictDoNothing({
          target: [discoveryStagingActorsTable.runId, discoveryStagingActorsTable.actorKey],
        });
    },
  });
  if (!result.ok) await clearDiscoveryStaging(runId);
  return result;
}

export interface ClusterSnapshotInput {
  clusterKey: string;
  sourcePlatform: string;
  category: string;
  actorCount: number;
  activeActorCount: number;
  providerCount: number;
  usageKnownActorCount: number;
  aggregateTotalUsers30Days: number | null;
  aggregateTotalUsers7Days: number | null;
  aggregateTotalUsers90Days: number | null;
  usagePercentile: number | null;
  thinSupplyPercentile: number | null;
  hhi: number | null;
  concentrationPercentile: number | null;
  fragmentationPercentile: number | null;
  persistence: boolean;
  emergence: boolean;
  recentUsageMix: number | null;
  newActorCount: number;
  newActorPercentile: number | null;
  snapshotNewnessPercentile: number | null;
  materialActorChangeScore: number | null;
  materialUsageChangeScore: number | null;
  pricingModelCounts: Record<string, number>;
}

export interface ScoredCluster extends ClusterSnapshotInput {
  primaryAnomalyType: DiscoveryAnomalyType;
  anomalyTags: DiscoveryAnomalyType[];
  priorityScore: number;
  scoreBreakdown: Record<string, number>;
}

const percentile = (values: number[], value: number | null) => {
  if (value === null) return null;
  if (values.length <= 1) return 1;
  const lower = values.filter((candidate) => candidate <= value).length - 1;
  return Math.max(0, Math.min(1, lower / (values.length - 1)));
};

export function aggregateClusters(
  actors: NormalizedActor[],
  previous: Array<
    Pick<
      ClusterSnapshotInput,
      "clusterKey" | "aggregateTotalUsers30Days" | "aggregateTotalUsers7Days" | "actorCount"
    >
  > = [],
): ClusterSnapshotInput[] {
  const grouped = new Map<string, NormalizedActor[]>();
  for (const actor of actors) {
    for (const platform of actor.platformMatches.length > 0 ? actor.platformMatches : ["UNKNOWN"]) {
      for (const category of actor.categoryKeys) {
        const clusterKey = `${platform}:${category}`;
        const group = grouped.get(clusterKey) ?? [];
        group.push(actor);
        grouped.set(clusterKey, group);
      }
    }
  }
  const aggregateKnownUsage = (group: NormalizedActor[]) => {
    const known = group.filter((actor) => actor.totalUsers30Days !== null);
    return {
      knownCount: known.length,
      total: known.length > 0 ? known.reduce((total, actor) => total + (actor.totalUsers30Days ?? 0), 0) : null,
    };
  };
  const usageValues = [...grouped.values()]
    .map((group) => aggregateKnownUsage(group))
    .filter((usage) => usage.knownCount === 0 ? false : true)
    .map((usage) => usage.total)
    .filter((value): value is number => value !== null);
  const supplyValues = [...grouped.values()].map((group) => 1 / Math.max(1, group.length));
  const baseSnapshots: Array<ClusterSnapshotInput & { previous?: (typeof previous)[number] }> = [];
  for (const [clusterKey, group] of grouped) {
    const separator = clusterKey.indexOf(":");
    const sourcePlatform = clusterKey.slice(0, separator);
    const category = clusterKey.slice(separator + 1);
    const usage = aggregateKnownUsage(group);
    const knownUsers = group.filter((actor) => actor.totalUsers30Days !== null);
    const aggregateTotalUsers30Days = usage.total;
    const aggregateTotalUsers7Days = group.every((actor) => actor.totalUsers7Days !== null)
      ? group.reduce((total, actor) => total + (actor.totalUsers7Days ?? 0), 0)
      : null;
    const aggregateTotalUsers90Days = group.every((actor) => actor.totalUsers90Days !== null)
      ? group.reduce((total, actor) => total + (actor.totalUsers90Days ?? 0), 0)
      : null;
    const canComputeConcentration = usage.knownCount === group.length && aggregateTotalUsers30Days !== null;
    const shares = canComputeConcentration && aggregateTotalUsers30Days > 0
      ? knownUsers.map((actor) => (actor.totalUsers30Days ?? 0) / aggregateTotalUsers30Days)
      : [];
    const hhi = canComputeConcentration
      ? shares.reduce((total, share) => total + share * share, 0)
      : null;
    const prior = previous.find((snapshot) => snapshot.clusterKey === clusterKey);
    const priorUsage = prior?.aggregateTotalUsers30Days ?? null;
    const materialActorChangeScore =
      prior ? Math.min(1, Math.abs(group.length - prior.actorCount) / Math.max(1, prior.actorCount)) : null;
    const materialUsageChangeScore =
      prior && aggregateTotalUsers30Days !== null && priorUsage !== null
        ? Math.min(1, Math.abs(aggregateTotalUsers30Days - priorUsage) / Math.max(1, priorUsage))
        : null;
    baseSnapshots.push({
      clusterKey,
      sourcePlatform,
      category,
      actorCount: group.length,
      activeActorCount: knownUsers.filter((actor) => (actor.totalUsers30Days ?? 0) > 0).length,
      providerCount: group.length,
      usageKnownActorCount: usage.knownCount,
      aggregateTotalUsers30Days,
      aggregateTotalUsers7Days,
      aggregateTotalUsers90Days,
      usagePercentile: percentile(
        usageValues,
        usage.knownCount === group.length ? aggregateTotalUsers30Days : null,
      ),
      thinSupplyPercentile: percentile(supplyValues, 1 / Math.max(1, group.length)),
      hhi,
      concentrationPercentile: hhi,
      fragmentationPercentile: hhi === null ? null : Math.max(0, 1 - hhi),
      persistence: Boolean(prior),
      emergence: !prior && aggregateTotalUsers30Days !== null && aggregateTotalUsers30Days > 0,
      recentUsageMix:
        aggregateTotalUsers30Days !== null &&
        aggregateTotalUsers7Days !== null &&
        aggregateTotalUsers30Days > 0
          ? Math.min(1, aggregateTotalUsers7Days / aggregateTotalUsers30Days)
          : null,
      newActorCount: prior ? Math.max(0, group.length - prior.actorCount) : group.length,
      newActorPercentile: null,
      snapshotNewnessPercentile: prior ? 0 : 1,
      materialActorChangeScore,
      materialUsageChangeScore,
      pricingModelCounts: group.reduce<Record<string, number>>((counts, actor) => {
        const key = actor.pricingModel ?? "unknown";
        counts[key] = (counts[key] ?? 0) + 1;
        return counts;
      }, {}),
    });
  }
  const newActorValues = baseSnapshots.map((snapshot) => snapshot.newActorCount);
  return baseSnapshots.map((snapshot) => ({
    ...snapshot,
    newActorPercentile: percentile(newActorValues, snapshot.newActorCount),
  }));
}

type PreviousClusterSnapshot = Pick<
  ClusterSnapshotInput,
  "clusterKey" | "aggregateTotalUsers30Days" | "aggregateTotalUsers7Days" | "actorCount"
>;

type ClusterAccumulator = {
  clusterKey: string;
  sourcePlatform: string;
  category: string;
  actorCount: number;
  activeActorCount: number;
  usageKnownActorCount: number;
  aggregateTotalUsers30Days: number;
  aggregateTotalUsers7Days: number;
  aggregateTotalUsers90Days: number;
  missingUsers7Days: boolean;
  missingUsers90Days: boolean;
  totalUsers30DaysSquared: number;
  pricingModelCounts: Record<string, number>;
};

function addActorToClusterAccumulators(
  accumulators: Map<string, ClusterAccumulator>,
  actor: NormalizedActor,
) {
  for (const platform of actor.platformMatches.length > 0 ? actor.platformMatches : ["UNKNOWN"]) {
    for (const category of actor.categoryKeys.length > 0 ? actor.categoryKeys : ["UNKNOWN"]) {
      const clusterKey = `${platform}:${category}`;
      const accumulator = accumulators.get(clusterKey) ?? {
        clusterKey,
        sourcePlatform: platform,
        category,
        actorCount: 0,
        activeActorCount: 0,
        usageKnownActorCount: 0,
        aggregateTotalUsers30Days: 0,
        aggregateTotalUsers7Days: 0,
        aggregateTotalUsers90Days: 0,
        missingUsers7Days: false,
        missingUsers90Days: false,
        totalUsers30DaysSquared: 0,
        pricingModelCounts: {},
      };
      accumulator.actorCount += 1;
      if (actor.totalUsers30Days !== null) {
        accumulator.usageKnownActorCount += 1;
        accumulator.aggregateTotalUsers30Days += actor.totalUsers30Days;
        accumulator.totalUsers30DaysSquared += actor.totalUsers30Days ** 2;
        if (actor.totalUsers30Days > 0) accumulator.activeActorCount += 1;
      }
      if (actor.totalUsers7Days === null) accumulator.missingUsers7Days = true;
      else accumulator.aggregateTotalUsers7Days += actor.totalUsers7Days;
      if (actor.totalUsers90Days === null) accumulator.missingUsers90Days = true;
      else accumulator.aggregateTotalUsers90Days += actor.totalUsers90Days;
      const pricingModel = actor.pricingModel ?? "unknown";
      accumulator.pricingModelCounts[pricingModel] =
        (accumulator.pricingModelCounts[pricingModel] ?? 0) + 1;
      accumulators.set(clusterKey, accumulator);
    }
  }
}

function finishClusterAccumulators(
  accumulators: Map<string, ClusterAccumulator>,
  previous: PreviousClusterSnapshot[],
): ClusterSnapshotInput[] {
  const previousByKey = new Map(previous.map((snapshot) => [snapshot.clusterKey, snapshot]));
  const baseSnapshots = [...accumulators.values()].map((accumulator) => {
    const prior = previousByKey.get(accumulator.clusterKey);
    const aggregateTotalUsers30Days =
      accumulator.usageKnownActorCount > 0 ? accumulator.aggregateTotalUsers30Days : null;
    const aggregateTotalUsers7Days = accumulator.missingUsers7Days
      ? null
      : accumulator.aggregateTotalUsers7Days;
    const aggregateTotalUsers90Days = accumulator.missingUsers90Days
      ? null
      : accumulator.aggregateTotalUsers90Days;
    const hhi =
      accumulator.usageKnownActorCount === accumulator.actorCount &&
      aggregateTotalUsers30Days !== null &&
      aggregateTotalUsers30Days > 0
        ? accumulator.totalUsers30DaysSquared / aggregateTotalUsers30Days ** 2
        : null;
    const priorUsage = prior?.aggregateTotalUsers30Days ?? null;
    return {
      clusterKey: accumulator.clusterKey,
      sourcePlatform: accumulator.sourcePlatform,
      category: accumulator.category,
      actorCount: accumulator.actorCount,
      activeActorCount: accumulator.activeActorCount,
      providerCount: accumulator.actorCount,
      usageKnownActorCount: accumulator.usageKnownActorCount,
      aggregateTotalUsers30Days,
      aggregateTotalUsers7Days,
      aggregateTotalUsers90Days,
      usagePercentile: null,
      thinSupplyPercentile: null,
      hhi,
      concentrationPercentile: hhi,
      fragmentationPercentile: hhi === null ? null : Math.max(0, 1 - hhi),
      persistence: Boolean(prior),
      emergence:
        !prior && aggregateTotalUsers30Days !== null && aggregateTotalUsers30Days > 0,
      recentUsageMix:
        aggregateTotalUsers30Days !== null &&
        aggregateTotalUsers7Days !== null &&
        aggregateTotalUsers30Days > 0
          ? Math.min(1, aggregateTotalUsers7Days / aggregateTotalUsers30Days)
          : null,
      newActorCount: prior
        ? Math.max(0, accumulator.actorCount - prior.actorCount)
        : accumulator.actorCount,
      newActorPercentile: null,
      snapshotNewnessPercentile: prior ? 0 : 1,
      materialActorChangeScore: prior
        ? Math.min(1, Math.abs(accumulator.actorCount - prior.actorCount) / Math.max(1, prior.actorCount))
        : null,
      materialUsageChangeScore:
        prior &&
        aggregateTotalUsers30Days !== null &&
        priorUsage !== null
          ? Math.min(
              1,
              Math.abs(aggregateTotalUsers30Days - priorUsage) / Math.max(1, priorUsage),
            )
          : null,
      pricingModelCounts: accumulator.pricingModelCounts,
    };
  });
  const usageValues = baseSnapshots
    .map((snapshot) => snapshot.aggregateTotalUsers30Days)
    .filter((value): value is number => value !== null);
  const supplyValues = baseSnapshots.map((snapshot) => 1 / Math.max(1, snapshot.actorCount));
  const newActorValues = baseSnapshots.map((snapshot) => snapshot.newActorCount);
  return baseSnapshots.map((snapshot) => ({
    ...snapshot,
    usagePercentile: percentile(
      usageValues,
      snapshot.usageKnownActorCount === snapshot.actorCount
        ? snapshot.aggregateTotalUsers30Days
        : null,
    ),
    thinSupplyPercentile: percentile(
      supplyValues,
      1 / Math.max(1, snapshot.actorCount),
    ),
    newActorPercentile: percentile(newActorValues, snapshot.newActorCount),
  }));
}

async function aggregateActorBatches(
  actorBatches: AsyncIterable<NormalizedActor[]>,
  previous: PreviousClusterSnapshot[],
) {
  const accumulators = new Map<string, ClusterAccumulator>();
  for await (const batch of actorBatches) {
    for (const actor of batch) addActorToClusterAccumulators(accumulators, actor);
  }
  return finishClusterAccumulators(accumulators, previous);
}

export function scoreClusters(
  snapshots: ClusterSnapshotInput[],
  _previous: Array<
    Pick<
      ClusterSnapshotInput,
      "clusterKey" | "aggregateTotalUsers30Days" | "aggregateTotalUsers7Days" | "actorCount"
    >
  > = [],
): ScoredCluster[] {
  // Each anomaly is scored independently from deterministic components in [0, 1].
  // A candidate receives only the maximum eligible type score, never a correlated sum.
  return snapshots.map((snapshot) => {
    const knownCluster =
      snapshot.sourcePlatform !== "UNKNOWN" &&
      snapshot.category !== "UNKNOWN";
    const thinEligible =
      knownCluster &&
      snapshot.activeActorCount <= 2 &&
      snapshot.activeActorCount > 0 &&
      snapshot.usageKnownActorCount === snapshot.actorCount &&
      snapshot.usagePercentile !== null &&
      snapshot.usagePercentile >= 0.75 &&
      snapshot.thinSupplyPercentile !== null &&
      snapshot.thinSupplyPercentile >= 0.75;
    const concentrationEligible =
      knownCluster &&
      snapshot.activeActorCount >= 3 &&
      snapshot.usageKnownActorCount === snapshot.actorCount &&
      snapshot.usagePercentile !== null &&
      snapshot.usagePercentile >= 0.8 &&
      snapshot.concentrationPercentile !== null &&
      snapshot.concentrationPercentile >= 0.65;
    const fragmentationEligible =
      knownCluster &&
      snapshot.activeActorCount >= 3 &&
      snapshot.providerCount >= 3 &&
      snapshot.usageKnownActorCount === snapshot.actorCount &&
      snapshot.usagePercentile !== null &&
      snapshot.usagePercentile >= 0.8 &&
      snapshot.fragmentationPercentile !== null &&
      snapshot.fragmentationPercentile >= 0.65;
    const emergingEligible =
      knownCluster &&
      snapshot.emergence &&
      snapshot.newActorPercentile !== null &&
      snapshot.newActorPercentile >= 0.6 &&
      snapshot.snapshotNewnessPercentile !== null &&
      snapshot.snapshotNewnessPercentile >= 0.6 &&
      snapshot.recentUsageMix !== null &&
      snapshot.recentUsageMix >= 0.25;
    const materialEligible =
      knownCluster &&
      snapshot.materialActorChangeScore !== null &&
      snapshot.materialUsageChangeScore !== null &&
      snapshot.materialActorChangeScore >= 0.25 &&
      snapshot.materialUsageChangeScore >= 0.25;
    const scores = {
      HIGH_USAGE_THIN_SUPPLY: thinEligible
        ? 50 * (snapshot.usagePercentile ?? 0) + 50 * (snapshot.thinSupplyPercentile ?? 0)
        : 0,
      HIGH_USAGE_CONCENTRATED: concentrationEligible
        ? 50 * (snapshot.usagePercentile ?? 0) + 50 * (snapshot.concentrationPercentile ?? 0)
        : 0,
      HIGH_USAGE_FRAGMENTED: fragmentationEligible
        ? 50 * (snapshot.usagePercentile ?? 0) + 50 * (snapshot.fragmentationPercentile ?? 0)
        : 0,
      EMERGING_CLUSTER: emergingEligible
        ? 50 * (snapshot.newActorPercentile ?? 0) + 50 * (snapshot.snapshotNewnessPercentile ?? 0)
        : 0,
      MATERIAL_SNAPSHOT_CHANGE: materialEligible
        ? 50 * (snapshot.materialActorChangeScore ?? 0) + 50 * (snapshot.materialUsageChangeScore ?? 0)
        : 0,
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

export async function fetchApifyStorePage(
  offset: number,
  limit: number,
  signal?: AbortSignal,
): Promise<StorePage> {
  const controller = new AbortController();
  const abortFromParent = () => controller.abort(signal?.reason);
  signal?.addEventListener("abort", abortFromParent, { once: true });
  const timeout = setTimeout(() => {
    controller.abort(new Error(`Apify Store request timed out after ${DISCOVERY_REQUEST_TIMEOUT_MS}ms`));
  }, DISCOVERY_REQUEST_TIMEOUT_MS);
  try {
    const response = await fetch(storeUrl(offset, limit), { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Apify Store request failed with HTTP ${response.status}`);
    }
    return parseStorePage(await response.json(), offset, limit);
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener("abort", abortFromParent);
  }
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
      aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
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
                usageKnownActorCount: snapshot.usageKnownActorCount,
                aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
                aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
                aggregateTotalUsers90Days: snapshot.aggregateTotalUsers90Days,
                newActorCount: snapshot.newActorCount,
                newActorPercentile: snapshot.newActorPercentile,
                snapshotNewnessPercentile: snapshot.snapshotNewnessPercentile,
                materialActorChangeScore: snapshot.materialActorChangeScore,
                materialUsageChangeScore: snapshot.materialUsageChangeScore,
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
    const qualified = scored
      .filter((candidate) => candidate.priorityScore >= DISCOVERY_QUALIFICATION_THRESHOLD)
      .sort((left, right) =>
        right.priorityScore - left.priorityScore ||
        left.clusterKey.localeCompare(right.clusterKey) ||
        left.primaryAnomalyType.localeCompare(right.primaryAnomalyType),
      )
      .slice(0, DISCOVERY_CANDIDATE_CAP);
    for (const snapshot of qualified) {
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
            usageKnownActorCount: snapshot.usageKnownActorCount,
            aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
            aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
            hhi: snapshot.hhi,
            persistence: snapshot.persistence,
            emergence: snapshot.emergence,
            recentUsageMix: snapshot.recentUsageMix,
            newActorCount: snapshot.newActorCount,
            newActorPercentile: snapshot.newActorPercentile,
            snapshotNewnessPercentile: snapshot.snapshotNewnessPercentile,
            materialActorChangeScore: snapshot.materialActorChangeScore,
            materialUsageChangeScore: snapshot.materialUsageChangeScore,
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
              usageKnownActorCount: snapshot.usageKnownActorCount,
              aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
              aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
              hhi: snapshot.hhi,
              persistence: snapshot.persistence,
              emergence: snapshot.emergence,
              recentUsageMix: snapshot.recentUsageMix,
              newActorCount: snapshot.newActorCount,
              newActorPercentile: snapshot.newActorPercentile,
              snapshotNewnessPercentile: snapshot.snapshotNewnessPercentile,
              materialActorChangeScore: snapshot.materialActorChangeScore,
              materialUsageChangeScore: snapshot.materialUsageChangeScore,
              usageSignal: "Apify Store usage telemetry; not revenue or validated demand.",
            },
            sourceSnapshotIds: sql.raw(
              `ARRAY(SELECT DISTINCT value FROM unnest(COALESCE("discovery_candidates"."source_snapshot_ids", ARRAY[]::integer[]) || COALESCE(excluded."source_snapshot_ids", ARRAY[]::integer[])) AS value)`,
            ),
          },
        });
    }
    if (qualified.length > 0) {
      const persistedCandidates = await tx
        .select({
          id: discoveryCandidatesTable.id,
          discoveryKey: discoveryCandidatesTable.discoveryKey,
        })
        .from(discoveryCandidatesTable)
        .where(
          inArray(
            discoveryCandidatesTable.discoveryKey,
            qualified.map((snapshot) => buildDiscoveryKey(snapshot.clusterKey, snapshot.primaryAnomalyType)),
          ),
        );
      const currentObservations = await tx
        .select({
          id: discoveryActorObservationsTable.id,
          categoryKeys: discoveryActorObservationsTable.categoryKeys,
          platformKeys: discoveryActorObservationsTable.platformKeys,
        })
        .from(discoveryActorObservationsTable)
        .where(eq(discoveryActorObservationsTable.runId, runId));
      const observationLinks = [];
      for (const candidate of persistedCandidates) {
        const snapshot = qualified.find(
          (candidateSnapshot) =>
            buildDiscoveryKey(candidateSnapshot.clusterKey, candidateSnapshot.primaryAnomalyType) ===
            candidate.discoveryKey,
        );
        if (!snapshot) continue;
        for (const observation of currentObservations) {
          if (
            observation.categoryKeys.includes(snapshot.category) &&
            observation.platformKeys.includes(snapshot.sourcePlatform)
          ) {
            observationLinks.push({
              observationId: observation.id,
              candidateId: candidate.id,
              opportunityId: null,
              auditRecordId: null,
            });
          }
        }
      }
      if (observationLinks.length > 0) {
        await tx
          .insert(discoveryObservationLinksTable)
          .values(observationLinks)
          .onConflictDoNothing();
      }
    }
    await tx
      .update(discoveryRunsTable)
      .set({
        status: "COMPLETE",
        coverageStatus: "COMPLETE",
        finishedAt: new Date(),
        lastHeartbeatAt: new Date(),
        advertisedTotal: traversal.total,
        observedTotal: traversal.progress.uniqueActorCount,
        effectivePageSize: traversal.progress.effectivePageSize,
        expectedPages: Math.ceil(traversal.total / traversal.progress.effectivePageSize),
        pagesFetched: traversal.progress.pagesFetched,
        currentOffset: traversal.progress.offset,
        requestCount: traversal.progress.requestCount,
        retryCount: traversal.progress.retryCount,
        uniqueActorCount: traversal.progress.uniqueActorCount,
        duplicateActorCount: traversal.progress.duplicateActorCount,
        clusterCount: scored.length,
        candidateCount: qualified.length,
        error: null,
      })
      .where(eq(discoveryRunsTable.id, runId));

    const detailedRunsToKeep = await tx
      .select({ id: discoveryRunsTable.id })
      .from(discoveryRunsTable)
      .where(eq(discoveryRunsTable.status, "COMPLETE"))
      .orderBy(desc(discoveryRunsTable.startedAt))
      .limit(DISCOVERY_DETAILED_RUN_RETENTION);
    const protectedObservations = await tx
      .select({ observationId: discoveryObservationLinksTable.observationId })
      .from(discoveryObservationLinksTable)
      .where(
        or(
          isNotNull(discoveryObservationLinksTable.candidateId),
          isNotNull(discoveryObservationLinksTable.opportunityId),
          isNotNull(discoveryObservationLinksTable.auditRecordId),
        ),
      );
    const retentionPredicates = [];
    if (detailedRunsToKeep.length > 0) {
      retentionPredicates.push(
        notInArray(
          discoveryActorObservationsTable.runId,
          detailedRunsToKeep.map((run) => run.id),
        ),
      );
    }
    if (protectedObservations.length > 0) {
      retentionPredicates.push(
        notInArray(
          discoveryActorObservationsTable.id,
          protectedObservations.map((row) => row.observationId),
        ),
      );
    }
    if (retentionPredicates.length > 0) {
      await tx.delete(discoveryActorObservationsTable).where(and(...retentionPredicates));
    }
  });
}

function stagedRowToActor(row: typeof discoveryStagingActorsTable.$inferSelect): NormalizedActor {
  return {
    actorKey: row.actorKey,
    actorId: row.actorId,
    username: row.username,
    name: row.name,
    title: row.title,
    url: row.url,
    description: row.description,
    categories: row.categories,
    platformMatches: row.platformMatches,
    sourcePlatform: row.platformMatches[0] ?? "UNKNOWN",
    categoryKeys: row.categoryKeys,
    totalUsers: row.totalUsers,
    totalUsers7Days: row.totalUsers7Days,
    totalUsers30Days: row.totalUsers30Days,
    totalUsers90Days: row.totalUsers90Days,
    totalRuns: row.totalRuns,
    totalBuilds: row.totalBuilds,
    lastRunStartedAt: row.lastRunStartedAt,
    actorReviewCount: row.actorReviewCount,
    actorReviewRating: row.actorReviewRating,
    bookmarkCount: row.bookmarkCount,
    pricingModel: row.pricingModel,
    minimalMaxTotalChargeUsd: row.minimalMaxTotalChargeUsd,
    metadataHash: row.metadataHash,
    selectedRaw: row.selectedRaw ?? {},
  };
}

async function previousDiscoverySnapshots(runId: number) {
  const [previousRun] = await db
    .select({ id: discoveryRunsTable.id })
    .from(discoveryRunsTable)
    .where(and(eq(discoveryRunsTable.status, "COMPLETE"), lt(discoveryRunsTable.id, runId)))
    .orderBy(desc(discoveryRunsTable.id))
    .limit(1);
  const snapshots = previousRun
    ? await db
        .select()
        .from(discoveryClusterSnapshotsTable)
        .where(eq(discoveryClusterSnapshotsTable.runId, previousRun.id))
    : [];
  return snapshots.map((snapshot) => ({
    clusterKey: snapshot.clusterKey,
    aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
    aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
    actorCount: snapshot.actorCount,
  }));
}

async function persistActorBatches(
  runId: number,
  actorBatches: AsyncIterable<NormalizedActor[]>,
  accumulators: Map<string, ClusterAccumulator>,
) {
  await db.transaction(async (tx) => {
    for await (const actors of actorBatches) {
      if (actors.length === 0) continue;
      const actorKeys = actors.map((actor) => actor.actorKey);
      const existingActors = await tx
        .select()
        .from(discoveryActorsTable)
        .where(inArray(discoveryActorsTable.actorKey, actorKeys));
      const existingByKey = new Map(existingActors.map((actor) => [actor.actorKey, actor]));
      await tx
        .insert(discoveryActorsTable)
        .values(actors.map((actor) => actorInsert(actor, runId)))
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
      const savedActors = await tx
        .select()
        .from(discoveryActorsTable)
        .where(inArray(discoveryActorsTable.actorKey, actorKeys));
      const actorIdByKey = new Map(savedActors.map((actor) => [actor.actorKey, actor.id]));
      const observations = actors
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
      if (observations.length > 0) {
        await tx
          .insert(discoveryActorObservationsTable)
          .values(observations)
          .onConflictDoNothing({
            target: [discoveryActorObservationsTable.runId, discoveryActorObservationsTable.actorId],
          });
      }
      for (const actor of actors) addActorToClusterAccumulators(accumulators, actor);
    }
  });
}

async function persistDerivedDiscoveryResult(
  runId: number,
  traversal: Extract<TraversalResult, { ok: true }>,
  scored: ScoredCluster[],
) {
  await db.transaction(async (tx) => {
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
                usageKnownActorCount: snapshot.usageKnownActorCount,
                aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
                aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
                aggregateTotalUsers90Days: snapshot.aggregateTotalUsers90Days,
                newActorCount: snapshot.newActorCount,
                newActorPercentile: snapshot.newActorPercentile,
                snapshotNewnessPercentile: snapshot.snapshotNewnessPercentile,
                materialActorChangeScore: snapshot.materialActorChangeScore,
                materialUsageChangeScore: snapshot.materialUsageChangeScore,
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
    const qualified = scored
      .filter((candidate) => candidate.priorityScore >= DISCOVERY_QUALIFICATION_THRESHOLD)
      .sort((left, right) =>
        right.priorityScore - left.priorityScore ||
        left.clusterKey.localeCompare(right.clusterKey) ||
        left.primaryAnomalyType.localeCompare(right.primaryAnomalyType),
      )
      .slice(0, DISCOVERY_CANDIDATE_CAP);
    for (const snapshot of qualified) {
      const snapshotId = snapshotIdByKey.get(snapshot.clusterKey);
      const sourceSnapshotIds = snapshotId ? [snapshotId] : [];
      const structureObservations = {
        actorCount: snapshot.actorCount,
        activeActorCount: snapshot.activeActorCount,
        usageKnownActorCount: snapshot.usageKnownActorCount,
        aggregateTotalUsers30Days: snapshot.aggregateTotalUsers30Days,
        aggregateTotalUsers7Days: snapshot.aggregateTotalUsers7Days,
        hhi: snapshot.hhi,
        persistence: snapshot.persistence,
        emergence: snapshot.emergence,
        recentUsageMix: snapshot.recentUsageMix,
        newActorCount: snapshot.newActorCount,
        newActorPercentile: snapshot.newActorPercentile,
        snapshotNewnessPercentile: snapshot.snapshotNewnessPercentile,
        materialActorChangeScore: snapshot.materialActorChangeScore,
        materialUsageChangeScore: snapshot.materialUsageChangeScore,
        usageSignal: "Apify Store usage telemetry; not revenue or validated demand.",
      };
      await tx
        .insert(discoveryCandidatesTable)
        .values({
          discoveryKey: buildDiscoveryKey(snapshot.clusterKey, snapshot.primaryAnomalyType),
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
          structureObservations,
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
            structureObservations,
            sourceSnapshotIds: sql.raw(
              `ARRAY(SELECT DISTINCT value FROM unnest(COALESCE("discovery_candidates"."source_snapshot_ids", ARRAY[]::integer[]) || COALESCE(excluded."source_snapshot_ids", ARRAY[]::integer[])) AS value)`,
            ),
          },
        });
    }
    if (qualified.length > 0) {
      const persistedCandidates = await tx
        .select({
          id: discoveryCandidatesTable.id,
          discoveryKey: discoveryCandidatesTable.discoveryKey,
        })
        .from(discoveryCandidatesTable)
        .where(
          inArray(
            discoveryCandidatesTable.discoveryKey,
            qualified.map((snapshot) => buildDiscoveryKey(snapshot.clusterKey, snapshot.primaryAnomalyType)),
          ),
        );
      const currentObservations = await tx
        .select({
          id: discoveryActorObservationsTable.id,
          categoryKeys: discoveryActorObservationsTable.categoryKeys,
          platformKeys: discoveryActorObservationsTable.platformKeys,
        })
        .from(discoveryActorObservationsTable)
        .where(eq(discoveryActorObservationsTable.runId, runId));
      const observationLinks = [];
      for (const candidate of persistedCandidates) {
        const snapshot = qualified.find(
          (candidateSnapshot) =>
            buildDiscoveryKey(candidateSnapshot.clusterKey, candidateSnapshot.primaryAnomalyType) ===
            candidate.discoveryKey,
        );
        if (!snapshot) continue;
        for (const observation of currentObservations) {
          if (
            observation.categoryKeys.includes(snapshot.category) &&
            observation.platformKeys.includes(snapshot.sourcePlatform)
          ) {
            observationLinks.push({
              observationId: observation.id,
              candidateId: candidate.id,
              opportunityId: null,
              auditRecordId: null,
            });
          }
        }
      }
      if (observationLinks.length > 0) {
        await tx.insert(discoveryObservationLinksTable).values(observationLinks).onConflictDoNothing();
      }
    }
    await tx
      .update(discoveryRunsTable)
      .set({
        status: "COMPLETE",
        coverageStatus: "COMPLETE",
        finishedAt: new Date(),
        lastHeartbeatAt: new Date(),
        advertisedTotal: traversal.total,
        observedTotal: traversal.progress.uniqueActorCount,
        effectivePageSize: traversal.progress.effectivePageSize,
        expectedPages: Math.ceil(traversal.total / traversal.progress.effectivePageSize),
        pagesFetched: traversal.progress.pagesFetched,
        currentOffset: traversal.progress.offset,
        requestCount: traversal.progress.requestCount,
        retryCount: traversal.progress.retryCount,
        uniqueActorCount: traversal.progress.uniqueActorCount,
        duplicateActorCount: traversal.progress.duplicateActorCount,
        clusterCount: scored.length,
        candidateCount: qualified.length,
        error: null,
      })
      .where(eq(discoveryRunsTable.id, runId));

    const detailedRunsToKeep = await tx
      .select({ id: discoveryRunsTable.id })
      .from(discoveryRunsTable)
      .where(eq(discoveryRunsTable.status, "COMPLETE"))
      .orderBy(desc(discoveryRunsTable.startedAt))
      .limit(DISCOVERY_DETAILED_RUN_RETENTION);
    const protectedObservations = await tx
      .select({ observationId: discoveryObservationLinksTable.observationId })
      .from(discoveryObservationLinksTable)
      .where(
        or(
          isNotNull(discoveryObservationLinksTable.candidateId),
          isNotNull(discoveryObservationLinksTable.opportunityId),
          isNotNull(discoveryObservationLinksTable.auditRecordId),
        ),
      );
    const retentionPredicates = [];
    if (detailedRunsToKeep.length > 0) {
      retentionPredicates.push(
        notInArray(
          discoveryActorObservationsTable.runId,
          detailedRunsToKeep.map((run) => run.id),
        ),
      );
    }
    if (protectedObservations.length > 0) {
      retentionPredicates.push(
        notInArray(
          discoveryActorObservationsTable.id,
          protectedObservations.map((row) => row.observationId),
        ),
      );
    }
    if (retentionPredicates.length > 0) {
      await tx.delete(discoveryActorObservationsTable).where(and(...retentionPredicates));
    }
  });
}

export async function finalizeStagedDiscoveryResult(
  runId: number,
  traversal: Extract<TraversalResult, { ok: true }>,
) {
  const previous = await previousDiscoverySnapshots(runId);
  const accumulators = new Map<string, ClusterAccumulator>();
  async function* stagedBatches() {
    let afterId = 0;
    while (true) {
      const rows = await db
        .select()
        .from(discoveryStagingActorsTable)
        .where(
          and(
            eq(discoveryStagingActorsTable.runId, runId),
            gt(discoveryStagingActorsTable.id, afterId),
          ),
        )
        .orderBy(asc(discoveryStagingActorsTable.id))
        .limit(DISCOVERY_BATCH_SIZE);
      if (rows.length === 0) return;
      afterId = rows[rows.length - 1].id;
      yield rows.map(stagedRowToActor);
    }
  }
  await persistActorBatches(runId, stagedBatches(), accumulators);
  const scored = scoreClusters(finishClusterAccumulators(accumulators, previous), previous);
  await persistDerivedDiscoveryResult(runId, traversal, scored);
  await clearDiscoveryStaging(runId);
}

function sqlExcluded(column: string) {
  return sql.raw(`excluded.${column}`);
}

function sqlIncrement(column: string) {
  return sql.raw(`"discovery_candidates"."${column}" + 1`);
}

export async function reconcileStaleDiscoveryRuns(): Promise<void> {
  const staleBefore = new Date(Date.now() - DISCOVERY_HEARTBEAT_STALE_MS);
  const stale = await db
    .update(discoveryRunsTable)
    .set({
      status: "INTERRUPTED",
      coverageStatus: "INCOMPLETE",
      finishedAt: new Date(),
      error: "Server restarted while the run heartbeat was stale.",
    })
    .where(
      and(
        eq(discoveryRunsTable.status, "RUNNING"),
        or(
          isNull(discoveryRunsTable.lastHeartbeatAt),
          lt(discoveryRunsTable.lastHeartbeatAt, staleBefore),
        ),
      ),
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