# Task #72 — Self-Deployment / Runtime Autonomy

## Goal

Remove the manual Git sync + API reset loop from Money Scout's active Project runtime. GitHub `main` remains the source of truth. Once this bootstrap is active, a green `main` commit is staged, preflighted, promoted, and rolled back automatically without an operator clicking Sync or Reset.

## Runtime flow

1. Replit's API development service starts the stable `runtime-bootstrap.mjs` process.
2. The bootstrap starts the versioned runtime supervisor.
3. The supervisor launches the currently promoted API from a detached Git worktree and records safe runtime state under the runtime directory.
4. Every bounded polling interval, the supervisor checks `origin/main`.
5. A changed SHA is never deployed immediately. The supervisor requires a completed successful `Money Scout CI` **push** run for that exact `main` SHA.
6. The green commit is fetched into a separate worktree. Dependencies are installed and both the API and Money Scout frontend are built there.
7. The candidate API starts on an internal preflight port with `MONEY_SCOUT_RUNTIME_PREFLIGHT=1`.
   - additive runtime migrations run;
   - database reachability is verified;
   - commit identity must match the expected SHA;
   - Discovery startup reconciliation and every autonomous background worker are disabled so preflight cannot duplicate work.
8. Only after preflight passes does the supervisor stop the old API and launch the new API on the real port.
9. The new live API must pass `/api/health/runtime` with database reachability and exact runtime freshness.
10. The supervisor then hard-syncs the Replit Project checkout to the promoted SHA and refreshes pnpm links. GitHub `main` therefore overwrites tracked local drift by design.
11. The frontend follower detects the newly promoted root SHA, restarts Vite, and reloads its own controller through the stable bootstrap.
12. The API supervisor likewise requests a controller reload. The stable bootstrap launches the supervisor code from the newly promoted root while preserving the already healthy API process.

## Rollback

A candidate that fails build or preflight never touches the live runtime. If the new live API fails its post-swap health check, the previous prepared release is relaunched. If the root checkout/dependency refresh fails after the API swap, the checkout is reset to the previous SHA and the API is rolled back as well.

The supervisor retains the current and previous prepared releases so the rollback path does not depend on a fresh network download or a new build.

## CI gate

The self-deployer accepts only the exact `main` SHA with a successful GitHub Actions `push` run named `Money Scout CI`. Pull-request success alone is not sufficient. Failed main CI blocks that SHA. A later rerun of the same SHA is periodically rechecked.

CI also now builds the frontend and executes zero-cost tests for the supervisor's SHA normalization, candidate port separation, main-push CI parsing, and safe public runtime-state projection.

## Runtime observability

`GET /api/health/runtime` is unauthenticated like the other health endpoints, but exposes only non-sensitive deployment state:

- current / desired / root-synced / previous commit SHA;
- supervisor phase;
- last check and last successful update timestamp;
- safe failure code/SHA/timestamp;
- safe CI state/run id;
- database reachability;
- process commit and expected commit freshness.

It deliberately does not expose local paths, process IDs, failure messages, tokens, or CI URLs.

## Frontend behavior

The Replit web development service runs through the stable bootstrap and a lightweight frontend follower. The follower does not perform Git operations. It waits for the API supervisor to successfully promote and root-sync a new SHA, then restarts Vite so dependency, Vite config, and frontend source changes take effect automatically.

## Production boundary

This task solves Money Scout's active Project development runtime. Replit published apps are snapshot deployments and are not treated as mutable Git worktrees. Customer-facing/downstream assets continue to use the Controlled Release layer and its deployment-provider adapter. The self-updater does not grant public publication, customer charging, domain purchase, outbound, or deployment spend authority.

## Bootstrap boundary

The old runtime cannot autonomously execute a supervisor that does not exist in its filesystem yet. Activating Task #72 therefore requires one bootstrap transition after merge. That transition should be performed once through Replit infrastructure tooling rather than becoming an ongoing operator step. After the new Project service commands are running, subsequent green `main` commits are handled by the supervisor.
