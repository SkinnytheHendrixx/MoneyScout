import { and, asc, desc, eq, inArray, isNull } from "drizzle-orm";
import {
  architecturePlansTable,
  assetFactoryEventsTable,
  assetFactoryRunsTable,
  assetRepositoriesTable,
  betEventsTable,
  betsTable,
  buildJobsTable,
  capabilitiesTable,
  db,
  factoryReviewDefectsTable,
  productDefinitionsTable,
  requirementGraphsTable,
  softwareCapabilityFamiliesTable,
  softwareCapabilityImplementationsTable,
  type BetStatus,
  type FactoryReviewDefect,
  type PersistedBuildContract,
} from "@workspace/db";
import {
  composeArchitecturePlan,
  architectureReviewPasses,
  capabilityFamiliesForArchitecture,
  reviewArchitecture,
} from "./architecture-composer";
import {
  assetRepositoryIdentity,
  compileAssetRepositoryManifests,
} from "./asset-repo-contract";
import {
  configuredAssetRepositoryProvisioner,
  type AssetRepositoryProvisioner,
} from "./asset-repository-provisioner";
import { builderProfileFor } from "./build-orchestrator";
import { compileBuildContractV2 } from "./build-contract-v2";
import { factoryFingerprint } from "./factory-fingerprint";
import {
  createOrReuseHumanAction,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
} from "./human-gates";
import {
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
} from "./lifecycle-state";
import { createMonetizationExecutionPlan } from "./monetization-execution-plan";
import {
  assertFrozenProductDefinitionUnchanged,
  compileProductDefinition,
  compileRequirementGraph,
  productReviewPasses,
  reviewProductCompleteness,
} from "./product-definition";
import {
  selectSoftwareCapabilities,
  type CatalogImplementation,
} from "./software-capability-catalog";
import { loadCommercialBuildBrief } from "../routes/commercial-build";

export const FACTORY_ALLOWED_BET_STATES: BetStatus[] = ["APPROVED", "ACTIVE"];

export function factoryBetMayProgress(status: BetStatus): boolean {
  return FACTORY_ALLOWED_BET_STATES.includes(status);
}

