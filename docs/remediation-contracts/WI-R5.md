# WI-R5 — Require Independent Confirmation Before Material Autonomous Conclusions Close

**Normalized node:** R5

**Workstream:** A. Decision Truth & Lineage

**Historical finding:** C1-F4

**Severity:** MATERIAL

**Contract state:** CONFIRMED

**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION

**Implementation:** NOT STARTED

**Closed:** NO

## Recovery provenance

This artifact is reconstructed directly from the WI-R5 adversarial-confirmation conversation record, including its confirmation-round amendments. It is not reconstructed from the compressed v1.0 remediation register and is not a fresh re-derivation from current code.

The prior committed R5 artifact was explicitly left in `FIDELITY_SOURCE_INCOMPLETE / RECOVERY BLOCKED ON EXACT SOURCE DETAILS` state rather than guessed. This version supersedes that block. The recovered R5-M1 through R5-M8 migration matrix, the amended M8 `LEGACY_UNCONFIRMED` policy (including the explicitly rejected blanket re-confirmation alternative), R5-A1, the complete acceptance-fixture set, and the 20-item closure-evidence list are recovered here from the actual confirmation exchange.

This file remains **not** **`FIDELITY_VERIFIED`** until an independent reviewer compares it against the original R5 confirmation exchange in full.

## 1. Frozen root and mission

Historical finding **C1-F4 / MATERIAL**: the live Autonomous Resolution worker is instructed to return `RESOLVED` when its method believes it has settled the unresolved question well enough. The executor treats any single method returning `RESOLVED` as sufficient to set `resolvedInternally = true` and immediately stops running later methods — including later, stronger methods such as `ADVERSARIAL_REVIEW` that were never reached.

The lifecycle route then records `AUTONOMOUS_RESOLUTION_RESOLVED` and marks the Opportunity activity as `RESOLUTION_COMPLETE` using that same latest worker result.

The current authority chain is effectively: model proposes conclusion → same model says `RESOLVED` → orchestrator accepts `RESOLVED` → resolution closes.

> **Core rule:** A model-generated material conclusion may propose closure, but it may not be the sole evidence that closure is justified.

R5 does not decide whether evidence is true, fresh, or sufficient for capital/execution authority. It prevents one autonomous reasoning execution from being both proposer and sole closer of a materially consequential conclusion.

## 2. This is not "always run every step"

R5 must not be implemented as "ignore `RESOLVED` and blindly execute all seven methods every time." That would confuse independence with mechanical repetition and would waste scarce resources.

The real distinction is **candidate resolution** versus **confirmed resolution**. A worker may determine "I believe this question is resolved" — that produces something equivalent to `RESOLUTION_CANDIDATE`, not final closure when the conclusion is material. The orchestrator then asks an independent confirmation source to challenge the exact candidate. Only after confirmation may the material question become canonically `RESOLVED`.

## 3. Materiality is a deterministic policy decision, not a prompt judgment

R5 cannot depend on individual callers remembering whether a conclusion "feels important."

A Resolution result is material when accepting it can materially change or preserve one of these states without further independent adjudication: BUILD vs. do-not-BUILD posture; KILL/REJECT posture; removal of a validation/research blocker; acceptance of a commercial buyer/pricing/distribution thesis; conclusion that an economically important uncertainty no longer blocks progression; conclusion that further investigation is unnecessary where the result can affect Bet creation/approval or Product/Factory progression; any conclusion later used as affirmative evidence for capital, Build, release, commercial, or other consequential authority.

Presumptively material examples from the current recommendation enum include `BUILD_SUPPORTED`, `KILL_SUPPORTED`, and any `RETURN_TO_*`/resolved conclusion that clears a blocking uncertainty and allows progression. `PLAN_EXPERIMENT` need not necessarily be treated as material closure because it can explicitly preserve the unresolved question. `WATCH_FOR_DELTA` may similarly be a temporal disposition rather than closure, though its trigger validity belongs to R11/R12. The exact decision table can be implemented declaratively, but materiality itself cannot remain an unstructured prompt judgment.

**Frozen materiality default (confirmed amendment):**

