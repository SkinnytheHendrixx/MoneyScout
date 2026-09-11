# Money Scout — Cross-Reference Edge Inventory

**Status:** AMENDED CANDIDATE / EXACT PINNING VERIFIED / PENDING SECOND ADVERSARIAL EDGE-SET VERIFICATION  
**Governing phase:** Global Fidelity & Cross-Node Audit / Phase C preparation  
**Implementation authority:** SUSPENDED  
**Purpose:** enumerate the explicit R1–R20 cross-node references that Phase C must check for contradiction, semantic drift, ownership laundering, scope change, identity substitution, or missing composition.

## 1. Governing rule

This inventory is not a manually curated "important pairs" list. It is the corpus edge set used to prevent Phase C from checking only relationships someone happened to predict in advance.

An edge exists when one node explicitly references another node in a boundary, dependency, compound, hard-chain, ownership, compatibility, certification, Design Input handoff, acceptance/closure dependency, or other normative cross-node statement.

**Edge direction:** `declaring artifact -> referenced artifact`.

Direction records where the reference is declared. It does **not** by itself mean authority flows in that direction. Phase C must classify actual relationship semantics from the pinned source text.

Every node is pinned to an immutable Git blob SHA. A change to either endpoint blob invalidates every Phase C result attached to that edge until rerun.

## 2. Pinned node artifacts

| Node | Artifact | Immutable blob SHA |
|---|---|---|
| R1 | `WI-R1.md` | `af010e01aaaf4e3454b6e88fc390d4502151d16a` |
| R2 | `WI-R2.md` | `bf1c19387b52938f43f28f1d58c73d483c72c5ab` |
| R3 | `WI-R3.md` | `da0431cb43f0d84056938d7e93339965ba740bd7` |
| R4 | `WI-R4.md` | `907e44ccb1128dabb142164e713877596901c3f2` |
| R5 | `WI-R5.md` | `dfa3534b7a62ae48f8dbc5104a382e2ca19b1929` |
| R6 | `WI-R6.md` | `d4d613a40eed187c230d55f7e21b1b0251bf612a` |
| R7 | `WI-R7.md` | `3a69868cbf5292fb7ba0aa4d1cc2891cebdce0bf` |
| R8 | `WI-R8.md` | `237c752671573013d090e2eacf7c2af4c0e70512` |
| R9 | `WI-R9.md` | `0ef14b00a1569ae649fe064aadecb498a2bc71e6` |
| R10 | `WI-R10.md` | `66db007de1ccbf1cdac011ef10cb299e5499aec1` |
| R11 | `WI-R11.md` | `f811d528730d819aa793a1901e9d1b310242fbcd` |
| R12 | `WI-R12.md` | `7a4a186fc2fd030d6ee52725b1111395597ffa90` |
| R13 | `WI-R13.md` | `f6c04e4d5e900b4fa95acbf70fcb834c31e12d6e` |
| R14 | `WI-R14.md` | `969b70e8b4b52606c9e34f617bed32a91b395d25` |
| R15 | `WI-R15.md` | `1b46aa43f33c19e75ef0696286693592fbbf8c77` |
| R16 | `WI-R16.md` | `7dd92976f68ee90540771b3710e42b6d5b7f396f` |
| R17 | `WI-R17.md` | `16a234e897fe6e119392707a7187a3232f0fd972` |
| R18 | `WI-R18.md` | `226d67276f1627c26045ead9c7717023e7e764db` |
| R19 | `WI-R19.md` | `8302b53a77d9e4d29ff4cfb2f2f53917e29e26e3` |
| R20 | `WI-R20.md` | `d9d7788e4c5a8f4c0914cf845294b38386470333` |

### 2.1 Pinning verification

Every blob SHA above was fetched directly and its full content inspected during Verification Pass 1. The pinning check is **PASS for all R1–R20 endpoints**.

