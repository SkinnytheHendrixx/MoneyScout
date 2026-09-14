# Phase F F7 Batch 01 — R18-Anchored Cross-Surface Reference Integrity Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R18-anchored capability-binding relationships  
**Implementation authority:** SUSPENDED

## 1. Governing method

Phase-F Refinement 1 requires F7 to classify the relationship itself whenever two independently multiplicative authority/history surfaces must preserve exact pairings.

This batch does not merely ask whether each endpoint can exist. For every relationship below it asks whether the current persisted model can represent at least:

- A1, A2 on side A;
- B1, B2 on side B;
- intended simultaneous pairs A1↔B1 and A2↔B2;
- no silent A1↔B2 / A2↔B1 cross-wire due to logical capability key, provider string, current/latest state, shared Asset, shared execution, or query-order heuristics;
- deterministic reconstruction after restart/replay;
- arbitrary-N extension without one-current-child assumptions.

F7 uses the Phase-F taxonomy. A failed relationship is classified:

`REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`.

A relationship-level F7 defect is not automatically a new independent root-cause count. Where endpoint defects already explain why the relationship cannot exist, F7 records the mandatory cross-surface acceptance obligation that must be re-tested after endpoint remediation.

## 2. Pinned evidence basis

### Governing F7 refinement

`docs/remediation-contracts/PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`  
Blob: `689d012b7c663d7916dd748ebea69005992a5917`

### R18 certification

`docs/remediation-contracts/PHASE_F_BATCH_06_R18_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `aeb309d21e00b7fe47b92c76fe2891a901481370`

Confirmed relevant facts:

- capability authority collapses to one mutable row per logical key;
- consequential executions have no exact immutable R18 binding attachment;
- operation-specific validation identity is absent as a downstream consequence;
- capability lifecycle semantics are incomplete at the DB level;
- Builder attempts store provider string rather than exact binding/account identity.

### R20 certification

`docs/remediation-contracts/PHASE_F_BATCH_02_R20_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `125d8b8f38da416464e263ca5ddb6a55f073c83b`

Confirmed relevant fact: no canonical durable R20 Boundary Decision object exists that can bind exact predicate/authority identities; closest release proxy is one row per Build with scalar authorization state.

### R17 certification

`docs/remediation-contracts/PHASE_F_BATCH_05_R17_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `18c1c8579fe4aa9e576dea254e5e961f2b33f2e3`

Confirmed relevant facts:

- no canonical immutable Offer Version;
- one commercial activation per Asset blocks O1/O2 coexistence;
- no immutable exact-offer CUSTOMER_CHARGING Grant;
- exact provider-account authority is not frozen into charging authority.

### R19 certification

`docs/remediation-contracts/PHASE_F_BATCH_01_R19_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `00560fa2e9813d662df94f86d3f510b3a49b4461`

Confirmed relevant facts:

- no canonical Commercial Authority Lineage Reference object;
- one commercial activation per Asset blocks arbitrary-N complete commercial lineages;
- provider/account/execution/Offer/Grant lineage cannot currently be frozen as one exact traversable object.

### Phase-E Compound 04

`docs/remediation-contracts/PHASE_E_COMPOUND_04_CERTIFICATION.md`  
Blob: `30a8eedffbe91c680f0897f1e4b18aaf1a5eebff`

Specification-level affirmative control requires exact chain:

`R6 Verification Result VR1 → R18 Binding B1 → R18 operation-specific validation RV1 → R20 boundary decision for exact execution X / operation O1`.

A currently-ready B2 cannot substitute for B1. For executions requiring multiple bindings, each binding must trace to the same exact execution and its own R6/R18 chain.

### Live schema/runtime evidence already pinned by Batch 06

