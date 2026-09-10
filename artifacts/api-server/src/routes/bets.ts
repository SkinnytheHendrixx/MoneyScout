import { and, desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  betCostAttributionsTable,
  betEventsTable,
  betsTable,
  buildJobsTable,
  db,
  evaluationCyclesTable,
  opportunitiesTable,
  type BetBuildEnvelope,
  type BetDecisionContract,
  type BetResourceEnvelope,
  type BetStatus,
} from "@workspace/db";
import { isDeepStrictEqual } from "node:util";
import {
  approvalRequiresHumanCapitalAuthority,
  assertBetTransition,
  BET_DOES_NOT_GRANT_AUTHORITY,
  validateBetBuildEnvelope,
  validateBetDecisionContract,
  validateBetResourceEnvelope,
} from "../lib/bet-kernel";
import {
  capabilityIsUsable,
  createOrReuseHumanAction,
  getCapability,
} from "../lib/human-gates";

const router: IRouter = Router();
const ACTIVE_STATES: BetStatus[] = ["APPROVED", "ACTIVE", "PAUSED"];

function normalizeResources(input: BetResourceEnvelope): BetResourceEnvelope {
  const names = [
    "externalCash",
    "providerServices",
    "research",
    "build",
    "release",
    "experiment",
    "operations",
    "autonomousCapacity",
    "humanDependencyBurden",
  ] as const;
  const result = { ...input, accountingAsOf: null };
  for (const name of names)
    result[name] = {
      ...input[name],
      committed: 0,
      consumed: 0,
      remaining: input[name].allocated,
    };
  return result;
}

function allocationContract(envelope: BetResourceEnvelope) {
  return Object.fromEntries(
    Object.entries(envelope)
      .filter(([key]) => key !== "accountingAsOf")
      .map(([key, value]) => [
        key,
        value && typeof value === "object" && "allocated" in value
          ? { allocated: value.allocated, unit: value.unit }
          : value,
      ]),
  );
}

