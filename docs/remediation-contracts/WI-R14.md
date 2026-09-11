# WI-R14 — Governed Runtime Replacement, Quiescence, and Authority Handoff

**Normalized node:** R14  
**Historical finding:** C2-F4  
**Severity:** MATERIAL, conditionally escalates to BLOCKER while C2-F1 / R8 runtime-replacement race remains unresolved  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R14 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing exact lifecycle enum/storage representation, migration ordinals, fixture labels/order, timeout values, audit vocabulary, or closure-evidence numbering from compressed summaries.

The historical finding `C2-F4` and its severity relationship were restored from the source-level review. R14 is base-severity MATERIAL, but it conditionally escalates to BLOCKER while C2-F1 / R8's runtime-replacement race remains unresolved, because unresolved external-execution truth during replacement is the mechanism that converts this lifecycle gap into immediate consequential risk.

R14 consumes already-recovered requirements from R8, R10, R12, and R13 rather than redefining them. In particular:

- R8 owns unresolved external-execution truth;
- R10 owns exact artifact identity;
- R12 owns durable runnable obligations;
- R13 owns truthful path-specific executor health/readiness.

Where exact historical text is unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R14 exists because replacing a runtime, worker, executor, or service path is itself a governed authority transition. A replacement is not safe merely because the new process starts successfully or the old process is asked to stop.

> **A replacement is not complete until the incumbent has stopped creating new consequential work, all existing work has an authoritative disposition, and the successor has independently proven readiness for the exact execution path it is about to own.**

R14 therefore governs quiescence, draining, in-flight work disposition, authority transfer, successor readiness, bounded non-convergence, and post-transfer fencing.

## 3. Incumbent lifecycle

Recovered incumbent lifecycle semantics include:

`ACTIVE → DRAINING → QUIESCED → HANDOFF_READY → RETIRED`

The semantic requirements are load-bearing even if exact storage representation differs.

- `ACTIVE`: incumbent may own its currently authorized execution scope.
- `DRAINING`: incumbent must stop accepting/claiming new consequential work while resolving or handing off existing work.
- `QUIESCED`: no new claims are permitted and local execution has reached the required quiescence condition.
- `HANDOFF_READY`: every in-flight or unresolved item has an explicit authoritative disposition suitable for transfer or closure.
- `RETIRED`: incumbent no longer possesses execution authority for the transferred scope.

R14 must not jump directly from ACTIVE to RETIRED merely because a successor process is available.

The `DRAINING → QUIESCED` transition is itself bounded. Incumbent drain/quiescence must have a governed deadline or equivalent finite non-convergence rule symmetric to successor-readiness timeout semantics. A drain that never converges must not leave replacement permanently half-open.

## 4. Successor lifecycle

Recovered successor lifecycle semantics include:

`STARTING → READY_CANDIDATE → AUTHORITATIVE_ACTIVE`

A successor may be alive without being ready, and it may be ready without yet being authoritative.

`READY_CANDIDATE` requires R13-compatible health/readiness evidence for the exact required executor/service path, but does not itself transfer authority.

`AUTHORITATIVE_ACTIVE` is reached only after the governed handoff commits the new authority epoch / equivalent fencing state.

> **Process-up is not authority-up.**

## 5. Quiescence conditions

Recovered quiescence requires, at minimum, the following semantic conditions:

- `NO_NEW_CLAIMS`
- `NO_ACTIVE_LOCAL_EXECUTION`
- `NO_UNTRANSFERRED_EXTERNAL_UNCERTAINTY`

The incumbent must stop claiming new consequential work before authority transfer.

Local execution that can safely complete before handoff may do so under the governing drain policy. Work that cannot complete before handoff must receive an explicit disposition under §6.

`NO_UNTRANSFERRED_EXTERNAL_UNCERTAINTY` does **not** mean every external operation must already be terminal. It means any unresolved external uncertainty must be durably represented and transferred in a form that preserves the exact R8 execution identity and reconciliation ownership.

## 6. In-flight work disposition

Recovered in-flight disposition family includes:

- `COMPLETED_BEFORE_HANDOFF`
- `TRANSFERABLE_PENDING`
- `EXTERNAL_EXECUTION_RECONCILIATION_REQUIRED`
- `NONTRANSFERABLE_BLOCKED`
- `ABANDONED_PRE_DISPATCH_WITH_PROOF`