This verifies that the edge derivation below is tied to the exact listed content rather than mutable `main` or reviewer memory.

## 3. Amended directed edge set

Each line means the left-hand pinned artifact contains an explicit normative reference to the right-hand node under the governing inclusion rule.

### R1
`R1 -> R2`  
`R1 -> R7`  
`R1 -> R8`  
`R1 -> R15`  
`R1 -> R16`

### R2
`R2 -> R1`  
`R2 -> R4`  
`R2 -> R6`  
`R2 -> R7`  
`R2 -> R11`  
`R2 -> R18`  
`R2 -> R20`

### R3
`R3 -> R4`  
`R3 -> R5`  
`R3 -> R7`  
`R3 -> R20`

### R4
`R4 -> R2`  
`R4 -> R3`  
`R4 -> R5`  
`R4 -> R6`  
`R4 -> R9`  
`R4 -> R10`  
`R4 -> R11`  
`R4 -> R17`  
`R4 -> R19`  
`R4 -> R20`

### R5
`R5 -> R3`  
`R5 -> R4`  
`R5 -> R6`  
`R5 -> R7`  
`R5 -> R11`  
`R5 -> R20`

### R6
`R6 -> R5`  
`R6 -> R7`  
`R6 -> R18`  
`R6 -> R20`

### R7
`R7 -> R1`  
`R7 -> R2`  
`R7 -> R3`  
`R7 -> R4`  
`R7 -> R5`  
`R7 -> R6`  
`R7 -> R8`  
`R7 -> R12`  
`R7 -> R13`  
`R7 -> R15`  
`R7 -> R16`  
`R7 -> R20`

### R8
`R8 -> R6`  
`R8 -> R7`  
`R8 -> R12`  
`R8 -> R13`  
`R8 -> R14`  
`R8 -> R15`  
`R8 -> R16`  
`R8 -> R20`

### R9
`R9 -> R4`  
`R9 -> R7`  
`R9 -> R8`  
`R9 -> R10`  
`R9 -> R11`  
`R9 -> R17`  
`R9 -> R19`  
`R9 -> R20`

### R10
`R10 -> R4`  
`R10 -> R7`  
`R10 -> R8`  
`R10 -> R9`  
`R10 -> R11`  
`R10 -> R14`  
`R10 -> R17`  
`R10 -> R19`  
`R10 -> R20`

### R11
`R11 -> R4`  
`R11 -> R5`  
`R11 -> R6`  
`R11 -> R7`  
`R11 -> R8`  
`R11 -> R9`  
`R11 -> R10`  
`R11 -> R12`  
`R11 -> R13`  
`R11 -> R14`  
`R11 -> R20`

### R12
`R12 -> R3`  
`R12 -> R4`  
`R12 -> R5`  
`R12 -> R6`  
`R12 -> R7`  
`R12 -> R8`  
`R12 -> R11`  
`R12 -> R13`  
`R12 -> R14`  
`R12 -> R20`

### R13
`R13 -> R7`  
`R13 -> R8`  
`R13 -> R11`  
`R13 -> R12`  
`R13 -> R14`  
`R13 -> R20`

### R14
`R14 -> R7`  
`R14 -> R8`  
`R14 -> R10`  
`R14 -> R11`  
`R14 -> R12`  
`R14 -> R13`  
`R14 -> R20`

### R15
`R15 -> R7`  
`R15 -> R8`  
`R15 -> R11`  
`R15 -> R16`  
`R15 -> R19`  
`R15 -> R20`

### R16
`R16 -> R7`  
`R16 -> R8`  
`R16 -> R11`  
`R16 -> R15`  
`R16 -> R19`  
`R16 -> R20`

### R17
`R17 -> R4`  
`R17 -> R5`  
`R17 -> R7`  
`R17 -> R8`  
`R17 -> R9`  
`R17 -> R10`  
`R17 -> R15`  
`R17 -> R16`  
`R17 -> R18`  
`R17 -> R19`  
`R17 -> R20`

