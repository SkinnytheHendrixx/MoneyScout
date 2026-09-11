# WI-R8 — Durable External-Boundary Truth and Reconciliation

**Normalized node:** R8  
**Historical finding:** merged root spanning C1-F2 + C2-F1  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R8 recovery from the confirmed material still available in the project record. It preserves only obligations that can be recovered with high confidence. It does **not** regenerate missing migration numbering, closure evidence, or exact fixture wording from the compressed register or from later-node summaries.

Where exact historical text is unavailable, this artifact marks the gap explicitly rather than inferring a replacement.

## 2. Frozen root and mission

R8 exists to make external mutation truth durable enough that the system can distinguish:

- work that provably never crossed the external boundary;
- work that crossed and is still in flight;
- work that succeeded, failed, or was cancelled externally;
- work whose external outcome remains reconcilable but unresolved;
- work whose external outcome is no longer reconcilable.

The system must not treat local process state, cancellation intent, lease loss, timeout, or missing callback as authoritative evidence about what happened outside Money Scout.

> **External-boundary truth must be durable, execution-scoped, and reconciled from authoritative evidence before the system retries, releases reserved exposure, or adopts an external result.**

## 3. Canonical execution-outcome model

Recovered outcome states include:

- `DISPATCHED` / `IN_FLIGHT`
- `SUCCEEDED`
- `FAILED`
- `CANCELLED`
- `OUTCOME_UNCERTAIN_RECONCILABLE`
- `OUTCOME_UNCERTAIN_UNRECONCILABLE`
- `RECONCILED_NOT_DISPATCHED`

`RECONCILED_NOT_DISPATCHED` is the confirmed terminal state for a historical execution attempt that existed and entered uncertainty, but authoritative reconciliation later proved that the consequential provider boundary was never crossed for that exact attempt.

It is not a reusable pre-dispatch state.

> **Proof that the original attempt never crossed the boundary closes that attempt; it does not rewind it into a reusable pre-dispatch state. Any subsequent dispatch is a new execution attempt.**

The explicitly rejected alternative is to reuse the reconciled execution record for a later provider call. That is forbidden because it would merge two historically distinct dispatch attempts and weaken reconciliation provenance.

A cancellation request is **not** equivalent to authoritative `CANCELLED`.

## 4. Canonical ordering around the provider boundary

The recovered safety ordering is:

1. establish exact execution identity;
2. durably record that execution/boundary attempt before the external provider call can begin;
3. cross the provider boundary;
4. durably persist provider-side identity and/or authoritative outcome evidence when obtained;
5. reconcile authoritative external truth back to the exact execution;
6. only then allow retry/release/adoption decisions that depend on that truth.

> **Identity must exist before the provider boundary, not be reconstructed after it.**

If a new external call is made, it is a new execution identity. A historical execution that reaches `RECONCILED_NOT_DISPATCHED` is closed and may not be silently reused as authority for a later call.

## 5. Pre-dispatch abandonment

A reservation/execution may be abandoned and released only when durable evidence proves the external boundary was never crossed.

Local stop conditions are insufficient by themselves.

This seam composes directly with R7:

> **R7 may release pre-dispatch exposure only from R8-authoritative proof of non-dispatch.**

## 6. Post-dispatch uncertainty

Once the external boundary may have been crossed, process-local disappearance does not restore safety.

Timeout, worker death, lease loss, supervisor restart, missing callback, or local exception must not be interpreted as proof of external failure or proof that no provider-side effect exists.

The execution remains in a reconciliable or unreconciliable uncertainty state until authoritative evidence resolves it.

## 7. Unreconcilable exposure

The confirmed #77.5 escalation remains normative:

`EXPOSURE_COMMITTED_UNRECONCILABLE`

This state is permitted only when:

- the provider boundary was crossed or may have crossed;
- the resulting external outcome cannot be authoritatively reconciled;
- synchronous outcome was lost or otherwise unavailable;
- the system cannot safely prove non-dispatch, final failure, final success, or another terminal external state.

It must escalate immediately rather than being normalized into a generic retryable failure or released exposure.

## 8. Retry safety

Retry authority is downstream of external-boundary truth.

A local failure does not imply the external action is safe to repeat.

The system may retry only when one of the following is true:

- authoritative evidence proves the prior attempt did not dispatch and that historical attempt is closed under the exact execution identity;
- the provider/API contract gives a replay-safe/idempotent mechanism bound to the exact execution identity;
- reconciliation proves a terminal result for which a new successor execution is explicitly allowed.

Where replay safety is unproved, the system must reconcile first rather than guessing.

A later provider dispatch is a new execution attempt unless the provider contract itself provides a replay-safe/idempotent mechanism that preserves one exact attempt identity under its confirmed semantics.

## 9. Cancellation semantics

Requesting cancellation records intent. It does not itself prove provider-side cancellation.

Recovered distinction:

- local `CANCEL_REQUESTED` / equivalent = Money Scout asked for cancellation;
- authoritative `CANCELLED` = provider-side evidence proves the execution is cancelled according to the provider contract.

