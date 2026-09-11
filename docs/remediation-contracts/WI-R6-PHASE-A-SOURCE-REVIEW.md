# WI-R6 — Phase A Substantive Source Review

**Node:** R6  
**Historical finding:** C1-F8 / MATERIAL  
**Artifact reviewed:** `docs/remediation-contracts/WI-R6.md` at `6ff7c19a6c9b25f4c123e11dc6d3bf77c1edffda`  
**Audit phase:** Global Fidelity & Cross-Node Audit / Phase A  
**Implementation authority:** SUSPENDED  
**Assurance result:** BELOW T3 / SOURCE BASIS INSUFFICIENT FOR T3 PROMOTION

## 1. Source basis

The reviewer identified the source basis as **reviewer memory within the same continuing conversation and continuity chain that materially participated in reconstructing R6**.

No separate transcript, independent source document, or materially independent reviewer/source was available for this pass.

The reviewer performed the protocol-required deliberate targeted re-read against all packet categories, including the explicit backward-attribution check against R18/R20. This is useful defect-discovery evidence, but it does **not** independently elevate R6 to T3.

A careful same-continuity review remains a same-source review.

## 2. Accepted content

The review found no confident factual error in:

- the `VERIFICATION_PENDING` / `pending_reason` normalization story, including the specific claim that earlier `VERIFYING` / `PENDING` terminology was deliberately normalized rather than represented as two capability states;
- the R6×R7 side-effect symmetry rule and its explicit local-write exception;
- the `LEGACY_VERIFICATION_UNPROVEN` treatment and no-grandfathering rule for future consequential use.

These remain accepted as recovered content, while exact source provenance still inherits the overall Phase A source-basis limitation.

## 3. Genuine positive finding — R18/R20 boundary vocabulary remained clean

### GA-R6-POS-01 — no detected R18/R20 enum contamination

The deliberate backward-attribution check found a concrete positive result rather than merely an unexamined absence of concern.

R6's canonical readiness vocabulary:

- `POLICY_UNKNOWN`
- `VERIFICATION_PENDING`
- `VERIFICATION_FAILED`
- `HUMAN_AUTHORITY_CONFIRMED`
- `AUTOMATION_READY`

is distinct from R18's binding/lifecycle disposition vocabulary. R6's R18/R20 seam stays at the conceptual boundary: R6 establishes verifier sufficiency, R18 owns frozen binding/lifecycle eligibility, and R20 owns boundary-time consumption.

No R18/R20-specific enum family was found copied backward into R6.

This is narrow positive evidence about boundary integrity. It does **not** promote unrelated R6 content to T3.

## 4. Targeted T4 scrutiny item R6-GAP-STRONGEST-VERIFIER — strongest-applicable verifier / ambiguity-default provenance

**Status:** OPEN / TARGETED T4 SCRUTINY

The reviewer has moderate confidence in the recovered strongest-applicable-verifier semantics and the human-attestation ambiguity default, including the rule that unknown claim class defaults to the stronger verification path rather than permissive human attestation.

However, conservative unknown-default behavior became common across the corpus. Same-continuity memory cannot fully exclude pattern transfer.

### Treatment

- Preserve the rule; no contradiction or confident error was found.
- Do not claim this Phase A pass independently source-verifies the exact wording or full negotiated shape.
- Carry the provenance question into materially independent T4 scrutiny.

## 5. Targeted T4 scrutiny item R6-GAP-POLICY-RESULT-FIELDS — Policy Registry / Verification Result field-list provenance

**Status:** OPEN / TARGETED T4 SCRUTINY / LOWER CONFIDENCE

The artifact's exact Capability Verification Policy Registry and Verification Evidence/Result field lists are architecturally coherent, but the reviewer has lower confidence that the complete field enumeration was frozen verbatim in the original R6 source rather than synthesized during reconstruction.

The uncertain exact form includes the full policy/result identity fields, verifier implementation/version, evidence/proof reference, maximum access justified, expiration/reverification fields, and policy version composition.

### Treatment

- Preserve the primitive and field list as recovered conservative structure; no substantive contradiction was demonstrated.
- Distinguish the likely-required semantics from the exact historical field enumeration.
- Do not represent the exact list as T3 source-fidelity proven from this review.
- Carry it as an explicit T4 provenance question.

## 6. Source-exhausted item R6-GAP-A1 — R6-A1 provenance

**Status:** `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL FROM CURRENT SOURCE BASIS`

The reviewer cannot independently determine whether the exact R6-A1 structure was frozen in R6's own source exchange or reconstructed by pattern transfer from the now-common audit convention.

The uncertain details include:

- whether `R6-A1 — Capability Verification Surface Audit` existed in this exact form;
- whether the classification family
  - `STRONG_PROOF_ALREADY_PRESENT`
  - `HUMAN_AUTHORITY_ONLY`
  - `WEAK_PROOF_DEFECT`
  - `VERIFIER_REQUIREMENT_UNKNOWN`
  - `NOT_A_CAPABILITY_VERIFICATION`
  was R6-source-specific;
