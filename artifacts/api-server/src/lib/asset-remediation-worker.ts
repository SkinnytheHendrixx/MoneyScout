import { and, asc, eq, inArray, sql } from "drizzle-orm";
import {
  assetEventsTable,
  assetIncidentsTable,
  assetRemediationEventsTable,
  assetRemediationRunsTable,
  assetsTable,
  buildJobsTable,
  builderWorkspacesTable,
  db,
  opportunitiesTable,
  type PersistedBuildContract,
  type PersistedQaAcceptanceResult,
  type PersistedQaDefect,
  type PersistedReleasePlan,
} from "@workspace/db";
import {
  configuredBuilderAdapter,
  type BuilderAgentAdapter,
  type BuilderStatusResult,
} from "./builder-agent-adapter";
import { createOrReuseHumanAction } from "./human-gates";
import { recordLifecycleEvent, setOpportunityActivity } from "./lifecycle-state";
import { logger } from "./logger";
import { probeAssetHealth, recordAssetObservation } from "./asset-operations-worker";
import {
  configuredQaAdapter,
  type QaAgentAdapter,
  type QaResult,
} from "./qa-agent-adapter";
import {
  configuredReleaseAdapter,
  type ReleaseAgentAdapter,
  type ReleaseResult,
  type ReleaseStage,
} from "./release-agent-adapter";

const DEFAULT_INTERVAL_MS = 5_000;
const MIN_INTERVAL_MS = 2_000;
const MAX_REPAIR_ATTEMPTS = 3;
let timer: NodeJS.Timeout | null = null;
let tickRunning = false;

function intervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_ASSET_REMEDIATION_WORKER_MS ?? "");
  return Number.isFinite(configured) && configured >= MIN_INTERVAL_MS ? configured : DEFAULT_INTERVAL_MS;
}

function canonicalUrl(value: string): string {
  try {
    const url = new URL(value);
    url.hash = "";
    if (url.pathname !== "/") url.pathname = url.pathname.replace(/\/+$/, "");
    return url.toString().replace(/\/$/, "");
  } catch {
    return value.trim().replace(/\/+$/, "");
  }
}

function normalizedCriterion(value: string): string {
  return value.trim().replace(/\s+/g, " ").toLowerCase();
}

function maintenanceCriteria(
  asset: typeof assetsTable.$inferSelect,
  build: typeof buildJobsTable.$inferSelect,
): string[] {
  const contract = build.contract as PersistedBuildContract;
  return [
    ...contract.acceptanceCriteria,
    `The availability incident affecting ${asset.productionUrl} is repaired without changing the Asset's intended product behavior outside the minimum required fix.`,
    `The maintenance change preserves the existing public surface at ${asset.productionUrl}; it does not require a new public URL, custom domain, charging authority, outbound authority, advertising authority, or new production credentials.`,
    "The repaired artifact remains reproducibly buildable/testable and introduces no new forbidden external side effects.",
  ];
}

function incidentDefects(
  incident: typeof assetIncidentsTable.$inferSelect,
  priorDefects: PersistedQaDefect[] = [],
): PersistedQaDefect[] {
  const root: PersistedQaDefect = {
    key: `ASSET_${incident.incidentType}_${incident.id}`.slice(0, 160),
    category: "PRODUCTION_RELIABILITY",
    severity: incident.severity === "CRITICAL" ? "CRITICAL" : "HIGH",
    summary: incident.summary.slice(0, 2_000),
    evidence: JSON.stringify(incident.evidence).slice(0, 4_000),
    repairGuidance: "Reproduce the production failure using non-destructive evidence, repair the smallest verified cause, preserve the existing public surface and authority boundaries, and leave the artifact ready for independent QA.",
    humanOnly: false,
  };
  const unique = new Map<string, PersistedQaDefect>();
  for (const defect of [root, ...priorDefects]) unique.set(defect.key, defect);
  return [...unique.values()];
}

