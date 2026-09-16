# Phase G — G0 Design Input Inventory Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** G — Design Input Consistency  
**Batch:** G0 — Corpus Design Input Inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact completes the required G0 inventory pass across the current committed R1–R20 contracts.

It records what each node **actually says** about DI-1 and DI-2 before Phase G begins node-by-node consistency adjudication.

This is not a G1/G2/G3/G4 finding certification. No Design Input defect is finalized here.

Governing plan:

- `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md`
- current governing blob: `a89c9a46f06d9baff0a390a568e13299cd371b91`

## 2. G0 classification rules used

1. Explicit `NOT ACTIVATED` / `DORMANT` language is recorded as such.
2. Conditional activation language is preserved as `CONDITIONAL`; it is not normalized to globally ACTIVE or NOT ACTIVATED.
3. `CONSUME` is recorded only where the contract explicitly consumes an activated named scope.
4. Presence of provider/account or reversal metadata does not itself activate a Design Input.
5. DI-2 actual execution ownership is **not inferred from contract wording**. G3 must inspect the live refund/cancel/void/reversal dispatch path where needed.
6. Exact-name confidence distinguishes a frozen/named scope from semantically recovered wording whose exact historical phrasing remains source-limited.
7. G0 inventories the contract; it does not decide whether the contract's disposition is globally consistent. That belongs to G1–G4.

## 3. Complete R1–R20 inventory

