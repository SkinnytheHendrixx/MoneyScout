# Representation Package 02A — Final Repository-Wide Negative Coverage Sweep Candidate 1

**Status:** ADVERSARIAL NEGATIVE-COVERAGE SWEEP / NEW SURFACES FOUND / COVERAGE NOT CLOSED  
**Controls over:** consolidated surface map plus Corrections 1 where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

This sweep tests the current Package-02A claim of substantial execution-surface completeness against the live repository rather than against summary prose.

The sweep specifically searches for:

- external/provider calls not represented as numbered surfaces;
- control-plane calls hidden under reconciliation/polling language;
- authoritative result/adoption paths hidden under local-control wrappers;
- resource-consuming reads dismissed because they do not mutate externally;
- generic downstream/source-specific deferrals;
- pre-boundary identity timing defects;
- duplicate-envelope risks where an observation request and the provider run it observes are conflated.

The sweep applies:

`GENERIC_DOWNSTREAM_DEFERRAL != COVERAGE`

and the standing C1/C2 classifier.

## 2. Sweep outcome

The sweep does **not** support coverage closure.

It found at least five live, reachable surface families missing or insufficiently first-class in the consolidated map:

1. Asset repository provisioning;
2. Asset health-probe execution;
3. Discovery Apify Store acquisition requests;
4. provider status/reconciliation polling;
5. Builder provider cancellation.

It also identifies a broader result-adoption review obligation for provider polling/apply-result paths.

Therefore:

`FINAL_NEGATIVE_COVERAGE_SWEEP = FAIL / NEW_SURFACES_FOUND`

and:

`PAIM_FREEZE_READY = NO`.

## 3. NCF-01 — Asset repository provisioning

### Direct source

- `asset-factory.ts::provisionRepository(...)`
- `asset-repository-provisioner.ts`

The configured provisioner performs:

`POST <repository-provider>/v1/repositories`

with:

- private visibility;
- exact idempotency key;
- manifest files;
- branch;
- optional bearer token.

The operation creates an external private repository and returns:

- provider;
- repository external ID;
- repository URL;
- default branch;
- exact base commit SHA.

### Classification

This is a consequential external mutation.

`REPOSITORY_PROVISION_PROVIDER_CALL = M1_C2_PROVIDER_ATTEMPT`

It is not merely R6 verification.

Current R6 correctly reuses successful provisioning as proof of repository capability, but the underlying provisioning execution itself must first exist as a numbered attempt family.

### Pre-boundary identity

The Factory run and Asset Repository row already exist before `provisioner.provision(...)`.

Therefore durable logical/container identity is present.

However `provisionRepository(...)` calls the provider before writing the returned provider execution/result data, and the current repository row is not an immutable exact provider-attempt authority object with exact:

- envelope;
- R18 binding set;
- provider/account identity;
- R6 provenance;
- boundary validation;
- R8 execution identity/outcome.

Disposition:

`REPOSITORY_PROVISION_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

`REPOSITORY_PROVISION_FULL_ATTEMPT_AUTHORITY = ABSENT`

### R6 de-duplication

After successful provisioning, current code calls:

`setCapabilityAvailable(... verificationMethod = SUCCESSFUL_IDEMPOTENT_REPOSITORY_PROVISION ...)`.

Correct future topology:

`E_repository_provision → exact provider result → R6 Verification Result`

not:

`E_repository_provision + duplicate E_r6_verification`.

### Required new surface

`S47 — Asset Repository Provisioning Provider Attempt`

## 4. NCF-02 — Asset health-probe execution

### Direct source

`asset-operations-worker.ts::probeAssetHealth(...)`

Current code performs:

`GET asset.productionUrl`

with:

- redirect follow;
- Money Scout health user-agent;
- 8-second timeout.

### Pre-boundary identity

Before the GET, current code has:

- Asset identity;
- operations policy;
- in-memory start time.

It does **not** insert an `assetHealthChecks` attempt row before the request.

The Health Check row is inserted only after the HTTP result/error has already been observed.

Therefore:

`HEALTH_PROBE_PREBOUNDARY_EXACT_ATTEMPT_IDENTITY = ABSENT`.

The Asset row is a long-lived container/target, not one exact health-probe attempt.

### C1

The current health probe is zero-cash by policy but is still an external HTTP request.

The reviewed code does not establish whether the target/provider path consumes any R7-governed quota, entitlement, externally constrained request capacity, or other scarce resource.

Therefore:

`HEALTH_PROBE_C1 = RESOURCE_SEMANTICS_NOT_FULLY_PROVEN`.

Do not infer M3 from read-only/zero-cash behavior.

### Result adoption

After the GET, current code:

- inserts exact Health Check evidence;
- updates Asset health status;
- updates Asset ACTIVE/DEGRADED status;
- updates consecutive failure count;
- updates error state;
- may resolve an Availability Incident;
- may open/update an Availability Incident;
- may update Opportunity status to ASSET_ACTIVE or ASSET_DEGRADED;
- may create lifecycle transitions that make bounded remediation eligible.

This is not passive logging.

However current recovered R20 Boundary Registry source does not establish that every health-state/lifecycle transition is itself C2.

Therefore:

`HEALTH_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`.

### Required new surface

`S48 — Asset Health Probe / Health-Result Adoption`

with split:

- external probe attempt;
- exact health observation;
- transition/adoption classification.

## 5. NCF-03 — Discovery Apify Store acquisition

### Direct source

`discovery.ts::fetchApifyStorePage(...)`

performs paginated external GETs to:

`https://api.apify.com/v2/store`.

