# Money Scout Roadmap

## North star

Money Scout should autonomously convert external market signals into a portfolio of measured operating businesses, then decide where the next dollar and agent-hour should go.

The target closed loop is:

**Discover -> Research -> Validate -> Underwrite -> Bet -> Asset Factory -> Build -> QA -> Release -> Activate -> Operate -> Measure -> Improve / Scale / Pause / Kill -> Reinvest.**

The roadmap is intentionally ordered around closing this economic loop. Features that do not materially advance the loop should not displace core milestones.

## How to use this file

- Completed milestone numbers and their intent are historical and should not be redefined.
- The current milestone is the next implementation focus unless a blocking infrastructure defect must be fixed first.
- Planned milestone numbering after the current milestone is canonical planning, but a milestone may be split when implementation proves the scope too large. If that happens, update this file explicitly rather than silently changing direction.
- A milestone is not complete because code exists. It must satisfy its exit criteria, tests, and applicable runtime verification.
- Human-only operational gates such as KYC, merchant onboarding, credential granting, or capital authorization are tracked separately from code completion.

## Status legend

- **COMPLETE**: merged to `main`, CI green, and runtime behavior verified where applicable.
- **CURRENT**: active implementation target.
- **PLANNED**: intended next architecture work.
- **OPERATIONAL GATE**: requires real-world capability/authority rather than only code.

---

# Foundation already completed

Before milestones #69–#75, Money Scout established the core opportunity-evaluation and launch-control system. The exact implementation history is preserved in prior `docs/task-*.md` files and Git history. Durable capabilities include:

- Discovery source acquisition and bounded quantitative signal generation;
- partial-catalog coverage semantics and convergence rules;
- Candidate acceptance into durable Opportunities;
- policy/access research;
- demand research;
- durable Research orchestration;
- kill-risk evidence collection;
- validation evidence collection;
- 13-factor deterministic underwriting;
- adversarial challenge and rejection review;
- cheapest falsifying experiment planning/execution;
- WATCH for genuinely temporal uncertainty;
- autonomous resolution ladders before human escalation;
- Human Action and Capability Registry primitives;
- lifecycle reconciliation and execution-kernel behavior;
- Commercial Build Brief generation;
- deterministic Monetization Execution Plan generation;
- bounded external-cost and no-blind-retry rules.

These foundations mean the roadmap after #68 is primarily about turning validated opportunities into self-operating economic assets and then closing the portfolio capital loop.

---

# #69 Builder Workspace — COMPLETE

## Purpose

Create a durable bridge between an approved Build Contract and an external coding agent/provider.

## Delivered

- durable builder workspaces and events;
- provider identity and run IDs;
- generic HTTP coding adapter;
- build creation/status/repair contracts;
- zero-cash vs metered cost mode;
- capability gating for missing builder access;
- explicit separation between builder success and final acceptance;
- durable repository/branch/workspace identity per build.

## Durable interpretation

#69 is the **coding execution layer**, not the product-design layer. It should receive a frozen Build Contract and execute it through a provider-agnostic coding backend. The planned Asset Factory will sit in front of #69 and manufacture the Product Definition, Architecture Plan, Asset repo, and Build Contract that #69 consumes.

## Exit criterion

Money Scout can hand an approved build to a coding backend and persist execution state without treating the coding provider's own success report as acceptance.

---

# #70 Autonomous QA / Debug / Retest — COMPLETE

## Purpose

Make Build acceptance independent, repeatable, and autonomous.

## Delivered

- durable QA runs/events;
- independent QA adapter;
- Build Contract acceptance criteria enforcement;
- baseline checks;
- structured defect persistence;
- targeted repair -> fresh independent retest loop;
- bounded repair-cycle exhaustion;
- provider/capability gates;
- terminal cost accounting.

## Exit criterion

A Build can reach COMPLETE only after independent QA verifies the required contract and baseline health.

---

# #71 Controlled Deployment & Launch — COMPLETE

## Purpose

Separate "build passed QA" from "we are authorized to make it public."

## Delivered

- durable release jobs/events;
- preview-first release lifecycle;
- production release only after explicit public authority;
- provider continuity and release reconciliation;
- private preview health verification;
- production health verification;
- granular prohibition of charging/domain/credentials/outbound by default;
- Human Actions for missing release capability or public authority.

