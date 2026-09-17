# Money Scout — Integrated Remediation Register — Review Corrections 2

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL INTEGRATED REGISTER FREEZE  
**Applies to:** `GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_INTEGRATED_REVIEW_DRAFT.md` + `GLOBAL_REMEDIATION_INTEGRATED_REVIEW_CORRECTIONS_1.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the second narrow cross-phase adversarial pass after XPI-01…XPI-05 were established.

Accepted additions:

1. physical separation of the shared R17/R19 commercial history requires a split-reconciliation fixture before the retention compatibility edge may be treated as satisfied;
2. newly recovered historical source that conflicts with a governed conservative adoption may invalidate it, but may not automatically loosen current authority;
3. J-F01…J-F06 governance machinery is not itself a consequential surface merely because it gates or observes consequential surfaces;
4. the earlier aggregate interpretation of “R17 provider-path closure” is superseded by XPI-04’s end-to-end provider-path bundle;
5. a targeted Phase-F/G supersession sweep distinguishes true predicate strengthening from ordinary downstream dependency/invalidation additions.

No phase denominator changes. No primary finding is added, removed, merged, or reclassified.

## 2. INT-R2-01 — physical split of R17/R19 history requires reconciliation proof

### Existing rule retained

RET-R17 and RET-R19 remain separate lifecycle-bearing retention findings.

While their required histories are co-resident on `commercial_activations`, they also carry:

`RET-R17 ↔ RET-R19 = RETENTION_COMPATIBILITY_DEPENDENCY`

A physical split may remove the future need for one shared retention policy, but it does not by itself prove that legacy shared history survived correctly.

### New split-reconciliation requirement

If remediation copies or migrates pre-split `commercial_activations` history into separate canonical R17 and R19 stores, the split is not considered retention-compatible until a deterministic reconciliation fixture proves that both resulting histories preserve the same pre-split historical facts wherever both normative owners depend on those facts.

At minimum the fixture must:

1. enumerate every pre-split source row included in the migration population;
2. identify every source field or derived value required by both R17 and R19;
3. compare the post-split R17 and R19 representations against the same pinned pre-split source evidence;
4. prove equal interpretation for all shared historical dimensions, including exact provider/account, Offer/Grant ancestry, activation/execution identity, checkout/customer-contract linkage, and applicable timestamps/provenance where those facts are shared;
5. reject missing rows, conflicting values, alias-based identity collapse, or divergent migration transforms;
6. prove arbitrary-N historical rows remain independently addressable after the split;
7. preserve the pinned pre-split evidence used for the reconciliation so a later recheck does not compare two derived copies only to each other.

### Important evidence rule

Agreement between two migrated copies is not sufficient if both were produced by the same incorrect transformation.

Therefore the reconciliation must be **triangulated against pinned pre-split source evidence**, not merely `new_R17 == new_R19`.

### Failure behavior

If either migrated representation differs from the pinned source on a shared historical fact, or the two representations assign different meanings to the same pre-split fact:

- the split remains `REMEDIATION_INCOMPLETE`;
- neither RET-R17 nor RET-R19 may receive PASS-compatible closure from that migration;
- no implementation may arbitrarily select one migrated copy as historical truth without a separately governed recovery/adjudication process.

### Closure effect

`RETENTION_COMPATIBILITY_DEPENDENCY` may be removed for future independent rows only after:

- the physical split is complete;
- the split-reconciliation fixture passes;
- legacy pre-split history remains addressable for both normative owners;
- migration/replay tests prove no later projection rebuild can reintroduce divergent interpretation.

This adds no seventh retention finding.

## 3. INT-R2-02 — source recovery cannot automatically loosen a governed conservative adoption

### Existing invalidation rule retained

If later source recovery changes the evidentiary basis of a governed current assumption or rule, dependent findings/certifications become stale and require re-adjudication. Historical source recovery is not silently written into current authority.

### New tie-breaking rule

When newly recovered historical evidence conflicts with a currently governed conservative adoption:

> **Source recovery may invalidate the provenance/assurance basis of the governed rule, but it does not automatically weaken current authority.**

Pending explicit governance adjudication:

1. if one rule is unambiguously more restrictive over the affected consequential operation, the more restrictive rule remains authoritative;
2. if the rules are not totally ordered by restrictiveness, the existing governed current rule remains in force and the conflicting path fails closed wherever applying the recovered rule would broaden authority;
3. adopting a more permissive recovered historical rule is a new present-day governance decision, not a clerical source-correction step;
4. that decision requires the normal semantic amendment controls: PRE-BCT, PAIM-A/B/C, invalidation derivation, graph/consequential-surface analysis where applicable, amendment, rechecks, POST-BCT, and explicit current-governance approval;
5. historical provenance is corrected independently regardless of whether the present-day system keeps or changes the governed rule.

### Example shape

If a governed present-day R5→R20 rule requires fresh confirmation at the boundary, and later historical evidence shows an older rule allowed a 24-hour confirmation window:

- the historical record is updated to reflect the recovered evidence;
- the current system does **not** automatically gain the 24-hour permission;
- the stricter current rule remains authoritative until a separate governed amendment explicitly adopts any broader window.

### Non-laundering invariant

`HISTORICALLY_RECOVERED` does not imply `CURRENTLY_ADOPTED`.

Historical fidelity and current authority are separate states.

## 4. INT-R2-03 — J governance machinery is not self-consequential merely because it governs consequential surfaces

### Adjudication

J-F01…J-F06 controls classify, register, review, gate, test, or escalate consequential surfaces. On current recovered semantics, those governance mechanisms do not themselves become consequential surfaces solely because they observe or gate consequential actions.

Therefore:

> **J-F01 through J-F06 governance machinery is not itself required to enter the Candidate Consequential Surface Inventory merely by virtue of being governance machinery.**

Examples include:

- classification hooks;
- Boundary Registry storage/validation;
- bypass/degradation review checks;
- fail-closed policy checks;
- allow/deny regression harnesses;
- A0/A1 escalation routing.

### Important exception

The exemption is behavioral, not name-based.

If a governance implementation itself performs a consequential external action, mutates economic/customer/provider authority, dispatches to a provider, charges a customer, releases resources, or otherwise crosses a recovered consequential boundary, that concrete behavior must be classified like any other surface.

A component does not receive permanent exemption merely because its module is called “governance” or “registry.”

## 5. INT-R2-04 — supersession marker for the earlier R17 provider-path closure interpretation

### What is superseded

The standalone Phase-F reconciliation remains authoritative as the row-level reconciliation of the 36 Phase-F primary dispositions.

Its individual R17 findings remain correctly owned:

- F05-01 Offer Version identity;
- F05-02 Offer Version cardinality;
- F05-03 CUSTOMER_CHARGING Grant representation;
- F05-04 retention unresolved.

Those primary row predicates are **not** superseded.

However, any earlier aggregate interpretation that a **provider path is fully closed/certified once the R17/F07-04/G2-oriented slice is satisfied** is now too weak.

That aggregate provider-path closure interpretation is marked:

`SUPERSEDED_BY_INTEGRATION = XPI-04`

### Current end-to-end provider-path rule

A concrete consequential commercial provider path claiming end-to-end authority must satisfy the XPI-04 bundle from Corrections 1, including applicable:

- REP-R17;
- RD-C-R17-R18;
- F07-04;
- IC-G2-01 exact provider/account dispatch equality;
- H1-S09 and other applicable provider-domain blockers;
- R17 mechanical lifecycle sign-off;
- governed exactness representations;
- REP-R19 exact frozen provider/account lineage and applicable F7 lineage relations;
- REP-R20 current boundary decision/provider-account predicates over that same bound lineage.

### Why this is not a finding merge

The integration-level provider-path bundle is a certification/closure composition rule across independently owned predicates.

It does not turn R19/R20 into prerequisites for the **existence or correctness of the R17 Offer/Grant object itself**.

R17 can close its own object-representation findings while the end-to-end provider path remains uncertified because a downstream R19/R20 predicate is still open.

## 6. Targeted Phase-F/G supersession sweep

The sweep applies this test:

> Mark a prior row `SUPERSEDED_BY_INTEGRATION` only if integration changed that row's own normative closure predicate. Do not mark it superseded merely because integration discovered new downstream consumers, invalidation edges, concurrency locks, or higher-level certification bundles.

### 6.1 F01 / REP-R19

**Disposition:** `INCORPORATED / NOT SUPERSEDED`.

XPI-04 makes R19 part of an end-to-end provider-path certification, but F01-01/F01-02 already require exact immutable complete lineage. Their own row predicates are not strengthened by adding a downstream certification bundle.

RET-R19 receives the new split-reconciliation closure condition only if a physical R17/R19 history split is chosen. This is a **conditional remediation-path closure requirement**, not a redefinition of F01-04's underlying historical-addressability proposition.

### 6.2 F02-01 / REP-R20

**Disposition:** `INCORPORATED / NOT SUPERSEDED`.

Phase F already records RD-C-R5-R20 as blocking the R5-dependent predicate/binding subpart. XPI-05 adds a mechanical NAME-H2-E42 sign-off dependency for the `BOUNDARY_VALIDATION` literal, but does not redefine the F02-01 Boundary Decision identity predicate itself.

If the chosen R20 implementation mechanically embeds the literal into the representation, the NAME dependency becomes an implementation/closure prerequisite through PAIM, not a second owner of F02-01.

### 6.3 F02-02 / REP-F02-02

**Disposition:** `INCORPORATED / NOT SUPERSEDED`.

XPI-01 strengthens the **downstream registry-to-enforcement chain** by inserting H2-E39, H2-E43, and NAME-H2-E41 before J-F02 enforcement.

F02-02's own question remains narrower: whether an equivalent canonical Boundary Registry representation exists/is representable, or must be introduced after absence is confirmed.

The Phase-F statement that the representation must exist before J-F02 can close is still true as a necessary condition. Integration establishes that it is not sufficient by itself.

### 6.4 F05 / REP-R17

**Disposition:** individual rows `INCORPORATED / NOT SUPERSEDED`; aggregate provider-path closure interpretation `SUPERSEDED_BY_INTEGRATION = XPI-04`.

This is the one confirmed Phase-F supersession in the current sweep.

### 6.5 F06 / REP-R18 and F07-01/03/04/05/06

**Disposition:** `INCORPORATED / NOT SUPERSEDED`.

XPI-02 broadens shared-root concurrency/invalidation treatment around `capabilities`, including current implementation evidence consumers and H2-E05. It does not change the exact representation/reference predicates owned by F06/F07.

The added shared-root stability lock affects when evidence may be consumed and when rechecks may run, not what constitutes a valid R18 binding or F7 relationship.

### 6.6 Other Phase-F rows

**Disposition:** `INCORPORATED / NOT SUPERSEDED` on current evidence.

XPI-01…XPI-05 do not establish a stronger own-row predicate for R9, R10, the remaining F7 relations, or the other node-specific retention findings.

They remain subject to ordinary invalidation if an integrated amendment changes their evidence basis.

### 6.7 Phase-G G2-01

**Disposition:** `INCORPORATED / NOT SUPERSEDED`.

G2-01's governing invariant is already end-to-end exact provider/account identity through capability proof/binding and consequential dispatch, with downstream lineage/boundary consumption part of the same design-input continuity problem.

XPI-04 does not replace G2-01's own closure predicate. It prevents a separate **provider-path certification** from stopping once the G2-01/R17 slice passes while downstream R19/R20 authority remains unproven.

XPI-02 additionally broadens the known physical evidence roots/consumers relevant to G2-01 recheck, but that is evidence/invalidation scope rather than a new normative G2-01 rule.

## 7. Supersession taxonomy for future integration review

Use three states when incorporating earlier reconciliation artifacts:

### `INCORPORATED`

The prior row's own closure predicate remains correct. Integration adds only context, consumers, concurrency controls, invalidation edges, or downstream bundles.

### `INCORPORATED_WITH_CONDITIONAL_CLOSURE_ADDITION`

The prior proposition remains correct, but a specific remediation strategy chosen later introduces an additional acceptance requirement. Example: physically splitting R17/R19 history activates the split-reconciliation fixture.

### `SUPERSEDED_BY_INTEGRATION`

The earlier artifact contains an aggregate or row-level closure statement that would now permit closure under conditions the integrated DAG proves insufficient.

The superseding XPI/overlay must be named explicitly.

## 8. Current supersession result

At this review point:

- Phase-F individual 36-row primary reconciliation remains intact;
- Phase-G G2-01 remains intact;
- R17 **individual** F05 rows remain intact;
- the earlier **aggregate R17 provider-path closure interpretation** is the only confirmed `SUPERSEDED_BY_INTEGRATION` item from the Phase-F/G sweep;
- RET-R17/RET-R19 physical-split remediation receives a conditional reconciliation-fixture closure addition;
- no other Phase-F/G row is marked superseded without concrete evidence of a stronger own-row predicate.

## 9. Denominators unchanged

Nothing in this overlay changes:

- Phase C finding count;
- Phase F 36-primary denominator;
- Phase G one-primary denominator;
- Phase H 57-primary denominator;
- Phase I nine carry-forward rows;
- Phase J six findings / 11-attack accounting.

## 10. Provisional disposition

`INTEGRATED REVIEW CORRECTIONS 2 ACCEPTED AS REVIEW OVERLAY / PHYSICAL R17-R19 HISTORY SPLIT REQUIRES PINNED-SOURCE TRIANGULATED RECONCILIATION FIXTURE / SOURCE RECOVERY MAY INVALIDATE BUT MAY NOT AUTOMATICALLY LOOSEN GOVERNED CURRENT AUTHORITY / J GOVERNANCE CONTROLS NOT SELF-CONSEQUENTIAL SOLELY BY BEING GOVERNANCE / R17 AGGREGATE PROVIDER-PATH CLOSURE INTERPRETATION SUPERSEDED BY XPI-04 WHILE F05 PRIMARY ROWS REMAIN INTACT / TARGETED F-G SUPERSESSION SWEEP FINDS NO OTHER CURRENT OWN-ROW SUPERSESSION / PHASE DENOMINATORS UNCHANGED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
