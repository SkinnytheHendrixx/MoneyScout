# Phase F Batch 06 — R18 Representability Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / BATCH 06 CERTIFIED  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F4 — R18 Capability Binding Snapshots / Predispatch Validation  
**Implementation authority:** SUSPENDED

## 1. Certification result

R18 **FAILS Phase-F representability certification**.

Confirmed findings:

1. **F06-01 — `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`** — CONFIRMED.
2. **F06-02 — `REPRESENTABILITY_DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT`** — CONFIRMED.
3. **F06-03 — `REPRESENTABILITY_DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION`** — CONFIRMED.
4. **F06-04 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`** — CONFIRMED UNRESOLVED.

No separate primary defect is opened for the missing Capability Binding Validation Record. On the present evidence that absence is a mandatory downstream consequence of F06-02 because no exact immutable execution binding exists to validate against. If future evidence establishes a valid binding object while validation persistence remains independently absent, that calibration must be revisited.

The adversarial review directly re-verified the two most load-bearing implementation facts: the one-row-per-key capability schema/upsert behavior and the durable five-value Postgres capability enum. Both strengthen the provisional classifications without changing their structure.

## 2. Pinned evidence basis

### R18 governing contract

`docs/remediation-contracts/WI-R18.md`  
Blob: `226d67276f1627c26045ead9c7717023e7e764db`

R18 requires an immutable Capability Binding Snapshot or equivalent exact provider/account authority object, execution-to-binding attachment, exact R6 verification provenance, operation-specific predispatch validation, and durable distinction among materially different lifecycle states including `QUARANTINED`, `RETIRED`, `DEPRECATED`, and `DEGRADED`.

Its core invariant is that a currently usable capability under the same logical key/provider is not a substitute for the exact binding previously frozen for an execution.

### Declarative capability schema

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

`capabilities` currently declares one row containing:

- logical `key`;
- provider;
- status;
- access level;
- verification method;
- untyped metadata;
- verification/expiry/update timestamps.

It also declares:

`capabilities_key_unique = UNIQUE(key)`.

The capability lifecycle is enforced through the database-level Postgres type:

`pgEnum("capability_status", ["AVAILABLE", "PENDING", "MISSING", "EXPIRED", "REVOKED"])`.

This is a real database constraint, not merely a TypeScript union. States such as `QUARANTINED`, `RETIRED`, `DEPRECATED`, and `DEGRADED` are not durably representable without a schema migration altering the Postgres enum or replacing the representation.

### Effective runtime migration

`lib/db/src/runtime-migrations.ts`  
Blob: `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`

The effective DDL corroborates both decisive schema facts:

- `CREATE UNIQUE INDEX ... capabilities_key_unique ON capabilities(key)`;
- database enum `capability_status` limited to `AVAILABLE`, `PENDING`, `MISSING`, `EXPIRED`, `REVOKED`.

No separate capability-authority-history table, immutable execution binding table, or canonical R18 validation-record table is established by this migration.

### Capability helpers

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

Confirmed runtime behavior:

- `getCapability(key)` selects the current row by logical capability key;
- `hasCapability(key)` reduces that row to boolean usability via `capabilityIsUsable()`;
- `capabilityIsUsable()` checks only `status === "AVAILABLE"`, `accessLevel === "AUTOMATION_READY"`, and non-expiry;
- `setCapabilityAvailable()` performs `INSERT ... ON CONFLICT(key) DO UPDATE` and overwrites, in one current-state write, provider, status, access level, verification method, metadata, `verifiedAt`, `expiresAt`, and `updatedAt`.

Thus the application does not merely tolerate a singleton schema. It actively replaces the fields that would distinguish one historical authority version from another, keyed only by the logical capability key.

### Builder execution schema

`lib/db/src/schema/factory.ts`  
Blob: `0e4914790e071e840371a80ba42aa23e305108a2`

`builder_gateway_runs` persists provider/provider-run/thread and execution state, but no R18 binding ID/fingerprint, provider-account identity, verification-result identity, verification-policy version, lifecycle version, or binding provenance.

The separate `CapabilityBinding` type in this module is an Architecture Plan software-implementation-selection object (`familyKey`, `implementationKey`, version/fingerprint/outcome). It is not an external provider/account execution-authority binding and does not satisfy R18.

### Builder Gateway worker

`artifacts/api-server/src/lib/builder-gateway.ts`  
Blob: `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

Confirmed current behavior:

- new Builder Gateway runs persist only provider string `OPENAI_CODEX_SDK` for capability/provider authority;
- execution resolves the currently configured driver via `configuredCodexBuilderDriver()` unless a test override is supplied;
- `runBuilderGatewayTick()` refreshes the current logical capability row through `setCapabilityAvailable({ key: "CODEX_BUILDER_PROVIDER_ACCESS", provider: driver.provider, ... })`;
- recorded capability metadata includes billing mode but not exact provider account/tenant/credential-authority identity.

