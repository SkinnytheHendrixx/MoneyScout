# WI-R12 — Durable Scheduling and Runnable Obligation Reconstruction

**Normalized node:** R12  
**Historical finding:** C1-F7  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R12 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing exact enum/storage forms, migration ordinals, fixture labels/order, audit vocabulary, or closure-evidence numbering from compressed summaries.

The historical finding `C1-F7` was restored from the source-level review.

Two WATCH deterministic identity formats were also restored from a cross-referenced prior remediation summary that predates this recovery pass and stated them explicitly and consistently:

- `watch:{watchId}:check:{canonicalNextCheckAt}`
- `watch:{watchId}:trigger-cycle:{cycleId}:RUN_RESEARCH`

These keys therefore have stronger support than memory-only reconstruction, but their provenance is explicitly recorded as **cross-referenced prior summary**, not as direct recovery from the R12 confirmation exchange itself.

Where exact historical text is unavailable, the gap is marked explicitly rather than inferred.

## 2. Frozen root and mission

R12 exists because future or retryable work must survive process death, restart, timer loss, worker replacement, and scheduler downtime.

A process-local timeout, in-memory queue entry, interval, callback, or worker-local retry loop is not durable scheduling authority.

> **If an obligation should still be due after the process that noticed it dies, the obligation’s due/runnable state must be durably reconstructible without manual relay.**

R12 therefore owns durable scheduling/execution-occurrence semantics for future, delayed, recurring, retryable, watch-triggered, or otherwise runnable obligations.

## 3. Domain obligation vs execution occurrence

R12 must not collapse the domain reason for work into the scheduler record that causes one execution occurrence.

The domain owns **why** work exists and **when** it should become due. The execution/scheduling substrate owns **that a runnable occurrence exists, is claimable, and can be reconstructed after failure**.

A scheduler job is therefore not the business obligation itself.

Examples:

- R11 owns the corrective obligation; R12 makes its runnable occurrence durable.
- A WATCH domain object owns the monitoring requirement; R12 makes its next check durable.
- Research/validation owns the reason another analysis run is required; R12 materializes the due execution occurrence.

## 4. Execution Kernel is the canonical scheduler substrate

The confirmed architecture uses the Execution Kernel as the shared durable scheduling substrate.

R12 must not create a second generic scheduler with independent retry, lease, due-time, or runnable semantics for the same class of autonomous work.

Domain-specific workers may define domain timing policy, but runnable execution occurrences must compose with the canonical kernel rather than bypass it through bespoke in-memory scheduling.

> **Domain owns timing intent; the canonical Execution Kernel owns durable runnable occurrence.**

## 5. Durable due/runnable state

R12 must durably represent enough state to determine, after restart or downtime:

- which obligations still exist;
- which are due now;
- which become due later;
- which execution occurrence has already been materialized;
- which occurrence is currently claimed/in flight;
- which occurrence completed;
- which successor occurrence is required;
- which obligations are intentionally paused, superseded, or terminal.

The exact storage enum/field names remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless source review confirms them.

## 6. Deterministic successor reconstruction

A crash between durable domain-state change and creation of the corresponding future/runnable execution occurrence must not permanently lose the work.

If durable state proves that a successor execution should exist but the process died before that occurrence was created, recovery must deterministically reconstruct the missing occurrence without creating duplicates.

The successor need not always be created in the same database transaction as the domain state change, provided the absence is **permanently detectable and deterministically reconstructible**.

> **Durability does not require one giant transaction; it requires that a missing successor can never become invisible.**

Repeated recovery passes must converge on one logical execution occurrence for the same domain obligation/timing identity.

For the confirmed WATCH cases, deterministic identities recovered from the cross-referenced prior summary are:

- next WATCH check: `watch:{watchId}:check:{canonicalNextCheckAt}`
- triggered research cycle: `watch:{watchId}:trigger-cycle:{cycleId}:RUN_RESEARCH`

These exact WATCH forms are normative for the recovered WATCH scope. This does **not** imply that every R12 successor class shares the same key scheme; other deterministic-key formats remain source-unresolved unless separately recovered.

## 7. WATCH scheduling model

