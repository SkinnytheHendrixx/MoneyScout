import type {
  BuilderTerminalOutcome,
  BuilderUsage,
  PersistedBuildContract,
  PersistedQaDefect,
} from "@workspace/db";

export type BuilderCostMode =
  "ZERO_CASH" | "METERED" | "UNKNOWN" | "GATEWAY_ENFORCED";
export type BuilderRunState =
  "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";

export type BuilderAdapterConfig = {
  provider: string;
  baseUrl: string;
  token: string | null;
  costMode: BuilderCostMode;
};

export type BuilderDispatchInput = {
  workspaceKey: string;
  buildJobId: number;
  opportunityId: number;
  builderProfile: string;
  productShape: string;
  idempotencyKey: string;
  contract: PersistedBuildContract;
  repositoryUrl?: string;
  branchName?: string;
  baseCommitSha?: string | null;
  frozenManifestFiles?: Record<string, string>;
};

export type BuilderRepairInput = {
  workspaceKey: string;
  buildJobId: number;
  opportunityId: number;
  providerRunId: string;
  idempotencyKey: string;
  repositoryUrl: string | null;
  branchName: string | null;
  defects: PersistedQaDefect[];
  acceptanceCriteria: string[];
  contract: PersistedBuildContract;
};

export type BuilderDispatchResult = {
  providerRunId: string;
  repositoryUrl: string | null;
  branchName: string | null;
  workspaceUrl: string | null;
  state: BuilderRunState;
  progressPercent: number | null;
  summary: string | null;
  externalCostCents: number;
  actualExternalCashCostCents?: number | null;
  terminalOutcome?: BuilderTerminalOutcome | null;
  resultCommitSha?: string | null;
  gatewayRunId?: number | null;
  usage?: BuilderUsage;
  costProvenance?: string;
  entitlementConsumption?: Record<string, unknown>;
  challenge?: Record<string, unknown> | null;
};

export type BuilderStatusResult = BuilderDispatchResult;

export interface BuilderAgentAdapter {
  readonly provider: string;
  readonly costMode: BuilderCostMode;
  dispatch(input: BuilderDispatchInput): Promise<BuilderDispatchResult>;
  getStatus(providerRunId: string): Promise<BuilderStatusResult>;
  repair?(input: BuilderRepairInput): Promise<BuilderDispatchResult>;
  cancel?(
    providerRunId: string,
    reason: string,
  ): Promise<BuilderDispatchResult>;
}

export function builderOutcomeDestination(
  outcome: BuilderTerminalOutcome,
): "INDEPENDENT_QA" | "ARCHITECTURE_COMPOSER" | "PRODUCT_DEFINITION" | "STOP" {
  if (outcome === "IMPLEMENTATION_READY") return "INDEPENDENT_QA";
  if (outcome === "ARCHITECTURE_CHALLENGE") return "ARCHITECTURE_COMPOSER";
  if (outcome === "PRODUCT_CONTRACT_CHALLENGE") return "PRODUCT_DEFINITION";
  return "STOP";
}

const cleanBaseUrl = (value: string): string => value.replace(/\/+$/, "");

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {};

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const progress = (value: unknown): number | null => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
};

const nonNegativeInt = (value: unknown): number => {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.max(0, Math.round(n));
};

const runState = (value: unknown): BuilderRunState => {
  const normalized = String(value ?? "").toUpperCase();
  if (
    normalized === "QUEUED" ||
    normalized === "RUNNING" ||
    normalized === "SUCCEEDED" ||
    normalized === "FAILED" ||
    normalized === "CANCELLED"
  ) {
    return normalized;
  }
  throw new Error(
    `BUILDER_ADAPTER_INVALID_RESPONSE: unsupported state ${String(value)}`,
  );
};

const isTerminal = (value: BuilderRunState): boolean =>
  value === "SUCCEEDED" || value === "FAILED" || value === "CANCELLED";

