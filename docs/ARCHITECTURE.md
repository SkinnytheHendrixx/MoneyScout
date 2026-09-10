# Money Scout Architecture

## Purpose

Money Scout is a private autonomous operating system for creating and managing a portfolio of small digital businesses. Its job is not merely to find ideas. It should discover opportunities, reduce uncertainty, allocate capital, design/build/launch businesses, observe real economics, operate them, and continuously reallocate resources toward the best expected return.

The system is designed around durable state machines, explicit evidence provenance, granular authority, independent verification, bounded external cost, and traceable product/architecture decisions.

## Canonical lifecycle

```text
External market signals
        |
        v
   DISCOVERY
        |
        v
  Candidate / RevOpp
        |
        v
    RESEARCH
  policy + demand
        |
        v
   VALIDATION
 kill risks + 13 factors
        |
        v
  UNDERWRITING
        |
        v
       BET
 capital + build envelope
        |
        v
  ASSET FACTORY
 product definition
 architecture composition
 repo + build contract
        |
        v
      BUILD
 coding-agent execution
        |
        v
 INDEPENDENT QA
 repair / retest loop
        |
        v
 CONTROLLED RELEASE
 preview -> authorized production
        |
        v
      ASSET
 durable operating business
        |
        v
 COMMERCIAL ACTIVATION
 offer + capabilities + charging authority
        |
        v
   OPERATIONS
 health + telemetry + support + maintenance
        |
        v
 ECONOMIC DECISIONING
 improve / scale / pause / kill
        |
        v
 PORTFOLIO ALLOCATION
 reinvest into best next use of capital
        |
        +-------------------------------> Discovery / Bets / Assets
```

The full loop is not complete until measured portfolio outcomes can influence future capital allocation and opportunity selection.

## Core domain objects

### Opportunity / RevOpp

An Opportunity is a hypothesis that a specific problem, buyer, product shape, and market condition may support an economically viable business. Discovery may produce weak quantitative signals; Research and Validation decide whether the hypothesis deserves capital.

An Opportunity is not an Asset and must not be treated as revenue-producing merely because research is favorable.

### Evidence

Evidence is persisted with source, provenance, scope, and time context. The system distinguishes facts from claims, inference, and unknowns. Evidence is consumed by Research, Validation, underwriting, pricing, product synthesis, commercial activation, and later portfolio decisions.

### Evaluation cycle

A durable evaluation cycle tracks the current Research/Validation/underwriting state for an Opportunity. Repeated runs must remain auditable and idempotent.

### Bet

A Bet is the explicit commitment of capital and autonomous capacity to an Opportunity. It separates "good idea" from "we are deploying resources into this."

Bet-level capital includes money, paid services, agent/build capacity, maintenance burden, support burden, and human-only approvals.

A Bet should expose a machine-readable **Build Envelope** that the future Asset Factory can consume. The envelope constrains resource use, acceptable complexity/maintenance burden, reversibility, and product scope without dictating implementation details.

### Product Definition

A Product Definition is the versioned statement of what the funded product must do for the buyer and commercial thesis before architecture is chosen.

It should include, where applicable:

- lineage to Opportunity/evaluation/Bet and upstream snapshots;
- locked buyer/problem/promise/commercial truth;
- actors and jobs;
- customer-facing surfaces;
- core workflows;
- functional requirements;
- data semantics and important freshness/retention/sensitivity constraints;
- quality/security/reliability expectations;
- commercial lifecycle requirements;
- operations/telemetry requirements;
- explicit non-goals and deferred requirements;
- unresolved questions;
- acceptance conditions.

Material requirements preserve why they exist. Supported origins are conceptually:

- locked upstream commercial truth;
- evidence-backed requirement;
- Factory standard;
- bounded product judgment; or
- builder discretion.

Product judgment is allowed but may not masquerade as observed buyer/market evidence.

Once frozen for Build, a Product Definition is historical truth. Material scope changes create a new version rather than silently mutating the contract under an active builder.

### Architecture Plan

The Architecture Plan is the technical composition selected to satisfy a frozen Product Definition inside the Bet's Build Envelope.

