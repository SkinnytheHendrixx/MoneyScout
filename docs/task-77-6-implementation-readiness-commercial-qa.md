# Milestone #77.6 — Implementation Readiness & Commercial QA Retrofit

## Status

DESIGN / PRE-IMPLEMENTATION. This milestone retrofits the Asset Factory so Money Scout optimizes for commercially ready software with minimal interpretation and debugging, not merely code generation.

## Thesis

Money Scout should be capable of taking an approved opportunity and autonomously producing software that is sufficiently complete, coherent, testable, and commercially credible to put real acquisition spend behind.

The Factory must therefore front-load reasoning and reduce downstream interpretation.

Canonical doctrine:

> Money Scout must not hand ambiguous product intent directly to a coding provider.

> If the Builder must invent material customer-facing behavior, the specification is not implementation-ready.

> The Factory optimizes total cost to commercially reliable software, not minimum model calls, minimum prompt length, or minimum coding time.

> Spend inference before spending debugging cycles.

> Release occurs when the Asset is commercially credible, not merely technically functional.

## Target pipeline

The strengthened Factory pipeline is:

**Approved Bet → Product Definition → Product Adversarial Review → Frozen Product Contract → Requirement Graph → Architecture Composer → Architecture Adversarial Review → Implementation Readiness Compiler → Implementation Specification → Implementation Readiness Review → Builder → Engineering QA → CX QA → Commercial Readiness QA → Synthetic Customer Trials → Convergence Gate → Controlled Release**

#77.6 does not remove #69–#71 or #77. It strengthens the contracts between them.

## 1. Stronger Product Definition semantics

The Product Definition must describe customer and business behavior deeply enough that implementation does not require material interpretation.

For each material requirement, define where applicable:

- actor / role;
- user goal;
- initiating condition;
- preconditions;
- happy-path behavior;
- intermediate states;
- loading/progress behavior;
- empty state;
- validation failures;
- external dependency failures;
- partial failure behavior;
- retry semantics;
- cancellation semantics;
- refresh/re-entry semantics;
- persistence semantics;
- permission/authorization behavior;
- mobile/responsive expectations;
- accessibility expectations;
- copy/communication semantics where material;
- audit/telemetry expectations;
- security/privacy expectations;
- terminal success state;
- terminal failure state;
- recovery path;
- explicit non-goals;
- acceptance criteria.

Not every trivial requirement needs every field, but every material behavioral ambiguity must be resolved before implementation.

## 2. Requirement Graph expansion

Extend traceability beyond technical coverage.

Target lineage:

**Evidence → Product Requirement → User Flow / State → Failure Cases → Technical Obligation → Capability Requirement → Architecture Component → Implementation Spec Section → Acceptance Criteria → Code/Artifact → QA Evidence → Released Behavior → Customer/Economic Outcome**

Every included Product Requirement must have complete downstream coverage or an explicit unresolved/blocking state.

## 3. Implementation Readiness Compiler

Introduce a deterministic orchestration layer that compiles frozen upstream contracts into a Builder-ready package.

Inputs include:

- frozen Product Definition;
- Product review findings/resolutions;
- Requirement Graph;
- frozen Architecture Plan;
- capability bindings;
- Build Envelope;
- authority/prohibition constraints;
- Factory standards;
- acceptance requirements;
- relevant operational/commercial contracts.

Outputs include at minimum:

- `IMPLEMENTATION_SPEC.md`
- `.money-scout/implementation-spec.json`

The human-readable artifact may be very large. Token minimization is not an objective.

The machine-readable artifact is canonical for traceability and QA generation.

## 4. Implementation Specification structure

The Implementation Specification should cover, as applicable:

### A. Product intent and locked truth
- target customer / actor;
- validated problem;
- paid promise;
- success definition;
- non-goals;
- evidence provenance;
- requirement priorities/roles.

### B. Complete user journeys
For every core journey:
- entry point;
- prerequisite state;
- ordered interaction steps;
- state changes;
- branching behavior;
- errors;
- retries;
- cancellation;
- persistence;
- completion;
- next expected action.

### C. Screen/surface behavior
For each meaningful surface:
- purpose;
- visible information;
- controls;
- enabled/disabled rules;
- loading state;
- empty state;
- error state;
- success state;
- destructive-action confirmation;
- responsive/mobile behavior;
- accessibility semantics;
- copy constraints where business-critical.

### D. State machines
Define durable states and legal transitions for material entities/processes.

No Builder-created business state may be introduced casually when state semantics affect customer experience, money, authority, or recovery.

### E. Data contracts
Define:
- entities;
- required/optional fields;
- identifiers;
- uniqueness;
- timestamps;
- provenance;
- retention;
- sensitivity;
- consistency rules;
- migration expectations;
- idempotency keys where required.

### F. External integrations
Define:
- purpose;
- provider assumptions;
- auth/secret boundary;
- timeout behavior;
- retries/idempotency;
- rate limits;
- partial failure;
- duplicate/out-of-order callbacks;
- unavailable provider behavior;
- cost/authority constraints where relevant.

