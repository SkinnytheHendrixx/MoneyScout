# Phase G — G3 DI-2 Node Consistency Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / G3 CERTIFIED  
**Phase:** G — Design Input Consistency  
**Batch:** G3 — DI-2 node-by-node consistency and reversal-dispatch tracing  
**Implementation authority:** SUSPENDED

## 1. Certification result

G3 **PASSES** DI-2 consistency on the reviewed current implementation.

- R1–R20: **20 / 20 `DI_CONSISTENT`** for DI-2 at their stated scopes.
- Confirmed G3 DI-2 findings: **0**.
- Current reviewed commercial-payment runtime: **no autonomous outbound refund/cancel/void/reversal dispatch surface identified**.
- Current reversal-like payment behavior is inbound provider-event observation / financial adjustment handling, not Money Scout-originated reversal execution.
- G2-01 remains open but does not itself activate DI-2.

This certification distinguishes two evidence tiers rather than overstating uniform implementation coverage:

1. **Direct execution-trace evidence** closes the active commercial-payment reversal-evidence chain through `ingestAuthoritativePaymentEvent()` and `recordAssetObservation()`.
2. **Contract semantics plus absence of contradictory live-path evidence** support the negative DI-2 dispositions for R11/R12/R20 and other non-commercial nodes that were not re-traced line-by-line to the same depth in this batch.

That calibration is intentional and part of this certification.

## 2. Governing DI-2 rule

DI-2 activates only when Money Scout itself autonomously dispatches an external economic refund/cancel/void/reversal operation.

The following do **not** activate DI-2 by themselves:

- reversal evidence/history;
- reversal reconciliation;
- reversal scheduling;
- corrective ownership;
- boundary eligibility evaluation;
- lineage representation;
- provider-originating refund/chargeback/reversal notification.

This distinction is explicitly preserved across the R1–R20 contracts and was tested against the current commercial runtime.

## 3. Final R1–R20 disposition

| Node | Final DI-2 classification | Disposition |
|---|---|---|
| R1 | `DI_CONSISTENT` | not activated |
| R2 | `DI_CONSISTENT` | not activated |
| R3 | `DI_CONSISTENT` | not activated |
| R4 | `DI_CONSISTENT` | not activated; lineage may later be consumed by activated reversal work |
| R5 | `DI_CONSISTENT` | not activated |
| R6 | `DI_CONSISTENT` | not activated |
| R7 | `DI_CONSISTENT` | dormant / not activated by reservation |
| R8 | `DI_CONSISTENT` | generic dormant / conditional only on actual external reversal dispatch |
| R9 | `DI_CONSISTENT` | not activated by generic source authority |
| R10 | `DI_CONSISTENT` | not activated by artifact/deployment provenance |
| R11 | `DI_CONSISTENT` | corrective/reversal-related obligation does not itself dispatch reversal |
| R12 | `DI_CONSISTENT` | scheduling does not create reversal authority |
| R13 | `DI_CONSISTENT` | health/liveness does not dispatch reversal |
| R14 | `DI_CONSISTENT` | runtime handoff does not itself create reversal dispatch authority |
| R15 | `DI_CONSISTENT` | provider reversal evidence capture does not activate DI-2 |
| R16 | `DI_CONSISTENT` | reversal/adjustment reconciliation does not activate DI-2 |
| R17 | `DI_CONSISTENT` | generic Offer/forward charging dormant; outbound reversal would activate separately |
| R18 | `DI_CONSISTENT` | generic capability recovery dormant; autonomous monetary reversal would activate separately |
| R19 | `DI_CONSISTENT` | reversal lineage/history does not activate DI-2 |
| R20 | `DI_CONSISTENT` | boundary evaluation alone does not activate DI-2; autonomous reversal boundary would |

## 4. Direct commercial-payment execution trace

### 4.1 Adapter surface has no reversal primitive

`artifacts/api-server/src/lib/commercial-payment-adapter.ts`  
Blob: `c55e778cf9cf03281748daf35880e0c5a1ac024d`

The `CommercialPaymentAdapter` interface exposes only:

- `prepare(...)`;
- `activateAndVerify(...)`.

The configured HTTP adapter invokes only:

- `/commercial/prepare`;
- `/commercial/activate`.

