import type {
  BuildProductShape,
  CommercialBuildBrief,
} from "./commercial-build-brief";
import type { BetBuildEnvelope } from "@workspace/db";
import type { MonetizationExecutionPlan } from "./monetization-execution-plan";

export type BuilderProfile =
  | "FULLSTACK_WEB"
  | "BACKEND_API"
  | "SCRAPER_ENGINE"
  | "WORKFLOW_AUTOMATION"
  | "MARKETPLACE_PACKAGE"
  | "DATA_PIPELINE"
  | "CHANNEL_BOT"
  | "BROWSER_EXTENSION";

export type BuildOrchestratorStatus =
  | "BLOCKED"
  | "READY_FOR_BUILDER";

export type BuildJobContract = {
  schemaVersion: 1;
  opportunityId: number;
  evaluationCycleId: number | null;
  status: BuildOrchestratorStatus;
  blockers: string[];
  product: {
    name: string;
    primaryShape: BuildProductShape;
    supportingShapes: BuildProductShape[];
    builderProfile: BuilderProfile;
    minimumSellableOutcome: string;
    requiredCapabilities: string[];
  };
  firstTransaction: {
    testType: string;
    targetBuyerEvidence: string[];
    promisedOutcome: string;
    commercialCommitment: string;
    fulfillmentPath: string[];
    pricingConfidenceState: string;
    pricingEvidence: string[];
    distributionEvidence: string[];
  };
  scope: {
    reuseBeforeBuild: true;
    openSourceReuseAuditRequired: true;
    preferExistingCompanyInfrastructure: true;
    preferFreeOrZeroMarginalCostInfrastructure: true;
    externalSpendCeilingUsd: 0;
    positiveSpendRequiresOwnerConfiguredVentureBudget: true;
    nonGoals: string[];
    forbiddenAssumptions: string[];
  };
  workspace: {
    isolatedWorkspaceRequired: true;
    sourceControlRequired: true;
    productionCredentialsAllowed: false;
    externalPublicationAllowed: false;
    customerChargingAllowed: false;
    outboundAllowed: false;
    paidAcquisitionAllowed: false;
    domainPurchaseAllowed: false;
    stagingOrLocalOnlyUntilLaterGate: true;
  };
  acceptanceCriteria: string[];
  telemetryRequirements: string[];
  debuggingContract: {
    failuresMustBeObservable: true;
    builderCompletionDoesNotEqualAcceptance: true;
    failedAcceptanceCriteriaRouteToDebugLoop: true;
    scopeExpansionRequiresNewEvidence: true;
  };
  autonomy: {
    allowedWithoutApproval: string[];
    approvalRequiredFor: string[];
  };
  investment?: {
    betId: number;
    buildEnvelope: BetBuildEnvelope;
    grantsDownstreamAuthority: false;
  };
  nextGate: "BUILDER_WORKSPACE" | "STOP";
};

export function builderProfileFor(shape: BuildProductShape): BuilderProfile {
  switch (shape) {
    case "WEB_APP":
      return "FULLSTACK_WEB";
    case "API":
      return "BACKEND_API";
    case "SCRAPER":
      return "SCRAPER_ENGINE";
    case "AUTOMATION":
      return "WORKFLOW_AUTOMATION";
    case "MARKETPLACE_PRODUCT":
      return "MARKETPLACE_PACKAGE";
    case "DATA_PRODUCT":
      return "DATA_PIPELINE";
    case "BOT":
      return "CHANNEL_BOT";
    case "EXTENSION":
      return "BROWSER_EXTENSION";
  }
}

const unique = (items: string[]): string[] => [...new Set(items.filter((item) => item.trim()))];

