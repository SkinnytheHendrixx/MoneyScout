# Money Scout — Global Remediation Register — Freeze-Readiness Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL FREEZE-CANDIDATE REVIEW  
**Applies to:** `GLOBAL_REMEDIATION_REGISTER_FREEZE_READINESS_AUDIT_REVIEW_DRAFT.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the adversarial review of the seven freeze-readiness blockers.

The review confirmed FR-01, FR-03, FR-04, FR-05, FR-06, and FR-07 as sound; FR-02 remains sound on the successful landing path. It identified one additional failure-path blocker at the intersection of FR-01 and FR-02:

**FR-08 — POST-BCT failure does not explicitly restore the exact pre-landing certification/finding state.**

It also records one non-blocking liveness observation for PAIM contention.

No phase denominator changes. No semantic finding is added or reclassified.

## 2. FR-08 — failed POST-BCT requires atomic restoration of the pre-land control-plane state

**Severity:** BLOCKER

### Failure mode

The corrected FR-01 ordering necessarily lands the amendment before POST-BCT:

`AMENDMENT_LANDED_AND_INVALIDATION_COMMITTED`
→ changed root unstable
→ `POST_AMENDMENT_BCT`

The landing event atomically transitions affected findings and certifications away from their prior states. If POST-BCT then fails, the amended authority cannot remain current. The freeze-readiness draft anticipates rollback as a stability outcome, but it does not define what happens to the finding and certification transitions already committed with the amendment.

Without an explicit restoration protocol, the system could roll back the authority mutation while leaving:

- affected findings in `AMENDED_PENDING_RECHECK`;
- affected certifications in `INVALIDATED_BY_CHANGE[type]`;
- the candidate graph or consequential-surface inventory reflecting a failed amendment;
- root revision metadata implying an unstable change that no longer exists.

That would be a control-plane inconsistency even though the data/schema/code mutation itself was reverted.

## 3. Atomic landing transaction has two terminal outcomes

Every amendment landing is one logical transaction with one pre-land snapshot and exactly one terminal outcome.

### 3.1 Pre-land snapshot

Before mutation, persist an immutable `LANDING_PRESTATE` containing at minimum:

- node ID;
- PAIM revision;
- pre-land authority/document/config SHAs or revision IDs;
- pre-land physical/config root revisions;
- candidate-graph revision;
- Candidate Consequential Surface Inventory revision;
- dependency-register revision;
- target finding lifecycle states;
- every affected certification state and pinned evidence revision;
- shared-root lease identity;
- any edge states that will transition on landing;
- any NAME/provider/retention control-plane states that will transition on landing.

### 3.2 Successful outcome

If POST-BCT passes:

`LANDING_OUTCOME = COMMITTED_STABLE`

Then:

- amended authority remains current;
- affected findings remain `AMENDED_PENDING_RECHECK` until substantive rechecks close them;
- certifications remain `INVALIDATED_BY_CHANGE[type]` / `RECHECK_PENDING` until recertified;
- changed root advances to a new stable revision;
- shared-root writer lease releases into that stable revision;
- candidate edges may advance only according to their own trust-state rules;
- substantive rechecks may begin.

### 3.3 Failed outcome

If POST-BCT fails:

`LANDING_OUTCOME = ROLLED_BACK_POST_BCT_FAILURE`

The rollback must restore the exact pre-land control-plane state as one fail-closed logical transaction.

Required restoration:

1. revert the authority/schema/config/code mutation or restore the last known stable revision;
2. restore every target finding to its exact `LANDING_PRESTATE` lifecycle state;
3. restore every certification invalidated solely by this failed amendment to its exact pre-land state, normally `CURRENT_CERTIFIED` for the pinned pre-land evidence;
4. restore candidate-graph and consequential-surface inventory state to the pre-land revision except for an immutable historical record that the rejected amendment was attempted;
5. restore any edge trust states advanced solely by the failed landing;
6. do not advance shared-root stable revision;
7. release the shared-root mutation lease only after the restored root revision is verified identical/equivalent to the pinned pre-land stable root;
8. record immutable failure evidence and POST-BCT contradiction details;
9. set the remediation node to a failure/rework state such as `POST_BCT_FAILED_REWORK_REQUIRED`, not `MAY_CLOSE` and not `RECHECK_PENDING`;
10. invalidate the failed amendment's PAIM for reuse; any revised amendment must rederive and refreeze PAIM-A/B/C.

### 3.4 Restoration scope rule

Only invalidations/transitions caused solely by the failed amendment are restored.

If another independently committed change occurred after the pre-land snapshot and legitimately invalidated the same certification, rollback may not resurrect it as current. Optimistic-concurrency and root/register revision checks therefore apply to rollback as well as landing.

If exact restoration cannot be proven because another committed change touched the same dependency universe, rollback enters:

`ROLLBACK_RECONCILIATION_REQUIRED`

and affected authority/certification remains fail-closed until the combined state is reconciled. It must never guess that a prior certification is current.

## 4. FR-01 / FR-02 corrected lifecycle with FR-08

The freeze-candidate lifecycle must use this order:

1. prerequisites evaluated;
2. PRE-BCT passed;
3. PAIM-A/B/C derived and frozen;
4. graph/consequential-surface derivation complete;
5. shared-root mutation lease acquired where applicable;
6. PAIM/revision pin revalidation passes;
7. `MAY_LAND = TRUE`;
8. `LANDING_PRESTATE` persisted;
9. amendment + finding transitions + certification invalidation + root-unstable transition committed atomically/fail-closed as `AMENDMENT_LANDED_AND_INVALIDATION_COMMITTED`;
10. POST-BCT executes;
11. exactly one branch occurs:
   - PASS → `COMMITTED_STABLE`; or
   - FAIL → atomic `ROLLED_BACK_POST_BCT_FAILURE` / `ROLLBACK_RECONCILIATION_REQUIRED`;
12. only after `COMMITTED_STABLE`, changed/new edge classification reaches the required trust state;
13. substantive targeted rechecks execute;
14. mechanical NAME/provider/retention gates complete where applicable;
15. `MAY_CLOSE = TRUE`;
16. finding closes or remains remediation-incomplete.

A failed POST-BCT never proceeds to substantive certification rechecks.

## 5. Atomicity invariant

The register freezes with this invariant:

> A reader may observe only a stable pre-amendment state, an explicitly unstable landed state whose prior certifications are already invalidated, a stable committed amended state, or a restored pre-amendment state. It may never observe amended authority with old-current certification, nor rolled-back authority with invalidations left behind solely by the rejected amendment.

Landing atomicity and rollback atomicity are two halves of the same control-plane transaction model.

## 6. Non-blocking operational note — PAIM contention/livelock

FR-04's `PAIM_STALE → REDERIVE → REFREEZE` mechanism is safety-correct but may experience liveness starvation when multiple amendment nodes repeatedly change overlapping pinned dependencies.

This is **not a freeze blocker** because it cannot authorize an unsafe landing; it can only delay progress.

Carry-forward operational consideration:

`PAIM_CONTENTION_LIVENESS_NOTE`

A future executor may introduce a deterministic contention policy, for example:

- stable priority by remediation node ID / dependency depth;
- first-valid-frozen-PAIM priority;
- bounded retry followed by serialized scheduling;
- explicit coordinator lease over a contended dependency set.

Any such policy must preserve FR-03/FR-04 safety and may not weaken pin revalidation.

## 7. Corrected blocker count

Freeze-readiness structural blockers are now:

- FR-01 lifecycle ordering;
- FR-02 atomic landing/invalidation;
- FR-03 pre-land shared-root writer lease;
- FR-04 PAIM/revision pinning;
- FR-05 candidate-edge trust states;
- FR-06 normalized canonical row schema;
- FR-07 exhaustive incorporation/supersession assignment;
- FR-08 atomic rollback/restoration on POST-BCT failure.

Total structural blockers: **8**.

FR-08 does not add a phase finding; it is a register-control-plane freeze blocker.

## 8. Disposition

`FREEZE-READINESS CORRECTIONS 1 ACCEPTED AS REVIEW OVERLAY / FR-08 ADDED / LANDING AND POST-BCT FAILURE NOW REQUIRE SYMMETRIC ATOMIC CONTROL-PLANE TRANSACTIONS / FAILED POST-BCT RESTORES PRE-LAND FINDING + CERTIFICATION + GRAPH + ROOT STATE OR ENTERS FAIL-CLOSED ROLLBACK RECONCILIATION / PAIM CONTENTION LIVELock NOTED AS NON-BLOCKING LIVENESS CONCERN / STRUCTURAL FREEZE BLOCKER COUNT = 8 / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
