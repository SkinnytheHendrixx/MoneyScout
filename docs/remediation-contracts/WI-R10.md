# WI-R10 — Exact Artifact Identity Through Build, QA, Release, and Asset Adoption

**Normalized node:** R10  
**Historical finding:** `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R10 recovery from the confirmed material still available in the project record. It preserves only obligations that can be recovered with high confidence and does not regenerate missing historical finding IDs, migration ordinals, fixture labels/order, audit classifications, or closure-evidence numbering from compressed summaries.

Where exact historical text is unavailable, the gap is marked explicitly rather than inferred.

## 2. Frozen root and mission

R10 exists because the system must preserve the exact identity of the artifact produced by Build through QA, Release, deployment, and final Asset adoption.

A passing QA result for artifact P does not authorize release of artifact Q. A release record for artifact P does not authorize an Asset to claim artifact Q is what was deployed. Rebuilding equivalent source does not silently preserve identity unless authoritative equivalence has been established under the governing contract.

> **The exact artifact that is built, verified, released, deployed, and adopted must remain one provable lineage, not a sequence of mutable “current” references.**

## 3. Canonical Artifact Version identity

Recovered R10 semantics require a durable Artifact Version / Verified Artifact Identity capable of proving, at minimum where applicable:

- exact Build identity;
- exact R9 Build Source Snapshot / source commit authority;
- immutable artifact identity, with Git SHA as a minimum source-linked anchor where Git is the source of truth;
- artifact/package/image/bundle digest or equivalent immutable runtime identity where deployment material differs from source;
- deterministic materialization provenance where relevant;
- Product Definition and Architecture lineage inherited from the Build;
- exact QA verification linkage;
- exact Release linkage;
- exact production deployment/adoption linkage;
- timestamps and provenance sufficient to prove which immutable artifact each stage consumed.

The representation may differ by artifact type, but the system must be able to prove exact identity across every consequential transition.

## 4. Builder → QA identity preservation

QA must verify the exact artifact produced by the governed Build.

The system must not:

- verify “the latest build” after the Build record has already frozen a different artifact;
- resolve a mutable branch/tag/reference in place of the exact built artifact;
- treat a rebuilt artifact as identical merely because source inputs look equivalent;
- attach a passing QA result to an artifact other than the one actually tested.

> **QA authority attaches to the exact tested artifact, not to a logical product name or current repository state.**

## 5. QA → Release identity preservation

Release may consume only the exact Artifact Version whose QA state satisfies the governing release policy.

A passing QA result for P cannot be reused to release Q.

If a rebuild produces P2, P2 receives a new artifact identity unless authoritative deterministic-equivalence semantics establish otherwise under a separately governed rule. Mere source similarity, matching branch, matching version label, or operator belief is insufficient.

## 6. Preview and production identity

Recovered R10 semantics prefer preview and production to preserve the same exact verified artifact P where the deployment architecture permits it.

If production requires a rebuild or transformation, the resulting production material must have its own immutable identity plus provable lineage back to the verified artifact/source authority. The system must not collapse “derived from” into “is the same artifact.”

A production deployment whose observed artifact differs from the authorized expected artifact must fail closed for adoption until the discrepancy is resolved.

## 7. Asset adoption identity

An Asset must record the exact production Artifact Version / deployment identity actually adopted.

A current release pointer, current branch, current image tag, or “latest successful deployment” is not sufficient historical authority.

The Asset must be able to answer:

- which exact Artifact Version was authorized for production;
- which exact artifact/provider deployment was observed in production;
- whether expected and observed identities match;
- which Build Source Snapshot and Evaluation Lineage ultimately produced that artifact.

## 8. Deterministic materialization

Where the system claims that a derived artifact is deterministically materialized from an immutable source artifact, that claim must itself be provable.

Determinism may preserve lineage, but it does not erase identity boundaries. If multiple immutable representations exist, each representation must remain distinguishable while preserving the provable transformation chain.

The exact original deterministic-materialization criteria, if more detailed than this recovered invariant, are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

## 9. R9 boundary

R9 answers which exact immutable source was authorized to be built.

R10 answers which exact artifact was actually built from that authority and then verified, released, deployed, and adopted.

> **R9 source authority is necessary but not sufficient for R10 artifact identity.**

A valid Build Source Snapshot does not prove that QA, Release, or production consumed the resulting intended artifact.

The hard chain remains:

`R4 → R9 → R10 → R17 → R19 → R20`

## 10. R8 boundary

R8 external-execution truth and R10 artifact identity are distinct.

A provider may report that a deployment call succeeded, but R10 must still prove what exact artifact was expected and what exact artifact became the deployment/adoption candidate.

Likewise, an artifact may have a valid immutable identity while the provider-side deployment outcome remains uncertain under R8.

Expected artifact identity and observed external execution outcome must not be collapsed into one field.

## 11. R7 boundary

Build, QA, repair, packaging, release, deployment, verification, or artifact-inspection work that consumes scarce resources remains subject to R7 admission.

R10 artifact identity creates no resource authority, and a valid R7 reservation does not prove artifact identity or QA lineage.

Any recovery/re-verification burst required to prove exact artifact lineage remains governed by aggregate R7 limits.

## 12. R11 boundary

If QA or release discovers that the exact artifact fails, the resulting corrective obligation must preserve the exact artifact identity and failure evidence.

R11 owns the executable successor/corrective obligation. R10 must not mutate the failing artifact’s historical record into the repaired one.

A repair that produces a new artifact creates a new Artifact Version / identity and must receive its own QA and release lineage.

## 13. R14 replacement / handoff boundary

Runtime replacement must not silently change artifact identity.

If an incumbent believes production should contain P while the successor observes Q, the system must preserve both expected and observed identities and block unsafe adoption until the mismatch is resolved.

Recovered governing scenario:

> **Expected P / observed Q mismatch blocks adoption; handoff cannot “normalize” Q into P merely because the replacement runtime is now authoritative.**

## 14. R17 commercial boundary

R17 Offer Version authority must bind to the exact production artifact/release identity governed by R10.

A commercial offer must not rely on “current Asset,” “latest deployment,” or mutable release state when the customer-facing authority was established against a specific artifact/version.

If artifact P is replaced by P2, commercial continuity requires the governing R17 equivalence/successor rules rather than a silent current-pointer substitution.

## 15. R20 boundary-time revalidation

R20 later determines whether the exact R10 artifact lineage remains eligible at each consequential boundary/adoption point.

R10 provides the immutable object/lineage identity. R20 decides whether that exact identity may still be consumed now.

A historically valid artifact remains historical truth even if later authority changes make it ineligible for new adoption.

## 16. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R10:** NO

R10 artifact identity may include provider/deployment identity as provenance, but generic artifact lineage does not itself authorize substitution across provider/accounts. If a future implementation allows artifact verification or deployment identity to substitute one provider/account for another in a consequential authority path, DI-1 activates at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R10:** NO

R10 governs artifact lineage, not autonomous refunds/cancels/voids/reversals. DI-2 activates only in a future scope where an economic reversal itself is dispatched externally.

The exact original DI wording, if more specific, should be source-checked during review.

## 17. Known migration surfaces recoverable from record

The available record confirms R10 migration scope includes, at minimum:

- canonical Artifact Version / Verified Artifact Identity schema;
- Builder output persistence;
- QA input and QA-result linkage;
- repair/rebuild artifact handling;
- Controlled Release preview identity;
- Controlled Release production identity;
- deployment/provider artifact linkage;
- Asset production-version/adoption state;
- downstream commercial consumers that currently use mutable/current release references;
- legacy Builds/Releases/Assets whose exact artifact identity is incomplete;
- semantic audit of all “latest/current” substitutions where exact artifact identity should already exist.

The original migration labels, numbering, and full per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 18. Semantic sibling sweep

Search for patterns including:

- QA verifies one artifact while Release consumes another;
- Release uses “latest passing build” instead of exact QA-bound artifact;
- production rebuild occurs but keeps the same artifact identity without authoritative equivalence proof;
- mutable image tags/branch names/version labels stand in for immutable artifact digests;
- preview and production identity are conflated without proof;
- Asset records only current deployment rather than immutable production artifact history;
- expected artifact P / observed Q mismatch is overwritten or normalized;
- repair mutates the original artifact record rather than creating a successor Artifact Version;
- passing QA status copied forward to a rebuilt artifact;
- R17 offer/commercial state points to current Asset instead of exact R10 artifact/release lineage;
- legacy artifact identity reconstructed from current deployment state;
- downstream consumer can no longer prove which exact Build Source Snapshot produced the adopted artifact.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 19. Acceptance semantics recoverable from source

At minimum, R10 closure must eventually prove:

- exact Build output identity is persisted immutably;
- QA consumes and verifies that exact artifact;
- passing QA for P cannot authorize Release of Q;
- rebuild P2 receives new identity unless authoritative equivalence is proved;
- preview/production identity is exact and transformation lineage is preserved where they differ;
- Asset adoption records the exact production artifact/deployment identity;
- R8 technical execution truth remains distinct from R10 expected/observed artifact identity;
- R11 repair produces a successor artifact rather than mutating failed history;
- expected P / observed Q replacement-handoff mismatch blocks adoption;
- R17 binds commercial authority to exact R10 production artifact/release lineage;
- the R4→R9→R10→R17→R19→R20 hard chain remains intact.

Original fixture labels/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 20. Start / local closure / E2E dependency result

### START

R10 contract/schema work may proceed once R9's immutable source/Build identity interface is sufficiently stable to link Build output to exact source authority. R7/R8 may proceed in parallel but remain required for consequential execution paths.

### LOCAL CLOSURE

R10 may locally close when canonical Artifact Version identity, Builder→QA→Release→Asset propagation, rebuild/repair successor semantics, deterministic materialization lineage, legacy handling, known migrations, audit children, and the final sibling sweep are complete.

R17/R19/R20 need not be locally closed for R10 artifact identity to exist, but downstream commercial/adoption certification remains pending until the hard chain composes correctly.

### E2E

Final certification must compose with at least R4, R7, R8, R9, R11, R14, R17, R19, and R20 where relevant.

## 21. Explicit non-goals

R10 must not:

- redefine R9 source authority;
- infer provider-call success/failure, which belongs to R8;
- grant scarce-resource authority, which belongs to R7;
- treat passing QA for one artifact as authority for a different artifact;
- mutate old artifact history to represent a repair/rebuild;
- treat mutable tags/branches/current pointers as immutable Artifact Version authority;
- infer commercial equivalence for R17 merely because two artifacts appear similar;
- silently normalize expected P / observed Q deployment mismatch;
- let current deployment state manufacture historical artifact identity.

## 22. Source gaps and assurance status

The following original R10 details are not yet recoverable from the available record and are not being invented:

1. exact historical finding ID;
2. exact migration child labels and ordinals;
3. exact audit name/classification vocabulary if separately frozen;
4. exact acceptance-fixture labels/order;
5. exact closure-evidence list;
6. exact deterministic-equivalence/materialization criteria if more detailed than the recovered invariant;
7. exact amendment/rejected-alternative wording beyond the invariants preserved above;
8. any original worked examples or repository/provider path specifics not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R11, but it does not restore R10 implementation authority.

## 23. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
