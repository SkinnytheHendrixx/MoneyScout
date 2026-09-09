import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, evidenceTable, opportunitiesTable } from "@workspace/db";
import {
  createCommercialBuildBrief,
  type CommercialBuildBrief,
  type CommercialMonetizationConfidence,
} from "../lib/commercial-build-brief";

const router: IRouter = Router();

type CommercialEvidenceRow = {
  claim: string;
  evaluationDimension: string;
  classification: string;
};

const factorFromDimension = (value: string): string | null => {
  if (!value.startsWith("underwriting:")) return null;
  const [, factor] = value.split(":");
  return factor || null;
};

const uniqueClaims = (rows: CommercialEvidenceRow[]): string[] => rows
  .map((row) => row.claim)
  .filter((claim, index, all) => all.indexOf(claim) === index)
  .slice(0, 12);

const rowsForFactors = (
  rows: CommercialEvidenceRow[],
  factors: Set<string>,
): CommercialEvidenceRow[] => rows.filter((row) => {
  const factor = factorFromDimension(row.evaluationDimension);
  return factor != null && factors.has(factor);
});

const rowsForResolutionProblem = (
  rows: CommercialEvidenceRow[],
  problem: "buyer" | "pricing" | "distribution",
): CommercialEvidenceRow[] => rows.filter((row) =>
  row.evaluationDimension.startsWith(`resolution_commercial_${problem}_unresolved_`),
);

const mergeEvidenceRows = (...groups: CommercialEvidenceRow[][]): CommercialEvidenceRow[] => {
  const seen = new Set<string>();
  const merged: CommercialEvidenceRow[] = [];
  for (const row of groups.flat()) {
    const key = `${row.classification}:${row.evaluationDimension}:${row.claim}`;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(row);
  }
  return merged;
};

const BUYER_FACTORS = new Set([
  "buyer_budget_clarity",
  "problem_intensity_recurrence",
  "adoption_switching_friction",
]);
const PROBLEM_FACTORS = new Set([
  "problem_intensity_recurrence",
  "demand_trajectory_durability",
  "competitive_beatability_gap_quality",
]);
const MONETIZATION_FACTORS = new Set([
  "monetization_proof_price_tolerance",
  "buyer_budget_clarity",
  "unit_economics_pricing_power",
  "economic_headroom",
]);
const DISTRIBUTION_FACTORS = new Set([
  "distribution_accessibility_acquisition_economics",
  "adoption_switching_friction",
  "falsifiability_feedback_velocity",
]);
const TECHNICAL_FACTORS = new Set([
  "build_complexity_technical_uncertainty",
  "operating_maintenance_burden",
  "capital_at_risk_reversibility",
  "falsifiability_feedback_velocity",
]);

function monetizationConfidence(rows: CommercialEvidenceRow[]): CommercialMonetizationConfidence {
  if (!rows.length) return "UNRESOLVED";
  if (rows.some((row) => row.classification === "FACT")) return "DIRECTLY_OBSERVED";
  if (rows.some((row) => row.evaluationDimension.startsWith("resolution_commercial_pricing_unresolved_"))) {
    return "BOUNDED_HYPOTHESIS";
  }
  return "STRONGLY_INFERRED";
}

export async function loadCommercialBuildBrief(opportunityId: number): Promise<CommercialBuildBrief | null> {
  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) return null;

  const evidence: CommercialEvidenceRow[] = await db
    .select({
      claim: evidenceTable.claim,
      evaluationDimension: evidenceTable.evaluationDimension,
      classification: evidenceTable.classification,
    })
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId));

  const buyerRows = mergeEvidenceRows(
    rowsForFactors(evidence, BUYER_FACTORS),
    rowsForResolutionProblem(evidence, "buyer"),
  );
  const monetizationRows = mergeEvidenceRows(
    rowsForFactors(evidence, MONETIZATION_FACTORS),
    rowsForResolutionProblem(evidence, "pricing"),
  );
  const distributionRows = mergeEvidenceRows(
    rowsForFactors(evidence, DISTRIBUTION_FACTORS),
    rowsForResolutionProblem(evidence, "distribution"),
  );

  return createCommercialBuildBrief({
    opportunityId,
    name: opportunity.name,
    sourcePlatform: opportunity.sourcePlatform,
    sourceUrl: opportunity.sourceUrl,
    opportunityType: opportunity.opportunityType,
    thesis: opportunity.thesis,
    engineFamily: opportunity.engineFamily,
    verdict: opportunity.verdict,
    policyStatus: opportunity.policyStatus,
    buyerEvidence: uniqueClaims(buyerRows),
    problemEvidence: uniqueClaims(rowsForFactors(evidence, PROBLEM_FACTORS)),
    monetizationEvidence: uniqueClaims(monetizationRows),
    monetizationConfidenceState: monetizationConfidence(monetizationRows),
    distributionEvidence: uniqueClaims(distributionRows),
    technicalEvidence: uniqueClaims(rowsForFactors(evidence, TECHNICAL_FACTORS)),
  });
}

router.get("/opportunities/:opportunityId/commercial-build-brief", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }

  const brief = await loadCommercialBuildBrief(opportunityId);
  if (!brief) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  res.status(200).json({
    ...brief,
    generation: {
      external_cost_usd: 0,
      external_calls_performed: 0,
      persisted: false,
      note: "This brief is a deterministic read-only projection over persisted Money Scout evidence. It includes completed autonomous commercial-resolution evidence without upgrading inference to direct observation. It does not trigger a coding agent or external side effect.",
    },
  });
});

export default router;
