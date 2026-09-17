# Phase H — H1 Semantic / Blocking Source-Gap Adjudication

**Status:** FINAL / REVIEWED / ADJUDICATED / H1 COMPLETE  
**Phase:** H — Source-Gap Register  
**Batch:** H1 — semantic/blocking-gap adjudication  
**Implementation authority:** SUSPENDED

## 1. Purpose

H1 takes the 20/20 H0 inventory and distinguishes source uncertainty that can still change substantive behavior from source uncertainty that only affects exact historical form, a more permissive optimization path, or ordinary operational governance.

Governing artifacts:

- `PHASE_H_SOURCE_GAP_REGISTER_AUDIT_PLAN.md` — blob `c7999679a6567c186bc3b266a12479ba59ec58f1`;
- `PHASE_H_H0_R1_R20_SOURCE_GAP_INVENTORY.md` — blob `5a5ac208e02a520f7405f1e90f39a75bd7e7a929`.

H1 does **not** assign final source-exhaustion states; H3 owns that work. H1.5 still owns final cross-node overlap arithmetic where needed.

## 2. H1 adjudication rules

A candidate remains `H_SEMANTIC_IMPLEMENTATION` only when uncertainty remains about the substantive rule itself or about a provider/domain mapping needed to apply that rule safely/correctly.

A candidate is retired from Phase-H semantic treatment when the substantive proposition has since been explicitly recovered/confirmed and only independent fidelity/T4 assurance remains.

A candidate moves to H2 when the substantive invariant is fixed and only exact historical schema/name/key/serialization/fixture/closure form remains unknown.

### 2.1 Consequence discriminator added by H1 review

H1 must also distinguish two very different kinds of surviving source uncertainty:

1. **Missing detail needed to choose a safe/correct rule** — the unresolved proposition can still change runtime behavior, provider interpretation, eligibility, health, reconciliation, or authority.
2. **Missing detail that only unlocks a more permissive path while a complete safe default already exists** — the system is already permanently safe without recovering the missing detail; only efficiency/permissiveness is deferred.

The second class is tagged:

`SAFE_DEFAULT_SUFFICIENT`

This is a consequence/treatment class, not proof that the historical source was recovered. It means no new semantic rule is required merely to remain safe.

## 3. Stale historical semantic candidates retired by later source recovery

### R4 — Human Action lineage state model

**Disposition:** `RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED`.

Current R4 recovery provenance states that the `EXACT_LINEAGE / NOT_APPLICABLE / UNKNOWN` Human Action model, the broader `STALE_LINEAGE` context, and the fail-closed transition rules were recovered as confirmed amendments from the R4 confirmation exchange.

Independent fidelity/T4 review remains an assurance task, not an unresolved Phase-H semantic proposition.

### R5 — conservative materiality default

**Disposition:** `RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED`.

Current R5 §3 explicitly freezes `UNCLASSIFIED → MATERIAL BY DEFAULT → INDEPENDENT CONFIRMATION REQUIRED` as a confirmed amendment recovered from the actual R5 confirmation sequence.

### R6 — strongest-applicable verifier / ambiguity default

**Disposition:** `RETIRED AS SOURCE-GAP CANDIDATE / SEMANTIC PROPOSITION RECOVERED`.

Current R6 explicitly recovers the strongest-applicable-verifier rule, the fail-closed unknown verifier policy, and the human-attestation ambiguity default as confirmed material. Exact Policy Registry / Verification Result fields remain H2 representation exactness.

## 4. Genuine surviving H1 semantic / provider-domain gaps — 9

### H1-S01 — R8 reconciliation-capability taxonomy

**Node:** R8  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + `H_NAMING_EXACTNESS`  
**Missing proposition:** whether the recalled five reconciliation-capability distinctions are the correct and complete normative model.  
**Consequence:** the missing model can change whether external execution truth is discoverable by run/resource identity, safely replayable under enforced idempotency, authoritatively observable, or unreconcilable.  
**Authority effect:** `SAFE ONLY UNDER CONSERVATIVE RULE`. Unknown replay/reconciliation capability must not authorize retry.  
**Treatment:** `RECOVER_SOURCE`; otherwise `INDEPENDENT_REDERIVATION` plus conservative fail-closed implementation.  
**Overlap:** R8 × R16 already adjudicated `NO OVERLAP / DISTINCT PROPOSITIONS`.

