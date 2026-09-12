# Phase C Batch 33 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-33  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 99 edges across 33 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R11 → R9`
- `R10 → R9`
- `R18 → R8`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing process rule — reciprocal edges must be independently classified before reusing an existing strengthening

Directed-edge coverage remains independent. The existence of a finding on `X → Y` does not permit a reviewer to skip `Y → X` or assume every later issue involving the same node pair is already covered.

A reciprocal edge may cite an already-established strengthening **only after independent review confirms that the apparent gap is the same underlying missing invariant**, not merely that the same two nodes are involved.

The required sequence is:

1. classify the reciprocal edge on its own terms;
2. identify any missing invariant exposed by that direction;
3. compare that invariant precisely with prior findings;
4. reuse an existing strengthening only if the invariant is materially the same;
5. otherwise record the new distinct finding.

> **Same node pair is not enough. Same underlying missing invariant, independently re-derived, is required before de-duplication.**

This preserves reciprocal-edge scrutiny without inflating defect counts by cloning one corpus defect into two directed-edge findings.

---

## C33-01 — `R11 → R9`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / integration

### Endpoint source evidence

R11 explicitly requires integrity/source/artifact corrective work to restore the exact applicable R9/R10 invariant and preserve the exact failed or superseded source authority rather than mutating history.

R9 independently distinguishes:

- immutable Build Source Snapshot authority;
- implementation/source-execution failure that may permit a fresh governed attempt from the same frozen snapshot; and
- substantive upstream contradiction that may route a higher-semantic corrective challenge to R11 only when supported by concrete technical evidence.

C28-03 previously established a specific missing invariant on the opposite direction: when an R9 failure/routing adjudication causes an R11 obligation, R11 must durably bind the exact R9 adjudication record, not merely the frozen source object and raw evidence.

### Standing framework

**Test A — causal / parallel truth:** for an R11 source-corrective obligation originating from R9, would that obligation exist unchanged without the applicable R9 failure/routing adjudication? **No.** That origin-binding gap is causally load-bearing.

**Test B — adjudication layer:** does R9 have a distinct authoritative routing/adjudication record beyond the Build Source Snapshot? **Yes.** The branch between implementation/source error and substantive upstream contradiction is a real adjudication distinct from the frozen source authority.

Independent review therefore re-derives the same origin-record-binding gap already recorded in C28-03. It is the **same underlying missing invariant**, so this reciprocal edge depends on C28-03 rather than creating a duplicate finding.

The separate ordinary source-authority question is also independently clean: R11 already requires preservation of the exact R9 source authority and governed successor source/artifact lineage.

### No second completion-record strengthening

The completion side does not require inventing a generic extra R9 “completion decision record.” For ordinary source repair, the governing authoritative object is the exact immutable R9 Build Source Snapshot / successor source object whose invariant has been restored.

Where a later separate R9 adjudication materially changes corrective scope, that adjudication remains subject to the exact-record rule already established in C28-03.

### Required fixture

1. R9 source S1 produces adjudication D1 that routes a source corrective obligation to R11.
2. R11 obligation O1 binds S1 and, per C28-03, exact D1.
3. Later R9 adjudication D2 cannot silently replace O1's originating provenance.
4. If the allowed correction is a fresh attempt from S1, exact S1 remains preserved.
5. If governed repair creates successor source S2, S2 is a distinct immutable R9 authority object.
6. O1 completion identifies the exact governed successor source/invariant restored.
7. Current HEAD cannot substitute for S1 or S2.
8. S2 cannot mutate S1's historical identity.
9. A failed Build/source attempt does not by itself create Product/Architecture contradiction authority.
10. A new separate R9 adjudication that changes corrective scope remains explicitly bound under the established exact-record rule.
11. Consequential corrective execution still passes R7/R8/R20.

### Disposition

Clean reciprocal consumption **with explicit dependency on the already-established C28-03 strengthening**. No new finding is added because independent review confirmed the gap is the same underlying origin-record-binding invariant.

---

## C33-02 — `R10 → R9`

**Pinned endpoint blobs**

- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** hard-chain source/artifact identity

### Endpoint source evidence

R10's canonical Artifact Version explicitly requires the exact Build identity and exact R9 Build Source Snapshot / source commit authority from which the artifact was produced.

R9 reciprocally requires its Build Source Snapshot to remain linkable to the exact Build/Artifact identity consumed by R10.

### Standing framework

