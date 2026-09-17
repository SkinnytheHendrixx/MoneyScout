# Phase I — Phase / Name / Source Exactness Audit Plan

**Status:** FINAL / REVIEWED / ADJUDICATED / GOVERNING PHASE-I PLAN  
**Phase:** I — phase/name/source exactness  
**Implementation authority:** SUSPENDED

## 1. Purpose

Phase I resolves the narrow class of places where substantive semantics are already recovered but exact historical names, labels, phase strings, enum/class names, or taxonomy labels remain source-unresolved.

Phase I does **not** reopen recovered semantics merely because exact names are missing, and it does **not** convert a plausible/reconstructed current label into historical fact without source support.

Governing artifacts:

- `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md` — Phase I requires explicit resolution where semantics are confirmed but frozen naming remains uncertain;
- `GLOBAL_FIDELITY_CROSS_NODE_AUDIT-REFINEMENT-1.md` — any later `SOURCE_EXHAUSTED` conclusion still requires targeted reread;
- `PHASE_H_H4_GLOBAL_SOURCE_GAP_REGISTER_SYNTHESIS.md` — canonical Phase-I handoff = 9 items.

## 2. Governing discrimination rule

For each handoff item ask, in order:

1. **Are the underlying semantic distinctions themselves complete and confirmed?**
2. **If yes, is only the exact historical name/string/enum label unresolved?**
3. **If no, does a semantic dependency have to be resolved before exact naming can be certified?**
4. **What source tier supports any candidate label?**
5. **Can the candidate label be used as a current governed replacement without falsely claiming historical exactness?**

A name may be:

- `EXACT_NAME_SOURCE_CONFIRMED` — direct source establishes historical exact name;
- `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED` — semantic distinction is fixed, exact historical name is not;
- `NAME_DEPENDS_ON_UNRESOLVED_SEMANTIC_MODEL` — exact naming cannot be resolved independently because the underlying taxonomy/model is still semantically unresolved;
- `GOVERNED_REPLACEMENT_NAME_ADOPTABLE` — historical exact name remains unknown, but a new canonical current name may be adopted under corrected governance if needed;
- `NAME_SOURCE_NOT_YET_EXHAUSTED` / `NAME_SOURCE_PARTIALLY_EXHAUSTED` / `NAME_SOURCE_AVAILABILITY_UNRESOLVED` — source-state carried from Phase H where applicable.

`GOVERNED_REPLACEMENT_NAME_ADOPTABLE` is never evidence that the replacement was the original historical name.

## 3. Fixed Phase-I handoff — 9 items

### I-01 — R8 reconciliation-capability taxonomy labels

Source gap: H1-S01. Candidate labels currently recalled:

- `RECONCILABLE_BY_RUN_ID`
- `RECONCILABLE_BY_RESOURCE_ID`
- `IDEMPOTENT_REPLAY_ENFORCED`
- `OBSERVABLE_BY_AUTHORITATIVE_STATE`
- `UNRECONCILABLE`

Current contract explicitly says the reviewer did **not** certify the exact enum from source and implementation must not derive a normative enum from the candidate list.

**Initial Phase-I class:** `NAME_DEPENDS_ON_UNRESOLVED_SEMANTIC_MODEL`.

Reason: H1 already established two-layer uncertainty — it is unresolved whether these five recalled distinctions themselves are the correct/complete normative taxonomy, not merely what to call a settled five-state model.

### I-02 — R11 corrective-class names

Source gap: H2-E10.

Recovered corrective-class semantics and routing are substantive; exact historical enum/class names/storage remain unresolved.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

### I-03 — R12 runnable/job/claim state names

Source gap: H2-E13.

Recovered scheduling semantics require durable states distinguishing due/runnable/materialized/claimed/in-flight/completed/successor/paused/superseded/terminal behavior. Exact historical storage enum/field names are expressly source-unresolved.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

### I-04 — R14 lifecycle names

Source gap: H2-E19.

