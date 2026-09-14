# Phase F Batch 04 — R10 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F2 — R10 Artifact Versions / Release Identity  
**Implementation authority:** SUSPENDED

## 1. Governing question

R10 requires the exact artifact that is built, QA-verified, released, deployed, and adopted to remain one provable immutable lineage rather than a sequence of mutable current references.

This batch therefore distinguishes:

- Build result commit/source-linked output;
- canonical Artifact Version identity;
- QA's exact tested artifact;
- Release's exact consumed artifact;
- preview/production provider deployment identity;
- Asset adoption/current pointers.

The existence of an exact commit SHA at one stage does not prove that later stages consume that same artifact.

## 2. Pinned evidence basis

### R10 governing contract

`docs/remediation-contracts/WI-R10.md`  
Blob: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

R10 requires a durable Artifact Version / Verified Artifact Identity capable of proving, where applicable:

- exact Build identity;
- exact R9 source authority;
- immutable artifact identity;
- package/image/bundle/runtime digest where distinct from source;
- Product Definition / Architecture lineage;
- exact QA linkage;
- exact Release linkage;
- exact production deployment/adoption linkage;
- timestamps/provenance.

R10 also freezes a deterministic creation identity:

`build:{buildJobId}:artifact:{exactResultCommitSha}`

and requires qualifying Release Job creation to derive from the exact QA-bound Artifact Version, not latest/current Build state.

### Build / QA schema

`lib/db/src/schema/build.ts`  
Blob: `4be2cbcbbbbf5dee91d71cc1f8dcda56ad7dde88`

Relevant current fields:

- `build_jobs.resultCommitSha` — convenience/current Build result commit;
- `builder_workspaces.resultCommitSha`;
- `qa_runs.commitSha` — exact commit bound to an individual QA round;
- `qa_runs` permits multiple rounds under `(buildJobId, roundNumber)`.

No canonical Artifact Version table/object is declared in this schema.

### QA worker

`artifacts/api-server/src/lib/qa-debug-worker.ts`  
Blob: `a862926547ddfffaf3b93bdfa4bcb24055e61cd1`

`missingArtifactDefects()` explicitly treats repository URL + branch + exact commit SHA as required for independently inspectable QA.

`createNextQaRound()` persists:

- repository URL;
- branch name;
- `commitSha: workspace.resultCommitSha ?? job.resultCommitSha`;
- Build identity;
- round identity.

Thus QA has an exact immutable source-linked artifact anchor at the QA-round boundary.

### Release schema

`lib/db/src/schema/release.ts`  
Blob: `a08ece6b75f32ef15ec6a1019bc6b2c50cacf078`

`PersistedReleasePlan.artifact` contains only:

- `repositoryUrl`;
- `branchName`.

It has no exact commit SHA, Artifact Version ID/fingerprint/digest, QA Run ID, or exact QA-bound artifact identity.

`release_jobs` is constrained by `release_jobs_build_job_unique = UNIQUE(build_job_id)` and carries scalar preview/production provider run/result fields on one row.

### Effective Release runtime migration

`lib/db/src/release-runtime-migrations.ts`  
Blob: `0fb5ba5f5235b5e3db82e5e5e64887fa043b35ca`

The effective DDL corroborates the declarative schema: one Release Job per Build, JSON release plan, scalar preview/production state, no canonical Artifact Version foreign key or exact artifact commit/digest column.

### Controlled Release worker

`artifacts/api-server/src/lib/controlled-release-worker.ts`  
Blob: `a4e8c8d61c179f11ffa92ad3e37c9f75523e8b73`

`ensureReleaseJobsForQaPassedBuilds()`:

1. selects Build jobs with `status = COMPLETE`;
2. skips the Build if any Release Job already exists for that Build;
3. selects a `PASSED` QA row for that Build, ordered by descending QA round;
4. loads the Builder Workspace;
5. creates the Release plan's artifact reference using only `workspace.repositoryUrl` and `workspace.branchName`;
6. records `qa_run_id` only in append-only event metadata for `RELEASE_JOB_CREATED`, not as a declared authoritative Release Job/plan identity field.

When deployment runs, the Release adapter receives `job.plan.artifact.repositoryUrl` and `job.plan.artifact.branchName` — no exact QA-bound commit or Artifact Version identity is passed.

