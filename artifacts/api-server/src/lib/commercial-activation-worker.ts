import { createHash } from "node:crypto";
import { and, eq, inArray } from "drizzle-orm";
import {
  assetEventsTable,
  assetsTable,
  capabilitiesTable,
  commercialActivationEventsTable,
  commercialActivationsTable,
  db,
  humanActionsTable,
  paymentProviderEventsTable,
  type CommercialActivationStatus,
  type CommercialPriceProvenance,
} from "@workspace/db";
import type { MonetizationExecutionPlan } from "./monetization-execution-plan";
import { capabilityIsUsable, createOrReuseHumanAction, markHumanActionResolved, resolveOpenActionsForCapability, setCapabilityAvailable } from "./human-gates";
import { getCommercialPaymentAdapter } from "./commercial-payment-adapter";
import { recordAssetObservation } from "./asset-operations-worker";
import { logger } from "./logger";

const WORKER_MS = 10_000;
let timer: NodeJS.Timeout | null = null;
let running = false;

export const merchantCapabilityKey = (provider: string) => `PAYMENT_MERCHANT_ACCESS:${provider}`;
export const credentialCapabilityKey = (provider: string) => `PAYMENT_PRODUCTION_CREDENTIALS:${provider}`;

export function priceProvenanceIsDefensible(priceCents: number | null, value: CommercialPriceProvenance | null): boolean {
  if (!Number.isInteger(priceCents) || Number(priceCents) <= 0 || !value || value.schemaVersion !== 1) return false;
  if (!value.sourceReference.trim() || !Array.isArray(value.evidence) || !value.evidence.some((item) => item.trim())) return false;
  if (Number.isNaN(new Date(value.capturedAt).getTime())) return false;
  if (value.kind === "BOUNDED_HYPOTHESIS" && !value.rationale?.trim()) return false;
  return true;
}

function fingerprint(plan: MonetizationExecutionPlan): string {
  return createHash("sha256").update(JSON.stringify(plan)).digest("hex");
}

async function recordEvent(activation: typeof commercialActivationsTable.$inferSelect, eventType: string, summary: string, metadata: Record<string, unknown> = {}) {
  await db.insert(commercialActivationEventsTable).values({ activationId: activation.id, assetId: activation.assetId, eventType, summary, metadata });
  await db.insert(assetEventsTable).values({ assetId: activation.assetId, opportunityId: activation.opportunityId, eventType, summary, metadata: { commercial_activation_id: activation.id, ...metadata } });
}

async function transition(activation: typeof commercialActivationsTable.$inferSelect, status: CommercialActivationStatus, eventType: string, summary: string, extra: Partial<typeof commercialActivationsTable.$inferInsert> = {}) {
  const [updated] = await db.update(commercialActivationsTable).set({ status, updatedAt: new Date(), ...extra }).where(eq(commercialActivationsTable.id, activation.id)).returning();
  if (!updated) throw new Error("COMMERCIAL_ACTIVATION_NOT_FOUND");
  if (activation.status !== status || eventType.endsWith("FAILED")) await recordEvent(updated, eventType, summary);
  return updated;
}

async function capability(key: string) {
  const [value] = await db.select().from(capabilitiesTable).where(eq(capabilitiesTable.key, key));
  return value ?? null;
}

function merchantCapabilityVerified(value: typeof capabilitiesTable.$inferSelect | null): boolean {
  const metadata = value?.metadata as Record<string, unknown> | undefined;
  return Boolean(value && capabilityIsUsable(value) && metadata?.merchantVerified === true && typeof metadata.accountId === "string" && metadata.accountId.trim());
}

function credentialCapabilityVerified(value: typeof capabilitiesTable.$inferSelect | null): boolean {
  const metadata = value?.metadata as Record<string, unknown> | undefined;
  return Boolean(value && capabilityIsUsable(value) && metadata?.productionCredentialsVerified === true && metadata?.commercialActivationAllowed === true);
}

