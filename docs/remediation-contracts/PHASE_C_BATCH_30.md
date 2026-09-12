# Phase C Batch 30 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-30  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 90 edges across 30 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R20 → R16`
- `R19 → R15`
- `R11 → R10`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — two independent negative-boundary tests

The exact-authoritative-record-binding rule must continue to distinguish true missing trigger-record identity from edges that are correctly complete without an additional direct pointer.

Two independent negative-boundary tests now apply before requiring a new exact-record binding:

### Test A — causal / parallel-truth diagnostic

> **Would the downstream fact still need to exist, unchanged, in a world where the upstream record never existed or was invalid?**

- If **no**, the upstream record is causally load-bearing to the downstream transition and exact-record binding is generally required unless an intentional canonical mediator preserves equivalent identity semantics.
- If **yes**, the facts may be parallel/independent truths and a direct causal pointer must not be manufactured merely because the nodes compose.

### Test B — adjudication-layer diagnostic

> **Does the upstream node produce a distinct authoritative adjudication/decision/disposition record separate from the underlying object/evidence already required to be preserved?**

- If **yes**, and that adjudication causes the downstream transition, preserving only the object/raw evidence is insufficient; the exact adjudication record must be durably bound.
- If **no**, the upstream object/observation may itself be the complete authoritative record. Do not invent a second “decision record” that the upstream contract does not semantically contain.

R15 is the canonical negative example for Test B: it preserves observations, not adjudicated financial meaning. R16 owns interpretation. Therefore an R19 lineage that already binds exact R15 observation identities is not missing a second R15 disposition record.

---

## C30-01 — `R20 → R16`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**`CONSUMES` intentionally withheld.**

**Topology:** `MEDIATED / PARALLEL_TRUTH_COMPOSITION`

**Certification dependency strength:** E2E/financial-adoption integration

### Endpoint source evidence

R20's direct primitive-consumption list does not name R16 as an authority object. Instead, R20's E2E contract requires commercial/financial composition with R15/R16 where adoption or headroom consequences depend on those truths.

R16 reciprocally states that R20 may later determine an execution/result is ineligible for new adoption or action, but that current ineligibility does not erase already-incurred financial truth. R16 also preserves the separate ownership boundary that R7, not R16, controls reservation/headroom authority.

The two nodes therefore carry related but independent propositions: canonical financial truth and current consequential eligibility.

### Negative diagnostics

**Test A:** Would an R16 canonical financial result still need to exist, unchanged, if a particular R20 boundary decision never existed or were invalid? **Yes.** Provider-incurred financial truth does not depend on an R20 decision for its existence.

**Test B:** R16 does have its own interpretation/reconciliation layer, but no R20 decision is what causes R16's canonical financial state to exist. Therefore the causal precondition for a direct exact-trigger-record binding is absent.

### Required fixture

1. R15 evidence produces R16 canonical financial result C1 under policy V1.
2. C1 records authoritative incurred/settled financial truth for the exact execution scope.
3. R20 later evaluates consequential action A1.
4. Applicable financial predicates may be consumed through the governing R7/R19/boundary composition.
5. R20 denial of A1 does not alter C1.
6. R20 allowance of A1 does not promote an R16 `PARTIAL`/`AWAITING_FINAL` result to `EXACT`.
7. Later R16 correction/replay C2 revises financial truth under the governing policy.
8. C2 does not retroactively rewrite prior R20 decision D1; any consequential inconsistency becomes governed regression/remediation.
9. R20 cannot locally reinterpret unresolved financial reconciliation as exact truth.
10. R16 cannot treat R20 `ALLOW` as proof of financial reconciliation.
11. Current ineligibility cannot erase incurred cost.
12. Financial certainty cannot bypass other R20 predicates.

### Disposition

`CONSISTENT_CONSUMPTION`, mediated/parallel truth. `CONSUMES` withheld. No strengthening required.

---

## C30-02 — `R19 → R15`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R15: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** historical-lineage integration

### Endpoint source evidence

R19's canonical commercial-lineage path explicitly extends through `R15 Provider Financial Observation → R16 canonical reconciliation`, and the `Commercial Authority Lineage Reference` must preserve downstream R15/R16 linkage as it becomes available.

R19 §12 further requires preserving the link from the exact commercial operation/transaction to R15's immutable provider-originating financial observations.

R15, in turn, defines each observation as the authoritative raw evidence object itself, carrying exact R8 execution, provider/account, provider-native or synthetic observation identity, raw payload/value shape, times, and genuine-observation provenance.

### Adjudication-layer diagnostic

This edge is clean for a second reason distinct from the C29 parallel-truth case:

> **R15 has no separate adjudication/disposition layer behind the observation object.**

R15's governing split is explicit: `R15 preserves what the provider said; R16 decides what the complete evidence set means.`

Its states such as `REPORTED_ZERO`, `FIELD_ABSENT`, `UNPARSEABLE`, and `UNKNOWN` preserve observation shape. They do not constitute a separate judgment record analogous to an R10 QA disposition, R14 handoff disposition, R19 lineage adjudication, or R20 boundary decision.

