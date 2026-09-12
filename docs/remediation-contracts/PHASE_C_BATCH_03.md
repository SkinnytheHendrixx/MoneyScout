# Money Scout — Phase C Batch 03

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Governing protocol:** `PHASE_C_CLASSIFICATION_PROTOCOL.md`  
**Implementation authority:** SUSPENDED  
**Edges:** `R15 -> R16`, `R17 -> R19`, `R20 -> R17`

## 1. C03-01 — R15 -> R16

**R15 blob:** `1b46aa43f33c19e75ef0696286693592fbbf8c77`  
**R16 blob:** `7dd92976f68ee90540771b3710e42b6d5b7f396f`

### R15 declaring text

> R15 and R16 split this same underlying root into two distinct contracts: R15 owns preservation of raw provider-originating financial evidence before normalization, while R16 owns interpretation and deterministic reconciliation of the complete evidence set.

And:

> R15 therefore owns append-only provider financial observation capture. R16 later owns semantic interpretation and deterministic reconciliation.

And:

> Corrections append evidence; they do not erase the evidence that previously existed.
>
> R16 may derive a new canonical financial state from the full observation set, but that is distinct from mutating the R15 evidence layer.

And:

> ## 14. R16 boundary — capture versus interpretation
>
> R15 captures immutable evidence. R16 interprets the full evidence set under a versioned reconciliation policy.
>
> R15 must not decide whether a value means:
>
> - absolute total;
> - delta;
> - cumulative total;
> - reversal/adjustment;
> - informational-only amount;
> - final versus provisional precedence;
> - canonical incurred versus settled versus adjusted state.
>
> Those semantics belong to R16 unless the provider itself supplies an explicit raw semantic qualifier, in which case R15 preserves the qualifier as observed while R16 decides how it affects canonical state.
>
> **R15 preserves what the provider said. R16 decides what the complete evidence set means.**

And:

> The nodes remain distinct:
>
> - R7: what scarce resource exposure was admitted/reserved and when it may be released;
> - R8: whether/how the provider boundary was crossed and what exact execution exists;
> - R15: what provider-originating financial facts were durably observed;
> - R16: what canonical financial state follows from the complete evidence set under the governing policy.
>
> No one node may impersonate the others.

### R16 referenced text

> R15 preserves provider-originating financial observations before normalization. R16 consumes the complete immutable R15 observation set and derives canonical financial state deterministically under a versioned reconciliation policy.
>
> R16 must not absorb R15's capture responsibilities, and R15 must not pre-decide R16's semantic interpretation.

And:

> ## 3. R15 boundary — immutable evidence in, interpretation out
>
> R16 consumes R15 observations but does not rewrite them.
>
> R16 must preserve the distinction between:
>
> - evidence that was observed;
> - semantic interpretation applied to that evidence;
> - canonical financial state derived from the interpreted evidence.
>
> A correction in canonical financial state does not retroactively alter the R15 evidence record that led to earlier state.
>
> R16 must consume R15's exact provider/account/execution provenance, value-shape distinctions, redaction provenance, original currency/unit, temporal fields, and provider-native/synthetic identities where relevant.

And:

> ## 4. Versioned reconciliation policy
>
> Financial interpretation must be governed by an explicit reconciliation policy version.
>
> The policy determines how the complete R15 observation set maps into canonical financial meaning without changing the raw observations themselves.

And:

> ## 5. Provider financial semantic classes
>
> R16 must distinguish provider-observation semantics rather than assuming every amount means the same thing.
>
> Recovered semantic classes include:
>
> - `ABSOLUTE`
> - `DELTA`
> - `CUMULATIVE`
> - `REVERSAL`
> - informational / non-authoritative-for-balance observations

And:

> **Replay is the semantic oracle; incremental reconciliation is an implementation strategy.**

And:

> R16 must not:
>
> - mutate or normalize away R15 raw evidence;
> - redefine R15 value-shape or redaction-provenance semantics;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `PARALLEL_NOT_MERGED`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R15 owns preservation of immutable provider-originating observation truth; R16 consumes the complete R15 evidence set and owns interpretation/reconciliation under a versioned policy. Both artifacts independently prohibit capture from becoming interpretation and interpretation from rewriting capture.

Provider-supplied semantic qualifiers do not bypass R16. R15 preserves such a qualifier as observed evidence, while R16's own contract requires financial interpretation to be governed by an explicit reconciliation-policy version and separately classifies provider-observation semantics. The qualifier is therefore policy input, not self-executing canonical classification.

### Non-blocking verification note

