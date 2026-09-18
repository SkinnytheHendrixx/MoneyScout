# Representation Remediation — Wave Sequencing Candidate After Package 01

**Status:** SEQUENCING CANDIDATE / NON-AUTHORITATIVE / READY FOR ADVERSARIAL REVIEW  
**Input milestone:** Package 01 semantic amendments A+B both landed / POST-BCT passed / targeted rechecks passed  
**Implementation authority:** SUSPENDED  
**Purpose:** choose the minimum coherent representation-remediation order that unlocks certification without duplicating shared-root work

## 1. Why a new sequencing pass is required

Package 01 resolved the two Phase-C semantic composition gaps:

- `RD-C-R17-R18` — R17 Offer/Grant ↔ R18 commercial-payment Binding;
- `RD-C-R19-R18` — R19 Lineage ↔ R18 Binding.

Both semantic rules are now stable/current.

Their lifecycle closure is still blocked by representation findings:

- A path: `F05-03 + F06-02 → F07-04 → RD-C-R17-R18 MAY_CLOSE`;
- B path: `F06-02 + F01-02 → F07-05 → RD-C-R19-R18 MAY_CLOSE`;
- B whole-lineage certification: `F01-02 + F02-01 → F07-18`.

The next work should therefore optimize for dependency leverage and shared-root coherence rather than treat every open finding as an independent patch.

## 2. Governing representation blockers

### F06-02 — EXECUTION_CAPABILITY_BINDING_ATTACHMENT

Closure proposition:

> Every consequential execution binds exact immutable Capability Binding identity/provider-account/R6 verification/policy/lifecycle/provenance; required Binding Validation Record is durable and replay-stable.

Directly blocks:

- F07-01;
- F07-03;
- F07-04;
- F07-05;
- F07-06.

Source prerequisite:

- H2-E34.

Relevant root/stability surface:

- ROOT-2 `capabilities`.

### F05-03 — CUSTOMER_CHARGING_GRANT_REPRESENTATION

Closure proposition:

> Immutable Grant identity binds one exact Offer/fingerprint, provider/account, operation scope, checkout/payment configuration, issuer/provenance, lifecycle, revocation/supersession; later offers cannot inherit prior Asset-level authority.

Directly blocks:

- F07-04;
- F07-08;
- F07-09;
- XPI-04.

Source prerequisite:

- H2-E30.

Relevant root:

- ROOT-1 `commercial_activations`.

### F01-01 — COMMERCIAL_LINEAGE_CARDINALITY

Closure proposition:

> Arbitrary L1…LN legitimate R19 lineages coexist for one Asset; Asset-only uniqueness/reuse cannot collapse distinct lineage authority.

Relevant root:

- ROOT-1 `commercial_activations`.

This is not a direct F07-05 prerequisite but is mandatory compatibility scope for the R19 representation that B now requires.

### F01-02 — COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION

Closure proposition:

> A first-class immutable complete R19 Lineage Reference binds the exact historical authority path and cannot be reconstructed from current state.

Directly blocks:

- F07-05;
- F07-08;
- F07-18;
- XPI-04 through F07-05/F07-18.

Source prerequisites:

- H2-E36;
- H2-E37.

Relevant root:

- ROOT-1 `commercial_activations`.

### F02-01 — BOUNDARY_DECISION_IDENTITY_REPRESENTATION

Closure proposition:

> Durable operation-specific D1…DN Boundary Decisions coexist and bind exact authority/lineage, predicate set and policy version, outcomes, decision time/evidence, and adoption target where applicable.

Directly blocks:

- F07-03;
- F07-09;
- F07-15;
- F07-18;
- XPI-04.

Source prerequisites:

- H2-E40;
- H2-E43.

## 3. Retention blockers

### F06-04 — R18 retention durability

Must prove execution↔binding↔validation↔R6/provider-account history remains authoritatively addressable through archive/delete lifecycle.

### F05-04 — R17 retention durability

Relevant to ROOT-1 and Grant/Offer history.

### F01-04 — R19 retention durability

Relevant to ROOT-1 and complete Lineage Reference history.

Frozen dependency:

`F05-04 → F01-04`

while ROOT-1 history co-resides.