Therefore provider-string equality cannot prove that a later execution is still using the exact authority frozen when it was planned.

## 3. F06-01 — capability authority history/cardinality collapses to one mutable row

**Classification:** `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`  
**Final adjudication:** CONFIRMED DEFECT.

R18-A0 requires the system to represent simultaneously/historically, where applicable:

- V1 and V2 authority;
- Provider A and Provider B;
- Account A1 and A2;
- old and new verification results;
- lifecycle transitions without erasing prior authority.

The current database instead enforces one row per logical key. The current application then overwrites every authority-distinguishing current field in a single `ON CONFLICT(key) DO UPDATE` path.

### Concrete failure mechanism

1. capability K is represented as Provider A / Account A1 / verification V1;
2. execution X depends on that authority;
3. later capability K is refreshed as Provider B / Account B1 / verification V2;
4. the upsert targets only K and overwrites provider/verification/metadata/timestamps on the same row;
5. no independently addressable A/A1/V1 authority version remains in this representation for X to reference historically.

This is not merely missing history metadata. It is an affirmative replacement model.

### Mandatory remediation/acceptance scope

A compliant correction must provide arbitrary-N immutable/versioned capability authority records per logical capability key, exact provider/account/R6 verification/policy/lifecycle identity per version, a separately maintained current projection if desired, and no current-state upsert capable of erasing the sole representation of authority needed by an existing execution.

## 4. F06-02 — consequential executions do not bind one exact immutable capability authority

**Classification:** `REPRESENTABILITY_DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT`  
**Final adjudication:** CONFIRMED DEFECT.

This is independent of F06-01.

Even if capability history were versioned perfectly, Builder Gateway executions presently persist provider string rather than one immutable Capability Binding Snapshot identity.

They do not bind exact:

- `bindingId` / fingerprint;
- provider-account/tenant identity;
- credential-authority identity;
- R6 verification-result ID;
- verification-policy version;
- lifecycle version at bind time;
- permitted operation scope;
- binding provenance.

### Concrete same-provider/different-account substitution scenario

1. Gateway run X is created with provider `OPENAI_CODEX_SDK` while current account/credential authority is A1;
2. before X dispatches, configuration rotates to A2 under the same provider string;
3. the current capability projection is refreshed from the current driver;
4. X contains no exact binding/account identity with which to distinguish A1 from A2;
5. provider-string equality therefore cannot prove authority continuity.

That is the R18 canonical failure class.

### Independence from F06-01

- adding immutable capability-history rows does not fix X unless X references one exact authority version;
- attaching a `bindingId` to X does not fix the model if that ID still points into a mutable overwritten authority row.

Both corrections are independently required.

### Validation-record consequence

R18 also requires an operation-specific Capability Binding Validation Record. That record is mandatory remediation/acceptance scope under F06-02: exact execution, exact binding, operation class, validation-policy version, bound/observed provider-account identity, lifecycle/R6 result, decision/reason/time/provenance, and deterministic restart/replay behavior must be preserved.

It is not separately counted on current evidence because no exact execution binding exists yet for the record to validate.

## 5. F06-03 — required R18 lifecycle semantics are not durably representable

**Classification:** `REPRESENTABILITY_DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION`  
**Final adjudication:** CONFIRMED DEFECT.

R18 requires materially distinct semantics for:

- `QUARANTINED`;
- `RETIRED`;
- `DEPRECATED`;
- `DEGRADED`;
- active/available exact bindings.

The current database-level `capability_status` Postgres enum permits only `AVAILABLE`, `PENDING`, `MISSING`, `EXPIRED`, and `REVOKED`.

Untyped metadata could physically contain arbitrary words, but no declared schema/invariant gives those words canonical lifecycle meaning or enforces R18's different continuation rules. Physical JSON capacity is not a representability PASS.

### Independence from F06-01 and F06-02

The remove-one-fix counterfactual is decisive in both directions:

- fixing F06-01 perfectly would increase **how many authority objects** may coexist, but would not expand **which durable lifecycle state** any one can hold;
- widening the lifecycle enum alone would allow more states but still leave only one mutable authority row per logical key;
- attaching exact binding identity alone would still leave the binding unable to represent lifecycle distinctions the database rejects.

F06-03 is therefore independent, not a subcase of history cardinality or execution attachment.

## 6. F06-04 — historical binding/validation retention durability unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Final adjudication:** CONFIRMED UNRESOLVED.

The immediate authority-history loss is already captured by F06-01. Separately, a corrected R18 model must preserve execution↔binding↔validation↔R6 evidence and provider/account provenance through archive/delete/cleanup behavior.

The governing hard-delete/archive/retention policy is not established, so neither PASS nor a normative retention DEFECT is earned.

