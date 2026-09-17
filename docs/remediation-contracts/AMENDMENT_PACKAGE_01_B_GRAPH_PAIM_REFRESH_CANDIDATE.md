# Amendment Package 01B — Graph / PAIM Refresh Candidate Against Landed A

**Status:** REVIEW CANDIDATE / PENDING ADVERSARIAL REVIEW / NOT FROZEN  
**Target:** Amendment B — `RD-C-R19-R18`  
**B PRE-BCT refresh blob:** `fe837e905da657be024d1ea88f0cadf0e882b1ef`  
**B revalidation blob:** `351b0da3d8b62ef53165991a0018376038bffe97`  
**Frozen register blob:** `b7d163024464a6c9f069eef68b17d1b54a4e8f71`  
**Original package PAIM freeze blob:** `17a3590361f1084f0f93c86dd5d90a79eab0d8ae`  
**AMENDMENT_B_MAY_LAND:** NO  
**Implementation authority:** SUSPENDED

## 1. Purpose

This artifact refreshes Amendment B's graph effects and PAIM against the actual landed, POST-BCT-passed, targeted-rechecked Amendment-A semantic authority.

It is a review candidate only. It does not freeze B PAIM, mutate canonical R18/R19 authority, land B, close findings, restore certifications, or authorize implementation.

## 2. Stable A prerequisite

The sequencing prerequisite consumed by B is now:

`A_SEMANTIC_AUTHORITY = LANDED / POST_BCT_PASSED / TARGETED_RECHECKS_PASSED / STABLE_CURRENT_FOR_LANDED_RULE`

The frozen one-way dependency remains conceptually:

`RD-C-R17-R18 CLOSURE_PREREQUISITE → RD-C-R19-R18`

at `MAY_CLOSE`, scoped to `R19_R17_R18_SEGMENT_COMPOSITION_ONLY`.

For B semantic work, the operative condition is that A's composition invariant be canonical/current. That condition is satisfied.

This does not assert:

`RD-C-R17-R18 = CLOSED`

and does not make F07-04 representation-certified.

## 3. Refreshed B semantic proposition

Every R19 Commercial Authority Lineage Reference for a consequential commercial provider execution must bind the exact R18 commercial-payment Capability Binding Snapshot or exact required set of R18 binding snapshots materially consumed by that same execution path.

Required invariants include:

1. immutable exact R18 binding ID/fingerprint;
2. exact R18 provider identity;
3. exact materially relevant provider-account identity;
4. same exact execution/attempt where R8 identity applies;
5. R17 Offer/Grant segment + R18 binding segment satisfy the landed A composition invariant;
6. historical binding identity survives later current-binding replacement;
7. no current environment/configuration/provider registration/capability row/current credential reconstruction;
8. arbitrary-N required binding set `B1...BN` remains independently addressable and attributable;
9. exact validation provenance is preserved where a durable R18 validation record exists;
10. later repair cannot retroactively legitimize an earlier effect whose lineage lacked the required exact binding composition.

## 4. Refreshed PAIM-A — semantic / certification impact

Minimum directly affected semantic/certification surfaces:

- `RD-C-R19-R18`;
- R18 authority slice exposing exact materially-consumed binding identity/set semantics to lineage;
- R19 complete Commercial Authority Lineage Reference authority;
- `F07-05` — R18 Binding ↔ R19 Lineage;
- `F07-18` — exact complete R19 Lineage ↔ exact R20 Boundary Decision, **unconditionally**;
- affected `XPI-04` provider-path certification component;
- `RET-R18` future acceptance;
- `RET-R19` future acceptance;
- affected Phase-C relationship/edge classification;
- G2 only if final B wording changes the formal provider/account lineage premise;
- the existing one-way A→B `MAY_CLOSE` prerequisite.

No new primary finding is created.

## 5. Refreshed B graph-effect candidate

The following are the proposed Amendment-B delta relationships if B later lands.

### B-GE-01
- source: `RD-C-R19-R18`
- target: `F07-05`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: exact materially-consumed R18 Binding/set ↔ exact R19 lineage
- post-land state: `EFFECTIVE_PENDING_RECHECK`

This supplements, but does not rewrite, frozen `E-C-02` semantic prerequisite ownership.

