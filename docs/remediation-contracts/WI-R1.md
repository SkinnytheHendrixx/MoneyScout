# WI-R1 — Semantic Resource State Before Safety Checks

**Normalized node:** R1  
**Historical finding:** C3-F2  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

This artifact is reconstructed from the R1 adversarial-confirmation record preserved in the Money Scout conversation, not from the compressed v1.0 remediation matrix as normative authority. The v1.0 matrix was consulted only as a secondary consistency check after the recovery content was assembled.

This file is **not `FIDELITY_VERIFIED`** until an independent reviewer compares it against the original R1 conversation sequence and confirms that every confirmed obligation, migration, acceptance fixture, Design Input disposition, and closure requirement is present without scope drift.

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

The original R1 review froze **R1-M1 through R1-M9** as known migration obligations. Recovery preserves the nine-child structure so none can be collapsed into a generic “resource primitive implemented” claim.

> **Fidelity warning:** the independent review of this recovered artifact must compare the child labels/surface assignments below against the original R1 confirmation transcript. If any label or surface mapping differs, that is artifact drift and must be corrected before `FIDELITY_VERIFIED`.

### R1-M1 — Canonical typed resource-attribution schema

Introduce the shared typed representation carrying source, bucket, unit, committed, consumed, temporal/provenance, and explicit unknown semantics.

### R1-M2 — Bet-kernel resource-state migration

Migrate Bet-level resource/exposure state so later safety checks consume typed semantic resource facts rather than ambiguous numeric fields or local arithmetic assumptions.

### R1-M3 — Build / Builder resource-state migration

Migrate Builder/Build resource observations and provider-consumption fields to the canonical semantics, preserving provider ceilings/commitments separately from observed consumption.

### R1-M4 — QA / review resource-state migration

Migrate QA/review resource consumers so entitlement/quota/cash/concurrency facts retain exact unit, source/bucket, and unknown semantics rather than inheriting a generic zero/default model.

### R1-M5 — Release / deployment resource-state migration

Migrate preview/production release resource surfaces to the canonical representation, including provider/resource attribution needed by later R7/R8 safety.

### R1-M6 — Commercial / external-provider resource-state migration

Migrate consequential provider/resource consumers outside Build/QA/Release that currently expose ambiguous committed/consumed or source/bucket semantics.

### R1-M7 — Shared / portfolio / provider-pool resource-state migration

Ensure shared-provider, entitlement-pool, portfolio, and other non-Bet-local resource values use the same semantic model and do not silently collapse unknown attribution into a local bucket.

### R1-M8 — API/read-model/resource-consumer migration

Migrate API serialization, derived read models, and non-UI consumers so the canonical semantics survive transmission. No consumer may turn typed unknown into zero or discard unit/source/provenance needed by safety logic.

### R1-M9 — Bets dashboard / UI migration

Update the Bets dashboard and related resource UI so operators can distinguish:

- committed vs consumed;
- known zero vs unknown;
- source/bucket identity;
- units;
- provenance/observation status where needed.

The dashboard must not display unknown resource state as `0`, “unused,” or otherwise imply additional headroom that the underlying facts do not prove.

## 7. Iterative sibling-sweep discipline

R1 is an umbrella migration, not a one-shot schema task.

The required closure loop is:

**shared primitive → named R1-M1…M9 migrations → known-site tests → semantic sibling sweep → new child migration for every discovered defect → repair → repeat sweep → independent review**.

A sibling sweep is semantic, not filename-based. It must search for every surface that:

- stores or derives scarce-resource values;
- compares committed/consumed/remaining values;
- defaults missing numeric resource data;
- maps one provider/resource value into local buckets;
- exposes resource state through API/UI;
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

At minimum, R1 must preserve the following confirmed failure distinctions.

### A. Genuine zero vs missing

Source reports `0` for a resource value in case A and omits/unreports the value in case B.

Expected: A = known zero; B = `UNKNOWN`. They must not serialize or render identically.

### B. Unknown bucket

