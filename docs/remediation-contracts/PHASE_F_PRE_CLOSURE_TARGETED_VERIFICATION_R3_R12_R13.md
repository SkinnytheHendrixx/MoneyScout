# Phase F — Pre-Closure Targeted Verification: R3 / R12 / R13

**Status:** REVIEWED / RECORDED / PRE-CLOSURE VERIFICATION COMPLETE  
**Phase:** F — Representability and Multiplicity Sweep  
**Purpose:** close the evidentiary asymmetry identified during synthesis review for F07-14 and F07-15  
**Implementation authority:** SUSPENDED

## 1. Trigger and scope

The Phase-F synthesis review identified that R3, R12, and R13 participate in confirmed F7 findings but did not receive standalone F1–F6 surface audits comparable to R9/R10/R17/R18/R19/R20. R15 had presented the same asymmetry during F7 Batch 04 and was directly checked before F07-16/F07-17 were finalized.

This targeted pass applies the same discipline without creating extra endpoint findings or retroactively expanding the six mandatory Phase-F individual surfaces.

Questions:

1. Does current persistence provide a canonical R3 freshness/current-applicability result capable of exact F07-15 reference?
2. Does current R12 occurrence persistence carry an exact R13 executor/service-path health-result reference?
3. Does current persistence provide the R13 Executor Expectation Registry / path-specific canonical health result required for F07-14?
4. Does effective runtime DDL materially differ from declarative schema on these points?

## 2. Pinned evidence

### R3 contract

`docs/remediation-contracts/WI-R3.md`

R3 is marked `Implementation: NOT STARTED` and requires distinct temporal/freshness meanings including:

- `collected_at`;
- `source_published_at`;
- `source_updated_at`;
- `temporal_knowledge`;
- `freshness_evaluated_at`;
- `freshness_policy`;
- `freshness_status`;
- `temporal_basis`.

It supplies exact current-freshness predicates to R20 rather than one reusable global freshness bit.

### Current evidence persistence

`lib/db/src/schema/money-scout.ts`  
Blob: `f7065f9360109c0bffdd16f1097b5bca3b4a9ce2`

The current `evidence` table declares:

- `id`;
- `claim`;
- `sourceUrl`;
- `sourceTitle`;
- `observedDate`;
- `classification`;
- `opportunityId`;
- `evaluationDimension`;
- `researchRunId`.

It does not declare the R3 source-publication/update, temporal-knowledge, freshness-policy/version/status/evaluation-time, temporal-basis, or decision-use-result identity needed to represent an exact reusable R3 freshness result.

### R12 contract and execution substrate

`docs/remediation-contracts/WI-R12.md`

R12 is marked `Implementation: NOT STARTED` at the recovered-contract level and identifies the Execution Kernel as the canonical durable runnable-occurrence substrate. R12 and R13 remain separate: durable runnable work is not executor health.

`lib/db/src/schema/execution.ts`  
Blob: `8003dcf68cedfd4ba0981030cdaf4f1d7aae603e`

`execution_jobs` does provide a meaningful durable occurrence/job substrate with identity, action, idempotency, due/available time, lease, status, attempts, result, and lifecycle timestamps.

However, the declared row contains no canonical field/reference for:

- an exact R13 health-result identity;
- an exact executor identity;
- an exact service-path identity;
- an exact Executor Expectation Registry member;
- occurrence→path→health correspondence.

`parentJobId` is generic parent/child job structure and does not establish the required R12↔R13 health association.

This same table also corroborates the previously certified F07-13 current-representation observation: it has no declared exact R2 Capability Resolution Outcome/version field and no canonical R7 reservation-set/resource-vector reference.

### R13 contract

`docs/remediation-contracts/WI-R13.md`

R13 is marked `Implementation: NOT STARTED` and requires, among other things:

- a durable Executor Expectation Registry or equivalent;
- exact executor/service-path expectation identity;
- durable heartbeat/tick/progress/failure evidence;
- path-specific health rather than generic supervisor/kernel health;
- canonical health semantics including STARTING/HEALTHY/DEGRADED/STALLED/FAILED/INTENTIONALLY_DISABLED/UNKNOWN.

### Current lifecycle/health persistence

