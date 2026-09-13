# Phase E Compound 04 — R6 × R18 × R20

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Implementation authority:** SUSPENDED

## 1. Scope

R6 owns verifier sufficiency and the exact Verification Result. R18 owns the exact frozen capability binding and its operation-specific eligibility. R20 owns the complete boundary-time authorization decision.

`AUTOMATION_READY` ≠ `BINDING_VALID` ≠ R20 `ALLOW`.

## 2. Governing prior results

- C02-01: R6 proof sufficiency and R18 binding lifecycle are separate predicates.
- C14-01: R20 consumes exact R6 readiness/fingerprint; policy-version compatibility remains a live strengthening.
- C21-01: R20 consumes the exact R18 operation-specific disposition; another binding or operation class cannot substitute.
- C32-01: R18 binds the exact R6 `verificationResultId`.
- C38-10: R20 may consume R6 authority through exact R18 mediation where deterministic traceability is preserved.
- R18 already contains the three-node timing fixture: R6 verifies B1, R18 validates B1, B1 changes before the actual boundary, and R20 must observe the changed state rather than reuse the earlier validation.

## 3. Affirmative control

For exact execution X and operation O1, R6 creates qualifying VR1. R18 freezes B1 with `verificationResultId=VR1`, then validates B1 for O1 as RV1. R20 consumes exact RV1/B1/VR1 as one predicate in the complete X/O1 boundary decision. If capability state changes before the boundary, the exact current predicate must be evaluated; another currently-ready binding cannot substitute. Historical VR1/B1/RV1 remain preserved.

## 4. Required compound tests

1. **Proof/lifecycle separation:** insufficient R6 proof cannot become usable because R18 lifecycle looks healthy; strong R6 proof cannot revive an R18-ineligible binding.
2. **No current-binding substitution:** X frozen to B1 cannot silently use healthy current B2 under the same logical capability key.
3. **Exact account identity:** same provider/different account does not satisfy B1 where account identity is material.
4. **Exact R6 result:** B1 frozen from VR1 remains attributable to VR1 when later VR2 exists.
5. **Policy change:** P1→P2 follows C14-01. Version difference alone proves neither incompatibility nor compatibility; materially stronger requirements require governed compatibility proof or re-verification.
6. **Boundary freshness:** R18 validation valid at T1 cannot be reused at T2 after B1 materially changes. This is already an explicit governing source fixture and should not be counted as newly discovered unless review finds a distinct timing race.
7. **Operation-specific validation:** a disposition for O1 cannot authorize O2.
8. **Execution-specific validation:** X2/B2 cannot consume an otherwise-valid validation record for X1/B1 merely because key/provider/account are similar.
9. **No R20 lifecycle reimplementation:** R20 consumes R18's exact disposition, including DEPRECATED handling, rather than deriving a stricter or looser rule from the raw lifecycle label.
10. **Restoration is not rebinding:** restored logical capability/current B2 may trigger reconsideration but cannot resume X unless exact B1 is validly restored/revalidated or a governed successor/rebinding path exists.
11. **Capability PASS is not final authority:** all capability predicates may pass while another R20 predicate fails; boundary result remains DENY.
12. **Concurrent same-key bindings:** B1/B2 may coexist for different executions; each boundary decision remains tied to its own exact verification/binding chain. Arbitrary-N schema proof remains Phase F/R18-A0/R20-A0.

## 5. Provisional disposition

**PASS at Phase-E specification/composition level, with no new Compound-04 strengthening presently identified, subject to C14-01 and adversarial review.**

Unlike Compounds 01–03, the governing source already contains the exact three-node T1→T2 freshness case and the specific-binding/specific-operation non-substitution controls. Those controls should be credited rather than renamed as new findings.

No new MRC, unresolved gap, ownership defect, or semantic contradiction is presently identified. The R17→R18 and R19→R18 MRCs constrain wider commercial scenarios; they do not by themselves block this generic capability compound.

## 6. Requested adversarial review

1. Is the existing R18×R20 / R6×R18×R20 T1→T2 fixture sufficient, or is there a materially different three-node timing race?
2. Do C21-01 and the exact R18 Validation Record/R20 boundary identity fully prevent specific-but-wrong execution or operation-class cross-application?
3. Are C32-01 + C38-10 sufficient for exact R6→R18→R20 mediation without adding a redundant direct `verificationResultId` to R20?
4. Does C14-01 fully govern policy changes after B1 freeze but before boundary validation?
5. Are restoration/rebinding cases fully covered, including same-provider/different-account and same-key/different-binding?
6. Are concurrent-binding coexistence semantics complete at specification level while arbitrary-N storage/cardinality properly remains Phase F?
7. Do any open Phase-C findings block this exact generic compound rather than only wider scenarios?
8. Find any three-node case where each pairwise seam is correct but the combined operation is still wrongly authorized or denied.

Do not force a new strengthening merely because earlier compounds found one.