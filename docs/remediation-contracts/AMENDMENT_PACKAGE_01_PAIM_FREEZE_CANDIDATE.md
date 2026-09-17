# Amendment Package 01 — PAIM Freeze Candidate

**Status:** PAIM FREEZE CANDIDATE / REVIEW DRAFT / NON-AUTHORITATIVE  
**PRE-BCT:** PASSED  
**Implementation authority:** SUSPENDED  
**Amendment landing authority:** SUSPENDED  
**Package:** `AMENDMENT_PACKAGE_01_R17_R18_R19_EXACT_COMMERCIAL_BINDING_COMPOSITION_REVIEW_DRAFT.md` + Corrections 1–2  
**Target semantic nodes:** `RD-C-R17-R18`, `RD-C-R19-R18`

## 1. Purpose

This artifact prepares the exact Pre-Amendment Invalidation Manifest freeze for Amendment Package 01 after `PRE_BCT_PASSED`.

It does not land either semantic amendment, change any canonical authority document, transition any finding, invalidate or restore any certification, modify implementation/schema/runtime state, or grant `MAY_LAND`.

The purpose is narrower: pin the exact evidence and control-plane revisions on which PAIM-A/B/C were derived, make the invalidation/fan-out scope explicit, and define deterministic staleness conditions that must be rechecked before any amendment landing transaction may begin.

## 2. Exact derivation pins

### 2.1 Frozen control-plane pins

- materialized frozen register: `docs/remediation-contracts/GLOBAL_REMEDIATION_REGISTER_FREEZE_ASSEMBLY.json`
  - canonical blob: `b7d163024464a6c9f069eef68b17d1b54a4e8f71`
  - materialization commit: `f0214a08b3098b71127add27478932e06f8c4e1e`
- canonical register freeze artifact: `docs/remediation-contracts/GLOBAL_REMEDIATION_REGISTER_CANONICAL_FREEZE.md`
  - current blob: `0e6e3bb794f15bf137f5c40afbfd604808717008`
  - freeze commit: `f004371370545cdc3de9f6c386f2d77140749917`

### 2.2 Amendment-review lineage pins

- base package blob: `ca102335f083ba963ddc32bb3973181d5aacea1f`
  - commit: `b758eb2ef37dd584d633432f9620ff955c54ee1e`
- Corrections 1 blob: `434f26b16b5642012fb29828ffe6b0444e025c7b`
  - commit: `efbd7e5888a2d5a1db0425549ca2371d6cea509f`
- PRE-BCT Review 1 blob: `39b47712d8573759a5c3821a515d62a71b84e38c`
  - commit: `3be9e9801645e18422c01133bf731f3ccaae1cf7`
- Corrections 2 blob: `c263fffea390cf1b30dd226e545bc3fa3014c71d`
  - commit: `027b8732ca6be8898853eb3ec6eae2693d3529c3`
- PRE-BCT Rerun 2 blob: `e8296452b1d4904071e7c6b3711228e2074dd00c`
  - commit: `1dca5357d45d47a5ef51a84c7786974433c41373`
  - disposition: `PRE_BCT_PASSED = YES`, attacks `11/11`, standing BCT `10/10`, Corrections 1 `2/2`, Corrections 2 `6/6`.

### 2.3 Canonical authority-surface pins

These are the current semantic authority documents that this package may require to amend atomically or sequentially under the governed landing protocol:

