import assert from "node:assert/strict";
import { evaluateValidation, VALIDATION_DIMENSIONS } from "../src/lib/validation-engine";

const signals = (score: number, evidenceCount = 3) => VALIDATION_DIMENSIONS.map((dimension) => ({ dimension, score, evidenceCount }));

assert.equal(evaluateValidation({ opportunityVerdict: "RESEARCH", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: signals(90) }).verdict, "REJECT");
assert.equal(evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: signals(85) }).verdict, "BUILD_READY");
assert.equal(evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: signals(65) }).verdict, "WATCH");
assert.equal(evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: signals(45) }).verdict, "REJECT");

const incomplete = signals(90).slice(0, 5);
assert.equal(evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: incomplete }).verdict, "NEEDS_MORE_VALIDATION");

const blocked = signals(90);
blocked[3] = { ...blocked[3], score: 20 };
const blockedResult = evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: blocked });
assert.equal(blockedResult.verdict, "REJECT");
assert.ok(blockedResult.blockingDimensions.includes("distribution"));

const contradicted = signals(90);
contradicted[6] = { ...contradicted[6], contradictionCount: 2 };
assert.equal(evaluateValidation({ opportunityVerdict: "TEST", policyStatus: "GREEN", demandConclusion: "SUPPORTED", signals: contradicted }).verdict, "REJECT");

console.log("PASS zero-cost validation engine");
