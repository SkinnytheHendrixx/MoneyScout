import { desc, eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  discoveryCandidatesTable,
  discoveryObservationLinksTable,
  discoveryRunsTable,
  evidenceTable,
  opportunitiesTable,
} from "@workspace/db";
import {
  AcceptDiscoveryCandidateParams,
  AcceptDiscoveryCandidateResponse,
  DismissDiscoveryCandidateParams,
  DismissDiscoveryCandidateResponse,
  GetDiscoveryRunParams,
  GetDiscoveryRunResponse,
  GetDiscoveryRunStatusParams,
  GetDiscoveryRunStatusResponse,
  ListDiscoveryCandidatesQueryParams,
  ListDiscoveryCandidatesResponse,
  ListDiscoveryRunsResponse,
  MarkDiscoveryCandidateDuplicateBody,
  MarkDiscoveryCandidateDuplicateParams,
  MarkDiscoveryCandidateDuplicateResponse,
  StartDiscoveryRunResponse,
  SuppressDiscoveryCandidateParams,
  SuppressDiscoveryCandidateResponse,
} from "@workspace/api-zod";
import {
  DISCOVERY_FORMULA_VERSION,
  DISCOVERY_MAX_RETRIES,
  DISCOVERY_NORMALIZATION_VERSION,
  DISCOVERY_PAGE_SIZE,
  DISCOVERY_PLATFORM_ALIAS_VERSION,
  DISCOVERY_PACING_MS,
  DISCOVERY_REQUEST_TIMEOUT_MS,
  clearDiscoveryStaging,
  discoveryQueryDefinition,
  finalizeStagedDiscoveryResult,
  fetchApifyStorePage,
  getActiveDiscoveryRun,
  reconcileStaleDiscoveryRuns,
  runDiscoveryConvergenceToStaging,
  type TraversalProgress,
} from "../lib/discovery";
import { logger } from "../lib/logger";

const router: IRouter = Router();
const activeRuns = new Set<number>();
let fetchDiscoveryPage = fetchApifyStorePage;
let finalizeDiscovery = finalizeStagedDiscoveryResult;
let discoveryRequestTimeoutMs = DISCOVERY_REQUEST_TIMEOUT_MS;
let discoveryMaxRetries = DISCOVERY_MAX_RETRIES;
let discoverySleep: ((milliseconds: number) => Promise<void>) | undefined;

export function setDiscoveryFetchPageForTests(
  fetchPage: typeof fetchApifyStorePage | null,
) {
  fetchDiscoveryPage = fetchPage ?? fetchApifyStorePage;
}

export function setDiscoveryFinalizeForTests(
  finalize: typeof finalizeStagedDiscoveryResult | null,
) {
  finalizeDiscovery = finalize ?? finalizeStagedDiscoveryResult;
}

export function setDiscoveryRequestTimeoutForTests(timeoutMs: number | null) {
  discoveryRequestTimeoutMs = timeoutMs ?? DISCOVERY_REQUEST_TIMEOUT_MS;
}

export function setDiscoveryMaxRetriesForTests(maxRetries: number | null) {
  discoveryMaxRetries = maxRetries ?? DISCOVERY_MAX_RETRIES;
}

export function setDiscoverySleepForTests(
  sleepFn: ((milliseconds: number) => Promise<void>) | null,
) {
  discoverySleep = sleepFn ?? undefined;
}

