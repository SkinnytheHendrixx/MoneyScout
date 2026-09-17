# Phase H — H1 Semantic / Blocking Source-Gap Adjudication — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** H — Source-Gap Register  
**Batch:** H1 — semantic/blocking-gap adjudication  
**Implementation authority:** SUSPENDED

## 1. Purpose

H1 takes the 20/20 H0 inventory and asks a narrower question:

> Which currently missing source propositions could materially change runtime behavior, authority, reconciliation, eligibility, lifecycle, or provider/domain interpretation — and what exactly must remain blocked or fail-closed because of that missing proposition?

H1 does not assign final source-exhaustion states; H3 owns that work. H1 also does not finalize cross-node primary-gap arithmetic where H1.5 overlap adjudication is still required.

Governing artifacts:

- `PHASE_H_SOURCE_GAP_REGISTER_AUDIT_PLAN.md` — blob `c7999679a6567c186bc3b266a12479ba59ec58f1`;
- `PHASE_H_H0_R1_R20_SOURCE_GAP_INVENTORY.md` — blob `5a5ac208e02a520f7405f1e90f39a75bd7e7a929`.

## 2. H1 adjudication rule

A candidate remains `H_SEMANTIC_IMPLEMENTATION` only if uncertainty remains about the **substantive rule itself** or about a provider/domain mapping needed to interpret/apply that rule.

A candidate is retired from H1 when the current artifact now shows that the substantive proposition was recovered/confirmed from source and only independent fidelity/T4 review remains.

A candidate is demoted to H2 when the substantive invariant is fixed and only exact historical schema/name/key/serialization/fixture/closure form remains unknown.

Where a semantic gap survives, H1 must state the narrow authority consequence. `SOURCE_INCOMPLETE` does not imply the whole node is semantically unusable.

## 3. Stale historical semantic candidates retired by later source recovery

### R4 — Human Action lineage state-model provenance

**H0 candidate:** whether Human Action creation intentionally uses `EXACT_LINEAGE / NOT_APPLICABLE / UNKNOWN` while the broader vocabulary also includes `STALE_LINEAGE`.

**H1 adjudication:** **RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED.**

Current R4 recovery provenance states that the `EXACT_LINEAGE / NOT_APPLICABLE / UNKNOWN` Human Action model and the broader amended state vocabulary were recovered as confirmed amendments from the R4 confirmation exchange. The current contract explicitly explains their contextual relationship rather than leaving the distinction source-unresolved.

Remaining issue: independent fidelity/T4 review may still challenge the recovered artifact, but that is assurance review, not an unresolved Phase-H source proposition.

### R5 — conservative materiality default

**Historical candidate:** source provenance of `UNCLASSIFIED → MATERIAL BY DEFAULT → INDEPENDENT CONFIRMATION REQUIRED`.

**H1 adjudication:** **RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED.**

Current R5 §3 labels this rule a **Frozen materiality default (confirmed amendment)** and gives the exact evolution rule. The current recovery provenance says the artifact is reconstructed from the actual R5 adversarial-confirmation conversation record including confirmation-round amendments.

Independent final fidelity remains pending, but the proposition is no longer missing from the available source basis.

### R6 — strongest-applicable verifier and ambiguity default

**Historical candidate:** exact provenance of strongest-applicable verification and human-attestation ambiguity handling.

**H1 adjudication:** **RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED.**

Current R6 explicitly recovers the strongest-applicable verifier rule and labels the human-attestation ambiguity default a **confirmed amendment**. It also freezes the fail-closed unknown verifier policy and canonical state normalization.

Exact Policy Registry / Verification Result fields remain an H2 representation-exactness question, not a missing verifier semantic.

## 4. Surviving H1 semantic / provider-domain source-gap candidates

### H1-S01 — R8 reconciliation-capability taxonomy

