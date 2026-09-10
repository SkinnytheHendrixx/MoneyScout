# Money Scout Runtime Notes

Money Scout is a private internal autonomous operating system for discovering, underwriting, building, launching, operating, measuring, and reallocating capital across small digital businesses.

This file is intentionally concise. It is **not** the canonical product/architecture specification.

## Read first

- `/AGENTS.md` — agent operating instructions and invariants
- `docs/CURRENT_STATE.md` — current live/system state
- `docs/ROADMAP.md` — canonical forward build sequence
- `docs/ARCHITECTURE.md` — system/domain architecture
- `docs/PRODUCT_PRINCIPLES.md` — non-negotiable product rules
- `docs/engineering-workflow.md` — implementation/CI/deployment workflow
- `.agents/memory/MEMORY.md` — narrow durable implementation lessons

If this file conflicts with those documents or the actual code, inspect the repository and treat GitHub `main` as authoritative.

## Runtime role of Replit

Replit is used as Money Scout's active Project runtime, PostgreSQL environment, and preview surface. It is not the primary source editor or primary coding agent.

The normal code path is:

**Codex/repo-native engineering -> GitHub branch/PR -> GitHub Actions -> merge to `main` -> Money Scout self-deployment supervisor -> Replit Project runtime.**

Do not require routine owner-driven Git/Replit sync or reset after merges.

## Stack

- pnpm workspaces
- TypeScript
- Express API
- PostgreSQL + Drizzle ORM
- React/Vite frontend
- GitHub Actions CI
- runtime bootstrap/supervisor/follower for autonomous Replit Project promotion

Check package manifests and CI for the exact currently supported Node/pnpm versions rather than relying on stale prose here.

## Common repository commands

- `pnpm run typecheck` — full workspace typecheck
- `pnpm run build` — workspace build surface as currently configured
- `pnpm --filter @workspace/api-server run build` — API build
- `pnpm --filter @workspace/money-scout run build` — frontend build
- `pnpm --filter @workspace/api-server run test:zero-cost` — canonical zero-cost subsystem regression suite
- `pnpm --filter @workspace/db run push-force` — CI/dev schema push path where explicitly appropriate

Use the scripts/workflows in the current branch as source of truth for exact commands.

## Critical runtime rules

- GitHub `main` is source of truth.
- Exact `main` push CI must be green before self-promotion.
- Candidate/preflight failure must preserve the current healthy runtime.
- Runtime migrations must be additive/safe under the existing migration contracts.
- Preflight must not start autonomous business workers that could create side effects.
- Frontend process takeover may terminate only a positively identified stale Money Scout listener; unknown port owners fail closed.
- Published/external Asset releases remain governed by Controlled Release and are distinct from Money Scout's own Replit self-deployment.
- Never infer commercial/spend authority from runtime access.

## Current milestone pointer

At the time this file was updated, `main` contains milestone **#75 Commercial Activation & Revenue Execution** and **#76 Bet & Capital Allocation Kernel** is the active implementation milestone. The planned #77 Asset Factory & Real Builder Integration sits immediately after the Bet layer and in front of the existing Builder Workspace execution layer. See `docs/CURRENT_STATE.md` and `docs/ROADMAP.md` for the authoritative current status.