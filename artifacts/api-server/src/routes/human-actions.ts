import { desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  capabilitiesTable,
  db,
  humanActionsTable,
} from "@workspace/db";
import {
  enqueueExecutionJob,
  executionIdempotencyKey,
  type ExecutionAction,
} from "../lib/execution-kernel";
import {
  HUMAN_ACTION_NOTIFICATION_POLICY,
  markHumanActionResolved,
  markHumanActionVerifying,
  resolveOpenActionsForCapability,
  setCapabilityAvailable,
  type HumanActionResumeAction,
} from "../lib/human-gates";
import {
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
  startNewEvaluationCycle,
} from "../lib/lifecycle-state";
import { isVerifiedMoneyScoutOwnerRequest } from "../middlewares/authorizationMiddleware";

const router: IRouter = Router();

const isCapitalAllocationCapabilityKey = (key: string): boolean =>
  key === "CAPITAL_ALLOCATION_AUTHORITY" ||
  key.startsWith("CAPITAL_ALLOCATION_AUTHORITY:BET:");

function jsonPayload(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as Record<string, unknown>
    : {};
}

async function ensureCapabilityUnlockCycle(
  action: typeof humanActionsTable.$inferSelect,
  resumeAction: HumanActionResumeAction,
): Promise<number | null> {
  if (!action.requiredCapabilityKey || (resumeAction !== "RUN_RESEARCH" && resumeAction !== "RUN_VALIDATION")) {
    return action.evaluationCycleId;
  }

  const current = await getActiveEvaluationCycle(action.opportunityId);
  const metadata = current?.triggerMetadata as Record<string, unknown> | undefined;
  if (
    current?.triggerType === "HUMAN_CAPABILITY_UNLOCKED" &&
    metadata?.capability_key === action.requiredCapabilityKey
  ) {
    return current.id;
  }

  const cycle = await startNewEvaluationCycle({
    opportunityId: action.opportunityId,
    triggerType: "HUMAN_CAPABILITY_UNLOCKED",
    triggerReason: `Human-only access bottleneck was resolved and ${action.requiredCapabilityKey} became available to Money Scout.`,
    triggerMetadata: {
      human_action_id: action.id,
      capability_key: action.requiredCapabilityKey,
      provider: action.requiredCapabilityProvider,
      prior_resume_action: resumeAction,
    },
  });
  return cycle.id;
}

type ExecutableHumanResumeAction = Extract<HumanActionResumeAction, ExecutionAction>;

const isExecutionResumeAction = (
  value: HumanActionResumeAction,
): value is ExecutableHumanResumeAction =>
  value === "RUN_RESEARCH" ||
  value === "RUN_VALIDATION" ||
  value === "PLAN_EXPERIMENT" ||
  value === "EXECUTE_EXPERIMENT" ||
  value === "RUN_RESOLUTION" ||
  value === "RECHECK_MONETIZATION_PLAN";

