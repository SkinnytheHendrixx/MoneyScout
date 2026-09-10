import assert from "node:assert/strict";
import type { BetBuildEnvelope, ProductRequirement } from "@workspace/db";
import {
  composeArchitecturePlan,
  reviewArchitecture,
} from "../src/lib/architecture-composer";
import {
  assetRepositoryIdentity,
  compileAssetRepositoryManifests,
  validateBuilderRepositoryOutput,
} from "../src/lib/asset-repo-contract";
import {
  compileBuildContractV2,
  isBuildContractV2,
} from "../src/lib/build-contract-v2";
import { createCommercialBuildBrief } from "../src/lib/commercial-build-brief";
import { factoryFingerprint } from "../src/lib/factory-fingerprint";
import { createMonetizationExecutionPlan } from "../src/lib/monetization-execution-plan";
import {
  assertFrozenProductDefinitionUnchanged,
  compileProductDefinition,
  compileRequirementGraph,
  productReviewPasses,
  reviewProductCompleteness,
} from "../src/lib/product-definition";
import {
  assertCapabilityVersionImmutable,
  catalogImplementationSelectableForNewBuild,
  nextCapabilityLifecycleAfterBuild,
  selectSoftwareCapabilities,
  type CatalogImplementation,
} from "../src/lib/software-capability-catalog";
import { sanitizedBuilderEnvironment } from "../src/lib/builder-provider-driver";
import { realProviderExecutionGate } from "../src/lib/builder-gateway";
import {
  builderOutcomeDestination,
  configuredBuilderAdapter,
} from "../src/lib/builder-agent-adapter";
import { configuredQaAdapter } from "../src/lib/qa-agent-adapter";

const buildEnvelope: BetBuildEnvelope = {
  schemaVersion: 1,
  maximumExternalBuildSpendCents: 0,
  allowedExternalServiceBudgetCents: 0,
  acceptableBuildComplexity: "MEDIUM",
  acceptableMaintenanceBurden: "MEDIUM",
  acceptableOperatingCost: {
    status: "BOUNDED",
    lower: 0,
    upper: 2_000,
    unit: "cents/month",
    evidenceRefs: ["BET-1"],
  },
  requiredReversibility: "HIGH",
  permittedProductScope: ["AUTOMATION"],
  requiredAcceptanceCriteria: [
    "The complete workflow is reproducible from a clean checkout.",
  ],
  onlyExistingZeroCashCapabilities: true,
  hardConstraints: ["No production credential use during Build."],
};

const brief = createCommercialBuildBrief({
  opportunityId: 77,
  name: "Brand name is not repository identity",
  sourcePlatform: "evidence-marketplace",
  sourceUrl: "https://example.test/opportunity",
  opportunityType: "monitor alert automation dashboard",
  thesis:
    "Operators lose time when recurring changes are not detected promptly.",
  engineFamily: "TEST",
  verdict: "BUILD",
  policyStatus: "GREEN",
  buyerEvidence: ["EVIDENCE: operations teams buy monitoring workflows."],
  problemEvidence: ["EVIDENCE: manual change review is recurring."],
  monetizationEvidence: ["EVIDENCE: paid monitoring substitutes exist."],
  monetizationConfidenceState: "STRONGLY_INFERRED",
  distributionEvidence: ["EVIDENCE: an accessible marketplace exists."],
  technicalEvidence: [
    "EVIDENCE: representative collection and alerts are feasible.",
  ],
});
const monetizationPlan = createMonetizationExecutionPlan(brief);
const definition = compileProductDefinition({
  opportunityId: 77,
  evaluationCycleId: 7,
  betId: 1,
  buildEnvelope,
  brief,
  monetizationPlan,
  inputSnapshotFingerprint: "input-fingerprint",
});

