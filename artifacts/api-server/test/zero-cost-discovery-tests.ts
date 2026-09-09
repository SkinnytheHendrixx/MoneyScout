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
  assert.deepEqual(offsets, [0, 1_000, 2_000, 3_000]);
  assert.equal(result.progress.uniqueActorCount, 2_001);
  assert.equal(result.progress.duplicateActorCount, 0);
  assert.equal(result.progress.minObservedTotal, 2_001);
  assert.equal(result.progress.totalDrift, 0);
});

await run("bounded total growth permits one extra page and records convergence telemetry", async () => {
  const offsets: number[] = [];
  const items = Array.from({ length: 7 }, (_, index) => actorFixture(index));
  const result = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => {
      offsets.push(offset);
      const total = offset === 0 ? 5 : 7;
      return { total, offset, limit, items: items.slice(offset, offset + limit) };
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(offsets, [0, 2, 4, 6]);
  assert.equal(result.progress.initialTotal, 5);
  assert.equal(result.progress.maxObservedTotal, 7);
  assert.equal(result.progress.initialPageCount, 3);
  assert.equal(result.progress.minObservedTotal, 5);
  assert.equal(result.progress.totalDrift, 2);
});

await run("growth beyond one extra page is hard bounded with exact failure telemetry", async () => {
  const result = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: offset === 0 ? 1 : 5,
      offset,
      limit,
      items: offset === 0 ? [actorFixture(1)] : [actorFixture(2), actorFixture(3)],
    }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.failureTelemetry?.invariant, "growth_exceeds_one_extra_page");
  assert.equal(result.failureTelemetry?.requestedOffset, 2);
  assert.equal(result.failureTelemetry?.returnedTotal, 5);
  assert.equal(result.failureTelemetry?.expectedTotal, 5);
});

await run("bounded shrinkage remains verifiable when the initial range is covered", async () => {
  const bounded = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: offset === 0 ? 3 : 2,
      offset,
      limit,
      items: offset === 0
        ? [actorFixture(1), actorFixture(2)]
        : offset === 2
          ? [actorFixture(3)]
          : [],
    }),
  });
  assert.equal(bounded.ok, true);
  assert.equal(bounded.progress.minObservedTotal, 2);
  assert.equal(bounded.progress.maxObservedTotal, 3);
  assert.equal(bounded.progress.totalDrift, 1);
});

await run("premature shrinkage and mutable duplicate windows cannot verify a pass", async () => {
  const shrank = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: offset === 0 ? 3 : 2,
      offset,
      limit,
      items: offset === 0 ? [actorFixture(1), actorFixture(2)] : [],
    }),
  });
  assert.equal(shrank.ok, false);
  assert.equal(shrank.failureTelemetry?.invariant, "item_count_mismatch");

  const duplicateWindow = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: 4,
      offset,
      limit,
      items: offset === 0
        ? [actorFixture(1), actorFixture(2)]
        : offset === 2
          ? [actorFixture(2), actorFixture(3)]
          : [],
    }),
  });
  assert.equal(duplicateWindow.ok, false);
  assert.equal(duplicateWindow.progress.duplicateActorCount, 1);
   assert.equal(duplicateWindow.failureTelemetry?.invariant, "duplicate_actor_identity");

   const shrinkingDuplicateWindow = await traverseStore({
     pageSize: 2,
     pacingMs: 500,
     sleep: async () => undefined,
     fetchPage: async (offset, limit) => ({
       total: offset === 0 ? 4 : 3,
       offset,
       limit,
       items: offset === 0
         ? [actorFixture(1), actorFixture(2)]
         : offset === 2
           ? [actorFixture(2), actorFixture(3)]
           : [],
     }),
   });
   assert.equal(shrinkingDuplicateWindow.ok, false);
   assert.equal(shrinkingDuplicateWindow.progress.duplicateActorCount, 1);
   assert.equal(shrinkingDuplicateWindow.progress.minObservedTotal, 3);
   assert.equal(shrinkingDuplicateWindow.progress.maxObservedTotal, 4);
   assert.equal(shrinkingDuplicateWindow.failureTelemetry?.invariant, "duplicate_actor_identity");
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
        items: offset === 0 ? [actorFixture(1)] : [],
      };
    },
  });
  assert.equal(capped.ok, true);
  assert.deepEqual(requestedLimits, [DISCOVERY_PAGE_SIZE, DISCOVERY_PAGE_SIZE]);

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
          : offset === 2
            ? [actorFixture(2)]
            : [],
    }),
  });
  assert.equal(result.ok, false);
  assert.deepEqual(result.actors, []);
  assert.equal(result.progress.duplicateActorCount, 1);
});

