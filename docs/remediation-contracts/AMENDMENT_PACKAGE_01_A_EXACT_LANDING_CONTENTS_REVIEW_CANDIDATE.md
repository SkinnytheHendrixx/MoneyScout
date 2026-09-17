# Amendment Package 01A — Exact Landing Contents Review Candidate

**Status:** REVIEW CANDIDATE / NON-AUTHORITATIVE / NO LANDING AUTHORITY  
**Target:** Amendment A — `RD-C-R17-R18`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact freezes no authority and changes no canonical writer surface.

Its purpose is to expose the exact proposed Amendment-A landing contents for adversarial review before any `MAY_LAND` decision. It provides literal candidate insertions for `WI-R17.md`, `WI-R18.md`, and `WI-R20.md`, plus exact templates for the immutable Amendment-A graph delta and landing/invalidation lifecycle event.

The five actual writer surfaces remain untouched until a separate positive landing authorization exists.

## 2. Governing constraints

The candidate text must preserve all previously accepted Amendment-A constraints:

- R17 owns Offer Version / charging Grant authority.
- R18 owns exact Capability Binding Snapshot identity and validation.
- R20 owns final boundary-time consumption of applicable predicates.
- Amendment A owns only the R17↔R18 exact same-path composition invariant.
- R19 lineage completeness remains Amendment B.
- H1-S09 continues to own unresolved checkout/payment compatibility semantics.
- no current/latest/default provider, provider-account, capability binding, Offer/Grant, or checkout configuration may substitute for the exact historical object.
- arbitrary-N materially consumed bindings remain representable and independently attributable.
- post-boundary truth remains owned by R8 and must not be rewritten.

## 3. Candidate R17 insertion

Add a new subsection after the existing provider/account DI-1 material and before unrelated downstream boundaries:

### R17/R18 commercial-payment composition invariant

For every consequential `CUSTOMER_CHARGING` execution whose commercial execution path depends on an R18-governed commercial-payment capability, the exact R17 Offer Version / charging Grant and the exact R18 Capability Binding Snapshot consumed by that execution must identify one coherent historical commercial-execution authority path.

For the commercial-payment scope materially consumed by the action:

1. the charging Grant must reference the exact Offer Version authorizing the action;
2. the execution must reference that exact Grant, not a current/successor Grant;
3. the execution must reference the exact R18 Capability Binding Snapshot frozen for the commercial-payment operation;
4. the R17 provider identity must equal the R18 bound provider identity;
5. the R17 exact provider-account identity must equal the R18 bound provider-account identity wherever account identity is materially relevant;
6. the R18 allowed operation scope must include the exact commercial action authorized by the R17 Grant;
7. where checkout/payment configuration identity materially determines provider/account execution authority, the eventual governing compatibility rule must be evaluated against the exact historical checkout/payment configuration and exact historical R18 binding rather than any current replacement;
8. the R18 validation consumed at the consequential boundary must refer to that same frozen binding identity, not merely the same capability key, provider family, or current provider/account projection;
9. where an R8 external-execution identity applies, the composed R17/R18 authority must remain attributable to that same exact execution or attempt.

This subsection does not define what checkout/payment configuration compatibility means. That definition remains owned by unresolved H1-S09. This subsection states only that whatever compatibility rule is eventually adopted must evaluate the exact historical configuration/binding pair rather than substitute current configuration.

Provider equality without provider-account equality is insufficient where account identity is materially relevant.

Capability-key equality without exact binding equality is insufficient.

Offer/Grant validity without exact R18 binding validity is insufficient, and exact R18 binding validity without the exact R17 Offer/Grant authority is insufficient.

A later/current Offer, Grant, capability binding, provider account, or checkout configuration must not retroactively satisfy an execution frozen under a different exact authority path. A governed successor path receives its own exact R17 and R18 authority objects under the ordinary R7/R8/R20 gates.

This composition rule consumes the already-canonical R17 `DI-1/COMMERCIAL_PAYMENT` provider/account identity semantics. It does not redefine provider identity, provider-account identity, credential continuity, or DI-1 activation scope.

## 4. Candidate R18 insertion

Add a new subsection after the existing provider/account identity and DI-1 material:

### Commercial-payment binding composition with R17

When an R18 Capability Binding Snapshot is materially consumed by a consequential `CUSTOMER_CHARGING` execution governed by R17 commercial authority, R18 must expose enough exact immutable binding identity for the execution and R20 to prove that the binding composes with the exact R17 Offer Version / charging Grant governing that same action.

The composition consumes R18's existing binding semantics. It does not create a second provider/account identity model.

For the materially consumed commercial-payment scope, the composed proof must preserve:

