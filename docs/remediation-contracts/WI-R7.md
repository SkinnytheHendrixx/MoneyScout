# WI-R7 — Atomic Scarce-Resource Reservation Across All Aggregate Scopes

**Normalized node:** R7  
**Historical finding:** merged root spanning C1-F1 + C2-F2 + C2-F3 + C3-F1A  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

R7 has been recovered from the available adversarial-confirmation record through four controlled source chunks plus a dedicated reconciliation pass. The recoverable source is sufficient to preserve the normalized blocker root, aggregate-scope reservation semantics, reservation lifecycle, deterministic multi-scope ordering, commit-time authority serialization, UNKNOWN/headroom behavior, subscription/entitlement treatment, known migration surfaces, R7-A1 audit semantics, Fund precedence, acceptance fixtures A–O, DI guards, and the principal compound boundaries.

A final narrow recovery pass was then performed specifically for three unresolved details. Those details could not be recovered from the available record with the precision required by this fidelity process. They are therefore marked `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` rather than guessed.

This status means R7 recovery is no longer blocked on repeated source search, but R7 is **not** `FIDELITY_VERIFIED` in the same sense as R1–R6 and remains **non-implementation authority** pending the corrected global remediation-register/governance pass.

Durable reconciliation record: `docs/remediation-contracts/WI-R7-RECOVERY-RECONCILIATION.md`.

## 1. Frozen root and mission

R7 is the blocker-class remediation for the fact that scarce-resource checks were historically local and non-atomic rather than reserved across every governing aggregate scope before consequential autonomous work crossed into dispatch.

> **Mission:** R7 exists to ensure that every scarce resource consumed by consequential autonomous work is reserved atomically against the correct aggregate scopes before dispatch, remains accounted for through execution uncertainty, and is released only on authoritative evidence that the reserved exposure is no longer needed.

> **Core rule:** Every scarce resource consumed by consequential autonomous work must be atomically reserved across all applicable aggregate scopes before dispatch, remain reserved through uncertainty, and be released only from authoritative evidence that unused headroom is actually safe to return.

The key distinction is:

`allocation/budget ≠ reservation ≠ consumption`.

A local check against one Bet, provider, Release Job, or entitlement is insufficient if Fund, portfolio, provider/account, shared-resource, stage, Asset, concurrency, or other aggregate ceilings can also be violated.

## 2. Canonical aggregate scopes and resource identity

A reservation is meaningful only when it identifies the exact resource pool being committed.

Relevant scopes include, where applicable:

- Fund;
- source authority;
- portfolio;
- Bet;
- stage;
- provider;
- provider account;
- entitlement pool;
- Asset;
- shared organization/resource scopes;
- concurrency/vector limits;
- specific external service/resource pools.

Canonical pool identity must be compatible with R1 typed resource semantics and preserve resource class, unit, scope type/identity, provider/account where applicable, and owner/Fund/Bet/Asset lineage.

One action may consume multiple resources simultaneously. The reservation succeeds only if every required effect can be reserved atomically.

## 3. Canonical failure mode: aggregate overcommit

R7 is not merely a "budget exceeded" fix.

Canonical race:

Bet/provider pool = 100 units. Worker A reads 100 available and intends 70. Worker B concurrently reads 100 available and intends 70. Both local checks pass. Both dispatch. Aggregate commitment becomes 140.

Every local workflow was individually within its own stated ceiling. The system was still unsafe.

> **An arithmetic check followed by a later write is not resource authority. Reservation must be atomic across every aggregate scope that can be violated by concurrent admission.**

## 4. R1 and R2 semantic prerequisites

R1 answers: what resource is this operation actually committing or consuming?

R7 answers: may this operation exclusively reserve that resource now?

R7 must not reinterpret R1 resource meanings to make admission easier.

> **R1 is non-authoritative for reservation. R7 is non-authoritative for redefining resource truth.**

R2 preserves economic/capability exposure truth such as `KNOWN_ZERO`, `KNOWN_POSITIVE`, and `UNKNOWN`.

