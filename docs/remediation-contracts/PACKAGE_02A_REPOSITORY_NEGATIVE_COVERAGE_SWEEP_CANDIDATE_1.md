# Representation Package 02A — Repository-Wide Negative Coverage Sweep Candidate 1

**Status:** COVERAGE SWEEP CANDIDATE / NEW SURFACES FOUND / NOT COMPLETE  
**Classifier:** C1 scarce-resource consequentiality OR C2 registered consequential boundary/adoption  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact applies the Package-02A C1/C2 consequence classifier beyond the initially obvious Builder/QA/Release/Payment surfaces.

The goal is to falsify inventory completeness by actively searching for additional provider calls, metered evidence collection, quota/entitlement use, telemetry, research/validation, reconciliation, and external/adoption boundaries.

A clean filename search is not accepted as completeness proof. Concrete call sites and resource semantics must be checked.

## 2. New confirmed C1 surfaces

### NC-01 — Validation Evidence Collector

**File:** `artifacts/api-server/src/lib/validation-evidence-collector.ts`

Directly verified:

- Anthropic SDK execution;
- web-search tool use;
- explicit token/search-unit cost calculation;
- `VALIDATION_EVIDENCE_MAX_EXTERNAL_COST_USD = 0.5`;
- projected maximum checked before call;
- actual input/output/search usage measured after call;
- actual external cost rejected if above ceiling.

**Classification:**

`C1_SCARCE_RESOURCE = YES`

This is consequential even though the product of the attempt is evidence.

The external provider attempt requires:

- exact envelope identity;
- exact R18 binding/set;
- R7 reservation/admission;
- R8 provider truth/reconciliation as applicable.

**Container/attempt status:**

Current collector call appears closer to one provider attempt per invocation, but the surrounding worker/orchestrator must still be checked for retries and whether one logical validation job can invoke the collector multiple times.

**Linkage pattern:** pending exact worker/container inventory.

---

### NC-02 — Kill-Risk Collector

**File:** `artifacts/api-server/src/lib/kill-risk-collector.ts`

Directly verified:

- Anthropic SDK execution;
- web-search tool use;
- token/search resource calculation;
- `KILL_RISK_MAX_EXTERNAL_COST_USD = 0.5`;
- bounded projected and actual external cost.

**Classification:**

`C1_SCARCE_RESOURCE = YES`

R7's own known migration scope names Kill-Risk as a resource-admission surface.

Evidence-only output does not make the provider attempt non-consequential.

**Envelope/R18/R7 scope:** required.

**Linkage pattern:** pending worker/container attempt inventory.

## 3. Telemetry — adapter-level classification required

### NC-03 — Asset Telemetry HTTP Adapter

**File:** `artifacts/api-server/src/lib/asset-telemetry-adapter.ts`

Directly verified:

- external HTTP POST to configured provider;
- provider identity;
- token/credential use;
- cost modes `ZERO_CASH` or `METERED`;
- returned `externalCostCents`;
- idempotency identity;
- explicitly read-only contract.

The read-only contract prohibits customer-charging, outbound, advertising, and domain mutation, but read-only does not by itself prove non-scarce resource use.

**Classification:**

`C1 = ADAPTER_RESOURCE_SEMANTICS_DEPENDENT`

`C2 = BOUNDARY_REGISTRY_CLASSIFICATION_DEPENDENT`

A METERED adapter is clearly C1.

A ZERO_CASH adapter may still consume entitlement/quota/concurrency and cannot be excluded until `NON_SCARCE_PROVEN`.

If a telemetry provider call is separately registered as an R20 consequential provider boundary, C2 applies even where R7 reservation is unnecessary.

**Inventory consequence:**

CE-U01 is narrowed from generic uncertainty to adapter-specific classification work.

## 4. Research/experiment surface — zero-cost field is not enough

### NC-04 — Apify Store experiment adapters

**File:** `artifacts/api-server/src/lib/apify-experiment-adapters.ts`

Directly verified current behavior includes:

- bounded public HTTP GETs to Apify Store metadata;
- `externalCostUsd: 0`;
- `external_write_requests: 0`;
- `actor_runs_started: 0`;
- no authenticated Actor execution in the reviewed adapter;
- read-only public metadata probes.

This is strong evidence for a non-mutating, zero-marginal-cash path.

However:

`externalCostUsd = 0`

does not alone prove:

`NON_SCARCE_PROVEN`.

Remaining questions include whether the public API is treated as consuming a scarce request quota/shared capacity under R1/R7 semantics and whether the boundary registry classifies this external provider read as consequential.

**Current classification:**

`RESOURCE_SEMANTICS_UNKNOWN`

until explicitly adjudicated.

The sweep therefore rejects both false extremes:

- do not auto-envelop merely because an external HTTP request exists;
- do not auto-exclude merely because reported cash cost is zero.

## 5. Provider-selection infrastructure is not itself an attempt

