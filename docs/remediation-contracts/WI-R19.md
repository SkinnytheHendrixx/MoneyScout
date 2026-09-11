# WI-R19 — Complete Immutable Commercial Lineage

**Normalized node:** R19  
**Historical finding:** C5-F1  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R19 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing exact schema/storage representation, migration ordinals other than specifically recoverable named migrations, fixture labels/order, audit vocabulary, or closure-evidence numbering from compressed summaries.

R19 is the complete-lineage node for consequential commercial activity. It composes already-recovered identity and authority from R4, R9, R10, R17, R8, R15, and R16 into one immutable historical path.

Where exact historical detail is unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R19 exists because commercial execution cannot be certified from a collection of individually valid objects if the system cannot prove that they all belong to the same exact historical authority path.

> **A consequential commercial action is not fully attributable unless the system can traverse one immutable lineage from originating opportunity/evaluation authority through the exact build, artifact, offer, provider/account operation, customer transaction, and resulting financial evidence.**

Association by mutable current pointers, convenient foreign keys, or same-Asset membership is not sufficient authority.

R19 therefore owns complete immutable commercial lineage representation and validation.

## 3. Canonical lineage path

The recovered complete commercial lineage is:

`Opportunity → exact Evaluation Cycle → Bet → Product Definition → R9 Build Source Snapshot / Build → R10 Artifact Version → production Release / Asset → R17 Offer Version → CUSTOMER_CHARGING Grant → exact provider/account commercial operation → checkout/customer contract → transaction → R15 Provider Financial Observation → R16 canonical reconciliation`

The exact storage graph may differ, but every materially authoritative segment must remain historically traversable without substituting current mutable state.

Where an element is not applicable to a specific commercial action, the omission must be explicitly governed rather than silently skipped because the implementation lacks a field.

## 4. R4 boundary — exact Evaluation Cycle is mandatory

R19 must retain the exact originating Evaluation Cycle, not the currently active/latest cycle.

A later Evaluation Cycle may coexist with valid historical commercial activity from an earlier cycle. Current state cannot rewrite that history.

If exact Evaluation Cycle lineage is unknown, the commercial lineage is not complete merely because Opportunity, Bet, or Asset identity is known.

R4's lineage states and fail-closed behavior remain authoritative upstream.

## 5. R9 boundary — immutable build-source authority

The Build segment of commercial lineage must originate from an immutable R9 Build Source Snapshot or equivalent exact source authority.

A branch name, current repository HEAD, mutable tag, or reconstructed current state cannot be substituted for the actual source authority that produced the commercialized artifact.

If R9 source authority is `SOURCE_AUTHORITY_UNPROVEN`, downstream commercial lineage cannot become stronger merely because later Offer/transaction objects exist.

## 6. R10 boundary — exact artifact/release identity

R19 must preserve the exact R10 Artifact Version and production Release/deployment that were commercialized.

The Artifact verified by QA and the Artifact actually released must remain distinguishable from later rebuilds or current production pointers.

A rebuilt or successor artifact is a new identity unless authoritative equivalence has been separately proven under the governing contracts.

## 7. R17 boundary — exact immutable Offer Version and charging grant

R19 consumes R17's exact Offer Version and `CUSTOMER_CHARGING` Grant as the commercial-authority segment of the lineage.

An Asset-level `commercialActive`, current Offer pointer, current price, or current monetization configuration cannot substitute for the historical Offer Version that governed the action.

The lineage must retain exact provider/account identity under `DI-1/COMMERCIAL_PAYMENT` where applicable.

Commercial Grant revocation or Offer supersession does not erase historical lineage for actions already executed under prior valid authority.

## 8. Provider/account commercial execution is first-class lineage

The lineage must preserve the exact provider and exact provider-account identity used for the consequential commercial operation.

A logical capability identity is insufficient if the actual economic action occurred through a specific account.

The system must not attribute historical execution to whichever provider/account is current now.

Provider/account substitution for historical lineage is prohibited.

## 9. Checkout and customer contract are first-class lineage nodes

Checkout configuration and customer-contract identity are not disposable implementation details.

Where applicable, R19 must preserve:

- exact checkout/payment configuration identity;
- exact Offer Version represented to the customer;
- exact customer contract/subscription/order identity;
- the commercial terms fingerprint or equivalent immutable terms identity;
- the exact transaction/charge/payment identity produced under that contract.

A signed provider webhook can establish external authenticity of a provider event. It does **not** by itself prove the complete internal authority lineage that justified the transaction.

> **External authenticity is not the same thing as internal authority provenance.**

## 10. Transaction identity is immutable historical evidence

A transaction must bind to the exact historical authority path that produced it.

Later refund, reversal, dispute, correction, settlement, or subscription state changes do not rewrite the original transaction's authority lineage.

If a later economic action occurs, it receives its own governed execution/financial history rather than being represented as retroactive replacement of the original lineage.

## 11. R8 boundary — exact execution truth inside lineage

Where a commercial provider operation crossed or may have crossed an external boundary, R19 must retain the exact R8 execution identity.

R19 must not collapse multiple external attempts into one commercial lineage merely because they target the same Offer/customer/transaction intent.

A fresh external call is a fresh execution identity. Historical reconciliation remains attached to the execution it actually describes.

## 12. R15/R16 boundary — financial evidence and reconciliation remain attributable

R19 must preserve the link from the exact commercial operation/transaction to R15's immutable provider-originating financial observations and R16's canonical financial interpretation.

R15/R16 cannot reconstruct missing commercial authority from a current Asset or current Offer.

Likewise, a complete upstream commercial lineage does not permit R19 to fabricate financial facts absent R15/R16 evidence.

Where R16 later revises canonical financial truth, the lineage remains historically attached to the original execution and transaction rather than being rewritten to a different current commercial object.

## 13. Association is not authority

A database relationship or foreign key is not sufficient simply because it connects records.

The relationship must encode the exact historical authority path and preserve the immutable identities required by the governing upstream nodes.

Examples of insufficient shortcuts include:

- transaction has `assetId`, therefore lineage is complete;
- transaction has `offerId`, but Offer is mutable/current rather than exact Offer Version;
- financial row has `executionId`, but the provider/account/Offer/transaction path is missing;
- customer contract is attached to current Asset state without exact Offer Version;
- Build and Release both reference the same repository but not the exact R9/R10 identities.

> **Association can locate records. It does not manufacture authority.**

## 14. Current-state reconstruction is prohibited

R19 must not reconstruct historical commercial lineage by joining through whatever objects are current at query time.

Prohibited examples include:

- current Evaluation Cycle substituted for the originating cycle;
- current repository HEAD substituted for R9 source snapshot;
- current deployment substituted for R10 Artifact Version;
- current Offer substituted for historical Offer Version;
- current provider/account substituted for historical execution account;
- current subscription state substituted for the exact customer contract/transaction authority that existed at execution time.

History must be recorded when authority is created/consumed, not reverse-engineered later from current state.

## 15. Legacy reconstruction policy

Legacy records may be upgraded to complete lineage only where deterministic reconstruction from durable evidence is unique and authoritative.

Recovered provenance classes include:

- `FRESHLY_BOUND`
- `DETERMINISTICALLY_RECONSTRUCTED`
- `LEGACY_UNPROVEN`

A legacy lineage must remain `LEGACY_UNPROVEN` when multiple plausible historical paths exist or required exact identities cannot be established.

Current state must not be used to force a unique answer where the historical record is ambiguous.

## 16. Commercial Activation cardinality defect — known migration M14

A specifically recovered schema defect is the current one-Asset uniqueness assumption represented by:

`commercial_activations_asset_unique`

That shape cannot represent multiple historically distinct commercial authorities for the same Asset.

R19 requires commercial activation/execution authority to be keyed at the exact immutable lineage / Offer execution-attempt level rather than enforcing one historical activation per Asset.

An Asset may legitimately have multiple sequential or otherwise historically distinct Offer Versions, charging Grants, checkout preparations, customer contracts, and transactions.

A current-activation pointer may exist for convenience, but it cannot be the only representable commercial history.

> **If the data model cannot represent multiple historically distinct authorities at once, no downstream lineage logic can make the system historically correct.**

Migration M14 must remove or replace the one-Asset historical-authority assumption without deleting prior valid history.

## 17. Concurrent-history requirement

