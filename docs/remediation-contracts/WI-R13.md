# WI-R13 — Executor Liveness and Truthful Health

**Normalized node:** R13  
**Historical finding:** C2-F5  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R13 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing migration ordinals, fixture labels/order, exact timeout thresholds, audit vocabulary, or closure-evidence numbering from compressed summaries.

The historical finding `C2-F5` was restored from the source-level review.

The previously open `R12 × R13 × R7` outage-recovery ownership question is also resolved from evidence internal to this recovery process. The R7 recovery artifact already carries the compound normatively, based on directly supplied R7 confirmation material that passed R7 fidelity review. R13 therefore records only its contributing role and cross-references R7 as the owning contract for the three-way certification requirement.

Where exact historical text is unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R13 exists because a system must not report itself healthy merely because a supervisor process, scheduler loop, HTTP endpoint, or generic runtime is alive while the executor responsible for governed work is dead, stalled, wedged, or no longer making observable progress.

> **A healthy supervisor is not proof of a healthy executor. Health must be judged from durable, externally observable evidence that the expected execution path exists and is progressing when work requires it.**

R13 therefore defines truthful liveness/health for the runtime and executor surfaces that must carry R12-runnable obligations into actual governed execution.

## 3. Durable health evidence

Health must be based on durable or externally observable evidence sufficient to determine, where applicable:

- runtime/service started state;
- executor started state;
- last observed tick/heartbeat or equivalent observation;
- last meaningful progress time;
- current and recent failure evidence;
- runnable/claimed/in-flight/completed counts where relevant;
- lease/claim activity where applicable;
- whether due work is being observed;
- whether blocked due work is being durably recognized rather than silently ignored;
- which exact executor/service path is expected to own the work.

Process-local belief is insufficient if no independent observer can distinguish healthy execution from a wedged process.

## 4. Executor Expectation Registry

The recovered contract requires a durable **Executor Expectation Registry** or equivalent authoritative representation describing which executors/service paths are expected to exist.

Recovered expectation classes include:

- `REQUIRED`
- `OPTIONAL`
- `INTENTIONALLY_DISABLED`
- `NOT_APPLICABLE`

Where expectation state is unknown, aggregate health must not silently assume the executor is optional.

> **Unknown executor expectation defaults conservatively rather than manufacturing a healthy aggregate.**

The exact schema and registry storage representation remain source-unresolved until confirmed.

## 5. Canonical health-state family

Recovered R13 health states include:

- `STARTING`
- `HEALTHY`
- `DEGRADED`
- `STALLED`
- `FAILED`
- `INTENTIONALLY_DISABLED`
- `UNKNOWN`

These are semantic states. Exact enum storage, transition thresholds, and timing windows remain source-checkable.

A generic service `200 OK`, supervisor PID, or scheduler heartbeat must not automatically map every required executor to `HEALTHY`.

## 6. Idle executor semantics

An executor may be healthy while idle.

Absence of work is not failure when the executor is observable, expected state is satisfied, and no due/runnable obligation is being silently missed.

Health evaluation must therefore distinguish:

- idle with no due work;
- idle while due work exists but is blocked for an explicit governed reason;
- idle while due work exists and the executor is not observing or progressing it;
- executor not expected to be active.

An idle scan can be healthy when its observation/progress semantics are working correctly.

## 7. Blocked due work does not automatically mean executor failure

Due work can be blocked by R7 admission, R20 eligibility, R6 readiness, R8 reconciliation, pause state, or another governed dependency.

If the executor observes the due work, persists the blocking reason, and continues its required liveness duties, the executor may remain healthy or degraded according to policy rather than being marked failed merely because no consequential action occurred.

Conversely, a blocked state is not an excuse for silence. A required executor that stops observing or updating durable blocked-work truth may become stalled or failed.

## 8. Stall detection is progress-aware

R13 must distinguish a live process from a progressing executor.

A worker can continue emitting heartbeats while making no meaningful progress because of a deadlock, poisoned loop, stuck lease, unhandled queue shape, repeated no-op failure, or wedged dependency.

Health policy must therefore include meaningful-progress evidence, not heartbeat-only liveness.

The exact original stall windows/thresholds are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless confirmed in source review.

## 9. R12 boundary — durable work vs executor health

R12 owns durable due/runnable occurrence existence and reconstruction.

R13 owns whether the executor expected to process that work is actually healthy, progressing, stalled, failed, intentionally disabled, or unknown.

Neither substitutes for the other:

- durable R12 work can exist while R13 executor health is failed;
- R13 can report a healthy executor while R12 has lost a required future occurrence;
- aggregate certification requires both predicates where applicable.

> **Durable work existence and executor health are separate predicates.**

## 10. R12 × R13 × R7 outage-recovery compound — R7-owned certification

The ownership question carried forward from R12 is resolved.

The already-reviewed R7 recovery record owns the normative three-way certification requirement:

