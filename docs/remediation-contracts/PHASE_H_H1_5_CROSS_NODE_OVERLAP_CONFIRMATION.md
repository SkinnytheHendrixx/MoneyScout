# Phase H — H1.5 Cross-Node Source-Gap Overlap Confirmation

**Status:** FINAL / REVIEWED / ADJUDICATED / H1.5 COMPLETE  
**Phase:** H — Source-Gap Register  
**Batch:** H1.5 — cross-node overlap / reverse-deduplication confirmation  
**Implementation authority:** SUSPENDED

## 1. Purpose

H1.5 applies the Phase-H reverse-deduplication rule to the overlap clusters identified in H0/H1 and determines whether any apparently node-local missing propositions are actually one shared source gap affecting multiple nodes.

Governing artifacts:

- `PHASE_H_SOURCE_GAP_REGISTER_AUDIT_PLAN.md` — blob `c7999679a6567c186bc3b266a12479ba59ec58f1`;
- `PHASE_H_H0_R1_R20_SOURCE_GAP_INVENTORY.md` — blob `5a5ac208e02a520f7405f1e90f39a75bd7e7a929`;
- `PHASE_H_H1_SEMANTIC_BLOCKING_GAP_ADJUDICATION.md` — blob `c34a25ed545bdb5eddab31c7944397fb8956bce7`.

H1.5 does not reclassify impact/consequence weight already adjudicated by H1. It asks only whether multiple entries represent the same underlying missing proposition.

## 2. Merge / no-merge test

Two node gaps may be merged into one shared primary gap only if all of the following hold:

1. they ask the same missing normative/source question, not merely questions in the same domain;
2. one source recovery or adjudication event would answer both;
3. the same recovered proposition would satisfy both nodes without adding a second independent rule;
4. the authority consequence is materially the same;
5. one node is not merely consuming the other node's already-distinct output.

Do not merge when the nodes operate at different layers of the same pipeline, share provider documentation but require different mappings, share timing vocabulary but govern different clocks/thresholds, or represent upstream and downstream authority objects separately.

Shared domain is not shared missing proposition.

## 3. Adjudicated overlap clusters

### O1 — R8 × R16 reconciliation

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

R8 asks how authoritative technical execution truth can be discovered/reconciled or deemed replay-safe/unreconcilable. R16 asks how already-captured provider financial evidence maps to absolute/delta/cumulative/reversal meaning. R16 explicitly separates these layers.

### O2 — R12 × R13 × R14 timing

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R12: retry/backoff scheduling cadence for runnable occurrences;
- R13: health/stall transition thresholds and aggregate-health policy;
- R14: readiness/drain non-convergence bounds for authority handoff.

These contracts deliberately separate scheduling, liveness, and authority transfer.

### O3 — R10 × R17 × R5 equivalence / confirmation

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

- R10: exact artifact identity/equivalence after materialization/rebuild;
- R17: commercial equivalence across technical successors;
- R5: materially independent confirmation of a consequential judgment.

R17's consumption of R5 is a fallback composition relationship, not a shared missing proposition. R5's materiality/confirmation machinery is already recovered; R17's unresolved question is the domain-specific eligibility criteria for its deterministic fast path.

### O4 — R15 × R16 provider mappings

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

R15 maps provider-native data into preserved raw financial evidence without semantic loss. R16 maps preserved evidence into canonical financial meaning. A common provider source packet may inform both, but one recovery proposition does not answer both questions.

### O5 — R6 × R18 × R20 capability representation chain

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

Verification-result representation, exact frozen Capability Binding representation, and final boundary-decision representation are separate objects owned by separate nodes.

### O6 — R17 × R19 × R20 commercial identity representation chain

**Disposition:** `NO OVERLAP / DISTINCT PROPOSITIONS`.

Offer/Grant representation, commercial lineage representation, and final boundary-decision representation bind to one history but remain distinct authority records.

### O7 — R4 × R5 × R6 GAP-PATTERN-01

**Disposition:** `SHARED SOURCE-RECOVERY PATTERN / NOT A SHARED SEMANTIC PRIMARY GAP`.

R4/R5/R6 share a recovery limitation around exact audit-form provenance, fixture ordering, closure-list exact form, and child numbering. But each node's historical form remains node-specific; recovering one node does not automatically recover the others.

## 4. Process-level synthesis observation — broader traceability debt pattern

Adversarial review identified a broader process-level pattern that must be carried into H2/H4 without changing H1.5 counting:

> The same-continuity-memory limitation first formalized as `GAP-PATTERN-01` for R4/R5/R6 appears to be a broader corpus-wide assurance-process characteristic behind repeated exact migration-label/ordinal, fixture-order, closure-list, audit-vocabulary, and worked-example provenance debt across many later nodes as well.

This is **not** a reason to merge those node-local gaps. The missing propositions remain node-specific because recovering one node's exact historical fixture order, migration numbering, or closure list does not recover another node's.

However, the likely shared recovery mechanism matters operationally:

- if the original confirmation exchanges or equivalent authoritative recovery packet are later located, a single source-recovery effort could resolve traceability debt across many nodes at once;
- H2/H4 should therefore distinguish **shared recovery root cause / source packet** from **separate primary exactness propositions**;
- no per-node traceability debt may be deleted merely because a global recovery process is plausible.

This observation generalizes GAP-PATTERN-01 from a three-node anomaly into a probable global recovery-process characteristic while preserving correct node-local counting.

## 5. Consequence-class cross-check

Shared consequence tags do not create hidden merges:

- R10 and R19 are both `SAFE_DEFAULT_SUFFICIENT`, but their missing propositions differ.
- R13 threshold policy and R14 timeout policy both require governed values, but govern different state machines.
- R15/R16/R17 provider-domain gaps may consult the same provider documentation, but ask different provider-specific questions.
- R17 deterministic commercial equivalence and R10 deterministic artifact equivalence both affect permissive reuse, but one governs commercial authority and the other Artifact Version identity.

Same consequence class is not a merge criterion.

## 6. H1.5 arithmetic

Candidate overlap clusters reviewed: **7**.

Outcomes:

- shared semantic/provider-domain primary gaps created by merging: **0**;
- clusters resolving `NO OVERLAP / DISTINCT PROPOSITIONS`: **6**;
- shared source-recovery pattern retained without semantic-gap merge: **1** (`GAP-PATTERN-01`);
- H1 semantic/provider-domain count changed by overlap deduplication: **0**;
- H1 `SAFE_DEFAULT_SUFFICIENT` count changed by overlap deduplication: **0**.

H1 consequence arithmetic therefore remains:

- genuine semantic/provider-domain gaps: **9**;
- `SAFE_DEFAULT_SUFFICIENT`: **2**;
- operational-governance debt outside H1 semantic count: **1**.

These are not final Phase-H register counts; H2/H3/H4 remain responsible for exactness grouping, source exhaustion, and final arithmetic.

## 7. Completion state

**H1.5 FINAL RESULT:**

`NO SHARED SEMANTIC GAP MERGES / H1 ARITHMETIC UNCHANGED / GAP-PATTERN-01 RETAINED AS SHARED SOURCE-RECOVERY PATTERN / BROADER TRACEABILITY DEBT ROOT-CAUSE OBSERVATION RECORDED`

Implementation authority remains **SUSPENDED**.

Next: **H2 — exactness / traceability adjudication**.
