# Phase J — Forward Governance / Future-Code Coverage Audit Plan — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** J — forward-governance / future-code coverage  
**Implementation authority:** SUSPENDED

## 1. Purpose

Phase J is the final discovery/certification phase in the frozen global audit sequence before remediation/amendment, invalidation rechecks, final Phase-C sweep, corrected-register assembly, and independent T4 review.

Phase J answers one narrow but load-bearing question:

> **Does the recovered R20 forward-engineering-governance requirement actually compose with Money Scout's development process strongly enough that newly written consequential code cannot silently appear outside R20 classification, registration, validation, and test coverage?**

A clean audit of today's consequential paths is insufficient. Architecture cannot runtime-enforce against future code that is never written to call the gate.

Phase J does **not**:

- prove historical names for R20 boundary classes or phases;
- prove the historical name of the forward-governance requirement;
- recover H2-E45's exact historical mechanical-enforcement form;
- reopen Phase-I naming dispositions;
- implement or remediate missing controls while the audit is running.

Phase-I operational-vocabulary guard remains binding: Phase J may use working names for classes/phases to conduct coverage analysis, but that terminology is audit-operational only and cannot become historical-name evidence.

## 2. Governing sources

### 2.1 Global audit plan

`GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md` Phase J requires verification that R20 forward governance composes with the development process so that:

1. new consequential surfaces require classification;
2. consequential boundaries require Boundary Registry registration before merge/release;
3. code review rejects bypass paths;
4. CI/static analysis/architectural linting is used where deterministically possible;
5. tests exercise allow and deny paths through the gate;
6. new consequence classes beyond current representability become governed A0/A1 work rather than local exceptions.

These are six separate predicates. One control may support more than one predicate, but no predicate is satisfied merely because another one is.

### 2.2 R20 recovered contract

`WI-R20.md` §19.1 makes the substantive rule normative:

- every newly introduced or materially changed consequential surface must be classified and registered before it is implementation-complete / production-eligible;
- consequential surfaces must declare boundary class and required predicate set;
- code review must reject bypass paths;
- deterministic mechanical checks should enforce registration/invocation where feasible;
- tests must prove denial and allow paths through the registered gate;
- unrepresentable new consequence types become A0/A1 defects rather than bypass permission;
- architecture changes that introduce a new consequence class require a renewed sibling/coverage sweep.

Historical label/mechanism exactness remains source-unresolved and is not Phase J's subject.

### 2.3 Current development-process baseline

Current repository evidence already establishes generic engineering controls:

- `AGENTS.md` requires short-lived branches, the full GitHub Actions suite before merge, `main` as deployment gate, architecture/authority review where needed, and regression tests for every authority boundary;
- `docs/engineering-workflow.md` requires PRs, canonical CI, adversarial zero-cost authority/idempotency/cost/provenance/recovery tests, and architecture/authority review where required;
- `docs/PRODUCT_PRINCIPLES.md` requires granular authority and independent verification for consequential code changes;
- `.github/workflows/ci.yml` currently runs typecheck/build/runtime-supervisor and Research/Discovery suites.

These are **starting evidence, not Phase-J certification**. Generic PR/CI discipline does not itself prove R20-specific future-code coverage.

## 3. Phase-J primary obligation set — fixed at six

### J-01 — consequential-surface classification obligation

Every new or materially changed surface capable of consequential dispatch, adoption, release, financial/resource effect, lifecycle transfer, commercial effect, or equivalent authority consumption must be forced through an explicit consequentiality/R20-applicability classification.

Audit question:

`CAN A NEW CONSEQUENTIALLY CAPABLE SURFACE MERGE WITHOUT ANY DURABLE CLASSIFICATION DECISION?`

### J-02 — Boundary Registry registration before merge/release

If a surface is consequential, its boundary class and required predicate set must be registered before merge/release/production eligibility.

Audit question:

