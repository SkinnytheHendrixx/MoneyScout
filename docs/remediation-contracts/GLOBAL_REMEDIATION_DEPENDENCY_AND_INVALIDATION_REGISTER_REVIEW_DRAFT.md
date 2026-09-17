# Money Scout — Global Remediation Dependency & Invalidation Register — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Stage:** Post-Phase-J remediation register construction  
**Implementation authority:** SUSPENDED  
**Governing planning draft:** `GLOBAL_REMEDIATION_AND_INVALIDATION_PLAN_REVIEW_DRAFT.md`  
**Canonical Phase-J baseline:** `PHASE_J_J3_FINAL_PHASE_J_SYNTHESIS.md`

## 1. Purpose

This register is the remediation control plane for the corrected Money Scout authority corpus.

It replaces coarse MCAS execution ordering with a typed dependency DAG. MCAS labels remain organizational families only; execution, invalidation, landing, recheck, and closure gates attach to individual remediation DAG nodes.

No row in this register authorizes implementation. No finding closes because a patch lands. Every amendment-bearing node requires prerequisite evaluation, PRE-BCT, reproducible invalidation derivation, landing-gate checks, amendment, rechecks, POST-BCT, and an explicit closure predicate.

## 2. Round-1 through Round-4 adjudications incorporated

This draft incorporates the following accepted review outcomes:

1. **G2-01 / R6-R7-R8 Case A:** R6/R7/R8 contracts are semantically sufficient; the confirmed defect is implementation evidence/wiring. Those contracts do not receive new canonical SHAs solely for G2-01, but dependent implementation-evidence certifications are invalidated and rechecked.
2. **Four edge-specific rule-definition prerequisites:** `R17→R18`, `R19→R18`, `R19→R14`, and `R5→R20` are missing-composition rule-definition work. Only representation that depends on those rules is blocked; unrelated structural work remains parallel.
3. **MCAS-0 dissolved:** Phase-H source/provider items are direct typed prerequisites of their actual consumers, not a shared global gate.
4. **MCAS-4 dissolved:** retention/addressability is represented by six node-specific `CLOSURE_PREREQUISITE` nodes for R9/R10/R17/R18/R19/R20. No node's closure is blocked on an unrelated node's retention question.
5. **Finding and certification state separated:** findings use lifecycle states such as `OPEN → AMENDED_PENDING_RECHECK → CLOSED`; certifications retain historical pinned results and carry typed invalidation causes.
6. **PRE-BCT and POST-BCT are per amendment-bearing DAG node.**
7. **Candidate graph maintenance is a landing gate:** graph-effect checks run before `MAY_LAND`; any new/changed edge updates the candidate graph immediately.
8. **Edge classification is a close gate:** no node may reach `MAY_CLOSE` while any new/changed edge it introduced remains unclassified or lacks required reciprocal/skip-link review.
9. **Candidate Consequential Surface Inventory:** a positive BCT-7 result requires an immediate provisional inventory write before the node can pass the gate.
10. **Physical-root stability lock:** if an amendment enters `AMENDMENT_APPLIED` on a shared physical root, every other DAG node that consumes that root as evidence enters `BLOCKED_PENDING_SHARED_ROOT_STABILITY` until the modifying node reaches `POST_AMENDMENT_BCT_PASSED` or rolls back to a known stable state.
11. **Late exactness narrowed:** identity/equality/reference-affecting exactness moves to the DAG node that needs it. The late adopted-form family contains only non-semantic form/naming choices.
12. **Phase-J arithmetic remains exact:** 11 total attacks = 10 open future-code escapes + 0 development-process closures + 1 J-A9 audit-governance-provenance closure.

## 3. Typed dependency vocabulary

- `SEMANTIC_PREREQUISITE` — governing rule must be defined first.
- `REPRESENTATION_PREREQUISITE` — exact/arbitrary-N representation must exist before a dependent consumer can close.
- `CLOSURE_PREREQUISITE` — design/amendment may proceed, but finding closure is blocked.
- `GOVERNANCE_PREREQUISITE` — governance cannot freeze around unresolved consequence/predicate semantics.
- `EVIDENCE_RECHECK_DEPENDENCY` — semantics remain stable but changed implementation/configuration evidence invalidates prior certification.
- `GRAPH_UPDATE_DEPENDENCY` — changed/new semantic relationship must update the candidate Phase-C graph.
- `SOURCE_PREREQUISITE` — source proposition must be recovered or receive an allowed governed conservative/current disposition.
- `PROVIDER_PREREQUISITE` — provider-specific authority remains blocked until required provider evidence/mapping exists.
- `SHARED_ROOT_STABILITY_DEPENDENCY` — evidence/recheck work is blocked while a shared physical root is mid-amendment.

