import {
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { opportunitiesTable } from "./money-scout";
import { evaluationCyclesTable } from "./lifecycle";

export const buildJobStatusEnum = pgEnum("build_job_status", [
  "ORCHESTRATING",
  "READY_FOR_BUILDER",
  "BUILDER_DISPATCHED",
  "BUILDING",
  "QA_PENDING",
  "COMPLETE",
  "BLOCKED",
  "FAILED",
  "CANCELLED",
]);

export const builderWorkspaceStatusEnum = pgEnum("builder_workspace_status", [
  "PROVISIONING",
  "READY",
  "DISPATCHING",
  "RUNNING",
  "QA_PENDING",
  "HUMAN_BLOCKED",
  "FAILED",
  "CANCELLED",
]);

export type PersistedBuildContract = {
  schemaVersion: 1;
  opportunityId: number;
  evaluationCycleId: number | null;
  product: Record<string, unknown>;
  firstTransaction: Record<string, unknown>;
  scope: Record<string, unknown>;
  workspace: Record<string, unknown>;
  acceptanceCriteria: string[];
  autonomy: Record<string, unknown>;
  nextGate: string;
};

export const buildJobsTable = pgTable(
  "build_jobs",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    idempotencyKey: text("idempotency_key").notNull(),
    status: buildJobStatusEnum("status").notNull().default("ORCHESTRATING"),
    productShape: text("product_shape").notNull(),
    supportingShapes: jsonb("supporting_shapes").$type<string[]>().notNull().default([]),
    builderProfile: text("builder_profile").notNull(),
    contract: jsonb("contract").$type<PersistedBuildContract>().notNull(),
    externalSpendCeilingCents: integer("external_spend_ceiling_cents").notNull().default(0),
    externalSpendUsedCents: integer("external_spend_used_cents").notNull().default(0),
    builderWorkspaceId: text("builder_workspace_id"),
    blockedReason: text("blocked_reason"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("build_jobs_idempotency_unique").on(table.idempotencyKey),
    index("build_jobs_opportunity_idx").on(table.opportunityId, table.createdAt),
    index("build_jobs_cycle_idx").on(table.evaluationCycleId, table.createdAt),
    index("build_jobs_status_idx").on(table.status, table.updatedAt),
  ],
);

export const builderWorkspacesTable = pgTable(
  "builder_workspaces",
  {
    id: serial("id").primaryKey(),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    workspaceKey: text("workspace_key").notNull(),
    provider: text("provider").notNull(),
    adapterKind: text("adapter_kind").notNull().default("GENERIC_HTTP"),
    costMode: text("cost_mode").notNull().default("ZERO_CASH"),
    status: builderWorkspaceStatusEnum("status").notNull().default("PROVISIONING"),
    providerRunId: text("provider_run_id"),
    repositoryUrl: text("repository_url"),
    branchName: text("branch_name"),
    workspaceUrl: text("workspace_url"),
    progressPercent: integer("progress_percent"),
    statusSummary: text("status_summary"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    dispatchAttemptCount: integer("dispatch_attempt_count").notNull().default(0),
    dispatchedAt: timestamp("dispatched_at", { withTimezone: true }),
    lastPolledAt: timestamp("last_polled_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("builder_workspaces_build_job_unique").on(table.buildJobId),
    uniqueIndex("builder_workspaces_key_unique").on(table.workspaceKey),
    index("builder_workspaces_status_idx").on(table.status, table.updatedAt),
    index("builder_workspaces_opportunity_idx").on(table.opportunityId, table.createdAt),
  ],
);

export const builderWorkspaceEventsTable = pgTable(
  "builder_workspace_events",
  {
    id: serial("id").primaryKey(),
    workspaceId: integer("workspace_id")
      .notNull()
      .references(() => builderWorkspacesTable.id, { onDelete: "cascade" }),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("builder_workspace_events_workspace_idx").on(table.workspaceId, table.occurredAt),
    index("builder_workspace_events_build_job_idx").on(table.buildJobId, table.occurredAt),
  ],
);