const toApiRun = (run: typeof discoveryRunsTable.$inferSelect) => ({
  id: run.id,
  source: run.source,
  status: run.status,
  coverage_status: run.coverageStatus,
  started_at: run.startedAt,
  finished_at: run.finishedAt,
  last_heartbeat_at: run.lastHeartbeatAt,
  page_size: run.pageSize,
  effective_page_size: run.effectivePageSize,
  pacing_ms: run.pacingMs,
  formula_version: run.formulaVersion,
  advertised_total: run.advertisedTotal,
  observed_total: run.observedTotal,
  expected_pages: run.expectedPages,
  pages_fetched: run.pagesFetched,
  current_offset: run.currentOffset,
    current_pass: run.currentPass,
    max_observed_total: run.maxObservedTotal,
  request_count: run.requestCount,
  retry_count: run.retryCount,
  unique_actor_count: run.uniqueActorCount,
  duplicate_actor_count: run.duplicateActorCount,
    pass1_only_count: run.pass1OnlyCount,
    pass2_only_count: run.pass2OnlyCount,
  cluster_count: run.clusterCount,
  candidate_count: run.candidateCount,
  error: run.error,
});

const toApiCandidate = (candidate: typeof discoveryCandidatesTable.$inferSelect) => ({
  id: candidate.id,
  discovery_key: candidate.discoveryKey,
  cluster_key: candidate.clusterKey,
  source_platform: candidate.sourcePlatform,
  category: candidate.category,
  primary_anomaly_type: candidate.primaryAnomalyType,
  anomaly_tags: candidate.anomalyTags,
  status: candidate.status,
  first_seen_at: candidate.firstSeenAt,
  last_seen_at: candidate.lastSeenAt,
  occurrence_count: candidate.occurrenceCount,
  latest_priority_score: candidate.latestPriorityScore,
  score_breakdown: candidate.scoreBreakdown,
  structure_observations: candidate.structureObservations,
  source_snapshot_ids: candidate.sourceSnapshotIds,
  created_opportunity_id: candidate.createdOpportunityId,
  duplicate_of_opportunity_id: candidate.duplicateOfOpportunityId,
});

const updateProgress = async (runId: number, progress: TraversalProgress) => {
  await db
    .update(discoveryRunsTable)
    .set({
      advertisedTotal: progress.total,
      expectedPages: Math.ceil(progress.total / progress.effectivePageSize),
      effectivePageSize: progress.effectivePageSize,
      pagesFetched: progress.pagesFetched,
      currentOffset: progress.offset,
      currentPass: progress.passNumber,
      maxObservedTotal: progress.maxObservedTotal,
      requestCount: progress.requestCount,
      retryCount: progress.retryCount,
      uniqueActorCount: progress.uniqueActorCount,
      duplicateActorCount: progress.duplicateActorCount,
      lastHeartbeatAt: new Date(),
    })
    .where(eq(discoveryRunsTable.id, runId));
};

