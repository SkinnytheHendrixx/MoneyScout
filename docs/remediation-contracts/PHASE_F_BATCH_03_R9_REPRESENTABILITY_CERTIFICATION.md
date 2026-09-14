# Phase F Batch 03 — R9 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / BATCH 03 CERTIFIED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F1 — R9 Immutable Build Source Snapshots  
**Implementation authority:** SUSPENDED

## 1. Certification result

R9 **FAILS Phase-F representability certification**.

Confirmed findings:

1. **F03-01 — `REPRESENTABILITY_DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE`** — CONFIRMED.
2. **F03-02 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`** — CONFIRMED UNRESOLVED.

No separate arbitrary-N/cardinality defect is opened in this batch. The current Builder Gateway persistence genuinely supports multiple attempt rows for one Build; the root failure is that exact source authority is not durably frozen into a complete R9 authority object before consequential execution.

This certification incorporates the full adversarial review and two additional independently traced implementation facts discovered during review:

- the **supersession-gap mechanism** that makes historical source substitution concretely reachable; and
- the **boundary-revalidation asymmetry** showing that immediate pre-side-effect revalidation is already an intentional pattern in this execution path, but source-authority immutability is not included in that discipline.

Neither is counted as a new finding. Both strengthen F03-01.

## 2. Pinned evidence basis

### R9 governing contract

`docs/remediation-contracts/WI-R9.md`  
Blob: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

R9 requires every consequential Build to bind to an exact immutable Build Source Snapshot before build execution relies on repository state. The snapshot must preserve the exact source authority and sufficient lineage/provenance to prove what was authorized. Mutable branch/repository context cannot substitute for that authority.

R9 further requires successor/repair source states X, Y, Z to remain independently addressable historical source identities rather than mutating prior authority to whichever source is newest.

### Declarative Build schema

`lib/db/src/schema/build.ts`  
Blob: `4be2cbcbbbbf5dee91d71cc1f8dcda56ad7dde88`

`build_jobs` stores Build lineage/contract state and a produced `resultCommitSha`, but it does not store the exact pre-execution authorized source commit, source-freeze fingerprint, freeze time, source provenance, or a canonical R9 source-snapshot ID.

`PersistedBuildContractV2.lineage` binds Opportunity/Evaluation/Bet/Product/Architecture/capability identity, but not repository/source authority.

### Declarative Factory/Gateway schema

`lib/db/src/schema/factory.ts`  
Blob: `0e4914790e071e840371a80ba42aa23e305108a2`

`asset_repositories` stores a scalar `baseCommitSha` and is constrained by:

`asset_repositories_bet_unique = UNIQUE(bet_id)`

so one mutable repository-state row serves a Bet.

`builder_gateway_runs` supports multiple attempt rows and carries nullable `baseCommitSha`, but the row is not created with the source authority frozen and does not itself bind the full R9 snapshot composition.

### Effective runtime migration

`lib/db/src/factory-runtime-migrations.ts`  
Blob: `bfd31315a8538a42750582b323808bd876056506`

The effective Factory DDL corroborates the same load-bearing structure: one repository row per Bet, scalar `base_commit_sha`, and Gateway attempt rows with nullable `base_commit_sha`. It does not create an immutable pre-dispatch Build Source Snapshot object.

### Repository provisioning

`artifacts/api-server/src/lib/asset-repository-provisioner.ts`  
Blob: `6150a931d4f41256aeb8e8a6bc10c082f44d318e`

The repository provisioner requires an exact `baseCommitSha`. Therefore the system can obtain immutable Git identity. The defect is not inability to know the SHA; it is failure to bind that SHA as Build authority at the correct boundary.

### Factory/repository lifecycle

`artifacts/api-server/src/lib/asset-factory.ts`  
Blob: `fa9ada338931719ee75cfc1a08df40bf5aa24ba8`

The Factory stores provisioning results by updating the existing `asset_repositories` row, including `baseCommitSha`.

When generated manifests change, the same repository row is reset to `PENDING`, its manifest fingerprint/files are rewritten, and provisioning can update that same row with a new `baseCommitSha`.

The Build job then stores `assetRepositoryId` plus Build Contract v2, but not an immutable copy/reference to the exact authorized source snapshot.

### Builder Gateway execution

`artifacts/api-server/src/lib/builder-gateway.ts`  
Blob: `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

At execution time the worker freshly loads the Build and repository rows and computes:

```ts
const attemptBaseCommitSha = isRepair
  ? (job.resultCommitSha ?? repository.baseCommitSha)
  : repository.baseCommitSha;
```

That selected value is passed directly into `prepareWorktree`, whose checkout is performed against that SHA.

The Gateway run's own `baseCommitSha` is written only later on terminal/provider-result paths or finalization-claim persistence, after the selected value has already been read and consumed.

Accordingly, the eventual Gateway-row SHA is evidence of what execution used, not proof that the same source authority was durably frozen before dispatch.

## 3. F03-01 — Build Source Snapshot identity and freeze defect

