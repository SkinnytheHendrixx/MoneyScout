# Phase F F7 Batch 02 — R17-Anchored Cross-Surface Reference Integrity Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / F7 BATCH 02 CERTIFIED  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** R17-anchored commercial-authority relationships  
**Implementation authority:** SUSPENDED

## 1. Final result

F7 Batch 02 **FAILS / OPEN**.

Confirmed relationship-level findings:

1. **F07-07 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R10 Artifact Version/Release ↔ R17 Offer Version.
2. **F07-08 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R17 Offer/Grant ↔ R19 Commercial Authority Lineage Reference.
3. **F07-09 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — R17 Offer/Grant ↔ R20 Boundary Decision.

Not separately counted:

- R17 Offer Version ↔ CUSTOMER_CHARGING Grant — duplicate of F05-03's constitutive invariant;
- concurrent P1/P2 plus O1/O2 full-chain fixture — retained as a mixed-history attack, not another finding;
- provider/account Offer/Grant ↔ R18 Binding — already classified as F07-04 in Batch 01.

## 2. Governing counting rule

This certification applies:

`docs/remediation-contracts/PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`  
Blob: `f945b0702e7e79f280fe280c6caed89e4f217864`

The rule distinguishes:

- **constitutive-purpose relationships**, where the relation is the endpoint finding's entire defining purpose and must not be counted again; and
- **composite-ingredient relationships**, where the relation is one embedded historical identity among several dimensions of a broader object and can remain incorrectly wired even after both endpoint objects are otherwise valid.

A candidate earns its own F7 finding only if a correct independent fix to both endpoints could still leave the exact pair/reference/set-membership wrong.

## 3. Pinned endpoint evidence

### R10

`PHASE_F_BATCH_04_R10_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `949ab9efc8222b0ec1fd8a08c9c2299e0a79fb3a`

R10 lacks canonical Artifact Version identity and exact QA→Release artifact propagation.

### R17

`PHASE_F_BATCH_05_R17_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `18c1c8579fe4aa9e576dea254e5e961f2b33f2e3`

R17 lacks canonical immutable Offer Version identity, arbitrary-N Offer cardinality, and immutable CUSTOMER_CHARGING Grant identity.

### R19

