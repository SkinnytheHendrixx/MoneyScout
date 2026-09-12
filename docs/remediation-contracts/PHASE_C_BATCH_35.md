# Phase C Batch 35 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-35  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 105 edges across 35 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R18 → R7`
- `R19 → R8`
- `R10 → R8`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C35-01 — `R18 → R7`

**Pinned endpoint blobs**

- R18: `226d67276f1627c26045ead9c7717023e7e764db`
- R7: `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / joint-prerequisite integration

`CONSUMES` is intentionally withheld.

### Endpoint source evidence

R18 states explicitly that verified capability and reserved capacity are parallel prerequisites: a valid binding does not grant resource authority, and a valid reservation does not revive a revoked binding. Any successor/new execution after rebinding remains subject to ordinary R7/R8/R20 gates.

R7 reciprocally states that verified capability is not reserved entitlement and valid reservation is not verified capability; both must hold.

### Standing framework

**Test A — causal / parallel truth:** would R18 binding validity still exist if an associated R7 reservation did not exist? **Yes.** B1 may be a valid capability binding while scarce capacity is unavailable.

Would R7 reservation truth still exist if B1 later became invalid? **Yes.** The reservation remains a real reservation/exposure record whose lifecycle is governed by R7/R8/R20.

This is canonical parallel truth rather than direct semantic consumption.

**Test B — adjudication/state:** each node owns its own authority state. Neither node's canonical truth is produced by an adjudication from the other, so no direct exact-record pointer should be manufactured solely because a later consequential boundary requires both predicates.

### Required fixture

1. R6/R18 establish exact binding B1 as valid.
2. R7 denies scarce-resource reservation R1.
3. B1 remains valid; execution cannot dispatch.
4. Later R7 grants exact reservation R2.
5. Before dispatch, B1 becomes revoked.
6. R2 remains a real reservation/exposure record, but cannot revive B1.
7. R18 cannot treat R2 as capability proof.
8. R7 cannot treat `BINDING_VALID` as resource headroom.
9. If B1 is replaced with B2, existing R2 does not automatically become authority for B2 unless R7's own operation/resource lineage permits that exact correspondence.
10. If the reservation is already post-boundary/uncertain, B1 invalidation cannot simply release it.
11. New successor execution independently satisfies exact binding, exact reservation, R8, and R20.
12. R20 consumes both current predicates at the consequential boundary.

### Disposition

Clean bilateral parallel-prerequisite composition. No strengthening required. Direct `CONSUMES` remains withheld.

---

## C35-02 — `R19 → R8`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** commercial historical-lineage / execution attribution

### Endpoint source evidence

R19's Commercial Authority Lineage Reference must bind the exact commercial session/execution-attempt identity where applicable and the exact R8 external execution identity for a dispatched attempt.

Its dedicated R8 boundary further requires multiple external attempts to remain distinct even when they target the same Offer/customer/transaction intent.

### Standing framework

**Test A:** would commercial lineage L1 remain the same complete historical lineage if dispatched R8 execution E1 were substituted with E2? **No.** Exact execution identity is constituent lineage.

**Test B — outcome state vs separate adjudication:** R8's authoritative outcome is the execution object's own state/history. R19 therefore binds the exact execution object itself rather than inventing a second generic R8 disposition record.

R19 already does this explicitly.

### Ownership split

Exact execution identity inside lineage does not let R19 infer what happened externally. R8 remains owner of dispatch/outcome/reconciliation truth.

Conversely, an R8 success state does not prove that E1 belonged to complete authorized commercial lineage.

### Required fixture

1. R19 freezes lineage L1 before dispatch.
2. Commercial operation produces exact R8 execution E1.
3. L1 binds E1.
4. E1 becomes uncertain, then eventually `SUCCEEDED`.
5. R19 retains E1; it does not create a replacement execution identity from transaction existence.
6. A local retry creates E2 only when R8 semantics authorize a new attempt.
7. E2 cannot overwrite E1 inside historical lineage.
8. Same Offer/customer/payment intent does not merge E1 and E2.
9. Provider webhook for E1 does not by itself prove complete L1.
10. Complete L1 does not manufacture E1 success if R8 remains uncertain.
11. If E1 is `RECONCILED_NOT_DISPATCHED`, a later provider call receives E2.
12. R15 observations attach to the execution they actually describe.
13. R16 interpretation cannot reassign financial evidence from E1 to E2.
14. R20 separately decides current/adoption eligibility.

### Disposition

Clean direct exact-execution consumption. No strengthening required.

---

## C35-03 — `R10 → R8`

**Pinned endpoint blobs**

- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** deployment/adoption integration

`CONSUMES` is intentionally withheld because R10 artifact identity and R8 external-execution truth are parallel canonical truths rather than one being the semantic source of the other.

### Endpoint source evidence

R10 has a dedicated R8 boundary stating that external-execution truth and artifact identity are distinct. A provider deployment call may succeed while R10 still must prove which exact artifact was expected and observed; conversely, exact artifact identity can be valid while provider-side deployment outcome remains uncertain.

R10 further requires exact production deployment/adoption linkage, but the recovered contract does not name an exact R8 execution-identity field analogous to R18's explicit `verificationResultId` binding to R6.

R8 independently requires each fresh external call to receive a fresh execution identity.

### Standing framework

**Test A — causal / parallel truth:** would exact Artifact Version P1 remain P1 if deployment execution E1 failed or remained uncertain? **Yes.** Would E1 external truth still exist if P1 later proved to be the wrong artifact? **Yes.** The canonical truths are parallel.

**Test B — outcome state vs adjudication:** R8's outcome is the self-contained state/history of exact execution E1, not a separate adjudication object. Therefore the binding target is the exact R8 execution object itself.

### Required strengthening — exact R8 execution identity in R10 deployment/adoption lineage

The general phrase `exact production deployment/adoption linkage` is not sufficient to prove which R8 execution attempt produced the observed deployment state when multiple attempts exist.

Required invariant:

> **Every R10 production deployment/adoption record whose observed state depends on an external provider attempt must durably bind the exact R8 `executionId` whose authoritative outcome produced that observed-artifact determination. General deployment/adoption linkage, timestamps, provider identity, or inference from current state are insufficient.**

This is not a request for a second R8 disposition record. It is exact binding to the authoritative R8 execution object itself under the standing Test-B=`no` object-binding branch.

The strengthening is required because one artifact P1 may participate in multiple historically distinct deployment attempts E1, E2, ... and R8 requires each fresh call to have a fresh identity. R10 must therefore be able to answer, without inference, which exact attempt established the deployment observation being adopted.

### Required fixture

1. R10 has exact Artifact Version P1.
2. Deployment attempt E1 for P1 is created under R8.
3. E1 times out or remains `OUTCOME_UNCERTAIN_RECONCILABLE`.
4. A governed later attempt E2 is created with a fresh R8 execution identity.
5. E2 succeeds and authoritative provider evidence establishes observed deployment artifact P1.
6. R10's production deployment/adoption record binds exact `executionId = E2` as the attempt whose outcome established that observed deployment state.
7. The record must not be attributable ambiguously to either E1 or E2 through timestamps, provider name, Asset, Release, or current deployment pointer.
8. Historical E1 remains inspectable and unresolved/reconciled under its own R8 lifecycle; E2 does not overwrite it.
9. If E2 succeeds but observed artifact is P2, R10 blocks adoption despite technical success.
10. Exact expected/observed P1 identity does not manufacture E1 or E2 success when R8 remains uncertain.
11. Local timeout cannot turn E1 into failed/non-dispatched.
12. A new deployment call receives E3 rather than reusing E2.
13. R14 handoff preserves expected/observed artifact identity plus the exact R8 execution linkage for unresolved attempts.
14. R20 governs final adoption/current eligibility.
15. The audit must be able to answer directly: **which exact R8 execution produced this observed-artifact determination?** without reconstructing the answer from timestamps or surrounding records.

### Calibration

This is **not** `MISSING_REQUIRED_COMPOSITION`.

R10 and R8 clearly compose, and R10 explicitly requires deployment/adoption linkage. The gap is one level lower: the corpus does not require the linkage to identify the exact R8 execution attempt strongly enough to distinguish multiple attempts against the same artifact/release.

It is also not `UNRESOLVED_CROSS_NODE_GAP`: the required semantic outcome is determinate. The missing precision is executable/auditable exact-object correspondence.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact-R8-`executionId` deployment/adoption strengthening.

---

## Batch C-35 result

- `R18 → R7`: clean bilateral parallel-prerequisite composition; direct `CONSUMES` withheld.
- `R19 → R8`: clean direct exact-execution lineage binding.
- `R10 → R8`: consistent parallel artifact/execution composition with required exact R8 `executionId` binding in the production deployment/adoption record.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. No second `UNRESOLVED_CROSS_NODE_GAP` is added.

C35 adds one required strengthening: R10 deployment/adoption history must identify the exact R8 execution attempt whose authoritative outcome established the observed deployment artifact, rather than relying on a generic linkage that may become ambiguous across E1/E2 retries or successor attempts.
