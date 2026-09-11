# WI-R1 — Semantic Resource State Before Safety Checks

**Normalized node:** R1  
**Historical finding:** C3-F2  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** RECOVERED CANDIDATE / AMENDED AFTER FAILED FIDELITY REVIEW / PENDING RE-VERIFICATION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

This artifact is reconstructed from the R1 adversarial-confirmation record preserved in the Money Scout conversation, not from the compressed v1.0 remediation matrix as normative authority. The v1.0 matrix was consulted only as a secondary consistency check after the recovery content was assembled.

The first committed recovery candidate failed adversarial fidelity verification. That review found substantial drift in the migration matrix and acceptance fixtures: most R1-M1 through R1-M8 children had been reassigned to invented or incorrectly generalized surfaces; the confirmed Bet reconciliation worker, Bet proposal/allocation validation, Controlled Release, Asset Operations/remediation, and existing-data migration children had been lost or renamed; QA/commercial/shared-pool children had been invented; and the acceptance fixtures omitted the confirmed exhaustion-correctness assertion and the frozen numeric commitment example. This amended version preserves that failure in Git history rather than rewriting it away.

This file is **not `FIDELITY_VERIFIED`** until an independent reviewer compares this amended artifact against the original R1 conversation sequence and confirms that every confirmed obligation, migration, acceptance fixture, Design Input disposition, and closure requirement is present without scope drift.

## 1. Frozen root and mission

Historical finding **C3-F2 / MATERIAL** established that resource state was semantically wrong before later Money Safety checks consumed it.

R1 exists to make resource attribution truthful before any later authority/reservation primitive reasons over it.

> **Core rule:** `UNKNOWN` is neither zero nor “every resource bucket.” Resource state must identify what resource is being discussed, in what unit, under what source/bucket attribution, and what is actually committed versus consumed.

R1 defines resource semantics. It does **not** create reservation authority; R7 owns atomic scarce-resource reservation and admission.

## 2. Canonical Resource Attribution primitive

The confirmed primitive is typed and preserves, at minimum, the semantic chain:

`source → bucket → unit → committed → consumed → timestamp/provenance`

A concrete implementation may normalize field names, but may not collapse any of those meanings.

At minimum, a resource attribution value must be able to answer:

- what resource/source is being measured;
- which bucket/scope the value belongs to;
- what unit is authoritative for the value;
- what amount is committed;
- what amount is consumed;
- whether either amount is known, unknown, not applicable, or otherwise explicitly typed;
- when the fact was observed/effective;
- where it came from and how it was derived.

## 3. Semantic invariants

### 3.1 UNKNOWN is not zero

Missing/unavailable resource evidence must remain `UNKNOWN` (or an equivalent typed unknown state). It may not silently become numeric zero.

A genuine source-reported zero remains distinguishable from missing data.

### 3.2 UNKNOWN is not every bucket

If the system does not know which bucket/source a resource value belongs to, it may not fan that value out across all possible buckets or treat every bucket as consumed.

Unknown attribution must remain explicitly unresolved.

### 3.3 Unit identity is mandatory

Values with different units are not interchangeable simply because both are numbers. Cash cents, provider credits, entitlement units, request quotas, concurrency slots, and other scarce resources require explicit unit identity.

### 3.4 Committed is not consumed

`committed` and `consumed` are separate facts.

A provider-enforced ceiling, maximum possible charge, reservation, or commitment may exceed eventual consumption. That difference must remain visible rather than being flattened into one number.

### 3.5 Unused commitment does not manufacture headroom

The confirmed R1 rule is:

> **Additional headroom cannot increase merely because a committed ceiling has not yet been observed as consumed.**

Until later R7/R8/R15/R16 semantics prove release or authoritative lower exposure, R1 must not let “not yet consumed” masquerade as free capacity.

### 3.6 Provenance is part of meaning

A numeric value without its source/provenance is insufficient where the source determines whether the value is authoritative, estimated, inferred, stale, or merely a local projection.

## 4. R1 does not own reservation authority

R1 is deliberately upstream of R7.

R1 answers:

> What resource fact is actually represented here?

R7 answers:

> May scarce capacity be atomically reserved/committed across all relevant aggregate scopes?

Therefore:

- R1 must not introduce local “safe to spend/use” booleans;
- R1 must not authorize dispatch;
- R1 must not treat a truthful resource observation as permission to consume that resource;
- R7 must consume R1 semantics without reinterpretation.

## 5. R1 → R7 compatibility gate

The compatibility gate frozen during confirmation is not satisfied merely because R7 can read an R1-shaped object.

R1→R7 certification must prove all of the following together:

1. R1 truthfully distinguishes source/bucket/unit/committed/consumed/provenance.
2. `UNKNOWN` remains unknown through the R7 admission path; it is not normalized to zero or a permissive default.
3. R7 fails closed against materially unknown scarce-resource state rather than manufacturing headroom.
4. R7 does not reinterpret an R1 commitment as consumption, or consumption as a released commitment.
5. A committed ceiling that has not yet been fully consumed cannot increase available headroom until later authoritative release/reconciliation permits it.
6. Resource semantics remain stable across all R1-migrated surfaces consumed by R7.

This gate later composes with the explicit **R1×R2×R7** certification: truthful resource semantics + preserved unresolved economic/operational uncertainty + fail-closed atomic reservation.

## 6. Known migration matrix

The original R1 confirmation froze the following exact nine migration children. These names and surface assignments are normative for fidelity recovery and must not be generalized into different children.

### R1-M1 — Bet schema

Migrate the Bet persistence/schema surface to carry the canonical typed resource-attribution semantics needed by downstream safety logic, including source/bucket/unit, committed/consumed distinction, temporal/provenance data, and explicit unknown handling.

### R1-M2 — Bet kernel

Migrate Bet-kernel resource calculations and state transitions so they consume and preserve the typed semantics rather than ambiguous numeric fields or local arithmetic assumptions.

### R1-M3 — Bet reconciliation worker

Migrate the Bet reconciliation worker that persists/updates resource attributions so reconciliation cannot collapse source/bucket identity, confuse committed with consumed, convert unknown to zero, or create optimistic remaining capacity.

### R1-M4 — Bet proposal/allocation validation

Migrate the proposal/allocation validation path that initializes or validates Bet resource buckets so the correct source/bucket/unit semantics exist before later commitments or consumption are recorded.

### R1-M5 — Build/Builder attribution

Migrate Build/Builder resource attribution to the canonical semantics, preserving provider/source identity and commitments separately from observed consumption.

### R1-M6 — Controlled Release attribution

Migrate Controlled Release attribution for preview/production resource use so release resource facts preserve exact source/bucket/unit and committed/consumed semantics for later safety checks.

### R1-M7 — Asset Operations/remediation attribution

Migrate Asset Operations and remediation resource attribution so autonomous maintenance/repair work uses the same semantic model and cannot inherit or create ambiguous bucket/commitment state.

### R1-M8 — Existing-data migration

Migrate legacy pre-R1 attribution rows into the new semantic representation without fabricating facts that were never recorded. Historical rows whose source/bucket/unit/commitment/consumption cannot be proven must preserve explicit unknown/legacy uncertainty rather than being backfilled from current state or convenient defaults.

### R1-M9 — Bets dashboard/reporting presentation

Migrate the Bets dashboard/reporting presentation that consumes `committed`, `consumed`, and `remaining` directly so operators can distinguish:

- committed vs consumed;
- known zero vs unknown;
- source/bucket identity;
- units;
- unresolved/legacy attribution where applicable.

The dashboard must not display unknown resource state as `0`, “unused,” “remaining,” or otherwise imply additional headroom that the underlying facts do not prove.

## 7. Iterative sibling-sweep discipline

R1 is an umbrella migration, not a one-shot schema task.

The required closure loop is:

**shared primitive → named R1-M1…M9 migrations → known-site tests → semantic sibling sweep → new child migration for every discovered defect → repair → repeat sweep → independent review**.

A sibling sweep is semantic, not filename-based. It must search for every surface that:

- stores or derives scarce-resource values;
- compares committed/consumed/remaining values;
- defaults missing numeric resource data;
- maps one provider/resource value into local buckets;
- exposes resource state through API/UI/reporting;
- feeds later R7 admission/headroom logic.

`AUDITED` is not `FIXED`. Any new defect becomes `R1-M10+` (or the next available durable child ID) and must be closed before R1 local closure.

A later sweep that finds another concrete instance proves the umbrella remains open; it must not be dismissed as a duplicate merely because the root cause is already known.

## 8. Design Inputs

**Design Input mechanism / registry basis:** Convergence Protocol v1.1 Design Input mechanism (§5A/§5B); R1 review checked the registry through **DI-2**.

### DI-1 — capability/provider/account identity under plurality

**R1 disposition:** REVIEWED / NOT ACTIVATED GENERICALLY.

R1 resource semantics may carry source/provider/bucket identity, but R1 by itself does not introduce or resolve simultaneous provider/account substitution authority. If a concrete R1 migration exposes multiple provider/account identities in one scope, that exact DI-1 scope must be activated/consumed by the work item that owns that identity problem; R1 does not globally mark DI-1 resolved.

