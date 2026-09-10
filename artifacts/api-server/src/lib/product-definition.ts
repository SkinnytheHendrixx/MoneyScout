import type {
  BetBuildEnvelope,
  FactoryReviewDefect,
  ProductDefinitionDocument,
  ProductRequirement,
  RequirementGraphDocument,
  RequirementOrigin,
  RequirementRole,
} from "@workspace/db";
import type { CommercialBuildBrief } from "./commercial-build-brief";
import type { MonetizationExecutionPlan } from "./monetization-execution-plan";
import { factoryFingerprint } from "./factory-fingerprint";

export type ProductDefinitionInput = {
  opportunityId: number;
  evaluationCycleId: number | null;
  betId: number;
  buildEnvelope: BetBuildEnvelope;
  brief: CommercialBuildBrief;
  monetizationPlan: MonetizationExecutionPlan;
  inputSnapshotFingerprint: string;
  additionalRequirements?: ProductRequirement[];
};

const unique = (values: string[]): string[] => [
  ...new Set(values.map((value) => value.trim()).filter(Boolean)),
];

function requirement(
  index: number,
  input: {
    text: string;
    role: RequirementRole;
    origin: RequirementOrigin;
    evidenceRefs?: string[];
    rationale: string;
    confidence?: ProductRequirement["confidence"];
    complexityImpact?: ProductRequirement["complexityImpact"];
    acceptanceCondition: string;
    status?: ProductRequirement["status"];
  },
): ProductRequirement {
  return {
    id: `REQ-${String(index).padStart(3, "0")}`,
    text: input.text,
    role: input.role,
    origin: input.origin,
    evidenceRefs: unique(input.evidenceRefs ?? []),
    rationale: input.rationale,
    confidence: input.confidence ?? "KNOWN",
    complexityImpact: input.complexityImpact ?? "LOW",
    acceptanceCondition: input.acceptanceCondition,
    status: input.status ?? "INCLUDED",
  };
}

