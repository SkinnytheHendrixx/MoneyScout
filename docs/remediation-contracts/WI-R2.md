# WI-R2 — Preserve Capability-Resolution Uncertainty

**Normalized node:** R2  
**Historical finding:** C4-F1  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

This artifact is reconstructed from the WI-R2 adversarial-confirmation conversation record. It is not reconstructed from the compressed v1.0 remediation register and is not a fresh re-derivation from current code.

The recovery source preserves the confirmed R2 migration matrix as:

- R2-M1 — binding/schema
- R2-M2 — selector
- R2-M3 — cost knowledge
- R2-M4 — Architecture Composer
- R2-M5 — Architecture review
- R2-M6 — Factory orchestration/persistence
- R2-M7 — Build Contract
- R2-M8 — Asset Factory UI
- R2-M9 — existing persisted data

This file remains **not `FIDELITY_VERIFIED`** until an independent reviewer compares the committed artifact against the original R2 confirmation exchange, including amendments and compound gates.

## 1. Frozen root and mission

Historical finding **C4-F1 / MATERIAL** established that capability resolution could erase unresolved economic or operational uncertainty by converting an unresolved capability into a convenient concrete implementation choice.

R2 exists to prevent that collapse.

> **Core rule:** choosing a fallback, including custom build, does not make unresolved uncertainty disappear. Capability resolution must preserve what is known, unknown, selected, rejected, and why.

A selected implementation path is not itself proof that the underlying capability, dependency, cost, operational, or economic uncertainty has been resolved.

## 2. Canonical Capability Resolution Outcome

R2 requires a durable, typed **Capability Resolution Outcome** or equivalent authority-neutral result object.

The confirmed outcome must preserve, at minimum:

- capability/problem being resolved;
- resolution outcome/family;
- selected candidate/path, if any;
- alternatives considered where relevant;
- fallback reason;
- source/provenance of the resolution;
- cost knowledge state;
- dependency uncertainty;
- operational uncertainty;
- unresolved constraints/unknowns;
- relevant evidence/references;
- timestamps/versioning sufficient to distinguish later reevaluation.

The exact storage shape is implementation detail. The meanings above are not.

## 3. Cost-knowledge vocabulary

R2 froze the following cost-knowledge states:

- `KNOWN`
- `UNKNOWN`
- `NOT_APPLICABLE`
- `KNOWN_ZERO`

These states must remain semantically distinct.

### 3.1 `UNKNOWN` is not `KNOWN_ZERO`

No quote, estimate, or provider fact means unknown unless authoritative evidence proves otherwise.

### 3.2 `NOT_APPLICABLE` is not zero cost

A capability whose cost concept does not apply is different from one proven to have zero incremental cost.

### 3.3 `KNOWN_ZERO` requires affirmative support

Zero incremental cash cost, included entitlement use, local/no-cost execution, or similar claims require evidence adequate for the exact claim. They may not be inferred from the absence of a charge.

### 3.4 Selection cannot improve cost knowledge by itself

Choosing `CUSTOM_BUILD`, an internal provider, or a fallback implementation cannot turn `UNKNOWN` into `KNOWN_ZERO` or `KNOWN` without separate evidence.

## 4. Uncertainty preservation

R2 must preserve uncertainty across resolution rather than using resolution as an erasure mechanism.

Examples:

- unknown external cost + custom-build selection → external-cost uncertainty remains represented unless the selection truly makes that cost inapplicable;
- unknown dependency availability + fallback selection → original dependency uncertainty remains recorded as provenance/reason even if a different path is chosen;
- operational uncertainty about maintainability/reliability → selection alone does not resolve it;
- provider capability ambiguity → a selector may choose a path but must not silently manufacture stronger capability truth.

> **A decision can choose what to do next while uncertainty about why the decision was necessary remains part of the durable record.**

## 5. Custom build does not erase uncertainty

The original C4-F1 failure included the tendency for a `CUSTOM_BUILD_REQUIRED` or equivalent fallback to appear as though the unresolved question had been answered.

