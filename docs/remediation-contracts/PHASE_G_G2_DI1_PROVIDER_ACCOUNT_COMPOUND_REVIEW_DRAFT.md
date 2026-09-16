# Phase G — G2 DI-1 Provider/Account Compound Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** G — Design Input Consistency  
**Batch:** G2 — High-risk provider/account compound  
**Compound:** `R6 → R7 → R8 → R17 → R18 → R19 → R20`  
**Implementation authority:** SUSPENDED

## 1. Purpose

G1 certified all R1–R20 node-level DI-1 dispositions as internally consistent. G2 asks the harder question: do those individually coherent contracts compose safely through the live implementation when provider/account identity changes over time?

The central attack carried from G1 is the connected substitution-risk sequence:

1. R6 verifies logical capability K under Provider A / Account A1 / V1;
2. R18 binds or should bind the commercial-payment execution to that exact authority;
3. R17 authorizes `DI-1/COMMERCIAL_PAYMENT` for exact A/A1;
4. mutable current capability state later changes to Provider A / Account B1 or Provider B / Account B1 under the same logical capability family/key path;
5. R19 must preserve the historical A/A1 commercial lineage;
6. R20 must revalidate A/A1 at the consequential boundary;
7. no current/default lookup may substitute B/B1 for A/A1.

Phase-F defects are evidence only. A Phase-G finding is opened only where the active Design Input invariant itself is shown to drift or narrow in the composed live path.

## 2. Governing contract topology

G1 directly certified:

- R6: DI-1 dormant under the current single-identity verification model;
- R7: DI-1 dormant under present single-scope reservation semantics, with explicit schema-entanglement guard;
- R8: exact R6×R7×R8 provider/account equality required where material, without generic global activation;
- R17: explicitly activates `DI-1/COMMERCIAL_PAYMENT` for commercial/payment execution;
- R18: preserves/revalidates exact capability binding scope-by-scope and audits commercial payment/provider adapters, but does not own R17 commercial authority;
- R19: consumes activated `DI-1/COMMERCIAL_PAYMENT` from R17 where applicable and must preserve exact commercial provider/account identity;
- R20: where `DI-1/COMMERCIAL_PAYMENT` is active, revalidates the exact bound commercial provider/account and creates no substitution authority.

Therefore the G2 invariant is:

> The exact provider **and provider-account** authorized in the commercial scope must remain the same identity through capability proof/binding, commercial authority, historical lineage, and boundary-time consumption. Provider-family or current-capability equality is insufficient.

## 3. Pinned implementation evidence

### 3.1 Capability schema — one current row per logical key

`lib/db/src/schema/human-actions.ts`  
Blob: `00d07e90fcfe676c296c75c4019d337f4f3f6d08`

`capabilities` persists:

- `key`;
- `provider`;
- status/access/verification metadata/timestamps;
- generic JSON `metadata`.

It enforces:

`UNIQUE(key)`.

Provider-account identity is not a first-class declared column; commercial account identity is currently carried, where present, inside mutable metadata.

### 3.2 Capability update behavior — authority-distinguishing state is overwritten

`artifacts/api-server/src/lib/human-gates.ts`  
Blob: `2e8386b4784a95668db360be978933821529c871`

`setCapabilityAvailable()` performs:

`ON CONFLICT(key) DO UPDATE`

and overwrites provider, access level, verification method, metadata, verification time, expiry, and updated time.

`getCapability(key)` and `hasCapability(key)` read the current row by logical key.

This is the already-certified Phase-F F06-01 replacement mechanism. G2 uses it as evidence, not as an automatic Phase-G finding.

### 3.3 Builder execution — provider string, not exact immutable provider-account binding

`artifacts/api-server/src/lib/builder-gateway.ts`  
Current reviewed main-branch artifact.

Builder Gateway runs are created with provider string `OPENAI_CODEX_SDK`; the worker resolves the configured provider driver at execution time and updates the current logical capability through `setCapabilityAvailable()`.

No exact immutable provider-account/binding identity is attached in the reviewed execution path. This is relevant to the R6→R18 substitution layer, already represented in Phase F by F06-02.

