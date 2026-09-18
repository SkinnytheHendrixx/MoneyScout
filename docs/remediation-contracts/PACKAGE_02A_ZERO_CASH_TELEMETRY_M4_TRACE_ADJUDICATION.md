# Representation Package 02A — ZERO_CASH Telemetry M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / M3 EXCLUSION REJECTED / C2 ADOPTION CONFIRMED / PRE-BOUNDARY IDENTITY DEFECT CONFIRMED  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

Can the current ZERO_CASH Asset telemetry path be promoted to:

`M3 = NON_SCARCE_PROVEN + NOT_C2`

and therefore excluded from Execution Authority Envelope scope?

Direct source review answers:

`NO`.

## 2. Current provider attempt

Current adapter:

`artifacts/api-server/src/lib/asset-telemetry-adapter.ts`

performs an external HTTP POST:

`POST <configured-base-url>/v1/asset-telemetry/collect`

with:

- provider identity string;
- optional bearer token;
- Asset/opportunity/release context;
- cursor/since state;
- idempotency key;
- explicit read-only/provider-data contract.

Therefore this is a real external provider attempt, not local computation.

## 3. ZERO_CASH means only cash mode

Current adapter type supports:

- `ZERO_CASH`;
- `METERED`.

Current generic worker blocks `METERED` before dispatch because no enforceable hard per-call ceiling exists.

For `ZERO_CASH`, the worker permits the provider request and treats any returned positive `externalCostCents` as a contract violation.

That proves:

`CURRENT_GENERIC_TELEMETRY_POSITIVE_CASH_EXPECTATION = 0`

It does **not** prove absence of:

- subscription entitlement consumption;
- request quota;
- concurrency;
- shared provider/API capacity;
- other R7-governed scarce resource.

The adapter contract contains no canonical fields establishing those resource classes.

Therefore:

`ZERO_CASH_TELEMETRY_NON_SCARCE_PROVEN = NO`

`ZERO_CASH_TELEMETRY_C1 = RESOURCE_SEMANTICS_UNKNOWN`

M3 fails on C1 proof alone.

## 4. Current execution sequence

Current `syncAssetTelemetry(...)` sequence is:

1. derive local idempotency key/cursor/since;
2. set local `startedAt` variable;
3. reject METERED mode or proceed;
4. call:

`await adapter.collect(...)`

5. only after provider response, insert `assetTelemetrySyncs` row;
6. if unexpected positive cost, record unauthorized cost and fail;
7. otherwise ingest returned observations;
8. update instrumentation/scheduling state.

Therefore the external provider boundary is crossed before the durable telemetry-sync row exists.

## 5. Pre-boundary attempt identity defect

The current `assetTelemetrySyncs` row cannot serve as canonical pre-boundary attempt identity because it is inserted only after `adapter.collect(...)` returns.

A local in-memory `startedAt` variable and idempotency string are not durable authority identity.

Therefore:

`TELEMETRY_PRE_BOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`

and:

`POST_RESPONSE_TELEMETRY_SYNC_ROW != EXECUTION_AUTHORITY_ENVELOPE`

This is another concrete F06-02 implementation surface.

A crash/uncertain process state around the external call cannot rely on later sync-row creation to prove pre-dispatch authority.

## 6. External result observation

The telemetry provider returns:

- stable event IDs;
- observation types;
- amounts/quantities;
- external references;
- observed timestamps;
- coverage;
- cursor;
- provider-reported external cost.

These returned values are external/provider truth or evidence.

Persisting exact provider response/provenance is an observation/evidence concern.

That alone is not the same proposition as authoritatively adopting those values into Asset state.

## 7. Authoritative telemetry adoption

After a successful ZERO_CASH response, current worker iterates every returned observation and calls:

`recordAssetObservation(...)`

with:

`provenance = FACT`.

Current `recordAssetObservation(...)`:

1. inserts durable `asset_observations`;
2. for FACT observations, mutates authoritative Asset aggregates/status:
   - REVENUE → increments `totalObservedRevenueCents`;
   - COST → increments `totalObservedCostCents`;
   - TRANSACTION → increments `totalObservedTransactions`;
   - USAGE → marks usage instrumentation;
   - SUPPORT → marks support instrumentation;
3. records `ASSET_OBSERVATION_INGESTED` event.

Therefore:

`TELEMETRY_PROVIDER_OBSERVATION != TELEMETRY_AUTHORITATIVE_ADOPTION`

## 8. C2 determination

R20 states that an already-executed external result may require separate `ADOPTION_VALIDATION` before Money Scout adopts it into authoritative state.

The telemetry path does exactly that kind of mutation:

external provider result → FACT observation → authoritative Asset operating/financial aggregate state.

This is structurally the same class already confirmed for payment financial adoption.

Therefore:

`TELEMETRY_FACT_ADOPTION = C2_ADOPTION_BOUNDARY`

and:

`TELEMETRY_FACT_ADOPTION_REQUIRES_DISTINCT_EXECUTION_AUTHORITY_ENVELOPE = YES`

This C2 result is independent of whether the telemetry provider call is eventually proven non-scarce under C1.

## 9. Envelope topology

### E_telemetry_collect

Represents the exact external telemetry collection attempt.

Required if:

- C1 scarcity is established; or
- the provider dispatch itself is registered consequential under R20.

Because C1 resource semantics are currently unknown, envelope-free collection may not be authorized.

### Telemetry provider truth

Represents the exact provider result/evidence returned by E_telemetry_collect.

Must preserve:

- provider;
- exact event IDs;
- cursor/coverage;
- response provenance;
- exact originating collection attempt.

### E_telemetry_adopt

Represents the separate authoritative adoption attempt that writes accepted telemetry FACTs into Asset state.

Governed as:

`ADOPTION_VALIDATION`

It must reference:

- E_telemetry_collect;
- exact provider result/event set being adopted;
- exact adoption policy/validation;
- exact target Asset/state mutation.

Topology:

`E_telemetry_collect → provider telemetry truth → E_telemetry_adopt`

## 10. Multiple observations from one provider response

One collection attempt may return many observation events.

That does not automatically imply one adoption envelope per observation.

Candidate semantic unit:

one governed adoption transaction/batch may adopt the exact bounded event set returned by one collection attempt if:

- exact membership is frozen;
- partial adoption semantics are explicit;
- idempotency is exact;
- one event cannot silently migrate between adoption batches;
- failure/rollback semantics are representable.

If observations can be independently accepted/rejected/retried, adoption identity may need finer granularity.

This remains a physical-design question for PAIM; it does not alter the C2 determination.

## 11. Unexpected positive cost

If a ZERO_CASH provider reports positive external cost, current worker:

- records sync as failed;
- records unauthorized telemetry COST observation;
- increases Asset external-spend-used accounting;
- creates a critical Human Action;
- stops further normal telemetry ingestion.

This proves the system already recognizes that `ZERO_CASH` is an assertion that can be violated after external execution.

A post-response cost violation cannot retroactively establish valid R7 reservation authority.

The corrected model must preserve any incurred external truth while treating missing pre-dispatch resource authority as a governance defect/regression.

## 12. Read-only provider contract does not eliminate C2 adoption

The telemetry request declares:

- read_only = true;
- no customer charging changes;
- no outbound;
- no advertising;
- no domain changes.

That constrains provider-side mutation.

It does not make Money Scout's **later internal adoption** non-consequential.

The returned data can still update authoritative financial/operating state.

Therefore:

`READ_ONLY_PROVIDER_CALL != NOT_C2_ADOPTION`

## 13. Attack fixtures

### TEL-A1 — zero cash / hidden quota
Adapter reports ZERO_CASH but consumes subscription request quota.

System treats operation as M3/reservation-free.

Must fail until NON_SCARCE_PROVEN.

### TEL-A2 — post-hoc attempt identity
HTTP collection completes before durable attempt/envelope exists.

Later telemetry-sync row is treated as proof of pre-boundary authority.

Must fail.

### TEL-A3 — observation/adoption collapse
Provider response is persisted and FACT aggregates update without a distinct governed adoption decision.

Must fail.

### TEL-A4 — wrong collection result
Adoption envelope for collection E2 adopts event set returned by E1/current cursor state.

Must fail exact linkage.

### TEL-A5 — duplicate event adoption
Same provider event ID is delivered/adopted twice and increments revenue/transaction aggregates twice.

Must fail idempotency.

### TEL-A6 — partial batch ambiguity
One provider response contains N observations; some are adopted, some fail, but adoption identity cannot prove exact set membership.

Must fail representation.

### TEL-A7 — ZERO_CASH violation after dispatch
Provider reports positive external cost after a reservation-free call.

Preserve incurred cost truth; do not retroactively authorize it.

### TEL-A8 — read-only false exclusion
Provider call is read-only, so downstream authoritative FACT adoption is incorrectly classified NOT_C2.

Must fail.

## 14. Coverage-map update

Replace:

`TELEMETRY = M4_PENDING_ADAPTER_RESOURCE_SEMANTICS`

with:

### Provider collection

`ZERO_CASH_TELEMETRY_COLLECTION_C1 = RESOURCE_SEMANTICS_UNKNOWN`

`ZERO_CASH_TELEMETRY_COLLECTION_M3 = REJECTED`

### Current identity

`TELEMETRY_PRE_BOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`

### Provider truth

`TELEMETRY_RESULT = EXTERNAL_OBSERVATION/EVIDENCE`

### Authoritative adoption

`TELEMETRY_FACT_ADOPTION = M1_C2_ADOPTION_ATTEMPT`

### Full category

`TELEMETRY_M4_TRACE = RESOLVED_AGAINST_M3; C1_RESOURCE_CLASSIFICATION_REMAINS_OPEN`

## 15. F06-02 consequence

Telemetry now joins Autonomous Resolution as a concrete live-code surface where:

- an external provider attempt occurs;
- durable current attempt/result record is created only after provider return;
- exact R18 binding attachment is absent;
- provider/account authority is not represented as immutable historical binding identity.

Package 02A must support this surface.

## 16. Disposition

`ZERO_CASH_TELEMETRY_M3_EXCLUSION = REJECTED`

`ZERO_CASH_TELEMETRY_NON_SCARCE_PROVEN = NO`

`ZERO_CASH_TELEMETRY_C1 = RESOURCE_SEMANTICS_UNKNOWN`

`TELEMETRY_PRE_BOUNDARY_ATTEMPT_IDENTITY = ABSENT`

`TELEMETRY_FACT_ADOPTION_C2 = YES`

`TELEMETRY_FACT_ADOPTION_ENVELOPE = REQUIRED`

`READ_ONLY_PROVIDER_CONTRACT_DOES_NOT_REMOVE_ADOPTION_BOUNDARY = YES`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_M4_TRACE = APIFY_PUBLIC_METADATA_OR_COMMERCIAL_OUTBOUND_FLOW`