If ROOT-1 history is physically split, pinned-source triangulated reconciliation becomes an explicit closure requirement for both relevant retention surfaces.

## 4. Proposed remediation order

### Wave R1 — R18 exact execution↔binding representation

**Primary:** `F06-02`  
**Source prerequisite:** H2-E34  
**Retention co-design:** F06-04  
**Root family:** ROOT-2 / capability-binding surfaces

Why first:

1. it is shared by both Package-01 closure paths;
2. it blocks F07-04 and F07-05 simultaneously;
3. it also unlocks meaningful progress on F07-01/F07-03/F07-06;
4. its representation contract is now semantically stable after Amendments A+B;
5. doing it before ROOT-1 reduces the risk that ROOT-1 design invents a lineage/grant shape around an ambiguous binding attachment.

Wave R1 must design the durable Binding Validation Record at the same time as execution attachment even if H2-E34 historical exactness remains unrecovered; governed present-day form must be explicit before implementation certification.

### Wave R2 — coordinated ROOT-1 commercial-history redesign

**Co-designed findings:**

- `F05-03` — Grant representation;
- `F01-01` — R19 lineage cardinality;
- `F01-02` — R19 lineage identity representation.

**Retention co-design:**

- `F05-04`;
- `F01-04`.

**Source prerequisites:**

- H2-E30;
- H2-E36;
- H2-E37.

Why these belong in one design wave:

The Phase-F synthesis already established that R17 and R19 share the defective physical `commercial_activations` surface, including Asset-level uniqueness/reuse.

A root rewrite that fixes only Grant identity but preserves one-Asset lineage reuse can break R19.

A root rewrite that fixes lineage identity/cardinality but leaves Grant identity as an Asset boolean/current row can break R17/A composition.

Therefore ROOT-1 should be **one coordinated physical-root design program with separate closure owners**, not independent schema patches.

Important:

`CO_DESIGN ≠ AUTO_CLOSE_TOGETHER`

F05-03, F01-01, F01-02, F05-04, and F01-04 retain independent closure predicates and independent rechecks.

### Wave R3 — R20 Boundary Decision representation

**Primary:** `F02-01`  
**Source prerequisites:** H2-E40 + H2-E43  
**Retention follow-on:** F02-03

Why after R1/R2:

R20 must bind the final exact complete authority/lineage objects.

Designing durable Boundary Decisions before R18/R19 endpoint shapes are settled risks baking transitional/reconstructable references into the final decision object.

By R3:

- exact R18 binding/validation identity should be explicit;
- exact R19 Lineage Reference shape/cardinality should be explicit;
- R17 Grant representation should be explicit;
- Package-01 semantic composition is already canonical.

That gives F02-01 stable endpoint identities to bind rather than placeholders.

## 5. Closure leverage by wave

### After R1 alone

Potentially recheckable at semantic+R18 endpoint side:

- F07-01;
- F07-03 (still blocked by F02-01);
- F07-04 (still blocked by F05-03);
- F07-05 (still blocked by F01-02);
- F07-06.

No Package-01 Phase-C node closes yet.

### After R2 with R1 stable

Potentially:

- F07-04 can reach full endpoint-representation eligibility once F05-03 + F06-02 are certified;
- F07-05 can reach full endpoint-representation eligibility once F01-02 + F06-02 are certified;
- F07-08 can be rechecked with correct Grant + Lineage endpoints;
- F01-01 arbitrary-N compatibility can be certified independently;
- A and B Phase-C semantic nodes may become eligible for lifecycle closure once F07-04/F07-05 themselves pass their cross-surface rechecks.

This is the first point where Package-01 lifecycle closure becomes realistically reachable.

### After R3 with R1/R2 stable

Potentially:

- F07-03;
- F07-09;
- F07-15;
- F07-18;
- broader XPI-04 evidence bundle

can move toward certification, subject to their other source/provider prerequisites.

## 6. Source-governance rule before coding

The source gaps must not be allowed to silently block until the end.

Before each representation implementation MAY_LAND decision, its exactness-only source prerequisite must have one of two explicit states:

1. historical exact form recovered and pinned; or
2. historical exactness remains unrecovered, but a governed present-day representation has been explicitly designed, reviewed, and marked non-historical.

