import type {
  PersistedBuildContract,
  PersistedQaAcceptanceResult,
  PersistedQaDefect,
} from "@workspace/db";

export type QaCostMode = "ZERO_CASH" | "METERED";
export type QaRunState = "QUEUED" | "RUNNING" | "PASSED" | "FAILED" | "BLOCKED" | "CANCELLED";

export type QaAdapterConfig = {
  provider: string;
  baseUrl: string;
  token: string | null;
  costMode: QaCostMode;
};

export type QaDispatchInput = {
  qaRunId: number;
  buildJobId: number;
  opportunityId: number;
  roundNumber: number;
  idempotencyKey: string;
  repositoryUrl: string;
  branchName: string;
  acceptanceCriteria: string[];
  contract: PersistedBuildContract;
};

export type QaResult = {
  providerRunId: string;
  state: QaRunState;
  progressPercent: number | null;
  summary: string | null;
  repositoryUrl: string | null;
  branchName: string | null;
  acceptanceResults: PersistedQaAcceptanceResult[];
  defects: PersistedQaDefect[];
  baselineChecksPassed: boolean | null;
  requiresHumanAction: boolean;
  humanAction: Record<string, unknown> | null;
  externalCostCents: number;
  metadata: Record<string, unknown>;
};

export interface QaAgentAdapter {
  readonly provider: string;
  readonly costMode: QaCostMode;
  dispatch(input: QaDispatchInput): Promise<QaResult>;
  getStatus(providerRunId: string): Promise<QaResult>;
}

export const QA_BASELINE_CHECKS = [
  "Project dependencies can be restored or installed reproducibly.",
  "The project builds, typechecks, or performs its platform-equivalent static verification without blocking errors.",
  "Automated tests or equivalent executable checks pass for the implemented scope.",
  "No critical secret exposure, destructive side effect, or forbidden production action is present in the tested path.",
  "The implementation is runnable from the documented workspace without hidden manual repair steps.",
] as const;

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
const progress = (value: unknown): number | null => {
  const n = Number(value);
  if (!Number.isFinite(n)) return null;
  return Math.max(0, Math.min(100, Math.round(n)));
};

function state(value: unknown): QaRunState {
  const normalized = String(value ?? "").toUpperCase();
  if (["QUEUED", "RUNNING", "PASSED", "FAILED", "BLOCKED", "CANCELLED"].includes(normalized)) {
    return normalized as QaRunState;
  }
  throw new Error(`QA_ADAPTER_INVALID_RESPONSE: unsupported state ${String(value)}`);
}

function acceptanceResults(value: unknown): PersistedQaAcceptanceResult[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item) => {
    const object = asObject(item);
    const criterion = text(object.criterion ?? object.acceptance_criterion);
    const rawStatus = String(object.status ?? "").toUpperCase();
    if (!criterion || !["PASS", "FAIL", "UNKNOWN"].includes(rawStatus)) return [];
    return [{
      criterion: criterion.slice(0, 2_000),
      status: rawStatus as PersistedQaAcceptanceResult["status"],
      evidence: text(object.evidence)?.slice(0, 4_000) ?? null,
    }];
  });
}

function defects(value: unknown): PersistedQaDefect[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((item, index) => {
    const object = asObject(item);
    const summary = text(object.summary ?? object.message);
    if (!summary) return [];
    const rawSeverity = String(object.severity ?? "MEDIUM").toUpperCase();
    const severity = ["CRITICAL", "HIGH", "MEDIUM", "LOW"].includes(rawSeverity)
      ? rawSeverity as PersistedQaDefect["severity"]
      : "MEDIUM";
    return [{
      key: (text(object.key ?? object.code) ?? `QA_DEFECT_${index + 1}`).slice(0, 160),
      category: (text(object.category) ?? "UNKNOWN").toUpperCase().slice(0, 120),
      severity,
      summary: summary.slice(0, 2_000),
      evidence: text(object.evidence)?.slice(0, 4_000) ?? null,
      repairGuidance: text(object.repair_guidance ?? object.repairGuidance)?.slice(0, 4_000) ?? null,
      humanOnly: object.human_only === true || object.humanOnly === true,
    }];
  });
}

