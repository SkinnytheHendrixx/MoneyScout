# Money Scout — Global Remediation & Invalidation Plan — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Stage:** Post-Phase-J remediation planning  
**Implementation authority:** SUSPENDED  
**Governing global audit:** `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md`

## 1. Purpose

Phases C–J were discovery/certification phases. This artifact begins a different class of work: converting the now-known defects, unresolved items, source gaps, and governance failures into the **minimum coherent amendment sets** needed to produce a corrected candidate authority corpus.

The objective is not to fix findings one-by-one in isolation.

The objective is to answer, for every proposed amendment:

1. **What exact finding(s) does this amendment close?**
2. **What exact contracts/schema/code/governance artifacts must change together for the fix to be coherent?**
3. **What previously certified results become stale the moment those artifacts change?**
4. **What new cross-node contradiction could the amendment itself introduce?**
5. **What rechecks must pass before the finding may move from `AMENDED_PENDING_RECHECK` to `CLOSED`?**

No amendment restores implementation authority by itself. The global sequence remains:

`REMEDIATE / AMEND → INVALIDATE → RECHECK → FINAL FULL PHASE-C SWEEP → CORRECTED REGISTER → INDEPENDENT T4 → POSSIBLE AUTHORITY RESTORATION`.

## 2. Governing remediation principle — minimum coherent amendment set

A remediation unit is not defined by “one finding = one patch.”

A **Minimum Coherent Amendment Set (MCAS)** is the smallest set of mutually consistent contract/schema/code/governance changes that can satisfy one or more findings **without depending on a knowingly-invalid neighboring representation**.

An MCAS must be expanded until all of these conditions hold:

- every changed authority concept has one canonical owner;
- all required historical identities remain representable for arbitrary N;
- direct and mediated references remain equal to the exact historical path they claim to represent;
- provider/account identity is exact where the governing scope requires it;
- no current/latest/default projection substitutes for frozen historical authority;
- source gaps are either actually recovered, governed conservatively, or remain explicitly non-authoritative;
- naming choices do not claim historical provenance they do not possess;
- every downstream certification whose evidence changed is marked stale before the amendment is accepted;
- the amendment survives the **Backward Contradiction Test** in §4.

If two findings share a physical root but retain independently testable normative requirements, one MCAS may remediate both physically while both findings remain separately re-certified. Shared implementation does not collapse normative ownership.

Canonical example: Phase F established that R17 and R19 share the defective `commercial_activations` physical surface, but R17 Offer/Grant identity and R19 complete Commercial Authority Lineage remain distinct requirements. A single replacement may serve both, but each must close independently.

## 3. Evidence base entering remediation

### 3.1 Phase C

Phase C completed 163/163 edge classification and certified the hard historical chain:

`R4 → R9 → R10 → R17 → R19 → R20`.

That certification is specification-level and SHA-bound. It carries exact-path strengthenings including C11-01, C12-02, C13-03, C22-01 and related reciprocal/skip-link rules.

Open Phase-C composition defects remain live remediation scope, including at minimum:

- R17 → R18;
- R5 → R20;
- R19 → R14;
- R19 → R18.

Any amendment touching a node participating in a certified Phase-C edge invalidates the affected edge result; amendments touching hard-chain semantics require D/hard-chain recheck as applicable.

### 3.2 Phase F

Phase F closed with current representation failing:

- **29 confirmed representability defects**;
- **7 representability-unresolved items**;
- total Phase-F primary dispositions: **36**.

The defects span canonical endpoint identity and cross-surface exact-reference integrity across R2/R3/R6/R7/R9/R10/R12/R13/R15/R16/R17/R18/R19/R20.

Six historical-retention durability questions remain unresolved, plus the R20 Boundary Registry representation question.

### 3.3 Phase G

Phase G has exactly one primary defect:

**G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`**

Invariant:

> exact provider/account commercial authority must remain the same identity through capability proof/binding, Offer/Grant authority, lineage, boundary consumption, and actual consequential provider dispatch.

The high-risk compound is:

`R6 → R7 → R8 → R17 → R18 → R19 → R20`.

The two demonstrated mechanisms are mutable current capability/account projection and provider-keyed bridge drift. A complete remediation must freeze/equality-wire exact provider/account identity end-to-end; fixing only one mechanism does not close G2-01.

### 3.4 Phase H / I

Phase H registered **57 source gaps**:

- 4 `BLOCK-PROVIDER`;
- 4 `SAFE-CONSERVATIVE`;
- 3 `SAFE-FALLBACK`;
- 46 `EXACTNESS-ONLY`.

Phase I confirmed that historical exact naming remains unresolved for all nine naming items. Eight have semantics complete independent of names; R8 is the one dual-layer case where taxonomy completeness itself remains unresolved.

Remediation may adopt governed current names where allowed, but may not misstate them as recovered historical names.

### 3.5 Phase J

Phase J closed as an audit with current forward-governance certification failing:

- 6 primaries;
- 0 enforced;
- 0 partially enforced;
- 3 documented-only;
- 3 missing;
- 6 durable findings J-F01 through J-F06;
- 11 attacks = 10 open future-code escapes + 0 development-process closures + 1 audit-governance-provenance closure.

J-F01–J-F06 cannot be considered safely remediated until the authority model they govern is itself stable enough to register/classify/test.

## 4. Mandatory Backward Contradiction Test — BCT

Every MCAS must pass this test **before** it is accepted into the remediation plan and again after implementation/amendment.

### BCT-1 — upstream semantic preservation

Does the amendment redefine, narrow, broaden, or substitute any upstream node's recovered semantics?

If yes, either:

- the upstream node must be amended explicitly and all dependent certifications invalidated; or
- the amendment is rejected.

### BCT-2 — historical-path equality

Could the amendment permit individually valid identities from different historical paths to compose together?

Mandatory controls include the Phase-C exact-path rules and the hard-chain mixed-history fixtures.

### BCT-3 — multiplicity / arbitrary-N

Does the amendment introduce or preserve singleton/current-row assumptions where multiple historically distinct authorities may coexist?

No amendment may close one finding by creating a new Phase-F representability defect.

### BCT-4 — reference-integrity impact

For every new key/reference/registry field, is the reference to the exact authoritative object rather than a parent/current/default/query-time neighbor?

A reachable object is not necessarily the authoritative object.

### BCT-5 — Design Input identity/scope

Does the amendment add, remove, rebind, or narrow provider/account identity or DI-1/DI-2 scope?

If commercial payment identity is touched, G2-01's exact provider/account invariant and fourteen-step fixture become mandatory.

### BCT-6 — source-gap laundering

Does the amendment turn an H/I unresolved source proposition into an asserted historical fact merely because a design choice is needed?

If a governed new rule is adopted, it must be labeled as current governance rather than historical recovery.

### BCT-7 — forward-governance recursion

Does the amendment create a new consequential surface, boundary class, predicate, provider mutation, lifecycle authority, or registry object that itself would require R20/Phase-J classification, registration, review, mechanical checking, and allow/deny tests?

A remediation patch is not exempt from the governance rule it is introducing.

### BCT-8 — new cross-node edge

Does the amendment create a new `consumes`, `depends on`, `inherits`, `hands off to`, `revalidates`, or equivalent semantic edge that was not in the 163-edge Phase-C inventory?

If yes:

- add the edge to the mechanical inventory;
- classify it under Phase-C rules;
- test reverse/skip-link consequences;
- do not treat the amendment as closed until the new edge is certified.

### BCT-9 — deletion/retention regression

Could the amendment make a previously addressable historical authority unresolvable through deletion, cascade, archival, replacement, or mutable overwrite?

If yes, retention policy must join the same MCAS.

### BCT-10 — assurance / exactness overclaim

Does the amendment silently upgrade T1/T2/T3/T4 status, source exhaustion, historical naming, or historical mechanism certainty?

If yes, reject the overclaim even if the functional design is otherwise acceptable.

## 5. Invalidation must be declared before amendment acceptance

Every proposed MCAS must include a **Pre-Amendment Invalidation Manifest (PAIM)**.

Required fields:

- MCAS ID;
- target findings;
- exact files/artifacts/configuration expected to change;
- current blob/configuration identifiers;
- node contracts semantically affected;
- direct Phase-C edges invalidated;
- hard-chain / Phase-D results invalidated;
- Phase-E compounds invalidated;
- Phase-F surface/F7 findings requiring recheck;
- Phase-G DI rows/compounds/attacks requiring recheck;
- Phase-H source-gap rows whose disposition/source state may change;
- Phase-I naming rows whose semantic/current-vocabulary posture may change;
- Phase-J findings/attacks requiring recheck;
- any new cross-node edge created;
- required post-amendment fixtures;
- status transition for every affected finding/certification.

Nothing may be left in `PASS` merely because it was not the primary target of the patch.

The default transition for a certification whose evidentiary basis changed is:

`CERTIFIED → INVALIDATED_BY_AMENDMENT / AMENDED_PENDING_RECHECK`.

## 6. Proposed MCAS architecture

The following are planning units, not implementation authorization. Adversarial review may split or merge them if the independence/dependency tests require it.

### MCAS-0 — source/semantic prerequisite gate

**Purpose:** resolve semantic/provider questions that would otherwise force later structural work to guess.

Primary scope:

- H1-S01 — R8 reconciliation-capability taxonomy/model;
- H1-S02 — R13 health transition thresholds/stall windows;
- H1-S03 — R13 aggregate-health formula;
- H1-S04 — R14 readiness/drain timeout policy;
- H1-S05/H1-S06 — R15 provider redaction + financial mappings;
- H1-S07 — R16 provider financial interpretation;
- H1-S09 — R17 checkout-provider field mappings.

Treatment split:

1. **Provider blockers** (S05/S06/S07/S09): enumerate concrete providers/adapters/source packets before provider-specific implementation authority is granted. Unknown mapping remains non-authority.
2. **Safe-conservative semantic gaps** (S01–S04): recover source if possible; otherwise adopt explicitly governed conservative rules/semantic models without historical overclaim.
3. R8 naming remains subordinate to semantic-model completion; do not simply promote the recalled five labels.

**Why first:** these propositions can determine field meaning, state transition behavior, retry authority, financial interpretation, provider/account identity, or lifecycle timing. Encoding structure before resolving them risks baking guesses into the schema.

**Minimum invalidation scope if contracts change:** affected R8/R13/R14/R15/R16/R17 Phase-C edges; E compounds containing those nodes; relevant F7 findings; G high-risk compound where provider/account/dispatch semantics change; H/I rows themselves; J if a new consequential class/predicate/provider mutation appears.

**Hardest question:** which safe-conservative items should be source-recovered versus deliberately governed as new current rules? The answer changes provenance/assurance and therefore cannot be hidden inside implementation work.

### MCAS-1 — canonical historical authority spine + exact commercial identity

**Purpose:** establish the immutable, arbitrary-N historical identity graph that later composition and governance will consume.

Core normative owners:

- R9 Build Source Snapshot;
- R10 Artifact Version / exact QA + Release identity;
- R17 Offer Version / CUSTOMER_CHARGING Grant;
- R18 Capability Binding Snapshot / validation / execution attachment;
- R19 complete Commercial Authority Lineage Reference;
- R20 Boundary Decision identity.

Must also carry exact commercial provider/account identity through the G2-01 compound:

`R6 → R7 → R8 → R17 → R18 → R19 → R20 → actual dispatch`.

Direct Phase-F owners include at minimum:

- F03-01;
- F04-01/F04-02;
- F05-01/F05-02/F05-03;
- F06-01/F06-02/F06-03;
- F01-01/F01-02;
- F02-01;
- the relevant F07 cross-surface edges among R9/R10/R17/R18/R19/R20.

G2-01 belongs in the same coherent amendment set because provider/account identity cannot be safely bolted onto the lineage graph afterward as mutable metadata.

**Required invariants:**

- arbitrary N historical objects;
- immutable exact IDs;
- no one-row-per-Asset authority collapse;
- exact QA/Release ↔ Artifact correspondence;
- exact Offer/Grant ↔ Artifact/Release correspondence;
- exact capability binding ↔ execution correspondence;
- exact Offer/Grant ↔ R18 binding ↔ R19 lineage correspondence where applicable;
- complete R19 direct/embedded same-path equality;
- exact provider/account equality end-to-end;
- no provider-only bridge keying where exact account identity is required;
- R20 decisions bind the exact lineage/predicate identities they evaluated.

**Mandatory invalidations:**

- all Phase-C edges whose consumer/upstream is any changed R9/R10/R17/R18/R19/R20 contract;
- Phase-D hard-chain certification if any hard-chain artifact/semantic contract changes;
- Phase-E compounds `R6×R18×R20`, `R3×R20` if R20 predicate representation changes, and any other compound consuming changed identities;
- all Phase-F individual/F7 findings touching these surfaces;
- Phase-G G1/G2/G4 DI-1 compound and attacks when capability/commercial identity or adapter input changes;
- H/I rows only where semantics/representation/name posture changes rather than merely code implementation;
- Phase J if R20 decision/registry/consequence model gains new consequential surfaces or predicates.

**Backward-contradiction focus:** do not “fix” the physical `commercial_activations` root by collapsing R17 Offer/Grant and R19 lineage into one newly named object. Shared storage is permissible only if both normative objects remain separately and exactly representable.

### MCAS-2 — noncommercial exact-reference / truth-composition graph

**Purpose:** repair Phase-F F7 correspondences outside the central R9→R20 commercial lineage spine.

Subclusters may be implemented separately only if their invalidation sets remain independent:

#### MCAS-2A — R2 Resolution Outcome ↔ R7 reservation

Owner: F07-13.

Require exact outcome/version identity at admission; do not substitute current/latest resolution.

#### MCAS-2B — R12 runnable occurrence ↔ R13 path-health result

Owner: F07-14 plus R13 representation dependencies.

Requires exact occurrence/path/executor/expectation identity and must compose with MCAS-0's R13 semantic thresholds/formula rather than inventing health semantics in schema.

#### MCAS-2C — R3 freshness result ↔ R20 decision predicate

Owner: F07-15.

Freshness identity/policy version must be operation-bound; it may not become authority to substitute historical lineage.

#### MCAS-2D — R7/R15/R16 financial truth composition

Owners: F07-16/F07-17 and the certified `R7 × R15 × R16` / `R7 × R8 × R15 × R16` compounds.

Must preserve:

- exact reservation/execution identity;
- immutable provider financial evidence set;
- order-independent deterministic reconciliation;
- no retroactive erasure of executed authority;
- provider semantics from MCAS-0 where provider-specific interpretation is required.

**Invalidation:** each subcluster invalidates its direct Phase-C edges, relevant Phase-E compounds, F7 certification, and any G/J result only when the changed representation creates or alters a DI/consequence boundary. Any R20 schema/predicate change also joins MCAS-1/MCAS-5 invalidation scope.

### MCAS-3 — open cross-node composition defects / handoff authority

**Purpose:** remediate semantic compositions Phase C deliberately left open rather than burying them inside schema work.

Mandatory scope includes at least:

- R17 → R18;
- R5 → R20;
- R19 → R14;
- R19 → R18.

Each must be amended at its actual semantic owner(s), preserving ownership rather than duplicating policy downstream.

Special constraints:

- R20 may consume R5 independent-confirmation truth but must not redefine R5 independence/materiality semantics;
- R20 may consume R18 binding/disposition but must not redefine R18 lifecycle policy;
- R19/R14 handoff must preserve frozen historical lineage while respecting current lifecycle ownership/fencing;
- R17/R18 commercial capability composition must preserve exact Offer/Grant and exact capability binding/provider-account identity.

**Invalidation:** direct/reverse/skip Phase-C edges; relevant Phase-E compounds; hard-chain if R17/R19/R20 contract semantics change; F/G where representability or DI identity changes; J where the applicable predicate universe or boundary classes change.

**Backward-contradiction focus:** a newly explicit consumer edge may itself be a new Phase-C edge and must enter the mechanical inventory rather than being treated as a local field addition.

### MCAS-4 — historical retention / deletion / addressability policy

**Purpose:** resolve the six Phase-F historical-retention durability questions as one cross-cutting policy family unless evidence proves node-specific policies must differ.

Current unresolved surfaces:

- R9;
- R10;
- R17;
- R18;
- R19;
- R20.

A coherent policy must define, at minimum:

- whether historical authority records may ever be physically deleted;
- archival/tombstone semantics;
- referential behavior when operational parents are deleted;
- immutable addressability requirements;
- whether derived/cached current projections may be rebuilt without mutating frozen history;
- migration behavior for legacy records.

**Why not fold automatically into MCAS-1:** MCAS-1 defines what must be representable; MCAS-4 defines how long and under what deletion/archive rules that representation remains authoritative/addressable. The policy may be designed alongside MCAS-1 but retains its own acceptance proof.

**Invalidation:** Phase-F retention items by definition; Phase C/D/E if deletion semantics can destroy identities relied on by certified compositions; H2 representation/traceability rows if governed storage form is adopted; J if retention introduces new registry/archival consequential operations.

### MCAS-5 — R20 Boundary Registry + forward-governance enforcement

**Purpose:** remediate F02-02 and J-F01–J-F06 only after the authority objects and applicable predicate semantics they must govern are stable enough to register.

Scope:

- resolve F02-02 by proving an equivalent registry or introducing a governed canonical representation;
- J-F01 explicit consequential-surface classification trigger;
- J-F02 registration/re-registration before merge/release;
- J-F03 mandatory bypass/degradation review trigger;
- J-F04 deterministic fail-closed checks where mechanically possible;
- J-F05 consumer allow/deny and degradation-regression proof;
- J-F06 unrepresentable consequence-class → governed A0/A1 escalation.

J-A11 acceptance must use the canonical degradation-resistance methodology or an equivalent mechanism:

1. canonical source-controlled definition;
2. authority-sensitive material-change trigger;
3. per-predicate deny-without-`P_i` regression where meaningful;
4. mandatory execution;
5. protection of denial fixtures from silent weakening/deletion.

**Dependency rule:** MCAS-5 may not freeze a registry taxonomy/predicate model around known-invalid MCAS-1/2/3 authority semantics. Forward governance comes after the governed subject is coherent.

**Self-application rule:** MCAS-5's own new registry/classifier/lint/review/test surfaces must be classified as consequential governance surfaces under the rule they establish.

**Invalidation:** all Phase-J J-F findings and J2 attacks; F02-02/F02-01 as applicable; R20 Phase-C edges if contract/decision semantics change; Phase-E `R6×R18×R20` and `R3×R20`; Phase G if provider/account or DI predicates are encoded; Phase I only if working names are promoted or changed in a way that affects current recovered-contract vocabulary posture.

### MCAS-6 — exactness, naming, and governed adopted forms

**Purpose:** resolve exact representation/naming choices needed for corrected implementation without laundering them into historical-source recovery.

Includes:

- H2 exact representation families that implementation must concretize;
- I-02/I-03/I-05/I-06/I-07 governed current naming where needed;
- preservation of normative recovered-contract R14 lifecycle labels and R20 phase vocabulary where chosen;
- R20 forward-governance descriptive label treatment;
- deterministic-key encodings and registry/schema names where H2 assigns exactness-only debt.

**Dependency:** semantic models come first. R8/I-01 remains outside naming-only treatment until MCAS-0 resolves the semantic taxonomy/model.

**Invalidation:** H/I exactness rows; any contract/schema tests that bind names/encodings; Phase C only if a naming change alters semantics/cardinality/ownership rather than presentation/storage spelling; J if boundary-class vocabulary changes affect operational registry definitions.

This MCAS should generally be late because premature naming/schema exactness can harden the wrong semantic model.

## 7. Proposed dependency ordering

The default ordering is:

`MCAS-0 → MCAS-1 → MCAS-2 / MCAS-3 → MCAS-4 → MCAS-5 → MCAS-6`

With two important qualifications:

1. MCAS-4 retention policy may be designed in parallel with MCAS-1 but must be certified before historical representability closes.
2. MCAS-6 exactness choices may be made locally during another MCAS only when the underlying semantics are already stable; historical provenance must remain correctly labeled.

MCAS-2 subclusters can proceed in parallel where their contracts and invalidation footprints do not overlap.

No MCAS may be marked complete merely because code compiles or local tests pass. Completion means its target findings have been amended and every invalidated certification has received the required recheck.

## 8. Amendment acceptance lifecycle

Every MCAS passes through:

1. `PROPOSED`
2. `ADVERSARIALLY_REVIEWED`
3. `PAIM_FROZEN`
4. `AMENDMENT_APPLIED`
5. `AFFECTED_FINDINGS = AMENDED_PENDING_RECHECK`
6. `INVALIDATED_CERTIFICATIONS_REEXECUTED`
7. `BACKWARD_CONTRADICTION_TEST_PASSED`
8. `TARGET_FINDINGS_CLOSED` or `REMEDIATION_INCOMPLETE`

A finding never transitions directly from `OPEN` to `CLOSED` merely because the intended patch landed.

## 9. Recheck classes after each MCAS

### RCK-1 — local owner contract

Re-run the exact owner-node acceptance semantics and negative controls.

### RCK-2 — direct Phase-C edges

Re-run every Phase-C edge touching changed semantic artifacts plus any new edge created by the amendment.

### RCK-3 — hard chain

If R4/R9/R10/R17/R19/R20 identity semantics changed, rerun affected hard-chain certification; if multiple chain nodes changed, rerun the full chain.

### RCK-4 — Phase-E compounds

Rerun each compound containing a changed node/semantic predicate.

### RCK-5 — Phase-F representability

Rerun affected individual surfaces, cross-surface references, arbitrary-N attacks, mixed-history fixtures, and retention tests.

### RCK-6 — Phase-G DI

Rerun affected DI-1/DI-2 rows/compounds/attacks when provider/account identity, capability/binding, adapter dispatch, reversal mutation, or named DI scope changes.

### RCK-7 — Phase-H/I exactness/source

Re-adjudicate only the rows whose source basis, semantic completeness, naming posture, or governed adopted form actually changed. Do not mechanically claim stronger historical provenance because an implementation choice was made.

### RCK-8 — Phase-J future governance

Rerun J-F/J-A evidence when consequential classification/registry/review/CI/test/escalation mechanisms or the governed boundary model changes.

### RCK-9 — final complete Phase-C sweep

Even after all targeted invalidated checks are green, the global plan requires one final full Phase-C contradiction sweep against the final amended corpus.

Targeted rechecks do not substitute for RCK-9.

## 10. Anti-under-invalidation rule

For every amendment, derive invalidation in both directions:

### Forward dependency walk

From every changed semantic owner, walk all consumers in the mechanical Phase-C edge graph and every certified compound that consumes the changed proposition.

### Evidence dependency walk

Search every F/G/H/I/J certification for the changed blob/path/function/schema/configuration or semantic proposition used as evidence.

An artifact can be invalidated even if it is not a semantic consumer—for example, a Phase-G conclusion may cite current `commercial_activations` or capability behavior as implementation evidence.

### Physical-root expansion

If one physical schema/code surface supports multiple normative owners, invalidate **all** certifications that used that physical surface even if only one owner was the amendment's stated target.

This rule is especially important for `commercial_activations`, capability current/history projections, adapter bridges, R20 decision/registry surfaces, and shared execution/financial tables.

## 11. Anti-over-invalidation rule

Invalidation must be broad enough, but not theatrical.

Do not automatically invalidate every phase merely because one file changed.

A certification is invalidated only when one of these is true:

- its pinned semantic artifact changed;
- its pinned implementation/schema/configuration evidence changed materially;
- an upstream proposition it relies on changed;
- an amendment created a new edge/representation that its completeness claim must now cover;
- its acceptance fixture could produce a different result under the amendment.

Every invalidation must name the dependency; every non-invalidation challenge raised during review should be answered explicitly.

## 12. Remediation planning register required before first amendment

Before any substantive amendment is applied, create a canonical **Global Remediation Dependency & Invalidation Register** with one row per primary finding/gap that requires remediation or governed resolution.

At minimum, each row must contain:

- finding/gap ID;
- normative owner;
- physical implementation surface(s);
- assigned MCAS;
- upstream prerequisites;
- sibling findings sharing physical roots;
- exact acceptance fixture(s);
- planned amendment artifacts;
- Phase-C edge invalidations;
- Phase-D/E invalidations;
- Phase-F/G invalidations;
- H/I source/exactness effects;
- J effects;
- final closure predicate.

The register is the control plane for remediation. Individual patch notes are not a substitute.

## 13. Hardest sequencing questions for adversarial review

Review should pressure at least these points:

1. **Is MCAS-1 too broad?** Could provider/account identity be repaired separately from R9/R10/R17/R18/R19/R20 historical identity without creating a period where commercial authority is internally inconsistent?
2. **Should MCAS-4 retention be part of MCAS-1 rather than a separate acceptance family?** If historical objects are introduced without deletion/addressability policy, is the representation ever meaningfully complete?
3. **Do the four open Phase-C composition defects belong inside MCAS-1, MCAS-3, or both?** Avoid duplicate remediation while preserving distinct owner semantics.
4. **Which Phase-H safe-conservative gaps must be resolved before schema design, and which can remain conservative runtime policy without blocking structural work?**
5. **Can F02-02 Boundary Registry representation be resolved before MCAS-5, or would doing so prematurely freeze an incomplete R20 predicate/class model?**
6. **Does G2-01 require amendment of R6/R7/R8 contracts, or only corrected implementation representation/wiring under already-correct semantics?** This determines Phase-C/E invalidation breadth.
7. **Which Phase-F F7 defects can truly be repaired independently under MCAS-2 subclusters, and which share an endpoint representation that makes separate patches unsafe?**
8. **Does any proposed MCAS introduce a new cross-node edge not present in the 163-edge inventory?** If yes, the plan must expand before amendment.
9. **Could MCAS-5 forward-governance remediation create a new representability or DI defect?** Registry/class/predicate models must themselves pass F/G standards.
10. **Is the PAIM derivation process sufficient to prevent under-invalidation of certifications that used changed implementation evidence without being formal semantic consumers?**

## 14. Proposed result of this planning artifact

If this plan survives adversarial review, the next artifact should **not** be an implementation patch.

The next artifact should be:

`GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER`

That register will enumerate the full finding-to-MCAS-to-invalidation graph before any amendment is allowed to change canonical node/schema/governance artifacts.

Only after that register is independently reviewed should MCAS-0 or any other amendment set move from planning into execution.

## 15. Provisional planning disposition

`POST-J REMEDIATION PLANNING STARTED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED / REMEDIATION ORGANIZED BY MINIMUM COHERENT AMENDMENT SETS, NOT FINDING-BY-FINDING PATCHES / EVERY AMENDMENT REQUIRES A PRE-AMENDMENT INVALIDATION MANIFEST + BACKWARD CONTRADICTION TEST / FINAL FULL PHASE-C SWEEP AND INDEPENDENT T4 REMAIN MANDATORY`
