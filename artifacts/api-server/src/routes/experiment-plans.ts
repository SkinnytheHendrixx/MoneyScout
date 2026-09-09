import { desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import {
  db,
  experimentsTable,
  opportunitiesTable,
} from "@workspace/db";
import {
  chooseCheapestFalsifyingExperiment,
  parseStoredExperimentPlan,
  type FalsifyingExperimentPlan,
} from "../lib/experiment-planner";
import type {
  UnderwritingAssessment,
  ValidationResult,
} from "../lib/validation-engine";

const router: IRouter = Router();
const activePlanning = new Set<number>();

type ValidationPlanResponse = {
  current_verdict?: string;
  nextAction?: string;
  assessments?: UnderwritingAssessment[];
  result?: ValidationResult | null;
};

function forwardedOrigin(req: Request): string {
  const forwardedProto = req.get("x-forwarded-proto")?.split(",")[0]?.trim();
  const protocol = forwardedProto || req.protocol;
  const host = req.get("host");
  if (!host) throw new Error("Request host is unavailable");
  return `${protocol}://${host}`;
}

function forwardedAuthHeaders(req: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  const cookie = req.get("cookie");
  const authorization = req.get("authorization");
  if (cookie) headers.cookie = cookie;
  if (authorization) headers.authorization = authorization;
  return headers;
}

async function readValidationPlan(req: Request, opportunityId: number): Promise<ValidationPlanResponse> {
  const response = await fetch(`${forwardedOrigin(req)}/api/opportunities/${opportunityId}/validation-plan`, {
    method: "GET",
    headers: forwardedAuthHeaders(req),
    signal: AbortSignal.timeout(30_000),
  });
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(`validation-plan failed with HTTP ${response.status}${body ? `: ${body.slice(0, 500)}` : ""}`);
  }
  return await response.json() as ValidationPlanResponse;
}

async function latestActivePlan(opportunityId: number): Promise<{
  experimentId: number;
  status: string;
  plan: FalsifyingExperimentPlan;
} | null> {
  const rows = await db
    .select()
    .from(experimentsTable)
    .where(eq(experimentsTable.opportunityId, opportunityId))
    .orderBy(desc(experimentsTable.id));
  for (const row of rows) {
    if (row.status !== "PLANNED" && row.status !== "RUNNING") continue;
    const plan = parseStoredExperimentPlan(row.result);
    if (plan) return { experimentId: row.id, status: row.status, plan };
  }
  return null;
}

router.get("/opportunities/:opportunityId/experiment-plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const [opportunity] = await db
    .select({ id: opportunitiesTable.id, verdict: opportunitiesTable.verdict })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const existing = await latestActivePlan(opportunityId);
  if (!existing) {
    res.status(404).json({
      error: "No active falsifying experiment plan exists for this opportunity.",
      current_verdict: opportunity.verdict,
    });
    return;
  }
  res.status(200).json({
    opportunity_id: opportunityId,
    current_verdict: opportunity.verdict,
    experiment_id: existing.experimentId,
    status: existing.status,
    plan: existing.plan,
  });
});

router.post("/opportunities/:opportunityId/experiments/plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (activePlanning.has(opportunityId)) {
    res.status(409).json({ error: "Experiment planning is already running for this opportunity" });
    return;
  }

  activePlanning.add(opportunityId);
  try {
    const [opportunity] = await db
      .select({
        id: opportunitiesTable.id,
        verdict: opportunitiesTable.verdict,
        sourcePlatform: opportunitiesTable.sourcePlatform,
      })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, opportunityId));
    if (!opportunity) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }

    const existing = await latestActivePlan(opportunityId);
    if (existing) {
      res.status(200).json({
        opportunity_id: opportunityId,
        experiment_id: existing.experimentId,
        status: existing.status,
        reused_existing_plan: true,
        external_cost_usd: 0,
        plan: existing.plan,
      });
      return;
    }

    const validation = await readValidationPlan(req, opportunityId);
    if (
      validation.current_verdict !== "TEST" ||
      validation.nextAction !== "PLAN_EXPERIMENT" ||
      validation.result?.verdict !== "NEEDS_MORE_VALIDATION" ||
      !Array.isArray(validation.assessments)
    ) {
      res.status(409).json({
        error: "Experiment planning requires a TEST opportunity with a completed NEEDS_MORE_VALIDATION underwriting result.",
        current_verdict: validation.current_verdict ?? opportunity.verdict,
        validation_next_action: validation.nextAction ?? null,
        validation_verdict: validation.result?.verdict ?? null,
      });
      return;
    }

    const plan = chooseCheapestFalsifyingExperiment({
      validationResult: validation.result,
      assessments: validation.assessments,
      sourcePlatform: opportunity.sourcePlatform,
    });
    if (!plan) {
      res.status(409).json({
        error: "No deterministic falsifying experiment template covers the unresolved underwriting factors.",
      });
      return;
    }

    const [created] = await db
      .insert(experimentsTable)
      .values({
        opportunityId,
        hypothesis: plan.hypothesis,
        status: "PLANNED",
        result: JSON.stringify(plan),
      })
      .returning();

    res.status(201).json({
      opportunity_id: opportunityId,
      experiment_id: created.id,
      status: created.status,
      reused_existing_plan: false,
      external_cost_usd: 0,
      plan,
      limitations: [
        "The planner chooses a falsifying experiment; it does not execute real-world outreach, payments, marketplace publication, or code deployment.",
        "Cost and time are ordinal planning classes, not calibrated dollar or probability estimates.",
        "No fake-door conversion threshold, probability of success, TAM, or EVI formula is hard-coded.",
        "Only one active PLANNED or RUNNING experiment is allowed per opportunity by the orchestration layer; later experiments are chosen after the current result is recorded.",
      ],
    });
  } catch (error) {
    req.log.error({ err: error, opportunityId }, "Falsifying experiment planning failed");
    res.status(502).json({ error: "Falsifying experiment planning failed without external spend." });
  } finally {
    activePlanning.delete(opportunityId);
  }
});

export default router;
