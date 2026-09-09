import { desc, eq, inArray } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, executionJobEventsTable, executionJobsTable } from "@workspace/db";
import { executionQueueSnapshot, runExecutionKernelTick } from "../lib/execution-kernel";
import { runExecutionReconcilerTick } from "../lib/execution-reconciler";

const router: IRouter = Router();

const allowedStatuses = new Set([
  "QUEUED",
  "RUNNING",
  "WAITING",
  "HUMAN_BLOCKED",
  "WATCHING",
  "SUCCEEDED",
  "FAILED_TERMINAL",
  "CANCELLED",
]);

router.get("/execution/jobs", async (req, res): Promise<void> => {
  const raw = typeof req.query.status === "string" ? req.query.status.toUpperCase() : null;
  if (raw && !allowedStatuses.has(raw)) {
    res.status(400).json({ error: "Invalid execution job status" });
    return;
  }
  if (!raw) {
    res.json(await executionQueueSnapshot());
    return;
  }
  const rows = await db
    .select()
    .from(executionJobsTable)
    .where(inArray(executionJobsTable.status, [raw as typeof executionJobsTable.$inferSelect.status]))
    .orderBy(desc(executionJobsTable.createdAt))
    .limit(500);
  res.json({ jobs: rows });
});

router.get("/opportunities/:opportunityId/execution-jobs", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  res.json({ opportunity_id: opportunityId, ...(await executionQueueSnapshot(opportunityId)) });
});

router.get("/execution/jobs/:jobId/events", async (req, res): Promise<void> => {
  const jobId = Number(req.params.jobId);
  if (!Number.isInteger(jobId) || jobId <= 0) {
    res.status(400).json({ error: "Invalid execution job id" });
    return;
  }
  const [job] = await db.select().from(executionJobsTable).where(eq(executionJobsTable.id, jobId));
  if (!job) {
    res.status(404).json({ error: "Execution job not found" });
    return;
  }
  const events = await db
    .select()
    .from(executionJobEventsTable)
    .where(eq(executionJobEventsTable.jobId, jobId))
    .orderBy(executionJobEventsTable.occurredAt);
  res.json({ job, events });
});

router.post("/execution/reconcile", async (_req, res): Promise<void> => {
  const rawPort = process.env.PORT;
  if (!rawPort || !Number.isFinite(Number(rawPort))) {
    res.status(503).json({ error: "PORT unavailable" });
    return;
  }
  const port = Number(rawPort);
  const handoffs = await runExecutionReconcilerTick(port);
  const kernel = await runExecutionKernelTick(port);
  res.json({ handoffs, kernel, external_cost_usd: 0 });
});

export default router;
