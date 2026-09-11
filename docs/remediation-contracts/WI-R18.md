# WI-R18 — Preserve and Revalidate Exact Capability Bindings Before Consequential Dispatch

**Normalized node:** R18  
**Historical finding:** C4-F5  
**Severity:** MATERIAL  
**Status:** CONFIRMED / READY FOR REGISTER INCLUSION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Amendment provenance

This contract preserves the correction history rather than rewriting it away.

1. **v1.0 register freeze attempt:** R18 was incorrectly presented as already contract-confirmed and was assigned the fabricated historical citation `C5-F3`. That was a register-integrity failure, not a valid confirmation.
2. **First real R18 draft:** R18 was drafted from live repository evidence but still carried `C5-F3` as a provisional traceability hold. Adversarial review corrected the historical finding to the already-frozen `C4-F5` and identified two additional material corrections: restore the previously frozen DEPRECATED default semantics and remove full `R6 CLOSED` as a local-closure prerequisite.
3. **Amended draft:** the citation was corrected to `C4-F5`, DEPRECATED continuation semantics for already-frozen bindings were restored, and R6 was reduced from global local-closure dependency to an implementation-compatible interface dependency. A further adversarial pass required consistency in the lifecycle summary table, an explicit stronger-policy override fixture for DEPRECATED, and a mechanical local-closure bar requiring a real implemented/queryable R6 interface rather than confirmed contract text alone.
4. **Third draft:** those amendments were incorporated and the work item was confirmed.

The false `C5-F3` citation is not retained as alternate traceability. It exists only in this amendment history as evidence of the correction.

## 1. Frozen mission

R18 preserves the exact capability/provider/account binding under which an execution was planned or authorized, and determines whether that same binding remains eligible immediately before consequential dispatch after capability lifecycle or provider/account conditions may have changed.

**Core rule:**

> An execution authorized for capability binding B may dispatch only if that exact binding B remains eligible. A different currently-usable capability is not a substitute.

R18 is narrower than R20 and does not redefine R6.

- **R6:** Is this exact capability claim sufficiently verified?
- **R18:** Which exact verified capability binding did this execution depend on, and does that same binding remain eligible?
- **R20:** At this exact consequential boundary, after composing R18 with every other required authority predicate, may the action execute now?

## 2. Live defect shape

The current capability layer behaves as mutable current state. A logical capability key can be upserted with a current provider, access level, verification method, metadata, verification time, and expiry. A boolean-style `hasCapability(capabilityKey)` can therefore answer whether some current representation of that logical capability is usable, but not whether the exact provider/account/verification binding frozen for an earlier execution remains the same authority.

Builder execution likewise can persist a provider on a run while later ticks obtain the currently configured provider driver. Provider equality alone is insufficient if credentials/accounts can differ over time.

A correct R18 implementation must therefore distinguish a **logical capability class** from the **exact immutable capability binding** consumed by an execution.

## 3. Canonical failure scenario

At T0, logical capability K is verified as Provider A / Account A1 / verification V1 and execution X freezes that binding.

At T1, Account A1 is revoked or quarantined. Provider B / Account B1 becomes current and healthy for the same logical capability key.

At T2, X reaches dispatch.

A current-state check that merely asks whether K is usable would pass. R18 must block X because X was never bound to or authorized for B/B1.

If B/B1 should be used, it requires an explicitly authorized new binding and normally a successor/new execution path.

## 4. Capability key is not capability identity

A logical capability key is a capability class, not execution authority. An exact binding may include:

- capability key and exact claim;
- provider identity;
- provider account/tenant/organization/workspace identity;
- credential authority identity/class where safe to persist;
- access level;
- verification policy version;
- exact verification result/evidence reference;
- verification strength;
- verification and expiry times;
- capability lifecycle state/version;
- allowed operation class/scope;
- Asset/Bet scope where relevant;
- provenance and deterministic fingerprint.

**Invariant:** same capability key does not imply same capability binding.

## 5. Capability Binding Snapshot

R18 introduces an immutable **Capability Binding Snapshot** or equivalent authority object. The snapshot records what exact R6-confirmed capability authority was frozen for one execution.

Conceptual fields include:

`bindingId`, `capabilityKey`, `claim`, `provider`, `providerAccountIdentity`, `credentialAuthorityIdentity`, `verificationPolicyVersion`, `verificationResultId`, `verificationStrength`, `accessLevel`, `allowedOperationScope`, `boundAt`, `expiresAt`, `lifecycleVersion`, `provenance`, `fingerprint`.

The snapshot is historical identity, not perpetual validity.

## 6. R6 dependency and vocabulary

R18 may bind only R6 capability authority that is actually implemented and queryable for the exact claims R18 consumes.

The R6 result vocabulary R18 must be able to distinguish is:

- `AUTOMATION_READY`
- `HUMAN_AUTHORITY_CONFIRMED`
- `VERIFICATION_PENDING`
- `VERIFICATION_FAILED`
- `POLICY_UNKNOWN`

R18 must also have the provider/account/verification provenance necessary to preserve exact identity.

A confirmed R6 design document alone is insufficient. A placeholder enum alone is insufficient. A helper equivalent to `hasCapability() -> boolean` is insufficient because it collapses the canonical R6 states and does not prove exact binding identity.

## 7. Binding vs current projection

Current capability projections may exist for planning/UI, but execution X retains its immutable `bindingId = B1`.

At dispatch R18 revalidates B1. It must not query the logical capability key, discover current B2, and silently substitute B2.

> Revalidation may confirm or reject an existing binding. It may not replace the binding.

A true rebinding produces a new authority object and, where consequential, a new execution/successor path subject to ordinary R7/R8/R20 gates.

## 8. Predispatch validation outcomes

R18 should produce a durable result family equivalent to:

- `BINDING_VALID`
- `BINDING_EXPIRED`
- `BINDING_REVOKED`
- `BINDING_QUARANTINED`
- `BINDING_RETIRED`
- `BINDING_DEPRECATED_DISALLOWED`
- `BINDING_DEGRADED_INSUFFICIENT`
- `PROVIDER_ACCOUNT_MISMATCH`
- `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`
- `BINDING_IDENTITY_UNKNOWN`
- `BINDING_CONFLICT`
- `REVALIDATION_UNRESOLVED`

Only an explicitly eligible outcome may be consumed by R20 for consequential dispatch.

## 9. PRE-BOUNDARY / POST-BOUNDARY-BEFORE-ADOPTION / POST-EFFECT

### PRE-BOUNDARY

If the exact frozen binding is now invalid, do not dispatch. A healthier current provider does not matter.

### POST-BOUNDARY / PRE-ADOPTION

If the provider boundary has already been crossed under B1 and B1 later becomes invalid, R18 must not pretend dispatch did not occur. R8 preserves external truth. R18 preserves the historical fact that the operation used B1. R20 decides whether the result remains eligible for adoption.

### POST-EFFECT

A completed historical effect that was validly executed under B1 is not rewritten onto B2 or into “never authorized” merely because B1 is later retired/revoked. Future steps use current rules. Later evidence showing B1 was already invalid at dispatch is an authority-regression problem, not ordinary lifecycle change.

## 10. Lifecycle semantics

The previously frozen C4-F5 distinctions are preserved.

### QUARANTINED

Unsafe/disallowed for consequential execution pending explicit resolution.

- block new binding;
- block new consequential dispatch;
- never substitute another binding under the same execution;
- preserve R8 truth for already-dispatched operations;
- reconciliation/evidence-preservation may continue only where explicit policy permits and does not create a forbidden new consequential effect.

Default: hard fail closed.

### RETIRED

No longer eligible for new consequential use.

- block new dispatch and new bindings;
- preserve historical validity;
- already-dispatched exact executions may still require reconciliation through their originating provider/account where policy permits.

Retired reconciliation access does not revive new-dispatch authority.

### DEPRECATED

Still functional but no longer appropriate for new selection.

- **already-frozen bindings may normally continue by default** while migration/review debt is recorded;
- **new selection is disallowed by default**;
- an explicit stronger policy may further restrict continuation of already-frozen bindings.

Deprecation alone must not silently invalidate immutable planning.

### DEGRADED

Capability remains present but some claim/permission/reliability has weakened. Eligibility is claim-specific.

A provider may remain sufficient for read-only exact reconciliation while being insufficient for a new mutation. Unknown or insufficient claim state blocks the relevant consequential dispatch.

### Conservative lifecycle summary

