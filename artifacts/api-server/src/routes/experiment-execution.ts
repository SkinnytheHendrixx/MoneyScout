import { desc, eq } from "drizzle-orm";
import { Router, type IRouter, type Request } from "express";
import {
  db,
  evidenceTable,
  experimentsTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import {
  executeRegisteredExperiment,
  experimentExecutionCapability,
  parseStoredExperimentExecution,
  storedExecutionStatusFromOutcome,
  type StoredExperimentExecution,
} from "../lib/experiment-executor";
import {
  parseStoredExperimentPlan,
  type FalsifyingExperimentPlan,
} from "../lib/experiment-planner";

const router: IRouter = Router();
const activeExecutions = new Set<number>();

type ValidationRunNote = {
  opportunity_id?: number;
  status?: string;
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

async function runValidationReassessment(req: Request, opportunityId: number): Promise<unknown> {
  const response = await fetch(
    `${forwardedOrigin(req)}/api/opportunities/${opportunityId}/validation/advance`,
    {
      method: "POST",
      headers: forwardedAuthHeaders(req),
      signal: AbortSignal.timeout(60_000),
    },
  );
  const body = await response.text().catch(() => "");
  if (!response.ok) {
    throw new Error(`validation/advance failed with HTTP ${response.status}${body ? `: ${body.slice(0, 500)}` : ""}`);
  }
  if (!body) return null;
  try {
    return JSON.parse(body) as unknown;
  } catch {
    return null;
  }
}

async function latestCompletedValidationRunId(opportunityId: number): Promise<number | null> {
  const runs = await db
    .select({ id: researchRunsTable.id, notes: researchRunsTable.notes })
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "VALIDATION_EVIDENCE"))
    .orderBy(desc(researchRunsTable.id));

  for (const run of runs) {
    const notes = parseJsonObject<ValidationRunNote>(run.notes);
    if (notes.opportunity_id === opportunityId && notes.status === "COMPLETED") return run.id;
  }
  return null;
}

const storedPlan = (value: string | null): FalsifyingExperimentPlan | null =>
  parseStoredExperimentPlan(value) ?? parseStoredExperimentExecution(value)?.plan ?? null;

async function loadExperiment(opportunityId: number, experimentId: number) {
  const [opportunity] = await db
    .select({
      id: opportunitiesTable.id,
      verdict: opportunitiesTable.verdict,
      engineFamily: opportunitiesTable.engineFamily,
      sourcePlatform: opportunitiesTable.sourcePlatform,
      sourceUrl: opportunitiesTable.sourceUrl,
      opportunityType: opportunitiesTable.opportunityType,
      thesis: opportunitiesTable.thesis,
    })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) return null;

  const [experiment] = await db
    .select()
    .from(experimentsTable)
    .where(eq(experimentsTable.id, experimentId));
  if (!experiment || experiment.opportunityId !== opportunityId) return { opportunity, experiment: null };
  return { opportunity, experiment };
}

router.get(
  "/opportunities/:opportunityId/experiments/:experimentId/execution-plan",
  async (req, res): Promise<void> => {
    const opportunityId = Number(req.params.opportunityId);
    const experimentId = Number(req.params.experimentId);
    if (!Number.isInteger(opportunityId) || opportunityId <= 0 || !Number.isInteger(experimentId) || experimentId <= 0) {
      res.status(400).json({ error: "Invalid opportunity or experiment id" });
      return;
    }

    const loaded = await loadExperiment(opportunityId, experimentId);
    if (!loaded) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }
    if (!loaded.experiment) {
      res.status(404).json({ error: "Experiment not found for this opportunity" });
      return;
    }

    const plan = storedPlan(loaded.experiment.result);
    if (!plan) {
      res.status(409).json({ error: "Experiment does not contain a schema-valid falsifying plan" });
      return;
    }
    const capability = experimentExecutionCapability({
      engineFamily: loaded.opportunity.engineFamily,
      experimentType: plan.experimentType,
    });
    res.status(200).json({
      opportunity_id: opportunityId,
      experiment_id: experimentId,
      experiment_status: loaded.experiment.status,
      current_verdict: loaded.opportunity.verdict,
      plan,
      capability,
      stored_execution: parseStoredExperimentExecution(loaded.experiment.result),
      automatic_external_cost_ceiling_usd: 0,
    });
  },
);

