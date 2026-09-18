# Representation Package 02A — Execution Authority Envelope Adjudication

**Status:** DESIGN ADJUDICATION / ENVELOPE PATTERN ADOPTED WITH REFERENTIAL-INTEGRITY REFINEMENT / NO IMPLEMENTATION AUTHORITY  
**Primary finding:** `F06-02 — EXECUTION_CAPABILITY_BINDING_ATTACHMENT`  
**Parent dossier:** `PACKAGE_02A_R18_REPRESENTATION_DESIGN_DOSSIER.md`  
**Implementation authority:** SUSPENDED

## 1. Question

What canonical execution/attempt identity should R18 Capability Binding attachments and Binding Validation Records reference across heterogeneous consequential execution surfaces?

## 2. Adjudication

Adopt a dedicated, thin:

`EXECUTION_AUTHORITY_ENVELOPE`

as the canonical cross-cutting identity for one exact consequential execution **attempt**.

The envelope is not:

- a replacement for `execution_jobs`;
- a replacement for `builder_gateway_runs`;
- a replacement for commercial/provider execution tables;
- an R8 outcome object;
- a generic event log;
- a provider-specific authority object.

It is the stable identity spine to which exact R18 binding-set membership, validation evidence, later R19 lineage, and eventually R20 Boundary Decision evidence can refer.

## 3. Important refinement — do not create a polymorphic foreign key

The envelope concept is adopted, but one part of the initial proposal requires correction.

A single envelope row cannot contain an authoritative field equivalent to:

`source_type + source_row_id`

and claim database-level referential integrity to whichever underlying table `source_type` names.

Postgres cannot enforce one ordinary foreign key against multiple possible target tables.

That would recreate the nullable/polymorphic-reference problem under a cleaner abstraction.

Therefore:

`POLYMORPHIC_SOURCE_FK = PROHIBITED_AS_AUTHORITY`

A source kind/key may exist as descriptive routing metadata, but it is not sufficient as the authoritative relational link.

## 4. Correct relationship direction

The envelope is the **parent authority identity**.

Each consequential execution surface must attach its exact attempt to the envelope through an enforceable relational path.

Permitted patterns:

### Pattern A — direct source-attempt FK

A source table that already has exactly one row per consequential attempt may carry:

`execution_authority_envelope_id NOT NULL FK → execution_authority_envelopes.id`

for rows that are consequential/provider-dispatch capable.

### Pattern B — source-specific attempt/link table

If an existing source row is a logical container that can contain multiple attempts, create a dedicated source-specific attempt/link relation with:

- its own attempt identity;
- non-null FK to the underlying source row;
- exact attempt ordinal/idempotency identity;
- non-null FK to the execution-authority envelope.

This keeps every relational edge enforceable.

No central table of nullable foreign keys to every possible source type is permitted.

## 5. Why attempt-level, not row-level

Direct schema review shows that “one underlying row = one attempt” is not universally true.

Examples already present in the repository include surfaces with explicit retry/dispatch counters such as:

- Builder Workspace `dispatchAttemptCount`;
- QA `qaDispatchAttemptCount`;
- QA repair `repairAttemptCount`;
- commercial activation `preparationAttemptCount`.

By contrast, `builder_gateway_runs` already models attempt identity more explicitly through its own row plus `attemptNumber`.

Therefore a one-to-one envelope↔source-row rule would collapse attempts on some current surfaces.

Frozen design rule:

`ONE_ENVELOPE = ONE_EXACT_CONSEQUENTIAL_ATTEMPT`

not:

`ONE_ENVELOPE = ONE_LOGICAL_JOB_OR_CONTAINER_ROW`.

A logical job/container may legitimately relate to multiple envelopes over time.

## 6. Envelope creation timing

For new governed execution:

`ENVELOPE_CREATED_AND_FROZEN_BEFORE_CONSEQUENTIAL_BOUNDARY = REQUIRED`

The exact envelope identity must exist before:

- provider dispatch;
- customer charge;
- consequential external mutation;
- production release/provider action;
- any other boundary classified consequential under the governing consumer.

This prevents post-hoc identity manufacture.

The source-specific attempt record and envelope relationship must be durable before crossing the external/consequential boundary.

If durable pre-boundary creation cannot be proven, the attempt must fail closed.

