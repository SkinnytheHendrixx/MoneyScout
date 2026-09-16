# Phase G — G5 Final Design Input Synthesis Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** G — Design Input Consistency  
**Batch:** G5 — final Design Input matrix and synthesis  
**Implementation authority:** SUSPENDED

## 1. Purpose

G5 reconciles the complete Phase-G record across G0–G4 and determines whether the Phase-G audit itself is complete, while keeping audit closure separate from remediation closure.

This synthesis does not implement G2-01 and does not restore implementation authority.

Pinned predecessor certifications:

- `PHASE_G_DESIGN_INPUT_INVENTORY_CERTIFICATION.md` — blob `295158b07845534c01bd83e6c6467f1de5152d5c`
- `PHASE_G_G1_BATCH_01_R1_R10_DI1_CERTIFICATION.md` — blob `8bf6c142b46ec7ddde591d5bffa3162f6b596089`
- `PHASE_G_G1_BATCH_02_R11_R20_DI1_CERTIFICATION.md` — blob `838d8c60c8a02e23f8263b9497ba78c47fb613b4`
- `PHASE_G_G2_DI1_PROVIDER_ACCOUNT_COMPOUND_CERTIFICATION.md` — blob `8efdf14d0c40468422b8a6d357eee34101c08ecb`
- `PHASE_G_G3_DI2_NODE_CONSISTENCY_CERTIFICATION.md` — blob `9f2b1a8d70303cae564fc4217208a55a453aa0a4`
- `PHASE_G_G4_CROSS_NODE_ADVERSARIAL_ATTACKS_CERTIFICATION.md` — blob `83ac140505fc8eae590054a52e4dc616fd3c6654`

Governing plan:

- `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md` — blob `a89c9a46f06d9baff0a390a568e13299cd371b91`

## 2. Provisional Phase-G closure result

**Provisional G5 disposition:**

`PHASE G AUDIT CLOSED / CURRENT DESIGN-INPUT COMPOSITION FAILS / REMEDIATION OPEN`

Reason:

- the required 20/20 corpus inventory is complete;
- all 20 nodes have adjudicated DI-1 dispositions;
- all 20 nodes have adjudicated DI-2 dispositions;
- the named `DI-1/COMMERCIAL_PAYMENT` topology is stable at contract level;
- the high-risk provider/account compound was tested and produced one confirmed defect;
- actual DI-2 reversal-dispatch ownership was traced and no current outbound reversal surface was identified;
- all twelve mandatory G-A1 through G-A12 attacks were executed;
- no Phase-G activation/disposition source uncertainty remains open;
- one confirmed implementation/composition defect, G2-01, remains unresolved and requires later remediation/recheck.

Therefore Phase G can close as an **audit** while its implementation result remains failed/open, using the same audit-closure-versus-remediation-closure distinction applied in Phase F.

## 3. Independent arithmetic recount

### 3.1 Inventory and node-level consistency

- G0 inventory rows: **20 / 20**.
- G1 DI-1 node dispositions: **20 / 20 `DI_CONSISTENT`**.
  - R1–R10: 10/10.
  - R11–R20: 10/10.
- G3 DI-2 node dispositions: **20 / 20 `DI_CONSISTENT`**.

### 3.2 Phase-G primary findings

- G1 findings: **0**.
- G2 findings: **1**.
- G3 findings: **0**.
- G4 new findings: **0**.

**Total confirmed Phase-G primary findings: 1.**

That finding is:

### G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`

The active `DI-1/COMMERCIAL_PAYMENT` scope requires exact provider + exact provider-account identity, but the live commercial path can preserve only provider plus mutable/current capability and adapter state, allowing same-provider account substitution over time.

### 3.3 G4 twelve-attack recount

Final G4 attack totals:

- **7 PASS**: G-A1, G-A3, G-A5, G-A6, G-A7, G-A8, G-A10.
- **3 FAIL / FAIL-CONDITION through existing G2-01**: G-A2, G-A4, G-A9.
- **2 NOT CURRENTLY TRIGGERED**: G-A11, G-A12.

