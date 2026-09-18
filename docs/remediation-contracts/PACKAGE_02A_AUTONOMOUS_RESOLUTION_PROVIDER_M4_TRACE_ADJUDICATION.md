# Representation Package 02A — Autonomous Resolution Downstream Provider M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / DIRECT C1 ATTEMPTS CONFIRMED / PRE-BOUNDARY IDENTITY DEFECT CONFIRMED  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

How should autonomous-resolution downstream provider execution map into the Execution Authority Envelope inventory?

The prior coverage map treated Autonomous Resolution primarily as a wrapper whose concrete provider callbacks still needed tracing.

Direct current-code review shows that characterization is incomplete.

## 2. Direct current implementation

Current route:

`artifacts/api-server/src/routes/autonomous-resolution.ts`

Blob:

`49c3d788152531071f60e7b68f2812973101c04c`

Current worker orchestration:

`artifacts/api-server/src/lib/autonomous-resolution-workers.ts`

The route defines one concrete `runWorker(method, context)` implementation.

Every executed Resolution Method flows through this function.

## 3. Every current Resolution Method makes an Anthropic provider call

`runWorker(...)` always:

1. prepares an Anthropic message request;
2. selects model `claude-sonnet-4-5`;
3. invokes:

`await client.parse(params)`

Therefore every current executed method is an external model-provider attempt, including:

- `DIRECT_RESEARCH`;
- `PROXY_RESEARCH`;
- `ECONOMIC_INFERENCE`;
- `ADVERSARIAL_REVIEW`;
- `ALTERNATIVE_THESIS`;
- `SAFE_EXPERIMENT`;
- `WATCH_FOR_DELTA`.

The distinction in `methodAllowsWebSearch(...)` affects only whether the Anthropic call may additionally use web search.

It does **not** make the other methods local.

## 4. C1 classification

The route explicitly computes external cost from:

- input tokens;
- output tokens;
- web-search requests where used.

Constants include:

- input-token cost;
- output-token cost;
- search cost per use.

`executeAutonomousResolutionAdvance(...)` tracks cumulative external cost and applies a resolution-stage reserve/ceiling.

Therefore:

`EVERY_CURRENT_AUTONOMOUS_RESOLUTION_WORKER_EXECUTION_C1 = YES`

Every actual `runWorker` provider invocation is an M1 exact consequential attempt.

This includes `WATCH_FOR_DELTA` **definition work** inside Autonomous Resolution.

That is distinct from the later Portfolio Reconciler's local periodic WATCH comparison, which remains non-scarce.

## 5. Correct wrapper/attempt topology

### Logical wrapper

`executeAutonomousResolutionAdvance(...)`

owns sequencing across Resolution Methods.

One call may execute several methods sequentially.

Therefore:

`AUTONOMOUS_RESOLUTION_ADVANCE = M2_CONTAINER/ORCHESTRATOR`

It must not receive one envelope representing all downstream provider calls.

### Exact attempts

Every individual `runWorker(method,...)` Anthropic invocation is:

`M1_EXACT_PROVIDER_ATTEMPT`

and requires one exact Execution Authority Envelope.

If one advance executes N methods:

`Advance A → {E1...EN}`

with one envelope per provider call.

No single “resolution run” envelope may collapse them.

## 6. DIRECT_RESEARCH / PROXY_RESEARCH web-search subcalls

For `DIRECT_RESEARCH` and `PROXY_RESEARCH`, the Anthropic request may invoke the provider's web-search tool up to the configured maximum.

Current code receives one Anthropic Message result containing server-tool-use accounting.

At the current abstraction boundary, these search uses are provider-managed sub-effects of the same Anthropic request.

Candidate 02A topology:

`ONE_ANTHROPIC_REQUEST = ONE_EXECUTION_AUTHORITY_ENVELOPE`

with the exact search usage/resource effects recorded as part of that attempt's resource/result evidence.

This is a candidate physical-granularity conclusion, not permission to collapse independently dispatched external search calls if the provider integration later exposes them as separately controllable attempts.

## 7. Critical current persistence defect — identity is created after provider boundary

Current `runWorker(...)` sequence is:

1. set local activity to RUNNING;
2. construct provider request;
3. call `await client.parse(params)`;
4. parse result and usage;
5. compute external cost;
6. call `persistExecution(...)`.

