# Amendment Package 01 — Adversarial Review Corrections 2

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL PACKAGE FREEZE  
**Implementation authority:** SUSPENDED  
**Amendment landing authority:** SUSPENDED  
**Base package:** `AMENDMENT_PACKAGE_01_R17_R18_R19_EXACT_COMMERCIAL_BINDING_COMPOSITION_REVIEW_DRAFT.md`  
**Base package commit:** `b758eb2ef37dd584d633432f9620ff955c54ee1e`  
**Corrections 1:** `AMENDMENT_PACKAGE_01_REVIEW_CORRECTIONS_1.md` commit `efbd7e5888a2d5a1db0425549ca2371d6cea509f`  
**PRE-BCT Review 1:** `AMENDMENT_PACKAGE_01_PRE_BCT_REVIEW_1.md` commit `3be9e9801645e18422c01133bf731f3ccaae1cf7`  
**Frozen register blob:** `b7d163024464a6c9f069eef68b17d1b54a4e8f71`

## 1. Purpose

This overlay resolves the Amendment Package 01 PRE-BCT blockers identified in PRE-BCT Review 1 and the subsequent R20 fan-out review.

It records six corrections:

1. `PBCT-01` — Amendment A must unconditionally recheck F07-03 and F07-09;
2. `PBCT-02` — Amendment B has a `MAY_CLOSE` closure prerequisite on Amendment A;
3. `PBCT-03` — future retention acceptance scope must include the amended historical composition;
4. `PBCT-04` — Amendment A directly affects the R17/R18-composed-evidence slice of H2-E40 Boundary Decision representation;
5. `PBCT-05` — Amendment A directly affects the corresponding H2-E43 validator-policy representation slice;
6. `PBCT-06` — J-F04/J-F05 receive conditional closure dependencies for affected commercial boundary classes.

No primary finding is added, removed, merged, or reclassified. No phase denominator changes.

## 2. PBCT-01 — Amendment A F07-03/F07-09 rechecks are unconditional

Amendment A §4.4 requires R20 to consume the **exact composed R17/R18 evidence** at the consequential boundary.

Therefore Amendment A changes the evidence basis of both existing pairwise R20 correspondence findings:

- `F07-03` — R18 Binding/Validation ↔ R20 Decision;
- `F07-09` — R17 Offer/Grant ↔ R20 Decision.

### Correction

Amendment A PAIM-B must include, at minimum:

- affected Phase-C relationship classification;
- `F07-04`;
- `F07-03` **unconditionally**;
- `F07-09` **unconditionally**;
- G2-01 where its certified evidence premise changes;
- XPI-04 end-to-end provider-path certification;
- applicable R20/J evidence as separately enumerated below.

F07-03 and F07-09 remain independent lifecycle-bearing findings. Neither is merged into F07-04.

## 3. PBCT-02 — Amendment B closure depends on Amendment A being canonical/current

Amendment B §5.2(5) requires the R19 lineage's R17 Offer/Grant segment and R18 binding segment to satisfy the separately governed `RD-C-R17-R18` composition invariant.

The base-package phrase "independently closable propositions" is therefore too strong.

### Correction

Add the dependency:

`RD-C-R17-R18 CLOSURE_PREREQUISITE → RD-C-R19-R18`

with:

- gate: `MAY_CLOSE`;
- scope: `R19_R17_R18_SEGMENT_COMPOSITION_ONLY`;
- condition: `ALWAYS` for Amendment B closure;
- design effect: none. A and B may be designed/adversarially reviewed in parallel;
- landing effect: no automatic land-order requirement unless the eventual amendment transaction couples them;
- closure effect: B cannot close until A's composition invariant is canonical/current.

Closing A does not prove B closed. B retains its independent closure predicate for exact R18 binding-set lineage, arbitrary-N completeness, historical preservation, and mixed-history rejection.

No cycle is created because A does not consume B.

## 4. PBCT-03 — retention future-acceptance fan-out

