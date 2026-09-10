# Money Scout Roadmap

## North star

Money Scout should autonomously convert external market signals into a portfolio of measured operating businesses, then decide where the next dollar and agent-hour should go.

The target closed loop is:

**Discover -> Research -> Validate -> Underwrite -> Bet -> Build -> QA -> Release -> Activate -> Operate -> Measure -> Improve / Scale / Pause / Kill -> Reinvest.**

The roadmap is intentionally ordered around closing this economic loop. Features that do not materially advance the loop should not displace core milestones.

## How to use this file

- Completed milestone numbers and their intent are historical and should not be redefined.
- The current milestone is the next implementation focus unless a blocking infrastructure defect must be fixed first.
- Planned milestone numbering after the current milestone is canonical planning, but a milestone may be split when implementation proves the scope too large. If that happens, update this file explicitly rather than silently changing direction.
- A milestone is not complete because code exists. It must satisfy its exit criteria, tests, and applicable runtime verification.
- Human-only operational gates such as KYC, merchant onboarding, or credential granting are tracked separately from code completion.

## Status legend

- **COMPLETE**: merged to `main`, CI green, and runtime behavior verified where applicable.
- **CURRENT**: active implementation target.
- **PLANNED**: intended next architecture work.
- **OPERATIONAL GATE**: requires real-world capability/authority rather than only code.

---

# Foundation already completed

Before milestones #69–#74, Money Scout established the core opportunity-evaluation system. The exact implementation history is preserved in prior `docs/task-*.md` files and Git history. The durable capabilities include:

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

These foundations mean the roadmap after #68 is primarily about turning validated opportunities into self-operating economic assets.

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

# #75 Commercial Activation & Revenue Execution — CURRENT

## Purpose

Enable a live Asset to become transaction-ready and collect real money without conflating public release, merchant access, production credentials, pricing, and charging authority.

## Required design

Commercial Activation should be a durable Asset-level lifecycle. It must consume the existing Monetization Execution Plan rather than invent a second commercial thesis.

The activation path must independently verify:

1. a numeric offer with defensible provenance;
2. automation-ready merchant/payment capability;
3. verified production credential capability;
4. explicit authority to use production credentials where required;
5. explicit `CUSTOMER_CHARGING` authority;
6. zero unintended expansion into outbound, ads, domain purchase, or unrelated spend;
7. transaction-readiness verification before treating the Asset as commercially active.

## Required state behavior

A representative lifecycle should distinguish states such as:

- commercially inactive but live;
- waiting for offer provenance;
- waiting for merchant capability;
- waiting for production credentials;
- waiting for charging authority;
- configuring payment/checkout;
- verifying transaction readiness;
- active;
- uncertain provider outcome;
- blocked/failed where appropriate.

Exact names may follow repo conventions, but the semantic distinctions must remain.

## Payment/economic integration

- Real payment-provider events flow into #74 Asset observations rather than a second revenue ledger.
- Successful authoritative payment events become `FACT` observations with stable idempotency.
- Failed/cancelled payment attempts are not revenue.
- Refunds/reversals/disputes should be new factual adjustments, not silent mutation/deletion of historical facts.
- Duplicate provider events must not double count.
- Provider/runtime uncertainty must not trigger a blind charged retry.

## Authority tests required

At minimum, adversarial CI should prove:

- charging cannot activate without explicit authority;
- merchant account existence does not imply merchant capability;
- production credentials are separately verified/authorized;
- charging authority does not enable outbound/ads/domain/spend;
- numeric offer price requires defensible provenance;
- payment events are idempotent;
- failed/cancelled events do not count as successful revenue;
- authoritative successful payments become FACT telemetry;
- activation resumes after a verified required capability becomes available;
- an Asset may remain live but commercially inactive without being marked failed.

## Exit criterion

Money Scout can prepare and verify a transaction-ready commercial path autonomously and, once the owner has granted the exact required authority/capability, accept a real customer payment whose authoritative provider event becomes auditable #74 economic telemetry.

## Operational Gate A — First real dollar

Code completion is not enough. A separate real-world gate should verify:

- merchant/payment account is genuinely automation-ready;
- KYC/ownership prerequisites are complete;
- production credentials are securely connected;
- the exact charging authority is granted;
- a real bounded transaction succeeds;
- the authoritative event is observed once and only once;
- the resulting revenue/cost state appears correctly in the Asset economic system.

No fake transaction should be used to claim this operational gate is complete.

---

# #76 Bet & Capital Allocation Kernel — PLANNED

## Purpose

Create the missing durable separation between "validated Opportunity" and "capital has been allocated to pursue it."

## Why this matters

Money Scout ultimately allocates capital, not just workflows. A strong Opportunity should not automatically become a Build. The system needs an explicit Bet object that records what is being risked, why, under what constraints, and what evidence would cause continuation or withdrawal.

## Planned capabilities

- durable `bets` and `bet_events` state;
- Bet status lifecycle;
- Opportunity -> Bet decision contract;
- capital budget in cash cents;
- external-service budget;
- agent/build capacity estimate;
- expected maintenance/support burden;
- human-capability dependency burden;
- reversibility and downside exposure;
- evidence-backed upside bounds;
- explicit success/failure/iterate criteria;
- allocation idempotency;
- budget consumption/reconciliation across Research/Build/Release/Operations where applicable;
- portfolio view of committed vs available capital.

## Safety principles

- Do not manufacture expected value inputs.
- Unknown economics remain ranges/unknowns.
- Capital allocation authority must be separate from commercial side-effect authority.
- A Bet may be approved with zero external spend if it consumes only existing capacity.

## Exit criterion

Every downstream Build is attributable to an explicit Bet with bounded resources and a machine-readable decision contract.

---

# #77 Live Asset Decision Engine — PLANNED

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

# #78 Distribution & Growth Execution — PLANNED

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

# #79 Customer & Support Operations — PLANNED

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

# #80 Portfolio Reinvestment & Rebalancing Engine — PLANNED

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

# #81 Learning & Signal Calibration Loop — PLANNED

## Purpose

Use real portfolio outcomes to improve future Discovery and underwriting without allowing self-reinforcing hallucinated correlations.

## Planned capabilities

- link original Discovery/Research/Validation signals to downstream Bet/Asset outcomes;
- measure which signals correlate with real commercial success/failure;
- calibrate priors or ranking weights only when sample quality supports it;
- preserve original evidence and model/version lineage;
- distinguish causal evidence from correlation;
- detect repeated failure modes in build, distribution, pricing, and operations;
- feed validated lessons back into candidate prioritization and experiment selection.

## Guardrails

- small samples do not justify aggressive weight changes;
- post-launch outcomes do not rewrite historical evidence;
- learning changes must be versioned and reversible;
- do not optimize solely for short-term revenue if maintenance/capital burden destroys return.

## Exit criterion

Money Scout becomes measurably better at selecting and operating future opportunities based on audited portfolio experience.

---

# #82 Provider, Credential, Spend & Recovery Hardening — PLANNED

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

# #83 Closed-Loop Portfolio Acceptance — PLANNED

## Purpose

Prove the Money Scout thesis end-to-end in reality, not only through fixtures.

## Acceptance scenario

At least one real Opportunity should demonstrate the full chain:

1. discovered from external market data;
2. researched with attributable evidence;
3. validated/underwritten;
4. funded as an explicit Bet;
5. built through the Builder system;
6. independently QA'd;
7. released through controlled deployment;
8. activated as an Asset;
9. commercially activated with correct authority;
10. receives real authoritative transaction/revenue telemetry;
11. operates with health/support/economic monitoring;
12. receives at least one evidence-backed improve/continue/scale/pause/kill decision;
13. portfolio capital is reallocated based on measured outcome;
14. the outcome feeds back into future opportunity ranking/learning.

## Exit criterion

The owner is not performing routine research, coding, deployment, monitoring, support triage, or portfolio bookkeeping. Human involvement is limited to configured capital/authority limits and genuine human-only external requirements.

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

- broad SaaS multi-tenancy;
- public user onboarding for Money Scout itself;
- generic chatbot features;
- complex billing for selling Money Scout;
- generalized no-code app-builder features;
- large visual redesigns disconnected from operator decision quality;
- premature model fine-tuning before real outcome data exists.

The product should first become excellent at autonomously creating and managing its own portfolio.
