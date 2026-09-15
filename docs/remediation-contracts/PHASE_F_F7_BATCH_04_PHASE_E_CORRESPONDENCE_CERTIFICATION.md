# Phase F F7 Batch 04 — Remaining Phase-E Exact-Correspondence Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / F7 BATCH 04 CERTIFIED  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Cluster:** Phase-E exact-correspondence relationships not already certified in F7 Batches 01–03  
**Implementation authority:** SUSPENDED

## 1. Final result

F7 Batch 04 **FAILS / OPEN**.

Confirmed relationship-level findings:

1. **F07-13 — `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`** — exact R2 Capability Resolution Outcome ↔ exact R7 Economic Action/reservation set.
2. **F07-14 — same subtype** — exact R12 occurrence ↔ exact R13 executor/service-path health result.
3. **F07-15 — same subtype** — exact R3 freshness/current-applicability result ↔ exact R20 Boundary Decision predicate.
4. **F07-16 — same subtype** — exact R7 Economic Action/reservation/execution ↔ exact R15/R16 financial result.
5. **F07-17 — same subtype** — exact R15 Provider Financial Observation set ↔ exact R16 canonical reconciliation result.

No new semantic MRC or semantic unresolved cross-node gap is created.

## 2. Governing method

This batch is governed by:

- `PHASE_F_REPRESENTABILITY_MULTIPLICITY_AUDIT_PLAN-REFINEMENT-1.md`;
- `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`, now including Tests A–E;
- prior F7 anti-double-counting dispositions.

The adversarial review confirmed that F07-13 through F07-16 are independently wireable relationships. It also resolved the held-open R15↔R16 candidate in favor of independent counting and produced a new standing Test E: **computation versus retrieval/binding separability**.

## 3. Pinned Phase-E evidence

### Compound 01

`PHASE_E_COMPOUND_01_CERTIFICATION.md`  
Blob: `420c942c8848cdc6f9207a9d37997b1a2e9ef9aa`

Requires every R7 reservation materially depending on R2 to bind the exact immutable R2 outcome/version and exact derived reservation/resource vector. Q2 must not silently reuse Q1/RS1.

### Compound 02

`PHASE_E_COMPOUND_02_CERTIFICATION.md`  
Blob: `80bf29c6b5a5e93209838e238011b8287175e9f6`

Requires, among other controls, R16 release truth current through the complete applicable durable R15 evidence set or governed watermark, exact reservation-member scoping, duplicate-observation semantic deduplication, and preservation of cross-layer truth.

### Compound 03

`PHASE_E_COMPOUND_03_CERTIFICATION.md`  
Blob: `ad00e3a69ad969a8593829bc4c552fede32a18e2`

Requires exact occurrence→executor/service-path health correspondence in heterogeneous recovery; a specific-but-wrong healthy path cannot satisfy another occurrence.

### Compound 05

`PHASE_E_COMPOUND_05_CERTIFICATION.md`  
Blob: `a90d73411b5a844ef5ae6bf78ac9ea04ac0a066b`

Requires every R3 freshness result consumed by R20 to bind exact evidence identity, decision-use proposition, freshness-policy identity/version, temporal basis, evaluation time, and result.

### Compound 06

`PHASE_E_COMPOUND_06_CERTIFICATION.md`  
Blob: `96287ef8099fb339fa607d63b1067cd96ab22f3f`

Requires explicit equality between exact R7 Economic Action/reservation/execution identity and exact R15/R16 execution/provider/account identity before settlement/release.

## 4. Targeted direct R15/R16 verification

Adversarial review correctly identified an evidentiary asymmetry: R15 had not received its own individual Phase-F surface audit even though F07-16 and the proposed F07-17 depended on current R15 persistence behavior.

A targeted direct schema/worker check was therefore performed before final adjudication.

### R15 contract

`docs/remediation-contracts/WI-R15.md`  
Blob: `1b46aa43f33c19e75ef0696286693592fbbf8c77`

R15 requires a canonical Provider Financial Observation preserving, where applicable:

- exact R8 execution identity;
- provider identity;
- exact provider-account identity;
- provider-native observation/event identity;
- original raw financially relevant fields/value shape;
- currency/unit;
- provider/system temporal provenance;
- durable append-only history;
- source/transport provenance.

### Current financial-event schema

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`payment_provider_events` currently stores:

- activation ID;
- Asset ID;
- provider;
- provider event ID;
- provider transaction ID;
- event type/payment status;
- amount/currency;
- authoritative/signature/processed flags;
- generic metadata;
- occurred/received timestamps.

