# Representation Package 02A — All-Call-Site Ledger Corrections 1: Sample Verification

**Status:** LEDGER CORRECTION OVERLAY / SAMPLE VERIFICATION COMPLETE / L012 IDENTITY CORRECTED  
**Controls over:** `PACKAGE_02A_ALL_CALL_SITE_LEDGER_CANDIDATE_1.md` where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

Candidate 1 required direct source sampling across the remaining identity/C1/C2 shapes before ledger promotion.

This correction records the results for:

- L001 Builder Gateway;
- L004 QA dispatch;
- L007/L008 Release dispatch;
- L012 Validation Evidence Collector;
- L013 Kill-Risk Collector;
- L047 Repository Provisioning.

One ledger classification changes:

`L012 Validation Evidence Collector: NONE → LOGICAL_STATE_ONLY`.

No numbered surface is added.

## 2. L001 — Builder Gateway

Verified:

`artifacts/api-server/src/lib/builder-gateway.ts`

Current exact Gateway run row exists before provider execution.

Before the provider boundary the worker durably:

1. claims the exact `builderGatewayRuns` row;
2. sets:
   - `status = PREPARING`;
   - exact lease owner;
   - `startedAt`;
3. later CAS-transitions the same exact run to:
   - `status = RUNNING`;
4. immediately before provider dispatch CAS-writes:
   - `executionPhase = PROVIDER_DISPATCH_ATTEMPTED`.

Only after that durable transition may the driver cross the provider boundary.

Therefore:

`L001_PREBOUNDARY_IDENTITY = EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY`.

This is stronger than generic logical state.

It still lacks the Package-02A exact R18/R7/R20 envelope attachment.

Candidate-1 L001 classification is confirmed.

## 3. L004 — QA dispatch

Verified:

`artifacts/api-server/src/lib/qa-debug-worker.ts::dispatchQa(...)`

Before `adapter.dispatch(...)`, current code durably updates the existing QA Run:

- `status = DISPATCHING`;
- provider;
- cost mode;
- `qaDispatchAttemptCount + 1`.

Then it calls the provider.

Therefore:

`L004_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`.

The QA Run is durable and precedes dispatch, but does not create a distinct immutable child attempt identity for each dispatch.

### Idempotency nuance

On transient dispatch failure current code returns the QA Run to PENDING and explicitly states that the same idempotency key will be reused.

Therefore future design must preserve:

`SAME_PROVIDER_IDEMPOTENCY_DOMAIN != AUTOMATIC_SAME_EXECUTION_ENVELOPE`.

A new consequential dispatch normally requires a new envelope even where the provider idempotency key is deliberately reused to suppress duplicate side effects.

Final retry semantics must distinguish:

- new local dispatch attempt;
- same provider operation idempotency domain;
- provider-boundary uncertainty.

## 4. L007/L008 — Controlled Release preview/production dispatch

Verified:

`artifacts/api-server/src/lib/controlled-release-worker.ts::dispatchStage(...)`

Before `adapter.dispatch(...)`, the Release Job is durably updated to:

- preview: `PREVIEW_DEPLOYING`;
- production: `PRODUCTION_DEPLOYING`;

and increments the appropriate stage-specific attempt counter.

The provider call follows afterward.

Therefore:

`L007_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`

`L008_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`.

The shared Release Job remains a container; it does not create one immutable per-dispatch attempt row.

### Retry nuance

Confirmed provider failure can create a new stage-specific idempotency key for the next attempt.

Transient dispatch failure before a provider run is confirmed reuses the same idempotency key.

Package 02A must not equate either idempotency-key behavior with envelope identity without exact boundary proof.

## 5. L012 — Validation Evidence Collector correction

Verified caller:

`artifacts/api-server/src/routes/validation-evidence.ts`

Before calling:

`collectValidationEvidence(...)`

the route inserts a durable `researchRuns` row with:

- `startedAt = new Date()`;
- trigger type for Validation Evidence;
- RUNNING notes.

Only then does the collector call Anthropic.

Therefore Candidate 1 was too conservative when it recorded:

`NONE unless exact row proven otherwise`.

Correct classification:

`L012_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`.

The row is not a full execution authority envelope because exact R18/R7/provider-account/boundary attachments are absent.

On AI-integration-unavailable paths the run may later be deleted; that does not erase the fact that durable pre-boundary state existed at dispatch time on the normal call path.

## 6. L013 — Kill-Risk Collector

Verified caller:

`artifacts/api-server/src/routes/evidence-workers.ts::/kill-screen/collect`

Current sequence:

1. add only in-memory `activeCollectors`;
2. call:
   `collectKillRiskEvidence(...)`;
3. persist returned findings;
4. run deterministic kill-screen evaluation;
5. only afterward insert `researchRuns` with:
   - `startedAt = new Date()`;
   - `finishedAt = new Date()`;
   - `triggerType = KILL_RISK_CHECK`.

Therefore:

`L013_PREBOUNDARY_IDENTITY = NONE`.

The persisted Research Run is post-provider result/audit state, not pre-dispatch authority.

Candidate-1 L013 classification is now directly confirmed.

## 7. L047 — Repository Provisioning

Verified:

- `asset-factory.ts::provisionRepository(...)`;
- `asset-repository-provisioner.ts`.

Factory Run and Asset Repository identity already exist before:

`input.provisioner.provision(...)`.

But the exact provider operation is invoked before an immutable provision-attempt child object exists.

After return the Asset Repository row receives:

- provider;
- external repository identity;
- URL;
- branch;
- exact base commit SHA.

Therefore:

`L047_PREBOUNDARY_IDENTITY = LOGICAL_STATE_ONLY`.

Candidate-1 L047 classification is confirmed.

## 8. Sample-verification outcome

### Confirmed as written

- L001 Builder Gateway → `EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY`;
- L004 QA → `LOGICAL_STATE_ONLY`;
- L007 Preview Release → `LOGICAL_STATE_ONLY`;
- L008 Production Release → `LOGICAL_STATE_ONLY`;
- L013 Kill-Risk → `NONE`;
- L047 Repository Provisioning → `LOGICAL_STATE_ONLY`.

### Corrected

- L012 Validation Evidence:
  - old: `NONE unless exact row proven otherwise`;
  - new: `LOGICAL_STATE_ONLY`.

## 9. Identity-taxonomy evidence widened

The direct samples now provide multiple independent live examples in each current class:

### NONE

- Autonomous Resolution;
- telemetry;
- Asset health probe;
- Policy HTTP;
- Policy Anthropic;
- Kill-Risk.

### LOGICAL_STATE_ONLY

- QA;
- Release preview;
- Release production;
- Validation Evidence;
- Apify Experiment;
- commercial prepare;
- commercial activate;
- repository provisioning;
- Demand Anthropic.

### EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY

- Builder Gateway.

### FULL_ENVELOPE_COMPLIANT

- none.

## 10. New retry/idempotency rule

Add:

`IDEMPOTENCY_KEY_IDENTITY != EXECUTION_ATTEMPT_IDENTITY`.

A provider idempotency key may intentionally survive a local retry to prevent duplicate external effects.

The envelope model must still prove whether a subsequent local dispatch is:

- continuation of the same exact attempt before boundary crossing;
- reconciliation of an uncertain prior attempt;
- a new consequential dispatch attempt.

No classification may be inferred solely from idempotency-key equality.

## 11. Attack fixtures

### LED-A1 — Validation evidence flattened to NONE

Pre-dispatch Research Run exists, but ledger classifies it like Kill-Risk.

Must fail factual precision.

### LED-A2 — QA idempotency reuse collapses attempts

Two distinct local provider dispatches reuse the same provider idempotency key and are assigned one envelope without boundary proof.

Must fail.

### LED-A3 — Release idempotency rotation defines envelope

A changed stage idempotency key is treated as the sole evidence that a new envelope is required.

Must fail; new consequential dispatch semantics, not string inequality alone, govern envelope identity.

### LED-A4 — Builder exact run inflated to full compliance

Builder Gateway's strong exact pre-boundary row is treated as F06-02 complete despite missing exact R18/R7/R20 authority attachments.

Must fail.

## 12. Disposition

`LEDGER_SAMPLE_VERIFICATION = COMPLETE_FOR_REQUIRED_SAMPLE_SET`

`L012_CLASSIFICATION_CORRECTED = LOGICAL_STATE_ONLY`

`L001_L004_L007_L008_L013_L047 = CONFIRMED`

`IDEMPOTENCY_KEY_IDENTITY != EXECUTION_ATTEMPT_IDENTITY`

`NUMBERED_SURFACE_FLOOR = 54`

`FINAL_COVERAGE_CERTIFICATION = NOT_YET_AUTHORIZED`

`NEXT_GATE = FINAL_UNLEDGERED_CALL_SITE_SEARCH + LEDGER PROMOTION/REJECTION`
