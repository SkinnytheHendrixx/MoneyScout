# Representation Package 02A — All-Call-Site Ledger Candidate 1

**Status:** CALL-SITE LEDGER CANDIDATE / 54-SURFACE FLOOR / RECURSIVE SELF-CALL TRACING INCLUDED / NOT YET CLOSURE CERTIFICATION  
**Controlled by:** Consolidated Surface Map + Corrections 1–4  
**Implementation authority:** SUSPENDED

## 1. Purpose

This ledger is the current explicit mapping from known live/future execution surfaces to:

- concrete source/call site;
- internal vs external boundary;
- exact S-number;
- M1/M2/M3/M4 role;
- C1 status;
- C2 status;
- pre-boundary identity class;
- exact attempt/adoption owner;
- predecessor/target identity where applicable;
- retry/cardinality;
- evidence status.

It is intentionally not a prose summary.

## 2. Identity classes

Use only:

- `NONE` — no durable pre-boundary logical/attempt identity;
- `LOGICAL_STATE_ONLY` — durable container/logical state exists before boundary, but not exact compliant attempt authority;
- `EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY` — one exact attempt-like durable row exists before boundary, but R18/R7/R20 authority attachments remain incomplete;
- `FULL_ENVELOPE_COMPLIANT` — exact pre-boundary Execution Authority Envelope and required attachments exist.

Current live implementation has no surface in `FULL_ENVELOPE_COMPLIANT`.

## 3. Evidence status

- `DIRECT` — source sequence directly inspected during Package 02A review;
- `DIRECT_PRIOR` — source directly inspected earlier in this same audit chain and preserved by immutable trace artifact;
- `CONSOLIDATED` — carried from verified Package-02A consolidation/correction artifacts;
- `CONTRACT_ONLY` — canonical contract obligation; current implementation absent;
- `BOUNDARY_UNRESOLVED` — execution/result exists but exact C2 Boundary Registry class remains open.

## 4. External/provider execution and adoption ledger