> Any autonomous conclusion type, recommendation, disposition, or blocker-removal effect that is not explicitly classified by the materiality policy defaults to MATERIAL and therefore requires independent confirmation before canonical closure. Only an explicit policy entry may downgrade a conclusion class to non-material.

Evolution rule: new enum value / new conclusion shape / new recommendation → UNCLASSIFIED → MATERIAL BY DEFAULT → independent confirmation required → deliberate policy review may later classify it otherwise.

> **Unknown materiality must never be interpreted as non-material.**

## 4. Independence standard

For a model-generated material conclusion, independent confirmation must **not** be: the same model execution; the same response parsed twice; the same model under a different system prompt; the same provider/model family merely relabeled as "critic" if the governing independence policy requires cross-family review; a deterministic wrapper that simply checks schema validity.

The confirmation source must contribute materially independent judgment. The acceptable mechanism may vary by conclusion type:

- **Model-adjudicable conclusion** → materially independent model/provider-family reviewer.
- **Deterministically verifiable conclusion** → a deterministic verifier against authoritative facts may satisfy confirmation if the closure claim is fully reducible to those facts.
- **Hybrid conclusion** → independent model challenge plus deterministic invariant checks where applicable.

R5 does not freeze a single provider implementation. It does freeze this rule: **independence is about decision source, not prompt role.**

## 5. The existing `ADVERSARIAL_REVIEW` method is not sufficient independence by itself

The existing ladder includes an `ADVERSARIAL_REVIEW` method whose prompt explicitly tries to disprove both the obstacle and optimistic interpretation. That is useful reasoning structure. But under the current architecture: it may never run because an earlier method can self-resolve; when it does run, it uses the same provider/model execution pathway; the same resolution system still interprets its own result as final.

R5 preserves `ADVERSARIAL_REVIEW` as an internal reasoning method, while adding a separate closure-confirmation boundary. **Internal adversarial reasoning and independent confirmation are not synonyms.**

## 6. Confirmation outcome model

A material candidate reaches one of at least three confirmation outcomes:

- **`CONFIRMED`** — independent reviewer agrees the concrete closure test is satisfied.
- **`CHALLENGED`** — reviewer identifies a concrete unresolved contradiction/failure scenario.
- **`INCONCLUSIVE`** — reviewer cannot confirm or falsify closure with available evidence.

Only `CONFIRMED` permits canonical material closure. `CHALLENGED` returns the issue to the resolution/revision path. `INCONCLUSIVE` preserves the unresolved state — it may feed further research, experiment, WATCH, or later exhaustion handling, but cannot be silently treated as confirmation. The candidate proposer cannot convert `CHALLENGED` or `INCONCLUSIVE` back to `CONFIRMED` by reassertion.

**Frozen symmetry (confirmed amendment):**

> `INCONCLUSIVE` records that independent confirmation could not establish closure. R5 preserves the unresolved state and the confirmation evidence. It does not choose or execute the next research, experiment, WATCH, replan, or escalation step. Where further action is required, R11 or the applicable workflow owner selects and executes that successor path.

Likewise: `CHALLENGED` → R5 records challenge and blocks closure → R11 owns successor/revision path. `INCONCLUSIVE` → R5 records insufficiency and blocks closure → R11/applicable workflow owner owns next action. R5's boundary is symmetrical across both non-confirming outcomes.

## 7. Confirmation must bind the exact candidate

Independent review must not review an amorphous "same topic." It must bind: Opportunity → exact Evaluation Lineage Reference where applicable → exact Resolution Problem → exact unresolved question → exact candidate conclusion → exact evidence/reference snapshot → exact candidate method/run → exact recommendation → candidate fingerprint.

If the candidate or its evidence materially changes after review, prior confirmation does not automatically apply. This is the R5/R4 seam: **R4 tells R5 which exact lineage/candidate is being reviewed. R5 tells R4 whether that exact candidate received independent confirmation.**

## 8. Exact known affected surfaces

