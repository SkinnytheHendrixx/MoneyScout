import { desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  capabilitiesTable,
  db,
  humanActionsTable,
} from "@workspace/db";
import { internalAutomationHeaders } from "../lib/internal-automation-auth";
import {
  HUMAN_ACTION_NOTIFICATION_POLICY,
  markHumanActionResolved,
  markHumanActionVerifying,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
  type HumanActionResumeAction,
} from "../lib/human-gates";
import { recordLifecycleEvent, setOpportunityActivity } from "../lib/lifecycle-state";

const router: IRouter = Router();

function apiBaseUrl(): string {
  const rawPort = process.env.PORT;
  if (!rawPort) throw new Error("PORT is unavailable for autonomous resume dispatch");
  return `http://127.0.0.1:${Number(rawPort)}/api`;
}

function jsonPayload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function resumeResolvedAction(action: typeof humanActionsTable.$inferSelect): Promise<void> {
  const resumeAction = action.resumeAction as HumanActionResumeAction;
  if (resumeAction === "NO_AUTOMATIC_RESUME") return;

  const payload = jsonPayload(action.resumePayload);
  let method = "POST";
  let path: string | null = null;
  let body: string | undefined;

  switch (resumeAction) {
    case "RUN_RESEARCH":
      path = `/opportunities/${action.opportunityId}/research/advance`;
      break;
    case "RUN_VALIDATION":
      path = `/opportunities/${action.opportunityId}/validation/advance`;
      break;
    case "PLAN_EXPERIMENT":
      path = `/opportunities/${action.opportunityId}/experiments/plan`;
      break;
    case "EXECUTE_EXPERIMENT": {
      const experimentId = Number(payload.experiment_id);
      if (!Number.isInteger(experimentId) || experimentId <= 0) return;
      path = `/opportunities/${action.opportunityId}/experiments/${experimentId}/execute`;
      break;
    }
    case "RUN_RESOLUTION":
      path = `/opportunities/${action.opportunityId}/resolution/advance`;
      body = JSON.stringify({
        problem: payload.problem,
        unresolved_question: payload.unresolved_question,
      });
      break;
    case "RECHECK_MONETIZATION_PLAN":
      method = "GET";
      path = `/opportunities/${action.opportunityId}/monetization-plan`;
      break;
  }

  if (!path) return;
  await recordLifecycleEvent({
    opportunityId: action.opportunityId,
    evaluationCycleId: action.evaluationCycleId,
    eventType: "HUMAN_ACTION_RESUME_DISPATCHED",
    summary: `Human action ${action.id} resolved; dispatching ${resumeAction}.`,
    metadata: { human_action_id: action.id, resume_action: resumeAction },
  });

  void fetch(`${apiBaseUrl()}${path}`, {
    method,
    headers: {
      ...internalAutomationHeaders(),
      ...(body ? { "content-type": "application/json" } : {}),
    },
    body,
    signal: AbortSignal.timeout(360_000),
  })
    .then(async (response) => {
      if (response.ok || response.status === 409) return;
      const text = await response.text().catch(() => "");
      await setOpportunityActivity(action.opportunityId, {
        activeEvaluationCycleId: action.evaluationCycleId,
        currentActivityKey: "RESUME_DISPATCH_FAILED",
        currentActivityLabel: "Human bottleneck cleared; automatic resume needs recovery",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: `Automatic resume ${resumeAction} returned HTTP ${response.status}. Portfolio recovery should retry only after classifying the failure.`,
        etaBasis: "RECOVERY_REQUIRED",
      });
      await recordLifecycleEvent({
        opportunityId: action.opportunityId,
        evaluationCycleId: action.evaluationCycleId,
        eventType: "HUMAN_ACTION_RESUME_FAILED",
        summary: `Automatic resume ${resumeAction} returned HTTP ${response.status}.`,
        metadata: { human_action_id: action.id, response: text.slice(0, 500) },
      });
    })
    .catch(async (error) => {
      await setOpportunityActivity(action.opportunityId, {
        activeEvaluationCycleId: action.evaluationCycleId,
        currentActivityKey: "RESUME_DISPATCH_FAILED",
        currentActivityLabel: "Human bottleneck cleared; automatic resume needs recovery",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: "Automatic resume failed at the transport layer. Preserve the resolved human action and recover from durable lifecycle state.",
        etaBasis: "RECOVERY_REQUIRED",
      });
      await recordLifecycleEvent({
        opportunityId: action.opportunityId,
        evaluationCycleId: action.evaluationCycleId,
        eventType: "HUMAN_ACTION_RESUME_FAILED",
        summary: error instanceof Error ? error.message.slice(0, 1_000) : "Unknown resume dispatch failure",
        metadata: { human_action_id: action.id, resume_action: resumeAction },
      });
    });
}