### G. Security / authority
Define:
- actor permissions;
- tenant/data isolation;
- administrative actions;
- secret handling;
- destructive operations;
- money/customer-impacting authority boundaries;
- abuse cases.

### H. Reliability / recovery
Define:
- process restart behavior;
- duplicate requests;
- network failures;
- asynchronous completion;
- retry budgets;
- dead-letter/manual review states where required;
- reconciliation paths;
- rollback/compensation behavior.

### I. Observability
Define:
- important events;
- health checks;
- audit events;
- error reporting;
- user-visible incident behavior;
- business telemetry required for operations.

### J. Acceptance matrix
Every material requirement maps to observable acceptance criteria and QA evidence.

## 5. Builder discretion contract

Builder discretion must be explicitly bounded.

### Builder may ordinarily decide
- local function/class/module structure;
- variable naming;
- internal refactors that preserve contract;
- implementation-level library usage within approved architecture/capabilities;
- minor visual implementation details where design contract explicitly delegates them;
- ordinary low-level test organization.

### Builder may not invent without challenge/versioning
- customer-facing workflows;
- business rules;
- pricing/monetization semantics;
- durable entity state machines;
- authorization/permission semantics;
- retry/idempotency semantics for material actions;
- customer-visible failure/recovery behavior;
- data retention/privacy rules;
- material user-facing copy where meaning affects promise/trust;
- architecture changes outside allowed discretion;
- scope reductions;
- category-standard functionality whose inclusion is already frozen.

If implementation reveals missing material product behavior, return a Product Contract Challenge or Architecture Challenge rather than inventing silently.

## 6. Implementation Readiness Review

Before Builder invocation, run independent adversarial reviews against the compiled specification.

Required lenses should include, where applicable:

- product completeness;
- category/commercial completeness;
- UX/CX coherence;
- accessibility;
- security/abuse;
- reliability/recovery;
- data integrity;
- monetization/customer promise;
- operational supportability;
- observability;
- architecture/spec consistency;
- acceptance-test completeness.

Each reviewer produces structured findings:

- finding ID;
- severity;
- affected requirement/spec section;
- concrete ambiguity/defect;
- why it matters;
- likely customer/engineering/economic consequence;
- evidence/rationale;
- required resolution;
- whether it blocks implementation.

Do not use one blended score to hide fatal omissions.

## 7. Readiness gate

The specification may enter Builder only when:

- no fatal/major unresolved product ambiguity exists;
- every core requirement has observable acceptance criteria;
- every core user journey has defined happy/failure/recovery states;
- every material async/external operation has retry/idempotency/uncertainty semantics;
- data/authority/state-machine obligations are resolved;
- Architecture covers every technical obligation;
- Builder discretion is explicit;
- independent reviewers no longer find material contradictory interpretations.

Canonical test:

> Could two competent coding agents following this specification produce materially different customer experiences or business behavior?

If yes, the specification is not IMPLEMENTATION_READY.

## 8. Adversarial acceptance criteria families

Happy-path acceptance alone is insufficient.

For material requirements, acceptance families should cover relevant dimensions such as:

- nominal success;
- invalid input;
- duplicate action;
- repeated click/submit;
- refresh/reload mid-flow;
- network timeout;
- external success/local failure;
- local success/external callback duplication;
- delayed/out-of-order callback;
- unauthorized access;
- stale state;
- concurrent action;
- cancellation;
- retry;
- recovery;
- mobile viewport;
- keyboard/accessibility behavior;
- telemetry/audit emission;
- security boundary;
- customer-visible error quality.

Acceptance generators should derive scenarios from state machines and integration contracts, not rely solely on manually authored examples.

## 9. Commercial Readiness QA stack

#70 remains the independent QA foundation but gains additional explicit quality gates.

### Engineering QA
- build/typecheck/lint where applicable;
- unit/integration/system tests;
- schema/migration validity;
- contract compliance;
- state-machine correctness;
- concurrency/idempotency tests;
- secret/security checks.

### Functional journey QA
Execute complete end-to-end customer workflows rather than isolated endpoint correctness.

### CX QA
Evaluate:
- clarity;
- consistency;
- no dead ends;
- loading/progress feedback;
- meaningful empty states;
- error usefulness;
- recovery paths;
- responsive behavior;
- navigation continuity;
- form behavior;
- trust signals;
- category-standard polish.

### Accessibility QA
At minimum verify:
- keyboard access;
- labels/names;
- focus behavior;
- semantic structure;
- contrast/visible state where measurable;
- error association;
- no obvious assistive-technology dead ends.

### Security/abuse QA
Test relevant:
- cross-user/tenant access;
- privilege escalation;
- direct-object access;
- destructive action abuse;
- duplicate financial/customer-impacting actions;
- malformed input;
- secret exposure;
- injection/unsafe rendering;
- rate/automation abuse where applicable.

### Reliability/recovery QA
Simulate:
- restart;
- timeout;
- duplicate event;
- provider failure;
- partial completion;
- retry;
- stale state;
- concurrent action;
- recovery after interruption.

