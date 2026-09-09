import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import {
  UNDERWRITING_FACTORS,
  type EvidenceClassification,
  type UnderwritingFactor,
} from "./validation-engine";

export const VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD = 0.5;
export const VALIDATION_EVIDENCE_MAX_SEARCH_USES = 8;
const MAX_OUTPUT_TOKENS = 5_000;
const PROJECTED_MAX_INPUT_TOKENS = 180_000;
const INPUT_COST_PER_TOKEN = 0.000002;
const OUTPUT_COST_PER_TOKEN = 0.00001;
const SEARCH_COST_PER_USE = 0.01;

export type ValidationEvidenceDirection = "SUPPORTS" | "CONTRADICTS" | "CONTEXT";
export type ValidationEvidenceKind =
  | "BUYER_BUDGET"
  | "PROBLEM_WORKAROUND"
  | "REPEAT_DEMAND"
  | "DEMAND_TREND"
  | "PAID_COMPETITOR"
  | "PAID_SUBSTITUTE"
  | "PRICING"
  | "COMPETITOR_QUALITY"
  | "COMPLAINT_OR_GAP"
  | "DISTRIBUTION_CHANNEL"
  | "ACQUISITION_ECONOMICS"
  | "SWITCHING_COST"
  | "PORTABILITY"
  | "REACHABLE_WEDGE"
  | "BUILD_REQUIREMENT"
  | "TECH_DEPENDENCY"
  | "OPERATING_BURDEN"
  | "MAINTENANCE_HISTORY"
  | "VARIABLE_COST"
  | "PLATFORM_FEE"
  | "SUPPORT_COST"
  | "REVERSIBILITY"
  | "VALIDATION_COST"
  | "TEST_DESIGN"
  | "TIME_TO_SIGNAL";

export type ValidationEvidenceFinding = {
  ref: string;
  claim: string;
  source_url: string;
  source_title: string;
  classification: EvidenceClassification;
  factor: UnderwritingFactor;
  direction: ValidationEvidenceDirection;
  evidence_kind: ValidationEvidenceKind;
};

export type ValidationFactorCoverage = {
  factor: UnderwritingFactor;
  status: "EVIDENCED" | "UNRESOLVED";
  open_question: string | null;
};

export type ValidationEvidenceCollectorOutput = {
  findings: ValidationEvidenceFinding[];
  coverage: ValidationFactorCoverage[];
  externalCostUsd: number;
  searchCount: number;
  inputTokens: number;
  outputTokens: number;
};

const EVIDENCE_KINDS: ValidationEvidenceKind[] = [
  "BUYER_BUDGET",
  "PROBLEM_WORKAROUND",
  "REPEAT_DEMAND",
  "DEMAND_TREND",
  "PAID_COMPETITOR",
  "PAID_SUBSTITUTE",
  "PRICING",
  "COMPETITOR_QUALITY",
  "COMPLAINT_OR_GAP",
  "DISTRIBUTION_CHANNEL",
  "ACQUISITION_ECONOMICS",
  "SWITCHING_COST",
  "PORTABILITY",
  "REACHABLE_WEDGE",
  "BUILD_REQUIREMENT",
  "TECH_DEPENDENCY",
  "OPERATING_BURDEN",
  "MAINTENANCE_HISTORY",
  "VARIABLE_COST",
  "PLATFORM_FEE",
  "SUPPORT_COST",
  "REVERSIBILITY",
  "VALIDATION_COST",
  "TEST_DESIGN",
  "TIME_TO_SIGNAL",
];

const CLASSIFICATIONS: EvidenceClassification[] = ["FACT", "CLAIM", "INFERENCE", "UNKNOWN"];
const DIRECTIONS: ValidationEvidenceDirection[] = ["SUPPORTS", "CONTRADICTS", "CONTEXT"];

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["coverage", "findings"],
  properties: {
    coverage: {
      type: "array",
      maxItems: 13,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["factor", "status", "open_question"],
        properties: {
          factor: { type: "string", enum: UNDERWRITING_FACTORS },
          status: { type: "string", enum: ["EVIDENCED", "UNRESOLVED"] },
          open_question: { type: ["string", "null"] },
        },
      },
    },
    findings: {
      type: "array",
      maxItems: 60,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "ref",
          "claim",
          "source_url",
          "source_title",
          "classification",
          "factor",
          "direction",
          "evidence_kind",
        ],
        properties: {
          ref: { type: "string" },
          claim: { type: "string" },
          source_url: { type: "string" },
          source_title: { type: "string" },
          classification: { type: "string", enum: CLASSIFICATIONS },
          factor: { type: "string", enum: UNDERWRITING_FACTORS },
          direction: { type: "string", enum: DIRECTIONS },
          evidence_kind: { type: "string", enum: EVIDENCE_KINDS },
        },
      },
    },
  },
} as const;

export const validationEvidenceStructuredOutputFormat = jsonSchemaOutputFormat(schema);

