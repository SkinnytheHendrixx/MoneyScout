import { desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  buildJobsTable,
  builderWorkspaceEventsTable,
  builderWorkspacesTable,
  db,
} from "@workspace/db";

const router: IRouter = Router();

router.get("/build-jobs/:buildJobId/workspace", async (req, res): Promise<void> => {
  const buildJobId = Number(req.params.buildJobId);
  if (!Number.isInteger(buildJobId) || buildJobId <= 0) {
    res.status(400).json({ error: "Invalid build job id" });
    return;
  }
  const [job] = await db.select().from(buildJobsTable).where(eq(buildJobsTable.id, buildJobId));
  if (!job) {
    res.status(404).json({ error: "Build job not found" });
    return;
  }
  const [workspace] = await db.select().from(builderWorkspacesTable).where(eq(builderWorkspacesTable.buildJobId, buildJobId));
  const events = workspace
    ? await db.select().from(builderWorkspaceEventsTable)
        .where(eq(builderWorkspaceEventsTable.workspaceId, workspace.id))
        .orderBy(desc(builderWorkspaceEventsTable.occurredAt))
        .limit(100)
    : [];
  res.json({ build_job: job, workspace: workspace ?? null, events });
});

router.get("/opportunities/:opportunityId/builder-workspaces", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const workspaces = await db.select().from(builderWorkspacesTable)
    .where(eq(builderWorkspacesTable.opportunityId, opportunityId))
    .orderBy(desc(builderWorkspacesTable.createdAt));
  res.json({ opportunity_id: opportunityId, workspaces });
});

export default router;