async function executeDiscoveryRun(runId: number): Promise<void> {
  const controller = new AbortController();
  const markFailure = async (
    error: unknown,
    progress?: TraversalProgress,
    status: "FAILED" | "INCOMPLETE" = "FAILED",
  ) => {
    const message = error instanceof Error ? error.message : "Unknown discovery run failure";
    try {
      await clearDiscoveryStaging(runId);
    } catch (cleanupError) {
      logger.error({ err: cleanupError, runId }, "Failed to clear Discovery staging after failure");
    }
    const terminalValues = {
      status,
      coverageStatus: "INCOMPLETE" as const,
      finishedAt: new Date(),
      lastHeartbeatAt: new Date(),
      error: message,
      ...(progress
        ? {
            pagesFetched: progress.pagesFetched,
            currentOffset: progress.offset,
            currentPass: progress.passNumber,
            maxObservedTotal: progress.maxObservedTotal,
            requestCount: progress.requestCount,
            retryCount: progress.retryCount,
            uniqueActorCount: progress.uniqueActorCount,
            duplicateActorCount: progress.duplicateActorCount,
          }
        : {}),
    };
    try {
      await db
        .update(discoveryRunsTable)
        .set(terminalValues)
        .where(eq(discoveryRunsTable.id, runId));
    } catch (updateError) {
      logger.error(
        { err: updateError, runId, originalError: message },
        "Failed to persist terminal Discovery failure",
      );
      try {
        await db
          .update(discoveryRunsTable)
          .set({
            status: "FAILED",
            coverageStatus: "INCOMPLETE",
            finishedAt: new Date(),
            lastHeartbeatAt: new Date(),
            error: message,
          })
          .where(eq(discoveryRunsTable.id, runId));
      } catch (retryError) {
        logger.error({ err: retryError, runId }, "Retrying terminal Discovery failure failed");
      }
    }
  };
  try {
    const convergence = await runDiscoveryConvergenceToStaging(runId, {
      fetchPage: fetchDiscoveryPage,
      pageSize: DISCOVERY_PAGE_SIZE,
      pacingMs: DISCOVERY_PACING_MS,
      sleep: discoverySleep,
      requestTimeoutMs: discoveryRequestTimeoutMs,
      maxRetries: discoveryMaxRetries,
      signal: controller.signal,
      onProgress: (progress) => updateProgress(runId, progress),
    });
    if (!convergence.ok) {
      await db
        .update(discoveryRunsTable)
        .set({
          pass1OnlyCount: convergence.pass1OnlyCount,
          pass2OnlyCount: convergence.pass2OnlyCount,
        })
        .where(eq(discoveryRunsTable.id, runId));
      await markFailure(
        new Error(convergence.error),
        convergence.traversal.progress,
        convergence.traversal.progress.pagesFetched > 0 ? "INCOMPLETE" : "FAILED",
      );
      return;
    }
    await finalizeDiscovery(runId, convergence.traversal);
  } catch (error) {
    logger.error({ err: error, runId }, "Discovery run failed");
    await markFailure(error);
  } finally {
    controller.abort();
    activeRuns.delete(runId);
  }
}

router.get("/discovery/runs", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(discoveryRunsTable)
    .orderBy(desc(discoveryRunsTable.startedAt))
    .limit(20);
  res.json(ListDiscoveryRunsResponse.parse(rows.map(toApiRun)));
});

router.post("/discovery/runs", async (_req, res): Promise<void> => {
  const activeRun = await getActiveDiscoveryRun();
  if (activeRun) {
    res.status(409).json({ error: "Discovery run already active", run_id: activeRun.id });
    return;
  }
  const now = new Date();
  let run: typeof discoveryRunsTable.$inferSelect;
  try {
    [run] = await db
      .insert(discoveryRunsTable)
      .values({
        source: "APIFY_STORE",
        status: "RUNNING",
        coverageStatus: "UNKNOWN",
        startedAt: now,
        lastHeartbeatAt: now,
        queryDefinition: discoveryQueryDefinition(),
        pageSize: DISCOVERY_PAGE_SIZE,
        pacingMs: DISCOVERY_PACING_MS,
        formulaVersion: DISCOVERY_FORMULA_VERSION,
      normalizationVersion: DISCOVERY_NORMALIZATION_VERSION,
      platformAliasVersion: DISCOVERY_PLATFORM_ALIAS_VERSION,
      })
      .returning();
  } catch (error) {
    if ((error as { code?: string }).code === "23505") {
      res.status(409).json({ error: "Discovery run already active" });
      return;
    }
    throw error;
  }
  activeRuns.add(run.id);
  void executeDiscoveryRun(run.id);
  res.status(202).json(StartDiscoveryRunResponse.parse(toApiRun(run)));
});

async function findRun(runId: number) {
  const [run] = await db.select().from(discoveryRunsTable).where(eq(discoveryRunsTable.id, runId));
  return run;
}

router.get("/discovery/runs/:runId", async (req, res): Promise<void> => {
  const params = GetDiscoveryRunParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const run = await findRun(params.data.runId);
  if (!run) {
    res.status(404).json({ error: "Discovery run not found" });
    return;
  }
  res.json(GetDiscoveryRunResponse.parse(toApiRun(run)));
});

