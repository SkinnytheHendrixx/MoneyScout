# WI-R7 — Atomic Scarce-Resource Reservation Across All Aggregate Scopes

**Normalized node:** R7  
**Historical finding:** merged root spanning C1-F1 + C2-F2 + C2-F3 + C3-F1A  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS`  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

R7 recovery has begun from the confirmed adversarial-review record available in project context. The recoverable source is sufficient to preserve the normalized blocker root, aggregate-scope reservation semantics, reservation lifecycle, deterministic multi-scope ordering, commit-time authority atomicity, UNKNOWN/headroom behavior, subscription/entitlement treatment, R1/R2/R8/R15/R16/R20 compound boundaries, and the requirement that safety-required secondary work is still governed resource-consuming work.

However, R7 is a materially larger umbrella node than R1–R6. The exact original R7-M1 through R7-M13 migration matrix, the full five compound-certification sections, the exact Fund-precedence boundary, the authority-serialization fixture set, the mandatory audit name/classification vocabulary, and the complete numbered closure-evidence list are not presently recoverable from the accessible source without invention.

Under the fidelity-recovery rule, those details are not being regenerated from the compressed register or inferred from current code. This artifact is therefore intentionally **not** a full recovered candidate yet.

## 1. Frozen root and mission

R7 is the blocker-class remediation for the fact that scarce-resource checks were historically local and non-atomic rather than reserved across every governing aggregate scope before consequential autonomous work crossed into dispatch.

> **Core rule:** Every scarce resource consumed by consequential autonomous work must be atomically reserved across all applicable aggregate scopes before dispatch, remain reserved through uncertainty, and be released only from authoritative evidence that unused headroom is actually safe to return.

A local check against one Bet, provider, or entitlement is insufficient if Fund, portfolio, provider/account, shared-resource, stage, Asset, concurrency, or other aggregate ceilings can also be violated.

## 2. Canonical aggregate scopes

The confirmed R7 contract treats scarcity as multi-scope and first-class. Relevant reservation scopes include, where applicable:

- Fund;
- provider;
- provider/account;
- entitlement pool;
- portfolio;
- Bet;
- stage;
- Asset;
- shared organization/resource scopes;
- concurrency/vector limits.

The exact scope vector for an operation is derived from policy and execution context. Absence or ambiguity in one required scope must not be interpreted as permission to reserve only the scopes that are easy to identify.

## 3. Atomic multi-scope reservation

Reservation must be atomic across the full applicable scope vector.

The system must not:

- reserve Bet capacity first and discover Fund capacity is gone later;
- reserve provider quota without also reserving shared entitlement headroom when both govern the same call;
- allow two concurrent workers to each pass preflight against the same remaining headroom;
- treat separate local checks as equivalent to a single atomic authority decision.

Deterministic total ordering must be used for multi-scope locking/reservation to avoid deadlock and race-dependent authority.

> **Invariant:** either every required scope is reserved together, or none is.

## 4. Reservation lifecycle

The confirmed reservation state family is:

- `HELD`
- `COMMITTED` / `IN_FLIGHT`
- `PARTIALLY_CONSUMED`
- `SETTLED`
- `RELEASED`
- `UNCERTAIN`

Exact physical representation may vary, but the semantic distinctions may not collapse into a single reserved boolean.

`UNKNOWN` or uncertain resource exposure consumes headroom conservatively until authoritative reconciliation proves otherwise.

## 5. Economic Action / reservation / execution linkage

R7 requires atomic linkage between the consequential Economic Action (or equivalent authority record), its scarce-resource reservation, and the execution that may consume it.

The canonical safety path is:

`authority + allocation → atomic Economic Action/reservation/execution linkage → freshness validation → dispatch fencing → durable provider-boundary transition → external execution → authoritative reconciliation or unreconcilable exposure → incurred/settled normalization → release unused reservation`

Creating the action without the reservation, or the reservation without the exact execution linkage, leaves a race where work can exist without governed headroom or headroom can exist without a uniquely governed consumer.

## 6. Commit-time authority atomicity

Preflight may reject work before reservation. It may not create final execution authority merely by observing that headroom existed moments earlier.

The consequential authority decision must be serialized with reservation acquisition at the committing boundary.

> **Check-then-act is not reservation authority.**

A stale preflight success cannot authorize dispatch if another execution consumed the same headroom before this execution acquired its reservation.

## 7. UNKNOWN does not create headroom

If committed, consumed, provider-reported, entitlement, or shared-resource state is unknown or unreconciled, R7 must not infer that the corresponding capacity is available.

Additional headroom cannot increase merely because a committed ceiling has not yet been observed as consumed.

This composes directly with R1's typed resource-state semantics and R15/R16 financial observation/reconciliation truth.

## 8. Subscription and entitlement scarcity

Zero incremental cash cost does not mean unlimited execution authority.

Flat subscription seats, model plans, provider quotas, request caps, concurrency, build minutes, and other entitlements remain scarce if overuse can block other work, cause throttling, violate provider policy, or exhaust a shared allowance.

Such resources must be represented/reserved under the same atomic discipline as cash when they govern consequential work.

## 9. Stop / timeout / lease-loss release rule

A stop signal, process timeout, worker crash, lease loss, or local abandonment does not by itself prove unused reservation can be released.

Pre-dispatch abandonment may release only when durable execution evidence proves the external boundary was never crossed.

Post-dispatch uncertainty must not auto-release. R8 owns the external-boundary truth required to determine whether the execution was dispatched, succeeded, failed, or remains uncertain.

## 10. Historical $0.50 Kill-Risk example

The historical kill-risk path that checked a known small cost locally is still a real R7 migration even though the amount is small.

The issue is not whether $0.50 is economically material by itself. The defect is that `known cost <= ceiling` is not the same as `cost is atomically reserved across all governing aggregate scopes`.

> **Ceiling is not reservation.**

## 11. R1 × R2 × R7 compound

R1 defines what resource state means and prevents missing/unknown committed state from being treated as zero.

R2 preserves cost/operational uncertainty rather than erasing it through fallback/custom-build reasoning.

R7 consumes those truths to determine conservative reservation headroom.

> Correct reservation authority requires both correct resource attribution and preserved uncertainty.

R7 must not close by implementing a reservation engine whose inputs still collapse UNKNOWN into zero or whose fallback path removes unresolved cost.

## 12. R7 × R8 compound

R7 owns scarce-resource reservation authority and release eligibility.

R8 owns exact external-boundary truth and reconciliation.

R7 may release post-dispatch reservation only from R8-authoritative evidence establishing what actually happened. Local cancellation intent or worker failure is insufficient.

This includes the #77.5 rule that post-boundary nonreconcilable uncertainty escalates to `EXPOSURE_COMMITTED_UNRECONCILABLE` rather than silently releasing exposure.

## 13. R7 × R15 × R16 compound

R15 preserves provider-originating financial facts before normalization.

R16 deterministically reconciles those observations into canonical incurred/settled/adjusted/uncertain truth.

R7 consumes that canonical truth for reservation settlement and future headroom.

Provider financial ambiguity cannot be rejected before capture and then treated as evidence that reservation is free.

## 14. R7 × R20 boundary

A valid reservation is necessary resource authority, not sufficient consequential authority.

R20 revalidates all required predicates at the exact consequential boundary. A reservation cannot repair stale lineage, invalid capability binding, revoked lifecycle state, stale evidence, or superseded commercial authority.

Likewise, current non-resource predicates cannot authorize dispatch without R7 reservation where scarce resources are required.

## 15. Safety-required secondary work is still governed work

Independent review, capability verification, reconciliation, remediation, retries, and other safety-required secondary executions do not become resource-free merely because they exist to make the system safer.

If they consume scarce cash, provider quota, entitlement, concurrency, or shared capacity, they must reserve through R7.

Burst conditions after outage/recovery are explicitly in scope because many individually legitimate safety tasks can collectively exceed aggregate limits.

## 16. Fund precedence boundary recoverable from source

R7 operates under the canonical Fund authority hierarchy rather than inventing local capital arithmetic.

The governing precedence is:

`Master Mode → Category Policy → Scoped Override → Fund Authority → Bet Authority → Atomic Reservation`

Canonical `deployable_capital` remains the sole authoritative deployable-capital quantity. A local workflow may not recompute or override it to create spend authority.

Forecasts, expected releases, or uncommitted future revenue do not authorize reservation.

The exact original R7 wording and full Fund-precedence fixture set remain part of the source gap below.

## 17. Design Inputs

Design Input registry reviewed through DI-2.

### DI-1 — Capability identity under multi-provider/multi-account execution

R7 itself does not generically consume DI-1 merely because provider/account scopes can appear in a resource vector. If simultaneous provider/account/Asset identity substitution becomes part of a concrete reservation scope, the affected child must evaluate DI-1 explicitly.

### DI-2 — Outbound Payment Reversal Execution

R7 reservation semantics do not themselves execute reversals. Any future reversal execution consumes R7 as a scarce-resource/authority prerequisite but activates DI-2 in the reversal work item, not generically in R7.

## 18. Confirmed acceptance semantics recoverable from source

- Two concurrent executions competing for the same last unit of Fund/provider/entitlement headroom cannot both succeed.
- A reservation vector either acquires every required scope atomically or acquires none.
- UNKNOWN committed/consumed/shared state reduces or freezes headroom rather than increasing it.
- A subscription/entitlement with zero incremental cash can still block because its scarce allowance is exhausted.
- Timeout/lease loss before proven non-dispatch does not automatically release exposure.
- Proven pre-dispatch abandonment may release.
- Post-dispatch uncertainty remains reserved until R8/R15/R16 authoritative truth supports settlement/release.
- A local ceiling check does not substitute for reservation.
- Safety-review/verifier/reconciliation bursts remain bounded by aggregate resource authority.
- Valid reservation alone does not authorize a consequential boundary whose other R20 predicates fail.

## 19. Source gap blocking full reconstruction

The following exact original R7 content remains unrecovered and blocks promotion to `RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION`:

1. the literal R7-M1 through R7-M13 migration labels and exact surface assignments;
2. the exact mandatory R7 audit name, classification vocabulary, and discovered-child numbering convention;
3. the complete five compound-certification sections in their original confirmed wording;
4. the exact Fund-precedence boundary section and every frozen arithmetic/authority example associated with it;
5. the full authority-serialization/concurrency fixture set;
6. the complete original acceptance-fixture enumeration and ordering;
7. the complete numbered closure-evidence list;
8. any explicit amendments/rejected alternatives not represented in the recoverable source above.

These details must be recovered from the original WI-R7 adversarial-confirmation record rather than regenerated from the compressed v1.0 register or current code.

## 20. Recovery gate

R7 remains `FIDELITY_SOURCE_INCOMPLETE` until §19 is closed.

Until then:

- do not call this the full R7 contract;
- do not derive implementation batches from this partial artifact;
- do not advance the serialized queue to R8 recovery;
- preserve all source gaps as explicit recovery obligations;
- run the relay-contamination scan before any future complete-candidate commit.

> **For R7, plausible compression is especially dangerous: the umbrella primitive may exist while individual migration surfaces, aggregate-scope rules, and compound certifications remain incomplete. Primitive existence is not closure.**
