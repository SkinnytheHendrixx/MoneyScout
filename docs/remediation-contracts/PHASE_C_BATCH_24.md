# Phase C Batch 24 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-24  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 72 edges across 24 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R4`
- `R17 → R5`
- `R7 → R12`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C24-01 — `R20 → R4`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R4: `907e44ccb1128dabb142164e713877596901c3f2`

### Endpoint source evidence

R20 explicitly consumes R4 exact Evaluation Cycle lineage and includes exact R4 lineage in its lineage-integrity predicate family. It prohibits the canonical substitution failure in which stale or bound Cycle A is replaced with current Cycle B merely to make a consequential action eligible.

R4 reciprocally owns immutable originating lineage and lineage-eligibility comparison semantics, while R20 owns the complete consequential-boundary decision. R4's explicit vocabulary checkpoint states that R20 consumes immutable lineage plus current lineage-eligibility state/identity and must not create a second "current cycle" interpretation.

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

### Ownership split

- R4 owns exact originating Evaluation Cycle identity and the semantics of whether that lineage remains eligible.
- R20 owns whether the complete exact authority set may cross the current consequential boundary.
- R20 may consume/revalidate the R4 result but may not independently invent a competing meaning for current cycle or repair stale lineage by substitution.

### Acceptance fixture

1. Cycle A produces exact authority object X.
2. X preserves exact R4 lineage A.
3. Cycle B later becomes active.
4. At an R20 boundary, the system evaluates X/A, not X plus whichever cycle is currently active.
5. If R4 determines A is stale/ineligible for that progression, R20 must not substitute B.
6. Validity of every other R20 predicate cannot repair the stale lineage.
7. Conversely, exact eligible lineage A is not itself final `ALLOW` if another R20 predicate fails.
8. Historical X/A remains intact after denial.
9. A legitimate B-scoped successor requires a new governed successor authority path.
10. `UNKNOWN` lineage where exact lineage is required fails closed rather than being converted to current B.

### Disposition

No hidden R4 semantic reimplementation was found in R20. Every lineage touchpoint consumes R4-owned exact lineage semantics rather than independently deriving authority from the currently active cycle.

No new strengthening is required.

---

## C24-02 — `R17 → R5`

**Pinned endpoint blobs**

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R5: `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929`

### Endpoint source evidence

R17 contains a dedicated R5 boundary for technical-successor commercial equivalence. If artifact `P2` replaces `P1`, continuing to use Offer `O1` requires authoritative proof that the technical change is commercially equivalent for the customer-facing offer. Where that conclusion materially depends on judgment about what the customer pays, receives, is promised, or is bound to, R5 independent confirmation applies.

R17 explicitly rejects a Builder, Release worker, or Commercial worker's own assertion of equivalence as authority to keep O1 live.

R5 supplies the generic independent-confirmation machinery:

- material conclusion → confirmation required;
- exact candidate/evidence/lineage fingerprint binding;
- `CONFIRMED`, `CHALLENGED`, `INCONCLUSIVE`;
- changed candidate/evidence invalidates prior confirmation;
- proposer cannot be sole closer.

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

R17 explicitly defines the R5 commercial-equivalence seam.

R5's complete contract clearly covers material commercial conclusions and consequential commercial authority, but it does not independently name R17, Offer-Version artifact succession, or `P1 → P2` commercial equivalence as a dedicated boundary.

The semantics are compatible, but the exact edge is substantively declared from R17's side.

### Required strengthening — exact equivalence-candidate binding

R5's generic exact-candidate fingerprint requirement supplies the mechanism but not the R17-specific identity dimensions that make the commercial-equivalence proposition complete.

The R17-specific candidate must bind the exact proposition:

`P2 relative to P1 under exact Offer O1 / customer-facing terms T1 / entitlements-promises E1 / applicable commercial fingerprint F1 is commercially equivalent for the specific authority question of whether O1 may remain authoritative.`

An implementation must not satisfy R5 by binding only an under-specified proposition such as "P2 is equivalent to P1" if the Offer/terms/entitlements that determine customer-facing materiality are omitted.

### Required fixture

1. Offer `O1` commercializes exact artifact `P1`.
2. Technical successor `P2` is proposed.
3. Commercial worker produces candidate `CE1`: P2 is commercially equivalent to P1 for continued O1 authority.
4. R5 review binds to exact `P1`, `P2`, `O1`, governing customer-facing terms/entitlements/promises, evidence snapshot, and candidate fingerprint.
5. `CONFIRMED CE1` may satisfy the equivalence predicate, subject to all other R17/R20 requirements.
6. Replace P2 with distinct successor `P3`. CE1 must not transfer.
7. Keep P2 but materially change O1's price, entitlement, promised outcome, or another relevant customer-facing term. CE1 must not silently survive that changed equivalence proposition.
8. Confirmation of "P2 works technically" is insufficient to prove commercial equivalence.
9. R6 capability verification, R10 QA success, or successful deployment cannot substitute for R5 confirmation when the equivalence judgment is material.
10. `CHALLENGED` or `INCONCLUSIVE` prevents silent O1 carry-forward.
11. If equivalence is fully reducible to authoritative deterministic frozen facts, the R5 deterministic-verifier allowance remains available rather than forcing unnecessary model judgment.
12. Failure to establish equivalence creates successor Offer `O2` rather than mutating O1's historical commercial meaning.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`.

R17 explicitly requires R5 and R5 already defines exact candidate binding. The strengthening makes the R17-specific candidate identity executable.