Its default objective is **the least-complex architecture that supports the complete competitive product**. It should minimize unnecessary provider dependencies, infrastructure, security surface, failure modes, maintenance/support burden, and irreversible decisions without reducing commercially important product functionality merely to simplify engineering.

### Software Capability Catalog

The future Asset Factory should maintain a reusable catalog of proven software capabilities and patterns such as authentication, persistence, scheduling, scraping, webhooks, payments, email, file storage, search, AI inference, queues, telemetry, health checks, and deployment conventions.

Catalog entries should eventually expose compatibility, dependencies, cost/authority implications, operational burden, known limitations, version, and QA history.

Reuse is preferred when it satisfies the Product Definition. A missing or unsuitable reusable capability may legitimately result in a custom build; proven custom components may later be promoted into the catalog.

This software capability catalog is separate from Money Scout's existing operational **Capability Registry**, which proves whether an external provider/account/integration is currently automation-ready.

### Asset repo

Each new portfolio business should ordinarily have an isolated repository/workspace rather than live inside the Money Scout control-plane repo.

A generated repo should explain itself to coding agents and operators through versioned machine-readable contracts plus documents such as:

- `AGENTS.md`;
- `PRODUCT.md`;
- `ARCHITECTURE.md`;
- `BUILD_CONTRACT.md`;
- `OPERATIONS.md`.

The repo should also contain the appropriate code/workflow definitions, tests, CI, environment contract, health/telemetry hooks, and deployment metadata for its product type.

### Build

A Build is coding-agent implementation of the approved Product Definition/Architecture Plan/Build Contract. It has a durable job/workspace and provider identity. A successful builder response is only a claim that implementation completed.

The #69 Builder Workspace remains the execution layer rather than the product-design layer.

### QA run

QA is independent verification of the Build Contract and baseline health. Builder and QA provider independence is enforced where required. Defects route into targeted repair followed by fresh independent retest.

### Release

Release is a separate controlled state machine. Preview is verified before production. Public release, charging, domains, credentials, outbound, advertising, and spend are independent authorities.

### Asset

An Asset is a verified publicly launched business surface linked to its Opportunity, Bet where available, Build, Release history, production endpoint, operating policy, authorities, telemetry, health checks, incidents, and measured economics.

An Asset can be live but commercially inactive. That is not a failure state.

### Commercial Activation

Commercial Activation bridges a live Asset to an actual paid transaction path. It consumes the existing monetization thesis rather than inventing a new one. Activation requires defensible offer/price provenance, verified merchant capability, appropriately authorized production credential use, and explicit charging authority.

Verified commercial activation transitions the Asset into `OPERATING` without granting unrelated outbound, advertising, domain, or spend authority.

### Observation / telemetry

Post-launch observations are durable and idempotent. Revenue, cost, transaction, usage, support, and custom events preserve provenance. Only authoritative `FACT` observations affect observed economic aggregates.

Coverage matters: absence of events may only be interpreted as zero for a window when the source proves the window is complete.

Successful payment facts remain immutable. Later refunds, partial refunds, chargebacks, and reversals are recorded as new compensating factual observations so realized/net economics can change without rewriting history.

### Economic review

Economic reviews compute contribution-margin state only from sufficiently complete authoritative coverage. Missing revenue or cost coverage remains incomplete/unknown, not zero.

### Incident / remediation run

Operating incidents are durable. Availability incidents can trigger bounded autonomous repair using the existing Builder -> independent QA -> preview -> same-surface production -> live verification chain. Repair does not silently expand commercial authority.

### Capability

A Capability is durable proof that a provider/account/integration is automation-ready at a specific access level. Account existence does not equal capability. Capability state may expire or be revoked.

### Human Action

A Human Action represents a genuine human-only dependency with structured instructions and a machine-verifiable resume contract. It is not a generic escalation mechanism for missing research or ordinary engineering work.

## Product synthesis model

The Asset Factory must be creative enough to design coherent products but conservative about what it claims as evidence.

### Upstream truth that product synthesis may not casually rewrite

Examples include:

- target buyer;
- validated problem;
- promised paid outcome;
- monetization/distribution thesis;
- policy/access constraints;
- Bet decision contract and Build Envelope;
- success/failure/iterate criteria.

