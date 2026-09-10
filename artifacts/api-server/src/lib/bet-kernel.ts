import type {
  BetBuildEnvelope,
  BetDecisionContract,
  BetResourceBucket,
  BetResourceEnvelope,
  BetStatus,
} from "@workspace/db";

export const BET_DOES_NOT_GRANT_AUTHORITY = Object.freeze({
  customerCharging: false,
  outbound: false,
  advertising: false,
  publicRelease: false,
  productionCredentials: false,
  customDomain: false,
  externalSpend: false,
});

export type BetCostSource = {
  sourceType: "BUILD" | "RELEASE" | "ASSET_OPERATIONS";
  sourceId: number;
  bucket: "build" | "release" | "operations";
  committedCents: number;
  consumedCents: number;
  updatedAt: Date;
};

const transitions: Record<BetStatus, readonly BetStatus[]> = {
  PROPOSED: ["APPROVED", "WITHDRAWN"],
  APPROVED: ["ACTIVE", "PAUSED", "WITHDRAWN", "EXHAUSTED"],
  ACTIVE: ["PAUSED", "SUCCEEDED", "WITHDRAWN", "EXHAUSTED"],
  PAUSED: ["APPROVED", "ACTIVE", "WITHDRAWN", "EXHAUSTED"],
  SUCCEEDED: [],
  WITHDRAWN: [],
  EXHAUSTED: ["WITHDRAWN"],
};

export function assertBetTransition(from: BetStatus, to: BetStatus): void {
  if (!transitions[from].includes(to))
    throw new Error("INVALID_BET_TRANSITION:" + from + "->" + to);
}

export function betCanInitiateBuild(status: BetStatus): boolean {
  return status === "APPROVED" || status === "ACTIVE";
}

const validQuantity = (value: number | null): boolean =>
  value == null || (Number.isInteger(value) && value >= 0);

export function validateBetDecisionContract(
  contract: BetDecisionContract,
): string[] {
  if (!contract || contract.schemaVersion !== 1)
    return ["decisionContract.schemaVersion must be 1"];
  const errors: string[] = [];
  if (!contract.thesis?.trim())
    errors.push("decisionContract.thesis is required");
  if (!contract.rationale?.trim())
    errors.push("decisionContract.rationale is required");
  if (!contract.successCriteria?.length)
    errors.push("decisionContract.successCriteria must not be empty");
  if (!contract.failureCriteria?.length)
    errors.push("decisionContract.failureCriteria must not be empty");
  if (!contract.iterateCriteria?.length)
    errors.push("decisionContract.iterateCriteria must not be empty");
  if (
    !contract.upside ||
    !["KNOWN", "BOUNDED", "UNKNOWN"].includes(contract.upside.status)
  ) {
    errors.push(
      "decisionContract.upside must explicitly be KNOWN, BOUNDED, or UNKNOWN",
    );
  }
  if (
    contract.upside?.status !== "UNKNOWN" &&
    !contract.upside?.evidenceRefs?.length
  ) {
    errors.push("known/bounded upside requires evidenceRefs");
  }
  if (
    contract.upside?.status === "BOUNDED" &&
    (contract.upside.lower == null || contract.upside.upper == null)
  ) {
    errors.push("bounded upside requires lower and upper values");
  }
  return errors;
}

export function validateBetResourceEnvelope(
  envelope: BetResourceEnvelope,
): string[] {
  if (!envelope || envelope.schemaVersion !== 1)
    return ["resourceEnvelope.schemaVersion must be 1"];
  const errors: string[] = [];
  const names = [
    "externalCash",
    "providerServices",
    "research",
    "build",
    "release",
    "experiment",
    "operations",
    "autonomousCapacity",
    "humanDependencyBurden",
  ] as const;
  for (const name of names) {
    const bucket = envelope[name];
    if (
      !bucket ||
      !validQuantity(bucket.allocated) ||
      !validQuantity(bucket.committed) ||
      !validQuantity(bucket.consumed) ||
      !validQuantity(bucket.remaining)
    ) {
      errors.push(
        "resourceEnvelope." +
          name +
          " must use nonnegative integer quantities or explicit null allocation/remaining",
      );
    }
  }
  return errors;
}

