# Phase F Batch 02 — R20 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F6 — R20 Boundary Decisions / Concurrent Evaluations  
**Implementation authority:** SUSPENDED

## 1. Governing method

This batch applies the Phase-F base plan, Refinement 1, and the closed Phase-D coexistence semantics.

The central representability question is not whether current code contains some authorization checks. It is whether the current persistence model can durably represent the exact operation-specific boundary decision that R20 requires, preserve arbitrary-N such decisions concurrently/historically, and bind each decision to the exact authority/predicate identities it evaluated.

Do not infer a dedicated R20 object merely because generic JSON event metadata could theoretically be expanded later. Theoretical redesignability is not PASS.

## 2. Evidence basis and pinned artifacts

### Recovered R20 contract

R20 blob: `d9d7788e4c5a8f4c0914cf845294b38386470333`

R20 explicitly requires, among other things:

- distinct `PREFLIGHT`, `BOUNDARY_VALIDATION`, and `ADOPTION_VALIDATION` authority consumptions;
- operation-specific decisions rather than one generic `isAuthorized` bit;
- revalidation of the exact bound authority/lineage, never current-state substitution;
- every applicable predicate family explicitly identified;
- durable boundary decisions carrying enough provenance to establish:
  - exact operation/boundary identity;
  - exact authority object / lineage reference evaluated;
  - applicable predicate set / validator policy version;
  - observed predicate outcomes;
  - decision time;
  - decision result;
  - evidence references/provenance where required;
- a durable Boundary Registry or equivalent governing map identifying boundary classes and required predicates;
- A0 representability proving multiple concurrently relevant historical/in-flight authorities and boundary evaluations without collision, overwrite, or one-current-authority assumptions;
- arbitrary-N boundary decisions, each remaining bound to the exact authority it evaluated.

The exact historical field names are source-unresolved, but these semantics are normative.

### Current schema inventory

`lib/db/src/schema/index.ts`  
Blob: `d034ad2ef8681b14efee5f7f281ca1a4bc9f1463`

Current exported schema modules are:

- money-scout
- discovery
- lifecycle
- human-actions
- execution
- bet
- factory
- build
- release
- asset
- runtime
- auth

The current `lib/db/src/schema` directory was also enumerated directly on `main`; no dedicated R20 boundary-decision or Boundary Registry schema module/table is present under another exported schema filename.

### Runtime migration inventory

`lib/db/src/runtime-migrations.ts`  
Blob: `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`

The generic runtime migration currently creates/validates runtime objects including evaluation cycles, watches, runtime state, lifecycle events, heartbeat runs, capabilities, human actions, execution jobs/events, and build jobs. It does not create a canonical R20 boundary-decision or Boundary Registry table.

`lib/db/src/asset-runtime-migrations.ts`  
Blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

The Asset/commercial migration creates Assets and related operational/commercial/event tables. It likewise does not establish a canonical R20 boundary-decision/registry representation.

### Human action / capability representation

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

`human_actions` records blockers, required capability/provider, verification mode, resume action/payload, resolution data, and timestamps. It does not have a declared canonical structure for the exact authority object/lineage, complete R20 predicate set + policy version, predicate outcomes, decision result, and adoption target required for a R20 boundary decision.

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

This code creates/reuses human actions and records their resolution. Those rows govern human bottlenecks/authority attestations; they are not demonstrated to be R20 decision objects.

### Release-specific authority representation

`lib/db/src/schema/release.ts`  
Blob: `a08ece6b75f32ef15ec6a1019bc6b2c50cacf078`

Current release persistence includes:

- one release job identity;
- release state/provider run IDs;
- `publicReleaseAuthorizedAt` / `publicReleaseAuthorizedBy`;
- spend ceilings/usage;
- generic `release_events` with `eventType`, `summary`, and untyped JSON metadata.

The release record does not declare a canonical R20 boundary-decision object carrying the complete exact predicate provenance required by R20.

`artifacts/api-server/src/lib/controlled-release-safety.ts`  
Blob: `c77d4a81a1951368e39080d15f7f424db7bdd1c6`

This file performs release-specific eligibility checks and writes authorization timestamps, human-action resolutions, and release events.

`artifacts/api-server/src/lib/controlled-release-worker.ts`  
Blob: `a4e8c8d61c179f11ffa92ad3e37c9f75523e8b73`

This worker locally creates/reuses release jobs, checks preview/public/spend/health state, requests human authority, and advances release state. It is evidence of consequential gating, but not proof of a canonical cross-boundary R20 registry/decision model.

### Asset-level authority representation

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`PersistedAssetAuthorities` stores current-style authority fields such as public-release, customer-charging, outbound, advertising, custom-domain, production-credential, and spend-ceiling values. These fields can represent current Asset authority state but are not operation-specific durable R20 boundary decisions.

## 3. Finding F02-01 — canonical R20 boundary-decision identity/content is not represented