`lib/db/src/schema/lifecycle.ts`  
Blob: `d0f432ec1ad4e7338aba2f11848af2fe41f42894`

The relevant current surfaces are:

- `opportunity_runtime_state`: one current activity projection per Opportunity;
- `lifecycle_events`: generic Opportunity/cycle events;
- `portfolio_heartbeat_runs`: portfolio-level run status and aggregate counts.

These do not declare:

- an Executor Expectation Registry;
- exact executor identity;
- exact service-path identity;
- a canonical per-path R13 health-result object;
- occurrence→path-health reference identity.

A portfolio heartbeat or current Opportunity activity projection therefore cannot serve as the exact path-specific R13 object required by F07-14 merely because it is health-adjacent.

### Effective runtime migration

`lib/db/src/runtime-migrations.ts`  
Blob: `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`

The effective runtime table inventory includes evaluation cycles, watches, current Opportunity runtime state, lifecycle events, portfolio heartbeat runs, capabilities, human actions, execution jobs/events, and build jobs.

Its DDL corroborates the declarative structures above and does not create a hidden R3 freshness-result table, R13 Executor Expectation Registry, path-specific health-result table, or exact occurrence→health relationship.

### Schema inventory control

`lib/db/src/schema/index.ts`  
Blob: `d034ad2ef8681b14efee5f7f281ca1a4bc9f1463`

The exported schema-module inventory contains `money-scout`, `discovery`, `lifecycle`, `human-actions`, `execution`, `bet`, `factory`, `build`, `release`, `asset`, `runtime`, and `auth`. No separate obvious R3/R12/R13 schema module is hidden outside the surfaces checked above.

## 3. F07-15 targeted adjudication — R3 freshness result ↔ R20 decision

**Disposition unchanged: CONFIRMED `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`.**

The current R3 side is not merely under-documented. The canonical `evidence` representation affirmatively lacks the temporal/freshness vocabulary required to persist an exact policy-relative freshness result with the identity needed by R20.

R20 F02-01 independently proves the decision side lacks a canonical Boundary Decision object. Therefore exact `FR1 ↔ D1`, `FR2 ↔ D2` reference capacity is affirmatively absent on both relevant current surfaces.

No downgrade to `REPRESENTABILITY_UNRESOLVED` is warranted.

## 4. F07-14 targeted adjudication — R12 occurrence ↔ R13 path-health result

**Disposition unchanged: CONFIRMED `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`.**

Current `execution_jobs` can represent durable runnable occurrences, which is useful positive evidence for the R12 side. But no exact R13 path-health reference is declared on the occurrence.

The current lifecycle/runtime schema supplies only current/aggregate heartbeat-style surfaces and no canonical R13 Executor Expectation Registry or exact path-specific health-result object. Thus the required `O1 ↔ X/HX`, `O2 ↔ Y/HY` graph is affirmatively not representable through a declared canonical reference model today.

No downgrade to `REPRESENTABILITY_UNRESOLVED` is warranted.

## 5. F07-13 reinforcing check

The same direct `execution_jobs` inspection corroborates—but does not newly adjudicate—F07-13. There is no declared exact R2 outcome/version reference or R7 reservation-set/resource-vector reference in the generic execution row.

F07-13 remains governed by its existing F7 Batch-04 certification. No new endpoint finding is opened here.

## 6. Scope discipline

This targeted pass does not:

- create standalone Phase-F endpoint findings for R3, R12, or R13;
- alter the six mandatory F1–F6 surface count;
- change the Phase-F arithmetic;
- claim a full repository-wide implementation audit of R3/R12/R13;
- restore implementation authority.

It closes only the specific pre-synthesis evidentiary question: whether the current declared/effective persistence surfaces could materially weaken F07-14 or F07-15 from DEFECT to UNRESOLVED.

They do not.

## 7. Final result

**PRE-CLOSURE TARGETED VERIFICATION COMPLETE.**

- F07-14 remains DEFECT with direct R12/R13 schema evidence.
- F07-15 remains DEFECT with direct R3 schema evidence.
- F07-13 receives reinforcing direct execution-schema evidence only.
- no new finding is opened;
- no existing finding is weakened, withdrawn, or reclassified.

Implementation authority remains **SUSPENDED**.
