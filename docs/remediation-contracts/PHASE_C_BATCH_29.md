# Phase C Batch 29 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-29  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 87 edges across 29 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4, unchanged  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R19 → R11`
- `R14 → R11`
- `R17 → R15`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

## Standing-rule refinement — causal record binding vs independent truth

The exact-authoritative-record-binding rule from C-28 is load-bearing, but it must not be over-applied.

For any cross-node seam, ask first whether a specific upstream authoritative record **causes, routes, confirms, denies, adjudicates, or otherwise creates** the downstream state transition. If yes, the downstream history must durably bind that exact upstream record identity unless an intentional canonical mediator preserves the same identity semantics.

Use the following negative diagnostic:

> **Would the downstream fact still need to exist, unchanged, in a world where the upstream record never existed or was invalid?**

- If **no**, the upstream record is causally load-bearing to the downstream transition and exact-record binding is required.
- If **yes**, the two facts are parallel/independent truths that may compose through a canonical mediator; do not manufacture a direct binding requirement merely because the nodes participate in the same end-to-end path.

This negative boundary prevents the standing rule from becoming a loophole-free but semantically wrong requirement for redundant direct pointers everywhere.

---

## C29-01 — `R19 → R11`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R19 explicitly states that historical commercial-authority mismatches, post-hoc-authority findings, or authority regressions remain owned remediation conditions under applicable R11/R20 rules. R19 also owns the exact frozen `Commercial Authority Lineage Reference` / composite fingerprint that identifies the commercial path being judged.

R11 reciprocally requires corrective obligations to preserve what failed, the exact affected object/version/execution/artifact/lineage, the governing authority that created the obligation, and supporting evidence/provenance.

The ownership handoff is therefore explicit and determinate.

However, preserving the lineage object itself is not equivalent to preserving the exact R19 validation/adjudication/disposition record that concluded the lineage was incomplete, mismatched, post-hoc, or historically unauthorized and thereby caused remediation.

### Required strengthening — exact R19 lineage-disposition record binding

When an R11 obligation originates from an R19 lineage-integrity failure, post-hoc-authority finding, or historical commercial-authority regression, the obligation/history must durably bind:

1. the exact R19 `Commercial Authority Lineage Reference` / fingerprint at issue; and
2. the exact R19 validation/adjudication/disposition record that established the failure.

> **Preserving the lineage object identifies what was judged. Preserving the R19 disposition record identifies what judgment actually caused remediation.**

### Required fixture

1. Commercial execution X is frozen to lineage L1.
2. R19 later evaluates L1 and creates disposition D1: required authority was absent at execution time or post-hoc repair cannot legitimize X.
3. R11 creates O1 from D1.
4. O1 durably binds both exact L1 and exact D1.
5. Later R19 evaluation D2 concerns L1 after repair/backfill.
6. D2 cannot replace O1's originating provenance.
7. A repaired/currently complete L1 does not rewrite D1's historical conclusion.
8. If D1 is later shown erroneous, every obligation created from D1 can be identified.
9. If another lineage L2 shares Asset/Offer/provider dimensions, neither L2 nor a disposition about L2 can satisfy O1 provenance.
10. A successor remediation action still requires its own R20 authority.
11. Financial corrections under R15/R16 do not erase the R19 authority-regression record.
12. Legacy reconstruction that cannot uniquely establish historical lineage remains unproven rather than generating a falsely precise D1.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R19 expressly creates owned remediation and names the R11/R20 ownership path. The gap is exact durable triggering-record identity inside an existing composition.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the desired behavior is determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R19 lineage-disposition record binding strengthening.

---

## C29-02 — `R14 → R11`

**Pinned endpoint blobs**

- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`
- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Endpoint source evidence

R14 explicitly routes several bounded replacement failures into R11 ownership:

- `NONTRANSFERABLE_BLOCKED` requires R11 corrective disposition;
- `READINESS_TIMEOUT` routes to an R11-owned `ABORT_REPLACEMENT` or `HUMAN_BOUNDARY` where genuinely required;
- incumbent drain non-convergence routes to a bounded R11-owned replacement disposition;
- an R11 `ABORT_REPLACEMENT` authorizes the governed abort path but does not by itself prove incumbent resumption is safe.

R11 reciprocally owns durable corrective obligations and preserves exact scope, authority context, evidence/provenance, successor scope, and completion rules.

The handoff is explicit. But the resulting obligation is not required to preserve the exact R14 handoff/non-convergence/disposition record that caused it.

### Required strengthening — exact R14 handoff/non-convergence record binding

An R11 replacement-related corrective obligation must durably bind the exact R14 handoff/non-convergence/disposition record that created it, including enough identity to distinguish, where relevant:

- replacement attempt;
- incumbent runtime/executor/service path;
- successor;
- authority epoch/generation;
- transferred scope;
- exact timeout/non-transferability condition;
- readiness/drain evidence;
- in-flight-work disposition; and
- whether transfer had committed.

### Required fixture

1. Replacement H1 begins from incumbent A to successor B.
2. R14 records readiness evaluation D1.
3. B fails to converge; D1 reaches `READINESS_TIMEOUT`.
4. R11 creates O1 = `ABORT_REPLACEMENT`.
5. O1 durably binds H1/D1.
6. A pre-transfer abort obligation must not be reused to rewind authority after transfer has committed; post-transfer rollback is a new governed handoff/epoch.
7. Later replacement H2 involving A→C succeeds or fails differently.
8. H2's decision cannot become O1's provenance.
9. Drain-timeout and readiness-timeout records remain distinguishable.
10. `NONTRANSFERABLE_BLOCKED` for in-flight item X preserves the exact R14 disposition for X.
11. A later healthy successor does not rewrite why O1 was created.
12. Any resumed or replacement execution still passes R20 and ordinary R7/R8/R12/R13 gates.

### Calibration

This is not `MISSING_REQUIRED_COMPOSITION`: R14→R11 routing is explicit and ownership is clear. The under-specification is forensic identity of the particular R14 record that triggered the R11 obligation.

It is not `UNRESOLVED_CROSS_NODE_GAP`: the normative behavior is determinate.

### Disposition

`CONSISTENT_CONSUMPTION` with required exact R14 handoff/non-convergence record binding strengthening.

---

## C29-03 — `R17 → R15`

**Pinned endpoint blobs**

- R17: `16a234e897fe6e119392707a7187a3232f0fd972`
- R15: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**`CONSUMES` intentionally withheld.**

**Topology:** `MEDIATED / BILATERALLY_COMPATIBLE`

**Certification dependency strength:** E2E/mediated commercial-financial integration

### Endpoint source evidence

R17 owns the immutable commercial-authority object: exact Offer Version, charging Grant, provider/account scope, price/terms, entitlements, checkout configuration, and related commercial authority dimensions.

R15 independently owns raw provider-originating financial observation truth and binds observations to exact R8 execution, provider, provider account, and genuine observation provenance.

R17 references R15/R16 in E2E certification and in reversal semantics, but R17 does not directly consume R15 observations to create Offer authority. Conversely, R15 financial evidence must remain capturable even when the commercial authority is missing, invalid, revoked, or disputed.

The canonical correspondence for ordinary commercial execution is mediated through exact R8 execution identity and R19 complete commercial lineage.

### Core invariant

R17 authority and R15 evidence are parallel historical truths joined through the exact governed commercial execution path; neither manufactures the other.

- R17 Offer/Grant authority does not imply a particular provider financial amount.
- R15 financial observation does not prove that the charge was authorized under R17.
- Exact R8 execution plus R19 lineage establishes the correspondence where commercial execution is involved.
- A financially real unauthorized charge remains both financially real and unauthorized.

### Required fixture

1. O1/G1 authorizes exact commercial execution through provider/account A.
2. R8 execution E1 crosses the provider boundary.
3. R15 receives financial observation F1 for E1/A.
4. R19 lineage binds O1/G1/E1/F1.
5. F1 does not itself prove O1/G1 authority.
6. O1/G1 does not dictate F1's amount or raw value.
7. Provider reports an overcharge relative to O1; R15 preserves the overcharge exactly rather than clamping it to authorized terms.
8. R17 history remains O1/G1; the overcharge becomes financial/authority discrepancy for downstream reconciliation/remediation.
9. Observation F2 for different execution E2 cannot be attached to O1 merely because provider/account and customer match.
10. Later O2 does not rewrite F1 onto O2.
11. Revocation of G1 after valid E1 does not erase F1.
12. If E1 was never authorized, later creation of O2/G2 cannot retroactively legitimize F1's originating effect.
13. Reversal/refund execution receives its own R8/R15 history and does not delete original F1.
14. R16 interprets the evidence; R15 does not modify R17 authority.

### Exact-record negative control

No direct exact-record-binding strengthening is required here.

Apply the standing diagnostic:

> **Would F1 still need to exist, unchanged, if O1/G1 never existed or was invalid?**

Yes. If the provider actually charged money, R15 must preserve that observation regardless of whether R17 authority existed. Therefore F1 is not downstream state created by an R17 record; it is an independently true observation that composes with R17 through R8/R19.

Requiring every R15 observation to bind R17 directly would duplicate the more complete R19 lineage responsibility and could incorrectly make raw evidence capture depend on proving commercial authority first.

### Disposition

Clean mediated composition. No strengthening required.

---

## Batch C-29 adjudicated result

- `R19 → R11`: `CONSISTENT_CONSUMPTION` with required exact R19 lineage-disposition record binding strengthening.
- `R14 → R11`: `CONSISTENT_CONSUMPTION` with required exact R14 handoff/non-convergence record binding strengthening.
- `R17 → R15`: clean mediated `CONSISTENT_CONSUMPTION`; `CONSUMES` withheld; no strengthening.

No new `MISSING_REQUIRED_COMPOSITION` defect is added. The standing count remains four.

No new `UNRESOLVED_CROSS_NODE_GAP` is added. The standing count remains one.

C29 also establishes a negative boundary for the exact-record-binding rule: direct binding is required when a specific upstream authoritative record causally creates/routes/confirms/denies a downstream transition, but not merely because two independently true records compose through a canonical mediator.
