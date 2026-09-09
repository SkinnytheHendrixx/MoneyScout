import type {
  UnderwritingAssessment,
  UnderwritingFactor,
  ValidationResult,
} from "./validation-engine";

export type ExperimentType =
  | "PAID_COMMITMENT_TEST"
  | "MANUAL_CONCIERGE_TEST"
  | "CHANNEL_SMOKE_TEST"
  | "MINIMAL_MARKETPLACE_LAUNCH"
  | "SWITCHING_TRIAL"
  | "COMPETITOR_GAP_PROBE"
  | "TECHNICAL_SPIKE"
  | "DEPENDENCY_SOAK_TEST"
  | "UNIT_COST_BENCHMARK"
  | "REPEAT_USAGE_PILOT";

export type ExperimentCostClass = "VERY_LOW" | "LOW" | "MODERATE";
export type ExperimentTimeToSignal = "HOURS" | "DAYS" | "ONE_TO_TWO_WEEKS";
export type ExperimentReversibility = "HIGH" | "MEDIUM";

export type FalsifyingExperimentPlan = {
  schemaVersion: 1;
  planKey: string;
  experimentType: ExperimentType;
  targetFactors: UnderwritingFactor[];
  hypothesis: string;
  falsificationQuestion: string;
  procedure: string[];
  evidenceProduced: string[];
  costClass: ExperimentCostClass;
  timeToSignal: ExperimentTimeToSignal;
  reversibility: ExperimentReversibility;
  selectionBasis: string;
  nonGoals: string[];
};

type ExperimentTemplate = Omit<
  FalsifyingExperimentPlan,
  "schemaVersion" | "planKey" | "targetFactors" | "selectionBasis"
> & {
  targets: UnderwritingFactor[];
  platformNativeFor?: string[];
};

// This order is intentionally qualitative, not a probability model or an economic score.
// It asks first whether a painful problem can support a real transaction, then whether it can
// be reached and served economically, before spending effort resolving lower-leverage unknowns.
export const EXPERIMENT_FACTOR_PRIORITY: UnderwritingFactor[] = [
  "monetization_proof_price_tolerance",
  "problem_intensity_recurrence",
  "buyer_budget_clarity",
  "distribution_accessibility_acquisition_economics",
  "unit_economics_pricing_power",
  "adoption_switching_friction",
  "economic_headroom",
  "build_complexity_technical_uncertainty",
  "operating_maintenance_burden",
  "demand_trajectory_durability",
  "competitive_beatability_gap_quality",
  "capital_at_risk_reversibility",
  "falsifiability_feedback_velocity",
];

