export type ValidationVerdict = "REJECT" | "WATCH" | "NEEDS_MORE_VALIDATION" | "BUILD_READY";

export type UnderwritingGroup = "OPPORTUNITY_QUALITY" | "BET_ECONOMICS" | "UNCERTAINTY_RESOLUTION";

export type UnderwritingFactor =
  | "buyer_budget_clarity"
  | "problem_intensity_recurrence"
  | "demand_trajectory_durability"
  | "monetization_proof_price_tolerance"
  | "competitive_beatability_gap_quality"
  | "distribution_accessibility_acquisition_economics"
  | "adoption_switching_friction"
  | "economic_headroom"
  | "build_complexity_technical_uncertainty"
  | "operating_maintenance_burden"
  | "unit_economics_pricing_power"
  | "capital_at_risk_reversibility"
  | "falsifiability_feedback_velocity";

export type FactorStrength = "STRONG" | "ADEQUATE" | "WEAK" | "BLOCKING" | "UNKNOWN";
export type EvidenceConfidence = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
export type EvidenceClassification = "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";
export type KillScreenOverall = "CLEAR" | "INCOMPLETE" | "BLOCKED";

export type EvidenceQualityProfile = {
  confidence: EvidenceConfidence;
  directness: EvidenceConfidence;
  sourceAuthority: EvidenceConfidence;
  independence: EvidenceConfidence;
  recency: EvidenceConfidence;
  sampleAdequacy: EvidenceConfidence;
  consistency: EvidenceConfidence;
  strongestClassification: EvidenceClassification;
  evidenceCount: number;
  contradictionCount?: number;
};

export type UnderwritingAssessment = {
  factor: UnderwritingFactor;
  strength: FactorStrength;
  evidenceQuality: EvidenceQualityProfile;
};

export type ValidationInput = {
  opportunityVerdict: string;
  policyStatus: string;
  demandConclusion: string | null;
  killScreenOverall: KillScreenOverall;
  assessments: UnderwritingAssessment[];
};

export type UnderwritingFactorDefinition = {
  factor: UnderwritingFactor;
  group: UnderwritingGroup;
  label: string;
  decisionQuestion: string;
  falsePositiveTrap: string;
};

export type ValidationResult = {
  verdict: ValidationVerdict;
  missingFactors: UnderwritingFactor[];
  unknownFactors: UnderwritingFactor[];
  blockingFactors: UnderwritingFactor[];
  weakFactors: UnderwritingFactor[];
  lowConfidenceFactors: UnderwritingFactor[];
  groupProfile: Record<UnderwritingGroup, Array<{ factor: UnderwritingFactor; strength: FactorStrength; confidence: EvidenceConfidence }>>;
  rationale: string;
};

