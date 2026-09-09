import assert from "node:assert/strict";
import express from "express";
import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  discoveryCandidatesTable,
  discoveryActorsTable,
  discoveryActorObservationsTable,
  discoveryClusterSnapshotsTable,
  discoveryObservationLinksTable,
  discoveryRunsTable,
  discoveryRunPassesTable,
  discoveryRunPassMembershipsTable,
  discoveryStagingActorsTable,
  evidenceTable,
  opportunitiesTable,
} from "@workspace/db";
import discoveryRouter, {
  setDiscoveryFetchPageForTests,
  setDiscoveryFinalizeForTests,
  setDiscoveryMaxRetriesForTests,
  setDiscoveryRequestTimeoutForTests,
  setDiscoverySleepForTests,
  setDiscoveryAcquisitionModeForTests,
} from "../src/routes/discovery";
import {
  finalizeStagedDiscoveryResult,
  setDiscoveryDerivedFailureForTests,
} from "../src/lib/discovery";

const app = express();
app.use(express.json());
app.use("/api", discoveryRouter);
const server = app.listen(0);
await new Promise<void>((resolve) => server.once("listening", resolve));
const port = (server.address() as { port: number }).port;
await db.delete(discoveryRunsTable);

const waitForStatus = async (runId: number) => {
  for (let attempt = 0; attempt < 100; attempt += 1) {
    const response = await fetch(`http://127.0.0.1:${port}/api/discovery/runs/${runId}/status`);
    const status = await response.json() as { status: string };
    if (status.status !== "RUNNING") return status;
    await new Promise((resolve) => setTimeout(resolve, 5));
  }
  throw new Error("fixture discovery run did not finish");
};