router.get("/discovery/runs/:runId/status", async (req, res): Promise<void> => {
  const params = GetDiscoveryRunStatusParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const run = await findRun(params.data.runId);
  if (!run) {
    res.status(404).json({ error: "Discovery run not found" });
    return;
  }
  res.json(GetDiscoveryRunStatusResponse.parse(toApiRun(run)));
});

router.get("/discovery/candidates", async (req, res): Promise<void> => {
  const query = ListDiscoveryCandidatesQueryParams.safeParse(req.query);
  if (!query.success) {
    res.status(400).json({ error: query.error.message });
    return;
  }
  const rows = await db
    .select()
    .from(discoveryCandidatesTable)
    .where(query.data.status ? eq(discoveryCandidatesTable.status, query.data.status) : undefined)
    .orderBy(desc(discoveryCandidatesTable.latestPriorityScore), desc(discoveryCandidatesTable.lastSeenAt));
  res.json(ListDiscoveryCandidatesResponse.parse(rows.map(toApiCandidate)));
});

router.post("/discovery/candidates/:candidateId/accept", async (req, res): Promise<void> => {
  const params = AcceptDiscoveryCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const result = await db.transaction(async (tx) => {
    const [candidate] = await tx
      .select()
      .from(discoveryCandidatesTable)
      .where(eq(discoveryCandidatesTable.id, params.data.candidateId));
    if (!candidate) return { kind: "not_found" as const };
    if (candidate.createdOpportunityId) {
      return {
        kind: "accepted" as const,
        candidate,
        opportunityId: candidate.createdOpportunityId,
      };
    }
    if (candidate.status === "SUPPRESSED" || candidate.status === "DUPLICATE") {
      return { kind: "conflict" as const };
    }
    const today = new Date().toISOString().slice(0, 10);
    const [created] = await tx
      .insert(opportunitiesTable)
      .values({
        name: `${candidate.category} discovery`,
        sourcePlatform: candidate.sourcePlatform,
        sourceUrl: `https://apify.com/store?category=${encodeURIComponent(candidate.category)}`,
        opportunityType: `Discovery: ${candidate.primaryAnomalyType}`,
        thesis: `Apify Store usage telemetry surfaced a ${candidate.primaryAnomalyType.replaceAll("_", " ").toLowerCase()} pattern in the ${candidate.category} cluster. This is a ranking heuristic only, not revenue, validated demand, or an opportunity-quality estimate.`,
        firstSeen: today,
        lastResearched: today,
        status: "Active",
        overallScore: 0,
        policyStatus: "UNKNOWN",
        verdict: "NEW",
        killReason: null,
        engineFamily: "APIFY_STORE_DISCOVERY",
        discoveryKey: candidate.discoveryKey,
      })
      .onConflictDoNothing({ target: opportunitiesTable.discoveryKey })
      .returning();
    const opportunity =
      created ??
      (await tx
        .select()
        .from(opportunitiesTable)
        .where(eq(opportunitiesTable.discoveryKey, candidate.discoveryKey)))[0];
    if (!opportunity) return { kind: "conflict" as const };
    const observedDate = new Date().toISOString().slice(0, 10);
    const structure = (candidate.structureObservations ?? {}) as Record<string, unknown>;
    const aggregateUsers30Days =
      typeof structure.aggregateTotalUsers30Days === "number"
        ? `${structure.aggregateTotalUsers30Days} reported 30-day users`
        : "30-day user telemetry unavailable";
    const observationSummary = `${structure.actorCount ?? "unknown"} Actors, ${structure.activeActorCount ?? "unknown"} active; ${aggregateUsers30Days}`;
    await tx
      .insert(evidenceTable)
      .values({
        claim: `Apify Store usage telemetry reported a ${candidate.primaryAnomalyType.replaceAll("_", " ").toLowerCase()} pattern for the ${candidate.category} cluster (${observationSummary}). This is observational telemetry, not revenue or validated buyer demand.`,
        sourceUrl: `https://apify.com/store?category=${encodeURIComponent(candidate.category)}`,
        sourceTitle: "Apify Store Discovery Scout",
        observedDate,
        classification: "FACT",
        opportunityId: opportunity.id,
        evaluationDimension: "discovery_scout",
        researchRunId: null,
      })
      .onConflictDoNothing({
        target: [
          evidenceTable.opportunityId,
          evidenceTable.evaluationDimension,
          evidenceTable.classification,
        ],
        where: sql`evidence.evaluation_dimension = 'discovery_scout' AND evidence.classification = 'FACT'`,
      });
    await tx
      .update(discoveryObservationLinksTable)
      .set({ opportunityId: opportunity.id })
      .where(eq(discoveryObservationLinksTable.candidateId, candidate.id));
    const [updatedCandidate] = await tx
      .update(discoveryCandidatesTable)
      .set({
        status: "ACCEPTED",
        createdOpportunityId: opportunity.id,
        lastSeenAt: new Date(),
      })
      .where(eq(discoveryCandidatesTable.id, candidate.id))
      .returning();
    return { kind: "accepted" as const, candidate: updatedCandidate, opportunityId: opportunity.id };
  });
  if (result.kind === "not_found") {
    res.status(404).json({ error: "Discovery candidate not found" });
    return;
  }
  if (result.kind === "conflict") {
    res.status(409).json({ error: "Candidate cannot be accepted" });
    return;
  }
  res.json(
    AcceptDiscoveryCandidateResponse.parse({
      candidate: toApiCandidate(result.candidate),
      opportunity_id: result.opportunityId,
    }),
  );
});

