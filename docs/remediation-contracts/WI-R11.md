# WI-R11 — Durable Executable Corrective Obligations

**Normalized node:** R11  
**Historical finding:** `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R11 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing historical finding IDs, exact enum ordinals, migration numbering, fixture labels/order, audit classification vocabulary, or closure-evidence numbering from compressed summaries.

Where exact historical text is unavailable, the gap is marked explicitly rather than inferred.

## 2. Frozen root and mission

R11 exists because detecting a defect or failing closed is not sufficient if the resulting corrective work has no durable executable owner.

A system that can say “cannot continue” but cannot durably represent what must happen next is not autonomous; it has converted uncertainty into abandonment.

> **Fail-closed is incomplete if the closed state has no owner. When the system cannot safely decide corrective action, uncertainty itself becomes an owned adjudication obligation.**

R11 therefore turns corrective outcomes into durable, typed, executable obligations with exact scope, provenance, authority context, target, completion evidence, and bounded disposition.

## 3. Corrective obligation classes

The available confirmed record includes, at minimum, the following corrective-obligation classes:

- repair;
- revise Product Definition;
- revise Architecture;
- replan Bet/stage;
- retry capability verification/acquisition;
- reconcile external execution;
- Human action where genuinely required;
- terminate / request stage termination.

The exact historical enum names/storage representation remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless separately confirmed during source review.

These classes are semantically distinct. A repair must not be silently promoted into Product/Architecture redesign, and a design contradiction must not be reduced to another blind repair attempt.

## 4. Exact successor scope and provenance

Every corrective obligation must durably preserve enough information to answer:

- what failed or became unresolved;
- which exact object/version/execution/artifact/lineage the obligation concerns;
- which governing authority created the obligation;
- what successor scope is authorized;
- which evidence/provenance supports that successor decision;
- what target state or exact successor object is expected;
- which completion rule applies;
- which later action is allowed if the obligation cannot converge.

The successor scope must be explicit. “Try again” is not a sufficient corrective contract when the system cannot prove what may be retried, from which frozen authority, and under which gates.

## 5. Repair vs redesign

R11 must preserve the distinction between implementation failure and substantive upstream contradiction.

A failed Build, QA result, source-lineage violation, deployment mismatch, or runtime defect is not automatically evidence that the Product Definition or Architecture must change.

Only concrete evidence supporting an upstream contradiction may create the corresponding revise-Product / revise-Architecture obligation.

This composes with the confirmed R9 rule:

> **Artifact-integrity failure is not automatically design contradiction.**

Where a fresh governed attempt from the same frozen authority is valid, R11 should own that successor obligation rather than manufacture upstream redesign authority.

## 6. Immutable obligation identity and versioning

A corrective obligation is a durable historical object.

Material changes to scope, target, authority, or completion conditions must create an explicit successor/version rather than silently mutating the prior obligation into a different one.

The original failed condition, proposed successor, and eventual disposition must remain historically distinguishable.

## 7. Deterministic successor identity

Where the same durable failure/evidence set deterministically implies the same corrective obligation, repeated evaluation or recovery must converge on the same obligation identity rather than emitting duplicate corrective work.

The exact deterministic-key format, if one was separately frozen for R11, is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

This requirement prevents repeated workers/restarts from creating parallel repairs, duplicate replans, duplicate Human Actions, or multiple competing termination requests for the same unresolved condition.

## 8. Completion is proposed, then confirmed

Recovered completion semantics distinguish proposal from authoritative closure:

`PROPOSED_COMPLETE → CONFIRMED_COMPLETE`

The worker/executor that performs corrective work may propose completion, but a material corrective obligation must not self-certify merely because its executor says it succeeded.

Where R5 requires independent confirmation, R11 must consume that result before the obligation is treated as authoritatively complete.

A challenged or inconclusive confirmation keeps the obligation open/owned under the governing fail-closed semantics.

## 9. Unknown successor scope becomes an adjudication obligation

When the system cannot safely classify the required corrective scope, it must not choose a broad action by default.

Recovered fail-closed state/route:

`SUCCESSOR_SCOPE_UNKNOWN → ADJUDICATE_SUCCESSOR_SCOPE`

The uncertainty itself becomes a durable owned obligation.

If resolving successor scope requires material model judgment, R5's independent-confirmation semantics apply.

> **Corrective ownership is not execution authority.**

Owning an adjudication obligation does not authorize the eventual repair/replan/redesign until that successor scope and its authority are actually established.

## 10. Replan cap and termination disposition

R11 owns the executable disposition that follows when governed replan limits are exhausted.

The confirmed policy relationship is:

`KILL_STAGE_REQUIRED → REQUEST_STAGE_TERMINATION`

R11 does not itself execute the lifecycle termination merely because the replan cap was reached. It creates the durable corrective/termination request; the governing lifecycle authority performs the actual stage transition under its own rules.

A stalled process must not self-authorize continuation beyond the replan cap.

## 11. Human action is a bounded corrective class

Human is not the default sink for unresolved work.

A Human Action is appropriate only where a genuine human prerequisite, legal/KYC/account-ownership decision, credential action, or other irreducibly human boundary exists.

Automation inconvenience, model uncertainty, or missing implementation should not be silently normalized into Human unless the governing contract actually requires human authority.

Human Action obligations must preserve exact scope, provenance, completion evidence, and any lineage required by R4/R20.

## 12. R12 boundary — durable scheduling/liveness

R11 owns **what corrective obligation exists and why**.

R12 owns durable scheduling/execution-occurrence semantics for future/runnable obligations.

An R11 obligation must be representable durably even if no worker is currently alive. R12 later ensures due/runnable corrective work survives restart, timer loss, and scheduler replacement.

R11 must not substitute process-local timers or in-memory queues for durable obligation ownership.

## 13. R13 boundary — executor health

R13 determines whether the executor responsible for runnable corrective work is healthy, progressing, stalled, failed, or intentionally disabled.

R11 obligation existence does not prove executor health.

Likewise, R13 health does not prove the corrective obligation is semantically correct or authorized.

A healthy scheduler with no durable R11 obligation still loses work; a durable obligation with no healthy executor still lacks liveness.

## 14. R5 boundary — independent confirmation

Where corrective completion or successor classification is material and model-generated, R5 governs confirmation.

R11 may preserve a candidate successor or completion proposal, but it must not collapse:

- proposed successor → authorized successor;
- proposed completion → confirmed completion;
- model confidence → independent confirmation.

R5 outcomes such as `CHALLENGED` or `INCONCLUSIVE` keep R11 work owned and unresolved rather than silently closing it.

## 15. R6 boundary — capability corrective work

Capability readiness failures may create R11 obligations, such as retry verification, acquire a prerequisite, or adjudicate a blocked capability claim.

R11 must preserve the exact capability claim/binding/provenance. It must not turn a single execution failure into a generic capability rejection or silently substitute another provider/account.

Any automated capability verification work that consumes scarce resources remains governed by R7.

## 16. R8 boundary — reconcile before corrective external retry

If an external provider boundary may have been crossed, R11 must not create a blind retry obligation merely because the local worker failed.

R8 reconciliation truth governs whether the prior execution is safely repeatable, terminal, still uncertain, or unreconcilable.

Where the external state is unresolved, the appropriate R11 obligation may be reconciliation itself rather than retry.

A corrective retry must not erase or replace the exact historical R8 execution identity.

## 17. R9 / R10 boundary — exact source and artifact identity

Corrective Build/repair/release obligations must preserve the exact R9 source authority and R10 artifact identity that failed or is being superseded.

A repair produces a governed successor source/artifact lineage. R11 must not mutate the failed historical source/artifact into the repaired one.

Where R9 determines a source-lineage violation is merely implementation error, R11 may own a fresh attempt from the same frozen source snapshot. Where concrete evidence establishes an upstream Product/Architecture contradiction, R11 may own that higher-level corrective challenge.

## 18. R20 boundary — boundary-time authority remains separate

An R11 obligation describes what corrective work should happen next. It does not grant perpetual permission to execute that work.

Before consequential execution/adoption, R20 must still revalidate the exact authority, lineage, capability, evidence, lifecycle, resource, and adoption predicates applicable at that boundary.

> **Corrective ownership is not execution authority.**

A still-open R11 obligation cannot override a later pause, revocation, stale lineage, resource denial, or other boundary-time disqualification.

## 19. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R11:** NO

Generic corrective-obligation ownership does not itself authorize provider/account substitution. Any corrective action involving a provider/account must preserve the exact identity semantics of the governing upstream node. If a future corrective path permits one provider/account to substitute for another consequentially, DI-1 activates at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R11:** NO

Generic R11 may own a corrective obligation concerning a refund/cancel/void/reversal, but DI-2 activates only when such a reversal becomes an autonomous external economic execution. At that point the reversal must consume the governing commercial/payment authority and R8 external-execution semantics rather than being treated as an ordinary local repair.

The exact original R11 DI wording, if more specific, remains source-checkable during review.

## 20. Known migration surfaces recoverable from record

The available record confirms R11 migration scope includes, at minimum:

- canonical Corrective Obligation identity/schema;
- failure/review paths that currently only return a status/error without durable successor ownership;
- Builder/repair failure successor routing;
- QA failure successor routing;
- Product/Architecture challenge routing;
- replan/kill-stage disposition;
- capability corrective actions;
- external-reconciliation obligations;
- Human Action creation where genuinely required;
- obligation completion proposal/confirmation;
- deterministic duplicate-suppression / successor reconstruction;
- downstream scheduling handoff into R12;
- semantic audit of all fail-closed states that currently have no durable owner.

Exact migration labels, ordinals, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 21. Semantic sibling sweep

Search for patterns including:

- error/fail-closed state returned with no durable next-action owner;
- worker logs “needs repair/review/replan” but no durable obligation is created;
- repair and redesign collapsed into one generic retry path;
- model-generated corrective classification immediately treated as authoritative without R5 where material;
- duplicate corrective obligations created by repeated recovery/restart;
- obligation scope mutated in place rather than versioned/superseded;
- `KILL_STAGE_REQUIRED` directly mutates lifecycle instead of creating governed termination request;
- unknown successor scope defaults to broad repair/redesign rather than `ADJUDICATE_SUCCESSOR_SCOPE`;
- Human used as default fallback for automation uncertainty;
- R8-uncertain external operation converted directly into retry;
- corrective Build/repair loses exact R9/R10 lineage;
- obligation completion self-certified by the same material model/executor that performed the work;
- process-local timer/queue stands in for durable corrective ownership;
- R11 obligation treated as permission to bypass R20 boundary-time revalidation.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 22. Acceptance semantics recoverable from source

At minimum, R11 closure must eventually prove:

- every fail-closed condition in governed scope has a durable owner or explicit terminal disposition;
- corrective obligation preserves exact scope, provenance, authority context, target, and completion rule;
- repair is not silently promoted to redesign;
- substantive Product/Architecture contradiction requires concrete evidence;
- repeated recovery converges on one deterministic corrective obligation where the same condition implies the same successor;
- `SUCCESSOR_SCOPE_UNKNOWN` becomes `ADJUDICATE_SUCCESSOR_SCOPE` rather than guessed execution;
- `PROPOSED_COMPLETE` does not become `CONFIRMED_COMPLETE` without the governing confirmation requirement;
- R5-challenged/inconclusive completion remains owned/unresolved;
- `KILL_STAGE_REQUIRED` produces `REQUEST_STAGE_TERMINATION`, not direct lifecycle mutation;
- Human is used only for genuine human boundary/prerequisite;
- R8 uncertainty produces reconciliation ownership rather than blind retry;
- corrective work preserves exact R9 source and R10 artifact lineage;
- R12/R13 liveness is distinct from R11 semantic ownership;
- R20 revalidation remains required before consequential execution/adoption.

Original fixture labels/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 23. Start / local closure / E2E dependency result

### START

R11 contract/schema work may proceed independently enough to define durable Corrective Obligation identity and successor classes. It must preserve compatibility seams with R5, R8, R9, R10, R12, R13, and R20 rather than inventing local authority semantics.

### LOCAL CLOSURE

R11 may locally close when canonical obligation identity, exact successor scope/provenance, deterministic duplicate suppression/reconstruction, repair-vs-redesign routing, unknown-scope adjudication, completion proposal/confirmation, replan-cap disposition, Human boundaries, known migrations, audit children, and final sibling sweep are all complete.

R12/R13 need not be locally closed for R11 obligation semantics to exist, but durable scheduling/liveness certification remains pending without them. R5 need not be globally closed for R11 schema existence, but material successor/completion confirmation cannot be certified without the required R5-compatible path.

### E2E

Final certification must compose with at least R4, R5, R6, R7, R8, R9, R10, R12, R13, R14, and R20 where relevant.

## 24. Explicit non-goals

R11 must not:

- treat fail-closed status as sufficient when no durable corrective owner exists;
- grant consequential execution authority merely because an obligation exists;
- collapse repair into Product/Architecture redesign without concrete evidence;
- let a Builder/Git/artifact-integrity mistake masquerade as architectural contradiction;
- self-certify material successor/completion claims where R5 requires independent confirmation;
- use Human as an indiscriminate fallback;
- retry unresolved external execution before R8 establishes replay/reconciliation safety;
- mutate failed source/artifact history into its repaired successor;
- bypass R7 scarce-resource admission for corrective work;
- bypass R20 boundary-time revalidation;
- let exhausted replan limits silently authorize further continuation;
- let unknown successor scope become guessed execution.

## 25. Source gaps and assurance status

The following original R11 details are not yet recoverable from the available record and are not being invented:

1. exact historical finding ID if separately frozen;
2. exact enum names/storage representation for every corrective-obligation class beyond the specifically recovered states above;
3. exact migration child labels and ordinals;
4. exact audit name/classification vocabulary if separately frozen;
5. exact acceptance-fixture labels/order;
6. exact closure-evidence list;
7. exact deterministic-key format for every obligation/successor class if separately frozen;
8. exact amendment/rejected-alternative wording beyond the recovered invariants;
9. any original worked examples or repository-path specifics not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R12, but it does not restore R11 implementation authority.

## 26. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
