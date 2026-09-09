import assert from "node:assert/strict";
import {
  KILL_RISK_MAX_EXTERNAL_COST_USD,
  KILL_RISK_MAX_SEARCH_USES,
  parseKillRiskCollectorOutput,
} from "../src/lib/kill-risk-collector";
import {
  mergeKillScreenAssessments,
  runDedicatedKillRiskWorkers,
} from "../src/lib/kill-risk-workers";
import {
  evaluateKillScreen,
  runExistingResearchEvidenceWorkers,
} from "../src/lib/evidence-workers";

assert.equal(KILL_RISK_MAX_EXTERNAL_COST_USD, 0.5);
assert.equal(KILL_RISK_MAX_SEARCH_USES, 4);

const sources = new Map([
  ["platform.example.com/official", { url: "https://platform.example.com/official", title: "Official platform product" }],
  ["docs.example.com/migration", { url: "https://docs.example.com/migration", title: "Migration guide" }],
  ["status.example.com/incidents", { url: "https://status.example.com/incidents", title: "Incident history" }],
  ["market.example.com/pricing", { url: "https://market.example.com/pricing", title: "Marketplace pricing" }],
]);

const parsed = parseKillRiskCollectorOutput({
  platform_owner: {
    owner_already_competes: "YES",
    owner_distribution_advantage: "YES",
    owner_absorption_signal: "UNKNOWN",
  },
  maintenance: {
    dependency_volatile: "YES",
    repeated_breakage_observed: "YES",
    maintenance_burden_disproportionate: "YES",
  },
  distribution: {
    target_buyer_reachable: "YES",
    viable_acquisition_channel_exists: "YES",
    acquisition_economics_plausible: "YES",
  },
  network_effects: {
    switching_costs_high: "NO",
    data_or_workflow_portable: "YES",
    multihoming_practical: "YES",
  },
  findings: [
    { ref: "f1", claim: "Platform owner has an official competing product.", source_url: "https://platform.example.com/official", source_title: "ignored model title", classification: "FACT", evaluation_dimension: "platform_owner_threat" },
    { ref: "f2", claim: "Repeated incidents are documented.", source_url: "https://status.example.com/incidents", source_title: "ignored", classification: "FACT", evaluation_dimension: "maintenance_dependency_risk" },
    { ref: "f3", claim: "Marketplace exposes the target buyers and pricing.", source_url: "https://market.example.com/pricing", source_title: "ignored", classification: "FACT", evaluation_dimension: "distribution_economics" },
    { ref: "f4", claim: "Migration guide documents portable data.", source_url: "https://docs.example.com/migration", source_title: "ignored", classification: "FACT", evaluation_dimension: "network_effect_lock_in" },
    { ref: "bad", claim: "This URL was not actually returned by search.", source_url: "https://invented.example.com/nope", source_title: "invented", classification: "FACT", evaluation_dimension: "network_effect_lock_in" },
  ],
}, sources);

assert.equal(parsed.findings.length, 4);
assert.ok(!parsed.findings.some((finding) => finding.ref === "bad"));
assert.equal(parsed.inputs.platformOwner?.ownerAlreadyCompetes, "YES");
assert.equal(parsed.inputs.maintenance?.maintenanceBurdenDisproportionate, "YES");
assert.equal(parsed.inputs.distribution?.acquisitionEconomicsPlausible, "YES");
assert.equal(parsed.inputs.networkEffects?.dataOrWorkflowPortable, "YES");

const baseContext = {
  policyStatus: "GREEN" as const,
  demandConclusion: "SUPPORTED" as const,
  buyerIdentified: "true" as const,
  recurringUsageSignal: "yes" as const,
  existingPaidAnalogFound: true,
  paidAnalogNames: ["Paid Analog"],
};
const existingEvidence = runExistingResearchEvidenceWorkers(baseContext);
const baseScreen = evaluateKillScreen(baseContext, existingEvidence);
const merged = mergeKillScreenAssessments(baseScreen, runDedicatedKillRiskWorkers(parsed.inputs));
assert.equal(merged.overall, "BLOCKED");
assert.ok(merged.confirmedKills.includes("PLATFORM_OWNER_THREAT"));
assert.ok(merged.confirmedKills.includes("UNSTABLE_DEPENDENCY_MAINTENANCE_SINK"));
assert.equal(merged.assessments.find((a) => a.killClass === "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION")?.status, "CLEAR");
assert.equal(merged.assessments.find((a) => a.killClass === "NETWORK_EFFECT_LOCK_IN")?.status, "CLEAR");

const unknownParsed = parseKillRiskCollectorOutput({
  platform_owner: { owner_already_competes: "UNKNOWN", owner_distribution_advantage: "UNKNOWN", owner_absorption_signal: "UNKNOWN" },
  maintenance: { dependency_volatile: "UNKNOWN", repeated_breakage_observed: "UNKNOWN", maintenance_burden_disproportionate: "UNKNOWN" },
  distribution: { target_buyer_reachable: "UNKNOWN", viable_acquisition_channel_exists: "UNKNOWN", acquisition_economics_plausible: "UNKNOWN" },
  network_effects: { switching_costs_high: "UNKNOWN", data_or_workflow_portable: "UNKNOWN", multihoming_practical: "UNKNOWN" },
  findings: [],
}, new Map());
const unknownMerged = mergeKillScreenAssessments(baseScreen, runDedicatedKillRiskWorkers(unknownParsed.inputs));
assert.equal(unknownMerged.overall, "INCOMPLETE");
assert.equal(unknownMerged.confirmedKills.length, 0);

console.log("PASS zero-cost kill-risk evidence collector parsing and orchestration");
