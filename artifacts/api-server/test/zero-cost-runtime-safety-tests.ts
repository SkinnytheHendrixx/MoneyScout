import assert from "node:assert/strict";
import {
  classifyOpportunityRecordMode,
  detectRuntimeCommit,
  pilotSpendApproved,
  requiresExplicitPilotSpendApproval,
  runtimeFreshness,
} from "../src/lib/runtime-safety";

assert.equal(classifyOpportunityRecordMode("Normal live opportunity"), "LIVE");
assert.equal(classifyOpportunityRecordMode("[PILOT] Maps Actor"), "PILOT");
assert.equal(classifyOpportunityRecordMode(" [simulation] fixture opportunity"), "SIMULATION");
assert.equal(classifyOpportunityRecordMode("[TEST] auth probe"), "TEST");
assert.equal(requiresExplicitPilotSpendApproval("[PILOT] Maps Actor"), true);
assert.equal(requiresExplicitPilotSpendApproval("Live Actor"), false);
assert.equal(pilotSpendApproved("true"), true);
assert.equal(pilotSpendApproved(" TRUE "), true);
assert.equal(pilotSpendApproved("false"), false);
assert.equal(pilotSpendApproved(undefined), false);

assert.equal(detectRuntimeCommit({ MONEY_SCOUT_BUILD_SHA: "abc123" } as NodeJS.ProcessEnv), "abc123");
assert.equal(
  runtimeFreshness({ MONEY_SCOUT_BUILD_SHA: "abc123", MONEY_SCOUT_EXPECTED_COMMIT_SHA: "abc123" } as NodeJS.ProcessEnv),
  "MATCH",
);
assert.equal(
  runtimeFreshness({ MONEY_SCOUT_BUILD_SHA: "abc123", MONEY_SCOUT_EXPECTED_COMMIT_SHA: "def456" } as NodeJS.ProcessEnv),
  "STALE",
);
assert.equal(runtimeFreshness({} as NodeJS.ProcessEnv), "UNKNOWN");

console.log("PASS zero-cost runtime freshness and pilot safety");
