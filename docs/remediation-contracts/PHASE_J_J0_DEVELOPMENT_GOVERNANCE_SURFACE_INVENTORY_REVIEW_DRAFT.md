# Phase J — J0 Development-Governance Surface Inventory — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** J — forward-governance / future-code coverage  
**Batch:** J0 — development-governance surface inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

J0 inventories the current repository surfaces that could enforce or support Phase-J obligations J-01 through J-06. It does **not** assign J1 enforcement dispositions yet.

Governing plan:

`PHASE_J_FORWARD_GOVERNANCE_FUTURE_CODE_COVERAGE_AUDIT_PLAN.md`

Canonical plan commit: `f598ab29de2bc580a6cdca896d0c7eedc1eb7227`.

Phase-J scope remains substantive future-code governance only. Phase-I historical naming debt and H2-E45 historical mechanical-form debt remain out of scope.

## 2. Inventory method and absence rule

J0 distinguishes:

- **artifact present** — directly inspected and SHA-pinned;
- **surface class present, R20-specific control not visible** — generic mechanism exists but no inspected R20-specific enforcement found;
- **not found in enumerated surfaces** — no artifact was found after direct inspection of the listed process/workflow/script/schema surfaces;
- **not proven globally absent** — repository-wide semantic absence is not inferred merely from code-search misses.

This bounded absence rule is load-bearing. J0 must not turn an index miss into a global negative claim.

## 3. SHA-pinned governance/process inventory

| J0-ID | Surface | Blob / tree SHA | Relevant control | R20-specific force visible? | J-A11 predicate-history relevance |
|---|---|---|---|---|---|
| J0-01 | `AGENTS.md` | `80903b93a7ecdbb92f1aefba581b975efd1dfd0f` | short-lived branches; full GitHub Actions before merge; `main` deployment gate; architecture/authority review where needed; regression tests for every authority boundary | **generic only** — no durable consequential-surface classification or Boundary Registry registration field/control identified | no registry-definition history mechanism stated |
| J0-02 | `docs/engineering-workflow.md` | `14d9dcf6f4d65d066601249b2ea4d6ccf2b05081` | PR loop; canonical CI; adversarial authority/idempotency/cost/provenance/recovery tests; architecture/authority review where required | **generic only** — trigger for “where required” is not defined in this artifact | no versioned registered-boundary predicate history stated |
| J0-03 | `docs/PRODUCT_PRINCIPLES.md` | `b77cde5c104a48830ba00496e259e8a8f74cc37c` | granular authority; independent verification for consequential code changes; no blind paid retries | normative product principles, not a merge-time R20 workflow control | no predicate-definition audit trail stated |
| J0-04 | `.github/ISSUE_TEMPLATE/agent-work-item.md` | `c2dc28872599f07a067ba407bb0f2845ec79f5a9` | durable work envelope with base SHA, authority, objective, acceptance, constraints, stop conditions | generic authority/scope fields only; no consequentiality classification, boundary class, predicate-set, re-registration, or degradation-review field | no boundary-definition version/history field |
| J0-05 | `.github` directory | tree `9d5bcbeb49cf93f1d5c6247e528d8c9f30f3a6d2` | contains issue template directory and workflows directory | no PR template or dedicated R20 review checklist visible in this directory listing | no dedicated registry-change review surface visible |
| J0-06 | `.github/workflows/ci.yml` | `97872acddffab1b06f607570486a99ebd820d07c` | PostgreSQL test service, runtime-supervisor tests, schema push, typecheck, API build, frontend build, Research/Discovery test suites | no visible R20 classification, Boundary Registry registration, bypass/degradation lint, or registered-gate allow/deny step | no predicate-diff/version-history check visible |
| J0-07 | root `package.json` | `dca71cc977605274cb9a513fb68dc444ac4a390e` | build + TypeScript typecheck scripts | no lint/static architecture command for R20 visible | none |
| J0-08 | `scripts/` directory | tree surface inspected; notable blobs include runtime-supervisor tooling | runtime bootstrap/deployment/supervisor tooling | no dedicated R20 static/architectural checker visible in enumerated scripts | no registry-definition history checker visible |
| J0-09 | `scripts/src/hello.ts` | `9fa5cec17c0d902b107884bf52524cd83662e372` | only TypeScript source visible under `scripts/src` | none | none |

## 4. SHA-pinned schema / authority-state inventory

### J0-10 — database schema directory

**Tree:** `lib/db/src/schema` / SHA `c71b03cd7694cc4832b9a68da88c50816173f832`.

The directly enumerated schema modules include asset, auth, bet, build, discovery, execution, factory, human-actions, lifecycle, money-scout, release, runtime, and related modules. No file named or obviously dedicated to Boundary Registry / Boundary Decision is visible in the directory enumeration.

This is **not** yet a claim that equivalent structures cannot exist inside another schema module. J0 therefore inspected the most authority-rich visible module directly as a naming-independent check.

### J0-11 — `lib/db/src/schema/asset.ts`

**Blob:** `dbb75cb44380cc761d654ae04b567bf4c54e079b`.

This schema persists significant authority-related current state, including `PersistedAssetAuthorities` with public release, customer charging, outbound, advertising, custom-domain, production-credential, and external-spend-ceiling fields. It also persists operations policy and commercial/lifecycle state.

Important distinction:

`assets.authorities` is an authority-state representation. It is **not evidence by itself** of an R20 Boundary Registry that records:

- boundary identity/class;
- required predicate set;
- evidence contract;
- semantic scope;
- version/history of those definitions;
- re-registration history after material change;
- predicate-definition changes needed to detect J-A11 degradation.

No such versioned Boundary Registry mechanism was identified in the inspected portion of this schema artifact.

