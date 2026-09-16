# Phase G — G0 Design Input Inventory Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / G0 CERTIFIED  
**Phase:** G — Design Input Consistency  
**Batch:** G0 — Corpus Design Input Inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact certifies the required G0 inventory pass across the current committed R1–R20 contracts.

It records what each node actually says about DI-1 and DI-2 before Phase G begins node-by-node consistency adjudication. This is an inventory certification, not a G1/G2/G3/G4 defect certification.

Governing plan:

- `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md`
- governing blob: `a89c9a46f06d9baff0a390a568e13299cd371b91`

## 2. G0 classification rules

1. Explicit `NOT ACTIVATED` / `DORMANT` language is recorded as such.
2. Conditional activation language is preserved as `CONDITIONAL`; it is not normalized to globally ACTIVE or NOT ACTIVATED.
3. `CONSUME` is recorded only where the contract explicitly consumes an activated named scope.
4. Presence of provider/account or reversal metadata does not itself activate a Design Input.
5. DI-2 actual execution ownership is not inferred from contract wording. G3 must inspect the live refund/cancel/void/reversal dispatch path where needed.
6. Exact-name confidence distinguishes a frozen/named scope from semantically recovered wording whose exact historical phrasing remains source-limited.
7. G0 inventories the contract; it does not decide whether the contract's disposition is globally consistent. That belongs to G1–G4.
8. A document-wide `SOURCE_INCOMPLETE` state does not automatically make a DI section source-unreviewed where the DI section itself was specifically restored/reviewed and the unresolved source-gap list identifies different items.

## 3. Complete R1–R20 inventory

