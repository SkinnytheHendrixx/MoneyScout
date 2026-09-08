import {
  date,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  serial,
  text,
  timestamp,
} from "drizzle-orm/pg-core";

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
});

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
});

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