- `WI-R17.md` blob `16a234e897fe6e119392707a7187a3232f0fd972`
- `WI-R18.md` blob `226d67276f1627c26045ead9c7717023e7e764db`
- `WI-R19.md` blob `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- `WI-R20.md` blob `d9d7788e4c5a8f4c0914cf845294b38386470333`

R20 is pinned because Amendment A does not merely establish an R17/R18 equality in isolation; its accepted proposition requires R20 to consume the exact composed R17/R18 evidence at the consequential boundary. Canonical landing therefore cannot leave the only statement of that relational predicate outside R20's own authority contract.

### 2.4 Phase certification/source pins

- Phase F canonical synthesis blob: `0955236652c511abe4844907d8ac4e8cf2bec348`
- Phase H canonical H4 source-gap synthesis blob: `61482afb26c753819d19df1d0dc288be696d0838`
- Phase J canonical J3 blob: `4ee3ba785feeeb7a67516359d7e74fd96f6c6520`
- current branch-protection re-adjudication:
  - artifact `PHASE_J_BRANCH_PROTECTION_READJUDICATION_1.md`
  - blob `77a6789fc8d8f4dc6ff30849dd50584e7c007ffd`
  - commit `1aa27943964e3710945c48b321bbbede27837646`

No independently named Phase-G source artifact is asserted here. `G2-01` is pinned through its canonical frozen-register object/evidence lineage rather than inventing an unverified Phase-G filename. If a distinct canonical Phase-G source artifact is later identified, that is a PAIM evidence-set change requiring re-derivation before landing.

## 3. Repository/configuration derivation baseline

Immediately before this PAIM candidate is committed:

- `main` head: `1aa27943964e3710945c48b321bbbede27837646`
- pre-freeze tree: `d659683c21656ebb37d04fd53398823e8ab80cb3`
- branch `main` protected: `false`
- branch-protection enabled: `false`
- required-status-check enforcement: `off`
- required-status-check contexts/checks: none reported.

### 3.1 Self-write rule

The PAIM artifact's own creation necessarily changes `main` and the repository tree. That must not make the PAIM stale by definition.

The only permitted delta between the derivation baseline above and this PAIM candidate's creation commit is creation of this exact file:

`docs/remediation-contracts/AMENDMENT_PACKAGE_01_PAIM_FREEZE_CANDIDATE.md`

After creation, the parent→candidate commit diff must be verified to contain exactly that one path. If any other path changed, this candidate is `PAIM_STALE` and must be re-derived.

After that self-write exception is consumed, **any subsequent repository tree change before landing is a staleness event unless a governed impact check proves the change is outside every pinned PAIM-A/B/C source, graph, authority, configuration, and repository-wide inventory scope.** Because this package relies on repository-wide semantic/consumer inventories, the default is fail closed and re-derive rather than infer irrelevance.

Any change to branch protection or required-status-check configuration is independently a staleness event for the J evidence basis even if no repository file changes.

## 4. PAIM-A — semantic-dependency derivation

### 4.1 Amendment A — `RD-C-R17-R18`

The semantic amendment directly affects or constrains:

- `RD-C-R17-R18` itself;
- R17 canonical authority text;
- R18 canonical authority text;
- R20 canonical boundary-consumption text for the exact composed R17/R18 relational predicate;
- `F07-04` — R17 Offer/Grant ↔ R18 commercial-payment Binding;
- `F07-03` — R18 Binding/Validation ↔ R20 Decision;
- `F07-09` — R17 Offer/Grant ↔ R20 Decision;
- `H2-E40` — only the Boundary Decision representation slice that must encode/reference the exact composed R17/R18 evidence;
- `H2-E43` — only the validator-policy representation slice that must express the R17/R18 relational predicate rather than two unrelated independent checks;
- `J-F04` — only affected commercial-boundary deterministic enforcement slices;
- `J-F05` — only affected commercial-boundary allow/deny and degradation-regression fixtures;
- `RET-R17` future acceptance scope;
- `RET-R18` future acceptance scope;
- `XPI-04` end-to-end provider-path certification bundle;
- `G2-01` only if the formal provider/account equality proposition changes the evidence premise of that implementation-conformance finding;
- Phase-C candidate graph update/classification for the new/strengthened edges above.

Negative fan-out remains explicit. Amendment A does not currently justify a direct prerequisite to H2-E39, NAME-H2-E41, NAME-H2-E42, J-F01, J-F03, J-F06, RET-R20, or F07-15.

### 4.2 Amendment B — `RD-C-R19-R18`

The semantic amendment directly affects or constrains:

- `RD-C-R19-R18` itself;
- R18 canonical authority text to the extent needed to expose exact binding identity/set semantics to lineage;
- R19 canonical authority text;
- `F07-05` — R18 Binding ↔ R19 Lineage;
- `F07-18` — **unconditional** exact complete R19 Lineage ↔ exact R20 Boundary Decision recheck because Amendment B changes what counts as complete R19 lineage;
- `RET-R18` future acceptance scope;
- `RET-R19` future acceptance scope;
- `XPI-04` end-to-end provider-path certification bundle;
- `G2-01` only if the formal provider/account lineage proposition changes its evidence premise;
- Phase-C candidate graph update/classification;
- `RD-C-R17-R18 CLOSURE_PREREQUISITE → RD-C-R19-R18` at `MAY_CLOSE`.

Amendment B may be designed and prepared in parallel with Amendment A, but it may not close before Amendment A's composition invariant is canonical/current. Closing Amendment A does not prove Amendment B closed.

## 5. PAIM-B — evidence/certification invalidation manifest

### 5.1 Amendment A mandatory invalidation/recheck set

Upon governed landing of Amendment A, the evidence basis changes unconditionally for:

- the affected Phase-C relationship/edge classification;
- `F07-03`;
- `F07-04`;
- `F07-09`;
- `XPI-04` affected provider-path bundle.

The following open objects receive changed future acceptance/closure scope rather than false PASS invalidation:

- `H2-E40` affected representation slice;
- `H2-E43` affected policy-representation slice;
- `J-F04` affected enforcement slice;
- `J-F05` affected test/degradation slice;
- `RET-R17` future historical-composition acceptance;
- `RET-R18` future historical-binding/composition acceptance.

`G2-01` is evidence-driven: recheck/invalidation is required only if the landed wording changes the formal provider/account proposition on which its current evidence basis depends. That determination must be made against the pinned G2 frozen-register object before landing; silence is not permission to skip it.

### 5.2 Amendment B mandatory invalidation/recheck set

Upon governed landing of Amendment B, the evidence basis changes unconditionally for:

- the affected Phase-C relationship/edge classification;
- `F07-05`;
- `F07-18`;
- `XPI-04` affected provider-path bundle.

The following open objects receive changed future acceptance/closure scope:

- `RET-R18` exact historical materially-consumed binding-set preservation;
- `RET-R19` exact complete-lineage historical preservation.

`G2-01` remains evidence-driven under the same rule above.

### 5.3 Phase J evidence basis

The current J evidence basis includes the completed branch-protection trigger re-adjudication. `J-F03` remains `J_DOCUMENTED_ONLY`; `J-F04` remains `J_MISSING`; the dependent J attacks remain open; attack arithmetic remains exactly:

`11 total = 10 open future-code escapes + 0 development-process closures + 1 J-A9 audit-governance-provenance closure`.

The PAIM must not regress to the obsolete statement that branch-protection evidence is inaccessible.

## 6. PAIM-C — physical/root and writer-surface expansion

### 6.1 Current amendment class

This package is a semantic-contract amendment. It authorizes no schema, migration, runtime, provider, capability, checkout, payment, lineage-table, or execution-path implementation change.

Therefore the current semantic landing's writer set is documentation/control-plane authority only.

Potential canonical writer surfaces are:

- `WI-R17.md`;
- `WI-R18.md`;
- `WI-R19.md`;
- `WI-R20.md`;
- the governed remediation register/graph representation needed to record newly effective dependencies and states;
- amendment lifecycle/certification records created by the governed landing transaction.

The exact writer set must be frozen before `MAY_LAND`. A newly discovered required writer surface after landing begins invokes the frozen FR-02/FR-09 abort/rollback rules.

### 6.2 Runtime shared roots

`ROOT-1`, `ROOT-2`, and `ROOT-3` are **not** current semantic-amendment writer roots and require no runtime/schema mutation lease for this package at this stage.

They remain evidence/future-implementation roots whose later remediation must consume these semantics. No statement here authorizes modifying:

- `commercial_activations`;
- `capabilities`;
- commercial-payment provider/config/adapter implementation;
- any payment/provider runtime path.

If the amendment scope expands to implementation, PAIM-C must be re-derived and the canonical shared-root total ordering/lease rules apply before any mutation.

## 7. Candidate graph states before landing

Every edge introduced or strengthened by this package remains non-current before governed landing.

Candidate edges may be visible for conservative invalidation discovery, but may not be consumed as positive certified semantic premises.

At minimum the candidate graph must represent:

- A's strengthened/direct recheck/fan-out relationships to F07-03, F07-04, F07-09, H2-E40, H2-E43, affected J-F04/J-F05 slices, RET-R17/RET-R18 acceptance scope, XPI-04, and conditional G2 evidence;
- B's relationships to F07-05, F07-18, RET-R18/RET-R19 acceptance scope, XPI-04, conditional G2 evidence;
- `RD-C-R17-R18 CLOSURE_PREREQUISITE → RD-C-R19-R18` at `MAY_CLOSE`.

No candidate edge becomes `CERTIFIED_CURRENT` merely because PRE-BCT passed or because this PAIM is later frozen.

## 8. Landing sequencing question still requiring adjudication

PRE-BCT establishes that Amendment B has a closure prerequisite on Amendment A. It does not by itself decide whether A and B should be landed in one atomic semantic amendment transaction or in two governed transactions.

Two safe candidate strategies remain for adversarial review:

1. **Sequential landing:** land A, reach its stable post-BCT state and required graph/rechecks, then prepare/land B against A's now-current canonical invariant.
2. **Single atomic package landing:** amend A and B's authority surfaces in one atomic landing transaction, but model A's proposition as a separately identifiable canonical component and prohibit B closure until A's own post-land checks establish it current.

This PAIM candidate does **not** choose between them. `MAY_LAND` is blocked until the sequencing choice is adjudicated and its invalidation/rollback consequences are explicit.

## 9. Deterministic staleness conditions

Before any `MAY_LAND` decision, re-read and compare every pinned input in §2 plus the configuration in §3.

The PAIM becomes `PAIM_STALE` if any of the following occurs:

1. any pinned blob differs;
2. the frozen register or canonical freeze revision changes;
3. the Phase-F/H/J evidence artifacts change;
4. an independently authoritative Phase-G artifact is discovered that changes the evidence basis used for G2-01;
5. WI-R17/R18/R19/R20 changes;
6. the amendment package, either correction overlay, PRE-BCT review, or PRE-BCT rerun changes;
7. branch-protection/required-status-check configuration changes;
8. a repository change affects any PAIM-A/B/C source, consumer inventory, candidate graph, writer surface, or repository-wide sibling/consumer search assumption;
9. a new semantic/representation/governance/retention dependent is discovered;
10. a new writer/root is discovered;
11. the candidate-edge classification changes;
12. the chosen A/B landing sequencing strategy changes the invalidation or rollback set.

On staleness: stop, preserve history, re-derive PAIM-A/B/C from the new exact revisions, rerun affected PRE-BCT/BCT questions, and refreeze. Do not selectively carry forward an old PAIM because the change appears harmless without a governed impact determination.

## 10. Required freeze-time verification before this candidate may become PAIM_FROZEN

A reviewer must independently verify:

1. every blob/commit/config pin in §§2–3;
2. the parent→candidate commit contains only this PAIM candidate file;
3. Amendment-A mandatory rechecks include F07-03/F07-04/F07-09 and XPI-04;
4. Amendment-B mandatory rechecks include F07-05/F07-18 and XPI-04;
5. F07-18 is unconditional for B;
6. H2-E40 and H2-E43 remain distinct A representation dependents;
7. J-F04/J-F05 dependencies are affected-slice only;
8. retention rows change future acceptance scope only, not current disposition;
9. H1-S09 remains unresolved and is not laundered by checkout wording;
10. G2-01 remains evidence-driven rather than silently skipped or converted into a new semantic owner;
11. ROOT-1/2/3 are not treated as current semantic writer roots;
12. branch-protection J re-adjudication is included and the 3+3 / 11-attack arithmetic is unchanged;
13. candidate edges are non-current until governed landing;
14. the A→B closure prerequisite is acyclic;
15. the A/B landing sequencing question is explicitly resolved before `MAY_LAND`.

## 11. Current disposition

`PRE_BCT_PASSED = YES`.

`PAIM_FROZEN = NO`.

`MAY_LAND = NO`.

`IMPLEMENTATION_AUTHORITY = SUSPENDED`.

`AMENDMENT_LANDING_AUTHORITY = SUSPENDED`.

This artifact is ready for adversarial PAIM-freeze review only.