The available record confirms WATCH-style obligations as a canonical R12 use case.

The WATCH domain object remains the authoritative monitoring obligation. R12 materializes executable occurrences such as:

- `CHECK_WATCH`
- subsequent domain execution such as `RUN_RESEARCH`

The confirmed WATCH deterministic identities are:

- `CHECK_WATCH`: `watch:{watchId}:check:{canonicalNextCheckAt}`
- trigger-cycle `RUN_RESEARCH`: `watch:{watchId}:trigger-cycle:{cycleId}:RUN_RESEARCH`

These identities ensure that repeated recovery passes converge on one logical runnable occurrence for the same WATCH/timing or WATCH/trigger-cycle identity rather than creating duplicates.

A WATCH requirement must not depend on one process retaining a timer in memory. Restart must not erase its next due check.

## 8. Downtime and missed-due semantics

If the system is down when work becomes due, restart must rediscover that work from durable state.

R12 must not interpret “the timer did not fire while the service was down” as evidence that the obligation disappeared.

Recovered governing behavior:

- due work remains due;
- overdue work becomes runnable under the governing policy;
- reconstruction must avoid duplicate execution occurrences;
- resource and authority gates still apply when the work finally becomes runnable.

Downtime does not create emergency execution authority.

## 9. R11 boundary — ownership vs scheduling

R11 owns **what corrective obligation exists and why**.

R12 owns **when and how a durable runnable occurrence exists for it**.

R12 must not invent corrective scope, mutate R11 successor authority, or treat a scheduler job as the corrective obligation itself.

The confirmed R11 × R12 compound remains normative:

1. a persistent blocker implies one exact successor obligation;
2. process dies before runnable materialization;
3. restart deterministically re-derives the same successor;
4. R12 makes it durably runnable;
5. no orphan blocker;
6. no duplicate successor;
7. no manual relay.

## 10. R13 boundary — durable work vs executor health

R12 proving that due/runnable work exists does not prove any executor is healthy enough to process it.

R13 separately determines whether the responsible executor/runtime is started, progressing, stalled, failed, intentionally disabled, or unknown.

Likewise, R13 reporting a healthy executor cannot compensate for missing durable R12 runnable state.

> **Durable work existence and executor health are separate predicates.**

### 10.1 R12 × R13 × R7 outage-recovery compound — ownership unresolved

The source-level review recalled a possible confirmed three-way outage-recovery burst compound spanning R12, R13, and R7, but did **not** certify whether that scenario was owned normatively by R12 or by R13 with an R12 cross-reference.

Accordingly, this artifact does not promote that recollection into R12 authority.

Status:

`SOURCE_OWNERSHIP_UNRESOLVED / HOLD FOR R13 SOURCE REVIEW`

When R13 is reviewed, the recovery process must determine whether the three-way compound belongs there, here, or is a shared cross-node certification scenario. Until then, §11's confirmed R12×R7 backlog rule remains normative and no additional three-way requirement is inferred.

## 11. R7 boundary — recovery bursts remain governed

Restart or outage recovery may cause many overdue/reconstructible jobs to become runnable at once.

R12 does not grant scarce-resource authority merely because work is overdue or safety-relevant.

Any runnable work that consumes scarce resources must still pass R7 aggregate admission.

This includes catch-up bursts for research, validation, confirmation, capability verification, reconciliation, repair, QA, release, telemetry, and other governed external/provider work.

> **Backlog urgency does not create emergency resource authority.**

## 12. R8 boundary — reconciliation schedules preserve exact execution identity

R12 may schedule or reconstruct reconciliation work, but it must not invent, replace, or coalesce the R8 external execution identity being reconciled.

A reconciliation occurrence must point to the exact unresolved execution.

Repeated scheduler recovery must not create multiple external retries merely because one reconciliation obligation was overdue.

## 13. R3 / R5 / R6 timing obligations

R12 provides durable scheduling for time-dependent or future work required by other nodes without redefining their semantics.

Examples include:

- R3 evidence freshness re-checks;
- R5 independent confirmation retries/follow-ups where allowed;
- R6 capability verification/callback/retry occurrences;
- R8 reconciliation attempts;
- WATCH/research checks.