export async function createBetProposal(input: {
  opportunityId: number;
  evaluationCycleId: number | null;
  idempotencyKey: string;
  decisionContract: BetDecisionContract;
  resourceEnvelope: BetResourceEnvelope;
  buildEnvelope: BetBuildEnvelope;
}) {
  const errors = [
    ...validateBetDecisionContract(input.decisionContract),
    ...validateBetResourceEnvelope(input.resourceEnvelope),
    ...validateBetBuildEnvelope(input.buildEnvelope),
  ];
  const buildAllocation = input.resourceEnvelope?.build?.allocated;
  const cashAllocation = input.resourceEnvelope?.externalCash?.allocated;
  const monetaryAllocations = [
    input.resourceEnvelope?.providerServices?.allocated,
    input.resourceEnvelope?.research?.allocated,
    buildAllocation,
    input.resourceEnvelope?.release?.allocated,
    input.resourceEnvelope?.experiment?.allocated,
    input.resourceEnvelope?.operations?.allocated,
  ].filter((value): value is number => value != null);
  if (monetaryAllocations.some((value) => value > 0) && cashAllocation == null)
    errors.push(
      "A positive monetary bucket requires an explicit external cash allocation",
    );
  if (
    cashAllocation != null &&
    monetaryAllocations.some((value) => value > cashAllocation)
  )
    errors.push(
      "A monetary resource bucket cannot exceed the total external cash allocation",
    );
  const serviceAllocation = input.resourceEnvelope?.providerServices?.allocated;
  if (
    serviceAllocation != null &&
    input.buildEnvelope?.allowedExternalServiceBudgetCents > serviceAllocation
  )
    errors.push(
      "Build Envelope external-service budget exceeds the allocated provider-service budget",
    );
  if (
    buildAllocation != null &&
    input.buildEnvelope?.maximumExternalBuildSpendCents > buildAllocation
  )
    errors.push("Build Envelope exceeds the allocated build budget");
  if (
    cashAllocation != null &&
    input.buildEnvelope?.maximumExternalBuildSpendCents > cashAllocation
  )
    errors.push("Build Envelope exceeds the allocated external cash budget");
  if (
    input.buildEnvelope?.onlyExistingZeroCashCapabilities &&
    (input.buildEnvelope.maximumExternalBuildSpendCents > 0 ||
      input.buildEnvelope.allowedExternalServiceBudgetCents > 0)
  )
    errors.push(
      "A zero-cash-only Build Envelope cannot allocate external spend",
    );
  if (errors.length)
    throw new Error(`INVALID_BET_CONTRACT:${errors.join("; ")}`);
  const [opportunity] = await db
    .select({ id: opportunitiesTable.id, verdict: opportunitiesTable.verdict })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, input.opportunityId));
  if (!opportunity) throw new Error("OPPORTUNITY_NOT_FOUND");
  if (opportunity.verdict !== "BUILD")
    throw new Error("BET_REQUIRES_BUILD_UNDERWRITING_VERDICT");
  if (
    input.decisionContract.underwritingReference.evaluationCycleId !==
    input.evaluationCycleId
  )
    throw new Error("BET_UNDERWRITING_REFERENCE_MISMATCH");
  if (input.evaluationCycleId != null) {
    const [cycle] = await db
      .select({ id: evaluationCyclesTable.id })
      .from(evaluationCyclesTable)
      .where(
        and(
          eq(evaluationCyclesTable.id, input.evaluationCycleId),
          eq(evaluationCyclesTable.opportunityId, input.opportunityId),
        ),
      );
    if (!cycle) throw new Error("BET_EVALUATION_CYCLE_MISMATCH");
  }
  const resources = normalizeResources(input.resourceEnvelope);
  const now = new Date();
  const [created] = await db
    .insert(betsTable)
    .values({
      opportunityId: input.opportunityId,
      evaluationCycleId: input.evaluationCycleId,
      idempotencyKey: input.idempotencyKey,
      status: "PROPOSED",
      decisionContract: input.decisionContract,
      resourceEnvelope: resources,
      buildEnvelope: input.buildEnvelope,
      primaryRisk:
        input.decisionContract.keyRisks[0] ??
        input.decisionContract.unknowns[0] ??
        null,
      nextAction:
        "Review the explicit resource envelope and approve or withdraw this Bet.",
      allocatedExternalCashCents: resources.externalCash.allocated,
      remainingExternalCashCents: resources.externalCash.allocated,
      updatedAt: now,
    })
    .onConflictDoNothing({ target: betsTable.idempotencyKey })
    .returning();
  const bet =
    created ??
    (
      await db
        .select()
        .from(betsTable)
        .where(eq(betsTable.idempotencyKey, input.idempotencyKey))
    )[0];
  if (!bet) throw new Error("BET_PROPOSAL_IDEMPOTENCY_RECOVERY_FAILED");
  if (
    !created &&
    (bet.opportunityId !== input.opportunityId ||
      !isDeepStrictEqual(bet.decisionContract, input.decisionContract) ||
      !isDeepStrictEqual(bet.buildEnvelope, input.buildEnvelope) ||
      !isDeepStrictEqual(
        allocationContract(bet.resourceEnvelope),
        allocationContract(resources),
      ))
  )
    throw new Error("BET_IDEMPOTENCY_KEY_CONFLICT");
  if (created)
    await db.insert(betEventsTable).values({
      betId: bet.id,
      opportunityId: bet.opportunityId,
      eventType: "BET_PROPOSED",
      summary:
        "A bounded Bet was proposed; no capital or side-effect authority was granted.",
      metadata: {
        authority_grants: BET_DOES_NOT_GRANT_AUTHORITY,
        external_cash_allocated_cents: bet.allocatedExternalCashCents,
      },
    });
  return { bet, reused: !created };
}

export const scopedBetCapitalCapabilityKey = (
  betId: number,
  cents: number | null,
): string =>
  `CAPITAL_ALLOCATION_AUTHORITY:BET:${betId}:${cents == null ? "UNKNOWN" : cents}`;

async function capitalAuthorityCovers(
  bet: typeof betsTable.$inferSelect,
): Promise<boolean> {
  const scoped = await getCapability(
    scopedBetCapitalCapabilityKey(bet.id, bet.allocatedExternalCashCents),
  );
  if (scoped && capabilityIsUsable(scoped)) return true;
  const capability = await getCapability("CAPITAL_ALLOCATION_AUTHORITY");
  if (!capability || !capabilityIsUsable(capability)) return false;
  const maximum = Number(capability.metadata.maximum_external_cash_cents);
  return (
    Number.isInteger(maximum) &&
    maximum >= (bet.allocatedExternalCashCents ?? 0)
  );
}

