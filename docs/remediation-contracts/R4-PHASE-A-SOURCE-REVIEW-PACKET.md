# R4 Phase A — Substantive Source-Level Review Packet

**Audit phase:** Global Fidelity & Cross-Node Audit / Phase A  
**Node:** R4  
**Historical finding:** C1-F3 / MATERIAL  
**Implementation authority:** SUSPENDED  
**Purpose:** perform the first genuine source-level adversarial recheck of R4 against the actual underlying R4 confirmation exchange, not against the reconstruction that generated the committed artifact.

## 1. Immutable artifact under review

Review:

`docs/remediation-contracts/WI-R4.md`

at immutable commit:

`3839e856986b7034d55b12be7f59f000b4a97123`

Raw URL:

`https://raw.githubusercontent.com/SkinnytheHendrixx/MoneyScout/3839e856986b7034d55b12be7f59f000b4a97123/docs/remediation-contracts/WI-R4.md`

Do not silently switch to current `main` if the file later changes.

## 2. Prior verification record and its limitation

Also inspect:

`docs/remediation-contracts/WI-R4-FIDELITY-VERIFICATION.md`

That prior record explicitly states that its final check compared the committed artifact against a complete reconstruction generated from the original R4 source in the same reviewer conversation. Under the current assurance standard, that establishes transcription-level assurance, not substantive independent/source-level re-derivation.

The prior `FIDELITY_VERIFIED` label must therefore not be treated as proof that Phase A is unnecessary.

## 3. Required source basis

Primary source for this review must be the **actual original R4 confirmation exchange** if available.

The review record must name exactly what source was used. Distinguish among:

- actual original R4 confirmation/source exchange;
- contemporaneous immutable artifact from that exchange;
- a prior summary/reconstruction;
- reviewer memory;
- another named source.

Do not treat a repeated pass over the same reconstruction as source-level verification.

If a specific source gap appears exhausted, apply the governing refinement: `SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL` requires a documented targeted re-read specifically aimed at that gap before exhaustion may be declared.

## 4. Review question

Compare the immutable R4 artifact to the actual original confirmation record and classify every material discrepancy as:

- `ACCEPTED`
- `PARTIALLY_ACCEPTED`
- `REJECTED`
- `UNRESOLVED`

The task is not to improve R4 from current architectural taste. The task is to determine whether the committed artifact faithfully preserves what R4 actually confirmed.

Do not manufacture missing detail from later nodes merely because later nodes are compatible with R4.

## 5. Mandatory high-risk checks

At minimum, source-check all of the following rather than assuming the reconstruction got them right:

1. **Frozen root and canonical defect**
   - C1-F3 / MATERIAL;
   - current-state reconstruction versus exact originating Evaluation Cycle.

2. **Stale Bet approval behavior**
   - Cycle A → Cycle B → approve Bet A;
   - exact fail-closed behavior;
   - whether the durable blocker/reason language is source-supported;
   - the three explicitly rejected alternatives:
     - rewrite A → B;
     - auto-create successor Bet;
     - auto-create Human Action.

3. **Factory lineage defect**
   - whether R4 actually confirmed the conflicting `Bet.evaluationCycleId = A` / `FactoryRun.evaluationCycleId = B` shape;
   - exact Factory inheritance/fingerprint obligations.

4. **Human Action lineage model**
   - exact states `EXACT_LINEAGE`, `NOT_APPLICABLE`, `UNKNOWN`;
   - whether all three names are source-exact;
   - restriction on `NOT_APPLICABLE` resuming lineage-bound work;
   - treatment of `UNKNOWN` and prohibition on using Human attestation to invent historical lineage.

5. **Legacy / unknown lineage**
   - deterministic reconstruction only from durable provenance;
   - fail-closed boundary behavior;
   - successor-object path;
   - whether `LINEAGE_UNKNOWN`, `UNKNOWN`, and the amended state vocabulary are represented with source-exact naming rather than normalized aliases.

6. **Evaluation Lineage Reference primitive**
   - whether this named primitive and its conceptual fields were actually frozen in R4;
   - distinguish confirmed semantics from reconstructed physical/schema suggestions.

7. **R4-A1 and migration scope**
   - exact R4-M1 through R4-M8 obligations;
   - R4-A1 classification vocabulary;
   - R4-M9+ discovery rule;
   - `AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED`.

8. **Dependencies and compounds**
   - START / LOCAL / E2E dependency distinctions;
   - R4→R9→R10 relationship;
   - whether the detailed R4×R9 worked scenario belongs to R4, R9, or is only a cross-reference. Preserve the existing provenance caveat if the source does not resolve attribution.

9. **Design Inputs**
   - confirm DI-1 and DI-2 were reviewed;
   - confirm activation/disposition for R4 scope;
   - do not infer activation from later provider/account/commercial nodes.

10. **Fixtures and closure evidence**
   - verify the full recovered fixture set and closure-evidence list against the actual R4 source;
   - identify any item that came from the reconstruction rather than the source itself.

## 6. Special drift patterns to look for

This recovery repeatedly found that broad architecture survived while negotiated specifics drifted. Therefore actively search for:

- named state/enum smoothing into prose;
- rejected alternatives omitted;
- one specific acceptance scenario generalized away;
- a rule copied from a later node and attributed backward to R4;
- a downstream ownership rule accidentally absorbed by R4;
- a current-eligibility rule that properly belongs to R20 presented as R4 authority;
- Human Action semantics broadened beyond what the source confirmed;
- provenance caveats converted into certainty;
- source-exact labels silently normalized into newer vocabulary.

## 7. Required output format

Return:

### SOURCE BASIS
Name the actual material used and its evidentiary class.

### ACCEPTED
Confirmed sections/details that match the original source.

### PARTIALLY ACCEPTED
Specific source-supported content that is present but thinned, renamed, broadened, narrowed, or structurally misplaced.

### REJECTED
Anything the artifact asserts that the source contradicts.

### UNRESOLVED
Anything not recoverable with confidence from the source used. If declaring `SOURCE_EXHAUSTED`, document the targeted re-read required by the audit refinement.

### ASSURANCE RESULT
State only what this pass actually establishes. Do not call it T4. The continuing Claude/ChatGPT reconstruction chains are explicitly disqualified from self-awarding T4 under the Global Audit protocol.

### RECOMMENDED AMENDMENTS
Only source-supported corrections. Do not redesign R4.

## 8. Global-audit consequence

If this review changes the R4 artifact SHA, every cross-node edge, hard-chain result, or compound result consuming the prior R4 SHA is invalidated and must later be re-run under the Global Audit protocol.

Do not promote R4 to implementation authority from this review alone.

## 9. Relay-contamination guard

This review packet terminates here. No conversational handoff text is part of the review instructions.
