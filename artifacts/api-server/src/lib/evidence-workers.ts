export type EvidenceClassification = "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";
export type EvidenceConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type EvidenceFamily =
  | "MONETARY"
  | "DEMAND_QUALITY"
  | "COMPETITIVE_BEATABILITY"
  | "KILL_RISK"
  | "DISTRIBUTION"
  | "BUILD_OPERATIONS"
  | "ECONOMICS"
  | "UNCERTAINTY_RESOLUTION";

export type EvidenceLadderRung =
  | "ATTENTION"
  | "INTEREST"
  | "USAGE"
  | "REPEAT_USAGE"
  | "PAIN"
  | "UNMET_DEMAND"
  | "PURCHASE_INTENT"
  | "WILLINGNESS_TO_PAY"
  | "ACTUAL_SPENDING"
  | "RETENTION"
  | "UNIT_ECONOMICS"
  | "SUSTAINABLE_PROFITABILITY";

export type StructuredEvidence = {
  family: EvidenceFamily;
  dimension: string;
  claim: string;
  classification: EvidenceClassification;
  confidence: EvidenceConfidence;
  ladderRung: EvidenceLadderRung;
  sourceType: string;
  sourceRef: string | null;
  observedAt: string | null;
  decisionImpact: string[];
  metadata?: Record<string, unknown>;
};

export type KillClass =
  | "NO_MONETIZATION_PATH"
  | "PLATFORM_OWNER_THREAT"
  | "LEGAL_OR_COMPLIANCE_BLOCK"
  | "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK"
  | "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION"
  | "NETWORK_EFFECT_LOCK_IN";

export type KillStatus = "CONFIRMED" | "CLEAR" | "UNKNOWN";

export type KillAssessment = {
  killClass: KillClass;
  status: KillStatus;
  rationale: string;
  evidence: StructuredEvidence[];
};

export type KillScreenResult = {
  overall: "BLOCKED" | "INCOMPLETE" | "CLEAR";
  assessments: KillAssessment[];
  confirmedKills: KillClass[];
  unknownKills: KillClass[];
};

export type ExistingResearchContext = {
  policyStatus: "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | null;
  demandConclusion: "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN" | null;
  buyerIdentified?: "true" | "false" | "unknown" | null;
  buyerDescription?: string | null;
  recurringUsageSignal?: "yes" | "no" | "unknown" | null;
  recurringUsageBasis?: string | null;
  existingPaidAnalogFound?: boolean | null;
  paidAnalogNames?: string[] | null;
};

const nowDate = () => new Date().toISOString();

export function runExistingResearchEvidenceWorkers(context: ExistingResearchContext): StructuredEvidence[] {
  const evidence: StructuredEvidence[] = [];

  if (context.buyerIdentified === "true") {
    evidence.push({
      family: "DEMAND_QUALITY",
      dimension: "buyer_clarity",
      claim: `A target buyer was identified${context.buyerDescription ? `: ${context.buyerDescription}` : "."}`,
      classification: "INFERENCE",
      confidence: "MEDIUM",
      ladderRung: "PAIN",
      sourceType: "DEMAND_CHECK",
      sourceRef: null,
      observedAt: nowDate(),
      decisionImpact: ["INVESTIGATION", "VALIDATION"],
    });
  }

  if (context.recurringUsageSignal === "yes") {
    evidence.push({
      family: "DEMAND_QUALITY",
      dimension: "recurring_need",
      claim: `Existing research found a recurring-usage signal${context.recurringUsageBasis ? `: ${context.recurringUsageBasis}` : "."}`,
      classification: "INFERENCE",
      confidence: "MEDIUM",
      ladderRung: "REPEAT_USAGE",
      sourceType: "DEMAND_CHECK",
      sourceRef: null,
      observedAt: nowDate(),
      decisionImpact: ["INVESTIGATION", "VALIDATION"],
    });
  }

  if (context.existingPaidAnalogFound) {
    const names = context.paidAnalogNames?.filter(Boolean) ?? [];
    evidence.push({
      family: "MONETARY",
      dimension: "paid_supply_exists",
      claim: names.length
        ? `Existing research identified paid analogs: ${names.join(", ")}.`
        : "Existing research identified at least one paid analog.",
      classification: "INFERENCE",
      confidence: "MEDIUM",
      ladderRung: "WILLINGNESS_TO_PAY",
      sourceType: "DEMAND_CHECK",
      sourceRef: null,
      observedAt: nowDate(),
      decisionImpact: ["KILL_SCREEN", "INVESTIGATION", "VALIDATION"],
      metadata: { paidAnalogNames: names },
    });
  }

  if (context.demandConclusion === "UNSUPPORTED") {
    evidence.push({
      family: "DEMAND_QUALITY",
      dimension: "demand_contradiction",
      claim: "Demand Check concluded the current thesis is unsupported.",
      classification: "INFERENCE",
      confidence: "HIGH",
      ladderRung: "UNMET_DEMAND",
      sourceType: "DEMAND_CHECK",
      sourceRef: null,
      observedAt: nowDate(),
      decisionImpact: ["REJECT"],
    });
  }

  if (context.policyStatus === "RED") {
    evidence.push({
      family: "KILL_RISK",
      dimension: "legal_or_compliance_block",
      claim: "Policy Check found a blocking policy/legal conflict.",
      classification: "INFERENCE",
      confidence: "HIGH",
      ladderRung: "PAIN",
      sourceType: "POLICY_CHECK",
      sourceRef: null,
      observedAt: nowDate(),
      decisionImpact: ["KILL_SCREEN", "REJECT"],
    });
  }

  return evidence;
}

