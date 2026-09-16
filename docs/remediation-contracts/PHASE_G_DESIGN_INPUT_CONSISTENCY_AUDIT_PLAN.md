# Phase G — Design Input Consistency Audit Plan

**Status:** ACTIVE AUDIT PLAN / NON-AUTHORITATIVE UNTIL REVIEWED  
**Phase:** G — Design Input Consistency  
**Implementation authority:** SUSPENDED

## 1. Purpose

Phase G audits whether every recovered node R1–R20 carries a scope-aware, mutually consistent Design Input disposition and whether activated Design Inputs retain the exact scope, ownership, and semantics required by the governing corpus.

This phase does **not** implement or remediate Design Input findings. It classifies consistency, scope propagation, activation, ownership, and naming so later remediation cannot silently broaden, narrow, rename, or erase a Design Input obligation.

Phase G begins only after Phase F audit closure. Phase-F result remains:

`AUDIT CLOSED / CURRENT REPRESENTATION FAILS / REMEDIATION OPEN`

Nothing in Phase G restores implementation authority.

## 2. Governing authority

Primary governing artifact:

- `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md` — blob `133b1a05637a2c39f341ffac61c46b375421109e`

Relevant governing rule from Phase G:

Every node must have a scope-aware Design Input disposition. For DI-1 and DI-2, Phase G must verify:

- reviewed status;
- activation status;
- exact activation scope where active;
- `CONSUME`, `SUPERSEDE`, or `NOT ACTIVATED` disposition where applicable;
- provider/account identity consistency across R6/R7/R8/R17/R18/R19/R20;
- no scope activation silently broadened to unrelated nodes;
- no activated scope silently collapsed back into generic unnamed Design Input language;
- DI-2 reversal authority activates only where Money Scout autonomously dispatches the external reversal, not merely where reversal evidence/history is represented;
- named scope `DI-1/COMMERCIAL_PAYMENT` remains stable wherever consumed.

Global audit Refinement 1 remains governing where applicable:

- `GLOBAL_FIDELITY_CROSS_NODE_AUDIT-REFINEMENT-1.md` — blob `3ce74a7fc5096af90672aafdcf15ad1b046258d8`

Phase-F closure certification is the immediate predecessor state:

- `PHASE_F_SYNTHESIS_CLOSURE_CERTIFICATION.md`

Phase G must not reinterpret Phase-F findings as remediated merely because the Design Input language is consistent.

## 3. Design Input semantic anchors

### DI-1 — provider/account identity plurality

The recovered corpus consistently uses DI-1 for scopes where provider/account identity can be consequentially plural and where substituting one provider/account for another can alter authority, capability, financial truth, execution truth, or commercial authority.

Phase G does **not** assume DI-1 activates globally merely because a node mentions providers or accounts.

The audit question is always scope-specific:

> Does this node actually own, consume, depend on, or materially transform provider/account identity in a way that activates DI-1 here?

Where active, exact provider/account identity must remain stable through the consuming chain. Generic provider-family equivalence is insufficient if account identity is material.

Named scope `DI-1/COMMERCIAL_PAYMENT` is load-bearing and must remain exactly recognizable wherever it is consumed.

### DI-2 — autonomous outbound payment reversal execution

DI-2 activates only where Money Scout autonomously dispatches an external refund/cancel/void/reversal or equivalent outbound reversal action.

The following **do not activate DI-2 by themselves**:

- observing a provider reversal;
- storing reversal history;
- reconciling reversal evidence;
- computing canonical financial truth from a reversal;
- scheduling a reversal-related obligation without dispatching it;
- evaluating whether reversal authority exists;
- preserving prior reversal provenance.

Phase G must therefore distinguish:

- reversal **truth/evidence representation**;
- reversal **eligibility/authority evaluation**;
- reversal **external execution/dispatch**.

Only the third activates DI-2 as execution authority.

### DI-1 × DI-2 dispatch-boundary composition