### 3.4 Commercial schema — provider only; no provider-account field

`lib/db/src/schema/asset.ts`  
Blob: `dbb75cb44380cc761d654ae04b567bf4c54e079b`

`commercial_activations` persists:

- one row per Asset via `commercial_activations_asset_unique`;
- `provider`;
- plan/price/current activation data;
- charging/prod-credential authorization timestamps/actors;
- checkout reference and provider operation key.

It does **not** persist an exact provider-account identity, merchant capability version/binding ID, or immutable R18 binding identity.

`payment_provider_events` likewise records provider but has no declared exact provider-account field.

### 3.5 Commercial worker — current merchant capability is read, but its account is not frozen

`artifacts/api-server/src/lib/commercial-activation-worker.ts`  
Blob: `fe4592c8c2e2113d479d14f9396826b6fc0dee48`

The worker defines merchant capability by provider-derived logical key:

`PAYMENT_MERCHANT_ACCESS:${provider}`

`merchantCapabilityVerified()` requires current capability metadata to contain a non-empty `accountId`, but the worker does not copy that `accountId` into `commercial_activations`, an immutable Offer/Grant object, or an R18 binding object.

On every reconciliation pass the worker re-reads the current merchant capability by logical key.

It separately reads current production-credential capability by provider-derived logical key.

The provider runtime adapter is selected through:

`getCommercialPaymentAdapter(activation.provider)`

The activation row supplies provider, not provider-account.

### 3.6 Commercial authorization does not freeze reviewed account identity

Same worker, `authorizeCommercialBoundary()`.

For `CUSTOMER_CHARGING`, the function:

- flips current Asset authority `customerChargingAuthorized = true`;
- records authorization time/actor on the commercial activation;
- records the activation ID in Human Action resolution/event metadata.

It does not persist the merchant `accountId` that satisfied capability verification or bind the authorization to one immutable R18 capability binding.

### 3.7 Commercial adapter — provider keyed, no account identity in call contract

`artifacts/api-server/src/lib/commercial-payment-adapter.ts`  
Blob: `c55e778cf9cf03281748daf35880e0c5a1ac024d`

`CommercialPreparationInput` includes Asset, Opportunity, provider operation key, currency, price, production URL, and promised outcome. It has no provider-account/binding identity.

Adapters are registered in a map keyed by `adapter.provider`, and fetched by provider string.

The configured HTTP bridge is called with the commercial input plus authority flags; no exact provider-account identity frozen by R17/R18 is supplied to or checked by the adapter contract.

### 3.8 R20 implementation cannot restore the missing identity downstream

`PHASE_F_BATCH_02_R20_REPRESENTABILITY_CERTIFICATION.md` records the current implementation evidence establishing no canonical R20 boundary-decision object binding exact upstream authority/predicate identities. Its canonical Phase-F finding is F02-01.

Thus there is no later canonical R20 decision layer in the current representation that independently freezes/revalidates the omitted commercial provider-account identity.

## 4. Connected A1→B1 attack — current live path

Use the same provider P so provider-string equality cannot expose the substitution.

### T0 — authority A1

1. Logical merchant capability key is `PAYMENT_MERCHANT_ACCESS:P`.
2. Current capability row contains provider P and metadata `accountId=A1`, verification V1.
3. `merchantCapabilityVerified()` passes.
4. Commercial activation persists provider P, but no A1 field/binding ID.
5. Checkout preparation may proceed through adapter P.
6. `CUSTOMER_CHARGING` is explicitly authorized for this commercial activation.

At this point the governing R17 semantics require the commercial authority to be exact P/A1.

### T1 — mutable current authority changes

7. `setCapabilityAvailable()` updates the same logical capability row for key `PAYMENT_MERCHANT_ACCESS:P`, now with metadata `accountId=B1` / V2.
8. The prior A1 authority is not independently addressable through the singleton current-row representation.

### T2 — later commercial reconciliation / activation

