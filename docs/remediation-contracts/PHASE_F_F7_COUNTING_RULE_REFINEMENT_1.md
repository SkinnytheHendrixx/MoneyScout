# Phase F F7 Counting Rule — Refinement 1

**Status:** GOVERNING REFINEMENT / ACTIVE FOR REMAINING F7 BATCHES  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Implementation authority:** SUSPENDED

## 1. Purpose

This refinement formalizes the anti-double-counting rule established in F7 Batch 01 and sharpened during F7 Batch 02 adversarial review.

F7 exists to certify exact persisted composition between independently multiplicative authority/history surfaces. It must not simply renumber endpoint defects.

## 2. Governing test

A candidate relationship earns its own F7 finding only when a well-intentioned independent fix to each endpoint could still leave the exact cross-reference, membership, or pairing wrong.

Apply the following tests in order.

### Test A — endpoint-complete counterfactual

Assume endpoint A and endpoint B are each remediated correctly according to their own certified finding scopes.

Ask:

> Can A and B still be paired to the wrong historical instance through current/latest lookup, shared parent scope, query order, provider/account similarity, Asset/Build identity, or another independent wiring mechanism?

- **YES:** an independent F7 acceptance invariant may exist.
- **NO:** do not separately count the relationship.

### Test B — constitutive purpose versus composite ingredient

Distinguish two cases.

**Constitutive-purpose relationship:** the relationship is the endpoint finding's entire defining purpose. If the relationship is wrong, the endpoint has not actually been fixed.

Examples already adjudicated:

- F06-02: execution ↔ exact R18 binding. This is the entire content of `EXECUTION_CAPABILITY_BINDING_ATTACHMENT`; draft F07-02 was withdrawn as duplicate.
- F05-03: CUSTOMER_CHARGING Grant ↔ exact Offer Version. A compliant Grant is, by definition, an execution grant bound to one exact Offer Version. A separate F7 count would duplicate F05-03.

**Composite-ingredient relationship:** the relationship is one field or dimension among several inside a broader composite object. The composite object may otherwise be implemented correctly while this one embedded identity is populated from the wrong current/historical object.

Such relationships can earn independent F7 findings.

### Test C — multiplicity/set structure

Even where a scalar endpoint attachment finding exists, an independent F7 finding may still be required if the actual governing relationship is one-to-many or many-to-many.

Positive control: F07-06 survives F06-02 because a scalar `bindingId` could satisfy one-binding attachment while still being incapable of representing multiple simultaneous bindings for one execution and preventing cross-execution set mixing.

## 3. Phase-C empirical precedent for composite ingredients

This corpus already contains direct adjudicated examples proving that one valid composite object is not enough to guarantee every embedded historical identity is wired consistently.

### C11-01 — R4 → R19

`docs/remediation-contracts/PHASE_C_BATCH_11.md`  
Blob: `4cc5c1b06ac2e2578f8904872b8beb7f81cedb2f`

R19 owns a complete Commercial Authority Lineage Reference, yet Phase C still required an explicit equality fixture proving the direct R4 Evaluation Cycle and the Evaluation Cycle independently embedded in downstream authority segments agree.

### C12-02 — R9 → R19

`docs/remediation-contracts/PHASE_C_BATCH_12.md`  
Blob: `f30b66a82dadfc6cc3e6cf17b850b2fcbf7e10b5`

Phase C required a dedicated fixture rejecting `S1 + P2` where the R19 R9 source field and R10 artifact field were individually valid but did not belong to the same historical source→artifact path.

### C13-03 — R10 → R19

`docs/remediation-contracts/PHASE_C_BATCH_13.md`  
Blob: `669f2feeec1e649510cf000294f643843fd9fc04`

Phase C required explicit consistency between R19's direct R10 artifact segment and the R10 artifact identity independently embedded inside the R17 Offer segment.

These precedents establish the governing principle:

> A composite object may be semantically complete in field inventory while still requiring independent equality/reference checks for each embedded historical dimension.

Therefore a relationship that is one ingredient inside a larger composite may earn an F7 finding even when the endpoint contract already lists that ingredient.

## 4. Classification discipline

A surviving F7 finding is classified:

`REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`

when current repository evidence affirmatively shows the exact reference capacity is absent or incapable of the required pairing.

Use `REPRESENTABILITY_UNRESOLVED` only when the relationship may exist but evidence is insufficient to determine its real persisted identity/cardinality/reference behavior.

Endpoint absence does not automatically force UNRESOLVED when the relevant reference capacity has already been exhaustively shown absent.

## 5. Counting versus testing

Withdrawing a duplicate F7 finding does **not** remove its scenario from later mixed-history testing.

Duplicate relationships remain exercised under their governing endpoint finding inside compound attacks. They are simply not counted twice.

Likewise, a compound mixed-history attack that jointly exercises already-counted relationships does not receive another finding number merely because it combines them.

## 6. Required documentation for each remaining F7 candidate

Every candidate must state:

1. endpoint A and endpoint B;
2. required A1↔B1 / A2↔B2 or set-membership fixture;
3. whether the relationship is constitutive purpose or composite ingredient;
4. the endpoint-complete counterfactual;
5. any independent current/latest/shared-parent/query-order cross-wire mechanism;
6. arbitrary-N/restart-replay requirement;
7. whether it survives as an F7 finding, is withdrawn as duplicate, or remains unresolved;
8. the existing endpoint findings that remain root-cause remediation scope.

## 7. Governance

This refinement governs all F7 batches after Batch 01 and must be applied retroactively when a later review reveals that an earlier F7 candidate was double-counted.

It does not amend endpoint semantics. It governs Phase-F representability finding calibration only.

Implementation authority remains **SUSPENDED**.