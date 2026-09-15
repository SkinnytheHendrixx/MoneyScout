# Phase F F7 Batch 03 — R9→R10 / Artifact-Lineage Cross-Surface Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / F7 BATCH 03 CERTIFIED  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R9→R10 source/artifact/QA/adoption relationships  
**Implementation authority:** SUSPENDED

## 1. Final result

F7 Batch 03 **FAILS / OPEN**.

Confirmed relationship-level findings:

1. **F07-10 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R9 Build Source Snapshot ↔ R10 Artifact Version.
2. **F07-11 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — exact R10 Artifact Version ↔ exact QA Result.
3. **F07-12 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — exact production Artifact/Release ↔ Asset adoption identity.

Not separately counted:

- exact QA-bound Artifact Version ↔ exact Release execution — duplicate of F04-02 `QA_RELEASE_EXACT_ARTIFACT_BINDING`;
- the full `S1→P1→Q1→RL1→A1` versus `S2→P2→Q2→RL2→A2` history — retained as a mixed-history attack fixture rather than another finding.

This certification is governed by the updated `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`, including the necessary-precondition versus sufficient-precondition distinction added during adversarial adjudication of this batch.

## 2. Governing evidence

### R9 certification

`docs/remediation-contracts/PHASE_F_BATCH_03_R9_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `d92a665d411b82a0a0ffed1f4dad63c8cce08ef4`

R9 currently lacks a canonical immutable pre-dispatch Build Source Snapshot identity attached to the Build/execution path. The supersession-gap mechanism demonstrates that an earlier Build can later consume a rewritten shared repository source state.

### R10 certification

`docs/remediation-contracts/PHASE_F_BATCH_04_R10_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `949ab9efc8222b0ec1fd8a08c9c2299e0a79fb3a`

R10 currently lacks a canonical Artifact Version object; QA does preserve exact `commitSha`; Release does not consume that exact identity; Asset adoption lacks canonical immutable Artifact Version/deployment identity.

### F7 counting rule

`docs/remediation-contracts/PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`

Governing rule: a relationship earns its own F7 finding only if both endpoint remediations can be individually correct while exact cross-reference/set-membership wiring can still be wrong.

The updated rule additionally distinguishes:

- an endpoint fix being a **necessary precondition** for downstream correctness; from
- that endpoint fix being a **sufficient precondition** that automatically guarantees downstream exact wiring.

Only the second defeats an F7 count.

### Phase C C02-03 — R9→R10

`docs/remediation-contracts/PHASE_C_BATCH_02.md`  
Blob: `292b1622bfca42fac6ffb555442e5a104d467a08`

C02-03 confirms the semantic relationship: R9 freezes exact source authority and R10 preserves the exact artifact built from that authority. Classification: `CONSISTENT_CONSUMPTION`, tags `CONSUMES` and `HARD_CHAIN`.

### Phase C positive precedent

`PHASE_C_BATCH_12.md`, blob `f30b66a82dadfc6cc3e6cf17b850b2fcbf7e10b5`, C12-02 establishes the exact mixed-source/artifact failure shape: valid source `S1` plus artifact `P2` derived from `S2` must fail equality inside a larger composite.

`PHASE_C_BATCH_13.md`, blob `669f2feeec1e649510cf000294f643843fd9fc04`, C13-03 provides analogous precedent for artifact identity embedded across downstream composition.

## 3. F07-10 — R9 Build Source Snapshot ↔ R10 Artifact Version

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

Required fixture:

- `S1 ↔ P1`;
- `S2 ↔ P2`;
- both pairs coexist;
- P1 cannot resolve to S2 because S2 is current/latest;
- P2 cannot resolve to S1 because Build/Bet/repository/product attributes match superficially;
- restart/replay recovers the same derivation graph for arbitrary N.

Current representation cannot persist this exact edge: R9 has no immutable pre-dispatch snapshot ID and R10 has no canonical Artifact Version carrying exact R9 snapshot reference.

This survives endpoint remediation. A perfect R9 snapshot model and perfect R10 Artifact Version model could still be joined incorrectly if Artifact creation records Build/repository/current-source association instead of exact frozen R9 snapshot ID.

C12-02 is direct empirical precedent for the same failure class.

## 4. F07-11 — exact R10 Artifact Version ↔ exact QA Result

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

Required fixture:

- P1 tested by Q1;
- P2 tested by Q2;
- both histories coexist;
- P1 cannot borrow Q2 because Q2 is latest/passing for the same Build;
- P2 cannot inherit Q1 because Build/Asset/repository matches;
- failed/passing rounds remain attributable to the exact artifact actually tested.

QA already has an exact immutable tested anchor through `qa_runs.commitSha`, but no canonical Artifact Version↔QA identity edge exists.

