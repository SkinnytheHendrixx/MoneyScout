import type {
  ArchitecturePlanDocument,
  BetBuildEnvelope,
  CapabilityBinding,
  FactoryReviewDefect,
  ProductDefinitionDocument,
  RequirementGraphDocument,
} from "@workspace/db";
import { factoryFingerprint } from "./factory-fingerprint";

const complexityRank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 } as const;

function requiredFamilies(
  definition: ProductDefinitionDocument,
  graph: RequirementGraphDocument,
): string[] {
  const text =
    `${definition.requirements.map((item) => item.text).join(" ")} ${graph.obligations.map((item) => item.kind).join(" ")}`.toLowerCase();
  const result = ["HEALTH_TELEMETRY"];
  if (/account|customer|ownership|auth/.test(text))
    result.push("AUTHENTICATED_ACCOUNTS");
  if (/persist|history|configuration|data/.test(text))
    result.push("RELATIONAL_PERSISTENCE");
  if (/schedule|recurring|background|alert/.test(text))
    result.push("RECURRING_EXECUTION");
  if (/webhook/.test(text)) result.push("WEBHOOK_HANDLING");
  if (/payment|subscription|commercial commitment/.test(text))
    result.push("PAYMENTS_INTERFACE");
  return [...new Set(result)];
}

export function capabilityFamiliesForArchitecture(input: {
  definition: ProductDefinitionDocument;
  graph: RequirementGraphDocument;
}): string[] {
  return requiredFamilies(input.definition, input.graph);
}

