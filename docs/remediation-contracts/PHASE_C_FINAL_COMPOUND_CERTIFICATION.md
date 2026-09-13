# Phase C Final Compound / Hard-Chain Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / PHASE C CLOSED  
**Phase:** C — final multi-edge synthesis  
**Frozen edge inventory:** 163 / 163 classified, 0 unclassified  
**Implementation authority:** SUSPENDED

This artifact is the canonical final multi-edge certification for Phase C. It consumes the complete 163-edge classification corpus, the frozen final-certification plan, and the adversarial review of the final synthesis.

Mandatory six-node chain:

`R4 → R9 → R10 → R17 → R19 → R20`

The certification is a worked composed-authority proof. It is not satisfied by restating adjacent-edge outcomes.

## 1. Final certification result and exact scope

**FINAL RESULT: PASS at the Phase-C specification/composition level for the six-node historical lineage-identity chain, with no new compound-level defect identified.**

That statement is intentionally narrower than a claim that all R20 predicate families or all Money Scout E2E authority paths are complete.

The PASS certifies that, under the recovered contracts plus committed Phase C strengthenings:

- one exact historical R4/R9/R10/R17/R19 authority path can be represented coherently;
- every historical identity segment must remain the exact segment that actually produced/authorized the operation;
- direct and mediated copies of those identities must agree transitively;
- current successor objects cannot repair historical mismatch;
- R20 can consume the exact lineage-identity predicates owned by R4/R9/R10/R17/R19 without redefining them;
- a historically correct chain does not become perpetual current execution authority.

The PASS **does not certify that R20's full applicable-predicate set is globally closed**. In particular, `R5 → R20` remains a confirmed `MISSING_REQUIRED_COMPOSITION`; therefore any real consequential boundary that requires R5 independent confirmation remains outside the complete-boundary-coverage claim until that defect is remediated. Capability-bound and handoff-dependent scenarios likewise remain constrained by the open R18/R14 composition defects recorded below.

Phase C may nevertheless close because its frozen objective is complete classification and faithful global specification synthesis, not implementation remediation.

## 2. Governing prior requirements carried into this certification

The six-node proof depends on the following committed Phase C results as active specification requirements, not merely historical notes:

- **C11-01 `R4 → R19`** — R19's direct R4 lineage must correspond to the exact historical lineage actually represented by the commercial path; direct-vs-embedded cycle divergence cannot be laundered.
- **C12-02 `R9 → R19`** — R19's direct R9 source identity must remain consistent with the exact R10 artifact lineage; an S1 direct source cannot coexist with a P2 artifact actually derived from S2.
- **C13-03 `R10 → R19`** — R19's direct R10 artifact identity must match the R10 artifact embedded in/consumed by the R17 commercial authority segment.
- **C19-03 `R4 → R10`** — positive single-reference mediation pattern: R10 may preserve R4 through exact immutable R9 mediation rather than duplicating an independent R4 field.
- **C22-01 `R4 → R17`** — every separately first-class historical field inside one R17 Offer Version must belong to the same actual historical path; independent validity and same-parent membership are insufficient.
- **C23-02 `R9 → R17`** — R17 consumes exact R9 source authority through exact R10 mediation; no second mutable/current R9 lookup is permitted.
- **C31-02 `R17 → R10`** and the R10 contractual-folding precedent — exact R10 artifact/release identity is constituent commercial authority inside R17 rather than a loosely reachable neighbor.
- **C34-01 / related reverse checks** — reverse and skip-link paths preserve the same exact mediated historical identity rather than creating a second adjudication or current-state reconstruction path.
- **C23-01 `R20 → R19`** and the R19/R20 reciprocal corpus — lineage completeness and present eligibility are independent predicates; neither repairs the other.

These results are complementary. C19-03/C23-02 establish when one immutable mediator safely carries identity; C22-01/C11-01/C12-02/C13-03 establish that where the same authority dimension appears in multiple independently meaningful places, those places must agree with one historical path.

## 3. Canonical affirmative control

Establish one exact path:

1. R4 freezes Evaluation Cycle **A** and its immutable lineage.
2. R9 freezes Build Source Snapshot **S1** under A.
3. R10 creates Artifact Version **P1** from exact S1 and preserves exact QA/Release/production lineage.
4. R17 freezes Offer Version **O1** and exact `CUSTOMER_CHARGING` Grant **G1** for the P1 path.
5. R19 freezes Commercial Authority Lineage Reference **L1** over the exact historical composition, including its own direct A/S1/P1/O1-G1 segments plus all other applicable commercial dimensions.
6. R20 performs a fresh operation-specific decision against exact L1 and the applicable predicates it is actually capable of composing under the current specification.

### 3.1 Consolidated transitive-closure fixture

The full chain must be tested together, not inferred from four independent pairwise successes.

Required combined fixture:

1. `S1.r4Lineage = A`.
2. `P1.r9Source = S1`; therefore P1's mediated R4 lineage is A.
3. `O1.r10Artifact = P1`; therefore O1's mediated source is S1 and mediated R4 lineage is A.
4. O1's separately first-class R4/artifact/release fields must agree with that mediated path under C22-01.
5. `L1.directR4 = A` under C11-01.
6. `L1.directR9 = S1` must agree with `L1.directR10 = P1` under C12-02.
7. `L1.directR10 = P1` must agree with `L1.r17Offer = O1`'s embedded P1 under C13-03.
8. Therefore L1's direct R9 field must also agree transitively with O1's mediated R9 identity through P1.
9. Simultaneously substitute any one of `A2`, `S2`, `P2`, `O2` into only one direct or embedded location while keeping all other objects valid. The complete fixture must fail.
10. Substitute a fully coherent successor tuple `B/S2/P2/O2/L2`. That successor may govern a new action, but it cannot repair or replace the historical A/S1/P1/O1/L1 path under evaluation.

This fixture closes the difference between “all relevant pairwise invariants exist” and “the complete transitive authority story has actually been tested as one composition.”

### 3.2 Affirmative pass rule

The lineage-identity control passes only when:

- every immutable segment is exact;
- every direct and embedded historical field belongs to the same actual path;
- mediator links carry exact frozen identity, not query-time reachability;
- the consolidated transitive fixture passes;
- no current successor is substituted for historical identity;
- every **lineage-identity predicate covered by this six-node certification** is valid at R20;
- any additional applicable R20 predicate outside this certified composition is separately satisfied or remains explicitly blocked by an open Phase C defect.

A correct A/S1/P1/O1-G1/L1 history is necessary but not sufficient for unrestricted consequential execution.

## 4. D1-D6 divergence matrix

### D1 — R4 divergence

**Attack:** S1 was frozen under A; Cycle B later becomes current; reconstruction substitutes B for A.

**Expected:** FAIL.

**Protections:** immutable R4 lineage; exact A inside S1; C11-01 direct-R19-vs-historical-cycle consistency; C22-01 inside R17; R20 no-current-cycle substitution.

**Disposition:** rejected; no new finding.

### D2 — R9 divergence

**Attack:** replace S1 with S2/current HEAD while P1/O1/L1 still represent S1 history.

**Expected:** FAIL.

**Protections:** R9 immutable source authority; exact P1→S1 binding; C12-02 R19 direct-source/direct-artifact consistency; C23-02 exact R9→R10→R17 mediation; R20 no-current-source substitution.

**Disposition:** rejected; no new finding.

### D3 — R10 divergence

**Attack:** substitute valid P2, for example derived from S2, into a chain whose historical source is S1 and Offer is based on P1.

**Expected:** FAIL.

**Protections:** R10 exact artifact lineage; C22-01 P1/P2 reverse/non-cycle fixture; C13-03 R19-direct-artifact versus R17-embedded-artifact consistency; R20 exact-artifact consumption.

**Disposition:** rejected; no new finding.

### D4 — R17 divergence

**Attack:** O2/G2 becomes current and replaces frozen O1/G1.

**Expected:** FAIL.

**Protections:** immutable R17 Offer/Grant; R19 exact O1/G1 segment; R20 explicit no-current-Offer substitution.

**Disposition:** rejected; no new finding.

### D5 — R19 composite divergence

**Attack:** L1 contains individually valid direct R4/R9/R10/R17 segments that do not belong to the same operation path.

**Expected:** FAIL.

**Protections, jointly:**

- R19 one-exact-path mission and frozen Commercial Authority Lineage Reference;
- C11-01 direct R4 consistency;
- C12-02 direct R9↔direct R10 source/artifact consistency;
- C13-03 direct R10↔R17-embedded R10 consistency;
- C22-01 internal R17 field-general same-path consistency;
- §3.1 consolidated transitive-closure fixture proving all of those conditions simultaneously.

