import assert from "node:assert/strict";
import express from "express";
import React from "../../money-scout/node_modules/react/index.js";
import { renderToStaticMarkup } from "../../money-scout/node_modules/react-dom/server.js";
import { eq, inArray } from "drizzle-orm";
import {
  db,
  demandCheckResultsTable,
  evidenceTable,
  opportunitiesTable,
  researchRunsTable,
} from "@workspace/db";
import {
  setDemandMessagesClientFactoryForTests,
  MAX_SEARCH_USES,
} from "../src/routes/demand-checks";
import demandRouter from "../src/routes/demand-checks";
import {
  sources,
  schemaInvalid,
  sourceRejected,
  supported,
  unknownWithEvidence,
  unsupported,
  unsupportedWithInvalidRef,
  weak,
} from "./fixtures/demand-check-fixtures";
import {
  DemandCheckDetails,
  DemandCheckRunSummary,
  getDemandCheckErrorToast,
  invalidateDemandCheckQueries,
  isDemandCheckIntegrationUnavailable,
} from "../../money-scout/src/components/demand-checks";
import { filterEvidenceByDimension } from "../../money-scout/src/pages/opportunity-detail";
import { getDemandBadge } from "../../money-scout/src/components/badges";

const originalFetch = globalThis.fetch;
const inputCost = 0.000002;
const outputCost = 0.00001;
const searchCost = 0.01;

type Fixture = Record<string, unknown>;

const makeMessage = (parsed_output: unknown, searchCount = 2, inputTokens = 4_000) =>
  ({
    id: "msg_fixture",
    type: "message",
    role: "assistant",
    model: "claude-sonnet-4-5",
    stop_reason: "end_turn",
    stop_sequence: null,
    content: [
      {
        type: "web_search_tool_result",
        content: sources.map((source) => ({
          type: "web_search_result",
          url: source.url,
          title: source.title,
        })),
      },
    ],
    usage: {
      input_tokens: inputTokens,
      output_tokens: 300,
      server_tool_use: { web_search_requests: searchCount },
    },
    parsed_output,
  }) as any;

const fakeClient = (
  fixture: Fixture,
  searchCount = 2,
  inputTokens = 4_000,
) => ({
  parse: async (params: any) => {
    assert.equal(params.tools[0].name, "web_search");
    assert.equal(params.tools[0].max_uses, MAX_SEARCH_USES);
    assert.equal(params.output_config.format.type, "json_schema");
    return makeMessage(fixture, searchCount, inputTokens);
  },
});

const unavailableClient = (error: unknown) => ({
  parse: async () => {
    throw error;
  },
});

const createOpportunity = async (suffix: string) => {
  const [opportunity] = await db
    .insert(opportunitiesTable)
    .values({
      name: `Fixture Demand ${suffix}`,
      sourcePlatform: "Fixture Platform",
      sourceUrl: "https://example.test",
      opportunityType: "Fixture opportunity",
      thesis: "A fixture thesis for demand testing.",
      firstSeen: "2026-01-01",
      lastResearched: "2026-01-01",
      status: "Active",
      overallScore: 42,
      policyStatus: "UNKNOWN",
      verdict: "NEW",
      engineFamily: "fixture",
    })
    .returning();
  return opportunity.id;
};

const postDemandCheck = async (opportunityId: number, fixture: Fixture, options?: {
  searchCount?: number;
  inputTokens?: number;
}) => {
  setDemandMessagesClientFactoryForTests(() =>
    fakeClient(fixture, options?.searchCount ?? 2, options?.inputTokens ?? 4_000),
  );
  const response = await originalFetch(
    `http://127.0.0.1:${serverPort}/api/opportunities/${opportunityId}/demand-checks`,
    { method: "POST" },
  );
  assert.equal(response.status, 201);
  return response.json() as Promise<any>;
};

const cleanupOpportunity = async (opportunityId: number) => {
  const runs = await db
    .select({ id: demandCheckResultsTable.runId })
    .from(demandCheckResultsTable)
    .where(eq(demandCheckResultsTable.opportunityId, opportunityId));
  await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, opportunityId));
  if (runs.length > 0) {
    await db
      .delete(researchRunsTable)
      .where(inArray(researchRunsTable.id, runs.map((run) => run.id)));
  }
};

const testApp = express();
testApp.use(express.json());
testApp.use((req, _res, next) => {
  (req as any).log = { error: (...args: unknown[]) => console.error(...args) };
  next();
});
testApp.use("/api", demandRouter);

let serverPort = 0;
const server = testApp.listen(0);
await new Promise<void>((resolve) => {
  server.once("listening", () => {
    serverPort = (server.address() as { port: number }).port;
    resolve();
  });
});

