import { Router, type IRouter } from "express";
import {
  latestPortfolioHeartbeat,
  opportunityLifecycleSnapshot,
  runPortfolioReconciliation,
} from "../lib/portfolio-reconciler";

const router: IRouter = Router();

function activityProjection(runtime: NonNullable<Awaited<ReturnType<typeof opportunityLifecycleSnapshot>>>["runtime"]) {
  if (!runtime) return null;
  const now = Date.now();
  const startedAt = runtime.activityStartedAt?.getTime() ?? null;
  const expected = runtime.expectedDurationSeconds;
  const elapsedSeconds = startedAt == null ? null : Math.max(0, Math.floor((now - startedAt) / 1_000));
  const remainingSeconds =
    runtime.activityStatus === "RUNNING" &&
    elapsedSeconds != null &&
    expected != null
      ? Math.max(0, expected - elapsedSeconds)
      : null;
  const estimatedCompletionAt =
    remainingSeconds != null
      ? new Date(now + remainingSeconds * 1_000).toISOString()
      : null;
  return {
    key: runtime.currentActivityKey,
    label: runtime.currentActivityLabel,
    status: runtime.activityStatus,
    started_at: runtime.activityStartedAt?.toISOString() ?? null,
    expected_duration_seconds: expected,
    estimated_remaining_seconds: remainingSeconds,
    estimated_completion_at: estimatedCompletionAt,
    stage_index: runtime.stageIndex,
    stage_count: runtime.stageCount,
    next_action: runtime.nextAction,
    eta_basis: runtime.etaBasis,
    updated_at: runtime.updatedAt.toISOString(),
  };
}

router.get("/portfolio/heartbeat", async (_req, res): Promise<void> => {
  const latest = await latestPortfolioHeartbeat();
  res.status(200).json({
    latest_heartbeat: latest
      ? {
          ...latest,
          startedAt: latest.startedAt.toISOString(),
          finishedAt: latest.finishedAt?.toISOString() ?? null,
        }
      : null,
  });
});

router.post("/portfolio/reconcile", async (_req, res): Promise<void> => {
  const result = await runPortfolioReconciliation();
  res.status(result.status === "FAILED" ? 500 : 200).json(result);
});

router.get("/opportunities/:opportunityId/lifecycle", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const snapshot = await opportunityLifecycleSnapshot(opportunityId);
  if (!snapshot) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.status(200).json({
    opportunity_id: opportunityId,
    current_verdict: snapshot.opportunity.verdict,
    current_activity: activityProjection(snapshot.runtime),
    active_evaluation_cycle: snapshot.activeCycle,
    active_watch: snapshot.activeWatch,
    evaluation_cycles: snapshot.cycles,
    watch_history: snapshot.watches,
    lifecycle_events: snapshot.events,
  });
});

export default router;