export const UNDERWRITING_FACTOR_DEFINITIONS: UnderwritingFactorDefinition[] = [
  { factor: "buyer_budget_clarity", group: "OPPORTUNITY_QUALITY", label: "Buyer & Budget Clarity", decisionQuestion: "Who experiences the problem, who pays, and what economic motive or budget supports the purchase?", falsePositiveTrap: "Inventing an ICP without evidence that the identified buyer controls money or can trigger a purchase." },
  { factor: "problem_intensity_recurrence", group: "OPPORTUNITY_QUALITY", label: "Problem Intensity & Recurrence", decisionQuestion: "Is the problem painful and frequent enough to support continuing demand?", falsePositiveTrap: "Mistaking curiosity, occasional inconvenience, or one-time use for a recurring business problem." },
  { factor: "demand_trajectory_durability", group: "OPPORTUNITY_QUALITY", label: "Demand Trajectory & Durability", decisionQuestion: "Is demand persistent or improving rather than a temporary spike, tiny-base artifact, subsidy, or platform event?", falsePositiveTrap: "Treating short-lived growth, testing traffic, seasonality, or a small denominator as durable demand." },
  { factor: "monetization_proof_price_tolerance", group: "OPPORTUNITY_QUALITY", label: "Monetization Proof & Price Tolerance", decisionQuestion: "What evidence shows buyers exchange money for solving this problem, and at what price range?", falsePositiveTrap: "Promoting usage, downloads, stated interest, or a listed price into willingness-to-pay evidence." },
  { factor: "competitive_beatability_gap_quality", group: "OPPORTUNITY_QUALITY", label: "Competitive Beatability & Gap Quality", decisionQuestion: "Why can this entrant win, and why does the apparent gap exist?", falsePositiveTrap: "Treating low competition as positive without distinguishing whitespace from weak or absent demand." },
  { factor: "distribution_accessibility_acquisition_economics", group: "OPPORTUNITY_QUALITY", label: "Distribution Accessibility & Acquisition Economics", decisionQuestion: "Can buyers be reached repeatedly through a realistic channel at economically plausible acquisition cost?", falsePositiveTrap: "Naming SEO, social, partnerships, or ads without evidence that the channel reaches the buyer or can convert economically." },
  { factor: "adoption_switching_friction", group: "OPPORTUNITY_QUALITY", label: "Adoption & Switching Friction", decisionQuestion: "How difficult is it for a buyer to start using the product or move from the incumbent?", falsePositiveTrap: "Ignoring migration, procurement, trust, integration, data portability, workflow, or multihoming costs." },
  { factor: "economic_headroom", group: "OPPORTUNITY_QUALITY", label: "Economic Headroom", decisionQuestion: "How much realistic dollar opportunity can flow through the actual reachable wedge?", falsePositiveTrap: "Using broad TAM narratives or entire-industry revenue as if it were reachable product revenue." },
  { factor: "build_complexity_technical_uncertainty", group: "BET_ECONOMICS", label: "Build Complexity & Technical Uncertainty", decisionQuestion: "How difficult is it to reach a credible minimum product, including integrations, dependencies, testing, and unknowns?", falsePositiveTrap: "Treating AI code generation or a demo as proof that a reliable product is cheap to build." },
  { factor: "operating_maintenance_burden", group: "BET_ECONOMICS", label: "Operating & Maintenance Burden", decisionQuestion: "What ongoing breakage, support, intervention, refresh, moderation, or dependency burden follows launch?", falsePositiveTrap: "Treating one-time build cost as total product cost or percent automation as operating leverage." },
  { factor: "unit_economics_pricing_power", group: "BET_ECONOMICS", label: "Unit Economics & Pricing Power", decisionQuestion: "At plausible prices, do variable costs, platform fees, support, refunds, and acquisition economics leave attractive contribution margin?", falsePositiveTrap: "Confusing revenue with margin or gross margin with customer-level economics." },
  { factor: "capital_at_risk_reversibility", group: "BET_ECONOMICS", label: "Capital at Risk & Reversibility", decisionQuestion: "How much capital and effort are committed before useful evidence arrives, and how much can be recovered or reused if the thesis fails?", falsePositiveTrap: "Comparing bets on build price alone while ignoring validation spend, pre-evidence operations, shutdown cost, and sunk integrations." },
  { factor: "falsifiability_feedback_velocity", group: "UNCERTAINTY_RESOLUTION", label: "Falsifiability & Feedback Velocity", decisionQuestion: "How cheaply and quickly can reality prove the thesis wrong or right?", falsePositiveTrap: "Buying prolonged research or a large build when a narrow experiment could resolve the key uncertainty much faster." },
];

export const UNDERWRITING_FACTORS: UnderwritingFactor[] = UNDERWRITING_FACTOR_DEFINITIONS.map((definition) => definition.factor);

// Backward-compatible name for callers that only need to enumerate the canonical validation factors.
export const VALIDATION_DIMENSIONS = UNDERWRITING_FACTORS;

const assessmentMap = (assessments: UnderwritingAssessment[]) =>
  new Map(assessments.map((assessment) => [assessment.factor, assessment]));