// Product Definition: commercial truth, provenance, completeness, freeze.
assert.equal(
  definition.commercialTruth.promisedOutcome,
  monetizationPlan.firstTransaction.promisedOutcome,
  "locked commercial truth must be preserved",
);
assert.equal(definition.requirements[0]?.origin, "COMMERCIAL_CONTRACT");
assert.ok(
  definition.requirements.some((item) => item.role === "CATEGORY_STANDARD"),
  "competitive first release retains justified category-standard behavior",
);
const boundedBrief = {
  ...brief,
  buildContract: { ...brief.buildContract, technicalEvidence: [] },
};
const boundedDefinition = compileProductDefinition({
  opportunityId: 77,
  evaluationCycleId: 7,
  betId: 1,
  buildEnvelope,
  brief: boundedBrief,
  monetizationPlan: createMonetizationExecutionPlan(boundedBrief),
  inputSnapshotFingerprint: "bounded",
});
assert.ok(
  boundedDefinition.requirements.some(
    (item) => item.origin === "BOUNDED_JUDGMENT",
  ),
  "reversible product judgment must be labeled as judgment",
);
const unsupported = structuredClone(definition);
unsupported.requirements[1] = {
  ...unsupported.requirements[1]!,
  origin: "EVIDENCE",
  evidenceRefs: [],
};
assert.ok(
  reviewProductCompleteness(unsupported).some(
    (item) =>
      item.key.startsWith("UNSUPPORTED_EVIDENCE_") && item.severity === "FATAL",
  ),
  "unsupported market claims cannot masquerade as evidence",
);
const noCategory = structuredClone(definition);
noCategory.requirements = noCategory.requirements.map((item) =>
  item.role === "CATEGORY_STANDARD"
    ? { ...item, status: "DEFERRED" as const }
    : item,
);
assert.ok(
  reviewProductCompleteness(noCategory).some(
    (item) => item.key === "CATEGORY_COMPLETENESS_MISSING",
  ),
  "category omission must be surfaced as a completeness defect",
);
const speculative: ProductRequirement = {
  id: "REQ-X",
  text: "Possible future theme marketplace",
  role: "SPECULATIVE",
  origin: "BOUNDED_JUDGMENT",
  evidenceRefs: [],
  rationale: "Plausible only",
  confidence: "UNKNOWN",
  complexityImpact: "LOW",
  acceptanceCondition: "Not in release",
  status: "DEFERRED",
};
const deferredSpeculative = {
  ...definition,
  requirements: [...definition.requirements, speculative],
};
assert.equal(
  productReviewPasses(reviewProductCompleteness(deferredSpeculative)),
  true,
  "deferred speculation must not poison completeness",
);
const noCore = {
  ...definition,
  requirements: definition.requirements.filter((item) => item.role !== "CORE"),
};
assert.equal(
  productReviewPasses(reviewProductCompleteness(noCore)),
  false,
  "fatal product defect must block architecture",
);
assert.doesNotThrow(() =>
  assertFrozenProductDefinitionUnchanged({
    storedFingerprint: factoryFingerprint(definition),
    document: definition,
  }),
);
const mutated = structuredClone(definition);
mutated.requirements[0]!.text = "Silently weakened scope";
assert.throws(
  () =>
    assertFrozenProductDefinitionUnchanged({
      storedFingerprint: factoryFingerprint(definition),
      document: mutated,
    }),
  /IMMUTABLE/,
  "frozen Product Definition cannot silently mutate",
);

// Requirement Graph and Architecture.
const graph = compileRequirementGraph(definition);
const bindings = selectSoftwareCapabilities({
  requiredFamilies: ["HEALTH_TELEMETRY"],
  runtimeType: "AUTOMATION",
  implementations: [],
  buildEnvelope,
  availableOperationalCapabilityKeys: new Set(),
}).bindings;
const composed = composeArchitecturePlan({
  betId: 1,
  productDefinitionId: 10,
  productDefinitionVersion: 1,
  productDefinitionFingerprint: factoryFingerprint(definition),
  definition,
  graph,
  buildEnvelope,
  capabilityBindings: bindings,
  knownCapabilityCostCents: 0,
});
assert.equal(composed.kind, "PLAN");
if (composed.kind !== "PLAN")
  throw new Error("Expected feasible architecture fixture");
const architecture = composed.document;
const mappedRequirements = new Set(
  architecture.components.flatMap((item) => item.requirementIds),
);
for (const requirement of definition.requirements.filter(
  (item) => item.status === "INCLUDED",
))
  assert.ok(
    mappedRequirements.has(requirement.id),
    `${requirement.id} must map to a component`,
  );
