# Phase E Compound 02 — R7 × R8 × R15 × R16 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R7 × R8 × R15 × R16`  
**Implementation authority:** SUSPENDED

## 1. Final result

**PASS at the Phase-E specification/composition level, with three new fixture-tier strengthenings and no new primary cross-node defect.**

R7 owns reservation/admission and release authority. R8 owns exact external-execution truth. R15 owns immutable provider-originating financial observations. R16 owns deterministic canonical financial reconciliation under a versioned policy. Headroom may move only from the composed, exact, current truth of those layers; no one layer may impersonate or erase another.

All live Phase-C dependencies remain governing, including C04-01, C07-02, C09-03, C11-02, C03-01/C25-03, C19-01, and reciprocal C38-06/07/08/09.

## 2. Strengthening A — conjunctive release

> **Full release of an exact execution's R7 reservation exposure requires the governing R8 execution truth and governing R16 financial truth to jointly support that release for the specific reservation members being moved. R8 non-dispatch alone does not imply zero financial exposure.**

Fixture: E1 may reach R8 `RECONCILED_NOT_DISPATCHED` for the substantive operation while R15/R16 legitimately preserve an attempt/request fee. R7 must preserve the incurred financial exposure and may release only what the composed truth supports. Neither layer rewrites the other. Unresolved financial truth remains conservative.

This is fixture-tier strengthening, not `MISSING_REQUIRED_COMPOSITION`: composition exists, but the conjunction was not explicit enough to prevent cherry-picking the favorable layer.

## 3. Strengthening B — reconciliation freshness at release

> **An R16 result consumed for R7 release must be current through the complete applicable durable R15 evidence set as of the actual release boundary, or carry a governed freshness/watermark rule proving no newer applicable durable evidence invalidates it.**

Fixture: R16 computes C1 from evidence set S1 at T1. Before R7 release at T2, R15 durably appends F2, making S2. C1 must identify the evidence-set/version/cutoff it reconciled. R7 must fail closed or trigger re-reconciliation rather than release against stale C1. If F2 was already durable before release, the case is a stale-at-release defect; if F2 genuinely arrives later, it belongs to the regression case below.

## 4. Strengthening C — reservation-set member scoping

One execution may hold multiple R7 reservations across distinct resource classes.

> **R7 may release only the exact reservation-set members whose governing authoritative evidence actually supports release. A financial R16 result cannot silently release non-cash entitlement, quota, or concurrency reservations that it did not adjudicate.**

Fixture: E1 holds cash reservation C1 and entitlement reservation Q1. R16 authoritative zero/settled cash exposure may support evaluation of C1 under R7 rules, but does not release Q1. Q1 requires its own governing release basis. The reverse is also true. Restart/audit must preserve exact reservation-member identity rather than generic `exposure released` state.

This carries the exact reservation-set multiplicity principle, including C38-12, into the financial-release boundary.

## 5. Compound attacks

- **E2-1:** reservation mistaken for dispatch/incurred truth — FAIL.
- **E2-2:** timeout, worker death, lease loss, cancel intent, or local exception used as release evidence — FAIL.
- **E2-3:** valid R15 observation promotes R8 technical state — FAIL.
- **E2-4:** R8 technical success treated as exact financial settlement while R15/R16 remain unresolved — FAIL.
- **E2-5:** provider reports 12.4 against reservation 10; preserve 12.4, do not clamp reality to authority.
- **E2-6:** account/shared financial evidence not attributable to E1/E2 remains shared/unallocated, including `UNALLOCATED_SHARED_COST` where applicable.
- **E2-7:** R16 `BOUNDED` treated as `EXACT` or free headroom — FAIL. C11-02 remains live. Its fixture must also correlate bounded interpretation with R8 execution state and R15 evidence completeness; bounded while R8 is non-terminal is not assumed equivalent to bounded after terminal execution truth with pending final financial evidence.
- **E2-8:** downward correction self-releases headroom — FAIL; R7 remains release owner.
- **E2-9:** genuinely later correction after a properly fresh release. Preserve historical release/downstream authority; later corrected truth may create `FINANCIAL_RECONCILIATION_REGRESSION` and owned remediation. If adverse evidence was already durable before release, use E2-11 instead.
- **E2-10:** cross-truth conflict/cherry-picking — apply Strengthening A; R7 cannot use only the release-permissive layer.
- **E2-11:** stale reconciliation at release — apply Strengthening B; fail closed or re-reconcile.
- **E2-12:** later policy V2 changes interpretation of evidence historically reconciled under V1. V2 may revise current truth but cannot rewrite which policy/result governed the historical decision; inconsistency becomes owned regression/remediation.
- **E2-13:** duplicate observation double-counting. If the same underlying provider charge/event reaches R15 through two legitimate channels, R16 must deduplicate semantic economic effect using provider-native event identity where available, or the governed synthetic identity mechanism where necessary. One real-world charge must not be counted twice merely because it was observed twice; distinct events must not collapse because amounts/times resemble one another.

E2-13 is distinct from E2-6: E2-6 is one shared event with uncertain execution attribution; E2-13 is duplicate observation of one identifiable underlying event.

## 6. Pairwise-correct but compound-unsafe cases

Pairwise correctness does not exhaust this compound:

- R8 non-dispatch can coexist with real provider fees.
- R16 can be correct over S1 yet stale against already-durable S2 at the release boundary.
- R16 can prove cash exposure while saying nothing about non-cash reservation members.
- each layer can preserve its own truth while R7 still acts unsafely if it cherry-picks only the favorable layer.
- duplicate legitimate observations can corrupt canonical exposure without any observation itself being false.

## 7. C21-03 carveout

C21-03 (`R11 → R8`) does not block this compound's normal-path certification. When R8 reaches `EXPOSURE_COMMITTED_UNRECONCILABLE`, this compound must preserve that truth and keep exposure conservative rather than fabricate terminal execution or settlement. The unresolved downstream R11 disposition remains outside this four-node certification and remains open.

## 8. Final disposition

**R7 × R8 × R15 × R16: PASS WITH THREE NEW FIXTURE-TIER STRENGTHENINGS.**

The strengthenings are:

1. conjunctive release across R8 execution truth and R16 financial truth;
2. R16 evidence-set/version freshness at the actual R7 release boundary;
3. release scoped to exact R7 reservation-set members actually covered by governing evidence.

The certification also adds E2-13 duplicate-observation handling, narrows E2-9 to genuinely later evidence, and refines the existing C11-02 `BOUNDED` fixture for R8 terminality and R15 evidence completeness.

No new primary `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is established.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.