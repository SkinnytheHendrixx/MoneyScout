import { desc, eq, inArray, isNull } from "drizzle-orm";
import {
  db,
  discoveryCandidatesTable,
  evaluationCyclesTable,
  lifecycleEventsTable,
  opportunitiesTable,
  opportunityRuntimeStateTable,
  portfolioHeartbeatRunsTable,
  researchRunsTable,
  watchRegistrationsTable,
  type WatchBaseline,
  type WatchTriggerEvidence,
} from "@workspace/db";
import {
  ensureActiveEvaluationCycle,
  getActiveEvaluationCycle,
  recordLifecycleEvent,
  setOpportunityActivity,
  startNewEvaluationCycle,
} from "./lifecycle-state";

export const PORTFOLIO_HEARTBEAT_INTERVAL_MS = 15 * 60 * 1_000;
export const WATCH_RECHECK_INTERVAL_MS = 15 * 60 * 1_000;
export const STALE_RESEARCH_RUN_MS = 30 * 60 * 1_000;

const RESEARCH_QUEUE_ACTIVITY_KEYS = ["RESEARCH_QUEUED", "RESEARCH_BLOCKED_PROVIDER"];

type ResolutionRunNote = {
  opportunity_id?: number;
  problem?: string;
  unresolved_question?: string;
  method?: string;
  status?: string;
  summary?: string;
  watch_triggers?: string[];
};

type GenericRunNote = Record<string, unknown> & {
  opportunity_id?: number;
  opportunityId?: number;
  status?: string;
};

export type PortfolioReconcileResult = {
  heartbeatRunId: number;
  status: "COMPLETE" | "PARTIAL" | "FAILED";
  scannedOpportunityCount: number;
  watchesRegisteredCount: number;
  watchesCheckedCount: number;
  reactivatedOpportunityCount: number;
  staleRunsRecoveredCount: number;
  queuedResearchOpportunityIds: number[];
  errors: string[];
};

const parseObject = <T extends object>(value: string | null): Partial<T> => {
  if (!value) return {};
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed)
      ? parsed as Partial<T>
      : {};
  } catch {
    return {};
  }
};

const opportunityIdFromNote = (note: Partial<GenericRunNote>): number | null => {
  const value = note.opportunity_id ?? note.opportunityId;
  return typeof value === "number" && Number.isInteger(value) && value > 0 ? value : null;
};

const latestSnapshotId = (ids: number[]): number | null =>
  ids.length ? Math.max(...ids) : null;

function baselineFromCandidate(
  discoveryKey: string | null,
  candidate: typeof discoveryCandidatesTable.$inferSelect | undefined,
): WatchBaseline {
  if (!candidate) return { discoveryKey };
  return {
    discoveryKey,
    candidateId: candidate.id,
    occurrenceCount: candidate.occurrenceCount,
    latestSnapshotId: latestSnapshotId(candidate.sourceSnapshotIds),
    lastSeenAt: candidate.lastSeenAt.toISOString(),
    latestPriorityScore: candidate.latestPriorityScore,
    primaryAnomalyType: candidate.primaryAnomalyType,
    anomalyTags: candidate.anomalyTags,
  };
}

