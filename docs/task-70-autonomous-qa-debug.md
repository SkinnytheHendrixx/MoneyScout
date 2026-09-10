# Task #70: Autonomous QA → Debug → Retest Loop

Goal: turn `QA_PENDING` into a durable autonomous loop that independently verifies builder output, converts failures into structured defects, sends only actionable defects back to the builder for repair, and repeats until acceptance passes or a genuine human-only boundary is reached.

## Required behavior

- QA must be independent of the builder's own success signal.
- Every QA round is durable, idempotent, auditable, and restart-safe.
- Acceptance is grounded in the Build Contract's acceptance criteria plus baseline technical checks.
- Failed QA must preserve structured defects with severity, category, evidence, and repair guidance.
- Repair dispatch must reuse the existing builder workspace and use a unique idempotency key per QA round.
- QA retries are not blind retries: a new round only follows a confirmed repair or a safe retryable QA infrastructure failure.
- A build is `COMPLETE` only after QA returns `PASSED` with all required acceptance criteria verified.
- Missing QA or repair automation capability becomes a structured Human Action only when configuration/authority is genuinely human-only.
- External publication, charging, domains, outbound, and production credentials remain forbidden.
- The loop must cap autonomous repair rounds to prevent infinite churn. Exhaustion produces a concise Human Action with the unresolved defect bundle, never an unexplained idle state.

## Default limits

- Maximum autonomous repair rounds: 4.
- QA adapter external spend default: $0.
- Metered QA or repair backends require explicit bounded authority.
- Safe transient QA adapter failures may retry with the same idempotency key without creating a new round.

## Next gate

Task #71 will consume QA-passed builds for controlled deployment/launch. Task #70 must stop at `QA_PASSED` / build `COMPLETE`; it must not publish or launch anything.