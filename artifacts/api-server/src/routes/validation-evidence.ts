import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import {
  db,
  evidenceTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import { collectValidationEvidence } from "../lib/validation-evidence-collector";

const router: IRouter = Router();
const activeCollectors = new Set<number>();

router.post("/opportunities/:opportunityId/validation-evidence/collect", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (activeCollectors.has(opportunityId)) {
    res.status(409).json({ error: "Validation evidence collection is already running for this opportunity" });
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
  if (opportunity.verdict !== "TEST") {
    res.status(409).json({
      error: "Validation evidence collection requires a TEST opportunity that has cleared autonomous Research.",
    });
    return;
  }

  activeCollectors.add(opportunityId);
  const [run] = await db
    .insert(researchRunsTable)
    .values({
      startedAt: new Date(),
      triggerType: "VALIDATION_EVIDENCE",
      notes: JSON.stringify({ opportunity_id: opportunityId, status: "RUNNING", external_cost_usd: 0 }),
    })
    .returning();

  try {
    const collected = await collectValidationEvidence({
      name: opportunity.name,
      sourcePlatform: opportunity.sourcePlatform,
      sourceUrl: opportunity.sourceUrl,
      opportunityType: opportunity.opportunityType,
      thesis: opportunity.thesis,
    });

    const observedDate = new Date().toISOString().slice(0, 10);
    const savedEvidence = collected.findings.length
      ? await db
          .insert(evidenceTable)
          .values(
            collected.findings.map((finding) => ({
              opportunityId,
              claim: finding.claim,
              sourceUrl: finding.source_url,
              sourceTitle: finding.source_title,
              observedDate,
              classification: finding.classification,
              evaluationDimension: `underwriting:${finding.factor}:${finding.direction}:${finding.evidence_kind}`,
              researchRunId: run.id,
            })),
          )
          .returning({ id: evidenceTable.id })
      : [];

    const finishedAt = new Date();
    const notes = {
      opportunity_id: opportunityId,
      status: "COMPLETED",
      external_cost_usd: collected.externalCostUsd,
      search_count: collected.searchCount,
      ai_input_tokens: collected.inputTokens,
      ai_output_tokens: collected.outputTokens,
      findings_persisted: savedEvidence.length,
      coverage: collected.coverage,
    };
    await db
      .update(researchRunsTable)
      .set({ finishedAt, notes: JSON.stringify(notes) })
      .where(eq(researchRunsTable.id, run.id));

    res.status(200).json({
      opportunity_id: opportunityId,
      run_id: run.id,
      external_cost_usd: collected.externalCostUsd,
      search_count: collected.searchCount,
      ai_input_tokens: collected.inputTokens,
      ai_output_tokens: collected.outputTokens,
      findings_persisted: savedEvidence.length,
      findings: collected.findings,
      coverage: collected.coverage,
      limitations: [
        "This collector gathers evidence and coverage only. It does not assign underwriting strengths or a build verdict.",
        "Only findings whose URLs were returned by the bounded web-search tool are accepted and persisted.",
        "UNRESOLVED is preserved when public evidence cannot establish a factor; missing evidence is not converted into a weak or negative score.",
        "Usage, listed prices, broad TAM, and AI-generated estimates are not promoted into observed willingness to pay, revenue, retention, CAC, or profitability.",
      ],
    });
  } catch (error) {
    req.log.error({ err: error, opportunityId, runId: run.id }, "Validation evidence collection failed");
    const unavailable = error instanceof Error && error.message === "AI_INTEGRATION_UNAVAILABLE";
    if (unavailable) {
      await db.delete(researchRunsTable).where(eq(researchRunsTable.id, run.id));
      res.status(503).json({ error: "AI_INTEGRATION_UNAVAILABLE" });
      return;
    }

    await db
      .update(researchRunsTable)
      .set({
        finishedAt: new Date(),
        notes: JSON.stringify({
          opportunity_id: opportunityId,
          status: "FAILED",
          external_cost_usd: 0,
          retry_policy: "NO_AUTOMATIC_RETRY",
        }),
      })
      .where(eq(researchRunsTable.id, run.id));
    res.status(502).json({
      error: "Validation evidence collection failed without automatic retry",
    });
  } finally {
    activeCollectors.delete(opportunityId);
  }
});

export default router;
