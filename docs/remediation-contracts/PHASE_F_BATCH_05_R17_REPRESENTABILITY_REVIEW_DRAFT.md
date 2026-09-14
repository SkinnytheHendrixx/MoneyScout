# Phase F Batch 05 — R17 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F3 — R17 Offer Versions / Customer-Charging Grants  
**Implementation authority:** SUSPENDED

## 1. Governing question

R17 requires commercial authority to attach to an exact immutable Offer Version and an exact CUSTOMER_CHARGING Grant, not to mutable Asset-level state or a single current commercial activation row.

This batch therefore tests separately:

- whether an immutable Offer Version object exists and binds the required commercial/artifact lineage;
- whether successor Offer Versions O1, O2, ... can coexist for one Asset;
- whether CUSTOMER_CHARGING authority is represented as an immutable exact-offer Grant with provider/account scope and monotonic lifecycle history;
- whether historical commercial authority remains addressable under deletion/archive behavior.

## 2. Pinned evidence basis

### R17 governing contract

`docs/remediation-contracts/WI-R17.md`  
Blob: `16a234e897fe6e119392707a7187a3232f0fd972`

R17 requires an Offer Version or equivalent immutable commercial-authority object capable of binding, where applicable:

- Offer Version identity;
- Asset / Opportunity / Bet / exact R4 Evaluation Cycle;
- Product Definition / Monetization Plan identity/version;
- exact R10 production Artifact Version and Release/deployment identity;
- provider and exact provider-account identity;
- currency, price/pricing model, provenance;
- promised outcome, billing terms, transaction terms, entitlements/access rights;
- checkout/payment configuration identity;
- immutable commercial fingerprint;
- creation, activation, supersession provenance.

Material commercial change must create successor O2 rather than mutate O1.

R17 separately requires a CUSTOMER_CHARGING Grant or equivalent to bind one exact Offer Version, exact provider/account scope, permitted action scope, grant provenance/status, and revocation/supersession history.

### Asset / commercial activation declarative schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

Current `commercial_activations` persistence contains:

- `assetId`, `opportunityId`;
- `planSnapshot`, `planFingerprint`;
- provider, currency, price, price provenance;
- checkout reference and provider-operation key;
- charging/production-credential authorization timestamps/actors;
- activation/status/lifecycle fields.

It does not contain a canonical Offer Version ID/fingerprint covering the actual commercial terms, exact Bet/Evaluation Cycle/Product/R10 Artifact/Release lineage, exact provider-account identity, billing/entitlement/transaction-term composition, or immutable checkout configuration identity.

The table is constrained by:

`commercial_activations_asset_unique = UNIQUE(asset_id)`.

`assets.authorities` contains mutable booleans including `customerChargingAuthorized`.

### Effective Asset/commercial migration

`lib/db/src/asset-runtime-migrations.ts`  
Blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

The effective runtime migration corroborates the same commercial-activation structure and explicitly creates:

`CREATE UNIQUE INDEX ... commercial_activations_asset_unique ON commercial_activations(asset_id)`.

It also persists charging authorization only as scalar `charging_authorized_at` / `charging_authorized_by` columns on the activation row.

### Commercial activation worker

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

`createOrReuseCommercialActivation()`:

1. queries by `assetId`;
2. if any row exists, returns that row immediately;
3. otherwise inserts one activation carrying a `MonetizationExecutionPlan` snapshot/fingerprint plus separate price/provider fields.

The fingerprint is computed from `JSON.stringify(plan)` only; price/provenance/provider/account/grant identity are not part of that plan fingerprint.

`updateCommercialOffer()` mutates `priceCents` and `priceProvenance` in place on the same activation row while status is `DRAFT` or `BLOCKED_PRICE`, rather than creating a successor immutable commercial object.

`authorizeCommercialBoundary()` for `CUSTOMER_CHARGING`:

- sets `asset.authorities.customerChargingAuthorized = true`;
- writes `chargingAuthorizedAt` / `chargingAuthorizedBy` onto the activation row;
- records an event.

The worker later checks both the mutable Asset boolean and the activation timestamp before charging activation may proceed.

Merchant capability verification reads `metadata.accountId`, but that exact account identity is not durably bound into the commercial activation or a charging Grant record.

## 3. F05-01 — canonical immutable Offer Version is not represented

**Classification:** `REPRESENTABILITY_DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION`  
**Provisional adjudication:** DEFECT.

The current `commercial_activations` row is a mutable workflow/runtime activation record, not an R17 Offer Version.

### 3.1 Categorical content mismatch

`planSnapshot` is a `MonetizationExecutionPlan`, which is a forward-looking execution/testing plan. The row then adds price/provider/checkout/runtime fields around it.

No checked object canonically binds the full R17 authority composition:

- exact Bet and Evaluation Cycle;
- exact Product Definition / commercial-product authority;
- exact R10 Artifact Version and Release/deployment;
- exact provider-account identity;
- billing cadence/terms;
- transaction/refund/cancellation terms where applicable;
- entitlements/access rights;
- promised customer-facing outcome as part of one immutable offer object;
- exact checkout/payment configuration identity;
- commercial terms fingerprint spanning all materially governing fields;
- explicit Offer supersession ancestry/provenance.