These dispositions are semantically distinct.

### 6.1 `COMPLETED_BEFORE_HANDOFF`

The incumbent completes the work under its still-valid authority before transfer, and durable completion evidence is preserved.

### 6.2 `TRANSFERABLE_PENDING`

The work has not crossed a consequential external boundary and can be safely represented as durable pending work for the successor without duplicating authority or losing exact lineage.

### 6.3 `EXTERNAL_EXECUTION_RECONCILIATION_REQUIRED`

The provider boundary may have been crossed or external truth remains unresolved. The exact R8 execution identity must be preserved and handed off as reconciliation-required work. The successor must not create a fresh external retry merely because ownership changed.

### 6.4 `NONTRANSFERABLE_BLOCKED`

The work cannot safely complete under the incumbent and cannot safely transfer under the current state. R11 must own the resulting bounded corrective disposition rather than allowing silent abandonment or unauthorized improvisation.

### 6.5 `ABANDONED_PRE_DISPATCH_WITH_PROOF`

Work may be abandoned pre-dispatch only where R8-compatible durable proof establishes that the consequential external boundary was never crossed. Any R7 release must consume that proof rather than infer safety from worker shutdown.

## 7. R8 boundary — unresolved external truth survives replacement

Runtime replacement does not rewrite external execution history.

If the incumbent dies, drains, or relinquishes authority while an external outcome is uncertain, the successor inherits the obligation to reconcile the **same exact execution identity** where transfer is allowed.

A replacement must not:

- convert uncertainty into failure merely because the incumbent disappeared;
- release reserved exposure merely because ownership moved;
- create a new execution identity and retry blindly;
- collapse a local cancellation request into provider-authoritative cancellation;
- substitute a different provider/account when reconciling historical truth.

> **Replacement changes who owns reconciliation. It does not change what happened externally.**

The severity relationship in §1 is load-bearing here: while C2-F1 / R8 replacement-race truth remains unresolved, R14's base MATERIAL gap escalates to BLOCKER because replacement can otherwise strand or duplicate consequential external work.

## 8. R12 boundary — durable obligations survive handoff

R12-owned due/runnable obligations must not disappear because the incumbent scheduler or executor is being replaced.

The successor must be able to observe/reconstruct the exact durable obligations that remain valid after handoff.

R14 must not use process-local queue state as the authoritative handoff list.

Any obligation invalidated by pause, supersession, completion, or lifecycle change must be handled under its domain rules rather than executed merely because it was queued before replacement.

## 9. R13 boundary — readiness is path-specific

R13 supplies the evidence R14 uses to judge successor readiness.

A successor runtime is not handoff-ready merely because:

- its process started;
- its health endpoint returns 200;
- the generic Execution Kernel is healthy;
- some unrelated executor path is progressing.

Readiness must be proven for the exact executor/service path required by the scope being transferred.

R13's four replacement dimensions remain distinct:

1. runtime identity;
2. executor identity;
3. service-path identity;
4. execution-authority identity.

R14 consumes those distinctions and performs the authority transfer; R13 does not itself grant authority.

## 10. R7 boundary — replacement does not create resource authority

Drain, reconciliation, verification, catch-up, replay-safe continuation, or successor startup work that consumes scarce resources remains subject to R7.

Replacement urgency does not create emergency resource authority.

A successor becoming authoritative does not inherit an unlimited right to spend merely because the incumbent was previously authorized.

Existing reservations/exposure must retain exact ownership/linkage semantics through transfer where applicable; replacement must not duplicate reservations or release uncertainty optimistically.

## 11. R10 boundary — expected artifact vs observed artifact during replacement

Runtime replacement must preserve exact R10 artifact identity.

Recovered governing scenario:

> **Expected P / observed Q mismatch blocks adoption; handoff cannot “normalize” Q into P merely because the replacement runtime is now authoritative.**

A successor that observes production artifact Q while the governed expected artifact is P must preserve both identities and fail closed for adoption until the discrepancy is resolved.

Replacement authority cannot manufacture artifact equivalence.

## 12. Authority epoch / fencing

