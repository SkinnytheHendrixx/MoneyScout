# Money Scout — Phase C Batch 06

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Governing protocol:** `PHASE_C_CLASSIFICATION_PROTOCOL.md` as amended during Batch C-06  
**Implementation authority:** SUSPENDED  
**Edges:** `R4 -> R9`, `R5 -> R6`, `R12 -> R13`

## 1. C06-01 — R4 -> R9

**R4 blob:** `907e44ccb1128dabb142164e713877596901c3f2`  
**R9 blob:** `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### R4 declaring text

> R4 should establish an explicit lineage chain equivalent to:
>
> ```
> Opportunity → Evaluation Cycle → underwriting/evidence snapshot → Bet proposal
> → Bet approval → Product Definition / Factory revision → Architecture
> → Build source/revision → Build → Release → Asset
> → Commercial authority/session → economic events
> ```
>
> R4 does not implement every downstream node in that chain. Its responsibility is to define and propagate the evaluation-lineage identity contract so R9/R10/R19/R20 can carry it further without reconstruction. At any point where the exact originating cycle is known, a later consumer may not replace it with `getActiveEvaluationCycle()`.

And:

> **Creation-time lineage binding:** when a new consequential artifact is derived from another artifact, it must inherit the parent's exact Evaluation Lineage Reference. Example: `Bet A → Factory Run` must mean `FactoryRun.evaluationCycleId = Bet.evaluationCycleId` unless there is an explicit re-evaluation/revision operation producing a new successor Bet or successor authority object. The implementation may not say `FactoryRun.evaluationCycleId = current active cycle`.
>
> **Transition-time eligibility:** when an existing object crosses an authority or consequential state boundary, the system must compare the object's immutable lineage against current Opportunity/evaluation state. Examples: `PROPOSED Bet → APPROVED`; approved Bet → Factory start; Factory revision → Build authorization; later R20-controlled boundaries.
>
> R4 owns the lineage comparison semantics. R20 later generalizes the same discipline across all authority/lifecycle/resource/evidence fences.

And:

> **R4 → R9 → R10** — the primary immutable-build dependency chain. R4 tells us which evaluation lineage justified the Bet/Factory authority. R9 freezes the exact repository/build-source revision governed by that Factory lineage. R10 carries the exact built artifact identity through QA and Release.
>
> **Required invariant:** Exact artifact identity is not trustworthy if the decision lineage authorizing that artifact was reconstructed from a different evaluation cycle.
>
> R9/R10 do not redefine Evaluation Cycle semantics.

And:

> **R4 × R9 compound certification** *(cross-referenced from WI-R9's own confirmed contract — see Recovery provenance note above)*: Bet A / Cycle A → Cycle B becomes current → Factory incorrectly or ambiguously progresses from A → repository/build-source revision is then frozen. The system must prove both: R4 — the Factory/Build authority still points to the exact eligible evaluation lineage that actually justified it; R9 — the repository/build-source snapshot frozen under that authority is immutable.
>
> **Required invariant:** An immutable repository revision does not legitimize stale decision authority, and correct decision lineage does not make a mutable repository revision safe. Both must be true simultaneously.
>
> A perfectly immutable Build Source Snapshot under stale Cycle A authority is still invalid for new progression. Conversely, fresh Cycle B authority over a mutable source is still unsafe.

And:

> **R4 ↔ R9:** Before R9 design freeze, agree on: factory revision; evaluation lineage; build source snapshot; superseding revision; originating authority. R9 must not invent a new evaluation lineage merely because repository state changed.

And:

> **R4 vs R9:** R4 freezes evaluation origin. R9 freezes repository/build-source origin.

And:

> R4 must not:
>
> - freeze repository source identity — that is R9;
> ...

And:

> R4's local path is independent: R4 may start now and may locally close without R9/R10/R11/R17/R19/R20. Its primary downstream chain remains **R4 → R9 → R10 → R17 → R19 → R20**, with R6 parallel where capability verification is relevant.

### R9 referenced text

> The recovered contract requires an immutable source snapshot containing, at minimum where applicable:
>
> ...
> - exact Evaluation Lineage reference inherited under R4;
> ...

And:

> ## 5. R4 exact-lineage inheritance
>
> R9 consumes R4's immutable originating Evaluation Lineage. It must not replace that lineage with whichever evaluation cycle is current when the source snapshot is frozen or when the Build starts.
>
> The Build Source Snapshot must preserve the exact lineage inherited from the authorized Bet/Product/Architecture chain.
>
> R9 cannot repair stale or unknown lineage. If exact lineage is required and unavailable, R4's fail-closed semantics govern.

And:

> ## 13. R9 × R10 × R17 commercial chain
>
> The recovered hard-chain relationship is:
>
> `R4 → R9 → R10 → R17 → R19 → R20`
>
> R9 contributes immutable source authority to that chain. R17's exact Offer Version must ultimately bind to the production artifact/release derived from the exact authorized source, not merely to a current Asset or current branch.
>
> R9 alone does not create commercial authority.

And:

> - exact R4 evaluation lineage survives into the Build Source Snapshot;
> ...
> - the R4→R9→R10→R17→R19→R20 hard chain remains intact;

And:

> R9 contract/schema work may proceed once R4's lineage interface is sufficiently stable to preserve exact originating lineage in the snapshot.

And:

> Final certification must compose with at least R4, R7, R8, R10, R17, R19, and R20 where relevant.

And:

> R9 must not:
>
> - decide evaluation-cycle freshness, which belongs to R4/R20 as applicable;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R9 explicitly consumes R4's immutable Evaluation Lineage, even though the frozen inventory edge direction is `R4 -> R9` because R4 is the declaring artifact. The governing protocol now makes this distinction explicit: edge direction records where the reference is declared; `CONSUMES` records semantic data/identity flow and may be justified by either endpoint's checked text.

`HARD_CHAIN` is explicitly named by both artifacts. `COMPOSES` is independently justified by the R4×R9 compound requiring correct decision lineage and immutable source authority simultaneously. `CERTIFICATION_DEPENDENCY` is operational here, supported by the explicit compound/E2E certification requirement rather than merely a vocabulary checkpoint. `PARALLEL_NOT_MERGED` records that R4 evaluation origin and R9 source origin remain independently necessary and neither can repair the other.

### Protocol clarification produced by C06-01

The batch adopts the following governing rule, now recorded in `PHASE_C_CLASSIFICATION_PROTOCOL.md`:

> **`CONSUMES` may be justified by consumption-shaped language in either endpoint's checked text describing that specific dependency. It is not restricted to the declaring artifact consuming the referenced artifact, and it is not excluded merely because the semantic data flow runs opposite the frozen edge direction.**

This clarification does not create a new frozen directed edge.

## 2. C06-02 — R5 -> R6

**R5 blob:** `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929`  
**R6 blob:** `d4d613a40eed187c230d55f7e21b1b0251bf612a`

### R5 declaring text

> **Core rule:** A model-generated material conclusion may propose closure, but it may not be the sole evidence that closure is justified.

And:

> The confirmation source must contribute materially independent judgment. The acceptable mechanism may vary by conclusion type:
>
> - **Model-adjudicable conclusion** → materially independent model/provider-family reviewer.
> - **Deterministically verifiable conclusion** → a deterministic verifier against authoritative facts may satisfy confirmation if the closure claim is fully reducible to those facts.
> - **Hybrid conclusion** → independent model challenge plus deterministic invariant checks where applicable.
>
> R5 does not freeze a single provider implementation. It does freeze this rule: **independence is about decision source, not prompt role.**

And:

> - **R5 vs R6:** R6 determines whether a capability/verifier is strong enough for a claimed capability state. R5 determines whether a material reasoning conclusion received independent confirmation. A strong capability verifier is not automatically an independent decision reviewer.

And:

> **R5 vs R6:** R6 determines whether a capability/verifier is strong enough for a claimed capability state. R5 determines whether a material reasoning conclusion received independent confirmation. A strong capability verifier is not automatically an independent decision reviewer.

And:

> R5 must not:
>
> ...
> - determine verifier strength for capabilities, which is R6;
> ...

### R6 referenced text

> **Frozen mission statement:** R6 exists to make capability readiness a canonical adjudicated claim, select the strongest verifier applicable to that claim, and prevent weaker evidence from manufacturing stronger machine authority.
>
> R6 does not decide whether a capability is currently lifecycle-eligible at dispatch, which is R18/R20 territory. It decides whether the claimed capability state was established by a verifier strong enough for the capability being claimed.

And:

> When multiple verification paths are potentially available, the system must: identify the exact capability claim requested; load the applicable verification policy; determine all applicable verifier requirements; select or require the strongest applicable proof needed for that claim; execute/collect that proof; grant no stronger readiness state than the proof establishes.

And:

> **R5 × R6 — independent reasoning confirmation vs. capability verification.** R5 and R6 both use the word "verification" colloquially but govern different claims. R5: did an independent reviewer confirm a material reasoning conclusion? R6: did sufficient proof establish a capability/access claim? A provider callback proving API access does not independently confirm an underwriting judgment. A second-model review does not prove API credentials work. They remain separate.

And:

> **R5 ↔ R6:** freeze distinct terminology: decision confirmation vs. capability verification. If shared types are introduced, their semantic namespaces must still distinguish what proposition is being proved.

And:

> - **R6 vs R5:** capability-proof sufficiency vs. independent reasoning confirmation.

And:

> R6 must not:
>
> ...
> - redefine R5 independent-confirmation policy;
> ...

And:

> `WI-R6 = CLOSED` requires:
>
> ...
> 15. R5↔R6 vocabulary compatibility PASS;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R5 and R6 explicitly govern different propositions that must not be substituted for one another. R5's deterministic verifier exception does not allow an R6 capability verifier to satisfy R5 merely because both are deterministic; the proposition being verified remains load-bearing. A provider callback proving access is not independent confirmation of an underwriting judgment, and a second-model review does not prove credentials work.

`CERTIFICATION_DEPENDENCY` is justified by a concrete, checkable gate: R6 cannot close without `R5↔R6 vocabulary compatibility PASS`. This is a **vocabulary/interface compatibility dependency**, not evidence of a shared operational execution fixture. The current umbrella tag is retained under the governing protocol, but the supporting gate type is stated explicitly to avoid overclaiming operational rigor.

### Required protocol taxonomy refinement

Adversarial review established that `CERTIFICATION_DEPENDENCY` currently spans materially different strengths: operational/joint-fixture certification and vocabulary/interface compatibility gates.

The governing protocol now records this durable obligation:

> **Before Phase C is treated as taxonomy-complete, split or otherwise explicitly subtype `CERTIFICATION_DEPENDENCY` so vocabulary/interface compatibility cannot be mistaken for a full operational/joint-fixture certification gate, then retroactively review prior batches that use the current umbrella tag.**

This batch does not perform that retroactive relabeling. No previously adjudicated edge is reclassified merely by recording the taxonomy-refinement obligation.

## 3. C06-03 — R12 -> R13

**R12 blob:** `7a4a186fc2fd030d6ee52725b1111395597ffa90`  
**R13 blob:** `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e`

### R12 declaring text

> **If an obligation should still be due after the process that noticed it dies, the obligation’s due/runnable state must be durably reconstructible without manual relay.**
>
> R12 therefore owns durable scheduling/execution-occurrence semantics for future, delayed, recurring, retryable, watch-triggered, or otherwise runnable obligations.

And:

> ## 10. R13 boundary — durable work vs executor health
>
> R12 proving that due/runnable work exists does not prove any executor is healthy enough to process it.
>
> R13 separately determines whether the responsible executor/runtime is started, progressing, stalled, failed, intentionally disabled, or unknown.
>
> Likewise, R13 reporting a healthy executor cannot compensate for missing durable R12 runnable state.
>
> **Durable work existence and executor health are separate predicates.**

And:

> ### 10.1 R12 × R13 × R7 outage-recovery compound — R7-owned certification
>
> The ownership question carried forward into R13 review is resolved.
>
> The already-reviewed R7 recovery record owns the normative three-way certification requirement:
>
> **R12 × R13 × R7 process-outage burst certification — Durable obligations accumulate while executor/supervisor is unavailable → system recovers → many due jobs become runnable → R12/R13 recover execution correctly → R7 prevents the recovery wave from overcommitting shared resources. R7 is not responsible for durable scheduling/liveness — it governs admission once recovered work becomes executable.**
>
> R12's role is to make accumulated obligations durable and reconstructible so the backlog reappears correctly after recovery. R13 contributes truthful executor recovery/liveness. R7 owns the aggregate admission/certification requirement.
>
> R12 must cross-reference this compound but must not re-own or redefine it.

And:

> - R13 executor health remains distinct from R12 durable-work existence;
> - R12 contributes durable backlog reconstruction to the R7-owned R12×R13×R7 outage-recovery certification without re-owning that compound;

And:

> R13 need not be locally closed for R12 scheduling semantics to exist, but liveness certification remains pending without R13.

And:

> Final certification must compose with at least R3, R4, R5, R6, R7, R8, R11, R13, R14, and R20 where relevant.

And:

> R12 must not:
>
> - infer executor health, which belongs to R13;
> ...
> - re-own or redefine the R7-owned R12×R13×R7 outage-recovery certification.

### R13 referenced text

> **A healthy supervisor is not proof of a healthy executor. Health must be judged from durable, externally observable evidence that the expected execution path exists and is progressing when work requires it.**
>
> R13 therefore defines truthful liveness/health for the runtime and executor surfaces that must carry R12-runnable obligations into actual governed execution.

And:

> ## 9. R12 boundary — durable work vs executor health
>
> R12 owns durable due/runnable occurrence existence and reconstruction.
>
> R13 owns whether the executor expected to process that work is actually healthy, progressing, stalled, failed, intentionally disabled, or unknown.
>
> Neither substitutes for the other:
>
> - durable R12 work can exist while R13 executor health is failed;
> - R13 can report a healthy executor while R12 has lost a required future occurrence;
> - aggregate certification requires both predicates where applicable.
>
> **Durable work existence and executor health are separate predicates.**

And:

> ## 10. R12 × R13 × R7 outage-recovery compound — R7-owned certification
>
> The ownership question carried forward from R12 is resolved.
>
> The already-reviewed R7 recovery record owns the normative three-way certification requirement:
>
> **R12 × R13 × R7 process-outage burst certification — Durable obligations accumulate while executor/supervisor is unavailable → system recovers → many due jobs become runnable → R12/R13 recover execution correctly → R7 prevents the recovery wave from overcommitting shared resources. R7 is not responsible for durable scheduling/liveness — it governs admission once recovered work becomes executable.**
>
> R13's role in that compound is narrower and specific: after outage/restart, the executor/service path responsible for the recovered backlog must become truthfully observable as healthy/progressing before backlog processing can be trusted. R13 does not own the aggregate resource-admission rule and does not redefine R12 reconstruction semantics.
>
> R12 contributes durable backlog reconstruction. R13 contributes truthful executor recovery/liveness. R7 owns the normative three-way certification and aggregate admission constraint.

And:

> - R12 durable-work existence remains distinct from R13 executor health;
> - outage recovery must restore truthful required-executor liveness before recovered backlog processing can be trusted;
> - the R12×R13×R7 compound is cross-referenced as R7-owned rather than duplicated as R13 authority;

And:

> Final certification must compose with at least R7, R8, R11, R12, R14, and R20 where relevant.

And:

> R13 must not:
>
> - define R12 durable scheduling semantics;
> ...
> - re-own or redefine the R7-owned R12×R13×R7 outage-recovery certification.

### Third-party corroborating R7 text

**R7 blob:** `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`

The multilateral topology is not inferred from R12/R13 merely naming R7. The same-batch record includes the pinned R7 source text that independently owns the same compound:

> ### R12 × R13 × R7 outage-recovery burst
>
> Durable obligations accumulate while execution is unavailable → recovery makes many jobs runnable → R12/R13 restore liveness → R7 prevents the recovery wave from overcommitting shared resources.

And:

> - **R7 vs R12/R13:** resource admission vs durable scheduling/liveness.

And:

> Recovery certification: **R12 + R13 + R7** → durable recovery without a resource stampede.

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `MULTILATERAL_CORROBORATION`

Rationale: R12 and R13 independently preserve durable-work existence and executor health as distinct predicates, and both participate in a concrete operational outage-recovery certification. The same pinned R7 text independently owns that exact three-way certification and preserves the resource-admission-versus-scheduling/liveness split. The multilateral topology is therefore directly challengeable from this batch record itself rather than inherited from a prior batch summary.

`CERTIFICATION_DEPENDENCY` is operational here: the checked text contains a concrete outage-recovery compound and liveness/certification conditions, not merely vocabulary compatibility.

`OWNERSHIP_BOUNDARY` is omitted because `PARALLEL_NOT_MERGED` captures the load-bearing non-substitution between durable work existence and executor health without redundant tagging on this seam.

### Protocol clarification produced by C06-03

The governing protocol now requires:

> **A `MULTILATERAL_CORROBORATION` classification is valid only when the batch record itself includes the relevant actual source text from every third-party artifact materially relied upon for the multilateral claim. A citation to, or summary of, a prior batch is insufficient.**

R7's actual pinned source text is included above, so `MULTILATERAL_CORROBORATION` is retained rather than downgraded.

## 4. Batch result

All three edges are accepted as non-contradictory under the checked pinned endpoint blobs.

No `UPSTREAM_SEMANTIC_REDEFINED`, `UPSTREAM_SCOPE_NARROWED`, `UPSTREAM_SCOPE_BROADENED`, `IDENTITY_SUBSTITUTION_RISK`, `AUTHORITY_LAUNDERING_RISK`, `MISSING_REQUIRED_COMPOSITION`, `OWNERSHIP_MISATTRIBUTION`, `ASSURANCE_OVERCLAIM`, or `UNRESOLVED_CROSS_NODE_GAP` was established in Batch 06.

Adversarial review produced three taxonomy/governance corrections rather than endpoint contradictions:

1. `R4 -> R9`: add `CONSUMES`; relation tags may describe semantic data flow evidenced by either endpoint even when that flow runs opposite the frozen declaring-edge direction.
2. `R5 -> R6`: add `CERTIFICATION_DEPENDENCY` because a concrete vocabulary-compatibility closure gate exists, while recording a required future taxonomy split so vocabulary/interface compatibility cannot be mistaken for operational/joint-fixture certification.
3. `R12 -> R13`: retain `MULTILATERAL_CORROBORATION` only after adding direct pinned R7 text to this batch record; future multilateral topology claims require same-batch third-party evidence.

These rules were also added to the governing Phase C classification protocol. No R4/R5/R6/R7/R9/R12/R13 endpoint blob was amended.

The final narrow-tag/topology sets are:

- `R4 -> R9`: `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`; `BILATERAL_CORROBORATION`
- `R5 -> R6`: `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`; `BILATERAL_CORROBORATION`
- `R12 -> R13`: `COMPOSES`, `PARALLEL_NOT_MERGED`, `CERTIFICATION_DEPENDENCY`; `MULTILATERAL_CORROBORATION`

## 5. Governing-protocol amendment

Batch C-06 amended `docs/remediation-contracts/PHASE_C_CLASSIFICATION_PROTOCOL.md` to make the three adjudicated taxonomy/evidence rules explicit.

The amendment does not change the frozen edge universe, does not edit endpoint blobs, and does not restore implementation authority.

The `CERTIFICATION_DEPENDENCY` subtype/split remains an explicit Phase C taxonomy-refinement obligation. Prior batches using the umbrella tag must be revisited before Phase C is treated as taxonomy-complete.

## 6. Invalidation

Any endpoint blob change invalidates the affected edge result under the frozen Phase C endpoint-SHA rule, including primary classification, semantic relation tags, corroboration topology, endpoint source excerpts, and downstream conclusions that consume the result.

For C06-03 specifically, R7 is corroborating third-party evidence rather than an endpoint. A future R7 blob change does not by itself invalidate the R12/R13 primary classification, but the `MULTILATERAL_CORROBORATION` topology must be rechecked against the amended R7 text before it may continue to be claimed.

The governing-protocol taxonomy amendment is separately versioned by its own Git blob/commit and does not mutate endpoint content.

## 7. Relay-contamination guard

This batch record terminates here. No conversational handoff text is part of the record.
