import type {
  AssetObservationType,
  AssetTelemetryCoverageKind,
  PersistedAssetTelemetryCoverage,
} from "@workspace/db";

export type AssetTelemetryCostMode = "ZERO_CASH" | "METERED";

export type AssetTelemetryAdapterConfig = {
  provider: string;
  baseUrl: string;
  token: string | null;
  costMode: AssetTelemetryCostMode;
};

export type AssetTelemetryObservation = {
  eventId: string;
  observationType: AssetObservationType;
  amountCents: number | null;
  quantity: number | null;
  unit: string | null;
  externalReference: string | null;
  observedAt: Date;
  metadata: Record<string, unknown>;
};

export type AssetTelemetryCollectInput = {
  assetId: number;
  assetKey: string;
  opportunityId: number;
  productionUrl: string;
  cursor: string | null;
  since: Date;
  idempotencyKey: string;
};

export type AssetTelemetryResult = {
  cursor: string | null;
  observations: AssetTelemetryObservation[];
  coverage: PersistedAssetTelemetryCoverage[];
  summary: string | null;
  externalCostCents: number;
};

export interface AssetTelemetryAdapter {
  readonly provider: string;
  readonly costMode: AssetTelemetryCostMode;
  collect(input: AssetTelemetryCollectInput): Promise<AssetTelemetryResult>;
}

const OBSERVATION_TYPES = new Set<AssetObservationType>([
  "REVENUE",
  "COST",
  "TRANSACTION",
  "USAGE",
  "SUPPORT",
  "CUSTOM",
]);
const COVERAGE_KINDS = new Set<AssetTelemetryCoverageKind>([
  "REVENUE",
  "COST",
  "TRANSACTION",
  "USAGE",
  "SUPPORT",
]);

const asObject = (value: unknown): Record<string, unknown> =>
  value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};

const text = (value: unknown): string | null =>
  typeof value === "string" && value.trim() ? value.trim() : null;

const optionalNonNegativeInt = (value: unknown): number | null => {
  if (value == null) return null;
  const n = Number(value);
  if (!Number.isFinite(n) || !Number.isInteger(n) || n < 0) {
    throw new Error("ASSET_TELEMETRY_INVALID_RESPONSE: expected a non-negative integer");
  }
  return n;
};

const nonNegativeInt = (value: unknown): number => optionalNonNegativeInt(value) ?? 0;

function parseDate(value: unknown, field: string): Date {
  const date = new Date(String(value ?? ""));
  if (Number.isNaN(date.getTime())) {
    throw new Error(`ASSET_TELEMETRY_INVALID_RESPONSE: ${field} must be an ISO date`);
  }
  return date;
}

function parseObservation(value: unknown): AssetTelemetryObservation {
  const object = asObject(value);
  const eventId = text(object.event_id ?? object.eventId ?? object.id);
  if (!eventId) throw new Error("ASSET_TELEMETRY_INVALID_RESPONSE: event_id is required");
  const rawType = String(object.observation_type ?? object.observationType ?? object.type ?? "").toUpperCase() as AssetObservationType;
  if (!OBSERVATION_TYPES.has(rawType)) {
    throw new Error(`ASSET_TELEMETRY_INVALID_RESPONSE: unsupported observation type ${rawType}`);
  }
  return {
    eventId: eventId.slice(0, 500),
    observationType: rawType,
    amountCents: optionalNonNegativeInt(object.amount_cents ?? object.amountCents),
    quantity: optionalNonNegativeInt(object.quantity),
    unit: text(object.unit)?.slice(0, 100) ?? null,
    externalReference: text(object.external_reference ?? object.externalReference)?.slice(0, 500) ?? null,
    observedAt: parseDate(object.observed_at ?? object.observedAt, "observed_at"),
    metadata: asObject(object.metadata),
  };
}