| Row | Surface | Source / function | Operation | Boundary | M | C1 | C2 | Pre-boundary identity | Exact owner / target | Cardinality / retry | Evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| L001 | S01 Builder Gateway provider execution | `builder-gateway.ts` / Gateway execution path | provider build execution | external provider | M1 | YES | YES provider dispatch | EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY | E_builder_gateway | new dispatch/new E | CONSOLIDATED |
| L002 | S02 Builder Workspace | `builder-workspace-worker.ts` | orchestration/delegation | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | child S01/S50/S51 | 1:N | CONSOLIDATED |
| L003 | S03 Builder repository adoption | Builder result finalization path | adopt code result into authoritative repo | internal C2 adoption | M1 | local | YES | NONE/needs adoption identity | predecessor E_builder_dispatch | one adoption per exact result | DIRECT_PRIOR |
| L004 | S04 QA dispatch | `qa-debug-worker.ts` → adapter dispatch | QA provider execution | external provider | M1 | YES/unknown exact meter by provider | YES | LOGICAL_STATE_ONLY | E_qa_dispatch | retries = new E | CONSOLIDATED |
| L005 | S05 remediation repair | `asset-remediation-worker.ts` → Builder repair dispatch | repair provider execution | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_repair | retries distinct | DIRECT_PRIOR |
| L006 | S06 remediation QA | `asset-remediation-worker.ts` → QA dispatch | QA provider execution | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_remediation_qa | retries distinct | DIRECT_PRIOR |
| L007 | S07 controlled-release preview | `controlled-release-worker.ts` → release adapter dispatch | preview deployment | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_release_preview | retries distinct | DIRECT_PRIOR |
| L008 | S08 controlled-release production | `controlled-release-worker.ts` → release adapter dispatch | production deployment | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_release_prod | retries distinct | DIRECT_PRIOR |
| L009 | S09 remediation preview release | `asset-remediation-worker.ts` | preview release child | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_rem_preview | retries distinct | CONSOLIDATED |
| L010 | S10 remediation production release | `asset-remediation-worker.ts` | prod release child | external provider | M1 | provider-resource | YES | LOGICAL_STATE_ONLY | E_rem_prod | retries distinct | CONSOLIDATED |
| L011 | S11 execution_jobs | generic execution queue/worker | orchestration only | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | downstream child | 0..N | CONSOLIDATED |
| L012 | S12 Validation Evidence Collector | `validation-evidence-collector.ts` | Anthropic + web search | external provider | M1 | YES, bounded cost | provider dispatch | NONE unless exact row proven otherwise | E_validation_collect | one provider call per execution | DIRECT_PRIOR |
| L013 | S13 Kill-Risk Collector | `kill-risk-collector.ts` | Anthropic + web search | external provider | M1 | YES, bounded cost | provider dispatch | NONE unless exact row proven otherwise | E_killrisk | one provider call per execution | DIRECT_PRIOR |
| L014 | S14 Research orchestration | `research.ts`, research execution engine | stage sequencing | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | S52/S53/S54/S13/etc. | 0..N | DIRECT |
| L015 | S15 Validation orchestration | `validation.ts` | evidence/experiment/resolution sequencing | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | S12/S16-S18/experiment | 0..N | DIRECT |
| L016 | S16 Autonomous Resolution advance | `executeAutonomousResolutionAdvance` | method loop | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | S17 children | up to configured N | DIRECT_PRIOR |
| L017 | S17 Autonomous Resolution worker | `routes/autonomous-resolution.ts::runWorker` | Anthropic `client.parse` | external provider | M1 | YES | provider dispatch | NONE | E_resolution_worker | each provider call new E | DIRECT |
| L018 | S18 Autonomous Resolution lifecycle adoption | `applyResolutionLifecycleOutcome` | WATCH/exhaustion/completion/etc. | internal adoption | M1 if C2 | local | TRANSITION-SPECIFIC | NONE/adoption object absent | predecessor S17 result | per transition | BOUNDARY_UNRESOLVED |
| L019 | S19 R5 confirmer execution | no compliant current implementation | future confirmation execution | future | conditional | conditional | conditional | NONE | E_r5_confirmer | per future attempt | CONTRACT_ONLY |
| L020 | S20 R5 Confirmation Result | R5 authority object | historical confirmation result | internal authority object | not automatic M1 | local | NOT ESTABLISHED | n/a | references exact confirmer E | no duplicate E | CONTRACT_ONLY |
| L021 | S21 R6 active verifier | no unified compliant current implementation | future verifier probe | future/provider | conditional | conditional | conditional | NONE | E_r6_verifier | per verifier attempt | CONTRACT_ONLY |
| L022 | S22 existing execution reused as R6 proof | `asset-factory.ts` repository provision success | reuse provider result as proof | internal reference | no new M1 | original attempt | no new C2 by proof alone | source-dependent | references S47 E | no duplicate E | DIRECT_PRIOR |
| L023 | S23 R6 Verification Result | R6 authority object | historical verification result | internal authority object | no automatic M1 | local | NOT ESTABLISHED | n/a | references exact source E | no duplicate E | CONTRACT_ONLY |
| L024 | S24 WATCH registration | `watch_registrations` creation | monitoring obligation | internal | M2 | local | no by registration alone | LOGICAL_STATE_ONLY | future watch operations | one registration may trigger N checks | DIRECT_PRIOR |
| L025 | S25 WATCH periodic comparator | `portfolio-reconciler.ts::materialDiscoveryDelta` | local persisted-state comparison | local | M3-like local op, not full category exclusion | NON_SCARCE_PROVEN | NOT C2 for comparator itself | n/a | none | repeated local checks | DIRECT |
| L026 | S26 WATCH source observation | upstream Discovery evidence | reference upstream truth | observation reference | no new M1 | upstream-owned | no duplicate | upstream-owned | S49 / discovery evidence | many upstream observations | CONSOLIDATED |
| L027 | S27 WATCH reactivation | `reactivateWatch` | trigger new cycle + RESEARCH state | internal lifecycle adoption | conditional M1 | local | UNRESOLVED | NONE | watch registration / exact evidence | per trigger | DIRECT |
| L028 | S28 fresh Research after WATCH | Research routes/workers | downstream provider work | internal wrapper to external children | M2→M1 children | child-owned | child-owned | child-specific | S52/S53/S54/S13 etc. | 0..N | CONSOLIDATED |
| L029 | S29 ZERO_CASH telemetry collection | `asset-economics-worker.ts::syncAssetTelemetry` → adapter.collect | telemetry HTTP POST | external provider | M4/M1 if in scope | RESOURCE_UNKNOWN | provider boundary if registered | NONE | E_telemetry_collect | repeated scheduled attempts | DIRECT |
| L030 | S30 telemetry provider truth | adapter response | external observation set | external truth | no new attempt | n/a | observation | linked to S29 | exact S29 result set | 1 response→N observations | DIRECT_PRIOR |
| L031 | S31 telemetry FACT adoption | `recordAssetObservation(... FACT)` | mutate Asset aggregates | internal adoption | M1 | local | YES | NONE | predecessor S29 truth | batch/fine-grain PAIM open | DIRECT |
| L032 | S32 Apify experiment metadata GET | `apify-experiment-adapters.ts` | public Store GET | external provider | M4 | NON_SCARCE_NOT_PROVEN | unresolved | LOGICAL_STATE_ONLY via S33 | E_experiment_get if in scope | bounded GET attempt | DIRECT |
| L033 | S33 Experiment execution identity | `experiment-execution.ts` | mark Experiment RUNNING then execute | internal pre-boundary state | M2/attempt scaffold | child C1 | child C2 | LOGICAL_STATE_ONLY | S32 execution | one row/attempt candidate | DIRECT |
| L034 | S34 experiment evidence/validation adoption | `experiment-execution.ts` evidence insert + reassessment | authoritative underwriting evidence | internal adoption | conditional M1 | local | UNRESOLVED | NONE | predecessor S32 | per execution/result | BOUNDARY_UNRESOLVED |
| L035 | S35 Commercial activation | `commercial_activations` | workflow/authority container | internal wrapper | M2 | child-owned | child-owned | LOGICAL_STATE_ONLY | S36/S38/S39/S42/S43 | multi-stage | DIRECT |
| L036 | S36 commercial prepare | `commercial-activation-worker.ts` → adapter.prepare | create disabled checkout | external provider | M1 | RESOURCE_UNKNOWN/zero cash only | YES | LOGICAL_STATE_ONLY | E_commercial_prepare | retry→new E | DIRECT |
| L037 | S37 customer-charging authority | `authorizeCommercialBoundary` | authority state mutation | internal authority | not automatic M1 | local | classification separate | LOGICAL_STATE_ONLY | consumed by S38 | grant lifecycle | DIRECT |
| L038 | S38 commercial activate | `commercial-activation-worker.ts` → adapter.activateAndVerify | enable transaction-ready checkout | external provider | M1 | RESOURCE_UNKNOWN/zero cash only | YES | LOGICAL_STATE_ONLY | E_commercial_activate | retry→new E | DIRECT |
| L039 | S39 commercial activation adoption | `completeVerifiedActivation` | ACTIVE + transactionReady + Asset OPERATING | internal adoption | M1 | local | YES | NONE | predecessor S38 result | per successful activation result | DIRECT |
| L040 | S40 preparation-result adoption | store disabled checkout ref / AWAITING authority | internal adoption | conditional M1 | local | UNRESOLVED | NONE | predecessor S36 | per prepare result | BOUNDARY_UNRESOLVED |
| L041 | S41 customer/provider payment transaction | external checkout/customer/provider | actual payment transaction | external event outside current Money Scout dispatch | external identity | provider-owned | provider/customer consequential | provider-owned | providerTransactionId | per transaction | DIRECT_PRIOR |
| L042 | S42 payment-provider event observation | `ingestAuthoritativePaymentEvent` input / `payment_provider_events` | signed provider event truth | external observation | no duplicate M1 | n/a | observation | event row after receipt | exact provider transaction | many events/transaction possible | DIRECT |
| L043 | S43 payment financial adoption | `ingestAuthoritativePaymentEvent` → FACT observations | revenue/transaction/reversal accounting | internal adoption | M1 | local | YES | NONE | S42 event / exact transaction | per adopted event/result | DIRECT |
| L044 | S44 reconciliation orchestrators | execution/bet/human/portfolio reconcilers | local coordination | internal wrapper | M2 | local unless child call | child-specific | LOGICAL_STATE_ONLY | children incl. S50 | repeated | DIRECT |
| L045 | S45 Asset economics/operations wrapper | asset economics/operations workers | local control/accounting | internal wrapper | M2 | child-specific | child-specific | LOGICAL_STATE_ONLY | S29/S31/S46/S48 | repeated | DIRECT |
| L046 | S46 Build/Release cost FACT adoption | `asset-operations-worker.ts::recordActivationCosts` | adopt job cost into Asset totalObservedCost | internal adoption | M1 | local | YES | NONE | exact Build/Release source + contributing attempt set | one idempotent adoption/source row; arbitrary-N contributors possible | DIRECT |
| L047 | S47 Repository provisioning | `asset-factory.ts::provisionRepository` → provisioner.provision | create private repository | external provider | M1 | provider/resource | YES | LOGICAL_STATE_ONLY | E_repo_provision | retry/writer audit open | DIRECT |
| L048 | S48 Asset health probe | `asset-operations-worker.ts::probeAssetHealth` | GET production URL | external request | M4 | NON_SCARCE_NOT_PROVEN | probe observation; adoption unresolved | NONE | E_health_probe if in scope | recurring arbitrary-N | DIRECT |
| L049 | S48 health-result application | same worker after probe | health/status/incident/opportunity mutation | internal adoption | conditional M1 | local | UNRESOLVED | NONE | predecessor exact health result | per probe result | BOUNDARY_UNRESOLVED |
| L050 | S49 Discovery Store acquisition | `discovery.ts::fetchApifyStorePage` | paginated Apify Store GET | external provider | M4 | NON_SCARCE_NOT_PROVEN | result/adoption unresolved | LOGICAL_STATE_ONLY via Discovery run/pass | E_discovery_request if in scope | arbitrary-N pages/retries | DIRECT |
| L051 | S50 Builder status poll | `builder-workspace-worker.ts` → adapter.getStatus | GET provider run status | external provider | M4 | RESOURCE_UNKNOWN | observation; result apply unresolved | NONE exact poll identity | E_poll→exact E_original | repeated polls | DIRECT |
| L052 | S50 QA status poll | `qa-debug-worker.ts` → adapter.getStatus | GET QA run status | external provider | M4 | RESOURCE_UNKNOWN | observation; result apply unresolved | NONE exact poll identity | E_poll→exact E_qa | repeated polls | DIRECT |
| L053 | S50 QA-repair status poll | `qa-debug-worker.ts` → Builder getStatus(repairRun) | GET repair status | external provider | M4 | RESOURCE_UNKNOWN | observation; result apply unresolved | NONE | E_poll→exact E_repair | repeated polls | DIRECT |
| L054 | S50 Release-preview poll | `controlled-release-worker.ts` → adapter.getStatus | GET preview status | external provider | M4 | RESOURCE_UNKNOWN | observation; result apply unresolved | NONE | E_poll→exact E_preview | repeated polls | DIRECT |
| L055 | S50 Release-production poll | `controlled-release-worker.ts` → adapter.getStatus | GET production status | external provider | M4 | RESOURCE_UNKNOWN | observation; result apply unresolved | NONE | E_poll→exact E_prod | repeated polls | DIRECT |
| L056 | S51 Builder cancellation | `builder-workspace-worker.ts` → adapter.cancel | external cancel POST | external provider mutation | M1 | provider/resource | YES | NONE exact cancel identity | E_cancel→exact E_original | each cancel dispatch distinct | DIRECT |
| L057 | S52 Policy source-page GET | `policy-checks.ts::fetchPublicText` | first-party HTTP GET | external request | M4 | NON_SCARCE_NOT_PROVEN | observation | NONE | E_policy_http if in scope | one per URL/redirect hop | DIRECT |
| L058 | S52 Policy discovered/default document GETs | `retrievePolicyDocuments`→`fetchPublicText` | additional /terms/privacy/robots/discovered GETs | external request | M4 | NON_SCARCE_NOT_PROVEN | observation | NONE | E_policy_http_N | arbitrary-N bounded | DIRECT |
| L059 | S53 Policy Anthropic analysis | `policy-checks.ts` → `anthropic.messages.create` | model + possible web_search | external provider | M1 | YES bounded | provider dispatch | NONE | E_policy_analysis | one model request/check | DIRECT |
| L060 | S53 Policy result application | same route DB transaction | evidence FACTs + Opportunity policyStatus | internal adoption | conditional M1 | local | UNRESOLVED | NONE | predecessor S53 result + S52 evidence | per policy analysis | BOUNDARY_UNRESOLVED |
| L061 | S54 Demand Anthropic analysis | `demand-checks.ts` → `messagesClient.parse` | model + web_search | external provider | M1 | YES bounded | provider dispatch | LOGICAL_STATE_ONLY | researchRuns(DEMAND_CHECK) → E_demand | one provider request/run | DIRECT |
| L062 | S54 Demand result application | Demand result/evidence persistence | authoritative demand evidence | internal adoption | conditional M1 | local | UNRESOLVED | logical run exists, no adoption E | predecessor S54 result | per Demand run | BOUNDARY_UNRESOLVED |

