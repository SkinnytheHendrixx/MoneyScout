# Phase C Batch 38 — Risk-Tiered Completion Sweep

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-38  
**Edges classified:** 12  
**Cumulative Phase C count after this batch:** 123 edges  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged  
**Implementation authority:** SUSPENDED

This is the first accelerated risk-tiered tranche. Acceleration changes packaging, not the classification standard: every edge is still independently reviewed against both endpoint contracts, the standing exact-record/object-binding tests, reciprocal-edge anti-double-counting rules, and frozen inventory.

## Acceleration-method amendment — reciprocal dependency scan is mandatory

The first adversarial review of the accelerated method exposed a process risk: a compressed reciprocal edge can correctly re-derive its primary classification while failing to carry forward a live fixture/strengthening established on the opposite directed edge.

Therefore, for every future accelerated reciprocal or precedent-controlled edge, review must separately ask:

1. what is the independently derived primary classification for this directed edge?
2. does the opposite directed edge or controlling precedent carry any still-live strengthening, fixture, negative control, or unresolved dependency relevant to this same node pair?
3. if yes, explicitly cite/carry that dependency forward even when no new finding is created;
4. do not treat absence of a new strengthening as permission to omit an existing governing requirement.

> **Acceleration may compress prose. It may not compress dependency visibility.**

---

## C38-01 — `R17 → R4`

**Pinned endpoint blobs:** R17 `16a234e897fe6e119392707a7187a3232f0fd972`; R4 `907e44ccb1128dabb142164e713877596901c3f2`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R17 Offer/Grant authority binds exact originating R4 Evaluation Cycle. Independent reciprocal review re-derives the same underlying composite-path invariant already established by C22-01: individually valid R4/R9/R10/R17 fields are insufficient unless they belong to the same actual historical path.

**Disposition:** clean subject to the existing C22-01 composite-path strengthening; no duplicate finding.

---

## C38-02 — `R9 → R4`

**Pinned endpoint blobs:** R9 `0ef14b00a1569ae649fe064aadecb498a2bc71e6`; R4 `907e44ccb1128dabb142164e713877596901c3f2`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R9 Build Source Snapshot directly carries exact originating R4 lineage; current/latest cycle cannot substitute. Build restart or successor activity preserves the historical cycle of the exact frozen source authority.

**Disposition:** clean direct historical-lineage consumption.

---

## C38-03 — `R7 → R6`

**Pinned endpoint blobs:** R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`; R6 `d4d613a40eed187c230d55f7e21b1b0251bf612a`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

Capability proof and scarce-resource reservation are parallel prerequisites. A valid capability does not create a reservation; a valid reservation does not prove capability readiness.

**Disposition:** clean parallel-prerequisite composition.

---

## C38-04 — `R12 → R7`

**Pinned endpoint blobs:** R12 `7a4a186fc2fd030d6ee52725b1111395597ffa90`; R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

R12 runnable occurrence exists independently before R7 admission. Independent reciprocal review re-derives C24-03's exact reservation↔runnable-occurrence correspondence requirement: when R7 admits work, the reservation must identify the exact occurrence, but R12 need not mutate an already-complete occurrence to point prospectively at a later reservation.

**Disposition:** clean subject to existing C24-03; no duplicate strengthening.

---

## C38-05 — `R12 → R8`

**Pinned endpoint blobs:** R12 `7a4a186fc2fd030d6ee52725b1111395597ffa90`; R8 `237c752671573013d090e2eacf7c2af4c0e70512`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Reconciliation scheduling must preserve the exact unresolved R8 execution identity; repeated scheduler recovery cannot manufacture a fresh external retry and lease expiry cannot establish replay safety.

**Disposition:** clean reciprocal exact-execution composition; no new strengthening.

---

## C38-06 — `R15 → R7`

**Pinned endpoint blobs:** R15 `1b46aa43f33c19e75ef0696286693592fbbf8c77`; R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

Provider-originating financial observation is independent truth: it must remain exact even when R7 reservation authority was absent, insufficient, or exceeded. R15 therefore cannot clamp observed reality to an authorized reservation amount.

**Carried-forward reciprocal dependency:** C09-03 (`R7 → R15`) remains governing for the missing-financial-evidence case. Its required fixture/strengthening requires durable ownership of unresolved/missing provider-financial evidence so headroom cannot move merely because no convenient R15 row exists. This edge creates no new fixture but does not supersede or hide C09-03.

**Disposition:** clean parallel truth, subject to C09-03's live missing-financial-evidence durable-owner fixture.

---

## C38-07 — `R15 → R8`

**Pinned endpoint blobs:** R15 `1b46aa43f33c19e75ef0696286693592fbbf8c77`; R8 `237c752671573013d090e2eacf7c2af4c0e70512`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Every consequential R15 provider-financial observation must bind the exact R8 execution identity. R8's own execution state remains separate from financial observation truth.

**Carried-forward reciprocal dependency:** C07-02 (`R8 → R15`) remains governing. Its required fixture prohibits using even a valid, exact R15 financial observation by itself to promote R8 execution state to `SUCCEEDED`, `FAILED`, `CANCELLED`, or `RECONCILED_NOT_DISPATCHED`. R8-authoritative external-boundary truth remains required.

**Disposition:** clean direct exact-execution provenance, subject to C07-02's live non-promotion fixture.

---

## C38-08 — `R16 → R7`

**Pinned endpoint blobs:** R16 `7dd92976f68ee90540771b3710e42b6d5b7f396f`; R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

R16 canonical financial truth may inform R7 settlement/release, but R16 does not create resource authority. Even an authoritative downward correction does not itself release headroom; R7 applies its own release rules.

**Disposition:** clean parallel financial-truth/resource-authority composition.

---

## C38-09 — `R16 → R8`

**Pinned endpoint blobs:** R16 `7dd92976f68ee90540771b3710e42b6d5b7f396f`; R8 `237c752671573013d090e2eacf7c2af4c0e70512`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

R16 binds canonical financial interpretation to exact R8 execution identity through R15 provenance where applicable. The intentional mediator is part of the contract and must preserve exact identity.

**Carried-forward reciprocal dependency:** C19-01 (`R8 → R16`) remains governing. Its shared/account-level observation fixture prohibits R16 from opportunistically attaching provider/account financial evidence to whichever exact execution happens to be under reconciliation. Evidence that is not deterministically execution-attributable must remain shared/unallocated, including `UNALLOCATED_SHARED_COST` where applicable.

**Disposition:** clean mediated composition, subject to C19-01's live shared-observation attribution fixture.

---

## C38-10 — `R20 → R6`

**Pinned endpoint blobs:** R20 `d9d7788e4c5a8f4c0914cf845294b38386470333`; R6 `d4d613a40eed187c230d55f7e21b1b0251bf612a`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R6 has a distinct Verification Result, so exact adjudication provenance matters. But the R6→R18→R20 mediation is explicit: R18's Capability Binding Snapshot names `verificationResultId`, and R20 consumes the exact R18 binding/disposition rather than independently reinterpreting raw R6 evidence. A boundary decision bound to exact R18 identity therefore remains deterministically traceable to the governing R6 result.

**Disposition:** clean through intentional exact R18 mediation; no duplicate direct R6-result pointer required.

---

## C38-11 — `R20 → R7`

**Pinned endpoint blobs:** R20 `d9d7788e4c5a8f4c0914cf845294b38386470333`; R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R20 requires the exact reservation/authority state relevant to the exact action to remain eligible; R7 atomically binds one exact Economic Action/reservation set/execution relationship.

### Structural distinction from C35-03

The reason no C35-03-style strengthening is required is structural, not merely lexical. R10 has a persistent Artifact Version that may undergo multiple distinct external deployment attempts, so a deployment/adoption record can become ambiguous about which execution produced its observed result unless it binds exact `executionId`. R7's reservation authority is instead created as part of an atomic identity relationship for the exact Economic Action/execution being admitted. There is no equivalent one-persistent-object/many-deployment-attempt ambiguity inside the R7 reservation record being consumed by R20.

Fixture requirement: if A1 has reservation R1 and a different valid R2 exists in the same Fund/resource pool, R20 decision D1 for A1 must prove it evaluated R1 rather than generic availability or “some reservation exists.” Existing R7/R20 exact-action linkage already requires this distinction.

**Disposition:** clean direct exact-reservation consumption.

---

## C38-12 — `R14 → R7`

**Pinned endpoint blobs:** R14 `969b70e8b4b52606c9e34f617bed32a91b395d25`; R7 `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R14 explicitly requires existing reservations/exposure to retain exact ownership/linkage semantics through runtime transfer, prohibits duplicate reservations and optimistic release, and requires R7-compatible release proof. But one execution may hold multiple R7 reservations across different aggregate scopes/resources. Generic preservation of “reserved exposure exists” is therefore insufficient forensic correspondence if the exact reservation set can be lost during handoff.

