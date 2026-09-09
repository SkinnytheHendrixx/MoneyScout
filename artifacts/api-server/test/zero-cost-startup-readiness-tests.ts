import assert from "node:assert/strict";
import { determineStartupReadiness } from "../src/lib/startup-readiness";

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "DIRECT",
    runtimeFreshness: "MATCH",
  });
  assert.equal(result.state, "READY");
  assert.equal(result.paidResearchSafe, true);
  assert.deepEqual(result.blockers, []);
  assert.deepEqual(result.warnings, []);
}

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "DIRECT",
    runtimeFreshness: "UNKNOWN",
  });
  assert.equal(result.state, "ATTENTION");
  assert.equal(result.paidResearchSafe, true);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.warnings.length, 1);
}

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "REPLIT_MANAGED",
    runtimeFreshness: "MATCH",
  });
  assert.equal(result.state, "ATTENTION");
  assert.equal(result.paidResearchSafe, true);
  assert.equal(result.warnings.length, 1);
}

{
  const result = determineStartupReadiness({
    databaseReachable: false,
    anthropicProvider: "UNAVAILABLE",
    runtimeFreshness: "STALE",
  });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.paidResearchSafe, false);
  assert.equal(result.blockers.length, 3);
}

console.log("PASS zero-cost startup readiness evaluator");
