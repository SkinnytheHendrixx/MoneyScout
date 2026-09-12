# Phase C Batch 17 — Cross-Node Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Global Fidelity & Cross-Node Audit  
**Batch:** C-17  
**Frozen endpoint blobs:**

- R1 `af010e01aaaf4e3454b6e88fc390d4502151d16a`
- R2 `bf1c19387b52938f43f28f1d58c73d483c72c5ab`
- R8 `237c752671573013d090e2eacf7c2af4c0e70512`
- R11 `f811d528730d819aa793a1901e9d1b310242fbcd`
- R15 `1b46aa43f33c19e75ef0696286693592fbbf8c77`
- R20 `d9d7788e4c5a8f4c0914cf845294b38386470333`

This batch classifies three frozen directed edges:

1. `R1 → R8`
2. `R2 → R11`
3. `R15 → R20`

It also records a cross-batch dependency: the `R15 → R20` safety path for provider-financial-evidence integrity depends on the durable R11 ownership strengthening already established in Batch C-16 for `R15 → R11`.

---

## C17-01 — `R1 → R8`

### Classification

- **Primary:** `CONSISTENT_CONSUMPTION`
- **Tags:** `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`
- **Topology:** `UNILATERAL_DECLARATION`
- **Certification dependency strength:** vocabulary/interface compatibility

### Relevant R1 source text

R1 distinguishes resource meaning from downstream authority:

> `committed` and `consumed` are separate facts.

> **Additional headroom cannot increase merely because a committed ceiling has not yet been observed as consumed.**

R1 also states:

> Until later R7/R8/R15/R16 semantics prove release or authoritative lower exposure, R1 must not let “not yet consumed” masquerade as free capacity.

And:

> R1 defines resource semantics. It does **not** create reservation authority; R7 owns atomic scarce-resource reservation and admission.

### Relevant R8 source text

R8 owns external-boundary truth:

> **External-boundary truth must be durable, execution-scoped, and reconciled from authoritative evidence before the system retries, releases reserved exposure, or adopts an external result.**

For a historical uncertain attempt later proven never to have crossed the provider boundary, R8 defines:

> `RECONCILED_NOT_DISPATCHED` is the confirmed terminal state for a historical execution attempt that existed and entered uncertainty, but authoritative reconciliation later proved that the consequential provider boundary was never crossed for that exact attempt.

And explicitly:

> **Proof that the original attempt never crossed the boundary closes that attempt; it does not rewind it into a reusable pre-dispatch state. Any subsequent dispatch is a new execution attempt.**

R8’s R7 seam is:

> **R7 may release pre-dispatch exposure only from R8-authoritative proof of non-dispatch.**

### Adjudication

The architecture is intentionally mediated rather than direct:

`R8 external truth → R7 release/settlement authority → R1-compatible current resource state/projections`

R8 does not own generic resource-accounting mutation, and R1 does not own external execution truth. Therefore `CONSUMES` is intentionally omitted.

No missing composition was found. The endpoint contracts already rule out the dangerous rewrite in which `RECONCILED_NOT_DISPATCHED` is treated as though the historical reservation or commitment never existed.

### Required operational fixture

A closure/integration fixture must prove:

1. R7 reserves 100 for exact action/execution `E1`.
2. R1-compatible resource history records that commitment.
3. `E1` becomes uncertain.
4. R8 later resolves `E1` as `RECONCILED_NOT_DISPATCHED` from authoritative evidence.
5. R7 may release the 100 only if all of its own release predicates pass.
6. Current headroom may increase after authoritative release.
7. The historical commitment remains durably inspectable as a real prior commitment.
8. R8 non-dispatch proof must not be translated into “the reservation never existed.”
9. Any later provider call uses a new execution identity and its own reservation history rather than reusing `E1`.

This fixture makes an already-correct composition executable. It does not close a newly discovered architectural gap.

---

## C17-02 — `R2 → R11`

### Classification

