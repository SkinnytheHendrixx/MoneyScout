# Representation Package 02A — Consequence Classification / Envelope Granularity Adjudication 1

**Status:** DESIGN ADJUDICATION / CE-U03 RESOLVED / CE-U01-U02 CLASSIFIER REFINED / NO IMPLEMENTATION AUTHORITY  
**Parent inventory:** `PACKAGE_02A_CONSEQUENTIAL_EXECUTION_SURFACE_INVENTORY_CANDIDATE_1.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact adjudicates the three open classification/granularity items from Inventory Candidate 1:

- CE-U03 — Builder Gateway provider execution versus repository finalization;
- CE-U01 — Asset telemetry;
- CE-U02 — research/validation provider execution.

It also freezes a mechanical consequence-classification rule for the remaining repository-wide coverage pass.

## 2. CE-U03 — Builder Gateway provider execution and repository finalization

### Determination

`CE-U03 = TWO_DISTINCT_EXECUTION_AUTHORITY_ENVELOPES`

The Builder Gateway provider execution and later repository finalization are distinct consequential attempts.

They must not share one envelope.

### Direct R20 basis

Current R20 explicitly distinguishes:

- `BOUNDARY_VALIDATION` immediately before consequential provider/external dispatch; and
- `ADOPTION_VALIDATION` after external execution, before adopting the result into authoritative state.

R20 states:

> boundary crossing and result adoption are separate authority consumptions.

The Builder Gateway state machine independently reflects that separation:

1. provider dispatch attempted;
2. provider run confirmed;
3. repository finalization attempted.

The provider run can be historically real under R8 while the resulting code is later ineligible for adoption.

Therefore one envelope spanning both moments would collapse two separately governed authority consumptions.

## 3. CE-U03 envelope topology

### Envelope E_dispatch

Represents the exact external provider execution attempt.

Governed as:

`BOUNDARY_VALIDATION`

Required before crossing the provider boundary.

Carries/anchors:

- exact provider execution attempt identity;
- exact R18 binding set consumed for provider access;
- R7 reservation/resource authority where applicable;
- R8 external execution truth/reconciliation.

### Envelope E_adopt

Represents the exact repository-finalization/adoption attempt.

Governed as:

`ADOPTION_VALIDATION`

Created/frozen before authoritative repository mutation/finalization.

Carries/anchors the exact authority/evidence required for adoption.

### Required causal relation

The adoption envelope must not be independent of the provider attempt that produced the candidate result.

Required relation:

`E_adopt.predecessor_execution_authority_envelope_id → E_dispatch.id`

or an equivalent ordinary-FK predecessor/dependency relation.

The relation must be exact and non-null for a provider-result adoption path.

A later adoption attempt may be distinct from an earlier failed adoption attempt while preserving the same dispatch predecessor if it is genuinely re-adjudicating the same immutable provider result under governed retry semantics.

### EAE-A7 compatibility

This two-envelope result does not violate duplicate-envelope protection.

EAE-A7 prohibits two envelopes for the **same consequential moment**.

CE-U03 recognizes two genuinely distinct authority moments:

- external dispatch;
- result adoption.

Therefore:

`DISTINCT_BOUNDARY_CLASS + DISTINCT_AUTHORITY_CONSUMPTION = DISTINCT_ENVELOPE`

## 4. Consequence classifier — proposed cash-only iff rule rejected as too narrow

A proposed rule was:

> consequential under R18/R7 iff the operation can incur non-zero real external cost/resource consumption.

The underlying intuition is correct that read-only or evidence-producing operations may still be consequential.

However, literal **non-zero cash** or even only observed current consumption cannot be the sole iff criterion.

### Direct R7 evidence

R7 explicitly governs:

- cash;
- provider entitlement;
- subscription credits;
- external request quota;
- concurrency;
- shared model/API capacity;
- externally billed searches;
- build/QA/repair execution;
- deployment/release calls;
- Asset-operation provider work;
- research/validation/resolution resource admission;
- telemetry.

R7 also states:

> zero incremental cash does not mean zero scarce resource.

A subscription-backed action with zero marginal charge may still consume scarce entitlement, request quota, concurrency, monthly units, or other capacity.

Only a truly non-scarce, locally proven zero-resource operation is reservation-free under R7.

### Direct R20 evidence

R20 independently governs consequential external/provider/customer boundaries and result-adoption boundaries.

Therefore an operation can require envelope/boundary governance even where R7 concludes the specific action consumes no scarce resource.

## 5. Frozen mechanical consequence classifier

For Package 02A inventory purposes, an exact attempt is **in envelope scope** if either branch below is true.

### Branch C1 — scarce-resource consequentiality

The attempt can consume or commit any R7-governed scarce resource, including:

- positive cash exposure;
- entitlement/subscription units;
- external request quota;
- concurrency;
- shared model/API capacity;
- provider/account capacity;
- bounded but currently UNKNOWN external exposure;
- other typed scarce resources under R1/R7.

This branch does not depend on whether the operation is a read or write.

### Branch C2 — independent consequential boundary/adoption

Even if no scarce resource is consumed, the attempt crosses an R20-class consequential boundary or performs a separately governed adoption into authoritative state, including where applicable:

- provider/external dispatch;
- customer charge/checkout;
- production release or external mutation;
- adoption of external provider result;
- other registered consequential boundary classes.

### Exclusion

An operation may be outside envelope scope only when it is proven to be both:

1. `NON_SCARCE_PROVEN` under R7/resource semantics; and
2. not an R20-class consequential external/customer/provider/adoption boundary.

Therefore:

`ZERO_CASH != NON_CONSEQUENTIAL`

and:

`READ_ONLY != NON_CONSEQUENTIAL`

and:

`HAS_COST_FIELD != AUTOMATIC_PROOF_OF_SCARCE_CONSUMPTION`

The resource class must be semantically adjudicated rather than inferred from field names.

## 6. CE-U01 — Asset telemetry

### Current evidence

`asset_telemetry_syncs` contains:

- provider;
- cost mode;
- external cost cents;
- idempotency;
- cursor/coverage;
- sync status.

Asset operations policy separately contains:

- `allowReadOnlyHealthChecks`;
- `allowTelemetryIngestion`;
- `allowExternalSpend`.

R7-A1 explicitly names telemetry as a surface requiring scarce-resource audit.

### Determination

`CE-U01 = CONDITIONALLY_IN_SCOPE_BY_RESOURCE/BOUNDARY_CLASS`

Telemetry is not excluded merely because it is observational.

For each telemetry provider/adapter mode:

- if it can consume cash, entitlement, quota, concurrency, API capacity, or UNKNOWN bounded exposure → C1 applies and an exact envelope is required;
- if it crosses a separately registered consequential external/provider boundary even while proven non-scarce → C2 may independently require an envelope;
- only a `NON_SCARCE_PROVEN` and non-consequential local/fixture/internal telemetry path may be envelope-free.

The presence of `externalCostCents` is evidence that resource classification matters, but the field alone does not establish the resource semantics of every telemetry path.

### Inventory action

Telemetry adapters/providers must be individually classified in the coverage pass.

## 7. CE-U02 — Research / validation provider execution

### Direct R7 evidence

R7 names:

- research;
- validation;
- autonomous resolution;
- safety-required review/verification/reconciliation work

as required audit surfaces.

R7 also lists research/validation/resolution resource admission among known migration scope.

### Determination

`CE-U02 = IN_SCOPE_WHERE_EXTERNAL_ATTEMPT_CONSUMES_SCARCE_RESOURCE_OR_CROSSES_REGISTERED_CONSEQUENTIAL_BOUNDARY`

An LLM/API call made only for evidence is not automatically non-consequential.

If it consumes:

- cash;
- subscription/entitlement units;
- quota;
- shared model/API capacity;
- concurrency;
- UNKNOWN bounded resource exposure,

then C1 applies.

If a research/validation action is a separately registered consequential provider boundary under R20, C2 also applies independently.

A locally proven non-scarce deterministic fixture/internal computation may remain outside envelope scope.

## 8. Envelope versus R7 reservation scope

Envelope scope and R7 reservation scope overlap but are not identical.

### R7 asks

What scarce resource must be reserved before dispatch?

### Execution Authority Envelope asks

What exact consequential attempt identity must R18/R8/R19/R20 evidence converge on?

Therefore:

- every C1 scarce-resource attempt in this program is envelope-relevant;
- some C2 attempts may be envelope-relevant even if no R7 reservation is needed;
- a `NON_SCARCE_PROVEN` operation can avoid R7 reservation but still require envelope/R20 governance if it crosses a consequential boundary.

This prevents R18 identity from being accidentally reduced to accounting.

## 9. New attack fixtures

### EAE-A8 — zero-cash entitlement attempt

Provider call has $0 marginal cash cost but consumes one scarce subscription unit.

Must remain R7-admitted and envelope-identified.

### EAE-A9 — zero-resource adoption

External provider result has already executed and adoption itself consumes no external resource.

Repository authoritative-state adoption still requires its distinct E_adopt envelope and ADOPTION_VALIDATION.

### EAE-A10 — cost-field false positive

A local fixture row records `externalCostCents = 0` or structurally contains a cost field but is proven non-scarce and crosses no consequential boundary.

Do not manufacture a reservation/envelope solely from superficial field shape.

### EAE-A11 — read-only metered research

Research call only reads/produces evidence but consumes provider quota/cash.

It remains consequential under C1.

## 10. Inventory consequences

Resolved:

- CE-U03 → two envelopes with exact predecessor relation.
- CE-U01 → conditional adapter/provider classification under C1/C2.
- CE-U02 → conditional execution-provider classification under C1/C2.

The next repository-wide negative coverage pass must apply C1/C2 mechanically.

It must not search only for:

- mutations;
- payment code;
- positive-cost fields.

It must also search for:

- provider adapters;
- external dispatch;
- quota/entitlement consumers;
- LLM/model calls;
- release/deployment;
- adoption/finalization;
- reconciliation paths;
- telemetry/research/validation;
- any operation with UNKNOWN resource semantics.

## 11. Disposition

`CE_U03_RESOLVED = TWO_ENVELOPES_WITH_PREDECESSOR_FK`

`PROVIDER_DISPATCH_PHASE = BOUNDARY_VALIDATION`

`REPOSITORY_FINALIZATION_PHASE = ADOPTION_VALIDATION`

`CASH_ONLY_CONSEQUENTIALITY_IFF = REJECTED_AS_TOO_NARROW`

`CONSEQUENCE_CLASSIFIER = C1_SCARCE_RESOURCE_OR_C2_CONSEQUENTIAL_BOUNDARY_ADOPTION`

`CE_U01 = CONDITIONAL_CLASSIFICATION_REQUIRED_BY_ADAPTER`

`CE_U02 = CONDITIONAL_CLASSIFICATION_REQUIRED_BY_PROVIDER_EXECUTION`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = REPOSITORY_WIDE_NEGATIVE_COVERAGE_SWEEP_USING_C1_C2`
