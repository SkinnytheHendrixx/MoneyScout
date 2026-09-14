# Phase F Batch 03 — R9 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F1 — R9 Immutable Build Source Snapshots  
**Implementation authority:** SUSPENDED

## 1. Governing method

This batch applies the Phase-F base plan, Refinement 1, and the closed Phase-D coexistence semantics.

R9 is not satisfied merely because some table somewhere stores a commit SHA. The representability question is whether each consequential Build binds, **before execution**, to its own immutable Build Source Snapshot with enough identity and provenance to establish exactly which repository/source state was authorized, and whether arbitrary-N historical/successor snapshots can coexist without current-pointer substitution or historical mutation.

The review therefore distinguishes:

- repository state/context;
- Build Source Snapshot authority;
- builder-attempt execution records;
- build output/result commit identity.

These are not interchangeable.

## 2. Pinned evidence basis

### Recovered R9 contract

`docs/remediation-contracts/WI-R9.md`  
Blob: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

R9 requires every Build to bind to an exact immutable Build Source Snapshot before consequential build execution can rely on repository state.

The snapshot must preserve, at minimum where applicable:

- repository identity;
- repository URL/canonical locator;
- exact base/source commit SHA;
- observed mutable ref for provenance only;
- relevant manifest/source-set identity;
- Product Definition identity;
- Architecture identity/version;
- Build identity;
- exact R4 Evaluation Lineage;
- source fingerprint/deterministic identity;
- observation/freeze time;
- provenance of how the snapshot was frozen.

R9 also requires successor/repair source authorities X, Y, Z to remain distinct historical identities rather than mutating the original snapshot to the newest source.

### Declarative Build schema

`lib/db/src/schema/build.ts`  
Blob: `4be2cbcbbbbf5dee91d71cc1f8dcda56ad7dde88`

`build_jobs` carries Evaluation Cycle, Bet, Build Contract, factory/repository pointers, and `resultCommitSha`. `PersistedBuildContractV2.lineage` carries Bet/Product/Architecture/capability-snapshot identity, but does **not** carry repository identity/URL, exact authorized input/source commit SHA, observed ref, source fingerprint, source-freeze time, or source-freeze provenance.

`resultCommitSha` is the produced Build result, not the pre-execution source authority.

`builder_workspaces` carries repository URL, branch name, and result commit SHA, but no canonical pre-dispatch source snapshot object.

`build_jobs.evaluationCycleId` and `builder_workspaces.evaluationCycleId` use `ON DELETE SET NULL`.

### Declarative Factory / Builder Gateway schema

`lib/db/src/schema/factory.ts`  
Blob: `0e4914790e071e840371a80ba42aa23e305108a2`

`asset_repositories` carries:

- repository identity/provider/URL;
- default branch;
- scalar `baseCommitSha`;
- manifest fingerprint/files.

It is constrained by `asset_repositories_bet_unique = UNIQUE(bet_id)`, making it one repository-state row per Bet.

`builder_gateway_runs` permits multiple attempts for a Build and carries:

- `buildJobId`;
- `assetRepositoryId`;
- branch name;
- nullable `baseCommitSha`;
- nullable result commit SHA;
- provider execution identity/state.

The schema does not declare the gateway run itself to be the complete R9 Build Source Snapshot, and the nullable source SHA alone does not supply R9's required lineage/provenance composition.

### Effective runtime migrations

`lib/db/src/builder-runtime-migrations.ts`  
Blob: `45559c071a8f2c301fcb34adfb8b37c2f5b26c7c`

The Builder Workspace runtime migration creates one workspace per Build and stores repository URL/branch context, but no canonical R9 Build Source Snapshot.

`lib/db/src/factory-runtime-migrations.ts`  
Blob: `bfd31315a8538a42750582b323808bd876056506`

The Factory migration creates `asset_repositories` with `base_commit_sha`, one row per Bet, and `builder_gateway_runs` with nullable `base_commit_sha`. It also adds factory/repository/result pointers onto Build/Workspace persistence.

For the load-bearing R9 fields discussed in this batch, the effective runtime DDL corroborates rather than cures the declarative representation.

### Repository provisioning and Build creation

`artifacts/api-server/src/lib/asset-factory.ts`  
Blob: `fa9ada338931719ee75cfc1a08df40bf5aa24ba8`

Repository provisioning updates the existing `asset_repositories` row in place with provider, URL, branch, and `baseCommitSha`.

When generated manifest content changes, the same repository row is updated to `PENDING` with the new manifest fingerprint/files and then provisioned again. The provisioning result writes a new `baseCommitSha` onto that same row.