### NC-05 — Anthropic provider configuration

**File:** `artifacts/api-server/src/lib/anthropic-provider.ts`

This code selects/remaps provider credentials/base URLs.

It does not itself perform a provider execution.

**Classification:**

`NOT_AN_EXECUTION_ATTEMPT`

but it is a dependency of provider-attempt surfaces and may affect provider/account identity captured by R18.

It belongs in provider/account provenance inventory, not as its own envelope.

## 6. Research execution wrapper versus provider attempt

### NC-06 — Research execution orchestration

**File:** `artifacts/api-server/src/lib/research-execution.ts`

Direct scan found no direct provider call, provider-run identity, or external-cost handling in this surface.

**Classification:**

`LOGICAL_ORCHESTRATION_NOT_PROVIDER_ATTEMPT_BY_ITSELF`

Any actual research provider attempt must be attached at the concrete downstream collector/adapter that performs the external/scarce call.

This mirrors the generic `execution_jobs` rule: logical work identity is not automatically exact provider-attempt identity.

## 7. Autonomous resolution

### NC-07 — Autonomous Resolution Engine

**File:** `artifacts/api-server/src/lib/autonomous-resolution-engine.ts`

Current reviewed code contains policy language explicitly preferring zero-cost reasoning and warning against blind repeat paid calls, but no direct provider dispatch was found in this engine surface.

**Classification:**

`ORCHESTRATION/POLICY_SURFACE`

not itself an exact provider attempt on current evidence.

Downstream execution workers must be separately inventoried.

## 8. R7 direct corroboration of sweep scope

Current R7 explicitly requires audit of autonomous operations capable of consuming:

- cash;
- provider entitlement;
- subscription credits;
- external requests with quota;
- concurrency;
- shared model/API capacity;
- externally billed searches;
- build/QA/repair execution;
- deployment/release;
- Asset-operation provider work;
- safety review/verification/reconciliation.

R7 expressly names at minimum:

- Research;
- Validation;
- Autonomous Resolution;
- experiments;
- Builder;
- repair;
- QA;
- Release preview/production;
- Asset remediation;
- telemetry;
- R5 confirmation;
- R6 automated verification;
- WATCH/revalidation;
- commercial/payment operations.

Therefore the Package-02A negative sweep cannot close until those named categories have either:

1. an exact attempt/envelope mapping;
2. a concrete downstream provider attempt already mapped elsewhere; or
3. a defensible `NON_SCARCE_PROVEN + NOT_C2` exclusion.

## 9. Additional categories now required for the next sweep

The current tree search identifies further code families requiring direct classification:

- evidence workers;
- factor-assessment workers;
- validation orchestrator;
- validation workers;
- kill-risk workers;
- research orchestrator;
- autonomous-resolution workers;
- experiment executor/planner;
- execution reconciler;
- bet/portfolio/human-action reconciliation;
- asset economics/operations workers;
- R5 confirmation and R6 automated-verification implementation surfaces if present.

These are not yet all classified in this artifact.

## 10. CE-U03 closure carried forward

Builder Gateway provider execution and repository finalization are now resolved as two distinct envelopes:

`E_dispatch → E_adopt`

with an exact predecessor/dependency FK.

This distinction must be represented during Builder Gateway attempt mapping.

The negative sweep must still prove that Builder Workspace and Builder Gateway do not independently create duplicate envelopes for E_dispatch.

## 11. Coverage arithmetic

Previously high-confidence inventory surfaces:

`12`

New concrete candidate findings from this sweep:

- 2 confirmed new C1 provider-attempt families: validation evidence + kill-risk;
- 1 adapter-classified telemetry family;
- 1 unresolved zero-cost external experiment family;
- 3 non-attempt/orchestration/provider-config surfaces classified to prevent false envelope creation.

This artifact does **not** revise a final unique-attempt count because orchestration wrappers may converge on the same concrete provider-attempt family and duplicate counting must be eliminated first.

## 12. Current strongest open question

The hardest remaining coverage problem is now:

> Can every R7-A1 named autonomous category be mapped to one exact provider-attempt family or defensibly excluded without double-counting wrappers and downstream adapters?

This is a graph/inventory problem, not merely a keyword search.

## 13. Disposition

`NEGATIVE_COVERAGE_SWEEP = ACTIVE / NOT_COMPLETE`

`NEW_CONFIRMED_C1_FAMILIES = 2`

`TELEMETRY_CLASSIFICATION = ADAPTER_SPECIFIC`

`APIFY_PUBLIC_METADATA = RESOURCE_SEMANTICS_UNKNOWN`

`ZERO_CASH_AUTO_EXCLUSION = PROHIBITED`

`ORCHESTRATION_WRAPPER_AUTO_ENVELOPE = PROHIBITED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = MAP_ALL_R7_A1_NAMED_CATEGORIES_TO_EXACT_ATTEMPT_FAMILIES_OR_EXPLICIT_EXCLUSIONS`
