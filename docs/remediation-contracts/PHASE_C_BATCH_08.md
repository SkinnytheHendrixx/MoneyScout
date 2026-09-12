# Money Scout — Phase C Batch 08

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Governing protocol:** `PHASE_C_CLASSIFICATION_PROTOCOL.md` as amended through Batch C-06  
**Implementation authority:** SUSPENDED  
**Edges:** `R1 -> R7`, `R6 -> R7`, `R19 -> R20`

## 1. C08-01 — R1 -> R7

**R1 blob:** `af010e01aaaf4e3454b6e88fc390d4502151d16a`  
**R7 blob:** `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

### R1 declaring text

> **Core rule:** `UNKNOWN` is neither zero nor “every resource bucket.” Resource state must identify what resource is being discussed, in what unit, under what source/bucket attribution, and what is actually committed versus consumed.
>
> R1 defines resource semantics. It does **not** create reservation authority; R7 owns atomic scarce-resource reservation and admission.

And:

> R1 answers:
>
> What resource fact is actually represented here?
>
> R7 answers:
>
> May scarce capacity be atomically reserved/committed across all relevant aggregate scopes?
>
> Therefore:
>
> - R1 must not introduce local “safe to spend/use” booleans;
> - R1 must not authorize dispatch;
> - R1 must not treat a truthful resource observation as permission to consume that resource;
> - R7 must consume R1 semantics without reinterpretation.

And:

> ## 5. R1 → R7 compatibility gate
>
> The compatibility gate frozen during confirmation is not satisfied merely because R7 can read an R1-shaped object.
>
> R1→R7 certification must prove all of the following together:
>
> 1. R1 truthfully distinguishes source/bucket/unit/committed/consumed/provenance.
> 2. `UNKNOWN` remains unknown through the R7 admission path; it is not normalized to zero or a permissive default.
> 3. R7 fails closed against materially unknown scarce-resource state rather than manufacturing headroom.
> 4. R7 does not reinterpret an R1 commitment as consumption, or consumption as a released commitment.
> 5. A committed ceiling that has not yet been fully consumed cannot increase available headroom until later authoritative release/reconciliation permits it.
> 6. Resource semantics remain stable across all R1-migrated surfaces consumed by R7.
>
> This gate later composes with the explicit **R1×R2×R7** certification: truthful resource semantics + preserved unresolved economic/operational uncertainty + fail-closed atomic reservation.

And:

> **Additional headroom cannot increase merely because a committed ceiling has not yet been observed as consumed.**

And:

> **frozen numeric case:** allocation = 100, commitment = 100, consumption = 10 **cannot report 90 as new commitment authority** merely because only 10 has been consumed;
>
> no unconsumed portion of a commitment becomes headroom until authoritative release/reconciliation owned elsewhere proves it.

And:

> - `committed - consumed` ≠ automatically released/free.
> - `observation` ≠ `authority`.
> - `resource semantics` (R1) ≠ `atomic reservation/admission` (R7).

And:

> ### R1 vs R7
>
> R1 defines truthful resource state; R7 atomically reserves scarce resources and enforces aggregate authority.

And:

> R7 need not be globally CLOSED merely for R1 to close locally; R1 must expose an implementation-compatible semantic interface that R7 can consume without reinterpretation.

And:

> Requires the **R1×R2×R7** compound gate and any later full-Fund/Factory scenario that depends on truthful resource semantics.

### R7 referenced text

> R1 answers: what resource is this operation actually committing or consuming?
>
> R7 answers: may this operation exclusively reserve that resource now?
>
> R7 must not reinterpret R1 resource meanings to make admission easier.
>
> **R1 is non-authoritative for reservation. R7 is non-authoritative for redefining resource truth.**

And:

> Canonical pool identity must be compatible with R1 typed resource semantics and preserve resource class, unit, scope type/identity, provider/account where applicable, and owner/Fund/Bet/Asset lineage.

And:

> ### R1 × R7 — semantic truth plus exclusive admission
>
> Two Bets share one resource pool. Both are individually within their allocations but jointly exceed the shared pool. One obtains a valid reservation; the other atomically blocks. Aggregate committed exposure never exceeds the ceiling.

And:

> **M. R1 compatibility.** R7 consumes typed resource effects and never derives cost/resource class from superficial field shape such as "contains cents."

And:

> - **R7 vs R1:** resource truth vs reservation authority.

And:

> Hard implementation prerequisite for canonical accounting integration: R1 interface must be sufficiently frozen that R7 is not forced to reinterpret broken resource semantics.

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R7 directly consumes R1's typed resource semantics and R1 explicitly requires consumption without reinterpretation. `COMPOSES` is independently justified because truthful resource semantics and exclusive reservation/admission are separately necessary predicates. `OWNERSHIP_BOUNDARY` preserves resource truth as R1-owned and reservation/admission authority as R7-owned. `CERTIFICATION_DEPENDENCY` is **operational/joint-fixture strength**, supported by the six-part compatibility gate, shared-pool race, frozen `100 / 100 / 10` commitment fixture, and R1×R2×R7 E2E certification.

The adversarial ownership concern is resolved by the actual shape of R1's headroom language. R1 does not compute an affirmative headroom amount or grant permission to use one. Its statements are negative semantic constraints: unconsumed commitment may not be reported or reinterpreted as released/new commitment authority, and positive release/reconciliation is explicitly "owned elsewhere." This is a fact-preservation obligation analogous to a fail-closed veto predicate, not downstream admission/accounting authority.

No `OWNERSHIP_MISATTRIBUTION` is established. No strengthening is required for this edge.

## 2. C08-02 — R6 -> R7

**R6 blob:** `d4d613a40eed187c230d55f7e21b1b0251bf612a`  
**R7 blob:** `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

