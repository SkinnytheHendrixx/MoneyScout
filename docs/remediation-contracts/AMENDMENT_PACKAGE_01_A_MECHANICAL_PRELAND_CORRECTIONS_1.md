# Amendment Package 01A — Mechanical Pre-Land Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL INCORPORATED INTO FINAL PRE-LAND PACKAGE  
**Target:** Amendment A — `RD-C-R17-R18`  
**Base checkpoint:** `AMENDMENT_PACKAGE_01_A_MECHANICAL_PRELAND_CHECKPOINT_1.md`  
**Base checkpoint commit:** `e6cb82d17cccc01297061230e2b26eab14e1b58a`  
**Base checkpoint blob:** `59d9fd2bb0465b5fed3531587cd00a3685c64f33`  
**MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay corrects a second-order self-reference defect in the Amendment-A landing-event template.

The base checkpoint correctly observed that the landing-event file cannot contain its own final blob SHA. However, §8 still required the landing-event file to contain the exact post-land commit SHA and tree SHA. Those fields are equally self-referential and cannot be embedded in the same commit that determines them.

This overlay separates:

1. facts that may safely be embedded inside the landing-event file before the landing commit exists; and
2. achieved-state facts that can exist only after the commit/tree/blob identities are created and the branch ref transition succeeds.

## 2. Why final commit/tree identifiers are self-referential

Git object identity is recursive in this direction:

`landing-event content → landing-event blob SHA → landing tree SHA → landing commit SHA`

Therefore, if the landing-event content itself attempts to contain:

- its own final blob SHA;
- the final tree SHA containing that blob; or
- the final commit SHA containing that tree,

the content depends on a hash value that depends on the content itself.

No final in-commit text field may require any of those identities.

This is the same underlying fixed-point problem at three levels of the Git object graph, not three separate problems.

## 3. Corrected in-commit landing-event fields

The file:

`docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

may contain exact facts known before the final Git objects exist, including:

- unique `landing_attempt_id`;
- amendment/package identity;
- exact pre-land parent commit SHA;
- exact pre-land tree SHA;
- exact authorized five-path writer manifest;
- exact pre-land blobs for R17/R18/R20;
- exact prospective post-amendment content digests or pre-created blob SHAs for R17/R18/R20 where already known;
- exact prospective graph-delta blob SHA if pre-created and non-self-referential;
- exact frozen PAIM/review artifact blobs;
- G2 disposition;
- Candidate Consequential Surface classification;
- invalidation/recheck transition that is intended to become current if and only if the branch transition succeeds;
- candidate graph-state transition that is intended to become current if and only if the branch transition succeeds;
- pre-ref concurrency conditions;
- precommit-abort state vocabulary;
- POST-BCT initial state = pending contingent on successful landing;
- FR-08 prestate references sufficient to identify what must be restored after a later post-commit failure.

The event file must state explicitly that none of its intended post-land transitions become authoritative unless the exact non-forced branch transition succeeds.

## 4. Fields prohibited from self-embedding

The landing-event file's own content MUST NOT require literal embedding of:

- its own final blob SHA;
- the final landing tree SHA;
- the final landing commit SHA;
- any derived identifier whose value depends on the final landing-event blob/tree/commit and would therefore recurse back into the file content.

Accordingly, the base checkpoint §8 requirement for:

- "exact post-land commit and tree";
- "landing-event blob or content identity";
- "exact successful global Git commit identity";

is superseded **as an internal file-content requirement**.

Those remain required achieved-state evidence, but they are established externally after the branch transition.

## 5. Post-commit achieved-state evidence

After a successful non-forced advancement of `main`, the landing procedure must externally verify and record:

- actual landing commit SHA `C`;
- actual landing tree SHA `T'`;
- direct parent of `C` equals the pinned pre-land parent `P`;
- exact changed-path set equals the authorized five paths;
- actual post-land R17/R18/R20 blob SHAs;
- actual graph-delta blob SHA;
- actual landing-event blob SHA;
- path `AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md` at commit `C` resolves to that observed blob;
- branch `main` points to `C`;
- the event file's declared `landing_attempt_id`, pre-land parent/tree, writer manifest, and intended transition set match the achieved commit.

This achieved-state evidence is authoritative proof of what landed. It is not self-asserted by the landing-event file.

## 6. Durable recording of achieved commit/tree/blob identity

If durable human-readable in-repository recording of the achieved commit/tree/blob identities is required, it must occur in a **separate subsequent evidence artifact or governance write** created after the landing commit exists.

That later write:

- is not part of the five-surface Amendment-A landing transaction;
- does not retroactively alter what the landing commit contained;
- must have its own governed writer authorization;
- must not be silently implied by Amendment-A `MAY_LAND`;
- may cite the already-existing landing commit/tree/blob identities without recursion because they are historical facts by then.

The PAIM/self-write provenance pattern is the governing precedent: a commit does not predict its own SHA inside its own content; the resulting SHA is verified afterward.

## 7. FR-08 restoration model after correction

FR-08 does not require the landing-event file to self-contain final commit/tree/blob hashes.

Exact rollback/restoration can be grounded in:

1. pre-land state embedded in the event and pinned before landing;
2. externally verified achieved landing commit/tree/path→blob mapping;
3. the exact branch transition from `P` to `C`;
4. post-commit verification evidence retained by the control-plane process;
5. any separately governed durable achieved-state evidence artifact, if one is later authorized.

If POST-BCT fails, rollback must restore from the exact pre-land authority state identified by the pinned prestate and prove that the resulting repository/control-plane state equals that prestate for every amendment-caused effect.

If exact restoration cannot be proven, enter `ROLLBACK_RECONCILIATION_REQUIRED`.

## 8. Consequence for the five-writer manifest

This correction does **not** add a sixth writer to the Amendment-A landing transaction.

The landing writer set remains exactly:

1. `WI-R17.md`
2. `WI-R18.md`
3. `WI-R20.md`
4. `AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

A later achieved-state evidence artifact, if desired, is a separate post-land governed action and must not be smuggled into the Amendment-A landing authorization.

## 9. Consequence for the prospective five-path manifest

The final prospective landing-event content must be constructed using only non-self-referential fields under §3.

Therefore the five-path prospective output manifest can validly precompute:

- complete R17 prospective content/blob;
- complete R18 prospective content/blob;
- complete R20 prospective content/blob;
- complete graph-delta prospective content/blob;
- complete landing-event prospective content/blob;

without needing to know the final landing tree or commit SHA in advance.

The final tree and commit are then deterministically created from those already-frozen blobs.

## 10. Disposition

`LANDING_EVENT_SELF_REFERENCE_DEFECT = CONFIRMED_AND_CORRECTED`

`FINAL_COMMIT_SHA_SELF_EMBEDDING = PROHIBITED`

`FINAL_TREE_SHA_SELF_EMBEDDING = PROHIBITED`

`FINAL_EVENT_BLOB_SHA_SELF_EMBEDDING = PROHIBITED`

`ACHIEVED_STATE_IDENTITY = POST_COMMIT_EXTERNAL_VERIFICATION`

`OPTIONAL_DURABLE_ACHIEVED_STATE_RECORD = SEPARATE_GOVERNED_POST_LAND_WRITE`

`FIVE_WRITER_LANDING_SET = UNCHANGED`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