globalThis.fetch = ((input: RequestInfo | URL, init?: RequestInit) => {
  const url = String(input);
  if (!url.startsWith("http://127.0.0.1:")) {
    throw new Error(`Unexpected network request in zero-cost test: ${url}`);
  }
  return originalFetch(input, init);
}) as typeof fetch;

const run = async (name: string, test: () => Promise<void>) => {
  try {
    await test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const checkConclusion = async (
  name: string,
  fixture: Fixture,
  expected: string,
) => {
  const opportunityId = await createOpportunity(name);
  try {
    const result = await postDemandCheck(opportunityId, fixture);
    assert.equal(result.demand_conclusion, expected);
    assert.equal(result.claude_call_count, 1);
    assert.ok(result.search_count <= 4);
    return { opportunityId, result };
  } catch (error) {
    await cleanupOpportunity(opportunityId);
    throw error;
  }
};

await run("SUPPORTED conclusion and evidence persistence", async () => {
  const { opportunityId, result } = await checkConclusion("supported", supported, "SUPPORTED");
  try {
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.opportunityId, opportunityId));
    assert.equal(evidence.length, 2);
    assert.ok(evidence.every((row) => row.researchRunId === result.run_id));
    const [opportunity] = await db
      .select({ score: opportunitiesTable.overallScore, verdict: opportunitiesTable.verdict })
      .from(opportunitiesTable)
      .where(eq(opportunitiesTable.id, opportunityId));
    assert.equal(opportunity.score, 42);
    assert.equal(opportunity.verdict, "NEW");
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("WEAK conclusion", async () => {
  const { opportunityId } = await checkConclusion("weak", weak, "WEAK");
  await cleanupOpportunity(opportunityId);
});

await run("UNKNOWN preserves valid evidence", async () => {
  const { opportunityId, result } = await checkConclusion(
    "unknown",
    unknownWithEvidence,
    "UNKNOWN",
  );
  try {
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 1);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("UNSUPPORTED requires and persists contradiction", async () => {
  const { opportunityId, result } = await checkConclusion("unsupported", unsupported, "UNSUPPORTED");
  try {
    assert.equal(result.contradicting_evidence_ids.length, 1);
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 2);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("invalid contradiction reference downgrades but preserves evidence", async () => {
  const { opportunityId, result } = await checkConclusion(
    "invalid-contradiction",
    unsupportedWithInvalidRef,
    "UNKNOWN",
  );
  try {
    assert.deepEqual(result.contradicting_evidence_ids, []);
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 2);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("schema-invalid provider response has no retry", async () => {
  const { opportunityId, result } = await checkConclusion("schema-invalid", schemaInvalid, "UNKNOWN");
  try {
    assert.equal(result.claude_call_count, 1);
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 0);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("unmatched source URLs are rejected", async () => {
  const { opportunityId, result } = await checkConclusion("source-rejected", sourceRejected, "UNKNOWN");
  try {
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 0);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("search and call limits are enforced", async () => {
  const { opportunityId, result } = await checkConclusion("limits", weak, "WEAK");
  try {
    assert.equal(result.claude_call_count, 1);
    assert.ok(result.search_count <= 4);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("provider over-reporting search use is contained", async () => {
  const opportunityId = await createOpportunity("over-search");
  try {
    const result = await postDemandCheck(opportunityId, weak, { searchCount: 5 });
    assert.equal(result.demand_conclusion, "UNKNOWN");
    assert.equal(result.claude_call_count, 1);
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 0);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("unavailable AI integration returns 503 without fake history", async () => {
  const opportunityId = await createOpportunity("integration-unavailable");
  try {
    setDemandMessagesClientFactoryForTests(() =>
      unavailableClient({
        status: 401,
        message: "401 ApiKeyNotApproved",
        error: { type: "oauth.v2.ApiKeyNotApproved" },
      }),
    );
    const response = await originalFetch(
      `http://127.0.0.1:${serverPort}/api/opportunities/${opportunityId}/demand-checks`,
      { method: "POST" },
    );
    assert.equal(response.status, 503);
    assert.deepEqual(await response.json(), {
      error: "AI_INTEGRATION_UNAVAILABLE",
      message: "The AI research integration is unavailable. No Demand Check was saved.",
    });

    const historyResponse = await originalFetch(
      `http://127.0.0.1:${serverPort}/api/opportunities/${opportunityId}/demand-checks`,
    );
    assert.equal(historyResponse.status, 200);
    assert.deepEqual(await historyResponse.json(), []);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("cost ceiling downgrades conclusion but preserves evidence", async () => {
  const opportunityId = await createOpportunity("cost");
  try {
    const result = await postDemandCheck(opportunityId, supported, {
      searchCount: 4,
      inputTokens: 240_000,
    });
    assert.equal(result.demand_conclusion, "UNKNOWN");
    const evidence = await db
      .select()
      .from(evidenceTable)
      .where(eq(evidenceTable.researchRunId, result.run_id));
    assert.equal(evidence.length, 2);
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("history returns completed runs newest first", async () => {
  const opportunityId = await createOpportunity("history");
  try {
    await postDemandCheck(opportunityId, weak);
    await postDemandCheck(opportunityId, unknownWithEvidence);
    const response = await originalFetch(
      `http://127.0.0.1:${serverPort}/api/opportunities/${opportunityId}/demand-checks`,
    );
    assert.equal(response.status, 200);
    const history = await response.json() as any[];
    assert.equal(history.length, 2);
    assert.equal(history[0].demand_conclusion, "UNKNOWN");
    assert.equal(history[1].demand_conclusion, "WEAK");
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("cost calculation uses mocked usage", async () => {
  const opportunityId = await createOpportunity("cost-math");
  try {
    const result = await postDemandCheck(opportunityId, supported, {
      searchCount: 4,
      inputTokens: 240_000,
    });
    const expected = 240_000 * inputCost + 300 * outputCost + 4 * searchCost;
    assert.equal(result.external_cost_usd, Number(expected.toFixed(4)));
    assert.equal(result.demand_conclusion, "UNKNOWN");
  } finally {
    await cleanupOpportunity(opportunityId);
  }
});

await run("UI renders all conclusions and metadata", async () => {
  const conclusions = ["SUPPORTED", "WEAK", "UNKNOWN", "UNSUPPORTED"];
  const badgeLabels: Record<string, string> = {
    SUPPORTED: "Supported",
    WEAK: "Weak",
    UNKNOWN: "Unknown",
    UNSUPPORTED: "Unsupported",
  };
  for (const conclusion of conclusions) {
    const check = {
      ...({
        ...unknownWithEvidence,
        id: 1,
        run_id: 1,
        opportunity_id: 1,
        started_at: "2026-01-01T00:00:00.000Z",
        finished_at: "2026-01-01T00:01:00.000Z",
        demand_conclusion: conclusion,
        contradicting_evidence_ids: conclusion === "UNSUPPORTED" ? [12] : [],
        search_count: 2,
        claude_call_count: 1,
        external_cost_usd: 0.12,
        ai_input_tokens: 100,
        ai_output_tokens: 200,
      }),
    } as any;
    const html = renderToStaticMarkup(
      <>
        <DemandCheckRunSummary check={check} />
        <DemandCheckDetails check={check} onShowEvidence={() => undefined} />
      </>,
    );
    assert.match(html, new RegExp(badgeLabels[conclusion]));
    assert.match(html, /Searches: 2/);
    assert.match(html, /Claude Calls: 1/);
  }
  const filtered = filterEvidenceByDimension(
    [
      { id: 1, evaluation_dimension: "external_demand" },
      { id: 2, evaluation_dimension: "commercial_value" },
    ],
    "commercial_value",
  );
  assert.deepEqual(filtered?.map((item) => item.id), [2]);
  assert.match(renderToStaticMarkup(getDemandBadge("UNKNOWN")), /Unknown/);
});

await run("UI distinguishes unavailable integration from successful completion", async () => {
  const error = {
    status: 503,
    data: {
      error: "AI_INTEGRATION_UNAVAILABLE",
      message: "The AI research integration is unavailable. No Demand Check was saved.",
    },
  };
  assert.equal(isDemandCheckIntegrationUnavailable(error), true);
  assert.deepEqual(getDemandCheckErrorToast(error), {
    title: "Demand check unavailable",
    description: "The AI research integration is unavailable. No Demand Check was saved.",
  });
  assert.deepEqual(getDemandCheckErrorToast({ status: 409 }), {
    title: "Demand check failed",
    description: "A check is already in progress.",
  });

  const invalidations: unknown[][] = [];
  invalidateDemandCheckQueries(
    {
      invalidateQueries: ({ queryKey }) => {
        invalidations.push([...queryKey]);
      },
    },
    42,
  );
  assert.deepEqual(invalidations, [
    ["/api/opportunities/42/demand-checks"],
    ["/api/opportunities/42/evidence"],
  ]);
});

setDemandMessagesClientFactoryForTests(null);
globalThis.fetch = originalFetch;
server.close();
console.log("All zero-cost Demand Check tests passed.");