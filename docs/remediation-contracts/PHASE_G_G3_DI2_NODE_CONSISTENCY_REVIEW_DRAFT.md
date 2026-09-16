# Phase G — G3 DI-2 Node Consistency Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** G — Design Input Consistency  
**Batch:** G3 — DI-2 node-by-node consistency and reversal-dispatch tracing  
**Implementation authority:** SUSPENDED

## 1. Purpose

G3 audits DI-2 across R1–R20 and directly inspects the live commercial-payment runtime to determine whether Money Scout currently owns any autonomous outbound refund/cancel/void/reversal dispatch scope.

The governing distinction is strict:

- reversal evidence/history is not dispatch;
- reversal reconciliation is not dispatch;
- reversal scheduling is not dispatch;
- reversal eligibility/authority evaluation is not dispatch;
- only an actual autonomous external refund/cancel/void/reversal provider call activates DI-2.

G3 also records the mandatory DI-1 × DI-2 composition consequence: if a future autonomous reversal dispatch is introduced, the exact provider/account identity at that dispatch must independently satisfy DI-1, including the G2-01 same-provider/different-account risk.

Governing artifacts:

- `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md` — blob `a89c9a46f06d9baff0a390a568e13299cd371b91`
- `PHASE_G_DESIGN_INPUT_INVENTORY_CERTIFICATION.md` — blob `295158b07845534c01bd83e6c6467f1de5152d5c`
- `PHASE_G_G2_DI1_PROVIDER_ACCOUNT_COMPOUND_CERTIFICATION.md` — blob `8efdf14d0c40468422b8a6d357eee34101c08ecb`

## 2. Provisional result

**Provisional G3 result: PASS / NO DI-2 CONSISTENCY DEFECT IDENTIFIED.**

Current evidence supports:

- all R1–R20 DI-2 dispositions are consistent with their node responsibilities;
- no current live commercial adapter method or worker path autonomously dispatches refund/cancel/void/reversal;
- the current commercial runtime observes and records reversal-like provider outcomes, but does not originate them;
- DI-2 therefore appears **not currently activated anywhere in the live commercial runtime**;
- a future reversal-dispatch implementation would activate DI-2 at that exact external-execution scope and must separately satisfy DI-1 exact provider/account targeting.

This is provisional pending adversarial review. Absence of a currently found dispatch method is not treated as proof beyond the directly reviewed commercial-payment surfaces and repository search evidence.

## 3. R1–R20 DI-2 disposition matrix

| Node | Contract DI-2 disposition | G3 provisional classification | Reason |
|---|---|---|---|
| R1 | reviewed / not activated | `DI_CONSISTENT` | Resource/provider provenance does not dispatch monetary reversal. |
| R2 | reviewed / not activated | `DI_CONSISTENT` | Capability resolution/selection does not dispatch reversal. |
| R3 | reviewed / not activated | `DI_CONSISTENT` | Freshness/evidence semantics do not dispatch reversal. |
| R4 | reviewed / not activated | `DI_CONSISTENT` | Lineage may later be consumed by reversal work but does not own dispatch. |
| R5 | reviewed / not activated | `DI_CONSISTENT` | Review/confirmation does not itself mutate payment state. |
| R6 | reviewed / not activated | `DI_CONSISTENT` | Capability verification does not dispatch refund/cancel/void/reversal. |
| R7 | reviewed / dormant / not activated | `DI_CONSISTENT` | Reservation/admission does not itself dispatch reversal. |
| R8 | reviewed semantically / generic dormant / conditional | `DI_CONSISTENT` | R8 owns exact external-execution truth; DI-2 would activate only if the actual external action is a Money-Scout-dispatched reversal. |
| R9 | reviewed / not activated by generic R9 | `DI_CONSISTENT` | Source authority does not dispatch reversal. |
| R10 | reviewed / not activated by generic R10 | `DI_CONSISTENT` | Artifact/deployment provenance does not dispatch reversal. |
| R11 | reviewed / generic not activated / conditional | `DI_CONSISTENT` | Owning a corrective or reversal-related obligation does not create execution authority. |
| R12 | reviewed / generic not activated | `DI_CONSISTENT` | Scheduling a reversal-related occurrence does not dispatch it. |
| R13 | reviewed / generic not activated | `DI_CONSISTENT` | Health/liveness does not dispatch reversal. |
| R14 | reviewed / generic not activated | `DI_CONSISTENT` | Runtime handoff does not itself create reversal dispatch authority. |
| R15 | reviewed / not activated by observation capture | `DI_CONSISTENT` | May preserve refund/void/credit/reversal evidence, but explicitly does not own outbound reversal execution. |
| R16 | reviewed / not activated by reconciliation | `DI_CONSISTENT` | May interpret reversal/credit/adjustment evidence, but explicitly does not authorize external reversal dispatch. |
| R17 | reviewed / dormant for generic Offer/forward charging / conditional | `DI_CONSISTENT` | Offer/charging authority is distinct from outbound reversal execution; reversal dispatch would activate separately. |
| R18 | reviewed / not activated generically / conditional | `DI_CONSISTENT` | Capability recovery only activates DI-2 if it actually introduces autonomous monetary reversal execution. |
| R19 | reviewed / not activated by lineage storage / conditional | `DI_CONSISTENT` | Can represent reversal lineage without owning the external action. |
| R20 | reviewed / not activated by generic boundary evaluation / conditional | `DI_CONSISTENT` | Eligibility validation does not activate DI-2 unless the exact scope also owns autonomous external reversal dispatch. |

