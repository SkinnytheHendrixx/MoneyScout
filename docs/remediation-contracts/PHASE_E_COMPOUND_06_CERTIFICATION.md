# Phase E Compound 06 — R7 × R15 × R16 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R7 × R15 × R16`  
**Implementation authority:** SUSPENDED

## 1. Final result

**PASS at the Phase-E specification/composition level, with one new fixture-tier strengthening, one extension of an already-live C11-02 requirement, and one new attack. No new primary cross-node defect.**

R7 owns admission, reservation, conservative headroom, settlement/release authority. R15 owns immutable provider-originating financial observation truth. R16 owns deterministic canonical financial interpretation under a versioned reconciliation policy.

This compound certifies the financial subset without pretending R8 technical/external-execution truth is present. R15/R16 may support movement only of the exact financially governed R7 reservation members they actually adjudicate. They cannot manufacture technical non-dispatch truth, release unrelated reservation members, or create resource authority by themselves.

## 2. Strengthening A — explicit R7↔R15/R16 identity equality before settlement/release

R7 reservation/execution identity and R15/R16 financial identity are correlated records created at different times by different processes. The fact that both independently carry exact execution/provider/account identity does not by itself prove that an implementation compares those independently populated values before using one to settle/release the other.

> **Before R7 consumes an R15/R16 financial result for settlement or release, it must explicitly verify equality between the exact Economic Action/reservation/execution identity bound by R7 and the exact execution/provider/account identity carried by the R15 observations and resulting R16 reconciliation. A valid financial result for E2 cannot settle or release E1 merely because amount, currency, provider family, logical capability, or other surface attributes match.**

Required fixture:

1. Create Economic Action/execution E1 with exact R7 reservation set RS1 under provider/account A/A1.
2. Create R15 observations for E1 under A/A1 and reconcile them in R16 to result F1; prove the equality check passes where all other release predicates pass.
3. Create an otherwise valid R15/R16 result F2 for different execution E2 but with the same amount/unit; prove F2 cannot settle/release E1.
4. Create an otherwise valid result F3 under provider A but different account A2; prove it cannot settle/release E1 where provider/account identity is material.
5. Create an otherwise valid result F4 under a different provider/account with equivalent economic value; prove it cannot settle/release E1.
6. Equality must be checked against immutable exact identities, not current/latest execution pointers or amount/time heuristics.
7. Restart/replay must reconstruct the same R7↔R15/R16 correspondence deterministically.
8. Historical E1/RS1/F1 attribution remains preserved after later executions or policy changes.

This is fixture-tier correspondence strengthening, not `MISSING_REQUIRED_COMPOSITION`: the composition exists and the normative answer is determinate, but the cross-object equality check was not explicit enough.

## 3. C11-02 extension — multi-component completeness inside R16 statuses

No new independent strengthening is created for the multi-component case.

R16 already has explicit incompleteness/confidence states including `PARTIAL`, `AWAITING_FINAL`, `UNRECONCILED`, `CONFLICT`, and `BOUNDED`. That vocabulary distinguishes this case from Compound 05's R3-internal completeness gap.

The already-live C11-02 requirement is extended as follows:

> **The governing R16 completeness/status semantics must account for every genuinely required financial component of the financially governed R7 reservation. If any required component remains unresolved, missing, provisional, conflicting, or awaiting final evidence, R16 must emit the appropriate non-final status rather than an overall `EXACT`/fully-settled result merely because another required component is resolved.**

Required extension fixture:

1. One financially governed reservation depends on required components C1 and C2.
2. C1 is exactly reconciled.
3. C2 remains unresolved, awaiting final evidence, conflicting, or otherwise incomplete.
4. Overall R16 state must preserve the incomplete condition through the appropriate canonical status.
5. R7 must not treat the financially governed reservation as fully settled/releasable merely because C1 is exact.
6. If policy defines a component as optional, alternative, or non-authoritative, that must be explicit in the reconciliation policy rather than inferred from whichever component resolves first.
7. Later completion of C2 must converge without double release, double consumption, or history rewrite.

The existing C11-02 `BOUNDED` question remains open/live: exact bound representation and the conservative R7 release rule still must be explicitly adjudicated before implementation.

## 4. Carried-forward Compound-02 controls

The following remain governing without being counted again:

- R16 reconciliation/evidence-set freshness at the actual R7 release boundary;
- exact reservation-member scoping;
- duplicate-observation deduplication;
- conservative unresolved headroom;
- properly-fresh historical release followed by later reconciliation regression;
- `BOUNDED` conservatism/refinement.

