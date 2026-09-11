# WI-R6 — Make Capability Readiness Depend on the Strongest Applicable Verifier

**Normalized node:** R6

**Workstream:** A. Decision Truth & Lineage

**Historical finding:** C1-F8

**Severity:** MATERIAL

**Contract state:** CONFIRMED

**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION

**Implementation:** NOT STARTED

**Closed:** NO

## Recovery provenance

This artifact is reconstructed directly from the WI-R6 adversarial-confirmation conversation record, including its confirmation-round amendments. It is not reconstructed from the compressed v1.0 remediation register and is not a fresh re-derivation from current code.

The prior committed R6 artifact was explicitly left in `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS` state rather than guessed. This version supersedes that block. The recovered R6-M1 through R6-M8 migration matrix, R6-A1, the two amended state-model corrections (the human-attestation ambiguity default, and the `VERIFICATION_PENDING`/`pending_reason` normalization replacing an earlier inconsistent `VERIFYING`/`PENDING` naming), the R6×R7 side-effect symmetry rule with its local-write exception, and the 21-item closure-evidence list are recovered here from the actual confirmation exchange.

This file remains **not** **`FIDELITY_VERIFIED`** until an independent reviewer compares it against the original R6 confirmation exchange in full.

## 1. Frozen root and mission

Historical finding **C1-F8 / MATERIAL**: capability readiness is represented as `AVAILABLE + AUTOMATION_READY`, but the system does not have a canonical registry that determines the strongest verifier required for a particular capability/provider/action. Some paths can promote capability state through human attestation even when stronger machine/provider verification is applicable, while downstream consumers trust the resulting readiness state without inspecting how it was established.

> **Frozen mission statement:** R6 exists to make capability readiness a canonical adjudicated claim, select the strongest verifier applicable to that claim, and prevent weaker evidence from manufacturing stronger machine authority.

R6 does not decide whether a capability is currently lifecycle-eligible at dispatch, which is R18/R20 territory. It decides whether the claimed capability state was established by a verifier strong enough for the capability being claimed.

## 2. The live generic confirmation endpoint demonstrates the bypass

Money Scout already distinguishes Human Action verification modes: `AUTOMATED_CHECK`, `HUMAN_ATTESTATION`, `EXTERNAL_CALLBACK`. The Human Action resolution route correctly prevents a user from manually resolving an action whose specific contract requires `AUTOMATED_CHECK` or `EXTERNAL_CALLBACK` — those actions are moved to `VERIFYING` instead. That is a real existing safety property.

But capability readiness itself is weaker. The capability schema stores status, access level, a free-text `verificationMethod`, metadata, and verification/expiry timestamps. It has no typed verification-strength requirement, no verifier identity contract, and no durable relationship between a capability and the verifier required to establish `AUTOMATION_READY`. `setCapabilityAvailable()` defaults the capability directly to `status = AVAILABLE`, `accessLevel = AUTOMATION_READY`, and records whatever verification-method string the caller supplies. `capabilityIsUsable()` later checks only `AVAILABLE` + `AUTOMATION_READY` + not expired — it does not check whether the verification method was sufficiently strong for that capability.

The generic `POST /capabilities/:capabilityKey/confirm` endpoint accepts an arbitrary capability key, provider string, `attested: true`, and `access_ready_for_money_scout: true`, then calls `setCapabilityAvailable()` with `accessLevel: "AUTOMATION_READY"` and `verificationMethod: "HUMAN_ATTESTATION_OF_CONNECTED_ACCESS"`. This path does not consult the Human Action's `verificationMode`. It does not ask whether the capability requires an automated check or external callback. It does not choose among applicable verifiers.

**Concrete failure scenario:** Capability X actually requires automated/provider verification → Human Action route correctly refuses manual completion → generic capability confirm endpoint receives human attestation → Capability X becomes `AVAILABLE`/`AUTOMATION_READY` → open actions for X are resolved → resume jobs may be queued → downstream consumers now see a usable capability.

