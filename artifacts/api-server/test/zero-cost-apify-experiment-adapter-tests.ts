import assert from "node:assert/strict";
import {
  clearExperimentExecutorAdaptersForTests,
  executeRegisteredExperiment,
  experimentExecutionCapability,
} from "../src/lib/experiment-executor";
import {
  APIFY_EXPERIMENT_ENGINE_FAMILY,
  APIFY_STORE_API_URL,
  APIFY_SOAK_PROBE_COUNT,
  apifyCategoryFromOpportunitySource,
  registerApifyExperimentAdapters,
} from "../src/lib/apify-experiment-adapters";
import type { FalsifyingExperimentPlan } from "../src/lib/experiment-planner";

const technicalPlan: FalsifyingExperimentPlan = {
  schemaVersion: 1,
  planKey: "TECHNICAL_SPIKE:build_complexity_technical_uncertainty",
  experimentType: "TECHNICAL_SPIKE",
  targetFactors: ["build_complexity_technical_uncertainty"],
  hypothesis: "Comparable Actor workloads are feasible on the source platform.",
  falsificationQuestion: "Does the source platform fail to expose evidence of comparable runnable workloads?",
  procedure: ["Probe the public Store metadata path without starting an Actor."],
  evidenceProduced: ["Platform-level technical feasibility context"],
  costClass: "VERY_LOW",
  timeToSignal: "HOURS",
  reversibility: "HIGH",
  selectionBasis: "Zero-cost adapter fixture.",
  nonGoals: ["Does not prove target-specific scraping feasibility."],
};

const soakPlan: FalsifyingExperimentPlan = {
  schemaVersion: 1,
  planKey: "DEPENDENCY_SOAK_TEST:operating_maintenance_burden",
  experimentType: "DEPENDENCY_SOAK_TEST",
  targetFactors: ["operating_maintenance_burden"],
  hypothesis: "The Apify public metadata dependency is available across repeated bounded probes.",
  falsificationQuestion: "Does the dependency repeatedly fail during the bounded probe window?",
  procedure: ["Repeat the same read-only metadata probe."],
  evidenceProduced: ["Short-window dependency stability evidence"],
  costClass: "LOW",
  timeToSignal: "DAYS",
  reversibility: "HIGH",
  selectionBasis: "Zero-cost adapter fixture.",
  nonGoals: ["Does not establish target-site or long-term maintenance reliability."],
};

const storeBody = {
  data: {
    total: 81,
    offset: 0,
    limit: 25,
    items: [
      {
        id: "a1",
        username: "maker",
        name: "one",
        stats: { totalRuns: 120 },
        currentPricingInfo: { pricingModel: "PAY_PER_EVENT" },
      },
      {
        id: "a2",
        username: "maker",
        name: "two",
        stats: { totalRuns: 30 },
        currentPricingInfo: { pricingModel: "FREE" },
      },
      {
        id: "a3",
        username: "maker",
        name: "three",
        stats: { totalRuns: 9 },
        currentPricingInfo: { pricingModel: "PAY_PER_USAGE" },
      },
      {
        id: "a4",
        username: "maker",
        name: "four",
        stats: { totalRuns: 0 },
      },
    ],
  },
};

const okResponse = () => new Response(JSON.stringify(storeBody), {
  status: 200,
  headers: { "content-type": "application/json" },
});

assert.equal(
  apifyCategoryFromOpportunitySource("https://apify.com/store?category=SOCIAL_MEDIA"),
  "SOCIAL_MEDIA",
);
assert.equal(apifyCategoryFromOpportunitySource("https://example.com/store?category=SOCIAL_MEDIA"), null);
assert.equal(apifyCategoryFromOpportunitySource("not-a-url"), null);

clearExperimentExecutorAdaptersForTests();
const requestedUrls: string[] = [];
registerApifyExperimentAdapters({
  fetchImpl: (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    requestedUrls.push(url);
    assert.equal(init?.method, "GET");
    assert.ok(url.startsWith(APIFY_STORE_API_URL));
    assert.ok(url.includes("category=SOCIAL_MEDIA"));
    return okResponse();
  }) as typeof fetch,
  sleep: async () => {},
  now: (() => {
    let tick = 100;
    return () => tick += 7;
  })(),
});