const run = async (name: string, test: () => Promise<void>) => {
  try {
    await test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const runIds: number[] = [];
setDiscoverySleepForTests(async () => undefined);
setDiscoveryAcquisitionModeForTests("FULL_CATALOG");

const convergenceActor = (id: string) => ({
  id,
  username: id,
  name: id,
  title: id,
  url: `https://apify.com/${id}`,
  platform: "unclassified",
  categories: ["unclassified"],
});

const startFixtureRun = async (
  pages: Array<{ total: number; items: unknown[]; limit?: number }>,
) => {
  let pageIndex = 0;
  setDiscoveryMaxRetriesForTests(0);
  setDiscoveryFetchPageForTests(async (offset, limit) => {
    const page = pages[pageIndex++];
    if (!page) throw new Error(`unexpected fixture page at offset ${offset}`);
    return { ...page, offset, limit: page.limit ?? limit };
  });
  const response = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(response.status, 202);
  const started = await response.json() as { id: number };
  runIds.push(started.id);
  const finished = await waitForStatus(started.id);
  return { startedId: started.id, finished };
};

await run("staged finalization persists multiple batches and protects linked history", async () => {
  const fixtureCandidateKey = "apify:JAVASCRIPT:FINANCE:HIGH_USAGE_FRAGMENTED";
  const fixtureStagedActorKeys = Array.from(
    { length: 501 },
    (_, index) => `fixture:staged-${index}`,
  );
  await db
    .delete(discoveryCandidatesTable)
    .where(eq(discoveryCandidatesTable.discoveryKey, fixtureCandidateKey));
  await db.delete(discoveryActorsTable).where(
    inArray(discoveryActorsTable.actorKey, [
      ...fixtureStagedActorKeys,
      "fixture:protected-history",
      "fixture:retention-cleanup",
    ]),
  );

  const now = Date.now();
  const retentionRuns = await db
    .insert(discoveryRunsTable)
    .values(
      [4, 3, 2].map((daysAgo) => ({
        status: "COMPLETE" as const,
        coverageStatus: "COMPLETE" as const,
        startedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000),
        finishedAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000 + 1_000),
        lastHeartbeatAt: new Date(now - daysAgo * 24 * 60 * 60 * 1000 + 1_000),
        queryDefinition: { fixture: "multi-batch-finalization", daysAgo },
        pageSize: 1_000,
        effectivePageSize: 1_000,
        pacingMs: 0,
        formulaVersion: "fixture",
        advertisedTotal: 501,
        observedTotal: 501,
        expectedPages: 1,
        pagesFetched: 1,
        currentOffset: 0,
        requestCount: 1,
        uniqueActorCount: 501,
      })),
    )
    .returning();
  const staleRun = retentionRuns[0];
  const latestPreviousRun = retentionRuns[2];

  const [previousSnapshot] = await db
    .insert(discoveryClusterSnapshotsTable)
    .values({
      runId: latestPreviousRun.id,
      clusterKey: "JAVASCRIPT:FINANCE",
      sourcePlatform: "JAVASCRIPT",
      category: "FINANCE",
      actorCount: 501,
      activeActorCount: 501,
      usageKnownActorCount: 501,
      aggregateTotalUsers30Days: 50_100,
      aggregateTotalUsers7Days: 10_020,
      aggregateTotalUsers90Days: 60_120,
      newActorCount: 0,
      newActorPercentile: 0,
      snapshotNewnessPercentile: 0,
      usagePercentile: 1,
      thinSupplyPercentile: 1,
      hhi: 0.001996007984031936,
      concentrationPercentile: 0.001996007984031936,
      fragmentationPercentile: 0.998003992015968,
      persistence: true,
      emergence: false,
      recentUsageMix: 0.2,
      pricingModelCounts: { unknown: 501 },
      formulaVersion: "fixture",
    })
    .returning();

  const [candidate] = await db
    .insert(discoveryCandidatesTable)
    .values({
      discoveryKey: fixtureCandidateKey,
      clusterKey: "JAVASCRIPT:FINANCE",
      sourcePlatform: "JAVASCRIPT",
      category: "FINANCE",
      primaryAnomalyType: "HIGH_USAGE_FRAGMENTED",
      anomalyTags: ["HIGH_USAGE_FRAGMENTED"],
      latestPriorityScore: 70,
      scoreBreakdown: { HIGH_USAGE_FRAGMENTED: 70 },
      structureObservations: { fixture: true },
      sourceSnapshotIds: [previousSnapshot.id],
    })
    .returning();

  const protectedActors = await db
    .insert(discoveryActorsTable)
    .values([
      {
        actorKey: "fixture:protected-history",
        actorId: "protected-history",
        username: "protected-history",
        name: "Protected History",
        title: "Protected History",
        url: "https://apify.com/protected-history",
        platformMatches: ["JAVASCRIPT"],
        categories: ["finance"],
        latestCompleteRunId: staleRun.id,
        latestMetadataHash: "protected-history",
        latestMetadata: { fixture: true },
      },
      {
        actorKey: "fixture:retention-cleanup",
        actorId: "retention-cleanup",
        username: "retention-cleanup",
        name: "Retention Cleanup",
        title: "Retention Cleanup",
        url: "https://apify.com/retention-cleanup",
        platformMatches: ["JAVASCRIPT"],
        categories: ["finance"],
        latestCompleteRunId: staleRun.id,
        latestMetadataHash: "retention-cleanup",
        latestMetadata: { fixture: true },
      },
    ])
    .returning();
  const staleObservations = await db
    .insert(discoveryActorObservationsTable)
    .values(
      protectedActors.map((actor) => ({
        runId: staleRun.id,
        actorId: actor.id,
        actorKey: actor.actorKey,
        categoryKeys: ["FINANCE"],
        platformKeys: ["JAVASCRIPT"],
        totalUsers: 100,
        totalUsers7Days: 20,
        totalUsers30Days: 100,
        totalUsers90Days: 120,
        metadataHash: actor.actorKey,
        selectedRaw: { fixture: true },
      })),
    )
    .returning();
  await db.insert(discoveryObservationLinksTable).values({
    observationId: staleObservations[0].id,
    candidateId: candidate.id,
  });

  const [runToFinalize] = await db
    .insert(discoveryRunsTable)
    .values({
      queryDefinition: { fixture: "multi-batch-finalization" },
      pageSize: 1_000,
      pacingMs: 0,
      formulaVersion: "fixture",
    })
    .returning();
  runIds.push(runToFinalize.id, ...retentionRuns.map((run) => run.id));

  const stagedRows = fixtureStagedActorKeys.map((actorKey, index) => ({
    runId: runToFinalize.id,
    actorKey,
    actorId: `staged-${index}`,
    username: `staged-${index}`,
    name: `Staged Actor ${index}`,
    title: `Staged Actor ${index}`,
    url: `https://apify.com/staged-${index}`,
    description: "Multi-batch finalization fixture",
    categories: ["finance"],
    platformMatches: ["JAVASCRIPT"],
    categoryKeys: ["FINANCE"],
    totalUsers: 100,
    totalUsers7Days: 20,
    totalUsers30Days: 100,
    totalUsers90Days: 120,
    totalRuns: 10,
    totalBuilds: 5,
    metadataHash: `staged-${index}`,
    selectedRaw: { fixture: true, index },
  }));
  assert.equal(stagedRows.length > 500, true);
  await db.insert(discoveryStagingActorsTable).values(stagedRows);

  await finalizeStagedDiscoveryResult(runToFinalize.id, {
    ok: true,
    total: stagedRows.length,
    pages: [],
    actors: [],
    progress: {
      offset: 0,
      total: stagedRows.length,
      effectivePageSize: 1_000,
      pagesFetched: 1,
      requestCount: 1,
      retryCount: 0,
      uniqueActorCount: stagedRows.length,
      duplicateActorCount: 0,
    },
  });

  const persistedActors = await db
    .select()
    .from(discoveryActorsTable)
    .where(inArray(discoveryActorsTable.actorKey, stagedRows.map((row) => row.actorKey)));
  assert.equal(persistedActors.length, stagedRows.length);

  const currentObservations = await db
    .select()
    .from(discoveryActorObservationsTable)
    .where(eq(discoveryActorObservationsTable.runId, runToFinalize.id));
  assert.equal(currentObservations.length, stagedRows.length);

  const [completedRun] = await db
    .select()
    .from(discoveryRunsTable)
    .where(eq(discoveryRunsTable.id, runToFinalize.id));
  assert.equal(completedRun.status, "COMPLETE");
  assert.equal(completedRun.clusterCount, 1);
  assert.equal(completedRun.candidateCount, 1);

  const [currentSnapshot] = await db
    .select()
    .from(discoveryClusterSnapshotsTable)
    .where(eq(discoveryClusterSnapshotsTable.runId, runToFinalize.id));
  assert.equal(currentSnapshot.clusterKey, "JAVASCRIPT:FINANCE");
  assert.equal(currentSnapshot.actorCount, stagedRows.length);

  const [updatedCandidate] = await db
    .select()
    .from(discoveryCandidatesTable)
    .where(eq(discoveryCandidatesTable.id, candidate.id));
  assert.equal(updatedCandidate.occurrenceCount, 2);
  assert.deepEqual(
    updatedCandidate.sourceSnapshotIds.sort((left, right) => left - right),
    [previousSnapshot.id, currentSnapshot.id].sort((left, right) => left - right),
  );

  const currentLinks = await db
    .select()
    .from(discoveryObservationLinksTable)
    .where(
      and(
        eq(discoveryObservationLinksTable.candidateId, candidate.id),
        inArray(
          discoveryObservationLinksTable.observationId,
          currentObservations.map((observation) => observation.id),
        ),
      ),
    );
  assert.equal(currentLinks.length, stagedRows.length);

  const staleObservationsAfterRetention = await db
    .select()
    .from(discoveryActorObservationsTable)
    .where(eq(discoveryActorObservationsTable.runId, staleRun.id));
  assert.deepEqual(staleObservationsAfterRetention.map((observation) => observation.id), [staleObservations[0].id]);

  const [remainingStaging] = await db
    .select({ count: discoveryStagingActorsTable.id })
    .from(discoveryStagingActorsTable)
    .where(eq(discoveryStagingActorsTable.runId, runToFinalize.id));
  assert.equal(remainingStaging, undefined);

  await db.delete(discoveryCandidatesTable).where(eq(discoveryCandidatesTable.id, candidate.id));
  await db.delete(discoveryActorsTable).where(
    inArray(discoveryActorsTable.actorKey, [
      ...stagedRows.map((row) => row.actorKey),
      ...protectedActors.map((actor) => actor.actorKey),
    ]),
  );
});