Where DI-2 is active because Money Scout autonomously dispatches a refund/cancel/void/reversal, that same consequential provider call must independently satisfy DI-1 for the **exact provider/account identity actually targeted by the dispatch** wherever provider/account plurality is material.

DI-2 answers whether the system has authority to perform the reversal action. DI-1 answers whether the action is bound to the correct exact provider/account identity. One does not imply the other.

Therefore a reversal can be correctly authorized under DI-2 and still fail Phase G if it is dispatched against a different current/default provider/account than the one whose reversal eligibility was evaluated.

## 4. Required corpus inventory

Before any Phase-G consistency judgment is final, derive a Design Input inventory for **all R1–R20** from their current committed recovered contracts.

For each node record:

| Field | Required |
|---|---|
| Node | R1–R20 |
| Contract path | exact file path |
| Blob SHA | immutable reviewed version |
| DI-1 reviewed? | YES / NO / SOURCE GAP |
| DI-1 activation | ACTIVE / NOT ACTIVATED / CONDITIONAL / UNRESOLVED |
| DI-1 exact scope | named scope(s) or NONE |
| DI-1 disposition | CONSUME / SUPERSEDE / NOT ACTIVATED / UNRESOLVED |
| DI-1 upstream owner/source | exact node/scope if consumed |
| DI-2 reviewed? | YES / NO / SOURCE GAP |
| DI-2 activation | ACTIVE / NOT ACTIVATED / CONDITIONAL / UNRESOLVED |
| DI-2 exact scope | named scope(s) or NONE |
| DI-2 disposition | CONSUME / SUPERSEDE / NOT ACTIVATED / UNRESOLVED |
| DI-2 upstream owner/source | exact node/scope if consumed |
| Exact-name confidence | CONFIRMED / SEMANTIC_ONLY / SOURCE_NOT_RECOVERABLE |
| Notes | scope boundaries / rejected broadening / source gap |

A missing Design Input section is not automatically `NOT ACTIVATED`. It must be classified as missing/unresolved unless neighboring frozen authority proves the intended disposition.

## 5. Phase-G finding taxonomy

Use the following audit-level classifications.

### `DI_CONSISTENT`

The node's reviewed/activation/scope/disposition matches governing upstream semantics and no cross-node drift is found.

### `DI_SCOPE_BROADENED`

A Design Input activated for a specific scope is silently applied to unrelated scope(s) without authority.

### `DI_SCOPE_NARROWED`

A required activated scope is omitted, weakened, or reduced downstream.

### `DI_SCOPE_COLLAPSED`

A named activated scope is reduced to generic unnamed DI language such that the exact scope cannot be reliably traced.

### `DI_ACTIVATION_MISCLASSIFIED`

A node marks a Design Input active when the triggering condition is not present, or inactive where the triggering condition is actually present.

### `DI_DISPOSITION_MISMATCH`

`CONSUME`, `SUPERSEDE`, or `NOT ACTIVATED` does not match the governing ownership/consumption relationship.

### `DI_IDENTITY_SEMANTIC_DRIFT`

Provider/account identity, scope identity, or reversal-execution semantics change materially between nodes even if DI labels remain present.

### `DI_NAMED_SCOPE_DRIFT`

A frozen named scope such as `DI-1/COMMERCIAL_PAYMENT` is renamed, aliased ambiguously, or consumed without preserving the exact canonical scope identity.

### `DI_OWNERSHIP_MISATTRIBUTION`

A node claims to own a Design Input rule that belongs upstream/downstream, or delegates ownership where it actually owns the triggering execution scope.

### `DI_SOURCE_UNRESOLVED`

Available source is insufficient to determine exact activation/disposition/scope without inference.

### `DI_ASSURANCE_OVERCLAIM`

A Design Input disposition is presented as exact/frozen beyond the available source assurance.

A single physical implementation surface may implicate multiple independently distinct Design Input requirements. Do not merge findings merely because they share code or storage.

## 6. Mandatory DI-1 consistency cluster

The global audit explicitly names the high-risk provider/account chain:

`R6 → R7 → R8 → R17 → R18 → R19 → R20`

Phase G must review each node individually **and** the cluster as one identity-preserving chain.

