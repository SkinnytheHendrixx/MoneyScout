import assert from "node:assert/strict";
import {
  evaluateKillScreen,
  runExistingResearchEvidenceWorkers,
} from "../src/lib/evidence-workers";

const strongContext = {
  policyStatus: "GREEN" as const,
  demandConclusion: "SUPPORTED" as const,
  buyerIdentified: "true" as const,
  buyerDescription: "Operations teams",
  recurringUsageSignal: "yes" as const,
  recurringUsageBasis: "Recurring workflow evidence",
  existingPaidAnalogFound: true,
  paidAnalogNames: ["Paid Competitor A"],
};

const strongEvidence = runExistingResearchEvidenceWorkers(strongContext);
assert.ok(strongEvidence.some((item) => item.family === "MONETARY"));
assert.ok(strongEvidence.some((item) => item.ladderRung === "REPEAT_USAGE"));
assert.ok(strongEvidence.some((item) => item.dimension === "buyer_clarity"));
const strongKillScreen = evaluateKillScreen(strongContext, strongEvidence);
assert.equal(strongKillScreen.overall, "INCOMPLETE");
assert.equal(
  strongKillScreen.assessments.find((item) => item.killClass === "NO_MONETIZATION_PATH")?.status,
  "CLEAR",
);
assert.equal(
  strongKillScreen.assessments.find((item) => item.killClass === "LEGAL_OR_COMPLIANCE_BLOCK")?.status,
  "CLEAR",
);
assert.ok(strongKillScreen.unknownKills.includes("PLATFORM_OWNER_THREAT"));

const redContext = {
  ...strongContext,
  policyStatus: "RED" as const,
};
const redEvidence = runExistingResearchEvidenceWorkers(redContext);
const redScreen = evaluateKillScreen(redContext, redEvidence);
assert.equal(redScreen.overall, "BLOCKED");
assert.ok(redScreen.confirmedKills.includes("LEGAL_OR_COMPLIANCE_BLOCK"));

const noDemandContext = {
  policyStatus: "GREEN" as const,
  demandConclusion: "UNSUPPORTED" as const,
  buyerIdentified: "false" as const,
  recurringUsageSignal: "no" as const,
  existingPaidAnalogFound: false,
  paidAnalogNames: [],
};
const noDemandEvidence = runExistingResearchEvidenceWorkers(noDemandContext);
const noDemandScreen = evaluateKillScreen(noDemandContext, noDemandEvidence);
assert.equal(noDemandScreen.overall, "BLOCKED");
assert.ok(noDemandScreen.confirmedKills.includes("NO_MONETIZATION_PATH"));

const unknownContext = {
  policyStatus: "UNKNOWN" as const,
  demandConclusion: "UNKNOWN" as const,
  buyerIdentified: "unknown" as const,
  recurringUsageSignal: "unknown" as const,
  existingPaidAnalogFound: false,
  paidAnalogNames: [],
};
const unknownEvidence = runExistingResearchEvidenceWorkers(unknownContext);
const unknownScreen = evaluateKillScreen(unknownContext, unknownEvidence);
assert.equal(unknownScreen.overall, "INCOMPLETE");
assert.equal(unknownScreen.confirmedKills.length, 0);
assert.ok(unknownScreen.unknownKills.includes("NO_MONETIZATION_PATH"));
assert.ok(unknownScreen.unknownKills.includes("LEGAL_OR_COMPLIANCE_BLOCK"));

console.log("PASS zero-cost evidence workers and kill screen");