## 5. Repository-search and tree corroboration

Direct code-index searches for `Boundary Registry` and boundary-validator/consequential terminology returned no matches.

Those misses are only corroborating evidence, not proof of global absence.

The repository tree was therefore inspected directly for:

- `.github` governance surfaces;
- root engineering/docs surfaces;
- `scripts/`;
- `lib/db/src` and `lib/db/src/schema`;
- authority-rich `asset.ts`.

J0's defensible inventory statement is therefore:

> **No durable R20-specific classification/Boundary-Registry enforcement artifact or versioned predicate-definition history surface has been found in the enumerated, SHA-pinned governance/process/CI/script/schema surfaces.**

This remains open to amendment if adversarial review identifies an omitted equivalent mechanism elsewhere in the repository.

## 6. J-A11 degradation-detectability inventory

The governing plan added J-A11 because future code can degrade an existing gate without bypassing it.

To detect degradation after the fact, at least one of the following would need to exist:

1. immutable/versioned Boundary Registry definitions;
2. append-only registration history;
3. schema/model version lineage for required predicate/evidence sets;
4. a source-controlled canonical registry whose diffs are treated as authority-sensitive changes;
5. a durable review record tying a material predicate change to re-classification/re-registration;
6. tests/fixtures that preserve previously required denial conditions and fail if those conditions disappear.

**Current J0 result:** none of those R20-specific history mechanisms has yet been identified in the inspected surfaces.

This does **not** yet create a J1 finding. J1 must determine whether an equivalent mechanism exists elsewhere or whether the obligation is merely documented/missing/partially enforced.

## 7. Evidence-layer map available for J1

### NORMATIVE_REQUIREMENT

Present through R20 recovered contract and governing Phase-J plan.

### PROCESS_DOCUMENTATION

Clearly present through:

- `AGENTS.md`;
- `docs/engineering-workflow.md`;
- `docs/PRODUCT_PRINCIPLES.md`.

### DURABLE_WORKFLOW_CONTROL

Partially present generically:

- agent work-item template;
- PR-based engineering loop;
- GitHub `main` / CI acceptance process.

R20-specific durable triggers/fields have not yet been identified.

### MECHANICAL_REPO_GATE

Generic CI/typecheck/build/test gates are present.

R20-specific classification/registration/bypass/degradation checks have not yet been identified.

### CONSUMER_LEVEL_TEST_PROOF

General authority-boundary regression-test guidance exists.

No J0-inspected artifact yet proves a repository-wide requirement that every new/materially changed consequential consumer has both allow and deny coverage through a registered R20 gate.

### ESCAPE_RESISTANCE

No existing J-A1–J-A11 fixture suite or equivalent R20 future-code escape suite has yet been identified.

## 8. Inventory arithmetic

J0 inventories **11 pinned/identified surfaces** (`J0-01` through `J0-11`).

These are **inventory surfaces, not Phase-J primaries**.

Phase-J primary denominator remains **6** (`J-01` through `J-06`).

Mandatory attack denominator remains **11** (`J-A1` through `J-A11`).

No J1 disposition is assigned by J0.

## 9. Negative/omission checks before J1

Adversarial review should specifically try to identify any omitted equivalent of:

- Boundary Registry schema/model under a different name;
- Boundary Decision persistence;
- consequential-surface classification metadata;
- canonical predicate-set registry in source code;
- registry version/history/audit log;
- static architecture check/lint outside `scripts/`;
- package-local CI/test script not obvious from root CI;
- PR/review template or CODEOWNERS/ruleset mechanism outside the enumerated `.github` listing;
- tests specifically asserting consumer invocation of an authority gate;
- workflow automation that creates A0/A1 work on unrepresentable consequence classes.

A discovered equivalent should amend J0 before J1 canonical adjudication.

## 10. Review questions

1. Is the bounded absence language sufficiently conservative, or does any statement still imply repository-global nonexistence?
2. Did J0 inspect the right schema/runtime surfaces to test for a Boundary Registry under alternate terminology?
3. Is `assets.authorities` correctly separated from Boundary Registry/Boundary Decision governance rather than treated as an equivalent control?
4. Does the J-A11 history checklist capture the minimum evidence needed to detect in-place predicate degradation?
5. Is the agent work-item template stronger than J0 credits because its generic `authority` / `constraints` fields could act as a durable classification trigger, or is that still discretionary prose without an R20-specific required field?
6. Are generic CI and regression-test requirements correctly inventoried as real controls without prematurely counting them as J_ENFORCED?
7. Is there a package-local test or lint command omitted from the root/CI inspection that materially changes J0?
8. Does absence of a PR template matter independently, or is it merely one missing mechanism under J-01/J-03 rather than a future primary?
9. Is predicate-definition history genuinely necessary for J-A11 escape resistance, or could a sufficiently strict source-controlled current registry + mandatory diff review + denial regression suite satisfy the obligation without append-only registry history?
10. Does any inventory item accidentally prejudge J1?

## 11. Provisional J0 result

`J0 INVENTORY COMPLETE FOR REVIEW / 11 GOVERNANCE-PROCESS-SCHEMA SURFACES PINNED OR DIRECTLY ENUMERATED / GENERIC ENGINEERING GOVERNANCE PRESENT / NO R20-SPECIFIC CLASSIFICATION-REGISTRATION-MECHANICAL-DEGRADATION CONTROL YET IDENTIFIED IN ENUMERATED SURFACES / NO VERSIONED PREDICATE-DEFINITION HISTORY YET IDENTIFIED / SIX PHASE-J PRIMARIES UNCHANGED / ELEVEN ATTACKS UNCHANGED / ZERO J1 DISPOSITIONS ASSIGNED / IMPLEMENTATION AUTHORITY SUSPENDED`
