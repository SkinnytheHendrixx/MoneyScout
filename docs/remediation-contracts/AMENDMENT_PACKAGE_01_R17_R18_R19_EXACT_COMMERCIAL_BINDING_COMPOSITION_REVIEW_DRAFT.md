# Amendment Package 01 — R17/R18/R19 Exact Commercial-Binding Composition

**Status:** REVIEW DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Implementation authority:** SUSPENDED  
**Amendment landing authority:** SUSPENDED  
**Package class:** SEMANTIC-RULE-DEFINITION / PRE-IMPLEMENTATION  
**Frozen register dependency:** `GLOBAL_REMEDIATION_REGISTER_FREEZE_ASSEMBLY.json` blob `b7d163024464a6c9f069eef68b17d1b54a4e8f71`  
**Frozen register commit:** `f0214a08b3098b71127add27478932e06f8c4e1e`  
**Canonical freeze artifact commit:** `f004371370545cdc3de9f6c386f2d77140749917`

## 1. Purpose

This package proposes the first governed semantic amendments under the frozen remediation register. It does not modify implementation, schema, migrations, runtime code, canonical findings, or certifications.

It addresses exactly two frozen Phase-C rule-definition nodes:

1. `RD-C-R17-R18` — R17 Offer/Grant ↔ R18 exact commercial-payment capability binding;
2. `RD-C-R19-R18` — R19 complete Commercial Authority Lineage Reference ↔ R18 exact commercial-payment capability binding.

These nodes are packaged together because both consume the same exact commercial-payment binding identity and because independent wording could otherwise create contradictory provider/account or binding-cardinality semantics. They remain independently closable propositions.

The package does **not** close either node. It defines candidate amendment contracts, PRE-BCT attacks, PAIM derivation scope, and landing prerequisites for adversarial review.

## 2. Source constraints preserved

### 2.1 R17 already owns the exact commercial authority object

R17 requires an immutable Offer Version and `CUSTOMER_CHARGING` Grant that preserve exact provider and exact provider-account scope. The Grant authorizes execution of the exact commercial object and does not authorize arbitrary current Asset monetization state.

R17 also already states that a runtime may not silently charge through a different provider/account merely because another path is operationally available, and that R20 separately determines whether the exact R17 authority is consumable now.

This amendment must not redefine those R17 semantics.

### 2.2 R18 already owns exact capability binding and predispatch eligibility

R18 requires an immutable Capability Binding Snapshot tied to the exact provider/account/verification authority consumed by an execution. A logical capability key, provider string, or current usable capability is not a substitute for the frozen binding.

R18 also already states that revalidation may confirm or reject an existing binding but may not replace the binding, and that R20 consumes the applicable R18 result as one component of the complete boundary predicate set.

This amendment must not redefine R18 capability lifecycle, R6 verification semantics, R8 external truth, or R20 final boundary authority.

### 2.3 R19 already owns complete frozen commercial lineage

R19 requires a Commercial Authority Lineage Reference frozen before consequential commercial dispatch. That lineage must preserve exact R17 Offer/Grant authority, exact provider/account execution identity, exact R8 execution identity where dispatch occurs, and downstream financial evidence/reconciliation.

R19 expressly distinguishes a traversable path from a frozen composed authority and prohibits reconstruction from current mutable state.

This amendment must not turn R19 into the owner of R18 capability eligibility.

## 3. Package-level ownership rule

The package introduces no new primary finding and no new independent authority object merely to connect the nodes.

Canonical ownership remains:

- R17 owns Offer Version / `CUSTOMER_CHARGING` Grant commercial authority;
- R18 owns Capability Binding Snapshot / binding validation and eligibility;
- R19 owns the complete Commercial Authority Lineage Reference;
- R20 owns final boundary-time consumption of the composed predicates.

The cross-node amendment owns only the **composition invariant**: when these objects participate in the same consequential commercial execution path, their exact identities must describe the same historical path.

No node may satisfy this composition rule by copying a neighboring node's current projection into its own record.

## 4. Candidate Amendment A — `RD-C-R17-R18`

### 4.1 Proposed normative proposition

For every consequential `CUSTOMER_CHARGING` execution whose commercial execution path depends on an R18-governed commercial-payment capability, the exact R17 Offer Version / charging Grant and the exact R18 Capability Binding Snapshot consumed by that execution must compose into one immutable commercial execution authority path.

The composition is valid only when all applicable equality and reference conditions below hold.

### 4.2 Required equality and reference conditions

For the commercial-payment scope consumed by the action:

1. the R17 Grant references one exact Offer Version;
2. the execution references the exact R17 Grant actually authorizing that action;
3. the execution references the exact R18 Capability Binding Snapshot actually frozen for that commercial-payment operation;
4. the R17 provider identity equals the R18 bound provider identity;
5. the R17 exact provider-account identity equals the R18 bound provider-account identity;
6. the R18 allowed operation scope includes the exact commercial action authorized by the R17 Grant;
7. where checkout/payment configuration identity materially determines provider/account execution authority, the referenced R18 binding must be compatible with that exact R17 checkout/payment configuration rather than with a current replacement;
8. the R18 validation consumed at the consequential boundary refers to that same frozen binding identity, not merely the same capability key or provider family;
9. the composition must remain attributable to the exact execution / attempt governed by R8 where an external boundary is crossed.

Provider equality without provider-account equality is insufficient where account identity is materially relevant.

Capability-key equality without exact binding equality is insufficient.

Offer/Grant validity without R18 binding validity is insufficient.

R18 binding validity without the exact R17 Offer/Grant authority is insufficient.

### 4.3 No-substitution invariant

A current or healthier capability binding `B2` must never satisfy an execution authorized and frozen for `B1` merely because `B2` provides the same logical capability or uses the same provider family.

Likewise, a current Offer/Grant `O2/G2` must never satisfy an execution whose frozen binding and preparation were authorized under `O1/G1` merely because `O2/G2` is now current.

If a governed successor path is required, it receives its own exact R17 and R18 authority objects under the ordinary R7/R8/R20 gates.

### 4.4 Boundary-time consequence

Before a not-yet-crossed consequential commercial boundary, any unresolved mismatch, missing exact identity, unknown account continuity, stale binding substitution, or operation-scope mismatch causes the composition predicate to fail closed for that action.

This amendment does not itself authorize or deny final dispatch. R20 owns the final boundary decision and must consume the exact composed R17/R18 evidence.

### 4.5 Post-boundary truth preservation

If the external boundary already crossed or may have crossed, later discovery of an R17/R18 mismatch must not rewrite the operation as unexecuted, replace the historical binding with a current one, or retroactively manufacture authorization.

R8 preserves external truth. R17 and R18 preserve the exact authority objects that actually existed. R11/R20/financial-safety governance owns corrective disposition.

### 4.6 Closure predicate for `RD-C-R17-R18`

`RD-C-R17-R18` may close only when canonical R17/R18 authority text contains an unambiguous same-path composition invariant equivalent to §§4.1–4.5, PRE-BCT passes, every changed/new Phase-C edge is classified, the frozen register fan-out to F07-04 is updated as required, dependent certifications are invalidated/rechecked under the frozen lifecycle, and the final recheck proves mixed-history substitution is rejected.

Representation work is not required to *define* this semantic rule, but implementation certification cannot later claim the rule satisfied until the exact relationship is representable and enforced.

## 5. Candidate Amendment B — `RD-C-R19-R18`

### 5.1 Proposed normative proposition

Every R19 Commercial Authority Lineage Reference for a consequential commercial provider execution must bind the exact R18 commercial-payment Capability Binding Snapshot or exact required set of R18 binding snapshots actually consumed by that same execution path.

R19 must not represent provider/account commercial execution merely as a provider string, logical capability key, current capability projection, or reconstructable join.

### 5.2 Required lineage conditions

For each R18-governed commercial-payment capability actually consumed by the commercial execution:

1. the Commercial Authority Lineage Reference contains an immutable reference to the exact R18 binding ID/fingerprint;
2. the lineage's provider identity equals the exact R18 bound provider;
3. the lineage's provider-account identity equals the exact R18 bound provider-account identity;
4. the referenced R18 binding is associated with the same exact execution/attempt represented in the R19 lineage where R8 identity applies;
5. the lineage's R17 Offer Version / charging Grant segment and its R18 binding segment satisfy the separately governed `RD-C-R17-R18` composition invariant;
6. the R19 lineage preserves historical binding identity even if a later current capability binding replaces it;
7. the R19 lineage does not infer historical binding identity from current environment configuration, provider registration, current capability rows, or current credentials.

### 5.3 Binding-set cardinality

R19 must not assume that one execution can consume only one exact R18 binding globally.

Where a consequential commercial execution legitimately requires multiple exact R18 bindings for distinct capability/operation scopes, R19 must preserve the exact required binding set keyed or otherwise disambiguated by the scope actually consumed.

The acceptance rule is arbitrary-N: if the execution requires exact bindings `B1...BN`, every required binding remains independently addressable and attributable, and no current/default binding may substitute for any member of that set.

This does not require every unrelated binding on the execution to become part of the commercial lineage. The lineage binds the exact R18 binding set materially consumed by that commercial authority path.