A value is known but its exact bucket/source attribution is not.

Expected: attribution remains unresolved; value is not copied into every candidate bucket and is not assigned to a convenient local bucket.

### C. Unit mismatch

Two resource facts have numerically identical values but different units.

Expected: they are not combined or compared as equivalent capacity without an explicit canonical conversion rule owned elsewhere.

### D. Commitment exceeds eventual consumption

Provider maximum/commitment = 500 units; current observed consumption = 300.

Expected: both facts remain visible. R1 does not rewrite commitment to 300 merely because consumption is lower.

### E. No optimistic headroom from incomplete consumption

Commitment = 500; consumption currently observed = 300; no authoritative release exists.

Expected: downstream headroom may not increase by 200 merely from the difference.

### F. Provenance distinction

Same numeric value arrives from an authoritative provider observation and from a local estimate.

Expected: provenance remains distinct and later safety logic can tell them apart.

### G. API preservation

Typed unknown/source/unit/commitment/consumption passes through persistence/API/read-model round trip.

Expected: no semantic field is flattened, defaulted, or lost.

### H. Bets-dashboard rendering

Known zero, unknown, committed, consumed, and unresolved attribution are rendered distinctly.

Expected: UI never turns unknown into apparent zero/available headroom.

### I. R1→R7 fail-closed compatibility

R7 receives materially unknown resource state from an R1-migrated surface.

Expected: R7 does not authorize new scarce-resource consumption using an optimistic interpretation.

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
- Bets dashboard/UI semantics migrated;
- API/read-model round-trip preservation;
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
11. known-zero-vs-UNKNOWN fixture PASS;
12. UNKNOWN-not-every-bucket fixture PASS;
13. no optimistic headroom from unconsumed commitment PASS;
14. R1-M1 PASS;
15. R1-M2 PASS;
16. R1-M3 PASS;
17. R1-M4 PASS;
18. R1-M5 PASS;
19. R1-M6 PASS;
20. R1-M7 PASS;
21. R1-M8 PASS;
22. R1-M9 Bets-dashboard/UI migration PASS;
23. API/read-model semantic round-trip PASS;
24. sibling-sweep evidence identifying every inspected resource consumer;
25. every discovered R1-M10+ child CLOSED;
26. final repeated sibling sweep finds no unresolved concrete R1 instance;
27. R1→R7 compatibility gate PASS;
28. R1×R2×R7 compound certification PASS for E2E status;
29. DI registry reviewed through DI-2 with scope-correct dispositions recorded;
30. DI-1 not implicitly activated/consumed by generic resource representation;
31. DI-2 non-activation evidence unless an implementation child genuinely introduces reversal execution;
32. independent cross-model/provider confirmation of material closure.

## 14. Anti-cheat closure rule

The following implementation does **not** close R1:

1. add a generic `resource` object;
2. keep old ambiguous numbers in existing workers;
3. update one safety check to read the new object;
4. leave UI/read models/default-zero paths unchanged;
5. declare the primitive complete.

R1 closes only when the semantic model is propagated through every known migration and the iterative semantic sibling sweep no longer demonstrates the original `C3-F2` failure shape.

> **Primitive existence is not closure, and resource truth cannot be repaired downstream after an unsafe semantic interpretation has already been made.**

## 15. Fidelity-review checklist for this recovered artifact

Before changing this artifact to `FIDELITY_VERIFIED`, the reviewer must compare it line-by-line against the original R1 confirmation exchange and specifically verify:

- the exact R1-M1 through R1-M9 labels and scope assignments;
- the Bets-dashboard addition in R1-M9;
- the iterative sibling-sweep rule and child-numbering behavior;
- the exact Design Input registry/version wording and DI-1/DI-2 dispositions;
- the R1→R7 compatibility gate wording and all required subtests;
- every acceptance fixture;
- the complete closure-evidence list;
- that no content was imported from the compressed v1.0 matrix as if it were original authority;
- that no reconstructed wording narrows or expands the confirmed root.

Until that review passes, this file remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.
