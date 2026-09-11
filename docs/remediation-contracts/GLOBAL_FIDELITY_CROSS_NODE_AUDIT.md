# Money Scout — Global Fidelity & Cross-Node Audit

**Status:** ACTIVE AUDIT / IMPLEMENTATION AUTHORITY STILL SUSPENDED  
**Scope:** R1–R20 recovery corpus plus governing recovery standards  
**Purpose:** determine whether the recovered node set is mutually consistent, adequately source-grounded, and safe to promote into corrected implementation authority.

## 1. Governing rule

This audit exists because per-node review is not sufficient to prove cross-node safety.

The R20 review demonstrated the concrete failure class: two individually reviewed nodes can still disagree when one node consumes another node's semantics. The global audit therefore treats contradiction discovery as a first-class objective, not a formality.

> **A node can be internally faithful and still be globally unsafe if it misstates, narrows, strengthens, weakens, or silently reinterprets another node's contract.**

No recovered node becomes implementation authority solely because its own source-level review cleared.

## 2. Governing assurance taxonomy

The audit must preserve the frozen assurance distinction:

- **T1 RECOVERED** — durable recovered artifact exists;
- **T2 TRANSCRIPTION_VERIFIED** — artifact checked against intended reconstruction;
- **T3 SOURCE_FIDELITY_VERIFIED** — adversarial comparison against actual available source record;
- **T4 INDEPENDENTLY_REDERIVED** — materially independent reviewer/source reconstructs or challenges from underlying source.

> **Recovered ≠ Transcription Verified ≠ Source Fidelity Verified ≠ Independently Re-derived ≠ Implementation Authority.**

Tier promotion requires evidence. Confidence, repetition, or lack of discovered disagreement is not a substitute for the required evidence class.

### 2.1 T4 independence assignment is explicit, not implied

A reviewer that materially authored, reconstructed, adjudicated, or repeatedly reviewed a node in the same continuity chain may not self-award T4 for that node merely by performing another adversarial pass.

For this corpus specifically, the continuing Claude conversation and the continuing ChatGPT conversation have both materially participated in reconstruction, amendment, or review. Neither continuity chain may by itself certify the recovered corpus as T4 merely by re-reading its own prior work under a different prompt.

T4 for a high-risk node, compound, hard-chain segment, or final corrected authority set must come from one of the following:

1. **a materially independent model family/provider** that did not participate in the reconstruction/review chain and is given the underlying source record plus immutable recovered artifacts, not prior reviewers' conclusions as authority;
2. **a fresh qualified human reviewer** with no authorship stake in the recovered content, given the same source/artifact packet;
3. another reviewer/source configuration that demonstrably satisfies the R5 independence rule and is documented with why it is materially independent.

A fresh prompt, persona, context window, or turn in the same materially involved model continuity is not sufficient merely because it feels adversarial.

Concrete project default: final T4 review should be assigned to a reviewer outside the Claude/ChatGPT reconstruction chain, preferably a third model family/provider or qualified senior systems/security reviewer. If no such reviewer is available, the affected material remains below T4 and the audit must say so rather than laundering T3 into T4.

### 2.2 T4 is required at the final authority boundary, not for every low-risk sentence

The audit does not require every recovered sentence to become T4. It does require materially independent review of the final high-risk authority set before implementation authority returns, including at minimum:

- the hard chain `R4 → R9 → R10 → R17 → R19 → R20`;
- BLOCKER-level cross-node contradiction resolutions;
- the `R7 × R8 × R15 × R16` money/external-truth compound;
- the `R6 × R18 × R20` capability/binding/boundary compound;
- any other node/compound whose remaining ambiguity could authorize unsafe consequential execution.

## 3. Current corpus starting state

The audit begins from the following known assurance shape:

- R1–R3: prior source-fidelity verification exists;
- R4–R6: transcription-level verification only; substantive source-level recheck still owed;
- R7–R17, R19–R20: recovered under the two-pass source-review process, with node-specific unresolved source gaps retained;
- R18: separately confirmed through live adversarial design dialogue but not yet normalized into the recovery assurance hierarchy;
- R7 and other source-incomplete nodes remain explicitly non-implementation authority despite successful review of recoverable content.

This starting state is descriptive, not a promotion decision.

## 4. Audit phase A — R4–R6 substantive source recheck

R4, R5, and R6 must receive the same kind of genuine source-level adversarial review that later recovery nodes received.

For each node:

1. compare the committed artifact against the actual underlying confirmation/source exchange, not against the same reconstruction that generated the artifact;
2. classify findings as `ACCEPTED`, `PARTIALLY_ACCEPTED`, `REJECTED`, or `UNRESOLVED`;
3. restore specific negotiated decisions, rejected alternatives, named states, compounds, Design Input dispositions, and worked acceptance scenarios where source-supported;
4. preserve unresolved gaps explicitly rather than inferring them;
5. perform a second source-level pass after amendments;
6. record the resulting assurance tier honestly.

### 4.1 Source basis must be named

Every Phase A review record must say what source was actually used:

- immutable conversation/source transcript;
- committed contemporaneous artifact;
- prior frozen summary with known provenance;
- reviewer memory only;
- or another named source.

A repeated pass against the same reviewer's residual memory is not automatically a stronger assurance class. If the actual source well is exhausted, the legitimate result is:

`SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL`

That state is preferable to inventing detail or pretending another memory pass created new independence.

If only reviewer memory remains for a detail and no durable source supports it, the detail cannot be promoted to T3/T4 merely by repetition.

Special attention:

- R4 exact Evaluation Cycle propagation and fail-closed legacy lineage;
- R5 material conclusion confirmation and independence requirements;
- R6 canonical five-state readiness model, strongest-applicable verifier semantics, human-attestation ambiguity rule, and relay-contamination history.

## 5. Audit phase B — R18 assurance normalization

R18 must be mapped into the same assurance hierarchy as the rest of the corpus.

The audit must record separately:

- what was confirmed through live adversarial design dialogue;
- what source artifact(s) exist;
- what was independently challenged;
- whether any portion qualifies for T3 or T4;
- what remains only confirmed-by-dialogue or transcription-level;
- the correction history deleting fabricated `C5-F3` and preserving only `C4-F5` as the historical finding.

R18 must not inherit another node's assurance tier by association.

## 6. Audit phase C — cross-node contradiction sweep

Every node must be reviewed not only for its own content but for how it consumes other nodes.

For each cross-reference, classify the consumer relationship:

- `CONSISTENT_CONSUMPTION`
- `UPSTREAM_SEMANTIC_REDEFINED`
- `UPSTREAM_SCOPE_NARROWED`
- `UPSTREAM_SCOPE_BROADENED`
- `IDENTITY_SUBSTITUTION_RISK`
- `AUTHORITY_LAUNDERING_RISK`
- `MISSING_REQUIRED_COMPOSITION`
- `OWNERSHIP_MISATTRIBUTION`
- `ASSURANCE_OVERCLAIM`
- `UNRESOLVED_CROSS_NODE_GAP`

Any genuine contradiction or semantic drift becomes its own durable audit finding. It is not closed merely by editing one sentence; all affected downstream consumers must be swept.

### 6.1 Mechanical cross-reference derivation is authoritative for coverage

The manually listed checks below are mandatory seeds, not the complete graph.

Before Phase C can be considered complete, derive a **Cross-Reference Edge Inventory** mechanically from the R1–R20 artifacts by collecting at minimum:

- every section titled or framed as an `R# boundary`;
- every explicit `R# × R#` compound;
- every hard-chain arrow;
- every `consumes`, `inherits`, `depends on`, `owned by`, `hands off to`, `revalidates`, `preserves`, `supplies`, or equivalent cross-node reference;
- every Design Input consumption reference that names another node/scope.

Each directed edge `consumer → upstream` must be audited. Transitive chains do not substitute for direct-edge review.

The edge inventory must record immutable artifact SHAs for both ends so a later node amendment invalidates the affected prior edge result mechanically rather than silently.

### 6.2 Mandatory seed contradiction checks

At minimum verify:

- R3 freshness semantics as consumed by R20;
- R4 exact lineage as consumed by R9, R17, R19, R20;
- R5 material-confirmation semantics as consumed by R6, R17, and other judgmental equivalence decisions;
- R6 readiness versus R18 exact binding semantics;
- R7 reservation/admission versus R8 execution truth versus R15 observation versus R16 reconciliation;
- R8 technical external truth versus R14 handoff and R20 adoption truth;
- R9 source identity versus R10 artifact identity;
- R10 artifact identity versus R17 commercial-equivalence semantics;
- R11 corrective ownership versus R20 execution authority;
- R12 durable obligation reconstruction versus R13 liveness and R7 recovery-wave admission;
- R14 ownership transfer versus R19 frozen lineage and R20 eligibility;
- R17 exact Offer authority versus R19 lineage and R20 current eligibility;
- R18 lifecycle/disposition semantics as consumed by R20;
- R19 post-hoc authority rule versus R20 authority regression.

