# Phase C Batch 28 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-28  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 84 edges across 28 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R11`
- `R16 → R19`
- `R9 → R11`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing process note — exact authoritative-record binding

Phase C has now repeatedly found a distinct specification gap family in which the cross-node behavior and ownership split are correctly described, but the durable record identity proving which exact upstream authoritative result caused a downstream transition is absent.

For every remaining edge where one contract says that node X creates, routes to, triggers, confirms, denies, reconciles, or otherwise authoritatively causes state in node Y, review must separately ask:

> **Does Y durably bind X's specific authoritative record identity/fingerprint, or does the corpus only state that X's authority/process must be consumed?**

Preserving the upstream domain object, raw evidence, or generic node-level provenance is not automatically equivalent to preserving the exact decision/confirmation/lineage/adjudication record that caused the transition.

---

## C28-01 — `R20 → R11`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R20 explicitly states that failed boundary validation or `CONSEQUENTIAL_AUTHORITY_REGRESSION` creates durable remediation and that R11 owns corrective disposition. R20 boundary decisions are themselves durable, operation-specific records carrying exact boundary/operation identity, authority/lineage evaluated, predicate-policy version/set, observed predicate outcomes, decision time/result, and evidence references.

R11 reciprocally requires every corrective obligation to preserve what failed, exact affected object/version/execution/artifact/lineage, which governing authority created the obligation, supporting evidence/provenance, authorized successor scope, and completion rule.

The behavioral relationship and ownership split are therefore present and determinate.

However, R11 does not explicitly require the corrective obligation/history to durably bind the exact R20 Boundary Decision or authority-regression record that created it. Recording that R20 governed the transition is weaker than preserving which exact R20 decision caused the obligation.

### Required strengthening — exact R20 decision-to-obligation binding

When an R11 corrective obligation originates from an R20 boundary denial or `CONSEQUENTIAL_AUTHORITY_REGRESSION`, the obligation/history must durably bind the exact R20 decision/regression record that created it.

> **R11 must preserve which exact R20 authority decision caused the corrective obligation, not merely that R20 was the governing source.**

The binding must preserve the exact decision identity/fingerprint and enough provenance to recover the boundary/operation, exact authority/lineage evaluated, predicate-policy version/set, predicate outcomes, decision/result, decision time, and relevant evidence references.

### Required fixture

1. Consequential action X reaches R20 boundary B1.
2. R20 creates durable decision `D1 = DENY` because predicate P fails.
3. R11 creates corrective obligation O1.
4. O1 durably binds D1 specifically.
5. Later, another R20 decision D2 exists for the same higher-level object/action class.
6. D2 cannot silently become the provenance for O1.
7. If D1's predicate interpretation is later shown defective, the system can enumerate exactly which corrective obligations were created from D1.
8. If O1 materially changes scope because new authority facts emerge, governed successor/version semantics apply rather than rewriting which decision created O1.
9. R11 completion does not rewrite D1 from `DENY` into historical `ALLOW`.
10. A later R20 `ALLOW` can authorize future action but cannot erase the fact that O1 arose from D1.
11. `CONSEQUENTIAL_AUTHORITY_REGRESSION` uses the same exact-record rule: remediation points to the precise regression record.
12. O1 still requires a fresh R20 decision before any consequential remediation execution.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R20 explicitly transfers corrective ownership to R11 and R11 explicitly accepts governed failure provenance. The missing precision is durable exact-record identity inside an already-defined relationship.

It is not `UNRESOLVED_CROSS_NODE_GAP`: there is no competing coherent normative outcome.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R20 decision-record binding strengthening.

---

## C28-02 — `R16 → R19`

**Pinned endpoint blobs**

- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`
- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R16 explicitly requires applicable canonical financial state to remain linkable through R15/R8 to the complete immutable commercial lineage governed by R19. It says a canonical charge without exact transaction / Offer / provider-account / execution lineage is insufficient for final commercial certification and forbids reconstruction of missing commercial authority from current Asset/Offer state.

R19 reciprocally requires the exact commercial operation/transaction to remain linked to R15 immutable observations and R16 canonical reconciliation.

The relationship therefore exists on both sides.

However, R16's wording requires the result to remain "linkable" to R19 but does not explicitly require each applicable canonical financial result/history to durably bind the exact named R19 `Commercial Authority Lineage Reference` / composite fingerprint whose execution/transaction it reconciles. Reconstructible joins through component identifiers are weaker than direct durable binding to the frozen lineage identity.

### Required strengthening — exact R19 Lineage Reference binding

Where an R16 canonical financial result belongs to commercial execution governed by R19, that result/history must durably bind the exact R19 `Commercial Authority Lineage Reference` / fingerprint, rather than relying only on later reconstruction through R15/R8/component joins.

> **"Can be linked back later" is weaker than "this exact canonical financial interpretation belongs to frozen lineage L1."**

The result must also preserve its R16 reconciliation-policy version so later recomputation under a new policy does not obscure which interpretation was consumed historically.

### Required fixture

1. Commercial lineage L1 governs transaction T1 / execution E1.
2. R15 records financial observations F1...Fn for E1.
3. R16 derives canonical result C1 under reconciliation policy V1.
4. C1 durably binds exact R19 Lineage Reference L1/fingerprint.
5. A second lineage L2 exists for the same Asset/provider/account but under another Offer/session/contract or authority path.
6. Component overlap cannot cause C1 to become attributable to L2.
7. Later R16 replay under policy V2 produces C2.
8. C2 may revise canonical financial truth while preserving that both C1/V1 and C2/V2 concern L1.
9. Current Asset/Offer state cannot substitute L2 for L1.
10. If exact R19 lineage is unproven, final commercial certification remains incomplete rather than attaching C1 to the most plausible current lineage.
11. R19 linkage does not let R16 fabricate missing financial evidence.
12. R20 current ineligibility does not detach C1/C2 from L1 historical economic truth.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: both nodes explicitly require R16↔R19 composition and R19 already requires R16 reconciliation linkage. The missing precision is direct durable binding of the named lineage object.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the intended behavior is determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R19 Lineage Reference binding strengthening.

---

## C28-03 — `R9 → R11`

**Pinned endpoint blobs**

- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R9 explicitly distinguishes two successor-routing branches after source-authority/lineage failure:

1. an implementation/source-execution mistake may justify a fresh governed attempt from the same frozen source authority; and
2. only concrete technical evidence that the frozen Product/Architecture contract cannot be realized may route a substantive upstream contradiction into R11.

The explicitly rejected shortcut is `non-descendant commit → automatically ARCHITECTURE_CHALLENGE`.

R11 reciprocally requires corrective Build/repair/release obligations to preserve exact R9 source authority, preserve evidence/provenance supporting the successor decision, and avoid allowing artifact/source-integrity failure to masquerade as Product/Architecture contradiction.

The relationship and routing semantics are therefore explicit.

But R11's generic requirement to preserve "which evidence/provenance supports that successor decision" does not specifically require preservation of R9's own adjudication/routing record — the exact decision object stating that the source-lineage failure was classified as implementation error rather than upstream contradiction, or vice versa.

Raw source evidence and the R9 classification decision made from that evidence are distinct authoritative records.

### Required strengthening — exact R9 routing-decision binding

When an R9 source-authority/lineage adjudication creates or causes an R11 corrective obligation, the obligation/history must durably bind the exact R9 failure/routing decision record that justified the successor class.

> **R11 must preserve not only the source evidence and frozen R9 authority, but the exact R9 adjudication that classified which corrective branch was authorized.**

This is especially load-bearing because R9's two-branch split exists specifically to prevent a Git/source mistake from masquerading as architectural evidence, and to prevent genuine upstream impossibility evidence from being discarded as a routine implementation failure.

### Required fixture

1. Build B1 is frozen to source snapshot S1.
2. R9 observes source-lineage failure F1.
3. R9 adjudicates F1 as implementation/execution failure, not upstream contradiction, in routing record D1.
4. R11 obligation O1 is created for a governed successor attempt from S1.
5. O1 preserves exact S1 and exact R9 routing record D1.
6. Later failure F2 exists against S1 with concrete technical evidence supporting Architecture contradiction, producing routing record D2.
7. R11 creates distinct obligation O2 with F2/D2 provenance.
8. O1 cannot be reinterpreted as Architecture challenge merely because F2/D2 exists later.
9. O2 cannot use O1's prior implementation-failure routing record.
10. If D1 is later found misclassified, affected obligations can be identified exactly.
11. Same branch/repository identity cannot substitute for exact S1.
12. Any consequential successor attempt still passes R7/R8/R20.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R9 and R11 explicitly compose and the successor-routing responsibility is defined. The gap is exact durable decision-record preservation within that composition.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the normative behavior is determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R9 routing-decision binding strengthening.

---

## Batch C-28 adjudicated result

- `R20 → R11`: `CONSISTENT_CONSUMPTION` with required exact R20 decision-record binding strengthening.
- `R16 → R19`: `CONSISTENT_CONSUMPTION` with required exact R19 Lineage Reference binding strengthening.
- `R9 → R11`: `CONSISTENT_CONSUMPTION` with required exact R9 routing-decision binding strengthening.

All three findings are fixture-tier / representational strengthenings in the recurring exact-authoritative-record-binding family.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The standing count remains four.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The standing count remains one.