This is a composite-ingredient relationship, not the constitutive purpose of F04-01. QA linkage is one dimension among Build/R9/artifact/package/QA/Release/deployment/adoption dimensions.

Concrete repair scenario:

1. same Build lineage initially produces P1;
2. QA round Q1 evaluates P1 and fails;
3. repair/successor output P2 emerges under the same broader Build lineage;
4. QA round Q2 evaluates P2 and passes;
5. a naive `latest passing QA for Build` association could incorrectly make P1 appear authorized by Q2 unless exact P↔Q identity is persisted.

A correct Artifact Version table and valid QA rows can therefore still coexist with wrong cross-reference wiring. F07-11 is independent.

## 5. QA-bound Artifact ↔ Release — withdrawn as duplicate of F04-02

**Final adjudication:** WITHDRAWN / DUPLICATE OF F04-02.

F04-02 is already `QA_RELEASE_EXACT_ARTIFACT_BINDING`. Its entire defining purpose is that Release must consume and dispatch the exact artifact that qualifying QA tested.

If F04-02 is fully fixed, the QA-bound Artifact↔Release relationship is necessarily fixed. No separate third association remains to certify.

The scenario remains mandatory inside final mixed-history testing under F04-02; it is simply not counted twice.

## 6. F07-12 — exact production Artifact/Release ↔ Asset adoption identity

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

Required fixture:

- P1/RL1 adopted as historical Asset production state A1;
- P2/RL2 later adopted as successor state A2;
- A1 remains attributable to P1/RL1 after A2 exists;
- A2 cannot inherit P1/RL1 through shared Asset/repository/provider identity;
- rollback names an exact historical Artifact/Release rather than query-order “previous current” state;
- restart/replay reconstructs arbitrary-N adoption history exactly.

Current Asset persistence exposes current/navigation pointers such as `activationReleaseJobId`, `currentReleaseJobId`, Build/repository/branch, production URL and provider, but no canonical immutable production Artifact Version/deployment identity.

### Necessary precondition is not sufficient precondition

Batch 04 correctly stated that Asset adoption insufficiency was an **acceptance consequence of F04-01** rather than a separately counted individual-surface defect. That statement means a canonical Artifact Version object is a necessary prerequisite for correct adoption; Asset adoption cannot reference an object that does not exist.

It does **not** establish that creating a correct Artifact Version model automatically fixes the Asset's historical reference to the exact artifact adopted at a particular transition.

F7 asks the sufficient-precondition question:

> After Artifact Version/Release identity is fixed, could Asset/adoption persistence still point to the wrong historical object through current/latest/shared-parent lookup?

Yes.

The Asset/adoption record is a separate persistence surface. A perfect Artifact Version model can coexist with an Asset pointer that still resolves the latest/current Release instead of the exact historical production artifact adopted at A1 or A2.

Therefore Batch 04's endpoint-level “consequence” calibration does not defeat F07-12. It establishes necessity, not automatic sufficiency.

This distinction is now part of the governing F7 counting protocol for any future endpoint batch that used `consequence`, `downstream consequence`, or similar wording.

## 7. Mixed-history attack carried forward

Final F7 cross-cluster testing must include:

- `S1 → P1 → Q1 → RL1 → A1`;
- `S2 → P2 → Q2 → RL2 → A2`.

It must attempt at least:

- S1→P2 and S2→P1;
- P1→Q2 and P2→Q1;
- QA authority for P1 reused while Release dispatches P2 — governed by F04-02;
- P1/RL1→A2 and P2/RL2→A1;
- current/latest repository, QA, Release, Asset, Build, or query-order substitution.

The compound fixture does not receive another finding number.

## 8. Retention question 9

No duplicate per-relationship retention findings are opened.

R9 and R10 already carry unresolved historical-retention findings. F7 adds the requirement that the relationship edges themselves remain durably addressable for the governing period:

- Snapshot↔Artifact;
- Artifact↔QA;
- QA-bound Artifact↔Release under F04-02;
- Artifact/Release↔Asset adoption.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried to final Phase-F synthesis.

## 9. Final adjudication

**F7 Batch 03 result: FAIL / OPEN.**

Confirmed:

- F07-10 — R9 Build Source Snapshot ↔ R10 Artifact Version — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- F07-11 — R10 Artifact Version ↔ exact QA Result — same subtype;
- F07-12 — exact production Artifact/Release ↔ Asset adoption identity — same subtype.

Withdrawn as duplicate:

- QA-bound Artifact↔Release — already fully represented by F04-02's constitutive invariant.

No new semantic MRC or semantic unresolved cross-node gap is created.

Phase F remains OPEN. Remaining Phase-E correspondence F7 relationships, final cross-cluster mixed-history attack, and Phase-F synthesis/closure disposition remain outstanding.

Implementation authority remains **SUSPENDED**.