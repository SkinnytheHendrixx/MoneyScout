# Phase C Batch 21 — Cross-Reference Classification

**Status:** COMMITTED / AWAITING INDEPENDENT VERIFICATION  
**Phase:** C — Cross-node classification  
**Batch:** C-21  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 63 edges across 21 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 3, unchanged  
**New primary-classification precedent:** `UNRESOLVED_CROSS_NODE_GAP` at C21-03

This batch classifies:

- `R20 → R18`
- `R19 → R17`
- `R11 → R8`

All classifications preserve the Phase C rule that primary classification, semantic relation, corroboration topology, certification strength, mediation shape, and representability are independent dimensions. C21-03 is the founding worked instance of `UNRESOLVED_CROSS_NODE_GAP` and therefore carries the category's durable definition and negative boundaries.

---

## C21-01 — `R20 → R18`

**Pinned endpoint blobs**

- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`
- R18: `226d67276f1627c26045ead9c7717023e7e764db`

### Endpoint source evidence

R20 defines its mission as current complete boundary eligibility, not upstream capability identity or lifecycle policy. It consumes R18's exact capability binding and operation-specific lifecycle disposition as one predicate in the complete decision and explicitly forbids independent reinterpretation of raw R18 lifecycle labels.

The `DEPRECATED` case demonstrates the split. R20 does not infer that the label itself means blocked. It consumes R18's operation-specific result, including the possibility that an already-frozen deprecated binding remains eligible for a particular operation. An R18 disallowing or unresolved result blocks the relevant boundary, but R20 cannot make R18 either stricter or looser.

R18 reciprocally states that it determines whether the same exact capability binding remains eligible, while R20 decides whether the complete action may execute now after composing that result with every other predicate. A valid R18 result is not final dispatch authority.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `COMPOSES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/integration

### Ownership split

- R18 owns exact capability binding identity and operation-specific lifecycle disposition.
- R20 owns the complete current boundary decision.

Both nodes operate near capability usability at dispatch, but they own different propositions. R20 cannot replace R18 with a local lifecycle engine, and R18 cannot grant final execution authority.

### Lifecycle non-reimplementation fixture

1. Exact capability binding B1 is frozen.
2. R18 evaluates B1 for operation class O1 and returns its operation-specific disposition.
3. R20 consumes that exact disposition with the rest of its boundary predicate set.
4. A raw lifecycle label, including `DEPRECATED`, cannot independently determine R20's result.
5. R20 cannot recompute R18 more strictly or loosely from the label.
6. A valid R18 result remains insufficient if another R20 predicate fails.
7. A later R18 disposition for a different binding or operation class cannot substitute for the result bound to B1/O1.

### Disposition

No hidden lifecycle-policy reimplementation was found. The full R20 structure consistently consumes upstream dispositions rather than deriving lifecycle eligibility locally.

---

## C21-02 — `R19 → R17`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R17: `16a234e897fe6e119392707a7187a3232f0fd972`

### Endpoint source evidence

R19's canonical lineage includes the exact R17 Offer Version and `CUSTOMER_CHARGING` Grant as a distinct historical commercial-authority segment. Its Commercial Authority Lineage Reference binds those exact identities and forbids current Asset state, current Offer, current price, `commercialActive`, or present monetization configuration from substituting for them.

R17 defines the reciprocal split. It owns the exact commercial-authority object layer and supplies the immutable Offer/Grant segment required by R19, while explicitly refusing to absorb R19's complete-lineage responsibility.

R19 consistently frames the R17 segment as an identity reference. It does not establish a separately authoritative copy of price, terms, entitlement, or promised-outcome semantics.

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:**

- `CONSUMES`
- `HARD_CHAIN`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Why `OWNERSHIP_BOUNDARY` is withheld

The seam is upstream-object consumption into a first-class composite lineage, not two nodes exercising confusingly overlapping authority over the same proposition. R17 owns the commercial authority object. R19 owns the larger immutable path containing its exact identity. `CONSUMES` and `HARD_CHAIN` are the narrowest adequate description.

### Identity-reference fixture

1. R17 freezes Offer Version O1 and `CUSTOMER_CHARGING` Grant G1.
2. R19 binds exact O1/G1 identities into lineage L1.
3. A later Offer Version O2 or Grant G2 becomes current.
4. L1 continues to resolve to O1/G1.
5. R19 must not substitute O2/G2 or current commercial fields into L1.
6. R19's composite fingerprint identifies the complete lineage; it does not become a competing source of truth for R17-owned semantics.
7. Any integrity disagreement between L1's reference and the exact R17 objects fails closed rather than being reconciled by current state.