## 5. Internal loopback / local exclusions

These rows are explicitly **not** external provider attempts at the transport layer. Recursive target tracing remains mandatory.

| Row | Exclusion | Source | Transport | Classification | Recursive target |
|---|---|---|---|---|---|
| I001 | ILE-01 Experiment → Validation reassessment | `experiment-execution.ts::runValidationReassessment` | current-origin HTTP | INTERNAL_ORCHESTRATION | target Validation → S12/S15/S16–S18 as applicable |
| I002 | ILE-02 Candidate → Research kickoff | `candidate-research-handoff.ts` | current-origin HTTP | INTERNAL_ORCHESTRATION | target Research → S14 + S52/S53/S54/S13 |
| I003 | ILE-03 Research → Validation kickoff | `research.ts::startAutonomousValidation` | current-origin HTTP | INTERNAL_ORCHESTRATION | target Validation → S15/S12/etc. |
| I004 | ILE-04 Research → Resolution kickoff | `research.ts::startAutonomousResolution` | current-origin HTTP | INTERNAL_ORCHESTRATION | target S16→S17/S18 |
| I005 | ILE-05a Research → Policy Check | `research.ts::runInternalStage("policy-checks")` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | recurse to S52 + S53 |
| I006 | ILE-05b Research → Demand Check | `research.ts::runInternalStage("demand-checks")` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | recurse to S54 |
| I007 | ILE-05c Research → Kill-Risk | `research.ts::runInternalStage("kill-screen/collect")` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | recurse to S13 |
| I008 | ILE-06a Validation → Evidence Collection | `validation.ts` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | recurse to S12 |
| I009 | ILE-06b Validation → Experiment Planning | `validation.ts::runExperimentPlanningStage` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | deterministic planner + ILE-08 |
| I010 | ILE-06c Validation → Resolution | `validation.ts::startAutonomousResolution` | current-origin HTTP | INTERNAL_TRANSPORT_ONLY | recurse to S16→S17/S18 |
| I011 | ILE-07 Execution Reconciler plan reads | `execution-reconciler.ts::readPlan` | localhost HTTP | INTERNAL_CONTROL | local plan read; no provider |
| I012 | ILE-08 Experiment planner → Validation Plan | `experiment-plans.ts::readValidationPlan` | current-origin HTTP | INTERNAL_CONTROL | deterministic `chooseCheapestFalsifyingExperiment` |
| I013 | Experiment planner computation | `experiment-planner.ts::chooseCheapestFalsifyingExperiment` | no network | LOCAL_NON_PROVIDER_COMPUTATION | later execution remains S32/S33 |