### R6 declaring text

> **Frozen mission statement:** R6 exists to make capability readiness a canonical adjudicated claim, select the strongest verifier applicable to that claim, and prevent weaker evidence from manufacturing stronger machine authority.

And:

> **R6 × R7 — verified capability vs. resource authority.** R6 answers: is the claimed capability actually proven strongly enough to be used? R7 answers: is the resource/entitlement behind that use reserved and authorized now?
>
> **Required invariant: a strongly verified provider capability creates no resource authority, and a valid reservation cannot make an unverified capability usable.**
>
> Concrete scenario: provider access is genuinely automation-ready → entitlement capacity is unavailable/exhausted → R7 blocks execution. Reverse: resource entitlement is available/reserved → capability was only human-attested where automated verification is required → R6 blocks capability use. Neither substitutes for the other.

And:

> ## 16. Safety-required verification work consumes R7
>
> R5 established the broader rule: **safety-required secondary work is still work.** R6 consumes the same rule. If an automated verifier requires paid model/provider calls, scarce API entitlement, external transaction/test operation, limited account capacity, or another scarce resource, the verifier execution must consume R7 reservation authority. R6's requirement that stronger proof is necessary does not authorize the resources required to obtain that proof.

And:

> Multi-capability/outage recovery variant: many capabilities become due for re-verification at once → verifier jobs become runnable together → each must compete under R7 aggregate reservation. Correct safety verification must not become a resource bypass.

And:

> **Frozen R6×R7 side-effect symmetry rule (confirmed amendment):**
>
> Human attestation itself may be zero-cost, but any automatic work triggered by recording that attestation remains subject to the normal authority/resource rules.

And:

> **Recording human authority is not itself economic authority for whatever resumes afterward.**

And:

> **Explicit exception:** this is composition with R7, not a merger of R6 and R7 semantics, and it should **not** be over-applied. A pure local database write that genuinely consumes no scarce resource should not be artificially forced through R7 merely because the general principle exists — the rule protects against real downstream resource consumption triggered by attestation, not against attestation itself.

And:

> **R6 ↔ R7:** agree on capability; entitlement; resource availability; verification state; reserved capacity; usable. In particular: `AUTOMATION_READY` ≠ `ENTITLEMENT_RESERVED`.

And:

> - **R6 vs R7:** capability truth vs. economic/resource authorization.

And:

> **J. R7 composition.** Strongly verified capability + unavailable entitlement: execution blocked by R7. Reserved entitlement + insufficient verification: execution blocked by R6.

And:

> 16. R6↔R7 compatibility PASS or `PENDING E2E`;

### R7 referenced text

> ### R6 × R7
>
> Verified capability ≠ reserved entitlement. Valid reservation ≠ verified capability. Both must hold.

And:

> ### R6 verification burst consuming R7
>
> Automated safety verification can consume scarce resources and remains R7-governed.

And:

> **R6 ↔ R7:** `AUTOMATION_READY` remains distinct from `RESOURCE_RESERVED`.

And:

> - **R7 vs R6:** capability proof vs resource capacity.

And:

> Search for:
>
> ...
> - review/verification/remediation exempted because "safety work."

