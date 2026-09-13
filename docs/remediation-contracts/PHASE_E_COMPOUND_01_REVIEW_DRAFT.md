# Phase E Compound 01 — R1 × R2 × R7

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Implementation authority:** SUSPENDED

## 1. Scope

R1 owns truthful resource-state semantics: source, bucket, unit, committed, consumed, provenance, and explicit unknown state.

R2 owns capability-resolution semantics: selected path, fallback reason, cost knowledge, dependency uncertainty, operational uncertainty, and provenance.

R7 owns atomic scarce-resource reservation/admission.

The compound passes only if R1 resource truth and R2 uncertainty survive intact into R7 admission without reinterpretation, semantic leakage, or one favorable dimension masking another unresolved dimension.

## 2. Governing Phase-C requirements

- **C08-01 `R1 → R7`** — R7 consumes R1 resource semantics without reinterpretation. `UNKNOWN` is not zero. Unconsumed commitment is not automatically released headroom.
- **C07-01 `R2 → R7`** — R7 consumes R2 uncertainty through direct machine-readable semantics rather than fallback-string inference.
- **C07-01 strengthening** — R7 must distinguish `NOT_APPLICABLE`, missing operational capability, unresolved provider/dependency exposure, `UNKNOWN` cash exposure, `KNOWN_ZERO` cash, and scarce zero-incremental-cash entitlement.
- **C41-01/C41-03 `R1 ↔ R2`** — R1 and R2 compose but remain parallel-not-merged; neither may improve the other's unknown state.
- Reciprocal C39 checks preserve the same ownership boundaries and keep the C07-01 fixture live.

## 3. Affirmative control

For one exact Economic Action A1:

1. R1 supplies exact applicable resource facts, including source, bucket, unit, commitment, consumption, provenance, and unknown state.
2. R2 supplies the exact selected-path, cost-knowledge, dependency, and operational-uncertainty state.
3. Those facts are available directly as semantic state rather than inferred from fallback labels.
4. R7 derives the complete applicable reservation vector.
5. Every required resource dimension is admitted together, or the action receives no complete reservation authority.
6. A favorable fact in one dimension may not erase an unresolved or disqualifying fact in another.

## 4. Deliberate attacks

### E1 — Unknown resource state plus selected path

R1 contains materially unknown resource attribution while R2 selects a concrete path.

**Expected:** selection does not improve R1 truth or create usable capacity.

### E2 — Available-looking resource plus unknown external exposure

R1 exposes apparently available local capacity while R2 still records unknown external economic exposure.

**Expected:** local capacity does not prove unknown external exposure is zero or safely bounded.

### E3 — Known-zero cash plus scarce entitlement

R2 proves zero incremental cash, but the selected path consumes subscription entitlement, quota, request capacity, or concurrency.

**Expected:** the non-cash scarce resource remains R7-governed.

### E4 — `NOT_APPLICABLE` collapsed into free

R2 reports that one cost concept does not apply.

**Expected:** `NOT_APPLICABLE` is not converted into `KNOWN_ZERO` or no-resource-required unless independent R1/R7 semantics establish that conclusion.

### E5 — Favorable economics plus missing operational capability

Cash/resource exposure is favorable, but R2 still records a missing operational capability.

**Expected:** favorable economics do not erase the unresolved capability state or manufacture permission to proceed.

### E6 — Selected path plus unresolved provider/dependency exposure

A provider or implementation path has been selected while dependency/provider uncertainty remains.

**Expected:** the unresolved state remains explicit; selection is not evidence of safety.

### E7 — Partial-vector laundering

A1 requires multiple resource dimensions. One is known and available; another is unknown or unavailable.

**Expected:** the complete action cannot pass merely because one component is valid. Partial resource safety is not complete admission safety.

This is a compound-level **vector-completeness** test.

### E8 — Commitment remainder turned into new headroom

R1 records allocation = 100, commitment = 100, consumption = 10.

**Expected:** the unconsumed 90 is not treated as newly available commitment authority until governing release/reconciliation semantics actually release it.

### E9 — Mixed-family certainty leakage

Capability/resource family F1 has affirmative known-zero evidence. Family F2 remains unresolved or unknown.

**Expected:** F1 certainty does not leak into F2. Each resource/effect dimension preserves its own truth.

This is a compound-level **cross-semantic non-override** test.

### E10 — Fallback-string inference

R7 infers resource/economic safety from labels such as `CUSTOM_BUILD_REQUIRED`, `SEARCH_BUDGET_EXHAUSTED`, a selected provider, or another convenient resolution string.

**Expected:** certification fails. R7 must consume the direct semantic state required by C07-01.

## 5. Provisional disposition

**PASS at the Phase-E specification/composition level, subject to the live C07-01 acceptance-fixture strengthening.**

No new `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is presently identified.

The compound-specific additions are E7 and E9: pairwise correctness is insufficient if a valid resource dimension can mask another unresolved one or if certainty from one capability/resource family can contaminate another.

This is specification certification only. It does not claim R1, R2, or R7 implementation closure.

## 6. Requested adversarial review

1. Are E7 and E9 genuinely necessary compound-level coverage, or are they already completely enforced by existing pairwise fixtures?
2. Is there a still-missing **exact correspondence requirement** among the specific R1 Resource Attribution, the specific R2 Capability Resolution Outcome, and the exact R7 Economic Action/reservation set?
3. Can `NOT_APPLICABLE`, `KNOWN_ZERO`, or a selected fallback ever legitimately suppress an otherwise applicable resource dimension without independent R1/R7 proof?
4. Is missing operational capability correctly treated here as a state that prevents optimistic progression, or should the compound say only that R7 must not infer authority while another owner supplies the actual blocker?
5. Does any of the four Phase-C MRCs or C21-03 constrain this exact compound rather than only wider E2E scenarios?
6. Find any three-node failure mode in which all pairwise seams are individually correct but the combined action is still semantically unsafe.

Do not accept the provisional PASS merely because `R1→R7`, `R2→R7`, and `R1↔R2` each passed independently. The question is whether the complete resource-and-uncertainty vector remains truthful and properly separated when all three participate in one action.