> **R12 × R13 × R7 process-outage burst certification — Durable obligations accumulate while executor/supervisor is unavailable → system recovers → many due jobs become runnable → R12/R13 recover execution correctly → R7 prevents the recovery wave from overcommitting shared resources. R7 is not responsible for durable scheduling/liveness — it governs admission once recovered work becomes executable.**

R13's role in that compound is narrower and specific: after outage/restart, the executor/service path responsible for the recovered backlog must become truthfully observable as healthy/progressing before backlog processing can be trusted. R13 does not own the aggregate resource-admission rule and does not redefine R12 reconstruction semantics.

R12 contributes durable backlog reconstruction. R13 contributes truthful executor recovery/liveness. R7 owns the normative three-way certification and aggregate admission constraint.

This closes the prior `SOURCE_OWNERSHIP_UNRESOLVED` state.

## 11. Generic Execution Kernel health is not enough

A generic Execution Kernel can be healthy while one obligation-specific executor is absent or broken.

R13 must not permit a single aggregate kernel heartbeat to imply health for every executor class.

Health must be evaluated against the exact expected execution path for the relevant obligation type.

Examples may include separate Builder, QA, Release, reconciliation, WATCH/research, capability-verification, remediation, or other executor paths even if they share one kernel substrate.

The exact executor inventory remains a migration/audit concern rather than being invented here.

## 12. Replacement seam has four distinct dimensions

The available record preserves four dimensions that must not be collapsed during runtime/executor replacement:

1. runtime identity;
2. executor identity;
3. service-path identity;
4. execution-authority identity.

A replacement can be alive at the runtime level while not yet owning the correct executor path or authority.

Likewise, an incumbent can remain alive while it should no longer claim new consequential work.

R14 owns the governed handoff/replacement lifecycle. R13 supplies the health/readiness evidence R14 needs; R13 does not itself transfer authority.

## 13. R14 boundary — replacement readiness

R14 may treat successor readiness as proven only from R13-compatible evidence for the required executor/service path.

A successor runtime that starts successfully but has no functioning required executor is not ready merely because the process is up.

Likewise, incumbent shutdown must not erase unresolved external work or durable obligations; R8/R12/R14 remain authoritative for those dimensions.

R13 evaluates health. R14 decides transfer/handoff authority.

## 14. R8 boundary — health does not rewrite external truth

Executor failure, stall, or restart must not rewrite R8 external-execution truth.

If a provider boundary may have been crossed, a dead executor does not prove failure or non-dispatch.

Health recovery may make reconciliation runnable, but R8 still owns the authoritative execution outcome.

## 15. R7 boundary — liveness does not create resource authority

A healthy or recovering executor does not gain permission to spend scarce resources merely because work is queued, overdue, or safety-related.

Every scarce-resource-consuming execution remains subject to R7 admission.

Likewise, R7 denial is not by itself proof the executor is unhealthy when the executor correctly observes and persists the blocked state.

The R7-owned outage-recovery compound in §10 remains the cross-node certification for recovery bursts.

## 16. Health aggregation must respect expectation class

Aggregate system health must incorporate executor expectation semantics.

At minimum:

- a `REQUIRED` executor that is `FAILED`, `STALLED`, or materially `UNKNOWN` must prevent a falsely healthy aggregate for the scope that requires it;
- `INTENTIONALLY_DISABLED` is not equivalent to failed when disablement is itself governed and expected;
- `NOT_APPLICABLE` must not be counted as missing;
- `OPTIONAL` must not silently become required or vice versa;
- unknown expectation must not be treated permissively merely to preserve green status.

The exact aggregate formula remains source-checkable.

## 17. Durable ownership of health observations

Health evidence must be available outside the executor being judged where necessary to avoid self-certification by a wedged process.

The implementation may use supervisor observations, durable heartbeats, lease observations, kernel metrics, persisted progress records, or equivalent mechanisms, but the semantic requirement is that another component can determine whether the expected executor path is alive and progressing.

A worker saying “I am healthy” is not sufficient if no durable evidence can distinguish that claim from a stuck loop.

## 18. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R13:** NO

Generic executor health does not itself redefine provider/account capability identity or authorize substitution. If an executor-health implementation begins selecting a different provider/account as a consequence of a health failure, DI-1 activates at that substitution scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R13:** NO

R13 judges executor health and does not itself dispatch autonomous refunds/cancels/voids/reversals. DI-2 activates only in the separate external reversal execution scope.

The exact original R13 Design Input wording remains source-checkable during review.

## 19. Known migration surfaces recoverable from record

The available record confirms R13 migration scope includes, at minimum:

- Executor Expectation Registry or equivalent expected-executor representation;
- executor/runtime health state persistence;
- durable heartbeat/tick/progress evidence;
- stalled-vs-healthy progress adjudication;
- required/optional/intentionally-disabled/not-applicable aggregation;
- Execution Kernel aggregate-health surfaces;
- obligation-specific executor health surfaces;
- supervisor health endpoints that can remain green while executors are dead;
- worker claim/lease/progress instrumentation;
- runtime replacement readiness consumed by R14;
- outage/restart executor recovery evidence consumed by the R7-owned R12×R13×R7 certification;
- semantic audit of every health/readiness surface that currently infers executor health from generic process liveness.