await run("manual discovery returns 202 and status polling reaches COMPLETE", async () => {
  setDiscoveryFetchPageForTests(async (offset, limit) => ({
    total: 0,
    offset,
    limit,
    items: [],
  }));
  const response = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(response.status, 202);
  const started = await response.json() as { id: number; status: string };
  runIds.push(started.id);
  assert.equal(started.status, "RUNNING");
  const finished = await waitForStatus(started.id) as { status: string; coverage_status: string; candidate_count: number };
  assert.equal(finished.status, "COMPLETE");
  assert.equal(finished.coverage_status, "COMPLETE");
  assert.equal(finished.candidate_count, 0);
});

await run("canonical membership converges despite reordered actors and changed observed totals", async () => {
  const actorA = convergenceActor("convergence-a");
  const actorB = convergenceActor("convergence-b");
  const { startedId, finished } = await startFixtureRun([
    { total: 2, items: [actorA, actorB] },
    { total: 3, items: [] },
    { total: 2, items: [actorB, actorA] },
    { total: 2, items: [] },
  ]);
  const terminal = finished as {
    status: string;
    verification_status: string;
    candidate_count: number;
  };
  assert.equal(terminal.status, "COMPLETE");
  assert.equal(terminal.verification_status, "VERIFIED_CONVERGENCE");
  assert.equal(terminal.candidate_count, 0);

  const passes = await db
    .select()
    .from(discoveryRunPassesTable)
    .where(eq(discoveryRunPassesTable.runId, startedId));
  assert.equal(passes.length, 2);
  assert.deepEqual(
    passes.map((pass) => ({
      status: pass.status,
      uniqueActorCount: pass.uniqueActorCount,
      minObservedTotal: pass.minObservedTotal,
      maxObservedTotal: pass.maxObservedTotal,
      totalDrift: pass.totalDrift,
      pass1OnlyCount: pass.pass1OnlyCount,
      pass2OnlyCount: pass.pass2OnlyCount,
    })),
    [
      {
        status: "COMPLETE",
        uniqueActorCount: 2,
        minObservedTotal: 2,
        maxObservedTotal: 3,
        totalDrift: 1,
        pass1OnlyCount: 0,
        pass2OnlyCount: 0,
      },
      {
        status: "COMPLETE",
        uniqueActorCount: 2,
        minObservedTotal: 2,
        maxObservedTotal: 2,
        totalDrift: 0,
        pass1OnlyCount: 0,
        pass2OnlyCount: 0,
      },
    ],
  );
  const memberships = await db
    .select()
    .from(discoveryRunPassMembershipsTable)
    .where(eq(discoveryRunPassMembershipsTable.runId, startedId));
  assert.equal(memberships.length, 0);
});

