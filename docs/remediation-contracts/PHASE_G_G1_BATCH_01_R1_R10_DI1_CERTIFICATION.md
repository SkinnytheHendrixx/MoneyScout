# Phase G — G1 Batch 01 DI-1 Consistency Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / G1 BATCH 01 CERTIFIED  
**Phase:** G — Design Input Consistency  
**Batch:** G1-01 — DI-1 node-by-node consistency, R1–R10  
**Implementation authority:** SUSPENDED

## 1. Certification result

All ten nodes R1–R10 are classified `DI_CONSISTENT` for DI-1 at their stated scopes.

**Confirmed Phase-G findings in this batch:** none.

This certification does **not** pre-certify G2. In particular, the R6/R7/R8 exact-provider/account seam must still compose with R17/R18/R19/R20 and the named commercial-payment scope.

Governing artifacts:

- `PHASE_G_DESIGN_INPUT_CONSISTENCY_AUDIT_PLAN.md` — blob `a89c9a46f06d9baff0a390a568e13299cd371b91`
- `PHASE_G_DESIGN_INPUT_INVENTORY_CERTIFICATION.md` — blob `295158b07845534c01bd83e6c6467f1de5152d5c`
- reviewed draft: `PHASE_G_G1_BATCH_01_R1_R10_DI1_REVIEW_DRAFT.md` — blob `f2061e7122e32307e3af310787e18f2f27e57c9f`

## 2. Final node dispositions

| Node | Final DI-1 classification | Disposition |
|---|---|---|
| R1 | `DI_CONSISTENT` | reviewed / not activated generically |
| R2 | `DI_CONSISTENT` | reviewed / not activated generically |
| R3 | `DI_CONSISTENT` | reviewed / not activated by R3 |
| R4 | `DI_CONSISTENT` | reviewed / not activated |
| R5 | `DI_CONSISTENT` | reviewed / not activated |
| R6 | `DI_CONSISTENT` | reviewed / dormant / not activated in current R6 scope |
| R7 | `DI_CONSISTENT` | reviewed / dormant / not activated under present single-scope implementation |
| R8 | `DI_CONSISTENT` | reviewed semantically / not generically activated |
| R9 | `DI_CONSISTENT` | reviewed / not activated by generic R9 |
| R10 | `DI_CONSISTENT` | reviewed / not activated by generic R10 |

No future-trigger statement is promoted to present activation.

## 3. Adversarial adjudication

### 3.1 R6 dormancy survives direct pressure

`WI-R6.md` — blob `d4d613a40eed187c230d55f7e21b1b0251bf612a` — §19 explicitly says:

- DI-1 current status entering R6 is `DORMANT`;
- activation crossed by current R6 is `NO`;
- required action is `NOT ACTIVATED`;
- R6 verifies capability sufficiency under the existing identity model;
- enriching verifier-policy fields does not itself consume DI-1;
- changing capability identity to simultaneous provider/account/Asset-scoped identity activates DI-1 and halts design freeze pending adjudication.

That is consistent with the governing DI-1 trigger. Recording or verifying a provider-named claim is not equivalent to owning consequential provider/account substitution authority.

**Final classification:** `DI_CONSISTENT`.

### 3.2 R7 account-scoped resource identity is precision, not substitution authority

`WI-R7.md` — blob `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf` — §24 explicitly says:

- DI-1 is `DORMANT`;
- present single-scope implementation has not crossed activation;
- adding provider/account scope to Resource Pool identity does not itself consume DI-1;
- shared schema/FK/type/index/resolution surfaces with R6 require explicit DI-1 entanglement review;
- activation depends on substitution semantics enabled by the schema/resolution path.

The distinction is correct: exact account-scoped reservation identity is a precision requirement. DI-1 activates when resolution semantics can consequentially substitute one provider/account for another.

**Final classification:** `DI_CONSISTENT`.

### 3.3 R8 exact-scope enforcement does not create an ownership contradiction

`WI-R8.md` — blob `237c752671573013d090e2eacf7c2af4c0e70512` — requires R6/R7/R8 to use the same exact provider/account scope for capability proof, reservation, execution truth, and reconciliation, and forbids cross-account substitution for historical execution truth.

That is a cross-node consistency requirement, not a claim that generic R8 owns every provider/account plurality Design Input. R8 itself says DI-1 activates at the exact scope if implementation changes capability identity semantics to permit substitution.

Therefore R8 can require exact provider/account equality without globally activating DI-1.

**Final classification:** `DI_CONSISTENT`.

