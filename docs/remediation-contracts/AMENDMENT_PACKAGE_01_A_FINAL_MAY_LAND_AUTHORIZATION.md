# Amendment Package 01A — Final MAY_LAND Authorization

**Status:** FINAL PRE-LAND AUTHORIZATION / AMENDMENT A MAY_LAND  
**Target:** Amendment A — `RD-C-R17-R18`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**G2 effect:** FINAL / `UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`  
**Empirical concurrency gate:** PASSED  
**Prospective five-writer outputs:** FROZEN / REVIEWED  
**AMENDMENT_A_MAY_LAND:** YES  
**Implementation authority:** REMAINS SUSPENDED EXCEPT FOR THIS EXACT GOVERNED AMENDMENT-A LANDING TRANSACTION

## 1. Purpose

This artifact records the independent final pre-land authorization for Amendment A after every required substantive, graph, writer, rollback, concurrency, and current-state gate has been satisfied.

This authorization is narrow. It authorizes only the exact five-path Amendment-A landing transaction already reviewed and frozen. It does not authorize Amendment B, runtime/schema/provider implementation, application behavior changes, finding closure, certification restoration, or general implementation authority.

## 2. Post-evidence repository/configuration state

Immediately before this authorization, direct verification established:

- current `main` head: `820fb143ac325e152b1f5a0ef8bda0040d220b3a`;
- current `main` tree: `80d20411f5273743b536bb7a18b9adac294b3092`;
- branch protected: `false`;
- branch-protection enabled: `false`;
- required-status-check enforcement: `off`;
- required status-check contexts/checks: none reported.

This head/tree is an authorization checkpoint, not a reserved landing parent. The actual landing procedure must re-read and pin the then-current `main` parent/tree immediately before constructing/updating the final ref.

## 3. Current frozen/control-plane pins

The following were revalidated immediately before authorization and remain exact:

- frozen V4 register: `b7d163024464a6c9f069eef68b17d1b54a4e8f71`;
- canonical register freeze: `0e6e3bb794f15bf137f5c40afbfd604808717008`;
- PAIM canonical freeze: `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`;
- R17 pre-land blob: `16a234e897fe6e119392707a7187a3232f0fd972`;
- R18 pre-land blob: `226d67276f1627c26045ead9c7717023e7e764db`;
- R19 evidence/sequencing blob: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`;
- R20 pre-land blob: `d9d7788e4c5a8f4c0914cf845294b38386470333`;
- five-path prospective output manifest: `e76501a146a4c81702b725c5d181b7b0fa27ee0e`;
- empirical ref-serialization evidence: `0d94af9af7988c55090c7577f693afc7c731d91e`.

No governing premise is stale at this authorization checkpoint.

## 4. Empirical concurrency gate

The bounded stale-sibling test passed on this repository/connection.

Verified evidence:

- `P_test = d1bd4c959b1b1c70c885491cf3ffc93ca75f6039`;
- `C1 = ca492acd61f45ace094b0f5e932c5ec0070ead13`;
- `C2 = eb796225b130a7ce922244b34b804689f1eb6181`;
- `C1.parent == C2.parent == P_test`;
- branch advanced to C1;
- non-forced C2 update returned GitHub HTTP 422, `Update is not a fast forward`;
- final test-branch tip remained C1.

Therefore:

`NON_FORCED_REF_UPDATE_STALE_SIBLING_REJECTION = EMPIRICALLY_CONFIRMED`

The server-side non-forced fast-forward check is accepted as the decisive repository serialization primitive for this governed landing.

## 5. Exact authorized prospective outputs

The only authorized post-amendment blobs are:

- R17: `5baa5c9cd16b16766b5bce6fd2950eace834da61`;
- R18: `6bbd89816146c145c79eb2edd15bdca1a5f65d44`;
- R20: `abd865614ee70cc35b6068b46626ef306d100080`;
- graph delta: `aa951b782e413765a567c5ceb4e856b5e65d6302`;
- landing event: `21faf23fdaade375bcc4faa79e2bd714a96256a8`.

No substitution, regenerated wording, reformatted variant, additional writer, or silent blob replacement is authorized.

## 6. Exact authorized writer set

Exactly these five paths may change relative to the final landing parent:

1. `docs/remediation-contracts/WI-R17.md`
2. `docs/remediation-contracts/WI-R18.md`
3. `docs/remediation-contracts/WI-R20.md`
4. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

No sixth path is authorized.

In particular, this authorization does not permit writes to:

- `WI-R19.md`;
- frozen register artifacts;
- runtime/schema/provider/application paths;
- ROOT-1 / ROOT-2 / ROOT-3;
- test evidence branch;
- any customer-facing surface.

## 7. Gate disposition

The final authorization determination is:

- semantic proposition: PASS;
- PRE-BCT: PASS;
- PAIM: PASS/FROZEN;
- graph-effect derivation: PASS;
- Candidate Consequential Surface: PASS / direct effect NONE;
- writer-set review: PASS;
- G2 effect determination: PASS;
- H1-S09 ownership boundary: PASS;
- negative fan-out: PASS;
- FR-08 rollback model: PASS;
- self-reference/sequencing corrections: PASS;
- exact five-path prospective output review: PASS;
- empirical concurrency serialization: PASS;
- post-evidence current-state/pin verification: PASS;
- landing-only path nonexistence: PASS at authorization checkpoint.

Therefore:

`AMENDMENT_A_MAY_LAND = YES`

## 8. Execution-time conditions

This authorization is automatically stale and MUST NOT be exercised if, immediately before landing, any of the following fail:

1. fresh `main` parent/tree cannot be read;
2. any frozen/control-plane/authority/evidence pin differs from the authorized values;
3. R17/R18/R20 pre-land blobs differ;
4. R19 evidence/sequencing blob differs in a way that changes the reviewed premise;
5. either new landing-only path already exists;
6. branch/configuration state changes in a way material to the reviewed landing protocol;
7. any prospective output blob differs from the five authorized blobs;
8. a sixth writer becomes necessary;
9. the five-path tree cannot be constructed exactly from the fresh parent tree;
10. the non-forced ref update cannot be used exactly as reviewed.

If any condition fails:

`MAY_LAND_AUTHORIZATION = STALE`

and the landing must abort before ref movement and return to governed re-derivation/review.

## 9. Authorized landing protocol

If all execution-time conditions remain satisfied:

1. fetch fresh current `main` as parent `P` and tree `T`;
2. revalidate every authorization pin and both landing-path nonexistence checks;
3. construct one new tree `T'` from exact base tree `T` using exactly the five authorized blob/path mappings;
4. verify the resulting tree differs from `T` only at those five paths;
5. create one commit `C` with direct parent `P` and tree `T'`;
6. optionally re-read `main == P` as an early stale-attempt check;
7. execute `update_ref(main, C, force=false)`;
8. if rejected or ambiguous, enter `REF_UPDATE_REJECTED_STALE_PARENT` or the appropriate fail-closed precommit outcome; do not retry/rebase/cherry-pick within the attempt;
9. if successful, externally verify `main == C`, `C.parent == P`, exact five-path diff, exact five output blobs, and unchanged non-authorized paths;
10. only after that verification enter `LANDED_UNSTABLE_POST_BCT_PENDING` and proceed to POST-BCT.

## 10. Post-land state

A successful landing does not close `RD-C-R17-R18`.

Immediate successful state is:

`RD-C-R17-R18 = AMENDED_PENDING_RECHECK`

`POST_BCT = PENDING`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`

Affected certifications/relationships remain invalidated or pending recheck according to the reviewed graph delta and lifecycle rules.

Amendment B remains unauthorized until Amendment A becomes stable/current and B is revalidated under the frozen sequential protocol.

## 11. Final authorization

`AMENDMENT_A_MAY_LAND = YES`

`MAY_LAND_BLOCKER_COUNT = 0`

`AUTHORIZED_TRANSACTION = EXACT_FIVE_PATH_AMENDMENT_A_LANDING_ONLY`

`GENERAL_IMPLEMENTATION_AUTHORITY = SUSPENDED`

`NEXT_STATE_IF_LANDING_SUCCEEDS = LANDED_UNSTABLE_POST_BCT_PENDING`
