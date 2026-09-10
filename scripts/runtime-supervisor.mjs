#!/usr/bin/env node
import { execFile, spawn } from "node:child_process";
import { mkdir, readFile, rename, rm, stat, writeFile, readdir } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";
import { setTimeout as sleep } from "node:timers/promises";
import { pathToFileURL } from "node:url";

const execFileAsync = promisify(execFile);
const RELOAD_CONTROLLER_EXIT_CODE = 75;

export function normalizeSha(value) {
  const sha = String(value ?? "").trim().toLowerCase();
  return /^[0-9a-f]{40}$/.test(sha) ? sha : null;
}

export function candidatePortFor(basePort) {
  const parsed = Number(basePort);
  if (!Number.isInteger(parsed) || parsed <= 0 || parsed > 55535) {
    throw new Error(`Invalid runtime PORT: ${basePort}`);
  }
  return parsed + 10_000;
}

export function parseGithubActionsRuns(payload, targetSha, branch = "main", workflowName = "Money Scout CI") {
  const normalizedTarget = normalizeSha(targetSha);
  if (!normalizedTarget) return { state: "ERROR", reason: "INVALID_SHA", runId: null, url: null };
  const runs = Array.isArray(payload?.workflow_runs) ? payload.workflow_runs : [];
  const matching = runs
    .filter((run) =>
      normalizeSha(run?.head_sha) === normalizedTarget &&
      run?.head_branch === branch &&
      run?.name === workflowName &&
      run?.event === "push"
    )
    .sort((a, b) => Number(b?.run_number ?? 0) - Number(a?.run_number ?? 0));

  if (matching.length === 0) {
    return { state: "PENDING", reason: "PUSH_CI_NOT_FOUND", runId: null, url: null };
  }

  const latest = matching[0];
  const runId = Number.isInteger(Number(latest?.id)) ? Number(latest.id) : null;
  const url = typeof latest?.html_url === "string" ? latest.html_url : null;
  if (latest?.status !== "completed") {
    return { state: "PENDING", reason: "PUSH_CI_RUNNING", runId, url };
  }
  if (latest?.conclusion === "success") {
    return { state: "GREEN", reason: "PUSH_CI_SUCCESS", runId, url };
  }
  return {
    state: "RED",
    reason: `PUSH_CI_${String(latest?.conclusion ?? "UNKNOWN").toUpperCase()}`,
    runId,
    url,
  };
}

