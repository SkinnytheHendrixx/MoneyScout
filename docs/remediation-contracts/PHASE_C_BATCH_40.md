# Phase C Batch C-40 — Resource / Corrective / Liveness Sweep

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-40  
**Edges classified:** 10  
**Cumulative Phase C count after this batch:** 143 / 163  
**Unclassified after this batch:** 20  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged  
**Implementation authority:** SUSPENDED

This tranche applies the hardened accelerated-review discipline established in C38 and C39: every edge is independently classified; reciprocal/precedent-controlled edges are scanned for still-live strengthenings, fixtures, negative controls, wording cautions, unresolved dependencies, and positive precedents; compression may reduce repeated prose but may not hide governance; and any edge that does not reduce cleanly to established precedent is promoted to full adversarial treatment.

Adversarial review confirmed nine clean edges and one new exact-correspondence strengthening. One topology amendment was required before commit: C40-09 `R17 → R7` is `UNILATERAL_DECLARATION`, not `BILATERAL_CORROBORATION`.

---

## C40-01 — `R7 → R4`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R7 requires the Economic Action/reservation identity to preserve enough exact Bet/evaluation-lineage reference for later authority checks, while R4 owns immutable Evaluation Cycle lineage and eligibility. A valid reservation cannot refresh stale Cycle A into Cycle B; exact Cycle A lineage creates no resource authority.

Fixture: A1 originates under C1; R7 reserves R1 for A1; C2 later becomes current; R1 remains historically associated with A1/C1; C2 cannot substitute merely because it is current; R1 validity cannot make C1 currently eligible; correct C1 lineage does not itself authorize R1; R20 later composes current lineage eligibility and reservation validity separately.

**Reciprocal/dependency scan:** no new reciprocal strengthening identified. C26-01's reciprocal pattern remains consistent with this ownership split.

**Disposition:** clean exact-lineage/resource composition; no strengthening.

---

## C40-02 — `R5 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R5 explicitly states that required independent confirmation may require paid/scarce reviewer execution and therefore remains subject to R7 reservation authority. Lack of budget or entitlement leaves the material candidate pending/blocked and cannot convert self-certification into confirmation. R7 explicitly names an R5 confirmation burst among scarce-resource workloads it governs.

Fixture: material candidate X requires confirmation; reviewer execution is scarce; R7 denies admission; X remains `RESOLUTION_CONFIRMATION_PENDING` or equivalent; X does not become `CONFIRMED` or non-material; later resource availability may permit the reviewer execution; eventual confirmation still binds exact X and its exact evidence/lineage.

**Positive-control result:** unlike C16-01, no durable-owner gap exists here because R5 itself already preserves the still-required confirmation as pending/blocked.

**Disposition:** clean.

---

## C40-03 — `R7 → R5`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Independent reciprocal review re-derives the same invariant. R7 may deny scarce reviewer resources, but that denial does not mean R5 confirmation passed, failed substantively, became non-material, or ceased to be required. `CONSUMES` describes the semantic R5-work → R7-resource path even though the frozen inventory edge is reciprocal.

**Reciprocal/dependency scan:** same invariant as C40-02; no duplicate strengthening.

**Disposition:** clean reciprocal.

---

## C40-04 — `R7 → R13`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

The `R12 × R13 × R7` outage-recovery compound is explicit. R13 recovery can make a large backlog executable at once; R7 prevents legitimate liveness recovery from becoming a resource stampede. R7 denial does not prove the executor unhealthy when R13 proves the executor is correctly observing and persisting blocked work.

Fixture: outage creates N durable due jobs; executor becomes truthfully healthy; all N become observable/runnable; R7 permits only K < N; only K dispatch; N-K remain durably blocked/runnable; R13 does not classify the executor failed merely because those jobs are resource-blocked; R7 does not use health recovery as authority to admit all N.

**Carried-forward ownership:** the three-way recovery certification remains R7-owned, consistent with the already-established C06-03/C26-03 compound treatment.

**Disposition:** clean.

---

