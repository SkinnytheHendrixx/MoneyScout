# Amendment Package 01A — Graph Delta

**Status at creation:** LANDED GRAPH DELTA / EFFECTIVE PENDING REQUIRED RECHECKS  
**Amendment node:** `RD-C-R17-R18`  
**Source PAIM:** `AMENDMENT_PACKAGE_01_PAIM_CANONICAL_FREEZE.md` blob `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`  
**G2 effect:** `UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`

## 1. Purpose

This immutable delta records only the graph relationships introduced or strengthened when Amendment A becomes current. It does not rewrite the frozen V4 register or retroactively alter historical graph evidence.

No edge becomes `CERTIFIED_CURRENT` solely because Amendment A lands.

## 2. Effective graph relationships

### A-GE-01
- source: `RD-C-R17-R18`
- target: `F07-04`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: exact R17 Offer/Grant ↔ R18 commercial-payment Binding composition
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-02
- source: `RD-C-R17-R18`
- target: `F07-03`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: R18 Binding/Validation ↔ R20 Decision using exact composed R17/R18 evidence
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-03
- source: `RD-C-R17-R18`
- target: `F07-09`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: R17 Offer/Grant ↔ R20 Decision using exact composed R17/R18 evidence
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### A-GE-04
- source: `RD-C-R17-R18`
- target: `H2-E40`
- type: `REPRESENTATION_PREREQUISITE`
- scope: composed-authority-reference slice only
- future acceptance state: constrained by Amendment A

### A-GE-05
- source: `RD-C-R17-R18`
- target: `H2-E43`
- type: `REPRESENTATION_PREREQUISITE`
- scope: relational-validator-policy slice only
- future acceptance state: constrained by Amendment A

### A-GE-06
- source: `RD-C-R17-R18`
- target: `J-F04`
- type: `GOVERNANCE_PREREQUISITE`
- condition: only affected commercial-boundary enforcement slices consuming this predicate
- future acceptance state: constrained by Amendment A

### A-GE-07
- source: `RD-C-R17-R18`
- target: `J-F05`
- type: `GOVERNANCE_PREREQUISITE`
- condition: only affected allow/deny/degradation fixture slices consuming this predicate
- future acceptance state: constrained by Amendment A

### A-GE-08
- source: `RD-C-R17-R18`
- target: `RET-R17`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: preserve exact historical R17↔R18 composition without current-state reconstruction
- future acceptance state: constrained by Amendment A

### A-GE-09
- source: `RD-C-R17-R18`
- target: `RET-R18`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: preserve exact historical binding/composition evidence without current-state reconstruction
- future acceptance state: constrained by Amendment A

### A-GE-10
- source: `RD-C-R17-R18`
- target: `XPI-04`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: affected end-to-end provider-path component using exact R17/R18 composition
- post-land state: `EFFECTIVE_PENDING_RECHECK`

## 3. G2 disposition

`G2_A_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_PROPOSITION`

Amendment A composes already-governed provider/account identities and does not redefine provider/account identity, equality, continuity, or rebinding.

## 4. Frozen negative fan-out

No direct Amendment-A prerequisite is introduced for:

- `H2-E39`
- `NAME-H2-E41`
- `NAME-H2-E42`
- `J-F01`
- `J-F03`
- `J-F06`
- `RET-R20`
- `F07-15`

A later representation or semantic change that creates one of these relationships requires governed graph/PAIM re-derivation.

## 5. Frozen-register preservation

The frozen V4 register and canonical register-freeze artifact remain immutable historical evidence. This delta is additive control-plane history; it does not rewrite those artifacts in place.
