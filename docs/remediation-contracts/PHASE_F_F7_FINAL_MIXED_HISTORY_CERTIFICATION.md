# Phase F F7 — Final Mixed-History Cross-Cluster Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / FINAL F7 MIXED-HISTORY PASS CERTIFIED  
**Phase:** F — Representability and Multiplicity / F7 Cross-Surface Integrity  
**Purpose:** final cross-cluster mixed-history attack before Phase-F synthesis  
**Implementation authority:** SUSPENDED

## 1. Final result

The final mixed-history cross-cluster pass **FAILS / OPEN** under current representability.

Adversarial review confirmed the existing F7 register and identified one additional independent relationship-level defect:

- **F07-18 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY` — exact R19 Commercial Authority Lineage Reference ↔ exact R20 Boundary Decision.**

The standing F7 count is therefore **17 confirmed numbered cross-surface defects**.

No other new independent cross-cluster finding is established by this pass.

The three deliberately un-numbered duplicate scenarios remain mandatory tests under their existing endpoint findings:

1. execution ↔ exact R18 Binding — F06-02;
2. exact R17 Offer Version ↔ CUSTOMER_CHARGING Grant — F05-03;
3. exact QA-bound Artifact ↔ exact Release execution — F04-02.

## 2. Governing method

This pass is governed by:

- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`;
- `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`, Tests A–E;
- F7 Batches 01–04 and their anti-double-counting adjudications;
- the rule that a mixed attack combining existing defects does not receive another number unless an independent persisted relationship can remain wrong after all currently relevant endpoint/F7 remediations are individually correct.

The final adversarial review specifically challenged whether the full R19-Lineage↔R20-Decision seam was already reducible to F07-03, F07-05, F07-08, and F07-09. Direct R20 contract verification established that it is not.

## 3. Direct R20 contract evidence for F07-18

`docs/remediation-contracts/WI-R20.md`

R20 explicitly states that it consumes, where applicable:

- `R19 complete immutable commercial lineage`.

Its frozen responsibility split is:

- R17: what commercial authority object exists;
- R19: where that authority came from and which exact immutable lineage it belongs to;
- R20: whether **that exact authority** may be consumed now.

R20 §5 explicitly prohibits substituting frozen R19 Lineage Reference L1 with current lineage L2.

R20 §12 states:

> R19 proves the complete immutable historical authority path and supplies the frozen Commercial Authority Lineage Reference.
>
> R20 consumes that exact lineage reference at the relevant boundary.

R20 §16 requires every durable boundary decision to record enough provenance to establish, among other things:

- exact operation/boundary identity;
- exact authority object / lineage reference evaluated;
- applicable predicate set / validator policy version;
- observed predicate outcomes;
- decision time/result;
- required evidence references/provenance.

Therefore whole-Lineage identity is an explicit R20 input/reference obligation, not merely an inference reconstructed from selected R17/R18/R7 predicate pieces.

## 4. F07-18 — exact R19 Lineage Reference ↔ exact R20 Boundary Decision

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

Create at least two legitimate complete immutable commercial lineages:

- L1 for historical authority path H1;
- L2 for historical authority path H2.

Create boundary decisions:

- D1 evaluates exact Lineage Reference L1;
- D2 evaluates exact Lineage Reference L2.

Persist simultaneously:

- `L1 ↔ D1`;
- `L2 ↔ D2`.

Prove:

1. D1 durably identifies L1 as the exact complete lineage object evaluated;
2. D2 durably identifies L2;
3. D1 cannot reconstruct its lineage piecemeal from separately-current R17/R18/R7/R8/R15/R16 or Asset fields;
4. correct R17 and R18 sub-predicate references do not authorize the remaining lineage dimensions to resolve from L2/current state;
5. a later L2 does not rewrite which lineage D1 evaluated;
6. restart/replay reconstructs the same L1↔D1 and L2↔D2 graph;
7. arbitrary N lineages and decisions coexist without current/latest/query-order assumptions.

### Why existing F7 findings do not subsume it

- F07-03 tests exact R18 Binding/Validation ↔ R20 Decision.
- F07-05 tests exact R18 Binding ↔ R19 Lineage.
- F07-08 tests exact R17 Offer/Grant ↔ R19 Lineage.
- F07-09 tests exact R17 Offer/Grant ↔ R20 Decision.

These are sub-component relationships.

