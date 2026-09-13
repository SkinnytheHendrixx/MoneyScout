# Phase F — Representability and Multiplicity Audit Plan

**Status:** ACTIVE AUDIT / NON-AUTHORITATIVE UNTIL REVIEWED  
**Phase:** F — Representability and Multiplicity Sweep  
**Implementation authority:** SUSPENDED

## 1. Purpose

Phase F determines whether the recovered authority model can actually represent multiple historically distinct and concurrently relevant authorities without collision, overwrite, current-pointer substitution, or implicit one-current-row assumptions.

Phase D already certified the specification-level coexistence rule for two distinct valid hard-chain histories. Phase F does not re-decide that semantic question. It tests whether schema/storage/key/cardinality can realize it for conceptually arbitrary N.

Governing axiom:

> **If the schema cannot represent multiple historically distinct authorities at once, no downstream logic can make the system historically correct.**

## 2. Mandatory surfaces

The global audit requires at least these six representability targets:

1. **R9** immutable source snapshots / Build Source Snapshot identities.
2. **R10** multiple Artifact Versions and Release Jobs.
3. **R17** multiple Offer Versions / Grants.
4. **R18** historical capability bindings and concurrent exact bindings.
5. **R19** Commercial Authority Lineage References, including the M14 / `commercial_activations_asset_unique` risk and N concurrent lineages.
6. **R20** concurrent Boundary Registry decisions and multiple in-flight/historical authority evaluations.

The sweep is not limited to these six. Any upstream/downstream schema surface necessary to preserve their exact identity becomes in-scope if one-current-row assumptions would collapse the authority path.

## 3. Canonical coexistence control

Reuse the Phase-D control as a storage test:

`A1 → S1 → P1 → O1/G1 → L1 → D1`

`A2 → S2 → P2 → O2/G2 → L2 → D2`

Both chains share a legitimate higher-level scope where applicable but remain distinct historical authorities.

Phase-F PASS requires that both chains can be durably represented at the same time without:

- overwriting either chain;
- violating uniqueness constraints merely because both belong to the same Asset/Bet/Opportunity/provider/account/boundary class;
- forcing one chain into a mutable current pointer that becomes the only queryable authority;
- reconstructing one chain from the other's current state;
- merging distinct decisions because their boundary type or parent object matches;
- preventing arbitrary-N extension merely because the N=2 fixture happens to pass.

## 4. Reuse Phase-D attacks as schema attacks

### F-D1 — current-pointer overwrite

Create chain 1, then chain 2. Verify chain 2 creation does not mutate, replace, or become the sole representation of chain 1's R9/R10/R17/R19/R20 identities.

### F-D2 — same-parent deduplication

Two distinct snapshots/artifacts/offers/lineages/decisions under one higher-level parent must not be collapsed merely because parent identity matches.

### F-D3 — decision-model collision

D1 and D2 may concern the same Asset and same boundary class while evaluating different exact authorities. Schema keys must allow both to coexist independently.

### F-D4 — mixed-chain reconstruction

Every persisted chain must remain reconstructable from its own exact foreign-key/reference path. Query-time joins must not silently combine S1/P1 with O2/L2 or other mixed identities.

### F-D5 — legitimate coexistence mistaken for conflict

Two valid historical/in-flight authorities are not a schema conflict merely because both are live/preserved at once. Uniqueness constraints must distinguish authority identity from current-selection policy.

### F-D6 — creation-time inheritance contamination

A successor/renewal/migration lineage may record predecessor relationship metadata but must persist its own frozen authority fields. Schema defaults/triggers/current-parent lookups must not populate chain-2 constituent identities from chain 1.

## 5. Surface-specific audit matrix

### F1 — R9 immutable source snapshots

Prove:

- multiple Build Source Snapshots can coexist for the same higher-level Bet/Product/Asset where historically legitimate;
- snapshot identity is immutable and independently addressable;
- no one-current-snapshot field is the sole source of authority;
- downstream R10 references exact snapshot identity, not current source state;
- arbitrary-N snapshots do not overwrite or collide.

Failure class: `REPRESENTABILITY_DEFECT / SOURCE_SNAPSHOT_CARDINALITY`.

### F2 — R10 Artifact Versions / Release Jobs

Prove:

- multiple Artifact Versions and Release Jobs may coexist for the same product/asset lineage;
- artifact identity remains exact through build/release/deployment/adoption history;
- uniqueness/indexing does not collapse historical P1/P2 merely because parent or deployment target matches;
- Release Job identity does not become synonymous with current deployed artifact;
- exact R9 snapshot reference remains independently preserved per artifact/release path.

Failure class: `REPRESENTABILITY_DEFECT / ARTIFACT_RELEASE_CARDINALITY`.

### F3 — R17 Offer Versions / Grants

Prove:

- multiple immutable Offer Versions may coexist for one Asset/product;
- historical Grants remain bound to exact Offer Version rather than mutable current offer;
- supersession/revocation does not delete or rewrite prior offer/grant identity;
- provider/account/payment configuration plurality remains representable where applicable;
- multiple historical/current commercial paths do not collide on Asset-level uniqueness.

