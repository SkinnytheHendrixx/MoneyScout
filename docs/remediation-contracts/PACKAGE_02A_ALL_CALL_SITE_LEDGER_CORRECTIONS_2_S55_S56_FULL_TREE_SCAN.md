# Representation Package 02A — All-Call-Site Ledger Corrections 2: S55 Direct Observation Adoption, S56 Repository Remote Reads, and Internal Kernel Exclusions

**Status:** FULL-TREE CALL-SITE CORRECTION OVERLAY / S55–S56 ADDED / SIXTH POSITIVE C2 ADOPTION FAMILY CONFIRMED / INTERNAL LOCALHOST TRANSPORTS ADDED  
**Controls over:** All-Call-Site Ledger Candidate 1 + Ledger Corrections 1 where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

A bounded mechanical scan of all 98 TypeScript files under:

`artifacts/api-server/src`

searched for external/provider-capable primitives and authoritative adoption helpers, including:

- `fetch(...)`;
- Anthropic/model calls;
- provider `dispatch/getStatus/cancel/repair/provision`;
- `recordAssetObservation(...)`;
- subprocess/Git execution.

The scan found two previously unnumbered live surface families:

- S55 — Direct API Asset Observation Adoption;
- S56 — Builder Repository Remote Read/Reconciliation Requests.

It also found two internal localhost HTTP transports that require explicit exclusions:

- Execution Kernel localhost dispatcher;
- Portfolio Heartbeat localhost Research dispatcher.

## 2. S55 — Direct API Asset Observation Adoption

### Source

`artifacts/api-server/src/routes/assets.ts`

Live route:

`POST /assets/:assetId/observations`

The route is registered after `requireMoneyScoutAccess` in `routes/index.ts`.

Therefore this is an authenticated Money Scout API surface, not an unauthenticated public endpoint.

### Inputs accepted

The route accepts caller-supplied:

- observation type:
  - REVENUE;
  - COST;
  - TRANSACTION;
  - USAGE;
  - SUPPORT;
  - CUSTOM;
- provenance:
  - FACT;
  - CLAIM;
  - INFERENCE;
  - UNKNOWN;
- source;
- idempotency key;
- observed time;
- amount/quantity/unit;
- external reference;
- arbitrary metadata object.

It then calls:

`recordAssetObservation(...)`

without requiring the request to identify a telemetry sync, payment event, Build/Release job, or other source-specific predecessor.

## 3. S55 FACT path is authoritative C2 adoption

Previously verified `recordAssetObservation(...)` semantics remain controlling.

For `provenance = FACT`, it can mutate authoritative Asset state:

- REVENUE → increment `totalObservedRevenueCents`;
- COST → increment `totalObservedCostCents`;
- TRANSACTION → increment `totalObservedTransactions`;
- USAGE → mark usage instrumentation;
- SUPPORT → mark support instrumentation.

Therefore:

`DIRECT_API_FACT_OBSERVATION = C2_ADOPTION_BOUNDARY`.

This is structurally distinct from:

1. payment financial FACT adoption;
2. telemetry FACT adoption;
3. Build/Release cost FACT adoption.

Those have known source-specific producer paths.

S55 accepts an authenticated caller-supplied fact assertion directly.

## 4. S55 non-FACT path

For:

- CLAIM;
- INFERENCE;
- UNKNOWN;

`recordAssetObservation(...)` persists the observation without applying the FACT aggregate/status mutation branch.

Therefore:

`DIRECT_API_NONFACT_OBSERVATION_C2 = NOT_AUTOMATICALLY_ESTABLISHED`.

Any later consequential use of those observations remains separately classified.

S55's positive C2 determination applies specifically to the FACT path.

## 5. S55 pre-boundary identity

The route has:

- Asset identity;
- caller request;
- caller-supplied idempotency key.

But it does not create/freeze an Execution Authority Envelope or other durable adoption-attempt authority object before calling `recordAssetObservation(...)`.

The Asset Observation row itself is created within the same transactional operation that performs the authoritative adoption.

It is not a separately committed pre-boundary authority record.

Therefore:

`S55_PREBOUNDARY_IDENTITY = NONE`.

## 6. S55 provenance limitation

The current route syntactically validates:

- provenance enum;
- observation type;
- source string;
- idempotency key;
- observed time.

It does not require a canonical exact predecessor authority/evidence object before accepting `FACT`.

Therefore:

`CALLER_SUPPLIED_FACT_LABEL != EXACT_SOURCE_PROVENANCE`.

Package 02A must not infer that an observation is externally verified merely because an authenticated caller labels it FACT.

This is a representation/governance concern independent of API authentication.

## 7. S55 attack fixtures

### OBS-A1 — direct FACT without predecessor

Authenticated request submits REVENUE/FACT with arbitrary source text and no exact source evidence identity.

System increments Asset revenue and later claims exact provenance.

Must fail provenance/assurance.

### OBS-A2 — direct FACT mistaken for telemetry

Direct API observation is assigned S31 telemetry lineage solely because both use `recordAssetObservation`.

Must fail.

