import {
  UNDERWRITING_FACTORS,
  type EvidenceClassification,
  type EvidenceConfidence,
  type EvidenceQualityProfile,
  type FactorStrength,
  type UnderwritingAssessment,
  type UnderwritingFactor,
} from "./validation-engine";
import type {
  ValidationEvidenceDirection,
  ValidationEvidenceKind,
} from "./validation-evidence-collector";

export type FactorAssessmentEvidence = {
  id?: number;
  claim: string;
  sourceUrl: string;
  sourceTitle: string;
  observedDate: string;
  classification: EvidenceClassification;
  factor: UnderwritingFactor;
  direction: ValidationEvidenceDirection;
  evidenceKind: ValidationEvidenceKind;
};

export type FactorAssessmentDetail = UnderwritingAssessment & {
  rationale: string;
  supportingEvidenceIds: number[];
  contradictingEvidenceIds: number[];
  contextualEvidenceIds: number[];
  coreKindsObserved: ValidationEvidenceKind[];
  missingCoreKinds: ValidationEvidenceKind[];
};

type FactorPolicy = {
  factor: UnderwritingFactor;
  coreKinds: ValidationEvidenceKind[];
  strongCoreKinds: ValidationEvidenceKind[];
  minimumCoreKindsForAdequate: number;
  minimumCoreKindsForStrong: number;
  blockingContradictions: number;
  singleFactCanBlock: boolean;
  specialRule?: "MONETIZATION" | "UNIT_ECONOMICS" | "HEADROOM" | "CAPITAL_RISK" | "FALSIFIABILITY";
};

