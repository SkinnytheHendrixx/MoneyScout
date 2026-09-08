import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import {
  db,
  demandCheckResultsTable,
  evidenceTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import {
  ListDemandChecksParams,
  ListDemandChecksResponse,
  RunDemandCheckParams,
  RunDemandCheckResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();
const runningChecks = new Set<number>();
const MAX_EXTERNAL_COST_USD = 0.5;
export const MAX_SEARCH_USES = 4;
const MAX_OUTPUT_TOKENS = 3_000;
const PROJECTED_MAX_INPUT_TOKENS = 190_000;
const INPUT_COST_PER_TOKEN = 0.000002;
const OUTPUT_COST_PER_TOKEN = 0.00001;
const SEARCH_COST_PER_USE = 0.01;

const DIMENSIONS = new Set([
  "external_demand",
  "commercial_value",
  "repeat_usage",
  "agent_api_usefulness",
  "incumbent_weakness",
]);
const CLASSIFICATIONS = new Set(["FACT", "CLAIM", "INFERENCE", "UNKNOWN"]);
const TRI_STATES = new Set(["true", "false", "unknown"]);
const ACCESS_TYPES = new Set(["access_demand", "consumption_only", "unclear"]);
const RECURRING_SIGNALS = new Set(["yes", "no", "unknown"]);
const CONCLUSIONS = new Set(["SUPPORTED", "WEAK", "UNSUPPORTED", "UNKNOWN"]);

type Conclusion = "SUPPORTED" | "WEAK" | "UNSUPPORTED" | "UNKNOWN";
type Finding = {
  ref: string;
  claim: string;
  source_url: string;
  source_title: string;
  classification: "FACT" | "CLAIM" | "INFERENCE" | "UNKNOWN";
  evaluation_dimension: string;
  evidence_tier: number;
  contradicts_thesis: boolean;
};
type DemandAnalysis = {
  buyer_identified: "true" | "false" | "unknown";
  buyer_description: string | null;
  workflow_identified: "true" | "false" | "unknown";
  workflow_description: string | null;
  access_vs_consumption: "access_demand" | "consumption_only" | "unclear";
  recurring_usage_signal: "yes" | "no" | "unknown";
  recurring_usage_basis: string | null;
  existing_paid_analog_found: boolean;
  paid_analog_names: string[];
  demand_conclusion: Conclusion;
  contradicting_finding_refs: string[];
  confidence_basis: string;
  open_questions: string[];
  findings: Finding[];
};

const demandOutputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "buyer_identified",
    "buyer_description",
    "workflow_identified",
    "workflow_description",
    "access_vs_consumption",
    "recurring_usage_signal",
    "recurring_usage_basis",
    "existing_paid_analog_found",
    "paid_analog_names",
    "demand_conclusion",
    "contradicting_finding_refs",
    "confidence_basis",
    "open_questions",
    "findings",
  ],
  properties: {
    buyer_identified: { type: "string", enum: ["true", "false", "unknown"] },
    buyer_description: { type: ["string", "null"] },
    workflow_identified: { type: "string", enum: ["true", "false", "unknown"] },
    workflow_description: { type: ["string", "null"] },
    access_vs_consumption: {
      type: "string",
      enum: ["access_demand", "consumption_only", "unclear"],
    },
    recurring_usage_signal: { type: "string", enum: ["yes", "no", "unknown"] },
    recurring_usage_basis: { type: ["string", "null"] },
    existing_paid_analog_found: { type: "boolean" },
    paid_analog_names: { type: "array", maxItems: 20, items: { type: "string" } },
    demand_conclusion: {
      type: "string",
      enum: ["SUPPORTED", "WEAK", "UNSUPPORTED", "UNKNOWN"],
    },
    contradicting_finding_refs: {
      type: "array",
      maxItems: 40,
      items: { type: "string" },
    },
    confidence_basis: { type: "string" },
    open_questions: { type: "array", maxItems: 20, items: { type: "string" } },
    findings: {
      type: "array",
      maxItems: 40,
      items: {
        type: "object",
        additionalProperties: false,
        required: [
          "ref",
          "claim",
          "source_url",
          "source_title",
          "classification",
          "evaluation_dimension",
          "evidence_tier",
          "contradicts_thesis",
        ],
        properties: {
          ref: { type: "string" },
          claim: { type: "string" },
          source_url: { type: "string" },
          source_title: { type: "string" },
          classification: {
            type: "string",
            enum: ["FACT", "CLAIM", "INFERENCE", "UNKNOWN"],
          },
          evaluation_dimension: {
            type: "string",
            enum: [
              "external_demand",
              "commercial_value",
              "repeat_usage",
              "agent_api_usefulness",
              "incumbent_weakness",
            ],
          },
          evidence_tier: { type: "integer", minimum: 1, maximum: 6 },
          contradicts_thesis: { type: "boolean" },
        },
      },
    },
  },
} as const;