### B-GE-02
- source: `RD-C-R19-R18`
- target: `F07-18`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: B changes the completeness criterion of R19 lineage consumed atomically by R20
- condition: `ALWAYS`
- post-land state: `EFFECTIVE_PENDING_RECHECK`

This is unconditional under Corrections 1.

### B-GE-03
- source: `RD-C-R19-R18`
- target: `XPI-04`
- type: `EVIDENCE_RECHECK_DEPENDENCY`
- scope: affected end-to-end commercial provider-path lineage component
- post-land state: `EFFECTIVE_PENDING_RECHECK`

### B-GE-04
- source: `RD-C-R19-R18`
- target: `RET-R18`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: exact materially-consumed binding identity/set must remain historically recoverable without current-state reconstruction
- future acceptance state: constrained by B

### B-GE-05
- source: `RD-C-R19-R18`
- target: `RET-R19`
- type: `RETENTION_COMPATIBILITY_DEPENDENCY`
- scope: complete lineage must preserve exact binding-set membership/provenance under arbitrary-N history
- future acceptance state: constrained by B

No proposed B edge becomes `CERTIFIED_CURRENT` merely because B lands.

## 6. Existing graph relationships B inherits but does not duplicate

### 6.1 Direct endpoint representation prerequisites to F07-05

Frozen graph already contains:

- `F06-02 → F07-05` via `E-F7REP-05-1`;
- `F01-02 → F07-05` via `E-F7REP-05-2`.

Therefore:

`F06-02 = DIRECT_B_IMPLEMENTATION_DEPENDENCY`

`F01-02 = DIRECT_B_IMPLEMENTATION_DEPENDENCY`

but no additional B semantic edge to those nodes is required merely to land the semantic rule.

### 6.2 R19 arbitrary-N compatibility

`F01-01 = COMMERCIAL_LINEAGE_CARDINALITY`

B's arbitrary-N binding-set semantics must remain compatible with F01-01.

This is an implementation/representation compatibility dependency, not a new semantic fan-out edge.

### 6.3 R17 Grant representation

`F05-03` remains materially relevant through:

- F07-04 / landed A representation path;
- XPI-04 provider-path composition.

B does not redefine Grant representation.

Therefore:

`F05-03 = MATERIAL_TRANSITIVE_B_DEPENDENCY`

and:

`NEW_DIRECT_B_TO_F05-03_EDGE = NO`

### 6.4 Source-exactness prerequisites

Existing source prerequisites remain authoritative:

- H2-E34 → F06-02;
- H2-E36/H2-E37 → F01-02;
- other provider/source prerequisites through XPI-04 where consumed.

B does not invent direct duplicate source-gap ownership.

## 7. Refreshed PAIM-B — invalidation and recheck scope

Mandatory changed-evidence recheck/invalidation if B lands:

- affected Phase-C relationship classification;
- `F07-05`;
- `F07-18` **unconditionally**;
- affected `XPI-04` certification component;
- G2 only if the final formal provider/account lineage proposition changes.

Changed future-acceptance scope:

- `RET-R18`;
- `RET-R19`.

Representation/certification dependencies that remain independently lifecycle-bearing:

- `F06-02`;
- `F01-02`;
- `F01-01` compatibility;
- `F05-03` transitive material dependency;
- `F02-01` through F07-18/XPI-04;
- applicable provider/source prerequisites.

Passing B semantic rechecks must not auto-close any of these findings.

## 8. F07-18 mandatory attack

Because B changes complete-lineage semantics, the B post-land F07-18 recheck must prove:

Given materially required exact bindings `B1...BN`, an otherwise-correct R19 lineage that omits one member, substitutes a current/wrong member, mismatches provider/account for one member, or references later validation provenance cannot still satisfy the exact R19 Lineage ↔ R20 Boundary Decision correspondence.

This attack is mandatory even if F07-05's pairwise binding↔lineage slice passes.

## 9. Refreshed PAIM-C — writer/root scope

B remains a semantic-contract amendment.

### Candidate authority/control-plane writer surfaces

Minimum candidate landing writer set:

1. `docs/remediation-contracts/WI-R18.md`
2. `docs/remediation-contracts/WI-R19.md`
3. new immutable B graph-delta artifact
4. new immutable B landing/invalidation event artifact

### R18 writer rationale

R18 must expose the exact materially consumed Binding identity/set semantics needed for R19 lineage without redefining provider/account identity, lifecycle, or validation ownership.

