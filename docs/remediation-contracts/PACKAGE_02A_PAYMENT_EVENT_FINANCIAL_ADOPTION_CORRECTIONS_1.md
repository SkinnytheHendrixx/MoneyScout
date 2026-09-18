# Representation Package 02A — Payment Event Observation / Financial Adoption Corrections 1

**Status:** COVERAGE CORRECTION OVERLAY / PAYMENT-EVENT ADOPTION BOUNDARY CONFIRMED / NO IMPLEMENTATION AUTHORITY  
**Controls over:** `PACKAGE_02A_R7_A1_CATEGORY_TO_ATTEMPT_COVERAGE_MAP_CANDIDATE_1.md` and prior inventory where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

This correction re-examines the prior classification:

`PAYMENT_PROVIDER_EVENT = R8_OBSERVATION_LINKED_TO_EXISTING_M1_ATTEMPT`

That statement is correct for the provider event **as external-truth evidence**, but incomplete for the subsequent act of adopting that evidence into Money Scout's authoritative financial state.

The current implementation contains two distinct semantic moments:

1. observe/persist provider-originating truth;
2. adopt eligible provider truth into authoritative internal financial state.

Those moments must not be collapsed.

## 2. Direct current-state evidence

Current implementation:

`artifacts/api-server/src/lib/commercial-activation-worker.ts`

contains:

`ingestAuthoritativePaymentEvent(...)`

Current schema:

`payment_provider_events`

contains distinct fields including:

- provider event identity;
- provider transaction identity;
- `authoritative`;
- `signatureVerified`;
- `processed`;
- occurred/received timestamps.

The ingestion function currently:

1. loads the commercial activation and checks provider equality;
2. requires verified provider signature;
3. validates successful-payment eligibility against current activation/transaction readiness and amount/currency;
4. inserts an authoritative signed provider-event row with `processed = false`;
5. for successful payment events, creates immutable `FACT`:
   - REVENUE observation;
   - TRANSACTION observation;
6. for reversal events, may create an immutable negative compensating REVENUE `FACT`;
7. `recordAssetObservation(...)` updates authoritative Asset financial aggregates for FACT observations;
8. only after processing does the provider event become `processed = true`.

Therefore:

`PROVIDER_EVENT_OBSERVATION != FINANCIAL_STATE_ADOPTION`

## 3. R8 observation role remains

The provider event itself remains an R8/R15-style external truth observation.

Receipt/signature verification/persistence of the exact provider event does not, by itself, justify creating a second envelope for the same original outbound charge attempt.

The exact provider event must be linked to:

- the exact relevant provider transaction/execution identity where available;
- the original outbound commercial attempt envelope where uniquely provable;
- or an explicit unresolved/ambiguous state where the exact originating attempt cannot be proven.

No current activation/provider coincidence may manufacture that historical linkage.

## 4. Financial adoption is a separate C2 boundary

When Money Scout takes a signed provider event and uses it to mutate authoritative internal financial state, that is a separate authority consumption.

Examples currently confirmed:

### Successful payment adoption

The system creates:

- immutable REVENUE FACT;
- immutable TRANSACTION FACT;
- Asset aggregate updates such as observed revenue/transaction totals.

### Reversal / chargeback / refund adoption

The system may create:

- immutable negative compensating REVENUE FACT;
- corresponding authoritative financial adjustments.

These are not passive observations.

They are internal adoption of already-occurred external truth into authoritative financial state.

Therefore:

`PAYMENT_FINANCIAL_ADOPTION = C2_ADOPTION_BOUNDARY`

and:

`PAYMENT_FINANCIAL_ADOPTION_REQUIRES_DISTINCT_EXECUTION_AUTHORITY_ENVELOPE = YES`

## 5. Envelope topology

### E_payment_external

Represents the originating outbound commercial/provider attempt where such an attempt exists and is exactly identifiable.

Owns/anchors:

- pre-dispatch authority;
- R18 binding set;
- R7 resource authority;
- R8 provider execution truth.

### R8 provider event observation

Represents externally originated evidence about payment/transaction state.

It is not automatically a new Money Scout attempt envelope merely because another webhook row arrives.

Multiple provider events may correspond to one external payment transaction/attempt.

### E_financial_adopt

Represents Money Scout's separate attempt to adopt the provider event into authoritative internal financial state.

Governed as:

`ADOPTION_VALIDATION`

Created/frozen before the authoritative financial mutation.

It must reference:

- exact provider event being adopted;
- exact provider transaction identity where available;
- exact originating payment attempt envelope where uniquely provable;
- exact current adoption-time authority/evidence required by R20;
- exact adoption result.

## 6. Causal relation requirements

Where the authoritative provider event uniquely belongs to an originating outbound payment attempt:

`E_financial_adopt.predecessor_execution_authority_envelope_id → E_payment_external.id`

or an equivalent enforceable dependency relation is required.

The adoption envelope must also reference the exact provider-event observation.

This gives the causal chain:

`E_payment_external → provider event truth → E_financial_adopt`

