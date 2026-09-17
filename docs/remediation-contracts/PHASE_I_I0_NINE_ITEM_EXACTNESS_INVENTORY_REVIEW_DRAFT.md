# Phase I — I0 Nine-Item Exactness Inventory — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** I — phase/name/source exactness  
**Batch:** I0 — exactness inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

I0 freezes the complete Phase-I inventory before any exact-name adjudication. It does not decide that any candidate/current label is historically exact. It records, for each Phase-H handoff item:

- node and immutable source blob;
- upstream Phase-H gap ID;
- semantic dependency state;
- current/candidate labels, where any exist;
- the provenance strength of those labels;
- Phase-H source-exhaustion state;
- whether a stronger source tier remains plausible;
- whether the item belongs in I1 naming-only review or I2 dual-layer review.

Governing plan: `PHASE_I_PHASE_NAME_SOURCE_EXACTNESS_AUDIT_PLAN.md` blob `fd05720385ed6766bbf9a6217a03ed92db01104b`.

Canonical Phase-H source-gap register: `PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md` blob `61482afb26c753819d19df1d0dc288be696d0838`.

## 2. Label-provenance classes used by I0

I0 distinguishes source state from label provenance. All nine items inherit the same Phase-H source state (`SOURCE_PARTIALLY_EXHAUSTED`), but their current labels have materially different evidentiary strength.

- `RECALLED_CANDIDATE_SET` — the artifact expressly says the labels are recalled candidates and not source-certified.
- `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED` — current labels are used to express recovered semantic states/classes, but the artifact expressly leaves exact historical enum/string identity unresolved.
- `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` — semantics are recovered, but the artifact does not even claim a complete current candidate historical enum/name set.
- `SOURCE_CONFIRMED_STRUCTURE_CURRENT_STRINGS_UNCONFIRMED` — the semantic/cardinality structure is explicitly source-confirmed while current literal strings remain exactness-unresolved.
- `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED` — the current corpus uses a descriptive requirement name, but its historical frozen label is expressly unknown.

None of these classes equals `EXACT_NAME_SOURCE_CONFIRMED`.

## 3. I0 primary inventory — 9/9

| I-ID | Node | H-gap | Node blob | Semantic state | Current/candidate label evidence | Label-provenance class | Phase-H source state | Stronger source tier | Next batch |
|---|---|---|---|---|---|---|---|---|---|
| I-01 | R8 | H1-S01 | `237c752671573013d090e2eacf7c2af4c0e70512` | taxonomy membership/completeness itself unresolved | recalled candidates: `RECONCILABLE_BY_RUN_ID`, `RECONCILABLE_BY_RESOURCE_ID`, `IDEMPOTENT_REPLAY_ENFORCED`, `OBSERVABLE_BY_AUTHORITATIVE_STATE`, `UNRECONCILABLE` | `RECALLED_CANDIDATE_SET` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R8 confirmation source may still appear | I2 |
| I-02 | R11 | H2-E10 | `f811d528730d819aa793a1901e9d1b310242fbcd` | corrective-class routing semantics confirmed | record gives semantic class descriptions (repair, revise Product Definition, revise Architecture, replan, capability verification/acquisition, reconciliation, Human, termination) plus some separately recovered state/route literals, but explicitly says exact enum names/storage for every corrective class remain unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R11 confirmation source | I1 |
| I-03 | R12 | H2-E13 | `7a4a186fc2fd030d6ee52725b1111395597ffa90` | durable due/runnable/claim/occurrence semantics confirmed | current contract describes due, runnable, materialized, claimed/in-flight, completed, successor, paused, superseded, terminal semantics; exact runnable/job/claim enum names are explicitly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R12 confirmation source | I1 |
| I-04 | R14 | H2-E19 | `969b70e8b4b52606c9e34f617bed32a91b395d25` | incumbent/successor lifecycle semantics confirmed | incumbent labels currently used: `ACTIVE → DRAINING → QUIESCED → HANDOFF_READY → RETIRED`; successor labels: `STARTING → READY_CANDIDATE → AUTHORITATIVE_ACTIVE`; artifact says exact lifecycle enum/storage representation remains unresolved if different from recovered semantic states | `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R14 confirmation source | I1 |
| I-05 | R16 | H2-E28 | `7dd92976f68ee90540771b3710e42b6d5b7f396f` | informational/non-authoritative-for-balance distinction confirmed | semantic class is described as informational / non-authoritative-for-balance; exact storage enum name, if separately frozen, is expressly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R16 confirmation source | I1 |
| I-06 | R17 | H2-E31 | `16a234e897fe6e119392707a7187a3232f0fd972` | Offer/Grant lifecycle, revocation, supersession and monotonic-history semantics confirmed | artifact requires grant status/lifecycle and revocation/supersession history but expressly lists exact Offer/Grant lifecycle enum names as unrecovered; no complete historical candidate enum is asserted | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R17 confirmation source | I1 |
| I-07 | R20 | H2-E41 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | boundary classes are semantically operation-specific by predicate ownership | artifact gives examples such as provider dispatch, customer checkout/charge, production release, result adoption, headroom release, Offer activation, handoff completion, renewal, reversal; exact literal boundary-class names remain expressly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R20 confirmation source | I1 |
| I-08 | R20 | H2-E42 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | three-part phase structure explicitly source-confirmed | current strings: `PREFLIGHT`, `BOUNDARY_VALIDATION`, `ADOPTION_VALIDATION`; R20 expressly says exact literal enum strings remain subject to final source confirmation | `SOURCE_CONFIRMED_STRUCTURE_CURRENT_STRINGS_UNCONFIRMED` | `SOURCE_PARTIALLY_EXHAUSTED` | richer original R20 source record | I1 |
| I-09 | R20 | H2-E44 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | forward engineering-governance requirement semantically normative | current corpus calls it the `forward engineering-governance requirement` / future consequential-surface classification-registration rule; exact historical name is expressly source-unresolved | `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R20 confirmation source | I1 |

