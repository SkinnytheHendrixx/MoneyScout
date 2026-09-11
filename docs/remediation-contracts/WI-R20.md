# WI-R20 — Boundary-Time Consequential Authority Revalidation

**Normalized node:** R20  
**Historical finding:** C5-F2  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R20 recovery from the confirmed material still available in the project record. R20 is the capstone boundary-time authority node. It composes exact authority objects and historical lineage produced by upstream nodes, but it does not redefine those objects locally.

R20 consumes, where applicable:

- R3 current-enough evidence and freshness truth;
- R4 exact Evaluation Cycle lineage;
- R6 capability readiness;
- R7 resource reservation/admission authority;
- R8 exact external-execution truth;
- R9 immutable source authority;
- R10 exact artifact identity;
- R14 runtime-handoff authority state;
- R17 exact Offer Version / commercial authority object;
- R18 exact capability binding and binding lifecycle;
- R19 complete immutable commercial lineage;
- R11 corrective ownership where a failed eligibility decision requires a durable successor obligation.

Where exact historical migration ordinals, fixture labels/order, boundary-registry field names, audit vocabulary, or closure-evidence numbering are unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R20 exists because authority that was valid earlier can become invalid before the consequential boundary is crossed or before an external result is adopted.

> **No consequential action may rely on authority merely because that authority was valid at an earlier checkpoint. The exact predicates that make the action legal must be revalidated at the exact boundary where authority is consumed.**

R20 therefore owns current eligibility, not object identity or historical lineage.

The core separation is:

- **R17:** what commercial authority object exists;
- **R19:** where that authority came from and which exact immutable lineage it belongs to;
- **R20:** whether that exact authority may be consumed **now**.

> **Identity tells us what authority exists. Lineage tells us where it came from. Boundary fencing tells us whether it may be consumed now.**

## 3. Three-phase authority consumption

Recovered R20 semantics distinguish three phases:

- `PREFLIGHT`
- `BOUNDARY_VALIDATION`
- `ADOPTION_VALIDATION`

These phases are not interchangeable.

### 3.1 `PREFLIGHT`

Preflight is an early rejection/diagnostic opportunity. It may fail fast before scarce work is attempted, but it is not sufficient authority for a later consequential boundary.

A preflight pass can become stale.

### 3.2 `BOUNDARY_VALIDATION`

Immediately before crossing a consequential external/customer/provider boundary, the system must revalidate the exact current predicates required for that operation.

If validation fails before the boundary, the operation must not dispatch.

### 3.3 `ADOPTION_VALIDATION`

After an external operation has executed, the result may still require a separate current-eligibility check before Money Scout adopts that result into authoritative state, customer-visible behavior, financial release, lifecycle transition, or another consequential downstream state.

> **Boundary crossing and result adoption are separate authority consumptions.**

An operation can remain historically real under R8 while its result is no longer eligible for adoption.

## 4. Boundary decisions are exact and operation-specific

R20 must not reduce all consequential eligibility to one generic `isAuthorized` boolean.

Different boundaries require different predicates.

Examples include:

- provider dispatch;
- customer checkout/charge;
- production release;
- adoption of an external provider result;
- release of reserved headroom;
- activation of an Asset/commercial Offer;
- runtime handoff completion;
- renewal/recurring commercial action;
- economic reversal where later implemented.

A boundary validator must know which exact authority object, lineage, capability binding, resource reservation, lifecycle state, evidence set, and adoption target it is evaluating.

> **There is no safe generic authorization bit for heterogeneous consequential boundaries.**

## 5. Revalidate the bound lineage, never substitute current state

R20 revalidates current eligibility of the **exact bound authority/lineage**. It does not repair an ineligible historical object by substituting whatever is current now.

Examples:

- stale Evaluation Cycle A is not replaced with current Cycle B;
- Offer O1 is not replaced with current Offer O2;
- Artifact P1 is not replaced with current P2;
- provider/account A is not replaced with current provider/account B;
- frozen R19 Commercial Authority Lineage Reference L1 is not replaced with current lineage L2.

If the exact bound authority is no longer eligible, the operation fails closed or routes to a governed successor path.

> **Freshness revalidates the bound lineage. It never authorizes identity substitution.**

## 6. Required predicate families

