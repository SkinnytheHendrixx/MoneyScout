# Money Scout Retrofit Plan — Post-#77

## Status

DESIGN / PRE-IMPLEMENTATION. This file defines how #77.5 and #77.6 retrofit earlier milestones without rewriting history or reopening unrelated architecture.

## Purpose

The Money Scout thesis has sharpened in two ways:

1. Monetary execution and economic truth must be trustworthy enough for autonomous capital and lifecycle decisions.
2. The Asset Factory must produce commercially credible, implementation-ready software with minimal downstream interpretation and debugging, not merely code that passes engineering tests.

Earlier milestones established the right primitives, but several contracts and implementations must be strengthened before #78 depends on them.

This document separates:

- **historical milestone completion** — what was correctly delivered at the time;
- **retrofit-required implementation** — code semantics now known to be insufficient for the stronger system thesis;
- **retrofit-required contract/documentation** — milestone interpretation or exit criteria that must be strengthened without pretending the original work never happened;
- **no-action historical components** — architecture that remains correct and should not be churned.

## Retrofit doctrine

Do not rewrite completed milestone history.

Instead, annotate completed milestones as:

> Foundation complete; later semantics strengthened by #77.5 and/or #77.6.

A retrofit should modify the smallest owner layer that can enforce the new invariant.

Do not duplicate ledgers, authority systems, provider abstractions, QA systems, or build orchestration merely because the original contract was weaker.

---

# Milestone-by-milestone matrix

## #69 Builder Workspace

### Historical status

Remains COMPLETE as the provider-neutral coding execution foundation.

### Code retrofit required by #77.5

Limited. #69 must consume the shared Money Safety reservation/provider-execution contract when real paid execution is enabled. It should not own a private financial ledger or ad hoc reservation mechanism.

### Contract/code retrofit required by #77.6

Yes.

Strengthen the Builder input contract so the Builder receives the versioned Implementation Specification and explicit Builder-discretion boundaries in addition to the Build Contract.

Required behavior:

- Builder may implement but not invent material product behavior;
- Builder challenge routing must distinguish Product Contract vs Architecture vs dependency/resource failures;
- Builder must preserve implementation-spec lineage in result metadata;
- Builder success remains `IMPLEMENTATION_READY`, never final product acceptance.

### Preserve unchanged

- provider neutrality;
- isolated execution workspace;
- durable provider/run identity;
- Build success != acceptance;
- narrow credential boundary.

---

## #70 Autonomous QA / Debug / Retest

### Historical status

Remains COMPLETE as the independent QA/repair/retest foundation.

### Code retrofit required by #77.5

Only where QA itself can cause external monetary side effects or report provider costs. Those calls must use the shared reservation/provider billing contract.

### Contract/code retrofit required by #77.6

Major.

#70 becomes the execution foundation for a broader Commercial Readiness QA stack.

Add explicit QA classes/lenses:

- engineering/contract QA;
- end-to-end functional journey QA;
- CX QA;
- accessibility QA;
- security/abuse QA;
- reliability/recovery QA;
- commercial/promise QA;
- synthetic customer trials;
- convergence evidence.

Required invariants:

- Builder never self-certifies;
- every repair gets fresh independent QA;
- QA findings route to the owning layer;
- missing product behavior is not treated as an ordinary coding defect;
- release requires commercially material defects to be resolved or explicitly non-blocking.

### Preserve unchanged

- independent QA identity;
- durable defects/events;
- repair -> fresh QA loop;
- bounded repair behavior;
- acceptance evidence.

---

## #71 Controlled Deployment & Launch

### Historical status

Remains COMPLETE as the separation between QA success and public-release authority.

### Code retrofit required by #77.5

Yes.

Known safety retrofit:

- public-release and release-spend authority must use generic semantic VERIFIED_OWNER enforcement rather than body-attested identity;
- external release spend must use shared atomic reservations and provider-enforceable maximum exposure;
- release execution must use durable provider identity/idempotency/reconciliation semantics;
- provider billing configuration must fail UNKNOWN rather than silently free;
- release cost reconciliation must be exactly-once/cumulative-safe;
- stale authority/reservation/provider state must be revalidated immediately before side effect.

### Contract/code retrofit required by #77.6

Yes.

Public release eligibility for new Factory Assets must consume a Commercial Readiness / Convergence artifact in addition to existing QA, provider capability, health, and authority gates.

A Build that merely passes engineering tests must not qualify for public release.

### Preserve unchanged

- preview-first release;
- public release separate from charging/domain/outbound/credentials;
- production health verification;
- explicit release authority boundary.

---

## #72 Self-Deployment / Runtime Autonomy

### Historical status

