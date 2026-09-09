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
import { evaluationCyclesTable } from "./lifecycle";

export const humanActionStatusEnum = pgEnum("human_action_status", [
  "OPEN",
  "VERIFYING",
  "RESOLVED",
  "CANCELLED",
]);

export const humanActionUrgencyEnum = pgEnum("human_action_urgency", [
  "CRITICAL",
  "HIGH",
  "NORMAL",
  "LOW",
]);

export const humanActionVerificationModeEnum = pgEnum("human_action_verification_mode", [
  "AUTOMATED_CHECK",
  "HUMAN_ATTESTATION",
  "EXTERNAL_CALLBACK",
]);

export const capabilityStatusEnum = pgEnum("capability_status", [
  "AVAILABLE",
  "PENDING",
  "MISSING",
  "EXPIRED",
  "REVOKED",
]);

export type HumanActionResumePayload = Record<string, unknown>;

export const capabilitiesTable = pgTable(
  "capabilities",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    provider: text("provider").notNull(),
    status: capabilityStatusEnum("status").notNull().default("MISSING"),
    accessLevel: text("access_level").notNull().default("AUTHENTICATED"),
    verificationMethod: text("verification_method"),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().notNull().default({}),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex("capabilities_key_unique").on(table.key),
    index("capabilities_status_idx").on(table.status, table.provider),
  ],
);

export const humanActionsTable = pgTable(
  "human_actions",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    status: humanActionStatusEnum("status").notNull().default("OPEN"),
    urgency: humanActionUrgencyEnum("urgency").notNull().default("NORMAL"),
    actionType: text("action_type").notNull(),
    title: text("title").notNull(),
    whyNeeded: text("why_needed").notNull(),
    instructions: text("instructions").notNull(),
    blockedStage: text("blocked_stage").notNull(),
    requiredCapabilityKey: text("required_capability_key"),
    verificationMode: humanActionVerificationModeEnum("verification_mode")
      .notNull()
      .default("HUMAN_ATTESTATION"),
    resumeAction: text("resume_action").notNull(),
    resumePayload: jsonb("resume_payload")
      .$type<HumanActionResumePayload>()
      .notNull()
      .default({}),
    resolutionData: jsonb("resolution_data").$type<Record<string, unknown> | null>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("human_actions_one_open_blocker_unique")
      .on(table.opportunityId, table.actionType, table.blockedStage)
      .where(sql`${table.status} IN ('OPEN', 'VERIFYING')`),
    index("human_actions_status_urgency_idx").on(table.status, table.urgency, table.createdAt),
    index("human_actions_opportunity_idx").on(table.opportunityId, table.createdAt),
    index("human_actions_capability_idx").on(table.requiredCapabilityKey, table.status),
  ],
);