R2 freezes the opposite rule:

> **`UNKNOWN → CUSTOM_BUILD_REQUIRED` is a resolution choice, not an epistemic upgrade.**

The resulting Capability Resolution Outcome must retain:

- what was unknown;
- why custom build was selected;
- what cost/dependency/operational uncertainty remains;
- what future verification is still required.

The Build Contract may consume the selected path, but it may not reinterpret the selection as proof that uncertainty disappeared.

## 6. Lifecycle information is provenance, not selection authority

Capability/provider lifecycle state may explain why a candidate was unavailable, deprecated, retired, degraded, or otherwise not selected.

R2 does not own the execution-time validity of lifecycle-bound capability authority. Lifecycle facts in R2 are **resolution provenance/reasoning inputs**, not perpetual permission to execute.

R6 owns verified capability readiness semantics. R18 owns exact frozen-binding lifecycle revalidation. R20 owns final boundary-time authority fencing.

R2 must not turn a lifecycle observation into an enduring selector override.

## 7. Dependency and operational uncertainty

The outcome must preserve unresolved non-cost uncertainty as first-class state.

At minimum, the implementation must be capable of representing:

- dependency availability unknown;
- dependency suitability unknown;
- implementation feasibility uncertainty;
- operational/maintenance uncertainty;
- provider/access uncertainty;
- cost uncertainty;
- unresolved external prerequisites.

A selected candidate may coexist with any of these states.

## 8. R1 ↔ R2 vocabulary checkpoint

R1 and R2 are related but not interchangeable.

R1 owns truthful resource-state semantics: source, bucket, unit, committed, consumed, provenance, unknown.

R2 owns truthful capability-resolution semantics: selected path, fallback reason, cost knowledge, dependency uncertainty, operational uncertainty, provenance.

Required compatibility:

- R2 cost knowledge must not reinterpret an R1 resource `UNKNOWN` as zero/available;
- R1 resource representation must not force R2 to pretend a capability's cost is known merely because some local bucket exists;
- `KNOWN_ZERO` in R2 must map to semantically truthful resource facts when R7 later consumes the path;
- `UNKNOWN` must remain unknown across the R1→R2→R7 path.

## 9. R2 → R7 safety gate

R2 does not reserve scarce resources. R7 owns that authority.

R2 must provide R7 enough preserved uncertainty to fail closed correctly.

The confirmed compound requirement is:

> **R1×R2×R7 must prove truthful resource semantics + preserved `UNKNOWN` capability/economic uncertainty + fail-closed reservation/admission against materially unknown scarce-resource exposure.**

R7 may not treat “R2 selected a path” as evidence that cost/resource exposure is safe.

## 10. R2 × R11 corrective-ownership boundary

If R2 cannot resolve a material uncertainty sufficiently for safe progression, it must produce a durable blocked/unresolved state that can be owned by R11 rather than silently choosing a convenient path.

R2 determines/preserves the resolution outcome and remaining uncertainty.

R11 owns the corrective successor/disposition when further action is required.

> **Resolution uncertainty can create an owned successor obligation; it cannot self-authorize continuation.**

## 11. R2 × R4 × R11 compound

R2 resolution must remain attached to the exact evaluation/decision lineage that produced it.

If the originating Evaluation Cycle/decision lineage is stale, unknown, or no longer eligible:

- R2 must not bind the resolution to the current cycle merely because one exists;
- R4 preserves exact originating lineage;
- R2 preserves the resolution/uncertainty under that lineage;
- R11 owns any required successor/re-resolution path.

This compound prevents a stale capability-resolution result from being laundered into current authority by rebinding it to current state.

## 12. Known migration matrix

The original R2 confirmation froze the following exact nine migration children. These names/surfaces are normative for artifact fidelity.

### R2-M1 — Capability Resolution binding/schema

Introduce the canonical durable Capability Resolution Outcome/binding representation so selected path, fallback reason, provenance, cost knowledge, and unresolved uncertainty can coexist without collapsing into a single implementation-choice field.