### Commercial QA
Verify:
- paid promise is actually fulfilled;
- pricing/offer/customer-facing claims match implementation;
- onboarding reaches value;
- account lifecycle is coherent;
- monetization lifecycle has no obvious dead ends;
- necessary support/recovery/admin paths exist;
- product appears credible enough for a real customer in its category.

## 10. Synthetic customer trials

Before public release, autonomous agents should interact with the built product from the perspective of realistic customers.

Synthetic users should begin with only information a real visitor/customer would possess.

Trials should cover personas and behaviors such as:

- ideal first-time customer;
- confused but reasonable customer;
- returning customer;
- mobile customer;
- accessibility-focused user;
- customer making input mistakes;
- customer encountering provider/network failure;
- customer attempting duplicate actions;
- adversarial/misuse actor where safe and relevant.

Synthetic trials should produce structured journey traces and defects, not vague aesthetic opinions.

## 11. CX defect taxonomy

Use severity tied to real customer/commercial consequences.

Example classes:

- `FATAL`: prevents core paid promise, creates unsafe/security/money behavior, corrupts data, or makes release commercially invalid.
- `MAJOR`: core journey materially broken/confusing, common recovery missing, category-standard omission damages purchaseability/trust.
- `MODERATE`: meaningful friction or polish defect likely to reduce conversion/retention/supportability.
- `MINOR`: cosmetic/low-impact issue.
- `SPECULATIVE`: preference or unsupported enhancement; does not block release.

## 12. Convergence Engine

AI review can continue indefinitely unless Money Scout knows when additional iteration stops producing material value.

Track review rounds and defect novelty.

Convergence should consider:

- unresolved severity;
- new material findings per pass;
- repeated findings already resolved/rejected;
- independent reviewer agreement;
- acceptance pass rate;
- synthetic journey pass rate;
- regression stability;
- remaining uncertainty;
- whether remaining defects are cosmetic/speculative rather than commercially material.

Do not define convergence as a magic average score.

A product is converged when repeated independent review produces no new fatal/major material findings, hard acceptance criteria pass, and remaining known issues are explicitly non-blocking.

## 13. Repair loop semantics

QA defects should route to the correct owner:

- implementation defect → Builder repair;
- missing/ambiguous Product behavior → Product Definition/versioning;
- architecture infeasibility → Architecture Challenge/versioning;
- missing capability/access → dependency/capability state;
- money/authority issue → relevant Money Safety/authority boundary;
- speculative preference → ordinarily defer unless evidence justifies scope change.

Repairs must produce fresh independent QA. Do not allow the Builder to self-certify.

## 14. First-pass correctness objective

Money Scout cannot guarantee literal zero bugs. The measurable objective is to minimize avoidable implementation/debug cycles caused by upstream ambiguity or omitted standard behavior.

Track eventually:

- first-build acceptance pass rate;
- defects by source: specification omission vs implementation error vs provider/environment issue;
- repair cycles per Asset;
- material CX defects found before vs after launch;
- Product/Architecture challenge frequency;
- spec ambiguity findings per readiness-review round;
- customer-reported defects after launch;
- inference spend required to reach release readiness;
- total cost to commercially reliable release.

Do not optimize these metrics in isolation in ways that reduce product quality.

## 15. Retrofit expectations for earlier milestones

### #69 Builder Workspace
Preserve provider-neutral execution, but strengthen Builder-discretion enforcement and challenge routing against the Implementation Specification.

### #70 Autonomous QA
Preserve independent QA/repair/retest. Expand its contract into the Commercial Readiness QA stack without allowing the Builder to certify itself.

### #71 Controlled Release
Release eligibility must consume the Commercial Readiness / Convergence result in addition to existing authority and health requirements.

### #77 Asset Factory
Insert the Implementation Readiness Compiler and Review between frozen Architecture and Builder execution. Build Contract v2 remains useful but becomes one component/view of the richer implementation package rather than the sole behavioral specification.

## 16. Exit criteria

#77.6 is complete only when:

- every new Factory Build receives a versioned Implementation Specification;
- implementation specs are traceable to frozen Product/Architecture requirements;
- core customer behavior is defined before Builder execution;
- Builder discretion is machine-readable and enforced;
- independent Implementation Readiness Review blocks material ambiguity;
- adversarial acceptance families exist for material requirements;
- QA includes end-to-end CX/commercial/reliability/security lenses appropriate to the Asset;
- synthetic customer trials execute before public release where applicable;
- convergence is explicit and defect-based rather than endless review or a magic score;
- #71 cannot publicly release a new Factory Asset merely because engineering tests pass;
- defect routing distinguishes implementation defects from upstream specification/architecture problems;
- all retrofit regression tests pass.

## Non-goals

#77.6 does not determine whether a live Asset should survive, scale, harvest, hibernate, or retire. That remains #78. It ensures the Asset reaching #78 begins life as a commercially credible product rather than a thin or ambiguously implemented prototype.
