# Money Scout Agent Guide

Money Scout is Jesse's private internal autonomous operating system for finding, underwriting, building, launching, operating, measuring, improving, and reallocating capital across small digital businesses. It is not a SaaS product, a lead-generation app, or an AI assistant waiting for prompts.

## Source of truth

1. GitHub `main` is the authoritative implementation state.
2. Repository code and migrations outrank pasted conversation history.
3. `docs/CURRENT_STATE.md` describes the latest known live/runtime state.
4. `docs/ROADMAP.md` is the canonical forward build sequence.
5. `docs/ARCHITECTURE.md` describes the intended system model.
6. `docs/PRODUCT_PRINCIPLES.md` contains non-negotiable product invariants.
7. Milestone-specific `docs/task-*.md` files document completed subsystem contracts and implementation details.
8. `.agents/memory/` stores durable implementation lessons and gotchas. Treat these as constraints, not as a complete product definition.

When these sources disagree, inspect the actual code and current database/runtime behavior before changing architecture. Update the documentation when the repo proves it stale.

## Core objective

Maximize return on deployed capital and autonomous operating capacity across the Money Scout portfolio. Do not optimize for idea count, feature count, model activity, or workflow volume.

The intended closed loop is:

Discovery -> Research -> Validation -> Underwriting -> Bet -> Build -> Independent QA -> Controlled Release -> Asset -> Commercial Activation -> Operations -> Measurement -> Improve / Scale / Pause / Kill -> Reinvest.

## Autonomy rule

Money Scout is not an AI assistant that waits for instructions. An executable workflow should advance until it:

- succeeds;
- fails conclusively;
- is actively watching a defined future condition; or
- reaches a genuine human-only boundary.

Do not leave work resting between machine-executable steps. Completion of one autonomous step should trigger the next safe step, including test, debug, retest, verification, and reconciliation.

Human involvement is for authority, credentials/KYC/legal ownership, irreversible external side effects, capital approval, or genuine judgment after internal resolution is exhausted. Human involvement is not a substitute for research, debugging, evidence collection, or ordinary coding decisions.

## Evidence and underwriting invariants

- Unknown is not negative evidence.
- Missing data is not zero.
- Usage, traffic, clicks, signups, compliments, or a working product are not willingness-to-pay proof.
- Never fabricate TAM, revenue, customers, retention, CAC, margins, probability, pricing, or market facts.
- Persist provenance explicitly when applicable: `FACT`, `CLAIM`, `INFERENCE`, `UNKNOWN`.
- Fatal kill signals remain separate from aggregate factor scoring.
- Prefer the cheapest viable falsification of uncertainty.
- Direct evidence is preferred, but exact evidence is not always required when a defensible bounded inference is sufficient.
- Do not promote a reversible knowledge gap into a human blocker before exhausting internal resolution methods.

Pricing confidence states are:

- `DIRECTLY_OBSERVED`
- `STRONGLY_INFERRED`
- `BOUNDED_HYPOTHESIS`
- `UNRESOLVED`

A numeric commercial offer must have defensible provenance. Do not invent a precise price merely to unblock execution.

## Authority invariants

Authority is granular and never implied across domains.

Examples:

- public release authority != customer charging authority;
- merchant account existence != automation-ready merchant capability;
- verified production credentials != permission to charge customers;
- customer charging authority != outbound authority;
- customer charging authority != advertising authority;
- public release or charging authority != custom-domain authority;
- a budget in the database != an enforceable provider-side max-cost contract.

Never silently widen an Asset's authority set. New external side effects require the corresponding explicit capability/authority contract.

## Capital and cost rules

Treat cash, paid APIs/compute, build time, agent capacity, maintenance burden, support burden, and human approvals as capital.

- No blind paid retries.
- Provider/runtime failure is not permission to replay a potentially billable call.
- Positive external spend requires explicit bounded authority.
- Prefer zero-cash fixtures/adapters in CI.
- If an adapter cannot enforce a hard per-call ceiling, do not rely on a database budget as protection against an unbounded provider request.

## Lifecycle objects

Do not collapse these concepts:

- **RevOpp / Opportunity**: an economic hypothesis worth evaluating.
- **Bet**: explicit allocation of capital and autonomous capacity to an opportunity.
- **Build**: implementation of the approved commercial contract.
- **Release**: controlled deployment of a verified build.
- **Asset**: a launched operating business.

The long-term portfolio layer should make explicit decisions about where the next dollar and agent-hour goes.

## Build / QA / release rules

- Builder self-report is never final acceptance.
- Independent QA must verify the Build Contract and baseline health.
- Repair must be followed by fresh independent retest.
- Production release requires the applicable release authority and verified health.
- Maintenance releases may inherit only narrowly defined existing authority where the subsystem contract explicitly allows it; they may not expand public/commercial scope silently.
- Self-deployment of Money Scout itself is gated by exact GitHub `main` push CI and live runtime health.

## Human Action / Capability behavior

A Human Action is a first-class durable object, not an error message. It should include:

- urgency;
- reason;
- blocked stage;
- exact instructions;
- required capability;
- verification method;
- resolution contract; and
- exact resume action.

Expected lifecycle:

`OPEN -> VERIFYING -> RESOLVED -> AUTOMATION_RESUMED`

Capability existence and capability readiness are separate. Account existence alone must never be treated as automation-ready authority.

## UX rule

The frontend is an operator control center, not a research dump. A primary screen should make the current state understandable in seconds:

- what this is;
- why it may make money;
- current status;
- what Money Scout is doing now;
- key economics;
- biggest risk/blocker;
- what changed; and
- what happens next.

Detailed evidence, research, audit history, and diagnostics belong in drill-down views.

## Engineering workflow

- Develop on short-lived branches.
- Use Codex/repo-native engineering for implementation where available.
- Run the complete GitHub Actions suite before merge.
- GitHub `main` is the deployment gate.
- Money Scout's runtime supervisor self-promotes only exact green `main` push SHAs.
- Do not ask the owner to manually sync/reset Replit as part of normal deployment.
- Replit is runtime/database/preview infrastructure, not the primary source editor.
- Preserve unrelated work and avoid broad refactors unless required by the milestone.
- Add regression tests for every authority boundary, idempotency rule, cost rule, and recovered failure mode.

See `docs/engineering-workflow.md` for details.

## Before implementing a milestone

1. Read this file.
2. Read `docs/CURRENT_STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, and `docs/PRODUCT_PRINCIPLES.md`.
3. Inspect the current repo implementation and relevant migrations/tests.
4. Read relevant prior milestone docs and `.agents/memory/` notes.
5. Reconcile docs against code before designing changes.
6. Implement end-to-end: durable state, migrations, workers/adapters, API, operator UI, auditability, and adversarial zero-cost tests where applicable.
7. Do not stop for routine engineering choices. Stop only at a true product/authority boundary.
