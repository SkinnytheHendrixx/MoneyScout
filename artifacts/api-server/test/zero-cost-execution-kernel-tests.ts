import assert from "node:assert/strict";
import { createAutonomousResolutionPlan } from "../src/lib/autonomous-resolution-engine";

const priorNodeEnv = process.env.NODE_ENV;
process.env.NODE_ENV = "production";
const {
  classifyExecutionFailure,
  executionIdempotencyKey,
} = await import("../src/lib/execution-kernel");
process.env.NODE_ENV = priorNodeEnv;

const keyA = executionIdempotencyKey({
  opportunityId: 42,
  evaluationCycleId: 3,
  action: "RUN_VALIDATION",
  discriminator: "research-cleared",
});
const keyB = executionIdempotencyKey({
  opportunityId: 42,
  evaluationCycleId: 3,
  action: "RUN_VALIDATION",
  discriminator: "research-cleared",
});
const keyNextCycle = executionIdempotencyKey({
  opportunityId: 42,
  evaluationCycleId: 4,
  action: "RUN_VALIDATION",
  discriminator: "research-cleared",
});
assert.equal(keyA, keyB);
assert.notEqual(keyA, keyNextCycle);
assert.match(keyA, /cycle-3:RUN_VALIDATION/);

{
  const decision = classifyExecutionFailure({
    action: "RUN_RESEARCH",
    status: 503,
    errorCode: "AI_PROVIDER_UNAVAILABLE",
    message: "provider unavailable",
  });
  assert.equal(decision.failureClass, "PROVIDER_NOT_READY");
  assert.equal(decision.safeAutomaticRetry, true);
}

{
  const decision = classifyExecutionFailure({
    action: "RUN_RESEARCH",
    status: 502,
    errorCode: null,
    message: "policy worker failed after model invocation",
  });
  assert.equal(decision.failureClass, "STAGE_FAILURE");
  assert.equal(decision.safeAutomaticRetry, false);
}

{
  const decision = classifyExecutionFailure({
    action: "PLAN_EXPERIMENT",
    status: 503,
    errorCode: null,
    message: "temporary database outage",
  });
  assert.equal(decision.failureClass, "TRANSIENT_INFRASTRUCTURE");
  assert.equal(decision.safeAutomaticRetry, true);
}

{
  const decision = classifyExecutionFailure({
    action: "RUN_VALIDATION",
    status: 409,
    errorCode: null,
    message: "Autonomous validation is already running for this opportunity",
  });
  assert.equal(decision.failureClass, "ALREADY_RUNNING");
  assert.equal(decision.safeAutomaticRetry, true);
}

{
  const decision = classifyExecutionFailure({
    action: "RUN_RESEARCH",
    status: 409,
    errorCode: "PILOT_SPEND_APPROVAL_REQUIRED",
    message: "explicit approval required",
  });
  assert.equal(decision.failureClass, "AUTHORIZATION_REQUIRED");
  assert.equal(decision.safeAutomaticRetry, false);
}

const researchRecovery = createAutonomousResolutionPlan("RESEARCH_EXECUTION_FAILURE");
assert.match(researchRecovery.objective, /failed Research workflow/i);
assert.equal(researchRecovery.steps.some((step) => step.method === "WATCH_FOR_DELTA"), false);
assert.equal(
  researchRecovery.steps.find((step) => step.method === "DIRECT_RESEARCH")?.mayUseExternalPaidResearch,
  false,
);

const validationRecovery = createAutonomousResolutionPlan("VALIDATION_EXECUTION_FAILURE");
assert.match(validationRecovery.objective, /failed Validation workflow/i);
assert.equal(validationRecovery.steps.some((step) => step.method === "ECONOMIC_INFERENCE"), false);

console.log("PASS zero-cost execution kernel");