**Node:** R8  
**Missing proposition:** whether the recalled five reconciliation-capability distinctions are the correct and complete normative model, not merely what their labels were.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + `H_NAMING_EXACTNESS`.  
**Why semantic:** the missing distinctions can change whether an execution can be authoritatively reconciled by run/resource identity, safely replayed through an enforced idempotency mechanism, observed through authoritative state, or must remain unreconcilable.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE RULE**. R8's recovered generic rules may be implemented fail-closed, but no implementation may claim an affirmative historical reconciliation-capability classification or replay authority from the recalled five-value list until source recovery or governed re-derivation establishes the model. Unknown replay/reconciliation capability must not authorize retry.  
**Treatment candidate:** `RECOVER_SOURCE` if available; otherwise `INDEPENDENT_REDERIVATION` + `CONSERVATIVE_IMPLEMENTATION_RULE`.  
**Overlap:** H0 direct adjudication established R8 × R16 = distinct propositions.

### H1-S02 — R10 deterministic artifact-equivalence / materialization criteria

**Node:** R10  
**Missing proposition:** exact deterministic-equivalence/materialization criteria if the original contract was more detailed than the recovered invariant.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + possible `H_REPRESENTATION_EXACTNESS`.  
**Why semantic:** a more permissive or restrictive deterministic-equivalence rule could decide whether a newly materialized/rebuilt output is still the exact artifact whose QA/Release authority applies or must become a successor Artifact Version requiring fresh verification.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE RULE**. Where exact identity/equivalence cannot be proven under the recovered invariant, treat the materialized/rebuilt output as a successor Artifact Version and require its own QA/Release authority rather than transferring prior proof.  
**Treatment candidate:** source recovery or governed deterministic re-derivation.  
**Overlap:** distinct from R17 commercial equivalence and R5 independent material confirmation.

### H1-S03 — R12 retry/backoff timing policy

**Node:** R12  
**Missing proposition:** exact historical retry/backoff timing policies if separately frozen.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` at operational-policy scope, not core authority semantics.  
**Why semantic:** cadence/backoff changes when runnable retry work is attempted and can affect load, recovery pressure, and provider interactions, even though it does not create replay safety or authority.  
**Authority consequence:** **DOES NOT BLOCK CORE R12 SEMANTIC IMPLEMENTATION / NEW GOVERNED POLICY REQUIRED FOR TIMING.** Exact historical timing may not be claimed. Any new timing policy must remain subordinate to R8 replay safety, R7 admission, R20 eligibility, durable occurrence identity, and pause/supersession rules.  
**Treatment candidate:** `INDEPENDENT_REDERIVATION` or explicit corrected-governance adoption; conservative bounded policy permitted.  
**Overlap:** distinct from R13 health thresholds and R14 replacement non-convergence bounds.

### H1-S04 — R13 health transition thresholds / stall windows

**Node:** R13  
**Missing proposition:** exact health-state transition thresholds/timers.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION`.  
**Why semantic:** thresholds determine when a required executor changes from healthy/degraded to stalled/failed/unknown and therefore affect truthful health/readiness judgments consumed by other nodes.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE GOVERNED POLICY.** The recovered invariants prohibit heartbeat-only health, permissive unknown expectation, and generic-kernel substitution. New threshold values may be adopted only as new governance, with fail-closed behavior where evidence is insufficient.  
**Treatment candidate:** source recovery or independent re-derivation.

### H1-S05 — R13 aggregate-health formula

**Node:** R13  
**Missing proposition:** exact aggregate-health formula if separately frozen.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION`.  
**Why semantic:** aggregation determines whether a system/scope can appear healthy when required executors are failed, stalled, unknown, optional, intentionally disabled, or not applicable.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE RULE.** The formula must at minimum preserve the confirmed expectation semantics: required failed/stalled/materially-unknown executors cannot yield a falsely healthy relevant aggregate; unknown expectation cannot default optional.  
**Treatment candidate:** source recovery or independent re-derivation.

H1-S04 and H1-S05 are provisionally separate because threshold policy and aggregation policy can change independently and require different proof.

### H1-S06 — R14 readiness/drain timeout policy

**Node:** R14  
**Missing proposition:** exact readiness and incumbent-drain timeout values/timing policies.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` at bounded-non-convergence policy scope.  
**Why semantic:** the exact bounds decide when replacement leaves normal convergence and enters owned non-convergence (`READINESS_TIMEOUT`, abort/escalation path).  
**Authority consequence:** **DOES NOT BLOCK CORE R14 LIFECYCLE IMPLEMENTATION / NEW GOVERNED BOUNDS REQUIRED.** The recovered semantic rule already requires finite bounded readiness and drain, owned non-convergence, no automatic transfer, and no automatic incumbent resumption. Exact historical numbers cannot be claimed.  
**Treatment candidate:** independent re-derivation / corrected-governance adoption of conservative finite bounds.

