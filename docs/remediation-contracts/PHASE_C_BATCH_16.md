# Phase C Batch 16

**Status:** REVIEWED / ADJUDICATED / COMMITTED

This batch classifies three frozen cross-reference edges under the Phase C Classification Protocol:

- `R3 → R7`
- `R6 → R5`
- `R15 → R11`

The batch preserves the distinction between semantic compatibility, operational composition, liveness/ownership, and missing composition. No edge in this batch is promoted to `MISSING_REQUIRED_COMPOSITION`.

---

## C16-01 — `R3 → R7`

### Checked endpoint semantics

R3 states:

> **Safety-required evidence revalidation is still work.**

> If R3 remediation or runtime freshness re-evaluation fans out across shared evidence consumers/Opportunities and consumes scarce provider/API/compute/concurrency resources, that secondary work must itself consume R7 resource authority.

> A freshness repair/revalidation burst is not exempt from reservation/admission merely because its purpose is to improve safety.
>
> This is a resource-governance composition, not a transfer of R3 scope into R7.

R7 reciprocally states:

> ### R3 multi-Opportunity freshness burst consuming R7
>
> A wave of legitimate revalidation work after recovery does not bypass aggregate reservation merely because every trigger is correct.

R7-A1 also explicitly includes `WATCH/revalidation work` among safety-required workloads subject to scarce-resource admission.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency kind:** operational / joint-fixture.

### Adjudication

The resource-governance seam is complete and mutually corroborated. R3 determines whether evidence is stale/current and whether revalidation is required. R7 determines whether scarce resources for that revalidation may be atomically admitted. Safety necessity does not create resource authority, and resource availability does not make stale evidence fresh.

Complete-source review exposed a separate liveness/ownership question once R7 correctly denies admission. R11's recovered corrective-obligation taxonomy does not explicitly enumerate resource-blocked mandatory R3 revalidation. Therefore the following strengthening is required without changing the primary classification:

> **When R3 determines that current evidence requires revalidation and the required revalidation work cannot obtain R7 admission, the freshness requirement must remain a durable owned unresolved obligation rather than disappearing, repeatedly being regenerated from scratch, or being mistaken for a final substantive negative conclusion. Resource denial blocks execution of the revalidation; it does not resolve the freshness question.**

### Required fixture

The fixture must preserve four distinguishable states:

1. `STALE` — the underlying evidence is temporally inadequate.
2. `REVALIDATION_REQUIRED` — governed fresh evidence is required before progression.
3. `REVALIDATION_RESOURCE_BLOCKED` — revalidation remains required but R7 has denied scarce-resource admission.
4. eventual qualifying revalidation success or another explicitly governed terminal disposition.

The test must prove that resource scarcity does not mutate the substantive freshness verdict, remove the obligation, or manufacture a final negative conclusion.

---

## C16-02 — `R6 → R5`

### Checked endpoint semantics

R6 states:

> **R5 × R6 — independent reasoning confirmation vs. capability verification.**
>
> R5 and R6 both use the word "verification" colloquially but govern different claims.
>
> R5: did an independent reviewer confirm a material reasoning conclusion?
>
> R6: did sufficient proof establish a capability/access claim?

And:

> A provider callback proving API access does not independently confirm an underwriting judgment.
>
> A second-model review does not prove API credentials work.
>
> They remain separate.

R5 states:

> **R5 vs R6:** R6 determines whether a capability/verifier is strong enough for a claimed capability state. R5 determines whether a material reasoning conclusion received independent confirmation. A strong capability verifier is not automatically an independent decision reviewer.

R5 also allows a narrow deterministic exception:

> **Deterministically verifiable conclusion** → a deterministic verifier against authoritative facts may satisfy confirmation if the closure claim is fully reducible to those facts.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

`CONSUMES` is intentionally omitted. The normal architecture does not treat an R6 result as an R5 result or vice versa.

**Certification dependency kind:** vocabulary / interface compatibility.

### Adjudication

The negative anti-substitution rule is already strong. The remaining gap is the legitimate positive-overlap case created by R5's own deterministic-verifier allowance. A future implementation must neither launder R6 capability truth into broad R5 judgment nor prohibit all overlap so aggressively that authoritative deterministic verification must be pointlessly duplicated.

### Required positive-overlap fixture

1. Material Candidate X is an underwriting/business judgment. R6 capability PASS does **not** confirm X.
2. Candidate Y is exactly the proposition already established by an authoritative deterministic R6 verifier.
3. R5 may accept that verifier for Y only when:
   - Y is fully reducible to the exact verified R6 facts;
   - R5 policy explicitly permits that verifier class for Y;
   - candidate fingerprint and exact evidence/claim identity match;
   - verifier-independence requirements applicable to that deterministic claim are satisfied.
4. A broader candidate Y2 such as "therefore this provider is operationally suitable" cannot inherit confirmation from the narrower R6 claim Y.
5. Changed R6 claim, policy, or result requires a new applicability determination.
6. Shared vocabulary or shared evidence does not collapse the two canonical records.

This fixture defines a narrow lawful overlap, not a general R6→R5 authority bridge.

---

## C16-03 — `R15 → R11`

