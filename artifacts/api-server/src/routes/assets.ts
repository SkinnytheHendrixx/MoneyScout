import { asc, desc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  assetEventsTable,
  assetHealthChecksTable,
  assetIncidentsTable,
  assetObservationsTable,
  assetsTable,
  db,
  type AssetObservationProvenance,
  type AssetObservationType,
} from "@workspace/db";
import { probeAssetHealth, recordAssetObservation } from "../lib/asset-operations-worker";

const router: IRouter = Router();
const OBSERVATION_TYPES = new Set<AssetObservationType>(["REVENUE", "COST", "TRANSACTION", "USAGE", "SUPPORT", "CUSTOM"]);
const PROVENANCE_TYPES = new Set<AssetObservationProvenance>(["FACT", "CLAIM", "INFERENCE", "UNKNOWN"]);

function positiveId(raw: string | undefined): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

router.get("/assets", async (_req, res): Promise<void> => {
  const assets = await db.select().from(assetsTable).orderBy(desc(assetsTable.activatedAt), desc(assetsTable.id));
  res.json({ assets });
});

router.get("/opportunities/:opportunityId/asset", async (req, res): Promise<void> => {
  const opportunityId = positiveId(req.params.opportunityId);
  if (!opportunityId) {
    res.status(400).json({ error: "Invalid opportunity id" });
    return;
  }
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.opportunityId, opportunityId));
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  res.json({ asset });
});

router.get("/assets/:assetId", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, assetId));
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  const [incidents, recentHealth, recentObservations] = await Promise.all([
    db.select().from(assetIncidentsTable).where(eq(assetIncidentsTable.assetId, assetId)).orderBy(desc(assetIncidentsTable.detectedAt)).limit(50),
    db.select().from(assetHealthChecksTable).where(eq(assetHealthChecksTable.assetId, assetId)).orderBy(desc(assetHealthChecksTable.checkedAt)).limit(25),
    db.select().from(assetObservationsTable).where(eq(assetObservationsTable.assetId, assetId)).orderBy(desc(assetObservationsTable.observedAt)).limit(50),
  ]);
  res.json({ asset, incidents, recent_health_checks: recentHealth, recent_observations: recentObservations });
});

router.get("/assets/:assetId/events", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  const events = await db.select().from(assetEventsTable).where(eq(assetEventsTable.assetId, assetId)).orderBy(asc(assetEventsTable.occurredAt)).limit(500);
  res.json({ asset_id: assetId, events });
});

router.get("/assets/:assetId/health-checks", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  const checks = await db.select().from(assetHealthChecksTable).where(eq(assetHealthChecksTable.assetId, assetId)).orderBy(desc(assetHealthChecksTable.checkedAt)).limit(200);
  res.json({ asset_id: assetId, health_checks: checks });
});

router.get("/assets/:assetId/observations", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  const observations = await db.select().from(assetObservationsTable).where(eq(assetObservationsTable.assetId, assetId)).orderBy(desc(assetObservationsTable.observedAt)).limit(500);
  res.json({ asset_id: assetId, observations });
});

router.post("/assets/:assetId/observations", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  const observationType = String(req.body?.observation_type ?? "").toUpperCase() as AssetObservationType;
  const provenance = String(req.body?.provenance ?? "UNKNOWN").toUpperCase() as AssetObservationProvenance;
  const source = typeof req.body?.source === "string" ? req.body.source.trim() : "";
  const idempotencyKey = typeof req.body?.idempotency_key === "string" ? req.body.idempotency_key.trim() : "";
  const observedAt = new Date(req.body?.observed_at ?? Date.now());

  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  if (!OBSERVATION_TYPES.has(observationType) || !PROVENANCE_TYPES.has(provenance) || !source || !idempotencyKey || Number.isNaN(observedAt.getTime())) {
    res.status(400).json({ error: "observation_type, source, idempotency_key, valid observed_at, and valid provenance are required." });
    return;
  }

  try {
    const result = await recordAssetObservation({
      assetId,
      observationType,
      source,
      idempotencyKey,
      provenance,
      amountCents: req.body?.amount_cents == null ? null : Number(req.body.amount_cents),
      quantity: req.body?.quantity == null ? null : Number(req.body.quantity),
      unit: typeof req.body?.unit === "string" ? req.body.unit : null,
      externalReference: typeof req.body?.external_reference === "string" ? req.body.external_reference : null,
      metadata: req.body?.metadata && typeof req.body.metadata === "object" && !Array.isArray(req.body.metadata) ? req.body.metadata : {},
      observedAt,
    });
    res.status(result.created ? 201 : 200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to ingest observation";
    if (message === "ASSET_NOT_FOUND") {
      res.status(404).json({ error: message });
      return;
    }
    res.status(400).json({ error: message });
  }
});

router.post("/assets/:assetId/check-health", async (req, res): Promise<void> => {
  const assetId = positiveId(req.params.assetId);
  if (!assetId) {
    res.status(400).json({ error: "Invalid asset id" });
    return;
  }
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, assetId));
  if (!asset) {
    res.status(404).json({ error: "Asset not found" });
    return;
  }
  if (asset.status === "KILLED" || asset.status === "ARCHIVED") {
    res.status(409).json({ error: "Asset is not eligible for health checks in its current status." });
    return;
  }
  const health = await probeAssetHealth(asset);
  const [updated] = await db.select().from(assetsTable).where(eq(assetsTable.id, assetId));
  res.json({ health, asset: updated });
});

export default router;