**Classification:** `REPRESENTABILITY_DEFECT / BOUNDARY_DECISION_IDENTITY_REPRESENTATION`

R20 requires a durable, operation-specific decision with exact authority/predicate provenance and explicit A0 arbitrary-N multiplicity.

The checked current persistence surfaces instead provide fragments:

- mutable/current authority values on Assets;
- release-specific authorization timestamps/actor;
- human-action blocker/resolution rows;
- generic release/lifecycle event metadata;
- execution/build/release job state.

None of the checked declared/effective schema surfaces is an equivalent canonical R20 decision object binding all required dimensions of one boundary evaluation.

In particular, there is no current declared object that independently and canonically binds, for one decision:

- exact boundary phase/type/operation identity;
- exact authority/lineage object(s) evaluated;
- exact applicable predicate set;
- validator/policy version;
- each observed predicate outcome;
- decision time/result;
- required evidence/provenance;
- adoption target where applicable.

A generic JSON metadata column does not establish that representation merely because those values could theoretically be placed there in a future redesign. No checked current code/schema declares such metadata to be the canonical R20 decision object, and R20 expressly requires a canonical boundary-decision schema/migration surface.

### Arbitrary-N consequence

Do not count a second independent cardinality defect merely because arbitrary-N R20 decisions are not currently proven. The absent/insufficient canonical decision model is the root representation defect.

Remediation/acceptance must nevertheless prove:

1. D1 and D2 for the same Asset and same boundary class but different exact authority/execution identities coexist simultaneously;
2. preflight, boundary-validation, and adoption-validation decisions remain distinct;
3. prior ALLOW/DENY-like outcomes remain durable historical evidence rather than being overwritten by current state;
4. arbitrary D1...DN remain independently addressable;
5. adding DN+1 cannot mutate/reuse D1...DN because Asset, boundary class, current lineage, or another superficial parent matches.

## 4. Current-state/authorization fragments do not substitute for durable decisions

**Disposition:** supporting implementation/schema evidence for F02-01, not a separately counted primary defect.

Examples:

- Asset authorities are current aggregate booleans/ceilings, not exact operation-specific decision history.
- `release_jobs.publicReleaseAuthorizedAt/By` establishes that an authorization was recorded for one release, but does not by itself preserve the complete predicate set, policy version, outcomes, exact upstream authority objects, and adoption target evaluated at an R20 boundary.
- human-action resolution proves that a blocker/attestation was resolved, not that every applicable R20 predicate was revalidated at a consequential crossing.
- release/lifecycle events may preserve useful historical facts, but their generic JSON metadata is not a declared canonical R20 decision contract.

These may become inputs/evidence references to a future R20 decision. They are not equivalent to the decision itself.

## 5. Boundary Registry representation/coverage remains a separate review question

**Provisional classification:** `REPRESENTABILITY_UNRESOLVED / BOUNDARY_REGISTRY_REPRESENTATION`

R20 explicitly requires a durable Boundary Registry or equivalent governing map so boundary-specific safety is not left to local worker judgment.

No dedicated registry is present in the enumerated schema or generic/Asset runtime migrations, and the controlled-release path visibly performs boundary-specific gating locally.

However, Phase F should not overclaim a repository-wide absence from schema naming and selected worker inspection alone. An equivalent static/code registry could theoretically exist elsewhere and needs a deliberately exhaustive code-level search before this is upgraded to a confirmed defect.

This question also overlaps later A1 / Phase J forward-governance work. The eventual adjudication should distinguish:

- **representability:** can the registry/policy map and versions be durably represented/addressed?;
- **coverage/governance:** does every current/future consequential path actually register and invoke it?

The first belongs in Phase F; the second remains for R20 A1 / Phase J even after representation exists.

## 6. Retention durability remains unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

There is no canonical R20 decision object yet whose own delete behavior can be inspected.

The proxy/history surfaces currently available are not retention-safe by assumption:

- release events cascade with release/build/opportunity parents;
- human actions cascade with Opportunity and may lose Evaluation Cycle reference through `SET NULL`;
- Asset-adjacent historical tables contain cascading parent deletes.

But, as in Batch 01, the governing hard-delete/retention policy has not been established.

Therefore Phase F cannot certify that historical boundary decisions/evidence remain addressable for the required duration, but it also cannot yet claim that required history is actually deletable under an allowed parent lifecycle.

Required follow-up: resolve parent deletion/archive policy and ensure the eventual canonical R20 decision history remains durably addressable for its governed retention period.

## 7. Arbitrary-N checklist — provisional R20 disposition