Neither amendment changes any retention finding's present lifecycle disposition. All affected retention questions remain independently open/unresolved.

The amendments do, however, change what future retention closure must preserve.

### Amendment A

Future acceptance for:

- `RET-R17`;
- `RET-R18`;

must preserve enough immutable historical evidence to prove the exact R17 Offer/Grant ↔ exact R18 binding composition that actually governed the execution, without reconstructing either side from current state.

### Amendment B

Future acceptance for:

- `RET-R18`;
- `RET-R19`;

must preserve every materially-consumed exact R18 binding member included in the complete R19 lineage, including arbitrary-N binding-set membership and same-execution attribution.

### Required retention fixtures

Future retention closure must reject models that:

- preserve only current Offer/Grant pointers;
- preserve only current capability/binding projections;
- retain provider/account values but lose exact binding identity;
- retain an R19 lineage while dropping one historically required binding-set member;
- require current-state reconstruction to recover the historical R17/R18 composition.

These are future-acceptance-scope additions only. They are not current retention PASS rechecks and do not alter retention denominators.

## 5. PBCT-04 — `RD-C-R17-R18 → H2-E40` representation dependency

### Finding

Amendment A §4.4 requires an exact R20 Boundary Decision to consume the **composed** R17/R18 evidence, not merely two independently valid references.

H2-E40 owns the governed exact/current representation of the R20 Boundary Decision.

A representation that cannot encode/reference which exact R17 Offer/Grant and exact R18 binding composition was evaluated cannot faithfully represent the amended predicate.

### Required edge

For the affected composed-authority-reference slice:

`RD-C-R17-R18 SEMANTIC_PREREQUISITE`
→
`H2-E40 GOVERNED BOUNDARY DECISION REPRESENTATION`

Scope:

`R17_R18_COMPOSED_EVIDENCE_REFERENCE_ONLY`

This does **not** block unrelated H2-E40 fields or generic Boundary Decision design.

This edge does not define the eventual concrete field/schema form. H2-E40 remains the representation owner.

## 6. PBCT-05 — `RD-C-R17-R18 → H2-E43` validator-policy dependency

### Finding

The amended rule is not merely "R17 predicate passes" AND "R18 predicate passes." It requires a relationship predicate: the exact R17 and R18 authorities consumed by the action must belong to the same historical execution authority path.

H2-E43 owns the governed validator-policy representation that determines which predicates a boundary class requires.

For a consequential commercial boundary that consumes both R17 and R18, the validator-policy representation cannot be considered complete if it can require the two predicates independently but cannot represent the required same-path composition between them.

### Required edge

For affected commercial boundary classes:

`RD-C-R17-R18 SEMANTIC_PREREQUISITE`
→
`H2-E43 GOVERNED VALIDATOR-POLICY REPRESENTATION`

Scope:

`R17_R18_COMPOSITION_PREDICATE_ONLY`

The generic policy object may be designed in parallel. Only the affected policy content/encoding is blocked from closure until the semantic rule is canonical.

This edge does not create or redefine boundary-class names, phase literals, or registry schema.

## 7. PBCT-06 — J-F04/J-F05 conditional affected-slice dependencies

### J-F04

J-F04 owns deterministic fail-closed R20 enforcement where mechanically possible.

For any consequential commercial boundary class whose authority requires the amended R17/R18 composition predicate, J-F04 cannot close that enforcement slice until the predicate is canonical and the enforcement proves that individually valid but cross-history R17/R18 objects fail closed.

Conditional dependency:

`RD-C-R17-R18 SEMANTIC_PREREQUISITE`
→
`GOV-J-F04 R17_R18_COMPOSITION ENFORCEMENT SLICE`

### J-F05

J-F05 owns route-through-current-gate behavior and allow/deny/degradation regression proof.

For affected commercial boundary classes, the allow/deny fixture set must include mixed-history cases where R17 and R18 each pass individually but their composition fails.

Conditional dependency:

`RD-C-R17-R18 SEMANTIC_PREREQUISITE`
→
`GOV-J-F05 R17_R18_COMPOSITION ALLOW/DENY + DEGRADATION FIXTURES`

These are boundary-class/predicate-scoped dependencies, not global blocks on unrelated J-F04/J-F05 work.

## 8. R20 fan-out nodes reviewed and not given new direct edges

The post-PBCT fan-out sweep reviewed the neighboring R20 objects and found no current basis for additional direct dependencies from `RD-C-R17-R18` to:

- H2-E39 Boundary Registry form, because generic registry form need not encode this predicate unless a future concrete schema embeds predicate-specific columns; the standing landing-time conditional check applies;
- NAME-H2-E41 boundary-class names/keys, because the amendment changes predicate content, not the recovered class vocabulary;
- NAME-H2-E42 phase literals, because it does not change PREFLIGHT / BOUNDARY_VALIDATION / ADOPTION_VALIDATION semantics;
- J-F01 future consequential-surface classification trigger;
- J-F03 bypass/degradation review trigger;
- J-F06 escalation for unrepresentable new consequence class;
- `RET-R20`, because immutable Boundary Decision addressability can be designed independently of this predicate's final representation, subject to ordinary invalidation/migration if the historical decision form changes;
- F02-02/H2-E39 registry existence/form, for the same generic-form reason;
- F07-15, because the amendment does not compose R3 freshness with the new R17/R18 relationship predicate.

If the selected H2-E39 registry design later embeds named predicate-specific fields for this composition directly in the registry schema, PAIM-C must revisit that conditional assumption before landing, exactly as required by the frozen register's existing H2-E39 landing-time discipline.

## 9. PRE-BCT consequence

PRE-BCT must be rerun with Corrections 1 and Corrections 2 incorporated.

The eleven package-specific attacks A01–A11 may be reused because PBCT-01 through PBCT-06 alter fan-out, invalidation, closure ordering, representation dependency, governance dependency, and retention acceptance scope without changing the semantic propositions those attacks exercised.

The rerun must nevertheless add targeted fan-out assertions proving:

1. F07-03/F07-09 are unconditional Amendment-A rechecks;
2. Amendment B cannot reach `MAY_CLOSE` before Amendment A is canonical/current;
3. RET-R17/RET-R18/RET-R19 future acceptance contains the new historical-composition obligations;
4. H2-E40 can represent the exact composed-evidence reference for affected decisions;
5. H2-E43 can represent the same-path composition predicate for affected policies;
6. J-F04/J-F05 affected commercial slices enforce/test mixed-history composition failure;
7. no unsupported dependency is added to H2-E39, E41/E42, J-F01/F03/F06, RET-R20, or F07-15.

## 10. Denominators and ownership

No phase denominator changes.

No new primary finding is created.

No authority owner changes:

- R17 owns Offer/Grant commercial authority;
- R18 owns exact capability binding and binding validation;
- R19 owns complete frozen commercial lineage;
- R20 owns boundary-time decision authority;
- H2-E40 owns Boundary Decision representation;
- H2-E43 owns validator-policy representation;
- J-F04 owns deterministic enforcement closure;
- J-F05 owns allow/deny/degradation test closure.

## 11. Current disposition

Corrections accepted for rerun:

- PBCT-01 — F07-03/F07-09 unconditional rechecks;
- PBCT-02 — A→B `MAY_CLOSE` closure prerequisite;
- PBCT-03 — retention future-acceptance fan-out;
- PBCT-04 — H2-E40 representation edge;
- PBCT-05 — H2-E43 validator-policy edge;
- PBCT-06 — conditional J-F04/J-F05 affected-slice dependencies.

Package remains:

**REVIEW DRAFT / PRE-BCT FAILS UNTIL RERUN PASSES / IMPLEMENTATION AUTHORITY SUSPENDED / AMENDMENT LANDING AUTHORITY SUSPENDED**