export function evaluateKillScreen(context: ExistingResearchContext, evidence: StructuredEvidence[]): KillScreenResult {
  const legalEvidence = evidence.filter((item) => item.dimension === "legal_or_compliance_block");
  const monetaryEvidence = evidence.filter((item) => item.family === "MONETARY" && item.ladderRung === "WILLINGNESS_TO_PAY");

  const assessments: KillAssessment[] = [
    {
      killClass: "NO_MONETIZATION_PATH",
      status: context.demandConclusion === "UNSUPPORTED"
        ? "CONFIRMED"
        : monetaryEvidence.length > 0
          ? "CLEAR"
          : "UNKNOWN",
      rationale: context.demandConclusion === "UNSUPPORTED"
        ? "Current demand evidence affirmatively contradicts the thesis."
        : monetaryEvidence.length > 0
          ? "At least one monetary-rung signal exists; this does not prove attractive economics, but it prevents a no-path conclusion."
          : "No monetary-rung evidence is available yet.",
      evidence: monetaryEvidence,
    },
    {
      killClass: "LEGAL_OR_COMPLIANCE_BLOCK",
      status: context.policyStatus === "RED"
        ? "CONFIRMED"
        : context.policyStatus === "GREEN"
          ? "CLEAR"
          : "UNKNOWN",
      rationale: context.policyStatus === "RED"
        ? "Policy Check found a blocking conflict."
        : context.policyStatus === "GREEN"
          ? "Policy Check is GREEN for the scope it evaluated."
          : "Policy status is unresolved.",
      evidence: legalEvidence,
    },
    {
      killClass: "PLATFORM_OWNER_THREAT",
      status: "UNKNOWN",
      rationale: "No dedicated platform-owner threat worker has produced evidence yet.",
      evidence: [],
    },
    {
      killClass: "UNSTABLE_DEPENDENCY_MAINTENANCE_SINK",
      status: "UNKNOWN",
      rationale: "No dedicated dependency/maintenance worker has produced evidence yet.",
      evidence: [],
    },
    {
      killClass: "ECONOMICALLY_INACCESSIBLE_DISTRIBUTION",
      status: "UNKNOWN",
      rationale: "No dedicated distribution economics worker has produced evidence yet.",
      evidence: [],
    },
    {
      killClass: "NETWORK_EFFECT_LOCK_IN",
      status: "UNKNOWN",
      rationale: "No dedicated switching-cost/network-effects worker has produced evidence yet.",
      evidence: [],
    },
  ];

  const confirmedKills = assessments.filter((item) => item.status === "CONFIRMED").map((item) => item.killClass);
  const unknownKills = assessments.filter((item) => item.status === "UNKNOWN").map((item) => item.killClass);

  return {
    overall: confirmedKills.length ? "BLOCKED" : unknownKills.length ? "INCOMPLETE" : "CLEAR",
    assessments,
    confirmedKills,
    unknownKills,
  };
}
