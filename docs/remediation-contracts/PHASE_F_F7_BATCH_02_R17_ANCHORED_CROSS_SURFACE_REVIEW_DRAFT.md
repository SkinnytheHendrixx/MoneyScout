# Phase F F7 Batch 02 — R17-Anchored Cross-Surface Reference Integrity Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R17-anchored commercial-authority relationships  
**Implementation authority:** SUSPENDED

## 1. Governing counting rule

This batch applies the F7 counting rule frozen in Batch 01:

> A relationship earns its own F7 finding only when a well-intentioned independent fix to each endpoint could still leave the exact cross-reference or set-membership wiring wrong. If fixing the endpoint defect necessarily fixes the alleged relationship because they are definitionally the same invariant, F7 must not count it again.

The batch therefore distinguishes genuine cross-surface wiring obligations from relationships already fully contained inside R17's own certified endpoint defects.

## 2. Pinned evidence basis

### F7 governing refinement

`docs/remediation-contracts/PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`  
Blob: `689d012b7c663d7916dd748ebea69005992a5917`

### F7 Batch 01 counting rule

`docs/remediation-contracts/PHASE_F_F7_BATCH_01_R18_ANCHORED_CROSS_SURFACE_CERTIFICATION.md`  
Blob: `4d611a419650cc5420150d7068a7f3da9c48d6d2`

### R10 certification

`docs/remediation-contracts/PHASE_F_BATCH_04_R10_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `949ab9efc8222b0ec1fd8a08c9c2299e0a79fb3a`

Relevant confirmed facts:

- no canonical immutable Artifact Version object exists;
- QA does persist exact `commitSha`;
- Release never consumes that exact QA-bound identity;
- Release dispatch and adapter contracts carry repository URL/branch rather than exact artifact identity;
- downstream Asset adoption does not preserve canonical Artifact Version identity.

### R17 certification

`docs/remediation-contracts/PHASE_F_BATCH_05_R17_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `18c1c8579fe4aa9e576dea254e5e961f2b33f2e3`

Relevant confirmed facts:

- no canonical immutable Offer Version exists;
- one commercial activation per Asset blocks O1/O2 coexistence;
- no immutable exact-offer CUSTOMER_CHARGING Grant exists;
- exact provider-account authority is not frozen into charging authority;
- R17 requires an Offer Version to bind the exact R10 production Artifact Version / Release it commercializes;
- R17 requires R19/R20 to consume the exact Offer/Grant segment rather than current Asset state.

### R19 certification

`docs/remediation-contracts/PHASE_F_BATCH_01_R19_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `00560fa2e9813d662df94f86d3f510b3a49b4461`

Relevant confirmed facts:

- no canonical complete Commercial Authority Lineage Reference exists;
- one activation per Asset blocks arbitrary-N commercial lineage;
- current/future R19 lineage must preserve exact Offer/Grant/provider/account/execution ancestry rather than reconstruct from current state.

### R20 certification

`docs/remediation-contracts/PHASE_F_BATCH_02_R20_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `125d8b8f38da416464e263ca5ddb6a55f073c83b`

Relevant confirmed fact: no canonical durable Boundary Decision object exists that can bind exact operation-specific authority/predicate identities.

## 3. F07-07 — R10 Artifact Version / Release ↔ R17 Offer Version

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

Create two legitimate production artifact/release histories:

- `P1/RL1`;
- `P2/RL2`.

Create two legitimate Offer Versions:

- `O1` commercializes exactly `P1/RL1`;
- `O2` commercializes exactly `P2/RL2`.

Persist both pairs simultaneously and prove:

- `O1` cannot silently resolve to P2/RL2 because P2 is current/latest production;
- `O2` cannot inherit P1/RL1 because it shares the same Asset/Build/repository/provider;
- restart/replay reconstructs the same pairings deterministically;
- arbitrary-N artifact/offer histories do not depend on current pointers or query order.

### Current representation failure

R10 does not provide a canonical Artifact Version identity for R17 to reference. Release/Asset surfaces are oriented around Build/Release/current repository/branch state. R17 does not provide a canonical Offer Version field binding the exact R10 Artifact Version/Release either.