export function compileProductDefinition(
  input: ProductDefinitionInput,
): ProductDefinitionDocument {
  const buyerEvidence = input.brief.commercialContract.targetBuyerEvidence;
  const problemEvidence = input.brief.commercialContract.problemEvidence;
  const targetBuyer =
    buyerEvidence[0] ??
    "Target buyer remains explicit but unresolved in evidence.";
  const validatedProblem = problemEvidence[0] ?? input.brief.opportunity.thesis;
  const promisedOutcome =
    input.monetizationPlan.firstTransaction.promisedOutcome;
  const requiredCapabilities = unique(
    input.brief.buildContract.requiredCapabilities,
  );
  const technicalEvidence = input.brief.buildContract.technicalEvidence;
  const requirements: ProductRequirement[] = [
    requirement(1, {
      text: `The target buyer can complete the promised outcome end to end: ${promisedOutcome}`,
      role: "CORE",
      origin: "COMMERCIAL_CONTRACT",
      evidenceRefs: [...buyerEvidence, ...problemEvidence],
      rationale:
        "This is locked commercial truth inherited from the validated first-transaction contract.",
      acceptanceCondition:
        "An executable representative buyer workflow produces the promised outcome without hidden manual completion.",
    }),
    ...requiredCapabilities.map((capability, offset) =>
      requirement(offset + 2, {
        text: `The product includes ${capability}.`,
        role: "CATEGORY_STANDARD",
        origin: technicalEvidence.length ? "EVIDENCE" : "BOUNDED_JUDGMENT",
        evidenceRefs: technicalEvidence,
        rationale: technicalEvidence.length
          ? "Persisted technical/category evidence supports this credibility requirement."
          : "Factory judgment includes this reversible category-standard behavior because omission would weaken the normal product workflow; it is not represented as buyer evidence.",
        confidence: technicalEvidence.length ? "KNOWN" : "BOUNDED",
        complexityImpact: "LOW",
        acceptanceCondition: `${capability} is present, testable, and integrated into the normal customer journey.`,
      }),
    ),
  ];
  let next = requirements.length + 1;
  requirements.push(
    requirement(next++, {
      text: "Customer data and configuration are isolated across account boundaries where accounts exist.",
      role: "QUALITY",
      origin: "FACTORY_STANDARD",
      rationale: "Cross-customer isolation is a baseline security property.",
      acceptanceCondition:
        "Tests prove one customer cannot read or mutate another customer's protected data.",
    }),
    requirement(next++, {
      text: "Normal loading, empty, validation, failure, and recovery states are visible and actionable.",
      role: "QUALITY",
      origin: "FACTORY_STANDARD",
      rationale:
        "A purchase-ready product cannot depend on silent failure states.",
      acceptanceCondition:
        "Representative lifecycle tests exercise success, empty, invalid, and recoverable failure states.",
    }),
    requirement(next++, {
      text: "Money Scout can observe health, workflow completion, and failures without treating usage as revenue proof.",
      role: "OPERATIONS",
      origin: "FACTORY_STANDARD",
      rationale:
        "The Asset must be autonomously operable and economically honest.",
      acceptanceCondition:
        "Health and telemetry contracts expose attributable operational events and never label usage as revenue.",
    }),
  );
  for (const extra of input.additionalRequirements ?? []) {
    requirements.push({
      ...extra,
      id: `REQ-${String(next++).padStart(3, "0")}`,
    });
  }
  return {
    schemaVersion: 1,
    lineage: {
      opportunityId: input.opportunityId,
      evaluationCycleId: input.evaluationCycleId,
      betId: input.betId,
      buildEnvelopeFingerprint: factoryFingerprint(input.buildEnvelope),
      inputSnapshotFingerprint: input.inputSnapshotFingerprint,
    },
    commercialTruth: {
      targetBuyer,
      validatedProblem,
      promisedOutcome,
      monetization: {
        testType: input.monetizationPlan.firstTransaction.testType,
        commitment:
          input.monetizationPlan.firstTransaction.commercialCommitment,
        pricingConfidenceState: input.monetizationPlan.pricing.confidenceState,
        pricingEvidence: input.monetizationPlan.pricing.evidence,
      },
    },
    actors: ["TARGET_BUYER", "MONEY_SCOUT_OPERATOR"],
    customerSurfaces: unique([
      input.brief.buildContract.route.primaryShape,
      ...input.brief.buildContract.route.supportingShapes,
    ]),
    workflows: unique([
      promisedOutcome,
      ...input.monetizationPlan.firstTransaction.fulfillmentPath,
    ]),
    requirements,
    nonGoals: unique([
      ...input.brief.buildContract.nonGoals,
      "No unsupported enterprise breadth or speculative differentiation.",
      "No public release, customer charging, outbound, advertising, custom-domain, production-credential, or provider-spend authority is granted by this Product Definition.",
    ]),
    unresolvedQuestions: [
      ...(input.brief.unresolved.targetBuyerNeedsStructuredExtraction
        ? ["Structured target-buyer normalization remains unresolved."]
        : []),
      ...(input.brief.unresolved.distributionNeedsStructuredExtraction
        ? ["Structured distribution-channel normalization remains unresolved."]
        : []),
    ],
    competitiveFirstRelease: true,
  };
}

