# Phase F F7 Batch 01 — R18-Anchored Cross-Surface Reference Integrity Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / F7 BATCH 01 CERTIFIED  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R18-anchored capability-binding relationships  
**Implementation authority:** SUSPENDED

## 1. Final result

F7 Batch 01 **FAILS / OPEN**.

Confirmed relationship-level findings:

1. **F07-01 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R6 Verification Result ↔ R18 Capability Binding.
2. **F07-03 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R18 Binding/Validation ↔ R20 Boundary Decision.
3. **F07-04 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R17 Offer/Grant ↔ R18 commercial-payment Binding.
4. **F07-05 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R18 exact Binding ↔ R19 Commercial Authority Lineage Reference.
5. **F07-06 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — one exact execution requiring multiple exact R18 bindings.

**F07-02 is withdrawn as a duplicate classification, not retained as a sixth F7 finding.** Its draft formulation — execution attempt ↔ exact R18 Capability Binding — is identical in substance to already-certified F06-02, `EXECUTION_CAPABILITY_BINDING_ATTACHMENT`. No additional cross-surface wiring mechanism exists beyond the endpoint defect itself.

The adversarial review established the governing counting rule used by this certification:

> A relationship earns its own F7 finding only when a well-intentioned independent fix to each endpoint could still leave the exact cross-reference or set-membership wiring wrong. If fixing the endpoint defect necessarily fixes the alleged relationship because they are definitionally the same invariant, F7 must not count it again.

This rule removes F07-02 while preserving F07-01/03/04/05/06.

## 2. Governing evidence

### F7 method

`docs/remediation-contracts/PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`  
Blob: `689d012b7c663d7916dd748ebea69005992a5917`

Refinement 1 requires persisted A1↔B1 / A2↔B2 exact pairings, no cross-wire through current/latest/shared-parent heuristics, deterministic replay, and arbitrary-N extension.

### Certified endpoint evidence

- R18 certification: `PHASE_F_BATCH_06_R18_REPRESENTABILITY_CERTIFICATION.md`, blob `aeb309d21e00b7fe47b92c76fe2891a901481370`.
- R20 certification: `PHASE_F_BATCH_02_R20_REPRESENTABILITY_CERTIFICATION.md`, blob `125d8b8f38da416464e263ca5ddb6a55f073c83b`.
- R17 certification: `PHASE_F_BATCH_05_R17_REPRESENTABILITY_CERTIFICATION.md`, blob `18c1c8579fe4aa9e576dea254e5e961f2b33f2e3`.
- R19 certification: `PHASE_F_BATCH_01_R19_REPRESENTABILITY_CERTIFICATION.md`, blob `00560fa2e9813d662df94f86d3f510b3a49b4461`.
- Phase-E Compound 04: `PHASE_E_COMPOUND_04_CERTIFICATION.md`, blob `30a8eedffbe91c680f0897f1e4b18aaf1a5eebff`.

### Live implementation evidence carried from Batch 06

- `lib/db/src/schema/human-actions.ts` — blob `00d07e90fcfe676c296c75c4019d337f4f3f6d08`.
- `lib/db/src/runtime-migrations.ts` — blob `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`.
- `artifacts/api-server/src/lib/human-gates.ts` — blob `2e8386b4784a95668db360be978933821529c871`.
- `lib/db/src/schema/factory.ts` — blob `0e4914790e071e840371a80ba42aa23e305108a2`.
- `artifacts/api-server/src/lib/builder-gateway.ts` — blob `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`.

Confirmed relevant facts include one mutable capability row per logical key, overwrite-upsert behavior, boolean current usability, no execution-level exact binding/account/R6-result identity, and provider-string Builder persistence.

## 3. Adjudication rule — when F7 is independent

F7 is not a second count of every endpoint deficiency. The remove-one-fix test is applied at relationship level:

- if endpoint A can be fixed correctly and endpoint B can be fixed correctly yet the persisted A↔B reference may still select the wrong exact instance, F7 remains independently necessary;
- if the alleged A↔B relation is literally the endpoint defect's own definition, and fixing that endpoint necessarily establishes the relation, no separate F7 finding is earned;
- one-to-many/set-membership constraints can remain independently necessary even when a scalar endpoint attachment defect is fixed.

This rule governs this and later F7 batches.

## 4. F07-01 — R6 Verification Result ↔ R18 Capability Binding

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `VR1` = capability K / Provider A / Account A1 / policy V1.
- `VR2` = capability K / Provider B / Account B1 / policy V2.
- `B1 → VR1`.
- `B2 → VR2`.

Both pairs must coexist. `B1` must not resolve to `VR2`, and `B2` must not resolve to `VR1`, merely because the same logical capability key or provider family matches.

### Why this survives endpoint remediation

Even if R6 eventually persists perfect verification-result objects and R18 eventually persists perfect binding objects, the composition can still be wrong if R18 stores or resolves only the current verification associated with logical capability K rather than the exact `verificationResultId` frozen at bind time.

Therefore the exact cross-reference is an independent F7 acceptance invariant.

The present R18-consumed persistence contains no canonical verification-result ID/policy-version binding and current capability lookup is keyed by logical capability/current state. This is confirmed absence of reference capacity, not merely missing evidence.

## 5. F07-02 — withdrawn as duplicate of F06-02

**Draft classification:** execution attempt ↔ exact R18 Capability Binding.  
**Final adjudication:** WITHDRAWN / DUPLICATE OF F06-02.

F06-02 already states and proves that consequential executions do not bind one exact immutable capability authority. Its concrete failure scenario is the same execution/provider/account substitution scenario used by draft F07-02.

Remove-one-fix test:

- if F06-02 is fully fixed, the execution has the exact immutable binding required by F07-02;
- there is no additional third reference object, separate association table, current/latest lookup rule, or pairing mechanism left to certify beyond F06-02's own remediation scope.

Therefore retaining F07-02 would inflate the finding count without adding an independent cross-surface invariant.

F06-02 remains fully in force and will still be exercised by later mixed-history/F7 acceptance tests where relevant.

## 6. F07-03 — R18 Binding/Validation ↔ R20 Boundary Decision

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `X1/B1/RV1 ↔ D1`.
- `X2/B2/RV2 ↔ D2`.

`D1` must never consume `RV2/B2`, and `D2` must never consume `RV1/B1`, even when operation class, Asset, provider, or capability key matches.

### Independent wiring risk

A future valid R18 binding/validation model and future valid R20 decision model could both exist while R20 still references a current/latest validation or a validation selected by superficial scope rather than the exact predicate result actually evaluated.

Thus endpoint correctness does not automatically prove composition correctness.

Current certifications affirmatively establish that neither exact endpoint/reference path exists today, so DEFECT is earned rather than UNRESOLVED. After remediation this relationship must still be re-tested independently.

## 7. F07-04 — R17 Offer/Grant ↔ R18 commercial-payment Binding

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `O1/G1 ↔ B1 = Provider P / Account A1`.
- `O2/G2 ↔ B2 = Provider P / Account A2`.

Both commercial authorities must coexist historically. O1/G1 may not silently execute through B2, and O2/G2 may not inherit B1 because Asset/provider/logical capability matches.

### Independent wiring risk

A corrected immutable Offer/Grant model and a corrected immutable R18 binding model could still be incorrectly joined through current merchant capability/account state. Correct endpoints alone do not prove exact Offer/Grant↔Binding identity.

Batch 05's Asset-level charging-authority laundering risk and Batch 06's current capability/account replacement risk make the cross-wire concrete.

## 8. F07-05 — R18 exact Binding ↔ R19 Commercial Authority Lineage Reference

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- commercial execution E1 consumed B1 and belongs to lineage L1;
- commercial execution E2 consumed B2 and belongs to lineage L2;
- persist `B1↔L1` and `B2↔L2` simultaneously;
- lineage must not reconstruct provider/account authority from current capability state or attach B1 to L2.

