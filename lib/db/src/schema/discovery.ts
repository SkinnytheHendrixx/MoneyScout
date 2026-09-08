import {
  boolean,
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
  index,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";
import { opportunitiesTable } from "./money-scout";

export const discoveryRunStatusEnum = pgEnum("discovery_run_status", [
  "RUNNING",
  "COMPLETE",
  "INCOMPLETE",
  "FAILED",
  "INTERRUPTED",
]);

export const discoveryCoverageStatusEnum = pgEnum("discovery_coverage_status", [
  "UNKNOWN",
  "COMPLETE",
  "INCOMPLETE",
]);

export const discoveryCandidateStatusEnum = pgEnum("discovery_candidate_status", [
  "NEW",
  "ACCEPTED",
  "DISMISSED",
  "SUPPRESSED",
  "DUPLICATE",
]);

export const discoveryAnomalyTypeEnum = pgEnum("discovery_anomaly_type", [
  "HIGH_USAGE_THIN_SUPPLY",
  "HIGH_USAGE_CONCENTRATED",
  "HIGH_USAGE_FRAGMENTED",
  "EMERGING_CLUSTER",
  "MATERIAL_SNAPSHOT_CHANGE",
]);

export const discoveryRunsTable = pgTable(
  "discovery_runs",
  {
    id: serial("id").primaryKey(),
    source: text("source").notNull().default("APIFY_STORE"),
    status: discoveryRunStatusEnum("status").notNull().default("RUNNING"),
    coverageStatus: discoveryCoverageStatusEnum("coverage_status")
      .notNull()
      .default("UNKNOWN"),
    startedAt: timestamp("started_at", { withTimezone: true }).notNull().defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    lastHeartbeatAt: timestamp("last_heartbeat_at", { withTimezone: true }),
    queryDefinition: jsonb("query_definition").$type<Record<string, unknown>>().notNull(),
    pageSize: integer("page_size").notNull(),
    effectivePageSize: integer("effective_page_size"),
    pacingMs: integer("pacing_ms").notNull(),
    formulaVersion: text("formula_version").notNull(),
    normalizationVersion: text("normalization_version").notNull().default("normalization-v0.2"),
    platformAliasVersion: text("platform_alias_version").notNull().default("platform-aliases-v1"),
    advertisedTotal: integer("advertised_total"),
    observedTotal: integer("observed_total"),
    expectedPages: integer("expected_pages"),
    pagesFetched: integer("pages_fetched").notNull().default(0),
    currentOffset: integer("current_offset").notNull().default(0),
    requestCount: integer("request_count").notNull().default(0),
    retryCount: integer("retry_count").notNull().default(0),
    uniqueActorCount: integer("unique_actor_count").notNull().default(0),
    duplicateActorCount: integer("duplicate_actor_count").notNull().default(0),
    clusterCount: integer("cluster_count").notNull().default(0),
    candidateCount: integer("candidate_count").notNull().default(0),
    error: text("error"),
  },
  (table) => [
    index("discovery_runs_status_idx").on(table.status),
    index("discovery_runs_started_at_idx").on(table.startedAt),
    uniqueIndex("discovery_runs_one_running_unique")
      .on(table.status)
      .where(sql`${table.status} = 'RUNNING'`),
  ],
);

export const discoveryStagingActorsTable = pgTable(
  "discovery_staging_actors",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => discoveryRunsTable.id, { onDelete: "cascade" }),
    actorKey: text("actor_key").notNull(),
    actorId: text("actor_id"),
    username: text("username").notNull(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    categories: text("categories").array().notNull().default([]),
    platformMatches: text("platform_matches").array().notNull().default([]),
    categoryKeys: text("category_keys").array().notNull().default([]),
    totalUsers: integer("total_users"),
    totalUsers7Days: integer("total_users_7_days"),
    totalUsers30Days: integer("total_users_30_days"),
    totalUsers90Days: integer("total_users_90_days"),
    totalRuns: integer("total_runs"),
    totalBuilds: integer("total_builds"),
    lastRunStartedAt: timestamp("last_run_started_at", { withTimezone: true }),
    actorReviewCount: integer("actor_review_count"),
    actorReviewRating: numeric("actor_review_rating", { precision: 8, scale: 4, mode: "number" }),
    bookmarkCount: integer("bookmark_count"),
    pricingModel: text("pricing_model"),
    minimalMaxTotalChargeUsd: numeric("minimal_max_total_charge_usd", {
      precision: 12,
      scale: 6,
      mode: "number",
    }),
    metadataHash: text("metadata_hash").notNull(),
    selectedRaw: jsonb("selected_raw").$type<Record<string, unknown>>(),
  },
  (table) => [
    uniqueIndex("discovery_staging_actors_run_key_unique").on(table.runId, table.actorKey),
    index("discovery_staging_actors_run_idx").on(table.runId, table.id),
  ],
);

