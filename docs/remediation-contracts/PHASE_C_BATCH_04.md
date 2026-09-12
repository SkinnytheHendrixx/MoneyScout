# Money Scout — Phase C Batch 04

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Governing protocol:** `PHASE_C_CLASSIFICATION_PROTOCOL.md`  
**Implementation authority:** SUSPENDED  
**Edges:** `R7 -> R8`, `R11 -> R12`, `R18 -> R20`

## 1. C04-01 — R7 -> R8

**R7 blob:** `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`  
**R8 blob:** `237c752671573013d090e2eacf7c2af4c0e70512`

### R7 declaring text

> **UNCERTAIN exposure continues to consume headroom.**
>
> **A reservation is never released merely because a local worker stopped, timed out, lost a lease, or reported an error.**
>
> Pre-dispatch abandonment may release only from durable proof that the external boundary was never crossed. Post-dispatch uncertainty composes with R8.

And:

> ### R7 × R8 — reservation lifecycle plus external-boundary truth
>
> **R7 may release pre-dispatch reservation only from durable proof the external boundary was never crossed. After possible dispatch, R8 reconciliation governs whether and how reservation exposure may settle/release.**
>
> Local process failure is not release evidence.

And:

> **R7 ↔ R8:** `PRE_DISPATCH`, `BOUNDARY_CROSSED`, `OUTCOME_UNKNOWN`, `RECONCILED`, `safe release`.

And:

> - **R7 vs R8:** exclusive resource commitment vs external execution truth.

And:

> R8 does not need to be CLOSED for the atomic reservation primitive to locally close. R7 cannot claim safe post-dispatch release without R8-compatible provider-boundary truth.

And:

> R7 must not:
>
> - determine provider-boundary truth, which is R8;
> - implement retry/reconciliation semantics belonging to R8;
> ...

### R8 referenced text

> **External-boundary truth must be durable, execution-scoped, and reconciled from authoritative evidence before the system retries, releases reserved exposure, or adopts an external result.**

And:

> ## 5. Pre-dispatch abandonment
>
> A reservation/execution may be abandoned and released only when durable evidence proves the external boundary was never crossed.
>
> Local stop conditions are insufficient by themselves.
>
> This seam composes directly with R7:
>
> **R7 may release pre-dispatch exposure only from R8-authoritative proof of non-dispatch.**

And:

> ## 10. R7 × R8 boundary
>
> R7 owns scarce-resource reservation and exposure accounting.
>
> R8 owns whether the exact external execution crossed the boundary and what happened there.
>
> The two must not collapse into one state machine:
>
> - R7 reservation cannot prove dispatch;
> - R8 dispatch cannot by itself prove financial settlement;
> - R8 non-dispatch proof may permit R7 release;
> - post-dispatch uncertainty keeps R7 exposure conservative until authoritative reconciliation permits movement.

And:

> R8 must not:
>
> - redefine R7 reservation authority;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R7 directly consumes R8-authoritative non-dispatch and reconciliation truth when deciding whether reserved exposure may safely move. R8 supplies the authoritative external fact; R7 retains reservation/accounting and release authority. The seam also composes the two state machines without merging their ownership.

`PARALLEL_NOT_MERGED` is intentionally omitted because `OWNERSHIP_BOUNDARY` already captures the non-collapse rule more precisely here.

### Non-blocking wording observation

R7's sentence that "R8 reconciliation governs whether and how reservation exposure may settle/release" is looser than R8's own more precise wording that R8 non-dispatch proof "may permit" R7 release.

Read literally, "governs" could be mistaken for assigning R8 resource-release authority. The surrounding contracts do not support that interpretation: R7 remains the reservation/release owner, while R8 supplies authoritative external-boundary truth.

This does **not** establish `AUTHORITY_LAUNDERING_RISK` under the pinned blobs. Recommended future wording cleanup, outside Phase C endpoint mutation, is to align R7 with the more precise "permits" formulation so the text cannot be misread as transferring release authority to R8.

## 2. C04-02 — R11 -> R12

**R11 blob:** `f811d528730d819aa793a1901e9d1b310242fbcd`  
**R12 blob:** `7a4a186fc2fd030d6ee52725b1111395597ffa90`

### R11 declaring text

> ## 12. R12 boundary — durable scheduling/liveness
>
> R11 owns **what corrective obligation exists and why**.
>
> R12 owns durable scheduling/execution-occurrence semantics for future/runnable obligations.
>
> An R11 obligation must be representable durably even if no worker is currently alive. R12 later ensures due/runnable corrective work survives restart, timer loss, and scheduler replacement.
>
> R11 must not substitute process-local timers or in-memory queues for durable obligation ownership.