## 7. Candidate envelope semantic fields

Names are governed-current candidates, not historical claims.

Minimum identity-only envelope semantics:

- immutable `id`;
- deterministic `fingerprint` or equivalent immutable identity digest;
- execution class / authority class;
- logical execution correlation identity;
- exact attempt identity or attempt ordinal;
- idempotency identity where applicable;
- opportunity/bet/evaluation-cycle context where applicable;
- creation/frozen time;
- governing boundary class or operation class;
- lineage/provenance sufficient to identify the creating execution subsystem;
- legacy provenance classification for migrated records.

The envelope should **not** duplicate mutable provider outcome/state that belongs to R8 or the source execution subsystem.

## 8. R18 attachment relation

R18 attachment becomes:

`Execution Authority Envelope E → exact required binding set {B1...BN}`

through a normalized attachment relation.

Each attachment member must identify:

- envelope ID;
- exact immutable R18 binding snapshot ID;
- exact consumed capability/operation scope;
- attachment role;
- attachment/freeze time;
- provenance.

Arbitrary-N is preserved naturally because the envelope has zero/one/many attachment rows rather than one scalar binding field.

## 9. R18 validation relation

Binding Validation Record references:

- exact envelope;
- exact binding snapshot;
- exact validation policy/version;
- exact validation time/result/provenance.

If one envelope consumes B1...BN, each materially required member must have the exact validation evidence required by its governing operation.

A later validation record cannot replace the envelope's historically consumed validation.

## 10. Relationship to R8

The envelope does not replace R8 external truth.

R8 continues to own:

- whether the provider/external boundary crossed;
- exact provider execution identity/outcome where known;
- uncertain outcome semantics;
- replay/reconciliation restrictions.

The envelope supplies the canonical Money Scout **attempt identity** that R8 truth can be associated with.

Required invariant:

> R8 provider/external truth for an attempt and R18 binding authority for that attempt must converge on the same exact Execution Authority Envelope identity.

An R18 repair may not rewrite R8 truth.

## 11. Relationship to R19

R19 can later freeze/reference:

- the exact Execution Authority Envelope;
- the exact R18 binding set attached to it;
- the exact R17 authority segment composing with those bindings;
- the external/provider truth associated with the same attempt.

This gives ROOT-1 a stable R18 reference target without forcing ROOT-1 to know provider-specific execution-table keys.

## 12. Relationship to future F02-01 / R20 Boundary Decision representation

The envelope is a strong candidate identity anchor for future Boundary Decisions because it represents one exact consequential attempt independent of the source execution subsystem.

However:

`F02-01_ENVELOPE_CONSUMPTION = CANDIDATE / NOT YET FROZEN`

F02-01 must still independently prove operation-specific D1…DN Boundary Decision identity and cannot be collapsed into the envelope.

The envelope identifies the attempt; the Boundary Decision identifies the decision authorizing/denying consumption.

## 13. Existing surface classification candidate

### 13.1 `builder_gateway_runs`

Likely close to one-row-per-provider-attempt.

Candidate direct FK integration is plausible.

Must still verify provider-dispatch/reconciliation invariants before freezing.

### 13.2 `execution_jobs`

A logical orchestration/job object, not automatically an exact provider attempt.

Must not be assumed one-to-one with envelopes.

Some actions may create no consequential attempt; others may create one or several downstream provider attempts.

### 13.3 Builder Workspaces

Current row includes `dispatchAttemptCount`.

Therefore direct one-envelope-per-workspace-row is unsafe if multiple dispatch attempts can occur.

Likely requires exact attempt records/link rows or reuse of another exact provider-attempt object if one already exists.

### 13.4 QA runs

Current row contains separate QA dispatch and repair attempt counters.

One QA row can therefore represent more than one consequential provider attempt.

Requires attempt-level normalization/linkage.

### 13.5 Commercial activation/payment surfaces

Current commercial activation rows have preparation attempt state and provider-operation identity; payment provider events represent provider-originated observations, not necessarily the initiating outbound attempt.

These surfaces require separate inventory before any claim that the envelope mapping is complete.

## 14. Referential-integrity rule

Every authoritative source↔envelope relation must be enforceable by ordinary database constraints.

Accepted:

- source attempt row FK → envelope;
- source-specific bridge with FKs to source row + envelope;
- class-table-inheritance-style child row keyed/FK'd to envelope.

