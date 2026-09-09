import {
  registerExperimentExecutorAdapter,
  type ExperimentExecutionAdapterResult,
  type ExperimentExecutionContext,
  type ExperimentExecutionObservation,
} from "./experiment-executor";

export const APIFY_EXPERIMENT_ENGINE_FAMILY = "APIFY_STORE_DISCOVERY";
export const APIFY_STORE_API_URL = "https://api.apify.com/v2/store";
export const APIFY_TECHNICAL_SAMPLE_LIMIT = 25;
export const APIFY_SOAK_PROBE_COUNT = 3;
export const APIFY_READ_TIMEOUT_MS = 10_000;
export const APIFY_SOAK_PACING_MS = 250;

export type ApifyAdapterDependencies = {
  fetchImpl?: typeof fetch;
  sleep?: (milliseconds: number) => Promise<void>;
  now?: () => number;
};

type JsonObject = Record<string, unknown>;

type ApifyStoreProbe = {
  total: number;
  itemCount: number;
  activeActorCount: number;
  recentActorCount: number;
  pricingModels: string[];
  actorKeys: string[];
  elapsedMs: number;
};

const sleepDefault = (milliseconds: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, milliseconds));

const objectValue = (value: unknown): JsonObject | null =>
  value && typeof value === "object" && !Array.isArray(value) ? value as JsonObject : null;

const numberValue = (value: unknown): number | null => {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() && Number.isFinite(Number(value))) return Number(value);
  return null;
};

const stringValue = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

export function apifyCategoryFromOpportunitySource(sourceUrl: string): string | null {
  try {
    const url = new URL(sourceUrl);
    const hostname = url.hostname.toLowerCase();
    if (hostname !== "apify.com" && hostname !== "www.apify.com") return null;
    if (!url.pathname.startsWith("/store")) return null;
    const category = url.searchParams.get("category")?.trim();
    return category || null;
  } catch {
    return null;
  }
}

function parseStoreProbe(raw: unknown, elapsedMs: number): ApifyStoreProbe {
  const root = objectValue(raw) ?? {};
  const data = objectValue(root.data) ?? root;
  const items = Array.isArray(data.items) ? data.items : null;
  const total = numberValue(data.total);
  if (!items || total == null || total < 0) {
    throw new Error("Apify Store probe returned malformed public metadata");
  }

  let activeActorCount = 0;
  let recentActorCount = 0;
  const pricingModels = new Set<string>();
  const actorKeys: string[] = [];
  const ninetyDaysAgo = Date.now() - 90 * 24 * 60 * 60 * 1_000;

  for (const item of items) {
    const actor = objectValue(item);
    if (!actor) continue;
    const stats = objectValue(actor.stats) ?? {};
    const totalRuns = numberValue(stats.totalRuns ?? actor.totalRuns) ?? 0;
    const lastRunStartedAt = stringValue(stats.lastRunStartedAt ?? actor.lastRunStartedAt);
    const lastRunTime = lastRunStartedAt ? Date.parse(lastRunStartedAt) : Number.NaN;
    if (totalRuns > 0 || Number.isFinite(lastRunTime)) activeActorCount += 1;
    if (Number.isFinite(lastRunTime) && lastRunTime >= ninetyDaysAgo) recentActorCount += 1;

    const pricing = objectValue(actor.currentPricingInfo ?? actor.pricing);
    const pricingModel = stringValue(pricing?.pricingModel ?? pricing?.model ?? actor.pricingModel);
    if (pricingModel) pricingModels.add(pricingModel);

    const id = stringValue(actor.id ?? actor.actorId);
    const username = stringValue(actor.username);
    const name = stringValue(actor.name);
    actorKeys.push(id ?? [username, name].filter(Boolean).join("/") ?? "unknown");
  }

  return {
    total,
    itemCount: items.length,
    activeActorCount,
    recentActorCount,
    pricingModels: [...pricingModels].sort(),
    actorKeys: actorKeys.filter(Boolean).slice(0, APIFY_TECHNICAL_SAMPLE_LIMIT),
    elapsedMs,
  };
}

async function fetchPublicStoreProbe(
  category: string,
  dependencies: ApifyAdapterDependencies,
): Promise<ApifyStoreProbe> {
  const fetchImpl = dependencies.fetchImpl ?? fetch;
  const now = dependencies.now ?? Date.now;
  const url = new URL(APIFY_STORE_API_URL);
  url.searchParams.set("category", category);
  url.searchParams.set("sortBy", "popularity");
  url.searchParams.set("limit", String(APIFY_TECHNICAL_SAMPLE_LIMIT));
  url.searchParams.set("offset", "0");
  url.searchParams.set("responseFormat", "full");

  const started = now();
  const response = await fetchImpl(url.toString(), {
    method: "GET",
    headers: { accept: "application/json" },
    redirect: "error",
    signal: AbortSignal.timeout(APIFY_READ_TIMEOUT_MS),
  });
  const elapsedMs = Math.max(0, now() - started);
  if (!response.ok) {
    throw new Error(`Apify Store public metadata probe failed with HTTP ${response.status}`);
  }
  return parseStoreProbe(await response.json(), elapsedMs);
}