At minimum prove:

1. R6 verification truth names the exact provider/account identity where material.
2. R7 admission/reservation does not replace exact provider/account identity with provider family or current/default account.
3. R8 external execution truth remains bound to the exact provider/account actually crossed.
4. R17 commercial Offer/Grant semantics do not silently substitute a different payment provider/account.
5. R18 Capability Binding preserves exact provider/account identity and lifecycle state for the bound operation.
6. R19 Commercial Authority Lineage embeds the exact relevant commercial provider/account authority rather than reconstructing from current state.
7. R20 consumes the exact bound identity at the consequential boundary rather than re-resolving current/default provider/account.
8. successor histories do not inherit DI-1 authority merely because provider family or Asset matches.
9. `DI-1/COMMERCIAL_PAYMENT` remains named and stable where the commercial-payment scope is active.
10. nodes outside the activated scope are not silently burdened with commercial-payment DI-1 merely because they participate elsewhere in the hard chain.

Phase-F representability failures are relevant evidence but are not themselves Phase-G DI defects unless the Design Input semantics/disposition are inconsistent.

## 7. Mandatory DI-2 consistency cluster

Audit every node that mentions or can participate in refund/cancel/void/reversal behavior, with special attention to R7/R8/R15/R16/R19/R20 and any worker/execution node that can actually dispatch the reversal.

Required separation:

### Evidence/history only

R15-like provider observation of a reversal does not activate DI-2.

### Reconciliation only

R16 interpretation/netting of reversal evidence does not activate DI-2.

### Eligibility/authority only

R20 or another gate evaluating whether a reversal would be allowed does not activate DI-2 unless that same scope owns autonomous dispatch.

### Runnable scheduling only

R12 scheduling of a reversal-related obligation does not by itself activate DI-2.

### External dispatch

The exact node/scope that autonomously calls the provider to refund/cancel/void/reverse **does activate DI-2** and must carry the corresponding exact authority/disposition.

At that external dispatch boundary, Phase G must also independently verify the DI-1 provider/account binding for the exact target of the reversal call. DI-2 authority cannot substitute for DI-1 target identity, and DI-1 identity cannot substitute for DI-2 reversal authority.

Phase G must detect both false positives and false negatives:

- over-broad activation because reversal history exists;
- missing activation because actual autonomous reversal dispatch exists under generic payment/external-action language;
- correctly evaluated reversal eligibility later consumed against a different current/default provider/account;
- DI-2-correct dispatch authority combined with DI-1-incorrect provider/account targeting.

## 8. Cross-node tests

Every active Design Input scope must survive the following attacks.

### G-A1 — scope broadening

A node consumes `DI-1/COMMERCIAL_PAYMENT`; a downstream node silently applies the same activation to unrelated provider/account activity.

Expected: FAIL as `DI_SCOPE_BROADENED`.

### G-A2 — scope narrowing

An upstream exact provider/account scope is active; downstream consumer drops account identity and keeps only provider family.

Expected: FAIL as `DI_SCOPE_NARROWED` and/or `DI_IDENTITY_SEMANTIC_DRIFT`.

### G-A3 — named-scope collapse

`DI-1/COMMERCIAL_PAYMENT` becomes generic `DI-1` with no stable commercial-payment scope identity.

Expected: FAIL as `DI_SCOPE_COLLAPSED` / `DI_NAMED_SCOPE_DRIFT`.

### G-A4 — current/default account substitution

Historical authority is bound to provider/account A1; boundary consumption uses whichever account A2 is current/default.

Expected: FAIL as `DI_IDENTITY_SEMANTIC_DRIFT`.

### G-A5 — reversal-evidence false activation

A node merely observes/reconciles a provider reversal but marks DI-2 ACTIVE as though it owns outbound reversal authority.

Expected: FAIL as `DI_ACTIVATION_MISCLASSIFIED`.

### G-A6 — reversal-dispatch false negative

A node autonomously dispatches refund/cancel/void/reversal but says DI-2 NOT ACTIVATED because financial truth is owned elsewhere.

