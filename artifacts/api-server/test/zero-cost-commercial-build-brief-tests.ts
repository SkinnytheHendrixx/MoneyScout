import assert from "node:assert/strict";
import { createCommercialBuildBrief, routeCommercialBuild } from "../src/lib/commercial-build-brief";

{
  const route = routeCommercialBuild({
    sourcePlatform: "Apify",
    opportunityType: "Store discovery",
    thesis: "Build a website data extractor for a missing marketplace workflow.",
    engineFamily: "APIFY_STORE_DISCOVERY",
  });
  assert.equal(route.primaryShape, "MARKETPLACE_PRODUCT");
  assert.ok(route.supportingShapes.includes("SCRAPER"));
}

{
  const route = routeCommercialBuild({
    sourcePlatform: "Direct",
    opportunityType: "Operations workflow",
    thesis: "Automatically reconcile invoices and alert finance teams when records drift.",
    engineFamily: "GENERIC",
  });
  assert.equal(route.primaryShape, "AUTOMATION");
}

{
  const route = routeCommercialBuild({
    sourcePlatform: "Developer ecosystem",
    opportunityType: "Developer utility",
    thesis: "Expose normalized enrichment through an API endpoint and webhook.",
    engineFamily: "GENERIC",
  });
  assert.equal(route.primaryShape, "API");
}

{
  const brief = createCommercialBuildBrief({
    opportunityId: 42,
    name: "Validated extractor",
    sourcePlatform: "Apify",
    sourceUrl: "https://apify.com/store?category=example",
    opportunityType: "Store discovery",
    thesis: "Extract recurring pricing data for operators.",
    engineFamily: "APIFY_STORE_DISCOVERY",
    verdict: "BUILD",
    policyStatus: "GREEN",
    buyerEvidence: ["Operations teams repeatedly purchase access to comparable pricing data."],
    problemEvidence: ["Operators repeatedly need normalized pricing data from fragmented sources."],
    monetizationEvidence: ["Comparable paid data products exist."],
    distributionEvidence: ["The source marketplace already distributes comparable tools."],
    technicalEvidence: ["Comparable actors run successfully on the platform."],
  });

  assert.equal(brief.schemaVersion, 1);
  assert.equal(brief.eligibility.buildReady, true);
  assert.equal(brief.buildContract.route.primaryShape, "MARKETPLACE_PRODUCT");
  assert.equal(brief.autonomy.mayCreateCode, true);
  assert.equal(brief.autonomy.mayPublishExternally, false);
  assert.equal(brief.autonomy.mayChargeCustomers, false);
  assert.equal(brief.autonomy.maySendOutreach, false);
  assert.equal(brief.autonomy.mayBuyTraffic, false);
  assert.equal(brief.autonomy.nextGate, "MONETIZATION_EXECUTION_PLAN");
  assert.equal(brief.unresolved.targetBuyerNeedsStructuredExtraction, false);
  assert.equal(brief.unresolved.pricingNeedsStructuredExtraction, false);
}

{
  const blocked = createCommercialBuildBrief({
    opportunityId: 7,
    name: "Not ready",
    sourcePlatform: "Web",
    sourceUrl: "https://example.com",
    opportunityType: "App",
    thesis: "Generic opportunity",
    engineFamily: "GENERIC",
    verdict: "TEST",
    policyStatus: "GREEN",
    buyerEvidence: [],
    problemEvidence: [],
    monetizationEvidence: [],
    distributionEvidence: [],
    technicalEvidence: [],
  });
  assert.equal(blocked.eligibility.buildReady, false);
  assert.ok(blocked.eligibility.blockers.some((item) => item.includes("not BUILD")));
  assert.equal(blocked.unresolved.targetBuyerNeedsStructuredExtraction, true);
  assert.equal(blocked.unresolved.pricingNeedsStructuredExtraction, true);
  assert.equal(blocked.unresolved.distributionNeedsStructuredExtraction, true);
}

console.log("PASS zero-cost commercial build brief and deterministic build router");
