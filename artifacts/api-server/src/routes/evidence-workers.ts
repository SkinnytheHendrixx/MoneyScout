import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  demandCheckResultsTable,
  evidenceTable,
  opportunitiesTable,
  policyChecksTable,
} from "@workspace/db";
import {
  evaluateKillScreen,
  runExistingResearchEvidenceWorkers,
} from "../lib/evidence-workers";
import {
  mergeKillScreenAssessments,
  runDedicatedKillRiskWorkers,
  type DedicatedKillRiskInputs,
  type TriState,
} from "../lib/kill-risk-workers";
import { collectKillRiskEvidence } from "../lib/kill-risk-collector";

const router: IRouter = Router();
const TRI_STATES = new Set<TriState>(["YES", "NO", "UNKNOWN"]);
const activeCollectors = new Set<number>();

const validTriState = (value: unknown): value is TriState => typeof value === "string" && TRI_STATES.has(value as TriState);

function validateDedicatedInputs(value: unknown): value is DedicatedKillRiskInputs {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const input = value as Record<string, unknown>;
  const platform = input.platformOwner as Record<string, unknown> | null | undefined;
  const maintenance = input.maintenance as Record<string, unknown> | null | undefined;
  const distribution = input.distribution as Record<string, unknown> | null | undefined;
  const network = input.networkEffects as Record<string, unknown> | null | undefined;
  const validSource = (item: Record<string, unknown>) => item.sourceRef == null || typeof item.sourceRef === "string";
  return (
    (!platform || (validSource(platform) && validTriState(platform.ownerAlreadyCompetes) && validTriState(platform.ownerDistributionAdvantage) && validTriState(platform.ownerAbsorptionSignal))) &&
    (!maintenance || (validSource(maintenance) && validTriState(maintenance.dependencyVolatile) && validTriState(maintenance.repeatedBreakageObserved) && validTriState(maintenance.maintenanceBurdenDisproportionate))) &&
    (!distribution || (validSource(distribution) && validTriState(distribution.targetBuyerReachable) && validTriState(distribution.viableAcquisitionChannelExists) && validTriState(distribution.acquisitionEconomicsPlausible))) &&
    (!network || (validSource(network) && validTriState(network.switchingCostsHigh) && validTriState(network.dataOrWorkflowPortable) && validTriState(network.multihomingPractical)))
  );
}

async function readExistingContext(opportunityId: number) {
  const [opportunity] = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) return null;
  const [policy] = await db.select().from(policyChecksTable).where(eq(policyChecksTable.opportunityId, opportunityId)).orderBy(desc(policyChecksTable.checkedAt)).limit(1);
  const [demand] = await db.select().from(demandCheckResultsTable).where(eq(demandCheckResultsTable.opportunityId, opportunityId)).orderBy(desc(demandCheckResultsTable.createdAt)).limit(1);
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
  return { opportunity, context };
}

router.get("/opportunities/:opportunityId/evidence-profile", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const state = await readExistingContext(opportunityId);
  if (!state) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const evidence = runExistingResearchEvidenceWorkers(state.context);
  const killScreen = evaluateKillScreen(state.context, evidence);
  res.json({
    opportunity_id: opportunityId,
    current_verdict: state.opportunity.verdict,
    external_cost_usd: 0,
    evidence,
    kill_screen: killScreen,
    limitations: [
      "This profile reuses already-collected research and makes no external calls.",
      "CLEAR means clear only for the evidence actually evaluated; unresolved kill classes remain UNKNOWN until dedicated evidence is supplied.",
      "Paid analog existence is willingness-to-pay evidence, not proof of our revenue, retention, or profitability.",
    ],
  });
});

router.post("/opportunities/:opportunityId/kill-screen/evaluate", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (!validateDedicatedInputs(req.body)) {
    res.status(400).json({ error: "Invalid kill-risk worker evidence. Use YES, NO, or UNKNOWN for every supplied signal." });
    return;
  }
  const state = await readExistingContext(opportunityId);
  if (!state) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const existingEvidence = runExistingResearchEvidenceWorkers(state.context);
  const baseScreen = evaluateKillScreen(state.context, existingEvidence);
  const dedicatedAssessments = runDedicatedKillRiskWorkers(req.body);
  const killScreen = mergeKillScreenAssessments(baseScreen, dedicatedAssessments);
  const dedicatedEvidence = dedicatedAssessments.flatMap((assessment) => assessment.evidence);
  res.json({
    opportunity_id: opportunityId,
    current_verdict: state.opportunity.verdict,
    external_cost_usd: 0,
    evidence: [...existingEvidence, ...dedicatedEvidence],
    kill_screen: killScreen,
    persisted: false,
    limitations: [
      "This endpoint deterministically evaluates supplied evidence and makes no external calls.",
      "It does not invent missing facts or persist supplied observations; collection/persistence is a separate worker responsibility.",
      "UNKNOWN remains UNKNOWN when evidence is incomplete or mixed.",
    ],
  });
});

router.post("/opportunities/:opportunityId/kill-screen/collect", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (activeCollectors.has(opportunityId)) {
    res.status(409).json({ error: "Kill-risk evidence collection is already running for this opportunity" });
    return;
  }
  const state = await readExistingContext(opportunityId);
  if (!state) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  activeCollectors.add(opportunityId);
  try {
    const collected = await collectKillRiskEvidence({
      name: state.opportunity.name,
      sourcePlatform: state.opportunity.sourcePlatform,
      sourceUrl: state.opportunity.sourceUrl,
      opportunityType: state.opportunity.opportunityType,
      thesis: state.opportunity.thesis,
    });

    const observedDate = new Date().toISOString().slice(0, 10);
    if (collected.findings.length) {
      await db.insert(evidenceTable).values(collected.findings.map((finding) => ({
        opportunityId,
        claim: finding.claim,
        sourceUrl: finding.source_url,
        sourceTitle: finding.source_title,
        observedDate,
        classification: finding.classification,
        evaluationDimension: finding.evaluation_dimension,
      })));
    }

    const existingEvidence = runExistingResearchEvidenceWorkers(state.context);
    const baseScreen = evaluateKillScreen(state.context, existingEvidence);
    const dedicatedAssessments = runDedicatedKillRiskWorkers(collected.inputs);
    const killScreen = mergeKillScreenAssessments(baseScreen, dedicatedAssessments);

    res.status(200).json({
      opportunity_id: opportunityId,
      external_cost_usd: collected.externalCostUsd,
      search_count: collected.searchCount,
      ai_input_tokens: collected.inputTokens,
      ai_output_tokens: collected.outputTokens,
      findings_persisted: collected.findings.length,
      collected_inputs: collected.inputs,
      source_findings: collected.findings,
      kill_screen: killScreen,
      limitations: [
        "The collector is bounded to one Claude call, four web searches, and an estimated $0.50 external-service ceiling.",
        "Only findings whose URLs were actually returned by the web-search tool are accepted and persisted.",
        "UNKNOWN is preserved when source evidence cannot establish a signal; absence of evidence is never converted into CLEAR or CONFIRMED.",
      ],
    });
  } catch (error) {
    req.log.error({ err: error, opportunityId }, "Kill-risk evidence collection failed");
    const unavailable = error instanceof Error && error.message === "AI_INTEGRATION_UNAVAILABLE";
    res.status(unavailable ? 503 : 502).json({
      error: unavailable ? "AI_INTEGRATION_UNAVAILABLE" : "Kill-risk evidence collection failed without automatic retry",
    });
  } finally {
    activeCollectors.delete(opportunityId);
  }
});

export default router;
