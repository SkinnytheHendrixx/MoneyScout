# Money Scout — Phase C Classification Protocol

**Status:** ACTIVE / PHASE C GOVERNING CLASSIFICATION FORMAT  
**Applies to:** frozen `CROSS_REFERENCE_EDGE_INVENTORY.md` mechanical edge universe  
**Implementation authority:** SUSPENDED  
**Purpose:** classify cross-node contradiction risk without conflating contradiction cleanliness, semantic relation type, and corroboration topology.

## 1. Why this protocol exists

Phase C uses the frozen directed edge inventory as a checklist of declaring-artifact references. During Batch C-01 review, a distinction surfaced that the initial edge-record shape did not preserve explicitly:

- an edge can be semantically clean while being declared only from one side;
- another edge can be semantically clean and independently examined by both endpoint artifacts;
- both may legitimately receive the same primary contradiction classification, while carrying very different corroboration topology.

The protocol must preserve that distinction so `CONSISTENT_CONSUMPTION` is not misread as equivalent evidence strength across all edges.

## 2. Three independent dimensions

Every Phase C edge result must record three conceptually separate dimensions.

### 2.1 Primary contradiction classification

Exactly one of:

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

This answers: **what contradiction condition, if any, exists?**

It does not encode how richly the seam is corroborated.

### 2.2 Semantic relation tags

Zero or more tags describing what kind of architectural relationship the declaring text asserts. Examples include:

- `CONSUMES`
- `COMPOSES`
- `PARALLEL_NOT_MERGED`
- `OWNERSHIP_BOUNDARY`
- `HARD_CHAIN`
- `CERTIFICATION_DEPENDENCY`
- `CORROBORATES`
- `DI_HANDOFF`

These tags describe semantics, not evidence strength.

A relation tag must be justified by the declaring artifact's actual text. It must not be assigned merely because the two nodes are conceptually adjacent.

### 2.3 Corroboration topology

Exactly one of:

- `UNILATERAL_DECLARATION` — the frozen directed edge is normatively declared by the source artifact, but the referenced endpoint does not independently declare/examine the same seam in the checked text.
- `BILATERAL_CORROBORATION` — both endpoint artifacts independently declare/examine the same seam or reciprocal responsibility split, and the checked semantics are materially compatible.
- `MULTILATERAL_CORROBORATION` — the edge is additionally corroborated by one or more separate artifacts or compounds that independently preserve the same seam.

This answers: **how independently corroborated is the seam in the recovered artifact graph?**

Corroboration topology is not an assurance tier and does not promote T1/T2/T3/T4 status.

## 3. Guardrails

- `CONSISTENT_CONSUMPTION` means no contradiction was found in the checked edge. It does **not** mean the seam is richly or independently corroborated.
- `UNILATERAL_DECLARATION` is not a defect by itself. A one-sided dependency or non-goal may be perfectly legitimate.
- `BILATERAL_CORROBORATION` does not prove correctness outside the exact checked seam.
- `MULTILATERAL_CORROBORATION` does not create implementation authority or stronger recovery assurance.
- Relation tags must not be used as proxies for corroboration topology.
- A thin edge may have no relation tag beyond its primary classification if the source merely establishes adjacency/parallelism without a more specific normative seam.
- Edge direction remains `declaring artifact -> referenced artifact`; corroboration topology does not create new directed edges that are absent from the frozen inventory.

## 4. Source-text requirement

Every Phase C classification must include the actual relevant source text from both pinned endpoint blobs, sufficient to let a reviewer challenge:

1. whether the edge exists as represented;
2. whether the primary classification is correct;
3. whether semantic relation tags are justified;
4. whether corroboration topology is correctly assigned.

Summaries may follow the source text but may not substitute for it.

## 5. Batch C-01 adjudication

### C01-01 — `R4 -> R6`

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags: **none**

Corroboration topology: `UNILATERAL_DECLARATION`

Reason: R4 explicitly records R6 as parallel where capability verification is relevant, but the checked R6 text does not independently examine an R4 seam. `PARALLEL_NOT_MERGED` is therefore not retained as a formal semantic tag for this edge because doing so could imply a richer bilateral boundary than the source supports.

### C01-02 — `R13 -> R11`

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `CERTIFICATION_DEPENDENCY`
- `PARALLEL_NOT_MERGED`

Corroboration topology: `BILATERAL_CORROBORATION`

Reason: R13 requires E2E composition with R11, while R11 independently defines the R13 executor-health boundary and explicitly preserves liveness versus semantic-ownership separation.

### C01-03 — `R3 -> R5`

Primary classification: `CONSISTENT_CONSUMPTION`

Semantic relation tags:

- `COMPOSES`
- `PARALLEL_NOT_MERGED`

Corroboration topology: `BILATERAL_CORROBORATION`

Reason: R3 explicitly disclaims independent-confirmation authority, while R5 independently states freshness and independent confirmation are orthogonal and neither substitutes for the other.

## 6. Batch review rule

Each batch remains provisional until adversarial review of the pasted endpoint text is reconciled.

A batch record may be committed only after:

- primary classification adjudicated;
- semantic relation tags adjudicated;
- corroboration topology adjudicated;
- no unresolved reviewer objection remains for that batch;
- exact endpoint blob SHAs are recorded.

## 7. Invalidation

The frozen edge inventory's endpoint-SHA invalidation rule remains governing.

If either endpoint blob changes, all Phase C results attached to that edge become stale, including:

- primary classification;
- relation tags;
- corroboration topology;
- evidence excerpts;
- downstream compound conclusions that consume that result.

## 8. Non-goal

This protocol does not amend the frozen edge universe and does not begin Phase D/E compound certification. It only prevents Phase C from conflating non-contradiction with corroboration strength.

## 9. Relay-contamination guard

This protocol terminates here. No conversational handoff text is part of the governing classification format.
