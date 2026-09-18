# Representation Package 02A — Apify Public Metadata M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / M3 EXCLUSION NOT PROVEN / PRE-BOUNDARY LOGICAL IDENTITY PRESENT / NO IMPLEMENTATION AUTHORITY  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

Can the current Apify Store public-metadata experiment path be promoted to:

`M3 = NON_SCARCE_PROVEN + NOT_C2`

and therefore excluded from Execution Authority Envelope scope?

Direct code review plus current official Apify API documentation answer:

`NOT YET`.

The path is unusually close to a defensible M3 exclusion, but the required negative proof is incomplete.

## 2. Current adapter behavior — direct code evidence

Current adapter:

`artifacts/api-server/src/lib/apify-experiment-adapters.ts`

Blob:

`0049259c05eeba79c3390dd2bf14447163057eca`

`fetchPublicStoreProbe(...)`:

- constructs the Apify Store API URL;
- performs HTTP `GET`;
- sends only `Accept: application/json`;
- supplies no API token;
- supplies no Authorization header;
- starts no Actor;
- writes no external provider state.

Current adapter results explicitly record:

- `external_write_requests: 0`;
- `actor_runs_started: 0`;
- `externalCostUsd: 0`.

The adapter intentionally refuses to register a truthful `UNIT_COST_BENCHMARK` because that would require executing a representative Actor workload that can consume account credits/billable platform resources.

Therefore:

`APIFY_METADATA_AUTHENTICATED_ACCOUNT_EXECUTION = NO`

`APIFY_METADATA_ACTOR_RUNS = 0`

`APIFY_METADATA_EXTERNAL_WRITES = 0`

`APIFY_METADATA_REPORTED_CASH_COST = 0`

## 3. Official provider documentation — authentication

Current official Apify API documentation states:

- Apify Store endpoints retrieve public Store Actors;
- those Store endpoints do not require an authentication token;
- authentication is optional for public Actors/resources and required for private/account-scoped resources.

This externally corroborates the current code's unauthenticated design.

Therefore:

`APIFY_STORE_METADATA_ACCOUNT_ENTITLEMENT_REQUIRED_FOR_AUTHENTICATION = NO`

for the current public Store endpoint.

## 4. C1 scarcity — why NON_SCARCE_PROVEN still fails

R7's standard is broader than cash and authentication.

To promote to M3, the system must prove absence of:

- request quota;
- entitlement units;
- concurrency;
- shared provider/API capacity;
- other governed scarce resource.

Current official Apify API documentation exposes rate-limit behavior generally, including HTTP 429 `rate-limit-exceeded` responses.

No reviewed provider source establishes that the public `/store` endpoint is exempt from request-rate limits or otherwise consumes no scarce shared request capacity.

Therefore:

`PUBLIC + UNAUTHENTICATED + ZERO_CASH != NON_SCARCE_PROVEN`

and:

`APIFY_PUBLIC_METADATA_C1 = RESOURCE_SEMANTICS_NOT_FULLY_PROVEN`

This is a negative-proof failure, not evidence that the endpoint necessarily consumes account-billed scarcity.

M3 cannot be frozen from silence.

## 5. Important contrast — durable pre-boundary logical identity exists

Current execution route:

`artifacts/api-server/src/routes/experiment-execution.ts`

Blob:

`a868a29170b2b12918e2b4ad38db6607d338a84a`

Before executing the registered adapter, current route:

1. loads an already-persisted Experiment row;
2. requires status `PLANNED`;
3. requires Opportunity verdict `TEST`;
4. resolves automatic-execution capability;
5. requires a completed validation run;
6. adds the experiment ID to active execution guard;
7. records `startedAt` locally;
8. updates the existing Experiment row to:
   `status = RUNNING`;
9. only then calls:
   `executeRegisteredExperiment(...)`.

Therefore:

`APIFY_EXPERIMENT_PRE_BOUNDARY_DURABLE_LOGICAL_IDENTITY = PRESENT`

This differs materially from:

- Autonomous Resolution `runWorker`;
- ZERO_CASH telemetry collection;

where the durable current attempt/result record was created only after provider dispatch/return.

## 6. But experiment ID is not yet a compliant Execution Authority Envelope

The presence of a durable pre-boundary Experiment row does not prove F06-02 compliance.

Current Experiment state does not establish, at the exact provider boundary:

- immutable Execution Authority Envelope identity;
- exact R18 Capability Binding Snapshot/set;
- exact provider/account binding identity;
- exact R6 Verification Result provenance;
- R7 reservation/resource authority where applicable;
- exact boundary validation record;
- R8 provider execution truth linkage;
- attempt-specific immutable authority fingerprint.

Therefore:

`PRE_BOUNDARY_LOGICAL_RECORD_PRESENT != PRE_BOUNDARY_EXECUTION_AUTHORITY_ENVELOPE_COMPLETE`

This path requires integration with the Package-02A envelope model if C1/C2 ultimately puts the provider attempt in scope.

## 7. Retry/cardinality semantics support one-row-per-attempt candidate

Current route:

- refuses automatic retry after `FAILED`;
- reuses already-completed execution rather than re-executing;
- accepts execution only from `PLANNED`;
- guards concurrent duplicate execution with `activeExecutions`.

This makes the current Experiment row much closer to one-row-per-execution-attempt than many other surfaces.

Candidate mapping:

`experiments.id ↔ one exact automatic experiment execution`

is plausible.

If manual/admin state mutation can return the row to `PLANNED` or permit a second real dispatch, that would break the one-to-one assumption and must be caught in final writer inventory.

Pattern A envelope linkage may therefore be feasible, but is not frozen yet.

## 8. Provider result persistence

After adapter execution, current route:

1. computes final execution status;
2. constructs a stored execution object;
3. inserts returned observations into `evidenceTable`;
4. updates the Experiment row with final status/result;
5. calls Validation reassessment.

Experiment observations are typed:

- FACT or INFERENCE;
- factor-specific;
- evidence-kind constrained;
- bounded to the plan's target factors.

They are deliberately fed back into underwriting.

## 9. C2 classification — evidence adoption is not automatically resolved

The current path adopts adapter output into Money Scout's underwriting evidence set and triggers Validation reassessment.

That is more than passive logging.

However, current recovered R20 does not establish that every evidence insertion or Validation reassessment is itself an `ADOPTION_VALIDATION` consequential boundary.

Unlike payment/telemetry FACT adoption, this path does not directly update:

- financial aggregates;
- customer-visible state;
- production/repository state;
- a clearly recovered consequential lifecycle effect

inside the same adapter execution step.

Therefore:

`APIFY_EXPERIMENT_EVIDENCE_ADOPTION_C2 = UNRESOLVED / BOUNDARY_REGISTRY_CLASSIFICATION_REQUIRED`

It must not be declared `NOT_C2` merely because evidence is internal.

It must also not be declared C2 solely because evidence rows are authoritative inputs to later underwriting.

The later Validation result/lifecycle consequence must be classified at its own exact boundary.

## 10. Observation / evidence / downstream-decision split

Current topology:

1. public Apify Store GET;
2. adapter parses external public metadata;
3. adapter produces bounded FACT/INFERENCE experiment observations;
4. route persists observations into underwriting evidence;
5. Validation reassessment consumes that evidence;
6. later lifecycle/commercial/build decisions may follow.

These layers must remain distinct.

The provider GET is not the same attempt as a later consequential Validation/lifecycle adoption if one exists.

## 11. M3 determination

M3 requires both:

`NON_SCARCE_PROVEN = YES`

and:

`NOT_C2 = YES`.

Current result:

`NON_SCARCE_PROVEN = NO`

because request-rate/shared-capacity semantics are not fully proven.

`NOT_C2 = NO`

because evidence-adoption/Validation-boundary classification remains unresolved.

Therefore:

`APIFY_PUBLIC_METADATA_M3 = NOT_AUTHORIZED`

This is not a positive finding that the GET is necessarily consequential.

It is a refusal to certify a negative without sufficient proof.

## 12. Attack fixtures

### APY-A1 — public/free implies non-scarce
Unauthenticated Store GET is automatically marked M3 because it costs $0 and starts no Actor.

Must fail without quota/capacity proof.

### APY-A2 — generic rate-limit blindness
Provider exposes request-rate limits, but Money Scout treats public endpoint requests as unlimited/non-scarce without endpoint-specific evidence.

Must fail NON_SCARCE_PROVEN.

### APY-A3 — false post-hoc-identity finding
System claims the experiment has no durable pre-boundary identity despite the existing row being persisted and marked RUNNING before adapter dispatch.

Must fail factual classification.

### APY-A4 — logical record mistaken for full authority
Experiment ID/RUNNING state is treated as sufficient R18/R7/R20 authority without exact binding/validation attachments.

Must fail.

### APY-A5 — evidence/adoption overclassification
Every experiment evidence insert is automatically given a C2 adoption envelope despite no registered consequential boundary.

Must fail.

### APY-A6 — evidence/adoption underclassification
Experiment evidence is declared NOT_C2 merely because it is internal, without checking later Validation/lifecycle effect and Boundary Registry classification.

Must fail.

### APY-A7 — hidden second dispatch
Experiment row is returned to executable state and another Store request occurs under the same one-attempt identity.

Must fail one-row-per-attempt assumption.

## 13. Coverage-map update

Replace:

`APIFY_PUBLIC_METADATA = M4_RESOURCE_OR_BOUNDARY_SEMANTICS_UNKNOWN`

with the more precise:

### Provider behavior

`APIFY_PUBLIC_METADATA = UNAUTHENTICATED_READ_ONLY_HTTP_GET / ZERO_REPORTED_CASH / ZERO_ACTOR_RUNS / ZERO_EXTERNAL_WRITES`

### C1

`APIFY_PUBLIC_METADATA_C1 = NON_SCARCE_NOT_PROVEN_DUE_REQUEST_RATE/CAPACITY_UNCERTAINTY`

### Pre-boundary identity

`APIFY_EXPERIMENT_PRE_BOUNDARY_LOGICAL_IDENTITY = PRESENT`

### F06-02

`EXPERIMENT_ROW_IS_NOT_YET_FULL_EXECUTION_AUTHORITY_ENVELOPE = YES`

### C2

`APIFY_EVIDENCE_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`

### M3

`APIFY_PUBLIC_METADATA_M3_EXCLUSION = NOT_AUTHORIZED`

## 14. Disposition

`APIFY_M4_TRACE = SUBSTANTIALLY_RESOLVED / NEGATIVE EXCLUSION NOT PROVEN`

`PUBLIC_STORE_AUTH_TOKEN_REQUIRED = NO`

`ACTOR_RUNS_STARTED = 0`

`EXTERNAL_WRITES = 0`

`REPORTED_EXTERNAL_CASH_COST = 0`

`NON_SCARCE_PROVEN = NO`

`PRE_BOUNDARY_DURABLE_LOGICAL_IDENTITY = YES`

`PRE_BOUNDARY_FULL_AUTHORITY_ENVELOPE = NO`

`EVIDENCE_ADOPTION_C2 = UNRESOLVED`

`M3_EXCLUSION = NOT_AUTHORIZED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_M4_TRACE = COMMERCIAL_OUTBOUND_FLOW`