### R2-M2 — Selector

Migrate capability/provider/implementation selection logic so the selector returns/persists the full resolution outcome rather than reducing the result to “selected candidate.” The selector may choose a fallback while preserving uncertainty and rejected/unavailable-path provenance.

### R2-M3 — Cost knowledge

Migrate cost-resolution semantics to the canonical `KNOWN / UNKNOWN / NOT_APPLICABLE / KNOWN_ZERO` vocabulary. Remove any path where selection, missing data, or fallback choice implicitly converts unknown cost into zero or known cost.

### R2-M4 — Architecture Composer

Migrate Architecture Composer consumption of capability-resolution results so architecture generation can use the selected path while preserving unresolved dependency/economic/operational uncertainty in the architecture record and downstream requirements.

### R2-M5 — Architecture review

Migrate architecture review/challenge surfaces so reviewers see and preserve unresolved capability-resolution uncertainty instead of reviewing only the chosen architecture as though all prerequisites were known.

### R2-M6 — Factory orchestration/persistence

Migrate Factory orchestration and persistence so the complete Capability Resolution Outcome survives stage transitions/restarts and is not reconstructed later from whichever provider/implementation currently appears selected.

### R2-M7 — Build Contract

Migrate the Build Contract so it receives the selected implementation path together with the uncertainty/provenance that remains relevant. A Build Contract must not turn `CUSTOM_BUILD_REQUIRED` or another fallback into evidence of resolved cost/dependency/operational uncertainty.

### R2-M8 — Asset Factory UI

Migrate Asset Factory UI/reporting so selected path and certainty state are presented separately. The UI must not make an unresolved/unknown capability appear fully resolved merely because a concrete path was selected.

### R2-M9 — Existing persisted data

Migrate existing persisted capability-resolution data. Legacy rows whose cost knowledge, fallback reason, provenance, dependency uncertainty, or operational uncertainty cannot be reconstructed from durable evidence must retain explicit legacy/unknown state rather than being backfilled from current configuration or selected implementation.

## 13. Iterative sibling-sweep discipline

R2 is an umbrella migration.

Required loop:

**canonical outcome primitive → R2-M1…M9 → known-site tests → semantic sibling sweep → new durable child for each discovered defect → repair → repeat → independent review**.

The sweep must search for any surface that:

- converts capability resolution to a single selected string/enum;
- defaults unknown cost to zero;
- treats custom build as certainty;
- reconstructs resolution from current provider/configuration;
- drops fallback reason or provenance;
- drops dependency/operational uncertainty;
- renders selected path as “resolved” when material unknowns remain;
- feeds R7 with optimistic cost/resource assumptions.

Every discovered defect becomes R2-M10+ (or next durable child). `AUDITED` is not `FIXED`.

## 14. Design Inputs

**Registry basis:** Convergence Protocol v1.1 Design Input mechanism; R2 confirmation reviewed the registry through DI-2.

### DI-1 — provider/account identity plurality

**Disposition:** REVIEWED / NOT ACTIVATED GENERICALLY.

R2 may record a provider/candidate in provenance, but generic capability-resolution uncertainty does not itself activate simultaneous provider/account identity authority. If a concrete R2 migration demonstrates provider/account plurality with authority implications, that exact scope must be activated separately.

### DI-2 — autonomous outbound payment reversal execution

**Disposition:** REVIEWED / NOT ACTIVATED.

R2 selects/preserves capability-resolution paths and uncertainty; it does not itself execute refunds, voids, cancellations, or reversals. Any implementation child that introduces such an action activates DI-2 independently.

Neither DI is consumed merely because R2 can represent related metadata.

## 15. Acceptance fixtures

### A. Unknown cost survives selection

Input: candidate cost cannot be established.

Selector chooses a concrete path.

Expected: cost knowledge remains `UNKNOWN` unless separate evidence legitimately changes it.

### B. Known zero is affirmative

