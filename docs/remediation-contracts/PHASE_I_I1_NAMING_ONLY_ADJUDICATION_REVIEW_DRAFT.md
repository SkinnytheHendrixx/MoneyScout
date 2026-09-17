# Phase I — I1 Naming-Only Adjudication — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** I — phase/name/source exactness  
**Batch:** I1 — naming-only adjudication  
**Implementation authority:** SUSPENDED

## 1. Purpose

I1 adjudicates the eight naming-only Phase-I items (`I-02` through `I-09`) without reopening their recovered semantics and without laundering current/reconstructed labels into historical source fact.

Governing artifacts:

- `PHASE_I_PHASE_NAME_SOURCE_EXACTNESS_AUDIT_PLAN.md` — blob `fd05720385ed6766bbf9a6217a03ed92db01104b`;
- `PHASE_I_I0_NINE_ITEM_EXACTNESS_INVENTORY.md` — canonical I0 inventory;
- canonical node blobs R11, R12, R14, R16, R17, R20 pinned below.

R8 / I-01 is excluded from I1 and remains I2-owned because its taxonomy membership/completeness is itself unresolved.

## 2. Adjudication rule

For a naming-only item, I1 answers four independent questions:

1. Is the **historical exact name** source-confirmed?
2. Is the **semantic distinction** confirmed independent of the name?
3. Is there a **current/reconstructed candidate label set** worth preserving as a convenience or possible governed replacement?
4. If historical recovery never occurs, may corrected governance adopt a current/new label set without claiming historical provenance?

Allowed I1 historical dispositions:

- `EXACT_NAME_SOURCE_CONFIRMED`;
- `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

Allowed forward treatment:

- `PRESERVE_CURRENT_LABELS_AS_NONHISTORICAL_CANDIDATES`;
- `ADOPT_GOVERNED_REPLACEMENT_NAMES_DURING_REMEDIATION`;
- `NO_COMPLETE_CANDIDATE_SET / DEFINE_GOVERNED_NAMES_IF IMPLEMENTATION REQUIRES THEM`.

Forward adoption never retroactively changes the historical disposition.

## 3. Eight-item adjudication

### I-02 — R11 corrective-class names

**Node:** R11  
**Blob:** `f811d528730d819aa793a1901e9d1b310242fbcd`  
**H gap:** H2-E10  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

Direct text says the available confirmed record includes semantic corrective classes such as repair, Product Definition revision, Architecture revision, replan, capability verification/acquisition, external reconciliation, Human action, and termination/request stage termination, while §25 explicitly lists the exact enum names/storage representation for every corrective-obligation class as unrecovered.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `NO_COMPLETE_CANDIDATE_SET`.

**Forward treatment:** if implementation/remediation needs a formal enum, define governed replacement names that preserve all recovered class distinctions and do not imply the replacements were historical names.

Attacks:
- I-A1 PASS — semantic descriptions are not promoted to enum strings;
- I-A2 PASS — routing semantics survive neutral placeholders;
- I-A3 PASS condition retained — replacement names may not merge repair/redesign/replan/reconciliation/Human/termination distinctions;
- I-A4 PASS — no other node's vocabulary is used as provenance;
- I-A5 PASS — storage representation remains H2, not I1.

### I-03 — R12 runnable/job/claim state names

**Node:** R12  
**Blob:** `7a4a186fc2fd030d6ee52725b1111395597ffa90`  
**H gap:** H2-E13  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

R12 confirms durable due/runnable/materialized/claimed/in-flight/completed/successor/paused/superseded/terminal semantics, while §23 explicitly says exact runnable/job/claim state enum names and storage representation remain unrecovered.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `NO_COMPLETE_CANDIDATE_SET`.

**Forward treatment:** governed replacement state names may be defined if implementation requires them, preserving domain-obligation versus execution-occurrence separation and the recovered state distinctions.

Attacks I-A1–I-A5: PASS under the same rule; deterministic WATCH keys remain H2 representation identity, not evidence for generic R12 state names.

### I-04 — R14 lifecycle names

**Node:** R14  
**Blob:** `969b70e8b4b52606c9e34f617bed32a91b395d25`  
**H gap:** H2-E19  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

Current recovered semantic labels are:

- incumbent: `ACTIVE → DRAINING → QUIESCED → HANDOFF_READY → RETIRED`;
- successor: `STARTING → READY_CANDIDATE → AUTHORITATIVE_ACTIVE`.

R14 §24 explicitly leaves the exact lifecycle enum/storage representation unresolved **if different from the recovered semantic states**, which prevents historical exact-name promotion.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `PRESERVE_CURRENT_LABELS_AS_NONHISTORICAL_CANDIDATES`.

**Forward treatment:** these current labels may be adopted unchanged as governed replacement names during remediation if desired, but the adoption record must mark them as current/post-recovery governance unless stronger source proves historical exactness.

Attacks:
- I-A1 PASS — corpus repetition is not historical proof;
- I-A2 PASS — lifecycle transitions remain intelligible under placeholders;
- I-A3 PASS condition retained — aliases may not collapse incumbent and successor cardinality/authority stages;
- I-A9 PASS only if any future adoption is explicitly non-historical.

### I-05 — R16 informational-observation label

**Node:** R16  
**Blob:** `7dd92976f68ee90540771b3710e42b6d5b7f396f`  
**H gap:** H2-E28  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

R16 recovers the semantic class “informational / non-authoritative-for-balance observation” and explicitly states the exact storage enum name, if separately frozen, is source-unresolved.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `NO_COMPLETE_CANDIDATE_SET`.

**Forward treatment:** corrected governance may define one explicit current label for this semantic class while preserving that informational evidence cannot be consumed as authoritative balance effect.

Attacks I-A1–I-A5: PASS. `INFORMATIONAL` or any similar future enum spelling would be a governed replacement unless source later proves it historical.

### I-06 — R17 Offer/Grant lifecycle names

**Node:** R17  
**Blob:** `16a234e897fe6e119392707a7187a3232f0fd972`  
**H gap:** H2-E31  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

R17 recovers immutable Offer Version history, Grant issuance, revocation/supersession, monotonic historical authority, and lifecycle semantics, while §26 explicitly lists exact Offer/Grant lifecycle enum names as unrecovered.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `NO_COMPLETE_CANDIDATE_SET`.

**Forward treatment:** remediation may define governed lifecycle names only after preserving exact Offer/Grant version identity, monotonic history, revocation, and supersession semantics. No enum may collapse current eligibility with historical authority existence.

Attacks I-A1–I-A5: PASS.

### I-07 — R20 boundary-class names

**Node:** R20  
**Blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`  
**H gap:** H2-E41  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

