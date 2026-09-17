# Money Scout — Freeze Candidate — Corrections 4

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL FREEZE  
**Applies to:** normalized freeze candidate + Freeze-Readiness Corrections 1 + Freeze-Candidate Corrections 2–3  
**Implementation authority:** SUSPENDED  
**Remediation authority:** SUSPENDED

## 1. Purpose

This overlay closes one remaining ambiguity in the distributed/fail-closed landing protocol established by FR-02, FR-08, FR-09, and Freeze-Candidate Corrections 3.

The single-store atomic case is already complete: pre-commit interruption aborts as never-landed; post-commit/pre-stability failure uses FR-08 restoration. The distributed case additionally needs an explicit rule for a participant that has entered a prepared state but cannot determine whether the coordinator globally committed or aborted.

This is not FR-10 and does not add a phase finding. It completes the failure grammar of FR-02.

## 2. INT-FC4-01 — prepared participant with indeterminate global outcome fails closed

### Failure mode

A distributed landing protocol can reach a state where one or more participants have durably prepared their mutation/invalidation work, but the global commit decision is unavailable to that participant because coordinator state or communication is unavailable.

In that state, a participant cannot safely infer either outcome:

- unilateral commit risks exposing a partial landing if the global decision was abort;
- unilateral abort/release risks discarding a committed landing if the global decision was commit.

Therefore local guessing is prohibited.

### Required state

Introduce:

`PREPARED_GLOBAL_OUTCOME_INDETERMINATE`

A participant in this state MUST:

1. treat the amendment as non-consumable/current;
2. preserve its prepared state and immutable participant evidence;
3. retain every writer lease or equivalent exclusion necessary to prevent conflicting mutation of the prepared roots;
4. not publish a stable root revision;
5. not restore certifications to `CURRENT_CERTIFIED`;
6. not advance findings/rechecks/closure;
7. not unilaterally commit;
8. not unilaterally abort or compensate;
9. attempt authoritative recovery of the exact global landing decision and commit identity;
10. if authoritative recovery cannot establish the global outcome, transition the control-plane landing to `ROLLBACK_RECONCILIATION_REQUIRED` and require governed/manual reconciliation while remaining fail closed.

### Recovery outcomes

If the exact global decision is recovered as **ABORT**:

- complete the FR-02 pre-commit abort/compensation path;
- prove exact pre-land visible-state equality before releasing prepared state/leases;
- landing attempt remains never-landed.

If the exact global decision is recovered as **COMMIT**:

- complete the exact previously-authorized commit identity; do not synthesize a new landing attempt;
- reach `COMMITTED_UNSTABLE_POST_BCT_PENDING` only after every required participant is proven consistent with that same commit identity;
- then continue under POST-BCT/FR-08 rules.

If the global decision remains unprovable:

- state remains fail closed under `ROLLBACK_RECONCILIATION_REQUIRED`;
- no participant may resolve uncertainty by policy guess, timeout alone, current-state reconstruction, or majority inference unless a later canonical distributed-commit protocol explicitly establishes such a recovery mechanism and proves its authority.

## 3. Lease and observability invariant

Prepared participants in an indeterminate global-outcome state are intentionally blocking.

They may not release the mutation lease merely to improve liveness. The lease is released only after one of:

- authoritative ABORT recovery + verified prestate restoration;
- authoritative COMMIT recovery + globally consistent committed state followed by the normal stability lifecycle;
- separately governed reconciliation that establishes an equivalent safe resolution and records a new canonical decision.

This is a safety rule. Coordinator availability, timeout, fairness, and automated recovery are liveness concerns and may be improved later without weakening this invariant.

## 4. Normalized schema additions

Amendment-bearing distributed-capable rows gain/require:

- `distributed_commit_mode`
- `participant_prepare_states[]`
- `global_commit_identity`
- `global_commit_outcome_status`
- `global_outcome_recovery_evidence_refs[]`

Allowed `global_commit_outcome_status` values:

- `NOT_APPLICABLE`
- `NOT_STARTED`
- `PREPARING`
- `PREPARED_AWAITING_GLOBAL_DECISION`
- `PREPARED_GLOBAL_OUTCOME_INDETERMINATE`
- `GLOBAL_ABORT_CONFIRMED`
- `GLOBAL_COMMIT_CONFIRMED`
- `ROLLBACK_RECONCILIATION_REQUIRED`

A participant's local prepare/commit record is never sufficient by itself to prove the global outcome.

## 5. Corrected timing grammar

The full landing interruption grammar is now:

1. **Before distributed/single-store commit begins:** ordinary pre-land failure; no landing exists.
2. **During atomic landing before any global commit decision:** failure/write-set expansion causes FR-02 abort as never-landed.
3. **Distributed participant prepared but global decision indeterminate:** enter `PREPARED_GLOBAL_OUTCOME_INDETERMINATE`; hold state/leases; recover exact decision; no unilateral commit/abort.
4. **Global commit confirmed, POST-BCT pending:** state is committed-but-unstable; FR-08 governs safety failure/restoration.
5. **Stable commit:** future write-set changes are new amendment events.

No legitimate observable state permits a subset of mutation/invalidation participants to be treated as current.

## 6. Denominators and blocker accounting

No phase denominator changes.

No FR-10 is created.

FR-01 through FR-09 remain the structural blocker set. This overlay is a precision completion of FR-02's distributed atomicity/fail-closed semantics.

## 7. Disposition

`FREEZE-CANDIDATE CORRECTIONS 4 / DISTRIBUTED PREPARED PARTICIPANT WITH UNKNOWN GLOBAL OUTCOME FAILS CLOSED / NO UNILATERAL COMMIT OR ABORT / PREPARED STATE + WRITER LEASES RETAINED UNTIL AUTHORITATIVE GLOBAL DECISION OR GOVERNED RECONCILIATION / INDETERMINATE GLOBAL OUTCOME MAPS TO ROLLBACK_RECONCILIATION_REQUIRED / NO NEW FREEZE BLOCKER OR PHASE FINDING / IMPLEMENTATION AND REMEDIATION AUTHORITY REMAIN SUSPENDED`