Input: authoritative evidence proves zero incremental cash cost for the exact path.

Expected: `KNOWN_ZERO`, distinct from `UNKNOWN` and `NOT_APPLICABLE`.

### C. Not applicable is distinct

Input: a cost concept does not apply to the selected capability/path.

Expected: `NOT_APPLICABLE`; do not serialize/render it as zero cost.

### D. Custom build preserves uncertainty

Input: external capability cannot be established and selector chooses `CUSTOM_BUILD_REQUIRED`.

Expected: original unknown/dependency reason persists; custom build selection does not produce a false fully-resolved state.

### E. Dependency uncertainty survives architecture composition

A selected path still has an unresolved prerequisite/dependency.

Expected: Architecture Composer/Build Contract preserve the unresolved dependency rather than silently treating the architecture as execution-ready.

### F. Operational uncertainty survives selection

A path is technically selectable but maintenance/reliability/operational suitability remains unknown.

Expected: selected path + operational uncertainty coexist.

### G. Persist/reload idempotency

Persist a Capability Resolution Outcome containing unknown cost and unresolved dependency/operational fields; reload/retry/reconcile it.

Expected: certainty does not improve merely through persistence, restart, or repeated resolution reads.

### H. Existing-data migration

Legacy resolution row records selected path but lacks reliable cost/provenance/uncertainty data.

Expected: migrated row carries explicit legacy/unknown state; current provider/configuration is not used to invent historical certainty.

### I. UI distinction

Selected fallback exists but material uncertainty remains.

Expected: Asset Factory UI shows selected path separately from certainty/unknown state rather than presenting “resolved.”

### J. R2→R7 fail-closed case

R2 emits a selected path with materially `UNKNOWN` cost/resource exposure.

Expected: R7 cannot reserve/dispatch using an optimistic zero/default interpretation.

### K. R2×R11 unresolved ownership

R2 reaches a state where no candidate can be safely selected without resolving material uncertainty.

Expected: unresolved state is durably owned through R11 successor/disposition; R2 does not self-authorize continuation.

### L. R2×R4×R11 stale-lineage case

Capability resolution belongs to originating cycle C1; current system cycle becomes C2 before the unresolved result is acted on.

Expected: resolution remains bound to C1; no rebinding to C2; successor/re-resolution is owned rather than laundering old resolution into current authority.

## 16. Vocabulary checkpoints

- `selected` ≠ `resolved`.
- `fallback chosen` ≠ `uncertainty eliminated`.
- `CUSTOM_BUILD_REQUIRED` ≠ proof of feasibility/cost certainty.
- `UNKNOWN` ≠ `KNOWN_ZERO`.
- `NOT_APPLICABLE` ≠ `KNOWN_ZERO`.
- lifecycle fact ≠ execution authority.
- capability resolution (R2) ≠ capability verification authority (R6).
- capability resolution (R2) ≠ resource reservation/admission (R7).
- unresolved resolution state ≠ Human by default; R11 owns governed disposition.

## 17. Parallel-not-merged boundaries

### R2 vs R1

R1 defines resource facts; R2 defines capability-resolution facts. R2 consumes R1-compatible semantics but does not replace them.

### R2 vs R6

R2 records selection/fallback and uncertainty. R6 determines whether a capability claim is sufficiently verified for authority.

### R2 vs R7

R2 preserves cost/resource uncertainty; R7 performs atomic scarce-resource reservation/admission.

### R2 vs R11

R2 can produce unresolved/blocked outcomes. R11 owns executable corrective successors.

### R2 vs R18/R20

R2 may record lifecycle/provider provenance relevant to why a path was selected, but it does not own exact binding revalidation (R18) or final boundary-time authority (R20).

## 18. Dependency classes

### START

R2 may begin once the canonical R1 vocabulary it consumes is stable enough for implementation compatibility. R1 and R2 can proceed substantially in parallel; R2 does not require R1 global closure merely to start.

### LOCAL CLOSURE

R2 local closure requires:

- Capability Resolution Outcome implemented and durable;
- canonical cost-knowledge vocabulary implemented;
- R2-M1 through R2-M9 repaired and verified;
- R2-M10+ sibling defects closed;
- Architecture Composer/review, Build Contract, orchestration/persistence, UI, and legacy-data migrations complete;
- selected/fallback paths demonstrably preserve unresolved uncertainty;
- iterative sibling sweep empty;
- independent material closure review.

R7/R11/R4 need not be globally CLOSED merely for R2 local closure, but R2 must expose implementation-compatible interfaces for the compound gates.

### E2E CERTIFICATION

Requires at minimum:

- R1×R2×R7;
- R2×R11;
- R2×R4×R11.

## 19. Closure evidence required

`WI-R2 = CLOSED` requires evidence including:

1. implementation commit SHA;
2. schema/migration SHA where distinct;
3. exact traceability to `C4-F1 / MATERIAL`;
4. durable Capability Resolution Outcome PASS;
5. selected path and fallback reason preservation PASS;
6. provenance preservation PASS;
7. `KNOWN` cost semantics PASS;
8. `UNKNOWN` cost semantics PASS;
9. `NOT_APPLICABLE` cost semantics PASS;
10. `KNOWN_ZERO` cost semantics PASS;
11. `UNKNOWN ≠ KNOWN_ZERO` fixture PASS;
12. `NOT_APPLICABLE ≠ KNOWN_ZERO` fixture PASS;
13. custom-build uncertainty-preservation fixture PASS;
14. dependency-uncertainty preservation PASS;
15. operational-uncertainty preservation PASS;
16. persistence/reload certainty-non-improvement PASS;
17. R2-M1 Capability Resolution binding/schema PASS;
18. R2-M2 selector PASS;
19. R2-M3 cost knowledge PASS;
20. R2-M4 Architecture Composer PASS;
21. R2-M5 Architecture review PASS;
22. R2-M6 Factory orchestration/persistence PASS;
23. R2-M7 Build Contract PASS;
24. R2-M8 Asset Factory UI PASS;
25. R2-M9 existing persisted data PASS;
26. every R2-M10+ child CLOSED;
27. final semantic sibling sweep empty;
28. R1↔R2 vocabulary compatibility PASS;
29. R1×R2×R7 compound PASS for E2E status;
30. R2×R11 compound PASS;
31. R2×R4×R11 stale-lineage compound PASS;
32. DI registry reviewed through DI-2 with scope-correct disposition;
33. DI-1 not implicitly activated/consumed by generic provider/candidate provenance;
34. DI-2 not activated unless an implementation child genuinely introduces reversal execution;
35. materially independent cross-model/provider confirmation.

## 20. Anti-cheat closure rule

The following does **not** close R2:

1. add a `selectedProvider` or `selectedImplementation` field;
2. add `cost=0` when no cost is known;
3. convert unresolved external capability to `CUSTOM_BUILD_REQUIRED`;
4. let Architecture/Build consume only the selected path;
5. declare capability resolution complete.

That implementation reproduces C4-F1 because it turns a concrete choice into false certainty.

> **A capability-resolution system is not semantically correct if making a choice causes unresolved uncertainty to disappear from the durable record.**

## 21. Fidelity-review checklist

Before marking this artifact `FIDELITY_VERIFIED`, compare it line-by-line against the original R2 confirmation sequence and specifically verify:

- exact R2-M1 through R2-M9 labels/surface assignments;
- exact Capability Resolution Outcome field obligations;
- exact cost-knowledge vocabulary and semantics;
- custom-build uncertainty-preservation rule;
- lifecycle-as-provenance-only boundary;
- R1↔R2 vocabulary checkpoint;
- R1×R2×R7 gate;
- R2×R11 and R2×R4×R11 compound requirements;
- DI-1/DI-2 dispositions;
- every acceptance fixture and closure-evidence item;
- no invented migration surface or new authority beyond what was confirmed.

Until that independent comparison passes, this artifact remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.
