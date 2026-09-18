# Representation Package 02A — Consolidation Corrections 3: Policy/Demand Provider Attempts and Experiment-Planning Exclusion

**Status:** CONSOLIDATION CORRECTION OVERLAY / ILE-05 PARTIALLY INVALIDATED / S52–S54 ADDED / EXPERIMENT PLANNING EXCLUSION CONFIRMED  
**Controls over:** Consolidated Surface Map, Corrections 1–2, and Negative Coverage Sweep Rerun Candidate 2 where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

A targeted audit of bundled internal-loopback exclusions found that ILE-05 incorrectly grouped three downstream Research stages as if the internal route-to-route transport settled their execution classification.

Direct source review shows:

- Policy Check contains external HTTP acquisition plus a separate Anthropic provider call;
- Demand Check contains a direct Anthropic provider call with web search;
- Kill-Risk collection was already correctly mapped to S13.

ILE-06's Experiment Planning target was also checked directly.

Experiment planning is deterministic/local and does not introduce a new provider-attempt family.

Therefore:

`ILE_05_AS_PREVIOUSLY_BUNDLED = INCOMPLETE`

and three new numbered surfaces are required:

- S52 Policy Document Retrieval Requests;
- S53 Policy Anthropic Analysis Attempt;
- S54 Demand Anthropic Analysis Attempt.

## 2. Direct Policy Check source

Verified:

`artifacts/api-server/src/routes/policy-checks.ts`

Current implementation has two distinct external-operation layers.

### Layer A — direct policy-document retrieval

`retrievePolicyDocuments(...)` calls `fetchPublicText(...)`.

`fetchPublicText(...)` performs external HTTP GETs against public first-party policy URLs, including redirect traversal.

It may fetch:

- source page;
- discovered policy/legal links;
- /terms;
- /privacy;
- /robots.txt;
- redirects up to the configured bound.

Therefore one logical Policy Check may perform arbitrary-N external HTTP requests.

### Layer B — Anthropic analysis

After retrieval, the route creates an Anthropic client and calls:

`anthropic.messages.create(...)`

with:

- Sonnet model;
- policy-analysis prompt;
- optional/required provider-managed web_search;
- explicit token/search cost estimation.

The Anthropic call is a separate external provider operation from direct policy-document retrieval.

Therefore:

`POLICY_HTTP_RETRIEVAL != POLICY_ANTHROPIC_ANALYSIS`.

## 3. S52 — Policy Document Retrieval Requests

### Operation

External read-only HTTP GETs to first-party public policy sources.

### Cardinality

One Policy Check can perform arbitrary-N requests because of:

- multiple candidate documents;
- redirects;
- fallback/default policy paths.

A single Research-stage wrapper or Policy Check result row cannot represent all exact network attempts.

### C1

The requests are not billed as Anthropic/model spend.

But the current code does not prove absence of:

- externally constrained request capacity;
- target/provider rate limits;
- other R7-governed resource semantics where applicable.

Therefore:

`POLICY_HTTP_RETRIEVAL_C1 = NON_SCARCE_NOT_PROVEN`.

No M3 exclusion is authorized solely from public/read-only behavior.

### C2

The HTTP GET itself is observational.

Whether later adoption of retrieved policy evidence into authoritative policy status is C2 remains a separate Boundary Registry question.

### Pre-boundary exact identity

Current code uses in-memory URL/redirect state.

It does not create one durable immutable request-attempt object before each GET.

Therefore, if S52 is in envelope scope:

`POLICY_HTTP_REQUEST_PREBOUNDARY_EXACT_IDENTITY = ABSENT`.

### Disposition

`S52 = POLICY_DOCUMENT_RETRIEVAL_REQUESTS / M4_EXTERNAL_OBSERVATION_FAMILY`.

## 4. S53 — Policy Anthropic Analysis Attempt

### Operation

Direct Anthropic provider call:

`anthropic.messages.create(...)`

with optional provider-managed web search.

### C1

Current route explicitly computes estimated external cost from:

- input tokens;
- output tokens;
- web-search uses.

It also enforces a configured maximum estimated external-service cost.

Therefore:

`POLICY_ANTHROPIC_ANALYSIS_C1 = YES`.

### Granularity

One Anthropic request is one exact provider attempt.

Provider-managed web-search uses are resource subeffects of that provider request at the current integration boundary, unless future integration exposes independently dispatched search attempts.