- `QUARANTINED` -> block consequential dispatch.
- `RETIRED` -> block new dispatch; historical/reconciliation access only where explicitly permitted.
- `DEPRECATED` -> already-frozen bindings may continue by default with migration/review debt; new selection blocked by default; explicit stronger policy may restrict continuation.
- `DEGRADED` -> evaluate exact required claim; block if insufficient or unknown.
- `ACTIVE/AVAILABLE` -> still requires applicable R6 verification and exact identity match.

## 11. Provider/account identity

Provider name alone is insufficient where multiple credentials/accounts can exist over time.

R18 treats exact provider account/tenant identity as first-class wherever materially relevant. If account identity cannot be established, provider equality must not be treated as proof of binding equality.

State: `BINDING_IDENTITY_UNKNOWN` where unresolved identity ambiguity is consequential.

Credential rotation must distinguish:

1. same provider account/authority with new credential material;
2. different provider account/authority.

The first may preserve binding only where continuity is authoritatively proven. The second is rebinding.

Environment variable names, provider strings, or logical capability keys are not proof of authority continuity.

## 12. Verification-policy changes

If B1 was valid under R6 Policy V1 and the policy changes to V2 before dispatch, R18 must determine whether V1 remains valid for this execution or re-verification is required.

Unknown policy behavior yields `VERIFICATION_POLICY_CHANGED_RECHECK_REQUIRED`. No silent grandfathering. R6 owns the actual verification.

## 13. R6 / R7 / R8 / R11 / R14 / R20 boundaries

### R6 vs R18

R6 defines verifier sufficiency and current claim truth. R18 preserves and revalidates the exact bound claim.

`AUTOMATION_READY` and `BINDING_VALID` are not synonyms.

### R7 vs R18

Verified capability and reserved capacity are parallel prerequisites. A valid binding does not grant resource authority; a valid reservation does not revive a revoked binding.

### R8 vs R18

R18 owns predispatch binding eligibility. R8 owns external-boundary truth once dispatch may have happened. R18 cannot turn a post-boundary execution into a pre-boundary one or replay it through B2.

### R11 vs R18

R18 detects invalid binding. R11 owns corrective successor disposition. Capability failure may justify a successor, but does not authorize substitution in place. Any successor receives its own normal R7/R8/R20 gates.

### R14 vs R18

Runtime replacement transfers execution ownership, not capability authority. A successor runtime receives X/B1 and freshly revalidates B1 before any not-yet-crossed consequential boundary. It does not reconstruct current binding B2.

### R20 vs R18

R18 defines and evaluates capability-binding eligibility. R20 decides when that evaluation must occur and atomically/serializably consumes it as part of the complete boundary predicate set.

A valid R18 result is not itself final dispatch authorization.

## 14. Capability restoration and blocked executions

Current capability availability may trigger reconsideration. It does not authorize automatic resumption of all executions blocked on the same logical capability key.

Each blocked execution must establish whether the restored capability is the same admissible binding or whether a new binding/successor is required.

> Capability availability may trigger reconsideration. It does not itself authorize resumption of frozen executions.

A generic human statement that “access is restored” also cannot bridge an unresolved binding-identity gap.

## 15. Reconciliation exception

R18 must distinguish `NEW_MUTATION` from `READ_ONLY_EXACT_RECONCILIATION`.

A retired or otherwise ineligible-for-new-work provider may remain the only legitimate provider through which an already-dispatched exact execution can be reconciled. Such reconciliation must remain tied to the originating execution/provider/account and must not be treated as authority for a new mutation.

A workflow may therefore need to preserve:

- historical dispatch binding B1;
- separate current reconciliation-access authority BR.

Those must not be conflated.

## 16. Binding provenance and legacy handling

Binding provenance should distinguish:

- `FRESHLY_BOUND`
- `DETERMINISTICALLY_RECONSTRUCTED`
- `LEGACY_UNPROVEN`

Legacy executions that know only a capability key or provider string must not be reconstructed from current credentials/configuration. Where exact historical binding cannot be proven, use `LEGACY_CAPABILITY_BINDING_UNPROVEN` or equivalent fail-closed state.

## 17. Retries and continuation

A new retry attempt does not automatically inherit B1. At retry creation, policy determines whether B1 can be newly bound; at retry dispatch R18 revalidates that exact binding again.

