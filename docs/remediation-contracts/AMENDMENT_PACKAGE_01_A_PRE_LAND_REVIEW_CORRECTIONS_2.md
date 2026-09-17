# Amendment Package 01A — Pre-Land Review Corrections 2

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL PRE-LAND REVIEW CLEARS  
**Target:** Amendment A — `RD-C-R17-R18`  
**Base review draft:** `AMENDMENT_PACKAGE_01_A_PRE_LAND_AUTHORIZATION_REVIEW_DRAFT.md`  
**Base review draft commit:** `35e546b8b05d821c14ce764df37a5dc14e643511`  
**Corrections 1:** `AMENDMENT_PACKAGE_01_A_PRE_LAND_REVIEW_CORRECTIONS_1.md`  
**Corrections 1 commit:** `a79c71f6111c58b04a6739858dfd0f2395c66a5c`  
**Corrections 1 blob:** `87a81346b2007dcdfe32a1c1975d558562a83ca4`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**MAY_LAND:** NO

## 1. Purpose

This overlay records one accepted concurrency correction to the Amendment-A pre-land protocol and one additional empirical-verification gate.

The correction does not change Amendment A's semantic proposition, graph fan-out, Candidate Consequential Surface classification, five-surface writer set, PAIM scope, or runtime-root disposition.

It clarifies where repository serialization authority actually resides and makes the `update_ref` rejection path explicit and fail-closed.

## 2. Correction A-PL-R2-01 — server-side fast-forward check is decisive

The client-side pre-ref read of `main` is not the decisive concurrency guarantee.

The decisive repository-level serialization mechanism is the server-side fast-forward validation performed by GitHub when the non-forced branch ref update executes.

The landing commit `C` is constructed with exact parent `P`. Therefore, at the instant GitHub evaluates `update_ref(main, C, force=false)`:

- if `main` still equals `P`, the update may succeed as a fast-forward;
- if another writer has advanced `main` to some different descendant or competing tip `P'`, `C` is not a fast-forward from that current tip because `C` remains parented to `P`, so the non-forced ref update must be rejected;
- two concurrent landing attempts built from the same parent `P` cannot both become current through successful non-forced ref advancement: the first successful ref move changes the current tip, causing the second stale-parent move to fail.

Accordingly, the pre-ref client read:

`current main == P`

is retained as an early-abort optimization and observability check, not as the final atomicity boundary.

The authoritative commit boundary is the successful server-side non-forced ref transition itself.

## 3. Correction A-PL-R2-02 — explicit server-side rejection path

A new named failure outcome is required:

`REF_UPDATE_REJECTED_STALE_PARENT`

This state applies when:

1. the landing blobs/tree/commit were prepared against exact parent `P`;
2. the optional pre-ref client check either passed or became stale immediately afterward;
3. `update_ref(main, C, force=false)` fails because `main` is no longer fast-forward-compatible with `C` or for any other reason that prevents the exact intended ref transition from being proven successful.

Required behavior is fail-closed:

1. treat Amendment A as **not landed**;
2. do not infer any authority transition, finding transition, certification invalidation, candidate-edge activation, or stable-root/state change;
3. do not retry by rebasing, cherry-picking, regenerating `C` on the new head, or rebuilding a new commit against the new tip inside the same landing attempt;
4. abandon the prepared unreferenced commit as non-authoritative;
5. set the landing attempt outcome to `REF_UPDATE_REJECTED_STALE_PARENT` or an equivalently explicit fail-closed pre-commit outcome;
6. re-read the new repository/configuration state;
7. rerun the complete pre-land staleness process against that new state, including all frozen PAIM/package/authority/config pins, graph/consequential-surface assumptions, exact writer-set assumptions, G2 evidence-effect determination, and any review premise affected by intervening changes;
8. if any material premise changed, return to adversarial review before a new `MAY_LAND` decision;
9. only after a fresh positive authorization may a new landing attempt receive a new landing-attempt identity and construct a new commit against a newly pinned parent.

There is no automatic retry-on-new-head path.

## 4. Relationship to FR-02 / FR-08

A rejected non-forced ref update is a **pre-commit abort**, not a post-commit rollback.