### Disposition

No divergent-copy or identity-drift strengthening was found. R19 preserves exact R17 identity references rather than duplicating mutable commercial meaning.

---

## C21-03 — `R11 → R8`

**Pinned endpoint blobs**

- R11: `f811d528730d819aa793a1901e9d1b310242fbcd`
- R8: `237c752671573013d090e2eacf7c2af4c0e70512`

### Endpoint source evidence

R11's R8 boundary correctly prohibits blind retry when an external boundary may have been crossed. R8 reconciliation truth governs whether the prior execution is repeatable, terminal, uncertain, or unreconcilable, and the exact historical R8 execution identity must survive any corrective successor path.

R11's completion predicate for the reconciliation-obligation class states:

> reconciliation obligation: R8 reaches a terminal authoritative external-execution outcome for the exact execution being reconciled.

R8 defines `EXPOSURE_COMMITTED_UNRECONCILABLE` for the case where a consequential external effect may have occurred but:

> the resulting external outcome cannot be authoritatively reconciled.

Placed together, those rules admit two materially distinct coherent readings.

### Reading A — outcome-known requirement

"Terminal authoritative external-execution outcome" means R8 establishes what actually happened: success, failure, cancellation, or non-dispatch.

Under this reading, `EXPOSURE_COMMITTED_UNRECONCILABLE` can never satisfy R11's reconciliation completion predicate because the external outcome is permanently unknowable. The obligation therefore lacks a specified closure path for the most severe state R8 defines.

### Reading B — terminal reconcilability determination

"Terminal authoritative external-execution outcome" includes R8's final stable determination that the external outcome cannot be authoritatively recovered.

Under this reading, the reconciliation obligation may complete when R8 emits `EXPOSURE_COMMITTED_UNRECONCILABLE`. But R11 does not unambiguously name the durable successor obligation or terminal governance disposition that owns the permanently unresolved committed exposure afterward.

Both readings are internally coherent and compatible with the remaining recovered text. The record contains insufficient authority to choose between them.

### Classification

**Primary:** `UNRESOLVED_CROSS_NODE_GAP`

**Tags:**

- `CONSUMES`
- `OWNERSHIP_BOUNDARY`
- `CERTIFICATION_DEPENDENCY`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** high-risk operational/integration

**Severity:** high-priority required clarification

**`MISSING_REQUIRED_COMPOSITION`:** No

### Exact unresolved seam

`R8 reaches EXPOSURE_COMMITTED_UNRECONCILABLE → what normatively happens to the active R11 reconciliation obligation?`

The contracts establish composition and ownership but do not unambiguously define whether the obligation remains open, terminates into a specialized unreconcilable disposition, or completes and creates a distinct successor owner.

### Required clarification

Explicitly define the normative R11 disposition for R8 `EXPOSURE_COMMITTED_UNRECONCILABLE`, including:

1. whether it terminates the reconciliation obligation;
2. what completion evidence proves that transition;
3. whether the transition is ordinary completion, a specialized terminal-unreconcilable disposition, or creation of a distinct successor obligation;
4. what durable successor obligation or terminal governance state owns the unresolved committed exposure afterward;
5. how duplicate recovery/reconciliation attempts converge on that same durable ownership state;
6. which authority, if any, may accept, write off, govern, remediate, or otherwise disposition the exposure.

If the governing design permits the reconciliation obligation to complete, the successor owner cannot remain implicit. Completion must not silently abandon the condition R11 exists to own.

### Historical-truth invariant

No resolution may weaken R8's historical truth by converting a permanently unknown external outcome into a falsely known success, failure, cancellation, or non-dispatch state.

The clarification may decide how R11 ownership terminates or transforms. It may not rewrite what R8 knows.

### Founding definition — `UNRESOLVED_CROSS_NODE_GAP`

`UNRESOLVED_CROSS_NODE_GAP` applies when:

1. two or more governing contracts explicitly meet at a seam;
2. the required composition and ownership relationship exists;
3. full cross-node tracing leaves multiple materially distinct, internally coherent interpretations;
4. those interpretations produce different normative system behavior; and
5. the recovered record lacks sufficient authority to choose among them.

This category describes a property of the governing specification, not a property of the reviewer.

