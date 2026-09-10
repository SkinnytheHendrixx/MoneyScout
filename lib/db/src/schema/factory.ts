import {
  boolean,
  index,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { betsTable, type BetBuildEnvelope } from "./bet";
import { buildJobsTable } from "./build";
import { evaluationCyclesTable } from "./lifecycle";
import { opportunitiesTable } from "./money-scout";

export type FactoryRunStatus =
  | "SYNTHESIZING_PRODUCT"
  | "PRODUCT_REVIEW"
  | "PRODUCT_BLOCKED"
  | "COMPOSING_ARCHITECTURE"
  | "ARCHITECTURE_REVIEW"
  | "ARCHITECTURE_BLOCKED"
  | "INSUFFICIENT_ENVELOPE"
  | "REPOSITORY_PENDING"
  | "REPOSITORY_BLOCKED"
  | "READY_FOR_BUILDER"
  | "BUILDER_RUNNING"
  | "BUILDER_BLOCKED"
  | "QA_PENDING"
  | "CHALLENGED"
  | "CANCELLED"
  | "FAILED"
  | "COMPLETE";

export type ProductDefinitionStatus =
  "DRAFT" | "REVIEW_BLOCKED" | "FROZEN" | "SUPERSEDED";

export type RequirementOrigin =
  "COMMERCIAL_CONTRACT" | "EVIDENCE" | "FACTORY_STANDARD" | "BOUNDED_JUDGMENT";

export type RequirementRole =
  | "CORE"
  | "CATEGORY_STANDARD"
  | "DIFFERENTIATING"
  | "QUALITY"
  | "OPERATIONS"
  | "SPECULATIVE";

export type ProductRequirement = {
  id: string;
  text: string;
  role: RequirementRole;
  origin: RequirementOrigin;
  evidenceRefs: string[];
  rationale: string;
  confidence: "KNOWN" | "BOUNDED" | "UNKNOWN";
  complexityImpact: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  acceptanceCondition: string;
  status: "INCLUDED" | "DEFERRED" | "UNRESOLVED" | "REJECTED";
};

export type ProductDefinitionDocument = {
  schemaVersion: 1;
  lineage: {
    opportunityId: number;
    evaluationCycleId: number | null;
    betId: number;
    buildEnvelopeFingerprint: string;
    inputSnapshotFingerprint: string;
  };
  commercialTruth: {
    targetBuyer: string;
    validatedProblem: string;
    promisedOutcome: string;
    monetization: Record<string, unknown>;
  };
  actors: string[];
  customerSurfaces: string[];
  workflows: string[];
  requirements: ProductRequirement[];
  nonGoals: string[];
  unresolvedQuestions: string[];
  competitiveFirstRelease: true;
};

export type TechnicalObligation = {
  id: string;
  requirementId: string;
  kind: string;
  statement: string;
};

export type RequirementGraphDocument = {
  schemaVersion: 1;
  productDefinitionFingerprint: string;
  obligations: TechnicalObligation[];
  edges: Array<{
    from: string;
    to: string;
    relation: "REQUIRES" | "SATISFIED_BY";
  }>;
};

export type ArchitectureComponent = {
  id: string;
  name: string;
  kind: string;
  obligations: string[];
  requirementIds: string[];
};

export type CapabilityBinding = {
  familyKey: string;
  implementationKey: string | null;
  version: number | null;
  fingerprint: string | null;
  outcome: "PINNED" | "CUSTOM_BUILD_REQUIRED";
  conformanceTests: string[];
};

export type ArchitecturePlanDocument = {
  schemaVersion: 1;
  lineage: {
    betId: number;
    productDefinitionId: number;
    productDefinitionVersion: number;
    productDefinitionFingerprint: string;
    buildEnvelope: BetBuildEnvelope;
    buildEnvelopeFingerprint: string;
  };
  topology: string;
  customerSurfaces: string[];
  components: ArchitectureComponent[];
  technicalObligations: TechnicalObligation[];
  dataFlows: string[];
  persistence: string[];
  backgroundWork: string[];
  providerClasses: string[];
  capabilityBindings: CapabilityBinding[];
  customBuildRequirements: string[];
  securityBoundaries: string[];
  secretBoundaries: string[];
  observabilityContract: string[];
  failureRecovery: string[];
  rollbackPlan: string[];
  capacityAssumptions: Array<{
    statement: string;
    provenance: "ARCHITECTURE_ASSUMPTION";
    reviewTrigger: string;
  }>;
  expectedExternalBuildCostCents: number | null;
  expectedOperatingCost: Record<string, unknown>;
  buildComplexity: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  maintenanceBurden: "LOW" | "MEDIUM" | "HIGH" | "UNKNOWN";
  reversibility: "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";
  builderDiscretion: string[];
  lockedDecisions: string[];
  acceptanceConditions: string[];
  unresolvedTechnicalRisks: string[];
};

export type FactoryReviewDefect = {
  key: string;
  critic: string;
  category: string;
  severity: "FATAL" | "HIGH" | "MEDIUM" | "LOW";
  summary: string;
  repairTarget: string;
  affectedRequirementIds: string[];
};

export type SoftwareCapabilityLifecycle =
  | "CANDIDATE"
  | "QUALIFIED"
  | "PROVEN"
  | "PREFERRED"
  | "DEGRADED"
  | "QUARANTINED"
  | "DEPRECATED"
  | "RETIRED";

export type BuilderTerminalOutcome =
  | "IMPLEMENTATION_READY"
  | "ARCHITECTURE_CHALLENGE"
  | "PRODUCT_CONTRACT_CHALLENGE"
  | "DEPENDENCY_BLOCKED"
  | "RESOURCE_BLOCKED"
  | "PROVIDER_FAILURE"
  | "CANCELLED";

export type BuilderUsage = {
  model: string | null;
  inputTokens: number | null;
  cachedInputTokens: number | null;
  outputTokens: number | null;
  reasoningTokens: number | null;
  durationMs: number | null;
  entitlementUnits: number | null;
};

export const assetFactoryRunsTable = pgTable(
  "asset_factory_runs",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    evaluationCycleId: integer("evaluation_cycle_id").references(
      () => evaluationCyclesTable.id,
      { onDelete: "set null" },
    ),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    status: text("status").$type<FactoryRunStatus>().notNull(),
    inputSnapshot: jsonb("input_snapshot")
      .$type<Record<string, unknown>>()
      .notNull(),
    inputFingerprint: text("input_fingerprint").notNull(),
    productDefinitionId: integer("product_definition_id"),
    architecturePlanId: integer("architecture_plan_id"),
    assetRepositoryId: integer("asset_repository_id"),
    buildJobId: integer("build_job_id"),
    blockerCode: text("blocker_code"),
    nextAction: text("next_action").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
  },
  (table) => [
    uniqueIndex("asset_factory_runs_idempotency_unique").on(
      table.idempotencyKey,
    ),
    index("asset_factory_runs_bet_idx").on(table.betId, table.createdAt),
    index("asset_factory_runs_status_idx").on(table.status, table.updatedAt),
  ],
);

