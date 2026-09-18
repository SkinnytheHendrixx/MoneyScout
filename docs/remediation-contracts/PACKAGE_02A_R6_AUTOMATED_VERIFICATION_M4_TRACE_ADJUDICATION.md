# Representation Package 02A — R6 Automated Verification M4 Trace Adjudication

**Status:** M4 TRACE ADJUDICATION / R6 SPLIT RESOLVED / CURRENT CANONICAL VERIFICATION IMPLEMENTATION ABSENT  
**Controlled by:** Package-02A dual-axis C1/C2 trace checklist  
**Implementation authority:** SUSPENDED

## 1. Question

How should R7-A1's named `R6 automated verification` category map into the Execution Authority Envelope inventory?

The trace must distinguish:

1. an execution that gathers/proves capability evidence;
2. the durable R6 Verification Result / readiness adjudication;
3. later R18/R20 lifecycle/current-eligibility consumption;
4. provider attempts whose successful result is reused as R6 proof.

These are not automatically separate consequential attempts.

## 2. Direct R6 contract result

Current canonical R6 states:

- capability readiness must be a canonical adjudicated claim;
- strongest applicable verifier must be selected deterministically;
- verification policy/result must be durable;
- downstream consumers may trust canonical readiness only if that adjudication is trustworthy;
- R6 determines proof sufficiency;
- R18 determines whether the pinned capability/binding remains lifecycle-eligible;
- R20 determines when the exact R6/R18 evidence must be reread at a consequential boundary;
- R6×R7 are separate propositions: strong capability proof creates no resource authority, and valid resource authority cannot make weak proof sufficient.

Therefore:

`R6_VERIFIER_EXECUTION != R6_VERIFICATION_RESULT != R18/R20_LATER_ELIGIBILITY`

## 3. Current implementation state

R6 header states:

`Implementation: NOT STARTED`

Current code demonstrates the historical defect rather than a compliant canonical verifier system.

### Current mutable readiness path

`human-gates.ts`:

- `setCapabilityAvailable()` writes `AVAILABLE + AUTOMATION_READY`;
- proof is represented by free-text `verificationMethod`;
- the row is mutable/current and keyed by unique capability key;
- `capabilityIsUsable()` trusts status/access/expiry without proving verifier strength.

### Generic human-attestation bypass

`routes/human-actions.ts`:

- action-specific `AUTOMATED_CHECK` and `EXTERNAL_CALLBACK` modes correctly reject manual completion;
- but generic capability confirmation can call `setCapabilityAvailable()` with:
  - `AUTOMATION_READY`;
  - `HUMAN_ATTESTATION_OF_CONNECTED_ACCESS`.

This is exactly the R6 defect.

### Current automated producer example

`asset-factory.ts` calls `setCapabilityAvailable()` after successful idempotent repository provisioning with:

`verificationMethod = SUCCESSFUL_IDEMPOTENT_REPOSITORY_PROVISION`.

That may be strong operational evidence for the relevant capability claim, but today it is still written into the same untyped readiness model.

Therefore:

`CURRENT_CANONICAL_R6_VERIFICATION_ATTEMPT_FAMILY = ABSENT`

and:

`CURRENT_R6_VERIFICATION_RESULT_OBJECT = ABSENT`

## 4. C1 classification of verifier executions

A verifier execution that itself consumes:

- provider/API capacity;
- quota;
- subscription/entitlement;
- concurrency;
- cash;
- other R7 scarce resources

is a C1 consequential attempt and requires one exact Execution Authority Envelope.

Examples may include:

- active provider connectivity check;
- credential-scope probe;
- callback verification requiring external provider interaction;
- machine-operability test;
- paid external verifier.

Therefore:

`R6_ACTIVE_VERIFIER_EXECUTION = M1_WHERE_C1_OR_C2`

A truly local deterministic verifier may be M3 only after:

`NON_SCARCE_PROVEN + NOT_C2`.

## 5. Existing consequential provider attempt reused as R6 proof

A key de-duplication case exists.

A provider operation may already be consequential for its own purpose and produce evidence sufficient for an R6 claim.

Example current pattern:

- repository provisioning provider action executes;
- operation succeeds;
- success is used as evidence that repository-provider access works;
- capability is promoted to readiness.

Correct future topology:

`E_provider_operation → exact provider truth/evidence → R6 Verification Result`

The same provider call must **not** receive:

- one envelope as repository-provision execution; and
- a second envelope merely because its result is also used as verification evidence.

Frozen rule:

`ONE_EXTERNAL_ATTEMPT = ONE_ENVELOPE_EVEN_IF_RESULT_SERVES_MULTIPLE_AUTHORITY_OBJECTS`

The R6 Verification Result references the existing exact execution envelope/evidence.

This is the R6-specific application of EAE-A7 duplicate-envelope prevention.

## 6. Dedicated verifier execution

If R6 intentionally launches a separate probe whose purpose is verification, that probe is its own attempt.

Example:

- prior provider action did not prove required write scope;
- R6 launches a dedicated safe machine-scope test;
- the test consumes provider capacity/quota.

That dedicated probe receives its own envelope because it is a genuinely distinct provider attempt.

The distinction is causal, not semantic-label based:

- reuse proof from one existing attempt → no duplicate envelope;
- execute another external verifier action → new envelope.

## 7. C2 classification of R6 Verification Result / readiness transition

The act of recording a valid R6 Verification Result or canonical readiness state is **not automatically a separate R20 C2 adoption boundary** under current recovered contracts.

R6 owns the verification truth/readiness claim.

R20 later determines whether that exact R6 evidence remains sufficient/current at the consequential boundary.

Current R20 states that an earlier `AUTOMATION_READY` result is not perpetual authority and may need rereading after:

- expiry;
- material policy change;
- credential/account revocation/replacement;
- access degradation;
- lifecycle ineligibility;
- exact binding conflict/unknown identity.

Therefore:

`R6_VERIFICATION_RESULT_RECORDING_C2 = NOT_ESTABLISHED`

and:

`R6_AUTOMATION_READY_STATE_SECOND_ENVELOPE = NOT_REQUIRED_BY_DEFAULT`

If the Boundary Registry later declares a specific readiness transition itself to be a consequential adoption boundary, that individual transition must be reclassified.

## 8. External-result observation/adoption test applied

For a provider-backed verifier, the layers are:

1. exact verifier/provider attempt — envelope where C1/C2;
2. provider/external execution truth/evidence — exact provenance;
3. R6 Verification Result — R6-owned claim adjudication;
4. current capability readiness projection — derived/current state;
5. later R18/R20 consumption — separate lifecycle/boundary check.

Steps 3 and 4 do not get extra envelopes merely because they derive authoritative readiness from exact evidence.

This differs from payment/repository adoption because those later steps mutate separately governed consequential financial/repository state covered by R20 adoption semantics.

## 9. Interaction with Package 02A R18 binding representation

The future immutable R18 Capability Binding Snapshot must reference the exact R6 Verification Result/provenance that justified the binding.

Where that R6 Verification Result is based on an external verifier/provider execution, it should be possible to trace:

`R18 Binding → R6 Verification Result → exact Execution Authority Envelope → exact provider truth`

without reconstructing from:

- current capability row;
- free-text verificationMethod;
- provider string;
- current credential state.

This gives F06-02 the stable R6 provenance target it requires.

## 10. Current readiness projection remains non-authoritative history

The existing `capabilities` table remains a mutable current projection.

Its:

- `UNIQUE(key)`;
- mutable provider/status/accessLevel;
- free-text verificationMethod;
- overwrite-on-conflict behavior

cannot serve as the durable R6 historical Verification Result.

A future canonical R6 result object and immutable R18 binding snapshot must remain separately addressable from current readiness projection.

## 11. Automatic resume / downstream consequence

Current capability promotion can:

- resolve open Human Actions;
- resume research/validation;
- expose capability to Factory operational selection.

Those successor actions may themselves become consequential.

But their consequence does not convert the R6 readiness-state write into the same execution envelope.

Rule:

> readiness adjudication may unlock later work; each later consequential attempt must obtain its own boundary/resource authority and envelope.

No “verified capability” envelope may be reused as execution authority for a later provider action.

## 12. Retry and reverification

A later reverification that executes another consequential provider probe gets a new envelope.

