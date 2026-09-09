import { Router, type IRouter } from "express";
import { HealthCheckResponse } from "@workspace/api-zod";
import { selectAnthropicProvider } from "../lib/anthropic-provider";
import { detectRuntimeCommit, runtimeFreshness } from "../lib/runtime-safety";

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

export default router;
