# Phase C Batch C-40 — Resource / Corrective / Liveness Sweep

**Status:** DRAFT / UNCOMMITTED AS PHASE-C AUTHORITY / PENDING ADVERSARIAL REVIEW  
**Phase:** C — Cross-node classification  
**Batch:** C-40 review draft  
**Edges proposed:** 10  
**Cumulative count if accepted:** 143 / 163  
**Remaining if accepted:** 20  
**Implementation authority:** SUSPENDED

This file is a review artifact only. It is deliberately separate from `PHASE_C_BATCH_40.md`. Nothing in this file changes the canonical edge index, classification counts, or Phase C findings until adversarial review is complete and an adjudicated batch is separately committed.

This tranche applies the hardened accelerated-review discipline established in C38 and C39:

1. every edge is independently classified;
2. reciprocal/precedent-controlled edges are scanned for still-live strengthenings, fixtures, negative controls, wording cautions, unresolved dependencies, and positive precedents;
3. compression may reduce repeated prose but may not hide governance;
4. any edge that fails to reduce cleanly to established precedent is promoted to full adversarial treatment.

Primary adversarial priorities:

- **C40-10 `R19 → R7`** — proposed new exact-R7-reservation-set lineage strengthening;
- **C40-09 `R17 → R7`** — verify that reservation identity belongs downstream rather than inside the pre-existing Offer/Grant, and independently verify topology;
- **C40-02/C40-03 `R5 ↔ R7`** — verify the explicit pending/blocked semantics eliminate a C16-01-style durable-owner gap;
- **C40-04/C40-05 `R7 ↔ R13`** — verify the R7-owned three-way outage-recovery certification is preserved without authority leakage.

---

## C40-01 — `R7 → R4`

R7 expressly requires the Economic Action/reservation identity to preserve enough exact Bet/evaluation-lineage reference for later authority checks, while R4 owns immutable Evaluation Cycle lineage and eligibility.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

A valid reservation cannot refresh stale Cycle A into Cycle B. Conversely, exact Cycle A lineage creates no resource authority. R7 consumes exact action/Bet/lineage identity sufficient to bind the reservation to the governed Economic Action, but R4 remains the semantic owner of originating Evaluation Cycle and lineage eligibility.

Fixture semantics:

1. Bet/action A1 originates under Evaluation Cycle C1.
2. R7 reserves scarce-resource set R1 for A1.
3. Evaluation Cycle C2 later becomes current.
4. R1 remains historically associated with A1/C1.
5. C2 cannot replace C1 merely because C2 is current.
6. R1 validity cannot make C1 currently eligible.
7. Correct C1 lineage does not itself authorize R1.
8. R20 later evaluates current lineage eligibility and reservation validity as separate predicates.

**Reciprocal/dependency scan:** no new reciprocal strengthening identified.

**Disposition:** clean exact-lineage/resource composition; no strengthening.

---

## C40-02 — `R5 → R7`

R5 explicitly states that required independent confirmation may itself require paid/scarce reviewer execution and therefore remains subject to R7 reservation authority. Lack of budget or entitlement leaves the material candidate pending/blocked and cannot convert self-certification into confirmation. R7 explicitly names an R5 confirmation burst among scarce-resource workloads it governs.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R5 determines whether independent confirmation is required. R7 determines whether resources required to execute that confirmation may be reserved. Safety necessity does not create resource authority; resource denial does not create confirmation.

Fixture:

1. Material candidate X requires independent confirmation.
2. Confirmation requires paid/scarce reviewer execution.
3. R7 denies admission because the governing pool is exhausted.
4. X remains `RESOLUTION_CONFIRMATION_PENDING` or equivalent.
5. X does not become `CONFIRMED`.
6. X does not become non-material merely because review resources are unavailable.
7. Later resource availability may allow reviewer execution.
8. Eventual confirmation still binds exact X and exact evidence/lineage.