### Asset/adoption schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`assets` stores:

- `activationReleaseJobId`;
- mutable/convenience `currentReleaseJobId`;
- `buildJobId`;
- `productionUrl`;
- repository URL and branch name;
- release provider.

It does not store a canonical Artifact Version ID, exact production artifact commit/digest, expected-vs-observed artifact identity pair, or transformation lineage.

The schema permits `currentReleaseJobId` as a current pointer, which R10 explicitly allows only as non-authoritative convenience when immutable historical lineage exists elsewhere.

### Maintenance/remediation path

`artifacts/api-server/src/lib/asset-remediation-worker.ts`  
Blob: `d4bef756c3c7d05199db238d3e8bde4f323d97a3`

The maintenance release plan repeats the same artifact shape:

`{ repositoryUrl, branchName }`

The associated `asset_remediation_runs` schema carries provider/idempotency/QA result fields but no exact artifact commit/digest/Artifact Version ID. This is supporting evidence that the branch-based identity pattern persists beyond first release rather than being isolated to initial activation.

## 3. F04-01 — canonical Artifact Version identity is not represented

**Classification:** `REPRESENTABILITY_DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION`  
**Provisional adjudication:** DEFECT.

No checked canonical persistence object satisfies R10's Artifact Version contract.

The implementation has useful fragments:

- Build/job result commit;
- Workspace result commit;
- QA-round commit;
- Release job/provider-run fields;
- Asset release/build/current pointers.

But no immutable object binds those fragments into the exact historical artifact lineage R10 requires.

In particular, there is no declared object keyed deterministically by the confirmed identity form:

`build:{buildJobId}:artifact:{exactResultCommitSha}`

and no durable Artifact Version reference propagated through QA, Release, production, Asset adoption, rollback, and downstream commercial authority.

### Why current fields are not equivalent

`buildJobs.resultCommitSha` and `builderWorkspaces.resultCommitSha` are current/convenience Build-output fields. R10 explicitly permits convenience pointers but prohibits using them to rewrite historical event authority.

`qa_runs.commitSha` is stronger: it freezes the exact commit QA inspected for that QA round. But a QA-row commit is not itself the canonical Artifact Version because it does not carry the full Build/R9/materialization/release/deployment/adoption lineage and is not what downstream Release/Asset records reference as authority.

`release_jobs` and `assets` likewise carry operational/current state but no canonical immutable Artifact Version identity.

### Crash/recovery consequence

Because no Artifact Version object exists, the confirmed R10 creation-atomicity invariant cannot currently be represented or proven:

- Builder result becomes durable;
- process dies before artifact identity materialization;
- recovery converges on exactly one Artifact Version for `(buildJobId, exactResultCommitSha)`.

There is no such target object/key to converge on today.

## 4. F04-02 — QA exact artifact identity is dropped at the QA→Release boundary

**Classification:** `REPRESENTABILITY_DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING`  
**Provisional adjudication:** DEFECT.

This is independent of F04-01.

The current system demonstrates that it can preserve an exact QA-bound commit:

- QA round `Q1` stores `commitSha = P`.

But Release creation does not bind Release Job `L1` to `Q1` or `P` as authoritative identity. It selects a passing QA row, then creates a Release plan whose artifact is only:

- repository URL;
- branch name.

The Release adapter later receives those mutable values rather than the exact QA-bound commit.

Therefore the current representation cannot prove the R10 invariant:

`QA PASS for P -> Release consumes P`

rather than:

`QA PASS for P -> mutable branch later resolves to Q -> Release consumes Q`.

### Why `qa_run_id` event metadata does not cure this

`RELEASE_JOB_CREATED` event metadata includes `qa_run_id`, which is useful historical evidence.

It does not cure the defect because:

- the Release Job/plan does not declare that QA Run as its authoritative artifact source;
- the exact QA `commitSha` is not copied or referenced into the Release contract;
- the deployment adapter is invoked with repository URL + branch, not with the QA-bound commit/Artifact Version;
- no schema constraint/invariant forces Release execution to consume the artifact tested by that event's QA row.

Event metadata documenting why a row was created is not equivalent to an enforced execution-time identity binding.

### Independence from F04-01

