import assert from "node:assert/strict";
import { desc, eq } from "drizzle-orm";
import { assetObservationsTable, assetsTable, commercialActivationsTable, db, humanActionsTable, paymentProviderEventsTable, prepareAssetOperationsSchema, pool } from "@workspace/db";
import { authorizeCommercialBoundary, createOrReuseCommercialActivation, credentialCapabilityKey, ingestAuthoritativePaymentEvent, merchantCapabilityKey, priceProvenanceIsDefensible, reconcileCommercialActivation } from "../src/lib/commercial-activation-worker";
import { clearCommercialPaymentAdapters, createZeroCostCommercialFixtureAdapter, registerCommercialPaymentAdapter } from "../src/lib/commercial-payment-adapter";
import { setCapabilityAvailable } from "../src/lib/human-gates";
import type { MonetizationExecutionPlan } from "../src/lib/monetization-execution-plan";

await prepareAssetOperationsSchema(pool);
const [asset] = await db.select().from(assetsTable).orderBy(desc(assetsTable.id)).limit(1);
assert.ok(asset, "#74 Asset fixture must exist first");
const provider = `ZERO_COST_COMMERCIAL_${Date.now()}`;
const plan: MonetizationExecutionPlan = {
  schemaVersion: 1, opportunityId: asset.opportunityId, status: "READY_FOR_INTERNAL_BUILD", blockers: [], commercialNormalizationNeeded: [], resolutionProblems: [],
  firstTransaction: { testType: "PAID_PRODUCT_TRIAL", targetBuyerEvidence: ["Validated buyer fixture"], promisedOutcome: "Deliver one verified output", commercialCommitment: "One paid order", fulfillmentPath: ["Fulfill output"] },
  pricing: { evidence: ["https://evidence.example/pricing"], testPriceUsd: null, confidenceState: "DIRECTLY_OBSERVED", instruction: "Use observed price." },
  distribution: { evidence: ["Existing marketplace"], initialChannel: "marketplace", testInstruction: "No paid ads." },
  ventureBudget: { currency: "USD", internalBuildExternalSpendCeilingUsd: 0, launchExternalSpendCeilingUsd: 0, totalExternalSpendCeilingUsd: 0, ownerConfiguredCeilingRequiredBeforeSpend: true, rationale: "Zero cost fixture" },
  decisionContract: { successEvidence: ["Authoritative payment"], failureEvidence: ["No purchase"], iterateEvidence: ["Checkout friction"], prohibitedInference: ["Traffic is not revenue"] },
  autonomy: { allowedWithoutApproval: ["Prepare disabled checkout"], approvalRequiredFor: ["CUSTOMER_CHARGING", "PRODUCTION_CREDENTIAL_USE"], nextGate: "BUILD_ORCHESTRATOR" },
};
const priceProvenance = { schemaVersion: 1 as const, kind: "DIRECT_PROVIDER_PRICE" as const, sourceReference: "https://evidence.example/pricing", capturedAt: new Date().toISOString(), evidence: ["Provider lists the offer at $25."] };
assert.equal(priceProvenanceIsDefensible(2_500, priceProvenance), true);
assert.equal(priceProvenanceIsDefensible(2_500, { ...priceProvenance, evidence: [] }), false);
assert.equal(priceProvenanceIsDefensible(2_500, { ...priceProvenance, kind: "BOUNDED_HYPOTHESIS", rationale: "" }), false);

const created = await createOrReuseCommercialActivation({ asset, plan, provider, idempotencyKey: `commercial-${asset.id}-${provider}`, priceCents: 2_500, priceProvenance });
assert.equal(created.created, true);
assert.equal((await createOrReuseCommercialActivation({ asset, plan, provider, idempotencyKey: `different-${provider}`, priceCents: 9_999, priceProvenance })).created, false);
let activation = await reconcileCommercialActivation(created.activation.id);
assert.equal(activation.status, "BLOCKED_MERCHANT_CAPABILITY");
assert.equal(asset.status, "ACTIVE");

