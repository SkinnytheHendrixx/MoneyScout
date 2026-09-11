# WI-R4 — Preserve Exact Originating Evaluation-Cycle Lineage

**Normalized node:** R4  
**Historical finding:** C1-F3  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS`  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

R4 recovery has begun from the original adversarial-confirmation conversation record, not from the compressed v1.0 remediation register and not from a fresh derivation from current code.

The currently recoverable source preserves the confirmed root, amendments, authority behavior, lineage-state vocabulary, compound relationships, and the existence of the original R4-M1 through R4-M8 migration matrix plus R4-A1 consumer audit. However, the exact literal R4-M1 through R4-M8 labels/surface assignments and the complete original acceptance/closure enumeration are not presently recoverable from the accessible conversation record.

Under the fidelity-recovery rule, those gaps **must not be filled from the compressed register, guessed from neighboring nodes, or regenerated from live code**. This artifact is therefore intentionally not a fidelity-review candidate yet.

## 1. Frozen root and mission

Historical finding **C1-F3 / MATERIAL** established that downstream authority could be reconstructed from whichever Evaluation Cycle was current rather than preserving the exact Evaluation Cycle that actually produced the decision/approval/evidence lineage.

R4 exists to make originating Evaluation Cycle identity durable and non-substitutable.

> **Core rule:** preserve the exact originating Evaluation Cycle throughout downstream decision lineage. Never reconstruct authority from the current cycle merely because it is current.

A later cycle may supersede prior decision authority prospectively, but it does not rewrite which cycle produced historical evidence, approval, or downstream work.

## 2. Canonical Evaluation Lineage Reference

The confirmed R4 contract requires an **Evaluation Lineage Reference** or equivalent immutable lineage object that downstream records can carry rather than looking up the current Evaluation Cycle later.

The recovered contract establishes that this reference must preserve enough exact identity to determine:

- the originating Opportunity/decision context;
- the exact Evaluation Cycle that produced the relevant authority/evidence/approval;
- the Bet/decision object where applicable;
- provenance sufficient to prove how the lineage was bound;
- whether the exact lineage is known, not applicable, or unknown for a consumer that may legitimately lack it.

The lineage reference is historical identity. It is not perpetual eligibility and it is not final boundary authority.

## 3. No current-cycle substitution

If Cycle A produced a decision and Cycle B later becomes current, downstream work descended from Cycle A remains explicitly descended from Cycle A unless a governed successor path creates new authority under B.

Forbidden behavior includes:

- looking up `currentEvaluationCycle` at downstream execution time and substituting B for A;
- rewriting historical lineage to whichever cycle is active now;
- treating the existence of B as proof that work originally authorized by A is now authorized by B;
- repairing missing historical lineage by attaching the current cycle.

> **Current state is not historical provenance.**

## 4. Stale Bet approval behavior

The confirmed amendment for stale Evaluation Cycle lineage is explicit.

If a Bet/approval was established under Cycle A and the governing current cycle has advanced such that Cycle A is no longer eligible for the contemplated downstream action:

- fail closed with `STALE_EVALUATION_LINEAGE` or equivalent;
- preserve Cycle A as the actual historical lineage;
- do not rewrite the Bet/approval onto Cycle B;
- do not auto-create a Human Action merely to make the stale lineage resumable;
- do not auto-create a successor/replan merely to make the workflow move;
- do not represent the blocked state as success.

Any required successor belongs to the governed corrective path owned by R11 or the lifecycle authority that actually owns the transition. R4 detects/preserves lineage; it does not self-authorize replacement lineage.

## 5. Human Action lineage states

The original confirmation distinguished Human Action lineage state using the following semantics:

- `EXACT_LINEAGE`
- `NOT_APPLICABLE`
- `UNKNOWN`

### `EXACT_LINEAGE`

The Human Action is durably tied to the exact originating Evaluation Cycle/decision lineage required by the workflow.

### `NOT_APPLICABLE`

The Human Action genuinely does not require Evaluation Cycle lineage for the action itself.

`NOT_APPLICABLE` must **not** be used to resume a downstream workflow that does require exact lineage. Before such a workflow resumes, an explicit legitimate lineage binding must exist.

### `UNKNOWN`

The required originating lineage cannot be proven.

`UNKNOWN` fails closed for lineage-dependent progression. A human statement or current-cycle lookup cannot attest unknown history into existence.

## 6. Legacy and missing lineage

Legacy rows/workflows whose exact originating Evaluation Cycle is missing must not be backfilled from current state.

Permitted recovery is limited to:

1. deterministic reconstruction from durable historical provenance that uniquely proves the original lineage; or
2. creation of a genuinely new governed successor path with its own new authority where the system cannot prove the original lineage and continuation is still warranted.

If neither applies, lineage remains unknown and the lineage-dependent workflow remains blocked.

> **Humans cannot attest unknown history into existence merely to bypass lineage proof.**

## 7. R4-A1 — Evaluation Lineage Consumer Audit

The confirmed contract includes **R4-A1**, a downstream Evaluation Lineage Consumer Audit.

The audit must identify every downstream consumer that can currently:

- retain only Opportunity/Bet identity while dropping the exact originating Evaluation Cycle;
- reconstruct lineage from a current-cycle pointer;
- consume approval/evidence without an exact originating-cycle reference;
- resume historical work after cycle change without proving the exact lineage;
- propagate lineage into Build/Release/Commercial/Remediation surfaces incompletely.

The recovered source confirms that the audit spans downstream Factory lineage surfaces, including Bet proposal/approval, Factory orchestration, Human Actions, Product/Architecture/Build/QA/Release/Asset lineage, Commercial Activation/payment, and remediation consumers.

**Audit is not repair.** Every concrete defect discovered by R4-A1 must become durable migration work. The exact numbering/labels of those audit-discovered children are part of the unresolved source gap below and must not be guessed.

## 8. Confirmed compound boundaries

### R3 × R4

R3 owns temporal adequacy/freshness. R4 owns exact originating Evaluation Cycle lineage.

Fresh evidence bound to the wrong cycle is invalid lineage. Correctly bound evidence may still be stale. Neither dimension repairs the other.

### R2 × R4 × R11

Capability-resolution uncertainty must remain attached to its exact originating decision lineage. If the lineage is stale/unknown and capability uncertainty remains unresolved, the system must not rebind to current cycle or flatten uncertainty to create a false-safe successor. R11 owns any governed corrective obligation.

### R4 × R5

Exact lineage and independent material conclusion/closure are distinct. Correct lineage does not self-certify a material conclusion, and R5 confirmation does not repair missing lineage.

### R4 × R9

R9 Build Source Snapshot authority must consume the exact R4 Evaluation lineage that produced the Product/Architecture/Build decision. A Build may not use current Evaluation Cycle lineage to repair or replace missing/stale originating authority.

This is a hard dependency seam in the confirmed chain:

`R4 → R9 → R10 → R17 → R19 → R20`

### R3 × R4 × R20

At a consequential boundary, R20 must consume both current-enough R3 evidence truth and exact R4 lineage truth. It cannot substitute current cycle for original lineage or recent collection for current source truth.

## 9. Authority and successor boundary

R4 does not create new decision authority merely because old lineage is stale or unknown.

The following are distinct:

- preserving exact historical lineage;
- deciding that historical lineage is no longer eligible;
- owning a corrective successor obligation;
- authorizing a new successor decision/workflow.

> **Detection of stale lineage is not successor authority.**

The blocked original record remains historically attached to its true originating cycle even when a new successor is later created.

## 10. Design Inputs

The recovered R4 confirmation does not establish a generic activation of DI-1 or DI-2.

### DI-1

Provider/account identity plurality is not activated merely by Evaluation Cycle lineage. If a concrete R4 migration/audit surface separately activates provider/account identity plurality, that scope must record and consume DI-1 independently.

### DI-2

R4 lineage preservation does not itself execute outbound monetary reversals. DI-2 is not activated generically. If a concrete lineage-remediation child introduces autonomous refund/void/cancel/reversal execution, that scope activates DI-2 separately.

## 11. Known acceptance semantics recovered

The following acceptance behaviors are confirmed by the recoverable source and must survive the final artifact:

### A. Exact origin survives current-cycle change

Cycle A produces a decision/approval. Cycle B later becomes current.

Expected: historical/downstream records descended from A still reference A. No current-cycle substitution occurs.

### B. Stale approval fails closed without rewrite

A Bet approved under Cycle A reaches a lineage-sensitive downstream action after A is stale/ineligible.

Expected: `STALE_EVALUATION_LINEAGE` or equivalent; A remains recorded; no rewrite to B; no false success.

### C. No automatic Human Action escape hatch

Stale/unknown lineage blocks progression.

Expected: the system does not create a Human Action merely to bypass the lineage failure.

### D. Human Action `UNKNOWN` cannot resume lineage-dependent work

A Human Action exists but exact Evaluation Cycle lineage cannot be proven.

Expected: lineage-dependent workflow remains blocked.

### E. Human Action `NOT_APPLICABLE` is narrow

A Human Action legitimately does not need lineage for its own action.

Expected: it may remain `NOT_APPLICABLE`, but a downstream lineage-dependent workflow cannot resume until exact lineage is legitimately bound.

### F. Legacy lineage reconstruction requires durable proof

Legacy row lacks exact originating cycle.

Expected: deterministic reconstruction only from durable unique provenance. Current cycle or human memory is insufficient.

### G. R4 × R9

Build Source Snapshot is created for downstream work originating from Cycle A while Cycle B is current.

Expected: R9 receives A's exact lineage or fails closed; it never substitutes B.

### H. R3 × R4 × R20

Evidence from Cycle A is stale/temporally unresolved and Cycle B is current at the consequential boundary.

Expected: R20 blocks if either freshness is laundered into current truth or A is rebound to B. Passing one half is insufficient.

## 12. Dependency classes recovered

### START

R4 semantic/schema/audit work can begin from C1-F3 without requiring R9/R20 implementation merely to start.

### LOCAL CLOSURE

The recovered contract requires at minimum:

- Evaluation Lineage Reference implemented;
- exact originating cycle propagated rather than reconstructed from current state;
- stale-lineage fail-closed behavior implemented;
- Human Action `EXACT_LINEAGE / NOT_APPLICABLE / UNKNOWN` semantics implemented;
- legacy/missing lineage handling implemented conservatively;
- R4-A1 completed;
- every concrete defect identified by R4-A1 repaired;
- independent material closure review.

The exact original named R4-M1 through R4-M8 migrations and full closure-evidence enumeration remain unrecovered, so this section is not sufficient to claim local closure or artifact fidelity.

### E2E CERTIFICATION

Recovered required compounds include:

- R3×R4;
- R2×R4×R11;
- R4×R5;
- R4×R9;
- R3×R4×R20;
- downstream hard-chain certification through `R4 → R9 → R10 → R17 → R19 → R20` where applicable.

## 13. Source gap blocking fidelity reconstruction

The following exact original R4 content remains **unrecovered** and blocks promotion of this artifact to `RECOVERED CANDIDATE` or `FIDELITY_VERIFIED`:

1. the literal R4-M1 through R4-M8 migration labels;
2. the exact surface assignment and normative description for each R4-M1 through R4-M8 child;
3. the exact audit-discovered-child numbering convention following R4-A1;
4. the complete original acceptance-fixture enumeration, including any concrete examples not present in the recoverable summary;
5. the complete original numbered closure-evidence list;
6. any rejected alternatives/amendments beyond the stale-Bet/Human-Action/R4×R9 amendments already recovered above.

These details must be recovered from the original adversarial-confirmation record. The compressed v1.0 register is not an acceptable substitute.

## 14. Recovery gate

R4 may advance from `FIDELITY_SOURCE_INCOMPLETE` only when the missing exact source content above is recovered and incorporated without invention.

Until then:

- do not call this a full R4 contract artifact;
- do not ask an independent reviewer to certify it as complete;
- do not begin R5 recovery under the serialized fidelity queue;
- do not derive R4 implementation batches from this document;
- preserve this source gap as an owned recovery obligation.

> **A partially recovered contract is safer than a plausible completed reconstruction whose missing details were invented.**
