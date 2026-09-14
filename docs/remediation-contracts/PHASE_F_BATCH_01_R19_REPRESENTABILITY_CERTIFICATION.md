# Phase F Batch 01 — R19 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F5 — R19 Commercial Authority Lineage References  
**Implementation authority:** SUSPENDED

## 1. Final disposition

R19 does **not** pass current representability review.

Confirmed dispositions:

1. **F01-01 — `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`**
2. **F01-02 — `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION`**
3. **F01-03 — application-layer singleton reuse is an explicit remediation-scope requirement attached to F01-01/F01-02, not a separately counted primary defect**
4. **F01-04 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`**

No implementation or remediation is authorized by this certification.

## 2. Evidence basis

### R19 recovered contract

Blob: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`

R19 explicitly requires:

- a named immutable **Commercial Authority Lineage Reference** or equivalent canonical object;
- a composite fingerprint over the exact historical authority composition;
- exact Opportunity / Evaluation Cycle / Bet / Product authority;
- exact R9 Build Source Snapshot / Build identity;
- exact R10 Artifact Version / production Release/deployment;
- exact R17 Offer Version and `CUSTOMER_CHARGING` Grant;
- exact provider and provider-account identity;
- checkout/payment configuration and customer-contract/subscription/order identity;
- commercial session/execution-attempt identity where applicable;
- exact R8 execution identity where dispatched;
- transaction/charge/payment identity;
- downstream R15/R16 financial linkage;
- freezing before consequential dispatch;
- arbitrary-N historical/commercial-lineage coexistence for one Asset;
- removal/replacement of known M14 `commercial_activations_asset_unique`.

### Declarative schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

The current `commercial_activations` table includes `asset_id`, `opportunity_id`, `plan_snapshot`, `plan_fingerprint`, provider/price/checkout/authorization fields and imposes:

`commercial_activations_asset_unique` on `asset_id`.

### Effective runtime migration

`lib/db/src/asset-runtime-migrations.ts`  
Blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

Migration V3 explicitly creates:

`CREATE UNIQUE INDEX IF NOT EXISTS commercial_activations_asset_unique ON commercial_activations(asset_id);`

The declarative and effective representations agree on this cardinality constraint.

### Application behavior

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

`createOrReuseCommercialActivation` looks up by `assetId` and immediately returns the existing row when one exists. It does not compare incoming authority/plan identity to the stored activation before reuse.

### Persisted planning artifact

`artifacts/api-server/src/lib/monetization-execution-plan.ts`  
Blob: `0a7edb1df8e1c090c8b446501329f3161c9677a2`

`MonetizationExecutionPlan` is a forward-looking planning/decision-criteria object. It contains commercial test, pricing, distribution, budget, decision and autonomy fields, but not the frozen historical R19 authority chain required by the contract.

## 3. F01-01 — one-Asset uniqueness is a confirmed cardinality defect

**Classification:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`

The current database permits only one `commercial_activations` row per Asset because both declarative schema and runtime migration impose `UNIQUE(asset_id)`.

R19 explicitly identifies this exact shape as M14 and requires arbitrary-N distinct historical lineages for one Asset.

Therefore:

- L1 may occupy the sole activation row for Asset A;
- a distinct legitimate L2 cannot coexist as a second activation row for A;
- arbitrary L1...LN is structurally impossible;
- the schema fails the R19 arbitrary-N requirement directly.

This finding is database-enforced and independently confirmed by application singleton behavior.

### Required remediation scope

Removing `commercial_activations_asset_unique` alone is insufficient.

`createOrReuseCommercialActivation` must also stop treating Asset identity alone as sufficient reuse identity. Remediation must ensure that a distinct incoming commercial authority/lineage is either persisted as its own lineage/activation object or rejected by an explicit governed equality rule. Returning a prior activation solely because the Asset matches is not acceptable.

Acceptance must therefore test both:

1. database cardinality permits arbitrary-N legitimate lineages under one Asset; and
2. application creation/reuse logic cannot silently collapse a distinct incoming lineage onto a prior row.

## 4. F01-02 — required lineage identity is independently unrepresentable

**Classification:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION`

F01-02 is independent of F01-01.

Even if the one-Asset unique index were removed, the current row does not carry the immutable R19 authority composition.

The current representation lacks a first-class canonical object/reference binding, at minimum:

- exact Evaluation Cycle;
- exact Bet/Product authority;
- R9 Build Source Snapshot / Build identity;
- R10 Artifact Version / production Release identity;
- exact R17 Offer Version and `CUSTOMER_CHARGING` Grant;
- exact provider-account identity;
- exact commercial session/execution-attempt identity;
- R8 external execution identity where applicable;
- customer contract/subscription/order identity;
- exact transaction identity;
- R15/R16 evidence/reconciliation linkage.

`plan_snapshot` and `plan_fingerprint` do not satisfy this requirement. The declared `MonetizationExecutionPlan` is a planning artifact describing what to test, what counts as success/failure, pricing/distribution assumptions, budget and autonomy gates. It is categorically different from a frozen historical authority-lineage object.

A query-time reconstruction through Asset/current state would also violate R19's `Association is not authority` and `Current-state reconstruction is prohibited` rules.

## 5. F01-03 — singleton reuse behavior is remediation-critical application evidence

**Disposition:** not a separately counted primary representability defect; mandatory remediation scope for F01-01/F01-02.

Current application logic:

1. queries `commercial_activations` by Asset ID;
2. returns the first existing activation immediately;
3. does not compare incoming plan/fingerprint/authority identity to the existing row before reuse;
4. on conflict, again resolves by Asset ID.

