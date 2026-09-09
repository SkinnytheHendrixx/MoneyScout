import assert from "node:assert/strict";
import { createCommercialBuildBrief } from "../src/lib/commercial-build-brief";
import { createMonetizationExecutionPlan } from "../src/lib/monetization-execution-plan";

const baseBrief = createCommercialBuildBrief({
  opportunityId: 77,
  name: "Apify commerce intelligence actor",
  sourcePlatform: "Apify",
  sourceUrl: "https://apify.com/store?category=ECOMMERCE",
  opportunityType: "scraper",
  thesis: "Retail operators need recurring product and competitor data extraction.",
  engineFamily: "APIFY_STORE_DISCOVERY",
  verdict: "BUILD",
  policyStatus: "GREEN",
  buyerEvidence: ["Retail operators already pay for recurring competitive product intelligence."],
  problemEvidence: ["Competitor product and price monitoring is recurring and operationally important."],
  monetizationEvidence: ["Paid competitor tools demonstrate willingness to pay for recurring product intelligence."],
  distributionEvidence: ["The Apify Store is an accessible marketplace for Actor buyers."],
  technicalEvidence: ["Comparable Apify Actors show observed run activity."],
});

{
  const plan = createMonetizationExecutionPlan(baseBrief);
  assert.equal(plan.status, "READY_FOR_INTERNAL_BUILD");
  assert.equal(plan.firstTransaction.testType, "MARKETPLACE_PAID_COMMITMENT");
  assert.equal(plan.autonomy.nextGate, "BUILD_ORCHESTRATOR");
  assert.equal(plan.ventureBudget.totalExternalSpendCeilingUsd, 0);
  assert.equal(plan.ventureBudget.ownerConfiguredCeilingRequiredBeforeSpend, true);
  assert.equal(plan.pricing.testPriceUsd, null);
  assert.equal(plan.pricing.confidenceState, "DIRECTLY_OBSERVED");
  assert.ok(plan.autonomy.approvalRequiredFor.includes("CUSTOMER_CHARGING"));
  assert.ok(plan.autonomy.approvalRequiredFor.includes("EXTERNAL_PUBLICATION"));
  assert.ok(plan.decisionContract.prohibitedInference.some((item) => item.includes("working product")));
}

{
  const brief = createCommercialBuildBrief({
    opportunityId: 78,
    name: "Automation opportunity",
    sourcePlatform: "direct",
    sourceUrl: "https://example.com/opportunity",
    opportunityType: "workflow automation",
    thesis: "Automate recurring reconciliation work.",
    engineFamily: "GENERIC",
    verdict: "BUILD",
    policyStatus: "GREEN",
    buyerEvidence: [],
    problemEvidence: ["Recurring reconciliation work is costly."],
    monetizationEvidence: [],
    distributionEvidence: [],
    technicalEvidence: [],
  });
  const plan = createMonetizationExecutionPlan(brief);
  assert.equal(plan.status, "NEEDS_AUTONOMOUS_RESOLUTION");
  assert.equal(plan.autonomy.nextGate, "AUTONOMOUS_RESOLUTION");
  assert.equal(plan.firstTransaction.testType, "PAID_WORKFLOW_PILOT");
  assert.equal(plan.commercialNormalizationNeeded.length, 3);
  assert.deepEqual(plan.resolutionProblems.sort(), [
    "COMMERCIAL_BUYER_UNRESOLVED",
    "COMMERCIAL_DISTRIBUTION_UNRESOLVED",
    "COMMERCIAL_PRICING_UNRESOLVED",
  ]);
  assert.equal(plan.pricing.confidenceState, "UNRESOLVED");
  assert.ok(plan.pricing.instruction.includes("bounded test hypothesis"));
  assert.equal(plan.ventureBudget.totalExternalSpendCeilingUsd, 0);
}

{
  const brief = createCommercialBuildBrief({
    opportunityId: 79,
    name: "Not build ready",
    sourcePlatform: "direct",
    sourceUrl: "https://example.com/not-ready",
    opportunityType: "api",
    thesis: "Developer API opportunity.",
    engineFamily: "GENERIC",
    verdict: "TEST",
    policyStatus: "GREEN",
    buyerEvidence: ["Developers are the buyer."],
    problemEvidence: ["Developers need the capability."],
    monetizationEvidence: ["Paid API substitutes exist."],
    distributionEvidence: ["Developer marketplaces are accessible."],
    technicalEvidence: [],
  });
  const plan = createMonetizationExecutionPlan(brief);
  assert.equal(plan.status, "BLOCKED");
  assert.equal(plan.autonomy.nextGate, "STOP");
  assert.ok(plan.blockers.some((item) => item.includes("not BUILD")));
  assert.equal(plan.ventureBudget.totalExternalSpendCeilingUsd, 0);
}

console.log("PASS zero-cost monetization execution planner");