export function reviewProductCompleteness(
  definition: ProductDefinitionDocument,
): FactoryReviewDefect[] {
  const defects: FactoryReviewDefect[] = [];
  const included = definition.requirements.filter(
    (item) => item.status === "INCLUDED",
  );
  const add = (
    key: string,
    critic: string,
    category: string,
    severity: FactoryReviewDefect["severity"],
    summary: string,
    repairTarget: string,
    affected: string[] = [],
  ) =>
    defects.push({
      key,
      critic,
      category,
      severity,
      summary,
      repairTarget,
      affectedRequirementIds: affected,
    });
  if (!included.some((item) => item.role === "CORE")) {
    add(
      "PRODUCT_CORE_MISSING",
      "VALUE_COMPLETENESS",
      "VALUE",
      "FATAL",
      "No included requirement delivers the paid promise end to end.",
      "Restore a commercial-contract CORE requirement without changing the thesis.",
    );
  }
  if (!included.some((item) => item.role === "CATEGORY_STANDARD")) {
    add(
      "CATEGORY_COMPLETENESS_MISSING",
      "CATEGORY_COMPETITIVE_COMPLETENESS",
      "CATEGORY_STANDARD",
      "FATAL",
      "No category-standard customer behavior is included, making underbuilding likely.",
      "Add justified category-standard requirements or persist evidence that none apply.",
    );
  }
  if (!included.some((item) => item.role === "OPERATIONS")) {
    add(
      "OPERATIONS_VISIBILITY_MISSING",
      "OPERATIONAL_COMPLETENESS",
      "OPERATIONS",
      "FATAL",
      "The product cannot be operated or repaired autonomously.",
      "Add health, workflow, and failure observability requirements.",
    );
  }
  if (!definition.customerSurfaces.length || !definition.workflows.length) {
    add(
      "PRODUCT_EXPERIENCE_INCOMPLETE",
      "EXPERIENCE_COMPLETENESS",
      "CUSTOMER_EXPERIENCE",
      "FATAL",
      "The target buyer has no explicit customer surface or complete workflow.",
      "Define an understandable end-to-end customer journey without selecting technical architecture.",
    );
  }
  if (
    !definition.commercialTruth.targetBuyer ||
    !definition.commercialTruth.promisedOutcome
  ) {
    add(
      "PRODUCT_COMMERCIAL_CONTRACT_INCOMPLETE",
      "COMMERCIAL_COMPLETENESS",
      "COMMERCIAL",
      "FATAL",
      "Target buyer or promised outcome is absent from locked commercial truth.",
      "Restore the upstream commercial contract; do not invent missing truth in the Factory.",
    );
  }
  for (const item of definition.requirements) {
    if (item.origin === "EVIDENCE" && item.evidenceRefs.length === 0) {
      add(
        `UNSUPPORTED_EVIDENCE_${item.id}`,
        "EVIDENCE_INTEGRITY",
        "PROVENANCE",
        "FATAL",
        `${item.id} claims EVIDENCE provenance without an evidence reference.`,
        "Attach persisted evidence or relabel the reversible choice as BOUNDED_JUDGMENT.",
        [item.id],
      );
    }
    if (item.role === "SPECULATIVE" && item.status === "INCLUDED") {
      add(
        `SPECULATIVE_SCOPE_${item.id}`,
        "COMMERCIAL_COMPLETENESS",
        "SCOPE",
        "HIGH",
        `${item.id} is speculative but included in the first release.`,
        "Defer the feature unless evidence or the commercial contract justifies it.",
        [item.id],
      );
    }
  }
  return defects;
}

export function productReviewPasses(defects: FactoryReviewDefect[]): boolean {
  return !defects.some((defect) => defect.severity === "FATAL");
}

function obligationsForRequirement(
  item: ProductRequirement,
): Array<{ kind: string; statement: string }> {
  const lower = `${item.text} ${item.acceptanceCondition}`.toLowerCase();
  const obligations = [
    { kind: "IMPLEMENTATION", statement: `Implement ${item.text}` },
    { kind: "VERIFICATION", statement: item.acceptanceCondition },
  ];
  if (/persist|history|configuration|data/.test(lower)) {
    obligations.push({
      kind: "PERSISTENCE",
      statement: `Provide durable data semantics for ${item.id}.`,
    });
  }
  if (/account|customer|isolat|auth/.test(lower)) {
    obligations.push({
      kind: "OWNERSHIP_BOUNDARY",
      statement: `Enforce customer ownership boundaries for ${item.id}.`,
    });
  }
  if (/health|telemetry|failure|recover/.test(lower)) {
    obligations.push({
      kind: "OPERABILITY",
      statement: `Expose health, failure, and recovery evidence for ${item.id}.`,
    });
  }
  return obligations;
}

export function compileRequirementGraph(
  definition: ProductDefinitionDocument,
): RequirementGraphDocument {
  const obligations = definition.requirements
    .filter((item) => item.status === "INCLUDED")
    .flatMap((item) =>
      obligationsForRequirement(item).map((obligation, index) => ({
        id: `OBL-${item.id.slice(4)}-${String(index + 1).padStart(2, "0")}`,
        requirementId: item.id,
        ...obligation,
      })),
    );
  return {
    schemaVersion: 1,
    productDefinitionFingerprint: factoryFingerprint(definition),
    obligations,
    edges: obligations.map((obligation) => ({
      from: obligation.requirementId,
      to: obligation.id,
      relation: "REQUIRES" as const,
    })),
  };
}

export function assertFrozenProductDefinitionUnchanged(input: {
  storedFingerprint: string;
  document: ProductDefinitionDocument;
}): void {
  if (factoryFingerprint(input.document) !== input.storedFingerprint) {
    throw new Error(
      "FROZEN_PRODUCT_DEFINITION_IMMUTABLE: create a new version with change lineage",
    );
  }
}
