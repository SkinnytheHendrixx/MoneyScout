# Phase F Batch 05 — R17 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / BATCH 05 CERTIFIED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F3 — R17 Offer Versions / Customer-Charging Grants  
**Implementation authority:** SUSPENDED

## 1. Certification result

R17 **FAILS Phase-F representability certification**.

Confirmed findings:

1. **F05-01 — `REPRESENTABILITY_DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION`** — CONFIRMED.
2. **F05-02 — `REPRESENTABILITY_DEFECT / OFFER_VERSION_CARDINALITY`** — CONFIRMED.
3. **F05-03 — `REPRESENTABILITY_DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION`** — CONFIRMED.
4. **F05-04 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`** — CONFIRMED UNRESOLVED.

No fourth defect is opened for in-place price/provenance mutation; that behavior is direct evidence under F05-01 because the current row is not a valid immutable Offer Version in the first place.

The adversarial review independently confirmed the schema/application singleton model, the narrow `planFingerprint`, the in-place offer mutation path, the absence of merchant `accountId` from durable charging authority, and the distinction between Offer identity and Grant authority. Post-review repository-wide keyword searches for `grant` and Offer/charging-grant terminology returned no code/file matches, strengthening—but not solely proving—the conclusion that no separate canonical Grant representation exists on the default branch.

## 2. Pinned evidence basis

### R17 governing contract

`docs/remediation-contracts/WI-R17.md`  
Blob: `16a234e897fe6e119392707a7187a3232f0fd972`

R17 requires an immutable Offer Version or equivalent commercial-authority object binding, where applicable, exact Asset/Opportunity/Bet/R4 Evaluation Cycle, Product/Monetization authority, exact R10 Artifact Version and Release/deployment, provider/account, currency/price/terms/entitlements/promised outcome, checkout/payment configuration, commercial fingerprint, and creation/supersession provenance.

Material commercial change must create successor `O2`; it must not rewrite `O1`.

R17 separately requires a `CUSTOMER_CHARGING` Grant or equivalent execution grant bound to one exact Offer Version, exact provider/account scope, permitted action scope, issuance provenance/status, and monotonic revocation/supersession history.

### Declarative Asset/commercial schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

Current persistence includes one `commercial_activations` workflow row containing:

- Asset and Opportunity IDs;
- `planSnapshot` / `planFingerprint`;
- provider, currency, price, price provenance;
- checkout reference / provider operation key;
- charging and production-credential authorization timestamps/actors;
- runtime status/lifecycle fields.

It does not declare a canonical immutable Offer Version object or `CUSTOMER_CHARGING` Grant object.

The schema also declares:

`commercial_activations_asset_unique = UNIQUE(asset_id)`.

`assets.authorities` contains mutable authority booleans including `customerChargingAuthorized`.

### Effective Asset/commercial migration

`lib/db/src/asset-runtime-migrations.ts`  
Blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

The runtime DDL corroborates the same representation and explicitly creates:

`CREATE UNIQUE INDEX IF NOT EXISTS commercial_activations_asset_unique ON commercial_activations(asset_id)`.

Charging authorization is persisted only as scalar `charging_authorized_at` / `charging_authorized_by` fields on the activation row, plus current Asset authorities/event history.

### Commercial activation worker

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

Confirmed implementation facts:

- `fingerprint(plan)` hashes only `JSON.stringify(plan)`;
- `createOrReuseCommercialActivation()` queries by Asset ID and immediately returns the existing row if present, without comparing incoming commercial authority identity;
- `updateCommercialOffer()` mutates price and price provenance in place on the same row before preparation lock;
- `merchantCapabilityVerified()` requires capability metadata with a non-empty `accountId` but returns only a boolean;
- the merchant `accountId` is not extracted and frozen into the activation or any Grant object;
- `authorizeCommercialBoundary(CUSTOMER_CHARGING)` sets the Asset-level `customerChargingAuthorized` boolean and activation `chargingAuthorizedAt` / `chargingAuthorizedBy`, then records an event;
- later charging eligibility checks consume the mutable Asset boolean plus activation timestamp.

`chargingAuthorizedBy` is the human authorizer identity, not merchant-account identity.

## 3. F05-01 — canonical immutable Offer Version is not represented

**Classification:** `REPRESENTABILITY_DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION`  
**Final adjudication:** CONFIRMED DEFECT.

The current `commercial_activations` row is a mutable workflow/runtime activation object, not an immutable R17 Offer Version.

Its `planSnapshot` is a Monetization Execution Plan rather than a frozen complete commercial-authority object, and `planFingerprint` hashes only that plan. The fingerprint therefore excludes materially governing dimensions stored elsewhere or not represented at all, including price/provenance, exact provider-account identity, exact checkout configuration, Grant identity, complete commercial terms, exact R10 Artifact/Release lineage, and supersession ancestry.

`updateCommercialOffer()` provides direct implementation evidence of the current model: price and provenance can be rewritten in place on the same commercial row. This is not separately counted because the row itself has not earned Offer-Version status.

### Mandatory remediation/acceptance scope

A corrected R17 representation must:

1. create an immutable Offer Version with stable identity/fingerprint over all materially governing commercial fields;
2. bind exact upstream R4/R9/R10/Product/Monetization lineage and exact provider/account identity;
3. freeze exact price/currency/terms/entitlements/promised outcome/checkout configuration;
4. preserve explicit predecessor/successor provenance;
5. define a freeze boundary after which material change creates `O2` rather than mutating `O1`;
6. keep mutable current pointers only as convenience state, never as historical authority.

## 4. F05-02 — one-row-per-Asset representation blocks successor Offer Versions

**Classification:** `REPRESENTABILITY_DEFECT / OFFER_VERSION_CARDINALITY`  
**Final adjudication:** CONFIRMED DEFECT.

R17 explicitly requires distinct historical/successor Offer Versions such as `O1` and `O2` to coexist for one Asset.

The current database affirmatively blocks that with `UNIQUE(asset_id)` on `commercial_activations`.

The application independently reinforces the same singleton assumption: `createOrReuseCommercialActivation()` returns the first row found for the Asset without verifying whether the incoming plan/provider/price/commercial authority matches that row.

Therefore dropping only the unique index is insufficient. Remediation must change both schema cardinality and application reuse/equality logic.

### Independence from F05-01

The remove-one-fix test is decisive:

- adding all missing Offer fields to the existing singleton row would still make `O1`/`O2` coexistence impossible;
- allowing N rows without adding canonical Offer identity would still leave N incomplete/non-authoritative workflow rows.

F05-01 and F05-02 are independently necessary fixes.

## 5. F05-03 — CUSTOMER_CHARGING Grant is not represented as immutable exact-offer authority

**Classification:** `REPRESENTABILITY_DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION`  
**Final adjudication:** CONFIRMED DEFECT.

R17 separates **what commercial object exists** from **which exact commercial object is authorized for execution**.

The current implementation represents customer-charging authority through mutable/current fields:

- `asset.authorities.customerChargingAuthorized`;
- `commercial_activations.chargingAuthorizedAt`;
- `commercial_activations.chargingAuthorizedBy`;
- event history.

No checked canonical object binds exact Offer Version, commercial fingerprint, provider/account, action scope, checkout/payment configuration, issuance provenance, status/lifecycle, and revocation/supersession history.

### 5.1 Provider-account scope is concretely lost

Merchant capability verification requires a current `metadata.accountId`, but the worker only turns that into a boolean gate. The account identity is not persisted into charging authority.

Therefore the system can know that *some current account for the provider is verified* without preserving which exact account the historical charging authority was granted for.

This violates R17's `DI-1/COMMERCIAL_PAYMENT` representability requirement.

### 5.2 Concrete independence from F05-01 — O1 authority laundering into O2

F05-03 remains independently defective even if F05-01 were fixed perfectly.

Concrete scenario:

1. immutable Offer Version `O1` exists for Asset A;
2. a human grants CUSTOMER_CHARGING for `O1`;
3. the current implementation records that grant partly as `asset.authorities.customerChargingAuthorized = true`;
4. later a materially different immutable successor `O2` is created for the same Asset;
5. the Asset-level boolean remains `true` because it is not bound to `O1`;
6. absent a real exact-offer Grant check, `O2` can inherit a prior Asset-level authority signal issued for `O1`.

That is an authority-laundering path: a valid Offer Version model alone does not bind execution authority to the Offer for which it was actually issued.

Therefore F05-03 is not a restatement of F05-01.

### 5.3 Repository-wide negative search

After adversarial review, targeted repository-wide searches on the default branch for `grant` and Offer/customer-charging-grant terminology returned no code/file matches.

This is supporting evidence, not sole proof: an equivalent object could theoretically exist under unrelated terminology. But combined with the full commercial worker/schema trace and the absence of any field path providing the required exact Grant composition, the DEFECT classification is earned.

### Mandatory remediation/acceptance scope

A compliant Grant model must at minimum:

1. assign immutable Grant identity;
2. bind one exact Offer Version/fingerprint;
3. bind exact provider and provider-account identity;
4. bind exact allowed commercial operation/action scope and checkout/payment configuration;
5. preserve issuer/provenance and issuance time;
6. preserve active/revoked/superseded lifecycle as monotonic history;
7. prevent a later Offer Version from inheriting an earlier Offer's Grant by Asset-level current state;
8. allow R19/R20 to reference the exact Grant consumed historically/currently.

## 6. No separate defect for mutable price fields

`updateCommercialOffer()` in-place mutation is direct evidence for F05-01, not a fourth independent defect.

Because the existing row is not a valid Offer Version, splitting every mutable field into its own representability finding would double-count the same missing immutable object model.

## 7. F05-04 — historical commercial-authority retention durability unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Final adjudication:** CONFIRMED UNRESOLVED.

Concrete current mechanisms include:

- commercial activations cascading with Asset deletion;
- commercial activation events cascading with activation/Asset deletion;
- payment-provider events cascading with activation/Asset deletion;
- upstream lineage references elsewhere that can be severed/nullified.

Those mechanisms can erase evidence R17 requires for historical offers, grants, customer contracts, provider/account attribution, renewals, disputes, refunds/reversals, R19 lineage, and R20 decisions.

But the governing hard-delete/archive/retention policy is still not established. Therefore neither PASS nor normative retention DEFECT is earned.

Resolution requires explicit proof of allowed hard-delete/archive behavior and required retention duration/addressability for Offer Versions, Grants, revocations/supersessions, contracts/transactions, provider events, and upstream lineage.

## 8. Phase-D attack disposition

- **D-C1 — current-pointer overwrite:** FAIL; current Asset/activation authority stands in for immutable Offer/Grant history.
- **D-C2 — same-parent deduplication:** FAIL; Asset-only reuse collapses materially distinct potential Offer authorities.
- **D-C3 — decision/model collision:** not the governing R17 failure class.
- **D-C4 — mixed-chain reconstruction:** FAIL; R10 artifact/release, commercial terms, provider account, and Grant authority are not one exact traversable R17 segment.
- **D-C5 — legitimate coexistence mistaken for conflict:** FAIL; O1/O2 coexistence is structurally blocked.
- **D-C6 — creation-time inheritance contamination:** FAIL; current Asset/provider/account authority can contaminate successor commercial identity/eligibility when exact Offer/Grant bindings are absent.

## 9. Arbitrary-N checklist — final R17 disposition

1. **Exact authority/history key?** No canonical Offer Version or Grant key — **FAIL / F05-01 / F05-03**.
2. **Repeatable parent scopes?** One activation per Asset blocks successor offers — **FAIL / F05-02**.
3. **Uniqueness constraints?** `UNIQUE(asset_id)` conflicts directly with O1/O2 coexistence — **FAIL / F05-02**.
4. **N children under one parent?** Multiple historical Offer Versions for one Asset cannot coexist — **FAIL / F05-02**.
5. **Historical and current coexist?** Mutable current activation/authority exists; immutable Offer/Grant history does not — **FAIL / F05-01 / F05-02 / F05-03**.
6. **Multiple in-flight histories?** Singleton activation blocks independent concurrent/superseding Offer authorities — **FAIL / F05-02**.
7. **Exact downstream reference without mutable pointer?** R19/R20 cannot reference a canonical Offer/Grant because neither exists — **FAIL / F05-01 / F05-03**.
8. **Restart/replay reconstructs same N-object graph?** Singleton reuse and mutable authority fields cannot reconstruct arbitrary-N Offer/Grant history — **FAIL / F05-01 / F05-02 / F05-03**.
9. **Retention/archive/delete durability?** Concrete cascades exist; governing policy unresolved — **UNRESOLVED / F05-04**.

## 10. F7 carry-forward

This batch does not certify F7.

F7 must later prove exact N×N integrity for at least:

- R10 Artifact Version/Release ↔ exact R17 Offer Version;
- exact R17 Offer Version ↔ exact CUSTOMER_CHARGING Grant;
- R17 Offer/Grant ↔ R19 commercial lineage;
- R17 Offer/Grant ↔ R20 boundary decision;
- concurrent O1/O2 plus P1/P2 histories without cross-wiring;
- exact provider/account identity across Offer, Grant, checkout/payment execution, and R19/R20 consumers.

F05-01/F05-02/F05-03 block F7 until corrected and re-certified.

## 11. Final adjudication

**R17 Phase-F result: FAIL / OPEN DEFECTS.**

- F05-01 — CONFIRMED `REPRESENTABILITY_DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION`;
- F05-02 — CONFIRMED `REPRESENTABILITY_DEFECT / OFFER_VERSION_CARDINALITY`;
- F05-03 — CONFIRMED `REPRESENTABILITY_DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION`;
- F05-04 — CONFIRMED `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No new semantic MRC or semantic unresolved cross-node gap is created. These are implementation/schema representability findings under already-certified R17 semantics.

Implementation authority remains **SUSPENDED**.