Thus P1/RL1↔O1 and P2/RL2↔O2 cannot currently be represented as exact immutable pairings.

### Why this survives endpoint remediation

Even if R10 is fixed to create perfect Artifact Version/Release identities and R17 is fixed to create perfect Offer Versions, composition can still be wrong if an Offer resolves “current production artifact,” “current Release,” same Asset, or same Build rather than persisting the exact Artifact Version/Release identity frozen when the Offer was created.

Therefore the R10↔R17 reference remains an independent F7 acceptance invariant.

## 4. Candidate R17 Offer Version ↔ CUSTOMER_CHARGING Grant — WITHDRAWN / DUPLICATE CONTROL

**Draft candidate:** exact Offer Version ↔ exact CUSTOMER_CHARGING Grant.  
**Provisional adjudication:** DO NOT COUNT AS SEPARATE F7 FINDING.

R17/F05-03 already defines a compliant CUSTOMER_CHARGING Grant as an immutable authority object bound to one exact Offer Version/fingerprint, provider/account, action scope, checkout/payment configuration, and monotonic lifecycle history.

Apply the Batch-01 counting rule:

- if F05-03 is fully fixed, the Grant is by definition bound to one exact Offer Version;
- there is no additional third reference object or independent “current/latest” resolution mechanism left outside F05-03's own definition to certify here;
- retaining a separate F7 finding would therefore double-count F05-03.

This relationship must still be exercised inside later composite/mixed-history fixtures, especially O1/G1 versus O2/G2, but it remains tracked under F05-03 rather than receiving another F7 number.

## 5. F07-08 — R17 Offer/Grant ↔ R19 Commercial Authority Lineage Reference

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

This is an explicit mandatory F7 relationship from Refinement 1.

### Required N×N fixture

Create two legitimate commercial authorities:

- `O1/G1`;
- `O2/G2`.

Create two commercial lineage objects:

- `L1` must include exactly `O1/G1` and the execution/customer/financial path descended from it;
- `L2` must include exactly `O2/G2` and its own descended path.

Persist both simultaneously and prove:

- L1 cannot resolve to O2/G2 because O2 is current/latest for the Asset;
- L2 cannot inherit O1/G1 because the same Asset/provider/customer/product class matches;
- existing O1 customer contracts remain attributable to L1 after O2 exists;
- restart/replay reconstructs exact O/G↔L pairings for arbitrary N.

### Current representation failure

R17 Offer/Grant identity is absent and R19 complete lineage identity is absent. The current commercial activation model is one mutable row per Asset, so both commercial authority and lineage are vulnerable to current-state reconstruction/collapse.

No canonical exact reference exists from a complete R19 lineage object to the exact Offer Version/Grant it consumed.

### Why this survives endpoint remediation

A future correct R17 Offer/Grant model and future correct R19 lineage model could still be wired incorrectly if Lineage resolves a current Offer/Grant by Asset, current activation, provider, checkout, or customer association instead of storing exact historical Offer/Grant IDs.

Therefore exact R17↔R19 wiring is independently necessary after endpoint correction.

## 6. F07-09 — R17 Offer/Grant ↔ R20 Boundary Decision

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Provisional adjudication:** DEFECT.

### Required N×N fixture

For two commercial authorities and consequential boundaries:

- exact `O1/G1 ↔ D1` for checkout/charge/adoption operation X1;
- exact `O2/G2 ↔ D2` for X2.

Both decisions must coexist. Prove:

- D1 cannot consume O2/G2 because O2 is currently eligible/current Offer;
- D2 cannot consume O1/G1 merely because the same Asset/provider/action class matches;
- superseded O1 remains historically authoritative for D1 while being ineligible for new D2-like actions where policy says so;
- restart/replay recovers the exact O/G predicate identity evaluated in each decision.

### Current representation failure

R17 has no canonical immutable Offer/Grant identities, and R20 has no canonical durable Boundary Decision object. Current Asset/commercial authorization fields are mutable/current projections and cannot encode exact historical O/G↔D composition.

### Why this survives endpoint remediation