### Required strengthening — exact R7 reservation-set identity through R14 handoff

Every R14 handoff / in-flight disposition carrying R7-governed exposure must durably preserve or bind the exact R7 reservation set/identities associated with the transferred exact Economic Action/execution, sufficient to prove after handoff that reservations were neither duplicated, lost, substituted, nor optimistically released.

Required fixture:

1. exact execution E1 has at least two distinct R7 reservations, e.g. R1 cash and R2 entitlement, across different governed pools/scopes;
2. incumbent A begins governed handoff to successor B;
3. R14 preserves exact E1 and an in-flight disposition for E1;
4. the handoff record must make exact R1/R2 identity durably auditable, not merely record generic “reserved exposure exists”;
5. after transfer, B must not acquire duplicate R3 for the same governed exposure because R2 identity was lost;
6. B must be able to determine whether each exact reservation remains held/committed/settled/releasable under R7 rules;
7. unresolved R8 truth cannot release any member of the reservation set optimistically;
8. pre-dispatch abandonment release requires exact authoritative non-dispatch proof for the relevant execution and exact reservation linkage;
9. restart/recovery must enumerate the same pre-handoff/post-handoff reservation set without reconstructing membership from timestamps, current pool state, or amount similarity;
10. replacement authority itself must not create new resource authority.

This is a fixture-tier exact-correspondence strengthening, not `MISSING_REQUIRED_COMPOSITION`: R14 and R7 clearly compose and ownership is determinate; the gap is exact reservation-set preservation inside that composition.

**Disposition:** `CONSISTENT_CONSUMPTION` with required exact-R7-reservation-set handoff strengthening.

---

## Batch C-38 adjudicated result

- 12 directed edges independently classified.
- 10 edges clean with no new strengthening.
- C38-12 adds one new fixture-tier exact-reservation-set strengthening.
- C38-06 explicitly remains subject to C09-03's missing-financial-evidence durable-owner fixture.
- C38-07 explicitly remains subject to C07-02's R15-observation-does-not-promote-R8-state fixture.
- C38-09 explicitly remains subject to C19-01's shared/unallocated financial-attribution fixture.
- C38-01 and C38-04 likewise preserve their previously identified controlling dependencies rather than duplicate them.
- No new `MISSING_REQUIRED_COMPOSITION` defect is added; total remains 4.
- No new `UNRESOLVED_CROSS_NODE_GAP` is added; total remains 1.

### Process result

The accelerated method is retained with the new mandatory reciprocal-dependency scan. Its first use showed that compression is safe only when both the primary classification and all live opposite-direction governance dependencies remain visible.