| Surface Why it is in scope                                      |                                                                                                                                                                                                       |
| --------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `artifacts/api-server/src/lib/autonomous-resolution-workers.ts` | Any worker may currently return `RESOLVED`; `executeAutonomousResolutionAdvance()` immediately stops on that result.                                                                                  |
| `artifacts/api-server/src/lib/autonomous-resolution-engine.ts`  | Defines the resolution ladder, including internal `ADVERSARIAL_REVIEW`, and Exhaustion Certificate semantics. Internal review must remain distinct from closure confirmation.                         |
| `artifacts/api-server/src/routes/autonomous-resolution.ts`      | Persists worker conclusions and currently records `AUTONOMOUS_RESOLUTION_RESOLVED` directly when `resolvedInternally` is true.                                                                        |
| Resolution persistence schema / `researchRunsTable` usage       | Current resolution state is stored as generic research-run notes. Confirmed vs. candidate vs. challenged closure needs durable identity/provenance rather than being inferred from text/status alone. |
| Lifecycle-event consumers                                       | `AUTONOMOUS_RESOLUTION_RESOLVED` must mean independently confirmed material closure when materiality requires it, not merely "a worker returned `RESOLVED`."                                          |

Other autonomous conclusion surfaces are not yet asserted as confirmed R5 defects. They belong in the mandatory decision-closure audit (R5-A1).

## 9. Known migration matrix (R5-M1 through R5-M8)

### R5-M1 — Resolution result semantics

Separate "worker says `RESOLVED`" from "canonical issue is independently confirmed resolved." A worker `RESOLVED` becomes a candidate when materiality requires confirmation.

### R5-M2 — Resolution advance behavior

`executeAutonomousResolutionAdvance()` may stop the proposal ladder when a strong candidate exists, but it must transition to confirmation rather than canonical closure. It may not set final `resolvedInternally=true` for material closure solely from worker output.

### R5-M3 — Independent confirmation execution

Add the independent review/verification step with explicit reviewer identity and independence validation.

### R5-M4 — Confirmation persistence

Persist candidate, reviewer, outcome, exact fingerprint/lineage/evidence reference, and challenge details durably.

### R5-M5 — Lifecycle outcome

`AUTONOMOUS_RESOLUTION_RESOLVED` and `RESOLUTION_COMPLETE` may be emitted for material conclusions only after qualifying confirmation. Before confirmation, state should be equivalent to `RESOLUTION_CONFIRMATION_PENDING`.

### R5-M6 — Challenge behavior

A `CHALLENGED` result preserves the original candidate and review evidence and reopens/reroutes the unresolved problem. It does not silently mutate the old candidate into a different answer.

### R5-M7 — Inconclusive behavior

`INCONCLUSIVE` remains unresolved. It may trigger further permissible resolution work but cannot be interpreted as weak confirmation.

### R5-M8 — Existing persisted resolutions

**Frozen amended policy:**

> Every pre-R5 material autonomous resolution is `LEGACY_UNCONFIRMED` by default.

A legacy conclusion can leave that state only in one of two ways:

1. **Historical proof** — durable evidence demonstrates that qualifying independent confirmation actually occurred against the exact conclusion/evidence/lineage under an independence standard equivalent to R5.
2. **Re-confirmation** — the legacy candidate is reconstructed sufficiently to undergo a new qualifying independent confirmation.

Until one of those succeeds: historical records remain intact; the conclusion may be displayed as historical/unconfirmed; it may not serve as affirmative authority for a new consequential action; it may not be grandfathered merely because it previously drove state.

**Explicitly rejected alternative:** a blanket "re-confirm every legacy record immediately" policy. Old dormant conclusions need not consume resources until they are actually about to be reused. **The trigger is reuse as current authority, not mere existence.**

This is per-record evidence-based treatment under one global default, not a migration mode someone chooses arbitrarily.

## 10. Mandatory decision-closure audit (R5-A1)

**R5-A1 — Autonomous Material Closure Audit.** Audit every autonomous path capable of turning a model-generated conclusion into durable canonical state.

At minimum inspect: Research verdict changes; Demand Check conclusions; Validation/Underwriting verdicts; Kill-screen closure; Autonomous Resolution; Product/Architecture review closure; Bet recommendation/underwriting outputs; commercial-plan conclusions; remediation/recovery conclusions; any AI-generated conclusion that can remove a blocker or establish readiness.

