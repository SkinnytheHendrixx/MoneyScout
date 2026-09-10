import assert from "node:assert/strict";
import type { BetBuildEnvelope, ProductDefinitionDocument, RequirementGraphDocument } from "@workspace/db";
import { composeArchitecturePlan } from "../src/lib/architecture-composer";
import {
  selectSoftwareCapabilities,
  type CatalogImplementation,
} from "../src/lib/software-capability-catalog";

// Blocker 2: the final selected Software Capability implementation graph
// must be valid as one complete, deduplicated, aggregate unit -- not as a
// collection of individually-valid candidates. Every scenario below drives
// the real selection algorithm end to end rather than unit-testing its
// internals directly.

const envelope = (
  overrides: Partial<BetBuildEnvelope> = {},
): BetBuildEnvelope => ({
  schemaVersion: 1,
  maximumExternalBuildSpendCents: 100,
  allowedExternalServiceBudgetCents: 100,
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
  requiredAcceptanceCriteria: ["Clean checkout verification passes."],
  onlyExistingZeroCashCapabilities: false,
  hardConstraints: [],
  ...overrides,
});

let implCounter = 0;
const implementation = (
  overrides: Partial<CatalogImplementation> = {},
): CatalogImplementation => {
  implCounter += 1;
  return {
    familyKey: "FAM_DEFAULT",
    implementationKey: `impl-${implCounter}`,
    version: 1,
    lifecycleStatus: "PROVEN",
    fingerprint: `fp-${implCounter}`,
    supportedRuntimeTypes: ["AUTOMATION"],
    dependencies: [],
    conformanceTests: [],
    maximumExternalCashCents: 0,
    maintenanceBurden: "LOW",
    operationalBurden: "LOW",
    requiresOperationalCapabilities: [],
    ...overrides,
  };
};

// 1. Two individually valid $60 capabilities cannot both be reused when
// their aggregate exceeds the envelope, even though each fits alone.
{
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a",
    maximumExternalCashCents: 60,
  });
  const b = implementation({
    familyKey: "FAM_B",
    implementationKey: "cap-b",
    maximumExternalCashCents: 60,
  });
  assert.ok(60 <= envelope().allowedExternalServiceBudgetCents);
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A", "FAM_B"],
    runtimeType: "AUTOMATION",
    implementations: [a, b],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.ok(
    !(
      result.bindings[0]?.outcome === "PINNED" &&
      result.bindings[1]?.outcome === "PINNED"
    ),
    "two individually valid $60 capabilities cannot both be reused against a $100 envelope",
  );
  assert.ok(
    result.totalKnownExternalCostCents <= 100,
    "aggregate cost never exceeds the envelope even when a resolution exists",
  );
}

// 2/3/14. $40 + $40 sharing one $20 dependency totals exactly $100, and the
// shared dependency is counted exactly once (not $80, not $120).
{
  const db = implementation({
    familyKey: "FAM_DB",
    implementationKey: "shared-db",
    version: 1,
    maximumExternalCashCents: 20,
  });
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-shared",
    maximumExternalCashCents: 40,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "shared-db", version: 1 },
    ],
  });
  const b = implementation({
    familyKey: "FAM_B",
    implementationKey: "cap-b-shared",
    maximumExternalCashCents: 40,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "shared-db", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A", "FAM_B"],
    runtimeType: "AUTOMATION",
    implementations: [a, b, db],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "PINNED");
  assert.equal(result.bindings[1]?.outcome, "PINNED");
  assert.equal(
    result.totalKnownExternalCostCents,
    100,
    "a shared dependency is counted exactly once: 40 + 40 + 20, not 80 or 120",
  );

  // 15. Architecture Composer receives the exact same aggregate cost.
  const definition = minimalDefinition();
  const graph = minimalGraph();
  const composed = composeArchitecturePlan({
    betId: 1,
    productDefinitionId: 1,
    productDefinitionVersion: 1,
    productDefinitionFingerprint: "fp",
    definition,
    graph,
    buildEnvelope: envelope(),
    capabilityBindings: result.bindings,
    knownCapabilityCostCents: result.totalKnownExternalCostCents,
  });
  assert.equal(composed.kind, "PLAN");
  if (composed.kind === "PLAN")
    assert.equal(
      composed.document.expectedExternalBuildCostCents,
      result.totalKnownExternalCostCents,
      "Architecture Composer must receive the exact deduplicated selected-graph cost",
    );
}

