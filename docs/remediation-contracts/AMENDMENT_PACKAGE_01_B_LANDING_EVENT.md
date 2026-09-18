# Amendment Package 01B — Landing / Invalidation Event

**Status if present on `main`:** AMENDMENT_B_LANDED / POST_BCT_PENDING  
**Amendment node:** `RD-C-R19-R18`  
**Landing transaction class:** SINGLE_GIT_REF_TRANSACTION  
**Candidate Consequential Surface direct effect:** NONE

## 1. Landing identity and authority basis

- landing attempt descriptor: `AP01B-R19-R18-SEQUENTIAL-B`
- B PAIM canonical freeze blob: `a5232c61493f69e8e4c09c9f1dc86617c1767ebf`
- B PRE-BCT refresh blob: `fe837e905da657be024d1ea88f0cadf0e882b1ef`
- B revalidation-against-landed-A blob: `351b0da3d8b62ef53165991a0018376038bffe97`
- B graph/PAIM Corrections 1 blob: `156163d175a5c5075ff73f0478760016fbaccb35`
- landed A targeted-recheck blob: `668189fe5c1bf5ffca9f82051adb92f8749a32c6`

This event is authoritative only if it becomes current through the exact successful non-forced `main` ref transition of the governed four-path B landing commit. Prepared blobs, trees, or commits are not authority.

## 2. Exact authorized writer manifest

Exactly four paths may differ from the landing commit's direct parent:

1. `docs/remediation-contracts/WI-R18.md`
2. `docs/remediation-contracts/WI-R19.md`
3. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_B_GRAPH_DELTA.md`
4. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_B_LANDING_EVENT.md`

Any fifth changed path invalidates the landing.

## 3. Exact authority prestate and prospective poststate

Pre-land authority blobs:

- R18: `6bbd89816146c145c79eb2edd15bdca1a5f65d44`
- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R20 unchanged premise: `abd865614ee70cc35b6068b46626ef306d100080`

Frozen prospective post-land blobs:

- R18: `f5b889e4e62904167864403165b799b0e1cdeaee`
- R19: `fc20ac3042845957959079bc7dedf1e68671175b`
- graph delta: `7e5828ba702e7d5fb94c080b913d9e73cc48170a`

The landing-event file intentionally does not embed its own blob SHA, the final landing tree SHA, final landing commit SHA, or eventual direct parent commit/tree. Those repository identities are verified externally after the actual non-forced ref transition.

## 4. R20 writer-exclusion and G2 dispositions

- `B_R20_DIRECT_WRITE_REQUIRED = NO`
- `G2_B_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_LINEAGE_PROPOSITION`
- `AMENDMENT_B_DIRECT_CANDIDATE_CONSEQUENTIAL_SURFACE_EFFECT = NONE`
- runtime shared-root writer set: none

R20 exclusion remains valid only while the literal B wording merely strengthens R19 completeness inside R20's pre-existing generic commitment to consume exact complete R19 lineage and introduces no independent R20-owned predicate.

## 5. Atomic landing/invalidation effect

If and only if the exact four-path non-forced branch transition succeeds, the following become current as one logical B landing event:

- Amendment B canonical semantic authority becomes current in R18/R19;
- `RD-C-R19-R18` transitions to `AMENDED_PENDING_RECHECK`;
- B-GE-01 through B-GE-05 become effective under the graph-delta states;
- changed-evidence certification/recheck scope becomes active for affected Phase-C classification, F07-05, F07-18 unconditionally, and affected XPI-04;
- changed future-acceptance scope becomes active for RET-R18 and RET-R19;
- G2 recheck remains evidence-driven and is not triggered if literal wording preserves the adjudicated premise;
- POST-BCT becomes required before targeted substantive rechecks;
- no representation/source/retention finding closes and no certification is restored merely because the landing succeeds.

## 6. Representation dependencies preserved

The landing does not claim or imply closure of:

- `F06-02` — exact R18 execution↔binding attachment/validation representation;
- `F01-02` — complete immutable R19 lineage representation;
- `F01-01` — R19 cardinality/arbitrary-N representation;
- `F05-03` — R17 Grant representation, materially relevant transitively;
- `F02-01` — Boundary Decision identity representation;
- applicable source/provider prerequisites;
- RET-R18 or RET-R19 durability.

## 7. Precommit failure states

A rejected or unproven ref transition means Amendment B is not landed.

The named stale-parent outcome is:

`REF_UPDATE_REJECTED_STALE_PARENT`

On any unsuccessful or ambiguous ref update:

- no authority transition is inferred;
- no finding transition is inferred;
- no certification invalidation is inferred current;
- no graph activation is inferred current;
- no same-attempt rebase, cherry-pick, or retry-on-new-head is permitted;
- full pre-land re-derivation is required before any new attempt.

## 8. Post-commit verification requirements

After a reported successful non-forced ref update, externally verify before POST-BCT:

- `main` points to the prepared landing commit;
- the landing commit's direct parent equals the freshly pinned pre-ref `main` tip;
- that parent resolves to the freshly pinned parent tree;
- changed-path set equals exactly the four authorized paths;
- R18/R19 path blobs equal the frozen prospective post-land blobs above;
- graph-delta path blob equals `7e5828ba702e7d5fb94c080b913d9e73cc48170a`;
- landing-event path resolves to the prepared event blob created from this exact content;
- R20 remains exactly `abd865614ee70cc35b6068b46626ef306d100080`;
- all other non-authorized paths are inherited unchanged from the parent tree.

If any verification fails, do not proceed to POST-BCT; enter fail-closed reconciliation/rollback governance appropriate to the observed state.

## 9. POST-BCT and rollback

Initial state after verified landing:

`POST_BCT = PENDING`

If POST-BCT fails after successful landing, rollback requires restoration of the exact B-amendment-caused prestate and proof of equality before rollback is complete.

Prestate is recoverable from:

- the landing commit's externally verified direct parent and parent tree;
- the pre-land R18/R19 blobs embedded above;
- proof that B graph-delta and B landing-event paths were absent at the parent;
- the exact four-path landing diff.

If independent committed changes make exact restoration impossible, enter:

`ROLLBACK_RECONCILIATION_REQUIRED`

and do not infer prior certifications current.

## 10. Sequential-A premise

B's landing depends on the currently stable A semantic authority.

A's lifecycle finding need not be CLOSED for B's semantic landing, but the exact A semantic rule consumed by B must remain current and unchanged in the reviewed sense at execution time.

If the landed A proposition changes materially before B landing, B authorization becomes stale and must be revalidated.