await run("duplicate canonical identities fail before convergence even when totals shrink", async () => {
  const actorA = convergenceActor("duplicate-a");
  const actorB = convergenceActor("duplicate-b");
  const actorC = convergenceActor("duplicate-c");
  const { startedId, finished } = await startFixtureRun([
    { total: 4, limit: 2, items: [actorA, actorB] },
    { total: 3, limit: 2, items: [actorB, actorC] },
    { total: 3, limit: 2, items: [] },
  ]);
  const terminal = finished as {
    status: string;
    verification_status: string;
    candidate_count: number;
  };
  assert.equal(terminal.status, "INCOMPLETE");
  assert.equal(terminal.verification_status, "UNVERIFIED");
  assert.equal(terminal.candidate_count, 0);

  const passes = await db
    .select()
    .from(discoveryRunPassesTable)
    .where(eq(discoveryRunPassesTable.runId, startedId));
  assert.equal(passes.length, 1);
  assert.equal(passes[0].status, "UNVERIFIED");
  assert.equal(passes[0].duplicateActorCount, 1);
  assert.equal(passes[0].failureTelemetry?.invariant, "duplicate_actor_identity");

  const [remainingStaging] = await db
    .select({ count: discoveryStagingActorsTable.id })
    .from(discoveryStagingActorsTable)
    .where(eq(discoveryStagingActorsTable.runId, startedId));
  assert.equal(remainingStaging, undefined);
});

