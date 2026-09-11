# R6 Phase A — Substantive Source-Level Review Packet

**Audit phase:** Global Fidelity & Cross-Node Audit / Phase A  
**Node:** R6  
**Historical finding:** C1-F8 / MATERIAL  
**Implementation authority:** SUSPENDED  
**Purpose:** perform the first genuine substantive source-level adversarial recheck of R6 against the actual underlying R6 confirmation exchange, not merely against the reconstruction that generated the committed artifact.

## 1. Immutable artifact under review

Review:

`docs/remediation-contracts/WI-R6.md`

at immutable commit:

`6ff7c19a6c9b25f4c123e11dc6d3bf77c1edffda`

Raw URL:

`https://raw.githubusercontent.com/SkinnytheHendrixx/MoneyScout/6ff7c19a6c9b25f4c123e11dc6d3bf77c1edffda/docs/remediation-contracts/WI-R6.md`

Do not silently switch to current `main` if the file later changes.

## 2. Prior verification record and its limitation

Also inspect:

`docs/remediation-contracts/WI-R6-FIDELITY-VERIFICATION.md`

That prior record confirms two things that must remain distinct:

1. the amended R6 artifact is a faithful transcription of the reconstruction used in the earlier review; and
2. the earlier relay-contamination defect was removed without substantive contract change.

The same record explicitly says its final verification was **not** an independent re-derivation equivalent to R1–R3. Under the current assurance standard, it therefore establishes transcription-level confidence plus a specific relay-contamination correction, not substantive Phase A source fidelity.

Do not treat the historical `FIDELITY_VERIFIED` label as proof that this Phase A recheck is unnecessary.

## 3. Required source basis

Primary source for this review must be the **actual original R6 confirmation/source exchange** if available.

The review result must name exactly what source was actually used, distinguishing among:

- actual original R6 confirmation/source exchange;
- contemporaneous immutable artifact from that exchange;
- prior frozen summary/reconstruction;
- reviewer memory;
- another named source.

A repeated pass over the same reconstruction or same-continuity residual memory is not automatically a stronger assurance class.

If a specific source gap appears exhausted, `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL` may be used only after a documented deliberate targeted re-read specifically aimed at that gap.

## 4. Review question

Compare the immutable R6 artifact to the actual original confirmation record and classify every material discrepancy as:

- `ACCEPTED`
- `PARTIALLY_ACCEPTED`
- `REJECTED`
- `UNRESOLVED`

The task is fidelity analysis, not architectural improvement from present-day taste.

Do not manufacture missing R6 source detail merely because later R18/R20 contracts make a particular interpretation seem elegant.

Because R6 later composes directly with R18 and R20, this review must be especially alert to backward attribution from those later nodes into R6.

## 5. Mandatory high-risk checks

At minimum, source-check all of the following rather than assuming the reconstruction got them right.

### 5.1 Frozen root and mission

Verify:

- C1-F8 / MATERIAL;
- the actual defect is verifier-strength insufficiency / human-attestation bypass into machine-readiness authority;
- R6 owns whether a capability/access claim was established strongly enough;
- R6 does **not** own lifecycle freshness at dispatch, which belongs downstream to R18/R20.

### 5.2 Strongest-applicable verifier semantics

Check whether the source genuinely froze the rule that R6 is **not** a simple ordinal ranking such as automated > callback > human.

Verify whether the intended policy is claim-specific:

- identify the exact claim;
- determine all applicable verifier requirements;
- require proof strong/specific enough for every decision-critical part;
- do not let caller preference choose a weaker verifier.

Scrutinize whether the current examples (`OWNER_AUTHORITY_GRANTED`, machine operability, KYC/callback, etc.) are source-supported versus reconstruction elaboration.

### 5.3 Human-attestation ambiguity default

Source-check the confirmed amendment that an unclassified claim does **not** fall back to human attestation.

Current recovered rule:

> Unknown claim class defaults to the stronger verification path, never the more permissive one.

Determine whether this exact default and wording are R6-source-specific or may have been influenced by the now-common conservative-unknown pattern elsewhere in the corpus.

### 5.4 Canonical five-state readiness model

Check the exact canonical state family:

- `POLICY_UNKNOWN`
- `VERIFICATION_PENDING`
- `VERIFICATION_FAILED`
- `HUMAN_AUTHORITY_CONFIRMED`
- `AUTOMATION_READY`

Also verify the normalization history replacing earlier inconsistent `VERIFYING` / `PENDING` language and whether `pending_reason` is source-confirmed rather than reconstruction convenience.

Source-check the named pending reasons if possible:

- `HUMAN_PREREQUISITE_COMPLETED_AWAITING_MACHINE_CHECK`
- `VERIFIER_NOT_RUN`
- `CALLBACK_OUTSTANDING`
- `RESOURCE_BLOCKED`

Do not silently infer exact enum/name provenance from semantic plausibility.

### 5.5 Capability Verification Policy Registry / durable evidence-result primitive

Check whether the original R6 source genuinely froze:

- a canonical Capability Verification Policy Registry or equivalent primitive;
- durable Verification Evidence/Result;
- policy/version identity;
- exact provider/verifier identity;
- claim/proof scope;
- maximum access justified;
- expiration/reverification semantics.

Distinguish mandatory semantics from exact reconstructed field lists.

### 5.6 R6-M1 through R6-M8

Verify the exact migration matrix and scope, including especially:

- M3 generic capability-confirm endpoint;
- M4 separation of human prerequisite completion from full automation readiness;
- M5 canonical usability consumption rather than free-text parsing;
- M6 automatic resume only after the actually-required claim is proven;
- M8 legacy readiness treatment.