> **Invariant:** A weaker verifier may never establish a readiness state whose canonical policy requires a stronger applicable verifier.

## 3. Downstream consumers trust readiness, not verification provenance

`capabilityIsUsable()` checks status, access level, and expiration only. Factory's operational-capability loader similarly selects capabilities where `status = AVAILABLE` and `accessLevel = AUTOMATION_READY` — it does not inspect verification provenance before using them for capability selection.

That consumer architecture is correct **if and only if** the readiness state itself is trustworthy. R6 must therefore repair readiness adjudication centrally rather than forcing every consumer to interpret free-text `verificationMethod`. The desired pattern is: raw verification evidence → canonical verifier policy → canonical readiness state → downstream consumer trusts canonical state. Not: downstream consumer → parse verification strings → independently decide whether capability is safe.

## 4. "Strongest applicable" must be deterministic

R6 cannot be reduced to a ranking such as `AUTOMATED_CHECK > EXTERNAL_CALLBACK > HUMAN_ATTESTATION`. Different capabilities have different truth conditions:

- A capability meaning "Owner has authorized up to $X of capital" may genuinely require authenticated owner attestation because the fact being established is human authority, not provider connectivity.
- A capability meaning "Money Scout possesses working API access capable of performing operation Y" should generally require an actual automated/provider verification, not merely a human saying access exists.
- A capability meaning "External provider completed KYC/account approval" may require authoritative external callback/provider-state evidence.

The rule is not "always use the most automated verifier." The rule is: **for the capability claim being established, determine all verifier requirements that apply and require the strongest proof necessary to establish every decision-critical part of that claim.** That decision must come from a canonical policy/registry, not caller preference.

## 5. Claim semantics matter

R6 should not verify vague strings like "Stripe available." Capability readiness needs a claim precise enough to test: capability key → provider → claim type → required access level → allowed scope → required verifier policy → verification evidence → verification result → readiness state.

Examples of distinct claims: `ACCOUNT_EXISTS`, `AUTHENTICATED_ACCESS_EXISTS`, `AUTOMATION_CAN_READ`, `AUTOMATION_CAN_WRITE`, `AUTOMATION_CAN_PERFORM_OPERATION_X`, `OWNER_AUTHORITY_GRANTED`, `PROVIDER_CALLBACK_CONFIRMED`, `CREDENTIAL_SCOPE_VERIFIED`.

> **Invariant:** Proof strength and proof scope must be at least as strong and at least as specific as the capability state being granted.

## 6. Implementation primitive

R6 should introduce a canonical Capability Verification Policy Registry plus durable Verification Evidence/Result.

**Capability policy:** capability key/pattern → claim being established → applicable provider/role/scope → permitted verifier classes → minimum required verifier strength → required evidence fields → expiration/reverification rule → resulting maximum access level.

**Verification result:** exact capability identity → exact provider → verifier identity/type → verifier implementation/version → evidence/proof reference → verified claim → maximum access level justified → `verified_at` → `expires_at` → result PASS/FAIL/UNKNOWN → policy version.

The physical schema is open. The semantics are frozen.

## 7. Verifier-selection rule

When multiple verification paths are potentially available, the system must: identify the exact capability claim requested; load the applicable verification policy; determine all applicable verifier requirements; select or require the strongest applicable proof needed for that claim; execute/collect that proof; grant no stronger readiness state than the proof establishes.

An unclassified capability/verifier combination defaults fail closed: verification policy `UNKNOWN` → cannot establish `AUTOMATION_READY`.

> **Standing safe-default rule:** Unknown verifier sufficiency must never be interpreted as sufficient.

## 8. Human attestation policy

Human attestation remains valid where the thing being proved is genuinely human authority or a human-only fact. Known example: `AUTHORIZE_BET_CAPITAL_ALLOCATION` already receives special handling requiring an authenticated, allowlisted owner. R6 should preserve that.