export async function createOrReuseCommercialActivation(input: {
  asset: typeof assetsTable.$inferSelect;
  plan: MonetizationExecutionPlan;
  provider: string;
  idempotencyKey: string;
  priceCents: number | null;
  priceProvenance: CommercialPriceProvenance | null;
}) {
  const existing = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.assetId, input.asset.id));
  if (existing[0]) return { activation: existing[0], created: false };
  if (!input.provider.trim() || !input.idempotencyKey.trim()) throw new Error("PROVIDER_AND_IDEMPOTENCY_KEY_REQUIRED");
  if (input.plan.opportunityId !== input.asset.opportunityId) throw new Error("MONETIZATION_PLAN_ASSET_MISMATCH");
  const hasPrice = priceProvenanceIsDefensible(input.priceCents, input.priceProvenance);
  const [activation] = await db.insert(commercialActivationsTable).values({
    assetId: input.asset.id,
    opportunityId: input.asset.opportunityId,
    idempotencyKey: input.idempotencyKey,
    status: hasPrice ? "DRAFT" : "BLOCKED_PRICE",
    planSnapshot: input.plan as unknown as Record<string, unknown>,
    planFingerprint: fingerprint(input.plan),
    provider: input.provider,
    priceCents: hasPrice ? input.priceCents : null,
    priceProvenance: hasPrice ? input.priceProvenance : null,
    providerOperationKey: `commercial-activation:${input.asset.assetKey}:${input.provider}`,
  }).onConflictDoNothing().returning();
  const row = activation ?? (await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.assetId, input.asset.id)))[0];
  if (!row) throw new Error("COMMERCIAL_ACTIVATION_CREATE_FAILED");
  if (activation) await recordEvent(row, "COMMERCIAL_ACTIVATION_CREATED", hasPrice ? "Commercial activation created from the existing Monetization Execution Plan." : "Commercial activation is blocked until a numeric offer has defensible provenance.", { plan_fingerprint: row.planFingerprint, provider: row.provider });
  return { activation: row, created: Boolean(activation) };
}

export async function updateCommercialOffer(input: { activationId: number; priceCents: number; priceProvenance: CommercialPriceProvenance }) {
  const [activation] = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.id, input.activationId));
  if (!activation) throw new Error("COMMERCIAL_ACTIVATION_NOT_FOUND");
  if (!["DRAFT", "BLOCKED_PRICE"].includes(activation.status)) throw new Error("COMMERCIAL_OFFER_LOCKED_AFTER_PREPARATION");
  if (!priceProvenanceIsDefensible(input.priceCents, input.priceProvenance)) throw new Error("DEFENSIBLE_PRICE_PROVENANCE_REQUIRED");
  const [updated] = await db.update(commercialActivationsTable).set({ priceCents: input.priceCents, priceProvenance: input.priceProvenance, status: "DRAFT", updatedAt: new Date() }).where(eq(commercialActivationsTable.id, activation.id)).returning();
  await recordEvent(updated!, "COMMERCIAL_OFFER_PROVENANCE_RECORDED", "Numeric offer and its defensible provenance were recorded without changing the Monetization Execution Plan.", { price_cents: input.priceCents, provenance_kind: input.priceProvenance.kind, source_reference: input.priceProvenance.sourceReference });
  return updated!;
}

async function humanAction(activation: typeof commercialActivationsTable.$inferSelect, input: { actionType: string; title: string; whyNeeded: string; instructions: string; capabilityKey: string | null; verificationMode?: "AUTOMATED_CHECK" | "HUMAN_ATTESTATION" }) {
  return createOrReuseHumanAction({
    opportunityId: activation.opportunityId,
    actionType: input.actionType,
    title: input.title,
    whyNeeded: input.whyNeeded,
    instructions: input.instructions,
    blockedStage: `COMMERCIAL_ACTIVATION:${activation.id}`,
    requiredCapabilityKey: input.capabilityKey,
    provider: activation.provider,
    verificationMode: input.verificationMode ?? "HUMAN_ATTESTATION",
    urgency: "HIGH",
    resumeAction: "RECHECK_COMMERCIAL_ACTIVATION",
    resumePayload: { asset_id: activation.assetId, commercial_activation_id: activation.id },
    inherentlyHumanAuthority: true,
  });
}