The defects require distinct remediation properties:

- creating a canonical Artifact Version object without changing Release consumption would still permit a branch-based release to drift from the verified artifact;
- adding an exact commit/Artifact Version reference to Release consumption would improve QA→Release identity but would not by itself create the complete canonical artifact-history/adoption/crash-recovery model required by R10.

Therefore F04-02 is not merely evidence for F04-01.

## 5. Current-pointer / one-row evidence — supporting, not yet a separate cardinality finding

`release_jobs_build_job_unique = UNIQUE(build_job_id)` means one Release Job row currently summarizes preview and production for one Build.

`assets.currentReleaseJobId` is explicitly a mutable current pointer.

Those facts are relevant to Phase-D D-C1/D-C5 concerns, but this draft does not yet count a separate R10 cardinality defect because the canonical Artifact Version object itself is absent and the exact required multiplicity relationship among Artifact Versions, Release Jobs, retries, repairs, and successor Builds needs to be judged against the full R10 semantics rather than inferred from the proxy row alone.

Mandatory acceptance consequence of F04-01/F04-02:

- P1...PN Artifact Versions must coexist independently;
- each QA result must bind exactly one Artifact Version;
- each Release/preview/production event must bind the exact Artifact Version it consumes/produces;
- repairs/rebuilds must create successor Artifact Versions, never mutate prior artifact identity;
- current pointers may summarize, never substitute for historical lineage.

If adversarial review establishes that `UNIQUE(build_job_id)` independently forbids a required same-Build multi-release lineage even after a canonical Artifact Version is introduced, a separate cardinality finding may be warranted. None is claimed yet.

## 6. Asset adoption identity is currently insufficient, folded into F04-01

R10 requires an Asset to answer which exact Artifact Version was authorized, which exact artifact/deployment was observed in production, whether expected and observed identities match, and which R9/Evaluation lineage produced it.

Current `assets` persistence stores Release/Build pointers, production URL, repository URL, branch name, and provider, but not an exact immutable artifact/deployment identity or expected-vs-observed identity pair.

This is a downstream manifestation of the missing canonical Artifact Version model and is therefore folded into F04-01 rather than opened as a third primary defect in this draft.

The distinction is reviewable: if a reviewer can show Asset adoption has an independent canonical immutable deployment identity elsewhere, this subsection should be corrected without affecting F04-02.

## 7. Maintenance path confirms the same identity collapse

The autonomous maintenance/remediation path constructs a `PersistedReleasePlan` with artifact identity consisting only of repository URL + branch.

`asset_remediation_runs` records repair/QA/release provider-run state but no exact artifact commit/digest/Artifact Version ID.

This matters because R10 explicitly says repair creates a new Artifact Version and its own QA/release lineage. Current maintenance persistence does not represent that successor artifact identity canonically.

This is supporting evidence under F04-01/F04-02, not a new finding.

## 8. F04-03 — historical artifact/release retention durability is unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Provisional adjudication:** UNRESOLVED.

Concrete persistence behavior exists:

- `release_jobs` cascade from Build and Builder Workspace;
- `release_events` cascade with Release Job/Build;
- `release_jobs.evaluationCycleId` uses `ON DELETE SET NULL`;
- Asset current/activation Release Job references use `ON DELETE RESTRICT`, which protects those referenced rows while the Asset exists;
- Asset event/remediation histories cascade with Asset/Incident parents.

These mixed rules are not enough to establish the governed historical retention behavior R10 needs.

Required follow-up:

1. establish hard-delete/archive policy for Build, Workspace, Release Job, Asset, Evaluation Cycle, and future Artifact Version records;
2. establish required retention duration for Artifact Versions, QA evidence, Release/deployment evidence, rollback targets, and expected/observed identity mismatches;
3. prove parent deletion cannot sever exact historical artifact lineage;
4. prove archived/superseded artifact identities remain addressable for rollback/audit as required.

Until then, PASS and normative retention DEFECT are both unearned.

## 9. Arbitrary-N checklist — provisional R10 disposition