R14 requires a durable authority epoch, generation, lease-fencing token, or equivalent monotonic mechanism sufficient to prevent both old and new runtimes from exercising the same consequential authority after transfer.

At handoff:

1. incumbent must be prevented from new claims under the transferred scope;
2. successor readiness must be proven;
3. the new authority epoch / equivalent fencing state must be committed;
4. successor may then become `AUTHORITATIVE_ACTIVE`;
5. any stale incumbent claim using the prior authority epoch must fail closed.

> **Handoff is not safe if an old runtime can become consequentially active again merely because it wakes up late.**

The exact storage mechanism is source-unresolved; the fencing invariant is not.

## 13. Compatibility predicate before transfer

A successor must satisfy a compatibility predicate for the scope it will own before authority transfer.

At minimum, compatibility must be able to account for, where relevant:

- exact executable contract/version compatibility;
- required R13 executor/service-path readiness;
- ability to observe R12 durable obligations;
- ability to preserve/reconcile R8 unresolved executions;
- ability to preserve R10 artifact/deployment identity;
- capability/binding/resource prerequisites required by the transferred scope;
- authority epoch/fencing support.

A process being newer is not evidence that it is compatible.

The exact original compatibility schema/field list, if more detailed, is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until confirmed.

## 14. Bounded readiness and bounded drain non-convergence

Replacement cannot remain indefinitely in an ambiguous half-transferred state.

### 14.1 Successor readiness timeout

The successor-readiness process must be bounded by a governed timeout/deadline or equivalent finite non-convergence rule.

The confirmed terminal state for failure to converge within that bound is:

`READINESS_TIMEOUT`

`READINESS_TIMEOUT` must not silently wait forever, transfer authority anyway, or automatically restore incumbent execution authority.

Once `READINESS_TIMEOUT` is reached, the confirmed bounded dispositions are:

- an R11-owned `ABORT_REPLACEMENT`; or
- routing to `HUMAN_BOUNDARY` where the unresolved non-convergence itself requires genuinely human judgment.

### 14.2 Incumbent drain timeout symmetry

The incumbent's `DRAINING → QUIESCED` path is subject to an equivalent bounded non-convergence rule. Drain/quiescence may not hang indefinitely while only successor readiness is bounded.

If the incumbent cannot reach quiescence within the governed drain bound, R14 must enter an owned non-converged disposition rather than retire the incumbent, force transfer, or leave the system indefinitely half-drained. The same structural rule applies: the failure must route to a bounded R11-owned replacement disposition or `HUMAN_BOUNDARY` when genuinely required.

> **A lifecycle transition is not fully specified until both success and non-convergence have bounded, owned dispositions.**

The exact readiness and drain timeout values remain source-unresolved unless recovered during source review.

## 15. Readiness timeout does not authorize incumbent resumption

`READINESS_TIMEOUT`, drain timeout, or any other replacement non-convergence does **not** automatically authorize the incumbent to resume unrestricted consequential execution.

Before authority transfer, there may be cases where the replacement attempt can be safely aborted and the incumbent resumed, but only if the system can prove that:

- transfer has not committed;
- the incumbent's prior authority remains valid;
- no incompatible handoff state or external uncertainty has been introduced;
- all governing R20 / lifecycle / capability / resource predicates still permit resumption.

If safe resumption cannot be proven, the state remains governed and owned under R11/Human-boundary rules as applicable.

> **Timeout is a failure to converge, not a grant of authority.**

## 16. Pre-transfer abort vs post-transfer rollback

Pre-transfer and post-transfer failure are not the same operation.

### 16.1 Pre-transfer abort

Before the new authority epoch commits, a replacement attempt may be aborted and the incumbent resumed only under the proof requirements in §15.

An R11-owned `ABORT_REPLACEMENT` disposition does not itself prove incumbent resumption is safe; it authorizes the governed abort path, after which the §15 proof requirements still determine whether incumbent consequential execution may resume.

### 16.2 Post-transfer failure

After the successor has become `AUTHORITATIVE_ACTIVE`, the system must not simply “rewind” to the old authority epoch.

Any rollback to a prior runtime requires a **new governed replacement/handoff** with a new authority epoch and fresh readiness/compatibility checks.

> **Post-transfer rollback is a new transfer, not a rewind of history.**

This preserves monotonic authority history and prevents resurrection of stale claims.

