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
