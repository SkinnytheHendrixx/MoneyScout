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
import { buildJobsTable, builderWorkspacesTable } from "./build";
import { evaluationCyclesTable } from "./lifecycle";
import { opportunitiesTable } from "./money-scout";

export type ReleaseJobStatus =
  | "READY_FOR_PREVIEW"
  | "PREVIEW_DEPLOYING"
  | "PREVIEW_READY"
  | "WAITING_FOR_PUBLIC_AUTHORITY"
  | "PRODUCTION_DEPLOYING"
  | "COMPLETE"
  | "BLOCKED"
  | "FAILED"
  | "CANCELLED";

export type ReleaseTargetKind =
  | "HOSTED_WEB"
  | "HOSTED_API"
  | "SCHEDULED_WORKER"
  | "AUTOMATION_RUNTIME"
  | "MARKETPLACE_PUBLICATION"
  | "DATA_DELIVERY"
  | "BOT_RUNTIME"
  | "EXTENSION_STORE"
  | "GENERIC_RELEASE";

export type PersistedReleasePlan = {
  schemaVersion: 1;
  buildJobId: number;
  opportunityId: number;
  productShape: string;
  targetKind: ReleaseTargetKind;
  artifact: {
    repositoryUrl: string;
    branchName: string;
  };
  preview: {
    required: true;
    visibility: "PRIVATE";
    purpose: "DEPLOYMENT_HEALTH_VERIFICATION" | "PACKAGE_VALIDATION";
  };
  production: {
    publicReleaseRequired: true;
    explicitHumanAuthorityRequired: boolean;
    customDomainRequired: false;
    customerChargingAuthorized: false;
    productionCredentialsAuthorized: false;
    outboundAuthorized: false;
  };
  economics: {
    externalSpendCeilingCents: number;
  };
  maintenance?: {
    assetId: number;
    inheritedPublicAuthority: true;
    samePublicSurfaceRequired: true;
    surfaceExpansionAllowed: false;
    customerChargingExpansionAllowed: false;
    outboundExpansionAllowed: false;
    advertisingExpansionAllowed: false;
    customDomainExpansionAllowed: false;
    productionCredentialExpansionAllowed: false;
  };
  nextGate: "ASSET_CREATION_AND_OPERATIONS" | "ASSET_OPERATIONS";
};

export const releaseJobsTable = pgTable(
  "release_jobs",
  {
    id: serial("id").primaryKey(),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    builderWorkspaceId: integer("builder_workspace_id")
      .notNull()
      .references(() => builderWorkspacesTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status").$type<ReleaseJobStatus>().notNull().default("READY_FOR_PREVIEW"),
    productShape: text("product_shape").notNull(),
    targetKind: text("target_kind").$type<ReleaseTargetKind>().notNull(),
    plan: jsonb("plan").$type<PersistedReleasePlan>().notNull(),
    releaseProvider: text("release_provider").notNull().default("UNCONFIGURED"),
    releaseCostMode: text("release_cost_mode").notNull().default("ZERO_CASH"),
    previewProviderRunId: text("preview_provider_run_id"),
    previewIdempotencyKey: text("preview_idempotency_key").notNull(),
    previewUrl: text("preview_url"),
    previewVisibility: text("preview_visibility"),
    previewHealthPassed: boolean("preview_health_passed"),
    previewDispatchAttemptCount: integer("preview_dispatch_attempt_count").notNull().default(0),
    productionProviderRunId: text("production_provider_run_id"),
    productionIdempotencyKey: text("production_idempotency_key").notNull(),
    productionUrl: text("production_url"),
    productionVisibility: text("production_visibility"),
    productionHealthPassed: boolean("production_health_passed"),
    productionDispatchAttemptCount: integer("production_dispatch_attempt_count").notNull().default(0),
    externalSpendCeilingCents: integer("external_spend_ceiling_cents").notNull().default(0),
    externalSpendUsedCents: integer("external_spend_used_cents").notNull().default(0),
    publicReleaseAuthorizedAt: timestamp("public_release_authorized_at", { withTimezone: true }),
    publicReleaseAuthorizedBy: text("public_release_authorized_by"),
    blockedReason: text("blocked_reason"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    previewFinishedAt: timestamp("preview_finished_at", { withTimezone: true }),
    productionFinishedAt: timestamp("production_finished_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("release_jobs_build_job_unique").on(table.buildJobId),
    uniqueIndex("release_jobs_idempotency_unique").on(table.idempotencyKey),
    uniqueIndex("release_jobs_preview_idempotency_unique").on(table.previewIdempotencyKey),
    uniqueIndex("release_jobs_production_idempotency_unique").on(table.productionIdempotencyKey),
    index("release_jobs_status_idx").on(table.status, table.updatedAt),
    index("release_jobs_opportunity_idx").on(table.opportunityId, table.createdAt),
    index("release_jobs_cycle_idx").on(table.evaluationCycleId, table.createdAt),
  ],
);

export const releaseEventsTable = pgTable(
  "release_events",
  {
    id: serial("id").primaryKey(),
    releaseJobId: integer("release_job_id")
      .notNull()
      .references(() => releaseJobsTable.id, { onDelete: "cascade" }),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("release_events_release_job_idx").on(table.releaseJobId, table.occurredAt),
    index("release_events_opportunity_idx").on(table.opportunityId, table.occurredAt),
  ],
);