## 4. Node lifecycle and gates

Every amendment-bearing DAG node tracks:

1. `PROPOSED`
2. `PREREQUISITES_EVALUATED`
3. `PRE_AMENDMENT_BCT_PASSED`
4. `PAIM_A_SEMANTIC_DERIVATION_COMPLETE`
5. `PAIM_B_EVIDENCE_DERIVATION_COMPLETE`
6. `PAIM_C_PHYSICAL_ROOT_EXPANSION_COMPLETE`
7. `PAIM_FROZEN`
8. `GRAPH_EFFECT_CHECK_COMPLETE`
9. `CANDIDATE_CONSEQUENTIAL_SURFACE_EFFECT_RECORDED`
10. `MAY_LAND = TRUE`
11. `AMENDMENT_APPLIED`
12. affected findings → `AMENDED_PENDING_RECHECK`
13. affected certifications → `INVALIDATED_BY_CHANGE[type]`
14. `RECHECKS_EXECUTED`
15. `POST_AMENDMENT_BCT_PASSED`
16. introduced/changed edges → `PHASE_C_CLASSIFIED + RECIPROCAL_SCAN_COMPLETE`
17. `MAY_CLOSE = TRUE`
18. `TARGET_FINDINGS_CLOSED` or `REMEDIATION_INCOMPLETE`

A node may have `MAY_DESIGN = TRUE` while `MAY_LAND = FALSE`, or `MAY_LAND = TRUE` while `MAY_CLOSE = FALSE`.

## 5. Concurrency control — physical-root stability

PAIM-C must enumerate every normative owner and certification that uses a changed physical surface.

When a node reaches `AMENDMENT_APPLIED` on a physical root shared by another active DAG node, all other nodes that consume that root as evidence must enter:

`BLOCKED_PENDING_SHARED_ROOT_STABILITY`

The block remains until the modifying node reaches:

`POST_AMENDMENT_BCT_PASSED`

or the surface is restored to a known stable version.

Canonical known example: `commercial_activations` is a shared physical root supporting both R17 Offer/Grant and R19 Commercial Authority Lineage concerns. A parallel certification may not use that root while it is between amendment application and post-amendment stability certification.

This lock is an execution-safety control. It does not collapse the independent normative owners or findings that share a physical root.

## 6. Candidate-graph rule

Graph presence and edge certification are separate states.

For every remediation node that defines, removes, or materially changes a semantic relationship:

- before `MAY_LAND`, run the graph-effect derivation and update the candidate amended cross-reference inventory;
- immediately classify/schedule the changed/new edge under Phase-C rules and run required reverse/skip-link analysis;
- every later PAIM uses the updated candidate graph;
- before `MAY_CLOSE`, every edge introduced or changed by the node must be `PHASE_C_CLASSIFIED` with required reciprocal scan complete.

The mandatory final full Phase-C sweep remains required after all targeted rechecks.

## 7. Core rule-definition nodes confirmed by Phase C

### RD-C-R17-R18 — define R17→R18 commercial capability composition

- **Source:** Phase-C `MISSING_REQUIRED_COMPOSITION`
- **Normative owners:** R17/R18 as adjudicated during amendment drafting
- **Dependency type:** `SEMANTIC_PREREQUISITE`
- **Blocks:** exact R17 Offer/Grant ↔ R18 Capability Binding representation/correspondence
- **Does not block:** R17 historical Offer/Grant identity by itself; R18 Capability Binding identity by itself
- **Candidate graph effect:** mandatory check; update if rule creates/materially changes explicit edge semantics
- **Closure:** rule is canonical, PRE/POST BCT pass, affected edge is Phase-C classified, dependent representation can state an exact acceptance predicate

### RD-C-R19-R18 — define R19→R18 lineage/binding composition

- **Source:** Phase-C `MISSING_REQUIRED_COMPOSITION`
- **Dependency type:** `SEMANTIC_PREREQUISITE`
- **Blocks:** exact R19 lineage ↔ R18 binding representation/correspondence
- **Does not block:** independent R19 lineage identity or R18 object identity work
- **Candidate graph effect:** mandatory check

### RD-C-R19-R14 — define R19→R14 lifecycle/lineage handoff composition

- **Source:** Phase-C `MISSING_REQUIRED_COMPOSITION`
- **Dependency type:** `SEMANTIC_PREREQUISITE`
- **Blocks:** any representation/acceptance fixture requiring commercial lineage preservation across the R14 lifecycle/runtime handoff
- **Source note:** R14's recovered boundary sections enumerate R8, R12, R13, R10, and R20 but no R19 boundary; the missing relationship is therefore rule-definition work, not merely implementation wiring
- **Candidate graph effect:** mandatory check

