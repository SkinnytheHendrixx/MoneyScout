# Phase F Batch 01 — R19 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F5 — R19 Commercial Authority Lineage References  
**Batch order:** First substantive Phase-F surface audit / positive control  
**Implementation authority:** SUSPENDED

## 1. Governing method

This batch applies:

- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN.md`;
- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`;
- Phase-D coexistence semantics as a fixed input, not a question to re-litigate.

The batch distinguishes:

- database-enforced representation;
- application-enforced behavior;
- contract-required representation;
- retention/delete durability whose governing policy remains unresolved.

## 2. Evidence basis and pinned artifacts

### Recovered R19 contract

- R19 blob: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`

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
- R8 execution identity where dispatched;
- transaction/charge/payment identity;
- downstream R15/R16 financial linkage;
- freezing before consequential dispatch;
- arbitrary-N historical/commercial-lineage coexistence for one Asset;
- removal/replacement of known M14 `commercial_activations_asset_unique`.

### Declarative schema

- `lib/db/src/schema/asset.ts`
- blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

Relevant current representation:

- `commercial_activations.id` primary key;
- `asset_id`, `opportunity_id`;
- `plan_snapshot`, `plan_fingerprint`;
- provider, price, checkout reference, provider operation key, charging/credential authorization timestamps;
- `commercial_activations_asset_unique` = unique on `asset_id`;
- activation/event/payment rows cascade on parent deletion.

### Effective runtime migration

- `lib/db/src/asset-runtime-migrations.ts`
- blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

Migration V3 explicitly creates:

`CREATE UNIQUE INDEX IF NOT EXISTS commercial_activations_asset_unique ON commercial_activations(asset_id);`

It also creates commercial activation/event/provider-event foreign keys with `ON DELETE CASCADE` from Asset/activation parents.

### Application behavior

- `artifacts/api-server/src/lib/commercial-activation-worker.ts`
- blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

`createOrReuseCommercialActivation`:

1. queries `commercial_activations` by `assetId`;
2. if any row exists, returns it immediately as `{ created: false }`;
3. does not compare the incoming plan/fingerprint/Offer-equivalent authority against the existing row before reuse;
4. inserts only when no activation exists for the Asset;
5. on conflict, again selects by Asset ID.

### Persisted plan type

- `artifacts/api-server/src/lib/monetization-execution-plan.ts`
- blob: `0a7edb1df8e1c090c8b446501329f3161c9677a2`

`MonetizationExecutionPlan` contains commercial planning data and `opportunityId`, but does not itself carry the exact R19 authority chain: Evaluation Cycle, Bet, R9 snapshot/build identity, R10 artifact/release, R17 immutable Offer Version/Grant, provider-account identity, execution/session/transaction identity, or R15/R16 linkage.

## 3. Finding F01-01 — one-Asset uniqueness prevents arbitrary-N commercial lineage

**Classification:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`

This is a confirmed defect, not an unresolved question.

R19 explicitly requires arbitrary-N commercial lineages for one Asset and explicitly names `commercial_activations_asset_unique` as known migration M14 that must be removed/replaced.

The current declarative schema and effective runtime migration both retain exactly that unique index on `asset_id`.

Therefore, for one Asset A:

- L1 may occupy the one `commercial_activations` row;
- a distinct legitimate L2 cannot be represented as a second activation row for A;
- arbitrary L1...LN is structurally impossible;
- current schema fails Phase-D coexistence when realized at the R19 storage layer.

This is database-enforced, not merely application-enforced.

### Required negative fixture

1. Create Asset A.
2. Persist activation/lineage intent L1 for A.
3. Attempt to persist distinct legitimate L2 for A with different Offer/Grant/session/execution identity.
4. Prove current schema rejects a second row through `commercial_activations_asset_unique`.
5. Generalize to N>2: the structural ceiling remains one activation row per Asset.

Expected current result: FAIL.

## 4. Finding F01-02 — required Commercial Authority Lineage Reference is not representable