R7 consumes that truth:

- `KNOWN_ZERO` may still require non-cash entitlement reservation;
- `KNOWN_POSITIVE` requires the applicable cash/resource reservation;
- `UNKNOWN` cannot silently become zero reservation.

Where policy requires a bounded exposure and no safe bound can be established, the operation fails closed or challenges upstream.

## 5. Atomic multi-resource acquisition

Frozen sequence:

1. derive the complete reservation request;
2. normalize deterministic total lock order;
3. acquire/check every governing aggregate scope inside one transaction or equivalent serializable authority boundary;
4. create the Economic Action;
5. create all required reservations;
6. link exact execution identity;
7. commit together;
8. only then make dispatch eligible.

The system must not reserve resource A, fail resource B, and leave A stranded. It must not check A and B outside the serialization boundary and later assume those reads remain authoritative.

> **Invariant:** either every required scope is reserved together, or none is.

## 6. Reservation lifecycle

Required semantic states include:

- `HELD`
- `COMMITTED` / `IN_FLIGHT`
- `PARTIALLY_CONSUMED`
- `SETTLED`
- `RELEASED`
- `UNCERTAIN`

Exact physical representation may vary, but the semantic distinctions may not collapse into a single reserved boolean.

Two frozen rules:

> **UNCERTAIN exposure continues to consume headroom.**

> **A reservation is never released merely because a local worker stopped, timed out, lost a lease, or reported an error.**

Pre-dispatch abandonment may release only from durable proof that the external boundary was never crossed. Post-dispatch uncertainty composes with R8.

## 7. Economic Action / reservation / execution linkage

R7 requires atomic linkage between the consequential Economic Action or equivalent authority record, its scarce-resource reservation set, and the exact execution attempt that may consume it.

Canonical safety path:

`authority + allocation → atomic Economic Action/reservation/execution linkage → freshness validation → dispatch fencing → durable provider-boundary transition → external execution → authoritative reconciliation or unreconcilable exposure → incurred/settled normalization → release unused reservation`

Creating an action without the reservation, or the reservation without exact execution linkage, leaves an authority race.

## 8. Conservative reservation amount

Reserve against the maximum authorized exposure applicable to the exact operation, not expected average cost.

Where a provider exposes a hard enforceable per-call maximum, that bound drives reservation. Where only empirical distributions may later exist, future learning such as #82 may improve conservative bounds.

Until then:

> **Uncertainty may reduce deployable headroom; it may not create optimistic headroom.**

For flat entitlement, reserve the relevant scarce unit/count/concurrency capacity. Truly non-scarce, locally proven zero-resource operations do not need artificial reservations.

## 9. Allocation is not reservation

A Bet allocation, Release ceiling, Asset operating ceiling, or local workflow budget may remain useful as policy/allocation.

It is not final dispatch authority.

Flow:

allocation permits up to X → exact action requests reservation → R7 checks all governing scopes atomically → exact execution receives reservation linkage → dispatch eligibility may exist.

> **A local ceiling limits what may be requested. R7 decides whether the request may be committed now.**

## 10. Zero incremental cash does not mean zero scarce resource

Provider billing/resource classes must distinguish:

- pay-as-you-go cash exposure;
- flat/subscription entitlement consumption;
- truly non-scarce zero-cost fixture/internal operation.

A subscription-backed Builder/QA/Release action with zero marginal charge may still consume entitlement units, request quota, concurrency slots, monthly build units, or other scarce shared capacity.

Such resources remain R7-governed.

## 11. Commit-time authority-state serialization

> **Every Fund, source-authority, Master Mode, allocation, and aggregate-resource fact required to grant a reservation must be read or transactionally fenced inside the same serialization boundary that commits the reservation. A preflight authority check may reject early, but it may never serve as the authoritative commit-time check.**

Cheap prechecks are allowed only to avoid pointless work. They grant nothing.

Forbidden outcome:

read Fund/Master state → state changes → later transaction reserves resources using stale authority.

