export type BuildProductShape =
  | "WEB_APP"
  | "API"
  | "SCRAPER"
  | "AUTOMATION"
  | "MARKETPLACE_PRODUCT"
  | "DATA_PRODUCT"
  | "BOT"
  | "EXTENSION";

export type CommercialMonetizationConfidence =
  | "DIRECTLY_OBSERVED"
  | "STRONGLY_INFERRED"
  | "BOUNDED_HYPOTHESIS"
  | "UNRESOLVED";

export type BuildRouterInput = {
  sourcePlatform: string;
  opportunityType: string;
  thesis: string;
  engineFamily: string;
};

export type BuildRoute = {
  primaryShape: BuildProductShape;
  supportingShapes: BuildProductShape[];
  rationale: string[];
  forbiddenAssumptions: string[];
};

export type CommercialBuildBriefInput = BuildRouterInput & {
  opportunityId: number;
  name: string;
  sourceUrl: string;
  verdict: string;
  policyStatus: string;
  buyerEvidence: string[];
  problemEvidence: string[];
  monetizationEvidence: string[];
  monetizationConfidenceState?: CommercialMonetizationConfidence;
  distributionEvidence: string[];
  technicalEvidence: string[];
};

export type CommercialBuildBrief = {
  schemaVersion: 1;
  opportunityId: number;
  eligibility: {
    buildReady: boolean;
    currentVerdict: string;
    policyStatus: string;
    blockers: string[];
  };
  opportunity: {
    name: string;
    sourcePlatform: string;
    sourceUrl: string;
    opportunityType: string;
    thesis: string;
    engineFamily: string;
  };
  commercialContract: {
    targetBuyerEvidence: string[];
    problemEvidence: string[];
    monetizationEvidence: string[];
    monetizationConfidenceState: CommercialMonetizationConfidence;
    distributionEvidence: string[];
    minimumSellableOutcome: string;
    transactionDefinition: string;
  };
  buildContract: {
    route: BuildRoute;
    requiredCapabilities: string[];
    technicalEvidence: string[];
    nonGoals: string[];
    acceptanceCriteria: string[];
  };
  autonomy: {
    mayCreateCode: boolean;
    mayCreateInfrastructure: boolean;
    mayPublishExternally: boolean;
    mayChargeCustomers: boolean;
    maySendOutreach: boolean;
    mayBuyTraffic: boolean;
    nextGate: "MONETIZATION_EXECUTION_PLAN";
  };
  unresolved: {
    targetBuyerNeedsStructuredExtraction: boolean;
    pricingNeedsStructuredExtraction: boolean;
    distributionNeedsStructuredExtraction: boolean;
  };
};

const normalize = (...parts: string[]): string => parts.join(" ").trim().toLowerCase();
const unique = <T>(items: T[]): T[] => [...new Set(items)];

const hasAny = (text: string, terms: string[]): boolean => terms.some((term) => text.includes(term));

export function routeCommercialBuild(input: BuildRouterInput): BuildRoute {
  const text = normalize(input.sourcePlatform, input.opportunityType, input.thesis, input.engineFamily);
  const supporting: BuildProductShape[] = [];
  const rationale: string[] = [];

  let primaryShape: BuildProductShape;

  if (hasAny(text, ["apify", "marketplace", "actor store", "store discovery"])) {
    primaryShape = "MARKETPLACE_PRODUCT";
    rationale.push("The opportunity is marketplace-native, so the first sellable surface should live where discovery and transaction can already occur.");
    if (hasAny(text, ["scrap", "crawl", "extract", "browser", "website data", "web data"])) {
      supporting.push("SCRAPER");
      rationale.push("The validated workflow appears to depend on web extraction, so scraping is a supporting capability rather than the product shell.");
    }
  } else if (hasAny(text, ["scrap", "crawl", "extract", "browser", "website data", "web data"])) {
    primaryShape = "SCRAPER";
    rationale.push("The core customer outcome is data extraction or collection, so the minimum sellable product should center the extraction engine.");
    supporting.push("API");
  } else if (hasAny(text, ["automation", "workflow", "sync", "reconcile", "monitor", "alert", "trigger", "integration"])) {
    primaryShape = "AUTOMATION";
    rationale.push("The core outcome is an operational workflow change, so the minimum sellable product should automate the workflow before adding a broad interface.");
    if (hasAny(text, ["dashboard", "portal", "workspace"])) supporting.push("WEB_APP");
  } else if (hasAny(text, ["api", "developer", "endpoint", "sdk", "webhook"])) {
    primaryShape = "API";
    rationale.push("The intended customer appears to consume the capability programmatically, so an API is the narrowest commercial surface.");
  } else if (hasAny(text, ["extension", "chrome", "browser extension"])) {
    primaryShape = "EXTENSION";
    rationale.push("The workflow occurs inside a browser context, so an extension is the most direct product surface.");
  } else if (hasAny(text, ["bot", "slack", "discord", "telegram", "chat bot", "assistant bot"])) {
    primaryShape = "BOT";
    rationale.push("The workflow is naturally conversational or channel-native, so a bot is the narrowest product surface.");
  } else if (hasAny(text, ["dataset", "data feed", "directory", "database", "intelligence feed", "reporting data"])) {
    primaryShape = "DATA_PRODUCT";
    rationale.push("The durable customer value is the data itself, so the commercial artifact should be a data product rather than a general SaaS shell.");
    supporting.push("API");
  } else {
    primaryShape = "WEB_APP";
    rationale.push("No stronger product-shape signal is present, so a narrow web application is the safest default commercial surface.");
  }

  return {
    primaryShape,
    supportingShapes: unique(supporting.filter((shape) => shape !== primaryShape)),
    rationale,
    forbiddenAssumptions: [
      "Do not add features merely because they are common in the selected product category.",
      "Do not invent a target buyer, price, acquisition channel, retention rate, CAC, or market size that is not supported by Money Scout evidence.",
      "Do not expand the build beyond what is necessary to deliver and measure the minimum sellable outcome.",
    ],
  };
}

