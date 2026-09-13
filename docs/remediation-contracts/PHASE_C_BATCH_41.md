# Phase C Batch C-41 — Terminal Consolidated Edge Sweep

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-41  
**Edges classified:** 20  
**Cumulative Phase C count after this batch:** 163 / 163  
**Unclassified after this batch:** 0  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged  
**Implementation authority:** SUSPENDED

This terminal tranche applies the hardened accelerated-review discipline established in C38-C40. Every remaining `U` edge was independently classified, source-first against frozen endpoint blobs, with reciprocal/dependency scans and exact-authoritative-object checks. Adversarial review confirmed the four proposed exact-correspondence strengthenings and identified one additional shared R4↔R11 exact-adjudication strengthening. Edgewise coverage is complete after this batch, but Phase C itself remains open pending terminal mechanical reconciliation and final compound/hard-chain certification.

---

## C41-01 — `R1 → R2`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R1 owns truthful resource-state semantics; R2 owns capability-resolution uncertainty. Both explicitly define the interface: R2 may consume R1-compatible resource truth but may not reinterpret `UNKNOWN` as zero/available, and R1 does not force R2 to pretend cost certainty. The R1×R2×R7 compound remains governing.

**Disposition:** clean bilateral semantic consumption.

---

## C41-02 — `R1 → R16`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `UNILATERAL_DECLARATION`

R1 generic resource attribution does not replace R15 raw provider-financial evidence or R16 deterministic reconciliation. R16 derives canonical financial truth from R15, not R1. The facts compose downstream around R7 safety but remain parallel truths.

**Disposition:** clean parallel truth.

---

## C41-03 — `R2 → R1`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Independent reciprocal review re-derives C41-01: R2 selection/fallback cannot improve R1 resource truth; `UNKNOWN` remains unknown.

**Disposition:** clean reciprocal; no duplicate strengthening.

---

## C41-04 — `R2 → R4`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R2 explicitly preserves capability-resolution uncertainty under the exact originating evaluation lineage; R4 owns immutable Evaluation Cycle identity/eligibility. Stale Cycle A authority plus unresolved R2 uncertainty must not become a false-safe state through current-cycle substitution or uncertainty flattening.

**Disposition:** clean exact-lineage/uncertainty composition.

---

## C41-05 — `R2 → R6`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `UNILATERAL_DECLARATION`

R2 records selection/fallback and unresolved uncertainty; R6 determines whether an exact capability/access claim is sufficiently verified. Selection is not proof, and R6 proof does not erase unrelated R2 uncertainty.

**Disposition:** clean parallel composition.

---

## C41-06 — `R2 → R20`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `UNILATERAL_DECLARATION`

R2 lifecycle/provider facts are resolution provenance, not perpetual execution authority. R20 does not consume R2 as a first-class predicate; material R2 consequences are intentionally mediated into R11, R7, R6/R18, and the lineage/authority chain R20 does consume. This is deliberate mediation, not missing direct composition.

**Disposition:** clean mediated/parallel boundary.

---

## C41-07 — `R4 → R2`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Reciprocal review confirms C41-04: exact lineage does not resolve R2 uncertainty; R2 selection does not create lineage authority.

**Disposition:** clean reciprocal.

---

## C41-08 — `R4 → R5`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R4 establishes the exact Evaluation Cycle/candidate lineage; R5 confirms the exact material candidate under exact evidence/lineage/fingerprint. Confirmation of the wrong lineage is invalid, while exact lineage alone does not satisfy required independent confirmation.

**Disposition:** clean direct composition.

---

## C41-09 — `R4 → R11`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R4 detects stale/unknown/ineligible lineage and R11 owns the executable successor/revision path. Adversarial review identified the same exact-adjudication pattern already confirmed for R20, R9, R19, R14, R10, and R6 feeding R11: binding only the lineage object is insufficient when the corrective obligation was caused by a specific R4 eligibility verdict.

### Required strengthening — exact R4 eligibility-determination binding

> **When an R11 corrective obligation is caused by an R4 lineage-eligibility determination, the R11 obligation must durably bind both the exact immutable R4 lineage object and the exact R4 eligibility-determination record/result that caused the obligation, including the specific verdict (`eligible`, `stale/ineligible`, `unknown` or equivalent), the evaluation boundary/time or decision context at which it was made, the current-state/cycle comparison against which the historical lineage was evaluated, the governing R4 policy/version where applicable, and sufficient evidence/provenance to reconstruct why that verdict caused corrective ownership. Binding only the originating Evaluation Cycle/lineage object is insufficient.**

Required fixture:

1. Historical authority object X is bound to Cycle A.
2. R4 evaluates A at boundary B1 against current comparison state C1 and produces eligibility result ER1 = stale/ineligible (or unknown).
3. R11 creates corrective obligation O1 because of ER1.
4. O1 binds exact X/A and exact ER1/B1/C1 provenance.
5. Later Cycle B becomes current or A is evaluated again at B2/C2 producing ER2.
6. ER2 cannot silently replace ER1 as the origin of O1.
7. O1 may lead to a successor/re-evaluation path, but its historical cause remains ER1.
8. If a materially different eligibility determination should create a different corrective scope/completion rule, R11 uses a governed successor/version rather than mutating O1.
9. Current-cycle substitution cannot repair the historical origin.
10. Completion of O1 does not rewrite ER1 or X/A.

