# Representation Package 02A — Consolidation Corrections 2: Negative Sweep Surfaces S47–S51 and Exact Poll Targeting

**Status:** CONSOLIDATION CORRECTION OVERLAY / S47–S51 ADDED / POLL TARGET IDENTITY HARDENED / INTERNAL LOOPBACK EXCLUSION RECORDED  
**Controls over:** consolidated surface map, Corrections 1, and Negative Coverage Sweep Candidate 1 where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

Negative Coverage Sweep Candidate 1 found five live surface families not explicitly represented in the consolidated S01–S46 map.

This correction:

1. adds S47–S51;
2. hardens status-poll topology with an exact immutable target requirement;
3. adds NEG-A9 for mutable-providerRunId misreconciliation;
4. records the independently considered Validation reassessment loopback as an explicit non-external orchestration exclusion;
5. widens Boundary Registry review for provider-result application.

No prior immutable artifact is rewritten.

## 2. S47 — Asset Repository Provisioning Provider Attempt

### Source

- `asset-factory.ts::provisionRepository(...)`
- `asset-repository-provisioner.ts`

Configured implementation performs:

`POST /v1/repositories`

to an external repository provider.

It creates a private external repository and returns exact external repository identity and base commit SHA.

### Classification

`REPOSITORY_PROVISION_PROVIDER_CALL = M1_C2_PROVIDER_ATTEMPT`

This is distinct from the R6 Verification Result later derived from successful provisioning.

### Existing pre-boundary state

Factory Run and Asset Repository rows exist before the provider call.

Therefore:

`PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

but:

`PREBOUNDARY_FULL_EXECUTION_AUTHORITY = ABSENT`.

### Required topology

`E_repository_provision → provider repository result → R6 Verification Result`

No duplicate R6 execution envelope.

## 3. S48 — Asset Health Probe / Health-Result Adoption

### Source

`asset-operations-worker.ts::probeAssetHealth(...)`

Current code performs an external read-only HTTP GET against the Asset production URL.

### Exact attempt identity

`assetHealthChecks` is inserted only after the request succeeds/fails.

Therefore:

`HEALTH_PROBE_PREBOUNDARY_EXACT_ATTEMPT_IDENTITY = ABSENT`.

### C1

Read-only + zero-cash does not prove absence of request/capacity scarcity.

`HEALTH_PROBE_C1 = RESOURCE_SEMANTICS_NOT_FULLY_PROVEN`.

### Observation/adoption split

External HTTP result is then used to mutate:

- Asset health status;
- ACTIVE/DEGRADED state;
- failure count;
- error state;
- Availability Incident state;
- Opportunity ASSET_ACTIVE/ASSET_DEGRADED;
- lifecycle/remediation eligibility.

Therefore:

`HEALTH_PROBE_RESULT = EXTERNAL_OBSERVATION`

and:

`HEALTH_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`.

Required topology if probe is in envelope scope:

`E_health_probe → health result → optional E_health_adopt if classified C2`.

## 4. S49 — Discovery Store Acquisition Requests

### Source

`discovery.ts::fetchApifyStorePage(...)`

Discovery performs paginated external GETs to the Apify Store.

### Distinction

`DISCOVERY_STORE_ACQUISITION != APIFY_EXPERIMENT_PROBE`.

Shared provider/source does not collapse execution identity.

### Pre-boundary state

Discovery Run / Pass state is durable and RUNNING before traversal/network work.

Therefore:

`DISCOVERY_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`.

### Multiplicity

One pass may perform arbitrary-N network attempts due:

- pagination;
- retries;
- convergence passes.

Current counters:

- requestCount;
- networkAttemptCount;
- retryCount;

prove multiplicity but are not immutable one-row-per-request identity.

### C1

`NON_SCARCE_PROVEN = NO`

for the same reason as the bounded Apify experiment path: public/zero-cash is not proof of no rate/request/shared-capacity scarcity.

Disposition:

`DISCOVERY_STORE_REQUEST = M4 / C1_NOT_PROVEN`.

## 5. S50 — Provider Status/Reconciliation Poll Attempts

### Reachable current sources

- Builder Workspace status poll;
- QA status poll;
- QA repair status poll;
- Release Preview status poll;
- Release Production status poll.

Configured adapters implement real external GETs.

### Two identities must coexist

Every poll has:

1. its own exact poll-attempt identity;
2. one exact target original-provider-attempt identity.

Therefore, where poll itself is in envelope scope:

`E_poll != E_original`.

But the poll response must reconcile R8 truth for exactly:

`E_original_targeted_by_E_poll`.

### Exact target tuple

Before dispatching a poll, the system must durably freeze the exact target relation, including at minimum:

- E_poll identity;
- target E_original identity;
- exact provider;
- exact provider-account binding;
- exact providerRunId or provider-side execution identity queried;
- source container/attempt ref;
- poll time/policy where material.

The response may be applied only if it proves continuity with that exact frozen target tuple.

### Current defect

Current workers generally:

1. read mutable `providerRunId` from a Workspace/QA/Release row;
2. call `await adapter.getStatus(providerRunId)`;
3. after await, apply returned result to that same mutable row.

No immutable poll-target object proves that the providerRunId/E_original targeted at dispatch is still the identity being reconciled at response processing.

Therefore:

`CURRENT_POLL_EXACT_TARGET_BINDING = ABSENT`.

### C1

`PROVIDER_STATUS_POLL_C1 = RESOURCE_SEMANTICS_UNKNOWN`.

No M3 exclusion.

### C2

The poll itself is observational; result application may be C2 depending on transition.

Disposition:

`PROVIDER_STATUS_POLL = M4_EXTERNAL_OBSERVATION_ATTEMPT`.

## 6. NEG-A9 — stale/wrong original-attempt reconciliation

Attack:

1. container row points to providerRunId R1 / E_original_1;
2. poll P1 is dispatched for R1;
3. before P1 response is applied, mutable container association changes to R2 / E_original_2;
4. P1 response returns;
5. system applies response against current container state or current E_original_2.

Must fail.

Required invariant:

`POLL_RESPONSE_TARGET == EXACT_FROZEN_TARGET_AT_POLL_DISPATCH`.

ProviderRunId string equality alone is insufficient where provider/account/attempt lineage differs.

A current/latest row lookup may not substitute for the frozen target relation.

## 7. S51 — Builder Provider Cancellation Attempt

### Source

Builder Workspace may call:

`adapter.cancel(providerRunId, reason)`

when the Bet becomes ineligible.

Configured HTTP adapter performs:

`POST /v1/builds/<providerRunId>/cancel`.

### Classification

This is an external mutation:

`BUILDER_PROVIDER_CANCEL = M1_C2_PROVIDER_ATTEMPT`.

It is distinct from:

- original Builder dispatch;
- status poll;
- local cancel intent/state.

### Exact target requirement

Cancellation must also bind exact immutable:

- target E_original;
- provider/account;
- providerRunId;
- cancellation authority/reason;
- cancel attempt E_cancel.

Topology:

`E_cancel → external cancellation request → R8/provider result for exact E_original`.

Current Workspace path lacks a dedicated immutable cancel-attempt object.

## 8. Provider-result application Boundary Registry review

Status/reconciliation responses currently drive authoritative local transitions such as:

- Builder terminal/challenge state;
- QA PASS/FAIL/defect state;
- repair completion;
- Release PREVIEW_READY;
- Release COMPLETE/public-ready;
- terminal external cost reconciliation;
- downstream stage eligibility.

These are not automatically all C2.

They must be classified transition-specifically.

Add current open family:

`PROVIDER_RESULT_APPLICATION_C2 = TRANSITION_SPECIFIC / BOUNDARY_REGISTRY_REVIEW_REQUIRED`.

Where classified C2:

`E_original → provider truth/reconciliation → E_result_adopt`.

Where NOT_C2:

record explicit Boundary Registry disposition; do not infer from local/internal wording.

## 9. Internal loopback exclusion — Validation reassessment

A reviewer explicitly checked:

`experiment-execution.ts::runValidationReassessment(...)`.

It calls:

`POST <forwarded current origin>/api/opportunities/<id>/validation/advance`.

The origin is constructed from the incoming request's own protocol/host.

This is an internal Money Scout API loopback/orchestration call, not an external provider boundary.

Therefore:

`VALIDATION_REASSESSMENT_LOOPBACK = INTERNAL_ORCHESTRATION / NOT_NEW_EXTERNAL_ATTEMPT_FAMILY`.

Any external provider work triggered downstream remains represented by the Validation Evidence Collector or other exact downstream provider surfaces.

This exclusion is explicit so the final sweep does not silently ignore the call site.

## 10. Surface count correction

The current numbered map must now include:

- S46 Build/Release Cost FACT Adoption;
- S47 Repository Provisioning;
- S48 Asset Health Probe;
- S49 Discovery Store Acquisition;
- S50 Provider Status/Reconciliation Polls;
- S51 Builder Provider Cancellation.

Therefore:

`CURRENT_NUMBERED_SURFACE_FLOOR = 51`.

This remains a floor until the negative sweep rerun closes.

## 11. Attempt/granularity consequences

### S47

Pattern A or source-specific child attempt may be feasible because one provisioning action targets one repository creation operation, but final writer/retry audit required.

### S48

Recurring arbitrary-N probes require one exact probe identity per request if in envelope scope.

### S49

Arbitrary-N pagination/retries require request-level identity if external requests are in envelope scope; one Discovery Pass is a container.

### S50

Each external poll is a distinct request attempt; repeated polls cannot collapse into `lastPolledAt`.

### S51

Each external cancellation dispatch is a distinct mutation attempt.

## 12. Additional duplicate/cross-attempt controls

Add:

### D9 — poll target drift

Poll response must reconcile only the exact original attempt frozen at poll dispatch.

### D10 — cancel target drift

Cancellation result must bind the exact original provider attempt targeted when cancel was dispatched.

### D11 — internal-loopback false surface

Internal Money Scout HTTP self-calls do not become separate external provider attempts merely because transport uses `fetch()`.

Downstream provider calls remain independently classified.

## 13. Updated attack additions

Retain NEG-A1 through NEG-A8 and add:

### NEG-A9 — mutable providerRunId target drift

Poll P1 queries R1/E1. Container changes to R2/E2 before response. P1 response is applied to E2/current row.

Must fail.

### NEG-A10 — cancel target drift

Cancel C1 is dispatched against R1/E1, but response/state change is attributed to current R2/E2 after container mutation.

Must fail.

### NEG-A11 — internal self-fetch overclassification

Money Scout's own route-to-route loopback is classified as a new external provider attempt solely because it uses HTTP/fetch.

Must fail; classify downstream real provider effects instead.

## 14. Current positive C2 adoption families

Corrections 1 remains controlling:

1. Builder repository finalization/adoption;
2. payment financial FACT adoption;
3. telemetry FACT adoption;
4. commercial activation-result adoption;
5. Build/Release cost FACT adoption.

No new positive C2 adoption family is asserted here for health or provider-result application without Boundary Registry adjudication.

## 15. Current open Boundary Registry set widened by Corrections 2

Add to prior open set:

- Health-result adoption transitions;
- Builder/QA/Repair/Release provider-result application transitions.

Prior unresolved items remain:

- WATCH reactivation;
- Autonomous Resolution lifecycle outcomes;
- experiment evidence/Validation reassessment;
- disabled-checkout preparation-result adoption.

## 16. Methodological rule

The final negative sweep must classify **call sites**, not just adapters or tables.

A provider method being already known does not prove every caller is mapped correctly.

For each reachable external call site, record:

- caller;
- target;
- transport/provider;
- operation;
- exact attempt owner;
- C1;
- C2;
- pre-boundary identity status;
- result/adoption owner;
- numbered surface.

## 17. Disposition

`S47_S51 = ADDED`

`NEG_A9 = ADDED / LOAD_BEARING`

`POLL_EXACT_TARGET_BINDING = REQUIRED`

`CURRENT_POLL_EXACT_TARGET_BINDING = ABSENT`

`VALIDATION_REASSESSMENT_LOOPBACK = EXPLICITLY_RULED_OUT_AS_EXTERNAL_SURFACE`

`CURRENT_NUMBERED_SURFACE_FLOOR = 51`

`PROVIDER_RESULT_APPLICATION_BOUNDARY_REVIEW = REQUIRED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = NEGATIVE_COVERAGE_SWEEP_RERUN_WITH_CALL_SITE_INVENTORY`