R20 semantically distinguishes operation-specific boundary classes by required predicate ownership. Current text gives examples—provider dispatch, customer checkout/charge, production release, result adoption, headroom release, Offer activation, handoff completion, renewal, autonomous reversal—but §29 explicitly leaves exact boundary class names unrecovered.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `NO_COMPLETE_CANDIDATE_SET`.

**Forward treatment:** Phase-J/remediation may define governed current boundary-class names only after preserving the operation-specific predicate-set model and arbitrary future extension rules. Example English phrases are not historical enum candidates merely because they appear in the recovered contract.

Attacks I-A1–I-A5: PASS. Phase J may validate coverage but cannot prove historical boundary-class names.

### I-08 — R20 three-phase literal strings

**Node:** R20  
**Blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`  
**H gap:** H2-E42  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

The three-part semantic structure is source-confirmed. Current recovered strings are:

- `PREFLIGHT`;
- `BOUNDARY_VALIDATION`;
- `ADOPTION_VALIDATION`.

R20 itself says exact literal strings remain subject to final source confirmation if a richer source surfaces.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `PRESERVE_CURRENT_LABELS_AS_NONHISTORICAL_CANDIDATES`.

**Forward treatment:** absent stronger historical source, corrected governance may adopt these three current strings as the canonical present-day enum because their cardinality/order/function already match the confirmed structure. The adoption must be explicitly versioned as current governance, not historical recovery.

Attacks:
- I-A1 PASS — current usage is not source proof;
- I-A2 PASS — temporal semantics survive placeholder substitution;
- I-A3 PASS — three phases remain exactly three semantic phases in the confirmed order/function;
- I-A7 PASS — source-confirmed structure is kept separate from literal exactness;
- I-A9 PASS only with explicit non-historical adoption provenance.

### I-09 — R20 forward-governance historical label

**Node:** R20  
**Blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`  
**H gap:** H2-E44  
**Source state:** `SOURCE_PARTIALLY_EXHAUSTED`