1. **Exact authority/history key?** No canonical Artifact Version key/object. **FAIL / F04-01.**
2. **Repeatable parent scopes?** QA rounds repeat, but Artifact Versions and exact Release bindings are not canonical. **FAIL / F04-01/F04-02.**
3. **Uniqueness constraints?** `release_jobs_build_job_unique` is a restrictive proxy constraint; whether it independently violates required canonical cardinality remains under review. **FAIL evidence, no separate finding yet.**
4. **N children under one parent?** QA rounds yes; N canonical Artifact Versions / exact Release lineages not represented. **FAIL / F04-01.**
5. **Historical and current coexist?** QA history can coexist, but Artifact Version / adoption history cannot be proven. **FAIL / F04-01.**
6. **Multiple in-flight histories?** Release is one row per Build; artifact-specific concurrent histories are not canonically represented. **FAIL evidence / review for cardinality.**
7. **Exact downstream reference without mutable current pointer?** QA→Release fails: Release uses repository URL + branch rather than exact QA artifact. **FAIL / F04-02.**
8. **Restart/replay reconstruct same N-object graph?** R10's deterministic Artifact Version creation target does not exist. **FAIL / F04-01.**
9. **Retention/archive/delete durability?** Governing policy unresolved. **UNRESOLVED / F04-03.**

## 10. Phase-D attack disposition

- **D-C1 current-pointer overwrite:** FAIL risk is concrete at Release/Asset proxy surfaces; exact artifact history is absent.
- **D-C2 same-parent deduplication:** under review; one Release Job per Build may or may not be independently over-restrictive after canonical Artifact Version semantics are applied.
- **D-C3 decision/model collision:** not the primary R10 class.
- **D-C4 mixed-chain reconstruction:** FAIL. Build/QA/Release/Asset identity lives across separate records without a canonical Artifact Version reference joining the exact chain.
- **D-C5 legitimate coexistence mistaken for conflict:** canonical multi-artifact coexistence is not represented.
- **D-C6 creation-time inheritance contamination:** FAIL at QA→Release: Release execution inherits mutable repository/branch context rather than consuming the exact QA-bound artifact identity.

## 11. F7 carry-forward

This batch does not certify F7.

Later F7 must prove at minimum:

- exact R9 source snapshot ↔ exact R10 Artifact Version;
- exact QA Run ↔ exact Artifact Version;
- exact Artifact Version ↔ exact Release Job / preview / production deployment;
- exact adopted Asset state ↔ exact production Artifact Version;
- R10 Artifact Version ↔ R17 Offer Version;
- concurrent P1/P2/... histories cannot cross-wire under shared Build/Asset/repository attributes.

## 12. Adversarial-review questions

Before final certification, independently test:

1. Does any schema/module not cited here implement a canonical Artifact Version / verified-artifact object equivalent to R10 §3 and §8.1?
2. Verify directly that `qa_runs.commitSha` is frozen per QA round and that Release creation does not persist that exact commit as an authoritative Release field.
3. Could `RELEASE_JOB_CREATED.metadata.qa_run_id` plus the QA row constitute an enforceable identity binding, or is it merely provenance because deployment never consumes the QA commit?
4. Does the Release adapter or provider backend resolve the exact commit through some hidden/declared mechanism despite being passed repository URL + branch only? If yes, cite the exact invariant and persistence path.
5. Should `release_jobs_build_job_unique` become a separate `REPRESENTABILITY_DEFECT / RELEASE_ARTIFACT_CARDINALITY`, or is it correctly supporting evidence until canonical Artifact Version semantics exist?
6. Is Asset adoption identity independently defective beyond F04-01, or correctly folded into the missing canonical artifact model?
7. Inspect maintenance/remediation: does it preserve an exact repaired artifact identity anywhere not cited here?
8. Is F04-03 correctly UNRESOLVED under the same retention standard used in Batches 01–03?
9. Independent scan: identify any additional R10 representability failure or any evidence that weakens/duplicates F04-01 or F04-02.

## 13. Provisional verdict

Pending adversarial review:

- **F04-01 — `REPRESENTABILITY_DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION`** — provisional DEFECT;
- **F04-02 — `REPRESENTABILITY_DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING`** — provisional DEFECT;
- **F04-03 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`** — provisional UNRESOLVED.

No separate cardinality or Asset-adoption finding is opened yet.

**Batch 04 provisional result: FAIL / OPEN.**

This draft has no implementation authority.