Recovered incumbent and successor lifecycle semantics are explicit (`ACTIVE → DRAINING → QUIESCED → HANDOFF_READY → RETIRED`; `STARTING → READY_CANDIDATE → AUTHORITATIVE_ACTIVE`) but R14 provenance explicitly says exact lifecycle enum/storage representation was not regenerated from source.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED` pending exact-name source review.

The currently used labels are semantic reconstruction labels unless stronger source proves exact historical identity.

### I-05 — R16 informational-observation label

Source gap: H2-E28.

The informational/non-authoritative-for-balance semantic distinction is recovered. The exact storage enum/string name, if separately frozen, is expressly source-unresolved.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

### I-06 — R17 Offer/Grant lifecycle names

Source gap: H2-E31.

Offer Version/Grant lifecycle semantics, monotonic history, revocation, supersession, and historical authority preservation are recovered. Exact lifecycle enum names remain expressly not fully recoverable from the available record.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

### I-07 — R20 boundary-class names

Source gap: H2-E41.

Boundary classes/operation-specific predicate ownership are substantively recovered. Exact literal boundary-class names remain source-unresolved.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

### I-08 — R20 three-phase literal strings

Source gap: H2-E42.

The three-part semantic structure is explicitly source-confirmed. Current artifact uses:

- `PREFLIGHT`
- `BOUNDARY_VALIDATION`
- `ADOPTION_VALIDATION`

R20 itself says the **three-part phase structure is source-confirmed** while the exact literal enum strings remain subject to final source-level/global fidelity confirmation if richer original source surfaces.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED` with unusually strong semantic certainty.

### I-09 — R20 forward-governance historical label/name

Source gap: H2-E44.

The forward engineering-governance requirement is substantively recovered and Phase J owns coverage/mechanical enforcement of that requirement. Phase I owns only whether the requirement had an exact historical name/label and, if so, what it was.

**Initial Phase-I class:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

The separately split H2-E45 historical mechanical-enforcement form is **not** a Phase-I item.

## 4. Explicit omission adjudication — R13 Executor Expectation Registry categories

Adversarial review identified R13 as the strongest plausible omitted Phase-I candidate because the recovered Executor Expectation Registry uses four semantically meaningful categories:

- `REQUIRED`
- `OPTIONAL`
- `INTENTIONALLY_DISABLED`
- `NOT_APPLICABLE`

Direct R13 review resolves this candidate **without adding a tenth item**.

The current R13 artifact states that the recovered contract requires the Executor Expectation Registry and says:

> Recovered expectation classes include: `REQUIRED`, `OPTIONAL`, `INTENTIONALLY_DISABLED`, `NOT_APPLICABLE`.

It later repeats those exact four names inside the source-recoverable acceptance semantics. By contrast, R13's explicit source-gap section lists the unresolved item as the **exact Executor Expectation Registry schema/storage representation**; it does not list the four expectation-class labels as unresolved historical names.

Therefore:

`R13 EXPECTATION-CATEGORY NAMES — NOT A PHASE-I GAP ON CURRENT SOURCE RECORD`

This is materially different from R16's informational-observation label, whose artifact expressly says the exact storage enum/string name remains source-unresolved.

A repository search did not surface a deeper R13 source-review artifact contradicting the node artifact's classification. If later stronger source shows that these four R13 names were only reconstructed rather than source-recovered, Phase I must reopen the denominator and add the naming proposition then. Until such contrary evidence appears, H4's 9-item handoff remains correct.

## 5. Source discipline

For every item, Phase I records:

- current candidate/reconstructed name(s), if any;
- exact semantic distinction those names are supposed to denote;
- actual source artifact/stratum checked;
- whether the name is directly quoted/recovered, recalled, reconstructed, or merely a current convenience label;
- Phase-H source exhaustion state;
- whether a stronger source tier remains named/plausible;
- whether current corrected governance could safely adopt a replacement name without claiming historical exactness.

A corpus-wide repeated use of one label is **not** independent evidence that the label was historically frozen. Repetition can establish current consistency; it cannot manufacture source provenance.

## 6. Mandatory Phase-I attacks

### I-A1 — candidate-name laundering

Take a label used repeatedly in current recovered artifacts and ask whether repetition is being mistaken for source confirmation.

**Failure:** `CURRENTLY CONSISTENT` is promoted to `HISTORICALLY EXACT` without direct source evidence.

### I-A2 — semantic bleed from naming uncertainty

For naming-only items, remove the current literal label and replace it with neutral placeholders while preserving semantic distinctions.

**Pass condition:** the substantive contract remains fully intelligible and unchanged.

If removing the labels destroys the semantic model itself, the item is not naming-only and must be reclassified.

Adversarial review applied I-A2 to all eight provisional naming-only items and found all eight cleanly remain intelligible under neutral placeholders. That review result is now an explicit calibration input, not a substitute for I1's source adjudication.

### I-A3 — name substitution changes cardinality

Replace one candidate enum/phase set with aliases that accidentally merge or split semantic distinctions.

**Pass condition:** Phase I refuses any naming resolution that changes cardinality or behavioral distinctions established upstream.

### I-A4 — cross-node vocabulary substitution

A similarly named state/class in another node is proposed as evidence for the historical name here.

**Pass condition:** reject unless source proves the same frozen vocabulary was intentionally shared. Similar semantics or English words are not provenance.

### I-A5 — storage-name contamination

