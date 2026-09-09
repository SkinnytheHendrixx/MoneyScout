import type { ValidationEvidenceKind } from "./validation-evidence-collector";
import type { EvidenceClassification, UnderwritingFactor } from "./validation-engine";
import type { ExperimentType, FalsifyingExperimentPlan } from "./experiment-planner";

export const AUTOMATIC_EXPERIMENT_EXTERNAL_COST_CEILING_USD = 0;

export type ExperimentExecutionOutcome = "SUPPORTED" | "FALSIFIED" | "INCONCLUSIVE";
export type ExperimentExecutionDirection = "SUPPORTS" | "CONTRADICTS" | "CONTEXT";
export type ExperimentExecutionStatus = "COMPLETED" | "FALSIFIED" | "INCONCLUSIVE" | "FAILED";
export type ExperimentExecutionMode =
  | "AUTOMATIC_INTERNAL"
  | "ADAPTER_REQUIRED"
  | "EXPLICIT_EXTERNAL_ACTION_REQUIRED";

export type ExperimentExecutionObservation = {
  factor: UnderwritingFactor;
  direction: ExperimentExecutionDirection;
  evidenceKind: ValidationEvidenceKind;
  classification: Extract<EvidenceClassification, "FACT" | "INFERENCE">;
  claim: string;
};

export type ExperimentExecutionAdapterResult = {
  outcome: ExperimentExecutionOutcome;
  summary: string;
  observations: ExperimentExecutionObservation[];
  metrics?: Record<string, string | number | boolean | null>;
  externalCostUsd?: number;
};

export type ExperimentExecutionContext = {
  experimentId: number;
  opportunityId: number;
  engineFamily: string;
  sourcePlatform: string;
  sourceUrl: string;
  opportunityType: string;
  thesis: string;
  plan: FalsifyingExperimentPlan;
};

export type ExperimentExecutorAdapter = (
  context: ExperimentExecutionContext,
) => Promise<ExperimentExecutionAdapterResult>;

export type ExperimentExecutionCapability = {
  mode: ExperimentExecutionMode;
  automaticExecutionAllowed: boolean;
  adapterKey: string | null;
  reason: string;
};

export type StoredExperimentExecution = {
  schemaVersion: 1;
  plan: FalsifyingExperimentPlan;
  execution: {
    status: ExperimentExecutionStatus;
    outcome: ExperimentExecutionOutcome | null;
    summary: string;
    adapterKey: string | null;
    startedAt: string;
    finishedAt: string;
    externalCostUsd: number;
    observations: ExperimentExecutionObservation[];
    metrics: Record<string, string | number | boolean | null>;
    retryPolicy: "NO_AUTOMATIC_RETRY";
  };
};

const AUTOMATABLE_TYPES = new Set<ExperimentType>([
  "TECHNICAL_SPIKE",
  "DEPENDENCY_SOAK_TEST",
  "UNIT_COST_BENCHMARK",
]);

const EXTERNAL_SIDE_EFFECT_TYPES = new Set<ExperimentType>([
  "PAID_COMMITMENT_TEST",
  "MANUAL_CONCIERGE_TEST",
  "CHANNEL_SMOKE_TEST",
  "MINIMAL_MARKETPLACE_LAUNCH",
  "SWITCHING_TRIAL",
  "COMPETITOR_GAP_PROBE",
  "REPEAT_USAGE_PILOT",
]);

const ALLOWED_EVIDENCE_KINDS: Record<ExperimentType, ValidationEvidenceKind[]> = {
  PAID_COMMITMENT_TEST: ["BUYER_BUDGET", "PRICING", "REACHABLE_WEDGE"],
  MANUAL_CONCIERGE_TEST: ["PROBLEM_WORKAROUND", "REPEAT_DEMAND", "SWITCHING_COST", "PORTABILITY", "OPERATING_BURDEN"],
  CHANNEL_SMOKE_TEST: ["DISTRIBUTION_CHANNEL", "ACQUISITION_ECONOMICS", "BUYER_BUDGET"],
  MINIMAL_MARKETPLACE_LAUNCH: ["DISTRIBUTION_CHANNEL", "REPEAT_DEMAND", "TIME_TO_SIGNAL", "OPERATING_BURDEN"],
  SWITCHING_TRIAL: ["SWITCHING_COST", "PORTABILITY", "COMPETITOR_QUALITY", "COMPLAINT_OR_GAP"],
  COMPETITOR_GAP_PROBE: ["COMPETITOR_QUALITY", "COMPLAINT_OR_GAP", "PROBLEM_WORKAROUND"],
  TECHNICAL_SPIKE: ["BUILD_REQUIREMENT", "TECH_DEPENDENCY", "REVERSIBILITY", "VALIDATION_COST", "TEST_DESIGN", "TIME_TO_SIGNAL"],
  DEPENDENCY_SOAK_TEST: ["TECH_DEPENDENCY", "OPERATING_BURDEN", "MAINTENANCE_HISTORY", "SUPPORT_COST", "TIME_TO_SIGNAL"],
  UNIT_COST_BENCHMARK: ["VARIABLE_COST", "PLATFORM_FEE", "SUPPORT_COST", "ACQUISITION_ECONOMICS", "BUILD_REQUIREMENT", "VALIDATION_COST"],
  REPEAT_USAGE_PILOT: ["REPEAT_DEMAND", "DEMAND_TREND", "PROBLEM_WORKAROUND", "TIME_TO_SIGNAL"],
};

