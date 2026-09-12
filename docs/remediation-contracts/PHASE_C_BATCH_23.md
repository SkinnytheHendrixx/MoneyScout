# Phase C Batch 23 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-23  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 69 edges across 23 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R19`
- `R9 → R17`
- `R12 → R14`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C23-01 — `R20 → R19`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`

### Endpoint source evidence

R20 names R19 complete immutable commercial lineage as one of the upstream authorities it consumes. Its core separation is explicit:

- R17 owns what commercial authority object exists;
- R19 owns where that authority came from and which immutable lineage it belongs to;
- R20 owns whether that exact authority may be consumed now.

R20 further states that a complete lineage may still fail current eligibility, and conversely that current eligibility cannot cure incomplete lineage by substituting newer or current identities. It explicitly forbids replacing frozen lineage `L1` with current lineage `L2` merely to regain eligibility.

R19 reciprocally owns complete immutable historical lineage and states that R20 separately determines whether that exact frozen lineage remains eligible at the relevant boundary or adoption moment. R19 also prohibits post-hoc authority from retroactively legitimizing a prior unauthorized effect.

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

### Ownership and non-substitution

`OWNERSHIP_BOUNDARY` and `PARALLEL_NOT_MERGED` are independently justified.

- `OWNERSHIP_BOUNDARY`: R19 owns complete immutable lineage; R20 owns current boundary-time eligibility.
- `PARALLEL_NOT_MERGED`: complete historical lineage and current eligibility are separate predicates, and neither may substitute for or repair the other.

This reverse declared edge adds independent evidentiary value beyond the earlier `R19 → R20` classification because R20's own declaring contract independently preserves the same boundary rather than relying on R19 to describe it on R20's behalf.

### Bidirectional non-substitution fixture

1. R19 freezes complete lineage `L1`.
2. Every historical segment of `L1` is internally valid.
3. R20 initially finds `L1` eligible for operation class X.
4. A later governing condition changes, such as Offer revocation, capability-binding invalidation, resource authority loss, or required evidence becoming stale.
5. R20 must deny the later boundary while preserving `L1` exactly as historical truth.
6. A new valid/current lineage `L2` must not replace `L1` merely to make the action eligible.
7. Conversely, make `L1` internally incomplete or inconsistent while all present-day R20 conditions would otherwise permit the action.
8. R20 must not use current eligibility to manufacture lineage completeness.
9. A later corrected/successor lineage receives its own R19 identity and its own R20 decision.
10. If an effect already happened without required authority, later-valid `L2` must not retroactively authorize that earlier effect.

### Disposition

No new strengthening is required. The edge is a clean reciprocal capstone seam and contributes directly to final hard-chain synthesis.

---

## C23-02 — `R9 → R17`

**Pinned endpoint blobs**

- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`
- R17: `16a234e897fe6e119392707a7187a3232f0fd972`

### Endpoint source evidence

R9 explicitly names the hard chain:

`R4 → R9 → R10 → R17 → R19 → R20`

and states that R17's exact Offer Version must ultimately bind to the production artifact/release derived from the exact authorized source rather than a current Asset or current branch. R9 itself does not create commercial authority.

R17 reciprocally states that it must inherit immutable source/build authority through the exact R9 Build Source Snapshot lineage, and states explicitly:

> R17 does not redefine R9. It consumes its exact source lineage through R10.

R17 separately binds the exact R10 production Artifact Version and Release into the Offer Version.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

`CONSUMES` is intentionally withheld.

### Why `CONSUMES` is withheld

The governing mediation is explicit rather than inferred:

`R9 source authority → R10 exact artifact derivation → R17 commercial authority`

R17's own phrase "consumes its exact source lineage through R10" confirms that the relation is consumption-through-a-mediator rather than direct R17 consumption of an independently resolved R9 object.

Adding a second direct R9 resolution path inside R17 would create unnecessary equality-drift risk and would weaken the positive single-reference mediation pattern already established at C19-03.

### Hard-chain skip-link fixture

1. Freeze R9 source snapshot `S1`.
2. Build R10 artifact `P1` from exact `S1`.
3. Create R17 Offer `O1` around exact `P1`.
4. Repository later moves to `S2`; later artifact `P2` is produced.
5. `O1` must continue tracing through `P1 → S1`.
6. R17 must not query current repository/source state and attach `S2`.
7. Substitute `P2` into an otherwise valid `O1`.
8. The Offer must fail same-path consistency because the exact Artifact segment no longer traces through the source authority that produced the original commercialized path.
9. Same repository, Product, Opportunity, or current Asset status cannot repair the mismatch.
10. A legitimate `S2 → P2` commercial successor receives its own Offer Version.

### Cross-batch dependency

This edge does not create a duplicate strengthening.

Its implementation certification depends on already-established requirements, especially:

- C12's R9/R10 source-artifact consistency fixture inside R19; and
- C22-01's R17 composite same-path consistency strengthening.

A newly classified skip-link may remain clean because previously established adjacent/composite fixtures already make the required consistency executable. The audit should cross-reference those requirements rather than restate them as independent defects.

### Disposition

Clean mediated hard-chain skip-link. No new defect or independent strengthening is created.

---

## C23-03 — `R12 → R14`

**Pinned endpoint blobs**

- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`
- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`

### Endpoint source evidence