await setCapabilityAvailable({ key: merchantCapabilityKey(provider), provider, verificationMethod: "ACCOUNT_DISCOVERED", metadata: { accountExists: true } });
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.status, "BLOCKED_MERCHANT_CAPABILITY", "account existence cannot infer merchant capability");
await setCapabilityAvailable({ key: merchantCapabilityKey(provider), provider, verificationMethod: "PROVIDER_MERCHANT_VERIFICATION", metadata: { merchantVerified: true, accountId: "acct_fixture" } });
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.status, "BLOCKED_PRODUCTION_CREDENTIALS");
const actions = await db.select().from(humanActionsTable).where(eq(humanActionsTable.opportunityId, asset.opportunityId));
assert.ok(actions.some((item) => item.actionType === "AUTHORIZE_COMMERCIAL_PRODUCTION_CREDENTIAL_USE"));

activation = await authorizeCommercialBoundary({ activationId: activation.id, boundary: "PRODUCTION_CREDENTIAL_USE", authorizedBy: "ZERO_COST_TEST" });
let [updatedAsset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(updatedAsset!.authorities.productionCredentialsAuthorized, true);
assert.equal(updatedAsset!.authorities.customerChargingAuthorized, false);
await setCapabilityAvailable({ key: credentialCapabilityKey(provider), provider, verificationMethod: "SECRET_BRIDGE_TEST", metadata: { productionCredentialsVerified: true, commercialActivationAllowed: true } });
clearCommercialPaymentAdapters();
registerCommercialPaymentAdapter(createZeroCostCommercialFixtureAdapter(provider));
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.status, "AWAITING_CHARGING_AUTHORITY");
assert.equal(activation.transactionReady, false);

activation = await authorizeCommercialBoundary({ activationId: activation.id, boundary: "CUSTOMER_CHARGING", authorizedBy: "ZERO_COST_TEST" });
[updatedAsset] = await db.select().from(assetsTable).where(eq(assetsTable.id, asset.id));
assert.equal(updatedAsset!.authorities.customerChargingAuthorized, true);
assert.equal(updatedAsset!.authorities.outboundAuthorized, false);
assert.equal(updatedAsset!.authorities.advertisingAuthorized, false);
assert.equal(updatedAsset!.authorities.customDomainAuthorized, false);
assert.equal(updatedAsset!.authorities.externalSpendCeilingCents, 0);
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.status, "ACTIVE");
assert.equal(activation.transactionReady, true);
assert.equal((await reconcileCommercialActivation(activation.id)).status, "ACTIVE");

const event = { activationId: activation.id, provider, providerTransactionId: "txn_fixture_1", eventType: "payment.updated", amountCents: 2_500, currency: "USD", occurredAt: new Date(), signatureVerified: true };
for (const status of ["FAILED", "CANCELLED", "REFUNDED"]) assert.equal((await ingestAuthoritativePaymentEvent({ ...event, providerEventId: `evt_${status}`, paymentStatus: status })).countedAsRevenue, false);
assert.equal((await ingestAuthoritativePaymentEvent({ ...event, providerEventId: "evt_paid", paymentStatus: "PAID" })).countedAsRevenue, true);
assert.equal((await ingestAuthoritativePaymentEvent({ ...event, providerEventId: "evt_paid", paymentStatus: "PAID" })).created, false);
const observations = await db.select().from(assetObservationsTable).where(eq(assetObservationsTable.assetId, asset.id));
assert.equal(observations.filter((item) => item.idempotencyKey === `payment:${provider}:evt_paid:revenue` && item.provenance === "FACT").length, 1);
assert.equal((await db.select().from(paymentProviderEventsTable).where(eq(paymentProviderEventsTable.activationId, activation.id))).length, 4);

registerCommercialPaymentAdapter({ provider, costMode: "ZERO_CASH", async prepare() { throw new Error("timeout after dispatch"); }, async activateAndVerify() { throw new Error("must not be called"); } });
await db.update(commercialActivationsTable).set({ status: "DRAFT", checkoutReference: null, transactionReady: false }).where(eq(commercialActivationsTable.id, activation.id));
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.status, "UNCERTAIN");
const attempts = activation.preparationAttemptCount;
activation = await reconcileCommercialActivation(activation.id);
assert.equal(activation.preparationAttemptCount, attempts, "uncertain provider operations cannot blindly retry");

console.log("PASS zero-cost commercial activation and revenue execution");
