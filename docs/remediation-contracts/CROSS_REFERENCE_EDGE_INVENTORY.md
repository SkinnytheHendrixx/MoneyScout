# Money Scout — Cross-Reference Edge Inventory

**Status:** DERIVED CANDIDATE / PENDING ADVERSARIAL EDGE-SET VERIFICATION  
**Governing phase:** Global Fidelity & Cross-Node Audit / Phase C preparation  
**Implementation authority:** SUSPENDED  
**Purpose:** mechanically enumerate the explicit R1–R20 cross-node references that Phase C must check for contradiction, semantic drift, ownership laundering, scope change, identity substitution, or missing composition.

## 1. Governing rule

This inventory is not a manually curated "important pairs" list. It is the corpus edge set used to prevent Phase C from checking only relationships someone happened to predict in advance.

An edge exists when one node explicitly references another node in a boundary, dependency, compound, hard-chain, ownership, compatibility, certification, Design Input handoff, or other normative cross-node statement.

**Edge direction:** `declaring artifact -> referenced artifact`.

Direction in this file records where the reference is declared. It does **not** by itself mean authority flows in that direction. Phase C must classify the actual relationship semantics from the pinned source text.

Every edge is pinned to immutable **Git blob SHAs** for both endpoints. A change to either endpoint blob invalidates every Phase C result attached to that edge until rerun.

This candidate is intentionally conservative about inclusion. An edge may later be removed only if adversarial verification establishes that the supposed reference is not actually normative in the pinned artifact. Missing real references must be added before Phase C certification begins.

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

## 3. Derived directed edge set

Each line means: the left-hand node contains an explicit normative cross-reference to the right-hand node in the current recovered corpus and therefore must be inspected in Phase C.

### R1 declares references to

`R1 -> R2`  
`R1 -> R7`  
`R1 -> R15`  
`R1 -> R16`

### R2 declares references to

`R2 -> R1`  
`R2 -> R4`  
`R2 -> R7`  
`R2 -> R11`

### R3 declares references to

`R3 -> R4`  
`R3 -> R7`  
`R3 -> R20`

### R4 declares references to

`R4 -> R2`  
`R4 -> R3`  
`R4 -> R9`  
`R4 -> R11`  
`R4 -> R20`

### R5 declares references to

`R5 -> R3`  
`R5 -> R4`  
`R5 -> R6`  
`R5 -> R7`  
`R5 -> R11`  
`R5 -> R20`

### R6 declares references to

`R6 -> R5`  
`R6 -> R7`  
`R6 -> R18`  
`R6 -> R20`

### R7 declares references to

`R7 -> R1`  
`R7 -> R2`  
`R7 -> R5`  
`R7 -> R6`  
`R7 -> R8`  
`R7 -> R12`  
`R7 -> R13`  
`R7 -> R15`  
`R7 -> R16`

### R8 declares references to

`R8 -> R6`  
`R8 -> R7`  
`R8 -> R14`  
`R8 -> R15`  
`R8 -> R16`  
`R8 -> R20`

### R9 declares references to

`R9 -> R4`  
`R9 -> R7`  
`R9 -> R8`  
`R9 -> R10`  
`R9 -> R17`  
`R9 -> R20`

### R10 declares references to

`R10 -> R7`  
`R10 -> R8`  
`R10 -> R9`  
`R10 -> R11`  
`R10 -> R14`  
`R10 -> R17`  
`R10 -> R20`

### R11 declares references to

`R11 -> R2`  
`R11 -> R4`  
`R11 -> R5`  
`R11 -> R7`  
`R11 -> R12`  
`R11 -> R14`  
`R11 -> R20`

### R12 declares references to

`R12 -> R7`  
`R12 -> R11`  
`R12 -> R13`

### R13 declares references to

`R13 -> R7`  
`R13 -> R12`  
`R13 -> R14`

### R14 declares references to

`R14 -> R8`  
`R14 -> R10`  
`R14 -> R11`  
`R14 -> R18`  
`R14 -> R19`  
`R14 -> R20`

### R15 declares references to

`R15 -> R7`  
`R15 -> R8`  
`R15 -> R16`  
`R15 -> R19`  
`R15 -> R20`

### R16 declares references to

`R16 -> R7`  
`R16 -> R8`  
`R16 -> R11`  
`R16 -> R15`  
`R16 -> R19`  
`R16 -> R20`

### R17 declares references to

`R17 -> R4`  
`R17 -> R7`  
`R17 -> R8`  
`R17 -> R9`  
`R17 -> R10`  
`R17 -> R19`  
`R17 -> R20`

### R18 declares references to

`R18 -> R5`  
`R18 -> R6`  
`R18 -> R7`  
`R18 -> R8`  
`R18 -> R11`  
`R18 -> R14`  
`R18 -> R20`

