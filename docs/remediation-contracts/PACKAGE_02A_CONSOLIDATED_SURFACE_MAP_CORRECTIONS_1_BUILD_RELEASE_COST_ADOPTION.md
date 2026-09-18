# Representation Package 02A — Consolidated Surface Map Corrections 1: Build/Release Cost Adoption

**Status:** CONSOLIDATION CORRECTION OVERLAY / FIFTH POSITIVE C2 ADOPTION FAMILY CONFIRMED / GENERIC-DEFERRAL SCAN COMPLETED  
**Controls over:** `PACKAGE_02A_CONSOLIDATED_SURFACE_ATTEMPT_ENVELOPE_MAP.md` where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

The consolidated surface map omitted one directly implemented authoritative adoption family under the generic S45 description:

> Asset economics / operations local accounting plus downstream telemetry/adoption calls; concrete external work mapped under telemetry or other source-specific attempts.

That wording was too generic.

Direct source review confirms a distinct fifth positively established C2 adoption family:

`BUILD_RELEASE_COST_FACT_ADOPTION`

implemented by `recordActivationCosts(...)` in `asset-operations-worker.ts`.

This correction adds that surface explicitly and records a guard against future generic-deferral omissions.

## 2. Direct source

Verified live file:

`artifacts/api-server/src/lib/asset-operations-worker.ts`

Blob:

`43c62aa1e6a51898df12e87d3043ffb4bd7acd5a`

Functions:

- `recordActivationCosts(...)`
- `activateAssetsFromCompletedReleases(...)`
- `recordAssetObservation(...)`

## 3. Direct build-cost adoption

`recordActivationCosts(assetId, release)` loads the exact Build Job referenced by:

`release.buildJobId`.

If:

`build.externalSpendUsedCents > 0`

it calls:

`recordAssetObservation(...)`

with:

- `observationType = COST`;
- `source = BUILD_ACCOUNTING`;
- `provenance = FACT`;
- `amountCents = build.externalSpendUsedCents`;
- idempotency key containing exact Asset ID + Build Job ID;
- `externalReference = build_job:<exact build id>`;
- metadata containing exact `build_job_id`;
- observed time from exact Build Job finish/update time.

Therefore this is not generic telemetry.

It is adoption of already-recorded Build Job cost truth into authoritative Asset financial state.

## 4. Direct release-cost adoption

If:

`release.externalSpendUsedCents > 0`

the same function calls:

`recordAssetObservation(...)`

with:

- `observationType = COST`;
- `source = CONTROLLED_RELEASE`;
- `provenance = FACT`;
- `amountCents = release.externalSpendUsedCents`;
- idempotency key containing exact Asset ID + Release Job ID;
- `externalReference = release_job:<exact release id>`;
- metadata containing exact `release_job_id`;
- observed time from exact Release Job finish/update time.

Therefore:

`BUILD_COST_ADOPTION`

and:

`RELEASE_COST_ADOPTION`

are explicit source-specific financial-adoption paths.

## 5. Shared authoritative mutation mechanism

Previously verified `recordAssetObservation(...)` behavior is controlling.

For:

`provenance = FACT`

and:

`observationType = COST`

the function authoritatively increments:

`assets.totalObservedCostCents`.

Therefore:

`SOURCE_JOB_COST_TRUTH != ASSET_FINANCIAL_COST_ADOPTION`

The build/release job already records the execution's cost.

`recordActivationCosts(...)` later adopts that cost into the Asset's authoritative aggregate accounting.

## 6. C2 determination

This is a consequential financial-state adoption.

It is structurally distinct from:

- Builder repository-result adoption;
- payment financial adoption;
- telemetry FACT adoption;
- commercial activation-result adoption.

No new external provider call occurs inside `recordActivationCosts(...)`.

The consequence is the authoritative financial mutation itself.

Therefore:

`BUILD_RELEASE_COST_FACT_ADOPTION = C2_ADOPTION_BOUNDARY`

and:

`BUILD_RELEASE_COST_FACT_ADOPTION_ENVELOPE = REQUIRED`.

This becomes the **fifth positively established C2 adoption family** in Package 02A.

## 7. Caller / trigger

`activateAssetsFromCompletedReleases(...)` invokes `recordActivationCosts(...)` when:

### Existing Asset

A newer completed/public/healthy Release becomes the Asset's current Release.

After the Asset's release identity is updated and `ASSET_RELEASE_UPDATED` is recorded, the worker adopts the corresponding build/release costs.

### New Asset

A completed/public/healthy Release causes creation of the operating Asset.

After Asset creation, the worker adopts the corresponding build/release costs before recording the full Asset activation/lifecycle events.

Therefore cost adoption is tied to Asset activation/current-release progression, not to the original provider execution moment itself.

## 8. Predecessor/source identity — current positive evidence

