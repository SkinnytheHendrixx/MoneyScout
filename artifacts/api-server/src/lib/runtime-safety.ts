export type RuntimeFreshness = "MATCH" | "STALE" | "UNKNOWN";
export type OpportunityRecordMode = "LIVE" | "PILOT" | "SIMULATION" | "TEST";

const nonempty = (value: string | undefined): string | null => {
  const trimmed = value?.trim();
  return trimmed ? trimmed : null;
};

export const detectRuntimeCommit = (env: NodeJS.ProcessEnv = process.env): string | null =>
  nonempty(env.MONEY_SCOUT_BUILD_SHA) ??
  nonempty(env.REPLIT_GIT_COMMIT) ??
  nonempty(env.GIT_COMMIT_SHA) ??
  nonempty(env.COMMIT_SHA);

export const runtimeFreshness = (env: NodeJS.ProcessEnv = process.env): RuntimeFreshness => {
  const expected = nonempty(env.MONEY_SCOUT_EXPECTED_COMMIT_SHA);
  const actual = detectRuntimeCommit(env);
  if (!expected || !actual) return "UNKNOWN";
  return actual === expected || actual.startsWith(expected) || expected.startsWith(actual)
    ? "MATCH"
    : "STALE";
};

export const classifyOpportunityRecordMode = (name: string): OpportunityRecordMode => {
  const normalized = name.trim().toUpperCase();
  if (normalized.startsWith("[SIMULATION]")) return "SIMULATION";
  if (normalized.startsWith("[PILOT]")) return "PILOT";
  if (normalized.startsWith("[TEST]")) return "TEST";
  return "LIVE";
};

export const requiresExplicitPilotSpendApproval = (name: string): boolean =>
  classifyOpportunityRecordMode(name) !== "LIVE";

const explicitTrue = (headerValue: string | undefined): boolean =>
  headerValue?.trim().toLowerCase() === "true";

export const pilotSpendApproved = (headerValue: string | undefined): boolean =>
  explicitTrue(headerValue);

export const unverifiedProviderSpendApproved = (headerValue: string | undefined): boolean =>
  explicitTrue(headerValue);
