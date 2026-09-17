# Money Scout — Freeze Candidate — Corrections 3

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL FREEZE  
**Applies to:** `GLOBAL_REMEDIATION_REGISTER_FREEZE_CANDIDATE_NORMALIZED_REVIEW_DRAFT.md` + Freeze-Readiness Corrections 1 + Freeze-Candidate Corrections 2  
**Implementation authority:** SUSPENDED  
**Remediation authority:** SUSPENDED

## 1. Purpose

This overlay resolves one timing ambiguity discovered during adversarial review of the cross-blocker interaction between FR-02 atomic landing and FR-09 multi-root write-set discovery.

The prior controls correctly covered:

- pre-land writer-root discovery/acquisition;
- successful atomic landing;
- failed POST-BCT rollback after a fully committed unstable landing;
- fail-closed rederivation if an additional mutation root is discovered after landing begins.

They did not explicitly distinguish a new-root discovery that occurs **during the atomic landing transaction before commit** from one discovered **after the atomic landing transaction has committed**.

This overlay closes that timing boundary without creating a tenth freeze blocker or new phase finding.

## 2. INT-FC3-01 — in-transaction write-set expansion requires atomic pre-commit abort

### Problem

FR-02 defines landing as one logical fail-closed transaction containing:

- amendment mutation;
- finding transition;
- certification invalidation;
- root instability transitions;
- candidate-edge transitions;
- immutable landing event identity.

FR-09 states that discovery of an unanticipated writer root after landing begins forces fail-closed stop, PAIM-C expansion, refreeze/revalidation, and ordered reacquisition.

The phrase `after landing begins` is broader than the POST-BCT rollback window governed by FR-08.

A new required writer root can theoretically be discovered while the FR-02 landing transaction is still executing but before its commit boundary. That case must never produce an observable partial landing state.

### Required timing split

There are exactly two governed discovery windows after `MAY_LAND`:

#### Window A — before `AMENDMENT_LANDED_AND_INVALIDATION_COMMITTED`

If execution discovers a previously-unlisted writer root, write-set expansion, or mutation dependency **before the atomic landing transaction commits**:

1. stop mutation of the newly discovered root;
2. abort the entire in-progress landing transaction atomically;
3. none of the transaction's partial effects may become externally/currently observable;
4. authority/config state remains exactly at `LANDING_PRESTATE`;
5. findings retain their pre-land lifecycle states;
6. certifications retain their pre-land certification states;
7. candidate graph / consequential-surface / candidate-edge states retain their pre-land values;
8. no root receives a new stable or unstable revision from the aborted transaction;
9. the attempted `landing_event_id` is recorded only as `ABORTED_BEFORE_COMMIT` audit evidence and never as a landed amendment;
10. held writer leases are released only after prestate equality is verified;
11. node enters `PRECOMMIT_WRITESET_EXPANSION_REDERIVATION_REQUIRED`;
12. PAIM-C expands to include the newly discovered root/dependency;
13. PAIM-A/B/C and all pins are rederived/refrozen as required;
14. the full writer-root set is canonicalized and reacquired under FR-09's total order;
15. a fresh landing attempt receives a new landing-attempt identity.

This is an **atomic abort**, not an FR-08 rollback, because no landed state ever became current.

#### Window B — after `AMENDMENT_LANDED_AND_INVALIDATION_COMMITTED`

If the additional root requirement is discovered only after the atomic landing transaction has committed and the node is already `LANDED_UNSTABLE_POST_BCT_PENDING`:

- the landed amendment is not allowed to mutate the new root;
- POST-BCT/landing stability cannot succeed on an incomplete write set;
- FR-08's rollback/restoration mechanism governs reversal to `LANDING_PRESTATE` where concurrency-valid;
- after verified rollback, PAIM-C expands and the ordered full root set is reacquired before any new landing attempt;
- if exact restoration cannot be proven, state becomes `ROLLBACK_RECONCILIATION_REQUIRED` and remains fail-closed.

### No third observable state

The control plane recognizes no legitimate state between:

- clean pre-land state;
- fully committed `LANDED_UNSTABLE_POST_BCT_PENDING`;
- `COMMITTED_STABLE`;
- verified rollback/restoration;
- fail-closed rollback reconciliation.