Adversarial review requested a targeted check that R16 itself, not only R15, requires provider-supplied semantic qualifiers to pass through R16 policy rather than becoming canonical truth automatically.

That check is satisfied by R16 §4 and §5: R16 requires an explicit versioned reconciliation policy to map the complete R15 observation set into canonical meaning, and separately owns classification of provider-observation semantics. No endpoint amendment is required for this point.

## 2. C03-02 — R17 -> R19

**R17 blob:** `16a234e897fe6e119392707a7187a3232f0fd972`  
**R19 blob:** `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`

### R17 declaring text

> ## 18. R19 boundary — complete commercial lineage
>
> R17 supplies the immutable Offer Version / charging-grant segment that R19 needs for complete lineage.
>
> R19 must be able to traverse from upstream authority through exact Offer Version, provider/account commercial execution, customer contract/transaction, and downstream financial evidence.
>
> An Asset-level active bit or current Offer pointer cannot substitute for that immutable historical segment.

And:

> An Offer Version or equivalent immutable commercial-authority object must bind, where applicable:
>
> - Offer Version identity;
> - Asset identity;
> - originating Opportunity identity;
> - exact Bet identity;
> - exact originating Evaluation Cycle under R4;
> - exact Product Definition / commercial product authority;
> - exact R10 production Artifact Version;
> - exact production Release / deployment identity;
> - Monetization Plan identity/version;
> - provider identity;
> - exact provider-account identity;
> - currency;
> - price / pricing model;
> ...
> - exact checkout / payment configuration identity where applicable;
> - commercial terms fingerprint or equivalent immutable identity proof;
> ...

And:

> R19/R20 interface contracts may be designed in parallel, but R17 must remain the exact commercial-authority-object layer rather than absorbing full-lineage validation or boundary-time eligibility.

And:

> `R4 → R9 → R10 → R17 → R19 → R20`

### R19 referenced text

> The recovered complete commercial lineage is:
>
> `Opportunity → exact Evaluation Cycle → Bet → Product Definition → R9 Build Source Snapshot / Build → R10 Artifact Version → production Release / Asset → R17 Offer Version → CUSTOMER_CHARGING Grant → exact provider/account commercial operation → checkout/customer contract → transaction → R15 Provider Financial Observation → R16 canonical reconciliation`

And:

> ## 7. R17 boundary — exact immutable Offer Version and charging grant
>
> R19 consumes R17's exact Offer Version and `CUSTOMER_CHARGING` Grant as the commercial-authority segment of the lineage.
>
> An Asset-level `commercialActive`, current Offer pointer, current price, or current monetization configuration cannot substitute for the historical Offer Version that governed the action.
>
> The lineage must retain exact provider/account identity under `DI-1/COMMERCIAL_PAYMENT` where applicable.
>
> Commercial Grant revocation or Offer supersession does not erase historical lineage for actions already executed under prior valid authority.

And:

> **A traversable path proves that records can be connected. A frozen Commercial Authority Lineage Reference proves which exact composed authority was selected before consequential execution.**

And:

> R19 must not:
>
> - redefine R17 Offer Version/commercial-grant authority;
> ...

And:

> `R4 → R9 → R10 → R17 → R19 → R20`

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `HARD_CHAIN`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R17 defines the exact immutable Offer Version/charging-grant authority segment; R19 directly consumes that segment into a larger immutable historical lineage and both artifacts preserve the same explicit hard chain. `COMPOSES` is omitted because the concrete consumption relation plus named hard-chain membership already describe the seam without adding a redundant general tag.

R19 does not retroactively broaden R17. R17's Offer Version includes the checkout/payment configuration identity the offer prescribes. R19 adds later-arising execution/session/customer-contract/transaction identities as separate downstream lineage nodes when the commercial path executes. R19's Lineage Reference composes and references the R17 segment rather than redefining the Offer Version to contain those later facts.

## 3. C03-03 — R20 -> R17

