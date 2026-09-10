import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { buildJobsTable } from "./build";
import { evaluationCyclesTable } from "./lifecycle";
import { opportunitiesTable } from "./money-scout";
import { releaseJobsTable, type ReleaseTargetKind } from "./release";

export type AssetStatus =
  | "ACTIVE"
  | "DEGRADED"
  | "PAUSED"
  | "BLOCKED"
  | "KILLED"
  | "ARCHIVED";

export type AssetHealthStatus =
  | "UNKNOWN"
  | "HEALTHY"
  | "DEGRADED"
  | "UNHEALTHY"
  | "NOT_APPLICABLE";

export type AssetOperatingMode = "MONITOR_ONLY" | "OPERATING" | "PAUSED";

export type PersistedAssetAuthorities = {
  schemaVersion: 1;
  publicReleaseAuthorized: true;
  customerChargingAuthorized: boolean;
  outboundAuthorized: boolean;
  advertisingAuthorized: boolean;
  customDomainAuthorized: boolean;
  productionCredentialsAuthorized: boolean;
  externalSpendCeilingCents: number;
};

export type PersistedAssetOperationsPolicy = {
  schemaVersion: 1;
  healthCheckIntervalSeconds: number;
  unhealthyAfterConsecutiveFailures: number;
  allowReadOnlyHealthChecks: true;
  allowTelemetryIngestion: true;
  allowExternalSpend: false;
  allowCustomerCharging: false;
  allowOutbound: false;
  allowAdvertising: false;
  autoKill: false;
  nextGate: "MONETIZATION_AND_OPERATIONS_INSTRUMENTATION";
};

export type AssetObservationType =
  | "REVENUE"
  | "COST"
  | "TRANSACTION"
  | "USAGE"
  | "SUPPORT"
  | "CUSTOM";

export type AssetObservationProvenance = "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";

export const assetsTable = pgTable(
  "assets",
  {
    id: serial("id").primaryKey(),
    assetKey: text("asset_key").notNull(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    activationReleaseJobId: integer("activation_release_job_id")
      .notNull()
      .references(() => releaseJobsTable.id, { onDelete: "restrict" }),
    currentReleaseJobId: integer("current_release_job_id")
      .notNull()
      .references(() => releaseJobsTable.id, { onDelete: "restrict" }),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "restrict" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    nameSnapshot: text("name_snapshot").notNull(),
    productShape: text("product_shape").notNull(),
    targetKind: text("target_kind").$type<ReleaseTargetKind>().notNull(),
    productionUrl: text("production_url").notNull(),
    repositoryUrl: text("repository_url"),
    branchName: text("branch_name"),
    releaseProvider: text("release_provider").notNull(),
    status: text("status").$type<AssetStatus>().notNull().default("ACTIVE"),
    operatingMode: text("operating_mode").$type<AssetOperatingMode>().notNull().default("MONITOR_ONLY"),
    healthStatus: text("health_status").$type<AssetHealthStatus>().notNull().default("UNKNOWN"),
    authorities: jsonb("authorities").$type<PersistedAssetAuthorities>().notNull(),
    operationsPolicy: jsonb("operations_policy").$type<PersistedAssetOperationsPolicy>().notNull(),
    revenueInstrumentationStatus: text("revenue_instrumentation_status").notNull().default("UNINSTRUMENTED"),
    usageInstrumentationStatus: text("usage_instrumentation_status").notNull().default("UNINSTRUMENTED"),
    supportInstrumentationStatus: text("support_instrumentation_status").notNull().default("UNINSTRUMENTED"),
    totalObservedRevenueCents: integer("total_observed_revenue_cents").notNull().default(0),
    totalObservedCostCents: integer("total_observed_cost_cents").notNull().default(0),
    totalObservedTransactions: integer("total_observed_transactions").notNull().default(0),
    consecutiveHealthFailures: integer("consecutive_health_failures").notNull().default(0),
    lastHealthCheckAt: timestamp("last_health_check_at", { withTimezone: true }),
    nextHealthCheckAt: timestamp("next_health_check_at", { withTimezone: true }),
    lastHealthyAt: timestamp("last_healthy_at", { withTimezone: true }),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    activatedAt: timestamp("activated_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("assets_key_unique").on(table.assetKey),
    uniqueIndex("assets_opportunity_unique").on(table.opportunityId),
    uniqueIndex("assets_activation_release_unique").on(table.activationReleaseJobId),
    index("assets_status_idx").on(table.status, table.nextHealthCheckAt),
    index("assets_health_idx").on(table.healthStatus, table.updatedAt),
  ],
);

export const assetHealthChecksTable = pgTable(
  "asset_health_checks",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assetsTable.id, { onDelete: "cascade" }),
    status: text("status").$type<AssetHealthStatus>().notNull(),
    probeKind: text("probe_kind").notNull(),
    url: text("url"),
    reachable: boolean("reachable").notNull(),
    httpStatus: integer("http_status"),
    latencyMs: integer("latency_ms"),
    errorCode: text("error_code"),
    errorMessage: text("error_message"),
    checkedAt: timestamp("checked_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("asset_health_checks_asset_idx").on(table.assetId, table.checkedAt)],
);

export const assetObservationsTable = pgTable(
  "asset_observations",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assetsTable.id, { onDelete: "cascade" }),
    observationType: text("observation_type").$type<AssetObservationType>().notNull(),
    source: text("source").notNull(),
    idempotencyKey: text("idempotency_key").notNull(),
    provenance: text("provenance").$type<AssetObservationProvenance>().notNull().default("UNKNOWN"),
    amountCents: integer("amount_cents"),
    quantity: integer("quantity"),
    unit: text("unit"),
    externalReference: text("external_reference"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    observedAt: timestamp("observed_at", { withTimezone: true }).notNull(),
    ingestedAt: timestamp("ingested_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("asset_observations_idempotency_unique").on(table.idempotencyKey),
    index("asset_observations_asset_idx").on(table.assetId, table.observedAt),
    index("asset_observations_type_idx").on(table.observationType, table.observedAt),
  ],
);

export const assetIncidentsTable = pgTable(
  "asset_incidents",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assetsTable.id, { onDelete: "cascade" }),
    incidentKey: text("incident_key").notNull(),
    incidentType: text("incident_type").notNull(),
    severity: text("severity").notNull(),
    status: text("status").notNull().default("OPEN"),
    summary: text("summary").notNull(),
    evidence: jsonb("evidence").$type<Record<string, unknown>>().notNull().default({}),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("asset_incidents_key_unique").on(table.incidentKey),
    index("asset_incidents_asset_idx").on(table.assetId, table.status, table.detectedAt),
  ],
);

export const assetEventsTable = pgTable(
  "asset_events",
  {
    id: serial("id").primaryKey(),
    assetId: integer("asset_id")
      .notNull()
      .references(() => assetsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("asset_events_asset_idx").on(table.assetId, table.occurredAt),
    index("asset_events_opportunity_idx").on(table.opportunityId, table.occurredAt),
  ],
);