export function createBuildJobContract(input: {
  brief: CommercialBuildBrief;
  monetizationPlan: MonetizationExecutionPlan;
  evaluationCycleId: number | null;
  betId?: number;
  buildEnvelope?: BetBuildEnvelope;
}): BuildJobContract {
  const { brief, monetizationPlan } = input;
  const blockers = [...brief.eligibility.blockers, ...monetizationPlan.blockers];
  if (!brief.eligibility.buildReady) {
    blockers.push("Commercial Build Brief is not BUILD-ready.");
  }
  if (monetizationPlan.status !== "READY_FOR_INTERNAL_BUILD") {
    blockers.push(`Monetization plan is ${monetizationPlan.status}, not READY_FOR_INTERNAL_BUILD.`);
  }
  if (monetizationPlan.autonomy.nextGate !== "BUILD_ORCHESTRATOR") {
    blockers.push(`Monetization plan next gate is ${monetizationPlan.autonomy.nextGate}, not BUILD_ORCHESTRATOR.`);
  }
  if (monetizationPlan.ventureBudget.internalBuildExternalSpendCeilingUsd !== 0) {
    blockers.push("Internal build external-spend ceiling must remain zero until an owner-configured venture budget exists.");
  }

  const primaryShape = brief.buildContract.route.primaryShape;
  const status: BuildOrchestratorStatus = blockers.length ? "BLOCKED" : "READY_FOR_BUILDER";

  return {
    schemaVersion: 1,
    opportunityId: brief.opportunityId,
    evaluationCycleId: input.evaluationCycleId,
    status,
    blockers: unique(blockers),
    product: {
      name: brief.opportunity.name,
      primaryShape,
      supportingShapes: brief.buildContract.route.supportingShapes,
      builderProfile: builderProfileFor(primaryShape),
      minimumSellableOutcome: brief.commercialContract.minimumSellableOutcome,
      requiredCapabilities: brief.buildContract.requiredCapabilities,
    },
    firstTransaction: {
      testType: monetizationPlan.firstTransaction.testType,
      targetBuyerEvidence: monetizationPlan.firstTransaction.targetBuyerEvidence,
      promisedOutcome: monetizationPlan.firstTransaction.promisedOutcome,
      commercialCommitment: monetizationPlan.firstTransaction.commercialCommitment,
      fulfillmentPath: monetizationPlan.firstTransaction.fulfillmentPath,
      pricingConfidenceState: monetizationPlan.pricing.confidenceState,
      pricingEvidence: monetizationPlan.pricing.evidence,
      distributionEvidence: monetizationPlan.distribution.evidence,
    },
    scope: {
      reuseBeforeBuild: true,
      openSourceReuseAuditRequired: true,
      preferExistingCompanyInfrastructure: true,
      preferFreeOrZeroMarginalCostInfrastructure: true,
      externalSpendCeilingUsd: 0,
      positiveSpendRequiresOwnerConfiguredVentureBudget: true,
      nonGoals: brief.buildContract.nonGoals,
      forbiddenAssumptions: brief.buildContract.route.forbiddenAssumptions,
    },
    workspace: {
      isolatedWorkspaceRequired: true,
      sourceControlRequired: true,
      productionCredentialsAllowed: false,
      externalPublicationAllowed: false,
      customerChargingAllowed: false,
      outboundAllowed: false,
      paidAcquisitionAllowed: false,
      domainPurchaseAllowed: false,
      stagingOrLocalOnlyUntilLaterGate: true,
    },
    acceptanceCriteria: unique([
      ...brief.buildContract.acceptanceCriteria,
      ...monetizationPlan.firstTransaction.fulfillmentPath,
      ...(input.buildEnvelope?.requiredAcceptanceCriteria ?? []),
    ]),
    telemetryRequirements: [
      "Record representative workflow completion and failure events.",
      "Record external API, compute, storage, and other cost-critical usage before monetization testing.",
      "Record enough build metadata to compare predicted versus actual build effort later.",
      "Do not treat traffic, usage, or technical completion as revenue proof.",
    ],
    debuggingContract: {
      failuresMustBeObservable: true,
      builderCompletionDoesNotEqualAcceptance: true,
      failedAcceptanceCriteriaRouteToDebugLoop: true,
      scopeExpansionRequiresNewEvidence: true,
    },
    autonomy: {
      allowedWithoutApproval: monetizationPlan.autonomy.allowedWithoutApproval,
      approvalRequiredFor: monetizationPlan.autonomy.approvalRequiredFor,
    },
    ...(input.betId && input.buildEnvelope ? { investment: { betId: input.betId, buildEnvelope: input.buildEnvelope, grantsDownstreamAuthority: false as const } } : {}),
    nextGate: status === "READY_FOR_BUILDER" ? "BUILDER_WORKSPACE" : "STOP",
  };
}
