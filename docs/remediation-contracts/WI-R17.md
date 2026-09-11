# WI-R17 — Exact Offer-Version Commercial Authority

**Normalized node:** R17  
**Historical finding:** C3-F3  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R17 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing exact schema/storage representation, migration ordinals, fixture labels/order, audit vocabulary, or closure-evidence numbering from compressed summaries.

R17 is the commercial-authority node that prevents a mutable Asset-level activation bit, current monetization configuration, or current release pointer from standing in for the exact commercial terms and exact production artifact that were actually authorized.

Where exact historical text is unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R17 exists because commercial authority must attach to an exact immutable Offer Version, not to a mutable Asset-level status or current monetization setting.

> **Commercial authority belongs to the exact offer version that states what the customer pays, receives, is promised, and is bound to. A mutable Asset flag may summarize current state, but it may not replace that exact authority.**

R17 therefore defines immutable Offer Version identity, exact commercial binding, customer-charging grants, supersession semantics, and the boundary between artifact succession and commercial equivalence.

## 3. Canonical Offer Version

An Offer Version or equivalent immutable commercial-authority object must bind, where applicable:

- Offer Version identity;
- Asset identity;
- originating Opportunity identity;
- exact Bet identity;
- exact originating Evaluation Cycle under R4;
- exact Product Definition / commercial product authority;
- exact R10 production Artifact Version;
- exact production Release / deployment identity;
- Monetization Plan identity/version;
- provider identity;
- exact provider-account identity;
- currency;
- price / pricing model;
- price provenance;
- promised outcome / customer-facing value proposition;
- billing terms / cadence;
- transaction terms materially governing purchase;
- entitlements / access rights purchased;
- exact checkout / payment configuration identity where applicable;
- commercial terms fingerprint or equivalent immutable identity proof;
- creation / activation / supersession provenance.

The exact schema may differ, but these authority dimensions must remain representable without reconstructing them from current mutable state.

## 4. Material commercial change creates a new Offer Version

A material commercial change must create a successor Offer Version rather than mutating the existing one in place.

Recovered governing materiality test:

> **A commercial change is material if it could change what the customer pays, receives, is promised, or is bound to.**

Examples include changes to:

- price or currency;
- billing cadence;
- included entitlements/access;
- promised outcome or materially customer-visible scope;
- refund/cancellation/transaction terms where part of the offer;
- provider/payment-account scope where it changes the authoritative commercial execution path;
- production artifact where commercial equivalence has not been authoritatively proven.

A material successor is `O2`; it does not rewrite `O1`.

## 5. Price provenance is not commercial authority

A price can have provenance without being currently authorized for customer charging.

Market research, historical pricing, a founder-entered number, a provider default, or an internal recommendation may explain where a price came from. None of those facts alone grants authority to charge a customer.

R17 requires the exact price and terms to be bound into an immutable Offer Version and separately granted for execution.

> **Price provenance explains a value. It does not authorize a charge.**

## 6. Asset-level activation is convenience state only

A mutable field such as `asset.commercialActive`, `monetizationEnabled`, `isLive`, or equivalent may exist as a current-state convenience pointer.

It must never be the sole or historical authority for a customer-facing economic action.

The system must be able to answer which exact Offer Version governed a particular customer checkout, contract, charge, entitlement grant, renewal, or other commercial action even after the Asset's current state changes.

Current convenience state may summarize. Exact Offer Version lineage authorizes.

## 7. Customer-charging grant

A `CUSTOMER_CHARGING` Grant or equivalent commercial execution grant must bind to one exact Offer Version.

At minimum, the grant must be capable of preserving:

- exact Offer Version identity;
- Offer Version fingerprint / immutable commercial identity;
- exact provider;
- exact provider-account identity;
- exact permitted commercial action scope;
- relevant checkout/payment configuration metadata;
- grant issuance provenance;
- grant status/lifecycle;
- revocation/supersession history.

The Grant authorizes execution of the exact commercial object. It does not authorize arbitrary current Asset monetization state.

## 8. Grant and revocation history is monotonic

Commercial grants and revocations are historical authority events.

