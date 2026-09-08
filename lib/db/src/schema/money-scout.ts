import {
  boolean,
  check,
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

export const policyStatusEnum = pgEnum("policy_status", [
  "GREEN",
  "YELLOW",
  "RED",
  "UNKNOWN",
]);

export const verdictEnum = pgEnum("verdict", [
  "NEW",
  "RESEARCH",
  "WATCH",
  "TEST",
  "BUILD",
  "KILL",
]);

export const demandConclusionEnum = pgEnum("demand_conclusion", [
  "SUPPORTED",
  "WEAK",
  "UNSUPPORTED",
  "UNKNOWN",
]);

export const demandTriStateEnum = pgEnum("demand_tri_state", [
  "true",
  "false",
  "unknown",
]);

export const demandAccessTypeEnum = pgEnum("demand_access_type", [
  "access_demand",
  "consumption_only",
  "unclear",
]);

export const recurringUsageSignalEnum = pgEnum("recurring_usage_signal", [
  "yes",
  "no",
  "unknown",
]);

export const evidenceClassificationEnum = pgEnum("evidence_classification", [
  "FACT",
  "CLAIM",
  "INFERENCE",
  "UNKNOWN",
]);

export const opportunitiesTable = pgTable("opportunities", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sourcePlatform: text("source_platform").notNull(),
  sourceUrl: text("source_url").notNull(),
  opportunityType: text("opportunity_type").notNull(),
  thesis: text("thesis").notNull(),
  firstSeen: date("first_seen", { mode: "string" }).notNull(),
  lastResearched: date("last_researched", { mode: "string" }).notNull(),
  status: text("status").notNull(),
  overallScore: numeric("overall_score", {
    precision: 6,
    scale: 2,
    mode: "number",
  }).notNull(),
  policyStatus: policyStatusEnum("policy_status").notNull().default("UNKNOWN"),
  verdict: verdictEnum("verdict").notNull().default("NEW"),
  killReason: text("kill_reason"),
  engineFamily: text("engine_family").notNull(),
  discoveryKey: text("discovery_key"),
}, (table) => [
  uniqueIndex("opportunities_discovery_key_unique").on(table.discoveryKey),
]);

export const evidenceTable = pgTable("evidence", {
  id: serial("id").primaryKey(),
  claim: text("claim").notNull(),
  sourceUrl: text("source_url").notNull(),
  sourceTitle: text("source_title").notNull(),
  observedDate: date("observed_date", { mode: "string" }).notNull(),
  classification: evidenceClassificationEnum("classification")
    .notNull()
    .default("UNKNOWN"),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
  evaluationDimension: text("evaluation_dimension").notNull(),
  researchRunId: integer("research_run_id").references(() => researchRunsTable.id, {
    onDelete: "set null",
  }),
}, (table) => [
  uniqueIndex("evidence_discovery_fact_unique")
    .on(table.opportunityId, table.evaluationDimension, table.classification)
    .where(sql`${table.evaluationDimension} = 'discovery_scout' AND ${table.classification} = 'FACT'`),
]);

export const evaluationsTable = pgTable("evaluations", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
  dimension: text("dimension").notNull(),
  score: numeric("score", { precision: 6, scale: 2, mode: "number" }).notNull(),
  rationale: text("rationale").notNull(),
});

export const researchRunsTable = pgTable("research_runs", {
  id: serial("id").primaryKey(),
  startedAt: timestamp("started_at", { withTimezone: true }).notNull(),
  finishedAt: timestamp("finished_at", { withTimezone: true }),
  triggerType: text("trigger_type").notNull(),
  notes: text("notes"),
});

export const marketSnapshotsTable = pgTable("market_snapshots", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
  snapshotDate: date("snapshot_date", { mode: "string" }).notNull(),
  rawData: jsonb("raw_data").notNull(),
});

export const experimentsTable = pgTable("experiments", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
  hypothesis: text("hypothesis").notNull(),
  status: text("status").notNull(),
  result: text("result"),
});

