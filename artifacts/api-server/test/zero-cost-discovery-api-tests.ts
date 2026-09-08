import assert from "node:assert/strict";
import express from "express";
import { inArray } from "drizzle-orm";
import { db, discoveryRunsTable } from "@workspace/db";
import discoveryRouter, { setDiscoveryFetchPageForTests } from "../src/routes/discovery";

const app = express();
app.use(express.json());
app.use("/api", discoveryRouter);
const server = app.listen(0);
await new Promise<void>((resolve) => server.once("listening", resolve));
const port = (server.address() as { port: number }).port;

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

await run("incomplete async runs produce no scored candidates", async () => {
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
  assert.equal(finished.status, "INCOMPLETE");
  assert.equal(finished.coverage_status, "INCOMPLETE");
  assert.equal(finished.candidate_count, 0);
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
if (runIds.length > 0) {
  await db.delete(discoveryRunsTable).where(inArray(discoveryRunsTable.id, runIds));
}
server.close();
console.log("All zero-cost Discovery API tests passed.");