> A finding must not be classified `UNRESOLVED_CROSS_NODE_GAP` merely because reviewers are unsure. The ambiguity must exist in the governing specification itself, survive full cross-node tracing, permit at least two materially distinct coherent readings, and lack sufficient recovered authority to choose between them.

### Negative-boundary tests

A candidate does **not** qualify for `UNRESOLVED_CROSS_NODE_GAP` merely because it is difficult or incomplete. Reviewers must test it against the following neighboring dispositions:

- **Not `MISSING_REQUIRED_COMPOSITION`** when the contracts already compose and ownership is present. C21-03 has explicit R11 reconciliation ownership and explicit R8 upstream truth; the missing element is an unambiguous transition semantics, not the relationship itself.
- **Not a routine required-strengthening fixture** when the intended semantic answer is not already determined. A fixture applies where the contracts point to one governing answer but lack executable enforcement, timing precision, or representability. Here, Reading A and Reading B remain genuinely open design choices.
- **Not `UPSTREAM_SEMANTIC_REDEFINED`** unless a downstream node actually selects or imposes a meaning that conflicts with the upstream contract. C21-03 does not show R11 redefining R8; it shows the combined contracts failing to determine what follows from R8's state.
- **Not `OWNERSHIP_MISATTRIBUTION`** unless responsibility is assigned to the wrong node. R11 is the correct corrective owner; the unresolved issue is how that ownership terminates or transforms.
- **Not `ASSURANCE_OVERCLAIM`** unless the system or audit represents uncertainty as stronger evidence than exists. No false certainty has yet been asserted here, though an incorrect fix could create that defect.

If later recovered authority selects one reading, the finding ceases to be unresolved and must be reclassified or closed according to the resulting normative design. Recovery must not choose by preference alone.

### Why this is not a routine fixture

Prior strengthening fixtures had a determinable intended outcome after complete tracing, with missing executable detail around testing, timing, or identity. C21-03 differs because the text supports two incompatible closure models and does not determine which one governs.

This is therefore an open specification decision that recovery cannot make unilaterally.

### Disposition

Carry C21-03 open as the founding precedent for `UNRESOLVED_CROSS_NODE_GAP`. Do not close it as a routine fixture. Remediation must make the normative transition and durable successor ownership explicit while preserving R8 historical truth.

---

## Batch C-21 result

| Edge | Primary | Tags | Topology | Certification strength | Disposition |
|---|---|---|---|---|---|
| `R20 → R18` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | operational/integration | clean |
| `R19 → R17` | `CONSISTENT_CONSUMPTION` | `CONSUMES`, `HARD_CHAIN` | `BILATERAL_CORROBORATION` | operational/hard-chain integration | clean |
| `R11 → R8` | `UNRESOLVED_CROSS_NODE_GAP` | `CONSUMES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY` | `BILATERAL_CORROBORATION` | high-risk operational/integration | open required clarification |

No new `MISSING_REQUIRED_COMPOSITION` was found.

The confirmed `MISSING_REQUIRED_COMPOSITION` defect set remains:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`

C21 adds one open `UNRESOLVED_CROSS_NODE_GAP`:

1. `R11 → R8`: normative disposition of `EXPOSURE_COMMITTED_UNRECONCILABLE`

---

## Process notes carried forward from C-21

1. **Specification ambiguity is not reviewer uncertainty.** The category requires ambiguity in the governing text after full tracing.
2. **Multiple coherent readings must be materially different.** Stylistic alternatives do not qualify.
3. **Existing composition distinguishes this class from `MISSING_REQUIRED_COMPOSITION`.**
4. **An unresolved transition differs from missing ownership.** R11 is the correct owner, but its ownership transformation/termination rule is not determined.
5. **Permanent uncertainty must remain historically truthful.** Corrective architecture cannot manufacture a known external result to achieve closure.
6. **If reconciliation completion fires at permanent unreconcilability, successor ownership must be atomic and explicit.**
7. **C21-03 is the comparison precedent for every future proposed `UNRESOLVED_CROSS_NODE_GAP`.**
8. **The taxonomy has now named a real failure shape not reducible to its neighboring primary classifications.**

---

## Phase C cumulative state after C-21

- **63 classified edges across 21 batches**
- **3 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C21-01 and C21-02 are clean and commit-ready as adjudicated
- C21-03 remains an open high-priority required clarification
- `UNRESOLVED_CROSS_NODE_GAP` now has a durable founding definition, negative-boundary tests, and comparison precedent
- Implementation authority remains suspended
- Phase C remains open
