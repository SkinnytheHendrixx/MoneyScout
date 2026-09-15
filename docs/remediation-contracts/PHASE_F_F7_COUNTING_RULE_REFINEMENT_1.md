# Phase F F7 Counting Rule — Refinement 1

**Status:** GOVERNING REFINEMENT / ACTIVE FOR REMAINING F7 BATCHES  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Implementation authority:** SUSPENDED

## 1. Purpose

This refinement formalizes the anti-double-counting rule established in F7 Batch 01 and sharpened through Batches 02–04.

F7 exists to certify exact persisted composition between independently multiplicative authority/history surfaces. It must not simply renumber endpoint defects.

## 2. Governing tests

A candidate relationship earns its own F7 finding only when a well-intentioned independent fix to each endpoint could still leave the exact cross-reference, membership, retrieval, or pairing wrong.

Apply the following tests in order.

### Test A — endpoint-complete counterfactual

Assume endpoint A and endpoint B are each remediated correctly according to their own certified finding scopes.

Ask whether A and B can still be paired to the wrong historical instance through current/latest lookup, shared parent scope, query order, provider/account similarity, Asset/Build identity, or another independent wiring mechanism.

- **YES:** an independent F7 acceptance invariant may exist.
- **NO:** do not separately count the relationship.

### Test B — constitutive purpose versus composite ingredient

**Constitutive-purpose relationship:** the relationship is the endpoint finding's entire defining purpose. If the relationship is wrong, the endpoint has not actually been fixed.

Adjudicated negative controls:

- F06-02: execution ↔ exact R18 binding;
- F05-03: CUSTOMER_CHARGING Grant ↔ exact Offer Version;
- F04-02: exact QA-bound Artifact ↔ exact Release execution.

**Composite-ingredient relationship:** the relationship is one field or dimension among several inside a broader composite object. The composite object may otherwise be implemented correctly while this embedded identity is populated from the wrong historical object.

Such relationships can earn independent F7 findings.

### Test C — multiplicity/set structure

Even where a scalar endpoint attachment finding exists, an independent F7 finding may still be required if the governing relationship is one-to-many or many-to-many.

Positive control: F07-06 survives F06-02 because a scalar `bindingId` can satisfy one-binding attachment while still failing multiple simultaneous bindings and cross-execution set isolation.

### Test D — necessary precondition versus sufficient precondition

Endpoint-audit language that a downstream insufficiency is a `consequence`, `downstream consequence`, `acceptance consequence`, or equivalent establishes only that an upstream object is a **necessary precondition** unless the record also proves it is a **sufficient precondition** automatically guaranteeing exact downstream wiring.

Only sufficiency defeats an F7 count.

Therefore wording such as “Asset adoption is an acceptance consequence of the missing Artifact Version object” means Artifact Version identity must exist before adoption can be correct. It does not prove a future Asset/adoption record cannot still point to the wrong Artifact Version through current/latest or shared-parent lookup.

### Test E — computation versus retrieval/binding separability

Some endpoint contracts combine two responsibilities that must be tested separately:

1. **computation/interpretation correctness** — given a specified exact input set, process it correctly under the governing policy; and
2. **retrieval/binding correctness** — identify and durably bind the exact input members that belong in that set at the governing boundary.

A relationship may earn an independent F7 finding when the endpoint's computation can be correct for the set it was given while the retrieval/binding step can independently select an incomplete, stale, wrong, or cross-wired set.

The governing question is:

> Could endpoint B produce a valid, deterministic result for input set S while the system independently selected S incorrectly from endpoint-A history?

- **YES:** retrieval/set-membership is independently testable and may earn an F7 finding.
- **NO:** if exact input membership is inseparable from the endpoint's entire defining purpose, do not double-count it.

Positive control established in F7 Batch 04: R16 can deterministically reconcile a supplied R15 evidence set under a versioned policy while the selected evidence set is already stale/incomplete relative to durable R15 observations. Compound-02 E2-11 and evidence-set/version/cutoff provenance demonstrate that computation correctness and evidence retrieval/binding correctness are separable.

Test E does not imply every query boundary is a new finding. It applies only when the endpoint contract and evidence show a real independently variable set-membership/retrieval boundary with historical identity consequences.

## 3. Phase-C empirical precedent for composite ingredients

This corpus already contains adjudicated examples proving that one valid composite object is not enough to guarantee every embedded historical identity is wired consistently.

### C11-01 — R4 → R19

`docs/remediation-contracts/PHASE_C_BATCH_11.md`  
Blob: `4cc5c1b06ac2e2578f8904872b8beb7f81cedb2f`

R19 owns a complete Commercial Authority Lineage Reference, yet Phase C still required an equality fixture proving the direct R4 Evaluation Cycle and the Evaluation Cycle independently embedded in downstream authority segments agree.

### C12-02 — R9 → R19

`docs/remediation-contracts/PHASE_C_BATCH_12.md`  
Blob: `f30b66a82dadfc6cc3e6cf17b850b2fcbf7e10b5`

Phase C required rejecting `S1 + P2` where the R19 R9 source field and R10 artifact field were individually valid but did not belong to the same historical source→artifact path.

### C13-03 — R10 → R19

`docs/remediation-contracts/PHASE_C_BATCH_13.md`  
Blob: `669f2feeec1e649510cf000294f643843fd9fc04`

Phase C required explicit consistency between R19's direct R10 artifact segment and the R10 artifact identity independently embedded inside the R17 Offer segment.

These establish:

> A composite object may be semantically complete in field inventory while still requiring independent equality/reference checks for each embedded historical dimension.

## 4. Classification discipline

A surviving F7 finding is classified:

`REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`

when current repository evidence affirmatively shows the exact reference capacity is absent or incapable of the required pairing.

Use `REPRESENTABILITY_UNRESOLVED` only when the relationship may exist but evidence is insufficient to determine real persisted identity/cardinality/reference behavior.

Endpoint absence does not automatically force UNRESOLVED when the relevant reference capacity has already been shown absent.

## 5. Counting versus testing

Withdrawing a duplicate F7 finding does **not** remove its scenario from later mixed-history testing. Duplicate relationships remain exercised under their governing endpoint finding inside compound attacks; they are simply not counted twice.

Likewise, a compound mixed-history attack jointly exercising already-counted relationships does not receive another finding number merely because it combines them.

## 6. Required documentation for each remaining F7 candidate

Every candidate must state:

1. endpoint A and endpoint B;
2. required A1↔B1 / A2↔B2 or set-membership fixture;
3. whether the relationship is constitutive purpose or composite ingredient;
4. endpoint-complete counterfactual;
5. whether earlier `consequence` language establishes only necessity or true sufficiency;
6. whether computation correctness and retrieval/binding correctness are separable under Test E;
7. any independent current/latest/shared-parent/query-order/set-membership cross-wire mechanism;
8. arbitrary-N/restart-replay requirement;
9. whether it survives, is withdrawn as duplicate, or remains unresolved;
10. existing endpoint findings that remain root-cause remediation scope.

## 7. Governance

This refinement governs all F7 batches after Batch 01 and applies retroactively when later review reveals an earlier candidate was double-counted or wrongly excluded under Tests A–E.

The Test-D retroactive check already confirmed that Batch-01 F07-02 and Batch-02 Offer↔Grant withdrawals remain valid because both were grounded in Test-B constitutive-purpose reasoning.

This refinement does not amend endpoint semantics. It governs Phase-F representability finding calibration only.

Implementation authority remains **SUSPENDED**.