## 17. R20 boundary — eligibility must still be current

R14 transfers execution authority for a specific governed scope. It does not create perpetual permission for the successor to execute every obligation it inherits.

R20 must still revalidate applicable authority/lifecycle/resource/capability/evidence/lineage/adoption predicates at consequential boundaries after handoff.

An inherited obligation can remain historically valid yet become currently ineligible for execution.

> **Transfer ownership and execution eligibility are separate authority consumptions.**

## 18. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R14:** NO

Generic runtime replacement must preserve the provider/account/capability identities already governing transferred work. It must not treat replacement runtime identity as permission to substitute a different provider/account.

If a future handoff mechanism intentionally rebinding provider/account capability identity becomes part of the transfer, DI-1 activates at that exact rebinding scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R14:** NO

R14 governs runtime/executor authority transfer, not autonomous refunds/cancels/voids/reversals. If a replacement path itself dispatches an external economic reversal, DI-2 activates in that reversal scope.

The exact original R14 DI wording, if more specific, remains source-checkable during review.

## 19. Known migration surfaces recoverable from record

The available record confirms R14 migration scope includes, at minimum:

- runtime/executor lifecycle representation;
- incumbent drain/quiescence logic;
- incumbent drain deadline/non-convergence handling;
- successor readiness/admission path;
- `READINESS_TIMEOUT` handling;
- R11-owned `ABORT_REPLACEMENT` routing;
- `HUMAN_BOUNDARY` routing where genuine human judgment is required;
- authority epoch / fencing mechanism;
- in-flight work disposition persistence;
- unresolved R8 execution handoff;
- R12 durable-obligation handoff/reconstruction;
- R13 path-specific readiness evidence consumption;
- R10 expected/observed artifact preservation during replacement;
- R7 reservation/exposure continuity through transfer;
- stale-incumbent claim rejection;
- pre-transfer abort handling;
- post-transfer rollback as new governed transfer;
- semantic audit of every runtime replacement/restart/deployment path that can move execution authority.

Exact migration labels, ordinals, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 20. Semantic sibling sweep

Search for patterns including:

- new runtime declared authoritative merely because process starts;
- old runtime continues claiming new work after drain begins;
- incumbent drain/quiescence can hang indefinitely without an owned timeout disposition;
- successor readiness can hang indefinitely without reaching `READINESS_TIMEOUT`;
- `READINESS_TIMEOUT` has no R11-owned `ABORT_REPLACEMENT` or `HUMAN_BOUNDARY` route;
- handoff destroys or forgets R12 durable obligations;
- unresolved R8 execution is retried rather than transferred for reconciliation;
- reservation/exposure released because worker/runtime was replaced;
- incumbent and successor can both pass authority checks simultaneously;
- stale old authority epoch remains accepted after transfer;
- replacement readiness uses generic kernel health instead of exact executor/service-path health;
- expected artifact P / observed Q mismatch is normalized during handoff;
- in-flight work has no explicit disposition before retirement;
- nontransferable work is silently abandoned;
- pre-dispatch abandonment lacks durable proof of non-dispatch;
- readiness or drain timeout automatically resumes incumbent authority;
- post-transfer failure rewinds to the old epoch instead of creating a new transfer;
- replacement process changes provider/account identity implicitly;
- inherited obligation bypasses R20 because transfer is treated as perpetual permission.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 21. Acceptance semantics recoverable from source

At minimum, R14 closure must eventually prove:

- incumbent stops new consequential claims before transfer;
- quiescence distinguishes no-new-claims, no-active-local-execution, and no-untransferred-external-uncertainty;
- incumbent `DRAINING → QUIESCED` has a bounded non-convergence rule;
- every in-flight item has one authoritative disposition before incumbent retirement;
- unresolved R8 execution identity survives transfer without blind retry;
- R12 durable obligations survive replacement;
- successor readiness is R13 path-specific, not generic process-up status;
- successor readiness non-convergence reaches `READINESS_TIMEOUT`;
- `READINESS_TIMEOUT` routes only through an R11-owned `ABORT_REPLACEMENT` or `HUMAN_BOUNDARY` where human judgment is genuinely required;
- authority epoch/fencing prevents stale incumbent execution after transfer;
- R7 reservations/exposure are neither duplicated nor optimistically released during handoff;
- expected P / observed Q mismatch blocks adoption under R10;
- readiness/drain timeout does not itself authorize incumbent resumption;
- pre-transfer abort requires proof that incumbent authority remains valid before consequential resumption;
- post-transfer rollback creates a new governed handoff/epoch rather than rewinding history;
- inherited work still passes R20 boundary-time eligibility before consequential execution;
- base MATERIAL severity escalates to BLOCKER while C2-F1 / R8 replacement-race uncertainty remains unresolved.

