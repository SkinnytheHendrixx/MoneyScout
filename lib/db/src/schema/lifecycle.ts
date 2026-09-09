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
import { sql } from "drizzle-orm";
import { opportunitiesTable } from "./money-scout";

export const evaluationCycleStatusEnum = pgEnum("evaluation_cycle_status", [
  "ACTIVE",
  "COMPLETED",
  "SUPERSEDED",
]);

export const watchRegistrationStatusEnum = pgEnum("watch_registration_status", [
  "ACTIVE",
  "TRIGGERED",
  "CLOSED",
]);

export const portfolioHeartbeatStatusEnum = pgEnum("portfolio_heartbeat_status", [
  "RUNNING",
  "COMPLETE",
  "PARTIAL",
  "FAILED",
]);

export const evaluationCyclesTable = pgTable(
  "evaluation_cycles",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    cycleNumber: integer("cycle_number").notNull(),
    status: evaluationCycleStatusEnum("status").notNull().default("ACTIVE"),
    triggerType: text("trigger_type").notNull(),
    triggerReason: text("trigger_reason").notNull(),
    triggerMetadata: jsonb("trigger_metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    completedAt: timestamp("completed_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("evaluation_cycles_opportunity_number_unique").on(
      table.opportunityId,
      table.cycleNumber,
    ),
    uniqueIndex("evaluation_cycles_one_active_per_opportunity")
      .on(table.opportunityId)
      .where(sql`${table.status} = 'ACTIVE'`),
    index("evaluation_cycles_opportunity_idx").on(table.opportunityId, table.startedAt),
  ],
);

export type WatchBaseline = {
  discoveryKey?: string | null;
  candidateId?: number | null;
  occurrenceCount?: number | null;
  latestSnapshotId?: number | null;
  lastSeenAt?: string | null;
  latestPriorityScore?: number | null;
  primaryAnomalyType?: string | null;
  anomalyTags?: string[];
};

export type WatchTriggerEvidence = {
  kind: string;
  observedAt: string;
  summary: string;
  metadata?: Record<string, unknown>;
};

export const watchRegistrationsTable = pgTable(
  "watch_registrations",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    problem: text("problem").notNull(),
    reason: text("reason").notNull(),
    triggerDescriptions: text("trigger_descriptions").array().notNull().default([]),
    baseline: jsonb("baseline").$type<WatchBaseline>().notNull().default({}),
    status: watchRegistrationStatusEnum("status").notNull().default("ACTIVE"),
    registeredAt: timestamp("registered_at", { withTimezone: true }).notNull().defaultNow(),
    lastCheckedAt: timestamp("last_checked_at", { withTimezone: true }),
    nextCheckAt: timestamp("next_check_at", { withTimezone: true }),
    triggeredAt: timestamp("triggered_at", { withTimezone: true }),
    triggerEvidence: jsonb("trigger_evidence").$type<WatchTriggerEvidence | null>(),
    checkCount: integer("check_count").notNull().default(0),
  },
  (table) => [
    uniqueIndex("watch_registrations_one_active_per_opportunity")
      .on(table.opportunityId)
      .where(sql`${table.status} = 'ACTIVE'`),
    index("watch_registrations_status_idx").on(table.status, table.nextCheckAt),
    index("watch_registrations_opportunity_idx").on(table.opportunityId, table.registeredAt),
  ],
);

export const opportunityRuntimeStateTable = pgTable(
  "opportunity_runtime_state",
  {
    opportunityId: integer("opportunity_id")
      .primaryKey()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    activeEvaluationCycleId: integer("active_evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    currentActivityKey: text("current_activity_key").notNull().default("IDLE"),
    currentActivityLabel: text("current_activity_label").notNull().default("Idle"),
    activityStatus: text("activity_status").notNull().default("IDLE"),
    activityStartedAt: timestamp("activity_started_at", { withTimezone: true }),
    expectedDurationSeconds: integer("expected_duration_seconds"),
    stageIndex: integer("stage_index"),
    stageCount: integer("stage_count"),
    nextAction: text("next_action"),
    etaBasis: text("eta_basis"),
    lastReconciledAt: timestamp("last_reconciled_at", { withTimezone: true }),
    lastLifecycleTransitionAt: timestamp("last_lifecycle_transition_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index("opportunity_runtime_state_activity_idx").on(table.activityStatus, table.currentActivityKey)],
);

export const lifecycleEventsTable = pgTable(
  "lifecycle_events",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index("lifecycle_events_opportunity_idx").on(table.opportunityId, table.occurredAt),
    index("lifecycle_events_type_idx").on(table.eventType, table.occurredAt),
  ],
);

export const portfolioHeartbeatRunsTable = pgTable(
  "portfolio_heartbeat_runs",
  {
    id: serial("id").primaryKey(),
    status: portfolioHeartbeatStatusEnum("status").notNull().default("RUNNING"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    scannedOpportunityCount: integer("scanned_opportunity_count").notNull().default(0),
    watchesRegisteredCount: integer("watches_registered_count").notNull().default(0),
    watchesCheckedCount: integer("watches_checked_count").notNull().default(0),
    reactivatedOpportunityCount: integer("reactivated_opportunity_count").notNull().default(0),
    staleRunsRecoveredCount: integer("stale_runs_recovered_count").notNull().default(0),
    researchQueueCount: integer("research_queue_count").notNull().default(0),
    errors: jsonb("errors").$type<string[]>().notNull().default([]),
  },
  (table) => [index("portfolio_heartbeat_runs_started_idx").on(table.startedAt)],
);
