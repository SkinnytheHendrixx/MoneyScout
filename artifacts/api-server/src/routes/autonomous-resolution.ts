import Anthropic from "@anthropic-ai/sdk";
import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { and, desc, eq, gte } from "drizzle-orm";
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
  type ResolutionAdvanceResult,
  type ResolutionWorkerContext,
  type ResolutionWorkerExecution,
} from "../lib/autonomous-resolution-workers";
import {
  createOrReuseHumanAction,
  resumeActionForResolutionProblem,
  type HumanGateCandidate,
} from "../lib/human-gates";
import {
  activityEstimateForStage,
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
} from "../lib/lifecycle-state";

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

const humanGateSchema = {
  anyOf: [
    { type: "null" },
    {
      type: "object",
      additionalProperties: false,
      required: [
        "action_type",
        "title",
        "why_needed",
        "instructions",
        "blocked_stage",
        "required_capability_key",
        "provider",
        "verification_mode",
        "urgency",
      ],
      properties: {
        action_type: { type: "string" },
        title: { type: "string" },
        why_needed: { type: "string" },
        instructions: { type: "string" },
        blocked_stage: { type: "string" },
        required_capability_key: { type: ["string", "null"] },
        provider: { type: ["string", "null"] },
        verification_mode: {
          type: "string",
          enum: ["AUTOMATED_CHECK", "HUMAN_ATTESTATION", "EXTERNAL_CALLBACK"],
        },
        urgency: { type: "string", enum: ["CRITICAL", "HIGH", "NORMAL", "LOW"] },
      },
    },
  ],
} as const;

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
    "human_gate_candidate",
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
    human_gate_candidate: humanGateSchema,
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
  evaluation_cycle_id?: number | null;
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
  human_gate_candidate?: HumanGateCandidate | null;
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
  const cycle = await getActiveEvaluationCycle(opportunityId);

  const evidence = await db
    .select()
    .from(evidenceTable)
    .where(eq(evidenceTable.opportunityId, opportunityId))
    .orderBy(evidenceTable.id);
  const runs = await db
    .select()
    .from(researchRunsTable)
    .where(
      cycle
        ? and(
            eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"),
            gte(researchRunsTable.startedAt, cycle.startedAt),
          )
        : eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"),
    )
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

  return { context, attempts, externalCostUsd, notes, cycle };
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
  const cycle = await getActiveEvaluationCycle(context.opportunity.id);
  const [run] = await db
    .insert(researchRunsTable)
    .values({
      startedAt: finishedAt,
      finishedAt,
      triggerType: "AUTONOMOUS_RESOLUTION",
      notes: JSON.stringify({
        opportunity_id: context.opportunity.id,
        evaluation_cycle_id: cycle?.id ?? null,
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
        human_gate_candidate: execution.result.humanGateCandidate,
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
  const estimate = activityEstimateForStage(method);
  const cycle = await getActiveEvaluationCycle(context.opportunity.id);
  await setOpportunityActivity(context.opportunity.id, {
    activeEvaluationCycleId: cycle?.id ?? null,
    currentActivityKey: `RESOLUTION_${method}`,
    currentActivityLabel: estimate.label,
    activityStatus: "RUNNING",
    activityStartedAt: new Date(),
    expectedDurationSeconds: estimate.expectedDurationSeconds,
    stageIndex: estimate.stageIndex,
    stageCount: estimate.stageCount,
    nextAction: "Continue autonomous resolution until the issue is resolved, experimentally testable, temporal, or truly exhausted.",
    etaBasis: "STATIC_STAGE_ESTIMATE_UNTIL_REAL_HISTORY",
  });
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

function genericHumanGateForExhaustion(
  problem: ResolutionProblem,
  unresolvedQuestion: string,
): HumanGateCandidate {
  return {
    actionType: "REVIEW_EXHAUSTED_UNCERTAINTY",
    title: `Decision required: ${problem.replaceAll("_", " ").toLowerCase()}`,
    whyNeeded: `Every applicable internal resolution method was exhausted and the remaining question still matters: ${unresolvedQuestion}`,
    instructions: "Review the concise evidence summary and provide only the missing judgment or authority. Money Scout should not ask you to repeat research it has already exhausted.",
    blockedStage: `AUTONOMOUS_RESOLUTION:${problem}`,
    requiredCapabilityKey: null,
    provider: null,
    verificationMode: "HUMAN_ATTESTATION",
    urgency: "NORMAL",
  };
}

async function applyResolutionLifecycleOutcome(
  opportunityId: number,
  result: ResolutionAdvanceResult,
): Promise<void> {
  const cycle = await getActiveEvaluationCycle(opportunityId);
  const latest = result.executions.at(-1)?.result ?? null;
  if (result.activeMonitoring) {
    await db
      .update(opportunitiesTable)
      .set({ verdict: "WATCH", killReason: null })
      .where(eq(opportunitiesTable.id, opportunityId));
    await setOpportunityActivity(opportunityId, {
      activeEvaluationCycleId: cycle?.id ?? null,
      currentActivityKey: "WATCH_PENDING_REGISTRATION",
      currentActivityLabel: "Resolution completed; preparing WATCH monitoring",
      activityStatus: "WAITING",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: "Portfolio Reconciler will register these concrete triggers and monitor for material change.",
      etaBasis: "EVENT_DRIVEN_NO_FIXED_ETA",
      lifecycleTransition: true,
    });
    await recordLifecycleEvent({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      eventType: "AUTONOMOUS_RESOLUTION_ENTERED_WATCH",
      summary: latest?.conclusion ?? "Resolution determined that only future material change can resolve the remaining uncertainty.",
      metadata: { watch_triggers: latest?.watchTriggers ?? [] },
    });
    return;
  }

  if (result.exhaustionCertificate.humanEscalationEligible) {
    const candidate = [...result.executions]
      .reverse()
      .map((execution) => execution.result.humanGateCandidate)
      .find((value): value is HumanGateCandidate => value != null);

    await recordLifecycleEvent({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      eventType: "EXHAUSTION_CERTIFICATE_ISSUED",
      summary: result.exhaustionCertificate.unresolvedQuestion,
      metadata: {
        problem: result.exhaustionCertificate.problem,
        exhausted_methods: result.exhaustionCertificate.exhaustedMethods,
        human_gate_candidate: candidate,
      },
    });

    if (!candidate && result.executions.length === 0) {
      await setOpportunityActivity(opportunityId, {
        activeEvaluationCycleId: cycle?.id ?? null,
        currentActivityKey: "HUMAN_REVIEW_ELIGIBLE",
        currentActivityLabel: "Internal resolution exhausted",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: "Portfolio reconciliation will reconstruct the exhausted resolution history and create the smallest qualified Human Action.",
        etaBasis: "HUMAN_ACTION_RECONCILIATION",
        lifecycleTransition: true,
      });
      return;
    }

    const gate = candidate ?? genericHumanGateForExhaustion(
      result.exhaustionCertificate.problem,
      result.exhaustionCertificate.unresolvedQuestion,
    );
    const resumeAction = gate.requiredCapabilityKey
      ? resumeActionForResolutionProblem(result.exhaustionCertificate.problem)
      : "NO_AUTOMATIC_RESUME";
    const humanAction = await createOrReuseHumanAction({
      ...gate,
      opportunityId,
      resumeAction,
      resumePayload: {
        problem: result.exhaustionCertificate.problem,
        unresolved_question: result.exhaustionCertificate.unresolvedQuestion,
      },
      exhaustionCertificate: result.exhaustionCertificate,
    });

    if (humanAction.capabilityAlreadyAvailable) {
      await setOpportunityActivity(opportunityId, {
        activeEvaluationCycleId: cycle?.id ?? null,
        currentActivityKey: "AVAILABLE_CAPABILITY_NOT_CONSUMED",
        currentActivityLabel: "Required access already exists; human escalation suppressed",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: `Capability ${gate.requiredCapabilityKey} is already available. The autonomous execution layer must resume the blocked stage using it rather than asking the owner again.`,
        etaBasis: "AUTONOMY_RECOVERY_REQUIRED",
        lifecycleTransition: true,
      });
      await recordLifecycleEvent({
        opportunityId,
        evaluationCycleId: cycle?.id ?? null,
        eventType: "HUMAN_GATE_SUPPRESSED_CAPABILITY_AVAILABLE",
        summary: `Human escalation suppressed because ${gate.requiredCapabilityKey} is already available.`,
        metadata: { required_capability_key: gate.requiredCapabilityKey },
      });
    }
    return;
  }

  if (result.resolvedInternally && latest) {
    await setOpportunityActivity(opportunityId, {
      activeEvaluationCycleId: cycle?.id ?? null,
      currentActivityKey: "RESOLUTION_COMPLETE",
      currentActivityLabel: "Internal uncertainty resolved",
      activityStatus: "WAITING",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: latest.recommendation.replaceAll("_", " "),
      etaBasis: "NEXT_LIFECYCLE_ACTION",
      lifecycleTransition: true,
    });
    await recordLifecycleEvent({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      eventType: "AUTONOMOUS_RESOLUTION_RESOLVED",
      summary: latest.conclusion,
      metadata: {
        method: latest.method,
        recommendation: latest.recommendation,
        confidence: latest.confidence,
        derived_bounds: latest.derivedBounds,
      },
    });
    return;
  }

  if (result.stoppedForBudget) {
    await setOpportunityActivity(opportunityId, {
      activeEvaluationCycleId: cycle?.id ?? null,
      currentActivityKey: "RESOLUTION_BUDGET_STOPPED",
      currentActivityLabel: "Resolution paused at budget guard",
      activityStatus: "BLOCKED",
      activityStartedAt: new Date(),
      expectedDurationSeconds: null,
      nextAction: "Budget exhaustion does not qualify this knowledge gap for owner escalation without an Exhaustion Certificate.",
      etaBasis: "BUDGET_POLICY_DEPENDENT",
    });
  }
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
    evaluation_cycle_id: state.cycle?.id ?? null,
    evaluation_cycle_started_at: state.cycle?.startedAt.toISOString() ?? null,
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
    const certificate = createExhaustionCertificate({
      problem,
      unresolvedQuestion,
      attempts: state.attempts,
    });
    if (certificate.humanEscalationEligible) {
      await setOpportunityActivity(opportunityId, {
        activeEvaluationCycleId: state.cycle?.id ?? null,
        currentActivityKey: "HUMAN_REVIEW_ELIGIBLE",
        currentActivityLabel: "Internal resolution exhausted",
        activityStatus: "BLOCKED",
        activityStartedAt: new Date(),
        expectedDurationSeconds: null,
        nextAction: "Portfolio reconciliation will convert this issued Exhaustion Certificate into a structured Human Action.",
        etaBasis: "HUMAN_ACTION_RECONCILIATION",
        lifecycleTransition: true,
      });
    }
    res.status(200).json({
      opportunity_id: opportunityId,
      problem,
      stopped_for_budget: true,
      external_cost_usd: state.externalCostUsd,
      external_cost_ceiling_usd: RESOLUTION_TOTAL_EXTERNAL_COST_CEILING_USD,
      exhaustion_certificate: certificate,
      owner_escalation_allowed: certificate.humanEscalationEligible,
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
    await applyResolutionLifecycleOutcome(opportunityId, result);
    res.status(200).json({
      opportunity_id: opportunityId,
      evaluation_cycle_id: state.cycle?.id ?? null,
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