If R8 proves the system is continuing/reconciling the same exact already-dispatched external execution, preserve original B1. Do not create a new binding that falsely implies a new dispatch occurred.

## 18. Capability Binding Validation Record

R18 should durably record validation equivalent to:

`bindingId`, `executionId`, `operationClass`, `validationPolicyVersion`, `boundProvider`, `boundAccount`, `observedProvider`, `observedAccount`, `lifecycleState`, `r6VerificationResult`, `decision`, `reason`, `checkedAt`, `provenance`.

Validation records are operation-specific. A Builder-dispatch validation cannot authorize QA dispatch; a reconciliation validation cannot authorize a new mutation.

R20 owns whether that validation is boundary-current enough to consume.

## 19. Provider substitution

Provider substitution is never a recovery primitive by default.

Provider A unavailable -> Provider B healthy does not permit in-place substitution because provider changes may alter cost semantics, entitlement pools, privacy/data handling, output semantics, provider-account authority, and reconciliation behavior.

Provider-family equivalence that materially affects substitution authority is subject to R5 unless reducible to authoritative deterministic facts. Even confirmed equivalence does not itself authorize substitution unless the governing execution contract permits it.

## 20. Design Inputs

### DI-1

R18 evaluates DI-1 scope-by-scope wherever simultaneous or historical provider/account plurality exists.

For Builder execution, if multiple OpenAI/Codex/provider accounts or bindings can exist simultaneously or historically, `DI-1 / BUILDER_EXECUTION` activates and must be consumed with exact provider/account identity and no cross-account substitution.

The existence of provider name without account identity is not enough to declare the scope safe. Activation in Builder does not consume QA, Release, Commercial Payment, or any unrelated DI-1 scope.

### DI-2

Reviewed. Not activated generically by R18. If capability recovery introduces autonomous refund/void/cancellation/reversal with monetary consequence, that execution activates DI-2 separately.

## 21. Known migrations

### R18-M1 — Versioned capability authority history

Replace single mutable capability history as sole authority with durable version/history sufficient to distinguish provider/account/verification V1 from V2. A current projection may remain.

### R18-M2 — Capability Binding Snapshot

Consequential executions reference exact immutable binding ID/fingerprint rather than only capability key/provider string.

### R18-M3 — Provider/account identity strengthening

Audit every provider driver and capability source for exact account/tenant identity where materially relevant. Fail closed when identity ambiguity is consequential and cannot be resolved.

### R18-M4 — Frozen Builder driver binding

Builder dispatch must prove the selected current driver corresponds exactly to the run's frozen binding. Provider-string equality alone is insufficient where account identity can vary.

### R18-M5 — Resume eligibility after capability restoration

Capability restoration may trigger reconsideration but cannot automatically resume old frozen executions without exact-binding validation or explicit successor/rebinding.

### R18-M6+ — Audit-discovered children

Every concrete defect discovered in the required audits becomes an explicit durable migration child. Audit completion is not defect closure.

## 22. Mandatory audits

### R18-A0 — Capability authority representability audit

Before behavioral certification, determine whether the capability schema can simultaneously/historically represent:

- V1 and V2 authority;
- Provider A and B;
- Account A1 and A2;
- old and new verification results;
- retirement/quarantine/deprecation/degradation without erasing prior history.

Classify surfaces as:

`HISTORY_SUPPORTED`, `CURRENT_PROJECTION_WITH_HISTORY`, `SINGLE_MUTABLE_ROW_ONLY`, `PROVIDER_ACCOUNT_COLLAPSE`, `VERIFICATION_HISTORY_UNPROVEN`, `DEFECT_DISCOVERED`.

Any representation collapse becomes named migration work.

### R18-A1 — Capability Binding Consumer Audit

Audit at minimum:

- Builder Gateway;
- QA;
- Release preview;
- Release production;
- research providers;
- validation providers;
- experiment execution;
- commercial payment/provider adapters;
- repository mutation/provisioning;
- consequential telemetry;
- remediation workers;
- reconciliation workers.

Classify each:

`EXACT_BINDING_FROZEN`, `CAPABILITY_KEY_ONLY`, `PROVIDER_ONLY`, `CURRENT_PROVIDER_LOOKUP`, `ACCOUNT_IDENTITY_MISSING`, `LIFECYCLE_NOT_REVALIDATED`, `CURRENT_CAPABILITY_SUBSTITUTION`, `RECONCILIATION_ONLY_VALID`, `DEFECT_DISCOVERED`.