`persistExecution(...)` then inserts a row into `researchRunsTable`.

Therefore the durable `researchRuns` record is created **after the external provider call has already returned**.

This violates the adopted envelope rule:

`ENVELOPE_CREATED_AND_FROZEN_BEFORE_CONSEQUENTIAL_BOUNDARY = REQUIRED`

## 8. researchRuns is not a safe canonical attempt identity

Current `persistExecution(...)` sets:

- `startedAt = finishedAt`;
- `finishedAt = finishedAt`;

where `finishedAt` is created after provider execution returns.

The row stores:

- method;
- result/status;
- estimated external cost;
- token usage;
- search count;
- findings/provenance.

But current code does not persist, before dispatch:

- canonical execution-attempt identity;
- exact R18 binding set;
- R7 reservation linkage;
- provider account identity;
- exact R6 verification provenance;
- boundary-time validation record;
- durable provider-side request/run identity sufficient for R8 reconciliation.

Therefore:

`researchRuns != EXECUTION_AUTHORITY_ENVELOPE`

and:

`POST_RESPONSE_RESEARCH_RUN_INSERT != PRE_BOUNDARY_ATTEMPT_IDENTITY`

The existing row may remain useful as a result/evidence record.

It cannot retroactively prove pre-dispatch authority.

## 9. Required corrected topology

Before `client.parse(params)`:

1. create exact Execution Authority Envelope E;
2. attach exact R18 binding/set to E;
3. attach R7 resource reservation/economic action where required;
4. record exact method/problem/Evaluation Cycle/idempotency/correlation identity;
5. perform required boundary validation;
6. only then dispatch Anthropic request.

After provider response:

7. bind exact provider truth/result/usage to E;
8. persist Resolution result/evidence with durable reference to E;
9. reconcile actual resource consumption;
10. perform any separately required lifecycle/adoption decision without rewriting E.

## 10. Provider/account identity

Current provider configuration comes from the Anthropic integration environment.

`anthropic-provider.ts` distinguishes:

- DIRECT;
- REPLIT_MANAGED;
- UNAVAILABLE.

The autonomous-resolution route itself reads the managed integration variable names after startup remapping.

Package 02A must not infer provider-account identity merely from:

- model name;
- base URL;
- environment variable name;
- generic Anthropic provider label.

Exact provider/account identity must come from the canonical R18 binding model.

## 11. Retry semantics

The route has:

`retry_policy = NO_BLIND_PAID_RETRY`

and on worker failure does not automatically retry.

That is compatible with envelope semantics.

Any later manual/governed retry that calls Anthropic again is a new external attempt and requires a new envelope.

A prior failed/uncertain envelope must remain historically addressable.

## 12. C2 / result-adoption analysis

The provider result can later influence authoritative lifecycle state through `applyResolutionLifecycleOutcome(...)`, including examples such as:

- entering WATCH;
- issuing exhaustion/human-review state;
- recording autonomous resolution completion;
- other lifecycle changes based on worker results.

These are separate from the C1 provider execution itself.

Current R20 does not provide enough recovered Boundary Registry detail to classify every Autonomous Resolution lifecycle transition as C2 or NOT_C2.

Therefore:

`AUTONOMOUS_RESOLUTION_RESULT_ADOPTION_C2 = TRANSITION_SPECIFIC / BOUNDARY_REGISTRY_CLASSIFICATION_REQUIRED`

The provider execution envelope must exist regardless, because C1 is already established.

If a later lifecycle transition is independently classified C2, that adoption receives its own distinct adoption envelope rather than reusing the Anthropic execution envelope.

## 13. Observation / result / adoption split

Correct layers:

1. Anthropic provider attempt E;
2. provider result/usage/external truth bound to E;
3. Resolution Result / evidence persisted with reference to E;
4. optional lifecycle/adoption transition;
5. downstream work triggered by that transition.

A result record is not a new provider attempt.

A lifecycle adoption is not automatically the same attempt as the provider call.

## 14. Duplicate-counting corrections

The earlier category map's implication that paid collector families might be the only concrete Autonomous Resolution attempts is too narrow.

Current `autonomous-resolution.ts` directly performs its own Anthropic calls.

Therefore:

- Validation Evidence Collector attempts remain their own family;
- Kill-Risk Collector attempts remain their own family;
- Autonomous Resolution `runWorker` attempts are a separate direct provider-attempt family.