A pure local reread of an already-durable Verification Result does not.

A changed verification policy may require a new verifier execution, but the old verification remains historical evidence and must not be overwritten into the new result.

## 13. Attack fixtures

### R6E-A1 — weak human proof manufactured as machine readiness
Human attestation promotes machine-operable capability to AUTOMATION_READY.

Must fail canonical R6 adjudication.

### R6E-A2 — active verifier without envelope
Provider/API verifier consumes scarce resource but no exact envelope/R7 authority exists.

Must fail.

### R6E-A3 — duplicate envelope for reused provider proof
One repository-provision provider attempt is given E1 for provisioning and E2 because its success is reused as R6 verification evidence.

Must fail; R6 result references E1.

### R6E-A4 — dedicated verifier conflated with old attempt
A new provider probe is executed but recorded as if it were the historical provider attempt whose result was insufficient.

Must fail; new external execution = new envelope.

### R6E-A5 — current readiness substituted for historical proof
R18/R20 reconstruct exact R6 verification from current `capabilities` state/free-text method.

Must fail.

### R6E-A6 — stale readiness later consumed
Historical R6 verification remains true, but exact current eligibility no longer passes R18/R20.

Do not rewrite old R6 result; block/revalidate later consumption.

### R6E-A7 — verification grants execution authority
Capability becomes strongly verified and downstream provider execution proceeds without separate R7/R18/R20 authority.

Must fail.

### R6E-A8 — false C2 inflation
Recording an R6 Verification Result creates a second envelope despite no independently registered consequential adoption boundary.

Must not duplicate attempt identity.

## 14. Coverage-map update

Replace:

`R6_AUTOMATED_VERIFICATION = M4_NOT_YET_MAPPED`

with:

### Current state

`R6_CANONICAL_VERIFICATION_IMPLEMENTATION = ABSENT`

### Future verifier execution

`R6_VERIFIER_EXECUTION = M1_WHERE_C1_OR_C2 / M3_ONLY_IF_NON_SCARCE_PROVEN_AND_NOT_C2`

### Existing provider operation as proof

`EXISTING_M1_ATTEMPT_USED_AS_R6_PROOF = REFERENCE_EXISTING_ENVELOPE / NO_DUPLICATE_ENVELOPE`

### R6 authority object

`R6_VERIFICATION_RESULT = R6_AUTHORITY_OBJECT / NOT_AUTOMATIC_SECOND_ENVELOPE`

### Later use

`R18/R20_LATER_CONSUMPTION = SEPARATE_CURRENT_ELIGIBILITY`

## 15. R6-A1 relationship

This trace does not replace R6-A1.

R6-A1 must still inventory every producer/claim and classify it as:

- `STRONG_PROOF_ALREADY_PRESENT`;
- `HUMAN_AUTHORITY_ONLY`;
- `WEAK_PROOF_DEFECT`;
- `VERIFIER_REQUIREMENT_UNKNOWN`;
- `NOT_A_CAPABILITY_VERIFICATION`.

Package 02A only needs enough current/future attempt topology to ensure exact verifier executions can bind to envelopes without duplication.

## 16. Disposition

`R6_M4_TRACE = RESOLVED_AT_ATTEMPT_TOPOLOGY_LAYER`

`CURRENT_R6_CANONICAL_VERIFICATION_IMPLEMENTATION = ABSENT`

`R6_ACTIVE_VERIFIER_C1 = CONDITIONAL_ON_SCARCE_RESOURCE`

`R6_VERIFICATION_RESULT_C2 = NOT_ESTABLISHED_BY_CURRENT_CONTRACT`

`R6_VERIFICATION_RESULT_SECOND_ENVELOPE = NOT_REQUIRED_BY_DEFAULT`

`EXISTING_PROVIDER_ATTEMPT_REUSED_AS_R6_PROOF = NO_DUPLICATE_ENVELOPE`

`R18_REQUIRES_EXACT_R6_RESULT/PROVENANCE_REFERENCE = YES`

`R6_A1_REMAINS_INDEPENDENT_AUDIT_OBLIGATION = YES`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

`NEXT_M4_TRACE = WATCH_REVALIDATION`
