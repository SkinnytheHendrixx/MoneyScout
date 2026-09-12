# Phase C Batch 32 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-32  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 96 edges across 32 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R18 → R6`
- `R19 → R10`
- `R12 → R11`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — Test B = no redirects the binding target; it does not end the inquiry

The standing exact-record framework is now refined as follows.

1. **Causal / parallel-truth diagnostic:** would the downstream fact still need to exist unchanged if the upstream record never existed or were invalid?
2. **Adjudication-layer diagnostic:** does the upstream node produce a distinct authoritative adjudication/decision/disposition record separate from the underlying object/evidence?

If Test B is **yes**, the exact adjudication record must be durably bound when it is causally load-bearing, unless either:

- the upstream contract itself folds the adjudication chain into the canonical identity object's required semantics/fields; or
- the downstream contract explicitly requires an exact pointer to that separate upstream adjudication record.

If Test B is **no**, the inquiry does **not** stop. The reviewer must still ask whether the downstream record durably binds the exact upstream authoritative object/version it represents.

> **No separate adjudication layer means “bind the authoritative object itself precisely,” not “nothing more to bind.”**

This distinction prevents the framework from missing cross-object identity gaps merely because the upstream authority is already a plain durable domain object rather than a separate decision record.

---

## C32-01 — `R18 → R6`

**Pinned endpoint blobs**

- R18: `226d67276f1627c26045ead9c7717023e7e764db`
- R6: `d4d613a40eed187c230d55f7e21b1b0251bf612a`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / capability-binding authority

### Endpoint source evidence

R18 consumes exact R6 capability verification authority when it freezes a Capability Binding Snapshot. R18's canonical field set explicitly includes `verificationPolicyVersion`, `verificationResultId`, `verificationStrength`, access level, exact claim, provider/account identity, verification/expiry times, provenance, and fingerprint.

R18's Capability Binding Validation Record likewise includes the applicable `r6VerificationResult` while preserving operation-specific binding/lifecycle adjudication.

R6 separately owns verifier sufficiency and the canonical Verification Result object.

### Two-test framework

**Test A — causal / parallel truth:** Would an R18 binding snapshot representing R6-confirmed authority remain the same authority if its qualifying R6 Verification Result never existed or were invalid? **No.** The R6 result is load-bearing.

**Test B — adjudication layer:** Does R6 produce a distinct authoritative adjudication record? **Yes.** Its Verification Result is a distinct canonical result.

The exact-record requirement is already satisfied directly: R18 contractually requires the exact `verificationResultId` inside the Capability Binding Snapshot and carries the applicable R6 result through validation.

### Positive-control significance

This edge is a direct positive control for the standing framework. The same check that finds missing specific-record bindings elsewhere correctly returns clean where the corpus already names the exact upstream adjudication record explicitly.

The required distinction is structural:

- C31-02 / R10: the upstream contract folds adjudication linkage into its own canonical identity;
- C32-01 / R18: the downstream contract explicitly embeds a pointer to the separate upstream adjudication record.

Both are sufficient. Generic node-level provenance would not be.

### Required fixture

1. R6 evaluates claim C1 under policy V1 and creates `VR1 = PASS`.
2. R18 freezes binding B1 with exact `verificationResultId = VR1`.
3. A later R6 result VR2 exists for the same logical capability key.
4. Current readiness cannot silently rewrite B1 onto VR2.
5. A result proving read access cannot support a B1 whose required claim is write/operation-X.
6. Policy strengthening after B1 is frozen follows R18's explicit recheck/reverification semantics rather than substituting current capability state.
7. A later qualifying VR3 creates new/revalidated authority only through governed R18 semantics; it does not erase B1/VR1 history.
8. Same provider with a different account remains a different binding where account identity is material.
9. R18 validation records remain attributable to the exact R6 result they evaluated.
10. R20 consumes R18's operation-specific disposition and does not independently reinterpret raw R6 evidence.

### Disposition

Clean direct consumption. No strengthening required.

---

## C32-02 — `R19 → R10`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** hard-chain historical lineage

### Endpoint source evidence

R19's canonical path explicitly includes `R9 Build Source Snapshot / Build → R10 Artifact Version → production Release / Asset → R17 Offer Version`.

Its Commercial Authority Lineage Reference must bind the exact R10 Artifact Version and production Release/deployment identity.

R10's own canonical Artifact Version identity is required to prove exact QA verification linkage, exact Release linkage, and exact production deployment/adoption linkage.

### Two-test framework

**Test A — causal / parallel truth:** Would commercial lineage L1 remain the same complete lineage if its exact R10 artifact/release never existed or were invalid? **No.** R10 identity is load-bearing.

**Test B — adjudication layer:** Does R10 have adjudication layers beyond bare artifact identity? **Yes.** QA/Release/adoption decisions exist.

The canonical-identity exception applies because R10's own governing contract explicitly folds those adjudication linkages into the canonical Artifact Version identity. R19 additionally binds exact Artifact Version plus production Release/deployment.

### Required fixture