async function recordFactoryEvent(input: {
  runId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}): Promise<void> {
  await db.insert(assetFactoryEventsTable).values({
    factoryRunId: input.runId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function persistReviewDefects(input: {
  runId: number;
  stage: "PRODUCT" | "ARCHITECTURE";
  subjectFingerprint: string;
  defects: FactoryReviewDefect[];
}): Promise<void> {
  for (const defect of input.defects) {
    await db
      .insert(factoryReviewDefectsTable)
      .values({
        factoryRunId: input.runId,
        reviewStage: input.stage,
        subjectFingerprint: input.subjectFingerprint,
        defectKey: defect.key,
        critic: defect.critic,
        category: defect.category,
        severity: defect.severity,
        fatal: defect.severity === "FATAL",
        summary: defect.summary,
        repairTarget: defect.repairTarget,
        affectedRequirementIds: defect.affectedRequirementIds,
      })
      .onConflictDoNothing();
  }
}

function knownCashCeiling(model: Record<string, unknown>): number | null {
  const value =
    model.maximumExternalCashCents ?? model.maximum_external_cash_cents;
  if (value == null) return null;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 ? parsed : null;
}

async function loadCatalog(): Promise<CatalogImplementation[]> {
  const rows = await db
    .select({
      familyKey: softwareCapabilityFamiliesTable.key,
      implementation: softwareCapabilityImplementationsTable,
    })
    .from(softwareCapabilityImplementationsTable)
    .innerJoin(
      softwareCapabilityFamiliesTable,
      eq(
        softwareCapabilityImplementationsTable.familyId,
        softwareCapabilityFamiliesTable.id,
      ),
    );
  return rows.map(({ familyKey, implementation }) => {
    const contract = implementation.contract;
    return {
      familyKey,
      implementationKey: implementation.implementationKey,
      version: implementation.version,
      lifecycleStatus: implementation.lifecycleStatus,
      fingerprint: implementation.fingerprint,
      supportedRuntimeTypes: implementation.supportedRuntimeTypes,
      dependencies: implementation.dependencyBindings,
      conformanceTests: implementation.conformanceTests,
      maximumExternalCashCents: knownCashCeiling(
        implementation.externalCostModel,
      ),
      maintenanceBurden:
        implementation.maintenanceBurden as CatalogImplementation["maintenanceBurden"],
      operationalBurden:
        implementation.operationalBurden as CatalogImplementation["operationalBurden"],
      requiresOperationalCapabilities: Array.isArray(
        contract.requiresOperationalCapabilities,
      )
        ? contract.requiresOperationalCapabilities.filter(
            (value): value is string => typeof value === "string",
          )
        : [],
    };
  });
}

async function availableOperationalCapabilities(): Promise<Set<string>> {
  const rows = await db
    .select({ key: capabilitiesTable.key })
    .from(capabilitiesTable)
    .where(
      and(
        eq(capabilitiesTable.status, "AVAILABLE"),
        eq(capabilitiesTable.accessLevel, "AUTOMATION_READY"),
      ),
    );
  return new Set(rows.map((row) => row.key));
}

function repoProvisionIdempotencyKey(
  betId: number,
  manifestsFingerprint: string,
): string {
  return `asset-repository:bet-${betId}:manifests-${manifestsFingerprint}`;
}

async function blockForRepositoryCapability(
  run: typeof assetFactoryRunsTable.$inferSelect,
  repository: typeof assetRepositoriesTable.$inferSelect,
): Promise<void> {
  await createOrReuseHumanAction({
    opportunityId: run.opportunityId,
    actionType: "CONNECT_ASSET_REPOSITORY_PROVIDER",
    title: "Connect private Asset repository provisioning",
    whyNeeded:
      "The Factory has frozen the product and architecture, but no automation-ready repository provisioner with narrow Asset-repository access is configured.",
    instructions:
      "Connect the private Git repository provisioner through the secret/integration mechanism. Do not paste a GitHub token into Money Scout records or grant the coding agent repository credentials.",
    blockedStage: `ASSET_FACTORY_REPOSITORY:${run.id}`,
    requiredCapabilityKey: "ASSET_REPOSITORY_PROVISIONER_ACCESS",
    provider: "GIT_REPOSITORY_PROVIDER",
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: {
      factory_run_id: run.id,
      asset_repository_id: repository.id,
    },
    inherentlyHumanAuthority: true,
  });
  await db
    .update(assetRepositoriesTable)
    .set({
      status: "HUMAN_BLOCKED",
      lastErrorCode: "ASSET_REPOSITORY_PROVISIONER_ACCESS_REQUIRED",
      lastErrorMessage: "No configured repository provisioner is available.",
      updatedAt: new Date(),
    })
    .where(eq(assetRepositoriesTable.id, repository.id));
  await db
    .update(assetFactoryRunsTable)
    .set({
      status: "REPOSITORY_BLOCKED",
      blockerCode: "ASSET_REPOSITORY_PROVISIONER_ACCESS_REQUIRED",
      nextAction:
        "Connect private repository provisioning; Factory will resume automatically.",
      updatedAt: new Date(),
    })
    .where(eq(assetFactoryRunsTable.id, run.id));
}

async function provisionRepository(input: {
  run: typeof assetFactoryRunsTable.$inferSelect;
  repository: typeof assetRepositoriesTable.$inferSelect;
  provisioner: AssetRepositoryProvisioner;
}) {
  const result = await input.provisioner.provision({
    assetKey: input.repository.assetKey,
    internalSlug: input.repository.internalSlug,
    idempotencyKey: repoProvisionIdempotencyKey(
      input.run.betId,
      input.repository.manifestsFingerprint,
    ),
    defaultBranch: input.repository.defaultBranch,
    manifestFiles: input.repository.manifestFiles,
  });
  const now = new Date();
  const [updated] = await db
    .update(assetRepositoriesTable)
    .set({
      provider: result.provider,
      status: "PROVISIONED",
      repositoryUrl: result.repositoryUrl,
      repositoryExternalId: result.repositoryExternalId,
      defaultBranch: result.defaultBranch,
      baseCommitSha: result.baseCommitSha,
      lastErrorCode: null,
      lastErrorMessage: null,
      provisionedAt: now,
      updatedAt: now,
    })
    .where(eq(assetRepositoriesTable.id, input.repository.id))
    .returning();
  if (!updated) throw new Error("ASSET_REPOSITORY_UPDATE_FAILED");
  await setCapabilityAvailable({
    key: "ASSET_REPOSITORY_PROVISIONER_ACCESS",
    provider: result.provider,
    verificationMethod: "SUCCESSFUL_IDEMPOTENT_REPOSITORY_PROVISION",
    metadata: { repository_external_id: result.repositoryExternalId },
  });
  await resolveOpenActionsForCapability({
    capabilityKey: "ASSET_REPOSITORY_PROVISIONER_ACCESS",
    resolutionData: { detected_automatically: true, provider: result.provider },
  });
  return updated;
}

export type StartFactoryResult =
  | { kind: "NOT_FOUND" }
  | { kind: "BET_REQUIRED" }
  | { kind: "BET_INACTIVE"; betStatus: BetStatus }
  | { kind: "UPSTREAM_BLOCKED"; blockers: string[] }
  | {
      kind: "RUN";
      run: typeof assetFactoryRunsTable.$inferSelect;
      reused: boolean;
    };

export async function startAssetFactoryRun(input: {
  opportunityId: number;
  requestedBetId?: number | null;
  provisioner?: AssetRepositoryProvisioner | null;
}): Promise<StartFactoryResult> {
  const brief = await loadCommercialBuildBrief(input.opportunityId);
  if (!brief) return { kind: "NOT_FOUND" };
  const plan = createMonetizationExecutionPlan(brief);
  if (plan.status !== "READY_FOR_INTERNAL_BUILD") {
    return {
      kind: "UPSTREAM_BLOCKED",
      blockers: [
        ...brief.eligibility.blockers,
        ...plan.blockers,
        ...plan.commercialNormalizationNeeded,
      ],
    };
  }
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(
      and(
        eq(betsTable.opportunityId, input.opportunityId),
        input.requestedBetId
          ? eq(betsTable.id, input.requestedBetId)
          : inArray(betsTable.status, FACTORY_ALLOWED_BET_STATES),
      ),
    )
    .orderBy(desc(betsTable.updatedAt))
    .limit(1);
  if (!bet) return { kind: "BET_REQUIRED" };
  if (!factoryBetMayProgress(bet.status)) {
    return { kind: "BET_INACTIVE", betStatus: bet.status };
  }
  if (
    !bet.buildEnvelope.permittedProductScope.includes(
      brief.buildContract.route.primaryShape,
    )
  ) {
    return {
      kind: "UPSTREAM_BLOCKED",
      blockers: [
        "Primary product shape is outside the approved Build Envelope.",
      ],
    };
  }
  const cycle = await getActiveEvaluationCycle(input.opportunityId);
  const inputSnapshot = {
    schemaVersion: 1,
    capturedAt: new Date().toISOString(),
    opportunityId: input.opportunityId,
    evaluationCycleId: cycle?.id ?? null,
    commercialBuildBrief: brief,
    monetizationExecutionPlan: plan,
    approvedBet: bet,
    policyAndAuthority: {
      betGrantsDownstreamAuthority: false,
      providerSpendAuthorized: false,
      customerChargingAllowed: false,
      publicReleaseAllowed: false,
      outboundAllowed: false,
      advertisingAllowed: false,
      productionCredentialsAllowed: false,
      customDomainAllowed: false,
    },
  };
  const fingerprintableSnapshot = {
    schemaVersion: 1,
    opportunityId: input.opportunityId,
    evaluationCycleId: cycle?.id ?? null,
    commercialBuildBrief: brief,
    monetizationExecutionPlan: plan,
    bet: {
      id: bet.id,
      opportunityId: bet.opportunityId,
      evaluationCycleId: bet.evaluationCycleId,
      decisionContract: bet.decisionContract,
      buildEnvelope: bet.buildEnvelope,
      allocatedExternalCashCents: bet.allocatedExternalCashCents,
    },
  };
  const inputFingerprint = factoryFingerprint(fingerprintableSnapshot);
  const idempotencyKey = `asset-factory:bet-${bet.id}:${inputFingerprint}`;
  const [created] = await db
    .insert(assetFactoryRunsTable)
    .values({
      opportunityId: input.opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      betId: bet.id,
      idempotencyKey,
      status: "SYNTHESIZING_PRODUCT",
      inputSnapshot,
      inputFingerprint,
      nextAction: "Compile and adversarially review the Product Definition.",
    })
    .onConflictDoNothing({ target: assetFactoryRunsTable.idempotencyKey })
    .returning();
  const run =
    created ??
    (
      await db
        .select()
        .from(assetFactoryRunsTable)
        .where(eq(assetFactoryRunsTable.idempotencyKey, idempotencyKey))
    )[0];
  if (!run) throw new Error("ASSET_FACTORY_IDEMPOTENCY_RECOVERY_FAILED");
  if (created) {
    const superseded = await db
      .select()
      .from(assetFactoryRunsTable)
      .where(
        and(
          eq(assetFactoryRunsTable.betId, bet.id),
          isNull(assetFactoryRunsTable.buildJobId),
        ),
      );
    for (const prior of superseded.filter(
      (item) =>
        item.id !== run.id &&
        !["CANCELLED", "FAILED", "COMPLETE"].includes(item.status),
    )) {
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: "CANCELLED",
          blockerCode: "SUPERSEDED_BEFORE_BUILD",
          nextAction: `Superseded by Factory run ${run.id} after a material input change.`,
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(assetFactoryRunsTable.id, prior.id));
      await recordFactoryEvent({
        runId: prior.id,
        opportunityId: prior.opportunityId,
        eventType: "FACTORY_RUN_SUPERSEDED",
        summary: `Material input change created Product Definition revision run ${run.id}; the pre-Build run was cancelled without mutating its frozen document.`,
        metadata: { superseding_factory_run_id: run.id },
      });
    }
    await recordFactoryEvent({
      runId: run.id,
      opportunityId: run.opportunityId,
      eventType: "FACTORY_RUN_CREATED",
      summary:
        "Approved Bet entered the Asset Factory with an immutable input snapshot.",
      metadata: {
        bet_id: bet.id,
        input_fingerprint: inputFingerprint,
        downstream_authority_granted: false,
      },
    });
  }
  await advanceAssetFactoryRun(run.id, input.provisioner);
  const [advanced] = await db
    .select()
    .from(assetFactoryRunsTable)
    .where(eq(assetFactoryRunsTable.id, run.id));
  if (!advanced) throw new Error("ASSET_FACTORY_RUN_DISAPPEARED");
  return { kind: "RUN", run: advanced, reused: !created };
}

export async function advanceAssetFactoryRun(
  runId: number,
  provisionerOverride?: AssetRepositoryProvisioner | null,
): Promise<void> {
  let [run] = await db
    .select()
    .from(assetFactoryRunsTable)
    .where(eq(assetFactoryRunsTable.id, runId));
  if (
    !run ||
    [
      "CANCELLED",
      "FAILED",
      "PRODUCT_BLOCKED",
      "ARCHITECTURE_BLOCKED",
      "INSUFFICIENT_ENVELOPE",
      "READY_FOR_BUILDER",
      "QA_PENDING",
    ].includes(run.status)
  )
    return;
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, run.betId));
  if (!bet || !factoryBetMayProgress(bet.status)) {
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: "CANCELLED",
        blockerCode: `BET_${bet?.status ?? "MISSING"}`,
        nextAction: "No new Factory work may continue for an inactive Bet.",
        finishedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(assetFactoryRunsTable.id, run.id));
    return;
  }
  const snapshot = run.inputSnapshot as {
    commercialBuildBrief: Awaited<ReturnType<typeof loadCommercialBuildBrief>>;
    monetizationExecutionPlan: ReturnType<
      typeof createMonetizationExecutionPlan
    >;
  };
  if (!snapshot.commercialBuildBrief)
    throw new Error("FACTORY_INPUT_SNAPSHOT_INVALID");

  let [definition] = await db
    .select()
    .from(productDefinitionsTable)
    .where(eq(productDefinitionsTable.factoryRunId, run.id))
    .orderBy(desc(productDefinitionsTable.version))
    .limit(1);
  if (!definition) {
    const document = compileProductDefinition({
      opportunityId: run.opportunityId,
      evaluationCycleId: run.evaluationCycleId,
      betId: run.betId,
      buildEnvelope: bet.buildEnvelope,
      brief: snapshot.commercialBuildBrief,
      monetizationPlan: snapshot.monetizationExecutionPlan,
      inputSnapshotFingerprint: run.inputFingerprint,
    });
    const fingerprint = factoryFingerprint(document);
    const [previous] = await db
      .select()
      .from(productDefinitionsTable)
      .where(eq(productDefinitionsTable.betId, run.betId))
      .orderBy(desc(productDefinitionsTable.version))
      .limit(1);
    const [inserted] = await db
      .insert(productDefinitionsTable)
      .values({
        factoryRunId: run.id,
        opportunityId: run.opportunityId,
        betId: run.betId,
        previousDefinitionId: previous?.id ?? null,
        version: (previous?.version ?? 0) + 1,
        status: "DRAFT",
        fingerprint,
        inputSnapshotFingerprint: run.inputFingerprint,
        document,
        revisionReason: previous
          ? "Material upstream Factory input changed; created a new immutable version."
          : "Initial competitive-first Product Definition.",
        changeClassification: previous ? "BUILD_REVISION" : "INITIAL",
        changedRequirementIds: document.requirements.map((item) => item.id),
        betImpact: previous
          ? "Requires revalidation against the same authoritative Bet envelope."
          : "Initial scope is constrained by the approved Bet.",
        acceptanceImpact:
          "All included requirements compile into independent QA acceptance criteria.",
      })
      .returning();
    if (!inserted) throw new Error("PRODUCT_DEFINITION_CREATE_FAILED");
    definition = inserted;
  }
  assertFrozenProductDefinitionUnchanged({
    storedFingerprint: definition.fingerprint,
    document: definition.document,
  });
  const productDefects = reviewProductCompleteness(definition.document);
  await persistReviewDefects({
    runId: run.id,
    stage: "PRODUCT",
    subjectFingerprint: definition.fingerprint,
    defects: productDefects,
  });
  if (!productReviewPasses(productDefects)) {
    await db
      .update(productDefinitionsTable)
      .set({ status: "REVIEW_BLOCKED", updatedAt: new Date() })
      .where(eq(productDefinitionsTable.id, definition.id));
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: "PRODUCT_BLOCKED",
        productDefinitionId: definition.id,
        blockerCode: "PRODUCT_COMPLETENESS_FATAL_DEFECT",
        nextAction:
          "Repair the concrete Product Definition defects without changing commercial truth.",
        updatedAt: new Date(),
      })
      .where(eq(assetFactoryRunsTable.id, run.id));
    return;
  }
  if (definition.status !== "FROZEN") {
    const now = new Date();
    [definition] = await db
      .update(productDefinitionsTable)
      .set({ status: "FROZEN", frozenAt: now, updatedAt: now })
      .where(eq(productDefinitionsTable.id, definition.id))
      .returning();
    await recordFactoryEvent({
      runId: run.id,
      opportunityId: run.opportunityId,
      eventType: "PRODUCT_DEFINITION_FROZEN",
      summary: `Product Definition v${definition.version} passed adversarial completeness review and is frozen.`,
      metadata: {
        product_definition_id: definition.id,
        fingerprint: definition.fingerprint,
      },
    });
  }

  let [graph] = await db
    .select()
    .from(requirementGraphsTable)
    .where(eq(requirementGraphsTable.productDefinitionId, definition.id));
  if (!graph) {
    const graphDocument = compileRequirementGraph(definition.document);
    [graph] = await db
      .insert(requirementGraphsTable)
      .values({
        productDefinitionId: definition.id,
        fingerprint: factoryFingerprint(graphDocument),
        graph: graphDocument,
      })
      .returning();
  }
  if (!graph) throw new Error("REQUIREMENT_GRAPH_CREATE_FAILED");

  let [architecture] = await db
    .select()
    .from(architecturePlansTable)
    .where(eq(architecturePlansTable.factoryRunId, run.id))
    .orderBy(desc(architecturePlansTable.version))
    .limit(1);
  if (!architecture) {
    const selection = selectSoftwareCapabilities({
      requiredFamilies: capabilityFamiliesForArchitecture({
        definition: definition.document,
        graph: graph.graph,
      }),
      runtimeType:
        snapshot.commercialBuildBrief.buildContract.route.primaryShape,
      implementations: await loadCatalog(),
      buildEnvelope: bet.buildEnvelope,
      availableOperationalCapabilityKeys:
        await availableOperationalCapabilities(),
    });
    const composed = composeArchitecturePlan({
      betId: bet.id,
      productDefinitionId: definition.id,
      productDefinitionVersion: definition.version,
      productDefinitionFingerprint: definition.fingerprint,
      definition: definition.document,
      graph: graph.graph,
      buildEnvelope: bet.buildEnvelope,
      capabilityBindings: selection.bindings,
      knownCapabilityCostCents: selection.totalKnownExternalCostCents,
    });
    if (composed.kind === "INSUFFICIENT_ENVELOPE") {
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: "INSUFFICIENT_ENVELOPE",
          productDefinitionId: definition.id,
          blockerCode: "UNDERCAPITALIZED_BET",
          nextAction: composed.reasons.join(" "),
          finishedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(eq(assetFactoryRunsTable.id, run.id));
      return;
    }
    const fingerprint = factoryFingerprint(composed.document);
    [architecture] = await db
      .insert(architecturePlansTable)
      .values({
        factoryRunId: run.id,
        productDefinitionId: definition.id,
        requirementGraphId: graph.id,
        betId: bet.id,
        version: 1,
        status: "DRAFT",
        fingerprint,
        document: composed.document,
        revisionReason:
          "Initial least-complex architecture satisfying the frozen competitive Product Definition.",
      })
      .returning();
  }
  if (!architecture) throw new Error("ARCHITECTURE_PLAN_CREATE_FAILED");
  if (factoryFingerprint(architecture.document) !== architecture.fingerprint)
    throw new Error("FROZEN_ARCHITECTURE_PLAN_IMMUTABLE");
  const architectureDefects = reviewArchitecture({
    plan: architecture.document,
    definition: definition.document,
    graph: graph.graph,
    buildEnvelope: bet.buildEnvelope,
  });
  await persistReviewDefects({
    runId: run.id,
    stage: "ARCHITECTURE",
    subjectFingerprint: architecture.fingerprint,
    defects: architectureDefects,
  });
  if (!architectureReviewPasses(architectureDefects)) {
    await db
      .update(architecturePlansTable)
      .set({ status: "REVIEW_BLOCKED", updatedAt: new Date() })
      .where(eq(architecturePlansTable.id, architecture.id));
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: "ARCHITECTURE_BLOCKED",
        productDefinitionId: definition.id,
        architecturePlanId: architecture.id,
        blockerCode: "ARCHITECTURE_FATAL_DEFECT",
        nextAction:
          "Repair the concrete Architecture Plan defects without removing Product requirements.",
        updatedAt: new Date(),
      })
      .where(eq(assetFactoryRunsTable.id, run.id));
    return;
  }
  if (architecture.status !== "FROZEN") {
    const now = new Date();
    [architecture] = await db
      .update(architecturePlansTable)
      .set({ status: "FROZEN", frozenAt: now, updatedAt: now })
      .where(eq(architecturePlansTable.id, architecture.id))
      .returning();
    await recordFactoryEvent({
      runId: run.id,
      opportunityId: run.opportunityId,
      eventType: "ARCHITECTURE_PLAN_FROZEN",
      summary: `Architecture Plan v${architecture.version} passed adversarial review and is frozen.`,
      metadata: {
        architecture_plan_id: architecture.id,
        fingerprint: architecture.fingerprint,
      },
    });
  }

  const contract = compileBuildContractV2({
    opportunityId: run.opportunityId,
    evaluationCycleId: run.evaluationCycleId,
    betId: bet.id,
    buildEnvelope: bet.buildEnvelope,
    productDefinitionId: definition.id,
    productDefinitionVersion: definition.version,
    productDefinitionFingerprint: definition.fingerprint,
    productDefinition: definition.document,
    architecturePlanId: architecture.id,
    architecturePlanVersion: architecture.version,
    architecturePlanFingerprint: architecture.fingerprint,
    architecturePlan: architecture.document,
  });
  const manifests = compileAssetRepositoryManifests({
    productDefinition: definition.document,
    architecturePlan: architecture.document,
    buildContract: contract,
  });
  const identity = assetRepositoryIdentity(bet.id);
  let [repository] = await db
    .select()
    .from(assetRepositoriesTable)
    .where(eq(assetRepositoriesTable.betId, bet.id));
  if (!repository) {
    [repository] = await db
      .insert(assetRepositoriesTable)
      .values({
        opportunityId: run.opportunityId,
        betId: bet.id,
        ...identity,
        provider: "UNCONFIGURED",
        status: "PENDING",
        manifestsFingerprint: factoryFingerprint(manifests),
        manifestFiles: manifests,
      })
      .onConflictDoNothing({ target: assetRepositoriesTable.betId })
      .returning();
    repository ??= (
      await db
        .select()
        .from(assetRepositoriesTable)
        .where(eq(assetRepositoriesTable.betId, bet.id))
    )[0];
  }
  if (!repository) throw new Error("ASSET_REPOSITORY_RESERVATION_FAILED");
  const manifestsFingerprint = factoryFingerprint(manifests);
  if (repository.manifestsFingerprint !== manifestsFingerprint) {
    const [reconciled] = await db
      .update(assetRepositoriesTable)
      .set({
        status: "PENDING",
        manifestsFingerprint,
        manifestFiles: manifests,
        lastErrorCode: null,
        lastErrorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(assetRepositoriesTable.id, repository.id))
      .returning();
    if (!reconciled)
      throw new Error("ASSET_REPOSITORY_MANIFEST_RECONCILIATION_FAILED");
    repository = reconciled;
  }
  if (repository.status !== "PROVISIONED") {
    const provisioner =
      provisionerOverride === undefined
        ? configuredAssetRepositoryProvisioner()
        : provisionerOverride;
    if (!provisioner) {
      await blockForRepositoryCapability(run, repository);
      return;
    }
    try {
      repository = await provisionRepository({ run, repository, provisioner });
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Unknown repository provider failure";
      await db
        .update(assetRepositoriesTable)
        .set({
          status: "PENDING",
          lastErrorCode: "REPOSITORY_PROVIDER_TRANSIENT",
          lastErrorMessage: message.slice(0, 4_000),
          updatedAt: new Date(),
        })
        .where(eq(assetRepositoriesTable.id, repository.id));
      await db
        .update(assetFactoryRunsTable)
        .set({
          status: "REPOSITORY_PENDING",
          blockerCode: "REPOSITORY_PROVIDER_TRANSIENT",
          nextAction:
            "Retry idempotent repository provisioning after provider recovery.",
          updatedAt: new Date(),
        })
        .where(eq(assetFactoryRunsTable.id, run.id));
      return;
    }
  }

  const buildIdempotencyKey = `factory-run-${run.id}:build-contract-v2:${factoryFingerprint(contract)}`;
  let [buildJob] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.idempotencyKey, buildIdempotencyKey));
  if (!buildJob) {
    [buildJob] = await db
      .insert(buildJobsTable)
      .values({
        opportunityId: run.opportunityId,
        evaluationCycleId: run.evaluationCycleId,
        betId: bet.id,
        factoryRunId: run.id,
        assetRepositoryId: repository.id,
        idempotencyKey: buildIdempotencyKey,
        status: "READY_FOR_BUILDER",
        productShape:
          snapshot.commercialBuildBrief.buildContract.route.primaryShape,
        supportingShapes:
          snapshot.commercialBuildBrief.buildContract.route.supportingShapes,
        builderProfile: builderProfileFor(
          snapshot.commercialBuildBrief.buildContract.route.primaryShape,
        ),
        contract: contract as PersistedBuildContract,
        // This is an envelope ceiling, not provider-spend authority. The
        // Builder Gateway still requires an exact-run enforceable maximum,
        // atomic Money Safety reservation, and independently verified authority.
        externalSpendCeilingCents:
          bet.buildEnvelope.maximumExternalBuildSpendCents,
        externalSpendUsedCents: 0,
      })
      .onConflictDoNothing({ target: buildJobsTable.idempotencyKey })
      .returning();
    buildJob ??= (
      await db
        .select()
        .from(buildJobsTable)
        .where(eq(buildJobsTable.idempotencyKey, buildIdempotencyKey))
    )[0];
  }
  if (!buildJob) throw new Error("FACTORY_BUILD_JOB_CREATE_FAILED");
  const now = new Date();
  await db
    .update(assetFactoryRunsTable)
    .set({
      status: "READY_FOR_BUILDER",
      productDefinitionId: definition.id,
      architecturePlanId: architecture.id,
      assetRepositoryId: repository.id,
      buildJobId: buildJob.id,
      blockerCode: null,
      nextAction:
        "Existing #69 Builder Workspace will dispatch the frozen Build Contract v2.",
      finishedAt: null,
      updatedAt: now,
    })
    .where(eq(assetFactoryRunsTable.id, run.id));
  if (bet.status === "APPROVED")
    await db
      .update(betsTable)
      .set({
        status: "ACTIVE",
        activatedAt: now,
        nextAction:
          "Consume only reconciled resources inside the approved envelope.",
        updatedAt: now,
      })
      .where(and(eq(betsTable.id, bet.id), eq(betsTable.status, "APPROVED")));
  await db.insert(betEventsTable).values({
    betId: bet.id,
    opportunityId: run.opportunityId,
    eventType: "BET_FACTORY_BUILD_INITIATED",
    summary: `Factory Build ${buildJob.id} entered #69 execution under the approved Bet.`,
    metadata: {
      factory_run_id: run.id,
      build_job_id: buildJob.id,
      asset_repository_id: repository.id,
      provider_spend_authorized: false,
      downstream_authority_granted: false,
    },
  });
  await recordFactoryEvent({
    runId: run.id,
    opportunityId: run.opportunityId,
    eventType: "BUILD_CONTRACT_V2_COMPILED",
    summary: `Build Contract v2 and Asset repository ${repository.assetKey} are ready for #69 Builder Workspace.`,
    metadata: {
      build_job_id: buildJob.id,
      repository_url: repository.repositoryUrl,
      contract_fingerprint: factoryFingerprint(contract),
      downstream_authority_granted: false,
    },
  });
  await setOpportunityActivity(run.opportunityId, {
    activeEvaluationCycleId: run.evaluationCycleId,
    currentActivityKey: "ASSET_FACTORY_READY_FOR_BUILDER",
    currentActivityLabel: "Factory contracts frozen; builder ready",
    activityStatus: "WAITING",
    activityStartedAt: now,
    expectedDurationSeconds: null,
    nextAction:
      "Run #69 Builder Workspace against the exact Asset repository and Build Contract v2.",
    etaBasis: "BUILDER_GATEWAY_PENDING",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: run.opportunityId,
    evaluationCycleId: run.evaluationCycleId,
    eventType: "ASSET_FACTORY_READY_FOR_BUILDER",
    summary:
      "Product Definition, Architecture Plan, repository, and Build Contract v2 are frozen and ready for #69.",
    metadata: {
      factory_run_id: run.id,
      bet_id: bet.id,
      build_job_id: buildJob.id,
      asset_repository_id: repository.id,
      authority_granted: false,
    },
    occurredAt: now,
  });
}

