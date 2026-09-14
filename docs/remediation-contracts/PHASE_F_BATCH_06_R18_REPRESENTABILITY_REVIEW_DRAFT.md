# Phase F Batch 06 — R18 Representability Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** F — Representability and Multiplicity Sweep  
**Surface:** Base-plan F4 — R18 Capability Binding Snapshots / Predispatch Validation  
**Implementation authority:** SUSPENDED

## 1. Governing question

R18 requires one exact immutable capability/provider/account binding to be frozen onto the execution that depends on it, preserved historically, and revalidated as that same binding immediately before consequential dispatch. A currently usable capability under the same logical key is not a substitute.

This batch therefore tests separately:

- whether capability authority can exist historically/versionedly rather than as one mutable current row;
- whether consequential executions bind to one exact immutable Capability Binding Snapshot rather than only capability key/provider/current driver state;
- whether R18 lifecycle distinctions are durably representable with their different continuation semantics;
- whether operation-specific predispatch validation records can be represented and consumed by R20 without current-state reconstruction;
- whether historical binding/validation evidence survives archive/delete behavior.

## 2. Pinned evidence basis

### R18 governing contract

`docs/remediation-contracts/WI-R18.md`  
Blob: `226d67276f1627c26045ead9c7717023e7e764db`

R18 requires, at minimum:

- immutable Capability Binding Snapshot/equivalent identity;
- logical capability key separated from exact provider/account/credential authority identity;
- exact R6 verification result/policy/version/provenance;
- provider/account identity and operation scope;
- historical lifecycle/version identity;
- execution-to-binding attachment;
- operation-specific Capability Binding Validation Record;
- exact-binding revalidation rather than substitution by a current equivalent;
- durable distinction among `QUARANTINED`, `RETIRED`, `DEPRECATED`, `DEGRADED`, and active/available states;
- monotonic historical binding truth even when current usability changes.

R18 also explicitly defines mandatory representability audit R18-A0 over V1/V2, Provider A/B, Account A1/A2, verification-history coexistence, and lifecycle-history preservation.

### Declarative capability schema

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

Current `capabilities` persistence declares:

- `key`;
- `provider`;
- `status`;
- `accessLevel`;
- `verificationMethod`;
- untyped `metadata`;
- `verifiedAt` / `expiresAt` / `updatedAt`.

It also declares:

`capabilities_key_unique = UNIQUE(key)`.

Current capability status vocabulary is only:

- `AVAILABLE`
- `PENDING`
- `MISSING`
- `EXPIRED`
- `REVOKED`

No immutable binding ID/fingerprint, provider-account field, verification-result ID, verification-policy version, lifecycle version, allowed operation scope, provenance class, or binding-history relationship is declared.

### Effective runtime migration

`lib/db/src/runtime-migrations.ts`  
Blob: `ce18712437425a0a5f08d42fbb81a1fd9d8627fe`

The effective DDL corroborates the same one-row-per-key representation and the same five-value capability-status enum, including:

`CREATE UNIQUE INDEX IF NOT EXISTS capabilities_key_unique ON capabilities(key)`.

There is no separate capability-binding-history or validation-record table in this migration.

### Capability helpers

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

Confirmed current behavior:

- `getCapability(key)` selects the current row by logical key;
- `hasCapability(key)` reduces that row to a boolean via `capabilityIsUsable()`;
- `setCapabilityAvailable()` performs `INSERT ... ON CONFLICT(key) DO UPDATE` and overwrites provider, status, access level, verification method, metadata, `verifiedAt`, `expiresAt`, and `updatedAt` on the same row.

Thus capability changes are represented as replacement of current state rather than append-only authority history.

### Builder execution schema

`lib/db/src/schema/factory.ts`  
Blob: `0e4914790e071e840371a80ba42aa23e305108a2`

`builder_gateway_runs` persists a provider string and provider-run/thread identity, but no R18 binding ID, provider-account identity, R6 verification-result identity, verification-policy version, lifecycle version, or immutable capability-binding fingerprint.

The same module also contains a separate `CapabilityBinding` type used inside Architecture Plan documents for software implementation selection (`familyKey`, `implementationKey`, version/fingerprint/outcome). That is a different concept from R18's external provider/account execution authority and does not satisfy R18.

### Builder Gateway worker

`artifacts/api-server/src/lib/builder-gateway.ts`  
Blob: `f9aa8754a53385097f33eaa14bcfcdf4ebfb0df5`

Confirmed current behavior:

- new Builder Gateway runs persist `provider: "OPENAI_CODEX_SDK"` but no exact capability-binding identity;
- execution obtains the current driver via `configuredCodexBuilderDriver()` unless a test override is supplied;
- `runBuilderGatewayTick()` calls `setCapabilityAvailable({ key: "CODEX_BUILDER_PROVIDER_ACCESS", provider: driver.provider, ... })`, updating the current logical-capability row from the currently configured driver;
- the capability metadata recorded there includes billing mode but no exact provider-account/tenant/credential-authority identity;
- blocked runs are associated with the logical capability key and provider string, not an immutable binding ID.

This is concrete evidence that Builder execution currently depends on current capability/driver projection rather than one frozen historical R18 binding.

## 3. F06-01 — capability authority history/cardinality collapses to one mutable row

**Classification:** `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`  
**Provisional adjudication:** DEFECT.

R18-A0 requires capability authority to represent simultaneously/historically, where applicable:

- V1 and V2 authority;
- Provider A and Provider B;
- Account A1 and A2;
- old/new verification results;
- historical lifecycle transitions without erasing prior authority.

The current database instead enforces one row per logical capability key with `UNIQUE(key)`.

The application reinforces the same current-projection model: `setCapabilityAvailable()` upserts on that key and overwrites the existing provider/verification/metadata/timestamps.

Concrete failure scenario:

1. K is current as Provider A / Account A1 / verification V1.
2. execution X depends on that authority.
3. K later becomes Provider B / Account B1 / verification V2.
4. `setCapabilityAvailable(K, B, ...)` rewrites the single row.
5. current persistence no longer contains an independently addressable A/A1/V1 authority object from which X's historical binding can be proven.

The schema can preserve generic lifecycle/event text elsewhere, but no checked declared object preserves the exact old capability authority as a first-class immutable version.

### Mandatory remediation scope

Closing F06-01 requires at minimum:

1. durable version/history objects or equivalent immutable capability-authority records;
2. arbitrary-N historical bindings per logical capability key;
3. exact provider/account/verification/policy/lifecycle identity per version;
4. current projection, if retained, separated from historical authority;
5. no `ON CONFLICT(key) DO UPDATE` path that can erase the only representation of an authority version needed by an execution.

## 4. F06-02 — consequential executions do not bind one exact immutable capability authority

**Classification:** `REPRESENTABILITY_DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT`  
**Provisional adjudication:** DEFECT.

This is independent of F06-01.

Even if capability history were versioned perfectly, Builder Gateway executions currently persist only a provider string rather than an exact R18 binding identity.

No checked execution record binds:

- immutable `bindingId` / binding fingerprint;
- exact provider-account/tenant identity;
- credential-authority identity/class;
- exact R6 verification-result ID;
- verification-policy version;
- lifecycle version at bind time;
- allowed operation scope;
- binding provenance (`FRESHLY_BOUND`, reconstructed, legacy-unproven, or equivalent).

At runtime, the Builder worker obtains the current configured driver and updates the current logical-capability row from that driver. Therefore provider-string equality cannot prove execution X is still using the same provider/account authority X was planned/authorized for.

### Concrete current-binding substitution risk

1. Gateway run X is created with provider string `OPENAI_CODEX_SDK`.
2. at T0 the configured credential/account is A1;
3. before X dispatches, configuration rotates to A2 under the same provider string;
4. the capability row is refreshed from the current driver;
5. X contains no binding ID/account identity with which to distinguish A1 from A2;
6. dispatch can therefore proceed using current A2 while the persisted run still appears provider-consistent.

That is exactly the R18 canonical failure class: same provider/logical capability, different exact authority.

### Independence from F06-01

- adding immutable capability-history rows does not fix X unless X references one exact row/binding;
- adding a `bindingId` column to X does not fix the authority model if that binding points into one mutable overwritten capability row.

Both corrections are independently necessary.

### Mandatory remediation scope

A compliant correction must bind each consequential execution/attempt to one immutable Capability Binding Snapshot before execution can depend on it, and retries/successors must receive governed binding semantics rather than silently inheriting current configuration.

## 5. F06-03 — required R18 lifecycle semantics are not durably representable

**Classification:** `REPRESENTABILITY_DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION`  
**Provisional adjudication:** DEFECT.

This finding is independent of F06-01/F06-02.

R18 requires materially different semantics for:

- `QUARANTINED` — hard block consequential dispatch by default;
- `RETIRED` — block new dispatch/bindings while preserving historical/reconciliation access where explicitly permitted;
- `DEPRECATED` — already-frozen bindings may normally continue by default, while new selection is blocked unless stronger policy restricts continuation;
- `DEGRADED` — claim/operation-specific sufficiency evaluation;
- active/available binding — still subject to exact R6/binding checks.