// 4. Distinct (non-shared) dependencies are all counted.
{
  const dbDep = implementation({
    familyKey: "FAM_DB",
    implementationKey: "distinct-db",
    maximumExternalCashCents: 20,
  });
  const queueDep = implementation({
    familyKey: "FAM_QUEUE",
    implementationKey: "distinct-queue",
    maximumExternalCashCents: 30,
  });
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-distinct",
    maximumExternalCashCents: 40,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "distinct-db", version: 1 },
    ],
  });
  const b = implementation({
    familyKey: "FAM_B",
    implementationKey: "cap-b-distinct",
    maximumExternalCashCents: 40,
    dependencies: [
      {
        familyKey: "FAM_QUEUE",
        implementationKey: "distinct-queue",
        version: 1,
      },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A", "FAM_B"],
    runtimeType: "AUTOMATION",
    implementations: [a, b, dbDep, queueDep],
    buildEnvelope: envelope({
      allowedExternalServiceBudgetCents: 130,
      maximumExternalBuildSpendCents: 130,
    }),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "PINNED");
  assert.equal(result.bindings[1]?.outcome, "PINNED");
  assert.equal(
    result.totalKnownExternalCostCents,
    130,
    "distinct dependencies (20 + 30) are both included alongside the 40 + 40 top-level cost",
  );
}

// 5. An UNKNOWN top-level implementation cost never becomes zero.
{
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-unknown-top",
    lifecycleStatus: "PREFERRED",
    maximumExternalCashCents: null,
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(
    result.bindings[0]?.outcome,
    "CUSTOM_BUILD_REQUIRED",
    "an UNKNOWN top-level cost must never be treated as zero and silently pinned",
  );
  assert.equal(result.totalKnownExternalCostCents, 0);
}

// 6. An UNKNOWN dependency cost never becomes zero.
{
  const dep = implementation({
    familyKey: "FAM_DB",
    implementationKey: "unknown-dep-db",
    maximumExternalCashCents: null,
  });
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-unknown-dep",
    maximumExternalCashCents: 40,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "unknown-dep-db", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a, dep],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(
    result.bindings[0]?.outcome,
    "CUSTOM_BUILD_REQUIRED",
    "an UNKNOWN transitive dependency cost must block reuse rather than being dropped from the total",
  );
  assert.equal(result.totalKnownExternalCostCents, 0);
}

// 7. A transitive dependency cost that alone exceeds the envelope blocks
// selection of the whole implementation.
{
  const dep = implementation({
    familyKey: "FAM_DB",
    implementationKey: "expensive-db",
    maximumExternalCashCents: 95,
  });
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-expensive-dep",
    maximumExternalCashCents: 10,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "expensive-db", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a, dep],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "CUSTOM_BUILD_REQUIRED");
  assert.equal(result.totalKnownExternalCostCents, 0);
}

// 8. A zero-cost capability set remains a valid reuse selection.
{
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-zero",
    maximumExternalCashCents: 0,
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a],
    buildEnvelope: envelope({ onlyExistingZeroCashCapabilities: true }),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "PINNED");
  assert.equal(result.totalKnownExternalCostCents, 0);
}

// 9. Product Definition requirement coverage is never reduced to make the
// capability budget fit: even a fully custom-built (zero-reuse) selection
// must still let every included requirement map to an architecture
// component.
{
  const definition = minimalDefinition();
  const graph = minimalGraph();
  const forcedCustomBuild = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_UNAVAILABLE"],
    runtimeType: "AUTOMATION",
    implementations: [],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(forcedCustomBuild.bindings[0]?.outcome, "CUSTOM_BUILD_REQUIRED");
  const composed = composeArchitecturePlan({
    betId: 1,
    productDefinitionId: 1,
    productDefinitionVersion: 1,
    productDefinitionFingerprint: "fp",
    definition,
    graph,
    buildEnvelope: envelope(),
    capabilityBindings: forcedCustomBuild.bindings,
    knownCapabilityCostCents: forcedCustomBuild.totalKnownExternalCostCents,
  });
  assert.equal(composed.kind, "PLAN");
  if (composed.kind === "PLAN") {
    const covered = new Set(
      composed.document.components.flatMap((item) => item.requirementIds),
    );
    for (const requirement of definition.requirements.filter(
      (item) => item.status === "INCLUDED",
    ))
      assert.ok(
        covered.has(requirement.id),
        "custom-build fallback must not silently drop requirement coverage",
      );
  }
}

// 10. A globally valid lower-cost candidate is selected over a locally
// preferred candidate that would make the full combination invalid.
{
  const aPreferred = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-preferred",
    lifecycleStatus: "PREFERRED",
    maximumExternalCashCents: 70,
  });
  const aQualified = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-qualified",
    lifecycleStatus: "QUALIFIED",
    maximumExternalCashCents: 30,
  });
  const b = implementation({
    familyKey: "FAM_B",
    implementationKey: "cap-b-fixed",
    maximumExternalCashCents: 60,
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A", "FAM_B"],
    runtimeType: "AUTOMATION",
    implementations: [aPreferred, aQualified, b],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "PINNED");
  assert.equal(result.bindings[1]?.outcome, "PINNED");
  assert.equal(
    result.bindings[0]?.implementationKey,
    "cap-a-qualified",
    "the greedy-preferred $70 candidate must yield to the $30 candidate when only that combination is globally valid",
  );
  assert.equal(result.totalKnownExternalCostCents, 90);
}

