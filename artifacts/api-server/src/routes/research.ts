import { desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import {
  db,
  demandCheckResultsTable,
  opportunitiesTable,
  policyChecksTable,
} from "@workspace/db";
import {
  determineResearchPlan,
  type ResearchPlan,
} from "../lib/research-orchestrator";
import { executeResearchWorkflow } from "../lib/research-execution";

const router: IRouter = Router();
const activeResearchRuns = new Set<number>();

async function readResearchPlan(opportunityId: number): Promise<{
  opportunityVerdict: string;
  latestPolicyStatus: "GREEN" | "YELLOW" | "RED" | "UNKNOWN" | null;
  latestDemandConclusion: "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN" | null;
  plan: ResearchPlan;
}> {
  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) throw new Error("Opportunity not found");

  const policyRows = await db
    .select()
    .from(policyChecksTable)
    .where(eq(policyChecksTable.opportunityId, opportunityId))
    .orderBy(desc(policyChecksTable.checkedAt));
  const demandRows = await db
    .select()
    .from(demandCheckResultsTable)
    .where(eq(demandCheckResultsTable.opportunityId, opportunityId))
    .orderBy(desc(demandCheckResultsTable.createdAt));

  const externalCostUsd = Number(
    (
      policyRows.reduce((sum, row) => sum + Number(row.externalCostUsd ?? 0), 0) +
      demandRows.reduce((sum, row) => sum + Number(row.externalCostUsd ?? 0), 0)
    ).toFixed(4),
  );

  const latestPolicyStatus = policyRows[0]?.status ?? null;
  const latestDemandConclusion = demandRows[0]?.demandConclusion ?? null;
  const plan = determineResearchPlan({
    opportunityVerdict: opportunity.verdict,
    policyStatus: latestPolicyStatus,
    demandConclusion: latestDemandConclusion,
    externalCostUsd,
  });

  return {
    opportunityVerdict: opportunity.verdict,
    latestPolicyStatus,
    latestDemandConclusion,
    plan,
  };
}

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

async function runInternalStage(
  req: Request,
  opportunityId: number,
  stage: "policy-checks" | "demand-checks",
): Promise<void> {
  const response = await fetch(
    `${forwardedOrigin(req)}/api/opportunities/${opportunityId}/${stage}`,
    {
      method: "POST",
      headers: forwardedAuthHeaders(req),
      signal: AbortSignal.timeout(120_000),
    },
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `${stage} failed with HTTP ${response.status}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }
}

async function applyResearchOutcome(
  opportunityId: number,
  plan: ResearchPlan,
): Promise<void> {
  if (plan.phase === "VALIDATION_READY") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "TEST", killReason: null })
      .where(eq(opportunitiesTable.id, opportunityId));
    return;
  }

  if (plan.phase === "WATCH") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "WATCH" })
      .where(eq(opportunitiesTable.id, opportunityId));
    return;
  }

  if (plan.phase === "REJECTED") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "KILL", killReason: plan.stopReason })
      .where(eq(opportunitiesTable.id, opportunityId));
  }
}

router.get("/opportunities/:opportunityId/research-plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }

  try {
    const state = await readResearchPlan(opportunityId);
    res.json({
      opportunity_id: opportunityId,
      current_verdict: state.opportunityVerdict,
      latest_policy_status: state.latestPolicyStatus,
      latest_demand_conclusion: state.latestDemandConclusion,
      ...state.plan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Opportunity not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.post("/opportunities/:opportunityId/research/advance", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (activeResearchRuns.has(opportunityId)) {
    res.status(409).json({ error: "Autonomous research is already running for this opportunity" });
    return;
  }

  activeResearchRuns.add(opportunityId);
  try {
    await readResearchPlan(opportunityId);
    const execution = await executeResearchWorkflow({
      readPlan: async () => (await readResearchPlan(opportunityId)).plan,
      runPolicyCheck: () => runInternalStage(req, opportunityId, "policy-checks"),
      runDemandCheck: () => runInternalStage(req, opportunityId, "demand-checks"),
      maxPaidSteps: 2,
    });

    await applyResearchOutcome(opportunityId, execution.finalPlan);
    const finalState = await readResearchPlan(opportunityId);

    res.status(200).json({
      opportunity_id: opportunityId,
      steps_executed: execution.stepsExecuted,
      current_verdict: finalState.opportunityVerdict,
      latest_policy_status: finalState.latestPolicyStatus,
      latest_demand_conclusion: finalState.latestDemandConclusion,
      ...finalState.plan,
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Opportunity not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    req.log.error({ err: error, opportunityId }, "Autonomous research advance failed");
    res.status(502).json({
      error: "Autonomous research stopped after a stage failure. No automatic retry was attempted.",
    });
  } finally {
    activeResearchRuns.delete(opportunityId);
  }
});

export default router;