Classify each: `NON_MATERIAL`, `INDEPENDENT_CONFIRMATION_ALREADY_PRESENT`, `DETERMINISTIC_VERIFICATION_SUFFICIENT`, `R5_DEFECT_DISCOVERED`, `UNCERTAIN_REQUIRES_ADJUDICATION`.

R5-A1 closes only when the inventory is complete and every surface has evidence for its classification. **R5-A1 does not close defects it discovers.** Every `R5_DEFECT_DISCOVERED` becomes a numbered migration child starting at **R5-M9+**.

This preserves: **`AUDITED` ≠ `DEFECT FOUND` ≠ `DEFECT FIXED`.**

## 11. Independence policy and cost

R5 must not silently weaken independence merely because a second review has cost. But it also must not force expensive review of every trivial inference. Therefore: materiality determination decides whether confirmation is mandatory. If mandatory, resource authority still applies to the confirmation execution. A required confirmation whose permitted resource is unavailable remains PENDING/BLOCKED, not self-confirmed.

> **Lack of budget or entitlement for independent review cannot convert a self-certified material conclusion into a confirmed one.**

R7 later governs reservation of the required review resource. R5 only preserves the requirement.

**Confirmed burst-composition amendment:**

> Multiple candidate confirmation burst variant. Scenario: multiple Opportunities/candidates reach `RESOLUTION_CONFIRMATION_PENDING` → confirmation executions become runnable at roughly the same time, including after outage/recovery or backlog drain → each candidate independently requires a paid/scarce reviewer execution.
>
> Required invariant: independent-review necessity does not create resource authority. Every confirmation execution remains subject to R7's aggregate reservation discipline across cash, entitlement, provider, account, and shared-resource scopes.

R5 determines that confirmation is required. R7 determines whether the required reviewer execution may reserve resources and dispatch. Lack of reservation leaves the candidate pending. The confirmation path must not bypass R7 because it is labeled "review," "critic," or "verification."

> **Reusable system rule:** Safety-required secondary work is still work. Review, confirmation, reconciliation, remediation, and verification do not become resource-free merely because their purpose is safety.

## 12. Start dependencies

None. R5 can begin now. It does not require R3, R4, R6, or R11 to be implemented before its confirmation primitive can be designed and locally tested.

## 13. Local closure dependencies

R5 local closure requires: candidate/final resolution semantics separated; deterministic materiality rule; independent confirmation contract implemented; independence identity inspectable; known M1–M8 migrations complete; R5-A1 complete; all M9+ discovered defects closed; challenged/inconclusive behavior implemented; legacy self-certified material resolutions handled; semantic sibling sweep returns empty.

R4 need not be `CLOSED` for R5 local closure, but R5 must have a lineage-compatible interface so exact candidate binding can compose later.

## 14. End-to-end certification dependencies

**R4 × R5 — correct candidate, independently confirmed.** R4 and R5 solve two independent questions: R4 — did this conclusion come from the correct Evaluation Cycle/evidence lineage? R5 — did an independent source confirm the material conclusion?

> Required invariant: independent confirmation of the wrong lineage is still wrong; exact lineage without independent confirmation is still unconfirmed.

Scenario: Cycle A produces Candidate X → Cycle B begins → independent reviewer confirms Candidate X. The system may preserve Candidate X / Cycle A / `CONFIRMED` historically, but that does not automatically establish that Cycle A remains eligible for new progression. R4 governs current lineage eligibility. R5 governs confirmation of Candidate X itself.

**R3 × R5 — fresh evidence and independent confirmation are orthogonal.** A reviewer may independently confirm a conclusion based on stale/temporally-unknown evidence. That does not make the evidence fresh. Likewise, fresh evidence does not satisfy independent confirmation.

> Required invariant: freshness cannot substitute for independence, and independence cannot substitute for freshness.

**R5 × R11 — challenged conclusion must have an executable owner.** R5 can produce `CHALLENGED`. It should not invent the successor/replan mechanism. R11 owns the executable route for challenge/revision where applicable. R5 may locally close before R11 exists, provided `CHALLENGED` fails closed instead of being silently accepted.

**R5 × R20 — confirmation freshness at consequential boundaries.** A candidate may have been validly confirmed earlier, while the underlying authority/evidence/lifecycle state changes later. R5's confirmation is historical fact. R20 decides whether that confirmation remains sufficient at the next consequential boundary.

