# Money Scout — Freeze Candidate — Corrections 2

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL FREEZE  
**Applies to:** `GLOBAL_REMEDIATION_REGISTER_FREEZE_CANDIDATE_NORMALIZED_REVIEW_DRAFT.md`  
**Implementation authority:** SUSPENDED  
**Remediation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the next adversarial structural review of the normalized freeze candidate.

Accepted changes:

1. add FR-09: deterministic global ordering for acquisition of multiple shared-root mutation leases;
2. make multi-root lease acquisition all-or-nothing before mutation;
3. add a sharper incorporation/supersession test based on whether integration changes the shape of the closure test itself or merely adds a prerequisite/timing condition;
4. preserve PAIM contention/rederive livelock as a non-blocking operational concern rather than a freeze blocker.

No phase denominator changes. No finding is added, merged, removed, or reclassified.

## 2. FR-09 — multi-root lease acquisition lacks a canonical total order

**Severity:** BLOCKER before this correction.

### Failure mode

The freeze candidate requires writer leases for every shared root touched by an amendment, but did not require a deterministic acquisition order when a node needs more than one root.

Current known example:

- `IC-G2-01` can require both `ROOT-2 capabilities` and `ROOT-3 commercial-payment provider/config family`.

With one known multi-root node, a lock-order deadlock cannot currently be produced by two competing nodes. That is accidental topology, not a structural safety guarantee.

If PAIM-C later discovers another node requiring overlapping roots in a different order, classic lock-order deadlock becomes possible.

### Required invariant

Define one canonical total order over **all known and future shared physical/config roots**.

Every amendment-bearing node requiring multiple writer leases MUST acquire them strictly in that order.

The canonical comparison key is:

`shared_root_order_key = stable_root_namespace + ":" + stable_root_id`

and acquisition order is ascending lexical order of that immutable key unless a later canonical register revision explicitly replaces the ordering function globally.

Current roots therefore receive stable IDs/order keys, for example:

- `ROOT-1:commercial_activations`
- `ROOT-2:capabilities`
- `ROOT-3:commercial_payment_provider_config`

A newly discovered root must receive a stable root ID/order key before any node may obtain a mutation lease on it.

### Multi-root acquisition protocol

For a node whose PAIM-C produces root set `R = {r1...rn}`:

1. deduplicate the set;
2. sort by canonical `shared_root_order_key`;
3. attempt acquisition only in that exact order;
4. no mutation may begin until **all** required writer leases are held;
5. if any lease cannot be acquired, release every lease acquired during that attempt and return to `BLOCKED_PENDING_SHARED_ROOT_LEASES`;
6. partial acquisition never grants `MAY_LAND`;
7. retries must recompute/revalidate the PAIM pins and the canonical root set before reacquisition if any dependency/root revision changed;
8. release after stable commit or verified rollback may occur in reverse order for operational convenience, but release order is not a semantic dependency.

### No lock upgrade

A node may not land while holding only stable-read eligibility and then upgrade a root to writer status after mutation has begun.

All writer roots required by the frozen PAIM must be known and acquired before `MAY_LAND`.

If amendment execution discovers an unanticipated root mutation requirement after landing begins:

- stop before mutating that root;
- fail the landing attempt closed;
- rollback under FR-08 where necessary;
- expand PAIM-C;
- refreeze/revalidate;
- reacquire the full ordered root set.

### Effect on lifecycle

The pre-land lifecycle requirement becomes:

`PAIM-C COMPLETE`
→ `ROOT SET CANONICALIZED + ORDERED`
→ `ALL REQUIRED SHARED_ROOT_MUTATION_LEASES_ACQUIRED`
→ `PAIM_PIN_REVALIDATION PASS`
→ `CYCLE/DEADLOCK CHECK PASS`
→ `MAY_LAND`.

`MAY_LAND` is false while the node holds only a strict subset of its required writer leases.

### Safety result

This removes circular wait among correctly participating amendment nodes because every multi-root writer acquires resources under one global order and cannot retain a partial set while indefinitely waiting under a conflicting order.

FR-09 does not promise fairness or absence of starvation. Those are liveness concerns.

## 3. PAIM contention / rederive livelock remains non-blocking

Repeated overlapping amendments may theoretically cause:

`PAIM_STALE → REDERIVE → REFREEZE → PAIM_STALE`

under sustained contention.

This does not violate authority correctness because stale PAIMs remain unable to land.

Therefore it remains a noted operational/liveness concern, not a freeze blocker.

A later executor may introduce priority/backoff/queueing without weakening the safety rules above.