**Disposition:** rejected at composite-lineage validation; no new compound-level defect.

### D6 — R20 current-boundary divergence

**Attack:** L1 is historically perfect but a current applicable predicate becomes invalid.

**Expected:** R20 denies the relevant present boundary while preserving L1 and any external/history truth.

**Scope precision:** this certification proves the historical/current separation for R20's correctly composed R4/R9/R10/R17/R19 lineage predicates. It does not claim the full R20 predicate universe is complete while `R5 → R20` and applicable R18-related composition defects remain open.

**Disposition:** rejected; no historical mutation.

## 5. Cross-segment attacks

### X1 — Mixed-current reconstruction

Replace the entire historical tuple with coherent current successors B/S2/P2/O2/L2.

**Expected:** FAIL for the historical action. A successor chain may govern a new action only.

**Result:** PASS — attack rejected.

### X2 — Partial historical substitution

Change one direct/embedded or skip-link identity while every referenced object remains individually valid.

**Expected:** FAIL.

**Protections:** C11-01 + C12-02 + C13-03 + C22-01, exercised simultaneously by §3.1.

**Result:** PASS — attack rejected.

### X3 — Same-parent laundering

Substitute a different valid object because both share Opportunity/Product/Bet/Asset parentage.

**Expected:** FAIL. Association is not authority.

**Protections:** R19 association-not-authority rule; C22-01 same-parent negative control; exact R4/R9/R10/R17 identity.

**Result:** PASS — attack rejected.

### X4 — Duplicate-field equality drift

Independently meaningful duplicate/composite fields diverge while each resolves to a valid object.

**Expected:** FAIL.

**Protections:** C22-01 plus C11-01/C12-02/C13-03; positive C19-03 mediation rule prevents unnecessary duplicate fields where one exact mediator suffices; §3.1 proves the required transitive equality where duplicate/direct fields legitimately coexist.

**Result:** PASS — attack rejected.

### X5 — Mediator reachability without equality

A downstream object can navigate to some upstream object but cannot prove it is the exact object frozen through the mediator.

**Expected:** FAIL.

**Exact-carrying argument:**

- R9→R10: R10's canonical Artifact Version binds the exact R9 Build Source Snapshot/source authority, established by the R9/R10 classifications including C02-03, C19-03, and reciprocal C33-02.
- R10→R17: R17's Offer Version binds exact R10 Artifact Version/Release, established by C07-03 and reciprocal/contractual-folding checks including C31-02.
- R4→R9→R10: R10 receives originating R4 lineage through exact R9 mediation under C19-03; a current Bet/Cycle join is not an alternate identity path.
- R9→R10→R17: C23-02 explicitly requires R17's source lineage to remain the source carried through exact R10 rather than a second current-R9 lookup.

Thus these are identity-carrying mediators, not mere graph reachability.

**Result:** PASS — attack rejected.

### X6 — Historical-valid / current-invalid

A/S1/P1/O1-G1/L1 is historically perfect but a currently applicable predicate fails.

**Expected:** deny present consumption, preserve history.

**Result:** PASS — attack rejected.

### X7A — Historical lineage incomplete but legitimately reconstructible

Historical L1 is incomplete, but durable evidence uniquely proves one authoritative historical path under R19's deterministic-reconstruction policy.

**Expected:** the lineage may be reconstructed only through the governed `DETERMINISTICALLY_RECONSTRUCTED` path with the required provenance. Until that proof exists, it remains `LEGACY_UNPROVEN`/non-authoritative. Current L2 cannot be used as a shortcut.

**Result:** PASS — reconstruction is available only when historical evidence uniquely proves the old path.

### X7B — Historical lineage wrong or authority absent at execution

Historical L1 is internally wrong, or the consequential effect lacked required authority when it occurred; a valid current L2 now exists.

**Expected:** current L2 does not repair history. R19's post-hoc-authority prohibition applies; historical mismatch remains an owned remediation/authority-regression condition. L2 may govern a future successor action only.

**Result:** PASS — no retroactive authorization.

## 6. Reverse and skip-link synthesis with explicit batch traceability

