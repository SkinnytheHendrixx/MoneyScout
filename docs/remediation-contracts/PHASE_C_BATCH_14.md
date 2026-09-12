# Phase C Batch C-14

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Governing protocol:** Phase C Classification Protocol as amended through C-06  
**Endpoint source basis:** frozen pinned WI blobs from the Cross-Reference Edge Inventory  
**Batch size:** 3 directed edges

This batch classifies:

1. `R6 → R20`
2. `R17 → R20`
3. `R19 → R14`

The batch preserves the Phase C rule that a missing mention alone is not enough to establish `MISSING_REQUIRED_COMPOSITION`. Escalation requires complete-source negative evidence, absence of an intentional mediator or equivalent representation, and a showing that the missing composition is itself load-bearing rather than merely under-illustrated.

---

## 1. C14-01 — `R6 → R20`

**R6 pinned blob:** `d4d613a40eed187c230d55f7e21b1b0251bf612a`  
**R20 pinned blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`

### 1.1 Relevant R6 source text

R6 defines the boundary directly:

> **R6 × R20 — verifier state at consequential boundaries.** A capability can be correctly verified at time T and later expire, be revoked, lose credentials, lose provider access, change scope, or otherwise cease satisfying the verification policy. R20 decides when consequential boundaries must revalidate the relevant R6 capability fence. R6 defines the verification truth/fingerprint. R20 defines when progression must reread it.

R6 requires vocabulary agreement on:

> verification fingerprint; `expires_at`; revocation; scope; capability fence.

And separates ownership:

> **R6 vs R20:** verification semantics vs. boundary-time revalidation.

R6 Verification Result semantics preserve, among other things:

- verifier identity/type;
- verifier implementation/version;
- evidence/proof reference;
- verified claim;
- maximum access level justified;
- `verified_at`;
- `expires_at`;
- result;
- **policy version**.

### 1.2 Relevant R20 source text

R20 explicitly consumes:

> R6 capability readiness;

Its predicate families include:

> exact R6/R18 capability readiness and binding validity;

Its dedicated boundary states:

> ## 8. R6 boundary — readiness evidence is necessary but not perpetual
>
> R6 capability readiness proves a claim under its verification policy. R20 determines whether the exact required readiness evidence remains eligible at the boundary.

R20 names disqualifying conditions including:

- verification expired;
- policy changed materially;
- bound credential/account revoked or replaced;
- required access degraded;
- lifecycle made capability unusable;
- exact binding identity became unknown/conflicted.

And:

> R20 must consume the exact R6/R18 identity rather than rerouting through “some currently ready capability.”

### 1.3 Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**
- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification gate kind:** operational/integration.

R6 and R20 independently describe the same seam. R6 owns proof sufficiency under a verifier policy; R20 owns whether that exact proof remains currently consumable at a consequential boundary. Neither may substitute for the other.

### 1.4 Confirmed strengthening — verification-policy compatibility

Complete-source review confirms that the seam exists correctly, but the corpus does not define the operational rule for distinguishing a merely newer verification-policy version from a materially changed policy that requires re-verification.

R20 says a capability may become ineligible when the verification policy changes materially. R6 stores the exact policy version. The missing detail is the compatibility rule between policy versions.

This is **not** `MISSING_REQUIRED_COMPOSITION`: the composition itself is explicit on both sides. It is a finer-grained operational ambiguity inside an otherwise complete seam.

#### Required acceptance fixture

1. Capability X is verified under R6 policy `P1` and receives a qualifying verification fingerprint.
2. R20 evaluates X under the exact bound identity.
3. Policy `P2` becomes current but changes only non-decision-critical metadata/reporting semantics.
4. Continued eligibility may be preserved only if a governed compatibility rule explicitly establishes that P1 evidence still satisfies P2's decision-critical proof requirements.
5. Policy `P3` materially changes or strengthens required proof, scope, verifier class, credential requirement, or another decision-critical condition.
6. Existing P1 verification must not silently satisfy P3.
7. R20 must fail closed until qualifying R6 re-verification occurs or an explicit governed compatibility determination proves the old proof remains sufficient.
8. Merely observing a different policy version number must not itself be treated as proof either of invalidity or continued validity.
9. Historical P1 verification remains historical truth even when no longer sufficient for current boundary eligibility.

### 1.5 Invalidation / re-review trigger

Reopen this seam if future R6 or R20 changes introduce a new policy-compatibility mechanism, weaken policy-version binding, permit implicit forward compatibility, or make boundary eligibility depend on a policy transformation not represented in the current contracts.

---

## 2. C14-02 — `R17 → R20`

**R17 pinned blob:** `16a234e897fe6e119392707a7187a3232f0fd972`  
**R20 pinned blob:** `d9d7788e4c5a8f4c0914cf845294b38386470333`

### 2.1 Relevant R17 source text

R17 states:

> R17 answers **what exact commercial object is authorized**.
>
> R20 answers whether that exact authority may be consumed **now** at preflight, consequential boundary, or adoption.

And:

> A valid immutable Offer Version is not perpetual permission.

R17 separately preserves existing-customer contract authority:

> A current Offer Version pointer is not authority to rewrite an existing customer's contract.

And:

> Renewal, recurring billing, entitlement continuation, or other subsequent commercial action must respect the Offer Version / customer contract that actually governs that customer unless a separate governed migration/amendment occurs.

And:

> A new `O2` for new customers does not silently convert existing `O1` customer obligations into `O2`.

### 2.2 Relevant R20 source text

R20 has a dedicated R17 boundary:

> ## 11. R17 boundary — valid Offer Version is not perpetual commercial permission
>
> R17 defines the exact Offer Version and charging Grant. R20 decides whether that exact authority is still eligible for this checkout/charge/adoption now.

R20 lists possible disqualifiers including:

- supersession;
- grant revocation;
- provider/account binding invalidation;
- lifecycle change;
- stale required evidence;
- resource authority change;
- current policy restriction.

R20 also requires operation-specific decisions:

> There is no safe generic authorization bit for heterogeneous consequential boundaries.

### 2.3 Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**
- `CONSUMES`
- `HARD_CHAIN`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification gate kind:** operational/integration.

The seam is explicit on both sides and is part of the hard commercial chain:

`R4 → R9 → R10 → R17 → R19 → R20`

R17 owns immutable Offer/Grant authority. R20 owns current operation-specific consumption eligibility.

### 2.4 Confirmed strengthening — supersession is not universal contract invalidation

The complete contracts point in the correct direction but do not provide a dedicated executable fixture proving that supersession of O1 by O2 for new customers does not automatically invalidate every future action under an already-existing O1 customer contract.

This is not a missing composition. The operation-specific R20 model and R17 existing-contract rule already establish the governing architecture. The gap is testability of that distinction.

#### Required acceptance fixture

1. Customer C1 enters a governed contract under exact Offer Version O1.
2. O2 supersedes O1 for new customers.
3. A new-customer checkout under O1 is correctly denied when O1 is no longer eligible for that boundary.
4. A recurring/renewal/entitlement-continuation action for C1 is evaluated against the exact C1/O1 contract lineage and the exact operation class.
5. O1 supersession alone must not silently rewrite C1 to O2.
6. If governing policy still permits the exact C1/O1 action, R20 may allow that exact action when every other predicate passes.
7. If C1 is explicitly migrated/amended to O2, the new governed lineage controls prospectively.
8. Current Offer pointer, current Asset state, or current customer-acquisition offer may not substitute for the exact historical governing contract.
9. Historical O1 authority remains historically attributable even if future new-customer eligibility ends.

### 2.5 Invalidation / re-review trigger

Reopen if future R17 or R20 changes collapse offer supersession into a universal status bit, introduce contract migration defaults, or remove operation-specific/customer-contract-specific boundary evaluation.

---

## 3. C14-03 — `R19 → R14`

**R19 pinned blob:** `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`  
**R14 pinned blob:** `969b70e8b4b52606c9e34f617bed32a91b395d25`

### 3.1 Relevant R19 source text

R19 defines a first-class immutable **Commercial Authority Lineage Reference** / composite fingerprint spanning, where applicable:

- Opportunity / exact Evaluation Cycle / Bet / Product authority;
- R9 Build Source Snapshot / Build identity;
- R10 Artifact Version / production Release/deployment;
- R17 Offer Version and `CUSTOMER_CHARGING` Grant;
- exact provider/account identity;
- checkout/payment configuration;
- customer contract/subscription/order identity;
- commercial session/execution-attempt identity;
- exact R8 execution identity;
- transaction/charge/payment identity;
- downstream R15/R16 linkage as it becomes available.

R19's R14 boundary is explicit:

> ## 21. R14 boundary — runtime replacement transfers ownership, not lineage
>
> Runtime/executor replacement under R14 must preserve the exact frozen Commercial Authority Lineage Reference and its composite fingerprint.

And:

> A successor runtime may inherit responsibility for continuing, reconciling, supporting, or completing work tied to that lineage, but it must not reconstruct the lineage from whichever Offer, deployment, provider/account, customer contract, or Asset state is current when the successor takes over.

And:

> If unresolved external work exists, the same R8 execution identity and same R19 Lineage Reference must remain attached through the handoff where transfer is permitted.

And:

> **Runtime replacement transfers ownership of the frozen lineage. It does not create a new lineage and it does not rewrite the old one.**

### 3.2 Relevant R14 source text

R14 states that it consumes already-recovered requirements from R8, R10, R12, and R13.

Its compatibility predicate before transfer requires the successor to account for:

- executable-contract/version compatibility;
- R13 readiness;
- R12 durable obligations;
- R8 unresolved executions;
- R10 artifact/deployment identity;
- capability/binding/resource prerequisites;
- authority epoch/fencing support.

R14's known migration surfaces explicitly include R8, R12, R13, R10, and R7 preservation/handoff concerns.

Its sibling sweep likewise names R8, R12, R10, R7, readiness, fencing, provider/account identity, and R20 inherited-work eligibility.

Its acceptance semantics individually name R8, R12, R13, R10, R7, and R20.

But the checked R14 text does not independently name:

- R19;
- Commercial Authority Lineage Reference;
- commercial lineage fingerprint;
- R4 Evaluation Cycle as a transferred lineage dimension;
- R17 Offer/Grant as a transferred lineage dimension;
- checkout/customer-contract/transaction lineage as transferred identity.

### 3.3 Complete-source negative evidence

A complete-source representability review was performed specifically to determine whether R14 contains a canonical slot or equivalent handoff representation for R19's complete composite commercial authority identity.

The review checked all natural locations where such a requirement would need to appear:

1. **R14 §13 Compatibility predicate before transfer** — no R19/Lineage Reference/composite-fingerprint requirement.
2. **R14 §19 Known migration surfaces** — many named upstream-preservation surfaces, but no R19 lineage-preservation surface.
3. **R14 §20 Semantic sibling sweep** — no pattern for reconstructing commercial lineage from current state during handoff.
4. **R14 §21 Acceptance semantics** — no proof requirement that the successor receives/preserves the exact R19 Lineage Reference.

The absence is structural, not a single omitted mention.

More importantly, R14's model does not merely omit the composite wrapper while preserving all constituent commercial-lineage dimensions independently. It explicitly carries only a subset of the R19 fingerprint's dimensions. The checked text has no named handoff representation for major constituents such as:

- exact R4 Evaluation Cycle;
- exact R17 Offer Version / charging Grant;
- checkout/payment configuration identity;
- customer contract/subscription/order identity;
- transaction identity;
- the complete immutable R19 composition tying those facts together.

Therefore this is materially different from the lighter cross-object equality fixtures in C11-01, C12-02, and C13-03. In those cases, both objects already had representable homes and the remaining concern was proving their fields agreed. Here, much of the complete commercial lineage has no explicit representational home in the consuming handoff model.

### 3.4 Epistemic provenance caveat

R14 §13 explicitly states:

> The exact original compatibility schema/field list, if more detailed, is `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until confirmed.