type ParsedMessage = Anthropic.Message & { parsed_output: unknown | null };
type MessagesClient = {
  parse: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<ParsedMessage>;
};
let messagesClientFactory: (() => MessagesClient) | null = null;

export const setValidationEvidenceMessagesClientFactoryForTests = (
  factory: (() => MessagesClient) | null,
): void => {
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

export const returnedValidationSearchSources = (
  message: Anthropic.Message,
): Map<string, { url: string; title: string }> => {
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

const factorSet = new Set<UnderwritingFactor>(UNDERWRITING_FACTORS);
const classificationSet = new Set<EvidenceClassification>(CLASSIFICATIONS);
const directionSet = new Set<ValidationEvidenceDirection>(DIRECTIONS);
const evidenceKindSet = new Set<ValidationEvidenceKind>(EVIDENCE_KINDS);

export const parseValidationEvidenceCollectorOutput = (
  rawValue: unknown,
  sources: Map<string, { url: string; title: string }>,
): { findings: ValidationEvidenceFinding[]; coverage: ValidationFactorCoverage[] } => {
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    throw new Error("Validation evidence collector returned no schema-valid structured output");
  }

  const raw = rawValue as Record<string, unknown>;
  const findings: ValidationEvidenceFinding[] = [];
  const usedRefs = new Set<string>();

  for (const item of Array.isArray(raw.findings) ? raw.findings : []) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const finding = item as Record<string, unknown>;
    const key = typeof finding.source_url === "string" ? canonicalUrl(finding.source_url) : null;
    const source = key ? sources.get(key) : undefined;
    if (
      !source ||
      typeof finding.ref !== "string" ||
      usedRefs.has(finding.ref) ||
      typeof finding.claim !== "string" ||
      finding.claim.trim().length === 0 ||
      typeof finding.classification !== "string" ||
      !classificationSet.has(finding.classification as EvidenceClassification) ||
      typeof finding.factor !== "string" ||
      !factorSet.has(finding.factor as UnderwritingFactor) ||
      typeof finding.direction !== "string" ||
      !directionSet.has(finding.direction as ValidationEvidenceDirection) ||
      typeof finding.evidence_kind !== "string" ||
      !evidenceKindSet.has(finding.evidence_kind as ValidationEvidenceKind)
    ) {
      continue;
    }

    usedRefs.add(finding.ref);
    findings.push({
      ref: finding.ref,
      claim: finding.claim.trim().slice(0, 2_000),
      source_url: source.url,
      source_title: source.title,
      classification: finding.classification as EvidenceClassification,
      factor: finding.factor as UnderwritingFactor,
      direction: finding.direction as ValidationEvidenceDirection,
      evidence_kind: finding.evidence_kind as ValidationEvidenceKind,
    });
  }

  const requestedCoverage = new Map<UnderwritingFactor, ValidationFactorCoverage>();
  for (const item of Array.isArray(raw.coverage) ? raw.coverage : []) {
    if (!item || typeof item !== "object" || Array.isArray(item)) continue;
    const coverage = item as Record<string, unknown>;
    if (typeof coverage.factor !== "string" || !factorSet.has(coverage.factor as UnderwritingFactor)) continue;
    const factor = coverage.factor as UnderwritingFactor;
    if (requestedCoverage.has(factor)) continue;
    const requestedStatus = coverage.status === "EVIDENCED" ? "EVIDENCED" : "UNRESOLVED";
    requestedCoverage.set(factor, {
      factor,
      status: requestedStatus,
      open_question:
        typeof coverage.open_question === "string" && coverage.open_question.trim().length > 0
          ? coverage.open_question.trim().slice(0, 1_000)
          : null,
    });
  }

  const coverage = UNDERWRITING_FACTORS.map((factor): ValidationFactorCoverage => {
    const requested = requestedCoverage.get(factor);
    const acceptedFindings = findings.filter((finding) => finding.factor === factor);
    if (acceptedFindings.length === 0) {
      return {
        factor,
        status: "UNRESOLVED",
        open_question:
          requested?.open_question ??
          "No accepted source-backed finding established this factor within the bounded collection.",
      };
    }
    return {
      factor,
      status: "EVIDENCED",
      open_question: requested?.open_question ?? null,
    };
  });

  return { findings, coverage };
};

