# Phase I — I0 Nine-Item Exactness Inventory

**Status:** FINAL / REVIEWED / ADJUDICATED / I0 COMPLETE  
**Phase:** I — phase/name/source exactness  
**Batch:** I0 — exactness inventory  
**Implementation authority:** SUSPENDED

## 1. Purpose

I0 freezes the complete Phase-I inventory before exact-name adjudication. It does not decide that any candidate/current label is historically exact. It records, for each Phase-H handoff item:

- node and immutable source blob;
- upstream Phase-H gap ID;
- semantic dependency state;
- current/candidate labels, where any exist;
- provenance strength of those labels;
- Phase-H source-exhaustion state;
- stronger source tier, if any;
- I1 naming-only versus I2 dual-layer ownership.

Governing plan: `PHASE_I_PHASE_NAME_SOURCE_EXACTNESS_AUDIT_PLAN.md` blob `fd05720385ed6766bbf9a6217a03ed92db01104b`.

Canonical Phase-H source-gap register: `PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md` blob `61482afb26c753819d19df1d0dc288be696d0838`.

## 2. Label-provenance classes

I0 distinguishes source state from label provenance. All nine items inherit `SOURCE_PARTIALLY_EXHAUSTED`, but their current labels have materially different evidentiary strength.

- `RECALLED_CANDIDATE_SET` — labels are explicitly recalled candidates, not source-certified.
- `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED` — current labels express recovered semantic states/classes, but exact historical enum/string identity remains unresolved.
- `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` — semantics are recovered, but no complete candidate historical enum/name set is asserted.
- `SOURCE_CONFIRMED_STRUCTURE_CURRENT_STRINGS_UNCONFIRMED` — semantic/cardinality structure is explicitly source-confirmed while current literal strings remain exactness-unresolved.
- `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED` — current corpus uses a descriptive requirement name while its historical frozen label remains unknown.

None equals `EXACT_NAME_SOURCE_CONFIRMED`.

## 3. Canonical I0 inventory — 9/9