export const demandStructuredOutputFormat = jsonSchemaOutputFormat(demandOutputSchema);

type DemandParsedMessage = Anthropic.Message & { parsed_output: unknown | null };
type DemandMessagesClient = {
  parse: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<DemandParsedMessage>;
};

let demandMessagesClientFactory: (() => DemandMessagesClient) | null = null;

export const setDemandMessagesClientFactoryForTests = (
  factory: (() => DemandMessagesClient) | null,
): void => {
  demandMessagesClientFactory = factory;
};

const truncate = (value: string, max = 2_000): string => value.trim().slice(0, max);

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

const parseAnalysis = (
  rawValue: unknown,
  sources: Map<string, { url: string; title: string }>,
): DemandAnalysis => {
  if (!rawValue || typeof rawValue !== "object" || Array.isArray(rawValue)) {
    throw new Error("Claude returned no schema-valid structured output");
  }
  const raw = rawValue as Record<string, unknown>;
  const requiredKeys = Object.keys(demandOutputSchema.properties);
  if (
    requiredKeys.some((key) => !(key in raw)) ||
    Object.keys(raw).some((key) => !requiredKeys.includes(key))
  ) {
    throw new Error("Claude structured output did not match the required schema");
  }
  if (
    typeof raw.buyer_identified !== "string" ||
    !TRI_STATES.has(raw.buyer_identified) ||
    !("buyer_description" in raw) ||
    (raw.buyer_description !== null && typeof raw.buyer_description !== "string") ||
    typeof raw.workflow_identified !== "string" ||
    !TRI_STATES.has(raw.workflow_identified) ||
    !("workflow_description" in raw) ||
    (raw.workflow_description !== null && typeof raw.workflow_description !== "string") ||
    typeof raw.access_vs_consumption !== "string" ||
    !ACCESS_TYPES.has(raw.access_vs_consumption) ||
    typeof raw.recurring_usage_signal !== "string" ||
    !RECURRING_SIGNALS.has(raw.recurring_usage_signal) ||
    !("recurring_usage_basis" in raw) ||
    (raw.recurring_usage_basis !== null && typeof raw.recurring_usage_basis !== "string") ||
    typeof raw.existing_paid_analog_found !== "boolean" ||
    !Array.isArray(raw.paid_analog_names) ||
    raw.paid_analog_names.some((value) => typeof value !== "string") ||
    typeof raw.demand_conclusion !== "string" ||
    !CONCLUSIONS.has(raw.demand_conclusion) ||
    !Array.isArray(raw.contradicting_finding_refs) ||
    raw.contradicting_finding_refs.some((value) => typeof value !== "string") ||
    typeof raw.confidence_basis !== "string" ||
    !Array.isArray(raw.open_questions) ||
    raw.open_questions.some((value) => typeof value !== "string") ||
    !Array.isArray(raw.findings)
  ) {
    throw new Error("Claude structured output did not match the required schema");
  }
  const findings: Finding[] = [];
  const usedRefs = new Set<string>();

  if (Array.isArray(raw.findings)) {
    for (const item of raw.findings) {
      if (!item || typeof item !== "object") continue;
      const finding = item as Record<string, unknown>;
      const key =
        typeof finding.source_url === "string" ? canonicalUrl(finding.source_url) : null;
      const source = key ? sources.get(key) : undefined;
      if (
        !source ||
        typeof finding.ref !== "string" ||
        usedRefs.has(finding.ref) ||
        typeof finding.claim !== "string" ||
        finding.claim.trim().length === 0 ||
        typeof finding.classification !== "string" ||
        !CLASSIFICATIONS.has(finding.classification) ||
        typeof finding.evaluation_dimension !== "string" ||
        !DIMENSIONS.has(finding.evaluation_dimension) ||
        typeof finding.evidence_tier !== "number" ||
        !Number.isInteger(finding.evidence_tier) ||
        finding.evidence_tier < 1 ||
        finding.evidence_tier > 6
      ) {
        continue;
      }
      usedRefs.add(finding.ref);
      findings.push({
        ref: finding.ref,
        claim: truncate(finding.claim),
        source_url: source.url,
        source_title: source.title,
        classification: finding.classification as Finding["classification"],
        evaluation_dimension: finding.evaluation_dimension,
        evidence_tier: finding.evidence_tier,
        contradicts_thesis: finding.contradicts_thesis === true,
      });
    }
  }

  const triState = (value: unknown): DemandAnalysis["buyer_identified"] =>
    typeof value === "string" && TRI_STATES.has(value)
      ? (value as DemandAnalysis["buyer_identified"])
      : "unknown";
  const access =
    typeof raw.access_vs_consumption === "string" &&
    ACCESS_TYPES.has(raw.access_vs_consumption)
      ? (raw.access_vs_consumption as DemandAnalysis["access_vs_consumption"])
      : "unclear";
  const recurring =
    typeof raw.recurring_usage_signal === "string" &&
    RECURRING_SIGNALS.has(raw.recurring_usage_signal)
      ? (raw.recurring_usage_signal as DemandAnalysis["recurring_usage_signal"])
      : "unknown";
  let conclusion: Conclusion =
    typeof raw.demand_conclusion === "string" && CONCLUSIONS.has(raw.demand_conclusion)
      ? (raw.demand_conclusion as Conclusion)
      : "UNKNOWN";
  const requestedContradictions = Array.isArray(raw.contradicting_finding_refs)
    ? raw.contradicting_finding_refs.filter((value): value is string => typeof value === "string")
    : [];
  const contradictionRefs = requestedContradictions.filter((ref) =>
    findings.some((finding) => finding.ref === ref && finding.contradicts_thesis),
  );
  const hasTierOneToFour = findings.some(
    (finding) => finding.evidence_tier <= 4 && finding.classification !== "INFERENCE",
  );
  const buyer = triState(raw.buyer_identified);
  const workflow = triState(raw.workflow_identified);
  const hasSpend = findings.some(
    (finding) =>
      finding.evaluation_dimension === "commercial_value" &&
      finding.evidence_tier <= 3 &&
      finding.classification === "FACT",
  );

  if (conclusion === "UNSUPPORTED" && contradictionRefs.length === 0) conclusion = "UNKNOWN";
  if (
    conclusion === "SUPPORTED" &&
    (buyer !== "true" ||
      workflow !== "true" ||
      (!hasSpend && recurring !== "yes") ||
      !findings.some((finding) => finding.evidence_tier <= 3))
  ) {
    conclusion = hasTierOneToFour ? "WEAK" : "UNKNOWN";
  }
  if (conclusion === "WEAK" && !hasTierOneToFour) conclusion = "UNKNOWN";

  return {
    buyer_identified: buyer,
    buyer_description:
      typeof raw.buyer_description === "string" ? truncate(raw.buyer_description, 1_000) : null,
    workflow_identified: triState(raw.workflow_identified),
    workflow_description:
      typeof raw.workflow_description === "string"
        ? truncate(raw.workflow_description, 1_000)
        : null,
    access_vs_consumption: access,
    recurring_usage_signal: recurring,
    recurring_usage_basis:
      typeof raw.recurring_usage_basis === "string"
        ? truncate(raw.recurring_usage_basis, 1_000)
        : null,
    existing_paid_analog_found: raw.existing_paid_analog_found === true,
    paid_analog_names: Array.isArray(raw.paid_analog_names)
      ? raw.paid_analog_names
          .filter((value): value is string => typeof value === "string")
          .map((value) => truncate(value, 200))
          .slice(0, 20)
      : [],
    demand_conclusion: conclusion,
    contradicting_finding_refs: contradictionRefs,
    confidence_basis:
      typeof raw.confidence_basis === "string"
        ? truncate(raw.confidence_basis)
        : "No adequate confidence basis was returned.",
    open_questions: Array.isArray(raw.open_questions)
      ? raw.open_questions
          .filter((value): value is string => typeof value === "string")
          .map((value) => truncate(value, 500))
          .slice(0, 20)
      : [],
    findings: findings.slice(0, 40),
  };
};

