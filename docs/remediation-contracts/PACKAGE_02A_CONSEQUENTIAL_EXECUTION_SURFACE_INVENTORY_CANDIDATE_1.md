# Representation Package 02A — Consequential Execution Surface Inventory Candidate 1

**Status:** INVENTORY CANDIDATE / COVERAGE REVIEW REQUIRED / NO IMPLEMENTATION AUTHORITY  
**Primary finding:** `F06-02 — EXECUTION_CAPABILITY_BINDING_ATTACHMENT`  
**Envelope design:** adopted with R8 enforceable-link correction  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact inventories current repository execution/provider surfaces that may create or record consequential attempts and assigns a candidate Execution Authority Envelope linkage pattern.

It is intentionally a **candidate**, not a completeness certification.

A surface is not silently excluded merely because its consequence class is uncertain. Uncertain surfaces remain open for explicit classification.

## 2. Governing envelope rules

- one envelope = one exact consequential attempt;
- envelope exists durably before consequential boundary crossing;
- R18 binding attachments reference the envelope;
- R8 exact external truth must reference the same envelope through enforceable relational linkage;
- no polymorphic `source_type/source_id` authority pointer;
- logical container rows may relate to multiple envelopes;
- every authoritative source↔envelope edge uses an ordinary FK or source-specific bridge with ordinary FKs.

## 3. Surface inventory summary

### CE-01 — Builder Gateway provider execution

**Primary surface:** `builder_gateway_runs`  
**Schema:** `lib/db/src/schema/factory.ts`  
**Worker:** `artifacts/api-server/src/lib/builder-gateway.ts`

Current row semantics include:

- one builder gateway run row;
- `attemptNumber`;
- exact provider string;
- provider run/thread IDs;
- durable execution phase;
- idempotency key;
- external cost/provenance;
- lease/reconciliation state.

Current weakness:

no exact R18 binding snapshot, provider-account identity, R6 verification provenance/policy version, or validation-record identity.

**Container or attempt?**  
Candidate: exact attempt object.

**Envelope pattern:**  
Pattern A is plausible:

`builder_gateway_runs.execution_authority_envelope_id NOT NULL FK → execution_authority_envelopes.id`

for governed consequential rows.

**Boundary point:**  
must exist before transition out of `PRE_PROVIDER` into provider-dispatch-attempted semantics.

**R8 linkage:**  
provider run/thread truth belongs to the same attempt row and can therefore converge on the same envelope directly.

**Inventory confidence:** HIGH.

---

### CE-02 — Builder Workspace coding-agent dispatch

**Primary surface:** `builder_workspaces`  
**Worker:** `builder-workspace-worker.ts`

Current row contains:

- `dispatchAttemptCount`;
- provider;
- provider run ID;
- gateway run ID;
- workspace/repository identity;
- one durable workspace per build job.

Current worker increments `dispatchAttemptCount` before adapter dispatch.

**Container or attempt?**  
Container.

One workspace row can represent more than one dispatch attempt.

**Envelope pattern:**  
Pattern B required.

Candidate source-specific attempt relation:

`builder_workspace_dispatch_attempts`

with:

- FK → builder workspace;
- attempt ordinal;
- idempotency identity;
- provider;
- provider run identity;
- FK → Execution Authority Envelope.

If the Builder Workspace delegates every real external provider dispatch to an already-attempt-normalized Builder Gateway run, the final design may instead prove the gateway attempt is the canonical provider-attempt object and avoid duplicate envelopes. That must be demonstrated, not assumed.

**Boundary point:**  
attempt/link + envelope must be durable before adapter dispatch.

**Inventory confidence:** HIGH that workspace row itself is not a safe one-envelope target; exact canonical source still requires flow-level proof.

---

### CE-03 — QA provider dispatch

**Primary surface:** `qa_runs`  
**Worker:** `qa-debug-worker.ts`

Current row contains:

- `qaDispatchAttemptCount`;
- `qaProviderRunId`;
- QA provider;
- QA idempotency key;
- repair attempt count/provider state on the same QA lifecycle surface.

Worker increments QA dispatch attempt count before dispatch.

**Container or attempt?**  
Container.

**Envelope pattern:**  
Pattern B required.

Candidate exact attempt relation:

`qa_provider_attempts`

or equivalent source-specific child with:

- FK → qa run;
- attempt kind `QA` / `REPAIR` where applicable;
- attempt ordinal;
- idempotency key;
- provider/provider-run identity;
- FK → envelope.

**Boundary point:**  
before each external QA/repair provider dispatch.

**Inventory confidence:** HIGH.

---

### CE-04 — Controlled Release preview dispatch

**Primary surface:** `release_jobs`  
**Schema:** `lib/db/src/schema/release.ts`  
**Worker:** `controlled-release-worker.ts`

Current row contains separate:

- preview provider run ID;
- preview idempotency key;
- preview dispatch attempt count.

Worker increments preview attempt count before adapter dispatch.

**Container or attempt?**  
Release job is a container; preview dispatch is an attempt family.

**Envelope pattern:**  
Pattern B required.

Candidate:

`release_provider_attempts`

with stage = PREVIEW, exact ordinal/idempotency/provider/run identity, FK → release job + envelope.

**Boundary point:**  
before release adapter preview dispatch.

**Inventory confidence:** HIGH.

---

### CE-05 — Controlled Release production dispatch

Same `release_jobs` row also contains:

- production provider run ID;
- production idempotency key;
- production dispatch attempt count.

Retryable production failures can update idempotency/attempt state for another dispatch.

**Container or attempt?**  
Container; each production dispatch is a distinct attempt.

**Envelope pattern:**  
Pattern B, likely same normalized `release_provider_attempts` relation with stage = PRODUCTION.

**Boundary point:**  
before production adapter dispatch.

**Inventory confidence:** HIGH.

---

### CE-06 — Asset remediation repair-provider dispatch

**Primary surface:** `asset_remediation_runs`  
**Schema:** `lib/db/src/schema/asset.ts`  
**Worker:** `asset-remediation-worker.ts`

Current row contains:

- `repairAttemptCount`;
- repair provider run ID;
- repair idempotency key;
- builder provider.

Worker creates repeated bounded repair attempts.

**Container or attempt?**  
Container.

**Envelope pattern:**  
Pattern B required.

Candidate:

`asset_remediation_attempts`

with attempt kind = REPAIR.

**Boundary point:**  
before each repair provider dispatch.

**Inventory confidence:** HIGH.

---

### CE-07 — Asset remediation QA-provider dispatch

Same remediation run also stores:

- QA provider;
- QA provider run ID;
- QA idempotency key.

One remediation run can therefore contain both repair and QA provider attempts.

**Container or attempt?**  
Container.

**Envelope pattern:**  
Pattern B, same normalized remediation-attempt relation with attempt kind = QA.

**Boundary point:**  
before QA provider dispatch.

**Inventory confidence:** HIGH.

---

### CE-08 — Asset remediation preview release

Same remediation run stores:

- release provider;
- preview provider run ID;
- preview idempotency key.

**Container or attempt?**  
Container.

**Envelope pattern:**  
Pattern B with attempt kind = RELEASE_PREVIEW.

**Boundary point:**  
before preview release dispatch.

**Inventory confidence:** HIGH.

---

### CE-09 — Asset remediation production release

Same remediation run stores:

- production provider run ID;
- production idempotency key.

**Container or attempt?**  
Container.

**Envelope pattern:**  
Pattern B with attempt kind = RELEASE_PRODUCTION.

**Boundary point:**  
before production release dispatch.

**Inventory confidence:** HIGH.

---

### CE-10 — Commercial activation / outbound payment preparation or charge path

**Primary surface:** `commercial_activations`  
**Schema:** `lib/db/src/schema/asset.ts`  
**Worker:** `commercial-activation-worker.ts`