**Classification:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION`

The current `commercial_activations` representation is not merely too narrow in cardinality; it also lacks the required immutable authority composition.

R19 requires a frozen Commercial Authority Lineage Reference/composite fingerprint binding the exact historical path. The current row has no first-class fields or referenced canonical object for, at minimum:

- exact Evaluation Cycle;
- exact Bet/Product authority;
- R9 Build Source Snapshot / Build identity;
- R10 Artifact Version / production Release identity;
- exact R17 Offer Version and `CUSTOMER_CHARGING` Grant;
- exact provider-account identity;
- exact commercial session/execution-attempt identity;
- R8 external execution identity;
- customer contract/subscription/order identity;
- exact transaction identity;
- R15/R16 evidence/reconciliation linkage.

`plan_snapshot` does not cure this. Its declared `MonetizationExecutionPlan` shape contains planning data and `opportunityId`, not the frozen R19 authority composition. `plan_fingerprint` is therefore a hash of the monetization plan, not demonstrated to be the R19 composite authority fingerprint.

A query-time join through Asset/current state would also be insufficient under R19's explicit `Association is not authority` and `Current-state reconstruction is prohibited` rules.

### Required negative fixture

Construct two historically distinct authority chains with the same Asset and Opportunity but different Evaluation Cycle / Artifact / Offer / provider-account / execution identities.

Attempt to persist an immutable, independently addressable R19 Lineage Reference for each using the current schema.

Expected current result: FAIL even before considering the one-Asset uniqueness index, because no canonical R19 lineage object/reference capable of binding those required exact dimensions exists in the checked schema.

## 5. Finding F01-03 — application code reinforces one-current-activation semantics and permits authority reuse by Asset

**Classification:** supporting implementation evidence for F01-01/F01-02; not counted as a separate primary representability defect unless adversarial review establishes an independent failure class.

`createOrReuseCommercialActivation` performs:

`SELECT ... WHERE commercialActivationsTable.assetId = input.asset.id`

and immediately returns the first existing activation if present.

It does not first prove that the incoming plan/fingerprint/authority identity equals the existing activation's frozen authority.

This means the application layer independently embodies the one-Asset assumption:

- a new legitimate commercial authority for the same Asset is not created;
- the caller can receive the old activation object instead;
- distinct intended authority may be silently routed to the prior row merely because the Asset matches.

This directly exercises:

- F-D2 same-parent deduplication;
- F-D5 legitimate coexistence mistaken for conflict/singleton state;
- F-D6 creation-time inheritance contamination.

The database defect alone already prevents arbitrary-N representation. The application behavior demonstrates that removing the unique index without redesigning creation/correlation logic would still be insufficient remediation.

## 6. Finding F01-04 — historical retention durability is unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

The current schema and migration use cascading deletion for R19-adjacent history:

- `commercial_activations.asset_id → assets.id ON DELETE CASCADE`;
- commercial activation events cascade from activation/Asset;
- payment provider events cascade from activation/Asset.

Thus deleting an Asset or activation can delete historical commercial evidence/authority rows.

However, Refinement 1 requires this to be classified `UNRESOLVED` rather than automatically `DEFECT` when delete behavior exists but the governing parent-retention/deletion policy cannot be established.

This batch has not established whether:

- Assets/activations are prohibited from hard deletion for the required historical-retention window;
- archival means status-only preservation versus physical deletion;
- administrative/manual deletion paths are separately fenced;
- backups/partitions provide authoritative replay after row deletion.

Therefore historical retention durability is not proven and must remain open.

Required follow-up:

1. locate Asset/commercial-activation deletion/archive policies and code paths;
2. determine governing retention duration from recovered contract/governance;
3. prove required R19 lineage remains authoritatively addressable throughout that duration despite parent lifecycle operations;
4. if hard deletion can remove required lineage, upgrade to `REPRESENTABILITY_DEFECT / HISTORICAL_RETENTION_DURABILITY`.

## 7. Arbitrary-N checklist — R19 current disposition

1. **Exact authority/history key?** Current activation `id` exists, but no proven canonical R19 Lineage Reference/fingerprint key. **FAIL / DEFECT.**
2. **Repeatable parent scopes?** R19 permits many lineages under one Asset. Current schema enforces one activation per Asset. **FAIL / DEFECT.**
3. **Uniqueness constraints?** `commercial_activations_asset_unique` explicitly conflicts with R19 M14/N-case. **FAIL / DEFECT.**
4. **N children under one parent?** Structurally impossible. **FAIL / DEFECT.**
5. **Historical and current coexist?** Not as distinct activation/lineage rows for one Asset. **FAIL / DEFECT.**
6. **Multiple in-flight objects?** Not for multiple commercial activations under one Asset. **FAIL / DEFECT.**
7. **Downstream exact-child reference without current pointer?** Activation/event IDs exist, but complete R19 lineage identity does not. **FAIL / DEFECT for complete lineage.**
8. **Restart/replay reconstruct same N graph?** N graph cannot be persisted under current model. **FAIL / DEFECT.**
9. **Retention/archival/delete durability?** Cascades exist; governing deletion/retention policy not established. **UNRESOLVED.**

## 8. Phase-D schema attacks against R19

- **F-D1 current-pointer overwrite:** current model stores a singleton activation per Asset; distinct later lineage cannot coexist. FAIL.
- **F-D2 same-parent deduplication:** application explicitly reuses existing activation by Asset. FAIL.
- **F-D3 decision-model collision:** deferred to R20/F7; not owned by R19 table alone.
- **F-D4 mixed-chain reconstruction:** complete chain cannot be frozen in current R19 representation, so safe reconstruction is not proven. FAIL.
- **F-D5 legitimate coexistence mistaken for conflict:** one-Asset unique index prevents legitimate coexistence. FAIL.
- **F-D6 creation-time inheritance contamination:** create/reuse behavior can return prior activation solely because Asset matches. FAIL.

## 9. F7 implications carried forward

This batch does not certify F7. It establishes that the R19 side of several mandatory N×N relationships is already defective/unready:

- R17 Offer Version/Grant ↔ R19 Lineage Reference;
- R19 Lineage Reference ↔ R20 Boundary Decision;
- R19 ↔ R15/R16 financial lineage where exact commercial correspondence is required.

F7 must still be audited independently because later remediation of R19 internal representation would not automatically prove cross-surface reference integrity.

## 10. Provisional batch disposition

Provisional results:

- **F01-01:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`.
- **F01-02:** `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION`.
- **F01-03:** supporting implementation evidence; no separate primary count yet.
- **F01-04:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

