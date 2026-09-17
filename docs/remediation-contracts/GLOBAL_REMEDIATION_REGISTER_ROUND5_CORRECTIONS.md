# Money Scout — Global Remediation Register — Round 5 Corrections

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE  
**Applies to:** `GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_REVIEW_DRAFT.md`  
**Base blob:** `90bb83da2a4a61c6e7712dae6f19ad3c9b6d3ed2`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the first concrete completeness attack against the actual C→J register draft.

Where this overlay conflicts with the base review draft, this overlay controls for the next adversarial round. It does not yet make the register canonical and does not authorize amendment or implementation work.

## 2. Correction R5-01 — add the fifth standing Phase-C remediation node

The base draft seeded the four `MISSING_REQUIRED_COMPOSITION` cases but omitted the separate standing Phase-C finding C21-03 / `R11 → R8`.

That omission is substantive because C21-03 is not `MISSING_REQUIRED_COMPOSITION`. It is the founding instance of `UNRESOLVED_CROSS_NODE_GAP`.

### New dependency/disposition type

Add:

`UNRESOLVED_TRANSITION_PREREQUISITE` — a governing seam already has composition and ownership, but the recovered authority admits multiple materially distinct coherent transition/closure readings and lacks sufficient authority to choose among them. The node must resolve the normative transition without rewriting upstream historical truth.

This type is intentionally distinct from `SEMANTIC_PREREQUISITE` because the cross-node relationship itself already exists.

### RD-C-R11-R8 — resolve R11 disposition for R8 `EXPOSURE_COMMITTED_UNRECONCILABLE`

- **Source:** Phase-C C21-03 `UNRESOLVED_CROSS_NODE_GAP`
- **Dependency type:** `UNRESOLVED_TRANSITION_PREREQUISITE`
- **Normative seam:** `R8 reaches EXPOSURE_COMMITTED_UNRECONCILABLE → what normatively happens to the active R11 reconciliation obligation?`
- **Required resolution:** define whether the R11 obligation remains open, terminates into a specialized terminal-unreconcilable state, or completes into an explicit successor obligation/governance owner
- **Required successor semantics if completion is permitted:** durable owner of the unresolved committed exposure; convergence of duplicate recovery/reconciliation attempts; authority, if any, to accept/write off/govern/remediate/disposition the exposure
- **Historical-truth invariant:** remediation may not turn permanently unknown R8 external truth into fabricated success, failure, cancellation, or non-dispatch
- **Candidate graph effect:** mandatory graph-effect check, but do not assume the fix creates a new edge because C21-03 already established an existing seam; update the graph only if the remediation adds or materially changes explicit semantic relationships
- **Closure:** ambiguity removed by governed authority, upstream R8 truth preserved, PRE/POST BCT pass, any changed/new edges complete Phase-C classification and reciprocal scan

The base register must no longer refer to the Phase-C open set as only four rule-definition nodes.

## 3. Correction R5-02 — seed F07 findings that are direct consumers of already-present nodes

The base register acknowledges that the Phase-F F7 enumeration is incomplete, but three omissions should be explicit now because they directly bind to already-seeded DAG nodes.

### REP-F07-04 — R17 Offer/Grant ↔ R18 commercial-payment binding

- **Source:** Phase-F F07-04 confirmed cross-surface representability/reference-integrity defect
- **Rule dependency:** `RD-C-R17-R18`
- **Dependency type:** `REPRESENTATION_PREREQUISITE` downstream of the semantic rule-definition node
- **Representation owners:** R17/R18 implementation surfaces as determined by final amendment design
- **Acceptance:** exact R17 Offer/Grant identity and exact R18 commercial-payment binding correspond to the same authorized historical path; no current/latest/provider-only substitution
- **Closure cannot occur before:** RD-C-R17-R18 is canonical and this representation passes arbitrary-N/mixed-history acceptance

### REP-F07-08 — R17 ↔ R19 commercial lineage reference integrity

- **Source:** Phase-F F07-08 confirmed cross-surface defect
- **Consumers/owners:** REP-R17 and REP-R19
- **Dependency:** representation under already-recovered R17/R19 semantic ownership split
- **Acceptance:** R19 lineage binds the exact R17 Offer Version / CUSTOMER_CHARGING Grant identities that were actually authorized and preserves them across later current-state changes
- **Shared root:** `commercial_activations`

### REP-F07-18 — complete R19 lineage ↔ R20 Boundary Decision

- **Source:** Phase-F F07-18 confirmed cross-surface defect
- **Consumers/owners:** REP-R19 and REP-R20
- **Dependency:** exact lineage representation must be stable before R20 can bind and certify the complete lineage/predicate identity it evaluated
- **Acceptance:** R20 Boundary Decision references the complete exact R19 Commercial Authority Lineage Reference, not a partial/current/default neighbor
- **Governance consequence:** any new predicate/registry representation created here must flow into the Candidate Consequential Surface Inventory and later MCAS-5/J remediation

