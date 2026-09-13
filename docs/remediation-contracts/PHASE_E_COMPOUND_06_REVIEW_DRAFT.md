# Phase E Compound 06 — R7 × R15 × R16 Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** E — Compound Certification  
**Compound:** `R7 × R15 × R16`  
**Implementation authority:** SUSPENDED

## 1. Scope

This compound tests whether scarce-resource reservation/headroom authority composes safely with immutable provider-originating financial observations and deterministic canonical reconciliation **without using R8 external-execution state as a premise**.

- R7 owns admission, reservation, conservative headroom, settlement/release authority.
- R15 owns immutable provider-originating financial observation truth.
- R16 owns deterministic canonical financial interpretation under a versioned reconciliation policy.

R15/R16 financial truth may support movement of the exact financially governed reservation members it actually adjudicates. It may not manufacture R8 technical/non-dispatch truth, release unrelated non-financial reservation members, or grant resource authority by itself.

## 2. Governing prior results

- C09-03 (`R7 → R15`): reservation amount is not incurred truth; absence of R15 evidence is not zero-cost proof; unresolved financial truth cannot create optimistic headroom.
- C11-02 (`R7 → R16`): R7 consumes canonical reconciliation for settlement/release; `BOUNDED` semantics remain a live fixture and cannot be treated as `EXACT` or free headroom.
- C03-01 (`R15 → R16`): R15 captures immutable evidence; R16 interprets the complete evidence set under a versioned policy; replay is the semantic oracle.
- Reciprocal Phase-C edges C38-06 (`R15 → R7`), C38-08 (`R16 → R7`), and C25-03 (`R16 → R15`) remain governing.
- Compound 02 remains live where applicable, especially:
  - reconciliation/evidence-set freshness at the actual R7 release boundary;
  - exact reservation-member scoping;
  - duplicate observation deduplication;
  - regression preservation after properly fresh prior release;
  - BOUNDED conservatism/refinement.

Compound 02's R8+R16 conjunctive-release rule is not imported as a universal requirement here. Where release depends on proving technical non-dispatch or external-outcome truth, R8 remains required and this three-node compound cannot certify that case. Where authoritative R15/R16 financial truth independently proves the exact financially governed unused/settled portion under R7's own release rules, that narrower financial movement can be evaluated here without pretending R8 was supplied.

## 3. Affirmative control

Execution/economic action E1 holds exact cash reservation C1 = 100. R15 durably preserves the complete applicable provider financial evidence for E1. R16 deterministically reconciles that complete evidence set under policy V1 to an authoritative exact settled/incurred amount of 40, with exact evidence-set/provenance identity. R7 may account 40 as consumed/settled and may release at most the financially governed unused portion supported by its own release rules, subject to boundary freshness and any other independently required predicates. Historical reservation, observations, reconciliation, and release remain attributable to E1.

This control does not authorize release of non-cash reservation members or assert anything about technical non-dispatch unless separately governed evidence supplies that truth.

## 4. Deliberate compound attacks

### E6-1 — reservation amount treated as incurred truth
Reserve 100; no authoritative financial evidence yet. **Expected:** R7 cannot call 100 incurred merely because it was reserved, and cannot call 0 incurred merely because no convenient R15 row exists.

### E6-2 — raw observation directly moves headroom
R15 records provider amount 40. R16 has not yet interpreted whether it is absolute, delta, cumulative, estimate, final, correction, or informational. **Expected:** raw R15 evidence alone does not authorize R7 release/settlement.

### E6-3 — correct reconciliation but stale evidence set at release
R16 computes C1 from S1; newer applicable R15 evidence F2 becomes durable before R7 release. **Expected:** Compound-02 freshness strengthening remains governing; fail closed or re-reconcile.

### E6-4 — financially exact result releases unrelated reservation member
E1 holds cash C1 plus entitlement Q1. R16 proves exact cash settlement. **Expected:** cash truth cannot release Q1; exact reservation-member scoping remains governing in both directions.

### E6-5 — downward correction self-releases
R16 revises canonical exposure from 40 to 20 after authoritative correction. **Expected:** truth may revise downward, but R16 does not itself release 20; R7 remains release owner.

### E6-6 — upward correction after prior release
A properly fresh release occurred using then-authoritative truth; later provider evidence/replay raises incurred exposure. **Expected:** preserve historical release and downstream executed authority; create/retain `FINANCIAL_RECONCILIATION_REGRESSION`, reduce/freeze headroom conservatively, and route owned remediation rather than rewriting history.

### E6-7 — `BOUNDED` laundered into exact release
R16 emits `BOUNDED`. **Expected:** C11-02 remains open/live; no implicit exact/zero/full-release interpretation. Exact bound representation and conservative R7 release rule must be explicit.

### E6-8 — duplicate observation double-counting
Same underlying provider event arrives by webhook and poll. **Expected:** R16 deduplicates semantic economic effect using provider-native identity or governed synthetic identity; one real event is not counted twice; distinct events are not collapsed.

