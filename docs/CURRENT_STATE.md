# Money Scout Current State

_Last updated: 2026-09-10 (America/Los_Angeles)_

This file is intentionally operational and should be updated whenever a milestone changes the live system materially. It is not a substitute for code inspection.

## Repository / deployment state

- Repository: `SkinnytheHendrixx/MoneyScout`.
- GitHub `main` is the source of truth.
- Current functional milestone on `main`: **#76 Bet & Capital Allocation Kernel**.
- #76 merge SHA: `f6ec8b817e5e93b64168f14813696f1a20802572`.
- #77 Asset Factory & Real Builder Integration is implemented on its feature branch and remains pending PR review/merge at the time of this update.
- GitHub Actions `Money Scout CI` is the merge/deployment acceptance gate.
- Replit is the active runtime/database/preview environment, not the primary coding environment.
- Money Scout's self-deployment supervisor watches exact green `main` push SHAs and promotes them without requiring routine owner sync/reset actions.

## Current product capability

Money Scout currently supports the pipeline through commercially activatable, measurable, self-remediating live Assets:

1. **Discovery**: collect bounded external catalog/source signals and create Candidate/Opportunity state under strict coverage rules.
2. **Research**: policy/access and demand analysis with durable evidence and bounded provider cost.
3. **Validation**: kill-risk collection, evidence collection, 13-factor assessment, underwriting, adversarial challenge, experiments, WATCH, and autonomous resolution.
4. **Commercial planning**: deterministic Commercial Build Brief and Monetization Execution Plan.
5. **Bet allocation**: explicit, bounded resource/decision contracts and machine-readable Build Envelopes.
6. **Build**: durable Builder Workspace/provider adapter contract.
7. **Independent QA**: acceptance criteria, baseline checks, defect persistence, bounded repair/retest loop.
8. **Controlled Release**: preview-first deployment and explicit public release authority.
9. **Self-deployment**: Money Scout can update its own Replit runtime from a green GitHub `main` SHA.
10. **Asset activation**: verified public releases become durable Assets.
11. **Asset operations**: health checks, incidents, recovery, authoritative telemetry ingestion, economic reviews, and bounded same-surface remediation.
12. **Commercial activation**: a live Asset can prepare a disabled checkout, require independent merchant/credential/charging gates, become transaction-ready after explicit authority, and ingest signed authoritative payment events into the existing Asset economic system.
13. **Revenue adjustments**: refunds, partial refunds, chargebacks, and reversals append compensating `FACT` observations without mutating the original payment fact, so realized/net revenue remains auditable and correct.

## What #75 added

The codebase now contains a durable Asset-level Commercial Activation lifecycle:

- `commercial_activations`;
- `commercial_activation_events`;
- `payment_provider_events`;
- stable Monetization Execution Plan snapshots/fingerprints;
- provenance-backed numeric offer requirements;
- verified merchant capability separate from mere account existence;
- verified production-credential capability;
- separate Asset-specific production-credential authorization;
- separate explicit `CUSTOMER_CHARGING` authorization;
- disabled-checkout preparation before charging authority;
- zero-cash commercial payment-adapter contract;
- signed provider-event ingestion;
- stable provider transaction/event idempotency;
- successful authoritative payment -> `FACT` revenue + transaction telemetry in the #74 observation ledger;
- append-only compensating `FACT` observations for refunds/partial refunds/chargebacks/reversals;
- provider ambiguity -> `UNCERTAIN` with no blind retry;
- verified commercial activation -> Asset `operatingMode = OPERATING` without enabling unrelated outbound/ads/domain/spend authority;
- stale Human Actions resolved when the corresponding authority/capability is satisfied.

## Current authority posture

Assets default to narrow authority.

These domains remain independent:

- capital allocation / Bet approval;
- public release;
- customer charging;
- outbound outreach;
- advertising / paid acquisition;
- custom domain changes;
- production credential use;
- positive external spend.

Money Scout must not infer one authority from another.

Commercial activation specifically preserves these separations:

- public release != charging;
- merchant account existence != merchant capability;
- merchant capability != charging authority;
- production credential capability != production credential authority;
- production credential authority != charging authority;
- charging != outbound/ads/domain/spend.

## Current commercial operational gate

#75 code completion does **not** mean Money Scout has already accepted a real customer payment.

A real Asset still requires, where applicable:

- completion/verification of merchant onboarding and KYC;
- a supported secret bridge for production payment credentials;
- verified production credential capability;
- explicit Asset-specific production-credential authorization;
- explicit `CUSTOMER_CHARGING` authorization after offer/provenance review;
- a real bounded transaction whose authoritative provider event is observed exactly once.

No raw credentials should be entered into Money Scout.