This is a different execution subsystem from the Apify experiment adapter.

Shared provider/endpoint family does not collapse attempt identity.

### Durable pre-boundary state

Current Discovery traversal inserts/updates:

`discovery_run_passes.status = RUNNING`

before traversal/network acquisition.

Discovery Run itself is also created as RUNNING before acquisition.

Therefore:

`DISCOVERY_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`.

### C1

Like the experiment path:

- public Store endpoint;
- no Actor run;
- no direct external write;
- no obvious provider cash charge.

But NON_SCARCE_PROVEN remains unavailable because public/zero-cash does not prove absence of request-rate/shared-capacity scarcity.

Therefore:

`DISCOVERY_STORE_FETCH_C1 = NON_SCARCE_NOT_PROVEN`.

### Cardinality

One Discovery pass performs many paginated HTTP requests, including retries.

A Discovery Run/Pass is therefore not automatically one exact external request attempt.

If individual HTTP requests are C1/C2 in scope, one pass may relate to arbitrary-N request envelopes.

The persisted counters:

- requestCount;
- networkAttemptCount;
- retryCount;

prove multiplicity but do not provide immutable one-row-per-request identity.

### Result/adoption

Discovery persists:

- actor observations;
- snapshots;
- candidates;
- anomaly classifications;
- later accepted Opportunity/evidence state.

Whether each persisted Discovery result or candidate acceptance is itself a C2 adoption boundary remains Boundary-Registry dependent.

### Required new surface

`S49 — Discovery Store Acquisition Requests`

distinct from S32 Apify experiment metadata GET.

## 6. NCF-04 — Provider status/reconciliation polling

### Reachable current paths

Direct live callers include:

- Builder Workspace → `adapter.getStatus(providerRunId)`;
- QA → `adapter.getStatus(qaProviderRunId)`;
- QA repair → Builder adapter `getStatus(repairProviderRunId)`;
- Controlled Release preview → `adapter.getStatus(previewProviderRunId)`;
- Controlled Release production → `adapter.getStatus(productionProviderRunId)`.

Configured HTTP adapters implement those as real external GET requests.

### Semantic distinction

The provider run being observed already has its own execution identity/envelope.

The **poll request** is a second external operation.

Correct distinction:

`E_original_provider_run != E_status_poll`

if the poll itself is consequential/in envelope scope.

But the truth returned by the poll about the original provider execution must still update/link to:

`E_original_provider_run`.

This prevents the opposite errors:

- no duplicate provider-run identity;
- no erasure of the poll's own external-resource consumption.

### C1

Current code does not prove provider status GETs consume no:

- quota;
- entitlement;
- request capacity;
- shared API capacity.

R7 explicitly includes verification/reconciliation work and external requests with quota in its resource audit.

Therefore:

`PROVIDER_STATUS_POLL_C1 = RESOURCE_SEMANTICS_UNKNOWN`.

No M3 exclusion is authorized.

### C2

The GET itself is observational.

But the returned status is subsequently used to mutate QA, Builder, Release, cost, and lifecycle state.

Whether those apply-result transitions are separate C2 adoptions is transition-specific and requires Boundary Registry classification.

### Attempt identity

Current workers generally record:

- providerRunId;
- lastPolledAt;
- mutable job/run state.

They do not create one durable immutable row per poll before calling `getStatus()`.