Expected: FAIL as `DI_ACTIVATION_MISCLASSIFIED` / `DI_OWNERSHIP_MISATTRIBUTION`.

### G-A7 — scheduler laundering

R12 schedules a reversal-related job and is treated as the source of reversal execution authority.

Expected: FAIL. Scheduling does not create DI-2 authority.

### G-A8 — evidence laundering

R15/R16 reversal evidence is treated as retrospective proof that the original reversal execution was authorized.

Expected: FAIL. Observed truth does not manufacture prior DI-2 authority.

### G-A9 — successor inheritance

A new Offer/Grant/Binding/Lineage/Boundary Decision inherits predecessor DI activation merely because parent Asset/provider matches.

Expected: FAIL unless exact governing successor semantics independently authorize the new scope.

### G-A10 — inactive-scope contamination

A node explicitly marked NOT ACTIVATED is later cited as if it had positively granted the Design Input authority.

Expected: FAIL as authority laundering / disposition mismatch.

### G-A11 — DI-2 eligibility-to-dispatch scope drift

At T1, reversal eligibility/authority is correctly evaluated for exact scope and provider/account identity A1. At T2, the outbound refund/cancel/void/reversal dispatch is executed against whichever scope/provider/account is current/default, such as A2, rather than the exact A1 that was evaluated.

Expected: FAIL as `DI_IDENTITY_SEMANTIC_DRIFT`. A correct earlier eligibility decision does not authorize consumption against a materially different later identity.

### G-A12 — DI-1 × DI-2 dispatch-boundary mismatch

A reversal dispatch is correctly authorized under DI-2, but the actual external provider call targets the wrong provider/account identity under DI-1; or the exact provider/account identity is correct under DI-1 but no valid DI-2 reversal authority exists for that action.

Expected: FAIL. The first direction is `DI_IDENTITY_SEMANTIC_DRIFT`; the second is `DI_ACTIVATION_MISCLASSIFIED` and/or `DI_OWNERSHIP_MISATTRIBUTION`. Both Design Inputs must independently hold at the exact outbound reversal boundary.

## 9. Batch sequence

### G0 — corpus Design Input inventory

Read current R1–R20 contracts and build the complete matrix with immutable blob SHAs.

No consistency finding may be finalized until G0 covers 20/20 nodes.

### G1 — DI-1 node-by-node consistency

Audit every node's DI-1 reviewed status, activation, scope, disposition, exact naming, and ownership.

### G2 — DI-1 high-risk provider/account compound

Audit `R6/R7/R8/R17/R18/R19/R20` as one scope-preserving chain, including `DI-1/COMMERCIAL_PAYMENT`.

### G3 — DI-2 node-by-node consistency

Audit every node's DI-2 disposition and distinguish evidence/reconciliation/scheduling/eligibility from actual external reversal dispatch. For every DI-2-active dispatch scope, also record the exact DI-1 provider/account identity required at that dispatch boundary.

### G4 — cross-node adversarial scope attacks

Run G-A1 through G-A12 against all active/conditional scopes and any source-unresolved disposition.

### G5 — final Design Input consistency matrix and synthesis

Produce canonical Phase-G matrix and closure certification containing:

- 20/20 node inventory;
- all DI findings and exact owners/scopes;
- named-scope stability result;
- DI-1 compound result;
- DI-2 dispatch-boundary result;
- DI-1 × DI-2 dispatch-boundary composition result;
- unresolved source items with explicit resolution triggers;
- invalidation map.

## 10. Evidence standard

For every final disposition:

1. cite the exact node contract path and immutable blob SHA;
2. quote or accurately paraphrase the node's actual Design Input section;
3. identify any upstream/downstream contract consumed;
4. distinguish exact frozen naming from semantic-only recovery;
5. if implementation behavior is needed to decide whether DI-2 actually dispatches externally, inspect the exact worker/adapter/provider call path rather than inferring from labels;
6. distinguish database-enforced, application-enforced, and prose-only behavior where implementation evidence becomes relevant;
7. never infer `NOT ACTIVATED` from silence;
8. where DI-2 activation is established, trace eligibility/authority identity through the actual T1→T2 dispatch boundary and verify that the consumed provider/account target remains the exact DI-1 identity evaluated.