Remains COMPLETE.

### Code retrofit required by #77.5

Potentially narrow only if Money Scout self-deployment can itself incur metered external spend or uncontrolled passive runtime cost. Do not reopen self-deployment architecture otherwise.

### Contract retrofit required by #77.6

None material for customer Asset commercial readiness.

### Preserve unchanged

The entire existing deployment architecture unless a concrete Money Safety dependency is found during implementation.

---

## #73 Asset Activation & Operations Kernel

### Historical status

Remains COMPLETE as the durable Asset/health/incident/observation foundation.

### Code retrofit required by #77.5

Yes.

Known economic-truth issue:

- Build and Release costs currently recorded into generic Asset `COST` observations must be classified/normalized as sunk investment rather than treated as current forward operating cost;
- Asset lifecycle/health state must remain distinct from future economic lifecycle state such as HARVEST/HIBERNATED;
- passive runtime spend exposure must become observable/containable where relevant;
- customer/financial obligations must prevent unsafe hibernation/containment claims.

Do not erase historical observations. Add normalized semantics around them.

### Contract retrofit required by #77.6

Minor.

Asset activation should retain the versioned Product/Architecture/Implementation Specification lineage that produced the release, so later operating findings can trace back to product and implementation contracts.

### Preserve unchanged

- durable Asset identity;
- health/incident primitives;
- observations/events;
- public-release authority inheritance only;
- commercial authorities default off.

---

## #74 Monetization Instrumentation & Autonomous Operations / Remediation

### Historical status

Remains COMPLETE as the initial authoritative telemetry/remediation layer, but its economic interpretation is not sufficient for #78.

### Code retrofit required by #77.5

Major.

Required changes include:

- replace/augment generic COST interpretation with typed normalized economic events;
- distinguish sunk, operating, recurring, accrued, shared, settlement, credit, liability, reservation, and refund/reversal semantics;
- prevent sunk Build/Release costs from contaminating forward operating contribution;
- support economic cadence/accrual where material;
- represent shared economic dependency groups and avoidability;
- represent working-capital and bounded downside where material;
- provider telemetry billing mode must default UNKNOWN, not zero cash;
- metered telemetry must use shared Money Safety primitives when enabled.

Historical observations remain immutable source evidence.

### Contract retrofit required by #77.6

Yes.

Commercial-readiness QA must specify and verify the telemetry/observability required to operate each Asset. Missing operational measurement is a product-readiness defect when it prevents autonomous operation.

### Preserve unchanged

- authoritative telemetry provenance;
- stable provider event IDs;
- completeness windows;
- remediation orchestration through Builder -> independent QA -> release;
- missing telemetry != zero.

---

## #75 Commercial Activation & Revenue Execution

### Historical status

Remains COMPLETE as the first commercial activation/payment integration foundation, but live-money semantics require #77.5 hardening.

### Code retrofit required by #77.5

Major.

Required changes include:

- CUSTOMER_CHARGING and production-credential authority must use semantic VERIFIED_OWNER enforcement;
- charging authority must bind to exact Asset/provider/merchant/credential/offer/price/currency/fingerprint state;
- material mutation invalidates stale authority;
- payment economic-object identity becomes mandatory where provider semantics require it;
- normalize CAPTURED/SETTLED/REFUND/DISPUTE/REVERSAL without double recognition;
- reconcile out-of-order positive/reversal events;
- define partial-refund delta vs cumulative semantics;
- provider-side charging disable/deactivation/reconciliation must exist where supported;
- local state cannot claim charging stopped until external provider state is verified;
- payment event execution/reconciliation must be idempotent and uncertainty-safe.

### Contract retrofit required by #77.6

Yes.

Implementation Specifications and Commercial QA must define the full customer-facing payment lifecycle, including loading, duplicate action, timeout, refresh, provider success/local failure, local success/callback duplication, decline, refund/recovery, account access, and fulfillment failure behavior.

### Preserve unchanged

- public release != customer charging;
- merchant capability != charging authority;
- payment facts are append-only;
- outbound/ads/domain remain separate authorities.

---

## #76 Bet & Capital Allocation Kernel

### Historical status

Remains COMPLETE as the Bet/Build Envelope/capital-attribution foundation, but allocation semantics are intentionally weaker than the final Money Safety model.

### Code retrofit required by #77.5

Major.

Required changes include:

- introduce shared atomic reservation primitive;
- separate AUTHORIZED / ALLOCATED / RESERVED / INCURRED / SETTLED;
- UNKNOWN allocation/cost cannot collapse to zero;
- concurrent jobs cannot overclaim the same capital;
- committed/reserved availability semantics must become explicit;
- resource buckets cannot independently overcommit one shared external-cash pool;
- currency/precision becomes explicit and safe;
- scarce entitlement capacity may require a parallel bounded-resource reservation model;
- uncertain provider execution retains reservation until authoritative reconciliation.