But the important distinction is: **human attestation can establish human authority. It does not automatically establish working machine access.** For a capability requiring machine-operable access, an owner may attest "I completed the human step" without that alone proving "Money Scout can now successfully exercise the capability." A human action may therefore transition to "human prerequisite satisfied" while the capability remains in a pending machine-verification state until the canonical machine/provider verifier passes.

**Frozen ambiguity default (confirmed amendment):**

> If the capability claim cannot be deterministically classified as human-authority-only versus machine-access-required, the system must not fall back to human attestation. The claim remains unverified and must require the strongest applicable verifier until the claim class is explicitly resolved.
>
> Unknown claim class defaults to the stronger verification path, never the more permissive one.

This closes the exact loophole the audit exists to prevent: an unclassified capability could otherwise recreate today's defect under a different label.

## 9. Canonical readiness state model

**Frozen state-naming normalization (confirmed amendment):** the capability state model is normalized onto a single canonical set of five states, replacing an earlier inconsistent internal use of both "VERIFYING" and "PENDING" language for the same underlying condition.

- **`POLICY_UNKNOWN`** → fail closed. No applicable verifier policy exists for this capability/claim.
- **`VERIFICATION_PENDING`** → the prerequisite human or system step may be complete, but the capability has not yet satisfied the full canonical verifier contract required for the requested readiness level. Supporting metadata/substate distinguishes cause without requiring a second capability state:
  - `pending_reason = HUMAN_PREREQUISITE_COMPLETED_AWAITING_MACHINE_CHECK`
  - `pending_reason = VERIFIER_NOT_RUN`
  - `pending_reason = CALLBACK_OUTSTANDING`
  - `pending_reason = RESOURCE_BLOCKED`
- **`VERIFICATION_FAILED`** → proof attempted and insufficient.
- **`HUMAN_AUTHORITY_CONFIRMED`** → a human-only proposition established; does not imply machine operability.
- **`AUTOMATION_READY`** → the full required verifier contract satisfied.

We do not need a second capability state merely to distinguish why verification is pending; `pending_reason` metadata carries that distinction under the single `VERIFICATION_PENDING` state.

## 10. Exact known affected surfaces

| Surface Why it is in scope | |
| --- | --- |
| `lib/db/src/schema/human-actions.ts` | Capability schema lacks typed verifier policy/strength/proof scope. `verificationMethod` is free text and capability key is globally unique. |
| `artifacts/api-server/src/lib/human-gates.ts` | `setCapabilityAvailable()` can grant `AUTOMATION_READY`; `capabilityIsUsable()` trusts readiness without verifying provenance. |
| `artifacts/api-server/src/routes/human-actions.ts` — Human Action resolve route | Correctly enforces action-specific `AUTOMATED_CHECK`/`CALLBACK` in one path, but human-attested capability resolution still grants automation-ready where human mode applies. Must consume canonical policy rather than local mode alone. |
| Same file, generic `/capabilities/:capabilityKey/confirm` route | Confirmed bypass: arbitrary capability can become `AUTOMATION_READY` through human attestation without strongest-applicable verifier selection. |
| Same file, `resolveOpenActionsForCapability()` / resume flow | Newly "available" capability can resolve blockers and queue automatic successor work, making verifier strength consequential. |
| `artifacts/api-server/src/lib/asset-factory.ts` | Operational-capability selection trusts `AVAILABLE + AUTOMATION_READY` as canonical readiness. |
| Automated callers of `setCapabilityAvailable()` | Some callers may already establish strong proof, such as successful provider operations. They must register evidence through R6 rather than being weakened into the same untyped string model. Exact inventory belongs to R6-A1. |

The final row is intentionally an audit obligation, not a claimed defect.

## 11. Known migration matrix (R6-M1 through R6-M8)

### R6-M1 — Capability verification schema

Replace free-text-only proof semantics with structured verification policy/result identity sufficient to answer: what claim was proven, by what verifier, to what strength/scope, under which policy.

### R6-M2 — Capability readiness adjudicator

