# Amendment Package 01B — Graph / PAIM Review Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / CONTROLS OVER GRAPH-PAIM REFRESH CANDIDATE WHERE NARROWER  
**Target:** Amendment B — `RD-C-R19-R18`  
**Base graph/PAIM candidate commit:** `f8d306370b13726238762cd24e3c39c02faeb32a`  
**Base graph/PAIM candidate blob:** `34208e393263549c1216d2694d5f9f93b5bbab84`  
**AMENDMENT_B_MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay sharpens the justification for excluding R20 from Amendment B's direct semantic writer set.

It does not change:

- the five proposed B graph effects;
- the four-path candidate writer set;
- the negative direct-fan-out list;
- the G2 provisional disposition;
- the Candidate Consequential Surface result;
- the B PRE-BCT result.

## 2. B-GP-R1-01 — explicit A-versus-B R20 writer contrast

### Finding

The graph/PAIM candidate correctly concludes that Amendment B does not currently require an R20 authority-text write, but the rationale can be made more general and mechanically checkable by contrasting B with Amendment A.

### Corrected rationale

Amendment A required an R20 write because pre-A R20 authority did **not** contain a generic, unqualified commitment to the specific R17↔R18 relational-composition predicate.

Before A, R20 contained generic exact-authority, provider/account-consistency, and upstream-consumption rules, but no rule saying that independently valid R17 and R18 objects must describe the same historical commercial-execution authority path.

Therefore A introduced a genuinely new boundary predicate that R20 itself had to consume explicitly.

Amendment B is structurally different.

R20 already has a generic, unqualified commitment to consume the exact **complete R19 Commercial Authority Lineage Reference** and not reconstruct or substitute current lineage.

That pre-existing commitment is the same semantic basis on which F07-18 exists:

`exact complete R19 Lineage ↔ exact R20 Boundary Decision correspondence`

Amendment B changes what makes an R19 lineage **complete** by adding exact materially-consumed R18 binding identity/set as a required dimension.

It does not introduce a new category of upstream object or a new independent R20 boundary predicate outside R19's existing complete-lineage abstraction.

Therefore B falls within an already-existing generic R20 commitment:

> consume the exact complete R19 lineage as R19 canonically defines completeness.

### General writer rule

A consuming node requires a direct semantic-text write when an amendment introduces a new predicate/object relationship that the consumer does not already generically commit to consuming.

A consuming node does **not** require a direct semantic-text write merely because the canonical definition of an already-consumed abstraction becomes stricter or more complete, provided:

1. the consumer's commitment is generic and unqualified with respect to that abstraction;
2. the amendment does not contradict or narrow the consumer's existing semantics;
3. the changed completeness criterion is invalidated/rechecked at the existing correspondence boundary;
4. no new independent consumer-owned decision predicate is introduced.

Amendment B satisfies all four conditions.

## 3. Consequence for F07-18

Because R20 already consumes exact complete R19 lineage, B's change is represented through mandatory invalidation/recheck of F07-18 rather than an R20 authority rewrite.

F07-18 remains unconditional because the evidence basis of "complete lineage" necessarily changes whenever B lands.

This is not evidence that F07-18 closes.

## 4. Consequence for the writer set

The four-path candidate semantic writer set remains:

1. `docs/remediation-contracts/WI-R18.md`
2. `docs/remediation-contracts/WI-R19.md`
3. new immutable B graph-delta artifact
4. new immutable B landing/invalidation event artifact

`WI-R20.md` remains excluded.

If literal B wording later introduces an independent R20 predicate rather than merely refining R19 completeness, this correction becomes stale and R20 writer-set inclusion must be re-derived before MAY_LAND.

## 5. Consequence for negative fan-out

No change.

The current exclusion of direct B semantic edges to H2-E39, H2-E40, H2-E43, J-F04, J-F05, RET-R20, F07-03, F07-04, and F07-09 remains correct on current wording because B does not modify R20 policy/registry/enforcement semantics or the A composition predicate itself.

## 6. Disposition

`B_R20_DIRECT_WRITE_REQUIRED = NO`

`B_R20_EXCLUSION_RATIONALE = GENERIC_COMPLETE_R19_LINEAGE_COMMITMENT_ALREADY_EXISTS`

`F07_18_RECHECK = UNCONDITIONAL`

`B_GRAPH_EFFECT_COUNT = 5`

`B_DIRECT_SEMANTIC_WRITER_SET_COUNT = 4`

`AMENDMENT_B_MAY_LAND = NO`

`GENERAL_IMPLEMENTATION_AUTHORITY = SUSPENDED`
