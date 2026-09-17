# Amendment Package 01A — Empirical Non-Forced Ref Serialization Evidence

**Status:** EMPIRICAL TEST PASSED / REVIEW EVIDENCE / DOES NOT ITSELF GRANT MAY_LAND  
**Control under test:** GitHub non-forced branch-ref stale-sibling rejection  
**Authorized governance choice:** Option 2 — one persistent, clearly labeled inert test branch  
**Test branch:** `control-test/amendment-a-nonforced-stale-sibling-20260917`

## 1. Purpose

This artifact records the bounded empirical concurrency test authorized specifically to verify the repository serialization primitive intended for governed Amendment-A and future remediation landings.

The test was isolated from `main`, canonical remediation authority, runtime/schema/provider state, product code, and customer-facing paths.

The persistent test branch is inert control-plane evidence only.

## 2. Exact test baseline

`P_test = d1bd4c959b1b1c70c885491cf3ffc93ca75f6039`

`T_test = 613183f6da932f9dd646748090a59eb78dd68953`

Persistent branch created at `P_test`:

`refs/heads/control-test/amendment-a-nonforced-stale-sibling-20260917`

Test-only path:

`docs/remediation-contracts/control-tests/NONFORCED_STALE_SIBLING_TEST.txt`

No canonical landing writer path was used.

## 3. Sibling commit construction

Two distinct commits were created with the same direct parent `P_test`.

### C1

- commit: `ca492acd61f45ace094b0f5e932c5ec0070ead13`
- direct parent: `d1bd4c959b1b1c70c885491cf3ffc93ca75f6039`
- tree: `ddc13d60474ab8c60a5945a4bd96a1ac64417043`
- inert test blob: `07a09eb83e33eb6cca9cc53d25763ea12dc9d87e`

### C2

- commit: `eb796225b130a7ce922244b34b804689f1eb6181`
- direct parent: `d1bd4c959b1b1c70c885491cf3ffc93ca75f6039`
- tree: `96b67f7c05227d63db206e8b07e68c60bc224a66`
- inert test blob: `6601b82b912154bad8fd30904c07fa19ba0dfbba`

Therefore:

`C1.parent == C2.parent == P_test`

and C2 is a stale sibling of C1 rather than a descendant of C1.

## 4. First non-forced ref update

The test branch was advanced non-forced from `P_test` to `C1`.

A direct read of the Git ref after that update returned:

`refs/heads/control-test/amendment-a-nonforced-stale-sibling-20260917 -> ca492acd61f45ace094b0f5e932c5ec0070ead13`

Thus C1 became the actual current branch tip before the C2 attempt.

## 5. Stale-sibling C2 update outcome

A non-forced update of the same branch to stale sibling `C2` was then attempted.

Exact observed API failure:

`HTTP 422`

Exact GitHub server message:

`Update is not a fast forward`

Connector-observed error:

`INVALID_ARGUMENT: Error code: INVALID_ARGUMENT; Error: GitHub API error 422: {"message":"Update is not a fast forward","documentation_url":"https://docs.github.com/rest/git/refs#update-a-reference","status":"422"}`

This is direct server-side rejection evidence, not an inferred or client-only failure.

## 6. Final branch-tip verification

Immediately after the rejected C2 update, the Git ref was read again.

Observed final tip:

`ca492acd61f45ace094b0f5e932c5ec0070ead13`

Therefore:

`FINAL_TEST_BRANCH_TIP = C1`

`C2_DID_NOT_BECOME_CURRENT = YES`

The failed stale-sibling update left the branch in the expected state.

## 7. Empirical conclusion

The tested repository/connection exhibited the required serialization behavior:

1. two sibling commits shared one parent;
2. C1 advanced the branch successfully;
3. a later non-forced attempt to advance the same branch to stale sibling C2 was rejected by GitHub server-side as "not a fast forward";
4. the branch remained at C1 after rejection.

Accordingly:

`NON_FORCED_REF_UPDATE_STALE_SIBLING_REJECTION = EMPIRICALLY_CONFIRMED`

`SERVER_SIDE_FAST_FORWARD_CHECK = EMPIRICALLY_CONFIRMED_FOR_TESTED_REPOSITORY/CONNECTION`

`FINAL_STATE_AFTER_REJECTION = C1_PRESERVED`

## 8. Scope limits

This evidence establishes only the tested repository-level ref serialization primitive.

It does not establish:

- Amendment-A semantic correctness;
- PAIM completeness;
- graph completeness;
- G2 correctness;
- writer-set correctness;
- freshness of future landing pins;
- success of the actual Amendment-A landing;
- POST-BCT success;
- finding closure;
- certification restoration;
- implementation authority.

Those remain governed independently.

## 9. Branch disposition

The test branch is intentionally persistent under the explicitly authorized Option-2 governance choice.

It must remain classified as:

`INERT_PERSISTENT_CONTROL_TEST_EVIDENCE`

It is not canonical remediation authority, a release branch, product code, or implementation authority.

## 10. Consequence for Amendment-A MAY_LAND gating

The empirical concurrency evidence gate is now satisfied subject to independent review of this artifact and one fresh post-evidence pin/path/configuration sweep.

This artifact does not itself change:

`AMENDMENT_A_MAY_LAND = NO`

A separate independent adjudication must confirm all other gates remain current after this evidence write before MAY_LAND can become YES.
