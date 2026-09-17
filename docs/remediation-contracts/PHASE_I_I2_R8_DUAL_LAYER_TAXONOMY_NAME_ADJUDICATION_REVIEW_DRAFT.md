# Phase I — I2 R8 Dual-Layer Taxonomy / Name Adjudication — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
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

This language is stronger than ordinary historical-name uncertainty. It directly denies normative current-enum status to the candidate list.

## 3. Three-axis adjudication

I2 separates three claims that were easy to conflate before Phase I:

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

This follows directly from R8's statement that the reviewer did not certify the exact enum from source.

### Axis C — current recovered-contract normativity

Question: Even if historically unverified, are the five strings already normative vocabulary of the present recovered R8 contract, as R14 lifecycle labels and R20 phase strings are in I1?

**Result:** NO.

Disposition:

`CANDIDATE_LABEL_SET_NOT_NORMATIVE_IN_RECOVERED_CONTRACT`

Reason: R8 does not structure its operative reconciliation contract around these five labels as authoritative states/classes. It isolates them in a source-unresolved exactness section, calls them recalled candidate values, says they are `NOT FROZEN AS NORMATIVE ENUM`, and expressly prohibits deriving an implementation enum from them.

This is materially different from:

- R14, where lifecycle sections normatively use `ACTIVE`, `DRAINING`, `QUIESCED`, etc.;
- R20, where phase sections normatively use `PREFLIGHT`, `BOUNDARY_VALIDATION`, and `ADOPTION_VALIDATION` while historical spelling remains unresolved.

R8's five strings therefore have neither historical-source authority nor present recovered-contract naming authority.

## 4. What *is* semantically recovered in R8

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
- unknown reconciliation capability must not be treated as proof that retry is safe.

Therefore H1-S01 is a missing taxonomy/decision-model detail inside an otherwise substantially recovered fail-closed safety envelope.

## 5. Safe current consequence

Because the exact taxonomy is unresolved, no current or future implementation may use the recalled five-label set to broaden execution authority.

Safe rule:

> **If the system cannot establish the reconciliation capability required to prove an external retry/replay safe, the unresolved capability must not authorize retry.**

This preserves H1's `SAFE-CONSERVATIVE` consequence.

The missing taxonomy may later improve precision, routing, or permissive automation. Its absence must not be converted into optimistic retry authority.

## 6. Recovery / remediation treatments

I2 recognizes only three legitimate future resolution paths:

### 6.1 Source recovery

Recover a stronger original R8 confirmation source that establishes:

- taxonomy membership/cardinality;
- semantic boundaries between classes;
- exact literal labels, if historically frozen.

Only then may the recovered set become historical exact-name evidence.

### 6.2 Independent semantic re-derivation

If historical source cannot be recovered, a later governed remediation may independently derive a complete reconciliation-capability model from R8's recovered safety invariants and the actual provider/execution behaviors the system must distinguish.

That process must establish semantic completeness **before** choosing names.

The recalled five may be considered as non-authoritative hints, but they may not be assumed correct merely because they were remembered.

### 6.3 Governed new taxonomy

After independent semantic adjudication, corrected governance may adopt a new canonical taxonomy and names.

Any such taxonomy is:

`POST_RECOVERY_GOVERNED_TAXONOMY / NOT HISTORICAL RECOVERY`

unless stronger source independently proves identity with the historical contract.

## 7. Mandatory attack adjudication

### I-A1 — candidate-name laundering

Attack: repeated use of the five recalled strings elsewhere causes them to be called source-confirmed.

**PASS condition retained:** repetition is not source provenance.

### I-A2 — neutral-placeholder test

For ordinary naming-only items, neutral placeholders preserve the complete semantic model. R8 behaves differently.

If the five recalled labels are replaced with placeholders, R8's broad fail-closed safety rules remain intelligible, but the **complete taxonomy itself is still missing**.

Therefore I-A2 does not convert R8 into naming-only status.

### I-A3 — cardinality drift

Attack: freeze exactly five classes because five labels were recalled.

**PASS:** rejected. Cardinality is not source-confirmed.

A later semantic derivation may conclude five classes, fewer classes, more classes, or different boundaries, provided the full R8 safety obligations are preserved and the derivation is independently justified.

### I-A4 — cross-node vocabulary substitution