Required mapping:

- F05-03 ← H2-E30;
- F06-02 ← H2-E34;
- F01-02 ← H2-E36/H2-E37;
- F02-01 ← H2-E40/H2-E43.

No schema/field name may be presented as historically canonical merely because we choose it now.

## 7. Shared-root discipline

### ROOT-2

F06-02 work must obey ROOT-2 stability governance.

Any capability-root mutation invalidates affected R18/F07 checks until re-certified.

### ROOT-1

The ROOT-1 program is the most dangerous representation wave because one physical root currently attempts to stand in for multiple authority objects.

Frozen rule:

> shared physical root does not collapse distinct findings.

Therefore any ROOT-1 replacement must prove independently:

- R17 Grant correctness;
- R19 lineage identity correctness;
- R19 arbitrary-N cardinality;
- R17 retention;
- R19 retention;
- dependent F07 relationships.

A single migration completing successfully is not evidence that all those propositions passed.

## 8. Proposed program structure

### Representation Package 02A — R18 Execution/Binding Representation

Scope candidate:

- F06-02;
- H2-E34 governed-current-form decision;
- F06-04 retention compatibility;
- affected F07 invalidation/recheck plan;
- ROOT-2 impact.

### Representation Package 02B — ROOT-1 Commercial Authority / Lineage Representation

Scope candidate:

- F05-03;
- F01-01;
- F01-02;
- H2-E30/H2-E36/H2-E37;
- F05-04/F01-04 retention;
- shared-root migration design;
- affected F07/XPI invalidation plan.

This package should be one **physical design program** but preserve separate finding lifecycle transitions.

### Representation Package 02C — Boundary Decision Representation

Scope candidate:

- F02-01;
- H2-E40/H2-E43;
- F02-03 retention;
- F07-03/F07-09/F07-15/F07-18;
- XPI-04 implications.

## 9. Why not start with F02-01

F02-01 has broad fan-out, but it is downstream of the authority objects it must reference.

Starting there creates a high risk of:

- designing a Decision around provisional R18/R19 representation;
- storing reconstructable joins instead of stable endpoint IDs;
- needing a second migration once F06-02/F01-02 settle;
- accidentally encoding singleton assumptions before F01-01 is repaired.

Therefore its high fan-out is a reason to design it **after** endpoint representation, not before.

## 10. Why not split ROOT-1 into isolated patches

F05-03, F01-01, and F01-02 share the same defective physical history root.

Independent migrations would create repeated root instability and increase the chance that one patch reintroduces another finding's defect.

The correct distinction is:

- **co-design and coordinate physical mutation together**;
- **adjudicate closure separately**.

## 11. Candidate next action

Begin with Representation Package 02A:

`F06-02 EXECUTION_CAPABILITY_BINDING_ATTACHMENT`

First artifact should be a **source-and-current-state representation design dossier**, not code.

It must establish:

1. current actual execution/binding persistence;
2. exact missing fields/objects relative to current R18 + Amendments A/B;
3. H2-E34 historical-exactness status;
4. governed present-day Binding Validation Record design;
5. exact execution→binding/set cardinality;
6. provider/account identity representation;
7. validation/policy/lifecycle provenance;
8. archive/delete/retention requirements;
9. ROOT-2 physical writers;
10. invalidation/recheck fan-out;
11. migration/backfill ambiguity policy;
12. attack fixtures for current/default/same-provider-different-account/arbitrary-N/replay cases.

No implementation should begin until that dossier passes adversarial review and PAIM.

## 12. Candidate disposition

`PACKAGE_01_SEMANTIC_PROGRAM = COMPLETE`

`NEXT_REMEDIATION_CLASS = REPRESENTATION`

`FIRST_REPRESENTATION_TARGET = F06-02`

`ROOT1_FINDINGS_MUST_BE_CO_DESIGNED = YES`

`F02-01_SEQUENCE = AFTER_R18_AND_ROOT1_ENDPOINT_SHAPES_STABILIZE`

`RETENTION = CO_DESIGN_REQUIREMENT_NOT_POST_HOC_CLEANUP`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`

`NEXT_ARTIFACT = PACKAGE_02A_R18_REPRESENTATION_DESIGN_DOSSIER`
