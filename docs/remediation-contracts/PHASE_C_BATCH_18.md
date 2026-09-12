# Phase C Batch 18 — Cross-Reference Classification

**Status:** COMMITTED / AWAITING INDEPENDENT VERIFICATION  
**Phase:** C — Cross-node classification  
**Batch:** C-18  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 54 edges across 18 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged

This batch classifies:

- `R16 → R11`
- `R12 → R20`
- `R9 → R20`

All classifications below preserve the Phase C governing rule that relation, topology, certification strength, and primary classification are independent dimensions. A representability strengthening does not by itself imply `MISSING_REQUIRED_COMPOSITION` when the load-bearing composition is already explicitly present.

---

## C18-01 — `R16 → R11`

**Pinned endpoint blobs**

- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Endpoint source evidence

R16 explicitly defines and assigns ownership for financial reconciliation regression:

> `FINANCIAL_RECONCILIATION_REGRESSION`

and requires:

> R11 must own the corrective disposition.

R16 also requires preservation of:

- the historical fact that release occurred;
- the corrected canonical incurred/settled truth;
- the executed downstream authority that may already have consumed the released headroom;
- the resulting unsupported exposure as an owned remediation condition.

Its governing rule is:

> Recomputation may revise truth. It may not retroactively erase consequential authority that already executed.

R11 independently provides the generic corrective-ownership model:

> Fail-closed is incomplete if the closed state has no owner. When the system cannot safely decide corrective action, uncertainty itself becomes an owned adjudication obligation.

R11 requires exact scope, provenance, authority context, target, completion conditions, immutable obligation history, and deterministic successor convergence.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `UNILATERAL_DECLARATION`

**Certification dependency strength:** operational/integration

### Why this is consistent

The load-bearing composition is explicit on the R16 side: R16 names the regression state and assigns corrective ownership to R11. The ownership split is coherent:

- R16 owns canonical financial interpretation and the regression fact.
- R11 owns the corrective successor/disposition.

R11 must not recalculate or rewrite R16 financial truth. R16 must not self-authorize remediation. Historical release and downstream execution remain historical facts.

Topology remains unilateral because R11 does not independently name R16 or `FINANCIAL_RECONCILIATION_REGRESSION` as a dedicated corrective class.

### Required strengthening — canonical regression identity

The full-source review identified a real representability gap narrower than a missing composition.