A product synthesizer that decides the target buyer or business thesis should change is proposing a new Opportunity/Bet decision, not merely designing the product.

### Evidence-backed requirements

Customer, competitor, marketplace, operational, or technical evidence may justify functionality beyond the literal minimum outcome. Category-standard functionality should normally be included when its omission would materially reduce credibility, usability, purchaseability, customer success, or delivery of the paid promise.

Commonality alone is not buyer-demand evidence, but "do not add features merely because they are common" must not be misused as a reason to ship a visibly deficient product.

### Factory standards

Some requirements do not require market research, including appropriate validation, failure visibility, safe secret handling, observability, loading/empty/error behavior, accessibility/responsiveness where applicable, and reliable lifecycle handling.

### Bounded product judgment

The system may make reversible design choices needed to connect evidence into a coherent product. These choices must be labeled as product judgment rather than represented as externally observed facts.

### Competitive First Release standard

For a Bet that has already survived validation and underwriting, the first customer-facing release should ordinarily be an **industry-standard, commercially competitive first version** rather than the thinnest technically functional MVP.

The first-release product should cover:

- the validated core value proposition end to end;
- category-standard functionality whose absence would make the product materially deficient;
- commercial/account lifecycle necessary for the chosen monetization model;
- complete normal customer journeys and failure states;
- operational/telemetry hooks required for Money Scout to operate and learn from the Asset.

Speculative differentiation, unsupported enterprise breadth, and expensive ongoing complexity remain deferrable.

## Major subsystems

### 1. Discovery

Purpose: detect market smoke without pretending Discovery itself proves a business.

Discovery workers collect source-platform data, create bounded quantitative observations, preserve catalog/slice coverage semantics, and generate Candidates only when supported by allowed signal rules.

Discovery should not make unsupported whole-market claims from partial catalog slices.

### 2. Research

Purpose: determine whether an Opportunity is permitted, demanded, and worth deeper validation.

Research includes bounded policy/access analysis, demand analysis, evidence persistence, provider/cost controls, and a durable orchestrator. Paid research is bounded and must not be blindly replayed after ambiguous provider failures.

### 3. Validation and underwriting

Purpose: attack the thesis rather than merely accumulate supporting evidence.

Validation includes kill-risk collection, evidence collection, 13-factor assessment, deterministic underwriting, adversarial challenge, cheapest falsifying experiments, and WATCH when the answer genuinely depends on time.

Canonical factors:

1. Buyer / Budget Clarity
2. Problem Intensity / Recurrence
3. Demand Trajectory / Durability
4. Monetization Proof / Price Tolerance
5. Competitive Beatability / Gap Quality
6. Distribution Accessibility / Acquisition Economics
7. Adoption / Switching Friction
8. Economic Headroom
9. Build Complexity / Technical Uncertainty
10. Operating / Maintenance Burden
11. Unit Economics / Pricing Power
12. Capital at Risk / Reversibility
13. Falsifiability / Feedback Velocity

Evidence quality is an independent overlay. Fatal kill signals are not averaged away.

### 4. Autonomous resolution and Human Gates

Purpose: eliminate the owner as a routine knowledge/debug bottleneck.

Before human escalation for a knowledge gap, the system should exhaust applicable methods such as direct research, proxy research, economic inference, adversarial review, alternative thesis, safe experiment, and temporal WATCH.

Human Actions remain appropriate for credentials, KYC, legal/ownership actions, spending authority, irreversible side effects, and genuine judgment after exhaustion.

### 5. Commercial planning

The Commercial Build Brief and Monetization Execution Plan translate validated evidence into the current pre-Bet commercial/build contract. They define the first commercial commitment test, pricing confidence state, distribution hypothesis, venture-budget rules, and prohibited inference. They do not invent an exact price merely to advance the pipeline.

The existing narrow/minimum-sellable language in this pre-Factory code is historical scaffolding. The planned Asset Factory must supersede its product-scope semantics with the Competitive First Release standard while preserving its useful locked commercial evidence and authority constraints.

### 6. Bet / Capital Allocation

