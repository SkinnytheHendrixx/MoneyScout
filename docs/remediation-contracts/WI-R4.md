# WI-R4 — Exact Evaluation-Cycle Lineage, Not Reconstructed From Current State

**Normalized node:** R4

**Workstream:** A. Decision Truth & Lineage

**Historical finding:** C1-F3

**Severity:** MATERIAL

**Contract state:** CONFIRMED

**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION

**Implementation:** NOT STARTED

**Closed:** NO

## Recovery provenance

This artifact is reconstructed directly from the WI-R4 adversarial-confirmation conversation record, including its confirmation-round amendments. It is not reconstructed from the compressed v1.0 remediation register and is not a fresh re-derivation from current code.

The prior committed R4 artifact was explicitly left in `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS` state rather than guessed. This version supersedes that block. The recovered R4-M1 through R4-M8 migration matrix, the full acceptance-fixture set, the complete closure-evidence list, and every confirmed amendment (the stale-Bet fail-closed rule with its three explicitly rejected alternatives, the `EXACT_LINEAGE`/`NOT_APPLICABLE`/`UNKNOWN` Human Action model, and the `LINEAGE_UNKNOWN` fail-closed transition rule) are recovered here.

**One item is flagged rather than guessed:** the detailed "Bet A/Cycle A → Cycle B → Factory ambiguously progresses → repository revision frozen" scenario text under §13 is, per this record, most clearly attributable to WI-R9's own confirmed contract (which states "this is already promised by WI-R4 and should now become first-class"), cross-referencing R4 rather than necessarily being verbatim R4-original text. R4's own original text is confirmed to establish the R4→R9→R10 chain and its governing invariant; the fully worked compound scenario is preserved here as consistent with both nodes' confirmed content, with this provenance note attached rather than silently presented as unambiguously R4-original.

This file remains **not** **`FIDELITY_VERIFIED`** until an independent reviewer compares it against the original R4 confirmation exchange in full.

## 1. Frozen root and mission

Historical finding **C1-F3 / MATERIAL**: evaluation-cycle identity is sometimes persisted exactly and sometimes reconstructed from whatever cycle is currently active. This lets downstream objects, approvals, Human Actions, Factory runs, and eventually commercial/economic artifacts inherit a cycle that did not actually produce or justify them.

The defect is **not** absence of cycle identity — Money Scout already has a durable Evaluation Cycle model (one `ACTIVE` cycle per Opportunity, prior cycles remain durable, lifecycle/runtime state tracks the active cycle separately, starting a materially new cycle closes the current one).

The defect is that **some downstream paths bind the originating cycle while others ask "what is active now?" later and substitute that answer.**

> **Core rule:** Carrying a cycle ID is not enough. The exact originating cycle must be propagated, and each authority transition must apply the correct eligibility rule to that exact lineage rather than substituting current mutable state.

## 2. Confirmed live defect: the Bet approval path

`createBetProposal()` is partially correct — it accepts an explicit `evaluationCycleId`, verifies the Decision Contract references the same ID, and verifies the cycle belongs to the same Opportunity.

Two gaps remain:

1. That validation proves only *this cycle exists* and *belongs to this Opportunity* — not that it is still the eligible/current cycle for this exact proposal/approval boundary.
2. `approveBet()` reloads the persisted Bet and may perform asynchronous capital-authority work, but never revalidates the Bet's evaluation cycle against the Opportunity's current eligible evaluation state before moving `PROPOSED → APPROVED`.

**Canonical stale-approval scenario:**

```
Cycle A ACTIVE
→ Opportunity underwritten BUILD
→ Bet A proposed from Cycle A
→ Bet waits for approval/capital authority
→ materially new evidence causes Cycle A to complete and Cycle B to become ACTIVE
→ approveBet(A) runs
→ no cycle/opportunity freshness check
→ Bet A becomes APPROVED even though Cycle B now represents the Opportunity's current evaluation lineage
```

That is the canonical C1-F3 failure.

## 3. Confirmed live defect: Factory demonstrates the opposite error

`startAssetFactoryRun()` selects an approved/active Bet, then separately calls `getActiveEvaluationCycle(opportunityId)`. It writes that currently-active cycle into the Factory input snapshot **and** the Factory Run's own `evaluationCycleId`, while also embedding the Bet, which may itself reference a different evaluation cycle.

The live structure can represent:

```
Bet.evaluationCycleId = A
FactoryRun.evaluationCycleId = B
```

The input fingerprint contains **both** the top-level active `evaluationCycleId` and the nested `bet.evaluationCycleId`. Factory is not merely missing lineage — it can persist two conflicting cycle identities in one supposedly immutable input snapshot.

## 4. Confirmed live defect: Human Actions repeat the reconstruction shape

`createOrReuseHumanAction()` does not accept the originating evaluation cycle from its caller. It calls `getActiveEvaluationCycle(opportunityId)` internally and stamps the returned cycle onto the Human Action, runtime state, and lifecycle event.

A workflow that began under Cycle A can block, wait, and create a Human Action after Cycle B became active, producing: underlying blocked work = Cycle A, but Human Action = Cycle B.

**The resolution path is better in one respect, and this is confirmed as the correct design principle to generalize:** `markHumanActionResolved()` records and resumes using the cycle already stored on the Human Action, rather than asking for the active cycle again.

> Once lineage is established, later steps should consume the persisted lineage, not rediscover it from current Opportunity state.

R4 must apply that principle consistently across every surface, not just resolution.

## 5. Lineage is immutable history; eligibility is evaluated state

R4 must prevent a common modeling mistake by keeping three distinct facts separate:

- **Originating cycle** — which Evaluation Cycle created or justified this artifact/action.
- **Currently active cycle** — which Evaluation Cycle is active for the Opportunity now.
- **Currently eligible lineage** — is an artifact derived from the originating cycle still allowed to progress at this exact boundary.

A new cycle beginning does not rewrite the historical origin of an old Bet. R4 must never "fix" stale lineage by changing `Bet Cycle A → Cycle B`. The correct result is: Bet remains Cycle A, Cycle B is now active, and Bet A is stale/ineligible for the next relevant authority transition unless deliberately revalidated/superseded.

> **Invariant:** Lineage is immutable history. Eligibility is evaluated state. Never repair one by rewriting the other.

## 6. Canonical lineage chain

R4 should establish an explicit lineage chain equivalent to:

```
Opportunity → Evaluation Cycle → underwriting/evidence snapshot → Bet proposal
→ Bet approval → Product Definition / Factory revision → Architecture
→ Build source/revision → Build → Release → Asset
→ Commercial authority/session → economic events
```

R4 does not implement every downstream node in that chain. Its responsibility is to define and propagate the evaluation-lineage identity contract so R9/R10/R19/R20 can carry it further without reconstruction. At any point where the exact originating cycle is known, a later consumer may not replace it with `getActiveEvaluationCycle()`.

## 7. Canonical Evaluation Lineage Reference primitive

R4 should introduce a canonical Evaluation Lineage Reference or equivalent immutable contract, conceptually:

```
opportunityId
→ evaluationCycleId
→ evaluationCycleNumber/version
→ decision/evidence snapshot identity
→ originating artifact identity
→ capturedAt
→ optional lineage fingerprint
```

The physical type is not frozen. The required properties are:

- exact Opportunity and Evaluation Cycle identity;
- immutable propagation after creation;
- stable snapshot/reference identity where the decision depends on evaluated evidence;
- no null/current-state substitution once a real cycle exists;
- explicit legacy/unknown handling rather than silently binding to current;
- deterministic comparison at later authority boundaries;
- enough identity for R20 to say whether the exact original authority remains eligible;
- enough identity for R19 commercial fingerprints to preserve exact originating evaluation lineage.

## 8. Creation-time and transition-time rules

R4 needs two different kinds of checks.

**Creation-time lineage binding:** when a new consequential artifact is derived from another artifact, it must inherit the parent's exact Evaluation Lineage Reference. Example: `Bet A → Factory Run` must mean `FactoryRun.evaluationCycleId = Bet.evaluationCycleId` unless there is an explicit re-evaluation/revision operation producing a new successor Bet or successor authority object. The implementation may not say `FactoryRun.evaluationCycleId = current active cycle`.

**Transition-time eligibility:** when an existing object crosses an authority or consequential state boundary, the system must compare the object's immutable lineage against current Opportunity/evaluation state. Examples: `PROPOSED Bet → APPROVED`; approved Bet → Factory start; Factory revision → Build authorization; later R20-controlled boundaries.

R4 owns the lineage comparison semantics. R20 later generalizes the same discipline across all authority/lifecycle/resource/evidence fences.

