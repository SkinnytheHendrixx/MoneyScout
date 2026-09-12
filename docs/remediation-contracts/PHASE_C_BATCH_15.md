# Phase C Batch C-15

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-Reference Classification  
**Edges covered:** `R1 → R15`, `R2 → R18`, `R14 → R20`  
**Running total after this batch:** 45 classified edges across 15 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` count after this batch:** 3

This batch applies the active Phase C Classification Protocol and its later amendments. Each edge is classified across three independent dimensions: primary classification, semantic relation tags, and corroboration topology. `CERTIFICATION_DEPENDENCY` uses below state their gate kind explicitly.

---

## C15-01 — `R1 → R15`

### Pinned endpoint blobs

- R1: `af010e01aaaf4e3454b6e88fc390d4502151d16a`
- R15: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

### Relevant R1 source text

R1's canonical resource semantic chain is:

> `source → bucket → unit → committed → consumed → timestamp/provenance`

R1 further requires:

> **Core rule:** `UNKNOWN` is neither zero nor “every resource bucket.”

and:

> `committed` and `consumed` are separate facts.

and:

> **Additional headroom cannot increase merely because a committed ceiling has not yet been observed as consumed.**

R1 explicitly distinguishes its scope from financial evidence/reconciliation:

> **R1 vs R15/R16**
>
> R1's generic resource-attribution semantics do not replace provider-financial raw evidence capture (R15) or deterministic financial reconciliation (R16).

R1 also says in the committed-vs-consumed acceptance semantics that unconsumed commitment does not become headroom:

> until later R7/R8/R15/R16 semantics prove release or authoritative lower exposure

### Relevant R15 source text

R15's frozen mission is:

> **Provider-originating financial facts must be durably captured in their original observed form, with exact execution/provider/account provenance, before validation, normalization, aggregation, rejection, or policy interpretation can change how the system sees them.**

R15 preserves the raw observation-state family:

> `REPORTED_ZERO`  
> `REPORTED_VALUE`  
> `REPORTED_NULL`  
> `FIELD_ABSENT`  
> `NOT_APPLICABLE_BY_CONTRACT`  
> `UNPARSEABLE`  
> `UNKNOWN`

R15 also requires:

> **Original currency and unit must survive capture.**

and explicitly separates capture from interpretation:

> **R15 preserves what the provider said. R16 decides what the complete evidence set means.**

R15's R7/R16 boundaries likewise make clear that raw evidence is not itself canonical consumed/released truth.

### Complete-source adversarial question

The question was whether the governing corpus explicitly states the permitted mediation path by which provider-originating R15 evidence may update R1 resource state, or whether future implementation could directly map raw R15 observation states/amounts into R1 semantics.

Complete R1 review found no explicit mediation rule beyond the separation statement. R1 names R15/R16 as later authorities that may justify eventual headroom change, confirming that provider-financial evidence is expected to feed later resource truth, but it never says explicitly that semantic interpretation must pass through R16 before R1 state attributable to those facts is updated.

This produces the same structural shape as C12-03 (`R16 → R20`): the architecture is coherent and points in one direction, but an intentional mediator is left implicit rather than stated.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Semantic relation tags:**

- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Corroboration topology:** `UNILATERAL_DECLARATION`

**Certification-dependency gate kind:** vocabulary/interface compatibility.

`CONSUMES` is intentionally omitted. The checked text does not establish direct R1↔R15 consumption. Their relationship is that generic resource semantics and raw provider financial evidence must remain distinct and compose through the proper interpretation path.

### Required mediation clarification

The following rule is required before this seam can be treated as implementation-safe:

> **R1 resource state attributable to provider financial evidence must not be populated directly from R15 raw observation-state names or raw provider amount fields when semantic interpretation is required. R15 preserves provider-originating evidence; R16 (or another explicitly governed canonical interpreter if later designed) determines canonical financial/resource meaning; only that interpreted truth may update R1-compatible resource semantics.**

Corollaries:

1. `R15.REPORTED_ZERO` does not automatically equal an R1 known-zero resource fact without exact execution/provider/account/unit scope and valid semantic interpretation.
2. `FIELD_ABSENT`, `REPORTED_NULL`, `UNPARSEABLE`, and `UNKNOWN` must never become R1 zero merely because they are non-values.
3. `NOT_APPLICABLE_BY_CONTRACT` must not be treated as generic R1 zero unless the relevant canonical interpretation makes that exact resource concept inapplicable.
4. A raw provider amount that may be delta/cumulative/estimate/final/correction cannot become R1 `consumed` until canonical interpretation establishes that meaning.
5. Original R15 units/currency remain evidence facts; any mapping into R1 source/bucket/unit semantics must preserve exact typed identity and governed conversion/interpretation.
6. Direct-field convenience mapping may be used only where the semantic relation is deterministically identity-preserving and requires no interpretation; that exception must be explicit, not inferred.

No new behavioral fixture is required at this stage because the finding is ownership/mediation clarity, not an already-identified ambiguous runtime branch. Any implementation that introduces direct R15→R1 state mutation must independently prove it satisfies the mediation rule above or be treated as a defect.

### Why this is not `MISSING_REQUIRED_COMPOSITION`

The contracts already establish the distinct roles correctly, R1 already anticipates downstream R15/R16 facts as part of eventual safe headroom movement, and R15 explicitly routes semantic interpretation to R16. The missing element is an explicit statement of the mediator, not an absent cross-node authority family or absent representational capacity.

---

## C15-02 — `R2 → R18`

### Pinned endpoint blobs

- R2: `bf1c19387b52938f43f28f1d58c73d483c72c5ab`
- R18: `226d67276f1627c26045ead9c7717023e7e764db`

### Relevant R2 source text

R2 states:

> **Lifecycle information is provenance, not selection authority.**

and:

> Capability/provider lifecycle state may explain why a candidate was unavailable, deprecated, retired, degraded, or otherwise not selected.
>
> R2 does not own the execution-time validity of lifecycle-bound capability authority.

R2 further says:

> Lifecycle facts in R2 are **resolution provenance/reasoning inputs**, not perpetual permission to execute.

and assigns authority explicitly:

> R6 owns verified capability readiness semantics. R18 owns exact frozen-binding lifecycle revalidation. R20 owns final boundary-time authority fencing.

Its parallel boundary repeats:

> R2 may record lifecycle/provider provenance relevant to why a path was selected, but it does not own exact binding revalidation (R18) or final boundary-time authority (R20).

R2's anti-cheat rule also establishes the broader pattern that selected/fallback strings are not authority.

### Relevant R18 source text

R18's core rule is:

> **An execution authorized for capability binding B may dispatch only if that exact binding B remains eligible. A different currently-usable capability is not a substitute.**

The binding identity may include:

- capability key and exact claim;
- provider;
- provider account/tenant identity;
- credential authority identity;
- verification policy version;
- exact verification result;
- verification strength;
- lifecycle state/version;
- allowed operation scope;
- provenance/fingerprint.

R18 says:

> **Revalidation may confirm or reject an existing binding. It may not replace the binding.**

and its R6 dependency requires actual implemented/queryable canonical verification results and exact provider/account provenance rather than boolean usability.

### Adversarial question

The risk is identity laundering from planning-time R2 selection into execution-time R18 binding.

A future implementation could select provider A in R2, preserve R2 uncertainty correctly, later verify some provider-A capability through R6, and then incorrectly use R2's selected-provider field as if it were sufficient identity provenance for R18.

That would erase distinctions such as A/A1 vs A/A2, exact verification result, policy version, operation scope, credential authority, and lifecycle version.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Semantic relation tags:**

- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Corroboration topology:** `UNILATERAL_DECLARATION`

**Certification-dependency gate kind:** vocabulary/interface compatibility.

`CONSUMES` is intentionally omitted. R18 must not consume R2 planning choice as capability authority; the primary requirement is that the semantic boundary remain intact.

### Required targeted fixture

1. R2 selects provider A while account/access details remain unresolved or are merely planning provenance.
2. R6 later verifies exact capability authority A/A1 with exact verification result V1.
3. R18 may freeze binding B1 only from the exact qualifying R6 authority, not from R2's selected-provider field.
4. Changing R2's current selected/provider projection after B1 exists must not mutate or rebind B1.
5. If R2 selected provider A but only A/A2 is currently verified, an execution requiring B1/A1 may not substitute A/A2 in place.
6. `CUSTOM_BUILD_REQUIRED`, selected provider, fallback reason, lifecycle note, Architecture choice, or another R2 planning field cannot satisfy R18 binding identity.
7. Missing exact provider/account/verification identity required for R18 must fail closed rather than being inferred from R2.
8. R2 may remain useful provenance explaining why an execution path was planned, but that provenance must remain separately inspectable from the R18 authority object actually consumed at dispatch.

### Why this does not escalate

R2 explicitly disclaims execution authority; R18 explicitly requires exact R6-confirmed binding identity. The seam therefore already has the correct ownership split. The fixture makes the anti-laundering rule executable rather than filling an absent composition.

---

## C15-03 — `R14 → R20`

### Pinned endpoint blobs

- R14: `969b70e8b4b52606c9e34f617bed32a91b395d25`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

### Relevant R14 source text

R14's R20 boundary says:

> R14 transfers execution authority for a specific governed scope. It does not create perpetual permission for the successor to execute every obligation it inherits.

and:

> R20 must still revalidate applicable authority/lifecycle/resource/capability/evidence/lineage/adoption predicates at consequential boundaries after handoff.

The load-bearing separation is:

> **Transfer ownership and execution eligibility are separate authority consumptions.**

R14's authority-epoch/fencing rules require a durable monotonic authority epoch/generation/lease-fencing token or equivalent, and stale incumbent claims using the prior epoch must fail closed after transfer.

Its pre-transfer abort semantics also require current R20/lifecycle/capability/resource validity before incumbent execution can resume.

### Relevant R20 source text

R20 has a dedicated R14 boundary stating, in substance, that handoff authority does not bypass current eligibility and that inherited consequential actions still require fresh boundary-time eligibility.

R20 also requires successor validation under the new authority epoch where applicable and, as a general invariant, prior `ALLOW` is not perpetual permission; a new consequential boundary consumes a new current decision.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Semantic relation tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Corroboration topology:** `BILATERAL_CORROBORATION`

**Certification-dependency gate kind:** operational/integration.

The seam is explicit on both sides. `AUTHORITATIVE_ACTIVE` under R14 is not `CURRENTLY_ELIGIBLE` under R20.

### Required authority-epoch race fixture

1. R14 commits a successor handoff under authority epoch E2.
2. Successor S1 obtains an R20 preflight or early eligibility result for action X under E2.
3. Before X crosses its consequential boundary, a new governed replacement commits epoch E3 to successor S2.
4. S1/E2 must fail boundary validation and cannot reuse its prior R20 `ALLOW`.
5. S2/E3 must independently validate any inherited action under E3.
6. External work already crossed under E2 remains exact R8 historical truth; epoch change must not rewrite the external execution as E3 work.
7. Epoch mismatch/stale-authority rejection must remain durably distinguishable from ordinary business-rule denial so downstream repair/reconciliation can identify that the failure was fencing/authority related.
8. A stale runtime waking after E3 cannot regain consequential authority merely because an earlier R20 result under E2 was once valid.
9. Post-transfer rollback to the previous runtime must create a new governed handoff/new epoch rather than reviving E2.

### Why this does not escalate

Both contracts explicitly own the seam, R20 explicitly treats decisions as boundary-current/non-reusable, and R14 makes stale authority epochs fail closed. The fixture refines a race already within the defined mechanism rather than supplying absent composition or representational capacity.

---

## Batch C-15 result

| Edge | Primary | Tags | Topology |
|---|---|---|---|
| `R1 → R15` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` |
| `R2 → R18` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` |
| `R14 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` |

Certification kinds:

- `R1 → R15`: vocabulary/interface compatibility
- `R2 → R18`: vocabulary/interface compatibility
- `R14 → R20`: operational/integration

No additional `MISSING_REQUIRED_COMPOSITION` is established in this batch.

---

## Phase C process notes carried forward

1. **Intentional mediation must be explicit when a direct-looking semantic shortcut would be unsafe.** Separation between nodes is not enough if a future implementer could reasonably bypass the intended interpreter/authority owner.
2. **Planning provenance cannot become execution authority by proximity.** A selected provider/path may explain why an execution exists; it cannot manufacture the provider/account/verification identity the execution later requires.
3. **Boundary-time non-reusability must include fencing state.** A previously valid `ALLOW` tied to an older authority epoch cannot survive a later transfer merely because the action object itself did not change.
4. **Representability and mediation remain independent audit questions.** A node may conceptually assign ownership correctly yet still fail to represent the required identity, or may represent the identity yet leave the permitted dataflow/mediator ambiguous.