### 5.4 Validation-record relationship

Where R18 produces a durable Capability Binding Validation Record, R19 must preserve enough exact reference/provenance to prove which binding validation was consumed at the consequential commercial boundary without treating a later validation record as historical replacement.

The exact historical representation of the validation record remains governed by H2-E34 and related R18 representation work. This semantic amendment does not invent that missing historical form.

### 5.5 Post-hoc reconstruction prohibition

A later-valid R18 binding or later-repaired lineage cannot retroactively legitimize an earlier commercial effect that lacked the required exact binding composition at execution time.

Deterministic historical reconstruction may improve attribution only where durable evidence uniquely proves the original exact binding. It may not use current capability state to manufacture historical authority.

### 5.6 Closure predicate for `RD-C-R19-R18`

`RD-C-R19-R18` may close only when canonical R19/R18 authority text contains an unambiguous exact-binding lineage invariant equivalent to §§5.1–5.5, PRE-BCT passes, every changed/new Phase-C edge is classified, the frozen register fan-out to F07-05 is updated as required, dependent certifications are invalidated/rechecked under the frozen lifecycle, and final mixed-history/arbitrary-N rechecks prove current-binding and wrong-binding substitution cannot satisfy lineage.

## 6. Composition between Amendment A and Amendment B

The two amendments must compose in this direction:

`R17 exact Offer/Grant authority + R18 exact commercial-payment Binding → same-path R17/R18 composition → R19 frozen lineage records that exact composed segment`

R19 does not create the R17/R18 equality after the fact. The equality must already be true in the authority path being frozen.

R17/R18 composition does not by itself prove complete R19 lineage. R19 still independently owns upstream build/artifact/offer lineage, customer contract/session/transaction identity, R8 execution identity, and downstream R15/R16 attribution.

Closing Amendment A is not evidence that Amendment B is closed.

Closing Amendment B is not evidence that F07-04, F07-05, REP-R17, REP-R18, REP-R19, G2-01, or end-to-end XPI-04 is closed.

## 7. PRE-BCT attack set

Both amendments must survive the full standing BCT. The following attacks are mandatory additions for this package.

### A01 — same capability key, different provider account

`O1/G1` authorizes provider/account `P/A1`; execution freezes R18 binding `B2 = P/A2` under the same capability key. Composition must fail.

### A02 — same provider, unknown account continuity

R17 says provider `P`, account `A1`; R18 proves provider `P` but account identity is unknown. Provider equality must not satisfy composition.

### A03 — current binding substitution

Execution froze `B1`; current capability projection now points to `B2`. Querying current state must not make the execution/lineage appear bound to `B2`.

### A04 — current Offer substitution

Execution was authorized under `O1/G1`; `O2/G2` is now current. Current Offer/Grant must not be paired with historical `B1` unless a governed successor path explicitly created that combination.

### A05 — wrong execution binding

Two concurrent commercial executions share the same Offer and provider account but freeze distinct binding IDs/verification histories. R19 must not attach execution X1 to X2's binding merely because provider/account fields match.

### A06 — one execution, multiple required bindings

Execution X legitimately consumes two exact R18 bindings for distinct scopes. R19 must preserve both required members and reject a lineage that records only one or replaces either with a current binding.

### A07 — mixed R17/R18/R19 path

R17 `O1/G1` and R18 `B1` are individually valid; R19 Lineage Reference belongs to `O2/G2/B2`. Individually valid objects from different historical paths must fail composition.

### A08 — late binding repair

Commercial effect occurred without provable exact R18 binding. A later current binding or newly-created lineage reference must not retroactively make the original effect authorized.

### A09 — post-boundary mismatch

Boundary may have crossed under `B1`; subsequent validation finds B1 revoked or discovers a mismatch. System must preserve R8 external truth and historical B1 identity rather than replay through B2 or rewrite the attempt as never dispatched.

### A10 — provider-family equivalence

Provider/account `B` is operationally equivalent to `A` or belongs to the same provider family. Equivalence alone must not satisfy exact binding equality or authorize in-place substitution.

### A11 — validation-record substitution

Boundary consumed validation record `V1` for binding `B1`; a later `V2` exists. R19/R20 evidence must not silently cite `V2` as though it were the boundary-time validation.

## 8. Standing BCT application

PRE-BCT must also explicitly answer:

1. **Upstream semantic preservation:** Do the amendments leave R17 Offer/Grant ownership, R18 binding ownership, R19 lineage ownership, R8 external truth, and R20 final boundary authority intact?
2. **Historical-path equality:** Can individually valid R17/R18/R19 objects from different histories still compose accidentally?
3. **Multiplicity/arbitrary-N:** Can multiple Offers, executions, bindings, lineages, customers, and provider accounts coexist without current/default collapse?
4. **Reference integrity:** Are exact IDs/fingerprints required rather than same-parent or same-provider inference?
5. **DI identity/scope:** Does `DI-1/COMMERCIAL_PAYMENT` remain exact provider/account scoped without being broadened globally?
6. **Source-gap laundering:** Does the amendment avoid inventing H2-E34 exact historical Binding/Validation representation or other unrecovered exact forms?
7. **Forward-governance recursion:** Do new authority fields/surfaces remain subject to J classification/registration controls when eventually implemented?
8. **New cross-node edge:** Does the amendment create or strengthen Phase-C edges beyond the frozen candidates, requiring graph update before closure?
9. **Deletion/retention regression:** Could a future representation satisfy current equality while losing old Offer/Binding/Lineage history?
10. **Assurance/exactness overclaim:** Does the text distinguish semantic rule definition from representation and implementation certification?

Any unresolved answer blocks `PRE_BCT_PASSED`.

## 9. PAIM — Amendment A (`RD-C-R17-R18`)

### PAIM-A — semantic dependency derivation

Minimum affected semantic/certification objects:

- `RD-C-R17-R18`;
- `F07-04` R17 Offer/Grant ↔ R18 commercial-payment Binding;
- R17 canonical authority artifact;
- R18 canonical authority artifact;
- Phase-C graph edge/classification for R17→R18;
- XPI-04 end-to-end provider-path bundle, because it consumes F07-04 and exact provider/account continuity;
- G2-01 evidence basis where the amendment changes the formal equality proposition consumed by provider/account continuity certification.

Representation findings REP-R17 and REP-R18 are not semantically closed by this amendment, but their future acceptance tests must consume the amended rule.

### PAIM-B — evidence/certification invalidation

At landing, certifications whose evidence basis asserts or depends on the prior absence/shape of the R17→R18 composition rule must transition fail closed under the frozen lifecycle.

At minimum, recheck planning must include:

- affected Phase-C relationship classification;
- F07-04;
- G2-01 only to the extent its certified evidence premise changes;
- XPI-04 certification bundle;
- Phase-J controls/attacks only where changed authority surfaces or fixtures alter their evidence basis.

No certification may be restored before stable commit + POST-BCT + substantive rechecks.

### PAIM-C — physical-root expansion

This amendment is semantic-only and has no authority to mutate runtime/schema roots.

Before any later implementation amendment lands, PAIM-C must rederive current physical consumers. Known frozen roots currently relevant to future implementation include:

- ROOT-1 `commercial_activations` for R17/commercial history;
- ROOT-2 `capabilities` for R18 capability/binding history;
- ROOT-3 commercial-payment provider configuration for provider/account dispatch wiring.

This semantic amendment does not acquire writer leases because it does not mutate those roots.

## 10. PAIM — Amendment B (`RD-C-R19-R18`)

### PAIM-A — semantic dependency derivation

Minimum affected semantic/certification objects:

- `RD-C-R19-R18`;
- `F07-05` R18 Binding ↔ R19 Lineage;
- R18 canonical authority artifact;
- R19 canonical authority artifact;
- Phase-C graph edge/classification for R19→R18;
- XPI-04 bundle through R19/R18/provider-account lineage composition;
- F07-18 only if the amended R19 binding segment changes the exact complete-lineage evidence consumed by R20 Boundary Decision correspondence.

REP-R18 and REP-R19 remain separate representation owners.

### PAIM-B — evidence/certification invalidation

At minimum, recheck planning must evaluate:

- affected Phase-C relationship classification;
- F07-05;
- F07-18 if its evidence basis changes;
- G2-01 if the formal provider/account lineage proposition changes its certified evidence basis;
- XPI-04 end-to-end provider-path certification;
- J/R20 evidence only if the amendment changes the exact lineage object consumed by their prior certification.

### PAIM-C — physical-root expansion

Semantic amendment only; no runtime/schema writer lease is authorized.

Known future implementation roots include ROOT-1 `commercial_activations` and ROOT-2 `capabilities`. Any implementation amendment spanning both is multi-root and must use the canonical FR-09 total ordering and all-or-nothing lease protocol.

## 11. Candidate graph effects

This package starts from the frozen understanding that R17→R18 and R19→R18 are unresolved/missing composition relationships requiring semantic definition before representation closure.

Before landing either amendment:

1. the proposed relationship edge must exist in candidate graph state;
2. it may be used conservatively for invalidation discovery;
3. it may not be used as a positive certified semantic premise before amendment landing and required classification;
4. the changed edge must pass reciprocal-neighbor scan for new contradictions;
5. only after stable commit, POST-BCT, edge classification, and required substantive rechecks may it become `CERTIFIED_CURRENT`.

## 12. Landing protocol

Neither amendment may land from this review draft.

Required sequence per amendment:

1. adversarial review of the candidate contract and PAIM;
2. adjudicate every accepted attack/correction;
3. freeze exact amendment text and exact PAIM revision;
4. pin current authority blobs, dependency-register revision, candidate graph revision, consequential-surface inventory revision, and applicable source-governance revisions;
5. PRE-BCT PASS;
6. PAIM pin revalidation immediately before `MAY_LAND`;
7. acquire any required semantic-artifact mutation lease under the governed amendment process; no runtime/schema root lease is implied by this semantic package;
8. atomic landing event: authority amendment + finding lifecycle transition + certification invalidation;
9. POST-BCT on the actually landed authority state;
10. if POST-BCT fails, atomic rollback under FR-08; if distributed outcome becomes indeterminate, fail closed under the frozen distributed-commit grammar;
11. classify changed/new edges;
12. run substantive rechecks;
13. only then evaluate node closure.

## 13. Explicit non-goals

This package does not:

- design the R17, R18, or R19 database schema;
- choose the exact historical R18 Binding Validation Record form;
- recover missing historical names or serialization algorithms;
- resolve ROOT-1/ROOT-2 implementation migrations;
- close F05/F06/F01 representability findings;
- close F07-04/F07-05;
- close G2-01;
- close XPI-04;
- restore remediation or implementation authority;
- authorize provider onboarding or any real commercial execution.

## 14. Adversarial review questions

1. Is packaging `RD-C-R17-R18` and `RD-C-R19-R18` together necessary for coherence, or does any wording accidentally make one node a closure prerequisite of the other beyond the intended R17/R18 equality consumed by R19?
2. Does §4 accidentally make every R17 Offer require an R18 binding even when no R18-governed external commercial-payment capability is consumed?
3. Is checkout/payment configuration compatibility in §4.2 sufficiently exact without inventing unrecovered provider-specific mapping semantics owned by H1-S09?
4. Does §4 preserve the distinction between R18 binding eligibility and R20 final dispatch authority?
5. Does §4.5 correctly preserve R8 truth without implying a later mismatch can never create an authority-regression finding?
6. Does §5.3 preserve R18/F07-06 arbitrary-N capability-binding semantics without over-requiring unrelated bindings to enter commercial lineage?
7. Does §5.4 improperly depend on the unrecovered exact H2-E34 Binding Snapshot/Validation Record representation, or is it correctly phrased as a semantic reference requirement only?
8. Does the package preserve G2-01 as implementation-conformance rather than manufacturing a new R6/R7/R8 contract amendment?
9. Are F07-04 and F07-05 the complete direct Phase-F relationship fan-outs, or does the exact composition rule directly strengthen another F7 closure predicate rather than merely affect an end-to-end bundle?
10. Does R19's exact binding-set rule create any conflict with F07-18 or R20's exact complete-lineage ↔ exact Boundary Decision requirement?
11. Is the PAIM treatment of F07-18 correctly conditional rather than unconditional?
12. Are ROOT-1/ROOT-2/ROOT-3 correctly identified as future implementation roots without accidentally authorizing semantic-amendment locks against runtime/schema surfaces?
13. Does any proposed wording silently require provider/account equality where the commercial action legitimately has no provider-account dimension?
14. Does the no-substitution wording preserve an explicitly governed rebinding/successor path rather than prohibit it categorically?
15. Can any mixed-history construction still pass by keeping provider/account equal while mismatching binding ID, verification result, execution attempt, or Offer/Grant identity?
16. Does the package create a hidden new proposition requiring an exact checkout-config ↔ R18 binding equality owner distinct from H1-S09/F07-04?
17. Does the package need an explicit deterministic equality object/fingerprint for the R17/R18 composed segment, or would specifying one now invent representation before REP-R17/REP-R18 design?
18. Is any source-recovery item being treated as resolved by governed current semantics rather than remaining historical-exactness debt?

## 15. Review disposition

`AMENDMENT PACKAGE 01 DRAFTED / 2 FROZEN SEMANTIC-RULE NODES TARGETED / 0 FINDINGS CLOSED / 0 CERTIFICATIONS RESTORED / PRE-BCT NOT YET RUN / PAIM NOT YET FROZEN / ADVERSARIAL REVIEW REQUIRED / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
