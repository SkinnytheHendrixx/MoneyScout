# Money Scout Engineering Workflow

GitHub `main` is the authoritative source of truth for Money Scout.

Agent-to-agent engineering coordination uses the provider-neutral protocol in `docs/agent-coordination-protocol.md`. The owner must not be used as a transport layer for prompts, patches, review findings, or status between machine actors.

## Canonical engineering loop

1. Read `/AGENTS.md`, `docs/CURRENT_STATE.md`, `docs/ROADMAP.md`, `docs/ARCHITECTURE.md`, and `docs/PRODUCT_PRINCIPLES.md`.
2. Inspect the actual repository implementation and relevant prior milestone docs/migrations/tests.
3. Create a short-lived branch from the current verified `main` SHA.
4. Implement the milestone end-to-end using repo-native engineering/Codex where available.
5. Add adversarial zero-cost regression tests for authority, idempotency, cost, provenance, and recovery boundaries.
6. Run the complete local test/typecheck/build surface available in the engineering environment.
7. Open a PR and let GitHub Actions run the canonical acceptance suite.
8. Fix failures until the PR is fully green.
9. Merge only after architecture/authority review where required.
10. The Money Scout runtime supervisor observes the exact green `main` push SHA, stages/preflights it, and autonomously promotes it to the Replit Project runtime.
11. Verify live runtime health/freshness after consequential infrastructure changes.

When a Work Item is routed through autonomous agent coordination, each machine actor must advance it directly to the next safe machine-executable state. Machine-fixable review or QA failures return directly to the builder. A work item stops with the owner only at a genuine human-only product, authority, credential, capital, legal, or irreversible-side-effect boundary.

## Roles

- **Owner**: defines product intent and grants genuine human-only authority/capabilities.
- **ChatGPT/project architect**: product architecture, milestone design, authority/economic review, final merge review when needed.
- **Codex/repo-native engineering**: primary implementation, repo inspection, coding, local tests, debugging, and PR preparation.
- **GitHub Actions**: independent merge/deployment acceptance gate.
- **Money Scout runtime supervisor**: autonomous promotion/rollback of exact green `main` SHAs.
- **Replit Project**: active runtime/database/preview infrastructure, not the primary source editor.

Logical agent roles may be mapped to Claude, ChatGPT/Codex, other coding providers, or future Money Scout-controlled agents without changing the durable GitHub work contract.

## CI expectations

The GitHub CI workflow provisions temporary PostgreSQL, installs the pnpm workspace, applies/pushes schema as configured, typechecks the workspace, builds the API server and frontend, runs the zero-cost Research/Validation/Build/QA/Release/Asset regression suite, runs zero-cost Discovery fixtures, and runs database-backed Discovery API tests.

A PR or `main` SHA is not considered accepted until the required CI surface is green.

## Deployment rules

Money Scout's self-deployment controller is the normal deployment path for the Replit Project runtime.

Do not ask the owner to manually sync/reset Replit after ordinary merges.

The supervisor must:

- require exact green `main` push CI;
- stage a detached release candidate;
- install/build before promotion;
- run migrations/preflight safely;
- verify commit freshness and DB health;
- preserve the last healthy runtime on candidate failure;
- maintain rollback capability;
- refresh both API and frontend ownership safely.

Published/external Asset deployment remains a separate Controlled Release concern and must not be conflated with Money Scout's own internal self-deployment runtime.

## Cost / safety expectations

- Prefer zero-cash fixtures and simulations in CI.
- No blind retries of potentially billable provider actions.
- Do not weaken repository supply-chain or dependency security simply to match a local agent environment; match the repo/CI toolchain instead.
- Preserve idempotency keys/provider run IDs across reconciliation.
- Treat authority and capability as separate durable gates.

## Documentation maintenance

When a milestone materially changes architecture or live behavior:

- update `docs/CURRENT_STATE.md`;
- update `docs/ROADMAP.md` if status or sequencing changes;
- update `docs/ARCHITECTURE.md` if domain/subsystem boundaries change;
- update `docs/PRODUCT_PRINCIPLES.md` only when the owner explicitly changes a product invariant;
- add/update the relevant `docs/task-*.md` implementation contract;
- add `.agents/memory/` notes for narrow durable implementation gotchas that future agents should not rediscover.
