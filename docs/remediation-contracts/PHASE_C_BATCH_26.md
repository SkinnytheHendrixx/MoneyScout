# Phase C Batch 26 — Cross-Reference Classification

**Status:** REVIEWED / ADJUDICATED / COMMITTED  
**Phase:** C — Cross-node classification  
**Batch:** C-26  
**Edges classified:** 3  
**Cumulative Phase C count after this batch:** 78 edges across 26 batches  
**Confirmed `MISSING_REQUIRED_COMPOSITION` defects after this batch:** 4  
**Open `UNRESOLVED_CROSS_NODE_GAP` findings after this batch:** 1, unchanged

This batch classifies:

- `R4 → R20`
- `R19 → R18`
- `R13 → R12`

All three edges were mechanically confirmed `UNCLASSIFIED` in `PHASE_C_EDGE_CLASSIFICATION_INDEX.md` before selection. All endpoint blobs match the frozen inventory.

---

## C26-01 — `R4 → R20`

**Pinned endpoint blobs**

- R4: `907e44ccb1128dabb142164e713877596901c3f2`
- R20: `d9d7788e4c5a8f4c0914cf845294b38386470333`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `HARD_CHAIN`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/hard-chain integration

### Endpoint source evidence

R4 explicitly defines the vocabulary checkpoint between the nodes: R4 exposes immutable lineage plus current lineage-eligibility state/identity, and R20 consumes it at consequential fences without creating a second “current cycle” interpretation.

R4 owns exact originating Evaluation Cycle identity and lineage-eligibility semantics. R20 owns the complete boundary-time `ALLOW/DENY` decision. R4 must not implement general boundary fencing; R20 must not redefine R4 lineage semantics.

### Acceptance fixture

1. Cycle A creates authority object X.
2. X remains historically bound to A.
3. Cycle B later becomes active.
4. R4 determines A is stale/ineligible for the relevant progression.
5. R20 receives exact A lineage and R4 eligibility state.
6. R20 cannot substitute B merely because B is active.
7. R20 cannot independently reinterpret A using another current-cycle rule.
8. Conversely, R4 saying A remains eligible does not force R20 `ALLOW` if another predicate fails.
9. R20 denial does not rewrite X/A history.
10. A B-scoped successor requires its own governed successor authority.

### Disposition

Clean reciprocal seam. No new strengthening required.

---

## C26-02 — `R19 → R18`

**Pinned endpoint blobs**

- R19: `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3`
- R18: `226d67276f1627c26045ead9c7717023e7e764db`

### Classification

**Primary:** `MISSING_REQUIRED_COMPOSITION`

