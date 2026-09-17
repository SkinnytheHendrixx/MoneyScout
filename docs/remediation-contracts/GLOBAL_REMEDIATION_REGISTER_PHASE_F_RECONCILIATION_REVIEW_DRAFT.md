# Money Scout — Global Remediation Register — Phase-F Full Reconciliation — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Stage:** Post-Round-5 register completeness reconciliation  
**Implementation authority:** SUSPENDED  
**Canonical Phase-F source:** `PHASE_F_SYNTHESIS_CLOSURE_CERTIFICATION.md`  
**Canonical Phase-F blob:** `0955236652c511abe4844907d8ac4e8cf2bec348`  
**Base register:** `GLOBAL_REMEDIATION_DEPENDENCY_AND_INVALIDATION_REGISTER_REVIEW_DRAFT.md`  
**Round-5 overlay:** `GLOBAL_REMEDIATION_REGISTER_ROUND5_CORRECTIONS.md`

## 1. Purpose

This artifact performs the first exact row-level reconciliation of the remediation DAG against the complete canonical Phase-F primary register.

It is not an amendment plan and does not authorize implementation.

The required arithmetic is frozen by canonical Phase F:

- 29 confirmed `REPRESENTABILITY_DEFECT` findings;
  - 12 individual-surface defects;
  - 17 independently counted F7 cross-surface defects;
- 7 confirmed `REPRESENTABILITY_UNRESOLVED` findings;
  - six historical-retention durability questions;
  - one R20 Boundary Registry representation question;
- 36 total primary Phase-F dispositions.

This reconciliation assigns every one of those 36 primaries to exactly one normative remediation/closure owner, while preserving shared physical roots, prerequisite relationships, independent F7 acceptance, and unresolved-item transition semantics.

## 2. Counting and ownership rules

### 2.1 Exact-once primary ownership

Every Phase-F primary finding appears exactly once in the Phase-F reconciliation matrix below as `PRIMARY_CLOSURE_OWNER`.

A finding may have multiple prerequisite nodes and many recheck consumers. It may not have multiple nodes that independently redefine the same normative postcondition.

### 2.2 F7 remains independently lifecycle-bearing

Correct endpoint representation does not automatically close cross-surface reference integrity.

Every surviving F7 finding therefore receives its own relationship-level closure owner `REP-F07-xx` even where the same schema amendment physically repairs several findings.

### 2.3 Withdrawn/deduplicated candidates do not re-enter the denominator

The following do not become primary rows:

- draft F07-02, withdrawn as duplicate of F06-02;
- execution ↔ exact R18 Binding, retained under F06-02;
- Offer Version ↔ CUSTOMER_CHARGING Grant, retained under F05-03;
- QA-bound Artifact ↔ exact Release execution, retained under F04-02;
- F01-03 application singleton reuse, retained as mandatory remediation evidence under F01-01/F01-02.

They remain mandatory acceptance/attack scenarios under their constitutive owners.

### 2.4 Unresolved is not PASS

The seven unresolved rows may close only after their resolution trigger runs and produces a current governed disposition:

- PASS-compatible proof, or
- upgrade to DEFECT followed by substantive remediation and recheck.

An unresolved row may not disappear merely because a related structural object is introduced.

## 3. Supporting endpoint prerequisites that are not extra Phase-F primaries

Canonical Phase F explicitly requires F7 to preserve exact representability of several adjacent surfaces even though Phase F did not manufacture standalone endpoint findings for all of them.

The remediation DAG must therefore support these non-primary prerequisite objects without adding them to the 36-primary denominator:

- `AUX-F-R2-OUTCOME` — exact R2 Resolution Outcome/version identity;
- `AUX-F-R3-FRESHNESS` — exact R3 freshness-result + policy-version identity;
- `AUX-F-R6-VERIFICATION` — exact R6 Verification Result/provider/account/policy identity;
- `AUX-F-R7-ECONOMIC-ACTION` — exact R7 Economic Action/reservation/execution identity;
- `AUX-F-R12-OCCURRENCE` — exact R12 runnable occurrence identity;
- `AUX-F-R13-PATH-HEALTH` — exact R13 path-health/executor/service-path/expectation identity;
- `AUX-F-R15-EVIDENCE` — exact R15 observation/provider-evidence identity and evidence-set membership;
- `AUX-F-R16-RECONCILIATION` — exact R16 reconciliation result and evidence-set identity;
- `AUX-F-EXECUTION-IDENTITY` — exact execution identity/set-membership substrate where required by F07-06;
- `AUX-F-ASSET-ADOPTION` — exact Asset adoption identity where required by F07-12.

