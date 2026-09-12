# Phase C Batch C-12 — Cross-Node Contradiction / Consumption Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED

**Batch edges:**

1. `R3 → R4`
2. `R9 → R19`
3. `R16 → R20`

**Cumulative Phase C edge count after this batch:** 36 edges across 12 batches.

**Governing protocol:** Phase C Classification Protocol as amended through commit `53d433214098e1bb0236ef15eec42ca79eb6fff2`.

**Pinned endpoint blobs:**

- R3: `da0431cb43f0d84056938d7e93339965ba740bd7`
- R4: `907e44ccb1128dabb142164e713877596901c3f2`
- R9: `0ef14b00a1569ae649fe064aadecb498a2bc71e6`
- R16: `7dd92976f68ee90540771b3710e42b6d5b7f396f`
- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

No endpoint contract is amended by this batch. This batch records classification and durable audit strengthenings only.

---

## C12-01 — `R3 → R4`

### Endpoint source text

R3 states the semantic separation directly:

> R3 asks:
>
> Is this exact evidence temporally adequate for the decision use being attempted?
>
> R4 asks:
>
> Which exact Evaluation Cycle/decision lineage did this evidence and conclusion belong to?
>
> A fresh item attached to the wrong/current Evaluation Cycle is not valid lineage.
>
> A correctly bound historical item may still be stale for a new current-condition decision.
>
> The system must preserve both dimensions independently.

R3 also defines the compound:

> R3 × R4 × R20 ... prevents two independent laundering paths at once:
>
> 1. current-state freshness cannot be inferred from collection time or stale/unknown source timing;
> 2. evidence cannot be rebound from its originating Evaluation Cycle to whatever cycle is current at the moment of action.

R3's ownership split is explicit:

> R3 owns temporal adequacy; R4 owns exact Evaluation Cycle lineage. Neither repairs the other.

R4 reciprocally states:

> **R3 ↔ R4:** `evaluation cycle` ≠ `evidence freshness`. A new cycle may exist with stale evidence. An old cycle may preserve historically valid evidence that is no longer eligible for current authority.

And:

> **R4 vs R3:** R4 owns lineage identity. R3 owns temporal evidence applicability.

R4's lineage reference may preserve:

> decision/evidence snapshot identity

but its explicit non-goal is:

> decide whether evidence is fresh — that is R3;

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification gate kind:** operational / joint-fixture.

### Adjudication

`CONSUMES` is intentionally omitted. The contracts require both facts to coexist and be jointly respected, but the seam is primarily orthogonal composition rather than one node semantically consuming a canonical data/identity object owned by the other.

`COMPOSES` is justified because correct authority requires both exact evidence temporal adequacy and exact Evaluation Cycle lineage.

`PARALLEL_NOT_MERGED` and `OWNERSHIP_BOUNDARY` are load-bearing: freshness does not repair lineage, and lineage does not make stale evidence fresh.

`CERTIFICATION_DEPENDENCY` is operational/joint-fixture strength because R3 carries explicit R3×R4 and R3×R4×R20 acceptance behavior and R4 carries the same compound into downstream certification.

### Complete-source adversarial result: clean non-finding

The targeted challenge was whether R4 might freeze a policy-relative R3 freshness result as though it were immutable lineage truth.

Complete-source review supports the opposite. R4 freezes exact evidence/snapshot identity and historical decision lineage, while explicitly excluding freshness determination from its own scope. R3 independently permits freshness to be re-evaluated later under different decision policies without rewriting source temporal facts or historical lineage.

**No strengthening is required for C12-01.**

The durable interpretation is:

> R4 may freeze exact evidence identity, source/provenance identity, and the historical decision snapshot that existed under an Evaluation Cycle. It must not transform a policy-relative R3 freshness judgment into immutable evidence truth. R3 freshness remains independently re-evaluable for later consumers and policies.

This is already supported by the checked endpoint contracts and therefore is recorded as a non-finding rather than new normative scope.

### Invalidation

Any future endpoint change that makes R4 persist or treat a freshness verdict as immutable lineage truth, or makes R3 freshness depend on reconstruction of current Evaluation Cycle rather than preserved evidence identity, invalidates this clean result and requires re-review.

---

## C12-02 — `R9 → R19`

### Endpoint source text

R9 declares the hard chain:

> `R4 → R9 → R10 → R17 → R19 → R20`
>
> R9 contributes immutable source authority to that chain.

R9 requires exact downstream linkage:

> A Build Source Snapshot must therefore be linkable to the exact Build/Artifact identity consumed by R10.

And its closure semantics require:

> the R4→R9→R10→R17→R19→R20 hard chain remains intact;

R19's dedicated R9 boundary states:

> ## 5. R9 boundary — immutable build-source authority
>
> The Build segment of commercial lineage must originate from an immutable R9 Build Source Snapshot or equivalent exact source authority.
>
> A branch name, current repository HEAD, mutable tag, or reconstructed current state cannot be substituted for the actual source authority that produced the commercialized artifact.

R19's Commercial Authority Lineage Reference/fingerprint separately binds:

> - exact R9 Build Source Snapshot / Build identity;
> - exact R10 Artifact Version / production Release or deployment identity;

Its sibling sweep rejects:

> branch/current HEAD used instead of exact R9 source authority;

and closure requires:

> R9 exact source authority is preserved;

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `UNILATERAL_DECLARATION`

**Certification gate kind:** operational / integration.

### Adjudication

`CONSUMES` is justified because R19 directly consumes exact R9 source authority as an immutable segment of commercial lineage.

`HARD_CHAIN` is explicit in R9 and R19.

`COMPOSES` is load-bearing because commercial lineage must prove that R9 source authority and the downstream R10 Artifact Version belong to one exact historical build path.

`OWNERSHIP_BOUNDARY` preserves the division: R9 owns source authority; R19 owns composed commercial lineage. R19 may not reconstruct or strengthen R9 source truth from current repository state.

Topology is `UNILATERAL_DECLARATION`. R19 independently examines the R9→R19 seam in depth. R9 names R19 in the hard chain and E2E set, but does not independently specify the R19 commercial-lineage consumption semantics in equivalent depth.

### Complete-source finding: lighter-tier cross-object consistency gap

R9 already requires its Build Source Snapshot to be linkable to the exact Build/Artifact identity consumed by R10. This materially mitigates the risk and distinguishes this seam from C09-02 (`R17 → R18`), where no endpoint owned the cross-object composition at all.

However, R19's own Lineage Reference/fingerprint independently binds the R9 source identity and R10 artifact/release identity as separate fields. Therefore R19 construction could still, in principle, populate:

- R9 source snapshot `S1`; and
- R10 Artifact Version `P2`, where `P2` was actually produced from `S2`.

Each referenced object could be individually valid while the R19 composition is internally inconsistent.

This does **not** rise to `MISSING_REQUIRED_COMPOSITION` because R19's frozen mission explicitly owns proof that all individually valid authority segments belong to one exact historical path, and R9↔R10 already carries a direct source→artifact linkage obligation.

The gap is narrower: R19 needs an executable acceptance proof that its independently populated copies agree.

### Required strengthening — R9/R10 source-artifact consistency fixture inside R19

The durable acceptance requirement is:

> **When R19 composes an exact R9 Build Source Snapshot / Build identity and an exact R10 Artifact Version / production Release into one Commercial Authority Lineage Reference, it must verify that the R10 artifact was actually produced from the exact R9 source/build authority carried by that same lineage. Individually valid R9 and R10 identities are jointly insufficient when their historical source-artifact linkage does not match.**

Required fixture semantics:

1. create exact immutable R9 Build Source Snapshot `S1`;
2. create distinct exact immutable R9 Build Source Snapshot `S2`;
3. create R10 Artifact Version `P2` whose authoritative build/source lineage proves derivation from `S2`;
4. attempt to construct one R19 Commercial Authority Lineage Reference containing `S1 + P2`;
5. require construction/validation to fail closed because `P2` does not derive from `S1`;
6. prove that same branch, repository, Product, Asset, current HEAD, or current deployment cannot reconcile the mismatch;
7. prove R19 does not rewrite `S1 → S2` or `P2 → another artifact` merely to make the lineage coherent;
8. construct the matching `S2 + P2` case and prove that this specific cross-object predicate passes, subject to every other applicable R19 requirement;
9. prove any later successor source/artifact pair receives its own exact historical lineage rather than mutating the prior reference.

This fixture is a durable audit conclusion. It does not amend R9 or R19 endpoint blobs during Phase C.

### Invalidation

Any R9, R10, or R19 endpoint change affecting source→artifact linkage, Lineage Reference construction, source/build fingerprinting, or artifact derivation requires rechecking this fixture's applicability.

---

## C12-03 — `R16 → R20`

### Endpoint source text

R16's dedicated R20 boundary states:

> ## 19. R20 boundary — current eligibility versus historical financial truth
>
> R20 may later determine that an execution/result is no longer eligible for new adoption or action.
>
> That does not erase financial truth already incurred.
>
> Historical provider charges, corrections, reversals, and settlements remain part of canonical financial history even if the underlying authority is later revoked for future action.
>
> **Current ineligibility stops future authority; it does not erase past economic truth.**

R16's sibling sweep checks for:

> current R20 ineligibility erases already-incurred financial truth.

And its acceptance semantics require:

> R20 current ineligibility cannot erase historical incurred financial truth.

R20's complete top-level consumed-upstream list explicitly names R3, R4, R6, R7, R8, R9, R10, R14, R17, R18, R19, and R11. It does **not** name R15 or R16.

R20 nevertheless requires final certification with:

> commercial/financial composition with R15/R16 where adoption or headroom consequences depend on those truths.

R20's boundary examples include:

> - adoption of an external provider result;
> - release of reserved headroom;

and its R7 boundary says:

> R20 does not recreate R7 reservation arithmetic.

R16's own R7 boundary states:

> R7 owns reservation/admission and headroom authority. R16 supplies canonical financial truth R7 may consume when deciding whether reserved exposure can be settled or released.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `PARALLEL_NOT_MERGED`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `UNILATERAL_DECLARATION`

**Certification gate kind:** operational / integration.

`CONSUMES` is intentionally omitted.

### Complete-source adjudication: mediated architecture confirmed

Complete-source review resolves the ambiguity in favor of the mediated architecture:

`R16 canonical financial truth → R7 release/headroom authority → R20 boundary-time eligibility`

R20 does not directly consume or reinterpret R16 canonical financial-state or reconciliation-status semantics as a separate predicate family. R16 supplies canonical financial truth to R7; R7 decides reservation/headroom authority under its own rules; R20 then consumes whether the resulting R7 authority is still currently eligible at the consequential boundary.

This is coherent and avoids duplicating the R7↔R16 financial interpretation/release seam inside R20.

The architecture is currently inferable from endpoint structure, but the mediation is not stated as plainly as this corpus's authority-discipline requires. Leaving the rule only implicit could invite a future implementation to make R20 independently reinterpret R16 states such as `EXACT`, `PARTIAL`, `BOUNDED`, or `AWAITING_FINAL`, recreating a second financial-policy layer.

This is **not** `MISSING_REQUIRED_COMPOSITION`. The governing path exists. The required correction is to make the intended ownership path explicit.

### Required clarification — R16 financial truth reaches R20 through R7 authority

Durable clarification:

> **R20 does not independently consume or reinterpret R16 canonical financial-state or reconciliation-status semantics for reservation/headroom authority. Where financial truth affects whether reserved exposure may settle, release, or remain conservative, R16 supplies canonical financial truth to R7; R7 produces the governing reservation/headroom authority; R20 revalidates whether that exact R7 authority may still be consumed at the consequential boundary. R20 may preserve or reference R16 historical financial truth for provenance/adoption history, but it must not create a second financial-reconciliation or release policy from R16 states.**

Corollaries:

1. `EXACT`, `BOUNDED`, `PARTIAL`, `AWAITING_FINAL`, `CONFLICT`, or any other R16 reconciliation state does not by itself grant or deny R20 resource/headroom authority.
2. R7 remains the sole owner of reservation/headroom movement from R16 truth.
3. R20 remains the owner of current boundary eligibility for the exact R7 authority it consumes.
4. Current R20 ineligibility never erases already-incurred R16 financial truth.
5. If a future consequential boundary genuinely requires R16 as a direct non-R7 predicate, that new direct-consumption scope must be explicitly designed, registered, and independently reviewed rather than inferred from generic “financial composition” wording.

No behavioral fixture is required by this batch because the finding concerns ownership/mediation clarity rather than an already-identified ambiguous runtime branch. Future implementation tests should nevertheless prove that R20 does not independently reinterpret R16 release semantics.

### Topology rationale

Topology remains `UNILATERAL_DECLARATION` because R16 independently specifies the R20 semantic boundary, while R20 acknowledges R15/R16 only generically in final financial composition and does not contain a dedicated R16 boundary with equivalent semantic treatment.

### Invalidation

Any future R20 Boundary Registry change that introduces canonical R16 financial state as a direct predicate, or any R7/R16 change that moves release/headroom ownership, invalidates this clarification and requires full seam re-review.

---

# Batch C-12 final result

| Edge | Primary | Tags | Topology | Durable result |
|---|---|---|---|---|
| `R3 → R4` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | Clean non-finding; freshness remains independently re-evaluable, not frozen as lineage truth |
| `R9 → R19` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | Required lighter-tier R9/R10 source-artifact equality fixture inside R19 |
| `R16 → R20` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `OWNERSHIP_BOUNDARY`, `PARALLEL_NOT_MERGED`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | Required clarification that R16 financial truth reaches R20 resource/headroom authority through R7, not direct reinterpretation |

No edge in C-12 is upgraded to `MISSING_REQUIRED_COMPOSITION`.

`R17 → R18` remains the sole confirmed `MISSING_REQUIRED_COMPOSITION` after 36 classified edges.

---

## Phase C process notes carried forward

1. Primary classification, semantic tags, and corroboration topology remain independent dimensions.
2. `CERTIFICATION_DEPENDENCY` remains the current umbrella pending the already-recorded taxonomy split. Every use in this batch is operational/integration or operational/joint-fixture strength, not vocabulary-only compatibility.
3. A complete-source negative search can justify a gap, but absence must be calibrated against node mission and existing ownership. C12-02 is intentionally not inflated to C09-02 severity because R19 already owns exact-path composition and R9↔R10 already owns source→artifact linkage.
4. An intentionally mediated authority path should be stated explicitly rather than inferred indefinitely from omission. C12-03 records that rule without creating a second R16→R20 direct-consumption authority.
5. Endpoint changes invalidate classifications/fixtures only to the extent described in each edge's invalidation section. Topology must be re-evaluated when corroborating endpoint text changes materially.
6. No endpoint blob is edited by this batch. Phase C remains a classification/audit stage, not implementation.