`PHASE_F_BATCH_01_R19_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `00560fa2e9813d662df94f86d3f510b3a49b4461`

R19 lacks canonical complete Commercial Authority Lineage Reference identity and arbitrary-N lineage representation.

### R20

`PHASE_F_BATCH_02_R20_REPRESENTABILITY_CERTIFICATION.md`  
Blob: `125d8b8f38da416464e263ca5ddb6a55f073c83b`

R20 lacks canonical durable Boundary Decision identity.

## 4. Phase-C precedent for embedded-dimension equality

Three adjudicated Phase-C findings provide direct precedent that R19's broader composite identity does not eliminate the need to independently verify each embedded historical dimension.

### C11-01 — R4 → R19

`PHASE_C_BATCH_11.md`  
Blob: `4cc5c1b06ac2e2578f8904872b8beb7f81cedb2f`

Required an explicit fixture proving the R4-derived exact Evaluation Cycle equals the Evaluation Cycle independently embedded in downstream R17 authority.

### C12-02 — R9 → R19

`PHASE_C_BATCH_12.md`  
Blob: `f30b66a82dadfc6cc3e6cf17b850b2fcbf7e10b5`

Required an explicit fixture rejecting individually valid but historically mismatched R9 source `S1` plus R10 artifact `P2`.

### C13-03 — R10 → R19

`PHASE_C_BATCH_13.md`  
Blob: `669f2feeec1e649510cf000294f643843fd9fc04`

Required exact consistency between R19's direct R10 artifact segment and the R10 artifact identity independently embedded in the R17 Offer segment.

These are empirical positive controls for the composite-ingredient rule.

## 5. F07-07 — R10 Artifact Version/Release ↔ R17 Offer Version

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `P1/RL1 ↔ O1`.
- `P2/RL2 ↔ O2`.

Both pairings must coexist. O1 must never resolve to P2/RL2 because P2 is current/latest production, and O2 must never inherit P1/RL1 because Asset, Build, repository, or provider matches.

### Independence under the counting rule

A correct R10 Artifact Version model and a correct R17 Offer Version model could both exist while Offer creation still looks up current Release/current production artifact instead of persisting the exact artifact/release identity frozen at Offer creation.

Therefore this is a genuine cross-surface wiring invariant.

### Direct Phase-C precedent

C13-03 already required an exact R10-artifact-vs-R17-embedded-artifact consistency fixture. That prior adjudication demonstrates this pair independently needs equality verification beyond endpoint completeness.

## 6. R17 Offer Version ↔ CUSTOMER_CHARGING Grant — not separately counted

**Final adjudication:** DUPLICATE / TRACK UNDER F05-03.

F05-03 defines a compliant CUSTOMER_CHARGING Grant as immutable authority bound to one exact Offer Version/fingerprint, exact provider/account, operation scope, checkout/payment configuration, and monotonic lifecycle.

This is a constitutive-purpose relationship:

- a Grant bound to the wrong Offer is not a correctly implemented Grant with a separate wiring bug;
- it fails F05-03's defining identity requirement itself.

Accordingly, no separate F7 number is earned.

The O1/G1 versus O2/G2 scenario remains mandatory inside mixed-history attacks under F05-03.

## 7. F07-08 — R17 Offer/Grant ↔ R19 Commercial Authority Lineage Reference

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `O1/G1 ↔ L1`.
- `O2/G2 ↔ L2`.

L1 must remain tied to the exact O1/G1 authority that produced its customer/execution/financial path after O2 exists. L2 must not inherit O1/G1 because Asset, provider, customer, Product, checkout, or current activation matches.

### Independence under the counting rule

R19's complete lineage includes R17 Offer/Grant identity as one ingredient among many, not as the entirety of the Lineage Reference's constitutive purpose.

A well-formed R17 endpoint and otherwise well-formed R19 composite could still be joined incorrectly through current Asset/Offer/current activation lookup rather than exact historical Offer/Grant IDs.

Therefore exact R17↔R19 wiring remains independently necessary.

### Phase-C precedent

This is the same failure class already proven for sibling R19 dimensions:

- C11-01: direct R4 cycle vs embedded downstream cycle;
- C12-02: R9 source vs R10 artifact derivation;
- C13-03: direct R10 artifact vs R17-embedded R10 artifact.

Each case established that a broader valid R19 composite does not prove its separately populated historical dimensions are mutually consistent.

The R17 Offer/Grant dimension is not exempt from that same equality discipline.

## 8. F07-09 — R17 Offer/Grant ↔ R20 Boundary Decision

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required N×N fixture

- `O1/G1 ↔ D1` for exact operation X1.
- `O2/G2 ↔ D2` for exact operation X2.

Both decisions must coexist. D1 must not consume O2/G2 because it is current/latest, and D2 must not borrow O1/G1 because the same Asset/provider/action class matches.

Historical O1/G1 may remain authoritative for D1 even after supersession while no longer being eligible for new actions according to current policy.

### Independence under the counting rule

A correct R17 Offer/Grant model and a correct R20 Decision model could both exist while R20 still stores/selects only current Offer/current commercial activation or otherwise resolves the wrong historical Grant.

Thus endpoint correctness does not prove exact decision-predicate wiring.

## 9. Provider/account overlap discipline

Provider/account identity flowing through exact commercial capability binding is already governed by F07-04 (R17 Offer/Grant ↔ R18 Binding) from F7 Batch 01.

This batch does not create another finding for that same relation.

F07-08 and F07-09 may carry provider/account identity as part of their complete historical objects, but they are classified here for Offer/Grant↔Lineage and Offer/Grant↔Decision wiring respectively.

## 10. Mixed-history compound fixture

No additional finding is opened for the compound chain:

- `P1/RL1 → O1/G1 → L1/D1`;
- `P2/RL2 → O2/G2 → L2/D2`.

The final F7 mixed-history pass must attempt at minimum:

- P1→O2;
- P2→O1;
- O1/G1→L2 or D2;
- O2/G2→L1 or D1;
- substitution through current/latest Asset, Release, Offer, Grant, activation, provider/account, product/customer similarity, or query order.

This fixture jointly exercises already-counted relationship invariants and does not receive another number.

## 11. Arbitrary-N and restart/replay

F07-07/F07-08/F07-09 must each extend beyond two examples:

- arbitrary-N legitimate artifact/offer/lineage/decision histories;
- deterministic exact pairing after restart/replay;
- no one-current-child assumption;
- no query-order or latest-row inference;
- no shared-parent or superficial-attribute substitution.

## 12. Retention question 9

No duplicate per-relationship retention findings are opened.

R10, R17, R19, and R20 endpoint certifications already carry unresolved historical-retention durability findings.

F7 additionally requires preservation of the relationship edges themselves for the governing historical period:

- Artifact/Release ↔ Offer;
- Offer/Grant ↔ Lineage;
- Offer/Grant ↔ Boundary Decision.

**Cluster retention disposition:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` carried to final Phase-F synthesis.

## 13. Final adjudication

**F7 Batch 02 result: FAIL / OPEN.**

Confirmed:

- F07-07 — R10 Artifact Version/Release ↔ R17 Offer Version — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`;
- F07-08 — R17 Offer/Grant ↔ R19 Lineage — same subtype;
- F07-09 — R17 Offer/Grant ↔ R20 Decision — same subtype.

Not separately counted:

- Offer Version ↔ CUSTOMER_CHARGING Grant — constitutive purpose of F05-03;
- P1/P2 + O1/O2 compound — mixed-history fixture only;
- provider/account Offer/Grant ↔ R18 Binding — already F07-04.

No new semantic MRC or semantic unresolved cross-node gap is created.

Phase F remains OPEN. Remaining F7 clusters, final mixed-history attack, and Phase-F synthesis/closure disposition remain outstanding.

Implementation authority remains **SUSPENDED**.