### E6-9 — arrival-order dependence
Final arrives before estimate in one replay and after estimate in another. **Expected:** same complete evidence set + same policy yields same canonical state; R7 headroom outcome cannot depend on delivery order.

### E6-10 — same amount, wrong execution/account
A valid R15/R16 financial result exists for E2 or another provider account with identical amount/unit. **Expected:** it cannot settle/release E1's reservation. Exact execution/provider/account provenance must match the R7 Economic Action/reservation linkage.

### E6-11 — mixed financial/non-financial inference without R8
R16 proves zero or fully settled financial exposure. An implementation treats that as proof the provider operation never crossed its technical boundary and releases every exposure. **Expected:** FAIL. Financial truth may govern financially adjudicated reservation members only; it does not manufacture R8 non-dispatch/execution truth or unrelated release authority.

### E6-12 — provider-reported amount exceeds reservation
Reserve 10; provider evidence reconciles authoritative 12.4. **Expected:** preserve/reconcile 12.4; do not clamp truth to 10. Reservation authority limits authorization, not historical economic fact. Excess becomes governed defect/exposure handling.

### E6-13 — policy-version replay changes current truth
Same immutable R15 set replays under V2 and produces a materially different canonical state than historical V1. **Expected:** preserve which policy/result governed historical R7 decisions; V2 may revise current truth prospectively/currently but cannot retroactively pretend V1 release never occurred. Inconsistency becomes governed regression/remediation.

## 5. Pairwise-correct but compound-unsafe candidates

The review should especially test whether all pairwise seams can look correct while the three-node composition still fails through:

1. **specific-but-wrong financial lineage:** valid R15/R16 result attached to the wrong R7 Economic Action/reservation set;
2. **financial-scope laundering:** exact cash reconciliation used to release entitlement/non-cash reservations or to infer R8 non-dispatch;
3. **freshness race:** R16 correct over S1 but stale against already-durable S2 at actual R7 release;
4. **policy/history collapse:** V2 recomputation overwrites which truth governed an earlier R7 release;
5. **multi-result partial completeness:** one financial component/observation class reconciled exactly while another genuinely required financial component remains unresolved, yet R7 treats the overall financially governed reservation as fully settled.

## 6. Provisional disposition

**PASS at the Phase-E specification/composition level, subject to adversarial review. No new standalone strengthening is asserted yet beyond live carried-forward Compound-02/C11-02 requirements.**

The source already explicitly establishes:

- R7 reservation ≠ incurred/settled financial truth;
- R15 raw observation ≠ R16 interpretation;
- R16 canonical truth ≠ R7 release authority;
- replay/order independence and deduplication;
- conservative unresolved headroom;
- correction/regression history preservation;
- exact provider/account/execution provenance;
- non-cash entitlement observations as first-class;
- reservation-member scoping and release-time reconciliation freshness from Compound 02.

The main open review question is whether this three-node subset exposes a new completeness/correspondence rule not already captured by those existing controls.

## 7. Requested adversarial review

1. **R8 absence:** Is the scope distinction correct—that this compound may certify financially governed settlement/release when R15/R16 independently supply authoritative exact financial truth, but cannot certify any release whose justification depends on proving technical non-dispatch/external outcome?
2. **Exact R7↔R15/R16 correspondence:** Do existing Economic Action/reservation/execution linkage plus R15/R16 exact execution/provider/account provenance fully prevent a correct financial result for E2 from settling E1, or is an explicit cross-object equality fixture still needed?
3. **Multi-component financial completeness:** If one financially governed reservation depends on several required financial components/evidence classes, do existing R15 `complete evidence set` + R16 replay semantics guarantee all required components are included before R7 treats the reservation as fully settled, or is there an R3/E5-9-like internal completeness gap here?
4. **Compound-02 carry-forward:** Are reconciliation freshness and reservation-member scoping sufficient as carried requirements, or does removing R8 expose a narrower version that needs separate wording?
5. **`BOUNDED`:** Does C11-02 plus Compound-02 refinement remain sufficient here, with no new semantic choice invented?
6. **Policy-version/history:** Are R16 V1→V2 replay and `FINANCIAL_RECONCILIATION_REGRESSION` rules sufficient to prevent retroactive rewriting of R7 release authority?
7. **Duplicate/shared evidence:** Are E6-8 (duplicate same event) and existing shared/unallocated-cost semantics correctly distinct and sufficient?
8. Find any case where R7, R15, and R16 are each locally correct and all pairwise seams pass, yet combined headroom still moves incorrectly or valid historical financial truth is lost.

## 8. Calibration

Do not add a new strengthening merely because Compounds 01–05 found several. Equally, do not assume Compound 02 already certifies this subset: R8's absence changes the proposition being tested. Credit existing controls where they actually close the case; add a new requirement only if the three-node composition leaves a determinate but unexecutable invariant.