R11 §7 freezes the deterministic-convergence principle but explicitly states that the exact deterministic-key format is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` if one was separately frozen.

R16 §16 names the regression state and the facts that must be preserved, but does not define a discrete identity object or canonical fingerprint for one regression instance.

Therefore the remediation contract must introduce a canonical identity primitive equivalent to:

**`Financial Reconciliation Regression Identity`**

It must preserve, at minimum where applicable:

- exact R8 execution identity;
- provider identity;
- exact provider-account identity;
- governing R16 reconciliation-policy version;
- evidence-set / canonical-reconciliation reference sufficient to identify the corrected truth;
- exact prior R7 release reference or release event identity;
- corrected canonical financial-state reference;
- unsupported exposure amount and unit/currency;
- lineage sufficient to distinguish the downstream authority that consumed the released headroom;
- provenance / deterministic fingerprint or equivalent identity mechanism.

The exact physical field names or hash serialization are implementation detail unless separately recovered. The semantic identity dimensions above are not optional.

### Required fixture

1. Canonical financial state F1 permits a prior R7 release.
2. Later replay/policy-correct reconciliation yields F2 and creates one `FINANCIAL_RECONCILIATION_REGRESSION` identity G1.
3. G1 preserves the exact execution/provider/account lineage, policy version, prior release reference, corrected canonical state, and unsupported exposure.
4. First evaluation derives R11 corrective obligation C1 from G1.
5. Replaying the same exact G1 converges on C1, not C2/C3 duplicates.
6. A materially different later regression fact produces a successor/version or distinct canonical regression identity as required; C1 is not silently mutated into a different obligation.
7. C1 cannot rewrite R16 financial history, erase the original R7 release, or erase downstream authority that already consumed released headroom.
8. R11 completion requires its exact class-specific completion predicate; worker completion alone is insufficient.
9. Any consequential corrective execution remains independently subject to R7/R20.

### Calibration

This is **not** `MISSING_REQUIRED_COMPOSITION`.

The composition itself is already explicit: R16 names the state and assigns R11 ownership. The defect is representational precision needed to make deterministic corrective identity executable. This is narrower than C14's `R19 → R14` gap, where much of the consumed composite identity had no representational home at all.

### Invalidation rules

Re-adjudicate if future source or implementation evidence shows either:

- a previously unrecovered canonical R16 regression-identity object already exists with materially different semantics; or
- R11 corrective identity changes so materially that G1→C1 deterministic convergence no longer depends on a first-class regression identity.

---

## C18-02 — `R12 → R20`

**Pinned endpoint blobs**

- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

### Endpoint source evidence

R12 explicitly states:

> Scheduling persistence preserves intent; it does not grant perpetual execution authority.

and:

> Before consequential execution, R20 later determines whether the exact obligation/lineage remains eligible now.

R12 further requires that stale queued work not override pause, supersession, or termination and that exact originating lineage survive reconstruction.

R20 reciprocally requires fresh current eligibility at the consequential boundary:

> No consequential action may rely on authority merely because that authority was valid at an earlier checkpoint.

R20's three-phase model separates:

- `PREFLIGHT`
- `BOUNDARY_VALIDATION`
- `ADOPTION_VALIDATION`

and its predicate families include exact lineage, resource authority, capability/binding validity, evidence freshness, runtime authority, and policy/pause conditions.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Ownership split

- R12 owns whether a durable runnable occurrence exists and can be reconstructed.
- R20 owns whether that exact occurrence may execute consequentially now.

`runnable ≠ authorized`, and `currently authorized ≠ durable occurrence exists`.

### Targeted long-downtime fixture

1. Domain obligation D under lineage L1 requires future consequential work.
2. R12 materializes or later reconstructs occurrence O1.
3. The system remains unavailable long enough that authority-relevant state may change.
4. During downtime, lineage, Offer/capability/resource state, pause state, or another R20 predicate changes.
5. Recovery reconstructs O1 under the exact original domain-obligation identity and L1; it does not substitute current L2.
6. O1 becoming runnable triggers a **new** R20 decision.
7. Any old preflight/allow attached to O1 is non-reusable unless an explicit safe reuse rule applies.
8. If L1 is no longer eligible, O1 remains historical/reconstructible but does not execute.
9. If the domain obligation was superseded or paused, stale queued O1 cannot override that state.
10. A governed successor obligation D2 receives its own occurrence O2 and its own boundary decision.
11. R20 denial does not delete the historical fact that O1 was legitimately scheduled/reconstructed.

No gap was found. The endpoint contracts already state the separation directly and reciprocally.

---

## C18-03 — `R9 → R20`

**Pinned endpoint blobs**

- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

### Endpoint source evidence

R9 requires:

> Every Build must bind to an exact immutable Build Source Snapshot before consequential build execution can rely on repository state.

and:

> Mutable repository references may locate a candidate source; only the frozen immutable source identity authorizes the Build.

R9 preserves exact commit/source identity, Build identity, Product/Architecture identity, R4 lineage, source fingerprint, and provenance.

Its hard chain is:

`R4 → R9 → R10 → R17 → R19 → R20`

R20 explicitly consumes:

> R9 immutable source authority

and requires:

> exact R4/R9/R10/R17/R19 lineage completeness and integrity

R20 also rejects current/latest identity substitution and includes missing exact R9/R10 lineage in its A0 representability audit.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Hard-chain consistency fixture

This edge is the R20-consumption-side view of hard-chain integrity already exercised from adjacent seams in prior batches. It is still useful as a capstone integration fixture rather than a new independent finding.

1. Freeze exact source S1 under R9.
2. Build artifact P1 from S1.
3. Establish complete chain S1 → P1 → O1 → L1.
4. Repository moves to S2 and a later artifact P2 is built.
5. R20 evaluating L1 continues to consume S1/P1, not current S2/P2.
6. If L1 claims S1 while its R10 segment points to P2 derived from S2, the boundary fails.
7. A valid R9 S1 snapshot cannot repair an R10/R17/R19 mismatch.
8. A valid current S2/P2 chain cannot substitute for bound historical S1/P1.
9. A governed successor lineage L2 for S2/P2 receives its own R20 decision.
10. Current repository/branch membership cannot reconcile identity disagreement.

### Cross-batch interpretation

This fixture does not create a new defect. It reinforces the same chain-integrity doctrine already tested in prior edge-specific forms, including R9/R10 and R10/R17 consistency. R20's explicit use of the term `integrity` in the exact hard-chain predicate family is the capstone expression of that requirement.

---

## Batch C-18 result

| Edge | Primary | Tags | Topology | Certification strength |
|---|---|---|---|---|
| `R16 → R11` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `UNILATERAL_DECLARATION` | operational/integration |
| `R12 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration |
| `R9 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | operational/integration |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

---

## Process notes carried forward from C-18

1. **Named ownership is not sufficient for executable deterministic remediation if the triggering condition lacks a first-class identity.** R16→R11 demonstrates a narrower representability requirement than a missing composition: the owner exists, but the correction trigger still needs canonical identity to support R11's convergence rule.
2. **Representability strengthening and composition classification remain independent.** A clean edge can still require a new identity primitive without becoming `MISSING_REQUIRED_COMPOSITION`.
3. **Capstone hard-chain review should accumulate adjacent identity fixtures rather than count each consumer-side restatement as a new defect.** Repeated seam agreement increases confidence in one chain invariant; it does not manufacture additional findings.
4. **Durable liveness identity and fresh authority must remain orthogonal.** R12 reconstruction preserves the exact occurrence and lineage; R20 separately recomputes whether that occurrence may execute now.
5. **Finding compression must never become implementation-scope compression.** Even when several fixtures validate one hard-chain invariant, every named migration surface and identity seam remains independently required for implementation closure.

---

## Phase C cumulative state after C-18

- **54 classified edges across 18 batches**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- C18 adds one required representability strengthening: canonical `Financial Reconciliation Regression Identity`
- No new primary defect classification added
- Phase C remains open