// 11. A QUARANTINED transitive dependency invalidates its selectable
// parent, even though the parent itself is otherwise fine.
{
  const quarantinedDep = implementation({
    familyKey: "FAM_DB",
    implementationKey: "quarantined-db",
    lifecycleStatus: "QUARANTINED",
    maximumExternalCashCents: 0,
  });
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-quarantined-dep",
    maximumExternalCashCents: 0,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "quarantined-db", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a, quarantinedDep],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "CUSTOM_BUILD_REQUIRED");
}

// 12. A missing dependency (referenced but not present in the catalog)
// invalidates the candidate.
{
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-missing-dep",
    maximumExternalCashCents: 0,
    dependencies: [
      { familyKey: "FAM_DB", implementationKey: "does-not-exist", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings[0]?.outcome, "CUSTOM_BUILD_REQUIRED");
}

// 13. A cyclic dependency graph remains invalid rather than looping
// forever or being accepted.
{
  const a = implementation({
    familyKey: "FAM_A",
    implementationKey: "cyc-a",
    version: 1,
    maximumExternalCashCents: 0,
    dependencies: [
      { familyKey: "FAM_B", implementationKey: "cyc-b", version: 1 },
    ],
  });
  const b = implementation({
    familyKey: "FAM_B",
    implementationKey: "cyc-b",
    version: 1,
    maximumExternalCashCents: 0,
    dependencies: [
      { familyKey: "FAM_A", implementationKey: "cyc-a", version: 1 },
    ],
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A"],
    runtimeType: "AUTOMATION",
    implementations: [a, b],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(
    result.bindings[0]?.outcome,
    "CUSTOM_BUILD_REQUIRED",
    "a cyclic dependency graph must never be accepted",
  );
}

// 16. When no combination in a multi-family graph can be validated (every
// candidate has a disqualifying defect), the result fails closed to a
// complete, internally-consistent custom-build fallback rather than ever
// returning a partially valid mixed selection.
{
  const unknownCostCandidate = implementation({
    familyKey: "FAM_A",
    implementationKey: "cap-a-fails-closed",
    maximumExternalCashCents: null,
  });
  const quarantinedDepCandidate = implementation({
    familyKey: "FAM_B",
    implementationKey: "cap-b-fails-closed",
    maximumExternalCashCents: 0,
    dependencies: [
      {
        familyKey: "FAM_DB",
        implementationKey: "quarantined-db-2",
        version: 1,
      },
    ],
  });
  const quarantinedDb2 = implementation({
    familyKey: "FAM_DB",
    implementationKey: "quarantined-db-2",
    lifecycleStatus: "RETIRED",
    maximumExternalCashCents: 0,
  });
  const overBudgetCandidate = implementation({
    familyKey: "FAM_C",
    implementationKey: "cap-c-fails-closed",
    maximumExternalCashCents: 500,
  });
  const result = selectSoftwareCapabilities({
    requiredFamilies: ["FAM_A", "FAM_B", "FAM_C"],
    runtimeType: "AUTOMATION",
    implementations: [
      unknownCostCandidate,
      quarantinedDepCandidate,
      quarantinedDb2,
      overBudgetCandidate,
    ],
    buildEnvelope: envelope(),
    availableOperationalCapabilityKeys: new Set(),
  });
  assert.equal(result.bindings.length, 3);
  for (const binding of result.bindings)
    assert.equal(
      binding.outcome,
      "CUSTOM_BUILD_REQUIRED",
      "every disqualified family must fail closed to custom build, never a partially valid mix",
    );
  assert.equal(result.totalKnownExternalCostCents, 0);
}

console.log("PASS zero-cost Capability Catalog aggregate selection");

function minimalDefinition(): ProductDefinitionDocument {
  return {
    schemaVersion: 1,
    lineage: {
      opportunityId: 1,
      evaluationCycleId: null,
      betId: 1,
      buildEnvelopeFingerprint: "fp",
      inputSnapshotFingerprint: "fp",
    },
    commercialTruth: {
      targetBuyer: "Operators",
      validatedProblem: "Recurring manual review",
      promisedOutcome: "Automated monitoring",
      monetization: {},
    },
    actors: ["Operator"],
    customerSurfaces: ["dashboard"],
    workflows: ["monitor"],
    requirements: [
      {
        id: "REQ-1",
        text: "The product must monitor a source and alert on change.",
        role: "CORE",
        origin: "COMMERCIAL_CONTRACT",
        evidenceRefs: ["EVIDENCE-1"],
        rationale: "Core validated promise.",
        confidence: "KNOWN",
        complexityImpact: "LOW",
        acceptanceCondition: "A change triggers a visible alert.",
        status: "INCLUDED",
      },
    ],
    nonGoals: [],
    unresolvedQuestions: [],
    competitiveFirstRelease: true,
  };
}

function minimalGraph(): RequirementGraphDocument {
  return {
    schemaVersion: 1,
    productDefinitionFingerprint: "fp",
    obligations: [
      {
        id: "OBL-1",
        requirementId: "REQ-1",
        kind: "FUNCTIONAL",
        statement: "Detect and surface a change.",
      },
    ],
    edges: [{ from: "REQ-1", to: "OBL-1", relation: "SATISFIED_BY" }],
  };
}
