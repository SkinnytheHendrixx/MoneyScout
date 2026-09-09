import type { NextFunction, Request, Response } from "express";
import { isInternalAutomationRequest } from "../lib/internal-automation-auth";

export const getAllowedUserIds = (): Set<string> =>
  new Set(
    (process.env.MONEY_SCOUT_ALLOWED_USER_IDS ?? "")
      .split(",")
      .map((value) => value.trim())
      .filter(Boolean),
  );

export const isMoneyScoutUserAllowed = (userId: string): boolean =>
  getAllowedUserIds().has(userId);

export function requireMoneyScoutAccess(req: Request, res: Response, next: NextFunction) {
  if (isInternalAutomationRequest(req)) {
    next();
    return;
  }
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }
  if (!isMoneyScoutUserAllowed(req.user.id)) {
    res.status(403).json({ error: "Money Scout access is not approved for this account" });
    return;
  }
  next();
}