This is not `MISSING_REQUIRED_COMPOSITION`: R4 explicitly routes corrective ownership to R11 and R11 already requires exact lineage/governing authority. The strengthening closes the missing exact adjudication identity within that existing composition.

**Disposition:** `CONSISTENT_CONSUMPTION` with one new exact-R4-eligibility-determination strengthening.

---

## C41-10 — `R5 → R4`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Reciprocal review re-derives C41-08. R5 confirmation remains attached to exact R4 lineage historically but cannot establish current eligibility.

**Disposition:** clean reciprocal.

---

## C41-11 — `R8 → R6`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld.**  
**Topology:** `UNILATERAL_DECLARATION`

R6 capability readiness and R8 exact external-execution truth are separate propositions. The R6/R7/R8 provider/account scope-consistency checkpoint does not require R8 to duplicate the exact R6 Verification Result because R18 owns exact frozen capability-binding/verification provenance for consequential execution.

**Disposition:** clean parallel truth.

---

## C41-12 — `R9 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

R9 resource-consuming source acquisition/verification remains subject to R7. A valid source snapshot creates no resource authority and R7 reservation cannot establish source authority.

### Carried-forward negative control — R9 §11.1

If exact-source verification requires scarce work and R7 denies admission: no provider lookup occurs; current branch/HEAD is not promoted as fallback source authority; the Build remains blocked/pending until governed verification or another authorized disposition exists.

**Disposition:** clean direct resource consumption with live negative control preserved.

---

## C41-13 — `R9 → R8`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Direct `CONSUMES` withheld except where a specific R9 operation crosses an external boundary.**  
**Topology:** `BILATERAL_CORROBORATION`

R9 immutable source authority and R8 external-operation truth remain separate. External repository mutation/provisioning may require R8 identity, but successful mutation does not authorize Build consumption unless the exact resulting commit becomes governed R9 source authority.

**Disposition:** clean source-authority/external-truth composition.

---

## C41-14 — `R10 → R7`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `BILATERAL_CORROBORATION`

Build, QA, repair, packaging, release, deployment, verification, and artifact-inspection work consuming scarce resources remains subject to R7. R10 artifact identity creates no resource authority; R7 reservation does not prove artifact identity or QA/adoption lineage.

**Disposition:** clean direct resource consumption.

---

## C41-15 — `R11 → R4`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

Independent reciprocal review re-derives the same missing invariant as C41-09. When R11 corrective ownership is caused by stale/unknown/ineligible R4 lineage, the obligation must preserve both the exact historical lineage and the exact R4 eligibility determination that caused it; a later/current R4 verdict cannot replace the historical origin.

### Carried-forward reciprocal dependency

C41-09's exact-R4-eligibility-determination strengthening governs this edge in full. Under the C33 anti-double-counting rule, C41-15 does not create a second strengthening because independent reciprocal review identified the same underlying invariant.

**Disposition:** clean reciprocal subject to C41-09 strengthening; no duplicate finding.

---

## C41-16 — `R12 → R3`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R12 schedules R3 freshness rechecks, while R3 permits one evidence object to serve multiple consumers under materially different policies. A generic `revalidate E` occurrence is ambiguous about which correct freshness question it represents.

### Required strengthening — exact R3 revalidation-target binding

> **Every R12 runnable occurrence materialized for an R3 freshness revalidation must durably bind the exact authoritative R3 revalidation target/identity or fingerprint it represents, including enough immutable consumer context to distinguish the exact evidence/snapshot, Opportunity/Evaluation lineage or other governed consumer identity, applicable freshness policy/version, and decision use whose freshness must be reevaluated. A generic `revalidate evidence E` occurrence is insufficient when E is shared across materially different policy/consumer contexts.**

Fixture: E is shared by C1/P1 current-pricing and C2/P2 historical-use consumers; Q1 is created for C1/P1/E; crash/restart preserves C1/P1/E; a C2/P2 result cannot satisfy Q1; material policy/lineage changes require governed successor/version semantics; repeated recovery converges on one occurrence for the same exact target.

**Disposition:** `CONSISTENT_CONSUMPTION` with new exact-R3-revalidation-target strengthening.

---

## C41-17 — `R12 → R4`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R12 explicitly requires reconstructed future execution to preserve originating R4 lineage and forbids replacing it with whichever cycle/current object exists when delayed work wakes up. R20 later evaluates current eligibility; scheduling persistence does not grant perpetual authority.

**Disposition:** clean direct lineage consumption.

---

## C41-18 — `R12 → R5`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R12 schedules R5 confirmation retries/follow-ups; R5 requires confirmation to bind the exact candidate/evidence/lineage/fingerprint, and material candidate/evidence change invalidates prior confirmation.

### Required strengthening — exact R5 confirmation-target binding