const adapters = new Map<string, ExperimentExecutorAdapter>();

const adapterKey = (engineFamily: string, experimentType: ExperimentType): string =>
  `${engineFamily.trim().toUpperCase()}:${experimentType}`;

export function registerExperimentExecutorAdapter(
  engineFamily: string,
  experimentType: ExperimentType,
  adapter: ExperimentExecutorAdapter,
): void {
  if (!AUTOMATABLE_TYPES.has(experimentType)) {
    throw new Error(`${experimentType} cannot be registered for automatic execution because it can require external human, publication, outreach, payment, or user-facing side effects.`);
  }
  adapters.set(adapterKey(engineFamily, experimentType), adapter);
}

export function clearExperimentExecutorAdaptersForTests(): void {
  adapters.clear();
}

export function experimentExecutionCapability(input: {
  engineFamily: string;
  experimentType: ExperimentType;
}): ExperimentExecutionCapability {
  if (EXTERNAL_SIDE_EFFECT_TYPES.has(input.experimentType)) {
    return {
      mode: "EXPLICIT_EXTERNAL_ACTION_REQUIRED",
      automaticExecutionAllowed: false,
      adapterKey: null,
      reason: `${input.experimentType} can create real-world outreach, payment, publication, user interaction, migration, or marketplace side effects. Money Scout must not execute it through the generic autonomous executor without a separately authorized dedicated integration.`,
    };
  }

  if (!AUTOMATABLE_TYPES.has(input.experimentType)) {
    return {
      mode: "ADAPTER_REQUIRED",
      automaticExecutionAllowed: false,
      adapterKey: null,
      reason: "No automatic execution policy exists for this experiment type.",
    };
  }

  const exactKey = adapterKey(input.engineFamily, input.experimentType);
  const wildcardKey = adapterKey("*", input.experimentType);
  const resolvedKey = adapters.has(exactKey) ? exactKey : adapters.has(wildcardKey) ? wildcardKey : null;
  if (!resolvedKey) {
    return {
      mode: "ADAPTER_REQUIRED",
      automaticExecutionAllowed: false,
      adapterKey: null,
      reason: `${input.experimentType} is safe for bounded internal automation, but no executor adapter is registered for engine family ${input.engineFamily}.`,
    };
  }

  return {
    mode: "AUTOMATIC_INTERNAL",
    automaticExecutionAllowed: true,
    adapterKey: resolvedKey,
    reason: "A bounded internal executor adapter is registered. Generic execution still forbids external-service spend and user-facing side effects.",
  };
}

const finiteNonNegative = (value: unknown): value is number =>
  typeof value === "number" && Number.isFinite(value) && value >= 0;

