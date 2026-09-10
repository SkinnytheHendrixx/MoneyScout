import type {
  ArchitecturePlanDocument,
  BetBuildEnvelope,
  PersistedBuildContract,
  PersistedBuildContractV2,
  ProductDefinitionDocument,
} from "@workspace/db";
import { factoryFingerprint } from "./factory-fingerprint";

export function isBuildContractV2(
  contract: PersistedBuildContract,
): contract is PersistedBuildContractV2 {
  return contract.schemaVersion === 2;
}

export function acceptanceCriteriaForContract(
  contract: PersistedBuildContract,
): string[] {
  return contract.acceptanceCriteria;
}

export function compileBuildContractV2(input: {
  opportunityId: number;
  evaluationCycleId: number | null;
  betId: number;
  buildEnvelope: BetBuildEnvelope;
  productDefinitionId: number;
  productDefinitionVersion: number;
  productDefinitionFingerprint: string;
  productDefinition: ProductDefinitionDocument;
  architecturePlanId: number;
  architecturePlanVersion: number;
  architecturePlanFingerprint: string;
  architecturePlan: ArchitecturePlanDocument;
}): PersistedBuildContractV2 {
  const included = input.productDefinition.requirements.filter(
    (item) => item.status === "INCLUDED",
  );
  const componentIdsFor = (requirementId: string): string[] =>
    input.architecturePlan.components
      .filter((component) => component.requirementIds.includes(requirementId))
      .map((component) => component.id);
  const acceptanceMatrix: PersistedBuildContractV2["acceptanceMatrix"] = [
    ...included.map((item, index) => ({
      id: `AC-${String(index + 1).padStart(3, "0")}`,
      sourceRequirementId: item.id,
      type:
        item.role === "QUALITY"
          ? "SECURITY_OR_QUALITY"
          : item.role === "OPERATIONS"
            ? "OPERATIONS"
            : item.role === "CATEGORY_STANDARD"
              ? "CATEGORY_STANDARD_BEHAVIOR"
              : "FUNCTIONAL",
      criterion: item.acceptanceCondition,
      evidenceExpectation:
        "Executable test plus inspectable implementation evidence.",
    })),
    ...input.buildEnvelope.requiredAcceptanceCriteria.map(
      (criterion, index) => ({
        id: `AC-BET-${String(index + 1).padStart(3, "0")}`,
        sourceRequirementId: null,
        type: "BET_ACCEPTANCE",
        criterion,
        evidenceExpectation:
          "Independent QA evidence tied to the exact repository commit.",
      }),
    ),
    {
      id: "AC-AUTH-001",
      sourceRequirementId: null,
      type: "AUTHORITY_SAFETY",
      criterion:
        "The implementation does not enable provider spend, public release, customer charging, outbound, advertising, production credentials, or custom domains.",
      evidenceExpectation:
        "Configuration and adversarial authority-boundary tests.",
    },
  ];
  return {
    schemaVersion: 2,
    lineage: {
      opportunityId: input.opportunityId,
      evaluationCycleId: input.evaluationCycleId,
      betId: input.betId,
      buildEnvelopeFingerprint: factoryFingerprint(input.buildEnvelope),
      productDefinitionId: input.productDefinitionId,
      productDefinitionVersion: input.productDefinitionVersion,
      productDefinitionFingerprint: input.productDefinitionFingerprint,
      architecturePlanId: input.architecturePlanId,
      architecturePlanVersion: input.architecturePlanVersion,
      architecturePlanFingerprint: input.architecturePlanFingerprint,
      capabilitySnapshotFingerprint: factoryFingerprint(
        input.architecturePlan.capabilityBindings,
      ),
    },
    productObligation: {
      targetBuyer: input.productDefinition.commercialTruth.targetBuyer,
      validatedProblem:
        input.productDefinition.commercialTruth.validatedProblem,
      promisedOutcome: input.productDefinition.commercialTruth.promisedOutcome,
      customerSurfaces: input.productDefinition.customerSurfaces,
      requiredWorkflows: input.productDefinition.workflows,
      commercialBehavior: input.productDefinition.commercialTruth.monetization,
    },
    requirements: included.map((item) => ({
      id: item.id,
      text: item.text,
      role: item.role,
      provenance: item.origin,
      acceptanceCondition: item.acceptanceCondition,
      architectureComponentIds: componentIdsFor(item.id),
    })),
    architecture: {
      topology: input.architecturePlan.topology,
      components: input.architecturePlan.components,
      technicalObligations: input.architecturePlan.technicalObligations,
      persistence: input.architecturePlan.persistence,
      backgroundWork: input.architecturePlan.backgroundWork,
      providerClasses: input.architecturePlan.providerClasses,
      securityBoundaries: input.architecturePlan.securityBoundaries,
      secretBoundaries: input.architecturePlan.secretBoundaries,
      observabilityContract: input.architecturePlan.observabilityContract,
      failureRecovery: input.architecturePlan.failureRecovery,
      rollbackPlan: input.architecturePlan.rollbackPlan,
      capacityAssumptions: input.architecturePlan.capacityAssumptions,
    },
    capabilityBindings: input.architecturePlan.capabilityBindings,
    builderDiscretion: input.architecturePlan.builderDiscretion,
    acceptanceMatrix,
    acceptanceCriteria: acceptanceMatrix.map((item) => item.criterion),
    challengeProtocol: {
      IMPLEMENTATION_READY:
        "Builder claim only; independent #70 QA must verify this exact commit.",
      ARCHITECTURE_CHALLENGE:
        "Return affected requirements/components, discovered evidence, alternative, cost/maintenance/authority impact, and whether commercial scope is unchanged. Route to Architecture Composer, not QA repair.",
      PRODUCT_CONTRACT_CHALLENGE:
        "Return contradiction/impossibility evidence. The builder cannot rewrite product or commercial scope; route to Product Definition versioning.",
      normalDefect:
        "Normal coding defects remain in the existing #70 repair and fresh-retest loop.",
    },
    investment: {
      betId: input.betId,
      buildEnvelope: input.buildEnvelope,
      grantsDownstreamAuthority: false,
    },
    authority: {
      providerSpendAuthorized: false,
      customerChargingAllowed: false,
      publicReleaseAllowed: false,
      outboundAllowed: false,
      advertisingAllowed: false,
      productionCredentialsAllowed: false,
      customDomainAllowed: false,
    },
    nextGate: "BUILDER_WORKSPACE",
  };
}
