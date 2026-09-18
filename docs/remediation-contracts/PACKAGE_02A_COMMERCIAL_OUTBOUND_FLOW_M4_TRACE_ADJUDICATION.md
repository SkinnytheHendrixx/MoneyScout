# Representation Package 02A — Commercial Outbound Flow M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / MULTI-ATTEMPT COMMERCIAL TOPOLOGY CONFIRMED / ACTIVATION ADOPTION C2 CONFIRMED / CUSTOMER-CHARGE BOUNDARY REMAINS PROVIDER-MAPPING DEPENDENT  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

What is the exact attempt/envelope topology of the current commercial/payment flow?

The prior coverage map used the broad label:

`COMMERCIAL_OUTBOUND_PROVIDER_ACTION`

Direct code review shows that this is too coarse.

Current Money Scout does not directly execute a customer charge.

It performs provider-side commercial configuration in at least two distinct external operations, then later receives provider payment events after a customer/provider transaction occurs.

## 2. Direct current adapter behavior

Current adapter:

`artifacts/api-server/src/lib/commercial-payment-adapter.ts`

Current configured HTTP adapter performs authenticated external POSTs through a payment bridge.

### Provider preparation

`POST /commercial/prepare`

with:

- `charging_enabled: false`;
- `external_spend_ceiling_cents: 0`;
- exact Asset/opportunity/providerOperationKey;
- price/currency/production URL/promised outcome.

Required response includes:

- checkout reference;
- `charging_enabled = false`.

### Provider activation

`POST /commercial/activate`

with:

- prior checkout reference;
- `customer_charging_authorized: true`;
- `external_spend_ceiling_cents: 0`;
- same commercial context.

Response includes:

- checkout reference;
- transaction-ready state;
- charging-enabled state.

Therefore:

`PREPARE != ACTIVATE`

They are two distinct external provider operations.

## 3. Current flow does not itself execute the customer payment

The current Money Scout commercial worker:

- prepares a disabled checkout;
- waits for explicit customer-charging authority;
- activates/verifies the checkout as transaction-ready;
- later receives signed provider payment events through `ingestAuthoritativePaymentEvent(...)`.

There is no current Money Scout function in this flow that directly issues:

`charge customer now`.

Therefore the exact topology must distinguish:

1. provider checkout preparation;
2. provider checkout activation;
3. later customer/provider transaction;
4. inbound provider event observation;
5. Money Scout financial adoption.

The third item is not currently represented as a Money Scout outbound execution call.

## 4. commercial_activations is a container / authority aggregate

Current schema:

`commercial_activations`

contains:

- one row per Asset due `commercial_activations_asset_unique`;
- one activation-level idempotency key;
- one providerOperationKey;
- mutable status;
- checkout reference;
- transactionReady;
- preparationAttemptCount;
- charging authority timestamps;
- activatedAt;
- error state.

The same row spans:

- preparation;
- waiting for charging authority;
- activation/verification;
- final ACTIVE state;
- later provider-event linkage.

Therefore:

`commercial_activations != EXACT_PROVIDER_ATTEMPT_OBJECT`

It is a commercial authority/workflow container.

This directly corroborates the ROOT-1 redesign need already established by F05-03/F01-01/F01-02.

## 5. Provider preparation attempt

Current worker:

`artifacts/api-server/src/lib/commercial-activation-worker.ts`

before calling `adapter.prepare(...)` first performs a durable transition:

`status = PREPARING`

and increments:

`preparationAttemptCount + 1`.

Only afterward does it call the external provider.

Therefore:

`PREPARATION_PRE_BOUNDARY_LOGICAL_STATE = PRESENT`

This differs from Autonomous Resolution and telemetry, where no durable current row existed before dispatch.

However, current representation still lacks a first-class immutable preparation-attempt object.

The mutable activation row stores only:

- aggregate preparation attempt count;
- activation-wide providerOperationKey;
- current status;
- later checkout reference.

It does not preserve one immutable row per exact preparation attempt with exact:

- attempt identity;
- R18 binding set;
- provider/account identity;
- R6 provenance;
- boundary validation;
- R7 authority;
- provider-run/request identity;
- terminal R8 result.

Therefore:

`PREPARATION_LOGICAL_STATE_PRESENT != F06_02_COMPLIANT_ATTEMPT_IDENTITY`

