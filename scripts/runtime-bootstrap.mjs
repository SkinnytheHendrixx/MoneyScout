#!/usr/bin/env node
import { spawn } from "node:child_process";
import net from "node:net";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { setTimeout as sleep } from "node:timers/promises";

export function runtimeBootstrapRepoRoot(scriptUrl = import.meta.url) {
  const scriptPath = fileURLToPath(scriptUrl);
  return path.resolve(path.dirname(scriptPath), "..");
}

export function runtimeControllerScript(role, repoRoot) {
  return role === "web"
    ? path.join(repoRoot, "scripts/frontend-runtime-follower.mjs")
    : path.join(repoRoot, "scripts/runtime-supervisor.mjs");
}

async function bindProbe(port) {
  return await new Promise((resolve, reject) => {
    const server = net.createServer();
    server.unref();
    server.once("error", (error) => {
      if (error?.code === "EADDRINUSE" || error?.code === "EACCES") {
        resolve(null);
        return;
      }
      reject(error);
    });
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => {
      const address = server.address();
      const selectedPort = typeof address === "object" && address ? address.port : null;
      server.close((error) => {
        if (error) reject(error);
        else resolve(selectedPort);
      });
    });
  });
}

export async function selectRuntimePreflightPort(basePort, preferredPort = null) {
  const parsedBase = Number(basePort);
  if (!Number.isInteger(parsedBase) || parsedBase <= 0 || parsedBase > 65535) {
    throw new Error(`Invalid runtime port: ${basePort}`);
  }

  const explicitPreferred = preferredPort == null || preferredPort === ""
    ? null
    : Number(preferredPort);
  if (explicitPreferred !== null) {
    if (!Number.isInteger(explicitPreferred) || explicitPreferred <= 0 || explicitPreferred > 65535 || explicitPreferred === parsedBase) {
      throw new Error(`Invalid preflight port: ${preferredPort}`);
    }
    const available = await bindProbe(explicitPreferred);
    if (available !== null) return available;
  }

  const deterministicPreferred = parsedBase <= 55535 ? parsedBase + 10_000 : null;
  if (deterministicPreferred && deterministicPreferred !== explicitPreferred) {
    const available = await bindProbe(deterministicPreferred);
    if (available !== null) return available;
  }

  for (let attempt = 0; attempt < 8; attempt += 1) {
    const selected = await bindProbe(0);
    if (selected !== null && selected !== parsedBase) return selected;
  }
  throw new Error("Unable to allocate a free runtime preflight port");
}

export async function runRuntimeBootstrap(roleInput = process.argv[2]) {
  const role = roleInput === "web" ? "web" : "api";
  const repoRoot = runtimeBootstrapRepoRoot();
  const childScript = runtimeControllerScript(role, repoRoot);
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
    const childEnv = {
      ...process.env,
      MONEY_SCOUT_REPO_ROOT: process.env.MONEY_SCOUT_REPO_ROOT || repoRoot,
    };

    if (role === "api") {
      const selectedPreflightPort = await selectRuntimePreflightPort(
        process.env.PORT || "8080",
        process.env.MONEY_SCOUT_RUNTIME_PREFLIGHT_PORT,
      );
      childEnv.MONEY_SCOUT_RUNTIME_PREFLIGHT_PORT = String(selectedPreflightPort);
      log("preflight_port_selected", { port: selectedPreflightPort });
    }

    log("controller_starting", { controller: path.basename(childScript) });
    child = spawn(process.execPath, [childScript], {
      cwd: repoRoot,
      env: childEnv,
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
}

const invokedDirectly = process.argv[1]
  ? import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
  : false;

if (invokedDirectly) {
  void runRuntimeBootstrap();
}