export async function reconcileCommercialActivation(activationId: number) {
  let [activation] = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.id, activationId));
  if (!activation) throw new Error("COMMERCIAL_ACTIVATION_NOT_FOUND");
  if (["ACTIVE", "FAILED", "UNCERTAIN", "CANCELLED"].includes(activation.status)) return activation;
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, activation.assetId));
  if (!asset) throw new Error("ASSET_NOT_FOUND");
  if (!priceProvenanceIsDefensible(activation.priceCents, activation.priceProvenance)) {
    return transition(activation, "BLOCKED_PRICE", "COMMERCIAL_PRICE_BLOCKED", "A numeric commercial offer with defensible provenance is required. No price was invented.");
  }

  const merchant = await capability(merchantCapabilityKey(activation.provider));
  if (!merchantCapabilityVerified(merchant)) {
    await humanAction(activation, { actionType: "VERIFY_PAYMENT_MERCHANT_CAPABILITY", title: "Verify merchant payment capability", whyNeeded: "An account record does not prove that the provider can accept real payments for this Asset.", instructions: "Complete provider merchant onboarding and confirm automation-ready access with merchantVerified, accountId, and provider verification evidence. Do not provide passwords or raw secrets.", capabilityKey: merchantCapabilityKey(activation.provider) });
    return transition(activation, "BLOCKED_MERCHANT_CAPABILITY", "COMMERCIAL_MERCHANT_BLOCKED", "Commercial activation is waiting for verified merchant capability.");
  }

  if (!asset.authorities.productionCredentialsAuthorized || !activation.productionCredentialsAuthorizedAt) {
    await humanAction(activation, { actionType: "AUTHORIZE_COMMERCIAL_PRODUCTION_CREDENTIAL_USE", title: "Authorize bounded production credential use", whyNeeded: "Preparing the real checkout requires production credentials, which public-release authority does not grant.", instructions: "Authorize production credentials only for this Asset, payment provider, and commercial activation. This does not authorize charging or any other side effect.", capabilityKey: null });
    return transition(activation, "BLOCKED_PRODUCTION_CREDENTIALS", "COMMERCIAL_CREDENTIAL_AUTHORITY_BLOCKED", "Commercial activation is waiting for bounded production-credential authority.");
  }
  const credentials = await capability(credentialCapabilityKey(activation.provider));
  if (!credentialCapabilityVerified(credentials)) {
    await humanAction(activation, { actionType: "CONNECT_PAYMENT_PRODUCTION_CREDENTIALS", title: "Connect verified payment production credentials", whyNeeded: "Authority exists, but Money Scout does not yet have verified automation-ready production credentials.", instructions: "Connect the provider through a supported secret bridge and confirm productionCredentialsVerified and commercialActivationAllowed. Never paste raw credentials into Money Scout.", capabilityKey: credentialCapabilityKey(activation.provider) });
    return transition(activation, "BLOCKED_PRODUCTION_CREDENTIALS", "COMMERCIAL_CREDENTIAL_CAPABILITY_BLOCKED", "Commercial activation is waiting for verified production credentials.");
  }

  const adapter = getCommercialPaymentAdapter(activation.provider);
  if (!adapter) {
    await humanAction(activation, { actionType: "CONNECT_PAYMENT_PROVIDER_ADAPTER", title: "Connect payment-provider runtime", whyNeeded: "Verified capabilities exist but no zero-cash commercial adapter is available to Money Scout.", instructions: "Connect the supported payment-provider bridge. This does not grant charging authority.", capabilityKey: `PAYMENT_PROVIDER_RUNTIME:${activation.provider}` });
    return transition(activation, "BLOCKED_PRODUCTION_CREDENTIALS", "COMMERCIAL_PROVIDER_RUNTIME_BLOCKED", "Commercial activation is waiting for its payment-provider runtime.");
  }
  const runtimeKey = `PAYMENT_PROVIDER_RUNTIME:${activation.provider}`;
  const runtime = await capability(runtimeKey);
  if (!runtime || !capabilityIsUsable(runtime)) {
    await setCapabilityAvailable({ key: runtimeKey, provider: activation.provider, verificationMethod: "COMMERCIAL_ADAPTER_CONFIGURED", metadata: { cost_mode: adapter.costMode, charging_authority_granted: false } });
    await resolveOpenActionsForCapability({ capabilityKey: runtimeKey, resolutionData: { detected_automatically: true, provider: activation.provider } });
  }

  const plan = activation.planSnapshot as unknown as MonetizationExecutionPlan;
  const input = { assetId: asset.id, opportunityId: asset.opportunityId, providerOperationKey: activation.providerOperationKey, currency: "USD" as const, priceCents: activation.priceCents!, productionUrl: asset.productionUrl, promisedOutcome: plan.firstTransaction.promisedOutcome };
  if (!activation.checkoutReference) {
    activation = await transition(activation, "PREPARING", "COMMERCIAL_PREPARATION_STARTED", "Preparing a disabled checkout using the approved offer.", { preparationAttemptCount: activation.preparationAttemptCount + 1 });
    try {
      const prepared = await adapter.prepare(input);
      if (prepared.chargingEnabled !== false) throw new Error("PREPARATION_ENABLED_CHARGING_WITHOUT_AUTHORITY");
      activation = await transition(activation, "AWAITING_CHARGING_AUTHORITY", "COMMERCIAL_PREPARATION_COMPLETE", "Checkout prepared with charging disabled.", { checkoutReference: prepared.checkoutReference, lastErrorCode: null, lastErrorMessage: null });
    } catch (error) {
      return transition(activation, "UNCERTAIN", "COMMERCIAL_PREPARATION_FAILED", "Payment-provider preparation outcome is uncertain; blind retry is prohibited.", { lastErrorCode: "PROVIDER_PREPARATION_UNCERTAIN", lastErrorMessage: error instanceof Error ? error.message.slice(0, 2_000) : "Unknown provider failure" });
    }
  }

  if (!asset.authorities.customerChargingAuthorized || !activation.chargingAuthorizedAt) {
    await humanAction(activation, { actionType: "AUTHORIZE_CUSTOMER_CHARGING", title: "Authorize customer charging", whyNeeded: "A prepared checkout cannot accept money until explicit CUSTOMER_CHARGING authority is granted for this Asset and offer.", instructions: "Review the provider, price, provenance, and promised outcome, then explicitly authorize CUSTOMER_CHARGING for this activation. No outbound, ads, domains, spend, or other permission is included.", capabilityKey: null });
    return activation.status === "AWAITING_CHARGING_AUTHORITY" ? activation : transition(activation, "AWAITING_CHARGING_AUTHORITY", "COMMERCIAL_CHARGING_AUTHORITY_BLOCKED", "Checkout is prepared but charging remains disabled pending explicit human authority.");
  }

  activation = await transition(activation, "VERIFYING", "COMMERCIAL_ACTIVATION_STARTED", "Activating and verifying the authorized commercial path.");
  try {
    const result = await adapter.activateAndVerify({ ...input, checkoutReference: activation.checkoutReference! });
    if (!result.transactionReady || !result.chargingEnabled) throw new Error("PROVIDER_DID_NOT_VERIFY_TRANSACTION_READY");
    return transition(activation, "ACTIVE", "COMMERCIAL_ACTIVATION_VERIFIED", "Commercial path is transaction-ready.", { checkoutReference: result.checkoutReference, transactionReady: true, activatedAt: new Date(), lastErrorCode: null, lastErrorMessage: null });
  } catch (error) {
    return transition(activation, "UNCERTAIN", "COMMERCIAL_ACTIVATION_UNCERTAIN", "Provider activation outcome is uncertain; Money Scout stopped without retrying.", { transactionReady: false, lastErrorCode: "PROVIDER_ACTIVATION_UNCERTAIN", lastErrorMessage: error instanceof Error ? error.message.slice(0, 2_000) : "Unknown provider failure" });
  }
}