Therefore, if status polls are C1/C2 in scope:

`STATUS_POLL_PREBOUNDARY_EXACT_ATTEMPT_IDENTITY = ABSENT`.

### Required new surface family

`S50 — Provider Status/Reconciliation Poll Attempts`

with source-specific children for Builder, QA/Repair, Release Preview, Release Production.

## 7. NCF-05 — Builder provider cancellation

### Direct source

`builder-workspace-worker.ts`

When the Bet becomes ineligible and a provider run exists, current code may call:

`adapter.cancel(providerRunId, reason)`.

The configured Builder HTTP adapter implements this as:

`POST /v1/builds/<providerRunId>/cancel`.

This is a consequential external mutation, not passive reconciliation.

### Classification

`BUILDER_PROVIDER_CANCEL = M1_C2_PROVIDER_ATTEMPT`.

It is distinct from:

- the original Builder dispatch;
- later status polling;
- local cancellation state.

### Pre-boundary identity

The current direct Workspace cancellation path does not create a dedicated immutable cancel-attempt record before invoking `adapter.cancel(...)`.

The workspace/providerRunId identify the target provider run, not the exact cancellation attempt.

Therefore:

`BUILDER_CANCEL_PREBOUNDARY_EXACT_ATTEMPT_IDENTITY = ABSENT`.

If the adapter routes into the internal Builder Gateway, that gateway's own cancellation lifecycle remains authoritative for that path.

If the configured external Builder adapter is used directly, the Workspace path needs its own source-specific cancel-attempt mapping.

### Required new surface

`S51 — Builder Provider Cancellation Attempt`

## 8. Existing repair surface — no new family required

The sweep also verified current Builder repair calls used by QA.

Those are already represented by:

- QA repair / remediation-repair M1 attempt families.

Therefore no new family is added merely because the Builder adapter exposes a `repair(...)` method.

This is an example of successful de-duplication rather than omission.

## 9. Provider status polls are not R8 duplicate attempts

A status poll can return authoritative truth about the original provider execution.

That does not make the poll the same execution.

Correct topology where the poll is in envelope scope:

`E_status_poll → poll response → R8 truth/reconciliation for E_original`.

The original provider execution remains:

`E_original`.

No provider-run envelope duplication is permitted.

## 10. Result-adoption review widened

The sweep exposed a recurring pattern not fully enumerated in the consolidated map:

provider dispatch → later provider status poll → apply provider result → authoritative local state transition.

Current examples include:

- Builder Workspace progress/terminal result application;
- QA result application;
- repair result application;
- Release preview result application;
- Release production result application.

These transitions are not automatically classified C2 here.

They must be included in the Boundary Registry review because result adoption may:

- move workflow state;
- unlock downstream stages;
- record terminal cost;
- mark QA PASS/FAIL;
- mark preview ready;
- mark production release complete;
- trigger later Asset activation.

Therefore add open classification family:

`PROVIDER_RESULT_APPLICATION_C2 = TRANSITION_SPECIFIC / BOUNDARY_REGISTRY_REVIEW_REQUIRED`.

This is not a new provider execution family by itself; it is an adoption-classification obligation.

## 11. Repository provisioning versus Builder repository finalization

Do not conflate:

### Repository provisioning

Creates the Asset's private source repository before build execution.

### Builder repository finalization

Adopts a Builder-produced code result into an already-existing authoritative repository branch.

They are distinct provider/boundary operations and require distinct attempt identities.

## 12. Asset health probe versus Release health verification

Do not conflate:

### Release provider health result

Part of preview/production Release provider execution/result.

### Asset operations health probe

A later recurring independent HTTP GET against the live Asset.

They occur at different times, under different owners, and may repeat indefinitely.

## 13. Discovery Store acquisition versus Apify experiment probe

Do not conflate:

### Discovery

Potentially exhaustive/paginated catalog traversal with retries and convergence passes.

### Experiment adapter

Bounded experiment-specific public metadata probe.

Shared Apify Store source does not collapse the execution families.

## 14. Negative-sweep coverage method

The sweep inspected the live tree and focused source paths for:

- repository/provider provisioning;
- Asset operations/health;
- Discovery acquisition;
- Builder provider control plane;
- QA provider control plane;
- Release provider control plane;
- previously traced telemetry/commercial/experiment/research/validation paths;
- generic downstream/source-specific deferrals;
- `recordAssetObservation(...)` adoption callers.

This is a materially broader test than the earlier category map.