### 6.3 Node assurance reopening rule

A per-node review can clear locally and still become globally implicated later.

If a global-audit finding materially implicates node `Rx`, then `Rx` must receive a durable **global-audit overlay** in its own assurance record. The original node review history is not rewritten away, but the node may not continue to appear globally clean while the contradiction exists.

The overlay must include:

- global finding ID;
- affected consumer/upstream relationship;
- status `OPEN`, `AMENDED_PENDING_RECHECK`, or `CLOSED`;
- whether local assurance tier remains valid for transcription/source fidelity;
- whether implementation eligibility is suspended by the global finding;
- immutable SHAs of the node versions involved.

A central contradiction register without node-local cross-reference is insufficient.

## 7. Audit phase D — hard-chain certification

The hard chain must be reviewed as one authority-preserving sequence:

`R4 → R9 → R10 → R17 → R19 → R20`

For every arrow, prove:

- the exact upstream identity is retained;
- no mutable current state substitutes for historical authority;
- no successor identity inherits authority without the governing proof;
- no later node silently reconstructs missing upstream truth;
- no downstream current-eligibility result rewrites historical identity;
- concurrent historical authorities remain representable;
- boundary-time checks consume the exact frozen lineage rather than a current replacement.

The chain is not certified merely because each node clears independently.

## 8. Audit phase E — compound certification

The following compounds are mandatory global checks:

### 8.1 R1 × R2 × R7

Resource semantic truth and uncertainty must compose with exclusive aggregate admission. R1/R2 may define truth/uncertainty but may not grant reservation authority; R7 may grant admission but may not redefine resource truth.

### 8.2 R7 × R8 × R15 × R16

Reservation, external execution, immutable provider financial observation, and deterministic reconciliation must compose before headroom moves safely.

### 8.3 R12 × R13 × R7

Durable backlog reconstruction and truthful executor recovery must not create emergency admission authority. Recovery waves remain bounded by R7 aggregate reservation.

### 8.4 R6 × R18 × R20

Verified capability truth, exact frozen capability binding, and boundary-time consumption must remain distinct. R20 consumes R18's disposition; it does not redefine R18 lifecycle policy.

### 8.5 R3 × R20

Freshness must revalidate the bound lineage's current-condition evidence. It must never authorize identity substitution.

### 8.6 R7 × R15 × R16

Reservation safety without durable incurred-cost evidence and order-independent reconciliation is incomplete. Revised truth cannot retroactively erase prior executed authority.

## 9. Audit phase F — representability and multiplicity sweep

Cross-node schema assumptions must be checked for whether they can represent multiple historically distinct authorities at once.

This sweep includes at least:

- R9 immutable source snapshots;
- R10 multiple Artifact Versions and Release Jobs;
- R17 multiple Offer Versions / Grants;
- R18 historical capability bindings;
- R19 M14 / `commercial_activations_asset_unique` and N concurrent lineages;
- R20 concurrent Boundary Registry decisions and multiple in-flight authority evaluations.

> **If the schema cannot represent multiple historically distinct authorities at once, no downstream logic can make the system historically correct.**

Any one-current-row assumption that collapses history becomes a named defect, even if current-path happy tests pass.

## 10. Audit phase G — Design Input consistency

Every node must have a scope-aware Design Input disposition.

For DI-1 and DI-2, verify:

- reviewed status;
- activation status;
- exact activation scope where active;
- `CONSUME`, `SUPERSEDE`, or `NOT ACTIVATED` disposition where applicable;
- provider/account identity consistency across R6/R7/R8/R17/R18/R19/R20;
- no scope activation silently broadened to unrelated nodes;
- no activated scope silently collapsed back into generic unnamed DI language;
- DI-2 reversal authority activates only where Money Scout autonomously dispatches the external reversal, not merely where reversal evidence/history is represented.

Named scope `DI-1/COMMERCIAL_PAYMENT` must remain stable where consumed.

## 11. Audit phase H — source-gap register

Create one explicit global unresolved-source-gap register.

Each gap must include:

- node;
- missing detail;
- actual source(s) checked;
- whether the source is exhausted;
- whether the gap affects implementation semantics, traceability only, naming only, fixture provenance only, or closure evidence only;
- whether the gap blocks local implementation authority;
- whether neighboring contracts constrain it sufficiently for safe implementation;
- whether the gap requires source recovery, independent re-derivation, conservative implementation rule, or continued non-authority status.

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` must never be treated as proof that the original detail never existed.

## 12. Audit phase I — phase/name/source exactness checks

The global audit must explicitly resolve any places where semantics are confirmed but exact frozen naming remains uncertain.

Known example:

- R20 three-phase structure is substantively confirmed; literal strings `PREFLIGHT`, `BOUNDARY_VALIDATION`, `ADOPTION_VALIDATION` require final exact-name confirmation if source permits.

Equivalent cases in other nodes should be added as discovered.

Naming uncertainty must not be silently upgraded into exact-source certainty.

## 13. Audit phase J — forward-governance and future-code coverage

A clean audit of existing code/contracts cannot guarantee future consequential code will call the governing authority gates.

Verify that R20's forward engineering-governance rule composes with the development process:

- new consequential surfaces require classification;
- consequential boundaries require Boundary Registry registration before merge/release;
- code review rejects bypass paths;
- CI/static analysis/architectural linting is used where deterministically possible;
- tests exercise allow and deny paths through the gate;
- new consequence classes that exceed current representability become governed A0/A1 work rather than local exceptions.

> **Architecture cannot runtime-enforce against code never written to call it.**

## 14. Phase ordering and invalidation rules

The audit is ordered to prevent stale certification:

1. **Phase A:** complete R4–R6 substantive source rechecks and amendments;
2. **Phase B:** normalize R18 assurance;
3. derive the first complete Cross-Reference Edge Inventory from the amended corpus;
4. **Phases C–J:** run contradiction, hard-chain, compound, representability, DI, source-gap, naming, and forward-governance audits against pinned immutable SHAs;
5. resolve findings and amend affected nodes;
6. automatically invalidate every prior edge/compound/chain result whose upstream or consumer SHA changed;
7. rerun all invalidated checks;
8. perform a final complete Phase C contradiction sweep against the final candidate corpus, not merely targeted rechecks;
9. only then assemble the corrected canonical register;
10. submit the corrected authority set to the materially independent T4 reviewer defined in §2.1.

A Phase C pass performed before Phase A/B amendments may be useful for discovery, but it cannot serve as final certification.

> **No audit conclusion may outlive the immutable node versions it actually checked.**

## 15. Audit outputs

The Global Fidelity & Cross-Node Audit is not complete until it produces all of the following:

1. per-node assurance matrix R1–R20;
2. R4–R6 substantive source-level review records with named source basis;
3. R18 normalized assurance record;
4. mechanically derived Cross-Reference Edge Inventory pinned to immutable SHAs;
5. cross-node contradiction register with dispositions;
6. node-local global-audit overlays for every implicated node;
7. hard-chain certification result;
8. compound certification results;
9. Design Input consistency matrix;
10. unresolved source-gap register including source-exhaustion state;
11. representability/multiplicity findings;
12. explicit list of remaining blockers to implementation authority;
13. corrected canonical remediation register that references immutable node artifacts rather than compressing their normative content;
14. materially independent T4 review record for the final high-risk authority set.

## 16. Promotion rule

Implementation authority remains suspended until the audit demonstrates that the high-risk nodes and compounds have the required assurance and that no unresolved contradiction allows unsafe interpretation.

A node may remain source-incomplete and still become usable for implementation only if the audit explicitly shows that the unrecovered details are non-normative for implementation or are safely bounded by stronger governing contracts. That determination must be explicit, not assumed.

No assurance tier or implementation-authority status may be upgraded by convenience.

T4 absence is not a reason to lower the definition of T4. If materially independent review cannot be obtained, record the limitation and retain the stronger implementation gate where T4 is required.

## 17. Stop conditions

The audit must not be declared complete while any of the following remains unresolved:

- a BLOCKER-level cross-node contradiction;
- an upstream semantic being silently redefined downstream;
- missing R4–R6 source-level review;
- unnormalized R18 assurance;
- incomplete mechanically derived cross-reference coverage;
- a hard-chain identity substitution gap;
- an unowned authority-regression path;
- a known representability defect that can collapse distinct historical authorities;
- a consequential boundary class that cannot be represented or registered;
- an assurance claim stronger than its evidence;
- a node implicated by an open global finding without a node-local assurance overlay;
- stale edge/compound/chain certification against superseded node SHAs;
- required final T4 review not performed by a materially independent reviewer.

## 18. Relay-contamination guard

This audit artifact terminates here. No conversational handoff text is part of the governing audit body.