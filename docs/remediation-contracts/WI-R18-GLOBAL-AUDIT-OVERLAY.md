# WI-R18 — Global Audit Assurance Overlay

**Node:** R18  
**Base artifact:** `docs/remediation-contracts/WI-R18.md` at `80b6808a75679c0f8ec3bf4557380a2b2f08e1b7`  
**Overlay status:** OPEN  
**Implementation eligibility:** SUSPENDED  
**Formal assurance tier:** T1 RECOVERED  
**Auxiliary evidence state:** `CONFIRMED_BY_LIVE_DIALOGUE / CROSS_ARTIFACT_CORROBORATED_WHERE_CHECKED / BELOW_T4`

## 1. Purpose

This overlay makes R18's unusual evidence shape explicit without inventing a new assurance tier or overclaiming what live adversarial confirmation proves.

R18 was live-drafted and corrected rather than reconstructed from an earlier source exchange. The durable base artifact remains immutable evidence of that confirmed contract. This overlay records what remains unverified and what positive corroboration exists.

## 2. Historical correction integrity

### GA-R18-HIST-01 — sole valid historical finding

**Status:** CONFIRMED

The sole valid historical finding is:

`C4-F5 / MATERIAL`

The fabricated `C5-F3` value is retained only in correction history as evidence of the earlier register-integrity failure. It is not alternate traceability and must never be revived as a valid historical citation.

Later genuine confirmation does not retroactively legitimize the earlier false confirmation.

## 3. Open global-audit items

### GA-R18-01 — repository-backed defect-shape verification

**Status:** OPEN / REPOSITORY-EVIDENCE VERIFICATION REQUIRED

The R18 contract contains specific claims about live capability and Builder code behavior. The Phase B reviewer could not independently prove that every such premise came from direct repository inspection rather than architectural illustration.

**Implementation effect:** these code-level claims may not be used as independently verified migration/closure evidence until checked against pinned repository SHAs.

### GA-R18-02 — Capability Binding Snapshot / Validation Record exact field provenance

**Status:** OPEN / TARGETED T4 SCRUTINY

The underlying primitives are coherent and central to R18. Exact field enumerations may nevertheless reflect synthesis rather than historically frozen source detail.

**Implementation effect:** preserve the conservative identity requirements, but treat exact field lists as unproved historical form unless independently checked or explicitly adopted as corrected governance.

### GA-R18-03 — R18-A0/A1 exact-form provenance

**Status:** OPEN / LIGHTER PROVENANCE LIMITATION

R18's A0/A1 vocabularies are semantically tailored to capability-history/binding problems and show less evidence of template transfer than the R4–R6 A1 pattern. Exact historical form, labels, and `R18-M6+` discovered-child numbering remain unproved.

**Implementation effect:** no deletion or weakening is authorized by this uncertainty. Independent review or corrected-governance adoption is required before representing exact audit form as historically source-frozen.

### GA-R18-04 — DI-1 / BUILDER_EXECUTION exact activation/source provenance

**Status:** OPEN / PHASE G VALIDATION REQUIRED

The distinct `DI-1 / BUILDER_EXECUTION` scope is a mild positive provenance signal, but exact activation and scope still require the final DI consistency review.

**Implementation effect:** provider/account identity and no-cross-account-substitution semantics must be validated without silently broadening activation to unrelated scopes.

## 4. Positive evidence retained

### GA-R18-POS-01 — exact outcome-family corroboration with R20

R20 independently consumes the same R18 predispatch disposition family. This is genuine cross-artifact evidence for exact vocabulary/seam fidelity.

### GA-R18-POS-02 — DEPRECATED semantics corroboration with R20

R18 and R20 agree on the corrected DEPRECATED semantics:

- already-frozen bindings may normally continue by default;
- new selection is disallowed by default;
- explicit stronger policy may further restrict continuation.

This is strong seam-level corroboration because R20 itself required correction specifically to avoid redefining R18's policy.

### GA-R18-POS-03 — R6/R18/R20 ownership boundary corroboration

Separately reviewed artifacts consistently preserve:

- R6 = verifier sufficiency/current capability-claim truth;
- R18 = exact frozen capability binding and lifecycle eligibility;
- R20 = current consequential-boundary consumption of the complete predicate set.

### GA-R18-POS-04 — tailored A0/A1 vocabulary

R18-A0/A1 classification vocabularies are domain-specific rather than obvious copies of the generic R4/R5/R6 audit templates. This is positive evidence against simple pattern transfer, though not source-fidelity proof.

## 5. Assurance effect

R18's formal tier is T1 only at this normalization point.

The following must remain distinct:

- live adversarial confirmation;
- repository evidence;
- historical correction evidence;
- source fidelity;
- cross-artifact corroboration;
- material independence.

`ADVERSARIAL` does not mean `INDEPENDENT`.

The auxiliary descriptor `CONFIRMED_BY_LIVE_DIALOGUE / CROSS_ARTIFACT_CORROBORATED_WHERE_CHECKED / BELOW_T4` is informational only and may not be treated as a fifth tier or as implementation authority.

## 6. Closure rule

This overlay may close only when:

- GA-R18-01 is checked against pinned repository evidence or explicitly bounded as design-only evidence;
- GA-R18-02 receives materially independent scrutiny or exact fields are explicitly adopted as corrected governance;
- GA-R18-03 is independently reviewed or exact audit forms are explicitly adopted as corrected governance;
- GA-R18-04 clears Phase G scope/identity review;
- R18's R20-consumed disposition family and DEPRECATED semantics clear the global contradiction sweep;
- the R6×R18×R20 compound clears globally;
- any R18 amendment receives a new immutable SHA and all dependent checks are invalidated/rerun;
- the final assurance matrix records the actual supported formal tier without treating the auxiliary descriptor as a tier;
- materially independent T4 review occurs where required before implementation authority is restored.

## 7. References

- Phase B normalization: `docs/remediation-contracts/WI-R18-PHASE-B-ASSURANCE-NORMALIZATION.md`
- Governing audit: `docs/remediation-contracts/GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md`
- Global source-gap register: `docs/remediation-contracts/GLOBAL_SOURCE_GAP_REGISTER.md`
- Base R18 artifact: `docs/remediation-contracts/WI-R18.md` at `80b6808a75679c0f8ec3bf4557380a2b2f08e1b7`
- Fidelity notice preserving the fabricated-confirmation correction history: `docs/CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md`

## 8. Relay-contamination guard

This overlay terminates here. No conversational handoff text is part of the governing overlay.
