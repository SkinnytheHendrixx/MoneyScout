# Money Scout

A private internal tool for evidence-driven opportunity tracking and human review.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- `lib/api-spec/openapi.yaml` — opportunities and evidence API contract
- `lib/db/src/schema/money-scout.ts` — PostgreSQL schema for all six Phase 1 tables
- `artifacts/api-server/src/routes/` — opportunities and evidence CRUD routes
- `artifacts/money-scout/src/` — dashboard, detail views, and forms

## Architecture decisions

- Phase 1 is deliberately manual: no AI, research automation, scraping, scheduling, or scoring logic.
- Calendar dates use PostgreSQL `date` columns; research run timestamps use timezone-aware timestamps.
- Deleting an opportunity cascades to its linked evidence, evaluations, snapshots, and experiments.

## Product

- Sort and search the opportunity review queue.
- Create, inspect, edit, and delete opportunities.
- Add, edit, inspect, and remove evidence linked to an opportunity.
- Preserve all records in PostgreSQL across refreshes and restarts.

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Update `lib/api-spec/openapi.yaml` before API/client behavior, then run codegen.
- Keep future phases out of the Phase 1 review surface unless the user explicitly expands scope.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