Audit != repair.

## 23. Acceptance fixtures

A. Identical binding remains eligible -> PASS capability predicate.

B. Binding expires before dispatch -> BLOCK.

C. Binding quarantined -> BLOCK new dispatch; no substitution.

D. Binding retired -> BLOCK new dispatch; preserve historical identity.

E. Deprecated already-frozen binding with no stronger contrary policy -> may continue; migration/review debt recorded.

F. Deprecated binding proposed for new execution -> new selection rejected/redirected according to selection policy.

G. **Deprecated existing binding with explicit stronger restriction:** an explicit policy can prohibit continuation after its effective boundary; R18 blocks at/after that point, preserves historical binding, records that the restriction arose from explicit policy rather than deprecation alone, and routes successor/rebinding through R11.

H. Degraded but still sufficient for exact required claim -> PASS capability predicate if R6 confirms claim.

I. Degraded below required claim -> BLOCK.

J. Same logical key, different provider -> BLOCK.

K. Same provider, different account -> BLOCK where account plurality exists.

L. Credential rotation with authoritatively proven same-account continuity -> may preserve binding under policy.

M. Credential rotation with account continuity unknown -> `BINDING_IDENTITY_UNKNOWN` / BLOCK.

N. R6 policy strengthened after binding -> no silent grandfathering; policy/reverification required.

O. Capability restoration supplies B2 after B1 failure -> B1 execution does not auto-resume unless B2 is proven the same admissible binding or a successor/new binding is created.

P. Provider unavailable, alternate provider healthy -> no substitution.

Q. Postdispatch revocation -> R8 preserves execution truth; no redispatch; R20 governs adoption.

R. Retired provider exact read-only reconciliation explicitly allowed -> reconciliation of existing run allowed; no new mutation authority.

S. Runtime handoff -> successor runtime preserves X/B1 and freshly revalidates B1; no current-state rebinding.

T. Retry -> attempt 2 does not inherit B1 blindly.

U. Historical operation valid under B1 then B1 retired -> history remains valid.

V. Legacy provider-only execution with materially required account identity missing -> `LEGACY_CAPABILITY_BINDING_UNPROVEN`.

W. Current capability projection overwritten from V1 A/A1 to V2 A/A2 -> V1 remains inspectable and X still resolves to V1.

## 24. Compound certifications

### R6 × R18

R6 verifies B1 `AUTOMATION_READY`; execution freezes B1; B1 later becomes failed/insufficient while current B2 is healthy. R18 blocks X and does not substitute B2.

### R7 × R18

Valid capability does not authorize missing resource reservation; valid reservation does not revive invalid capability binding.

### R8 × R18

B1 valid at dispatch, external boundary crossed, local ownership lost, B1 later unavailable. R8 reconciles exact external truth where possible. R18 does not authorize replay through current B2.

### R14 × R18

Execution X/B1 transfers runtime ownership. Current capability projection changes during handoff. Successor runtime retains and revalidates B1.

### R18 × R20

R18 evaluates B1 valid at T1. B1 becomes quarantined before actual dispatch T2. If R20 consumes stale T1 validation the test fails. Correct behavior requires boundary-current capability truth and blocks dispatch.

### R6 × R18 × R20

R6 verifies B1, R18 confirms B1, then capability/provider/account lifecycle changes at the boundary. R20 must observe invalid current state; no “checked milliseconds ago” shortcut.

## 25. Parallel-not-merged boundaries

- **R18 vs R6:** frozen-binding lifecycle validity vs verifier sufficiency/readiness definition.
- **R18 vs R7:** capability identity/eligibility vs scarce-resource reservation.
- **R18 vs R8:** predispatch capability authority vs external execution truth/reconciliation.
- **R18 vs R11:** detection of invalid binding vs corrective successor ownership.
- **R18 vs R14:** capability authority identity vs runtime ownership transfer.
- **R18 vs R20:** capability-specific revalidation semantics vs universal boundary-time fencing/final authorization.
- **R18 vs provider selection/planning:** validate existing binding vs choose new provider.

