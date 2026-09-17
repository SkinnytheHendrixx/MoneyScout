# Money Scout — Integrated Remediation Register — Review Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL INTEGRATED REGISTER FREEZE  
**Applies to:** `GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_INTEGRATED_REVIEW_DRAFT.md`  
**Base integrated blob:** `1530518fe631ff8c169f5b81fe8f79cf8855e717`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the first full adversarial review of the cross-phase integrated remediation register and a targeted source-level re-verification of the shared-root/provider-cluster questions left open by that review.

Accepted corrections:

1. XPI-01 Boundary Registry chain gains H2-E43 validator-policy representation as an independent layer.
2. The apparent NAME-H2-E41 ↔ J-F01 cycle is explicitly adjudicated as no cycle.
3. New XPI-05 blocks the BOUNDARY_VALIDATION mechanical literal/sign-off on RD-C-R5-R20 until the phase's R5-consumption semantics are stable.
4. XPI-04 end-to-end provider-path closure is broadened to include downstream R19 and R20 provider/account predicates.
5. ROOT-2 `capabilities` receives explicit minimum direct implementation-evidence consumers discovered by source re-verification.
6. ROOT-3 provider-config clustering is scoped to the currently inspected commercial-payment bridge implementation rather than asserted as universal for every future provider architecture.
7. No additional mechanical-name shared root is pre-seeded without concrete physical evidence; PAIM-C remains responsible for deriving one when an implementation is selected.

No phase denominator changes. No existing primary finding is merged or removed.

## 2. Correction INT-R1-01 — XPI-01 becomes a five-layer Boundary Registry chain

### Prior problem

XPI-01 correctly separated:

- F02-02 / `REP-F02-02` — registry representation existence/resolution;
- H2-E39 — exact registry representation/form;
- NAME-H2-E41 — adopted mechanical boundary-class keys;
- J-F02 / `GOV-J-F02` — mandatory registration/re-registration enforcement.

It omitted H2-E43 — R20 validator-policy representation.

A registry may exist, have a governed representation, and use correct class keys while still lacking a representable versioned policy object that defines the required predicate content for each boundary class.

### Corrected chain

The dependency chain is:

`STABLE R20 BOUNDARY SEMANTICS`
→ `REP-F02-02 / F02-02 REGISTRY EXISTENCE-REPRESENTATION RESOLUTION`
→ `H2-E39 GOVERNED REGISTRY FORM/REPRESENTATION`
→ `H2-E43 GOVERNED VALIDATOR-POLICY REPRESENTATION`
→ `NAME-H2-E41 MECHANICAL BOUNDARY-CLASS KEY ADOPTION + JOINT SIGN-OFF`
→ `GOV-J-F02 REGISTRATION / RE-REGISTRATION ENFORCEMENT`

This is a five-layer chain of independently owned obligations.

### Closure prohibitions

- A registry existing does not prove its historical/current exact representation is governed.
- A registry representation existing does not prove validator-policy content is itself representable/versioned.
- A policy representation existing does not prove the adopted boundary-class key maps to the correct policy without alias/key collision.
- A key/policy mapping existing does not prove every consequential surface is required to register/re-register.
- J-F02 enforcement cannot close by enforcing registration against an incompletely defined policy model.

H2-E43 remains one Phase-H EXACTNESS-ONLY source gap; this correction adds dependency structure only.

## 3. Correction INT-R1-02 — NAME-H2-E41 does not depend on J-F01 taxonomy; no cycle

The integrated review raised whether NAME-H2-E41 must wait for J-F01, potentially creating a cycle.

Adjudication: **NO CYCLE.**

The objects differ:

- R20 recovered semantics define the existing boundary-class/consequence vocabulary that NAME-H2-E41 names and that the registry/policy representation consumes.
- J-F01 governs the forward engineering trigger requiring new/changed consequential code to be classified at all.

Therefore:

`R20 EXISTING BOUNDARY SEMANTIC TAXONOMY`
→ `NAME-H2-E41 / registry-key adoption`

and independently:

`GOV-J-F01`
→ `future new/changed surface classification trigger`

J-F01 may later classify a new surface into the governed vocabulary or escalate an unrepresentable class through J-F06. It does not create the existing vocabulary that NAME-H2-E41 needs in order to adopt current keys.

