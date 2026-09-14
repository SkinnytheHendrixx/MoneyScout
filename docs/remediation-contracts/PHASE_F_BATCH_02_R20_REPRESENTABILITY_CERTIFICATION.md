# Phase F Batch 02 — R20 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F6 — R20 Boundary Decisions / Concurrent Evaluations  
**Implementation authority:** SUSPENDED

## 1. Governing method

This certification applies the Phase-F base plan, Refinement 1, the closed Phase-D coexistence semantics, and independent adversarial verification of the draft's key negative/equivalence claims.

The central question is not whether current code contains authorization checks. It is whether the current persistence model can durably represent the exact operation-specific boundary decision R20 requires, preserve arbitrary-N such decisions concurrently/historically, and bind each decision to the exact authority/predicate identities it evaluated.

A generic JSON/event surface counts only if an actual declared invariant makes it the canonical R20 decision representation. Theoretical redesignability is not PASS.

## 2. Pinned evidence basis

### Recovered R20 contract

R20 blob: `d9d7788e4c5a8f4c0914cf845294b38386470333`

R20 normatively requires, among other things:

- distinct `PREFLIGHT`, `BOUNDARY_VALIDATION`, and `ADOPTION_VALIDATION` authority consumptions;
- operation-specific decisions rather than one generic authorization bit;
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

Exact historical field names remain source-unresolved; these semantics are not.

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

The `lib/db/src/schema` directory was directly enumerated on `main`; no dedicated R20 boundary-decision or Boundary Registry schema module/table is present under another exported schema filename.

### Runtime migration inventory

`lib/db/src/runtime-migrations.ts`  
Blob: `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`

The generic runtime migration creates/validates evaluation cycles, watches, runtime state, lifecycle events, heartbeat runs, capabilities, human actions, execution jobs/events, and build jobs. It does not create a canonical R20 boundary-decision or Boundary Registry table.

`lib/db/src/asset-runtime-migrations.ts`  
Blob: `18e736e1bf4e0b20c9a8bc03336c810bdfabf2d4`

The Asset/commercial migration creates Assets and related operational/commercial/event tables. It likewise does not establish a canonical R20 boundary-decision/registry representation.

### Human action / capability representation

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

`human_actions` records blockers, required capability/provider, verification mode, resume action/payload, resolution data, and timestamps. It has no declared canonical structure binding the exact authority object/lineage, complete R20 predicate set + policy version, predicate outcomes, decision result, and adoption target required for a R20 decision.

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

This code creates/reuses human actions and records their resolution. Those rows govern human bottlenecks/authority attestations; independent review found no declared invariant making them R20 decision objects.

### Release-specific authority representation

`lib/db/src/schema/release.ts`  
Blob: `a08ece6b75f32ef15ec6a1019bc6b2c50cacf078`

Current release persistence includes one release-job identity, release/provider-run state, `publicReleaseAuthorizedAt` / `publicReleaseAuthorizedBy`, spend fields, and generic `release_events` with untyped JSON metadata.

Two schema facts were independently rechecked and are load-bearing here:

1. `release_jobs_build_job_unique` is `UNIQUE(build_job_id)`. The closest current release-level proxy is therefore structurally one row per build.
2. `release_jobs.evaluationCycleId` references `evaluation_cycles` with `onDelete: "set null"`.

`artifacts/api-server/src/lib/controlled-release-safety.ts`  
Blob: `c77d4a81a1951368e39080d15f7f424db7bdd1c6`

This file performs release-specific eligibility checks and writes authorization timestamps, human-action resolutions, and release events.

`artifacts/api-server/src/lib/controlled-release-worker.ts`  
Blob: `a4e8c8d61c179f11ffa92ad3e37c9f75523e8b73`

This worker locally creates/reuses release jobs, checks preview/public/spend/health state, requests human authority, and advances release state. It is evidence of consequential gating, but not proof of a canonical cross-boundary R20 registry/decision model.

