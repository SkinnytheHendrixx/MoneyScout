# Phase J — J0 Development-Governance Surface Inventory

**Status:** FINAL / REVIEWED / ADJUDICATED / J0 COMPLETE  
**Phase:** J — forward-governance / future-code coverage  
**Batch:** J0 — development-governance surface inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

J0 inventories the current repository surfaces that could enforce or support Phase-J obligations J-01 through J-06. It does **not** assign J1 enforcement dispositions.

Governing plan:

`PHASE_J_FORWARD_GOVERNANCE_FUTURE_CODE_COVERAGE_AUDIT_PLAN.md`

Canonical plan commit: `f598ab29de2bc580a6cdca896d0c7eedc1eb7227`.

Phase-J scope remains substantive future-code governance only. Phase-I historical naming debt and H2-E45 historical mechanical-form debt remain out of scope.

## 2. Inventory method and bounded-absence rule

J0 distinguishes:

- **artifact present** — directly inspected and SHA-pinned;
- **surface class present, R20-specific control not visible** — generic/local mechanism exists but no inspected R20-specific forward-governance enforcement was found;
- **not found in enumerated surfaces** — no equivalent artifact was found after direct inspection of the listed process/workflow/script/schema/application surfaces;
- **not proven globally absent** — repository-wide semantic absence is never inferred merely from code-search misses or a bounded file set.

This bounded-absence rule is load-bearing. J0 is an inventory, not a repository-global nonexistence proof.

## 3. SHA-pinned governance/process inventory

| J0-ID | Surface | Blob / tree SHA | Relevant control | R20-specific force visible? |
|---|---|---|---|---|
| J0-01 | `AGENTS.md` | `80903b93a7ecdbb92f1aefba581b975efd1dfd0f` | short-lived branches; GitHub Actions before merge; `main` deployment gate; architecture/authority review where needed; regression tests for every authority boundary | generic only; no durable consequential-surface classification or Boundary Registry registration field/control identified |
| J0-02 | `docs/engineering-workflow.md` | `14d9dcf6f4d65d066601249b2ea4d6ccf2b05081` | PR loop; canonical CI; adversarial authority/idempotency/cost/provenance/recovery tests; architecture/authority review where required | generic only; trigger for “where required” is not defined here |
| J0-03 | `docs/PRODUCT_PRINCIPLES.md` | `b77cde5c104a48830ba00496e259e8a8f74cc37c` | granular authority; independent verification for consequential changes; no blind paid retries | normative principles, not a merge-time R20 workflow control |
| J0-04 | `.github/ISSUE_TEMPLATE/agent-work-item.md` | `c2dc28872599f07a067ba407bb0f2845ec79f5a9` | durable work envelope with base SHA, authority, acceptance, constraints | generic fields only; no required consequentiality classification, boundary class, predicate set, re-registration, or degradation-review field |
| J0-05 | `.github` directory | tree `9d5bcbeb49cf93f1d5c6247e528d8c9f30f3a6d2` | issue template + workflows | no PR template or dedicated R20 review checklist visible |
| J0-06 | `.github/workflows/ci.yml` | `97872acddffab1b06f607570486a99ebd820d07c` | schema push, typecheck/build, runtime-supervisor and Research/Discovery test suites | no visible R20 classification, registry registration, bypass/degradation lint, or dedicated registered-gate allow/deny step |
| J0-07 | root `package.json` | `dca71cc977605274cb9a513fb68dc444ac4a390e` | build + typecheck scripts | no R20 architecture/lint command visible |
| J0-08 | `scripts/` directory | directly enumerated tree surface | runtime bootstrap/deployment/supervisor tooling | no dedicated R20 checker visible in enumerated scripts |
| J0-09 | `scripts/src/hello.ts` | `9fa5cec17c0d902b107884bf52524cd83662e372` | only TypeScript source visible under `scripts/src` | none |

## 4. SHA-pinned schema / authority-state inventory

### J0-10 — `lib/db/src/schema`

Tree SHA: `c71b03cd7694cc4832b9a68da88c50816173f832`.

The enumerated schema modules include asset, auth, bet, build, discovery, execution, factory, human-actions, lifecycle, money-scout, release, runtime, and related modules. No file named or obviously dedicated to Boundary Registry / Boundary Decision appears in the directory enumeration. This is not proof that an equivalent structure cannot exist under another name.