- whether defects were explicitly numbered from `R6-M9+`;
- whether the exact `AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED` formulation was independently frozen in R6 rather than inherited from the corpus-wide recovery convention.

### Exhaustion basis

The reviewer performed a deliberate targeted re-read specifically aimed at separating R6-source recall from later pattern familiarity and could not do so.

Additional same-continuity passes over the same residual memory are not expected to resolve this provenance question and must not be used to upgrade assurance.

### Treatment

- Do **not** delete R6-A1 merely because provenance is uncertain.
- Do **not** certify its exact labels/classifications/M9+ convention as T3 from this review.
- Carry it into the global source-gap register and T4 review packet.

## 7. Source-exhausted item R6-GAP-FIXTURE-CLOSURE-FORM — A–K fixtures and 21-item closure-list provenance

**Status:** `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL FROM CURRENT SOURCE BASIS`

Most substantive checks represented by the A–K fixtures and 21-item closure list map to recovered R6 rules elsewhere in the artifact. The reviewer cannot independently establish that the original R6 confirmation exchange froze these exact enumerations, labels, count, and order.

This creates an explicit distinction:

- **substantive obligations:** higher confidence because they map to recovered R6 rules;
- **exact A–K and 21-item form/order:** not independently source-certified.

### Exhaustion basis

A targeted re-read specifically tested source-original enumeration versus reconstruction synthesis and could not distinguish them from same-continuity memory.

### Treatment

- Preserve the fixtures and closure list as conservative recovered test/closure structure.
- Do not claim exact count/order/form as T3 source-fidelity verified.
- Carry the form/provenance question into the global source-gap register and T4 packet.

## 8. DI provenance note R6-GAP-DI — templated Design Input wording

**Status:** OPEN / LOW-STAKES SOURCE-PROVENANCE LIMITATION

The reviewer found no substantive reason to reject the conclusion that R6 itself does not generically activate DI-1 or DI-2. However, the Reviewed / Activation / Required Action / Evidence form and the explicit non-consumption wording closely resemble the standardized DI template used across the recovery corpus.

The exact wording must therefore not be represented as independently source-verified by this Phase A pass.

This remains a lower-stakes provenance limitation to be carried into the global DI consistency work rather than treated as a separate substantive defect.

## 9. Cross-node source-recovery pattern discovered

R4, R5, and R6 now independently produced the same two source-exhausted categories under deliberate targeted re-read:

1. exact `A1` audit/classification/M9+ structure provenance; and
2. exact fixture/closure-list enumeration/form/order provenance.

This repeated shape is evidence of a **systematic same-continuity recovery limitation**, not merely three unrelated node-specific accidents.

It does not prove those structures were synthesized or wrong. It proves that this source basis cannot reliably distinguish historically frozen per-node form from a later corpus-wide convention once that convention became familiar.

The pattern must be represented globally and targeted explicitly in final T4 review.

## 10. Rejected content

None.

No item was identified as confidently false.

## 11. Assurance result

R6 remains **below T3** under the frozen recovery assurance taxonomy.

The resulting state is:

- artifact exists and remains the current recovered R6 candidate;
- prior transcription-style verification and relay-contamination correction remain historically valid for the narrower claims they actually established;
- Phase A found no confident substantive error;
- R6-A1/M9+ exact provenance is source-exhausted from the current source well;
- A–K fixture and 21-item closure-list exact form are source-exhausted from the current source well;
- strongest-applicable-verifier/ambiguity-default provenance remains a targeted T4 question;
- exact Policy Registry / Verification Result field-list provenance remains a targeted T4 question with lower confidence;
- DI section exact wording remains a low-stakes provenance limitation;
- the R18/R20 vocabulary-boundary check is a genuine positive finding;
- implementation authority remains suspended.

## 12. Artifact-handling decision

This review does **not** rewrite `WI-R6.md` merely to insert provenance caveats into the evidence under review.

This review record and the companion global-audit overlay carry the limitations while preserving the immutable artifact actually reviewed.

If later source recovery or materially independent review requires a substantive R6 amendment, that amendment receives a new immutable SHA and dependent edge/compound/chain certifications against the prior R6 SHA must be invalidated and rerun.

## 13. Mandatory carry-forward to T4

The materially independent reviewer must specifically evaluate:

1. whether R6-A1/classifications/M9+ were genuinely frozen in R6's source;
2. whether A–K fixtures and the 21-item closure list's exact form were original-source content or reconstruction synthesis;
3. whether the strongest-applicable-verifier and human-attestation ambiguity-default wording were genuinely R6-source-specific;
4. whether the exact Policy Registry / Verification Result field lists were source-frozen or reconstruction synthesis;
5. whether the DI section's exact disposition wording was source-specific or templated;
6. whether the clean R18/R20 vocabulary separation holds against the underlying source rather than only the recovered artifacts;
7. whether the repeated R4/R5/R6 audit-structure and fixture/closure-form gaps reflect a systematic source-recovery limitation.

Until those questions are independently resolved or explicitly adjudicated in the final corrected authority set, this Phase A result must not be cited as T3/T4 proof.

## 14. Relay-contamination guard

This review record terminates here. No conversational handoff text is part of the review body.