# WI-R3 — Domain-Aware Evidence Freshness

**Normalized node:** R3  
**Historical finding:** C1-F5  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact fidelity state:** RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION  
**Implementation:** NOT STARTED  
**Closed:** NO

## Recovery provenance

This artifact is reconstructed from the WI-R3 adversarial-confirmation conversation record. It is not reconstructed from the compressed v1.0 remediation register and is not a fresh re-derivation from current code.

The recovered confirmation record preserves the exact R3 migration labels as:

- R3-M1 — Evidence database schema
- R3-M2 — Validation evidence collector output schema
- R3-M3 — Validation evidence persistence route
- R3-M4 — Factor assessment worker
- R3-M5 — Validation engine
- R3-M6 — Manual Evidence UI/schema/API
- R3-M7 — Evaluation-cycle evidence snapshot consumers
- R3-M8 — Existing evidence migration
- R3-M9 — Shared Evidence Consumer Audit
- R3-M10 — UI/reporting surfaces

This file remains **not `FIDELITY_VERIFIED`** until an independent reviewer compares the committed artifact against the original R3 confirmation exchange, including migration assignments, temporal vocabulary, acceptance fixtures, compound gates, and closure-evidence requirements.

## 1. Frozen root and mission

Historical finding **C1-F5 / MATERIAL** established that evidence freshness was not domain-aware and could be inferred from collection time even when the underlying source fact was stale, undated, or temporally inapplicable.

R3 exists to prevent “recently collected” from being mistaken for “currently true.”

> **Core rule:** collection time is not source publication/update time, and neither is automatically evidence that the fact is fresh enough for the decision being made.

Current-condition decisions may rely only on evidence whose temporal meaning and policy-relative freshness are actually established. Unknown source timing or applicability remains unknown.

## 2. Canonical temporal evidence vocabulary

The confirmed R3 contract distinguishes at least the following temporal fields/concepts:

- `collected_at`
- `source_published_at`
- `source_updated_at`
- `temporal_knowledge`
- `freshness_evaluated_at`
- `freshness_policy`
- `freshness_status`
- `temporal_basis`

The exact persistence representation may vary. These meanings may not be collapsed.

### 2.1 `collected_at`

When Money Scout obtained or recorded the evidence.

It does **not** prove when the source fact became true or was last updated.

### 2.2 `source_published_at`

When the source states or durably indicates the underlying item/fact was published.

If the source does not expose this, the value remains unknown rather than being copied from `collected_at`.

### 2.3 `source_updated_at`

When the source states or durably indicates the underlying item/fact was last updated.

If unavailable, it remains unknown. Collection time must not substitute for it.

### 2.4 `temporal_knowledge`

Represents what the system actually knows about the temporal meaning of the evidence, including whether source publication/update timing is known, partially known, inferred under an explicit rule, or unknown.

### 2.5 `freshness_evaluated_at`

When Money Scout evaluated the evidence against a specific freshness policy.

This is not itself the source time.

### 2.6 `freshness_policy`

The domain/decision-specific rule used to decide whether this evidence is fresh enough for a particular use.

Freshness is therefore not one universal TTL applied to every evidence type.

### 2.7 `freshness_status`

The result of applying the relevant freshness policy to the evidence and its temporal knowledge.

A safe implementation must distinguish at least fresh/acceptable, stale/inapplicable, and unknown/unresolved outcomes rather than defaulting uncertainty to fresh.

### 2.8 `temporal_basis`

Records which source temporal fact or rule the freshness decision actually relied on, such as source update time, publication time, an explicitly allowed domain rule, or unknown basis.

## 3. Unknown source timing stays unknown

The confirmed rule is explicit:

> **Unknown publication/update timing remains UNKNOWN. `collected_at` must never silently stand in for `source_published_at` or `source_updated_at`.**

Examples:

- an undated webpage collected five minutes ago is not automatically five-minutes-fresh;
- a stale source page re-fetched today does not become current merely because Money Scout fetched it today;
- an API response that reports its own authoritative update timestamp may support a freshness conclusion under the relevant policy;
- evidence with genuinely unknown source timing may still be usable for a non-current historical claim if the decision policy permits that exact use, but it cannot be laundered into current-condition evidence.

## 4. Freshness is domain- and decision-specific