An unresolved database field/storage representation is treated as a Phase-I naming issue simply because it contains a name.

**Pass condition:** Phase I limits itself to semantically meaningful state/class/phase/taxonomy labels. Ordinary field/schema spelling remains H2 representation exactness.

### I-A6 — R8 dual-layer laundering

Freeze the recalled five R8 labels while leaving H1-S01's correct/complete taxonomy question unresolved.

**Pass condition:** reject. Exact-name certification is dependent on semantic-taxonomy resolution/re-derivation.

### I-A7 — R20 phase-string overclaim

Treat current `PREFLIGHT / BOUNDARY_VALIDATION / ADOPTION_VALIDATION` usage as proof of historical literal exactness merely because the three-phase semantics are source-confirmed.

**Pass condition:** preserve the three semantic phases while keeping literal historical strings unresolved unless stronger source confirms them.

### I-A8 — R20 Phase-I / Phase-J ownership collapse

Treat recovery of the forward-governance label as proof that future-code enforcement is covered, or treat Phase J's mechanical enforcement audit as proof of the historical label.

**Pass condition:** keep H2-E44/Phase I naming exactness separate from H2-E45 historical mechanism exactness and Phase J forward-coverage certification.

### I-A9 — governed replacement laundering

Adopt a new canonical label under corrected governance, then later refer to it as “recovered historical name.”

**Pass condition:** replacement remains explicitly versioned/provenanced as post-recovery governance, not historical recovery.

## 7. Phase-I batch sequence

### I0 — nine-item exactness inventory

Confirm all 9 handoff items, their node/source blobs, semantic dependency, Phase-H source state, and candidate names. Record the R13 omission adjudication as a denominator check.

### I1 — naming-only adjudication

Adjudicate I-02 through I-09 under attacks I-A1 through I-A5, I-A7, I-A8, I-A9.

### I2 — R8 dual-layer adjudication

Treat I-01 separately because exact labels cannot be certified independently of H1-S01 semantic-taxonomy completeness.

### I3 — final Phase-I synthesis

Produce:

- exact names source-confirmed, if any;
- names still historically unresolved;
- governed replacement names, if any, clearly marked non-historical;
- dependencies carried back to H1/H4;
- final Phase-I carry-forward into remediation and Phase J where applicable.

## 8. Counting rule

The Phase-I denominator is **9 handoff items**, not the number of individual literal strings.

Examples:

- R20's three literal phase strings are one primary exactness item because they are three values of one phase-enum naming proposition on one semantic surface;
- R8's candidate taxonomy is one item despite five candidate labels because the unresolved proposition is the exact taxonomy/name set as a whole;
- R20 forward-governance label is one naming proposition; the mechanical-enforcement form is already split into H2-E45 and excluded from Phase I.

The independent-recoverability rule does not require splitting every multi-literal enum into one item per value. It requires separation when missing names belong to independently recoverable semantic naming surfaces. R20's three phases are one coordinated enum/field surface rather than three independent authority objects.

## 9. Closure criteria

Phase I may close as an audit when:

1. all 9 H4 handoff items are adjudicated;
2. the R13 omission challenge remains resolved or the denominator is amended if stronger contrary source appears;
3. no naming-only uncertainty is mislabeled semantic uncertainty;
4. no semantic uncertainty is hidden behind a naming-only disposition;
5. every exact-name claim names its source basis;
6. candidate/reconstructed labels are not promoted to historical fact without source;
7. governed replacement labels, if adopted later, are explicitly non-historical;
8. R8 dual-layer dependency is preserved;
9. R20 three-phase semantics remain fixed regardless of literal-name outcome;
10. R20 Phase-I naming and Phase-J enforcement ownership remain distinct;
11. Phase-H source states are not silently upgraded;
12. adversarial review is complete;
13. implementation authority remains suspended pending the frozen global sequence.

## 10. Review-adjudication result

Adversarial plan review established:

- all eight provisional naming-only items pass I-A2;
- R20's three phase strings correctly remain one naming proposition because they are one coordinated enum/field surface, unlike prior H2 splits involving independent objects/surfaces;
- R13 Executor Expectation Registry category names are the strongest plausible omitted candidate but are currently source-recovered rather than source-unresolved, so the denominator remains 9.

## 11. Governing result

`PHASE I PLAN FINAL / 9-ITEM HANDOFF CONFIRMED / 8 NAMING-ONLY ITEMS / 1 DUAL-LAYER R8 DEPENDENCY / R13 OMISSION CHALLENGE RESOLVED WITHOUT DENOMINATOR CHANGE / NO EXACT HISTORICAL NAME PROMOTION WITHOUT SOURCE`

Implementation authority remains **SUSPENDED**.