### Independent wiring risk

A future correct R18 binding table and correct R19 lineage table could still be joined by provider string/current account/Asset association instead of the exact binding consumed by the exact execution.

Therefore this relationship remains a separate F7 acceptance obligation after endpoint remediation.

## 9. F07-06 — one exact execution requiring multiple R18 bindings

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N/set fixture

- `X1` requires `{B1a, B1b}`.
- `X2` requires `{B2a, B2b}`.
- each binding has its own exact R6 ancestry.

The persistence model must prove complete set membership for each execution and reject mixed sets such as `{B1a, B2b}`.

### Why this is stronger than F06-02

The simplest valid fix to F06-02 could be a single scalar `bindingId` on an execution. That would establish one exact binding and satisfy F06-02's single-binding attachment requirement while still being structurally incapable of representing an execution that legitimately requires multiple simultaneous bindings.

F07-06 therefore adds a genuine one-to-many/many-to-many set-integrity requirement:

- arbitrary-N bindings for one execution;
- each binding independently traceable to its own R6/R18 authority chain;
- no cross-execution mixing;
- deterministic restart/replay of complete set membership.

This is independently necessary.

## 10. DEFECT vs UNRESOLVED adjudication

The five surviving findings are DEFECTs, not UNRESOLVED.

Refinement 1 reserves UNRESOLVED for evidence gaps or insufficiently established representation. Here, six independently audited Phase-F surfaces plus direct live schema/runtime traces affirmatively establish that the required exact reference paths do not currently exist.

The classification does not depend on assuming R6 itself is fully or incompletely implemented. For F07-01, the R18-consumed side lacks the exact `verificationResultId`/policy identity needed to preserve the relation even if R6 were otherwise perfect.

Therefore the inability is demonstrated, not merely unlocated.

## 11. Retention question 9

No duplicate per-relationship retention findings are opened in this cluster.

Endpoint certifications already carry unresolved historical-retention findings for R18, R17, R19, and R20. Those remain governing open issues.

F7 adds the acceptance requirement that remediation must preserve the exact relationship edges themselves through archive/delete behavior for the required historical period:

- VR↔Binding;
- Binding/Validation↔Decision;
- Offer/Grant↔Binding;
- Binding↔Lineage;
- execution↔multi-binding set membership.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried to final Phase-F synthesis rather than multiplied into five new findings.

## 12. Mixed-history carry-forward

The final F7 cross-cluster pass must include at least:

- `VR1 → B1 → X1 → D1 → L1`;
- `VR2 → B2 → X2 → D2 → L2`;
- where commercial: `O1/G1 → B1 → L1/D1` and `O2/G2 → B2 → L2/D2`.

It must attempt cross-wire through shared logical capability key, provider, account family, Asset, operation class, Build, current/latest pointers, and query-order selection.

The withdrawn F07-02 is still implicitly exercised inside these composite attacks through F06-02; it is simply not double-counted as an independent F7 classification.

## 13. Final adjudication

**F7 Batch 01 result: FAIL / OPEN.**

Confirmed F7 findings:

- F07-01 — R6 Verification Result ↔ R18 Binding — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- F07-03 — R18 Binding/Validation ↔ R20 Decision — same subtype;
- F07-04 — R17 Offer/Grant ↔ R18 commercial-payment Binding — same subtype;
- F07-05 — R18 Binding ↔ R19 Lineage — same subtype;
- F07-06 — multi-binding set membership for one exact execution — same subtype.

Withdrawn:

- F07-02 — execution attempt ↔ exact R18 Binding — duplicate of F06-02; no separate F7 finding retained.

No new semantic MRC or semantic unresolved cross-node gap is created.

Phase F remains OPEN. Additional F7 relationship clusters, the final mixed-history pass, and Phase-F synthesis/closure disposition remain outstanding.

Implementation authority remains **SUSPENDED**.