export const policyChecksTable = pgTable("policy_checks", {
  id: serial("id").primaryKey(),
  opportunityId: integer("opportunity_id")
    .notNull()
    .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
  status: policyStatusEnum("status").notNull(),
  summary: text("summary").notNull(),
  checkedAt: timestamp("checked_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  retrievalMethod: text("retrieval_method").notNull(),
  evidenceCreated: integer("evidence_created").notNull().default(0),
  externalCostUsd: numeric("external_cost_usd", {
    precision: 8,
    scale: 4,
    mode: "number",
  }),
  aiInputTokens: integer("ai_input_tokens"),
  aiOutputTokens: integer("ai_output_tokens"),
  anthropicCitationCount: integer("anthropic_citation_count").notNull().default(0),
  authorityAcceptedCitationCount: integer("authority_accepted_citation_count")
    .notNull()
    .default(0),
  authorityRejectedCitationCount: integer("authority_rejected_citation_count")
    .notNull()
    .default(0),
  rejectedCitationDetails: jsonb("rejected_citation_details")
    .$type<Array<{ url: string | null; reason: string }>>()
    .notNull()
    .default([]),
  claudeFindingsBeforeFiltering: integer("claude_findings_before_filtering")
    .notNull()
    .default(0),
  findingsAfterFiltering: integer("findings_after_filtering").notNull().default(0),
  rejectedFindingDetails: jsonb("rejected_finding_details")
    .$type<Array<{ source_url: string | null; reason: string }>>()
    .notNull()
    .default([]),
  anthropicStopReason: text("anthropic_stop_reason"),
  webSearchRequests: integer("web_search_requests"),
  anthropicContentBlockCount: integer("anthropic_content_block_count")
    .notNull()
    .default(0),
  anthropicContentBlockTypes: jsonb("anthropic_content_block_types")
    .$type<string[]>()
    .notNull()
    .default([]),
  webSearchToolResultBlockCount: integer("web_search_tool_result_block_count")
    .notNull()
    .default(0),
  webSearchResultItemCount: integer("web_search_result_item_count")
    .notNull()
    .default(0),
  webSearchResultItems: jsonb("web_search_result_items")
    .$type<Array<{ url: string; title: string }>>()
    .notNull()
    .default([]),
  finalTextBlockCount: integer("final_text_block_count").notNull().default(0),
  textBlockCitationCounts: jsonb("text_block_citation_counts")
    .$type<number[]>()
    .notNull()
    .default([]),
});

export const demandCheckResultsTable = pgTable(
  "demand_check_results",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    runId: integer("run_id")
      .notNull()
      .unique()
      .references(() => researchRunsTable.id, { onDelete: "cascade" }),
    buyerIdentified: demandTriStateEnum("buyer_identified").notNull(),
    buyerDescription: text("buyer_description"),
    workflowIdentified: demandTriStateEnum("workflow_identified").notNull(),
    workflowDescription: text("workflow_description"),
    accessVsConsumption: demandAccessTypeEnum("access_vs_consumption").notNull(),
    recurringUsageSignal: recurringUsageSignalEnum("recurring_usage_signal").notNull(),
    recurringUsageBasis: text("recurring_usage_basis"),
    existingPaidAnalogFound: boolean("existing_paid_analog_found").notNull(),
    paidAnalogNames: text("paid_analog_names").array().notNull().default([]),
    demandConclusion: demandConclusionEnum("demand_conclusion").notNull(),
    contradictingEvidenceIds: integer("contradicting_evidence_ids")
      .array()
      .notNull()
      .default([]),
    confidenceBasis: text("confidence_basis").notNull(),
    openQuestions: text("open_questions").array().notNull().default([]),
    searchCount: integer("search_count").notNull().default(0),
    claudeCallCount: integer("claude_call_count").notNull().default(0),
    externalCostUsd: numeric("external_cost_usd", {
      precision: 8,
      scale: 4,
      mode: "number",
    }).notNull(),
    aiInputTokens: integer("ai_input_tokens").notNull().default(0),
    aiOutputTokens: integer("ai_output_tokens").notNull().default(0),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    check(
      "unsupported_requires_contradicting_evidence",
      sql`${table.demandConclusion} <> 'UNSUPPORTED' OR cardinality(${table.contradictingEvidenceIds}) > 0`,
    ),
  ],
);