R3 does not define one global freshness duration.

A freshness policy must be attached to the type of claim/decision being made.

Examples of different policy needs include:

- current provider availability;
- current price/cost;
- current legal/policy state;
- current operational capability;
- historical existence of an event;
- durable product facts unlikely to change rapidly.

A fact can be temporally adequate for one question and inadequate for another.

> **Evidence freshness is a property of evidence relative to a decision policy, not a property of collection timestamp alone.**

## 5. Current-condition evidence must fail closed when stale or temporally unknown

For decisions that require current state, evidence cannot be treated as decision-sufficient when:

- the applicable freshness policy says it is stale;
- the source publication/update time needed by the policy is unknown;
- the temporal basis does not match what the policy requires;
- the policy itself is missing/unknown;
- applicability to the current decision is unresolved.

This does not mean every stale or unknown evidence item must be deleted or ignored. It means the item cannot carry current-condition authority it does not actually support.

## 6. Manual Evidence dates remain semantically distinct

Manual Evidence UI/schema/API must not collapse user-entered dates into one ambiguous “date.”

At minimum, the interface must preserve the distinction among:

- when the user/Money Scout collected or entered the evidence;
- when the source says it was published;
- when the source says it was updated;
- whether those source dates are actually known;
- what temporal basis the user is asserting.

A manually entered `collected_at` must not silently populate source publication/update fields.

If the user does not know source timing, that uncertainty is represented explicitly.

## 7. R3 × R4 exact-lineage/evidence-snapshot boundary

R3 and R4 solve different problems.

R3 asks:

> Is this exact evidence temporally adequate for the decision use being attempted?

R4 asks:

> Which exact Evaluation Cycle/decision lineage did this evidence and conclusion belong to?

A fresh item attached to the wrong/current Evaluation Cycle is not valid lineage.

A correctly bound historical item may still be stale for a new current-condition decision.

The system must preserve both dimensions independently.

## 8. R3 × R20 authority boundary

R3 does not itself authorize consequential dispatch.

It supplies current evidence-freshness predicates to R20.

R20 owns when the freshness predicate must be checked at a consequential dispatch/adoption boundary and composes it with every other authority predicate.

A stale or temporally unresolved evidence predicate must not be overridden merely because other authority checks pass.

Likewise, an R3 result evaluated earlier is not automatically reusable forever; R20 owns boundary-current consumption/revalidation where required.

## 9. R3 × R4 × R20 compound

The confirmed compound prevents two independent laundering paths at once:

1. current-state freshness cannot be inferred from collection time or stale/unknown source timing;
2. evidence cannot be rebound from its originating Evaluation Cycle to whatever cycle is current at the moment of action.

The compound must prove that a consequential action cannot proceed merely because:

- the evidence was collected recently, while its underlying source fact is stale/unknown; and/or
- the current Evaluation Cycle differs from the one under which the evidence snapshot was established.

R20 must consume both exact-lineage and current-freshness truth without substituting current state for either.

## 10. Freshness revalidation across multiple Opportunities/consumers

Freshness is not a one-time global stamp that every consumer may reuse indefinitely.

If the same evidence object is consumed by multiple Opportunities, Evaluation Cycles, factors, or decision policies:

- each consumer must apply the relevant policy for that use;
- one consumer's fresh result does not automatically make it fresh for a different policy/use;
- policy changes may require re-evaluation without rewriting the original source temporal facts;
- shared evidence must retain enough immutable temporal provenance for each consumer to make its own valid freshness decision.

This is the basis for the confirmed multi-Opportunity freshness-revalidation requirement.

## 11. Known migration matrix

The original R3 confirmation froze the following exact ten migration children.

### R3-M1 — Evidence database schema

Migrate the canonical evidence persistence model to store the temporal vocabulary needed for domain-aware freshness, including source publication/update timing, temporal knowledge, freshness evaluation metadata, policy, status, and basis without replacing unknown values with collection time.

### R3-M2 — Validation evidence collector output schema

Migrate validation evidence collectors so their outputs distinguish collection time from source-reported publication/update time and explicitly represent unknown temporal facts instead of omitting them in a way later consumers can misread as current.

### R3-M3 — Validation evidence persistence route