There is no reviewed refund/cancel/void/reversal method, generic mutation switch, or alternate endpoint branch inside this adapter implementation.

### 4.2 Reversal-like payment statuses are inbound observations

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

`ingestAuthoritativePaymentEvent(...)` recognizes reversal-like statuses including:

- `REFUNDED`;
- `PARTIALLY_REFUNDED`;
- `CHARGEBACK`;
- `REVERSED`.

Direct adversarial review traced the function statement-by-statement. Its branches consist of database reads/writes plus calls to `recordEvent(...)` and `recordAssetObservation(...)`. It contains:

- no `fetch()`;
- no payment-adapter invocation;
- no `getCommercialPaymentAdapter(...)` call;
- no outbound provider mutation.

The function therefore records provider-originating economic evidence; it does not originate the reversal.

### 4.3 `recordAssetObservation()` closes the last dependency

`artifacts/api-server/src/lib/asset-operations-worker.ts` — current reviewed `main` artifact.

The adversarial review followed the imported `recordAssetObservation(...)` dependency rather than inferring behavior from its name.

Its implementation:

- validates the observation input;
- enters `db.transaction(...)`;
- reads the Asset;
- inserts/deduplicates an `asset_observations` row;
- updates Asset aggregate instrumentation/current totals where the observation is FACT provenance;
- appends an Asset event;
- returns the stored observation result.

There is no network call, payment adapter invocation, provider bridge invocation, or external side effect in this function.

Review of the surrounding Asset operations worker found that its outbound HTTP behavior is limited to the unrelated read-only Asset health probe against the Asset's production URL. That health GET is not a payment-provider mutation and cannot constitute DI-2 reversal execution.

Therefore the entire reviewed chain:

`ingestAuthoritativePaymentEvent(...) → recordAssetObservation(...)`

is directly established as **inbound evidence persistence only**.

## 5. Highest-risk contract negative controls

### R12 — scheduling is not dispatch

`WI-R12.md` — blob `7a4a186fc2fd030d6ee52725b1111395597ffa90` — §17 states that scheduling a reversal-related obligation does not activate DI-2. Activation occurs only when the external refund/cancel/void/reversal is actually dispatched.

**Final classification:** `DI_CONSISTENT`.

### R15 — observation is not dispatch

`WI-R15.md` — blob `1b46aa43f33c19e75ef0696286693592fbbf8c77` — §18 states that refund/void/credit/reversal evidence may be preserved without activating DI-2. DI-2 activates when Money Scout itself dispatches the external action.

That contract distinction is now directly matched by the implementation trace in §4.

**Final classification:** `DI_CONSISTENT`.

### R16 — reconciliation is not dispatch

`WI-R16.md` — blob `7dd92976f68ee90540771b3710e42b6d5b7f396f` — §20 says reversal/credit/adjustment interpretation does not authorize external reversal dispatch. Its non-goals separately forbid dispatch merely because reconciliation indicates a reversal economically.

**Final classification:** `DI_CONSISTENT`.

### R17 / R19 / R20

Previously reviewed contract evidence establishes:

- R17 generic Offer/forward-charging authority does not activate DI-2;
- R19 may preserve reversal lineage/history without owning dispatch;
- R20 evaluates boundary eligibility but does not itself create reversal authority unless that exact boundary also owns the external reversal operation.

No contradictory current outbound commercial reversal surface was found.

## 6. Evidence-strength calibration

G3 does not claim that every negative node received an identical implementation trace.

### Tier A — direct trace

The current commercial reversal-like path is directly traced through:

- `CommercialPaymentAdapter` interface and configured HTTP adapter;
- `ingestAuthoritativePaymentEvent(...)`;
- `recordAssetObservation(...)`.

This supports a clean present-state conclusion for the commercial-payment surface: **no reviewed outbound reversal dispatch exists there**.

### Tier B — contract + no contradictory live evidence

R11 corrective ownership, R12 scheduling, R8 external truth, and R20 boundary evaluation are strongly constrained by their contracts, and the extensive repository review to date has surfaced no contradictory provider reversal call from those responsibilities.

However, G3 did not independently re-trace every R11/R12/R20 application path statement-by-statement to the same depth as the commercial chain.

This is not promoted to `DI_SOURCE_UNRESOLVED` because:

- their DI-2 contract dispositions are explicit rather than inferred from silence;
- the actual commercial provider interface through which current payment mutations occur has no reversal primitive;
- the directly reviewed reversal-like runtime path terminates in local persistence rather than external execution;
- targeted repository searches produced no contrary current reversal-dispatch implementation.

If a later audit identifies a generic provider-mutation path outside these reviewed surfaces, this G3 certification is invalidated for that scope and must be reopened.

## 7. G2-01 interaction and DI-1 × DI-2 composition

G2-01 remains a confirmed DI-1 defect in forward commercial execution. It proves that provider/account identity can drift under provider-keyed/current-account machinery.

That defect does **not** activate DI-2 because no current reviewed reversal dispatch exists.

If Money Scout later gains an autonomous refund/cancel/void/reversal operation, that exact boundary must independently prove:

1. valid DI-2 reversal authority for the exact reversal operation; and
2. valid DI-1 exact provider/account identity at dispatch.

The provider-keyed/current-account behavior already rejected by G2-01 cannot satisfy requirement 2.

## 8. G-A11 / G-A12 status

### G-A11 — DI-2 eligibility-to-dispatch identity drift

**Present state:** NOT TRIGGERED.

No reviewed DI-2-active outbound dispatch exists on the current commercial surface.

If reversal eligibility is later evaluated for `P/A1` and a delayed dispatch uses current/default `P/B1`, classify as `DI_IDENTITY_SEMANTIC_DRIFT`.

### G-A12 — DI-1 × DI-2 dispatch-boundary mismatch

**Present state:** NOT TRIGGERED.

A future reversal implementation must prove both directions independently:

- valid reversal authority cannot excuse wrong provider/account targeting;
- correct provider/account targeting cannot excuse missing reversal authority.

Any future implementation reusing the current provider-keyed adapter/current-capability machinery automatically requires direct re-audit against G2-01.

## 9. G3 attack dispositions

- **G-A5 reversal-evidence false activation:** PASS. Inbound authoritative reversal events remain evidence, not dispatch.
- **G-A6 reversal-dispatch false negative:** PASS on the reviewed current commercial-payment surface; no outbound reversal primitive exists there.
- **G-A7 scheduler laundering:** PASS at contract/current-evidence level; scheduling does not create reversal authority.
- **G-A8 evidence laundering:** PASS; R15/R16 observation/reconciliation cannot manufacture prior reversal authority.
- **G-A11 eligibility-to-dispatch drift:** NOT CURRENTLY TRIGGERED; mandatory on any future/newly discovered reversal dispatch.
- **G-A12 DI-1 × DI-2 mismatch:** NOT CURRENTLY TRIGGERED; mandatory on any future/newly discovered reversal dispatch.

The complete G-A1 through G-A12 suite remains for G4.

## 10. Invalidation conditions

Reopen G3 if any of the following occurs:

- `CommercialPaymentAdapter` gains refund/cancel/void/reversal or generic payment-mutation capability;
- a new payment bridge/provider adapter is added with outbound reversal behavior;
- R11/R12/R20 or another generic execution surface is found to call a provider reversal mutation;
- `ingestAuthoritativePaymentEvent(...)` or `recordAssetObservation(...)` gains outbound provider behavior;
- reversal eligibility becomes connected to actual external dispatch;
- a future implementation attempts to reuse G2-01's provider-keyed/current-account mechanism for reversal dispatch.

## 11. Final adjudication

**G3:** PASS / NO CONFIRMED DI-2 CONSISTENCY DEFECT.

- R1–R20: **20 / 20 `DI_CONSISTENT`** for DI-2 at their stated scopes.
- Commercial-payment reversal-like runtime path: directly verified as inbound evidence persistence, not outbound reversal dispatch.
- `recordAssetObservation(...)`: directly verified as database persistence/aggregate update only; no provider mutation.
- Current commercial adapter: no reversal operation.
- G2-01: remains open DI-1 defect, but does not itself activate DI-2.
- G-A11/G-A12: not presently triggered; mandatory if reversal dispatch appears.
- Evidence tier distinction preserved: direct trace for the commercial chain; explicit-contract-plus-no-contrary-live-evidence for untraced generic R11/R12/R20 application paths.

Implementation authority remains **SUSPENDED**.