Centralize transitions to `AVAILABLE`/`AUTOMATION_READY`. No caller may directly grant this state without a canonical verification result sufficient for the requested access level.

### R6-M3 — Generic capability confirmation endpoint

Remove its ability to promote arbitrary capabilities to `AUTOMATION_READY` solely from human attestation. It must consult the registry. Possible outcomes: `HUMAN_AUTHORITY_CONFIRMED`, `VERIFICATION_PENDING`, `AUTOMATION_READY`, `VERIFICATION_FAILED`, `POLICY_UNKNOWN`.

### R6-M4 — Human Action resolution

Human Action `verificationMode` becomes an input to canonical verification, not an independent source of truth. If the human step satisfies only one prerequisite of a stronger verifier contract, the Human Action can resolve as human work complete while the capability remains `VERIFICATION_PENDING`.

### R6-M5 — Capability usability

`capabilityIsUsable()` should consume already-adjudicated canonical readiness and, where required, exact verification policy/version/fingerprint. It should not parse free-text verification methods.

### R6-M6 — Open-action resolution / automatic resume

A Human Action blocked on capability X may auto-resolve/resume only when the canonical required claim for X is actually established at sufficient strength. Weaker proof cannot unblock stronger required access.

### R6-M7 — Factory operational capability consumption

Factory should continue consuming canonical readiness, but tests must prove a weakly verified capability cannot appear in `availableOperationalCapabilities()` as usable automation-ready state.

### R6-M8 — Legacy capabilities

Existing `AVAILABLE`/`AUTOMATION_READY` records whose proof cannot be shown sufficient become `LEGACY_VERIFICATION_UNPROVEN` or equivalent non-usable state for future consequential use. They may be restored only by durable proof sufficient under R6, or fresh qualifying verification. They are not grandfathered merely because they were previously `AVAILABLE`.

## 12. Mandatory verifier/consumer audit (R6-A1)

**R6-A1 — Capability Verification Surface Audit.** Inventory every producer of capability state and every distinct capability claim.

At minimum inspect: `setCapabilityAvailable()` callers; Human Action resolution; generic capability confirmation; repository provisioning; Builder/provider connectivity; QA provider access; Release/deployment access; telemetry access; payment/commercial access; owner capital authority; credentials/domain/account access; any callback-driven capability; any capability consumers that assume `AUTOMATION_READY`.

Classify each producer: `STRONG_PROOF_ALREADY_PRESENT`, `HUMAN_AUTHORITY_ONLY`, `WEAK_PROOF_DEFECT`, `VERIFIER_REQUIREMENT_UNKNOWN`, `NOT_A_CAPABILITY_VERIFICATION`.

R6-A1 closes when every producer/claim has evidenced classification. **It does not repair defects.** Each `WEAK_PROOF_DEFECT` becomes **R6-M9+**. Each `VERIFIER_REQUIREMENT_UNKNOWN` must be adjudicated before the affected capability can be represented as automation-ready.

As established in R3: **`AUDITED` ≠ `DEFECT FOUND` ≠ `DEFECT FIXED`.**

## 13. Start dependencies

None. R6 can start immediately in parallel with R1–R5. It does not require R7, R18, or R20 to exist before verifier policy/readiness semantics can be implemented.

## 14. Local closure dependencies

R6 local closure requires: typed verification policy/result semantics; fail-closed unknown verifier policy; known M1–M8 complete; generic human-attestation bypass removed; Human Actions distinguish human prerequisite completion from machine capability readiness; R6-A1 complete; all M9+ defects closed; legacy weakly-proven readiness handled; final semantic sibling sweep returns empty.

R18/R20 need not close before R6.

## 15. End-to-end certification dependencies

**R6 × R7 — verified capability vs. resource authority.** R6 answers: is the claimed capability actually proven strongly enough to be used? R7 answers: is the resource/entitlement behind that use reserved and authorized now?

> Required invariant: a strongly verified provider capability creates no resource authority, and a valid reservation cannot make an unverified capability usable.