Migrate the persistence route so collector temporal fields survive storage exactly and are not defaulted, overwritten, or synthesized from request/ingestion time.

### R3-M4 — Factor assessment worker

Migrate factor assessment so any claim requiring current/recent evidence consumes the applicable freshness policy/status rather than using collection timestamp as a freshness shortcut.

### R3-M5 — Validation engine

Migrate validation-engine decision logic so stale/unknown temporal applicability cannot become decision-sufficient for current-condition conclusions, while preserving evidence that remains valid for historical/non-current uses.

### R3-M6 — Manual Evidence UI/schema/API

Migrate manual evidence entry and APIs to preserve collection date, source publication date, source update date, temporal knowledge, and basis as distinct meanings. Unknown source dates must remain unknown.

### R3-M7 — Evaluation-cycle evidence snapshot consumers

Migrate every consumer of Evaluation-cycle evidence snapshots so it consumes evidence under the exact originating cycle and applies freshness independently rather than substituting the current cycle or assuming the snapshot's collection time proves current applicability.

### R3-M8 — Existing evidence migration

Migrate legacy evidence rows conservatively. Existing `collected_at` or ingestion timestamps may not be copied into source publication/update fields unless durable evidence proves that identity. Unprovable source timing becomes explicit unknown/legacy temporal state.

### R3-M9 — Shared Evidence Consumer Audit

Perform the confirmed shared-evidence consumer audit across every surface that reads evidence freshness or temporal fields. Classify each consumer's decision use and verify that the correct domain-specific policy and exact temporal semantics are applied.

**Audit is not repair.** Every defect discovered by R3-M9 becomes a durable migration child starting at **R3-M11+** rather than being considered closed merely because the audit found it.

### R3-M10 — UI/reporting surfaces

Migrate UI/reporting surfaces so they do not display recently collected evidence as “fresh/current” when source timing or policy-relative freshness is stale/unknown, and so manual/source/collection dates remain distinguishable where shown.

## 12. Iterative sibling-sweep discipline

R3 is an umbrella migration.

Required closure loop:

**temporal/freshness primitive → R3-M1…M10 known migrations → known-site tests → R3-M9/shared-consumer audit → semantic sibling sweep → R3-M11+ defect children → repair → repeat sweep → independent review**.

The sibling sweep must search for every surface that:

- uses `collected_at` or ingestion time as a proxy for source freshness;
- compares evidence age without a domain policy;
- drops source publication/update timing;
- defaults unknown source timing to now;
- treats one freshness result as reusable across unrelated consumers/policies;
- uses stale/unknown evidence for current-condition conclusions;
- reconstructs evidence under the current Evaluation Cycle;
- renders evidence as current/fresh without policy support.

`AUDITED` is not `FIXED`. A later discovered concrete instance remains PERSISTING scope until repaired.

## 13. Design Inputs

R3 confirmation reviewed the Design Input registry through DI-2.

### DI-1 — provider/account identity plurality

**Disposition:** REVIEWED / NOT ACTIVATED by R3 itself.

Temporal evidence may mention providers/accounts as provenance, but R3 does not by itself create a provider/account substitution authority problem. A concrete audit discovery that does activate DI-1 must be recorded and consumed by the scope that owns that identity authority.

### DI-2 — autonomous outbound payment reversal execution

**Disposition:** REVIEWED / NOT ACTIVATED.

R3 evaluates evidence freshness; it does not execute refunds, voids, cancellations, or reversals. A discovered child that introduces such execution activates DI-2 independently.

## 14. Acceptance fixtures

### A. Recently collected stale source

Source fact was last updated long ago but is fetched now.

Expected: `collected_at` is recent; source temporal fact remains old; current-condition freshness follows the relevant policy and may be stale. Re-fetching does not rejuvenate the source fact.

### B. Unknown source publication/update time

Evidence is collected now but source exposes no reliable publication/update timestamp.

Expected: source timing remains `UNKNOWN`; current-condition policy may not silently treat collection time as source time.

### C. Source-reported update time

Source exposes an authoritative update timestamp compatible with the freshness policy.

Expected: freshness may be evaluated from that source timestamp, with `temporal_basis` showing why.

### D. Policy-specific reuse

Same evidence is fresh enough for a historical/slow-changing decision but not for a fast-changing current-condition decision.