`CAN CONSEQUENTIALLY CAPABLE CODE REACH MAIN OR PRODUCTION WITHOUT A REGISTERED BOUNDARY DEFINITION?`

### J-03 — review-time bypass rejection

Review process must make R20 bypass a rejectable architecture/authority defect rather than a discretionary style concern.

Audit question:

`WOULD A REVIEWER OR AUTOMATED REVIEW CONTRACT HAVE A REQUIRED BASIS TO REJECT A NEW CONSEQUENTIAL PATH THAT CALLS A PROVIDER / ADOPTS AN EFFECT / RELEASES AUTHORITY WITHOUT THE REGISTERED R20 GATE?`

### J-04 — deterministic mechanical enforcement where possible

Where code structure makes registration/invocation mechanically detectable, CI/static analysis/architectural linting or equivalent deterministic checks must be used rather than relying only on human/model review memory.

Audit question:

`WHICH BYPASS CLASSES ARE DETERMINISTICALLY DETECTABLE, AND DOES THE REPO ACTUALLY FAIL CLOSED ON THEM?`

Phase J must distinguish:

- deterministically checkable bypasses;
- semantically consequentiality-dependent paths requiring review judgment;
- impossible-to-prove-by-static-check surfaces.

"Static analysis cannot prove everything" is not permission to omit checks for what it *can* prove.

### J-05 — registered gate allow/deny test requirement

Every new consequential surface must prove both:

- denial when one or more required predicates fail;
- allow only when the registered required predicate set is satisfied.

Validator unit tests alone are insufficient if the new consumer can bypass the validator.

Audit question:

`DO TESTS PROVE THE CONSUMER ACTUALLY ROUTES THROUGH THE REGISTERED GATE, INCLUDING FAILURE PATHS?`

### J-06 — new consequence-class representability escalation

A newly introduced consequence type that cannot be represented by the current Boundary Registry/schema/predicate model must become governed A0/A1 work.

It may not be handled as:

- an ad hoc local boolean;
- an inline exception;
- a temporary unregistered path;
- a “nonconsequential for now” assumption solely because the registry lacks a category.

Audit question:

`CAN REPRESENTATION FAILURE CREATE BYPASS AUTHORITY INSTEAD OF A GOVERNED A0/A1 DEFECT?`

## 4. Evidence classes

For each J-01 through J-06, record evidence separately in these layers:

1. **NORMATIVE_REQUIREMENT** — recovered contract says the control must exist;
2. **PROCESS_DOCUMENTATION** — engineering docs tell builders/reviewers to do it;
3. **DURABLE_WORKFLOW_CONTROL** — PR template/checklist/bot/required review/work-item schema or equivalent forces the step;
4. **MECHANICAL_REPO_GATE** — CI/lint/static check can fail the change;
5. **CONSUMER_LEVEL_TEST_PROOF** — actual tests prove new consumers route through the gate;
6. **ESCAPE_RESISTANCE** — adversarial fixture shows a plausible bypass is rejected.

A stronger layer can satisfy a weaker requirement where logically sufficient, but prose alone must not be counted as a mechanical gate.

## 5. Proposed disposition vocabulary

Each primary obligation receives one of:

- `J_ENFORCED` — present development process has sufficient durable/mechanical/verified enforcement for the obligation;
- `J_PARTIALLY_ENFORCED` — some real control exists but an independently material escape path remains;
- `J_DOCUMENTED_ONLY` — requirement/process prose exists without sufficient durable enforcement;
- `J_MISSING` — no adequate current control found;
- `J_NOT_DETERMINISTICALLY_ENFORCEABLE` — mechanical enforcement is not possible for the specific subcase, but an explicit review/governance control must still exist;
- `J_REPRESENTABILITY_ESCALATION_REQUIRED` — current model cannot express the future consequence class and must create A0/A1 work rather than permit execution.

`J_NOT_DETERMINISTICALLY_ENFORCEABLE` is not a PASS by itself.