export const discoveryActorsTable = pgTable(
  "discovery_actors",
  {
    id: serial("id").primaryKey(),
    actorKey: text("actor_key").notNull(),
    actorId: text("actor_id"),
    username: text("username").notNull(),
    name: text("name").notNull(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    description: text("description").notNull().default(""),
    categories: text("categories").array().notNull().default([]),
    platformMatches: text("platform_matches").array().notNull().default([]),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    latestCompleteRunId: integer("latest_complete_run_id").references(
      () => discoveryRunsTable.id,
      { onDelete: "set null" },
    ),
    latestMetadataHash: text("latest_metadata_hash"),
    latestMetadata: jsonb("latest_metadata").$type<Record<string, unknown>>(),
  },
  (table) => [
    uniqueIndex("discovery_actors_actor_key_unique").on(table.actorKey),
    index("discovery_actors_username_name_idx").on(table.username, table.name),
  ],
);

export const discoveryActorObservationsTable = pgTable(
  "discovery_actor_observations",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => discoveryRunsTable.id, { onDelete: "cascade" }),
    actorId: integer("actor_id")
      .notNull()
      .references(() => discoveryActorsTable.id, { onDelete: "cascade" }),
    actorKey: text("actor_key").notNull(),
    categoryKeys: text("category_keys").array().notNull().default([]),
    platformKeys: text("platform_keys").array().notNull().default([]),
    totalUsers: integer("total_users"),
    totalUsers7Days: integer("total_users_7_days"),
    totalUsers30Days: integer("total_users_30_days"),
    totalUsers90Days: integer("total_users_90_days"),
    totalRuns: integer("total_runs"),
    totalBuilds: integer("total_builds"),
    lastRunStartedAt: timestamp("last_run_started_at", { withTimezone: true }),
    actorReviewCount: integer("actor_review_count"),
    actorReviewRating: numeric("actor_review_rating", { precision: 8, scale: 4, mode: "number" }),
    bookmarkCount: integer("bookmark_count"),
    pricingModel: text("pricing_model"),
    minimalMaxTotalChargeUsd: numeric("minimal_max_total_charge_usd", {
      precision: 12,
      scale: 6,
      mode: "number",
    }),
    metadataHash: text("metadata_hash").notNull(),
    changedSincePrevious: boolean("changed_since_previous").notNull().default(false),
    selectedRaw: jsonb("selected_raw").$type<Record<string, unknown>>(),
  },
  (table) => [
    uniqueIndex("discovery_actor_observations_run_actor_unique").on(table.runId, table.actorId),
    index("discovery_actor_observations_run_idx").on(table.runId),
    index("discovery_actor_observations_actor_idx").on(table.actorId),
  ],
);