## 4. Inventory arithmetic

Primary Phase-I items: **9**.

- I1 naming-only items: **8** (`I-02` through `I-09`);
- I2 dual-layer semantic dependency: **1** (`I-01` / R8);
- `SOURCE_PARTIALLY_EXHAUSTED`: **9/9**;
- `EXACT_NAME_SOURCE_CONFIRMED` at I0: **0/9**;
- source-state upgrades performed by I0: **0**.

Arithmetic: `8 + 1 = 9`.

## 5. R13 denominator challenge — carried as explicit negative inventory result

R13 is not added.

Direct R13 review established that `REQUIRED`, `OPTIONAL`, `INTENTIONALLY_DISABLED`, and `NOT_APPLICABLE` are presented as recovered expectation classes and repeated in the source-recoverable acceptance semantics. The explicit unresolved R13 source gap is the Executor Expectation Registry **schema/storage representation**, not those four category names.

Therefore:

`R13 EXPECTATION CATEGORY LABELS — NO CURRENT PHASE-I PRIMARY`.

If stronger contrary source later shows those names were only reconstruction labels, the denominator must reopen. I0 does not assume future evidence cannot change this negative result.

## 6. I0 source-strength observations

### 6.1 R8 is uniquely weaker than naming-only items

R8 is not merely “labels unknown.” The candidate five-state taxonomy itself is not certified as the complete/correct semantic model. I1 must not consume I-01. It remains I2-owned and dependent on H1-S01 semantic resolution/re-derivation.

### 6.2 R20 phase strings are uniquely stronger semantically, not historically

R20's three-phase cardinality/order/function is explicitly source-confirmed. This makes I-08 the strongest semantic foundation in Phase I, but it does **not** make the current three strings historically exact.

### 6.3 Recovered semantic labels are not historical-name proof

R14 is the clearest example. Current lifecycle labels are used consistently to express recovered lifecycle semantics, but the artifact itself preserves the possibility that the exact historical enum/storage labels differed. Current consistency is useful for comprehension and future governance, not historical source proof.

### 6.4 No-candidate-set is a valid inventory outcome

I-02, I-03, I-05, I-06, and I-07 do not need a guessed historical candidate enum merely to make Phase I look complete. Their correct inventory state is that the semantic distinctions are known while the exact historical naming set is not reconstructed from the available record.

### 6.5 Current descriptive terminology does not become an enum by repetition

I-09 uses a stable current description for the forward-governance requirement. That phrase can remain useful current terminology without being promoted into a claim about the original historical frozen label.

## 7. I0 attack pre-checks

I0 does not execute the full I1/I2 attack suite, but it verifies that the inventory is structured so those attacks can be run without ambiguity:

- I-A1 candidate-name laundering: current/recalled/reconstructed labels are explicitly provenance-classified;
- I-A2 semantic bleed: all eight naming-only items already passed neutral-placeholder review during plan adjudication;
- I-A3 cardinality drift: semantic cardinality belongs to upstream contracts, not to whatever names Phase I later chooses;
- I-A4 cross-node vocabulary substitution: no row cites another node's vocabulary as historical-name evidence;
- I-A5 storage contamination: R13 is excluded and ordinary schema/field-name exactness remains in H2;
- I-A6 R8 dual-layer laundering: I-01 is isolated to I2;
- I-A7 R20 phase-string overclaim: I-08 records source-confirmed structure separately from literal-string exactness;
- I-A8 Phase-I/Phase-J collapse: I-09 contains only historical label exactness; H2-E45 historical mechanism and Phase J future-code coverage remain outside I0;
- I-A9 replacement laundering: no replacement label is adopted in I0.

## 8. Review questions

Adversarial review should pressure:

1. Does any row overstate the evidentiary strength of the current labels?
2. Is `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED` appropriate for R14, or does the artifact support stronger exact-name confidence?
3. Are I-02/I-03/I-05/I-06/I-07 correctly represented as lacking a complete candidate historical enum rather than silently treating their semantic English descriptions as enum candidates?
4. Is I-08 correctly stronger only at the semantic/cardinality layer, not at literal-string provenance?
5. Is I-09's current descriptive phrase being kept sufficiently separate from an alleged historical name?
6. Did I0 accidentally add any ordinary storage/schema wording that belongs only in H2?
7. Does the R13 negative denominator result still hold after direct source verification?
8. Are there any other current corpus labels among the 57 Phase-H gaps that meet the Phase-I inclusion test but were omitted from H4 and I0?

## 9. Provisional I0 result

`I0 INVENTORY COMPLETE 9/9 / 8 NAMING-ONLY + 1 R8 DUAL-LAYER / 9 SOURCE-PARTIALLY-EXHAUSTED / 0 EXACT HISTORICAL NAMES SOURCE-CONFIRMED AT INVENTORY STAGE / R13 REMAINS EXCLUDED`

Implementation authority remains **SUSPENDED**.