Assume all four are perfectly remediated. R20 can still lack a single exact reference to L1 and instead assemble a working lineage picture from individually valid sub-references plus current/shared-parent lookups for the other R19 dimensions, including R8 execution, provider/account, transaction, R15/R16 financial evidence, or other lineage members.

That state satisfies the tested R17/R18 sub-seams while still violating R20's explicit requirement to consume the **complete immutable R19 lineage reference** as the exact historical object evaluated.

Accordingly F07-18 passes Test A and is independently countable.

### Current representability

R20 Batch 02 already established F02-01: no canonical persisted Boundary Decision object exists that binds one decision's exact authority/lineage, predicate set, policy version, outcomes, decision time/result, and evidence/adoption target.

R19 Batch 01 established that no compliant canonical Commercial Authority Lineage Reference is currently represented.

Thus the exact whole-object L↔D reference path is affirmatively absent today. This is a relationship-level acceptance defect; the endpoint findings remain root-cause remediation scope.

## 5. Attack family M1 — source → artifact → QA → release → Asset → Offer → lineage → decision

Create two legitimate chains:

- `S1 → P1 → Q1 → RL1 → A1 → O1/G1 → L1 → D1`;
- `S2 → P2 → Q2 → RL2 → A2 → O2/G2 → L2 → D2`.

Required within-chain equality includes exact source/artifact/QA/release/adoption/Offer/Grant/Lineage/Decision identity.

Reject at minimum:

- S1→P2 / S2→P1 — F07-10;
- P1→Q2 / P2→Q1 — F07-11;
- QA authority for P1 while Release dispatches P2 — F04-02 duplicate control;
- P1/RL1→A2 or P2/RL2→A1 — F07-12;
- P1/RL1→O2 or P2/RL2→O1 — F07-07;
- O1↔G2 / O2↔G1 — F05-03 duplicate control;
- O1/G1→L2 / O2/G2→L1 — F07-08;
- O1/G1→D2 / O2/G2→D1 — F07-09;
- L1→D2 / L2→D1 — F07-18;
- a D1 that has correct O1/G1 and other tested sub-predicates but reconstructs untested lineage dimensions from L2/current state — F07-18;
- direct R9/R10 fields inside L disagreeing with identities embedded through O — Phase-C C12-02/C13-03 controls.

## 6. Attack family M2 — commercial authority ↔ capability binding set ↔ lineage ↔ decision

Create:

- Chain A: O1/G1 with binding set BA = {Bpay-A1, Bcred-A1}, execution XA, lineage L1, decision D1;
- Chain B: O2/G2 with BB = {Bpay-A2, Bcred-A2}, execution XB, lineage L2, decision D2.

Reject:

- wrong R6 result↔binding — F07-01;
- execution reading current binding instead of frozen exact binding — F06-02 duplicate control;
- scalar binding where multiple exact bindings are required or cross-history member mixing — F07-06;
- O1/G1→BB or O2/G2→BA — F07-04;
- BA→L2 or BB→L1 — F07-05;
- BA consumed by D2 / BB consumed by D1 — F07-03;
- L1 consumed by D2 / L2 consumed by D1 even if selected R17/R18 sub-predicates remain correct — F07-18;
- provider-family equality substituting account A2 for A1.

## 7. Attack family M3 — R2 → R7 → R15 → R16 financial history

Create:

- Q1 → E1/RS1 under A/A1 → evidence set S1 → reconciliation C1;
- Q2 → E2/RS2 under A/A2 → evidence set S2 → reconciliation C2.

Reject:

- Q2 silently reusing RS1 — F07-13;
- F2/C2 settling or releasing E1 because superficial economics/provider match — F07-16;
- same-provider/different-account substitution — F07-16;
- C1 claimed current after already-durable E3 exists but E3 omitted — F07-17;
- duplicate observation double effect / distinct-event collapse — F07-17/R16 controls;
- later policy/result rewriting historical evidence membership or prior R7 release provenance;
- cherry-picking R8 or R16 where conjunction is required — Compound-02 control;
- financial truth releasing unrelated reservation members — R7 member-scoping control.

No separate R16-result↔R20 financial-predicate finding is opened. Phase-C C12-03 establishes the intended mediated architecture through R7 rather than direct R20 consumption of R16 financial truth.

## 8. Attack family M4 — recovered occurrence → executor health → reservation/admission

Create O1 requiring X/HX and O2 requiring Y/HY with overlapping shared-resource demand.

Reject:

- O2 borrowing HX — F07-14;
- stale HX authorizing later O1 progression — F07-14;
- duplicate recovery trigger creating new reservation authority for one logical occurrence — C24-03/Compound-03 control;
- generic kernel health substituting exact path health;
- concurrent recovery bursts each acting as sole consumer of shared pool;
- partial recovery falsely reported complete.

No new R12↔R7 finding is opened; C24-03 already governs exact occurrence↔R7 Economic Action/reservation/execution correspondence.

## 9. Attack family M5 — full R20 commercial boundary

Create:

- FR1 for Chain A; FR2 for Chain B;
- D1 requiring exact FR1, O1/G1, R18 bindings BA, complete R19 Lineage Reference L1, and all other applicable predicates;
- D2 requiring the corresponding Chain-B objects.

Reject:

1. D2 consumes FR1 — F07-15;
2. D1 consumes O2/G2 — F07-09;
3. D1 consumes R18 validation/binding from Chain B — F07-03;
4. D1 consumes L2 — F07-18;
5. D1 stores correct O1/G1 and BA but no atomic L1 reference, allowing other lineage dimensions to resolve from current/L2 — F07-18;
6. one predicate is current/latest while the rest remain historical Chain A, producing a mixed individually-valid predicate vector;
7. freshness invalidates between validation read and actual boundary commit — Compound-05 control;
8. newer evidence silently substitutes for exact historical evidence rather than producing a governed successor freshness result.

The whole-Lineage reference requirement is separate from the R17 and R18 predicate identities. R20 must know both the exact predicate outcomes and the exact complete lineage object whose current eligibility it is evaluating.

## 10. Global arbitrary-N / restart-replay attack

For arbitrary N legitimate histories H1…HN:

1. every canonical authority/history object remains independently addressable;
2. every direct and set-valued relationship is persisted or deterministically reconstructable from immutable exact references;
3. restart/replay reconstructs the same graph;
4. successor HN+1 does not rewrite predecessor identities;
5. concurrent/in-flight histories coexist where contracts permit;
6. shared Opportunity/Asset/Build/provider/account-family attributes never imply identity equivalence;
7. set membership prevents cross-history mixing;
8. Test-E evidence retrieval preserves governed exact input membership/cutoff;
9. historical policy/result/adoption/release/decision provenance preserves the exact versions actually governing at the time;
10. every R20 decision remains bound to one exact whole R19 Lineage Reference where R19 is applicable;
11. retention/archive behavior preserves the required graph for the governing period.

## 11. Final coverage audit

All **17 confirmed F7 findings** are exercised:

- F07-01 — M2;
- F07-03 — M2/M5;
- F07-04 — M2;
- F07-05 — M2;
- F07-06 — M2;
- F07-07 — M1;
- F07-08 — M1;
- F07-09 — M1/M5;
- F07-10 — M1;
- F07-11 — M1;
- F07-12 — M1;
- F07-13 — M3;
- F07-14 — M4;
- F07-15 — M5;
- F07-16 — M3;
- F07-17 — M3;
- F07-18 — M1/M2/M5.

All three deliberately un-numbered duplicate scenarios remain exercised:

- execution↔R18 binding under F06-02 — M2;
- Offer↔Grant under F05-03 — M1;
- QA-bound Artifact↔Release under F04-02 — M1.

## 12. Other adversarial questions adjudicated

The final review found no additional independent finding for:

- M2 Offer/Grant↔multi-binding-set beyond F07-04 + F07-06;
- M3 direct R16-result↔R20 financial predicate beyond the established R7-mediated architecture and F07-16;
- R15's activation anchor into `commercial_activations` beyond reinforcing F07-16/F07-17 and existing R17/R19 endpoint defects;
- M4 R12↔R7 beyond C24-03;
- compound scenarios that merely combine existing findings.

## 13. Final disposition

**Final F7 mixed-history result: FAIL / OPEN.**

The pass adds exactly one new independent relationship finding:

- **F07-18 — exact complete R19 Commercial Authority Lineage Reference ↔ exact R20 Boundary Decision.**

The F7 register now contains **17 confirmed numbered defects** and **three deliberately un-numbered duplicate scenarios** retained under their constitutive endpoint findings.

No further independent cross-cluster finding was established by this adversarial pass.

This completes the substantive F7 relationship-discovery/mixed-history stage. Phase F remains OPEN pending synthesis/closure disposition and retention treatment.

Implementation authority remains **SUSPENDED**.