### Checked endpoint semantics

R15 states:

> **R15 preserves what the provider said. R16 decides what the complete evidence set means.**

R15 also requires final E2E certification to compose with R11 where relevant, but its substantive boundaries primarily govern R8, R7, and R16.

R11's complete checked text contains dedicated boundaries for R12, R13, R5, R6, R8, R9/R10, and R20, but no dedicated R15 boundary. R15 is also absent from R11's known migration surfaces, semantic sibling sweep, and acceptance semantics.

R11 nevertheless states the general liveness principle:

> **Fail-closed is incomplete if the closed state has no owner. When the system cannot safely decide corrective action, uncertainty itself becomes an owned adjudication obligation.**

R16 supplies the well-specified ordinary financial-remediation path, including:

> `FINANCIAL_RECONCILIATION_REGRESSION`

with R11 owning the corrective disposition.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `UNILATERAL_DECLARATION`

`CONSUMES` and `PARALLEL_NOT_MERGED` are intentionally omitted.

**Certification dependency kind:** operational / integration.

### Adjudication

Two distinct paths must remain separate:

**Path A — financial semantic correction**

`R15 immutable evidence → R16 canonical interpretation/reconciliation → R11 corrective ownership when the interpreted state requires remediation`

This path is already well specified and intentionally mediated through R16.

**Path B — evidence-capture integrity failure**

Examples include a genuine provider observation that cannot be durably persisted after bounded recovery, irreducibly unresolved capture provenance, repeated canonical-capture failure, or required evidence remaining unusably `UNPARSEABLE` with no convergent recovery path.

The checked corpus does not explicitly give Path B durable R11 ownership. This is a liveness/ownership gap, not a missing safety check that would by itself authorize an actively wrong external action. The edge therefore remains `CONSISTENT_CONSUMPTION` with required strengthening rather than escalating to `MISSING_REQUIRED_COMPOSITION`.

### Required strengthening

> **A failure to durably preserve required provider-originating financial evidence after genuine observation must become a durable corrective obligation when automatic bounded recovery cannot complete, rather than being silently lost, left only in logs, or deferred indefinitely merely because R16 cannot reconcile evidence that never became canonical.**

The strengthening must preserve all of the following:

1. A stale worker that genuinely observed evidence may append that immutable observation through the governed R15 path without regaining broader execution authority.
2. Failure to establish observation provenance must not permit fabricated canonical evidence.
3. Repeated capture/persistence failure must acquire a durable owner after bounded automatic recovery is exhausted.
4. R11 ownership must not manufacture the missing financial fact or reinterpret the raw evidence.
5. R16 remains blocked until qualifying canonical evidence exists or an explicitly governed unrecoverable disposition is reached.

---

## Cross-edge convergence discovered in this batch

C16-01 and C16-03 expose the same higher-order structural gap from two independent upstream domains:

- R3 can correctly determine that mandatory freshness revalidation is required, while R7 can correctly deny scarce-resource execution, yet the corpus does not explicitly name the durable corrective class that owns the still-required work.
- R15 can correctly preserve or attempt to preserve provider financial evidence, yet persistent capture-integrity failure lacks an explicitly named R11 corrective route before R16 can even operate.

Both converge on a taxonomy-completeness weakness in R11 rather than on two unrelated endpoint contradictions.

The future R11 remediation should therefore consider one shared corrective-obligation family broad enough to represent **durable unresolved work whose substantive requirement remains valid but whose safe execution/canonicalization is currently blocked by a recoverable external prerequisite, resource condition, or capture-integrity condition**, while preserving domain-specific payloads and authority rules.

This observation does **not** merge R3 and R15 semantics. It identifies a shared R11 ownership primitive that both may consume through separate typed obligations.

---

## Batch result

| Edge | Primary | Tags | Topology | Certification kind |
|---|---|---|---|---|
| `R3 → R7` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | operational / joint-fixture |
| `R6 → R5` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | vocabulary / interface compatibility |
| `R15 → R11` | `CONSISTENT_CONSUMPTION` | `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | operational / integration |

No new `MISSING_REQUIRED_COMPOSITION` is created by Batch C-16.

The corpus therefore remains at three confirmed instances:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

---

## Phase C process notes carried forward

1. **Fail-closed safety and liveness are independent dimensions.** A system can refuse an unsafe action correctly while still failing autonomy if the unresolved work has no durable owner.
2. **A shared liveness root may appear at multiple endpoint seams.** When independent edges converge on the same missing corrective taxonomy, remediation should prefer one typed shared primitive plus domain-specific payloads rather than duplicative ad hoc successor mechanisms.
3. **Intentional mediation remains distinct from direct composition.** R15 financial meaning normally reaches R11 through R16, but mediation does not excuse ownership gaps that occur before the mediator can operate.
4. **Positive overlap must be specified as carefully as anti-substitution.** Two authority systems can remain separate while permitting a narrowly governed shared verifier for an exactly identical deterministic proposition.
5. **Finding compression must never become implementation-scope compression.** The R3 and R15 liveness findings may share an R11 root, but each source-specific trigger, payload, fixture, and closure obligation remains independently testable.