## 9. Exact known affected surfaces

| Surface Why it is in scope                                                                 |                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `lib/db/src/schema/lifecycle.ts`                                                           | Defines durable Evaluation Cycles, one-active-cycle constraint, and runtime active-cycle pointer.                                                                                           |
| `artifacts/api-server/src/lib/lifecycle-state.ts`                                          | Creates/completes cycles and exposes `getActiveEvaluationCycle()`, legitimate for discovering current state but unsafe when used to reconstruct historical lineage.                         |
| `lib/db/src/schema/bet.ts`                                                                 | Bet already stores `evaluationCycleId` and Decision Contract underwriting reference, making Bet the first durable downstream lineage object.                                                |
| `artifacts/api-server/src/routes/bets.ts`                                                  | Proposal validates cycle ownership/reference, but approval does not perform stale-cycle eligibility revalidation before `APPROVED`.                                                         |
| `artifacts/api-server/src/lib/asset-factory.ts`                                            | Reconstructs active cycle independently from Bet and can persist conflicting top-level vs. nested cycle identities in one Factory snapshot.                                                 |
| `artifacts/api-server/src/lib/human-gates.ts`                                              | Human Action creation dynamically stamps the currently active cycle instead of receiving the blocked workflow's originating lineage.                                                        |
| Product Definition / Architecture / Build Contract lineage consumers downstream of Factory | Must inherit the Factory/Bet originating lineage rather than reconstruct it later. Exact current defects must be confirmed during the R4 consumer audit before becoming migration children. |
| Commercial Activation / payment lineage consumers                                          | Prior audit established loss of evaluation lineage downstream. Exact current live surfaces must be inventoried under the mandatory audit rather than assumed into known migration scope.    |

The last two rows intentionally follow the R3 rule: **known defect surfaces and mandatory discovery obligations are not the same thing.**

## 10. Known migration matrix (R4-M1 through R4-M8)

### R4-M1 — Evaluation Lineage contract/schema

Define canonical immutable lineage reference usable across Bet/Factory/downstream artifacts.

### R4-M2 — Bet proposal

Require exact originating evaluation lineage and snapshot reference. Creation must fail if: the cycle does not belong to the Opportunity; the Decision Contract cycle differs; required snapshot lineage differs; or the caller tries to supply "current" without an exact durable cycle where one should exist.

### R4-M3 — Bet approval freshness

Before `PROPOSED → APPROVED`, revalidate the persisted Bet's exact lineage. Canonical test: Bet proposed Cycle A → Cycle B begins → approve Bet A → must not approve as though A were still current.

**Frozen behavior (confirmed amendment):**

> A Bet whose originating Evaluation Cycle is no longer eligible at approval time must fail closed at the approval boundary, remain historically bound to its original cycle, and must not be automatically approved, rebound to the new cycle, or automatically converted into a Human Action.

Concretely: `Bet A = PROPOSED / Cycle A → Cycle B becomes active → approveBet(A) → return STALE_EVALUATION_LINEAGE (or equivalent) → Bet A remains Cycle A → approval does not occur → durable blocker/reason is recorded → progression requires a newly validated successor path.`

**Three explicitly rejected alternatives:**

- **Rewrite A → B:** rejected because it corrupts historical lineage.
- **Automatically create successor Bet B inside R4:** rejected because that crosses into R11/re-underwriting/revision ownership.
- **Automatically create a Human Action:** rejected because stale lineage is machine-detectable and should not become a human bottleneck by default.

R4 owns detection + fail-closed transition behavior. R11 later owns the executable route that may produce a properly revalidated successor. If R11 is not yet implemented, the stale Bet simply remains blocked — which is acceptable and safer than inventing authority.

### R4-M4 — Asset Factory lineage inheritance

Factory Run must derive evaluation lineage from the approved Bet/explicit validated successor authority, not independently from `getActiveEvaluationCycle()`. A Factory snapshot may not contain contradictory authoritative cycle identities.

### R4-M5 — Factory fingerprint

The immutable Factory fingerprint must bind the exact authoritative lineage once, not fingerprint two potentially conflicting cycle values.

### R4-M6 — Human Action creation

Callers that possess originating lineage must pass it into Human Action creation. `createOrReuseHumanAction()` must not silently replace known workflow lineage with the current active cycle.

**Frozen lineage applicability model (confirmed amendment):**