Expected: source temporal facts remain the same; policy-relative freshness results differ without rewriting evidence history.

### E. Manual evidence unknown dates

User manually enters evidence and knows when it was collected but not when the source was published/updated.

Expected: collection time is stored; source dates remain unknown; UI/API do not synthesize source dates.

### F. Legacy evidence migration

Legacy row contains only ingestion/collection time.

Expected: migration preserves that fact as collection/legacy temporal information and does not manufacture source publication/update timestamps.

### G. Multi-Opportunity revalidation

One evidence object is shared by two Opportunities or decision consumers with different freshness policies.

Expected: each consumer evaluates freshness for its own policy/use; one fresh result does not globally stamp the evidence fresh for both.

### H. R3×R4 lineage/freshness separation

Evidence E belongs to Cycle A. Cycle B becomes current later.

Expected: E remains bound to A. Any use under B requires legitimate lineage handling under R4 and independent freshness evaluation; current-cycle substitution is forbidden.

### I. R3×R20 stale-evidence authority test

A consequential boundary requires current evidence. The evidence item was recently collected but source update time is stale or unknown under the applicable policy.

Expected: R3 predicate is not current-safe; R20 blocks rather than treating recent collection as sufficient authority.

### J. R3×R4×R20 coupled test

Evidence was collected recently under Cycle A, source temporal applicability is stale/unknown, and Cycle B is now current.

Expected: action must fail if either stale/unknown freshness is laundered into “fresh” or Cycle A evidence is rebound to B. Passing only one half is insufficient.

### K. Policy-change re-evaluation

Existing immutable source temporal facts remain the same while freshness policy changes.

Expected: new freshness evaluation may differ, but original source timing/provenance is not rewritten.

### L. UI/reporting honesty

Evidence with recent collection but unknown/stale source timing is displayed.

Expected: UI/reporting must not label it “current” or “fresh” without policy support and must preserve visible distinction where dates are shown.

## 15. R7 burst-resource requirement for freshness work

Safety-required evidence revalidation is still work.

If R3 remediation or runtime freshness re-evaluation fans out across shared evidence consumers/Opportunities and consumes scarce provider/API/compute/concurrency resources, that secondary work must itself consume R7 resource authority.

A freshness repair/revalidation burst is not exempt from reservation/admission merely because its purpose is to improve safety.

This is a resource-governance composition, not a transfer of R3 scope into R7.

## 16. Vocabulary checkpoints

- `collected_at` ≠ `source_published_at`.
- `collected_at` ≠ `source_updated_at`.
- recently collected ≠ currently true.
- source timing `UNKNOWN` ≠ now.
- `freshness_evaluated_at` ≠ source update time.
- `freshness_policy` is decision/domain-specific, not one global TTL.
- evidence can be historically valid while stale for a current-condition decision.
- exact Evaluation Cycle lineage (R4) ≠ freshness (R3).
- freshness predicate (R3) ≠ final authority (R20).
- safety-required freshness work still consumes governed resources (R7) where scarce.

## 17. Parallel-not-merged boundaries

### R3 vs R4

R3 owns temporal adequacy; R4 owns exact Evaluation Cycle lineage. Neither repairs the other.

### R3 vs R20

R3 defines/evaluates the evidence-freshness predicate. R20 owns when it must be revalidated/consumed at a consequential boundary and the final allow/block decision.

### R3 vs R7

R3 does not reserve resources. R7 governs scarce-resource consumption by freshness/revalidation work where applicable.

### R3 vs evidence truth/content quality

R3 answers whether evidence is temporally applicable, not whether the substantive claim is otherwise correct, independently confirmed, or sufficient under R5.

## 18. Dependency classes

### START

R3 may begin from the confirmed C1-F5 root and live evidence surfaces. It does not require R4, R7, or R20 implementation merely to start schema/collector/UI migration work.

### LOCAL CLOSURE

R3 local closure requires:

- canonical temporal/freshness vocabulary implemented;
- R3-M1 through R3-M10 repaired/verified;
- every R3-M11+ audit/sibling defect closed;
- manual evidence date semantics migrated;
- existing evidence migration complete;
- shared-evidence consumer audit complete and all discovered defects repaired;
- multi-consumer policy-relative freshness behavior verified;
- semantic sibling sweep empty;
- independent material closure review.