without pretending the provider webhook itself is another outbound execution attempt.

If no originating outbound envelope can be uniquely proven—for example some provider-initiated or legacy event—the adoption must preserve that uncertainty rather than attaching to a current activation by inference.

## 7. Non-financial event processing nuance

Not every provider-event row necessarily creates an authoritative financial-state adoption.

Current non-successful/non-reversal events may only:

- persist authoritative provider truth;
- mark the event processed;
- record a commercial event.

The existence of a `processed` update alone is not sufficient to infer a distinct financial adoption envelope.

Frozen rule:

A separate payment-event adoption envelope is required when processing the external event performs a registered C2 authoritative adoption, including:

- creating/changing authoritative financial FACT state;
- creating a compensating financial FACT;
- or another independently registered consequential downstream mutation.

Pure observation bookkeeping does not automatically create a second envelope.

If later R20/Boundary Registry classification makes other provider-event processing consequential, this rule must expand accordingly.

## 8. Adoption-time validation

The adoption envelope must not rely solely on the fact that the original charge was valid at dispatch.

R20's separation of boundary crossing and adoption requires current adoption-time validation for the adoption predicate actually governing the financial mutation.

This does not mean external truth is rejected or rewritten.

If the provider event proves money moved, R8/R15 truth remains historical truth.

A failed adoption-time predicate may require:

- preserving the provider event;
- preserving external financial truth;
- blocking or differently classifying downstream internal adoption;
- escalating/reconciling rather than erasing the event.

External truth and internal adoption eligibility are separate propositions.

## 9. Attack fixtures

### PEA-A1 — valid charge / invalid later adoption

Outbound charge E1 was valid and succeeded.

Before webhook adoption, relevant current adoption authority becomes ineligible.

Provider event remains authoritative external truth.

Financial adoption must not silently proceed merely because E1 once passed dispatch validation.

### PEA-A2 — duplicate webhook

Two deliveries of the same provider event ID must not create two adoption envelopes/effects for one exact event.

Idempotency must preserve one exact adoption identity/effect.

### PEA-A3 — wrong originating attempt

Provider event for payment attempt E1 is associated with E2 because provider/current activation matches.

Must fail exact linkage.

### PEA-A4 — reversal lineage

Refund/chargeback event must preserve exact transaction/event provenance and cannot be attached to an unrelated current charge attempt.

### PEA-A5 — observation/adoption collapse

Persisting signed external truth must not itself imply that authoritative financial adoption has already been authorized.

### PEA-A6 — adoption without provider-event identity

Financial FACT mutation without durable reference to the exact authoritative provider event fails.

## 10. Coverage-map correction

Replace the prior simplified classification:

`PAYMENT_PROVIDER_EVENT = R8_OBSERVATION_LINKED_TO_EXISTING_M1_ATTEMPT`

with:

`PAYMENT_PROVIDER_EVENT_OBSERVATION = R8_TRUTH_SURFACE / NO_DUPLICATE_ATTEMPT_ENVELOPE_BY_RECEIPT_ALONE`

and:

`PAYMENT_FINANCIAL_ADOPTION = M1_C2_ADOPTION_ATTEMPT`

where the latter receives its own envelope before consequential internal adoption.

Commercial/payment mapping therefore contains at least two distinct attempt/adoption roles:

1. outbound commercial/payment provider attempt;
2. inbound external-result financial adoption attempt.

## 11. Relationship to CE-U03

This is the same structural rule already adopted for Builder Gateway:

- external provider execution is one authority consumption;
- later adoption of the external result is another.

The payload differs—code result versus payment truth—but the authority topology is the same.

The general rule is:

> External-result observation and authoritative-result adoption are separate propositions whenever the latter mutates a separately governed authoritative state.

## 12. Inventory consequence

The coverage map is not ready to freeze until the commercial/payment flow explicitly identifies:

1. exact outbound payment-attempt object/linkage;
2. exact provider-event observation linkage;
3. exact financial-adoption attempt/envelope object;
4. adoption-time R20 validation predicate;
5. exact predecessor/provider-event referential constraints;
6. legacy/ambiguous event behavior;
7. idempotency for duplicate provider-event delivery.

## 13. Disposition

`PAYMENT_EVENT_OBSERVATION_ONLY_CLASSIFICATION = INCOMPLETE`

`PAYMENT_PROVIDER_EVENT_OBSERVATION = R8_EXTERNAL_TRUTH`

`PAYMENT_FINANCIAL_ADOPTION = DISTINCT_C2_ADOPTION_BOUNDARY`

`PAYMENT_FINANCIAL_ADOPTION_ENVELOPE = REQUIRED`

`PROVIDER_EVENT_RECEIPT_AUTO_CREATES_ENVELOPE = NO`

`OUTBOUND_PAYMENT_AND_FINANCIAL_ADOPTION_MAY_SHARE_ONE_ENVELOPE = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = INCORPORATE_PAYMENT_ADOPTION_INTO_REMAINING_M4/COMMERCIAL_FLOW_TRACE`