A node may be semantically consistent while exact historical wording remains source-unresolved. Record that distinction rather than forcing one classification to cover both.

## 11. Finding independence and anti-inflation

Do not create multiple Phase-G findings for the same violated invariant merely because it appears in several files.

Do create distinct findings where one shared physical representation violates independently testable Design Input requirements with different closure criteria.

Tests for finding independence:

1. Can finding A be fully repaired while finding B remains broken?
2. Do they have different acceptance proofs?
3. Do they belong to different activation scopes or owners?
4. Would one correction necessarily and completely satisfy the other?

If correction of A necessarily closes B under the same invariant, retain B as supporting scope rather than a second primary finding.

The DI-1 × DI-2 dispatch composition does not automatically create two findings for one bad call. Count separately only where provider/account identity correctness and reversal-authority correctness have independently repairable acceptance criteria; otherwise preserve one as supporting scope under the other.

## 12. Source-gap handling

If exact Design Input naming, activation history, or disposition wording is not recoverable:

- classify `DI_SOURCE_UNRESOLVED`;
- name the source checked;
- state whether semantics are still constrained by neighboring contracts;
- do not reconstruct exact labels from memory or convention;
- carry the item into Phase H's global source-gap register.

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` is not evidence that the original Design Input did not exist.

## 13. Invalidation rules

Any later amendment to a node contract invalidates:

- that node's G0 inventory row;
- its G1 and/or G3 node disposition;
- every G2/G4 cross-node test consuming that node;
- final G5 synthesis claims derived from those checks.

At minimum:

- R6/R7/R8 changes invalidate DI-1 provider/account chain checks;
- R17/R18/R19/R20 changes invalidate `DI-1/COMMERCIAL_PAYMENT` and commercial authority propagation checks;
- any change to actual refund/cancel/void/reversal eligibility or dispatch code invalidates G-A11 and the DI-2 dispatch-boundary determination;
- any change to provider/account selection/binding at a reversal-dispatch boundary invalidates G-A12 and the DI-1 × DI-2 composition result;
- amendments changing exact Design Input names invalidate exact-name claims even if semantics stay stable.

No Phase-G conclusion may outlive the immutable versions it actually checked.

## 14. Closure criteria

Phase G may close as an audit only when:

1. all 20 nodes have a durable DI-1 and DI-2 inventory disposition;
2. every active/conditional scope has an exact owner and activation boundary or an explicit unresolved-source classification;
3. `DI-1/COMMERCIAL_PAYMENT` stability has been checked across all consumers;
4. provider/account identity consistency across R6/R7/R8/R17/R18/R19/R20 has been adjudicated;
5. DI-2 has been checked against actual external reversal-dispatch ownership, not merely reversal evidence/history;
6. every DI-2-active dispatch has been checked for T1→T2 eligibility-to-dispatch identity stability and exact DI-1 provider/account composition;
7. G-A1 through G-A12 have been run wherever applicable;
8. all findings are durably registered with scope and invalidation rules;
9. unresolved items have explicit resolution triggers rather than open-ended deferral;
10. adversarial review has been adjudicated;
11. final status clearly distinguishes audit closure from remediation/implementation closure.

Implementation authority remains **SUSPENDED** after Phase-G audit closure unless and until the governing global audit sequence separately authorizes restoration.

## 15. Required Phase-G outputs

1. `PHASE_G_DESIGN_INPUT_INVENTORY.md`
2. one or more DI-1 review batches
3. DI-1 high-risk compound certification
4. one or more DI-2 review batches
5. cross-node scope-attack certification
6. `PHASE_G_DESIGN_INPUT_CONSISTENCY_MATRIX.md`
7. `PHASE_G_SYNTHESIS_CLOSURE_CERTIFICATION.md`

This plan is non-remediation authority. It defines the audit method only.