The current durable capability status enum cannot distinguish any of the first four. It contains only AVAILABLE/PENDING/MISSING/EXPIRED/REVOKED.

Untyped metadata could physically store arbitrary words, but no declared schema/invariant establishes those lifecycle states or their required semantics. Under Refinement 1, physical JSON capacity is not equivalent to a canonical representable contract.

### Remove-one-fix independence

- versioned authority history alone still cannot express DEPRECATED-vs-RETIRED continuation semantics if durable lifecycle vocabulary is absent;
- lifecycle enum expansion alone does not create history or execution binding identity;
- exact execution binding alone cannot revalidate a state the persistence model cannot distinguish.

F06-03 is therefore an independent representation defect.

## 6. Capability Binding Validation Record — missing consequence, not separately counted yet

R18 requires durable operation-specific validation records equivalent to:

`bindingId`, `executionId`, `operationClass`, validation-policy version, bound/observed provider/account, lifecycle state, R6 result, decision/reason/time/provenance.

No checked canonical validation-record table/object currently exists.

This draft treats that absence as a mandatory consequence of F06-02 rather than opening F06-04 as another primary defect, because the system cannot create a meaningful exact-binding validation record while no exact execution binding exists.

Adversarial review should challenge this calibration. If a valid binding object exists elsewhere and only validation persistence is separately absent, a fourth defect may be warranted.

## 7. F06-04 — historical binding/validation retention durability unresolved

**Classification:** `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`  
**Provisional adjudication:** UNRESOLVED.

Current capability rows themselves do not preserve prior authority versions, so the immediate problem is F06-01 rather than deletion alone.

For the historical/action/event records that do exist, multiple parent-owned/cascade and `SET NULL` relationships elsewhere in the runtime graph can erase or sever execution/evaluation context. A corrected R18 model will require durable historical binding and validation addressability.

However, governing hard-delete/archive/retention policy is not established. Therefore neither PASS nor normative retention DEFECT is earned.

Resolution requires proof of:

1. whether capability-authority versions, executions, validation records, R6 evidence, provider-account provenance, and evaluation-cycle lineage may be hard-deleted;
2. required retention period for historical bindings and validation outcomes;
3. whether archive/cleanup/parent deletion can sever exact execution↔binding↔validation history;
4. whether legacy/reconciliation paths remain able to resolve exact historical provider/account authority for the required period.

## 8. Arbitrary-N checklist — provisional R18 disposition

1. **Exact authority/history key?** No immutable R18 binding/version key — **FAIL / F06-01 / F06-02**.
2. **Repeatable parent scopes?** Logical capability K cannot retain arbitrary-N historical authority rows — **FAIL / F06-01**.
3. **Uniqueness constraints?** `UNIQUE(key)` collapses K to one row — **FAIL / F06-01**.
4. **N children under one parent?** Provider/account/verification V1/V2 coexistence is not represented — **FAIL / F06-01**.
5. **Historical and current coexist?** Current projection overwrites historical authority — **FAIL / F06-01**.
6. **Multiple in-flight histories?** Distinct executions cannot each point to exact independent bindings because binding attachment is absent — **FAIL / F06-02**.
7. **Exact downstream reference without mutable pointer/current lookup?** No execution-level binding ID; R20 cannot consume exact R18 validation identity — **FAIL / F06-02**.
8. **Restart/replay reconstructs same N-object graph?** Current capability/driver lookup can substitute later state; exact binding graph is absent — **FAIL / F06-01 / F06-02**.
9. **Retention/archive/delete durability?** governing policy unresolved — **UNRESOLVED / F06-04**.

## 9. Phase-D attack disposition

- **D-C1 — current-pointer overwrite:** FAIL directly; current capability row overwrites historical authority.
- **D-C2 — same-parent deduplication:** FAIL; same logical key collapses distinct provider/account/verification authorities.
- **D-C3 — decision/model collision:** applicable to validation records only after exact binding representation exists; no separate finding yet.
- **D-C4 — mixed-chain reconstruction:** FAIL; execution/provider/current capability can be recomposed from mismatched historical/current states.
- **D-C5 — legitimate coexistence mistaken for conflict:** FAIL; A/A1/V1 and B/B1/V2 cannot coexist under one capability key.
- **D-C6 — creation-time inheritance contamination:** FAIL; executions can consume current driver/capability projection because no immutable bind-time object is attached.