assert.equal(
  reviewArchitecture({
    plan: architecture,
    definition,
    graph,
    buildEnvelope,
  }).some((item) => item.severity === "FATAL"),
  false,
);
const missingFeatureArchitecture = structuredClone(architecture);
missingFeatureArchitecture.components.forEach((component) => {
  component.requirementIds = component.requirementIds.filter(
    (id) => id !== definition.requirements[0]!.id,
  );
});
assert.ok(
  reviewArchitecture({
    plan: missingFeatureArchitecture,
    definition,
    graph,
    buildEnvelope,
  }).some(
    (item) =>
      item.critic === "REQUIREMENT_COVERAGE" && item.severity === "FATAL",
  ),
);
const expensive = composeArchitecturePlan({
  betId: 1,
  productDefinitionId: 10,
  productDefinitionVersion: 1,
  productDefinitionFingerprint: factoryFingerprint(definition),
  definition,
  graph,
  buildEnvelope,
  capabilityBindings: bindings,
  knownCapabilityCostCents: 1,
});
assert.equal(
  expensive.kind,
  "INSUFFICIENT_ENVELOPE",
  "infeasible architecture returns explicit undercapitalized outcome",
);
assert.deepEqual(
  definition.requirements,
  structuredClone(definition.requirements),
  "architecture optimization cannot remove Product requirements",
);
assert.ok(
  architecture.builderDiscretion.length && architecture.lockedDecisions.length,
  "builder discretion remains distinct from locked architecture",
);
assert.equal(architecture.lineage.productDefinitionVersion, 1);

// Capability Catalog: family/implementation separation, lifecycle, dependencies, version pins.
const implementation = (
  overrides: Partial<CatalogImplementation> = {},
): CatalogImplementation => ({
  familyKey: "HEALTH_TELEMETRY",
  implementationKey: "builtin-health",
  version: 3,
  lifecycleStatus: "PROVEN",
  fingerprint: "cap-v3",
  supportedRuntimeTypes: ["AUTOMATION"],
  dependencies: [],
  conformanceTests: ["health endpoint returns explicit state"],
  maximumExternalCashCents: 0,
  maintenanceBurden: "LOW",
  operationalBurden: "LOW",
  requiresOperationalCapabilities: [],
  ...overrides,
});
assert.notEqual(
  implementation().familyKey,
  implementation().implementationKey,
  "capability family and implementation are separate identities",
);
assert.equal(
  catalogImplementationSelectableForNewBuild(
    implementation({ lifecycleStatus: "QUARANTINED" }),
  ),
  false,
);
assert.equal(
  catalogImplementationSelectableForNewBuild(
    implementation({ lifecycleStatus: "DEPRECATED" }),
  ),
  false,
);
assert.equal(
  catalogImplementationSelectableForNewBuild(
    implementation({ lifecycleStatus: "RETIRED" }),
  ),
  false,
);
const reused = selectSoftwareCapabilities({
  requiredFamilies: ["HEALTH_TELEMETRY"],
  runtimeType: "AUTOMATION",
  implementations: [implementation()],
  buildEnvelope,
  availableOperationalCapabilityKeys: new Set(),
});
assert.equal(reused.bindings[0]?.outcome, "PINNED");
assert.equal(
  reused.bindings[0]?.version,
  3,
  "Architecture must pin an exact capability version",
);
const dependency = implementation({
  familyKey: "RELATIONAL_PERSISTENCE",
  implementationKey: "paid-db",
  version: 1,
  fingerprint: "paid-db-v1",
  maximumExternalCashCents: 50,
});
const parent = implementation({
  dependencies: [
    {
      familyKey: dependency.familyKey,
      implementationKey: dependency.implementationKey,
      version: dependency.version,
    },
  ],
});
const rejectedGraph = selectSoftwareCapabilities({
  requiredFamilies: ["HEALTH_TELEMETRY"],
  runtimeType: "AUTOMATION",
  implementations: [parent, dependency],
  buildEnvelope,
  availableOperationalCapabilityKeys: new Set(),
});
assert.equal(
  rejectedGraph.bindings[0]?.outcome,
  "CUSTOM_BUILD_REQUIRED",
  "transitive cost violating the envelope rejects reuse",
);
assert.equal(
  selectSoftwareCapabilities({
    requiredFamilies: ["UNKNOWN_FAMILY"],
    runtimeType: "AUTOMATION",
    implementations: [],
    buildEnvelope,
    availableOperationalCapabilityKeys: new Set(),
  }).bindings[0]?.outcome,
  "CUSTOM_BUILD_REQUIRED",
);
assert.equal(
  nextCapabilityLifecycleAfterBuild("QUALIFIED"),
  "QUALIFIED",
  "one successful Build cannot auto-promote reusable capability trust",
);
assert.throws(
  () =>
    assertCapabilityVersionImmutable({
      existingFingerprint: "v1",
      proposedFingerprint: "mutated",
      implementationKey: "builtin-health",
      version: 3,
    }),
  /IMMUTABLE/,
);

