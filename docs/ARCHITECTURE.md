# Money Scout Architecture

## Purpose

Money Scout is a private autonomous operating system for creating and managing a portfolio of small digital businesses. Its job is not merely to find ideas. It should discover opportunities, reduce uncertainty, allocate capital, build and launch assets, observe real economics, operate them, and continuously reallocate resources toward the best expected return.

The system is designed around durable state machines, explicit evidence provenance, granular authority, independent verification, and bounded external cost.

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
 capital + agent capacity
        |
        v
      BUILD
 commercial contract
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

Evidence is persisted with source, provenance, scope, and time context. The system distinguishes facts from claims, inference, and unknowns. Evidence is consumed by Research, Validation, underwriting, pricing, commercial activation, and later portfolio decisions.

### Evaluation cycle

A durable evaluation cycle tracks the current Research/Validation/underwriting state for an Opportunity. Repeated runs must remain auditable and idempotent.

### Bet

A Bet is the explicit commitment of capital and autonomous capacity to an Opportunity. It should eventually become the portfolio's main allocation object, separating "good idea" from "we are deploying resources into this."

Bet-level capital includes money, paid services, agent/build capacity, maintenance burden, support burden, and human-only approvals.

### Build

A Build is implementation of the approved Commercial Build Brief and Build Contract. It has a durable job/workspace and a provider identity. A successful builder response is only a claim that implementation completed.

### QA run

QA is independent verification of the Build Contract and baseline health. Builder and QA provider independence is enforced where required. Defects route into targeted repair followed by fresh independent retest.

### Release

Release is a separate controlled state machine. Preview is verified before production. Public release, charging, domains, credentials, outbound, advertising, and spend are independent authorities.

### Asset

An Asset is a verified publicly launched business surface linked to its Opportunity, Build, Release history, production endpoint, operating policy, authorities, telemetry, health checks, incidents, and measured economics.

An Asset can be live but commercially inactive. That is not a failure state.

### Commercial Activation

Commercial Activation bridges a live Asset to an actual paid transaction path. It should consume the existing monetization thesis rather than inventing a new one. Activation requires defensible offer/price provenance, verified merchant capability, appropriately authorized production credential use, and explicit charging authority.

### Observation / telemetry

Post-launch observations are durable and idempotent. Revenue, cost, transaction, usage, support, and custom events preserve provenance. Only authoritative `FACT` observations affect observed economic aggregates.

Coverage matters: absence of events may only be interpreted as zero for a window when the source proves the window is complete.

### Economic review

Economic reviews compute contribution-margin state only from sufficiently complete authoritative coverage. Missing revenue or cost coverage remains incomplete/unknown, not zero.

### Incident / remediation run

Operating incidents are durable. Availability incidents can trigger bounded autonomous repair using the existing Builder -> independent QA -> preview -> same-surface production -> live verification chain. Repair does not silently expand commercial authority.

### Capability

A Capability is durable proof that a provider/account/integration is automation-ready at a specific access level. Account existence does not equal capability. Capability state may expire or be revoked.

### Human Action

A Human Action represents a genuine human-only dependency with structured instructions and a machine-verifiable resume contract. It is not a generic escalation mechanism for missing research or ordinary engineering work.

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

The Commercial Build Brief translates validated evidence into a narrow build contract. The Monetization Execution Plan defines the first commercial commitment test, pricing confidence state, distribution hypothesis, venture-budget rules, and prohibited inference. It is deterministic and does not invent an exact price merely to advance the pipeline.

### 6. Build / QA

Builder Workspace provides durable coding-provider state. Autonomous QA independently verifies the result. Repair cycles are bounded. Build completion requires independent acceptance, not builder self-report.

### 7. Controlled Release

Release requires private preview first, then explicit public authority for initial production. Production health is independently verified. Side-effect authorities remain granular.

### 8. Money Scout self-deployment

Money Scout's own runtime watches GitHub `main`. Exact push CI must be green before promotion. The supervisor stages a detached worktree, installs dependencies, builds API/frontend, performs preflight/migrations/health, promotes the live API, syncs the root checkout, and refreshes the frontend. Failed candidate work must not disturb the last healthy runtime. Rollback preserves the previous release.

### 9. Asset Operations

Verified public releases activate durable Assets. Asset workers perform read-only health checks, authoritative telemetry ingestion, economic reviews, incident creation/recovery, and bounded maintenance remediation. Unknown revenue/usage/support states remain explicitly uninstrumented until attributable telemetry exists.

### 10. Commercial Activation

Current forward milestone. It adds the capability and authority path required to make a live Asset transaction-ready without conflating merchant access, production credentials, public release, and customer charging.

### 11. Portfolio allocation

Planned layer. The portfolio should decide where to deploy the next unit of capital or autonomous capacity using measured Asset economics, unresolved uncertainty, reversibility, expected upside, and opportunity cost.

## Authority model

Authority is additive and scoped. The system should model at least these independently:

- public release;
- customer charging;
- outbound outreach;
- advertising / paid acquisition;
- custom domain;
- production credentials;
- external spend ceiling.

A subsystem may only inherit authority when its contract explicitly defines the inheritance and the action stays within the same approved scope.

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

Money Scout's UI is a holding-company control center. Default views emphasize current status and next action; detailed research, provenance, provider history, and audit events are drill-down information.

The operator should be able to understand the state of an Opportunity/Bet/Asset quickly without reading raw worker logs.

## Architectural completion criterion

Money Scout reaches its core product thesis when a new Opportunity can flow from Discovery to a measured operating Asset and the system can use real economic results to decide whether to improve, scale, pause, kill, or reinvest, with human involvement limited to genuine authority/capability boundaries.