**Provisional Phase-G DI-2 findings:** none.

## 4. Direct live dispatch tracing

### 4.1 Commercial adapter exposes no reversal operation

`artifacts/api-server/src/lib/commercial-payment-adapter.ts`  
Blob: `c55e778cf9cf03281748daf35880e0c5a1ac024d`

The `CommercialPaymentAdapter` interface exposes only:

- `prepare(...)`;
- `activateAndVerify(...)`.

There is no refund/cancel/void/reversal method in the reviewed interface.

The configured HTTP adapter calls only:

- `/commercial/prepare`;
- `/commercial/activate`.

Therefore the reviewed commercial adapter itself does not presently expose an outbound reversal-dispatch primitive.

### 4.2 Reversal-like statuses are inbound evidence, not outbound execution

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

The worker defines reversal-like authoritative provider statuses:

- `REFUNDED`;
- `PARTIALLY_REFUNDED`;
- `CHARGEBACK`;
- `REVERSED`.

They are consumed by `ingestAuthoritativePaymentEvent(...)`, which receives a signed provider event and, where appropriate, records an immutable compensating negative revenue observation.

This function does not call a provider to originate the refund/reversal. It reacts to provider-originating evidence.

Thus this runtime behavior belongs to the R15/R16 evidence/reconciliation side of the DI-2 boundary, not to DI-2-active outbound execution.

### 4.3 Repository search did not identify a live reversal call surface

Targeted code searches for refund/cancel/void/reversal dispatch terminology did not return a current outbound provider-call implementation in the reviewed repository index.

This negative search is supporting evidence only. The stronger evidence is the directly reviewed commercial adapter/worker contract above: the active commercial-payment adapter surface itself has no reversal operation.

## 5. Direct contract checks on the highest-risk negative controls

### R12 — scheduling is not reversal authority

`WI-R12.md` — blob `7a4a186fc2fd030d6ee52725b1111395597ffa90` — §17 states generic scheduling does not activate DI-2. A reversal-related obligation can be scheduled, but activation occurs only when an external refund/cancel/void/reversal is actually dispatched.

**Classification:** `DI_CONSISTENT`.

### R15 — observation is not reversal authority

`WI-R15.md` — blob `1b46aa43f33c19e75ef0696286693592fbbf8c77` — §18 explicitly says generic observation capture does not activate DI-2. R15 may preserve provider-originating refund/void/credit/reversal evidence; DI-2 activates only when Money Scout itself dispatches the external action.

This directly matches the current `ingestAuthoritativePaymentEvent(...)` behavior.

**Classification:** `DI_CONSISTENT`.

### R16 — reconciliation is not reversal authority

`WI-R16.md` — blob `7dd92976f68ee90540771b3710e42b6d5b7f396f` — §20 explicitly says generic financial reconciliation does not activate DI-2. Interpreting reversal/credit/adjustment evidence cannot authorize external dispatch.

The contract further states in its non-goals that R16 must not dispatch a refund/cancel/void/reversal merely because reconciliation indicates one economically.

**Classification:** `DI_CONSISTENT`.

### R17 / R19 / R20

G0/G1 directly verified:

- R17 generic Offer Version / forward charging authority does not activate DI-2; autonomous reversal dispatch would activate separately;
- R19 reversal lineage/history does not activate DI-2;
- R20 boundary eligibility does not itself activate DI-2 unless that exact scope also owns the actual external reversal dispatch.

No current live outbound reversal path was found that would contradict those dispositions.

## 6. Interaction with G2-01

G2-01 established a real provider/account substitution defect in the forward commercial-payment path:

- mutable capability-account current state can drift under the same provider key;
- provider-keyed adapter bridge configuration can drift under the same provider string;
- exact account identity is not frozen end-to-end.

That defect does **not** make DI-2 active by itself. Current forward charging and reversal observation remain different scopes.