These are prerequisite/support nodes, not new findings. If later audit evidence establishes an independently remediable defect outside the existing Phase-F primaries, it must receive its own governing finding through the appropriate process rather than being silently created here.

## 4. Individual-surface primary reconciliation — 19 rows

### F01 — R19 Commercial Authority Lineage

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F01-01` | DEFECT / COMMERCIAL_LINEAGE_CARDINALITY | `REP-R19` | `RET-R19` blocks final historical-representability closure; `commercial_activations` shared-root stability applies | Arbitrary `L1…LN` legitimate R19 lineages can coexist for one Asset; DB uniqueness and Asset-only application reuse cannot collapse distinct lineage authority |
| `F01-02` | DEFECT / COMMERCIAL_LINEAGE_IDENTITY_REPRESENTATION | `REP-R19` | `RET-R19`; dependent F7 rows recheck independently | First-class immutable complete R19 Lineage Reference binds the exact historical authority chain and cannot be reconstructed from current state or planning snapshots |
| `F01-04` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R19` | `CLOSURE_PREREQUISITE` for applicable R19 historical findings | Prove authoritative R19 lineage remains addressable through governed delete/archive/retention behavior, or upgrade to DEFECT and remediate |

`F01-03` remains non-primary mandatory evidence under F01-01/F01-02: application reuse by Asset alone must be removed or replaced by governed exact-equality semantics.

### F02 — R20 Boundary Decisions / Registry

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F02-01` | DEFECT / BOUNDARY_DECISION_IDENTITY_REPRESENTATION | `REP-R20` | `RET-R20`; `RD-C-R5-R20` only blocks the R5-dependent predicate/binding subpart; F7 R20 relationships recheck independently | Durable operation-specific `D1…DN` decisions coexist and bind exact authority/lineage, predicate set + policy version, each predicate outcome, decision result/time/evidence, and adoption target where applicable |
| `F02-02` | UNRESOLVED / BOUNDARY_REGISTRY_REPRESENTATION | `REP-F02-02` | exhaustive repository equivalence search; representation must exist before `GOV-J-F02` can close | Identify and classify an equivalent canonical registry representation, or confirm absence, upgrade to DEFECT, introduce governed representation, and recheck; not equivalent to J-F02 enforcement and not equivalent to RET-R20 |
| `F02-03` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R20` | `CLOSURE_PREREQUISITE` for applicable R20 history | Prove exact historical Boundary Decisions remain authoritatively addressable under delete/archive behavior, or upgrade/remediate as DEFECT |

### F03 — R9 Build Source Snapshot

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F03-01` | DEFECT / BUILD_SOURCE_SNAPSHOT_IDENTITY_AND_FREEZE | `REP-R9` | `RET-R9`; F07-10 rechecks independently | Immutable per-Build source authority is frozen before consequential builder dispatch, arbitrary-N snapshots coexist, and later mutable repository state cannot substitute for the exact authorized source |
| `F03-02` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R9` | `CLOSURE_PREREQUISITE` for R9 historical representability | Prove required Build Source Snapshots remain authoritatively addressable through retention/archive/delete lifecycle, or upgrade/remediate as DEFECT |

### F04 — R10 Artifact Version / QA / Release

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F04-01` | DEFECT / ARTIFACT_VERSION_IDENTITY_REPRESENTATION | `REP-R10` | `RET-R10`; F07-07/10/11/12 remain independent rechecks | Canonical immutable Artifact Version identity exists for arbitrary-N history and binds the exact Build/source/produced artifact/deployment identity rather than repository URL/branch/current fields |
| `F04-02` | DEFECT / QA_RELEASE_EXACT_ARTIFACT_BINDING | `REP-R10` | same R10 structural family; constitutive QA↔Release duplicate remains mandatory under this owner | Exact QA result and Release/dispatch consume the same exact immutable Artifact Version; latest QA/current branch lookup cannot substitute; QA-bound Artifact↔Release fixture passes |
| `F04-03` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R10` | `CLOSURE_PREREQUISITE` for applicable R10 historical findings | Prove exact Artifact/QA/Release history remains authoritatively addressable through retention/archive/delete lifecycle, or upgrade/remediate as DEFECT |