Revoking or superseding a grant does not erase the fact that the grant previously existed and may already have authorized consequential customer-facing activity.

A later grant for `O2` does not rewrite an earlier grant for `O1`.

> **Current authority can end without erasing historical authority.**

This is required for R19 lineage and R20 boundary-time eligibility.

## 9. R10 boundary — exact production artifact is part of the offer

An Offer Version binds the exact R10 production Artifact Version / Release it commercializes.

A mutable deployment pointer or current repository state cannot silently substitute for that artifact.

If production artifact `P1` is replaced by `P2`, R17 must determine whether the existing Offer Version may remain authoritative or whether a successor Offer Version is required.

The default is not silent carry-forward.

## 10. Technical successor versus commercial equivalence

A technical successor artifact does not automatically preserve commercial authority.

If `P2` replaces `P1`, preserving Offer Version `O1` requires authoritative proof that the artifact change is commercially equivalent for the customer-facing offer.

Commercial equivalence means the customer does not materially pay differently, receive a different entitlement, receive a materially different promised outcome, or become bound to materially different terms merely because the technical artifact changed.

Where this is a material conclusion rather than a fully deterministic comparison, R5 independent confirmation applies.

> **Technical succession is not commercial equivalence.**

If equivalence cannot be proven, create successor Offer Version `O2` and govern it independently.

## 11. Mid-preparation supersession

A commercial operation can be historically valid under `O1` while becoming ineligible for new adoption because `O1` was superseded by `O2` before completion.

Recovered scenario:

1. an operation begins preparing under exact Offer Version `O1`;
2. before the customer-facing boundary/adoption completes, `O2` becomes the current eligible successor;
3. R8 preserves the exact historical `O1` preparation/execution truth;
4. `O1` is no longer eligible for new adoption where supersession policy says it is not;
5. `O2` requires its own commercial preparation/execution authority.

> **An external operation can remain historically valid while its result is no longer eligible for adoption.**

R17 preserves exact offer identity; R20 determines whether that exact offer remains eligible at the relevant boundary/adoption moment.

## 12. Existing customer contracts do not silently move to the current Offer

A current Offer Version pointer is not authority to rewrite an existing customer's contract.

Renewal, recurring billing, entitlement continuation, or other subsequent commercial action must respect the Offer Version / customer contract that actually governs that customer unless a separate governed migration/amendment occurs.

A new `O2` for new customers does not silently convert existing `O1` customer obligations into `O2`.

> **Current offer is not automatically the offer governing an existing contract.**

## 13. Provider/account identity is part of commercial execution scope

The payment/commercial provider and exact provider-account identity are part of the Offer Version and/or charging Grant execution scope where applicable.

A runtime may not silently charge through another provider/account merely because it is operationally available or logically equivalent.

Changing provider/account scope for a commercial action requires the applicable governed rebinding / successor authority rather than local substitution.

This is one of the exact scopes where DI-1 is activated for R17.

## 14. DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated in R17 commercial/payment scope:** YES

R17 consumes DI-1 for commercial/payment execution because exact provider/account identity is part of the Offer Version / Grant authority and unauthorized substitution would change the consequential execution path.

At minimum:

- `O1` bound to provider/account `A` may not be executed through provider/account `B` merely because `B` supports the same logical capability;
- successor provider/account binding requires explicit governed authority;
- historical commercial actions remain attributable to the exact account that executed them;
- R19 lineage must preserve this identity;
- R20 must revalidate the exact bound provider/account where current eligibility matters.

This DI-1 activation is scope-specific to R17's commercial/payment path. It does not imply DI-1 is globally activated for unrelated nodes/scopes.

## 15. DI-2 — outbound payment reversal execution

**Reviewed:** YES

R17 by itself governs offer/charging authority, not the actual dispatch semantics of refund/cancel/void/reversal operations.

DI-2 remains dormant for generic Offer Version creation and ordinary forward charging authority.

DI-2 activates when Money Scout autonomously dispatches an external refund/cancel/void/reversal. At that point the reversal must have its own governed authority, R8 execution identity, and R15/R16 financial history rather than being represented as retroactive erasure of the original transaction.