Attack: infer R8 taxonomy names from R6 readiness, R18 binding disposition, R16 reconciliation status, or another node's similarly named categories.

**PASS:** rejected. Adjacent state vocabularies do not establish R8 taxonomy provenance or ownership.

### I-A6 — R8 dual-layer laundering

Attack: certify the five labels while H1-S01's semantic completeness remains unresolved.

**PASS:** rejected categorically.

### I-A9 — governed replacement laundering

Attack: later adopt a governed taxonomy, then describe it as the recovered historical R8 taxonomy.

**PASS condition:** any newly derived/adopted taxonomy remains explicitly post-recovery unless source establishes historical identity.

## 8. Comparison with I1 dispositions

R8 is intentionally outside every I1 current-vocabulary posture.

It is **not**:

- `NO_COMPLETE_CANDIDATE_SET` in the ordinary I1 sense, because there *is* a recalled candidate set;
- `NORMATIVE_RECOVERED_CONTRACT_LABELS_HISTORICAL_EXACTNESS_UNRESOLVED`, because R8 expressly denies current normative enum status;
- `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED`, because the five strings purport to be taxonomy values rather than a mere descriptive heading.

I2 therefore uses the distinct posture:

`RECALLED_NONNORMATIVE_CANDIDATE_SET / SEMANTIC_MODEL_UNRESOLVED`

This posture captures both layers without pretending either is settled.

## 9. Source state

Phase-H source state remains:

`SOURCE_PARTIALLY_EXHAUSTED`

I2 performs no source-state upgrade or downgrade.

The available-record stratum is insufficient to certify the taxonomy, while a stronger original R8 source class remains plausible.

## 10. Arithmetic and Phase-I impact

I2 primary items: **1/1**.

For I-01:

- semantic taxonomy complete/source-confirmed: **0/1**;
- historical exact-name set source-confirmed: **0/1**;
- current recovered-contract normative candidate set: **0/1**;
- source-state changes: **0**;
- safe-conservative rule remains available: **1/1**.

Combined Phase-I status after provisional I2:

- total Phase-I items: **9**;
- naming-only items adjudicated in I1: **8**;
- dual-layer items adjudicated in I2: **1**;
- historical exact-name sets source-confirmed across Phase I: **0/9**;
- items with normative recovered-contract label sets despite unresolved historical exactness: **2/9** — R14 lifecycle and R20 phases;
- items with recalled candidate labels explicitly non-normative in the recovered contract: **1/9** — R8;
- remaining naming-only postures: **6/9** — five no-complete-candidate items + one descriptive-label item.

Arithmetic: `2 + 1 + 6 = 9`.

## 11. Review questions

Adversarial review should pressure especially:

1. Is the three-axis distinction correct: semantic completeness unresolved, historical exactness unresolved, and current recovered-contract normativity absent?
2. Does R8's phrase `NOT FROZEN AS NORMATIVE ENUM` decisively distinguish it from R14/R20 current-contract vocabulary, or is there contrary normative use elsewhere in R8?
3. Does any part of R8's contract establish one or more of the five recalled classes individually strongly enough to partially recover taxonomy membership even if the complete set remains unresolved?
4. Is the safe consequence stated strongly enough: unresolved reconciliation capability must never authorize retry/replay?
5. Does allowing independent re-derivation risk silently turning Phase I into semantic remediation rather than preserving H1 ownership?
6. Should the recalled five be retained as evidence/hints during future re-derivation, or quarantined more strictly to avoid anchoring bias?
7. Does the combined Phase-I arithmetic correctly keep historical exact-name confirmations at 0/9 while distinguishing current recovered-contract normativity for only R14 and R20 phases?

## 12. Provisional I2 result

`I2 COMPLETE FOR REVIEW / R8 TAXONOMY SEMANTIC COMPLETENESS UNRESOLVED / HISTORICAL EXACT LABELS UNRESOLVED / FIVE RECALLED LABELS EXPLICITLY NON-NORMATIVE IN CURRENT RECOVERED CONTRACT / SOURCE_PARTIALLY_EXHAUSTED UNCHANGED / UNKNOWN CAPABILITY MAY NOT AUTHORIZE RETRY / FUTURE RESOLUTION REQUIRES SOURCE RECOVERY OR INDEPENDENT SEMANTIC ADJUDICATION BEFORE NAMING`

Implementation authority remains **SUSPENDED**.
