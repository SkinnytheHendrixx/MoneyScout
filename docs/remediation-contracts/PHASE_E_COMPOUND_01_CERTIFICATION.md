# Phase E Compound 01 — R1 × R2 × R7 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R1 × R2 × R7`  
**Implementation authority:** SUSPENDED

## 1. Final result and scope

**FINAL RESULT: PASS at the Phase-E specification/composition level, with one new fixture-tier strengthening and no new primary cross-node defect.**

This certification proves that truthful R1 resource semantics, preserved R2 capability/economic uncertainty, and R7 atomic scarce-resource admission compose without semantic laundering when all three participate in one consequential action.

It does not claim implementation closure for R1, R2, or R7.

## 2. Governing prior requirements

The certification carries forward:

- **C08-01 `R1 → R7`** — R7 consumes R1 resource semantics without reinterpretation; `UNKNOWN` is not zero; unconsumed commitment is not automatically released headroom.
- **C07-01 `R2 → R7`** — R7 consumes R2 uncertainty through direct machine-readable semantics rather than fallback-string inference.
- **C07-01 strengthening** — R7 must distinguish `NOT_APPLICABLE`, missing operational capability, unresolved provider/dependency exposure, `UNKNOWN` cash exposure, `KNOWN_ZERO` cash, and scarce zero-incremental-cash entitlement.
- **C41-01/C41-03 `R1 ↔ R2`** — R1 and R2 compose but remain parallel-not-merged; neither may improve the other's unknown state.
- Reciprocal C39 checks preserving the same ownership boundaries and dependency visibility.

## 3. Affirmative control

For one exact Economic Action A1:

1. R1 supplies exact applicable resource facts, including source, bucket, unit, commitment, consumption, provenance, and explicit unknown state.
2. R2 supplies the exact Capability Resolution Outcome that governs A1, including selected path, cost knowledge, dependency uncertainty, operational uncertainty, fallback reason, and provenance.
3. R7 receives those semantics directly rather than inferring them from fallback strings or selected-provider labels.
4. R7 derives the complete applicable reservation vector for A1.
5. Every required scarce-resource dimension is admitted atomically or the action receives no complete reservation authority.
6. A favorable fact in one dimension may not erase an unresolved or disqualifying fact in another.
7. The reservation decision is bound to the exact R2 resolution outcome and exact reservation/resource vector that justified it.
8. Admission uses current authoritative R1 resource state at the actual R7 admission boundary rather than an earlier snapshot merely carried through R2 resolution.

## 4. New required strengthening — exact R2-resolution binding at R7

Phase-E review identified a real exact-object correspondence gap that was not fully explicit in the pairwise corpus.

> **Every R7 Economic Action/reservation set whose admission semantics materially depend on an R2 Capability Resolution Outcome must durably bind the exact immutable R2 outcome/version and the exact resource/reservation vector derived from that outcome. A materially different R2 re-resolution must not silently reuse the old reservation decision.**

Required fixture:

1. R2 creates outcome `Q1` for action A1 at T1, selecting path P1 with exact cost/dependency/operational semantics.
2. R7 creates reservation decision/reservation set `RS1` from Q1 and binds Q1's exact identity/version plus the derived reservation vector.
3. R2 later creates materially different outcome `Q2` for the same higher-level action intent, changing one or more cost/resource/dependency dimensions.
4. `RS1` may remain historical evidence of what was reserved under Q1, but Q2 cannot silently consume or inherit RS1 as though Q1 and Q2 were equivalent.
5. Any new consequential execution under Q2 requires a fresh R7 admission decision for Q2's actual vector unless an explicit governing rule proves the prior reservation remains exactly valid for Q2.
6. Restart/recovery preserves the Q1↔RS1 correspondence rather than resolving to whichever R2 outcome is current.
7. A successor reservation/version must not mutate historical Q1/RS1 attribution.

This is a fixture-tier strengthening, not a new `MISSING_REQUIRED_COMPOSITION`: R2→R7 composition already exists and is semantically explicit; the missing precision is exact adjudication/version identity.

R1 does not require an analogous separate adjudication pointer merely because its facts are consumed. R1's resource attribution is observational/semantic state rather than a separate adjudication outcome of the R2 kind; exact R1 resource-state identity/provenance remains part of the resource facts and reservation-vector semantics themselves.

## 5. Deliberate compound attacks

### E1 — Unknown resource state plus selected path

R1 contains materially unknown resource attribution while R2 selects a concrete path.

**Expected:** selection does not improve R1 truth or create usable capacity.

### E2 — Available-looking resource plus unknown external exposure

R1 exposes apparently available local capacity while R2 still records unknown external economic exposure.

**Expected:** local capacity does not prove unknown external exposure is zero or safely bounded.

### E3 — Known-zero cash plus scarce entitlement

R2 proves zero incremental cash, but the selected path consumes subscription entitlement, quota, request capacity, concurrency, or another scarce non-cash resource.

**Expected:** the non-cash resource remains R7-governed.