They must not be merged merely because all may use Anthropic/search.

## 15. Attack fixtures

### ARE-A1 — wrapper collapse
One resolution advance executes DIRECT_RESEARCH, ADVERSARIAL_REVIEW, and SAFE_EXPERIMENT.

System creates one envelope for the whole advance.

Must fail; three provider calls require three attempt identities.

### ARE-A2 — post-hoc envelope
Anthropic call returns, then system creates envelope/research-run identity.

Must fail as proof of pre-boundary authority.

### ARE-A3 — researchRuns substitution
A post-response `researchRuns` row is treated as if it proves exact pre-dispatch R7/R18 authority.

Must fail.

### ARE-A4 — method mislabeled local
ECONOMIC_INFERENCE or ADVERSARIAL_REVIEW is declared non-scarce because web search is disabled.

Must fail; the Anthropic model call itself consumes external scarce resources.

### ARE-A5 — WATCH label confusion
Autonomous Resolution's `WATCH_FOR_DELTA` model call is conflated with the later local Portfolio Reconciler WATCH check.

Must fail; first is C1 provider execution, second is currently local/non-scarce.

### ARE-A6 — blind retry envelope reuse
Failed/uncertain Anthropic request is retried using the same envelope.

Must fail unless durable proof establishes the original provider boundary was never crossed and governing attempt semantics permit same-attempt continuation; default new provider dispatch is new envelope.

### ARE-A7 — duplicate collector merge
Autonomous-resolution Anthropic execution is collapsed into Validation Evidence Collector or Kill-Risk Collector identity solely because provider/model technology overlaps.

Must fail.

### ARE-A8 — result/adoption collapse
Anthropic provider envelope is reused as the envelope for a separately classified C2 lifecycle adoption.

Must fail if that transition is independently consequential.

## 16. Coverage-map update

Replace:

`AUTONOMOUS_RESOLUTION = M2_WRAPPER_TO_METHOD_SPECIFIC_ATTEMPTS / PARTIAL`

with:

### Orchestrator

`AUTONOMOUS_RESOLUTION_ADVANCE = M2_CONTAINER`

### Concrete current attempt family

`AUTONOMOUS_RESOLUTION_RUN_WORKER = M1_C1_PROVIDER_ATTEMPT`

for every executed Resolution Method.

### Exact cardinality

`ONE_RUN_WORKER_PROVIDER_CALL = ONE_EXECUTION_AUTHORITY_ENVELOPE`

### Current persistence status

`PRE_BOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`

### Result persistence

`researchRuns = POST_RESPONSE_RESULT/EVIDENCE_RECORD / NOT_CANONICAL_PRE_BOUNDARY_ATTEMPT_IDENTITY`

### Lifecycle adoption

`AUTONOMOUS_RESOLUTION_RESULT_ADOPTION_C2 = TRANSITION_SPECIFIC_UNRESOLVED`

## 17. F06-02 consequence

This trace directly strengthens F06-02.

Autonomous Resolution currently has consequential provider executions with:

- known external resource usage;
- no pre-boundary immutable execution authority identity;
- no exact R18 binding attachment;
- post-response result persistence.

Therefore it is a concrete implementation surface that Package 02A must migrate to the envelope/binding model.

## 18. Disposition

`AUTONOMOUS_RESOLUTION_M4_TRACE = RESOLVED_AT_PROVIDER_ATTEMPT_LAYER`

`EVERY_CURRENT_RESOLUTION_METHOD_PROVIDER_CALL_C1 = YES`

`AUTONOMOUS_RESOLUTION_ADVANCE = M2_CONTAINER`

`RUN_WORKER = M1_EXACT_PROVIDER_ATTEMPT`

`PRE_BOUNDARY_ATTEMPT_IDENTITY = ABSENT`

`POST_HOC_RESEARCH_RUN_CANNOT_PROVE_AUTHORITY = YES`

`WATCH_FOR_DELTA_MODEL_CALL != LOCAL_WATCH_PERIODIC_CHECK`

`RESULT_ADOPTION_C2 = TRANSITION_SPECIFIC / UNRESOLVED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_M4_TRACE = APIFY_PUBLIC_METADATA_OR_ZERO_CASH_TELEMETRY_OR_COMMERCIAL_OUTBOUND_FLOW`