**Classification:** `REPRESENTABILITY_DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE`  
**Final adjudication:** CONFIRMED DEFECT.

The current graph contains useful source facts but no canonical/equivalent object satisfying R9's pre-execution immutable authority requirement.

The confirmed sequence is:

1. repository provisioning produces an exact Git `baseCommitSha`;
2. the SHA is stored on the one-per-Bet `asset_repositories` row;
3. a Build job is created pointing at that repository row, without freezing the exact source SHA into Build authority;
4. a Builder Gateway run is created without its own `baseCommitSha` frozen;
5. when execution actually begins, the worker freshly reads repository/build state and chooses `attemptBaseCommitSha`;
6. checkout occurs against that chosen value;
7. only later does the Gateway row persist the chosen `baseCommitSha`.

R9 requires the opposite temporal authority relationship: the exact source must already be durably bound before consequential execution may consume it.

### 3.1 Why `asset_repositories` is not an equivalent R9 snapshot

`asset_repositories` is mutable repository state, not immutable per-Build source authority:

- it is one row per Bet;
- `baseCommitSha` is scalar current state;
- the row can be re-provisioned and its `baseCommitSha` rewritten;
- Builds retain only the repository row ID, not a frozen version/snapshot ID;
- it does not bind Build identity plus the complete Product/Architecture/R4/source-provenance dimensions required by R9.

### 3.2 Why `builder_gateway_runs` is not an equivalent R9 snapshot

The Gateway table correctly permits multiple attempts and can preserve different source SHAs after they are written.

That earns partial physical multiplicity credit, but not R9 authority:

- a run is created with `baseCommitSha = NULL`;
- the execution code resolves source authority from current Build/repository state when the worker runs;
- the SHA is persisted only after it has already been consumed;
- the row does not canonically bind the complete R9 lineage/provenance object.

Accurately recording what was used is not the same property as proving what was authorized beforehand.

## 4. Independently confirmed supersession-gap mechanism

The adversarial review established a concrete execution window that makes F03-01 demonstrable rather than merely structural.

In `startAssetFactoryRun`, stale prior Factory runs for the same Bet are superseded only when:

`assetFactoryRunsTable.buildJobId IS NULL`

Therefore a prior Factory run that has already created a Build job and reached the builder-ready state is outside that cancellation sweep.

A later Factory run for the same Bet can then:

1. produce materially different manifests;
2. find the existing shared `asset_repositories` row via the one-per-Bet identity;
3. detect a manifest fingerprint mismatch;
4. reset that same repository row to `PENDING` with new manifests;
5. re-provision the row and replace its scalar `baseCommitSha`;
6. leave the earlier Build job intact, still pointing only to the same `assetRepositoryId`;
7. later allow that earlier Build's Gateway execution to freshly read the repository row and consume the replacement SHA.

Thus an earlier Build B1 can be created while repository row R represents source X, then execute after R has been updated to source Y, with no immutable R9 field forcing B1 to retain X.

This is direct D-C1 current-pointer overwrite and D-C6 creation-time inheritance contamination evidence.

## 5. Boundary-revalidation asymmetry

`builder-gateway.ts` already contains an explicit `revalidateImmediatelyBeforeProviderSideEffect` control that re-checks Bet activity and spend-envelope conditions immediately before crossing the provider boundary.

This confirms that immediate boundary-time revalidation is an intentional safety pattern in this code path.

However, source-authority integrity is not part of that check. The worker has already resolved `attemptBaseCommitSha` from mutable current state, and no equivalent control proves that the exact source authority was previously frozen for this Build or that repository source state has not changed relative to Build authorization.

This is supporting remediation evidence, not a separate finding: the codebase already has a nearby pattern for enforcing load-bearing pre-side-effect predicates, but R9 source authority has not been incorporated into it.

A correct remediation still requires an immutable pre-dispatch authority object; merely re-reading the current repository SHA immediately before provider execution would not satisfy R9 because a fresher current value is not a substitute for the historically authorized value.

## 6. Content/provenance incompleteness is part of F03-01

No checked canonical object binds the complete required combination of:

- repository identity/locator;
- exact authorized input commit;
- observed mutable ref as provenance only;
- manifest/source-set identity;
- Product Definition identity;
- Architecture identity/version;
- Build identity;
- exact originating Evaluation Lineage;
- source fingerprint/deterministic identity;
- observation/freeze time;
- freeze provenance;
- reconstruction provenance/state where applicable.

Some components exist elsewhere. Reconstructing them later from mutable/current records is not equivalent to a frozen authority snapshot.

This remains part of the same root identity/freeze defect and is not double-counted.

## 7. Repair/successor semantics

The current implementation has partial physical support:

- multiple Gateway runs can exist per Build;
- attempt rows have independent IDs, attempt numbers, branches, and result/source fields;
- repair source selection recognizes a successor base via `job.resultCommitSha ?? repository.baseCommitSha`.

But the authority timing remains wrong:

- successor source is selected at execution time;
- no immutable successor Build Source Snapshot is frozen first;
- no canonical source-authority object proves X→Y→Z as distinct governed historical source states.