export function composeArchitecturePlan(input: {
  betId: number;
  productDefinitionId: number;
  productDefinitionVersion: number;
  productDefinitionFingerprint: string;
  definition: ProductDefinitionDocument;
  graph: RequirementGraphDocument;
  buildEnvelope: BetBuildEnvelope;
  capabilityBindings: CapabilityBinding[];
  knownCapabilityCostCents: number;
}):
  | { kind: "PLAN"; document: ArchitecturePlanDocument }
  | { kind: "INSUFFICIENT_ENVELOPE"; reasons: string[] } {
  const reasons: string[] = [];
  const included = input.definition.requirements.filter(
    (item) => item.status === "INCLUDED",
  );
  const requiredComplexity = included.some(
    (item) => item.complexityImpact === "HIGH",
  )
    ? "HIGH"
    : included.some((item) => item.complexityImpact === "MEDIUM")
      ? "MEDIUM"
      : "LOW";
  if (
    complexityRank[requiredComplexity] >
    complexityRank[input.buildEnvelope.acceptableBuildComplexity]
  ) {
    reasons.push(
      `The complete Product Definition requires ${requiredComplexity} build complexity, above the ${input.buildEnvelope.acceptableBuildComplexity} envelope.`,
    );
  }
  if (
    input.knownCapabilityCostCents >
      input.buildEnvelope.allowedExternalServiceBudgetCents ||
    input.knownCapabilityCostCents >
      input.buildEnvelope.maximumExternalBuildSpendCents
  ) {
    reasons.push(
      "The transitive selected-capability cost exceeds the approved Build Envelope.",
    );
  }
  if (reasons.length) return { kind: "INSUFFICIENT_ENVELOPE", reasons };

  const components = [
    {
      id: "COMP-001",
      name: "Customer and application runtime",
      kind: "CONSOLIDATED_APPLICATION",
      obligations: input.graph.obligations.map((item) => item.id),
      requirementIds: included.map((item) => item.id),
    },
    {
      id: "COMP-002",
      name: "Operations and health surface",
      kind: "OPERATIONS_SURFACE",
      obligations: input.graph.obligations
        .filter((item) => item.kind === "OPERABILITY")
        .map((item) => item.id),
      requirementIds: included
        .filter((item) => item.role === "OPERATIONS")
        .map((item) => item.id),
    },
  ];
  const document: ArchitecturePlanDocument = {
    schemaVersion: 1,
    lineage: {
      betId: input.betId,
      productDefinitionId: input.productDefinitionId,
      productDefinitionVersion: input.productDefinitionVersion,
      productDefinitionFingerprint: input.productDefinitionFingerprint,
      buildEnvelope: input.buildEnvelope,
      buildEnvelopeFingerprint: factoryFingerprint(input.buildEnvelope),
    },
    topology:
      "Prefer one independently operated application/runtime with an integrated operations surface; add separable background execution only when an included requirement demands it.",
    customerSurfaces: input.definition.customerSurfaces,
    components,
    technicalObligations: input.graph.obligations,
    dataFlows: [
      "Customer input -> validated application workflow -> persisted result -> customer response.",
      "Runtime event -> health/telemetry contract -> Money Scout observation adapter.",
    ],
    persistence: input.graph.obligations.some(
      (item) => item.kind === "PERSISTENCE",
    )
      ? ["Durable relational persistence with explicit ownership semantics."]
      : ["No durable customer persistence beyond requirement-driven state."],
    backgroundWork: input.graph.obligations.some((item) =>
      /recurring|schedule|background/i.test(item.statement),
    )
      ? ["Bounded idempotent scheduled execution with visible failures."]
      : [],
    providerClasses: input.capabilityBindings
      .filter((item) => item.outcome === "PINNED")
      .map((item) => item.familyKey),
    capabilityBindings: input.capabilityBindings,
    customBuildRequirements: input.capabilityBindings
      .filter((item) => item.outcome === "CUSTOM_BUILD_REQUIRED")
      .map((item) => item.familyKey),
    securityBoundaries: [
      "Customer ownership/isolation is enforced wherever customer state exists.",
      "Builder execution cannot access production or Money Scout credentials.",
    ],
    secretBoundaries: [
      "Build-time coding credentials are gateway-owned.",
      "Production, merchant, deployment, customer, advertising, and GitHub credentials are withheld from the coding agent.",
    ],
    observabilityContract: [
      "Expose liveness/readiness and attributable workflow failure telemetry.",
      "Never represent traffic, signups, usage, or checkout views as revenue.",
    ],
    failureRecovery: [
      "Failures are explicit, idempotent, and safe to reconcile before retry.",
      "Normal implementation defects route through independent QA repair/retest.",
    ],
    rollbackPlan: [
      "Every build produces an exact source-control commit.",
      "Controlled Release remains responsible for preview, production, and rollback.",
    ],
    capacityAssumptions: [
      {
        statement:
          "Initial capacity is deliberately bounded because validated traffic/load volume is unknown.",
        provenance: "ARCHITECTURE_ASSUMPTION",
        reviewTrigger:
          "Review architecture when measured load, latency, storage, or reliability exceeds the implemented health contract.",
      },
    ],
    expectedExternalBuildCostCents: input.knownCapabilityCostCents,
    expectedOperatingCost: input.buildEnvelope.acceptableOperatingCost,
    buildComplexity: requiredComplexity,
    maintenanceBurden: input.buildEnvelope.acceptableMaintenanceBurden,
    reversibility: input.buildEnvelope.requiredReversibility,
    builderDiscretion: [
      "Internal module and function structure.",
      "Ordinary local abstractions and query construction.",
      "Minor library selection that does not change topology, cost, security, authority, or product semantics.",
      "Test implementation details that preserve acceptance semantics.",
    ],
    lockedDecisions: [
      "Product requirements and acceptance semantics.",
      "Major service topology and customer/data security boundaries.",
      "Pinned capability implementation versions and critical provider classes.",
      "Authority and Build Envelope constraints.",
      ...input.buildEnvelope.hardConstraints.map(
        (constraint) => `Bet hard constraint: ${constraint}`,
      ),
    ],
    acceptanceConditions: [
      ...included.map((item) => item.acceptanceCondition),
      ...input.buildEnvelope.requiredAcceptanceCriteria,
    ],
    unresolvedTechnicalRisks: [],
  };
  return { kind: "PLAN", document };
}