## Exit criterion

Money Scout can deploy a verified Build privately, verify it, request the precise public authority needed, and promote it without implying unrelated commercial permissions.

---

# #72 Self-Deployment / Runtime Autonomy — COMPLETE

## Purpose

Remove the owner from Money Scout's own deployment loop.

## Delivered

- GitHub `main` as deployment source of truth;
- exact green `main` push CI gate;
- staged detached-worktree candidate builds;
- API preflight with autonomous workers disabled;
- additive migration verification;
- live API promotion and rollback;
- root checkout synchronization;
- frontend runtime follower;
- verified stale Money Scout Vite listener takeover;
- safe refusal to kill unknown port owners;
- runtime health/freshness endpoint;
- previous-release retention.

## Exit criterion

A green merge to `main` can promote the live Money Scout API and frontend without manual Replit sync/reset, while failed candidates preserve the last healthy runtime.

---

# #73 Asset Activation & Operations Kernel — COMPLETE

## Purpose

Turn a verified public Release into a durable operating Asset.

## Delivered

- durable Asset object per Opportunity;
- Asset health checks;
- observations;
- incidents/events;
- Asset Control Center;
- read-only health monitoring;
- repeated-failure degradation and incident creation;
- automatic health recovery;
- inherited public-release authority only;
- commercial authorities default off;
- known build/release cost attribution;
- telemetry idempotency.

## Exit criterion

A verified public release becomes a durable Asset that Money Scout can monitor and recover at the lifecycle level without pretending it has revenue instrumentation or commercial authority.

---

# #74 Monetization Instrumentation & Autonomous Operations / Remediation — COMPLETE

## Purpose

Move Assets from "alive" to "measurable and maintainable."

## Delivered

- authoritative telemetry adapter contract;
- stable provider event IDs;
- explicit completeness windows;
- revenue/cost/transaction/usage/support observations;
- economic reviews;
- contribution-margin state only when revenue and cost coverage are sufficiently complete;
- telemetry sync audit records;
- durable remediation runs/events;
- bounded outage repair using existing Builder -> independent QA -> preview -> same-surface production -> live verification;
- provider continuity and QA-independence rules;
- zero-cash-only autonomous remediation until hard metered call ceilings exist;
- operator-facing economics/remediation state.

## Exit criterion

A live Asset can be measured from authoritative source data without turning missing telemetry into zero, and can autonomously repair availability failures without broadening its commercial scope.

---

# #75 Commercial Activation & Revenue Execution — COMPLETE

## Purpose

Enable a live Asset to become transaction-ready and collect real money without conflating public release, merchant access, production credentials, pricing, and charging authority.

## Delivered

- durable `commercial_activations` lifecycle and event audit;
- `payment_provider_events` with stable provider event/transaction identity;
- stable snapshot/fingerprint of the existing Monetization Execution Plan;
- numeric offer required with defensible provenance;
- merchant capability verification that does not infer readiness from account existence;
- verified production-credential capability plus separate Asset-specific credential-use authorization;
- explicit independent `CUSTOMER_CHARGING` authorization;
- checkout preparation with `chargingEnabled: false` before charging authority;
- zero-cash payment adapter contract;
- provider uncertainty -> `UNCERTAIN` with no blind retry;
- signed authoritative provider-event ingestion;
- successful payment -> append-only `FACT` revenue + transaction telemetry in #74's existing Asset observation ledger;
- refunds, partial refunds, chargebacks, and reversals -> idempotent compensating `FACT` revenue observations rather than mutation of original payment facts;
- verified commercial activation atomically transitions the Asset from `MONITOR_ONLY` to `OPERATING`;
- outbound, advertising, custom-domain, and external-spend authority remain unchanged by commercial activation;
- blocked pricing and resolved capability/authority Human Actions resume/close cleanly.

## Authority invariants proved

- public release != customer charging;
- merchant account existence != merchant capability;
- merchant capability != charging authority;
- production credentials require separate capability and authority;
- customer charging does not enable outbound/ads/domain/spend;
- payment-provider ambiguity does not authorize retry;
- append-only economic truth survives refund/reversal events.