### J0-11 — `lib/db/src/schema/asset.ts`

Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`.

This schema persists material authority-related current state, including `PersistedAssetAuthorities` for public release, customer charging, outbound, advertising, custom domain, production credentials, and external spend ceiling. It also persists operations policy and lifecycle/commercial state.

`assets.authorities` is therefore real authority-state representation, but it is **not evidence by itself** of an R20 Boundary Registry that records boundary identity/class, required predicate set, evidence contract, semantic scope, or re-registration/change discipline.

## 5. Application execution-layer corroboration

Adversarial review identified six consequential/runtime files that had been directly read in earlier audit phases. J0 independently re-read them because they are a distinct evidentiary stratum from process docs, CI, scripts, and schema: these are surfaces where consequential behavior and local authority checks actually execute.

| J0-ID | Application surface | Blob SHA | Directly observed control character | R20-specific registry/classification metadata visible? |
|---|---|---|---|---|
| J0-12 | `artifacts/api-server/src/lib/commercial-activation-worker.ts` | `fe4592c8c2e2113d479d14f9396826b6fc0dee48` | merchant capability, production-credential authority/capability, charging authority, disabled checkout preparation, uncertain provider-outcome handling | no durable boundary-class/predicate-set registration mechanism identified in this file |
| J0-13 | `artifacts/api-server/src/lib/execution-kernel.ts` | `f4065ad5bf6ce8a91b2ca13f25c367ca6b3bcbd9` | durable jobs, failure classes, retry policy, human blocking, deterministic recovery | no R20 boundary registration/classification mechanism identified in this file |
| J0-14 | `artifacts/api-server/src/lib/human-action-reconciler.ts` | `3b255e2be70f31d2b02e32f790fce2d3e3f65b40` | exhaustion/capability/human-gate reconciliation | no R20 boundary registry metadata identified in this file |
| J0-15 | `artifacts/api-server/src/lib/asset-operations-worker.ts` | `43c62aa1e6a51898df12e87d3043ffb4bd7acd5a` | default authority set, operations policies, release-to-asset activation, observations | no boundary-class/predicate-definition registration mechanism identified in this file |
| J0-16 | `artifacts/api-server/src/lib/asset-remediation-worker.ts` | `d4bef756c3c7d05199db238d3e8bde4f323d97a3` | bounded maintenance scope, independent QA, zero-cash enforcement, no authority expansion | no R20 registry/predicate-definition mechanism identified in this file |
| J0-17 | `artifacts/api-server/src/lib/human-gates.ts` | `2e8386b4784a95668db360be978933821529c871` | capability usability and durable human-authority gates | no R20 boundary class/predicate registration mechanism identified in this file |

These files show **substantial local safety and authority logic**. That evidence matters and must not be flattened into “no controls exist.” But local hand-coded guards are not themselves proof that future consequential code is forced through R20 classification, registration, review, mechanical enforcement, and consumer-level gate testing.

The strengthened bounded inventory statement is therefore:

> **No durable R20-specific classification/Boundary-Registry enforcement artifact or predicate-definition degradation-history mechanism has been found in the enumerated, SHA-pinned governance/process/CI/script/schema surfaces or the six directly inspected application execution surfaces.**

This remains a bounded statement and is open to amendment if an equivalent mechanism is identified elsewhere.

## 6. J-A11 degradation-detectability methodology resolved for J1

J-A11 asks whether an already registered gate can be weakened while remaining present and apparently healthy.

Adversarial review correctly sharpened the methodology: a dedicated append-only, runtime-queryable historical registry is **not categorically required** to resist degradation. A source-controlled canonical registry/definition already leaves passive Git history. But passive history is retrospective evidence, not by itself a fail-closed control, and human diff review can miss a subtle authority-weakening change.

For J1, degradation resistance may therefore be credited only where a mechanism is strong enough to make silent predicate weakening fail or become a mandatory governed change. One sufficient audit pattern is the composition of:

1. a source-controlled canonical boundary/predicate definition;
2. a durable authority-sensitive trigger that treats material definition changes as requiring re-classification/re-registration/review;
3. a mandatory denial-regression suite that proves each currently required predicate independently matters;
4. execution of that suite in required CI or an equivalent non-optional gate;
5. governance of changes/deletions to those denial fixtures themselves as material authority changes.

For each required predicate `P_i`, the strongest ordinary denial fixture is:

> with every other required predicate satisfied, omit or invalidate `P_i`; the consumer must still be denied.

If `P_i` is silently removed or weakened and that fixture remains mandatory, CI should fail. This is the load-bearing mechanical property, not the mere existence of historical diffs.

This is **audit methodology, not an implementation prescription**. J1 may accept another mechanism if it supplies equivalent mechanical degradation resistance. Conversely, if no comprehensive mandatory per-predicate denial suite or equivalent safeguard exists, passive Git history plus human review alone is insufficient for `J_ENFORCED` treatment of J-A11 degradation resistance.

J1 must explicitly answer:

- does every required predicate have an individual deny-without-`P_i` proof where technically meaningful?
- does the consumer demonstrably route through the current gate?
- is the relevant suite mandatory in the acceptance path?
- can the denial fixtures themselves be silently weakened/deleted without authority-sensitive scrutiny?
- if such a suite does not exist, what equivalent mechanical safeguard prevents silent gate degradation?

## 7. Evidence-layer map available for J1

### NORMATIVE_REQUIREMENT
Present through R20 recovered contract and the governing Phase-J plan.

### PROCESS_DOCUMENTATION
Clearly present through `AGENTS.md`, `docs/engineering-workflow.md`, and `docs/PRODUCT_PRINCIPLES.md`.

### DURABLE_WORKFLOW_CONTROL
Partially present generically through the work-item template, PR-oriented engineering loop, and `main`/CI acceptance process. No R20-specific durable classification/re-registration trigger has yet been identified.

### MECHANICAL_REPO_GATE
Generic CI/typecheck/build/test gates are present. No R20-specific classification/registration/bypass/degradation check has yet been identified in the inventoried surfaces.

### CONSUMER_LEVEL_TEST_PROOF
Local authority guards and general authority-boundary test guidance exist. J0 has not found repository-wide proof that every new or materially changed consequential consumer has mandatory allow/deny coverage through a registered R20 gate.

### ESCAPE_RESISTANCE
No existing J-A1–J-A11 fixture suite or equivalent future-code escape suite has yet been identified.

## 8. Inventory arithmetic

J0 inventories **17 SHA-pinned or directly enumerated surfaces** (`J0-01` through `J0-17`).

These are inventory surfaces, **not Phase-J primaries**.

- Phase-J primary denominator: **6** (`J-01` through `J-06`).
- Mandatory attack denominator: **11** (`J-A1` through `J-A11`).
- J1 enforcement dispositions assigned by J0: **0**.

Adversarial review changed only the inventory breadth: `11 → 17`. It created no new primary and no new attack.

## 9. Negative/omission checks carried into J1

J1 should remain alert for any omitted equivalent of:

- Boundary Registry / Boundary Decision under another name;
- consequential-surface classification metadata;
- source-controlled predicate-set registry;
- registry-change trigger or authority-sensitive diff mechanism;
- package-local lint/static architecture check;
- PR/ruleset/CODEOWNERS mechanism not exposed by the basic `.github` listing;
- consumer tests proving actual gate invocation and per-predicate denial;
- automation that turns unrepresentable consequence classes into governed A0/A1 work.

Discovery of such a mechanism can amend the J1 evidence basis; it must be SHA-pinned and inspected rather than inferred.

## 10. Adversarial review adjudication

Adversarial review accepted J0's bounded-absence framing and the separation of `assets.authorities` from Boundary Registry governance.

Two refinements were accepted after independent reread:

1. **Application-layer corroboration.** Six consequential/runtime files were added as J0-12 through J0-17. They contain substantial local authority/safety controls but no durable R20 class/predicate registration mechanism in those exact files. This broadens the inspected evidence strata without converting the conclusion into repository-global absence.
2. **J-A11 degradation methodology.** Append-only runtime registry history is not the only acceptable safeguard. Passive Git history and human review are insufficient alone; mandatory comprehensive per-predicate denial regression, coupled to a governed current definition/change trigger, can provide the necessary mechanical protection, or J1 may identify an equivalent safeguard.

No Phase-J primary, attack, or J1 disposition was added by review.

## 11. J0 result

`J0 COMPLETE / 17 SHA-PINNED OR DIRECTLY ENUMERATED GOVERNANCE-PROCESS-SCHEMA-APPLICATION SURFACES / GENERIC ENGINEERING GOVERNANCE AND SUBSTANTIAL LOCAL AUTHORITY CONTROLS PRESENT / NO R20-SPECIFIC CLASSIFICATION-REGISTRATION-MECHANICAL-DEGRADATION CONTROL YET IDENTIFIED IN ENUMERATED SURFACES / J-A11 METHOD RESOLVED: PASSIVE GIT HISTORY + HUMAN REVIEW INSUFFICIENT WITHOUT MANDATORY PER-PREDICATE DENIAL REGRESSION OR EQUIVALENT MECHANICAL SAFEGUARD / SIX PHASE-J PRIMARIES UNCHANGED / ELEVEN ATTACKS UNCHANGED / ZERO J1 DISPOSITIONS / IMPLEMENTATION AUTHORITY SUSPENDED`

Next: **J1 — six-obligation enforcement adjudication**.