And:

> ### 12.1 R11 × R12 deterministic recovery compound
>
> 1. a Product blocker persists and R11 should derive an exact successor obligation;
> 2. the process dies before that successor is fully materialized into runnable durable work;
> 3. the runtime restarts;
> 4. R11 deterministically re-derives the **same exact successor obligation** from the durable blocker/evidence state;
> 5. R12 makes that obligation durably runnable/schedulable;
> 6. no orphan blocker remains;
> 7. no duplicate successor obligation is created;
> 8. no manual relay is required to reconnect the blocker to its corrective work.
>
> **Process death between detecting a persistent blocker and materializing its runnable successor must not orphan the blocker or duplicate the successor.**

And:

> - R11×R12 crash/restart recovery leaves no orphan blocker, no duplicate successor, and no manual relay requirement;
> - R12/R13 liveness is distinct from R11 semantic ownership;

And:

> R12/R13 need not be locally closed for R11 obligation semantics to exist, but durable scheduling/liveness certification remains pending without them.

### R12 referenced text

> ## 3. Domain obligation vs execution occurrence
>
> R12 must not collapse the domain reason for work into the scheduler record that causes one execution occurrence.
>
> The domain owns **why** work exists and **when** it should become due. The execution/scheduling substrate owns **that a runnable occurrence exists, is claimable, and can be reconstructed after failure**.
>
> A scheduler job is therefore not the business obligation itself.
>
> Examples:
>
> - R11 owns the corrective obligation; R12 makes its runnable occurrence durable.

And:

> ## 9. R11 boundary — ownership vs scheduling
>
> R11 owns **what corrective obligation exists and why**.
>
> R12 owns **when and how a durable runnable occurrence exists for it**.
>
> R12 must not invent corrective scope, mutate R11 successor authority, or treat a scheduler job as the corrective obligation itself.

And:

> The confirmed R11 × R12 compound remains normative:
>
> 1. a persistent blocker implies one exact successor obligation;
> 2. process dies before runnable materialization;
> 3. restart deterministically re-derives the same successor;
> 4. R12 makes it durably runnable;
> 5. no orphan blocker;
> 6. no duplicate successor;
> 7. no manual relay.

And:

> R12 must not:
>
> - redefine the domain obligation that explains why work exists;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `PARALLEL_NOT_MERGED`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: R11 owns semantic obligation existence/scope/authority, while R12 owns durable runnable occurrence and reconstruction for already-defined work. The crash/restart compound demonstrates the seam operationally: R11 re-derives the same exact successor; R12 ensures its runnable occurrence survives and is reconstructed without duplication.

The two uses of "when" are compatible: domain timing policy determines **when the obligation becomes due**; R12 determines **when/how a durable runnable occurrence exists for that due obligation**. Those are different layers rather than competing scheduling authorities.

### Non-blocking wording observation

R12 §3 says the domain owns "when it should become due," while §9 says R12 owns "when and how a durable runnable occurrence exists for it." The distinction is sound in context but close enough that an isolated reading could mistake it for an ownership collision.

Recommended future wording cleanup is to make the split explicit: the domain computes the due time/timing intent; R12 guarantees durable occurrence materialization, reconstruction, and claimability for that due time.

This does **not** change the primary classification, relation tags, or topology under the pinned blobs.

## 3. C04-03 — R18 -> R20