**Tags:** `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**`CONSUMES` is intentionally withheld** because the missing composition is precisely the absent R19 consumption/preservation of the R18 authority object.

**Topology:** `UNILATERAL_DECLARATION / REQUIRED COMPOSITION ABSENT`

**Certification dependency strength:** load-bearing historical-authority composition

### Endpoint source evidence

R19 defines itself as the complete immutable commercial-lineage node and requires one historical authority path through every materially authoritative segment. It explicitly lists R18 in its final E2E dependency set.

R18, however, owns a first-class immutable `Capability Binding Snapshot` / binding fingerprint that distinguishes more than provider/account identity, including capability claim, verification result and policy, lifecycle version/state, allowed operation scope, credential-authority continuity, and exact frozen binding identity.

A complete review of R19 finds no representation of that R18 authority object:

- §3.1 `Commercial Authority Lineage Reference` names its binding dimensions but omits R18 Capability Binding Snapshot / `bindingId` / binding fingerprint;
- known migration surfaces contain no R18 lineage migration;
- sibling-sweep patterns contain no R18 binding-substitution pattern;
- acceptance semantics contain no proof that exact R18 binding identity is preserved;
- explicit non-goals individually protect R4/R9/R10/R17 semantics but contain no equivalent R18 protection.

The only R18 reference is the generic E2E requirement that R19 compose with R18 where relevant.

Provider/account identity is not an equivalent representation of R18 binding authority. Two materially different R18 bindings may share the same provider/account while differing in verification policy, lifecycle state, allowed operation scope, credential authority, or exact verification result.

### Why this meets `MISSING_REQUIRED_COMPOSITION`

1. R19 claims complete historical commercial authority lineage.
2. R18 supplies a load-bearing authority object applicable to consequential commercial execution.
3. R19 explicitly declares R18 as an E2E dependency.
4. R19 does not bind the exact R18 Capability Binding Snapshot or an equivalent representation into its frozen Lineage Reference.
5. No intentional equality-preserving mediator was found.
6. R20's separate current-eligibility consumption of R18 cannot repair missing historical identity in R19.

This is a missing representation/relationship, not merely an imprecise fixture or predicate.

### Required composition

Where capability authority is applicable to the commercial operation, the R19 `Commercial Authority Lineage Reference` must bind the exact R18 Capability Binding Snapshot identity/fingerprint governing that execution.

The owner split remains:

- R18 owns capability-binding semantics and lifecycle eligibility;
- R19 owns immutable historical inclusion of which exact R18 binding was part of the commercial authority path;
- R20 owns whether that exact binding remains currently eligible at a consequential boundary.

### Required fixture

1. Execution X is frozen under R18 binding `B1`.
2. B1 uses Provider A / Account A1 with claim C, policy V1, verification result VR1, and operation scope S.
3. R19 freezes lineage L1 for X.
4. Distinct binding `B2` exists for the same Provider A / Account A1 but differs materially in policy, credential authority, operation scope, lifecycle, or verification result.
5. L1 must identify B1 exactly, not merely Provider A / Account A1.
6. Historical query “which exact capability authority authorized X?” resolves uniquely to B1.
7. B2 cannot be substituted because it is current or later-valid.
8. Current R18/R20 eligibility for B2 cannot retroactively complete L1.
9. Legacy lineage lacking exact R18 binding must remain incomplete/unproven unless deterministic historical reconstruction proves the unique binding.
10. Post-hoc creation of a binding cannot legitimize an earlier effect that lacked that authority at execution time.

### Disposition

Confirmed fourth Phase C `MISSING_REQUIRED_COMPOSITION` defect.

---

## C26-03 — `R13 → R12`

**Pinned endpoint blobs**

- R13: `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e`
- R12: `7a4a186fc2fd030d6ee52725b1111395597ffa90`

### Classification

**Primary:** `CONSISTENT_CONSUMPTION`

**Tags:** `CONSUMES`, `COMPOSES`, `OWNERSHIP_BOUNDARY`, `CERTIFICATION_DEPENDENCY`, `PARALLEL_NOT_MERGED`

**Topology:** `BILATERAL_CORROBORATION`

**Certification dependency strength:** operational/joint-fixture

### Endpoint source evidence

R13 explicitly states that R12 owns durable due/runnable occurrence existence and reconstruction, while R13 owns truthful health/liveness of the executor expected to process that work. Durable R12 work can exist while R13 health is failed, and a healthy R13 executor can coexist with missing R12 future work.

R12 reciprocally states that due/runnable existence does not prove executor health and that healthy executor status cannot compensate for missing durable runnable state.

Both contribute distinct predicates to the R7-owned `R12 × R13 × R7` outage-recovery certification without re-owning the other's primitive.

### Acceptance fixture

1. Durable obligation D1 exists.
2. R12 materializes occurrence O1.
3. O1 becomes due.
4. Required executor E is dead.
5. R12 still truthfully reports O1 due/runnable.
6. R13 reports E `FAILED`/`STALLED`; O1 must not disappear.
7. Reverse case: E is `HEALTHY`, but O1 is missing due to scheduler defect.
8. R13 health must not manufacture O1 or certify scheduling correctness.
9. E observes O1 but R7 denies admission; R13 may remain healthy/degraded because blocked work is truthfully observed.
10. R7 denial does not cancel O1.
11. After outage, R12 reconstructs backlog and R13 proves required-executor recovery.
12. Neither alone permits overcommit; R7 still owns aggregate admission.
13. Generic kernel health cannot substitute for health of the exact executor expected for O1.
14. R13 failure/stall cannot infer R8 external execution truth.

### Disposition

Clean bilateral separation. No new strengthening required.

---

## Batch C-26 result

| Edge | Primary | Disposition |
|---|---|---|
| `R4 → R20` | `CONSISTENT_CONSUMPTION` | clean reciprocal lineage/boundary seam |
| `R19 → R18` | `MISSING_REQUIRED_COMPOSITION` | exact R18 Capability Binding Snapshot absent from R19 immutable commercial lineage |
| `R13 → R12` | `CONSISTENT_CONSUMPTION` | clean durable-work / truthful-liveness separation |

The confirmed `MISSING_REQUIRED_COMPOSITION` set is now:

1. `R17 → R18`
2. `R5 → R20`
3. `R19 → R14`
4. `R19 → R18`

The open `UNRESOLVED_CROSS_NODE_GAP` remains:

1. `R11 → R8` / C21-03

## Phase C cumulative state after C-26

- **78 classified edges across 26 batches**
- **85 unclassified frozen edges remain**
- **4 confirmed `MISSING_REQUIRED_COMPOSITION` defects**
- **1 open `UNRESOLVED_CROSS_NODE_GAP`**
- C26 adds no new taxonomy category
- Implementation authority remains suspended
- Phase C remains open