### Contract retrofit required by #77.6

Yes, narrow.

Build Envelope remains an investment constraint, not a product-design mechanism. Product requirements must not be removed merely to fit an envelope. If a commercially required product does not fit, route to insufficient-envelope/re-Bet semantics.

### Preserve unchanged

- explicit Bet decision contract;
- Bet attribution;
- downstream authority separation;
- Build Envelope concept;
- sunk historical investment remains Bet learning/performance evidence.

---

## #77 Asset Factory & Real Builder Integration

### Historical status

Once final Gateway blockers are fixed and PR #52 merges, mark COMPLETE as the foundational Asset Factory / Builder Gateway milestone.

### Code retrofit required by #77.5

Yes, narrow and shared.

Builder Gateway must consume the universal Money Safety provider-execution/reservation primitives when paid/entitlement execution is eventually enabled. Do not replace its durable uncertainty/reconciliation model.

### Contract/code retrofit required by #77.6

Major.

Insert between frozen Architecture and Builder:

- Implementation Readiness Compiler;
- versioned Implementation Specification;
- adversarial Implementation Readiness Review;
- explicit Builder-discretion contract;
- expanded acceptance families.

The existing Build Contract v2 remains an important implementation-control artifact, but it is no longer the sole source of customer-behavior truth.

### Preserve unchanged

- Competitive First Release doctrine;
- Product Definition and adversarial Product review;
- Requirement Graph foundation;
- Architecture Composer and adversarial Architecture review;
- Software Capability Catalog;
- durable Asset repository;
- Build Contract v2 lineage;
- provider-neutral Builder Gateway;
- exact-commit QA handoff;
- Product/Architecture Challenge routing;
- no implied commercial authority.

---

# Planned milestone ordering after #77

Once #77 merges, canonical implementation order should become:

**#77.5 — Money Safety & Economic Truth Hardening**

Then:

**#77.6 — Implementation Readiness & Commercial QA Retrofit**

Then:

**#78 — Live Asset Decision Engine**

Then continue the downstream portfolio roadmap.

Reason:

#78 must consume trustworthy economics and should operate on Assets that entered production through a commercially credible Factory. Building #78 before those two bridge milestones would force it to reason over ambiguous financial truth and products whose release-readiness semantics are too weak.

---

# Canonical roadmap/documentation updates after #77 merge

After final #77 merge, update the following on `main` or a dedicated documentation PR based on the actual merged SHA:

1. `docs/ROADMAP.md`
   - mark #76 COMPLETE;
   - mark #77 COMPLETE;
   - insert #77.5 and #77.6 before #78;
   - annotate #69–#77 as foundation whose semantics are strengthened by the retrofit milestones where applicable;
   - update the target closed loop to include implementation readiness/commercial convergence and trustworthy economic truth.

2. `docs/CURRENT_STATE.md`
   - describe current milestone as #77.5 after #77 merge;
   - record the final #77 architecture and remaining blocked real-provider paths;
   - record that #78 is intentionally deferred until #77.5/#77.6.

3. `docs/ARCHITECTURE.md`
   - add the Financial Constitution / monetary lifecycle;
   - add Implementation Readiness Compiler / Specification / Convergence concepts;
   - strengthen Builder-discretion boundaries;
   - distinguish engineering acceptance from commercial readiness.

4. #69/#70/#71/#73/#74/#75/#76/#77 task docs
   - add a short `Later retrofit` or `Post-completion hardening` section rather than rewriting original delivered history;
   - link each affected invariant to #77.5 and/or #77.6.

5. Agent guidance / repository doctrine
   - make `UNKNOWN != ZERO`, `no ambiguous product intent to Builder`, and `commercially credible != merely functional` canonical instructions where agents will actually read them.

---

# What not to do

Do not:

- mark all previous milestones incomplete;
- rewrite historical PR/task descriptions as though later discoveries were known at the time;
- create a second economic ledger merely to avoid adapting existing observations;
- create a second QA platform merely to add commercial-readiness lenses;
- create a second Builder merely to enforce implementation specifications;
- implement #78 before #77.5 and #77.6;
- let #77.6 weaken Product Definition requirements to fit a budget;
- let #77.5 conflate verified authority with capital availability;
- let either retrofit silently broaden commercial authority.

## Exit criterion for this retrofit plan

This plan is complete as a design artifact when every known prior-milestone deficiency has an explicit owning retrofit milestone and no completed architecture is reopened without a concrete invariant requiring it.