Current row contains:

- provider;
- checkout reference;
- transaction readiness;
- `preparationAttemptCount`;
- provider operation key;
- charging authorization state.

The row is also subject to the existing ROOT-1 defects and Asset-level uniqueness.

**Container or attempt?**  
Container / authority aggregate, not safe as exact execution attempt.

**Envelope pattern:**  
Pattern B required for any exact outbound provider preparation/charge attempt.

Candidate commercial execution-attempt child must be separate from the current activation authority row.

**Boundary point:**  
before exact external payment/checkout/charge provider action.

**R8 linkage:**  
must converge with whatever provider transaction/execution truth is later observed.

**Inventory confidence:** HIGH that activation row itself is not the canonical attempt; exact outbound attempt schema requires deeper flow inventory.

---

### CE-11 — Payment provider event / R8 inbound external truth

**Primary surface:** `payment_provider_events`

Current fields include:

- activation FK;
- provider;
- provider event ID;
- provider transaction ID;
- event type/payment status;
- authoritative/signature-verified flags;
- occurred/received timestamps.

This is a concrete R8-relevant external-truth surface.

**Container or attempt?**  
Provider event observation, not necessarily the initiating outbound attempt.

Multiple provider events may refer to the same provider transaction/attempt.

**Envelope pattern:**  
Pattern B / R8-specific linkage required.

A provider event must not itself automatically create a new envelope merely because one webhook/event row exists.

Candidate relation must prove which exact envelope/attempt the event belongs to using authoritative provider transaction/execution identity.

If unique linkage cannot be proven, the event remains unlinked/ambiguous rather than being attached by current activation/provider coincidence.

**Boundary/truth point:**  
external event receipt is evidence of provider truth, not pre-boundary authorization.

**Inventory confidence:** HIGH that this is an R8 truth surface; exact many-events-to-one-attempt mapping needs design.

---

### CE-12 — Generic `execution_jobs`

**Primary surface:** `execution_jobs`

This table is a scheduler/orchestration abstraction with:

- action;
- payload;
- attempts;
- lease/timing;
- status/result.

It is not proven to be a universal provider-attempt object.

**Container or attempt?**  
Logical orchestration container by default.

Some actions may produce no external consequential attempt; some may indirectly produce multiple.

**Envelope pattern:**  
No automatic direct one-to-one envelope linkage.

If a specific execution action itself becomes the exact external attempt object, that action-specific path must prove Pattern A eligibility; otherwise downstream source-specific attempt rows own envelope linkage.

**Inventory confidence:** HIGH that universal one-to-one mapping is rejected.

## 4. Additional current external-provider surfaces requiring explicit consequence classification

The repository contains additional provider/external activity that may or may not fall within R18 consequential-binding scope.

These cannot be excluded silently.

### CE-U01 — Asset telemetry syncs

Current schema contains provider, idempotency key, status, cursor/coverage, external cost.

Open question:

Is this purely observational/telemetry collection, or can it consume consequential paid/provider authority requiring R18 binding and envelope identity?

**State:** CLASSIFICATION_REQUIRED.

### CE-U02 — Research / validation execution providers

Repository contains research execution/provider surfaces.

Open question:

Which of these are consequential under the R18/R8 authority model versus evidence-gathering operations with separate governance?

**State:** CLASSIFICATION_REQUIRED.

### CE-U03 — Repository mutation as external boundary

Builder Gateway explicitly models repository finalization/push as a separate durable external boundary after provider execution.

Open question:

Does one provider attempt envelope cover both provider execution and repository mutation, or must repository mutation be modeled as a distinct consequential attempt/envelope class?

Because the current gateway state machine distinguishes:

- provider dispatch attempted;
- provider run confirmed;
- repository finalization attempted;

this cannot be assumed.

**State:** ATTEMPT-GRANULARITY_ADJUDICATION_REQUIRED.

## 5. R8 inventory rule applied

Concrete R8 surfaces identified in this pass include:

- Builder Gateway provider run/thread identity + execution phase;
- Builder Workspace provider run identity;
- QA provider run identity;
- controlled release provider run identities;
- asset-remediation provider run identities;
- payment provider events / provider transaction IDs;
- any additional provider-reconciliation objects discovered in coverage completion.

Each must ultimately be linked to the envelope using Pattern A/B ordinary FK discipline.

Provider/run-string equality by itself is never authoritative envelope linkage.

## 6. Candidate normalized attempt families

A minimal physical design may not need one new attempt table per worker.

Candidate families for later PAIM review:

1. `execution_authority_envelopes` — canonical attempt parent.
2. `provider_execution_attempts` — generic source-attempt child only if it can preserve source-specific FK integrity without polymorphism.
3. source-specific attempt tables where generic normalization would weaken referential integrity:
   - builder workspace/gateway as needed;
   - QA;
   - release;
   - remediation;
   - commercial payment.
4. R8 observation/link tables for many-events-to-one-attempt evidence.

This artifact does not freeze table count.

The governing criterion is referential integrity and exact attempt identity, not schema minimalism.

## 7. Cross-surface duplicate-attempt risk

Several rows can describe the same underlying provider action indirectly.

Example candidate overlap:

- Builder Workspace may delegate to Builder Gateway;
- both may persist a provider run/gateway run relationship.

The final inventory must distinguish:

- distinct attempts; versus
- two representations of one attempt.

Rule:

`ONE_EXTERNAL_ATTEMPT MUST NOT RECEIVE TWO ENVELOPES`

unless they represent genuinely distinct consequential boundaries.

This is the mirror-image risk of attempt collapse.

## 8. New attack fixture — duplicate envelope

### EAE-A7 — duplicate representation of one external attempt

One Builder Workspace dispatch delegates to one Builder Gateway run.

If both surfaces independently create envelopes E1 and E2 for the same provider attempt, the model fails.

The design must either:

- designate one canonical attempt row/envelope and link the other surface to it; or
- prove the two envelopes represent distinct consequential boundaries.

## 9. Current coverage result

Directly inventoried high-confidence surfaces:

- CE-01 Builder Gateway;
- CE-02 Builder Workspace;
- CE-03 QA;
- CE-04/05 controlled release preview/production;
- CE-06/07/08/09 asset-remediation repair/QA/preview/production;
- CE-10 commercial activation outbound path;
- CE-11 payment-provider R8 truth;
- CE-12 generic execution jobs.

Open classification/granularity surfaces:

- CE-U01 asset telemetry;
- CE-U02 research/validation external execution;
- CE-U03 repository mutation boundary granularity.

Therefore:

`INVENTORY_COMPLETE = NO`

This is deliberate. PAIM freeze is blocked until CE-U01/02/03 are adjudicated and a repository-wide negative search/inventory proves no additional consequential execution surface is omitted.

## 10. Next gate

Before PAIM freeze:

1. adjudicate telemetry consequence class;
2. adjudicate research/validation provider consequence class;
3. adjudicate repository-finalization attempt granularity;
4. prove Builder Workspace↔Builder Gateway duplicate-attempt handling;
5. complete R8 provider-truth surface inventory;
6. perform repository-wide negative coverage check for additional provider dispatch/release/payment/external-mutation paths;
7. freeze the source-surface→attempt→envelope linkage map.

## 11. Disposition

`EXECUTION_AUTHORITY_ENVELOPE_PATTERN = RETAINED`

`R8_ENFORCEABLE_LINKAGE = REQUIRED`

`HIGH_CONFIDENCE_INVENTORIED_SURFACES = 12`

`OPEN_CLASSIFICATION/GRANULARITY_ITEMS = 3`

`DUPLICATE_ENVELOPE_ATTACK_ADDED = EAE-A7`

`INVENTORY_COMPLETE = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = CONSEQUENCE_CLASSIFICATION_AND_COVERAGE_COMPLETION`
