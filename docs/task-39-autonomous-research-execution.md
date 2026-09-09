# Task #39 — Autonomous Research Execution

Status: IMPLEMENTED, pending CI/merge.

## Purpose

Connect the deterministic Task #38 research control plane to the existing bounded Policy Check and Demand Check workers so a Discovery candidate can move through research without repeated manual button presses.

## Behavior

- Accepting a Discovery candidate still creates or repairs a deduplicated Opportunity in `RESEARCH`.
- Acceptance asynchronously starts one autonomous research advance.
- The research executor reads the current deterministic plan before every paid stage.
- Policy Check runs first when required.
- Demand Check runs only after a GREEN policy result.
- At most two paid stages can execute in one advance.
- The existing $0.50 per-stage ceilings remain unchanged.
- The Task #38 $1.00 total recorded external-service ceiling remains enforced.
- UNKNOWN or YELLOW policy stops for human review with no automatic paid retry.
- WEAK or UNKNOWN demand moves the Opportunity to WATCH with no automatic paid retry.
- RED policy or UNSUPPORTED demand moves the Opportunity to KILL with the research stop reason.
- GREEN policy plus SUPPORTED demand moves the Opportunity to TEST, representing validation-ready status.
- A per-opportunity active-run guard prevents concurrent autonomous research advances.
- Any worker failure stops the advance and does not automatically retry.

## Cost safety

Task #39 enables automatic calls only for the exact `RUN_POLICY_CHECK` and `RUN_DEMAND_CHECK` actions authorized by the deterministic state machine. The executor cannot exceed two paid stages in one advance and will not execute when the total recorded research budget is exhausted.

## Validation

Zero-cost tests cover the execution sequence, stop-on-unresolved-policy behavior, watch behavior, and budget exhaustion without making external research calls.