The relevant reverse and skip-link edges add no contradiction when their live dependencies are carried forward.

### R4 constraints

- `R4 → R10` — **C19-03**: exact R4 lineage is carried through immutable R9 mediation; avoid redundant copies that create equality drift.
- `R4 → R17` — **C22-01**: all independently meaningful R17 historical dimensions must belong to one path.
- `R4 → R19` — **C11-01**: R19 direct R4 identity must agree with the lineage actually governing the commercial path.
- `R4 → R20` / `R20 → R4` — **C26-01 / C24-01**: R20 evaluates the exact historical lineage; current cycle cannot substitute.

### R9 constraints

- `R9 → R17` — **C23-02**: source lineage is consumed through R10; direct `CONSUMES` is intentionally withheld.
- `R9 → R19` — **C12-02**: R19 direct source must agree with its direct artifact's actual source lineage.
- `R9 → R20` / `R20 → R9` — **C18-03 / C25-01**: current boundary cannot manufacture source authority from HEAD/current refs.

### R10 constraints

- `R10 → R19` — **C13-03**: R19 direct artifact must match the artifact embedded in the commercial path.
- `R10 → R20` / `R20 → R10` — **C22-02 / C27-01**: exact artifact lineage and current boundary eligibility are separate predicates.

### R17 constraints

- `R17 → R4` — **C38-01**, governed by C22-01's composite-path strengthening.
- `R17 → R9` — **C34-01**, mediated through exact R10 rather than a second current-source path.
- `R17 → R10` — **C31-02**: exact R10 artifact/release lineage is contractually folded into Offer Version.
- `R17 → R19` — **C03-02**: exact Offer/Grant becomes the commercial-authority segment of L1.
- `R17 → R20` / `R20 → R17` — **C14-02 / C03-03**: Offer identity and current eligibility remain distinct.

### R19 constraints

- `R19 → R4` — **C37-01** plus C11-01 lineage requirements.
- `R19 → R9` — **C34-02** plus C12-02 source/artifact consistency.
- `R19 → R10` — **C32-02** plus C13-03 direct/embedded artifact consistency.
- `R19 → R17` — **C21-02**: R19 consumes/preserves exact Offer/Grant without redefining it.
- `R19 → R20` / `R20 → R19` — **C08-03 / C23-01**: complete lineage and present eligibility are parallel-not-merged predicates.

### R20 capstone rule

R20 never becomes an upstream identity owner. It consumes exact upstream lineage and decides present eligibility for the predicates it correctly composes. A valid current identity cannot replace an invalid historical identity, and a perfect historical identity cannot bypass another failed applicable R20 predicate.

**Synthesis result:** no reverse/skip-link contradiction and no uncited live dependency requiring a new Phase C classification remains in this six-node synthesis.

## 7. Open findings preserved and PASS-scope limitations

Phase C closes with documented open specification defects. None is erased by the six-node PASS.

### 7.1 `R17 → R18` — confirmed `MISSING_REQUIRED_COMPOSITION`

Commercial authority and exact capability-binding composition remains missing. Any six-node commercial action that additionally requires R18 capability-binding proof is not fully E2E-certified until this is remediated.

### 7.2 `R5 → R20` — confirmed `MISSING_REQUIRED_COMPOSITION`

This finding directly limits the breadth of the R20 conclusion in this certification.

If a consequential boundary requires R5 independent confirmation as an applicable predicate, R20 currently lacks the required composition that tells it to consume that R5 authority correctly. Therefore:

> **The six-node PASS certifies R20's correctly composed R4/R9/R10/R17/R19 lineage-identity predicates and their historical/current separation. It does not certify that R20's complete applicable-predicate set is closed.**

A real operation whose legal predicate set includes R5 remains blocked on this MRC even though its six-node lineage identity is perfect.

### 7.3 `R19 → R14` — confirmed `MISSING_REQUIRED_COMPOSITION`

Runtime replacement and complete commercial-lineage preservation still lack required direct composition. Handoff-dependent six-node scenarios remain blocked on that seam.

### 7.4 `R19 → R18` — confirmed `MISSING_REQUIRED_COMPOSITION`

Complete commercial lineage and exact capability binding still lack required direct composition. Capability-bound commercial scenarios remain blocked on that seam in addition to any `R17 → R18` requirement.

