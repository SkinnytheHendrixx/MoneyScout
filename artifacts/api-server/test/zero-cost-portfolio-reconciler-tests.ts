import assert from "node:assert/strict";
import type { discoveryCandidatesTable } from "@workspace/db";
import { activityEstimateForStage } from "../src/lib/lifecycle-state";
import {
  PORTFOLIO_HEARTBEAT_INTERVAL_MS,
  STALE_RESEARCH_RUN_MS,
  WATCH_RECHECK_INTERVAL_MS,
  materialDiscoveryDelta,
} from "../src/lib/portfolio-reconciler";

const now = new Date("2026-09-09T21:00:00.000Z");
const candidate = {
  id: 9,
  discoveryKey: "APIFY_STORE:maps",
  clusterKey: "apify:maps",
  sourcePlatform: "APIFY_STORE",
  category: "maps",
  primaryAnomalyType: "MATERIAL_SNAPSHOT_CHANGE",
  anomalyTags: ["MATERIAL_SNAPSHOT_CHANGE"],
  status: "ACCEPTED",
  firstSeenAt: new Date("2026-09-01T00:00:00.000Z"),
  lastSeenAt: now,
  occurrenceCount: 4,
  latestPriorityScore: 72,
  scoreBreakdown: {},
  structureObservations: {},
  sourceSnapshotIds: [101, 202],
  createdOpportunityId: 42,
  duplicateOfOpportunityId: null,
} as typeof discoveryCandidatesTable.$inferSelect;

{
  const evidence = materialDiscoveryDelta({
    baseline: {
      discoveryKey: candidate.discoveryKey,
      candidateId: candidate.id,
      occurrenceCount: 3,
      latestSnapshotId: 101,
      anomalyTags: ["MATERIAL_SNAPSHOT_CHANGE"],
    },
    candidate,
    now,
  });
  assert.ok(evidence);
  assert.equal(evidence.kind, "DISCOVERY_MATERIAL_SNAPSHOT_CHANGE");
  assert.match(evidence.summary, /material snapshot change/i);
}

{
  const unchanged = materialDiscoveryDelta({
    baseline: {
      occurrenceCount: candidate.occurrenceCount,
      latestSnapshotId: 202,
    },
    candidate,
    now,
  });
  assert.equal(unchanged, null);
}

{
  const nonMaterial = materialDiscoveryDelta({
    baseline: { occurrenceCount: 3, latestSnapshotId: 101 },
    candidate: {
      ...candidate,
      primaryAnomalyType: "HIGH_USAGE_THIN_SUPPLY",
      anomalyTags: ["HIGH_USAGE_THIN_SUPPLY"],
    },
    now,
  });
  assert.equal(nonMaterial, null);
}

{
  const directResearch = activityEstimateForStage("DIRECT_RESEARCH");
  const watch = activityEstimateForStage("WATCH_FOR_DELTA");
  assert.equal(directResearch.stageIndex, 1);
  assert.equal(directResearch.stageCount, 7);
  assert.equal(watch.stageIndex, 7);
  assert.ok(directResearch.expectedDurationSeconds > 0);
}

assert.ok(PORTFOLIO_HEARTBEAT_INTERVAL_MS >= 60_000);
assert.equal(WATCH_RECHECK_INTERVAL_MS, PORTFOLIO_HEARTBEAT_INTERVAL_MS);
assert.ok(STALE_RESEARCH_RUN_MS > PORTFOLIO_HEARTBEAT_INTERVAL_MS);

console.log("PASS zero-cost portfolio reconciler and lifecycle tests");