export function materialDiscoveryDelta(input: {
  baseline: WatchBaseline;
  candidate: typeof discoveryCandidatesTable.$inferSelect | undefined;
  now: Date;
}): WatchTriggerEvidence | null {
  const candidate = input.candidate;
  if (!candidate) return null;
  const oldSnapshotId = input.baseline.latestSnapshotId ?? 0;
  const newSnapshotId = latestSnapshotId(candidate.sourceSnapshotIds) ?? 0;
  const oldOccurrenceCount = input.baseline.occurrenceCount ?? 0;
  const hasNewObservation =
    newSnapshotId > oldSnapshotId || candidate.occurrenceCount > oldOccurrenceCount;
  const discoveryCallsItMaterial =
    candidate.primaryAnomalyType === "MATERIAL_SNAPSHOT_CHANGE" ||
    candidate.anomalyTags.includes("MATERIAL_SNAPSHOT_CHANGE");
  if (!hasNewObservation || !discoveryCallsItMaterial) return null;

  return {
    kind: "DISCOVERY_MATERIAL_SNAPSHOT_CHANGE",
    observedAt: input.now.toISOString(),
    summary: "Discovery observed a new material snapshot change after the opportunity entered WATCH.",
    metadata: {
      candidate_id: candidate.id,
      discovery_key: candidate.discoveryKey,
      previous_occurrence_count: oldOccurrenceCount,
      current_occurrence_count: candidate.occurrenceCount,
      previous_snapshot_id: oldSnapshotId || null,
      current_snapshot_id: newSnapshotId || null,
      primary_anomaly_type: candidate.primaryAnomalyType,
      anomaly_tags: candidate.anomalyTags,
      latest_priority_score: candidate.latestPriorityScore,
    },
  };
}

async function recoverStaleResearchRuns(now: Date): Promise<number> {
  const cutoff = now.getTime() - STALE_RESEARCH_RUN_MS;
  const runs = await db
    .select()
    .from(researchRunsTable)
    .where(isNull(researchRunsTable.finishedAt))
    .orderBy(desc(researchRunsTable.startedAt));

  let recovered = 0;
  for (const run of runs) {
    if (run.startedAt.getTime() >= cutoff) continue;
    const note = parseObject<GenericRunNote>(run.notes);
    const opportunityId = opportunityIdFromNote(note);
    if (!opportunityId) continue;
    await db
      .update(researchRunsTable)
      .set({
        finishedAt: now,
        notes: JSON.stringify({
          ...note,
          status: "INTERRUPTED_BY_PORTFOLIO_RECONCILER",
          interrupted_at: now.toISOString(),
          interruption_reason: "Run remained unfinished beyond the stale-run safety window.",
        }),
      })
      .where(eq(researchRunsTable.id, run.id));
    const cycle = await getActiveEvaluationCycle(opportunityId);
    await recordLifecycleEvent({
      opportunityId,
      evaluationCycleId: cycle?.id ?? null,
      eventType: "STALE_RUN_RECOVERED",
      summary: `Recovered stale ${run.triggerType} run ${run.id}; no paid retry was attempted.`,
      metadata: { research_run_id: run.id, trigger_type: run.triggerType },
      occurredAt: now,
    });
    recovered += 1;
  }
  return recovered;
}

function legacyCycleStart(firstSeen: string): Date {
  const parsed = new Date(`${firstSeen}T00:00:00.000Z`);
  return Number.isNaN(parsed.getTime()) ? new Date() : parsed;
}

