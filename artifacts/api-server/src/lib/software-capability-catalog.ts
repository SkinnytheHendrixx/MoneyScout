import type {
  BetBuildEnvelope,
  CapabilityBinding,
  SoftwareCapabilityLifecycle,
} from "@workspace/db";

export type CatalogImplementation = {
  familyKey: string;
  implementationKey: string;
  version: number;
  lifecycleStatus: SoftwareCapabilityLifecycle;
  fingerprint: string;
  supportedRuntimeTypes: string[];
  dependencies: Array<{
    familyKey: string;
    implementationKey: string;
    version: number;
  }>;
  conformanceTests: string[];
  maximumExternalCashCents: number | null;
  maintenanceBurden: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  operationalBurden: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  requiresOperationalCapabilities: string[];
};

const burdenRank = { LOW: 1, MEDIUM: 2, HIGH: 3, UNKNOWN: 4 } as const;
const trustRank = { PREFERRED: 0, PROVEN: 1, QUALIFIED: 2 } as const;

function implementationIdentity(item: {
  implementationKey: string;
  version: number;
}): string {
  return `${item.implementationKey}@${item.version}`;
}

export function catalogImplementationSelectableForNewBuild(
  implementation: CatalogImplementation,
): boolean {
  return ["QUALIFIED", "PROVEN", "PREFERRED"].includes(
    implementation.lifecycleStatus,
  );
}

/**
 * A candidate slot of `null` represents CUSTOM_BUILD_REQUIRED for that
 * family: always structurally valid and zero external cost, so the search
 * below can never come back empty-handed, but it is only accepted when no
 * globally valid reuse combination exists (see the iterative-deepening
 * search over fallback count).
 */
type FamilyCandidate = CatalogImplementation | null;

type ClosureEvaluation =
  | {
      ok: true;
      totalCost: number;
      closure: Map<string, CatalogImplementation>;
    }
  | { ok: false };