Pattern B child/attempt representation remains required.

## 6. Provider activation/verification attempt

After explicit charging authority exists, current worker durably transitions the activation to:

`VERIFYING`

and only then calls:

`adapter.activateAndVerify(...)`.

Therefore:

`ACTIVATION_PRE_BOUNDARY_LOGICAL_STATE = PRESENT`

But current schema has no activation-attempt counter or immutable activation-attempt child identity.

The activation-wide `providerOperationKey` is reused across preparation and activation.

Therefore it cannot, by itself, distinguish those two exact provider operations.

Result:

`ACTIVATION_PROVIDER_ATTEMPT = DISTINCT_M1_ATTEMPT`

and:

`CURRENT_EXACT_IMMUTABLE_ACTIVATION_ATTEMPT_IDENTITY = ABSENT`

## 7. C1 resource classification

The commercial adapter declares:

`costMode = ZERO_CASH`

and both bridge calls carry:

`external_spend_ceiling_cents = 0`.

That proves a zero-cash execution contract.

It does not establish absence of:

- provider entitlement;
- API/request quota;
- concurrency;
- account capacity;
- other R7-governed scarce resource.

Therefore:

`COMMERCIAL_PROVIDER_PREPARE_C1 = RESOURCE_SEMANTICS_NOT_FULLY_PROVEN`

`COMMERCIAL_PROVIDER_ACTIVATE_C1 = RESOURCE_SEMANTICS_NOT_FULLY_PROVEN`

No M3 exclusion is available on C1.

## 8. C2 provider-boundary classification

Regardless of cash semantics, both configured bridge calls are consequential external/provider boundary crossings.

Preparation creates provider-side checkout configuration, even though charging remains disabled.

Activation enables/verifies a checkout that may accept customer money.

R20 explicitly includes provider dispatch and customer checkout/charge/commercial activation among consequential boundary examples.

Therefore:

`COMMERCIAL_PREPARE_PROVIDER_CALL = C2_BOUNDARY_ATTEMPT`

`COMMERCIAL_ACTIVATE_PROVIDER_CALL = C2_BOUNDARY_ATTEMPT`

Each requires an exact Execution Authority Envelope and exact boundary-time R18/R20 evidence.

## 9. Provider activation result adoption — separate C2 boundary

After `activateAndVerify(...)` returns a successful result, current code calls:

`completeVerifiedActivation(...)`.

That transaction mutates authoritative state:

- activation status → `ACTIVE`;
- `transactionReady = true`;
- `activatedAt`;
- Asset `operatingMode = OPERATING`;
- commercial/Asset events record:
  `COMMERCIAL_ACTIVATION_VERIFIED`;
- summary states the commercial path is transaction-ready and the Asset is operating.

This is not passive persistence of provider truth.

It is adoption of the provider activation result into authoritative commercial/runtime state.

Therefore:

`COMMERCIAL_ACTIVATION_RESULT_ADOPTION = C2_ADOPTION_BOUNDARY`

and:

`COMMERCIAL_ACTIVATION_RESULT_ADOPTION_ENVELOPE = REQUIRED`

Topology:

`E_activate_provider → provider activation result → E_activate_adopt`

This is the same structural rule already confirmed for Builder result adoption, payment-event financial adoption, and telemetry FACT adoption.

## 10. Preparation-result adoption remains narrower

A successful `prepare(...)` result is adopted by storing:

- checkout reference;
- status `AWAITING_CHARGING_AUTHORITY`.

The checkout remains explicitly charging-disabled.

This is an authoritative state mutation, but current recovered Boundary Registry evidence does not establish whether this specific disabled-checkout adoption is independently consequential enough to require a separate adoption envelope.

Therefore:

`COMMERCIAL_PREPARATION_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`

Do not automatically create a second adoption envelope merely because checkoutReference is persisted.

Do not declare NOT_C2 without governed classification.

## 11. Explicit charging authority is authority state, not provider execution

`authorizeCommercialBoundary(... CUSTOMER_CHARGING ...)` updates:

- Asset customerChargingAuthorized;
- activation chargingAuthorizedAt/by;
- corresponding Human Action.

This is an authority/grant mutation.

It is not itself the external provider activation attempt.

The later provider activation must consume the exact authority object current at that boundary.

Current live implementation uses mutable Asset/activation flags rather than the corrected first-class R17 Grant representation.

