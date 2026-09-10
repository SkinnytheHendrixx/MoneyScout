import assert from "node:assert/strict";
import {
  candidatePortFor,
  normalizeSha,
  parseGithubActionsRuns,
  publicRuntimeState,
} from "./runtime-supervisor.mjs";

const sha = "a".repeat(40);
const otherSha = "b".repeat(40);

assert.equal(normalizeSha(sha.toUpperCase()), sha);
assert.equal(normalizeSha("abc"), null);
assert.equal(candidatePortFor(8080), 18080);

const success = parseGithubActionsRuns({
  workflow_runs: [
    {
      id: 11,
      name: "Money Scout CI",
      event: "push",
      head_sha: sha,
      head_branch: "main",
      run_number: 100,
      status: "completed",
      conclusion: "success",
      html_url: "https://example.test/run/11",
    },
    {
      id: 10,
      name: "Money Scout CI",
      event: "push",
      head_sha: otherSha,
      head_branch: "main",
      run_number: 99,
      status: "completed",
      conclusion: "success",
    },
  ],
}, sha);
assert.deepEqual(success, {
  state: "GREEN",
  reason: "PUSH_CI_SUCCESS",
  runId: 11,
  url: "https://example.test/run/11",
});

const pending = parseGithubActionsRuns({
  workflow_runs: [{
    id: 12,
    name: "Money Scout CI",
    event: "push",
    head_sha: sha,
    head_branch: "main",
    run_number: 101,
    status: "in_progress",
    conclusion: null,
  }],
}, sha);
assert.equal(pending.state, "PENDING");
assert.equal(pending.reason, "PUSH_CI_RUNNING");

const failed = parseGithubActionsRuns({
  workflow_runs: [{
    id: 13,
    name: "Money Scout CI",
    event: "push",
    head_sha: sha,
    head_branch: "main",
    run_number: 102,
    status: "completed",
    conclusion: "failure",
  }],
}, sha);
assert.equal(failed.state, "RED");
assert.equal(failed.reason, "PUSH_CI_FAILURE");

const noMainPush = parseGithubActionsRuns({
  workflow_runs: [{
    id: 14,
    name: "Money Scout CI",
    event: "pull_request",
    head_sha: sha,
    head_branch: "task-72",
    run_number: 103,
    status: "completed",
    conclusion: "success",
  }],
}, sha);
assert.equal(noMainPush.state, "PENDING");
assert.equal(noMainPush.reason, "PUSH_CI_NOT_FOUND");

const safe = publicRuntimeState({
  phase: "HEALTHY",
  currentSha: sha,
  desiredSha: sha,
  rootSyncedSha: sha,
  previousSha: otherSha,
  currentRuntimePid: 12345,
  currentReleaseDir: "/secret/path",
  lastCheckAt: "2026-09-10T00:00:00.000Z",
  lastSuccessfulUpdateAt: "2026-09-10T00:00:01.000Z",
  lastFailure: { code: "EXAMPLE", sha: otherSha, at: "2026-09-10T00:00:02.000Z", message: "secret detail" },
  ci: { sha, state: "GREEN", reason: "PUSH_CI_SUCCESS", runId: 44, url: "https://secret.example" },
});
assert.equal(safe.supervisor_active, true);
assert.equal(safe.current_sha, sha);
assert.equal(safe.last_failure.code, "EXAMPLE");
assert.equal("currentRuntimePid" in safe, false);
assert.equal("currentReleaseDir" in safe, false);
assert.equal("message" in safe.last_failure, false);
assert.equal("url" in safe.ci, false);

console.log("PASS zero-cost runtime supervisor control-plane tests");
