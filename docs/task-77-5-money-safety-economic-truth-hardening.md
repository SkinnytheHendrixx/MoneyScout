# Milestone #77.5 — Money Safety & Economic Truth Hardening

## Status

DESIGN / PRE-IMPLEMENTATION. This milestone must not be treated as implemented until merged, tested, and verified after #77.

## Purpose

Make every monetary side effect and every economic fact in Money Scout trustworthy enough for #78 Live Asset Decision Engine to consume.

#77.5 is a retrofit milestone. Earlier milestones established useful primitives, but the final system-wide money-safety audit exposed gaps in authority, reservation, provider spend containment, payment reconciliation, cost semantics, and economic truth. #78 must not reason autonomously over those weaker semantics.

The governing chain is:

**Truth → Authority → Funding → Reservation → Freshness → Execution → Reconciliation → Economic Recognition → Decision**

No stage may be skipped merely because later stages require a numeric value or executable decision.

## Constitutional invariants

1. **UNKNOWN is never ZERO.** No unknown amount, provider cost, entitlement consumption, payment state, refund, FX rate, liability, or maximum exposure may be coerced to zero simply because execution requires a number.
2. **Authority is not funding.** Permission to spend does not itself allocate capital.
3. **Funding is not reservation.** A Bet budget does not claim the capital for a specific action.
4. **Reservation is not incurred cost.** Reserved maximum exposure remains distinct from actual economic cost.
5. **Incurred cost is not settlement.** Economic obligation and cash settlement are distinct when provider semantics require it.
6. **No metered external side effect without an enforceable maximum incremental cash exposure before execution.** Expected cost, historical average cost, or remaining budget is insufficient.
7. **Provider uncertainty never authorizes replay.** Timeout, process crash, lost lease, or unknown outcome requires exact-run reconciliation or durable uncertainty.
8. **Internal automation cannot satisfy VERIFIED_OWNER authority.** Request-body identity, shared middleware, Human Action text, capability existence, or automation credentials cannot impersonate owner authorization.
9. **Commercial authority must be version-bound.** Approval for one offer/provider/account/credential/price fingerprint must not silently authorize a materially different one.
10. **Passive runtime spend counts.** Customer traffic, cron, webhooks, autoscaling, storage, bandwidth, free-tier exhaustion, subscription renewal, and step-function pricing are economic exposure even when no agent initiates a discrete paid API call.
11. **Economic truth is typed.** Sunk build cost, operating variable cost, recurring fixed cost, accrued service cost, settlement, refund, credit, shared cost, reserve, deferred obligation, and liability must not collapse into one ambiguous COST observation.
12. **Decision truth must be fresh.** A stale decision/authority/reservation cannot execute after Bet, Asset, offer, provider, or policy state changes.

## Canonical monetary lifecycle

Money Scout must represent positive external economic exposure through the following states where applicable:

**AUTHORIZED → ALLOCATED → RESERVED → INCURRED → SETTLED**

### AUTHORIZED
Scoped permission exists for a specific class of economic side effect. Authorization must carry scope and version/fingerprint sufficient to prevent semantic reuse after material mutation.

### ALLOCATED
Capital or scarce provider capacity has been assigned to a Bet/resource envelope.

### RESERVED
A specific action atomically claims its maximum bounded exposure before dispatch. Reservation reduces available capacity immediately.

### INCURRED
The provider/customer/business event created an economic obligation or realized cost/revenue according to provider semantics.

### SETTLED
Cash or equivalent provider balance actually settled where the distinction is meaningful.

Reversals, refunds, credits, releases, expirations, and reconciliation events are append-only transitions/events; history is not rewritten.

## 1. Generic authority hardening

### Problem

Earlier Human Action and commercial/release authorization flows can accept human-attestation semantics without a universally persisted authority class. Some owner-only protections are action-name-specific rather than semantic.

### Required model

Persist a generic authority requirement such as:

- `VERIFIED_OWNER`
- `VERIFIED_EXTERNAL_CALLBACK`
- `MACHINE_VERIFIABLE`
- `NONE`

The exact enum names may differ, but semantics must be first-class and persisted.

### Required behavior

- Internal automation cannot resolve `VERIFIED_OWNER` actions.
- Shared automation authentication cannot forge owner identity through request bodies.
- Authority checks are semantic, not action-name allowlists.
- #71 public release/spend approvals and #75 charging/production-credential approvals must inherit the generic verified-owner mechanism.
- Authorization records must include actor provenance and exact scope.

## 2. Authority scope fingerprinting

Charging, release-spend, production credential use, provider account, merchant account, price/offer, and similar financial approvals must bind to exact material state.

At minimum, scope must be invalidated when relevant material fields change, including where applicable:

- provider
- merchant/account identity
- credential version/reference
- offer/price
- monetization-plan fingerprint
- Asset identity
- currency
- spending ceiling
- promised outcome

Material mutation requires fresh authority or a proven compatible continuation rule.

## 3. Atomic reservation primitive

Introduce one shared reservation primitive instead of per-milestone ad hoc spend checks.

A reservation must be:

- DB-atomic / serialization-safe;
- idempotent by economic action identity;
- scoped to Bet/resource bucket/provider/currency/action;
- bounded by maximum exposure;
- aware of already allocated, already reserved, incurred, released, and uncertain amounts;
- compatible with concurrent workers;
- incapable of double-claiming the same available capital;
- durable through process crash;
- explicitly reconciled after success, failure, cancellation, timeout, or uncertainty.

Example:

Bet has $100 available. Builder reserves $60. Available becomes $40 immediately. If provider proves $37 actual cost, consume $37 and release $23. If provider proves zero, release all $60. If outcome is uncertain, keep enough reservation locked to cover maximum plausible exposure until reconciliation.

## 4. Provider execution contract

Provider billing semantics must become richer than a binary free/metered flag.

Support states conceptually equivalent to:

- `ZERO_INCREMENTAL_CASH`
- `FREE_TIER`
- `PREPAID_FIXED`
- `ENTITLEMENT`
- `METERED`
- `UNKNOWN`

Missing/invalid/unrecognized configuration defaults to `UNKNOWN`, never free.

Each provider execution path must know, before dispatch:

- billing mode
- maximum incremental cash exposure
- whether that maximum is externally enforceable
- enforcement mechanism
- entitlement/quota semantics
- PAYG fallback possibility
- relevant provider/account/version identity

No silent PAYG fallback is allowed.

## 5. Scarce entitlement capacity

Incremental cash and scarce provider capacity are separate resources.

Examples include monthly AI credits, coding-agent quotas, fixed prepaid request bundles, and limited premium execution capacity.

Track entitlement capacity separately when finite. Reserve scarce capacity before execution where depletion can materially affect portfolio choices.

`incrementalCashCost = 0` must not imply `economicResourceConsumption = 0`.

## 6. Provider idempotency / uncertain outcome reconciliation

Every provider-side paid or scarce-resource execution must have durable identity and explicit replay semantics.

Requirements:

- exact provider run/economic-object identity where available;
- provider-side idempotency capability must be proven, not assumed;
- timeout after provider acceptance cannot blindly retry;
- cancellation intent does not prove provider cancellation;
- failed/cancelled/unknown runs retain incurred/possible cost evidence;
- terminal cost processing is exactly-once or cumulative-safe;
- provider APIs must specify whether reported cost values are delta or cumulative.

The #77 Builder Gateway durable phase model is the pattern to extend, not duplicate.

## 7. Payment economic-object state machine

Provider event identity alone is insufficient for transaction truth.

Persist stable provider economic-object identity for charges/payments/transactions and normalize provider events into an internal transaction state machine.

Must safely handle:

- authorization
- capture
- settlement
- failure
- cancellation
- refund
- partial refund
- dispute/chargeback
- reversal
- duplicate events
- out-of-order events
- provider retries/webhook duplication

A CAPTURED and SETTLED event for the same economic object must not recognize revenue twice.

A refund/chargeback arriving before the positive event must remain reconcilable so later positive ingestion cannot inflate revenue.

Partial refund semantics must explicitly distinguish delta vs cumulative provider reporting.

## 8. Typed economic event normalization

Do not rely on one generic Asset `COST` observation for #78 decisions.

Introduce normalized economic-event semantics capable of distinguishing at minimum:

- revenue recognized
- cash received
- refund/reversal
- sunk build cost
- launch/release cost
- operating variable cost
- operating recurring fixed cost
- accrued prepaid service cost
- shared infrastructure cost
- reservation
- incurred-but-unsettled cost
- settled cash outflow
- provider credit
- deferred customer obligation
- refund/chargeback reserve
- tax/processor liability where applicable

Do not necessarily create a contradictory second ledger. Prefer an economic normalization layer over canonical source events/observations.

## 9. Sunk-cost contamination fix

Current historic behavior can place Build/Release spend into generic Asset COST observations, and existing #74 economics can then subtract those sunk costs inside operating contribution windows.

#78 must not consume that as forward operating truth.

Retrofit economic recognition so:

- sunk Build/Release cost remains Bet performance/history;
- current survive/operate decisions use true forward operating economics;
- historic observations are preserved, not mutated;
- normalization/classification makes the distinction explicit.

## 10. Accrual and economic cadence

Cash timing must not distort profitability.

Support economic cadence such as:

- continuous
- recurring subscription
- transactional
- lumpy
- seasonal