**Test A — causal / parallel truth:** would Artifact Version P1 remain the same authoritative artifact lineage if its exact R9 source snapshot S1 were absent or replaced by S2? **No.** Exact source authority is constituent lineage.

**Test B — adjudication layer:** R9 has separate adjudication records in failure/routing cases, but those are not the authority object R10 consumes for normal artifact ancestry. R10 consumes the exact Build Source Snapshot itself.

The exact authoritative object is already explicitly bound. No additional generic R9 adjudication pointer is required merely because such decisions may exist elsewhere for the same repository/source family.

### Required fixture

1. R9 freezes S1 at exact source commit C1.
2. Build B1 consumes S1.
3. R10 creates Artifact Version P1 bound to B1/S1/C1.
4. Branch later advances to C2.
5. P1 remains bound to S1/C1.
6. Build B2 from S2/C2 creates P2.
7. P2 cannot substitute for P1 merely because repository/product/branch overlap exists.
8. QA and Release for P1 remain attributable to P1/S1.
9. Legacy P1 whose exact source cannot be proven remains incomplete rather than being linked to current HEAD.
10. A separate R9 routing decision concerning another Build does not become P1 ancestry merely because the repository overlaps.
11. R17/R19/R20 later preserve and evaluate the same exact chain.

### Disposition

Clean hard-chain consumption. No strengthening required.

---

## C33-03 — `R18 → R8`

**Pinned endpoint blobs**

- R18: `226d67276f1627c26045ead9c7717023e7e764db`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / external-boundary integration

### Endpoint source evidence

R18 explicitly separates predispatch capability-binding eligibility from post-boundary external-execution truth:

- R18 owns whether exact frozen binding B1 remains eligible before dispatch;
- R8 owns what happened once the provider boundary may have been crossed;
- postdispatch binding invalidation does not rewrite external truth;
- reconciliation/continuation of the same exact already-dispatched execution preserves original B1;
- a new retry/execution does not blindly inherit B1.

R18's Capability Binding Validation Record explicitly includes both `bindingId` and exact `executionId`, providing direct correspondence to the R8 execution object.

### Standing framework

**Test A — causal / parallel truth:** would R8 execution truth still need to exist unchanged if B1 later became invalid? **Yes.** External history remains true even after revocation, retirement, quarantine, or later discovery of authority failure.

Would R18 binding attribution still matter if R8 reports success? **Yes.** Technical success does not prove capability authority.

The two facts are parallel and independently authoritative.

**Test B — adjudication layer:** R8 has authoritative execution-outcome/reconciliation states, but R18 is not consuming one such disposition to manufacture binding authority. It needs exact correspondence to the execution whose truth R8 owns. That correspondence already exists through explicit `executionId` binding.

No generic extra pointer from every R18 validation to every possible R8 outcome record is required.

### Required fixture

1. Execution E1 is frozen to binding B1.
2. R18 validation V1 binds exact `executionId = E1` and B1.
3. Provider boundary is crossed.
4. R8 persists E1 external truth.
5. B1 later becomes revoked.
6. R18 preserves that E1 used B1; revocation does not rewrite R8 E1 as non-dispatched.
7. R8 `SUCCEEDED` does not prove B1 was valid.
8. If later evidence shows B1 was invalid at dispatch, preserve both E1 success and the authority-regression fact.
9. R8 uncertainty for E1 cannot be resolved by rebinding to current B2.
10. Read-only exact reconciliation remains tied to E1/B1 where explicitly permitted.
11. A new mutation after reconciliation receives new execution E2 and governed binding/revalidation.
12. Same logical capability/provider but different account cannot substitute.
13. `RECONCILED_NOT_DISPATCHED` closes E1; a later provider call uses E2.
14. R20 separately governs adoption/current consequential eligibility.

### Disposition

Clean exact-execution composition. No strengthening required.

---

## Batch C-33 result

- `R11 → R9`: clean reciprocal consumption, with explicit dependency on C28-03 after independent confirmation that the gap is the same underlying origin-record-binding invariant.
- `R10 → R9`: clean hard-chain source/artifact identity consumption.
- `R18 → R8`: clean exact-execution correspondence with parallel capability/external truths.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. No second `UNRESOLVED_CROSS_NODE_GAP` is added. No new strengthening is added.

The anti-double-counting rule is now precise: reciprocal edges are independently reviewed, and prior strengthenings are reused only when the newly reviewed edge re-derives the **same underlying missing invariant** rather than merely involving the same two nodes.