export async function approveBet(input: {
  betId: number;
  authorizedBy?: string | null;
}) {
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, input.betId));
  if (!bet) return { kind: "NOT_FOUND" as const };
  if (bet.status === "APPROVED" || bet.status === "ACTIVE")
    return { kind: "APPROVED" as const, bet, reused: true };
  if (bet.status !== "PROPOSED") return { kind: "INVALID_STATE" as const, bet };
  const humanAuthorityRequired = approvalRequiresHumanCapitalAuthority(
    bet.resourceEnvelope,
  );
  const covered =
    !humanAuthorityRequired ||
    Boolean(input.authorizedBy?.trim()) ||
    (await capitalAuthorityCovers(bet));
  if (!covered) {
    await db
      .update(betsTable)
      .set({
        blockerCode: "CAPITAL_ALLOCATION_AUTHORITY_REQUIRED",
        nextAction:
          "Grant authority for this exact bounded capital allocation, or withdraw the Bet.",
        updatedAt: new Date(),
      })
      .where(eq(betsTable.id, bet.id));
    const gate = await createOrReuseHumanAction({
      opportunityId: bet.opportunityId,
      actionType: "AUTHORIZE_BET_CAPITAL_ALLOCATION",
      title: "Authorize bounded Bet capital",
      whyNeeded: `Bet ${bet.id} proposes up to ${bet.allocatedExternalCashCents ?? "unknown"} cents of owner capital. Money Scout has no verified policy covering that commitment.`,
      instructions:
        "Approve only the displayed Bet envelope or configure a bounded CAPITAL_ALLOCATION_AUTHORITY capability. This does not authorize provider calls, charging, release, outbound, ads, credentials, domains, or other spend.",
      blockedStage: `BET_APPROVAL:${bet.id}`,
      requiredCapabilityKey: scopedBetCapitalCapabilityKey(
        bet.id,
        bet.allocatedExternalCashCents,
      ),
      provider: "OWNER_POLICY",
      verificationMode: "HUMAN_ATTESTATION",
      urgency: "NORMAL",
      resumeAction: "NO_AUTOMATIC_RESUME",
      resumePayload: {
        bet_id: bet.id,
        maximum_external_cash_cents: bet.allocatedExternalCashCents,
      },
      inherentlyHumanAuthority: true,
    });
    return {
      kind: "AUTHORITY_REQUIRED" as const,
      bet,
      humanAction: gate.action,
    };
  }
  const now = new Date();
  const approvedBy =
    input.authorizedBy?.trim() ||
    (humanAuthorityRequired
      ? "CAPITAL_ALLOCATION_AUTHORITY"
      : "ZERO_CASH_POLICY");
  const [updated] = await db
    .update(betsTable)
    .set({
      status: "APPROVED",
      approvedAt: now,
      approvedBy,
      blockerCode: null,
      nextAction:
        "Initiate the bounded Build through the existing Build Orchestrator.",
      updatedAt: now,
    })
    .where(and(eq(betsTable.id, bet.id), eq(betsTable.status, "PROPOSED")))
    .returning();
  if (!updated) return approveBet(input);
  await db.insert(betEventsTable).values({
    betId: updated.id,
    opportunityId: updated.opportunityId,
    eventType: "BET_APPROVED",
    summary:
      "The Bet resource envelope was approved without granting downstream side-effect authority.",
    metadata: {
      approved_by: approvedBy,
      authority_grants: BET_DOES_NOT_GRANT_AUTHORITY,
    },
  });
  return { kind: "APPROVED" as const, bet: updated, reused: false };
}

export async function transitionBet(input: {
  betId: number;
  target: BetStatus;
  reason: string;
}) {
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, input.betId));
  if (!bet) return null;
  assertBetTransition(bet.status, input.target);
  const now = new Date();
  const [updated] = await db
    .update(betsTable)
    .set({
      status: input.target,
      blockerCode:
        input.target === "PAUSED"
          ? "BET_PAUSED"
          : input.target === "WITHDRAWN"
            ? "BET_WITHDRAWN"
            : null,
      nextAction:
        input.target === "PAUSED"
          ? "Resume or withdraw after reviewing the Bet evidence and envelope."
          : input.target === "WITHDRAWN" || input.target === "SUCCEEDED"
            ? "No new downstream work may begin."
            : "Continue within the approved envelope.",
      completedAt:
        input.target === "WITHDRAWN" || input.target === "SUCCEEDED"
          ? now
          : null,
      updatedAt: now,
    })
    .where(eq(betsTable.id, bet.id))
    .returning();
  if (!updated) throw new Error("BET_TRANSITION_FAILED");
  await db.insert(betEventsTable).values({
    betId: updated.id,
    opportunityId: updated.opportunityId,
    eventType: `BET_${input.target}`,
    summary: input.reason,
    metadata: { from_status: bet.status, to_status: input.target },
  });
  return updated;
}