Compound 02's R8+R16 conjunctive-release rule is not a universal requirement here. If release depends on proving technical non-dispatch or another R8-owned external outcome, this three-node compound cannot certify it. Where authoritative R15/R16 financial truth independently proves the exact financially governed settled/unused portion under R7's own rules, that narrower financial movement can be evaluated here without inventing R8 truth.

## 5. Compound attacks

- **E6-1:** reservation amount treated as incurred truth — FAIL.
- **E6-2:** raw R15 observation directly moves headroom before R16 interpretation — FAIL.
- **E6-3:** R16 result stale against newer already-durable R15 evidence at release — apply carried freshness strengthening; fail closed or re-reconcile.
- **E6-4:** exact financial result releases unrelated non-cash reservation member — FAIL; member scoping remains governing.
- **E6-5:** downward correction self-releases — FAIL; R7 remains release owner.
- **E6-6:** upward correction after properly fresh historical release — preserve release/downstream history; create/retain `FINANCIAL_RECONCILIATION_REGRESSION`; reduce/freeze headroom conservatively and route remediation.
- **E6-7:** `BOUNDED` treated as exact/zero/free headroom — FAIL; C11-02 remains open/live.
- **E6-8:** duplicate observation double-counting — FAIL; one provider event observed twice has one semantic economic effect, while distinct events remain distinct.
- **E6-9:** arrival-order dependence — FAIL; same complete evidence set + same policy must yield same canonical result.
- **E6-10:** valid financial result for wrong execution/account settles another reservation — apply Strengthening A.
- **E6-11:** exact/zero financial truth used to infer technical non-dispatch or release unrelated exposure — FAIL; R8 truth cannot be manufactured.
- **E6-12:** provider-reported/reconciled 12.4 exceeds reservation 10 — preserve 12.4; do not clamp historical truth to authority ceiling.
- **E6-13:** V2 replay changes canonical state relative to historical V1 — preserve which policy/result governed the earlier R7 decision; revised truth may create regression/remediation but cannot rewrite history.
- **E6-14:** reversal-driven release eligibility. E1 reconciles to incurred 40; later legitimate provider-originating reversal evidence nets canonical exposure to 10 under the governing R16 policy. Expected: R15 preserves both the original 40 observation(s) and the reversal observation separately; R16 interprets the reversal semantically and derives net canonical exposure 10; R7 may then evaluate release against that reduced authoritative net under its own release rules. The history must not be rewritten into the fiction that incurred exposure was always 10.

E6-14 is distinct from a correction. A correction revises the interpretation/value of an earlier economic fact; a reversal is a separate economic event with its own append-only evidence that offsets prior exposure under R16 semantics.

## 6. R8 absence scope

This compound does not certify any release whose justification depends on proving:

- provider boundary was never crossed;
- technical non-dispatch;
- exact external success/failure/cancel state;
- any other R8-owned execution truth.

It does certify the financial subset where exact authoritative R15/R16 truth is sufficient for the exact financially governed R7 reservation member being moved.

Financial truth and technical execution truth remain parallel and non-interchangeable.

## 7. Confirmed clean cases

Adversarial review found no additional independent strengthening necessary for:

- release-time reconciliation freshness beyond the carried Compound-02 requirement;
- reservation-member scoping beyond the carried Compound-02 requirement;
- policy-version/history preservation beyond existing R16 regression semantics;
- duplicate observation versus shared/unallocated cost distinction;
- reversal semantic classification itself, which R16 already represents through its `REVERSAL` class;
- R8 absence, provided the certification scope remains explicitly financial-only where R8 truth is not otherwise required.

## 8. Open Phase-C findings

None of the four `MISSING_REQUIRED_COMPOSITION` findings or C21-03 blocks this exact generic financial subset:

- `R17 → R18`
- `R5 → R20`
- `R19 → R14`
- `R19 → R18`
- `R11 → R8` / C21-03

They remain open for their owning wider scenarios.

## 9. Final disposition

**R7 × R15 × R16: PASS WITH ONE NEW FIXTURE-TIER STRENGTHENING, ONE C11-02 EXTENSION, AND ONE NEW ATTACK.**

Canonical results:

1. new Strengthening A: explicit equality between R7 Economic Action/reservation/execution identity and the R15/R16 execution/provider/account identity consumed for release/settlement;
2. C11-02 extension: R16 incomplete statuses must cover every genuinely required financial component before overall settlement can become exact/final for R7 purposes;
3. E6-14: legitimate reversal evidence may reduce net canonical exposure and enable additional R7 release evaluation while preserving both original and reversal history append-only.

No new `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is established.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.