import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, qaRunEventsTable, qaRunsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/build-jobs/:buildJobId/qa-runs", async (req, res): Promise<void> => {
  const buildJobId = Number(req.params.buildJobId);
  if (!Number.isInteger(buildJobId) || buildJobId <= 0) {
    res.status(400).json({ error: "Invalid build job id" });
    return;
  }
  const runs = await db.select().from(qaRunsTable).where(eq(qaRunsTable.buildJobId, buildJobId)).orderBy(desc(qaRunsTable.roundNumber));
  res.json({ build_job_id: buildJobId, qa_runs: runs });
});

router.get("/qa-runs/:qaRunId/events", async (req, res): Promise<void> => {
  const qaRunId = Number(req.params.qaRunId);
  if (!Number.isInteger(qaRunId) || qaRunId <= 0) {
    res.status(400).json({ error: "Invalid QA run id" });
    return;
  }
  const events = await db.select().from(qaRunEventsTable).where(eq(qaRunEventsTable.qaRunId, qaRunId)).orderBy(desc(qaRunEventsTable.occurredAt));
  res.json({ qa_run_id: qaRunId, events });
});

router.get("/opportunities/:opportunityId/qa-runs", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const runs = await db.select().from(qaRunsTable).where(eq(qaRunsTable.opportunityId, opportunityId)).orderBy(desc(qaRunsTable.createdAt));
  res.json({ opportunity_id: opportunityId, qa_runs: runs });
});

export default router;