For M8, source-check the exact historical state/name `LEGACY_VERIFICATION_UNPROVEN` or whether the source only confirmed equivalent semantics.

### 5.7 R6-A1 provenance and M9+ numbering

Apply the same scrutiny learned from R4 and R5.

Determine whether the exact R6-A1 structure, producer-classification family, and `R6-M9+` numbering were genuinely frozen in R6's original exchange or could have been pattern-transferred from the now-common audit convention.

Current classification family:

- `STRONG_PROOF_ALREADY_PRESENT`
- `HUMAN_AUTHORITY_ONLY`
- `WEAK_PROOF_DEFECT`
- `VERIFIER_REQUIREMENT_UNKNOWN`
- `NOT_A_CAPABILITY_VERIFICATION`

If same-continuity memory cannot distinguish source-specific content from template convention after a deliberate targeted re-read, say so explicitly and use source-exhaustion treatment rather than forced certainty.

### 5.8 R6 × R7 side-effect symmetry and local-write exception

This is a particularly important source/fidelity point.

Source-check the R6 rule that safety-required verification work still consumes R7 resource authority where verification itself causes a consequential external/scarce-resource execution.

Also verify the **local-write exception**: recording already-observed verification evidence / updating local canonical readiness from already-obtained authoritative evidence must not itself be treated as a fresh externally scarce execution merely because it changes R6 state.

Check this seam against R7's independently reviewed contract where possible, and distinguish genuine cross-artifact corroboration from same-continuity recollection.

### 5.9 R6 × R18 × R20 boundary

Source-check how much of the present R6 text genuinely belonged to R6 versus being clarified later by R18/R20.

The intended separation is:

- R6 = capability claim was proven strongly enough;
- R18 = exact frozen capability binding/lifecycle remains eligible;
- R20 = exact consequential boundary decides whether current predicates may be consumed now.

Be alert for terminology or lifecycle detail that may have been imported backward into R6 after R18 was elaborated.

### 5.10 R5 × R6 separation

Verify the distinction:

- R5 independent confirmation of material reasoning conclusions;
- R6 verifier sufficiency for capability/access claims.

A second-model review does not prove credentials work; provider verification does not independently confirm underwriting judgment.

### 5.11 Legacy policy and future use

Verify whether legacy `AVAILABLE / AUTOMATION_READY` states with unproven verifier strength must fail closed for future consequential use unless reconstructed/proven/reverified.

Check whether any exact legacy state naming is source-supported versus equivalent-semantic reconstruction.

### 5.12 Design Inputs

Review DI-1 and DI-2 dispositions for both substance and provenance.

Because the Design Input section format is highly templated across the corpus, distinguish:

- whether the conclusion itself is sound;
- whether exact Reviewed / Activation / Required Action / Evidence wording is independently source-supported.

### 5.13 Acceptance fixtures and closure-list form

Check whether:

- the A–K fixture set existed in this exact source form/order;
- the exact 21-item closure-evidence list existed in this exact source form/order;
- or whether the substantive checks are source-supported but the exact enumeration was reconstruction synthesis.

Do not confuse substantive soundness with exact historical form provenance.

### 5.14 Relay-contamination history

Verify the historical process fact separately from R6 contract substance:

- first complete candidate contained a non-artifact conversational relay sentence;
- that was correctly classified as relay contamination rather than substantive contract drift;
- amended commit removed the contaminating tail without changing normative R6 content.

This is a process-assurance fact and must not be accidentally promoted into evidence that the R6 contract itself is source-fidelity verified.

## 6. Cross-check opportunities

Where possible, use separately committed artifacts as narrow corroboration without overstating what they prove.

Especially useful seams:

- R6 × R7: verification work/resource admission;
- R6 × R18: verifier sufficiency versus exact binding lifecycle;
- R6 × R20: verified truth versus boundary-time consumption;
- R5 × R6: independent reasoning confirmation versus capability verification.

If a downstream artifact agrees with R6, classify that honestly as cross-artifact consistency/corroboration, not proof of exact R6-source provenance.

## 7. Required output format

Return:

### SOURCE BASIS

Name exactly what source was available and whether it is materially distinct from the source chain that produced the reconstruction.

### ACCEPTED

Items for which the deliberate review found no confident fidelity issue.

### PARTIALLY ACCEPTED

Items whose semantics appear sound but exact source provenance, wording, enum names, scope, or historical form remain uncertain.

### UNRESOLVED

Items that cannot be established from the available source basis. Use `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL FROM CURRENT SOURCE BASIS` only after the required targeted re-read.

### REJECTED

Only content that is confidently false relative to source.

### ASSURANCE RESULT

State the actual resulting assurance tier honestly. Do not upgrade same-continuity re-reading into T3/T4.

### RECOMMENDED AMENDMENTS

Separate:

- artifact corrections if any actual contract error is found;
- provenance overlays/source-gap entries where content may remain sound but source proof is weaker;
- T4 scrutiny items;
- genuine cross-artifact corroboration worth preserving.

## 8. Standing constraints

- Do not rewrite conservative content merely because provenance is incomplete.
- Provenance uncertainty is not evidence that the rule is wrong.
- Compatibility with R18/R20 is not proof that wording came from R6's original source.
- No final implementation-authority claim may rely on this Phase A pass as T3/T4 unless the source basis actually supports that tier.
- If an artifact amendment is later required, it gets a new immutable SHA and invalidates dependent edge/compound/chain certifications.

## 9. Relay-contamination guard

This packet terminates here. No conversational handoff text is part of the packet.