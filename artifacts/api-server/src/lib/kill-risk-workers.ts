import type { KillAssessment, KillScreenResult, StructuredEvidence } from "./evidence-workers";

export type TriState = "YES" | "NO" | "UNKNOWN";

export type PlatformOwnerThreatInput = {
  ownerAlreadyCompetes: TriState;
  ownerDistributionAdvantage: TriState;
  ownerAbsorptionSignal: TriState;
  sourceRef?: string | null;
};

export type MaintenanceRiskInput = {
  dependencyVolatile: TriState;
  repeatedBreakageObserved: TriState;
  maintenanceBurdenDisproportionate: TriState;
  sourceRef?: string | null;
};

export type DistributionRiskInput = {
  targetBuyerReachable: TriState;
  viableAcquisitionChannelExists: TriState;
  acquisitionEconomicsPlausible: TriState;
  sourceRef?: string | null;
};

export type NetworkEffectRiskInput = {
  switchingCostsHigh: TriState;
  dataOrWorkflowPortable: TriState;
  multihomingPractical: TriState;
  sourceRef?: string | null;
};

export type DedicatedKillRiskInputs = {
  platformOwner?: PlatformOwnerThreatInput | null;
  maintenance?: MaintenanceRiskInput | null;
  distribution?: DistributionRiskInput | null;
  networkEffects?: NetworkEffectRiskInput | null;
};

const now = () => new Date().toISOString();

const evidence = (
  dimension: string,
  claim: string,
  sourceType: string,
  sourceRef: string | null | undefined,
  metadata: Record<string, unknown>,
): StructuredEvidence => ({
  family: "KILL_RISK",
  dimension,
  claim,
  classification: "INFERENCE",
  confidence: "MEDIUM",
  ladderRung: "PAIN",
  sourceType,
  sourceRef: sourceRef ?? null,
  observedAt: now(),
  decisionImpact: ["KILL_SCREEN", "REJECT"],
  metadata,
});

export function evaluatePlatformOwnerThreat(input?: PlatformOwnerThreatInput | null): KillAssessment {
  if (!input) return { killClass: "PLATFORM_OWNER_THREAT", status: "UNKNOWN", rationale: "Platform-owner threat has not been evaluated.", evidence: [] };
  const items = [evidence("platform_owner_threat", "Platform-owner threat worker evaluated owner competition, distribution advantage, and absorption signals.", "PLATFORM_OWNER_WORKER", input.sourceRef, input)];
  if (input.ownerAlreadyCompetes === "YES" && (input.ownerDistributionAdvantage === "YES" || input.ownerAbsorptionSignal === "YES")) {
    return { killClass: "PLATFORM_OWNER_THREAT", status: "CONFIRMED", rationale: "The platform owner already competes and has either a structural distribution advantage or a concrete absorption signal.", evidence: items };
  }
  if (input.ownerAlreadyCompetes === "NO" && input.ownerAbsorptionSignal === "NO") {
    return { killClass: "PLATFORM_OWNER_THREAT", status: "CLEAR", rationale: "No current owner competition or absorption signal was found in the evaluated evidence.", evidence: items };
  }
  return { killClass: "PLATFORM_OWNER_THREAT", status: "UNKNOWN", rationale: "Evidence is mixed or incomplete; owner threat cannot be cleared or confirmed.", evidence: items };
}

export function evaluateMaintenanceRisk(input?: MaintenanceRiskInput | null): KillAssessment {
  if (!input) return { killClass: "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK", status: "UNKNOWN", rationale: "Dependency and maintenance risk has not been evaluated.", evidence: [] };
  const items = [evidence("maintenance_dependency_risk", "Maintenance worker evaluated dependency volatility, repeated breakage, and disproportionate upkeep burden.", "MAINTENANCE_RISK_WORKER", input.sourceRef, input)];
  const badSignals = [input.dependencyVolatile, input.repeatedBreakageObserved, input.maintenanceBurdenDisproportionate].filter((value) => value === "YES").length;
  if (badSignals >= 2 && input.maintenanceBurdenDisproportionate === "YES") {
    return { killClass: "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK", status: "CONFIRMED", rationale: "Observed dependency instability is paired with disproportionate maintenance burden.", evidence: items };
  }
  if (input.dependencyVolatile === "NO" && input.repeatedBreakageObserved === "NO" && input.maintenanceBurdenDisproportionate === "NO") {
    return { killClass: "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK", status: "CLEAR", rationale: "The evaluated dependency appears stable with no repeated breakage or disproportionate maintenance burden.", evidence: items };
  }
  return { killClass: "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK", status: "UNKNOWN", rationale: "Maintenance evidence is mixed or incomplete.", evidence: items };
}