## 16. R4 boundary — exact originating Evaluation Cycle

Offer Version authority must retain the exact originating R4 Evaluation Cycle where applicable.

The system must not reconstruct commercial authority from the currently active/latest cycle.

A current cycle may coexist with historical offers created under earlier valid cycles. Historical authority remains attributable to the exact cycle that produced it, while R20 determines whether it remains currently eligible for new action.

## 17. R9 boundary — immutable source authority

R17 must inherit immutable source/build authority through the exact R9 Build Source Snapshot lineage, not through a mutable branch or repository pointer.

Commercial authority cannot be stronger than the build source authority supporting the production artifact it references.

R17 does not redefine R9. It consumes its exact source lineage through R10.

## 18. R19 boundary — complete commercial lineage

R17 supplies the immutable Offer Version / charging-grant segment that R19 needs for complete lineage.

R19 must be able to traverse from upstream authority through exact Offer Version, provider/account commercial execution, customer contract/transaction, and downstream financial evidence.

An Asset-level active bit or current Offer pointer cannot substitute for that immutable historical segment.

## 19. R20 boundary — offer identity versus current eligibility

R17 answers **what exact commercial object is authorized**.

R20 answers whether that exact authority may be consumed **now** at preflight, consequential boundary, or adoption.

A valid immutable Offer Version is not perpetual permission.

An Offer can remain historically authoritative for past actions while becoming ineligible for new checkout/adoption because of revocation, supersession, lifecycle change, capability/binding change, resource state, or another governing predicate.

> **R17 defines the commercial authority object. R20 decides whether that object is currently consumable.**

## 20. R5 boundary — material commercial-equivalence conclusions

Where a commercial-equivalence decision can be reduced deterministically from frozen fields, an authoritative deterministic verifier may establish it.

Where the conclusion materially depends on judgment about customer-facing sameness, R5 applies: the material conclusion may not self-certify.

A Builder, Release worker, or Commercial worker may propose that `P2` is commercially equivalent to `P1`; that proposal is not itself authority to keep `O1` live.

## 21. Known migration surfaces recoverable from record

The available record confirms R17 migration scope includes, at minimum:

- canonical immutable Offer Version schema;
- exact binding from Offer Version to Asset/Opportunity/Bet/Evaluation Cycle/Product/production Artifact/Release/Monetization Plan;
- exact provider/account commercial binding;
- currency/price/terms/entitlement/promise capture;
- checkout/payment configuration identity;
- Offer Version fingerprint / immutable commercial identity;
- `CUSTOMER_CHARGING` Grant or equivalent exact-offer execution grant;
- grant/revocation/supersession history;
- Asset-level convenience/current pointers that currently stand in for authority;
- artifact-successor commercial-equivalence adjudication;
- mid-preparation Offer supersession handling;
- existing-customer contract/renewal binding to historical governing Offer;
- provider/account rebinding under DI-1;
- commercial lineage handoff to R19;
- boundary-time eligibility handoff to R20;
- semantic audit of every customer-charging path that reads mutable current state instead of exact Offer Version authority.

Exact migration labels, ordinals, and original per-surface wording remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 22. Semantic sibling sweep

Search for patterns including:

- Asset-level `commercialActive` / `isLive` / equivalent is the sole authority for charging;
- checkout reads current price/terms rather than an exact immutable Offer Version;
- a material price/entitlement/promise/term change mutates an existing Offer in place;
- price provenance is treated as charging authority;
- Offer Version references mutable/current artifact or Release state;
- technical artifact successor automatically inherits prior commercial authority without equivalence proof;
- material commercial-equivalence conclusion self-certifies instead of using R5 where required;
- provider/account identity is omitted from Offer/Grant execution scope;
- provider/account silently substitutes because the logical capability is equivalent;
- grant revocation deletes historical evidence that it existed;
- current Offer pointer rewrites the Offer governing an existing customer contract;
- mid-preparation supersession lets stale `O1` result be adopted as if `O1` were still eligible;
- `O2` reuses `O1` preparation/execution identity rather than obtaining its own authority;
- current/latest Evaluation Cycle is substituted for the exact originating R4 cycle;
- R17 immutable identity is treated as perpetual R20 execution eligibility.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 23. Acceptance semantics recoverable from source

