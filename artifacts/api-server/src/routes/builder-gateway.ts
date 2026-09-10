import { eq } from "drizzle-orm";
import {
  Router,
  type IRouter,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { builderGatewayRunsTable, db } from "@workspace/db";
import {
  cancelBuilderGatewayRun,
  createOrReuseBuilderGatewayRun,
} from "../lib/builder-gateway";

const router: IRouter = Router();

function requireGatewayToken(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const expected = process.env.MONEY_SCOUT_BUILDER_GATEWAY_TOKEN?.trim();
  if (!expected && process.env.NODE_ENV === "test") {
    next();
    return;
  }
  if (!expected) {
    res
      .status(503)
      .json({ error: "BUILDER_GATEWAY_SHARED_SECRET_NOT_CONFIGURED" });
    return;
  }
  if (req.header("authorization") !== `Bearer ${expected}`) {
    res.status(401).json({ error: "BUILDER_GATEWAY_UNAUTHORIZED" });
    return;
  }
  next();
}

function providerState(
  status: string,
): "QUEUED" | "RUNNING" | "SUCCEEDED" | "FAILED" | "CANCELLED" {
  if (status === "QUEUED" || status === "PREPARING") return "QUEUED";
  if (status === "RUNNING" || status === "CANCELLING") return "RUNNING";
  if (status === "SUCCEEDED") return "SUCCEEDED";
  if (status === "CANCELLED") return "CANCELLED";
  return "FAILED";
}

function responseFor(run: typeof builderGatewayRunsTable.$inferSelect) {
  return {
    provider_run_id: String(run.id),
    gateway_run_id: run.id,
    state: providerState(run.status),
    terminal_outcome: run.terminalOutcome,
    branch_name: run.branchName,
    result_commit_sha: run.resultCommitSha,
    progress_percent:
      run.status === "SUCCEEDED" ? 100 : run.status === "RUNNING" ? 50 : null,
    summary: run.resultSummary,
    external_cost_cents: run.actualExternalCashCostCents,
    actual_external_cash_cost_cents: run.actualExternalCashCostCents,
    cost_provenance: run.costProvenance,
    usage: run.usage,
    entitlement_consumption: run.entitlementConsumption,
    challenge: run.challenge,
  };
}

router.use("/builder-gateway/v1", requireGatewayToken);

router.post("/builder-gateway/v1/builds", async (req, res): Promise<void> => {
  const buildJobId = Number(req.body?.build_job_id);
  const idempotencyKey = String(req.body?.idempotency_key ?? "").trim();
  if (!Number.isInteger(buildJobId) || buildJobId <= 0 || !idempotencyKey) {
    res
      .status(400)
      .json({ error: "build_job_id and idempotency_key are required" });
    return;
  }
  try {
    const result = await createOrReuseBuilderGatewayRun({
      buildJobId,
      idempotencyKey,
    });
    res.status(result.reused ? 200 : 202).json(responseFor(result.run));
  } catch (error) {
    res
      .status(409)
      .json({
        error:
          error instanceof Error
            ? error.message
            : "BUILDER_GATEWAY_START_FAILED",
      });
  }
});

router.post(
  "/builder-gateway/v1/builds/:providerRunId/repairs",
  async (req, res): Promise<void> => {
    const priorId = Number(req.params.providerRunId);
    const idempotencyKey = String(req.body?.idempotency_key ?? "").trim();
    const [prior] = await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.id, priorId));
    if (!prior || !idempotencyKey || !Array.isArray(req.body?.defects)) {
      res
        .status(400)
        .json({
          error: "Valid prior run, idempotency_key, and defects are required",
        });
      return;
    }
    const result = await createOrReuseBuilderGatewayRun({
      buildJobId: prior.buildJobId,
      idempotencyKey,
      repairDefects: req.body.defects,
    });
    res.status(result.reused ? 200 : 202).json(responseFor(result.run));
  },
);

router.get(
  "/builder-gateway/v1/builds/:providerRunId",
  async (req, res): Promise<void> => {
    const id = Number(req.params.providerRunId);
    const [run] = await db
      .select()
      .from(builderGatewayRunsTable)
      .where(eq(builderGatewayRunsTable.id, id));
    if (!run) {
      res.status(404).json({ error: "Builder Gateway run not found" });
      return;
    }
    res.status(200).json(responseFor(run));
  },
);

router.post(
  "/builder-gateway/v1/builds/:providerRunId/cancel",
  async (req, res): Promise<void> => {
    const id = Number(req.params.providerRunId);
    const run = await cancelBuilderGatewayRun(
      id,
      String(req.body?.reason ?? "Cancellation requested by Money Scout"),
    );
    if (!run) {
      res.status(404).json({ error: "Builder Gateway run not found" });
      return;
    }
    res.status(200).json(responseFor(run));
  },
);

export default router;
