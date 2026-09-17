# Amendment Package 01A — Mechanical Pre-Land Verification Checkpoint 1

**Status:** VERIFIED CHECKPOINT / NON-AUTHORIZING / NOT FINAL MAY_LAND  
**Target:** Amendment A — `RD-C-R17-R18`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**G2 effect:** FINAL / UNCHANGED FORMAL PROVIDER-ACCOUNT PROPOSITION  
**MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This checkpoint records direct repository-state verification after substantive Amendment-A design review completed.

It does not grant `MAY_LAND`, create any landing writer surface, run the empirical concurrency test, modify canonical authority, or land Amendment A.

Its purpose is to separate mechanical facts that can be verified now from facts that must still be established immediately before an authorized landing.

## 2. Repository baseline at verification

At the start of this verification:

- `main` head: `e2fe3972bfaf80fff2b7993ae4bcd41560ad4a1e`
- `main` tree: `6e4872df6af2c36c7716cf4b04f78b2d28dd68d6`
- branch protected: `false`
- branch-protection enabled: `false`
- required-status-check enforcement: `off`
- required status-check contexts/checks: none reported.

This baseline is a checkpoint, not the eventual landing parent. A fresh parent/tree must still be pinned immediately before any final `MAY_LAND` decision and again before ref advancement.

## 3. Frozen control-plane pins directly revalidated

The following current blobs were re-read from `main` and match their frozen values exactly:

- `GLOBAL_REMEDIATION_REGISTER_FREEZE_ASSEMBLY.json` → `b7d163024464a6c9f069eef68b17d1b54a4e8f71`
- `GLOBAL_REMEDIATION_REGISTER_CANONICAL_FREEZE.md` → `0e6e3bb794f15bf137f5c40afbfd604808717008`
- `AMENDMENT_PACKAGE_01_PAIM_CANONICAL_FREEZE.md` → `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`

No frozen control-plane input changed.

## 4. Canonical authority pins directly revalidated

The four authority contracts remain exactly:

- `WI-R17.md` → `16a234e897fe6e119392707a7187a3232f0fd972`
- `WI-R18.md` → `226d67276f1627c26045ead9c7717023e7e764db`
- `WI-R19.md` → `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- `WI-R20.md` → `d9d7788e4c5a8f4c0914cf845294b38386470333`

R19 remains evidence/sequencing input only and is not an Amendment-A writer.

## 5. Reviewed pre-land lineage directly revalidated

Current blobs:

- pre-land authorization review draft → `647d3ea23142ca1e7d9fe633d355aac09374eff7`
- pre-land Corrections 1 → `87a81346b2007dcdfe32a1c1975d558562a83ca4`
- pre-land Corrections 2 → `cbaec02093751e5837e59a31c5bade908eaa4e88`
- concurrency empirical-test governance option → `ca08a2beae7ac16e1750065d98006663539dcad3`
- exact landing-contents review candidate → `b47938b7b4a366072b74e39081ffcce3296d01b6`
- G2 final adjudication → `9c0d2a63f81ac3cc6bbf538a7c75bd1552f6c238`

These reviewed inputs are current at this checkpoint.

## 6. Landing-only path nonexistence directly verified

The repository content API returned `404 Not Found` for both proposed landing-only paths:

- `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
- `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

Therefore:

`GRAPH_DELTA_PATH_PREEXISTS = NO`

`LANDING_EVENT_PATH_PREEXISTS = NO`

This must be rechecked immediately before a final authorized landing. If either path later exists, the writer manifest is stale and landing must abort/re-derive rather than overwrite it.

## 7. Five-writer set checkpoint

The reviewed logical writer set remains exactly:

1. `WI-R17.md`
2. `WI-R18.md`
3. `WI-R20.md`
4. `AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

No sixth writer surface was discovered during direct pin/path verification.

Excluded writers remain:

- `WI-R19.md`
- frozen V4 register JSON
- canonical register freeze artifact
- runtime/schema/provider paths
- ROOT-1 / ROOT-2 / ROOT-3
- any application/customer-facing path.

