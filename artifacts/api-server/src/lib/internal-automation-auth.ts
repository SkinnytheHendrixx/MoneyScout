import { randomBytes, timingSafeEqual } from "node:crypto";
import type { Request } from "express";

const INTERNAL_AUTOMATION_HEADER = "x-money-scout-internal-automation";
const internalAutomationSecret = randomBytes(32).toString("hex");

export function internalAutomationHeaders(): Record<string, string> {
  return { [INTERNAL_AUTOMATION_HEADER]: internalAutomationSecret };
}

export function isInternalAutomationRequest(req: Request): boolean {
  const supplied = req.get(INTERNAL_AUTOMATION_HEADER);
  if (!supplied) return false;
  const expected = Buffer.from(internalAutomationSecret);
  const actual = Buffer.from(supplied);
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