await run("same totals with changed canonical membership remain incomplete", async () => {
  const { startedId, finished } = await startFixtureRun([
    { total: 2, items: [convergenceActor("same-total-a"), convergenceActor("same-total-b")] },
    { total: 2, items: [] },
    { total: 2, items: [convergenceActor("same-total-a"), convergenceActor("same-total-c")] },
    { total: 2, items: [] },
  ]);
  const terminal = finished as { status: string; verification_status: string };
  assert.equal(terminal.status, "INCOMPLETE");
  assert.equal(terminal.verification_status, "UNVERIFIED");
  const passes = await db
    .select()
    .from(discoveryRunPassesTable)
    .where(eq(discoveryRunPassesTable.runId, startedId));
  assert.deepEqual(
    passes.map((pass) => [pass.status, pass.pass1OnlyCount, pass.pass2OnlyCount]),
    [
      ["UNVERIFIED", 1, 1],
      ["UNVERIFIED", 1, 1],
    ],
  );
});

await run("actor additions and removals are both rejected by the anti-join", async () => {
  const added = await startFixtureRun([
    { total: 2, items: [convergenceActor("addition-a"), convergenceActor("addition-b")] },
    { total: 2, items: [] },
    { total: 3, items: [convergenceActor("addition-a"), convergenceActor("addition-b"), convergenceActor("addition-c")] },
    { total: 3, items: [] },
  ]);
  assert.equal((added.finished as { status: string }).status, "INCOMPLETE");

  const removed = await startFixtureRun([
    { total: 3, items: [convergenceActor("removal-a"), convergenceActor("removal-b"), convergenceActor("removal-c")] },
    { total: 3, items: [] },
    { total: 2, items: [convergenceActor("removal-a"), convergenceActor("removal-b")] },
    { total: 2, items: [] },
  ]);
  assert.equal((removed.finished as { status: string }).status, "INCOMPLETE");

  for (const runId of [added.startedId, removed.startedId]) {
    const passes = await db
      .select()
      .from(discoveryRunPassesTable)
      .where(eq(discoveryRunPassesTable.runId, runId));
    assert.equal(passes.every((pass) => pass.pass1OnlyCount !== 0 || pass.pass2OnlyCount !== 0), true);
  }
});

await run("a failed second pass persists exact failure telemetry and no published result", async () => {
  const actorA = convergenceActor("failure-a");
  const actorB = convergenceActor("failure-b");
  const { startedId, finished } = await startFixtureRun([
    { total: 2, items: [actorA, actorB] },
    { total: 2, items: [] },
    { total: 2, items: [actorA] },
  ]);
  const terminal = finished as { status: string; candidate_count: number };
  assert.equal(terminal.status, "FAILED");
  assert.equal(terminal.candidate_count, 0);
  const passes = await db
    .select()
    .from(discoveryRunPassesTable)
    .where(eq(discoveryRunPassesTable.runId, startedId));
  const failedPass = passes.find((pass) => pass.passNumber === 2);
  assert.equal(failedPass?.status, "FAILED");
  assert.equal(failedPass?.requestCount, 1);
  assert.equal(failedPass?.networkAttemptCount, 1);
  assert.equal(failedPass?.failureTelemetry?.invariant, "item_count_mismatch");
});

await run("malformed async runs become terminal failures with no scored candidates", async () => {
  setDiscoveryFetchPageForTests(async (offset, limit) => ({
    total: 1,
    offset,
    limit,
    items: [],
  }));
  const response = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(response.status, 202);
  const started = await response.json() as { id: number };
  runIds.push(started.id);
  const finished = await waitForStatus(started.id) as { status: string; coverage_status: string; candidate_count: number };
  assert.equal(finished.status, "FAILED");
  assert.equal(finished.coverage_status, "INCOMPLETE");
  assert.equal(finished.candidate_count, 0);
});

