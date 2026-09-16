# Phase G — G4 Cross-Node Adversarial Scope Attacks Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** G — Design Input Consistency  
**Batch:** G4 — G-A1 through G-A12 cross-node adversarial attacks  
**Implementation authority:** SUSPENDED

## 1. Purpose

G4 executes the full twelve-attack Phase-G adversarial suite against the certified G0/G1/G2/G3 state.

This batch does not reopen already-certified findings merely because the same defect causes multiple attacks to fail. Finding independence and anti-inflation remain governing.

Immediate predecessor state:

- G0: R1–R20 Design Input inventory certified 20/20;
- G1: all R1–R20 node-level DI-1 dispositions certified `DI_CONSISTENT`;
- G2: FAIL with one confirmed finding, `G2-01 — DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`;
- G3: PASS, R1–R20 DI-2 20/20 `DI_CONSISTENT`, no current reviewed autonomous outbound payment-reversal dispatch.

G4 therefore asks two distinct questions:

1. do any of the twelve attacks reveal a **new independently-remediable Design Input defect** beyond G2-01?;
2. do any attacks falsify or weaken G3's present-state DI-2 PASS?

## 2. Governing attack suite

From `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md` — governing blob `a89c9a46f06d9baff0a390a568e13299cd371b91`:

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

## 3. Pinned predecessor evidence

### G1 named-scope topology

