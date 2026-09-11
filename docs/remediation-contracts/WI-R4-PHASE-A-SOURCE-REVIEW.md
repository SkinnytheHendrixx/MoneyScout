# WI-R4 — Phase A Substantive Source Review

**Node:** R4  
**Historical finding:** C1-F3 / MATERIAL  
**Artifact reviewed:** `docs/remediation-contracts/WI-R4.md` at `3839e856986b7034d55b12be7f59f000b4a97123`  
**Audit phase:** Global Fidelity & Cross-Node Audit / Phase A  
**Implementation authority:** SUSPENDED  
**Assurance result:** BELOW T3 / SOURCE BASIS INSUFFICIENT FOR T3 PROMOTION

## 1. Source basis

The reviewer explicitly identified the source basis as **reviewer memory of the same continuing conversation and continuity chain that materially participated in reconstructing R4**.

No separate immutable transcript, independent source document, or materially independent reviewer/source was available for this pass.

The reviewer performed a deliberate targeted re-read against the six high-risk categories in the Phase A packet, actively searching for unsupported padding, provenance drift, backward attribution, and internal inconsistency. That exercise is useful for defect discovery, but under the governing assurance standard it does **not** independently elevate R4 to T3.

A repeated review from the same source well does not become a stronger assurance class merely because it is careful.

## 2. Accepted content

The review found no confident factual error in the following recovered content:

- the three explicitly rejected stale-Bet alternatives:
  - rewrite Cycle A lineage to Cycle B;
  - automatically create successor Bet B inside R4;
  - automatically create a Human Action;
- the `LINEAGE_UNKNOWN` fail-closed rule;
- the explicit rule that unresolved lineage must not automatically become a Human Action;
- the general `R4 × R2 × R11` compound relationship;
- the general `R3 × R4 × R20` compound relationship.

The compound observations have a narrow additional cross-check because R2 and R3 now exist as separately committed reviewed artifacts. That compatibility does not independently prove verbatim R4-source provenance.

## 3. Targeted internal-consistency item carried forward

The review flagged, but did not classify as erroneous, the relationship between:

- the Human Action creation-time model: `EXACT_LINEAGE / NOT_APPLICABLE / UNKNOWN`; and
- the general four-state object vocabulary: `STALE_LINEAGE / NOT_APPLICABLE / UNKNOWN / EXACT_LINEAGE`.

The current interpretation is that this is intentional: `STALE_LINEAGE` describes a known historical origin that later becomes ineligible, while Human Action creation classification asks whether lineage is exact, genuinely not applicable, or unknown at creation time.

Because the reviewer cannot independently prove that distinction from a separate source, this point remains a named T4 scrutiny item rather than being promoted on reasoning alone.

## 4. Source-exhausted item R4-GAP-A1 — R4-A1 provenance

**Status:** `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL FROM CURRENT SOURCE BASIS`

The reviewer cannot independently determine whether the exact R4-A1 structure was confirmed in R4's own source exchange or was reconstructed by pattern transfer from the now-common audit convention used elsewhere in the remediation corpus.

The uncertain details include specifically:

- whether `R4-A1 — Evaluation Lineage Consumer Audit` existed in this exact form in R4's own confirmation round;
- whether the classification family
  - `NO_CYCLE_LINEAGE_REQUIRED`
  - `EXACT_LINEAGE_ALREADY_PRESERVED`
  - `DEFECT_DISCOVERED`
  - `UNCERTAIN_REQUIRES_ADJUDICATION`
  was R4-source-specific;
- whether discovered defects were explicitly numbered from `R4-M9+` in the original R4 exchange;
- whether the exact `AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED` framing was stated in R4 itself versus carried into R4 from the already-established cross-node convention.

### Exhaustion basis

The reviewer performed the protocol-required deliberate targeted re-read specifically against this gap and could not separate genuine R4-source recall from later pattern familiarity.

Additional passes by the same continuity chain over the same residual memory are not expected to resolve provenance and must not be used to upgrade assurance.

### Treatment

- Do **not** delete R4-A1 from the recovered artifact merely because provenance is uncertain; its semantics remain compatible with the governing recovery process and no contradiction has been demonstrated.
- Do **not** certify the exact R4-A1 structure as T3 source-fidelity from this review.
- Carry this item into the global unresolved-source-gap register.
- Require materially independent T4 scrutiny against any recoverable underlying source before treating the exact R4-A1 structure/labels as historically proven.

## 5. Source-exhausted item R4-GAP-CLOSURE-27 — closure-list form provenance

**Status:** `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL FROM CURRENT SOURCE BASIS`

The substantive obligations represented by the 27-item closure-evidence list are largely traceable to rules elsewhere in the R4 artifact. The reviewer could not independently establish, from the available source basis, that the original R4 confirmation exchange itself froze a verbatim numbered list of exactly 27 items in the current form.

This creates an explicit distinction:

- **substantive closure obligations:** higher confidence because many map to specific recovered R4 rules;
- **exact 27-item enumeration/form/order:** not independently source-certified.

### Exhaustion basis

A targeted re-read specifically asked whether the exact numbered form was original-source content or reconstruction synthesis. The reviewer could not distinguish the two from same-continuity memory.

### Treatment

- Preserve the list as a conservative recovered closure checklist.
- Do not claim its exact count/order/form is T3 source-fidelity verified.
- Carry the form/provenance question into the global source-gap register and T4 review packet.

## 6. Rejected content

None.

No item was identified as confidently false.

## 7. Assurance result

R4 remains **below T3** under the frozen recovery assurance taxonomy.

This Phase A pass is valuable defect-discovery evidence, but its source basis is structurally the same continuity chain that materially participated in reconstruction. It therefore cannot establish substantive source-fidelity merely by repetition.

The honest state is:

- artifact exists and remains the current recovered R4 candidate;
- prior transcription-style verification history remains historically valid for what it actually checked;
- Phase A discovered no confident content error;
- two provenance questions are now explicitly source-exhausted from the current source well;
- those questions remain targeted T4 review items;
- implementation authority remains suspended.

## 8. Artifact-handling decision

This review does **not** rewrite the historical R4 candidate merely to insert provenance disclaimers into the evidence under review.

Instead, this review record and the companion global-audit overlay are the governing provenance annotations for R4 during the Global Fidelity Audit. This preserves the immutable candidate that was actually reviewed while preventing its uncertain sections from appearing globally unqualified.

If later source recovery or materially independent review proves that the base artifact itself should be amended, that amendment will receive a new immutable SHA and all dependent edge/compound/chain certifications will be invalidated under the global-audit protocol.

## 9. Mandatory carry-forward to T4

The materially independent reviewer must specifically evaluate:

1. whether the exact R4-A1 audit structure/classifications/M9+ rule were genuinely frozen in R4's original confirmation source;
2. whether the 27-item closure list's exact count/order/form was original-source content or reconstruction synthesis;
3. whether the Human Action three-state creation model is intentionally a subset/contextual projection of the general four-state lineage vocabulary;
4. whether any later-node audit convention was backward-attributed into R4.

Until those points are independently resolved, no final implementation-authority decision may cite this Phase A review as T3/T4 proof.

## 10. Relay-contamination guard

This review record terminates here. No conversational handoff text is part of the review body.