export const productDefinitionsTable = pgTable(
  "product_definitions",
  {
    id: serial("id").primaryKey(),
    factoryRunId: integer("factory_run_id")
      .notNull()
      .references(() => assetFactoryRunsTable.id, { onDelete: "cascade" }),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    previousDefinitionId: integer("previous_definition_id"),
    version: integer("version").notNull(),
    status: text("status").$type<ProductDefinitionStatus>().notNull(),
    fingerprint: text("fingerprint").notNull(),
    inputSnapshotFingerprint: text("input_snapshot_fingerprint").notNull(),
    document: jsonb("document").$type<ProductDefinitionDocument>().notNull(),
    revisionReason: text("revision_reason").notNull(),
    changeClassification: text("change_classification").notNull(),
    changedRequirementIds: jsonb("changed_requirement_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    betImpact: text("bet_impact").notNull(),
    acceptanceImpact: text("acceptance_impact").notNull(),
    frozenAt: timestamp("frozen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("product_definitions_bet_version_unique").on(
      table.betId,
      table.version,
    ),
    uniqueIndex("product_definitions_fingerprint_unique").on(table.fingerprint),
    index("product_definitions_run_idx").on(table.factoryRunId),
  ],
);

export const requirementGraphsTable = pgTable(
  "requirement_graphs",
  {
    id: serial("id").primaryKey(),
    productDefinitionId: integer("product_definition_id")
      .notNull()
      .references(() => productDefinitionsTable.id, { onDelete: "cascade" }),
    fingerprint: text("fingerprint").notNull(),
    graph: jsonb("graph").$type<RequirementGraphDocument>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("requirement_graphs_product_unique").on(
      table.productDefinitionId,
    ),
    uniqueIndex("requirement_graphs_fingerprint_unique").on(table.fingerprint),
  ],
);

export const softwareCapabilityFamiliesTable = pgTable(
  "software_capability_families",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    name: text("name").notNull(),
    functionalContract: jsonb("functional_contract")
      .$type<Record<string, unknown>>()
      .notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("software_capability_families_key_unique").on(table.key),
  ],
);