const toApi = (row: {
  result: typeof demandCheckResultsTable.$inferSelect;
  run: typeof researchRunsTable.$inferSelect;
}) => ({
  id: row.result.id,
  opportunity_id: row.result.opportunityId,
  run_id: row.result.runId,
  buyer_identified: row.result.buyerIdentified,
  buyer_description: row.result.buyerDescription,
  workflow_identified: row.result.workflowIdentified,
  workflow_description: row.result.workflowDescription,
  access_vs_consumption: row.result.accessVsConsumption,
  recurring_usage_signal: row.result.recurringUsageSignal,
  recurring_usage_basis: row.result.recurringUsageBasis,
  existing_paid_analog_found: row.result.existingPaidAnalogFound,
  paid_analog_names: row.result.paidAnalogNames,
  demand_conclusion: row.result.demandConclusion,
  contradicting_evidence_ids: row.result.contradictingEvidenceIds,
  confidence_basis: row.result.confidenceBasis,
  open_questions: row.result.openQuestions,
  search_count: row.result.searchCount,
  claude_call_count: row.result.claudeCallCount,
  external_cost_usd: row.result.externalCostUsd,
  ai_input_tokens: row.result.aiInputTokens,
  ai_output_tokens: row.result.aiOutputTokens,
  started_at: row.run.startedAt.toISOString(),
  finished_at: row.run.finishedAt?.toISOString() ?? null,
});