> Human Actions must distinguish `EXACT_LINEAGE`, `NOT_APPLICABLE`, and `UNKNOWN`.

- **`EXACT_LINEAGE`:** action derives from a specific blocked workflow/artifact. Exact originating cycle is required and passed by caller.
- **`NOT_APPLICABLE`:** genuinely Opportunity-level action with no originating evaluation artifact, such as connecting a general account/capability that is not itself resuming Cycle-bound work. `evaluationCycleId` may be null, but this is an explicit semantic state, not missing data.
- **`UNKNOWN`:** lineage should exist but cannot be established. This is unsafe for lineage-required continuation.

**Restriction:**

> A Human Action with `NOT_APPLICABLE` lineage may not resume a lineage-bound workflow unless a later explicit transition binds it to a valid Evaluation Lineage Reference.

### R4-M7 — Human Action resolution/resume

Resolution must confirm that the stored Human Action lineage is still eligible for the requested resume action rather than assuming preservation of the original ID alone authorizes continuation. This is where R4 begins to compose with R20, without implementing general boundary fencing itself.

### R4-M8 — Existing Bet/Factory/Human Action data

Legacy objects with ambiguous or conflicting cycle identity must be: deterministically reconstructed from authoritative durable provenance; marked `LINEAGE_UNKNOWN`/`AMBIGUOUS`; or superseded/rebuilt — but never silently assigned the currently-active cycle.

**Frozen transition rule (confirmed amendment):**

> If exact lineage is required at a later authority/consequential boundary, `LINEAGE_UNKNOWN` fails closed. It may proceed only after deterministic reconstruction from durable provenance or after creation of a newly validated successor object with known lineage.

It should **not** automatically route to a Human Action. A Human Action is allowed only if the applicable R11/exhaustion policy or an inherently-human-authority rule justifies one. Humans should not be invited to "attest" historical lineage the system itself cannot prove.

**Complete amended state vocabulary:**

- `STALE_LINEAGE` → known historical origin, currently ineligible → fail closed, preserve origin, successor/revalidation required.
- `NOT_APPLICABLE` → lineage genuinely irrelevant to this object → allowed only for non-lineage-bound behavior.
- `UNKNOWN` → lineage should matter but cannot be proven → fail closed where exact lineage is required.
- `EXACT_LINEAGE` → immutable historical origin available → still subject to current eligibility checks.

## 11. Mandatory downstream lineage audit (R4-A1)

**R4-A1 — Evaluation Lineage Consumer Audit.** Audit every object and workflow downstream of Evaluation Cycle creation that can: make/record a decision; freeze an artifact; create a successor artifact; grant/consume authority; perform a commercial/economic side effect; or resume delayed work.

At minimum inventory: Research/Validation outputs; Bet proposal/approval; Product Definition; Factory Run/revisions; Architecture; Build Contract; repository/build source; Build; QA; Release; Asset; Human Actions; Commercial Activation; checkout/session/payment artifacts; economic attribution/events; remediation/resolution paths.

Each inspected consumer is classified: `NO_CYCLE_LINEAGE_REQUIRED`, `EXACT_LINEAGE_ALREADY_PRESERVED`, `DEFECT_DISCOVERED`, `UNCERTAIN_REQUIRES_ADJUDICATION`.

R4-A1 closes on complete evidenced inventory. **It does not close any defect it discovers.** Every `DEFECT_DISCOVERED` or adjudicated defective surface becomes a new numbered migration child beginning with **R4-M9+**. All M9+ children must locally pass before the final semantic sibling sweep begins.

This directly carries forward the R3 rule: **`AUDITED` ≠ `DEFECT FOUND` ≠ `DEFECT FIXED`.**

## 12. Dependency classes

### START

None. R4 can begin in parallel with R1–R3, R5, R6, R12, and R13. Its lineage contract is foundational for R9/R10/R19/R20 but does not require those nodes to exist before R4 implementation starts.

### LOCAL CLOSURE

No upstream R-node must be `CLOSED` before R4 can locally close. Local closure requires:

- canonical lineage reference defined;
- known M1–M8 migrations complete;
- R4-A1 inventory complete;
- every defect discovered by A1 receives and closes its own M9+ migration child;
- stale Bet approval blocked/revalidated correctly;
- Factory no longer substitutes current cycle for Bet lineage;
- Human Action creation no longer reconstructs known lineage from mutable current state;
- legacy ambiguous lineage handled explicitly;
- final semantic sibling sweep returns empty.