**Relation to C16-01:** this is a positive control. No new durable-owner strengthening is required because R5 itself already preserves the required confirmation as pending/blocked when R7 resources are unavailable.

**Disposition:** clean.

---

## C40-03 — `R7 → R5`

Independent reciprocal review reaches the same seam. R7 may deny scarce reviewer resources. That denial does not mean R5 confirmation passed, failed substantively, became non-material, or ceased to be required. R5 already preserves required confirmation as pending/blocked.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

`CONSUMES` describes the semantic R5-work → R7-resource path even though the frozen inventory edge is reciprocal.

**Reciprocal/dependency scan:** independently re-derived invariant is identical to C40-02: resource denial blocks execution of confirmation; it does not resolve the confirmation requirement.

**Disposition:** clean reciprocal; no duplicate strengthening.

---

## C40-04 — `R7 → R13`

The `R12 × R13 × R7` outage-recovery compound is explicit. R13 recovery can make a large backlog executable at once; R7 prevents legitimate liveness recovery from becoming a resource stampede. R7 denial does not itself prove the executor unhealthy if R13 proves the executor is correctly observing and persisting blocked work.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R13 owns truthful executor health/progress. R7 owns scarce-resource admission. Recovery of one does not grant the other.

Fixture:

1. Outage produces N durable due jobs.
2. Required executor returns and becomes truthfully healthy under R13.
3. All N jobs become observable/runnable.
4. R7 permits only K < N.
5. Only K dispatch.
6. Remaining N-K stay durably blocked/runnable as appropriate.
7. R13 does not classify the executor failed merely because those jobs are resource-blocked.
8. R7 does not use health recovery as authority to admit all N.

**Disposition:** clean.

---

## C40-05 — `R13 → R7`

The reciprocal direction is independently clean. R13 explicitly records that the normative three-way `R12 × R13 × R7` recovery certification is R7-owned. R13 contributes truthful executor recovery/liveness but does not acquire aggregate admission authority.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

A healthy executor with 100 due jobs does not thereby authorize 100 scarce executions. An R7 block likewise does not prove the executor unhealthy when blocked-state observation remains healthy.

**Reciprocal/dependency scan:** no additional strengthening beyond the already-explicit R7-owned outage-recovery compound.

**Disposition:** clean reciprocal.

---

## C40-06 — `R8 → R13`

R8 external truth and R13 executor health are intentionally separate facts. A dead/stalled worker does not prove provider failure, non-dispatch, cancellation, or replay safety. Restoring executor health can make reconciliation runnable but cannot manufacture an R8 terminal outcome.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

R8 outcome is the authoritative state/history of exact execution E1. R13 health is independently the state of the executor path expected to process work. Neither object's canonical truth is defined by the other. This is a clean application of the C34 own-state distinction.

Fixture:

1. Execution E1 may have crossed the provider boundary.
2. Executor X dies.
3. R13 reports X=`FAILED`.
4. E1 remains `OUTCOME_UNCERTAIN_RECONCILABLE` under R8.
5. X later becomes `HEALTHY`.
6. E1 remains unchanged until R8 reconciliation produces authoritative evidence.
7. Health recovery may make reconciliation work runnable.
8. It cannot turn E1 into `SUCCEEDED`, `FAILED`, `CANCELLED`, or `RECONCILED_NOT_DISPATCHED`.

**Disposition:** clean.

---

## C40-07 — `R13 → R8`

Independent reciprocal classification reaches the same invariant. Executor X may be `FAILED` while E1 remains `OUTCOME_UNCERTAIN_RECONCILABLE`. X later becoming healthy does not change E1; it only restores capacity to continue governed reconciliation.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**`CONSUMES` withheld.**  
**Topology:** `BILATERAL_CORROBORATION`

**Reciprocal/dependency scan:** no live opposite-direction strengthening exposed. The seam is already explicit: R13 health must not rewrite R8 external truth.

**Disposition:** clean reciprocal.

---

## C40-08 — `R11 → R7`