G1 certified:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 consumes same named scope → R20 revalidates same exact named scope`

with R18 remaining a parallel exact capability-binding owner rather than a commercial-authority owner.

### G2 confirmed identity defect

`PHASE_G_G2_DI1_PROVIDER_ACCOUNT_COMPOUND_CERTIFICATION.md`  
Blob: `8efdf14d0c40468422b8a6d357eee34101c08ecb`

G2-01 proved two independent substitution mechanisms under one end-to-end DI invariant:

1. mutable capability-account current-row replacement;
2. provider-keyed commercial adapter bridge URL/token replacement.

Both allow same-provider `P` to refer to account A1 at authority time and B1 at later execution time without exact A1=B1 proof.

### G3 direct commercial DI-2 trace

`PHASE_G_G3_DI2_NODE_CONSISTENCY_CERTIFICATION.md`  
Blob: `9f2b1a8d70303cae564fc4217208a55a453aa0a4`

G3 directly traced:

- `CommercialPaymentAdapter` — only `prepare()` and `activateAndVerify()`;
- `ingestAuthoritativePaymentEvent()` — inbound provider-event persistence, no outbound provider mutation;
- `recordAssetObservation()` — DB-only persistence/aggregation, no provider mutation.

No reviewed autonomous outbound refund/cancel/void/reversal surface exists on the current commercial-payment path.

## 4. Additional G4 Tier-B pressure

G4 adds direct implementation pressure on R11/R12, the two most plausible generic paths for authority laundering.

### 4.1 R11 corrective/human reconciliation does not dispatch payment reversal

`artifacts/api-server/src/lib/human-action-reconciler.ts`  
Blob: `3b255e2be70f31d2b02e32f790fce2d3e3f65b40`

The reviewed reconciler:

- reconstructs autonomous-resolution exhaustion;
- creates/reuses human actions;
- resumes research/validation/resolution-like work;
- records lifecycle/runtime state.

It imports no commercial-payment adapter and contains no payment-provider dispatch. Its recovery/corrective behavior therefore does not expose a current hidden DI-2 reversal execution surface.

### 4.2 R12 execution scheduler has no reversal action

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

The HTTP dispatcher handles research, validation, resolution, experiment planning/execution, and monetization-plan recheck. There is no refund/cancel/void/reversal or generic payment-mutation execution action.

Therefore R12 cannot presently become the source of DI-2 authority merely by scheduling a generic execution job.

### 4.3 R20 evidence strength remains lower than direct commercial trace

Current R20 implementation evidence remains structurally incomplete: Phase F confirmed no canonical R20 boundary-decision object and left the Boundary Registry representation unresolved pending exhaustive equivalent-registry search.

G4 does **not** treat that incompleteness as proof of a hidden reversal dispatcher. The current actual payment adapter has no reversal primitive, the commercial reversal-like chain terminates in persistence, R11 corrective reconciliation exposes no payment provider mutation, and R12 scheduling has no reversal action.

If a future/static generic R20 handler is found to dispatch a payment reversal outside those reviewed surfaces, G3 and G4 G-A6/G-A11/G-A12 are invalidated for that scope.

## 5. G-A1 — scope broadening

**Attack:** consume `DI-1/COMMERCIAL_PAYMENT` downstream and silently apply it to unrelated provider/account activity.

**Result:** PASS.

Evidence:

- R17 explicitly limits activation to commercial/payment scope;
- R18 explicitly says Builder-scope activation does not automatically consume Commercial Payment or unrelated DI-1 scopes;
- R19 explicitly consumes R17's named scope only where applicable and says it does not broaden merely by preserving account identity;
- R20 revalidates the named scope where active rather than globally activating provider/account substitution semantics.

No new unrelated node is made DI-1-active merely by hard-chain participation.

**Finding:** none.

## 6. G-A2 — scope narrowing

**Attack:** active upstream provider/account scope loses exact account identity downstream and retains only provider/logical-key/current-state identity.

**Result:** FAIL — already owned by G2-01.

The exact same-provider/different-account attack from G2 demonstrates:

`P/A1 authority → provider-only activation/storage/current capability → P/B1 live execution`

without A1=B1 proof.

This is exactly the governing G-A2 failure mode.

**Finding:** `G2-01 — DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`.

No new G4 finding is opened.

## 7. G-A3 — named-scope collapse

**Attack:** `DI-1/COMMERCIAL_PAYMENT` becomes generic unnamed DI-1 such that commercial scope identity cannot be traced.

**Result:** PASS at the contract level.

R17 names `DI-1/COMMERCIAL_PAYMENT`; R19 explicitly consumes the same named R17 scope; R20 explicitly refers to the same named scope when active.

G2 demonstrates implementation identity loss, but the canonical scope **name** itself is not collapsed or ambiguously renamed in the governing contracts.

**Finding:** none.

## 8. G-A4 — current/default account substitution

**Attack:** historical authority is P/A1; later consumption uses whichever P/account is current/default.

**Result:** FAIL — already owned by G2-01.

Both G2 mechanisms satisfy the attack:

1. singleton current capability metadata can move A1→B1 under provider-derived key;
2. provider-keyed adapter bridge configuration can move the actual merchant authority A1→B1 while provider string P remains unchanged.

**Finding:** G2-01. No additional G4 primary finding.

## 9. G-A5 — reversal-evidence false activation

**Attack:** observing or reconciling reversal evidence is misclassified as DI-2-active outbound reversal authority.

**Result:** PASS.

R15 and R16 explicitly reject that activation. G3 directly traced `ingestAuthoritativePaymentEvent() → recordAssetObservation()` and confirmed the current reversal-like path is provider-originating evidence persistence only.

The code recognizes statuses such as `REFUNDED`, `PARTIALLY_REFUNDED`, `CHARGEBACK`, and `REVERSED`, but does not originate them.

**Finding:** none.

## 10. G-A6 — reversal-dispatch false negative

**Attack:** Money Scout actually dispatches a refund/cancel/void/reversal but DI-2 remains marked inactive because financial truth is owned elsewhere.

**Result:** PASS on the reviewed current implementation.

Direct evidence:

- `CommercialPaymentAdapter` exposes no reversal primitive and configured HTTP implementation calls only `/commercial/prepare` and `/commercial/activate`;
- the traced reversal-like commercial worker path performs no provider call;
- R11 corrective/human reconciliation performs no payment-provider dispatch;
- R12's closed execution-action set contains no reversal/payment mutation.

No current autonomous outbound reversal call is established.

**Evidence calibration:** R20 remains less deeply traced than the commercial/R11/R12 surfaces. This does not create a present finding because no executable provider reversal primitive has been found for R20 to invoke. Discovery of such a generic mutation path invalidates this result.

**Finding:** none.

## 11. G-A7 — scheduler laundering

**Attack:** R12 schedules reversal-related work and scheduling is treated as the authority to perform the external reversal.

**Result:** PASS.

Contract rule: R12 scheduling is not execution authority.

Implementation strengthening: the current `ExecutionAction` union and HTTP dispatch switch contain no reversal/payment mutation action. There is presently no reversal executor that the generic scheduling kernel can invoke.

**Finding:** none.

## 12. G-A8 — evidence laundering

**Attack:** R15/R16 reversal evidence is treated as retrospective proof that a reversal execution was authorized.

**Result:** PASS.

R15 explicitly preserves observed truth without creating execution authority. R16 explicitly interprets/reconciles evidence without authorizing dispatch. The live reversal-like path records compensating financial evidence after authoritative provider events and does not manufacture a prior outbound authority object.

No reviewed code path converts receipt of `REFUNDED`/`REVERSED` evidence into proof that Money Scout previously possessed DI-2 authority.

**Finding:** none.

## 13. G-A9 — successor inheritance

**Attack:** new Offer/Grant/Binding/Lineage/Boundary state inherits provider/account DI authority merely because Asset/provider/logical capability matches.

**Result:** FAIL condition demonstrated, but fully constitutive of G2-01 rather than a new invariant.

The current commercial representation is one row per Asset and provider-key/current capability state is reused across reconciliation. G2 proved that later B1 state can be treated as usable under the same provider/logical key without exact preservation of the earlier A1 authority.

That is the practical successor/current-state inheritance failure the attack is designed to expose.

Anti-inflation result:

- fixing G2-01 by freezing exact P/A1 into the binding/Offer/Grant/lineage/decision and requiring explicit successor/rebinding authority necessarily closes this inheritance mode;
- there is no independently repairable second Design Input invariant here.

**Finding:** G2-01 only.

## 14. G-A10 — inactive-scope contamination

**Attack:** a node explicitly marked NOT ACTIVATED is later cited as if it positively granted Design Input authority.

**Result:** PASS on reviewed evidence.

G1/G3 established that dormant/negative R6/R7/R8-generic and R11/R12/R15/R16 DI dispositions remain negative controls rather than positive grants.

The commercial path's DI-1 defect does not arise because a dormant node is cited as granting substitution authority; it arises because exact account identity is not frozen/wired through the actually active R17 commercial scope.

Likewise no current reversal dispatch claims authority merely because R12 scheduled something or R15/R16 observed/reconciled it.

**Finding:** none.

## 15. G-A11 — DI-2 eligibility-to-dispatch scope drift

**Attack:** reversal authority is evaluated for P/A1 at T1; delayed outbound dispatch uses current/default P/B1 at T2.

**Result:** NOT CURRENTLY TRIGGERED.

G3 found no current reviewed DI-2-active reversal dispatch. Therefore there is no current T1→T2 reversal-dispatch identity pair to attack.

However, G2-01 demonstrates that the existing payment-provider/account machinery is already unsafe for exactly this temporal substitution pattern in forward commercial execution.

Accordingly, any future or newly discovered autonomous reversal dispatch that uses current capability/provider-keyed adapter state is presumptively within the mandatory G-A11 re-audit scope. It does not automatically become a new defect until DI-2 dispatch actually exists.

**Finding:** none currently; mandatory invalidation/recheck trigger preserved.

## 16. G-A12 — DI-1 × DI-2 dispatch-boundary mismatch

**Attack:** either:

1. DI-2 reversal authority is valid but actual provider/account target is wrong under DI-1; or
2. provider/account is exact under DI-1 but valid DI-2 reversal authority is absent.

**Result:** NOT CURRENTLY TRIGGERED.

No reviewed outbound reversal boundary currently exists, so neither direction can presently be instantiated as an actual dispatch defect.

G2-01 nevertheless fixes the future standard: any reversal implementation must not reuse provider-only/current-account targeting. It must independently prove exact provider/account and valid reversal authority at the same consequential call.

**Finding:** none currently; mandatory future/new-surface recheck.

## 17. Twelve-attack matrix

| Attack | Result | Primary disposition |
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

G4 provisionally opens **zero new primary findings**.

Three attack failures/conditions—G-A2, G-A4, and G-A9—are different adversarial views of the same G2-01 invariant:

> exact provider/account commercial authority is not frozen and equality-wired end-to-end, allowing current/successor account state to substitute under the same provider/logical scope.

Counterfactual:

If G2-01 is correctly repaired by preserving exact P/A1 across R6/R18/R17/R19/R20 and actual provider dispatch, with explicit successor/rebinding authority for B1, G-A2, G-A4, and G-A9 all close together.

They therefore do not earn three Phase-G findings.

G-A11/G-A12 remain separate *attack semantics* with separate future acceptance criteria, but no current DI-2 dispatch exists to instantiate them as findings.

## 19. Provisional G4 disposition

**G4:** FAIL ONLY THROUGH EXISTING G2-01 / NO NEW PHASE-G FINDING PROVISIONALLY IDENTIFIED.

- all 12 mandatory attacks were executed;
- G-A2: FAIL / G2-01;
- G-A4: FAIL / G2-01;
- G-A9: FAIL condition / folded into G2-01;
- G-A1, G-A3, G-A5, G-A6, G-A7, G-A8, G-A10: PASS on reviewed evidence;
- G-A11, G-A12: not currently triggered because no reviewed DI-2-active reversal dispatch exists;
- G3 DI-2 PASS is not falsified;
- no second independently-remediable Phase-G invariant was identified.

## 20. Adversarial review questions

Before certification, independently challenge at least:

1. Does G-A9 truly collapse into G2-01, or is there a successor-inheritance rule that could remain broken after exact provider/account wiring is fixed?
2. Does R12's closed `ExecutionAction` union and dispatch switch genuinely rule out scheduler laundering, or can another scheduler/job mechanism dispatch arbitrary provider mutations?
3. Does `human-action-reconciler.ts` sufficiently pressure R11, or is there another corrective/remediation worker that can originate payment mutation?
4. Could `asset-remediation-worker.ts` or another incident-repair worker perform generic payment-provider mutation outside `CommercialPaymentAdapter`?
5. Is R20's weaker direct implementation coverage acceptable for G-A6 PASS, or does a generic consequential-action handler remain sufficiently plausible to require a narrow `DI_SOURCE_UNRESOLVED`?
6. Does any generic bridge/provider client accept arbitrary operation names or paths that could reach a reversal endpoint despite `CommercialPaymentAdapter` lacking one?
7. Does G-A10 hide any case where a dormant DI-1 node's provider/account field is incorrectly treated as authority downstream?
8. Are G-A11/G-A12 correctly `NOT CURRENTLY TRIGGERED` rather than PASS, preserving the distinction between absence of an active dispatch and successful testing of a real dispatch boundary?
9. Does any G2-01 mechanism create an independent DI-2 defect merely because provider-originating reversals are ingested under the wrong account, or is that correctly outside DI-2 because no outbound reversal occurs?
10. Is zero-new-findings genuinely the anti-inflated result, or has one independently repairable cross-node Design Input invariant been folded too aggressively into G2-01?

Implementation authority remains **SUSPENDED**.