export function selectSoftwareCapabilities(input: {
  requiredFamilies: string[];
  runtimeType: string;
  implementations: CatalogImplementation[];
  buildEnvelope: BetBuildEnvelope;
  availableOperationalCapabilityKeys: Set<string>;
}): { bindings: CapabilityBinding[]; totalKnownExternalCostCents: number } {
  const byIdentity = new Map(
    input.implementations.map((item) => [implementationIdentity(item), item]),
  );
  const families = [...new Set(input.requiredFamilies)];

  const burdenWithinEnvelope = (item: CatalogImplementation): boolean =>
    burdenRank[item.maintenanceBurden] <=
      burdenRank[input.buildEnvelope.acceptableMaintenanceBurden] &&
    burdenRank[item.operationalBurden] <=
      burdenRank[input.buildEnvelope.acceptableMaintenanceBurden];

  function collectClosure(
    item: CatalogImplementation,
    closure: Map<string, CatalogImplementation>,
    visiting: Set<string>,
  ): boolean {
    const identity = implementationIdentity(item);
    if (closure.has(identity)) return true;
    if (visiting.has(identity)) return false;
    if (!catalogImplementationSelectableForNewBuild(item)) return false;
    if (
      item.requiresOperationalCapabilities.some(
        (key) => !input.availableOperationalCapabilityKeys.has(key),
      )
    )
      return false;
    if (!burdenWithinEnvelope(item)) return false;
    visiting.add(identity);
    for (const dependency of item.dependencies) {
      const child = byIdentity.get(implementationIdentity(dependency));
      if (!child || child.familyKey !== dependency.familyKey) {
        visiting.delete(identity);
        return false;
      }
      if (!collectClosure(child, closure, visiting)) {
        visiting.delete(identity);
        return false;
      }
    }
    visiting.delete(identity);
    closure.set(identity, item);
    return true;
  }

  function evaluateCombination(
    selection: readonly FamilyCandidate[],
  ): ClosureEvaluation {
    const closure = new Map<string, CatalogImplementation>();
    const visiting = new Set<string>();
    for (const candidate of selection) {
      if (!candidate) continue;
      if (!collectClosure(candidate, closure, visiting)) return { ok: false };
    }
    let totalCost = 0;
    for (const node of closure.values()) {
      // A null maximumExternalCashCents is an UNKNOWN cost. It must never be
      // treated as zero: an unknown-cost node fails the whole combination
      // closed rather than silently dropping out of the aggregate total.
      if (node.maximumExternalCashCents == null) return { ok: false };
      totalCost += node.maximumExternalCashCents;
    }
    if (totalCost > input.buildEnvelope.allowedExternalServiceBudgetCents)
      return { ok: false };
    if (totalCost > input.buildEnvelope.maximumExternalBuildSpendCents)
      return { ok: false };
    if (input.buildEnvelope.onlyExistingZeroCashCapabilities && totalCost !== 0)
      return { ok: false };
    return { ok: true, totalCost, closure };
  }

  const optionsPerFamily: FamilyCandidate[][] = families.map((familyKey) => {
    const reuseCandidates = input.implementations
      .filter(
        (item) =>
          item.familyKey === familyKey &&
          item.supportedRuntimeTypes.includes(input.runtimeType) &&
          catalogImplementationSelectableForNewBuild(item),
      )
      .sort((left, right) => {
        const leftRank = trustRank[left.lifecycleStatus as keyof typeof trustRank] ?? 9;
        const rightRank =
          trustRank[right.lifecycleStatus as keyof typeof trustRank] ?? 9;
        return leftRank - rightRank || left.version - right.version;
      });
    // CUSTOM_BUILD_REQUIRED is always appended last: a normal, always-valid
    // outcome that the search only accepts once no globally valid reuse
    // combination with fewer fallbacks exists.
    return [...reuseCandidates, null];
  });

  const EVALUATION_BUDGET = 50_000;
  let evaluationsRemaining = EVALUATION_BUDGET;

  function searchWithFallbackBudget(
    maxFallbacks: number,
  ): { selection: FamilyCandidate[]; evaluation: ClosureEvaluation & { ok: true } } | null {
    const selection: FamilyCandidate[] = new Array(families.length).fill(null);

    function backtrack(
      familyIndex: number,
      fallbacksUsed: number,
    ): ClosureEvaluation & { ok: true } | null {
      if (familyIndex === families.length) {
        if (evaluationsRemaining <= 0) return null;
        evaluationsRemaining -= 1;
        const evaluation = evaluateCombination(selection);
        return evaluation.ok ? evaluation : null;
      }
      for (const option of optionsPerFamily[familyIndex]!) {
        if (option === null) {
          if (fallbacksUsed + 1 > maxFallbacks) continue;
          selection[familyIndex] = null;
          const result = backtrack(familyIndex + 1, fallbacksUsed + 1);
          if (result) return result;
        } else {
          selection[familyIndex] = option;
          const result = backtrack(familyIndex + 1, fallbacksUsed);
          if (result) return result;
        }
        if (evaluationsRemaining <= 0) return null;
      }
      return null;
    }

    const evaluation = backtrack(0, 0);
    return evaluation ? { selection, evaluation } : null;
  }

  let found: {
    selection: FamilyCandidate[];
    evaluation: ClosureEvaluation & { ok: true };
  } | null = null;
  for (
    let maxFallbacks = 0;
    maxFallbacks <= families.length && !found;
    maxFallbacks += 1
  ) {
    found = searchWithFallbackBudget(maxFallbacks);
    if (evaluationsRemaining <= 0) break;
  }

  if (!found) {
    // Prefer correctness over cleverness: if the bounded search could not
    // prove any combination valid (including full custom build, which is
    // otherwise always trivially valid), fail closed to full custom build
    // rather than ever returning a partially validated selection.
    const bindings: CapabilityBinding[] = families.map((familyKey) => ({
      familyKey,
      implementationKey: null,
      version: null,
      fingerprint: null,
      outcome: "CUSTOM_BUILD_REQUIRED",
      conformanceTests: [],
    }));
    return { bindings, totalKnownExternalCostCents: 0 };
  }

  const bindings: CapabilityBinding[] = families.map((familyKey, index) => {
    const chosen = found!.selection[index];
    if (!chosen)
      return {
        familyKey,
        implementationKey: null,
        version: null,
        fingerprint: null,
        outcome: "CUSTOM_BUILD_REQUIRED",
        conformanceTests: [],
      };
    return {
      familyKey,
      implementationKey: chosen.implementationKey,
      version: chosen.version,
      fingerprint: chosen.fingerprint,
      outcome: "PINNED",
      conformanceTests: chosen.conformanceTests,
    };
  });

  return {
    bindings,
    totalKnownExternalCostCents: found.evaluation.totalCost,
  };
}

export function nextCapabilityLifecycleAfterBuild(
  current: SoftwareCapabilityLifecycle,
): SoftwareCapabilityLifecycle {
  return current;
}

export function assertCapabilityVersionImmutable(input: {
  existingFingerprint: string;
  proposedFingerprint: string;
  implementationKey: string;
  version: number;
}): void {
  if (input.existingFingerprint !== input.proposedFingerprint) {
    throw new Error(
      `CAPABILITY_VERSION_IMMUTABLE:${input.implementationKey}@${input.version}`,
    );
  }
}
