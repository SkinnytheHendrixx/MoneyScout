import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  demandCheckResultsTable,
  opportunitiesTable,
  policyChecksTable,
} from "@workspace/db";
import {
  evaluateKillScreen,
  runExistingResearchEvidenceWorkers,
} from "../lib/evidence-workers";

const router: IRouter = Router();

router.get("/opportunities/:opportunityId/evidence-profile", async (req, res): Promise<void> => {
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

  const [policy] = await db
    .select()
    .from(policyChecksTable)
    .where(eq(policyChecksTable.opportunityId, opportunityId))
    .orderBy(desc(policyChecksTable.checkedAt))
    .limit(1);
  const [demand] = await db
    .select()
    .from(demandCheckResultsTable)
    .where(eq(demandCheckResultsTable.opportunityId, opportunityId))
    .orderBy(desc(demandCheckResultsTable.createdAt))
    .limit(1);

  const context = {
    policyStatus: policy?.status ?? null,
    demandConclusion: demand?.demandConclusion ?? null,
    buyerIdentified: demand?.buyerIdentified ?? null,
    buyerDescription: demand?.buyerDescription ?? null,
    recurringUsageSignal: demand?.recurringUsageSignal ?? null,
    recurringUsageBasis: demand?.recurringUsageBasis ?? null,
    existingPaidAnalogFound: demand?.existingPaidAnalogFound ?? null,
    paidAnalogNames: demand?.paidAnalogNames ?? [],
  } as const;

  const evidence = runExistingResearchEvidenceWorkers(context);
  const killScreen = evaluateKillScreen(context, evidence);

  res.json({
    opportunity_id: opportunityId,
    current_verdict: opportunity.verdict,
    external_cost_usd: 0,
    evidence,
    kill_screen: killScreen,
    limitations: [
      "This profile reuses already-collected research and makes no external calls.",
      "CLEAR means clear only for the evidence actually evaluated; dedicated workers are still required for unresolved kill classes.",
      "Paid analog existence is willingness-to-pay evidence, not proof of our revenue, retention, or profitability.",
    ],
  });
});

export default router;