The Build job is then created with a pointer to `assetRepositoryId` and the frozen Build Contract v2, but the exact authorized source commit is not copied/frozen into the Build job or Build Contract.

### Repository provisioner contract

`artifacts/api-server/src/lib/asset-repository-provisioner.ts`  
Blob: `6150a931d4f41256aeb8e8a6bc10c082f44d318e`

The provisioner correctly requires an exact `baseCommitSha` in its result. This proves the implementation can obtain an immutable Git identity; the issue is where/how that identity is bound as Build authority.

### Builder Gateway execution

`artifacts/api-server/src/lib/builder-gateway.ts`  
Blob: `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

`createOrReuseBuilderGatewayRun` creates a run with Build/repository identity, branch, provider, attempt number, and request payload, but does **not** set `baseCommitSha` when the run is created.

At execution time, after loading the current Build and current `asset_repositories` row, the worker computes:

- normal attempt source: `repository.baseCommitSha`;
- repair attempt source: `job.resultCommitSha ?? repository.baseCommitSha`.

It then checks out that value in the worktree.

The run's own `baseCommitSha` is persisted only later on terminal/provider-result paths, after the external provider boundary has already been crossed. Thus the row that eventually records the source SHA does not itself establish a durable pre-dispatch freeze.

## 3. F03-01 — exact immutable Build Source Snapshot is not represented/frozen at the Build boundary

**Classification:** `REPRESENTABILITY_DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE`

**Provisional adjudication:** DEFECT.

The current model contains useful source-related facts, but no canonical object satisfying R9's required Build Source Snapshot semantics.

The decisive implementation sequence is:

1. repository provisioning produces an exact Git `baseCommitSha`;
2. that SHA is stored as a scalar on the one-per-Bet `asset_repositories` row;
3. a Build job is created pointing to that repository row, without freezing the source SHA into the Build authority object;
4. a Builder Gateway run is created, again without setting its own `baseCommitSha`;
5. when execution begins, the worker reads `repository.baseCommitSha` (or `job.resultCommitSha` for repair) and uses that then-current value as `attemptBaseCommitSha`;
6. the gateway run records its `baseCommitSha` only later, on/after provider-result handling.

That is incompatible with R9's requirement that exact source authority be durably bound **before consequential build execution**.

### Why the repository row is not an equivalent R9 snapshot

`asset_repositories` is repository state, not immutable per-Build source authority:

- it is one row per Bet (`UNIQUE(bet_id)`);
- `baseCommitSha` is a scalar on that row;
- the row can be re-provisioned and `baseCommitSha` rewritten in place;
- it lacks Build identity and the complete R9 source-snapshot provenance/lineage composition;
- Builds reference the repository row, not an immutable version/snapshot of it.

### Why the gateway run is not currently an equivalent R9 snapshot

`builder_gateway_runs` has a distinct row per attempt and can physically preserve multiple `baseCommitSha` values after they are written. That is useful and means the table should not be dismissed as structurally incapable of multiplicity.

However, the run is created with `baseCommitSha = NULL`, and the execution code chooses its source from current repository/build state at execution time before persisting the chosen source on the run.

Therefore it currently records observed execution source after the fact rather than proving pre-execution immutable source authority.

It also lacks a declared R9 snapshot contract binding all required Product/Architecture/R4/source-fingerprint/freeze-provenance dimensions.

## 4. Concrete current-pointer and creation-time contamination evidence

**Disposition:** supporting evidence for F03-01, not a separately counted cardinality defect at this stage.

The current implementation creates a direct D-C1/D-C6 failure mechanism:

- `asset_repositories_bet_unique` makes one mutable repository-state row serve all Build activity for that Bet;
- changed manifests can trigger re-provisioning of that same row;
- re-provisioning rewrites `baseCommitSha` in place;
- Build jobs hold only `assetRepositoryId`, not the exact source SHA frozen when the Build became authoritative;
- gateway execution later reads the repository row's then-current `baseCommitSha`.

Therefore Build B1 created when repository row R pointed to source X has no durable R9 field preventing a later repository-row update to Y from becoming the source selected when B1 finally executes.

That is the exact class of historical-authority substitution R9 exists to prevent.

### No separate arbitrary-N/cardinality defect yet

Do not double-count the root problem merely because correct arbitrary-N R9 snapshots cannot currently be certified.

The Gateway table itself can hold multiple attempt rows for a Build, so there is no evidence here of a universal one-row-only storage ceiling for every possible snapshot representation.

Instead, arbitrary-N is a mandatory acceptance consequence of F03-01: the corrected representation must preserve S1...SN independently, including successor/repair snapshots, with no source rewrite or parent-current-pointer substitution.

If later review finds an independent uniqueness/key constraint on an actual canonical/equivalent source-snapshot object, that may warrant a separate cardinality finding. None is claimed here.

## 5. Source-snapshot content/provenance incompleteness belongs inside F03-01

R9's required snapshot is more than `commitSha`.

No checked current object canonically binds the complete combination of:

- repository identity/locator;
- exact authorized input commit;
- observed mutable ref as provenance only;
- manifest/source-set identity;
- Product Definition identity;
- Architecture identity/version;
- Build identity;
- exact originating Evaluation Lineage;
- source fingerprint;
- freeze/observation time;
- freeze provenance;
- reconstruction provenance/state when applicable.

Some of these facts exist elsewhere in the graph (for example Product/Architecture identity in Build Contract v2), but R9 requires a frozen source-authority object that binds them together. Reconstructability by joining mutable/current records is not equivalent to an immutable authority snapshot.

This content incompleteness is part of the same root representation/freeze defect rather than a second finding.

## 6. Repair/successor semantics — partial physical support, incorrect authority timing

The current Gateway model deserves a precise mixed finding rather than a blanket failure claim.

Positive evidence:

- multiple `builder_gateway_runs` may exist for one Build;
- attempts have independent row IDs, attempt numbers, branches, idempotency keys, and nullable base/result commit fields;
- repair execution explicitly selects a successor base (`job.resultCommitSha ?? repository.baseCommitSha`), so the implementation recognizes that later attempts may use a different source.

Failure:

- the successor base is selected at execution time from mutable/current Build/repository state;
- there is no immutable successor Build Source Snapshot frozen before the repair attempt becomes consequential;
- no canonical source ancestry/provenance object proves X→Y→Z as distinct authorized source states.

Accordingly, the physical ability to store several Gateway rows does not earn R9 representability PASS.

## 7. F03-02 — historical source-authority retention durability is unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

**Provisional adjudication:** UNRESOLVED.

Concrete delete/reference behavior exists:

- `build_jobs.evaluationCycleId` uses `ON DELETE SET NULL`;
- `builder_workspaces.evaluationCycleId` uses `ON DELETE SET NULL`;
- `asset_repositories` is owned by Bet and uses cascading deletion in the effective Factory migration;
- `builder_gateway_runs` cascade with Build/repository ownership;
- related event histories also cascade with their parents.

Those mechanisms can remove or sever facts that a future canonical R9 source snapshot may need to remain historically addressable.

However, as in Batches 01/02, the governing hard-delete/archive/retention policy has not yet been established. Therefore a normative retention violation cannot yet be asserted, but PASS is equally unavailable.

Required follow-up:

1. establish whether Bet/Build/Repository/Evaluation Cycle hard deletion is permitted and under what retention policy;
2. establish the required retention duration for R9 snapshots and reconstruction provenance;
3. prove deletion/nulling of parent objects cannot destroy a snapshot's exact historical lineage/source references;
4. ensure legacy/reconstructed source-authority evidence survives for its governed retention period.

## 8. Declarative vs effective schema

For the load-bearing R9 facts, no contradiction was found that rescues the surface:

- `asset_repositories.base_commit_sha` exists in both declarative and effective Factory schema;
- one-per-Bet repository uniqueness exists in both;
- `builder_gateway_runs.base_commit_sha` exists in both;
- Builder Workspace runtime schema lacks a source snapshot, and later Factory migration additions do not create one;
- Factory migration adds Build/Workspace pointers/results but still no canonical R9 snapshot.

There are implementation-version differences across migration waves, but none supplies the missing pre-dispatch source-authority freeze.

## 9. Arbitrary-N checklist — provisional R9 disposition

1. **Exact authority/history key?** No canonical immutable Build Source Snapshot key/object. **FAIL / F03-01.**
2. **Repeatable parent scopes?** Multiple Gateway attempts can coexist, but exact source authority is not frozen per attempt/Build before dispatch. **FAIL / F03-01.**
3. **Uniqueness constraints?** One-per-Bet repository state is a mutable proxy, not a valid snapshot key; Gateway rows are not universally one-per-Build. **FAIL evidence under F03-01; no separate cardinality defect.**
4. **N children under one parent?** Physical Gateway rows support N attempts, but N valid immutable R9 snapshots are not represented. **FAIL / F03-01.**
5. **Historical and current coexist?** Post-hoc Gateway source SHAs may coexist, but authoritative pre-dispatch snapshot history does not. **FAIL / F03-01.**
6. **Multiple in-flight histories?** Multiple runs may exist, but their exact source authority is not durably frozen when created. **FAIL / F03-01.**
7. **Exact downstream reference without mutable current pointer?** Build points to repository row, whose base SHA can change; no snapshot ID is carried downstream. **FAIL / F03-01.**
8. **Restart/replay reconstruct same N-object graph?** Gateway rows preserve some execution facts, but the authoritative source selection was not frozen as a complete R9 object before dispatch. **FAIL / F03-01.**
9. **Retention/archive/delete durability?** Cascades/SET NULL exist; governing deletion policy unresolved. **UNRESOLVED / F03-02.**

## 10. Phase-D schema attacks against R9

- **F-D1 current-pointer overwrite:** FAIL. A Build can point to a repository row whose scalar `baseCommitSha` is later rewritten.
- **F-D2 same-parent deduplication:** not independently established as a universal row-count defect; one repository row per Bet is unsafe as source authority, but multiple Gateway attempts do physically coexist.
- **F-D3 decision/model collision:** not directly applicable as an R20 decision collision, but source-authority identity is absent.
- **F-D4 mixed-chain reconstruction:** FAIL. Product/Architecture lineage and source identity live in separate mutable/indirect records with no canonical frozen R9 composition.
- **F-D5 legitimate coexistence mistaken for conflict:** physical attempt coexistence exists; authoritative snapshot coexistence is not represented.
- **F-D6 creation-time inheritance contamination:** FAIL. Gateway execution can inherit the repository row's then-current source SHA rather than the Build's creation-time frozen source authority.

## 11. F7 implications

This batch does not certify F7.

At minimum, later F7 must prove exact N×N integrity for:

- R4 Evaluation Lineage ↔ R9 source snapshot;
- R9 source snapshot ↔ R10 artifact/build identity;
- R9 source snapshot ↔ each Builder/repair execution that consumes it;
- downstream R17/R19/R20 lineages that ultimately claim descent from that source authority.

Current lack of a canonical R9 snapshot identity prevents those exact pairings from being certified now.

## 12. Provisional batch disposition

- **F03-01:** `REPRESENTABILITY_DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE`.
- **F03-02:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No separate cardinality defect is presently counted. The one-per-Bet mutable repository row and late source selection are direct supporting evidence for F03-01, while the multiple-attempt Gateway model prevents an overbroad claim that storage is universally one-row-only.

No implementation or remediation is authorized.

## 13. Requested adversarial review

1. Is F03-01 correctly classified as DEFECT rather than UNRESOLVED given the actual execution sequence, or can an existing record legitimately be treated as the canonical R9 Build Source Snapshot?
2. Does the combination of Build Contract v2 + `assetRepositoryId` + repository `baseCommitSha` + Gateway run constitute an equivalent immutable composite snapshot despite no one record freezing the complete composition before dispatch? If yes, identify the exact invariant that prevents any referenced component from changing between Build authorization and provider execution.
3. Confirm or reject the claim that changed manifests can re-provision the same one-per-Bet repository row and rewrite `baseCommitSha` before an already-created Build executes.
4. Is it correct to treat the one-per-Bet repository/current-pointer behavior as supporting evidence for F03-01 rather than a distinct cardinality finding, given that Gateway attempts themselves can coexist?
5. Does persisting `builder_gateway_runs.baseCommitSha` only after provider execution/result handling fail R9's pre-dispatch freeze requirement even if it accurately records what source was eventually used?
6. Are repair attempts (`job.resultCommitSha ?? repository.baseCommitSha`) correctly characterized as recognizing successor source physically while still failing to freeze successor source authority before execution?
7. Is retention correctly UNRESOLVED given the explicit cascade/`SET NULL` behavior but unresolved hard-delete/archive policy?
8. Find any independent R9 representability defect supported by actual schema/migration/application evidence that is not already subsumed by F03-01, F03-02, F7, or later R10 concerns.

## 14. Calibration

Do not call R9 missing merely because there is no table literally named `build_source_snapshots`; an equivalent immutable composite representation would count if its invariants actually freeze all required identity before consequential execution.

Conversely, do not equate “we can determine afterward which commit was used” with “that commit was authoritative and durably frozen before execution.” R9's temporal freeze is part of the representation requirement.

Do not manufacture a cardinality defect simply because the canonical snapshot is absent. The current Gateway schema already demonstrates some arbitrary-N physical capacity, so cardinality must be classified independently from identity/freeze correctness.