Required concurrency fixture: mutate `deployable_capital` and Master Mode `RUN → PAUSE` while reservation acquisition is in flight. The reservation transaction must serialize correctly against those changes or fail. It must never commit against stale reads.

> **R7's transaction is not atomic merely because resource-row updates are atomic. The authority facts that make those updates legal must participate in the same serialization boundary.**

## 12. Fund authority boundary

R7 consumes the frozen precedence:

`Master Mode → Category Policy → Scoped Override → Fund Authority → Bet Authority → Atomic Reservation`

Atomic reservation is deliberately last.

Canonical:

`deployable_capital = Authorized Fund Capital − Reversal Risk Reserve − Unavoidable Obligations − Reserved/Committed Exposure − Fund Deficit`

R7 consumes canonical Fund/resource truth. It may not create a second local `deployable_capital` formula.

Fund authority cannot bypass R7, and R7 reservation cannot create upstream Fund/source authority.

## 13. Known affected surfaces

Confirmed containment/migration surfaces include:

- `artifacts/api-server/src/lib/bet-kernel.ts`
- Bet/resource persistence
- `artifacts/api-server/src/lib/builder-gateway.ts`
- `artifacts/api-server/src/lib/builder-provider-driver.ts`
- `artifacts/api-server/src/lib/controlled-release-worker.ts`
- `artifacts/api-server/src/lib/controlled-release-safety.ts`
- `lib/db/src/schema/release.ts`
- `artifacts/api-server/src/lib/asset-remediation-worker.ts`
- `artifacts/api-server/src/lib/execution-kernel.ts`
- Autonomous Resolution paid/scarce execution
- Kill-Risk collector
- Research/Validation/Resolution paid/scarce execution discovered through R7-A1
- QA/repair provider execution
- subscription/entitlement-backed execution

The historical Builder gate `atomicReservationAvailable: false` is containment evidence that the missing primitive was already recognized.

## 14. Known migration content and ordinal source gap

The available record supports these named known migration children:

- canonical Economic Action identity;
- canonical resource-pool identity;
- atomic reservation transaction;
- reservation lifecycle/accounting;
- Builder Gateway;
- Builder entitlement;
- QA/repair provider execution;
- Controlled Release preview;
- Controlled Release production;
- Asset Remediation Builder/QA/Release;
- Kill-Risk collector;
- research/validation/resolution resource admission;
- reservation-aware execution queue/admission;
- legacy in-flight/local-budget state.

The amendment history strongly suggests Kill-Risk was inserted as a dedicated child and later numbering shifted, yielding an M1–M14 matrix and audit children beginning at M15+.

However, the exact insertion ordinal/final numbered sequence is:

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

Therefore this artifact does **not** freeze the final migration ordinals.

**Non-regression:** Kill-Risk is known named migration scope, not an audit-discovery child, regardless of ordinal.

Its invariant remains:

> **$0.50 ceiling ≠ $0.50 reserved.**

## 15. R7-A1 — Scarce Resource Admission Audit

Inventory every autonomous operation capable of consuming:

- cash;
- provider entitlement;
- subscription credits;
- external requests with quota;
- concurrency;
- shared model/API capacity;
- externally billed searches;
- build/QA/repair execution;
- deployment/release calls;
- Asset-operation provider work;
- safety-required review/verification/reconciliation work.

At minimum inspect Research, Validation, Autonomous Resolution, experiments, Builder, repair, QA, Release preview, Release production, Asset remediation, telemetry, R5 confirmation, R6 automated verification, WATCH/revalidation work, and commercial/payment operations when implemented.

Classifications:

- `NON_SCARCE_PROVEN`
- `ALREADY_R7_ADMITTED`
- `R7_DEFECT_DISCOVERED`
- `RESOURCE_SEMANTICS_UNKNOWN`
- `NOT_CONSEQUENTIAL_RESOURCE_USE`

R7-A1 is audit-only. It does not repair what it finds.

Every `R7_DEFECT_DISCOVERED` becomes a durable numbered migration child. The exact first open ordinal is not recoverable from the available record and must be assigned only after ordinal reconciliation in the corrected canonical implementation register.