### H1-S02 — R13 health transition thresholds / stall windows

**Node:** R13  
**Impact:** `H_SEMANTIC_IMPLEMENTATION`  
**Missing proposition:** exact health-state transition thresholds/timers.  
**Consequence:** thresholds decide when a required executor becomes degraded/stalled/failed/unknown and therefore affect truthful health/readiness consumed by other nodes.  
**Authority effect:** `SAFE ONLY UNDER CONSERVATIVE GOVERNED POLICY`.  
**Treatment:** source recovery or independent governed re-derivation.

### H1-S03 — R13 aggregate-health formula

**Node:** R13  
**Impact:** `H_SEMANTIC_IMPLEMENTATION`  
**Missing proposition:** exact aggregate-health formula if separately frozen.  
**Consequence:** aggregation can falsely report a relevant scope healthy despite required failed/stalled/materially-unknown executors if chosen incorrectly.  
**Authority effect:** `SAFE ONLY UNDER CONSERVATIVE RULE`. Required failed/stalled/materially-unknown executors cannot yield a falsely healthy relevant aggregate; unknown expectation cannot default optional.  
**Treatment:** source recovery or independent re-derivation.

H1-S02 and H1-S03 remain separate because threshold policy and aggregation policy can change independently and require different proof.

### H1-S04 — R14 readiness/drain timeout policy

**Node:** R14  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` at bounded-non-convergence policy scope  
**Missing proposition:** exact readiness and incumbent-drain timeout values/timing policies.  
**Consequence:** the bounds decide when replacement leaves normal convergence and enters an owned non-converged state.  
**Authority effect:** does not block the recovered lifecycle model, but a governed finite bound must exist; no automatic transfer or incumbent resumption is permitted.  
**Treatment:** source recovery or independent governed adoption of conservative finite bounds.

### H1-S05 — R15 provider-specific redaction mechanics

**Node:** R15  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION` at provider scope  
**Two-layer result:** the generic invariant is settled: redaction may hide content but must not erase provenance or manufacture `FIELD_ABSENT`/`REPORTED_NULL`. The unresolved question is whether a provider-specific mechanism preserves that invariant.  
**Authority effect:** `BLOCKS CLAIMING AN AFFECTED PROVIDER'S REDACTED OBSERVATION PATH IS R15-COMPLIANT UNTIL MAPPED/VERIFIED`.  
**Treatment:** provider/domain verification or new governed mapping; fail closed on provenance adequacy.

### H1-S06 — R15 provider-specific financial field mappings

**Node:** R15  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION`  
**Missing proposition:** exact provider-specific fields needed to capture financially relevant evidence losslessly before interpretation.  
**Consequence:** incorrect mapping can omit amount/unit/identity/qualifier/provenance evidence before R16 ever receives it.  
**Authority effect:** `BLOCKS R15-COMPLIANT ACTIVATION OF AN AFFECTED PROVIDER ADAPTER UNTIL MAPPED/VERIFIED`.  
**Treatment:** provider documentation/contract verification or governed adapter mapping.

### H1-S07 — R16 provider-specific absolute/delta/cumulative/reversal mappings

**Node:** R16  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION`  
**Missing proposition:** exact provider-specific financial interpretation rules for absolute totals, deltas, cumulative values, reversals/adjustments, informational observations, and related semantics.  
**Consequence:** the same numeric observation can produce different canonical state depending on provider semantics; a wrong map can double-count, undercount, erase corrections, or mishandle reversals.  
**Authority effect:** `BLOCKS CANONICAL FINANCIAL RECONCILIATION FOR AN AFFECTED PROVIDER UNTIL ITS MAPPING IS VERIFIED`. R15 may preserve raw evidence; R7 remains conservative where canonical financial truth is unavailable.  
**Treatment:** provider contract/source verification or governed mapping.  
**Overlap:** distinct from R8 technical reconcilability and from R15 raw-capture mapping.

### H1-S08 — R17 deterministic commercial-equivalence criteria

