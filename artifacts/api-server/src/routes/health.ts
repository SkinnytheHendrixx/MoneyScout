import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { selectAnthropicProvider } from "../lib/anthropic-provider";
import { detectRuntimeCommit, runtimeFreshness } from "../lib/runtime-safety";
import { determineStartupReadiness } from "../lib/startup-readiness";

const router: IRouter = Router();
const startedAt = new Date().toISOString();

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health/provider", (_req, res) => {
  const provider = selectAnthropicProvider();
  const freshness = runtimeFreshness();
  res.json({
    status: provider.source === "UNAVAILABLE" ? "DEGRADED" : freshness === "STALE" ? "DEGRADED" : "READY",
    anthropic: {
      source: provider.source,
      configured: provider.apiKeyPresent,
      connectivity_verified: false,
      note:
        provider.source === "DIRECT"
          ? "Direct Anthropic API credentials are configured. This diagnostic does not make a billable API call."
          : provider.source === "REPLIT_MANAGED"
            ? "Replit-managed Anthropic credentials are configured, but account/provider approval is not verified by this zero-cost diagnostic."
            : "No Anthropic provider credentials are configured.",
    },
    runtime: {
      started_at: startedAt,
      commit: detectRuntimeCommit(),
      expected_commit: process.env.MONEY_SCOUT_EXPECTED_COMMIT_SHA?.trim() || null,
      freshness,
      paid_research_blocked: freshness === "STALE",
    },
  });
});

router.get("/health/readiness", async (_req, res): Promise<void> => {
  let databaseReachable = false;
  let databaseLatencyMs: number | null = null;
  let databaseError: string | null = null;
  const databaseStartedAt = Date.now();
  try {
    await pool.query("select 1 as ready");
    databaseReachable = true;
    databaseLatencyMs = Date.now() - databaseStartedAt;
  } catch (error) {
    databaseError = error instanceof Error ? error.message.slice(0, 300) : "Database check failed";
  }

  const provider = selectAnthropicProvider();
  const freshness = runtimeFreshness();
  const readiness = determineStartupReadiness({
    databaseReachable,
    anthropicProvider: provider.source,
    runtimeFreshness: freshness,
  });

  res.json({
    state: readiness.state,
    infrastructure_safe: readiness.infrastructureSafe,
    ai_provider_ready: readiness.aiProviderReady,
    provider_readiness: readiness.providerReadiness,
    live_research_ready: readiness.liveResearchReady,
    paid_research_safe: readiness.paidResearchSafe,
    checked_at: new Date().toISOString(),
    blockers: readiness.blockers,
    warnings: readiness.warnings,
    checks: {
      api: {
        status: "READY",
        started_at: startedAt,
      },
      database: {
        status: databaseReachable ? "READY" : "BLOCKED",
        reachable: databaseReachable,
        latency_ms: databaseLatencyMs,
        error: databaseError,
      },
      anthropic: {
        status: readiness.providerReadiness === "READY" ? "READY" : readiness.providerReadiness === "UNVERIFIED" ? "ATTENTION" : "BLOCKED",
        source: provider.source,
        configured: provider.apiKeyPresent,
        connectivity_verified: false,
        billable_call_performed: false,
        readiness: readiness.providerReadiness,
      },
      runtime: {
        status: freshness === "MATCH" ? "READY" : freshness === "STALE" ? "BLOCKED" : "ATTENTION",
        freshness,
        commit: detectRuntimeCommit(),
        expected_commit: process.env.MONEY_SCOUT_EXPECTED_COMMIT_SHA?.trim() || null,
      },
    },
  });
});

export default router;
