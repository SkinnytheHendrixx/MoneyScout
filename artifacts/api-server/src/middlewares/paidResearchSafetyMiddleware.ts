import type { NextFunction, Request, Response } from "express";
import { eq } from "drizzle-orm";
import { db, opportunitiesTable } from "@workspace/db";
import { selectAnthropicProvider } from "../lib/anthropic-provider";
import { paidProviderPreflightAllows } from "../lib/startup-readiness";
import {
  pilotSpendApproved,
  requiresExplicitPilotSpendApproval,
  runtimeFreshness,
  unverifiedProviderSpendApproved,
} from "../lib/runtime-safety";

const PAID_ORCHESTRATION_PATH = /^\/opportunities\/(\d+)\/(?:research\/advance|validation\/advance|resolution\/advance)$/;

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

  const provider = selectAnthropicProvider();
  const allowUnverifiedProvider = unverifiedProviderSpendApproved(
    req.get("x-money-scout-allow-unverified-provider"),
  );
  if (!paidProviderPreflightAllows(provider.source, allowUnverifiedProvider)) {
    if (provider.source === "UNAVAILABLE") {
      res.status(503).json({
        error: "AI_PROVIDER_UNAVAILABLE",
        message: "Paid research is blocked because no Anthropic provider credential path is configured.",
      });
      return;
    }

    res.status(409).json({
      error: "AI_PROVIDER_UNVERIFIED",
      message:
        "Replit-managed Anthropic credentials are present but provider approval is unverified. Use a direct ANTHROPIC_API_KEY or explicitly approve one unverified-provider attempt with x-money-scout-allow-unverified-provider: true.",
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
