# Phase C Batch 36 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-36  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 108 edges across 36 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R17 → R8`
- `R14 → R8`
- `R11 → R13`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — when exact execution identity belongs on the declaring node

C35-03 established that a node whose own record is defined in terms of one specific external execution outcome must durably bind the exact R8 execution identity that makes that record true.

C36 sharpens the boundary:

> **The exact-execution-binding requirement applies when the declaring node's own canonical record is defined in terms of a specific execution outcome. It does not automatically apply to every upstream authority object that may later participate in an execution.**

This is semantic, not merely architectural placement.

- R10's production deployment/adoption record must identify the exact R8 execution whose outcome established the observed deployment state, because that record's own correctness depends on knowing which execution produced it.
- R17's Offer Version/Grant does not depend on any execution having occurred. `O1/G1` may be fully specified and valid before any R8 execution exists. Exact Offer/Grant→execution correspondence is therefore represented downstream by R19's Commercial Authority Lineage Reference rather than being embedded into every R17 authority object.

The ownership observation and semantic test reinforce each other: R19 is the correct architectural owner because the cross-object correspondence becomes part of R19's own historical-lineage truth.

---

## C36-01 — `R17 → R8`

**Pinned endpoint blobs**

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** commercial / external-execution integration

`CONSUMES` is intentionally withheld.

### Endpoint source evidence

R17 owns immutable Offer Version and charging-Grant authority, including exact commercial provider/account scope and supersession history. R8 owns external execution truth. R17's own contract does not define Offer identity in terms of a specific execution attempt; an Offer/Grant can be complete before any execution occurs.

R19 explicitly owns the immutable historical correspondence among exact Offer/Grant, exact provider/account commercial operation, exact R8 execution identity, transaction, and financial evidence.

### Standing framework

**Test A:** would O1 remain O1 if no R8 execution had yet occurred? **Yes.** Would E1 external truth remain real if O1 were later superseded? **Yes.** These are parallel truths.

**Test B:** R8 outcome is the execution object's own state/history. But exact binding is required on the node whose own record is defined in terms of that outcome. R17's Offer/Grant is not.

### Required fixture

1. R17 creates O1 and exact charging Grant G1.
2. No R8 execution yet exists; O1/G1 remain fully specified authority objects.
3. Commercial operation later freezes R19 lineage L1 from O1/G1.
4. Exact R8 execution E1 is created.
5. L1 binds E1.
6. E1 becomes uncertain.
7. O1 is superseded by O2 before adoption.
8. R8 preserves E1 historical truth.
9. R17 preserves O1/G1 historical authority and O2 succession.
10. R20 may block new adoption/use under O1.
11. A later governed O2 operation receives its own lineage and execution E2.
12. E2 cannot rewrite E1.
13. R17 need not mutate O1/G1 to embed E1 merely to make the lineage auditable; R19 carries the exact correspondence.
14. A reversal/refund, if autonomously dispatched, receives its own governed R8 execution identity.
15. Same Offer/provider/account cannot collapse distinct execution attempts.

### Disposition

Clean composed commercial/execution seam. No strengthening. Exact execution identity belongs on R19's lineage record, not on the execution-independent R17 Offer/Grant object.

---

## C36-02 — `R14 → R8`

**Pinned endpoint blobs**

- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** runtime-handoff / external-truth continuity

### Endpoint source evidence

R14 explicitly requires unresolved external uncertainty to survive replacement under the **same exact R8 execution identity**. `EXTERNAL_EXECUTION_RECONCILIATION_REQUIRED` preserves that identity through handoff, and the successor must reconcile the same execution rather than create a fresh attempt merely because runtime ownership changed.

This is exact normative binding language, unlike a generic relational phrase.

### Standing framework

**Test A:** would an R14 handoff disposition for unresolved E1 remain correct if its exact R8 execution identity were substituted with E2? **No.** E1 is load-bearing.

**Test B:** R8 outcome/reconciliation state belongs to E1 itself. R14 therefore preserves exact E1 rather than needing a separate generic R8 disposition object.

### Required fixture

1. Incumbent owns R8 execution E1.
2. Provider boundary may have been crossed.
3. E1 is `OUTCOME_UNCERTAIN_RECONCILABLE`.
4. R14 replacement begins.
5. Incumbent stops new consequential claims.
6. E1 receives `EXTERNAL_EXECUTION_RECONCILIATION_REQUIRED`.
7. Handoff preserves exact E1.
8. Successor becomes authoritative under a new authority epoch.
9. Successor continues reconciliation of E1.
10. Runtime replacement alone must not create E2.
11. If E1 becomes `RECONCILED_NOT_DISPATCHED`, E1 closes.
12. Only a later governed provider call may create E2.
13. R7 exposure tied to E1 is not released merely because runtime ownership changed.
14. Provider/account cannot substitute during reconciliation.
15. A stale incumbent waking after transfer cannot resume consequential authority under the old epoch.

### Disposition

Clean direct exact-execution consumption. No strengthening.

---

## C36-03 — `R11 → R13`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R13: `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** corrective-liveness integration

`CONSUMES` is intentionally withheld.

### Endpoint source evidence

R11 owns what corrective obligation exists and why. R13 owns whether the executor responsible for runnable corrective work is healthy, progressing, stalled, failed, intentionally disabled, or unknown.

R11 explicitly states that obligation existence does not prove executor health and R13 health does not prove the obligation is semantically correct or authorized. R13 reciprocally preserves this separation.

### Standing framework

**Test A:** would R11 obligation O1 still exist if its responsible executor failed? **Yes.** Would R13 executor-health truth still exist if no O1 were currently due? **Yes.** The truths are parallel.

**Test B:** R13 health is its own canonical health-state truth. R11 does not need an exact R13 health-record pointer merely to establish O1 identity.

### Required fixture

1. R11 creates exact corrective obligation O1.
2. R12 materializes its governed runnable occurrence.
3. Required executor X is `FAILED` under R13.
4. O1 remains open and durably owned.
5. R13 failure must not mutate O1 into cancelled or completed.
6. X later returns `HEALTHY`.
7. Health restoration does not itself authorize O1 execution; all governing gates still apply.
8. X may remain healthy while no corrective obligation is due.
9. R11 cannot infer executor health from O1 progress claims alone.
10. R13 cannot infer semantic correctness/completion merely because X progressed.
11. If work is blocked by R7/R20 but X observes and persists the block, X may remain healthy/degraded under R13 policy.
12. If X silently stops observing due O1 work, R13 may classify stall/failure while O1 remains unchanged.
13. Restart preserves O1 independently from health history.
14. R14 replacement consumes R13 readiness separately from R11 corrective ownership.

### Disposition

Clean bilateral parallel composition. No strengthening.

---

## Batch C-36 result

- `R17 → R8`: clean composed seam; direct `CONSUMES` withheld; exact execution correspondence belongs to R19 because R17's own record is execution-independent.
- `R14 → R8`: clean direct exact-R8-execution preservation through runtime handoff.
- `R11 → R13`: clean parallel corrective-ownership / executor-liveness composition; direct `CONSUMES` withheld.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. No second `UNRESOLVED_CROSS_NODE_GAP` is added. No new strengthening is added.

The standing framework now explicitly limits exact-execution binding to nodes whose own canonical record is defined in terms of one specific external execution outcome, rather than propagating `executionId` onto every authority object that may eventually participate in execution.