**R20 blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`  
**R17 blob:** `16a234e897fe6e119392707a7187a3232f0fd972`

### R20 declaring text

> R20 consumes, where applicable:
>
> ...
> - R17 exact Offer Version / commercial authority object;
> ...

And:

> The core separation is:
>
> - **R17:** what commercial authority object exists;
> - **R19:** where that authority came from and which exact immutable lineage it belongs to;
> - **R20:** whether that exact authority may be consumed **now**.
>
> **Identity tells us what authority exists. Lineage tells us where it came from. Boundary fencing tells us whether it may be consumed now.**

And:

> R20 revalidates current eligibility of the **exact bound authority/lineage**. It does not repair an ineligible historical object by substituting whatever is current now.
>
> Examples:
>
> - stale Evaluation Cycle A is not replaced with current Cycle B;
> - Offer O1 is not replaced with current Offer O2;
> - Artifact P1 is not replaced with current P2;
> - provider/account A is not replaced with current provider/account B;
> - frozen R19 Commercial Authority Lineage Reference L1 is not replaced with current lineage L2.

And:

> ## 11. R17 boundary — valid Offer Version is not perpetual commercial permission
>
> R17 defines the exact Offer Version and charging Grant. R20 decides whether that exact authority is still eligible for this checkout/charge/adoption now.
>
> An Offer may become ineligible because of:
>
> - supersession;
> - grant revocation;
> - provider/account binding invalidation;
> - lifecycle change;
> - stale required evidence;
> - resource authority change;
> - current policy restriction.
>
> Historical validity remains historical truth. It does not imply new-customer or new-adoption eligibility.

And:

> R20 must not:
>
> - redefine the authority objects owned by R4/R6/R7/R9/R10/R17/R18/R19;
> ...

### R17 referenced text

> ## 19. R20 boundary — offer identity versus current eligibility
>
> R17 answers **what exact commercial object is authorized**.
>
> R20 answers whether that exact authority may be consumed **now** at preflight, consequential boundary, or adoption.
>
> A valid immutable Offer Version is not perpetual permission.
>
> An Offer can remain historically authoritative for past actions while becoming ineligible for new checkout/adoption because of revocation, supersession, lifecycle change, capability/binding change, resource state, or another governing predicate.
>
> **R17 defines the commercial authority object. R20 decides whether that object is currently consumable.**

And:

> An external operation can remain historically valid while its result is no longer eligible for adoption.
>
> R17 preserves exact offer identity; R20 determines whether that exact offer remains eligible at the relevant boundary/adoption moment.

And:

> R19/R20 interface contracts may be designed in parallel, but R17 must remain the exact commercial-authority-object layer rather than absorbing full-lineage validation or boundary-time eligibility.

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `OWNERSHIP_BOUNDARY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R20 consumes exact R17 commercial authority and decides present eligibility without redefining Offer semantics. The reasons R20 lists for current ineligibility are either R17-owned states it consumes (`supersession`, `grant revocation`), predicates owned by other upstream nodes (`provider/account binding`, lifecycle, evidence freshness, resource authority), or R20's own legitimate current-policy boundary predicate. R20 therefore composes upstream truth at the boundary rather than manufacturing commercial semantics.

`HARD_CHAIN` is intentionally omitted. Although both R17 and R20 participate in `R4 → R9 → R10 → R17 → R19 → R20`, the frozen directed edge here is `R20 -> R17`, opposite the chain's directed traversal. Shared chain membership is not enough to label this directed edge itself `HARD_CHAIN`.

`COMPOSES` is also omitted because `CONSUMES` plus `OWNERSHIP_BOUNDARY` already describes the exact relation without redundant generalization.

## 4. Batch result

All three edges are accepted as non-contradictory under the checked pinned endpoint blobs.

No `UPSTREAM_SEMANTIC_REDEFINED`, `UPSTREAM_SCOPE_NARROWED`, `UPSTREAM_SCOPE_BROADENED`, `IDENTITY_SUBSTITUTION_RISK`, `AUTHORITY_LAUNDERING_RISK`, `MISSING_REQUIRED_COMPOSITION`, `OWNERSHIP_MISATTRIBUTION`, `ASSURANCE_OVERCLAIM`, or `UNRESOLVED_CROSS_NODE_GAP` was established in Batch 03.

Adversarial review produced no formal classification or tag correction in this batch. It did produce one targeted verification request for C03-01, which was checked directly against the pinned R16 text and satisfied without endpoint amendment: provider-supplied semantic qualifiers remain R15 evidence and must still be interpreted by R16 under its explicit versioned reconciliation policy.

The narrow-tag discipline established in Batch C-02 remains intact:

- `R15 -> R16`: `CONSUMES`, `PARALLEL_NOT_MERGED`
- `R17 -> R19`: `CONSUMES`, `HARD_CHAIN`
- `R20 -> R17`: `CONSUMES`, `OWNERSHIP_BOUNDARY`

## 5. Invalidation

Any endpoint blob change invalidates the affected edge result under the frozen Phase C invalidation rule, including primary classification, semantic relation tags, corroboration topology, source excerpts, and downstream conclusions that consume the result.

## 6. Relay-contamination guard

This batch record terminates here. No conversational handoff text is part of the record.