### Asset-level authority representation

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`PersistedAssetAuthorities` stores current-style authority fields such as public-release, customer-charging, outbound, advertising, custom-domain, production-credential, and spend-ceiling values. These represent current Asset authority state, not operation-specific durable R20 decisions.

## 3. F02-01 — canonical R20 boundary-decision identity/content is not represented

**Classification:** `REPRESENTABILITY_DEFECT / BOUNDARY_DECISION_IDENTITY_REPRESENTATION`

**Adjudication:** CONFIRMED.

R20 requires a durable, operation-specific decision with exact authority/predicate provenance and explicit A0 arbitrary-N multiplicity.

The checked current persistence surfaces provide fragments instead:

- mutable/current authority values on Assets;
- release-specific authorization timestamp/actor fields;
- human-action blocker/resolution rows;
- generic release/lifecycle event metadata;
- execution/build/release job state.

None of the checked declared/effective schema surfaces is an equivalent canonical R20 decision object binding all required dimensions of one boundary evaluation.

There is no current declared object that independently and canonically binds, for one decision:

- exact boundary phase/type/operation identity;
- exact authority/lineage object(s) evaluated;
- exact applicable predicate set;
- validator/policy version;
- each observed predicate outcome;
- decision time/result;
- required evidence/provenance;
- adoption target where applicable.

A generic JSON metadata column does not establish that representation merely because future code could serialize the required fields there. Independent review specifically checked `release_events`: it is append-capable, but its metadata is untyped JSON and no declared invariant makes each row a canonical R20 decision object.

### Concrete current-pointer / one-row evidence

The closest release-level proxy is stronger evidence of the defect than mere field incompleteness:

- `release_jobs` is constrained by `UNIQUE(build_job_id)`;
- `publicReleaseAuthorizedAt` and `publicReleaseAuthorizedBy` are scalar fields on that one row.

Therefore, if the same build's public-release authority is later revoked and re-evaluated, that representation has no distinct append-only per-decision identity of its own. Any later value lives on the same uniquely keyed release row rather than as D1, D2, ... DN independently preserved decisions.

This is a concrete Phase-D D-C1/current-pointer failure mode supporting F02-01. It is supporting evidence for the root decision-model defect, not a separately numbered cardinality defect.

### Arbitrary-N acceptance requirement

No separate cardinality finding is counted while the canonical decision model itself is absent. Remediation must nevertheless prove:

1. D1 and D2 for the same Asset and same boundary class but different exact authority/execution identities coexist simultaneously;
2. preflight, boundary-validation, and adoption-validation decisions remain distinct;
3. prior ALLOW/DENY-like outcomes remain durable historical evidence rather than being overwritten by current state;
4. arbitrary D1...DN remain independently addressable;
5. adding DN+1 cannot mutate/reuse D1...DN because Asset, build, boundary class, current lineage, or another superficial parent matches.

## 4. Current-state/authorization fragments do not substitute for durable decisions

**Disposition:** supporting evidence for F02-01; no separate primary defect.

- Asset authority fields are current aggregate booleans/ceilings, not exact operation-specific decision history.
- `release_jobs.publicReleaseAuthorizedAt/By` records a release-level authorization state but not the complete predicate set, policy version, outcomes, exact upstream authority objects, and adoption target required by R20; the one-row-per-build uniqueness constraint also demonstrates the lack of independently addressable repeated decision history.
- human-action resolution proves a blocker/attestation was resolved, not that every applicable R20 predicate was revalidated at a consequential crossing.
- generic release/lifecycle events can preserve evidence, but no current schema/application invariant declares them to be canonical R20 decisions.

These may become evidence references or inputs to a future R20 decision model. They are not equivalent to the decision itself.

## 5. F02-02 — Boundary Registry representation remains unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / BOUNDARY_REGISTRY_REPRESENTATION`

**Adjudication:** CONFIRMED UNRESOLVED.

R20 explicitly requires a durable Boundary Registry or equivalent governing map so boundary-specific safety is not left to local worker judgment.