| Node | Contract blob | DI-1 reviewed / activation | DI-1 scope / disposition | DI-2 reviewed / activation | DI-2 scope / disposition | Exact-name confidence | Inventory note |
|---|---|---|---|---|---|---|---|
| R1 | `af010e01aaaf4e3454b6e88fc390d4502151d16a` | YES / NOT ACTIVATED GENERICALLY | generic provider/account plurality; `NOT ACTIVATED`; exact child scope activates only if concrete plurality appears | YES / NOT ACTIVATED | outbound monetary reversal execution; `NOT ACTIVATED`; child introducing dispatch activates independently | CONFIRMED current-contract wording | Resource/provider provenance is not provider/account substitution authority; reversal observations are not reversal execution. |
| R2 | `bf1c19387b52938f43f28f1d58c73d483c72c5ab` | YES / NOT ACTIVATED GENERICALLY | capability-resolution provenance; `NOT ACTIVATED`; authority-relevant plurality activates separately | YES / NOT ACTIVATED | autonomous reversal execution; `NOT ACTIVATED`; action-introducing child activates independently | CONFIRMED current-contract wording | Selected provider/candidate metadata does not itself consume either DI. |
| R3 | `da0431cb43f0d84056938d7e93339965ba740bd7` | YES / NOT ACTIVATED BY R3 | temporal-evidence provider/account provenance; `NOT ACTIVATED` | YES / NOT ACTIVATED | reversal execution; `NOT ACTIVATED` | CONFIRMED current-contract wording | Freshness semantics do not create provider substitution or reversal authority. |
| R4 | `907e44ccb1128dabb142164e713877596901c3f2` | YES / NOT ACTIVATED | Evaluation-cycle lineage; `NOT ACTIVATED` | YES / NOT ACTIVATED | reversal execution; `NOT ACTIVATED` | CONFIRMED current-contract wording | R4 explicitly says its lineage contract may later be consumed by DI-2 work if activated elsewhere. |
| R5 | `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929` | YES / NOT ACTIVATED | decision-review independence; `NOT ACTIVATED`; multi-provider reviewer routing would trigger reevaluation | YES / NOT ACTIVATED | payment mutation/reversal; `NOT ACTIVATED` | CONFIRMED current-contract wording | Reviewer/provider plurality is not assumed from generic review independence. |
| R6 | `d4d613a40eed187c230d55f7e21b1b0251bf612a` | YES / DORMANT / NOT ACTIVATED in current R6 scope | capability verification identity; `NOT ACTIVATED`; explicit non-consumption guard | YES / NOT ACTIVATED | refund/cancel/void/reversal path; `NOT ACTIVATED` | CONFIRMED current-contract wording | Directly reverified: R6 says current status entering R6 is `DORMANT`, activation crossed is `NO`, and identity expansion to provider/account/Asset-scoped simultaneous identities halts design freeze pending DI adjudication. |
| R7 | `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf` | YES / DORMANT / NOT ACTIVATED by present single-scope implementation | Resource Pool identity; `NOT ACTIVATED`; shared-schema entanglement requires explicit DI-1 review | YES / DORMANT / NOT ACTIVATED | generic reservation; `NOT ACTIVATED` | CONFIRMED current-contract wording | Directly reverified: adding provider/account scope to Resource Pool identity does not itself consume DI-1; activation is determined by substitution semantics enabled by schema/resolution paths. |
| R8 | `237c752671573013d090e2eacf7c2af4c0e70512` | YES semantically / NOT GENERICALLY ACTIVATED | exact R6×R7×R8 provider/account scope consistency; conditional activation if implementation permits cross-account substitution | YES semantically / DORMANT GENERICALLY / CONDITIONAL | autonomous external reversal dispatch; activates in future commercial-payment reversal execution scope | SEMANTIC_ONLY for original wording; DI semantics explicit in current contract | `Reviewed=YES` is specifically justified for DI content: §14/§15 contain substantive DI rules; §23 specifically restored/adjudicated the R6×R7×R8 DI-1 checkpoint; §22's enumerated unrecovered items concern other source gaps, not the DI sections. Document-wide `SOURCE_INCOMPLETE` therefore does not convert these DI sections to SOURCE GAP. |
| R9 | `0ef14b00a1569ae649fe064aadecb498a2bc71e6` | YES / NOT ACTIVATED BY GENERIC R9 | repository/source authority; `NOT ACTIVATED`; substitution-enabled repository/source operation would activate exact scope | YES / NOT ACTIVATED BY GENERIC R9 | reversal dispatch; `NOT ACTIVATED`; future coupled reversal scope activates separately | SEMANTIC_ONLY beyond confirmed reviewed/not-activated result | Source authority is not provider/account substitution or payment reversal authority. |
| R10 | `66db007de1ccbf1cdac011ef10cb299e5499aec1` | YES / NOT ACTIVATED BY GENERIC R10 | artifact/deployment provenance; `NOT ACTIVATED`; substitution-enabled artifact/deployment path would activate exact scope | YES / NOT ACTIVATED BY GENERIC R10 | future externally dispatched economic reversal only | SEMANTIC_ONLY for exact original DI wording | Artifact lineage may carry provider identity but does not authorize cross-account substitution. |
| R11 | `f811d528730d819aa793a1901e9d1b310242fbcd` | YES / NOT ACTIVATED BY GENERIC R11 | corrective obligation preserves upstream exact provider/account; substitution-enabled corrective path would activate exact scope | YES / NOT ACTIVATED BY GENERIC R11 / CONDITIONAL | reversal-related obligation alone does not activate; actual autonomous reversal execution does | SEMANTIC_ONLY for exact original DI wording | Corrective ownership may concern a reversal without owning reversal execution authority. |
| R12 | `7a4a186fc2fd030d6ee52725b1111395597ffa90` | YES / NOT ACTIVATED BY GENERIC R12 | durable scheduling preserves supplied provider/account/binding; scheduler substitution would activate exact scope | YES / NOT ACTIVATED BY GENERIC R12 | reversal scheduling only; actual external reversal dispatch activates elsewhere | SEMANTIC_ONLY for exact original DI wording | Scheduling does not create DI-2 authority. |
| R13 | `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e` | YES / NOT ACTIVATED BY GENERIC R13 | executor health; provider/account substitution on health failure would activate exact scope | YES / NOT ACTIVATED BY GENERIC R13 | separate reversal-execution scope only | SEMANTIC_ONLY for exact original wording | Health evidence cannot become provider substitution or reversal authority. |
| R14 | `969b70e8b4b52606c9e34f617bed32a91b395d25` | YES / NOT ACTIVATED BY GENERIC R14 | replacement preserves existing provider/account identity; intentional rebinding during transfer activates exact scope | YES / NOT ACTIVATED BY GENERIC R14 | reversal dispatched by replacement path activates exact reversal scope | SEMANTIC_ONLY for exact original wording | Runtime authority transfer does not itself rebind provider/account authority. |
| R15 | `1b46aa43f33c19e75ef0696286693592fbbf8c77` | YES / NOT ACTIVATED BY GENERIC R15 | exact provider/account on financial observations; evidence collection/reconciliation must not cross-account substitute | YES / NOT ACTIVATED BY OBSERVATION CAPTURE | observing refund/void/credit/reversal evidence; `NOT ACTIVATED`; Money Scout outbound reversal dispatch activates separately | CONFIRMED current-contract semantics; historical exact wording source-limited | Strong negative control for G3: reversal evidence/history is explicitly not reversal execution authority. |
| R16 | `7dd92976f68ee90540771b3710e42b6d5b7f396f` | YES / NOT ACTIVATED BY GENERIC R16 | exact provider/account inherited from R15; cross-account reconciliation would activate exact scope | YES / NOT ACTIVATED BY RECONCILIATION | interpreting reversal/credit/adjustment evidence; external dispatch activates separately | CONFIRMED current-contract semantics; historical exact wording source-limited | Strong negative control for G3: reconciliation computation is not reversal dispatch. |
| R17 | `16a234e897fe6e119392707a7187a3232f0fd972` | YES / ACTIVE | **`DI-1/COMMERCIAL_PAYMENT`**; `CONSUME`; exact provider/account is part of Offer Version / Grant authority | YES / DORMANT FOR GENERIC OFFER / CONDITIONAL | generic forward charging/Offer authority does not activate DI-2; autonomous refund/cancel/void/reversal dispatch does | **CONFIRMED named scope** | Explicit commercial-payment activation/consumption point. Scope is expressly not global. |
| R18 | `226d67276f1627c26045ead9c7717023e7e764db` | YES / CONDITIONAL SCOPE-BY-SCOPE | **`DI-1 / BUILDER_EXECUTION`** activates where simultaneous/historical Builder provider accounts/bindings exist; activation does not consume unrelated QA/Release/Commercial scopes | YES / NOT ACTIVATED GENERICALLY / CONDITIONAL | capability recovery reversal mutation activates separately | CONFIRMED current-contract named Builder scope | Builder activation does not imply `DI-1/COMMERCIAL_PAYMENT`. Separately, R18-A1 explicitly names **commercial payment/provider adapters** as mandatory capability-binding audit targets. G2 must therefore test whether the binding underlying R17/R19/R20 commercial payment is exact under R18, even though R18 disclaims automatic consumption of the named commercial scope. |
| R19 | `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3` | YES / ACTIVE WHERE APPLICABLE | **CONSUMES `DI-1/COMMERCIAL_PAYMENT` FROM R17**; exact commercial provider/account preserved; no broadening | YES / NOT ACTIVATED BY GENERIC LINEAGE STORAGE / CONDITIONAL | reversal lineage/history can be represented; outbound autonomous reversal dispatch activates DI-2 | **CONFIRMED named commercial scope** | Directly reverified: R19 says verbatim it consumes activated `DI-1/COMMERCIAL_PAYMENT` scope from R17 where applicable and explicitly says it does not broaden that activation merely by preserving historical account identity. |
| R20 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | YES / ACTIVE AS CONSUMER WHERE UPSTREAM SCOPE APPLIES | consumes exact R18/R17/R19 provider/account identities; where **`DI-1/COMMERCIAL_PAYMENT`** is active, revalidates that exact scope; creates no new substitution authority | YES / NOT ACTIVATED BY GENERIC R20 / CONDITIONAL | autonomous refund/cancel/void/reversal boundary activates exact DI-2 boundary | **CONFIRMED named commercial scope in current contract** | Boundary evaluation is not itself reversal dispatch unless that exact boundary owns autonomous external reversal execution. |

