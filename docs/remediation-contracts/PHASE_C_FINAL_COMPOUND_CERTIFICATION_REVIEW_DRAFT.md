# Phase C Final Compound / Hard-Chain Certification — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** C — final multi-edge synthesis  
**Frozen edge inventory:** 163 / 163 classified, 0 unclassified  
**Implementation authority:** SUSPENDED

This artifact evaluates the frozen six-node hard chain as one composed authority path after terminal edgewise reconciliation. It is not satisfied by restating pairwise classifications.

Mandatory chain:

`R4 → R9 → R10 → R17 → R19 → R20`

The review consumes committed Phase C classifications and strengthenings as governing specification. It does not assume implementation exists. A strengthening recorded by Phase C is therefore treated as a required contract-level invariant for this synthesis, not as evidence that code already enforces it.

## 1. Provisional certification result

**Provisional result: PASS at Phase-C specification/composition level, with no new compound-level defect identified.**

The pass is conditional on preserving all already-recorded Phase C requirements that constrain this cluster, especially:

- C22-01 composite same-path consistency inside R17;
- exact immutable R4 lineage preservation;
- R9 immutable Build Source Snapshot semantics;
- R10 exact Artifact Version / Release / deployment lineage;
- R17 exact Offer Version / `CUSTOMER_CHARGING` Grant identity;
- R19 frozen Commercial Authority Lineage Reference and same-historical-path attribution;
- R20 exact-bound-authority revalidation with no current-state substitution;
- the positive single-reference mediation pattern where an immutable mediator already carries the authoritative upstream identity;
- all applicable exact-record strengthenings already recorded by Phase C.

This provisional pass does **not** erase or remediate the confirmed open findings elsewhere in the corpus. The final Phase C record must continue to preserve:

1. `R17 → R18` — `MISSING_REQUIRED_COMPOSITION`;
2. `R5 → R20` — `MISSING_REQUIRED_COMPOSITION`;
3. `R19 → R14` — `MISSING_REQUIRED_COMPOSITION`;
4. `R19 → R18` — `MISSING_REQUIRED_COMPOSITION`;
5. `R11 → R8` / C21-03 — `UNRESOLVED_CROSS_NODE_GAP` concerning `EXPOSURE_COMMITTED_UNRECONCILABLE`.

Those findings constrain wider E2E behavior but do not invalidate the semantic correctness of the six-node historical-identity chain when the chain's own required predicates are satisfied.

---

## 2. Canonical affirmative control

Establish one exact historical path:

1. R4 freezes Evaluation Cycle **A** and its exact immutable lineage.
2. R9 freezes Build Source Snapshot **S1** under Cycle A.
3. R10 creates exact Artifact Version **P1** from S1, including exact qualifying QA / Release / production lineage.
4. R17 freezes Offer Version **O1** and exact `CUSTOMER_CHARGING` Grant **G1** for the commercialized P1 path.
5. R19 freezes Commercial Authority Lineage Reference **L1** over the exact historical authority composition, including A / S1 / P1 / O1-G1 and every other applicable lineage dimension.
6. R20 performs a fresh operation-specific boundary decision against exact L1 and every applicable current predicate.

### Affirmative pass rule

The control passes only when:

- every immutable segment is exact;
- every separately represented historical field agrees with the same actual historical path;
- every required mediator proves exact reachability/equality rather than merely navigability;
- no current successor is substituted for a historical segment;
- every current R20 predicate applicable to the action passes at the actual boundary;
- the R20 decision is new/current enough for that consequential boundary.

A correct A/S1/P1/O1-G1/L1 history is necessary but not sufficient if a present R20 predicate fails.

---

# 3. D1-D6 divergence matrix

## D1 — R4 divergence

**Attack:** S1 was frozen under Cycle A. Cycle B later becomes current. A downstream reconstruction substitutes B for A while all other fields remain coherent.

**Expected result:** FAIL.

**Owning protections:**

- R4 immutable originating-lineage semantics;
- R9 exact R4 lineage inside S1;
- R17 exact originating R4 cycle;
- R19 exact originating Evaluation Cycle inside L1;
- R20 explicit prohibition on replacing stale/historical A with current B;
- C22-01 same-path consistency where R17 separately carries multiple historical dimensions.

**Why the attack cannot be laundered:** B may be valid and current, and may share the same Opportunity/Product family, but it did not produce S1/P1/O1. Current validity is not historical identity.

**Disposition:** expected fail at lineage-integrity / same-path checks. No new finding.

---

## D2 — R9 divergence

**Attack:** replace S1 with S2/current HEAD while P1/O1/L1 still claim the historical S1 path.

