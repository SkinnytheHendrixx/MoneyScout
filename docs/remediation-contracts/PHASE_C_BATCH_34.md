# Phase C Batch 34 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-34  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 102 edges across 34 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R17 → R9`
- `R19 → R9`
- `R20 → R8`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — self-contained outcome state vs separate adjudication act

The Test-B distinction is refined to ask what kind of authority is being represented:

1. **Self-contained outcome/state:** the authoritative fact is a lifecycle/outcome state of the object itself. Fact-finding may determine that state, but no second judgment object is required merely because a process was needed to learn the truth.
2. **Separate adjudication act:** an otherwise-fixed object is the subject of a distinct classificatory judgment or disposition whose identity matters independently because that judgment selects among materially different downstream consequences.

R8 is the worked positive example of the first case. `SUCCEEDED`, `FAILED`, `CANCELLED`, `RECONCILED_NOT_DISPATCHED`, and the uncertainty states are states of the exact execution attempt. Reconciliation is fact-finding into what happened to that execution. It does not independently decide the corrective successor; R11 owns downstream corrective disposition.

R9 is the worked contrast. A frozen Build Source Snapshot remains an immutable source object while a separate routing/adjudication act can classify a `SOURCE_LINEAGE_VIOLATION` as implementation/source error versus evidence of substantive upstream contradiction, with materially different successor consequences. That judgment therefore requires its own record identity when causally load-bearing.

> **An object's own authoritative terminal/outcome state is not automatically a second adjudication record. A distinct classificatory act performed on an otherwise-fixed object is.**

The distinction is semantic, not merely storage-based. An implementation cannot evade record-binding requirements by storing a genuine adjudication in the same table, nor manufacture an extra adjudication requirement merely because fact-finding was required to determine an object's own state.

---

## C34-01 — `R17 → R9`

**Pinned endpoint blobs**

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / hard-chain integration

`CONSUMES` is intentionally withheld.

### Endpoint source evidence

R17 requires immutable R9 source/build authority but states explicitly that it consumes exact R9 source lineage **through R10**. Its direct immutable binding is to exact R10 production Artifact Version and Release/deployment identity.

R9 reciprocally names the hard chain and requires R17 commercial authority ultimately to trace to the production artifact/release derived from exact authorized source.

### Standing framework

**Test A — causal / parallel truth:** would Offer O1 remain the same valid commercial authority if its production artifact's governing R9 source lineage were absent, mutable, or substituted? **No.** R9 lineage is load-bearing.

That does not make the relationship direct. The declaring R17 contract explicitly supplies the mediator: R10.

**Test B — adjudication layer:** R9 has separate failure/routing adjudications, but those are not the ordinary source authority R17 consumes when forming Offer lineage. R17 consumes source lineage as carried by exact R10 artifact identity.

### Required fixture

1. R9 freezes source S1.
2. R10 builds/verifies/releases P1 from S1.
3. R17 creates O1 bound to exact P1/R1.
4. Through P1, O1 traces to S1.
5. Repository state later advances to S2.
6. O1 remains P1/S1.
7. P2 from S2 cannot silently rewrite O1.
8. If P2 succeeds P1, R17 commercial-equivalence/successor rules govern.
9. Same Product, Asset, repository, or branch does not establish source equivalence.
10. An R9 routing decision for another Build does not become O1 authority through repository overlap.
11. If P1's governing R9 source is unproven, downstream commercial authority cannot become stronger merely because O1 exists.
12. R20 independently determines current eligibility.

### Disposition

Clean mediated hard-chain composition. No strengthening required. Direct `CONSUMES` remains withheld because the contract explicitly routes R9 lineage through R10.

---

## C34-02 — `R19 → R9`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** hard-chain historical-lineage integrity

### Endpoint source evidence

R19's canonical commercial path explicitly includes `R9 Build Source Snapshot / Build → R10 Artifact Version`, and its immutable Commercial Authority Lineage Reference/composite fingerprint must bind the exact R9 Build Source Snapshot / Build identity.

R19 separately prohibits current branch, current HEAD, mutable tags, or reconstructed current state from substituting for the source authority that actually produced the commercialized artifact.

### Standing framework

**Test A:** would lineage L1 remain the same complete commercial lineage if its exact R9 source snapshot S1 were absent or substituted with S2? **No.** S1 is a constituent lineage identity.

**Test B:** R9 has separate failure/routing adjudications, but R19's normal source-lineage segment is the Build Source Snapshot / Build authority object itself. Under the standing object-binding branch, R19 must bind that exact object.

