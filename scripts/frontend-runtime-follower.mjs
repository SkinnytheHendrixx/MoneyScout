#!/usr/bin/env node
import net from "node:net";
import { spawn } from "node:child_process";
import { readFile, readdir, readlink } from "node:fs/promises";
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

function signalExactProcess(pid, signal) {
  if (!Number.isInteger(pid) || pid <= 1 || pid === process.pid) return;
  try {
    process.kill(pid, signal);
  } catch (error) {
    if (!(error && typeof error === "object" && "code" in error && error.code === "ESRCH")) {
      throw error;
    }
  }
}

export function parseListeningSocketInodes(procNetText, port) {
  const expectedPort = port.toString(16).toUpperCase().padStart(4, "0");
  const inodes = new Set();
  for (const rawLine of procNetText.split("\n").slice(1)) {
    const fields = rawLine.trim().split(/\s+/);
    if (fields.length < 10 || fields[3] !== "0A") continue;
    const local = fields[1] ?? "";
    const separator = local.lastIndexOf(":");
    if (separator < 0) continue;
    const localPort = local.slice(separator + 1).toUpperCase();
    const inode = fields[9];
    if (localPort === expectedPort && inode && /^\d+$/.test(inode)) inodes.add(inode);
  }
  return inodes;
}

async function listeningSocketInodes(port, procRoot = "/proc") {
  const inodes = new Set();
  for (const file of ["net/tcp", "net/tcp6"]) {
    try {
      const parsed = parseListeningSocketInodes(await readFile(path.join(procRoot, file), "utf8"), port);
      for (const inode of parsed) inodes.add(inode);
    } catch (error) {
      if (!(error && typeof error === "object" && "code" in error && error.code === "ENOENT")) throw error;
    }
  }
  return inodes;
}

export function parseProcStat(statText) {
  const close = statText.lastIndexOf(")");
  if (close < 0) return null;
  const pid = Number(statText.slice(0, statText.indexOf(" ")));
  const rest = statText.slice(close + 2).trim().split(/\s+/);
  const ppid = Number(rest[1]);
  const processGroupId = Number(rest[2]);
  const sessionId = Number(rest[3]);
  const startTimeTicks = Number(rest[19]);
  if (![pid, ppid, processGroupId, sessionId, startTimeTicks].every(Number.isFinite)) return null;
  return { pid, ppid, processGroupId, sessionId, startTimeTicks };
}

async function readProcessIdentity(pid, procRoot = "/proc") {
  try {
    const [statText, cmdlineText, cwd] = await Promise.all([
      readFile(path.join(procRoot, String(pid), "stat"), "utf8"),
      readFile(path.join(procRoot, String(pid), "cmdline"), "utf8"),
      readlink(path.join(procRoot, String(pid), "cwd")),
    ]);
    const stat = parseProcStat(statText);
    if (!stat) return null;
    return {
      ...stat,
      cwd: path.resolve(cwd),
      argv: cmdlineText.split("\0").filter(Boolean),
    };
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && ["ENOENT", "EACCES", "EPERM"].includes(error.code)) return null;
    throw error;
  }
}

async function pidsOwningSocketInodes(inodes, procRoot = "/proc") {
  if (inodes.size === 0) return new Set();
  const pids = new Set();
  const entries = await readdir(procRoot, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isDirectory() || !/^\d+$/.test(entry.name)) continue;
    const pid = Number(entry.name);
    let fds;
    try {
      fds = await readdir(path.join(procRoot, entry.name, "fd"));
    } catch (error) {
      if (error && typeof error === "object" && "code" in error && ["ENOENT", "EACCES", "EPERM"].includes(error.code)) continue;
      throw error;
    }
    for (const fd of fds) {
      try {
        const target = await readlink(path.join(procRoot, entry.name, "fd", fd));
        const match = /^socket:\[(\d+)\]$/.exec(target);
        if (match?.[1] && inodes.has(match[1])) {
          pids.add(pid);
          break;
        }
      } catch (error) {
        if (!(error && typeof error === "object" && "code" in error && ["ENOENT", "EACCES", "EPERM"].includes(error.code))) throw error;
      }
    }
  }
  return pids;
}

export async function findListeningProcessIdentities(port, procRoot = "/proc") {
  if (process.platform !== "linux") return [];
  const inodes = await listeningSocketInodes(port, procRoot);
  const pids = await pidsOwningSocketInodes(inodes, procRoot);
  const identities = [];
  for (const pid of pids) {
    const identity = await readProcessIdentity(pid, procRoot);
    if (identity) identities.push(identity);
  }
  return identities;
}

export function isVerifiedMoneyScoutVite(identity, repoRoot) {
  if (!identity || !Array.isArray(identity.argv) || typeof identity.cwd !== "string") return false;
  const expectedCwd = path.resolve(repoRoot, "artifacts/money-scout");
  if (path.resolve(identity.cwd) !== expectedCwd) return false;
  const hasViteExecutable = identity.argv.some((arg) => /(?:^|\/)vite(?:\.js)?$/.test(arg) || /\/vite\/bin\/vite\.js$/.test(arg));
  const hasExpectedConfig = identity.argv.includes("vite.config.ts") || identity.argv.some((arg) => arg.endsWith("/vite.config.ts"));
  return hasViteExecutable && hasExpectedConfig;
}

export async function takeoverVerifiedStaleMoneyScoutVite({
  servicePort,
  repoRoot,
  controllerStartTimeTicks,
  procRoot = "/proc",
  log = () => {},
}) {
  if (await portIsAvailable(servicePort)) return { takenOver: false, pids: [] };
  if (process.platform !== "linux") {
    throw new Error(`Frontend service port ${servicePort} is occupied and stale-listener verification is only supported on Linux`);
  }

  const owners = await findListeningProcessIdentities(servicePort, procRoot);
  if (owners.length === 0) {
    throw new Error(`Frontend service port ${servicePort} is occupied but its owning process could not be verified`);
  }

  const stale = owners.filter((owner) =>
    owner.pid !== process.pid &&
    owner.startTimeTicks < controllerStartTimeTicks &&
    isVerifiedMoneyScoutVite(owner, repoRoot),
  );
  if (stale.length !== owners.length) {
    const unsafePids = owners.filter((owner) => !stale.some((candidate) => candidate.pid === owner.pid)).map((owner) => owner.pid);
    throw new Error(`Frontend service port ${servicePort} is owned by an unverified or newer process; refusing takeover (pids: ${unsafePids.join(",")})`);
  }

  const pids = stale.map((owner) => owner.pid);
  log("stale_vite_takeover_started", { servicePort, pids });
  for (const owner of stale) signalExactProcess(owner.pid, "SIGTERM");
  if (!(await waitForPortFree(servicePort, 5_000))) {
    log("stale_vite_takeover_force_kill", { servicePort, pids });
    for (const owner of stale) signalExactProcess(owner.pid, "SIGKILL");
  }
  if (!(await waitForPortFree(servicePort, 3_000))) {
    throw new Error(`Frontend service port ${servicePort} remained occupied after terminating verified stale Money Scout Vite listener(s)`);
  }
  log("stale_vite_takeover_complete", { servicePort, pids });
  return { takenOver: true, pids };
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

  const selfIdentity = await readProcessIdentity(process.pid);
  const controllerStartTimeTicks = selfIdentity?.startTimeTicks ?? Number.MAX_SAFE_INTEGER;
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
  await takeoverVerifiedStaleMoneyScoutVite({ servicePort, repoRoot, controllerStartTimeTicks, log });
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