Therefore Package 02A/ROOT-1 must ultimately bind the activation attempt to:

- exact R17 Grant;
- exact R18 binding set;
- exact R19 lineage;
- exact R20 decision.

## 12. Customer payment transaction is a separate semantic event

Once the checkout is ACTIVE/transaction-ready, a customer may complete a provider transaction later.

Current code learns of that through signed provider events.

Therefore:

`CHECKOUT_ACTIVATION_AUTHORITY != INDIVIDUAL_PAYMENT_TRANSACTION_IDENTITY`

The current provider event may carry:

`providerTransactionId`.

That transaction identity must not be reconstructed from:

- commercial activation ID;
- providerOperationKey;
- checkout reference alone.

## 13. H1-S09 remains controlling for actual checkout/payment configuration semantics

Phase H H1-S09 remains:

`BLOCK-PROVIDER`

for exact R17 checkout-provider mapping / checkout-payment configuration compatibility semantics.

Package 02A must not invent provider semantics that available source did not recover.

In particular, current code does not prove that one activation-time R20 decision is sufficient authority for every future customer payment that may occur through the enabled checkout.

Questions such as:

- whether each charge requires a fresh provider-side authorization callback;
- whether one Grant authorizes arbitrary future transactions;
- how revocation propagates to an already-enabled checkout;
- how Offer supersession affects later customer use;
- how per-transaction current eligibility is enforced

remain provider/configuration-governance questions under H1-S09/R17/R20.

Therefore:

`ACTIVATING_CHECKOUT != PROOF_EVERY_LATER_CHARGE_IS_CURRENTLY_AUTHORIZED`

## 14. Relation to payment-event adoption correction

The already-confirmed later topology remains:

`provider payment event truth → E_financial_adopt`

This commercial trace adds the earlier side:

`E_prepare_provider`

then:

`charging authority`

then:

`E_activate_provider → provider activation result → E_activate_adopt`

then later:

`customer/provider transaction → provider event truth → E_financial_adopt`

The exact relation between `E_activate_adopt` and a later provider transaction is not enough to replace exact transaction identity.

## 15. Proposed source-specific attempt representation

The commercial activation row should remain the authority/workflow container.

Package 02A should introduce a normalized commercial-provider-attempt child relation, conceptually:

`commercial_provider_attempts`

with at least:

- immutable attempt ID;
- activation ID FK;
- Execution Authority Envelope FK;
- attempt kind:
  - `PREPARE_CHECKOUT`;
  - `ACTIVATE_CHECKOUT`;
- exact attempt ordinal;
- provider/account binding identity;
- provider operation/idempotency key specific to the attempt;
- checkout reference where applicable;
- started/frozen time;
- terminal outcome;
- provider result/reference;
- exact R8/reconciliation provenance.

Exact physical names remain governed-current design, not historical-source claims.

## 16. providerOperationKey is insufficient attempt identity

Current activation has one unique:

`providerOperationKey`

and passes it to both preparation and activation.

Therefore:

`providerOperationKey`

is activation-level/provider-operation correlation, not sufficient exact attempt identity.

It must not be used to collapse:

- preparation;
- activation;
- future retries/reconciliation;
- later customer transactions.

## 17. Retry / uncertainty

Current code treats provider errors as `UNCERTAIN` and stops without blind retry.

This is directionally correct.

If a later governed retry occurs:

- preparation retry = new exact preparation attempt/envelope;
- activation retry = new exact activation attempt/envelope unless durable proof establishes the original boundary was never crossed under governing retry semantics.

Current `preparationAttemptCount` alone is not enough durable per-attempt history.

## 18. Attack fixtures

### COM-A1 — prepare/activate collapse
One commercial activation row uses one providerOperationKey for both provider calls and system creates one envelope.

Must fail.

### COM-A2 — mutable counter as immutable history
`preparationAttemptCount = 2` is treated as sufficient representation of both historical preparation attempts without two durable attempt identities.

Must fail.

### COM-A3 — activation provider result auto-adopted
Provider reports transaction-ready/charging-enabled and Money Scout sets ACTIVE/OPERATING without separate adoption validation/envelope.

Must fail.

### COM-A4 — activation result envelope reused for financial adoption
Later payment webhook FACT adoption reuses the checkout-activation envelope.