| Node | Contract blob | DI-1 reviewed / activation | DI-1 scope / disposition | DI-2 reviewed / activation | DI-2 scope / disposition | Exact-name confidence | Inventory note |
|---|---|---|---|---|---|---|---|
| R1 | `af010e01aaaf4e3454b6e88fc390d4502151d16a` | YES / NOT ACTIVATED GENERICALLY | generic provider/account plurality; `NOT ACTIVATED`; exact child scope activates only if concrete plurality appears | YES / NOT ACTIVATED | outbound monetary reversal execution; `NOT ACTIVATED`; child introducing dispatch activates independently | CONFIRMED current-contract wording | Resource/provider provenance is not provider/account substitution authority; reversal observations are not reversal execution. |
| R2 | `bf1c19387b52938f43f28f1d58c73d483c72c5ab` | YES / NOT ACTIVATED GENERICALLY | capability-resolution provenance; `NOT ACTIVATED`; authority-relevant plurality activates separately | YES / NOT ACTIVATED | autonomous reversal execution; `NOT ACTIVATED`; action-introducing child activates independently | CONFIRMED current-contract wording | Selected provider/candidate metadata does not itself consume either DI. |
| R3 | `da0431cb43f0d84056938d7e93339965ba740bd7` | YES / NOT ACTIVATED BY R3 | temporal-evidence provider/account provenance; `NOT ACTIVATED` | YES / NOT ACTIVATED | reversal execution; `NOT ACTIVATED` | CONFIRMED current-contract wording | Freshness semantics do not create provider substitution or reversal authority. |
| R4 | `907e44ccb1128dabb142164e713877596901c3f2` | YES / NOT ACTIVATED | Evaluation-cycle lineage; `NOT ACTIVATED` | YES / NOT ACTIVATED | reversal execution; `NOT ACTIVATED` | CONFIRMED current-contract wording | R4 explicitly says its lineage contract may later be consumed by DI-2 work if activated elsewhere. |
| R5 | `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929` | YES / NOT ACTIVATED | decision-review independence; `NOT ACTIVATED`; multi-provider reviewer routing would trigger reevaluation | YES / NOT ACTIVATED | payment mutation/reversal; `NOT ACTIVATED` | CONFIRMED current-contract wording | Reviewer/provider plurality is not assumed from generic review independence. |
| R6 | `d4d613a40eed187c230d55f7e21b1b0251bf612a` | YES / DORMANT / NOT ACTIVATED in current R6 scope | capability verification identity; `NOT ACTIVATED`; explicit schema-entanglement/non-consumption guard | YES / NOT ACTIVATED | refund/cancel/void/reversal path; `NOT ACTIVATED` | CONFIRMED current-contract wording | R6 may enrich verifier-policy fields without claiming DI-1 consumed. Identity expansion to simultaneous provider/account/Asset scope halts design freeze pending DI adjudication. |
| R7 | `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf` | YES / DORMANT / NOT ACTIVATED by present single-scope implementation | Resource Pool identity; `NOT ACTIVATED`; explicit shared-schema entanglement review if R7/R6 identity surfaces overlap | YES / DORMANT / NOT ACTIVATED | generic reservation; `NOT ACTIVATED` | CONFIRMED current-contract wording | Adding provider/account scope to Resource Pool identity does not itself consume DI-1; semantic substitution enabled by shared schema would. |
| R8 | `237c752671573013d090e2eacf7c2af4c0e70512` | YES semantically / NOT GENERICALLY ACTIVATED | exact R6×R7×R8 provider/account scope consistency; conditional activation if implementation permits cross-account substitution | YES semantically / DORMANT GENERICALLY / CONDITIONAL | autonomous external reversal dispatch; activates in future commercial-payment reversal execution scope | SEMANTIC_ONLY for original wording; DI semantics explicit in current contract | Historical reconciliation may never cross-account substitute. DI-2 is dormant for generic external-truth semantics but activates for an actual reversal mutation. |
| R9 | `0ef14b00a1569ae649fe064aadecb498a2bc71e6` | YES / NOT ACTIVATED BY GENERIC R9 | repository/source authority; `NOT ACTIVATED`; substitution-enabled repository/source operation would activate exact scope | YES / NOT ACTIVATED BY GENERIC R9 | reversal dispatch; `NOT ACTIVATED`; future coupled reversal scope activates separately | SEMANTIC_ONLY beyond confirmed reviewed/not-activated result | Source authority is not provider/account substitution or payment reversal authority. |
| R10 | `66db007de1ccbf1cdac011ef10cb299e5499aec1` | YES / NOT ACTIVATED BY GENERIC R10 | artifact/deployment provenance; `NOT ACTIVATED`; substitution-enabled artifact/deployment path would activate exact scope | YES / NOT ACTIVATED BY GENERIC R10 | future externally dispatched economic reversal only | SEMANTIC_ONLY for exact original DI wording | Artifact lineage may carry provider identity but does not authorize cross-account substitution. |
| R11 | `f811d528730d819aa793a1901e9d1b310242fbcd` | YES / NOT ACTIVATED BY GENERIC R11 | corrective obligation preserves upstream exact provider/account; substitution-enabled corrective path would activate exact scope | YES / NOT ACTIVATED BY GENERIC R11 / CONDITIONAL | reversal-related obligation alone does not activate; actual autonomous reversal execution does | SEMANTIC_ONLY for exact original DI wording | Corrective ownership may concern a reversal without owning reversal execution authority. |
| R12 | `7a4a186fc2fd030d6ee52725b1111395597ffa90` | YES / NOT ACTIVATED BY GENERIC R12 | durable scheduling preserves supplied provider/account/binding; scheduler substitution would activate exact scope | YES / NOT ACTIVATED BY GENERIC R12 | reversal scheduling only; actual external reversal dispatch activates elsewhere | SEMANTIC_ONLY for exact original DI wording | Canonical scheduler-laundering control: scheduling does not create DI-2 authority. |
| R13 | `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e` | YES / NOT ACTIVATED BY GENERIC R13 | executor health; provider/account substitution on health failure would activate exact scope | YES / NOT ACTIVATED BY GENERIC R13 | separate reversal-execution scope only | SEMANTIC_ONLY for exact original wording | Health evidence cannot become provider substitution or reversal authority. |
| R14 | `969b70e8b4b52606c9e34f617bed32a91b395d25` | YES / NOT ACTIVATED BY GENERIC R14 | replacement preserves existing provider/account identity; intentional rebinding during transfer activates exact scope | YES / NOT ACTIVATED BY GENERIC R14 | reversal dispatched by replacement path activates exact reversal scope | SEMANTIC_ONLY for exact original wording | Runtime authority transfer does not itself rebind provider/account authority. |
| R15 | `1b46aa43f33c19e75ef0696286693592fbbf8c77` | YES / NOT ACTIVATED BY GENERIC R15 | exact provider/account on financial observations; evidence collection/reconciliation must not cross-account substitute | YES / NOT ACTIVATED BY OBSERVATION CAPTURE | observing refund/void/credit/reversal evidence; `NOT ACTIVATED`; Money Scout outbound reversal dispatch activates separately | CONFIRMED current-contract semantics; historical exact wording source-limited | Strong negative control for G3: reversal evidence/history is explicitly not reversal execution authority. |
| R16 | `7dd92976f68ee90540771b3710e42b6d5b7f396f` | YES / NOT ACTIVATED BY GENERIC R16 | exact provider/account inherited from R15; cross-account reconciliation would activate exact scope | YES / NOT ACTIVATED BY RECONCILIATION | interpreting reversal/credit/adjustment evidence; external dispatch activates separately | CONFIRMED current-contract semantics; historical exact wording source-limited | Strong negative control for G3: reconciliation computation is not reversal dispatch. |
| R17 | `16a234e897fe6e119392707a7187a3232f0fd972` | YES / ACTIVE | **`DI-1/COMMERCIAL_PAYMENT`**; `CONSUME`; exact provider/account is part of Offer Version / Grant authority | YES / DORMANT FOR GENERIC OFFER / CONDITIONAL | generic forward charging/Offer authority does not activate DI-2; autonomous refund/cancel/void/reversal dispatch does | **CONFIRMED named scope** | First explicit commercial-payment activation owner/consumer in current corpus. Scope is expressly not global. |
| R18 | `226d67276f1627c26045ead9c7717023e7e764db` | YES / CONDITIONAL SCOPE-BY-SCOPE | **`DI-1 / BUILDER_EXECUTION`** activates where simultaneous/historical Builder provider accounts/bindings exist; activation does not consume unrelated QA/Release/Commercial scopes | YES / NOT ACTIVATED GENERICALLY / CONDITIONAL | capability recovery reversal mutation activates separately | CONFIRMED current-contract named Builder scope | R18 is intentionally scope-local. Builder activation does not imply `DI-1/COMMERCIAL_PAYMENT`. |
| R19 | `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3` | YES / ACTIVE WHERE APPLICABLE | **CONSUMES `DI-1/COMMERCIAL_PAYMENT` FROM R17**; exact commercial provider/account preserved; no broadening | YES / NOT ACTIVATED BY GENERIC LINEAGE STORAGE / CONDITIONAL | reversal lineage/history can be represented; outbound autonomous reversal dispatch activates DI-2 | **CONFIRMED named commercial scope** | R19 explicitly consumes rather than redefines/broadens R17's named scope. |
| R20 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | YES / ACTIVE AS CONSUMER WHERE UPSTREAM SCOPE APPLIES | consumes exact R18/R17/R19 provider/account identities; where **`DI-1/COMMERCIAL_PAYMENT`** is active, revalidates that exact scope; creates no new substitution authority | YES / NOT ACTIVATED BY GENERIC R20 / CONDITIONAL | autonomous refund/cancel/void/reversal boundary activates exact DI-2 boundary | **CONFIRMED named commercial scope in current contract** | Boundary evaluation is not itself reversal dispatch unless that exact boundary owns autonomous external reversal execution. |

