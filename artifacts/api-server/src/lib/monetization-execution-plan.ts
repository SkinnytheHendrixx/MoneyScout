import type { BuildProductShape, CommercialBuildBrief } from "./commercial-build-brief";

export type MonetizationTestType =
  | "MARKETPLACE_PAID_COMMITMENT"
  | "PAID_API_TRIAL"
  | "PAID_OUTPUT_DELIVERY"
  | "PAID_WORKFLOW_PILOT"
  | "PAID_DATA_DELIVERY"
  | "PAID_PRODUCT_TRIAL";

export type MonetizationPlanStatus =
  | "BLOCKED"
  | "NEEDS_COMMERCIAL_NORMALIZATION"
  | "READY_FOR_INTERNAL_BUILD";

export type CommercialSideEffect =
  | "EXTERNAL_PUBLICATION"
  | "CUSTOMER_CHARGING"
  | "OUTBOUND_OUTREACH"
  | "PAID_ACQUISITION"
  | "EXTERNAL_SPEND"
  | "PRODUCTION_CREDENTIAL_USE";

export type MonetizationExecutionPlan = {
  schemaVersion: 1;
  opportunityId: number;
  status: MonetizationPlanStatus;
  blockers: string[];
  commercialNormalizationNeeded: string[];
  firstTransaction: {
    testType: MonetizationTestType;
    targetBuyerEvidence: string[];
    promisedOutcome: string;
    commercialCommitment: string;
    fulfillmentPath: string[];
  };
  pricing: {
    evidence: string[];
    testPriceUsd: number | null;
    instruction: string;
  };
  distribution: {
    evidence: string[];
    initialChannel: string;
    testInstruction: string;
  };
  ventureBudget: {
    currency: "USD";
    internalBuildExternalSpendCeilingUsd: 0;
    launchExternalSpendCeilingUsd: 0;
    totalExternalSpendCeilingUsd: 0;
    ownerConfiguredCeilingRequiredBeforeSpend: true;
    rationale: string;
  };
  decisionContract: {
    successEvidence: string[];
    failureEvidence: string[];
    iterateEvidence: string[];
    prohibitedInference: string[];
  };
  autonomy: {
    allowedWithoutApproval: string[];
    approvalRequiredFor: CommercialSideEffect[];
    nextGate: "BUILD_ORCHESTRATOR" | "COMMERCIAL_NORMALIZATION" | "STOP";
  };
};

const first = (items: string[], fallback: string): string =>
  items.find((item) => item.trim())?.trim() || fallback;

function testTypeFor(shape: BuildProductShape): MonetizationTestType {
  switch (shape) {
    case "MARKETPLACE_PRODUCT":
      return "MARKETPLACE_PAID_COMMITMENT";
    case "API":
      return "PAID_API_TRIAL";
    case "SCRAPER":
      return "PAID_OUTPUT_DELIVERY";
    case "AUTOMATION":
      return "PAID_WORKFLOW_PILOT";
    case "DATA_PRODUCT":
      return "PAID_DATA_DELIVERY";
    case "WEB_APP":
    case "BOT":
    case "EXTENSION":
      return "PAID_PRODUCT_TRIAL";
  }
}

function fulfillmentPathFor(shape: BuildProductShape, minimumSellableOutcome: string): string[] {
  const common = [
    "Build only the capabilities required by the Commercial Build Brief.",
    "Exercise one representative customer workflow end to end in a non-public environment.",
    "Capture fulfillment, failure, usage, and cost-critical telemetry before launch.",
  ];

  if (shape === "MARKETPLACE_PRODUCT") {
    return [
      ...common,
      "Prepare marketplace-compatible package and listing metadata without publishing it.",
      `Verify the package can deliver the promised outcome: ${minimumSellableOutcome}`,
    ];
  }
  if (shape === "API") {
    return [
      ...common,
      "Verify a documented request can produce the promised response with validation and error visibility.",
      `Verify the API can deliver the promised outcome: ${minimumSellableOutcome}`,
    ];
  }
  if (shape === "SCRAPER") {
    return [
      ...common,
      "Verify representative extraction accuracy, schema validation, and visible failure handling.",
      `Verify the extraction workflow can deliver the promised outcome: ${minimumSellableOutcome}`,
    ];
  }
  if (shape === "AUTOMATION") {
    return [
      ...common,
      "Verify idempotent execution and side-effect guards using non-production targets.",
      `Verify the workflow can deliver the promised outcome: ${minimumSellableOutcome}`,
    ];
  }
  if (shape === "DATA_PRODUCT") {
    return [
      ...common,
      "Verify data quality, freshness metadata, schema, and delivery mechanism.",
      `Verify the data delivery can produce the promised outcome: ${minimumSellableOutcome}`,
    ];
  }
  return [
    ...common,
    "Verify the customer-facing workflow can complete without relying on manual hidden steps.",
    `Verify the product can deliver the promised outcome: ${minimumSellableOutcome}`,
  ];
}