It has provider-event dedupe through `UNIQUE(provider, provider_event_id)`.

However it does **not** declare canonical fields for:

- exact R7 Economic Action/reservation identity;
- exact R8 execution identity;
- exact provider-account identity;
- exact R16 reconciliation-result identity or evidence-set membership.

This is supporting evidence for F07-16/F07-17 and does not create a surprise standalone R15 endpoint finding in this batch.

### Relational-anchor limitation

Direct adversarial verification additionally confirmed that `payment_provider_events.activationId` is the table's only declared relational anchor into the broader commercial-authority model. That foreign key points to `commercial_activations`.

This matters because the same `commercial_activations` surface is already independently certified as structurally inadequate for exact historical commercial authority:

- F01-01 / F01-02: commercial-lineage cardinality and identity representation;
- F05-01 / F05-02: Offer Version identity and cardinality.

Accordingly, R15-like provider events do not merely lack exact R7/R8/account/R16 fields in isolation. Their one existing commercial relational anchor transitively lands on a one-per-Asset mutable activation surface that cannot itself serve as exact immutable Offer/lineage authority.

This is **reinforcing evidence only** for F07-16/F07-17. It does not create another finding or change their classifications.

### Current ingestion worker

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

Authoritative provider events are inserted into `payment_provider_events` using activation/Asset/provider/provider-event/provider-transaction/value/time fields, then projected into Asset observations. Reversal handling preserves compensating observations rather than rewriting prior revenue.

The worker does not add exact R7 reservation/execution identity, exact provider-account identity, or exact R16 evidence-set membership to the provider event record.

### R16 contract / implementation state

`docs/remediation-contracts/WI-R16.md`  
Blob: `7dd92976f68ee90540771b3710e42b6d5b7f396f`

R16 is explicitly marked **Implementation: NOT STARTED**.

Its frozen mission distinguishes:

- immutable R15 evidence observed;
- semantic interpretation applied to that evidence;
- canonical financial state produced from the complete evidence set;
- deterministic replay under an exact versioned reconciliation policy.

It requires the same complete evidence set under the same policy to produce the same result independent of arrival/retry order.

No implemented canonical R16 reconciliation-status/state object was found in the current schema/code search.

## 5. F07-13 — R2 Outcome ↔ R7 reservation

**Final adjudication:** CONFIRMED DEFECT.

Required arbitrary-N pairing:

- Q1 ↔ RS1;
- Q2 ↔ RS2;
- materially different Q2 cannot silently inherit RS1;
- exact derived resource-vector identity remains part of the correspondence;
- restart/replay preserves historical pairings.

This is not constitutive of either R2 or R7's entire purpose. Both endpoint objects can be correct while R7 selects current/latest R2 outcome for the logical action instead of the exact outcome that justified RS1.

Current generic execution persistence has no declared exact R2-outcome↔reservation-set reference invariant.

## 6. F07-14 — R12 occurrence ↔ R13 exact health/path result

**Final adjudication:** CONFIRMED DEFECT.

Required arbitrary-N pairing:

- O1 ↔ X/HX;
- O2 ↔ Y/HY;
- O2 cannot borrow HX because X is healthy/specific/in the same batch;
- stale HX cannot authorize later O1 progression after X degrades;
- restart/replay preserves exact occurrence→path→health identity.

R12 scheduling/durability and R13 liveness are broader independent endpoint purposes. Their exact correspondence can still be wrong through batch index, executor class, generic-kernel health, current/latest record, or query order.

## 7. F07-15 — R3 freshness result ↔ R20 decision predicate

**Final adjudication:** CONFIRMED DEFECT.

Required arbitrary-N pairing:

- FR1 for exact evidence/proposition/policy/version ↔ D1 requiring that exact predicate;
- FR2 ↔ D2 for a materially different proposition/policy/version;
- D2 cannot borrow FR1 because evidence identity/family is similar;
- D1 remains historically attributable to FR1 after later policy/results exist.

R3 freshness is one predicate among many in R20's broader Boundary Decision composite. Batch 02 already confirmed no canonical R20 decision object exists today, so the exact reference path is affirmatively absent on the R20 side.

## 8. F07-16 — R7 reservation/execution ↔ R15/R16 financial result

**Final adjudication:** CONFIRMED DEFECT.

Required arbitrary-N pairing:

- E1/RS1 under provider/account A/A1 ↔ F1;
- E2/RS2 under A/A2 or another execution ↔ F2;
- F2 cannot settle/release E1 because amount/currency/provider family/time superficially match;
- same-provider/different-account substitution fails where account identity is material;
- exact reservation-member coverage remains explicit;
- restart/replay preserves E/RS↔F identity.

Compound 06 expressly characterizes the R7 and R15/R16 records as independently created records requiring an explicit equality check.

The targeted direct R15 check strengthens the defect: current provider-event persistence has no exact R7 reservation/execution field and no exact provider-account field. Thus the equality edge is not currently representable by a declared canonical reference.

This direct R15 evidence is supporting F7 scope, not a separately numbered R15 endpoint finding.

## 9. F07-17 — R15 evidence set ↔ R16 canonical reconciliation result

**Classification:** `REPRESENTABILITY_DEFECT / CROSS_SURFACE_REFERENCE_INTEGRITY`  
**Final adjudication:** CONFIRMED DEFECT.

### Required arbitrary-N/set fixture

Create append-only R15 observations:

- evidence set S1 = {E1, E2};
- later complete set S2 = {E1, E2, E3}, where E3 is already durable before the next governed reconciliation/release boundary.

Create R16 results:

- C1 under policy V1 over exact S1;
- C2 under policy V1 or governed later policy over exact S2.

Prove:

- C1 remains historically attributable to S1;
- a result claimed as current through S2 cannot silently omit E3;
- duplicate delivery of E2 does not create duplicate economic effect while distinct E3 remains distinct;
- evidence-set identity/version/cutoff or equivalent durable membership allows restart/replay to reconstruct exactly which observations governed each result;
- current/latest query order cannot mutate C1's historical evidence membership.

### Test-E adjudication — computation versus retrieval/binding separability

This relationship is independently countable.

R16 has two separable responsibilities:

1. **computation correctness:** given exact evidence set S and policy V, deterministically interpret/reconcile S under V;
2. **retrieval/binding correctness:** identify and durably bind the exact complete R15 observation set S that actually belongs in that reconciliation at the governing boundary.

An implementation can perform the first perfectly while failing the second. A mathematically/policy-correct C1 over S1 is still stale for a boundary at which E3 was already durably part of the applicable evidence set.

Compound-02's reconciliation-freshness strengthening and E2-11 establish this failure pattern directly: an internally valid R16 result can be stale relative to already-durable R15 evidence, which is why exact evidence-set/version/cutoff provenance is required.

Therefore evidence membership is not dismissed as merely constitutive of the reconciliation arithmetic. The retrieval/set-membership boundary remains independently testable after the reconciliation computation itself is correct.

### Current representability

Current R15-like provider-event persistence contains no R16 reconciliation ID/evidence-set membership structure. R16 implementation is not started and no canonical reconciliation-result persistence was found.

Accordingly, exact S↔C reference capacity is affirmatively absent today rather than merely ambiguous.

## 10. Controls not separately recounted

No separate F7 findings are opened for:

- R3 internal multi-evidence completeness inside one R3-owned proposition;
- R16 internal multi-component semantic completeness/status logic apart from exact R15 set membership;
- generic R8+R16 conjunctive release unless an independent set/reference invariant beyond existing owners is demonstrated;
- R7 reservation-member scoping where wholly internal to a corrected R7 reservation-set object;
- compound attacks merely combining already-counted relationships.

These remain mandatory tests under their existing owners.

## 11. Retention

No duplicate relationship-level retention findings are opened.

Final Phase-F synthesis must require durable historical addressability for at least:

- Q↔RS;
- occurrence↔path-health;
- freshness-result↔decision;
- reservation/execution↔financial result;
- R15 evidence-set↔R16 reconciliation result.

The existing Phase-F retention register remains unresolved pending explicit governing deletion/archive policy.

## 12. Final adjudication

**F7 Batch 04 result: FAIL / OPEN.**

Confirmed:

- F07-13 — R2 Outcome ↔ R7 reservation;
- F07-14 — R12 occurrence ↔ R13 exact path-health result;
- F07-15 — R3 freshness result ↔ R20 decision;
- F07-16 — R7 reservation/execution ↔ R15/R16 financial result;
- F07-17 — R15 evidence-set ↔ R16 reconciliation result.

The held-open R15↔R16 candidate is therefore numbered as F07-17.

The standing F7 counting protocol now includes Test E for computation-versus-retrieval/binding separability.

Implementation authority remains **SUSPENDED**.