async function changeCandidateStatus(
  candidateId: number,
  status: "DISMISSED" | "SUPPRESSED",
) {
  const [candidate] = await db
    .update(discoveryCandidatesTable)
    .set({ status, lastSeenAt: new Date() })
    .where(eq(discoveryCandidatesTable.id, candidateId))
    .returning();
  return candidate;
}

router.post("/discovery/candidates/:candidateId/dismiss", async (req, res): Promise<void> => {
  const params = DismissDiscoveryCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const candidate = await changeCandidateStatus(params.data.candidateId, "DISMISSED");
  if (!candidate) {
    res.status(404).json({ error: "Discovery candidate not found" });
    return;
  }
  res.json(DismissDiscoveryCandidateResponse.parse(toApiCandidate(candidate)));
});

router.post("/discovery/candidates/:candidateId/suppress", async (req, res): Promise<void> => {
  const params = SuppressDiscoveryCandidateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const candidate = await changeCandidateStatus(params.data.candidateId, "SUPPRESSED");
  if (!candidate) {
    res.status(404).json({ error: "Discovery candidate not found" });
    return;
  }
  res.json(SuppressDiscoveryCandidateResponse.parse(toApiCandidate(candidate)));
});

router.post("/discovery/candidates/:candidateId/duplicate", async (req, res): Promise<void> => {
  const params = MarkDiscoveryCandidateDuplicateParams.safeParse(req.params);
  const body = MarkDiscoveryCandidateDuplicateBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [opportunity] = await db
    .select({ id: opportunitiesTable.id })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, body.data.opportunity_id));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const [candidate] = await db
    .update(discoveryCandidatesTable)
    .set({
      status: "DUPLICATE",
      duplicateOfOpportunityId: opportunity.id,
      lastSeenAt: new Date(),
    })
    .where(eq(discoveryCandidatesTable.id, params.data.candidateId))
    .returning();
  if (!candidate) {
    res.status(404).json({ error: "Discovery candidate not found" });
    return;
  }
  res.json(MarkDiscoveryCandidateDuplicateResponse.parse(toApiCandidate(candidate)));
});

export async function reconcileDiscoveryRunsOnStartup() {
  await reconcileStaleDiscoveryRuns();
}

export default router;