### DI-2 — autonomous outbound payment reversal execution

**R1 disposition:** REVIEWED / NOT ACTIVATED.

R1 may represent resource/economic observations associated with reversals, but it does not execute refunds, voids, cancellations, reversals, or other outbound monetary actions. If an implementation child introduces such execution, DI-2 activates independently before that path may run.

No Design Input may be silently marked consumed simply because its fields are representable in the R1 schema.

## 9. Acceptance fixtures

The original R1 confirmation froze five test categories. Recovery must preserve both the categories and the concrete assertions inside them.

### A. Resource classification

Required assertions include:

- genuine provider/source-reported zero remains distinguishable from missing/unreported data;
- missing/unreported resource state remains `UNKNOWN`, not zero;
- unknown bucket/source attribution remains unresolved rather than being copied into every candidate bucket or assigned to a convenient one;
- unit identity is preserved and numerically equal values in different units are not treated as interchangeable capacity.

### B. Commitment semantics

Required assertions include:

- committed and consumed remain distinct;
- a provider maximum/commitment may exceed eventual observed consumption without being rewritten to equal consumption;
- **frozen numeric case:** allocation = 100, commitment = 100, consumption = 10 **cannot report 90 as new commitment authority** merely because only 10 has been consumed;
- no unconsumed portion of a commitment becomes headroom until authoritative release/reconciliation owned elsewhere proves it.

### C. Exhaustion correctness

Required assertions include:

- exhaustion is reported against the source/bucket actually attributed;
- **BUILD exhaustion must not falsely report `PROVIDER_SERVICES` exhaustion unless that source was actually attributed there**;
- unknown attribution cannot be converted into a confident exhaustion label for a different bucket/source;
- later R7 safety logic receives the same truthful source/bucket semantics rather than a reclassified exhaustion state.

### D. Persistence / idempotency

Required assertions include:

- persistence and repeated reconciliation preserve the same source/bucket/unit semantics;
- replay/retry of the same observation does not duplicate consumption or commitment;
- API/read-model/reporting round trips do not flatten `UNKNOWN`, source identity, unit identity, or committed/consumed distinction;
- repeated reconciliation cannot progressively drift one attribution into another bucket merely because current state differs.

### E. Migration

Required assertions include:

- legacy pre-R1 rows are migrated by R1-M8 without inventing missing source/bucket/unit/commitment/consumption facts;
- historical rows with unprovable semantics remain explicitly unknown/legacy rather than being backfilled from current state;
- Bets dashboard/reporting correctly distinguishes migrated unknown/legacy values from known zero and from available headroom;
- every R1-M1 through R1-M9 surface passes the new semantic model after migration.

## 10. Vocabulary checkpoints

- `UNKNOWN` ≠ `0`.
- `UNKNOWN attribution` ≠ “all buckets.”
- `committed` ≠ `consumed`.
- `committed - consumed` ≠ automatically released/free.
- `observation` ≠ `authority`.
- `resource semantics` (R1) ≠ `atomic reservation/admission` (R7).
- `unit` is part of value identity, not presentation metadata.
- `current projection` must not overwrite historical/provenance-bearing resource truth.

## 11. Parallel-not-merged boundaries

### R1 vs R7

R1 defines truthful resource state; R7 atomically reserves scarce resources and enforces aggregate authority.

### R1 vs R2

R1 preserves resource semantics; R2 preserves unresolved economic/operational uncertainty through capability resolution. They compose but neither substitutes for the other.

### R1 vs R15/R16

R1's generic resource-attribution semantics do not replace provider-financial raw evidence capture (R15) or deterministic financial reconciliation (R16).

### R1 vs Fund authority

Resource facts do not define `deployable_capital` or create spend authority. The canonical Fund model remains authoritative for capital availability.

## 12. Dependency classes

### START

R1 may begin independently once the relevant live schema/resource surfaces are available for migration. It does not require R7 implementation merely to start semantic correction.

### LOCAL CLOSURE

R1 local closure requires:

- canonical typed resource semantics implemented;
- R1-M1 through R1-M9 repaired and verified;
- all R1-M10+ sibling defects closed;
- Bets dashboard/reporting semantics migrated;
- persistence/read-model/reporting round-trip preservation;
- iterative sibling sweep empty;
- independent material closure review.

R7 need not be globally CLOSED merely for R1 to close locally; R1 must expose an implementation-compatible semantic interface that R7 can consume without reinterpretation.

### E2E CERTIFICATION

Requires the **R1×R2×R7** compound gate and any later full-Fund/Factory scenario that depends on truthful resource semantics.