Original fixture labels/order and exact closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 22. Start / local closure / E2E dependency result

### START

R14 contract/schema work may proceed once R8 execution identity, R12 durable-obligation interfaces, and R13 readiness evidence are sufficiently stable to define transfer seams. R10 artifact identity and R7 exposure interfaces may proceed in parallel but must be preserved at the handoff boundary.

### LOCAL CLOSURE

R14 may locally close when lifecycle states, drain/quiescence, **bounded incumbent drain**, in-flight dispositions, successor compatibility/readiness, `READINESS_TIMEOUT`, bounded successor non-convergence, R11-owned `ABORT_REPLACEMENT` / `HUMAN_BOUNDARY` routing, authority fencing, pre-transfer abort, post-transfer rollback-as-new-transfer, known migrations, audit children, and final sibling sweep are complete.

R20 need not be globally closed for the transfer state machine to exist, but consequential post-handoff execution certification remains pending without R20-compatible boundary checks.

### E2E

Final certification must compose with at least R7, R8, R10, R11, R12, R13, and R20 where relevant. While C2-F1 / R8's replacement-race root remains unresolved, R14 remains conditionally BLOCKER for this cross-node certification context.

## 23. Explicit non-goals

R14 must not:

- treat process startup as authority transfer;
- treat R13 health evidence as authority by itself;
- infer external execution truth from runtime death/replacement;
- erase or recreate unresolved R8 execution identity during handoff;
- drop R12 obligations because the old scheduler/executor stopped;
- release R7 exposure merely because ownership changed;
- normalize R10 expected/observed artifact mismatch;
- allow incumbent and successor to exercise the same authority epoch after transfer;
- let a stale incumbent reclaim authority after waking late;
- let incumbent drain or successor readiness remain unbounded indefinitely;
- treat `READINESS_TIMEOUT` or drain timeout as permission to resume incumbent execution;
- skip the R11-owned `ABORT_REPLACEMENT` / `HUMAN_BOUNDARY` disposition when replacement cannot converge;
- rewind to an old authority epoch after post-transfer failure;
- substitute provider/account identity merely because the runtime changed;
- treat transferred ownership as perpetual R20 execution eligibility;
- flatten R14's conditional BLOCKER escalation into a permanent flat severity independent of R8/C2-F1 state.

## 24. Source gaps and assurance status

The following original R14 details are not yet recoverable from the available record and are not being invented:

1. exact lifecycle enum/storage representation if different from the recovered semantic states;
2. exact authority-epoch/fencing storage mechanism;
3. exact successor compatibility schema/field list;
4. exact readiness and incumbent-drain timeout values/timing policies;
5. exact migration child labels and ordinals;
6. exact audit name/classification vocabulary if separately frozen;
7. exact acceptance-fixture labels/order;
8. exact closure-evidence list;
9. exact amendment/rejected-alternative wording beyond the recovered invariants;
10. any original worked examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R15, but it does not restore R14 implementation authority.

## 25. First-pass source-review disposition

| Review item | Disposition |
|---|---|
| Core R14 lifecycle, quiescence, in-flight dispositions, fencing, R7/R8/R10/R12/R13/R20 boundaries | ACCEPTED |
| Historical finding | ACCEPTED CORRECTION → `C2-F4` |
| Severity relationship | ACCEPTED CORRECTION → MATERIAL, conditionally BLOCKER while C2-F1 / R8 replacement race unresolved |
| `READINESS_TIMEOUT` + named dispositions | PARTIALLY ACCEPTED → RESTORED |
| Symmetric incumbent drain deadline/non-convergence | PARTIALLY ACCEPTED → RESTORED |
| False assertions requiring rejection | NONE |

## 26. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.