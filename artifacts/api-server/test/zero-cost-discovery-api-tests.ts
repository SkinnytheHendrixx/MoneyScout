import assert from "node:assert/strict";
import express from "express";
import { and, eq, inArray } from "drizzle-orm";
import {
  db,
  discoveryCandidatesTable,
  discoveryRunsTable,
  evidenceTable,
  opportunitiesTable,
} from "@workspace/db";
import discoveryRouter, {
  setDiscoveryFetchPageForTests,
  setDiscoveryFinalizeForTests,
  setDiscoveryMaxRetriesForTests,
  setDiscoveryRequestTimeoutForTests,
} from "../src/routes/discovery";

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
if (runIds.length > 0) {
  await db.delete(discoveryRunsTable).where(inArray(discoveryRunsTable.id, runIds));
}
server.close();
console.log("All zero-cost Discovery API tests passed.");