For a consequential boundary, R20 must revalidate all predicate families applicable to that exact action.

Recovered families include:

- authority/grant validity;
- exact lifecycle state;
- exact R7 resource/reservation eligibility;
- exact R6/R18 capability readiness and binding validity;
- R3 evidence freshness/current applicability where current-condition evidence is required;
- exact R4/R9/R10/R17/R19 lineage completeness and integrity;
- provider/account identity consistency;
- revocation/supersession state;
- adoption-specific eligibility;
- runtime authority epoch / replacement state where R14 applies;
- any policy-specific kill/pause/master-mode/scoped-override condition inherited from canonical Fund/authority layers.

Not every boundary consumes every predicate, but every applicable predicate must be identified explicitly rather than assumed.

## 7. R18 boundary — exact binding must still be valid

R18 supplies the exact capability binding. R20 decides whether that exact binding is still eligible at the consequential boundary.

Recovered predispatch R18 outcomes include:

- `BINDING_VALID`
- `EXPIRED`
- `REVOKED`
- `QUARANTINED`
- `RETIRED`
- `DEPRECATED_DISALLOWED`
- `DEGRADED_INSUFFICIENT`
- `PROVIDER_ACCOUNT_MISMATCH`
- `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`
- `BINDING_IDENTITY_UNKNOWN`
- `BINDING_CONFLICT`
- `REVALIDATION_UNRESOLVED`

A previously verified binding that is now invalid cannot be replaced silently with another binding merely because the logical capability remains available.

Predispatch invalidity means no dispatch. Post-boundary invalidity cannot erase R8 history; adoption must be separately governed.

## 8. R6 boundary — readiness evidence is necessary but not perpetual

R6 capability readiness proves a claim under its verification policy. R20 determines whether the exact required readiness evidence remains eligible at the boundary.

An earlier `AUTOMATION_READY` result is not perpetual authority if:

- verification expired;
- policy changed materially;
- the bound credential/account was revoked or replaced;
- required access degraded;
- a lifecycle state made the capability unusable;
- exact binding identity became unknown/conflicted.

R20 must consume the exact R6/R18 identity rather than rerouting through “some currently ready capability.”

## 9. R7 boundary — resource authority must still be valid

A resource reservation granted earlier does not permit execution if the governing authority facts required to consume it are no longer valid at the boundary.

R20 does not recreate R7 reservation arithmetic. It requires the exact reservation/authority state relevant to the action to remain eligible.

Examples of disqualifying changes can include:

- Master Mode / policy / scoped override changes;
- reservation invalidation or exhaustion;
- required aggregate scope no longer available;
- provider/account/resource-pool mismatch;
- authority lineage no longer matching the reserved operation.

R20 must not turn “reservation exists” into “dispatch is still legal.”

## 10. R3 boundary — evidence freshness is current-condition specific

Where a consequential decision depends on a current-condition fact, R20 must ensure the R3 evidence supporting that predicate is still current enough for the boundary being crossed.

A historically valid fact can remain true evidence of history while becoming insufficient for a current decision.

Example:

- 2023 pricing evidence may prove what pricing was in 2023;
- it does not silently prove 2026 pricing merely because it was fetched recently.

If required current applicability is stale or unknown, the action fails closed or creates the governed refresh/research obligation. R20 does not replace stale evidence with unsupported optimism.

## 11. R17 boundary — valid Offer Version is not perpetual commercial permission

R17 defines the exact Offer Version and charging Grant. R20 decides whether that exact authority is still eligible for this checkout/charge/adoption now.

An Offer may become ineligible because of:

- supersession;
- grant revocation;
- provider/account binding invalidation;
- lifecycle change;
- stale required evidence;
- resource authority change;
- current policy restriction.

Historical validity remains historical truth. It does not imply new-customer or new-adoption eligibility.

## 12. R19 boundary — complete lineage can still be currently ineligible

R19 proves the complete immutable historical authority path and supplies the frozen Commercial Authority Lineage Reference.

R20 consumes that exact lineage reference at the relevant boundary.

A complete lineage may still fail current eligibility.

Conversely, current eligibility cannot cure incomplete lineage by substituting newer/current identities.

> **Lineage completeness and current eligibility are independent predicates. Both are required.**

## 13. R14 boundary — handoff authority does not bypass current eligibility