Until `main` actually advances to the exact prepared landing commit:

- no landing sub-effect is current;
- canonical authority remains pre-land;
- the prepared Git objects are not authority;
- FR-08 post-commit restoration does not apply.

If the ref update succeeds but a later POST-BCT safety failure occurs, that is a distinct post-commit state governed by the existing FR-08 rollback/restoration discipline.

The two failure classes remain temporally disjoint:

- ref update rejected before authoritative branch transition → pre-commit abort and re-derivation;
- ref update succeeds, then post-commit safety failure → FR-08 rollback/restoration.

## 5. Corrected landing protocol emphasis

The repository-level optimistic-concurrency sequence is now:

1. after adversarial review clears, fetch and pin fresh `main` parent `P` and tree `T`;
2. revalidate every frozen PAIM/package/authority/config/graph premise against `P`;
3. create all changed/new blobs without moving any ref;
4. create one tree `T'` from exact base tree `T` containing exactly the five authorized writer paths;
5. create one commit `C` with `parent_sha = P` and `tree_sha = T'`;
6. optionally re-read `main` and require `main == P` as an early stale-attempt check;
7. execute `update_ref(main, C, force=false)`;
8. treat success of that exact server-side non-forced ref transition as the authoritative repository commit boundary;
9. if the update fails, enter `REF_UPDATE_REJECTED_STALE_PARENT` and perform full fail-closed re-derivation before any new attempt;
10. if the update succeeds, fetch the new `main` and commit `C`, then verify direct parent `P`, exact changed-path set, and all five writer-surface contents before proceeding to POST-BCT.

## 6. Controlled empirical verification becomes a pre-land gate

Because the actual Amendment-A landing depends materially on GitHub's non-forced ref-update behavior, a controlled empirical verification should be completed before final `MAY_LAND = YES` unless an equivalent already-executed authenticated test is pinned as evidence.

The test must not use `main` and must not mutate any canonical authority surface.

Minimum acceptance behavior:

1. create or use a disposable test branch at parent `P_test`;
2. create two distinct commits `C1` and `C2`, both with direct parent `P_test`;
3. advance the disposable branch non-forced from `P_test` to `C1`;
4. attempt a non-forced advance of the same branch from current `C1` to stale-sibling `C2`;
5. require the second update to be rejected server-side;
6. pin the test branch, parent/commit SHAs, API result, and observed final branch tip as evidence.

If the available connector cannot create and later clean up an isolated test branch safely, the empirical test remains pending rather than being improvised against `main`.

`FAST_FORWARD_CONCURRENCY_EMPIRICAL_TEST = REQUIRED_BEFORE_FINAL_MAY_LAND_UNLESS_EQUIVALENT_PINNED_EVIDENCE_EXISTS`

## 7. Confirmed unchanged review conclusions

The adversarial review's remaining conclusions are accepted without modification:

- the frozen negative fan-out remains valid, including no new direct `RET-R20` dependency;
- Candidate Consequential Surface classification remains `NONE` for the semantic-only landing;
- the exact five-writer set remains sufficient and minimal on current evidence;
- `WI-R19.md` remains excluded from Amendment-A writes;
- `ROOT-1`, `ROOT-2`, and `ROOT-3` remain non-writer runtime roots for this semantic amendment;
- writer-set expansion still revokes `MAY_LAND` and requires PAIM/graph re-derivation as applicable.

## 8. Current gate disposition

The concurrency mechanism is now conceptually specified as:

`SERVER_SIDE_NON_FORCED_REF_UPDATE = DECISIVE_SERIALIZATION_BOUNDARY`

with explicit failure state:

`REF_UPDATE_REJECTED_STALE_PARENT = ABORT_AND_FULL_REDERIVATION / NO_SILENT_RETRY`

The following still block final authorization:

- empirical fast-forward concurrency test or equivalent pinned execution evidence;
- final G2 evidence-effect determination against final authority wording;
- fresh PAIM/package/authority/config/graph pin validation after review;
- exact graph-delta and landing-event path nonexistence check;
- final five-path writer manifest/content review;
- final rollback/post-commit binding review;
- final independent `MAY_LAND` adjudication.

Therefore:

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
