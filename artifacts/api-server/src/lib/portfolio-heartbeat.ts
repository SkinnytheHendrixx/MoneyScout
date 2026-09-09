import { eq } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import { selectAnthropicProvider } from "./anthropic-provider";
import { reconcileExhaustedHumanActions } from "./human-action-reconciler";
import { internalAutomationHeaders } from "./internal-automation-auth";
import { logger } from "./logger";
import {
  PORTFOLIO_HEARTBEAT_INTERVAL_MS,
  runPortfolioReconciliation,
} from "./portfolio-reconciler";
import {
  classifyOpportunityRecordMode,
  runtimeFreshness,
} from "./runtime-safety";
import { paidProviderPreflightAllows } from "./startup-readiness";
import { setOpportunityActivity } from "./lifecycle-state";

let heartbeatTimer: NodeJS.Timeout | null = null;
let heartbeatRunning = false;

function resolvedIntervalMs(): number {
  const configured = Number(process.env.MONEY_SCOUT_PORTFOLIO_HEARTBEAT_MS ?? "");
  if (Number.isFinite(configured) && configured >= 60_000) return configured;
  return PORTFOLIO_HEARTBEAT_INTERVAL_MS;
}

async function providerAllowsAutonomousResearch(): Promise<{
  allowed: boolean;
  reason: string | null;
}> {
  if (runtimeFreshness() === "STALE") {
    return { allowed: false, reason: "Running runtime is stale; paid research remains blocked." };
  }
  const provider = selectAnthropicProvider();
  if (!paidProviderPreflightAllows(provider.source, false)) {
    return {
      allowed: false,
      reason: provider.source === "UNAVAILABLE"
        ? "AI provider is unavailable; WATCH reactivation is preserved in the research queue."
        : "AI provider is unverified; WATCH reactivation is preserved until provider readiness is verified.",
    };
  }
  return { allowed: true, reason: null };
}

async function dispatchQueuedResearch(port: number, opportunityIds: number[]): Promise<void> {
  if (!opportunityIds.length) return;
  const provider = await providerAllowsAutonomousResearch();
  for (const opportunityId of opportunityIds) {
    const [opportunity] = await db
      .select({ name: opportunitiesTable.name, verdict: opportunitiesTable.verdict })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, opportunityId));
    if (!opportunity || opportunity.verdict !== "RESEARCH") continue;
    if (classifyOpportunityRecordMode(opportunity.name) !== "LIVE") {
      await setOpportunityActivity(opportunityId, {
        currentActivityKey: "RESEARCH_QUEUED",
        currentActivityLabel: "Research queued, explicit pilot approval required",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: "Non-live records never receive autonomous paid research without explicit pilot approval.",
        etaBasis: "APPROVAL_REQUIRED",
      });
      continue;
    }
    if (!provider.allowed) {
      await setOpportunityActivity(opportunityId, {
        currentActivityKey: "RESEARCH_BLOCKED_PROVIDER",
        currentActivityLabel: "Research queued, waiting for AI provider",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        stageIndex: 0,
        stageCount: 3,
        nextAction: provider.reason,
        etaBasis: "PROVIDER_READINESS_DEPENDENT",
      });
      continue;
    }

    try {
      const response = await fetch(
        `http://127.0.0.1:${port}/api/opportunities/${opportunityId}/research/advance`,
        {
          method: "POST",
          headers: internalAutomationHeaders(),
          signal: AbortSignal.timeout(360_000),
        },
      );
      if (!response.ok && response.status !== 409) {
        const body = await response.text().catch(() => "");
        logger.error(
          { opportunityId, status: response.status, body: body.slice(0, 500) },
          "Portfolio heartbeat research dispatch returned a non-success response",
        );
      }
    } catch (error) {
      logger.error({ err: error, opportunityId }, "Portfolio heartbeat research dispatch failed");
    }
  }
}

export async function runPortfolioHeartbeatTick(port: number): Promise<void> {
  if (heartbeatRunning) return;
  heartbeatRunning = true;
  try {
    const result = await runPortfolioReconciliation();
    const humanActions = await reconcileExhaustedHumanActions();
    await dispatchQueuedResearch(port, result.queuedResearchOpportunityIds);
    logger.info(
      {
        heartbeatRunId: result.heartbeatRunId,
        status: result.status,
        scanned: result.scannedOpportunityCount,
        watchesChecked: result.watchesCheckedCount,
        reactivated: result.reactivatedOpportunityCount,
        researchQueue: result.queuedResearchOpportunityIds.length,
        humanActionScanned: humanActions.scanned,
        humanActionsCreated: humanActions.created,
        humanActionsReused: humanActions.reused,
        humanGatesSuppressedForAvailableCapability: humanActions.suppressedBecauseCapabilityAvailable,
      },
      "Portfolio heartbeat complete",
    );
  } catch (error) {
    logger.error({ err: error }, "Portfolio heartbeat failed");
  } finally {
    heartbeatRunning = false;
  }
}

export function startPortfolioHeartbeat(port: number): void {
  if (heartbeatTimer || process.env.NODE_ENV === "test") return;
  void runPortfolioHeartbeatTick(port);
  heartbeatTimer = setInterval(() => {
    void runPortfolioHeartbeatTick(port);
  }, resolvedIntervalMs());
  heartbeatTimer.unref();
}

export function stopPortfolioHeartbeatForTests(): void {
  if (heartbeatTimer) clearInterval(heartbeatTimer);
  heartbeatTimer = null;
  heartbeatRunning = false;
}
