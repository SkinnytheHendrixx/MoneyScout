import { readFile } from "node:fs/promises";
import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { pool } from "@workspace/db";
import { selectAnthropicProvider } from "../lib/anthropic-provider";
import { detectRuntimeCommit, runtimeFreshness } from "../lib/runtime-safety";
import { determineStartupReadiness } from "../lib/startup-readiness";

const router: IRouter = Router();
const startedAt = new Date().toISOString();

const normalizeSha = (value: unknown): string | null => {
  const sha = typeof value === "string" ? value.trim().toLowerCase() : "";
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
};

async function readRuntimeSupervisorState(): Promise<Record<string, unknown> | null> {
  const statePath = process.env.MONEY_SCOUT_RUNTIME_STATE_PATH?.trim();
  if (!statePath) return null;
  try {
    const parsed = JSON.parse(await readFile(statePath, "utf8"));
    return parsed && typeof parsed === "object" ? parsed as Record<string, unknown> : null;
  } catch {
    return null;
  }
}

function safeSupervisorState(state: Record<string, unknown> | null) {
  if (!state) {
    return {
      active: process.env.MONEY_SCOUT_SUPERVISOR_ACTIVE === "1",
      phase: "UNKNOWN",
      current_sha: null,
      desired_sha: null,
      root_synced_sha: null,
      previous_sha: null,
      last_check_at: null,
      last_successful_update_at: null,
      last_failure: null,
      ci: null,
    };
  }
  const lastFailure = state.lastFailure && typeof state.lastFailure === "object"
    ? state.lastFailure as Record<string, unknown>
    : null;
  const ci = state.ci && typeof state.ci === "object"
    ? state.ci as Record<string, unknown>
    : null;
  return {
    active: process.env.MONEY_SCOUT_SUPERVISOR_ACTIVE === "1",
    phase: typeof state.phase === "string" ? state.phase : "UNKNOWN",
    current_sha: normalizeSha(state.currentSha),
    desired_sha: normalizeSha(state.desiredSha),
    root_synced_sha: normalizeSha(state.rootSyncedSha),
    previous_sha: normalizeSha(state.previousSha),
    last_check_at: typeof state.lastCheckAt === "string" ? state.lastCheckAt : null,
    last_successful_update_at: typeof state.lastSuccessfulUpdateAt === "string" ? state.lastSuccessfulUpdateAt : null,
    last_failure: lastFailure
      ? {
          code: typeof lastFailure.code === "string" ? lastFailure.code : "UNKNOWN",
          sha: normalizeSha(lastFailure.sha),
          at: typeof lastFailure.at === "string" ? lastFailure.at : null,
        }
      : null,
    ci: ci
      ? {
          sha: normalizeSha(ci.sha),
          state: typeof ci.state === "string" ? ci.state : "UNKNOWN",
          reason: typeof ci.reason === "string" ? ci.reason : null,
          run_id: Number.isInteger(Number(ci.runId)) ? Number(ci.runId) : null,
        }
      : null,
  };
}

router.get("/healthz", (_req, res) => {
  const data = HealthCheckResponse.parse({ status: "ok" });
  res.json(data);
});

router.get("/health/runtime", async (_req, res): Promise<void> => {
  const databaseStartedAt = Date.now();
  let databaseReachable = false;
  let databaseLatencyMs: number | null = null;
  let databaseError: string | null = null;
  try {
    await pool.query("select 1 as ready");
    databaseReachable = true;
    databaseLatencyMs = Date.now() - databaseStartedAt;
  } catch (error) {
    databaseError = error instanceof Error ? error.message.slice(0, 300) : "Database check failed";
  }

  const freshness = runtimeFreshness();
  const commit = normalizeSha(detectRuntimeCommit());
  const expectedCommit = normalizeSha(process.env.MONEY_SCOUT_EXPECTED_COMMIT_SHA);
  const supervisor = safeSupervisorState(await readRuntimeSupervisorState());
  const ready = databaseReachable && freshness === "MATCH" && commit !== null && expectedCommit !== null;
  res.status(ready ? 200 : 503).json({
    status: ready ? "READY" : "BLOCKED",
    checked_at: new Date().toISOString(),
    runtime: {
      started_at: startedAt,
      commit,
      expected_commit: expectedCommit,
      freshness,
      preflight: process.env.MONEY_SCOUT_RUNTIME_PREFLIGHT === "1",
    },
    database: {
      reachable: databaseReachable,
      latency_ms: databaseLatencyMs,
      error: databaseError,
    },
    self_deployment: supervisor,
  });
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
