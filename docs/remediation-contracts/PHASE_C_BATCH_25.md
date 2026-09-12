# Phase C Batch 25 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-25  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 75 edges across 25 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R9`
- `R18 → R11`
- `R16 → R15`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C25-01 — `R20 → R9`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`

### Endpoint source evidence

R20 explicitly lists `R9 immutable source authority` among the upstream authorities it consumes. Its required predicate families separately require exact `R4/R9/R10/R17/R19` lineage completeness and integrity, and its governing anti-substitution rule prohibits replacing any bound historical authority segment with whatever source identity is current now.

R9 reciprocally names the full hard chain:

`R4 → R9 → R10 → R17 → R19 → R20`

and states that final certification must compose with R20 where relevant. R9 also requires governed successor Build/source attempts to remain subject to R20 boundary-time authority checks.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Why `CONSUMES` is direct here

This differs from C23-02 (`R9 → R17`), where R17 explicitly stated that it consumes R9 source lineage **through R10**.

R20 makes a direct claim about itself: it consumes R9 immutable source authority and validates exact R9 lineage integrity as part of its complete boundary predicate set. The existence of R10/R17/R19 as hard-chain mediators does not erase R20's independent capstone obligation to validate the exact R9 segment of the composed authority path.

### Acceptance fixture

1. R9 freezes source snapshot `S1`.
2. R10 builds artifact `P1` from S1.
3. R17/R19 produce a coherent downstream commercial lineage ultimately containing S1.
4. Repository later advances to `S2`.
5. At an R20 boundary for the original lineage, R20 evaluates the exact S1-bound path.
6. Current S2 cannot replace S1.
7. Make every later segment individually valid but alter the historical source segment to S2.
8. Boundary validation must fail lineage integrity even if P1/O1/L1 otherwise appear usable.
9. Conversely, exact valid S1 does not itself produce `ALLOW` if another R20 predicate fails.
10. A legitimate S2 successor path must acquire its own downstream artifact/Offer/lineage identities rather than repairing the old path in place.
11. `SOURCE_AUTHORITY_UNPROVEN` cannot become acceptable merely because R10/R17/R19 downstream objects exist.
12. R20 must not independently reinterpret branch/HEAD semantics; R9 remains owner of source-authority meaning.

### Calibration

No new strengthening is required.

The executable same-path/source-identity requirements are already covered by the combined existing contract set and earlier Phase C fixtures, including C19-03, C22-01, and C23-02. Adding another source-path strengthening here would duplicate existing requirements rather than close a distinct seam.

### Disposition

Clean direct capstone consumption of an otherwise hard-chain-mediated source-authority segment.

---

## C25-02 — `R18 → R11`

**Pinned endpoint blobs**

- R18: `226d67276f1627c26045ead9c7717023e7e764db`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Endpoint source evidence

R18 contains an explicit R11 boundary:

- R18 detects an invalid capability binding;
- R11 owns corrective successor disposition;
- capability failure may justify a successor but does not authorize in-place substitution;
- any successor receives its normal R7/R8/R20 gates.

R18 repeatedly routes lifecycle/binding failures into governed successor/rebinding rather than silently substituting a healthier current provider/account.

R11 independently defines capability corrective work. It requires preservation of the exact capability claim/binding/provenance and forbids turning a single execution failure into a generic capability rejection or silently substituting another provider/account.

However, R11's current per-class completion predicate states:

> **capability-resume obligation:** R6 proves the exact required capability claim/state for the governed scope.

R11 does not contain a dedicated R18-specific completion predicate. That leaves a material distinction under-specified: R6 readiness/verifier sufficiency and R18 exact-binding eligibility are separate facts.

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

- R18 owns whether exact frozen binding `B1` remains eligible and why it failed.
- R11 owns the durable corrective obligation resulting from that failure.
- R11 already preserves exact binding/provenance and cannot reinterpret `B1 invalid` as permission to substitute current `B2`.
- R18 cannot itself choose or execute the corrective successor merely because it detected the problem.

### Required strengthening — R18-specific corrective-completion predicate

When an R11 capability-corrective obligation originates from an R18 binding-eligibility failure, completion must prove that the exact applicable R18 binding condition has been resolved for the relevant operation scope.

> **R6 capability-readiness proof alone is insufficient to close an R11 obligation whose originating failure is R18 binding ineligibility.**

This strengthening does not add a new identity-preservation requirement; R11 already preserves exact capability claim/binding/provenance. The missing precision is specifically the completion predicate.

### Required fixture

1. Execution X freezes exact capability binding `B1`.
2. R6 originally proves B1's capability claim sufficiently strong.
3. R18 later rejects B1, for example with `BINDING_REVOKED`, `PROVIDER_ACCOUNT_MISMATCH`, `BINDING_QUARANTINED`, or another ineligible disposition.
4. R11 owns the corrective obligation and preserves X/B1 plus the exact R18 failure disposition.
5. Later R6 again reports the logical capability `AUTOMATION_READY`.
6. The R11 obligation must remain open if B1 is still R18-ineligible.
7. If the intended resolution is restoration of B1, completion requires a current qualifying R18 result for that exact B1 and relevant operation class.
8. If the intended resolution instead authorizes B2, that is an explicit rebinding/successor path; B2 readiness does not retroactively make the B1 obligation fixed.
9. Same provider with a different account does not satisfy the B1 corrective obligation unless governed rebinding creates successor authority.
10. R11 completion must distinguish `R6 verification repaired` from `R18 binding eligibility repaired`.
11. Any successor consequential execution still passes R7/R8/R20 independently.
12. Historical B1 failure remains preserved after corrective closure.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`.

