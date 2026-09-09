# Task #38 — Research Orchestrator Control Plane

Status: implemented in source pending CI and merge.

## Purpose

Add the deterministic control plane between Discovery handoff and the existing bounded Policy Check and Demand Check workers.

## Existing workers preserved

- Policy Check remains independently bounded to a $0.50 estimated external-service ceiling.
- Demand Check remains independently bounded to a $0.50 external-service ceiling.
- Neither worker is silently auto-triggered by candidate acceptance in this task.

## Orchestration contract

The orchestrator reads the Opportunity's current verdict, latest Policy Check status, latest Demand Check conclusion, and cumulative external-service spend recorded for that Opportunity.

It then returns exactly one next action:

- `RUN_POLICY_CHECK`
- `RUN_DEMAND_CHECK`
- `HUMAN_POLICY_REVIEW`
- `WATCH_FOR_MORE_EVIDENCE`
- `VALIDATE_OPPORTUNITY`
- `STOP`

## Hard stop rules

- Total recorded research external-service spend at or above $1.00 stops further automated paid work.
- An Opportunity already marked `KILL` stops.
- Policy `RED` stops.
- Demand `UNSUPPORTED` stops.
- Policy `UNKNOWN` or `YELLOW` does not trigger an automatic paid retry; it requires human policy review.
- Demand `WEAK` or `UNKNOWN` does not trigger an automatic paid retry; it moves to watch-for-more-evidence.
- Only Policy `GREEN` plus Demand `SUPPORTED` becomes `VALIDATION_READY`.

## External-spend behavior

Task #38 itself makes zero external provider calls. `automaticExternalCallsEnabled` is explicitly false in the returned plan. This gives Money Scout a tested orchestration state machine before any future task enables autonomous paid execution.

## API

`GET /api/opportunities/:opportunityId/research-plan` returns the current deterministic research plan and budget state.

## Tests

Zero-cost tests cover policy-first ordering, demand gating, validation readiness, policy and demand rejection, human review, watch behavior, budget exhaustion, and already-killed Opportunities.