Rejected as sole authority:

- `source_type/source_id` without target FK;
- JSON metadata pointer;
- provider string + run ID reconstructed later;
- query-order inference;
- current/latest job association;
- one table containing many nullable source FKs.

## 15. Retry and successor semantics

A retry that can cross a consequential boundary creates a distinct envelope unless the governing execution contract proves it is the exact same attempt and cannot generate a second external effect.

Default:

`NEW_CONSEQUENTIAL_DISPATCH_ATTEMPT → NEW_ENVELOPE`

The predecessor/successor relationship may be recorded, but identity remains distinct.

This matches R8's no-blind-replay discipline and prevents one envelope from ambiguously representing multiple external attempts.

## 16. Legacy migration

Historical rows lacking a pre-boundary envelope cannot be made fully proven merely by creating one later.

Legacy envelope creation must carry provenance class:

- `LEGACY_EXACTLY_RECONSTRUCTED`;
- `LEGACY_PARTIALLY_RECOVERED`;
- `LEGACY_UNPROVEN`.

Only uniquely proven source-attempt identity may be classified exact.

Creating an envelope after the fact is an indexing/reconciliation aid, not proof that pre-boundary governance existed historically.

## 17. Retention

Execution Authority Envelopes are historical identity infrastructure.

They must remain addressable for at least as long as any surviving:

- R18 binding attachment;
- Binding Validation Record;
- R19 lineage;
- R20 Boundary Decision;
- R8 provider truth;
- financial/audit evidence

depends on them.

Deletion of a source operational row must not orphan authoritative envelope references.

Retention mechanics remain part of F06-04/F01-04/F02-03 and related evidence-policy design rather than being fully resolved here.

## 18. New attack fixtures

### EAE-A1 — source-row retry collapse
One source row dispatches twice. System must produce two exact envelopes, not overwrite/reuse one identity.

### EAE-A2 — post-hoc envelope
Provider boundary crosses before envelope/source-attempt relation is durable. Must fail governance; later envelope creation cannot retroactively cure authority.

### EAE-A3 — polymorphic orphan
A generic `source_type/source_id` points to a nonexistent/deleted row. Such a pointer cannot satisfy authoritative linkage.

### EAE-A4 — wrong source attempt
Envelope E2 from retry attempt 2 is attached to bindings/lineage for attempt 1. Equality must fail.

### EAE-A5 — one logical job / N provider attempts
One orchestration job spawns multiple provider attempts. Each consequential attempt remains independently addressable.

### EAE-A6 — R8/R18 divergence
R8 external truth points to attempt E1 while R18 attachments point to E2. Boundary/lineage composition must fail.

## 19. Remaining inventory requirement

The envelope architecture resolves the canonical-identity **pattern**, but PAIM cannot freeze until the repository-wide consequential execution inventory is complete.

Must identify every current surface that can:

- dispatch to an external provider;
- charge a customer;
- spend external funds;
- mutate production/external state;
- release/deploy;
- perform other consequential operations.

For each surface, classify:

1. logical container;
2. exact attempt object if one exists;
3. retry cardinality;
4. external-boundary transition point;
5. current provider/account persistence;
6. proposed enforceable envelope linkage pattern.

## 20. Adjudication result

`CANONICAL_EXECUTION_ATTACHMENT_OWNER = EXECUTION_AUTHORITY_ENVELOPE`

with the following qualification:

`ENVELOPE_IS_CANONICAL_ATTEMPT_IDENTITY_NOT_POLYMORPHIC_SOURCE_POINTER`

`ONE_ENVELOPE_PER_EXACT_CONSEQUENTIAL_ATTEMPT = REQUIRED`

`PRE_BOUNDARY_DURABLE_CREATION = REQUIRED`

`SOURCE_TO_ENVELOPE_REFERENTIAL_INTEGRITY = REQUIRED`

`R8_OUTCOME_AUTHORITY_REMAINS_SEPARATE = YES`

`ROOT1_MAY_REFERENCE_ENVELOPE/R18_BINDING_MODEL_AFTER_02A_STABILIZES = YES`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = COMPLETE_CONSEQUENTIAL_EXECUTION_SURFACE_INVENTORY_AND_ENVELOPE_LINKAGE_MAP`
