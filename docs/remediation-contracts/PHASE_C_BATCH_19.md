# Phase C Batch 19 — Cross-Reference Classification

**Status:** COMMITTED / AWAITING INDEPENDENT VERIFICATION  
**Phase:** C — Cross-node classification  
**Batch:** C-19  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 57 edges across 19 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged

This batch classifies:

- `R8 → R16`
- `R14 → R13`
- `R4 → R10`

All classifications below preserve the Phase C governing rule that relation, topology, certification strength, primary classification, mediation shape, and representability are independent dimensions. A clean mediated edge need not duplicate upstream identity locally when one exact immutable reference already carries it.

---

## C19-01 — `R8 → R16`

**Pinned endpoint blobs**

- R8: `237c752671573013d090e2eacf7c2af4c0e70512`
- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`

### Endpoint source evidence

R8 states explicitly:

> R8's external execution truth is distinct from provider financial truth.

and assigns downstream roles:

> R15 preserves provider-originating financial observations. R16 reconciles them deterministically. R8 must preserve the exact execution identity they attach to.

R16 reciprocates:

> R8 answers what happened at the provider execution boundary. R16 answers what financial state follows from provider-originating evidence.

R16 further requires coexistence of non-equivalent truths, including:

- R8 `SUCCEEDED` with `AWAITING_FINAL` financial reconciliation;
- R8 uncertainty with provider-originating cost evidence;
- technical failure without proof of zero financial impact.

R16 also requires:

> R16 must bind canonical financial interpretation to the exact R8 execution identity through R15 provenance where applicable.

And for evidence that cannot yet be deterministically attributed, R16 already preserves the explicit shared state:

> `UNALLOCATED_SHARED_COST`

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

- R8 owns exact external execution truth.
- R15 preserves raw provider financial evidence and provenance.
- R16 owns canonical financial interpretation/reconciliation.

Technical execution state and financial state are related but non-substitutable. R8 success does not imply financial settlement, and financial evidence does not determine R8 technical terminality.

### Targeted shared-observation fixture

1. Exact R8 executions E1 and E2 exist under the same provider/account.
2. R15 observation F1 is provably execution-specific to E1.
3. R16 may interpret F1 in E1's exact execution lineage.
4. A later provider observation Fshared is authoritative at account/invoice/shared scope but cannot yet be causally attributed to E1 or E2.
5. R16 must not attach Fshared opportunistically to whichever execution is currently being reconciled.
6. Fshared remains shared/unallocated under the governing policy, including `UNALLOCATED_SHARED_COST` where applicable.
7. E1 `SUCCEEDED` does not manufacture attribution.
8. E2 uncertainty does not absorb the shared amount merely because E2 is unresolved.
9. If later deterministic evidence attributes some or all of Fshared, R16 may revise canonical financial truth without rewriting the original R15 observation provenance or either R8 execution history.
10. Resource/headroom consequences still route through their governing authority, including R7, rather than being granted merely because R16 computed an attribution.

### Disposition

No gap was found. The endpoint contracts already contain both exact-execution financial binding and explicit shared/unattributed representation. The fixture makes those two existing rules executable together.

---

## C19-02 — `R14 → R13`

**Pinned endpoint blobs**

- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`
- R13: `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e`

### Endpoint source evidence

R14 states:

> R13 supplies the evidence R14 uses to judge successor readiness.

and explicitly rejects generic process health as sufficient. A successor is not handoff-ready merely because:

- its process started;
- a health endpoint returns 200;
- the generic Execution Kernel is healthy;
- an unrelated executor path is progressing.

R14 preserves R13's four replacement dimensions:

1. runtime identity;
2. executor identity;
3. service-path identity;
4. execution-authority identity.

and states:

> R14 consumes those distinctions and performs the authority transfer; R13 does not itself grant authority.

R13 reciprocates:

> R14 owns the governed handoff/replacement lifecycle. R13 supplies the health/readiness evidence R14 needs; R13 does not itself transfer authority.

and:

> R13 evaluates health. R14 decides transfer/handoff authority.

