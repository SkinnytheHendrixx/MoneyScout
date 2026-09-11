# WI-R6 — Canonical Capability Readiness and Verifier Strength

**Normalized node:** R6  
**Historical finding:** C1-F8  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS`  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

R6 recovery has begun from the confirmed adversarial-review record available in project context. The recoverable source is sufficient to preserve the normalized root, the canonical capability-readiness states, the strongest-applicable-verifier rule, the distinction between weak evidence and machine authority, the capital-owner gate, the principal compound boundaries, the requirement that automated verification itself consumes governed resources, and the DI-1 activation condition.

However, the exact original R6-M1 through R6-M8 migration labels/surface assignments, complete acceptance-fixture enumeration, complete audit-child numbering, and complete numbered closure-evidence list are not presently recoverable from the accessible source without invention. Under the fidelity-recovery discipline, those details are not being regenerated from the compressed register or inferred from neighboring nodes.

This artifact is therefore intentionally **not** a full recovered candidate yet.

## 1. Frozen root and mission

Historical finding **C1-F8 / MATERIAL** established that Money Scout could treat a weak or merely human-readable capability signal as if it proved stronger machine-executable readiness.

R6 exists to make capability readiness a canonical adjudicated claim whose state reflects the strongest applicable verifier actually satisfied.

> **Core rule:** weak evidence cannot manufacture stronger execution authority.

A capability being described, manually observed, or human-confirmed does not automatically mean an automated system is authorized and able to execute it.

## 2. Canonical capability-readiness states

The confirmed R6 state family is:

- `POLICY_UNKNOWN`
- `VERIFICATION_PENDING`
- `VERIFICATION_FAILED`
- `HUMAN_AUTHORITY_CONFIRMED`
- `AUTOMATION_READY`

These states are not interchangeable and must not be collapsed into a generic available/unavailable boolean.

### `POLICY_UNKNOWN`

The governing rule for what evidence/verification is required is not sufficiently known.

Unknown policy fails closed for any path that requires stronger machine authority.

### `VERIFICATION_PENDING`

The applicable verification has been identified but has not yet completed successfully.

Pending verification is not execution readiness.

### `VERIFICATION_FAILED`

The required verifier ran and did not establish the claimed capability/readiness.

Failure must not be overwritten by a weaker signal unless a governed re-verification path later succeeds.

### `HUMAN_AUTHORITY_CONFIRMED`

A human has validly confirmed an authority/capability that is genuinely human-authority scoped.

This state must not be silently upgraded to `AUTOMATION_READY` merely because the human can perform the task manually.

### `AUTOMATION_READY`

The exact automated capability claim has satisfied the strongest applicable verifier required by policy for that operation scope.

This is the only state in this family that represents verified machine-ready execution authority where automation is required.

## 3. Strongest-applicable-verifier rule

R6 requires the system to identify the strongest verifier applicable to the capability claim being made.

If the claim is "a human can do this," human confirmation may be sufficient if policy says so.

If the claim is "the autonomous system can safely execute this provider/API/operation," a human statement that the account exists is not enough when an automated verification path is required.

Likewise, a schema/configuration check is insufficient where real provider access or operation-specific verification is required.

> **Verifier strength must match claim strength.**

The implementation may support multiple verifier classes, but it may not let a weaker verifier satisfy a stronger claim merely because stronger verification is inconvenient, expensive, or temporarily unavailable.

## 4. Ambiguous human-vs-machine authority

Where it is ambiguous whether a capability is intended to be human-operated or automated, R6 defaults to the stronger unverified interpretation for consequential automation.

The system may not treat ambiguity as permission to select the easier human-verification path and then consume the result as machine authority.

A future explicit policy can distinguish human-only and automation scopes, but until then the strongest relevant path remains unverified.

## 5. Capital-owner gate remains separate

R6 does not replace owner/capital authority.

A capability can be technically `AUTOMATION_READY` and still lack authorization to spend capital, consume scarce resources, or perform the consequential action.

Likewise, capital authority cannot manufacture capability readiness.

> **Capability readiness and economic authority are parallel predicates.**

The capital-owner gate preserved by the prior architecture remains intact.

## 6. Canonical capability claim / verification record

R6 requires a durable canonical capability claim and adjudication record, or equivalent structure, sufficient to preserve:

- exact capability key / operation scope;
- intended human vs automation mode where applicable;
- governing verification policy/version;
- verifier type and verifier strength;
- verification result and evidence/provenance;
- canonical readiness state;
- provider/account identity where relevant to the claim;
- timestamps/version/expiry where policy requires re-verification;
- enough exact identity for R18 to later freeze the specific verified binding used by an execution.

The physical schema is not frozen here. The semantic distinction between claim, verifier, readiness state, and later exact execution binding is.

## 7. R6 vs R18 boundary

R6 answers:

> **Is this capability claim sufficiently verified?**

R18 later answers:

> **Which exact verified capability/provider/account binding did this execution depend on, and is that exact binding still eligible immediately before dispatch?**

R6 must therefore expose enough durable identity for R18 to bind the exact verified claim, but R6 must not take over R18's lifecycle-revalidation or exact frozen-binding responsibility.

A current `AUTOMATION_READY` capability claim is not itself a frozen per-execution binding.

## 8. R6 vs R20 boundary

R6 establishes the verified capability state.

R20 consumes capability truth at the exact consequential boundary together with lineage, evidence, resource, lifecycle, and other authority predicates.

R6 must not imply that a once-verified capability authorizes every future dispatch forever.

## 9. R6 vs R5 boundary

R6 verifier strength and R5 independent material-conclusion confirmation solve different problems.

A verifier proving that an API credential works does not independently confirm a material business/reasoning conclusion.

Likewise, an independent model reviewer cannot substitute for the technical verifier required to establish an automated capability claim.

## 10. R6 × R7 resource requirement

Automated capability verification is safety-required work, but it still consumes resources where the verifier requires provider calls, cash, entitlements, quota, concurrency, or other scarce capacity.

Such verification must consume R7 reservation authority.

A verifier cannot bypass R7 merely because the purpose of the call is to establish safety/readiness.

A local human attestation that does not trigger autonomous scarce-resource work does not require an R7 reservation merely to exist. If that attestation launches automated verification, the automated work is governed by R7.

## 11. DI-1 scope

DI-1 concerns capability identity under simultaneous multi-provider/multi-account execution.

R6 does **not** activate DI-1 generically merely by representing provider/account identity.

DI-1 activates when a concrete R6 implementation scope must distinguish simultaneous or substitutable provider/account identities such that capability identity could otherwise be confused across accounts/providers/assets.

The confirmed narrow activation condition from the broader recovery record is:

> DI-1 remains dormant unless simultaneous provider/account/Asset identity becomes part of the concrete execution scope.

If activated, the implementation must not treat one provider/account's verified readiness as proof of another's.

## 12. Confirmed acceptance semantics recoverable from source

### A. Unknown policy fails closed

Capability exists in configuration, but governing verifier policy is unknown.

Expected: `POLICY_UNKNOWN`; no machine-ready authority.

### B. Pending verification is not readiness

Verification job has been created or started but has not succeeded.

Expected: `VERIFICATION_PENDING`; automation cannot consume the capability as ready.

### C. Failed verifier cannot be laundered by weaker evidence

Strong automated verifier fails, while a weaker manual/config signal still looks positive.

Expected: `VERIFICATION_FAILED`; weaker evidence cannot promote the claim to `AUTOMATION_READY`.

### D. Human authority remains human authority

Human confirms they can perform the operation manually.

Expected: `HUMAN_AUTHORITY_CONFIRMED`; no silent upgrade to automation readiness.

### E. Automation-ready requires strongest applicable verifier

Exact automated capability claim satisfies the policy-required verifier.

Expected: `AUTOMATION_READY` for that exact claim/scope.

### F. Ambiguous mode defaults conservative

System cannot determine whether the downstream consumer requires human or machine execution.

Expected: strongest relevant automation path remains unverified rather than using human confirmation as a shortcut.

### G. Capital authority remains separate

Capability is `AUTOMATION_READY` but spend/owner authority is absent.

Expected: capability truth remains ready, but consequential action still cannot proceed solely from R6.

### H. Independent-review separation

Material conclusion is independently confirmed under R5, but automated capability verifier has not passed.

Expected: R5 does not repair R6; automation remains blocked.

### I. Exact-binding future composition

Capability claim is `AUTOMATION_READY`; execution later freezes a specific provider/account binding under R18.

Expected: R18 consumes the verified R6 claim rather than reconstructing readiness from mutable current configuration.

### J. Resource-governed verifier burst

Many automated capability checks become runnable concurrently.

Expected: R7 governs scarce verification executions; verification necessity does not create resource authority.

## 13. Design Inputs

Design Input registry reviewed through DI-2.

### DI-1 — Capability identity under multi-provider/multi-account execution

**Disposition:** REVIEWED / CONDITIONALLY DORMANT.

Generic R6 capability verification does not itself activate DI-1. A concrete scope activates DI-1 when simultaneous provider/account/Asset identity must be represented or when capability substitution across accounts/providers could occur.

If activated, verification must remain bound to exact provider/account identity; readiness from account A cannot silently substitute for account B.

### DI-2 — Outbound Payment Reversal Execution

**Disposition:** REVIEWED / NOT ACTIVATED.

R6 adds no refund/cancel/void/reversal execution capability.

## 14. Dependency classes recoverable from source

### START

R6 can begin independently once capability claims/verifier policies are identifiable. It does not require R7/R18/R20 global closure merely to define and locally test its own verification/readiness model.

### LOCAL CLOSURE

The recoverable R6 contract requires at minimum:

- canonical readiness state family implemented;
- strongest-applicable-verifier rule implemented;
- human-vs-automation distinction preserved;
- weak evidence cannot promote stronger claim;
- capital-owner gate preserved as separate predicate;
- canonical claim/verifier/readiness record implemented;
- every known R6 consumer migrated;
- automated verification work integrates with R7 where scarce resources are consumed;
- iterative semantic sibling sweep empty;
- independent material closure review.

The exact original R6-M1 through R6-M8 migration matrix, audit-child numbering, and complete closure-evidence enumeration remain unrecovered, so this section is insufficient to claim local closure or artifact fidelity.

### E2E CERTIFICATION

Recovered required compounds include:

- R6×R7;
- R6×R18;
- R6×R20;
- R6×R5 where verifier strength and material conclusion confirmation coexist;
- R6×R18×R20 for verified claim → exact frozen binding → exact boundary eligibility.

## 15. Semantic sibling sweep requirements recoverable from source

The final R6 sweep must search for semantic patterns that treat weak capability evidence as stronger readiness, including:

- booleans such as `available=true` being consumed as automated readiness without verifier provenance;
- human confirmation treated as machine authorization;
- configuration presence treated as provider/API verification;
- current provider availability treated as proof of the exact verified claim;
- code paths that bypass the strongest verifier because a weaker signal already passed;
- unknown/new capability types defaulting to ready;
- provider/account identity dropped before downstream execution binding;
- automated verifier calls occurring outside R7 resource governance where resources are scarce.

Every discovered defect must become durable migration work rather than being considered closed by the audit itself.

## 16. Explicit non-goals

R6 must not:

- define exact per-execution capability binding/lifecycle revalidation, which is R18;
- implement general consequential boundary fencing, which is R20;
- replace capital/economic authority, which remains separate;
- independently confirm material business conclusions, which is R5;
- create scarce-resource authority for verification, which is R7;
- infer readiness merely because a provider/account is configured;
- silently choose a weaker verifier because the strongest verifier is expensive or unavailable.

## 17. Source gap blocking full reconstruction

The following exact original R6 content remains unrecovered and blocks promotion to `RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION`:

1. the literal R6-M1 through R6-M8 migration labels and exact surface assignments;
2. the exact mandatory R6 audit name, classification vocabulary, and discovered-child numbering convention;
3. the complete original acceptance-fixture grouping/order and any concrete examples not captured above;
4. the complete numbered closure-evidence list;
5. the exact known migration/consumer matrix frozen during confirmation;
6. any rejected alternatives/amendments whose exact wording was frozen but is not represented in the recoverable source above.

These details must be recovered from the original WI-R6 adversarial-confirmation record rather than regenerated from the compressed v1.0 register or current code.

## 18. Recovery gate

R6 remains `FIDELITY_SOURCE_INCOMPLETE` until the source gap in §17 is closed.

Until then:

- do not call this the full R6 contract;
- do not ask for final fidelity verification;
- do not begin R7 recovery in the serialized recovery queue;
- do not derive implementation batches from this partial artifact;
- preserve the source gap as an owned recovery obligation.

> **A capability cannot become stronger merely because its strongest proof is missing, and a recovery artifact cannot become complete merely because its missing source is inconvenient.**