## Exit criterion

Money Scout can prepare and verify a transaction-ready commercial path autonomously and, once the owner has granted the exact required authority/capability, accept a real customer payment whose authoritative provider event becomes auditable #74 economic telemetry.

## Operational Gate A — First real dollar

**OPERATIONAL GATE — not satisfied by fixture tests alone.** A real-world proof should verify:

- merchant/payment account is genuinely automation-ready;
- KYC/ownership prerequisites are complete;
- production credentials are securely connected through a supported secret bridge;
- the exact production-credential and charging authority are granted;
- a real bounded transaction succeeds;
- the authoritative event is observed once and only once;
- any later adjustment remains append-only and economically correct;
- the resulting revenue/cost state appears correctly in the Asset economic system.

No fake transaction should be used to claim this operational gate is complete.

---

# #76 Bet & Capital Allocation Kernel — COMPLETE

## Purpose

Create the missing durable separation between "validated Opportunity" and "capital/autonomous capacity has been allocated to pursue it."

## Why this matters

Money Scout ultimately allocates capital, not just workflows. A strong Opportunity should not automatically become a Build. The system needs an explicit Bet object that records what is being risked, why, under what constraints, and what evidence would cause continuation, iteration, pause, or withdrawal.

## Required capabilities

- durable `bets` and `bet_events` state;
- Bet status lifecycle;
- Opportunity/evaluation-cycle -> Bet decision contract;
- evidence-backed rationale/upside bounds without invented expected-value inputs;
- uncertainty, downside exposure, reversibility, maintenance/support burden, and human-dependency burden;
- success/failure/iterate criteria and decision horizon where applicable;
- explicit capital/resource allocation;
- allocated vs committed vs consumed vs remaining resources;
- reconciliation to existing downstream cost records rather than a contradictory second ledger;
- allocation/reconciliation idempotency;
- operator view of active/paused/exhausted/completed/withdrawn Bets;
- backward compatibility for historical Builds without fabricated historical Bet records;
- new post-#76 Build initiation requires an approved Bet through the application/orchestrator path.

## Build Envelope

#76 exposes a machine-readable Build Envelope for #77 Asset Factory. It expresses:

- maximum external build spend;
- allowed external-service budget;
- expected/acceptable build complexity;
- acceptable maintenance burden;
- acceptable operating-cost profile;
- required reversibility;
- permitted product scope derived from the approved commercial thesis;
- required acceptance/success criteria;
- whether only existing zero-cash capabilities may be used;
- hard constraints the future Architecture Composer must respect.

The Build Envelope is an investment constraint, not a Product Definition or Architecture Plan.

## Safety principles

- Do not manufacture expected value inputs.
- Unknown economics remain ranges/unknowns.
- Capital allocation authority must be separate from commercial side-effect authority.
- A Bet may be approved with zero external spend if it consumes only existing capacity.
- Bet allocation does not grant public release, customer charging, production credential use, outbound, advertising, domain changes, or positive external spend beyond separately authorized provider-safe bounds.
- A database Bet budget does not override provider-side hard-spend protections.

## Exit criterion

Every new downstream Build is attributable to an explicit approved Bet with bounded resources, a machine-readable decision contract, idempotent resource reconciliation, and a Build Envelope that the Asset Factory can safely consume.

---

# #77 Asset Factory & Real Builder Integration — IMPLEMENTED IN FEATURE BRANCH, PENDING MERGE

## Purpose

Turn an approved Bet into an isolated, traceable, industry-standard software business that the existing #69 Builder Workspace can execute and #70 independent QA can verify.

#77 should close the current gap between:

**"Money Scout decided this Bet is worth funding"**

and:

**"A real coding backend has an excellent, evidence-grounded product/repo/architecture/build contract to implement."**

## Core product rule — Competitive First Release

The default first-release target is **not** the thinnest technically functional MVP.

For an opportunity that has already survived validation, underwriting, and explicit Bet allocation, Money Scout should ordinarily build an **industry-standard, commercially competitive first version centered on the validated value proposition**.

The Factory should:

- build the validated core value proposition end to end;
- include category-standard functionality when evidence or strong category convention indicates omission would materially reduce credibility, usability, purchaseability, customer success, or the paid promise;
- include normal lifecycle/quality behavior required to make the product feel finished rather than prototype-like;
- defer speculative differentiation, unsupported enterprise breadth, and features whose ongoing complexity is not justified;
- optimize architecture against unnecessary ongoing operational/maintenance/security/support complexity rather than minimizing feature count by itself.

The architecture objective is:

> **Choose the least-complex architecture that supports the complete competitive product. Do not reduce commercially important product functionality merely to obtain a simpler architecture.**

## Product Definition synthesis

The Factory should consume a stable snapshot of upstream truth, including where applicable:

- Opportunity and evaluation-cycle state;
- relevant Research/Validation/underwriting evidence;
- Commercial Build Brief;
- Monetization Execution Plan;
- approved #76 Bet and Build Envelope;
- policy/access constraints;
- technical evidence.

The Product Definition must not casually rewrite locked commercial truth such as target buyer, validated problem, promised paid outcome, commercial/monetization thesis, policy constraints, Bet decision contract, or success/failure criteria.

Material requirements should preserve provenance/origin conceptually as:

1. **LOCKED_COMMERCIAL_TRUTH** — upstream fact/constraint that product synthesis may not casually reinterpret.
2. **EVIDENCE_BACKED_REQUIREMENT** — customer, competitor, marketplace, operational, or technical evidence justifies inclusion.
3. **FACTORY_STANDARD** — baseline quality/security/reliability/usability requirement that does not need buyer evidence.
4. **BOUNDED_PRODUCT_JUDGMENT** — a reversible product-design decision chosen to satisfy evidenced requirements efficiently; it must not be represented as observed buyer demand.
5. **BUILDER_DISCRETION** — ordinary low-level engineering detail intentionally delegated to the coding agent unless an approved reusable standard exists.

Category convention is evidence, not a command. Common functionality should not be mislabeled as customer demand, but it should also not be excluded merely because it is common when omission would make the product materially deficient.

## Product Definition structure

The frozen Product Definition should be machine-readable and auditable and should cover as applicable:

- identity/lineage/fingerprints;
- commercial truth;
- actors/jobs;
- customer-facing surfaces;
- core workflows;
- functional requirements;
- data semantics/freshness/retention/sensitivity;
- quality/security/reliability requirements;
- commercial/account lifecycle;
- operations/telemetry requirements;
- non-goals;
- deferred requirements;
- unresolved questions;
- acceptance contract.

Once a Product Definition enters Build, preserve that version as historical truth. Material scope changes create a new Product Definition version with rationale, evidence, Bet-envelope impact, and changed acceptance criteria.

## Adversarial product review

Before architecture composition, the Factory should attack its own Product Definition rather than merely approve it.

At minimum it should detect:

- unjustified scope/speculative additions;
- obvious underbuilding that would make the product noncompetitive or commercially unserious;
- product requirements falsely represented as market facts;
- missing commercial lifecycle required by the monetization model;
- missing operations/telemetry required for Money Scout to run the Asset;
- requirements that exceed the approved Bet Build Envelope.

The review should return concrete defects, not one blended average that can hide a fatal omission.

## Architecture Composer

After the Product Definition is frozen, compose an Architecture Plan that satisfies it inside the Bet Build Envelope.

The Composer should reason independently about:

- customer surfaces vs runtime components;
- persistence requirements;
- synchronous vs scheduled/background work;
- scraping/data collection method;
- queues/jobs only where needed;
- provider integrations;
- AI inference requirements;
- security/secret boundaries;
- deployment shape;
- health/telemetry/operations contract;
- cost and maintenance burden;
- reversibility;
- reusable capability vs custom build.

It should not automatically turn every business into a full-stack SaaS application.

## Software Capability Catalog

Introduce a reusable software-capability catalog separate from the existing operational Capability Registry.

Candidate capability families include:

- authentication/session/account boundaries;
- relational/persistent storage;
- scheduling/background jobs;
- scraping (lightweight HTTP and browser-capable where needed);
- proxying;
- webhooks;
- queues/durable jobs;
- email/notifications;
- payments/subscription integration interfaces;
- file/object storage;
- search;
- export;
- external API integration;
- AI inference;
- rate limiting;
- telemetry/health/observability;
- deployment/runtime conventions.