### F05 — R17 Offer Version / CUSTOMER_CHARGING Grant

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F05-01` | DEFECT / OFFER_VERSION_IDENTITY_REPRESENTATION | `REP-R17` | `RET-R17`; `commercial_activations` shared-root lock; F07 relationships recheck independently | Immutable Offer Version with stable exact identity/fingerprint binds all materially governing commercial fields, exact upstream lineage, exact provider/account, exact Artifact/Release, and successor provenance; material change creates successor rather than mutation |
| `F05-02` | DEFECT / OFFER_VERSION_CARDINALITY | `REP-R17` | `RET-R17`; shared-root lock | Arbitrary `O1…ON` legitimate successor Offer Versions coexist per Asset; DB uniqueness and Asset-only create/reuse semantics cannot collapse them |
| `F05-03` | DEFECT / CUSTOMER_CHARGING_GRANT_REPRESENTATION | `REP-R17` | `RET-R17`; exact R17 Grant participates in F07-04/08/09; G2-01 evidence changes may invalidate provider/account implementation evidence | Immutable Grant identity binds one exact Offer/fingerprint, provider/account, allowed operation scope, checkout/payment configuration, issuer/provenance, lifecycle, revocation/supersession; later offers cannot inherit prior Asset-level authority |
| `F05-04` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R17` | `CLOSURE_PREREQUISITE`; shared-root evidence includes activation/events/provider events | Prove required Offer/Grant/revocation/contract/provider evidence remains historically addressable, or upgrade/remediate as DEFECT |

### F06 — R18 Capability Binding Snapshot

| Finding | Canonical disposition | Primary closure owner | Required dependencies / gates | Closure predicate |
|---|---|---|---|---|
| `F06-01` | DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY | `REP-R18` | `RET-R18`; `AUX-F-R6-VERIFICATION`; `IC-G2-01` changes implementation evidence but not R6/R7/R8 semantics | Arbitrary-N immutable/versioned capability authority records coexist per logical capability key with exact provider/account/R6 verification/policy/lifecycle identity; current projection cannot erase history |
| `F06-02` | DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT | `REP-R18` | `RET-R18`; `AUX-F-R6-VERIFICATION`; `AUX-F-EXECUTION-IDENTITY`; dependent F07-01/03/04/05/06 remain independent | Every consequential execution binds exact immutable Capability Binding identity/provider-account/R6 verification/policy/lifecycle/provenance; required Binding Validation Record is durably representable and replay-stable |
| `F06-03` | DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION | `REP-R18` | `RET-R18`; lifecycle semantics must remain faithful to R18 | Required distinct lifecycle states and their continuation semantics are durably representable, not hidden in untyped metadata or collapsed to the current enum |
| `F06-04` | UNRESOLVED / HISTORICAL_RETENTION_DURABILITY | `RET-R18` | `CLOSURE_PREREQUISITE` | Prove execution↔binding↔validation↔R6/provider-account history remains authoritatively addressable through archive/delete lifecycle, or upgrade/remediate as DEFECT |

### Individual-surface arithmetic

- Defects: `F01-01`, `F01-02`, `F02-01`, `F03-01`, `F04-01`, `F04-02`, `F05-01`, `F05-02`, `F05-03`, `F06-01`, `F06-02`, `F06-03` = **12**.
- Unresolved: `F01-04`, `F02-02`, `F02-03`, `F03-02`, `F04-03`, `F05-04`, `F06-04` = **7**.
- Total individual primary rows = **19**.

## 5. F7 cross-surface reconciliation — 17 independent primary rows

Every F7 row below owns only the exact relationship integrity postcondition. Endpoint object construction remains owned by the applicable endpoint/support nodes.