1. R10 creates Artifact Version P1 from Build B1.
2. P1 carries exact QA linkage and exact Release R1.
3. R19 freezes L1 with exact P1/R1.
4. Later P2/R2 becomes current production.
5. L1 remains P1/R1.
6. Same Asset/repository/product cannot substitute P2 for P1.
7. R17 O1 bound to P1 must compose with the same P1 in L1.
8. O1/P1 combined with an R10 segment naming P2 fails composite consistency.
9. Current deployment cannot repair that mismatch.
10. Legacy reconstruction remains unproven where exact P1/R1 cannot be uniquely established.
11. R20 separately determines current eligibility of L1.
12. P1 historical validity survives later P2 succession.

### Disposition

Clean hard-chain consumption. No strengthening required.

---

## C32-03 — `R12 → R11`

**Pinned endpoint blobs**

- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational / joint-fixture

### Endpoint source evidence

R12 explicitly separates the domain obligation from its scheduler occurrence:

- R11 owns what corrective obligation exists and why;
- R12 owns when/how a durable runnable occurrence exists for it;
- the scheduler job is not the corrective obligation itself;
- repeated recovery must converge on one logical execution occurrence;
- process death between blocker detection and runnable materialization must not orphan corrective work or duplicate the successor.

R11 independently defines each Corrective Obligation as a durable immutable historical object. Material changes to scope, target, authority, or completion conditions create an explicit successor/version rather than silently mutating the original.

The relationship is clear, but neither contract explicitly requires the R12 runnable occurrence record/history to bind the exact immutable R11 obligation identity/version it represents.

### Two-test framework

**Test A — causal / parallel truth:** Would an R12 corrective-work occurrence E1 still need to exist unchanged if its R11 obligation O1 never existed? **No.** For this work class, O1 is the domain reason E1 exists.

**Test B — adjudication layer:** Does R11 require a second generic adjudication record separate from the Corrective Obligation object for this scheduling relationship? **No.** The Corrective Obligation is itself the authoritative durable domain object.

Under the standing refinement, Test B = no redirects the requirement to the exact object/version itself rather than ending the inquiry.

### Required strengthening — exact R11 obligation/version ↔ R12 runnable-occurrence identity

For every R12 runnable occurrence materialized from an R11 corrective obligation, the occurrence/history must durably bind the exact immutable R11 obligation identity/version whose execution it represents.

The reverse relationship must also be auditable: given R11 obligation O1, the system must be able to enumerate the current and historical R12 occurrence(s) materialized for O1 under governed retry, continuation, cancellation, supersession, and reconstruction semantics.

> **R12 must preserve not merely that corrective work of this kind is due, but which exact immutable R11 obligation this runnable occurrence is executing.**

### Why reverse traceability is required, not optional

R11 §7 already requires repeated evaluation/recovery to converge on the same corrective obligation identity rather than emitting duplicate corrective work.

That correctness property is not auditable unless the system can enumerate which R12 occurrences were materialized for a given exact obligation. Without reverse traceability, a reviewer cannot prove whether recovery converged correctly, silently duplicated work, or attached an occurrence to the wrong but similar obligation.

Therefore the reverse mapping is not an additional convenience requirement. It supplies the durable evidence needed to test an already-existing R11 convergence invariant.

### Required fixture

1. R11 creates immutable corrective obligation O1.
2. R12 materializes runnable occurrence E1 for exact O1.
3. E1 durably binds O1 identity/version.
4. A second R11 obligation O2 exists with the same corrective class, same target Asset, and similar evidence.
5. E1 cannot become attributable to O2 merely because fields overlap.
6. Process dies after O1 exists but before E1 materialization.
7. Recovery deterministically materializes E1 for O1 rather than an unbound generic repair job.
8. Repeated recovery converges on the same logical occurrence.
9. Given O1, audit can enumerate every R12 occurrence historically materialized for O1 and prove no duplicate logical successor escaped convergence.
10. O1 is materially superseded by O1v2.
11. Existing E1 remains historically attributable to O1v1; O1v2 follows governed successor/cancellation/materialization semantics rather than mutating E1's domain identity.
12. Claim/lease expiry may create governed retry/continuation behavior but cannot change which R11 obligation is being executed.
13. Completion history remains attributable to exact O1/O1v1 as applicable.
14. If O1 becomes cancelled/terminal/superseded, stale E1 cannot execute merely because it remains queued.
15. R12 occurrence identity does not become R11 domain authority: scheduler state cannot broaden O1's corrective scope.
16. Consequential work still passes R7/R8/R20 as applicable.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R11/R12 ownership and composition are explicit.

It is not an adjudication-record strengthening: no extra generic R11 decision object should be invented.

The missing requirement is exact cross-object identity correspondence between the authoritative R11 Corrective Obligation and the R12 runnable occurrence that operationalizes it.

### Disposition

`CONSISTENT_CONSUMPTION` with required fixture-tier strengthening.

---

## Batch C-32 result

- `R18 → R6`: clean; exact R6 Verification Result already explicitly bound by `verificationResultId`.
- `R19 → R10`: clean hard-chain consumption; R10 canonical identity carries its QA/Release/deployment lineage.
- `R12 → R11`: required exact R11 obligation/version ↔ R12 runnable-occurrence identity and reverse-traceability strengthening.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. No second `UNRESOLVED_CROSS_NODE_GAP` is added.

The standing exact-record framework now explicitly handles all three cases:

1. separate adjudication record exists → bind it when causally load-bearing;
2. adjudication is contractually folded into canonical identity or explicitly pointer-bound downstream → no redundant extra pointer;
3. no separate adjudication layer exists → still bind the exact authoritative upstream object/version represented by the downstream record.