### Pre-boundary identity

Current route uses an in-memory `runningChecks` guard.

The canonical Policy Check result is persisted after retrieval/provider analysis.

No first-class immutable execution-attempt/envelope object is created before `anthropic.messages.create(...)`.

Therefore:

`POLICY_ANTHROPIC_PREBOUNDARY_ATTEMPT_IDENTITY = ABSENT`.

### Result/adoption

Provider analysis is parsed into Policy status/findings and persisted as evidence/status.

Whether that result adoption is itself C2 is not automatically established merely because the result influences later Research decisions.

Add:

`POLICY_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`.

### Disposition

`S53 = POLICY_ANTHROPIC_ANALYSIS / M1_C1_PROVIDER_ATTEMPT`.

## 5. Direct Demand Check source

Verified:

`artifacts/api-server/src/routes/demand-checks.ts`

Current Demand Check:

1. configures Anthropic;
2. calls:
   `messagesClient.parse(...)`;
3. enables provider-managed web search;
4. reads token/search usage;
5. computes external cost;
6. persists the Demand result afterward.

Therefore Demand Check is not local computation and was not covered merely by Research's internal self-call to `/demand-checks`.

## 6. S54 — Demand Anthropic Analysis Attempt

### C1

Direct model/web-search resource consumption is explicit.

Therefore:

`DEMAND_ANTHROPIC_ANALYSIS_C1 = YES`.

### Granularity

One `messagesClient.parse(...)` request = one exact provider attempt at the current provider abstraction.

Provider-managed search use remains exact usage evidence attached to that attempt.

### Pre-boundary identity

The current route does not create a durable exact provider-attempt/envelope object before the Anthropic call.

The Demand Check result is persisted after the provider operation.

Therefore:

`DEMAND_ANTHROPIC_PREBOUNDARY_ATTEMPT_IDENTITY = ABSENT`.

### Result/adoption

Demand analysis becomes authoritative Research/underwriting evidence and may influence Research progression.

Current R20 source does not establish that Demand-result persistence itself is a separate C2 adoption boundary.

Therefore:

`DEMAND_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`.

### Disposition

`S54 = DEMAND_ANTHROPIC_ANALYSIS / M1_C1_PROVIDER_ATTEMPT`.

## 7. Kill-Risk remains correctly mapped

Research's internal:

`/kill-screen/collect`

target ultimately uses the already-numbered:

`S13 — Kill-Risk Collector`.

No new surface is created.

This confirms the correct split of the previously bundled ILE-05 targets:

- policy-checks → S52 + S53;
- demand-checks → S54;
- kill-risk collection → S13.

## 8. Experiment Planning direct verification

Verified:

- `artifacts/api-server/src/lib/experiment-planner.ts`;
- `artifacts/api-server/src/routes/experiment-plans.ts`.

### Planner behavior

`chooseCheapestFalsifyingExperiment(...)` is deterministic/local.

It selects from predeclared templates using:

- Validation Result;
- Underwriting Assessments;
- source platform;
- unresolved factor coverage;
- ordinal cost/time classes.

It makes no Anthropic/OpenAI/provider/model call.

### Route behavior

The Experiment Planning route:

1. internally fetches Money Scout's own `/validation-plan`;
2. calls `chooseCheapestFalsifyingExperiment(...)`;
3. inserts a PLANNED Experiment row;
4. explicitly reports `external_cost_usd: 0`.

The only `fetch()` is current-origin Money Scout orchestration.

Therefore:

`EXPERIMENT_PLANNING_PROVIDER_ATTEMPT = NONE`.

## 9. ILE-06 refinement

The earlier bundled ILE-06 is correct only after decomposing its targets:

- validation-evidence collection → S12;
- experiment planning → local deterministic planner + internal loopback only;
- resolution advancement → S16–S18 and downstream S17 provider attempts.

Add explicit exclusion:

`ILE_08 — EXPERIMENT_PLAN_VALIDATION_PLAN_SELF_FETCH`

= internal Money Scout orchestration, not external provider boundary.

The deterministic planner itself is:

`LOCAL_NON_PROVIDER_COMPUTATION`.

## 10. ILE-05 correction

Replace the former bundled exclusion:

> Research runInternalStage policy checks; demand checks; kill-risk collection are internal orchestration.

with the precise rule:

The **Research route-to-route fetch** is internal orchestration, but its target routes must be independently classified.