R11 expressly says corrective ownership is not execution authority and explicitly prohibits bypassing R7 for scarce-resource-consuming corrective work. The corrective obligation is durable independently of whether execution currently receives resource admission.

Therefore `O1 exists + R7 denies execution` does not imply `O1 completed/cancelled/disappeared`.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Difference from C16-01: there, still-required R3 revalidation lacked an explicitly named durable corrective owner after R7 denial. Here R11 is already that durable ownership layer.

Fixture:

1. R11 creates exact corrective obligation O1.
2. O1 requires scarce external execution.
3. R7 denies admission.
4. O1 remains open and durably owned.
5. R7 denial cannot mutate O1 to complete/cancelled.
6. R11 cannot bypass R7 because O1 is safety-required.
7. Later R7 admission permits execution subject to all other gates.
8. Completion still requires O1's class-specific completion predicate and confirmation rules.

**Disposition:** clean.

---

## C40-09 — `R17 → R7`

**Adversarial priority #2.**

R17 Offer/Grant and R7 reservation answer different questions:

- R17: what exact commercial action is authorized?
- R7: may scarce resources required by that exact action be committed now?

An Offer/Grant is fully valid before an R7 reservation necessarily exists, just as an R18 capability binding can exist without a reservation.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** provisionally `BILATERAL_CORROBORATION`

The C36 declaring-record test applies. Exact reservation binding belongs on a record whose own canonical meaning is defined by that particular reservation/execution. R17 Offer Version and charging Grant are fully specified before a particular reservation exists. Their correctness therefore does not depend on a future R7 reservation identity.

Adding reservation IDs to immutable Offer/Grant would create a backwards lifecycle dependency. Exact commercial-authority ↔ Economic Action/reservation/execution correspondence belongs downstream where an actual consequential operation exists.

Fixture:

1. O1/G1 exists and is valid.
2. No resource reservation yet exists.
3. Later commercial action A1 selects O1/G1.
4. R7 creates reservation set R1 for A1.
5. R1 cannot make invalid/superseded O1 valid.
6. Valid O1 cannot create R1 without R7 admission.
7. A second action A2 under the same O1 may receive distinct reservation set R2 where policy permits.
8. O1 need not be mutated after each action to append R1/R2.
9. Historical operation-level lineage must preserve which reservation set belonged to A1 versus A2 elsewhere in the governed action/lineage layer.

Adversarial questions:

1. Does R17 contain enough substantive R7 treatment to justify `BILATERAL_CORROBORATION`, or should topology be `UNILATERAL_DECLARATION`?
2. Is there any R17-owned downstream execution record—not merely Offer/Grant identity—whose own correctness requires direct R7 reservation binding?
3. Does any live opposite-direction R7→R17 fixture/strengthening need to be carried forward?

**Provisional disposition:** clean unless source review identifies an R17-owned operation record whose meaning is reservation-specific.

---

## C40-10 — `R19 → R7`

**Adversarial priority #1.**

R19 says complete lineage must compose with the `R7/R8/R15/R16` financial-safety chain and that reservation/execution/financial evidence must be attributable to the exact same historical commercial authority path. That is an R19-owned attribution claim.

But R19's named Commercial Authority Lineage Reference field list binds exact R4 lineage, R9 source, R10 artifact/release, R17 Offer/Grant, provider/account, checkout/customer contract, commercial session, exact R8 execution, transaction, and R15/R16 linkage—without naming the exact R7 reservation identity/set.

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

The relationship clearly exists, so this is not `MISSING_REQUIRED_COMPOSITION`. The issue is exact representational correspondence.

Suppose commercial execution E1 consumes R1 cash reservation and R2 entitlement reservation. R19 lineage L1 correctly binds O1/G1 → provider A1 → E1 → T1 → financial evidence. If L1 only says “R7 financial safety composed” or can reach current reservation state, later audit cannot distinguish R1/R2 that actually authorized E1 from R3/R4 created for another attempt or another transaction.