1. **Exact authority/history key?** No proven canonical R20 boundary-decision key/object. **FAIL / DEFECT.**
2. **Repeatable parent scopes?** R20 permits many decisions under the same Asset/boundary class when exact authority/execution differs; current canonical representation is absent. **FAIL under F02-01.**
3. **Uniqueness constraints?** No R20 decision table exists to inspect; generic proxy tables do not prove correct decision keying. **FAIL / representation absent, not a separate uniqueness defect.**
4. **N children under one parent?** Not proven for canonical R20 decisions. **FAIL under F02-01.**
5. **Historical and current coexist?** Current authority fragments exist, but canonical historical decision coexistence is not represented/proven. **FAIL under F02-01.**
6. **Multiple in-flight decisions?** Not represented/proven as exact R20 objects. **FAIL under F02-01.**
7. **Exact downstream/reference binding without mutable current pointer?** No canonical decision object exists to carry those exact references. **FAIL / DEFECT.**
8. **Restart/replay reconstruct same N-object graph?** No canonical N-decision graph exists to reconstruct. **FAIL under F02-01.**
9. **Retention/archive/delete durability?** Proxy histories cascade; parent policy unresolved; canonical decision object absent. **UNRESOLVED.**

## 8. Phase-D schema attacks against R20

- **F-D1 current-pointer overwrite:** FAIL at the canonical-decision layer because durable distinct decision objects are absent; current authority fragments cannot substitute.
- **F-D2 same-parent deduplication:** no canonical model exists to prove same-parent decisions remain distinct. FAIL under F02-01.
- **F-D3 decision-model collision:** directly unproven/unrepresentable in the current canonical model because that model is absent. FAIL under F02-01.
- **F-D4 mixed-chain reconstruction:** no exact decision object binds the consumed upstream identities, so safe reconstruction is not proven. FAIL.
- **F-D5 legitimate coexistence mistaken for conflict:** arbitrary-N coexistence cannot be demonstrated without a canonical decision model. FAIL under F02-01.
- **F-D6 creation-time inheritance contamination:** no canonical freeze exists to prove a later decision cannot inherit current authority/lineage fragments. FAIL under F02-01.

## 9. F7 implications

This batch does not certify F7.

It establishes that the R20 side is currently not ready for mandatory N×N reference-integrity proof with at least:

- R19 Lineage Reference ↔ R20 decision;
- R18 Capability Binding ↔ R20 decision;
- R3 freshness result/policy version ↔ R20 decision;
- R7 reservation/action identity ↔ R20 decision;
- other Phase-E exact correspondence sets applicable to a boundary.

F7 must still independently prove exact pairings after canonical R20 decision representation exists.

## 10. Provisional batch disposition

- **F02-01:** `REPRESENTABILITY_DEFECT / BOUNDARY_DECISION_IDENTITY_REPRESENTATION`.
- **F02-02:** `REPRESENTABILITY_UNRESOLVED / BOUNDARY_REGISTRY_REPRESENTATION` pending exhaustive equivalent-registry search and careful separation from A1/Phase-J coverage.
- **F02-03:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No separate cardinality finding is counted at this stage; arbitrary-N failure is an acceptance consequence of F02-01 unless review finds an independent current key/uniqueness collision once an equivalent decision object is located.

No implementation or remediation is authorized.

## 11. Requested adversarial review

1. Is F02-01 properly classified as a representability defect rather than UNRESOLVED, given the complete current schema inventory and the contract's explicit canonical boundary-decision requirement?
2. Could `human_actions`, `release_events`, lifecycle events, execution-job results, or another checked generic JSON/event surface legitimately be treated as an equivalent canonical R20 decision object? If yes, identify the exact existing declared invariant/field path that binds all required R20 dimensions.
3. Is it correct not to create a separate cardinality defect while the canonical decision model itself is absent?
4. Should the missing Boundary Registry be a confirmed Phase-F defect now, or remain UNRESOLVED until an exhaustive code-level search excludes an equivalent static/code registry? Where exactly should the boundary be drawn between Phase-F registry representation and A1/J registry coverage/governance?
5. Do Asset authority booleans or `publicReleaseAuthorizedAt/By` create any independent one-current-authority defect beyond their role as evidence that current-state fragments are not durable R20 decisions?
6. Is retention correctly UNRESOLVED while the canonical decision object is absent and parent deletion policy remains unknown?
7. Are any of the nine arbitrary-N answers overstated because a generic append-only event table could physically hold N JSON records, even though no canonical R20 decision contract is declared on it?
8. Find any current R20 representability failure supported by actual schema/migration/application evidence that is independent of missing canonical decision identity/content, registry uncertainty, F7 cross-surface integrity, or retention.

## 12. Calibration

Do not equate “there is no table literally named boundary_decisions” with a defect; equivalent canonical representation would count if actual invariants prove it.

Conversely, do not treat an unconstrained JSON metadata field as an equivalent R20 decision merely because future code could choose to serialize the required fields into it.

The review should keep four questions separate:

1. canonical per-boundary decision representation;
2. arbitrary-N decision multiplicity;
3. Boundary Registry representation versus registry coverage/governance;
4. historical retention durability.