### OBS-A3 — direct FACT mistaken for payment

Caller uses source text resembling a payment provider and result is linked to a payment transaction that was never proven.

Must fail.

### OBS-A4 — non-FACT overclassification

CLAIM/INFERENCE/UNKNOWN direct observation receives a C2 adoption envelope solely because S55's FACT path is C2.

Must fail unless a separate consequential adoption occurs.

### OBS-A5 — idempotency key as authority

Caller-supplied idempotency key is treated as proof of source identity or authority.

Must fail.

## 8. Positive C2 adoption family count

Prior positively established list:

1. Builder repository finalization/adoption;
2. payment financial FACT adoption;
3. telemetry FACT adoption;
4. commercial activation-result adoption;
5. Build/Release cost FACT adoption.

Add:

6. Direct API Asset FACT Observation Adoption.

Therefore:

`POSITIVE_C2_ADOPTION_FAMILIES = 6`.

## 9. S56 — Builder Repository Remote Read/Reconciliation Requests

### Source

`artifacts/api-server/src/lib/builder-gateway.ts`

Builder Gateway executes remote Git operations through `execFile("git", ...)`.

External remote-read operations include:

- `git clone --no-checkout <repositoryUrl>`;
- `git ls-remote <repositoryUrl> <exact branch ref>`.

These may contact the external repository provider even though they are not implemented with `fetch()`.

### Distinction from S01

S01 is the Builder AI/provider execution.

Repository remote reads are external requests to a different authority/resource: the source repository provider.

Therefore:

`BUILDER_PROVIDER_EXECUTION != REPOSITORY_REMOTE_READ`.

### Distinction from S03

S03 is repository finalization/adoption via remote mutation.

A read-only clone or `ls-remote` does not mutate the repository.

Therefore:

`REPOSITORY_REMOTE_READ != REPOSITORY_FINALIZATION_ADOPTION`.

## 10. S56 C1/C2

### C1

Current code does not prove that remote repository reads consume no:

- repository-provider request quota;
- entitlement;
- concurrency;
- API/Git transport capacity;
- other governed scarce resource.

Therefore:

`S56_C1 = NON_SCARCE_NOT_PROVEN`.

### C2

The remote read itself is observational.

Its later result can govern consequential behavior, especially repository-finalization reconciliation.

Do not automatically classify the read itself as C2.

Disposition:

`S56 = M4_EXTERNAL_OBSERVATION/RECONCILIATION_FAMILY`.

## 11. S56 pre-boundary identity

The exact Builder Gateway Run already exists before repository preparation/reconciliation.

However one Gateway run may perform multiple remote Git reads:

- initial clone;
- one or more reconciliation `ls-remote` calls.

No immutable child row is created before each Git request.

Therefore:

`S56_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`

relative to the exact Gateway run/container context, not exact per-Git-request identity.

If final C1/C2 scope requires envelopes for these requests, arbitrary-N request identity is required.

## 12. S03 push remains correctly classified

The scan reverified the repository push path.

Before:

`git push origin HEAD:refs/heads/<branch>`

current code durably writes on the exact Builder Gateway Run:

- `executionPhase = REPOSITORY_FINALIZATION_ATTEMPTED`;
- exact providerRunId;
- exact baseCommitSha;
- exact resultCommitSha;
- provider usage/cost/entitlement result;
- result summary.

Only after that durable CAS succeeds does it cross the remote repository mutation boundary.

Therefore S03 remains a distinct positive C2 adoption/mutation family.

The push is not a new S-number.

## 13. Repository-finalization reconciliation

After uncertain push outcome, current code uses:

`git ls-remote`

to compare the exact remote branch SHA with the durably frozen `resultCommitSha`.

Correct topology:

`E_repo_read/reconcile → remote branch truth → reconciliation of exact S03 mutation attempt`.

Do not create another S03 mutation envelope merely because a later read proves the push landed.

## 14. S56 exact-target requirement

Like S50 polling, a repository reconciliation read must freeze its exact target before dispatch:

- exact Asset Repository identity;
- exact repository provider/account binding;
- exact repository URL;
- exact branch ref;
- exact Builder Gateway Run;
- exact S03 mutation/adoption attempt being reconciled;
- expected `resultCommitSha`.

Required invariant:

`REMOTE_READ_RESPONSE_TARGET == EXACT_FROZEN_REPOSITORY/MUTATION_TARGET`.

A later current branch/run lookup cannot substitute.

## 15. Internal exclusion ILE-09 — Execution Kernel localhost dispatcher

Verified:

`artifacts/api-server/src/lib/execution-kernel.ts`

`apiBaseUrl(port)` is explicitly:

`http://127.0.0.1:<port>/api`.

The kernel uses `fetch()` to invoke internal Money Scout routes for actions such as:

- RUN_RESEARCH;
- RUN_VALIDATION;
- RUN_RESOLUTION;
- PLAN_EXPERIMENT;
- EXECUTE_EXPERIMENT;
- RECHECK_MONETIZATION_PLAN.

Disposition:

`ILE_09 = INTERNAL_ORCHESTRATION_TRANSPORT`.