The existence of multiple attempt rows therefore does not earn R9 representability PASS.

## 8. No separate cardinality defect

The review specifically tested whether F03-01 should be split into a second arbitrary-N defect.

It should not.

Unlike the one-row-only failure patterns seen on other Phase-F surfaces, `builder_gateway_runs` genuinely supports multiple rows for one Build. The current failure is semantic/temporal authority binding, not a universal physical inability to store N attempt records.

The remediation acceptance requirement remains arbitrary-N:

- S1…SN source snapshots must be independently addressable;
- historical and current snapshots must coexist;
- successor/repair snapshots must never rewrite predecessor authority;
- downstream R10/R17/R19/R20 consumers must reference the exact intended R9 snapshot rather than a current repository pointer.

A separate cardinality finding should be opened only if a future review discovers an independent uniqueness/key ceiling on the canonical/equivalent source-snapshot representation itself.

## 9. F03-02 — historical retention durability

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Final adjudication:** CONFIRMED UNRESOLVED.

Concrete persistence behaviors include:

- `build_jobs.evaluationCycleId` → `ON DELETE SET NULL`;
- `builder_workspaces.evaluationCycleId` → `ON DELETE SET NULL`;
- Bet-owned repository/factory structures with cascading delete behavior;
- Gateway runs and related event records cascading with parents.

These mechanisms could remove or sever historical facts required by a future canonical R9 snapshot.

But the governing hard-delete/archive/retention policy has not yet been established. Therefore neither PASS nor normative retention DEFECT is earned.

Resolution requires explicit proof of:

1. whether Bet/Build/Repository/Evaluation Cycle hard deletion is permitted;
2. required retention duration for source snapshots and reconstruction evidence;
3. preservation of exact historical lineage/source references through deletion/archive behavior;
4. survival of legacy/reconstructed source-authority evidence for the governed retention period.

## 10. Phase-D attack disposition

- **D-C1 — current-pointer overwrite:** FAIL, concretely demonstrated by shared mutable repository source state.
- **D-C2 — same-parent deduplication:** no independent universal defect established; Gateway attempts can coexist.
- **D-C3 — decision/model collision:** not the governing R9 failure class.
- **D-C4 — mixed-chain reconstruction:** FAIL; source authority and Product/Architecture/Evaluation lineage are not canonically frozen together.
- **D-C5 — legitimate coexistence mistaken for conflict:** physical attempt coexistence exists, but valid R9 authority coexistence is not represented.
- **D-C6 — creation-time inheritance contamination:** FAIL, concretely demonstrated by execution-time inheritance of then-current repository source state.

## 11. Arbitrary-N checklist — final R9 disposition

1. Exact authority/history key — **FAIL / F03-01**.
2. Repeatable parent scopes — physical attempts yes; valid frozen source authority no — **FAIL / F03-01**.
3. Uniqueness constraints — one-per-Bet mutable repository row is not a snapshot key — **FAIL evidence / F03-01; no separate cardinality finding**.
4. N children under one parent — physical Gateway attempts yes; N immutable R9 snapshots no — **FAIL / F03-01**.
5. Historical and current coexistence — post-hoc SHAs may coexist; authoritative pre-dispatch source snapshots do not — **FAIL / F03-01**.
6. Multiple in-flight histories — runs may coexist, exact authority not frozen when created — **FAIL / F03-01**.
7. Exact downstream reference without mutable current pointer — absent — **FAIL / F03-01**.
8. Restart/replay reconstructs same N-object authority graph — not proven because authority selection was not durably frozen before dispatch — **FAIL / F03-01**.
9. Retention/archive/delete durability — governing policy unresolved — **UNRESOLVED / F03-02**.

## 12. F7 carry-forward

This batch does not certify F7.

F7 must later prove exact cross-surface integrity for at least:

- R4 Evaluation Lineage ↔ exact R9 Build Source Snapshot;
- R9 snapshot ↔ exact R10 built Artifact identity;
- concurrent successor/repair source histories without cross-chain substitution;
- downstream commercial/release authority consuming the intended historical R9 snapshot rather than mutable repository state.

F03-01 therefore remains a live blocker for F7 until corrected and re-certified.

## 13. Final adjudication

The adversarial reviewer independently traced the full execution sequence and confirmed every load-bearing classification in the draft.

The review added two materially useful evidence points:

1. the `buildJobId IS NULL` supersession scope leaves already-created Builds alive while a later same-Bet Factory run can rewrite the shared repository row's source state;
2. immediate pre-provider revalidation is already used for other authority predicates in the same function, making the missing source-authority freeze/revalidation discipline especially concrete.

These strengthen but do not multiply the finding set.

### Certified Phase-F Batch 03 register

| Finding | Final class | Final state |
|---|---|---|
| F03-01 | `REPRESENTABILITY_DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE` | OPEN / CONFIRMED |
| F03-02 | `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` | OPEN / UNRESOLVED |

**Batch 03 result: FAIL / OPEN.**

R9 is now Phase-F certified at the specification/representation audit level. This does not restore implementation authority.
