# Phase C Batch 31 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-31  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 93 edges across 31 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R11 → R6`
- `R17 → R10`
- `R20 → R15`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — canonical identity may satisfy adjudication binding only when the contract folds adjudication into that identity

The exact-authoritative-record-binding rule now has a further explicit boundary.

An upstream node's canonical identity may satisfy the otherwise-separate adjudication-record binding requirement **only when that upstream node's own governing contract explicitly makes the adjudication chain part of the canonical identity object's required semantics/fields**.

This exception does **not** apply merely because adjudication records happen to exist in the same subsystem, database, implementation, or object graph.

> **Contractual folding, not implementation proximity, is what makes a canonical identity sufficient to carry adjudication provenance.**

Examples:

- R10 qualifies for this exception because its canonical Artifact Version identity is expressly required to carry exact QA verification linkage, exact Release linkage, and exact production deployment/adoption linkage.
- R6 does not qualify: its Verification Result is a distinct adjudication object separate from the capability claim.
- R9 does not qualify where the specific routing/adjudication decision is separate from the frozen source authority.
- R14 does not qualify where the specific handoff/non-convergence disposition is separate from runtime/handoff identity.

The existing two-test framework still applies first:

1. **Causal / parallel-truth diagnostic:** would the downstream fact still need to exist unchanged if the upstream record never existed or was invalid?
2. **Adjudication-layer diagnostic:** does the upstream node produce a distinct authoritative adjudication/decision/disposition record separate from the underlying object/evidence?

Where Test B is yes, a canonical identity avoids an additional direct adjudication pointer only if the upstream contract itself folds that adjudication chain into the identity object.

---

## C31-01 — `R11 → R6`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R6: `d4d613a40eed187c230d55f7e21b1b0251bf612a`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R11 consumes R6 at two distinct lifecycle moments.

First, capability-readiness failure can create corrective work: retry verification, acquire a prerequisite, or adjudicate a blocked capability claim.

Second, R11's explicit completion predicate for a capability-resume obligation is that R6 proves the exact required capability claim/state for the governed scope.

R6 has a distinct canonical adjudication object. Its Verification Result binds, where applicable, exact capability identity, provider, verifier identity/type/version, evidence/proof, verified claim, maximum access justified, verification/expiry times, PASS/FAIL/UNKNOWN result, and policy version.

R11 already preserves the exact capability claim/binding/provenance, but that is not equivalent to preserving the exact R6 adjudication records that opened and closed the obligation.

### Two-test framework

**Test A — causal / parallel truth:** Would the R11 capability-corrective obligation exist unchanged if the applicable R6 failure/adjudication never existed or were invalid? **No.** Where R6 failure creates the obligation, that result is causally load-bearing. Likewise, authoritative completion requires a later qualifying R6 result.

**Test B — adjudication layer:** Does R6 produce a distinct authoritative adjudication record beyond the capability object/raw evidence? **Yes.** The Verification Result is explicitly separate and authoritative.

The canonical-identity exception does not apply because R6 does not contractually fold the Verification Result into the capability identity itself.

### Required strengthening — exact R6 origin-result and completion-result binding

For R11 obligations whose creation or completion depends on R6, obligation history must durably bind the exact relevant R6 Verification Result identity/fingerprint.

Two distinct bindings are required:

1. **Origin binding:** the exact R6 Verification Result/disposition that established the capability failure or unresolved/non-ready state that caused the obligation.
2. **Completion binding:** the exact later R6 Verification Result that satisfied the obligation's capability-resume completion predicate.

> **The failed claim identifies what required correction. The exact R6 results identify which adjudications opened and closed the corrective obligation.**

### Required fixture

1. Capability claim C1 is evaluated by R6 under policy V1.
2. R6 produces `VR1 = FAIL` or another qualifying unresolved/non-ready result.
3. R11 creates capability corrective obligation O1.
4. O1 durably binds exact C1 and exact VR1.
5. Later unrelated verification result VR2 exists for the same capability key but different provider/scope/policy/claim.
6. VR2 cannot replace O1's originating provenance.
7. Corrective work occurs.
8. R6 evaluates the exact required claim/scope again and creates `VR3 = PASS` sufficient for the required access level.
9. O1's completion history binds VR3 specifically as the result satisfying the R6 completion predicate.
10. A generic `AUTOMATION_READY=true` or current capability status cannot substitute for VR3.
11. A PASS proving read access cannot close an obligation requiring write/operation-X capability.
12. If policy version changes, an old VR3 cannot silently satisfy a new stronger requirement.
13. If VR3 is later found mismatched to the wrong account/scope, every R11 closure relying on it can be identified exactly.
14. Human-attestation prerequisite completion cannot close O1 where the governing R6 policy still requires machine/provider verification.
15. R11 completion grants no execution authority; consequential resumed work separately passes R7/R18/R20.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R11 explicitly defines the R6 boundary and an R6-specific completion predicate.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the intended semantics are determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required dual exact-R6-result binding strengthening.

---

## C31-02 — `R17 → R10`

**Pinned endpoint blobs**

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** hard-chain / commercial-authority identity

### Endpoint source evidence

R17 requires every applicable Offer Version to bind the exact R10 production Artifact Version and exact production Release/deployment identity. A mutable deployment pointer or current state cannot substitute.