### E4 — `NOT_APPLICABLE` collapsed into free

A runtime R2 outcome reports that a cost/resource concept is `NOT_APPLICABLE` for the action instance.

**Expected:** that runtime claim does not by itself erase an otherwise applicable resource dimension or become `KNOWN_ZERO`/resource-free. Independent governing semantics must establish the exclusion.

**Structural exception:** an action class may have a resource dimension that is definitionally/architecturally inapplicable by a separately governed design rule. That category-level exclusion need not be re-proven dynamically for every instance merely because R2 also carries `NOT_APPLICABLE`. The distinction is between a pre-governed structural exclusion and an instance-level R2 assertion that would otherwise suppress a resource dimension.

### E5 — Favorable economics plus unresolved operational-capability concern

Cash/resource exposure is favorable, but R2 still carries an unresolved operational-capability concern.

**Expected:** R1/R2/R7 must preserve that unresolved state and must not behave as though it were settled merely because resource economics are favorable. This compound does **not** adjudicate whether the capability is actually usable; R6 owns capability readiness, with R18/R20 governing later binding/boundary semantics where applicable.

### E6 — Selected path plus unresolved provider/dependency exposure

A provider or implementation path is selected while dependency/provider uncertainty remains.

**Expected:** unresolved state remains explicit; selection is not evidence of safety.

### E7 — Partial-vector laundering

A1 requires multiple resource dimensions. One is known and available; another is unknown or unavailable.

**Expected:** the complete action cannot pass merely because one component is valid. Partial resource safety is not complete admission safety.

This is a compound-level **vector-completeness** requirement distinct from pairwise correctness.

### E8 — Commitment remainder turned into new headroom

R1 records allocation = 100, commitment = 100, consumption = 10.

**Expected:** the unconsumed 90 is not treated as newly available commitment authority until governing release/reconciliation semantics actually release it.

### E9 — Mixed-family certainty leakage

Capability/resource family F1 has affirmative known-zero evidence. Family F2 remains unresolved or unknown.

**Expected:** F1 certainty does not leak into F2. Each resource/effect family preserves its own truth.

This is a compound-level **cross-semantic non-override** requirement distinct from E7.

### E10 — Fallback-string inference

R7 infers resource/economic safety from `CUSTOM_BUILD_REQUIRED`, `SEARCH_BUDGET_EXHAUSTED`, selected-provider labels, or another convenient resolution string.

**Expected:** FAIL. R7 must consume the direct semantic state required by C07-01.

### E11 — stale resource-state carry-through

R1 resource state is read at T1 while R2 resolves the action. R7 admission occurs later at T2, after resource/authority state may have changed, but admission reuses the T1 snapshot merely because it was carried through R2.

**Expected:** FAIL. R7 admission must evaluate the authoritative resource/admission facts at the actual serialization/admission boundary and may not treat an earlier R2-time resource snapshot as commit-time authority. R2's still-valid selection/cost conclusions do not freeze R1 headroom or R7 admission authority.

This attack complements, rather than duplicates, R7's atomicity/commit-time serialization fixture: the specific compound risk is laundering stale R1 state through an otherwise valid R2 outcome.

## 6. Pairwise-correct / compound-unsafe cases

Phase-E review confirms that pairwise passes do not exhaust the compound failure space.

- E7 requires simultaneous evaluation of multiple resource dimensions for one action.
- E9 prevents certainty from one resource/capability family from contaminating another.
- E11 prevents an earlier resource snapshot from acquiring authority merely because it traveled through a valid R2 resolution.
- The exact R2-resolution strengthening prevents a stale/superseded adjudication from remaining invisibly attached to a later reservation/execution path.

## 7. Open Phase-C findings

The four confirmed Phase-C `MISSING_REQUIRED_COMPOSITION` findings and C21-03 do not block this exact R1/R2/R7 compound:

- `R17 → R18`
- `R5 → R20`
- `R19 → R14`
- `R19 → R18`
- `R11 → R8` / C21-03

They remain active for their owning wider scenarios and are not remediated here.

## 8. Final disposition

**R1 × R2 × R7: PASS WITH ONE NEW FIXTURE-TIER STRENGTHENING.**

No new primary `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or upstream-semantic contradiction is established.

The compound certifies:

- truthful R1 resource semantics survive into admission;
- R2 uncertainty survives selection and remains machine-readable;
- R7 alone owns atomic reservation/admission;
- favorable facts cannot override unresolved dimensions;
- resource vectors are complete rather than cherry-picked;
- certainty is family-scoped rather than globally contagious;
- runtime `NOT_APPLICABLE` cannot suppress resource requirements without independent governing support, while structurally inapplicable action classes may rely on pre-governed architectural exclusions;
- unresolved operational-capability concerns are preserved without R1/R2/R7 usurping R6 adjudication;
- R7 binds the exact R2 adjudication/version that materially justified its reservation vector;
- R7 admission is based on current authoritative resource state at the actual admission boundary, not a stale snapshot carried through R2.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.