### RD-C-R5-R20 — define R5→R20 confirmation/freshness-at-boundary composition

- **Source:** Phase-C `MISSING_REQUIRED_COMPOSITION`
- **Dependency type:** `SEMANTIC_PREREQUISITE`
- **Blocks:** R20 representation of R5 confirmation/freshness binding and any governance predicate depending on the adopted rule
- **Schema consequence:** rule may require exact binding to R5 confirmation identity, applicable policy/version, and boundary-time freshness/evaluation evidence
- **Downstream dependency:** may become `GOVERNANCE_PREREQUISITE` for R20/Phase-J registry predicate modeling
- **Candidate graph effect:** mandatory check

## 8. Contract-sufficient implementation-conformance node

### IC-G2-01 — exact provider/account identity implementation conformance

- **Finding:** G2-01 `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`
- **Normative posture:** R6/R7/R8 contracts are already sufficient
- **Amendment class:** implementation/schema/wiring under existing contracts
- **Known mechanisms:** mutable/current capability overwrite behavior; provider-keyed adapter bridge behavior
- **Dependency type:** `EVIDENCE_RECHECK_DEPENDENCY`
- **Required invariant:** exact provider/account identity remains equal through capability proof/binding, Offer/Grant authority, lineage, boundary consumption, and actual consequential provider dispatch
- **Contract SHA effect:** no R6/R7/R8 canonical contract SHA change solely for this finding
- **Invalidation:** Phase-G implementation-evidence conclusions and any later certification that cited the changed capability/bridge behavior
- **Recheck:** rerun the canonical end-to-end G2-01 fixture against corrected implementation evidence

## 9. Historical identity / representability nodes

The following are structural nodes under the historical-authority family. They may proceed in parallel except where a row has an explicit semantic prerequisite.

### REP-R9 — R9 Build Source Snapshot arbitrary-N historical identity

- **Primary source:** Phase-F representability findings touching R9
- **Rule status:** semantic contract already recovered
- **Dependencies:** node-specific R9 retention node is a `CLOSURE_PREREQUISITE`, not a design/landing prerequisite unless amendment mechanics require it
- **May proceed independent of:** the four missing composition-rule nodes

### REP-R10 — R10 Artifact Version / QA / Release historical identity

- **Primary source:** Phase-F R10 representability defects
- **Rule status:** semantic contract already recovered
- **Dependencies:** node-specific R10 retention closure prerequisite
- **Required invariants:** arbitrary-N artifacts; exact QA/Release ↔ Artifact correspondence; no current/latest substitution

### REP-R17 — R17 Offer Version / CUSTOMER_CHARGING Grant historical identity

- **Primary source:** Phase-F R17 representability defects
- **Shared physical root:** `commercial_activations`
- **Dependencies:** node-specific R17 retention closure prerequisite
- **Independent scope:** Offer/Grant multiplicity and immutable identity may proceed before RD-C-R17-R18
- **Blocked subpredicate:** R17↔R18 exact correspondence cannot close until RD-C-R17-R18 is canonical

### REP-R18 — R18 Capability Binding Snapshot / validation / execution attachment

- **Primary source:** Phase-F R18 representability defects
- **Dependencies:** node-specific R18 retention closure prerequisite
- **Independent scope:** R18 object/binding historical identity may proceed before R17/R19 cross-composition rules
- **Blocked subpredicates:** R17↔R18 correspondence waits on RD-C-R17-R18; R19↔R18 correspondence waits on RD-C-R19-R18

### REP-R19 — R19 complete Commercial Authority Lineage

- **Primary source:** Phase-F R19 representability defects
- **Shared physical root:** `commercial_activations`
- **Dependencies:** node-specific R19 retention closure prerequisite
- **Independent scope:** complete lineage identity, arbitrary-N, direct/embedded same-path representation
- **Blocked subpredicates:** R19↔R18 waits on RD-C-R19-R18; R19→R14 handoff representation waits on RD-C-R19-R14

### REP-R20 — R20 Boundary Decision identity / exact predicate bindings

- **Primary source:** Phase-F R20 representability defects including Boundary Registry representation question where applicable
- **Dependencies:** node-specific R20 retention closure prerequisite
- **Independent scope:** core Boundary Decision historical identity may proceed
- **Blocked subpredicate:** R5 confirmation/freshness binding waits on RD-C-R5-R20
- **Governance relation:** final registry/predicate governance waits on stable applicable R20 semantics

