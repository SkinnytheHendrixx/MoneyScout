# Phase I — I2 R8 Dual-Layer Taxonomy / Name Adjudication

**Status:** FINAL / REVIEWED / ADJUDICATED / I2 COMPLETE  
**Phase:** I — phase/name/source exactness  
**Batch:** I2 — R8 dual-layer taxonomy/name adjudication  
**Implementation authority:** SUSPENDED

## 1. Purpose

I2 adjudicates the sole Phase-I item whose naming question cannot be separated from unresolved semantic completeness:

- **I-01 / R8 reconciliation-capability taxonomy labels**;
- upstream Phase-H gap: **H1-S01**.

Unlike I1's eight naming-only items, R8 is not a settled semantic model with uncertain historical spelling. The available record does not prove that the recalled five distinctions are the complete/correct normative taxonomy in the first place.

Governing artifacts:

- `PHASE_I_PHASE_NAME_SOURCE_EXACTNESS_AUDIT_PLAN.md` — blob `fd05720385ed6766bbf9a6217a03ed92db01104b`;
- `PHASE_I_I0_NINE_ITEM_EXACTNESS_INVENTORY.md` — blob `dff4fd3fa25d906720dc7782babf7163ec78e892`;
- `PHASE_I_I1_NAMING_ONLY_ADJUDICATION.md` — blob `0da88d64ee0cf6c89608f7a071e90d883aa96291`;
- `WI-R8.md` — blob `237c752671573013d090e2eacf7c2af4c0e70512`.

## 2. Direct R8 source state

R8 §16 records a recalled reconciliation-capability taxonomy with these candidate values:

- `RECONCILABLE_BY_RUN_ID`
- `RECONCILABLE_BY_RESOURCE_ID`
- `IDEMPOTENT_REPLAY_ENFORCED`
- `OBSERVABLE_BY_AUTHORITATIVE_STATE`
- `UNRECONCILABLE`

But the same section immediately states that the reviewer **did not certify the exact enum from source** and requested direct source verification rather than memory-based promotion.