**Expected result:** FAIL.

**Owning protections:**

- R9 freezes exact immutable source authority; branch/HEAD is non-authoritative context;
- R10 Artifact Version binds exact R9 source/build authority;
- R17 consumes R9 source lineage through exact R10 mediation;
- R19 directly preserves exact R9 Build Source Snapshot / Build identity;
- R20 consumes exact R9 lineage and forbids current-source substitution.

**Mediation rule:** R17 need not independently resolve a second R9 field when exact source authority is already carried through immutable R10 lineage. The certification requires exact mediator equality, not a duplicate direct pointer.

**Disposition:** expected fail. No new finding.

---

## D3 — R10 divergence

**Attack:** substitute valid Artifact P2 (for example derived from S2) into an authority chain whose source segment is S1 and whose historical Offer was based on P1.

**Expected result:** FAIL.

**Owning protections:**

- R10 exact Artifact Version / QA / Release / production identity;
- R17 exact R10 production Artifact Version and Release fields;
- C22-01 broadened reverse/non-cycle divergence fixture expressly rejects P2/D2 substitution inside otherwise valid O1;
- R19 directly binds exact R10 Artifact Version / production Release;
- R20 consumes exact R10 lineage and does not substitute current P2.

**Disposition:** expected fail at R10/R17/R19 lineage integrity. No new finding.

---

## D4 — R17 divergence

**Attack:** O2 and/or G2 becomes current after historical O1/G1 was frozen. Reconstruction replaces O1/G1 with O2/G2 because the newer commercial authority is currently valid.

**Expected result:** FAIL.

**Owning protections:**

- R17 Offer Version / Grant are immutable commercial authority objects;
- R19 consumes exact O1/G1 and prohibits current Offer/price/monetization substitution;
- R20 consumes exact R17 authority and explicitly refuses O2 substitution for O1;
- R19/R20 preserve historical validity independently from present eligibility.

**Disposition:** expected fail. No new finding.

---

## D5 — R19 composite divergence

**Attack:** L1 contains individually valid R4/R9/R10/R17 segments that do not all belong to the actual path that produced the commercial operation.

Example: A and S1 are correct, but P2/O2 are individually valid successors from another generation under the same Asset/Opportunity.

**Expected result:** FAIL.

**Owning protections:**

- R19's frozen mission explicitly rejects certification from a collection of individually valid objects unless they can be proven to belong to the same exact historical authority path;
- Commercial Authority Lineage Reference is a frozen composite authority identity, not a query-time join;
- C22-01 establishes the field-general same-path rule inside R17 and the broader Phase C principle that independent validity/same-parent membership is insufficient;
- R19 direct R4/R9/R10/R17 bindings must agree with the exact segments reached through their mediators rather than merely resolve to some valid object.

**Disposition:** expected fail at R19 composite-lineage validation. No new finding.

---

## D6 — R20 current-boundary divergence

**Attack:** L1 is historically perfect, but a current predicate becomes invalid: Offer revoked, binding invalid, reservation ineligible, freshness stale, runtime authority changed, or another applicable current predicate fails.

**Expected result:** FAIL at current boundary while preserving L1 and any already-existing R8/external history.

**Owning protections:**

- R20 owns current eligibility, not historical identity;
- exact historical lineage cannot become perpetual permission;
- current ineligibility blocks the new boundary but does not rewrite historical lineage;
- an external effect already proven by R8 remains historical truth even if later adoption is blocked.

**Disposition:** expected fail at R20. No new finding.

---

# 4. Cross-segment attack set

## X1 — Mixed-current reconstruction

**Attack:** replace A/S1/P1/O1/L1 with a mutually coherent set of current successors B/S2/P2/O2/L2. Every replacement object is valid and the replacement chain is internally coherent.

**Expected result:** FAIL for the historical action under review.

A coherent current successor chain may authorize a new governed operation. It cannot rewrite which chain governed the historical action.

**Primary protections:** R19 current-state reconstruction prohibition; R20 exact-bound-lineage rule; R4/R9/R10/R17 immutable identities.

**Result:** PASS (attack rejected).

---

## X2 — Partial historical substitution

**Attack:** change only one skip-link or duplicated/composite field, such as direct R19 `r4Cycle=A` but embedded R17 Offer references Cycle B, or R19 direct artifact P1 while embedded Offer carries P2.

**Expected result:** FAIL even when adjacent references all resolve.

**Primary protections:** C22-01 field-general same-path invariant; R19 one-exact-path mission; direct/mediated equality requirements.

**Result:** PASS (attack rejected).

---

## X3 — Same-parent laundering

