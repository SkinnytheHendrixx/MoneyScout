# Representation Package 02A — Consolidation Corrections 4: S52–S54 Pre-Boundary Identity Precision

**Status:** TAXONOMY CORRECTION OVERLAY / S54 LOGICAL IDENTITY CREDITED / S52–S53 ABSENCE DIRECTLY VERIFIED  
**Controls over:** Corrections 3 where narrower  
**Implementation authority:** SUSPENDED

## 1. Purpose

A direct review of `demand-checks.ts` found that Corrections 3 classified S54 too coarsely.

The Demand route creates a durable `researchRuns` row before its Anthropic request.

That places S54 in the same identity bucket as Apify Experiment execution and Commercial prepare/activate:

`PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

while:

`FULL_EXECUTION_AUTHORITY_ENVELOPE = ABSENT`.

A follow-up direct review of `policy-checks.ts` confirms S52 and S53 do **not** have that same partial protection.

This correction preserves the three distinct pre-boundary identity classes used throughout Package 02A.

## 2. Governing identity taxonomy

### Class A — no durable pre-boundary exact/logical attempt identity

The external boundary is crossed before any durable attempt/logical execution record exists.

Examples already confirmed:

- Autonomous Resolution provider execution;
- ZERO_CASH telemetry collection;
- Asset Health Probe;
- Policy direct HTTP retrieval;
- Policy Anthropic analysis.

### Class B — durable pre-boundary logical identity/state exists, but authority envelope is incomplete

Examples:

- Apify Experiment execution;
- Commercial prepare;
- Commercial activate;
- Repository provisioning;
- Demand Anthropic analysis.

These receive explicit credit for current durable pre-boundary state.

They still lack full Package-02A authority attachment.

### Class C — full compliant Execution Authority Envelope

Current implementation:

`NONE`.

## 3. S54 — Demand Anthropic Analysis direct sequence

Verified live source:

`artifacts/api-server/src/routes/demand-checks.ts`

Blob:

`236c92557756f1a66f30244915002a5d9a1170a1`

Current sequence:

1. validate request/opportunity;
2. add in-memory `runningChecks` guard;
3. insert durable `researchRuns` row:
   - `startedAt = new Date()`;
   - `triggerType = DEMAND_CHECK`;
4. compute/check projected cost ceiling;
5. construct Anthropic client;
6. call:
   `await messagesClient.parse(...)`;
7. only later update result/final status/finishedAt.

Therefore:

`DEMAND_ANTHROPIC_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`.

This is materially different from Autonomous Resolution, where the `researchRuns` row is inserted only after provider return.

## 4. S54 — full authority remains absent

The pre-existing Demand `researchRuns` row does not freeze or attach:

- Execution Authority Envelope identity;
- exact R18 Capability Binding Snapshot/set;
- exact provider/account binding identity;
- exact R6 Verification Result;
- R7 reservation/economic authority;
- boundary validation record;
- exact provider-side request identity;
- R8 reconciliation linkage.

Therefore:

`DEMAND_ANTHROPIC_FULL_EXECUTION_AUTHORITY_ENVELOPE = ABSENT`.

Correct S54 state:

`S54 = M1_C1_PROVIDER_ATTEMPT`

`PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

`FULL_AUTHORITY_ENVELOPE = ABSENT`.

## 5. S52 — Policy Document Retrieval direct sequence

Verified live source:

`artifacts/api-server/src/routes/policy-checks.ts`

Blob:

`3c696810552c383b1b3ad52c9b71895fcb140ef0`

Current route:

1. validates request/opportunity;
2. adds only in-memory `runningChecks`;
3. calls:
   `retrievePolicyDocuments(opportunity.sourceUrl)`;
4. that function performs one or more `fetchPublicText(...)` external GETs;
5. no Policy Check DB row exists yet.

The first durable Policy Check row is created only later:

- after retrieval if the cost precheck stops before Anthropic; or
- after the Anthropic request/result; or
- in the catch/failure path.

Therefore:

`POLICY_HTTP_PREBOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`.

The in-memory running guard does not qualify as durable identity.

## 6. S53 — Policy Anthropic Analysis direct sequence

After direct document retrieval:

1. code computes the conservative model/search cost estimate;
2. constructs the Anthropic client;
3. calls:
   `await anthropic.messages.create(...)`;
4. parses result and usage;
5. enters DB transaction;
6. inserts evidence / updates Opportunity policyStatus;
7. inserts `policyChecksTable` result row.

There is no durable Policy Check or provider-attempt row inserted before `anthropic.messages.create(...)`.