### H1-S07 — R15 provider-specific redaction mechanics

**Node:** R15  
**Missing proposition:** provider-specific redaction mechanics where they determine whether the system can prove an observed financial field existed before governed redaction and preserve trustworthy provenance without retaining prohibited content.  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION` for the provider-specific portion; field names/schema remain H2 representation exactness.  
**Two-layer result:** the generic redaction invariant is confirmed and not source-unresolved: redaction may hide content but must not erase provenance or manufacture `FIELD_ABSENT`/`REPORTED_NULL`. What remains potentially semantic is provider-specific mechanics needed to satisfy that invariant safely.  
**Authority consequence:** **BLOCKS CLAIMING A PROVIDER'S REDACTED OBSERVATION PATH IS R15-COMPLIANT UNTIL MAPPED/VERIFIED.** It does not block the generic R15 evidence model.  
**Treatment candidate:** provider/domain verification or new governed mapping; fail closed on provenance adequacy.

### H1-S08 — R15 provider-specific financial field mappings

**Node:** R15  
**Missing proposition:** exact provider-specific field mappings needed to capture financially relevant provider-originating evidence losslessly before interpretation.  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION` at provider-adapter scope.  
**Why semantic:** if the adapter does not know which provider fields carry amount/unit/identity/qualifier/provenance facts, it can silently omit financially relevant evidence before R16 ever sees it.  
**Authority consequence:** **BLOCKS R15-COMPLIANT ACTIVATION OF AN AFFECTED PROVIDER ADAPTER UNTIL ITS MAPPING IS VERIFIED.** Generic R15 semantics remain implementable.  
**Treatment candidate:** provider documentation/contract verification or governed mapping.

### H1-S09 — R16 provider-specific absolute/delta/cumulative/reversal mappings

**Node:** R16  
**Missing proposition:** exact provider-specific mapping rules by which already-captured observations mean absolute totals, deltas, cumulative values, reversals/adjustments, informational observations, or related provider-specific semantics.  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION`.  
**Why semantic:** the same numeric observation can produce different canonical financial state depending on provider semantics; wrong mapping can double-count, undercount, erase corrections, or mis-handle reversals.  
**Authority consequence:** **BLOCKS CANONICAL FINANCIAL RECONCILIATION FOR AN AFFECTED PROVIDER UNTIL ITS MAPPING IS VERIFIED.** R15 may continue preserving raw observations; R7 must remain conservative where canonical financial truth is unavailable.  
**Treatment candidate:** provider contract/source verification or governed mapping.  
**Overlap:** distinct from R8 technical reconcilability and distinct from R15 raw-capture mapping.

### H1-S10 — R17 deterministic commercial-equivalence verifier fields/criteria

**Node:** R17  
**Missing proposition:** exact deterministic commercial-equivalence verifier fields where equivalence is fully reducible.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + `H_REPRESENTATION_EXACTNESS`.  
**Why semantic:** the criteria determine whether a technical successor may inherit/use existing commercial authority without creating a materially changed successor Offer, or whether the equivalence judgment requires R5-compatible independent confirmation.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE RULE.** If commercial equivalence cannot be fully established from confirmed deterministic criteria, do not transfer prior Offer/Grant authority automatically; treat the change as requiring successor commercial authority or material independent adjudication as applicable.  
**Treatment candidate:** source recovery or independent re-derivation of deterministic criteria.

### H1-S11 — R17 checkout-provider field mappings

**Node:** R17  
**Missing proposition:** provider-specific checkout field mappings needed to preserve exact provider/account/checkout/session/terms identities required by the Offer/Grant contract.  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION` at provider-adapter scope.  
**Authority consequence:** **BLOCKS CLAIMING AN AFFECTED CHECKOUT PROVIDER IS R17-COMPLIANT UNTIL MAPPED/VERIFIED.** Generic Offer/Grant semantics remain implementable.  
**Treatment candidate:** provider documentation/contract verification or governed adapter mapping.