**R18 blob:** `226d67276f1627c26045ead9c7717023e7e764db`  
**R20 blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`

### R18 declaring text

> R18 is narrower than R20 and does not redefine R6.
>
> - **R6:** Is this exact capability claim sufficiently verified?
> - **R18:** Which exact verified capability binding did this execution depend on, and does that same binding remain eligible?
> - **R20:** At this exact consequential boundary, after composing R18 with every other required authority predicate, may the action execute now?

And:

> At dispatch R18 revalidates B1. It must not query the logical capability key, discover current B2, and silently substitute B2.
>
> **Revalidation may confirm or reject an existing binding. It may not replace the binding.**

And:

> Only an explicitly eligible outcome may be consumed by R20 for consequential dispatch.

And:

> ### R20 vs R18
>
> R18 defines and evaluates capability-binding eligibility. R20 decides when that evaluation must occur and atomically/serializably consumes it as part of the complete boundary predicate set.
>
> A valid R18 result is not itself final dispatch authorization.

And:

> Validation records are operation-specific. A Builder-dispatch validation cannot authorize QA dispatch; a reconciliation validation cannot authorize a new mutation.
>
> R20 owns whether that validation is boundary-current enough to consume.

And:

> ### R18 × R20
>
> R18 evaluates B1 valid at T1. B1 becomes quarantined before actual dispatch T2. If R20 consumes stale T1 validation the test fails. Correct behavior requires boundary-current capability truth and blocks dispatch.

And:

> - **R18 vs R20:** capability-specific revalidation semantics vs universal boundary-time fencing/final authorization.

And:

> **R18 tells R20 whether the exact frozen capability binding remains valid. R20 decides whether that fact is boundary-current, correctly fenced, and sufficient together with every other required authority predicate to cross the boundary now.**

### R20 referenced text

> R20 consumes, where applicable:
>
> - R18 exact capability binding and binding lifecycle;
> ...

And:

> ## 7. R18 boundary — consume exact binding disposition without redefining lifecycle policy
>
> R18 supplies the exact capability binding and the operation-specific binding-validation disposition. R20 decides when that R18 decision must be current enough to consume as one predicate in the complete boundary decision. R20 does **not** independently reinterpret raw R18 lifecycle state.

And:

> **R20 consumes R18's exact operation-specific disposition. It must not redefine `DEPRECATED` into a stricter or looser policy of its own.**

And:

> R20 must consume the exact R6/R18 identity rather than rerouting through “some currently ready capability.”

And:

> - R20 consumes R18's exact operation-specific binding disposition and does not redefine `DEPRECATED` lifecycle policy;
> - an already-frozen deprecated binding that R18 still permits is not blocked merely because its lifecycle label is `DEPRECATED`, while a R18 `BINDING_DEPRECATED_DISALLOWED` or other invalid/unresolved disposition blocks the applicable predispatch boundary;

And:

> R20 must not:
>
> - redefine the authority objects owned by R4/R6/R7/R9/R10/R17/R18/R19;
> - reinterpret R18 `DEPRECATED` lifecycle state independently of R18's operation-specific binding disposition;
> ...

### Adjudication

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

Corroboration topology: `BILATERAL_CORROBORATION`

Rationale: each tag captures distinct semantic content. `CONSUMES` records that R20 takes the exact R18 disposition as an input. `OWNERSHIP_BOUNDARY` records that R18 owns capability-binding eligibility semantics while R20 owns final boundary-time authorization. `CERTIFICATION_DEPENDENCY` is justified by the explicit quarantine-race acceptance/certification seam. `COMPOSES` remains independently necessary because R20 combines the R18 disposition with multiple other predicates into one composite consequential-boundary decision.

No duplicated lifecycle policy is established. R20's current text explicitly consumes R18's operation-specific disposition and forbids local reinterpretation of `DEPRECATED`, including the earlier recovered defect shape around `BINDING_DEPRECATED_DISALLOWED`.

## 4. Batch result

All three edges are accepted as non-contradictory under the checked pinned endpoint blobs.

No `UPSTREAM_SEMANTIC_REDEFINED`, `UPSTREAM_SCOPE_NARROWED`, `UPSTREAM_SCOPE_BROADENED`, `IDENTITY_SUBSTITUTION_RISK`, `AUTHORITY_LAUNDERING_RISK`, `MISSING_REQUIRED_COMPOSITION`, `OWNERSHIP_MISATTRIBUTION`, `ASSURANCE_OVERCLAIM`, or `UNRESOLVED_CROSS_NODE_GAP` was established in Batch 04.

Adversarial review produced one formal tag correction and two non-blocking wording observations:

1. `R7 -> R8`: add `CONSUMES`; drop `PARALLEL_NOT_MERGED`; final tags are `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`.
2. R7's phrase that R8 "governs whether and how" reservation exposure may settle/release is flagged for future wording cleanup toward the more precise R8 formulation that authoritative R8 truth "may permit" R7 release.
3. R12's two uses of "when" are flagged for future wording cleanup to distinguish domain due-time intent from R12 durable runnable-occurrence materialization.

No endpoint artifact is amended during this batch. Any future cleanup of R7, R12, R18, or R20 must follow the ordinary endpoint-SHA invalidation and rerun discipline.

The final narrow-tag sets are:

- `R7 -> R8`: `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`
- `R11 -> R12`: `COMPOSES`, `OWNERSHIP_BOUNDARY`, `PARALLEL_NOT_MERGED`
- `R18 -> R20`: `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`

## 5. Invalidation

Any endpoint blob change invalidates the affected edge result under the frozen Phase C invalidation rule, including primary classification, semantic relation tags, corroboration topology, source excerpts, and downstream conclusions that consume the result.

## 6. Relay-contamination guard

This batch record terminates here. No conversational handoff text is part of the record.
