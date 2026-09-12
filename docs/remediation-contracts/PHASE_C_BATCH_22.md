# Phase C Batch 22 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-22  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 66 edges across 22 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R4 → R17`
- `R10 → R20`
- `R8 → R12`

C22 is the first batch selected under the continuous `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` rule. All three edges were mechanically confirmed `UNCLASSIFIED` before selection.

---

## C22-01 — `R4 → R17`

**Pinned endpoint blobs**

- R4: `907e44ccb1128dabb142164e713877596901c3f2`
- R17: `16a234e897fe6e119392707a7187a3232f0fd972`

### Endpoint source evidence

R4 explicitly names the commercial lineage path `R4 × R17 × R19 × R20` and requires the evaluation lineage inserted into commercial authority to be the immutable lineage that actually justified the Asset/Offer rather than whichever Evaluation Cycle is current later.

R17 reciprocates by making its canonical Offer Version a first-class composite authority object. Its required bound dimensions include, where applicable:

- exact Bet identity;
- exact originating R4 Evaluation Cycle;
- exact Product Definition / commercial product authority;
- exact R10 production Artifact Version;
- exact production Release / deployment identity;
- monetization/commercial terms and fingerprint dimensions.

R17 also explicitly prohibits reconstruction from current/latest Evaluation Cycle or mutable commercial state.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Required strengthening — composite same-path consistency

The endpoint contracts define every required first-class Offer Version field, but they do not state an explicit invariant requiring all separately bound historical dimensions to trace to the **same historical authority path**.

Individual validity is insufficient. A composite Offer must not pass merely because each referenced Bet, Evaluation Cycle, Product, Artifact Version, Release, and commercial object independently exists and is valid.

The required invariant is:

> **Every separately represented historical authority segment inside one Offer Version must be mutually consistent with the exact path that actually produced and authorized that Offer. Same-parent membership and independent validity do not establish composite-path consistency.**

This is the deliberate inverse of C19-03's positive single-reference mediation pattern. R10 can avoid redundant direct R4 fields because exact lineage is safely carried through its immutable R9 reference. R17 cannot collapse its independently meaningful commercial dimensions into one field, so the equality/compatibility relationships among those dimensions must be certified explicitly.

### Broadened adversarial fixture

The fixture must test divergence in more than the R4-cycle field so the strengthening covers the whole composite object.

**Control path**

1. Cycle A authorizes Bet B1.
2. The governed source/build path produces S1 → Artifact P1 → Release D1.
3. Offer O1 binds B1, Cycle A, P1, D1, and the exact related Product/commercial dimensions.
4. O1 passes only if those fields form one coherent historical path.

**Cycle-field divergence**

5. Cycle B later exists under the same Opportunity.
6. Malformed Offer OX binds B1/P1/D1 but independently records Cycle B.
7. Every referenced object may be individually valid and share the same Opportunity.
8. OX must fail because Cycle B is not the lineage that produced/authorized B1/P1/D1.
9. Current Cycle B cannot repair the disagreement.

**Reverse/non-cycle divergence**

10. Keep B1, S1, and Cycle A correct.
11. Produce a separate valid Artifact P2 from a different build/source path, with its own valid Release D2 where applicable.
12. Malformed Offer OY binds B1/Cycle A but substitutes P2 and/or D2 for the artifact/release actually authorized by the B1/S1 path.
13. OY must fail even though P2/D2 are individually valid and belong to the same higher-level Opportunity/Product scope.
14. The implementation must not repair the mismatch by selecting whichever artifact or Release is current.
15. A legitimate successor path receives its own coherent successor Offer Version.

The same invariant applies to any other separately first-class historical segment whose disagreement would make the Offer's authority story internally false.

### Calibration

This is **not** `MISSING_REQUIRED_COMPOSITION`. R4 and R17 explicitly compose, ownership is present, and complete tracing determines one intended semantic answer. The missing precision is executable cross-field equality/compatibility inside R17's legitimate composite representation.

It is also not an `UNRESOLVED_CROSS_NODE_GAP`: there are not multiple coherent normative readings. Mismatched historical segments must fail.

### Disposition

`CONSISTENT_CONSUMPTION` with a required composite same-path consistency strengthening and broadened multi-field mismatch fixture.

---

## C22-02 — `R10 → R20`

**Pinned endpoint blobs**

- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

### Endpoint source evidence

R10 explicitly states:

> R10 provides the immutable object/lineage identity. R20 decides whether that exact identity may still be consumed now.

R20 reciprocally consumes exact R10 artifact identity as part of its lineage-integrity predicate family and prohibits replacing bound historical artifact `P1` with current `P2`.

R20 does not independently reconstruct artifact identity. It consumes R10's exact historical expected/observed artifact truth and then evaluates current boundary eligibility separately.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Ownership split

- R10 owns exact Artifact Version identity and the Build → QA → Release → deployment/adoption lineage, including expected/observed artifact mismatch truth.
- R20 owns current boundary-time eligibility of that exact bound historical artifact lineage.

Correct artifact history cannot grant perpetual permission, and current permission cannot repair incorrect artifact history.

### Hard-chain skip-link fixture

1. Build produces exact Artifact P1.
2. QA verifies P1.
3. Release authorizes P1.
4. A deployment call occurs, but the observed production artifact is Q rather than expected P1.
5. R10 preserves expected P1 / observed Q as an unresolved or blocking artifact-identity discrepancy under its rules.
6. R20 evaluating adoption must consume that exact R10 truth and fail the applicable integrity predicate.
7. R20 must not substitute current Artifact P2, latest successful deployment, branch state, or provider success to manufacture coherence.
8. Provider execution success under R8 does not prove that expected P1 became the production artifact.
9. Conversely, if R10 proves an exact, internally valid P1 chain but another current R20 predicate later becomes invalid, R20 must still deny the boundary.
10. A future valid P2 successor receives its own historical lineage and its own fresh R20 decision.