### R19 declares references to

`R19 -> R4`  
`R19 -> R7`  
`R19 -> R9`  
`R19 -> R10`  
`R19 -> R14`  
`R19 -> R15`  
`R19 -> R16`  
`R19 -> R17`  
`R19 -> R20`

### R20 declares references to

`R20 -> R3`  
`R20 -> R4`  
`R20 -> R5`  
`R20 -> R6`  
`R20 -> R7`  
`R20 -> R8`  
`R20 -> R9`  
`R20 -> R10`  
`R20 -> R11`  
`R20 -> R14`  
`R20 -> R17`  
`R20 -> R18`  
`R20 -> R19`

## 4. Mandatory seed relationships from the governing audit

The following pairs are independently mandatory even if a future derivation bug accidentally omits them from §3:

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

The hard-chain certification remains separately mandatory:

`R4 -> R9 -> R10 -> R17 -> R19 -> R20`

## 5. Phase C classification schema

Every verified edge must receive exactly one primary classification from the governing contradiction taxonomy:

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

A consistent edge may also carry a narrower relation tag such as:

`CONSUMES`, `COMPOSES`, `PARALLEL_NOT_MERGED`, `OWNERSHIP_BOUNDARY`, `HARD_CHAIN`, `CERTIFICATION_DEPENDENCY`, `CORROBORATES`, `DI_HANDOFF`.

## 6. Edge-verification requirement before Phase C certification

This inventory itself must be adversarially checked before its edge set is treated as exhaustive.

The verifier must, for **every R1–R20 artifact**, inspect all explicit:

- `R#` boundary sections;
- `R# × R#` compounds;
- hard-chain statements;
- start/local/E2E dependency references;
- ownership statements;
- compatibility gates;
- Design Input handoffs naming another remediation node;
- acceptance/closure conditions that consume another node's result.

For each discovered pair, compare against §3 and return:

- `EDGE_PRESENT_AND_SUPPORTED`
- `EDGE_PRESENT_BUT_NON_NORMATIVE`
- `EDGE_MISSING_FROM_INVENTORY`
- `EDGE_INVENTED_OR_UNSUPPORTED`
- `EDGE_DIRECTION_OR_SEMANTICS_NEEDS_CORRECTION`

The edge-set review must not infer "no edge" merely because a pair is absent from the old manually curated contradiction seed list.

## 7. Blob-SHA invalidation rule

Phase C results attach to the exact endpoint blob pair:

`edge_result = (declaring_node_blob_sha, referenced_node_blob_sha, relation, classification, evidence)`

If either endpoint blob SHA changes:

1. mark every attached edge result `STALE_BY_ENDPOINT_CHANGE`;
2. do not reuse the old contradiction verdict as certification;
3. re-derive that node's outgoing references;
4. rerun every affected pair/compound/hard-chain check;
5. update overlays if a new contradiction implicates a node previously locally cleared.

A provenance-only overlay change does not change the base WI blob and therefore does not mechanically invalidate WI-to-WI edge results unless the overlay itself changes the assurance semantics consumed by the edge under review.

## 8. Distinguishing edge existence from edge correctness

This inventory proves neither semantic compatibility nor authority correctness.

`EDGE EXISTS` is not `EDGE CONSISTENT`.

The inventory exists only to make the universe of required checks explicit before Phase C starts deciding whether those relationships are safe.

## 9. Required adversarial review output

Return:

### EDGE-SET RESULT

`ACCEPTED / PARTIALLY ACCEPTED / REJECTED / UNRESOLVED`

### MISSING EDGES

Every explicit normative R# cross-reference found in a pinned artifact but missing from §3.

### UNSUPPORTED EDGES

Every §3 edge not actually supported by the pinned declaring artifact.

### DIRECTION / RELATION CORRECTIONS

Where pair existence is right but declaration direction or relation was represented incorrectly.

### PINNING CHECK

Confirm each WI-R1…WI-R20 blob SHA matches the reviewed content.

### PHASE C READINESS

State whether the inventory is complete enough to serve as the mechanical input to Phase C, without claiming any contradiction result yet.

## 10. Standing constraints

- Over-inclusion is preferable to silent omission at candidate stage, but unsupported edges must be removed before final Phase C certification.
- Pair existence must come from artifact text, not memory of the architecture.
- The old manual contradiction list is a seed set, never the universe.
- Symmetric references remain two directed edges when both artifacts independently declare the relationship.
- One artifact changing invalidates only edges/compounds depending on the changed endpoint, not unrelated edge results.
- No Phase C contradiction result may restore implementation authority by itself.

## 11. Relay-contamination guard

This inventory terminates here. No conversational handoff text is part of the artifact.