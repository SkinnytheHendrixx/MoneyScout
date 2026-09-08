import assert from "node:assert/strict";
import {
  aggregateClusters,
  buildDiscoveryKey,
  DISCOVERY_PAGE_SIZE,
  normalizeActor,
  scoreClusters,
  traverseStore,
  type NormalizedActor,
} from "../src/lib/discovery";

const actorFixture = (index: number, overrides: Record<string, unknown> = {}) => ({
  id: `actor-${index}`,
  username: `actor-${index}`,
  name: `Actor ${index}`,
  title: `Fixture Actor ${index}`,
  url: `https://apify.com/actor-${index}`,
  categories: ["finance"],
  platform: "javascript",
  stats: {
    totalUsers: 100 + index,
    totalUsers7Days: 20 + index,
    totalUsers30Days: 80 + index,
    totalUsers90Days: 120 + index,
    totalRuns: 10 + index,
  },
  ...overrides,
});

const run = async (name: string, test: () => Promise<void> | void) => {
  try {
    await test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

await run("complete traversal uses exact offsets and validates coverage", async () => {
  const items = Array.from({ length: 2_001 }, (_, index) => actorFixture(index));
  const offsets: number[] = [];
  const result = await traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => {
      offsets.push(offset);
      return {
        total: items.length,
        offset,
        limit,
        items: items.slice(offset, offset + limit),
      };
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(offsets, [0, 1_000, 2_000]);
  assert.equal(result.progress.uniqueActorCount, 2_001);
  assert.equal(result.progress.duplicateActorCount, 0);
});

await run("incomplete and failed traversals produce no scored actors", async () => {
  const incomplete = await traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: 1_001,
      offset,
      limit,
      items: offset === 0 ? [actorFixture(1)] : [],
    }),
  });
  assert.equal(incomplete.ok, false);
  assert.deepEqual(incomplete.actors, []);

  const failed = await traverseStore({
    pageSize: 1_000,
    sleep: async () => undefined,
    fetchPage: async () => {
      throw new Error("fixture outage");
    },
    maxRetries: 1,
  });
  assert.equal(failed.ok, false);
  assert.deepEqual(failed.actors, []);
  assert.match(failed.error, /fixture outage/);
});

await run("traversal caps page size and validates the first page length", async () => {
  const requestedLimits: number[] = [];
  const capped = await traverseStore({
    pageSize: DISCOVERY_PAGE_SIZE * 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => {
      requestedLimits.push(limit);
      return {
        total: 1,
        offset,
        limit,
        items: [actorFixture(1)],
      };
    },
  });
  assert.equal(capped.ok, true);
  assert.deepEqual(requestedLimits, [DISCOVERY_PAGE_SIZE]);

  const malformedFirstPage = await traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: 2,
      offset,
      limit,
      items: [actorFixture(1)],
    }),
  });
  assert.equal(malformedFirstPage.ok, false);
  assert.match(malformedFirstPage.error, /invalid first page/);
});

await run("request timeouts and cancellation become failed traversals", async () => {
  const timedOut = await traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    maxRetries: 0,
    requestTimeoutMs: 5,
    fetchPage: async () => new Promise<never>(() => undefined),
  });
  assert.equal(timedOut.ok, false);
  assert.match(timedOut.error, /timed out/);

  const controller = new AbortController();
  controller.abort(new Error("fixture cancellation"));
  const cancelled = await traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    maxRetries: 0,
    signal: controller.signal,
    fetchPage: async () => ({
      total: 0,
      offset: 0,
      limit: 1_000,
      items: [],
    }),
  });
  assert.equal(cancelled.ok, false);
  assert.match(cancelled.error, /fixture cancellation/);

  const activeController = new AbortController();
  const cancellationPromise = traverseStore({
    pageSize: 1_000,
    pacingMs: 500,
    sleep: async () => undefined,
    maxRetries: 0,
    requestTimeoutMs: 10_000,
    signal: activeController.signal,
    fetchPage: async () => new Promise<never>(() => undefined),
  });
  setTimeout(() => activeController.abort(new Error("fixture active cancellation")), 5);
  const cancelledDuringRequest = await cancellationPromise;
  assert.equal(cancelledDuringRequest.ok, false);
  assert.match(cancelledDuringRequest.error, /fixture active cancellation/);
});

await run("duplicates are detected without creating duplicate actors", async () => {
  const result = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: 3,
      offset,
      limit,
      items:
        offset === 0
          ? [actorFixture(1), actorFixture(2)]
          : [actorFixture(2)],
    }),
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.actors, []);
  assert.equal(result.progress.duplicateActorCount, 1);
});

await run("one-actor clusters never receive both thin-supply and concentration", () => {
  const actor = normalizeActor(actorFixture(1, { platform: "github" })) as NormalizedActor;
  const snapshots = aggregateClusters([actor]);
  const [scored] = scoreClusters(snapshots);
  assert.equal(scored.actorCount, 1);
  assert.equal(scored.anomalyTags.includes("HIGH_USAGE_THIN_SUPPLY"), true);
  assert.equal(scored.anomalyTags.includes("HIGH_USAGE_CONCENTRATED"), false);
  assert.equal(scored.priorityScore, Math.max(...Object.values(scored.scoreBreakdown)));
});

await run("UNKNOWN clusters cannot qualify", () => {
  const actor = normalizeActor(actorFixture(1, { platform: "unclassified source" })) as NormalizedActor;
  const [scored] = scoreClusters(aggregateClusters([actor]));
  assert.equal(scored.sourcePlatform, "UNKNOWN");
  assert.equal(scored.priorityScore, 0);
  assert.deepEqual(scored.anomalyTags, []);
});

await run("discovery keys remain stable and candidates are usage-labeled", () => {
  assert.equal(
    buildDiscoveryKey("javascript:finance", "HIGH_USAGE_THIN_SUPPLY"),
    "apify:javascript:finance:HIGH_USAGE_THIN_SUPPLY",
  );
});

console.log("All zero-cost Discovery tests passed.");