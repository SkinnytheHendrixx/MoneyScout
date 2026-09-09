import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  evidenceTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import {
  assessAllUnderwritingFactors,
  parsePersistedUnderwritingDimension,
  type FactorAssessmentEvidence,
} from "../lib/factor-assessment-workers";

const router: IRouter = Router();

type ValidationRunNotes = {
  opportunity_id?: number;
  status?: string;
  coverage?: unknown;
};

const parseRunNotes = (value: string | null): ValidationRunNotes => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as ValidationRunNotes : {};
  } catch {
    return {};
  }
};

async function latestValidationRunId(opportunityId: number): Promise<number | null> {
  const runs = await db
    .select({ id: researchRunsTable.id, notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "VALIDATION_EVIDENCE"))
    .orderBy(desc(researchRunsTable.id));

  const explicit = runs.find((run) => parseRunNotes(run.notes).opportunity_id === opportunityId);
  if (explicit) return explicit.id;

  // Backward-compatible fallback for Task #47 runs created before opportunity_id was included in notes.
  const evidenceRows = await db
    .select({ researchRunId: evidenceTable.researchRunId })
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId))
    .orderBy(desc(evidenceTable.id));
  return evidenceRows.find((row) => row.researchRunId != null)?.researchRunId ?? null;
}

router.get("/opportunities/:opportunityId/validation/factor-assessments", async (req, res): Promise<void> => {
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

  const runId = await latestValidationRunId(opportunityId);
  if (runId == null) {
    res.status(409).json({
      error: "No validation evidence run exists for this opportunity.",
      next_action: opportunity.verdict === "TEST" ? "COLLECT_VALIDATION_EVIDENCE" : "WAIT_FOR_TEST_VERDICT",
    });
    return;
  }

  const rows = await db
    .select()
    .from(evidenceTable)
    .where(
      and(
        eq(evidenceTable.opportunityId, opportunityId),
        eq(evidenceTable.researchRunId, runId),
      ),
    )
    .orderBy(evidenceTable.id);

  const evidence: FactorAssessmentEvidence[] = [];
  for (const row of rows) {
    const parsed = parsePersistedUnderwritingDimension(row.evaluationDimension);
    if (!parsed) continue;
    evidence.push({
      id: row.id,
      claim: row.claim,
      sourceUrl: row.sourceUrl,
      sourceTitle: row.sourceTitle,
      observedDate: row.observedDate,
      classification: row.classification,
      factor: parsed.factor,
      direction: parsed.direction,
      evidenceKind: parsed.evidenceKind,
    });
  }

  const assessments = assessAllUnderwritingFactors(evidence);
  res.status(200).json({
    opportunity_id: opportunityId,
    current_verdict: opportunity.verdict,
    validation_run_id: runId,
    external_cost_usd: 0,
    evidence_rows_evaluated: evidence.length,
    assessments,
    limitations: [
      "This endpoint is deterministic and makes no external calls.",
      "Factor strength is determined by factor-specific evidence rules; no additive average or generic LLM score is used.",
      "One source is not enough for medium confidence because source independence is unresolved.",
      "Source recency remains UNKNOWN because Task #47 records collection date, not source publication/update date.",
      "A listed price alone cannot make monetization proof ADEQUATE, and pricing alone cannot establish unit economics.",
      "Missing evidence remains UNKNOWN rather than being converted into negative evidence.",
    ],
  });
});

export default router;
