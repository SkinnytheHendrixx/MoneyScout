# Money Scout Current State

_Last updated: 2026-09-09 (America/Los_Angeles)_

This file is intentionally operational and should be updated whenever a milestone changes the live system materially. It is not a substitute for code inspection.

## Repository / deployment state

- Repository: `SkinnytheHendrixx/MoneyScout`
- GitHub `main` is the source of truth.
- Current functional milestone on `main`: **#74 Monetization Instrumentation & Autonomous Asset Operations**.
- Last functional milestone merge SHA: `f8fccea6d65e2f399cb47d234c72793542734395`.
- Documentation-only commits may advance `main` beyond that SHA without changing the functional milestone; inspect Git history/runtime health for the exact current deployment SHA.
- #75 Commercial Activation & Revenue Execution is the active implementation milestone and is not yet merged at the time of this update.
- GitHub Actions `Money Scout CI` is the merge/deployment acceptance gate.
- Replit is the active runtime/database/preview environment, not the primary coding environment.
- Money Scout's self-deployment supervisor watches exact green `main` push SHAs and promotes them without requiring routine owner sync/reset actions.

## Current product capability

Money Scout currently supports the pipeline through measured, self-remediating live Assets:

1. **Discovery**: collect bounded external catalog/source signals and create Candidate/Opportunity state under strict coverage rules.
2. **Research**: policy/access and demand analysis with durable evidence and bounded provider cost.
3. **Validation**: kill-risk collection, evidence collection, 13-factor assessment, underwriting, adversarial challenge, experiments, WATCH, and autonomous resolution.
4. **Commercial planning**: deterministic Commercial Build Brief and Monetization Execution Plan.
5. **Build**: durable builder workspace/provider adapter contract.
6. **Independent QA**: acceptance criteria, baseline checks, defect persistence, bounded repair/retest loop.
7. **Controlled Release**: preview-first deployment and explicit public release authority.
8. **Self-deployment**: Money Scout can update its own Replit runtime from a green GitHub `main` SHA.
9. **Asset activation**: verified public releases become durable Assets.
10. **Asset operations**: health checks, incidents, recovery, telemetry ingestion, economic reviews, and bounded same-surface remediation.

## What #74 added

The live codebase now contains the first measured post-launch operations layer:

- `asset_telemetry_syncs`;
- `asset_economic_reviews`;
- `asset_remediation_runs`;
- `asset_remediation_events`;
- cost instrumentation state;
- telemetry scheduling;
- explicit completeness windows;
- contribution-margin state only when revenue and cost coverage are complete enough;
- autonomous availability remediation through repair -> independent QA -> preview -> same-surface production -> live health verification;
- zero-cash-only generic remediation until hard provider-side spend ceilings exist;
- operator-facing economics/remediation state.

## Current authority posture

Assets default to narrow authority.

Public release may be authorized while the following remain off unless explicitly granted:

- customer charging;
- outbound outreach;
- advertising / paid acquisition;
- custom domain changes;
- production credential use;
- positive external spend.

Money Scout must not infer one authority from another.

## Current commercial limitation

A live Asset can currently exist, remain healthy, ingest attributable telemetry, and repair availability incidents, but Money Scout does **not yet** have the complete commercial activation state machine required to safely turn an Asset into a real transaction-ready business.

That is milestone #75.

The current deterministic Monetization Execution Plan intentionally allows `testPriceUsd` to remain null. It defines the commercial thesis and pricing confidence state but does not invent an exact price.

## Current provider / capability posture

### Research / Anthropic

- Direct `ANTHROPIC_API_KEY` support exists.
- The previously attempted Replit-managed Anthropic credential path returned `401 oauth.v2.ApiKeyNotApproved` in live testing.
- No paid Anthropic research should be assumed available unless a funded/authorized direct key is present.
- Existing research/validation spend caps and no-blind-retry rules remain in force.

### Builder

- Generic Builder adapter architecture exists.
- Durable builder workspaces support create/status/repair flow.
- No real production coding provider should be assumed connected merely because the adapter exists.

### Independent QA

- Generic QA adapter architecture exists.
- Independent QA is required for consequential build acceptance/repair.
- No real production QA provider should be assumed connected unless Capability state proves it.

### Release

- Generic controlled-release adapter architecture exists.
- No real external release provider should be assumed connected unless Capability/provider state proves it.
- Money Scout's own Replit self-deployment is a separate internal runtime mechanism and is functioning independently of the generic Asset release provider.

### Payment / merchant

- The durable commercial payment activation layer is the scope of #75.
- Merchant account existence must not be treated as merchant capability.
- No charging authority should be assumed.

### Telemetry

- #74 defines authoritative telemetry adapter behavior and idempotent Asset observations.
- Revenue/cost/usage/support remain uninstrumented/unknown for a specific Asset until attributable sources prove otherwise.

## Discovery live-history note

The first real bounded Apify Discovery pilot produced a verified partial/converged slice rather than exhaustive catalog coverage. It processed 15,000 unique actors per pass across two convergent passes from a provider-reported catalog materially larger than that slice.

Because it was the first compatible baseline slice, zero Candidates was not treated as evidence that no opportunity exists. Whole-catalog supply/whitespace claims remain prohibited from that bounded slice.

See `.agents/memory/discovery-partial-slice-strategy.md` and related Discovery memory docs for implementation constraints.

## Runtime architecture

The current Money Scout Replit Project runtime uses:

- stable runtime bootstrap;
- API runtime supervisor;
- frontend runtime follower;
- exact GitHub Actions push-CI verification;
- staged release worktrees;
- build + preflight before live promotion;
- additive runtime migrations;
- runtime health/freshness checks;
- previous-release rollback;
- verified Money Scout Vite stale-listener takeover rather than arbitrary port-owner killing.

Normal feature delivery should not require the owner to manually sync GitHub into Replit.

## Current next milestone

### #75 Commercial Activation & Revenue Execution

The intended boundary is:

**Asset -> Offer/price provenance -> Merchant capability -> Production credential capability/authority -> Explicit customer charging authority -> Payment/checkout configuration -> Transaction-ready verification -> Authoritative payment event -> #74 FACT telemetry/economic review.**

#75 must preserve these separations:

- merchant capability != charging authority;
- public release != charging authority;
- production credentials != charging authority;
- charging != outbound/ads/domain/spend;
- payment attempt != revenue;
- authoritative successful payment event = revenue FACT.

Codex is the preferred implementation environment for #75 onward, with GitHub Actions as the independent acceptance gate and this repository as the durable project brain.

## Next planned architecture after #75

See `docs/ROADMAP.md` for canonical sequencing. The immediate planned priorities are:

- #76 durable Bet & Capital Allocation Kernel;
- #77 Live Asset Decision Engine;
- #78 Distribution & Growth Execution;
- #79 Customer & Support Operations;
- #80 Portfolio Reinvestment & Rebalancing;
- #81 Learning & Signal Calibration;
- #82 provider/credential/spend/recovery hardening;
- #83 end-to-end closed-loop portfolio acceptance.

## Known documentation issue resolved by the canonical docs branch

Before this documentation update, `replit.md` still described an obsolete early manual Phase 1 architecture. That description must not be treated as the current Money Scout product model. The canonical product definition now lives in:

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/PRODUCT_PRINCIPLES.md`
- `/docs/ROADMAP.md`
- `/docs/CURRENT_STATE.md`

`replit.md` should remain a concise runtime pointer to these documents rather than a second competing architecture specification.