async function ensureWatchForOpportunity(input: {
  opportunity: typeof opportunitiesTable.$inferSelect;
  activeCycleId: number | null;
  existingWatch: typeof watchRegistrationsTable.$inferSelect | undefined;
  resolutionNote: Partial<ResolutionRunNote> | undefined;
  candidate: typeof discoveryCandidatesTable.$inferSelect | undefined;
  now: Date;
}): Promise<typeof watchRegistrationsTable.$inferSelect | null> {
  if (input.existingWatch) return input.existingWatch;
  if (input.opportunity.verdict !== "WATCH") return null;

  const resolutionTriggers = Array.isArray(input.resolutionNote?.watch_triggers)
    ? input.resolutionNote?.watch_triggers.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : [];
  const triggerDescriptions = resolutionTriggers.length
    ? resolutionTriggers
    : input.opportunity.discoveryKey
      ? ["A new Discovery MATERIAL_SNAPSHOT_CHANGE is observed for this opportunity after WATCH registration."]
      : ["A new material evidence source or explicit temporal trigger must change the unresolved thesis before re-evaluation."];
  const reason = input.resolutionNote?.summary
    ?? input.resolutionNote?.unresolved_question
    ?? "Opportunity is on WATCH pending materially new evidence.";

  const [created] = await db
    .insert(watchRegistrationsTable)
    .values({
      opportunityId: input.opportunity.id,
      evaluationCycleId: input.activeCycleId,
      problem: input.resolutionNote?.problem ?? "UNSPECIFIED_WATCH",
      reason,
      triggerDescriptions,
      baseline: baselineFromCandidate(input.opportunity.discoveryKey, input.candidate),
      registeredAt: input.now,
      nextCheckAt: new Date(input.now.getTime() + WATCH_RECHECK_INTERVAL_MS),
    })
    .returning();

  if (!created) return null;
  await setOpportunityActivity(input.opportunity.id, {
    activeEvaluationCycleId: input.activeCycleId,
    currentActivityKey: "WATCH_MONITORING",
    currentActivityLabel: "Monitoring for material change",
    activityStatus: "WAITING",
    activityStartedAt: created.registeredAt,
    expectedDurationSeconds: null,
    stageIndex: null,
    stageCount: null,
    nextAction: "Reopen Research automatically only when a configured material signal changes.",
    etaBasis: "EVENT_DRIVEN_NO_FIXED_ETA",
    lastReconciledAt: input.now,
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: input.opportunity.id,
    evaluationCycleId: input.activeCycleId,
    eventType: "WATCH_REGISTERED",
    summary: reason,
    metadata: {
      problem: created.problem,
      trigger_descriptions: triggerDescriptions,
      baseline: created.baseline,
    },
    occurredAt: input.now,
  });
  return created;
}

async function reactivateWatch(input: {
  opportunity: typeof opportunitiesTable.$inferSelect;
  watch: typeof watchRegistrationsTable.$inferSelect;
  evidence: WatchTriggerEvidence;
  now: Date;
}) {
  await db
    .update(watchRegistrationsTable)
    .set({
      status: "TRIGGERED",
      lastCheckedAt: input.now,
      nextCheckAt: null,
      triggeredAt: input.now,
      triggerEvidence: input.evidence,
      checkCount: input.watch.checkCount + 1,
    })
    .where(eq(watchRegistrationsTable.id, input.watch.id));

  const cycle = await startNewEvaluationCycle({
    opportunityId: input.opportunity.id,
    triggerType: "WATCH_MATERIAL_SIGNAL_CHANGE",
    triggerReason: input.evidence.summary,
    triggerMetadata: input.evidence.metadata ?? {},
    startedAt: input.now,
  });
  await db
    .update(opportunitiesTable)
    .set({ verdict: "RESEARCH", policyStatus: "UNKNOWN", killReason: null })
    .where(eq(opportunitiesTable.id, input.opportunity.id));
  await setOpportunityActivity(input.opportunity.id, {
    activeEvaluationCycleId: cycle.id,
    currentActivityKey: "RESEARCH_QUEUED",
    currentActivityLabel: "Fresh research queued from WATCH signal",
    activityStatus: "WAITING",
    activityStartedAt: input.now,
    expectedDurationSeconds: 480,
    stageIndex: 0,
    stageCount: 3,
    nextAction: "Run a fresh Research cycle against the material delta; prior-cycle evidence remains historical context.",
    etaBasis: "STAGE_ESTIMATE_UNTIL_REAL_HISTORY",
    lastReconciledAt: input.now,
    lifecycleTransition: true,
  });
  await recordLifecycleEvent({
    opportunityId: input.opportunity.id,
    evaluationCycleId: cycle.id,
    eventType: "WATCH_REACTIVATED_TO_RESEARCH",
    summary: input.evidence.summary,
    metadata: input.evidence.metadata ?? {},
    occurredAt: input.now,
  });
  return cycle;
}