export function evaluateDistributionRisk(input?: DistributionRiskInput | null): KillAssessment {
  if (!input) return { killClass: "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION", status: "UNKNOWN", rationale: "Distribution economics has not been evaluated.", evidence: [] };
  const items = [evidence("distribution_economics", "Distribution worker evaluated buyer reachability, channel availability, and acquisition economics.", "DISTRIBUTION_RISK_WORKER", input.sourceRef, input)];
  if (input.targetBuyerReachable === "NO" || input.viableAcquisitionChannelExists === "NO" || input.acquisitionEconomicsPlausible === "NO") {
    return { killClass: "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION", status: "CONFIRMED", rationale: "At least one essential distribution condition is affirmatively unavailable or uneconomic.", evidence: items };
  }
  if (input.targetBuyerReachable === "YES" && input.viableAcquisitionChannelExists === "YES" && input.acquisitionEconomicsPlausible === "YES") {
    return { killClass: "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION", status: "CLEAR", rationale: "Buyer reachability, a viable acquisition channel, and plausible acquisition economics are all supported.", evidence: items };
  }
  return { killClass: "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION", status: "UNKNOWN", rationale: "Distribution evidence is incomplete.", evidence: items };
}

export function evaluateNetworkEffectRisk(input?: NetworkEffectRiskInput | null): KillAssessment {
  if (!input) return { killClass: "NETWORK_EFFECT_LOCK_IN", status: "UNKNOWN", rationale: "Network-effect and switching-cost risk has not been evaluated.", evidence: [] };
  const items = [evidence("network_effect_lock_in", "Network-effect worker evaluated switching costs, portability, and multihoming.", "NETWORK_EFFECT_RISK_WORKER", input.sourceRef, input)];
  if (input.switchingCostsHigh === "YES" && input.dataOrWorkflowPortable === "NO" && input.multihomingPractical === "NO") {
    return { killClass: "NETWORK_EFFECT_LOCK_IN", status: "CONFIRMED", rationale: "High switching costs combine with poor portability and impractical multihoming.", evidence: items };
  }
  if (input.switchingCostsHigh === "NO" && (input.dataOrWorkflowPortable === "YES" || input.multihomingPractical === "YES")) {
    return { killClass: "NETWORK_EFFECT_LOCK_IN", status: "CLEAR", rationale: "The evaluated market does not show lock-in strong enough to block entry.", evidence: items };
  }
  return { killClass: "NETWORK_EFFECT_LOCK_IN", status: "UNKNOWN", rationale: "Switching and network-effect evidence is mixed or incomplete.", evidence: items };
}

export function runDedicatedKillRiskWorkers(inputs: DedicatedKillRiskInputs): KillAssessment[] {
  return [
    evaluatePlatformOwnerThreat(inputs.platformOwner),
    evaluateMaintenanceRisk(inputs.maintenance),
    evaluateDistributionRisk(inputs.distribution),
    evaluateNetworkEffectRisk(inputs.networkEffects),
  ];
}

export function mergeKillScreenAssessments(base: KillScreenResult, dedicated: KillAssessment[]): KillScreenResult {
  const replacements = new Map(dedicated.map((assessment) => [assessment.killClass, assessment]));
  const assessments = base.assessments.map((assessment) => replacements.get(assessment.killClass) ?? assessment);
  const confirmedKills = assessments.filter((assessment) => assessment.status === "CONFIRMED").map((assessment) => assessment.killClass);
  const unknownKills = assessments.filter((assessment) => assessment.status === "UNKNOWN").map((assessment) => assessment.killClass);
  return {
    overall: confirmedKills.length ? "BLOCKED" : unknownKills.length ? "INCOMPLETE" : "CLEAR",
    assessments,
    confirmedKills,
    unknownKills,
  };
}