Therefore, once R19 already binds the exact immutable R15 observation identities, there is no additional R15 decision record that must also be bound.

### Required fixture

1. L1 governs transaction T1 and exact R8 execution E1.
2. R15 appends observations F1 and F2 for E1.
3. R19 lineage L1 preserves exact linkage to F1/F2.
4. Observation F3 belongs to E2 under lineage L2.
5. Provider/account/customer overlap cannot pull F3 into L1.
6. Later correction F4 for E1 appends without deleting F1/F2.
7. L1 may extend linkage to F4 while retaining earlier observation history.
8. R16 may later revise canonical interpretation while the underlying R15 observation set remains historically attributable to L1.
9. F1 remains financially real even if L1 is later found unauthorized.
10. R19 may record that authority discrepancy but cannot modify F1's raw value/state.
11. Missing R15 evidence cannot be fabricated merely to make L1 appear complete.
12. Exact R15 execution/provider/account provenance does not substitute for the rest of R19 commercial authority.

### Negative diagnostics

**Test A:** Would F1 still exist if the R19 lineage were invalid? **Yes.** R15 observation truth is independently real.

**Test B:** Is there a separate R15 adjudication record beyond F1 that must be bound? **No.** The observation itself is the authoritative raw record; interpretation belongs to R16.

### Disposition

`CONSISTENT_CONSUMPTION`. Direct historical-attribution consumption from the R19 side. No strengthening required.

---

## C30-03 — `R11 → R10`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R10: `66db007de1ccbf1cdac011ef10cb299e5499aec1`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R11 requires integrity/source/artifact repair to restore the exact applicable R9/R10 invariant, preserve exact R10 artifact identity, keep failed history immutable, and create governed successor artifact lineage rather than mutating the failed artifact.

R10 reciprocally says that when QA or release discovers the exact artifact fails, the resulting R11 corrective obligation must preserve exact artifact identity and failure evidence; R11 owns the successor, and repair creates a new Artifact Version with its own QA/release lineage.

The behavioral composition is explicit and determinate.

However, preserving failed Artifact Version P1 and its raw failure evidence does not necessarily preserve the exact R10 QA/release/artifact-integrity decision record that authoritatively concluded P1 failed and thereby caused corrective obligation O1.

### Required strengthening — exact R10 failure/disposition record binding

When an R11 corrective obligation originates from an R10 artifact-integrity, QA, release, deployment-identity, or adoption-mismatch finding, the obligation/history must durably bind:

1. the exact R10 Artifact Version / identity at issue; and
2. the exact R10 failure/verification/disposition record that caused corrective ownership.

> **Preserving failed artifact P1 tells us what failed. Preserving R10 disposition D1 tells us which authoritative artifact judgment actually caused O1.**

### Required fixture

1. Build produces Artifact Version P1.
2. QA evaluates exact P1 and produces R10 record D1 = FAIL.
3. R11 creates corrective obligation O1 from D1.
4. O1 durably binds exact P1 and exact D1.
5. Later QA run D2 evaluates P1 under different evidence/configuration.
6. D2 cannot silently replace O1's originating provenance.
7. Repair produces successor P2; O1 does not mutate P1 into P2.
8. P2 receives its own QA record D3.
9. D3 passing does not rewrite D1 as historical PASS.
10. If D1 is later found erroneous or misbound, every corrective obligation caused by D1 can be identified.
11. An expected-P1/observed-Q deployment mismatch produces its own exact R10 disposition identity rather than merely generic artifact-failure evidence.
12. Correction to R10 state does not itself authorize consequential redeployment; R7/R8/R20 still govern.
13. Passing QA for P2 cannot close a P1 obligation unless R11 completion semantics establish P2 as the governed corrective successor satisfying the relevant R10 invariant.
14. Current/latest artifact cannot substitute for exact P1/D1 provenance.

### Negative diagnostics

**Test A:** Would O1 still exist unchanged if D1 never existed or were invalid? **No.** O1 exists because the authoritative R10 judgment created the corrective condition.

**Test B:** Does R10 have a distinct adjudication layer beyond P1 and raw evidence? **Yes.** QA/release/artifact-integrity verification produces an authoritative judgment distinct from the Artifact Version identity and the evidence evaluated.

Both tests therefore support exact-trigger-record binding.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: both nodes explicitly define the R10↔R11 repair seam.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the intended semantics are determinate.

The missing requirement is exact triggering-decision preservation within an already-defined composition.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R10 failure/disposition-record binding strengthening.

---

## Batch C-30 adjudicated result

- `R20 → R16`: `CONSISTENT_CONSUMPTION`, mediated/parallel truth; `CONSUMES` withheld; no strengthening.
- `R19 → R15`: `CONSISTENT_CONSUMPTION`, direct historical attribution; no strengthening because exact R15 observations are already bound and R15 has no separate adjudication layer.
- `R11 → R10`: `CONSISTENT_CONSUMPTION` with required exact R10 failure/disposition-record binding strengthening.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The standing count remains four.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The standing count remains one.
