# Money Scout — Integrated Remediation Register — Review Corrections 4

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL INTEGRATED REGISTER FREEZE  
**Applies to:** `GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_INTEGRATED_REVIEW_DRAFT.md` + Corrections 1–3  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay records two precision additions accepted during the final dependency-completeness review before structural freeze-readiness audit.

Neither addition creates a new finding or dependency edge now. Both preserve a concrete landing-time condition that must be re-evaluated if the selected implementation shape changes.

## 2. INT-R4-01 — H2-E39 independence from RD-C-R5-R20 is conditional on generic registry policy storage

Corrections 3 correctly found no current direct edge:

`RD-C-R5-R20 → H2-E39`

because H2-E39 owns Boundary Registry representation/form, while H2-E43 owns validator-policy content.

That negative conclusion remains correct **only while the selected registry representation keeps predicate-specific policy content outside the registry's own structural schema**.

### Landing-time assumption check

Before any H2-E39 amendment may reach `MAY_LAND`, PAIM-C and the graph/fan-out review must explicitly answer:

> Does the selected Boundary Registry schema remain generic with respect to individual predicate families, or does it itself encode named predicate-specific fields/columns/keys whose meaning depends on unresolved semantic rules such as R5→R20?

If the registry schema stores only generic references such as a policy/version identifier, predicate-set reference, governed serialized policy object, or equivalent neutral representation, H2-E39 remains independent of RD-C-R5-R20.

If the selected schema instead embeds an R5-specific field or other predicate-specific structural element whose meaning depends on RD-C-R5-R20, then the dependency must be promoted before landing:

`RD-C-R5-R20 SEMANTIC_PREREQUISITE`
→
`H2-E39 R5-DEPENDENT REGISTRY-SCHEMA SLICE`

The edge is therefore **conditional on selected representation**, not absent forever.

### Required field

The freeze-ready register must carry for H2-E39:

`CONDITIONAL_DEPENDENCY_CHECK = REGISTRY_SCHEMA_PREDICATE_SPECIFICITY`

with a landing-time disposition of either:

- `GENERIC_POLICY_REFERENCE / NO_R5_EDGE`, or
- `PREDICATE_SPECIFIC_SCHEMA / ADD_R5_EDGE_BEFORE_MAY_LAND`.

## 3. INT-R4-02 — RET-R20 must tolerate ordinary forward schema evolution without historical rewriting

Corrections 3 correctly found no direct `RD-C-R5-R20 → RET-R20` edge.

RET-R20 owns historical addressability of immutable Boundary Decisions. It does not require every older decision to contain fields that did not exist under the authority/schema in force when that decision was created.

### Clarification

If RD-C-R5-R20 is resolved later and the corrected current Boundary Decision representation gains a new R5-related field or predicate-evidence element:

- Boundary Decisions created **after** the governed amendment must satisfy the new current representation where applicable;
- pre-amendment historical decisions may legitimately lack the newly introduced field;
- those historical rows must remain readable and semantically interpretable according to the schema/authority version under which they were created;
- absence of a not-yet-defined field on a pre-amendment row is not, by itself, a retention/addressability failure;
- remediation must not backfill unsupported R5 values into old decisions merely to normalize schemas;
- migration/version readers must distinguish `FIELD_NOT_DEFINED_UNDER_HISTORICAL_SCHEMA` from `REQUIRED_HISTORICAL_VALUE_MISSING`.

### Closure invariant

RET-R20 closes on durable historical addressability and faithful interpretation, not on forcing all historical rows into the newest schema shape.

Historical schema evolution is acceptable when version-aware interpretation preserves what was actually known and authoritative at the time.

## 4. Denominators and topology unchanged

- no new Phase-C edge is created now;
- H2-E39 remains one Phase-H source-gap row;
- RET-R20 remains one Phase-F unresolved retention row;
- no XPI count or phase denominator changes;
- current DAG remains acyclic on these additions.

## 5. Provisional disposition

`INTEGRATED REVIEW CORRECTIONS 4 ACCEPTED AS REVIEW OVERLAY / H2-E39 NO-R5-EDGE DECISION MADE EXPLICITLY CONDITIONAL ON GENERIC REGISTRY POLICY STORAGE / PAIM-C MUST PROMOTE RD-C-R5-R20→H2-E39 IF SELECTED SCHEMA EMBEDS R5-SPECIFIC STRUCTURE / RET-R20 EXPLICITLY TOLERATES VERSIONED HISTORICAL SCHEMA EVOLUTION WITHOUT UNSUPPORTED BACKFILL OR HISTORY REWRITE / PHASE DENOMINATORS AND CURRENT DAG TOPOLOGY UNCHANGED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`