router.post(
  "/opportunities/:opportunityId/experiments/:experimentId/execute",
  async (req, res): Promise<void> => {
    const opportunityId = Number(req.params.opportunityId);
    const experimentId = Number(req.params.experimentId);
    if (!Number.isInteger(opportunityId) || opportunityId <= 0 || !Number.isInteger(experimentId) || experimentId <= 0) {
      res.status(400).json({ error: "Invalid opportunity or experiment id" });
      return;
    }
    if (activeExecutions.has(experimentId)) {
      res.status(409).json({ error: "Experiment execution is already running" });
      return;
    }

    const loaded = await loadExperiment(opportunityId, experimentId);
    if (!loaded) {
      res.status(404).json({ error: "Opportunity not found" });
      return;
    }
    if (!loaded.experiment) {
      res.status(404).json({ error: "Experiment not found for this opportunity" });
      return;
    }

    const existingExecution = parseStoredExperimentExecution(loaded.experiment.result);
    if (["COMPLETED", "FALSIFIED", "INCONCLUSIVE"].includes(loaded.experiment.status) && existingExecution) {
      res.status(200).json({
        opportunity_id: opportunityId,
        experiment_id: experimentId,
        reused_existing_execution: true,
        experiment_status: loaded.experiment.status,
        execution: existingExecution,
      });
      return;
    }
    if (loaded.experiment.status === "FAILED") {
      res.status(409).json({
        error: "Experiment previously failed and is not eligible for automatic retry.",
        retry_policy: "NO_AUTOMATIC_RETRY",
        stored_execution: existingExecution,
      });
      return;
    }
    if (loaded.experiment.status !== "PLANNED") {
      res.status(409).json({ error: `Experiment status ${loaded.experiment.status} is not executable.` });
      return;
    }
    if (loaded.opportunity.verdict !== "TEST") {
      res.status(409).json({
        error: "Experiment execution requires the opportunity to remain in TEST.",
        current_verdict: loaded.opportunity.verdict,
      });
      return;
    }

    const plan = storedPlan(loaded.experiment.result);
    if (!plan) {
      res.status(409).json({ error: "Experiment does not contain a schema-valid falsifying plan" });
      return;
    }
    const capability = experimentExecutionCapability({
      engineFamily: loaded.opportunity.engineFamily,
      experimentType: plan.experimentType,
    });
    if (!capability.automaticExecutionAllowed) {
      res.status(409).json({
        error: capability.reason,
        capability,
        experiment_status: loaded.experiment.status,
        no_side_effects_executed: true,
      });
      return;
    }

    const validationRunId = await latestCompletedValidationRunId(opportunityId);
    if (validationRunId == null) {
      res.status(409).json({
        error: "Experiment execution requires a completed validation evidence run so resulting observations can be fed back into underwriting.",
      });
      return;
    }

    activeExecutions.add(experimentId);
    const startedAt = new Date().toISOString();
    await db
      .update(experimentsTable)
      .set({ status: "RUNNING" })
      .where(eq(experimentsTable.id, experimentId));

    try {
      const executed = await executeRegisteredExperiment({
        experimentId,
        opportunityId,
        engineFamily: loaded.opportunity.engineFamily,
        sourcePlatform: loaded.opportunity.sourcePlatform,
        sourceUrl: loaded.opportunity.sourceUrl,
        opportunityType: loaded.opportunity.opportunityType,
        thesis: loaded.opportunity.thesis,
        plan,
      });
      const finishedAt = new Date().toISOString();
      const status = storedExecutionStatusFromOutcome(executed.result.outcome);
      const execution: StoredExperimentExecution = {
        schemaVersion: 1,
        plan,
        execution: {
          status,
          outcome: executed.result.outcome,
          summary: executed.result.summary,
          adapterKey: executed.adapterKey,
          startedAt,
          finishedAt,
          externalCostUsd: executed.result.externalCostUsd ?? 0,
          observations: executed.result.observations,
          metrics: executed.result.metrics ?? {},
          retryPolicy: "NO_AUTOMATIC_RETRY",
        },
      };

      if (executed.result.observations.length) {
        const observedDate = finishedAt.slice(0, 10);
        await db.insert(evidenceTable).values(
          executed.result.observations.map((observation) => ({
            opportunityId,
            claim: observation.claim,
            sourceUrl: `moneyscout://experiment/${experimentId}`,
            sourceTitle: `Money Scout ${plan.experimentType} experiment #${experimentId}`,
            observedDate,
            classification: observation.classification,
            evaluationDimension: `underwriting:${observation.factor}:${observation.direction}:${observation.evidenceKind}`,
            researchRunId: validationRunId,
          })),
        );
      }

      await db
        .update(experimentsTable)
        .set({ status, result: JSON.stringify(execution) })
        .where(eq(experimentsTable.id, experimentId));

      let validationReassessment: unknown = null;
      let validationReassessmentError: string | null = null;
      try {
        validationReassessment = await runValidationReassessment(req, opportunityId);
      } catch (error) {
        validationReassessmentError = error instanceof Error ? error.message : "Unknown validation reassessment failure";
        req.log.error({ err: error, opportunityId, experimentId }, "Validation reassessment after experiment failed");
      }

      res.status(200).json({
        opportunity_id: opportunityId,
        experiment_id: experimentId,
        reused_existing_execution: false,
        experiment_status: status,
        execution,
        evidence_rows_persisted: executed.result.observations.length,
        validation_run_id: validationRunId,
        validation_reassessment: validationReassessment,
        validation_reassessment_error: validationReassessmentError,
        retry_policy: "NO_AUTOMATIC_RETRY",
      });
    } catch (error) {
      const finishedAt = new Date().toISOString();
      const failed: StoredExperimentExecution = {
        schemaVersion: 1,
        plan,
        execution: {
          status: "FAILED",
          outcome: null,
          summary: error instanceof Error ? error.message.slice(0, 2_000) : "Unknown experiment execution failure",
          adapterKey: capability.adapterKey,
          startedAt,
          finishedAt,
          externalCostUsd: 0,
          observations: [],
          metrics: {},
          retryPolicy: "NO_AUTOMATIC_RETRY",
        },
      };
      await db
        .update(experimentsTable)
        .set({ status: "FAILED", result: JSON.stringify(failed) })
        .where(eq(experimentsTable.id, experimentId));
      req.log.error({ err: error, opportunityId, experimentId }, "Bounded experiment execution failed");
      res.status(502).json({
        error: "Bounded experiment execution failed. No automatic retry was attempted.",
        experiment_status: "FAILED",
        retry_policy: "NO_AUTOMATIC_RETRY",
      });
    } finally {
      activeExecutions.delete(experimentId);
    }
  },
);

export default router;