export function validateBetBuildEnvelope(envelope: BetBuildEnvelope): string[] {
  if (!envelope || envelope.schemaVersion !== 1)
    return ["buildEnvelope.schemaVersion must be 1"];
  const errors: string[] = [];
  if (
    !Number.isInteger(envelope.maximumExternalBuildSpendCents) ||
    envelope.maximumExternalBuildSpendCents < 0
  ) {
    errors.push(
      "buildEnvelope.maximumExternalBuildSpendCents must be nonnegative integer cents",
    );
  }
  if (
    !Number.isInteger(envelope.allowedExternalServiceBudgetCents) ||
    envelope.allowedExternalServiceBudgetCents < 0
  ) {
    errors.push(
      "buildEnvelope.allowedExternalServiceBudgetCents must be nonnegative integer cents",
    );
  }
  if (!envelope.permittedProductScope?.length)
    errors.push("buildEnvelope.permittedProductScope must not be empty");
  if (!envelope.requiredAcceptanceCriteria?.length)
    errors.push("buildEnvelope.requiredAcceptanceCriteria must not be empty");
  return errors;
}

export function approvalRequiresHumanCapitalAuthority(
  envelope: BetResourceEnvelope,
): boolean {
  return (
    (envelope.externalCash.allocated ?? 0) > 0 ||
    (envelope.providerServices.allocated ?? 0) > 0
  );
}

function accountedBucket(
  original: BetResourceBucket,
  sources: BetCostSource[],
): BetResourceBucket {
  const committed = sources.reduce(
    (sum, source) => sum + source.committedCents,
    0,
  );
  const consumed = sources.reduce(
    (sum, source) => sum + source.consumedCents,
    0,
  );
  return {
    ...original,
    committed,
    consumed,
    remaining:
      original.allocated == null
        ? null
        : Math.max(0, original.allocated - consumed),
  };
}

export function reconcileResourceEnvelope(
  original: BetResourceEnvelope,
  sources: BetCostSource[],
  now = new Date(),
): { envelope: BetResourceEnvelope; exhausted: boolean } {
  const build = accountedBucket(
    original.build,
    sources.filter((source) => source.bucket === "build"),
  );
  const release = accountedBucket(
    original.release,
    sources.filter((source) => source.bucket === "release"),
  );
  const operations = accountedBucket(
    original.operations,
    sources.filter((source) => source.bucket === "operations"),
  );
  const externalCash = accountedBucket(original.externalCash, sources);
  const providerServices = accountedBucket(original.providerServices, sources);
  const tracked = [externalCash, providerServices, build, release, operations];
  const exhausted = tracked.some(
    (bucket) =>
      bucket.allocated != null &&
      (bucket.committed > bucket.allocated ||
        bucket.consumed > bucket.allocated ||
        (bucket.allocated > 0 && bucket.consumed >= bucket.allocated)),
  );
  return {
    envelope: {
      ...original,
      externalCash,
      providerServices,
      build,
      release,
      operations,
      accountingAsOf: now.toISOString(),
    },
    exhausted,
  };
}

export function buildInvestmentContract(input: {
  betId: number;
  buildEnvelope: BetBuildEnvelope;
  resourceEnvelope: BetResourceEnvelope;
}) {
  return {
    betId: input.betId,
    buildEnvelope: input.buildEnvelope,
    resourceEnvelopeAtAllocation: input.resourceEnvelope,
    downstreamExternalSpendCeilingCents: 0,
    authority: BET_DOES_NOT_GRANT_AUTHORITY,
    note: "The Bet bounds investment. It does not authorize a provider charge or any commercial side effect.",
  } as const;
}