No reverse dependency from NAME-H2-E41 to J-F01 is introduced solely on this basis.

## 4. New interaction XPI-05 — R20 phase-literal naming can prematurely certify unresolved R5→R20 semantics

**Severity:** HIGH

### Interaction

RD-C-R5-R20 owns the unresolved semantic composition governing whether/how R20 consumes R5 confirmation at the exact consequential boundary, including freshness-at-boundary and exact confirmation/policy evidence.

R20's recovered three-phase model distinguishes:

- PREFLIGHT;
- BOUNDARY_VALIDATION;
- ADOPTION_VALIDATION.

NAME-H2-E42 is mechanical-by-default because those literals may act as policy/switch discriminators.

The R5→R20 unresolved rule affects the semantic content of the **BOUNDARY_VALIDATION** phase specifically: that phase is the exact moment at which consequential authority is consumed and the R5 confirmation/freshness rule must be known if applicable.

### Failure mode

If NAME-H2-E42 and the R20 representation owner jointly sign off the BOUNDARY_VALIDATION literal/selector before RD-C-R5-R20 is resolved, the mechanical phase representation could appear complete even though one of the phase's own governing predicate-composition rules remains unsettled.

That is the same general failure class as XPI-03: a mechanical discriminator can silently freeze an unresolved semantic branch.

### Required dependency

For the BOUNDARY_VALIDATION literal/mechanical mapping only:

`RD-C-R5-R20 SEMANTIC_PREREQUISITE`
→ `NAME-H2-E42 + R20 REPRESENTATION JOINT SIGN-OFF FOR BOUNDARY_VALIDATION`

PREFLIGHT and ADOPTION_VALIDATION literal adoption are not blocked solely by RD-C-R5-R20 unless later evidence shows they consume the same unresolved R5 rule.

### Closure rule

NAME-H2-E42 may design all three candidate literals in parallel, but it may not reach final mechanical joint-sign-off for BOUNDARY_VALIDATION until RD-C-R5-R20 is canonical and the literal maps to the completed semantic phase definition.

## 5. Source re-verification — ROOT-2 `capabilities`

Targeted source inspection confirmed:

### Physical representation

`lib/db/src/schema/human-actions.ts` defines `capabilities` with:

- `UNIQUE(key)` via `capabilities_key_unique`;
- provider;
- status;
- access level;
- verification method;
- metadata;
- verification/expiry/update timestamps.

### Mutation/read behavior

`artifacts/api-server/src/lib/human-gates.ts`:

- reads capability by exact logical `key`;
- `capabilityIsUsable()` evaluates the current row;
- `setCapabilityAvailable()` performs `INSERT ... ON CONFLICT(key) DO UPDATE` and overwrites provider/status/access/verification/metadata/timestamps;
- human-action creation can be bypassed when the current capability key is usable;
- open human actions are resolved by capability key.

### Commercial consumers

`commercial-activation-worker.ts` uses the same root for at least:

- `PAYMENT_MERCHANT_ACCESS:<provider>`;
- `PAYMENT_PRODUCTION_CREDENTIALS:<provider>`;
- `PAYMENT_PROVIDER_RUNTIME:<provider>`;
- merchant metadata including `merchantVerified` and `accountId`;
- production-credential readiness;
- automatic runtime capability creation via `setCapabilityAvailable()`.

### Builder consumer

`builder-gateway.ts` imports and calls `setCapabilityAvailable()` / human-gate capability handling for builder-provider capability paths.

### Corrected known consumer baseline

The integrated ROOT-2 normative/evidence list remains valid:

- F06-01/F06-02;
- AUX-F-R6-VERIFICATION;
- F07-01/F07-03/F07-04/F07-05/F07-06;
- IC-G2-01;
- H2-E05.

PAIM-C must additionally treat these current implementation surfaces as direct evidence consumers/physical mutation participants where the amendment touches them:

- `human-gates.ts` capability reads/upsert and capability-key human-action resolution;
- `commercial-activation-worker.ts` merchant/credential/runtime capability paths;
- `builder-gateway.ts` provider capability publication/blocking paths;
- `human_actions.required_capability_key` consumers where current capability state controls blocking/resume behavior.

