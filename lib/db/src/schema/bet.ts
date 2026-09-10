import {
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { opportunitiesTable } from "./money-scout";
import { evaluationCyclesTable } from "./lifecycle";

export type BetStatus =
  | "PROPOSED"
  | "APPROVED"
  | "ACTIVE"
  | "PAUSED"
  | "SUCCEEDED"
  | "WITHDRAWN"
  | "EXHAUSTED";

export type BoundedEstimate = {
  status: "KNOWN" | "BOUNDED" | "UNKNOWN";
  lower?: number | null;
  upper?: number | null;
  unit?: string | null;
  evidenceRefs: string[];
  rationale?: string | null;
};

export type BetDecisionContract = {
  schemaVersion: 1;
  thesis: string;
  rationale: string;
  underwritingReference: {
    evaluationCycleId: number | null;
    snapshotRef: string | null;
  };
  upside: BoundedEstimate;
  keyRisks: string[];
  unknowns: string[];
  reversibility: {
    level: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
    downsideExposure: BoundedEstimate;
    notes: string[];
  };
  successCriteria: string[];
  failureCriteria: string[];
  iterateCriteria: string[];
  decisionHorizon: {
    status: "KNOWN" | "BOUNDED" | "UNKNOWN";
    earliestAt: string | null;
    latestAt: string | null;
    evidenceRefs: string[];
  };
  humanCapabilityDependencies: string[];
  expectedMaintenanceBurden: BoundedEstimate;
  expectedSupportBurden: BoundedEstimate;
  expectedOperationalComplexity: {
    status: "KNOWN" | "BOUNDED" | "UNKNOWN";
    level: "LOW" | "MEDIUM" | "HIGH" | null;
    evidenceRefs: string[];
    notes: string[];
  };
};

export type BetResourceBucket = {
  allocated: number | null;
  committed: number;
  consumed: number;
  remaining: number | null;
  unit: string;
};

export type BetResourceEnvelope = {
  schemaVersion: 1;
  externalCash: BetResourceBucket;
  providerServices: BetResourceBucket;
  research: BetResourceBucket;
  build: BetResourceBucket;
  release: BetResourceBucket;
  experiment: BetResourceBucket;
  operations: BetResourceBucket;
  autonomousCapacity: BetResourceBucket;
  humanDependencyBurden: BetResourceBucket;
  accountingAsOf: string | null;
};

export type BetBuildEnvelope = {
  schemaVersion: 1;
  maximumExternalBuildSpendCents: number;
  allowedExternalServiceBudgetCents: number;
  acceptableBuildComplexity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  acceptableMaintenanceBurden: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  acceptableOperatingCost: BoundedEstimate;
  requiredReversibility: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  permittedProductScope: string[];
  requiredAcceptanceCriteria: string[];
  onlyExistingZeroCashCapabilities: boolean;
  hardConstraints: string[];
};

export const betsTable = pgTable(
  "bets",
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
    status: text("status").$type<BetStatus>().notNull().default("PROPOSED"),
    decisionContract: jsonb("decision_contract")
      .$type<BetDecisionContract>()
      .notNull(),
    resourceEnvelope: jsonb("resource_envelope")
      .$type<BetResourceEnvelope>()
      .notNull(),
    buildEnvelope: jsonb("build_envelope").$type<BetBuildEnvelope>().notNull(),
    primaryRisk: text("primary_risk"),
    blockerCode: text("blocker_code"),
    nextAction: text("next_action").notNull(),
    allocatedExternalCashCents: integer("allocated_external_cash_cents"),
    committedExternalCashCents: integer("committed_external_cash_cents")
      .notNull()
      .default(0),
    consumedExternalCashCents: integer("consumed_external_cash_cents")
      .notNull()
      .default(0),
    remainingExternalCashCents: integer("remaining_external_cash_cents"),
    approvedAt: timestamp("approved_at", { withTimezone: true }),
    approvedBy: text("approved_by"),
    activatedAt: timestamp("activated_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("bets_idempotency_unique").on(table.idempotencyKey),
    index("bets_opportunity_idx").on(table.opportunityId, table.createdAt),
    index("bets_status_idx").on(table.status, table.updatedAt),
  ],
);

export const betEventsTable = pgTable(
  "bet_events",
  {
    id: serial("id").primaryKey(),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    eventType: text("event_type").notNull(),
    summary: text("summary").notNull(),
    metadata: jsonb("metadata")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    occurredAt: timestamp("occurred_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [index("bet_events_bet_idx").on(table.betId, table.occurredAt)],
);

export const betCostAttributionsTable = pgTable(
  "bet_cost_attributions",
  {
    id: serial("id").primaryKey(),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    sourceType: text("source_type").notNull(),
    sourceId: integer("source_id").notNull(),
    resourceBucket: text("resource_bucket").notNull(),
    committedCents: integer("committed_cents").notNull().default(0),
    consumedCents: integer("consumed_cents").notNull().default(0),
    sourceUpdatedAt: timestamp("source_updated_at", {
      withTimezone: true,
    }).notNull(),
    reconciledAt: timestamp("reconciled_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("bet_cost_attributions_source_unique").on(
      table.betId,
      table.sourceType,
      table.sourceId,
    ),
    index("bet_cost_attributions_bet_idx").on(
      table.betId,
      table.resourceBucket,
    ),
  ],
);