router.get("/bets", async (req, res): Promise<void> => {
  const status =
    typeof req.query.status === "string"
      ? req.query.status.toUpperCase()
      : null;
  const rows = await db
    .select()
    .from(betsTable)
    .where(
      status &&
        [
          "PROPOSED",
          "APPROVED",
          "ACTIVE",
          "PAUSED",
          "SUCCEEDED",
          "WITHDRAWN",
          "EXHAUSTED",
        ].includes(status)
        ? eq(betsTable.status, status as BetStatus)
        : undefined,
    )
    .orderBy(desc(betsTable.updatedAt));
  const ids = rows.map((row) => row.id);
  const builds = ids.length
    ? await db
        .select({
          id: buildJobsTable.id,
          betId: buildJobsTable.betId,
          status: buildJobsTable.status,
          productShape: buildJobsTable.productShape,
        })
        .from(buildJobsTable)
        .where(inArray(buildJobsTable.betId, ids))
    : [];
  res.status(200).json({
    bets: rows.map((bet) => ({
      ...bet,
      authority_grants: BET_DOES_NOT_GRANT_AUTHORITY,
      downstream_builds: builds.filter((build) => build.betId === bet.id),
    })),
  });
});

router.get("/bets/:betId", async (req, res): Promise<void> => {
  const betId = Number(req.params.betId);
  const [bet] = await db
    .select()
    .from(betsTable)
    .where(eq(betsTable.id, betId));
  if (!bet) {
    res.status(404).json({ error: "Bet not found" });
    return;
  }
  const [events, attributions, builds] = await Promise.all([
    db
      .select()
      .from(betEventsTable)
      .where(eq(betEventsTable.betId, betId))
      .orderBy(desc(betEventsTable.occurredAt)),
    db
      .select()
      .from(betCostAttributionsTable)
      .where(eq(betCostAttributionsTable.betId, betId)),
    db.select().from(buildJobsTable).where(eq(buildJobsTable.betId, betId)),
  ]);
  res.status(200).json({
    bet,
    authority_grants: BET_DOES_NOT_GRANT_AUTHORITY,
    events,
    cost_attributions: attributions,
    downstream_builds: builds,
  });
});

router.post(
  "/opportunities/:opportunityId/bets",
  async (req, res): Promise<void> => {
    try {
      const opportunityId = Number(req.params.opportunityId);
      const result = await createBetProposal({
        opportunityId,
        evaluationCycleId:
          req.body?.evaluation_cycle_id == null
            ? null
            : Number(req.body.evaluation_cycle_id),
        idempotencyKey: String(
          req.body?.idempotency_key ??
            `opportunity-${opportunityId}:bet:${req.body?.evaluation_cycle_id ?? "none"}:v1`,
        ),
        decisionContract: req.body?.decision_contract,
        resourceEnvelope: req.body?.resource_envelope,
        buildEnvelope: req.body?.build_envelope,
      });
      res.status(result.reused ? 200 : 201).json(result);
    } catch (error) {
      res.status(400).json({
        error: error instanceof Error ? error.message : "BET_PROPOSAL_FAILED",
      });
    }
  },
);

router.post("/bets/:betId/approve", async (req, res): Promise<void> => {
  const result = await approveBet({
    betId: Number(req.params.betId),
    authorizedBy:
      typeof req.body?.authorized_by === "string"
        ? req.body.authorized_by
        : null,
  });
  if (result.kind === "NOT_FOUND") {
    res.status(404).json({ error: "Bet not found" });
    return;
  }
  if (result.kind === "AUTHORITY_REQUIRED") {
    res
      .status(409)
      .json({ error: "CAPITAL_ALLOCATION_AUTHORITY_REQUIRED", ...result });
    return;
  }
  if (result.kind === "INVALID_STATE") {
    res.status(409).json({ error: "BET_NOT_PROPOSED", bet: result.bet });
    return;
  }
  res.status(200).json(result);
});

router.post("/bets/:betId/transition", async (req, res): Promise<void> => {
  try {
    const target = String(req.body?.target ?? "") as BetStatus;
    if (
      !ACTIVE_STATES.includes(target) &&
      !["SUCCEEDED", "WITHDRAWN"].includes(target)
    )
      throw new Error("INVALID_BET_TARGET");
    const bet = await transitionBet({
      betId: Number(req.params.betId),
      target,
      reason: String(req.body?.reason ?? `Bet transitioned to ${target}.`),
    });
    if (!bet) {
      res.status(404).json({ error: "Bet not found" });
      return;
    }
    res.status(200).json({ bet });
  } catch (error) {
    res.status(409).json({
      error: error instanceof Error ? error.message : "BET_TRANSITION_FAILED",
    });
  }
});

export default router;