function parseResult(value: unknown): BuilderDispatchResult {
  const object = asObject(value);
  const providerRunId = text(
    object.provider_run_id ?? object.providerRunId ?? object.id,
  );
  if (!providerRunId) {
    throw new Error(
      "BUILDER_ADAPTER_INVALID_RESPONSE: provider run id is required",
    );
  }
  const rawOutcome = text(object.terminal_outcome ?? object.terminalOutcome);
  const allowedOutcomes: BuilderTerminalOutcome[] = [
    "IMPLEMENTATION_READY",
    "ARCHITECTURE_CHALLENGE",
    "PRODUCT_CONTRACT_CHALLENGE",
    "DEPENDENCY_BLOCKED",
    "RESOURCE_BLOCKED",
    "PROVIDER_FAILURE",
    "CANCELLED",
  ];
  const terminalOutcome =
    rawOutcome && allowedOutcomes.includes(rawOutcome as BuilderTerminalOutcome)
      ? (rawOutcome as BuilderTerminalOutcome)
      : null;
  const usageObject = asObject(object.usage);
  const nullableInt = (value: unknown): number | null => {
    const number = Number(value);
    return Number.isFinite(number) && number >= 0 ? Math.round(number) : null;
  };
  const actualCostValue =
    object.actual_external_cash_cost_cents ??
    object.actualExternalCashCostCents ??
    object.external_cost_cents ??
    object.externalCostCents;
  return {
    providerRunId,
    repositoryUrl: text(object.repository_url ?? object.repositoryUrl),
    branchName: text(object.branch_name ?? object.branchName),
    workspaceUrl: text(object.workspace_url ?? object.workspaceUrl),
    state: runState(object.state ?? object.status),
    progressPercent: progress(
      object.progress_percent ?? object.progressPercent,
    ),
    summary: text(object.summary ?? object.message),
    externalCostCents: nonNegativeInt(
      object.external_cost_cents ?? object.externalCostCents,
    ),
    actualExternalCashCostCents:
      actualCostValue == null ? null : nullableInt(actualCostValue),
    terminalOutcome,
    resultCommitSha: text(object.result_commit_sha ?? object.resultCommitSha),
    gatewayRunId: nullableInt(object.gateway_run_id ?? object.gatewayRunId),
    usage: {
      model: text(usageObject.model),
      inputTokens: nullableInt(
        usageObject.input_tokens ?? usageObject.inputTokens,
      ),
      cachedInputTokens: nullableInt(
        usageObject.cached_input_tokens ?? usageObject.cachedInputTokens,
      ),
      outputTokens: nullableInt(
        usageObject.output_tokens ?? usageObject.outputTokens,
      ),
      reasoningTokens: nullableInt(
        usageObject.reasoning_tokens ?? usageObject.reasoningTokens,
      ),
      durationMs: nullableInt(
        usageObject.duration_ms ?? usageObject.durationMs,
      ),
      entitlementUnits: nullableInt(
        usageObject.entitlement_units ?? usageObject.entitlementUnits,
      ),
    },
    costProvenance:
      text(object.cost_provenance ?? object.costProvenance) ?? "UNKNOWN",
    entitlementConsumption: asObject(
      object.entitlement_consumption ?? object.entitlementConsumption,
    ),
    challenge: Object.keys(asObject(object.challenge)).length
      ? asObject(object.challenge)
      : null,
  };
}

export function configuredBuilderAdapter(): BuilderAgentAdapter | null {
  const baseUrl = process.env.MONEY_SCOUT_BUILDER_ADAPTER_URL?.trim();
  if (!baseUrl) return null;
  const provider =
    process.env.MONEY_SCOUT_BUILDER_ADAPTER_PROVIDER?.trim() || "GENERIC_HTTP";
  const rawCost =
    process.env.MONEY_SCOUT_BUILDER_ADAPTER_COST_MODE?.trim().toUpperCase();
  const costMode: BuilderCostMode =
    rawCost === "METERED"
      ? "METERED"
      : rawCost === "ZERO_CASH"
        ? "ZERO_CASH"
        : "UNKNOWN";
  const config: BuilderAdapterConfig = {
    provider,
    baseUrl: cleanBaseUrl(baseUrl),
    token: process.env.MONEY_SCOUT_BUILDER_ADAPTER_TOKEN?.trim() || null,
    costMode,
  };
  return createHttpBuilderAdapter(config);
}

