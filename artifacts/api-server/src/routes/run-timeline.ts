import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  demandCheckResultsTable,
  experimentsTable,
  opportunitiesTable,
  policyChecksTable,
  researchRunsTable,
} from "@workspace/db";

const router: IRouter = Router();

type TimelineItem = {
  id: string;
  stage: string;
  status: string;
  summary: string;
  occurred_at: string | null;
  external_cost_usd: number;
  metadata?: Record<string, unknown>;
};

const parseNotes = (notes: string | null): Record<string, unknown> | null => {
  if (!notes) return null;
  try {
    const parsed = JSON.parse(notes);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
};

const belongsToOpportunity = (notes: Record<string, unknown> | null, opportunityId: number): boolean =>
  notes?.opportunity_id === opportunityId || notes?.opportunityId === opportunityId;

const numberValue = (value: unknown): number => {
  const n = Number(value ?? 0);
  return Number.isFinite(n) ? n : 0;
};

router.get("/opportunities/:opportunityId/run-timeline", async (req, res): Promise<void> => {
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

  const [policyRows, demandRows, researchRuns, experiments] = await Promise.all([
    db.select().from(policyChecksTable)
      .where(eq(policyChecksTable.opportunityId, opportunityId))
      .orderBy(desc(policyChecksTable.checkedAt)),
    db.select().from(demandCheckResultsTable)
      .where(eq(demandCheckResultsTable.opportunityId, opportunityId))
      .orderBy(desc(demandCheckResultsTable.createdAt)),
    db.select().from(researchRunsTable).orderBy(desc(researchRunsTable.startedAt)),
    db.select().from(experimentsTable)
      .where(eq(experimentsTable.opportunityId, opportunityId)),
  ]);

  const items: TimelineItem[] = [];

  for (const row of policyRows) {
    items.push({
      id: `policy-${row.id}`,
      stage: "POLICY_CHECK",
      status: row.status,
      summary: row.summary,
      occurred_at: row.checkedAt.toISOString(),
      external_cost_usd: Number(row.externalCostUsd ?? 0),
      metadata: {
        retrieval_method: row.retrievalMethod,
        evidence_created: row.evidenceCreated,
        web_search_requests: row.webSearchRequests,
      },
    });
  }

  for (const row of demandRows) {
    items.push({
      id: `demand-${row.id}`,
      stage: "DEMAND_CHECK",
      status: row.demandConclusion,
      summary: row.confidenceBasis,
      occurred_at: row.createdAt.toISOString(),
      external_cost_usd: Number(row.externalCostUsd),
      metadata: {
        buyer_identified: row.buyerIdentified,
        workflow_identified: row.workflowIdentified,
        recurring_usage_signal: row.recurringUsageSignal,
        existing_paid_analog_found: row.existingPaidAnalogFound,
      },
    });
  }

  for (const row of researchRuns) {
    const notes = parseNotes(row.notes);
    if (!belongsToOpportunity(notes, opportunityId)) continue;
    const status = typeof notes?.status === "string"
      ? notes.status
      : row.finishedAt ? "COMPLETED" : "RUNNING";
    const outcome = notes?.killRiskOutcome ?? notes?.kill_risk_outcome ?? notes?.validation_result ?? notes?.result;
    items.push({
      id: `run-${row.id}`,
      stage: row.triggerType,
      status,
      summary: typeof outcome === "string" ? outcome : row.triggerType.replaceAll("_", " "),
      occurred_at: row.startedAt.toISOString(),
      external_cost_usd: numberValue(notes?.external_cost_usd ?? notes?.externalCostUsd),
      metadata: notes ?? undefined,
    });
  }

  for (const row of experiments) {
    items.push({
      id: `experiment-${row.id}`,
      stage: "EXPERIMENT",
      status: row.status,
      summary: row.result || row.hypothesis,
      occurred_at: null,
      external_cost_usd: 0,
      metadata: { hypothesis: row.hypothesis, result: row.result },
    });
  }

  items.sort((a, b) => {
    if (!a.occurred_at && !b.occurred_at) return a.id.localeCompare(b.id);
    if (!a.occurred_at) return 1;
    if (!b.occurred_at) return -1;
    return new Date(b.occurred_at).getTime() - new Date(a.occurred_at).getTime();
  });

  const totalExternalCostUsd = Number(
    items.reduce((sum, item) => sum + item.external_cost_usd, 0).toFixed(4),
  );

  res.json({
    opportunity_id: opportunityId,
    current_verdict: opportunity.verdict,
    policy_status: opportunity.policyStatus,
    total_external_cost_usd: totalExternalCostUsd,
    items,
  });
});

export default router;
