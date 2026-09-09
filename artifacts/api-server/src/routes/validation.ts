import { and, desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import {
  db,
  demandCheckResultsTable,
  evidenceTable,
  opportunitiesTable,
  policyChecksTable,
  researchRunsTable,
} from "@workspace/db";
import { createAutonomousResolutionPlan } from "../lib/autonomous-resolution-engine";
import {
  assessAllUnderwritingFactors,
  parsePersistedUnderwritingDimension,
  type FactorAssessmentEvidence,
} from "../lib/factor-assessment-workers";
import {
  determineValidationPlan,
  executeValidationWorkflow,
  type ValidationEvidenceRunStatus,
  type ValidationPlan,
} from "../lib/validation-orchestrator";
import type { KillScreenOverall, UnderwritingAssessment } from "../lib/validation-engine";

const router: IRouter = Router();
const activeValidationRuns = new Set<number>();

type KillRiskRunNote = {
  opportunityId?: number;
  killRiskOutcome?: KillScreenOverall;
};

type ValidationRunNote = {
  opportunity_id?: number;
  status?: string;
  external_cost_usd?: number;
  validation_phase?: string;
  validation_verdict?: string | null;
  validation_rationale?: string | null;
};

const parseJsonObject = <T extends object>(value: string | null): Partial<T> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed as Partial<T> : {};
  } catch {
    return {};
  }
};

const validationRunStatus = (notes: Partial<ValidationRunNote>): ValidationEvidenceRunStatus => {
  if (notes.status === "RUNNING") return "RUNNING";
  if (notes.status === "COMPLETED") return "COMPLETED";
  if (notes.status === "FAILED") return "FAILED";
  return "FAILED";
};

const resolutionPlanFor = (plan: ValidationPlan) =>
  plan.resolutionProblem ? createAutonomousResolutionPlan(plan.resolutionProblem) : null;

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
  const pilotSpendApproval = req.get("x-money-scout-allow-pilot-spend");
  const unverifiedProviderApproval = req.get("x-money-scout-allow-unverified-provider");
  if (cookie) headers.cookie = cookie;
  if (authorization) headers.authorization = authorization;
  if (pilotSpendApproval) headers["x-money-scout-allow-pilot-spend"] = pilotSpendApproval;
  if (unverifiedProviderApproval) headers["x-money-scout-allow-unverified-provider"] = unverifiedProviderApproval;
  return headers;
}

function startAutonomousResolution(req: Request, opportunityId: number, plan: ValidationPlan): void {
  if (plan.nextAction !== "RESOLVE_AUTONOMOUSLY" || !plan.resolutionProblem || !plan.stopReason) return;
  let origin: string;
  try {
    origin = forwardedOrigin(req);
  } catch (error) {
    req.log.error({ err: error, opportunityId }, "Unable to start autonomous resolution because request origin is unavailable");
    return;
  }
  const headers = {
    ...forwardedAuthHeaders(req),
    "content-type": "application/json",
  };
  void fetch(`${origin}/api/opportunities/${opportunityId}/resolution/advance`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      problem: plan.resolutionProblem,
      unresolved_question: plan.stopReason,
    }),
    signal: AbortSignal.timeout(300_000),
  })
    .then(async (response) => {
      if (response.ok || response.status === 409) return;
      const body = await response.text().catch(() => "");
      req.log.error(
        { opportunityId, problem: plan.resolutionProblem, status: response.status, body: body.slice(0, 500) },
        "Autonomous validation-resolution kickoff returned a non-success response",
      );
    })
    .catch((error) => {
      req.log.error({ err: error, opportunityId, problem: plan.resolutionProblem }, "Autonomous validation-resolution kickoff failed");
    });
}