R19 must be able to represent multiple valid historical commercial lineages for the same Asset at the same time.

For example:

- O1 governed existing customer contract C1;
- O2 is current for new customers;
- O1 remains historically authoritative for renewal or obligation handling under C1 where policy permits;
- O2 governs a separate new checkout/contract C2;
- both lineages remain queryable and attributable without one overwriting the other.

This is not duplicate state. It is distinct historical authority.

## 18. Lineage reference must be frozen before dispatch

A complete lineage reference used for a consequential commercial operation must be bound before the provider/customer boundary is crossed.

R19 must not perform the commercial action first and attempt to discover afterward which Offer, Artifact, Evaluation Cycle, provider account, or checkout configuration probably authorized it.

The frozen lineage reference is historical provenance, not perpetual permission.

R20 separately determines whether that exact frozen lineage remains eligible at the relevant boundary/adoption moment.

> **Frozen lineage tells us which authority path is being consumed. It does not by itself prove that path is still eligible now.**

## 19. R20 boundary — lineage versus eligibility

R19 answers **where this exact commercial authority came from and which immutable historical path it belongs to**.

R20 answers **whether that exact lineage may be consumed now**.

A complete lineage may still be ineligible because an Offer was superseded, a capability binding was revoked, resource authority changed, evidence became stale, lifecycle state changed, or another boundary-time predicate failed.

Conversely, current eligibility cannot repair incomplete historical lineage by substituting newer/current identities.

## 20. R7/R8/R15/R16 financial-safety composition

Where commercial execution spends or creates economic exposure, complete lineage must compose with the R7/R8/R15/R16 financial-safety chain.

R19 does not redefine their semantics. It ensures that the reservation/execution/financial evidence can be attributed to the exact same historical commercial authority path.

A financial result attached to the wrong Offer/provider/account/transaction lineage is not cured merely because the arithmetic reconciles.

## 21. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**R19 treatment:** CONSUMES ACTIVATED `DI-1/COMMERCIAL_PAYMENT` SCOPE FROM R17 WHERE APPLICABLE

R19 must preserve the exact commercial provider/account identity throughout lineage and must not collapse it into logical capability identity.

R19 does not broaden the activation beyond the commercial/payment scope simply by preserving historical account identity.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R19 lineage storage:** NO

R19 can represent lineage for reversal/refund/cancel/void transactions if they exist. DI-2 activates when such an external economic action is autonomously dispatched, not merely because R19 records its history.

A reversal lineage must coexist with, not erase, the original transaction lineage.

## 22. Known migration surfaces recoverable from record

The available record confirms R19 migration scope includes, at minimum:

- complete immutable commercial-lineage reference/schema;
- exact R4 Evaluation Cycle binding;
- R9 Build Source Snapshot / Build lineage;
- R10 Artifact Version / Release lineage;
- R17 Offer Version and `CUSTOMER_CHARGING` Grant lineage;
- exact provider/account operation identity;
- checkout/payment configuration identity;
- customer contract/subscription/order identity;
- transaction identity;
- R8 exact external execution linkage;
- R15 Provider Financial Observation linkage;
- R16 canonical reconciliation linkage;
- legacy-lineage reconstruction/provenance classification;
- removal/replacement of `commercial_activations_asset_unique` as known migration M14;
- current convenience pointers separated from immutable historical lineage;
- concurrent multiple historical commercial lineages per Asset;
- semantic audit of every commercial path that reconstructs authority from current mutable state.

Exact migration labels/ordinals other than the specifically recovered M14 item remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 23. Semantic sibling sweep

Search for patterns including:

- commercial action stores only `assetId` and reconstructs the rest later;
- current/latest Evaluation Cycle used for a historical transaction;
- branch/current HEAD used instead of exact R9 source authority;
- current deployment used instead of exact R10 Artifact Version;
- current Offer used instead of exact R17 Offer Version;
- provider/account omitted or substituted with current account;
- signed provider webhook treated as proof of complete internal authority lineage;
- transaction linked to Offer but not exact Offer Version / Grant;
- financial evidence linked to execution but not exact commercial lineage;
- one-Asset uniqueness prevents O1 and O2 histories coexisting;
- `commercial_activations_asset_unique` or equivalent enforces one historical authority per Asset;
- legacy lineage silently reconstructed from current state;
- multiple plausible legacy lineages forced into one deterministic answer without sufficient evidence;
- new provider call reuses a prior execution identity because customer/Offer intent is the same;
- frozen lineage reference created only after consequential dispatch;
- complete historical lineage treated as perpetual R20 eligibility.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 24. Acceptance semantics recoverable from source