Any settlement, reservation release, retry, or successor action that depends on cancellation must consume the authoritative state, not the request intent.

## 10. R7 × R8 boundary

R7 owns scarce-resource reservation and exposure accounting.

R8 owns whether the exact external execution crossed the boundary and what happened there.

The two must not collapse into one state machine:

- R7 reservation cannot prove dispatch;
- R8 dispatch cannot by itself prove financial settlement;
- R8 non-dispatch proof may permit R7 release;
- post-dispatch uncertainty keeps R7 exposure conservative until authoritative reconciliation permits movement.

### R7 × R8 recovery-burst compound

An outage can produce N simultaneously uncertain external operations. When recovery makes reconciliation work runnable again, urgency does not create new resource authority.

> **A backlog of unresolved external uncertainty does not create emergency resource authority — reconciliation urgency does not bypass aggregate reservation.**

Any reconciliation work that consumes scarce resources remains governed by R7 aggregate admission even when all N reconciliations are individually safety-required and time-sensitive.

## 11. R15 / R16 boundary

R8's external execution truth is distinct from provider financial truth.

A provider call may be technically `SUCCEEDED` while financial observation is still pending, corrected, disputed, or unreconciled.

Likewise, a provider may report financial evidence even while the local runtime lost the synchronous execution result.

R15 preserves provider-originating financial observations. R16 reconciles them deterministically. R8 must preserve the exact execution identity they attach to.

## 12. R6 boundary

Capability readiness and external reconcilability are separate propositions.

R6 may establish that a capability is `AUTOMATION_READY`; that does not prove any individual execution against that capability is replay-safe or reconciled.

Likewise, R8 uncertainty must not rewrite capability readiness as though one uncertain execution proved the capability unusable in general.

## 13. R14 replacement/handoff boundary

Runtime replacement must not strand external uncertainty.

An execution whose provider boundary may have been crossed cannot be abandoned merely because its incumbent runtime is draining or being replaced.

R14 must classify it as reconciliation-required / transferable pending / equivalent governed handoff state, preserving exact R8 execution identity until a successor owner can continue reconciliation.

## 14. DI-1 and provider/account identity

DI-1 is not generically activated merely by R8 persisting provider/account identity for an exact execution.

However, R8 must never reconcile an execution against a different provider/account merely because that account can satisfy the same logical capability.

> **Generic resolution must not cross-account substitute when establishing historical execution truth.**

### R6 × R7 × R8 DI-1 scope-consistency checkpoint

The confirmed three-node compatibility requirement is:

> **R6, R7, and R8 must use the same notion of exact provider/account scope for the consequential operation. Capability proof, resource reservation, and reconciliation must refer to the same exact provider/account scope.**

A capability proved for one provider/account cannot authorize reservation or reconciliation against another account merely because both satisfy the same logical capability key. Likewise, a reservation against one exact provider/account scope cannot be reconciled against another.

If implementation changes capability identity semantics to permit substitution across provider/accounts, DI-1 activates at that exact scope and must be adjudicated separately.

## 15. DI-2 — outbound payment reversal execution

DI-2 is relevant when a refund/cancel/void/reversal itself becomes an autonomous external mutation.

At that point the reversal must receive its **own** R8 execution identity and boundary truth. A reversal request cannot be treated as retroactive erasure of the original execution.

DI-2 is therefore dormant for generic R8, but activates in any future commercial-payment work that dispatches autonomous external reversals.

## 16. Reconciliation capability taxonomy — source-unresolved exactness

The adversarial source review recalls a confirmed reconciliation-capability taxonomy with the following candidate values:

- `RECONCILABLE_BY_RUN_ID`
- `RECONCILABLE_BY_RESOURCE_ID`
- `IDEMPOTENT_REPLAY_ENFORCED`
- `OBSERVABLE_BY_AUTHORITATIVE_STATE`
- `UNRECONCILABLE`

However, the reviewer explicitly did **not** certify the exact enum from source and requested direct source verification rather than memory-based promotion.