| I-ID | Node | H-gap | Node blob | Semantic state | Current/candidate label evidence | Label-provenance class | Phase-H source state | Stronger source tier | Next batch |
|---|---|---|---|---|---|---|---|---|---|
| I-01 | R8 | H1-S01 | `237c752671573013d090e2eacf7c2af4c0e70512` | taxonomy membership/completeness itself unresolved | recalled candidates: `RECONCILABLE_BY_RUN_ID`, `RECONCILABLE_BY_RESOURCE_ID`, `IDEMPOTENT_REPLAY_ENFORCED`, `OBSERVABLE_BY_AUTHORITATIVE_STATE`, `UNRECONCILABLE` | `RECALLED_CANDIDATE_SET` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R8 confirmation source may still appear | I2 |
| I-02 | R11 | H2-E10 | `f811d528730d819aa793a1901e9d1b310242fbcd` | corrective-class routing semantics confirmed | semantic class descriptions exist, but exact enum names/storage for every corrective class are explicitly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R11 confirmation source | I1 |
| I-03 | R12 | H2-E13 | `7a4a186fc2fd030d6ee52725b1111395597ffa90` | durable due/runnable/claim/occurrence semantics confirmed | current contract describes state semantics; exact runnable/job/claim enum names remain unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R12 confirmation source | I1 |
| I-04 | R14 | H2-E19 | `969b70e8b4b52606c9e34f617bed32a91b395d25` | incumbent/successor lifecycle semantics confirmed | current incumbent labels `ACTIVE → DRAINING → QUIESCED → HANDOFF_READY → RETIRED`; successor labels `STARTING → READY_CANDIDATE → AUTHORITATIVE_ACTIVE`; artifact explicitly preserves possibility exact historical enum/storage labels differed | `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R14 confirmation source | I1 |
| I-05 | R16 | H2-E28 | `7dd92976f68ee90540771b3710e42b6d5b7f396f` | informational/non-authoritative-for-balance distinction confirmed | semantic class is descriptive; exact storage enum name, if separately frozen, is expressly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R16 confirmation source | I1 |
| I-06 | R17 | H2-E31 | `16a234e897fe6e119392707a7187a3232f0fd972` | Offer/Grant lifecycle, revocation, supersession and monotonic-history semantics confirmed | lifecycle requirements are recovered; exact Offer/Grant lifecycle enum names remain expressly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R17 confirmation source | I1 |
| I-07 | R20 | H2-E41 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | boundary classes semantically operation-specific by predicate ownership | examples exist, but exact literal boundary-class names remain expressly unrecovered | `SEMANTIC_DESCRIPTIONS_NO_COMPLETE_CANDIDATE_ENUM` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R20 confirmation source | I1 |
| I-08 | R20 | H2-E42 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | three-part phase structure explicitly source-confirmed | current strings: `PREFLIGHT`, `BOUNDARY_VALIDATION`, `ADOPTION_VALIDATION`; exact literal strings remain source-checkable/unconfirmed | `SOURCE_CONFIRMED_STRUCTURE_CURRENT_STRINGS_UNCONFIRMED` | `SOURCE_PARTIALLY_EXHAUSTED` | richer original R20 source record | I1 |
| I-09 | R20 | H2-E44 | `d9d7788e4c5a8f4c0914cf845294b38386470333` | forward engineering-governance requirement semantically normative | current descriptive phrase is stable in recovered corpus; exact historical name remains expressly source-unresolved | `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED` | `SOURCE_PARTIALLY_EXHAUSTED` | stronger original R20 confirmation source | I1 |

## 4. Arithmetic

- primary Phase-I items: **9**;
- I1 naming-only items: **8** (`I-02` through `I-09`);
- I2 dual-layer semantic dependency: **1** (`I-01`);
- `SOURCE_PARTIALLY_EXHAUSTED`: **9/9**;
- `EXACT_NAME_SOURCE_CONFIRMED` at I0: **0/9**;
- source-state upgrades performed by I0: **0**.

Arithmetic: `8 + 1 = 9`.

## 5. R13 omission challenge — final negative inventory result

R13 is not added.

Direct review established that `REQUIRED`, `OPTIONAL`, `INTENTIONALLY_DISABLED`, and `NOT_APPLICABLE` are presented as recovered expectation classes and repeated in R13's source-recoverable acceptance semantics. R13's explicit unresolved source gap is the Executor Expectation Registry **schema/storage representation**, not those four category names.

This differs materially from R16, whose artifact expressly says the exact informational storage enum/string name remains source-unresolved.

Therefore:

`R13 EXPECTATION CATEGORY LABELS — NO CURRENT PHASE-I PRIMARY`.

If stronger contrary source later shows those names were only reconstruction labels, the denominator reopens.

## 6. Adversarial review adjudication

Adversarial review directly rechecked the three highest-risk inventory claims:

1. **R14 provenance:** current classification is correct. R14 §24 says the exact lifecycle enum/storage representation may differ from the recovered semantic states. This is weaker than R13's settled category-name treatment and directly supports `RECOVERED_SEMANTIC_LABELS_EXACTNESS_UNCONFIRMED`.
2. **No-complete-candidate-enum group:** I-02/I-03/I-05/I-06/I-07 are correctly kept as semantic descriptions rather than fabricated enum candidate sets. Their artifacts define functional distinctions but do not assert complete historical string sets.
3. **Denominator omission scan:** no additional Phase-I candidate was found among the remaining H2 exactness entries. Closest exclusions were checked explicitly: R15 synthetic fingerprint is algorithmic representation; R19 transaction/customer-contract/session names are storage/field identifiers; R11/R12 deterministic keys are serialization/identity representation. These remain H2 exactness, not semantic naming.

The review also reaffirmed that all eight naming-only items pass I-A2 neutral-placeholder substitution without changing substantive semantics.

## 7. I0 result

`I0 COMPLETE / 9-ITEM INVENTORY CONFIRMED / 8 NAMING-ONLY + 1 R8 DUAL-LAYER / 9 SOURCE-PARTIALLY-EXHAUSTED / 0 EXACT HISTORICAL NAMES SOURCE-CONFIRMED / R13 AND REMAINING H2 OMISSION CHALLENGES RESOLVED`

Implementation authority remains **SUSPENDED**.

Next: **I1 — naming-only adjudication for I-02 through I-09**.