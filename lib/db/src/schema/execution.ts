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

export const executionJobStatusEnum = pgEnum("execution_job_status", [
  "QUEUED",
  "RUNNING",
  "WAITING",
  "HUMAN_BLOCKED",
  "WATCHING",
  "SUCCEEDED",
  "FAILED_TERMINAL",
  "CANCELLED",
]);

export const executionFailureClassEnum = pgEnum("execution_failure_class", [
  "TRANSIENT_INFRASTRUCTURE",
  "PROVIDER_NOT_READY",
  "ALREADY_RUNNING",
  "AUTHORIZATION_REQUIRED",
  "STAGE_FAILURE",
  "INTERRUPTED_UNKNOWN_OUTCOME",
  "INTERNAL_CAPABILITY_MISSING",
  "UNSUPPORTED_ACTION",
  "UNKNOWN",
]);

export const executionJobsTable = pgTable(
  "execution_jobs",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    parentJobId: integer("parent_job_id"),
    action: text("action").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().notNull().default({}),
    status: executionJobStatusEnum("status").notNull().default("QUEUED"),
    priority: integer("priority").notNull().default(50),
    idempotencyKey: text("idempotency_key").notNull(),
    attemptCount: integer("attempt_count").notNull().default(0),
    availableAt: timestamp("available_at", { withTimezone: true }).notNull().defaultNow(),
    leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    lastErrorClass: executionFailureClassEnum("last_error_class"),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    result: jsonb("result").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("execution_jobs_idempotency_unique").on(table.idempotencyKey),
    index("execution_jobs_due_idx").on(table.status, table.availableAt, table.priority),
    index("execution_jobs_opportunity_idx").on(table.opportunityId, table.createdAt),
    index("execution_jobs_lease_idx").on(table.status, table.leaseExpiresAt),
    index("execution_jobs_cycle_idx").on(table.evaluationCycleId, table.createdAt),
  ],
);

export const executionJobEventsTable = pgTable(
  "execution_job_events",
  {
    id: serial("id").primaryKey(),
    jobId: integer("job_id")
      .notNull()
      .references(() => executionJobsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("execution_job_events_job_idx").on(table.jobId, table.occurredAt),
    index("execution_job_events_opportunity_idx").on(table.opportunityId, table.occurredAt),
  ],
);
