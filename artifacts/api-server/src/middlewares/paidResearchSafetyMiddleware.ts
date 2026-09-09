import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import {
  pilotSpendApproved,
  requiresExplicitPilotSpendApproval,
  runtimeFreshness,
} from "../lib/runtime-safety";

const PAID_ORCHESTRATION_PATH = /^\/opportunities\/(\d+)\/(?:research\/advance|validation\/advance)$/;

export async function requireSafePaidResearchRuntime(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  if (req.method !== "POST") {
    next();
    return;
  }

  const match = req.path.match(PAID_ORCHESTRATION_PATH);
  if (!match) {
    next();
    return;
  }

  if (runtimeFreshness() === "STALE") {
    res.status(503).json({
      error: "RUNTIME_STALE",
      message: "Paid research is blocked because the running build does not match MONEY_SCOUT_EXPECTED_COMMIT_SHA.",
    });
    return;
  }

  const opportunityId = Number(match[1]);
  const [opportunity] = await db
    .select({ name: opportunitiesTable.name })
    .from(opportunitiesTable)
    .where(eq(opportunitiesTable.id, opportunityId));
  if (!opportunity) {
    next();
    return;
  }

  if (
    requiresExplicitPilotSpendApproval(opportunity.name) &&
    !pilotSpendApproved(req.get("x-money-scout-allow-pilot-spend"))
  ) {
    res.status(409).json({
      error: "PILOT_SPEND_APPROVAL_REQUIRED",
      message:
        "This opportunity is labeled PILOT, SIMULATION, or TEST. Paid orchestration requires the explicit x-money-scout-allow-pilot-spend: true header.",
    });
    return;
  }

  next();
}