const firstEvidence = (items: string[], fallback: string): string => items.find((item) => item.trim())?.trim() || fallback;

function capabilitiesFor(route: BuildRoute): string[] {
  const capabilities: string[] = [];
  for (const shape of [route.primaryShape, ...route.supportingShapes]) {
    if (shape === "WEB_APP") capabilities.push("customer-facing workflow", "basic account/session boundary", "instrumented completion event");
    if (shape === "API") capabilities.push("documented callable endpoint", "request validation", "usage/error telemetry");
    if (shape === "SCRAPER") capabilities.push("representative extraction path", "schema validation", "failure/retry visibility", "target-change detection");
    if (shape === "AUTOMATION") capabilities.push("trigger", "idempotent workflow execution", "failure visibility", "side-effect guardrails");
    if (shape === "MARKETPLACE_PRODUCT") capabilities.push("marketplace-compatible package", "listing-ready metadata", "usage telemetry", "bounded fulfillment path");
    if (shape === "DATA_PRODUCT") capabilities.push("defined data schema", "freshness metadata", "delivery mechanism", "quality checks");
    if (shape === "BOT") capabilities.push("channel command/input handling", "bounded action set", "usage/error telemetry");
    if (shape === "EXTENSION") capabilities.push("browser-context workflow", "least-privilege permissions", "instrumented completion event");
  }
  return unique(capabilities);
}

export function createCommercialBuildBrief(input: CommercialBuildBriefInput): CommercialBuildBrief {
  const blockers: string[] = [];
  if (input.verdict !== "BUILD") blockers.push("Opportunity verdict is not BUILD.");
  if (input.policyStatus !== "GREEN") blockers.push("Policy status is not GREEN.");

  const route = routeCommercialBuild(input);
  const buyer = firstEvidence(input.buyerEvidence, "Target buyer has not yet been normalized into a structured build field; use the validated evidence set before external launch.");
  const problem = firstEvidence(input.problemEvidence, input.thesis);
  const monetization = firstEvidence(input.monetizationEvidence, "No structured pricing or paid-analog evidence was extracted into the build brief.");
  const distribution = firstEvidence(input.distributionEvidence, `Use the validated source platform ${input.sourcePlatform} as the initial distribution context unless stronger evidence specifies another channel.`);
  const monetizationConfidenceState = input.monetizationConfidenceState
    ?? (input.monetizationEvidence.length > 0 ? "STRONGLY_INFERRED" : "UNRESOLVED");

  return {
    schemaVersion: 1,
    opportunityId: input.opportunityId,
    eligibility: {
      buildReady: blockers.length === 0,
      currentVerdict: input.verdict,
      policyStatus: input.policyStatus,
      blockers,
    },
    opportunity: {
      name: input.name,
      sourcePlatform: input.sourcePlatform,
      sourceUrl: input.sourceUrl,
      opportunityType: input.opportunityType,
      thesis: input.thesis,
      engineFamily: input.engineFamily,
    },
    commercialContract: {
      targetBuyerEvidence: input.buyerEvidence,
      problemEvidence: input.problemEvidence,
      monetizationEvidence: input.monetizationEvidence,
      monetizationConfidenceState,
      distributionEvidence: input.distributionEvidence,
      minimumSellableOutcome: `Deliver the narrowest working ${route.primaryShape.toLowerCase().replaceAll("_", " ")} that resolves this validated problem: ${problem}`,
      transactionDefinition: `A monetization test is successful only when the identified target buyer can obtain the promised outcome through the selected product shape and complete a real commercial commitment supported by the monetization evidence. Current buyer anchor: ${buyer}. Current monetization anchor: ${monetization}.`,
    },
    buildContract: {
      route,
      requiredCapabilities: capabilitiesFor(route),
      technicalEvidence: input.technicalEvidence,
      nonGoals: [
        "No broad platform build before the first commercial workflow works end to end.",
        "No speculative feature backlog.",
        "No autonomous external publication, customer charging, outreach, or paid acquisition in this phase.",
        `Do not replace the validated distribution evidence with a generic channel assumption. Current distribution anchor: ${distribution}`,
      ],
      acceptanceCriteria: [
        "One representative customer workflow completes end to end.",
        "The promised output is observable and testable.",
        "Failures are surfaced rather than silently swallowed.",
        "Usage and cost-critical events are instrumented before monetization testing.",
        "The implementation remains inside the minimum sellable outcome scope.",
      ],
    },
    autonomy: {
      mayCreateCode: true,
      mayCreateInfrastructure: true,
      mayPublishExternally: false,
      mayChargeCustomers: false,
      maySendOutreach: false,
      mayBuyTraffic: false,
      nextGate: "MONETIZATION_EXECUTION_PLAN",
    },
    unresolved: {
      targetBuyerNeedsStructuredExtraction: input.buyerEvidence.length === 0,
      pricingNeedsStructuredExtraction: input.monetizationEvidence.length === 0,
      distributionNeedsStructuredExtraction: input.distributionEvidence.length === 0,
    },
  };
}