### R18
`R18 -> R5`  
`R18 -> R6`  
`R18 -> R7`  
`R18 -> R8`  
`R18 -> R11`  
`R18 -> R14`  
`R18 -> R20`

### R19
`R19 -> R4`  
`R19 -> R7`  
`R19 -> R8`  
`R19 -> R9`  
`R19 -> R10`  
`R19 -> R11`  
`R19 -> R14`  
`R19 -> R15`  
`R19 -> R16`  
`R19 -> R17`  
`R19 -> R18`  
`R19 -> R20`

### R20
`R20 -> R3`  
`R20 -> R4`  
`R20 -> R6`  
`R20 -> R7`  
`R20 -> R8`  
`R20 -> R9`  
`R20 -> R10`  
`R20 -> R11`  
`R20 -> R14`  
`R20 -> R15`  
`R20 -> R16`  
`R20 -> R17`  
`R20 -> R18`  
`R20 -> R19`

## 4. Verification Pass 1 reconciliation

The first adversarial review classified the initial candidate `PARTIALLY ACCEPTED` and correctly identified that E2E/certification references were under-captured. An exact-blob rescan then reconciled the review against all twenty pinned artifacts.

### 4.1 Missing edges accepted from adversarial review

Accepted additions include:

- `R4 -> R17`, `R4 -> R19`
- `R7 -> R4`
- `R9 -> R19`
- `R11 -> R6`
- `R12 -> R3`, `R5`, `R6`, `R8`, `R4`, `R20`
- `R13 -> R8`
- `R14 -> R7`, `R12`, `R13`
- `R15 -> R11`
- `R17 -> R5`, `R18`, `R15`, `R16`
- `R19 -> R8`
- `R20 -> R15`, `R16`

### 4.2 Additional omissions found by exact-blob rescan

The rescan also found further normative references omitted by both the initial derivation and first review:

- `R1 -> R8`
- `R2 -> R6`, `R18`, `R20`
- `R3 -> R5`
- `R4 -> R5`, `R6`, `R10`
- `R7 -> R3`, `R20`
- `R8 -> R12`, `R13`
- `R9 -> R11`
- `R10 -> R4`, `R19`
- `R11 -> R8`, `R9`, `R10`, `R13`
- `R12 -> R14`
- `R13 -> R11`, `R20`
- `R19 -> R11`, `R18`

### 4.3 Initially questioned edges retained after exact-blob check

The following were challenged in the first review but are supported by the pinned declaring artifact and therefore remain:

- `R1 -> R15`
- `R1 -> R16`
- `R8 -> R20`

### 4.4 Unsupported edges removed

Exact-blob inspection found no sufficient normative declaring-artifact support under the governing edge rule for:

- `R11 -> R2`
- `R14 -> R18`
- `R14 -> R19`
- `R20 -> R5`

They are removed from §3. Their absence must not be interpreted as absence of a relationship in the architecture generally; it means the pinned declaring artifact does not itself create that directed edge under this inventory's definition.

## 5. Mandatory seed relationships from the governing audit

The old manually identified relationships remain a mandatory seed set, never the universe:

- R3 / R20
- R4 / R9
- R4 / R17
- R4 / R19
- R4 / R20
- R5 / R6
- R5 / R17
- R6 / R18
- R7 / R8
- R7 / R15
- R7 / R16
- R8 / R14
- R8 / R20
- R9 / R10
- R10 / R17
- R11 / R20
- R12 / R13 / R7 compound
- R14 / R19 / R20 compound
- R17 / R19 / R20 chain
- R18 / R20
- R19 / R20

Hard-chain certification remains separately mandatory:

`R4 -> R9 -> R10 -> R17 -> R19 -> R20`

## 6. Phase C classification schema

Every verified edge must receive exactly one primary classification:

- `CONSISTENT_CONSUMPTION`
- `UPSTREAM_SEMANTIC_REDEFINED`
- `UPSTREAM_SCOPE_NARROWED`
- `UPSTREAM_SCOPE_BROADENED`
- `IDENTITY_SUBSTITUTION_RISK`
- `AUTHORITY_LAUNDERING_RISK`
- `MISSING_REQUIRED_COMPOSITION`
- `OWNERSHIP_MISATTRIBUTION`
- `ASSURANCE_OVERCLAIM`
- `UNRESOLVED_CROSS_NODE_GAP`

A consistent edge may also carry relation tags such as `CONSUMES`, `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `HARD_CHAIN`, `CERTIFICATION_DEPENDENCY`, `CORROBORATES`, or `DI_HANDOFF`.

## 7. Second adversarial edge-set verification requirement

The amended universe must receive one more adversarial edge-existence review before Phase C contradiction classifications begin.

The verifier must focus on two questions:

1. **Completeness:** Does any pinned R1–R20 artifact still contain an explicit normative R# reference omitted from §3, including E2E/certification lists, explicit ownership/non-goal statements, hard-chain text, and compatibility/dependency references?
2. **Over-inclusion:** Does any §3 edge rely only on incidental/non-normative mention rather than a relationship that the declaring artifact actually uses to define scope, ownership, dependency, composition, compatibility, certification, or a prohibition?

Return:

- `EDGE_PRESENT_AND_SUPPORTED`
- `EDGE_PRESENT_BUT_NON_NORMATIVE`
- `EDGE_MISSING_FROM_INVENTORY`
- `EDGE_INVENTED_OR_UNSUPPORTED`
- `EDGE_DIRECTION_OR_SEMANTICS_NEEDS_CORRECTION`

The second review should not begin contradiction classifications. Its sole purpose is to freeze the mechanical universe.

## 8. Blob-SHA invalidation rule

Phase C results attach to:

`edge_result = (declaring_node_blob_sha, referenced_node_blob_sha, relation, classification, evidence)`

If either endpoint blob changes:

1. mark attached results `STALE_BY_ENDPOINT_CHANGE`;
2. do not reuse the old contradiction verdict as certification;
3. re-derive the changed node's outgoing references;
4. rerun affected edge/compound/hard-chain checks;
5. update overlays where required.

A provenance-only overlay change does not mechanically change the base WI blob, but it may still invalidate an assurance-related edge conclusion if the overlay changes evidence semantics consumed by that conclusion.

## 9. Edge existence is not edge correctness

`EDGE EXISTS` is not `EDGE CONSISTENT`.

This inventory establishes only the candidate universe of checks. No Phase C contradiction classification has been assigned by this amendment.

## 10. Phase C readiness

**Current result:** NOT YET READY FOR CONTRADICTION CLASSIFICATION.

Reasons:

- exact endpoint pinning now passes;
- the first adversarial review exposed material under-inclusion and has been reconciled;
- the exact-blob rescan produced a materially expanded universe and removed four unsupported directions;
- that amended universe has not yet received its required second adversarial edge-existence pass.

If the second pass clears the edge universe, the inventory may be frozen as Phase C mechanical input. Only then should edge-by-edge contradiction classifications begin.

## 11. Standing constraints

- Over-inclusion is preferable to silent omission at candidate stage, but unsupported edges must be removed before Phase C certification.
- Pair existence must come from pinned artifact text, not architectural memory.
- The old manual contradiction list is a seed set, never the universe.
- Symmetric references remain two directed edges when both artifacts independently declare the relationship.
- One artifact changing invalidates only results depending on that endpoint, not unrelated results.
- No Phase C contradiction result may restore implementation authority by itself.
- Broad E2E lists, ownership statements, and explicit non-goals are edge-generating when they normatively assign or consume another node's responsibility; incidental prose mentions are not.

## 12. Relay-contamination guard

This inventory terminates here. No conversational handoff text is part of the artifact.