export const discoveryClusterSnapshotsTable = pgTable(
  "discovery_cluster_snapshots",
  {
    id: serial("id").primaryKey(),
    runId: integer("run_id")
      .notNull()
      .references(() => discoveryRunsTable.id, { onDelete: "cascade" }),
    clusterKey: text("cluster_key").notNull(),
    sourcePlatform: text("source_platform").notNull(),
    category: text("category").notNull(),
    actorCount: integer("actor_count").notNull(),
    activeActorCount: integer("active_actor_count").notNull(),
    aggregateTotalUsers30Days: integer("aggregate_total_users_30_days"),
    aggregateTotalUsers7Days: integer("aggregate_total_users_7_days"),
    aggregateTotalUsers90Days: integer("aggregate_total_users_90_days"),
    usageKnownActorCount: integer("usage_known_actor_count").notNull().default(0),
    newActorCount: integer("new_actor_count").notNull().default(0),
    newActorPercentile: numeric("new_actor_percentile", { precision: 8, scale: 6, mode: "number" }),
    snapshotNewnessPercentile: numeric("snapshot_newness_percentile", {
      precision: 8,
      scale: 6,
      mode: "number",
    }),
    materialActorChangeScore: numeric("material_actor_change_score", {
      precision: 8,
      scale: 6,
      mode: "number",
    }),
    materialUsageChangeScore: numeric("material_usage_change_score", {
      precision: 8,
      scale: 6,
      mode: "number",
    }),
    usagePercentile: numeric("usage_percentile", { precision: 8, scale: 6, mode: "number" }),
    thinSupplyPercentile: numeric("thin_supply_percentile", { precision: 8, scale: 6, mode: "number" }),
    hhi: numeric("hhi", { precision: 8, scale: 6, mode: "number" }),
    concentrationPercentile: numeric("concentration_percentile", { precision: 8, scale: 6, mode: "number" }),
    fragmentationPercentile: numeric("fragmentation_percentile", { precision: 8, scale: 6, mode: "number" }),
    persistence: boolean("persistence"),
    emergence: boolean("emergence"),
    recentUsageMix: numeric("recent_usage_mix", { precision: 8, scale: 6, mode: "number" }),
    pricingModelCounts: jsonb("pricing_model_counts").$type<Record<string, number>>().notNull().default({}),
    formulaVersion: text("formula_version").notNull(),
  },
  (table) => [
    uniqueIndex("discovery_cluster_snapshots_run_cluster_unique").on(table.runId, table.clusterKey),
    index("discovery_cluster_snapshots_cluster_idx").on(table.clusterKey),
  ],
);

export const discoveryCandidatesTable = pgTable(
  "discovery_candidates",
  {
    id: serial("id").primaryKey(),
    discoveryKey: text("discovery_key").notNull(),
    clusterKey: text("cluster_key").notNull(),
    sourcePlatform: text("source_platform").notNull(),
    category: text("category").notNull(),
    primaryAnomalyType: discoveryAnomalyTypeEnum("primary_anomaly_type").notNull(),
    anomalyTags: text("anomaly_tags").array().notNull().default([]),
    status: discoveryCandidateStatusEnum("status").notNull().default("NEW"),
    firstSeenAt: timestamp("first_seen_at", { withTimezone: true }).notNull().defaultNow(),
    lastSeenAt: timestamp("last_seen_at", { withTimezone: true }).notNull().defaultNow(),
    occurrenceCount: integer("occurrence_count").notNull().default(1),
    latestPriorityScore: numeric("latest_priority_score", {
      precision: 6,
      scale: 2,
      mode: "number",
    }),
    scoreBreakdown: jsonb("score_breakdown").$type<Record<string, unknown>>(),
    structureObservations: jsonb("structure_observations").$type<Record<string, unknown>>(),
    sourceSnapshotIds: integer("source_snapshot_ids").array().notNull().default([]),
    createdOpportunityId: integer("created_opportunity_id").references(
      () => opportunitiesTable.id,
      { onDelete: "set null" },
    ),
    duplicateOfOpportunityId: integer("duplicate_of_opportunity_id").references(
      () => opportunitiesTable.id,
      { onDelete: "set null" },
    ),
  },
  (table) => [
    uniqueIndex("discovery_candidates_key_unique").on(table.discoveryKey),
    index("discovery_candidates_status_idx").on(table.status),
    index("discovery_candidates_cluster_idx").on(table.clusterKey),
  ],
);

export const discoveryObservationLinksTable = pgTable(
  "discovery_observation_links",
  {
    id: serial("id").primaryKey(),
    observationId: integer("observation_id")
      .notNull()
      .references(() => discoveryActorObservationsTable.id, { onDelete: "cascade" }),
    candidateId: integer("candidate_id").references(
      () => discoveryCandidatesTable.id,
      { onDelete: "cascade" },
    ),
    opportunityId: integer("opportunity_id").references(
      () => opportunitiesTable.id,
      { onDelete: "cascade" },
    ),
    auditRecordId: text("audit_record_id"),
  },
  (table) => [
    uniqueIndex("discovery_observation_links_unique").on(
      table.observationId,
      table.candidateId,
      table.opportunityId,
      table.auditRecordId,
    ),
    index("discovery_observation_links_observation_idx").on(table.observationId),
    index("discovery_observation_links_candidate_idx").on(table.candidateId),
    index("discovery_observation_links_opportunity_idx").on(table.opportunityId),
  ],
);