export function createMonetizationExecutionPlan(
  brief: CommercialBuildBrief,
): MonetizationExecutionPlan {
  const blockers = [...brief.eligibility.blockers];
  if (!brief.eligibility.buildReady) {
    blockers.push("Commercial Build Brief is not eligible for execution.");
  }

  const normalization: string[] = [];
  if (brief.unresolved.targetBuyerNeedsStructuredExtraction) {
    normalization.push("Target buyer must be normalized from validated evidence before external launch.");
  }
  if (brief.unresolved.pricingNeedsStructuredExtraction) {
    normalization.push("Pricing or paid-analog evidence must be normalized before any price is selected.");
  }
  if (brief.unresolved.distributionNeedsStructuredExtraction) {
    normalization.push("Initial distribution channel must be normalized from validated evidence before launch.");
  }

  const shape = brief.buildContract.route.primaryShape;
  const targetBuyer = first(
    brief.commercialContract.targetBuyerEvidence,
    "No normalized target-buyer evidence is available.",
  );
  const priceAnchor = first(
    brief.commercialContract.monetizationEvidence,
    "No normalized paid-analog or pricing evidence is available.",
  );
  const distributionAnchor = first(
    brief.commercialContract.distributionEvidence,
    `No normalized distribution evidence is available beyond the source context ${brief.opportunity.sourcePlatform}.`,
  );

  const status: MonetizationPlanStatus = blockers.length > 0
    ? "BLOCKED"
    : normalization.length > 0
      ? "NEEDS_COMMERCIAL_NORMALIZATION"
      : "READY_FOR_INTERNAL_BUILD";

  const nextGate = status === "BLOCKED"
    ? "STOP"
    : status === "NEEDS_COMMERCIAL_NORMALIZATION"
      ? "COMMERCIAL_NORMALIZATION"
      : "BUILD_ORCHESTRATOR";

  return {
    schemaVersion: 1,
    opportunityId: brief.opportunityId,
    status,
    blockers: [...new Set(blockers)],
    commercialNormalizationNeeded: normalization,
    firstTransaction: {
      testType: testTypeFor(shape),
      targetBuyerEvidence: brief.commercialContract.targetBuyerEvidence,
      promisedOutcome: brief.commercialContract.minimumSellableOutcome,
      commercialCommitment: `A real member of the evidenced buyer segment makes an observable paid commitment for the promised outcome. Buyer anchor: ${targetBuyer}`,
      fulfillmentPath: fulfillmentPathFor(shape, brief.commercialContract.minimumSellableOutcome),
    },
    pricing: {
      evidence: brief.commercialContract.monetizationEvidence,
      testPriceUsd: null,
      instruction: `Do not invent a price. Before launch, select the narrowest defensible test price from direct paid-competitor, paid-substitute, buyer-budget, or observed transaction evidence. Current evidence anchor: ${priceAnchor}`,
    },
    distribution: {
      evidence: brief.commercialContract.distributionEvidence,
      initialChannel: distributionAnchor,
      testInstruction: "Use the strongest evidenced accessible channel first. Do not default to paid ads, broad outbound, or generic social posting when the evidence supports a narrower path.",
    },
    ventureBudget: {
      currency: "USD",
      internalBuildExternalSpendCeilingUsd: 0,
      launchExternalSpendCeilingUsd: 0,
      totalExternalSpendCeilingUsd: 0,
      ownerConfiguredCeilingRequiredBeforeSpend: true,
      rationale: "The deterministic planner may authorize zero-external-cost preparation only. A positive venture budget must be explicitly configured after the commercial plan is inspectable; the system must never infer permission to spend from BUILD status alone.",
    },
    decisionContract: {
      successEvidence: [
        "At least one real commercial commitment is observed from the intended buyer for the promised outcome.",
        "The product successfully fulfills the committed outcome through the planned path.",
        "Observed fulfillment and variable costs remain compatible with the approved venture budget and underwriting economics.",
      ],
      failureEvidence: [
        "The evidenced distribution test is completed and produces no credible commercial commitment signal.",
        "The product cannot reliably fulfill the promised outcome within the scoped build.",
        "Observed variable or maintenance cost invalidates the approved economics.",
        "Real buyer behavior materially contradicts the target-buyer or willingness-to-pay thesis.",
      ],
      iterateEvidence: [
        "Buyers engage with the offer but fail at a specific reversible step such as onboarding, packaging, pricing presentation, or fulfillment UX.",
        "Commercial interest exists but the evidence is insufficient to distinguish product failure from a correctable execution defect.",
      ],
      prohibitedInference: [
        "Traffic, clicks, signups, usage, or compliments are not revenue proof by themselves.",
        "A working product is not evidence of willingness to pay.",
        "One buyer commitment does not by itself prove retention, scalable acquisition, or sustainable profitability.",
        "Do not widen scope merely because the first build is technically successful.",
      ],
    },
    autonomy: {
      allowedWithoutApproval: [
        "Create or modify code in an isolated build environment.",
        "Create zero-cost test infrastructure and fixtures.",
        "Run automated QA against non-production systems.",
        "Prepare unpublished listing, checkout, onboarding, documentation, and launch assets.",
        "Collect internal telemetry from test executions.",
      ],
      approvalRequiredFor: [
        "EXTERNAL_PUBLICATION",
        "CUSTOMER_CHARGING",
        "OUTBOUND_OUTREACH",
        "PAID_ACQUISITION",
        "EXTERNAL_SPEND",
        "PRODUCTION_CREDENTIAL_USE",
      ],
      nextGate,
    },
  };
}
