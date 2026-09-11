# WI-R18 — Phase B Assurance Normalization

**Node:** R18  
**Historical finding:** C4-F5 / MATERIAL  
**Artifact normalized:** `docs/remediation-contracts/WI-R18.md` at `80b6808a75679c0f8ec3bf4557380a2b2f08e1b7`  
**Audit phase:** Global Fidelity & Cross-Node Audit / Phase B  
**Implementation authority:** SUSPENDED  
**Formal assurance tier:** T1 RECOVERED  
**Auxiliary evidence state:** `CONFIRMED_BY_LIVE_DIALOGUE / CROSS_ARTIFACT_CORROBORATED_WHERE_CHECKED / BELOW_T4`

## 1. Why Phase B is structurally different from Phase A

R4–R6 were reconstructed artifacts that could, in principle, be compared against an earlier confirmation/source exchange. R18 was produced through live drafting, adversarial correction, and confirmation in the same development sequence that generated the durable artifact.

There is therefore no clean reconstruction-versus-original split for R18.

This difference must not be used to overclaim assurance. It means only that the evidence shape is different.

The frozen T1–T4 taxonomy remains governing. Phase B does **not** create a new formal tier outside that taxonomy.

Because R18 has a durable artifact, it satisfies T1. It does not currently establish T2 or T3 by the same evidence route used elsewhere, and it does not establish T4 because materially independent review is absent.

The auxiliary descriptor above records the real positive evidence without laundering it into a stronger formal tier.

## 2. Evidence type A — contract confirmation

**Assessment:** ACCEPTED / STRONG POSITIVE EVIDENCE

The R18 artifact preserves a concrete multi-round correction history rather than presenting a static design as if it had always been settled.

The confirmed correction sequence includes:

1. false v1.0 register presentation of R18 as already confirmed under fabricated `C5-F3`;
2. first real R18 draft from live repository evidence;
3. correction of historical finding to the already-frozen `C4-F5`;
4. restoration of DEPRECATED continuation semantics for already-frozen bindings;
5. removal of full `R6 CLOSED` as a local-closure prerequisite;
6. lifecycle-summary consistency correction;
7. explicit stronger-policy override fixture for DEPRECATED;
8. mechanical local-closure requirement for a real implemented/queryable R6 interface;
9. final confirmation after those amendments.

This is genuine confirmation evidence. It is not equivalent to independent source-fidelity verification or T4 independence.

## 3. Evidence type B — repository-backed design evidence

**Assessment:** UNRESOLVED / TARGETED VERIFICATION REQUIRED

The artifact makes code/repository claims including examples such as:

- mutable current capability state;
- boolean-style capability checks;
- Builder persistence of provider identity while later ticks may load a current provider driver;
- current-state helpers insufficient to preserve exact provider/account/verification identity.

The Phase B reviewer could not independently establish that every code-level premise reflects direct repository inspection rather than a plausible architectural illustration shaped to the R18 argument.

### R18-GAP-REPOSITORY-EVIDENCE

**Status:** OPEN / REPOSITORY-EVIDENCE VERIFICATION REQUIRED

This is distinct from contract confirmation quality. A genuinely negotiated contract may still rely on an inaccurately described live-code premise.

### Treatment

- Preserve the confirmed R18 contract.
- Do not represent all code-level defect-shape claims as independently repository-verified from this Phase B review.
- During global contradiction/implementation-preparation work, verify the named live-code premises against pinned repository SHAs before they are used as closure evidence or migration justification.

## 4. Evidence type C — historical correction evidence

**Assessment:** ACCEPTED / HIGH CONFIDENCE

The correction history is represented correctly.

`C5-F3` is not alternate traceability and not a prior legitimate historical finding. It is retained only as evidence of the register-integrity failure.

The sole valid historical finding for R18 is:

`C4-F5 / MATERIAL`

The later real confirmation does not retroactively make the earlier false confirmation true.

> **Post-hoc real confirmation cannot rewrite a prior fabricated confirmation into legitimate historical authority.**