## 8. FR-08 rollback binding review

The reviewed landing-event template is sufficient to bind exact restoration if a post-commit POST-BCT failure occurs, provided the final landing event contains the promised exact values.

Required final landing-event prestate/poststate evidence includes:

- exact pre-land parent commit and tree;
- exact post-land commit and tree;
- exact authorized changed-path set;
- exact pre-land blobs for R17/R18/R20;
- exact post-land blobs for R17/R18/R20;
- graph-delta blob;
- landing-event blob or content identity as representable without self-reference ambiguity;
- frozen PAIM and reviewed pre-land artifact blobs;
- landing attempt identity;
- exact successful global Git commit identity;
- invalidation/recheck state transition caused by the landing;
- graph-state transition caused by the landing;
- POST-BCT state.

FR-08 restoration rule remains:

If POST-BCT fails after the branch transition, restore the exact pre-land authority/finding/certification/graph state caused solely by the failed amendment and prove equality before treating the rollback as complete.

If an independent committed change makes exact restoration impossible, enter `ROLLBACK_RECONCILIATION_REQUIRED`; do not infer prior certifications current.

### 8.1 Self-reference constraint for the landing event

The landing-event artifact cannot naively contain its own final Git blob SHA inside its own content without creating a recursive hash problem.

Therefore the final event must identify itself through non-recursive commit/path binding, for example:

- exact landing commit SHA as global commit identity;
- exact path `AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`;
- exact landing tree SHA;
- post-commit verification that the path at that commit resolves to the expected event content/blob.

A requirement that the event text literally embed its own final blob SHA is not imposed.

This preserves exact restoration/provenance without an impossible self-hash fixed point.

## 9. What is not yet complete

This checkpoint does not claim the following are complete:

### 9.1 Empirical concurrency evidence

The stale-sibling non-forced ref-update test remains pending a separate explicit governance choice.

### 9.2 Final prospective output-blob manifest

The exact final post-amendment blobs for R17/R18/R20 and the exact blobs for the two new landing artifacts are not yet frozen.

The exact-landing-content review candidate defines the approved substantive insertions/templates, but a final five-path manifest requires complete prospective contents for each of the five actual writer paths.

No final `MAY_LAND` decision may substitute the review-candidate artifact's blob for the eventual output blobs of those five writer paths.

### 9.3 Final current parent/tree

The eventual landing parent/tree must be freshly pinned after all governance/review work is complete. This checkpoint head is not reserved.

## 10. Next mechanical work

Before independent `MAY_LAND` adjudication:

1. resolve the empirical-concurrency governance choice and obtain required evidence if the gate remains mandatory;
2. construct the exact complete prospective contents for all five writer paths without advancing `main`;
3. derive/pin the five prospective Git blob identities or equivalent exact content digests;
4. adversarially verify that those complete outputs match the reviewed candidate and introduce no extra change;
5. refresh all frozen pins and branch/config state;
6. recheck both new paths still do not exist;
7. pin final parent/tree;
8. conduct the independent `MAY_LAND` adjudication.

## 11. Disposition

`FROZEN_CONTROL_PLANE_PINS = CURRENT_AT_CHECKPOINT`

`CANONICAL_AUTHORITY_PINS = CURRENT_AT_CHECKPOINT`

`PRE_LAND_REVIEW_LINEAGE = CURRENT_AT_CHECKPOINT`

`GRAPH_DELTA_PATH_PREEXISTS = NO`

`LANDING_EVENT_PATH_PREEXISTS = NO`

`FIVE_WRITER_SET = HOLDS_ON_CURRENT_EVIDENCE`

`FR08_ROLLBACK_BINDING = STRUCTURALLY_SUFFICIENT / FINAL VALUES STILL REQUIRED`

`FINAL_FIVE_PATH_OUTPUT_BLOBS = NOT_YET_FROZEN`

`EMPIRICAL_CONCURRENCY_EVIDENCE = PENDING_GOVERNANCE_DECISION`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
