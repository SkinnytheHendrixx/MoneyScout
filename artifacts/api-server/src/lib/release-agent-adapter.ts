import type { PersistedReleasePlan, ReleaseTargetKind } from "@workspace/db";

export type ReleaseCostMode = "ZERO_CASH" | "METERED";
export type ReleaseStage = "PREVIEW" | "PRODUCTION";
export type ReleaseRunState = "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED";
export type ReleaseVisibility = "PRIVATE" | "PUBLIC" | "UNKNOWN";

export type ReleaseAdapterConfig = {
  provider: string;
  baseUrl: string;
  token: string | null;
  costMode: ReleaseCostMode;
};

export type ReleaseDispatchInput = {
  releaseJobId: number;
  buildJobId: number;
  opportunityId: number;
  stage: ReleaseStage;
  targetKind: ReleaseTargetKind;
  idempotencyKey: string;
  repositoryUrl: string;
  branchName: string;
  plan: PersistedReleasePlan;
};

export type ReleaseResult = {
  providerRunId: string;
  state: ReleaseRunState;
  stage: ReleaseStage;
  url: string | null;
  visibility: ReleaseVisibility;
  healthChecksPassed: boolean | null;
  retryable: boolean;
  summary: string | null;
  externalCostCents: number;
  metadata: Record<string, unknown>;
};

export interface ReleaseAgentAdapter {
  readonly provider: string;
  readonly costMode: ReleaseCostMode;
  dispatch(input: ReleaseDispatchInput): Promise<ReleaseResult>;
  getStatus(providerRunId: string): Promise<ReleaseResult>;
}

const cleanBaseUrl = (value: string): string => value.replace(/\/+$/, "");
const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;
const bool = (value: unknown): boolean | null =>
  typeof value === "boolean" ? value : null;
const nonNegativeInt = (value: unknown): number => {
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 0;
};

function runState(value: unknown): ReleaseRunState {
  const normalized = String(value ?? "").toUpperCase();
  if (["QUEUED", "RUNNING", "SUCCEEDED", "FAILED", "CANCELLED"].includes(normalized)) {
    return normalized as ReleaseRunState;
  }
  throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: unsupported state ${String(value)}`);
}

function stage(value: unknown): ReleaseStage {
  const normalized = String(value ?? "").toUpperCase();
  if (normalized === "PREVIEW" || normalized === "PRODUCTION") return normalized;
  throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: unsupported stage ${String(value)}`);
}

function visibility(value: unknown): ReleaseVisibility {
  const normalized = String(value ?? "UNKNOWN").toUpperCase();
  if (normalized === "PRIVATE" || normalized === "PUBLIC" || normalized === "UNKNOWN") return normalized;
  return "UNKNOWN";
}

function parseResult(value: unknown): ReleaseResult {
  const object = asObject(value);
  const providerRunId = text(object.provider_run_id ?? object.providerRunId ?? object.id);
  if (!providerRunId) throw new Error("RELEASE_ADAPTER_INVALID_RESPONSE: provider run id is required");
  return {
    providerRunId,
    state: runState(object.state ?? object.status),
    stage: stage(object.stage),
    url: text(object.url ?? object.release_url ?? object.releaseUrl),
    visibility: visibility(object.visibility),
    healthChecksPassed: bool(object.health_checks_passed ?? object.healthChecksPassed),
    retryable: object.retryable === true,
    summary: text(object.summary ?? object.message),
    externalCostCents: nonNegativeInt(object.external_cost_cents ?? object.externalCostCents),
    metadata: asObject(object.metadata),
  };
}

export function configuredReleaseAdapter(): ReleaseAgentAdapter | null {
  const baseUrl = process.env.MONEY_SCOUT_RELEASE_ADAPTER_URL?.trim();
  if (!baseUrl) return null;
  const provider = process.env.MONEY_SCOUT_RELEASE_ADAPTER_PROVIDER?.trim() || "GENERIC_HTTP_RELEASE";
  const rawCost = process.env.MONEY_SCOUT_RELEASE_ADAPTER_COST_MODE?.trim().toUpperCase();
  const costMode: ReleaseCostMode = rawCost === "METERED" ? "METERED" : "ZERO_CASH";
  return createHttpReleaseAdapter({
    provider,
    baseUrl: cleanBaseUrl(baseUrl),
    token: process.env.MONEY_SCOUT_RELEASE_ADAPTER_TOKEN?.trim() || null,
    costMode,
  });
}

export function createHttpReleaseAdapter(config: ReleaseAdapterConfig): ReleaseAgentAdapter {
  const headers = (): Record<string, string> => ({
    "content-type": "application/json",
    ...(config.token ? { authorization: `Bearer ${config.token}` } : {}),
  });

  const parseHttpResult = async (response: Response, operation: string): Promise<ReleaseResult> => {
    const raw = await response.text();
    if (!response.ok) throw new Error(`RELEASE_ADAPTER_HTTP_${response.status}: ${operation}: ${raw.slice(0, 1_000)}`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: ${operation} response was not JSON`);
    }
    return parseResult(parsed);
  };

  return {
    provider: config.provider,
    costMode: config.costMode,
    async dispatch(input) {
      const response = await fetch(`${config.baseUrl}/v1/releases`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          release_job_id: input.releaseJobId,
          build_job_id: input.buildJobId,
          opportunity_id: input.opportunityId,
          stage: input.stage,
          target_kind: input.targetKind,
          idempotency_key: input.idempotencyKey,
          repository_url: input.repositoryUrl,
          branch_name: input.branchName,
          release_plan: input.plan,
          safety: input.stage === "PREVIEW"
            ? {
                required_visibility: "PRIVATE",
                public_release_allowed: false,
                customer_charging_allowed: false,
                custom_domain_required: false,
                outbound_allowed: false,
              }
            : {
                required_visibility: "PUBLIC",
                public_release_allowed: true,
                customer_charging_allowed: false,
                custom_domain_required: false,
                outbound_allowed: false,
              },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      return parseHttpResult(response, "dispatch");
    },
    async getStatus(providerRunId) {
      const response = await fetch(`${config.baseUrl}/v1/releases/${encodeURIComponent(providerRunId)}`, {
        method: "GET",
        headers: headers(),
        signal: AbortSignal.timeout(20_000),
      });
      return parseHttpResult(response, "status");
    },
  };
}