## 5. Evidence type D — source fidelity and formal tier mapping

**Assessment:** PARTIALLY ACCEPTED / FORMAL-TAXONOMY CORRECTION REQUIRED

The reviewer correctly observed that T3's usual mechanism — adversarial comparison of an artifact against a distinct available source record — does not map cleanly onto R18's live-drafted production history.

However, the Global Audit explicitly requires R18 to be normalized into the frozen assurance hierarchy. Phase B therefore must not invent a fifth assurance tier.

### Formal mapping

- **T1 RECOVERED:** YES. A durable R18 artifact exists.
- **T2 TRANSCRIPTION_VERIFIED:** NOT ESTABLISHED as a distinct evidence class. There is no reconstruction/transcription step analogous to R4–R6 that was separately verified.
- **T3 SOURCE_FIDELITY_VERIFIED:** NOT ESTABLISHED. No separate source record has been adversarially compared against the artifact in a way satisfying the frozen T3 definition.
- **T4 INDEPENDENTLY_REDERIVED:** NO. The live drafting/review chain was not materially independent under R5.

### Auxiliary evidence descriptor

To avoid throwing away evidence that the formal tier labels do not fully describe, R18 carries the non-tier descriptor:

`CONFIRMED_BY_LIVE_DIALOGUE / CROSS_ARTIFACT_CORROBORATED_WHERE_CHECKED / BELOW_T4`

This descriptor is informational. It must never be treated as a fifth assurance tier or as implementation authority.

## 6. Evidence type E — cross-artifact corroboration

**Assessment:** ACCEPTED / GENUINE POSITIVE EVIDENCE

### GA-R18-POS-01 — exact disposition-family corroboration with R20

R18's predispatch result family is specifically corroborated by R20's independently reviewed consumption of the same R18 disposition family.

This supports the exact R18 outcome vocabulary more strongly than same-artifact internal consistency alone.

### GA-R18-POS-02 — DEPRECATED semantics corroboration with R20

R18's corrected DEPRECATED rule is corroborated by R20's amended consumer semantics:

- already-frozen bindings may normally continue by default;
- new selection is disallowed by default;
- explicit stronger policy may further restrict continuation.

This is particularly valuable because the R20 review itself surfaced and corrected an earlier risk of over-strengthening DEPRECATED semantics.

### GA-R18-POS-03 — R6/R18/R20 ownership separation

The ownership boundary is consistent across separately reviewed artifacts:

- R6 establishes verifier sufficiency/current capability claim truth;
- R18 preserves and revalidates the exact frozen capability binding;
- R20 determines whether the complete current boundary predicate may be consumed now.

Cross-artifact agreement does not promote R18 to T3/T4, but it is genuine seam-level evidence.

## 7. Evidence type F — material independence

**Assessment:** ACCEPTED / BELOW T4

The fact that R18 underwent adversarial correction does not establish material independence.

No evidence currently demonstrates that R18's original live confirmation was performed by a materially independent reviewer satisfying the frozen R5 standard.

`ADVERSARIAL` must not be used as a synonym for `INDEPENDENT`.

R18 remains below T4.

## 8. Highest-risk item normalization

### 8.1 DEPRECATED semantics

**Status:** STRONG POSITIVE CORROBORATION / STILL BELOW T3 AS NODE-WIDE CLAIM

The exact corrected semantics are supported by both R18's amendment history and R20's matching consumer behavior.

### 8.2 Exact R18 outcome family

**Status:** POSITIVELY CORROBORATED / MODERATE-GOOD CONFIDENCE

The exact family receives real support from R20's independent citation/consumption of the R18 dispositions.

### 8.3 Capability Binding Snapshot and Validation Record exact field lists

**Status:** OPEN / TARGETED T4 SCRUTINY

### R18-GAP-BINDING-FIELD-PROVENANCE

The primitives are architecturally coherent and central to R18's mission. The exact recovered field enumerations in the Capability Binding Snapshot and Capability Binding Validation Record may nevertheless contain synthesis that cannot be distinguished from source-frozen detail by this review.

