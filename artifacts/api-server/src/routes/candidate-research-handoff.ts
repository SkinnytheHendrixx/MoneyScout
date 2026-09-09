import { eq, sql } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  db,
  discoveryCandidatesTable,
  discoveryObservationLinksTable,
  evidenceTable,
  opportunitiesTable,
} from "@workspace/db";
import {
  AcceptDiscoveryCandidateParams,
  AcceptDiscoveryCandidateResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

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
      const [existingOpportunity] = await tx
        .select({ id: opportunitiesTable.id, verdict: opportunitiesTable.verdict })
        .from(opportunitiesTable)
        .where(eq(opportunitiesTable.id, candidate.createdOpportunityId));
      if (existingOpportunity && existingOpportunity.verdict === "NEW") {
        await tx
          .update(opportunitiesTable)
          .set({ verdict: "RESEARCH" })
          .where(eq(opportunitiesTable.id, existingOpportunity.id));
      }
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
        verdict: "RESEARCH",
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

    if (opportunity.verdict === "NEW") {
      await tx
        .update(opportunitiesTable)
        .set({ verdict: "RESEARCH" })
        .where(eq(opportunitiesTable.id, opportunity.id));
    }

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

    return {
      kind: "accepted" as const,
      candidate: updatedCandidate,
      opportunityId: opportunity.id,
    };
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

export default router;