export function createHttpBuilderAdapter(
  config: BuilderAdapterConfig,
): BuilderAgentAdapter {
  const pendingRepairCosts = new Map<string, number>();
  const headers = (): Record<string, string> => ({
    "content-type": "application/json",
    ...(config.token ? { authorization: `Bearer ${config.token}` } : {}),
  });

  const parseHttpResult = async (
    response: Response,
    operation: string,
  ): Promise<BuilderDispatchResult> => {
    const raw = await response.text();
    if (!response.ok) {
      throw new Error(
        `BUILDER_ADAPTER_HTTP_${response.status}: ${operation}: ${raw.slice(0, 1_000)}`,
      );
    }
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(
        `BUILDER_ADAPTER_INVALID_RESPONSE: ${operation} response was not JSON`,
      );
    }
    return parseResult(parsed);
  };

  return {
    provider: config.provider,
    costMode: config.costMode,
    async dispatch(input) {
      const response = await fetch(`${config.baseUrl}/v1/builds`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          workspace_key: input.workspaceKey,
          build_job_id: input.buildJobId,
          opportunity_id: input.opportunityId,
          idempotency_key: input.idempotencyKey,
          builder_profile: input.builderProfile,
          product_shape: input.productShape,
          build_contract: input.contract,
          repository_url: input.repositoryUrl,
          branch_name: input.branchName,
          base_commit_sha: input.baseCommitSha,
          frozen_manifest_files: input.frozenManifestFiles,
          autonomy: {
            external_publication_allowed: false,
            customer_charging_allowed: false,
            domain_purchase_allowed: false,
            production_credentials_allowed: false,
            outbound_allowed: false,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      return parseHttpResult(response, "dispatch");
    },
    async getStatus(providerRunId) {
      const response = await fetch(
        `${config.baseUrl}/v1/builds/${encodeURIComponent(providerRunId)}`,
        {
          method: "GET",
          headers: headers(),
          signal: AbortSignal.timeout(20_000),
        },
      );
      const result = await parseHttpResult(response, "status");
      const cachedRepairCost = pendingRepairCosts.get(providerRunId) ?? 0;
      if (!isTerminal(result.state)) {
        if (result.externalCostCents > cachedRepairCost) {
          pendingRepairCosts.set(providerRunId, result.externalCostCents);
        }
        return { ...result, externalCostCents: 0 };
      }
      if (cachedRepairCost > 0) pendingRepairCosts.delete(providerRunId);
      return {
        ...result,
        externalCostCents: Math.max(result.externalCostCents, cachedRepairCost),
      };
    },
    async repair(input) {
      const response = await fetch(
        `${config.baseUrl}/v1/builds/${encodeURIComponent(input.providerRunId)}/repairs`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({
            workspace_key: input.workspaceKey,
            build_job_id: input.buildJobId,
            opportunity_id: input.opportunityId,
            idempotency_key: input.idempotencyKey,
            repository_url: input.repositoryUrl,
            branch_name: input.branchName,
            defects: input.defects,
            acceptance_criteria: input.acceptanceCriteria,
            build_contract: input.contract,
            autonomy: {
              external_publication_allowed: false,
              customer_charging_allowed: false,
              domain_purchase_allowed: false,
              production_credentials_allowed: false,
              outbound_allowed: false,
              scope: "repair_only",
            },
          }),
          signal: AbortSignal.timeout(30_000),
        },
      );
      const result = await parseHttpResult(response, "repair");
      if (result.externalCostCents > 0) {
        pendingRepairCosts.set(result.providerRunId, result.externalCostCents);
      }
      if (isTerminal(result.state) && result.externalCostCents > 0) {
        return {
          ...result,
          state: "RUNNING",
          progressPercent: result.progressPercent ?? 99,
          summary: result.summary
            ? `${result.summary} Final provider cost will be reconciled from durable status before closing the repair.`
            : "Repair completed; final provider cost will be reconciled from durable status before closing the repair.",
          externalCostCents: 0,
        };
      }
      return { ...result, externalCostCents: 0 };
    },
    async cancel(providerRunId, reason) {
      const response = await fetch(
        `${config.baseUrl}/v1/builds/${encodeURIComponent(providerRunId)}/cancel`,
        {
          method: "POST",
          headers: headers(),
          body: JSON.stringify({ reason }),
          signal: AbortSignal.timeout(20_000),
        },
      );
      return parseHttpResult(response, "cancel");
    },
  };
}