function parseResult(value: unknown): QaResult {
  const object = asObject(value);
  const providerRunId = text(object.provider_run_id ?? object.providerRunId ?? object.id);
  if (!providerRunId) throw new Error("QA_ADAPTER_INVALID_RESPONSE: provider run id is required");
  const rawMetadata = asObject(object.metadata);
  return {
    providerRunId,
    state: state(object.state ?? object.status),
    progressPercent: progress(object.progress_percent ?? object.progressPercent),
    summary: text(object.summary ?? object.message),
    repositoryUrl: text(object.repository_url ?? object.repositoryUrl),
    branchName: text(object.branch_name ?? object.branchName),
    acceptanceResults: acceptanceResults(object.acceptance_results ?? object.acceptanceResults),
    defects: defects(object.defects),
    baselineChecksPassed: bool(object.baseline_checks_passed ?? object.baselineChecksPassed),
    requiresHumanAction: object.requires_human_action === true || object.requiresHumanAction === true,
    humanAction: object.human_action && typeof object.human_action === "object" && !Array.isArray(object.human_action)
      ? object.human_action as Record<string, unknown>
      : null,
    externalCostCents: nonNegativeInt(object.external_cost_cents ?? object.externalCostCents),
    metadata: rawMetadata,
  };
}

function reconcileTerminalCost(result: QaResult): QaResult {
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    return { ...result, externalCostCents: 0 };
  }
  return result;
}

export function configuredQaAdapter(): QaAgentAdapter | null {
  const baseUrl = process.env.MONEY_SCOUT_QA_ADAPTER_URL?.trim();
  if (!baseUrl) return null;
  const provider = process.env.MONEY_SCOUT_QA_ADAPTER_PROVIDER?.trim() || "GENERIC_HTTP_QA";
  const rawCost = process.env.MONEY_SCOUT_QA_ADAPTER_COST_MODE?.trim().toUpperCase();
  const costMode: QaCostMode = rawCost === "METERED" ? "METERED" : "ZERO_CASH";
  return createHttpQaAdapter({
    provider,
    baseUrl: cleanBaseUrl(baseUrl),
    token: process.env.MONEY_SCOUT_QA_ADAPTER_TOKEN?.trim() || null,
    costMode,
  });
}

export function createHttpQaAdapter(config: QaAdapterConfig): QaAgentAdapter {
  const headers = (): Record<string, string> => ({
    "content-type": "application/json",
    ...(config.token ? { authorization: `Bearer ${config.token}` } : {}),
  });

  const parseHttpResult = async (response: Response, operation: string): Promise<QaResult> => {
    const raw = await response.text();
    if (!response.ok) throw new Error(`QA_ADAPTER_HTTP_${response.status}: ${operation}: ${raw.slice(0, 1_000)}`);
    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(`QA_ADAPTER_INVALID_RESPONSE: ${operation} response was not JSON`);
    }
    return reconcileTerminalCost(parseResult(parsed));
  };

  return {
    provider: config.provider,
    costMode: config.costMode,
    async dispatch(input) {
      const response = await fetch(`${config.baseUrl}/v1/qa-runs`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          qa_run_id: input.qaRunId,
          build_job_id: input.buildJobId,
          opportunity_id: input.opportunityId,
          round_number: input.roundNumber,
          idempotency_key: input.idempotencyKey,
          repository_url: input.repositoryUrl,
          branch_name: input.branchName,
          acceptance_criteria: input.acceptanceCriteria,
          baseline_checks: QA_BASELINE_CHECKS,
          build_contract: input.contract,
          independence_requirement: "Do not trust the builder's success claim. Verify executable evidence independently.",
          autonomy: {
            read_and_test_only: true,
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
      const response = await fetch(`${config.baseUrl}/v1/qa-runs/${encodeURIComponent(providerRunId)}`, {
        method: "GET",
        headers: headers(),
        signal: AbortSignal.timeout(20_000),
      });
      return parseHttpResult(response, "status");
    },
  };
}