### 7.5 `R11 → R8` / C21-03 — open `UNRESOLVED_CROSS_NODE_GAP`

The disposition of an active R11 reconciliation obligation after R8 reaches `EXPOSURE_COMMITTED_UNRECONCILABLE` remains unresolved. Any E2E path entering that state must preserve the ambiguity and may not let R19/R20/R12 choose a reading implicitly.

## 8. Concurrent multiplicity is explicitly outside this Phase-C fixture

D1-D6 and X1-X7 test wrong-path substitution, transitive equality, mediator exactness, historical/current separation, and remediation/reconstruction boundaries for one governed chain.

They do **not** certify that arbitrary numbers of simultaneously valid six-node chains can coexist without schema collision or current-pointer overwrite.

That is a distinct representability-under-concurrency property already owned by requirements such as:

- R19 M14 / N-concurrent historical-lineage representation;
- R20 A0 concurrent-multiplicity representability;
- the later audit phase assigned to schema/concurrency/global representability (Phase F under the governing audit plan).

Accordingly, X1's rejection of a mixed-current reconstruction must not be cited as proof that N concurrent valid lineages are representable. Phase C neither passes nor fails that separate Phase-F obligation here; it preserves it explicitly for its owning phase.

## 9. Compound-level anti-cheat rules

The certification fails if an implementation can pass by:

1. validating segments independently without proving one historical path;
2. omitting the §3.1 full transitive-closure fixture;
3. reconstructing L1 from current joins;
4. replacing historical identity with a current successor;
5. using same-parent membership as equivalence;
6. letting one skip-link point to another generation;
7. duplicating upstream identity fields without equality checks;
8. treating graph reachability as exact mediated identity;
9. letting historical correctness bypass a failed current predicate;
10. letting current validity repair historically wrong or unauthorized execution;
11. applying deterministic reconstruction to a genuinely unauthorized/wrong historical effect;
12. using post-hoc authority to legitimize an effect that lacked authority when it occurred;
13. claiming complete R20 predicate coverage while `R5 → R20` remains unresolved as an MRC;
14. hiding the other MRCs or C21-03 behind the six-node PASS;
15. claiming concurrent-multiplicity certification from this single-chain fixture.

## 10. Phase C closure determination

Phase C's two frozen closure conditions are satisfied.

### A. Edgewise corpus coverage — PASS

- frozen directed edges: **163**;
- unique classified edges: **163**;
- unclassified: **0**;
- duplicates: **0**;
- out-of-inventory classifications: **0**;
- exact section pointers verified: **163 / 163**.

### B. Mandatory compound/hard-chain synthesis — PASS WITH EXPLICIT SCOPE

The A/S1/P1/O1-G1/L1 historical lineage-identity chain composes coherently under the recovered contracts and committed Phase C strengthenings. D1-D6 and the X attack family fail at defined owning boundaries; the consolidated transitive fixture makes the full direct/embedded identity closure explicit rather than inferred.

No new compound-level `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, identity-substitution defect, or authority-laundering defect was found by the final synthesis.

The PASS is not an assertion that every R20 predicate or every system-wide E2E composition is complete. The four confirmed MRC defects, C21-03, and all fixture-tier strengthenings remain active remediation/governance obligations.

## 11. Final Phase C state

**PHASE C: CLOSED.**

Closed means:

- the complete frozen cross-reference corpus was audited;
- every directed edge received one committed classification;
- terminal mechanical reconciliation passed;
- the mandatory six-node compound synthesis passed at its stated specification scope;
- all defects, unresolved gaps, strengthenings, negative controls, positive mediation precedents, and scope limitations remain preserved for later remediation/certification;
- implementation authority remains **SUSPENDED** until the governing later phases and remediation requirements permit otherwise.

Standing primary findings carried out of Phase C:

1. `R17 → R18` — `MISSING_REQUIRED_COMPOSITION`;
2. `R5 → R20` — `MISSING_REQUIRED_COMPOSITION`;
3. `R19 → R14` — `MISSING_REQUIRED_COMPOSITION`;
4. `R19 → R18` — `MISSING_REQUIRED_COMPOSITION`;
5. `R11 → R8` / C21-03 — `UNRESOLVED_CROSS_NODE_GAP`.

Phase C therefore closes **with open findings intentionally preserved**, because remediation is not the Phase-C closure criterion.