export function publicRuntimeState(state) {
  if (!state || typeof state !== "object") {
    return {
      supervisor_active: false,
      phase: "UNKNOWN",
      current_sha: null,
      desired_sha: null,
      root_synced_sha: null,
      previous_sha: null,
      last_check_at: null,
      last_successful_update_at: null,
      last_failure: null,
      ci: null,
    };
  }
  return {
    supervisor_active: true,
    phase: typeof state.phase === "string" ? state.phase : "UNKNOWN",
    current_sha: normalizeSha(state.currentSha),
    desired_sha: normalizeSha(state.desiredSha),
    root_synced_sha: normalizeSha(state.rootSyncedSha),
    previous_sha: normalizeSha(state.previousSha),
    last_check_at: typeof state.lastCheckAt === "string" ? state.lastCheckAt : null,
    last_successful_update_at: typeof state.lastSuccessfulUpdateAt === "string" ? state.lastSuccessfulUpdateAt : null,
    last_failure: state.lastFailure && typeof state.lastFailure === "object"
      ? {
          code: typeof state.lastFailure.code === "string" ? state.lastFailure.code : "UNKNOWN",
          sha: normalizeSha(state.lastFailure.sha),
          at: typeof state.lastFailure.at === "string" ? state.lastFailure.at : null,
        }
      : null,
    ci: state.ci && typeof state.ci === "object"
      ? {
          sha: normalizeSha(state.ci.sha),
          state: typeof state.ci.state === "string" ? state.ci.state : "UNKNOWN",
          reason: typeof state.ci.reason === "string" ? state.ci.reason : null,
          run_id: Number.isInteger(Number(state.ci.runId)) ? Number(state.ci.runId) : null,
        }
      : null,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function log(event, fields = {}) {
  process.stdout.write(`${JSON.stringify({ ts: nowIso(), component: "runtime-supervisor", event, ...fields })}\n`);
}

function numericEnv(name, fallback, minimum) {
  const raw = process.env[name];
  if (!raw) return fallback;
  const value = Number(raw);
  return Number.isFinite(value) && value >= minimum ? value : fallback;
}

async function command(commandName, args, options = {}) {
  const result = await execFileAsync(commandName, args, {
    cwd: options.cwd,
    env: options.env ?? process.env,
    encoding: "utf8",
    maxBuffer: 20 * 1024 * 1024,
    timeout: options.timeoutMs ?? 120_000,
  });
  return {
    stdout: String(result.stdout ?? "").trim(),
    stderr: String(result.stderr ?? "").trim(),
  };
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

function isPidAlive(pid) {
  if (!Number.isInteger(pid) || pid <= 1) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch {
    return false;
  }
}

async function stopPid(pid, gracefulMs = 10_000) {
  if (!isPidAlive(pid)) return;
  try {
    process.kill(pid, "SIGTERM");
  } catch {
    return;
  }
  const deadline = Date.now() + gracefulMs;
  while (Date.now() < deadline) {
    if (!isPidAlive(pid)) return;
    await sleep(250);
  }
  if (isPidAlive(pid)) {
    try {
      process.kill(pid, "SIGKILL");
    } catch {
      // Best effort.
    }
  }
}

async function readJson(filePath) {
  try {
    return JSON.parse(await readFile(filePath, "utf8"));
  } catch {
    return null;
  }
}

async function writeJsonAtomic(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true });
  const tempPath = `${filePath}.${process.pid}.tmp`;
  await writeFile(tempPath, `${JSON.stringify(value, null, 2)}\n`, "utf8");
  await rename(tempPath, filePath);
}

function spawnApi(releaseDir, port, sha, statePath, preflight) {
  const child = spawn(
    process.execPath,
    ["--enable-source-maps", "artifacts/api-server/dist/index.mjs"],
    {
      cwd: releaseDir,
      env: {
        ...process.env,
        PORT: String(port),
        MONEY_SCOUT_BUILD_SHA: sha,
        MONEY_SCOUT_EXPECTED_COMMIT_SHA: sha,
        MONEY_SCOUT_RUNTIME_STATE_PATH: statePath,
        MONEY_SCOUT_SUPERVISOR_ACTIVE: "1",
        MONEY_SCOUT_RUNTIME_PREFLIGHT: preflight ? "1" : "0",
      },
      stdio: "inherit",
    },
  );
  return child;
}

async function waitForRuntimeHealth(port, expectedSha, timeoutMs, child = null) {
  const deadline = Date.now() + timeoutMs;
  let lastError = "health check not attempted";
  while (Date.now() < deadline) {
    if (child && child.exitCode !== null) {
      throw new Error(`Runtime exited before becoming healthy with code ${child.exitCode}`);
    }
    try {
      const response = await fetch(`http://127.0.0.1:${port}/api/health/runtime`, {
        signal: AbortSignal.timeout(3_000),
        headers: { "user-agent": "money-scout-runtime-supervisor" },
      });
      if (response.ok) {
        const payload = await response.json();
        if (
          payload?.status === "READY" &&
          normalizeSha(payload?.runtime?.commit) === expectedSha &&
          payload?.runtime?.freshness === "MATCH" &&
          payload?.database?.reachable === true
        ) {
          return payload;
        }
        lastError = `health payload not ready: ${JSON.stringify(payload).slice(0, 600)}`;
      } else {
        lastError = `health endpoint returned ${response.status}`;
      }
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await sleep(750);
  }
  throw new Error(`Runtime health timeout for ${expectedSha.slice(0, 8)}: ${lastError}`);
}

async function main() {
  const repoRoot = path.resolve(process.env.MONEY_SCOUT_REPO_ROOT || process.cwd());
  const repository = process.env.MONEY_SCOUT_REPOSITORY || "SkinnytheHendrixx/MoneyScout";
  const branch = process.env.MONEY_SCOUT_RUNTIME_BRANCH || "main";
  const workflowName = process.env.MONEY_SCOUT_RUNTIME_CI_WORKFLOW || "Money Scout CI";
  const runtimeRoot = path.resolve(
    process.env.MONEY_SCOUT_RUNTIME_DIR || path.join(os.tmpdir(), "money-scout-runtime"),
  );
  const releasesRoot = path.join(runtimeRoot, "releases");
  const statePath = path.resolve(
    process.env.MONEY_SCOUT_RUNTIME_STATE_PATH || path.join(runtimeRoot, "supervisor-state.json"),
  );
  const port = Number(process.env.PORT || "8080");
  const candidatePort = Number(process.env.MONEY_SCOUT_RUNTIME_PREFLIGHT_PORT || candidatePortFor(port));
  const pollMs = numericEnv("MONEY_SCOUT_RUNTIME_POLL_MS", 30_000, 5_000);
  const pendingCiPollMs = numericEnv("MONEY_SCOUT_RUNTIME_CI_POLL_MS", 15_000, 5_000);
  const healthTimeoutMs = numericEnv("MONEY_SCOUT_RUNTIME_HEALTH_TIMEOUT_MS", 90_000, 10_000);
  const failedCiRecheckMs = numericEnv("MONEY_SCOUT_RUNTIME_FAILED_CI_RECHECK_MS", 300_000, 30_000);
  const keepReleases = Math.max(2, Math.floor(numericEnv("MONEY_SCOUT_RUNTIME_KEEP_RELEASES", 3, 2)));

  if (!Number.isInteger(port) || port <= 0) throw new Error(`Invalid PORT: ${process.env.PORT}`);
  if (!Number.isInteger(candidatePort) || candidatePort <= 0 || candidatePort === port) {
    throw new Error(`Invalid preflight port: ${candidatePort}`);
  }

  await mkdir(releasesRoot, { recursive: true });

  let state = {
    schemaVersion: 1,
    sourceOfTruth: "GITHUB_MAIN",
    repository,
    branch,
    phase: "BOOTING",
    supervisorStartedAt: nowIso(),
    currentSha: null,
    previousSha: null,
    desiredSha: null,
    rootSyncedSha: null,
    currentRuntimePid: null,
    currentReleaseDir: null,
    lastCheckAt: null,
    lastSuccessfulUpdateAt: null,
    lastFailure: null,
    ci: null,
    generation: 0,
  };

  const priorState = await readJson(statePath);
  if (priorState && typeof priorState === "object") {
    state = { ...state, ...priorState, supervisorStartedAt: nowIso() };
  }

  async function persist(patch = {}) {
    state = { ...state, ...patch, lastTransitionAt: nowIso() };
    await writeJsonAtomic(statePath, state);
  }

  async function currentLocalSha() {
    const result = await command("git", ["rev-parse", "HEAD"], { cwd: repoRoot, timeoutMs: 15_000 });
    const sha = normalizeSha(result.stdout);
    if (!sha) throw new Error(`Unable to resolve local HEAD: ${result.stdout}`);
    return sha;
  }

  async function desiredRemoteSha() {
    const result = await command("git", ["ls-remote", "origin", `refs/heads/${branch}`], {
      cwd: repoRoot,
      timeoutMs: 20_000,
    });
    const sha = normalizeSha(result.stdout.split(/\s+/)[0]);
    if (!sha) throw new Error(`Unable to resolve origin/${branch}`);
    return sha;
  }

  async function ciGate(sha) {
    const endpoint = `https://api.github.com/repos/${repository}/actions/runs?head_sha=${encodeURIComponent(sha)}&event=push&per_page=20`;
    const headers = {
      accept: "application/vnd.github+json",
      "user-agent": "money-scout-runtime-supervisor",
      "x-github-api-version": "2022-11-28",
    };
    const token = process.env.MONEY_SCOUT_GITHUB_TOKEN?.trim();
    if (token) headers.authorization = `Bearer ${token}`;
    const response = await fetch(endpoint, { headers, signal: AbortSignal.timeout(8_000) });
    if (!response.ok) {
      throw new Error(`GitHub Actions gate returned ${response.status}`);
    }
    return parseGithubActionsRuns(await response.json(), sha, branch, workflowName);
  }

  async function fetchCommit(sha) {
    await command("git", ["fetch", "--prune", "origin", branch], { cwd: repoRoot, timeoutMs: 90_000 });
    await command("git", ["cat-file", "-e", `${sha}^{commit}`], { cwd: repoRoot, timeoutMs: 10_000 });
  }

  async function removeReleaseDir(releaseDir) {
    try {
      await command("git", ["worktree", "remove", "--force", releaseDir], { cwd: repoRoot, timeoutMs: 60_000 });
    } catch {
      await rm(releaseDir, { recursive: true, force: true });
      try {
        await command("git", ["worktree", "prune"], { cwd: repoRoot, timeoutMs: 15_000 });
      } catch {
        // Best effort cleanup.
      }
    }
  }

  async function prepareRelease(sha) {
    const releaseDir = path.join(releasesRoot, sha);
    const markerPath = path.join(releaseDir, ".money-scout-runtime-release.json");
    const marker = await readJson(markerPath);
    const apiBundle = path.join(releaseDir, "artifacts/api-server/dist/index.mjs");
    const webBundle = path.join(releaseDir, "artifacts/money-scout/dist/public/index.html");
    if (
      normalizeSha(marker?.sha) === sha &&
      await exists(apiBundle) &&
      await exists(webBundle)
    ) {
      return releaseDir;
    }

    if (await exists(releaseDir)) await removeReleaseDir(releaseDir);
    await fetchCommit(sha);
    await command("git", ["worktree", "add", "--force", "--detach", releaseDir, sha], {
      cwd: repoRoot,
      timeoutMs: 60_000,
    });

    try {
      await command("pnpm", ["install", "--frozen-lockfile"], { cwd: releaseDir, timeoutMs: 180_000 });
      await command("pnpm", ["--filter", "@workspace/api-server", "run", "build"], {
        cwd: releaseDir,
        timeoutMs: 120_000,
      });
      await command("pnpm", ["--filter", "@workspace/money-scout", "run", "build"], {
        cwd: releaseDir,
        timeoutMs: 120_000,
        env: {
          ...process.env,
          PORT: String(candidatePort + 1),
          BASE_PATH: process.env.BASE_PATH || "/",
          NODE_ENV: "production",
        },
      });
      await writeJsonAtomic(markerPath, { sha, preparedAt: nowIso() });
      return releaseDir;
    } catch (error) {
      await removeReleaseDir(releaseDir);
      throw error;
    }
  }

  async function preflightRelease(sha, releaseDir) {
    await persist({ phase: "PREFLIGHT", desiredSha: sha });
    const candidate = spawnApi(releaseDir, candidatePort, sha, statePath, true);
    try {
      await waitForRuntimeHealth(candidatePort, sha, healthTimeoutMs, candidate);
      log("preflight_passed", { sha });
    } finally {
      if (candidate.exitCode === null) {
        await stopPid(candidate.pid, 5_000);
      }
    }
  }

  async function launchRuntime(sha, releaseDir) {
    const child = spawnApi(releaseDir, port, sha, statePath, false);
    try {
      await waitForRuntimeHealth(port, sha, healthTimeoutMs, child);
      return child.pid;
    } catch (error) {
      if (child.exitCode === null) await stopPid(child.pid, 5_000);
      throw error;
    }
  }

  async function healthMatchesCurrent(pid, sha) {
    if (!isPidAlive(pid) || !normalizeSha(sha)) return false;
    try {
      await waitForRuntimeHealth(port, sha, 4_000, null);
      return true;
    } catch {
      return false;
    }
  }

  async function syncRootTo(sha, rollbackSha = null) {
    await persist({ phase: "SYNCING_ROOT" });
    try {
      await fetchCommit(sha);
      await command("git", ["reset", "--hard", sha], { cwd: repoRoot, timeoutMs: 30_000 });
      await command("pnpm", ["install", "--frozen-lockfile"], { cwd: repoRoot, timeoutMs: 180_000 });
      await persist({ rootSyncedSha: sha });
    } catch (error) {
      if (normalizeSha(rollbackSha)) {
        try {
          await command("git", ["reset", "--hard", rollbackSha], { cwd: repoRoot, timeoutMs: 30_000 });
          await command("pnpm", ["install", "--frozen-lockfile"], { cwd: repoRoot, timeoutMs: 180_000 });
          await persist({ rootSyncedSha: rollbackSha });
        } catch (rollbackError) {
          log("root_rollback_failed", {
            rollbackSha,
            error: rollbackError instanceof Error ? rollbackError.message : String(rollbackError),
          });
        }
      }
      throw error;
    }
  }

  async function rollbackRuntime(previousSha, previousReleaseDir, failedSha, reason) {
    await persist({ phase: "ROLLING_BACK" });
    const currentPid = Number(state.currentRuntimePid);
    if (isPidAlive(currentPid)) await stopPid(currentPid);
    const rollbackPid = await launchRuntime(previousSha, previousReleaseDir);
    await persist({
      phase: "HEALTHY",
      currentSha: previousSha,
      currentReleaseDir: previousReleaseDir,
      currentRuntimePid: rollbackPid,
      desiredSha: failedSha,
      lastFailure: {
        code: "ROLLOUT_ROLLED_BACK",
        sha: failedSha,
        at: nowIso(),
        message: String(reason).slice(0, 1_000),
      },
    });
    log("runtime_rolled_back", { previousSha, failedSha });
  }

  async function promote(sha) {
    const oldSha = normalizeSha(state.currentSha);
    const oldReleaseDir = typeof state.currentReleaseDir === "string" ? state.currentReleaseDir : null;
    const oldPid = Number(state.currentRuntimePid);

    await persist({ phase: "STAGING", desiredSha: sha, lastFailure: null });
    let releaseDir;
    try {
      releaseDir = await prepareRelease(sha);
      await preflightRelease(sha, releaseDir);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await persist({
        phase: "BLOCKED_PREFLIGHT",
        lastFailure: { code: "PREFLIGHT_FAILED", sha, at: nowIso(), message: message.slice(0, 1_000) },
      });
      log("preflight_failed", { sha, error: message });
      return false;
    }

    await persist({ phase: "SWAPPING_RUNTIME" });
    if (isPidAlive(oldPid)) await stopPid(oldPid);

    let newPid;
    try {
      newPid = await launchRuntime(sha, releaseDir);
      await persist({
        currentSha: sha,
        previousSha: oldSha,
        currentReleaseDir: releaseDir,
        currentRuntimePid: newPid,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (oldSha && oldReleaseDir) {
        await rollbackRuntime(oldSha, oldReleaseDir, sha, message);
        return false;
      }
      throw error;
    }

    try {
      await syncRootTo(sha, oldSha);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      if (oldSha && oldReleaseDir) {
        await rollbackRuntime(oldSha, oldReleaseDir, sha, `root sync failed: ${message}`);
        return false;
      }
      throw error;
    }

    await persist({
      phase: "HEALTHY",
      currentSha: sha,
      previousSha: oldSha,
      desiredSha: sha,
      rootSyncedSha: sha,
      currentReleaseDir: releaseDir,
      currentRuntimePid: newPid,
      lastSuccessfulUpdateAt: nowIso(),
      lastFailure: null,
      generation: Number(state.generation ?? 0) + 1,
    });
    log("runtime_promoted", { sha, previousSha: oldSha });
    return true;
  }

  async function cleanupReleases() {
    const protectedShas = new Set([
      normalizeSha(state.currentSha),
      normalizeSha(state.previousSha),
    ].filter(Boolean));
    let entries = [];
    try {
      entries = await readdir(releasesRoot, { withFileTypes: true });
    } catch {
      return;
    }
    const releaseNames = entries
      .filter((entry) => entry.isDirectory() && normalizeSha(entry.name))
      .map((entry) => entry.name);
    if (releaseNames.length <= keepReleases) return;

    const candidates = [];
    for (const sha of releaseNames) {
      if (protectedShas.has(sha)) continue;
      try {
        const info = await stat(path.join(releasesRoot, sha));
        candidates.push({ sha, mtimeMs: info.mtimeMs });
      } catch {
        // Ignore disappearing worktrees.
      }
    }
    candidates.sort((a, b) => b.mtimeMs - a.mtimeMs);
    const allowedExtra = Math.max(0, keepReleases - protectedShas.size);
    for (const item of candidates.slice(allowedExtra)) {
      await removeReleaseDir(path.join(releasesRoot, item.sha));
    }
  }

  let shutdown = false;
  let intentionalReload = false;
  async function stopOwnedRuntime() {
    if (intentionalReload) return;
    const pid = Number(state.currentRuntimePid);
    if (isPidAlive(pid)) await stopPid(pid);
  }
  for (const signal of ["SIGTERM", "SIGINT"]) {
    process.on(signal, async () => {
      if (shutdown) return;
      shutdown = true;
      log("supervisor_stopping", { signal });
      await stopOwnedRuntime();
      process.exit(0);
    });
  }

  const adoptedPid = Number(state.currentRuntimePid);
  const adoptedSha = normalizeSha(state.currentSha);
  if (adoptedSha && await healthMatchesCurrent(adoptedPid, adoptedSha)) {
    await persist({ phase: "HEALTHY" });
    log("runtime_adopted", { sha: adoptedSha, pid: adoptedPid });
  } else {
    const localSha = await currentLocalSha();
    await persist({ phase: "STAGING", desiredSha: localSha, rootSyncedSha: localSha });
    const releaseDir = await prepareRelease(localSha);
    await preflightRelease(localSha, releaseDir);
    const pid = await launchRuntime(localSha, releaseDir);
    await persist({
      phase: "HEALTHY",
      currentSha: localSha,
      desiredSha: localSha,
      rootSyncedSha: localSha,
      currentReleaseDir: releaseDir,
      currentRuntimePid: pid,
      lastSuccessfulUpdateAt: state.lastSuccessfulUpdateAt ?? nowIso(),
    });
    log("runtime_started", { sha: localSha, pid });
  }

  await cleanupReleases();
  let redSha = null;
  let redShaCheckedAt = 0;

  while (!shutdown) {
    let desired;
    try {
      desired = await desiredRemoteSha();
      await persist({ desiredSha: desired, lastCheckAt: nowIso() });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await persist({
        phase: "DEGRADED_CHECK",
        lastCheckAt: nowIso(),
        lastFailure: { code: "REMOTE_CHECK_FAILED", sha: null, at: nowIso(), message: message.slice(0, 1_000) },
      });
      log("remote_check_failed", { error: message });
      await sleep(pollMs);
      continue;
    }

    if (desired === normalizeSha(state.currentSha)) {
      if (state.phase !== "HEALTHY") await persist({ phase: "HEALTHY" });
      await sleep(pollMs);
      continue;
    }

    if (desired === redSha && Date.now() - redShaCheckedAt < failedCiRecheckMs) {
      await sleep(pollMs);
      continue;
    }

    let gate;
    try {
      await persist({ phase: "WAITING_FOR_CI" });
      gate = await ciGate(desired);
      await persist({ ci: { sha: desired, ...gate } });
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      await persist({
        phase: "DEGRADED_CI_GATE",
        lastFailure: { code: "CI_GATE_UNAVAILABLE", sha: desired, at: nowIso(), message: message.slice(0, 1_000) },
      });
      log("ci_gate_unavailable", { sha: desired, error: message });
      await sleep(pendingCiPollMs);
      continue;
    }

    if (gate.state === "PENDING") {
      await sleep(pendingCiPollMs);
      continue;
    }
    if (gate.state !== "GREEN") {
      redSha = desired;
      redShaCheckedAt = Date.now();
      await persist({
        phase: "BLOCKED_CI",
        lastFailure: { code: gate.reason, sha: desired, at: nowIso(), message: "GitHub push CI must be green before self-deployment." },
      });
      log("ci_blocked_release", { sha: desired, reason: gate.reason, runId: gate.runId });
      await sleep(pollMs);
      continue;
    }

    redSha = null;
    redShaCheckedAt = 0;
    const promoted = await promote(desired);
    if (promoted) {
      await cleanupReleases();
      intentionalReload = true;
      log("controller_reload_after_promotion", { sha: desired });
      process.exit(RELOAD_CONTROLLER_EXIT_CODE);
    }
    await sleep(pollMs);
  }
}

const invokedDirectly = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (invokedDirectly) {
  main().catch((error) => {
    log("supervisor_fatal", { error: error instanceof Error ? error.stack ?? error.message : String(error) });
    process.exit(1);
  });
}
