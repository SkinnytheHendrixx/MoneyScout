import { Router, type IRouter } from "express";
import { asc, eq } from "drizzle-orm";
import { db, evidenceTable, opportunitiesTable } from "@workspace/db";
import {
  CreateEvidenceBody,
  CreateEvidenceParams,
  CreateEvidenceResponse,
  DeleteEvidenceParams,
  GetEvidenceParams,
  GetEvidenceResponse,
  ListEvidenceParams,
  ListEvidenceResponse,
  UpdateEvidenceBody,
  UpdateEvidenceParams,
  UpdateEvidenceResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

const toDateOnly = (value: Date) => value.toISOString().slice(0, 10);

const toApi = (row: typeof evidenceTable.$inferSelect) => ({
  id: row.id,
  claim: row.claim,
  source_url: row.sourceUrl,
  source_title: row.sourceTitle,
  observed_date: row.observedDate,
  classification: row.classification,
  opportunity_id: row.opportunityId,
  evaluation_dimension: row.evaluationDimension,
});

router.get("/opportunities/:opportunityId/evidence", async (req, res): Promise<void> => {
  const params = ListEvidenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const rows = await db.select().from(evidenceTable).where(eq(evidenceTable.opportunityId, params.data.opportunityId)).orderBy(asc(evidenceTable.observedDate));
  res.json(ListEvidenceResponse.parse(rows.map(toApi)));
});

router.post("/opportunities/:opportunityId/evidence", async (req, res): Promise<void> => {
  const params = CreateEvidenceParams.safeParse(req.params);
  const body = CreateEvidenceBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [parent] = await db.select({ id: opportunitiesTable.id }).from(opportunitiesTable).where(eq(opportunitiesTable.id, params.data.opportunityId));
  if (!parent) {
    res.status(404).json({ error: "Opportunity not found" });
    return;
  }
  const [created] = await db.insert(evidenceTable).values({
    claim: body.data.claim,
    sourceUrl: body.data.source_url,
    sourceTitle: body.data.source_title,
    observedDate: toDateOnly(body.data.observed_date),
    classification: body.data.classification,
    opportunityId: params.data.opportunityId,
    evaluationDimension: body.data.evaluation_dimension,
  }).returning();
  res.status(201).json(CreateEvidenceResponse.parse(toApi(created)));
});

router.get("/evidence/:id", async (req, res): Promise<void> => {
  const params = GetEvidenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [row] = await db.select().from(evidenceTable).where(eq(evidenceTable.id, params.data.id));
  if (!row) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }
  res.json(GetEvidenceResponse.parse(toApi(row)));
});

router.patch("/evidence/:id", async (req, res): Promise<void> => {
  const params = UpdateEvidenceParams.safeParse(req.params);
  const body = UpdateEvidenceBody.safeParse(req.body);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  if (!body.success) {
    res.status(400).json({ error: body.error.message });
    return;
  }
  const [updated] = await db.update(evidenceTable).set({
    claim: body.data.claim,
    sourceUrl: body.data.source_url,
    sourceTitle: body.data.source_title,
    observedDate: toDateOnly(body.data.observed_date),
    classification: body.data.classification,
    opportunityId: body.data.opportunity_id,
    evaluationDimension: body.data.evaluation_dimension,
  }).where(eq(evidenceTable.id, params.data.id)).returning();
  if (!updated) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }
  res.json(UpdateEvidenceResponse.parse(toApi(updated)));
});

router.delete("/evidence/:id", async (req, res): Promise<void> => {
  const params = DeleteEvidenceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }
  const [deleted] = await db.delete(evidenceTable).where(eq(evidenceTable.id, params.data.id)).returning();
  if (!deleted) {
    res.status(404).json({ error: "Evidence not found" });
    return;
  }
  res.sendStatus(204);
});

export default router;