- **Primary:** `CONSISTENT_CONSUMPTION`
- **Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`
- **Topology:** `BILATERAL_CORROBORATION`
- **Certification dependency strength:** operational/integration

### Relevant R2 source text

R2 states:

> If R2 cannot resolve a material uncertainty sufficiently for safe progression, it must produce a durable blocked/unresolved state that can be owned by R11 rather than silently choosing a convenient path.

And:

> R2 determines/preserves the resolution outcome and remaining uncertainty.
>
> R11 owns the corrective successor/disposition when further action is required.

The load-bearing rule is:

> **Resolution uncertainty can create an owned successor obligation; it cannot self-authorize continuation.**

R2 also preserves exact originating lineage and requires unresolved uncertainty to remain explicit through the R2×R4×R11 compound.

### Relevant R11 source text

R11’s mission is the corresponding durable-ownership layer:

> **Fail-closed is incomplete if the closed state has no owner. When the system cannot safely decide corrective action, uncertainty itself becomes an owned adjudication obligation.**

R11 further requires immutable/versioned obligations:

> Material changes to scope, target, authority, or completion conditions must create an explicit successor/version rather than silently mutating the prior obligation into a different one.

And deterministic convergence:

> Where the same durable failure/evidence set deterministically implies the same corrective obligation, repeated evaluation or recovery must converge on the same obligation identity rather than emitting duplicate corrective work.

For unknown successor scope:

> `SUCCESSOR_SCOPE_UNKNOWN → ADJUDICATE_SUCCESSOR_SCOPE`

### Adjudication

The seam is explicit and bilateral.

R11 consumes the durable unresolved/blocked condition produced by R2 when corrective successor work is required. R2 preserves epistemic truth; R11 owns the successor/disposition. Neither may impersonate the other.

No gap was found.

### Required historical-immutability / convergence fixture

The implementation must prove:

1. R2 persists Outcome `O1` with exact unresolved-state fingerprint/provenance, including selected path, fallback reason, cost/dependency/operational uncertainty, and originating lineage.
2. R11 deterministically derives corrective obligation `C1` from `O1`.
3. Repeated detection of the same durable `O1` condition converges on `C1` rather than producing duplicate `C2/C3` obligations.
4. Corrective work may not mutate `O1`’s historical `UNKNOWN`, fallback reason, or originating cycle to make the earlier decision appear cleaner in hindsight.
5. New evidence that genuinely changes capability-resolution truth produces a new R2 reevaluation/result `O2` where applicable.
6. `C1` may close only against its exact completion predicate while `O1` remains historical truth.
7. `O2` must not retroactively mean that `O1` “was always resolved.”
8. A material change to corrective scope creates an explicit R11 successor/version rather than silently mutating `C1`.
9. If material R2 uncertainty remains after the corrective attempt, the obligation remains owned or deterministically converges to the governed successor; process completion alone is not semantic closure.

---

## C17-03 — `R15 → R20`

### Classification

- **Primary:** `CONSISTENT_CONSUMPTION`
- **Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`
- **Topology:** `UNILATERAL_DECLARATION`
- **Certification dependency strength:** operational/integration

### Relevant R15 source text

R15’s core ownership rule is:

> **R15 preserves what the provider said. R16 decides what the complete evidence set means.**

R15 explicitly does not decide whether a provider-observed value is:

- absolute;
- delta;
- cumulative;
- reversal/adjustment;
- final/provisional precedence;
- canonical incurred/settled state.

R15’s E2E section nevertheless requires composition with R20 where relevant.

R15 also contains non-semantic integrity states and conditions, including:

- `UNPARSEABLE` raw evidence;
- unresolved provider/account/execution provenance;
- capture failures after genuine observation;
- governed redaction provenance;
- stale-worker evidence-preservation requirements.

### Relevant R20 source disposition

R20 does not contain a dedicated financial-evidence-integrity predicate family. Its consumed-node model and predicate families do, however, consume R11 corrective ownership where failed eligibility requires a durable successor obligation.

This matters because Batch C-16 already established the missing intermediate ownership rule for R15 capture-integrity failures.

### Adjudication

The safe architecture is not direct R15-to-R20 financial interpretation.

The ordinary semantic path remains:

`R15 raw observation → R16 canonical interpretation → applicable domain authority (for example R7/R19) → R20 boundary eligibility`

For R15 capture/provenance integrity failures that occur before R16 can produce canonical financial truth, Batch C-16 established the required durable-ownership strengthening:

`R15 integrity failure → durable R11-owned corrective obligation`

R20 already consumes R11 corrective ownership as a boundary predicate. Therefore the R15→R20 safety path is intentionally mediated through R11 for this failure family:

`R15 integrity failure → R11 obligation → R20 consumes R11 ownership/blocking state`

No independent new R15→R20 strengthening is created here. Doing so would duplicate the same requirement from the consumer side and risk implementation-scope fragmentation.

### Cross-batch dependency on C16-03

This edge’s clean classification **depends on the C16-03 strengthening actually being implemented**.

If R15 capture/provenance failure is not converted into the durable R11-owned state required by C16-03, then the mediation path described here does not exist operationally even though R20 is already capable of consuming R11 ownership.

That implementation dependency must remain explicit in later remediation planning and E2E certification.

### Scope-isolation addition to the C16-03 fixture

One new requirement surfaced in this edge review and must be added to the existing C16-03 implementation fixture rather than represented as a separate new defect:

> **An unresolved R15 financial-evidence-integrity obligation must block only consequential boundaries whose safe execution/adoption actually depends on the unresolved financial truth. An unrelated boundary that does not depend on that financial truth must not be globally blocked merely because some other R15 observation remains unresolved.**

Operationally, certify at least:

1. a relevant boundary whose required financial truth is unresolved fails closed through the R11-mediated path;
2. R20 does not invent zero/positive/canonical financial meaning from `UNPARSEABLE` or provenance-incomplete R15 evidence;
3. the denial remains attributable to unresolved owned financial evidence/authority rather than fabricated arithmetic;
4. once governed remediation/R16 resolves the relevant evidence, a fresh R20 evaluation is required;
5. an unrelated boundary with no dependency on that exact unresolved financial truth remains independently eligible if all of its own predicates pass.

This is an augmentation of C16-03’s existing fixture, not a fourth independent Phase C finding.

---

## Batch C-17 result

| Edge | Primary | Tags | Topology | Certification strength |
|---|---|---|---|---|
| `R1 → R8` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | vocabulary/interface compatibility |
| `R2 → R11` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational/integration |
| `R15 → R20` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | operational/integration |

No new `MISSING_REQUIRED_COMPOSITION` is introduced by Batch C-17.

The standing count after this batch is:

- **51 classified edges across 17 batches**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**:
  1. `R17 → R18`
  2. `R5 → R20`
  3. `R19 → R14`

---

## Phase C process notes carried forward

1. **Mediation must be evaluated end to end, not pairwise in isolation.** A consumer-side absence can be safe when a previously established mediator owns the exact missing interpretation/ownership step and the consumer already consumes that mediator.
2. **Do not duplicate one remediation root from both sides of a mediated seam.** If C16-03 already requires `R15 integrity failure → R11 obligation`, C17-03 should cross-reference that obligation rather than creating a second independently worded defect for `R15 → R20`.
3. **Cross-batch dependency is implementation-relevant.** A later edge may classify cleanly only because an earlier required strengthening supplies the missing mediator. That dependency must survive into remediation planning and certification.
4. **Scope isolation is part of fail-closed correctness.** A valid safety block must be scoped to the exact authority/evidence dependency it protects; “fail closed” must not become indiscriminate global paralysis.
5. **Historical correction and current-state release are different facts.** Authoritative release may increase current headroom without rewriting the historical commitment/exposure interval that preceded reconciliation.
6. **Deterministic corrective convergence must preserve epistemic history.** New evidence may produce a new R2 result and close an R11 obligation without mutating the earlier unresolved R2 result into a fiction of prior certainty.
7. **Finding compression must never become implementation-scope compression.** Cross-batch linkage may share one remediation primitive while preserving every source-specific fixture, caller, state distinction, and acceptance obligation.

---

## Invalidation / re-review rules

- Any change to one of the pinned endpoint blobs invalidates the affected edge classification until the changed endpoint is re-reviewed.
- Any change to the C16-03 strengthening that removes or materially alters the R15→R11 ownership path requires C17-03 to be re-adjudicated.
- Any implementation that introduces direct R15→R20 financial semantics, bypassing R16/R11/R7/R19 ownership, reopens C17-03 for classification rather than being treated as an implementation detail.
- Any implementation that lets R8 non-dispatch reconciliation erase historical resource commitment requires C17-01 re-review.
- Any implementation that mutates historical R2 resolution truth or duplicates deterministic R11 successors requires C17-02 re-review.