Concrete scenario: provider access is genuinely automation-ready → entitlement capacity is unavailable/exhausted → R7 blocks execution. Reverse: resource entitlement is available/reserved → capability was only human-attested where automated verification is required → R6 blocks capability use. Neither substitutes for the other.

**R6 × R18 — proof strength vs. capability lifecycle freshness.** R6 determines that capability X was validly established. R18 determines whether the pinned capability implementation/binding remains eligible before dispatch after lifecycle change.

> Required invariant: strong proof of a now-invalid capability does not restore lifecycle eligibility, and lifecycle eligibility does not prove usable access.

This is the parallel-not-merged relationship already anticipated during R2.

**R6 × R20 — verifier state at consequential boundaries.** A capability can be correctly verified at time T and later expire, be revoked, lose credentials, lose provider access, change scope, or otherwise cease satisfying the verification policy. R20 decides when consequential boundaries must revalidate the relevant R6 capability fence. R6 defines the verification truth/fingerprint. R20 defines when progression must reread it.

**R5 × R6 — independent reasoning confirmation vs. capability verification.** R5 and R6 both use the word "verification" colloquially but govern different claims. R5: did an independent reviewer confirm a material reasoning conclusion? R6: did sufficient proof establish a capability/access claim? A provider callback proving API access does not independently confirm an underwriting judgment. A second-model review does not prove API credentials work. They remain separate.

## 16. Safety-required verification work consumes R7

R5 established the broader rule: **safety-required secondary work is still work.** R6 consumes the same rule. If an automated verifier requires paid model/provider calls, scarce API entitlement, external transaction/test operation, limited account capacity, or another scarce resource, the verifier execution must consume R7 reservation authority. R6's requirement that stronger proof is necessary does not authorize the resources required to obtain that proof.

Multi-capability/outage recovery variant: many capabilities become due for re-verification at once → verifier jobs become runnable together → each must compete under R7 aggregate reservation. Correct safety verification must not become a resource bypass.

**Frozen R6×R7 side-effect symmetry rule (confirmed amendment):**

> Human attestation itself may be zero-cost, but any automatic work triggered by recording that attestation remains subject to the normal authority/resource rules.

That means: human attestation recorded → maybe capability prerequisite satisfied → maybe Human Action resolves → maybe resume becomes eligible — but any resulting confirmation email/API call, provider check, notification with external cost, queued research/validation, Builder/Release work, or other consequential resume execution must still pass the relevant R7 reservation and later authority fences.

> Recording human authority is not itself economic authority for whatever resumes afterward.

**Explicit exception:** this is composition with R7, not a merger of R6 and R7 semantics, and it should **not** be over-applied. A pure local database write that genuinely consumes no scarce resource should not be artificially forced through R7 merely because the general principle exists — the rule protects against real downstream resource consumption triggered by attestation, not against attestation itself.

## 17. Vocabulary compatibility checkpoints

**R5 ↔ R6:** freeze distinct terminology: decision confirmation vs. capability verification. If shared types are introduced, their semantic namespaces must still distinguish what proposition is being proved.

**R6 ↔ R7:** agree on capability; entitlement; resource availability; verification state; reserved capacity; usable. In particular: `AUTOMATION_READY` ≠ `ENTITLEMENT_RESERVED`.

**R6 ↔ R18:** agree on verification status; capability lifecycle status; implementation lifecycle; binding validity; reverification.

**R6 ↔ R20:** agree on verification fingerprint; `expires_at`; revocation; scope; capability fence.

## 18. Parallel-not-merged boundaries

- **R6 vs R5:** capability-proof sufficiency vs. independent reasoning confirmation.
- **R6 vs R7:** capability truth vs. economic/resource authorization.
- **R6 vs R18:** proof strength vs. lifecycle eligibility.
- **R6 vs R20:** verification semantics vs. boundary-time revalidation.
- **R6 vs DI-1:** R6 determines whether the exact claimed capability is strongly proven. DI-1 governs future scoping of capability identity across simultaneous provider/account/Asset dimensions. R6 must not silently implement that future identity expansion under the current single-scope architecture. This boundary matters because R6 touches the capability schema directly.

