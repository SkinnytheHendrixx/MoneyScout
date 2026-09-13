# Phase E Compound 02 — R7 × R8 × R15 × R16

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** E — Compound Certification  
**Compound:** `R7 × R8 × R15 × R16`  
**Implementation authority:** SUSPENDED

## 1. Scope and ownership

This compound asks whether scarce-resource reservation, exact external-execution truth, provider-originating financial evidence, and deterministic canonical reconciliation compose safely before headroom moves.

The ownership split is fixed:

- **R7** owns admission, reservation, conservative headroom, and release authority.
- **R8** owns whether/how the exact external provider boundary was crossed and the authoritative state of that execution.
- **R15** owns immutable provider-originating financial observation capture with exact execution/provider/account provenance.
- **R16** owns canonical financial interpretation/reconciliation of the complete immutable R15 evidence set under a versioned policy.

No node may impersonate another. A reservation does not prove dispatch or incurred cost; technical execution state does not prove financial settlement; a financial observation does not determine R8 technical terminality; a reconciled financial number does not itself release R7 headroom.

## 2. Governing Phase-C requirements carried forward

This review consumes the following committed Phase-C results and their live dependencies:

- **C04-01 `R7 → R8`** — R8 authoritative non-dispatch/reconciliation truth may permit R7 release; R7 remains the release owner. Local worker failure is not release evidence.
- **C07-02 `R8 → R15`** — exact R8 execution provenance must be preserved, and even exact R15 financial evidence must not by itself promote R8 to `SUCCEEDED`, `FAILED`, `CANCELLED`, or `RECONCILED_NOT_DISPATCHED`.
- **C09-03 `R7 → R15`** — absence of a convenient R15 row cannot become proof of zero incurred cost or safe release; missing/unresolved provider-financial evidence must remain durably owned/conservative.
- **C11-02 `R7 → R16`** — R7 consumes canonical R16 truth for settlement/release, while `BOUNDED` remains subject to the live strengthening requiring explicit bound semantics and an explicit conservative release rule before R7 may consume it.
- **C03-01 / C25-03 `R15 ↔ R16`** — raw evidence and canonical interpretation remain separate monotonic layers; R16 consumes the complete immutable R15 observation set under a versioned policy and may not rewrite R15 history.
- **C19-01 `R8 → R16`** — R16 binds financial interpretation to exact R8 execution identity through R15 where applicable; account/shared financial evidence that cannot be causally attributed to one execution must remain shared/unallocated rather than opportunistically attached.
- **C38-06 `R15 → R7`** — observed provider reality remains exact even when it exceeds or disagrees with R7 authorization; C09-03's missing-financial-evidence fixture remains live.
- **C38-07 `R15 → R8`** — exact financial observation does not self-promote R8 execution state; C07-02 remains live.
- **C38-08 `R16 → R7`** — even authoritative downward financial correction does not itself create release authority; R7 applies its own release rules.
- **C38-09 `R16 → R8`** — R16 reaches R8 through exact R15 provenance where applicable; C19-01's shared/unallocated attribution fixture remains live.

## 3. Canonical affirmative control

For one exact consequential execution E1:

1. R7 atomically creates the exact Economic Action / reservation set for E1 and binds the exact execution relationship before dispatch eligibility.
2. R8 durably establishes exact execution identity E1 before the provider boundary and preserves whether/how that exact boundary was crossed.
3. R15 appends all legitimately observed provider-originating financial evidence for E1 without clamping, normalization, overwrite, or provider/account substitution.
4. R16 consumes the complete applicable immutable R15 observation set for E1 under explicit reconciliation policy V1 and produces canonical financial state/status deterministically.
5. R7 consumes the exact applicable R8/R16 truths for E1 under its own conservative release rules.
6. Headroom moves only when the combined state supports that movement; no favorable truth from one layer may erase unresolved or adverse truth in another.
7. Historical records remain immutable: later corrections/reconciliation revisions append/recompute truth rather than rewriting prior reservation, execution, evidence, or release history.

## 4. Deliberate compound attacks

### E2-1 — reservation mistaken for execution or incurred truth

R7 has a valid reservation for E1, but the provider boundary has not been authoritatively established as crossed and no financial evidence exists.

**Expected:** reservation alone proves neither dispatch nor incurred/settled financial truth.

### E2-2 — local failure used as release evidence

Worker timeout, death, lease loss, cancellation intent, or local exception occurs after E1 may have crossed the provider boundary.

**Expected:** exposure remains conservative until R8-authoritative truth supports the next state; local failure does not release headroom.

### E2-3 — exact financial observation promotes technical execution state

R15 receives a valid provider charge/usage observation bound to E1 while R8 remains technically uncertain.

**Expected:** preserve the financial evidence and financial consequences without promoting R8 to a terminal technical state merely because the observation exists.

### E2-4 — technical success treated as financial settlement

R8 says E1 `SUCCEEDED`, but R15 evidence is absent, provisional, conflicting, or R16 is `AWAITING_FINAL`, `PARTIAL`, `CONFLICT`, `UNRECONCILED`, or otherwise unresolved.

**Expected:** technical success cannot manufacture exact financial settlement or optimistic headroom release.

### E2-5 — provider-reported amount exceeds reservation

R7 reserved 10 units, but R15 legitimately observes 12.4 units for E1.

**Expected:** R15 preserves 12.4 exactly; R16 reconciles the actual evidence; R7 authorization history is not used to clamp reality. Excess exposure becomes governed financial/resource truth and, where required, owned remediation rather than rewritten evidence.

### E2-6 — shared observation opportunistically attached

E1 and E2 share one provider/account. R15 observes an account/invoice-level amount that cannot yet be causally assigned to either execution.

