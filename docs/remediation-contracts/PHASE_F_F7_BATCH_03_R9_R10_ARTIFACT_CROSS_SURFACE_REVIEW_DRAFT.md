# Phase F F7 Batch 03 — R9→R10 / Artifact-Lineage Cross-Surface Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R9→R10 source/artifact/QA/adoption relationships  
**Implementation authority:** SUSPENDED

## 1. Governing counting rule

This batch is governed by:

- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`;
- `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`;
- the Batch-01 rule that a relationship is separately countable only when both endpoints could be correctly fixed and the exact cross-reference/set-membership wiring could still remain wrong.

The constitutive-purpose vs. one-ingredient distinction is applied explicitly:

- if the relationship is the entire content of an already-certified endpoint defect, do not count it again;
- if the relationship is one independently wireable dimension inside a broader authority/composite object, F7 may count it separately where a wrong pairing can survive otherwise-valid endpoint remediation.

## 2. Pinned evidence basis

### R9 certification

`docs/remediation-contracts/PHASE_F_BATCH_03_R9_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `d92a665d411b82a0a0ffed1f4dad63c8cce08ef4`

Confirmed relevant facts:

- no canonical immutable pre-dispatch Build Source Snapshot exists;
- Build execution can inherit later mutable repository source state;
- current persistence cannot preserve arbitrary-N exact R9 source authorities with deterministic downstream reference;
- multiple Gateway attempts can physically coexist, so the core defect is semantic/temporal authority binding rather than a universal one-row ceiling.

### R10 certification