async function refreshStaticRuntimeState(input: {
  opportunity: typeof opportunitiesTable.$inferSelect;
  activeCycleId: number | null;
  runtime: typeof opportunityRuntimeStateTable.$inferSelect | undefined;
  now: Date;
}): Promise<void> {
  if (input.runtime?.activityStatus === "RUNNING") return;
  if (RESEARCH_QUEUE_ACTIVITY_KEYS.includes(input.runtime?.currentActivityKey ?? "")) {
    await setOpportunityActivity(input.opportunity.id, {
      activeEvaluationCycleId: input.activeCycleId,
      currentActivityKey: input.runtime?.currentActivityKey ?? "RESEARCH_QUEUED",
      currentActivityLabel: input.runtime?.currentActivityLabel ?? "Research queued",
      activityStatus: input.runtime?.activityStatus === "BLOCKED" ? "BLOCKED" : "WAITING",
      activityStartedAt: input.runtime?.activityStartedAt,
      expectedDurationSeconds: input.runtime?.expectedDurationSeconds,
      stageIndex: input.runtime?.stageIndex,
      stageCount: input.runtime?.stageCount,
      nextAction: input.runtime?.nextAction,
      etaBasis: input.runtime?.etaBasis,
      lastReconciledAt: input.now,
    });
    return;
  }

  const states: Record<string, {
    key: string;
    label: string;
    status: "IDLE" | "WAITING" | "COMPLETE";
    nextAction: string;
    etaBasis: string;
  }> = {
    NEW: {
      key: "AWAITING_ACCEPTANCE",
      label: "Awaiting opportunity acceptance",
      status: "WAITING",
      nextAction: "Accept the candidate before paid research begins.",
      etaBasis: "OWNER_DECISION",
    },
    RESEARCH: {
      key: "RESEARCH_PENDING",
      label: "Research pending",
      status: "WAITING",
      nextAction: "Continue the active Research cycle.",
      etaBasis: "STAGE_ESTIMATE_UNTIL_REAL_HISTORY",
    },
    WATCH: {
      key: "WATCH_MONITORING",
      label: "Monitoring for material change",
      status: "WAITING",
      nextAction: "Reopen automatically when a material Watch trigger fires.",
      etaBasis: "EVENT_DRIVEN_NO_FIXED_ETA",
    },
    TEST: {
      key: "VALIDATION_PENDING",
      label: "Validation pending",
      status: "WAITING",
      nextAction: "Continue underwriting or the cheapest falsifying experiment.",
      etaBasis: "STAGE_ESTIMATE_UNTIL_REAL_HISTORY",
    },
    BUILD: {
      key: "READY_FOR_INTERNAL_BUILD",
      label: "Ready for internal build",
      status: "COMPLETE",
      nextAction: "Hand the Monetization Execution Plan to the Build Orchestrator.",
      etaBasis: "NEXT_PHASE_NOT_STARTED",
    },
    KILL: {
      key: "OPPORTUNITY_CLOSED",
      label: "Opportunity closed",
      status: "COMPLETE",
      nextAction: "No action unless a future lifecycle rule explicitly reopens the thesis.",
      etaBasis: "NOT_APPLICABLE",
    },
  };
  const next = states[input.opportunity.verdict] ?? {
    key: "IDLE",
    label: "Idle",
    status: "IDLE" as const,
    nextAction: "Await the next lifecycle transition.",
    etaBasis: "NOT_APPLICABLE",
  };
  await setOpportunityActivity(input.opportunity.id, {
    activeEvaluationCycleId: input.activeCycleId,
    currentActivityKey: next.key,
    currentActivityLabel: next.label,
    activityStatus: next.status,
    activityStartedAt: input.runtime?.activityStartedAt ?? input.now,
    expectedDurationSeconds: null,
    stageIndex: null,
    stageCount: null,
    nextAction: next.nextAction,
    etaBasis: next.etaBasis,
    lastReconciledAt: input.now,
  });
}

