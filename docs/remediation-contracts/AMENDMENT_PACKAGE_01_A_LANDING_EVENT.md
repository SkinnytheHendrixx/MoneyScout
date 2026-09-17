# Amendment Package 01A — Landing / Invalidation Event

**Status if present on `main`:** AMENDMENT_A_LANDED / POST_BCT_PENDING  
**Amendment node:** `RD-C-R17-R18`  
**Landing transaction class:** SINGLE_GIT_REF_TRANSACTION  
**Candidate Consequential Surface direct effect:** NONE

## 1. Landing identity and authority basis

- landing attempt descriptor: `AP01A-R17-R18-SEQUENTIAL-A`
- frozen PAIM blob: `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`
- exact landing-contents review candidate blob: `b47938b7b4a366072b74e39081ffcce3296d01b6`
- G2 final adjudication blob: `9c0d2a63f81ac3cc6bbf538a7c75bd1552f6c238`
- mechanical pre-land checkpoint blob: `59d9fd2bb0465b5fed3531587cd00a3685c64f33`

This event is authoritative only if it becomes current through the exact successful non-forced `main` ref transition of the governed five-path landing commit. Prepared blobs, trees, or commits are not authority.

## 2. Exact authorized writer manifest

Exactly five paths may differ from the landing commit's direct parent:

1. `docs/remediation-contracts/WI-R17.md`
2. `docs/remediation-contracts/WI-R18.md`
3. `docs/remediation-contracts/WI-R20.md`
4. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

Any sixth changed path invalidates the landing.

## 3. Exact authority prestate and prospective poststate

Pre-land authority blobs:

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R18: `226d67276f1627c26045ead9c7717023e7e764db`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

Frozen prospective post-land blobs:

- R17: `5baa5c9cd16b16766b5bce6fd2950eace834da61`
- R18: `6bbd89816146c145c79eb2edd15bdca1a5f65d44`
- R20: `abd865614ee70cc35b6068b46626ef306d100080`
- graph delta: `aa951b782e413765a567c5ceb4e856b5e65d6302`

The landing-event file intentionally does not embed its own blob SHA, the final landing tree SHA, final landing commit SHA, or eventual direct parent commit/tree. Those identities are verified externally from the actual Git commit after ref advancement.

## 4. G2 and consequential-surface dispositions

- `G2_A_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`
- `AMENDMENT_A_DIRECT_CANDIDATE_CONSEQUENTIAL_SURFACE_EFFECT = NONE`
- runtime shared-root writer set: none

## 5. Atomic landing/invalidation effect

If and only if the exact five-path non-forced branch transition succeeds, the following become current as one logical landing event:

- Amendment A canonical semantic authority becomes current in R17/R18/R20;
- `RD-C-R17-R18` transitions to `AMENDED_PENDING_RECHECK`;
- A-GE-01 through A-GE-10 become effective under the graph-delta states;
- changed-evidence certification/recheck scope becomes active for affected Phase-C classification, F07-03, F07-04, F07-09, and XPI-04;
- changed future-acceptance scope becomes active for H2-E40, H2-E43, J-F04, J-F05, RET-R17, and RET-R18;
- POST-BCT becomes required before targeted substantive rechecks;
- no finding closes and no certification is restored merely because the landing succeeds.

## 6. Precommit failure states

A rejected or unproven ref transition means Amendment A is not landed.

The named stale-parent outcome is:

`REF_UPDATE_REJECTED_STALE_PARENT`

On any unsuccessful or ambiguous ref update:

- no authority transition is inferred;
- no finding transition is inferred;
- no certification invalidation is inferred current;
- no graph activation is inferred current;
- no same-attempt rebase, cherry-pick, or retry-on-new-head is permitted;
- full pre-land re-derivation is required before any new attempt.

## 7. Post-commit verification requirements

After a reported successful non-forced ref update, externally verify before POST-BCT:

- `main` points to the prepared landing commit;
- the landing commit's direct parent equals the freshly pinned pre-ref `main` tip;
- that parent resolves to the freshly pinned parent tree;
- changed-path set equals exactly the five authorized paths;
- R17/R18/R20 path blobs equal the frozen prospective post-land blobs above;
- graph-delta path blob equals `aa951b782e413765a567c5ceb4e856b5e65d6302`;
- landing-event path resolves to the prepared event blob created from this exact content;
- all non-authorized paths are inherited unchanged from the parent tree.

If any verification fails, do not proceed to POST-BCT; enter fail-closed reconciliation/rollback governance appropriate to the observed state.

## 8. POST-BCT and FR-08

Initial state after verified landing:

`POST_BCT = PENDING`

If POST-BCT fails after successful landing, FR-08 requires restoration of the exact amendment-caused prestate and proof of equality before rollback is complete.

Prestate is recoverable from:

- the landing commit's externally verified direct parent and parent tree;
- the pre-land R17/R18/R20 blobs embedded above;
- proof that graph-delta and landing-event paths were absent at the parent;
- the exact five-path landing diff.

If independent committed changes make exact restoration impossible, enter:

`ROLLBACK_RECONCILIATION_REQUIRED`

and do not infer prior certifications current.
