import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  evidenceTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import {
  createAutonomousResolutionPlan,
  createExhaustionCertificate,
  type ResolutionAttempt,
  type ResolutionMethod,
  type ResolutionProblem,
} from "../lib/autonomous-resolution-engine";
import {
  RESOLUTION_MAX_OUTPUT_TOKENS,
  RESOLUTION_RESEARCH_SEARCH_LIMIT,
  RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
  buildResolutionWorkerSystemPrompt,
  buildResolutionWorkerUserPrompt,
  executeAutonomousResolutionAdvance,
  methodAllowsWebSearch,
  nextResolutionMethod,
  validateResolutionWorkerResult,
  type ResolutionWorkerContext,
  type ResolutionWorkerExecution,
} from "../lib/autonomous-resolution-workers";

const router: IRouter = Router();
const activeResolutions = new Set<string>();
const INPUT_COST_PER_TOKEN = 0.000002;
const OUTPUT_COST_PER_TOKEN = 0.00001;
const SEARCH_COST_PER_USE = 0.01;

const PROBLEMS = new Set<ResolutionProblem>([
  "POLICY_AMBIGUITY",
  "DEMAND_UNCERTAINTY",
  "KILL_RISK_INCOMPLETE",
  "RESEARCH_BUDGET_EXHAUSTED",
  "VALIDATION_PREREQUISITE_REGRESSION",
  "VALIDATION_EVIDENCE_FAILURE",
  "VALIDATION_BUDGET_EXHAUSTED",
  "VALIDATION_WATCH",
  "VALIDATION_REJECT_CHALLENGE",
  "COMMERCIAL_BUYER_UNRESOLVED",
  "COMMERCIAL_PRICING_UNRESOLVED",
  "COMMERCIAL_DISTRIBUTION_UNRESOLVED",
]);

const outputSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "status",
    "conclusion",
    "rationale",
    "confidence",
    "recommendation",
    "findings",
    "derived_bounds",
    "watch_triggers",
    "experiment",
    "unresolved_questions",
  ],
  properties: {
    status: { type: "string", enum: ["RESOLVED", "EXHAUSTED", "ACTIVE_MONITORING"] },
    conclusion: { type: "string" },
    rationale: { type: "string" },
    confidence: { type: "string", enum: ["HIGH", "MEDIUM", "LOW"] },
    recommendation: {
      type: "string",
      enum: [
        "CONTINUE_RESOLUTION",
        "RETURN_TO_RESEARCH",
        "RETURN_TO_VALIDATION",
        "PLAN_EXPERIMENT",
        "WATCH_FOR_DELTA",
        "BUILD_SUPPORTED",
        "KILL_SUPPORTED",
        "ESCALATE_IF_EXHAUSTED",
      ],
    },
    findings: {
      type: "array",
      maxItems: 20,
      items: {
        type: "object",
        additionalProperties: false,
        required: ["claim", "source_url", "source_title", "classification"],
        properties: {
          claim: { type: "string" },
          source_url: { type: ["string", "null"] },
          source_title: { type: ["string", "null"] },
          classification: { type: "string", enum: ["FACT", "CLAIM", "INFERENCE", "UNKNOWN"] },
        },
      },
    },
    derived_bounds: { type: "array", maxItems: 12, items: { type: "string" } },
    watch_triggers: { type: "array", maxItems: 12, items: { type: "string" } },
    experiment: {
      anyOf: [
        { type: "null" },
        {
          type: "object",
          additionalProperties: false,
          required: ["type", "hypothesis", "success_signal", "failure_signal"],
          properties: {
            type: { type: "string" },
            hypothesis: { type: "string" },
            success_signal: { type: "string" },
            failure_signal: { type: "string" },
          },
        },
      ],
    },
    unresolved_questions: { type: "array", maxItems: 12, items: { type: "string" } },
  },
} as const;