## C40-05 — `R13 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R13 explicitly records that the normative `R12 × R13 × R7` recovery certification is R7-owned. R13 contributes truthful executor recovery/liveness but does not acquire aggregate admission authority. A healthy executor with 100 due jobs does not thereby authorize 100 scarce executions; an R7 block does not prove the executor unhealthy when blocked-state observation remains healthy.

**Reciprocal/dependency scan:** no new strengthening beyond the already-explicit R7-owned outage-recovery compound.

**Disposition:** clean reciprocal.

---

## C40-06 — `R8 → R13`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

R8 external truth and R13 executor health are intentionally separate facts. A dead/stalled worker does not prove provider failure, non-dispatch, cancellation, or replay safety. Restoring executor health can make reconciliation runnable but cannot manufacture an R8 terminal outcome.

This is a clean application of the C34 own-state distinction: R8 outcome is the authoritative state/history of exact execution E1; R13 health is independently the state of the executor path expected to process work.

Fixture: E1 may have crossed the provider boundary; executor X dies and R13 reports `FAILED`; E1 remains `OUTCOME_UNCERTAIN_RECONCILABLE`; X later becomes `HEALTHY`; E1 remains unchanged until R8 reconciliation produces authoritative evidence; health recovery may make reconciliation runnable but cannot turn E1 into `SUCCEEDED`, `FAILED`, `CANCELLED`, or `RECONCILED_NOT_DISPATCHED`.

**Disposition:** clean.

---

## C40-07 — `R13 → R8`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

Independent reciprocal classification reaches the same invariant. Executor X may be `FAILED` while E1 remains `OUTCOME_UNCERTAIN_RECONCILABLE`; X later becoming healthy does not change E1, it only restores capacity to continue governed reconciliation.

**Reciprocal/dependency scan:** no live opposite-direction strengthening exposed.

**Disposition:** clean reciprocal.

---

## C40-08 — `R11 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R11 says corrective ownership is not execution authority and explicitly prohibits bypassing R7 for scarce-resource-consuming corrective work. The corrective obligation is durable independently of whether execution currently receives resource admission. `O1 exists + R7 denies execution` therefore does not imply `O1 completed/cancelled/disappeared`.

Unlike C16-01, R11 is already the durable ownership layer here.

Fixture: R11 creates exact O1; O1 requires scarce external execution; R7 denies admission; O1 remains open and durably owned; denial cannot mutate O1 to complete/cancelled; R11 cannot bypass R7 because O1 is safety-required; later R7 admission permits execution subject to other gates; completion still requires O1's class-specific completion predicate and confirmation rules.

**Disposition:** clean.

---

## C40-09 — `R17 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `UNILATERAL_DECLARATION`

R17 Offer/Grant and R7 reservation answer different questions: R17 defines what exact commercial authority object exists; R7 determines whether scarce resources for an actual action may be committed now. An Offer/Grant is fully valid before any particular R7 reservation necessarily exists.

The C36 declaring-record test therefore does not require future reservation IDs on the immutable Offer/Grant. Adding them would create a backwards lifecycle dependency. Exact Offer/Grant ↔ Economic Action/reservation/execution correspondence belongs downstream where an actual consequential operation exists.

Fixture: O1/G1 exists before reservation; later A1 selects O1/G1 and R7 creates R1; R1 cannot make invalid O1 valid; valid O1 cannot bypass R7; a second A2 under the same O1 may receive distinct R2; O1 need not be mutated to append R1/R2; operation-level lineage elsewhere must preserve which reservation set belonged to A1 versus A2.

### Adversarial topology correction

Review found no dedicated R17 R7 boundary, compound, or vocabulary checkpoint and no R17-owned downstream execution record separate from Offer/Grant identity. The seam is therefore not independently corroborated by R17 in the depth required for bilateral topology. The canonical topology is `UNILATERAL_DECLARATION`.

No live R7→R17 fixture/strengthening was found that requires carry-forward.

**Disposition:** clean; topology corrected before commit; no strengthening.

---