This independently preserves the singleton assumption even if the database uniqueness constraint were removed.

It directly exercises:

- F-D2 same-parent deduplication;
- F-D5 legitimate coexistence mistaken for singleton state;
- F-D6 creation-time inheritance contamination.

Remediation must therefore address both schema cardinality and application reuse semantics together.

## 6. Mutability follow-up — no third defect established, but immutability must be an acceptance requirement

Adversarial review raised whether `plan_snapshot` / `plan_fingerprint` might be mutated after creation.

The authoritative commercial-activation worker reviewed here writes those fields at activation creation. Its subsequent update paths shown in the same worker mutate status, offer price/provenance, authorization, checkout, provider/runtime and lifecycle fields, not `planSnapshot` or `planFingerprint`; `updateCommercialOffer` explicitly records that the price/provenance update occurs without changing the Monetization Execution Plan.

Therefore no third current defect is established on the basis of an observed post-creation mutation path.

However, the database schema does not itself make those columns immutable, and in any case those columns are the wrong object for R19 lineage.

The eventual R19 replacement must therefore include an explicit immutability acceptance requirement:

- the frozen Commercial Authority Lineage Reference is bound before consequential dispatch;
- once bound, its authority-composition identity cannot be mutated in place;
- later successor/renewal/reversal/remediation activity creates new governed history or relationship metadata rather than rewriting the frozen prior lineage;
- fixtures must prove no post-bind mutation of the exact lineage identity.

This is an acceptance/remediation requirement, not a separately counted F01 defect.

## 7. F01-04 — retention durability remains unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

Current schema/migration uses cascading deletion for R19-adjacent history, including commercial activations/events/provider events through Asset/activation parents.

This creates a real possibility that historical authority/evidence can disappear if a parent is hard-deleted.

But Refinement 1 requires `UNRESOLVED` rather than `DEFECT` where delete behavior exists and the governing parent-retention/deletion policy has not been established.

This certification has not established whether:

- Assets/activations are prohibited from hard deletion for the required retention window;
- archival is status-only versus physical deletion;
- manual/admin deletion paths are fenced;
- backups or partitions remain authoritative replay sources after row deletion.

Required follow-up remains:

1. locate Asset/commercial-activation deletion/archive policy and code paths;
2. determine governing retention duration from contract/governance;
3. prove required R19 lineage remains authoritatively addressable throughout that duration;
4. upgrade to `REPRESENTABILITY_DEFECT / HISTORICAL_RETENTION_DURABILITY` if hard deletion can remove required lineage.

## 8. Arbitrary-N checklist — final R19 disposition

1. Exact authority/history key: activation ID exists, but no proven canonical R19 Lineage Reference/fingerprint. **FAIL / DEFECT.**
2. Repeatable parent scopes: R19 permits many lineages under one Asset; current schema permits one activation. **FAIL / DEFECT.**
3. Uniqueness constraints: `commercial_activations_asset_unique` directly conflicts with M14/N-case. **FAIL / DEFECT.**
4. N children under one parent: structurally impossible. **FAIL / DEFECT.**
5. Historical and current coexistence: not as distinct R19 lineage/activation rows under one Asset. **FAIL / DEFECT.**
6. Multiple in-flight objects: not as multiple commercial activations under one Asset. **FAIL / DEFECT.**
7. Exact downstream child reference without mutable current state: event/activation IDs exist, but complete R19 lineage identity does not. **FAIL / DEFECT for complete lineage.**
8. Restart/replay reconstruct same N graph: N graph cannot be persisted under current model. **FAIL / DEFECT.**
9. Retention/archive/delete durability: cascades exist; governing deletion/retention policy not established. **UNRESOLVED.**

## 9. Phase-D schema attacks — final R19 result

- F-D1 current-pointer/singleton overwrite: FAIL.
- F-D2 same-parent deduplication: FAIL; application explicitly reuses by Asset.
- F-D3 decision-model collision: deferred to R20/F7.
- F-D4 mixed-chain reconstruction: FAIL because complete frozen R19 lineage is absent.
- F-D5 legitimate coexistence mistaken for singleton/conflict: FAIL.
- F-D6 creation-time inheritance contamination: FAIL; reuse-by-Asset can return prior authority object.

## 10. F7 implications

This certification does not certify F7.

It establishes that the R19 side is currently defective for at least these mandatory cross-surface relationships:

- R17 Offer Version/Grant ↔ R19 Lineage Reference;
- R19 Lineage Reference ↔ R20 Boundary Decision;
- R19 ↔ R15/R16 exact financial lineage correspondence.

F7 must still be independently audited after/internal to the wider Phase-F sweep because repairing R19's internal representation would not itself prove N×N reference integrity.

## 11. Final Batch-01 result

**R19 current representability: FAIL / OPEN DEFECTS.**

Canonical findings:

- **F01-01:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`
- **F01-02:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION`
- **F01-04:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

Mandatory remediation/acceptance carry-forwards:

- schema cardinality and application reuse-by-Asset must be remediated together;
- a real immutable Commercial Authority Lineage Reference/composite identity must replace plan-level approximation;
- the replacement lineage identity must be frozen before dispatch and non-mutable in place afterward;
- retention/delete durability must be resolved before Phase F can close.

No new semantic MRC or unresolved cross-node semantic gap is created by this Phase-F batch. These are representability/storage findings under the already-established R19 semantics.

Implementation authority remains **SUSPENDED**.