| Finding | Exact relationship | Primary closure owner | Representation / semantic prerequisites | Independent closure predicate |
|---|---|---|---|---|
| `F07-01` | R6 Verification Result ↔ R18 Binding | `REP-F07-01` | `AUX-F-R6-VERIFICATION` + `REP-R18`; `IC-G2-01` is an evidence-recheck dependency if the shared capability implementation changes | `B1→VR1`, `B2→VR2`, arbitrary-N coexist; no current logical capability/provider lookup can cross-wire verification ancestry |
| `F07-03` | R18 Binding/Validation ↔ R20 Decision | `REP-F07-03` | `REP-R18` + `REP-R20` | Each R20 decision consumes the exact R18 Binding/Validation result actually evaluated; no current/latest/same-scope substitution |
| `F07-04` | R17 Offer/Grant ↔ R18 commercial-payment Binding | `REP-F07-04` | **`RD-C-R17-R18` SEMANTIC_PREREQUISITE** + `REP-R17` + `REP-R18` | Exact `O/G↔B` identity survives same-provider/different-account and successor-offer histories; rule definition exists first, then representation proves it |
| `F07-05` | R18 Binding ↔ R19 Lineage | `REP-F07-05` | **`RD-C-R19-R18` SEMANTIC_PREREQUISITE** + `REP-R18` + `REP-R19` | Exact consumed Binding is embedded/referenced by the exact Lineage; no provider/current-account/Asset reconstruction |
| `F07-06` | one execution ↔ multiple exact R18 bindings | `REP-F07-06` | `AUX-F-EXECUTION-IDENTITY` + `REP-R18` | Arbitrary-N binding-set membership per execution is exact, complete, restart-stable, and rejects mixed sets across executions |
| `F07-07` | R10 Artifact/Release ↔ R17 Offer | `REP-F07-07` | `REP-R10` + `REP-R17` | Offer freezes the exact production Artifact/Release pair; current/latest production cannot substitute after successor history exists |
| `F07-08` | R17 Offer/Grant ↔ R19 Lineage | `REP-F07-08` | `REP-R17` + `REP-R19` | `O1/G1↔L1`, `O2/G2↔L2` remain exact; current activation/offer/Asset association cannot cross-wire lineage |
| `F07-09` | R17 Offer/Grant ↔ R20 Decision | `REP-F07-09` | `REP-R17` + `REP-R20` | Each decision binds exact Offer/Grant for its operation and preserves historical decisions after supersession |
| `F07-10` | R9 Snapshot ↔ R10 Artifact Version | `REP-F07-10` | `REP-R9` + `REP-R10` | Artifact derives from exact frozen source snapshot; individually valid source/artifact from different histories must fail |
| `F07-11` | R10 Artifact Version ↔ exact QA Result | `REP-F07-11` | `REP-R10` | Exact QA result identifies the exact Artifact Version it tested; later QA/latest round cannot substitute |
| `F07-12` | production Artifact/Release ↔ Asset adoption identity | `REP-F07-12` | `REP-R10` + `AUX-F-ASSET-ADOPTION` | Asset adoption binds the exact production Artifact/Release actually adopted; current release/build pointers cannot reconstruct a different history |
| `F07-13` | R2 Resolution Outcome ↔ R7 reservation | `REP-F07-13` | `AUX-F-R2-OUTCOME` + `AUX-F-R7-ECONOMIC-ACTION` | Admission/reservation freezes exact outcome/version; current/latest resolution cannot substitute |
| `F07-14` | R12 occurrence ↔ R13 exact path-health result | `REP-F07-14` | `AUX-F-R12-OCCURRENCE` + `AUX-F-R13-PATH-HEALTH` + `SRC-H1-S02`/`SRC-H1-S03` where health semantics are required | Exact occurrence/path/executor/expectation ↔ exact health result; aggregate/current heartbeat cannot substitute |
| `F07-15` | R3 freshness result ↔ R20 decision predicate | `REP-F07-15` | `AUX-F-R3-FRESHNESS` + `REP-R20` | R20 binds exact policy-relative freshness result for the exact operation; freshness never substitutes for unrelated historical lineage |
| `F07-16` | R7 reservation/execution ↔ R15/R16 financial result | `REP-F07-16` | `AUX-F-R7-ECONOMIC-ACTION` + `AUX-F-R15-EVIDENCE` + `AUX-F-R16-RECONCILIATION`; provider prerequisites only where provider-specific interpretation is required | Exact reservation/execution identity survives into observations/reconciliation; deterministic financial result cannot drift across actions |
| `F07-17` | R15 exact evidence set ↔ R16 reconciliation result | `REP-F07-17` | `AUX-F-R15-EVIDENCE` + `AUX-F-R16-RECONCILIATION` | R16 binds the exact immutable evidence-set membership it reconciled; set membership is order-independent, replay-stable, and cannot pull later/current evidence |
| `F07-18` | exact complete R19 Lineage Reference ↔ exact R20 Boundary Decision | `REP-F07-18` | `REP-R19` + `REP-R20` | R20 binds one exact whole R19 Lineage Reference; it may not reconstruct a synthetic lineage from separately valid but historically mismatched sub-predicates |

