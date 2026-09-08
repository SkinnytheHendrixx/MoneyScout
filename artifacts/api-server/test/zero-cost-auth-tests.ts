import assert from "node:assert/strict";
import express, { type Request, type Response } from "express";
import cookieParser from "cookie-parser";
import authRouter from "../src/routes/auth";
import healthRouter from "../src/routes/health";
import { authMiddleware } from "../src/middlewares/authMiddleware";
import { requireMoneyScoutAccess } from "../src/middlewares/authorizationMiddleware";

const run = async (name: string, test: () => Promise<void> | void) => {
  try {
    await test();
    console.log(`PASS ${name}`);
  } catch (error) {
    console.error(`FAIL ${name}`);
    throw error;
  }
};

const publicApp = express();
publicApp.use(cookieParser());
publicApp.use(authMiddleware);
publicApp.use("/api", authRouter);
const publicServer = publicApp.listen(0);
await new Promise<void>((resolve) => publicServer.once("listening", resolve));
const publicPort = (publicServer.address() as { port: number }).port;

const protectedApp = express();
protectedApp.use(cookieParser());
protectedApp.use(authMiddleware);
protectedApp.use("/api", healthRouter);
protectedApp.post("/api/discovery/runs", requireMoneyScoutAccess, (_req, res) => {
  res.status(202).json({ status: "fixture accepted" });
});
const protectedServer = protectedApp.listen(0);
await new Promise<void>((resolve) => protectedServer.once("listening", resolve));
const protectedPort = (protectedServer.address() as { port: number }).port;

await run("auth bootstrap remains public and returns signed-out state", async () => {
  const response = await fetch(`http://127.0.0.1:${publicPort}/api/auth/user`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { user: null, authorized: false });
});

await run("health remains public", async () => {
  const response = await fetch(`http://127.0.0.1:${protectedPort}/api/healthz`);
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { status: "ok" });
});

await run("unauthenticated protected request returns 401", async () => {
  const response = await fetch(`http://127.0.0.1:${protectedPort}/api/discovery/runs`, {
    method: "POST",
  });
  assert.equal(response.status, 401);
});

await run("unauthorized authenticated user returns 403", () => {
  delete process.env.MONEY_SCOUT_ALLOWED_USER_IDS;
  let nextCalled = false;
  const request = {
    isAuthenticated: () => true,
    user: { id: "fixture-user" },
  } as unknown as Request;
  const response = {
    status(code: number) {
      assert.equal(code, 403);
      return this;
    },
    json(body: unknown) {
      assert.deepEqual(body, {
        error: "Money Scout access is not approved for this account",
      });
      return this;
    },
  } as unknown as Response;
  requireMoneyScoutAccess(request, response, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, false);
});

await run("authorized allowlisted user reaches protected handlers", () => {
  process.env.MONEY_SCOUT_ALLOWED_USER_IDS = "fixture-user";
  let nextCalled = false;
  const request = {
    isAuthenticated: () => true,
    user: { id: "fixture-user" },
  } as unknown as Request;
  const response = {} as Response;
  requireMoneyScoutAccess(request, response, () => {
    nextCalled = true;
  });
  assert.equal(nextCalled, true);
});

await run("Discovery trigger is rejected before any crawl starts", async () => {
  delete process.env.MONEY_SCOUT_ALLOWED_USER_IDS;
  const response = await fetch(`http://127.0.0.1:${protectedPort}/api/discovery/runs`, {
    method: "POST",
  });
  assert.equal(response.status, 401);
});

publicServer.close();
protectedServer.close();
delete process.env.MONEY_SCOUT_ALLOWED_USER_IDS;
console.log("All zero-cost auth boundary tests passed.");