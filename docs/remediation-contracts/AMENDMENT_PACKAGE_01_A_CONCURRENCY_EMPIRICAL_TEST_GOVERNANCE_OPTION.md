# Amendment Package 01A — Concurrency Empirical Test Governance Option

**Status:** GOVERNANCE OPTION / NO TEST AUTHORITY GRANTED  
**Target infrastructure control:** non-forced GitHub ref-update serialization used by governed amendment landings  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**Amendment A MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact separates empirical verification of the repository-level concurrency mechanism from Amendment A's own landing authorization.

The pre-land review currently requires empirical confirmation that two sibling commits created from one parent cannot both become current through non-forced advancement of the same GitHub branch. The required mechanism is shared infrastructure for this and future governed amendment landings.

The existing review correctly refused to create a test branch without authority merely because the mutation appeared harmless. This artifact records a third governance option: grant a one-time, narrowly bounded authorization for the empirical infrastructure test itself, independent of any amendment `MAY_LAND` decision.

This artifact does not grant that authorization.

## 2. Why a separate authorization is coherent

The proposed test does not amend R1–R20 authority, land Amendment A or B, close findings, invalidate certifications, change runtime/schema/provider behavior, or restore implementation authority.

Its only purpose is to verify a repository serialization primitive on which future governed landing transactions rely.

Treating the test as a separate governance action preserves the existing rule that no repository mutation occurs merely because it is thought to be low-risk, while avoiding indefinite reliance on documented-but-unexecuted API semantics.

## 3. Proposed bounded authority

If explicitly approved, the authorization would permit exactly one isolated concurrency test with all of the following boundaries:

1. create one clearly labeled disposable test branch whose name identifies it as remediation-control-plane verification only;
2. do not use or move `main`;
3. do not modify any canonical remediation, authority, audit, application, schema, runtime, provider, or customer-facing path;
4. create one test parent `P_test` and two distinct sibling commits `C1` and `C2` whose only content is inert test evidence;
5. advance the test branch non-forced from `P_test` to `C1`;
6. attempt a non-forced update of that same branch to stale sibling `C2`;
7. require the second update to fail server-side;
8. read back the branch tip and require it to remain `C1`;
9. pin branch name, `P_test`, `C1`, `C2`, API outcome, and observed final tip in an immutable evidence artifact on `main` only after normal governance review of that evidence write;
10. perform no retry that would weaken or alter the tested condition.

## 4. Cleanup limitation

The currently exposed connector can create branches but does not expose branch deletion.

Therefore approval must explicitly choose one of these dispositions:

### Option A — authorize a persistent labeled test branch

The branch remains in the repository as inert infrastructure-test evidence. It must never be treated as product, release, canonical audit, or amendment authority.

### Option B — require external/manual cleanup capability before execution

The test remains pending until an authorized mechanism exists to delete the disposable branch after evidence is captured.

The absence of cleanup capability must not be silently ignored after authorization.

## 5. Safety properties

Even if authorized, the test must remain outside Amendment A's landing transaction and must not be interpreted as granting `MAY_LAND`.

A successful test establishes only:

`NON_FORCED_REF_UPDATE_STALE_SIBLING_REJECTION = EMPIRICALLY_CONFIRMED_FOR_TESTED_GITHUB_REPOSITORY/CONNECTION`

It does not establish:

- correctness of Amendment A wording;
- completeness of its graph effects;
- correctness of its writer set;
- freshness of PAIM pins;
- success of its final G2 determination;
- authorization to land any amendment;
- implementation authority.

A failed or ambiguous test is a control-plane blocker and must be investigated before any landing relying on the mechanism.

## 6. Governance choices

Three honest choices now exist:

1. **Keep test pending** — no repository mutation; final `MAY_LAND` stays blocked on empirical evidence.
2. **Explicitly authorize one bounded test with persistent labeled branch** — accept the branch residue as controlled audit evidence.
3. **Explicitly authorize the test only once cleanup is available** — preserve strict disposability before execution.

No option may be inferred from silence.

## 7. Recommended disposition for review

Given that this concurrency primitive is intended to govern not just Amendment A but future remediation landings, a dedicated bounded authorization is a proportionate governance mechanism if the reviewer/owner accepts either the persistent-branch consequence or provides a cleanup path.

Until explicit approval exists:

`FAST_FORWARD_CONCURRENCY_EMPIRICAL_TEST = PENDING`

`TEST_BRANCH_CREATION_AUTHORITY = NOT_GRANTED`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