**Node:** R17  
**Impact:** `H_SEMANTIC_IMPLEMENTATION` + possible `H_REPRESENTATION_EXACTNESS`  
**Missing proposition:** exact deterministic criteria identifying when commercial equivalence is fully reducible rather than requiring material independent judgment.  
**Consequence:** this determines whether the fast deterministic-equivalence path is available.  
**Safety calibration:** **EFFICIENCY/PERMISSIVENESS GAP, NOT A SAFETY BLOCKER.** R17 already has a safe fallback: when deterministic equivalence cannot be established, route the material judgment through R5-compatible independent confirmation or require successor commercial authority.  
**Authority effect:** prior Offer/Grant authority may not be transferred automatically on an unproven equivalence claim.  
**Treatment:** source recovery or independent deterministic re-derivation if the faster path is desired. Safety does not depend on recovering the historical criteria.

### H1-S09 — R17 checkout-provider field mappings

**Node:** R17  
**Impact:** `H_PROVIDER_OR_DOMAIN_MAPPING` + `H_SEMANTIC_IMPLEMENTATION` at provider scope  
**Missing proposition:** provider-specific checkout mappings needed to preserve exact provider/account/checkout/session/terms identity required by the Offer/Grant contract.  
**Authority effect:** `BLOCKS CLAIMING AN AFFECTED CHECKOUT PROVIDER IS R17-COMPLIANT UNTIL MAPPED/VERIFIED`.  
**Treatment:** provider documentation/contract verification or governed adapter mapping.

## 5. `SAFE_DEFAULT_SUFFICIENT` source gaps — 2

These remain historical source gaps because the more permissive historical criteria are not recovered, but no safety rule is missing. The existing default is complete and permanently safe.

### H1-D01 — R10 deterministic artifact-equivalence / materialization criteria

**Node:** R10  
**Missing proposition:** any original detailed criteria that would prove a rebuilt/materialized output remains the exact same Artifact Version rather than a successor.  
**Consequence class:** `SAFE_DEFAULT_SUFFICIENT`.  
**Permanent safe behavior:** if exact identity/equivalence is not proven, treat the output as a successor Artifact Version and require its own QA/Release authority.  
**What remains unavailable:** only a potentially more permissive historical route allowing some outputs to retain prior artifact authority.  
**Implementation effect:** none required for safety; source recovery may improve efficiency/reuse but is not needed to complete the safe rule.  
**Overlap:** distinct from R17 commercial equivalence and R5 independent confirmation.

### H1-D02 — R19 legacy-lineage reconstruction evidence threshold

**Node:** R19  
**Missing proposition:** any original detailed evidence threshold permitting an incomplete legacy commercial lineage to be promoted into deterministically reconstructed authoritative lineage.  
**Consequence class:** `SAFE_DEFAULT_SUFFICIENT`.  
**Permanent safe behavior:** where exact historical lineage cannot be deterministically proven, retain `LEGACY_UNPROVEN`/equivalent and do not reconstruct from current state, later authority, or convenient defaults.  
**What remains unavailable:** only a potentially more permissive historical reconstruction route.  
**Implementation effect:** none required for safety; source recovery may allow more legacy records to become usable but is not needed to complete the safe rule.

## 6. Removed from H1 semantic-source-gap count — operational governance debt

### H1-O01 — R12 retry/backoff timing policy

**Node:** R12  
**Disposition:** `NOT H_SEMANTIC_IMPLEMENTATION / OPERATIONAL GOVERNANCE DEBT`.  
**Reason:** no recovered safety invariant depends on recovering the historical numeric cadence. Retry cadence remains subordinate to R8 replay safety, R7 aggregate admission, R20 boundary eligibility, exact durable occurrence identity, and pause/supersession rules. An aggressive cadence cannot create legitimate replay/resource/authority permission because those gates remain independently mandatory.  
**Implementation effect:** a new operational timing policy may be chosen as current governance without pretending historical recovery.  
**Phase-H effect:** do not count this as a primary semantic/blocking source gap. Historical timing exactness may remain provenance debt if H2/H3 chooses to record it, but it carries no H1 semantic authority consequence.

## 7. Candidates demoted to H2 exactness / traceability

