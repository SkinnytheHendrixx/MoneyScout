# WI-R5 — Independent Confirmation for Material Conclusions

**Normalized node:** R5  
**Historical finding:** C1-F4  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS`  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

R5 recovery has begun from the confirmed adversarial-review record available in project context. The recoverable source is sufficient to preserve the normalized root, the canonical confirmation states, the materiality rule, the anti-self-certification invariant, legacy treatment, compound boundaries, and the independent-review requirement.

However, the exact original R5 migration-child matrix, complete acceptance-fixture enumeration, and complete numbered closure-evidence list are not presently recoverable from the accessible source without invention. Under the fidelity-recovery discipline, those details are not being regenerated from the compressed register or inferred from neighboring nodes.

This artifact is therefore intentionally **not** a full recovered candidate yet.

## 1. Frozen root and mission

Historical finding **C1-F4 / MATERIAL** established that a model-generated material conclusion could effectively certify its own correctness/closure without materially independent confirmation.

R5 exists to prevent self-certification of material conclusions.

> **Core rule:** a model-generated material conclusion may propose closure, but it may not be the sole evidence that closes itself.

The requirement is about confirmation authority, not merely running the same reasoning twice.

## 2. Materiality rule

The confirmed R5 contract defaults conclusions to **material** unless they are explicitly classified as non-material under a bounded rule.

A material conclusion includes one whose correctness can materially affect, for example:

- whether an Opportunity/Bet progresses;
- whether a Product/Architecture is accepted;
- whether a remediation finding closes;
- whether a consequential action becomes eligible;
- whether commercial/economic authority is granted or retained;
- whether a Human Action or successor obligation is considered satisfied.

The implementation may define narrower materiality categories, but it may not use ambiguity to downgrade material work into a self-certifiable path.

## 3. Candidate versus confirmed conclusion

R5 requires a durable distinction between a proposed/candidate material conclusion and a confirmed one.

A model-generated result can create or update the candidate conclusion. That is not enough to close the underlying material question.

The confirmed outcome family is:

- `CONFIRMED`
- `CHALLENGED`
- `INCONCLUSIVE`

Only `CONFIRMED` may satisfy the independent-confirmation requirement for material closure.

`CHALLENGED` and `INCONCLUSIVE` remain unresolved states and must not be normalized into success.

## 4. Independent confirmation source

Independent confirmation must come from either:

1. a materially independent model/provider family or reviewer source; or
2. a deterministic authoritative verifier when the proposition is fully reducible to deterministic verification.

The following do **not** create sufficient independence merely by themselves:

- a second prompt to the same model;
- a different persona/system prompt on the same model;
- a second turn in the same reasoning chain;
- self-reflection by the original conclusion-producing agent;
- restating the candidate conclusion in another format.

> **Independence is about a materially independent source of judgment/evidence, not cosmetic prompt variation.**

## 5. Deterministic-verifier exception

A deterministic verifier may replace cross-model judgment only when the material proposition is actually reducible to an authoritative deterministic check.

Examples may include exact schema/hash/identity/equality/constraint checks where the truth condition is fully mechanical.

A deterministic check must not be used to certify a proposition that still contains material judgment, interpretation, economic assessment, policy interpretation, or uncertain semantic equivalence.

If material judgment remains, independent model/provider review is still required.

## 6. Durable Resolution Confirmation Record

R5 requires a durable Resolution Confirmation Record or equivalent object tying the confirmation to the exact material conclusion being reviewed.

The confirmed contract requires enough identity to establish, at minimum:

- exact candidate/material conclusion identity;
- originating actor/source;
- materiality classification;
- independent verifier/reviewer identity and independence basis;
- confirmation outcome (`CONFIRMED`, `CHALLENGED`, `INCONCLUSIVE`);
- evidence/reasoning reference sufficient for later audit;
- timestamps/version/provenance;
- exact lineage/context needed to prove the confirmation applies to the conclusion being closed.

The physical schema is not frozen; the semantic linkage is.

## 7. Legacy material conclusions

Legacy material conclusions that were previously treated as closed without independently provable confirmation must not be silently grandfathered as confirmed.

The confirmed legacy state is:

`LEGACY_UNCONFIRMED`

A legacy conclusion may be reconstructed as confirmed only when durable evidence proves that an independent confirmation meeting the R5 contract actually occurred.

Otherwise it remains `LEGACY_UNCONFIRMED` until re-reviewed through the governed confirmation path.

## 8. CHALLENGED / INCONCLUSIVE ownership

`CHALLENGED` and `INCONCLUSIVE` do not close the material question.

Where further action is needed, the unresolved state must become an owned corrective obligation rather than a passive blocked flag.

R11 owns the durable successor/disposition mechanics.

> **Independent review can reject or fail to resolve a conclusion; that uncertainty must remain explicit and owned.**

## 9. R5 × R11 boundary

R5 owns whether a material conclusion has been independently confirmed.

R11 owns the executable corrective path after `CHALLENGED` or `INCONCLUSIVE` where additional work is required.

R5 must not convert challenge/inconclusive results directly into a convenient successor without the governed R11 path.

R11 must not treat the existence of a successor obligation as proof that the original conclusion was confirmed.

## 10. R4 × R5 boundary

R4 exact lineage and R5 independent confirmation are parallel requirements.

Correct lineage does not make a material conclusion independently confirmed.

Independent confirmation does not repair missing/wrong Evaluation Cycle lineage.

A material conclusion about an artifact/decision must be confirmed against the exact lineage/context it actually belongs to, not whichever current object looks equivalent later.

## 11. R3 × R5 boundary

Evidence freshness and independent confirmation are distinct.

A reviewer can independently agree with a conclusion that is still based on stale/inapplicable evidence; that does not make the conclusion safe.

Likewise, fresh evidence does not remove the need for independent confirmation when the resulting conclusion is material.

R3 and R5 must both hold where both apply.

## 12. R5 × R20 boundary

R5 confirmation is not perpetual boundary authority.

R20 may require the material conclusion to remain currently eligible/consistent at the consequential boundary where it is consumed.

R5 answers whether the conclusion obtained the required independent confirmation.

R20 answers whether that confirmed conclusion may be consumed **now**, together with current lineage/lifecycle/resource/evidence/capability predicates.

## 13. R5 × R7 secondary-work requirement

Independent confirmation is safety-required work, but it is still work.

Where reviewer/model/verifier activity consumes scarce cash, entitlement, quota, provider capacity, or concurrency, that confirmation work must itself consume R7 resource authority.

The fact that work exists to improve safety does not exempt it from governed resource admission.

## 14. Confirmed acceptance semantics recoverable from source

### A. Self-confirmation forbidden

Model A produces a material candidate conclusion and then reviews its own conclusion in a second prompt/turn/persona.

Expected: material conclusion remains unconfirmed; same-model self-review does not satisfy independence.

### B. Independent model/provider confirmation

Model/provider family A produces the candidate; materially independent reviewer B evaluates the exact candidate/context and returns `CONFIRMED`.

Expected: independent-confirmation requirement may be satisfied.

### C. Challenge remains unresolved

Independent reviewer returns `CHALLENGED`.

Expected: underlying material conclusion does not close; corrective ownership is required where further action is needed.

### D. Inconclusive remains unresolved

Independent reviewer returns `INCONCLUSIVE`.

Expected: no closure; uncertainty remains explicit and owned.

### E. Deterministic authoritative verifier

Material proposition is fully reducible to a deterministic authoritative check.

Expected: deterministic verifier may satisfy confirmation without a second model if and only if no material judgment remains.

### F. Deterministic verifier misuse

Proposition still requires material interpretation/judgment, but implementation tries to certify it with a narrow mechanical check.

Expected: confirmation fails; deterministic check cannot launder judgment into mechanical certainty.

### G. Legacy unconfirmed

Legacy material conclusion lacks durable proof of qualifying independent confirmation.

Expected: `LEGACY_UNCONFIRMED`, not `CONFIRMED`.

### H. Exact-lineage confirmation

Candidate conclusion was generated for lineage/context A; current context B exists later.

Expected: confirmation must bind to A's exact conclusion/context. Review of B does not retroactively confirm A.

### I. Freshness/confirmation independence

Independent reviewer confirms a conclusion whose current-state evidence is stale under R3.

Expected: R5 may record confirmation, but stale R3 predicate still prevents current-condition eligibility where required.

### J. Resource-governed confirmation burst

Many material conclusions require independent review concurrently.

Expected: reviewer/provider usage remains governed by R7; safety work does not bypass scarce-resource limits.

## 15. Design Inputs

The recoverable R5 source reviewed the Design Input registry through DI-2.

### DI-1 — provider/account identity plurality

**Disposition:** REVIEWED / NOT ACTIVATED GENERICALLY.

R5 reviewer independence may include provider/model-family identity, but that is not itself authorization to substitute provider accounts for execution. If an R5 implementation surface creates a true multi-account/provider identity authority problem, that exact scope activates DI-1 separately.

### DI-2 — outbound payment reversal execution

**Disposition:** REVIEWED / NOT ACTIVATED.

R5 evaluates/records confirmation of material conclusions; it does not itself execute refunds, voids, cancellations, or reversals.

## 16. Dependency classes recoverable from source

### START

R5 can begin once the material-conclusion surfaces to be confirmed are identifiable. It does not require R7/R11/R20 global closure merely to implement its own confirmation representation and local consumers.

### LOCAL CLOSURE

The recoverable R5 contract requires at minimum:

- durable candidate-versus-confirmed conclusion semantics;
- canonical `CONFIRMED / CHALLENGED / INCONCLUSIVE` outcomes;
- materiality default implemented;
- materially independent reviewer-source rule implemented;
- deterministic-verifier exception implemented narrowly;
- durable Resolution Confirmation Record implemented;
- `LEGACY_UNCONFIRMED` migration behavior implemented;
- challenged/inconclusive outcomes do not close material work;
- every known R5 consumer migrated;
- iterative semantic sibling sweep empty;
- independent material closure review.

The exact original R5 migration matrix and complete closure-evidence enumeration remain unrecovered, so this section is insufficient to claim local closure or artifact fidelity.

### E2E CERTIFICATION

Recovered required compounds include:

- R4×R5;
- R3×R5;
- R5×R11;
- R5×R20;
- R5×R7 for scarce confirmation work.

## 17. Source gap blocking full reconstruction

The following exact original R5 content remains unrecovered and blocks promotion to `RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION`:

1. the literal R5-M1... migration-child labels and exact surface assignments;
2. the exact known-consumer matrix frozen during R5 confirmation;
3. the complete original acceptance-fixture grouping/order and any concrete examples not captured above;
4. the complete numbered closure-evidence list;
5. the exact sibling-sweep numbering convention for newly discovered R5 defects;
6. any rejected alternatives/amendments whose exact wording was frozen but is not represented in the recoverable source above.

These details must be recovered from the original WI-R5 adversarial-confirmation record rather than regenerated from the compressed v1.0 matrix or current code.

## 18. Recovery gate

R5 remains `FIDELITY_SOURCE_INCOMPLETE` until the source gap in §17 is closed.

Until then:

- do not call this the full R5 contract;
- do not ask for final fidelity verification;
- do not begin R6 recovery in the serialized recovery queue;
- do not derive implementation batches from this partial artifact;
- preserve the source gap as an owned recovery obligation.

> **The right failure mode is explicit incompleteness, not a plausible-looking reconstruction that silently drops the exact migration and closure obligations.**