const outputFormat = jsonSchemaOutputFormat(outputSchema);
type ParsedMessage = Anthropic.Message & { parsed_output: unknown | null };
type MessagesClient = {
  parse: (params: Anthropic.MessageCreateParamsNonStreaming) => Promise<ParsedMessage>;
};
let messagesClientFactory: (() => MessagesClient) | null = null;

export const setResolutionMessagesClientFactoryForTests = (
  factory: (() => MessagesClient) | null,
): void => {
  messagesClientFactory = factory;
};

type ResolutionRunNote = {
  opportunity_id?: number;
  problem?: ResolutionProblem;
  unresolved_question?: string;
  method?: ResolutionMethod;
  status?: ResolutionAttempt["status"];
  summary?: string;
  rationale?: string;
  confidence?: string;
  recommendation?: string;
  derived_bounds?: string[];
  watch_triggers?: string[];
  experiment?: unknown;
  unresolved_questions?: string[];
  external_cost_usd?: number;
  input_tokens?: number;
  output_tokens?: number;
  search_count?: number;
};

const parseNote = (value: string | null): Partial<ResolutionRunNote> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Partial<ResolutionRunNote>
      : {};
  } catch {
    return {};
  }
};

const canonicalUrl = (value: string): string | null => {
  try {
    const url = new URL(value);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
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

async function loadState(opportunityId: number, problem: ResolutionProblem) {
  const [opportunity] = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) return null;

  const evidence = await db
    .select()
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId))
    .orderBy(evidenceTable.id);
  const runs = await db
    .select()
    .from(researchRunsTable)
    .where(eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"))
    .orderBy(desc(researchRunsTable.id));

  const notes = runs
    .map((run) => ({ run, note: parseNote(run.notes) }))
    .filter(({ note }) => note.opportunity_id === opportunityId && note.problem === problem)
    .reverse();

  const attempts: ResolutionAttempt[] = [];
  for (const { note } of notes) {
    if (!note.method || !note.status || !note.summary) continue;
    const existing = attempts.findIndex((attempt) => attempt.method === note.method);
    const attempt: ResolutionAttempt = {
      method: note.method,
      status: note.status,
      summary: note.summary,
    };
    if (existing >= 0) attempts[existing] = attempt;
    else attempts.push(attempt);
  }

  const externalCostUsd = Number(
    notes.reduce((sum, { note }) => sum + Number(note.external_cost_usd ?? 0), 0).toFixed(4),
  );

  const context: ResolutionWorkerContext = {
    opportunity: {
      id: opportunity.id,
      name: opportunity.name,
      sourcePlatform: opportunity.sourcePlatform,
      sourceUrl: opportunity.sourceUrl,
      opportunityType: opportunity.opportunityType,
      thesis: opportunity.thesis,
      verdict: opportunity.verdict,
    },
    problem,
    unresolvedQuestion: notes.at(-1)?.note.unresolved_question ?? "The unresolved question was not persisted yet.",
    priorAttempts: attempts,
    evidence: evidence.slice(-80).map((row) => ({
      claim: row.claim,
      classification: row.classification,
      evaluationDimension: row.evaluationDimension,
      sourceUrl: row.sourceUrl,
      sourceTitle: row.sourceTitle,
      observedDate: row.observedDate,
    })),
  };

  return { context, attempts, externalCostUsd, notes };
}

function getMessagesClient(): MessagesClient {
  if (messagesClientFactory) return messagesClientFactory();
  const apiKey = process.env.AI_INTEGRATIONS_ANTHROPIC_API_KEY;
  const baseURL = process.env.AI_INTEGRATIONS_ANTHROPIC_BASE_URL;
  if (!apiKey || !baseURL) throw new Error("AI_PROVIDER_UNAVAILABLE");
  return new Anthropic({ apiKey, baseURL }).messages as MessagesClient;
}