The substantive invariants are recovered; only exact historical form remains unresolved for these families:

- R5 candidate fingerprint field naming/storage exactness;
- R6 Policy Registry / Verification Result field list;
- R11 corrective-class enum/storage names and deterministic key format;
- R12 runnable/job/claim enum/storage and non-WATCH key encoding;
- R13 Executor Expectation Registry schema/storage;
- R14 lifecycle enum/storage, fencing storage mechanism, compatibility schema/field names;
- R15 observation/provenance/redaction schema/field names and synthetic fingerprint algorithm, excluding the provider-specific mechanics isolated in H1-S05/S06;
- R16 reconciliation-policy/derived-state schema and informational-observation exact enum name;
- R17 Offer/Grant schema fields, lifecycle enum names, fingerprint serialization;
- R18 Binding Snapshot / Validation Record field provenance;
- R19 Lineage Reference schema/serialization/hash and transaction/session field names;
- R20 Boundary Registry/Decision schema, validator-policy field names/versioning, exact three-phase strings, and historical forward-governance exact form.

## 8. Cross-node overlap adjudications

### R8 × R16 reconciliation — `NO OVERLAP / DISTINCT PROPOSITIONS`

R8 concerns discovering authoritative technical execution truth; R16 concerns interpreting already-captured financial evidence.

### R12 × R13 × R14 timing — `NO OVERLAP / DISTINCT PROPOSITIONS`

- R12: retry/backoff scheduling cadence;
- R13: health/stall thresholds and aggregate health;
- R14: replacement readiness/drain non-convergence bounds.

### R10 × R17 × R5 equivalence / confirmation — `NO OVERLAP / DISTINCT PROPOSITIONS`

- R10: exact artifact identity/equivalence after materialization/rebuild;
- R17: commercial equivalence across technical successors;
- R5: materially independent confirmation of consequential judgment.

### R15 × R16 provider mappings — `NO OVERLAP / DISTINCT PROPOSITIONS`

R15 maps provider data into preserved raw evidence; R16 maps preserved provider evidence into canonical financial meaning.

### R6 × R18 × R20 capability representation chain — `NO OVERLAP / DISTINCT PROPOSITIONS`

Verification-result representation, exact frozen binding representation, and final boundary-decision representation are different objects with different owners.

### R17 × R19 × R20 commercial identity representation chain — `NO OVERLAP / DISTINCT PROPOSITIONS`

Offer/Grant representation, commercial lineage representation, and final boundary-decision representation are separate authority objects even when they must compose on the same identity history.

### R4 × R5 × R6 GAP-PATTERN-01

This remains a **shared source-recovery pattern**, not a shared semantic proposition. Repeated audit/fixture/closure exact-form uncertainty across the three nodes may share one source-assurance limitation while node-specific exact forms remain separately attributable.

## 9. H1 arithmetic

H1 final adjudicated consequence counts:

- genuine `H_SEMANTIC_IMPLEMENTATION` / `H_PROVIDER_OR_DOMAIN_MAPPING` gaps: **9**;
- `SAFE_DEFAULT_SUFFICIENT` source gaps: **2**;
- operational-governance debt removed from H1 semantic count: **1**;
- stale semantic candidates retired because source was later recovered: **3** (R4, R5, R6);
- H1 cross-node semantic overlaps merged into shared primary gaps: **0**;
- reviewed overlap clusters resolving to distinct propositions: **6** plus the prior H0 R8×R16 adjudication carried forward.

These are H1 consequence counts, not final Phase-H primary-gap counts. H2/H3/H4 still govern exactness grouping, source exhaustion, and final register arithmetic.

## 10. H1 completion state

H1 is complete as semantic/blocking adjudication.

The main result is deliberately asymmetric:

- some missing source propositions genuinely block provider-specific correctness or require governed conservative re-derivation;
- some affect only a more permissive optimization path because a permanent safe default already exists;
- some historical timing/source details are operational governance debt, not semantic authority gaps;
- some old semantic-gap candidates disappeared entirely once later source recovery was reconciled.

Implementation authority remains **SUSPENDED**.

Next: **H1.5 final overlap confirmation / H2 exactness-traceability adjudication**.