## 6. Mandatory adversarial attacks

### J-A1 — new provider call in an existing file

Add a consequential provider/customer dispatch inside a file already considered audited, without registering a new boundary.

**Required behavior:** classification/registration/review/test process still catches it. File age or prior A1 audit is not grandfather authority.

### J-A2 — new provider call hidden behind generic helper

Introduce a generic helper or wrapper whose call site looks innocuous while the helper performs the consequential effect.

**Required behavior:** future-code governance cannot rely only on obvious function names or route locations.

### J-A3 — existing validator, new bypassing consumer

Add a new consumer beside a correct R20 validator but call the provider/adoption effect directly.

**Required behavior:** existence of the validator library is insufficient; consumer-level coverage must fail.

### J-A4 — allow-only testing

Add tests proving the valid path while omitting denial fixtures.

**Required behavior:** review/CI refuses to count allow-only coverage as sufficient for a consequential boundary.

### J-A5 — local "temporary" exception

Mark a new consequential surface as temporary/experimental/internal and bypass registration.

**Required behavior:** temporary status does not create authority; if it can cross a consequential boundary, it requires classification and applicable gating.

### J-A6 — new consequence class absent from registry

Introduce a consequential action whose predicate set/class cannot be represented in the current Boundary Registry.

**Required behavior:** durable A0/A1 defect/work is created; no local fallback authorization is allowed.

### J-A7 — rename/indirection evasion

Rename dispatch/charge/release/adopt functions or route through aliases so simple string matching no longer sees the effect.

**Required behavior:** deterministic checks are assessed honestly for evasion resistance; semantic review covers what static checks cannot.

### J-A8 — stale audit grandfathering

Point to a previously clean Phase C/A1/Phase-J audit as permission for a new path added afterward.

**Required behavior:** audit conclusions remain SHA-bound; new consequential code must be classified under current governance.

### J-A9 — Phase-J vocabulary laundering

Use Phase-J working terms for classes/phases, then later cite their usage as proof of historical naming.

**Required behavior:** reject categorically under Phase-I §8 guard.

### J-A10 — merge-green-but-governance-absent

Create a change that typechecks, builds, passes unrelated tests, and reaches a green generic CI state while bypassing R20 future-governance controls.

**Required behavior:** Phase J must detect whether current CI can actually prevent this. Generic green CI is not equivalent to R20 governance compliance.

## 7. Batch sequence

### J0 — development-governance surface inventory

Inventory all current controls relevant to J-01 through J-06, including at minimum:

- `AGENTS.md`;
- `docs/engineering-workflow.md`;
- `docs/PRODUCT_PRINCIPLES.md`;
- `.github/workflows/*`;
- PR templates / review templates if present;
- issue/work-item templates that govern engineering changes;
- architecture/authority review instructions;
- scripts/lints/static checks;
- Boundary Registry implementation/schema, if present;
- R20 validator implementation, if present;
- tests that exercise consequential consumers.

Every evidence artifact must be pinned to immutable blob SHA.

### J1 — six-obligation enforcement adjudication

Adjudicate J-01 through J-06 independently against the evidence-layer model in §4.

Do not infer enforcement from intention.

### J2 — future-code adversarial escape suite

Apply J-A1 through J-A10 conceptually and, where current repository mechanisms can be directly inspected without implementation changes, against actual process/control surfaces.

Phase J is an audit, so no missing control is implemented during this batch.

### J3 — final Phase-J synthesis

Produce:

- six-obligation disposition matrix;
- concrete escape-path findings;
- separation of deterministic versus judgment-required enforcement;
- explicit Phase-I naming boundary;
- any new global findings requiring remediation;
- invalidation impact on prior certifications if any audited artifact/node is later amended;
- Phase-J closure status.

## 8. Counting discipline

The Phase-J primary denominator is **six governance obligations**, J-01 through J-06.

Do not count:

- every documentation file as a separate primary;
- every bypass fixture as a primary defect automatically;
- every missing CI step and missing review step separately when they are two mechanisms of the same underlying unmet obligation;
- Phase-I naming debt;
- H2-E45 historical mechanical-form debt.

A new Phase-J defect should be created only when an independently remediable governance failure survives the counterfactual test:

> **If the nearest existing finding were fixed, would this failure still independently permit future consequential code to escape R20 governance?**

If no, fold it as supporting mechanism/evidence under the existing primary.

## 9. Current non-dispositive baseline observations

Before J0, direct repository checks already show:

- generic merge/deployment process exists;
- architecture/authority review is required "where needed" / "where required";
- regression testing for authority boundaries is required in engineering guidance;
- independent verification for consequential code changes is a product principle;
- current CI runs important build/typecheck/runtime/research/discovery checks;
- current CI file does not visibly contain an R20-specific Boundary Registry registration check, consequential-surface classification check, bypass lint, or dedicated registered-gate allow/deny step.

These observations **must not be promoted into a Phase-J defect until J0/J1 determine the complete relevant control surface**. A separate script, workflow, template, or repo-native review mechanism may exist elsewhere.

Likewise, the existence of generic architecture-review prose must not be promoted into `J_ENFORCED` without evidence that the step is durable enough to prevent silent omission.

## 10. Closure criteria

Phase J may close as an audit when:

1. all relevant governance/process/mechanical/test surfaces are inventoried and SHA-pinned;
2. all six primary obligations J-01 through J-06 are independently adjudicated;
3. documentation is not mistaken for mechanical enforcement;
4. mechanical enforcement is not required where genuinely impossible, but judgment-required cases have explicit durable ownership;
5. J-A1 through J-A10 are dispositioned;
6. generic green CI is not mistaken for R20 compliance;
7. new unrepresentable consequence classes are proven to fail into A0/A1 governance rather than bypass;
8. Phase-J operational vocabulary remains non-evidence for historical naming;
9. no Phase-I or H2-E45 historical exactness debt is silently claimed closed;
10. any Phase-J defects have durable IDs and clear remediation boundaries;
11. any later amendment invalidates SHA-bound affected checks under the global invalidation rule;
12. adversarial review of the final Phase-J synthesis is complete;
13. implementation authority remains suspended until the entire post-J remediation/recheck/corrected-register/T4 sequence finishes.

## 11. Review questions

Adversarial plan review should pressure especially:

1. Are J-01 through J-06 the right six primaries, or are any two actually one independently-remediable obligation?
2. Does the evidence-layer model incorrectly privilege CI over a sufficiently durable review/work-item control?
3. Is `architecture/authority review where required` too discretionary to count without a deterministic trigger saying when it is required?
4. What repository mechanisms could legitimately force consequential-surface classification even if no PR template exists?
5. Which bypass classes are deterministically lintable, and which necessarily require semantic review?
6. Is J-A10 strong enough to catch the key failure mode where generic CI is green but forward-governance composition is absent?
7. Does J-06 correctly keep new representability failures inside governed A0/A1 rather than creating a second Phase-F representability audit?
8. Is the Phase-I operational-vocabulary boundary explicit enough to prevent J from reopening naming provenance?
9. Could future code escape by modifying an already registered boundary's semantics/predicate set rather than creating a visibly new boundary, and if so should that be an explicit attack?
10. Does any current baseline statement accidentally prejudge J1 before the complete inventory exists?

## 12. Provisional plan result

`PHASE J PLAN DRAFT / SIX PRIMARY FUTURE-GOVERNANCE OBLIGATIONS / GENERIC ENGINEERING HYGIENE SEPARATED FROM R20-SPECIFIC ENFORCEMENT / TEN MANDATORY BYPASS ATTACKS / PHASE-I NAMING AND H2-E45 HISTORICAL MECHANISM KEPT OUT OF SCOPE / IMPLEMENTATION AUTHORITY SUSPENDED`