async function resumeResolvedAction(action: typeof humanActionsTable.$inferSelect): Promise<{
  queued: boolean;
  executionJobId: number | null;
  effectiveResumeAction: HumanActionResumeAction;
}> {
  let resumeAction = action.resumeAction as HumanActionResumeAction;
  if (resumeAction === "NO_AUTOMATIC_RESUME") {
    return { queued: false, executionJobId: null, effectiveResumeAction: resumeAction };
  }

  const payload = jsonPayload(action.resumePayload);
  const cycleId = await ensureCapabilityUnlockCycle(action, resumeAction);

  // Authenticated access changes the evidence condition. If the old workflow was
  // blocked in Validation, reopen Research in a fresh cycle first rather than
  // combining old Research evidence with newly accessible authenticated data.
  if (action.requiredCapabilityKey && resumeAction === "RUN_VALIDATION") {
    resumeAction = "RUN_RESEARCH";
  }

  if (!isExecutionResumeAction(resumeAction)) {
    return { queued: false, executionJobId: null, effectiveResumeAction: resumeAction };
  }

  // Persist the effective resume contract so restart recovery reconstructs the
  // exact same successor instead of re-enqueuing the pre-normalized action.
  if (cycleId !== action.evaluationCycleId || resumeAction !== action.resumeAction) {
    await db
      .update(humanActionsTable)
      .set({
        evaluationCycleId: cycleId,
        resumeAction,
        updatedAt: new Date(),
      })
      .where(eq(humanActionsTable.id, action.id));
  }

  const queued = await enqueueExecutionJob({
    opportunityId: action.opportunityId,
    evaluationCycleId: cycleId,
    action: resumeAction,
    payload,
    idempotencyKey: executionIdempotencyKey({
      opportunityId: action.opportunityId,
      evaluationCycleId: cycleId,
      action: resumeAction,
      discriminator: `human-action-${action.id}`,
    }),
    priority: 90,
  });

  await setOpportunityActivity(action.opportunityId, {
    activeEvaluationCycleId: cycleId,
    currentActivityKey: "HUMAN_ACTION_RESUME_QUEUED",
    currentActivityLabel: "Human bottleneck cleared; automation queued to resume",
    activityStatus: "WAITING",
    activityStartedAt: new Date(),
    expectedDurationSeconds: null,
    nextAction: resumeAction.replaceAll("_", " "),
    etaBasis: "DURABLE_EXECUTION_QUEUE",
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: action.opportunityId,
    evaluationCycleId: cycleId,
    eventType: "HUMAN_ACTION_RESUME_QUEUED",
    summary: `Human action ${action.id} resolved; ${resumeAction} is durably queued.`,
    metadata: {
      human_action_id: action.id,
      configured_resume_action: action.resumeAction,
      effective_resume_action: resumeAction,
      capability_key: action.requiredCapabilityKey,
      execution_job_id: queued.job.id,
      reused_execution_job: queued.reused,
    },
  });

  return {
    queued: true,
    executionJobId: queued.job.id,
    effectiveResumeAction: resumeAction,
  };
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
    const resume = await resumeResolvedAction(action);
    res.json({ action, reused_resolution: true, ...resume });
    return;
  }
  if (action.status === "CANCELLED") {
    res.status(409).json({ error: "Cancelled human action cannot be resolved" });
    return;
  }
  if (
    action.actionType === "AUTHORIZE_BET_CAPITAL_ALLOCATION" &&
    !isVerifiedMoneyScoutOwnerRequest(req)
  ) {
    res.status(403).json({
      error:
        "Bet capital authority requires explicit attestation from an authenticated, allowlisted owner. Internal automation cannot attest this action.",
    });
    return;
  }

  if (action.verificationMode === "AUTOMATED_CHECK") {
    await markHumanActionVerifying(action.id);
    res.status(409).json({
      error: "This action requires its provider-specific automated verifier. Human attestation cannot bypass that verification contract.",
      action_status: "VERIFYING",
    });
    return;
  }
  if (action.verificationMode === "EXTERNAL_CALLBACK") {
    await markHumanActionVerifying(action.id);
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
  if (action.requiredCapabilityKey && req.body?.access_ready_for_money_scout !== true) {
    res.status(409).json({
      error: "Creating an account alone does not resolve this bottleneck. Confirm access_ready_for_money_scout: true only after Money Scout has usable authorized access (for example OAuth, API, or another supported integration). Do not place passwords or raw secrets in this request.",
      action_status: action.status,
    });
    return;
  }

  await markHumanActionVerifying(action.id);
  const resolutionData = jsonPayload(req.body?.resolution_data);
  const attestingOwnerUserId =
    action.actionType === "AUTHORIZE_BET_CAPITAL_ALLOCATION"
      ? req.user!.id
      : null;
  if (action.requiredCapabilityKey) {
    await setCapabilityAvailable({
      key: action.requiredCapabilityKey,
      provider: action.requiredCapabilityProvider ?? String(req.body?.provider ?? "UNKNOWN"),
      accessLevel: "AUTOMATION_READY",
      verificationMethod: "HUMAN_ATTESTATION_OF_CONNECTED_ACCESS",
      metadata: {
        ...resolutionData,
        access_ready_for_money_scout: true,
        ...(attestingOwnerUserId
          ? { attested_by_user_id: attestingOwnerUserId }
          : {}),
      },
    });
  }
  const resolved = await markHumanActionResolved({
    actionId: action.id,
    resolutionData: {
      ...resolutionData,
      attested: true,
      ...(attestingOwnerUserId
        ? { attested_by_user_id: attestingOwnerUserId }
        : {}),
      ...(action.requiredCapabilityKey ? { access_ready_for_money_scout: true } : {}),
    },
  });
  if (!resolved) {
    res.status(404).json({ error: "Human action disappeared during resolution" });
    return;
  }
  const resume = await resumeResolvedAction(resolved);
  res.json({
    action: resolved,
    reused_resolution: false,
    capability_unlocked: resolved.requiredCapabilityKey,
    automatic_resume_queued: resume.queued,
    execution_job_id: resume.executionJobId,
    effective_resume_action: resume.effectiveResumeAction,
  });
});

router.post("/capabilities/:capabilityKey/confirm", async (req, res): Promise<void> => {
  const capabilityKey = String(req.params.capabilityKey ?? "").trim();
  if (
    isCapitalAllocationCapabilityKey(capabilityKey) &&
    !isVerifiedMoneyScoutOwnerRequest(req)
  ) {
    res.status(403).json({
      error:
        "Capital allocation authority requires explicit attestation from an authenticated, allowlisted owner. Internal automation cannot grant it.",
    });
    return;
  }
  if (
    !capabilityKey ||
    req.body?.attested !== true ||
    req.body?.access_ready_for_money_scout !== true ||
    typeof req.body?.provider !== "string"
  ) {
    res.status(400).json({
      error: "capability key, provider, attested: true, and access_ready_for_money_scout: true are required. Account existence alone is not an automation-ready capability.",
    });
    return;
  }
  const metadata = jsonPayload(req.body?.metadata);
  const capability = await setCapabilityAvailable({
    key: capabilityKey,
    provider: req.body.provider,
    accessLevel: "AUTOMATION_READY",
    verificationMethod: "HUMAN_ATTESTATION_OF_CONNECTED_ACCESS",
    metadata: {
      ...metadata,
      access_ready_for_money_scout: true,
      ...(isCapitalAllocationCapabilityKey(capabilityKey)
        ? { attested_by_user_id: req.user!.id }
        : {}),
    },
  });
  const resolvedActions = await resolveOpenActionsForCapability({
    capabilityKey,
    resolutionData: { ...metadata, attested: true, access_ready_for_money_scout: true },
  });
  const resumes = [];
  for (const action of resolvedActions) resumes.push(await resumeResolvedAction(action));
  res.json({
    capability,
    resolved_human_action_ids: resolvedActions.map((action) => action.id),
    automatic_resumes_queued: resumes.filter((item) => item.queued).length,
    execution_job_ids: resumes.flatMap((item) => item.executionJobId == null ? [] : [item.executionJobId]),
  });
});

export default router;
