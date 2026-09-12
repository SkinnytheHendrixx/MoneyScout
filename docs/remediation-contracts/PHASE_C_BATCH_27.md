# Phase C Batch 27 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-27  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 81 edges across 27 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R10`
- `R11 → R5`
- `R14 → R12`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C27-01 — `R20 → R10`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Endpoint source evidence

R20 explicitly consumes `R10 exact artifact identity` and requires exact `R4/R9/R10/R17/R19` lineage completeness and integrity among its boundary predicates. R10 reciprocally defines the boundary: R10 provides immutable artifact/lineage identity, while R20 decides whether that exact identity may still be consumed now.

R20 must revalidate the bound artifact identity rather than substitute current production state. A historically valid artifact remains historical truth even if it later becomes ineligible for new adoption.

### Acceptance fixture

1. Build produces exact Artifact Version `P1`.
2. QA verifies P1.
3. Release/deployment lineage remains bound to P1.
4. Current production later moves to P2.
5. R20 evaluates a consequential action whose bound historical artifact is P1.
6. R20 validates P1, not current P2.
7. If the action is bound to P1 but observed deployment is Q/P2, R20 cannot normalize the mismatch by substituting current deployment state.
8. Conversely, P1 being historically valid does not force `ALLOW`; another R20 predicate may fail.
9. Current P2 eligibility cannot repair incorrect P1 historical lineage.
10. R20 may deny adoption while R10 continues to preserve P1 as historical artifact truth.

### Disposition

Clean direct consumption. No new strengthening required.

---

## C27-02 — `R11 → R5`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R5: `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R11 explicitly separates completion proposal from authoritative completion. Where R5 applies, R11 must consume R5 before treating a material corrective completion or successor classification as authoritative; `CHALLENGED` and `INCONCLUSIVE` keep the obligation open.

R5 reciprocally defines the `R5 × R11` seam: R5 owns independent confirmation/challenge of the exact material candidate, while R11 owns the executable corrective successor/revision path.

However, R11 preserves the confirmation **process** without requiring durable preservation of the exact R5 confirmation **record** that authorized closure. R11 §4 requires evidence/provenance supporting a successor decision, and §§8/14 correctly require R5 confirmation behavior, but no field-level rule requires the obligation to retain the exact R5 confirmation-record identity/fingerprint, evidence snapshot, or confirmation timestamp used to close it.

### Required strengthening — exact R5 confirmation-record binding

When a material R11 successor or completion becomes authoritative through R5, the R11 obligation/history must durably bind the exact R5 confirmation record that authorized that transition.

> **R11 must preserve which exact R5 confirmation closed the material proposal, not merely the fact that a confirmation process occurred.**

The binding must identify the exact confirmation record/fingerprint and its reviewed candidate/evidence/lineage. Where R5 permits a deterministic authoritative-verifier path because the claim is fully reducible to deterministic facts, R11 must instead preserve the exact deterministic-verifier record identity/provenance that authorized closure.

### Required fixture

1. R11 owns corrective obligation O1 with completion predicate CP1.
2. Executor produces material completion proposal `PC1`.
3. R5 review is required.
4. R5 confirmation `RC1` binds exact O1 / PC1 / evidence snapshot / lineage / candidate fingerprint.
5. `CONFIRMED(RC1)` may satisfy the confirmation layer only if CP1 itself is also satisfied.
6. R11 durably records that RC1, not merely a generic `confirmed=true`, authorized material closure.
7. Confirmation of another proposal PC2 cannot close O1/PC1.
8. Material mutation of PC1 or its evidence invalidates transfer of RC1.
9. `CHALLENGED(PC1)` keeps O1 open.
10. `INCONCLUSIVE(PC1)` keeps O1 open.
11. If RC1 is later discovered mismatched, invalid, or attached to the wrong candidate, the historical record can identify exactly which closure relied on RC1.
12. R11 cannot convert challenge into a different successor without a governed successor/adjudication path.
13. R5 confirmation does not itself grant R20 execution authority for consequential remediation.
14. A deterministic-verifier closure path preserves the exact verifier record identity instead of a generic success bit.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`. R11 and R5 explicitly compose, ownership is clear, and the normative result is determinate. The missing precision is durable exact-record binding inside an existing relationship.

It is also not `UNRESOLVED_CROSS_NODE_GAP`; there is no competing coherent interpretation of the desired behavior.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact-confirmation-record binding strengthening.

---

## C27-03 — `R14 → R12`

**Pinned endpoint blobs**

- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`
- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `UNILATERAL_DECLARATION`

**Certification dependency strength:** operational/joint-fixture

### Endpoint source evidence

R14 explicitly consumes R12 durable obligations: due/runnable obligations must survive handoff; the successor must observe/reconstruct the exact durable obligations that remain valid; process-local queue state is not authoritative.

R12 reciprocally includes R14 in E2E certification and owns the canonical durable runnable occurrence/claim identity for those obligations.

The relationship is present, but R14 does not explicitly require preservation of the exact logical R12 runnable-occurrence identity/claim history across handoff. Preserving the domain obligation alone is insufficient when duplicate runnable occurrences can emerge.

This is the reciprocal expression of the strengthening already established at C23-03 (`R12 → R14`). Reciprocal frozen edges are independently classified; the same underlying requirement must hold from R14's declaring/consuming side.

### Required strengthening — runnable-occurrence continuity through handoff

Where an R12 runnable occurrence already exists before R14 handoff, transfer/recovery must preserve enough exact occurrence identity/history to prevent the successor from independently materializing a second logical occurrence for the same still-live work.

The implementation must distinguish:

- transfer/reclaim/continue the **same logical occurrence**; versus
- create a **new successor occurrence** under explicit governed R12 successor semantics.

### Required fixture

1. Durable domain obligation D1 exists.
2. R12 materializes logical occurrence O1.
3. O1 is pending or claimed under incumbent runtime A.
4. R14 begins replacement.
5. A reaches a transferable handoff state for D1/O1.
6. Successor B observes D1.
7. B must not create O2 merely because D1 still exists.
8. If O1 is transferred/reclaimed, B preserves/converges on O1's exact logical occurrence identity/history.
9. If a genuinely new O2 is required, O2 is explicitly related to O1 under R12 successor semantics.
10. Claim/lease identity may change with runtime ownership, but claim change alone must not manufacture a new logical occurrence.
11. If O1 may have crossed an external boundary, R8 governs before any replay.
12. If O1 was proven abandoned pre-dispatch, a successor occurrence may be created only under the governed R12/R14 path.
13. Old runtime A cannot revive O1 under stale R14 authority after fencing.
14. New runtime B becoming authoritative does not legitimize a duplicate O2 merely because A is retired.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R14 explicitly owns the handoff and explicitly requires R12 durable obligations to survive it. The missing precision is occurrence identity continuity within that existing composition.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the intended behavior is determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required runnable-occurrence continuity strengthening, reciprocal to C23-03.

---

## Batch C-27 adjudicated result

- `R20 → R10`: clean `CONSISTENT_CONSUMPTION`.
- `R11 → R5`: `CONSISTENT_CONSUMPTION` with required exact R5 confirmation-record binding strengthening.
- `R14 → R12`: `CONSISTENT_CONSUMPTION` with required runnable-occurrence continuity strengthening.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The standing count remains four.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The standing count remains one.
