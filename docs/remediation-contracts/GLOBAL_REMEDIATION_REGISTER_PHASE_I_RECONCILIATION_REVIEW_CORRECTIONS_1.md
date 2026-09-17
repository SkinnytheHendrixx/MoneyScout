# Money Scout — Global Remediation Register — Phase-I Reconciliation — Review Corrections 1

**Status:** DRAFT CORRECTION OVERLAY / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Applies to:** `GLOBAL_REMEDIATION_REGISTER_PHASE_I_RECONCILIATION_REVIEW_DRAFT.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates the first adversarial review of the nine-item Phase-I reconciliation.

The review confirmed the denominator, exact-once ownership, historical-name non-laundering rule, H2-E45 exclusion, and the three genuinely nominal or plausibly nominal rows. It identified one substantive control defect: the base draft treated enum-shaped Phase-I rows as nominal naming decisions unless their mechanical role was later discovered.

That presumption is reversed here.

## 2. Correction I-C1 — enum-shaped rows are mechanical-by-default

For a Phase-I item whose candidate values form a multi-value state, class, routing, boundary, phase, or lifecycle vocabulary, the default disposition is:

`MECHANICAL_UNTIL_PROVEN_NOMINAL`

This applies because such literals commonly function as:

- state-machine discriminators;
- transition guards;
- routing/dispatch selectors;
- registry keys;
- policy lookup values;
- eligibility/currentness inputs;
- persistence enum values;
- migration discriminators;
- fixture selectors.

A row may be downgraded to pure naming only if the concrete implementation design proves that the literal itself is not consumed by any such mechanism and can change without altering equality, lookup, transition legality, routing, registry membership, policy matching, migration interpretation, or fixture behavior.

This reverses the base draft's effective presumption of `nominal unless proven mechanical`.

## 3. Revised pull-forward test

The pull-forward test remains behavior-based, but now has two branches.

### 3.1 Enum/class/state-shaped candidate

Presume mechanical coupling.

Before `NAME-*` may close, require explicit joint sign-off from:

1. the NAME owner; and
2. the applicable semantic/representation/governance owner.

The joint sign-off must establish either:

- `MECHANICAL_LITERAL_ACCEPTED` — the literal is load-bearing and all mechanical consumers/migrations/rechecks are governed; or
- `PROVEN_NOMINAL_ONLY` — evidence shows the literal is not a discriminator/key/selector and can remain purely nominal.

### 3.2 Standalone descriptive label

May remain nominal-by-default if no mechanical consumer is identified.

The ordinary pull-forward triggers still apply if later evidence shows mechanical use.

## 4. Post-adoption literal changes

For any row classified `MECHANICAL_LITERAL_ACCEPTED`, a later literal change is a representation-affecting change by default.

It must trigger:

- `REPRESENTATION_PREREQUISITE` treatment where the representation owner consumes the literal;
- PAIM-A/B/C derivation;
- migration analysis;
- invalidation of certifications relying on the prior literal as implementation/configuration evidence;
- PRE-BCT and POST-BCT on the amendment-bearing node;
- graph/consequential-surface checks where the literal is a registry/policy discriminator.

A later change may avoid this path only after proving `PROVEN_NOMINAL_ONLY` for the affected use.

## 5. Six rows reclassified as mechanical-by-default

### NAME-H2-E10 — R11 corrective-class names

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

The corrective classes route materially different work classes such as repair, Product Definition revision, replanning, or Human handling. The literals are therefore presumed dispatch/routing discriminators.

**Joint closure owners:**

- `NAME-H2-E10` for adopted literal choice;
- R11 representation/routing owner for persisted class identity and handler dispatch.

**Closure requires:**

- exact one-to-one mapping between recovered semantic corrective classes and adopted literals;
- proof that each class routes to the correct governed handler/authority path;
- migration/alias behavior cannot cross-route historical or in-flight work;
- explicit representation-owner sign-off.

### NAME-H2-E13 — R12 runnable/job/claim state names

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

The state set is a state-machine vocabulary and is presumed to drive transition legality, scheduling eligibility, claim/lease behavior, and terminality.

**Joint closure owners:**

- `NAME-H2-E13`;
- R12 state/occurrence representation owner, including `AUX-F-R12-OCCURRENCE` where applicable.

**Closure requires:**

- adopted literal set maps one-to-one onto recovered states;
- transition guards and scheduling behavior are validated against the adopted literals;
- persisted historical states remain interpretable after migration;
- explicit representation-owner sign-off.

### NAME-H2-E19 — R14 lifecycle names

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

The lifecycle vocabulary is presumed to be a transition/fencing discriminator over states such as active, draining, quiesced, handoff-ready, and retired.

**Joint closure owners:**

- `NAME-H2-E19`;
- R14 lifecycle/authority-epoch/fencing representation owner.

**Closure requires:**

- adopted literals preserve exact lifecycle distinctions;
- transition legality, incumbent/successor authority, fencing, drain behavior, and handoff semantics are rechecked against the literal mapping;
- explicit representation-owner sign-off.

### NAME-H2-E31 — R17 Offer/Grant lifecycle names

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

Offer/Grant lifecycle values are presumed to participate in eligibility/currentness decisions such as draft, active, superseded, and revoked authority.

**Joint closure owners:**

- `NAME-H2-E31`;
- `REP-R17` / exact Offer/Grant lifecycle representation owner.

**Closure requires:**

- literal mapping preserves supersession/revocation/currentness semantics;
- authorization checks cannot treat a superseded/revoked Grant as active because of aliasing or stale literal interpretation;
- historical records remain semantically stable through migration;
- explicit representation-owner sign-off.

### NAME-H2-E41 — R20 boundary-class names

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

Boundary-class literals are presumed to function as Boundary Registry keys, policy selectors, consequence-class discriminators, or equivalent lookup values.

**Joint closure owners:**

- `NAME-H2-E41`;
- `REP-R20` / `REP-F02-02` / applicable Phase-J governance owner for actual registry-key consumption.

**Closure requires:**

- every adopted boundary-class literal maps to exactly one recovered semantic boundary class;
- registry membership and policy lookup use the correct class without alias collision;
- changing the literal cannot silently unregister a consequential surface or route it to a different predicate set;
- explicit representation/governance-owner sign-off.

Any later change to an adopted boundary-class literal is a `REPRESENTATION_PREREQUISITE` and potentially a `GOVERNANCE_PREREQUISITE` event by default.

### NAME-H2-E42 — R20 three-phase literal strings

**Revised posture:** `MECHANICAL_UNTIL_PROVEN_NOMINAL`

The three-phase strings are presumed to be switch/policy discriminators determining which phase-specific predicate set or validation behavior applies.

**Joint closure owners:**

- `NAME-H2-E42`;
- R20 decision/registry/policy representation owner.

**Closure requires:**

- each literal maps to exactly one recovered phase;
- phase selection and predicate routing are validated against the adopted literals;
- migration/alias support cannot blur phase identity;
- explicit representation-owner sign-off.

A post-adoption literal change is a representation-affecting event by default, not merely a naming migration.

## 6. Three rows retained as nominal or dual-layer exceptions

### NAME-H1-S01 — R8 reconciliation-capability labels

Remains **dual-layer** rather than pure nominal.

The semantic taxonomy itself is still owned by `SRC-H1-S01`; NAME-H1-S01 may only adopt labels after the semantic categories are stable. If the eventual implementation uses those labels as enum/registry keys, the mechanical portion follows the same joint-sign-off rule above.

### NAME-H2-E28 — R16 informational-observation name

Remains **nominal-by-default** on current evidence.

The recovered semantic distinction is informational/non-authoritative. The item is a single category label, not a multi-value transition/routing vocabulary. If later implementation uses the literal as a consequential discriminator rather than a display/storage label, the pull-forward rule activates.

### NAME-H2-E44 — R20 forward-governance historical label

Remains **nominal/descriptive**.

It names the recovered forward-governance requirement. H2-E45 owns historical mechanical-enforcement exactness, and J-F01–J-F06 own current enforcement obligations. The label itself is not evidence of enforcement.

## 7. Revised Phase-I ownership rule

Phase-I exact-once NAME ownership remains intact for all nine rows.

For the six mechanical-by-default rows, however, `NAME-*` is no longer sufficient for closure by itself.

The closure relationship is:

`NAME OWNER + REPRESENTATION/GOVERNANCE OWNER JOINT SIGN-OFF`

This does not create a second normative naming owner and does not increase the nine-row denominator. It creates a closure prerequisite between independent responsibilities.

## 8. Invalidation consequence

For H2-E10, E13, E19, E31, E41, and E42:

- initial adoption must be included in the consuming representation node's PAIM where the literal is persisted or mechanically consumed;
- later changes are presumed `REPRESENTATION_PREREQUISITE` changes;
- H2-E41 may additionally create governance invalidation because registry membership/policy selection can change;
- affected tests must include old-literal/new-literal mixed-history and alias-collision attacks;
- historical event rows must not be reinterpreted merely because current canonical literals change.

## 9. Arithmetic and provenance unchanged

The canonical Phase-I denominator remains exactly nine:

1. H1-S01
2. H2-E10
3. H2-E13
4. H2-E19
5. H2-E28
6. H2-E31
7. H2-E41
8. H2-E42
9. H2-E44

H2-E45 remains excluded.

Historical-name provenance states remain:

- `HISTORICAL_NAME_VERIFIED`
- `GOVERNED_PRESENT_DAY_ADOPTION`

Mechanical coupling does not permit historical-name laundering.

## 10. Corrected provisional disposition

`PHASE-I NINE-ITEM RECONCILIATION REVIEW-CORRECTED / 9 OF 9 NAME OWNERS PRESERVED / SIX ENUM-SHAPED ROWS = MECHANICAL_UNTIL_PROVEN_NOMINAL / SIX REQUIRE NAME + REPRESENTATION-GOVERNANCE JOINT SIGN-OFF / THREE ROWS REMAIN NOMINAL OR DUAL-LAYER EXCEPTIONS / POST-ADOPTION LITERAL CHANGES PRESUMED REPRESENTATION-AFFECTING FOR THE SIX / H2-E45 REMAINS EXCLUDED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