### Policy target

External work exists:

- S52 direct HTTP acquisition;
- S53 Anthropic analysis.

### Demand target

External work exists:

- S54 Anthropic analysis.

### Kill-Risk target

External work exists:

- S13 Kill-Risk Collector.

Therefore:

`INTERNAL_WRAPPER != INTERNAL_DOWNSTREAM_IMPLEMENTATION`.

## 11. New methodological rule

Add:

`SELF_CALL_CLASSIFICATION_STOPS_ONLY_AT_THE_TRANSPORT_LAYER`.

When Money Scout self-calls a route:

1. classify the self-call as internal transport;
2. continue tracing the target handler;
3. enumerate every provider/external call inside the target;
4. stop only when the downstream operation terminates in:
   - a numbered surface;
   - a proven M3 exclusion;
   - a local/non-provider computation.

This is the exact protection against bundled-exclusion false closure.

## 12. Attack fixtures

### BND-A1 — internal wrapper laundering

Research self-calls `/policy-checks`; reviewer marks the self-call internal and fails to inventory external HTTP/Anthropic work inside the target route.

Must fail coverage.

### BND-A2 — policy retrieval/analysis collapse

Multiple first-party HTTP retrieval requests plus one Anthropic analysis request are represented as one exact attempt.

Must fail arbitrary-N/exact-attempt identity.

### BND-A3 — demand hidden behind Research wrapper

Demand Anthropic call is omitted because Research's call to `/demand-checks` is internal.

Must fail.

### BND-A4 — experiment planner false provider surface

Deterministic `chooseCheapestFalsifyingExperiment(...)` is assigned an external provider envelope solely because Validation invokes the planner through HTTP.

Must fail overclassification.

### BND-A5 — planner downstream undertrace

Experiment planning is correctly called local, but reviewer then fails to distinguish later experiment execution S32/S33.

Must fail coverage.

## 13. Numbered surface count

Prior floor:

`51`.

Add:

- S52 Policy Document Retrieval Requests;
- S53 Policy Anthropic Analysis;
- S54 Demand Anthropic Analysis.

Therefore:

`CURRENT_NUMBERED_SURFACE_FLOOR = 54`.

This remains a floor, not a final denominator, until the all-call-site ledger closes.

## 14. F06-02 consequences

S53 and S54 add two more direct live-code examples where:

- external provider execution occurs;
- exact R18 binding attachment is absent;
- no first-class pre-boundary Execution Authority Envelope exists.

S52 adds an arbitrary-N external-read family whose envelope requirement depends on final C1/C2 classification but whose exact-request cardinality cannot be represented by the wrapper alone.

## 15. Boundary Registry additions

Add unresolved result-adoption classifications:

- Policy Result Adoption;
- Demand Result Adoption.

These join the existing transition-specific open set.

No positive C2 adoption is asserted here without stronger R20/Boundary Registry evidence.

## 16. Rerun status correction

The prior statement:

`NEW_ADDITIONAL_SURFACE_FAMILIES = 0`

from Sweep Rerun Candidate 2 is superseded.

The bundled-exclusion audit found:

`NEW_ADDITIONAL_SURFACE_FAMILIES = 3`

relative to the S01–S51 map.

Therefore Candidate 2 cannot support a zero-new-family conclusion.

## 17. Disposition

`ILE_05_BUNDLED_EXCLUSION = CORRECTED`

`S52_POLICY_HTTP_RETRIEVAL = ADDED`

`S53_POLICY_ANTHROPIC_ANALYSIS = ADDED`

`S54_DEMAND_ANTHROPIC_ANALYSIS = ADDED`

`S13_KILL_RISK = RETAINED`

`EXPERIMENT_PLANNER_EXTERNAL_PROVIDER_CALL = NO`

`ILE_08_EXPERIMENT_VALIDATION_PLAN_SELF_FETCH = INTERNAL`

`CURRENT_NUMBERED_SURFACE_FLOOR = 54`

`SELF_CALL_CLASSIFICATION_STOPS_ONLY_AT_TRANSPORT_LAYER = REQUIRED`

`SWEEP_RERUN_CANDIDATE_2_ZERO_NEW_SURFACE_CONCLUSION = SUPERSEDED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = ALL_CALL_SITE_LEDGER_WITH_RECURSIVE_SELF_CALL_TARGET_TRACING`
