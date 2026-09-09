import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  demandCheckResultsTable,
  opportunitiesTable,
  policyChecksTable,
} from "@workspace/db";
import { determineResearchPlan } from "../lib/research-orchestrator";

const router: IRouter = Router();

router.get("/opportunities/:opportunityId/research-plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }

  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

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

  const plan = determineResearchPlan({
    opportunityVerdict: opportunity.verdict,
    policyStatus: policyRows[0]?.status ?? null,
    demandConclusion: demandRows[0]?.demandConclusion ?? null,
    externalCostUsd,
  });

  res.json({
    opportunity_id: opportunityId,
    current_verdict: opportunity.verdict,
    latest_policy_status: policyRows[0]?.status ?? null,
    latest_demand_conclusion: demandRows[0]?.demandConclusion ?? null,
    ...plan,
  });
});

export default router;
