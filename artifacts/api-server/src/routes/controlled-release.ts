import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import { db, releaseEventsTable, releaseJobsTable } from "@workspace/db";
import {
  authorizePublicReleaseSafely,
  authorizeReleaseSpendSafely,
} from "../lib/controlled-release-safety";

const router: IRouter = Router();

router.get("/opportunities/:opportunityId/releases", async (req, res): Promise<void> => {
  const opportunityId = Number(req.params.opportunityId);
  if (!Number.isInteger(opportunityId) || opportunityId <= 0) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const releases = await db
    .select()
    .from(releaseJobsTable)
    .where(eq(releaseJobsTable.opportunityId, opportunityId))
    .orderBy(asc(releaseJobsTable.createdAt));
  res.json({ opportunity_id: opportunityId, releases });
});

router.get("/release-jobs/:releaseJobId", async (req, res): Promise<void> => {
  const releaseJobId = Number(req.params.releaseJobId);
  if (!Number.isInteger(releaseJobId) || releaseJobId <= 0) {
    res.status(400).json({ error: "Invalid release job id" });
    return;
  }
  const [release] = await db.select().from(releaseJobsTable).where(eq(releaseJobsTable.id, releaseJobId));
  if (!release) {
    res.status(404).json({ error: "Release job not found" });
    return;
  }
  res.json({ release });
});

router.get("/release-jobs/:releaseJobId/events", async (req, res): Promise<void> => {
  const releaseJobId = Number(req.params.releaseJobId);
  if (!Number.isInteger(releaseJobId) || releaseJobId <= 0) {
    res.status(400).json({ error: "Invalid release job id" });
    return;
  }
  const events = await db
    .select()
    .from(releaseEventsTable)
    .where(eq(releaseEventsTable.releaseJobId, releaseJobId))
    .orderBy(asc(releaseEventsTable.occurredAt));
  res.json({ release_job_id: releaseJobId, events });
});

router.post("/release-jobs/:releaseJobId/authorize-public", async (req, res): Promise<void> => {
  const releaseJobId = Number(req.params.releaseJobId);
  if (!Number.isInteger(releaseJobId) || releaseJobId <= 0) {
    res.status(400).json({ error: "Invalid release job id" });
    return;
  }
  if (req.body?.attested !== true) {
    res.status(400).json({
      error: "Explicit attested: true is required to authorize a public release.",
    });
    return;
  }
  try {
    const release = await authorizePublicReleaseSafely({
      releaseJobId,
      authorizedBy: typeof req.body?.authorized_by === "string"
        ? req.body.authorized_by.slice(0, 200)
        : "HUMAN_ATTESTATION",
    });
    res.json({
      release,
      authority_scope: {
        public_release: true,
        customer_charging: false,
        custom_domain_purchase: false,
        outbound: false,
        advertising: false,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to authorize public release";
    if (message === "RELEASE_JOB_NOT_FOUND") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(409).json({ error: message });
  }
});

router.post("/release-jobs/:releaseJobId/authorize-spend", async (req, res): Promise<void> => {
  const releaseJobId = Number(req.params.releaseJobId);
  const ceilingCents = Number(req.body?.ceiling_cents);
  if (!Number.isInteger(releaseJobId) || releaseJobId <= 0) {
    res.status(400).json({ error: "Invalid release job id" });
    return;
  }
  if (req.body?.attested !== true || !Number.isInteger(ceilingCents) || ceilingCents <= 0) {
    res.status(400).json({
      error: "attested: true and a positive integer ceiling_cents are required.",
    });
    return;
  }
  try {
    const release = await authorizeReleaseSpendSafely({
      releaseJobId,
      ceilingCents,
      authorizedBy: typeof req.body?.authorized_by === "string"
        ? req.body.authorized_by.slice(0, 200)
        : "HUMAN_ATTESTATION",
    });
    res.json({ release, authorized_ceiling_cents: ceilingCents });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to authorize release spend";
    if (message === "RELEASE_JOB_NOT_FOUND") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(409).json({ error: message });
  }
});

export default router;