Exact migration labels, ordinals, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 20. Semantic sibling sweep

Search for patterns including:

- supervisor/process/HTTP health is green while a required executor is dead;
- heartbeat continues while meaningful progress is absent indefinitely;
- generic Execution Kernel health is reused as proof every obligation-specific executor is healthy;
- due work exists but the expected executor never observes it;
- blocked work is invisible rather than durably recorded;
- R7 denial is misclassified as executor death despite healthy blocked-state observation;
- outage recovery makes backlog runnable while required executor remains dead/stalled but system reports recovery healthy;
- unknown expectation defaults to optional/permissive health;
- intentionally disabled executor is indistinguishable from failed executor;
- stale lease/claim remains forever without progress adjudication;
- replacement runtime is declared ready without required executor/service-path evidence;
- executor stall/failure is used to infer R8 provider failure/non-dispatch;
- health status itself grants new execution/resource authority.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 21. Acceptance semantics recoverable from source

At minimum, R13 closure must eventually prove:

- required executor death cannot coexist with a falsely healthy scoped aggregate;
- heartbeat-only wedging can be distinguished from meaningful progress;
- idle with no due work can remain healthy;
- blocked due work can remain healthy/degraded when it is observed and persisted correctly;
- due work that is silently unobserved can drive stall/failure;
- Executor Expectation Registry semantics distinguish REQUIRED/OPTIONAL/INTENTIONALLY_DISABLED/NOT_APPLICABLE;
- unknown expectation fails conservatively rather than permissively;
- generic kernel health cannot stand in for every obligation-specific executor;
- R12 durable-work existence remains distinct from R13 executor health;
- outage recovery must restore truthful required-executor liveness before recovered backlog processing can be trusted;
- the R12×R13×R7 compound is cross-referenced as R7-owned rather than duplicated as R13 authority;
- R14 replacement readiness consumes path-specific R13 evidence rather than process-up status;
- R8 external execution truth is unchanged by executor death/restart;
- R7 resource admission remains required during backlog/outage recovery;
- the four replacement dimensions (runtime/executor/service-path/execution-authority) remain distinguishable.

The exact original fixture labels/order and closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 22. Start / local closure / E2E dependency result

### START

R13 contract/schema work may proceed once the relevant runtime/executor surfaces and R12 runnable-work interfaces are understood. R12 and R14 may proceed in parallel, but work-existence, health, and transfer-authority responsibilities must remain separate.

### LOCAL CLOSURE

R13 may locally close when executor expectation semantics, durable health evidence, progress-aware stall detection, path-specific aggregation, idle/blocked semantics, known migrations, audit children, and final sibling sweep are complete.

The former R12×R13×R7 ownership hold is closed: R7 owns the cross-node certification; R13 must satisfy its liveness contribution and preserve the cross-reference.

### E2E

Final certification must compose with at least R7, R8, R11, R12, R14, and R20 where relevant.

## 23. Explicit non-goals

R13 must not:

- infer executor health from supervisor/process liveness alone;
- infer every obligation-specific executor is healthy from generic Execution Kernel health;
- define R12 durable scheduling semantics;
- grant execution or resource authority because an executor is healthy;
- treat R7 resource denial as executor failure when blocked-state observation is healthy;
- rewrite R8 external execution truth because an executor died or stalled;
- transfer runtime/execution authority, which belongs to R14;
- collapse runtime, executor, service-path, and execution-authority identity into one readiness bit;
- classify an unknown expected executor as optional merely to preserve a healthy aggregate;
- re-own or redefine the R7-owned R12×R13×R7 outage-recovery certification.

## 24. Source gaps and assurance status

The following original R13 details are not yet recoverable from the available record and are not being invented:

1. exact health-state transition thresholds/timers;
2. exact Executor Expectation Registry schema/storage representation;
3. exact aggregate-health formula if separately frozen;
4. exact migration child labels and ordinals;
5. exact audit name/classification vocabulary if separately frozen;
6. exact acceptance-fixture labels/order;
7. exact closure-evidence list;
8. exact amendment/rejected-alternative wording beyond the recovered invariants;
9. any original worked examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R14, but it does not restore R13 implementation authority.

## 25. First-pass source-review disposition

| Review item | Disposition |
|---|---|
| Core R13 mission, health evidence, expectation registry, health states, idle/blocked/stall semantics, boundaries | ACCEPTED |
| Historical finding | ACCEPTED CORRECTION → `C2-F5` |
| R12×R13×R7 outage-recovery compound ownership | ACCEPTED CORRECTION → R7-OWNED, R13 CONTRIBUTOR/CROSS-REFERENCE |
| False assertions requiring rejection | NONE |

## 26. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