async function persistExecution(
  context: ResolutionWorkerContext,
  execution: ResolutionWorkerExecution,
  rawSources: Map<string, { url: string; title: string }>,
): Promise<void> {
  const finishedAt = new Date();
  const [run] = await db
    .insert(researchRunsTable)
    .values({
      startedAt: finishedAt,
      finishedAt,
      triggerType: "AUTONOMOUS_RESOLUTION",
      notes: JSON.stringify({
        opportunity_id: context.opportunity.id,
        problem: context.problem,
        unresolved_question: context.unresolvedQuestion,
        method: execution.result.method,
        status: execution.result.status,
        summary: execution.result.conclusion,
        rationale: execution.result.rationale,
        confidence: execution.result.confidence,
        recommendation: execution.result.recommendation,
        derived_bounds: execution.result.derivedBounds,
        watch_triggers: execution.result.watchTriggers,
        experiment: execution.result.experiment,
        unresolved_questions: execution.result.unresolvedQuestions,
        external_cost_usd: execution.estimatedExternalCostUsd,
        input_tokens: execution.inputTokens,
        output_tokens: execution.outputTokens,
        search_count: execution.searchCount,
      } satisfies ResolutionRunNote),
    })
    .returning();

  const rows = execution.result.findings.flatMap((finding) => {
    if (finding.sourceUrl) {
      const key = canonicalUrl(finding.sourceUrl);
      const source = key ? rawSources.get(key) : undefined;
      if (!source) return [];
      return [{
        claim: finding.claim,
        sourceUrl: source.url,
        sourceTitle: source.title,
        observedDate: finishedAt.toISOString().slice(0, 10),
        classification: finding.classification,
        opportunityId: context.opportunity.id,
        evaluationDimension: `resolution_${context.problem.toLowerCase()}_${execution.result.method.toLowerCase()}`,
        researchRunId: run.id,
      }];
    }
    if (finding.classification !== "INFERENCE") return [];
    return [{
      claim: finding.claim,
      sourceUrl: context.opportunity.sourceUrl,
      sourceTitle: "Money Scout Autonomous Resolution inference",
      observedDate: finishedAt.toISOString().slice(0, 10),
      classification: "INFERENCE" as const,
      opportunityId: context.opportunity.id,
      evaluationDimension: `resolution_${context.problem.toLowerCase()}_${execution.result.method.toLowerCase()}`,
      researchRunId: run.id,
    }];
  });
  if (rows.length) await db.insert(evidenceTable).values(rows);
}

async function runWorker(method: ResolutionMethod, context: ResolutionWorkerContext): Promise<ResolutionWorkerExecution> {
  const client = getMessagesClient();
  const params: Anthropic.MessageCreateParamsNonStreaming = {
    model: "claude-sonnet-4-5",
    max_tokens: RESOLUTION_MAX_OUTPUT_TOKENS,
    system: buildResolutionWorkerSystemPrompt(method),
    output_config: { format: outputFormat },
    messages: [{ role: "user", content: buildResolutionWorkerUserPrompt(method, context) }],
  };
  if (methodAllowsWebSearch(method)) {
    params.tools = [{
      type: "web_search_20250305",
      name: "web_search",
      max_uses: RESOLUTION_RESEARCH_SEARCH_LIMIT,
    }];
  }

  const message = await client.parse(params);
  const result = validateResolutionWorkerResult(method, message.parsed_output);
  const searchCount = message.usage.server_tool_use?.web_search_requests ?? 0;
  if (searchCount > RESOLUTION_RESEARCH_SEARCH_LIMIT) {
    throw new Error("Resolution worker exceeded the configured web-search limit");
  }
  const inputTokens = message.usage.input_tokens;
  const outputTokens = message.usage.output_tokens;
  const estimatedExternalCostUsd = Number((
    inputTokens * INPUT_COST_PER_TOKEN +
    outputTokens * OUTPUT_COST_PER_TOKEN +
    searchCount * SEARCH_COST_PER_USE
  ).toFixed(4));
  const execution = { result, inputTokens, outputTokens, searchCount, estimatedExternalCostUsd };
  await persistExecution(context, execution, returnedSearchSources(message));
  return execution;
}