It is also not `UNRESOLVED_CROSS_NODE_GAP`. The normative answer is determinate: confirmation must attach to the exact commercial-equivalence proposition actually being relied upon.

### Disposition

`CONSISTENT_CONSUMPTION` with required R17-specific exact equivalence-candidate binding fixture.

---

## C24-03 — `R7 → R12`

**Pinned endpoint blobs**

- R7: `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf`
- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`

### Endpoint source evidence

R7 owns the recovered `R12 × R13 × R7` outage-recovery certification: durable obligations accumulate, the system recovers, R12/R13 restore runnable work/liveness, and R7 prevents the catch-up wave from overcommitting scarce shared resources.

R12 independently records that this compound is R7-owned, contributes durable backlog reconstruction, and states that overdue or safety-relevant work receives no emergency resource authority.

The ownership split is explicit:

- R12 owns durable scheduling/runnable occurrence;
- R7 owns scarce-resource reservation/admission.

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

### Why `CONSUMES` applies

The frozen edge direction is R7→R12, but the semantic execution flow includes R12-materialized scarce work consuming R7 admission authority.

Under the Phase C protocol, relation tags describe actual semantic relation rather than merely following declaring-edge direction.

### Required strengthening — reservation-to-occurrence identity

R7 requires exact:

`Economic Action ↔ reservation set ↔ execution attempt`

linkage.

R12 separately owns the exact logical runnable occurrence, including deterministic occurrence identity and claim/lease semantics.

Neither contract explicitly states the equality/binding rule between the R12 occurrence being admitted and the exact R7 Economic Action/reservation/execution identity receiving the reservation.

This leaves a cross-object identity seam even if both nodes are individually implemented correctly.

### Required fixture

1. Durable domain obligation `D1` exists.
2. R12 materializes exact runnable occurrence `O1`.
3. O1 requires scarce resource vector V.
4. R7 creates exact Economic Action/reservation set `RX` for the execution attempt corresponding to O1.
5. The O1↔RX/execution identity relation is durably preserved.
6. Process failure/recovery occurs.
7. R12 reconstructs or reclaims the same logical occurrence according to its deterministic rules.
8. Recovery must not create an independent O2 that can reuse RX merely because O2 belongs to D1.
9. If a legitimate successor occurrence O2 is required, its relation to O1 must be explicit and it must receive its own governed R7 admission/execution linkage where scarce execution is actually new.
10. An old reservation cannot be borrowed by a distinct occurrence merely because provider, Bet, resource pool, domain obligation, or work type matches.
11. Conversely, retry/reclaim of the same logical execution occurrence must not double-reserve the same intended exposure merely because a process claim changed.
12. If external effect may already have occurred, R8 governs replay safety; neither R12 lease expiry nor a fresh R7 reservation may manufacture permission for a blind second dispatch.
13. In an outage burst with N occurrences and capacity K, at most K obtain current R7 admission, while the remaining N-K stay durably runnable/pending rather than disappearing.
14. R7 denial does not cancel the R12 domain obligation or rewrite the occurrence as completed.
15. Later admission must still apply to the exact occurrence that remains due, not whichever scheduler row is most convenient.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`.

Both nodes explicitly compose and the R7-owned compound is already normative. The missing precision is an exact implementation-level identity bridge between two existing first-class concepts: R12 runnable occurrence and R7 Economic Action/reservation/execution linkage.

It is also not `UNRESOLVED_CROSS_NODE_GAP`: the intended result is unambiguous. Occurrence/resource linkage must be exact and non-duplicative.

### Disposition

`CONSISTENT_CONSUMPTION` with required reservation-to-runnable-occurrence identity fixture.

---

## Batch C-24 result

| Edge | Primary | Tags | Topology | Certification strength | Disposition |
|---|---|---|---|---|---|
| `R20 → R4` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean |
| `R17 → R5` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `UNILATERAL_DECLARATION` | operational/integration | required exact commercial-equivalence candidate-binding fixture |
| `R7 → R12` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/joint-fixture | required reservation-to-runnable-occurrence identity fixture |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

The open `UNRESOLVED_CROSS_NODE_GAP` set remains:

1. `R11 → R8` / C21-03: normative disposition of `EXPOSURE_COMMITTED_UNRECONCILABLE`

---

## Process notes carried forward from C-24

1. **Generic exact-binding machinery still requires domain-specific candidate composition.** R5 can define how exact confirmation works without knowing which R17 dimensions make one commercial-equivalence proposition complete.
2. **Two well-specified identity systems can still lack their correspondence rule.** R12 occurrence identity and R7 action/reservation/execution identity are each strong locally, but cross-object equality must still be explicit.
3. **Fixture-tier strengthening remains the right disposition when the intended semantic answer is already determinate.** Missing executable identity glue is not automatically missing composition or unresolved design.
4. **Capstone consumption must not reimplement upstream semantics.** R20 may consume R4 lineage eligibility but cannot derive a competing current-cycle meaning.
5. **Adjacent findings can expose layered risk without collapsing into one defect.** C23-03 ensures occurrence continuity across handoff; C24-03 ensures resource linkage follows that exact occurrence rather than drifting independently.

---

## Phase C cumulative state after C-24

- **72 classified edges across 24 batches**
- **91 unclassified frozen edges remain**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C24 adds two required fixture-tier strengthenings
- C24 adds no new primary defect classification
- Implementation authority remains suspended
- Phase C remains open