export async function authorizeCommercialBoundary(input: { activationId: number; boundary: "CUSTOMER_CHARGING" | "PRODUCTION_CREDENTIAL_USE"; authorizedBy: string }) {
  const [activation] = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.id, input.activationId));
  if (!activation) throw new Error("COMMERCIAL_ACTIVATION_NOT_FOUND");
  const [asset] = await db.select().from(assetsTable).where(eq(assetsTable.id, activation.assetId));
  if (!asset) throw new Error("ASSET_NOT_FOUND");
  const now = new Date();
  const authorities = { ...asset.authorities };
  if (input.boundary === "CUSTOMER_CHARGING") authorities.customerChargingAuthorized = true;
  else authorities.productionCredentialsAuthorized = true;
  await db.update(assetsTable).set({ authorities, updatedAt: now }).where(eq(assetsTable.id, asset.id));
  const fields = input.boundary === "CUSTOMER_CHARGING"
    ? { chargingAuthorizedAt: now, chargingAuthorizedBy: input.authorizedBy }
    : { productionCredentialsAuthorizedAt: now, productionCredentialsAuthorizedBy: input.authorizedBy };
  const [updated] = await db.update(commercialActivationsTable).set({ ...fields, updatedAt: now }).where(eq(commercialActivationsTable.id, activation.id)).returning();
  await recordEvent(updated!, `COMMERCIAL_${input.boundary}_AUTHORIZED`, `${input.boundary} authority granted only for this commercial activation.`, { authorized_by: input.authorizedBy, unrelated_authorities_unchanged: true });
  const actionType = input.boundary === "CUSTOMER_CHARGING" ? "AUTHORIZE_CUSTOMER_CHARGING" : "AUTHORIZE_COMMERCIAL_PRODUCTION_CREDENTIAL_USE";
  const actions = await db.select().from(humanActionsTable).where(and(eq(humanActionsTable.opportunityId, activation.opportunityId), eq(humanActionsTable.actionType, actionType), eq(humanActionsTable.blockedStage, `COMMERCIAL_ACTIVATION:${activation.id}`), inArray(humanActionsTable.status, ["OPEN", "VERIFYING"])));
  for (const action of actions) await markHumanActionResolved({ actionId: action.id, resolutionData: { authorized_by: input.authorizedBy, authority_scope: input.boundary, commercial_activation_id: activation.id } });
  return updated!;
}

