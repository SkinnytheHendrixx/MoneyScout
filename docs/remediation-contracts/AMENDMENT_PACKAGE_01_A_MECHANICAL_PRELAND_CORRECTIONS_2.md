# Amendment Package 01A — Mechanical Pre-Land Corrections 2

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL INCORPORATED INTO FINAL PRE-LAND PACKAGE  
**Target:** Amendment A — `RD-C-R17-R18`  
**Prior correction:** `AMENDMENT_PACKAGE_01_A_MECHANICAL_PRELAND_CORRECTIONS_1.md`  
**MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay resolves a review-sequencing dependency in the prospective Amendment-A landing event.

Corrections 1 correctly prohibited the landing-event file from embedding identities that depend on its own final content: final event blob SHA, landing tree SHA, and landing commit SHA.

A separate issue remains if the event file embeds the eventual direct pre-land parent commit/tree: those values are knowable before a particular landing attempt, but they are not stable while governance/review artifacts are still being committed to `main`. Precomputing the landing-event blob before the last review write would therefore make the event blob stale whenever `main` advances.

## 2. Corrected prestate binding

The final landing-event file MUST NOT require literal embedding of the eventual direct pre-land parent commit SHA or parent tree SHA.

Instead, exact prestate is bound through:

1. the exact pre-land R17/R18/R20 blob SHAs embedded in the event;
2. the exact authorized writer-path set embedded in the event;
3. the actual landing commit's Git parent pointer, verified externally after the non-forced ref transition;
4. external verification that the landing commit's parent is the exact `main` tip pinned immediately before ref advancement;
5. external resolution of that parent commit to its tree SHA;
6. post-commit comparison proving that all non-authorized paths are inherited unchanged from that parent tree.

The Git commit object itself is the canonical binding to the exact pre-land repository state. The event file need not redundantly predict that parent before all review/governance writes are complete.

## 3. Why this is stronger for prospective blob freezing

With direct parent/tree removed from the event's internal required fields, all five writer-surface contents can be fully determined before the final landing parent is selected.

The final sequence becomes:

1. review and freeze the five writer contents/blobs;
2. complete remaining governance gates;
3. fetch fresh current `main` as parent `P` and tree `T`;
4. revalidate frozen pins and path nonexistence against `P/T`;
5. create the landing tree from `T` using the already-frozen five output blobs;
6. create commit `C` with exact parent `P`;
7. advance `main` non-forced to `C`;
8. externally verify `C.parent == P`, parent tree = `T`, and changed paths = exactly the five authorized paths.

No writer blob changes merely because the final parent changes before the landing attempt.

## 4. FR-08 rollback consequence

FR-08 restoration remains fully determined.

The exact rollback prestate is recoverable from:

- landing commit `C`'s verified direct parent `P`;
- parent tree `T`;
- event-embedded pre-land blobs for R17/R18/R20;
- proof that the two new paths did not exist at `P`;
- exact five-path landing diff.

Rollback does not require the event file to self-report `P` or `T`.

If `C.parent` does not equal the parent pinned immediately before ref advancement, landing verification fails and the amendment must not proceed to POST-BCT.

## 5. Corrected landing-event internal fields

The prospective landing-event file may contain:

- `landing_attempt_id` or deterministic attempt descriptor not derived from final Git object IDs;
- amendment/package identity;
- exact authorized five-path writer manifest;
- exact pre-land R17/R18/R20 blobs;
- exact prospective post-land R17/R18/R20 blobs;
- exact graph-delta blob;
- frozen PAIM/review artifact blobs;
- G2 disposition;
- Candidate Consequential Surface classification;
- intended invalidation/recheck transition;
- intended graph-state transition;
- concurrency/failure-state vocabulary;
- POST-BCT initial state = pending contingent on successful landing;
- FR-08 restoration rules.

It must not embed:

- final landing-event blob SHA;
- final landing tree SHA;
- final landing commit SHA;
- eventual direct parent commit SHA;
- eventual direct parent tree SHA.

Those repository-state identities are achieved-state or final-attempt facts verified externally.

## 6. Consequence for the five-path prospective manifest

The next five-path manifest can now be genuinely exact:

- all five complete file contents can be constructed;
- all five Git blob SHAs can be created/pinned before final `MAY_LAND`;
- later review/governance commits do not invalidate those blob identities;
- the eventual landing parent/tree remains a separate last-moment concurrency input rather than a field inside one of the frozen writer blobs.

## 7. Disposition

`LANDING_EVENT_FINAL_PARENT_SELF_EMBEDDING = NOT_REQUIRED`

`LANDING_EVENT_PARENT_TREE_SELF_EMBEDDING = NOT_REQUIRED`

`PRESTATE_REPOSITORY_IDENTITY = VERIFIED_FROM_ACTUAL_LANDING_COMMIT_PARENT`

`FIVE_PROSPECTIVE_WRITER_BLOBS_CAN_BE_FROZEN_BEFORE_FINAL_PARENT_SELECTION = YES`

`FIVE_WRITER_LANDING_SET = UNCHANGED`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
