# Amendment Package 01A — Five-Path Prospective Output Manifest

**Status:** EXACT PROSPECTIVE OUTPUT REVIEW MANIFEST / NON-AUTHORITATIVE / NO LANDING AUTHORITY  
**Target:** Amendment A — `RD-C-R17-R18`  
**PRE-BCT:** PASSED  
**PAIM:** FROZEN  
**G2 effect:** FINAL / `UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`  
**MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact records the exact complete prospective content for every path in the reviewed Amendment-A five-writer landing set.

The five content blobs below were created as detached Git objects without advancing `main` or any other branch ref. Detached blob creation is preparation only and conveys no authority.

The reviewed writer set remains exactly:

1. `docs/remediation-contracts/WI-R17.md`
2. `docs/remediation-contracts/WI-R18.md`
3. `docs/remediation-contracts/WI-R20.md`
4. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md`
5. `docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md`

## 2. Exact prospective blob identities

- R17 prospective blob: `5baa5c9cd16b16766b5bce6fd2950eace834da61`
- R18 prospective blob: `6bbd89816146c145c79eb2edd15bdca1a5f65d44`
- R20 prospective blob: `abd865614ee70cc35b6068b46626ef306d100080`
- graph-delta prospective blob: `aa951b782e413765a567c5ceb4e856b5e65d6302`
- landing-event prospective blob: `21faf23fdaade375bcc4faa79e2bd714a96256a8`

The landing-event blob was created after the R17/R18/R20/graph-delta blobs and contains their exact prospective SHAs where appropriate. It does not embed its own blob SHA, final landing tree SHA, final landing commit SHA, or eventual direct parent commit/tree.

## 3. Construction sequencing

The exact construction order used was:

1. read current canonical R17/R18/R20 contents;
2. construct complete prospective R17/R18/R20 contents by adding only the reviewed Amendment-A canonical sections;
3. construct complete graph-delta content;
4. create detached Git blobs for R17, R18, R20, and graph delta;
5. construct landing-event content using those already-known cross-file blob identities;
6. create the detached landing-event blob;
7. fetch all five detached blobs by SHA;
8. embed the fetched literal content below for adversarial review.

No branch ref was moved during blob construction.

## 4. Review invariants

The adversarial reviewer should verify:

- each authority prospective file equals its current canonical content plus only the reviewed Amendment-A addition;
- no existing canonical text was removed or silently edited;
- R17/R18/R20 additions match the exact landing-content candidate and G2 adjudication;
- graph delta contains all ten reviewed edges, exact scopes/types, G2 disposition, and frozen negative fan-out;
- landing event uses only non-self-referential fields;
- landing event references the actual detached R17/R18/R20/graph-delta blob SHAs listed above;
- landing event contains no final commit/tree/event-blob/direct-parent self-embedding;
- no sixth landing writer is implied;
- no finding closes and no certification restores merely from landing;
- POST-BCT remains pending after landing.

## 5. Literal complete prospective contents


--- BEGIN EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R17.md ---

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

This is the exact DI-1 activation scope named `DI-1/COMMERCIAL_PAYMENT`.

## 14. DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated scope identifier:** `DI-1/COMMERCIAL_PAYMENT`  
**Activated in R17 commercial/payment scope:** YES

R17 consumes `DI-1/COMMERCIAL_PAYMENT` for commercial/payment execution because exact provider/account identity is part of the Offer Version / Grant authority and unauthorized substitution would change the consequential execution path.

At minimum:

- `O1` bound to provider/account `A` may not be executed through provider/account `B` merely because `B` supports the same logical capability;
- successor provider/account binding requires explicit governed authority;
- historical commercial actions remain attributable to the exact account that executed them;
- R19 lineage must preserve this identity;
- R20 must revalidate the exact bound provider/account where current eligibility matters.

`DI-1/COMMERCIAL_PAYMENT` is scope-specific to R17's commercial/payment path. It does not imply DI-1 is globally activated for unrelated nodes/scopes.

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
- exact provider/account commercial binding under `DI-1/COMMERCIAL_PAYMENT`;
- currency/price/terms/entitlement/promise capture;
- checkout/payment configuration identity;
- Offer Version fingerprint / immutable commercial identity;
- `CUSTOMER_CHARGING` Grant or equivalent exact-offer execution grant;
- grant/revocation/supersession history;
- Asset-level convenience/current pointers that currently stand in for authority;
- artifact-successor commercial-equivalence adjudication;
- mid-preparation Offer supersession handling;
- existing-customer contract/renewal binding to historical governing Offer;
- provider/account rebinding under `DI-1/COMMERCIAL_PAYMENT`;
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
- a commercial/payment provider-account binding that belongs to `DI-1/COMMERCIAL_PAYMENT` is represented only as unnamed/generic DI-1 scope and loses the exact activation identity;
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
- `DI-1/COMMERCIAL_PAYMENT` exact provider/account consistency is enforced in the commercial/payment scope;
- R19 can consume the exact immutable commercial segment;
- R20 separately revalidates current eligibility before consequential commercial boundary/adoption.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 24. Start / local closure / E2E dependency result

### START

R17 contract/schema work may proceed once R4/R9/R10 exact lineage objects are sufficiently stable to bind into an Offer Version and commercial provider/account identities can be represented exactly.

R19/R20 interface contracts may be designed in parallel, but R17 must remain the exact commercial-authority-object layer rather than absorbing full-lineage validation or boundary-time eligibility.

### LOCAL CLOSURE

R17 may locally close when immutable Offer Version identity, exact upstream/artifact/commercial bindings, material-change successor semantics, exact charging grants, `DI-1/COMMERCIAL_PAYMENT` provider/account scope, technical-successor equivalence handling, mid-preparation supersession, existing-contract behavior, known migrations, audit children, and final sibling sweep are complete.

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
- collapse `DI-1/COMMERCIAL_PAYMENT` into an unnamed generic DI-1 activation that cannot be referenced precisely across commercial/payment work;
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

## 27. First-pass source-review disposition

| Review item | Disposition |
|---|---|
| Core R17 Offer Version authority, commercial-equivalence, supersession, and boundaries | ACCEPTED |
| DI-1 commercial/payment activation substance | ACCEPTED |
| Named DI-1 activation scope | PARTIALLY ACCEPTED → RESTORED AS `DI-1/COMMERCIAL_PAYMENT` |
| False assertions requiring rejection | NONE |

## 28. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.

## Amendment A — R17/R18 commercial-payment composition invariant

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


--- END EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R17.md ---

--- BEGIN EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R18.md ---

# WI-R18 — Preserve and Revalidate Exact Capability Bindings Before Consequential Dispatch

**Normalized node:** R18  
**Historical finding:** C4-F5  
**Severity:** MATERIAL  
**Status:** CONFIRMED / READY FOR REGISTER INCLUSION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Amendment provenance

This contract preserves the correction history rather than rewriting it away.

1. **v1.0 register freeze attempt:** R18 was incorrectly presented as already contract-confirmed and was assigned the fabricated historical citation `C5-F3`. That was a register-integrity failure, not a valid confirmation.
2. **First real R18 draft:** R18 was drafted from live repository evidence but still carried `C5-F3` as a provisional traceability hold. Adversarial review corrected the historical finding to the already-frozen `C4-F5` and identified two additional material corrections: restore the previously frozen DEPRECATED default semantics and remove full `R6 CLOSED` as a local-closure prerequisite.
3. **Amended draft:** the citation was corrected to `C4-F5`, DEPRECATED continuation semantics for already-frozen bindings were restored, and R6 was reduced from global local-closure dependency to an implementation-compatible interface dependency. A further adversarial pass required consistency in the lifecycle summary table, an explicit stronger-policy override fixture for DEPRECATED, and a mechanical local-closure bar requiring a real implemented/queryable R6 interface rather than confirmed contract text alone.
4. **Third draft:** those amendments were incorporated and the work item was confirmed.

The false `C5-F3` citation is not retained as alternate traceability. It exists only in this amendment history as evidence of the correction.

## 1. Frozen mission

R18 preserves the exact capability/provider/account binding under which an execution was planned or authorized, and determines whether that same binding remains eligible immediately before consequential dispatch after capability lifecycle or provider/account conditions may have changed.

**Core rule:**

> An execution authorized for capability binding B may dispatch only if that exact binding B remains eligible. A different currently-usable capability is not a substitute.

R18 is narrower than R20 and does not redefine R6.

- **R6:** Is this exact capability claim sufficiently verified?
- **R18:** Which exact verified capability binding did this execution depend on, and does that same binding remain eligible?
- **R20:** At this exact consequential boundary, after composing R18 with every other required authority predicate, may the action execute now?

## 2. Live defect shape

The current capability layer behaves as mutable current state. A logical capability key can be upserted with a current provider, access level, verification method, metadata, verification time, and expiry. A boolean-style `hasCapability(capabilityKey)` can therefore answer whether some current representation of that logical capability is usable, but not whether the exact provider/account/verification binding frozen for an earlier execution remains the same authority.

Builder execution likewise can persist a provider on a run while later ticks obtain the currently configured provider driver. Provider equality alone is insufficient if credentials/accounts can differ over time.

A correct R18 implementation must therefore distinguish a **logical capability class** from the **exact immutable capability binding** consumed by an execution.

## 3. Canonical failure scenario

At T0, logical capability K is verified as Provider A / Account A1 / verification V1 and execution X freezes that binding.

At T1, Account A1 is revoked or quarantined. Provider B / Account B1 becomes current and healthy for the same logical capability key.

At T2, X reaches dispatch.

A current-state check that merely asks whether K is usable would pass. R18 must block X because X was never bound to or authorized for B/B1.

If B/B1 should be used, it requires an explicitly authorized new binding and normally a successor/new execution path.

## 4. Capability key is not capability identity

A logical capability key is a capability class, not execution authority. An exact binding may include:

- capability key and exact claim;
- provider identity;
- provider account/tenant/organization/workspace identity;
- credential authority identity/class where safe to persist;
- access level;
- verification policy version;
- exact verification result/evidence reference;
- verification strength;
- verification and expiry times;
- capability lifecycle state/version;
- allowed operation class/scope;
- Asset/Bet scope where relevant;
- provenance and deterministic fingerprint.

**Invariant:** same capability key does not imply same capability binding.

## 5. Capability Binding Snapshot

R18 introduces an immutable **Capability Binding Snapshot** or equivalent authority object. The snapshot records what exact R6-confirmed capability authority was frozen for one execution.

Conceptual fields include:

`bindingId`, `capabilityKey`, `claim`, `provider`, `providerAccountIdentity`, `credentialAuthorityIdentity`, `verificationPolicyVersion`, `verificationResultId`, `verificationStrength`, `accessLevel`, `allowedOperationScope`, `boundAt`, `expiresAt`, `lifecycleVersion`, `provenance`, `fingerprint`.

The snapshot is historical identity, not perpetual validity.

## 6. R6 dependency and vocabulary

R18 may bind only R6 capability authority that is actually implemented and queryable for the exact claims R18 consumes.

The R6 result vocabulary R18 must be able to distinguish is:

- `AUTOMATION_READY`
- `HUMAN_AUTHORITY_CONFIRMED`
- `VERIFICATION_PENDING`
- `VERIFICATION_FAILED`
- `POLICY_UNKNOWN`

R18 must also have the provider/account/verification provenance necessary to preserve exact identity.

A confirmed R6 design document alone is insufficient. A placeholder enum alone is insufficient. A helper equivalent to `hasCapability() -> boolean` is insufficient because it collapses the canonical R6 states and does not prove exact binding identity.

## 7. Binding vs current projection

Current capability projections may exist for planning/UI, but execution X retains its immutable `bindingId = B1`.

At dispatch R18 revalidates B1. It must not query the logical capability key, discover current B2, and silently substitute B2.

> Revalidation may confirm or reject an existing binding. It may not replace the binding.

A true rebinding produces a new authority object and, where consequential, a new execution/successor path subject to ordinary R7/R8/R20 gates.

## 8. Predispatch validation outcomes

R18 should produce a durable result family equivalent to:

- `BINDING_VALID`
- `BINDING_EXPIRED`
- `BINDING_REVOKED`
- `BINDING_QUARANTINED`
- `BINDING_RETIRED`
- `BINDING_DEPRECATED_DISALLOWED`
- `BINDING_DEGRADED_INSUFFICIENT`
- `PROVIDER_ACCOUNT_MISMATCH`
- `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`
- `BINDING_IDENTITY_UNKNOWN`
- `BINDING_CONFLICT`
- `REVALIDATION_UNRESOLVED`

Only an explicitly eligible outcome may be consumed by R20 for consequential dispatch.

## 9. PRE-BOUNDARY / POST-BOUNDARY-BEFORE-ADOPTION / POST-EFFECT

### PRE-BOUNDARY

If the exact frozen binding is now invalid, do not dispatch. A healthier current provider does not matter.

### POST-BOUNDARY / PRE-ADOPTION

If the provider boundary has already been crossed under B1 and B1 later becomes invalid, R18 must not pretend dispatch did not occur. R8 preserves external truth. R18 preserves the historical fact that the operation used B1. R20 decides whether the result remains eligible for adoption.

### POST-EFFECT

A completed historical effect that was validly executed under B1 is not rewritten onto B2 or into “never authorized” merely because B1 is later retired/revoked. Future steps use current rules. Later evidence showing B1 was already invalid at dispatch is an authority-regression problem, not ordinary lifecycle change.

## 10. Lifecycle semantics

The previously frozen C4-F5 distinctions are preserved.

### QUARANTINED

Unsafe/disallowed for consequential execution pending explicit resolution.

- block new binding;
- block new consequential dispatch;
- never substitute another binding under the same execution;
- preserve R8 truth for already-dispatched operations;
- reconciliation/evidence-preservation may continue only where explicit policy permits and does not create a forbidden new consequential effect.

Default: hard fail closed.

### RETIRED

No longer eligible for new consequential use.

- block new dispatch and new bindings;
- preserve historical validity;
- already-dispatched exact executions may still require reconciliation through their originating provider/account where policy permits.

Retired reconciliation access does not revive new-dispatch authority.

### DEPRECATED

Still functional but no longer appropriate for new selection.

- **already-frozen bindings may normally continue by default** while migration/review debt is recorded;
- **new selection is disallowed by default**;
- an explicit stronger policy may further restrict continuation of already-frozen bindings.

Deprecation alone must not silently invalidate immutable planning.

### DEGRADED

Capability remains present but some claim/permission/reliability has weakened. Eligibility is claim-specific.

A provider may remain sufficient for read-only exact reconciliation while being insufficient for a new mutation. Unknown or insufficient claim state blocks the relevant consequential dispatch.

### Conservative lifecycle summary

- `QUARANTINED` -> block consequential dispatch.
- `RETIRED` -> block new dispatch; historical/reconciliation access only where explicitly permitted.
- `DEPRECATED` -> already-frozen bindings may continue by default with migration/review debt; new selection blocked by default; explicit stronger policy may restrict continuation.
- `DEGRADED` -> evaluate exact required claim; block if insufficient or unknown.
- `ACTIVE/AVAILABLE` -> still requires applicable R6 verification and exact identity match.

## 11. Provider/account identity

Provider name alone is insufficient where multiple credentials/accounts can exist over time.

R18 treats exact provider account/tenant identity as first-class wherever materially relevant. If account identity cannot be established, provider equality must not be treated as proof of binding equality.

State: `BINDING_IDENTITY_UNKNOWN` where unresolved identity ambiguity is consequential.

Credential rotation must distinguish:

1. same provider account/authority with new credential material;
2. different provider account/authority.

The first may preserve binding only where continuity is authoritatively proven. The second is rebinding.

Environment variable names, provider strings, or logical capability keys are not proof of authority continuity.

## 12. Verification-policy changes

If B1 was valid under R6 Policy V1 and the policy changes to V2 before dispatch, R18 must determine whether V1 remains valid for this execution or re-verification is required.

Unknown policy behavior yields `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`. No silent grandfathering. R6 owns the actual verification.

## 13. R6 / R7 / R8 / R11 / R14 / R20 boundaries

### R6 vs R18

R6 defines verifier sufficiency and current claim truth. R18 preserves and revalidates the exact bound claim.

`AUTOMATION_READY` and `BINDING_VALID` are not synonyms.

### R7 vs R18

Verified capability and reserved capacity are parallel prerequisites. A valid binding does not grant resource authority; a valid reservation does not revive a revoked binding.

### R8 vs R18

R18 owns predispatch binding eligibility. R8 owns external-boundary truth once dispatch may have happened. R18 cannot turn a post-boundary execution into a pre-boundary one or replay it through B2.

### R11 vs R18

R18 detects invalid binding. R11 owns corrective successor disposition. Capability failure may justify a successor, but does not authorize substitution in place. Any successor receives its own normal R7/R8/R20 gates.

### R14 vs R18

Runtime replacement transfers execution ownership, not capability authority. A successor runtime receives X/B1 and freshly revalidates B1 before any not-yet-crossed consequential boundary. It does not reconstruct current binding B2.

### R20 vs R18

R18 defines and evaluates capability-binding eligibility. R20 decides when that evaluation must occur and atomically/serializably consumes it as part of the complete boundary predicate set.

A valid R18 result is not itself final dispatch authorization.

## 14. Capability restoration and blocked executions

Current capability availability may trigger reconsideration. It does not authorize automatic resumption of all executions blocked on the same logical capability key.

Each blocked execution must establish whether the restored capability is the same admissible binding or whether a new binding/successor is required.

> Capability availability may trigger reconsideration. It does not itself authorize resumption of frozen executions.

A generic human statement that “access is restored” also cannot bridge an unresolved binding-identity gap.

## 15. Reconciliation exception

R18 must distinguish `NEW_MUTATION` from `READ_ONLY_EXACT_RECONCILIATION`.

A retired or otherwise ineligible-for-new-work provider may remain the only legitimate provider through which an already-dispatched exact execution can be reconciled. Such reconciliation must remain tied to the originating execution/provider/account and must not be treated as authority for a new mutation.

A workflow may therefore need to preserve:

- historical dispatch binding B1;
- separate current reconciliation-access authority BR.

Those must not be conflated.

## 16. Binding provenance and legacy handling

Binding provenance should distinguish:

- `FRESHLY_BOUND`
- `DETERMINISTICALLY_RECONSTRUCTED`
- `LEGACY_UNPROVEN`

Legacy executions that know only a capability key or provider string must not be reconstructed from current credentials/configuration. Where exact historical binding cannot be proven, use `LEGACY_CAPABILITY_BINDING_UNPROVEN` or equivalent fail-closed state.

## 17. Retries and continuation

A new retry attempt does not automatically inherit B1. At retry creation, policy determines whether B1 can be newly bound; at retry dispatch R18 revalidates that exact binding again.

If R8 proves the system is continuing/reconciling the same exact already-dispatched external execution, preserve original B1. Do not create a new binding that falsely implies a new dispatch occurred.

## 18. Capability Binding Validation Record

R18 should durably record validation equivalent to:

`bindingId`, `executionId`, `operationClass`, `validationPolicyVersion`, `boundProvider`, `boundAccount`, `observedProvider`, `observedAccount`, `lifecycleState`, `r6VerificationResult`, `decision`, `reason`, `checkedAt`, `provenance`.

Validation records are operation-specific. A Builder-dispatch validation cannot authorize QA dispatch; a reconciliation validation cannot authorize a new mutation.

R20 owns whether that validation is boundary-current enough to consume.

## 19. Provider substitution

Provider substitution is never a recovery primitive by default.

Provider A unavailable -> Provider B healthy does not permit in-place substitution because provider changes may alter cost semantics, entitlement pools, privacy/data handling, output semantics, provider-account authority, and reconciliation behavior.

Provider-family equivalence that materially affects substitution authority is subject to R5 unless reducible to authoritative deterministic facts. Even confirmed equivalence does not itself authorize substitution unless the governing execution contract permits it.

## 20. Design Inputs

### DI-1

R18 evaluates DI-1 scope-by-scope wherever simultaneous or historical provider/account plurality exists.

For Builder execution, if multiple OpenAI/Codex/provider accounts or bindings can exist simultaneously or historically, `DI-1 / BUILDER_EXECUTION` activates and must be consumed with exact provider/account identity and no cross-account substitution.

The existence of provider name without account identity is not enough to declare the scope safe. Activation in Builder does not consume QA, Release, Commercial Payment, or any unrelated DI-1 scope.

### DI-2

Reviewed. Not activated generically by R18. If capability recovery introduces autonomous refund/void/cancellation/reversal with monetary consequence, that execution activates DI-2 separately.

## 21. Known migrations

### R18-M1 — Versioned capability authority history

Replace single mutable capability history as sole authority with durable version/history sufficient to distinguish provider/account/verification V1 from V2. A current projection may remain.

### R18-M2 — Capability Binding Snapshot

Consequential executions reference exact immutable binding ID/fingerprint rather than only capability key/provider string.

### R18-M3 — Provider/account identity strengthening

Audit every provider driver and capability source for exact account/tenant identity where materially relevant. Fail closed when identity ambiguity is consequential and cannot be resolved.

### R18-M4 — Frozen Builder driver binding

Builder dispatch must prove the selected current driver corresponds exactly to the run's frozen binding. Provider-string equality alone is insufficient where account identity can vary.

### R18-M5 — Resume eligibility after capability restoration

Capability restoration may trigger reconsideration but cannot automatically resume old frozen executions without exact-binding validation or explicit successor/rebinding.

### R18-M6+ — Audit-discovered children

Every concrete defect discovered in the required audits becomes an explicit durable migration child. Audit completion is not defect closure.

## 22. Mandatory audits

### R18-A0 — Capability authority representability audit

Before behavioral certification, determine whether the capability schema can simultaneously/historically represent:

- V1 and V2 authority;
- Provider A and B;
- Account A1 and A2;
- old and new verification results;
- retirement/quarantine/deprecation/degradation without erasing prior history.

Classify surfaces as:

`HISTORY_SUPPORTED`, `CURRENT_PROJECTION_WITH_HISTORY`, `SINGLE_MUTABLE_ROW_ONLY`, `PROVIDER_ACCOUNT_COLLAPSE`, `VERIFICATION_HISTORY_UNPROVEN`, `DEFECT_DISCOVERED`.

Any representation collapse becomes named migration work.

### R18-A1 — Capability Binding Consumer Audit

Audit at minimum:

- Builder Gateway;
- QA;
- Release preview;
- Release production;
- research providers;
- validation providers;
- experiment execution;
- commercial payment/provider adapters;
- repository mutation/provisioning;
- consequential telemetry;
- remediation workers;
- reconciliation workers.

Classify each:

`EXACT_BINDING_FROZEN`, `CAPABILITY_KEY_ONLY`, `PROVIDER_ONLY`, `CURRENT_PROVIDER_LOOKUP`, `ACCOUNT_IDENTITY_MISSING`, `LIFECYCLE_NOT_REVALIDATED`, `CURRENT_CAPABILITY_SUBSTITUTION`, `RECONCILIATION_ONLY_VALID`, `DEFECT_DISCOVERED`.

Audit != repair.

## 23. Acceptance fixtures

A. Identical binding remains eligible -> PASS capability predicate.

B. Binding expires before dispatch -> BLOCK.

C. Binding quarantined -> BLOCK new dispatch; no substitution.

D. Binding retired -> BLOCK new dispatch; preserve historical identity.

E. Deprecated already-frozen binding with no stronger contrary policy -> may continue; migration/review debt recorded.

F. Deprecated binding proposed for new execution -> new selection rejected/redirected according to selection policy.

G. **Deprecated existing binding with explicit stronger restriction:** an explicit policy can prohibit continuation after its effective boundary; R18 blocks at/after that point, preserves historical binding, records that the restriction arose from explicit policy rather than deprecation alone, and routes successor/rebinding through R11.

H. Degraded but still sufficient for exact required claim -> PASS capability predicate if R6 confirms claim.

I. Degraded below required claim -> BLOCK.

J. Same logical key, different provider -> BLOCK.

K. Same provider, different account -> BLOCK where account plurality exists.

L. Credential rotation with authoritatively proven same-account continuity -> may preserve binding under policy.

M. Credential rotation with account continuity unknown -> `BINDING_IDENTITY_UNKNOWN` / BLOCK.

N. R6 policy strengthened after binding -> no silent grandfathering; policy/reverification required.

O. Capability restoration supplies B2 after B1 failure -> B1 execution does not auto-resume unless B2 is proven the same admissible binding or a successor/new binding is created.

P. Provider unavailable, alternate provider healthy -> no substitution.

Q. Postdispatch revocation -> R8 preserves execution truth; no redispatch; R20 governs adoption.

R. Retired provider exact read-only reconciliation explicitly allowed -> reconciliation of existing run allowed; no new mutation authority.

S. Runtime handoff -> successor runtime preserves X/B1 and freshly revalidates B1; no current-state rebinding.

T. Retry -> attempt 2 does not inherit B1 blindly.

U. Historical operation valid under B1 then B1 retired -> history remains valid.

V. Legacy provider-only execution with materially required account identity missing -> `LEGACY_CAPABILITY_BINDING_UNPROVEN`.

W. Current capability projection overwritten from V1 A/A1 to V2 A/A2 -> V1 remains inspectable and X still resolves to V1.

## 24. Compound certifications

### R6 × R18

R6 verifies B1 `AUTOMATION_READY`; execution freezes B1; B1 later becomes failed/insufficient while current B2 is healthy. R18 blocks X and does not substitute B2.

### R7 × R18

Valid capability does not authorize missing resource reservation; valid reservation does not revive invalid capability binding.

### R8 × R18

B1 valid at dispatch, external boundary crossed, local ownership lost, B1 later unavailable. R8 reconciles exact external truth where possible. R18 does not authorize replay through current B2.

### R14 × R18

Execution X/B1 transfers runtime ownership. Current capability projection changes during handoff. Successor runtime retains and revalidates B1.

### R18 × R20

R18 evaluates B1 valid at T1. B1 becomes quarantined before actual dispatch T2. If R20 consumes stale T1 validation the test fails. Correct behavior requires boundary-current capability truth and blocks dispatch.

### R6 × R18 × R20

R6 verifies B1, R18 confirms B1, then capability/provider/account lifecycle changes at the boundary. R20 must observe invalid current state; no “checked milliseconds ago” shortcut.

## 25. Parallel-not-merged boundaries

- **R18 vs R6:** frozen-binding lifecycle validity vs verifier sufficiency/readiness definition.
- **R18 vs R7:** capability identity/eligibility vs scarce-resource reservation.
- **R18 vs R8:** predispatch capability authority vs external execution truth/reconciliation.
- **R18 vs R11:** detection of invalid binding vs corrective successor ownership.
- **R18 vs R14:** capability authority identity vs runtime ownership transfer.
- **R18 vs R20:** capability-specific revalidation semantics vs universal boundary-time fencing/final authorization.
- **R18 vs provider selection/planning:** validate existing binding vs choose new provider.

## 26. Vocabulary checkpoints

- R6 `AUTOMATION_READY` = sufficiently verified capability claim.
- R18 `BINDING_VALID` = exact bound capability remains eligible.
- R8 `SUCCEEDED` = external execution outcome.
- R20 `CURRENTLY_ELIGIBLE` = complete boundary predicate passes.
- R14 `AUTHORITATIVE_ACTIVE` = runtime execution ownership.

None of these states substitutes for another.

## 27. Non-goals

R18 does not:

- define R6 verifier strength;
- reserve money/quota under R7;
- decide whether provider execution occurred under R8;
- select replacement providers;
- silently rebind executions;
- own corrective successors under R11;
- define runtime handoff under R14;
- provide final universal boundary authorization under R20;
- treat logical capability key as provider/account identity;
- treat current capability availability as historical authority;
- rewrite old operations onto new bindings.

## 28. Three dependency graphs

### START

R18 may begin once R6 semantic contract/interface is frozen enough to implement against. R18-A0 representability work and consumer inventory can proceed in parallel. R7/R8 need not be globally closed merely to start R18.

### LOCAL CLOSURE

R18 does **not** require global R6 closure.

For every R6 capability claim R18 binds, local closure requires:

1. the actual R6 implementation exists;
2. its canonical verification-result state is persisted/queryable;
3. exact provider/account identity and verification provenance required by R18 are available;
4. R18 can distinguish the canonical R6 result vocabulary instead of collapsing it to boolean usability;
5. the implemented interface is compatibility-proven against the frozen R6 contract for those exact claims.

A confirmed R6 design document alone is insufficient. A placeholder primitive alone is insufficient. A boolean `hasCapability()`-style helper alone is insufficient.

### E2E CERTIFICATION

Requires, at minimum:

- R6×R18;
- R7×R18;
- R8×R18;
- R14×R18;
- R18×R20;
- R6×R18×R20;
- applicable DI-1 provider/account scenarios.

This preserves the three-graph distinction and avoids an accidental R6->R7->R8->R18 waterfall.

## 29. Closure evidence

`WI-R18 = CLOSED` requires:

1. historical traceability to `C4-F5` preserved;
2. implementation SHA;
3. schema/migration SHA;
4. Capability Binding Snapshot primitive PASS;
5. capability authority history/representability PASS;
6. exact provider identity PASS;
7. exact account/tenant identity PASS wherever material;
8. implemented/queryable R6 interface compatibility PASS;
9. lifecycle-state policies PASS;
10. QUARANTINED behavior PASS;
11. RETIRED behavior PASS;
12. DEPRECATED default continuation/new-selection behavior PASS;
13. explicit stronger DEPRECATED override behavior PASS;
14. DEGRADED claim-specific behavior PASS;
15. R18-M1 through M5 PASS;
16. R18-A0 complete and all A0 defects repaired;
17. R18-A1 complete and all M6+ defects repaired;
18. no current-provider substitution PASS;
19. no same-provider/different-account substitution PASS where applicable;
20. capability restoration does not auto-authorize old execution PASS;
21. runtime handoff binding preservation PASS;
22. retry binding behavior PASS;
23. reconciliation exception scoped correctly PASS;
24. legacy binding handling PASS;
25. R6×R18 PASS;
26. R7×R18 PASS;
27. R8×R18 PASS;
28. R14×R18 PASS;
29. R18×R20 PASS;
30. R6×R18×R20 PASS;
31. DI-1 decision independently recorded for each audited execution scope;
32. every activated DI-1 scope consumed;
33. unrelated DI-1 scopes remain independently unchanged unless separately activated;
34. DI-2 decision recorded;
35. sibling sweep empty;
36. materially independent cross-model/provider confirmation.

## 30. Anti-cheat standard

The easiest false implementation is:

1. store `capabilityKey` on execution;
2. call a boolean current-state capability check before dispatch;
3. declare R18 solved.

That fails this contract.

> A capability revalidation system that can pass after silently replacing the execution's frozen provider/account binding is not a revalidation system. It is an unauthorized rebinding system.

And the final R18/R20 boundary is:

> R18 tells R20 whether the exact frozen capability binding remains valid. R20 decides whether that fact is boundary-current, correctly fenced, and sufficient together with every other required authority predicate to cross the boundary now.


## Amendment A — Commercial-payment binding composition with R17

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


--- END EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R18.md ---

--- BEGIN EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R20.md ---

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

The first capstone source-level review restored three material points. First, R20 must consume R18 lifecycle dispositions exactly as R18 defines them rather than reinterpret `DEPRECATED` locally. Second, A0 representability must prove concurrent multiplicity, not merely one exact authority at a time. Third, R20 requires forward engineering governance so future consequential code cannot silently bypass the Boundary Registry and validator path.

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

The three-part phase structure is source-confirmed. The exact literal enum strings above remain subject to final source-level/global fidelity confirmation if a richer original source record surfaces; no alternate names are being invented here.

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

## 7. R18 boundary — consume exact binding disposition without redefining lifecycle policy

R18 supplies the exact capability binding and the operation-specific binding-validation disposition. R20 decides when that R18 decision must be current enough to consume as one predicate in the complete boundary decision. R20 does **not** independently reinterpret raw R18 lifecycle state.

R18's confirmed disposition family includes, among other states:

- `BINDING_VALID`
- `BINDING_EXPIRED`
- `BINDING_REVOKED`
- `BINDING_QUARANTINED`
- `BINDING_RETIRED`
- `BINDING_DEPRECATED_DISALLOWED`
- `BINDING_DEGRADED_INSUFFICIENT`
- `PROVIDER_ACCOUNT_MISMATCH`
- `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`
- `BINDING_IDENTITY_UNKNOWN`
- `BINDING_CONFLICT`
- `REVALIDATION_UNRESOLVED`

The presence of `BINDING_DEPRECATED_DISALLOWED` does **not** mean R20 treats every `DEPRECATED` binding as disallowed. R18's confirmed lifecycle policy is:

- already-frozen `DEPRECATED` bindings may normally continue by default while migration/review debt is recorded;
- new selection is disallowed by default;
- an explicit stronger R18 policy may restrict continuation of an already-frozen deprecated binding, in which case R18 may produce `BINDING_DEPRECATED_DISALLOWED`.

> **R20 consumes R18's exact operation-specific disposition. It must not redefine `DEPRECATED` into a stricter or looser policy of its own.**

Accordingly, a deprecated binding that R18 still deems eligible may remain one satisfied predicate at the R20 boundary, subject to every other applicable R20 predicate. If R18 returns a disallowing/invalid/unresolved outcome, R20 must not override it locally merely because the logical capability remains available.

A previously verified binding that is now invalid cannot be replaced silently with another binding merely because the logical capability remains available.

Predispatch invalidity means no dispatch. Post-boundary invalidity cannot erase R8 history; adoption must be separately governed.

## 8. R6 boundary — readiness evidence is necessary but not perpetual

R6 capability readiness proves a claim under its verification policy. R20 determines whether the exact required readiness evidence remains eligible at the boundary.

An earlier `AUTOMATION_READY` result is not perpetual authority if:

- verification expired;
- policy changed materially;
- the bound credential/account was revoked or replaced;
- required access degraded;
- a lifecycle state made the capability unusable under the governing R18/R6 policy;
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

This principle does not let R20 invent negative semantics that upstream nodes did not establish. For example, R18 `DEPRECATED` is not automatically “bad news = block”; R20 consumes R18's exact disposition under its confirmed lifecycle policy.

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

## 18. A0 representability and concurrent-multiplicity audit

Before R20 implementation can be considered locally complete, the system must prove that every required predicate can actually be represented and referenced at the boundary.

This is the recovered R20 **A0 representability audit**.

A0 is not satisfied by proving that one exact authority can be represented in isolation. It must also prove the schema can represent **multiple concurrently relevant historical or in-flight authorities and boundary evaluations without identity collision, overwrite, or implicit one-current-authority assumptions**.

The audit must detect cases where current schemas cannot retain the exact identity needed for validation, including but not limited to:

- current/latest state standing in for exact lineage;
- missing provider/account binding identity;
- missing exact Offer Version / Grant;
- missing exact R9/R10 artifact lineage;
- missing reservation scope/linkage;
- missing freshness applicability;
- missing adoption target identity;
- missing runtime authority epoch where relevant;
- one-Asset / one-Offer / one-Bet uniqueness assumptions that prevent two or more distinct R19 Lineage References from being evaluated concurrently;
- a Boundary Registry or boundary-decision table keyed so coexisting boundary checks overwrite one another;
- current-pointer fields that cannot coexist with N historical/in-flight authority identities without one becoming implicit authority.

R20 A0 must include a multiplicity fixture in which at least two and conceptually arbitrary N distinct authority lineages for the same higher-level scope can have independent boundary decisions in flight or preserved historically at once, and each decision remains bound to the exact authority it evaluated.

> **If the schema cannot represent multiple historically distinct authorities at once, downstream lineage logic cannot make the system historically correct.**

R20 inherits this axiom from the same representability failure class exposed by R9 and R19/M14. A boundary cannot be certified merely because validator code exists if the schema cannot represent the exact thing being validated, or cannot represent several exact things concurrently without collision.

## 19. A1 full boundary audit

R20 also requires a full repository-wide **A1 boundary audit** of every consequential dispatch/adoption path.

For every boundary, classify whether it:

- already consumes a correct R20 decision;
- has an R20 defect requiring a durable migration child;
- is non-consequential and therefore outside R20;
- has unknown consequentiality/authority semantics requiring adjudication before exclusion.

`AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED` remains governing process discipline.

The audit must repeat after each migration wave until a complete semantic sibling sweep returns no new consequential boundary instance.

### 19.1 Forward engineering-governance requirement for future consequential surfaces

A complete A1 audit can only inspect consequential paths that already exist. It cannot runtime-enforce against future code that is never written to invoke R20 at all.

> **Architecture cannot runtime-enforce against code never written to call it.**

R20 therefore requires a forward engineering-governance rule in addition to runtime validators and retrospective audits: every newly introduced or materially changed consequential surface must be classified and registered with the Boundary Registry before it can be considered implementation-complete or production-eligible.

At minimum, the development process must enforce the following semantics:

- new provider/customer dispatch, release, commercial, financial-adoption, headroom-release, lifecycle, handoff, or other consequential surface is reviewed for R20 applicability;
- if consequential, the surface must declare its boundary class and required predicate set in the Boundary Registry before merge/release;
- code review must explicitly reject consequential execution paths that bypass registered boundary validation;
- CI/static analysis/architectural linting or equivalent mechanical checks should enforce registration/invocation wherever the code structure makes that deterministically checkable;
- tests for new consequential surfaces must prove both denial and allow paths through the registered R20 gate, not merely unit-test a validator in isolation;
- introducing a new consequence type that cannot be represented by the current registry/schema is an A0/A1 defect requiring governed schema/registry work, not permission to bypass the gate;
- the repository-wide sibling sweep must be rerun whenever architecture changes create a new class of consequential boundary not previously represented.

This forward rule is distinct from A1. A1 asks whether existing consequential paths are correctly covered. Forward engineering governance prevents newly written paths from silently appearing outside the gate after A1 was last clean.

The exact historical name/mechanical implementation of this governance requirement remains source-unresolved; the requirement itself is normative.

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
- exact R18 binding disposition consumption without local lifecycle reinterpretation;
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
- A0 exact-identity and concurrent-multiplicity representability audit;
- A1 complete consequential-boundary audit;
- forward engineering-governance / required-registration discipline for future consequential surfaces;
- semantic sibling sweep of all local `isAuthorized`/cached preflight/current-state authorization shortcuts.

Exact migration labels and ordinals remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless restored in source review.

## 25. Semantic sibling sweep

Search for patterns including:

- preflight pass reused as dispatch authority after time/state changes;
- generic `isAuthorized` boolean authorizes heterogeneous consequential operations;
- current/latest authority substituted for the exact bound identity;
- Offer O2 substituted when O1 becomes ineligible;
- provider/account B substituted when bound A becomes invalid;
- R20 interprets raw R18 `DEPRECATED` lifecycle state as disallowed despite R18 returning an eligible operation-specific disposition;
- R20 overrides an R18 disallowing disposition because the logical capability still exists;
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
- Boundary Registry/decision schema can represent only one current authority per Asset/Offer/Bet and collisions appear when multiple lineages are evaluated concurrently;
- R20 failure creates an R11 obligation that then executes consequentially without a fresh boundary decision;
- negative state is delayed/ignored while positive restoration is inferred without proof;
- prior `ALLOW` decision reused for a later distinct consequential boundary;
- later authority backfill retroactively marks an earlier unauthorized effect as legitimate;
- new consequential code path reaches a real external/adoption boundary without being classified/registered in the Boundary Registry;
- a new consequence class is excluded merely because A1 previously returned clean before that code existed.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 26. Acceptance semantics recoverable from source

At minimum, R20 closure must eventually prove:

- `PREFLIGHT`, `BOUNDARY_VALIDATION`, and `ADOPTION_VALIDATION` remain distinct as the recovered phase semantics, subject to exact-name confirmation in the Global Fidelity Audit;
- every consequential boundary has an explicit registered predicate set rather than a generic authorization bit;
- exact bound lineage/authority is revalidated, never replaced with current state;
- applicable authority/lifecycle/resource/capability/binding/evidence/freshness predicates are checked at the boundary;
- R20 consumes R18's exact operation-specific binding disposition and does not redefine `DEPRECATED` lifecycle policy;
- an already-frozen deprecated binding that R18 still permits is not blocked merely because its lifecycle label is `DEPRECATED`, while a R18 `BINDING_DEPRECATED_DISALLOWED` or other invalid/unresolved disposition blocks the applicable predispatch boundary;
- R6 readiness cannot be consumed after its exact governing conditions are invalid;
- R7 reservation existence alone does not grant boundary authority;
- R3 stale/unknown current-condition evidence blocks when current applicability is required;
- R17 valid Offer identity is separate from current eligibility;
- R19 complete lineage is separate from current eligibility;
- R14 handoff does not bypass boundary-time validation;
- R8 external truth survives blocked adoption;
- bad news blocks immediately while restored good state requires proof under the governing upstream semantics;
- boundary decisions are durable, operation-specific, and not perpetually reusable;
- A0 proves exact predicate identities and arbitrary concurrent multiplicity are representable without collision or overwrite;
- A1 inventories every existing consequential boundary and creates durable migration children for defects;
- forward engineering governance requires every future consequential surface to be classified/registered and prevents newly written bypass paths from silently escaping R20;
- `CONSEQUENTIAL_AUTHORITY_REGRESSION` preserves executed history and creates owned remediation;
- R11 corrective ownership never substitutes for a fresh R20 decision;
- pre-boundary failure blocks dispatch, post-boundary failure blocks adoption without erasing external history, and post-effect discoveries preserve history while stopping/repairing future authority.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 27. Start / local closure / E2E dependency result

### START

R20 contract/schema work may proceed once the exact authority identities and seams it consumes are sufficiently stable to define boundary predicates. Because R20 is a capstone, interface design can proceed before every upstream implementation is locally closed, but final certification cannot.

### LOCAL CLOSURE

R20 may locally close when boundary phases, exact operation-specific validators, Boundary Registry, durable decisions, exact-lineage revalidation, correct upstream-disposition consumption, A0 exact-identity/concurrent-multiplicity representability, A1 consequential-boundary audit, forward engineering-governance controls, authority-regression handling, known migration children, and final sibling sweep are complete.

Primitive existence is not closure. A validator library does not close R20 unless every consequential consumer has migrated or been explicitly audited out, and the development process prevents future consequential consumers from bypassing registration/gating by default.

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
- reinterpret R18 `DEPRECATED` lifecycle state independently of R18's operation-specific binding disposition;
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
- treat a one-current-authority schema as sufficient A0 representability when concurrent authority lineages/evaluations can coexist;
- treat a clean historical A1 audit as permission for future consequential code to bypass Boundary Registry registration;
- activate autonomous refund/cancel/void/reversal authority merely by validating that such an action would be desirable.

## 29. Source gaps and assurance status

The following original R20 details remain not fully recoverable from the available record and are not being invented:

1. exact Boundary Registry schema and field names;
2. exact boundary-decision schema/storage representation;
3. exact boundary class names beyond the recovered three-phase semantics;
4. exact literal enum/string names for the three phases if different from `PREFLIGHT` / `BOUNDARY_VALIDATION` / `ADOPTION_VALIDATION`;
5. exact validator-policy field names/versioning representation;
6. exact migration child labels and ordinals;
7. exact audit classification vocabulary if separately frozen;
8. exact acceptance-fixture labels/order;
9. exact closure-evidence list;
10. exact historical name and mechanical enforcement mechanism of the forward engineering-governance requirement;
11. exact worked scenarios beyond those recoverable above;
12. exact amendment/rejected-alternative wording beyond the preserved invariants.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

Recovery of R20 completes the node-recovery queue but does **not** restore implementation authority. The Global Fidelity & Cross-Node Audit remains the implementation gate, including substantive source-level rechecks for R4–R6 and normalization/review of R18 under the recovery assurance hierarchy.

## 30. First source-level review disposition

| Review item | Disposition | Recovery action |
|---|---|---|
| R18 `DEPRECATED_DISALLOWED` concern | `PARTIALLY ACCEPTED → VERIFIED AGAINST R18 AND CORRECTED` | Direct R18 source check confirmed that `BINDING_DEPRECATED_DISALLOWED` is a valid R18 disposition only when stronger policy disallows continuation; R18 also explicitly permits already-frozen deprecated bindings to continue by default with debt. R20 now consumes R18's exact disposition without redefining deprecation. |
| A0 concurrent-multiplicity scope | `PARTIALLY ACCEPTED → AMENDED` | Expanded A0 from single-identity representability to concurrent N-authority / N-boundary-decision representability, carrying the R9/R19 schema axiom explicitly. |
| Forward engineering-governance requirement | `UNRESOLVED → AMENDED AS NORMATIVE REQUIREMENT, EXACT HISTORICAL LABEL SOURCE-UNRESOLVED` | Added mandatory future consequential-surface classification/registration and mechanical/code-review enforcement semantics distinct from A1's retrospective audit. |
| Three-phase structure | `ACCEPTED` | Structure preserved. Exact literal enum names remain explicitly source-checkable rather than being silently overclaimed. |
| Remaining capstone content | `ACCEPTED` | No change required from first-pass review. |
| Rejections | `NONE` | No false asserted contract was retained. |

## 31. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.

## Amendment A — Consume exact composed R17/R18 commercial authority

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


--- END EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/WI-R20.md ---

--- BEGIN EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md ---

# Amendment Package 01A — Graph Delta

**Status at creation:** LANDED GRAPH DELTA / EFFECTIVE PENDING REQUIRED RECHECKS  
**Amendment node:** `RD-C-R17-R18`  
**Source PAIM:** `AMENDMENT_PACKAGE_01_PAIM_CANONICAL_FREEZE.md` blob `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`  
**G2 effect:** `UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`

## 1. Purpose

This immutable delta records only the graph relationships introduced or strengthened when Amendment A becomes current. It does not rewrite the frozen V4 register or retroactively alter historical graph evidence.

No edge becomes `CERTIFIED_CURRENT` solely because Amendment A lands.

## 2. Effective graph relationships

### A-GE-01
- source: `RD-C-R17-R18`
- target: `F07-04`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: exact R17 Offer/Grant ↔ R18 commercial-payment Binding composition
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-02
- source: `RD-C-R17-R18`
- target: `F07-03`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: R18 Binding/Validation ↔ R20 Decision using exact composed R17/R18 evidence
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-03
- source: `RD-C-R17-R18`
- target: `F07-09`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: R17 Offer/Grant ↔ R20 Decision using exact composed R17/R18 evidence
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-04
- source: `RD-C-R17-R18`
- target: `H2-E40`
- type: `REPRESENTATION_PREREQUISITE`
- scope: composed-authority-reference slice only
- future acceptance state: constrained by Amendment A

### A-GE-05
- source: `RD-C-R17-R18`
- target: `H2-E43`
- type: `REPRESENTATION_PREREQUISITE`
- scope: relational-validator-policy slice only
- future acceptance state: constrained by Amendment A

### A-GE-06
- source: `RD-C-R17-R18`
- target: `J-F04`
- type: `GOVERNANCE_PREREQUISITE`
- condition: only affected commercial-boundary enforcement slices consuming this predicate
- future acceptance state: constrained by Amendment A

### A-GE-07
- source: `RD-C-R17-R18`
- target: `J-F05`
- type: `GOVERNANCE_PREREQUISITE`
- condition: only affected allow/deny/degradation fixture slices consuming this predicate
- future acceptance state: constrained by Amendment A

### A-GE-08
- source: `RD-C-R17-R18`
- target: `RET-R17`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: preserve exact historical R17↔R18 composition without current-state reconstruction
- future acceptance state: constrained by Amendment A

### A-GE-09
- source: `RD-C-R17-R18`
- target: `RET-R18`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: preserve exact historical binding/composition evidence without current-state reconstruction
- future acceptance state: constrained by Amendment A

### A-GE-10
- source: `RD-C-R17-R18`
- target: `XPI-04`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: affected end-to-end provider-path component using exact R17/R18 composition
- post-land state: `EFFECTIVE_PENDING_RECHECK`

## 3. G2 disposition

`G2_A_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`

Amendment A composes already-governed provider/account identities and does not redefine provider/account identity, equality, continuity, or rebinding.

## 4. Frozen negative fan-out

No direct Amendment-A prerequisite is introduced for:

- `H2-E39`
- `NAME-H2-E41`
- `NAME-H2-E42`
- `J-F01`
- `J-F03`
- `J-F06`
- `RET-R20`
- `F07-15`

A later representation or semantic change that creates one of these relationships requires governed graph/PAIM re-derivation.

## 5. Frozen-register preservation

The frozen V4 register and canonical register-freeze artifact remain immutable historical evidence. This delta is additive control-plane history; it does not rewrite those artifacts in place.


--- END EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_GRAPH_DELTA.md ---

--- BEGIN EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md ---

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


--- END EXACT PROSPECTIVE CONTENT: docs/remediation-contracts/AMENDMENT_PACKAGE_01_A_LANDING_EVENT.md ---

## 6. Current disposition

`FIVE_PROSPECTIVE_WRITER_BLOBS = CONSTRUCTED_AND_PINNED`

`LITERAL_COMPLETE_CONTENT = EMBEDDED_FOR_REVIEW`

`BRANCH_REF_MOVED_DURING_BLOB_CONSTRUCTION = NO`

`FINAL_LANDING_PARENT_TREE = NOT_YET_SELECTED`

`EMPIRICAL_CONCURRENCY_EVIDENCE = PENDING_GOVERNANCE_DECISION`

`AMENDMENT_A_MAY_LAND = NO`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
