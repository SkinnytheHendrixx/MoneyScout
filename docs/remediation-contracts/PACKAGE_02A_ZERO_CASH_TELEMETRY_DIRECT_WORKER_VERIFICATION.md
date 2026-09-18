# Representation Package 02A — ZERO_CASH Telemetry Direct Worker Verification

**Status:** DIRECT VERIFICATION / PRE-BOUNDARY IDENTITY CLAIM CONFIRMED / TELEMETRY TRACE FULLY SOURCE-BACKED  
**Parent trace:** `PACKAGE_02A_ZERO_CASH_TELEMETRY_M4_TRACE_ADJUDICATION.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact directly verifies the remaining load-bearing implementation claim from the ZERO_CASH telemetry adjudication:

> the external telemetry provider call occurs before any durable `assetTelemetrySyncs` attempt row exists.

The C2 FACT-adoption behavior had already been independently verified through `recordAssetObservation(...)`.

## 2. Direct source

Verified live file:

`artifacts/api-server/src/lib/asset-economics-worker.ts`

Blob:

`6e9422e3eeaf249b68168e8f2d3f378cf5261eeb`

Function:

`syncAssetTelemetry(...)`

## 3. Exact live sequence

Current ZERO_CASH path performs:

1. derive `scheduledAt`;
2. derive `idempotencyKey`;
3. load prior successful sync/cursor;
4. derive `since`;
5. set local in-memory:
   `const startedAt = new Date()`;
6. if METERED, block before provider call;
7. for allowed ZERO_CASH path call:

`const result = await adapter.collect(...)`

8. only after that provider call returns, insert:

`assetTelemetrySyncsTable`

with:

- idempotency key;
- provider;
- cost mode;
- status;
- cursor before/after;
- coverage;
- observation count;
- provider-reported external cost;
- `startedAt`;
- `finishedAt = new Date()`.

Therefore:

`EXTERNAL_PROVIDER_BOUNDARY_PRECEDES_DURABLE_SYNC_ROW = CONFIRMED`

## 4. Failure path also confirms the defect

If `adapter.collect(...)` throws, control enters the catch block.

Only there does current code insert a FAILED `assetTelemetrySyncs` row.

Therefore even the failure/uncertainty path has no durable sync-row identity before attempted external execution.

An in-memory:

- `startedAt`;
- `idempotencyKey`;
- cursor;
- provider string

cannot prove that pre-dispatch authority existed.

## 5. F06-02 consequence

This directly confirms:

`TELEMETRY_PRE_BOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`

and:

`POST_RESPONSE_OR_POST_FAILURE_SYNC_ROW != PRE_BOUNDARY_EXECUTION_AUTHORITY`

The corrected architecture must create/freeze the Execution Authority Envelope before `adapter.collect(...)`.

The later `assetTelemetrySyncs` row may remain a useful result/status record, but it cannot retroactively establish:

- exact R18 binding attachment;
- R7 reservation authority;
- exact provider/account binding identity;
- R6 verification provenance;
- boundary-time validation;
- pre-dispatch attempt existence.

## 6. Direct C2 linkage confirmation carried forward

The same function directly shows that after a successful collection it iterates:

`for (const observation of result.observations)`

and calls:

`recordAssetObservation(... provenance: "FACT" ...)`

for each telemetry observation.

Previously verified `recordAssetObservation(...)` mutates authoritative Asset aggregate/instrumentation state for FACT observations.

Therefore both load-bearing telemetry conclusions are now directly source-backed:

1. pre-boundary attempt identity is absent;
2. provider result is later adopted into authoritative Asset state.

## 7. Additional current-state mutation after telemetry adoption

After observation ingestion, `syncAssetTelemetry(...)` also updates Asset state including:

- `operatingMode = "OPERATING"`;
- instrumentation statuses;
- `lastTelemetrySyncAt`;
- `nextTelemetrySyncAt`;
- operations policy next gate;
- lifecycle/activity state.

Those mutations do not weaken the already-confirmed C2 result.

Their exact Boundary Registry treatment may be finer-grained later, but at least the FACT adoption boundary is already independently established.

## 8. Disposition

`ASSET_ECONOMICS_WORKER_DIRECTLY_VERIFIED = YES`

`ADAPTER_COLLECT_BEFORE_SYNC_INSERT = CONFIRMED`

`FAILURE_ROW_ALSO_POST_ATTEMPT = CONFIRMED`

`TELEMETRY_PRE_BOUNDARY_ATTEMPT_IDENTITY = ABSENT`

`TELEMETRY_FACT_ADOPTION_C2 = DIRECTLY_CONFIRMED`

`ZERO_CASH_TELEMETRY_TRACE = FULLY_SOURCE_BACKED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