It already does so explicitly.

### Required fixture

1. R9 freezes S1 for Build B1.
2. R10 produces P1 from B1/S1.
3. R19 freezes L1 containing exact B1/S1 and P1.
4. Later S2/P2 exists for the same Product/Asset.
5. L1 remains B1/S1/P1.
6. Current HEAD cannot substitute for S1.
7. Same repository/branch does not establish same source authority.
8. If S1 becomes `SOURCE_AUTHORITY_UNPROVEN`, L1 cannot remain complete merely because downstream Offer/transaction records exist.
9. L1 containing source S1 but artifact P2 from S2 fails composite-path consistency.
10. Deterministic legacy reconstruction may restore S1 only from authoritative historical evidence.
11. Ambiguous legacy source keeps lineage unproven.
12. Later valid S2 cannot retroactively authorize an earlier effect that lacked required S1 authority.
13. R20 separately evaluates current eligibility of L1.

### Disposition

Clean direct hard-chain consumption. No strengthening required.

---

## C34-03 — `R20 → R8`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** boundary/adoption integration

### Endpoint source evidence

R20 explicitly consumes exact R8 external-execution truth. At adoption boundaries, it must preserve external history even when another current predicate blocks adoption.

R8 owns the exact execution attempt and its authoritative lifecycle/outcome truth. R20 owns whether the result of that exact execution may be consumed/adopted now.

### Standing framework

**Test A — causal / parallel truth:** would R8 execution truth E1 still exist unchanged if a later R20 adoption decision D1 never existed or were invalid? **Yes.** External history exists independently.

Would an R20 decision whose predicate set includes external-execution truth remain the same if the applicable R8 state for E1 changed? **No.** R8 truth is load-bearing when that boundary consumes it.

These statements are compatible: R8 truth is independently owned, while an R20 decision may depend on it.

**Test B — outcome state vs separate adjudication:** R8's authoritative outcomes are self-contained lifecycle/outcome states of the exact execution attempt. Reconciliation is fact-finding into what happened to E1; it does not add a second successor-classification axis. Corrective successor judgment belongs downstream to R11.

`RECONCILED_NOT_DISPATCHED` therefore does not become a separate adjudication object merely because reconciliation was required to establish it.

### Exact-object binding

Under the Test-B=`no` branch, R20 must remain attributable to the exact R8 execution whose authoritative state was consumed. It must not substitute job identity, Asset identity, provider identity, or a latest-execution projection.

R20 already requires exact operation/boundary identity, observed predicate outcomes, evidence/provenance where required, and exact external-execution truth.

No generic second `R8DispositionId` strengthening is justified.

### Required fixture

1. R8 execution E1 exists durably before dispatch.
2. E1 crosses the provider boundary.
3. R8 establishes `E1 = SUCCEEDED`.
4. R20 performs adoption decision D1 for exact E1.
5. D1 consumes E1's authoritative external truth with every other applicable predicate.
6. E2 for the same Asset/provider cannot substitute for E1.
7. If O1 is superseded after E1 succeeds but before adoption, preserve `E1 = SUCCEEDED` while D1 may deny adoption.
8. D1 denial cannot rewrite E1 to `FAILED`.
9. If E1 remains `OUTCOME_UNCERTAIN_RECONCILABLE`, R20 cannot treat it as success because other predicates pass.
10. `RECONCILED_NOT_DISPATCHED` closes E1; any later provider call uses E2.
11. A prior R20 `ALLOW` cannot be reused for a different external execution.
12. Later correction showing authority failure creates governed regression/remediation without rewriting R8 history.
13. Current-valid authority cannot convert an earlier uncertain or unauthorized execution into historically authorized success.
14. R15/R16 remain separate owners of financial truth where financial consequences exist.

### Disposition

Clean direct consumption of exact external-execution truth. No strengthening required.

---

## Batch C-34 result

- `R17 → R9`: clean mediated hard-chain composition through R10; direct `CONSUMES` withheld.
- `R19 → R9`: clean direct exact-source lineage consumption.
- `R20 → R8`: clean direct exact-execution truth consumption; R8 outcome is the execution object's own authoritative state, not a separate downstream-classifying adjudication record.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. No second `UNRESOLVED_CROSS_NODE_GAP` is added. No new strengthening is added.

The standing Test-B framework now explicitly distinguishes an object's own authoritative terminal/outcome state from a separate adjudication act performed on that object, with R8 fact-finding and R9 routing as the worked contrast.