No dedicated registry is present in the enumerated schema or generic/Asset runtime migrations, and the controlled-release path visibly performs boundary-specific gating locally.

However, schema naming plus selected worker inspection is not sufficient to prove repository-wide absence. An equivalent static/code registry could exist elsewhere.

### Required resolution trigger

Before F02-02 may be upgraded to DEFECT or PASS, perform a deliberately exhaustive repository-level search across API-server, worker, policy, config, registry, validator, safety, and orchestration surfaces for an equivalent static/code registry. Search terms and semantic equivalents must include at least:

- boundary registry / boundary class;
- consequential boundary / consequence type;
- predicate registry / predicate set;
- validator policy / policy version;
- adoption validation / boundary validation / preflight;
- dispatch/release/charge/financial-adoption/headroom/lifecycle/handoff registration maps;
- static maps/configuration tables that enumerate operation classes and required validators even if they do not use R20 terminology.

If an equivalent is found, Phase F asks whether the registry/policy map and versions are durably representable/addressable. R20 A1 / Phase J separately asks whether every current/future consequential path actually registers and invokes it.

## 6. F02-03 — historical retention durability remains unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`

**Adjudication:** CONFIRMED UNRESOLVED.

There is no canonical R20 decision object yet whose own deletion/retention behavior can be inspected.

The available proxy/history surfaces are not retention-safe by assumption:

- release events cascade with release/build/opportunity parents;
- human actions cascade with Opportunity and can lose Evaluation Cycle reference through `SET NULL`;
- Asset-adjacent historical tables contain cascading parent deletes;
- specifically, `release_jobs.evaluationCycleId` uses `ON DELETE SET NULL`, so deleting an Evaluation Cycle can sever a surviving release job from that explicit cycle reference.

That last fact is a concrete mechanism by which partial parent deletion could remove an R4-lineage reference from an otherwise surviving release record. It does **not** by itself prove a normative retention violation, because the governing hard-delete/archive policy is still unresolved and the eventual canonical R20 decision object does not yet exist.

Required follow-up:

1. resolve parent deletion/archive policy for Evaluation Cycles, release/build records, Assets, and eventual R20 decision records;
2. prove that canonical R20 decision history and every exact lineage/evidence reference required by it remain durably addressable for the governed retention period;
3. ensure deletion/nulling of a parent cannot silently destroy a required historical authority link while leaving a misleadingly partial decision record behind.

## 7. Arbitrary-N checklist — final R20 disposition

1. **Exact authority/history key?** No canonical R20 boundary-decision key/object. **FAIL / F02-01.**
2. **Repeatable parent scopes?** R20 permits many decisions under the same Asset/boundary class when exact authority/execution differs; current canonical representation is absent. **FAIL / F02-01.**
3. **Uniqueness constraints?** No canonical decision table exists; closest release proxy is `UNIQUE(build_job_id)` and scalar authorization fields on one row. **FAIL evidence under F02-01, not separate finding.**
4. **N children under one parent?** Not proven for canonical R20 decisions. **FAIL / F02-01.**
5. **Historical and current coexist?** Current authority fragments exist, but canonical historical decision coexistence is not represented/proven. **FAIL / F02-01.**
6. **Multiple in-flight decisions?** Not represented/proven as exact R20 objects. **FAIL / F02-01.**
7. **Exact downstream/reference binding without mutable current pointer?** No canonical decision object carries those exact references. **FAIL / F02-01.**
8. **Restart/replay reconstruct same N-object graph?** No canonical N-decision graph exists to reconstruct. **FAIL / F02-01.**
9. **Retention/archive/delete durability?** Proxy histories cascade or may sever references; parent policy unresolved; canonical decision object absent. **UNRESOLVED / F02-03.**

Independent review found none of these answers overstated. The existence of physically appendable generic event rows does not satisfy canonical-decision semantics without a declared invariant binding the required R20 dimensions.

## 8. Phase-D schema attacks against R20

