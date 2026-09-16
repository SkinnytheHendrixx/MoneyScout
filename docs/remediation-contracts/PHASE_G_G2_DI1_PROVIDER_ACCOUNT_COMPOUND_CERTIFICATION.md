# Phase G — G2 DI-1 Provider/Account Compound Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / G2 CERTIFIED  
**Phase:** G — Design Input Consistency  
**Batch:** G2 — High-risk provider/account compound  
**Compound:** `R6 → R7 → R8 → R17 → R18 → R19 → R20`  
**Implementation authority:** SUSPENDED

## 1. Certification result

G2 **FAILS** the high-risk DI-1 provider/account compound.

Confirmed finding:

### G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`

The active named `DI-1/COMMERCIAL_PAYMENT` scope requires the exact provider **and exact provider-account identity** authorized for the commercial action. The current live commercial path narrows that scope to provider string plus mutable/current capability and adapter configuration, permitting the same nominal provider scope to refer to a different actual account over time.

This is one end-to-end Phase-G defect, not multiple per-node findings. Phase-F representability defects are supporting evidence and remain independently owned.

## 2. Governing contract topology

G1 certified the following node-level semantics as individually consistent:

- R6 verifies exact capability truth under the current identity model and keeps DI-1 dormant until consequential plurality/substitution exists;
- R7 keeps DI-1 dormant under present single-scope reservation semantics, with an explicit provider/account entanglement guard;
- R8 requires exact provider/account consistency across capability proof, reservation, execution truth, and reconciliation where material;
- R17 explicitly activates `DI-1/COMMERCIAL_PAYMENT` for commercial/payment execution;
- R18 preserves/revalidates exact capability bindings scope-by-scope and audits commercial payment/provider adapters without owning R17's commercial-authority proposition;
- R19 consumes the activated `DI-1/COMMERCIAL_PAYMENT` scope from R17 where applicable and must preserve exact provider/account identity historically;
- R20, where the named scope is active, must revalidate the exact bound commercial provider/account and must not substitute current/default identity.

Therefore the compound invariant is:

> The exact provider and provider-account identity authorized for one commercial path must remain the same identity through capability proof/binding, commercial authority, historical lineage, and actual consequential dispatch/consumption. Provider-family, provider-string, logical-capability-key, or current-configuration equality is insufficient.

## 3. Pinned implementation evidence

### 3.1 Capability schema/current projection

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

The `capabilities` table:

- stores one row per logical `key` via `UNIQUE(key)`;
- stores `provider` as a first-class field;
- has no first-class provider-account identity column;
- carries account identity, where present, inside generic mutable metadata.

### 3.2 Capability upsert/current lookup

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

`setCapabilityAvailable()` performs `ON CONFLICT(key) DO UPDATE` and overwrites provider, access level, verification method, metadata, verification time, expiry, and update time on the singleton current row.

`getCapability(key)` / `hasCapability(key)` consume the current row by logical key.

This is the already-certified Phase-F F06-01 replacement mechanism. G2 uses it as evidence; it is not itself re-counted as a Phase-G defect.

### 3.3 Commercial activation representation

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`commercial_activations` persists provider, plan/price/current activation data, checkout reference, provider operation key, and authorization timestamps/actors. It does **not** persist:

- exact provider-account identity;
- immutable merchant capability version/binding ID;
- immutable R18 binding identity tied to the commercial activation.

`payment_provider_events` records provider but likewise has no declared exact provider-account field.

### 3.4 Commercial worker — current account existence is checked, but exact account equality is not

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

The worker uses provider-derived capability keys such as:

`PAYMENT_MERCHANT_ACCESS:${provider}`

`merchantCapabilityVerified()` requires a usable current capability and only checks that `metadata.accountId` is a non-empty string. It does not compare that account against an account previously frozen/authorized for this commercial activation.

On each reconciliation pass the worker re-reads the current merchant capability by logical key.

The worker later resolves the commercial adapter by `activation.provider`.

### 3.5 Commercial authorization does not freeze provider-account identity

Same file, `authorizeCommercialBoundary()`.

For `CUSTOMER_CHARGING`, the function:

- sets Asset-level `customerChargingAuthorized = true`;
- records `chargingAuthorizedAt` / `chargingAuthorizedBy` on the commercial activation;
- records the commercial activation ID in human-action/event metadata.

It does **not** persist the merchant account ID that satisfied capability verification and does not attach one immutable R18 provider/account binding.

### 3.6 Commercial adapter contract has no exact account/binding identity

`artifacts/api-server/src/lib/commercial-payment-adapter.ts`  
Blob: `c55e778cf9cf03281748daf35880e0c5a1ac024d`

