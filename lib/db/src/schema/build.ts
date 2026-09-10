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

export type PersistedQaAcceptanceResult = {
  criterion: string;
  status: "PASS" | "FAIL" | "UNKNOWN";
  evidence: string | null;
};

export type PersistedQaDefect = {
  key: string;
  category: string;
  severity: "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  evidence: string | null;
  repairGuidance: string | null;
  humanOnly: boolean;
};

export type QaRunStatus =
  | "PENDING"
  | "DISPATCHING"
  | "RUNNING"
  | "PASSED"
  | "DEFECTS_FOUND"
  | "REPAIR_PENDING"
  | "REPAIRING"
  | "RETEST_PENDING"
  | "HUMAN_BLOCKED"
  | "FAILED"
  | "CANCELLED";

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

export const qaRunsTable = pgTable(
  "qa_runs",
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
    roundNumber: integer("round_number").notNull(),
    status: text("status").$type<QaRunStatus>().notNull().default("PENDING"),
    qaProvider: text("qa_provider").notNull().default("UNCONFIGURED"),
    qaCostMode: text("qa_cost_mode").notNull().default("ZERO_CASH"),
    qaProviderRunId: text("qa_provider_run_id"),
    qaIdempotencyKey: text("qa_idempotency_key").notNull(),
    repositoryUrl: text("repository_url"),
    branchName: text("branch_name"),
    acceptanceCriteria: jsonb("acceptance_criteria").$type<string[]>().notNull().default([]),
    acceptanceResults: jsonb("acceptance_results").$type<PersistedQaAcceptanceResult[]>().notNull().default([]),
    defects: jsonb("defects").$type<PersistedQaDefect[]>().notNull().default([]),
    resultMetadata: jsonb("result_metadata").$type<Record<string, unknown>>().notNull().default({}),
    baselineChecksPassed: text("baseline_checks_passed"),
    repairProviderRunId: text("repair_provider_run_id"),
    repairIdempotencyKey: text("repair_idempotency_key"),
    repairAttemptCount: integer("repair_attempt_count").notNull().default(0),
    qaDispatchAttemptCount: integer("qa_dispatch_attempt_count").notNull().default(0),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    qaFinishedAt: timestamp("qa_finished_at", { withTimezone: true }),
    repairStartedAt: timestamp("repair_started_at", { withTimezone: true }),
    repairFinishedAt: timestamp("repair_finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("qa_runs_build_round_unique").on(table.buildJobId, table.roundNumber),
    uniqueIndex("qa_runs_idempotency_unique").on(table.qaIdempotencyKey),
    index("qa_runs_status_idx").on(table.status, table.updatedAt),
    index("qa_runs_build_job_idx").on(table.buildJobId, table.roundNumber),
    index("qa_runs_opportunity_idx").on(table.opportunityId, table.createdAt),
  ],
);

export const qaRunEventsTable = pgTable(
  "qa_run_events",
  {
    id: serial("id").primaryKey(),
    qaRunId: integer("qa_run_id")
      .notNull()
      .references(() => qaRunsTable.id, { onDelete: "cascade" }),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("qa_run_events_run_idx").on(table.qaRunId, table.occurredAt),
    index("qa_run_events_build_job_idx").on(table.buildJobId, table.occurredAt),
  ],
);