- **F-D1 current-pointer overwrite:** FAIL. The canonical decision layer is absent, and the closest release proxy is concretely one row per build with scalar authorization fields.
- **F-D2 same-parent deduplication:** no canonical model proves same-parent decisions remain distinct. FAIL under F02-01.
- **F-D3 decision-model collision:** no canonical model can prove distinct decision semantics remain independently addressable. FAIL under F02-01.
- **F-D4 mixed-chain reconstruction:** no exact decision object binds the consumed upstream identities, so safe reconstruction is not proven. FAIL under F02-01.
- **F-D5 legitimate coexistence mistaken for conflict:** arbitrary-N coexistence cannot be demonstrated without a canonical decision model. FAIL under F02-01.
- **F-D6 creation-time inheritance contamination:** no canonical decision freeze proves a later decision cannot inherit current authority/lineage fragments. FAIL under F02-01.

## 9. F7 implications

This batch does not certify F7.

The R20 side is not ready for mandatory N×N reference-integrity proof with at least:

- R19 Lineage Reference ↔ R20 decision;
- R18 Capability Binding ↔ R20 decision;
- R3 freshness result/policy version ↔ R20 decision;
- R7 reservation/action identity ↔ R20 decision;
- other Phase-E exact correspondence sets applicable to a boundary.

F7 must independently prove exact pairings after canonical R20 decision representation exists.

## 10. Final batch disposition

- **F02-01:** `REPRESENTABILITY_DEFECT / BOUNDARY_DECISION_IDENTITY_REPRESENTATION` — **CONFIRMED**.
- **F02-02:** `REPRESENTABILITY_UNRESOLVED / BOUNDARY_REGISTRY_REPRESENTATION` — **CONFIRMED UNRESOLVED**, with explicit exhaustive-search trigger.
- **F02-03:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY` — **CONFIRMED UNRESOLVED**, with `evaluation_cycle_id ON DELETE SET NULL` as concrete supporting evidence.

No additional independent representability defect was found in adversarial review.

No separate cardinality defect is counted; the one-row-per-build release proxy is concrete supporting evidence for F02-01 and arbitrary-N remains a mandatory acceptance criterion for its remediation.

No implementation or remediation is authorized.

## 11. Adversarial review adjudication

The independent review directly re-read `release.ts` rather than relying on the draft's characterization and reached the following adjudications:

1. **F02-01 DEFECT vs UNRESOLVED:** DEFECT confirmed. `UNIQUE(build_job_id)` plus scalar authorization fields makes the closest current proxy affirmatively incompatible with independent repeated decision identity/history.
2. **Generic surfaces as equivalent decision objects:** rejected. `release_events` is append-capable but untyped; no declared field/invariant path binds all required R20 dimensions. Human actions and current authority fragments likewise do not qualify.
3. **Separate cardinality finding:** rejected as double-counting while the canonical decision object is absent. Concrete uniqueness evidence remains supporting evidence for F02-01.
4. **Boundary Registry:** keep UNRESOLVED until exhaustive equivalent-registry search. Separate Phase-F representation from A1/J coverage/governance.
5. **Asset booleans / public-release timestamp fields:** decisive supporting evidence for F02-01, not a separate defect.
6. **Retention:** keep UNRESOLVED. `evaluationCycleId SET NULL` is a specific retention/lineage-severing risk but cannot be promoted to a normative retention defect without parent-lifecycle policy.
7. **Nine arbitrary-N checklist answers:** no overstatement found.
8. **Independent additional failures:** no new primary defect found; the `SET NULL` behavior is the substantive new evidence for F02-03.

## 12. Calibration carried forward

Do not equate absence of a table literally named `boundary_decisions` with a defect; equivalent canonical representation counts if actual invariants prove it.

Do not treat unconstrained JSON metadata as an equivalent R20 decision merely because future code could serialize required fields into it.

Keep four questions separate in later Phase-F work:

1. canonical per-boundary decision representation;
2. arbitrary-N decision multiplicity;
3. Boundary Registry representation versus registry coverage/governance;
4. historical retention durability.
