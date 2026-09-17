# Money Scout — Global Remediation Register — Assembly Validation V4

**Status:** REVIEWED ASSEMBLY CANDIDATE / MACHINE VALIDATION PASS / NOT YET CANONICALLY FROZEN  
**Implementation authority:** SUSPENDED  
**Remediation authority:** SUSPENDED  
**Validated materializer:** `scripts/audit/materialize_freeze_register_v4.py`  
**Generated artifact:** `GLOBAL_REMEDIATION_REGISTER_FREEZE_ASSEMBLY.json`

## 1. Purpose

This record documents the first assembly version that passed both deterministic machine validation and direct post-run fidelity inspection after the normalized freeze-control design was materialized into concrete rows and edges.

It does not authorize remediation or implementation. It establishes that the current V4 assembly is suitable for the next adversarial review of the actual materialized register rather than further conceptual control-plane design.

## 2. Why earlier green results were not accepted

Assembly validation intentionally did not equate parser success or internal consistency with canonical fidelity.

### V1/V2 defect class — generic rows lost certified phase detail

The early structural materializer normalized all rows but flattened some canonical distinctions:

- Phase-H exactness rows were present but their exact missing propositions and source-exhaustion states were not materialized row-by-row;
- Phase-J findings were OPEN but did not preserve the canonical `3 J_DOCUMENTED_ONLY + 3 J_MISSING` current evidenced disposition.

V2 added the exact Phase-F closure subjects, all H1/H2 subjects and source-state arithmetic, the exact nine Phase-I subjects, and J current dispositions.

### V2 defect class — graph was internally consistent but incomplete

Direct comparison with canonical Phase-F/H/I integration evidence showed the edge oracle was too weak:

- many Phase-F F7 rows lacked explicit endpoint `REPRESENTATION_PREREQUISITE` edges;
- critical H2 exactness→representation attachments were rows without explicit dependency edges;
- `NAME-H1-S01` lacked the H1-S01 semantic-taxonomy prerequisite;
- the six mechanical Phase-I rows used placeholder self-edges instead of actual representation/governance sign-off owners;
- semantic-node fan-out existed partly in prose rather than as machine-readable outgoing edge IDs;
- ROOT-1's activation-linked financial support consumers were under-enumerated.

V3 added the missing support objects and dependency edges and upgraded the validator with a required-edge completeness oracle.

### V3 defect class — Python aliasing produced duplicate root state

Independent inspection of the generated JSON found `physical_roots_known` and `required_writer_root_ids` had shared the same Python list object in the base row constructor. When V3 appended ROOT-1 to R15/R16 support rows through both field paths, the materialized artifact contained duplicate roots.

The PAIM pin template was also only shallow-copied, which could allow nested mutable-list aliasing across rows during materialization.

V4 canonicalizes/deduplicates all root fields, re-derives order keys from the canonical writer-root set, deep-copies PAIM nested structures, and fails validation on duplicate roots/order keys or mutable PAIM-list aliasing.

## 3. V4 materialized counts

The V4 artifact contains:

- **155 normalized objects** total;
- **117 explicit dependency/control edges**;
- Phase C: **5** standing semantic/transition remediation nodes;
- Phase F: **36** primaries + **10** canonical non-primary support nodes;
- Phase G: **1** primary finding;
- Phase H: **57** primary source gaps;
- Phase I: **9** NAME carry-forwards + **3** non-primary representation support nodes used solely to make mechanical joint sign-off explicit;
- Phase J: **6** findings + **11** attack objects;
- integration controls: **5** XPI objects;
- freeze controls: **9** FR objects;
- shared roots: **3** root records.

These categories are deliberately not summed into a new primary-finding denominator. The 155 count is an assembly-object count only.

## 4. Canonical denominator/state checks preserved

### Phase F

Exactly **36** Phase-F primary FINDING rows remain present.

### Phase H

Exactly **57** source-gap rows remain present with source-state arithmetic:

- `SOURCE_EXHAUSTED = 0`
- `SOURCE_NOT_YET_EXHAUSTED = 7`
- `SOURCE_PARTIALLY_EXHAUSTED = 46`
- `SOURCE_AVAILABILITY_UNRESOLVED = 4`

Authority consequence classes remain independent of source exhaustion state.

### Phase I

Exactly **9** NAME carry-forwards remain. The six mechanical rows are exactly:

- NAME-H2-E10
- NAME-H2-E13
- NAME-H2-E19
- NAME-H2-E31
- NAME-H2-E41
- NAME-H2-E42