## 6. Known provider-result application review queue

The following result-application paths remain explicit Boundary Registry work rather than silently classified:

1. Builder provider terminal/challenge application;
2. QA PASS/FAIL/defect application;
3. repair result application;
4. Release preview result application;
5. Release production result application;
6. health-result adoption;
7. WATCH reactivation;
8. Autonomous Resolution lifecycle outcomes;
9. experiment evidence/Validation reassessment;
10. disabled-checkout preparation-result adoption;
11. Policy result adoption;
12. Demand result adoption.

No row may be dropped from this queue merely because the underlying provider attempt already has an S-number.

## 7. Exact-target requirements

### Polls

Every S50 row requires:

`E_poll → exact frozen {provider, provider_account, providerRunId, E_original}`.

Response application must prove:

`POLL_RESPONSE_TARGET == EXACT_FROZEN_TARGET_AT_POLL_DISPATCH`.

### Cancellation

S51 requires:

`E_cancel → exact frozen E_original/provider/providerRunId`.

### Cost adoption

S46 requires exact source-row identity and, where aggregate source cost spans multiple provider attempts:

`{E_source_1...E_source_N} → source cost evidence → E_asset_cost_adopt`.

## 8. Sampling verification set

Before this ledger can be promoted, at least one row from each identity/C1/C2 shape must be rechecked directly against live source.