### E2E CERTIFICATION

**R4 → R9 → R10** — the primary immutable-build dependency chain. R4 tells us which evaluation lineage justified the Bet/Factory authority. R9 freezes the exact repository/build-source revision governed by that Factory lineage. R10 carries the exact built artifact identity through QA and Release.

> **Required invariant:** Exact artifact identity is not trustworthy if the decision lineage authorizing that artifact was reconstructed from a different evaluation cycle.

R9/R10 do not redefine Evaluation Cycle semantics.

**R2 × R4 × R11** (already confirmed under WI-R2): Cycle A authority → Cycle B begins → unresolved capability/economic uncertainty also exists → system must neither use stale A authority nor erase uncertainty into custom-build zero → R11 must route/version the required challenge into a corrected successor. Responsibilities: R4 lineage, R2 uncertainty truth, R11 executable revision path. R4 may locally close before this compound gate can certify.

**R3 × R4 × R20** (already confirmed under WI-R3): R4 ensures the exact cycle remains historically correct. R3 determines whether its evidence is still temporally applicable. R20 decides whether the next consequential boundary may proceed. R4 may not "refresh" Cycle A by simply associating Cycle B's evidence with A.

**R4 × R17 × R19 × R20** (commercial lineage path): R17 first binds authority to the exact offer/version. R19 then expands the fingerprint across offer + deployment/artifact + evaluation lineage + session/transaction. R20 revalidates that exact authority at each consequential boundary/adoption. R4's role is upstream and narrow:

> The evaluation lineage inserted into the commercial fingerprint must be the immutable lineage that actually justified the Asset/offer, not whichever cycle is active when checkout or activation happens.

This E2E path cannot certify before R17/R19/R20 exist.