const TEMPLATES: ExperimentTemplate[] = [
  {
    experimentType: "PAID_COMMITMENT_TEST",
    targets: [
      "monetization_proof_price_tolerance",
      "buyer_budget_clarity",
      "economic_headroom",
    ],
    hypothesis:
      "A clearly identified buyer will make a real, reversible monetary commitment for the narrow solution before a full product is built.",
    falsificationQuestion:
      "When the offer and price are concrete, do qualified target buyers consistently refuse or prove unable to authorize any real monetary commitment?",
    procedure: [
      "Define the narrowest sellable promise and an explicit price or deposit amount supported by current evidence rather than inventing a market-clearing price.",
      "Present the same concrete offer to qualified target buyers through the cheapest reachable channel already identified.",
      "Ask for a real but reversible commitment such as a paid pilot, deposit, preorder, or other cancellable transaction rather than a survey answer.",
      "Record acceptance, refusal, budget/authority objections, and the exact offer shown. Do not reinterpret clicks or compliments as payment evidence.",
    ],
    evidenceProduced: [
      "Observed monetary commitment or refusal",
      "Buyer budget-authority evidence",
      "Price-tolerance evidence for the tested narrow offer",
    ],
    costClass: "VERY_LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: [
      "One payment does not establish market size, retention, or scalable acquisition economics.",
      "The test must not convert page visits or stated interest into willingness-to-pay evidence.",
    ],
  },
  {
    experimentType: "MANUAL_CONCIERGE_TEST",
    targets: ["problem_intensity_recurrence", "adoption_switching_friction", "buyer_budget_clarity"],
    hypothesis:
      "A qualified buyer experiences the problem strongly enough to complete the workflow with a deliberately manual version of the solution and can adopt it without prohibitive friction.",
    falsificationQuestion:
      "Does the buyer abandon, defer, or bypass the workflow once real effort, data access, migration, or operating conditions are introduced?",
    procedure: [
      "Deliver the smallest useful outcome manually without building the automated product.",
      "Require the same inputs, permissions, data, or workflow changes that the eventual product would need where practical.",
      "Observe whether the user completes the workflow, where adoption fails, and whether the problem returns naturally.",
      "Record human minutes required so manual effort is not mistaken for scalable automation.",
    ],
    evidenceProduced: [
      "Observed problem/workflow completion",
      "Adoption and switching-friction observations",
      "Manual operating burden observations",
    ],
    costClass: "VERY_LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["Manual delivery does not establish scalable margins or automated reliability."],
  },
  {
    experimentType: "CHANNEL_SMOKE_TEST",
    targets: ["distribution_accessibility_acquisition_economics", "buyer_budget_clarity"],
    hypothesis:
      "The identified buyer can be reached through a specific low-cost channel and will take a concrete next step toward the narrow offer.",
    falsificationQuestion:
      "Does the proposed channel fail to reach qualified buyers or produce any credible progression toward the offer despite a clear message and accessible call to action?",
    procedure: [
      "Choose one already-plausible channel rather than testing many channels at once.",
      "Publish or send one narrow offer with an unambiguous call to action tied to the target buyer and use case.",
      "Measure qualified responses and progression to the next commercial step, separating raw traffic from buyer-qualified activity.",
      "Stop after the bounded test window; do not automatically increase paid acquisition spend to rescue a weak result.",
    ],
    evidenceProduced: ["Reachability evidence", "Qualified channel-response evidence", "Early acquisition-friction evidence"],
    costClass: "VERY_LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["A click-through rate alone does not establish CAC, conversion economics, or willingness to pay."],
  },
  {
    experimentType: "MINIMAL_MARKETPLACE_LAUNCH",
    targets: [
      "distribution_accessibility_acquisition_economics",
      "demand_trajectory_durability",
      "problem_intensity_recurrence",
      "falsifiability_feedback_velocity",
    ],
    platformNativeFor: ["APIFY", "APIFY_STORE"],
    hypothesis:
      "A deliberately narrow marketplace-native product can attract real target usage quickly enough to expose whether the underlying workflow demand exists before a broader build.",
    falsificationQuestion:
      "After a minimal credible listing is available in the native marketplace, does qualified usage fail to materialize or fail to repeat under observable conditions?",
    procedure: [
      "Publish the narrowest credible marketplace product that completes one core workflow and exposes real telemetry.",
      "Keep the feature surface intentionally small and avoid building adjacent capabilities before demand is observed.",
      "Observe qualified starts, completed runs, repeat behavior, failures, and support requests separately.",
      "Treat usage only as usage evidence; require a separate monetary test before claiming willingness to pay unless the launch itself includes an actual paid transaction.",
    ],
    evidenceProduced: ["Marketplace reachability", "Observed real usage", "Repeat-use signal", "Time-to-feedback evidence"],
    costClass: "LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["Usage is not revenue, willingness to pay, retention, or sustainable unit economics."],
  },
  {
    experimentType: "SWITCHING_TRIAL",
    targets: ["adoption_switching_friction", "competitive_beatability_gap_quality"],
    hypothesis:
      "A target user can move one representative workflow from the incumbent or workaround to the proposed solution without prohibitive migration, trust, procurement, or integration friction.",
    falsificationQuestion:
      "Do real switching requirements overwhelm the proposed product advantage for the representative workflow?",
    procedure: [
      "Choose one representative incumbent or current workaround and one bounded workflow.",
      "Attempt the actual migration or side-by-side adoption using realistic data, permissions, and integration requirements.",
      "Record blockers, manual steps, irreversible changes, procurement/trust requirements, and whether multihoming is practical.",
      "Compare the observed switching burden with the specific proposed advantage without assigning a generic competitive score.",
    ],
    evidenceProduced: ["Observed switching burden", "Portability evidence", "Concrete competitive-gap evidence"],
    costClass: "LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["Market share alone is not treated as switching-cost or network-effect evidence."],
  },
  {
    experimentType: "COMPETITOR_GAP_PROBE",
    targets: ["competitive_beatability_gap_quality", "problem_intensity_recurrence"],
    hypothesis:
      "The apparent incumbent weakness is material to users and can be improved in a narrow way that changes workflow choice or satisfaction.",
    falsificationQuestion:
      "When the alleged gap is isolated, do users fail to care about it or does the gap disappear under direct comparison?",
    procedure: [
      "Select one specific incumbent weakness supported by complaints, reliability evidence, freshness gaps, or workflow limitations.",
      "Create the smallest demonstration or manual alternative that fixes only that weakness.",
      "Compare the incumbent and proposed alternative on the affected workflow with target users or representative data.",
      "Record whether the gap changes behavior or merely produces a preference comment.",
    ],
    evidenceProduced: ["Observed gap materiality", "Behavioral response to the proposed wedge", "Problem-strength evidence"],
    costClass: "VERY_LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["Low competition by itself is not evidence of a valuable gap."],
  },
  {
    experimentType: "TECHNICAL_SPIKE",
    targets: ["build_complexity_technical_uncertainty", "capital_at_risk_reversibility", "falsifiability_feedback_velocity"],
    hypothesis:
      "The highest-risk technical dependency can complete one representative end-to-end path with a small, disposable implementation before the product is built.",
    falsificationQuestion:
      "Does the representative technical path fail because of access, reliability, latency, anti-automation, integration, or complexity constraints that materially expand the build?",
    procedure: [
      "Identify the single technical unknown most capable of invalidating the build thesis.",
      "Implement only enough code to exercise that dependency end to end on representative input.",
      "Capture failure modes, manual workarounds, latency, permissions, and infrastructure requirements.",
      "Discard or reuse the spike after the uncertainty is resolved; do not allow it to silently become the production architecture.",
    ],
    evidenceProduced: ["Observed technical feasibility", "Dependency failure modes", "Build-scope and reversibility evidence"],
    costClass: "VERY_LOW",
    timeToSignal: "HOURS",
    reversibility: "HIGH",
    nonGoals: ["A successful demo is not proof of production reliability, maintenance cost, or customer demand."],
  },
  {
    experimentType: "DEPENDENCY_SOAK_TEST",
    targets: ["operating_maintenance_burden", "build_complexity_technical_uncertainty"],
    hypothesis:
      "The critical external dependency remains reliable enough across repeated representative runs that ongoing breakage is unlikely to dominate the economics.",
    falsificationQuestion:
      "Do repeated representative runs reveal breakage, intervention, rate-limit, schema-change, or recovery burden that makes the operating thesis unattractive?",
    procedure: [
      "Run the narrow technical path repeatedly across representative inputs and realistic timing rather than a single happy-path demo.",
      "Record failures, retries, manual interventions, target changes, rate limits, and recovery steps.",
      "Separate product defects from external-dependency failures.",
      "Stop before expanding the product surface; this test exists to expose maintenance risk, not to optimize around it indefinitely.",
    ],
    evidenceProduced: ["Observed repeated-breakage rate", "Manual intervention evidence", "Dependency recovery burden"],
    costClass: "LOW",
    timeToSignal: "DAYS",
    reversibility: "HIGH",
    nonGoals: ["A short soak cannot establish long-term maintenance cost; it can expose early evidence against the thesis."],
  },
  {
    experimentType: "UNIT_COST_BENCHMARK",
    targets: ["unit_economics_pricing_power", "build_complexity_technical_uncertainty", "capital_at_risk_reversibility"],
    hypothesis:
      "A representative unit of the product can be delivered with observable variable costs that leave room beneath a source-supported plausible price.",
    falsificationQuestion:
      "Do measured compute, API, data, platform, support, or manual-delivery costs consume the plausible selling price before scalable acquisition is even considered?",
    procedure: [
      "Execute one representative workload using the smallest credible implementation or manual equivalent.",
      "Measure actual variable resource use and applicable platform/API/data fees rather than estimating from a generic software margin.",
      "Add observed human intervention required for the representative unit.",
      "Compare measured cost components with source-supported pricing evidence without inventing CAC, retention, or volume assumptions.",
    ],
    evidenceProduced: ["Measured unit-cost components", "Observed resource usage", "Price-versus-cost headroom evidence"],
    costClass: "VERY_LOW",
    timeToSignal: "HOURS",
    reversibility: "HIGH",
    nonGoals: ["This benchmark does not establish CAC, retention, total market demand, or final profitability."],
  },
  {
    experimentType: "REPEAT_USAGE_PILOT",
    targets: ["demand_trajectory_durability", "problem_intensity_recurrence"],
    hypothesis:
      "The same buyer or workflow naturally needs the solution again after the initial use rather than demand being one-off curiosity.",
    falsificationQuestion:
      "After the initial outcome, does the workflow fail to recur or do users stop returning when no reminder or artificial incentive is applied?",
    procedure: [
      "Provide the narrow solution to a small set of qualified users or one recurring workflow.",
      "Observe whether the underlying need returns naturally during a bounded period.",
      "Separate reminders, testing traffic, promotions, and operator-triggered reruns from organic repeat behavior.",
      "Record recurrence and reasons for non-return without projecting long-term retention from the pilot.",
    ],
    evidenceProduced: ["Observed recurrence", "Repeat-use behavior", "Reasons for non-return"],
    costClass: "LOW",
    timeToSignal: "ONE_TO_TWO_WEEKS",
    reversibility: "HIGH",
    nonGoals: ["A short pilot is not long-term retention or durable revenue proof."],
  },
];