The current cost observations do not use “latest Build” or “current Release” lookup as their sole provenance.

They carry exact source-row references:

- exact `build.id`;
- exact `release.id`;
- exact source-specific idempotency keys;
- exact externalReference values.

Therefore:

`CURRENT_COST_ADOPTION_SOURCE_JOB_IDENTITY = EXPLICIT`.

This is materially better than current/latest inference.

## 9. Exact-attempt lineage remains stricter than source-job identity

An exact Build Job or Release Job may itself aggregate cost from more than one consequential provider attempt.

Package 02A already establishes that:

- logical/container rows can contain multiple provider attempts;
- exact provider attempts require distinct envelopes;
- Release may contain separate preview and production dispatch attempts;
- Build-related orchestration may contain multiple provider execution attempts.

Therefore:

`SOURCE_JOB_IDENTITY != NECESSARILY_EXACT_CONTRIBUTING_ATTEMPT_SET`.

The corrected adoption representation must not assume that:

`build.externalSpendUsedCents`

or:

`release.externalSpendUsedCents`

is attributable to one envelope merely because it lives on one job row.

## 10. Required cost-provenance topology

For exact adoption lineage, the authoritative cost fact must be able to prove the exact contributing execution authority identity or exact bounded set.

Candidate topology:

`{E_cost_source_1 ... E_cost_source_N} → exact source cost evidence → E_asset_cost_adopt`

where:

- each contributing external execution remains separately identified;
- the source accounting object proves how its total was derived;
- the adoption envelope references the exact bounded source-cost evidence;
- no current/latest job or aggregate-only inference reconstructs historical provenance.

If one source job cost is provably generated by exactly one attempt, N may equal 1.

If cost is aggregated across multiple provider attempts, arbitrary-N provenance is required.

## 11. R7/R15/R16 relationship

The cost-adoption operation does not itself create the original spend.

The original provider attempts remain governed by their own R7 resource authority and R15/R16 evidence/reconciliation.

This adoption must not:

- create resource authority retroactively;
- convert unauthorized spend into authorized spend;
- overwrite original cost evidence;
- collapse multiple contributing attempts.

It records already-realized cost into Asset-level authoritative accounting.

Therefore:

`COST_ADOPTION != SPEND_AUTHORIZATION`

and:

`COST_ADOPTION != ORIGINAL_PROVIDER_ATTEMPT`.

## 12. Envelope topology

### Original provider attempt(s)

Each original consequential build/release provider attempt owns its own envelope.

### Source cost evidence

Exact execution/accounting evidence establishes cost and provenance.

### Asset cost adoption

A distinct adoption envelope:

`E_asset_cost_adopt`

governs the authoritative increment to:

`assets.totalObservedCostCents`.

The adoption must bind the exact source cost evidence and exact contributing attempt lineage where required.

## 13. Duplicate-envelope controls

### D2 — observation/attempt

Do not create a second provider-execution envelope merely because the cost is later observed/adopted.

### D3 — execution/adoption

Do create a distinct adoption envelope because authoritative Asset financial state is being mutated.

### D8 — aggregate-cost lineage collapse

New control:

If one Build/Release aggregate cost contains contributions from multiple exact provider attempts, the adoption may not bind only a generic job row and imply one-attempt provenance.

Required:

`ARBITRARY_N_COST_CONTRIBUTOR_LINEAGE`.

## 14. Attack fixtures

### COST-A1 — current/latest source substitution

Asset cost adoption uses the Asset's current Build/Release rather than the exact source row whose cost is being adopted.

Must fail.

### COST-A2 — aggregate job treated as one attempt

Build Job total includes multiple provider attempts but adoption binds one envelope inferred from the job.

Must fail.

### COST-A3 — release preview/production collapse

Release cost includes distinct preview and production provider attempts but authoritative Asset cost cannot prove exact contributing set.

Must fail if both materially contributed.

### COST-A4 — adoption duplicates original attempt

System creates a new “build execution” envelope for cost recording instead of a separate adoption envelope referencing the original execution envelope(s).

Must fail.

### COST-A5 — unauthorized spend laundering

Original provider cost lacked valid R7 authority. Later Asset FACT adoption treats the spend as authorized because it was recorded.

Must fail. Preserve cost truth; do not retroactively grant authority.

### COST-A6 — duplicate Asset cost adoption

`recordActivationCosts(...)` runs more than once for the same exact Build/Release and double-increments Asset total cost.

Current source-specific idempotency keys are evidence against this, but corrected representation must preserve it.

### COST-A7 — source-row-only lineage overclaim

Exact Build/Release ID is preserved, but exact provider-attempt contributor set is unrecoverable.

System claims exact attempt lineage anyway.

Must fail assurance; preserve source-row truth and classify attempt-level lineage conservatively.

## 15. Consolidated map correction — add S46

