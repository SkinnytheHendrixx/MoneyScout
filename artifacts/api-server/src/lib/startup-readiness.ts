import type { AnthropicProviderSource } from "./anthropic-provider";
import type { RuntimeFreshness } from "./runtime-safety";

export type ReadinessState = "READY" | "ATTENTION" | "BLOCKED";
export type ProviderReadiness = "READY" | "UNVERIFIED" | "UNAVAILABLE";

export type StartupReadinessInput = {
  databaseReachable: boolean;
  anthropicProvider: AnthropicProviderSource;
  runtimeFreshness: RuntimeFreshness;
};

export type StartupReadiness = {
  state: ReadinessState;
  infrastructureSafe: boolean;
  aiProviderReady: boolean;
  providerReadiness: ProviderReadiness;
  liveResearchReady: boolean;
  /** Backward-compatible alias. A paid run is safe only when live research is ready. */
  paidResearchSafe: boolean;
  blockers: string[];
  warnings: string[];
};

export const determineStartupReadiness = (input: StartupReadinessInput): StartupReadiness => {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.databaseReachable) blockers.push("Database is not reachable.");
  if (input.runtimeFreshness === "STALE") blockers.push("Running API build does not match the expected commit.");
  if (input.runtimeFreshness === "UNKNOWN") {
    warnings.push("Runtime commit freshness cannot be verified because the expected or running commit is unavailable.");
  }

  const infrastructureSafe = input.databaseReachable && input.runtimeFreshness !== "STALE";

  let providerReadiness: ProviderReadiness;
  if (input.anthropicProvider === "DIRECT") {
    providerReadiness = "READY";
    warnings.push("Direct Anthropic credentials are configured, but connectivity and account balance are not verified by this zero-cost check.");
  } else if (input.anthropicProvider === "REPLIT_MANAGED") {
    providerReadiness = "UNVERIFIED";
    warnings.push("Replit-managed Anthropic credentials are present, but provider approval is not verified and cannot be assumed usable.");
  } else {
    providerReadiness = "UNAVAILABLE";
    blockers.push("No Anthropic provider is configured.");
  }

  const aiProviderReady = providerReadiness === "READY";
  const liveResearchReady = infrastructureSafe && aiProviderReady;
  const paidResearchSafe = liveResearchReady;

  const state: ReadinessState = blockers.length > 0
    ? "BLOCKED"
    : liveResearchReady && input.runtimeFreshness === "MATCH"
      ? "READY"
      : "ATTENTION";

  return {
    state,
    infrastructureSafe,
    aiProviderReady,
    providerReadiness,
    liveResearchReady,
    paidResearchSafe,
    blockers,
    warnings,
  };
};
