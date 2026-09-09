export type ValidationVerdict = "REJECT" | "WATCH" | "NEEDS_MORE_VALIDATION" | "BUILD_READY";

export type ValidationDimension =
  | "buyer_clarity"
  | "problem_strength"
  | "willingness_to_pay"
  | "distribution"
  | "competitive_gap"
  | "build_feasibility"
  | "unit_economics"
  | "automation_fit";

export type ValidationSignal = {
  dimension: ValidationDimension;
  score: number;
  evidenceCount: number;
  contradictionCount?: number;
};

export type ValidationInput = {
  opportunityVerdict: string;
  policyStatus: string;
  demandConclusion: string | null;
  signals: ValidationSignal[];
};

export type ValidationResult = {
  verdict: ValidationVerdict;
  score: number;
  confidence: number;
  missingDimensions: ValidationDimension[];
  blockingDimensions: ValidationDimension[];
  rationale: string;
};

export const VALIDATION_DIMENSIONS: ValidationDimension[] = [
  "buyer_clarity",
  "problem_strength",
  "willingness_to_pay",
  "distribution",
  "competitive_gap",
  "build_feasibility",
  "unit_economics",
  "automation_fit",
];

const clamp = (value: number) => Math.max(0, Math.min(100, value));

export function evaluateValidation(input: ValidationInput): ValidationResult {
  if (input.opportunityVerdict !== "TEST" || input.policyStatus !== "GREEN" || input.demandConclusion !== "SUPPORTED") {
    return { verdict: "REJECT", score: 0, confidence: 100, missingDimensions: [], blockingDimensions: [], rationale: "Opportunity is not eligible for validation: TEST, GREEN policy, and SUPPORTED demand are required." };
  }

  const byDimension = new Map(input.signals.map((signal) => [signal.dimension, signal]));
  const missingDimensions = VALIDATION_DIMENSIONS.filter((dimension) => {
    const signal = byDimension.get(dimension);
    return !signal || signal.evidenceCount < 1;
  });

  const observed = VALIDATION_DIMENSIONS.map((dimension) => byDimension.get(dimension)).filter(Boolean) as ValidationSignal[];
  const blockingDimensions = observed
    .filter((signal) => signal.score < 35 || (signal.contradictionCount ?? 0) >= 2)
    .map((signal) => signal.dimension);

  const score = observed.length
    ? clamp(Number((observed.reduce((sum, signal) => sum + clamp(signal.score), 0) / observed.length).toFixed(2)))
    : 0;
  const evidenceCoverage = observed.length / VALIDATION_DIMENSIONS.length;
  const evidenceDepth = observed.length
    ? observed.reduce((sum, signal) => sum + Math.min(signal.evidenceCount, 3) / 3, 0) / observed.length
    : 0;
  const confidence = clamp(Number((100 * evidenceCoverage * evidenceDepth).toFixed(2)));

  if (blockingDimensions.length) {
    return { verdict: "REJECT", score, confidence, missingDimensions, blockingDimensions, rationale: `Validation found blocking evidence in: ${blockingDimensions.join(", ")}.` };
  }
  if (missingDimensions.length || confidence < 70) {
    return { verdict: "NEEDS_MORE_VALIDATION", score, confidence, missingDimensions, blockingDimensions, rationale: "Evidence is not yet broad or deep enough for a build decision." };
  }
  if (score >= 75 && confidence >= 80) {
    return { verdict: "BUILD_READY", score, confidence, missingDimensions, blockingDimensions, rationale: "Evidence clears the build-readiness thresholds across the required business dimensions." };
  }
  if (score >= 55) {
    return { verdict: "WATCH", score, confidence, missingDimensions, blockingDimensions, rationale: "Opportunity remains plausible but does not yet justify autonomous build resources." };
  }
  return { verdict: "REJECT", score, confidence, missingDimensions, blockingDimensions, rationale: "Validation evidence is sufficiently complete but the business case is too weak." };
}