## 4. Adversarial-review adjudication

### 4.1 R8 reviewed-status assurance — confirmed

R8's document-wide `SOURCE_INCOMPLETE` status does not force its DI sections to `SOURCE GAP`.

The decisive source facts are:

- §14 contains the DI-1 provider/account rule and the R6×R7×R8 exact-scope checkpoint;
- §15 contains the DI-2 conditional activation rule;
- §22 explicitly enumerates the unrecovered items, and those listed gaps concern migration labels/ordinals, audit vocabulary, acceptance-fixture labels/order, closure-evidence list, rejected-alternative wording, worked examples, and the reconciliation-capability taxonomy;
- §23 specifically records restoration/adjudication of the R6×R7×R8 provider/account checkpoint.

Therefore `Reviewed=YES` is justified for the DI content specifically while exact original wording remains `SEMANTIC_ONLY`.

### 4.2 R18 commercial-payment relationship — refined, not reclassified

R18 §20 correctly says activation is scope-by-scope and that Builder activation does not consume QA, Release, Commercial Payment, or unrelated DI-1 scopes.

That does **not** mean R18 has no commercial-payment-adjacent obligation. R18-A1 explicitly requires auditing `commercial payment/provider adapters` as capability-binding consumers.

Therefore G2 must separately ask:

1. whether the commercial-payment capability binding is exact under R18; and
2. whether the named `DI-1/COMMERCIAL_PAYMENT` scope is owned/consumed consistently by R17/R19/R20 without being silently broadened into R18 generic scope.

These are related but not identical questions.

### 4.3 R6 direct verification — confirmed

R6 §19 explicitly says:

- registry reviewed through DI-2;
- DI-1 current status entering R6 is `DORMANT`;
- activation crossed is `NO` under current scope;
- required action is `NOT ACTIVATED`;
- richer capability rows alone do not constitute DI-1 consumption;
- identity expansion to simultaneous provider/account/Asset scope requires separate DI adjudication before design freeze.

The G0 row is accurate.

### 4.4 R7 direct verification — confirmed

R7 §24 explicitly says:

- DI-1 status is `DORMANT`;
- activation crossed by the present single-scope implementation is `NO`;
- adding provider/account scope to Resource Pool identity does not itself consume DI-1;
- shared R7/R6 schema identity surfaces require explicit entanglement review;
- activation depends on substitution semantics enabled by schema/resolution behavior;
- DI-2 is `DORMANT` and not crossed by generic reservation.

The G0 row is accurate.

### 4.5 R19 direct verification — confirmed

R19 §22 explicitly states:

`CONSUMES ACTIVATED DI-1/COMMERCIAL_PAYMENT SCOPE FROM R17 WHERE APPLICABLE`

and separately says R19 does not broaden the activation beyond the commercial/payment scope merely by preserving historical account identity.

The G0 row is accurate.

## 5. Immediate corpus-level observations — inventory only

These remain inventory observations, not Phase-G defects.

### G0-O1 — explicit negative dispositions are common and usable

R1–R7 and R9–R16 generally contain explicit reviewed/not-activated or dormant language. These are usable negative activation dispositions because they are not inferred from silence.

R8 uses different wording but its DI content was specifically recovered/reviewed as described above.

### G0-O2 — named commercial-payment chain is explicit

The current contracts establish:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 consumes same named scope → R20 revalidates same named scope where applicable`

R18 is not automatically part of that named activation. It is nevertheless a mandatory binding-consumer audit surface for commercial payment/provider adapters under R18-A1.

### G0-O3 — R6/R7/R8 provider/account seam is explicit

R6 keeps DI-1 dormant under the current identity model, R7 keeps it dormant under the present single-scope reservation model with an entanglement guard, and R8 requires the same exact provider/account scope across capability proof, reservation, and reconciliation.

This is a G2 seam, not yet a G0 defect.

### G0-O4 — DI-2 contracts distinguish representation from dispatch

R11/R12/R15/R16/R19/R20 distinguish reversal-related ownership, scheduling, evidence, reconciliation, lineage, or eligibility from actual autonomous external reversal dispatch.

G3 must inspect live call paths before deciding current DI-2 activation ownership.

### G0-O5 — DI-1 × DI-2 composition remains implementation-trace dependent

The contracts define the rule that any DI-2-active reversal dispatch must preserve exact provider/account identity. Whether current code performs such a dispatch, and whether identity is preserved from eligibility through T1→T2 dispatch, remains for G3/G4.

## 6. G0 carried-forward questions

G0 does not classify these as defects.

1. **Actual DI-2 dispatch owner:** which current worker/adapter, if any, autonomously dispatches refund/cancel/void/reversal externally?
2. **R18 commercial-payment binding seam:** does the binding underlying R17/R19/R20's commercial-payment path remain exact under R18-A1, and how does that coexist with R18's explicit non-consumption of unrelated named scopes?
3. **Exact historical wording assurance:** R8–R16 current recovered contracts may be semantically specific while original exact phrasing remains source-limited.
4. **DI-1 conditional scopes:** future activation triggers must not be mistaken for present activation.

## 7. G0 completeness and certification

- R1–R20 rows present: **20 / 20**.
- Each row has a pinned current contract blob.
- Each row has a DI-1 inventory disposition.
- Each row has a DI-2 inventory disposition.
- No `NOT ACTIVATED` result was inferred solely from silence.
- R8 and R18 priority questions were directly source-checked and adjudicated.
- R6, R7, and R19 high-risk G2 nodes were directly source-checked and confirmed.
- No Phase-G defect is finalized by G0.
- Implementation authority remains **SUSPENDED**.

**G0 inventory status:** CERTIFIED / COMPLETE 20/20.

This certification authorizes progression to G1/G2/G3/G4 audit work only. It does not authorize implementation or remediation.