R18 explicitly hands corrective successor ownership to R11, and R11 explicitly preserves exact capability claim/binding/provenance. Composition and ownership are present. The gap is in a downstream completion predicate, not in the relationship itself.

It is also not `UNRESOLVED_CROSS_NODE_GAP`. The normative answer is determinate: an R18-originating failure cannot be considered repaired merely because R6 proves generic capability readiness while the exact frozen binding remains ineligible.

### Disposition

`CONSISTENT_CONSUMPTION` with required R18-specific corrective-completion strengthening.

---

## C25-03 — `R16 → R15`

**Pinned endpoint blobs**

- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`
- R15: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

### Endpoint source evidence

R16 opens by stating that it is the interpretation/reconciliation half of the same `C3-F4` root split with R15:

- R15 preserves provider-originating observations;
- R16 consumes the complete immutable R15 observation set;
- R16 deterministically derives canonical financial state under a versioned reconciliation policy;
- R16 must not absorb R15 capture responsibility.

R16's dedicated R15 boundary requires consumption of exact provider/account/execution provenance, value-shape distinctions, redaction provenance, original currency/unit, temporal fields, and provider-native/synthetic identities where relevant.

R15 independently states the reciprocal boundary:

- R15 captures immutable evidence;
- R16 interprets the full evidence set;
- R15 must not decide absolute/delta/cumulative/reversal/final canonical meaning;
- R16 may derive new state but may not mutate the R15 evidence layer.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/joint-fixture

### Core invariant

Observation truth and interpreted financial truth are separate monotonic layers.

R15 answers what the provider actually reported, with exact provenance.

R16 answers what canonical financial state follows from the complete immutable observation set under reconciliation policy V.

Neither layer may impersonate or overwrite the other.

### Acceptance fixture

1. Provider produces raw observation `F1`, captured by R15 with exact execution/provider/account provenance.
2. R15 preserves original value shape, currency/unit, provider timing, observation identity, and raw qualifier.
3. R16 consumes F1 under policy V1.
4. Provider later produces correction/final observation `F2`.
5. R15 appends F2; it does not overwrite F1.
6. R16 recomputes from complete set `{F1,F2}` under V1.
7. Arrival order `[F1,F2]` and `[F2,F1]` must produce the same canonical result.
8. Reprocessing duplicate F1 must not double-count it.
9. A policy change V1→V2 may produce different canonical interpretation while F1/F2 remain unchanged historical observations.
10. R16 may not rewrite F1 or F2 merely because V2 changes canonical meaning.
11. `REPORTED_ZERO`, `FIELD_ABSENT`, `REPORTED_NULL`, `UNPARSEABLE`, or governed redaction provenance must survive into R16 as distinct evidence semantics.
12. R16 must preserve exact provider/account/execution scope from R15 rather than reconciling against current provider/account state.
13. R15 must not pre-normalize cumulative/delta/reversal meaning in a way that removes R16's ability to apply the correct policy.
14. R16 unresolved/conflicting interpretation must remain unresolved rather than causing R15 evidence to be discarded or fixed.

### Calibration

No new strengthening is required.

The exact consumption contract already names the complete immutable observation set, exact provenance dimensions, immutable/raw versus derived-state separation, policy versioning, deterministic replay, append-not-overwrite correction semantics, value-shape distinctions, redaction provenance, and provider-native/synthetic identity.

### Disposition

Clean raw-evidence → deterministic-reconciliation ownership boundary.

---

## Batch C-25 result

| Edge | Primary | Tags | Topology | Certification strength | Disposition |
|---|---|---|---|---|---|
| `R20 → R9` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean |
| `R18 → R11` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration | required R18-specific corrective-completion strengthening |
| `R16 → R15` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/joint-fixture | clean |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

The open `UNRESOLVED_CROSS_NODE_GAP` set remains:

1. `R11 → R8` / C21-03: normative disposition of `EXPOSURE_COMMITTED_UNRECONCILABLE`

---

## Process notes carried forward from C-25

1. **Direct capstone consumption can coexist with hard-chain mediation.** An upstream identity may be carried through intermediary nodes while still being named as a direct predicate by the capstone consumer.
2. **Preserving the failed object is not the same as defining corrective completion.** Exact identity/provenance can survive correctly while the completion predicate still closes on the wrong upstream fact.
3. **Completion predicates must match the semantic class of the originating failure.** R6 verifier sufficiency cannot close an R18 binding-eligibility failure unless the applicable R18 condition is also resolved.
4. **Composition present + ownership present + completion precision missing remains fixture-tier strengthening.** Missing relationship/owner is the escalation threshold for `MISSING_REQUIRED_COMPOSITION`, not every missing executable predicate.
5. **Raw evidence and derived canonical truth remain independent monotonic layers.** Correcting interpretation never licenses rewriting the evidence that was interpreted.

---

## Phase C cumulative state after C-25

- **75 classified edges across 25 batches**
- **88 unclassified frozen edges remain**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C25 adds one required fixture-tier strengthening
- C25 adds no new primary defect classification
- Implementation authority remains suspended
- Phase C remains open