const profileByGroup = (assessments: UnderwritingAssessment[]): ValidationResult["groupProfile"] => {
  const byFactor = assessmentMap(assessments);
  return {
    OPPORTUNITY_QUALITY: UNDERWRITING_FACTOR_DEFINITIONS.filter((item) => item.group === "OPPORTUNITY_QUALITY").map((item) => ({
      factor: item.factor,
      strength: byFactor.get(item.factor)?.strength ?? "UNKNOWN",
      confidence: byFactor.get(item.factor)?.evidenceQuality.confidence ?? "UNKNOWN",
    })),
    BET_ECONOMICS: UNDERWRITING_FACTOR_DEFINITIONS.filter((item) => item.group === "BET_ECONOMICS").map((item) => ({
      factor: item.factor,
      strength: byFactor.get(item.factor)?.strength ?? "UNKNOWN",
      confidence: byFactor.get(item.factor)?.evidenceQuality.confidence ?? "UNKNOWN",
    })),
    UNCERTAINTY_RESOLUTION: UNDERWRITING_FACTOR_DEFINITIONS.filter((item) => item.group === "UNCERTAINTY_RESOLUTION").map((item) => ({
      factor: item.factor,
      strength: byFactor.get(item.factor)?.strength ?? "UNKNOWN",
      confidence: byFactor.get(item.factor)?.evidenceQuality.confidence ?? "UNKNOWN",
    })),
  };
};

const result = (
  verdict: ValidationVerdict,
  assessments: UnderwritingAssessment[],
  details: Omit<ValidationResult, "verdict" | "groupProfile">,
): ValidationResult => ({ verdict, groupProfile: profileByGroup(assessments), ...details });

export function evaluateValidation(input: ValidationInput): ValidationResult {
  const byFactor = assessmentMap(input.assessments);
  const missingFactors = UNDERWRITING_FACTORS.filter((factor) => !byFactor.has(factor));
  const unknownFactors = UNDERWRITING_FACTORS.filter((factor) => byFactor.get(factor)?.strength === "UNKNOWN");
  const blockingFactors = UNDERWRITING_FACTORS.filter((factor) => byFactor.get(factor)?.strength === "BLOCKING");
  const weakFactors = UNDERWRITING_FACTORS.filter((factor) => byFactor.get(factor)?.strength === "WEAK");
  const lowConfidenceFactors = UNDERWRITING_FACTORS.filter((factor) => {
    const confidence = byFactor.get(factor)?.evidenceQuality.confidence;
    return confidence === "LOW" || confidence === "UNKNOWN";
  });
  const common = { missingFactors, unknownFactors, blockingFactors, weakFactors, lowConfidenceFactors };

  if (input.policyStatus === "RED" || input.demandConclusion === "UNSUPPORTED" || input.killScreenOverall === "BLOCKED") {
    return result("REJECT", input.assessments, { ...common, rationale: "A prerequisite or fatal gate is affirmatively blocking the opportunity; underwriting strengths cannot average it away." });
  }

  if (input.opportunityVerdict !== "TEST" || input.policyStatus !== "GREEN" || input.demandConclusion !== "SUPPORTED" || input.killScreenOverall !== "CLEAR") {
    return result("NEEDS_MORE_VALIDATION", input.assessments, { ...common, rationale: "The opportunity has not cleared the required Research and kill-screen gates for underwriting." });
  }

  if (blockingFactors.length > 0) {
    return result("REJECT", input.assessments, { ...common, rationale: `Source-backed underwriting found blocking economics in: ${blockingFactors.join(", ")}.` });
  }

  if (missingFactors.length > 0 || unknownFactors.length > 0 || lowConfidenceFactors.length > 0) {
    return result("NEEDS_MORE_VALIDATION", input.assessments, { ...common, rationale: "The business case is not sufficiently resolved: at least one required factor is missing, unknown, or supported only by low/unknown-confidence evidence." });
  }

  if (weakFactors.length > 0) {
    return result("WATCH", input.assessments, { ...common, rationale: `Evidence is sufficiently resolved to identify weak economics, but no fatal blocker is established. Weak factors: ${weakFactors.join(", ")}.` });
  }

  return result("BUILD_READY", input.assessments, { ...common, rationale: "All fatal gates are clear and every canonical underwriting factor is at least ADEQUATE on medium-or-higher-confidence evidence. No additive average was used." });
}