## 10. Node-specific retention/addressability closure prerequisites

The former monolithic MCAS-4 is dissolved.

Each item below is independent unless later evidence proves a shared policy must itself be canonical and atomic.

### RET-R9
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** R9 historical representability findings only where durable addressability is part of the acceptance predicate

### RET-R10
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** applicable R10 historical representability findings

### RET-R17
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** applicable R17 historical Offer/Grant representability findings

### RET-R18
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** applicable R18 binding/history findings

### RET-R19
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** applicable R19 lineage/history findings

### RET-R20
- **Dependency type:** `CLOSURE_PREREQUISITE`
- **Blocks closure of:** applicable R20 Boundary Decision/history findings

Each retention node must define, where applicable: deletion policy; archival/tombstone semantics; parent deletion behavior; immutable addressability; reconstruction of current projections without history mutation; and migration behavior for legacy records.

## 11. Independent Phase-F exact-reference / truth-composition nodes

These are control cases showing that representability work does not globally depend on missing-rule remediation.

### REP-F07-13 — R2 Resolution Outcome ↔ R7 reservation
- **Dependency:** representation only under already-recovered semantic rule
- **Requirement:** exact outcome/version at admission; no current/latest substitution

### REP-F07-14 — R12 runnable occurrence ↔ R13 path-health result
- **Dependency:** R13 semantic/source prerequisite(s) for thresholds/formula where acceptance requires them
- **Requirement:** exact occurrence/path/executor/expectation identity

### REP-F07-15 — R3 freshness result ↔ R20 decision predicate
- **Dependency:** representation under recovered rule
- **Requirement:** operation-bound freshness identity/policy version; freshness does not substitute for historical lineage

### REP-F07-16-17 — R7/R15/R16 financial truth composition
- **Dependency:** provider-specific source prerequisites only for provider-specific semantics
- **Requirement:** exact reservation/execution identity; immutable evidence set; deterministic order-independent reconciliation; no retroactive erasure

## 12. Source/provider prerequisite nodes

No global source gate exists. Each source item blocks only actual consumers.

### SRC-H1-S01 — R8 reconciliation-capability taxonomy/model
- **Type:** `SOURCE_PREREQUISITE`
- **Disposition origin:** SAFE-CONSERVATIVE semantic gap / Phase-I dual-layer naming issue
- **Consumers:** only remediation requiring the complete R8 reconciliation capability taxonomy/model
- **Rule:** recover source if possible; otherwise adopt explicitly governed conservative current semantics without historical-name laundering

### SRC-H1-S02 — R13 health-transition thresholds/stall windows
- **Type:** `SOURCE_PREREQUISITE`
- **Consumers:** R13-dependent path-health representation/behavior, especially REP-F07-14

### SRC-H1-S03 — R13 aggregate-health formula
- **Type:** `SOURCE_PREREQUISITE`
- **Consumers:** R13 aggregate-health behavior/fixtures

### SRC-H1-S04 — R14 readiness/drain timeout policy
- **Type:** `SOURCE_PREREQUISITE`
- **Consumers:** applicable R14 lifecycle/handoff remediation including RD-C-R19-R14 where the rule depends on timeout semantics

### SRC-H1-S05 / S06 — R15 provider redaction + financial mappings
- **Type:** `PROVIDER_PREREQUISITE`
- **Consumers:** provider-specific R15 adapter/reconciliation implementation only

### SRC-H1-S07 — R16 provider financial interpretation
- **Type:** `PROVIDER_PREREQUISITE`
- **Consumers:** provider-specific R16 financial interpretation/reconciliation

### SRC-H1-S09 — R17 checkout-provider field mappings
- **Type:** `PROVIDER_PREREQUISITE`
- **Consumers:** provider-specific R17 checkout implementation only

Other Phase-H/I rows must be added during completeness reconciliation; absence from this initial review draft is not a closure statement.

## 13. Forward-governance nodes

J-F01 through J-F06 remain independently lifecycle-bearing even where one physical governance implementation serves several obligations.

### GOV-J-F01 — consequential-surface classification trigger
- **Finding:** J-F01
- **Current state:** documented-only
- **Dependencies:** stable consequence/authority semantics for surfaces being classified

### GOV-J-F02 — Boundary Registry registration/re-registration prerequisite
- **Finding:** J-F02
- **Current state:** missing
- **Dependencies:** stable registry taxonomy/predicate semantics; consume Candidate Consequential Surface Inventory

### GOV-J-F03 — mandatory bypass/degradation review trigger
- **Finding:** J-F03
- **Current state:** documented-only
- **External evidence hook:** branch-protection inspectability before PAIM freeze and corrected-register assembly