## 26. Vocabulary checkpoints

- R6 `AUTOMATION_READY` = sufficiently verified capability claim.
- R18 `BINDING_VALID` = exact bound capability remains eligible.
- R8 `SUCCEEDED` = external execution outcome.
- R20 `CURRENTLY_ELIGIBLE` = complete boundary predicate passes.
- R14 `AUTHORITATIVE_ACTIVE` = runtime execution ownership.

None of these states substitutes for another.

## 27. Non-goals

R18 does not:

- define R6 verifier strength;
- reserve money/quota under R7;
- decide whether provider execution occurred under R8;
- select replacement providers;
- silently rebind executions;
- own corrective successors under R11;
- define runtime handoff under R14;
- provide final universal boundary authorization under R20;
- treat logical capability key as provider/account identity;
- treat current capability availability as historical authority;
- rewrite old operations onto new bindings.

## 28. Three dependency graphs

### START

R18 may begin once R6 semantic contract/interface is frozen enough to implement against. R18-A0 representability work and consumer inventory can proceed in parallel. R7/R8 need not be globally closed merely to start R18.

### LOCAL CLOSURE

R18 does **not** require global R6 closure.

For every R6 capability claim R18 binds, local closure requires:

1. the actual R6 implementation exists;
2. its canonical verification-result state is persisted/queryable;
3. exact provider/account identity and verification provenance required by R18 are available;
4. R18 can distinguish the canonical R6 result vocabulary instead of collapsing it to boolean usability;
5. the implemented interface is compatibility-proven against the frozen R6 contract for those exact claims.

A confirmed R6 design document alone is insufficient. A placeholder primitive alone is insufficient. A boolean `hasCapability()`-style helper alone is insufficient.

### E2E CERTIFICATION

Requires, at minimum:

- R6×R18;
- R7×R18;
- R8×R18;
- R14×R18;
- R18×R20;
- R6×R18×R20;
- applicable DI-1 provider/account scenarios.

This preserves the three-graph distinction and avoids an accidental R6->R7->R8->R18 waterfall.

## 29. Closure evidence

`WI-R18 = CLOSED` requires:

1. historical traceability to `C4-F5` preserved;
2. implementation SHA;
3. schema/migration SHA;
4. Capability Binding Snapshot primitive PASS;
5. capability authority history/representability PASS;
6. exact provider identity PASS;
7. exact account/tenant identity PASS wherever material;
8. implemented/queryable R6 interface compatibility PASS;
9. lifecycle-state policies PASS;
10. QUARANTINED behavior PASS;
11. RETIRED behavior PASS;
12. DEPRECATED default continuation/new-selection behavior PASS;
13. explicit stronger DEPRECATED override behavior PASS;
14. DEGRADED claim-specific behavior PASS;
15. R18-M1 through M5 PASS;
16. R18-A0 complete and all A0 defects repaired;
17. R18-A1 complete and all M6+ defects repaired;
18. no current-provider substitution PASS;
19. no same-provider/different-account substitution PASS where applicable;
20. capability restoration does not auto-authorize old execution PASS;
21. runtime handoff binding preservation PASS;
22. retry binding behavior PASS;
23. reconciliation exception scoped correctly PASS;
24. legacy binding handling PASS;
25. R6×R18 PASS;
26. R7×R18 PASS;
27. R8×R18 PASS;
28. R14×R18 PASS;
29. R18×R20 PASS;
30. R6×R18×R20 PASS;
31. DI-1 decision independently recorded for each audited execution scope;
32. every activated DI-1 scope consumed;
33. unrelated DI-1 scopes remain independently unchanged unless separately activated;
34. DI-2 decision recorded;
35. sibling sweep empty;
36. materially independent cross-model/provider confirmation.

## 30. Anti-cheat standard

The easiest false implementation is:

1. store `capabilityKey` on execution;
2. call a boolean current-state capability check before dispatch;
3. declare R18 solved.

That fails this contract.

> A capability revalidation system that can pass after silently replacing the execution's frozen provider/account binding is not a revalidation system. It is an unauthorized rebinding system.

And the final R18/R20 boundary is:

> R18 tells R20 whether the exact frozen capability binding remains valid. R20 decides whether that fact is boundary-current, correctly fenced, and sufficient together with every other required authority predicate to cross the boundary now.