This does **not** create new normative findings. It prevents PAIM-C from limiting the shared-root collision scan only to the abstract F/G/H rows.

### Completeness statement

This is a **minimum confirmed current-source set**, not a claim that no other capability consumer exists. The landing gate must still perform amendment-specific repository-wide PAIM-C expansion.

## 6. Source re-verification — XPI-04 downstream provider/account closure

The integrated XPI-04 provider-path bundle stopped at R17/F07-04/G2-01/H1-S09/name/exactness obligations.

Direct contract re-verification establishes downstream requirements:

### R19

R19 makes the exact provider and provider-account identity a first-class frozen lineage dimension. Provider/account substitution for historical lineage is prohibited.

Therefore a commercial provider path claiming complete lineage closure must also satisfy:

- REP-R19 applicable exact provider/account lineage predicates;
- F07-05/F07-08/F07-18 or other exact lineage-reference relationships as applicable to the path;
- exact binding/Offer/Grant/provider-account ancestry without current-state reconstruction.

### R20

R20 explicitly requires:

- revalidation of the exact bound lineage;
- no substitution of provider/account A with current provider/account B;
- provider/account identity consistency as an applicable predicate family;
- consumption of exact R6/R18 identity rather than “some currently ready capability.”

Therefore an **end-to-end consequential commercial provider path** cannot be certified merely because R17 and dispatch conformance pass. It must also satisfy applicable R20 Boundary Decision/provider-account predicates and exact R19 lineage consumption.

### Revised XPI-04 bundle

For a concrete provider path claiming end-to-end commercial authority:

1. REP-R17 generic Offer/Grant predicates pass.
2. RD-C-R17-R18 is canonical where the path consumes R18 commercial binding.
3. F07-04 passes.
4. IC-G2-01 exact provider/account dispatch equality passes.
5. H1-S09 is resolved for that checkout provider or the path remains non-authoritative.
6. H1-S05/S06/S07 resolve where the path consumes those provider-specific R15/R16 semantics, otherwise the affected financial evidence/reconciliation layer remains non-authoritative.
7. NAME-H2-E31 + REP-R17 joint sign-off passes for mechanical lifecycle literals.
8. Applicable H2 R17/R18/R19/R20 exactness rows have governed current representations without historical overclaim.
9. REP-R19 exact frozen provider/account lineage requirements pass.
10. Applicable F7 lineage relationships pass, including exact whole-lineage consumption where required.
11. REP-R20 / applicable R20 decision predicates revalidate the same exact provider/account lineage at the consequential boundary.

This is still a bundle of independent predicates, not a new merged finding.

## 7. Source re-verification — ROOT-3 provider configuration/adapter cluster scope

`commercial-payment-adapter.ts` confirms one currently configured commercial-payment bridge family:

- one `Map<string, CommercialPaymentAdapter>` keyed by provider;
- `registerCommercialPaymentAdapter()` registers by provider;
- configured adapter selection reads:
  - `MONEY_SCOUT_PAYMENT_PROVIDER`;
  - `MONEY_SCOUT_PAYMENT_BRIDGE_URL`;
  - `MONEY_SCOUT_PAYMENT_BRIDGE_TOKEN`;
- the configured adapter uses the common `/commercial/prepare` and `/commercial/activate` bridge endpoints.

`commercial-activation-worker.ts` consumes that provider-keyed adapter and the same provider identity across merchant/credential/runtime capability keys.

### Corrected scope claim

The four BLOCK-PROVIDER rows H1-S05/S06/S07/S09 remain operationally clustered as:

`COMMERCIAL_PAYMENT_PROVIDER_DOMAIN`

but the physical-root assertion is bounded:

> The currently inspected Money Scout commercial-payment implementation uses one common provider-keyed adapter/configuration family. This does not prove every future provider or every provider-domain integration must use the same physical configuration root.

Therefore PAIM-C must, per concrete provider onboarding/amendment:

- enumerate the actual adapter(s), environment/configuration source, provider schema/mapping code, webhook/evidence ingestion, reconciliation code, and checkout path;
- apply shared-root locking only to rows whose evidence actually reaches those physical/config roots;
- preserve independent closure for H1-S05/S06/S07/S09 even when one provider source packet or adapter amendment co-resolves several.