const unknownAnalysis = (basis: string): DemandAnalysis => ({
  buyer_identified: "unknown",
  buyer_description: null,
  workflow_identified: "unknown",
  workflow_description: null,
  access_vs_consumption: "unclear",
  recurring_usage_signal: "unknown",
  recurring_usage_basis: null,
  existing_paid_analog_found: false,
  paid_analog_names: [],
  demand_conclusion: "UNKNOWN",
  contradicting_finding_refs: [],
  confidence_basis: basis,
  open_questions: ["Authoritative or transactional evidence could not be established within the bounded check."],
  findings: [],
});

router.get("/opportunities/:opportunityId/demand-checks", async (req, res): Promise<void> => {
  const params = ListDemandChecksParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db
    .select({ result: demandCheckResultsTable, run: researchRunsTable })
    .from(demandCheckResultsTable)
    .innerJoin(researchRunsTable, eq(demandCheckResultsTable.runId, researchRunsTable.id))
    .where(eq(demandCheckResultsTable.opportunityId, params.data.opportunityId))
    .orderBy(desc(researchRunsTable.startedAt));
  res.json(ListDemandChecksResponse.parse(rows.map(toApi)));
});

router.post("/opportunities/:opportunityId/demand-checks", async (req, res): Promise<void> => {
  const params = RunDemandCheckParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const opportunityId = params.data.opportunityId;
  if (runningChecks.has(opportunityId)) {
    res.status(409).json({ error: "Demand Check already running" });
    return;
  }
  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }

  runningChecks.add(opportunityId);
  const [run] = await db
    .insert(researchRunsTable)
    .values({ startedAt: new Date(), triggerType: "DEMAND_CHECK" })
    .returning();
  let inputTokens = 0;
  let outputTokens = 0;
  let searchCount = 0;
  let claudeCallCount = 0;
  let estimatedCost = 0;
  let analysis = unknownAnalysis("The Demand Check did not complete.");

  try {
    const projectedMaximumCost =
      PROJECTED_MAX_INPUT_TOKENS * INPUT_COST_PER_TOKEN +
      MAX_OUTPUT_TOKENS * OUTPUT_COST_PER_TOKEN +
      MAX_SEARCH_USES * SEARCH_COST_PER_USE;
    if (projectedMaximumCost > MAX_EXTERNAL_COST_USD) {
      throw new Error("Configured Demand Check bounds exceed the $0.50 cost ceiling");
    }
    let messagesClient: DemandMessagesClient;
    if (demandMessagesClientFactory) {
      messagesClient = demandMessagesClientFactory();
    } else {
      const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
      const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
      if (!apiKey || !baseURL) {
        throw new Error("Replit Anthropic integration is not configured");
      }
      messagesClient = new Anthropic({ apiKey, baseURL }).messages as DemandMessagesClient;
    }
    const message = await messagesClient.parse({
      model: "claude-sonnet-4-5",
      max_tokens: MAX_OUTPUT_TOKENS,
      system:
        "You are a conservative demand researcher. Use web evidence, not intuition. Never infer programmatic-access demand from popularity, willingness to pay from free tools, or recurring use from one anecdote. UNSUPPORTED requires affirmative contradicting evidence. Use explicit unknown, unclear, and null values whenever research cannot establish a field.",
      output_config: {
        format: demandStructuredOutputFormat,
      },
      tools: [
        {
          type: "web_search_20250305",
          name: "web_search",
          max_uses: MAX_SEARCH_USES,
        },
      ],
      messages: [
        {
          role: "user",
          content: `Run a bounded demand check for:
Name: ${opportunity.name}
Platform/source: ${opportunity.sourcePlatform}
Source URL: ${opportunity.sourceUrl}
Opportunity type: ${opportunity.opportunityType}
Thesis: ${opportunity.thesis}

Use focused searches for named buyers and concrete input-to-output workflows; job posts or marketplace transactions with budgets; adjacent paid products with both visible pricing and customer signals; recurring-use indicators; demand for structured/programmatic access distinct from consumption; paid channels and raw gaps; and affirmative evidence against the thesis. Prefer evidence tiers:
1 direct transactions, pricing with customer activity, or budgeted jobs
2 primary operator statements
3 paid-tool pricing plus customer signals
4 structured high-engagement technical/community evidence
5 unstructured sentiment
6 speculation

Do not research Apify, score the opportunity, recommend products, or perform a competitive-landscape analysis. Incidental paid analogs may be named and their raw limitations recorded. Evidence older than 12 months without current corroboration cannot establish the conclusion.

Return the required structured output. SUPPORTED requires a named buyer, concrete workflow, and either verified spend or strong recurring evidence from tiers 1-3. WEAK requires some tier 1-4 support but a major gap. UNSUPPORTED requires specific affirmative contradiction findings listed by ref. Otherwise use UNKNOWN. Preserve every valid source-backed finding even when the overall conclusion is UNKNOWN.`,
        },
      ],
    });

    inputTokens = message.usage.input_tokens;
    outputTokens = message.usage.output_tokens;
    claudeCallCount = 1;
    searchCount = message.usage.server_tool_use?.web_search_requests ?? 0;
    if (searchCount > MAX_SEARCH_USES) {
      throw new Error("Anthropic reported more web searches than the configured maximum");
    }
    estimatedCost =
      inputTokens * INPUT_COST_PER_TOKEN +
      outputTokens * OUTPUT_COST_PER_TOKEN +
      searchCount * SEARCH_COST_PER_USE;
    const searchSources = returnedSearchSources(message);
    analysis = parseAnalysis(message.parsed_output, searchSources);
    if (estimatedCost > MAX_EXTERNAL_COST_USD) {
      analysis.demand_conclusion = "UNKNOWN";
      analysis.confidence_basis = `${analysis.confidence_basis} Research stopped at the $0.50 estimated cost ceiling; unresolved fields remain UNKNOWN.`;
    }
  } catch (error) {
    req.log.error({ err: error, opportunityId, runId: run.id }, "Demand Check failed");
    analysis = unknownAnalysis(
      estimatedCost >= MAX_EXTERNAL_COST_USD
        ? "Research stopped at the $0.50 estimated external-service ceiling."
        : "The bounded research request failed; no automatic retry was attempted.",
    );
  }

  try {
    const finishedAt = new Date();
    const saved = await db.transaction(async (tx) => {
      const evidenceRows =
        analysis.findings.length > 0
          ? await tx
              .insert(evidenceTable)
              .values(
                analysis.findings.map((finding) => ({
                  claim: finding.claim,
                  sourceUrl: finding.source_url,
                  sourceTitle: finding.source_title,
                  observedDate: finishedAt.toISOString().slice(0, 10),
                  classification: finding.classification,
                  opportunityId,
                  evaluationDimension: finding.evaluation_dimension,
                  researchRunId: run.id,
                })),
              )
              .returning()
          : [];
      const evidenceIdByRef = new Map(
        analysis.findings.map((finding, index) => [finding.ref, evidenceRows[index]?.id]),
      );
      const contradictingEvidenceIds = analysis.contradicting_finding_refs
        .map((ref) => evidenceIdByRef.get(ref))
        .filter((id): id is number => typeof id === "number");
      if (analysis.demand_conclusion === "UNSUPPORTED" && contradictingEvidenceIds.length === 0) {
        analysis.demand_conclusion = "UNKNOWN";
      }
      await tx
        .update(researchRunsTable)
        .set({
          finishedAt,
          notes:
            analysis.demand_conclusion === "UNKNOWN"
              ? "Demand Check completed with unresolved or insufficient evidence."
              : "Demand Check completed.",
        })
        .where(eq(researchRunsTable.id, run.id));
      const [result] = await tx
        .insert(demandCheckResultsTable)
        .values({
          opportunityId,
          runId: run.id,
          buyerIdentified: analysis.buyer_identified,
          buyerDescription: analysis.buyer_description,
          workflowIdentified: analysis.workflow_identified,
          workflowDescription: analysis.workflow_description,
          accessVsConsumption: analysis.access_vs_consumption,
          recurringUsageSignal: analysis.recurring_usage_signal,
          recurringUsageBasis: analysis.recurring_usage_basis,
          existingPaidAnalogFound: analysis.existing_paid_analog_found,
          paidAnalogNames: analysis.paid_analog_names,
          demandConclusion: analysis.demand_conclusion,
          contradictingEvidenceIds,
          confidenceBasis: analysis.confidence_basis,
          openQuestions: analysis.open_questions,
          searchCount,
          claudeCallCount,
          externalCostUsd: estimatedCost,
          aiInputTokens: inputTokens,
          aiOutputTokens: outputTokens,
        })
        .returning();
      return { result, run: { ...run, finishedAt } };
    });
    res.status(201).json(RunDemandCheckResponse.parse(toApi(saved)));
  } finally {
    runningChecks.delete(opportunityId);
  }
});

export default router;