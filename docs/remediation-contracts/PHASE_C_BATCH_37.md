# Phase C Batch 37 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-37  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 111 edges across 37 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged  
**Implementation authority:** SUSPENDED

This batch classifies:

- `R19 → R4`
- `R8 → R7`
- `R5 → R11`

All three edges were mechanically confirmed `UNCLASSIFIED` in the C-36 classification index before selection. All endpoint blobs match the frozen inventory.

The topology hygiene overlay `PHASE_C_TOPOLOGY_HYGIENE_CORRECTION_C29_C31.md` governs the prior C29-03/C30-01/C31-03 metadata corrections. No noncanonical topology value is introduced here.

---

## C37-01 — `R19 → R4`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R4: `907e44ccb1128dabb142164e713877596901c3f2`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** hard-chain historical-lineage integrity

### Endpoint source evidence

R19's canonical commercial path includes the exact originating Evaluation Cycle, and its immutable Commercial Authority Lineage Reference / composite fingerprint must bind exact originating Opportunity / Evaluation Cycle / Bet / Product authority. R19's dedicated R4 boundary requires the exact originating cycle rather than current/latest cycle.

R4 reciprocally requires enough immutable lineage identity for R19 commercial fingerprints to preserve the exact originating evaluation lineage and identifies R19 as a downstream lineage consumer.

### Standing-framework analysis

**Test A — causal / parallel truth:** Would commercial lineage L1 remain the same authoritative lineage if originating cycle A were replaced by current cycle B? **No.** Exact R4 Evaluation Cycle identity is constituent historical authority.

**Test B — adjudication layer:** The R4 truth consumed here is the immutable Evaluation Lineage Reference / exact originating cycle plus its governing lineage semantics. R19 is not consuming a separate later R4 adjudication record to create L1; it is preserving the exact historical R4 authority object that belongs inside L1.

**Exact-authoritative-object check:** R19 explicitly binds that object. No strengthening is required.

### Composite-path consistency

This edge remains subject to the C22 composite-path rule. It is not sufficient for the R4 cycle, R9 source, R10 artifact, and R17 Offer segments to each be individually valid. The separately represented historical authority segments must belong to the same actual path that produced and authorized the commercial lineage.

### Required fixture

1. Opportunity has Evaluation Cycle A.
2. Bet B1 originates under A.
3. Build/source/artifact/Offer chain proceeds from B1/A.
4. R19 freezes lineage L1 containing exact A.
5. Cycle B later becomes current.
6. L1 remains bound to A.
7. B cannot substitute for A merely because it is current.
8. Current Opportunity/Bet/Asset state cannot reconstruct A.
9. A separate historically valid lineage L2 under B may coexist.
10. L1 and L2 remain independently addressable.
11. An L1 fingerprint containing cycle A but an R9/R10/R17 path actually produced under B fails composite-path consistency.
12. Legacy lineage with ambiguous A/B origin remains `LEGACY_UNPROVEN`.
13. Later-valid B cannot retroactively legitimize an effect that lacked the required historical authority at execution time.
14. R20 separately evaluates whether exact L1 is currently eligible.

### Disposition

Clean direct hard-chain consumption. No strengthening required.

---

## C37-02 — `R8 → R7`

**Pinned endpoint blobs**

- R8: `237c752671573013d090e2eacf7c2af4c0e70512`
- R7: `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / reservation-external-truth integration

### Endpoint source evidence

R8 requires that pre-dispatch exposure may be released only from R8-authoritative proof of non-dispatch; post-boundary uncertainty keeps exposure conservative; reconciliation determines whether retry/release is safe; and reconciliation work that consumes scarce resources remains subject to R7.

R7 reciprocally requires exact Economic Action / reservation / execution linkage, keeps reservations held through external uncertainty, and permits release only from authoritative evidence that exposure is safe to return.

`CONSUMES` is justified even though the primary semantic data flow at release time is R7 consuming R8 truth. The Phase C protocol defines `CONSUMES` as semantic data flow rather than frozen-edge direction syntax.

### Standing-framework analysis

**Test A:** Would an R7 release decision remain valid if exact execution E1 changed from `RECONCILED_NOT_DISPATCHED` to `OUTCOME_UNCERTAIN_RECONCILABLE`? **No.** Exact R8 execution truth is load-bearing to release.

Would R8 E1 outcome itself cease to exist if R7 reservation state were absent? **No.** External truth and reservation truth retain distinct ownership.

This is therefore a composed seam in which release causally consumes an independently owned R8 fact.

**Test B:** R8's authoritative outcome is the exact execution object's own lifecycle state, not a separate generic adjudication object. The binding target is exact E1 and its authoritative R8 state.

Both endpoint contracts already impose exact reservation↔execution correspondence strongly enough to satisfy that requirement.

### Reciprocal-edge anti-double-counting check

This edge was independently reviewed rather than inherited from C04-01.

The reciprocal review re-establishes the same complete seam:

- exact reservation ↔ exact execution;
- release only on authoritative non-dispatch / settlement truth;
- uncertainty retains exposure.

No different missing invariant is exposed from the R8-declaring direction. Therefore no duplicate strengthening is created.

### Required fixture

1. R7 creates reservation R1 for exact execution E1.
2. E1 exists durably under R8 before dispatch.
3. Worker dies before local certainty exists.
4. Local process death does not release R1.
5. R8 later proves `E1 = RECONCILED_NOT_DISPATCHED`.
6. R7 may release R1 only if its remaining release predicates pass.
7. If R8 instead says `OUTCOME_UNCERTAIN_RECONCILABLE`, R1 remains conservative.
8. If E1 becomes `SUCCEEDED`, reservation settles according to actual consumption/economic truth rather than being released as unused.
9. E2 for the same logical job cannot satisfy R1's E1 release history.
10. Lease expiry cannot substitute for R8 non-dispatch proof.
11. Cancellation intent cannot substitute for authoritative `CANCELLED`.
12. Runtime replacement cannot manufacture release.
13. Recovery urgency cannot bypass R7 admission for reconciliation work.
14. `RECONCILED_NOT_DISPATCHED` closes E1; a later external call uses fresh execution identity E2.

### Disposition

Clean bilateral composition. No new strengthening required. The reciprocal result is independently earned.

---

## C37-03 — `R5 → R11`

**Pinned endpoint blobs**

- R5: `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** confirmation / corrective-ownership integration