export const softwareCapabilityImplementationsTable = pgTable(
  "software_capability_implementations",
  {
    id: serial("id").primaryKey(),
    familyId: integer("family_id")
      .notNull()
      .references(() => softwareCapabilityFamiliesTable.id, {
        onDelete: "restrict",
      }),
    implementationKey: text("implementation_key").notNull(),
    version: integer("version").notNull(),
    lifecycleStatus: text("lifecycle_status")
      .$type<SoftwareCapabilityLifecycle>()
      .notNull(),
    fingerprint: text("fingerprint").notNull(),
    contract: jsonb("contract").$type<Record<string, unknown>>().notNull(),
    supportedRuntimeTypes: jsonb("supported_runtime_types")
      .$type<string[]>()
      .notNull()
      .default([]),
    dependencyBindings: jsonb("dependency_bindings")
      .$type<
        Array<{ familyKey: string; implementationKey: string; version: number }>
      >()
      .notNull()
      .default([]),
    scaffoldSource: text("scaffold_source"),
    builderRequirements: jsonb("builder_requirements")
      .$type<string[]>()
      .notNull()
      .default([]),
    conformanceTests: jsonb("conformance_tests")
      .$type<string[]>()
      .notNull()
      .default([]),
    externalCostModel: jsonb("external_cost_model")
      .$type<Record<string, unknown>>()
      .notNull(),
    costProvenance: jsonb("cost_provenance")
      .$type<Record<string, unknown>>()
      .notNull(),
    maintenanceBurden: text("maintenance_burden").notNull(),
    operationalBurden: text("operational_burden").notNull(),
    healthContract: jsonb("health_contract")
      .$type<string[]>()
      .notNull()
      .default([]),
    securityImplications: jsonb("security_implications")
      .$type<string[]>()
      .notNull()
      .default([]),
    secretRequirements: jsonb("secret_requirements")
      .$type<string[]>()
      .notNull()
      .default([]),
    authorityImplications: jsonb("authority_implications")
      .$type<string[]>()
      .notNull()
      .default([]),
    knownLimitations: jsonb("known_limitations")
      .$type<string[]>()
      .notNull()
      .default([]),
    evidence: jsonb("evidence").$type<Record<string, unknown>>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("software_capability_implementation_version_unique").on(
      table.implementationKey,
      table.version,
    ),
    uniqueIndex("software_capability_implementation_fingerprint_unique").on(
      table.fingerprint,
    ),
    index("software_capability_implementation_family_idx").on(
      table.familyId,
      table.lifecycleStatus,
    ),
  ],
);

export const architecturePlansTable = pgTable(
  "architecture_plans",
  {
    id: serial("id").primaryKey(),
    factoryRunId: integer("factory_run_id")
      .notNull()
      .references(() => assetFactoryRunsTable.id, { onDelete: "cascade" }),
    productDefinitionId: integer("product_definition_id")
      .notNull()
      .references(() => productDefinitionsTable.id, { onDelete: "cascade" }),
    requirementGraphId: integer("requirement_graph_id")
      .notNull()
      .references(() => requirementGraphsTable.id, { onDelete: "cascade" }),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    previousPlanId: integer("previous_plan_id"),
    version: integer("version").notNull(),
    status: text("status").notNull(),
    fingerprint: text("fingerprint").notNull(),
    document: jsonb("document").$type<ArchitecturePlanDocument>().notNull(),
    revisionReason: text("revision_reason").notNull(),
    frozenAt: timestamp("frozen_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("architecture_plans_product_version_unique").on(
      table.productDefinitionId,
      table.version,
    ),
    uniqueIndex("architecture_plans_fingerprint_unique").on(table.fingerprint),
    index("architecture_plans_run_idx").on(table.factoryRunId),
  ],
);

export const factoryReviewDefectsTable = pgTable(
  "factory_review_defects",
  {
    id: serial("id").primaryKey(),
    factoryRunId: integer("factory_run_id")
      .notNull()
      .references(() => assetFactoryRunsTable.id, { onDelete: "cascade" }),
    reviewStage: text("review_stage").notNull(),
    subjectFingerprint: text("subject_fingerprint").notNull(),
    defectKey: text("defect_key").notNull(),
    critic: text("critic").notNull(),
    category: text("category").notNull(),
    severity: text("severity").notNull(),
    fatal: boolean("fatal").notNull(),
    summary: text("summary").notNull(),
    repairTarget: text("repair_target").notNull(),
    affectedRequirementIds: jsonb("affected_requirement_ids")
      .$type<string[]>()
      .notNull()
      .default([]),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("factory_review_defects_identity_unique").on(
      table.factoryRunId,
      table.reviewStage,
      table.subjectFingerprint,
      table.defectKey,
    ),
    index("factory_review_defects_run_idx").on(table.factoryRunId, table.fatal),
  ],
);