await run("network attempts are bounded and reported separately from page requests", async () => {
  let attempts = 0;
  const result = await traverseStore({
    pageSize: 2,
    pacingMs: 500,
    sleep: async () => undefined,
    maxRetries: 2,
    fetchPage: async (offset, limit) => {
      attempts += 1;
      if (attempts <= 2) throw new Error("fixture retry");
      return {
        total: 1,
        offset,
        limit,
        items: offset === 0 ? [actorFixture(1)] : [],
      };
    },
  });
  assert.equal(result.ok, true);
  assert.equal(result.progress.requestCount, 2);
  assert.equal(result.progress.networkAttemptCount, 4);
  assert.equal(result.progress.retryCount, 2);
  assert.equal(result.progress.maxNetworkAttempts, 6);
  assert.equal(result.progress.networkAttemptCount <= result.progress.maxNetworkAttempts, true);
});

await run("partial acquisition requests exactly the verified observed slice", async () => {
  const items = Array.from({ length: 15_000 }, (_, index) => actorFixture(index));
  const offsets: number[] = [];
  const limits: number[] = [];
  const result = await traverseStore({
    acquisitionMode: "PARTIAL_OBSERVED_SLICE",
    pageSize: 17,
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => {
      offsets.push(offset);
      limits.push(limit);
      return {
        total: 70_117,
        offset,
        limit,
        items: items.slice(offset, offset + limit),
      };
    },
  });
  assert.equal(result.ok, true);
  assert.deepEqual(offsets, Array.from({ length: 15 }, (_, index) => index * 1_000));
  assert.deepEqual(limits, Array.from({ length: 15 }, () => 1_000));
  assert.equal(offsets.includes(15_000), false);
  assert.equal(result.progress.pageCap, 15);
  assert.equal(result.progress.omittedOffset, 15_000);
  assert.equal(result.progress.initialPageCount, 15);
  assert.equal(result.progress.pagesFetched, 15);
  assert.equal(result.progress.uniqueActorCount, 15_000);
  assert.equal(result.progress.total, 70_117);
});

await run("partial acquisition never converts a short required page into coverage", async () => {
  const offsets: number[] = [];
  const result = await traverseStore({
    acquisitionMode: "PARTIAL_OBSERVED_SLICE",
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => {
      offsets.push(offset);
      const count = offset === 14_000 ? 999 : 1_000;
      return {
        total: 70_117,
        offset,
        limit,
        items: Array.from({ length: count }, (_, index) => actorFixture(offset + index)),
      };
    },
  });
  assert.equal(result.ok, false);
  assert.equal(result.failureTelemetry?.invariant, "item_count_mismatch");
  assert.deepEqual(offsets, Array.from({ length: 15 }, (_, index) => index * 1_000).slice(0, 15));
  assert.equal(offsets.includes(15_000), false);
});

await run("partial acquisition rejects unnormalizable records", async () => {
  const result = await traverseStore({
    acquisitionMode: "PARTIAL_OBSERVED_SLICE",
    pacingMs: 500,
    sleep: async () => undefined,
    fetchPage: async (offset, limit) => ({
      total: 70_117,
      offset,
      limit,
      items: [null, ...Array.from({ length: 999 }, (_, index) => actorFixture(offset + index))],
    }),
  });
  assert.equal(result.ok, false);
  assert.equal(result.failureTelemetry?.invariant, "invalid_actor_identity");
});

await run("partial scoring suppresses supply signals and ignores membership-only changes", () => {
  const previousActor = normalizeActor(actorFixture(1, { platform: "github" })) as NormalizedActor;
  const previousSnapshot = aggregateClusters([previousActor])[0];
  const unchanged = aggregateClusters(
    [previousActor],
    [previousSnapshot],
    {
      acquisitionMode: "PARTIAL_OBSERVED_SLICE",
      previousActorTelemetry: new Map([[previousActor.actorKey, previousActor]]),
    },
  );
  const [unchangedScore] = scoreClusters(unchanged, [], {
    acquisitionMode: "PARTIAL_OBSERVED_SLICE",
  });
  assert.equal(unchangedScore.emergence, false);
  assert.equal(unchangedScore.usagePercentile, null);
  assert.equal(unchangedScore.hhi, null);
  assert.deepEqual(unchangedScore.anomalyTags, []);

  const changedActor = normalizeActor(
    actorFixture(1, {
      platform: "github",
      stats: { totalUsers: 100, totalUsers7Days: 50, totalUsers30Days: 160, totalUsers90Days: 240, totalRuns: 20 },
    }),
  ) as NormalizedActor;
  const changed = aggregateClusters(
    [changedActor],
    [previousSnapshot],
    {
      acquisitionMode: "PARTIAL_OBSERVED_SLICE",
      previousActorTelemetry: new Map([[previousActor.actorKey, previousActor]]),
    },
  );
  const [changedScore] = scoreClusters(changed, [], {
    acquisitionMode: "PARTIAL_OBSERVED_SLICE",
  });
  assert.deepEqual(changedScore.anomalyTags, ["MATERIAL_SNAPSHOT_CHANGE"]);
  assert.equal(changedScore.emergence, false);
  assert.equal(changedScore.thinSupplyPercentile, null);
  assert.equal(changedScore.concentrationPercentile, null);
  assert.equal(changedScore.fragmentationPercentile, null);
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