const POLICIES: Record<UnderwritingFactor, FactorPolicy> = {
  buyer_budget_clarity: {
    factor: "buyer_budget_clarity",
    coreKinds: ["BUYER_BUDGET"],
    strongCoreKinds: ["BUYER_BUDGET"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 1,
    blockingContradictions: 2,
    singleFactCanBlock: false,
  },
  problem_intensity_recurrence: {
    factor: "problem_intensity_recurrence",
    coreKinds: ["PROBLEM_WORKAROUND", "REPEAT_DEMAND"],
    strongCoreKinds: ["PROBLEM_WORKAROUND", "REPEAT_DEMAND"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: false,
  },
  demand_trajectory_durability: {
    factor: "demand_trajectory_durability",
    coreKinds: ["DEMAND_TREND", "REPEAT_DEMAND"],
    strongCoreKinds: ["DEMAND_TREND", "REPEAT_DEMAND"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: false,
  },
  monetization_proof_price_tolerance: {
    factor: "monetization_proof_price_tolerance",
    coreKinds: ["PAID_COMPETITOR", "PAID_SUBSTITUTE", "PRICING"],
    strongCoreKinds: ["PAID_COMPETITOR", "PAID_SUBSTITUTE", "PRICING"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: false,
    specialRule: "MONETIZATION",
  },
  competitive_beatability_gap_quality: {
    factor: "competitive_beatability_gap_quality",
    coreKinds: ["COMPETITOR_QUALITY", "COMPLAINT_OR_GAP"],
    strongCoreKinds: ["COMPETITOR_QUALITY", "COMPLAINT_OR_GAP"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: false,
  },
  distribution_accessibility_acquisition_economics: {
    factor: "distribution_accessibility_acquisition_economics",
    coreKinds: ["DISTRIBUTION_CHANNEL", "ACQUISITION_ECONOMICS"],
    strongCoreKinds: ["DISTRIBUTION_CHANNEL", "ACQUISITION_ECONOMICS"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: true,
  },
  adoption_switching_friction: {
    factor: "adoption_switching_friction",
    coreKinds: ["SWITCHING_COST", "PORTABILITY"],
    strongCoreKinds: ["SWITCHING_COST", "PORTABILITY"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: true,
  },
  economic_headroom: {
    factor: "economic_headroom",
    coreKinds: ["REACHABLE_WEDGE", "PRICING", "BUYER_BUDGET"],
    strongCoreKinds: ["REACHABLE_WEDGE", "PRICING", "BUYER_BUDGET"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: false,
    specialRule: "HEADROOM",
  },
  build_complexity_technical_uncertainty: {
    factor: "build_complexity_technical_uncertainty",
    coreKinds: ["BUILD_REQUIREMENT", "TECH_DEPENDENCY"],
    strongCoreKinds: ["BUILD_REQUIREMENT", "TECH_DEPENDENCY"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: true,
  },
  operating_maintenance_burden: {
    factor: "operating_maintenance_burden",
    coreKinds: ["OPERATING_BURDEN", "MAINTENANCE_HISTORY"],
    strongCoreKinds: ["OPERATING_BURDEN", "MAINTENANCE_HISTORY"],
    minimumCoreKindsForAdequate: 1,
    minimumCoreKindsForStrong: 2,
    blockingContradictions: 2,
    singleFactCanBlock: true,
  },
  unit_economics_pricing_power: {
    factor: "unit_economics_pricing_power",
    coreKinds: ["PRICING", "VARIABLE_COST", "PLATFORM_FEE", "SUPPORT_COST", "ACQUISITION_ECONOMICS"],
    strongCoreKinds: ["PRICING", "VARIABLE_COST", "PLATFORM_FEE", "SUPPORT_COST", "ACQUISITION_ECONOMICS"],
    minimumCoreKindsForAdequate: 2,
    minimumCoreKindsForStrong: 3,
    blockingContradictions: 2,
    singleFactCanBlock: true,
    specialRule: "UNIT_ECONOMICS",
  },
  capital_at_risk_reversibility: {
    factor: "capital_at_risk_reversibility",
    coreKinds: ["VALIDATION_COST", "REVERSIBILITY", "BUILD_REQUIREMENT"],
    strongCoreKinds: ["VALIDATION_COST", "REVERSIBILITY", "BUILD_REQUIREMENT"],
    minimumCoreKindsForAdequate: 2,
    minimumCoreKindsForStrong: 3,
    blockingContradictions: 2,
    singleFactCanBlock: true,
    specialRule: "CAPITAL_RISK",
  },
  falsifiability_feedback_velocity: {
    factor: "falsifiability_feedback_velocity",
    coreKinds: ["TEST_DESIGN", "TIME_TO_SIGNAL", "VALIDATION_COST"],
    strongCoreKinds: ["TEST_DESIGN", "TIME_TO_SIGNAL", "VALIDATION_COST"],
    minimumCoreKindsForAdequate: 2,
    minimumCoreKindsForStrong: 3,
    blockingContradictions: 2,
    singleFactCanBlock: false,
    specialRule: "FALSIFIABILITY",
  },
};

const confidenceRank: Record<EvidenceConfidence, number> = {
  UNKNOWN: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const classificationRank: Record<EvidenceClassification, number> = {
  UNKNOWN: 0,
  INFERENCE: 1,
  CLAIM: 2,
  FACT: 3,
};

const classifyLevel = (rank: number): EvidenceConfidence => {
  if (rank >= 3) return "HIGH";
  if (rank === 2) return "MEDIUM";
  if (rank === 1) return "LOW";
  return "UNKNOWN";
};

const sourceHost = (url: string): string | null => {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return null;
  }
};

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const strongestClassification = (items: FactorAssessmentEvidence[]): EvidenceClassification => {
  let strongest: EvidenceClassification = "UNKNOWN";
  for (const item of items) {
    if (classificationRank[item.classification] > classificationRank[strongest]) strongest = item.classification;
  }
  return strongest;
};

const evidenceQuality = (
  evidence: FactorAssessmentEvidence[],
  policy: FactorPolicy,
): EvidenceQualityProfile => {
  if (evidence.length === 0) {
    return {
      confidence: "UNKNOWN",
      directness: "UNKNOWN",
      sourceAuthority: "UNKNOWN",
      independence: "UNKNOWN",
      recency: "UNKNOWN",
      sampleAdequacy: "UNKNOWN",
      consistency: "UNKNOWN",
      strongestClassification: "UNKNOWN",
      evidenceCount: 0,
      contradictionCount: 0,
    };
  }

  const directional = evidence.filter((item) => item.direction !== "CONTEXT");
  const coreDirectional = directional.filter((item) => policy.coreKinds.includes(item.evidenceKind));
  const coreKinds = unique(coreDirectional.map((item) => item.evidenceKind));
  const hosts = unique(evidence.map((item) => sourceHost(item.sourceUrl)).filter(Boolean) as string[]);
  const strongest = strongestClassification(evidence);
  const supports = directional.filter((item) => item.direction === "SUPPORTS").length;
  const contradicts = directional.filter((item) => item.direction === "CONTRADICTS").length;

  const directness: EvidenceConfidence =
    coreKinds.length >= Math.min(policy.minimumCoreKindsForStrong, policy.coreKinds.length)
      ? "HIGH"
      : coreKinds.length >= policy.minimumCoreKindsForAdequate
        ? "MEDIUM"
        : coreDirectional.length > 0
          ? "LOW"
          : "UNKNOWN";

  // Task #47 verifies that a URL was actually returned by web search, but it does not
  // independently certify primary-source authority. Keep this conservative by design.
  const sourceAuthority: EvidenceConfidence = strongest === "FACT" || strongest === "CLAIM" ? "MEDIUM" : "LOW";
  const independence: EvidenceConfidence = hosts.length >= 3 ? "HIGH" : hosts.length >= 2 ? "MEDIUM" : "LOW";
  // observedDate is collection date, not the publication date of the source. We must not
  // pretend source recency is known until collectors capture source publication/update time.
  const recency: EvidenceConfidence = "UNKNOWN";
  const sampleAdequacy: EvidenceConfidence =
    directional.length >= 4 && hosts.length >= 2 ? "HIGH" : directional.length >= 2 ? "MEDIUM" : "LOW";
  const consistency: EvidenceConfidence =
    supports > 0 && contradicts > 0
      ? "LOW"
      : directional.length >= 2
        ? "HIGH"
        : directional.length === 1
          ? "MEDIUM"
          : "UNKNOWN";

  // Overall confidence intentionally excludes source recency because Task #47 does not capture
  // publication/update timestamps. It is bounded by the weakest decision-critical observable.
  const overallRank = Math.min(
    confidenceRank[directness],
    confidenceRank[sourceAuthority],
    confidenceRank[independence],
    confidenceRank[sampleAdequacy],
    confidenceRank[consistency],
  );

  return {
    confidence: classifyLevel(overallRank),
    directness,
    sourceAuthority,
    independence,
    recency,
    sampleAdequacy,
    consistency,
    strongestClassification: strongest,
    evidenceCount: evidence.length,
    contradictionCount: contradicts,
  };
};

const directionalCoreEvidence = (
  evidence: FactorAssessmentEvidence[],
  policy: FactorPolicy,
  direction: "SUPPORTS" | "CONTRADICTS",
) => evidence.filter((item) => item.direction === direction && policy.coreKinds.includes(item.evidenceKind));

const hasFact = (items: FactorAssessmentEvidence[]): boolean => items.some((item) => item.classification === "FACT");

const independentHostCount = (items: FactorAssessmentEvidence[]): number =>
  unique(items.map((item) => sourceHost(item.sourceUrl)).filter(Boolean) as string[]).length;

const specialAdequacySatisfied = (
  policy: FactorPolicy,
  supports: FactorAssessmentEvidence[],
): boolean => {
  const kinds = new Set(supports.map((item) => item.evidenceKind));
  switch (policy.specialRule) {
    case "MONETIZATION":
      // A listed price alone is not willingness-to-pay evidence. At least one paid analog/substitute
      // is required for ADEQUATE; pricing can strengthen but cannot establish payment by itself.
      return kinds.has("PAID_COMPETITOR") || kinds.has("PAID_SUBSTITUTE");
    case "UNIT_ECONOMICS":
      // Unit economics requires both a value side and a cost side. Revenue/pricing alone is not margin.
      return (
        kinds.has("PRICING") &&
        ["VARIABLE_COST", "PLATFORM_FEE", "SUPPORT_COST", "ACQUISITION_ECONOMICS"].some((kind) =>
          kinds.has(kind as ValidationEvidenceKind),
        )
      );
    case "HEADROOM":
      // Broad market size is never accepted. Reachable wedge evidence is mandatory.
      return kinds.has("REACHABLE_WEDGE");
    case "CAPITAL_RISK":
      return kinds.has("REVERSIBILITY") && (kinds.has("VALIDATION_COST") || kinds.has("BUILD_REQUIREMENT"));
    case "FALSIFIABILITY":
      return kinds.has("TEST_DESIGN") && kinds.has("TIME_TO_SIGNAL");
    default:
      return true;
  }
};

const determineStrength = (
  evidence: FactorAssessmentEvidence[],
  policy: FactorPolicy,
  quality: EvidenceQualityProfile,
): FactorStrength => {
  const supports = directionalCoreEvidence(evidence, policy, "SUPPORTS");
  const contradicts = directionalCoreEvidence(evidence, policy, "CONTRADICTS");
  const supportKinds = unique(supports.map((item) => item.evidenceKind));
  const contradictionHosts = independentHostCount(contradicts);

  if (supports.length === 0 && contradicts.length === 0) return "UNKNOWN";

  const blockingByCorroboration =
    contradicts.length >= policy.blockingContradictions &&
    contradictionHosts >= Math.min(2, policy.blockingContradictions) &&
    hasFact(contradicts);
  const blockingBySingleFact =
    policy.singleFactCanBlock &&
    contradicts.some((item) => item.classification === "FACT") &&
    supports.length === 0;

  if (blockingByCorroboration || blockingBySingleFact) return "BLOCKING";

  if (contradicts.length > 0) return "WEAK";

  if (!specialAdequacySatisfied(policy, supports)) return "UNKNOWN";
  if (supportKinds.length < policy.minimumCoreKindsForAdequate) return "UNKNOWN";

  const strongKindsObserved = unique(
    supports.filter((item) => policy.strongCoreKinds.includes(item.evidenceKind)).map((item) => item.evidenceKind),
  );
  const strongEnough =
    strongKindsObserved.length >= policy.minimumCoreKindsForStrong &&
    quality.confidence === "HIGH" &&
    independentHostCount(supports) >= 2;

  return strongEnough ? "STRONG" : "ADEQUATE";
};

const evidenceIds = (
  evidence: FactorAssessmentEvidence[],
  direction: ValidationEvidenceDirection,
): number[] => evidence.filter((item) => item.direction === direction && item.id != null).map((item) => item.id as number);

export const assessUnderwritingFactor = (
  factor: UnderwritingFactor,
  allEvidence: FactorAssessmentEvidence[],
): FactorAssessmentDetail => {
  const policy = POLICIES[factor];
  const evidence = allEvidence.filter((item) => item.factor === factor);
  const quality = evidenceQuality(evidence, policy);
  const strength = determineStrength(evidence, policy, quality);
  const coreKindsObserved = unique(
    evidence
      .filter((item) => item.direction !== "CONTEXT" && policy.coreKinds.includes(item.evidenceKind))
      .map((item) => item.evidenceKind),
  );
  const missingCoreKinds = policy.coreKinds.filter((kind) => !coreKindsObserved.includes(kind));
  const supports = directionalCoreEvidence(evidence, policy, "SUPPORTS");
  const contradicts = directionalCoreEvidence(evidence, policy, "CONTRADICTS");

  let rationale: string;
  if (strength === "UNKNOWN") {
    rationale = `The factor remains unresolved. Direct factor-specific evidence is missing or insufficient under the ${factor} rule; missing core evidence kinds: ${missingCoreKinds.join(", ") || "none"}.`;
  } else if (strength === "BLOCKING") {
    rationale = `Source-backed factor-specific evidence establishes a blocking condition. Core contradicting findings: ${contradicts.length}; independent contradicting source hosts: ${independentHostCount(contradicts)}.`;
  } else if (strength === "WEAK") {
    rationale = `The factor has material contradicting evidence but does not meet the deterministic blocking rule. Supports: ${supports.length}; contradictions: ${contradicts.length}.`;
  } else {
    rationale = `${strength} is supported by factor-specific evidence without a material contradiction. Core supporting kinds observed: ${unique(supports.map((item) => item.evidenceKind)).join(", ")}.`;
  }

  return {
    factor,
    strength,
    evidenceQuality: quality,
    rationale,
    supportingEvidenceIds: evidenceIds(evidence, "SUPPORTS"),
    contradictingEvidenceIds: evidenceIds(evidence, "CONTRADICTS"),
    contextualEvidenceIds: evidenceIds(evidence, "CONTEXT"),
    coreKindsObserved,
    missingCoreKinds,
  };
};

export const assessAllUnderwritingFactors = (
  evidence: FactorAssessmentEvidence[],
): FactorAssessmentDetail[] => UNDERWRITING_FACTORS.map((factor) => assessUnderwritingFactor(factor, evidence));

export const parsePersistedUnderwritingDimension = (
  value: string,
): { factor: UnderwritingFactor; direction: ValidationEvidenceDirection; evidenceKind: ValidationEvidenceKind } | null => {
  const [prefix, factor, direction, evidenceKind, ...rest] = value.split(":");
  if (prefix !== "underwriting" || rest.length > 0) return null;
  if (!UNDERWRITING_FACTORS.includes(factor as UnderwritingFactor)) return null;
  if (!["SUPPORTS", "CONTRADICTS", "CONTEXT"].includes(direction)) return null;
  const validKinds: ValidationEvidenceKind[] = [
    "BUYER_BUDGET",
    "PROBLEM_WORKAROUND",
    "REPEAT_DEMAND",
    "DEMAND_TREND",
    "PAID_COMPETITOR",
    "PAID_SUBSTITUTE",
    "PRICING",
    "COMPETITOR_QUALITY",
    "COMPLAINT_OR_GAP",
    "DISTRIBUTION_CHANNEL",
    "ACQUISITION_ECONOMICS",
    "SWITCHING_COST",
    "PORTABILITY",
    "REACHABLE_WEDGE",
    "BUILD_REQUIREMENT",
    "TECH_DEPENDENCY",
    "OPERATING_BURDEN",
    "MAINTENANCE_HISTORY",
    "VARIABLE_COST",
    "PLATFORM_FEE",
    "SUPPORT_COST",
    "REVERSIBILITY",
    "VALIDATION_COST",
    "TEST_DESIGN",
    "TIME_TO_SIGNAL",
  ];
  if (!validKinds.includes(evidenceKind as ValidationEvidenceKind)) return null;
  return {
    factor: factor as UnderwritingFactor,
    direction: direction as ValidationEvidenceDirection,
    evidenceKind: evidenceKind as ValidationEvidenceKind,
  };
};