### F7 arithmetic

Confirmed numbered F7 primaries present above:

`01, 03, 04, 05, 06, 07, 08, 09, 10, 11, 12, 13, 14, 15, 16, 17, 18` = **17**.

`F07-02` is intentionally absent because it was withdrawn as duplicate of F06-02.

The former planning convenience node `REP-F07-16-17` is superseded for normative lifecycle purposes by separate `REP-F07-16` and `REP-F07-17` rows. Shared code/schema remediation remains allowed, but each finding must close independently.

## 6. Seven unresolved rows — transition rules

### Six retention items

`F01-04`, `F02-03`, `F03-02`, `F04-03`, `F05-04`, `F06-04` remain node-specific and independent.

For each:

1. locate the governing hard-delete/archive/retention rules and implementation paths;
2. establish required historical addressability duration and authoritative storage source;
3. test parent deletion, cascade, tombstone/archive, migration, backup/replay, and current-projection rebuild behavior as applicable;
4. classify the corrected/current representation:
   - PASS-compatible retention proof, or
   - DEFECT requiring substantive remediation;
5. only then permit dependent historical-representability findings to close.

No one retention row blocks an unrelated node's closure.

### F02-02 Boundary Registry representation

Resolution is separate from retention and separate from J-F02.

Before `REP-F02-02` may resolve:

1. perform the canonical exhaustive equivalence search across registry/policy/config/validator/orchestration surfaces;
2. if an equivalent exists, classify whether its registry/policy versions and definitions are durably representable/addressable;
3. if none exists, upgrade F02-02 from UNRESOLVED to DEFECT;
4. introduce a governed canonical representation;
5. recheck F02-02;
6. only then may `GOV-J-F02` rely on that representation while independently proving mandatory registration/re-registration enforcement.

## 7. Physical-root and concurrency reconciliation

### `commercial_activations`

Known normative/evidence consumers include at minimum:

- `REP-R17` via F05-01/F05-02 and supporting F05-03 paths;
- `REP-R19` via F01-01/F01-02;
- activationId-dependent R15 evidence paths because `payment_provider_events.activationId` references the activation root;
- F7 commercial-lineage relationships consuming those representations, including F07-04/F07-08/F07-09/F07-16/F07-17/F07-18 where the actual evidence derivation reaches that root.

When an amendment-bearing node changes this root, PAIM-C must expand all actual normative/evidence consumers. Any parallel consumer requiring that root as evidence enters `BLOCKED_PENDING_SHARED_ROOT_STABILITY` until the modifying node reaches `POST_AMENDMENT_BCT_PASSED` or rollback restores a known stable version.

The lock is reference-transitive. It is not limited to nodes that directly edit the table.

### Other shared roots

This Phase-F reconciliation does not claim `commercial_activations` is the only shared root. PAIM-C remains responsible for deriving additional shared-root locks from the actual amendment set before landing.

## 8. Per-node invalidation baseline from canonical Phase F

The canonical Phase-F synthesis establishes the following minimum invalidation families:

- R9 semantic/representation change → R9 certification + F07-10 + dependent mixed-chain checks;
- R10 change → R10 + F07-07/F07-10/F07-11/F07-12 + hard-chain checks;
- R17 change → R17 + F07-04/F07-07/F07-08/F07-09 + commercial-chain checks;
- R18 change → R18 + F07-01/F07-03/F07-04/F07-05/F07-06;
- R19 change → R19 + F07-05/F07-08/F07-18 + lineage mixed-history checks;
- R20 change → R20 + F07-03/F07-09/F07-15/F07-18 + boundary mixed-history checks;
- R3 freshness representation change → F07-15 + applicable Phase-E compound rechecks;
- R12/R13 representation change → F07-14 + applicable recovery compound rechecks;
- R15/R16 representation change → F07-16/F07-17 + applicable financial compounds;
- shared `commercial_activations` replacement → both R17 and R19 plus every dependent F7/evidence consumer discovered by PAIM-C.

These are minimums, not PAIM substitutes. PAIM-A/B/C must still derive the actual invalidation scope from the specific amendment and current candidate graph.