- `lib/db/src/schema/human-actions.ts` — blob `00d07e90fcfe676c296c75c4019d337f4f3f6d08`
- `lib/db/src/runtime-migrations.ts` — blob `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`
- `artifacts/api-server/src/lib/human-gates.ts` — blob `2e8386b4784a95668db360be978933821529c871`
- `lib/db/src/schema/factory.ts` — blob `0e4914790e071e840371a80ba42aa23e305108a2`
- `artifacts/api-server/src/lib/builder-gateway.ts` — blob `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

Current facts include `UNIQUE(capabilities.key)`, current-state upsert overwrite, boolean `hasCapability()`, Builder provider-string persistence, and no execution-level binding ID/account/R6-result identity.

## 3. F07-01 — R6 Verification Result ↔ R18 Capability Binding

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create legitimate verification results:

- `VR1` — capability K, Provider A / Account A1, policy V1;
- `VR2` — capability K, Provider B / Account B1, policy V2.

Create exact R18 bindings:

- `B1 → VR1`;
- `B2 → VR2`.

Persist both simultaneously and prove `B1` cannot resolve to `VR2`, and `B2` cannot resolve to `VR1`, merely because they share logical capability K or another provider-family attribute.

### Current representation failure

The current capability row stores verification method/timestamps/untyped metadata but no canonical `verificationResultId`, verification-policy version, immutable authority-version ID, or binding object. `setCapabilityAvailable()` replaces the row by logical key, and `hasCapability()` collapses the current row to boolean usability.

Therefore the required VR1↔B1 / VR2↔B2 pair graph cannot be persisted or deterministically replayed. Current logical key K is the only stable lookup dimension and is expressly insufficient under R18.

### Root-cause relationship

This F7 defect is explained primarily by F06-01/F06-02 and the current R6/current-capability representation. It remains an independent cross-surface acceptance fixture: fixing versioned capability history without an exact `verificationResultId` binding would not satisfy F07-01.

## 4. F07-02 — execution attempt ↔ exact R18 Capability Binding

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

For two legitimate execution attempts `X1`, `X2` under the same provider family:

- `X1 ↔ B1(A/A1/V1)`;
- `X2 ↔ B2(A/A2/V2)`.

Both attempts may coexist. Restart/replay must recover the same pairing even if current configured account changes.

### Current representation failure

`builder_gateway_runs` can represent multiple attempts but persists only provider/provider-run/thread execution identity, not `bindingId`, provider-account identity, verification-result ID, or policy/lifecycle version.

The worker resolves `configuredCodexBuilderDriver()` from current configuration and refreshes the current capability projection. Two provider-identical attempts can therefore consume different underlying account authority without the persisted run graph distinguishing them.

This is a direct N×N cross-wire vulnerability: provider equality is a superficial attribute, not exact authority identity.

## 5. F07-03 — R18 Binding/Validation ↔ R20 Boundary Decision

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

This is a mandatory Refinement-1 F7 relationship.

### Required N×N fixture

For two exact executions/operations:

- `X1/B1/RV1 ↔ D1`;
- `X2/B2/RV2 ↔ D2`.

Persist both simultaneously. `D1` must not consume `RV2/B2`; `D2` must not consume `RV1/B1`, even if operation class, provider, Asset, or capability key matches.

### Current representation failure

Neither endpoint currently exists as a canonical exact-reference object:

- Batch 06: no immutable R18 binding/validation identity on execution;
- Batch 02: no canonical R20 durable Boundary Decision object.

The current schema therefore has no persisted foreign/reference path capable of expressing the required exact pairings at all. This is stronger than an unproven association: the canonical reference graph is absent.

### Relationship-level acceptance requirement

After endpoint remediation, F07-03 still requires an explicit exact reference from each R20 decision/predicate result to the exact operation-specific R18 validation/binding consumed, with arbitrary-N coexistence and deterministic replay.

## 6. F07-04 — R17 Offer/Grant ↔ exact R18 commercial-payment Binding

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create:

- `O1/G1` bound to commercial-payment capability binding `B1 = Provider P / Account A1`;
- `O2/G2` bound to `B2 = Provider P / Account A2`.

Both commercial authorities may coexist historically. Prove O1/G1 cannot silently execute through B2 and O2/G2 cannot inherit B1 because the same Asset/provider/logical capability is shared.

### Current representation failure

Batch 05 established that Offer/Grant identity is absent and that merchant `accountId` exists only as current capability metadata rather than frozen historical charging authority. Batch 06 established that no immutable R18 execution binding exists and the current capability row is overwritten by logical key.

Thus the system cannot persist O1/G1↔B1 and O2/G2↔B2 as independently addressable pairings. The exact laundering risk appears on both sides: Asset-level charging authority can outlive O1, while current capability/account state can replace B1.

## 7. F07-05 — R18 exact Binding ↔ R19 Commercial Authority Lineage Reference

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

For two commercial executions:

- execution E1 consumed exact binding B1 and belongs to lineage L1;
- execution E2 consumed exact binding B2 and belongs to lineage L2.

Persist `B1↔L1` and `B2↔L2` simultaneously; prove lineage cannot reconstruct provider/account authority from current capability state or attach B1 to L2.

### Current representation failure

Batch 01 established that no canonical R19 Lineage Reference exists and one activation-per-Asset blocks arbitrary-N lineage. Batch 06 established that no exact R18 binding exists on executions.

There is therefore no canonical identity on either side through which an exact provider/account binding can be frozen into complete commercial lineage. Current provider/account metadata or activation association is not equivalent to a persisted exact B↔L reference.

## 8. F07-06 — one execution requiring multiple R18 bindings

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

This fixture is carried directly from Phase-E Compound 04's execution-specific multi-binding refinement.

### Required N×N fixture

Execution `X1` requires bindings `{B1a, B1b}` and execution `X2` requires `{B2a, B2b}`. Each binding has its own exact R6 chain.

The persisted model must prove:

- `X1 ↔ B1a` and `X1 ↔ B1b`;
- `X2 ↔ B2a` and `X2 ↔ B2b`;
- no mixed set `{B1a, B2b}` can satisfy either execution;
- restart/replay reconstructs the same set membership and exact R6 ancestry.

### Current representation failure

Current execution records contain no binding IDs at all. Current capability lookup is logical-key/current-state based. The model therefore cannot represent one-to-many exact execution↔binding membership, much less prevent cross-execution mixing for arbitrary N.

This is not just F06-02 restated: F06-02 proves one exact binding is absent from one execution. F07-06 adds the cross-surface/set-integrity requirement that multiple bindings must all belong to the same exact execution and remain independently traceable.

## 9. Cross-cluster mixed-history attack preview

The six defects above already expose the attack form the eventual final F7 pass must exercise across the full graph:

- `VR1 → B1 → X1 → D1 → L1`
- `VR2 → B2 → X2 → D2 → L2`

with commercial authority where applicable:

- `O1/G1 → B1 → L1/D1`
- `O2/G2 → B2 → L2/D2`

The final mixed-history pass must attempt every plausible cross-wire produced by shared provider, same capability key, same Asset, same operation class, current/latest pointers, same Build, or query-order selection.

This preview is not final F7 certification.

## 10. Retention question 9 — cluster disposition

Retention does not rescue any relationship above because the exact pair graph is already absent. Separately, all historical references created by remediation must remain durably addressable for the governing contract period.

Current endpoint certifications already carry unresolved retention findings for R18, R17, R19, and R20. Therefore this batch does not create six duplicate retention findings.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried from endpoint surfaces and to be synthesized at final Phase-F closure.

F7 acceptance after remediation must additionally prove parent deletion/archive cannot detach B↔VR, X↔B, B/RV↔D, Offer/Grant↔B, or B↔Lineage references while historical authority remains required.

## 11. Adversarial-review questions

The reviewer should independently challenge at minimum:

1. Is a relationship-level DEFECT earned when one or both canonical endpoints are already absent, or should any of F07-01/F07-03/F07-04/F07-05 be UNRESOLVED until endpoint remediation? Apply Refinement 1's distinction between affirmative inability and missing evidence.
2. Does F07-01 overreach current R6 implementation evidence, or is the absence of `verificationResultId`/policy identity in the exact R18-consumed persistence sufficient to establish the cross-surface failure?
3. Does Builder Gateway contain any hidden exact account/binding identity outside the fields audited in Batch 06 that would weaken F07-02?
4. Is F07-03 independently necessary after F06-02 and F02-01, or does F7 require it specifically because the relationship is mandatory even when both endpoints fail individually?
5. Does any existing Offer/commercial activation field canonically bind an exact R18 provider/account authority and weaken F07-04?
6. Does any existing R19 field/event canonically preserve the exact capability binding consumed by one execution and weaken F07-05?
7. Is F07-06 genuinely stronger than F06-02? Test the two-execution/two-bindings-per-execution fixture explicitly.
8. Do any of these findings double-count root causes in a way that would distort remediation tracking? If so, recommend root-cause vs acceptance-fixture wording without dropping mandatory F7 classification.
9. Are all six N×N fixtures capable of extension to arbitrary N without current/latest/query-order assumptions?
10. Does the retention handling correctly avoid duplicating endpoint unresolved findings while still carrying question 9 into F7 closure?

## 12. Provisional verdict

**F7 Batch 01 provisional result: FAIL / OPEN.**

Provisional cross-surface findings:

- F07-01 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY` — R6 Verification Result ↔ R18 Binding;
- F07-02 — same subtype — execution attempt ↔ exact R18 Binding;
- F07-03 — same subtype — R18 Binding/Validation ↔ R20 Decision;
- F07-04 — same subtype — R17 Offer/Grant ↔ R18 commercial-payment Binding;
- F07-05 — same subtype — R18 Binding ↔ R19 Lineage;
- F07-06 — same subtype — multi-binding set membership for one exact execution.

These are relationship-level failures/acceptance obligations. They do not, by themselves, create six new independent root-cause remediation projects beyond the already-certified endpoint defects.

No semantic MRC or semantic unresolved cross-node gap is created by this draft. Implementation authority remains **SUSPENDED**.