Catalog entries should eventually expose compatibility, dependencies, version, known limitations, operational burden, security/authority implications, cost profile, available templates/modules, and QA history.

Reuse is preferred only when it actually satisfies the Product Definition. If no reusable component fits, the Factory may mark the requirement `CUSTOM_BUILD_REQUIRED`; a verified custom component may later be promoted into the catalog.

## Asset repo provisioning

Each new portfolio business should ordinarily receive an isolated repository/workspace rather than be implemented inside the Money Scout control-plane repository.

Before builder dispatch, provision a repo with appropriate code/test/CI scaffolding plus durable context such as:

- `AGENTS.md`;
- `PRODUCT.md`;
- `ARCHITECTURE.md`;
- `BUILD_CONTRACT.md`;
- `OPERATIONS.md`;
- machine-readable Product Definition/Architecture/Capability manifests.

The exact scaffold should match the product rather than forcing automations, scrapers, APIs, data products, bots, extensions, and web apps into one shape.

## Builder integration

#77 must connect the Factory output to a **real coding backend** through the existing #69 generic Builder Adapter contract.

Money Scout should remain provider-agnostic. The production coding backend may change without changing the Product Definition/Architecture/Build Orchestrator contract.

Before selecting or implementing a specific Codex/OpenHands/other bridge, verify the provider's current programmatic interface rather than assuming one exists.

Builder completion remains only a claim and must hand into existing #70 independent QA. Repair/retest semantics remain unchanged.

The #77 implementation uses an official Codex SDK driver behind a provider-neutral Builder Gateway. The Gateway owns narrow Git credentials, gives the coding agent a sanitized secret-free environment and fresh disposable checkout, enforces frozen manifests, and records the exact pushed commit. It normalizes product/architecture challenges separately from dependency/resource/provider outcomes.

Real metered execution is deliberately fail-closed. `UNKNOWN` cost is not zero, remaining Bet budget is not a run authorization, and neither human request-body identity text nor internal automation credentials can create spend authority. Before a paid provider side effect, Money Scout must have a provider-enforceable maximum incremental cost for that exact run and atomically reserve it against the applicable Bet/build envelope. The current shared financial layer cannot provide that atomic reservation, and the official SDK does not expose a trustworthy per-run cash ceiling, so the real-money path remains blocked while zero-cost test drivers exercise the contract. A verified entitlement may be eligible only if it cannot silently fall back to pay-as-you-go.

## Traceability

The target lineage is:

**Evidence -> Requirement -> Product Definition -> Architecture component -> Build Contract criterion -> code -> independent QA -> released behavior -> customer/economic outcome.**

This lineage should later support #82 learning/calibration without rewriting historical evidence.

## Visual/product design scope

A shared portfolio visual/brand design system is **not** on the critical path for #77.

Until that system is designed deliberately with the owner, generated customer-facing products should meet a neutral professional UI/UX quality floor. The future shared design language can be integrated as a reusable frontend capability without changing the core Factory architecture.

## Exit criterion

Given an approved Bet and Build Envelope, Money Scout can autonomously create a versioned evidence-grounded Product Definition, verify that it represents a commercially competitive first release, compose a bounded architecture, select/provision reusable/custom capabilities, create an isolated self-describing Asset repo and Build Contract, dispatch a real coding backend through #69, and hand the result into existing independent QA without the owner acting as routine product manager or deployment relay.

---

# #78 Live Asset Decision Engine — PLANNED

## Purpose

Make Money Scout decide what to do with operating Assets based on real evidence.

## Planned decisions

- CONTINUE;
- IMPROVE;
- SCALE;
- PAUSE;
- KILL / ARCHIVE;
- WATCH when a decision genuinely depends on more time/data.

## Inputs

- authoritative revenue/cost/transaction telemetry;
- contribution margin and coverage quality;
- customer/usage/support signals;
- health and incident burden;
- maintenance/repair cost;
- capital already deployed;
- original Bet thesis and success/failure contract;
- Product Definition / architecture lineage where relevant;
- evidence quality and sample size;
- reversibility;
- available portfolio alternatives.