R10 reciprocally requires the exact artifact built, QA-verified, released, deployed, and adopted to remain one provable immutable lineage. Critically, R10's canonical Artifact Version identity is itself required to carry exact QA verification linkage, exact Release linkage, and exact production deployment/adoption linkage.

Therefore R17 is not merely binding a bare artifact ID while losing the adjudication history that made it the governed production artifact.

### Two-test framework

**Test A — causal / parallel truth:** Would R17 Offer Version authority remain fully established if its required R10 production artifact/release identity did not exist or were invalid? **No.** R10 identity is load-bearing to the Offer authority.

**Test B — adjudication layer:** Does R10 have QA/release/adoption adjudication beyond bare artifact identity? **Yes.** But R10's own contract folds those exact linkages into the canonical Artifact Version identity.

### Canonical-identity exception result

The exception applies here because the **R10 contract itself** makes QA/Release/deployment/adoption linkage constituent semantics of the Artifact Version identity.

It would not be enough that an implementation merely stores QA and Release rows nearby. The contractually required identity must itself remain capable of proving those links.

### Required fixture

1. R10 Build produces P1.
2. Exact QA verifies P1.
3. Exact Release R1 promotes/deploys P1.
4. R17 creates O1 bound to exact P1/R1.
5. P2 later becomes another valid production artifact.
6. A current deployment pointer moving to P2 cannot rewrite O1 onto P2.
7. QA PASS for P2 cannot become O1's original artifact authority.
8. If O1 is to remain usable with P2, R17 commercial-equivalence/successor rules apply.
9. Material equivalence consumes R5 where required.
10. If equivalence fails or remains unproven, successor O2 is required.
11. Historical O1 remains bound to P1/R1.
12. R20 separately determines whether O1/P1 remains currently consumable.
13. Complete R10 identity does not itself prove current R17 commercial eligibility.
14. R17 cannot reinterpret a different artifact as P1 merely because source/version labels match.

### Disposition

Clean hard-chain consumption. No strengthening required.

This reciprocal edge is independently earned and is not inherited mechanically from C07-03 (`R10 → R17`).

---

## C31-03 — `R20 → R15`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R15: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**`CONSUMES` intentionally withheld.**

**Topology:** `MEDIATED / PARALLEL_TRUTH_COMPOSITION`

**Certification dependency strength:** E2E financial-evidence/current-eligibility integration

### Endpoint source evidence

R20's direct primitive-consumption list does not name R15. Its E2E certification requires commercial/financial composition with R15/R16 where adoption or headroom consequences depend on those truths.

R15 independently owns append-only provider-originating financial observations and requires them to survive even when they are inconvenient, larger than authorized, associated with uncertain execution, or observed despite later loss of execution authority.

### Two-test framework

**Test A — causal / parallel truth:** Would R15 observation F1 still need to exist unchanged if a particular R20 boundary decision never existed or were invalid? **Yes.** Provider-originating evidence remains evidence whether the action was authorized, unauthorized, later blocked, or incorrectly allowed.

**Test B — adjudication layer:** Does R15 produce a distinct authoritative adjudication record beyond the observation itself? **No.** R15 preserves what the provider said; R16 owns interpretation.

No direct trigger-binding strengthening is therefore appropriate.

### Core invariant

R20 eligibility and R15 financial-observation truth remain independent but composable.

- R20 may deny future action without erasing F1.
- F1 may reveal economic effect after an authority failure.
- F1 does not prove the action was authorized.
- R20 `ALLOW` does not dictate what the provider actually reports.
- Raw observation may contradict expected/authorized amount and must survive unchanged.
- R16/R7/R19 mediate interpretation, resource consequences, and commercial attribution where applicable.

### Required fixture

1. Boundary decision D1 authorizes or denies operation E1 according to R20.
2. Provider interaction nevertheless yields legitimate R15 observation F1 where an external effect occurred.
3. F1 is persisted exactly as observed.
4. If D1 was `ALLOW`, F1 does not become authorization evidence; D1 already owns that authority decision.
5. If later review shows D1 should have been `DENY`, F1 remains historical financial truth.
6. If D1 was `DENY` and no boundary was crossed, no fabricated F1 is created.
7. If an unauthorized boundary was crossed despite denial/bypass, genuine F1 is still captured.
8. An overcharge is not clamped to the amount R20 expected or authorized.
9. R20 adoption denial cannot mutate `REPORTED_VALUE` into zero/absent.
10. R15 correction F2 appends; it does not rewrite D1.
11. R16 interprets F1/F2.
12. R7 decides resource/headroom consequences from authoritative downstream truth.
13. Commercial execution uses R19 to attribute observations to exact lineage.
14. Current R20 eligibility cannot erase historical provider evidence.

### Disposition

Clean mediated composition. `CONSUMES` withheld. No strengthening required.

---

## Batch result

Batch C-31 adds:

- one required fixture-tier strengthening in the established exact-record-binding family (`R11 → R6`), with separate origin-result and completion-result bindings;
- one clean reciprocal hard-chain edge (`R17 → R10`), plus a sharpened boundary for the canonical-identity exception;
- one clean mediated/parallel-truth edge (`R20 → R15`) with direct `CONSUMES` intentionally withheld.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The total remains **4**.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The total remains **1**.
