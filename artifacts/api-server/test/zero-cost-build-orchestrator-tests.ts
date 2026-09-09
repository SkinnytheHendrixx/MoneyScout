import assert from "node:assert/strict";
import { createBuildJobContract, builderProfileFor } from "../src/lib/build-orchestrator";
import { createCommercialBuildBrief } from "../src/lib/commercial-build-brief";
import { createMonetizationExecutionPlan } from "../src/lib/monetization-execution-plan";

const readyBrief = createCommercialBuildBrief({
  opportunityId: 901,
  name: "Marketplace Lead Extractor",
  sourcePlatform: "Apify",
  sourceUrl: "https://apify.com/example",
  opportunityType: "scraper marketplace product",
  thesis: "Businesses pay for structured lead extraction from public web sources.",
  engineFamily: "APIFY_STORE_DISCOVERY",
  verdict: "BUILD",
  policyStatus: "GREEN",
  buyerEvidence: ["Small B2B sales teams already buy lead-enrichment tools."],
  problemEvidence: ["Manual lead extraction is recurring and labor intensive."],
  monetizationEvidence: ["Paid substitutes demonstrate willingness to pay for structured lead output."],
  monetizationConfidenceState: "STRONGLY_INFERRED",
  distributionEvidence: ["The Apify Store is an evidenced marketplace distribution surface."],
  technicalEvidence: ["Representative public extraction path is technically feasible."],
});
const readyPlan = createMonetizationExecutionPlan(readyBrief);
const ready = createBuildJobContract({
  brief: readyBrief,
  monetizationPlan: readyPlan,
  evaluationCycleId: 12,
});

assert.equal(ready.status, "READY_FOR_BUILDER");
assert.equal(ready.nextGate, "BUILDER_WORKSPACE");
assert.equal(ready.product.primaryShape, "MARKETPLACE_PRODUCT");
assert.equal(ready.product.builderProfile, "MARKETPLACE_PACKAGE");
assert.equal(readyPlan.pricing.confidenceState, "STRONGLY_INFERRED");
assert.equal(ready.firstTransaction.pricingConfidenceState, "STRONGLY_INFERRED");
assert.equal(ready.scope.externalSpendCeilingUsd, 0);
assert.equal(ready.scope.openSourceReuseAuditRequired, true);
assert.equal(ready.scope.reuseBeforeBuild, true);
assert.equal(ready.scope.preferExistingCompanyInfrastructure, true);
assert.equal(ready.workspace.productionCredentialsAllowed, false);
assert.equal(ready.workspace.externalPublicationAllowed, false);
assert.equal(ready.workspace.customerChargingAllowed, false);
assert.equal(ready.workspace.domainPurchaseAllowed, false);
assert.equal(ready.debuggingContract.builderCompletionDoesNotEqualAcceptance, true);
assert.equal(ready.debuggingContract.failedAcceptanceCriteriaRouteToDebugLoop, true);
assert.match(ready.product.minimumSellableOutcome, /narrowest working marketplace product/i);
assert.ok(ready.acceptanceCriteria.some((item) => /representative customer workflow/i.test(item)));
assert.ok(ready.firstTransaction.targetBuyerEvidence.length > 0);

assert.equal(builderProfileFor("WEB_APP"), "FULLSTACK_WEB");
assert.equal(builderProfileFor("API"), "BACKEND_API");
assert.equal(builderProfileFor("SCRAPER"), "SCRAPER_ENGINE");
assert.equal(builderProfileFor("AUTOMATION"), "WORKFLOW_AUTOMATION");
assert.equal(builderProfileFor("DATA_PRODUCT"), "DATA_PIPELINE");
assert.equal(builderProfileFor("BOT"), "CHANNEL_BOT");
assert.equal(builderProfileFor("EXTENSION"), "BROWSER_EXTENSION");

const unresolvedBrief = createCommercialBuildBrief({
  opportunityId: 902,
  name: "Unresolved Product",
  sourcePlatform: "Example",
  sourceUrl: "https://example.com",
  opportunityType: "api",
  thesis: "Possible paid workflow.",
  engineFamily: "TEST",
  verdict: "BUILD",
  policyStatus: "GREEN",
  buyerEvidence: [],
  problemEvidence: ["A problem may exist."],
  monetizationEvidence: [],
  distributionEvidence: [],
  technicalEvidence: [],
});
const unresolvedPlan = createMonetizationExecutionPlan(unresolvedBrief);
const blocked = createBuildJobContract({
  brief: unresolvedBrief,
  monetizationPlan: unresolvedPlan,
  evaluationCycleId: 13,
});
assert.equal(unresolvedPlan.status, "NEEDS_AUTONOMOUS_RESOLUTION");
assert.equal(blocked.status, "BLOCKED");
assert.equal(blocked.nextGate, "STOP");
assert.ok(blocked.blockers.some((item) => /not READY_FOR_INTERNAL_BUILD/i.test(item)));

console.log("PASS zero-cost build orchestrator");