// Durable Asset repository and self-describing contract.
assert.deepEqual(
  assetRepositoryIdentity(1),
  assetRepositoryIdentity(1),
  "Asset repo identity is durable and deterministic",
);
assert.notEqual(
  assetRepositoryIdentity(1).assetKey,
  assetRepositoryIdentity(2).assetKey,
  "repo identity belongs to Asset/Bet, not Build attempt",
);
const contract = compileBuildContractV2({
  opportunityId: 77,
  evaluationCycleId: 7,
  betId: 1,
  buildEnvelope,
  productDefinitionId: 10,
  productDefinitionVersion: 1,
  productDefinitionFingerprint: factoryFingerprint(definition),
  productDefinition: definition,
  architecturePlanId: 20,
  architecturePlanVersion: 1,
  architecturePlanFingerprint: factoryFingerprint(architecture),
  architecturePlan: architecture,
});
const manifests = compileAssetRepositoryManifests({
  productDefinition: definition,
  architecturePlan: architecture,
  buildContract: contract,
});
for (const name of [
  "AGENTS.md",
  "PRODUCT.md",
  "ARCHITECTURE.md",
  "BUILD_CONTRACT.md",
  "OPERATIONS.md",
  ".money-scout/product-definition.json",
  ".money-scout/architecture-plan.json",
  ".money-scout/build-contract.json",
])
  assert.ok(manifests[name], `${name} must make repository self-describing`);
assert.ok(
  !assetRepositoryIdentity(1).internalSlug.toLowerCase().includes("brand"),
  "public product name is not required for internal identity",
);
assert.deepEqual(
  validateBuilderRepositoryOutput({
    originalManifestFiles: manifests,
    resultingManifestFiles: manifests,
    changedPaths: ["src/index.ts"],
    branchName: "build-1",
    expectedBranchName: "build-1",
    secretMatches: [],
    allowNoop: false,
  }),
  [],
);
assert.ok(
  validateBuilderRepositoryOutput({
    originalManifestFiles: manifests,
    resultingManifestFiles: { ...manifests, "PRODUCT.md": "rewritten" },
    changedPaths: ["PRODUCT.md"],
    branchName: "build-1",
    expectedBranchName: "build-1",
    secretMatches: [],
    allowNoop: false,
  }).some((item) => item.includes("REWROTE_FROZEN_CONTRACT")),
);

// Build Contract v2 and legacy compatibility/authority.
assert.equal(isBuildContractV2(contract), true);
assert.equal(contract.lineage.betId, 1);
assert.equal(contract.lineage.productDefinitionId, 10);
assert.equal(contract.lineage.architecturePlanId, 20);
assert.ok(
  contract.acceptanceMatrix.some(
    (item) =>
      item.id.startsWith("AC-") && item.sourceRequirementId?.startsWith("REQ-"),
  ),
);
assert.ok(
  contract.acceptanceCriteria.includes(
    buildEnvelope.requiredAcceptanceCriteria[0]!,
  ),
);
assert.deepEqual(contract.builderDiscretion, architecture.builderDiscretion);
assert.deepEqual(contract.authority, {
  providerSpendAuthorized: false,
  customerChargingAllowed: false,
  publicReleaseAllowed: false,
  outboundAllowed: false,
  advertisingAllowed: false,
  productionCredentialsAllowed: false,
  customDomainAllowed: false,
});
assert.equal(contract.investment.grantsDownstreamAuthority, false);
const legacy = {
  schemaVersion: 1 as const,
  opportunityId: 1,
  evaluationCycleId: null,
  product: {},
  firstTransaction: {},
  scope: {},
  workspace: {},
  acceptanceCriteria: ["legacy"],
  autonomy: {},
  nextGate: "BUILDER_WORKSPACE",
};
assert.equal(
  isBuildContractV2(legacy),
  false,
  "historical v1 remains readable without fabricated Factory lineage",
);