The artifact therefore freezes only the existence of a taxonomy/recovery obligation and explicitly marks the exact labels:

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD / NOT FROZEN AS NORMATIVE ENUM`

It further says implementation must **not derive an enum from this candidate list** until source or later governed adjudication establishes the exact contract.

This directly denies normative current-enum status to the candidate list as a set.

## 3. Three-axis adjudication

I2 separates three claims.

### Axis A — semantic completeness

Question: Are the five recalled distinctions proven to be the complete/correct reconciliation-capability taxonomy?

**Result:** NO.

Disposition:

`SEMANTIC_TAXONOMY_COMPLETENESS_UNRESOLVED`

The current record does not prove that there are exactly five normative classes, that no class is missing, that no two recalled classes should be merged, or that the recalled boundaries match the original contract exactly.

### Axis B — historical exact-name provenance

Question: Are the five literal strings source-confirmed as the original frozen taxonomy names?

**Result:** NO.

Disposition:

`EXACT_NAME_SOURCE_UNRESOLVED`

### Axis C — current recovered-contract normativity

Question: Even if historically unverified, are the five strings already normative vocabulary of the present recovered R8 contract, as R14 lifecycle labels and R20 phase strings are in I1?

**Result:** NO — for the candidate set as a taxonomy.

Disposition:

`CANDIDATE_LABEL_SET_NOT_NORMATIVE_IN_RECOVERED_CONTRACT`

R8 isolates the five strings in a source-unresolved exactness section, calls them recalled candidate values, says they are `NOT FROZEN AS NORMATIVE ENUM`, and expressly prohibits deriving an implementation enum from them.

This remains materially different from R14 and R20, whose operative contract sections themselves normatively use their current labels.

## 4. Concept-level support calibration inside the unresolved set

Adversarial review correctly found that the five recalled candidates are **not equally unsupported at the semantic-concept level**. Direct reread of the full R8 contract confirms a graded support picture.

This does **not** validate the five-state taxonomy, any exact label, or any class boundary. It only records which underlying concepts already have independent normative footing elsewhere in R8.

| Recalled candidate | Independent semantic support elsewhere in R8 | Calibration |
|---|---|---|
| `RECONCILABLE_BY_RUN_ID` | No direct confirmed rule establishes a distinct run-ID reconciliation-capability class | `WEAK_HINT_ONLY` |
| `RECONCILABLE_BY_RESOURCE_ID` | No direct confirmed rule establishes a distinct resource-ID reconciliation-capability class | `WEAK_HINT_ONLY` |
| `IDEMPOTENT_REPLAY_ENFORCED` | R8 §8 independently states retry is allowed when the provider/API contract supplies a replay-safe/idempotent mechanism bound to the exact execution identity | `CONCEPT_INDEPENDENTLY_SUPPORTED / TAXONOMY_MEMBERSHIP_AND_LABEL_UNRESOLVED` |
| `OBSERVABLE_BY_AUTHORITATIVE_STATE` | R8 §§2, 4, 5, 6, and 8 repeatedly require reconciliation from authoritative evidence / authoritative external truth before retry, release, or adoption | `CONCEPT_INDEPENDENTLY_SUPPORTED / TAXONOMY_MEMBERSHIP_AND_LABEL_UNRESOLVED` |
| `UNRECONCILABLE` | R8 normatively distinguishes reconcilable versus unreconcilable uncertainty and defines `OUTCOME_UNCERTAIN_UNRECONCILABLE` / `EXPOSURE_COMMITTED_UNRECONCILABLE`; however, it is unresolved whether §16 recalls a separate reconciliation-capability class or merely related outcome terminology | `CONCEPT_SUPPORTED / CLASS-OWNERSHIP-BOUNDARY_AMBIGUOUS / LABEL_UNRESOLVED` |

### 4.1 Consequence of the calibration

The recalled set must not be treated as uniformly speculative during future source recovery or re-derivation.

A future re-deriver has stronger sourced starting points for:

- replay-safe/idempotent execution semantics;
- authoritative-state/evidence-based reconciliation;
- unreconcilable external uncertainty as a real semantic condition.

But those starting points still do **not** establish:

- that these concepts are members of one reconciliation-capability enum;
- that the recalled labels are correct;
- that the run-ID/resource-ID split is real;
- that there are exactly five classes;
- that `UNRECONCILABLE` belongs to capability classification rather than outcome classification.

The run-ID/resource-ID distinction remains the least supported portion of the recalled set on the current record.

## 5. What is semantically recovered in R8

The unresolved taxonomy does not erase the recovered R8 safety contract.

The available artifact still normatively requires, among other things:

- exact external execution identity;
- authoritative distinction between request intent and provider-side terminal truth;
- reconciliation before unsafe retry where the boundary may have been crossed;
- preservation of exact provider/account identity;
- no cross-account substitution when establishing historical execution truth;
- conservative treatment of unresolved external uncertainty;
- separation of R8 technical external truth from R15/R16 financial truth;
- no retry authority merely because a local worker/process failed;
- retry only under authoritative non-dispatch proof, replay-safe/idempotent provider semantics, or a reconciled terminal result that explicitly permits a successor execution.

Therefore H1-S01 is a missing taxonomy/decision-model detail inside an otherwise substantially recovered fail-closed safety envelope.

## 6. Safe current consequence

Because the exact taxonomy is unresolved, no current or future implementation may use the recalled five-label set to broaden execution authority.

Safe rule:

> **If the system cannot establish the reconciliation capability required to prove an external retry/replay safe, the unresolved capability must not authorize retry.**

This preserves H1's `SAFE-CONSERVATIVE` consequence.

The stronger concept support recorded in §4 cannot itself grant broader retry authority. In particular, recognizing that replay-safe/idempotent behavior is a confirmed concept does not authorize an implementation to classify arbitrary executions as `IDEMPOTENT_REPLAY_ENFORCED` without governed proof that the exact provider/execution contract satisfies that condition.

## 7. Recovery / remediation treatments

I2 recognizes three legitimate future resolution paths.

### 7.1 Source recovery

Recover a stronger original R8 confirmation source that establishes:

- taxonomy membership/cardinality;
- semantic boundaries between classes;
- exact literal labels, if historically frozen.

Only then may a recovered set become historical exact-name evidence.

### 7.2 Independent semantic re-derivation

If historical source cannot be recovered, a later governed remediation may independently derive a complete reconciliation-capability model from R8's recovered safety invariants and actual provider/execution behaviors.

That process must establish semantic completeness **before** choosing names.

The recalled five may be retained as non-authoritative hints, but with the concept-support calibration in §4 to reduce anchoring error. Independently supported concepts may serve as source-grounded inputs; weak ID-based recollections may not be assumed true merely because they were remembered.

This document does not perform that semantic remediation. H1-S01 retains ownership of semantic resolution.

### 7.3 Governed new taxonomy

After independent semantic adjudication, corrected governance may adopt a new canonical taxonomy and names.

Any such taxonomy is:

`POST_RECOVERY_GOVERNED_TAXONOMY / NOT HISTORICAL RECOVERY`

unless stronger source independently proves identity with the historical contract.

## 8. Mandatory attack adjudication

### I-A1 — candidate-name laundering

Repeated use of recalled strings does not establish source provenance.

**PASS.**

### I-A2 — neutral-placeholder test

Removing the five recalled labels leaves R8's broad fail-closed safety rules intelligible, but does not produce a complete taxonomy.

**PASS:** R8 remains dual-layer, not naming-only.

### I-A3 — cardinality drift

Freezing exactly five classes merely because five labels were recalled is rejected.

**PASS.**

### I-A4 — cross-node vocabulary substitution

R6/R16/R18 or other node vocabularies do not establish R8 taxonomy provenance.

**PASS.**

### I-A6 — R8 dual-layer laundering

Certifying the five labels while H1-S01 semantic completeness remains unresolved is rejected categorically.

**PASS.**

### I-A9 — governed replacement laundering

Any newly derived/adopted taxonomy remains explicitly post-recovery unless source establishes historical identity.

**PASS condition retained.**

### I-A10 — concept-to-taxonomy laundering

New attack added from adversarial review.

Attack: because one recalled concept has independent normative support elsewhere in R8, promote that recalled literal into a confirmed taxonomy member or use it as evidence that the five-state set is substantially recovered.

**PASS condition:** independently supported concept semantics remain distinct from taxonomy membership, exact label provenance, and full-set cardinality.

## 9. Comparison with I1 dispositions

R8 remains intentionally outside every I1 current-vocabulary posture.

It is not:

- `NO_COMPLETE_CANDIDATE_SET` in the ordinary I1 sense, because a recalled candidate set exists;
- `NORMATIVE_RECOVERED_CONTRACT_LABELS_HISTORICAL_EXACTNESS_UNRESOLVED`, because R8 expressly denies current normative enum status to the set;
- `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED`, because the five strings purport to be taxonomy values rather than a descriptive heading.

I2 uses:

`RECALLED_NONNORMATIVE_CANDIDATE_SET / SEMANTIC_MODEL_UNRESOLVED`

The §4 concept-level support matrix is a secondary evidence calibration inside this set-level posture, not a different primary disposition.

## 10. Source state

Phase-H source state remains:

`SOURCE_PARTIALLY_EXHAUSTED`

I2 performs no source-state upgrade or downgrade.

## 11. Arithmetic and Phase-I impact

I2 primary items: **1/1**.

For I-01:

- semantic taxonomy complete/source-confirmed: **0/1**;
- historical exact-name set source-confirmed: **0/1**;
- current recovered-contract normative candidate set: **0/1**;
- source-state changes: **0**;
- safe-conservative rule remains available: **1/1**.

Concept-level calibration inside the single I2 item:

- independently supported underlying concepts: **2/5** — replay-safe/idempotent; authoritative-state/evidence observation;
- concept supported but taxonomy-class ownership ambiguous: **1/5** — unreconcilable;
- weak recollection without independent class support: **2/5** — run-ID; resource-ID.

This **2 + 1 + 2 = 5** internal calibration does not split I-01 into five primary Phase-I items.

Combined Phase-I status after I2:

- total Phase-I items: **9**;
- I1 naming-only items: **8**;
- I2 dual-layer items: **1**;
- historical exact-name sets source-confirmed across Phase I: **0/9**;
- normative recovered-contract label sets despite unresolved historical exactness: **2/9** — R14 lifecycle and R20 phases;
- recalled candidate label set explicitly non-normative in recovered contract: **1/9** — R8;
- remaining naming-only postures: **6/9**.

Arithmetic: `2 + 1 + 6 = 9`.

## 12. Adversarial review adjudication

Adversarial review accepted the three-axis framework and the set-level R8 disposition, but correctly rejected any implication that all five recalled concepts were equally unsupported.

Direct R8 reread established:

1. replay-safe/idempotent mechanism semantics are independently normative in §8;
2. authoritative-evidence reconciliation is independently normative throughout the R8 mission/ordering/retry rules;
3. unreconcilable uncertainty is independently normative as an outcome/exposure condition, but its relationship to a recalled capability class remains ambiguous;
4. the run-ID/resource-ID split lacks comparable independent class-level support in the current artifact.

This refinement sharpens future re-derivation inputs without validating the recalled taxonomy or any historical label.

## 13. I2 result

`I2 COMPLETE / R8 TAXONOMY SEMANTIC COMPLETENESS UNRESOLVED / HISTORICAL EXACT LABELS UNRESOLVED / FIVE-LABEL SET EXPLICITLY NON-NORMATIVE IN CURRENT RECOVERED CONTRACT / CONCEPT SUPPORT GRADED 2 SUPPORTED + 1 OWNERSHIP-AMBIGUOUS + 2 WEAK / SOURCE_PARTIALLY_EXHAUSTED UNCHANGED / UNKNOWN CAPABILITY MAY NOT AUTHORIZE RETRY / FUTURE RESOLUTION REQUIRES SOURCE RECOVERY OR H1-OWNED INDEPENDENT SEMANTIC ADJUDICATION BEFORE NAMING`

Implementation authority remains **SUSPENDED**.

Next: **I3 — final Phase-I synthesis**.