export async function runPortfolioReconciliation(input: { now?: Date } = {}): Promise<PortfolioReconcileResult> {
  const now = input.now ?? new Date();
  const [heartbeat] = await db
    .insert(portfolioHeartbeatRunsTable)
    .values({ status: "RUNNING", startedAt: now })
    .returning();
  if (!heartbeat) throw new Error("Failed to create portfolio heartbeat run");

  const errors: string[] = [];
  let watchesRegisteredCount = 0;
  let watchesCheckedCount = 0;
  let reactivatedOpportunityCount = 0;
  let staleRunsRecoveredCount = 0;

  try {
    staleRunsRecoveredCount = await recoverStaleResearchRuns(now);
    const [opportunities, candidates, watches, runtimes, resolutionRuns] = await Promise.all([
      db.select().from(opportunitiesTable),
      db.select().from(discoveryCandidatesTable),
      db.select().from(watchRegistrationsTable).where(eq(watchRegistrationsTable.status, "ACTIVE")),
      db.select().from(opportunityRuntimeStateTable),
      db.select().from(researchRunsTable)
        .where(eq(researchRunsTable.triggerType, "AUTONOMOUS_RESOLUTION"))
        .orderBy(desc(researchRunsTable.startedAt)),
    ]);

    const candidateByKey = new Map(candidates.map((candidate) => [candidate.discoveryKey, candidate]));
    const watchByOpportunity = new Map(watches.map((watch) => [watch.opportunityId, watch]));
    const runtimeByOpportunity = new Map(runtimes.map((runtime) => [runtime.opportunityId, runtime]));
    const latestMonitoringResolution = new Map<number, Partial<ResolutionRunNote>>();
    for (const run of resolutionRuns) {
      const note = parseObject<ResolutionRunNote>(run.notes);
      if (
        typeof note.opportunity_id === "number" &&
        note.method === "WATCH_FOR_DELTA" &&
        note.status === "ACTIVE_MONITORING" &&
        !latestMonitoringResolution.has(note.opportunity_id)
      ) {
        latestMonitoringResolution.set(note.opportunity_id, note);
      }
    }

    for (const opportunity of opportunities) {
      try {
        let activeCycle = await getActiveEvaluationCycle(opportunity.id);
        if (!activeCycle) {
          activeCycle = await ensureActiveEvaluationCycle({
            opportunityId: opportunity.id,
            triggerType: "LEGACY_ADOPTION",
            triggerReason: "Adopt existing opportunity history into lifecycle-managed evaluation cycles.",
            triggerMetadata: { adopted_verdict: opportunity.verdict },
            startedAt: legacyCycleStart(opportunity.firstSeen),
          });
        }

        let watch = watchByOpportunity.get(opportunity.id);
        if (opportunity.verdict === "WATCH" && !watch) {
          watch = await ensureWatchForOpportunity({
            opportunity,
            activeCycleId: activeCycle.id,
            existingWatch: undefined,
            resolutionNote: latestMonitoringResolution.get(opportunity.id),
            candidate: opportunity.discoveryKey
              ? candidateByKey.get(opportunity.discoveryKey)
              : undefined,
            now,
          }) ?? undefined;
          if (watch) {
            watchByOpportunity.set(opportunity.id, watch);
            watchesRegisteredCount += 1;
          }
        }

        if (watch && opportunity.verdict === "WATCH") {
          const candidate = opportunity.discoveryKey
            ? candidateByKey.get(opportunity.discoveryKey)
            : undefined;
          const triggerEvidence = materialDiscoveryDelta({
            baseline: watch.baseline,
            candidate,
            now,
          });
          watchesCheckedCount += 1;
          if (triggerEvidence) {
            await reactivateWatch({ opportunity, watch, evidence: triggerEvidence, now });
            reactivatedOpportunityCount += 1;
            await db
              .update(watchRegistrationsTable)
              .set({ lastCheckedAt: now })
              .where(eq(watchRegistrationsTable.id, watch.id));
            continue;
          }
          await db
            .update(watchRegistrationsTable)
            .set({
              lastCheckedAt: now,
              nextCheckAt: new Date(now.getTime() + WATCH_RECHECK_INTERVAL_MS),
              checkCount: watch.checkCount + 1,
            })
            .where(eq(watchRegistrationsTable.id, watch.id));
        }

        await refreshStaticRuntimeState({
          opportunity,
          activeCycleId: activeCycle.id,
          runtime: runtimeByOpportunity.get(opportunity.id),
          now,
        });
      } catch (error) {
        errors.push(`Opportunity ${opportunity.id}: ${error instanceof Error ? error.message : "Unknown reconciliation error"}`);
      }
    }

    const queuedRows = await db
      .select({ opportunityId: opportunityRuntimeStateTable.opportunityId })
      .from(opportunityRuntimeStateTable)
      .where(inArray(opportunityRuntimeStateTable.currentActivityKey, RESEARCH_QUEUE_ACTIVITY_KEYS));
    const queuedResearchOpportunityIds = [...new Set(queuedRows.map((row) => row.opportunityId))];
    const status = errors.length ? "PARTIAL" as const : "COMPLETE" as const;

    await db
      .update(portfolioHeartbeatRunsTable)
      .set({
        status,
        finishedAt: new Date(),
        scannedOpportunityCount: opportunities.length,
        watchesRegisteredCount,
        watchesCheckedCount,
        reactivatedOpportunityCount,
        staleRunsRecoveredCount,
        researchQueueCount: queuedResearchOpportunityIds.length,
        errors,
      })
      .where(eq(portfolioHeartbeatRunsTable.id, heartbeat.id));

    return {
      heartbeatRunId: heartbeat.id,
      status,
      scannedOpportunityCount: opportunities.length,
      watchesRegisteredCount,
      watchesCheckedCount,
      reactivatedOpportunityCount,
      staleRunsRecoveredCount,
      queuedResearchOpportunityIds,
      errors,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown portfolio reconciliation failure";
    errors.push(message);
    await db
      .update(portfolioHeartbeatRunsTable)
      .set({ status: "FAILED", finishedAt: new Date(), errors })
      .where(eq(portfolioHeartbeatRunsTable.id, heartbeat.id));
    return {
      heartbeatRunId: heartbeat.id,
      status: "FAILED",
      scannedOpportunityCount: 0,
      watchesRegisteredCount,
      watchesCheckedCount,
      reactivatedOpportunityCount,
      staleRunsRecoveredCount,
      queuedResearchOpportunityIds: [],
      errors,
    };
  }
}

export async function latestPortfolioHeartbeat() {
  const [run] = await db
    .select()
    .from(portfolioHeartbeatRunsTable)
    .orderBy(desc(portfolioHeartbeatRunsTable.startedAt));
  return run ?? null;
}

export async function activeWatchForOpportunity(opportunityId: number) {
  const [watch] = await db
    .select()
    .from(watchRegistrationsTable)
    .where(eq(watchRegistrationsTable.opportunityId, opportunityId))
    .orderBy(desc(watchRegistrationsTable.registeredAt));
  return watch?.status === "ACTIVE" ? watch : null;
}

export async function opportunityLifecycleSnapshot(opportunityId: number) {
  const [opportunity] = await db
    .select()
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) return null;
  const [cycles, watches, runtime, events] = await Promise.all([
    db.select().from(evaluationCyclesTable)
      .where(eq(evaluationCyclesTable.opportunityId, opportunityId))
      .orderBy(desc(evaluationCyclesTable.cycleNumber)),
    db.select().from(watchRegistrationsTable)
      .where(eq(watchRegistrationsTable.opportunityId, opportunityId))
      .orderBy(desc(watchRegistrationsTable.registeredAt)),
    db.select().from(opportunityRuntimeStateTable)
      .where(eq(opportunityRuntimeStateTable.opportunityId, opportunityId)),
    db.select().from(lifecycleEventsTable)
      .where(eq(lifecycleEventsTable.opportunityId, opportunityId))
      .orderBy(desc(lifecycleEventsTable.occurredAt)),
  ]);
  return {
    opportunity,
    activeCycle: cycles.find((cycle) => cycle.status === "ACTIVE") ?? null,
    cycles,
    activeWatch: watches.find((watch) => watch.status === "ACTIVE") ?? null,
    watches,
    runtime: runtime[0] ?? null,
    events,
  };
}