## 9. Phase-F duplicate/remediation collision controls

### F01/F05 shared physical root

F01-01/F01-02 and F05-01/F05-02 remain independent normative findings even though the current implementation uses the same defective `commercial_activations` surface for R19 and R17.

A physical replacement may be shared. Closure is not shared.

### F06-02 versus withdrawn F07-02

Do not recreate F07-02 as a new primary. F06-02 already owns execution↔exact-binding attachment. Mixed-history tests may exercise the relationship without adding a second lifecycle-bearing finding.

### F05-03 Offer↔Grant

Do not create a separate F7 finding for Offer↔Grant. Exact Offer binding is constitutive of a valid CUSTOMER_CHARGING Grant under F05-03.

### F04-02 Artifact↔Release

Do not create a separate F7 finding for the QA-bound Artifact↔Release relation already constitutive of F04-02.

## 10. Exact reconciliation proof

### Confirmed defects

Individual-surface primary defects: **12**.

F7 primary defects: **17**.

`12 + 17 = 29`.

### Unresolved

Node-specific retention unresolved: **6**.

Boundary Registry representation unresolved: **1**.

`6 + 1 = 7`.

### Total

`29 + 7 = 36` primary Phase-F dispositions.

Every canonical Phase-F primary ID is present exactly once as follows:

- F01: `F01-01`, `F01-02`, `F01-04`;
- F02: `F02-01`, `F02-02`, `F02-03`;
- F03: `F03-01`, `F03-02`;
- F04: `F04-01`, `F04-02`, `F04-03`;
- F05: `F05-01`, `F05-02`, `F05-03`, `F05-04`;
- F06: `F06-01`, `F06-02`, `F06-03`, `F06-04`;
- F07: `F07-01`, `F07-03`, `F07-04`, `F07-05`, `F07-06`, `F07-07`, `F07-08`, `F07-09`, `F07-10`, `F07-11`, `F07-12`, `F07-13`, `F07-14`, `F07-15`, `F07-16`, `F07-17`, `F07-18`.

No other candidate is counted in the Phase-F denominator.

## 11. Adversarial review questions for Claude

The reviewer should attack the actual 36-row reconciliation, not the DAG schema in the abstract.

1. Is any of the 36 canonical Phase-F primaries missing, duplicated, or assigned to the wrong normative closure owner?
2. Does any F7 row that is marked pure representability actually depend on an unresolved semantic rule from Phase C/H/I that this reconciliation missed?
3. Does any F7 row currently depend on a support node that should instead be a lifecycle-bearing remediation finding?
4. Are `REP-R17`, `REP-R19`, or `REP-R20` still too broad as closure owners for independently testable endpoint defects, or does their shared endpoint owner preserve the remove-one-fix distinctions adequately through row-level closure predicates?
5. Is splitting `REP-F07-16-17` into separate lifecycle rows required, or is there evidence the two findings are physically and normatively inseparable despite canonical Phase F counting them independently?
6. Does the transitive `commercial_activations` lock correctly capture R15 evidence consumers without incorrectly blocking unrelated R15 work?
7. Are any additional known physical roots already evident in canonical Phase-F evidence and important enough to seed before PAIM rather than discover amendment-by-amendment?
8. Does F02-02's transition logic preserve the distinction between unresolved representation, subsequent defect remediation if absence is confirmed, and independent J-F02 enforcement?
9. Do the six retention closure prerequisites remain correctly independent, or does any canonical cross-node retention invariant require a shared atomic policy node in addition to node-specific closure rows?
10. Does the exact-once arithmetic survive the distinction between primary findings, constitutive duplicate scenarios, support prerequisites, and later certification invalidations?

## 12. Provisional disposition

`PHASE-F FULL PRIMARY RECONCILIATION COMPLETE AS REVIEW DRAFT / 36 OF 36 CANONICAL PHASE-F PRIMARY DISPOSITIONS MAPPED / 29 DEFECTS = 12 ENDPOINT + 17 F7 / 7 UNRESOLVED = 6 RETENTION + F02-02 / SUPPORT PREREQUISITES DO NOT ALTER DENOMINATOR / F07-16 AND F07-17 RESTORED AS SEPARATE LIFECYCLE ROWS / ADVERSARIAL REVIEW REQUIRED BEFORE INTEGRATION INTO GLOBAL REGISTER / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`