## 13. Closure evidence required

`WI-R1 = CLOSED` requires all of the following evidence, not merely existence of the primitive:

1. implementation commit SHA;
2. schema/migration commit SHA where distinct;
3. exact traceability to `C3-F2 / MATERIAL`;
4. canonical typed Resource Attribution primitive implemented;
5. source identity preservation PASS;
6. bucket identity/unresolved-attribution semantics PASS;
7. unit identity PASS;
8. committed-vs-consumed distinction PASS;
9. timestamp/temporal provenance PASS;
10. provenance/source-of-truth preservation PASS;
11. known-zero-vs-UNKNOWN classification PASS;
12. UNKNOWN-not-every-bucket classification PASS;
13. frozen numeric commitment fixture `allocation=100 / commitment=100 / consumption=10` PASS, including proof that 90 is not treated as new commitment authority;
14. exhaustion-correctness fixture PASS, including proof that BUILD exhaustion does not falsely report `PROVIDER_SERVICES` exhaustion absent that attribution;
15. persistence/idempotency fixture PASS;
16. migration/legacy-data fixture PASS;
17. R1-M1 Bet schema PASS;
18. R1-M2 Bet kernel PASS;
19. R1-M3 Bet reconciliation worker PASS;
20. R1-M4 Bet proposal/allocation validation PASS;
21. R1-M5 Build/Builder attribution PASS;
22. R1-M6 Controlled Release attribution PASS;
23. R1-M7 Asset Operations/remediation attribution PASS;
24. R1-M8 Existing-data migration PASS;
25. R1-M9 Bets dashboard/reporting presentation PASS;
26. persistence/API/read-model/reporting semantic round-trip PASS;
27. sibling-sweep evidence identifying every inspected resource consumer;
28. every discovered R1-M10+ child CLOSED;
29. final repeated sibling sweep finds no unresolved concrete R1 instance;
30. R1→R7 compatibility gate PASS;
31. R1×R2×R7 compound certification PASS for E2E status;
32. DI registry reviewed through DI-2 with scope-correct dispositions recorded;
33. DI-1 not implicitly activated/consumed by generic resource representation;
34. DI-2 non-activation evidence unless an implementation child genuinely introduces reversal execution;
35. independent cross-model/provider confirmation of material closure.

## 14. Anti-cheat closure rule

The following implementation does **not** close R1:

1. add a generic typed resource object;
2. update the Bet kernel but leave the reconciliation worker or proposal/allocation initialization on old semantics;
3. migrate new rows but leave legacy pre-R1 attribution rows ambiguous;
4. update safety logic but leave Controlled Release, Asset Operations/remediation, Build/Builder, or dashboard/reporting consumers on old semantics;
5. declare the primitive complete.

R1 closes only when the semantic model is propagated through every confirmed migration and the iterative semantic sibling sweep no longer demonstrates the original `C3-F2` failure shape.

> **Primitive existence is not closure, and resource truth cannot be repaired downstream after an unsafe semantic interpretation has already been made.**

## 15. Fidelity-review checklist for this amended recovered artifact

Before changing this artifact to `FIDELITY_VERIFIED`, the reviewer must compare it line-by-line against the original R1 confirmation exchange and specifically verify:

- the exact R1-M1 through R1-M9 labels and scope assignments now match the frozen list:
  - M1 Bet schema;
  - M2 Bet kernel;
  - M3 Bet reconciliation worker;
  - M4 Bet proposal/allocation validation;
  - M5 Build/Builder attribution;
  - M6 Controlled Release attribution;
  - M7 Asset Operations/remediation attribution;
  - M8 Existing-data migration;
  - M9 Bets dashboard/reporting presentation;
- no invented QA/commercial/shared-pool migration children remain;
- the iterative sibling-sweep rule and child-numbering behavior are preserved;
- the exact Design Input registry/version wording and DI-1/DI-2 dispositions are preserved;
- the R1→R7 compatibility gate wording and all required subtests remain correct;
- the five frozen acceptance-test categories are present;
- the BUILD-vs-`PROVIDER_SERVICES` exhaustion assertion is present;
- the frozen `100 / 100 / 10` commitment example is present;
- the complete closure-evidence list corresponds to actual confirmed requirements rather than plausible reconstruction;
- no content is imported from the compressed v1.0 matrix as if it were original authority;
- no reconstructed wording narrows or expands the confirmed root.

Until that review passes, this file remains **RECOVERED CANDIDATE / AMENDED AFTER FAILED FIDELITY REVIEW / PENDING RE-VERIFICATION**.