## 4. Supersession methodology clarification

The incorporation taxonomy remains:

- `INCORPORATED`
- `INCORPORATED_WITH_CONDITIONAL_CLOSURE_ADDITION`
- `SUPERSEDED_BY_INTEGRATION`

Apply the following primary test.

### 4.1 `SUPERSEDED_BY_INTEGRATION`

Use when integration changes the **shape of the closure test itself** such that satisfying the older closure predicate is no longer sufficient to establish the same proposition.

Typical signal:

- old form: one owner/test can close the proposition;
- integrated form: a structurally different multi-owner/joint-sign-off or expanded predicate is mandatory for that same proposition.

Confirmed example:

The six mechanical Phase-I NAME rows are superseded because the older naming-only closure allowed the NAME owner to close after historical recovery or governed replacement, while integration requires `NAME OWNER + REPRESENTATION/GOVERNANCE OWNER JOINT SIGN-OFF`. That is a different closure proposition, not merely the same test delayed by another prerequisite.

### 4.2 `INCORPORATED_WITH_CONDITIONAL_CLOSURE_ADDITION`

Use when the original closure proposition/test remains valid, but a chosen remediation strategy or conditional factual state adds another acceptance requirement.

Example:

RET-R17/RET-R19 remain the same historical-addressability propositions, while choosing to physically split legacy shared history activates the pinned-source triangulated split-reconciliation fixture.

### 4.3 `INCORPORATED`

Use when the prior row's own closure predicate remains sufficient for that row and integration adds only downstream consumers, invalidation scope, concurrency controls, or higher-level certification bundles.

### 4.4 Timing/prerequisite rule

A newly discovered prerequisite does **not** by itself imply supersession if:

- the original test remains unchanged;
- the prerequisite only controls when that test may be finalized or which semantic input must stabilize first.

Confirmed contrast:

F02-01 keeps its original Boundary Decision representation predicate. `RD-C-R5-R20` blocks only the R5-dependent slice from finalization; it does not replace F02-01 with a structurally different closure test.

## 5. FR-09 normalized row/schema consequences

The canonical normalized object/control schema gains these mandatory fields for any object that can mutate physical/config roots:

- `required_writer_root_ids[]`
- `required_writer_root_order_keys[]`
- `root_ordering_revision`
- `multi_root_acquisition_state`
- `partially_acquired_root_ids[]`
- `all_required_writer_leases_acquired`

Allowed `multi_root_acquisition_state` values:

- `NOT_APPLICABLE`
- `NOT_STARTED`
- `ACQUIRING_IN_CANONICAL_ORDER`
- `BLOCKED_PENDING_SHARED_ROOT_LEASES`
- `ALL_REQUIRED_LEASES_ACQUIRED`
- `RELEASED_AFTER_STABLE_COMMIT`
- `RELEASED_AFTER_VERIFIED_ROLLBACK`

`partially_acquired_root_ids[]` is operational evidence only. A non-empty partial set never permits `MAY_LAND`.

## 6. Freeze blocker accounting

The structural blocker series is now:

- FR-01 lifecycle ordering;
- FR-02 landing/invalidation atomicity;
- FR-03 pre-land root lease acquisition;
- FR-04 PAIM/revision pinning;
- FR-05 candidate-edge trust states;
- FR-06 normalized row schema;
- FR-07 exhaustive incorporation/supersession assignment;
- FR-08 atomic failed-POST-BCT restoration;
- FR-09 canonical total ordering + all-or-nothing multi-root lease acquisition.

This overlay supplies the required FR-09 control and supersession methodology clarification. Freeze still requires adversarial verification that the normalized candidate plus accepted overlays actually instantiate FR-01 through FR-09 without contradiction.

## 7. Disposition

`FREEZE-CANDIDATE CORRECTIONS 2 / FR-09 ADDED / ALL MULTI-ROOT WRITER LEASES ACQUIRED UNDER ONE CANONICAL TOTAL ORDER AND ALL-OR-NOTHING BEFORE MAY_LAND / NO LOCK UPGRADE AFTER LANDING BEGINS / SIX MECHANICAL PHASE-I SUPERSESSIONS CONFIRMED BY CLOSURE-TEST-SHAPE RULE / CONDITIONAL-ADDITION DISTINGUISHED FROM SUPERSESSION / PAIM CONTENTION Livelock REMAINS NON-BLOCKING / DENOMINATORS UNCHANGED / IMPLEMENTATION AND REMEDIATION AUTHORITY REMAIN SUSPENDED`