## Required behavior

- no kill from missing instrumentation alone;
- no scale decision from engagement without economic evidence;
- no single average score that masks fatal evidence;
- explicit reason/evidence trail for each decision;
- reversible improvement experiments before killing where appropriate;
- bounded improvement budget;
- no external spend or commercial authority expansion without the corresponding authority.

## Exit criterion

A measured Asset can autonomously generate a defensible continue/improve/scale/pause/kill decision and execute the machine-authorized parts of that decision.

---

# #79 Distribution & Growth Execution — PLANNED

## Purpose

Turn validated commercial channels into bounded autonomous customer acquisition rather than relying on an owner to manually market each Asset.

## Planned capabilities

- durable distribution experiments;
- channel-specific adapters;
- offer/channel linkage to original evidence;
- marketplace publication/optimization where authorized;
- narrowly targeted outbound only with explicit outbound authority;
- advertising only with explicit advertising + spend authority;
- attribution of acquisition cost and customer source;
- conversion funnel observations;
- stop-loss rules;
- experiment-level spend ceilings;
- autonomous creative/message iteration inside approved scope;
- channel shutdown when economics invalidate the thesis.

## Guardrails

- paid acquisition cannot be the default when a cheaper evidenced channel exists;
- outbound authority is independent of charging authority;
- ad authority is independent of general spend authority unless explicitly bundled;
- CAC must not be inferred from incomplete attribution.

## Exit criterion

Money Scout can run an approved acquisition test, observe attributable conversion economics, and stop/iterate/scale the channel according to bounded evidence-based rules.

---

# #80 Customer & Support Operations — PLANNED

## Purpose

Reduce human operating burden after customers exist.

## Planned capabilities

- customer/account lifecycle state where the product shape requires it;
- support event ingestion;
- issue classification;
- safe automated resolution for reversible support tasks;
- refund/cancellation request routing with explicit financial authority boundaries;
- customer-impact incident linkage;
- fulfillment failure detection;
- SLA/response metrics where relevant;
- recurring maintenance workload measurement;
- escalation only for true human/legal/financial boundaries.

## Guardrails

- support automation may not fabricate policy promises;
- refunds/credits/financial concessions require explicit bounded authority;
- customer-facing claims must be grounded in actual product/provider state;
- sensitive credentials/data remain scoped to the minimum capability required.

## Exit criterion

Routine post-sale customer operations can run without the owner becoming the default support desk, while financial/legal exceptions remain appropriately gated.

---

# #81 Portfolio Reinvestment & Rebalancing Engine — PLANNED

## Purpose

Close the capital loop across multiple Bets and Assets.

## Planned capabilities

- portfolio cash/capital state;
- available vs committed capital;
- realized Asset cash flow;
- expected near-term obligations;
- agent/capacity constraints;
- ranked next-use-of-capital decisions;
- reallocation from weak Bets/Assets to stronger ones;
- scale budgets for proven Assets;
- new-Bet budgets for validated Opportunities;
- reserve requirements;
- bounded reinvestment policies;
- explicit owner-configured global capital ceiling.

## Decision principle

The portfolio should compare the marginal expected return of:

- spending another dollar on an existing Asset;
- improving a struggling Asset;
- funding a new Bet;
- holding cash/reserve;
- retiring an Asset.

## Exit criterion

Money Scout can recommend and, within configured authority, execute portfolio-level capital reallocation rather than treating each Asset in isolation.

---

# #82 Learning & Signal Calibration Loop — PLANNED

## Purpose

Use real portfolio outcomes to improve future Discovery, underwriting, product synthesis, architecture composition, and operations without allowing self-reinforcing hallucinated correlations.

## Planned capabilities

- link original Discovery/Research/Validation signals to downstream Bet/Asset outcomes;
- link Product Definition requirements and architecture/capability choices to downstream outcomes;
- measure which signals and repeated product/build patterns correlate with real commercial success/failure;
- calibrate priors or ranking weights only when sample quality supports it;
- preserve original evidence and model/version lineage;
- distinguish causal evidence from correlation;
- detect repeated failure modes in build, distribution, pricing, support, and operations;
- promote proven reusable capability patterns cautiously;
- feed validated lessons back into candidate prioritization, product synthesis, architecture choice, and experiment selection.