export const assetRepositoriesTable = pgTable(
  "asset_repositories",
  {
    id: serial("id").primaryKey(),
    opportunityId: integer("opportunity_id")
      .notNull()
      .references(() => opportunitiesTable.id, { onDelete: "cascade" }),
    betId: integer("bet_id")
      .notNull()
      .references(() => betsTable.id, { onDelete: "cascade" }),
    assetKey: text("asset_key").notNull(),
    internalSlug: text("internal_slug").notNull(),
    provider: text("provider").notNull(),
    status: text("status").notNull(),
    repositoryUrl: text("repository_url"),
    repositoryExternalId: text("repository_external_id"),
    defaultBranch: text("default_branch").notNull().default("main"),
    baseCommitSha: text("base_commit_sha"),
    manifestsFingerprint: text("manifests_fingerprint").notNull(),
    manifestFiles: jsonb("manifest_files")
      .$type<Record<string, string>>()
      .notNull(),
    lastErrorCode: text("last_error_code"),
    lastErrorMessage: text("last_error_message"),
    provisionedAt: timestamp("provisioned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("asset_repositories_bet_unique").on(table.betId),
    uniqueIndex("asset_repositories_asset_key_unique").on(table.assetKey),
    uniqueIndex("asset_repositories_slug_unique").on(table.internalSlug),
    index("asset_repositories_status_idx").on(table.status, table.updatedAt),
  ],
);

export const builderGatewayRunsTable = pgTable(
  "builder_gateway_runs",
  {
    id: serial("id").primaryKey(),
    buildJobId: integer("build_job_id")
      .notNull()
      .references(() => buildJobsTable.id, { onDelete: "cascade" }),
    assetRepositoryId: integer("asset_repository_id")
      .notNull()
      .references(() => assetRepositoriesTable.id, { onDelete: "cascade" }),
    idempotencyKey: text("idempotency_key").notNull(),
    provider: text("provider").notNull(),
    providerRunId: text("provider_run_id"),
    providerThreadId: text("provider_thread_id"),
    status: text("status").notNull(),
    terminalOutcome: text("terminal_outcome").$type<BuilderTerminalOutcome>(),
    attemptNumber: integer("attempt_number").notNull().default(1),
    repairNumber: integer("repair_number").notNull().default(0),
    branchName: text("branch_name").notNull(),
    baseCommitSha: text("base_commit_sha"),
    resultCommitSha: text("result_commit_sha"),
    isolatedWorkspacePath: text("isolated_workspace_path"),
    leaseOwner: text("lease_owner"),
    leaseExpiresAt: timestamp("lease_expires_at", { withTimezone: true }),
    usage: jsonb("usage").$type<BuilderUsage>().notNull(),
    actualExternalCashCostCents: integer("actual_external_cash_cost_cents"),
    costProvenance: text("cost_provenance").notNull(),
    entitlementConsumption: jsonb("entitlement_consumption")
      .$type<Record<string, unknown>>()
      .notNull(),
    resultSummary: text("result_summary"),
    challenge: jsonb("challenge").$type<Record<string, unknown>>(),
    requestPayload: jsonb("request_payload")
      .$type<Record<string, unknown>>()
      .notNull()
      .default({}),
    cancellationRequestedAt: timestamp("cancellation_requested_at", {
      withTimezone: true,
    }),
    startedAt: timestamp("started_at", { withTimezone: true }),
    finishedAt: timestamp("finished_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [
    uniqueIndex("builder_gateway_runs_idempotency_unique").on(
      table.idempotencyKey,
    ),
    index("builder_gateway_runs_build_idx").on(
      table.buildJobId,
      table.attemptNumber,
    ),
    index("builder_gateway_runs_status_idx").on(table.status, table.updatedAt),
  ],
);

export const assetFactoryEventsTable = pgTable(
  "asset_factory_events",
  {
    id: serial("id").primaryKey(),
    factoryRunId: integer("factory_run_id")
      .notNull()
      .references(() => assetFactoryRunsTable.id, { onDelete: "cascade" }),
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
  (table) => [
    index("asset_factory_events_run_idx").on(
      table.factoryRunId,
      table.occurredAt,
    ),
  ],
);
