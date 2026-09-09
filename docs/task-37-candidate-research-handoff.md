# Task #37 — Candidate → Research handoff

Status: IMPLEMENTED pending CI.

## Audit finding

Money Scout already had the downstream research primitives:

- accepting a Discovery candidate creates or reuses a deduplicated Opportunity;
- acceptance preserves one source-backed Discovery FACT and links the underlying observations to the Opportunity;
- Policy Check exists as a bounded policy/access research stage;
- Demand Check exists as a bounded external-demand research stage.

The handoff mismatch was semantic: a newly accepted Discovery candidate created an Opportunity with verdict `NEW`, even though acceptance is the action that promotes a Discovery signal into the research workflow.

## Change

Accepted Discovery candidates now create their Opportunity with verdict `RESEARCH`.

The handoff route remains idempotent and preserves the existing acceptance safeguards:

- suppressed or duplicate candidates cannot be accepted;
- repeated or concurrent acceptance reuses the existing Opportunity;
- one Discovery FACT is preserved through the existing partial unique evidence constraint;
- observation links are attached to the created/reused Opportunity;
- an already-created Discovery Opportunity still at `NEW` is repaired to `RESEARCH` when the candidate is accepted again.

## Research execution boundary

This task does **not** automatically run Policy Check or Demand Check.

Those stages currently make bounded external research calls and were deliberately implemented as explicit user-triggered operations with cost ceilings and no automatic retries. Automatically spending on every Discovery candidate would change that operating contract and requires a separate durable orchestration/budget decision rather than being hidden inside candidate acceptance.

Task #37 therefore completes the deterministic Candidate → Research-state handoff while preserving the existing paid-research safety boundary.

## Validation target

The existing database-backed Discovery API acceptance regression exercises the handoff path, including concurrent acceptance, Opportunity deduplication, and single Discovery FACT creation. GitHub CI must also pass workspace typecheck, API build, zero-cost Discovery fixtures, and database-backed Discovery API tests.