R12 owns durable scheduling/execution-occurrence semantics and explicitly distinguishes the domain obligation from the runnable occurrence. It requires future work, claimed work, reconstructible work, and retry-eligible work to survive process failure without duplicate logical occurrences.

R14 has a dedicated R12 boundary:

> R12-owned due/runnable obligations must not disappear because the incumbent scheduler or executor is being replaced.

R14 requires the successor to observe/reconstruct the exact durable obligations that remain valid after handoff, forbids process-local queue state from becoming the authoritative handoff list, requires explicit dispositions for in-flight work, and includes ability to observe R12 durable obligations in the successor compatibility predicate.

Complete-source adversarial review found no explicit R14 commitment to preserve:

- canonical R12 execution-occurrence identity;
- claim/lease identity continuity;
- explicit predecessor/successor occurrence linkage.

R14's generic "work item" disposition vocabulary therefore does not by itself prove preservation of R12's two-layer obligation/occurrence model through handoff.

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

### Why topology is unilateral

R12 names R14 in its E2E composition set, but it does not contain an R14-specific semantic handoff boundary comparable to R14's dedicated R12 section.

R14 independently specifies the preservation requirement in depth. That supports the edge and operational certification while remaining unilateral at the checked seam.

### Required strengthening — execution-occurrence continuity through handoff

The durable domain obligation and the runnable execution occurrence are distinct R12 objects/semantics. Preserving only the domain obligation is insufficient if runtime replacement can accidentally materialize a second logical occurrence for work whose existing occurrence has not reached authoritative completion.

Required invariant:

> **R14 replacement must preserve or deterministically converge the exact R12 runnable-occurrence/claim history associated with a transferred durable obligation. Discovering the same domain obligation on the successor is not sufficient if the handoff can create a second logical occurrence while an earlier occurrence remains claimed, in flight, unresolved, or replay-sensitive.**

### Required fixture

1. Domain obligation `D1` exists durably.
2. R12 materializes exact runnable occurrence `O1`.
3. Incumbent claims `O1`.
4. R14 replacement begins before `O1` has authoritative completion.
5. Persist the exact claim/in-flight state needed to classify `O1` during handoff.
6. The successor must not create independent logical occurrence `O2` merely because its own process never saw the original claim.
7. If `O1` is safely transferable pending work, handoff/reconstruction converges on the same logical occurrence identity or an explicitly governed successor-occurrence relationship defined by R12.
8. If `O1` may have crossed an external boundary, R8 reconciliation semantics govern; replacement cannot convert scheduler uncertainty into a fresh execution.
9. If the old claim expires during replacement, lease expiry alone cannot authorize duplicate consequential execution.
10. If `D1` became paused, completed, superseded, or terminated, neither old `O1` nor reconstructed work executes merely because it exists in scheduler history.
11. Incumbent and successor must never both obtain valid claim/execution authority over the same logical occurrence after the authority epoch transfers.
12. Restart during the handoff still converges on one domain obligation and one valid runnable-occurrence path.

### Calibration

This is **not** `MISSING_REQUIRED_COMPOSITION`.

R14 explicitly consumes R12's durable-obligation model and gives handoff responsibility a representational and ownership home. The missing precision is one layer lower, at execution-occurrence/claim continuity.

This is also not `UNRESOLVED_CROSS_NODE_GAP`. Complete tracing already determines the required outcome: replacement must not duplicate durable work. The missing detail is executable enforcement of that determinable rule.

### Disposition

`CONSISTENT_CONSUMPTION` with required occurrence/claim-continuity handoff strengthening.

---

## Batch C-23 result

| Edge | Primary | Tags | Topology | Certification strength | Disposition |
|---|---|---|---|---|---|
| `R20 → R19` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean reciprocal capstone seam |
| `R9 → R17` | `CONSISTENT_CONSUMPTION` | `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean mediated skip-link; existing cross-batch fixtures govern |
| `R12 → R14` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `UNILATERAL_DECLARATION` | operational/integration | required occurrence/claim-continuity strengthening |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

The open `UNRESOLVED_CROSS_NODE_GAP` set remains:

1. `R11 → R8` / C21-03: normative disposition of `EXPOSURE_COMMITTED_UNRECONCILABLE`

---

## Process notes carried forward from C-23

1. Reciprocal directed edges must be independently earned. Reverse-direction classification can strengthen bilateral corroboration even when the semantic invariant is the same.
2. Consumption-through-a-mediator is not direct `CONSUMES`. Explicit mediation wording should be honored rather than flattened into a generic relation tag.
3. Established fixtures should be reused by dependency rather than duplicated from every later skip-link that depends on them.
4. Preserving a domain obligation is not automatically preservation of its runnable execution occurrence. Handoff certification must protect both layers where R12 deliberately distinguishes them.
5. Claim/lease expiry remains a scheduler fact, not replay authority. Replacement must not turn occurrence uncertainty into duplicate consequential work.
6. A clean reciprocal or skip-link edge contributes evidence to final compound certification but does not replace the later six-node synthesis.

---

## Phase C cumulative state after C-23

- **69 classified edges across 23 batches**
- **94 unclassified frozen edges remain**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C23 adds one required occurrence/claim-continuity strengthening at R12→R14
- C23 adds no new primary defect classification
- Phase C remains open