Every `RESOURCE_SEMANTICS_UNKNOWN` must be adjudicated before the affected operation can claim reservation-free execution.

`AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED`.

## 16. Compound certifications

### R1 × R7 — semantic truth plus exclusive admission

Two Bets share one resource pool. Both are individually within their allocations but jointly exceed the shared pool. One obtains a valid reservation; the other atomically blocks. Aggregate committed exposure never exceeds the ceiling.

### R7 × R8 — reservation lifecycle plus external-boundary truth

> **R7 may release pre-dispatch reservation only from durable proof the external boundary was never crossed. After possible dispatch, R8 reconciliation governs whether and how reservation exposure may settle/release.**

Local process failure is not release evidence.

### R6 × R7

Verified capability ≠ reserved entitlement. Valid reservation ≠ verified capability. Both must hold.

### R3 multi-Opportunity freshness burst consuming R7

A wave of legitimate revalidation work after recovery does not bypass aggregate reservation merely because every trigger is correct.

### R5 confirmation burst consuming R7

Independent-review necessity creates no review-resource authority.

### R6 verification burst consuming R7

Automated safety verification can consume scarce resources and remains R7-governed.

### R12 × R13 × R7 outage-recovery burst

Durable obligations accumulate while execution is unavailable → recovery makes many jobs runnable → R12/R13 restore liveness → R7 prevents the recovery wave from overcommitting shared resources.

### R7 × R20

R7 owns reservation. R20 owns whether a later consequential boundary may still consume/use that reservation under current authority, evidence, capability, lifecycle, lineage, and other predicates.

R20 invalidation after a provider boundary cannot erase already-reserved/incurred exposure.

### R7 × R4

R7 reserves against the exact Bet/action/resource identity supplied. R4 owns immutable evaluation lineage and lineage eligibility. A valid reservation never repairs or refreshes stale lineage. Economic Action/reservation identity must preserve enough exact Bet/evaluation-lineage reference for downstream R20 authority checks.

### R7 × R15 × R16

Confirmed governing principle:

> **Reservation safety without durable provider-originating incurred-cost evidence and order-independent canonical reconciliation is incomplete safety. Reserved exposure, external execution truth, and financial observation/reconciliation must compose before headroom can move safely.**