These rows make explicit the dependency paths that the base draft currently leaves implicit.

## 4. Correction R5-03 — expand the known `commercial_activations` shared-root lock to R15

The base draft currently names R17 and R19 as the canonical `commercial_activations` shared-root example.

Expand the known dependency set to include R15 because `payment_provider_events.activationId` references `commercial_activations`.

Therefore PAIM-C handling of the `commercial_activations` physical root must enumerate at least:

- R17 Offer/Grant normative/evidence consumers;
- R19 Commercial Authority Lineage normative/evidence consumers;
- R15 payment-provider-event / financial-truth evidence consumers that depend on `activationId` resolution.

Execution rule:

If any amendment-bearing node places `commercial_activations` in the unstable interval from `AMENDMENT_APPLIED` through `POST_AMENDMENT_BCT_PASSED`, every active node consuming that root directly or through `payment_provider_events.activationId` must enter:

`BLOCKED_PENDING_SHARED_ROOT_STABILITY`

This includes applicable financial-truth/F07-16/F07-17 work.

The lock is transitive through evidence references, not limited to tables that are directly edited by the active node.

## 5. Correction R5-04 — add F02-02 as a separate Boundary Registry representation node

The base draft improperly leaves the Phase-F Boundary Registry representation problem implicit inside REP-R20 / GOV-J-F02.

F02-02 is distinct from both:

- RET-R20, which concerns retention/addressability of historical R20 authority records; and
- J-F02, which concerns durable registration/re-registration enforcement before merge/release.

### REP-F02-02 — canonical/equivalent Boundary Registry representation

- **Source:** Phase-F F02-02 unresolved Boundary Registry representation question
- **Object type:** Phase-F unresolved representability item
- **Question:** does an equivalent canonical registry representation already exist, and if not, what governed canonical representation must be introduced?
- **Dependencies:** stable R20 consequence/predicate semantics, including any applicable output from RD-C-R5-R20 and other R20 semantic remediation
- **Downstream:** `GOV-J-F02` depends on this representation or a proven equivalent before registration/re-registration enforcement can be considered complete
- **Not equivalent to:** RET-R20
- **Not itself sufficient for:** J-F02 closure; existence/representability of the registry and enforcement of registration are separate requirements
- **Closure:** prove an equivalent authoritative registry representation or introduce one, then pass Phase-F representability/recheck and applicable BCT/graph/governance-surface controls

Update `GOV-J-F02` dependency set to include:

`REP-F02-02 → GOV-J-F02`

## 6. Coverage-status correction

The next register revision must state the Phase-C standing remediation set as at least:

1. `R17 → R18` — `MISSING_REQUIRED_COMPOSITION`
2. `R5 → R20` — `MISSING_REQUIRED_COMPOSITION`
3. `R19 → R14` — `MISSING_REQUIRED_COMPOSITION`
4. `R19 → R18` — `MISSING_REQUIRED_COMPOSITION`
5. `R11 → R8` / C21-03 — `UNRESOLVED_CROSS_NODE_GAP`

C21-03 must retain its distinct classification and must not be silently normalized into `MISSING_REQUIRED_COMPOSITION`.

## 7. Round-5 status

The concrete register remains incomplete by design. The following attacks still require the fully enumerated register rather than abstract reasoning:

- complete finding-to-node coverage;
- many-to-many ownership reconciliation;
- duplicate-remediation detection;
- full Phase-F 29 confirmed + 7 unresolved mapping;
- full Phase-H 57-row blocking/nonblocking mapping;
- full Phase-I nine-item naming/exactness mapping;
- J-F01–J-F06 final mapping against actual governance nodes;
- exact Phase-D/E/F/G/H/I/J certification invalidation manifests.

The next review target is therefore the base register plus this correction overlay, with priority on constructing the full row-level inventory rather than further abstract control-plane changes.

## 8. Current disposition

`ROUND-5 REGISTER CORRECTIONS ACCEPTED / FIFTH PHASE-C NODE C21-03 ADDED AS DISTINCT UNRESOLVED-TRANSITION WORK / F07-04 + F07-08 + F07-18 SEEDED / COMMERCIAL_ACTIVATIONS SHARED-ROOT LOCK EXPANDED TO R15 EVIDENCE DEPENDENCY / F02-02 ADDED AS DISTINCT BOUNDARY-REGISTRY REPRESENTATION NODE / REGISTER COMPLETENESS RECONCILIATION CONTINUES / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