Some facts exist elsewhere, but R17 explicitly forbids reconstructing historical commercial authority from current mutable state.

### 3.2 In-place commercial mutation is concrete evidence

`updateCommercialOffer()` changes price and price provenance on the existing activation row.

This is not counted as a separate defect because the row is not a valid Offer Version in the first place. It is direct evidence that the current model treats commercial terms as mutable activation state rather than append-only Offer Versions.

A corrected model must define when an Offer Version becomes frozen and ensure every material post-freeze change creates a successor O2 instead of mutating O1.

### 3.3 Current fingerprint does not prove offer identity

`planFingerprint` hashes only the `MonetizationExecutionPlan` snapshot.

It therefore does not prove immutable equality of the actual commercial object because separate price/provenance/provider/account/checkout/grant dimensions are outside that fingerprint.

A matching plan fingerprint cannot establish that two customer-facing offers have the same governing commercial terms.

## 4. F05-02 — one-row-per-Asset structure blocks successor Offer Versions

**Classification:** `REPRESENTABILITY_DEFECT / OFFER_VERSION_CARDINALITY`  
**Provisional adjudication:** DEFECT.

This is independent of F05-01.

R17 explicitly requires:

- O1 and O2 to remain distinct when a material commercial change occurs;
- historical Offer Versions to coexist with a current successor;
- existing customers/contracts to remain attributable to O1 while O2 may govern new customers;
- mid-preparation supersession to preserve O1 historical truth while O2 receives its own authority.

The current database instead enforces one `commercial_activations` row per Asset through `UNIQUE(asset_id)`.

The application reinforces the same singleton model: `createOrReuseCommercialActivation()` queries only by Asset ID and immediately returns the first row, without comparing incoming plan/provider/price/authority identity to determine whether a new commercial authority should be created.

Therefore removing only the unique index would not close this defect; the reuse logic must also be redesigned so materially different authority cannot silently map back to the first activation.

### Independence from F05-01

- Adding all missing R17 fields to the current row would still leave O1/O2 impossible because of the one-row-per-Asset constraint/reuse behavior.
- Removing the constraint/reuse behavior would permit N rows but those rows would still lack the canonical R17 authority composition.

Both fixes are independently necessary.

## 5. F05-03 — CUSTOMER_CHARGING Grant is not represented as immutable exact-offer authority

**Classification:** `REPRESENTABILITY_DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION`  
**Provisional adjudication:** DEFECT.

R17 separates Offer Version identity from execution authority. Price provenance or a valid Offer Version does not itself authorize charging.

The current implementation represents charging authority through:

- mutable `asset.authorities.customerChargingAuthorized` boolean;
- scalar `commercial_activations.chargingAuthorizedAt`;
- scalar `commercial_activations.chargingAuthorizedBy`;
- append-style event text recording that authorization occurred.

No canonical Grant object/record binds:

- exact Offer Version identity and immutable commercial fingerprint;
- exact provider and provider-account identity;
- permitted commercial action scope;
- exact checkout/payment configuration identity;
- issuance provenance;
- status/lifecycle;
- revocation/supersession events/history.

### Provider-account scope is concretely lost

The worker verifies merchant capability only if capability metadata includes a non-empty `accountId`.

But that account ID is not copied/frozen into the activation authority or any Grant record before charging authority is consumed.

Thus the implementation can know which merchant account is currently verified without preserving which exact account the historical charging authority was granted for, contrary to `DI-1/COMMERCIAL_PAYMENT` and R17's exact provider/account scope.

### Why events do not rescue the Grant model

Commercial activation events can record that an authorization occurred, but untyped event metadata plus mutable Asset/activation fields are not equivalent to a declared immutable Grant identity with exact offer/provider/account/scope and monotonic revocation history.

A corrected implementation may retain convenience booleans, but they cannot remain the authority object.

## 6. No fourth defect for mutable price fields

The in-place `updateCommercialOffer()` behavior is serious but belongs under F05-01 on the current evidence.

Because the current activation row is not a canonical Offer Version, splitting every mutable field into a separate finding would double-count the same missing immutable commercial-authority model.

If later evidence establishes an independently persisted valid Offer Version that is then mutated in place, that would warrant a separate immutability defect. No such valid object exists today.

## 7. F05-04 — historical commercial-authority retention durability unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Provisional adjudication:** UNRESOLVED.

Concrete current behavior includes:

- `commercial_activations` cascading with Asset deletion;
- commercial activation events cascading with the activation/Asset;
- payment-provider events cascading with the activation/Asset;
- Evaluation Cycle and upstream lineage durability issues elsewhere in the graph.

These mechanisms can erase or sever evidence that R17 requires to remain historically attributable, including prior Offer/Grant authority and existing-customer governing terms.

However, the governing hard-delete/archive/retention policy remains unestablished. Therefore neither PASS nor a normative retention DEFECT is earned.

Resolution requires proof of:

1. whether Assets, commercial activations, Offer Versions, Grants, customer contracts, provider events, and upstream lineage may be hard-deleted;
2. required retention duration for Offer/Grant/revocation/supersession/customer-contract history;
3. preservation of exact Offer/provider-account/Artifact/Release/Evaluation lineage through archive/delete behavior;
4. survival of historical authority needed for existing customers, audits, disputes, renewals, refunds/reversals, R19 lineage, and R20 eligibility decisions.

## 8. Arbitrary-N checklist — provisional R17 disposition

1. **Exact authority/history key?** No canonical Offer Version or Grant identity — **FAIL / F05-01 / F05-03**.
2. **Repeatable parent scopes?** One activation row per Asset blocks successor offers — **FAIL / F05-02**.
3. **Uniqueness constraints?** `UNIQUE(asset_id)` directly conflicts with O1/O2 coexistence — **FAIL / F05-02**.
4. **N children under one parent?** Multiple historical Offer Versions for one Asset cannot coexist — **FAIL / F05-02**.
5. **Historical and current coexist?** Current activation state exists; immutable O1/O2/Grant histories do not — **FAIL / F05-01 / F05-02 / F05-03**.
6. **Multiple in-flight histories?** One Asset-level activation row prevents independent concurrent/superseding Offer authority — **FAIL / F05-02**.
7. **Exact downstream reference without mutable pointer?** R19/R20 cannot reference a canonical Offer Version/Grant because neither exists — **FAIL / F05-01 / F05-03**.
8. **Restart/replay reconstructs same N-object graph?** Singleton activation/reuse plus mutable authority fields cannot reconstruct arbitrary-N Offer/Grant history — **FAIL / F05-01 / F05-02 / F05-03**.
9. **Retention/archive/delete durability?** Cascades exist; governing policy unresolved — **UNRESOLVED / F05-04**.

## 9. Phase-D attack disposition

- **D-C1 current-pointer overwrite:** FAIL. Mutable Asset/activation authority stands in for historical Offer/Grant objects.
- **D-C2 same-parent deduplication:** FAIL. Asset-only reuse returns one activation for materially distinct possible Offer authorities.
- **D-C3 decision/model collision:** not the governing R17 failure class.
- **D-C4 mixed-chain reconstruction:** FAIL. R10 artifact/release, commercial terms, provider account, and grant authority are not frozen into one traversable R17 segment.
- **D-C5 legitimate coexistence mistaken for conflict:** FAIL. O1/O2 coexistence is structurally blocked.
- **D-C6 creation-time inheritance contamination:** FAIL risk. Later/current Asset/provider/account/commercial state can be consumed because exact historical Offer/Grant identity is absent.

## 10. F7 carry-forward

This batch does not certify F7.

F7 must later prove exact N×N integrity for at least:

- R10 Artifact Version / Release ↔ exact R17 Offer Version;
- exact R17 Offer Version ↔ exact CUSTOMER_CHARGING Grant;
- R17 Offer/Grant ↔ R19 commercial lineage;
- R17 Offer/Grant ↔ R20 boundary decision;
- concurrent O1/O2 plus P1/P2 lineages without cross-wiring;
- exact provider/account identity across Offer, Grant, checkout/payment execution, and R19/R20 consumers.

F05-01/F05-02/F05-03 therefore block F7 until corrected and re-certified.

## 11. Adversarial-review questions

The reviewer should independently verify at minimum:

1. Is `commercial_activations_asset_unique` present in both declarative schema and effective runtime migration?
2. Does `createOrReuseCommercialActivation()` really return the first Asset row without comparing incoming commercial authority identity?
3. Is F05-01 independent of F05-02 under the remove-one-fix counterfactual?
4. Does `planFingerprint` exclude price/provider/account/checkout/grant dimensions because it hashes only `MonetizationExecutionPlan`?
5. Does `updateCommercialOffer()` mutate price/provenance in place, and is keeping that under F05-01 correctly calibrated?
6. Does merchant verification require an `accountId`, and is that account identity actually absent from the persisted activation/Grant authority?
7. Does `authorizeCommercialBoundary(CUSTOMER_CHARGING)` persist only Asset boolean + activation timestamp/actor + event, or is there another canonical Grant representation elsewhere?
8. Are F05-01 and F05-03 independent? Specifically, would a valid immutable Offer Version still lack execution authority if the Grant representation remained unchanged?
9. Is retention correctly UNRESOLVED rather than DEFECT?
10. Independent scan: is there any existing immutable Offer/Grant/contract object or application-enforced invariant that materially changes these classifications?

## 12. Provisional verdict

**R17 provisional Phase-F result: FAIL / OPEN.**

Provisional findings:

- F05-01 — `REPRESENTABILITY_DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION`;
- F05-02 — `REPRESENTABILITY_DEFECT / OFFER_VERSION_CARDINALITY`;
- F05-03 — `REPRESENTABILITY_DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION`;
- F05-04 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No semantic MRC or semantic unresolved gap is opened by this draft. These are implementation/schema representability findings under already-certified R17 semantics.

This document remains non-authoritative until adversarial review and final adjudication.