and remain `SUPERSEDED_BY_INTEGRATION` because their closure-test shape changed to mandatory joint NAME + representation/governance sign-off.

### Phase J

Exactly **6** J findings remain with:

- `J_DOCUMENTED_ONLY = 3`
- `J_MISSING = 3`
- `J_ENFORCED = 0`
- `J_PARTIALLY_ENFORCED = 0`

Attack accounting remains exactly:

`11 total = 10 open future-code escapes + 0 development-process closures + 1 J-A9 audit-governance-provenance closure`.

## 5. Dependency-completeness controls now present

V4 preserves V3's explicit required-edge oracle. Among the required relationships now machine-represented are:

- all 17 surviving Phase-F F7 relationships and their endpoint representation prerequisites;
- RD-C-R17-R18→F07-04;
- RD-C-R19-R18→F07-05;
- RD-C-R5-R20 fan-out to F02-01/H2-E40/H2-E43/NAME-H2-E42/J-F04/J-F05 at the accepted scopes;
- RD-C-R11-R8→NAME-H2-E10 for the C21-03-consuming route only;
- H1-S01→NAME-H1-S01;
- the H2 representation attachments explicitly established during Phase-H/integration review;
- actual mechanical joint-signoff support for NAME-H2-E10/E13/E19/E31/E41/E42 rather than self-referential placeholders;
- ROOT-1/ROOT-2/ROOT-3 stability edges to their known evidence consumers;
- semantic/unresolved rule `fanout_edge_ids` as machine-readable data.

No mechanical NAME self-edge remains.

## 6. Root/order canonicalization result

Known root order remains:

1. `ROOT-1:commercial_activations`
2. `ROOT-2:capabilities`
3. `ROOT-3:commercial_payment_provider_config`

For every row:

- `physical_roots_known` contains no duplicate root IDs;
- `required_writer_root_ids` contains no duplicate root IDs;
- `required_writer_root_order_keys` contains no duplicate keys;
- order keys are re-derived from the writer-root set;
- every writer root also appears in `physical_roots_known`.

`IC-G2-01` therefore materializes the ordered multi-root set:

`ROOT-2:capabilities → ROOT-3:commercial_payment_provider_config`.

## 7. Machine execution evidence

GitHub Actions `Freeze Register Validation` executed the materializer and passed:

- repository checkout;
- Python setup;
- V4 register materialization;
- generated JSON existence and JSON parse validation;
- zero-error structural/fidelity/assembly/canonicalization assertions;
- artifact upload.

The V4 generated artifact reported:

- `row_count = 155`
- `edge_count = 117`
- `error_count = 0`
- `structural_error_count = 0`
- `fidelity_error_count = 0`
- `assembly_completeness_error_count = 0`
- `canonicalization_error_count = 0`

The validated workflow artifact digest is recorded by GitHub Actions for the corresponding V4 run.

## 8. Independent post-run inspection

The generated V4 JSON was downloaded independently of the workflow execution and re-inspected.

Spot checks confirmed:

- R15/R16 support rows each contain one, not duplicated, ROOT-1 entry;
- IC-G2-01 contains the two expected writer roots in canonical order;
- the six mechanical NAME rows have real representation/semantic dependency edges and no self-edges;
- RD-C-R5-R20 exposes its machine-readable fan-out edge IDs;
- representative F7 rows expose their endpoint prerequisites;
- H2-E39 retains the conditional landing-time R5-schema check rather than an unconditional invented edge;
- J-F02 retains `J_MISSING` while participating in the XPI-01 chain.

## 9. Current verdict

`ASSEMBLY VALIDATION V4 = PASS AS REVIEW CANDIDATE / 155 OBJECTS / 117 EDGES / ZERO STRUCTURAL + FIDELITY + ASSEMBLY-COMPLETENESS + CANONICALIZATION ERRORS / CANONICAL PHASE DENOMINATORS AND J ATTACK ARITHMETIC PRESERVED / MATERIALIZED GRAPH ACYCLIC UNDER THE VALIDATOR'S DEPENDENCY-CYCLE MODEL / IMPLEMENTATION AND REMEDIATION AUTHORITY REMAIN SUSPENDED`

This is not yet a canonical register freeze.

The next review target is the **actual V4 materialized register**, with direct row/edge comparison against canonical phase evidence. A successful adversarial review of that concrete assembly is required before emitting a freeze artifact.
