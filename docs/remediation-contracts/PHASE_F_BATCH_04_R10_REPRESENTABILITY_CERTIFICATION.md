# Phase F Batch 04 — R10 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / BATCH 04 CERTIFIED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F2 — R10 Artifact Versions / Release Identity  
**Implementation authority:** SUSPENDED

## 1. Certification result

R10 **FAILS Phase-F representability certification**.

Confirmed findings:

1. **F04-01 — `REPRESENTABILITY_DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION`** — CONFIRMED.
2. **F04-02 — `REPRESENTABILITY_DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING`** — CONFIRMED.
3. **F04-03 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`** — CONFIRMED UNRESOLVED.

No separate same-Build Release cardinality defect is opened. No separate Asset-adoption identity defect is opened. Those surfaces remain mandatory remediation/acceptance consequences of F04-01/F04-02 unless later evidence establishes an independent representation failure that should be counted separately.

The adversarial review independently traced the complete QA→Release path and confirmed that exact QA artifact identity is not merely dropped after being read: **`qa.commitSha` is never consumed by Release creation at all**. The review also identified and this certification independently verified that the Release adapter interface itself has no exact artifact identity field, making the defect architectural across the Release boundary rather than local to one worker call site.

## 2. Pinned evidence basis

### R10 governing contract

`docs/remediation-contracts/WI-R10.md`  
Blob: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

R10 requires the exact artifact that is built, QA-verified, released, deployed, and adopted to remain one provable immutable lineage.

The canonical Artifact Version / Verified Artifact Identity must be capable of binding, where applicable:

- exact Build identity;
- exact R9 Build Source Snapshot/source authority;
- immutable artifact identity;
- package/image/bundle/runtime digest where distinct from source;
- Product Definition / Architecture lineage;
- exact QA verification linkage;
- exact Release linkage;
- exact production deployment/adoption linkage;
- timestamps and provenance.

The recovered contract also freezes deterministic Artifact Version creation identity as:

`build:{buildJobId}:artifact:{exactResultCommitSha}`

and requires Release Job recovery/creation to derive from the exact qualifying QA-bound Artifact Version rather than latest/current Build or repository state.

### Build / QA schema

`lib/db/src/schema/build.ts`  
Blob: `4be2cbcbbbbf5dee91d71cc1f8dcda56ad7dde88`

Current persistence includes:

- `build_jobs.resultCommitSha`;
- `builder_workspaces.resultCommitSha`;
- `qa_runs.commitSha` bound to individual QA rounds;
- multiple QA rounds under `(buildJobId, roundNumber)`.

No canonical Artifact Version table/object is declared.

### QA worker

`artifacts/api-server/src/lib/qa-debug-worker.ts`  
Blob: `a862926547ddfffaf3b93bdfa4bcb24055e61cd1`

`missingArtifactDefects()` requires repository URL, branch name, and **exact commit SHA** for independently inspectable QA.

`createNextQaRound()` persists:

- Build identity;
- QA round identity;
- repository URL;
- branch name;
- `commitSha: workspace.resultCommitSha ?? job.resultCommitSha`;
- acceptance criteria.

Therefore the QA layer does possess an exact immutable source-linked artifact anchor at the QA-round boundary.

### Release schema

`lib/db/src/schema/release.ts`  
Blob: `a08ece6b75f32ef15ec6a1019bc6b2c50cacf078`

`PersistedReleasePlan.artifact` contains only:

- `repositoryUrl`;
- `branchName`.

`release_jobs` contains Build/Workspace/Opportunity/Evaluation references, provider-run IDs, URLs, health state, authority timestamps, and lifecycle fields, but no:

- Artifact Version ID;
- QA Run ID as authoritative lineage;
- QA-bound commit SHA;
- immutable deployment/package digest;
- expected-vs-observed artifact identity pair.

`release_jobs_build_job_unique = UNIQUE(build_job_id)` exists, but is not independently classified as a cardinality defect in this batch because the reviewed Release lifecycle is designed as one progressive preview→production flow per Build, and no legitimate same-Build multi-Release requirement was established independently of the missing Artifact Version model.

### Effective Release migration

`lib/db/src/release-runtime-migrations.ts`  
Blob: `0fb5ba5f5235b5e3db82e5e5e64887fa043b35ca`

The effective runtime DDL corroborates the declarative Release representation, including one Release Job per Build and the absence of a canonical Artifact Version / exact QA-artifact foreign key.

### Controlled Release worker

`artifacts/api-server/src/lib/controlled-release-worker.ts`  
Blob: `a4e8c8d61c179f11ffa92ad3e37c9f75523e8b73`

`ensureReleaseJobsForQaPassedBuilds()`:

1. selects COMPLETE Build jobs;
2. skips Builds already having a Release Job;
3. selects the latest QA row where `buildJobId = build.id` and `status = PASSED`, ordered by descending `roundNumber`;
4. loads the Builder Workspace;
5. constructs `PersistedReleasePlan.artifact` entirely from `workspace.repositoryUrl` and `workspace.branchName`;
6. creates the Release Job;
7. stores only `qa_run_id` in event metadata.

The adversarial reviewer independently checked every use of the selected `qa` row in this function. `qa.commitSha` is never read into a variable, never copied into the Release Job/plan, and never propagated to dispatch.

`dispatchStage()` sends the Release adapter:

- release/build/opportunity IDs;
- stage;
- target kind;
- idempotency key;
- `job.plan.artifact.repositoryUrl`;
- `job.plan.artifact.branchName`;
- the Release plan.

No exact QA-bound commit or Artifact Version identity is sent.

### Release adapter interface

`artifacts/api-server/src/lib/release-agent-adapter.ts`  
Blob: `77d1905eee90ba0a1e062630932fb00a002d3d5d`

`ReleaseDispatchInput` itself contains:

- Release Job ID;
- Build Job ID;
- Opportunity ID;
- stage;
- target kind;
- idempotency key;
- repository URL;
- branch name;
- `PersistedReleasePlan`.

It has no commit SHA, Artifact Version ID, artifact digest, image/package identity, or equivalent immutable artifact field.

The HTTP adapter serializes the same representation to the provider as `repository_url`, `branch_name`, and `release_plan` plus control metadata. Therefore even a future caller using the current adapter contract cannot pass an exact immutable artifact identity through this boundary.

### Asset schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

Assets retain:

- `activationReleaseJobId`;
- `currentReleaseJobId`;
- `buildJobId`;
- repository URL / branch name;
- production URL / provider.

These are useful navigation/current-state fields, but no canonical production Artifact Version/deployment identity is persisted. This is treated as an acceptance consequence of F04-01 rather than a separately counted defect in this batch.

Maintenance/remediation paths likewise construct Release plans from repository URL + branch rather than an immutable Artifact Version.

## 3. F04-01 — canonical Artifact Version identity is not represented

**Classification:** `REPRESENTABILITY_DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION`  
**Final adjudication:** CONFIRMED DEFECT.

The current implementation contains pieces of artifact identity but no canonical/equivalent R10 Artifact Version object that binds the full immutable lineage.

Existing facts are fragmented across:

- Build result commit fields;
- QA round commit fields;
- Release Job rows;
- provider run IDs and URLs;
- Asset current/activation Release pointers;
- event metadata.

No durable object provides the required identity composition or the deterministic Artifact Version key:

`build:{buildJobId}:artifact:{exactResultCommitSha}`.

Consequences include:

- no durable Artifact Version ID for downstream exact reference;
- no authoritative QA→Artifact→Release chain;
- no exact immutable preview/production artifact identity or transformation lineage;
- no exact expected-vs-observed production artifact comparison representation;
- no exact Artifact Version adoption/rollback target at Asset level;
- no deterministic/idempotent Artifact Version recovery object after a crash between durable Build result and artifact-identity materialization.

These are facets of one missing canonical identity model and are not separately double-counted here.

### 3.1 Why Build/Workspace commit fields are insufficient

`build_jobs.resultCommitSha` and `builder_workspaces.resultCommitSha` identify source-linked Build output but do not themselves create the R10 lineage object connecting exact source authority, QA, Release, deployment, and adoption.

R10 explicitly permits convenience/current pointers to remain, but they cannot substitute for immutable completed-event authority.

### 3.2 Asset adoption is a required remediation consequence

A corrected R10 representation must ensure an Asset can answer which exact immutable production artifact/deployment was authorized and observed, including rollback to an exact historical Artifact Version.

The present `currentReleaseJobId`/`activationReleaseJobId` model does not earn an independent finding because its insufficiency follows from the absent Artifact Version object. Remediation must nevertheless extend through Asset adoption and maintenance/replacement paths.

## 4. F04-02 — QA→Release exact-artifact binding is broken

**Classification:** `REPRESENTABILITY_DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING`  
**Final adjudication:** CONFIRMED DEFECT.

This defect is independent of F04-01.

QA already persists an exact tested commit SHA. Release therefore has a concrete exact-artifact value available upstream.

But Release creation does not consume it.

The confirmed path is:

1. QA Round Q1 is created with exact `commitSha = P1`.
2. Q1 reaches `PASSED`.
3. Release creation queries for the latest passing QA row.
4. The selected QA row is used only as evidence that a pass exists and for its ID in event metadata.
5. `qa.commitSha` is never read or persisted into the Release Job/plan.
6. Release instead constructs `artifact = { repositoryUrl, branchName }` from the Builder Workspace.
7. `dispatchStage()` passes only those mutable repository/branch values plus the plan.
8. The `ReleaseAgentAdapter` interface has no field through which an exact Artifact Version, commit SHA, or digest could be supplied even if a caller wanted to do so.

Thus the currently declared Release boundary cannot prove that the artifact released is the artifact QA tested.

A passing QA result for P1 can therefore not be represented as authorizing only P1 at Release; the Release interface is capable only of instructing the provider using mutable repository/branch context.

### 4.1 Independence from F04-01

The remediation actions are independently necessary:

- adding a canonical Artifact Version table/object alone does not fix Release if `ensureReleaseJobsForQaPassedBuilds()`, `PersistedReleasePlan`, `dispatchStage()`, and `ReleaseDispatchInput` continue to ignore that identity;
- propagating a commit SHA through Release alone would not supply the complete canonical Artifact Version / crash-recovery / deployment/adoption model required by F04-01.

Therefore F04-01 and F04-02 are distinct defects.

### 4.2 Mandatory remediation scope

F04-02 cannot close by changing only one worker call site.

A compliant correction must at minimum ensure:

1. Release Job creation binds the exact qualifying QA result and exact Artifact Version;
2. the persisted Release plan/job carries authoritative exact-artifact identity rather than mutable branch context as authority;
3. `ReleaseDispatchInput` and every concrete Release adapter/provider payload carry the exact artifact identity required by the artifact type;
4. Preview result is attributable to that exact artifact;
5. Production either promotes that exact verified artifact or records a separately immutable derived artifact plus governed transformation/verification lineage;
6. Release recovery derives from the exact qualifying QA-bound Artifact Version, not latest Build/current branch state;
7. retries/restarts cannot change artifact identity while reusing prior QA authority.

Mutable repository URL/branch may remain as location/provenance convenience fields but cannot remain the authoritative artifact selector.

## 5. Release Job cardinality — no separate finding

`release_jobs_build_job_unique` and the worker's `if (existing) continue` behavior intentionally produce one Release Job lifecycle per Build.

The reviewed flow progresses one row through preview, authority gating, production, and completion.

No independent evidence in this batch established a legitimate requirement for multiple simultaneous Release Jobs for the same exact Build/Artifact Version. A materially different rebuilt artifact ordinarily implies a different Build/artifact identity.

Accordingly, the unique constraint is relevant supporting evidence about the current model but does not independently establish an R10 arbitrary-N defect.

The corrected canonical Artifact Version model must still support arbitrary-N distinct artifacts/releases across legitimate histories, successor Builds, rebuilds, transformations, and rollbacks without collapsing them into current pointers.

## 6. F04-03 — historical retention durability unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Final adjudication:** CONFIRMED UNRESOLVED.

Concrete persistence risks exist:

- Release Jobs cascade with Build/Workspace parents;
- Release Events cascade with Release Job/Build parents;
- Evaluation Cycle links may be severed by `ON DELETE SET NULL`;
- Asset and remediation histories contain their own parent-owned/cascade relationships.

Those mechanisms could delete or sever historical artifact/release/adoption evidence that a corrected R10 lineage would require.

But the governing hard-delete/archive/retention policy remains unestablished. Therefore neither PASS nor normative retention DEFECT is earned.

Resolution requires explicit proof of:

1. whether Build, Workspace, Release, QA, Asset, and Evaluation Cycle hard deletion is permitted;
2. the governed retention period for Artifact Versions, QA results, Release/deployment records, rollback targets, and legacy reconstruction evidence;
3. whether parent deletion/nulling can destroy or sever exact lineage required by retained Artifact Versions;
4. whether archive/partition/cleanup behavior preserves exact historical addressability for the required period.

## 7. Phase-D attack disposition

- **D-C1 — current-pointer overwrite:** FAIL at the Artifact/adoption model level; exact historical Artifact Version authority is absent and current Release pointers exist.
- **D-C2 — same-parent deduplication:** no independent same-Build multi-Release defect established; do not double-count.
- **D-C3 — decision/model collision:** not the governing R10 failure class.
- **D-C4 — mixed-chain reconstruction:** FAIL; exact Build/QA/Release/deployment/adoption lineage is fragmented and QA exact identity is not propagated to Release.
- **D-C5 — legitimate coexistence mistaken for conflict:** arbitrary-N exact artifact histories are not canonically represented; no separate uniqueness finding opened here.
- **D-C6 — creation-time inheritance contamination:** FAIL risk at Release selection because mutable branch context is used instead of the exact QA-bound artifact identity.

## 8. Arbitrary-N checklist — final R10 disposition

1. **Exact authority/history key?** No canonical Artifact Version key/object — **FAIL / F04-01**.
2. **Repeatable parent scopes?** Build/QA rows can repeat in places, but canonical Artifact Version histories are absent — **FAIL / F04-01**.
3. **Uniqueness constraints?** One Release Job per Build exists, but no independent same-Build multiplicity requirement was established — **supporting evidence, no separate finding**.
4. **N children under one parent?** N exact Artifact Versions/releases under all legitimate histories are not canonically represented — **FAIL / F04-01**.
5. **Historical and current coexist?** Current pointers exist; exact immutable artifact/adoption history does not — **FAIL / F04-01**.
6. **Multiple in-flight histories?** QA rounds can coexist, but Release does not consume exact artifact identity — **FAIL / F04-02**.
7. **Exact downstream reference without mutable pointer?** QA has exact commit; Release/Asset do not preserve it as governing identity — **FAIL / F04-02 / F04-01**.
8. **Restart/replay reconstructs same N-object graph?** No deterministic canonical Artifact Version object exists and Release recovery is not keyed to exact QA-bound Artifact Version — **FAIL / F04-01 / F04-02**.
9. **Retention/archive/delete durability?** Governing policy unresolved — **UNRESOLVED / F04-03**.

## 9. F7 carry-forward

This batch does not certify F7.

F7 must later prove at minimum:

- exact R9 Build Source Snapshot ↔ exact R10 Artifact Version;
- exact R10 Artifact Version ↔ exact QA result;
- exact QA-bound Artifact Version ↔ exact Release Job;
- exact Release/production artifact ↔ R17 Offer/Grant authority;
- exact R10 production artifact/release ↔ R19 commercial lineage;
- exact R10 lineage ↔ R20 boundary decisions;
- no concurrent P1/P2 or successor/rebuild history can cross-wire through Build ID, branch, current Release pointer, same Asset, or latest-passing-QA shortcuts.

F04-01 and F04-02 remain live blockers for those F7 joins.

## 10. Final adjudication

The adversarial reviewer independently traced the complete QA→Release path and confirmed:

- QA persists exact `commitSha`;
- Release creation selects a passing QA row but never reads `qa.commitSha`;
- the Release plan is built from separate Workspace repository/branch state;
- dispatch propagates only repository URL + branch plus the plan;
- no hidden exact-artifact identity is available to the adapter through that path;
- same-Build Release cardinality and Asset adoption are correctly not inflated into separate findings on the current evidence;
- retention remains correctly unresolved.

Independent post-review verification additionally confirmed that `ReleaseDispatchInput` itself lacks any exact artifact identity field and the HTTP adapter does not transmit one. That finding strengthens F04-02 and expands its mandatory remediation scope through the adapter interface/provider payload, without creating a third defect.

### Certified Phase-F Batch 04 register

| Finding | Final class | Final state |
|---|---|---|
| F04-01 | `REPRESENTABILITY_DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION` | OPEN / CONFIRMED |
| F04-02 | `REPRESENTABILITY_DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING` | OPEN / CONFIRMED |
| F04-03 | `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` | OPEN / UNRESOLVED |

**Batch 04 result: FAIL / OPEN.**

R10 is now Phase-F certified at the specification/representation audit level. This does not restore implementation authority.
