import assert from "node:assert/strict";
import { evaluateKillScreen, runExistingResearchEvidenceWorkers } from "../src/lib/evidence-workers";
import {
  evaluateDistributionRisk,
  evaluateMaintenanceRisk,
  evaluateNetworkEffectRisk,
  evaluatePlatformOwnerThreat,
  mergeKillScreenAssessments,
  runDedicatedKillRiskWorkers,
} from "../src/lib/kill-risk-workers";

assert.equal(evaluatePlatformOwnerThreat().status, "UNKNOWN");
assert.equal(evaluatePlatformOwnerThreat({ ownerAlreadyCompetes: "YES", ownerDistributionAdvantage: "YES", ownerAbsorptionSignal: "UNKNOWN" }).status, "CONFIRMED");
assert.equal(evaluatePlatformOwnerThreat({ ownerAlreadyCompetes: "NO", ownerDistributionAdvantage: "UNKNOWN", ownerAbsorptionSignal: "NO" }).status, "CLEAR");

assert.equal(evaluateMaintenanceRisk({ dependencyVolatile: "YES", repeatedBreakageObserved: "YES", maintenanceBurdenDisproportionate: "YES" }).status, "CONFIRMED");
assert.equal(evaluateMaintenanceRisk({ dependencyVolatile: "NO", repeatedBreakageObserved: "NO", maintenanceBurdenDisproportionate: "NO" }).status, "CLEAR");
assert.equal(evaluateMaintenanceRisk({ dependencyVolatile: "YES", repeatedBreakageObserved: "UNKNOWN", maintenanceBurdenDisproportionate: "NO" }).status, "UNKNOWN");

assert.equal(evaluateDistributionRisk({ targetBuyerReachable: "YES", viableAcquisitionChannelExists: "YES", acquisitionEconomicsPlausible: "YES" }).status, "CLEAR");
assert.equal(evaluateDistributionRisk({ targetBuyerReachable: "YES", viableAcquisitionChannelExists: "NO", acquisitionEconomicsPlausible: "UNKNOWN" }).status, "CONFIRMED");

assert.equal(evaluateNetworkEffectRisk({ switchingCostsHigh: "YES", dataOrWorkflowPortable: "NO", multihomingPractical: "NO" }).status, "CONFIRMED");
assert.equal(evaluateNetworkEffectRisk({ switchingCostsHigh: "NO", dataOrWorkflowPortable: "YES", multihomingPractical: "UNKNOWN" }).status, "CLEAR");
assert.equal(evaluateNetworkEffectRisk({ switchingCostsHigh: "YES", dataOrWorkflowPortable: "YES", multihomingPractical: "UNKNOWN" }).status, "UNKNOWN");

const context = {
  policyStatus: "GREEN" as const,
  demandConclusion: "SUPPORTED" as const,
  buyerIdentified: "true" as const,
  recurringUsageSignal: "yes" as const,
  existingPaidAnalogFound: true,
  paidAnalogNames: ["Paid Analog"],
};
const existing = runExistingResearchEvidenceWorkers(context);
const base = evaluateKillScreen(context, existing);
const dedicated = runDedicatedKillRiskWorkers({
  platformOwner: { ownerAlreadyCompetes: "NO", ownerDistributionAdvantage: "UNKNOWN", ownerAbsorptionSignal: "NO" },
  maintenance: { dependencyVolatile: "NO", repeatedBreakageObserved: "NO", maintenanceBurdenDisproportionate: "NO" },
  distribution: { targetBuyerReachable: "YES", viableAcquisitionChannelExists: "YES", acquisitionEconomicsPlausible: "YES" },
  networkEffects: { switchingCostsHigh: "NO", dataOrWorkflowPortable: "YES", multihomingPractical: "YES" },
});
const merged = mergeKillScreenAssessments(base, dedicated);
assert.equal(merged.overall, "CLEAR");
assert.equal(merged.unknownKills.length, 0);
assert.equal(merged.confirmedKills.length, 0);
assert.ok(dedicated.every((assessment) => assessment.evidence.length === 1));

const blocked = mergeKillScreenAssessments(base, runDedicatedKillRiskWorkers({
  platformOwner: { ownerAlreadyCompetes: "YES", ownerDistributionAdvantage: "YES", ownerAbsorptionSignal: "NO" },
  maintenance: { dependencyVolatile: "NO", repeatedBreakageObserved: "NO", maintenanceBurdenDisproportionate: "NO" },
  distribution: { targetBuyerReachable: "YES", viableAcquisitionChannelExists: "YES", acquisitionEconomicsPlausible: "YES" },
  networkEffects: { switchingCostsHigh: "NO", dataOrWorkflowPortable: "YES", multihomingPractical: "YES" },
}));
assert.equal(blocked.overall, "BLOCKED");
assert.ok(blocked.confirmedKills.includes("PLATFORM_OWNER_THREAT"));

console.log("PASS zero-cost dedicated kill-risk workers");