A successor runtime becoming authoritative under R14 does not grant unconditional permission to execute every inherited obligation.

After handoff, each inherited consequential action still requires R20 boundary-time eligibility.

The successor must preserve the same exact R19/R8/R18/R7 identities and validate them under the new authority epoch where applicable.

Transfer ownership and execution eligibility remain separate authority consumptions.

## 14. R8 boundary — historical external truth survives failed adoption

If an external provider/customer boundary was crossed, R8 preserves what happened externally even if R20 later blocks adoption.

R20 must never rewrite external success into failure merely because adoption eligibility changed.

Examples:

- provider operation succeeded under O1, but O1 was superseded before adoption;
- deployment completed, but artifact/authority mismatch is discovered before adoption;
- external response arrived, but exact capability binding was revoked before authoritative use.

The system must preserve the external effect/history and separately represent that adoption is blocked.

> **External success and internal adoption eligibility are separate truths.**

## 15. Bad news propagates immediately; good news requires proof

Recovered cross-cutting R20 principle:

> **Bad news propagates immediately; good news requires proof.**

Revocation, supersession, quarantine, pause, invalidation, binding loss, authority regression, or other disqualifying state must block future consequential consumption as soon as the authoritative negative state is known.

By contrast, a return to eligibility requires affirmative proof under the governing validator. The system must not infer restored permission merely because a prior blocker disappeared from one local cache or because time passed.

## 16. Boundary-validation decisions are durable and non-reusable by default

A boundary decision must be recorded with enough provenance to establish:

- exact operation/boundary identity;
- exact authority object / lineage reference evaluated;
- applicable predicate set / validator policy version;
- observed predicate outcomes;
- decision time;
- decision result;
- evidence references/provenance where required.

A prior `ALLOW` decision is not perpetual permission for a later consequential action.

A new consequential boundary consumes a new current eligibility decision unless the governing policy explicitly defines a safe reusable scope and validity interval.

The exact decision schema remains source-unresolved unless restored during review.

## 17. Boundary registry

R20 requires a durable Boundary Registry or equivalent governing map that identifies consequential boundary classes and the predicates each one must revalidate.

The registry must prevent boundary-specific safety from being left to local worker judgment.

At minimum, each registered boundary needs enough information to determine:

- boundary type/name;
- consequential effect being authorized;
- required authority object(s);
- required lineage identity;
- required resource/capability/binding/evidence/lifecycle predicates;
- whether post-external-effect adoption validation is required;
- applicable validator/policy version;
- failure disposition class / R11 ownership path.

The exact original registry field names are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until confirmed.

## 18. A0 representability audit

Before R20 implementation can be considered locally complete, the system must prove that every required predicate can actually be represented and referenced at the boundary.

This is the recovered R20 **A0 representability audit**.

The audit must detect cases where current schemas cannot retain the exact identity needed for validation, including but not limited to:

- current/latest state standing in for exact lineage;
- missing provider/account binding identity;
- missing exact Offer Version / Grant;
- missing exact R9/R10 artifact lineage;
- missing reservation scope/linkage;
- missing freshness applicability;
- missing adoption target identity;
- missing runtime authority epoch where relevant.

A boundary cannot be certified merely because validator code exists if the schema cannot represent the exact thing being validated.

## 19. A1 full boundary audit

R20 also requires a full repository-wide **A1 boundary audit** of every consequential dispatch/adoption path.

For every boundary, classify whether it:

- already consumes a correct R20 decision;
- has an R20 defect requiring a durable migration child;
- is non-consequential and therefore outside R20;
- has unknown consequentiality/authority semantics requiring adjudication before exclusion.

`AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED` remains governing process discipline.

The audit must repeat after each migration wave until a complete semantic sibling sweep returns no new consequential boundary instance.

## 20. Consequential Authority Regression

A later recomputation, policy correction, newly surfaced historical fact, or lineage repair may prove that an already-executed consequential action lacked required authority at the moment it executed.

Recovered owned state:

`CONSEQUENTIAL_AUTHORITY_REGRESSION`

R20 must preserve:

- the historical action/effect;
- the authority state that existed when it executed;
- the corrected/recomputed truth;
- the fact that later authority or repaired lineage does not retroactively authorize the past action;
- the resulting durable remediation obligation.