## 15. New surfaces required before consolidation can be re-certified

Add at least:

- S47 Asset Repository Provisioning Provider Attempt;
- S48 Asset Health Probe / Health-Result Adoption;
- S49 Discovery Store Acquisition Requests;
- S50 Provider Status/Reconciliation Poll Attempts;
- S51 Builder Provider Cancellation Attempt.

S46 Build/Release Cost FACT Adoption is already added by Corrections 1.

The numbered map therefore cannot remain at 46 surfaces.

## 16. New attack fixtures

### NEG-A1 — repository provision hidden as R6 proof

Repository creation is represented only as verification evidence and has no own provider-attempt authority identity.

Must fail.

### NEG-A2 — health probe hidden as local operations

Recurring external HTTP GET is treated as local accounting/monitoring because the containing worker is local.

Must fail classification.

### NEG-A3 — Discovery/experiment Apify collapse

Discovery catalog requests and experiment probes share one attempt family/identity because both use Apify Store.

Must fail.

### NEG-A4 — status poll erased into original run

External status GET consumes provider request resources but receives no own attempt identity because it observes an existing provider run.

Must fail if C1/C2 in scope.

### NEG-A5 — status poll creates duplicate original-run envelope

Polling request is represented by creating a second envelope for the original provider execution.

Must fail identity.

### NEG-A6 — cancel hidden as reconciliation

External Builder cancel POST is classified as local control/reconciliation.

Must fail.

### NEG-A7 — apply-result adoption omitted

Provider status result mutates authoritative workflow/lifecycle state but no Boundary Registry classification exists because polling was treated as pure observation end-to-end.

Must fail coverage.

### NEG-A8 — source container stands in for repeated requests

Discovery Run, Asset, Workspace, QA Run, or Release Job is treated as one exact attempt despite repeated polls/pages/requests.

Must fail arbitrary-N attempt identity.

## 17. Consequence for F06-02

The final negative sweep strengthens F06-02 further.

The envelope/binding architecture must support not only headline dispatches but also:

- provider resource/status control-plane attempts;
- recurring probes;
- provider-side cancellation;
- repository provisioning;
- high-cardinality paginated acquisition.

A design limited to Builder/QA/Release/payment dispatch rows would remain incomplete.

## 18. Current coverage state after sweep

### Previously corrected

- S46 Build/Release cost FACT adoption.

### Newly missing

- S47 Repository provisioning;
- S48 Asset health probing;
- S49 Discovery acquisition;
- S50 status/reconciliation polling;
- S51 Builder provider cancellation.

### Newly widened review

- provider-result application/adoption classifications.

Therefore:

`MAJOR_EXECUTION_SURFACE_TOPOLOGY = NOT_YET_COMPLETE`

The prior `SUBSTANTIALLY_COMPLETE` description remains historically accurate for its artifact but is superseded for current completeness status by this sweep.

## 19. Required next step

Do **not** run PAIM yet.

Required sequence:

1. create a consolidation correction adding S47–S51;
2. add provider-result-application Boundary Registry review;
3. rerun the negative sweep specifically against:
   - remaining direct network/provider calls;
   - all repeated poll/probe loops;
   - all external mutation verbs;
   - all authoritative result-application helpers;
4. require every external call site to map to a numbered surface or explicit M3 exclusion;
5. require every authoritative adoption helper to map to positive C2 or explicit Boundary Registry unresolved/NOT_C2;
6. only after zero unexplained call sites/adoptions remain may the source→attempt→envelope linkage matrix freeze.

## 20. Disposition

`FINAL_NEGATIVE_COVERAGE_SWEEP_CANDIDATE_1 = FAIL_NEW_SURFACES_FOUND`

`NEW_NUMBERED_SURFACES_REQUIRED = S47_S51`

`REPOSITORY_PROVISIONING_OMISSION = CONFIRMED`

`ASSET_HEALTH_PROBE_OMISSION = CONFIRMED`

`DISCOVERY_ACQUISITION_OMISSION = CONFIRMED`

`PROVIDER_STATUS_POLL_OMISSION = CONFIRMED`

`BUILDER_CANCEL_OMISSION = CONFIRMED`

`PROVIDER_RESULT_APPLICATION_BOUNDARY_REVIEW = REQUIRED`

`GENERIC_DOWNSTREAM_DEFERRAL_RULE = RETAINED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = CONSOLIDATION_CORRECTIONS_2 + NEGATIVE_COVERAGE_SWEEP_RERUN`
