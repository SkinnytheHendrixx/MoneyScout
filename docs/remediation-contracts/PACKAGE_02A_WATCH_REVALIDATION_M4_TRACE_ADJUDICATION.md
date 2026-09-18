# Representation Package 02A — WATCH / Revalidation M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / CURRENT WATCH CHECK C1 RESOLVED NON-SCARCE / C2 REACTIVATION CLASSIFICATION UNRESOLVED  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

How should R7-A1's named `WATCH/revalidation work` category map into the Execution Authority Envelope inventory?

The current implementation must be separated into:

1. creation of a WATCH obligation;
2. periodic local check of already-persisted state;
3. observation of a material delta;
4. adoption of that delta into authoritative lifecycle state;
5. fresh downstream Research/Validation/provider work triggered afterward.

These are not one execution attempt.

## 2. Current WATCH registration

Current Autonomous Resolution can return:

`WATCH_FOR_DELTA + ACTIVE_MONITORING`

with concrete `watchTriggers`.

The lifecycle route records:

`WATCH_PENDING_REGISTRATION`

and the Portfolio Reconciler creates a durable `watch_registrations` row containing:

- trigger descriptions;
- baseline;
- status;
- registration time;
- next check time;
- trigger evidence;
- check count.

This registration step does not itself call an external provider.

Therefore:

`WATCH_REGISTRATION = LOCAL_CONTROL_STATE`

and not an exact provider attempt.

No envelope is required merely to persist the monitoring obligation.

## 3. Current periodic WATCH check

Current `portfolio-reconciler.ts` performs the active WATCH check by reading already-persisted local state:

- current `discovery_candidates`;
- stored watch baseline;
- source snapshot IDs;
- occurrence count;
- anomaly type/tags.

`materialDiscoveryDelta(...)` compares:

- prior snapshot/occurrence baseline;
- current persisted candidate state;
- whether Discovery already classified the new observation as `MATERIAL_SNAPSHOT_CHANGE`.

The check itself performs no provider/API/network dispatch.

## 4. C1 determination for current periodic check

R7 states:

> Truly non-scarce, locally proven zero-resource operations do not need artificial reservations.

The current WATCH comparison is a local database computation over already-persisted data.

Therefore:

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

and:

`CURRENT_WATCH_PERIODIC_CHECK_R7_RESERVATION = NOT_REQUIRED`

This conclusion applies to the current comparator only.

If a future WATCH implementation actively polls an external provider, search API, telemetry adapter, model, or other scarce resource, that external revalidation attempt must be classified independently and may be C1.

## 5. Source observation versus WATCH check

The current WATCH comparator does not itself create the external/new observation it compares.

It consumes a newer persisted Discovery candidate/snapshot that was produced elsewhere.

Therefore:

`WATCH_CHECK != DISCOVERY_OBSERVATION_ATTEMPT`

If the upstream Discovery refresh that produced the new snapshot was consequential under C1/C2, that upstream attempt owns its own envelope.

The WATCH comparator must reference/reuse the exact source evidence/provenance rather than manufacture a second envelope for the same external observation.

This is another EAE-A7 de-duplication case.

## 6. Current trigger/adoption behavior

When `materialDiscoveryDelta(...)` returns trigger evidence, `reactivateWatch(...)` currently:

- marks the watch `TRIGGERED`;
- persists trigger evidence;
- starts a new Evaluation Cycle with trigger type `WATCH_MATERIAL_SIGNAL_CHANGE`;
- changes the Opportunity verdict to `RESEARCH`;
- resets policy status to `UNKNOWN`;
- queues fresh Research;
- records lifecycle events.

This is more than passive observation.

It adopts the detected material delta into authoritative workflow/lifecycle state.

## 7. C2 determination for WATCH reactivation

R20 states that after external truth/result exists, adoption into authoritative state, customer-visible behavior, financial release, **lifecycle transition**, or another consequential downstream state may require separate `ADOPTION_VALIDATION`.

However, the current recovered R20 record does not establish that:

`WATCH_MATERIAL_SIGNAL_CHANGE → new Evaluation Cycle / verdict RESEARCH`

is itself a registered consequential Boundary Registry class.

Therefore:

`WATCH_REACTIVATION_C2 = UNRESOLVED_BOUNDARY_REGISTRY_CLASSIFICATION`

It is not safe to declare:

`NOT_C2 = YES`

merely because the mutation is conservative/restrictive.

Likewise, it is not safe to invent a mandatory adoption envelope absent a registered/confirmed R20 boundary classification.

## 8. Resulting M4 disposition

WATCH cannot yet move wholesale to M3.

The category splits as follows:

### WATCH registration
`LOCAL_CONTROL_STATE / NO_ENVELOPE_BY_ITSELF`

### Current local periodic comparison
`C1 = NON_SCARCE_PROVEN`

### Material-delta observation
owned by the upstream Discovery/evidence producer; no duplicate WATCH envelope

### WATCH lifecycle reactivation
`C2 = UNRESOLVED`

### Fresh Research/Validation after reactivation
downstream concrete provider attempts receive their own envelopes under their existing C1/C2 mappings.

Therefore:

`WATCH_REVALIDATION = PARTIALLY_RESOLVED_M4`

## 9. Future active polling

A future WATCH may monitor a trigger by actively calling:

- external APIs;
- web search;
- telemetry providers;
- LLM/model providers;
- account/provider state;
- price/reliability endpoints.