### Compound-synthesis relationship

This clean skip-link directly feeds the frozen final six-node certification plan, especially D3 (`R10` divergence) and D6 (historically correct chain with current R20 ineligibility). It does not replace that later whole-chain proof.

### Disposition

No reconstruction path, semantic conflict, representability gap, or new composition defect was found.

---

## C22-03 — `R8 → R12`

**Pinned endpoint blobs**

- R8: `237c752671573013d090e2eacf7c2af4c0e70512`
- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`

### Endpoint source evidence

R12 explicitly requires reconciliation scheduling to preserve the exact unresolved R8 execution identity. Repeated scheduler recovery must not create multiple external retries merely because reconciliation is overdue, and scheduler lease loss cannot manufacture external replay safety.

R12's domain-obligation/execution-occurrence split remains generic throughout:

- the domain owns why work exists and whether the underlying obligation remains live;
- R12 owns durable/reconstructible runnable occurrence.

R12 does not interpret R8-specific terminal outcome semantics.

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

### Normal reconciliation-scheduling fixture

1. Exact R8 execution E1 crosses or may cross the provider boundary.
2. E1 becomes `OUTCOME_UNCERTAIN_RECONCILABLE` or equivalent governed unresolved state.
3. The domain establishes a reconciliation obligation for exact E1.
4. R12 materializes a runnable reconciliation occurrence referencing exact E1.
5. Scheduler/runtime dies.
6. Recovery deterministically reconstructs the due occurrence without changing E1 or creating duplicate logical reconciliation work.
7. Lease expiry or scheduler recovery does not dispatch a replacement external operation or imply replay safety.
8. R8 later changes the authoritative execution truth; R12 reflects whatever durable domain lifecycle follows without reinterpreting the R8 result itself.

### Cross-batch dependency on C21-03

C21-03 remains the single open `UNRESOLVED_CROSS_NODE_GAP` concerning:

`R8 reaches EXPOSURE_COMMITTED_UNRECONCILABLE → what normatively happens to the active R11 reconciliation obligation?`

That unresolved domain transition has a downstream scheduling consequence, but it does **not** create a second unresolved classification here.

R12 never selects either C21 reading. It does not state whether `EXPOSURE_COMMITTED_UNRECONCILABLE` means the reconciliation obligation remains live, terminates into a specialized state, or completes into a successor owner. It correctly defers that decision to the governing durable domain obligation.

Accordingly:

> **Until C21-03 is resolved, certification of the `EXPOSURE_COMMITTED_UNRECONCILABLE` scheduling path remains pending. R12 must neither perpetually reschedule reconciliation by assumption nor terminate it by assumption.**

Once the governing R11/R8 transition is explicitly decided, R12 must materialize or cease runnable occurrences according to that durable domain state without inventing its own interpretation.

### Taxonomy significance

This edge is a second worked negative-boundary test for `UNRESOLVED_CROSS_NODE_GAP`:

> **A downstream edge does not inherit an upstream unresolved-gap classification merely because its behavior depends on that unresolved decision, provided the downstream contract correctly defers to the owning domain and does not silently choose among the open readings.**

The open ambiguity remains C21-03. C22-03 carries a certification dependency on it.

### Disposition

Clean ownership/composition seam with an explicit cross-batch dependency on C21-03. No second `UNRESOLVED_CROSS_NODE_GAP` is created.

---

## Batch C-22 result

| Edge | Primary | Tags | Topology | Certification strength | Disposition |
|---|---|---|---|---|---|
| `R4 → R17` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | required composite same-path consistency strengthening |
| `R10 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean hard-chain skip-link |
| `R8 → R12` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration | clean; unreconcilable scheduling certification depends on C21-03 |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

The open `UNRESOLVED_CROSS_NODE_GAP` set remains:

1. `R11 → R8` / C21-03: normative disposition of `EXPOSURE_COMMITTED_UNRECONCILABLE`

---

## Process notes carried forward from C-22

1. **Composite validity requires path consistency, not merely valid component references.** If a first-class composite authority object separately binds multiple historical dimensions, those dimensions must be proven mutually consistent with one historical path.
2. **Composite equality rules are field-general.** A same-path invariant is incomplete if tested only by changing the Evaluation Cycle; non-cycle dimensions such as Artifact Version and Release must also be adversarially diverged.
3. **Single-reference mediation and explicit composite equality are complementary patterns.** Avoid duplicate identity where it adds no meaning; where independent first-class dimensions are necessary, certify their consistency explicitly.
4. **A clean skip-link does not replace compound certification.** R10→R20 strengthens the eventual D3/D6 hard-chain proof but cannot establish six-node correctness alone.
5. **Downstream dependency does not automatically inherit an unresolved primary classification.** A downstream node that correctly defers to the owning domain may remain clean while certification of the affected path stays pending.
6. **Open ambiguity must not be laundered by scheduler semantics.** R12 may neither keep nor terminate unreconcilable reconciliation work by local assumption while C21-03 remains unresolved.

---

## Phase C cumulative state after C-22

- **66 classified edges across 22 batches**
- **97 unclassified frozen edges remain**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C22 adds one required composite same-path consistency strengthening at R4→R17
- C22 adds no new primary defect classification
- C22-03 records an explicit certification dependency on C21-03 without duplicating the unresolved finding
- Phase C remains open