**R4 × R9 compound certification** *(cross-referenced from WI-R9's own confirmed contract — see Recovery provenance note above)*: Bet A / Cycle A → Cycle B becomes current → Factory incorrectly or ambiguously progresses from A → repository/build-source revision is then frozen. The system must prove both: R4 — the Factory/Build authority still points to the exact eligible evaluation lineage that actually justified it; R9 — the repository/build-source snapshot frozen under that authority is immutable.

> **Required invariant:** An immutable repository revision does not legitimize stale decision authority, and correct decision lineage does not make a mutable repository revision safe. Both must be true simultaneously.

A perfectly immutable Build Source Snapshot under stale Cycle A authority is still invalid for new progression. Conversely, fresh Cycle B authority over a mutable source is still unsafe.

## 13. Vocabulary compatibility checkpoints

**R3 ↔ R4** (already frozen under WI-R3): `evaluation cycle` ≠ `evidence freshness`. A new cycle may exist with stale evidence. An old cycle may preserve historically valid evidence that is no longer eligible for current authority.

**R4 ↔ R9:** Before R9 design freeze, agree on: factory revision; evaluation lineage; build source snapshot; superseding revision; originating authority. R9 must not invent a new evaluation lineage merely because repository state changed.

**R4 ↔ R19:** Before commercial fingerprint design freeze, confirm R19 can consume R4 lineage directly.

> Commercial authority must not reconstruct Evaluation Cycle from the current Asset/Opportunity after the fact.

**R4 ↔ R20:** R4 exposes immutable lineage plus current lineage-eligibility state/identity. R20 consumes it at consequential fences. R20 must not create a second "current cycle" interpretation.

**Additional confirmed vocabulary (amendment):** the four lineage-state distinctions — `STALE_LINEAGE`, `NOT_APPLICABLE`, `UNKNOWN`, `EXACT_LINEAGE` — are part of the canonical R4 vocabulary checkpoint, not merely internal Human Action states.

## 14. Parallel-not-merged boundaries

- **R4 vs R3:** R4 owns lineage identity. R3 owns temporal evidence applicability.
- **R4 vs R11:** R4 can detect lineage invalidity. R11 owns executable challenge/revision routing.
- **R4 vs R9:** R4 freezes evaluation origin. R9 freezes repository/build-source origin.
- **R4 vs R19:** R4 supplies evaluation lineage. R19 composes it with offer/deployment/session economic lineage.
- **R4 vs R20:** R4 says "this object came from Cycle A and A is/isn't eligible under the lineage rule." R20 says "this exact boundary must revalidate and may/may not progress."
- **R4 vs R5:** Independent confirmation does not repair wrong lineage, and exact lineage does not satisfy independent-confirmation requirements.

## 15. Design Inputs

Design Input registry reviewed through: **DI-2** / Convergence Protocol v1.1 registry snapshot.

**DI-1 — Capability identity under multi-provider/multi-account execution:** Reviewed: YES. Activation crossed: NO. Required action: NOT ACTIVATED. Evidence: R4 concerns evaluation-cycle lineage, not provider/account capability substitution.

**DI-2 — Outbound Payment Reversal Execution:** Reviewed: YES. Activation crossed: NO. Required action: NOT ACTIVATED. Evidence: R4 adds no refund/cancel/void/reversal execution capability. Its lineage contract will later be consumable by DI-2 work if that Design Input activates.

If DI-3+ exists before design freeze, this section becomes schema-invalid until the full registry is enumerated.

## 16. Acceptance fixtures

**A. Bet creation.** Cycle A Bet can be created with a Cycle A Decision Contract. Cycle ID belonging to another Opportunity fails. Decision Contract Cycle A plus Bet Cycle B fails. Missing lineage where exact cycle is required fails rather than silently selecting current.

**B. Stale Bet approval (canonical C1-F3 test).** Cycle A active → propose Bet A → start Cycle B → approve Bet A. Expected: Bet A does not become `APPROVED` merely because capital authority is valid; Bet A remains historically bound to A; no code rewrites it to B.

**C. Factory mismatch.** Bet A approved/eligible → Cycle B later active → start Factory from Bet A. Factory may reject/revalidate/supersede according to lineage policy, but may not persist `FactoryRun authoritative cycle = B` while `approved Bet = A` as though that were one coherent lineage.

**D. Human Action.** Workflow under Cycle A blocks. Cycle B begins before Human Action creation. The Human Action must either retain Cycle A lineage, or be explicitly created as a new B-scoped successor action through a defined transition. It may not silently become B because B is current.

**E. Resume.** Human Action A resolves while Cycle B is current. Stored Cycle A lineage remains A. Resume eligibility is evaluated explicitly. Resolution does not automatically authorize Cycle A work to continue.

**F. Legacy.** Ambiguous legacy object does not get stamped with today's active cycle. Known lineage reconstructs only from durable provenance. Unresolvable lineage remains `UNKNOWN`/`AMBIGUOUS` and fails closed where exact authority is required.

**G. Compound R2 gate.** Cycle A stale + unresolved capability uncertainty does not produce a clean successor Architecture without R2 truth preservation and R11 challenge routing.

**H. Compound R3/R20 gate.** Cycle A exact lineage + later-stale evidence remains independently inspectable and cannot be relabeled into Cycle B authority.

**I. Commercial future integration.** Commercial fingerprint tests, once R19 exists, prove exact Evaluation Cycle survives: Asset → Activation → checkout/session → payment event → refund/reversal lineage if DI-2 later activates.

## 17. Semantic sibling sweep

After M1–M8 pass, R4-A1 completes, and every M9+ discovered child closes, run the iterative sibling sweep.

Search for semantic patterns including:

- `getActiveEvaluationCycle()` used while an originating artifact already has a cycle ID;
- `activeEvaluationCycleId` substituted into a successor object instead of inherited lineage;
- cycle IDs omitted from immutable successor artifacts;
- cycle IDs reconstructed from Opportunity current state at approval/resume/adoption time;
- Bet/Factory/Build/Asset objects containing conflicting cycle identities;
- current mutable Asset/Opportunity used to reconstruct historical commercial/economic lineage;
- resume paths using current cycle rather than persisted blocked-work lineage;
- code that rewrites an object's originating cycle to "refresh" it.

Any new instance becomes the next M-number. The sweep repeats until a complete pass returns no new semantic instance.

## 18. Explicit non-goals

R4 must not:

- decide whether evidence is fresh — that is R3;
- independently confirm material conclusions — that is R5;
- implement challenge/revision ownership — that is R11;
- freeze repository source identity — that is R9;
- carry SHA identity through QA/Release — that is R10;
- bind exact commercial offer/deployment/session authority — that is R17/R19;
- implement general consequential boundary fencing — that is R20;
- automatically kill every artifact whose originating cycle is no longer active;
- rewrite old artifacts to the new active cycle;
- treat "ACTIVE cycle" as synonymous with "historically originating cycle."

The goal is exact lineage and explicit eligibility, not automatic lifecycle policy.

## 19. Closure evidence required

`WI-R4 = CLOSED` requires:

1. implementation SHA;
2. schema/migration SHA if applicable;
3. exact traceability to `C1-F3 / MATERIAL`;
4. R4-M1 Evaluation Lineage contract/schema PASS;
5. R4-M2 Bet proposal PASS;
6. R4-M3 Bet approval freshness PASS, including the `STALE_EVALUATION_LINEAGE` fixture and proof none of the three rejected alternatives occurred;
7. R4-M4 Asset Factory lineage inheritance PASS;
8. R4-M5 Factory fingerprint PASS;
9. R4-M6 Human Action creation PASS, including the `EXACT_LINEAGE` / `NOT_APPLICABLE` / `UNKNOWN` distinction and the `NOT_APPLICABLE` resume restriction;
10. R4-M7 Human Action resolution/resume PASS;
11. R4-M8 Existing data migration PASS, including the `LINEAGE_UNKNOWN` fail-closed rule and the no-automatic-Human-Action rule;
12. complete R4-A1 audit report;
13. every R4-M9+ defect child individually PASS;
14. before-fix stale-Bet approval fixture PASS;
15. before-fix Factory dual-cycle fixture (Bet A / top-level B) PASS;
16. after-fix Bet approval lineage fixture PASS;
17. after-fix Factory lineage inheritance fixture PASS;
18. Human Action lineage creation/resume fixture PASS;
19. legacy ambiguous-lineage fixture PASS;
20. R3↔R4 vocabulary compatibility PASS;
21. R4↔R9 interface compatibility PASS or `PENDING E2E` without blocking R4 local closure;
22. R4↔R19 compatibility PASS or `PENDING E2E`;
23. R4↔R20 compatibility PASS or `PENDING E2E`;
24. complete Design Input inventory/version evidence;
25. final iterative semantic sibling sweep with zero new instances;
26. independent cross-model/provider confirmation;
27. reviewer confirmation that no implementation "fixed" stale objects by rewriting their originating cycle.

## 20. Dependency result

R4's local path is independent: R4 may start now and may locally close without R9/R10/R11/R17/R19/R20. Its primary downstream chain remains **R4 → R9 → R10 → R17 → R19 → R20**, with R6 parallel where capability verification is relevant. Compound certification preserves both already-established gates: **R2 × R4 × R11** for stale lineage plus unresolved Architecture uncertainty, and **R3 × R4 × R20** for stale-evidence authority.

The live code proves both halves of C1-F3 directly. Bets persist explicit evaluation lineage, but approval does not check whether that lineage has become stale; Factory then separately reads the currently active cycle and stores it alongside a Bet that can reference another cycle. Human Action creation independently repeats the same mutable-current-state pattern by looking up the active cycle at creation time rather than receiving the blocked workflow's lineage from its caller.

That is exactly why R4 is not "add an `evaluationCycleId` field." The fields already exist. R4 is: **propagate the right lineage once, preserve it immutably, and evaluate eligibility without reconstructing history from current state.**

## 21. Fidelity-review checklist for this recovered artifact

Before changing this artifact to `FIDELITY_VERIFIED`, the reviewer must compare it line-by-line against the original R4 confirmation exchange and specifically verify:

- the exact R4-M1 through R4-M8 labels and scope assignments;
- the stale-Bet fail-closed behavior and all three explicitly rejected alternatives;
- the complete `EXACT_LINEAGE` / `NOT_APPLICABLE` / `UNKNOWN` Human Action model and the `NOT_APPLICABLE` resume restriction;
- the `LINEAGE_UNKNOWN` fail-closed transition rule and the no-automatic-Human-Action rule;
- the R4-A1 audit and its `AUDITED ≠ DEFECT FOUND ≠ DEFECT FIXED` discipline with M9+ numbering;
- every acceptance fixture (A through I);
- the R2×R4×R11 and R3×R4×R20 compound gates as confirmed under their originating nodes;
- the R4×R9 compound certification and its cross-referenced provenance;
- the complete numbered closure-evidence list;
- that no content was imported from the compressed v1.0 matrix as if it were original authority;
- that no reconstructed wording narrows, expands, or infers beyond the confirmed root.

Until that review passes, this file remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.