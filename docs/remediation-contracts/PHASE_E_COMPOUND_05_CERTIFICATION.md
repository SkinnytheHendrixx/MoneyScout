# Phase E Compound 05 — R3 × R20 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R3 × R20`  
**Implementation authority:** SUSPENDED

## 1. Final result

**PASS at the Phase-E specification/composition level, with three new fixture-tier strengthenings. No new primary cross-node defect.**

R3 owns temporal adequacy of exact evidence for an exact decision use under an exact freshness policy. R20 owns when that predicate must be current enough at a consequential boundary and whether the complete boundary predicate set permits progression.

The compound preserves the governing split:

- R3 does not grant final consequential authority;
- R20 does not become a second freshness engine;
- freshness may change while immutable evidence history remains unchanged;
- current applicability never authorizes evidence/lineage identity substitution.

All governing Phase-C results remain live, especially C05-01 and C39-09.

## 2. Strengthening A — exact freshness-result decision-use / policy-version correspondence

The recovered R3 contract establishes that freshness is policy- and decision-use-specific, but it does not explicitly freeze a machine-checkable result identity binding sufficient for R20 to prove that the result it consumes was evaluated for the exact proposition/policy required by this boundary.

> **Every R3 freshness/current-applicability result consumed by R20 must be durably bound to the exact evidence identity, exact decision-use proposition, exact freshness policy identity/version, temporal basis, evaluation time, and result needed to prove what was actually evaluated. R20 must verify that this exact Q/P/version correspondence matches the predicate required by the current boundary before consuming it.**

Required fixture:

1. Evidence E1 exists with immutable temporal provenance.
2. R3 evaluates E1 for decision-use Q1 under policy P1 version V1 and emits FR1.
3. FR1 is valid for Q1/P1/V1.
4. A later R20 boundary requires materially different Q2 and/or P2/V2.
5. R20 must not consume FR1 merely because E1 is the same evidence object or because FR1 is a valid freshness result in some context.
6. If Q2/P2/V2 requires a new R3 evaluation, that exact result must be produced and consumed.
7. Historical FR1 remains attributable to Q1/P1/V1; it is not rewritten to the later context.
8. Policy category equality without exact applicable version identity is insufficient where decision-critical policy semantics can differ by version.

This is a fixture-tier representability/correspondence strengthening, not `MISSING_REQUIRED_COMPOSITION`: R3 and R20 already compose correctly and the normative answer is determinate.

## 3. Strengthening B — R3-internal completeness for multi-evidence propositions

R20's rule that every applicable boundary predicate must pass does not close the case where one single R3-owned proposition internally depends on several evidence members.

> **When one R3 freshness/current-applicability proposition genuinely requires a complete evidence set `{E1, E2, ...}`, R3's own evaluation must require every genuinely required member to independently satisfy the applicable temporal requirement. A favorable member cannot satisfy the proposition when another required member is stale, unknown, temporally unresolved, or otherwise inapplicable.**

Required fixture:

1. Current-condition proposition Q1 requires exact evidence members E1 and E2.
2. E1 is current-safe under the governing policy.
3. E2 is stale, unknown, or temporally unresolved under that same proposition's requirements.
4. R3 must not emit an affirmative current-safe result for Q1 merely because E1 passes.
5. R20 consumes only the resulting R3 proposition-level outcome; it does not inspect or repair R3's internal evidence completeness logic.
6. If policy makes one member optional or alternative rather than required, that must be explicit in the R3 evaluation contract rather than inferred from whichever member passes.
7. Historical evidence members remain preserved even when they fail current applicability.

This strengthening is distinct from prior cross-node set-completeness findings: the incompleteness risk is inside one R3-owned predicate, below R20's multi-predicate aggregation layer.

## 4. Strengthening C — no check-then-act gap for freshness at the actual boundary

Source verification confirms that R20 has strong generic boundary-time semantics for R3 but does **not** contain the R18-specific phrase that R20 `atomically/serializably consumes` the upstream disposition.

R20 does state:

- no consequential action may rely on authority merely because it was valid at an earlier checkpoint;
- exact predicates must be revalidated at the exact boundary where authority is consumed;
- immediately before crossing a consequential boundary, the exact current predicates required for that operation must be revalidated;
- for R3 specifically, evidence supporting the predicate must still be current enough for the boundary being crossed.

Those semantics determine the intended result, but the microscopic read→commit race is not separately executable/testable for the R3 seam.

> **A qualifying R3 freshness/current-applicability result must remain valid through the actual R20 authority-consumption / boundary-commit point. The implementation must use atomic/serializable consumption or an equivalent no-check-then-act mechanism sufficient to prevent a result that becomes invalid between read and crossing from authorizing the action.**

Required fixture:

1. At T1, R3 result FR1 qualifies for exact Q1/P1/V1.
2. R20 begins boundary validation for A1 using FR1.
3. Before the consequential boundary is actually committed/crossed at T2, authoritative temporal/policy state changes such that FR1 is no longer qualifying for that exact use.
4. A1 must not cross merely because FR1 was valid when first read.
5. The boundary either consumes FR1 under a serialization/validity mechanism that proves it remained qualifying through the commit point, or re-evaluates/rechecks before crossing.
6. Historical FR1 remains preserved as the result that was valid at T1.

This is fixture-tier enforcement precision for an already-determinate R20 boundary-time rule, not a new R20 semantic owner.

## 5. Confirmed clean cases

The remaining deliberate attacks are already governed at specification level:

- recent collection cannot rejuvenate stale source truth;
- unknown source timing remains unknown;
- historical validity does not imply current applicability;
- multi-Opportunity/consumer freshness results do not leak across distinct decision uses;
- policy changes may change freshness results without rewriting source temporal history;
- fresher/newer evidence cannot silently substitute for exact evidence required by another authority/lineage layer;
- same evidence family/type is not exact evidence identity;
- freshness PASS cannot override another failed R20 predicate;
- one boundary may legitimately combine historical propositions and current-condition propositions under different temporal standards.

## 6. Evidence identity and non-substitution

R20's governing rule remains:

> **Freshness revalidates the bound lineage. It never authorizes identity substitution.**

Therefore, if exact bound evidence E1 is stale while newer E2 exists, E2 may support a governed recomputation/successor path where another owning contract permits it, but R20 may not simply replace E1 with E2 inside the historical authority being evaluated.

## 7. Open Phase-C findings

None of the four `MISSING_REQUIRED_COMPOSITION` findings or C21-03 blocks this exact R3/R20 compound:

- `R17 → R18`
- `R5 → R20`
- `R19 → R14`
- `R19 → R18`
- `R11 → R8` / C21-03

They remain open for their owning wider scenarios.

## 8. Final disposition

**R3 × R20: PASS WITH THREE NEW FIXTURE-TIER STRENGTHENINGS.**

The three strengthenings are:

1. exact freshness-result binding to evidence + decision-use proposition + freshness policy identity/version + temporal provenance, with R20 correspondence checking;
2. R3-internal complete-member gating for multi-evidence-dependent propositions;
3. no check-then-act gap between consuming a qualifying R3 result and the actual R20 consequential boundary commit/crossing.

No new `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is established.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.