## 4. Cross-phase watch item carried into G2 — R6 dormancy versus F06-01 current-row replacement

This adversarial review identified one real, evidence-backed cross-phase interaction that must not be lost even though it does **not** create a G1 finding.

Phase F Batch 06 certified:

**F06-01 — `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`.**

Pinned Phase-F certification:

- `PHASE_F_BATCH_06_R18_REPRESENTABILITY_CERTIFICATION.md`
- blob `aeb309d21e00b7fe47b92c76fe2891a901481370`

That certification directly proved:

- `capabilities_key_unique = UNIQUE(key)`;
- the application `setCapabilityAvailable()` performs `ON CONFLICT(key) DO UPDATE`;
- provider, access level, verification method, metadata, verification time, expiry, and update time are overwritten on the one current row;
- distinct historical authority versions such as Provider A/Account A1/V1 and Provider B/Account B1/V2 cannot coexist under one logical capability key.

This does **not** invalidate R6's DI-1 disposition by itself. R6's contract-level dormancy statement is scoped to one verification call under the present single-identity model: it verifies the claim represented to it and does not itself choose among multiple simultaneous provider/account authorities.

However, F06-01 proves the underlying current capability projection can be replaced across time. Therefore G2 must explicitly test the following question:

> Can R6 remain semantically DI-1 dormant at the individual-call level while the mutable current capability projection creates a de facto provider/account substitution path across R6→R18→R20 composition?

Required G2 attack shape:

1. R6 verification call V1 evaluates logical capability K while current authority is Provider A / Account A1;
2. the one current capability row is later overwritten to Provider B / Account B1 / V2 under the same key K;
3. a consequential execution/boundary later consumes `K` or current capability state;
4. test whether any consumer can treat the later B/B1 row as continuation of the earlier A/A1 verification without exact immutable binding/equality proof.

If that occurs, the resulting Phase-G classification must be based on the actual DI-1 scope/identity drift found in G2; F06-01 itself is evidence, not automatically a Phase-G defect.

This watch item is therefore **mandatory G2 evidence**, not a G1 primary finding.

## 5. Remaining R1–R10 dispositions

### R1–R5

Their negative DI-1 dispositions remain consistent because their responsibilities concern resource truth, capability-resolution provenance, evidence freshness, evaluation lineage, and independent review—not consequential provider/account substitution. Each retains an explicit future exact-scope activation trigger where applicable.

### R9

Immutable repository/source authority may preserve provider/source provenance but does not by itself authorize cross-account substitution. A future substitution-enabled repository/source path is correctly identified as a separate activation trigger.

### R10

Artifact/deployment provenance may preserve provider identity while remaining distinct from provider/account substitution authority. A future artifact/deployment path that permits consequential provider/account substitution activates DI-1 at that exact scope.

All remain `DI_CONSISTENT`.

## 6. Batch-level consistency result

Within R1–R10:

1. provider mention/provenance is not treated as automatic DI-1 activation;
2. capability proof, resource reservation, and execution truth remain parallel-not-merged responsibilities across R6/R7/R8;
3. future activation guards are not mistaken for current activation;
4. no node silently consumes the later named `DI-1/COMMERCIAL_PAYMENT` scope;
5. R8's same-account checkpoint remains a consistency invariant, not an unnamed alias for the commercial-payment scope;
6. the Phase-F F06-01 current-row replacement defect is explicitly carried to G2 as relevant evidence rather than silently ignored or double-counted.

## 7. Attack disposition preview

- **G-A1 scope broadening:** no current R1–R10 defect; negative scopes may not later be treated as globally active merely because provider/account identity appears.
- **G-A2 scope narrowing:** mandatory G2 pressure point for R6/R7/R8 exact account identity.
- **G-A3 named-scope collapse:** not present in R1–R10; `DI-1/COMMERCIAL_PAYMENT` is introduced later.
- **G-A4 current/default account substitution:** R8 forbids it; F06-01 makes the underlying current-row replacement path a mandatory implementation-level G2 attack.
- **G-A10 inactive-scope contamination:** negative dispositions cannot be cited as positive substitution authority.

These previews do not substitute for G4 certification.

## 8. Final adjudication

**G1 Batch 01:** PASS.

- R1–R10: **10 / 10 `DI_CONSISTENT`**.
- Confirmed G1 DI-1 findings: **0**.
- Mandatory G2 watch item added: **R6 dormancy ↔ F06-01 current-row authority replacement**.

This batch certifies node-level DI-1 consistency only. It does not certify the high-risk compound.

Implementation authority remains **SUSPENDED**.
