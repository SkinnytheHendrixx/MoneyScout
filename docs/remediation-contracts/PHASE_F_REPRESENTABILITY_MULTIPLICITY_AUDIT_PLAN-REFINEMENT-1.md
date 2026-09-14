# Phase F Representability and Multiplicity Audit Plan — Refinement 1

**Status:** GOVERNING REFINEMENT / ACTIVE WITH BASE PLAN  
**Phase:** F — Representability and Multiplicity Sweep  
**Base plan:** `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN.md`  
**Implementation authority:** SUSPENDED

This refinement resolves three methodological gaps identified before any F1–F6 classification begins. It governs all Phase-F surface audits together with the base plan.

## 1. Evidence basis for Phase-F classifications

Phase F is not a prose-only specification review. The repository currently contains live Drizzle schema definitions under `lib/db/src/schema/*` and runtime migration code under `lib/db/src/*-runtime-migrations.ts`.

Examples confirmed on `main` include:

- `lib/db/src/schema/asset.ts`
- `lib/db/src/schema/build.ts`
- `lib/db/src/schema/execution.ts`
- `lib/db/src/schema/release.ts`
- `lib/db/src/asset-runtime-migrations.ts`
- `lib/db/src/release-runtime-migrations.ts`

Therefore each F1–F6 classification must name its actual evidence basis and may use current schema/migration artifacts as ground truth where they cover the relevant surface.

A `REPRESENTABILITY_PASS` requires concrete support from the current repository schema/migration/data-model artifacts sufficient to prove the required key/cardinality/reference behavior. Contract prose alone is not enough when Phase F is testing actual representability.

A `REPRESENTABILITY_DEFECT` may be issued when current schema/key/cardinality/reference/delete behavior affirmatively prevents a required legitimate state.

Use `REPRESENTABILITY_UNRESOLVED` when:

- the required table/object is described only in recovered contract prose but no current schema/migration representation can be located;
- schema fragments exist but do not establish the relevant uniqueness/reference/cardinality behavior;
- migration/runtime persistence differs materially from the declarative schema and the effective deployed representation cannot be established;
- retention/deletion behavior materially affects historical addressability but no governing policy or mechanism resolves it.

Theoretical redesignability is not PASS.

Every surface result must cite the exact schema/migration files and immutable SHAs reviewed. If a later commit changes an evidentiary file, the affected Phase-F classification is invalidated and must be rerun.

## 2. F7 — cross-surface N×N reference integrity

F1–F6 internal cardinality PASS is insufficient if references between independently multiplicative surfaces can still cross-wire, collapse, or fall back to mutable current state.

Phase F therefore adds mandatory **F7 — Cross-Surface Reference Integrity**.

For every governing relationship whose two ends may each have N > 1 legitimate objects, prove that the persisted relationship binds each child to the exact intended parent/authority instance.

Mandatory relationships include at least:

- `R9 snapshot ↔ R10 artifact/release`;
- `R17 Offer Version/Grant ↔ R19 Commercial Authority Lineage Reference`;
- `R19 Lineage Reference ↔ R20 boundary decision/evaluation`;
- `R18 Capability Binding ↔ R20 boundary decision/evaluation`;
- every Phase-E correspondence carried into Phase F where independently created records must agree on exact identity.

Required N×N fixture shape:

1. create at least two legitimate objects on side A: A1, A2;
2. create at least two legitimate objects on side B: B1, B2;
3. persist intended pairs A1↔B1 and A2↔B2 simultaneously;
4. prove the schema/reference model cannot silently produce A1↔B2 or A2↔B1 because parent scope, current/latest pointers, shared provider/account, same boundary class, same Asset, or other superficial attributes match;
5. prove restart/replay reconstructs the same pairings deterministically;
6. prove arbitrary-N extension does not depend on query-order heuristics or one-current-child assumptions.

A surface may therefore individually PASS F1–F6 but the governing composition still fail F7.

F7 classification values use the base Phase-F taxonomy, with defect subtype:

`REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`.

## 3. Retention, archival, partitioning, and deletion durability

Historical representability includes continued addressability for as long as the governing contract requires the authority/evidence to remain durable. A row that can be represented today but is routinely deleted tomorrow does not satisfy historical correctness.

The arbitrary-N checklist is amended with mandatory question 9:

> **9. Can any archival, retention, partitioning, cleanup, parent deletion, cascading foreign-key action, manual purge, or other lifecycle process delete, detach, or make unreachable a historical authority/evidence object that governing contracts require to remain durably preserved and addressable?**

Every F1–F7 review must inspect, where applicable:

- `ON DELETE CASCADE`, `SET NULL`, `RESTRICT`, or equivalent foreign-key behavior;
- archival/cleanup workers or scheduled deletion paths;
- partition expiry/drop behavior;
- compaction/deduplication that may remove distinct historical authorities;
- soft-delete behavior that makes records unavailable to authoritative replay;
- manual administrative deletion paths;
- retention-policy assumptions embedded outside schema files.

The governing retention duration must come from the relevant recovered contract or explicit implementation governance. Phase F must not invent "indefinite" retention where the contract does not require it. Conversely, absence of an explicit short retention rule is not permission to delete an object whose semantics require durable historical attribution/replay.

Current repository evidence already demonstrates that retention/deletion is materially relevant: multiple Asset-adjacent historical/event tables and commercial records use cascading parent deletion, so parent lifecycle policy must be included in representability review rather than assumed harmless.

Failure subtype:

`REPRESENTABILITY_DEFECT / HISTORICAL_RETENTION_DURABILITY`.

Use `REPRESENTABILITY_UNRESOLVED` when delete behavior exists but the governing parent-retention/deletion policy cannot be established.

## 4. Effective schema, not declarative schema alone

Where both declarative Drizzle definitions and runtime migrations exist, Phase F must compare them when relevant.

A PASS cannot rely on a TypeScript table definition if runtime migration code creates a different uniqueness constraint, reference, delete action, or column set in the effective database.

Likewise, a defect visible in runtime migration DDL is real representability evidence even if a future declarative schema could theoretically be amended.

Known positive control for this rule: current asset runtime migration code explicitly creates `commercial_activations_asset_unique` on `commercial_activations(asset_id)`. This is concrete schema/migration evidence for the R19/F5 audit and must be treated as actual current cardinality, not merely historical prose.

## 5. Revised Phase-F closure conditions

In addition to the base plan, Phase F cannot close until:

- F7 cross-surface N×N reference integrity is classified for every mandatory multiplicative relationship;
- arbitrary-N question 9 is answered for every F1–F7 surface/relationship;
- every PASS names concrete current schema/migration evidence and immutable SHAs;
- declarative schema versus runtime-migration divergence has been checked where both exist;
- retention/delete semantics are either proven compatible, classified as defect, or durably registered as unresolved;
- no PASS is inferred solely from recovered contract prose when the current representational surface is absent or unverified.

No F1–F6 substantive classification may begin under the unrefined method. This refinement is effective immediately and precedes all Phase-F findings.