This is not remediation. No schema or application code is changed by this audit result.

## 11. Requested adversarial review

1. Does `commercial_activations_asset_unique` conclusively establish F01-01 given R19's explicit M14/N-concurrent requirement?
2. Is F01-02 genuinely independent of F01-01 — i.e. even if the unique index disappeared, does the current row/plan representation still fail to carry the required immutable R19 lineage composition?
3. Could `plan_snapshot`/`plan_fingerprint` legitimately count as the R19 Lineage Reference despite the declared `MonetizationExecutionPlan` lacking the required exact lineage dimensions? Identify any concrete field/path if so.
4. Does `createOrReuseCommercialActivation` merely optimize around the DB constraint, or does its immediate reuse-by-Asset behavior add a meaningful F-D6 authority-inheritance risk that remediation must address independently?
5. Is retention correctly `REPRESENTABILITY_UNRESOLVED` rather than DEFECT given confirmed cascade behavior but no established parent hard-delete/retention policy?
6. Are any of the nine arbitrary-N answers overstated or understated?
7. Does application-enforced-only behavior matter differently anywhere on this surface, or are the decisive failures already database-enforced?
8. Find any additional R19 representability failure supported by current schema/migration/application evidence that is not reducible to cardinality, missing lineage identity, or unresolved retention.

## 12. Calibration

Do not inflate one root defect into multiple findings merely because it manifests in schema, migration, and application code. Conversely, do not collapse F01-02 into F01-01 if removing the unique index would still leave the required R19 authority composition unrepresentable.

The review should distinguish **cardinality**, **identity-content representation**, **cross-surface reference integrity**, and **retention durability** as separate questions.