At minimum, R17 closure must eventually prove:

- every customer-charging authority binds to one exact immutable Offer Version;
- Offer Version binds exact Asset/Opportunity/Bet/Evaluation Cycle/Product/production Artifact/Release/Monetization Plan lineage where applicable;
- provider/account/currency/price/terms/entitlements/promised outcome/checkout configuration remain exact and historically attributable;
- material commercial change creates a successor Offer instead of mutating the original;
- price provenance alone never authorizes customer charging;
- Asset-level activation/current pointers remain convenience state, not authority;
- `CUSTOMER_CHARGING` Grant or equivalent binds one exact Offer Version and exact provider/account scope;
- grant/revocation history is monotonic;
- technical successor `P2` does not inherit `O1` commercial authority unless commercial equivalence is authoritatively proven;
- material equivalence conclusions consume R5 where required;
- mid-preparation supersession preserves `O1` historical execution while blocking stale adoption and requires `O2` to obtain its own authority;
- current Offer does not silently rewrite existing `O1` customer contracts;
- DI-1 exact provider/account consistency is enforced in the commercial/payment scope;
- R19 can consume the exact immutable commercial segment;
- R20 separately revalidates current eligibility before consequential commercial boundary/adoption.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 24. Start / local closure / E2E dependency result

### START

R17 contract/schema work may proceed once R4/R9/R10 exact lineage objects are sufficiently stable to bind into an Offer Version and commercial provider/account identities can be represented exactly.

R19/R20 interface contracts may be designed in parallel, but R17 must remain the exact commercial-authority-object layer rather than absorbing full-lineage validation or boundary-time eligibility.

### LOCAL CLOSURE

R17 may locally close when immutable Offer Version identity, exact upstream/artifact/commercial bindings, material-change successor semantics, exact charging grants, provider/account scope, technical-successor equivalence handling, mid-preparation supersession, existing-contract behavior, known migrations, audit children, and final sibling sweep are complete.

R19/R20 need not be globally closed for the R17 object model to exist, but commercial E2E certification remains pending until full lineage and boundary-time eligibility compose.

### E2E

Final certification must compose with at least R4, R5, R9, R10, R18, R19, R20, R7, R8, R15, and R16 where relevant.

The hard-chain relationship remains:

`R4 → R9 → R10 → R17 → R19 → R20`

## 25. Explicit non-goals

R17 must not:

- use a mutable Asset-level boolean/status/current pointer as historical charging authority;
- mutate material commercial terms into an existing Offer Version;
- treat price provenance as execution authority;
- reconstruct Offer authority from current/latest Evaluation Cycle, Product, Artifact, Release, or monetization state;
- treat technical artifact succession as automatic commercial equivalence;
- let a material commercial-equivalence conclusion self-certify when R5 applies;
- silently substitute provider/account identity;
- erase grant/revocation/supersession history;
- move existing customer contracts to the current Offer merely because a successor exists;
- let a historically valid `O1` operation be newly adopted after `O1` loses eligibility;
- reuse `O1` execution/preparation authority for successor `O2`;
- treat immutable Offer identity as perpetual R20 permission;
- dispatch an external refund/cancel/void/reversal merely because commercial policy suggests one, without DI-2-governed reversal execution authority.

## 26. Source gaps and assurance status

The following original R17 details remain not fully recoverable from the available record and are not being invented:

1. exact Offer Version / Grant schema field names and storage representation;
2. exact Offer/Grant lifecycle enum names beyond the recovered semantic requirements;
3. exact fingerprint algorithm / canonical serialization if separately frozen;
4. exact checkout-provider field mappings;
5. exact deterministic commercial-equivalence verifier fields where equivalence is fully reducible;
6. exact migration child labels and ordinals;
7. exact audit name/classification vocabulary if separately frozen;
8. exact acceptance-fixture labels/order;
9. exact closure-evidence list;
10. exact amendment/rejected-alternative wording beyond the recovered invariants;
11. any original worked examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R18/R19, but it does not restore R17 implementation authority.

## 27. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