Therefore:

`POLICY_ANTHROPIC_PREBOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`.

The later `policyChecksTable` row is a post-response result/status record, not pre-dispatch authority.

## 7. Failure-path confirmation for Policy

If Policy retrieval/model processing fails, `saveUnknown(...)` inserts a Policy Check row in the catch path.

That still occurs after attempted external retrieval/model work.

Therefore the failure path does not establish pre-boundary durable identity either.

## 8. Corrected S52 disposition

`S52 = POLICY_DOCUMENT_RETRIEVAL_REQUESTS / M4_EXTERNAL_OBSERVATION_FAMILY`

`C1 = NON_SCARCE_NOT_PROVEN`

`PREBOUNDARY_DURABLE_EXACT_ATTEMPT_IDENTITY = ABSENT`

`FULL_AUTHORITY_ENVELOPE = ABSENT`.

One Policy Check may still create arbitrary-N GET attempts.

## 9. Corrected S53 disposition

`S53 = POLICY_ANTHROPIC_ANALYSIS / M1_C1_PROVIDER_ATTEMPT`

`PREBOUNDARY_DURABLE_ATTEMPT_IDENTITY = ABSENT`

`FULL_AUTHORITY_ENVELOPE = ABSENT`

`POLICY_RESULT_ADOPTION_C2 = BOUNDARY_REGISTRY_UNRESOLVED`.

## 10. Corrected S54 disposition

Replace Corrections-3 wording:

`DEMAND_ANTHROPIC_PREBOUNDARY_ATTEMPT_IDENTITY = ABSENT`

with:

`DEMAND_ANTHROPIC_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

and:

`DEMAND_ANTHROPIC_FULL_EXECUTION_AUTHORITY_ENVELOPE = ABSENT`.

No other S54 classification changes.

## 11. Ledger rule

The final all-call-site ledger must not use one generic boolean column such as:

`preboundary_identity_present`.

It must distinguish at minimum:

- `NONE`;
- `LOGICAL_STATE_ONLY`;
- `EXACT_ATTEMPT_IDENTITY_INCOMPLETE_AUTHORITY`;
- `FULL_ENVELOPE_COMPLIANT`.

Where current evidence does not support the finer distinction between logical-state-only and exact-attempt identity, use the conservative value and record why.

## 12. Attack fixture

### ID-A1 — partial identity flattened to absent

Demand Check's durable pre-dispatch `researchRuns` row is ignored and classified the same as Autonomous Resolution.

Must fail factual precision.

### ID-A2 — partial identity inflated to compliant

Demand Check's pre-dispatch `researchRuns` row is treated as sufficient R18/R7/R20 authority.

Must fail.

### ID-A3 — in-memory guard treated as durable identity

Policy `runningChecks` set is treated as durable pre-boundary attempt identity.

Must fail.

### ID-A4 — post-response result row treated as pre-boundary authority

Policy `policyChecksTable` result inserted after model execution is used as proof that authority existed before the provider call.

Must fail.

## 13. Current three-way examples

### No durable pre-boundary attempt/logical identity

- Autonomous Resolution;
- ZERO_CASH telemetry;
- Asset Health Probe;
- S52 Policy HTTP requests;
- S53 Policy Anthropic analysis.

### Durable pre-boundary logical identity/state, incomplete authority

- Apify Experiment;
- Commercial prepare;
- Commercial activate;
- Repository provisioning;
- S54 Demand Anthropic analysis.

### Full envelope-compliant identity

- none.

This list is current working coverage, not a final repository denominator.

## 14. Disposition

`S54_PREBOUNDARY_CLASSIFICATION_ERROR = CONFIRMED`

`S54_PREBOUNDARY_LOGICAL_IDENTITY = PRESENT`

`S54_FULL_EXECUTION_AUTHORITY_ENVELOPE = ABSENT`

`S52_PREBOUNDARY_DURABLE_IDENTITY = ABSENT`

`S53_PREBOUNDARY_DURABLE_IDENTITY = ABSENT`

`POLICY_RUNNING_CHECKS_IN_MEMORY_GUARD != DURABLE_IDENTITY`

`POLICY_CHECK_RESULT_ROW = POST_BOUNDARY_RESULT_RECORD`

`IDENTITY_TAXONOMY_THREE_WAY_DISTINCTION = RETAINED`

`CURRENT_NUMBERED_SURFACE_FLOOR = 54`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_GATE = ALL_CALL_SITE_LEDGER_WITH_PREBOUNDARY_IDENTITY_CLASSIFICATION`