Arithmetic:

`7 + 3 + 2 = 12`

All twelve mandatory attacks are accounted for.

The three attack failures do **not** create three findings. G4 adjudicated them as different adversarial views of the same G2-01 invariant under the Phase-G anti-inflation test.

### 3.4 Unresolved/source-gap recount

**Primary Phase-G `DI_SOURCE_UNRESOLVED` findings: 0.**

This does not mean every recovered historical contract has complete original wording. Several nodes retain `SEMANTIC_ONLY` or source-limited exact historical phrasing. Those are assurance qualifiers inherited from contract recovery, but they do not leave the current DI activation/scope/disposition indeterminate.

G0 specifically established that a document-wide `SOURCE_INCOMPLETE` status does not convert a specifically recovered and reviewed DI section into a source gap when the unresolved items concern other contract details. R8 is the clearest adjudicated example.

Accordingly:

- historical exact-wording gaps remain visible where applicable;
- no current Phase-G DI activation/disposition is classified `DI_SOURCE_UNRESOLVED`;
- Phase H may still carry source-gap questions belonging to the broader recovered corpus, but G5 must not inflate those into Phase-G unresolved DI findings without a Phase-G-specific missing proposition.

## 4. Final 20-node Design Input matrix

| Node | DI-1 final disposition | DI-2 final disposition | Phase-G node result | Key scope note |
|---|---|---|---|---|
| R1 | reviewed / not activated generically | reviewed / not activated | `DI_CONSISTENT` | provenance does not create substitution or reversal authority |
| R2 | reviewed / not activated generically | reviewed / not activated | `DI_CONSISTENT` | selection provenance is not substitution/reversal authority |
| R3 | reviewed / not activated by R3 | reviewed / not activated | `DI_CONSISTENT` | freshness/evidence only |
| R4 | reviewed / not activated | reviewed / not activated | `DI_CONSISTENT` | lineage may be consumed later but does not own DI activation |
| R5 | reviewed / not activated | reviewed / not activated | `DI_CONSISTENT` | review independence does not itself activate either DI |
| R6 | dormant / not activated current scope | reviewed / not activated | `DI_CONSISTENT` | exact verification role; G2 later proves current-row substitution risk in composition |
| R7 | dormant / not activated present single-scope model | dormant / not activated | `DI_CONSISTENT` | exact pool scoping is precision unless substitution semantics arise |
| R8 | reviewed semantically / not generically activated | generic dormant / conditional on actual reversal dispatch | `DI_CONSISTENT` | exact R6/R7/R8 provider-account consistency; execution truth not reversal authority by itself |
| R9 | not activated by generic R9 | not activated by generic R9 | `DI_CONSISTENT` | repository/source authority only |
| R10 | not activated by generic R10 | not activated by generic R10 | `DI_CONSISTENT` | artifact/deployment provenance only |
| R11 | not activated by generic R11 | generic not activated; conditional on actual reversal dispatch | `DI_CONSISTENT` | corrective ownership is not payment mutation authority |
| R12 | not activated by generic R12 | not activated by scheduling | `DI_CONSISTENT` | live execution scheduler contains no reversal/payment-mutation action |
| R13 | not activated by generic R13 | not activated by generic R13 | `DI_CONSISTENT` | health/liveness only |
| R14 | not activated by generic R14; intentional rebinding would activate exact scope | not activated generically | `DI_CONSISTENT` | runtime handoff preserves authority unless explicit rebinding occurs |
| R15 | not activated by generic observation capture | not activated by reversal evidence capture | `DI_CONSISTENT` | exact provider/account observation; evidence is not dispatch |
| R16 | not activated by generic reconciliation | not activated by reversal reconciliation | `DI_CONSISTENT` | exact provider/account reconciliation; computation is not dispatch |
| R17 | **ACTIVE — `DI-1/COMMERCIAL_PAYMENT`** | dormant for generic Offer/forward charging; conditional on outbound reversal | `DI_CONSISTENT` node-level | explicit commercial-payment activation point |
| R18 | conditional scope-by-scope; distinct `DI-1 / BUILDER_EXECUTION` example | not activated generically; conditional | `DI_CONSISTENT` node-level | exact capability binding; commercial-payment adapters audited without taking R17 ownership |
| R19 | **consumes `DI-1/COMMERCIAL_PAYMENT` from R17 where applicable** | lineage/history does not activate; outbound reversal conditional | `DI_CONSISTENT` node-level | preserves named commercial scope without broadening |
| R20 | active consumer where upstream DI-1 scope applies; revalidates exact named commercial scope | generic boundary evaluation not activated; outbound reversal boundary conditional | `DI_CONSISTENT` node-level | revalidation creates no new substitution/reversal authority |

