import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import net from "node:net";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import {
  runtimeBootstrapRepoRoot,
  runtimeControllerScript,
  selectRuntimePreflightPort,
} from "./runtime-bootstrap.mjs";
import { portIsAvailable } from "./frontend-runtime-follower.mjs";
import {
  candidatePortFor,
  normalizeSha,
  parseGithubActionsRuns,
  publicRuntimeState,
} from "./runtime-supervisor.mjs";

const testsDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(testsDir, "..");
const syntheticBootstrapUrl = pathToFileURL(path.join(repoRoot, "scripts/runtime-bootstrap.mjs")).href;
assert.equal(runtimeBootstrapRepoRoot(syntheticBootstrapUrl), repoRoot);
assert.equal(runtimeControllerScript("api", repoRoot), path.join(repoRoot, "scripts/runtime-supervisor.mjs"));
assert.equal(runtimeControllerScript("web", repoRoot), path.join(repoRoot, "scripts/frontend-runtime-follower.mjs"));

const apiArtifactConfig = await readFile(path.join(repoRoot, "artifacts/api-server/.replit-artifact/artifact.toml"), "utf8");
const webArtifactConfig = await readFile(path.join(repoRoot, "artifacts/money-scout/.replit-artifact/artifact.toml"), "utf8");
assert.match(apiArtifactConfig, /run = "node \.\.\/\.\.\/scripts\/runtime-bootstrap\.mjs api"/);
assert.match(webArtifactConfig, /run = "node \.\.\/\.\.\/scripts\/runtime-bootstrap\.mjs web"/);

const occupiedServer = net.createServer();
await new Promise((resolve, reject) => {
  occupiedServer.once("error", reject);
  occupiedServer.listen({ host: "127.0.0.1", port: 0, exclusive: true }, resolve);
});
const occupiedAddress = occupiedServer.address();
assert.equal(typeof occupiedAddress, "object");
const occupiedPort = occupiedAddress.port;
assert.ok(occupiedPort > 10_000);
assert.equal(await portIsAvailable(occupiedPort, "127.0.0.1"), false, "frontend follower must detect an occupied service port");
const collisionBasePort = occupiedPort - 10_000;
const selectedFallbackPort = await selectRuntimePreflightPort(collisionBasePort, occupiedPort);
assert.notEqual(selectedFallbackPort, occupiedPort);
assert.notEqual(selectedFallbackPort, collisionBasePort);
await new Promise((resolve, reject) => occupiedServer.close((error) => error ? reject(error) : resolve()));
assert.equal(await portIsAvailable(occupiedPort, "127.0.0.1"), true, "frontend follower must detect that its service port has drained before restart");

const followerSource = await readFile(path.join(repoRoot, "scripts/frontend-runtime-follower.mjs"), "utf8");
assert.match(followerSource, /detached: process\.platform !== "win32"/);
assert.match(followerSource, /process\.kill\(-pid, signal\)/);
assert.match(followerSource, /waitForPortFree\(servicePort/);

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