> R5 must not imply: CONFIRMED ONCE = AUTHORIZED FOREVER.

**R5 × R7 — confirmation executions consume reservation authority just like any other scarce execution workload, including burst conditions** (see §11).

## 15. Vocabulary compatibility checkpoints

**R4 ↔ R5:** agree on candidate lineage; reviewed snapshot; candidate fingerprint; superseded cycle; historical confirmation; current eligibility.

**R3 ↔ R5:** agree on evidence quality; freshness; confirmation; challenge. A confirmation result cannot silently overwrite R3 freshness.

**R5 ↔ R11:** agree on `CHALLENGED`; `INCONCLUSIVE`; unresolved; successor; replan/revision. R11 must not treat "review exists" as "confirmation passed."

**R5 ↔ R20:** agree on `confirmed_at`; confirmation fingerprint; authority fence; revalidation.

## 16. Parallel-not-merged boundaries

- **R5 vs R3:** R3 establishes temporal applicability. R5 establishes independent confirmation.
- **R5 vs R4:** R4 establishes lineage. R5 establishes independent closure.
- **R5 vs R6:** R6 determines whether a capability/verifier is strong enough for a claimed capability state. R5 determines whether a material reasoning conclusion received independent confirmation. A strong capability verifier is not automatically an independent decision reviewer.
- **R5 vs R11:** R5 detects confirmation failure/challenge. R11 owns executable correction/revision.
- **R5 vs R20:** R5 records confirmed historical judgment. R20 governs future consequential adoption/revalidation.

## 17. Design Inputs

Design Input registry reviewed through: **DI-2** / Convergence Protocol v1.1 registry snapshot.

**DI-1 — Capability identity under multi-provider/multi-account execution:** Reviewed: YES. Activation crossed by R5: NO. Required action: NOT ACTIVATED. Evidence: R5 defines decision-review independence, not simultaneous execution across multiple provider/account capability scopes. If future implementation adds multi-provider reviewer routing, DI-1 must be reevaluated at that work item's scope before design freeze.

**DI-2 — Outbound Payment Reversal Execution:** Reviewed: YES. Activation crossed: NO. Required action: NOT ACTIVATED. Evidence: R5 adds no payment mutation or reversal capability.

If DI-3+ exists before design freeze, the entry becomes schema-invalid until the complete registry is enumerated.

## 18. Acceptance fixtures

**A. Canonical self-certification failure.** `DIRECT_RESEARCH` → worker returns `RESOLVED + BUILD_SUPPORTED + HIGH`. Expected: material candidate created; resolution does not become canonically complete; lifecycle does not emit material `AUTONOMOUS_RESOLUTION_RESOLVED`; independent confirmation required.

**B. Confirmation success.** Candidate X → independent reviewer confirms X against exact candidate/evidence/lineage. Expected: `CONFIRMED` → canonical resolution may close.

**C. Challenge.** Candidate X → independent reviewer provides concrete contradiction. Expected: `CHALLENGED` → X remains durable historical candidate; no closure; unresolved/challenge path persists; proposer cannot overwrite review by repeating X.

**D. Inconclusive.** Reviewer cannot establish closure. Expected: `INCONCLUSIVE` → issue remains unresolved; no "weak pass."

**E. Candidate mutation.** Candidate X confirmed. Candidate materially changes to X2 or evidence snapshot changes. Expected: prior confirmation does not confirm X2.

**F. Independence identity.** Same model response reused as critic fails. Same execution under a "reviewer" role fails. A qualifying independent reviewer/verifier passes according to policy.

**G. Non-material outcome.** Worker proposes a reversible experiment while explicitly preserving unresolved question. Expected: no unnecessary final-closure confirmation merely to create the experiment proposal, assuming no separate material authority is granted.

**H. Legacy.** Legacy material self-certified resolution cannot be reused as confirmed authority without qualifying treatment under M8.

**I. R3 composition.** Fresh but unconfirmed evidence fails R5 closure. Confirmed but stale evidence fails the appropriate R3/R20 eligibility path.

**J. R4 composition.** Independent confirmation binds exact Cycle A candidate and cannot be transplanted to Cycle B.

## 19. Semantic sibling sweep

