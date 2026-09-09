import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import type { DedicatedKillRiskInputs, TriState } from "./kill-risk-workers";

export const KILL_RISK_MAX_EXTERNAL_COST_USD = 0.5;
export const KILL_RISK_MAX_SEARCH_USES = 4;
const MAX_OUTPUT_TOKENS = 3_000;
const PROJECTED_MAX_INPUT_TOKENS = 190_000;
const INPUT_COST_PER_TOKEN = 0.000002;
const OUTPUT_COST_PER_TOKEN = 0.00001;
const SEARCH_COST_PER_USE = 0.01;

export type KillRiskFinding = {
  ref: string;
  claim: string;
  source_url: string;
  source_title: string;
  classification: "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";
  evaluation_dimension:
    | "platform_owner_threat"
    | "maintenance_dependency_risk"
    | "distribution_economics"
    | "network_effect_lock_in";
};

export type KillRiskCollectorOutput = {
  inputs: DedicatedKillRiskInputs;
  findings: KillRiskFinding[];
  externalCostUsd: number;
  searchCount: number;
  inputTokens: number;
  outputTokens: number;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["platform_owner", "maintenance", "distribution", "network_effects", "findings"],
  properties: {
    platform_owner: {
      type: "object",
      additionalProperties: false,
      required: ["owner_already_competes", "owner_distribution_advantage", "owner_absorption_signal"],
      properties: {
        owner_already_competes: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        owner_distribution_advantage: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        owner_absorption_signal: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
      },
    },
    maintenance: {
      type: "object",
      additionalProperties: false,
      required: ["dependency_volatile", "repeated_breakage_observed", "maintenance_burden_disproportionate"],
      properties: {
        dependency_volatile: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        repeated_breakage_observed: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        maintenance_burden_disproportionate: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
      },
    },
    distribution: {
      type: "object",
      additionalProperties: false,
      required: ["target_buyer_reachable", "viable_acquisition_channel_exists", "acquisition_economics_plausible"],
      properties: {
        target_buyer_reachable: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        viable_acquisition_channel_exists: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        acquisition_economics_plausible: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
      },
    },
    network_effects: {
      type: "object",
      additionalProperties: false,
      required: ["switching_costs_high", "data_or_workflow_portable", "multihoming_practical"],
      properties: {
        switching_costs_high: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        data_or_workflow_portable: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
        multihoming_practical: { type: "string", enum: ["YES", "NO", "UNKNOWN"] },
      },
    },
    findings: {
      type: "array",
      maxItems: 40,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["ref", "claim", "source_url", "source_title", "classification", "evaluation_dimension"],
        properties: {
          ref: { type: "string" },
          claim: { type: "string" },
          source_url: { type: "string" },
          source_title: { type: "string" },
          classification: { type: "string", enum: ["FACT", "CLAIM", "INFERENCE", "UNKNOWN"] },
          evaluation_dimension: {
            type: "string",
            enum: ["platform_owner_threat", "maintenance_dependency_risk", "distribution_economics", "network_effect_lock_in"],
          },
        },
      },
    },
  },
} as const;

export const killRiskStructuredOutputFormat = jsonSchemaOutputFormat(schema);

type ParsedMessage = Anthropic.Message & { parsed_output: unknown | null };
type MessagesClient = { parse: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<ParsedMessage> };
let messagesClientFactory: (() => MessagesClient) | null = null;

export const setKillRiskMessagesClientFactoryForTests = (factory: (() => MessagesClient) | null): void => {
  messagesClientFactory = factory;
};

const canonicalUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    const host = url.hostname.replace(/^www\./, "").toLowerCase();
    const path = decodeURIComponent(url.pathname).replace(/\/+$/, "") || "/";
    return `${host}${path}`.toLowerCase();
  } catch {
    return null;
  }
};

const returnedSearchSources = (message: Anthropic.Message): Map<string, { url: string; title: string }> => {
  const sources = new Map<string, { url: string; title: string }>();
  for (const block of message.content) {
    if (block.type !== "web_search_tool_result" || !Array.isArray(block.content)) continue;
    for (const item of block.content) {
      if (item.type !== "web_search_result") continue;
      const key = canonicalUrl(item.url);
      if (key) sources.set(key, { url: item.url, title: item.title });
    }
  }
  return sources;
};

const tri = (value: unknown): TriState => value === "YES" || value === "NO" || value === "UNKNOWN" ? value : "UNKNOWN";