And:

> Capability seam: **R6 + R7** → proven usable capability + reserved resource.

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: this edge contains two distinct but compatible relationships that must not be flattened into one claim.

First, the **core capability-authority seam** is parallel-not-merged composition: R6 capability proof and R7 resource authority are independently necessary, and neither substitutes for the other. This supports `COMPOSES` and `PARALLEL_NOT_MERGED`.

Second, `CONSUMES` applies specifically to the **verifier-execution / triggered-work subpath**: where R6 verification itself uses paid calls, scarce entitlement, external test operations, or other governed resources, that R6 work consumes R7 reservation authority. The `CONSUMES` tag does **not** assert that the abstract proposition "capability readiness" consumes resource authority merely by existing.

`CERTIFICATION_DEPENDENCY` is **operational/joint-fixture strength**, supported by Fixture J, the outage/reverification burst, the side-effect symmetry rule, and the explicit R6↔R7 E2E compatibility obligation.

The proportionality limit is also explicit in source: pure local database writes that genuinely consume no scarce resource are not artificially forced through R7. The source therefore already prevents the resource-safety rule from becoming ceremony around every R6 state mutation.

No primary/tag change and no additional fixture are required for this edge.

## 3. C08-03 — R19 -> R20

**R19 blob:** `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`  
**R20 blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`

### R19 declaring text

> **A consequential commercial action is not fully attributable unless the system can traverse one immutable lineage from originating opportunity/evaluation authority through the exact build, artifact, offer, provider/account operation, customer transaction, and resulting financial evidence.**

And:

> `Opportunity → exact Evaluation Cycle → Bet → Product Definition → R9 Build Source Snapshot / Build → R10 Artifact Version → production Release / Asset → R17 Offer Version → CUSTOMER_CHARGING Grant → exact provider/account commercial operation → checkout/customer contract → transaction → R15 Provider Financial Observation → R16 canonical reconciliation`

And:

> R19 requires a named, immutable **Commercial Authority Lineage Reference** or equivalent canonical object representing the composed authority that will govern one consequential commercial execution path.

And:

> The Lineage Reference must carry a composite fingerprint over the exact authority dimensions needed to distinguish one historical commercial path from another. At minimum where applicable, that fingerprint/reference must bind:
>
> - exact originating Opportunity / Evaluation Cycle / Bet / Product authority;
> - exact R9 Build Source Snapshot / Build identity;
> - exact R10 Artifact Version / production Release or deployment identity;
> - exact R17 Offer Version and `CUSTOMER_CHARGING` Grant;
> - exact provider and provider-account identity under `DI-1/COMMERCIAL_PAYMENT`;
> - exact checkout/payment configuration and customer-contract / subscription / order identity;
> - exact commercial session / execution-attempt identity where applicable;
> - exact R8 external execution identity for a dispatched attempt;
> - exact transaction/charge/payment identity when created;
> - downstream R15/R16 financial evidence/reconciliation linkage as it becomes available.

And:

> **A traversable path proves that records can be connected. A frozen Commercial Authority Lineage Reference proves which exact composed authority was selected before consequential execution.**

And:

> ## 18. Commercial Authority Lineage Reference must be frozen before dispatch
>
> A complete **Commercial Authority Lineage Reference** used for a consequential commercial operation must be created/bound before the provider/customer boundary is crossed.
>
> R19 must not perform the commercial action first and attempt to discover afterward which Offer, Artifact, Evaluation Cycle, provider account, checkout configuration, session, or transaction authority probably authorized it.
>
> The frozen Lineage Reference / composite fingerprint is historical provenance, not perpetual permission.
>
> R20 separately determines whether that exact frozen lineage remains eligible at the relevant boundary/adoption moment.
>
> **Frozen lineage tells us which authority path is being consumed. It does not by itself prove that path is still eligible now.**

And:

> ## 19. R20 boundary — lineage versus eligibility
>
> R19 answers **where this exact commercial authority came from and which immutable historical path it belongs to**.
>
> R20 answers **whether that exact lineage may be consumed now**.
>
> A complete lineage may still be ineligible because an Offer was superseded, a capability binding was revoked, resource authority changed, evidence became stale, lifecycle state changed, or another boundary-time predicate failed.
>
> Conversely, current eligibility cannot repair incomplete historical lineage by substituting newer/current identities.
>
> R20 also cannot retroactively convert a previously unauthorized historical effect into an authorized one merely because the equivalent lineage is valid now.

And:

> - R20 independently revalidates current eligibility of the exact frozen lineage.

And:

> R20 need not be locally closed for R19 historical lineage to exist, but consequential commercial E2E certification remains pending until R20 validates current eligibility at each required boundary.

And:

> The hard-chain relationship remains:
>
> `R4 → R9 → R10 → R17 → R19 → R20`

And:

> R19 must not:
>
> ...
> - use complete lineage as perpetual R20 permission;
> ...

### R20 referenced text

> R20 consumes, where applicable:
>
> ...
> - R19 complete immutable commercial lineage;
> ...

And:

> - **R17:** what commercial authority object exists;
> - **R19:** where that authority came from and which exact immutable lineage it belongs to;
> - **R20:** whether that exact authority may be consumed **now**.
>
> **Identity tells us what authority exists. Lineage tells us where it came from. Boundary fencing tells us whether it may be consumed now.**

And:

> R20 revalidates current eligibility of the **exact bound authority/lineage**. It does not repair an ineligible historical object by substituting whatever is current now.

And:

> - frozen R19 Commercial Authority Lineage Reference L1 is not replaced with current lineage L2.

And:

> For a consequential boundary, R20 must revalidate all predicate families applicable to that exact action.
>
> ...
>
> Not every boundary consumes every predicate, but every applicable predicate must be identified explicitly rather than assumed.

And:

> ## 12. R19 boundary — complete lineage can still be currently ineligible
>
> R19 proves the complete immutable historical authority path and supplies the frozen Commercial Authority Lineage Reference.
>
> R20 consumes that exact lineage reference at the relevant boundary.
>
> A complete lineage may still fail current eligibility.
>
> Conversely, current eligibility cannot cure incomplete lineage by substituting newer/current identities.
>
> **Lineage completeness and current eligibility are independent predicates. Both are required.**

And:

> A0 is not satisfied by proving that one exact authority can be represented in isolation. It must also prove the schema can represent **multiple concurrently relevant historical or in-flight authorities and boundary evaluations without identity collision, overwrite, or implicit one-current-authority assumptions**.

And:

> R20 A0 must include a multiplicity fixture in which at least two and conceptually arbitrary N distinct authority lineages for the same higher-level scope can have independent boundary decisions in flight or preserved historically at once, and each decision remains bound to the exact authority it evaluated.

And:

> Final R20 certification must compose with all applicable upstream authority nodes, especially:
>
> ...
> - `R4 → R9 → R10 → R17 → R19 → R20`
> ...

And:

> R20 must not:
>
> ...
> - treat complete lineage as perpetual permission;
> - treat current eligibility as a repair for incomplete lineage;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `HARD_CHAIN`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R20 literally consumes R19's exact frozen Commercial Authority Lineage Reference. Both artifacts explicitly preserve the `R4 → R9 → R10 → R17 → R19 → R20` hard chain. `OWNERSHIP_BOUNDARY` is load-bearing because R19 owns immutable historical-lineage completeness while R20 owns present boundary-time consumability; neither can repair or substitute for the other. `CERTIFICATION_DEPENDENCY` is **operational/integration strength**, supported by R19's pending-E2E rule, R20's boundary/A0 fixtures, and explicit hard-chain certification.

`COMPOSES` is intentionally omitted. Direct `CONSUMES` plus explicit `HARD_CHAIN` already describe the integration path; the distinct additional semantic fact on this seam is historical-lineage completeness versus current eligibility.

The checked text resolves the apparent temporal tension enough to preserve `CONSISTENT_CONSUMPTION`: R19's fields are qualified by `where applicable`, `for a dispatched attempt`, `when created`, and `as it becomes available`, while R20 explicitly says not every boundary consumes every predicate. Nothing requires future execution/transaction/financial facts to exist before they can legitimately exist.

However, the current contracts do not turn that resolution into an explicit phase-relative completeness fixture. That omission can produce two implementation failures: pre-dispatch validation that is impossible because it demands future facts, or fabricated placeholder/default/synthetic downstream identities inserted merely to satisfy a naive global completeness test. This is a concrete implementation-governance gap rather than a contradiction.

### Required acceptance-fixture strengthening

This batch records the following future implementation-governance requirement for the R19/R20 seam:

> **R19 lineage completeness consumed by R20 must be evaluated relative to the exact consequential phase/boundary: every lineage fact required and legitimately available at that phase must be present and exact, while facts that cannot yet legitimately exist must remain not-yet-applicable rather than being required, guessed, defaulted, or synthetically fabricated.**

Required fixture semantics:

1. define the exact lineage-field/predicate set required at the **pre-dispatch** boundary, including the frozen authority prefix through the applicable Offer Version / `CUSTOMER_CHARGING` Grant / provider-account / checkout or pre-execution authority dimensions, and explicitly excluding downstream execution/transaction/financial facts that cannot yet exist;
2. prove pre-dispatch R20 validation can succeed when every pre-dispatch-required field is exact and eligible even though R8 execution identity, transaction/charge/payment identity, and R15/R16 linkage are legitimately absent;
3. prove the same pre-dispatch validation fails closed if any **pre-dispatch-required** lineage field is missing, unknown, mismatched, or ineligible, and does not confuse that defect with a downstream field that is merely not yet applicable;
4. prove no implementation may satisfy pre-dispatch lineage completeness by inserting a placeholder, default, synthetic, current-state-derived, or guessed value for any downstream execution/transaction/financial field that does not yet legitimately exist;
5. prove a **post-dispatch** boundary/adoption check additionally requires the exact R8 execution segment for the dispatched attempt, with the same fail-closed and no-placeholder/no-substitution discipline;
6. prove an **adoption/transaction/financial** boundary additionally requires the exact transaction/charge/payment identity and applicable R15/R16 financial linkage once those facts are legitimately required/available, again without rewriting the frozen pre-dispatch authority identity or fabricating missing downstream truth.

This strengthening is distinct from Batch C-05's R19/R16 fingerprint-stability fixture. C05 proves later financial linkage must not mutate the frozen pre-dispatch authority fingerprint. C08 proves which lineage facts are required at which R20 phase and forbids future-fact fabrication to satisfy a naive global completeness test.

This strengthening does not amend R19 or R20 during Phase C. If either endpoint changes later, exact applicability of the fixture must be rechecked against the amended semantics before it is consumed as implementation governance.

## 4. Batch result

All three edges are accepted as non-contradictory under the checked pinned endpoint blobs.

No `UPSTREAM_SEMANTIC_REDEFINED`, `UPSTREAM_SCOPE_NARROWED`, `UPSTREAM_SCOPE_BROADENED`, `IDENTITY_SUBSTITUTION_RISK`, `AUTHORITY_LAUNDERING_RISK`, `MISSING_REQUIRED_COMPOSITION`, `OWNERSHIP_MISATTRIBUTION`, `ASSURANCE_OVERCLAIM`, or `UNRESOLVED_CROSS_NODE_GAP` was established in Batch 08.

Adversarial review produced one rationale clarification and one concrete acceptance-fixture strengthening:

1. `R1 -> R7`: no correction required. R1's headroom language is a negative semantic/fact-preservation constraint and does not claim affirmative reservation/accounting authority.
2. `R6 -> R7`: retain `CONSUMES`, but make explicit that it applies specifically to the resource-consuming verifier/triggered-work subpath, while the core capability/readiness proposition remains a parallel-not-merged composition with R7 resource authority.
3. `R19 -> R20`: add a required six-step phase-relative lineage-completeness fixture, including an explicit prohibition on placeholders/defaults/synthetic future facts at pre-dispatch.

No R1/R6/R7/R19/R20 endpoint blob was amended.

The final narrow-tag/topology sets are:

- `R1 -> R7`: `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`; `BILATERAL_CORROBORATION`
- `R6 -> R7`: `CONSUMES`, `COMPOSES`, `PARALLEL_NOT_MERGED`, `CERTIFICATION_DEPENDENCY`; `BILATERAL_CORROBORATION`
- `R19 -> R20`: `CONSUMES`, `HARD_CHAIN`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`; `BILATERAL_CORROBORATION`

All three current `CERTIFICATION_DEPENDENCY` uses are operational/integration-strength under the interim protocol rule established in Batch C-06.

## 5. Invalidation

Any endpoint blob change invalidates the affected edge result under the frozen Phase C endpoint-SHA rule, including primary classification, semantic relation tags, corroboration topology, endpoint source excerpts, and downstream conclusions that consume the result.

The C08-03 acceptance-fixture strengthening is a durable Batch 08 audit conclusion. If R19 or R20 changes, exact applicability must be rechecked against the amended semantics before the fixture is consumed as implementation governance.

## 6. Relay-contamination guard

This batch record terminates here. No conversational handoff text is part of the record.