## 19. Design Inputs

Design Input registry reviewed through: **DI-2** / Convergence Protocol v1.1 registry snapshot.

**DI-1 — Capability identity under multi-provider/multi-account execution:** Reviewed: YES. Current status entering R6: DORMANT. Activation crossed by R6 as currently scoped: NO. Required action: NOT ACTIVATED. Evidence: R6 repairs verifier selection/strength for the existing capability identity model. It does not introduce simultaneous provider/account capability identities or generic cross-account substitution.

**Explicit non-consumption guard:** because R6 modifies capability schema/policy, this requires an explicit design guard: R6 may add verifier-policy identity fields, but must not claim DI-1 CONSUMED merely because capability rows become richer. If implementation proposes changing the unique capability identity from current key-level scope into provider/account/Asset-scoped simultaneous identities, DI-1 activates at the affected scope and R6 design freeze halts until the Design Input receives its required disposition.

**DI-2 — Outbound Payment Reversal Execution:** Reviewed: YES. Activation crossed: NO. Required action: NOT ACTIVATED. Evidence: R6 adds no refund/cancellation/void/reversal path.

If DI-3+ exists before design freeze, complete enumeration is mandatory.

## 20. Acceptance fixtures

**A. Human attestation cannot establish machine proof.** Capability policy requires automated verification. Call generic confirm endpoint with `attested=true`, `access_ready_for_money_scout=true`. Expected: human prerequisite may be recorded, but capability does not become `AUTOMATION_READY`.

**B. Human authority remains valid.** Capital-allocation authority requires authenticated owner attestation. Correct owner attestation can establish that human authority claim. R6 must not incorrectly require a provider connectivity test for a proposition only the owner can authorize.

**C. Automated proof.** Capability requires automated check. Verifier succeeds against exact required claim/scope. Expected: canonical verification PASS → readiness granted no higher than proven scope.

**D. External callback.** Capability policy requires provider callback. Human attestation alone fails. Authoritative callback succeeds. Expected: readiness may advance.

**E. Stronger claim than proof.** Proof establishes read access. Requested capability requires write access. Expected: not automation-ready for write.

**F. Policy unknown.** New capability appears with no registry policy. Expected: cannot become automation-ready. `UNKNOWN` must not default to human attestation.

**G. Generic bypass regression.** Create Human Action requiring `AUTOMATED_CHECK`. Attempt direct Human Action manual resolve: blocked. Then attempt generic `/capabilities/X/confirm` human attestation. Expected: still not automation-ready. This is the canonical C1-F8 regression test.

**H. Consumer behavior.** Weak/unproven capability cannot appear as usable in Factory. Strongly adjudicated capability can. Consumer does not independently parse verification strings.

**I. Expiry/revocation composition.** Capability was strongly verified. It later expires/revokes. R6 canonical state reflects loss of usability. R20 later owns exact boundary revalidation.

**J. R7 composition.** Strongly verified capability + unavailable entitlement: execution blocked by R7. Reserved entitlement + insufficient verification: execution blocked by R6.

**K. Legacy.** Existing automation-ready record with only free-text human attestation becomes legacy-unproven unless its evidence satisfies the new policy.

## 21. Semantic sibling sweep

After M1–M8 close, R6-A1 completes, and every M9+ closes, run the iterative semantic sibling sweep.

Search for: `status=AVAILABLE + AUTOMATION_READY` written directly; `setCapabilityAvailable()` called without canonical verification evidence; human attestation producing machine-operability state; free-text `verificationMethod` treated as authoritative; consumer-specific parsing of verification method; capability use based only on key existence/status; provider callbacks bypassing canonical readiness adjudication; verified capability automatically interpreted as economic entitlement; fallback from unknown verifier policy to attestation; same weak verification being used to establish a stronger access-level claim.