await run("request failures transition terminal and release the active-run guard", async () => {
  setDiscoveryMaxRetriesForTests(0);
  setDiscoveryFetchPageForTests(async () => {
    throw new Error("fixture request failure");
  });
  const failedResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(failedResponse.status, 202);
  const failedStart = await failedResponse.json() as { id: number };
  runIds.push(failedStart.id);
  const failed = await waitForStatus(failedStart.id) as { status: string; error: string | null };
  assert.equal(failed.status, "FAILED");
  assert.match(failed.error ?? "", /fixture request failure/);

  setDiscoveryFetchPageForTests(async (offset, limit) => ({
    total: 0,
    offset,
    limit,
    items: [],
  }));
  const retryResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(retryResponse.status, 202);
  const retry = await retryResponse.json() as { id: number };
  runIds.push(retry.id);
  const retryFinished = await waitForStatus(retry.id) as { status: string };
  assert.equal(retryFinished.status, "COMPLETE");
});

await run("finalization failures transition terminal and release the active-run guard", async () => {
  setDiscoveryFetchPageForTests(async (offset, limit) => ({
    total: 0,
    offset,
    limit,
    items: [],
  }));
  setDiscoveryFinalizeForTests(async () => {
    throw new Error("fixture finalization failure");
  });
  const failedResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(failedResponse.status, 202);
  const failedStart = await failedResponse.json() as { id: number };
  runIds.push(failedStart.id);
  const failed = await waitForStatus(failedStart.id) as { status: string; error: string | null };
  assert.equal(failed.status, "FAILED");
  assert.match(failed.error ?? "", /fixture finalization failure/);

  setDiscoveryFinalizeForTests(null);
  const retryResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(retryResponse.status, 202);
  const retry = await retryResponse.json() as { id: number };
  runIds.push(retry.id);
  const retryFinished = await waitForStatus(retry.id) as { status: string };
  assert.equal(retryFinished.status, "COMPLETE");
});

await run("derived write failures roll back all finalized Discovery records", async () => {
  const actorKey = "apify:id:rollback-fixture";
  const candidateKey = "apify:JAVASCRIPT:FINANCE:HIGH_USAGE_THIN_SUPPLY";
  await db.delete(discoveryCandidatesTable).where(eq(discoveryCandidatesTable.discoveryKey, candidateKey));
  await db.delete(discoveryActorsTable).where(eq(discoveryActorsTable.actorKey, actorKey));

  setDiscoveryFetchPageForTests(async (offset, limit) => ({
    total: 1,
    offset,
    limit,
    items: offset === 0 ? [
      {
        id: "rollback-fixture",
        username: "rollback-fixture",
        name: "JavaScript Finance Rollback Fixture",
        title: "JavaScript Finance Rollback Fixture",
        description: "javascript finance rollback fixture",
        platform: "javascript",
        categories: ["finance"],
        stats: {
          totalUsers: 100,
          totalUsers7Days: 20,
          totalUsers30Days: 100,
          totalUsers90Days: 120,
        },
      },
    ] : [],
  }));
  setDiscoveryDerivedFailureForTests("fixture derived write failure");
  try {
    const response = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
    assert.equal(response.status, 202);
    const started = await response.json() as { id: number };
    runIds.push(started.id);

    const failed = await waitForStatus(started.id) as { status: string; coverage_status: string; error: string | null };
    assert.equal(failed.status, "FAILED");
    assert.equal(failed.coverage_status, "INCOMPLETE");
    assert.match(failed.error ?? "", /fixture derived write failure/);

    const stagingRows = await db
      .select()
      .from(discoveryStagingActorsTable)
      .where(eq(discoveryStagingActorsTable.runId, started.id));
    assert.equal(stagingRows.length, 0);

    const actors = await db
      .select()
      .from(discoveryActorsTable)
      .where(eq(discoveryActorsTable.actorKey, actorKey));
    assert.equal(actors.length, 0);

    const observations = await db
      .select()
      .from(discoveryActorObservationsTable)
      .where(eq(discoveryActorObservationsTable.runId, started.id));
    assert.equal(observations.length, 0);

    const snapshots = await db
      .select()
      .from(discoveryClusterSnapshotsTable)
      .where(eq(discoveryClusterSnapshotsTable.runId, started.id));
    assert.equal(snapshots.length, 0);

    const candidates = await db
      .select()
      .from(discoveryCandidatesTable)
      .where(eq(discoveryCandidatesTable.discoveryKey, candidateKey));
    assert.equal(candidates.length, 0);

    const links = await db.select().from(discoveryObservationLinksTable);
    assert.equal(links.length, 0);
  } finally {
    setDiscoveryDerivedFailureForTests(null);
    setDiscoveryFetchPageForTests(null);
  }
});

