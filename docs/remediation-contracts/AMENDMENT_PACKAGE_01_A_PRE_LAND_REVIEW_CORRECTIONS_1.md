# Amendment Package 01A — Pre-Land Review Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL PRE-LAND REVIEW CLEARS  
**Target:** Amendment A — `RD-C-R17-R18`  
**Base review draft:** `AMENDMENT_PACKAGE_01_A_PRE_LAND_AUTHORIZATION_REVIEW_DRAFT.md`  
**Base review draft commit:** `35e546b8b05d821c14ce764df37a5dc14e643511`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**MAY_LAND:** NO

## 1. Purpose

This overlay resolves one factual capability question deliberately left pending in the base pre-land review draft: whether the available GitHub connector can construct the required five-surface Amendment-A landing as one logical Git commit rather than five separately visible file commits.

It does not grant `MAY_LAND`, prepare final authority wording, write any landing surface, or change the frozen PAIM.

## 2. Verified connector capabilities

The currently available GitHub connector exposes all of the low-level operations required to construct a single atomic repository commit:

1. `create_blob` — create complete new contents for each changed/new path and obtain immutable blob IDs;
2. `create_tree` — build one new tree from an exact `base_tree_sha` plus all five path updates;
3. `create_commit` — create one commit pointing at that complete tree with one exact `parent_sha`;
4. `update_ref` — advance `main` to that commit with `force=false`.

Therefore:

`ATOMIC_FIVE_SURFACE_COMMIT_MECHANISM = AVAILABLE_IN_PRINCIPLE`

This is a capability determination, not authorization to execute it.

## 3. Exact-parent / stale-head behavior

The intended landing protocol is:

1. fetch and pin fresh `main` head `P` and tree `T` only after adversarial review clears;
2. revalidate every frozen PAIM/package/authority/config pin against `P`;
3. create all changed/new content blobs without changing the branch;
4. create one tree `T'` from exact base tree `T` containing all five writer-surface changes;
5. create one commit `C` with `parent_sha = P` and `tree_sha = T'`;
6. re-read `main` immediately before ref advancement;
7. require current `main == P`;
8. call `update_ref(main, C, force=false)`;
9. fetch `C` and verify direct parent = `P` and changed-path set = exactly the five authorized writer paths.

If `main != P` at step 7, landing is aborted before ref advancement.

Even if step 7 were raced by an external writer, `force=false` supplies a second safety condition: a commit whose parent is stale relative to current `main` is not a fast-forward from that newer branch tip and must not replace it.

No silent rebase/cherry-pick is permitted.

## 4. No prepared commit is authority

Creating blobs, a tree, or commit `C` in Git's object database does not itself land Amendment A.

Until `main` is successfully advanced from exact parent `P` to `C`:

- canonical authority remains the pre-land state;
- no finding transitions;
- no certification invalidations become current;
- no candidate graph edge becomes effective;
- `landing_commit_status` remains pre-commit/prepared, not globally committed.

A prepared but unreferenced Git commit may be abandoned safely if pin revalidation or the ref advancement fails.

## 5. Remaining MAY_LAND blockers unchanged

This correction upgrades only one row of the draft gate matrix:

`atomic five-surface landing mechanism available = PASS_IN_PRINCIPLE`

It does not clear:

- adversarial review of the 10 graph effects and negative fan-out;
- adversarial review of Candidate Consequential Surface classification;
- adversarial review of exact five-surface writer set;
- final G2 evidence-effect determination against final authority wording;
- fresh post-review PAIM/package/authority/config pin validation;
- fresh pre-land parent/tree pin;
- proof that graph-delta and landing-event paths do not already exist;
- final exact changed-path-set validation;
- landing rollback binding.

Therefore:

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`

## 6. Review priority added

The adversarial reviewer should specifically test whether `force=false` plus the explicit pre-ref `main == P` check is sufficient repository-level optimistic concurrency for this semantic-only landing, or whether an additional branch/ref mechanism is required.

No runtime shared-root lease is introduced by this correction.