Failure class: `REPRESENTABILITY_DEFECT / OFFER_GRANT_CARDINALITY`.

### F4 — R18 capability bindings

Prove:

- multiple historical and concurrently relevant Capability Binding Snapshots can coexist for the same capability key;
- same capability key does not force one binding row/current binding identity;
- provider/account/credential/policy-version plurality is representable without substitution;
- several executions may preserve distinct exact bindings simultaneously;
- lifecycle transition of B2 cannot overwrite historical B1 state/identity.

Failure class: `REPRESENTABILITY_DEFECT / CAPABILITY_BINDING_CARDINALITY`.

### F5 — R19 Commercial Authority Lineage References

Prove:

- arbitrary-N Lineage References may coexist for one Asset/higher-level commercial scope;
- `commercial_activations_asset_unique` or equivalent one-activation-per-Asset assumptions cannot collapse valid distinct historical lineages;
- each lineage persists exact R4/R9/R10/R17/provider-account/session/transaction/financial linkage independently;
- a new activation/renewal/successor creates a new lineage identity rather than mutating an existing one;
- query-time traversal cannot substitute current Offer/Artifact/account identities for historical ones.

Failure class: `REPRESENTABILITY_DEFECT / COMMERCIAL_LINEAGE_CARDINALITY`.

### F6 — R20 boundary decisions / concurrent evaluations

Prove:

- multiple boundary decisions for the same Asset and same boundary class can coexist when they concern different exact authorities or executions;
- decision key includes enough exact authority/boundary identity to prevent D1/D2 overwrite;
- preflight/boundary/adoption decisions remain distinct where applicable;
- prior ALLOW/DENY remains historical evidence rather than a single mutable current authorization bit;
- concurrent in-flight decisions can reference different R19/R18/R7/R3/etc. predicate identities without collision;
- arbitrary-N evaluation history remains addressable.

Failure class: `REPRESENTABILITY_DEFECT / BOUNDARY_DECISION_CARDINALITY`.

## 6. Cross-surface attacks carried from Phase E

Phase-E strengthenings become representability questions where they require durable exact identities or sets. At minimum verify schema support for:

- R2-resolution/version → R7 reservation correspondence from Compound 01;
- exact reservation-set member multiplicity and release scoping from Compound 02;
- R12 occurrence → R13 executor path → R7 occurrence/reservation correspondence from Compound 03;
- multi-binding set correspondence for one execution from Compound 04;
- R3 exact decision-use / policy-version result identity and multi-evidence completeness from Compound 05;
- R7 Economic Action/reservation/execution ↔ R15/R16 exact financial identity equality from Compound 06.

Phase F does not re-adjudicate those semantics. It asks whether the model can persist the identities, versions, members, and multiplicity required to execute them without collapse.

## 7. Classification discipline

A Phase-F defect exists when the intended semantic state is determinate but the recovered/current schema cannot represent it safely.

Use:

- `REPRESENTABILITY_PASS` — exact identities and required multiplicity are representable.
- `REPRESENTABILITY_DEFECT` — schema/key/cardinality/current-pointer design cannot represent a required legitimate state.
- `REPRESENTABILITY_UNRESOLVED` — available record is insufficient to determine whether representation exists; do not infer PASS.
- `IMPLEMENTATION_DETAIL_ONLY` — representation is clearly possible under the recovered contract and remaining choice is non-normative implementation detail.

Do not classify a semantic contradiction as representability merely because it involves fields. Do not classify a missing schema proof as PASS merely because a future implementation could theoretically redesign it.

## 8. Arbitrary-N requirement

Passing an N=2 fixture is necessary but not sufficient.

For every surface, reviewers must answer:

1. What key identifies one exact authority/history object?
2. What parent scopes may legitimately repeat?
3. Which uniqueness constraints/indexes exist or are required?
4. Can N distinct children coexist under the same parent without overwrite?
5. Can historical and current objects coexist simultaneously?
6. Can multiple in-flight objects coexist?
7. Can every downstream reference bind one exact child without consulting a mutable current pointer?
8. Does restart/replay reconstruct the same N-object graph deterministically?

A schema whose correctness depends on "there will only be one current row" fails whenever the specification permits concurrent or historical plurality.

## 9. Phase-F closure condition

Phase F closes only when:

- all six mandatory surfaces are classified;
- all discovered dependent schema surfaces are included;
- D-C1 through D-C6 are re-executed as representability tests;
- arbitrary-N reasoning is explicit for every multiplicity-bearing surface;
- every Phase-E identity/set strengthening has a representability disposition;
- all `REPRESENTABILITY_DEFECT` and `REPRESENTABILITY_UNRESOLVED` findings are durably registered;
- no Phase-F PASS relies solely on mutable current/latest pointers;
- final review confirms that schema representability has not been confused with implementation completion.

Phase F certification remains specification/schema-level. It does not return implementation authority and it does not remediate the four MRCs, C21-03, C11-02 `BOUNDED`, or any Phase-E fixture-tier strengthening.