await run("concurrent acceptance creates one opportunity and one Discovery FACT", async () => {
  const [candidate] = await db
    .insert(discoveryCandidatesTable)
    .values({
      discoveryKey: "fixture:acceptance-race",
      clusterKey: "GITHUB:FINANCE",
      sourcePlatform: "GITHUB",
      category: "FINANCE",
      primaryAnomalyType: "HIGH_USAGE_THIN_SUPPLY",
      anomalyTags: ["HIGH_USAGE_THIN_SUPPLY"],
      latestPriorityScore: 80,
      scoreBreakdown: { HIGH_USAGE_THIN_SUPPLY: 80 },
      structureObservations: {
        actorCount: 1,
        activeActorCount: 1,
        aggregateTotalUsers30Days: 100,
      },
      sourceSnapshotIds: [],
    })
    .returning();
  const accept = () =>
    fetch(`http://127.0.0.1:${port}/api/discovery/candidates/${candidate.id}/accept`, {
      method: "POST",
    });
  const responses = await Promise.all([accept(), accept()]);
  assert.equal(responses[0].status, 200);
  assert.equal(responses[1].status, 200);
  const accepted = await responses[0].json() as { opportunity_id: number };
  const acceptedAgain = await responses[1].json() as { opportunity_id: number };
  assert.equal(acceptedAgain.opportunity_id, accepted.opportunity_id);
  const facts = await db
    .select()
    .from(evidenceTable)
    .where(
      and(
        eq(evidenceTable.opportunityId, accepted.opportunity_id),
        eq(evidenceTable.evaluationDimension, "discovery_scout"),
        eq(evidenceTable.classification, "FACT"),
      ),
    );
  assert.equal(facts.length, 1);
  await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, accepted.opportunity_id));
  await db.delete(discoveryCandidatesTable).where(eq(discoveryCandidatesTable.id, candidate.id));
});

await run("request timeout transitions terminal and releases the active-run guard", async () => {
  setDiscoveryMaxRetriesForTests(0);
  setDiscoveryRequestTimeoutForTests(5);
  setDiscoveryFetchPageForTests(async () => new Promise<never>(() => undefined));
  const failedResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(failedResponse.status, 202);
  const failedStart = await failedResponse.json() as { id: number };
  runIds.push(failedStart.id);
  const failed = await waitForStatus(failedStart.id) as { status: string; error: string | null };
  assert.equal(failed.status, "FAILED");
  assert.match(failed.error ?? "", /timed out/);
  setDiscoveryRequestTimeoutForTests(null);
});

await run("only one traversal can be active at a time", async () => {
  let release!: () => void;
  const gate = new Promise<void>((resolve) => {
    release = resolve;
  });
  setDiscoveryFetchPageForTests(async (offset, limit) => {
    await gate;
    return { total: 0, offset, limit, items: [] };
  });
  const firstResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(firstResponse.status, 202);
  const first = await firstResponse.json() as { id: number };
  runIds.push(first.id);
  const secondResponse = await fetch(`http://127.0.0.1:${port}/api/discovery/runs`, { method: "POST" });
  assert.equal(secondResponse.status, 409);
  release();
  const finished = await waitForStatus(first.id) as { status: string };
  assert.equal(finished.status, "COMPLETE");
});

setDiscoveryFetchPageForTests(null);
setDiscoveryFinalizeForTests(null);
setDiscoveryRequestTimeoutForTests(null);
setDiscoveryMaxRetriesForTests(null);
setDiscoverySleepForTests(null);
setDiscoveryAcquisitionModeForTests(null);
if (runIds.length > 0) {
  await db.delete(discoveryRunsTable).where(inArray(discoveryRunsTable.id, runIds));
}
server.close();
console.log("All zero-cost Discovery API tests passed.");