const technicalCapability = experimentExecutionCapability({
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  experimentType: "TECHNICAL_SPIKE",
});
assert.equal(technicalCapability.mode, "AUTOMATIC_INTERNAL");
assert.equal(technicalCapability.automaticExecutionAllowed, true);

const soakCapability = experimentExecutionCapability({
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  experimentType: "DEPENDENCY_SOAK_TEST",
});
assert.equal(soakCapability.mode, "AUTOMATIC_INTERNAL");
assert.equal(soakCapability.automaticExecutionAllowed, true);

const unitCostCapability = experimentExecutionCapability({
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  experimentType: "UNIT_COST_BENCHMARK",
});
assert.equal(unitCostCapability.mode, "ADAPTER_REQUIRED");
assert.equal(unitCostCapability.automaticExecutionAllowed, false);

const technical = await executeRegisteredExperiment({
  experimentId: 51,
  opportunityId: 12,
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  sourcePlatform: "APIFY",
  sourceUrl: "https://apify.com/store?category=SOCIAL_MEDIA",
  opportunityType: "Discovery test",
  thesis: "Fixture thesis",
  plan: technicalPlan,
});
assert.equal(technical.result.outcome, "SUPPORTED");
assert.equal(technical.result.externalCostUsd, 0);
assert.equal(technical.result.observations[0]?.factor, "build_complexity_technical_uncertainty");
assert.equal(technical.result.observations[0]?.classification, "INFERENCE");
assert.equal(technical.result.metrics?.actors_with_run_activity, 3);
assert.equal(technical.result.metrics?.actor_runs_started, 0);

const soak = await executeRegisteredExperiment({
  experimentId: 52,
  opportunityId: 12,
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  sourcePlatform: "APIFY",
  sourceUrl: "https://apify.com/store?category=SOCIAL_MEDIA",
  opportunityType: "Discovery test",
  thesis: "Fixture thesis",
  plan: soakPlan,
});
assert.equal(soak.result.outcome, "SUPPORTED");
assert.equal(soak.result.externalCostUsd, 0);
assert.equal(soak.result.metrics?.successful_probes, APIFY_SOAK_PROBE_COUNT);
assert.equal(soak.result.metrics?.failed_probes, 0);
assert.equal(soak.result.metrics?.actor_runs_started, 0);
assert.equal(requestedUrls.length, 1 + APIFY_SOAK_PROBE_COUNT);

clearExperimentExecutorAdaptersForTests();
let attempt = 0;
registerApifyExperimentAdapters({
  fetchImpl: (async () => {
    attempt += 1;
    if (attempt <= 2) throw new Error("fixture dependency failure");
    return okResponse();
  }) as typeof fetch,
  sleep: async () => {},
});
const failedSoak = await executeRegisteredExperiment({
  experimentId: 53,
  opportunityId: 12,
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  sourcePlatform: "APIFY",
  sourceUrl: "https://apify.com/store?category=SOCIAL_MEDIA",
  opportunityType: "Discovery test",
  thesis: "Fixture thesis",
  plan: soakPlan,
});
assert.equal(failedSoak.result.outcome, "FALSIFIED");
assert.equal(failedSoak.result.metrics?.failed_probes, 2);
assert.ok(failedSoak.result.observations.some((item) => item.direction === "CONTRADICTS"));
assert.equal(failedSoak.result.externalCostUsd, 0);

clearExperimentExecutorAdaptersForTests();
registerApifyExperimentAdapters({ fetchImpl: (async () => okResponse()) as typeof fetch, sleep: async () => {} });
const noCategory = await executeRegisteredExperiment({
  experimentId: 54,
  opportunityId: 12,
  engineFamily: APIFY_EXPERIMENT_ENGINE_FAMILY,
  sourcePlatform: "APIFY",
  sourceUrl: "https://apify.com/example-actor",
  opportunityType: "Discovery test",
  thesis: "Fixture thesis",
  plan: technicalPlan,
});
assert.equal(noCategory.result.outcome, "INCONCLUSIVE");
assert.equal(noCategory.result.observations.length, 0);

clearExperimentExecutorAdaptersForTests();
console.log("PASS zero-cost Apify experiment adapters");
