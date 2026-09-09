import type { AnthropicProviderSource } from "./anthropic-provider";
import type { RuntimeFreshness } from "./runtime-safety";

export type ReadinessState = "READY" | "ATTENTION" | "BLOCKED";

export type StartupReadinessInput = {
  databaseReachable: boolean;
  anthropicProvider: AnthropicProviderSource;
  runtimeFreshness: RuntimeFreshness;
};

export type StartupReadiness = {
  state: ReadinessState;
  paidResearchSafe: boolean;
  blockers: string[];
  warnings: string[];
};

export const determineStartupReadiness = (input: StartupReadinessInput): StartupReadiness => {
  const blockers: string[] = [];
  const warnings: string[] = [];

  if (!input.databaseReachable) blockers.push("Database is not reachable.");
  if (input.anthropicProvider === "UNAVAILABLE") blockers.push("No Anthropic provider is configured.");
  if (input.runtimeFreshness === "STALE") blockers.push("Running API build does not match the expected commit.");
  if (input.runtimeFreshness === "UNKNOWN") {
    warnings.push("Runtime commit freshness cannot be verified because the expected or running commit is unavailable.");
  }
  if (input.anthropicProvider === "REPLIT_MANAGED") {
    warnings.push("Replit-managed Anthropic credentials are configured, but provider approval cannot be verified without an external call.");
  }

  const paidResearchSafe = blockers.length === 0;
  return {
    state: blockers.length > 0 ? "BLOCKED" : warnings.length > 0 ? "ATTENTION" : "READY",
    paidResearchSafe,
    blockers,
    warnings,
  };
};