> **Every R12 runnable occurrence created for R5 independent confirmation, challenge follow-up, or governed confirmation retry must durably bind the exact R5 candidate/confirmation target identity or fingerprint it represents. The occurrence must not resolve the target from current Opportunity state, current candidate text, latest evidence, or whichever unresolved candidate is current when the occurrence wakes up.**

Fixture: Q1 is created for exact X/S1; candidate/evidence later changes to X2/S2; Q1 cannot confirm X2/S2; successor target gets its own governed occurrence; crash/restart preserves X/S1; challenged/inconclusive results stay attached to X; occurrence remains distinct from the R5 confirmation record itself.

**Disposition:** `CONSISTENT_CONSUMPTION` with new exact-R5-confirmation-target strengthening.

---

## C41-19 — `R12 → R6`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R12 schedules R6 verification/callback/retry work; R6 verification target identity is materially claim/provider/account/scope/policy specific. Same capability key does not imply the same claim or authority.

### Required strengthening — exact R6 verification-target binding

> **Every R12 runnable occurrence materialized for R6 capability verification, callback completion, reverification, or governed retry must durably bind the exact authoritative R6 verification target identity/version it represents, including enough immutable claim/provider/account/scope/policy provenance to prevent a scheduled occurrence for one verification target from being consumed as verification of another.**

Fixture: Q1 targets K/provider A/account A1/policy V1; before execution current projection changes to A2, provider B, V2, or broader scope; Q1 cannot silently verify the new target; callbacks cannot cross-target; crash/restart preserves T1; R7 denial may block work but cannot weaken verifier requirements; R18 later binds the exact qualifying R6 Verification Result.

**Disposition:** `CONSISTENT_CONSUMPTION` with new exact-R6-verification-target strengthening.

---

## C41-20 — `R18 → R5`

**Primary:** `CONSISTENT_CONSUMPTION`  
**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`  
**Topology:** `UNILATERAL_DECLARATION`

R18 explicitly subjects material provider-family equivalence affecting substitution authority to R5 unless fully reducible to authoritative deterministic facts. R5's generic exact-candidate machinery exists, but C24-02's R17-specific fixture does not cover R18's binding/provider/account/scope dimensions.

### Required strengthening — R18-specific exact equivalence-candidate binding

> **Whenever an R18 capability-binding validation, rebinding/successor decision, or contract-permitted substitution path materially relies on an R5-governed provider-family/binding-equivalence conclusion, the consumed R5 confirmation must bind the exact equivalence proposition being relied upon: the exact originating binding/provider/account/claim/scope, proposed provider/account/binding alternative, governing execution/operation class, applicable verification/lifecycle policy context, evidence snapshot, candidate fingerprint, and the precise authority question for which equivalence is asserted. A generic `provider B is equivalent to provider A` conclusion is insufficient.**

Fixture: execution X is frozen to B1=A/A1/C/S; B2=B/B1 is proposed; EQ1 binds exact B1/B2/claim/scope/operation/policy/evidence; changing binding/account/scope/policy invalidates transfer; general similarity is insufficient; deterministic verifier remains available where fully reducible; challenged/inconclusive blocks reliance; even confirmed equivalence does not authorize substitution unless the execution contract separately permits it; historical B1 identity remains intact.

### Relation to C24-02

This is an analogous independently-instantiated strengthening, not a duplicate reciprocal citation. Implementing C24-02's P1/P2/O1/terms/entitlements fixture would not enforce R18's distinct binding/provider/account/scope field set. The shared systemic principle is exact domain-specific equivalence-candidate binding; this edge requires its own R18-specific enforcement fixture.

**Disposition:** `CONSISTENT_CONSUMPTION` with distinct R18-specific exact equivalence-candidate strengthening.

---

# Batch C-41 final result

All 20 remaining frozen edges are classified. Fifteen edge entries are clean/non-new-governance entries. Five strengthening entries govern the terminal tranche:

1. **C41-09 / C41-15 shared invariant:** exact R4 eligibility-determination binding when R4 verdict causes R11 corrective ownership (one strengthening, independently re-derived on the reciprocal edge).
2. **C41-16:** exact R3 freshness-revalidation target binding on R12 occurrence.
3. **C41-18:** exact R5 confirmation-target binding on R12 occurrence.
4. **C41-19:** exact R6 verification-target binding on R12 occurrence.
5. **C41-20:** R18-specific exact provider/binding-equivalence candidate binding under R5.

Cumulative result after C-41:

- frozen inventory: **163**;
- classified: **163**;
- unclassified: **0**;
- duplicate classified edges: **0**;
- classified edges absent from inventory: **0**;
- confirmed `MISSING_REQUIRED_COMPOSITION`: **4**, unchanged;
- open `UNRESOLVED_CROSS_NODE_GAP`: **1**, unchanged;
- new C41 strengthening entries: **5**.

Edgewise classification is complete. Phase C is **not yet closed**: terminal mechanical reconciliation must independently verify all 163 section pointers and zero residual `U` entries, followed by the frozen final compound/hard-chain certification.