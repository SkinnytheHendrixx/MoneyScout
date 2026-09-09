import { inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  humanActionsTable,
  opportunitiesTable,
  opportunityRuntimeStateTable,
  watchRegistrationsTable,
} from "@workspace/db";
import {
  latestPortfolioHeartbeat,
  opportunityLifecycleSnapshot,
  runPortfolioReconciliation,
} from "../lib/portfolio-reconciler";

const router: IRouter = Router();

type OpportunityRuntimeState = typeof opportunityRuntimeStateTable.$inferSelect;

function activityProjection(runtime: OpportunityRuntimeState | null) {
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

function operatorState(input: {
  verdict: string;
  activityStatus: string | null;
  activityKey: string | null;
  openHumanActions: number;
  activeWatch: boolean;
}): "RUNNING" | "QUEUED" | "WATCHING" | "HUMAN_BLOCKED" | "RECOVERING" | "COMPLETE" | "IDLE" {
  const key = input.activityKey ?? "";
  if (input.openHumanActions > 0 || (input.activityStatus === "BLOCKED" && key.startsWith("HUMAN_"))) return "HUMAN_BLOCKED";
  if (input.activeWatch || input.verdict === "WATCH" || key.includes("WATCH")) return "WATCHING";
  if (key.includes("RECOVER") || key.includes("INTERRUPT") || key.includes("RESUME_DISPATCH_FAILED")) return "RECOVERING";
  if (input.activityStatus === "RUNNING") return "RUNNING";
  if (input.activityStatus === "WAITING" || key.includes("QUEUED") || key.includes("PENDING")) return "QUEUED";
  if (input.activityStatus === "COMPLETE" || input.verdict === "KILL") return "COMPLETE";
  return "IDLE";
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

router.get("/portfolio/control-center", async (_req, res): Promise<void> => {
  const [opportunities, runtimes, humanActions, watches] = await Promise.all([
    db.select().from(opportunitiesTable).orderBy(opportunitiesTable.id),
    db.select().from(opportunityRuntimeStateTable).orderBy(opportunityRuntimeStateTable.opportunityId),
    db.select().from(humanActionsTable)
      .where(inArray(humanActionsTable.status, ["OPEN", "VERIFYING"]))
      .orderBy(humanActionsTable.id),
    db.select().from(watchRegistrationsTable).orderBy(watchRegistrationsTable.id),
  ]);

  const runtimeByOpportunity = new Map(runtimes.map((runtime) => [runtime.opportunityId, runtime]));
  const humanActionCounts = new Map<number, number>();
  for (const action of humanActions) {
    humanActionCounts.set(action.opportunityId, (humanActionCounts.get(action.opportunityId) ?? 0) + 1);
  }
  const activeWatchIds = new Set(
    watches.filter((watch) => watch.status === "ACTIVE").map((watch) => watch.opportunityId),
  );

  const items = opportunities.map((opportunity) => {
    const runtime = runtimeByOpportunity.get(opportunity.id) ?? null;
    const openHumanActions = humanActionCounts.get(opportunity.id) ?? 0;
    const state = operatorState({
      verdict: opportunity.verdict,
      activityStatus: runtime?.activityStatus ?? null,
      activityKey: runtime?.currentActivityKey ?? null,
      openHumanActions,
      activeWatch: activeWatchIds.has(opportunity.id),
    });
    return {
      opportunity_id: opportunity.id,
      name: opportunity.name,
      verdict: opportunity.verdict,
      operator_state: state,
      current_activity: activityProjection(runtime),
      open_human_action_count: openHumanActions,
    };
  });

  const counts = {
    RUNNING: 0,
    QUEUED: 0,
    WATCHING: 0,
    HUMAN_BLOCKED: 0,
    RECOVERING: 0,
    COMPLETE: 0,
    IDLE: 0,
  };
  for (const item of items) counts[item.operator_state] += 1;

  res.status(200).json({
    generated_at: new Date().toISOString(),
    counts,
    items,
    note: "This is a read-only projection of persisted lifecycle/runtime state. It performs no external calls and does not advance workflows.",
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