**Attack:** use a different valid Cycle, source, artifact, Release, or Offer because both objects share the same Opportunity, Product, Bet, or Asset parent.

**Expected result:** FAIL.

Parent equality proves association, not authority identity.

**Primary protections:** R19 "association is not authority" rule; C22-01 same-parent negative control; exact R4/R9/R10/R17 identities.

**Result:** PASS (attack rejected).

---

## X4 — Duplicate-field equality drift

**Attack:** a composite legitimately carries an upstream identity in more than one first-class semantic location. The copies diverge but each independently resolves to a valid object.

**Expected result:** FAIL.

**Certification rule:** when independent first-class fields are necessary, equality/compatibility among them must be certified. Where a single immutable mediator safely carries identity, avoid duplicate fields instead.

This combines:

- C19-03 positive mediation pattern: avoid redundant identity copies when the mediator already carries the upstream authority;
- C22-01 inverse rule: when multiple fields are independently meaningful, prove they belong to one path.

**Result:** PASS (attack rejected).

---

## X5 — Mediator reachability without equality

**Attack:** downstream object can navigate through a mediator to some upstream object, but cannot prove that object is the exact immutable one the mediator carried when authority was frozen.

Examples:

- R17 reaches some R9 source through current Asset state instead of through exact R10 artifact lineage;
- R10 reaches some R4 cycle by a current Bet join instead of exact immutable R9 source snapshot lineage.

**Expected result:** FAIL.

**Certification rule:** traversability is not enough. The immutable mediator must identify the exact upstream object/version, and downstream use must remain on that exact mediated path.

**Result:** PASS (attack rejected).

---

## X6 — Historical-valid / current-invalid

**Attack:** A/S1/P1/O1-G1/L1 is historically perfect, but a current R20 predicate fails.

**Expected result:** R20 denies the present consequential boundary without rewriting history.

**Result:** PASS (attack rejected), same semantic core as D6.

---

## X7 — Current-valid / historical-wrong

**Attack:** historical L1 is incomplete or internally wrong, but a fully valid current successor chain L2 exists and all current predicates for L2 pass.

**Expected result:** FAIL for L1. L2 may govern a separate successor action only.

**Primary protections:** R19 post-hoc/current-state reconstruction prohibition; R20 current eligibility cannot repair historical lineage; later authority cannot retroactively legitimize prior unauthorized effect.

**Result:** PASS (attack rejected).

---

# 5. Reverse and skip-link synthesis

The relevant reverse and skip-link edges do not create contradictions in the six-node chain. Their combined effect is:

### R4 constraints

- `R4 → R10`: R10 receives exact R4 lineage through R9 mediation; no redundant direct R4 copy is required where the mediator is exact.
- `R4 → R17`: C22-01 requires all R17 first-class historical fields to belong to the same path.
- `R4 → R19`: R19 preserves exact originating cycle.
- `R4 → R20` and `R20 → R4`: R20 revalidates exact historical lineage rather than substituting current cycle.

### R9 constraints

- `R9 → R17`: explicit consumption through R10; direct `CONSUMES` correctly withheld.
- `R9 → R19`: R19 directly preserves exact source/build identity.
- `R9 → R20` / `R20 → R9`: current boundary cannot reconstruct source from HEAD/current refs.

### R10 constraints

- `R10 → R19`: exact artifact/release identity is a constituent lineage segment.
- `R10 → R20` / `R20 → R10`: exact artifact lineage and current eligibility remain separate.

### R17 constraints

- `R17 → R4`: independently re-derives C22-01 same-path requirement; no duplicate finding.
- `R17 → R9`: mediated through R10.
- `R17 → R10`: exact R10 artifact/release identity is contractually folded into Offer Version.
- `R17 → R19`: exact Offer/Grant becomes one segment of L1.
- `R17 → R20` / `R20 → R17`: Offer identity and current eligibility remain separate.

### R19 constraints

- `R19 → R4`, `R19 → R9`, `R19 → R10`, `R19 → R17`: direct exact historical segments of L1.
- `R19 → R20` / `R20 → R19`: lineage completeness and current boundary eligibility remain independent predicates.

### R20 capstone rule

R20 never upgrades itself into an identity owner. It consumes exact upstream identities/lineage and decides present eligibility. A failure in one upstream identity segment cannot be repaired by another currently valid segment.

**Synthesis result:** no reverse/skip-link contradiction requiring a new Phase C classification was identified.

---

# 6. Open findings that must remain visible in final certification

The hard-chain synthesis is not permission to hide defects on adjacent E2E seams.

## 6.1 `R17 → R18` — confirmed MRC

