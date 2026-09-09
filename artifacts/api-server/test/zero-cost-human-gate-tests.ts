import assert from "node:assert/strict";
import {
  HUMAN_ACTION_NOTIFICATION_POLICY,
  capabilityIsUsable,
  humanGateCreationAllowed,
  resumeActionForResolutionProblem,
} from "../src/lib/human-gates";
import { validateResolutionWorkerResult } from "../src/lib/autonomous-resolution-workers";
import type { ExhaustionCertificate } from "../src/lib/autonomous-resolution-engine";

const issuedCertificate: ExhaustionCertificate = {
  schemaVersion: 1,
  problem: "DEMAND_UNCERTAINTY",
  issued: true,
  humanEscalationEligible: true,
  escalationType: "TRUE_JUDGMENT",
  unresolvedQuestion: "Authenticated marketplace data is the only material evidence path left.",
  completedMethods: [],
  exhaustedMethods: [
    "DIRECT_RESEARCH",
    "PROXY_RESEARCH",
    "ECONOMIC_INFERENCE",
    "ADVERSARIAL_REVIEW",
    "ALTERNATIVE_THESIS",
    "SAFE_EXPERIMENT",
    "WATCH_FOR_DELTA",
  ],
  activeMethods: [],
  blockingMethods: [],
  reason: "All applicable internal methods are exhausted.",
};

assert.equal(humanGateCreationAllowed({}), false);
assert.equal(humanGateCreationAllowed({ inherentlyHumanAuthority: true }), true);
assert.equal(humanGateCreationAllowed({ exhaustionCertificate: issuedCertificate }), true);
assert.equal(resumeActionForResolutionProblem("POLICY_AMBIGUITY"), "RUN_RESEARCH");
assert.equal(resumeActionForResolutionProblem("VALIDATION_WATCH"), "RUN_VALIDATION");
assert.equal(resumeActionForResolutionProblem("COMMERCIAL_PRICING_UNRESOLVED"), "RECHECK_MONETIZATION_PLAN");
assert.equal(capabilityIsUsable({ status: "AVAILABLE", expiresAt: null }), true);
assert.equal(capabilityIsUsable({ status: "MISSING", expiresAt: null }), false);
assert.equal(capabilityIsUsable({ status: "AVAILABLE", expiresAt: new Date(Date.now() - 1_000) }), false);
assert.equal(HUMAN_ACTION_NOTIFICATION_POLICY.CRITICAL.immediate, true);
assert.equal(HUMAN_ACTION_NOTIFICATION_POLICY.NORMAL.includeInDailySummary, true);

const parsed = validateResolutionWorkerResult("DIRECT_RESEARCH", {
  status: "EXHAUSTED",
  conclusion: "Public research was exhausted.",
  rationale: "The remaining seller economics are available only after authenticated seller access.",
  confidence: "HIGH",
  recommendation: "CONTINUE_RESOLUTION",
  findings: [],
  derived_bounds: [],
  watch_triggers: [],
  experiment: null,
  unresolved_questions: ["Seller dashboard economics remain inaccessible."],
  human_gate_candidate: {
    action_type: "CREATE_OR_CONNECT_PLATFORM_ACCOUNT",
    title: "Create or connect Example Market access",
    why_needed: "Authenticated seller economics remain material after public research.",
    instructions: "Create the account and confirm access without sharing a password.",
    blocked_stage: "AUTONOMOUS_RESOLUTION:DEMAND_UNCERTAINTY",
    required_capability_key: "example market seller access",
    provider: "Example Market",
    verification_mode: "HUMAN_ATTESTATION",
    urgency: "HIGH",
  },
});
assert.equal(parsed.humanGateCandidate?.actionType, "CREATE_OR_CONNECT_PLATFORM_ACCOUNT");
assert.equal(parsed.humanGateCandidate?.requiredCapabilityKey, "EXAMPLE_MARKET_SELLER_ACCESS");
assert.equal(parsed.humanGateCandidate?.urgency, "HIGH");

console.log("PASS zero-cost human gate tests");