const targeted = (
  context: ExperimentExecutionContext,
  factor: ExperimentExecutionObservation["factor"],
): boolean => context.plan.targetFactors.includes(factor);

function technicalSpikeAdapter(dependencies: ApifyAdapterDependencies) {
  return async (context: ExperimentExecutionContext): Promise<ExperimentExecutionAdapterResult> => {
    const category = apifyCategoryFromOpportunitySource(context.sourceUrl);
    if (!category) {
      return {
        outcome: "INCONCLUSIVE",
        summary: "The Apify adapter could not identify a Store category from the opportunity source URL, so it refused to infer technical feasibility from an unrelated endpoint.",
        observations: [],
        metrics: { category_resolved: false },
        externalCostUsd: 0,
      };
    }

    try {
      const probe = await fetchPublicStoreProbe(category, dependencies);
      const observations: ExperimentExecutionObservation[] = [];
      if (targeted(context, "build_complexity_technical_uncertainty") && probe.activeActorCount >= 3) {
        observations.push({
          factor: "build_complexity_technical_uncertainty",
          direction: "SUPPORTS",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "INFERENCE",
          claim: `A zero-cost read-only Apify Store probe returned ${probe.itemCount} runnable public Actors in category ${category}, including ${probe.activeActorCount} with observed run activity. This supports platform-level feasibility for comparable Actor workloads, but does not prove the target-specific implementation, anti-bot path, or production architecture.`,
        });
      }
      if (targeted(context, "falsifiability_feedback_velocity")) {
        observations.push({
          factor: "falsifiability_feedback_velocity",
          direction: "SUPPORTS",
          evidenceKind: "TIME_TO_SIGNAL",
          classification: "INFERENCE",
          claim: `The public Apify Store metadata path for category ${category} returned within ${probe.elapsedMs} ms and exposed current Actor activity without authentication or paid execution. This supports fast platform-level feedback, not end-product demand or technical correctness.`,
        });
      }

      return {
        outcome: observations.some((item) => item.direction === "SUPPORTS") ? "SUPPORTED" : "INCONCLUSIVE",
        summary: observations.length
          ? "The Apify read-only technical preflight found current public evidence that the platform supports comparable Actor workloads. Target-specific implementation risk remains outside this probe."
          : "The Apify public metadata probe completed, but the plan did not target a factor this adapter can resolve safely.",
        observations,
        metrics: {
          category,
          provider_total: probe.total,
          sampled_actors: probe.itemCount,
          actors_with_run_activity: probe.activeActorCount,
          actors_with_run_in_last_90_days: probe.recentActorCount,
          pricing_model_count: probe.pricingModels.length,
          request_elapsed_ms: probe.elapsedMs,
          external_write_requests: 0,
          actor_runs_started: 0,
        },
        externalCostUsd: 0,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown Apify Store probe failure";
      const observations: ExperimentExecutionObservation[] = [];
      if (targeted(context, "build_complexity_technical_uncertainty")) {
        observations.push({
          factor: "build_complexity_technical_uncertainty",
          direction: "CONTEXT",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "FACT",
          claim: `The bounded read-only Apify Store technical preflight did not complete: ${message}. One metadata-path failure is recorded as context only and is not sufficient to falsify the build thesis.`,
        });
      }
      return {
        outcome: "INCONCLUSIVE",
        summary: "The bounded Apify technical preflight failed, but a single public metadata failure is not treated as proof that the opportunity is technically infeasible.",
        observations,
        metrics: { category, probe_completed: false, external_write_requests: 0, actor_runs_started: 0 },
        externalCostUsd: 0,
      };
    }
  };
}

function dependencySoakAdapter(dependencies: ApifyAdapterDependencies) {
  return async (context: ExperimentExecutionContext): Promise<ExperimentExecutionAdapterResult> => {
    const category = apifyCategoryFromOpportunitySource(context.sourceUrl);
    if (!category) {
      return {
        outcome: "INCONCLUSIVE",
        summary: "The Apify dependency soak could not resolve a Store category and refused to probe an unrelated endpoint.",
        observations: [],
        metrics: { category_resolved: false },
        externalCostUsd: 0,
      };
    }

    const sleep = dependencies.sleep ?? sleepDefault;
    const successes: ApifyStoreProbe[] = [];
    const failures: string[] = [];
    for (let index = 0; index < APIFY_SOAK_PROBE_COUNT; index += 1) {
      if (index > 0) await sleep(APIFY_SOAK_PACING_MS);
      try {
        successes.push(await fetchPublicStoreProbe(category, dependencies));
      } catch (error) {
        failures.push(error instanceof Error ? error.message : "Unknown Apify Store probe failure");
      }
    }

    const observations: ExperimentExecutionObservation[] = [];
    const targetOperating = targeted(context, "operating_maintenance_burden");
    const targetBuild = targeted(context, "build_complexity_technical_uncertainty");
    const targetFeedback = targeted(context, "falsifiability_feedback_velocity");

    if (successes.length === APIFY_SOAK_PROBE_COUNT) {
      if (targetOperating) {
        observations.push({
          factor: "operating_maintenance_burden",
          direction: "SUPPORTS",
          evidenceKind: "MAINTENANCE_HISTORY",
          classification: "INFERENCE",
          claim: `The Apify Store public metadata dependency completed ${APIFY_SOAK_PROBE_COUNT}/${APIFY_SOAK_PROBE_COUNT} bounded read-only probes for category ${category} without an HTTP or schema failure. This reduces concern about the Apify metadata path itself, but does not establish target-site stability or long-term maintenance burden.`,
        });
      }
      if (targetBuild) {
        observations.push({
          factor: "build_complexity_technical_uncertainty",
          direction: "SUPPORTS",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "INFERENCE",
          claim: `The Apify Store dependency returned schema-valid public Actor metadata on all ${APIFY_SOAK_PROBE_COUNT} bounded probes. This supports availability of the Apify discovery dependency only; it does not prove the future Actor's target integration.`,
        });
      }
      if (targetFeedback) {
        observations.push({
          factor: "falsifiability_feedback_velocity",
          direction: "SUPPORTS",
          evidenceKind: "TIME_TO_SIGNAL",
          classification: "INFERENCE",
          claim: `All ${APIFY_SOAK_PROBE_COUNT} zero-cost Apify metadata probes completed during the bounded soak, providing immediate observable platform feedback without an Actor run or paid API call.`,
        });
      }
    } else if (successes.length <= 1 && failures.length >= 2) {
      if (targetOperating) {
        observations.push({
          factor: "operating_maintenance_burden",
          direction: "CONTRADICTS",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "FACT",
          claim: `The bounded Apify Store dependency soak failed on ${failures.length}/${APIFY_SOAK_PROBE_COUNT} read-only probes for category ${category}. This is direct evidence of instability in the Apify metadata dependency during the test window, though it does not establish long-term failure rates.`,
        });
      }
      if (targetBuild) {
        observations.push({
          factor: "build_complexity_technical_uncertainty",
          direction: "CONTRADICTS",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "FACT",
          claim: `Only ${successes.length}/${APIFY_SOAK_PROBE_COUNT} bounded read-only Apify Store dependency probes completed successfully for category ${category}. The platform metadata path was not reliably available during the spike window.`,
        });
      }
    } else {
      const targetFactor = targetOperating
        ? "operating_maintenance_burden"
        : targetBuild
          ? "build_complexity_technical_uncertainty"
          : null;
      if (targetFactor) {
        observations.push({
          factor: targetFactor,
          direction: "CONTEXT",
          evidenceKind: "TECH_DEPENDENCY",
          classification: "FACT",
          claim: `The bounded Apify Store dependency soak produced mixed results: ${successes.length} successful and ${failures.length} failed probe(s). Mixed short-window evidence is preserved as context rather than converted into a pass or fatal conclusion.`,
        });
      }
    }

    const elapsedValues = successes.map((probe) => probe.elapsedMs);
    const totals = successes.map((probe) => probe.total);
    const outcome =
      observations.some((item) => item.direction === "CONTRADICTS")
        ? "FALSIFIED"
        : observations.some((item) => item.direction === "SUPPORTS") && failures.length === 0
          ? "SUPPORTED"
          : "INCONCLUSIVE";

    return {
      outcome,
      summary:
        outcome === "SUPPORTED"
          ? "The bounded read-only Apify dependency soak completed cleanly. The result is limited to the Apify metadata path and does not stand in for target-site reliability."
          : outcome === "FALSIFIED"
            ? "The bounded Apify dependency soak observed repeated read-path failures during the test window."
            : "The bounded Apify dependency soak was mixed or did not target a factor that can be resolved safely from this read-only probe.",
      observations,
      metrics: {
        category,
        probe_count: APIFY_SOAK_PROBE_COUNT,
        successful_probes: successes.length,
        failed_probes: failures.length,
        min_elapsed_ms: elapsedValues.length ? Math.min(...elapsedValues) : null,
        max_elapsed_ms: elapsedValues.length ? Math.max(...elapsedValues) : null,
        min_provider_total: totals.length ? Math.min(...totals) : null,
        max_provider_total: totals.length ? Math.max(...totals) : null,
        external_write_requests: 0,
        actor_runs_started: 0,
      },
      externalCostUsd: 0,
    };
  };
}

export function registerApifyExperimentAdapters(dependencies: ApifyAdapterDependencies = {}): void {
  registerExperimentExecutorAdapter(
    APIFY_EXPERIMENT_ENGINE_FAMILY,
    "TECHNICAL_SPIKE",
    technicalSpikeAdapter(dependencies),
  );
  registerExperimentExecutorAdapter(
    APIFY_EXPERIMENT_ENGINE_FAMILY,
    "DEPENDENCY_SOAK_TEST",
    dependencySoakAdapter(dependencies),
  );
  // UNIT_COST_BENCHMARK intentionally remains unregistered. A truthful Apify unit-cost benchmark
  // requires executing a representative Actor workload and observing platform/compute usage. That can
  // consume account credits or create billable usage, so it cannot satisfy Task #51's $0 automatic
  // external-service spend invariant without a separately authorized budgeted adapter.
}