`CommercialPreparationInput` includes Asset ID, Opportunity ID, provider operation key, currency, price, production URL, and promised outcome. It carries no provider-account identity or capability-binding identity.

Adapters are registered into a module-level map keyed by bare provider string and retrieved by provider string.

### 3.7 Second independent substitution mechanism — live bridge configuration drift

The configured live commercial adapter is built from:

- `MONEY_SCOUT_PAYMENT_PROVIDER`;
- `MONEY_SCOUT_PAYMENT_BRIDGE_URL`;
- `MONEY_SCOUT_PAYMENT_BRIDGE_TOKEN`.

The adapter map is keyed only by provider string. Therefore a deploy/restart/config rotation can keep provider `P` constant while changing bridge URL/token to a different merchant-account authority and replace the registered adapter for `P` without any durable identity proving continuity with the previously authorized account.

This is independent of the mutable capability-metadata mechanism:

- fixing/freeze-checking `metadata.accountId` alone would not prove that the bridge URL/token actually reaches that same account;
- fixing adapter bridge identity alone would not preserve capability authority/history/binding identity.

Both mechanisms violate the same end-to-end invariant and are therefore folded into **one G2-01 finding**, not counted separately.

## 4. Connected same-provider/different-account attack

Use a single provider string `P` throughout so provider equality never reveals the substitution.

### T0 — authorized account A1

1. Merchant capability key is `PAYMENT_MERCHANT_ACCESS:P`.
2. Current capability row contains provider `P`, `accountId=A1`, verification V1.
3. `merchantCapabilityVerified()` passes because some non-empty account exists.
4. Commercial activation persists provider `P`, but not A1.
5. Commercial adapter `P` is registered against bridge/account authority corresponding to A1.
6. Checkout may be prepared.
7. `CUSTOMER_CHARGING` authority is granted for the commercial activation.

Under R17, the active `DI-1/COMMERCIAL_PAYMENT` authority is exact `P/A1`.

### T1 — capability projection drifts to B1

8. `setCapabilityAvailable()` overwrites `PAYMENT_MERCHANT_ACCESS:P` with current metadata `accountId=B1` / V2.
9. A1 is no longer the independently addressable current capability authority under that singleton row.

### T1b — independent adapter bridge drift to B1

10. Without changing provider string `P`, configuration changes bridge URL/token so the newly registered adapter `P` now reaches account/authority B1.
11. The module-level provider-keyed map replaces the live adapter association for `P`; no durable A1 adapter/binding identity is attached to the activation.

Either step 8 alone or step 10 alone can create account substitution pressure. Together they demonstrate the full same-provider/different-account failure mode.

### T2 — later commercial activation/consumption

12. `reconcileCommercialActivation()` re-reads current merchant capability by `PAYMENT_MERCHANT_ACCESS:P`.
13. B1 passes `merchantCapabilityVerified()` because it is a usable current row with a non-empty account ID.
14. The commercial activation still contains only provider `P`, not frozen A1.
15. `getCommercialPaymentAdapter(P)` resolves the provider-keyed current adapter.
16. Adapter input carries no A1 account/binding identity.
17. No equality check proves that current capability account, current bridge account, and originally authorized account are all A1.
18. A commercial action can therefore proceed under the same provider string while the actual account has changed from A1 to B1.

## 5. Why this is DEFECT, not `DI_SOURCE_UNRESOLVED`

R20's incomplete representability does **not** weaken G2-01.

The decisive identity loss is already affirmatively demonstrated upstream:

- `commercial_activations` does not persist A1;
- `merchantCapabilityVerified()` checks only that some current account exists;
- `authorizeCommercialBoundary()` does not freeze the reviewed account;
- adapter input carries no exact account/binding identity;
- provider-keyed adapter registration can change the live bridge/account behind the same provider string.

Therefore even a hypothetical perfect canonical R20 decision object would have no exact A1 identity supplied by this path unless the upstream wiring were corrected first.

This is direct negative evidence, not a source/documentation gap. The classification is therefore **DEFECT**, not `DI_SOURCE_UNRESOLVED`.

## 6. Finding taxonomy

### `DI_SCOPE_NARROWED`

Earned because the active named scope normatively requires provider + account, while the live commercial representation/dispatch contract preserves only provider plus mutable/current account state.

### `DI_IDENTITY_SEMANTIC_DRIFT`

Earned independently because the same nominal commercial scope can refer to A1 at authorization time and B1 at later execution time while provider string `P` remains unchanged.

Both tags are retained because they describe different proven properties:

- structural omission/narrowing of a required account dimension;
- temporal identity substitution/drift across the same nominal scope.

## 7. Independence from Phase-F findings

G2-01 is not a restatement of F06-01/F06-02/F05/F01/F02.

Remove-one-fix counterfactual:

Assume every endpoint object is fully representable:

- arbitrary-N capability history exists;
- exact immutable R18 bindings exist;
- exact Offer/Grant authority exists;
- exact R19 lineage exists;
- exact R20 boundary decisions exist.

G2-01 remains open unless the implementation actually wires the **same exact provider-account identity** through those objects and proves equality at actual commercial dispatch.

Representability and end-to-end identity wiring are different acceptance properties.

Conversely, one end-to-end correction that freezes/attests exact `P/A1` through capability binding, Offer/Grant, lineage, boundary decision, and actual adapter/bridge dispatch closes the G2 invariant. The defect should not be split into separate Phase-G findings for R6, R8, R17, R18, R19, and R20 merely because all participate.

## 8. R7 and R8 counting disposition

### R7

No separate R7 G2 defect is established. The commercial adapter contract enforces `costMode === "ZERO_CASH"`; the reviewed path does not expose an independent scarce-resource account-substitution decision distinct from G2-01.

### R8

R8's exact provider/account truth requirement is implicated by the same A1→B1 failure, and current payment-event representation lacks a declared first-class provider-account field. This is folded into G2-01 because repairing the exact end-to-end provider/account invariant necessarily supplies R8 the same identity; no independently repairable second DI invariant survives the counterfactual.

## 9. Named-scope topology result

Contract-level named-scope propagation remains correct:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 consumes same named scope → R20 revalidates exact named scope`

No `DI_NAMED_SCOPE_DRIFT` finding is opened.

The failure is that the implementation preserves the **name** while narrowing/allowing drift in the provider-account identity that the name denotes.

## 10. Relevant Phase-G attack results

- **G-A1 scope broadening:** PASS at contract level.
- **G-A2 scope narrowing:** FAIL / G2-01.
- **G-A3 named-scope collapse:** PASS at contract level.
- **G-A4 current/default account substitution:** FAIL / G2-01.
- **G-A9 successor/current-state inheritance:** FAIL condition is included in G2-01 acceptance; provider/logical-key equality cannot authorize successor/current account substitution.
- **G-A10 inactive-scope contamination:** no separate failure established.

G4 later executes the complete G-A1 through G-A12 suite; these are G2-specific results only.

## 11. Required acceptance fixture for G2-01

A compliant remediation/recheck must prove all of the following:

1. create provider `P` / account `A1` capability authority V1;
2. bind commercial execution to exact immutable R18 binding `BIND1` for `P/A1`;
3. create exact R17 Offer/Grant `O1/G1` for `P/A1`;
4. freeze exact `P/A1` into R19 lineage `L1`;
5. authorize `CUSTOMER_CHARGING` specifically against that frozen `P/A1` authority;
6. replace current capability projection with `P/B1/V2` while retaining A1 and B1 as distinct authority versions;
7. independently rotate/reconfigure the live adapter bridge URL/token for provider `P` so the provider string remains the same while the actual bridge/account becomes B1;
8. prove neither current capability `P/B1` nor current adapter bridge `P/B1` can satisfy `O1/G1/L1/BIND1` merely because provider/key matches;
9. prove R20 decision `D1` consumes exact `L1/BIND1/P/A1`;
10. prove the actual adapter/provider dispatch carries or otherwise authoritatively attests the same exact `P/A1` account/binding identity, not merely provider `P`;
11. prove a mismatch between frozen A1 and live bridge/account B1 fails closed before consequential dispatch;
12. if B1 is intended, require explicit governed successor/rebinding authority rather than in-place substitution;
13. repeat under restart/redeploy/config rotation so adapter re-registration cannot silently rewrite account authority;
14. repeat across arbitrary A1...AN/current changes without current-state reconstruction.

## 12. Final adjudication

**G2:** FAIL / ONE CONFIRMED PHASE-G DI-1 DEFECT.

- **G2-01:** CONFIRMED `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`.
- Confirmed independent substitution mechanisms:
  1. mutable capability-account metadata/current-row replacement;
  2. provider-keyed live adapter bridge URL/token replacement with no exact account/binding attestation.
- Phase-F representability defects remain supporting evidence and are not double-counted.
- R20's incomplete representability does not downgrade classification because identity loss is directly proven before the R20 boundary.
- R7 and R8 do not earn separate G2 findings on present evidence.

Implementation authority remains **SUSPENDED**.