const parseProblem = (value: unknown): ResolutionProblem | null =>
  typeof value === "string" && PROBLEMS.has(value as ResolutionProblem)
    ? value as ResolutionProblem
    : null;

router.get("/opportunities/:opportunityId/resolution", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  const problem = parseProblem(req.query.problem);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0 || !problem) {
    res.status(400).json({ error: "Valid opportunity id and resolution problem are required" });
    return;
  }
  const state = await loadState(opportunityId, problem);
  if (!state) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const unresolvedQuestion =
    state.context.unresolvedQuestion === "The unresolved question was not persisted yet."
      ? String(req.query.unresolved_question ?? state.context.unresolvedQuestion)
      : state.context.unresolvedQuestion;
  const attempts = state.attempts;
  res.status(200).json({
    opportunity_id: opportunityId,
    problem,
    unresolved_question: unresolvedQuestion,
    resolution_plan: createAutonomousResolutionPlan(problem),
    attempts,
    external_cost_usd: state.externalCostUsd,
    external_cost_ceiling_usd: RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
    next_method: nextResolutionMethod(problem, attempts),
    exhaustion_certificate: createExhaustionCertificate({
      problem,
      unresolvedQuestion,
      attempts,
    }),
  });
});

router.post("/opportunities/:opportunityId/resolution/advance", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  const problem = parseProblem(req.body?.problem);
  const unresolvedQuestion = typeof req.body?.unresolved_question === "string"
    ? req.body.unresolved_question.trim().slice(0, 4_000)
    : "";
  if (!Number.isInteger(opportunityId) || opportunityId <= 0 || !problem || !unresolvedQuestion) {
    res.status(400).json({ error: "Valid opportunity id, problem, and unresolved_question are required" });
    return;
  }
  const activeKey = `${opportunityId}:${problem}`;
  if (activeResolutions.has(activeKey)) {
    res.status(409).json({ error: "Autonomous resolution is already running for this opportunity and problem" });
    return;
  }
  const state = await loadState(opportunityId, problem);
  if (!state) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  if (state.externalCostUsd >= RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD) {
    res.status(200).json({
      opportunity_id: opportunityId,
      problem,
      stopped_for_budget: true,
      external_cost_usd: state.externalCostUsd,
      external_cost_ceiling_usd: RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
      exhaustion_certificate: createExhaustionCertificate({
        problem,
        unresolvedQuestion,
        attempts: state.attempts,
      }),
      note: "The resolution budget is exhausted. Budget exhaustion alone does not make the knowledge gap eligible for human escalation unless the Exhaustion Certificate is issued.",
    });
    return;
  }

  activeResolutions.add(activeKey);
  try {
    const context: ResolutionWorkerContext = {
      ...state.context,
      unresolvedQuestion,
      priorAttempts: state.attempts,
    };
    const result = await executeAutonomousResolutionAdvance({
      context,
      priorExternalCostUsd: state.externalCostUsd,
      runWorker,
    });
    res.status(200).json({
      opportunity_id: opportunityId,
      problem,
      unresolved_question: unresolvedQuestion,
      ...result,
      external_cost_ceiling_usd: RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
      owner_escalation_allowed: result.exhaustionCertificate.humanEscalationEligible,
      retry_policy: "NO_BLIND_PAID_RETRY",
    });
  } catch (error) {
    req.log.error({ err: error, opportunityId, problem }, "Autonomous resolution advance failed");
    const message = error instanceof Error ? error.message : "Unknown resolution failure";
    if (message.includes("AI_PROVIDER_UNAVAILABLE")) {
      res.status(503).json({ error: "AI_PROVIDER_UNAVAILABLE" });
      return;
    }
    res.status(502).json({
      error: "Autonomous resolution stopped after a worker failure. No automatic retry was attempted.",
    });
  } finally {
    activeResolutions.delete(activeKey);
  }
});

export default router;
