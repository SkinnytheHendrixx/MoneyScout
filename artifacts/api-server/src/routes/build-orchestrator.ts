import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  buildJobsTable,
  db,
  type PersistedBuildContract,
} from "@workspace/db";
import { createBuildJobContract } from "../lib/build-orchestrator";
import { createMonetizationExecutionPlan } from "../lib/monetization-execution-plan";
import {
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
} from "../lib/lifecycle-state";
import { loadCommercialBuildBrief } from "./commercial-build";

const router: IRouter = Router();

const buildIdempotencyKey = (opportunityId: number, cycleId: number | null): string =>
  `opp-${opportunityId}:${cycleId == null ? "no-cycle" : `cycle-${cycleId}`}:build-contract-v1`;

export async function orchestrateBuild(opportunityId: number) {
  const brief = await loadCommercialBuildBrief(opportunityId);
  if (!brief) return { kind: "NOT_FOUND" as const };

  const monetizationPlan = createMonetizationExecutionPlan(brief);
  const cycle = await getActiveEvaluationCycle(opportunityId);
  const contract = createBuildJobContract({
    brief,
    monetizationPlan,
    evaluationCycleId: cycle?.id ?? null,
  });

  if (contract.status !== "READY_FOR_BUILDER") {
    return {
      kind: "BLOCKED" as const,
      contract,
      monetizationPlan,
    };
  }

  const idempotencyKey = buildIdempotencyKey(opportunityId, cycle?.id ?? null);
  const now = new Date();
  const [created] = await db
    .insert(buildJobsTable)
    .values({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      idempotencyKey,
      status: "READY_FOR_BUILDER",
      productShape: contract.product.primaryShape,
      supportingShapes: contract.product.supportingShapes,
      builderProfile: contract.product.builderProfile,
      contract: contract as unknown as PersistedBuildContract,
      externalSpendCeilingCents: 0,
      externalSpendUsedCents: 0,
      startedAt: now,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: buildJobsTable.idempotencyKey })
    .returning();

  const buildJob = created ?? (await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.idempotencyKey, idempotencyKey)))[0];

  if (!buildJob) throw new Error("Build job could not be created or recovered after idempotency conflict");

  if (created) {
    await setOpportunityActivity(opportunityId, {
      activeEvaluationCycleId: cycle?.id ?? null,
      currentActivityKey: "BUILD_READY_FOR_BUILDER",
      currentActivityLabel: `Build contract ready: ${contract.product.builderProfile.toLowerCase().replaceAll("_", " ")}`,
      activityStatus: "WAITING",
      activityStartedAt: now,
      expectedDurationSeconds: null,
      stageIndex: null,
      stageCount: null,
      nextAction: "Provision an isolated builder workspace and execute the minimum sellable outcome contract.",
      etaBasis: "BUILDER_WORKSPACE_NOT_YET_PROVISIONED",
      lifecycleTransition: true,
    });
    await recordLifecycleEvent({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      eventType: "BUILD_JOB_CREATED",
      summary: `Build job ${buildJob.id} created for ${contract.product.primaryShape}; external build-spend ceiling is $0 until explicitly changed by owner authority.`,
      metadata: {
        build_job_id: buildJob.id,
        product_shape: contract.product.primaryShape,
        builder_profile: contract.product.builderProfile,
        minimum_sellable_outcome: contract.product.minimumSellableOutcome,
        next_gate: contract.nextGate,
      },
      occurredAt: now,
    });
  }

  return {
    kind: "READY" as const,
    buildJob,
    contract,
    monetizationPlan,
    reused: !created,
  };
}

router.post("/opportunities/:opportunityId/build/orchestrate", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }

  const result = await orchestrateBuild(opportunityId);
  if (result.kind === "NOT_FOUND") {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  if (result.kind === "BLOCKED") {
    res.status(409).json({
      error: "BUILD_ORCHESTRATOR_NOT_READY",
      message: result.contract.blockers.join(" ") || "Commercial plan is not ready for internal build.",
      contract: result.contract,
      monetization_plan_status: result.monetizationPlan.status,
      next_gate: result.monetizationPlan.autonomy.nextGate,
      external_cost_usd: 0,
    });
    return;
  }

  res.status(200).json({
    status: "READY_FOR_BUILDER",
    build_job_id: result.buildJob.id,
    build_job_status: result.buildJob.status,
    reused: result.reused,
    contract: result.contract,
    next_action: "RUN_BUILDER_WORKSPACE",
    generation: {
      external_cost_usd: 0,
      external_calls_performed: 0,
      coding_agent_started: false,
      published_externally: false,
      customer_charging_started: false,
      note: "The Build Orchestrator creates the durable minimum-sellable build contract and hands it to the future isolated builder workspace. It does not yet invoke a coding agent or authorize external spend.",
    },
  });
});

router.get("/opportunities/:opportunityId/build/jobs", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const jobs = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.opportunityId, opportunityId))
    .orderBy(desc(buildJobsTable.createdAt));
  res.status(200).json({ jobs });
});

router.get("/build/jobs/:buildJobId", async (req, res): Promise<void> => {
  const buildJobId = Number(req.params.buildJobId);
  if (!Number.isInteger(buildJobId) || buildJobId <= 0) {
    res.status(400).json({ error: "Invalid build job id" });
    return;
  }
  const [job] = await db
    .select()
    .from(buildJobsTable)
    .where(eq(buildJobsTable.id, buildJobId));
  if (!job) {
    res.status(404).json({ error: "Build job not found" });
    return;
  }
  res.status(200).json({ job });
});

export default router;