function parseCoverage(value: unknown): PersistedAssetTelemetryCoverage {
  const object = asObject(value);
  const kind = String(object.kind ?? object.observation_type ?? "").toUpperCase() as AssetTelemetryCoverageKind;
  if (!COVERAGE_KINDS.has(kind)) {
    throw new Error(`ASSET_TELEMETRY_INVALID_RESPONSE: unsupported coverage kind ${kind}`);
  }
  const start = parseDate(object.window_start ?? object.windowStart, "coverage.window_start");
  const end = parseDate(object.window_end ?? object.windowEnd, "coverage.window_end");
  if (end.getTime() <= start.getTime()) {
    throw new Error("ASSET_TELEMETRY_INVALID_RESPONSE: coverage window_end must be after window_start");
  }
  return {
    kind,
    windowStart: start.toISOString(),
    windowEnd: end.toISOString(),
    complete: object.complete === true,
  };
}

function parseResult(value: unknown): AssetTelemetryResult {
  const object = asObject(value);
  const rawObservations = Array.isArray(object.observations) ? object.observations : [];
  if (rawObservations.length > 1_000) {
    throw new Error("ASSET_TELEMETRY_INVALID_RESPONSE: more than 1000 observations returned in one sync");
  }
  const rawCoverage = Array.isArray(object.coverage) ? object.coverage : [];
  return {
    cursor: text(object.cursor ?? object.next_cursor ?? object.nextCursor),
    observations: rawObservations.map(parseObservation),
    coverage: rawCoverage.map(parseCoverage),
    summary: text(object.summary ?? object.message)?.slice(0, 2_000) ?? null,
    externalCostCents: nonNegativeInt(object.external_cost_cents ?? object.externalCostCents),
  };
}

const cleanBaseUrl = (value: string): string => value.replace(/\/+$/, "");

export function configuredAssetTelemetryAdapter(): AssetTelemetryAdapter | null {
  const baseUrl = process.env.MONEY_SCOUT_ASSET_TELEMETRY_ADAPTER_URL?.trim();
  if (!baseUrl) return null;
  const provider = process.env.MONEY_SCOUT_ASSET_TELEMETRY_ADAPTER_PROVIDER?.trim() || "GENERIC_HTTP_TELEMETRY";
  const rawCost = process.env.MONEY_SCOUT_ASSET_TELEMETRY_ADAPTER_COST_MODE?.trim().toUpperCase();
  const costMode: AssetTelemetryCostMode = rawCost === "METERED" ? "METERED" : "ZERO_CASH";
  return createHttpAssetTelemetryAdapter({
    provider,
    baseUrl: cleanBaseUrl(baseUrl),
    token: process.env.MONEY_SCOUT_ASSET_TELEMETRY_ADAPTER_TOKEN?.trim() || null,
    costMode,
  });
}

export function createHttpAssetTelemetryAdapter(config: AssetTelemetryAdapterConfig): AssetTelemetryAdapter {
  const headers = (): Record<string, string> => ({
    "content-type": "application/json",
    ...(config.token ? { authorization: `Bearer ${config.token}` } : {}),
  });

  return {
    provider: config.provider,
    costMode: config.costMode,
    async collect(input) {
      const response = await fetch(`${config.baseUrl}/v1/asset-telemetry/collect`, {
        method: "POST",
        headers: headers(),
        body: JSON.stringify({
          asset_id: input.assetId,
          asset_key: input.assetKey,
          opportunity_id: input.opportunityId,
          production_url: input.productionUrl,
          cursor: input.cursor,
          since: input.since.toISOString(),
          idempotency_key: input.idempotencyKey,
          contract: {
            read_only: true,
            authoritative_provider_data_only: true,
            stable_event_ids_required: true,
            complete_coverage_must_be_explicit: true,
            no_customer_charging_changes: true,
            no_outbound: true,
            no_advertising: true,
            no_domain_changes: true,
          },
        }),
        signal: AbortSignal.timeout(30_000),
      });
      const raw = await response.text();
      if (!response.ok) {
        throw new Error(`ASSET_TELEMETRY_HTTP_${response.status}: ${raw.slice(0, 1_000)}`);
      }
      let parsed: unknown;
      try {
        parsed = JSON.parse(raw);
      } catch {
        throw new Error("ASSET_TELEMETRY_INVALID_RESPONSE: response was not JSON");
      }
      return parseResult(parsed);
    },
  };
}