9. `reconcileCommercialActivation()` re-reads current merchant capability by `PAYMENT_MERCHANT_ACCESS:P`.
10. B1 passes `merchantCapabilityVerified()` because it is a usable current row with some non-empty accountId.
11. The activation row still contains only provider P, not A1.
12. `getCommercialPaymentAdapter(P)` resolves by provider string only.
13. Adapter input carries no A1 account/binding identity.
14. No equality check can prove that the account now backing the live adapter/capability is the same A1 that was reviewed/authorized earlier.
15. No canonical R20 decision object later restores that exact comparison.

Therefore provider P can remain constant while provider-account identity drifts from A1 to B1 without the commercial activation/dispatch contract having a frozen A1 identity against which to fail closed.

## 5. Candidate G2 finding

### G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`

**Invariant violated:** active `DI-1/COMMERCIAL_PAYMENT` requires exact provider **and provider-account** identity. The live commercial path narrows that to provider string plus mutable/current capability metadata/provider runtime.

**Concrete consequence:** a commercial activation authorized under P/A1 has no persisted exact A1 authority/binding identity, so later current capability/runtime state for P/B1 can satisfy the same provider-keyed flow without an A1=B1 proof.

**Provisional classification:** CONFIRMED CANDIDATE DEFECT, pending adversarial review.

Why this is a Phase-G finding rather than merely Phase-F restatement:

- F06-01/F06-02 prove deficient capability-history/binding representation;
- F05/F01/F02 prove deficient Offer/Lineage/Decision representation;
- G2-01 identifies the **Design Input composition consequence**: the exact named active provider/account scope is materially narrowed and can drift across the live commercial chain.

The Phase-G closure proof is therefore different: even after endpoint objects become representable, the composed commercial path must prove that the exact authorized account remains identical from R6/R18 through R17/R19/R20 and actual provider dispatch.

## 6. Anti-inflation / finding independence

No additional G2 primary finding is provisionally opened for:

- R6 current-row overwrite alone — owned by F06-01 as representation evidence;
- missing R18 binding alone — owned by F06-02 as representation evidence;
- missing Offer Version/account field alone — already Phase-F endpoint representation scope;
- missing R19 lineage object alone — already Phase-F endpoint representation scope;
- missing R20 decision object alone — F02-01;
- provider-only adapter contract as a separate DI finding — currently one constitutive mechanism of G2-01;
- R17/R19/R20 contract wording — G1 certified it consistent.

Remove-one-fix counterfactual:

If capability history, exact R18 bindings, exact Offer Versions, R19 lineage, and R20 decisions were each made representable, G2-01 would still remain open unless the **same exact provider-account identity** is actually wired and equality-checked end-to-end at commercial preparation/authorization/activation/boundary consumption. Therefore G2-01 has an independently testable Phase-G acceptance criterion and is not merely a duplicate schema finding.

Conversely, one end-to-end fix that freezes exact P/A1 into the governing Offer/Grant/binding/lineage/decision and requires the adapter/provider call to prove it is acting as P/A1 would close the single G2 identity-drift invariant; it should not be split into five Phase-G findings merely because five nodes participate.

## 7. R7 and R8 disposition inside the compound

### R7

No separate G2 defect is established merely because commercial provider/account identity exists. R7's DI-1 trigger remains substitution semantics in resource admission/resolution. The reviewed commercial activation path uses a zero-cash adapter and the present evidence does not establish an independent R7 account-substitution decision distinct from G2-01.

Any future/provider entitlement or scarce-resource pool keyed to payment account must nevertheless preserve the same exact account under the existing R7 entanglement guard.

### R8

R8's contract correctly requires exact provider/account external truth and forbids cross-account historical reconciliation. Current `payment_provider_events` persists provider but no declared provider-account identity, which reinforces the same G2-01 end-to-end narrowing. It is not separately counted here because the same P/A1→P/B1 identity loss is the constitutive failure.

## 8. Named-scope topology result

At the **contract level**, the named scope remains stable:

`R17 DI-1/COMMERCIAL_PAYMENT → R19 same named scope → R20 exact named-scope revalidation`.

There is no G2 contract-level `DI_NAMED_SCOPE_DRIFT` finding.

The failure is implementation/composition-level identity narrowing: the name survives in prose while the exact account dimension it denotes is not carried through the live commercial path.