**Treatment:** preserve the conservative primitives; do not claim the exact lists are independently source-fidelity proven; include exact field provenance in T4 review or explicitly adopt final fields as corrected governance.

### 8.4 R6/R18/R20 ownership boundaries

**Status:** POSITIVELY CORROBORATED

No ownership laundering or semantic collapse is currently demonstrated.

### 8.5 DI-1 scope activation

**Status:** MILD POSITIVE PROVENANCE SIGNAL / GLOBAL DI REVIEW STILL REQUIRED

The named scope `DI-1 / BUILDER_EXECUTION` is semantically tailored to R18 rather than merely reusing another node's scope label. This is weaker than source proof but somewhat less consistent with pure template transfer.

The final Phase G DI matrix must still validate activation, exact scope, provider/account identity, and non-broadening.

### 8.6 R18-A0 / R18-A1 provenance

**Status:** OPEN / LIGHTER PROVENANCE LIMITATION THAN R4–R6 A1 PATTERN

R18's audit vocabularies are domain-specific to historical capability authority and exact binding consumption. They do not simply mirror the generic R4/R5/R6 A1 classification shapes.

This is positive evidence against straightforward template transfer, but not T3 proof.

### R18-GAP-AUDIT-FORM-PROVENANCE

Exact historical source provenance of R18-A0/A1 names, classification families, and `R18-M6+` audit-discovered child numbering remains unproved and should receive independent scrutiny if treated as historically frozen rather than corrected governance.

This gap is **not** classified as `SOURCE_EXHAUSTED` from the current Phase B evidence.

## 9. Rejected content

None.

No R18 contract rule was identified as confidently false during Phase B normalization.

## 10. Assurance result

The normalized R18 state is:

**Formal assurance tier:** `T1 RECOVERED`

**Auxiliary evidence descriptor:**

`CONFIRMED_BY_LIVE_DIALOGUE / CROSS_ARTIFACT_CORROBORATED_WHERE_CHECKED / BELOW_T4`

Additional conclusions:

- real adversarial contract confirmation occurred;
- historical correction provenance is strong;
- R20 materially corroborates the exact outcome family and DEPRECATED semantics;
- R6/R18/R20 ownership boundaries are positively corroborated;
- repository-backed defect-shape claims require independent code verification;
- exact Binding Snapshot/Validation Record field provenance remains open;
- R18-A0/A1 exact-form provenance remains open but carries less template-transfer concern than R4–R6;
- DI-1/BUILDER_EXECUTION is a mild positive provenance signal but remains subject to Phase G;
- T3 is not established;
- T4 is not established;
- implementation authority remains suspended.

## 11. Artifact handling

`WI-R18.md` is not rewritten merely to insert assurance annotations.

This Phase B record and the companion global-audit overlay carry the normalized assurance state while preserving the exact immutable R18 artifact that was confirmed.

If later source/repository verification or independent review requires substantive amendment of R18, the amendment receives a new immutable SHA and every dependent edge/compound/chain result must be invalidated and rerun under the governing Global Audit protocol.

## 12. Mandatory carry-forward

Final Global Audit/T4 work must specifically evaluate:

1. repository truth behind R18's named live-code defect claims;
2. exact Capability Binding Snapshot field provenance;
3. exact Capability Binding Validation Record field provenance;
4. R18-A0/A1 exact-form provenance and any audit-child numbering treated as historically frozen;
5. exact R18 outcome-family consumption in R20;
6. DEPRECATED semantics in R18 and R20;
7. R6/R18/R20 ownership boundaries;
8. `DI-1 / BUILDER_EXECUTION` activation and scope;
9. whether any additional evidence supports a formal tier above T1;
10. materially independent T4 review before implementation authority is restored where R18 participates in high-risk authority compounds.

## 13. Relay-contamination guard

This normalization record terminates here. No conversational handoff text is part of the record.