Add:

### S46 — Build/Release cost FACT adoption

**Source:** `asset-operations-worker.ts::recordActivationCosts(...)`  
**Caller:** `activateAssetsFromCompletedReleases(...)`  
**Source truth:** exact Build Job / Release Job external-spend accounting  
**Authoritative mutation:** `recordAssetObservation(COST, FACT)` → increments `assets.totalObservedCostCents`  
**C1:** adoption itself is local; original spend belongs to source provider attempts  
**C2:** YES — authoritative financial-state adoption  
**Exact source-row identity:** PRESENT  
**Exact contributing attempt-set lineage:** must be proven; arbitrary-N where aggregate cost spans multiple attempts  
**Envelope:** distinct adoption envelope

Disposition:

`BUILD_RELEASE_COST_FACT_ADOPTION = M1_C2_ADOPTION_ATTEMPT`

## 16. Section 6 M1-family correction

Add one distinct semantic family:

`Build/Release cost FACT adoption`.

The semantic-family list increases by one.

This does not imply a final closed denominator because the final negative-coverage sweep has not yet completed.

## 17. Section 12 C2-family correction

Replace the prior four-family positive list with five positively established C2 adoption families:

1. Builder repository finalization/adoption;
2. payment financial FACT adoption;
3. telemetry FACT adoption;
4. commercial activation-result adoption;
5. Build/Release cost FACT adoption.

Transition-specific/unresolved families remain unchanged:

- WATCH lifecycle reactivation;
- Autonomous Resolution lifecycle outcomes;
- experiment evidence/Validation reassessment;
- disabled-checkout preparation-result adoption.

## 18. S45 correction

S45 remains an M2 local-control/accounting wrapper, but its generic deferral is narrowed.

Replace the concept:

> concrete external work mapped under telemetry or other source-specific attempts

with explicit children:

- telemetry collection/adoption → S29–S31;
- Build/Release cost FACT adoption → S46;
- any additional source-specific child discovered by final negative coverage must receive its own numbered surface before coverage may close.

No unnamed “other source-specific attempts” bucket may count as completed coverage.

## 19. Generic-deferral scan

The consolidated map was scanned for generic phrases including:

- downstream;
- source-specific;
- mapped under;
- other source;
- existing mapping;
- wrapper;
- local control;
- adoption calls.

Result:

### Problematic deferral

S45 contained the only identified generic deferral that concealed a concrete, unnamed adoption family.

### Other generic references

Other occurrences point to already-explicit surfaces or express structural rules, including:

- Builder Workspace → Builder Gateway;
- generic execution_jobs → downstream exact attempts;
- Research/Validation wrappers → named collectors/provider calls;
- WATCH trigger → named fresh Research mapping;
- reconciliation wrappers → concrete downstream actions if they dispatch.

No second unnamed adoption family was identified from the consolidation-text deferral scan.

This does **not** substitute for the required final repository-wide negative coverage sweep.

## 20. recordAssetObservation caller inventory

Within the directly reviewed current worker surfaces, non-definition callers of `recordAssetObservation(...)` group into:

1. Build/Release cost adoption in `asset-operations-worker.ts`;
2. telemetry observation + unauthorized telemetry-cost adoption in `asset-economics-worker.ts`;
3. payment success/reversal adoption in `commercial-activation-worker.ts`.

Items 2 and 3 were already first-class in the consolidated map.

Item 1 was the missing family corrected here.

## 21. Methodological correction

A consolidation may not claim coverage through an unnamed generic bucket.

New rule:

`GENERIC_DOWNSTREAM_DEFERRAL != COVERAGE`

For every statement equivalent to:

- “mapped downstream”;
- “other source-specific attempt”;
- “handled elsewhere”;

the consolidation must identify the exact numbered surface(s) or retain an explicit unresolved coverage item.

This rule should be applied during the final negative sweep.

## 22. Disposition

`CONSOLIDATED_MAP_OMISSION_CONFIRMED = YES`

`MISSING_SURFACE = BUILD_RELEASE_COST_FACT_ADOPTION`

`S46_REQUIRED = YES`

`BUILD_RELEASE_COST_FACT_ADOPTION_C2 = YES`

`CURRENT_SOURCE_JOB_IDENTITY = EXPLICIT`

`EXACT_CONTRIBUTING_ATTEMPT_SET = MUST_BE_PROVEN / ARBITRARY_N_WHERE_REQUIRED`

`POSITIVE_C2_ADOPTION_FAMILIES = 5`

`GENERIC_DOWNSTREAM_DEFERRAL != COVERAGE`

`SECOND_HIDDEN_FAMILY_FROM_DEFERRAL_SCAN = NOT_FOUND`

`FINAL_REPOSITORY_NEGATIVE_COVERAGE_SWEEP = STILL_REQUIRED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