Each such polling execution is a new exact revalidation attempt.

If it consumes scarce resources:

`C1 = YES → NEW ENVELOPE`

If it crosses another registered consequential boundary:

`C2 = YES → NEW ENVELOPE`

The persistent Watch Registration remains the logical monitoring obligation/container and must not itself substitute for those exact attempt identities.

## 10. Observation / verification / adoption test applied

WATCH contains all three possible layers:

1. **observation** — upstream Discovery/provider/evidence system obtains new fact;
2. **verification/comparison** — WATCH locally determines whether persisted delta satisfies configured trigger;
3. **adoption** — Money Scout may alter lifecycle state and reopen Research based on the trigger.

The current implementation has:

- layer 1 outside WATCH;
- layer 2 local/non-scarce;
- layer 3 present, but R20 C2 classification unresolved.

This is exactly why a one-label `WATCH` classification would be unsafe.

## 11. New attack fixtures

### WAT-A1 — duplicate source envelope
Discovery external refresh creates E1. WATCH later reads the resulting snapshot and creates E2 for the same observation merely because it detects the delta.

Must fail.

### WAT-A2 — external polling hidden as local watch
Future WATCH adapter calls an external API but is classified non-scarce because the Portfolio Reconciler wrapper itself is local.

Must fail.

### WAT-A3 — trigger adoption assumed non-consequential
Material delta starts a new authoritative lifecycle transition, but system declares NOT_C2 without Boundary Registry evidence.

Must fail classification.

### WAT-A4 — trigger adoption assumed consequential without authority
System creates an adoption envelope merely because any verdict/state field changed, despite no registered consequential boundary.

Must fail over-classification.

### WAT-A5 — stale source substitution
WATCH detects a change using a current candidate row but loses exact source snapshot/provenance that actually triggered the delta.

Must fail evidence identity.

### WAT-A6 — fresh research inherits WATCH identity
WATCH reactivation queues Research, and later provider research reuses the WATCH registration/check identity instead of creating exact provider-attempt envelopes.

Must fail.

### WAT-A7 — repeated trigger collapse
One watch can observe multiple material changes over time. A later active polling/provider attempt or lifecycle reactivation must not overwrite historical trigger identity.

## 12. R3 relationship

R3 owns policy-relative evidence freshness.

WATCH does not manufacture freshness by seeing that a row changed.

A WATCH trigger may justify opening a new Evaluation Cycle or collecting new evidence, but:

- prior evidence remains historical;
- the new source observation must retain exact temporal provenance;
- fresh downstream decisions must apply R3 policy independently.

WATCH registration/check identity is not a freshness certificate.

## 13. R7 relationship

Current local WATCH comparison is reservation-free because it is non-scarce.

A burst of actual revalidation/provider work triggered by WATCH remains R7-governed.

R7 already freezes:

> a wave of legitimate revalidation work after recovery does not bypass aggregate reservation merely because every trigger is correct.

Therefore correct WATCH triggering creates no resource authority for downstream work.

## 14. Coverage-map update

Replace:

`WATCH_REVALIDATION = M4_NOT_YET_MAPPED`

with:

`WATCH_REGISTRATION = M2_LOCAL_MONITORING_OBLIGATION`

`CURRENT_WATCH_LOCAL_CHECK = M3_C1_SIDE_ONLY / NON_SCARCE_PROVEN`

`CURRENT_WATCH_LOCAL_CHECK_NOT_C2 = NOT_YET_PROVEN`

`UPSTREAM_DISCOVERY_OBSERVATION = REFERENCE_EXISTING_SOURCE_ATTEMPT/EVIDENCE`

`WATCH_REACTIVATION = M4_PENDING_C2_BOUNDARY_REGISTRY_CLASSIFICATION`

`DOWNSTREAM_FRESH_RESEARCH = EXISTING_M1/M2 RESEARCH MAPPING`

The full WATCH category remains M4 until the reactivation boundary is classified.

## 15. What is required to close WATCH M4

Before WATCH can be fully mapped:

1. inspect/recover the applicable R20 Boundary Registry classification for WATCH-triggered lifecycle reactivation, if present;
2. determine whether `WATCH_MATERIAL_SIGNAL_CHANGE` / new Evaluation Cycle / verdict reset is a registered C2 boundary;
3. if C2, define the exact adoption envelope and predecessor/source-evidence linkage;
4. if NOT_C2, record explicit evidence sufficient to freeze `NOT_C2 = YES`;
5. inventory any future/current active external WATCH adapters separately.

## 16. Disposition

`WATCH_M4_TRACE = PARTIALLY_RESOLVED`

`WATCH_REGISTRATION_ENVELOPE = NO`

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

`CURRENT_WATCH_PERIODIC_CHECK_R7_RESERVATION = NOT_REQUIRED`

`WATCH_SOURCE_OBSERVATION_DUPLICATE_ENVELOPE = PROHIBITED`

`WATCH_REACTIVATION_C2 = UNRESOLVED`

`WATCH_FULL_M3_EXCLUSION = NOT_AUTHORIZED`

`FRESH_DOWNSTREAM_RESEARCH_REQUIRES_OWN_ATTEMPT_ENVELOPES = YES`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = R20_BOUNDARY_REGISTRY_CLASSIFICATION_FOR_WATCH_REACTIVATION_OR_NEXT_M4_TRACE`
