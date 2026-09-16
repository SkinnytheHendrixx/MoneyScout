# Phase G — G4 Cross-Node Adversarial Scope Attacks Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / G4 CERTIFIED  
**Phase:** G — Design Input Consistency  
**Batch:** G4 — G-A1 through G-A12 cross-node adversarial attacks  
**Implementation authority:** SUSPENDED

## 1. Certification result

G4 is certified with **zero new Phase-G findings**.

The full twelve-attack suite resolves as follows:

- G-A1 scope broadening — PASS;
- G-A2 scope narrowing — FAIL through existing G2-01;
- G-A3 named-scope collapse — PASS;
- G-A4 current/default account substitution — FAIL through existing G2-01;
- G-A5 reversal-evidence false activation — PASS;
- G-A6 reversal-dispatch false negative — PASS on the reviewed current implementation;
- G-A7 scheduler laundering — PASS;
- G-A8 evidence laundering — PASS;
- G-A9 successor inheritance — FAIL condition, fully folded into existing G2-01;
- G-A10 inactive-scope contamination — PASS;
- G-A11 DI-2 eligibility-to-dispatch scope drift — NOT CURRENTLY TRIGGERED;
- G-A12 DI-1 × DI-2 dispatch-boundary mismatch — NOT CURRENTLY TRIGGERED.

Three different attacks therefore expose the same already-confirmed invariant failure, and anti-inflation requires one finding rather than three:

**G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`.**

No second independently-remediable Design Input invariant survived adversarial review.

## 2. Predecessor state

- G0: Design Input inventory certified 20/20.
- G1: all R1–R20 node-level DI-1 dispositions certified `DI_CONSISTENT`.
- G2: FAIL with one confirmed finding, G2-01.
- G3: PASS, R1–R20 DI-2 20/20 `DI_CONSISTENT`, no reviewed current autonomous outbound payment-reversal dispatch.

G4 tests whether the complete attack suite reveals any additional cross-node Design Input defect or falsifies G3's DI-2 present-state result.

## 3. Governing attack semantics

The governing Phase-G plan requires execution of:

- G-A1 scope broadening;
- G-A2 scope narrowing;
- G-A3 named-scope collapse;
- G-A4 current/default account substitution;
- G-A5 reversal-evidence false activation;
- G-A6 reversal-dispatch false negative;
- G-A7 scheduler laundering;
- G-A8 evidence laundering;
- G-A9 successor inheritance;
- G-A10 inactive-scope contamination;
- G-A11 DI-2 eligibility-to-dispatch scope drift;
- G-A12 DI-1 × DI-2 dispatch-boundary mismatch.

Finding independence and anti-inflation remain governing: multiple attack failures do not become multiple findings where the same correction necessarily closes them all.

## 4. Direct implementation evidence added during G4 review

### 4.1 R11 corrective/human reconciliation

`artifacts/api-server/src/lib/human-action-reconciler.ts`  
Blob: `3b255e2be70f31d2b02e32f790fce2d3e3f65b40`

The reviewed reconciler reconstructs autonomous-resolution exhaustion, creates/reuses human actions, and resumes research/validation/resolution work. It imports no commercial-payment adapter and contains no payment-provider mutation.

This directly strengthens G-A6 and G-A10: current corrective ownership does not conceal a reversal dispatcher and does not launder dormant DI-2 authority into execution.

### 4.2 R12 execution scheduler

`artifacts/api-server/src/lib/execution-kernel.ts`  
Blob: `f4065ad5bf6ce8a91b2ca13f25c367ca6b3bcbd9`

The closed `ExecutionAction` union contains:

- `RUN_RESEARCH`;
- `RUN_VALIDATION`;
- `RUN_RESOLUTION`;
- `PLAN_EXPERIMENT`;
- `EXECUTE_EXPERIMENT`;
- `RECHECK_MONETIZATION_PLAN`;
- `RUN_BUILD_ORCHESTRATOR`;
- `RECONCILE_OPPORTUNITY`.

The HTTP dispatcher has no refund/cancel/void/reversal or generic payment-mutation job type.

Therefore R12 cannot currently launder reversal authority through the generic scheduling kernel.

### 4.3 Asset remediation worker — direct closure of the remaining generic-worker concern

`artifacts/api-server/src/lib/asset-remediation-worker.ts`  
Current reviewed blob: `d4bef756c3c7d05199db238d3e8bde4f323d97a3`

Direct review confirms the worker is bounded to code repair, QA, preview deployment, production redeployment, and health verification for an existing Asset.

Its adapter surface consists of:

- `BuilderAgentAdapter`;
- `QaAgentAdapter`;
- `ReleaseAgentAdapter`.

It does not import or invoke `CommercialPaymentAdapter` or a generic payment mutation adapter.

More strongly, `maintenancePlan()` explicitly sets:

- `customerChargingAuthorized: false`;
- `productionCredentialsAuthorized: false`;
- `outboundAuthorized: false`;
- `customerChargingExpansionAllowed: false`;
- `outboundExpansionAllowed: false`;
- `productionCredentialExpansionAllowed: false`.

Its maintenance economics also set `externalSpendCeilingCents: 0`.

`recordUnexpectedCost()` treats any positive reported external cost as `zero_cash_contract_violation` evidence, records the cost, blocks the remediation run, and escalates for human review rather than broadening authority or continuing consequential execution.

This is positive structural evidence that Asset remediation is not a hidden payment reversal or charging mutation surface.

### 4.4 Commercial and Asset observation chain from G3

G3 directly established:

- `CommercialPaymentAdapter` exposes only `prepare()` and `activateAndVerify()`;
- configured commercial HTTP adapter calls only `/commercial/prepare` and `/commercial/activate`;
- `ingestAuthoritativePaymentEvent()` contains no outbound provider call;
- `recordAssetObservation()` is DB-only persistence/aggregation;
- Asset operations HTTP behavior is limited to unrelated read-only health probing.

Taken together with §§4.1–4.3, the plausible current worker surfaces for hidden reversal execution have now received materially deeper direct review than they had entering G4.

## 5. G-A1 — scope broadening

**Result:** PASS.

`DI-1/COMMERCIAL_PAYMENT` remains limited to the commercial/payment scope. R18's Builder scope remains separate, R19 consumes the named R17 scope only where applicable, and R20 revalidates it where active rather than globally activating DI-1.

**Finding:** none.

## 6. G-A2 — scope narrowing

**Result:** FAIL through G2-01.

The active provider/account commercial scope narrows in implementation from exact `P/A1` to provider string plus mutable/current capability and adapter configuration.

**Finding:** existing G2-01 only.

## 7. G-A3 — named-scope collapse

**Result:** PASS.

The canonical name `DI-1/COMMERCIAL_PAYMENT` remains explicit through R17 → R19 → R20. The implementation loses account identity, but the named scope itself is not renamed or collapsed to ambiguous generic DI-1 language.

**Finding:** none.

## 8. G-A4 — current/default account substitution

**Result:** FAIL through G2-01.

Both confirmed G2 mechanisms instantiate this attack:

1. current capability metadata may move A1→B1 under the same provider-derived key;
2. provider-keyed bridge URL/token configuration may move the actual merchant authority A1→B1 while provider string remains P.

**Finding:** existing G2-01 only.

## 9. G-A5 — reversal-evidence false activation

**Result:** PASS.

R15/R16 explicitly distinguish evidence/reconciliation from outbound reversal execution, and the current reversal-like runtime path is directly traced as inbound authoritative provider-event persistence only.

**Finding:** none.

## 10. G-A6 — reversal-dispatch false negative

**Result:** PASS on the reviewed current implementation.

Direct evidence now spans:

- commercial adapter interface and configured bridge;
- commercial event ingestion;
- Asset observation persistence;
- R11 human/corrective reconciliation;
- R12 execution scheduling;
- Asset remediation repair/QA/release workflow.

None exposes an outbound refund/cancel/void/reversal or generic payment-provider mutation primitive.

R20 remains structurally incomplete as a canonical boundary-decision implementation, but that does not justify `DI_SOURCE_UNRESOLVED` for this attack because the actual executable worker/adapter surfaces capable of performing current payment mutations have been directly reviewed and no reversal primitive exists. A future generic R20 consequence dispatcher would invalidate this result immediately.

**Finding:** none.

## 11. G-A7 — scheduler laundering

**Result:** PASS.

R12 contract semantics say scheduling does not create reversal authority, and the live execution kernel confirms there is no reversal/payment-mutation action to schedule.

**Finding:** none.

## 12. G-A8 — evidence laundering

**Result:** PASS.

R15/R16 observed/reconciled reversal truth does not retroactively establish that Money Scout owned prior outbound reversal authority. The live code persists evidence; it does not convert that evidence into an authorization object.

**Finding:** none.

## 13. G-A9 — successor inheritance

**Result:** FAIL condition, fully subsumed by G2-01.

The relevant Phase-G attack is provider/account DI authority inheriting through shared Asset/provider/logical-capability identity. That is exactly the G2 same-provider current/successor substitution failure.

Adversarial review separately tested whether a technical artifact/release successor with unchanged provider/account could create another DI-specific successor problem. It does not: that is governed by R17's separate technical-successor-versus-commercial-equivalence requirements and is not a distinct Design Input invariant.

If G2-01 is fixed by freezing exact `P/A1` through binding, Offer/Grant, lineage, boundary decision, and actual dispatch, while requiring explicit governed rebinding for B1, the G-A9 DI inheritance mode necessarily closes.

**Finding:** existing G2-01 only.

## 14. G-A10 — inactive-scope contamination

**Result:** PASS.

Dormant/not-activated nodes are not treated as positive authority grants. The commercial DI-1 failure arises from missing exact identity wiring inside the actually-active commercial scope, not from laundering dormant R6/R7/R8 authority. Likewise DI-2 authority is not manufactured from R11/R12/R15/R16 negative dispositions.

**Finding:** none.

## 15. G-A11 — DI-2 eligibility-to-dispatch drift

**Result:** NOT CURRENTLY TRIGGERED.

No reviewed DI-2-active reversal dispatch exists, so there is no actual T1 eligibility→T2 dispatch identity pair to test.

G2-01 nevertheless establishes the mandatory future risk: any reversal implementation using current provider/account state or provider-keyed adapter configuration must be re-audited for P/A1→P/B1 drift.

**Finding:** none currently; mandatory invalidation trigger.

## 16. G-A12 — DI-1 × DI-2 dispatch-boundary mismatch

**Result:** NOT CURRENTLY TRIGGERED.

No reviewed outbound reversal boundary exists today. Therefore neither the “valid DI-2 / wrong DI-1 target” nor “correct DI-1 target / missing DI-2 authority” direction can presently be instantiated as a live defect.

Any future reversal implementation must independently prove both exact provider/account targeting and valid reversal authority at the same external call.

**Finding:** none currently; mandatory invalidation trigger.

## 17. Final twelve-attack matrix

| Attack | Final result | Primary disposition |
|---|---|---|
| G-A1 scope broadening | PASS | no finding |
| G-A2 scope narrowing | FAIL | existing G2-01 |
| G-A3 named-scope collapse | PASS | no finding |
| G-A4 current/default account substitution | FAIL | existing G2-01 |
| G-A5 reversal-evidence false activation | PASS | no finding |
| G-A6 reversal-dispatch false negative | PASS on reviewed current implementation | no finding |
| G-A7 scheduler laundering | PASS | no finding |
| G-A8 evidence laundering | PASS | no finding |
| G-A9 successor inheritance | FAIL condition / folded | existing G2-01 |
| G-A10 inactive-scope contamination | PASS | no finding |
| G-A11 DI-2 eligibility→dispatch drift | NOT CURRENTLY TRIGGERED | mandatory recheck if DI-2 dispatch appears |
| G-A12 DI-1×DI-2 mismatch | NOT CURRENTLY TRIGGERED | mandatory recheck if DI-2 dispatch appears |

## 18. Finding-independence adjudication

G4 opens **zero new primary findings**.

G-A2, G-A4, and G-A9 are different attack views of the same G2-01 invariant:

> exact provider/account commercial authority is not frozen and equality-wired end-to-end, allowing current/successor account state to substitute under the same provider/logical scope.

If G2-01 is repaired correctly, all three attacks necessarily close together. They therefore do not earn separate Phase-G findings.

G-A11 and G-A12 remain distinct future attack semantics, but without a current DI-2-active reversal dispatch they do not instantiate current findings.

## 19. Invalidation conditions

Reopen the applicable G4 attacks if any of the following occurs:

- `CommercialPaymentAdapter` gains refund/cancel/void/reversal or generic payment-mutation behavior;
- a new payment bridge/provider adapter adds reversal behavior;
- R11, R12, R20, Asset remediation, or another generic worker gains payment-provider mutation;
- a new ExecutionAction can dispatch reversal/payment mutation;
- reversal eligibility becomes connected to external dispatch;
- G2-01 provider/account wiring changes;
- successor/rebinding semantics change for commercial provider/account authority.

## 20. Final adjudication

**G4:** CERTIFIED — FAIL ONLY THROUGH EXISTING G2-01 / ZERO NEW PHASE-G FINDINGS.

- all twelve mandatory attacks executed;
- G-A2, G-A4, and G-A9 map to the already-confirmed G2-01 invariant;
- G-A1, G-A3, G-A5, G-A6, G-A7, G-A8, and G-A10 pass on reviewed evidence;
- G-A11 and G-A12 remain not currently triggered, not falsely labeled PASS;
- G3's no-current-DI-2-dispatch result is not falsified;
- direct review of `asset-remediation-worker.ts` closes the last specifically flagged generic-worker gap;
- no second independently-remediable Phase-G Design Input defect was identified.

Implementation authority remains **SUSPENDED**.
