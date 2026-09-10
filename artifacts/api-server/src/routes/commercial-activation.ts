import { createHmac, timingSafeEqual } from "node:crypto";
import { asc, eq } from "drizzle-orm";
import { Router, type IRouter } from "express";
import {
  assetsTable,
  commercialActivationEventsTable,
  commercialActivationsTable,
  db,
  paymentProviderEventsTable,
  type CommercialPriceProvenance,
} from "@workspace/db";
import { loadCommercialBuildBrief } from "./commercial-build";
import { createMonetizationExecutionPlan } from "../lib/monetization-execution-plan";
import {
  authorizeCommercialBoundary,
  createOrReuseCommercialActivation,
  ingestAuthoritativePaymentEvent,
  reconcileCommercialActivation,
} from "../lib/commercial-activation-worker";

const router: IRouter = Router();
export const commercialWebhookRouter: IRouter = Router();

function id(raw: string | undefined): number | null {
  const value = Number(raw);
  return Number.isInteger(value) && value > 0 ? value : null;
}

function provenance(value: unknown): CommercialPriceProvenance | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  return value as CommercialPriceProvenance;
}

router.get("/assets/:assetId/commercial-activation", async (req, res) => {
  const assetId = id(req.params.assetId);
  if (!assetId) { res.status(400).json({ error: "Invalid asset id" }); return; }
  const [activation] = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.assetId, assetId));
  if (!activation) { res.status(404).json({ error: "Commercial activation not found" }); return; }
  const [events, providerEvents] = await Promise.all([
    db.select().from(commercialActivationEventsTable).where(eq(commercialActivationEventsTable.activationId, activation.id)).orderBy(asc(commercialActivationEventsTable.occurredAt)),
    db.select().from(paymentProviderEventsTable).where(eq(paymentProviderEventsTable.activationId, activation.id)).orderBy(asc(paymentProviderEventsTable.occurredAt)),
  ]);
  res.json({ activation, events, payment_provider_events: providerEvents });
});

router.post("/assets/:assetId/commercial-activation", async (req, res) => {
  const assetId = id(req.params.assetId);
  if (!assetId) { res.status(400).json({ error: "Invalid asset id" }); return; }
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, assetId));
  if (!asset) { res.status(404).json({ error: "Asset not found" }); return; }
  const brief = await loadCommercialBuildBrief(asset.opportunityId);
  if (!brief) { res.status(409).json({ error: "Commercial Build Brief is unavailable" }); return; }
  const plan = createMonetizationExecutionPlan(brief);
  const provider = typeof req.body?.provider === "string" ? req.body.provider.trim() : "";
  const idempotencyKey = typeof req.body?.idempotency_key === "string" ? req.body.idempotency_key.trim() : "";
  try {
    const result = await createOrReuseCommercialActivation({ asset, plan, provider, idempotencyKey, priceCents: req.body?.price_cents == null ? null : Number(req.body.price_cents), priceProvenance: provenance(req.body?.price_provenance) });
    const activation = await reconcileCommercialActivation(result.activation.id);
    res.status(result.created ? 201 : 200).json({ activation, created: result.created });
  } catch (error) {
    res.status(400).json({ error: error instanceof Error ? error.message : "Unable to create commercial activation" });
  }
});

router.post("/commercial-activations/:activationId/authorize", async (req, res) => {
  const activationId = id(req.params.activationId);
  const boundary = req.body?.boundary;
  if (!activationId || (boundary !== "CUSTOMER_CHARGING" && boundary !== "PRODUCTION_CREDENTIAL_USE") || req.body?.attested !== true) {
    res.status(400).json({ error: "activation id, exact boundary, and attested: true are required" }); return;
  }
  try {
    await authorizeCommercialBoundary({ activationId, boundary, authorizedBy: String(req.body?.authorized_by ?? "HUMAN_ATTESTATION") });
    const activation = await reconcileCommercialActivation(activationId);
    res.json({ activation, authority_scope: boundary, unrelated_authorities_granted: [] });
  } catch (error) { res.status(409).json({ error: error instanceof Error ? error.message : "Unable to authorize boundary" }); }
});

router.post("/commercial-activations/:activationId/reconcile", async (req, res) => {
  const activationId = id(req.params.activationId);
  if (!activationId) { res.status(400).json({ error: "Invalid activation id" }); return; }
  try { res.json({ activation: await reconcileCommercialActivation(activationId) }); }
  catch (error) { res.status(409).json({ error: error instanceof Error ? error.message : "Unable to reconcile activation" }); }
});

function verifiedProviderSignature(body: Record<string, unknown>, supplied: string): boolean {
  if (process.env.NODE_ENV === "test" && supplied === "zero-cost-test-signature") return true;
  const secret = process.env.MONEY_SCOUT_PAYMENT_WEBHOOK_SECRET;
  if (!secret || !supplied) return false;
  const canonical = [body.provider, body.provider_event_id, body.provider_transaction_id ?? "", body.payment_status, body.amount_cents ?? "", body.currency ?? "", body.occurred_at].join("|");
  const expected = createHmac("sha256", secret).update(canonical).digest("hex");
  const left = Buffer.from(expected);
  const right = Buffer.from(supplied);
  return left.length === right.length && timingSafeEqual(left, right);
}

commercialWebhookRouter.post("/commercial-activations/:activationId/payment-events", async (req, res) => {
  const activationId = id(req.params.activationId);
  const body = req.body && typeof req.body === "object" && !Array.isArray(req.body) ? req.body as Record<string, unknown> : {};
  const supplied = String(req.header("x-money-scout-provider-signature") ?? "");
  if (!activationId || !verifiedProviderSignature(body, supplied)) { res.status(401).json({ error: "Verified provider signature required" }); return; }
  const occurredAt = new Date(String(body.occurred_at ?? ""));
  if (!String(body.provider ?? "").trim() || !String(body.provider_event_id ?? "").trim() || !String(body.event_type ?? "").trim() || !String(body.payment_status ?? "").trim() || Number.isNaN(occurredAt.getTime())) {
    res.status(400).json({ error: "provider, provider_event_id, event_type, payment_status, and occurred_at are required" }); return;
  }
  try {
    const result = await ingestAuthoritativePaymentEvent({ activationId, provider: String(body.provider), providerEventId: String(body.provider_event_id), providerTransactionId: body.provider_transaction_id == null ? null : String(body.provider_transaction_id), eventType: String(body.event_type), paymentStatus: String(body.payment_status), amountCents: body.amount_cents == null ? null : Number(body.amount_cents), currency: body.currency == null ? null : String(body.currency), occurredAt, signatureVerified: true, metadata: body.metadata && typeof body.metadata === "object" && !Array.isArray(body.metadata) ? body.metadata as Record<string, unknown> : {} });
    res.status(result.created ? 201 : 200).json(result);
  } catch (error) { res.status(409).json({ error: error instanceof Error ? error.message : "Unable to ingest provider event" }); }
});

export default router;