### GOV-J-F04 — deterministic fail-closed enforcement where mechanically possible
- **Finding:** J-F04
- **Current state:** missing
- **External evidence hook:** branch-protection inspectability

### GOV-J-F05 — consumer allow/deny + degradation regression proof
- **Finding:** J-F05
- **Current state:** documented-only
- **Acceptance:** consumer route-through-current-gate, allow and deny behavior, per-predicate degradation protection or equivalent

### GOV-J-F06 — unrepresentable consequence-class A0/A1 escalation
- **Finding:** J-F06
- **Current state:** missing
- **Acceptance:** unrepresentable new consequence class cannot proceed as local exception; governed escalation required

### Phase-J attack matrix gate

Before the governance family may close:

- replay J-A1–J-A8, J-A10, J-A11 individually against amended controls;
- preserve or re-adjudicate J-A9 only if its audit-governance-provenance basis was invalidated;
- final arithmetic must remain explicitly denominated over all 11 attacks.

## 14. Late adopted-form / naming nodes

Only non-semantic adopted form remains here.

An exactness/naming item must be pulled forward to its consumer if changing it could alter equality, uniqueness, lookup, cardinality, lineage, migration interpretation, registry membership, or acceptance-fixture outcome.

Phase-I historically unresolved names may be adopted as governed present-day names where allowed, but must not be represented as recovered historical names.

## 15. Register reconciliation requirements before first amendment

Before any substantive canonical amendment may land, this draft must be expanded and reconciled against the complete C→J primary/open inventory.

The reconciliation must prove:

1. every remediation-requiring Phase-C finding appears in at least one DAG node;
2. every Phase-F confirmed defect appears in a closure path;
3. every Phase-F unresolved item is represented either as a prerequisite, closure prerequisite, or explicit unresolved non-authority state;
4. G2-01 maps exactly once as a normative finding while allowing multiple implementation/evidence surfaces;
5. every Phase-H source gap has a row-level disposition and blocking scope;
6. every Phase-I naming/exactness item has a current treatment without historical laundering;
7. J-F01–J-F06 each remain independently traceable to closure even if governance implementation is shared;
8. no finding is silently duplicated into multiple closure owners;
9. every many-to-many mapping distinguishes `NORMATIVE_OWNER`, `PHYSICAL_ROOT`, and `RECHECK_CONSUMER`;
10. the register preserves attacks, source gaps, prerequisites, findings, and certifications as distinct object types.

## 16. Concurrency and duplicate-remediation rules

### Shared-root lock

A node may not consume a physical root as certification evidence while another amendment-bearing node has that root in an unstable interval from `AMENDMENT_APPLIED` through `POST_AMENDMENT_BCT_PASSED`.

### Single normative amendment owner

For any semantic proposition, exactly one DAG node is the amendment owner. Other nodes may depend on or recheck that proposition but may not independently redefine it.

### Shared implementation does not collapse findings

One code/schema/governance mechanism may remediate several findings physically. Each independently testable normative finding retains its own lifecycle and closure predicate.

### Duplicate detection

Before PAIM freeze, search the register for another active node with the same:

- normative proposition being changed;
- canonical owner;
- intended semantic postcondition.

If found, merge amendment ownership or explicitly document why the nodes are independently remediable.

## 17. Provisional register status

This is the first concrete register draft, not a completeness certification.

Known work still required before register freeze:

- enumerate every Phase-F confirmed defect and unresolved item into exact rows;
- enumerate all 57 Phase-H source-gap rows and map their blocking/nonblocking scope;
- map all nine Phase-I naming items and H2 exactness items;
- trace the complete Phase-C open finding set and any finding IDs into exact rule-definition/recheck nodes;
- enumerate exact Phase-D/E/F/G/H/I/J certification invalidations per node using PAIM-A/B/C;
- assign physical-root locks beyond the already-known `commercial_activations` case;
- reconcile many-to-many finding/node mappings and duplicate amendment ownership.

No amendment may use this review draft as build authority.

## 18. Current disposition

`GLOBAL REMEDIATION REGISTER CONSTRUCTION STARTED / ROUND-4 CONTROLS INCORPORATED / MCAS-4 DISSOLVED INTO NODE-SPECIFIC RETENTION PREREQUISITES / SHARED-PHYSICAL-ROOT STABILITY LOCK REQUIRED / NEW OR CHANGED EDGES MUST BE PHASE-C CLASSIFIED BEFORE DEPENDENT NODE CLOSURE / COMPLETENESS RECONCILIATION STILL PENDING / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