## 4. Immediate corpus-level observations — inventory only

These are G0 observations, **not Phase-G defect findings**.

### G0-O1 — explicit negative dispositions are common and usable

R1–R7 and R9–R16 generally contain explicit reviewed/not-activated or dormant language. These may be inventoried as negative activation dispositions because they are not inferred from silence.

R8 uses different wording: DI-1 is not generically activated but exact provider/account consistency is mandatory; DI-2 is dormant generically and conditionally activates for autonomous reversals. G0 preserves that wording rather than forcing it into the earlier template.

### G0-O2 — named commercial-payment chain is explicit

The current contracts establish the following named-scope propagation candidate for G2:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 consumes same named scope → R20 revalidates same named scope where applicable`

R18 is not automatically part of that named activation merely because it governs bindings. Its contract explicitly uses scope-local activation and gives `DI-1 / BUILDER_EXECUTION` as a distinct example.

G2 must later determine whether R18's commercial-payment binding scope separately consumes/aligns with R17's named commercial scope without broadening/collapse.

### G0-O3 — R6/R7/R8 provider/account seam is explicitly preserved

R6 says DI-1 remains dormant under the current identity model but may activate if capability identity expands. R7 says provider/account-scoped Resource Pool identity alone does not consume DI-1 and adds a shared-schema entanglement guard. R8 requires R6/R7/R8 to use the same exact provider/account scope for consequential operations.

This is a real G2 seam but not yet a DI defect.

### G0-O4 — DI-2 contracts strongly distinguish representation from dispatch

R11/R12/R15/R16/R19/R20 all explicitly distinguish reversal-related ownership, scheduling, evidence, reconciliation, lineage, or eligibility from **actual autonomous external reversal dispatch**.

This supports the governing Phase-G anchor but does not answer whether a live dispatch path currently exists. G3 must inspect implementation call paths.

### G0-O5 — DI-1 × DI-2 composition cannot be decided from contracts alone

The contracts define the rule that any DI-2-active reversal dispatch must preserve exact provider/account identity. Whether current code actually performs an autonomous reversal, and whether it carries the same identity from eligibility through T1→T2 dispatch, remains a G3/G4 implementation-trace question.

## 5. G0 unresolved questions carried forward

G0 does not classify these as defects.

1. **Actual DI-2 dispatch owner:** which current worker/adapter, if any, autonomously dispatches refund/cancel/void/reversal externally? Requires implementation trace in G3.
2. **R18 commercial-payment DI-1 relationship:** does the commercial-payment binding scope explicitly consume the exact named `DI-1/COMMERCIAL_PAYMENT` identity, or does R18's generic scope-by-scope language leave an exact-name/ownership seam requiring G2 adjudication?
3. **Exact historical wording assurance:** several R8–R16 contracts explicitly preserve semantics while noting exact original wording remains source-checkable/source-limited. G1/G3 must not overclaim historical exact phrasing merely because the current recovered contract is semantically specific.
4. **DI-1 conditional scopes:** current contracts frequently say a future implementation change would activate DI-1. G1 must distinguish present activation from future activation trigger and avoid treating a guard as evidence the scope is already active.

## 6. G0 completeness

- R1–R20 rows present: **20 / 20**.
- Each row has a pinned current contract blob.
- Each row has a DI-1 inventory disposition.
- Each row has a DI-2 inventory disposition.
- No `NOT ACTIVATED` result was inferred solely from silence.
- No Phase-G defect has been finalized.
- Implementation authority remains **SUSPENDED**.

## 7. Adversarial review questions

Before G0 becomes canonical, independently challenge at least:

1. Are any rows incorrectly recorded as `NOT ACTIVATED` where the contract actually marks an active scope?
2. Is R17 correctly identified as the explicit `DI-1/COMMERCIAL_PAYMENT` activation/consumption point?
3. Does R19 truly consume the same named R17 scope without broadening or renaming it?
4. Does R20 preserve the same named commercial scope rather than collapsing it to generic DI-1?
5. Is R18's `DI-1 / BUILDER_EXECUTION` example genuinely distinct from the commercial-payment scope, and does G0 avoid accidentally saying Builder is active unconditionally?
6. Does R8's DI wording justify `reviewed = YES`, or should exact reviewed-status assurance be `SOURCE GAP` despite the substantive DI sections?
7. Are R15 and R16 correctly classified as DI-2 non-activated for evidence/reconciliation despite explicit reversal semantics?
8. Does any R11/R12 corrective/scheduling scope actually claim reversal execution authority, contrary to this matrix?
9. Are `CONFIRMED` versus `SEMANTIC_ONLY` exact-name-confidence labels too strong or too weak for any current recovered contract?
10. Does the 20/20 inventory omit any Design Input disposition or scope explicitly present in a node?

## 8. Provisional disposition

**G0 inventory coverage:** COMPLETE 20/20 for review purposes.

**Certification status:** NOT YET CANONICAL.

G0 may become canonical only after adversarial review verifies the 20-row extraction and adjudicates any scope/name-confidence corrections.

No implementation or remediation is authorized.