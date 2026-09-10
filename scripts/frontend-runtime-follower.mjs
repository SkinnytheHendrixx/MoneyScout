#!/usr/bin/env node
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { setTimeout as sleep } from "node:timers/promises";

const RELOAD_CONTROLLER_EXIT_CODE = 75;
const runtimeRoot = path.resolve(
  process.env.MONEY_SCOUT_RUNTIME_DIR || path.join(os.tmpdir(), "money-scout-runtime"),
);
const statePath = path.resolve(
  process.env.MONEY_SCOUT_RUNTIME_STATE_PATH || path.join(runtimeRoot, "supervisor-state.json"),
);
const repoRoot = path.resolve(process.env.MONEY_SCOUT_REPO_ROOT || process.cwd());
const pollMs = Math.max(1_000, Number(process.env.MONEY_SCOUT_FRONTEND_FOLLOW_MS || 2_000));

let stopping = false;
let vite = null;
let observedSha = null;

function log(event, fields = {}) {
  process.stdout.write(`${JSON.stringify({ ts: new Date().toISOString(), component: "frontend-runtime-follower", event, ...fields })}\n`);
}

async function readState() {
  try {
    return JSON.parse(await readFile(statePath, "utf8"));
  } catch {
    return null;
  }
}

async function stopVite(signal = "SIGTERM") {
  if (!vite || vite.exitCode !== null) return;
  try {
    vite.kill(signal);
  } catch {
    return;
  }
  const deadline = Date.now() + 8_000;
  while (Date.now() < deadline && vite.exitCode === null) {
    await sleep(200);
  }
  if (vite.exitCode === null) {
    try {
      vite.kill("SIGKILL");
    } catch {
      // Best effort.
    }
  }
}

function startVite() {
  vite = spawn("pnpm", ["--filter", "@workspace/money-scout", "run", "dev"], {
    cwd: repoRoot,
    env: process.env,
    stdio: "inherit",
  });
  vite.once("exit", (code, signal) => {
    log("vite_exited", { code, signal });
  });
  log("vite_started", { pid: vite.pid, observedSha });
}

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    if (stopping) return;
    stopping = true;
    log("frontend_follower_stopping", { signal });
    await stopVite(signal);
    process.exit(0);
  });
}

const initialState = await readState();
observedSha = typeof initialState?.rootSyncedSha === "string" ? initialState.rootSyncedSha : null;
startVite();

while (!stopping) {
  await sleep(pollMs);
  const state = await readState();
  const promotedSha = typeof state?.rootSyncedSha === "string" ? state.rootSyncedSha : null;
  if (promotedSha && promotedSha !== observedSha) {
    log("frontend_reload_requested", { from: observedSha, to: promotedSha });
    await stopVite();
    process.exit(RELOAD_CONTROLLER_EXIT_CODE);
  }
  if (vite?.exitCode !== null) {
    log("vite_restart_after_unexpected_exit", { code: vite?.exitCode });
    await sleep(1_000);
    startVite();
  }
}