export async function runAssetFactoryTick(
  provisionerOverride?: AssetRepositoryProvisioner | null,
): Promise<number[]> {
  const runs = await db
    .select()
    .from(assetFactoryRunsTable)
    .where(
      inArray(assetFactoryRunsTable.status, [
        "SYNTHESIZING_PRODUCT",
        "PRODUCT_REVIEW",
        "COMPOSING_ARCHITECTURE",
        "ARCHITECTURE_REVIEW",
        "REPOSITORY_PENDING",
        "REPOSITORY_BLOCKED",
      ]),
    )
    .orderBy(asc(assetFactoryRunsTable.id))
    .limit(5);
  for (const run of runs)
    await advanceAssetFactoryRun(run.id, provisionerOverride);
  await reconcileFactoryExecutionStates();
  return runs.map((run) => run.id);
}

export async function reconcileFactoryExecutionStates(): Promise<void> {
  const runs = await db
    .select()
    .from(assetFactoryRunsTable)
    .where(
      inArray(assetFactoryRunsTable.status, [
        "READY_FOR_BUILDER",
        "BUILDER_RUNNING",
        "QA_PENDING",
      ]),
    );
  for (const run of runs) {
    if (!run.buildJobId) continue;
    const [job] = await db
      .select()
      .from(buildJobsTable)
      .where(eq(buildJobsTable.id, run.buildJobId));
    if (!job) continue;
    const mapped =
      job.status === "BUILDING" || job.status === "BUILDER_DISPATCHED"
        ? {
            status: "BUILDER_RUNNING" as const,
            nextAction: "Builder Gateway is executing the frozen contract.",
          }
        : job.status === "QA_PENDING"
          ? {
              status: "QA_PENDING" as const,
              nextAction:
                "Existing #70 independent QA must verify the exact commit.",
            }
          : job.status === "COMPLETE"
            ? {
                status: "COMPLETE" as const,
                nextAction:
                  "Existing #71 Controlled Release is the next authority boundary.",
              }
            : job.status === "CANCELLED"
              ? {
                  status: "CANCELLED" as const,
                  nextAction:
                    "Build was cancelled; no downstream side effect is authorized.",
                }
              : job.status === "FAILED"
                ? {
                    status: "FAILED" as const,
                    nextAction:
                      "Inspect the structured provider/build failure without blind charged retry.",
                  }
                : null;
    if (!mapped || mapped.status === run.status) continue;
    await db
      .update(assetFactoryRunsTable)
      .set({
        status: mapped.status,
        nextAction: mapped.nextAction,
        finishedAt: ["COMPLETE", "CANCELLED", "FAILED"].includes(mapped.status)
          ? new Date()
          : null,
        updatedAt: new Date(),
      })
      .where(eq(assetFactoryRunsTable.id, run.id));
    await recordFactoryEvent({
      runId: run.id,
      opportunityId: run.opportunityId,
      eventType: `FACTORY_${mapped.status}`,
      summary: mapped.nextAction,
      metadata: {
        build_job_id: job.id,
        build_job_status: job.status,
        result_commit_sha: job.resultCommitSha,
      },
    });
  }
}