Node-level consistency does not erase G2-01. G2-01 is a composition/runtime-wiring failure among individually coherent contracts.

## 5. Named-scope stability result

The named commercial-payment topology is stable at the contract level:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 consumes DI-1/COMMERCIAL_PAYMENT → R20 revalidates exact active commercial-payment scope`

R18 remains a parallel capability-binding owner and does not automatically consume the named R17 commercial scope merely because R18-A1 audits commercial payment/provider adapters.

Final named-scope result:

- `DI_NAMED_SCOPE_DRIFT`: **not found**;
- `DI_SCOPE_COLLAPSED`: **not found**;
- contract-level commercial-payment naming/ownership topology: **PASS**.

The implementation defect is semantic identity narrowing/drift underneath the stable name, not loss of the name itself.

## 6. Confirmed Phase-G finding register

### G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`

**Owner:** high-risk DI-1 provider/account compound `R6 → R7 → R8 → R17 → R18 → R19 → R20`.

**Normative invariant:** exact provider/account commercial authority must remain the same identity through capability proof/binding, Offer/Grant authority, lineage, boundary consumption, and actual consequential provider dispatch.

**Confirmed mechanism A — mutable capability/current projection:**

- one current capability row exists per logical key;
- current capability metadata may move from `P/A1` to `P/B1`;
- commercial reconciliation re-reads current capability by provider-derived logical key;
- no frozen A1 equality proof prevents B1 from being treated as continuation.

**Confirmed mechanism B — provider-keyed adapter bridge drift:**

- configured commercial adapter is registered by bare provider string;
- bridge URL/token determine the actual live payment authority;
- provider `P` may remain unchanged while bridge/account authority changes A1→B1;
- adapter input carries no exact frozen account/binding identity to prove continuity.

These mechanisms remain one finding because they violate the same end-to-end DI invariant. A compliant remediation must close both mechanisms.

**Required recheck fixture:** use the fourteen-step acceptance fixture frozen in the G2 certification, including independent capability-account drift, independent bridge configuration drift, exact R18 binding, exact R17 Offer/Grant, exact R19 lineage, exact R20 consumption, fail-closed mismatch before dispatch, governed successor/rebinding, restart/redeploy/config-rotation replay, and arbitrary-N history.

## 7. G4 attack synthesis

| Attack | Final result | Phase-G disposition |
|---|---|---|
| G-A1 scope broadening | PASS | no finding |
| G-A2 scope narrowing | FAIL | G2-01 |
| G-A3 named-scope collapse | PASS | no finding |
| G-A4 current/default account substitution | FAIL | G2-01 |
| G-A5 reversal-evidence false activation | PASS | no finding |
| G-A6 reversal-dispatch false negative | PASS on reviewed current implementation | no finding |
| G-A7 scheduler laundering | PASS | no finding |
| G-A8 evidence laundering | PASS | no finding |
| G-A9 successor inheritance | FAIL condition / folded | G2-01 |
| G-A10 inactive-scope contamination | PASS | no finding |
| G-A11 DI-2 eligibility→dispatch scope drift | NOT CURRENTLY TRIGGERED | mandatory recheck if DI-2 dispatch appears |
| G-A12 DI-1×DI-2 dispatch mismatch | NOT CURRENTLY TRIGGERED | mandatory recheck if DI-2 dispatch appears |

