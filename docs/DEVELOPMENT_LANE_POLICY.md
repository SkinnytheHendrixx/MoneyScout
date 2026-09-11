# Money Scout Development Lane Policy

**Status:** FROZEN GOVERNING DEVELOPMENT POLICY  
**Date:** 2026-09-11  
**Scope:** Engineering work performed while remediation-contract implementation authority remains suspended.

## 1. Governing operating rule

> **Lane B may share data structures and domain concepts with Lane A, but it must not carry or exercise authority, and it must be structurally incapable of crossing a consequential external boundary.**

The governing axis is **authority propagation, not interface sharing**.

A code path belongs to Lane A if it defines, carries, grants, consumes, or implicitly authorizes a consequential capability or state transition. Sharing a schema, type, table, interface, queue envelope, or domain model with consequential code does not by itself make otherwise non-authoritative work Lane A.

## 2. Lane A — authority-bearing or consequential work

Lane A includes, at minimum:

- authority schemas and authority-bearing fields;
- reservation/admission primitives;
- execution eligibility;
- provider dispatch;
- credential selection or binding;
- commercial/payment state;
- lifecycle transitions that enable consequential work;
- retry/reconciliation rules that can cause, repeat, settle, release, or adopt consequential effects;
- capability readiness or binding logic;
- any status/boolean/enum/result whose value can make real-world execution permissible;
- any mock/test abstraction deliberately designed to be production-swappable at a consequential boundary;
- any code path that can spend money, consume governed scarce resources, mutate an external system, grant financial/commercial authority, or adopt the result of a consequential external action.

While remediation implementation authority is suspended, Lane A may be recovered, specified, reviewed, simulated, or tested against non-authoritative fixtures, but must not be implemented as live consequential authority from provisional contracts.

## 3. Lane B — non-authoritative engineering allowed in parallel

Lane B may proceed while recovery continues, including:

- read models;
- presentation schemas;
- UI and navigation;
- dashboards and reporting;
- analytics and data visualization;
- observability and structured logging;
- developer tooling;
- fixtures;
- deterministic simulations;
- test harnesses;
- non-production mock providers;
- contract inspection/audit tooling;
- non-authoritative derived views;
- schema-independent front-end work;
- other infrastructure that does not define, carry, grant, consume, or implicitly authorize consequential state.

Lane B must not become a hidden implementation path for provisional authority semantics.

## 4. Structural non-production properties

Non-production safety must be enforced mechanically, not merely by naming conventions or code-review intent.

Examples of acceptable hard properties include:

- mock adapters contain no production credential-loading path;
- simulation executors reject production provider/account identities;
- test-only execution paths fail closed when deployment identity/environment is production;
- fixtures cannot resolve to live provider endpoints;
- non-production provider implementations cannot be selected by production execution routing through configuration alone;
- test credentials, account identifiers, and endpoints are type- or environment-separated from production identities where practical.

A non-production component that can become production-capable merely by supplying a real credential or flipping a permissive configuration bit does not satisfy this policy.

## 5. Classification test for a pull request

For every material engineering change during recovery, ask:

> **Does this change define, carry, grant, consume, or implicitly authorize a consequential capability or state transition?**

- **YES:** Lane A.
- **NO:** continue to the structural-boundary test.

Then ask:

> **Can this code path, as built, cross a consequential external boundary or become able to do so merely by supplying production identity/credentials/configuration?**

- **YES:** Lane A, or redesign until the production crossing is structurally impossible.
- **NO:** Lane B may proceed.

Shared interfaces alone are not sufficient to classify work as Lane A.

## 6. Two independent human checkpoints

### Checkpoint H1 — Direction review

Timing: during recovery / before authority-kernel implementation.

Purpose: obtain a lightweight independent engineering/security judgment on the shape of the system before expensive authority implementation begins.

This is not a line-by-line document audit. The reviewer should be able to answer at minimum:

- Does the architecture solve the right systems problem?
- Are trust boundaries materially misplaced?
- Is the design unnecessarily complex for the intended autonomy/economic scale?
- Is an obvious simpler or safer architecture being missed?
- Are consequential boundaries identifiable and reviewable?

Target: approximately 60–90 minutes with a senior systems/security-minded engineer or equivalent independent reviewer.

### Checkpoint H2 — Consequential-surface review

Timing: after the authority kernel is implemented and tested, but before real financial credentials, payment authority, live customer mutations, or unattended consequential autonomy are enabled.

Purpose: review actual high-risk code and failure modes, especially:

- money/resource authority;
- provider dispatch;
- external mutation fencing;
- credentials/account binding;
- reconciliation and uncertainty;
- kill/pause behavior;
- retry/idempotency/replay safety;
- commercial/payment authority where applicable.

H1 does not substitute for H2. H2 does not retroactively substitute for H1.

## 7. Recovery and implementation sequence

The governing sequence is:

1. continue remediation recovery through R20;
2. continue Lane B engineering in parallel under this policy;
3. complete H1 direction review before authority-kernel implementation;
4. run the Global Fidelity & Cross-Node Audit;
5. rebuild/freeze corrected implementation authority only after the audit passes to the required assurance tier;
6. derive implementation batches from START / LOCAL CLOSURE / E2E dependency graphs;
7. implement the safety/authority kernel;
8. run adversarial QA and full-system simulations;
9. complete H2 consequential-surface review;
10. only then connect real money, production credentials, customer-facing external mutations, or unattended consequential autonomy.

## 8. Relationship to remediation recovery

This policy does not restore remediation implementation authority. It only defines what engineering may safely proceed while that authority remains suspended.

Representational/test progress is not permission to bypass recovered contracts later. Any Lane B artifact reused by Lane A must be reclassified at the moment it begins carrying authority or gains the ability to cross a consequential boundary.

## 9. Standing invariants

> **Implementation authority suspended ≠ all engineering suspended.**

> **Authority propagation, not interface sharing, determines the lane.**

> **A mock that can become real by configuration alone is not structurally non-production.**

> **Good intentions and naming conventions are not safety mechanisms.**