The commercial authority object / capability-binding seam remains a confirmed missing required composition. Any consequential commercial scenario that requires exact capability-binding composition remains blocked on that remediation requirement.

## 6.2 `R5 → R20` — confirmed MRC

R20 may require a material independent-confirmation predicate in scenarios governed by R5. The missing direct composition remains open and cannot be inferred from this hard-chain pass.

## 6.3 `R19 → R14` — confirmed MRC

Runtime replacement must preserve exact commercial lineage. The direct R19/R14 composition defect remains open even though R19 itself semantically requires handoff preservation.

## 6.4 `R19 → R18` — confirmed MRC

Complete commercial lineage and exact capability binding still lack required direct composition at this seam. The hard-chain pass does not repair it.

## 6.5 `R11 → R8` — open unresolved gap

The normative disposition of an active R11 reconciliation obligation after R8 reaches `EXPOSURE_COMMITTED_UNRECONCILABLE` remains unresolved.

This ambiguity does not alter the normal six-node historical identity chain, but any final E2E scenario entering that state must preserve the ambiguity and must not let R20/R19/R12 choose a reading implicitly.

---

# 7. Compound-level anti-cheat rules

The hard-chain certification fails if any implementation can pass by doing any of the following:

1. validate each segment independently but never prove all segments belong to one historical path;
2. reconstruct L1 from current joins at query/dispatch time;
3. replace an ineligible historical segment with a current successor;
4. treat same Opportunity/Product/Asset parentage as equivalence;
5. preserve one correct adjacent edge while a skip-link silently points to another generation;
6. duplicate upstream identity fields without enforcing equality;
7. treat mediator reachability as exact mediator identity;
8. let a historically correct chain bypass a failed current R20 predicate;
9. let a currently valid chain repair a historically incorrect one;
10. mutate old historical records into a coherent story instead of preserving the mismatch and creating a successor/remediation path;
11. use post-hoc authority to legitimize an effect that lacked authority when it occurred;
12. declare the chain globally safe while suppressing the four MRC defects or the C21-03 unresolved gap.

---

# 8. Provisional final Phase C conclusion

Subject to adversarial review of this synthesis, Phase C now satisfies both frozen closure dimensions:

### A. Edgewise corpus coverage

- 163 frozen edges;
- 163 unique classifications;
- 0 unclassified;
- 0 duplicates;
- 0 out-of-inventory classifications;
- 163 / 163 section pointers verified.

### B. Mandatory compound/hard-chain synthesis

Provisional result: **PASS / NO NEW COMPOUND-LEVEL DEFECT**.

The A/S1/P1/O1-G1/L1 affirmative path is semantically coherent under the recovered contracts plus committed Phase C strengthenings. D1-D6 and X1-X7 are all expected to fail at a defined owning boundary without historical mutation or current-state laundering.

### Closure meaning

A final PASS would mean:

- Phase C's global cross-node audit objective is complete;
- all pairwise and compound findings are now frozen for remediation/governance;
- implementation authority is **not** automatically restored;
- the four confirmed MRC defects, one unresolved cross-node gap, and all fixture-tier strengthenings remain active obligations for later remediation/implementation certification.

Phase C can therefore close **with documented open defects**, because its closure condition is complete classification and faithful global synthesis, not implementation remediation.

---

# 9. Requested adversarial review

Please independently challenge the full synthesis, not merely the provisional PASS. In particular:

1. **D5 / X2 / X4:** Is C22-01 plus R19's explicit one-exact-path mission sufficient to enforce equality across every separately represented R4/R9/R10/R17 identity inside L1, or is there a still-missing R19-specific composite-equality strengthening?
2. **X5 mediator equality:** Do the positive mediation cases (especially R4→R9→R10 and R9→R10→R17) actually prove exact mediator equality, or merely traversability?
3. **D6 / X6:** Does the final synthesis preserve the distinction between historically perfect lineage and present R20 eligibility without accidentally requiring historical lineage mutation after denial?
4. **X7:** Does the post-hoc-authority prohibition fully close the case where a valid current successor chain exists after a historically unauthorized/wrong path?
5. **Open findings:** Does declaring the six-node chain PASS improperly overclaim system-wide E2E safety given the four MRC defects and C21-03, or is the scope limitation explicit enough to allow Phase C audit closure with those findings preserved?
6. **Skip-link reconciliation:** Independently scan the relevant classified reverse/skip-link edges for any live strengthening, fixture, wording caution, positive precedent, or unresolved dependency that this synthesis failed to carry forward.

Do not accept the PASS merely because all adjacent edges were clean. The question is whether the complete composed authority story remains sound under deliberate multi-segment mismatch.