#!/usr/bin/env node
import { spawn } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export function runtimeBootstrapRepoRoot(scriptUrl = import.meta.url) {
  const scriptPath = fileURLToPath(scriptUrl);
  return path.resolve(path.dirname(scriptPath), "..");
}

const role = process.argv[2] === "web" ? "web" : "api";
const repoRoot = runtimeBootstrapRepoRoot();
const childScript = role === "web"
  ? path.join(repoRoot, "scripts/frontend-runtime-follower.mjs")
  : path.join(repoRoot, "scripts/runtime-supervisor.mjs");

let stopping = false;
let child = null;

function log(event, fields = {}) {
  process.stdout.write(`${JSON.stringify({ ts: new Date().toISOString(), component: "runtime-bootstrap", role, event, ...fields })}\n`);
}

async function stopChild(signal = "SIGTERM") {
  if (!child || child.exitCode !== null) return;
  try {
    child.kill(signal);
  } catch {
    // Best effort. The child may already have exited.
  }
}

for (const signal of ["SIGTERM", "SIGINT"]) {
  process.on(signal, async () => {
    if (stopping) return;
    stopping = true;
    log("bootstrap_stopping", { signal });
    await stopChild(signal);
  });
}

while (!stopping) {
  log("controller_starting", { childScript, repoRoot });
  child = spawn(process.execPath, [childScript], {
    cwd: repoRoot,
    env: {
      ...process.env,
      MONEY_SCOUT_REPO_ROOT: process.env.MONEY_SCOUT_REPO_ROOT || repoRoot,
    },
    stdio: "inherit",
  });

  const exitCode = await new Promise((resolve) => {
    child.once("exit", (code, signal) => {
      resolve(typeof code === "number" ? code : signal ? 128 : 1);
    });
  });

  if (stopping) break;
  if (exitCode === 75) {
    log("controller_reload_requested");
    continue;
  }

  log("controller_exited", { exitCode });
  await sleep(2_000);
}

log("bootstrap_stopped");