R14's epoch sequence requires successor readiness before authority transfer:

1. incumbent fenced from new claims;
2. successor readiness proven;
3. new authority epoch/fencing state committed;
4. successor becomes `AUTHORITATIVE_ACTIVE`.

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

- R13 owns truthful path-specific readiness/liveness evidence.
- R14 owns replacement/handoff authority and epoch transfer.

`READY_CANDIDATE` is not `AUTHORITATIVE_ACTIVE`. Health/readiness evidence cannot grant authority by itself, while transfer authority cannot truthfully claim readiness that R13 no longer supports.

### Required timing fixture — readiness must still hold at transfer

The full-source review confirms a narrow timing seam. R14 requires readiness immediately before epoch commit in sequence, but the current text does not mechanically require that earlier `READY_CANDIDATE` evidence be revalidated as-of the actual commit point.

The fixture is therefore:

1. Successor S is observed healthy for the exact required executor/service path at T1.
2. S becomes `READY_CANDIDATE` under that evidence.
3. Before authority epoch E2 commits, R13 durably observes that same required path as `STALLED`, `FAILED`, or materially `UNKNOWN`.
4. R14 must not consume stale T1 readiness and commit E2.
5. A healthy unrelated executor, generic process heartbeat, or green aggregate endpoint cannot repair the failed exact-path predicate.
6. If the required path later becomes healthy again, affirmative current R13 evidence is required before a later transfer attempt may commit.
7. The earlier readiness episode and later failure remain historical truth rather than being overwritten by restoration.
8. `READY_CANDIDATE` persistence is therefore not perpetual transfer authority.
9. If authority transfer already committed before the health degradation, subsequent handling follows R14/R20 post-transfer rules; the system must not rewrite the earlier transfer as though it never occurred.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`. Both endpoint contracts already define the exact ownership composition. The missing precision is temporal: readiness must be current enough at the authority-epoch commit boundary rather than merely true at an earlier checkpoint.

This is the handoff analogue of the already-established rule that previously verified capability/authority is not perpetual.

---

## C19-03 — `R4 → R10`

**Pinned endpoint blobs**

- R4: `907e44ccb1128dabb142164e713877596901c3f2`
- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

### Endpoint source evidence

R4 defines the primary immutable-build chain:

> **R4 → R9 → R10** — the primary immutable-build dependency chain.

and its governing invariant:

> Exact artifact identity is not trustworthy if the decision lineage authorizing that artifact was reconstructed from a different evaluation cycle.

R4 explicitly assigns the mediated roles:

> R4 tells us which evaluation lineage justified the Bet/Factory authority. R9 freezes the exact repository/build-source revision governed by that Factory lineage. R10 carries the exact built artifact identity through QA and Release.

R10's canonical Artifact Version field model includes:

> exact R9 Build Source Snapshot / source commit authority

and:

> Product Definition and Architecture lineage inherited from the Build

At Asset adoption, R10 requires the system to be able to answer:

> which Build Source Snapshot and Evaluation Lineage ultimately produced that artifact.

R10 also preserves the hard chain:

`R4 → R9 → R10 → R17 → R19 → R20`

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

### Why direct `CONSUMES` is withheld

This edge is intentionally mediated through R9.

R10 does not independently rediscover or reinterpret R4 Evaluation Lineage. Instead, R10 preserves the exact R9 Build Source Snapshot that already carries the immutable originating R4 lineage.

Treating R10 as a second direct R4 resolver would recreate the defect class R4 exists to remove: reconstructing historical authority from whichever evaluation state happens to be current later.

### Positive architectural finding — single-reference mediation avoids equality drift

The full-source review confirmed a positive structural property in R10's design.

R10 does **not** independently populate a separate R4 Evaluation Lineage field parallel to its R9 snapshot reference. Its canonical model instead carries:

- the exact R9 Build Source Snapshot / source authority; and
- downstream Product/Architecture lineage inherited from the Build.

Its adoption language asks which Evaluation Lineage **ultimately produced** the artifact, framing that lineage as traceable through the frozen source/build chain rather than as an independently reconstructed mutable field.

This differs materially from R19's Commercial Authority Lineage Reference, where R4 lineage, R9 source, R10 artifact, R17 Offer/Grant, and other dimensions are separately represented inside one composite lineage and therefore require explicit cross-field equality/consistency checks.

R10 avoids that specific equality-drift failure class by design.

> **Do not duplicate an upstream authority identity when one exact immutable reference already carries it and the downstream consumer can prove the trace through that reference.**

This is a positive mediation pattern, not merely absence of a defect.

### Hard-chain mediation fixture

1. R4 freezes exact originating Evaluation Cycle A.
2. R9 freezes source S1 under A and preserves that exact lineage in the Build Source Snapshot.
3. R10 creates Artifact P1 from exact R9 snapshot S1.
4. Cycle B later becomes current.
5. R10 must still prove that P1 ultimately derives from A through S1.
6. Artifact Version creation, QA, Release, restart recovery, or Asset adoption must not independently attach B merely because B is current at that later time.
7. If an R10 record or downstream projection claims B while its exact R9 snapshot S1 carries A, the chain is inconsistent and must fail the relevant integrity check.
8. If R10 can prove the exact R9 snapshot and that snapshot canonically carries A, no duplicate direct R4 lookup is required.
9. A successor Build legitimately authorized under B receives its own source S2, artifact P2, and distinct hard-chain lineage.
10. Same Opportunity membership cannot reconcile A/B disagreement.

### Process significance

This edge provides a concrete positive comparator for future cross-object equality reviews:

- **unsafe pattern:** copy the same authority identity into multiple independently populated fields and hope they stay equal;
- **safer pattern:** preserve one immutable authoritative reference and trace downstream provenance through it when no independent semantic identity is required.

That principle must not be overgeneralized. Separate first-class fields remain required when the downstream object genuinely owns an independent semantic dimension, as in R19's composite commercial lineage. But where duplication adds no independent meaning, avoiding duplication removes an entire class of equality/substitution defects.

---

## Batch C-19 result

| Edge | Primary | Tags | Topology | Certification strength |
|---|---|---|---|---|
| `R8 → R16` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration |
| `R14 → R13` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration |
| `R4 → R10` | `CONSISTENT_CONSUMPTION` | `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/hard-chain integration |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