export function validateExperimentExecutionResult(
  plan: FalsifyingExperimentPlan,
  raw: ExperimentExecutionAdapterResult,
): ExperimentExecutionAdapterResult {
  if (!["SUPPORTED", "FALSIFIED", "INCONCLUSIVE"].includes(raw.outcome)) {
    throw new Error("Experiment executor returned an invalid outcome");
  }
  if (typeof raw.summary !== "string" || raw.summary.trim().length === 0) {
    throw new Error("Experiment executor returned no summary");
  }
  if (!Array.isArray(raw.observations) || raw.observations.length > 50) {
    throw new Error("Experiment executor observations must be an array with at most 50 items");
  }

  const allowedKinds = new Set(ALLOWED_EVIDENCE_KINDS[plan.experimentType]);
  const targetFactors = new Set(plan.targetFactors);
  const observations: ExperimentExecutionObservation[] = [];

  for (const observation of raw.observations) {
    if (!targetFactors.has(observation.factor)) {
      throw new Error(`Experiment executor attempted to write evidence for non-target factor ${observation.factor}`);
    }
    if (!allowedKinds.has(observation.evidenceKind)) {
      throw new Error(`Evidence kind ${observation.evidenceKind} is not allowed for ${plan.experimentType}`);
    }
    if (!["SUPPORTS", "CONTRADICTS", "CONTEXT"].includes(observation.direction)) {
      throw new Error("Experiment executor returned an invalid evidence direction");
    }
    if (observation.classification !== "FACT" && observation.classification !== "INFERENCE") {
      throw new Error("Experiment execution evidence must be FACT or INFERENCE");
    }
    if (typeof observation.claim !== "string" || observation.claim.trim().length === 0) {
      throw new Error("Experiment executor returned an empty evidence claim");
    }
    observations.push({
      ...observation,
      claim: observation.claim.trim().slice(0, 2_000),
    });
  }

  if (raw.outcome === "SUPPORTED" && !observations.some((item) => item.direction === "SUPPORTS")) {
    throw new Error("SUPPORTED experiment outcome requires at least one supporting observation");
  }
  if (raw.outcome === "FALSIFIED" && !observations.some((item) => item.direction === "CONTRADICTS")) {
    throw new Error("FALSIFIED experiment outcome requires at least one contradicting observation");
  }

  const externalCostUsd = raw.externalCostUsd ?? 0;
  if (!finiteNonNegative(externalCostUsd)) {
    throw new Error("Experiment executor returned an invalid external cost");
  }
  if (externalCostUsd > AUTOMATIC_EXPERIMENT_EXTERNAL_COST_CEILING_USD) {
    throw new Error("Automatic experiment executor exceeded the zero-dollar external-service spend ceiling");
  }

  const metrics: Record<string, string | number | boolean | null> = {};
  if (raw.metrics) {
    const entries = Object.entries(raw.metrics);
    if (entries.length > 50) throw new Error("Experiment executor returned too many metrics");
    for (const [key, value] of entries) {
      if (!key.trim()) continue;
      if (value !== null && !["string", "number", "boolean"].includes(typeof value)) {
        throw new Error(`Experiment metric ${key} is not a supported primitive`);
      }
      if (typeof value === "number" && !Number.isFinite(value)) {
        throw new Error(`Experiment metric ${key} is not finite`);
      }
      metrics[key.slice(0, 120)] = typeof value === "string" ? value.slice(0, 1_000) : value;
    }
  }

  return {
    outcome: raw.outcome,
    summary: raw.summary.trim().slice(0, 2_000),
    observations,
    metrics,
    externalCostUsd,
  };
}

export async function executeRegisteredExperiment(
  context: ExperimentExecutionContext,
): Promise<{ adapterKey: string; result: ExperimentExecutionAdapterResult }> {
  const capability = experimentExecutionCapability({
    engineFamily: context.engineFamily,
    experimentType: context.plan.experimentType,
  });
  if (!capability.automaticExecutionAllowed || !capability.adapterKey) {
    throw new Error(capability.reason);
  }
  const adapter = adapters.get(capability.adapterKey);
  if (!adapter) throw new Error("Resolved experiment executor adapter is unavailable");
  const result = validateExperimentExecutionResult(context.plan, await adapter(context));
  return { adapterKey: capability.adapterKey, result };
}

export function storedExecutionStatusFromOutcome(outcome: ExperimentExecutionOutcome): ExperimentExecutionStatus {
  if (outcome === "SUPPORTED") return "COMPLETED";
  if (outcome === "FALSIFIED") return "FALSIFIED";
  return "INCONCLUSIVE";
}

export function parseStoredExperimentExecution(value: string | null): StoredExperimentExecution | null {
  if (!value) return null;
  try {
    const parsed = JSON.parse(value) as Partial<StoredExperimentExecution>;
    if (
      parsed?.schemaVersion !== 1 ||
      !parsed.plan ||
      !parsed.execution ||
      typeof parsed.execution !== "object" ||
      typeof parsed.execution.status !== "string" ||
      typeof parsed.execution.summary !== "string" ||
      !Array.isArray(parsed.execution.observations)
    ) return null;
    return parsed as StoredExperimentExecution;
  } catch {
    return null;
  }
}