`docs/remediation-contracts/PHASE_F_BATCH_04_R10_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `949ab9efc8222b0ec1fd8a08c9c2299e0a79fb3a`

Confirmed relevant facts:

- no canonical immutable Artifact Version object exists;
- QA does persist exact `commitSha` per round;
- Release creation does not consume `qa.commitSha`;
- Release plans/adapters carry repository URL/branch instead of exact artifact identity;
- Asset adoption/current Release pointers do not preserve canonical production Artifact Version identity;
- QA→Release exact-artifact binding is already independently certified as F04-02.

### Phase C C02-03 — R9→R10

`docs/remediation-contracts/PHASE_C_BATCH_02.md`  
Blob: `292b1622bfca42fac6ffb555442e5a104d467a08`

C02-03 classifies `R9 → R10` as `CONSISTENT_CONSUMPTION` with tags `CONSUMES` and `HARD_CHAIN`.

The governing semantic split is:

- R9 freezes the exact source authority entering the Build;
- R10 preserves the exact artifact actually built from that authority through QA, Release, deployment, and adoption;
- a Build Source Snapshot must be linkable to the exact Build/Artifact identity consumed by R10;
- valid R9 source authority is necessary but not sufficient for downstream R10 artifact correctness.

Phase C found no semantic contradiction. F7 now tests actual representational pair integrity.

### Phase C C12-02 / C13-03 precedent

`PHASE_C_BATCH_12.md` blob `f30b66a82dadfc6cc3e6cf17b850b2fcbf7e10b5` established that independently valid R9 snapshot `S1` and R10 artifact `P2` can still form an invalid mixed lineage when P2 actually derives from S2, requiring explicit source↔artifact equality inside R19.

`PHASE_C_BATCH_13.md` blob `669f2feeec1e649510cf000294f643843fd9fc04` established the analogous need to keep direct R10 artifact identity consistent with the artifact embedded in downstream R17/R19 composition.

These are positive controls for treating source/artifact and artifact/downstream identity as independently wireable dimensions rather than assuming endpoint completeness proves composition.

## 3. F07-10 — R9 Build Source Snapshot ↔ R10 Artifact Version

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

This is a mandatory Refinement-1 relationship.

### Required N×N fixture

Create legitimate source authorities:

- `S1` — exact immutable source snapshot for Build path 1;
- `S2` — exact immutable source snapshot for Build path 2.

Create legitimate Artifact Versions:

- `P1` actually built from S1;
- `P2` actually built from S2.

Persist simultaneously:

- `S1 ↔ P1`;
- `S2 ↔ P2`.

Prove:

- P1 cannot resolve to S2 because S2 is current/latest repository state;
- P2 cannot resolve to S1 because Build/Bet/repository/product identity is superficially similar;
- restart/replay reconstructs the same source→artifact derivation graph;
- arbitrary-N histories do not depend on one-current-repository or query-order assumptions.

### Current representation failure

R9 currently has no immutable pre-dispatch snapshot ID attached to Build execution. R10 currently has no canonical Artifact Version identity carrying exact R9 snapshot reference.

Build/source state is fragmented across mutable repository rows, Build/Gateway records, result commit fields, and later QA/Release records. No persisted exact source-snapshot→Artifact-Version edge exists.

The R9 supersession-gap mechanism makes the risk concrete: a Build created while shared repository state represented source X can later execute after that row has been rewritten to Y. Without an immutable S→P reference, downstream Artifact identity cannot prove which source authority it descends from.

### Why this survives endpoint remediation

A future perfect R9 snapshot model and future perfect R10 Artifact Version model could still be joined incorrectly if Artifact creation stores Build/repository/current-source association rather than the exact frozen R9 snapshot ID.

C12-02 is direct positive precedent for the same mixed-source/artifact failure shape inside R19.

Therefore R9↔R10 exact pairing is independently necessary after endpoint correction.

## 4. F07-11 — exact R10 Artifact Version ↔ exact QA Result

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create Artifact Versions:

- `P1`;
- `P2`.

Create QA results/rounds:

- `Q1` tested exact P1;
- `Q2` tested exact P2.

Persist both pairs simultaneously and prove:

- P1 cannot borrow Q2 merely because Q2 is the latest passing QA round for the same Build/product/repository;
- P2 cannot inherit Q1 merely because both share Build/Asset lineage;
- historical failed/passing rounds remain attributable to the exact artifact each tested;
- restart/replay reconstructs P1↔Q1 and P2↔Q2 for arbitrary N.

### Current representation failure

QA rows do persist exact `commitSha`, so QA itself has an immutable tested anchor. But no canonical Artifact Version object exists with an exact QA-result reference graph, and R10's required Artifact Version composite includes QA linkage as one dimension among many.

Thus the system has exact values on the QA side but no canonical persisted P↔Q identity edge.

### Counting-rule analysis

This is not the same finding as F04-01 in its entirety. F04-01 is the broader absence of a canonical Artifact Version object spanning Build/R9/artifact/package/QA/Release/deployment/adoption lineage.

QA linkage is one independently wireable ingredient inside that larger composite. A compliant Artifact Version table could exist yet still attach the latest QA result for a Build rather than the exact QA result that tested that artifact.

Therefore the relation survives the constitutive-purpose test and earns independent F7 consideration.

## 5. Candidate QA-bound Artifact ↔ Release — WITHDRAWN / DUPLICATE OF F04-02

**Candidate:** exact QA-tested Artifact Version ↔ exact Release Job/dispatch.  
**Provisional adjudication:** DO NOT COUNT AS SEPARATE F7 FINDING.

F04-02 is already `QA_RELEASE_EXACT_ARTIFACT_BINDING` and its full content is precisely this relationship:

- exact QA artifact identity exists upstream;
- Release creation must consume that exact QA-bound Artifact Version;
- Release plan/job/adapter/provider payload must preserve the same exact artifact;
- retries/restarts must not change artifact while reusing QA authority.

Apply the counting rule:

- if F04-02 is fully fixed, QA-bound Artifact↔Release exact wiring is necessarily fixed;
- there is no additional third reference object or separate association mechanism left to certify beyond F04-02's own definition;
- separately numbering the same relation in F7 would double-count the endpoint finding.

The scenario remains mandatory in final mixed-history tests under F04-02; it is merely not assigned another F7 finding number.

## 6. F07-12 — exact production Artifact/Release ↔ Asset adoption identity

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create two legitimate production histories for one logical product/Asset lineage:

- `P1/RL1` adopted as historical production state A1;
- later `P2/RL2` adopted as successor production state A2.

Persist both historical pairings and prove:

- A1 remains attributable to P1/RL1 after P2 becomes current;
- A2 does not inherit P1/RL1 merely because Asset ID/repository/provider matches;
- rollback targets an exact historical Artifact/Release, not “previous current” by query order;
- restart/replay reconstructs exact adoption history for arbitrary N.

### Current representation failure

Assets currently carry convenience/current pointers such as `activationReleaseJobId`, `currentReleaseJobId`, Build identity, repository URL/branch, production URL/provider.

Batch 04 correctly did not count Asset adoption as a separate individual-surface defect because its insufficiency follows from the absent canonical Artifact Version model.

F7 asks a different question: after a valid Artifact Version/Release model exists, can the Asset adoption/history edge still point to the wrong exact historical production object?

Today no canonical immutable production Artifact Version/deployment identity is preserved on the Asset side, so the exact P/RL↔adoption graph cannot be represented.

### Why this survives endpoint remediation

A future correct Artifact Version object can exist while `currentReleaseJobId` or another Asset pointer still selects the latest/current release rather than the exact historical production artifact that was adopted at a particular transition.

Artifact identity is one ingredient of the broader Asset historical/adoption state; therefore exact adoption wiring is independently testable and not constitutive of F04-01's entire purpose.

## 7. Mixed-history attack carried forward

The final cross-cluster pass must include at least:

- `S1 → P1 → Q1 → RL1 → A1`;
- `S2 → P2 → Q2 → RL2 → A2`.

It must attempt:

- S1→P2 and S2→P1 substitution;
- P1→Q2 and P2→Q1 substitution;
- QA authority for P1 reused while Release dispatches P2 (covered under F04-02, not newly counted here);
- RL1/P1→A2 or RL2/P2→A1 adoption cross-wire;
- current/latest repository, QA, Release, Asset, Build, or query-order substitution.

The compound chain is an attack fixture, not an additional finding.

## 8. Retention question 9 — cluster disposition

No duplicate relationship-level retention findings are opened.

R9 and R10 already carry unresolved historical-retention findings. F7 additionally requires that the exact edges survive for the governing period:

- R9 Snapshot↔Artifact Version;
- Artifact Version↔QA result;
- QA-bound Artifact↔Release under F04-02;
- production Artifact/Release↔Asset adoption.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried to final Phase-F synthesis.

## 9. Adversarial-review questions

The reviewer should independently challenge at minimum:

1. Is F07-10 independently countable after F03-01/F04-01, or does fixing one endpoint necessarily create the exact R9↔R10 edge?
2. Does C02-03 establish only semantic compatibility, while C12-02 provides the stronger empirical precedent for independent source↔artifact equality testing?
3. Is F07-11 genuinely independent of F04-01 under the constitutive-purpose vs. one-ingredient test?
4. Could a compliant Artifact Version implementation still attach the wrong QA round/result by current/latest Build lookup while every Artifact and QA object is individually valid?
5. Is withdrawing QA-bound Artifact↔Release as duplicate of F04-02 correct?
6. Is F07-12 genuinely independent of F04-01, or is Asset adoption so constitutive of Artifact Version identity that no separate F7 wiring obligation remains?
7. Apply the remove-one-fix test to F07-12: could perfect Artifact Version objects coexist with a still-wrong Asset historical/current adoption pointer?
8. Does any current Asset/release field already provide exact immutable production artifact/adoption identity sufficient to weaken F07-12?
9. Do F07-10/F07-11/F07-12 extend to arbitrary N without latest/current/query-order assumptions?
10. Is the mixed-history fixture correctly retained without another finding number?
11. Is retention handling consistent with prior F7 batches?
12. Independent scan: is there any exact source-snapshot ID on R10 artifacts, exact Artifact-Version ID on QA rows, or exact immutable production Artifact-Version ID on Asset adoption that materially weakens these three proposed findings?

## 10. Provisional verdict

**F7 Batch 03 provisional result: FAIL / OPEN.**

Provisional F7 findings:

- **F07-10** — R9 Build Source Snapshot ↔ R10 Artifact Version — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- **F07-11** — R10 Artifact Version ↔ exact QA Result — same subtype;
- **F07-12** — exact production Artifact/Release ↔ Asset adoption identity — same subtype.

Not separately counted:

- QA-bound Artifact Version ↔ Release — duplicate of F04-02's constitutive invariant;
- full `S1→P1→Q1→RL1→A1` versus `S2→P2→Q2→RL2→A2` history — retained as mixed-history attack fixture only.

No semantic MRC or semantic unresolved cross-node gap is created by this draft.

This document remains non-authoritative until adversarial review and final adjudication.
