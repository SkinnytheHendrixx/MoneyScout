# Amendment Package 01 — Adversarial Review Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL PACKAGE FREEZE  
**Implementation authority:** SUSPENDED  
**Amendment landing authority:** SUSPENDED  
**Base package:** `AMENDMENT_PACKAGE_01_R17_R18_R19_EXACT_COMMERCIAL_BINDING_COMPOSITION_REVIEW_DRAFT.md`  
**Base package commit:** `b758eb2ef37dd584d633432f9620ff955c54ee1e`  
**Frozen register blob:** `b7d163024464a6c9f069eef68b17d1b54a4e8f71`

## 1. Purpose

This overlay records two adversarial-review corrections to Amendment Package 01 before PRE-BCT. Neither correction changes the core semantic propositions of `RD-C-R17-R18` or `RD-C-R19-R18`. Both narrow ambiguity in how the package must be interpreted and invalidated.

## 2. AP01-R1-01 — Clarify checkout/payment configuration clause

### Finding

Base §4.2 item 7 states:

> where checkout/payment configuration identity materially determines provider/account execution authority, the referenced R18 binding must be compatible with that exact R17 checkout/payment configuration rather than with a current replacement.

The substantive intent is correct, but the wording can be misread as this amendment defining the still-unresolved checkout/payment configuration compatibility semantics owned by `H1-S09`.

That is not the amendment's role.

### Correction

Append the following clarification immediately after §4.2 item 7:

> **This clause does not define what checkout/payment configuration compatibility means. That definition remains `H1-S09`'s unresolved proposition. This clause states only that whatever the eventual compatibility rule is, it must be evaluated against the exact historical configuration rather than a current replacement.**

### Effect

The amendment continues to impose only a no-substitution / exact-historical-reference invariant.

It does **not**:

- resolve `H1-S09`;
- create a new checkout-config semantic owner;
- define provider-specific checkout mappings;
- invent a historical representation form;
- close F07-04 or any provider-domain blocker.

`H1-S09` remains independently lifecycle-bearing.

## 3. AP01-R1-02 — F07-18 recheck is unconditional for Amendment B

### Finding

Base Amendment B currently treats F07-18 conditionally in two places:

- semantic/certification fan-out: `F07-18 only if the amended R19 binding segment changes the exact complete-lineage evidence consumed by R20 Boundary Decision correspondence`;
- PAIM-B: `F07-18 if its evidence basis changes`.

That conditional treatment is too weak.

`F07-18` is specifically the exact complete R19 Commercial Authority Lineage Reference ↔ exact R20 Boundary Decision correspondence. Amendment B §§5.1–5.3 changes the semantic completeness criterion of the R19 lineage object itself by making the exact materially-consumed R18 commercial-payment binding or binding set a required lineage dimension.

Therefore the evidence basis of F07-18 necessarily changes whenever Amendment B lands. This is not contingent on a later implementation choice.

### Correction — semantic/certification fan-out

Replace the conditional F07-18 fan-out entry with:

- `F07-18` — **UNCONDITIONAL** evidence/certification recheck because Amendment B changes what counts as the exact complete R19 lineage object consumed atomically by R20.

This remains distinct from F07-05:

- `F07-05` tests R18 Binding ↔ R19 Lineage correspondence;
- `F07-18` tests exact complete R19 Lineage ↔ exact R20 Boundary Decision atomic correspondence.

Both must be rechecked. One cannot substitute for the other.

### Correction — PAIM-B

Amendment B PAIM-B must include, at minimum:

- affected Phase-C relationship classification;
- `F07-05`;
- `F07-18` **unconditionally**;
- G2-01 if the formal provider/account lineage proposition changes its certified evidence basis;
- XPI-04 end-to-end provider-path certification;
- J/R20 evidence only if the amendment changes additional J/R20 propositions beyond the already-mandatory F07-18 complete-lineage correspondence recheck.

The phrase `F07-18 if its evidence basis changes` is superseded by this overlay.

### Required F07-18 recheck attack

At minimum, the F07-18 recheck must prove that an exact R20 Boundary Decision cannot atomically reference or validate an R19 lineage that omits, substitutes, reconstructs from current state, or otherwise mismatches any exact R18 commercial-payment binding member materially required by the lineage under Amendment B.

For an arbitrary-N required binding set `B1...BN`, the attack must include a mixed-history case where the R19 lineage is otherwise correct but one member is omitted or replaced by a current/wrong binding, and prove that the corresponding R20 Boundary Decision cannot still satisfy exact complete-lineage correspondence.

## 4. PRE-BCT consequence

These corrections must be incorporated into the reviewed package before `PRE_BCT_PASSED` can be asserted.

PRE-BCT must now explicitly confirm:

1. the checkout/payment clause is only an exact-history/no-substitution rule and does not launder `H1-S09` into a resolved proposition;
2. Amendment B unconditionally invalidates/rechecks the F07-18 evidence basis;
3. F07-05 and F07-18 remain distinct lifecycle-bearing rechecks;
4. arbitrary-N R18 binding-set completeness propagates into the exact R19↔R20 atomic correspondence tested by F07-18.

## 5. Denominators and ownership

No phase denominator changes.

No new primary finding is created.

No new authority object is created.

Canonical ownership remains unchanged:

- R17 owns Offer/Grant commercial authority;
- R18 owns exact capability binding and binding validation;
- R19 owns complete frozen commercial lineage;
- R20 owns exact boundary-time consumption/decision;
- `H1-S09` owns unresolved checkout-provider mapping/compatibility semantics;
- `F07-05` owns R18 Binding ↔ R19 Lineage representability;
- `F07-18` owns exact complete R19 Lineage ↔ exact R20 Boundary Decision correspondence.

## 6. Review disposition

Accepted corrections:

- **AP01-R1-01:** checkout-config disclaimer required;
- **AP01-R1-02:** F07-18 recheck unconditional for Amendment B.

All other adversarial questions reviewed in this round remain unchanged by this overlay.

Package status remains:

**REVIEW DRAFT / PRE-BCT NOT YET PASSED / IMPLEMENTATION AUTHORITY SUSPENDED / AMENDMENT LANDING AUTHORITY SUSPENDED**