- exact `bindingId` or equivalent immutable binding fingerprint;
- exact bound provider identity;
- exact bound provider-account / tenant / organization / workspace identity where materially relevant;
- exact allowed operation scope;
- exact binding validation consumed at the boundary;
- exact execution/attempt attribution where R8 identity applies.

The provider and provider-account values used for this composition are the same identities already governed by R18's provider/account and DI-1 rules. Amendment A does not broaden, narrow, or redefine what counts as provider/account continuity, rebinding, or identity ambiguity.

If R17 and R18 identify different providers, different materially relevant provider accounts, incompatible operation scope, an unknown consequential account identity, or different exact binding history, the composition fails for that action.

R18 revalidation may confirm or reject the exact frozen binding. It may not replace it with a healthier current binding to make the R17/R18 composition pass.

Where checkout/payment configuration identity materially determines execution authority, R18 must preserve/reference the exact historical binding/configuration evidence needed by the eventual H1-S09 compatibility rule. R18 does not define that unresolved compatibility rule here.

## 5. Candidate R20 insertion

Add a new subsection immediately after the existing R17/R18 boundary discussions and before downstream lineage/adoption material:

### Consume exact composed R17/R18 commercial authority

For a consequential commercial boundary that consumes both R17 charging authority and an R18-governed commercial-payment capability, R20 must validate the relational R17/R18 composition predicate in addition to validating each upstream object individually.

It is insufficient for:

- the R17 Offer Version / charging Grant to be independently valid; and
- some R18 commercial-payment binding to be independently valid;

if those two predicates do not describe the same exact historical commercial-execution authority path.

For the applicable boundary, the R20 Boundary Decision must consume/reference enough exact evidence to establish:

- exact R17 Offer Version and charging Grant identity;
- exact R18 Capability Binding Snapshot identity or exact materially consumed binding set;
- equality of provider identity where required;
- equality of exact materially relevant provider-account identity;
- compatibility of allowed operation scope with the exact commercial action;
- the exact R18 validation decision consumed at this boundary;
- exact execution/attempt attribution where R8 identity applies;
- exact historical checkout/payment configuration identity where the eventual H1-S09 compatibility rule requires it.

Any unresolved mismatch, missing exact identity, account-continuity ambiguity, current-binding substitution, current-Offer/Grant substitution, or operation-scope mismatch makes this relational predicate unsatisfied before a not-yet-crossed consequential commercial boundary.

R20 does not redefine R17 provider/account identity or R18 binding identity. It consumes those upstream identities and evaluates whether their exact relational composition is satisfied now.

R20 also does not define H1-S09 checkout/payment compatibility semantics. It requires the eventual rule, where applicable, to operate on exact historical evidence rather than current replacement state.

If the external boundary already crossed or may have crossed, failure of the R17/R18 relational predicate does not rewrite R8 external truth. Corrective/reconciliation governance applies separately.

## 6. Literal G2-01 effect determination

Against the exact candidate wording in §§3–5:

`G2_A_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`

Reason:

1. R17 already establishes exact provider and provider-account identity as part of commercial authority and activates `DI-1/COMMERCIAL_PAYMENT`.
2. R18 already establishes exact provider/account identity, account-continuity proof, and rebinding semantics.
3. R20 already requires provider/account consistency and prohibits substitution of current provider/account state.
4. the candidate Amendment-A wording does not define a new provider identifier, account identifier, equality relation, continuity rule, or rebinding rule;
5. it adds only a relational composition requirement: the independently governed exact R17 and R18 identities must match on the same historical path.

Therefore Amendment A changes the evidence relationships/fan-out around provider/account identity but does not change G2-01's formal provider/account identity proposition itself.

Consequences:

- no unconditional G2-01 reclassification or invalidation is created solely by Amendment A;
- G2-01 remains open on its existing implementation/schema/wiring mechanisms;
- if adversarial review changes the candidate wording in a way that redefines provider/account identity or continuity, this determination becomes stale immediately and must be rerun before `MAY_LAND`.

## 7. Candidate graph-delta content

Proposed immutable landing path:

`docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`

The landing version must contain, at minimum:

- amendment node: `RD-C-R17-R18`;
- source PAIM freeze blob;
- exact landing commit identity;
- A-GE-01 → F07-04, `EVIDENCE_RECHECK_DEPENDENCY`;
- A-GE-02 → F07-03, `EVIDENCE_RECHECK_DEPENDENCY`;
- A-GE-03 → F07-09, `EVIDENCE_RECHECK_DEPENDENCY`;
- A-GE-04 → H2-E40, `REPRESENTATION_PREREQUISITE`, affected composed-authority-reference slice only;
- A-GE-05 → H2-E43, `REPRESENTATION_PREREQUISITE`, affected relational-validator-policy slice only;
- A-GE-06 → J-F04, `GOVERNANCE_PREREQUISITE`, conditional affected commercial-boundary enforcement slice;
- A-GE-07 → J-F05, `GOVERNANCE_PREREQUISITE`, conditional affected allow/deny/degradation fixture slice;
- A-GE-08 → RET-R17, `RETENTION_COMPATIBILITY_DEPENDENCY`;
- A-GE-09 → RET-R18, `RETENTION_COMPATIBILITY_DEPENDENCY`;
- A-GE-10 → XPI-04, `EVIDENCE_RECHECK_DEPENDENCY`;
- G2 disposition: `UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`;
- frozen negative fan-out: H2-E39, NAME-H2-E41, NAME-H2-E42, J-F01, J-F03, J-F06, RET-R20, F07-15;
- pre-land trust state for new/strengthened relationships: `CLASSIFIED_PENDING_LAND`;
- post-land/pre-recheck state where applicable: `EFFECTIVE_PENDING_RECHECK`;
- no edge becomes `CERTIFIED_CURRENT` solely because the amendment lands.

The frozen V4 register and canonical register-freeze artifact remain immutable and must not be edited in place.

## 8. Candidate landing/invalidation event content

Proposed immutable landing path:

`docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

The landing version must bind at least:

- unique `landing_attempt_id`;
- exact pre-land parent commit and tree;
- exact post-land commit and tree;
- exact five authorized writer paths;
- exact pre-land R17/R18/R20 blobs;
- exact post-land R17/R18/R20 blobs;
- frozen PAIM blob and reviewed pre-land artifact blobs;
- `landing_commit_status`;
- `precommit_abort_reason`;
- `precommit_abort_evidence_refs[]`;
- `writeset_expansion_discovery_phase`;
- `distributed_commit_mode = NOT_APPLICABLE / SINGLE_GIT_REF_TRANSACTION`;
- participant prepare state as not applicable to a multi-participant distributed commit;
- global commit identity = exact Git landing commit SHA;
- global outcome = successful non-forced advancement of `main` to that exact commit;
- mandatory invalidation/recheck scope: affected Phase-C classification, F07-03, F07-04, F07-09, XPI-04;
- changed future-acceptance scope: H2-E40, H2-E43, J-F04, J-F05, RET-R17, RET-R18;
- G2 disposition = unchanged formal provider/account proposition;
- Candidate Consequential Surface direct effect = NONE;
- runtime writer roots = none;
- POST-BCT state initially pending after successful landing;
- rollback prestate references sufficient for FR-08 restoration if POST-BCT later fails.

A rejected non-forced ref transition must not create a successful landing event. It records/produces the fail-closed `REF_UPDATE_REJECTED_STALE_PARENT` attempt outcome separately and requires full re-derivation before any new attempt.

## 9. Exact five-surface writer manifest

If eventually authorized, the Amendment-A landing transaction may change exactly:

1. `docs/remediation-contracts/WI-R17.md`
2. `docs/remediation-contracts/WI-R18.md`
3. `docs/remediation-contracts/WI-R20.md`
4. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

It must not change `WI-R19.md`, the frozen V4 register, the canonical register freeze artifact, runtime/schema/provider files, ROOT-1, ROOT-2, ROOT-3, or any other path.

Any need for a sixth writer surface makes this candidate writer manifest stale and revokes any later `MAY_LAND` authorization until re-derived/reviewed.

## 10. Review questions

The adversarial reviewer should answer at least:

1. Does any literal insertion above redefine G2 provider/account identity, equality, continuity, or rebinding rather than merely compose existing identities?
2. Does R17 duplicate R18 ownership instead of referencing R18 exact binding identity?
3. Does R18 accidentally create lineage ownership that belongs to Amendment B/R19?
4. Does R20 require the exact relational predicate without redefining upstream identities?
5. Does the checkout-config clause remain a no-substitution rule while leaving H1-S09 unresolved?
6. Does the R20 wording accidentally create a RET-R20 historical backfill requirement?
7. Is any new direct dependency missing from the graph-delta template?
8. Is any listed negative fan-out no longer defensible under the literal text?
9. Does the five-writer manifest remain sufficient once these exact insertions are used?
10. Does the landing-event template contain enough exact prestate/poststate data to support FR-08 restoration without reconstructing history from current state?

## 11. Current disposition

`EXACT_LANDING_CONTENTS = DRAFTED_FOR_REVIEW`

`G2_A_EVIDENCE_EFFECT = PROVISIONALLY_UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION / PENDING ADVERSARIAL_REVIEW`

`FIVE_WRITER_MANIFEST = REVIEW_CANDIDATE`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