R12 owns the durable occurrence. The upstream node owns what evidence/result would satisfy the obligation.

## 14. R4 / R20 lineage and current eligibility

A reconstructed future execution must preserve the originating R4 lineage it belongs to where lineage is applicable.

R12 must not replace exact historical lineage with whichever cycle/current object exists when the job wakes up.

Before consequential execution, R20 later determines whether the exact obligation/lineage remains eligible now.

> **Scheduling persistence preserves intent; it does not grant perpetual execution authority.**

## 15. Pause, supersession, and cancellation of future work

Durable scheduling must distinguish “still due” from “no longer eligible because the domain obligation was paused, superseded, completed, or terminated.”

A stale execution occurrence must not run merely because it was once scheduled.

The domain’s durable lifecycle state must be checked under the governing boundary-time rules before execution.

The exact historical state names for pause/supersession/cancellation, if separately frozen, remain source-unresolved.

## 16. Claim/retry semantics

Process death while a runnable occurrence is claimed must not make the underlying domain obligation disappear.

Recovery must be able to distinguish at least:

- occurrence definitely completed;
- occurrence still legitimately in flight;
- claim/lease expired and occurrence is eligible for governed retry;
- external side effect may have occurred and R8 reconciliation is required before any replay.

R12 scheduling semantics must not infer external replay safety from scheduler lease loss.

## 17. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R12:** NO

Generic durable scheduling does not itself define provider/account capability substitution. Scheduled work must preserve the exact provider/account/binding scope supplied by the governing domain object. If a future scheduler path substitutes one provider/account for another consequentially, DI-1 activates at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R12:** NO

R12 may schedule a reversal-related obligation, but DI-2 activates only when an autonomous refund/cancel/void/reversal is actually dispatched as an external economic action. Scheduling alone does not create reversal authority.

The exact original R12 DI wording, if more specific, remains source-checkable during review.

## 18. Known migration surfaces recoverable from record

The available record confirms R12 migration scope includes, at minimum:

- canonical durable runnable/execution-occurrence schema in the Execution Kernel;
- process-local timers and interval-based scheduling;
- WATCH scheduling and check reconstruction using the confirmed deterministic WATCH identities;
- research/validation follow-up scheduling;
- R11 corrective-obligation runnable handoff;
- R3 freshness re-check scheduling;
- R5 confirmation follow-up/retry scheduling where governed;
- R6 capability verification/callback retry scheduling;
- R8 reconciliation scheduling;
- retry/delay/backoff paths that currently exist only in worker memory;
- recovery after scheduler/runtime downtime;
- semantic audit of every “future work” path whose successor can disappear if the process dies.

Exact migration labels, ordinals, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 19. Semantic sibling sweep

Search for patterns including:

- `setTimeout`, `setInterval`, process-local timer, or in-memory queue is the only record that future work exists;
- durable domain state says work is due but no reconstructible execution occurrence exists;
- restart drops future/retry/watch work;
- multiple recovery passes create duplicate runnable occurrences for one obligation;
- WATCH reconstruction fails to use `watch:{watchId}:check:{canonicalNextCheckAt}` for the canonical next check;
- WATCH trigger-cycle research reconstruction fails to use `watch:{watchId}:trigger-cycle:{cycleId}:RUN_RESEARCH`;
- scheduler reconstruction uses current lineage/current object instead of exact originating lineage;
- overdue work bypasses R7 because it is considered urgent;
- lease expiry directly retries an external action whose R8 state is uncertain;
- R11 obligation exists but no durable runnable handoff can be reconstructed;
- scheduler job is treated as the domain obligation itself;
- executor health is inferred merely because runnable jobs exist;
- healthy executor is treated as proof no due work was lost;
- pause/supersession/termination is ignored because an old job remains queued.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 20. Acceptance semantics recoverable from source

At minimum, R12 closure must eventually prove:

- future/delayed/retryable/watch work survives process death and restart;
- due/runnable state is durable or deterministically reconstructible;
- missing successor occurrences are permanently detectable and reconstructible;
- repeated recovery converges without duplicate logical executions;
- WATCH next-check reconstruction uses `watch:{watchId}:check:{canonicalNextCheckAt}`;
- WATCH trigger-cycle `RUN_RESEARCH` reconstruction uses `watch:{watchId}:trigger-cycle:{cycleId}:RUN_RESEARCH`;
- overdue recovery does not bypass R7 resource authority;
- R11 obligations cannot become orphaned between semantic creation and runnable materialization;
- R13 executor health remains distinct from R12 durable-work existence;
- reconciliation scheduling preserves exact R8 execution identity;
- scheduler lease loss does not manufacture replay safety;
- originating R4 lineage is preserved through delayed/reconstructed work;
- R20 eligibility is rechecked before consequential execution;
- paused/superseded/terminal domain obligations do not execute merely because a stale occurrence exists.

Original fixture labels/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 21. Start / local closure / E2E dependency result

### START

R12 contract/schema work may proceed once the Execution Kernel scheduling substrate and the domain-obligation interfaces it must consume are sufficiently understood. R11 and R13 may proceed in parallel, but their semantic ownership/health responsibilities must remain separate.

### LOCAL CLOSURE

R12 may locally close when durable due/runnable representation, deterministic successor reconstruction, confirmed WATCH deterministic identities, WATCH scheduling, downtime recovery, claim/retry semantics, pause/supersession handling, known migrations, audit children, and final sibling sweep are complete.

R13 need not be locally closed for R12 scheduling semantics to exist, but liveness certification remains pending without R13. R7/R8/R20 need not be globally closed for the scheduler schema to exist, but consequential execution certification remains pending until their gates compose correctly.

The ownership of the recalled R12×R13×R7 outage-recovery compound must be resolved during R13 source review before final cross-node certification, but that unresolved ownership does not alter the confirmed R12-local semantics above.

### E2E

Final certification must compose with at least R3, R4, R5, R6, R7, R8, R11, R13, R14, and R20 where relevant.

## 22. Explicit non-goals

R12 must not:

- create a second generic scheduler beside the canonical Execution Kernel;
- redefine the domain obligation that explains why work exists;
- treat process-local timers as durable ownership;
- infer executor health, which belongs to R13;
- grant scarce-resource authority because work is overdue;
- retry an R8-uncertain external action merely because a scheduler lease expired;
- rewrite originating lineage to current state when delayed work wakes up;
- let stale queued work override pause/supersession/termination;
- treat durable scheduling as perpetual execution authority;
- require one giant atomic transaction where permanent detectability plus deterministic reconstruction is sufficient;
- infer the ownership or exact normative framing of the unresolved R12×R13×R7 outage-recovery compound before R13 source review.

## 23. Source gaps and assurance status

The following original R12 details are not yet recoverable from the available record and are not being invented:

1. exact runnable/job/claim state enum names and storage representation;
2. deterministic identity/key formats for reconstructed occurrences **other than** the two confirmed WATCH keys restored from the cross-referenced prior summary;
3. exact migration child labels and ordinals;
4. exact audit name/classification vocabulary if separately frozen;
5. exact acceptance-fixture labels/order;
6. exact closure-evidence list;
7. exact retry/backoff timing policies if separately frozen;
8. exact amendment/rejected-alternative wording beyond the recovered invariants;
9. any original worked examples not represented in the available record;
10. exact ownership/framing of the recalled R12×R13×R7 outage-recovery burst compound, held for R13 source review.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R13, but it does not restore R12 implementation authority.

## 24. First-pass source-review disposition

| Review item | Disposition |
|---|---|
| Core R12 mission, scheduler/domain separation, Execution Kernel, reconstruction, downtime, boundaries | ACCEPTED |
| Historical finding | ACCEPTED CORRECTION → `C1-F7` |
| WATCH deterministic identity formats | PARTIALLY ACCEPTED → RESTORED FROM CROSS-REFERENCED PRIOR SUMMARY |
| R12×R13×R7 outage-recovery compound ownership | UNRESOLVED → HOLD FOR R13 SOURCE REVIEW |
| False assertions requiring rejection | NONE |

## 25. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