export const parseKillRiskCollectorOutput = (
  rawValue: unknown,
  sources: Map<string, { url: string; title: string }>,
): { inputs: DedicatedKillRiskInputs; findings: KillRiskFinding[] } => {
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    throw new Error("Kill-risk collector returned no schema-valid structured output");
  }
  const raw = rawValue as Record<string, any>;
  const findings: KillRiskFinding[] = [];
  const usedRefs = new Set<string>();
  for (const item of Array.isArray(raw.findings) ? raw.findings : []) {
    if (!item || typeof item !== "object") continue;
    const key = typeof item.source_url === "string" ? canonicalUrl(item.source_url) : null;
    const source = key ? sources.get(key) : undefined;
    if (!source || typeof item.ref !== "string" || usedRefs.has(item.ref) || typeof item.claim !== "string") continue;
    if (!["FACT", "CLAIM", "INFERENCE", "UNKNOWN"].includes(item.classification)) continue;
    if (!["platform_owner_threat", "maintenance_dependency_risk", "distribution_economics", "network_effect_lock_in"].includes(item.evaluation_dimension)) continue;
    usedRefs.add(item.ref);
    findings.push({
      ref: item.ref,
      claim: item.claim.trim().slice(0, 2_000),
      source_url: source.url,
      source_title: source.title,
      classification: item.classification,
      evaluation_dimension: item.evaluation_dimension,
    });
  }

  return {
    inputs: {
      platformOwner: {
        ownerAlreadyCompetes: tri(raw.platform_owner?.owner_already_competes),
        ownerDistributionAdvantage: tri(raw.platform_owner?.owner_distribution_advantage),
        ownerAbsorptionSignal: tri(raw.platform_owner?.owner_absorption_signal),
      },
      maintenance: {
        dependencyVolatile: tri(raw.maintenance?.dependency_volatile),
        repeatedBreakageObserved: tri(raw.maintenance?.repeated_breakage_observed),
        maintenanceBurdenDisproportionate: tri(raw.maintenance?.maintenance_burden_disproportionate),
      },
      distribution: {
        targetBuyerReachable: tri(raw.distribution?.target_buyer_reachable),
        viableAcquisitionChannelExists: tri(raw.distribution?.viable_acquisition_channel_exists),
        acquisitionEconomicsPlausible: tri(raw.distribution?.acquisition_economics_plausible),
      },
      networkEffects: {
        switchingCostsHigh: tri(raw.network_effects?.switching_costs_high),
        dataOrWorkflowPortable: tri(raw.network_effects?.data_or_workflow_portable),
        multihomingPractical: tri(raw.network_effects?.multihoming_practical),
      },
    },
    findings,
  };
};

export async function collectKillRiskEvidence(opportunity: {
  name: string;
  sourcePlatform: string;
  sourceUrl: string;
  opportunityType: string;
  thesis: string;
}): Promise<KillRiskCollectorOutput> {
  const projectedMaximumCost = PROJECTED_MAX_INPUT_TOKENS * INPUT_COST_PER_TOKEN + MAX_OUTPUT_TOKENS * OUTPUT_COST_PER_TOKEN + KILL_RISK_MAX_SEARCH_USES * SEARCH_COST_PER_USE;
  if (projectedMaximumCost > KILL_RISK_MAX_EXTERNAL_COST_USD) throw new Error("Configured kill-risk collector bounds exceed the $0.50 cost ceiling");

  let client: MessagesClient;
  if (messagesClientFactory) client = messagesClientFactory();
  else {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    if (!apiKey || !baseURL) throw new Error("AI_INTEGRATION_UNAVAILABLE");
    client = new Anthropic({ apiKey, baseURL }).messages as MessagesClient;
  }

  const message = await client.parse({
    model: "claude-sonnet-4-5",
    max_tokens: MAX_OUTPUT_TOKENS,
    system: "You are a conservative kill-risk researcher. Use source-backed web evidence only. A fatal risk must never be inferred from vibes, generic industry knowledge, or absence of evidence. Use UNKNOWN whenever evidence is mixed, stale, indirect, or insufficient.",
    output_config: { format: killRiskStructuredOutputFormat },
    tools: [{ type: "web_search_20250305", name: "web_search", max_uses: KILL_RISK_MAX_SEARCH_USES }],
    messages: [{
      role: "user",
      content: `Run a bounded kill-risk evidence collection for this Money Scout opportunity:\nName: ${opportunity.name}\nPlatform/source: ${opportunity.sourcePlatform}\nSource URL: ${opportunity.sourceUrl}\nOpportunity type: ${opportunity.opportunityType}\nThesis: ${opportunity.thesis}\n\nResearch exactly four risk families: (1) whether the platform owner already competes, has a structural distribution advantage, or shows a concrete absorption/sherlocking signal; (2) whether the product depends on volatile external systems, repeated breakage is observed, and maintenance burden appears disproportionate; (3) whether the target buyer is actually reachable, a viable acquisition channel exists, and acquisition economics are plausibly compatible with the product economics; (4) whether switching costs/network effects create lock-in, including data/workflow portability and practical multihoming.\n\nPrefer primary sources, official marketplace/platform pages, product documentation, credible pricing pages, customer migration documentation, support/issue histories, and concrete channel/economic evidence. Do not treat a platform owner's mere ability to build something as an absorption signal. Do not infer maintenance burden solely because a product is a scraper. Do not declare distribution uneconomic without affirmative evidence. Do not infer network lock-in merely from market share. Use UNKNOWN when a field cannot be established. Every non-UNKNOWN judgment should be supported by at least one returned finding whose source URL appears in the web-search results.`,
    }],
  });

  const searchCount = message.usage.server_tool_use?.web_search_requests ?? 0;
  if (searchCount > KILL_RISK_MAX_SEARCH_USES) throw new Error("Anthropic exceeded the configured kill-risk search maximum");
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const externalCostUsd = inputTokens * INPUT_COST_PER_TOKEN + outputTokens * OUTPUT_COST_PER_TOKEN + searchCount * SEARCH_COST_PER_USE;
  const parsed = parseKillRiskCollectorOutput(message.parsed_output, returnedSearchSources(message));
  if (externalCostUsd > KILL_RISK_MAX_EXTERNAL_COST_USD) throw new Error("Kill-risk collector exceeded the $0.50 cost ceiling");
  return { ...parsed, externalCostUsd: Number(externalCostUsd.toFixed(4)), searchCount, inputTokens, outputTokens };
}