Current forward milestone (#76). It creates the first-class allocation object between underwriting and Build and provides the bounded resource/decision contract that later Factory/Build work must consume.

### 7. Asset Factory

Planned immediately after #76. It should:

- snapshot upstream truth;
- synthesize/version a traceable Product Definition;
- identify evidence-backed/category-standard/Factory-standard/bounded-judgment requirements;
- adversarially review underbuilding and unjustified scope;
- enforce the Competitive First Release quality bar;
- compose the least-complex suitable architecture within the Bet Build Envelope;
- select reusable software capabilities when appropriate;
- provision an isolated Asset repo/workspace;
- generate machine-readable product/architecture/operations/build contracts;
- dispatch a real coding provider through the existing #69 Builder Workspace;
- hand completion into existing independent QA.

A shared portfolio visual design system is intentionally not on the critical path of this core Factory milestone. It can be layered in later as a reusable frontend capability.

### 8. Build / QA

Builder Workspace provides durable coding-provider state. Autonomous QA independently verifies the result. Repair cycles are bounded. Build completion requires independent acceptance, not builder self-report.

### 9. Controlled Release

Release requires private preview first, then explicit public authority for initial production. Production health is independently verified. Side-effect authorities remain granular.

### 10. Money Scout self-deployment

Money Scout's own runtime watches GitHub `main`. Exact push CI must be green before promotion. The supervisor stages a detached worktree, installs dependencies, builds API/frontend, performs preflight/migrations/health, promotes the live API, syncs the root checkout, and refreshes the frontend. Failed candidate work must not disturb the last healthy runtime. Rollback preserves the previous release.

### 11. Asset Operations

Verified public releases activate durable Assets. Asset workers perform read-only health checks, authoritative telemetry ingestion, economic reviews, incident creation/recovery, and bounded maintenance remediation. Unknown revenue/usage/support states remain explicitly uninstrumented until attributable telemetry exists.

### 12. Commercial Activation

Implemented in #75. Commercial Activation safely prepares and verifies a transaction-ready payment path using provenance-backed pricing, verified merchant capability, verified/authorized production credentials, and separate explicit customer-charging authority. Signed provider events enter the existing #74 observation ledger, including append-only refund/reversal adjustments.

### 13. Economic decisioning and portfolio allocation

Planned layers use measured Asset economics, unresolved uncertainty, reversibility, Bet thesis, maintenance/support burden, and opportunity cost to decide whether to continue, improve, scale, pause, kill, or reallocate capital.

## Authority model

Authority is additive and scoped. The system should model at least these independently:

- capital allocation / Bet approval;
- public release;
- customer charging;
- outbound outreach;
- advertising / paid acquisition;
- custom domain;
- production credentials;
- external spend ceiling.

A Bet budget does not grant downstream commercial authority. A subsystem may only inherit authority when its contract explicitly defines the inheritance and the action stays within the same approved scope.

## Failure model

Classify failures before retrying:

- **Transient infrastructure** -> safe bounded recovery/reconciliation.
- **Semantic uncertainty** -> autonomous resolution or experiment.
- **External future condition** -> WATCH.
- **Human authority/capability** -> Human Action.
- **Permanent fatal evidence** -> stop/reject/kill.

Never use blind paid retries as a generic recovery strategy.

## Runtime and provider architecture

External providers are accessed through adapters with persisted provider identity, run IDs, idempotency keys, cost mode, and terminal-state reconciliation. Generic adapters must fail closed when required authority, provider continuity, independent verification, or hard cost bounds cannot be proven.

Real external provider connectivity is deliberately separate from the state-machine architecture. Zero-cash fixtures/simulations are used heavily in CI.

## Operator experience

Money Scout's own UI is a holding-company control center. Default views emphasize current status and next action; detailed research, provenance, provider history, and audit events are drill-down information.

The operator should be able to understand the state of an Opportunity/Bet/Asset quickly without reading raw worker logs.

Customer-facing Asset design is a separate concern. A future shared portfolio design system can compound quality and speed but is not required to prove the core Asset Factory.

## Architectural completion criterion

Money Scout reaches its core product thesis when a new Opportunity can flow from Discovery through an explicit Bet and traceable Asset Factory into a measured operating Asset, and the system can use real economic results to decide whether to improve, scale, pause, kill, or reinvest, with human involvement limited to genuine authority/capability boundaries.