async function recordRemediationEvent(input: {
  run: typeof assetRemediationRunsTable.$inferSelect;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(assetRemediationEventsTable).values({
    remediationRunId: input.run.id,
    assetId: input.run.assetId,
    incidentId: input.run.incidentId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function recordAssetEvent(input: {
  assetId: number;
  opportunityId: number;
  eventType: string;
  summary: string;
  metadata?: Record<string, unknown>;
}) {
  await db.insert(assetEventsTable).values({
    assetId: input.assetId,
    opportunityId: input.opportunityId,
    eventType: input.eventType,
    summary: input.summary.slice(0, 2_000),
    metadata: input.metadata ?? {},
  });
}

async function blockRun(input: {
  run: typeof assetRemediationRunsTable.$inferSelect;
  asset: typeof assetsTable.$inferSelect;
  actionType: string;
  title: string;
  whyNeeded: string;
  instructions: string;
  provider: string | null;
  urgency?: "CRITICAL" | "HIGH" | "NORMAL" | "LOW";
  code: string;
}) {
  await createOrReuseHumanAction({
    opportunityId: input.asset.opportunityId,
    actionType: input.actionType,
    title: input.title,
    whyNeeded: input.whyNeeded,
    instructions: input.instructions,
    blockedStage: `ASSET_REMEDIATION:${input.run.id}:${input.code}`,
    requiredCapabilityKey: null,
    provider: input.provider,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: input.urgency ?? "HIGH",
    resumeAction: "NO_AUTOMATIC_RESUME",
    resumePayload: { asset_id: input.asset.id, remediation_run_id: input.run.id, incident_id: input.run.incidentId },
    inherentlyHumanAuthority: true,
  });
  await db.update(assetRemediationRunsTable).set({
    status: "BLOCKED",
    lastErrorCode: input.code,
    lastErrorMessage: input.whyNeeded.slice(0, 4_000),
    updatedAt: new Date(),
  }).where(eq(assetRemediationRunsTable.id, input.run.id));
  await recordRemediationEvent({ run: input.run, eventType: "REMEDIATION_BLOCKED", summary: input.title, metadata: { code: input.code, provider: input.provider } });
  await setOpportunityActivity(input.asset.opportunityId, {
    activeEvaluationCycleId: input.asset.evaluationCycleId,
    currentActivityKey: "ASSET_REMEDIATION_BLOCKED",
    currentActivityLabel: input.title,
    activityStatus: "BLOCKED",
    activityStartedAt: new Date(),
    expectedDurationSeconds: null,
    nextAction: input.instructions,
    etaBasis: "HUMAN_ACTION_REQUIRED",
    lifecycleTransition: true,
  });
}

async function recordUnexpectedCost(input: {
  asset: typeof assetsTable.$inferSelect;
  run: typeof assetRemediationRunsTable.$inferSelect;
  stage: string;
  provider: string;
  costCents: number;
  providerRunId: string;
}) {
  if (input.costCents <= 0) return;
  const result = await recordAssetObservation({
    assetId: input.asset.id,
    observationType: "COST",
    source: "ASSET_REMEDIATION",
    idempotencyKey: `asset-${input.asset.id}:remediation-${input.run.id}:${input.stage}:${input.providerRunId}:cost`,
    provenance: "FACT",
    amountCents: input.costCents,
    unit: "USD_CENTS",
    externalReference: `asset_remediation:${input.run.id}:${input.stage}`,
    metadata: { provider: input.provider, stage: input.stage, zero_cash_contract_violation: true },
    observedAt: new Date(),
  });
  if (result.created) {
    await db.update(assetsTable).set({
      externalSpendUsedCents: sql`${assetsTable.externalSpendUsedCents} + ${input.costCents}`,
      updatedAt: new Date(),
    }).where(eq(assetsTable.id, input.asset.id));
    await db.update(assetRemediationRunsTable).set({
      externalSpendUsedCents: sql`${assetRemediationRunsTable.externalSpendUsedCents} + ${input.costCents}`,
      updatedAt: new Date(),
    }).where(eq(assetRemediationRunsTable.id, input.run.id));
  }
  await blockRun({
    run: input.run,
    asset: input.asset,
    actionType: "REMEDIATION_UNEXPECTED_EXTERNAL_COST",
    title: "Maintenance backend violated its zero-cash contract",
    whyNeeded: `${input.provider} reported ${input.costCents} cents of external cost during ${input.stage} even though this autonomous remediation path was restricted to ZERO_CASH. Further maintenance execution stopped.`,
    instructions: "Review or replace the integration before resuming. Do not broaden charging, deployment, or spend authority merely to clear this incident.",
    provider: input.provider,
    urgency: "CRITICAL",
    code: "ZERO_CASH_REMEDIATION_REPORTED_COST",
  });
}

function validQaResult(criteria: string[], result: QaResult): { valid: boolean; defects: PersistedQaDefect[] } {
  const defects: PersistedQaDefect[] = [...result.defects];
  if (result.baselineChecksPassed !== true) {
    defects.push({
      key: "MAINTENANCE_BASELINE_NOT_VERIFIED",
      category: "TEST_FAILURE",
      severity: "HIGH",
      summary: "Independent QA did not prove all baseline checks passed for the maintenance change.",
      evidence: result.baselineChecksPassed === false ? "Baseline checks failed." : "Baseline result was missing or unknown.",
      repairGuidance: "Restore a reproducibly buildable/testable artifact and rerun independent QA.",
      humanOnly: false,
    });
  }
  const byCriterion = new Map(result.acceptanceResults.map((item) => [normalizedCriterion(item.criterion), item]));
  criteria.forEach((criterion, index) => {
    if (byCriterion.get(normalizedCriterion(criterion))?.status === "PASS") return;
    defects.push({
      key: `MAINTENANCE_ACCEPTANCE_NOT_VERIFIED_${index + 1}`,
      category: "ACCEPTANCE_GAP",
      severity: "HIGH",
      summary: `Maintenance acceptance criterion was not independently verified: ${criterion}`,
      evidence: byCriterion.get(normalizedCriterion(criterion))?.evidence ?? null,
      repairGuidance: "Repair only what is required to make this exact criterion independently verifiable as PASS.",
      humanOnly: false,
    });
  });
  return { valid: result.state === "PASSED" && defects.length === 0 && !result.requiresHumanAction, defects };
}

function maintenancePlan(
  asset: typeof assetsTable.$inferSelect,
  build: typeof buildJobsTable.$inferSelect,
  workspace: typeof builderWorkspacesTable.$inferSelect,
): PersistedReleasePlan {
  return {
    schemaVersion: 1,
    buildJobId: build.id,
    opportunityId: asset.opportunityId,
    productShape: asset.productShape,
    targetKind: asset.targetKind,
    artifact: { repositoryUrl: workspace.repositoryUrl!, branchName: workspace.branchName! },
    preview: { required: true, visibility: "PRIVATE", purpose: "DEPLOYMENT_HEALTH_VERIFICATION" },
    production: {
      publicReleaseRequired: true,
      explicitHumanAuthorityRequired: false,
      customDomainRequired: false,
      customerChargingAuthorized: false,
      productionCredentialsAuthorized: false,
      outboundAuthorized: false,
    },
    economics: { externalSpendCeilingCents: 0 },
    maintenance: {
      assetId: asset.id,
      inheritedPublicAuthority: true,
      samePublicSurfaceRequired: true,
      surfaceExpansionAllowed: false,
      customerChargingExpansionAllowed: false,
      outboundExpansionAllowed: false,
      advertisingExpansionAllowed: false,
      customDomainExpansionAllowed: false,
      productionCredentialExpansionAllowed: false,
    },
    nextGate: "ASSET_OPERATIONS",
  };
}

async function ensureRunForOpenIncident(): Promise<number | null> {
  const [incident] = await db
    .select()
    .from(assetIncidentsTable)
    .where(and(eq(assetIncidentsTable.status, "OPEN"), eq(assetIncidentsTable.incidentType, "AVAILABILITY")))
    .orderBy(asc(assetIncidentsTable.detectedAt), asc(assetIncidentsTable.id))
    .limit(1);
  if (!incident) return null;
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, incident.assetId));
  if (!asset || asset.status === "KILLED" || asset.status === "ARCHIVED" || asset.status === "PAUSED") return null;
  const base = `asset-${asset.id}:incident-${incident.id}:maintenance`;
  const [created] = await db.insert(assetRemediationRunsTable).values({
    assetId: asset.id,
    incidentId: incident.id,
    status: "PENDING_REPAIR",
    repairIdempotencyKey: `${base}:repair-1`,
    qaIdempotencyKey: `${base}:qa-1`,
    previewIdempotencyKey: `${base}:preview-1`,
    productionIdempotencyKey: `${base}:production-1`,
  }).onConflictDoNothing({ target: assetRemediationRunsTable.incidentId }).returning();
  if (!created) return null;
  await recordRemediationEvent({ run: created, eventType: "REMEDIATION_CREATED", summary: "Availability incident entered bounded autonomous remediation." });
  await recordLifecycleEvent({
    opportunityId: asset.opportunityId,
    evaluationCycleId: asset.evaluationCycleId,
    eventType: "ASSET_REMEDIATION_CREATED",
    summary: "Money Scout created a zero-cash maintenance run for the live Asset outage.",
    metadata: { asset_id: asset.id, incident_id: incident.id, remediation_run_id: created.id, inherited_public_authority: true, surface_expansion_allowed: false },
  });
  return created.id;
}

async function loadContext(run: typeof assetRemediationRunsTable.$inferSelect) {
  const [[asset], [incident]] = await Promise.all([
    db.select().from(assetsTable).where(eq(assetsTable.id, run.assetId)),
    db.select().from(assetIncidentsTable).where(eq(assetIncidentsTable.id, run.incidentId)),
  ]);
  if (!asset || !incident) return null;
  const [[build], [workspace]] = await Promise.all([
    db.select().from(buildJobsTable).where(eq(buildJobsTable.id, asset.buildJobId)),
    db.select().from(builderWorkspacesTable).where(eq(builderWorkspacesTable.buildJobId, asset.buildJobId)),
  ]);
  if (!build || !workspace) return null;
  return { asset, incident, build, workspace };
}

async function naturalRecovery(run: typeof assetRemediationRunsTable.$inferSelect, asset: typeof assetsTable.$inferSelect, incident: typeof assetIncidentsTable.$inferSelect): Promise<boolean> {
  if (incident.status === "OPEN") return false;
  await db.update(assetRemediationRunsTable).set({ status: "CANCELLED", finishedAt: new Date(), lastErrorCode: "INCIDENT_RECOVERED_BEFORE_MAINTENANCE", lastErrorMessage: "The availability incident resolved before further maintenance side effects were needed.", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  await recordRemediationEvent({ run, eventType: "REMEDIATION_CANCELLED_NATURAL_RECOVERY", summary: "Incident recovered before maintenance completed; further repair/deploy work was cancelled." });
  await recordAssetEvent({ assetId: asset.id, opportunityId: asset.opportunityId, eventType: "ASSET_REMEDIATION_AVOIDED", summary: "Asset recovered before further maintenance side effects were necessary.", metadata: { remediation_run_id: run.id, incident_id: incident.id } });
  return true;
}

async function ensureZeroCashAdapters(input: {
  run: typeof assetRemediationRunsTable.$inferSelect;
  asset: typeof assetsTable.$inferSelect;
  builder: BuilderAgentAdapter | null;
  qa: QaAgentAdapter | null;
  release: ReleaseAgentAdapter | null;
  workspace: typeof builderWorkspacesTable.$inferSelect;
}): Promise<boolean> {
  if (!input.builder || !input.builder.repair) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "CONNECT_REPAIR_CAPABLE_BUILDER", title: "Connect a repair-capable coding backend", whyNeeded: "The Asset is down, but Money Scout has no configured builder repair capability for the existing artifact.", instructions: "Connect an automation-ready coding backend that supports bounded repair jobs against the existing repository. This grants repair capability only, not public-surface expansion or spend authority.", provider: input.workspace.provider, code: "BUILDER_REPAIR_ACCESS_REQUIRED" });
    return false;
  }
  if (input.builder.provider !== input.workspace.provider) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "RESTORE_ASSET_BUILDER_PROVIDER", title: "Restore the Asset's original repair provider", whyNeeded: `The existing builder workspace belongs to ${input.workspace.provider}, but the configured repair adapter is ${input.builder.provider}. Money Scout will not replay a repair into a different provider implicitly.`, instructions: "Restore automation-ready access to the original builder provider, or explicitly approve a provider migration through a separate workflow.", provider: input.workspace.provider, code: "BUILDER_PROVIDER_CONTINUITY_REQUIRED" });
    return false;
  }
  if (!input.qa) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "CONNECT_INDEPENDENT_QA_AGENT", title: "Connect an independent QA backend", whyNeeded: "Money Scout will not deploy a production repair based only on the builder's own success claim.", instructions: "Connect an automation-ready QA backend that can independently test the repaired repository without production side effects.", provider: "QA_AGENT", code: "INDEPENDENT_QA_REQUIRED" });
    return false;
  }
  if (input.qa.provider === input.builder.provider) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "CONNECT_INDEPENDENT_QA_AGENT", title: "Use a QA provider independent from the builder", whyNeeded: `Builder and QA both resolve to ${input.builder.provider}. A production maintenance release requires independent verification.`, instructions: "Connect a distinct QA backend or provider identity before Money Scout can continue.", provider: input.qa.provider, code: "QA_INDEPENDENCE_REQUIRED" });
    return false;
  }
  if (!input.release) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "CONNECT_RELEASE_AGENT", title: "Restore the Asset's release backend", whyNeeded: "The repair can be tested, but Money Scout has no controlled release backend for the maintenance deployment.", instructions: "Restore automation-ready access to the existing release backend. This does not authorize a new domain, new public surface, charging, outbound, or advertising.", provider: input.asset.releaseProvider, code: "DEPLOYMENT_AGENT_ACCESS_REQUIRED" });
    return false;
  }
  if (input.release.provider !== input.asset.releaseProvider) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "RESTORE_ASSET_RELEASE_PROVIDER", title: "Restore the Asset's current release provider", whyNeeded: `The live Asset is operated by ${input.asset.releaseProvider}, but the configured release adapter is ${input.release.provider}. Maintenance cannot silently migrate providers or public surfaces.`, instructions: "Restore the current release provider, or use a separate explicitly authorized migration workflow.", provider: input.asset.releaseProvider, code: "RELEASE_PROVIDER_CONTINUITY_REQUIRED" });
    return false;
  }
  const metered = [
    ["builder", input.builder.provider, input.builder.costMode],
    ["qa", input.qa.provider, input.qa.costMode],
    ["release", input.release.provider, input.release.costMode],
  ].find(([, , mode]) => mode === "METERED");
  if (metered) {
    await blockRun({ run: input.run, asset: input.asset, actionType: "AUTHORIZE_BOUNDED_ASSET_REMEDIATION", title: "Maintenance backend needs a hard per-call spend contract", whyNeeded: `${metered[1]} is metered, but the current generic ${metered[0]} adapter cannot enforce a hard maximum charge on the provider call. Money Scout will not treat a database budget as protection against an unbounded provider request.`, instructions: "Connect a zero-cash backend or a future adapter that accepts and enforces a hard max_external_cost_cents contract. No charge will be attempted through this remediation run meanwhile.", provider: String(metered[1]), urgency: "NORMAL", code: "METERED_REMEDIATION_REQUIRES_HARD_CALL_CEILING" });
    return false;
  }
  return true;
}

