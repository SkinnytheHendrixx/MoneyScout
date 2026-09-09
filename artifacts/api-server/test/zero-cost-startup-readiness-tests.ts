import assert from "node:assert/strict";
import { determineStartupReadiness } from "../src/lib/startup-readiness";

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "DIRECT",
    runtimeFreshness: "MATCH",
  });
  assert.equal(result.state, "READY");
  assert.equal(result.infrastructureSafe, true);
  assert.equal(result.aiProviderReady, true);
  assert.equal(result.providerReadiness, "READY");
  assert.equal(result.liveResearchReady, true);
  assert.equal(result.paidResearchSafe, true);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.warnings.length, 1);
}

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "DIRECT",
    runtimeFreshness: "UNKNOWN",
  });
  assert.equal(result.state, "ATTENTION");
  assert.equal(result.infrastructureSafe, true);
  assert.equal(result.aiProviderReady, true);
  assert.equal(result.liveResearchReady, true);
  assert.equal(result.paidResearchSafe, true);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.warnings.length, 2);
}

{
  const result = determineStartupReadiness({
    databaseReachable: true,
    anthropicProvider: "REPLIT_MANAGED",
    runtimeFreshness: "MATCH",
  });
  assert.equal(result.state, "ATTENTION");
  assert.equal(result.infrastructureSafe, true);
  assert.equal(result.aiProviderReady, false);
  assert.equal(result.providerReadiness, "UNVERIFIED");
  assert.equal(result.liveResearchReady, false);
  assert.equal(result.paidResearchSafe, false);
  assert.equal(result.blockers.length, 0);
  assert.equal(result.warnings.length, 1);
}

{
  const result = determineStartupReadiness({
    databaseReachable: false,
    anthropicProvider: "DIRECT",
    runtimeFreshness: "MATCH",
  });
  assert.equal(result.infrastructureSafe, false);
  assert.equal(result.aiProviderReady, true);
  assert.equal(result.liveResearchReady, false);
  assert.equal(result.paidResearchSafe, false);
}

{
  const result = determineStartupReadiness({
    databaseReachable: false,
    anthropicProvider: "UNAVAILABLE",
    runtimeFreshness: "STALE",
  });
  assert.equal(result.state, "BLOCKED");
  assert.equal(result.infrastructureSafe, false);
  assert.equal(result.aiProviderReady, false);
  assert.equal(result.providerReadiness, "UNAVAILABLE");
  assert.equal(result.liveResearchReady, false);
  assert.equal(result.paidResearchSafe, false);
  assert.equal(result.blockers.length, 3);
}

console.log("PASS zero-cost startup readiness evaluator");