No universal cross-provider physical-root identity is asserted.

## 8. Source re-verification — mechanical NAME shared roots

The integrated review asked whether mechanical Phase-I literals already expose additional shared configuration roots that should be pre-seeded.

Current evidence supports the following disposition:

`NO_NEW_PRESEEDED_SHARED_ROOT_YET / PAIM-C REQUIRED`

Reason:

- the six mechanical NAME rows are known to require joint representation/governance sign-off;
- however, the integrated audit has not yet established one common physical enum/configuration root shared across multiple NAME rows analogous to `capabilities` or `commercial_activations`;
- some current literals are represented in different schema/types/code paths and the corrected canonical representation may change those roots during remediation.

Therefore no additional shared-root lock is invented now.

Before any mechanical NAME amendment lands, PAIM-C must search the actual selected representation for:

- database enum/type definitions;
- check constraints;
- state-transition maps;
- handler/routing maps;
- registry keys;
- policy maps;
- serialized event literals;
- migration aliases;
- fixtures and replay decoders.

If two or more NAME/representation nodes share one physical/config root, that root becomes `SHARED_ROOT_STABILITY_DEPENDENCY` before amendment landing.

## 9. Corrected interaction set

The integrated interaction register now contains at least:

- XPI-01 — five-layer R20 Boundary Registry / validator-policy / key / enforcement chain;
- XPI-02 — `capabilities` F/G/H shared-root interaction, with direct implementation evidence consumers added for PAIM-C;
- XPI-03 — C21-03 unresolved R11→R8 seam versus mechanical corrective-class routing;
- XPI-04 — end-to-end commercial provider/account authority bundle broadened through R19/R20;
- XPI-05 — BOUNDARY_VALIDATION mechanical phase literal blocked on RD-C-R5-R20 semantic completion.

## 10. Denominators unchanged

- Phase C standing remediation findings: unchanged.
- Phase F: 36 primaries unchanged.
- Phase G: G2-01 unchanged.
- Phase H: 57 primary source gaps unchanged.
- Phase I: nine carry-forward NAME rows unchanged.
- Phase J: six durable findings and canonical 11-attack accounting unchanged.

No new XPI interaction is counted as another phase finding unless later canonical adjudication explicitly promotes it. XPI rows are integration-control findings about dependency structure.

## 11. Review status after Corrections 1

Resolved from integrated §19 review:

- Q1: YES — H2-E43 was missing from XPI-01; corrected.
- Q2: NO CYCLE — J-F01 classifies future surfaces; it does not define the existing boundary vocabulary NAME-H2-E41 names.
- Q3: source re-verification broadened ROOT-2's direct implementation-evidence consumer baseline; still explicitly minimum-not-exhaustive.
- Q6: YES — end-to-end XPI-04 provider-path closure omitted downstream R19/R20 predicates; corrected.
- Q7: provider cluster confirmed for the currently inspected commercial-payment bridge family, not universalized to all future provider architectures.
- Q8: no additional shared mechanical-NAME root pre-seeded without evidence; mandatory PAIM-C physical/config search retained.
- XPI-05: added from cross-phase review.

Other integrated review questions remain open only where no evidence-based correction has yet been established.

## 12. Provisional disposition

`INTEGRATED REVIEW CORRECTIONS 1 ACCEPTED AS REVIEW OVERLAY / XPI-01 EXPANDED TO FIVE LAYERS WITH H2-E43 / J-F01↔NAME-H2-E41 CYCLE REJECTED WITH OBJECT-LEVEL RATIONALE / XPI-05 ADDED FOR RD-C-R5-R20→BOUNDARY_VALIDATION LITERAL SIGN-OFF / ROOT-2 DIRECT IMPLEMENTATION CONSUMERS BROADENED / XPI-04 EXTENDED THROUGH R19 AND R20 FOR END-TO-END PROVIDER AUTHORITY / ROOT-3 CLUSTER SCOPE LIMITED TO CURRENTLY INSPECTED COMMERCIAL-PAYMENT IMPLEMENTATION / NO UNSUPPORTED NAME SHARED ROOT INVENTED / PHASE DENOMINATORS UNCHANGED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`