### Endpoint source evidence

R5 determines whether a material conclusion is `CONFIRMED`, `CHALLENGED`, or `INCONCLUSIVE`. Where challenge/inconclusive leaves work unresolved, R11 owns durable successor/revision/corrective obligation semantics. R5 does not itself gain authority to manufacture the successor execution path merely because it rejected or could not confirm a candidate.

R11 reciprocally consumes R5 where material successor classification or completion requires independent confirmation.

### Reciprocal-edge / anti-double-counting analysis

C27-02 already established that when an R11 corrective obligation depends on R5 confirmation, R11 must durably bind the exact R5 confirmation/verifier record rather than merely record that a review occurred.

C37-03 independently asks whether the R5-declaring direction exposes a different missing invariant.

**Test A — R5 record completeness:** Would exact R5 record C1 remain fully defined if no R11 corrective obligation had yet been created? **Yes.** R5 can finish `CHALLENGED` or `INCONCLUSIVE` before R11 materializes any successor obligation.

Therefore R5's own canonical confirmation record does not require an R11 obligation identity to be semantically complete.

**Corrective transition check:** Would an R11 obligation originating from R5 `CHALLENGED` remain correctly attributable if exact R5 record C1 were substituted by C2? **No.** But that is the same specific missing invariant already established in C27-02: the R11 obligation must bind exact originating R5 confirmation/verifier record.

Under the C33 anti-double-counting rule, the reciprocal edge may cite that prior strengthening only after independently confirming it is the same underlying invariant. This review does so.

### Why C32-03 reverse traceability does not create a new R5 pointer requirement

C32-03 required reverse enumeration because R11 itself claims a no-duplicate corrective-work convergence property across R12 runnable occurrences. That invariant could not be audited without grouping occurrences by exact originating R11 obligation.

R5 makes no equivalent claim that its immutable confirmation record must enumerate downstream R11 consumers. The needed auditability is already available once R11 carries the exact origin binding required by C27-02: every R11 obligation originating from C1 can be queried by that bound R5 identity.

Mutating or extending immutable R5 record C1 with future R11 obligation IDs is therefore unnecessary.

### Required fixture

1. Material candidate M1 receives R5 confirmation record C1 = `CHALLENGED`.
2. C1 is immutable and complete before any R11 successor exists.
3. R11 deterministically creates corrective obligation O1.
4. Per C27-02, O1 binds exact C1.
5. Later R5 record C2 reevaluates the same candidate after new evidence.
6. C2 cannot replace O1's originating C1 provenance.
7. Repeated recovery from the same durable C1 condition converges on the same R11 obligation rather than producing duplicate O2/O3 work.
8. R5 does not select repair vs redesign beyond the scope of its actual confirmation judgment.
9. R11 does not treat existence of review as PASS.
10. `INCONCLUSIVE` remains unresolved rather than being normalized into confirmation.
11. Later `CONFIRMED` C3 may satisfy a governed completion predicate only if it addresses the exact applicable claim/scope and R11 completion rules permit it.
12. C3 does not rewrite historical C1.
13. R5 record C1 need not be retroactively mutated to contain O1.
14. Every R11 obligation originating from C1 remains discoverable through its exact origin binding.

### Disposition

Clean reciprocal consumption subject to the already-established C27-02 exact-R5-record strengthening. No second strengthening is created.

---

## Batch C-37 adjudicated result

- `R19 → R4`: clean direct hard-chain `CONSISTENT_CONSUMPTION`; exact R4 originating lineage explicitly bound.
- `R8 → R7`: clean bilateral `CONSISTENT_CONSUMPTION`; exact reservation/execution correspondence and authoritative release truth already explicit.
- `R5 → R11`: clean reciprocal `CONSISTENT_CONSUMPTION`; independent review re-derives the same underlying exact-R5-origin-record gap already governed by C27-02, so no duplicate strengthening is created.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The standing total remains **4**.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The standing total remains **1**.

No new fixture-tier strengthening is added in this batch.

## Invalidation

Any endpoint blob change invalidates the affected edge result under the frozen Phase C invalidation rule.