## C40-10 — `R19 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R19 says complete lineage must compose with the `R7/R8/R15/R16` financial-safety chain and explicitly claims that reservation/execution/financial evidence must be attributable to the exact same historical commercial authority path. That is an R19-owned attribution claim.

However, the named Commercial Authority Lineage Reference binds R4 lineage, R9 source, R10 artifact/release, R17 Offer/Grant, provider/account, checkout/customer contract, commercial session, exact R8 execution, transaction, and R15/R16 linkage without naming exact R7 reservation identity/set.

The composition exists, so this is not `MISSING_REQUIRED_COMPOSITION`; the gap is exact record-level correspondence.

### Required strengthening — exact R7 reservation-set lineage

> **Where a consequential commercial execution consumes R7-governed scarce-resource authority, the R19 Commercial Authority Lineage Reference must durably bind or deterministically incorporate the exact R7 reservation set/identities associated with that exact Economic Action/execution, sufficient to prove that the reserved exposure belongs to the same immutable commercial authority path as the Offer/Grant, provider/account operation, R8 execution, transaction, and downstream financial evidence.**

This follows the C36 declaring-record test: R19's own canonical record is the complete historical attribution object, so correctness genuinely depends on knowing which exact reservation set belonged to the operation. That differs from R17, whose Offer is complete before reservation/execution exists.

Required negative fixture:

1. L1 governs O1/G1 and exact execution E1.
2. E1 has R7 reservation set `{R1 cash, R2 entitlement}`.
3. Another valid E2 has `{R3 cash, R4 entitlement}` under the same Asset/provider/account.
4. L1 must identify `{R1,R2}`, not merely “resource authority valid.”
5. `{R3,R4}` cannot substitute because amounts, pools, provider/account, or Asset happen to match.
6. Later release/settlement cannot rewrite the historical set.
7. Runtime handoff preserving E1 must preserve the same R7 set, consistent with C38-12.
8. R15/R16 evidence attached to E1 cannot be used after the fact to infer which reservation rows probably belonged to E1.
9. Audit must answer directly which exact R7 reservations authorized this historical commercial path.
10. The answer must not require reconstruction from timestamps, current pool state, equal amounts, same Asset, same provider, or current reservation joins.
11. Multiple resource pools remain independently represented; generic “reserved exposure existed” is insufficient.
12. A future corrective/replacement reservation does not retroactively become the reservation authority for E1.

C38-12 remains related but non-duplicative: C38-12 governs handoff preservation of the exact reservation set; C40-10 governs recording that exact set in the historical commercial-lineage object itself.

**Disposition:** `CONSISTENT_CONSUMPTION` with one new exact-R7-reservation-set lineage strengthening.

---

# Batch C-40 final result

| Edge | Primary | Durable result |
|---|---|---|
| `R7 → R4` | `CONSISTENT_CONSUMPTION` | Clean |
| `R5 → R7` | `CONSISTENT_CONSUMPTION` | Clean |
| `R7 → R5` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R7 → R13` | `CONSISTENT_CONSUMPTION` | Clean; R7-owned recovery compound preserved |
| `R13 → R7` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R8 → R13` | `CONSISTENT_CONSUMPTION` | Clean parallel truth |
| `R13 → R8` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R11 → R7` | `CONSISTENT_CONSUMPTION` | Clean |
| `R17 → R7` | `CONSISTENT_CONSUMPTION` | Clean; topology corrected to `UNILATERAL_DECLARATION` |
| `R19 → R7` | `CONSISTENT_CONSUMPTION` | **New exact-R7-reservation-set lineage strengthening** |

Cumulative result after C-40:

- frozen inventory: **163**;
- classified: **143**;
- unclassified: **20**;
- duplicate classified edges: **0**;
- classified edges absent from inventory: **0**;
- confirmed `MISSING_REQUIRED_COMPOSITION`: **4**, unchanged;
- open `UNRESOLVED_CROSS_NODE_GAP`: **1**, unchanged;
- new C40 strengthening: **1**, on `R19 → R7`.

No endpoint contract is amended by this batch. The strengthening is a durable Phase C audit conclusion for later remediation/implementation governance.