After M1–M8 complete, R5-A1 inventory completes, and all M9+ discovered migrations close, run the iterative semantic sweep.

Search for patterns including: `status === "RESOLVED"` directly creating canonical readiness; model recommendation directly changing durable lifecycle state; same model execution acting as proposal and closure; "adversarial" prompt/persona being treated as independent confirmation; schema validation mistaken for conclusion confirmation; `BUILD_SUPPORTED`/`KILL_SUPPORTED` consumed without independent review; material blocker removed solely from one model result; legacy model conclusion reused as if independently confirmed.

Every new semantic instance becomes a migration child. Repeat until a complete pass finds none.

## 20. Explicit non-goals

R5 must not: require two models for every trivial inference; force every resolution method to execute after a candidate is already strong enough for independent confirmation; define evidence freshness, which is R3; define evaluation lineage, which is R4; determine verifier strength for capabilities, which is R6; implement challenge/revision ownership, which is R11; grant capital/provider authority; equate "different prompt" with independent reviewer; let Human Action attestation stand in for independent factual confirmation unless the question is genuinely human judgment/authority; turn confirmation into permanent future authority.

## 21. Closure evidence required

`WI-R5 = CLOSED` requires:

1. implementation SHA;
2. schema/migration SHA if applicable;
3. M1–M8 individually PASS;
4. complete R5-A1 audit;
5. every M9+ discovered child PASS;
6. before-fix fixture proving one worker `RESOLVED` stops the ladder and produces `RESOLUTION_COMPLETE`;
7. after-fix candidate/confirmation fixture;
8. challenged fixture;
9. inconclusive fixture;
10. candidate-mutation invalidation fixture;
11. reviewer-independence fixture;
12. non-material outcome fixture proving R5 does not over-confirm reversible intermediate work;
13. legacy-resolution fixture;
14. R3↔R5 compatibility PASS;
15. R4↔R5 compatibility PASS;
16. R5↔R11 compatibility PASS or `PENDING E2E`;
17. R5↔R20 compatibility PASS or `PENDING E2E`;
18. complete DI inventory/version evidence;
19. final sibling sweep with zero new instances;
20. independent cross-model/provider closure review of the R5 implementation itself.

## 22. Dependency result

R5 remains locally parallel: R5 may start now and may locally close without R11/R20. Its important compositions are: R3 + R5 (freshness truth + independent judgment); R4 + R5 (correct lineage + independent judgment); R5 + R11 (challenge detection + executable correction); R5 + R20 (historical confirmation + future consequential revalidation).

The live code makes the core defect direct: any worker method may return `RESOLVED`; `executeAutonomousResolutionAdvance()` immediately sets `resolvedInternally=true` and stops, and the lifecycle route then records `AUTONOMOUS_RESOLUTION_RESOLVED`/`RESOLUTION_COMPLETE` from that same result. So R5 is not "add an adversarial prompt." That prompt already exists. R5 is: **separate proposal from closure, require independent confirmation for material conclusions, and bind that confirmation to the exact candidate it actually reviewed.**

## 23. Fidelity-review checklist for this recovered artifact

Before changing this artifact to `FIDELITY_VERIFIED`, the reviewer must compare it line-by-line against the original R5 confirmation exchange and specifically verify:

- the exact R5-M1 through R5-M8 labels and scope assignments;
- the amended M8 `LEGACY_UNCONFIRMED` policy and the explicitly rejected blanket re-confirmation alternative;
- the materiality-default amendment ("unclassified → MATERIAL by default");
- the `CONFIRMED`/`CHALLENGED`/`INCONCLUSIVE` outcome model and the amended INCONCLUSIVE/CHALLENGED symmetry (R5 records, R11 routes);
- the R5-A1 audit classifications and M9+ numbering rule;
- every acceptance fixture (A through J);
- the R7 burst-composition amendment and its "safety-required work is still work" rule;
- R3×R5, R4×R5, R5×R11, R5×R20 compound boundaries;
- the complete 20-item closure-evidence list;
- that no content was imported from the compressed v1.0 matrix as if it were original authority;
- that no reconstructed wording narrows, expands, or infers beyond the confirmed root.

Until that review passes, this file remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.