## 9. Attack results relevant to G2

- **G-A1 scope broadening:** PASS at contract level; no unrelated scope is made commercial-payment active.
- **G-A2 scope narrowing:** **PROVISIONAL FAIL / G2-01** — exact provider/account narrows to provider + mutable current account state.
- **G-A3 named-scope collapse:** PASS at contract level; canonical name remains explicit through R17/R19/R20.
- **G-A4 current/default account substitution:** **PROVISIONAL FAIL / G2-01** — A1→B1 attack is representable through current capability replacement with no frozen A1 equality check.
- **G-A9 successor inheritance:** covered by the same acceptance requirement; no successor/current state may inherit authority merely because provider/logical key matches.
- **G-A10 inactive-scope contamination:** no evidence that dormant R6/R7/R8 generic dispositions are being cited as positive commercial substitution grants.

G4 will later execute the complete Phase-G attack suite; this section records only the G2-relevant results.

## 10. Required acceptance fixture for G2-01

A compliant future remediation/recheck must prove:

1. create P/A1 capability authority V1;
2. bind commercial execution to exact immutable R18 binding BIND1 for P/A1;
3. create exact R17 Offer/Grant commercial authority O1/G1 for P/A1;
4. freeze exact P/A1 into R19 lineage L1;
5. replace current capability/runtime configuration with P/B1/V2;
6. retain A1 and B1 simultaneously as distinct historical/current authorities;
7. attempt O1/G1/L1 commercial preparation/activation/charge boundary;
8. prove current P/B1 cannot satisfy P/A1 equality merely because provider/key matches;
9. prove R20 decision D1 consumes exact L1/BIND1/P/A1;
10. prove actual adapter/provider dispatch is targeted to and can attest the same exact P/A1 account identity;
11. if P/B1 is intended, require explicit governed successor/rebinding authority rather than in-place substitution;
12. repeat across arbitrary A1...AN/current changes and restart/replay without current-state reconstruction.

## 11. Adversarial review questions

Before G2 certification, independently challenge at least:

1. Is there any hidden provider-account identity in `commercial_activations`, Offer/Grant-equivalent storage, adapter registration, bridge configuration, or authorization metadata that defeats the A1→B1 attack?
2. Does `merchantCapabilityVerified()` merely check that *some* account exists, or is there an equality path to the account previously authorized that this draft missed?
3. Can a configured commercial adapter be proven account-stable by some durable identity not visible in its interface/provider-keyed map?
4. Does `authorizeCommercialBoundary()` bind enough immutable authority to A1 elsewhere even though the activation row lacks account identity?
5. Is G2-01 genuinely independent of F06-01/F06-02/F05/F01/F02 under the remove-one-fix counterfactual?
6. Should R8 provider-account omission be separately counted, or is it correctly folded into the same constitutive A1→B1 identity-drift invariant?
7. Is there an independent R7 provider/account substitution path in the commercial flow that survives if G2-01 is repaired?
8. Does the absence of canonical R20 representation weaken G2-01 to `DI_SOURCE_UNRESOLVED`, or does the directly demonstrated earlier narrowing already earn DEFECT?
9. Should the primary taxonomy be only `DI_SCOPE_NARROWED`, only `DI_IDENTITY_SEMANTIC_DRIFT`, or dual-tagged because the exact account dimension is both omitted and replaceable by current state?
10. Can the full connected attack be executed using same-provider/different-account P/A1→P/B1, the hardest case because provider-string equality remains true throughout?

## 12. Provisional disposition

**G2:** FAIL PROVISIONALLY / ONE CANDIDATE PHASE-G DEFECT.

- **G2-01 — `DI_SCOPE_NARROWED / DI_IDENTITY_SEMANTIC_DRIFT`** — exact `DI-1/COMMERCIAL_PAYMENT` provider-account identity is not preserved through the live commercial compound and can be replaced by mutable current provider-account state under the same provider/logical key.
- No separate contract-level named-scope drift found.
- No additional independent G2 finding provisionally counted.

Certification remains pending adversarial review.

Implementation authority remains **SUSPENDED**.