G-A11/G-A12 are not counted as PASS and are not findings. Their triggering execution boundary does not currently exist on the reviewed implementation.

## 8. DI-2 dispatch-boundary result

Current Phase-G conclusion:

**No reviewed autonomous outbound refund/cancel/void/reversal dispatch exists in the current implementation.**

Direct evidence accumulated across G3/G4 includes:

- `CommercialPaymentAdapter` exposes only `prepare()` and `activateAndVerify()` and configured HTTP calls only `/commercial/prepare` and `/commercial/activate`;
- `ingestAuthoritativePaymentEvent()` treats refund/reversal-like statuses as inbound provider evidence and performs no outbound provider mutation;
- `recordAssetObservation()` is persistence/aggregation only;
- R11 human/corrective reconciliation contains no payment-provider dispatch;
- R12 `ExecutionAction` has no reversal/payment-mutation action;
- Asset remediation uses Builder/QA/Release adapters only, explicitly disables customer charging/outbound expansion/production credential expansion, runs at zero external spend, and fail-closes unexpected cost.

Therefore:

- DI-2 current activation: **none identified**;
- G3 findings: **0**;
- G-A11/G-A12: **not currently triggered**;
- any future/newly discovered reversal dispatch immediately invalidates the relevant G3/G4 result and requires exact DI-1 × DI-2 boundary re-audit.

## 9. Unresolved and source-assurance map

### 9.1 Phase-G unresolved primary items

**Count: 0.**

No current DI-1 or DI-2 activation/disposition remains `DI_SOURCE_UNRESOLVED` after G0–G4 adjudication.

### 9.2 Source-limited historical wording

Some recovered contracts retain `SEMANTIC_ONLY` or source-limited exact historical wording. These do not prevent present Phase-G classification because the current recovered contract semantics are sufficient to determine DI reviewed status, activation trigger, scope, and ownership.

These assurance qualifiers must remain visible and may be relevant in Phase H's broader source-gap register, but they do not become Phase-G primary findings merely because original wording is incomplete.

### 9.3 Conditional future states are not unresolved current states

Future-trigger language such as:

- provider/account substitution later becoming material;
- intentional rebinding;
- autonomous reversal dispatch later being added;

is a conditional activation rule, not an unresolved current classification.

## 10. Invalidation map

Reopen G1/G2/G4 DI-1 analysis if any of the following changes:

- capability identity schema or capability-history/current projection semantics;
- `setCapabilityAvailable()` overwrite/resolution behavior;
- R18 binding identity or binding-consumer behavior;
- `commercial_activations` provider/account/binding representation;
- `merchantCapabilityVerified()` account comparison logic;
- `authorizeCommercialBoundary()` binding semantics;
- commercial adapter input identity fields;
- adapter registry keying or bridge URL/token/account attestation;
- R17/R19/R20 named commercial scope semantics;
- successor/rebinding semantics for commercial authority.

Reopen G3/G4 DI-2 analysis if any of the following changes:

- `CommercialPaymentAdapter` gains refund/cancel/void/reversal or generic payment mutation;
- a new provider/payment bridge can perform reversal;
- `ingestAuthoritativePaymentEvent()` or `recordAssetObservation()` gains outbound provider behavior;
- R11, R12, R20, Asset remediation, or another generic worker gains payment-provider mutation;
- a new `ExecutionAction` can dispatch payment reversal;
- reversal eligibility/authority becomes connected to actual external dispatch.

If DI-2 dispatch appears, G-A11 and G-A12 become mandatory active tests rather than `NOT CURRENTLY TRIGGERED`.

## 11. Phase-G closure criteria recount

The governing Phase-G plan requires closure only when:

1. 20/20 nodes have durable DI-1/DI-2 inventory — **SATISFIED**;
2. active/conditional scopes have exact owner/boundary or explicit unresolved — **SATISFIED**;
3. `DI-1/COMMERCIAL_PAYMENT` remains stable — **SATISFIED at contract/naming level**;
4. provider/account high-risk chain adjudicated — **SATISFIED; FAIL with G2-01**;
5. DI-2 actual dispatch ownership checked — **SATISFIED; no current dispatch identified**;
6. every DI-2-active dispatch checked for T1→T2 identity stability + DI-1 composition — **VACUOUS CURRENT STATE; no DI-2-active dispatch exists; future trigger preserved**;
7. G-A1 through G-A12 run — **SATISFIED, 12/12**;
8. findings registered — **SATISFIED, one primary finding**;
9. unresolved items have explicit triggers — **SATISFIED; zero primary unresolved, future conditional triggers explicit**;
10. adversarial review adjudicated — **G0–G4 SATISFIED; G5 pending this draft's adversarial review**;
11. final status distinguishes audit closure from implementation closure — **this draft does so explicitly**.

Therefore the only remaining step before canonical Phase-G audit closure is adversarial review/adjudication of this G5 synthesis itself.

## 12. Cross-phase relationship

Phase G does not remediate or supersede Phase-F findings.

G2-01 used Phase-F representability defects as evidence but remains independently testable:

- Phase F asks whether exact arbitrary-N history/identity can be represented;
- G2-01 asks whether the exact same provider/account identity is actually wired and equality-checked through the consequential commercial path.

Even if all relevant Phase-F endpoint representations were repaired, G2-01 would remain open unless the runtime actually preserves and verifies the same exact provider/account through dispatch.

Conversely, G2-01 remediation must not be used to declare the Phase-F representability findings closed without their own independent re-certification.

## 13. Proposed final Phase-G disposition

Subject to adversarial review of this synthesis:

**PHASE G — AUDIT CLOSED / CURRENT DESIGN-INPUT COMPOSITION FAILS / REMEDIATION OPEN.**

Canonical Phase-G result would be:

- G0 inventory: 20/20 complete;
- G1 DI-1 node consistency: 20/20 `DI_CONSISTENT`;
- G2 high-risk compound: FAIL with exactly one finding, G2-01;
- G3 DI-2 node consistency: 20/20 `DI_CONSISTENT`, zero findings;
- G4 attack suite: 12/12 accounted for, zero new findings;
- primary Phase-G findings: **1**;
- primary Phase-G unresolved source/disposition items: **0**;
- open remediation: **G2-01**;
- implementation authority: **SUSPENDED**.

## 14. Adversarial review questions for G5

Before canonicalizing Phase G, independently verify at least:

1. Does the arithmetic truly reconcile to one and only one Phase-G primary finding?
2. Is `7 PASS + 3 FAIL/folded + 2 NOT CURRENTLY TRIGGERED = 12` the correct G4 recount?
3. Does any G0 row remain unadjudicated in G1 or G3 despite the 20/20 claims?
4. Is any source-limited exact historical wording actually material enough to require a Phase-G `DI_SOURCE_UNRESOLVED`, rather than remaining only an assurance qualifier?
5. Is G2-01 still independent from Phase-F findings under the remove-one-fix counterfactual?
6. Do the two G2 substitution mechanisms remain one invariant rather than two independently-remediable Phase-G findings?
7. Does G-A9 necessarily close when G2-01 closes, or could a DI-specific successor-inheritance defect remain?
8. Are G-A11/G-A12 correctly excluded from PASS and finding counts while still retained as mandatory future invalidation tests?
9. Does the invalidation map name every directly reviewed implementation surface whose change would materially invalidate G2/G3/G4?
10. Is `AUDIT CLOSED / CURRENT DESIGN-INPUT COMPOSITION FAILS / REMEDIATION OPEN` the correct closure semantics under the governing plan, rather than requiring G2-01 remediation before Phase G audit closure?
11. Is any Phase-H source-gap work being accidentally swallowed into the Phase-G zero-unresolved count?
12. Does this synthesis overstate any Tier-B/direct-trace evidence from G3 after G4's additional worker review?

## 15. Provisional adjudication

**G5 remains DRAFT pending adversarial review.**

No canonical Phase-G closure is asserted by this document yet.

Implementation authority remains **SUSPENDED**.
