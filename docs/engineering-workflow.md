# Money Scout Engineering Workflow

GitHub `main` is the authoritative source of truth for Money Scout.

Changes are developed on short-lived branches, verified by GitHub Actions, merged to `main`, then synchronized into the Replit workspace for runtime and preview verification.

The GitHub CI workflow provisions temporary PostgreSQL, installs the pnpm workspace, applies the Drizzle schema, typechecks the workspace, builds the API server, and runs the zero-cost Discovery fixture and database-backed API tests.

Replit is currently used as the runtime, database, and preview environment rather than as the primary coding agent.