Therefore the taxonomy's existence is preserved as a recovery obligation, but these exact labels remain:

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD / NOT FROZEN AS NORMATIVE ENUM`

Implementation must not derive an enum from this candidate list until source or later governed adjudication establishes the exact contract.

## 17. Known migration surfaces recoverable from record

The available record confirms R8 migration scope includes, at minimum:

- the execution kernel / generic external-execution substrate;
- Builder and repair provider execution;
- QA provider execution;
- Controlled Release external provider/deployment execution;
- Asset remediation execution;
- repository provisioning or equivalent external mutation;
- other provider-backed consequential operations discovered by the semantic sibling audit.

Exact migration labels, numbering, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 18. Semantic sibling sweep

Search for semantic patterns including:

- provider call begins before durable execution/boundary-attempt identity exists;
- retry after local failure without authoritative non-dispatch/replay-safe proof;
- timeout/lease loss interpreted as provider failure;
- cancellation request treated as `CANCELLED`;
- missing callback treated as proof of no external effect;
- reservation released because a worker exited rather than because non-dispatch/settlement is authoritative;
- execution identity reconstructed from current job state after the provider call;
- provider-side IDs stored without exact local execution linkage;
- multiple provider calls reusing one execution identity;
- `RECONCILED_NOT_DISPATCHED` attempt reused for a later provider call;
- reconciled historical result overwritten by a later attempt;
- provider/account substitution during reconciliation;
- external uncertainty discarded during runtime replacement/handoff;
- reconciliation work exempted from R7 because it is urgent or safety-required.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 19. Acceptance semantics recoverable from source

At minimum, R8 closure must eventually prove:

- durable execution identity exists before provider dispatch;
- authoritative reconciliation of a previously uncertain exact attempt can terminate as `RECONCILED_NOT_DISPATCHED`;
- `RECONCILED_NOT_DISPATCHED` cannot be rewound/reused for a later provider call;
- authoritative proof of non-dispatch permits safe release where R7 conditions are otherwise satisfied;
- worker crash after possible dispatch does not auto-release or blindly retry;
- cancellation request and provider-confirmed cancellation remain distinct;
- missing callback leads to reconciliation, not guessed terminal state;
- replay-safe/idempotent retry preserves exact execution identity rules;
- unreconcilable post-boundary uncertainty escalates to `EXPOSURE_COMMITTED_UNRECONCILABLE`;
- a new provider call uses a new execution identity;
- provider/account reconciliation never silently substitutes accounts;
- R6/R7/R8 use one exact provider/account scope for capability proof, reservation, and reconciliation;
- R14 replacement preserves ownership of unresolved external executions;
- R15/R16 financial evidence remains attached to the exact R8 execution;
- recovery-burst reconciliation work remains subject to R7 aggregate resource admission.

The original fixture labels/order and complete numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 20. Start / local closure / E2E dependency result

### START

R8 contract/schema work may proceed from the confirmed root. R7 reservation semantics are an important interface dependency but R8's external-truth model is not merely a child of R7.

### LOCAL CLOSURE

R8 may locally close when exact execution identity, pre-boundary durable attempt state, provider identity/outcome persistence, `RECONCILED_NOT_DISPATCHED` semantics, reconciliation, retry/cancel semantics, legacy/uncertain-state handling, known migrations, audit children, and the sibling sweep are all complete.

R15/R16 need not be fully closed for R8's technical external-boundary truth to exist, but E2E financial-release certification remains pending without them where money/headroom depends on provider financial evidence.

R14 need not be closed for R8 local semantics, but replacement/handoff certification remains pending where unresolved external executions cross runtime ownership.

### E2E

Final certification must compose at least with R6/R7 provider-account scope consistency, R7 reservation/reconciliation burst handling, R14, R15, R16, and R20 where relevant.

## 21. Explicit non-goals

R8 must not:

- redefine R7 reservation authority;
- infer financial settlement from technical execution outcome;
- normalize R15 observations or perform R16 financial reconciliation;
- prove capability readiness, which is R6;
- define durable scheduling/liveness, which is R12/R13;
- define runtime replacement authority, which is R14;
- define generalized consequential boundary freshness, which is R20;
- treat cancellation intent as cancellation truth;
- treat local process failure as external failure;
- permit account substitution while reconciling historical execution truth;
- turn `RECONCILED_NOT_DISPATCHED` into a reusable pre-dispatch state;
- infer the unresolved reconciliation-capability taxonomy as a normative enum from memory.

## 22. Source gaps and assurance status

The following original R8 details are not yet recoverable from the available record and are not being invented:

1. exact migration child labels and ordinals;
2. exact audit name/classification vocabulary if separately frozen;
3. exact acceptance-fixture labels/order;
4. exact closure-evidence list;
5. exact rejected alternatives/amendment wording beyond the invariants preserved above;
6. any original worked examples/numeric scenarios not represented in the recoverable record;
7. exact reconciliation-capability taxonomy labels/semantics beyond the fact that such a taxonomy was recalled during adversarial source review but not source-certified.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R9, but it does not restore R8 implementation authority.

## 23. Adversarial source-review disposition

The first source-level adversarial review of the immutable recovered artifact classified findings as follows:

- **ACCEPTED:** merged root; core outcome semantics; pre-boundary identity ordering; R7 release seam; post-dispatch uncertainty; unreconcilable escalation; retry safety; cancellation distinction; R6 boundary; source-gap discipline; relay-contamination guard.
- **PARTIALLY ACCEPTED / AMENDED:** restore exact `RECONCILED_NOT_DISPATCHED` terminal semantics and explicit prohibition on reusing the historical execution record; restore R7×R8 reconciliation-burst compound.
- **UNRESOLVED / AMENDED WITH EXPLICIT GAP:** restore the R6×R7×R8 provider/account scope-consistency checkpoint; preserve the recalled reconciliation-capability taxonomy as non-normative and `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` pending exact source.
- **REJECTED:** none.

The artifact remains source-incomplete after these amendments because the unresolved historical details in §22 are still missing.

## 24. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