### H1-S12 — R19 legacy-lineage reconstruction evidence threshold

**Node:** R19  
**Missing proposition:** exact legacy reconstruction evidence threshold/schema if separately frozen.  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + possible `H_REPRESENTATION_EXACTNESS`.  
**Why semantic:** the evidence threshold determines when an incomplete historical commercial lineage may be promoted from unproven legacy state to a deterministically reconstructed authoritative lineage.  
**Authority consequence:** **SAFE ONLY UNDER CONSERVATIVE RULE.** If exact historical lineage cannot be deterministically proven from durable evidence, preserve `LEGACY_UNPROVEN`/equivalent and do not reconstruct from current state or later authority.  
**Treatment candidate:** source recovery or independent governed re-derivation of reconstruction criteria.

## 5. Candidates demoted to H2 exactness / traceability rather than H1 semantics

The following H0 families are not currently semantic gaps because the substantive invariant is already recovered:

- R5 candidate fingerprint **field naming/storage exactness** — exact candidate binding semantics are recovered; historical representation exactness belongs H2.
- R6 Policy Registry / Verification Result **field list** — verifier semantics are recovered; exact schema belongs H2.
- R11 corrective class enum/storage names and deterministic key **format** — corrective classes, successor ownership, idempotent/deterministic identity requirement are recovered; exact names/key encoding belong H2 unless H2 finds an omitted distinction.
- R12 runnable/job/claim enum/storage and non-WATCH deterministic key **format** — durable occurrence/reconstruction semantics are recovered; exact encodings belong H2.
- R13 Executor Expectation Registry **schema/storage representation** — expectation semantics are recovered; exact schema belongs H2.
- R14 lifecycle enum/storage, fencing storage mechanism, compatibility schema/field names — lifecycle/fencing/compatibility invariants are recovered; exact historical physical representation belongs H2.
- R15 observation/provenance/redaction **schema/field names** and synthetic fingerprint algorithm — semantic preservation/provenance rules are recovered; exact representation belongs H2, except provider-specific mechanics separated into H1-S07/S08.
- R16 reconciliation-policy / derived-state **schema** and informational-observation exact enum name — substantive reconciliation architecture belongs H1 only where provider mappings remain unresolved; exact representation/naming belongs H2.
- R17 Offer/Grant schema fields, lifecycle enum names, fingerprint serialization — semantic binding requirements are recovered; exact historical representation belongs H2.
- R18 Binding Snapshot / Validation Record field provenance — R18 binding semantics are recovered; exact field provenance belongs H2.
- R19 Lineage Reference schema/serialization/hash and transaction/session field names — complete-lineage semantics are recovered; exact representation belongs H2.
- R20 Boundary Registry/Decision schema, validator-policy field names/versioning, exact three-phase strings, and historical forward-governance label/mechanism — recovered boundary and forward-governance semantics remain normative; exact historical names/representation/mechanical form belong H2/Phase I unless a later review proves a semantic distinction is missing.

## 6. Cross-node overlap adjudications reached during H1

### R12 × R13 × R14 timing — `NO OVERLAP / DISTINCT PROPOSITIONS`

- R12: retry/backoff scheduling cadence for durable runnable occurrences;
- R13: health/stall transition thresholds and aggregate health policy;
- R14: replacement readiness/drain non-convergence bounds.

The contracts explicitly separate scheduling, health, and authority-transfer semantics. Similar use of timers/timeouts does not make them one missing proposition.

### R10 × R17 × R5 equivalence/confirmation — `NO OVERLAP / DISTINCT PROPOSITIONS`

