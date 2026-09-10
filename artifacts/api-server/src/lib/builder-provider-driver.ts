import { Codex } from "@openai/codex-sdk";
import type {
  BuilderTerminalOutcome,
  BuilderUsage,
  PersistedBuildContract,
} from "@workspace/db";

export type BuilderProviderRequest = {
  workingDirectory: string;
  buildContract: PersistedBuildContract;
  repairDefects: Array<Record<string, unknown>>;
  signal: AbortSignal;
};

export type BuilderProviderResult = {
  providerRunId: string;
  terminalOutcome: BuilderTerminalOutcome;
  summary: string;
  challenge: Record<string, unknown> | null;
  allowNoop: boolean;
  usage: BuilderUsage;
  actualExternalCashCostCents: number | null;
  costProvenance: string;
  entitlementConsumption: Record<string, unknown>;
};

export interface BuilderProviderDriver {
  readonly provider: string;
  readonly billing: {
    mode: "METERED" | "ENTITLEMENT" | "ZERO_COST_FIXTURE";
    enforceableMaximumIncrementalCostCents: number | null;
    enforcementMechanism: string | null;
    payAsYouGoFallbackPossible: boolean;
  };
  run(request: BuilderProviderRequest): Promise<BuilderProviderResult>;
}

const SAFE_ENVIRONMENT_KEYS = ["PATH", "TMPDIR", "LANG", "LC_ALL"] as const;

export function sanitizedBuilderEnvironment(
  source: NodeJS.ProcessEnv = process.env,
): Record<string, string> {
  const result: Record<string, string> = {};
  for (const key of SAFE_ENVIRONMENT_KEYS) {
    const value = source[key];
    if (value) result[key] = value;
  }
  return result;
}

export function configuredCodexBuilderDriver(): BuilderProviderDriver | null {
  const apiKey = process.env.MONEY_SCOUT_CODEX_API_KEY?.trim();
  if (!apiKey) return null;
  return createCodexBuilderDriver({
    apiKey,
    model: process.env.MONEY_SCOUT_CODEX_MODEL?.trim() || undefined,
  });
}

const OUTPUT_SCHEMA = {
  type: "object",
  additionalProperties: false,
  required: ["terminal_outcome", "summary", "allow_noop", "challenge"],
  properties: {
    terminal_outcome: {
      type: "string",
      enum: [
        "IMPLEMENTATION_READY",
        "ARCHITECTURE_CHALLENGE",
        "PRODUCT_CONTRACT_CHALLENGE",
        "DEPENDENCY_BLOCKED",
        "RESOURCE_BLOCKED",
        "PROVIDER_FAILURE",
        "CANCELLED",
      ],
    },
    summary: { type: "string" },
    allow_noop: { type: "boolean" },
    challenge: { type: ["object", "null"], additionalProperties: true },
  },
} as const;

export function createCodexBuilderDriver(config: {
  apiKey: string;
  model?: string;
}): BuilderProviderDriver {
  return {
    provider: "OPENAI_CODEX_SDK",
    billing: {
      mode: "METERED",
      enforceableMaximumIncrementalCostCents: null,
      enforcementMechanism: null,
      payAsYouGoFallbackPossible: true,
    },
    async run(request) {
      const codex = new Codex({
        apiKey: config.apiKey,
        env: sanitizedBuilderEnvironment(),
      });
      const thread = codex.startThread({
        workingDirectory: request.workingDirectory,
        sandboxMode: "workspace-write",
        networkAccessEnabled: false,
        webSearchMode: "disabled",
        approvalPolicy: "never",
        ...(config.model ? { model: config.model } : {}),
      });
      const prompt = [
        "Implement the frozen Money Scout Asset Build Contract in this repository.",
        "Read AGENTS.md, PRODUCT.md, ARCHITECTURE.md, BUILD_CONTRACT.md, OPERATIONS.md, and .money-scout/build-contract.json before editing.",
        "Do not rewrite frozen contract/manifests, broaden scope or authority, use production credentials, publish, charge, send outbound, advertise, buy a domain, or incur external spend.",
        "Normal implementation choices inside the explicit builder-discretion zone are yours. Run executable verification before reporting IMPLEMENTATION_READY.",
        "If new technical evidence invalidates major architecture, return ARCHITECTURE_CHALLENGE with affected REQ/component IDs, evidence, alternative, cost/maintenance/authority impact, and whether commercial scope is unchanged.",
        "If the Product Definition is contradictory or impossible, return PRODUCT_CONTRACT_CHALLENGE. Do not rewrite product scope.",
        request.repairDefects.length
          ? `This is a fresh repair attempt. Preserve the original frozen contract and repair only these exact independent-QA defects:\n${JSON.stringify(request.repairDefects, null, 2)}`
          : "This is a fresh build attempt; provider conversation history is not authoritative or available.",
        `Frozen contract fingerprint input:\n${JSON.stringify(request.buildContract)}`,
      ].join("\n\n");
      const started = Date.now();
      const turn = await thread.run(prompt, {
        outputSchema: OUTPUT_SCHEMA,
        signal: request.signal,
      });
      let parsed: {
        terminal_outcome: BuilderTerminalOutcome;
        summary: string;
        allow_noop: boolean;
        challenge: Record<string, unknown> | null;
      };
      try {
        parsed = JSON.parse(turn.finalResponse) as typeof parsed;
      } catch {
        throw new Error("CODEX_PROVIDER_INVALID_STRUCTURED_RESULT");
      }
      const allowed: BuilderTerminalOutcome[] = [
        "IMPLEMENTATION_READY",
        "ARCHITECTURE_CHALLENGE",
        "PRODUCT_CONTRACT_CHALLENGE",
        "DEPENDENCY_BLOCKED",
        "RESOURCE_BLOCKED",
        "PROVIDER_FAILURE",
        "CANCELLED",
      ];
      if (!allowed.includes(parsed.terminal_outcome))
        throw new Error("CODEX_PROVIDER_INVALID_TERMINAL_OUTCOME");
      return {
        providerRunId: thread.id ?? `codex-unreported-${started}`,
        terminalOutcome: parsed.terminal_outcome,
        summary: String(parsed.summary ?? "").slice(0, 4_000),
        challenge: parsed.challenge,
        allowNoop: parsed.allow_noop === true,
        usage: {
          model: config.model ?? null,
          inputTokens: turn.usage?.input_tokens ?? null,
          cachedInputTokens: turn.usage?.cached_input_tokens ?? null,
          outputTokens: turn.usage?.output_tokens ?? null,
          reasoningTokens: turn.usage?.reasoning_output_tokens ?? null,
          durationMs: Date.now() - started,
          entitlementUnits: null,
        },
        actualExternalCashCostCents: null,
        costProvenance:
          "PROVIDER_USAGE_OBSERVED_INCREMENTAL_CASH_COST_NOT_REPORTED",
        entitlementConsumption: {
          usage_observed: turn.usage != null,
          zero_incremental_cash_not_assumed: true,
        },
      };
    },
  };
}