That creates a real recovery-assurance ambiguity: the current pinned corpus does not contain the needed composition, but it is possible that a richer original R14 confirmation once contained some or all of it and that exact detail was lost during recovery.

This caveat does **not** change the Phase C classification. Phase C classifies the frozen checked corpus that currently governs the audit. But the remediation record must distinguish:

- **current governing omission**, which is confirmed; from
- **historical provenance of the omission**, which remains uncertain between original design omission and lost recovery detail.

This distinction matters for later recovery-assurance reconciliation. A stronger original source discovered later may amend provenance and possibly the remediation path, but it does not silently erase the present finding.

### 3.5 Classification

**Primary:** `MISSING_REQUIRED_COMPOSITION`

**Tags:**
- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `UNILATERAL_DECLARATION`

**Certification gate kind:** operational/integration.

R19 explicitly requires R14 to preserve the exact frozen Lineage Reference through runtime replacement. R14 does not independently represent or certify that composition and lacks explicit homes for most of the commercial lineage dimensions involved.

This is therefore a missing required composition in the current governing corpus.

### 3.6 Required strengthening

The governing invariant is:

> **Every R14 handoff involving commercial work must preserve the exact frozen R19 Commercial Authority Lineage Reference/fingerprint as a first-class transferred authority identity. Preserving only reconstructible constituent fields is insufficient. The successor must receive the same immutable lineage that governed the incumbent's work and must not rebuild that lineage from current mutable state.**

