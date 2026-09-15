# Phase F F7 Batch 04 — Remaining Phase-E Exact-Correspondence Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** Phase-E correspondence relationships not already certified in F7 Batches 01–03  
**Implementation authority:** SUSPENDED

## 1. Governing method

This batch is governed by:

- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`;
- `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`, including Tests A–D;
- F7 Batches 01–03 and their duplicate-withdrawal discipline.

The purpose is not to turn every Phase-E compound strengthening into a new F7 number. Only exact cross-object correspondences that can remain wrong after otherwise-correct endpoint remediation survive.

The batch therefore screens each candidate for:

1. endpoint-complete counterfactual;
2. constitutive purpose versus composite ingredient;
3. multiplicity/set structure;
4. necessary-precondition versus sufficient-precondition language;
5. actual current persisted exact-reference capacity;
6. arbitrary-N and restart/replay behavior.

## 2. Retroactive Test-D check

Before opening this batch, Test D was applied retroactively to the two earlier withdrawals most likely to be affected:

- Batch-01 draft F07-02, execution ↔ exact R18 Binding;
- Batch-02 Offer Version ↔ CUSTOMER_CHARGING Grant.

Both remain correctly withdrawn because their exclusions were based on Test B constitutive-purpose reasoning, not endpoint `consequence` wording. The clean retroactive result is recorded separately in `PHASE_F_F7_TEST_D_RETROACTIVE_CHECK_01.md`.

No prior F7 result is reopened by Test D.

## 3. Pinned Phase-E evidence basis

### Compound 01 — R1 × R2 × R7

`docs/remediation-contracts/PHASE_E_COMPOUND_01_CERTIFICATION.md`  
Blob: `420c942c8848cdc6f9207a9d37997b1a2e9ef9aa`

Key exact-correspondence strengthening:

> Every R7 Economic Action/reservation set whose admission semantics materially depend on an R2 Capability Resolution Outcome must durably bind the exact immutable R2 outcome/version and the exact reservation/resource vector derived from that outcome.

Q1↔RS1 must remain historical; materially different Q2 cannot silently inherit RS1.

### Compound 02 — R7 × R8 × R15 × R16

`docs/remediation-contracts/PHASE_E_COMPOUND_02_CERTIFICATION.md`  
Blob: `80bf29c6b5a5e93209838e238011b8287175e9f6`

Relevant exact-correspondence controls include:

- R16 release result must be current through the complete applicable durable R15 evidence set or governed watermark;
- R7 release is scoped to exact reservation-set members actually adjudicated;
- duplicate observations of one underlying provider event must not become duplicate economic effect;
- conjunctive release may require exact R8 execution truth plus exact R16 financial truth.

### Compound 03 — R12 × R13 × R7

`docs/remediation-contracts/PHASE_E_COMPOUND_03_CERTIFICATION.md`  
Blob: `ad00e3a69ad969a8593829bc4c552fede32a18e2`

Key exact-correspondence strengthening:

> In heterogeneous recovery, the R13 health evidence consumed for each exact R12 occurrence must trace to that occurrence's own expected executor/service path. A specific-but-wrong healthy executor record from the same batch cannot satisfy another occurrence.

### Compound 05 — R3 × R20

`docs/remediation-contracts/PHASE_E_COMPOUND_05_CERTIFICATION.md`  
Blob: `a90d73411b5a844ef5ae6bf78ac9ea04ac0a066b`

Key exact-correspondence strengthening:

> Every R3 freshness result consumed by R20 must bind exact evidence identity, exact decision-use proposition, exact freshness-policy identity/version, temporal basis, evaluation time, and result. R20 must verify that exact correspondence before consuming it.

### Compound 06 — R7 × R15 × R16

`docs/remediation-contracts/PHASE_E_COMPOUND_06_CERTIFICATION.md`  
Blob: `96287ef8099fb339fa607d63b1067cd96ab22f3f`

Key exact-correspondence strengthening:

> Before R7 consumes an R15/R16 result for settlement/release, it must explicitly verify equality between the exact R7 Economic Action/reservation/execution identity and the exact execution/provider/account identity carried by the R15 observations and R16 reconciliation.

A valid result for E2 cannot settle/release E1 merely because amount, unit, provider family, or other superficial attributes match.

## 4. Current persistence evidence relevant to the cluster

### Generic execution persistence

`lib/db/src/schema/execution.ts`  
Blob: `8003dcf68cedfd4ba0981030cdaf4f1d7aae603e`

`execution_jobs` persists generic opportunity/cycle/action/payload/status/idempotency/lease/result fields. It does not declare canonical fields for:

- exact R2 Capability Resolution Outcome/version;
- exact R7 reservation-set identity;
- exact R12 occurrence identity distinct from generic job identity;
- exact R13 executor-path health-result identity;
- exact R3 freshness-result/proposition/policy-version identity;
- exact R15/R16 financial reconciliation identity.

Generic JSON physical capacity is not an F7 PASS absent a declared invariant establishing the exact authority relationship.

### Asset/economic persistence

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

Current Asset persistence contains append-like observation/event surfaces and commercial/payment-adjacent state, but no checked canonical R7 Economic Action/reservation ↔ R15/R16 reconciliation foreign/reference graph satisfying Compound 06's exact execution/provider/account equality rule.

The current absence is supporting evidence; this batch still asks the adversarial reviewer to search for equivalent canonical objects elsewhere before finalizing.

## 5. F07-13 — exact R2 Capability Resolution Outcome ↔ R7 Economic Action/reservation set

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create:

- R2 outcomes `Q1`, `Q2` for the same higher-level action intent but materially different path/cost/dependency/resource semantics;
- R7 reservation/admission records `RS1`, `RS2`.

Persist:

- `Q1 ↔ RS1`;
- `Q2 ↔ RS2`.

Prove:

- Q2 cannot silently reuse RS1 because both refer to the same logical action/provider/product;
- Q1 history remains attributable to RS1 after Q2 exists;
- exact resource-vector identity remains part of the correspondence;
- restart/replay reconstructs the same pairings for arbitrary N.

### Counting-rule analysis

This relation is not the entire constitutive purpose of R2 or R7. R2 owns a broader resolution/adjudication object; R7 owns a broader Economic Action/reservation/admission object. Exact R2 outcome identity is one input dimension of R7 admission.

A correct R2 table and correct R7 reservation table could still be joined by current/latest resolution for the logical action rather than the exact outcome that justified RS1.

Compound 01 explicitly identified this as an exact-object correspondence gap. Therefore it survives as an independent F7 acceptance invariant.

### Current representation

No checked canonical execution/reservation persistence field binds exact R2 outcome/version to exact reservation-set identity/resource vector. Generic payload/result fields do not establish the invariant.

## 6. F07-14 — exact R12 occurrence ↔ exact R13 executor/service-path health result

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create recovered occurrences:

- O1 requires exact path X;
- O2 requires exact path Y.

Create health records:

- HX for X;
- HY for Y.

Persist:

- `O1 ↔ X/HX`;
- `O2 ↔ Y/HY`.

Prove:

- O2 cannot borrow HX because X is healthy, specific, in the same kernel, or in the same recovery batch;
- stale prior HX cannot authorize later O1 progression after X materially degrades;
- restart/replay preserves occurrence→path→health identity for arbitrary N.

### Counting-rule analysis

R12 occurrence existence and R13 health/liveness are separate endpoint purposes. Exact occurrence→path health is a composite wiring fact between them.

Even perfect occurrence records and perfect executor-health records can be joined incorrectly by batch index, executor class, generic kernel health, or query order. Compound 03 explicitly added the heterogeneous-batch exact-correspondence fixture for this reason.

Therefore F07-14 is independently countable.

### Current representation

The checked generic execution schema has no declared exact health-result/path reference on a durable occurrence record. The adversarial review should search runtime/health schemas and workers for a canonical equivalent before final adjudication.

## 7. F07-15 — exact R3 freshness result ↔ exact R20 Boundary Decision predicate

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create freshness results:

- FR1 = E1 / decision-use Q1 / policy P1 V1;
- FR2 = E1 or E2 / materially different Q2 and/or policy P2 V2.

Create boundary decisions:

- D1 requires exact Q1/P1/V1 and consumes FR1;
- D2 requires exact Q2/P2/V2 and consumes FR2.

Persist both and prove:

- D2 cannot consume FR1 merely because evidence family/object is similar;
- D1 remains historically attributable to FR1 after later policy/result versions exist;
- the read/commit path cannot silently switch to a different current freshness result;
- restart/replay reconstructs exact predicate-result identity.

### Counting-rule analysis

This survives Test B. R20's decision object has many predicate dimensions; R3 freshness is one embedded predicate identity. A future correct R3 result model and correct R20 decision model could still be joined through latest freshness for the evidence rather than the exact proposition/policy version actually evaluated.

Compound 05 explicitly created this exact correspondence requirement.

Batch 02 already established that no canonical R20 decision object exists today. Therefore the exact FR↔D reference path is affirmatively absent rather than merely unlocated on the R20 side.

## 8. F07-16 — exact R7 reservation/execution ↔ exact R15/R16 financial result

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create:

- E1/RS1 under provider/account A/A1;
- E2/RS2 under provider/account A/A2 or another materially distinct execution;
- R15/R16 financial result F1 for E1/A1;
- R15/R16 financial result F2 for E2/A2.

Persist:

- `E1/RS1 ↔ F1`;
- `E2/RS2 ↔ F2`.

Prove:

- F2 cannot settle/release E1 merely because amount, currency, provider family, timing, or resource class matches;
- a same-provider/different-account result cannot substitute where account identity is material;
- exact reservation-set member coverage remains explicit;
- restart/replay preserves exact E/RS↔F correspondence for arbitrary N.

### Counting-rule analysis

Compound 06 states this is a cross-object equality requirement between records created at different times by different processes. That is strong positive evidence for independent F7 status.

R7 has broader admission/reservation purpose; R15/R16 have broader financial-observation/reconciliation purposes. Exact equality between their independently populated execution/provider/account identities is one composition invariant, not the entirety of either endpoint's purpose.

A perfect reservation object and perfect financial result object could therefore still be joined incorrectly by amount/provider/current execution lookup.

### Current representation

No checked canonical persistence path binds exact R7 Economic Action/reservation-set identity to an exact R15/R16 reconciliation object with provider/account equality. The adversarial reviewer should search financial/reconciliation tables and workers for any canonical equivalent before final adjudication.

## 9. Candidate R15 Provider Financial Observation set ↔ R16 canonical reconciliation — HOLD FOR ADVERSARIAL COUNTING REVIEW

**Candidate status:** NOT YET NUMBERED.

Phase-E evidence clearly requires exact evidence-set membership/freshness:

- R16 result C1 must identify the evidence set/version/cutoff reconciled;
- later already-durable R15 evidence invalidates stale release consumption;
- duplicate observations of one underlying provider event must deduplicate semantic effect without collapsing distinct events;
- all genuinely required financial components must affect R16 completeness/status.

The unresolved counting question is whether exact R15 membership is:

1. **constitutive purpose of a correct R16 canonical reconciliation object**, in which case a separate F7 count would duplicate R16's own definition; or
2. **one independently wireable ingredient of a broader R16 composite**, in which case R16 could exist while selecting the wrong/latest evidence set and an F7 finding is warranted.

This must be resolved under Test B and Test A using the actual R16 recovered contract plus current persistence evidence before a finding number is assigned.

The final mixed-history attack must exercise this relation regardless of whether it is separately counted.

## 10. Phase-E controls intentionally not recounted

This batch does not create separate findings merely for:

- Compound-02 conjunctive R8+R16 release truth, unless an independent persisted set/membership relation beyond existing endpoint semantics is demonstrated;
- R7 exact reservation-member scoping by itself, where that is internal to the corrected R7 reservation model rather than a third cross-surface reference;
- R3 multi-evidence completeness inside one R3-owned proposition, which Compound 05 explicitly identifies as internal to R3 rather than R20 wiring;
- R16 multi-component completeness/status semantics, currently governed by C11-02/R16 rather than automatically treated as cross-surface wiring;
- compound attack combinations that simply exercise several already-counted pairings together.

These controls remain mandatory tests under their existing owners.

## 11. Retention question 9

No duplicate per-relationship retention findings are opened in this draft.

Any corrected correspondence must preserve the exact relationship edges for the governing historical period, including:

- Q↔reservation;
- occurrence↔path-health;
- freshness-result↔boundary-decision;
- reservation/execution↔financial result;
- R15 evidence-set↔R16 result regardless of separate counting disposition.

Retention disposition remains to be synthesized from governing endpoint policies and the already-open Phase-F retention register.

## 12. Adversarial-review questions

The reviewer should independently challenge at minimum:

1. Is F07-13 independent of R2/R7 endpoint semantics under Tests A/B, or is exact outcome↔reservation binding already constitutive of one endpoint finding not yet considered here?
2. Does any current table/object durably bind an exact R2 outcome/version to exact R7 Economic Action/reservation identity and derived vector?
3. Is F07-14 independent, or is exact occurrence→executor-path health already the entire purpose of an existing R12/R13 endpoint finding?
4. Search for a canonical occurrence-health association outside `execution_jobs`; does one materially weaken F07-14?
5. Is F07-15 independently necessary after R20 F02-01, or does a future correct R20 decision object necessarily bind exact R3 freshness by definition? Apply the composite-ingredient precedent from R19 carefully.
6. Does any current freshness-result object persist exact evidence + decision-use + policy-version identity sufficiently to weaken F07-15 on the R3 side?
7. Is F07-16 independent under the Compound-06 reasoning that R7 and R15/R16 records are created separately and require explicit equality?
8. Does any existing financial/reconciliation persistence already foreign-key/reference exact R7 Economic Action/reservation/execution plus provider/account strongly enough to weaken F07-16?
9. Should R15 evidence-set ↔ R16 reconciliation receive its own F7 finding, or is evidence-set identity constitutive of R16 canonical reconciliation? Apply Tests A/B and cite exact R16 contract language.
10. Are Compound-02 evidence-set freshness and duplicate-observation semantics best represented as one R15↔R16 relationship finding, separate fixture consequences, or endpoint-internal R16 requirements?
11. Does Test D reopen any Phase-E candidate previously dismissed as merely a `consequence` of a missing endpoint object?
12. Do all surviving fixtures extend to arbitrary N and deterministic restart/replay without latest/current/query-order assumptions?
13. Is retention handling consistent with prior F7 batches?
14. Independent scan: identify any remaining Phase-E exact correspondence not already covered by F7 Batches 01–04 or deliberately assigned to an endpoint-internal owner.

## 13. Provisional verdict

**F7 Batch 04 provisional result: FAIL / OPEN.**

Provisional F7 findings:

- **F07-13** — exact R2 Capability Resolution Outcome ↔ R7 Economic Action/reservation set — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- **F07-14** — exact R12 occurrence ↔ exact R13 executor/service-path health result — same subtype;
- **F07-15** — exact R3 freshness result ↔ exact R20 Boundary Decision predicate — same subtype;
- **F07-16** — exact R7 reservation/execution ↔ exact R15/R16 financial result — same subtype.

Held for adversarial counting adjudication:

- exact R15 Provider Financial Observation set ↔ R16 canonical reconciliation.

Not separately counted in this draft:

- R3 internal multi-evidence completeness;
- R16 internal multi-component completeness/status semantics;
- generic R8+R16 conjunctive release without an independently identified third reference structure;
- compound mixed-history combinations of already-counted relationships.

No semantic MRC or semantic unresolved cross-node gap is created by this draft.

This document remains non-authoritative until adversarial review and final adjudication.