The recovered corpus calls this the “forward engineering-governance requirement” / future consequential-surface classification-registration rule. R20 §19.1 establishes the semantics as normative; §29 explicitly says the exact historical name remains source-unresolved.

**Historical disposition:** `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`.

**Candidate-set disposition:** `CURRENT_DESCRIPTIVE_LABEL_HISTORICAL_NAME_UNRESOLVED`.

**Forward treatment:** the current descriptive phrase may remain as a present-day governance heading or may be replaced by a governed formal label. Either choice is non-historical unless source later proves otherwise.

Attacks:
- I-A1 PASS — descriptive repetition does not prove frozen historical naming;
- I-A2 PASS — future-code classification/registration semantics survive placeholder substitution;
- I-A8 PASS — historical label exactness remains separate from H2-E45 historical mechanism and Phase J forward-code coverage;
- I-A9 PASS only if later current naming is explicitly post-recovery governance.

## 4. I1 arithmetic and disposition matrix

Eight naming-only items adjudicated: **8/8**.

Historical exact-name outcomes:

- `EXACT_NAME_SOURCE_CONFIRMED`: **0/8**;
- `NAME_SEMANTICS_CONFIRMED_SOURCE_UNRESOLVED`: **8/8**.

Candidate-set posture:

- no complete candidate historical enum/string set: **5** — I-02, I-03, I-05, I-06, I-07;
- current/recovered label set preserved as non-historical candidates: **2** — I-04, I-08;
- stable current descriptive label with historical name unresolved: **1** — I-09.

Arithmetic: `5 + 2 + 1 = 8`.

Source-state changes:

- source upgrades: **0**;
- source downgrades: **0**;
- all remain `SOURCE_PARTIALLY_EXHAUSTED`.

No replacement enum/name set is actually adopted by I1 because implementation/remediation authority remains suspended. I1 establishes only that governed replacement adoption is permissible later without historical overclaim.

## 5. Cross-item findings

### 5.1 Historical exactness and implementation naming are separate decisions

None of the eight needs historical-name recovery in order for semantics to remain safe and intelligible. If original names are never recovered, corrected implementation may still choose explicit governed names, provided provenance says those names are new/current governance.

### 5.2 Reuse is stronger for R14/R20 phases than for no-candidate items, but still non-historical

R14 lifecycle labels and R20 phase strings are already coherent current semantic labels. Reusing them later is lower-friction than inventing names for R11/R12/R16/R17/R20 boundary classes. That practical convenience does not increase their historical source assurance.

### 5.3 No naming item changes semantic cardinality

I1 does not authorize any aliasing or renaming that merges/splits recovered distinctions. Naming remediation is subordinate to upstream semantic cardinality and ownership.

### 5.4 Phase J cannot close naming provenance

Phase J may certify the future-code governance requirement and R20 boundary coverage, but cannot turn I-07/I-09 current terminology into historical naming proof.

## 6. Review questions

Adversarial review should pressure:

1. Is `0 exact / 8 unresolved` too conservative for any item, especially R14 or the R20 phase strings?
2. Is it correct that all eight can safely defer historical name recovery because semantics remain complete under placeholders?
3. Should R14 current lifecycle labels and R20 phase strings be treated as merely “adoptable later,” or does the current recovered corpus already make them normative present-day labels despite historical uncertainty?
4. Does I-09 correctly distinguish a descriptive heading from an enum/class name while still qualifying as Phase-I exactness?
5. Does any no-candidate item actually contain a sufficiently complete candidate set elsewhere in its node to change its posture?
6. Has any storage/schema issue leaked back into I1?
7. Does any replacement-adoption statement inadvertently sound like implementation authorization rather than a future permissible remediation treatment?

## 7. Provisional I1 result

`I1 COMPLETE FOR REVIEW / 8 OF 8 NAMING-ONLY ITEMS ADJUDICATED / 0 EXACT HISTORICAL NAMES SOURCE-CONFIRMED / 8 HISTORICAL NAMES SOURCE-UNRESOLVED / 5 NO-CANDIDATE + 2 CURRENT-LABEL-CANDIDATE + 1 DESCRIPTIVE-LABEL POSTURES / 0 SOURCE-STATE CHANGES / NO REPLACEMENT NAMES ADOPTED WHILE IMPLEMENTATION AUTHORITY IS SUSPENDED`