However, any future autonomous refund/cancel/void/reversal implementation that reuses the same commercial adapter/capability machinery would immediately inherit a mandatory DI-1 × DI-2 composition problem.

A DI-2-active reversal boundary must therefore prove both:

1. valid reversal authority for the exact operation; and
2. exact provider/account identity for the account against which the reversal is dispatched.

The current G2-01 provider-only/current-account machinery is not acceptable evidence for requirement 2.

## 7. G-A11 / G-A12 carry-forward

No current DI-2-active dispatch exists on the reviewed commercial surface, so G-A11 and G-A12 do not presently produce an additional defect.

They remain mandatory future/conditional attacks:

### G-A11 — eligibility-to-dispatch drift

If reversal eligibility is evaluated for P/A1 at T1 and a later dispatch uses current/default P/B1, fail as `DI_IDENTITY_SEMANTIC_DRIFT`.

### G-A12 — DI-1 × DI-2 mismatch

If reversal authority is valid but dispatch targets the wrong provider/account, DI-2 does not rescue DI-1. If provider/account is exact but reversal authority is missing, DI-1 does not rescue DI-2.

A future reversal implementation using the same provider-keyed adapter or mutable capability lookup would require direct re-audit before DI-2 can be certified active/consistent.

## 8. No G2-01 duplication

G3 does not create a new defect merely because reversal-like provider events currently inherit the same provider-account representational weakness identified in G2.

Why:

- the current reversal-like path is inbound evidence capture, not outbound reversal dispatch;
- DI-2 is therefore not active on that path;
- provider/account identity weaknesses on inbound payment evidence remain governed by existing R15/R16/R8/Phase-F and G2 evidence as applicable, not by a new DI-2 activation finding.

If an outbound reversal dispatch is later found or introduced, this counting decision must be reopened because DI-2 would then be active at a consequential provider/account boundary.

## 9. Provisional attack disposition

- **G-A5 reversal-evidence false activation:** PASS — current reversal-event ingestion is not classified as DI-2-active.
- **G-A6 reversal-dispatch false negative:** no current dispatch surface identified; provisional PASS subject to adversarial source challenge.
- **G-A7 scheduler laundering:** PASS — R12 scheduling does not create reversal authority.
- **G-A8 evidence laundering:** PASS — R15/R16 provider evidence cannot manufacture prior reversal authority.
- **G-A11 eligibility-to-dispatch drift:** NOT CURRENTLY TRIGGERED; mandatory if an outbound reversal surface exists/is introduced.
- **G-A12 DI-1 × DI-2 mismatch:** NOT CURRENTLY TRIGGERED; mandatory if an outbound reversal surface exists/is introduced.

G4 will execute the complete G-A1 through G-A12 suite; this section records only G3-specific results.

## 10. Adversarial review questions

Before certification, independently challenge at least:

1. Is there any outbound refund/cancel/void/reversal method outside `CommercialPaymentAdapter` or the reviewed commercial worker that repository search missed?
2. Do any provider bridge endpoints accept a reversal operation through a generic mutation method whose name does not contain refund/cancel/void/reversal terminology?
3. Does `activateAndVerify()` or another generic commercial method internally perform reversal behavior under any input/state branch?
4. Is any R11 corrective path capable of directly invoking provider reversal rather than only creating an obligation?
5. Is any R12 job type wired directly to an external reversal adapter despite R12's contract-level negative disposition?
6. Does R8 contain an execution path specific to reversal that is not visible from the commercial adapter interface?
7. Are R15/R16 genuinely observation/reconciliation-only in live code, or does some reconciliation function mutate provider state?
8. Does R20 own or call an external reversal mutation under a generic consequence handler rather than a payment-specific method?
9. If a hidden reversal dispatch exists, does it reuse the same provider-keyed/current-account mechanism proven defective in G2-01?
10. Is `no current DI-2 activation` sufficiently supported by direct implementation evidence, or should any uninspected generic provider-mutation surface keep one scope `DI_SOURCE_UNRESOLVED` pending narrower tracing?

## 11. Provisional disposition

**G3:** PASS PROVISIONALLY / NO DI-2 CONSISTENCY FINDING IDENTIFIED.

- R1–R20: provisionally `DI_CONSISTENT` for DI-2 at their stated scopes.
- Current commercial runtime: no reviewed autonomous outbound reversal operation identified.
- Reversal-like provider events: inbound evidence/reconciliation only.
- G2-01 remains open but does not itself activate DI-2.
- Any future or newly discovered autonomous reversal dispatch must reopen G3 and trigger G-A11/G-A12 with exact DI-1 provider/account verification.

Certification status remains pending adversarial review.

Implementation authority remains **SUSPENDED**.