R4/R20/R7 need not be globally CLOSED merely for R3 local closure, but the interfaces consumed by the required compound gates must be implementation-compatible.

### E2E CERTIFICATION

Requires at minimum:

- R3×R4 exact-lineage/evidence-snapshot behavior;
- R3×R20 stale-evidence authority behavior;
- R3×R4×R20 coupled certification;
- representative multi-Opportunity freshness revalidation;
- R7-governed burst behavior where freshness work consumes scarce resources.

## 19. Closure evidence required

`WI-R3 = CLOSED` requires evidence including:

1. implementation commit SHA;
2. schema/migration SHA where distinct;
3. exact traceability to `C1-F5 / MATERIAL`;
4. `collected_at` semantics PASS;
5. `source_published_at` semantics PASS;
6. `source_updated_at` semantics PASS;
7. `temporal_knowledge` semantics PASS;
8. `freshness_evaluated_at` semantics PASS;
9. `freshness_policy` semantics PASS;
10. `freshness_status` semantics PASS;
11. `temporal_basis` semantics PASS;
12. unknown-source-time-not-now fixture PASS;
13. recently-collected-stale-source fixture PASS;
14. manual evidence date distinction PASS;
15. policy-specific freshness reuse PASS;
16. multi-Opportunity revalidation PASS;
17. R3-M1 Evidence database schema PASS;
18. R3-M2 Validation evidence collector output schema PASS;
19. R3-M3 Validation evidence persistence route PASS;
20. R3-M4 Factor assessment worker PASS;
21. R3-M5 Validation engine PASS;
22. R3-M6 Manual Evidence UI/schema/API PASS;
23. R3-M7 Evaluation-cycle evidence snapshot consumers PASS;
24. R3-M8 Existing evidence migration PASS;
25. R3-M9 Shared Evidence Consumer Audit COMPLETE;
26. every R3-M11+ defect child discovered by the audit CLOSED;
27. R3-M10 UI/reporting surfaces PASS;
28. final repeated semantic sibling sweep empty;
29. R3×R4 exact-lineage/freshness separation PASS;
30. R3×R20 stale-evidence authority fixture PASS;
31. R3×R4×R20 coupled fixture PASS;
32. freshness-policy-change re-evaluation without source-history rewrite PASS;
33. R7 resource governance for any scarce freshness-revalidation burst PASS;
34. DI registry reviewed through DI-2 with scope-correct dispositions;
35. DI-1 not implicitly activated by temporal provider provenance alone;
36. DI-2 not activated unless a concrete child genuinely introduces reversal execution;
37. materially independent cross-model/provider confirmation.

## 20. Anti-cheat closure rule

The following does **not** close R3:

1. add a `collected_at` field;
2. compute `age = now - collected_at`;
3. declare evidence fresh if age is below a universal threshold;
4. leave source publication/update times unknown or discarded;
5. let current Evaluation Cycle consumers reuse the evidence anyway;
6. label the UI evidence “fresh.”

That implementation reproduces C1-F5 because it confuses retrieval recency with source recency and ignores decision-specific temporal applicability.

> **A freshness system is not correct if re-fetching old information can make the underlying fact look new.**

## 21. Fidelity-review checklist

Before marking this artifact `FIDELITY_VERIFIED`, compare it line-by-line against the original R3 confirmation sequence and specifically verify:

- exact R3-M1 through R3-M10 labels/surface assignments;
- the exact temporal field/vocabulary set;
- the rule that unknown publication/update timing remains unknown and collection time never substitutes;
- manual Evidence date distinctions;
- the exact freshness-policy/status semantics;
- R3-M9 Shared Evidence Consumer Audit and the rule that defects become R3-M11+ rather than closing with the audit;
- R3×R4, R3×R20, and R3×R4×R20 compound fixtures;
- multi-Opportunity freshness revalidation;
- R7-governed burst behavior where scarcity exists;
- Design Input dispositions;
- closure-evidence completeness;
- no invented migration surface or new authority beyond what was confirmed.

Until that independent comparison passes, this artifact remains **RECOVERED CANDIDATE / PENDING ADVERSARIAL FIDELITY VERIFICATION**.