- R10 asks whether exact artifact identity/equivalence survives materialization/rebuild;
- R17 asks whether a technical/commercial successor is commercially equivalent for Offer authority;
- R5 asks whether a material autonomous judgment has qualifying independent confirmation.

They compose, but one source answer does not resolve all three.

### R15 × R16 provider mapping — `NO OVERLAP / DISTINCT PROPOSITIONS`

R15 must know what provider evidence to preserve losslessly. R16 must know what the complete captured evidence means financially. One provider source packet may document both, but the missing propositions, implementation layers, and failure modes are independent.

### R17 × R19 × R20 representation — `NO OVERLAP / DISTINCT PROPOSITIONS`

Offer/Grant representation, historical Commercial Authority Lineage representation, and current Boundary Decision representation are separate authority objects with separate ownership. Phase F already demonstrated that representation at one layer cannot substitute for another.

### R6 × R18 × R20 representation — `NO OVERLAP / DISTINCT PROPOSITIONS`

Verification result/policy representation, exact Capability Binding representation, and boundary decision representation are parallel-not-merged contracts. Their exact historical field gaps remain node-local H2 questions unless a shared original schema packet is later recovered.

### R4 × R5 × R6 GAP-PATTERN-01

The earlier register correctly identified a shared **source-recovery limitation pattern** around audit-form/fixture/closure provenance. H1 finds no shared semantic proposition among the three nodes. The pattern remains relevant to H2/H3 traceability/source-exhaustion treatment, not as one semantic implementation gap.

## 7. Provisional H1 semantic-gap shape

H1 currently identifies **12 surviving semantic/provider-domain candidate gaps**:

- R8: 1
- R10: 1
- R12: 1
- R13: 2
- R14: 1
- R15: 2
- R16: 1
- R17: 2
- R19: 1

This is **not final Phase-H primary-gap arithmetic**. H1.5/H2/H3 may merge/split, retire, or reclassify items based on source identity, source exhaustion, or sharper provider-domain evidence.

No surviving H1 semantic candidate currently requires the entire affected node to remain semantically unimplementable. The narrower pattern is:

- some provider/domain mappings block activation of the affected provider path;
- some recovered contracts are safe only under conservative fail-closed behavior until exact policy is re-derived;
- some exact timing/threshold policies can be adopted as new governed rules without pretending historical source recovery.

## 8. Highest-value adversarial review questions

1. Is H1 correct to retire the old R4/R5/R6 semantic provenance candidates based on the current artifacts' explicit recovered/confirmed-amendment language, or is there still a genuinely missing source proposition hidden behind pending fidelity verification?
2. Is R10 deterministic-equivalence/materialization truly semantic, or is the recovered exact-artifact rule already sufficient to demote all remaining uncertainty to representation/fixture exactness?
3. Should R12 retry/backoff timing be semantic at all, or should it be treated as corrected-governance policy debt because no recovered safety invariant depends on the original numeric/cadence values?
4. Are R13 thresholds and aggregate formula correctly split into two gaps under the Phase-H counting rule?
5. Does R15 provider-specific redaction mechanics genuinely contain a semantic/provider-domain gap, or does the confirmed durable-redaction invariant fully constrain all implementations regardless of provider mechanics?
6. Are R15 field-capture mappings and R16 interpretation mappings genuinely separate under remove-one-resolution testing?
7. Does R17 deterministic commercial equivalence require its own semantic source gap, or does R5 material-confirmation fallback fully eliminate the need to recover any deterministic verifier details?
8. Does R17 checkout-provider mapping belong to R17 source fidelity at all, or is it future provider-adapter implementation governance rather than a historical source gap?
9. Is R19 legacy reconstruction threshold independently semantic, given the conservative `LEGACY_UNPROVEN` rule already exists?
10. Have any H0 candidates been incorrectly demoted to H2 despite a missing distinction that could change authority behavior?

## 9. H1 state

Status: **DRAFT / PENDING ADVERSARIAL REVIEW**.

Implementation authority remains **SUSPENDED**.

Next after adjudication: H1.5 overlap finalization where needed, then H2 exactness/traceability/provenance adjudication.