A $1,200 annual service paid in one month should not make eleven months appear artificially free when the service supports those months.

Revenue/cost recognition rules must be explicit enough for forward economics.

## 11. Shared cost dependency groups

Avoid arbitrary per-Asset allocations that create false shutdown economics.

Represent economic dependency groups for shared infrastructure/services.

If ten Assets share a $100 service and shutting one Asset does not reduce that bill, the Asset-level shutdown decision must not pretend its allocated $10 is avoidable.

Capture:

- shared cost group identity
- current tier/threshold
- avoidable marginal cost
- step-function thresholds
- affected Assets
- evidence/provenance

## 12. Working capital, obligations, and tail exposure

Forward profitability alone is insufficient.

Track where material:

- Forward Cash Requirement
- customer prepayment/deferred service obligation
- refund/chargeback/fraud reserves
- maximum plausible bounded downside
- liabilities that can create cash need despite positive contribution

Do not invent these values when evidence is unavailable.

## 13. Currency and precision

Choose an explicit currency-aware high-precision representation suitable for sub-cent provider costs and long-lived aggregate accounting.

Do not silently mix currencies.

FX conversion requires:

- source
- rate
- timestamp/version
- base/quote currencies

If conversion is required but unavailable/untrusted, fail closed.

## 14. Runtime/passive spend guards

A live Asset may incur spend without a new Money Scout action.

Require runtime protection for relevant spend vectors:

- traffic/API consumption
- cron/background jobs
- webhook loops
- autoscaling
- storage/bandwidth growth
- external service metering
- free-tier exhaustion
- trial expiry
- auto-renewal
- plan upgrade/step function

Where provider-side budgets/breakers exist, use them. Where they do not, Money Scout must represent the inability to hard-bound exposure instead of pretending local state is sufficient.

## 15. Provider-side commercial deactivation

Local `chargingEnabled=false` is not enough if provider checkout/payment surfaces remain active.

Payment/commercial adapter contracts must eventually support provider-side disable/deactivate/revoke/reconcile semantics where the provider supports them.

Money Scout must not claim charging is paused until provider state is authoritatively verified when external checkout can remain reachable.

## 16. Decision freshness contract

Every economic action should carry enough identity to revalidate immediately before side effect:

- decision cycle/version
- Bet/version
- authority/version
- provider/account/credential/offer fingerprints
- reservation ID
- lease/action ID

If material state changed, execution must stop before the external side effect.

## 17. Money-safety wargame suite

The milestone is not complete without deterministic adversarial tests covering at minimum:

1. two concurrent jobs cannot reserve the same final available capital;
2. unknown provider maximum cannot dispatch;
3. $1 remaining cannot authorize a provider capable of $100 exposure;
4. internal automation cannot satisfy VERIFIED_OWNER;
5. failed/cancelled/uncertain runs preserve actual/possible incurred cost honestly;
6. out-of-order refund/payment cannot inflate revenue;
7. CAPTURED/SETTLED same economic object cannot double-recognize revenue;
8. partial refund delta/cumulative semantics normalize correctly;
9. annual/lumpy cost accrues correctly;
10. shared platform cost does not vanish or become falsely avoidable;
11. stale decision cannot execute after pause/Bet/offer/provider change;
12. no PAYG fallback after entitlement exhaustion unless separately authorized and bounded;
13. currency mismatch fails closed without versioned FX evidence;
14. reservations release only after authoritative reconciliation;
15. retry/idempotency cannot duplicate provider spend;
16. maximum exposure is not expected cost;
17. cancellation never assumes provider stopped billing until confirmed;
18. missing/typo billing config becomes UNKNOWN;
19. runtime traffic/cron/webhook behavior cannot exceed known hard exposure without blocking/containment;
20. authority invalidates after material offer/provider/credential change;
21. provider-side charging disable must be verified before local state claims containment;
22. scarce entitlement reservation prevents low-value work from consuming the last bounded capacity.

## Exit criteria

#77.5 is complete only when:

- generic verified authority is semantic and automation cannot forge owner actions;
- monetary execution uses a shared atomic reservation primitive;
- unknown provider exposure cannot dispatch;
- provider billing mode/configuration fails closed;
- payment economic objects reconcile idempotently and out of order;
- sunk vs operating vs shared vs accrued economic semantics are explicit;
- runtime/passive spend exposure is represented and bounded where possible;
- currency/precision rules are explicit;
- decision freshness is enforceable immediately before monetary side effects;
- the full Money-Safety Wargame passes;
- #78 can consume a documented Economic Truth contract without relying on ambiguous legacy Asset economics.

## Non-goals

#77.5 does not implement #78's survive/scale/hibernate/retire decisions. It creates the trustworthy financial substrate those decisions require.
