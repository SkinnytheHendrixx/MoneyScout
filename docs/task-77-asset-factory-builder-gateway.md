# Milestone #77 — Asset Factory & Real Builder Integration

Status: IMPLEMENTED ON FEATURE BRANCH — PENDING PR REVIEW/MERGE

## Boundary

#77 consumes an approved #76 Bet and its Build Envelope. The envelope constrains capital, provider resources, complexity, maintenance/operating burden, reversibility, scope/authority, and acceptance conditions. It does not choose detailed product features, architecture, providers, software capability implementations, or repository structure; those are Factory outputs.

The Factory preserves the canonical competitive-first-release rule: implement the complete commercially credible product supported by upstream truth, then choose the least-complex architecture that supports it. It does not optimize for an artificially thin MVP.

## Durable flow

`SYNTHESIZING_PRODUCT -> PRODUCT_REVIEW -> COMPOSING_ARCHITECTURE -> ARCHITECTURE_REVIEW -> REPOSITORY_PENDING -> READY_FOR_BUILDER -> BUILDER_RUNNING -> QA_PENDING -> COMPLETE`

Safe terminal/blocked branches include `PRODUCT_BLOCKED`, `ARCHITECTURE_BLOCKED`, `INSUFFICIENT_ENVELOPE`, `REPOSITORY_BLOCKED`, `BUILDER_BLOCKED`, `CHALLENGED`, `CANCELLED`, and `FAILED`.

The implementation adds durable Factory runs, versioned Product Definitions, requirement graphs, versioned Architecture Plans, review defects, separate software capability families/implementations, Asset repository records, Builder Gateway runs, and Factory audit events. Build Contract v2 contains exact Bet/Product/Architecture lineage, requirement-to-acceptance traceability, capability version pins, and an explicit all-false downstream authority set. Historical Build Contract v1 remains readable.

## Builder Gateway

The Gateway is provider-neutral at the #69 adapter boundary and currently includes an official Codex SDK driver. Each initial or repair attempt:

- starts from a durable exact base commit in a fresh disposable checkout;
- uses a distinct branch/lease and stable idempotency key;
- keeps Git, database, provider, and production credentials out of the coding-agent environment;
- disables network and interactive approvals in the current Codex execution profile;
- prevents frozen manifest rewrites and scans changed text for likely secrets;
- accepts structured terminal outcomes rather than treating every provider response as implementation success;
- pushes and records one exact result commit;
- routes only `IMPLEMENTATION_READY` plus an exact SHA into independent #70 QA.

Architecture/Product challenges return to the owning Factory stage. Dependency/resource blocks stop before QA. Provider failures and uncertain outcomes are terminal and are not blindly replayed. Repairs receive only the exact persisted QA defect bundle and start from the prior exact result commit.

## Financial safety

Provider usage, entitlement consumption, and external cash cost are independent fields. Missing or `UNKNOWN` cash cost is never converted to zero.

A real metered provider side effect requires both:

1. an enforceable maximum incremental cost for that exact run; and
2. an atomic reservation of that maximum against the applicable Bet/build envelope through the shared Money Safety layer.

Money Scout revalidates Bet state, the envelope, and any applicable provider-spend authority immediately before the side effect. Remaining budget, broad capital allocation, account existence, internal credentials, request-body identity, and human attestation text cannot substitute for the reservation. Entitlement execution is eligible only when the entitlement is technically enforced and cannot fall back to pay-as-you-go.

The current Codex SDK path does not expose an enforceable per-run cash ceiling, and Money Scout does not yet have the shared atomic reservation primitive. Therefore production metered execution is intentionally `BUILDER_BLOCKED` before the provider call. This is a structured infrastructure dependency, not a Human Action that attestation can resolve. Deterministic zero-cost drivers are permitted only under `NODE_ENV=test`.

Authoritative provider-reported costs are reconciled idempotently through the existing #76 Bet cost attribution model for successful, failed, blocked-after-execution, and cancelled terminal reports. If transport fails after a possible provider side effect and no authoritative cost is available, cost remains unknown and the run remains terminal pending reconciliation.

## Authority

Factory/Build grants none of the following: provider spend, public release, customer charging, outbound, advertising, production credential use, or custom-domain authority. Bet allocation is not downstream side-effect authority. Builder output cannot modify the frozen authority contract.

Human Actions are reserved for genuine capability boundaries such as provisioning a private Asset repository, connecting narrow Gateway repository credentials, or connecting the provider credential. Missing shared financial infrastructure remains a machine-readable blocker rather than a human-attestation task.

## Verification

The zero-cost suite covers Product provenance and immutability, competitive completeness defects, architecture requirement preservation and envelope failure, capability version/lifecycle/dependency rules, self-describing repositories, Build Contract lineage and authority, sanitized agent environments, exact commit/branch handling, active-writer leases, idempotent initial/repair execution, capability auto-resume, challenge routing, no QA on blocked/failed outcomes, independent QA acceptance, cancellation, unknown-cost handling, entitlement/paygo rejection, missing atomic reservation, and idempotent terminal cost reconciliation including failed/cancelled/uncertain outcomes.