Any genuine instance becomes next M-number. Repeat until empty.

## 22. Explicit non-goals

R6 must not: require automated verification for genuine human authority; redefine R5 independent-confirmation policy; reserve provider/resource entitlement, which is R7; repair capability lifecycle transitions, which is R18; implement general consequential-boundary fencing, which is R20; consume DI-1 unless its actual activation condition occurs; prove an external service's business suitability merely because credentials work; treat successful authentication as proof of every provider operation; make each consumer choose its own verifier; interpret absence of a verifier policy as permission to use human attestation.

## 23. Closure evidence required

`WI-R6 = CLOSED` requires:

1. implementation SHA;
2. schema/migration SHA;
3. M1–M8 individually PASS;
4. complete R6-A1 producer/consumer audit;
5. all M9+ discovered migrations PASS;
6. before-fix fixture proving generic human attestation can produce `AUTOMATION_READY` independently of strongest-applicable verifier;
7. after-fix generic bypass regression fixture;
8. genuine human-authority fixture;
9. automated-check fixture;
10. external-callback fixture;
11. proof-scope/read-vs-write fixture;
12. unknown-policy fail-closed fixture;
13. Factory consumer fixture;
14. legacy-capability fixture;
15. R5↔R6 vocabulary compatibility PASS;
16. R6↔R7 compatibility PASS or `PENDING E2E`;
17. R6↔R18 compatibility PASS or `PENDING E2E`;
18. R6↔R20 compatibility PASS or `PENDING E2E`;
19. complete DI inventory/version evidence with explicit DI-1 non-consumption proof;
20. final iterative sibling sweep with zero new instances;
21. independent cross-model/provider confirmation that weaker proof cannot establish stronger capability readiness.

## 24. Dependency result

R6 is locally parallel: R6 may start now and may locally close without R7/R18/R20. Its important compositions are: R6 + R7 (proven capability + reserved resource authority); R6 + R18 (proof strength + lifecycle eligibility); R6 + R20 (canonical capability truth + boundary-time revalidation); R5 + R6 (independent decision confirmation + capability verification, explicitly separate propositions).

The live code gives us both the good pattern and the defect. Action-specific resolution already refuses to let human attestation bypass `AUTOMATED_CHECK` or `EXTERNAL_CALLBACK`, proving the architecture understands stronger verification modes. But the generic capability-confirmation path can still write an arbitrary capability directly to `AVAILABLE`/`AUTOMATION_READY` via human attestation, while consumers trust that readiness state.

So R6 is not "add more verification." It is: **make capability readiness a canonical adjudicated claim, select the strongest verifier applicable to that claim, and never let weaker evidence manufacture stronger machine authority.**

## 25. Fidelity-review checklist for this recovered artifact

Before changing this artifact to `FIDELITY_VERIFIED`, the reviewer must compare it line-by-line against the original R6 confirmation exchange and specifically verify:

- the exact R6-M1 through R6-M8 labels and scope assignments;
- the exact mission sentence in §1;
- the five-state model (`POLICY_UNKNOWN`/`VERIFICATION_PENDING`/`VERIFICATION_FAILED`/`HUMAN_AUTHORITY_CONFIRMED`/`AUTOMATION_READY`) and the `pending_reason` substates, confirming the earlier `VERIFYING`/`PENDING` inconsistency was correctly resolved by normalization rather than by adding a second state;
- the human-attestation ambiguity default ("unknown claim class defaults to the stronger verification path");
- R6-A1's five classifications and the M9+ numbering rule;
- the R6×R7 side-effect symmetry rule and its explicit local-database-write exception;
- R6×R18, R6×R20, R5×R6 compound/parallel boundaries;
- every acceptance fixture (A through K);
- the complete 21-item closure-evidence list;
- the DI-1 explicit non-consumption guard;
- that no content was imported from the compressed v1.0 matrix as if it were original authority;
- that no reconstructed wording narrows, expands, or infers beyond the confirmed root.

Until that review passes, this file remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.