export function reviewArchitecture(input: {
  plan: ArchitecturePlanDocument;
  definition: ProductDefinitionDocument;
  graph: RequirementGraphDocument;
  buildEnvelope: BetBuildEnvelope;
}): FactoryReviewDefect[] {
  const defects: FactoryReviewDefect[] = [];
  const coveredRequirements = new Set(
    input.plan.components.flatMap((item) => item.requirementIds),
  );
  for (const requirement of input.definition.requirements.filter(
    (item) => item.status === "INCLUDED",
  )) {
    if (!coveredRequirements.has(requirement.id)) {
      defects.push({
        key: `ARCH_REQUIREMENT_UNMAPPED_${requirement.id}`,
        critic: "REQUIREMENT_COVERAGE",
        category: "UNDERENGINEERING",
        severity: "FATAL",
        summary: `${requirement.id} has no architecture component coverage.`,
        repairTarget: "Map the requirement without removing or weakening it.",
        affectedRequirementIds: [requirement.id],
      });
    }
  }
  const coveredObligations = new Set(
    input.plan.components.flatMap((item) => item.obligations),
  );
  const missingObligations = input.graph.obligations.filter(
    (item) => !coveredObligations.has(item.id),
  );
  if (missingObligations.length) {
    defects.push({
      key: "ARCH_TECHNICAL_OBLIGATIONS_UNMAPPED",
      critic: "UNDERENGINEERING",
      category: "REQUIREMENT_GRAPH",
      severity: "FATAL",
      summary: "One or more technical obligations have no component coverage.",
      repairTarget: "Cover every obligation in the selected topology.",
      affectedRequirementIds: [
        ...new Set(missingObligations.map((item) => item.requirementId)),
      ],
    });
  }
  if (
    (input.plan.expectedExternalBuildCostCents ?? Number.POSITIVE_INFINITY) >
    input.buildEnvelope.maximumExternalBuildSpendCents
  ) {
    defects.push({
      key: "ARCH_BUILD_ENVELOPE_EXCEEDED",
      critic: "COST",
      category: "INVESTMENT",
      severity: "FATAL",
      summary: "Architecture cost exceeds the approved Build Envelope.",
      repairTarget:
        "Optimize architecture without removing requirements, or return INSUFFICIENT_ENVELOPE.",
      affectedRequirementIds: [],
    });
  }
  if (!input.plan.observabilityContract.length) {
    defects.push({
      key: "ARCH_OPERABILITY_MISSING",
      critic: "OPERATIONS",
      category: "OPERATIONS",
      severity: "FATAL",
      summary: "The architecture has no health/observability contract.",
      repairTarget: "Add requirement-driven health and failure visibility.",
      affectedRequirementIds: [],
    });
  }
  if (!input.plan.securityBoundaries.length) {
    defects.push({
      key: "ARCH_SECURITY_BOUNDARY_MISSING",
      critic: "SECURITY",
      category: "SECURITY",
      severity: "FATAL",
      summary: "The architecture has no explicit data/security boundary.",
      repairTarget: "Define customer, provider, and secret boundaries.",
      affectedRequirementIds: [],
    });
  }
  if (
    !input.plan.builderDiscretion.length ||
    !input.plan.lockedDecisions.length
  ) {
    defects.push({
      key: "ARCH_BUILDER_FEASIBILITY_BOUNDARY_MISSING",
      critic: "BUILDER_FEASIBILITY",
      category: "EXECUTABILITY",
      severity: "FATAL",
      summary:
        "Locked architecture and ordinary builder discretion are not separated.",
      repairTarget:
        "State major locked decisions and a bounded low-level implementation zone.",
      affectedRequirementIds: [],
    });
  }
  if (!input.plan.rollbackPlan.length) {
    defects.push({
      key: "ARCH_REVERSIBILITY_MISSING",
      critic: "OPERATIONS",
      category: "REVERSIBILITY",
      severity: "FATAL",
      summary: "Architecture has no rollback/reversibility plan.",
      repairTarget:
        "Add exact-commit rollback semantics consistent with the Bet.",
      affectedRequirementIds: [],
    });
  }
  if (
    input.plan.components.length > Math.max(4, input.graph.obligations.length)
  ) {
    defects.push({
      key: "ARCH_COMPONENT_PROLIFERATION",
      critic: "OVERENGINEERING",
      category: "COMPLEXITY",
      severity: "HIGH",
      summary:
        "The proposed topology has more independently described components than its obligations justify.",
      repairTarget:
        "Consolidate components while preserving every Product requirement and technical obligation.",
      affectedRequirementIds: [],
    });
  }
  return defects;
}

export function architectureReviewPasses(
  defects: FactoryReviewDefect[],
): boolean {
  return !defects.some((item) => item.severity === "FATAL");
}
