# Phase H — H1.5 Cross-Node Source-Gap Overlap Confirmation — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** H — Source-Gap Register  
**Batch:** H1.5 — cross-node overlap / reverse-deduplication confirmation  
**Implementation authority:** SUSPENDED

## 1. Purpose

H1.5 applies the Phase-H reverse-deduplication rule to the candidate overlap clusters identified in H0/H1 and determines whether any apparently node-local missing propositions are actually one shared source gap affecting multiple nodes.

Governing artifacts:

- `PHASE_H_SOURCE_GAP_REGISTER_AUDIT_PLAN.md` — blob `c7999679a6567c186bc3b266a12479ba59ec58f1`;
- `PHASE_H_H0_R1_R20_SOURCE_GAP_INVENTORY.md` — blob `5a5ac208e02a520f7405f1e90f39a75bd7e7a929`;
- `PHASE_H_H1_SEMANTIC_BLOCKING_GAP_ADJUDICATION.md` — blob `c34a25ed545bdb5eddab31c7944397fb8956bce7`.

H1.5 does not reclassify impact/consequence weight already adjudicated by H1. It asks only whether multiple entries represent the **same underlying missing proposition**.

## 2. Merge / no-merge test

Two node gaps may be merged into one shared primary gap only if all of the following hold:

1. they ask the same missing normative/source question, not merely questions in the same domain;
2. one source recovery or adjudication event would answer both;
3. the same recovered proposition would satisfy both nodes without adding a second independent rule;
4. the authority consequence is materially the same;
5. one node is not merely consuming the other node's already-distinct output.

Do **not** merge when:

- the nodes operate at different layers of the same pipeline;
- they share provider documentation but require different mappings;
- they share timing vocabulary but govern different clocks/thresholds;
- one concerns technical identity/equivalence and another concerns commercial/material judgment;
- one concerns representation of an upstream authority object and another represents downstream consumption of that object.

Shared domain is not shared missing proposition.

## 3. Adjudicated overlap clusters

### O1 — R8 × R16 reconciliation

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R8 missing proposition: how authoritative technical execution truth can be discovered/reconciled or deemed replay-safe/unreconcilable.
- R16 missing proposition: how already-captured provider financial evidence maps to absolute/delta/cumulative/reversal meaning.

R16 explicitly separates these layers: R8 answers what happened at the provider execution boundary; R16 answers what financial state follows from provider-originating evidence.

One source/adjudication event would not resolve both.

### O2 — R12 × R13 × R14 timing

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R12: retry/backoff scheduling cadence for runnable occurrences;
- R13: health/stall transition thresholds and aggregate-health policy;
- R14: readiness/drain non-convergence bounds for authority handoff.

These contracts deliberately separate scheduling, liveness, and authority transfer. A timer/timeout appearing in all three is not evidence of one shared timing policy.

### O3 — R10 × R17 × R5 equivalence / confirmation

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R10: exact artifact identity/equivalence after materialization/rebuild;
- R17: commercial equivalence across technical successors;
- R5: materially independent confirmation of a consequential judgment.

R17 may consume R5 where a commercial equivalence judgment is not fully deterministic, but that consumption does not make the underlying R10/R17/R5 missing propositions identical.

### O4 — R15 × R16 provider mappings

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R15 maps provider-native data into preserved raw financial evidence without semantic loss;
- R16 maps preserved evidence into canonical financial meaning.

The same provider documentation may be consulted for both, but raw-capture mapping and interpretation mapping have distinct failure modes and require separate proof.

### O5 — R6 × R18 × R20 capability representation chain

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R6: verification-policy/result representation;
- R18: exact frozen Capability Binding Snapshot / Validation Record representation;
- R20: final boundary decision / validator-policy representation.

These are different authority objects owned by different nodes. They must compose on consistent identities, but recovering one object's exact historical fields would not recover the others.

### O6 — R17 × R19 × R20 commercial identity representation chain

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R17: Offer Version / Grant representation;
- R19: commercial lineage representation;
- R20: final boundary-decision representation.

The objects bind to one commercial history but remain distinct authority records. One source recovery event cannot be presumed to recover all three historical representations.

### O7 — R4 × R5 × R6 GAP-PATTERN-01

**Disposition:** `SHARED SOURCE-RECOVERY PATTERN / NOT A SHARED SEMANTIC PRIMARY GAP`.

R4/R5/R6 repeatedly exhibited the same recovery limitation around exact audit-form provenance, fixture ordering, closure-list exact form, and discovered-child numbering. This supports one shared **assurance/source-recovery pattern** about template-transfer risk and same-continuity memory limits.

However, each node's actual historical audit/fixture/closure form remains node-specific. Recovering R4's exact original fixture ordering would not automatically recover R5's or R6's. Therefore GAP-PATTERN-01 must not be collapsed into one primary exactness gap that erases node-specific provenance debt.

## 4. Consequence-class cross-check

The H1 consequence discriminator does not create any hidden merge:

- R10 and R19 are both `SAFE_DEFAULT_SUFFICIENT`, but they concern different missing propositions and remain separate.
- R13 threshold policy and R14 timeout policy both require governed values, but they govern different state machines and remain separate.
- R15/R16/R17 provider-domain gaps may consult the same provider documentation, but each asks a different provider-specific question.
- R17 deterministic commercial equivalence and R10 deterministic artifact equivalence both affect permissive reuse, but one governs commercial authority and the other Artifact Version identity.

Same consequence class is not enough to justify merging.

## 5. H1.5 arithmetic

Candidate overlap clusters reviewed: **7**.

Outcomes:

- shared semantic/provider-domain primary gaps created by merging: **0**;
- clusters resolving `NO OVERLAP / DISTINCT PROPOSITIONS`: **6**;
- shared source-recovery pattern retained without semantic-gap merge: **1** (`GAP-PATTERN-01`);
- H1 semantic/provider-domain count changed by overlap deduplication: **0**;
- H1 `SAFE_DEFAULT_SUFFICIENT` count changed by overlap deduplication: **0**.

Therefore H1's consequence arithmetic remains unchanged after reverse-deduplication:

- genuine semantic/provider-domain gaps: **9**;
- `SAFE_DEFAULT_SUFFICIENT`: **2**;
- operational-governance debt outside H1 semantic count: **1**.

These are still not final Phase-H register counts; H2/H3/H4 remain responsible for exactness grouping, source exhaustion, and final arithmetic.

## 6. Review questions

Adversarial review should pressure specifically:

1. Does any pair in O1–O6 actually depend on one identical missing proposition despite operating at different layers?
2. Does R15×R16 provider documentation create a shared source gap rather than merely a shared source packet?
3. Does R17's consumption of R5 for non-deterministic equivalence mean H1-S08 should merge with an R5 gap, or is R5 already fully recovered and merely supplies the fallback mechanism?
4. Does GAP-PATTERN-01 warrant one shared primary H2 traceability gap, or would that incorrectly erase node-specific exact-form provenance?
5. Is there any overlap candidate omitted from H0/H1 that should be added before H2 begins?

## 7. Provisional result

**H1.5 PROVISIONAL RESULT:**

`NO SHARED SEMANTIC GAP MERGES / H1 ARITHMETIC UNCHANGED / GAP-PATTERN-01 RETAINED AS SHARED SOURCE-RECOVERY PATTERN ONLY`.

Implementation authority remains **SUSPENDED**.

No H2 exactness arithmetic should be treated as final until this H1.5 result survives adversarial review.