const costRank: Record<ExperimentCostClass, number> = { VERY_LOW: 0, LOW: 1, MODERATE: 2 };
const timeRank: Record<ExperimentTimeToSignal, number> = { HOURS: 0, DAYS: 1, ONE_TO_TWO_WEEKS: 2 };

const unique = <T>(items: T[]): T[] => [...new Set(items)];

const unresolvedFactors = (
  result: ValidationResult,
  assessments: UnderwritingAssessment[],
): UnderwritingFactor[] => {
  const fromResult = [
    ...result.missingFactors,
    ...result.unknownFactors,
    ...result.lowConfidenceFactors,
  ];
  const fromAssessments = assessments
    .filter(
      (assessment) =>
        assessment.strength === "UNKNOWN" ||
        assessment.evidenceQuality.confidence === "LOW" ||
        assessment.evidenceQuality.confidence === "UNKNOWN",
    )
    .map((assessment) => assessment.factor);
  return unique([...fromResult, ...fromAssessments]);
};

const normalizedPlatform = (value: string | null | undefined): string =>
  (value ?? "").trim().replaceAll(" ", "_").toUpperCase();

export function chooseCheapestFalsifyingExperiment(input: {
  validationResult: ValidationResult;
  assessments: UnderwritingAssessment[];
  sourcePlatform?: string | null;
}): FalsifyingExperimentPlan | null {
  if (input.validationResult.verdict !== "NEEDS_MORE_VALIDATION") return null;

  const gaps = unresolvedFactors(input.validationResult, input.assessments);
  if (gaps.length === 0) return null;

  const highestPriorityGap = EXPERIMENT_FACTOR_PRIORITY.find((factor) => gaps.includes(factor));
  if (!highestPriorityGap) return null;

  const platform = normalizedPlatform(input.sourcePlatform);
  const candidates = TEMPLATES
    .map((template, templateOrder) => {
      const targetFactors = template.targets.filter((factor) => gaps.includes(factor));
      return {
        template,
        templateOrder,
        targetFactors,
        coversPriorityGap: targetFactors.includes(highestPriorityGap),
        platformNative: (template.platformNativeFor ?? []).includes(platform),
      };
    })
    .filter((candidate) => candidate.targetFactors.length > 0 && candidate.coversPriorityGap);

  if (candidates.length === 0) return null;

  candidates.sort((a, b) => {
    const cost = costRank[a.template.costClass] - costRank[b.template.costClass];
    if (cost !== 0) return cost;
    const time = timeRank[a.template.timeToSignal] - timeRank[b.template.timeToSignal];
    if (time !== 0) return time;
    if (a.platformNative !== b.platformNative) return a.platformNative ? -1 : 1;
    const coverage = b.targetFactors.length - a.targetFactors.length;
    if (coverage !== 0) return coverage;
    return a.templateOrder - b.templateOrder;
  });

  const selected = candidates[0];
  const targetFactors = selected.targetFactors;
  const planKey = `${selected.template.experimentType}:${[...targetFactors].sort().join(",")}`;

  return {
    schemaVersion: 1,
    planKey,
    experimentType: selected.template.experimentType,
    targetFactors,
    hypothesis: selected.template.hypothesis,
    falsificationQuestion: selected.template.falsificationQuestion,
    procedure: selected.template.procedure,
    evidenceProduced: selected.template.evidenceProduced,
    costClass: selected.template.costClass,
    timeToSignal: selected.template.timeToSignal,
    reversibility: selected.template.reversibility,
    selectionBasis: `The validation result remains unresolved on ${gaps.join(", ")}. ${highestPriorityGap} is the highest-priority unresolved factor under the qualitative experiment-ordering policy. ${selected.template.experimentType} is the cheapest/fastest available template that directly targets that factor${selected.platformNative ? " and is native to the source platform" : ""}. No probability-of-success, additive score, or calibrated EVI formula was used.`,
    nonGoals: selected.template.nonGoals,
  };
}

export const parseStoredExperimentPlan = (value: string | null): FalsifyingExperimentPlan | null => {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<FalsifyingExperimentPlan>;
    if (
      parsed?.schemaVersion !== 1 ||
      typeof parsed.planKey !== "string" ||
      typeof parsed.experimentType !== "string" ||
      !Array.isArray(parsed.targetFactors) ||
      typeof parsed.hypothesis !== "string" ||
      typeof parsed.falsificationQuestion !== "string" ||
      !Array.isArray(parsed.procedure) ||
      !Array.isArray(parsed.evidenceProduced) ||
      typeof parsed.costClass !== "string" ||
      typeof parsed.timeToSignal !== "string" ||
      typeof parsed.reversibility !== "string" ||
      typeof parsed.selectionBasis !== "string" ||
      !Array.isArray(parsed.nonGoals)
    ) return null;
    return parsed as FalsifyingExperimentPlan;
  } catch {
    return null;
  }
};