Resolution requires explicit proof of whether capability versions, executions, validation records, R6 evidence, provider-account provenance, and evaluation lineage may be deleted; required retention duration; and whether historical reconciliation/legacy handling can still resolve the exact original provider/account authority throughout that period.

## 7. Phase-D attack disposition

- **D-C1 current-pointer overwrite:** FAIL directly; the current capability row overwrites prior authority.
- **D-C2 same-parent deduplication:** FAIL; one logical key collapses distinct provider/account/verification authorities.
- **D-C3 decision/model collision:** carried into validation-record acceptance, not separately counted while binding identity is absent.
- **D-C4 mixed-chain reconstruction:** FAIL; execution/provider/current capability can be recomposed from mismatched historical/current states.
- **D-C5 legitimate coexistence mistaken for conflict:** FAIL; A/A1/V1 and B/B1/V2 cannot coexist under one capability key.
- **D-C6 creation-time inheritance contamination:** FAIL; executions can consume later current driver/capability state because no immutable bind-time authority is attached.

## 8. Arbitrary-N checklist — final R18 disposition

1. **Exact authority/history key?** No immutable R18 binding/version key — **FAIL / F06-01 / F06-02**.
2. **Repeatable parent scopes?** Logical K cannot retain arbitrary-N authority versions — **FAIL / F06-01**.
3. **Uniqueness constraints?** `UNIQUE(key)` collapses K to one row — **FAIL / F06-01**.
4. **N children under one parent?** Provider/account/verification V1/V2 coexistence is not represented — **FAIL / F06-01**.
5. **Historical and current coexist?** Current upsert overwrites historical authority — **FAIL / F06-01**.
6. **Multiple in-flight histories?** Distinct executions cannot point to independent exact bindings — **FAIL / F06-02**.
7. **Exact downstream reference without mutable lookup?** No execution-level binding/validation identity for R20/R19 consumption — **FAIL / F06-02**.
8. **Restart/replay reconstructs the same N-object graph?** Current driver/capability lookup may substitute later state — **FAIL / F06-01 / F06-02**.
9. **Retention/archive/delete durability?** Governing policy unresolved — **UNRESOLVED / F06-04**.

## 9. F7 fragility ledger — carry-forward only, not certification

This section records already-proven structural fragility to seed the mandatory F7 sweep. It does **not** classify or close any F7 relationship.

### F7-L1 — R18 Binding ↔ R20 decision/evaluation — BLOCKED/FRAGILE

Batch 02 found no canonical R20 decision object; Batch 06 finds no canonical R18 binding/validation object. Exact N×N decision-to-binding identity is currently unrepresentable at both ends.

### F7-L2 — R17 Offer/Grant ↔ R18 Binding — BLOCKED/FRAGILE

Batch 05 found Offer/Grant identity absent while commercial provider/account truth is read from mutable capability metadata. Future Offer/Grant authority must bind exact commercial-payment capability authority without inheriting whichever account is current.

### F7-L3 — R18 Binding ↔ R6 verification result — BLOCKED/FRAGILE

R18 requires exact R6 result/policy provenance, while current persistence stores only verification method/timestamps/metadata and `hasCapability()` reduces to boolean usability.

### F7-L4 — R18 Binding ↔ execution attempts — BLOCKED/FRAGILE

Builder Gateway supports multiple attempts but stores provider string rather than exact binding/account identity, so provider-identical attempts may consume different underlying authority.

### F7-L5 — R18 Binding ↔ R19 commercial lineage — BLOCKED/FRAGILE

Batch 01 found no canonical complete R19 lineage object, and R18 has no exact binding identity. Downstream lineage cannot yet prove which exact provider/account binding an execution consumed.

### F7-L6 — Phase-E multi-binding execution-specific requirement — BLOCKED/FRAGILE

Compound 04 requires an execution needing multiple bindings to consume each binding tied to that same exact execution and its own R6/R18 chain. Current execution records carry no binding IDs, so arbitrary-N multi-binding correspondence is not representable.

Each ledger item must still receive its own F7 fixture and classification after the individual-surface sweep.

## 10. Final adjudication

**R18 Phase-F result: FAIL / OPEN DEFECTS.**

- F06-01 — CONFIRMED `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`;
- F06-02 — CONFIRMED `REPRESENTABILITY_DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT`;
- F06-03 — CONFIRMED `REPRESENTABILITY_DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION`;
- F06-04 — CONFIRMED `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No new semantic MRC or semantic unresolved cross-node gap is created. These are implementation/schema representability findings under already-certified R18 semantics.

All six mandatory individual Phase-F surfaces have now completed adversarial certification. **Phase F itself is not closed**: the mandatory F7 cross-surface N×N reference-integrity sweep remains, followed by Phase-F synthesis/closure disposition.

Implementation authority remains **SUSPENDED**.