A partially applied landing is never a valid observable state.

## 3. FR-02 atomicity contract is broadened

FR-02 now explicitly covers **both successful commit and pre-commit interruption**.

The atomicity invariant is:

> Every landing attempt is indivisible at its commit boundary. Before commit, any failure or write-set expansion aborts as though the landing never occurred. After commit, any safety failure uses FR-08 restoration. No consumer may observe a subset of landing sub-effects as current authority.

This applies regardless of whether the physical implementation uses one database transaction or a fail-closed distributed commit protocol.

For a distributed protocol, amended authority remains non-consumable until all mutation + invalidation participants acknowledge the same commit identity. Failure before global commit must produce abort/compensation that preserves the exact pre-land visible state.

## 4. FR-09 interaction clarified

FR-09's `newly discovered mutation root after landing begins` rule is refined:

- **pre-commit discovery** → FR-02 atomic abort + PAIM/root-set rederivation;
- **post-commit/pre-stability discovery** → FR-08 rollback + PAIM/root-set rederivation;
- no lock upgrade is permitted in either case;
- no newly discovered root may be mutated until the complete ordered writer-root set has been reacquired under a fresh validated PAIM.

This preserves FR-09's lock-order safety while making its timing semantics complete.

## 5. Normalized schema additions

For amendment-bearing objects, add/require:

- `landing_attempt_id`
- `landing_commit_status`
- `precommit_abort_reason`
- `precommit_abort_evidence_refs[]`
- `writeset_expansion_discovery_phase`

Allowed `landing_commit_status` values:

- `NOT_STARTED`
- `IN_PROGRESS_NOT_COMMITTED`
- `ABORTED_BEFORE_COMMIT`
- `COMMITTED_UNSTABLE_POST_BCT_PENDING`
- `COMMITTED_STABLE`
- `ROLLED_BACK_AFTER_COMMIT`
- `ROLLBACK_RECONCILIATION_REQUIRED`

Allowed `writeset_expansion_discovery_phase` values:

- `NOT_APPLICABLE`
- `PRE_LAND`
- `DURING_ATOMIC_LANDING_PRECOMMIT`
- `POST_COMMIT_PRE_POST_BCT_STABILITY`
- `POST_STABLE_COMMIT`

A write-set expansion discovered after stable commit is a **new amendment event**, not an extension of the old landing transaction.

## 6. Cross-blocker interaction result

The clarified composition is:

`FR-04 PAIM/ROOT DISCOVERY`
→ `FR-03 PRE-LAND LEASE REQUIREMENT`
→ `FR-09 CANONICAL MULTI-ROOT ORDER + ALL-OR-NOTHING ACQUISITION`
→ `FR-02 ATOMIC LANDING`

Then:

- pre-commit interruption/write-set expansion → `FR-02 ATOMIC ABORT`;
- committed-but-unstable contradiction/write-set expansion → `FR-08 ATOMIC RESTORATION`;
- only `COMMITTED_STABLE` permits substantive rechecks under FR-01.

No half-landed state is permitted at either timing boundary.

## 7. Denominators unchanged

This correction:

- adds no new primary finding;
- adds no FR-10;
- changes no C/F/G/H/I/J denominator;
- changes no semantic proposition;
- only completes the execution grammar of FR-02 + FR-08 + FR-09.

## 8. Disposition

`FREEZE-CANDIDATE CORRECTIONS 3 / FR-02 ATOMICITY EXTENDED TO PRE-COMMIT INTERRUPTION / NEW WRITER ROOT DISCOVERED DURING ATOMIC LANDING CAUSES INDIVISIBLE ABORT AS NEVER-COMMITTED / POST-COMMIT DISCOVERY REMAINS FR-08 ROLLBACK CASE / FR-09 REROUTES ONLY AFTER ABORT OR VERIFIED ROLLBACK / NO HALF-LANDED OBSERVABLE STATE / NO NEW FREEZE BLOCKER OR PHASE FINDING / IMPLEMENTATION AND REMEDIATION AUTHORITY REMAIN SUSPENDED`