export async function collectValidationEvidence(opportunity: {
  name: string;
  sourcePlatform: string;
  sourceUrl: string;
  opportunityType: string;
  thesis: string;
}): Promise<ValidationEvidenceCollectorOutput> {
  const projectedMaximumCost =
    PROJECTED_MAX_INPUT_TOKENS * INPUT_COST_PER_TOKEN +
    MAX_OUTPUT_TOKENS * OUTPUT_COST_PER_TOKEN +
    VALIDATION_EVIDENCE_MAX_SEARCH_USES * SEARCH_COST_PER_USE;
  if (projectedMaximumCost > VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD) {
    throw new Error("Configured validation evidence collector bounds exceed the $0.50 cost ceiling");
  }

  let client: MessagesClient;
  if (messagesClientFactory) client = messagesClientFactory();
  else {
    const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
    const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
    if (!apiKey || !baseURL) throw new Error("AI_INTEGRATION_UNAVAILABLE");
    client = new Anthropic({ apiKey, baseURL }).messages as MessagesClient;
  }

  const factorBrief = [
    "buyer_budget_clarity: named buyer, payer/budget authority, economic motive",
    "problem_intensity_recurrence: painful recurring workflow, workaround, consequence",
    "demand_trajectory_durability: multi-period persistence or durable driver, not a spike",
    "monetization_proof_price_tolerance: paid competitors/substitutes, budgets, real pricing evidence",
    "competitive_beatability_gap_quality: incumbent quality/freshness/reliability and why the gap exists",
    "distribution_accessibility_acquisition_economics: reachable channels and plausible acquisition economics",
    "adoption_switching_friction: migration, procurement, trust, integration, portability, multihoming",
    "economic_headroom: reachable wedge times plausible paid value, never broad TAM",
    "build_complexity_technical_uncertainty: credible MVP requirements, integrations, dependencies, unknowns",
    "operating_maintenance_burden: breakage, support, manual intervention, refresh/moderation burden",
    "unit_economics_pricing_power: price versus variable costs, platform fees, support/refunds/acquisition",
    "capital_at_risk_reversibility: validation/build/pre-evidence operating exposure and reusable/sunk work",
    "falsifiability_feedback_velocity: cheapest decisive experiment and time to usage/monetary signal",
  ].join("\n");

  const message = await client.parse({
    model: "claude-sonnet-4-5",
    max_tokens: MAX_OUTPUT_TOKENS,
    system:
      "You are a conservative underwriting evidence researcher for a small-bet product portfolio. Collect evidence, not scores. Never invent revenue, paid-customer counts, retention, CAC, margins, market size, build cost, or willingness to pay. Usage is not payment. A listed price is not proof that customers pay it. Label inference as INFERENCE. Use UNRESOLVED when evidence is absent, stale, contradictory, or too indirect. Every accepted finding must be tied to a source returned by web search.",
    output_config: { format: validationEvidenceStructuredOutputFormat },
    tools: [
      {
        type: "web_search_20250305",
        name: "web_search",
        max_uses: VALIDATION_EVIDENCE_MAX_SEARCH_USES,
      },
    ],
    messages: [
      {
        role: "user",
        content: `Collect bounded validation evidence for this Money Scout opportunity.\nName: ${opportunity.name}\nPlatform/source: ${opportunity.sourcePlatform}\nSource URL: ${opportunity.sourceUrl}\nOpportunity type: ${opportunity.opportunityType}\nThesis: ${opportunity.thesis}\n\nResearch all 13 underwriting factors, but do not force coverage when the public web cannot establish a factor:\n${factorBrief}\n\nEvidence priorities: primary/transactional sources first; surviving paid competitors and prices; paid manual substitutes or budgeted jobs; recurring-use evidence; customer complaints and incumbent quality; marketplace-native or other reachable distribution; migration/switching requirements; platform fees and variable costs; official technical requirements/dependencies; maintenance/support histories; and a narrow falsifying experiment when one can be supported from observed product/channel mechanics.\n\nRules:\n- Do not output factor scores, probability-of-success estimates, TAM narratives, CARE tiers, or BUILD/WATCH/KILL recommendations.\n- For economic_headroom, record only source-supported components of the reachable wedge. Do not multiply speculative quantities into revenue.\n- For capital_at_risk_reversibility and falsifiability_feedback_velocity, use INFERENCE when synthesizing source-backed facts into a testable implication.\n- CONTRADICTS means the evidence weakens the opportunity on that factor; SUPPORTS means it strengthens it; CONTEXT is relevant but not directional.\n- Mark a factor EVIDENCED only when at least one concrete finding supports the factor record. Otherwise mark UNRESOLVED and state the cheapest important open question.\n- Preserve contradictory findings instead of reconciling them away.\n- Prefer current evidence. Older evidence may be retained as context but must not silently establish current conditions.`,
      },
    ],
  });

  const searchCount = message.usage.server_tool_use?.web_search_requests ?? 0;
  if (searchCount > VALIDATION_EVIDENCE_MAX_SEARCH_USES) {
    throw new Error("Anthropic exceeded the configured validation evidence search maximum");
  }
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const externalCostUsd =
    inputTokens * INPUT_COST_PER_TOKEN +
    outputTokens * OUTPUT_COST_PER_TOKEN +
    searchCount * SEARCH_COST_PER_USE;
  if (externalCostUsd > VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD) {
    throw new Error("Validation evidence collector exceeded the $0.50 cost ceiling");
  }

  const parsed = parseValidationEvidenceCollectorOutput(
    message.parsed_output,
    returnedValidationSearchSources(message),
  );
  return {
    ...parsed,
    externalCostUsd: Number(externalCostUsd.toFixed(4)),
    searchCount,
    inputTokens,
    outputTokens,
  };
}