Because the exact R19 fingerprint serialization/hash algorithm is source-unresolved, preserving only a hash value is also insufficient as the complete semantic test. The handoff compatibility contract must explicitly preserve and validate every applicable lineage dimension needed to prove that the transferred work still belongs to the same exact historical authority composition.

At minimum where applicable, the compatibility representation must account for:

- exact R4 Evaluation Cycle / originating decision lineage;
- exact R9 source/build lineage;
- exact R10 Artifact Version / Release/deployment;
- exact R17 Offer Version / `CUSTOMER_CHARGING` Grant;
- exact provider/account commercial identity;
- checkout/payment configuration;
- exact customer contract/subscription/order;
- exact commercial session/execution-attempt identity;
- exact R8 execution identity;
- exact transaction/charge/payment identity when created;
- exact R19 Lineage Reference/fingerprint tying the composition together;
- downstream R15/R16 linkage when legitimately available at that phase.

Not-yet-applicable future fields remain not-yet-applicable rather than guessed or fabricated, consistent with the phase-relative lineage rule established in C08.

### 3.7 Required acceptance fixture

1. Freeze complete commercial lineage `L1` under the exact R19 Lineage Reference/fingerprint.
2. `L1` includes its applicable exact R4/R9/R10/R17/provider-account/checkout-contract/session/R8/transaction dimensions.
3. Dispatch or otherwise create transferable governed work X under L1.
4. Begin R14 runtime replacement while X or a related obligation remains transferable/reconciliation-required.
5. The successor receives and durably preserves the **exact L1 reference/fingerprint as first-class handoff identity**.
6. The handoff compatibility decision enumerates and validates every applicable L1 constituent dimension rather than checking only R8/R10 or a generic capability/resource tuple.
7. Current mutable state changes so that a different plausible lineage `L2` exists, for example a new Offer, provider account, customer-contract state, deployment, or current Asset pointer.
8. Successor continuation/reconciliation must remain attached to L1 and must not reconstruct or normalize the work onto L2.
9. Preserving only individual current constituent fields without the frozen L1 reference is insufficient.
10. A matching fingerprint alone is insufficient if the implementation cannot prove the exact constituent composition the fingerprint represents; because the canonical serialization/hash algorithm remains source-unresolved, the handoff must retain inspectable exact lineage dimensions as well as the composite identity.
11. Any mismatch between the transferred L1 reference and any applicable transferred constituent dimension fails closed or routes to governed correction. It must not be repaired by substituting current mutable state.
12. Not-yet-legitimate future lineage facts remain not-yet-applicable rather than guessed, defaulted, or synthetically fabricated.
13. Transfer completion proves that the successor owns the **same exact historical commercial authority composition**, not merely an equivalent-looking set of current fields.