const SUCCESS = new Set(["PAID", "SUCCEEDED", "CAPTURED", "SETTLED"]);
export async function ingestAuthoritativePaymentEvent(input: { activationId: number; provider: string; providerEventId: string; providerTransactionId?: string | null; eventType: string; paymentStatus: string; amountCents?: number | null; currency?: string | null; occurredAt: Date; signatureVerified: boolean; metadata?: Record<string, unknown> }) {
  const [activation] = await db.select().from(commercialActivationsTable).where(eq(commercialActivationsTable.id, input.activationId));
  if (!activation || activation.provider !== input.provider) throw new Error("COMMERCIAL_ACTIVATION_PROVIDER_MISMATCH");
  if (!input.signatureVerified) throw new Error("PAYMENT_EVENT_SIGNATURE_REQUIRED");
  const successful = SUCCESS.has(input.paymentStatus.toUpperCase());
  if (successful && (activation.status !== "ACTIVE" || !activation.transactionReady)) throw new Error("COMMERCIAL_ACTIVATION_NOT_TRANSACTION_READY");
  if (successful && (!Number.isInteger(input.amountCents) || Number(input.amountCents) <= 0 || input.currency?.toUpperCase() !== activation.currency)) throw new Error("VALID_SUCCESSFUL_PAYMENT_AMOUNT_REQUIRED");
  const [event] = await db.insert(paymentProviderEventsTable).values({
    activationId: activation.id, assetId: activation.assetId, provider: input.provider, providerEventId: input.providerEventId,
    providerTransactionId: input.providerTransactionId ?? null, eventType: input.eventType, paymentStatus: input.paymentStatus.toUpperCase(),
    amountCents: input.amountCents ?? null, currency: input.currency?.toUpperCase() ?? null, authoritative: true, signatureVerified: true,
    processed: false, metadata: input.metadata ?? {}, occurredAt: input.occurredAt,
  }).onConflictDoNothing().returning();
  if (!event) return { created: false, countedAsRevenue: false };
  if (!successful) {
    await db.update(paymentProviderEventsTable).set({ processed: true }).where(eq(paymentProviderEventsTable.id, event.id));
    await recordEvent(activation, "PAYMENT_EVENT_RECORDED_NON_REVENUE", `Authoritative ${input.paymentStatus.toUpperCase()} payment event recorded without revenue recognition.`, { provider_event_id: input.providerEventId });
    return { created: true, countedAsRevenue: false };
  }
  const transactionKey = input.providerTransactionId?.trim() || input.providerEventId;
  await recordAssetObservation({ assetId: activation.assetId, observationType: "REVENUE", source: `PAYMENT_PROVIDER:${input.provider}`, idempotencyKey: `payment:${input.provider}:${transactionKey}:revenue`, provenance: "FACT", amountCents: input.amountCents!, unit: input.currency!.toUpperCase(), externalReference: transactionKey, metadata: { provider_event_id: input.providerEventId, commercial_activation_id: activation.id }, observedAt: input.occurredAt });
  await recordAssetObservation({ assetId: activation.assetId, observationType: "TRANSACTION", source: `PAYMENT_PROVIDER:${input.provider}`, idempotencyKey: `payment:${input.provider}:${transactionKey}:transaction`, provenance: "FACT", quantity: 1, unit: "TRANSACTIONS", externalReference: transactionKey, metadata: { provider_event_id: input.providerEventId, commercial_activation_id: activation.id }, observedAt: input.occurredAt });
  await db.update(paymentProviderEventsTable).set({ processed: true }).where(eq(paymentProviderEventsTable.id, event.id));
  await recordEvent(activation, "AUTHORITATIVE_REVENUE_RECORDED", "Authoritative successful provider payment recorded as FACT telemetry.", { provider_event_id: input.providerEventId, amount_cents: input.amountCents, currency: input.currency });
  return { created: true, countedAsRevenue: true };
}

export async function runCommercialActivationTick() {
  const rows = await db.select().from(commercialActivationsTable).where(inArray(commercialActivationsTable.status, ["DRAFT", "BLOCKED_PRICE", "BLOCKED_MERCHANT_CAPABILITY", "BLOCKED_PRODUCTION_CREDENTIALS", "AWAITING_CHARGING_AUTHORITY", "PREPARING", "VERIFYING"]));
  for (const row of rows) await reconcileCommercialActivation(row.id).catch((error) => logger.error({ err: error, commercialActivationId: row.id }, "Commercial activation reconciliation failed"));
  return rows.length;
}

export function startCommercialActivationWorker() {
  if (timer) return;
  timer = setInterval(() => { if (running) return; running = true; void runCommercialActivationTick().finally(() => { running = false; }); }, WORKER_MS);
  timer.unref();
  void runCommercialActivationTick();
}