---

## Process notes carried forward from C-19

1. **A mediated edge can be cleaner than a duplicated direct edge.** If the mediator already carries the exact immutable upstream identity, the downstream node need not independently restate that identity merely to prove traceability.
2. **Avoiding unnecessary identity duplication is a concrete mitigation against cross-object equality drift.** R4→R10 through R9 is the positive comparator for the failure pattern seen in composite structures such as R19, where multiple independently represented dimensions require explicit equality checks.
3. **Positive architectural patterns should be recorded alongside defects.** Phase C is not only identifying what is missing; it is also identifying structures that already avoid known failure classes and can guide remediation elsewhere.
4. **Readiness evidence is time-sensitive authority input.** R13 health/readiness that was valid at `READY_CANDIDATE` establishment must not be treated as perpetual authority to commit a later R14 handoff epoch.
5. **Shared financial evidence must remain shared until attribution is proven.** An exact R8 execution being reconciled does not give R16 permission to opportunistically bind broader provider/account financial evidence to that execution.
6. **Mediated correctness requires exact-identity preservation through the mediator.** Reachability to some upstream object is insufficient if the mediator can land on a different identity than the one that actually authorized the chain.
7. **Finding compression must never become implementation-scope compression.** A clean mediated relation does not eliminate the need to implement and certify each participating node's named migration surfaces and identity-preservation rules.

---

## Phase C cumulative state after C-19

- **57 classified edges across 19 batches**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- C19 adds one targeted timing fixture: R13 readiness must remain current through R14 authority-epoch commit
- C19 records one positive architectural pattern: single-reference mediation can avoid unnecessary cross-object equality risk
- No new primary defect classification added
- Phase C remains open