At minimum, R19 closure must eventually prove:

- one immutable lineage can be traversed from Opportunity through exact Evaluation Cycle, Bet, Product, Build Source/Build, Artifact/Release, Offer Version/Grant, provider/account operation, checkout/customer contract, transaction, R15 evidence, and R16 reconciliation where applicable;
- current mutable pointers are never required to reconstruct an already-completed commercial action;
- R4 exact Evaluation Cycle is preserved;
- R9 exact source authority is preserved;
- R10 exact Artifact Version/Release is preserved;
- R17 exact Offer Version and `CUSTOMER_CHARGING` Grant are preserved;
- `DI-1/COMMERCIAL_PAYMENT` provider/account identity remains exact;
- checkout/customer contract/transaction identities are first-class;
- signed external authenticity does not substitute for internal lineage authority;
- fresh external calls use fresh R8 execution identity;
- R15/R16 financial truth remains attached to the exact commercial lineage;
- legacy lineage is reconstructed only when deterministic and authoritative, otherwise `LEGACY_UNPROVEN`;
- multiple historical lineages for one Asset can coexist;
- `commercial_activations_asset_unique` one-Asset authority constraint is removed/replaced under M14;
- lineage reference is frozen before consequential dispatch;
- R20 independently revalidates current eligibility of the exact frozen lineage.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 25. Start / local closure / E2E dependency result

### START

R19 contract/schema work may proceed once R4/R9/R10/R17 immutable identities and R8/R15/R16 linkage surfaces are sufficiently stable to define the complete lineage reference.

R20 interface design may proceed in parallel, but R19 must remain the historical-lineage layer rather than absorbing boundary-time eligibility.

### LOCAL CLOSURE

R19 may locally close when complete lineage representation, exact historical bindings, provider/account preservation, checkout/contract/transaction identity, legacy reconstruction policy, M14 `commercial_activations_asset_unique` remediation, concurrent-history representation, known migrations/audit children, and final sibling sweep are complete.

R20 need not be locally closed for R19 historical lineage to exist, but consequential commercial E2E certification remains pending until R20 validates current eligibility at each required boundary.

### E2E

Final certification must compose with at least R4, R7, R8, R9, R10, R15, R16, R17, R18, and R20 where relevant.

The hard-chain relationship remains:

`R4 → R9 → R10 → R17 → R19 → R20`

## 26. Explicit non-goals

R19 must not:

- redefine R4 evaluation-lineage semantics;
- redefine R9 source authority;
- redefine R10 artifact identity;
- redefine R17 Offer Version/commercial-grant authority;
- infer R8 execution truth from transaction existence;
- manufacture R15/R16 financial facts;
- treat current Asset/current Offer/current provider/current deployment state as historical authority;
- treat a signed provider event as sufficient proof of complete internal authority lineage;
- force one historical commercial authority per Asset;
- keep `commercial_activations_asset_unique` or an equivalent one-Asset historical-authority constraint as normative;
- reconstruct ambiguous legacy lineage from current state;
- use complete lineage as perpetual R20 permission;
- collapse reversal/refund history into retroactive erasure of the original transaction lineage.

## 27. Source gaps and assurance status

The following original R19 details remain not fully recoverable from the available record and are not being invented:

1. exact complete-lineage schema/field names and storage representation;
2. exact transaction/customer-contract field names;
3. exact full migration child labels/ordinals beyond specifically recovered M14;
4. exact audit name/classification vocabulary if separately frozen;
5. exact acceptance-fixture labels/order, including the precise label of the concurrent-N scenario if separately named;
6. exact closure-evidence list;
7. exact legacy reconstruction evidence threshold/schema if separately frozen;
8. exact amendment/rejected-alternative wording beyond the recovered invariants;
9. any original worked examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R20, but it does not restore R19 implementation authority.

## 28. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