async function runValidationEvidenceStage(req: Request, opportunityId: number): Promise<void> {
  const response = await fetch(
    `${forwardedOrigin(req)}/api/opportunities/${opportunityId}/validation-evidence/collect`,
    {
      method: "POST",
      headers: forwardedAuthHeaders(req),
      signal: AbortSignal.timeout(180_000),
    },
  );
  if (!response.ok) {
    const body = await response.text().catch(() => "");
    throw new Error(
      `validation-evidence/collect failed with HTTP ${response.status}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }
}

async function runExperimentPlanningStage(req: Request, opportunityId: number): Promise<unknown> {
  const response = await fetch(
    `${forwardedOrigin(req)}/api/opportunities/${opportunityId}/experiments/plan`,
    {
      method: "POST",
      headers: forwardedAuthHeaders(req),
      signal: AbortSignal.timeout(30_000),
    },
  );
  const body = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(
      `experiments/plan failed with HTTP ${response.status}${body ? `: ${body.slice(0, 500)}` : ""}`,
    );
  }
  if (!body) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

async function latestValidationRun(opportunityId: number): Promise<{
  id: number;
  notes: Partial<ValidationRunNote>;
} | null> {
  const runs = await db
    .select({ id: researchRunsTable.id, notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "VALIDATION_EVIDENCE"))
    .orderBy(desc(researchRunsTable.id));

  for (const run of runs) {
    const notes = parseJsonObject<ValidationRunNote>(run.notes);
    if (notes.opportunity_id === opportunityId) return { id: run.id, notes };
  }

  const evidenceRows = await db
    .select({ researchRunId: evidenceTable.researchRunId })
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId))
    .orderBy(desc(evidenceTable.id));
  const fallbackId = evidenceRows.find((row) => row.researchRunId != null)?.researchRunId;
  if (fallbackId == null) return null;
  const fallback = runs.find((run) => run.id === fallbackId);
  return fallback ? { id: fallback.id, notes: parseJsonObject<ValidationRunNote>(fallback.notes) } : null;
}

async function readAssessments(opportunityId: number, runId: number): Promise<UnderwritingAssessment[]> {
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
  return assessAllUnderwritingFactors(evidence);
}

async function readValidationPlan(opportunityId: number): Promise<{
  opportunityVerdict: string;
  latestPolicyStatus: string | null;
  latestDemandConclusion: string | null;
  latestKillRiskOutcome: KillScreenOverall | null;
  validationRunId: number | null;
  evidenceRunStatus: ValidationEvidenceRunStatus;
  assessments: UnderwritingAssessment[];
  plan: ValidationPlan;
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

  const killRiskRuns = await db
    .select({ notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "KILL_RISK_CHECK"))
    .orderBy(desc(researchRunsTable.id));
  const latestKillRiskOutcome = killRiskRuns
    .map((run) => parseJsonObject<KillRiskRunNote>(run.notes))
    .find((note) => note.opportunityId === opportunityId)?.killRiskOutcome ?? null;

  const validationRuns = await db
    .select({ notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "VALIDATION_EVIDENCE"));
  const matchingValidationNotes = validationRuns
    .map((run) => parseJsonObject<ValidationRunNote>(run.notes))
    .filter((note) => note.opportunity_id === opportunityId);
  const validationExternalCostUsd = Number(
    matchingValidationNotes
      .reduce((sum, notes) => sum + Number(notes.external_cost_usd ?? 0), 0)
      .toFixed(4),
  );

  const latestRun = await latestValidationRun(opportunityId);
  const evidenceRunStatus: ValidationEvidenceRunStatus = latestRun
    ? validationRunStatus(latestRun.notes)
    : "NONE";
  const assessments = latestRun && evidenceRunStatus === "COMPLETED"
    ? await readAssessments(opportunityId, latestRun.id)
    : [];

  const latestPolicyStatus = policyRows[0]?.status ?? null;
  const latestDemandConclusion = demandRows[0]?.demandConclusion ?? null;
  const plan = determineValidationPlan({
    opportunityVerdict: opportunity.verdict,
    policyStatus: latestPolicyStatus,
    demandConclusion: latestDemandConclusion,
    killScreenOverall: latestKillRiskOutcome,
    evidenceRunStatus,
    validationExternalCostUsd,
    assessments,
  });

  return {
    opportunityVerdict: opportunity.verdict,
    latestPolicyStatus,
    latestDemandConclusion,
    latestKillRiskOutcome,
    validationRunId: latestRun?.id ?? null,
    evidenceRunStatus,
    assessments,
    plan,
  };
}

async function persistValidationDecision(
  opportunityId: number,
  runId: number | null,
  plan: ValidationPlan,
): Promise<void> {
  if (plan.phase === "BUILD_READY") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "BUILD", killReason: null })
      .where(eq(opportunitiesTable.id, opportunityId));
  } else if (plan.phase === "WATCH") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "WATCH", killReason: null })
      .where(eq(opportunitiesTable.id, opportunityId));
  } else if (plan.phase === "REJECTED") {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "KILL", killReason: plan.stopReason ?? "Validation rejected the opportunity." })
      .where(eq(opportunitiesTable.id, opportunityId));
  }

  if (runId == null) return;
  const [run] = await db
    .select({ notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.id, runId));
  if (!run) return;
  const existing = parseJsonObject<ValidationRunNote>(run.notes);
  await db
    .update(researchRunsTable)
    .set({
      notes: JSON.stringify({
        ...existing,
        validation_phase: plan.phase,
        validation_verdict: plan.result?.verdict ?? null,
        validation_rationale: plan.stopReason,
      }),
    })
    .where(eq(researchRunsTable.id, runId));
}

router.get("/opportunities/:opportunityId/validation-plan", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  try {
    const state = await readValidationPlan(opportunityId);
    res.status(200).json({
      opportunity_id: opportunityId,
      current_verdict: state.opportunityVerdict,
      latest_policy_status: state.latestPolicyStatus,
      latest_demand_conclusion: state.latestDemandConclusion,
      latest_kill_risk_outcome: state.latestKillRiskOutcome,
      validation_run_id: state.validationRunId,
      evidence_run_status: state.evidenceRunStatus,
      assessments: state.assessments,
      ...state.plan,
      autonomous_resolution_plan: resolutionPlanFor(state.plan),
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Opportunity not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    throw error;
  }
});

router.post("/opportunities/:opportunityId/validation/advance", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  if (activeValidationRuns.has(opportunityId)) {
    res.status(409).json({ error: "Autonomous validation is already running for this opportunity" });
    return;
  }

  activeValidationRuns.add(opportunityId);
  try {
    await readValidationPlan(opportunityId);
    const execution = await executeValidationWorkflow({
      readPlan: async () => (await readValidationPlan(opportunityId)).plan,
      runValidationEvidence: () => runValidationEvidenceStage(req, opportunityId),
    });

    const postCollectionState = await readValidationPlan(opportunityId);
    await persistValidationDecision(
      opportunityId,
      postCollectionState.validationRunId,
      execution.finalPlan,
    );

    let experimentPlanning: unknown = null;
    let experimentPlanningError: string | null = null;
    if (execution.finalPlan.nextAction === "PLAN_EXPERIMENT") {
      try {
        experimentPlanning = await runExperimentPlanningStage(req, opportunityId);
      } catch (error) {
        experimentPlanningError = error instanceof Error ? error.message : "Unknown experiment-planning failure";
        req.log.error({ err: error, opportunityId }, "Automatic falsifying experiment planning failed");
      }
    }

    const [updatedOpportunity] = await db
      .select({ verdict: opportunitiesTable.verdict, killReason: opportunitiesTable.killReason })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, opportunityId));

    res.status(200).json({
      opportunity_id: opportunityId,
      evidence_collection_executed: execution.evidenceCollectionExecuted,
      current_verdict: updatedOpportunity?.verdict ?? postCollectionState.opportunityVerdict,
      kill_reason: updatedOpportunity?.killReason ?? null,
      latest_policy_status: postCollectionState.latestPolicyStatus,
      latest_demand_conclusion: postCollectionState.latestDemandConclusion,
      latest_kill_risk_outcome: postCollectionState.latestKillRiskOutcome,
      validation_run_id: postCollectionState.validationRunId,
      evidence_run_status: postCollectionState.evidenceRunStatus,
      assessments: postCollectionState.assessments,
      ...execution.finalPlan,
      autonomous_resolution_plan: resolutionPlanFor(execution.finalPlan),
      escalation_policy: "OWNER_ESCALATION_FOR_KNOWLEDGE_GAPS_FORBIDDEN_WITHOUT_EXHAUSTION_CERTIFICATE",
      experiment_planning: experimentPlanning,
      experiment_planning_error: experimentPlanningError,
      retry_policy:
        execution.finalPlan.phase === "NEEDS_MORE_VALIDATION" || execution.finalPlan.phase === "AUTONOMOUS_RESOLUTION_REQUIRED"
          ? "NO_BLIND_AUTOMATIC_PAID_RETRY"
          : "NOT_APPLICABLE",
    });

    if (execution.finalPlan.nextAction === "RESOLVE_AUTONOMOUSLY") {
      startAutonomousResolution(req, opportunityId, execution.finalPlan);
    }
  } catch (error) {
    if (error instanceof Error && error.message === "Opportunity not found") {
      res.status(404).json({ error: error.message });
      return;
    }
    req.log.error({ err: error, opportunityId }, "Autonomous validation advance failed");
    res.status(502).json({
      error: "Autonomous validation stopped after a stage failure. No automatic retry was attempted.",
    });
  } finally {
    activeValidationRuns.delete(opportunityId);
  }
});

export default router;