A future correct R17 model and future correct R20 decision model could both exist while R20 still records only Asset/current Offer/current commercial activation scope, or selects the latest Grant rather than the exact one evaluated at the boundary.

Endpoint correctness therefore does not prove cross-surface decision wiring.

## 7. Concurrent P1/P2 plus O1/O2 mixed-history control

This batch records one compound fixture for later final F7 attack rather than a separate numbered finding:

- `P1/RL1 → O1/G1 → L1/D1`;
- `P2/RL2 → O2/G2 → L2/D2`.

The final cross-cluster pass must attempt:

- P1→O2 cross-wire;
- P2→O1 cross-wire;
- O1/G1→L2 or D2 cross-wire;
- O2/G2→L1 or D1 cross-wire;
- current/latest Asset/Release/Offer/Grant substitution;
- same provider/account/product/customer superficial-match substitution.

No new finding is opened merely for naming the compound fixture because its pairwise wiring obligations are already captured by F07-07/F07-08/F07-09 and F05-03.

## 8. Retention question 9 — cluster disposition

No duplicate relationship-level retention findings are opened.

R10, R17, R19, and R20 endpoint certifications already carry unresolved historical-retention durability. Those remain open and govern the underlying objects.

F7 additionally requires that exact relationship edges survive for the governing historical period:

- Artifact/Release↔Offer;
- Offer/Grant↔Lineage;
- Offer/Grant↔Boundary Decision.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried to Phase-F synthesis rather than multiplied into separate findings.

## 9. Adversarial-review questions

The reviewer should independently challenge at minimum:

1. Is F07-07 genuinely independent of F04-01/F04-02 and F05-01, or does one endpoint defect already contain the complete R10↔R17 relationship?
2. Is withdrawing Offer↔Grant as a duplicate of F05-03 correct under the Batch-01 counting rule?
3. Could a compliant fix to F05-03 still somehow bind a Grant to the wrong Offer through a separate wiring mechanism, implying the candidate should survive after all? Identify a concrete third mechanism if so.
4. Is F07-08 independently necessary after F05-01/F05-03 and F01-02, or does R19's own complete-lineage definition already make exact Offer/Grant linkage inseparable from F01-02?
5. Apply the remove-one-fix test to F07-08: could perfect R17 and perfect R19 endpoint objects still be joined by current Asset/Offer lookup rather than exact IDs?
6. Is F07-09 independently necessary after F05-01/F05-03 and F02-01? Could perfect R17 and R20 endpoints still be joined to current/latest commercial authority incorrectly?
7. Does the P1/P2 + O1/O2 compound fixture add a separate finding or is keeping it as an attack fixture without another number the correct anti-double-counting calibration?
8. Are any provider/account wiring concerns in this cluster already fully covered by F07-04 (R17↔R18) from Batch 01 and therefore not to be re-counted here?
9. Do F07-07/F07-08/F07-09 each extend to arbitrary N without current/latest/query-order assumptions?
10. Is retention handled consistently by carrying one unresolved cluster obligation rather than multiplying endpoint retention findings?
11. Independent scan: is there any existing exact Artifact/Offer/Lineage/Decision reference field or invariant that materially weakens one of the three proposed defects?

## 10. Provisional verdict

**F7 Batch 02 provisional result: FAIL / OPEN.**

Provisional F7 findings:

- **F07-07** — R10 Artifact Version/Release ↔ R17 Offer Version — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- **F07-08** — R17 Offer/Grant ↔ R19 Commercial Authority Lineage Reference — same subtype;
- **F07-09** — R17 Offer/Grant ↔ R20 Boundary Decision — same subtype.

Not separately counted:

- exact R17 Offer Version ↔ CUSTOMER_CHARGING Grant — duplicate of F05-03's own invariant;
- concurrent P1/P2 plus O1/O2 full-chain fixture — retained as a final mixed-history attack, not a separate root/relationship count;
- provider/account Offer/Grant↔R18 Binding — already F07-04 in Batch 01.

No semantic MRC or semantic unresolved cross-node gap is created by this draft.

This document remains non-authoritative until adversarial review and final adjudication.