async function applyRepairResult(
  run: typeof assetRemediationRunsTable.$inferSelect,
  context: NonNullable<Awaited<ReturnType<typeof loadContext>>>,
  result: BuilderStatusResult,
) {
  if (result.externalCostCents > 0) {
    await recordUnexpectedCost({ asset: context.asset, run, stage: "REPAIR", provider: run.builderProvider ?? context.workspace.provider, costCents: result.externalCostCents, providerRunId: result.providerRunId });
    return;
  }
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    await db.update(assetRemediationRunsTable).set({ status: "REPAIRING", repairProviderRunId: result.providerRunId, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    return;
  }
  if (result.state === "SUCCEEDED") {
    await db.update(assetRemediationRunsTable).set({ status: "QA_PENDING", repairProviderRunId: result.providerRunId, updatedAt: new Date(), lastErrorCode: null, lastErrorMessage: null }).where(eq(assetRemediationRunsTable.id, run.id));
    await recordRemediationEvent({ run, eventType: "REPAIR_COMPLETED", summary: "Coding backend completed the bounded repair; independent QA is next.", metadata: { provider_run_id: result.providerRunId } });
    return;
  }
  if (run.repairAttemptCount < MAX_REPAIR_ATTEMPTS) {
    const attempt = run.repairAttemptCount + 1;
    const base = `asset-${context.asset.id}:incident-${context.incident.id}:maintenance`;
    await db.update(assetRemediationRunsTable).set({ status: "PENDING_REPAIR", repairProviderRunId: null, repairIdempotencyKey: `${base}:repair-${attempt}`, qaProviderRunId: null, qaIdempotencyKey: `${base}:qa-${attempt}`, lastErrorCode: `REPAIR_${result.state}`, lastErrorMessage: (result.summary ?? `Repair ${result.state.toLowerCase()}`).slice(0, 4_000), updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    return;
  }
  await blockRun({ run, asset: context.asset, actionType: "ASSET_REMEDIATION_EXHAUSTED", title: "Autonomous Asset repair is exhausted", whyNeeded: `The repair backend reached ${MAX_REPAIR_ATTEMPTS} bounded attempts without producing an independently verifiable recovery.`, instructions: "Review the preserved incident, repair, and QA evidence. Provide only the missing technical decision or authority; Money Scout will not keep retrying blindly.", provider: run.builderProvider ?? context.workspace.provider, urgency: "HIGH", code: "ASSET_REMEDIATION_EXHAUSTED" });
}

async function dispatchRepair(run: typeof assetRemediationRunsTable.$inferSelect, context: NonNullable<Awaited<ReturnType<typeof loadContext>>>, builder: BuilderAgentAdapter) {
  const attempt = run.repairAttemptCount + 1;
  const criteria = maintenanceCriteria(context.asset, context.build);
  const defects = incidentDefects(context.incident, run.qaDefects as PersistedQaDefect[]);
  await db.update(assetRemediationRunsTable).set({ builderProvider: builder.provider, repairAttemptCount: attempt, qaAcceptanceCriteria: criteria, status: "REPAIRING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  try {
    const result = await builder.repair!({
      workspaceKey: context.workspace.workspaceKey,
      buildJobId: context.build.id,
      opportunityId: context.asset.opportunityId,
      providerRunId: context.workspace.providerRunId!,
      idempotencyKey: run.repairIdempotencyKey,
      repositoryUrl: context.workspace.repositoryUrl,
      branchName: context.workspace.branchName,
      defects,
      acceptanceCriteria: criteria,
      contract: context.build.contract as PersistedBuildContract,
    });
    await applyRepairResult({ ...run, repairAttemptCount: attempt, builderProvider: builder.provider }, context, result);
    await recordRemediationEvent({ run, eventType: "REPAIR_DISPATCHED", summary: `Bounded repair attempt ${attempt} dispatched.`, metadata: { provider: builder.provider, provider_run_id: result.providerRunId, idempotency_key: run.repairIdempotencyKey } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Repair dispatch failed";
    await db.update(assetRemediationRunsTable).set({ status: "PENDING_REPAIR", repairAttemptCount: run.repairAttemptCount, lastErrorCode: "REPAIR_DISPATCH_TRANSIENT", lastErrorMessage: message.slice(0, 4_000), updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    logger.warn({ err: error, remediationRunId: run.id }, "Asset repair dispatch failed before provider run confirmation; idempotency key will be reused");
  }
}

async function applyQaResult(
  run: typeof assetRemediationRunsTable.$inferSelect,
  context: NonNullable<Awaited<ReturnType<typeof loadContext>>>,
  result: QaResult,
) {
  if (result.externalCostCents > 0) {
    await recordUnexpectedCost({ asset: context.asset, run, stage: "QA", provider: run.qaProvider ?? "QA", costCents: result.externalCostCents, providerRunId: result.providerRunId });
    return;
  }
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    await db.update(assetRemediationRunsTable).set({ status: "QA_RUNNING", qaProviderRunId: result.providerRunId, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    return;
  }
  const criteria = run.qaAcceptanceCriteria;
  const validation = validQaResult(criteria, result);
  if (validation.valid) {
    await db.update(assetRemediationRunsTable).set({ status: "PREVIEW_PENDING", qaProviderRunId: result.providerRunId, qaAcceptanceResults: result.acceptanceResults, qaDefects: [], baselineChecksPassed: true, lastErrorCode: null, lastErrorMessage: null, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    await recordRemediationEvent({ run, eventType: "INDEPENDENT_QA_PASSED", summary: "Independent QA verified the maintenance repair and every exact acceptance criterion." });
    return;
  }
  const humanOnly = result.requiresHumanAction || validation.defects.some((defect) => defect.humanOnly);
  await db.update(assetRemediationRunsTable).set({ qaProviderRunId: result.providerRunId, qaAcceptanceResults: result.acceptanceResults, qaDefects: validation.defects, baselineChecksPassed: result.baselineChecksPassed, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  if (humanOnly) {
    await blockRun({ run, asset: context.asset, actionType: "RESOLVE_ASSET_REMEDIATION_HUMAN_BOUNDARY", title: "Maintenance QA reached a human-only boundary", whyNeeded: validation.defects[0]?.summary ?? result.summary ?? "Independent QA requires a human-only authority or decision.", instructions: "Review the preserved QA defect bundle and provide only the missing authority/access/decision. Do not bypass independent verification.", provider: run.qaProvider, urgency: validation.defects.some((defect) => defect.severity === "CRITICAL") ? "CRITICAL" : "HIGH", code: "ASSET_REMEDIATION_HUMAN_BOUNDARY" });
    return;
  }
  if (run.repairAttemptCount < MAX_REPAIR_ATTEMPTS) {
    const nextAttempt = run.repairAttemptCount + 1;
    const base = `asset-${context.asset.id}:incident-${context.incident.id}:maintenance`;
    await db.update(assetRemediationRunsTable).set({ status: "PENDING_REPAIR", repairProviderRunId: null, repairIdempotencyKey: `${base}:repair-${nextAttempt}`, qaProviderRunId: null, qaIdempotencyKey: `${base}:qa-${nextAttempt}`, lastErrorCode: "MAINTENANCE_QA_DEFECTS", lastErrorMessage: (validation.defects[0]?.summary ?? result.summary ?? "Independent QA found defects").slice(0, 4_000), updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    await recordRemediationEvent({ run, eventType: "QA_DEFECTS_RETURNED_TO_REPAIR", summary: "Independent QA found repairable defects; a fresh bounded repair attempt will run.", metadata: { defect_count: validation.defects.length } });
    return;
  }
  await blockRun({ run, asset: context.asset, actionType: "ASSET_REMEDIATION_EXHAUSTED", title: "Autonomous Asset repair is exhausted", whyNeeded: `Independent QA still found defects after ${MAX_REPAIR_ATTEMPTS} bounded repair attempts.`, instructions: "Review the preserved defect history. Money Scout stopped instead of cycling indefinitely or weakening QA.", provider: run.qaProvider, code: "ASSET_REMEDIATION_EXHAUSTED" });
}

async function dispatchQa(run: typeof assetRemediationRunsTable.$inferSelect, context: NonNullable<Awaited<ReturnType<typeof loadContext>>>, qa: QaAgentAdapter) {
  await db.update(assetRemediationRunsTable).set({ qaProvider: qa.provider, status: "QA_RUNNING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  try {
    const result = await qa.dispatch({
      qaRunId: run.id,
      buildJobId: context.build.id,
      opportunityId: context.asset.opportunityId,
      roundNumber: run.repairAttemptCount,
      idempotencyKey: run.qaIdempotencyKey,
      repositoryUrl: context.workspace.repositoryUrl!,
      branchName: context.workspace.branchName!,
      acceptanceCriteria: run.qaAcceptanceCriteria,
      contract: context.build.contract as PersistedBuildContract,
    });
    await applyQaResult({ ...run, qaProvider: qa.provider }, context, result);
    await recordRemediationEvent({ run, eventType: "QA_DISPATCHED", summary: "Independent maintenance QA dispatched.", metadata: { provider: qa.provider, provider_run_id: result.providerRunId, idempotency_key: run.qaIdempotencyKey } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "QA dispatch failed";
    await db.update(assetRemediationRunsTable).set({ status: "QA_PENDING", lastErrorCode: "QA_DISPATCH_TRANSIENT", lastErrorMessage: message.slice(0, 4_000), updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    logger.warn({ err: error, remediationRunId: run.id }, "Asset maintenance QA dispatch failed before provider run confirmation");
  }
}

async function applyReleaseResult(
  run: typeof assetRemediationRunsTable.$inferSelect,
  context: NonNullable<Awaited<ReturnType<typeof loadContext>>>,
  result: ReleaseResult,
) {
  if (result.externalCostCents > 0) {
    await recordUnexpectedCost({ asset: context.asset, run, stage: `RELEASE_${result.stage}`, provider: run.releaseProvider ?? context.asset.releaseProvider, costCents: result.externalCostCents, providerRunId: result.providerRunId });
    return;
  }
  if (result.state === "QUEUED" || result.state === "RUNNING") {
    await db.update(assetRemediationRunsTable).set({
      status: result.stage === "PREVIEW" ? "PREVIEW_DEPLOYING" : "PRODUCTION_DEPLOYING",
      ...(result.stage === "PREVIEW" ? { previewProviderRunId: result.providerRunId } : { productionProviderRunId: result.providerRunId }),
      updatedAt: new Date(),
    }).where(eq(assetRemediationRunsTable.id, run.id));
    return;
  }
  if (result.state !== "SUCCEEDED") {
    await blockRun({ run, asset: context.asset, actionType: "ASSET_MAINTENANCE_RELEASE_INTERVENTION", title: "Maintenance release could not be safely verified", whyNeeded: result.summary ?? `${result.stage} maintenance release ended in ${result.state}.`, instructions: "Review the preserved provider run. Money Scout will not blindly redispatch a production maintenance release after a confirmed terminal failure.", provider: run.releaseProvider ?? context.asset.releaseProvider, urgency: result.stage === "PRODUCTION" ? "CRITICAL" : "HIGH", code: `MAINTENANCE_${result.stage}_${result.state}` });
    return;
  }
  if (result.stage === "PREVIEW") {
    if (result.visibility !== "PRIVATE" || result.healthChecksPassed !== true) {
      await blockRun({ run, asset: context.asset, actionType: "ASSET_MAINTENANCE_PREVIEW_SAFETY", title: "Maintenance preview violated its safety contract", whyNeeded: `The maintenance preview returned visibility=${result.visibility} and health=${String(result.healthChecksPassed)}. Production remains blocked.`, instructions: "Correct the release backend so maintenance preview is PRIVATE and health-verified before production can proceed.", provider: run.releaseProvider ?? context.asset.releaseProvider, urgency: result.visibility === "PUBLIC" ? "CRITICAL" : "HIGH", code: "MAINTENANCE_PREVIEW_NOT_SAFE" });
      return;
    }
    await db.update(assetRemediationRunsTable).set({ status: "PRODUCTION_PENDING", previewProviderRunId: result.providerRunId, lastErrorCode: null, lastErrorMessage: null, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    await recordRemediationEvent({ run, eventType: "MAINTENANCE_PREVIEW_VERIFIED", summary: "Private maintenance preview passed health verification; inherited same-surface public authority is eligible for production." });
    return;
  }

  const sameSurface = result.url != null && canonicalUrl(result.url) === canonicalUrl(context.asset.productionUrl);
  if (result.visibility !== "PUBLIC" || result.healthChecksPassed !== true || !sameSurface) {
    await blockRun({ run, asset: context.asset, actionType: "ASSET_MAINTENANCE_SURFACE_VIOLATION", title: "Maintenance production result exceeded its inherited authority", whyNeeded: `Maintenance production must remain healthy, PUBLIC, and on the existing public surface ${context.asset.productionUrl}. Provider returned ${result.url ?? "no URL"} with visibility=${result.visibility} and health=${String(result.healthChecksPassed)}.`, instructions: "Restore the existing public surface or explicitly authorize a separate migration. Money Scout will not adopt this result automatically.", provider: run.releaseProvider ?? context.asset.releaseProvider, urgency: "CRITICAL", code: "MAINTENANCE_PUBLIC_SURFACE_MISMATCH" });
    return;
  }
  await db.update(assetRemediationRunsTable).set({ status: "VERIFYING", productionProviderRunId: result.providerRunId, lastErrorCode: null, lastErrorMessage: null, updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  await recordRemediationEvent({ run, eventType: "MAINTENANCE_PRODUCTION_VERIFIED_BY_PROVIDER", summary: "Provider reports the maintenance release healthy on the existing public surface; live Asset verification is next.", metadata: { url: result.url } });
}

async function dispatchRelease(run: typeof assetRemediationRunsTable.$inferSelect, context: NonNullable<Awaited<ReturnType<typeof loadContext>>>, release: ReleaseAgentAdapter, stage: ReleaseStage) {
  const plan = maintenancePlan(context.asset, context.build, context.workspace);
  await db.update(assetRemediationRunsTable).set({ releaseProvider: release.provider, status: stage === "PREVIEW" ? "PREVIEW_DEPLOYING" : "PRODUCTION_DEPLOYING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
  try {
    const result = await release.dispatch({
      releaseJobId: run.id,
      buildJobId: context.build.id,
      opportunityId: context.asset.opportunityId,
      stage,
      targetKind: context.asset.targetKind,
      idempotencyKey: stage === "PREVIEW" ? run.previewIdempotencyKey : run.productionIdempotencyKey,
      repositoryUrl: context.workspace.repositoryUrl!,
      branchName: context.workspace.branchName!,
      plan,
    });
    if (result.stage !== stage) throw new Error(`RELEASE_ADAPTER_INVALID_RESPONSE: expected ${stage}, received ${result.stage}`);
    await applyReleaseResult({ ...run, releaseProvider: release.provider }, context, result);
    await recordRemediationEvent({ run, eventType: `${stage}_DISPATCHED`, summary: `${stage === "PREVIEW" ? "Private maintenance preview" : "Inherited-authority maintenance production release"} dispatched.`, metadata: { provider: release.provider, provider_run_id: result.providerRunId } });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Maintenance release dispatch failed";
    await db.update(assetRemediationRunsTable).set({ status: stage === "PREVIEW" ? "PREVIEW_PENDING" : "PRODUCTION_PENDING", lastErrorCode: "MAINTENANCE_RELEASE_DISPATCH_TRANSIENT", lastErrorMessage: message.slice(0, 4_000), updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
    logger.warn({ err: error, remediationRunId: run.id, stage }, "Maintenance release dispatch failed before provider run confirmation");
  }
}

async function processRun(
  run: typeof assetRemediationRunsTable.$inferSelect,
  adapters: { builder: BuilderAgentAdapter | null; qa: QaAgentAdapter | null; release: ReleaseAgentAdapter | null },
) {
  const context = await loadContext(run);
  if (!context) return;
  if (await naturalRecovery(run, context.asset, context.incident)) return;
  if (!context.workspace.repositoryUrl || !context.workspace.branchName || !context.workspace.providerRunId) {
    await blockRun({ run, asset: context.asset, actionType: "RESTORE_ASSET_BUILD_ARTIFACT", title: "Restore the Asset's inspectable build workspace", whyNeeded: "The live Asset has an outage, but its original builder workspace lacks the repository, branch, or durable provider-run reference needed for bounded repair.", instructions: "Restore the existing inspectable artifact/workspace reference. Do not rebuild the product from scratch or change its public surface.", provider: context.workspace.provider, code: "ASSET_BUILD_ARTIFACT_REQUIRED" });
    return;
  }
  if (!(await ensureZeroCashAdapters({ run, asset: context.asset, builder: adapters.builder, qa: adapters.qa, release: adapters.release, workspace: context.workspace }))) return;
  const builder = adapters.builder!;
  const qa = adapters.qa!;
  const release = adapters.release!;

  if (run.status === "PENDING_REPAIR") return dispatchRepair(run, context, builder);
  if (run.status === "REPAIRING") {
    if (!run.repairProviderRunId) {
      await db.update(assetRemediationRunsTable).set({ status: "PENDING_REPAIR", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
      return;
    }
    try {
      const result = await builder.getStatus(run.repairProviderRunId);
      return applyRepairResult(run, context, result);
    } catch (error) {
      logger.warn({ err: error, remediationRunId: run.id }, "Maintenance repair polling failed; preserved run will be polled again");
      return;
    }
  }
  if (run.status === "QA_PENDING") return dispatchQa(run, context, qa);
  if (run.status === "QA_RUNNING") {
    if (!run.qaProviderRunId) {
      await db.update(assetRemediationRunsTable).set({ status: "QA_PENDING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
      return;
    }
    try {
      const result = await qa.getStatus(run.qaProviderRunId);
      return applyQaResult(run, context, result);
    } catch (error) {
      logger.warn({ err: error, remediationRunId: run.id }, "Maintenance QA polling failed; preserved run will be polled again");
      return;
    }
  }
  if (run.status === "PREVIEW_PENDING") return dispatchRelease(run, context, release, "PREVIEW");
  if (run.status === "PREVIEW_DEPLOYING") {
    if (!run.previewProviderRunId) {
      await db.update(assetRemediationRunsTable).set({ status: "PREVIEW_PENDING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
      return;
    }
    try {
      const result = await release.getStatus(run.previewProviderRunId);
      if (result.stage !== "PREVIEW") throw new Error(`Expected PREVIEW, received ${result.stage}`);
      return applyReleaseResult(run, context, result);
    } catch (error) {
      logger.warn({ err: error, remediationRunId: run.id }, "Maintenance preview polling failed; preserved run will be polled again");
      return;
    }
  }
  if (run.status === "PRODUCTION_PENDING") return dispatchRelease(run, context, release, "PRODUCTION");
  if (run.status === "PRODUCTION_DEPLOYING") {
    if (!run.productionProviderRunId) {
      await db.update(assetRemediationRunsTable).set({ status: "PRODUCTION_PENDING", updatedAt: new Date() }).where(eq(assetRemediationRunsTable.id, run.id));
      return;
    }
    try {
      const result = await release.getStatus(run.productionProviderRunId);
      if (result.stage !== "PRODUCTION") throw new Error(`Expected PRODUCTION, received ${result.stage}`);
      return applyReleaseResult(run, context, result);
    } catch (error) {
      logger.warn({ err: error, remediationRunId: run.id }, "Maintenance production polling failed; preserved run will be polled again");
      return;
    }
  }
  if (run.status === "VERIFYING") {
    const [freshAsset] = await db.select().from(assetsTable).where(eq(assetsTable.id, context.asset.id));
    if (!freshAsset) return;
    const health = await probeAssetHealth(freshAsset);
    if (health !== "HEALTHY") {
      await blockRun({ run, asset: freshAsset, actionType: "ASSET_MAINTENANCE_LIVE_VERIFICATION_FAILED", title: "Maintenance release is not healthy in live verification", whyNeeded: `The release provider reported success, but Money Scout's independent live probe returned ${health}.`, instructions: "Review the preserved maintenance release and live health evidence. Money Scout will not claim recovery or retry production blindly.", provider: run.releaseProvider, urgency: "CRITICAL", code: "MAINTENANCE_LIVE_VERIFICATION_FAILED" });
      return;
    }
    const now = new Date();
    await db.update(assetRemediationRunsTable).set({ status: "COMPLETE", finishedAt: now, updatedAt: now, lastErrorCode: null, lastErrorMessage: null }).where(eq(assetRemediationRunsTable.id, run.id));
    await db.update(assetsTable).set({ lastRemediationAt: now, status: "ACTIVE", healthStatus: "HEALTHY", updatedAt: now }).where(eq(assetsTable.id, freshAsset.id));
    await db.update(opportunitiesTable).set({ status: "ASSET_ACTIVE" }).where(eq(opportunitiesTable.id, freshAsset.opportunityId));
    await recordRemediationEvent({ run, eventType: "REMEDIATION_COMPLETE", summary: "Maintenance repair passed builder repair, independent QA, private preview, same-surface production release, and live health verification." });
    await recordAssetEvent({ assetId: freshAsset.id, opportunityId: freshAsset.opportunityId, eventType: "ASSET_AUTONOMOUSLY_REMEDIATED", summary: "Money Scout autonomously restored the Asset without expanding public/commercial authority or using external cash.", metadata: { remediation_run_id: run.id, incident_id: run.incidentId } });
    await recordLifecycleEvent({ opportunityId: freshAsset.opportunityId, evaluationCycleId: freshAsset.evaluationCycleId, eventType: "ASSET_REMEDIATION_COMPLETE", summary: "Operating Asset recovered through bounded autonomous maintenance.", metadata: { asset_id: freshAsset.id, remediation_run_id: run.id, zero_cash: true, same_public_surface: true } });
    await setOpportunityActivity(freshAsset.opportunityId, { activeEvaluationCycleId: freshAsset.evaluationCycleId, currentActivityKey: "ASSET_OPERATING", currentActivityLabel: "Asset healthy after autonomous maintenance", activityStatus: "RUNNING", activityStartedAt: now, expectedDurationSeconds: null, nextAction: "CONTINUE HEALTH AND ECONOMIC MONITORING", etaBasis: "CONTINUOUS_OPERATIONS", lifecycleTransition: true });
  }
}

export async function runAssetRemediationTick(adaptersOverride?: {
  builder?: BuilderAgentAdapter | null;
  qa?: QaAgentAdapter | null;
  release?: ReleaseAgentAdapter | null;
}): Promise<{ createdRunId: number | null; processedRunId: number | null }> {
  const createdRunId = await ensureRunForOpenIncident();
  const adapters = {
    builder: adaptersOverride && "builder" in adaptersOverride ? adaptersOverride.builder ?? null : configuredBuilderAdapter(),
    qa: adaptersOverride && "qa" in adaptersOverride ? adaptersOverride.qa ?? null : configuredQaAdapter(),
    release: adaptersOverride && "release" in adaptersOverride ? adaptersOverride.release ?? null : configuredReleaseAdapter(),
  };
  const [run] = await db
    .select()
    .from(assetRemediationRunsTable)
    .where(inArray(assetRemediationRunsTable.status, ["PENDING_REPAIR", "REPAIRING", "QA_PENDING", "QA_RUNNING", "PREVIEW_PENDING", "PREVIEW_DEPLOYING", "PRODUCTION_PENDING", "PRODUCTION_DEPLOYING", "VERIFYING"]))
    .orderBy(asc(assetRemediationRunsTable.startedAt), asc(assetRemediationRunsTable.id))
    .limit(1);
  if (run) await processRun(run, adapters);
  return { createdRunId, processedRunId: run?.id ?? null };
}

export function startAssetRemediationWorker(): void {
  if (timer || process.env.NODE_ENV === "test") return;
  const tick = async () => {
    if (tickRunning) return;
    tickRunning = true;
    try {
      await runAssetRemediationTick();
    } catch (error) {
      logger.error({ err: error }, "Asset remediation worker tick failed");
    } finally {
      tickRunning = false;
    }
  };
  void tick();
  timer = setInterval(() => void tick(), intervalMs());
  timer.unref?.();
  logger.info({ intervalMs: intervalMs() }, "Asset remediation worker started");
}

export function stopAssetRemediationWorkerForTests(): void {
  if (timer) clearInterval(timer);
  timer = null;
  tickRunning = false;
}