## Current provider / capability posture

### Research / Anthropic

- Direct `ANTHROPIC_API_KEY` support exists.
- The previously attempted Replit-managed Anthropic credential path returned `401 oauth.v2.ApiKeyNotApproved` in live testing.
- No paid Anthropic research should be assumed available unless a funded/authorized direct key is present.
- Existing research/validation spend caps and no-blind-retry rules remain in force.

### Builder

- #77 adds a durable Factory in front of #69: Product Definition, requirement graph, adversarial review, Architecture Plan, software capability selection, isolated Asset repository, Build Contract v2, and exact-commit Builder Gateway handoff.
- #69 remains the execution layer and #70 remains the independent acceptance authority.
- The official Codex SDK is integrated behind a provider-neutral Gateway, but real metered execution is currently fail-closed: the SDK path does not expose an enforceable maximum incremental cash cost and Money Scout does not yet have the shared atomic per-run Money Safety reservation primitive.
- `UNKNOWN` cost is never treated as zero. Remaining Bet budget, broad capital allocation, request-body identity text, or a provider account cannot unlock metered execution.
- Zero-cost deterministic drivers are restricted to test mode. No production coding provider should be assumed executable until its credential and financial-safety contract are machine-verified.

### Independent QA

- Generic QA adapter architecture exists.
- Independent QA is required for consequential build acceptance/repair.
- No real production QA provider should be assumed connected unless Capability state proves it.

### Release

- Generic controlled-release adapter architecture exists.
- No real external release provider should be assumed connected unless Capability/provider state proves it.
- Money Scout's own Replit self-deployment is a separate internal runtime mechanism and is functioning independently of the generic Asset release provider.

### Payment / merchant

- The durable commercial activation/payment event architecture is implemented in #75.
- Merchant account existence must not be treated as merchant capability.
- No live charging authority or real merchant readiness should be assumed for a specific Asset until durable Capability/authority state proves it.
- Commercial adapters remain zero-cash under the current #75 contract.

### Telemetry

- #74 defines authoritative telemetry adapter behavior and idempotent Asset observations.
- #75 payment events reuse that ledger rather than creating a competing revenue ledger.
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

## Current implementation milestone

### #77 Asset Factory & Real Builder Integration

The Asset Factory sits in front of the existing #69 Builder Workspace and consumes #76 without turning the Build Envelope into a Product Definition or Architecture Plan.

Its target flow is:

**Approved Bet + Build Envelope -> upstream truth snapshot -> traceable Product Definition -> competitive-first-release review -> Architecture Composer -> reusable Software Capability Catalog -> isolated Asset repo -> Build Contract -> real coding-agent dispatch -> existing independent QA.**

Key product-synthesis rules now considered canonical:

- The first release should ordinarily be industry-standard and commercially competitive around the validated value proposition, not the thinnest technically working MVP.
- Category-standard features generally belong when omitting them would materially reduce credibility, usability, purchaseability, customer success, or the paid promise.
- Speculative differentiation and unsupported enterprise breadth remain deferrable.
- Cheap AI-assisted development does not make ongoing maintenance/security/support complexity free.
- Optimize the architecture against unnecessary ongoing complexity rather than minimizing feature count by itself.
- Material requirements must preserve whether they came from locked commercial truth, evidence, Factory standards, bounded product judgment, or builder discretion.
- Product judgment is allowed but must not be represented as observed market/buyer evidence.
- Frozen Product Definitions are versioned; material scope changes create a new version rather than silently mutating an active build.
- A shared portfolio visual design system is downstream and should not block the core Asset Factory. Until then, generated customer-facing products should meet a neutral professional quality floor.
- Real metered Builder/QA execution remains blocked until the shared Money Safety primitive can atomically reserve an enforceable per-run maximum, or a provider proves a no-paygo entitlement with no silent fallback.

## Planned sequence after the Asset Factory

See `docs/ROADMAP.md` for canonical sequencing. The planned priorities after #77 are:

- #78 Live Asset Decision Engine;
- #79 Distribution & Growth Execution;
- #80 Customer & Support Operations;
- #81 Portfolio Reinvestment & Rebalancing;
- #82 Learning & Signal Calibration;
- #83 provider/credential/spend/recovery hardening;
- #84 end-to-end closed-loop portfolio acceptance.

## Canonical documentation

The canonical product definition lives in:

- `/AGENTS.md`
- `/docs/ARCHITECTURE.md`
- `/docs/PRODUCT_PRINCIPLES.md`
- `/docs/ROADMAP.md`
- `/docs/CURRENT_STATE.md`

`replit.md` should remain a concise runtime pointer to these documents rather than a second competing architecture specification.