### R19 writer rationale

R19 must make exact R18 binding identity/set a required dimension of complete immutable commercial lineage, including arbitrary-N and no-reconstruction rules.

### Explicit exclusions from current semantic writer set

No current B semantic write is required to:

- R17;
- R20;
- frozen V4 register;
- canonical register freeze;
- runtime code;
- schema/migrations;
- provider credentials/configuration;
- ROOT-1;
- ROOT-2;
- ROOT-3.

R20's semantic authority already consumes complete exact R19 lineage. B changes what makes R19 lineage complete; F07-18 is therefore invalidated/rechecked rather than automatically requiring an R20 authority-text write.

If exact-content review later proves R20 text must change to avoid a contradiction, this PAIM-C candidate is stale and writer-set expansion must be re-derived before any MAY_LAND adjudication.

## 10. Candidate Consequential Surface

`AMENDMENT_B_DIRECT_CANDIDATE_CONSEQUENTIAL_SURFACE_EFFECT = NONE`

Current B scope is semantic/control-plane documentation only.

No dispatch, charge, provider mutation, economic exposure, runtime execution, schema mutation, or production release is authorized.

If B expands into implementation/runtime/schema/provider scope, this classification becomes stale and PAIM-C/root/lease analysis must be redone.

## 11. Root/lease disposition

No ROOT-1/ROOT-2/ROOT-3 mutation is authorized by the semantic amendment.

Therefore:

`SEMANTIC_LANDING_SHARED_ROOT_LEASES_REQUIRED = NO`

Future B implementation work is expected to intersect:

- ROOT-1 `commercial_activations`;
- ROOT-2 `capabilities`;

and must obey frozen root ordering/lease governance when that work is actually authorized.

## 12. Negative direct-fan-out candidate

No new direct B semantic prerequisite is currently established to:

- F05-03;
- F01-01;
- F06-02;
- F01-02;
- F02-01;
- H2-E34;
- H2-E36;
- H2-E37;
- J-F04;
- J-F05;
- H2-E40;
- H2-E43;
- RET-R17;
- RET-R20;
- F07-03;
- F07-04;
- F07-09.

This is **not** a statement that those objects are irrelevant.

Where listed above, they remain connected through existing representation, A-composition, F07-18, XPI-04, source, or future implementation paths.

Any final B wording that independently changes one of those propositions requires direct-edge re-adjudication.

## 13. G2 refresh

Current candidate B wording preserves the provider/account identity model and freezes it into lineage.

It does not redefine provider identity, provider-account equality, continuity, rebinding, or DI scope.

Candidate disposition:

`G2_B_EVIDENCE_EFFECT = UNCHANGED_FORMAL_PROVIDER_ACCOUNT_LINEAGE_PROPOSITION`

This must be rechecked against the **literal final B authority wording** before MAY_LAND. If that wording changes the premise, G2 becomes a mandatory changed-evidence recheck.

## 14. Current graph / PAIM disposition

`B_PRE_BCT_REFRESH = PASS`

`B_GRAPH_EFFECT_CANDIDATE_COUNT = 5`

`B_DIRECT_SEMANTIC_WRITER_SET_CANDIDATE_COUNT = 4`

`B_DIRECT_RUNTIME_ROOTS = 0`

`B_DIRECT_CONSEQUENTIAL_SURFACE_EFFECT = NONE`

`B_F07_18_RECHECK = UNCONDITIONAL`

`B_REPRESENTATION_DEPENDENCIES_PRESERVED_WITHOUT_DUPLICATE_OWNERSHIP = YES`

`B_GRAPH_PAIM_REFRESH = READY_FOR_ADVERSARIAL_REVIEW`

`AMENDMENT_B_MAY_LAND = NO`

`GENERAL_IMPLEMENTATION_AUTHORITY = SUSPENDED`

## 15. Next gate

Before any B PAIM freeze or prospective-content construction:

1. adversarially review B-GE-01 through B-GE-05;
2. verify the four-writer candidate set is sufficient and no R20 write is required;
3. pressure-test negative direct fan-out;
4. pressure-test G2 unchanged disposition against proposed literal B wording;
5. resolve any corrections in immutable overlays;
6. only then freeze B PAIM and construct exact prospective B writer blobs.