> **Corrected truth may revise our understanding of history. It may not rewrite executed history into something that was authorized when it was not.**

R11 owns corrective disposition. Corrective ownership does not itself authorize another consequential action.

## 21. R11 boundary — corrective ownership is not execution authority

When an R20 boundary fails or authority regression is detected, R11 may own the corrective successor obligation.

That obligation is not itself permission to execute the corrective effect.

Any consequential remediation action must independently satisfy its own R20 boundary-time eligibility.

> **Corrective ownership is not execution authority.**

This prevents a blocked action from laundering authority through the mere creation of a repair/retry/replan obligation.

## 22. Pre-boundary, post-boundary, and post-effect behavior

R20 must preserve temporal ordering:

### Before boundary

If eligibility fails before the consequential boundary, do not dispatch.

### After boundary but before adoption

If the external effect already occurred but adoption is not yet authoritative, preserve R8/external history and block adoption when current predicates fail.

### After adopted/executed effect

If disqualifying truth is learned after the effect was already adopted/executed, preserve history, stop future authority as required, and create owned remediation/regression handling rather than pretending the prior effect did not happen.

> **Authority failure after an effect changes what may happen next. It does not erase what already happened.**

## 23. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES

R20 consumes exact provider/account identities from R18/R17/R19 where applicable. It must not satisfy a failed binding/account predicate by silently selecting another provider/account.

Where `DI-1/COMMERCIAL_PAYMENT` is active, R20 must revalidate that exact bound commercial provider/account scope.

Generic R20 does not create new provider/account substitution authority.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES

Generic R20 does not itself activate autonomous reversal authority.

If a future refund/cancel/void/reversal boundary is autonomous, DI-2 activates for that exact boundary. R20 then must validate the reversal's own authority, exact R8 execution identity, provider/account binding, commercial lineage, resource authority, and adoption/result handling rather than treating reversal as retroactive erasure.

## 24. Known migration surfaces recoverable from record

The available record confirms R20 migration scope includes, at minimum:

- canonical boundary-decision schema;
- Boundary Registry / boundary-class policy;
- preflight validation paths;
- provider/customer dispatch validation;
- adoption validation paths;
- R18 exact binding revalidation;
- R6 readiness revalidation where applicable;
- R7 reservation/resource authority validation;
- R3 freshness/current-applicability validation;
- R4/R9/R10/R17/R19 exact lineage consumption;
- R14 post-handoff inherited-work validation;
- R8 post-external-effect adoption separation;
- commercial checkout/charge/renewal boundaries;
- release/deployment/adoption boundaries;
- financial headroom-release/adoption boundaries where R20 predicates apply;
- authority-regression detection and R11 handoff;
- A0 representability audit;
- A1 complete consequential-boundary audit;
- semantic sibling sweep of all local `isAuthorized`/cached preflight/current-state authorization shortcuts.

Exact migration labels and ordinals remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless restored in source review.

## 25. Semantic sibling sweep

Search for patterns including:

- preflight pass reused as dispatch authority after time/state changes;
- generic `isAuthorized` boolean authorizes heterogeneous consequential operations;
- current/latest authority substituted for the exact bound identity;
- Offer O2 substituted when O1 becomes ineligible;
- provider/account B substituted when bound A becomes invalid;
- stale evidence used for a current-condition boundary;
- existing reservation treated as sufficient dispatch authority despite policy/lifecycle change;
- earlier `AUTOMATION_READY` treated as perpetual capability permission;
- revoked/quarantined/expired binding ignored because logical capability still exists;
- external success automatically adopted without post-boundary eligibility;
- failed adoption rewrites R8 external history;
- successor runtime executes inherited work without R20 revalidation;
- current eligibility used to repair incomplete R19 lineage;
- complete R19 lineage treated as perpetual permission;
- boundary validator exists but exact identity cannot be represented in schema;
- R20 failure creates an R11 obligation that then executes consequentially without a fresh boundary decision;
- negative state is delayed/ignored while positive restoration is inferred without proof;
- prior `ALLOW` decision reused for a later distinct consequential boundary;
- later authority backfill retroactively marks an earlier unauthorized effect as legitimate.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 26. Acceptance semantics recoverable from source

At minimum, R20 closure must eventually prove:

- `PREFLIGHT`, `BOUNDARY_VALIDATION`, and `ADOPTION_VALIDATION` remain distinct;
- every consequential boundary has an explicit registered predicate set rather than a generic authorization bit;
- exact bound lineage/authority is revalidated, never replaced with current state;
- applicable authority/lifecycle/resource/capability/binding/evidence/freshness predicates are checked at the boundary;
- R18 exact binding invalidity blocks predispatch action;
- R6 readiness cannot be consumed after its exact governing conditions are invalid;
- R7 reservation existence alone does not grant boundary authority;
- R3 stale/unknown current-condition evidence blocks when current applicability is required;
- R17 valid Offer identity is separate from current eligibility;
- R19 complete lineage is separate from current eligibility;
- R14 handoff does not bypass boundary-time validation;
- R8 external truth survives blocked adoption;
- bad news blocks immediately while restored good state requires proof;
- boundary decisions are durable, operation-specific, and not perpetually reusable;
- A0 proves exact predicate identities are representable;
- A1 inventories every consequential boundary and creates durable migration children for defects;
- `CONSEQUENTIAL_AUTHORITY_REGRESSION` preserves executed history and creates owned remediation;
- R11 corrective ownership never substitutes for a fresh R20 decision;
- pre-boundary failure blocks dispatch, post-boundary failure blocks adoption without erasing external history, and post-effect discoveries preserve history while stopping/repairing future authority.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 27. Start / local closure / E2E dependency result

### START

R20 contract/schema work may proceed once the exact authority identities and seams it consumes are sufficiently stable to define boundary predicates. Because R20 is a capstone, interface design can proceed before every upstream implementation is locally closed, but final certification cannot.

### LOCAL CLOSURE

R20 may locally close when boundary phases, exact operation-specific validators, Boundary Registry, durable decisions, exact-lineage revalidation, A0 representability audit, A1 consequential-boundary audit, authority-regression handling, known migration children, and final sibling sweep are complete.

Primitive existence is not closure. A validator library does not close R20 unless every consequential consumer has migrated or been explicitly audited out.

### E2E

Final R20 certification must compose with all applicable upstream authority nodes, especially:

- `R3 × R20`
- `R4 → R9 → R10 → R17 → R19 → R20`
- `R6 × R18 × R20`
- `R7 × R20`
- `R8 × R20`
- `R14 × R20`
- commercial/financial composition with R15/R16 where adoption or headroom consequences depend on those truths.

R20 is the capstone current-eligibility gate. Its completion does not by itself close upstream nodes whose own local obligations remain unresolved.

## 28. Explicit non-goals

R20 must not:

- redefine the authority objects owned by R4/R6/R7/R9/R10/R17/R18/R19;
- reconstruct exact lineage from current/latest state;
- treat preflight as permanent dispatch authority;
- replace boundary-specific predicates with one generic authorization flag;
- substitute a different provider/account when exact binding becomes invalid;
- erase R8 external truth because adoption is blocked;
- treat complete lineage as perpetual permission;
- treat current eligibility as a repair for incomplete lineage;
- let runtime handoff create unconditional inherited execution authority;
- let R11 corrective ownership act as execution permission;
- infer restored eligibility merely because a negative state disappeared locally;
- retroactively legitimize prior unauthorized effects with later authority/backfill;
- use current ineligibility to erase historical economic/external truth;
- activate autonomous refund/cancel/void/reversal authority merely by validating that such an action would be desirable.

## 29. Source gaps and assurance status

The following original R20 details remain not fully recoverable from the available record and are not being invented:

1. exact Boundary Registry schema and field names;
2. exact boundary-decision schema/storage representation;
3. exact boundary class names beyond the recovered phase semantics;
4. exact validator-policy field names/versioning representation;
5. exact migration child labels and ordinals;
6. exact audit classification vocabulary if separately frozen;
7. exact acceptance-fixture labels/order;
8. exact closure-evidence list;
9. exact worked scenarios beyond those recoverable above;
10. exact amendment/rejected-alternative wording beyond the preserved invariants.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

Recovery of R20 completes the node-recovery queue but does **not** restore implementation authority. The Global Fidelity & Cross-Node Audit remains the implementation gate, including substantive source-level rechecks for R4–R6 and normalization/review of R18 under the recovery assurance hierarchy.

## 30. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