router.get("/human-actions", async (req, res): Promise<void> => {
  const requested = typeof req.query.status === "string" ? req.query.status.toUpperCase() : "OPEN";
  const statuses = requested === "ACTIVE" ? ["OPEN", "VERIFYING"] : [requested];
  const allowed = new Set(["OPEN", "VERIFYING", "RESOLVED", "CANCELLED"]);
  if (!statuses.every((status) => allowed.has(status))) {
    res.status(400).json({ error: "Invalid human action status" });
    return;
  }
  const rows = await db
    .select()
    .from(humanActionsTable)
    .where(inArray(humanActionsTable.status, statuses as Array<"OPEN" | "VERIFYING" | "RESOLVED" | "CANCELLED">))
    .orderBy(desc(humanActionsTable.createdAt));
  res.json({
    actions: rows.map((action) => ({
      ...action,
      notification_policy: HUMAN_ACTION_NOTIFICATION_POLICY[action.urgency],
    })),
  });
});

router.get("/opportunities/:opportunityId/human-actions", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const rows = await db
    .select()
    .from(humanActionsTable)
    .where(eq(humanActionsTable.opportunityId, opportunityId))
    .orderBy(desc(humanActionsTable.createdAt));
  res.json({
    opportunity_id: opportunityId,
    actions: rows.map((action) => ({
      ...action,
      notification_policy: HUMAN_ACTION_NOTIFICATION_POLICY[action.urgency],
    })),
  });
});

router.get("/capabilities", async (_req, res): Promise<void> => {
  const capabilities = await db.select().from(capabilitiesTable).orderBy(capabilitiesTable.key);
  res.json({ capabilities });
});

router.post("/human-actions/:actionId/resolve", async (req, res): Promise<void> => {
  const actionId = Number(req.params.actionId);
  if (!Number.isInteger(actionId) || actionId <= 0) {
    res.status(400).json({ error: "Invalid human action id" });
    return;
  }
  const [action] = await db
    .select()
    .from(humanActionsTable)
    .where(eq(humanActionsTable.id, actionId));
  if (!action) {
    res.status(404).json({ error: "Human action not found" });
    return;
  }
  if (action.status === "RESOLVED") {
    res.json({ action, reused_resolution: true });
    return;
  }
  if (action.status === "CANCELLED") {
    res.status(409).json({ error: "Cancelled human action cannot be resolved" });
    return;
  }

  await markHumanActionVerifying(action.id);
  if (action.verificationMode === "AUTOMATED_CHECK") {
    res.status(409).json({
      error: "This action requires its provider-specific automated verifier. Human attestation cannot bypass that verification contract.",
      action_status: "VERIFYING",
    });
    return;
  }
  if (action.verificationMode === "EXTERNAL_CALLBACK") {
    res.status(409).json({
      error: "This action is waiting for an external callback. Manual completion cannot bypass that callback contract.",
      action_status: "VERIFYING",
    });
    return;
  }
  if (req.body?.attested !== true) {
    res.status(400).json({ error: "Human-attested actions require attested: true" });
    return;
  }

  const resolutionData = jsonPayload(req.body?.resolution_data);
  if (action.requiredCapabilityKey) {
    await setCapabilityAvailable({
      key: action.requiredCapabilityKey,
      provider: action.requiredCapabilityProvider ?? String(req.body?.provider ?? "UNKNOWN"),
      accessLevel: typeof req.body?.access_level === "string" ? req.body.access_level : "AUTHENTICATED",
      verificationMethod: "HUMAN_ATTESTATION",
      metadata: resolutionData,
    });
  }
  const resolved = await markHumanActionResolved({
    actionId: action.id,
    resolutionData: { ...resolutionData, attested: true },
  });
  if (!resolved) {
    res.status(404).json({ error: "Human action disappeared during resolution" });
    return;
  }
  await resumeResolvedAction(resolved);
  res.json({
    action: resolved,
    reused_resolution: false,
    capability_unlocked: resolved.requiredCapabilityKey,
    automatic_resume_dispatched: resolved.resumeAction !== "NO_AUTOMATIC_RESUME",
  });
});

router.post("/capabilities/:capabilityKey/confirm", async (req, res): Promise<void> => {
  const capabilityKey = String(req.params.capabilityKey ?? "").trim();
  if (!capabilityKey || req.body?.attested !== true || typeof req.body?.provider !== "string") {
    res.status(400).json({ error: "capability key, provider, and attested: true are required" });
    return;
  }
  const metadata = jsonPayload(req.body?.metadata);
  const capability = await setCapabilityAvailable({
    key: capabilityKey,
    provider: req.body.provider,
    accessLevel: typeof req.body?.access_level === "string" ? req.body.access_level : "AUTHENTICATED",
    verificationMethod: "HUMAN_ATTESTATION",
    metadata,
  });
  const resolvedActions = await resolveOpenActionsForCapability({
    capabilityKey,
    resolutionData: { ...metadata, attested: true },
  });
  for (const action of resolvedActions) await resumeResolvedAction(action);
  res.json({
    capability,
    resolved_human_action_ids: resolvedActions.map((action) => action.id),
    automatic_resumes_dispatched: resolvedActions.length,
  });
});

export default router;