Recursive target tracing remains mandatory.

The localhost call itself is not a provider envelope.

## 16. Internal exclusion ILE-10 — Portfolio Heartbeat Research dispatch

Verified:

`artifacts/api-server/src/lib/portfolio-heartbeat.ts`

It calls:

`http://127.0.0.1:<port>/api/opportunities/<id>/research/advance`

using internal automation headers.

Disposition:

`ILE_10 = INTERNAL_ORCHESTRATION_TRANSPORT`.

Target Research recursively maps to S14 and its downstream S52/S53/S54/S13 provider work.

## 17. Full-tree scan result

The broad mechanical scan covered all 98 TypeScript files under the API-server source tree in bounded batches.

All detected external/provider-capable primitives map to:

- existing S01–S54;
- new S55;
- new S56;
- explicit internal transport exclusions;
- local computation.

No other new numbered surface was confirmed by this scan.

This is stronger than prior targeted sweeps because the file universe is explicit.

It is still subject to the known limitation that lexical scanning can miss dynamically abstracted I/O not matching the scan predicates.

## 18. Numbered surface floor

Prior floor:

`54`.

Add:

- S55 Direct API Asset Observation Adoption;
- S56 Builder Repository Remote Read/Reconciliation Requests.

Therefore:

`CURRENT_NUMBERED_SURFACE_FLOOR = 56`.

## 19. Ledger additions

Add:

### L063 — S55 Direct API FACT Asset Observation Adoption

- source: `routes/assets.ts::POST /assets/:assetId/observations`;
- boundary: internal authoritative adoption;
- M1 for FACT path;
- C1: local;
- C2: YES for FACT;
- identity: NONE;
- predecessor: caller-supplied evidence/source; canonical exact predecessor not required by current code;
- evidence: DIRECT.

### L064 — S55 Direct API non-FACT observation

- same route;
- CLAIM/INFERENCE/UNKNOWN;
- evidence persistence;
- C2: not automatically established;
- identity: NONE;
- evidence: DIRECT.

### L065 — S56 Builder repository clone/read

- source: `builder-gateway.ts::prepareWorkspace`;
- operation: remote `git clone --no-checkout`;
- boundary: external repository read;
- M4;
- C1: NON_SCARCE_NOT_PROVEN;
- C2: observation;
- identity: LOGICAL_STATE_ONLY;
- target: exact Asset Repository / Builder Gateway Run.

### L066 — S56 repository-finalization reconciliation read

- source: `builder-gateway.ts::reconcileRepositoryFinalization` and related exact-result reconciliation;
- operation: remote `git ls-remote`;
- boundary: external repository observation;
- M4;
- C1: NON_SCARCE_NOT_PROVEN;
- C2: observation, later reconciliation application separate;
- identity: LOGICAL_STATE_ONLY;
- target: exact S03 mutation attempt/resultCommitSha.

## 20. New internal exclusion rows

Add:

### I014 — ILE-09 Execution Kernel localhost dispatcher

Recursive targets must map to their numbered surfaces.

### I015 — ILE-10 Portfolio Heartbeat → Research

Recursive target maps to Research and downstream provider surfaces.

## 21. Attack additions

### FULL-A1 — Git transport invisibility

External repository read is omitted because scan only recognizes HTTP/fetch.

Must fail coverage.

### FULL-A2 — clone collapsed into Builder provider attempt

Repository clone and AI Builder provider execution share one envelope solely because both happen inside Builder Gateway.

Must fail.

### FULL-A3 — ls-remote collapsed into push

Read-only reconciliation request is represented as another repository mutation.

Must fail.

### FULL-A4 — direct Asset FACT hidden under generic observation route

Authenticated direct FACT adoption mutates Asset aggregates but receives no first-class adoption surface because it uses a shared helper.

Must fail.

### FULL-A5 — authenticated implies source-authoritative

An authenticated caller labels data FACT and Money Scout treats that label as proof of exact provenance.

Must fail.

## 22. Disposition

`FULL_TREE_TYPESCRIPT_FILES_SCANNED = 98`

`S55_DIRECT_API_ASSET_OBSERVATION = ADDED`

`S55_FACT_C2 = YES`

`POSITIVE_C2_ADOPTION_FAMILIES = 6`

`S56_REPOSITORY_REMOTE_READS = ADDED`

`S56_C1 = NON_SCARCE_NOT_PROVEN`

`S03_REPOSITORY_PUSH = RETAINED_AS_DISTINCT_C2_MUTATION`

`ILE_09_EXECUTION_KERNEL_LOCALHOST = ADDED`

`ILE_10_PORTFOLIO_HEARTBEAT_LOCALHOST = ADDED`

`CURRENT_NUMBERED_SURFACE_FLOOR = 56`

`FULL_ENVELOPE_COMPLIANT_LIVE_SURFACES = 0`

`FINAL_LEDGER_PROMOTION = STILL_REQUIRES ADOPTION/BOUNDARY-QUEUE RECONCILIATION AND ZERO-UNMAPPED REVIEW`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