This satisfies the C36 declaring-record test toward must-bind: R19's own canonical record is the complete historical attribution object. If it claims to attribute reservation/exposure, its correctness depends on knowing which exact reservation set belonged to the operation. This differs from R17, whose Offer is valid even if no reservation or execution ever exists.

### Proposed required strengthening

> **Where a consequential commercial execution consumes R7-governed scarce-resource authority, the R19 Commercial Authority Lineage Reference must durably bind or deterministically incorporate the exact R7 reservation set/identities associated with that exact Economic Action/execution, sufficient to prove that the reserved exposure belongs to the same immutable commercial authority path as the Offer/Grant, provider/account operation, R8 execution, transaction, and downstream financial evidence.**

Required negative fixture:

1. L1 governs O1/G1 and exact execution E1.
2. E1 has R7 reservation set `{R1 cash, R2 entitlement}`.
3. Another valid commercial execution E2 has `{R3 cash, R4 entitlement}` under the same Asset/provider/account.
4. L1 must identify `{R1,R2}`, not merely “resource authority valid.”
5. `{R3,R4}` cannot substitute because amounts, pools, provider/account, or Asset happen to match.
6. Later release/settlement cannot rewrite the historical set.
7. Runtime handoff preserving E1 must preserve the same R7 set, consistent with C38-12.
8. R15/R16 evidence attached to E1 cannot be used after the fact to infer which reservation rows probably belonged to E1.
9. Audit must answer directly: which exact R7 reservations authorized this historical commercial path?
10. The answer must not require reconstruction from timestamps, current pool state, equal amounts, same Asset, same provider, or current reservation joins.
11. Multiple resource pools remain independently represented; generic “reserved exposure existed” is insufficient.
12. A future corrective/replacement reservation does not retroactively become the reservation authority for E1.

### Why fixture-tier rather than MRC

R19 explicitly requires composition with R7 and explicitly owns attribution of reservation/execution/financial truth to one historical path. The composition exists. What is missing is exact record-level correspondence sufficient to make that declared composition directly auditable.

**Provisional disposition:** `CONSISTENT_CONSUMPTION` with a new exact-R7-reservation-set lineage strengthening.

---

# Batch C-40 provisional result

| Edge | Primary | Durable result |
|---|---|---|
| `R7 → R4` | `CONSISTENT_CONSUMPTION` | Clean |
| `R5 → R7` | `CONSISTENT_CONSUMPTION` | Clean |
| `R7 → R5` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R7 → R13` | `CONSISTENT_CONSUMPTION` | Clean |
| `R13 → R7` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R8 → R13` | `CONSISTENT_CONSUMPTION` | Clean parallel truth |
| `R13 → R8` | `CONSISTENT_CONSUMPTION` | Clean reciprocal |
| `R11 → R7` | `CONSISTENT_CONSUMPTION` | Clean |
| `R17 → R7` | `CONSISTENT_CONSUMPTION` | Provisionally clean; priority topology/ownership check |
| `R19 → R7` | `CONSISTENT_CONSUMPTION` | **New exact-R7-reservation-set lineage strengthening proposed** |

Provisional totals if accepted:

- frozen inventory: 163;
- classified: 143;
- unclassified: 20;
- confirmed `MISSING_REQUIRED_COMPOSITION`: 4, unchanged;
- open `UNRESOLVED_CROSS_NODE_GAP`: 1, unchanged;
- new C40 strengthening: 1, on `R19 → R7`.

## Requested adversarial review

Independently review all ten edges and all reciprocal-dependency scans. Prioritize C40-10, C40-09, C40-02/C40-03, and C40-04/C40-05. Also independently scan every remaining clean/no-new-governance claim for still-live reciprocal fixtures, strengthenings, negative controls, wording cautions, unresolved dependencies, or positive precedents that must be cited before an adjudicated commit.

**This review draft does not close or classify Batch C-40.**
