import { eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, evidenceTable, opportunitiesTable } from "@workspace/db";
import { createCommercialBuildBrief } from "../lib/commercial-build-brief";

const router: IRouter = Router();

const factorFromDimension = (value: string): string | null => {
  if (!value.startsWith("underwriting:")) return null;
  const [, factor] = value.split(":");
  return factor || null;
};

const claimsForFactors = (
  rows: Array<{ claim: string; evaluationDimension: string }>,
  factors: Set<string>,
): string[] => rows
  .filter((row) => {
    const factor = factorFromDimension(row.evaluationDimension);
    return factor != null && factors.has(factor);
  })
  .map((row) => row.claim)
  .filter((claim, index, all) => all.indexOf(claim) === index)
  .slice(0, 12);

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

router.get("/opportunities/:opportunityId/commercial-build-brief", async (req, res): Promise<void> => {
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

  const evidence = await db
    .select({
      claim: evidenceTable.claim,
      evaluationDimension: evidenceTable.evaluationDimension,
    })
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId));

  const brief = createCommercialBuildBrief({
    opportunityId,
    name: opportunity.name,
    sourcePlatform: opportunity.sourcePlatform,
    sourceUrl: opportunity.sourceUrl,
    opportunityType: opportunity.opportunityType,
    thesis: opportunity.thesis,
    engineFamily: opportunity.engineFamily,
    verdict: opportunity.verdict,
    policyStatus: opportunity.policyStatus,
    buyerEvidence: claimsForFactors(evidence, BUYER_FACTORS),
    problemEvidence: claimsForFactors(evidence, PROBLEM_FACTORS),
    monetizationEvidence: claimsForFactors(evidence, MONETIZATION_FACTORS),
    distributionEvidence: claimsForFactors(evidence, DISTRIBUTION_FACTORS),
    technicalEvidence: claimsForFactors(evidence, TECHNICAL_FACTORS),
  });

  res.status(200).json({
    ...brief,
    generation: {
      external_cost_usd: 0,
      external_calls_performed: 0,
      persisted: false,
      note: "This brief is a deterministic read-only projection over persisted Money Scout evidence. It does not trigger a coding agent or external side effect.",
    },
  });
});

export default router;