Must fail; payment financial adoption is a later distinct authority consumption.

### COM-A5 — checkout activation treated as individual charge
Provider transaction event is linked only to activation/providerOperationKey and exact provider transaction identity is lost.

Must fail.

### COM-A6 — future charge inherits stale activation authority
Checkout was validly activated at T1. Offer/Grant/binding becomes invalid at T2. Customer pays at T3 and system assumes T1 activation permanently authorized T3 charge.

Must remain blocked/unresolved until H1-S09/provider semantics define enforcement.

### COM-A7 — ZERO_CASH false exclusion
Bridge calls are treated non-scarce merely because `external_spend_ceiling_cents = 0`.

Must fail without entitlement/quota/capacity proof.

### COM-A8 — preparation adoption overclassification
Persisting a disabled checkout reference automatically creates a second adoption envelope without registered Boundary Registry classification.

Must fail over-classification.

### COM-A9 — preparation adoption underclassification
Disabled-checkout adoption is frozen NOT_C2 without Boundary Registry evidence.

Must fail negative overclaim.

## 19. Coverage-map correction

Replace broad:

`COMMERCIAL_OUTBOUND_PROVIDER_ACTION = M1_SOURCE_SPECIFIC_PAYMENT/COMMERCIAL_ATTEMPT`

with:

### Container

`COMMERCIAL_ACTIVATION = M2_AUTHORITY/WORKFLOW_CONTAINER`

### Provider attempts

`COMMERCIAL_PREPARE = M1_C2_PROVIDER_ATTEMPT`

`COMMERCIAL_ACTIVATE = M1_C2_PROVIDER_ATTEMPT`

### Provider activation adoption

`COMMERCIAL_ACTIVATION_RESULT_ADOPTION = M1_C2_ADOPTION_ATTEMPT`

### Customer/provider transaction

`CUSTOMER_PAYMENT_TRANSACTION = EXTERNAL_TRANSACTION_IDENTITY / NOT_CURRENTLY_MONEY_SCOUT_OUTBOUND_CALL`

### Inbound truth

`PAYMENT_PROVIDER_EVENT = R8_EXTERNAL_TRUTH`

### Financial adoption

`PAYMENT_FINANCIAL_ADOPTION = M1_C2_ADOPTION_ATTEMPT`

### Unresolved

`PER_TRANSACTION_CURRENT_AUTHORIZATION = H1_S09/R17/R20_PROVIDER_MAPPING_DEPENDENT`

## 20. F06-02 consequence

Commercial flow confirms another implementation family requiring exact envelope/binding attachment.

Unlike Autonomous Resolution and telemetry, durable pre-boundary **logical state** exists before both current provider calls.

But exact immutable provider-attempt identity and exact R18 binding attachment do not.

Therefore:

`COMMERCIAL_PREBOUNDARY_LOGICAL_STATE = PRESENT`

`COMMERCIAL_PREBOUNDARY_F06_02_AUTHORITY_IDENTITY = INCOMPLETE`

This is a representation defect, not the same post-hoc-identity defect seen on the other two surfaces.

## 21. Disposition

`COMMERCIAL_OUTBOUND_M4_TRACE = RESOLVED_AT_CURRENT_PROVIDER_ATTEMPT_LAYER`

`COMMERCIAL_ACTIVATION_ROW = M2_CONTAINER`

`PREPARE_PROVIDER_CALL = DISTINCT_M1_C2_ATTEMPT`

`ACTIVATE_PROVIDER_CALL = DISTINCT_M1_C2_ATTEMPT`

`ACTIVATION_RESULT_ADOPTION = DISTINCT_M1_C2_ADOPTION_ATTEMPT`

`PRE_BOUNDARY_LOGICAL_STATE = PRESENT`

`EXACT_IMMUTABLE_ATTEMPT_IDENTITY = ABSENT`

`ZERO_CASH_NON_SCARCE_PROVEN = NO`

`CUSTOMER_PAYMENT_IS_NOT_CURRENT_MONEY_SCOUT_OUTBOUND_CALL = YES`

`PER_TRANSACTION_CURRENT_AUTHORIZATION = H1_S09_DEPENDENT / UNRESOLVED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = CONSOLIDATE_02A_SURFACE_MAP_AND REMAINING_BOUNDARY_REGISTRY/SOURCE_GAPS BEFORE PAIM`