// Coding-agent environment is credential-minimal and provider-specific details stay at driver edge.
const sanitized = sanitizedBuilderEnvironment({
  PATH: "/bin",
  LANG: "C",
  DATABASE_URL: "secret-db",
  GITHUB_TOKEN: "secret-git",
  OPENAI_API_KEY: "secret-provider",
  STRIPE_SECRET_KEY: "secret-prod",
  CUSTOMER_TOKEN: "secret-customer",
});
assert.deepEqual(sanitized, { PATH: "/bin", LANG: "C" });
assert.deepEqual(
  realProviderExecutionGate({
    nodeEnvironment: "production",
    billing: {
      mode: "METERED",
      enforceableMaximumIncrementalCostCents: null,
      enforcementMechanism: null,
      payAsYouGoFallbackPossible: true,
    },
    atomicReservationAvailable: false,
  }),
  { allowed: false, blocker: "PROVIDER_RUN_MAXIMUM_COST_NOT_ENFORCEABLE" },
  "unknown maximum cost must stop before the provider call",
);
assert.deepEqual(
  realProviderExecutionGate({
    nodeEnvironment: "production",
    billing: {
      mode: "METERED",
      enforceableMaximumIncrementalCostCents: 100,
      enforcementMechanism: "provider ceiling",
      payAsYouGoFallbackPossible: false,
    },
    atomicReservationAvailable: false,
  }),
  { allowed: false, blocker: "SHARED_MONEY_SAFETY_RESERVATION_REQUIRED" },
  "a provider ceiling without atomic shared reservation is insufficient",
);
assert.equal(
  realProviderExecutionGate({
    nodeEnvironment: "production",
    billing: {
      mode: "ENTITLEMENT",
      enforceableMaximumIncrementalCostCents: 0,
      enforcementMechanism: "entitlement-only credential",
      payAsYouGoFallbackPossible: true,
    },
    atomicReservationAvailable: false,
  }).allowed,
  false,
  "entitlement fallback to pay-as-you-go is forbidden",
);
assert.equal(
  realProviderExecutionGate({
    nodeEnvironment: "production",
    billing: {
      mode: "ZERO_COST_FIXTURE",
      enforceableMaximumIncrementalCostCents: 0,
      enforcementMechanism: "fixture",
      payAsYouGoFallbackPossible: false,
    },
    atomicReservationAvailable: false,
  }).allowed,
  false,
  "CI fixture cannot escape into production",
);
assert.equal(
  builderOutcomeDestination("ARCHITECTURE_CHALLENGE"),
  "ARCHITECTURE_COMPOSER",
);
assert.equal(
  builderOutcomeDestination("PRODUCT_CONTRACT_CHALLENGE"),
  "PRODUCT_DEFINITION",
);
assert.equal(
  builderOutcomeDestination("IMPLEMENTATION_READY"),
  "INDEPENDENT_QA",
);
assert.equal(builderOutcomeDestination("PROVIDER_FAILURE"), "STOP");

const oldBuilderUrl = process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL;
const oldBuilderCost = process.env.MONEY_SCOUT_BUILDER_ADAPTER_COST_MODE;
const oldQaUrl = process.env.MONEY_SCOUT_QA_ADAPTER_URL;
const oldQaCost = process.env.MONEY_SCOUT_QA_ADAPTER_COST_MODE;
try {
  process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL = "https://builder.example.test";
  process.env.MONEY_SCOUT_QA_ADAPTER_URL = "https://qa.example.test";
  delete process.env.MONEY_SCOUT_BUILDER_ADAPTER_COST_MODE;
  delete process.env.MONEY_SCOUT_QA_ADAPTER_COST_MODE;
  assert.equal(
    configuredBuilderAdapter()?.costMode,
    "UNKNOWN",
    "an unspecified Builder billing contract is not zero-cost",
  );
  assert.equal(
    configuredQaAdapter()?.costMode,
    "UNKNOWN",
    "an unspecified QA billing contract is not zero-cost",
  );
} finally {
  if (oldBuilderUrl == null) delete process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL;
  else process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL = oldBuilderUrl;
  if (oldBuilderCost == null)
    delete process.env.MONEY_SCOUT_BUILDER_ADAPTER_COST_MODE;
  else process.env.MONEY_SCOUT_BUILDER_ADAPTER_COST_MODE = oldBuilderCost;
  if (oldQaUrl == null) delete process.env.MONEY_SCOUT_QA_ADAPTER_URL;
  else process.env.MONEY_SCOUT_QA_ADAPTER_URL = oldQaUrl;
  if (oldQaCost == null) delete process.env.MONEY_SCOUT_QA_ADAPTER_COST_MODE;
  else process.env.MONEY_SCOUT_QA_ADAPTER_COST_MODE = oldQaCost;
}

console.log("PASS zero-cost Asset Factory domain contracts");