### 3.8 Invalidation / source-recovery rule

If stronger original R14 source is later recovered, this finding must be re-evaluated against that source.

- If the original source proves the required first-class R19 composition already existed, the finding's provenance changes from original design omission to recovery loss, and remediation should restore the recovered contract rather than invent a new one.
- If the recovered source remains silent, the present classification is further corroborated.
- Until such source exists, current implementation/remediation planning must treat the composition as missing.

---

## 4. Batch C-14 adjudication summary

| Edge | Primary | Tags | Topology | Strengthening |
|---|---|---|---|---|
| `R6 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | Required policy-version compatibility fixture |
| `R17 → R20` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED` | `BILATERAL_CORROBORATION` | Required existing-contract/supersession fixture |
| `R19 → R14` | **`MISSING_REQUIRED_COMPOSITION`** | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `UNILATERAL_DECLARATION` | First-class complete-lineage handoff representation + fixture |

All `CERTIFICATION_DEPENDENCY` uses in this batch are operational/integration-strength under the current umbrella taxonomy.

---

## 5. Phase C process notes carried forward

1. A repeated structural absence across compatibility, migration, sibling-sweep, and acceptance sections can establish a missing composition when the absent predicate is load-bearing and no equivalent representation or mediator exists.
2. **Representability matters independently of conceptual ownership.** A declaring endpoint can state the correct cross-node invariant while the consuming endpoint still lacks a schema/state shape capable of carrying it.
3. **Composite identity cannot be replaced by reconstructible pieces.** Where a higher-order authority object proves that multiple identities belong to one exact historical composition, carrying some constituents independently is not equivalent to carrying the frozen composition.
4. Missing-composition provenance and missing-composition classification are separate questions. A current governing gap may arise from original omission or from lost recovery detail. Phase C classifies the governing checked text; Recovery Assurance later adjudicates historical provenance.
5. Source-gap markers must not be treated as permission to guess missing semantics, but they also must not suppress a present cross-node finding merely because richer historical source might later surface.
6. The evidentiary bar established in C13 remains governing: a missing endpoint mention alone is insufficient. Complete-source negative evidence and mediator/equivalent-representation analysis are required before escalation.

---

## 6. Batch result

Batch C-14 classifies three additional directed edges.

- Two remain `CONSISTENT_CONSUMPTION` with required operational strengthenings.
- `R19 → R14` is confirmed as the **third `MISSING_REQUIRED_COMPOSITION`** in Phase C.

After C-14, Phase C has classified **42 edges across fourteen batches**.

Confirmed `MISSING_REQUIRED_COMPOSITION` findings now are:

1. `R17 → R18` — commercial provider/account authority and capability-binding provider/account authority can each be valid while disagreeing for the same dispatch.
2. `R5 → R20` — independent confirmation can be correctly required upstream yet disappear entirely at the consequential boundary.
3. `R19 → R14` — complete immutable commercial lineage is required to survive runtime replacement, but the current R14 handoff/compatibility model lacks first-class representation for the composite lineage and most of its constituent commercial dimensions.

The third finding carries an explicit recovery-provenance caveat because R14 itself marks the exact historical compatibility schema/field list as source-unrecoverable. That caveat affects historical explanation, not the current classification.