## 10. F7 fragility ledger — carry-forward only, not certification

This batch does **not** certify F7. It records relationships already structurally fragile so F7 can test them deliberately rather than rediscovering them.

### F7-L1 — R18 Binding ↔ R20 decision/evaluation — BLOCKED/FRAGILE

R20 has no canonical decision object (Batch 02), and R18 has no canonical binding/validation object (this draft). Exact N×N decision-to-binding identity is therefore currently unrepresentable at both ends.

### F7-L2 — R17 Offer/Grant ↔ R18 Binding — BLOCKED/FRAGILE

R17 Offer/Grant identity is absent (Batch 05), while commercial capability/account truth is read from mutable capability metadata. A future Offer/Grant must bind exact commercial-payment capability authority without silently reading whichever account is current.

### F7-L3 — R18 Binding ↔ R6 verification result — BLOCKED/FRAGILE

R18 contract requires exact R6 result/policy provenance; current capability persistence stores only verification method/timestamps/metadata and `hasCapability()` collapses to boolean usability. Exact N verification-result ↔ N binding correspondence is not represented.

### F7-L4 — R18 Binding ↔ execution attempts — BLOCKED/FRAGILE

Builder Gateway supports multiple attempts, but attempts store provider string rather than exact binding ID/account identity. Different attempts could therefore appear provider-identical while consuming different authority.

### F7-L5 — R18 Binding ↔ R19 commercial lineage — BLOCKED/FRAGILE

R19 lacks canonical complete lineage (Batch 01), and R18 lacks exact binding identity. Provider/account lineage cannot yet prove that the exact binding consumed by an execution is the one preserved downstream.

### F7-L6 — Phase-E multi-binding execution-specific requirement — BLOCKED/FRAGILE

Compound 04 already requires that an execution needing multiple bindings consume each binding tied to that same exact execution and its own R6/R18 chain. Current schema has no binding ID on executions, so this cannot presently be represented for arbitrary-N bindings.

This ledger is evidence carried into F7, not an F7 result. Each relationship must still receive its own F7 N×N fixture/classification after all six individual surfaces are certified.

## 11. Adversarial-review questions

The reviewer should independently verify at minimum:

1. Is `capabilities_key_unique = UNIQUE(key)` present in both declarative schema and effective runtime migration?
2. Does `setCapabilityAvailable()` truly overwrite provider/verification/metadata/timestamps on conflict by logical key, establishing current-state replacement rather than historical versioning?
3. Is F06-01 correctly a DEFECT rather than UNRESOLVED given that concrete schema/application behavior?
4. Does `builder_gateway_runs` persist only provider/provider-run identity and omit exact capability binding/account/R6 result/policy identity?
5. Does Builder dispatch/tick obtain the current configured driver and refresh the current logical capability row, making same-provider/different-account substitution representable as if nothing changed?
6. Are F06-01 and F06-02 independent under the remove-one-fix counterfactual?
7. Is F06-03 independently warranted, or should missing lifecycle vocabulary be folded into F06-01 as one broader authority-history defect?
8. Could untyped `metadata` legitimately satisfy R18 lifecycle representation under an explicit declared invariant elsewhere, or is no such invariant present?
9. Is the missing Capability Binding Validation Record correctly treated as a consequence of F06-02 rather than a fourth primary defect?
10. Is retention correctly UNRESOLVED rather than DEFECT?
11. Does the `CapabilityBinding` type in `factory.ts` represent software implementation selection only, and therefore not rescue R18 external provider/account execution authority?
12. Independent scan: is there any other binding/history/validation object or application-enforced invariant that materially changes these classifications?
13. Does the F7 fragility ledger overstate any relationship before formal F7, or is each entry correctly labeled carry-forward only?

## 12. Provisional verdict

**R18 provisional Phase-F result: FAIL / OPEN.**

Provisional findings:

- F06-01 — `REPRESENTABILITY_DEFECT / CAPABILITY_AUTHORITY_HISTORY_CARDINALITY`;
- F06-02 — `REPRESENTABILITY_DEFECT / EXECUTION_CAPABILITY_BINDING_ATTACHMENT`;
- F06-03 — `REPRESENTABILITY_DEFECT / CAPABILITY_LIFECYCLE_STATE_REPRESENTATION`;
- F06-04 — `REPRESENTABILITY_UNRESOLVED / HISTORICAL_RETENTION_DURABILITY`.

No semantic MRC or semantic unresolved cross-node gap is opened by this draft. These are current schema/application representability findings under already-established R18 semantics.

This document remains non-authoritative until adversarial review and final adjudication.