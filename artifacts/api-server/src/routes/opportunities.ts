import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import {
  db,
  evidenceTable,
  opportunitiesTable,
} from "@workspace/db";
import {
  CreateOpportunityBody,
  CreateOpportunityResponse,
  DeleteOpportunityParams,
  GetOpportunityParams,
  GetOpportunityResponse,
  ListOpportunitiesResponse,
  UpdateOpportunityBody,
  UpdateOpportunityParams,
  UpdateOpportunityResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const toApi = (row: typeof opportunitiesTable.$inferSelect) => ({
  id: row.id,
  name: row.name,
  source_platform: row.sourcePlatform,
  source_url: row.sourceUrl,
  opportunity_type: row.opportunityType,
  thesis: row.thesis,
  first_seen: row.firstSeen,
  last_researched: row.lastResearched,
  status: row.status,
  overall_score: row.overallScore,
  policy_status: row.policyStatus,
  verdict: row.verdict,
  kill_reason: row.killReason,
  engine_family: row.engineFamily,
});

const fromApi = (data: typeof CreateOpportunityBody._type) => ({
  name: data.name,
  sourcePlatform: data.source_platform,
  sourceUrl: data.source_url,
  opportunityType: data.opportunity_type,
  thesis: data.thesis,
  firstSeen: toDateOnly(data.first_seen),
  lastResearched: toDateOnly(data.last_researched),
  status: data.status,
  overallScore: data.overall_score,
  policyStatus: data.policy_status,
  verdict: data.verdict,
  killReason: data.kill_reason ?? null,
  engineFamily: data.engine_family,
});

router.get("/opportunities", async (_req, res): Promise<void> => {
  const rows = await db.select().from(opportunitiesTable).orderBy(asc(opportunitiesTable.name));
  res.json(ListOpportunitiesResponse.parse(rows.map(toApi)));
});

router.post("/opportunities", async (req, res): Promise<void> => {
  const body = CreateOpportunityBody.safeParse(req.body);
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [created] = await db.insert(opportunitiesTable).values(fromApi(body.data)).returning();
  res.status(201).json(CreateOpportunityResponse.parse(toApi(created)));
});

router.get("/opportunities/:id", async (req, res): Promise<void> => {
  const params = GetOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [opportunity] = await db.select().from(opportunitiesTable).where(eq(opportunitiesTable.id, params.data.id));
  if (!opportunity) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const evidence = await db.select().from(evidenceTable).where(eq(evidenceTable.opportunityId, opportunity.id)).orderBy(asc(evidenceTable.observedDate));
  res.json(GetOpportunityResponse.parse({
    ...toApi(opportunity),
    evidence: evidence.map((row) => ({
      id: row.id,
      claim: row.claim,
      source_url: row.sourceUrl,
      source_title: row.sourceTitle,
      observed_date: row.observedDate,
      classification: row.classification,
      opportunity_id: row.opportunityId,
      evaluation_dimension: row.evaluationDimension,
    })),
  }));
});

router.patch("/opportunities/:id", async (req, res): Promise<void> => {
  const params = UpdateOpportunityParams.safeParse(req.params);
  const body = UpdateOpportunityBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db.update(opportunitiesTable).set(fromApi(body.data)).where(eq(opportunitiesTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.json(UpdateOpportunityResponse.parse(toApi(updated)));
});

router.delete("/opportunities/:id", async (req, res): Promise<void> => {
  const params = DeleteOpportunityParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(opportunitiesTable).where(eq(opportunitiesTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;