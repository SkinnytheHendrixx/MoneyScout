#!/usr/bin/env node
import net from "node:net";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

const RELOAD_CONTROLLER_EXIT_CODE = 75;

export async function portIsAvailable(port, host = "0.0.0.0") {
  return await new Promise((resolve) => {
    const server = net.createServer();
    server.unref();
    server.once("error", () => resolve(false));
    server.listen({ port, host, exclusive: true }, () => {
      server.close(() => resolve(true));
    });
  });
}

async function waitForPortFree(port, timeoutMs) {
  const deadline = Date.now() + timeoutMs;
  while (Date.now() < deadline) {
    if (await portIsAvailable(port)) return true;
    await sleep(200);
  }
  return await portIsAvailable(port);
}

function signalOwnedProcessGroup(pid, signal) {
  if (!Number.isInteger(pid) || pid <= 1) return;
  if (process.platform !== "win32") {
    try {
      process.kill(-pid, signal);
      return;
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && error.code === "ESRCH") return;
    }
  }
  try {
    process.kill(pid, signal);
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ESRCH")) {
      throw error;
    }
  }
}

export async function runFrontendRuntimeFollower() {
  const runtimeRoot = path.resolve(
    process.env.MONEY_SCOUT_RUNTIME_DIR || path.join(os.tmpdir(), "money-scout-runtime"),
  );
  const statePath = path.resolve(
    process.env.MONEY_SCOUT_RUNTIME_STATE_PATH || path.join(runtimeRoot, "supervisor-state.json"),
  );
  const repoRoot = path.resolve(process.env.MONEY_SCOUT_REPO_ROOT || process.cwd());
  const pollMs = Math.max(1_000, Number(process.env.MONEY_SCOUT_FRONTEND_FOLLOW_MS || 2_000));
  const servicePort = Number(process.env.PORT || "18193");
  if (!Number.isInteger(servicePort) || servicePort <= 0 || servicePort > 65_535) {
    throw new Error(`Invalid frontend PORT: ${process.env.PORT}`);
  }

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
    const pid = Number(vite?.pid);
    if (!Number.isInteger(pid) || pid <= 1) return;

    signalOwnedProcessGroup(pid, signal);
    if (await waitForPortFree(servicePort, 8_000)) return;

    log("vite_process_group_force_kill", { pid });
    signalOwnedProcessGroup(pid, "SIGKILL");
    if (!(await waitForPortFree(servicePort, 3_000))) {
      throw new Error(`Frontend service port ${servicePort} remained occupied after stopping the owned Vite process group`);
    }
  }

  function startVite() {
    vite = spawn("pnpm", ["--filter", "@workspace/money-scout", "run", "dev"], {
      cwd: repoRoot,
      env: process.env,
      stdio: "inherit",
      detached: process.platform !== "win32",
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
      try {
        await stopVite(signal);
      } catch (error) {
        log("frontend_follower_stop_failed", { error: error instanceof Error ? error.message : String(error) });
      }
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
      if (!(await portIsAvailable(servicePort))) {
        log("vite_wrapper_exited_but_child_still_owns_port", { pid: vite?.pid, servicePort });
        await stopVite();
      }
      log("vite_restart_after_unexpected_exit", { code: vite?.exitCode });
      await sleep(1_000);
      startVite();
    }
  }
}

const invokedDirectly = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (invokedDirectly) {
  void runFrontendRuntimeFollower();
}