**Expected:** R16 preserves it as shared/unallocated under governing policy, including `UNALLOCATED_SHARED_COST` where applicable. Neither E1 success nor E2 uncertainty may absorb it opportunistically.

### E2-7 — `BOUNDED` treated as `EXACT`

R16 produces `BOUNDED` for E1 without a frozen, explicit release interpretation.

**Expected:** R7 may not treat `BOUNDED` as exact settlement, zero residual exposure, or generic permission to free headroom. C11-02's bound-representation/release-rule strengthening remains mandatory.

### E2-8 — downward correction self-releases headroom

R16 authoritatively revises E1's incurred amount downward.

**Expected:** the revised financial truth may inform R7, but R16 does not itself release resource authority. R7 owns release under its governing rules.

### E2-9 — late correction after prior release

R7 previously released headroom based on then-governing evidence. Later R15 evidence or policy-correct replay increases canonical exposure.

**Expected:** preserve the historical release and any downstream authority already exercised; R16 records/derives the corrected truth and `FINANCIAL_RECONCILIATION_REGRESSION` where applicable; the system owns the unsupported exposure/remediation rather than retroactively pretending the release or downstream execution never occurred.

### E2-10 — cross-truth conflict cherry-picking

For the same exact E1, one truth appears release-permissive while another is materially adverse or inconsistent. Example: R8 reaches an apparently terminal/non-dispatch disposition while legitimate R15/R16 evidence still indicates financially material exposure for E1.

**Expected:** R7 must not cherry-pick the favorable layer. The combined state must remain conservative until the discrepancy is governed/resolved. R8 technical truth cannot erase financial evidence; financial evidence cannot rewrite R8 history.

This is a compound-level consistency requirement: each pairwise seam may be locally correct while the four-node state is globally inconsistent.

### E2-11 — stale reconciliation at release boundary

At T1, R16 computes a correct canonical state from R15 evidence set S1. Before R7 actually releases headroom at T2, a new applicable R15 observation F2 is durably appended, making the authoritative evidence set S2 = S1 + F2. R7 nevertheless consumes the stale T1 R16 result.

**Expected candidate rule:** R7 must not release against a reconciliation result that is stale relative to already-durable applicable R15 evidence at the actual release boundary. The consumed R16 result must carry enough evidence-set/version/cutoff provenance to establish what observation set it reconciled, and release must fail closed or re-reconcile if newer applicable evidence is already durable.

This is the standing Phase-E timing/staleness check applied to Compound 02. Whether the existing contracts already imply this strongly enough, or whether it requires a new fixture-tier strengthening, is intentionally left for adversarial review.

### E2-12 — policy-version substitution

R16 reconciliation under policy V1 justified a historical settlement/release decision. Policy V2 later produces a different canonical interpretation from the same R15 evidence.

**Expected:** V2 may revise current canonical truth but must not rewrite which policy/result actually governed the historical R7 decision. Any resulting inconsistency with executed history becomes owned remediation/regression, not retroactive fiction.

## 5. Provisional disposition

**Provisional result: PASS at the Phase-E specification/composition level, subject to all carried Phase-C strengthenings and adversarial review of E2-10/E2-11.**

No new primary `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is presently established.

The compound-level additions beyond pairwise review are especially:

- cross-truth conflict must not be resolved by cherry-picking the most release-permissive layer;
- the exact execution/reservation/evidence/reconciliation history must stay aligned across all four nodes;
- later evidence/policy revisions preserve historical decisions while creating owned regression/remediation where required;
- release-time freshness of the consumed reconciliation result must be tested explicitly rather than assumed.

## 6. Requested adversarial review

Please independently challenge the compound on these questions:

1. **E2-10 conflict handling:** Do the existing R7/R8/R15/R16 contracts already deterministically require conservative treatment whenever their exact-execution truths conflict, or is a new explicit conflict-composition strengthening required?
2. **E2-11 timing/staleness:** Does the corpus already require an R16 result consumed for R7 release to be current through the complete applicable R15 evidence set at the actual release boundary, or is a new evidence-set/version/watermark binding strengthening required?
3. **Exact correspondence:** Is the existing chain `R7 exact reservation-set ↔ exact R8 execution ↔ exact R15 observation provenance → exact R16 interpretation` sufficient, or is a separate direct binding from R16 canonical result back to the exact R7 reservation set needed to prevent release against the wrong reservation when one execution has multiple resource reservations?
4. **R8 non-dispatch vs financial evidence:** Can an authoritative `RECONCILED_NOT_DISPATCHED` ever coexist legitimately with a financially material R15/R16 observation for that exact execution (for example provider fees not requiring consequential boundary crossing), and if so what does that imply for release? Do not assume these facts are logically impossible without checking the contract semantics.
5. **R16 `BOUNDED`:** Does C11-02's existing strengthening fully cover the compound's bounded-release problem, or does the four-node composition require additional correspondence with R8 execution state and R15 evidence completeness?
6. **Regression boundary:** Does E2-9 correctly distinguish unavoidable later correction from a stale-at-release defect? In other words, is the historical release acceptable when the adverse evidence genuinely did not yet exist, but defective when the evidence was already durable and merely unreconciled/stale?
7. **Open Phase-C findings:** Does C21-03 (`R11 → R8` and `EXPOSURE_COMMITTED_UNRECONCILABLE`) block this compound's normal-path certification, or should it remain an explicitly carved-out exceptional state whose corrective disposition is unresolved even though the four-node financial/execution truths remain preservable?
8. Find any four-node failure mode in which every direct pairwise seam is individually correct but headroom can still move unsafely.

Do not accept the provisional PASS merely because all six pairwise relationships are non-contradictory. The question is whether the complete reservation → execution → evidence → reconciliation → release story remains safe under timing races, contradictory truths, shared evidence, corrections, and historical replay.