# Phase E Compound 04 — R6 × R18 × R20 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R6 × R18 × R20`  
**Implementation authority:** SUSPENDED

## 1. Final result

**PASS at the Phase-E specification/composition level, with no new fixture-tier strengthening.**

This is the first Phase-E compound in the current run whose adversarial review found the governing corpus already contains the needed timing, identity, mediation, and lifecycle controls at the required specification level.

R6 owns verifier sufficiency and the exact Verification Result. R18 owns the exact frozen Capability Binding Snapshot plus operation-specific binding eligibility. R20 owns the complete boundary-time authorization decision.

`AUTOMATION_READY` ≠ `BINDING_VALID` ≠ R20 `ALLOW`.

## 2. Governing prior results

The compound remains subject to the already-adjudicated Phase-C controls:

- C02-01 — R6 proof sufficiency and R18 binding lifecycle are separate predicates.
- C14-01 — R20 consumes exact R6 readiness/fingerprint; **verification-policy compatibility remains a live Phase-C strengthening and is not closed by this compound certification.**
- C21-01 — R20 consumes the exact R18 operation-specific disposition; another binding or operation class cannot substitute.
- C32-01 — R18 binds the exact R6 `verificationResultId` in the Capability Binding Snapshot.
- C38-10 — R20 may consume R6 authority through exact R18 mediation where deterministic traceability is preserved; no redundant direct R20→R6 pointer is required.

The source-level R18/R20 compound already contains the T1→T2 stale-validation case and requires R20 to consume R18 atomically/serializably at the actual boundary. Therefore no additional timing strengthening is created here.

## 3. Canonical affirmative control

For exact execution X and operation O1:

1. R6 produces qualifying Verification Result `VR1` for the exact claim/scope under policy P1.
2. R18 freezes exact binding `B1` with `verificationResultId = VR1` and the exact provider/account/operation scope.
3. R18 creates an operation-specific validation result `RV1` for exact X/B1/O1.
4. R20 consumes exact RV1/B1/VR1 as one predicate in the complete X/O1 boundary decision.
5. If B1, its lifecycle, its account, its claim scope, or its governing verification requirements change before the actual boundary, the current exact predicate is evaluated; stale validation is not reused.
6. A currently-ready B2 cannot substitute for B1.
7. Historical VR1/B1/RV1 remain preserved even when later authority changes.
8. All capability predicates may pass while another R20 predicate independently forces DENY.

## 4. Timing and atomicity — already governed

The adversarial review specifically tested whether a narrower race exists between R20 reading the R18 disposition and committing the boundary decision.

No new gap was found.

R20's governing contract already requires atomic/serializable consumption of R18's exact disposition at the boundary. Together with the existing R6×R18×R20 T1→T2 fixture, this closes both:

- stale earlier validation reused after later binding/lifecycle change; and
- a check-then-act race inside the boundary decision itself.

This existing control is credited rather than renamed as a new Phase-E finding.

## 5. Exact mediation — no redundant direct pointer

C32-01 requires R18 to bind exact R6 `verificationResultId` into B1. C38-10 confirms R20 can consume the exact R18 binding/disposition through that deterministic mediation chain.

Therefore:

> **R20 does not need a second independent direct copy of `verificationResultId` merely to prove R6 traceability when exact R18 mediation already preserves it.**

Adding a redundant independently populated R20 copy would create unnecessary equality-drift risk without adding independent semantic authority.

## 6. Operation/execution-specific validation

The compound preserves both dimensions:

- a validation for operation class O1 cannot authorize O2;
- a validation for execution X1/B1 cannot authorize X2/B2 merely because capability key, provider, account, or claim resembles the first case.

R18's Validation Record already carries exact `executionId` plus binding/operation dimensions, and C21-01 already requires R20 to consume the exact operation-specific disposition.

No new strengthening is required for the one-binding case.

## 7. Test refinement — complete multi-binding set correspondence

Adversarial review identified one real extension to the existing execution-specific test, but not a new independent strengthening.

Some executions may legitimately require multiple simultaneous capability bindings, for example:

`X → {B_A, B_B, ...}`

The governing refinement is:

> **When one exact execution/boundary requires multiple simultaneous capability bindings, every consumed binding in the required set must independently trace to that same exact execution and its own exact R6 Verification Result / R18 validation chain. Individually valid bindings cannot be assembled into a mixed-execution set.**

Required negative fixture:

1. X requires capability bindings A and B.
2. `B1_A` is valid and correctly bound to X.
3. `B1_B` is independently valid but belongs to different execution X2.
4. A boundary decision for X must fail if it consumes `{B1_A, B1_B}` merely because each capability type has some valid binding.
5. The valid set for X must contain only bindings whose exact execution/operation correspondence matches X.
6. Same provider, account, capability family, logical key, or boundary batch does not make bindings interchangeable.
7. If X legitimately has several bindings, each retains its own exact Verification Result, binding identity, lifecycle disposition, and operation scope.
8. Arbitrary-N storage/cardinality proof remains Phase F / R18-A0 / R20-A0 work.

This is a scope extension of the already-governing exact execution-specific validation rule, structurally analogous to other exact-set correspondence fixtures in the corpus. It does **not** add a new Phase-E strengthening count.

## 8. Policy compatibility carry-forward

C14-01 remains explicitly open.

A policy-version change after B1 freeze is not automatically safe or unsafe merely because the version identifier differs. Continued eligibility requires the already-recorded governed compatibility rule: decision-critical equivalence must be explicitly established, or qualifying re-verification must occur.

This certification neither resolves nor supersedes C14-01. Compound 04 passes **subject to that live strengthening remaining in force for later remediation/implementation certification**.

## 9. Restoration, rebinding, and concurrency

The existing source is sufficient at specification level:

- restored logical capability/current B2 does not automatically resume X frozen to B1;
- same-provider/different-account is a different binding where account identity is material;
- current readiness cannot rewrite B1's exact historical R6 result;
- B1/B2 may coexist for different executions without substitution;
- specification-level coexistence is certified here, while arbitrary-N schema/cardinality proof remains Phase F/A0 work.

## 10. Open Phase-C findings

None of the four MRCs or C21-03 blocks this exact generic capability compound.

The two R18-related MRCs:

- `R17 → R18`
- `R19 → R18`

remain material for wider commercial capability-bound scenarios, but they do not invalidate the generic R6→R18→R20 capability mechanism tested here.

The remaining open findings likewise sit outside this exact triangle.

## 11. Final disposition

**R6 × R18 × R20: PASS WITH NO NEW FIXTURE-TIER STRENGTHENING.**

Canonical carry-forwards:

1. C14-01 verification-policy compatibility remains open/live and is not closed by this compound.
2. Execution-specific validation is refined for multi-binding cases: every member of the capability-binding set consumed for X must independently belong to the same exact X rather than being merely individually valid somewhere.

No new `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, semantic contradiction, or standalone fixture-tier strengthening is established.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.