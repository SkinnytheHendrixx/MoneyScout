# Representation Package 02A — WATCH Direct Implementation / R20 Boundary Verification

**Status:** DIRECT VERIFICATION / IMPLEMENTATION CLAIMS CONFIRMED / C2 REMAINS SOURCE-UNRESOLVED  
**Parent trace:** `PACKAGE_02A_WATCH_REVALIDATION_M4_TRACE_ADJUDICATION.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact directly verifies the two load-bearing current-code claims in the WATCH trace and rechecks the unresolved WATCH-reactivation C2 question against canonical R20.

It does not infer a boundary classification from similarity or intuition.

## 2. Direct implementation source

Verified live file:

`artifacts/api-server/src/lib/portfolio-reconciler.ts`

Blob:

`745a7d48bb7f0bd0c3402b58eacaf9d3579f381a`

## 3. Current periodic WATCH check — direct verification

`materialDiscoveryDelta(...)` receives:

- stored Watch baseline;
- already-persisted Discovery candidate;
- current local time.

It compares:

- baseline latest snapshot ID versus current persisted candidate source-snapshot IDs;
- baseline occurrence count versus current persisted occurrence count;
- candidate `primaryAnomalyType` / `anomalyTags` for `MATERIAL_SNAPSHOT_CHANGE`.

It returns local `WatchTriggerEvidence` only when:

1. a newer persisted observation exists; and
2. Discovery has already classified that observation as material.

Direct source scan of the complete `portfolio-reconciler.ts` found:

`fetch() CALLS = 0`

`Anthropic/model/provider-client CALLS = 0`

Therefore the current WATCH comparator itself performs no external provider/network/model execution.

## 4. C1 confirmation

Current R7 states:

> Truly non-scarce, locally proven zero-resource operations do not need artificial reservations.

The current periodic WATCH check is exactly such a local persisted-state comparison.

Therefore the prior determination is directly confirmed:

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

`CURRENT_WATCH_PERIODIC_CHECK_R7_RESERVATION = NOT_REQUIRED`

This determination applies only to the current local comparator.

It does not classify the upstream Discovery refresh that created the newer snapshot.

It does not classify future active polling adapters.

## 5. reactivateWatch() — direct verification

Direct live code confirms `reactivateWatch(...)` performs the following sequence:

1. update `watch_registrations`:
   - status → `TRIGGERED`;
   - `lastCheckedAt`;
   - `nextCheckAt = null`;
   - `triggeredAt`;
   - exact `triggerEvidence`;
   - increment check count;

2. call `startNewEvaluationCycle(...)` with:
   - trigger type `WATCH_MATERIAL_SIGNAL_CHANGE`;
   - trigger reason from exact evidence;
   - trigger metadata from exact evidence;

3. update Opportunity:
   - verdict → `RESEARCH`;
   - policy status → `UNKNOWN`;
   - kill reason → null;

4. update runtime activity:
   - active Evaluation Cycle → new cycle;
   - activity → `RESEARCH_QUEUED`;
   - next action → fresh Research against material delta;

5. record lifecycle event:
   - `WATCH_REACTIVATED_TO_RESEARCH`.

This is an authoritative lifecycle/workflow mutation, not passive observation.

## 6. Downstream external work remains separate

The reactivation function itself does not execute fresh Research.

It queues the next Research stage.

Any later Research provider/model/search execution remains a distinct downstream attempt governed by its own C1/C2 classification and exact envelope.

Therefore:

`WATCH_REACTIVATION != DOWNSTREAM_RESEARCH_PROVIDER_ATTEMPT`

and downstream scarce execution cannot be used as the reason to assign the WATCH local check an envelope.

## 7. Direct R20 verification

Current landed R20 blob:

`abd865614ee70cc35b6068b46626ef306d100080`

R20 directly states under `ADOPTION_VALIDATION`:

> After an external operation has executed, the result may still require a separate current-eligibility check before Money Scout adopts that result into authoritative state, customer-visible behavior, financial release, lifecycle transition, or another consequential downstream state.

R20 also requires a durable Boundary Registry identifying consequential boundary classes.

However, R20 explicitly preserves as source gaps:

- exact Boundary Registry schema/field names;
- exact boundary-decision schema;
- **exact boundary class names beyond the recovered three-phase semantics**.

R20's forward-governance section further says that new or materially changed provider/customer dispatch, release, commercial, financial-adoption, headroom-release, **lifecycle**, handoff, or other consequential surfaces must be reviewed for applicability; it does not state that every lifecycle mutation is consequential.

## 8. Consequence for WATCH C2 classification

The current evidence proves:

- WATCH reactivation is a lifecycle transition;
- R20 says lifecycle transitions can be within adoption/consequential review scope;
- R20 does **not** recover a historical Boundary Registry entry specifically classifying `WATCH_MATERIAL_SIGNAL_CHANGE → RESEARCH`;
- R20 does **not** say every internal lifecycle transition is automatically C2.

Therefore neither direction is currently source-authoritative.

We cannot freeze:

`WATCH_REACTIVATION_C2 = YES`

and we cannot freeze:

`WATCH_REACTIVATION_NOT_C2 = YES`.

Correct state remains:

`WATCH_REACTIVATION_C2 = SOURCE_UNRESOLVED / REQUIRES_GOVERNED_PRESENT_DAY_CLASSIFICATION`

## 9. Reviewer's directional hypothesis

A reviewer proposed that WATCH reactivation is likely NOT_C2 because:

- it is internal workflow routing;
- it does not itself dispatch externally;
- it does not itself consume scarce resource;
- it queues fresh Research, whose later consequential execution is separately governed.

This is a reasonable design hypothesis.

But it is not historical R20 authority because exact boundary-class membership is explicitly unrecovered.

The hypothesis may be considered during governed present-day Boundary Registry design.

It must not be mislabeled as recovered historical fact.

## 10. Required present-day adjudication test

When the corrected Boundary Registry is designed, WATCH reactivation must be classified explicitly using:

1. consequence of the lifecycle mutation itself;
2. whether changing verdict/cycle/policy state directly authorizes, releases, cancels, invalidates, or otherwise materially changes another governed authority;
3. whether downstream Research remains independently gated before any consequential external attempt;
4. whether failure to gate the reactivation itself can create a consequential effect before that downstream gate;
5. whether exact trigger-evidence provenance is required for the lifecycle transition.

If the answers establish that reactivation is only conservative internal routing and all consequential effects remain separately gated, a governed present-day `NOT_C2` classification may be appropriate.

If the lifecycle transition itself changes consequential authority/effect, it must receive an adoption boundary class.

## 11. Attack on false inference from named examples

R20's named/recovered examples are not an exhaustive allowlist.

The fact that provider dispatch, charge, production release, financial adoption, handoff, etc. are named does not prove unnamed lifecycle transitions are outside R20.

Conversely, R20's mention of lifecycle transitions as possible adoption targets does not prove every lifecycle transition is consequential.

Therefore:

`EXAMPLE_PATTERN_INFERENCE != BOUNDARY_REGISTRY_CLASSIFICATION`

## 12. Final direct-verification disposition

`PORTFOLIO_RECONCILER_LIVE_SOURCE_VERIFIED = YES`

`MATERIAL_DISCOVERY_DELTA_LOCAL_ONLY = CONFIRMED`

`PORTFOLIO_RECONCILER_EXTERNAL_CALLS = 0`

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

`REACTIVATE_WATCH_MUTATION_SEQUENCE = CONFIRMED`

`WATCH_REACTIVATION_QUEUES_BUT_DOES_NOT_EXECUTE_RESEARCH = CONFIRMED`

`R20_LIFECYCLE_TRANSITION_POTENTIAL_SCOPE = CONFIRMED`

`R20_EXACT_BOUNDARY_CLASS_NAMES = SOURCE_UNRESOLVED`

`WATCH_REACTIVATION_C2 = SOURCE_UNRESOLVED`

`WATCH_REACTIVATION_NOT_C2 = NOT_YET_AUTHORIZED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