The exact original worked-scenario wording is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` and must not be regenerated from later R15/R16 contracts as if it were recovered R7 source.

## 17. Vocabulary compatibility checkpoints

**R1 ↔ R7:** `resource`, `unit`, `committed`, `consumed`, `available to commit`, `allocation`, `provenance`.

**R2 ↔ R7:** `KNOWN_ZERO`, `KNOWN_POSITIVE`, `UNKNOWN`, `external exposure`, `entitlement exposure`.

**R6 ↔ R7:** `AUTOMATION_READY` remains distinct from `RESOURCE_RESERVED`.

**R7 ↔ R8:** `PRE_DISPATCH`, `BOUNDARY_CROSSED`, `OUTCOME_UNKNOWN`, `RECONCILED`, `safe release`.

**R7 ↔ R20:** `reservation validity`, `authority validity`, `consumption`, `adoption`, `revocation after boundary`.

No downstream node may reconstruct reservation meaning from local workflow fields.

## 18. Parallel-not-merged boundaries

- **R7 vs R1:** resource truth vs reservation authority.
- **R7 vs R2:** uncertainty truth vs reservation/admission.
- **R7 vs R6:** capability proof vs resource capacity.
- **R7 vs R8:** exclusive resource commitment vs external execution truth.
- **R7 vs R12/R13:** resource admission vs durable scheduling/liveness.
- **R7 vs R20:** resource reservation vs generalized consequential freshness fencing.
- **R7 vs Fund authority:** Fund says what capital is deployable under canonical precedence. R7 reserves from that authorized state; it does not locally recompute it.
- **R7 vs R4:** exact resource admission vs exact evaluation lineage/lineage eligibility.

## 19. Acceptance fixtures

**A. Atomic single-pool race.** Pool 100. Action A requests 70; Action B requests 70 concurrently. Only one may reserve 70. No transient committed total above 100.

**B. Multi-pool atomicity.** Action needs 50 Bet cash + 1 provider entitlement + 1 concurrency slot. Concurrency unavailable. Entire reservation fails; no other resource is stranded.

**C. Deterministic lock order.** Competing actions request the same pools in opposite logical orders. Canonical lock order prevents deadlock/order-dependent admission.

**D. Zero-cash entitlement.** Subscription has 10 build units, cash cost zero. With ten reserved, the eleventh blocks.

**E. Paygo fallback.** Entitlement exhausted but provider can fall back to paygo. No fallback unless exact cash reservation/authority separately exists.

**F. Release local ceiling.** Release ceiling $100, aggregate shared headroom only $20. Release asks $80. R7 blocks despite local Release arithmetic.

**G. Builder containment migration.** Exact qualifying reservation can make real Builder dispatch eligible. No reservation leaves the existing block intact.

**H. Asset Remediation subscription case.** Zero incremental cash but scarce subscription use still reserves entitlement before consequential calls.

**I. Reservation release before boundary.** `HELD` reservation may release only with durable proof boundary never crossed.

**J. Uncertain post-boundary outcome.** Provider boundary may have crossed and local worker dies. Exposure remains held/uncertain.

**K. Partial consumption.** Reserve 100, authoritative settlement 40. Forty consumed; unused sixty releases only after authoritative settlement.

**L. Recovery burst.** N queued safety/research/verification jobs awaken after outage; shared pool admits only K < N. Only K dispatch.

**M. R1 compatibility.** R7 consumes typed resource effects and never derives cost/resource class from superficial field shape such as "contains cents."

**N. R2 UNKNOWN.** Bounded reservation required but external exposure unknown. No zero reservation; fail closed/challenge upstream.

**O. Authority-state serialization.** `deployable_capital` and Master Mode mutate while reservation acquisition is in flight. Reservation either serializes against the changes or fails; never commits against stale authority.

## 20. Start dependencies

R7 contract/schema design may start independently.

Hard implementation prerequisite for canonical accounting integration: R1 interface must be sufficiently frozen that R7 is not forced to reinterpret broken resource semantics.

R2 may proceed in parallel. Where R7 consumes Architecture-derived UNKNOWN/known-zero resource truth, the R2 compatibility seam must pass before those admission paths freeze.

The already-frozen #77.5 architecture is normative input, not a redesign dependency.

## 21. Local closure dependencies

R7 cannot locally close until:

- R1 resource semantics are implementation-compatible;
- Economic Action/reservation/execution linkage exists;
- aggregate scope identity exists;
- deterministic lock ordering exists;
- atomic all-resource reservation passes concurrency tests;
- entitlement/subscription resources are first-class;
- every known migration surface is implemented regardless of unresolved historic ordinal;
- R7-A1 completes;
- every discovered audit defect closes through durable migration work;
- legacy/in-flight state treatment exists;
- final semantic sibling sweep returns empty.

R8 does not need to be CLOSED for the atomic reservation primitive to locally close. R7 cannot claim safe post-dispatch release without R8-compatible provider-boundary truth.

## 22. Semantic sibling sweep

Search for:

- `ceiling - used` as final dispatch authority;
- check-then-dispatch without reservation;
- Bet remaining balance treated as exclusive headroom;
- "zero cash" treated as "no resource";
- subscription/entitlement execution without reservation;
- per-provider quota checked outside atomic admission;
- resource checked before queueing but not reserved for eventual dispatch;
- reservation created after provider call begins;
- partial multi-resource reservations;
- worker failure releasing resource without provider-boundary proof;
- local DB budget used as protection against provider-enforced spend;
- paygo fallback after entitlement failure;
- review/verification/remediation exempted because "safety work."

Every genuine sibling becomes durable migration work. Repeat until a complete repository-wide semantic pass returns empty.

> **Primitive existence never proves closure. Every named migration must pass, then the sibling sweep must independently find no remaining instance.**

## 23. Explicit non-goals

R7 must not:

- redefine R1 resource semantics;
- resolve R2 economic uncertainty;
- prove capabilities, which is R6;
- determine provider-boundary truth, which is R8;
- implement retry/reconciliation semantics belonging to R8;
- implement durable scheduling/liveness, which is R12/R13;
- implement R20 generalized authority freshness;
- locally derive Fund `deployable_capital`;
- treat all local CPU/database operations as scarce;
- inflate C3-F1B telemetry to BLOCKER without evidence;
- infer "subscription" means unlimited;
- authorize paygo fallback because entitlement is exhausted;
- release uncertain post-boundary reservations merely to improve displayed headroom.

## 24. Design Inputs

Design Input registry reviewed through DI-2.

### DI-1 — Capability identity under multi-provider/multi-account execution

Reviewed: YES. Current status: DORMANT. Activation crossed by R7's present single-scope implementation: NO, provided R7 does not introduce simultaneous provider/account capability substitution.

Adding provider/account scope to Resource Pool identity does not by itself consume DI-1.

**Schema-entanglement guard:** if R7 Resource Pool identity and R6 Capability identity share tables, foreign keys, generic identity types, uniqueness constraints, lookup helpers, or resolution indexes, that shared schema surface requires explicit DI-1 review. The review must prove provider/account-scoped resource identity cannot cause capability lookup to treat one provider/account as substitutable for another merely because they share a resource or logical capability key.

DI-1 activation is determined by semantics enabled by the schema/resolution path, not merely by whether the current reservation algorithm uses substitution.

### DI-2 — Outbound Payment Reversal Execution

Reviewed: YES. Status: DORMANT. Activation crossed: NO. R7 generic reservation does not itself create refund/cancel/void/reversal execution.

## 25. Closure-evidence source gap

The available record confirms that the original R7 contract contained a **29-item numbered closure-evidence list**.

The exact item-by-item text, ordering, and any child-number references are:

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

This artifact must not manufacture a new 29-item list and call it the recovered original.

Any future R7 implementation closure will need a newly constructed executable closure checklist derived from the recovered semantic obligations and independently reviewed as **new implementation governance**, not misrepresented as historical source recovery.

## 26. Dependency result

Core semantic chain: **R1 → R7**, with **R2 → R7** where Architecture/resource uncertainty affects the reservation vector.

Execution-safety seam: **R7 + R8** → reserved exposure + truthful external outcome.

Capability seam: **R6 + R7** → proven usable capability + reserved resource.

Recovery certification: **R12 + R13 + R7** → durable recovery without a resource stampede.

Later authority seam: **R7 + R20** → valid reservation + still-valid consequential authority.

> **Allocation says how much may be requested. Capability says whether the action can be performed. R7 alone says whether this exact scarce resource may be committed to this exact action now.**

## 27. Recovery/fidelity disposition

R7 recovery is complete to the limit of the available record.

The following remain source gaps rather than open search tasks:

1. final historical migration ordinals and first audit-discovered child ordinal;
2. exact worked wording of the R7×R15×R16 compound scenario;
3. exact original 29-item closure-evidence list.

Each is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

Therefore:

- R7 is not `FIDELITY_VERIFIED` in the same sense as R1–R6;
- R7 remains non-implementation authority pending corrected global register/governance adjudication;
- recovery does **not** continue by repeatedly querying the same unavailable source;
- the serialized recovery queue may proceed to R8;
- stronger original source discovered later may amend these exact gaps without silently rewriting already recovered semantics.

## 28. Relay-contamination guard

Before any future R7 rewrite/promotion, strip conversational handoff text and confirm the artifact terminates at its intended normative/fidelity section.

> **For R7, plausible compression is especially dangerous: the umbrella primitive may exist while individual migration surfaces, aggregate-scope rules, and compound certifications remain incomplete. Primitive existence is not closure.**
