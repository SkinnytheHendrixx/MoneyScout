# Representation Package 02A — R18 Execution / Capability Binding Representation Design Dossier

**Status:** DESIGN DOSSIER / REVIEW CANDIDATE / NO IMPLEMENTATION AUTHORITY  
**Primary finding:** `F06-02 — EXECUTION_CAPABILITY_BINDING_ATTACHMENT`  
**Source exactness dependency:** `H2-E34`  
**Retention co-design:** `F06-04`  
**Root family:** ROOT-2 / capability authority surfaces  
**Implementation authority:** SUSPENDED

## 1. Purpose

This dossier establishes the current implementation state and a governed present-day representation design for the exact R18 Capability Binding Snapshot, exact execution↔binding attachment, and durable Binding Validation Record required by F06-02.

It is intentionally design-only.

No schema, migration, runtime, provider, or production behavior is changed by this artifact.

## 2. Why 02A must precede ROOT-1

The sequencing correction is controlling:

`F06-02 = REPRESENTATION_PREREQUISITE_FOR_ROOT1_DESIGN`

Both landed Package-01 amendments require downstream commercial authority objects to reference exact R18 binding identity:

- Amendment A requires R17/R18 same-path composition against the exact R18 binding;
- Amendment B requires R19 to preserve the exact materially-consumed R18 binding member or exact required binding set.

ROOT-1 Grant and Lineage representation therefore cannot freeze their own binding-reference shape before F06-02 supplies the representation-level target they must reference.

This is a hard design dependency, not a preference.

## 3. Directly verified current-state surfaces

### 3.1 Mutable operational capability projection

Current schema:

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

Current `capabilities` shape contains:

- numeric row ID;
- `key`;
- `provider`;
- mutable `status`;
- mutable `accessLevel`;
- `verificationMethod`;
- generic JSON `metadata`;
- `verifiedAt`;
- `expiresAt`;
- `updatedAt`.

Critical current constraint:

`UNIQUE(key)`

Current runtime mutation:

`setCapabilityAvailable()` performs `onConflictDoUpdate({ target: capabilities.key })`.

Therefore the current `capabilities` table is a **current mutable projection**, not an immutable historical Capability Binding Snapshot.

A later provider/account/status/verification change can overwrite the same logical capability row.

### 3.2 Current capability checks are current-state checks

Current code:

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

`getCapability(key)` retrieves the current unique row by logical capability key.

`hasCapability(key)` evaluates current usability from:

- status;
- access level;
- expiry.

This is useful for current operational readiness but cannot prove which exact immutable provider/account binding a historical execution consumed.

### 3.3 Generic execution jobs lack binding attachment

Current schema:

`lib/db/src/schema/execution.ts`  
Blob: `8003dcf68cedfd4ba0981030cdaf4f1d7aae603e`

`execution_jobs` persists:

- job identity;
- opportunity/evaluation-cycle identity;
- parent job;
- action/payload;
- status;
- priority/idempotency;
- attempts;
- lease/timing;
- failure data;
- result.

It has no first-class:

- R18 binding snapshot ID;
- provider-account identity;
- R6 Verification Result reference;
- verification policy/version;
- binding lifecycle-at-dispatch reference;
- Binding Validation Record reference;
- arbitrary-N binding attachment set.

### 3.4 Builder Gateway persists provider, not exact binding authority

Current schema:

`lib/db/src/schema/factory.ts`  
Blob: `0e4914790e071e840371a80ba42aa23e305108a2`

`builder_gateway_runs` persists:

- `provider`;
- provider run/thread IDs;
- execution phase;
- attempt/repair numbers;
- repository/workspace identities;
- usage/cost/provenance;
- request/result/challenge data;
- lease/timing state.

It has no exact immutable:

- `bindingId`;
- provider-account identity;
- R6 verification result/policy version;
- binding lifecycle snapshot;
- Binding Validation Record identity.

Current creation code in:

`artifacts/api-server/src/lib/builder-gateway.ts`  
Blob: `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

creates a run with:

`provider: "OPENAI_CODEX_SDK"`

but does not attach a canonical immutable R18 binding object.

### 3.5 Build-time software capability identity is not R18 operational binding identity

Current schema/code:

- `software_capability_implementations` in `factory.ts`;
- `software-capability-catalog.ts` blob `bd689f32501c419dd659d33eb3a7add5a3a3632b`.

These surfaces provide versioned build-time software implementation identity:

- family;
- implementation key;
- version;
- fingerprint;
- lifecycle;
- dependency closure;
- conformance tests.

That is valuable but semantically distinct from R18's operational Capability Binding Snapshot.

An architecture-plan `CapabilityBinding` identifies selected software implementation reuse. It does not prove which provider/account operational authority an external execution consumed.

The two concepts must not be merged merely because both use the word “binding.”

## 4. Current defect restatement

F06-02 is confirmed in current code:

> consequential execution surfaces may persist provider/current-capability information without durably attaching the exact immutable R18 binding identity, provider-account identity, R6 verification provenance/policy, lifecycle state, and boundary-time validation actually consumed.

The defect is not only “missing one foreign key.”

It is absence of the canonical immutable R18 authority object and its exact execution attachment/validation history.

## 5. H2-E34 source status

H2-E34 is:

`Binding Snapshot / Validation Record representation exactness`

Phase H H3 classifies it:

`SOURCE_NOT_YET_EXHAUSTED`

The named stronger source is the R18 live drafting/correction dialogue, which was not independently re-read during H3 for exact historical field/form questions.

Therefore this dossier must distinguish:

### Historical exact form
`UNRECOVERED / NOT CLAIMED`

### Governed present-day form
May be designed now, but every chosen table/field/type name must be labeled:

`GOVERNED_CURRENT_FORM / NOT_ASSERTED_HISTORICAL`

If the stronger R18 source is later recovered, it may amend naming/form without silently changing the semantic invariant.

## 6. Required representation properties

A compliant current representation must support all of the following.

### 6.1 Immutable Capability Binding Snapshot identity

Each binding snapshot needs a stable immutable identity independent of the mutable `capabilities` projection.

Minimum semantic dimensions:

- binding identity;
- logical capability key/scope;
- exact provider;
- exact provider-account / tenant / org / workspace where material;
- R6 Verification Result identity/provenance;
- verification policy/version;
- lifecycle state at binding creation;
- allowed operation scope;
- credential/configuration provenance sufficient to identify the authorized binding without storing secrets;
- creation/effective time;
- supersession/replacement relation where applicable;
- deterministic fingerprint over canonical authority-bearing fields.

### 6.2 Arbitrary-N execution attachment

A single consequential execution may materially consume zero, one, or many exact R18 bindings.

Therefore the representation must be set-valued.

It must support:

`Execution E → {B1...BN}`

without:

- one global `binding_id` scalar on execution;
- “current binding for capability key” lookup;
- provider-only attachment;
- Asset-level binding reuse;
- query-order/current-state inference.

Each member must remain independently addressable and deterministically scoped to the capability/operation role it satisfied.

### 6.3 Exact Binding Validation Record

Boundary-time validation must be a durable object/event, not a transient boolean.

At minimum it must identify:

- exact binding snapshot validated;
- exact execution/attempt;
- exact validation policy/version;
- validation time;
- observed lifecycle/current-eligibility facts;
- validation result/vocabulary;
- failure reason/evidence where applicable;
- validator implementation/provenance;
- whether the result was the one consumed by the consequential boundary.

A later validation record must not substitute for the historically consumed validation.

### 6.4 Provider/account identity

Provider/account identity must be first-class in the binding representation, not hidden only in untyped metadata.

The exact identity model must remain compatible with G2:

- provider equality is not enough;
- same-provider/different-account must remain distinguishable;
- unknown materially relevant account identity fails closed;
- later/current account projection cannot rewrite historical authority.

### 6.5 R6 provenance

R18 consumes R6 verification authority; it must not manufacture it.

The binding snapshot must reference enough exact R6 Verification Result/policy provenance to prove which verified claim supported the binding.

This dossier does not redefine R6 verification semantics.

## 7. Proposed governed current object model

Names in this section are **candidate governed-current names**, not recovered historical names.

### 7.1 `capability_binding_snapshots`

Purpose:

immutable R18 authority object.

Candidate semantic fields:

- `id` — immutable binding identity;
- `fingerprint` — deterministic unique fingerprint;
- `capability_key`;
- `provider`;
- `provider_account_identity` — typed normalized identity or canonical structured value;
- `operation_scope` — canonical set/structured scope;
- `r6_verification_result_ref`;
- `r6_policy_version_ref`;
- `lifecycle_state_at_binding`;
- `authority_provenance`;
- `configuration_provenance_fingerprint` where materially required;
- `supersedes_binding_id` or equivalent history relation;
- `effective_at`;
- `created_at`.

No update path may rewrite authority-bearing fields after creation.

A lifecycle change that changes authorization semantics creates or references a successor/current-state authority event rather than mutating historical truth.

### 7.2 `execution_capability_binding_attachments`

Purpose:

many-to-many exact execution↔binding set membership.

Candidate semantic fields:

- attachment identity;
- canonical execution identity;
- execution attempt identity;
- exact `binding_snapshot_id`;
- consumed capability/operation scope;
- attachment role;
- attached/frozen time;
- attachment provenance.

Required uniqueness must prevent duplicate membership for the same execution/attempt/binding/scope while allowing arbitrary-N different bindings.

### 7.3 `capability_binding_validation_records`

Purpose:

durable exact boundary-time validation evidence.

Candidate semantic fields:

- validation record identity;
- exact `binding_snapshot_id`;
- exact execution/attempt identity;
- validation policy/version;
- validation result;
- observed lifecycle/current-eligibility state;
- provider/account equality result where materially consumed;
- evidence/provenance;
- validation time;
- boundary-consumed marker or exact boundary-consumption reference.

This table/object must be append-only for historical validations.

## 8. Hardest design question — canonical execution identity

The principal unresolved design question is **not** whether R18 needs immutable bindings. It does.

The hardest question is:

> What canonical execution/attempt identity should the attachment and validation objects reference across heterogeneous consequential execution surfaces?

Current repository surfaces include at least:

- generic `execution_jobs`;
- `builder_gateway_runs`;
- commercial/payment execution paths;
- other provider-specific execution/reconciliation surfaces.

A naive nullable-polymorphic schema such as:

- `execution_job_id nullable`;
- `builder_gateway_run_id nullable`;
- `payment_event_id nullable`;
- etc.

would create weak referential integrity and make future consequential consumers require schema surgery.

A provider-specific attachment table would also fail the universal R18 model.

### Candidate design direction

Introduce or identify one canonical **Execution Authority Attempt identity** that every consequential provider execution can reference, and attach R18 bindings to that identity.

The canonical execution identity must preserve:

- logical execution identity;
- exact attempt identity;
- execution class/action;
- opportunity/bet context where applicable;
- R8 provider-execution truth linkage;
- retry/successor distinction.

Existing `execution_jobs` may be one producer of that identity, but must not automatically be assumed to be the universal canonical execution object without repository-wide consumer inventory.

### Current dossier disposition

`CANONICAL_EXECUTION_ATTACHMENT_OWNER = UNRESOLVED_DESIGN_DECISION`

This must be resolved before PAIM freeze or implementation.

## 9. Current projection versus immutable authority

The existing `capabilities` table should not simply be converted in place into an append-only binding history without proving every current consumer remains correct.

Candidate separation:

- `capabilities` remains a current operational projection/discovery surface;
- immutable `capability_binding_snapshots` become historical authority;
- a current projection may point to a current binding snapshot;
- executions always freeze exact binding snapshot IDs and never rely on the current projection later.

This separation directly closes the current/default substitution class while preserving efficient current readiness queries.

Whether `capabilities` itself remains the current projection or is replaced by a derived/current-view structure is a physical-design question for PAIM.

## 10. Validation timing model

R18 distinguishes:

- a binding existing;
- a binding having been valid earlier;
- a binding being boundary-currently valid.

Therefore design must permit multiple validation records for one immutable binding over time.

Example:

- B1 created/validated T1;
- B1 remains same immutable binding;
- lifecycle/account state changes;
- boundary validation T2 fails;
- historical T1 PASS remains true but cannot authorize T2 execution.

The model must never update the old validation row to FAIL or replace it with the latest result.

## 11. Lifecycle and successor semantics

A successor binding B2 must not mutate B1.

Required properties:

- B1 remains addressable;
- B2 may explicitly supersede/rebind from B1;
- an execution frozen to B1 remains frozen to B1;
- retry semantics must deliberately choose whether the same attempt retains B1 or a governed successor attempt may bind B2;
- no automatic “heal to current binding” behavior is permitted.

## 12. Migration/backfill policy

Historical rows currently lack exact binding identity.

Therefore migration must not synthesize false exactness.

Candidate classification for legacy executions:

### Class L1 — exact binding recoverable
Durable evidence uniquely proves exact provider/account/binding-equivalent authority and required verification provenance.

May backfill a governed binding snapshot with provenance marking the reconstruction basis.

### Class L2 — partially recoverable
Provider is known but account, exact verification, scope, or binding history is ambiguous.

Must not fabricate a fully authoritative binding.

Represent as legacy incomplete/unresolved evidence and fail closed where exact historical authority is required.

### Class L3 — unrecoverable
No unique historical binding can be proven.

Remain permanently unknown for exact authority purposes.

No current binding may be assigned retroactively.

This preserves the established source-conservative rule:

`UNKNOWN ≠ FALSE SUCCESS`

and:

`CURRENT ≠ HISTORICAL`.

## 13. Retention co-design — F06-04

F06-04 must be designed now, not after implementation.

Required durability:

- binding snapshots survive deletion/archive of current projection;
- execution↔binding attachments remain addressable;
- validation records remain addressable;
- R6/provider-account provenance remains resolvable;
- supersession does not delete prior binding authority;
- current projection deletion cannot orphan historical execution evidence.

Candidate deletion policy:

- historical binding/attachment/validation authority records use restrictive or tombstone-preserving retention;
- current capability projection may change/delete only if historical authority references remain valid;
- any redaction must preserve authority fingerprint/provenance necessary for exact historical proof.

Exact retention periods are policy, not established here.

## 14. ROOT-2 physical-writer candidate scope

Likely physical surfaces include:

- `lib/db/src/schema/human-actions.ts` or a new dedicated R18 schema module for current capability projection/binding history;
- execution authority schema surface for exact attachment;
- migration files;
- current capability mutation/read logic in `human-gates.ts`;
- provider-execution consumers that currently persist provider only, including Builder Gateway;
- validation/recheck logic at consequential boundaries;
- tests/fixtures.

This is a **candidate writer inventory**, not frozen PAIM.

Repository-wide consumer inventory remains mandatory before MAY_LAND.

## 15. Invalidation/recheck fan-out

Any F06-02 implementation changes invalidate/recheck at minimum:

- R18 representation certification;
- F07-01;
- F07-03;
- F07-04;
- F07-05;
- F07-06;
- G2 provider/account path evidence where affected;
- Package-01 A/B cross-surface certifications as evidence consumers;
- XPI-04 affected provider-path component;
- F06-04 retention compatibility.

No dependent finding auto-closes from F06-02 alone.

## 16. Mandatory attack fixtures

### 16.1 Current-binding substitution

Execution freezes B1.

Current projection later points to B2.

Historical execution must still resolve B1.

### 16.2 Same provider / different account

B1 = provider P / account A1.

Current/successor binding = provider P / account B1.

Provider equality alone must not pass.

### 16.3 Unknown account

Provider known; materially relevant account unknown.

Binding creation/consumption must fail closed for authority requiring exact account identity.

### 16.4 Arbitrary-N execution

One execution materially consumes B1…BN for distinct scopes.

Every required member must be attached and independently addressable.

Dropping or replacing one member fails.

### 16.5 Later validation substitution

B1 validated PASS at V1.

Later V2 exists.

Historical boundary must identify the exact validation actually consumed, not latest V2.

### 16.6 Lifecycle degradation before boundary

Binding B1 exists and passed earlier verification.

It becomes QUARANTINED/RETIRED/otherwise ineligible before consequential dispatch.

Boundary validation must fail without rebinding to a healthier current B2.

### 16.7 Retry/successor

Retry must not silently inherit a replacement binding unless governed retry semantics explicitly authorize a new binding and preserve attempt distinction.

### 16.8 Replay / post-hoc repair

A missing historical attachment cannot be “fixed” by attaching the current binding and declaring the prior effect authorized.

### 16.9 Provider execution truth

If external provider execution crossed, R8 truth remains authoritative even when binding evidence is missing/invalid.

No R18 repair may erase or replay the historical external attempt.

### 16.10 Projection deletion

Deleting/rotating current `capabilities` state must not make historical B1/validation/attachment evidence disappear.

## 17. Source-governance gate

Before final representation contract freeze:

1. perform targeted recovery attempt against the named stronger R18 live drafting/correction source if accessible;
2. classify recovered exact fields/form versus still-unrecovered form;
3. for unrecovered exact form, explicitly adopt governed-current names with non-historical marking;
4. do not claim current candidate field/table names are historically canonical.

The semantic object requirements are already strong enough to design even if historical naming remains unrecovered.

## 18. Required next review questions

The adversarial review should concentrate on:

1. Is a separate immutable `capability_binding_snapshots` object necessary, or can an existing immutable surface satisfy it without semantic collision?
2. What is the canonical universal execution/attempt identity for attachments?
3. Should the current `capabilities` table remain a projection or be replaced?
4. Is provider-account identity sufficiently first-class/typed, or does a generic structured field permit ambiguity?
5. Does the proposed validation record carry enough evidence to distinguish historical validation from current eligibility?
6. Can arbitrary-N binding-set attachment be proven without query-order/current-state dependence?
7. Does retention preserve all authority-bearing evidence under delete/archive/redaction?
8. Are Builder Gateway and generic execution jobs the complete consumer set, or are additional consequential execution surfaces missing from the writer inventory?
9. Does any proposed migration/backfill path accidentally manufacture authority for legacy records?
10. Does the proposed representation give ROOT-1 a stable exact reference target without prematurely coupling ROOT-1 to provider-specific R18 fields?

## 19. Current disposition

`F06-02_CURRENT_DEFECT = DIRECTLY_CONFIRMED`

`H2-E34_HISTORICAL_EXACT_FORM = NOT_YET_RECOVERED`

`GOVERNED_CURRENT_REPRESENTATION_DESIGN = PROPOSED`

`IMMUTABLE_BINDING_SNAPSHOT = REQUIRED`

`EXECUTION_TO_BINDING_CARDINALITY = ARBITRARY_N`

`DURABLE_BINDING_VALIDATION_RECORD = REQUIRED`

`CURRENT_CAPABILITY_PROJECTION_IS_NOT_HISTORICAL_AUTHORITY = CONFIRMED`

`CANONICAL_EXECUTION_ATTACHMENT_OWNER = UNRESOLVED_DESIGN_DECISION`

`F06-04_RETENTION = CO_DESIGN_SCOPE`

`ROOT1_DESIGN_FREEZE_BLOCKED_UNTIL_R18_REFERENCE_TARGET_STABLE = YES`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = ADVERSARIAL_REVIEW_AND_EXECUTION_IDENTITY_ADJUDICATION`
