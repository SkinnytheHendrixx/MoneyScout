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

export function catalogImplementationSelectableForNewBuild(
  implementation: CatalogImplementation,
): boolean {
  return ["QUALIFIED", "PROVEN", "PREFERRED"].includes(
    implementation.lifecycleStatus,
  );
}

export function selectSoftwareCapabilities(input: {
  requiredFamilies: string[];
  runtimeType: string;
  implementations: CatalogImplementation[];
  buildEnvelope: BetBuildEnvelope;
  availableOperationalCapabilityKeys: Set<string>;
}): { bindings: CapabilityBinding[]; totalKnownExternalCostCents: number } {
  const byIdentity = new Map(
    input.implementations.map((item) => [
      `${item.implementationKey}@${item.version}`,
      item,
    ]),
  );
  const bindings: CapabilityBinding[] = [];
  const selected = new Map<string, CatalogImplementation>();

  const dependencyClosureFits = (
    candidate: CatalogImplementation,
  ): { fits: boolean; cost: number } => {
    const visiting = new Set<string>();
    const visited = new Set<string>();
    let cost = 0;
    const walk = (item: CatalogImplementation): boolean => {
      const identity = `${item.implementationKey}@${item.version}`;
      if (visited.has(identity)) return true;
      if (visiting.has(identity)) return false;
      visiting.add(identity);
      if (!catalogImplementationSelectableForNewBuild(item)) return false;
      if (
        item.maximumExternalCashCents == null ||
        item.requiresOperationalCapabilities.some(
          (key) => !input.availableOperationalCapabilityKeys.has(key),
        )
      ) {
        return false;
      }
      if (
        burdenRank[item.maintenanceBurden] >
          burdenRank[input.buildEnvelope.acceptableMaintenanceBurden] ||
        burdenRank[item.operationalBurden] >
          burdenRank[input.buildEnvelope.acceptableMaintenanceBurden]
      ) {
        return false;
      }
      cost += item.maximumExternalCashCents;
      for (const dependency of item.dependencies) {
        const child = byIdentity.get(
          `${dependency.implementationKey}@${dependency.version}`,
        );
        if (
          !child ||
          child.familyKey !== dependency.familyKey ||
          !walk(child)
        ) {
          return false;
        }
      }
      visiting.delete(identity);
      visited.add(identity);
      return true;
    };
    const fits = walk(candidate);
    return {
      fits:
        fits &&
        cost <= input.buildEnvelope.allowedExternalServiceBudgetCents &&
        (!input.buildEnvelope.onlyExistingZeroCashCapabilities || cost === 0),
      cost,
    };
  };

  for (const familyKey of [...new Set(input.requiredFamilies)]) {
    const candidates = input.implementations
      .filter(
        (item) =>
          item.familyKey === familyKey &&
          item.supportedRuntimeTypes.includes(input.runtimeType) &&
          catalogImplementationSelectableForNewBuild(item),
      )
      .sort((left, right) => {
        const trust = { PREFERRED: 0, PROVEN: 1, QUALIFIED: 2 } as const;
        const leftRank = trust[left.lifecycleStatus as keyof typeof trust] ?? 9;
        const rightRank =
          trust[right.lifecycleStatus as keyof typeof trust] ?? 9;
        return leftRank - rightRank || left.version - right.version;
      });
    const candidate = candidates.find(
      (item) => dependencyClosureFits(item).fits,
    );
    if (!candidate) {
      bindings.push({
        familyKey,
        implementationKey: null,
        version: null,
        fingerprint: null,
        outcome: "CUSTOM_BUILD_REQUIRED",
        conformanceTests: [],
      });
      continue;
    }
    selected.set(
      `${candidate.implementationKey}@${candidate.version}`,
      candidate,
    );
    bindings.push({
      familyKey,
      implementationKey: candidate.implementationKey,
      version: candidate.version,
      fingerprint: candidate.fingerprint,
      outcome: "PINNED",
      conformanceTests: candidate.conformanceTests,
    });
  }

  const totalKnownExternalCostCents = [...selected.values()].reduce(
    (total, item) => total + (item.maximumExternalCashCents ?? 0),
    0,
  );
  return { bindings, totalKnownExternalCostCents };
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