### Already directly rechecked during current sequence

- L017 Autonomous Resolution — NONE identity, C1 YES;
- L029 telemetry — NONE identity, C1 unknown, later C2 adoption;
- L033 Apify experiment — LOGICAL_STATE_ONLY;
- L036/L038 commercial — LOGICAL_STATE_ONLY + external C2;
- L039 commercial adoption — positive C2;
- L046 build/release cost adoption — positive C2;
- L048 health probe — NONE identity;
- L051–L055 status polls — exact target drift problem;
- L057–L060 Policy layers — NONE identity;
- L061 Demand — LOGICAL_STATE_ONLY.

### Still recommended sample checks before promotion

- L001 Builder Gateway exact current pre-boundary identity shape;
- L004 QA dispatch exact pre-boundary identity shape;
- L007/L008 Release dispatch exact pre-boundary identity shape;
- L012 Validation Evidence Collector pre-boundary identity shape;
- L013 Kill-Risk Collector pre-boundary identity shape;
- L047 Repository provisioning exact logical-vs-attempt state.

## 9. Coverage accounting

Current numbered surface floor:

`54`.

Current ledger rows:

- 62 execution/adoption/authority rows;
- 13 explicit internal/local exclusions.

The row count is **not** a proof of completeness.

Promotion requires:

1. all recommended sample checks complete;
2. a final search for unledgered external/provider call sites;
3. zero unnamed downstream/adoption buckets;
4. zero self-call targets left untraced;
5. no row with an unsupported identity/C1/C2 assertion.

## 10. Current disposition

`ALL_CALL_SITE_LEDGER_CANDIDATE_1 = CREATED`

`NUMBERED_SURFACE_FLOOR = 54`

`FULL_ENVELOPE_COMPLIANT_LIVE_SURFACES = 0`

`LEDGER_ROWS = 62`

`INTERNAL_LOCAL_EXCLUSIONS = 13`

`RECURSIVE_SELF_CALL_TRACING = INCLUDED`

`PROVIDER_RESULT_APPLICATION_REVIEW_QUEUE = 12`

`FINAL_COVERAGE_CERTIFICATION = NOT_YET_AUTHORIZED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = SAMPLE_VERIFICATION + FINAL_UNLEDGERED_CALL_SITE SEARCH + LEDGER PROMOTION/REJECTION`