## Guardrails

- small samples do not justify aggressive weight changes;
- post-launch outcomes do not rewrite historical evidence/Product Definitions;
- learning changes must be versioned and reversible;
- do not optimize solely for short-term revenue if maintenance/capital burden destroys return.

## Exit criterion

Money Scout becomes measurably better at selecting, manufacturing, and operating future opportunities based on audited portfolio experience.

---

# #83 Provider, Credential, Spend & Recovery Hardening — PLANNED

## Purpose

Move from architecture-complete generic adapters to robust real-provider operation across the portfolio.

## Planned capabilities

- production-grade builder/QA/release/payment/telemetry/distribution adapters;
- provider-side hard max-cost contracts where supported;
- credential expiry/revocation detection;
- provider continuity/migration workflows;
- secret rotation and least-privilege access;
- webhook idempotency/replay protection;
- provider outage reconciliation;
- exact billing/cost ingestion;
- failover where safe and explicitly authorized;
- audit-grade provider run history.

## Exit criterion

The system can survive routine provider/runtime failures without blind spend, silent authority changes, duplicated side effects, or owner-driven manual recovery.

---

# #84 Closed-Loop Portfolio Acceptance — PLANNED

## Purpose

Prove the Money Scout thesis end-to-end in reality, not only through fixtures.

## Acceptance scenario

At least one real Opportunity should demonstrate the full chain:

1. discovered from external market data;
2. researched with attributable evidence;
3. validated/underwritten;
4. funded as an explicit Bet with a bounded Build Envelope;
5. converted by the Asset Factory into a traceable Product Definition/Architecture/Asset repo/Build Contract;
6. built through a real Builder backend;
7. independently QA'd;
8. released through controlled deployment;
9. activated as an Asset;
10. commercially activated with correct authority;
11. receives real authoritative transaction/revenue telemetry;
12. operates with health/support/economic monitoring;
13. receives at least one evidence-backed improve/continue/scale/pause/kill decision;
14. portfolio capital is reallocated based on measured outcome;
15. the outcome feeds back into future opportunity/product/architecture ranking and learning.

## Exit criterion

The owner is not performing routine research, product definition, coding, deployment, monitoring, support triage, or portfolio bookkeeping. Human involvement is limited to configured capital/authority limits, deliberate portfolio design standards when desired, and genuine human-only external requirements.

---

# Cross-cutting operational gates

These are not substitutes for milestones and should never be marked complete using simulations alone.

## Provider connectivity

Real production operation eventually requires automation-ready access to the relevant provider classes:

- research/evidence providers;
- builder coding provider;
- independent QA provider;
- controlled release/deployment provider;
- payment/merchant provider;
- telemetry/economic data provider;
- distribution/acquisition providers where used.

Generic adapter architecture may be complete before these real capabilities are connected.

## Capital configuration

The owner must eventually set portfolio-level capital policy, including:

- total capital at risk;
- reserve floor;
- maximum per-Bet exposure;
- maximum autonomous external spend;
- which side effects require per-instance approval vs standing bounded authority.

Money Scout must not infer these limits.

## Human-only identity/legal gates

Merchant KYC, entity formation, tax configuration, contractual acceptance, domain ownership, provider terms, and similar external obligations may require the owner. Money Scout should surface them as structured capabilities/Human Actions and resume automatically after verification.

---

# What not to prioritize before the loop closes

Unless required by a live blocker, defer work whose main value is cosmetic or platform-general rather than economic-loop completion, including:

- broad SaaS multi-tenancy for Money Scout itself;
- public user onboarding for Money Scout itself;
- generic chatbot features;
- complex billing for selling Money Scout;
- generalized no-code app-builder features;
- large Money Scout operator-UI redesigns disconnected from operator decision quality;
- making a shared portfolio visual/design system a prerequisite for the core Asset Factory;
- premature model fine-tuning before real outcome data exists.

A shared portfolio design system is still desirable and can be added after the Factory's core product/architecture/repo/builder machinery is proven.

The product should first become excellent at autonomously allocating capital, manufacturing competitive businesses, operating them, and learning from real outcomes.
