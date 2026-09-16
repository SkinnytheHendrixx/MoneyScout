# Phase H — Global Source-Gap Register Audit Plan — Review Draft

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** H — Source-Gap Register  
**Implementation authority:** SUSPENDED

## 1. Purpose

Phase H creates the single explicit global unresolved-source-gap register required by the Global Fidelity & Cross-Node Audit.

Phase H does **not** reclassify implementation defects, representability defects, or Design Input defects as source gaps merely because source recovery is incomplete somewhere nearby. Its job is to identify the exact propositions that remain unsupported by recoverable source, classify what each missing proposition can affect, state whether the available source is exhausted, and define the safe treatment without inventing historical detail.

Governing authority:

- `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md` — blob `133b1a05637a2c39f341ffac61c46b375421109e`, §11.

Governing rule:

> `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` is not proof that the original detail never existed.

## 2. Mandatory register fields

Every primary Phase-H source gap must record:

1. node;
2. exact missing proposition/detail;
3. immutable node/source artifact SHA(s);
4. actual source(s) checked;
5. whether the available source is exhausted;
6. impact class;
7. whether local implementation authority is blocked by this gap itself;
8. whether neighboring frozen contracts constrain the missing detail sufficiently for safe implementation;
9. required treatment;
10. explicit resolution trigger;
11. whether the item must carry into Phase I exactness review;
12. whether independent T4 review can adjudicate semantics without recovering historical wording.

## 3. Source-gap impact classes

A missing historical detail may carry one or more impact tags.

### `H_SEMANTIC_IMPLEMENTATION`

The unavailable source could change a consequential normative rule, state transition, authority boundary, admissibility rule, reconciliation rule, lifecycle rule, or execution behavior.

Default treatment: source recovery or governed independent re-derivation is required before the missing semantic is treated as original authority. If neighboring frozen contracts provide a safe conservative envelope, implementation may use that envelope only as a new governed rule, not as recovered historical fact.

### `H_REPRESENTATION_EXACTNESS`

The semantic requirement is known, but exact historical schema fields, storage shape, key format, serialization, hash/fingerprint, or enum representation are not recoverable.

This may constrain implementation compatibility but does not automatically mean semantics are unresolved.

### `H_NAMING_EXACTNESS`

The semantic state/phase/class exists, but the exact historical label/string/name is not source-confirmed.

These items are mandatory Phase-I inputs.

### `H_TRACEABILITY_ONLY`

Missing historical migration child labels/ordinals, audit names/classification vocabulary, provenance labels, or equivalent traceability metadata do not change the recovered substantive rule.

### `H_FIXTURE_PROVENANCE`

The substantive acceptance scenario is known, but the exact historical fixture label, order, or original fixture packaging is unavailable.

### `H_CLOSURE_EVIDENCE_ONLY`

The substantive closure obligations are recoverable, but the exact historical numbered closure-evidence list/order is not.

### `H_HISTORICAL_WORDING_ONLY`

Exact rejected-alternative wording, amendment prose, explanatory phrasing, or worked-example wording is missing while the governing invariant itself is recovered.

### `H_PROVIDER_OR_DOMAIN_MAPPING`

The generic governing rule is recovered but exact provider-specific field mappings, provider-specific semantics, or domain-specific mappings are not recoverable.

This can become semantic if provider behavior materially differs; do not assume generic mappings are sufficient without verification.

## 4. Source-exhaustion states

Use only:

- `SOURCE_EXHAUSTED` — the named available source well has been directly checked and no further recoverable support exists;
- `SOURCE_NOT_YET_EXHAUSTED` — an identified source remains unchecked or a targeted reread remains available;
- `SOURCE_PARTIALLY_EXHAUSTED` — some named source strata are exhausted but another identified source class may still exist;
- `SOURCE_AVAILABILITY_UNRESOLVED` — the audit cannot yet establish whether a relevant source survives.

No item may be labeled `SOURCE_EXHAUSTED` merely because repository search found no matching phrase. Exhaustion requires a named-source basis.

## 5. Treatment taxonomy

Every primary gap receives one or more treatments.

### `RECOVER_SOURCE`

Use when an identified underlying source still plausibly exists and could establish historical exactness.

### `INDEPENDENT_REDERIVATION`

Use when the historical source is exhausted/unavailable but a consequential semantic must still be established for the corrected authority set. The result is a new governed rule, not retroactive proof of original wording.

### `CONSERVATIVE_IMPLEMENTATION_RULE`

Use when neighboring frozen contracts safely bound the missing detail strongly enough to implement a fail-closed rule without claiming historical exactness.

### `CONTINUED_NON_AUTHORITY`

Use when neither source recovery nor safe neighboring constraints establish enough authority to implement the missing proposition.

### `PHASE_I_EXACTNESS_CHECK`

Use for naming/string/phase-label uncertainty that must be revisited under Phase I.

### `TRACEABILITY_DEBT_ONLY`

Use when the missing detail affects historical traceability/provenance but not recovered semantics or safe implementation behavior.

## 6. Counting and anti-inflation rule

Phase H counts **missing propositions**, not every bullet of missing prose.

Group missing details into one primary gap when all of the following are true:

1. they depend on the same unavailable source proposition/source packet;
2. they share the same impact class;
3. one source recovery/adjudication event would resolve them together;
4. they have the same implementation-authority consequence;
5. they have the same required treatment.

Split them when any of the following is true:

- one can be recovered/adjudicated while the other remains missing;
- one affects runtime semantics while the other affects naming/traceability only;
- they require different acceptance proof or conservative rule;
- they have different source wells or exhaustion states;
- one blocks implementation while the other does not.

Repeated cross-node categories such as “exact migration labels/ordinals” remain node-specific traceability gaps unless the original source proves they were one shared global taxonomy.

## 7. Critical semantic-vs-assurance distinction

A node may remain globally `SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY` while many of its individual missing details are **not** implementation-semantic gaps.

Phase H therefore must not infer:

`node SOURCE_INCOMPLETE → every listed source gap blocks semantic implementation`

Likewise:

`semantic invariant recovered → exact historical schema/name/fixture was recovered`

Both errors are forbidden.

## 8. Initial calibration examples from direct source checks

These are plan-calibration examples, not yet the final H register.

### R8 — reconciliation-capability taxonomy

`WI-R8.md` — blob `237c752671573013d090e2eacf7c2af4c0e70512` — §§16/22 explicitly recall a reconciliation-capability taxonomy but refuse to certify the exact enum/labels from source.

Candidate labels are preserved only as non-normative memory and explicitly marked:

`SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD / NOT FROZEN AS NORMATIVE ENUM`.

Provisional impact: `H_SEMANTIC_IMPLEMENTATION` + `H_NAMING_EXACTNESS`.

Reason: taxonomy distinctions may affect which reconciliation behavior/replay path is safe; this is materially different from losing an original fixture label.

### R9 — historical migration/fixture/closure wording

`WI-R9.md` — blob `0ef14b00a1569ae649fe064aadecb498a2bc71e6` — §21 lists exact migration labels/ordinals, audit vocabulary, fixture ordering, closure-evidence list, wording, and worked examples as unrecoverable while the source-freeze invariants themselves were restored.

Provisional impacts: `H_TRACEABILITY_ONLY`, `H_FIXTURE_PROVENANCE`, `H_CLOSURE_EVIDENCE_ONLY`, `H_HISTORICAL_WORDING_ONLY`.

This is not provisionally a missing R9 semantic authority rule.

### R20 — three-phase exact names

`WI-R20.md` — blob `d9d7788e4c5a8f4c0914cf845294b38386470333` — §29 preserves the three-phase semantics but leaves exact literal enum/string names source-unresolved if they differ from `PREFLIGHT`, `BOUNDARY_VALIDATION`, `ADOPTION_VALIDATION`.

Provisional impact: `H_NAMING_EXACTNESS`; mandatory Phase-I input.

## 9. Register construction sequence

### H0 — node/source-gap inventory

Read the current pinned R1–R20 contracts plus Phase-A/B assurance records where needed. Extract every explicit source gap and any source limitation established by the global audit that is not already written into the node artifact.

No final gap count before H0 covers 20/20 nodes.

### H1 — semantic/blocking-gap adjudication

Isolate every candidate `H_SEMANTIC_IMPLEMENTATION` / `H_PROVIDER_OR_DOMAIN_MAPPING` gap and pressure-test:

- what exact behavior could differ depending on the missing source?
- do neighboring frozen contracts constrain the safe behavior?
- would a conservative fail-closed rule preserve safety?
- is source recovery still possible?
- would independent re-derivation establish a new valid rule without pretending historical fidelity?

### H2 — exactness/traceability/provenance adjudication

Classify naming, representation, migration/audit traceability, fixture provenance, closure-evidence, and historical-wording gaps. Separate Phase-I naming inputs from non-semantic recovery debt.

### H3 — source-exhaustion verification

For every primary gap, name the actual source checked and establish `SOURCE_EXHAUSTED`, `SOURCE_NOT_YET_EXHAUSTED`, `SOURCE_PARTIALLY_EXHAUSTED`, or `SOURCE_AVAILABILITY_UNRESOLVED`.

A generic “not found” is insufficient.

### H4 — global register synthesis

Produce the canonical register with:

- 20/20 node coverage;
- primary gap count by impact class;
- implementation-blocking gap count;
- naming/Phase-I carry-forward count;
- source-exhausted count;
- conservative-rule / re-derivation / continued-non-authority dispositions;
- explicit resolution triggers;
- no implementation defect double-counting.

## 10. Cross-phase boundaries

Phase H must carry relevant evidence from prior phases without reclassifying it incorrectly.

- Phase F representability defects remain Phase F defects unless the **original intended representation** itself is source-unresolved.
- Phase G G2-01 remains a DI composition defect, not a source gap.
- Phase G `SEMANTIC_ONLY` wording is a Phase-H concern only to the extent that exact historical source remains unavailable; it does not automatically reopen Phase-G activation/disposition.
- Phase I owns final exact-name/string checks after H identifies naming gaps.
- T4 review may independently challenge or re-derive consequential semantics, but cannot convert an exhausted historical source gap into proof of original wording.

## 11. Implementation-authority rule

Phase H does not restore implementation authority.

For each gap, the register must say one of:

- `BLOCKS LOCAL IMPLEMENTATION AUTHORITY`;
- `DOES NOT BLOCK SEMANTIC IMPLEMENTATION, BUT HISTORICAL EXACTNESS REMAINS UNPROVEN`;
- `SAFE ONLY UNDER CONSERVATIVE RULE`;
- `CONTINUED NON-AUTHORITY UNTIL SOURCE/REDERIVATION`.

A node's broader non-authority state may persist for other defects even when one source gap is non-blocking.

## 12. Closure criteria

Phase H may close as an audit only when:

1. R1–R20 source-gap coverage is explicit;
2. every primary gap names the missing proposition;
3. every gap names actual source basis and exhaustion state;
4. every gap has an impact class;
5. every gap has an implementation-authority effect;
6. neighboring constraints are stated where applicable;
7. every gap has a treatment and resolution trigger;
8. naming exactness items are handed to Phase I;
9. implementation/representability/DI defects are not double-counted as source gaps;
10. adversarial review pressure-tests the semantic/blocking classifications and arithmetic.

Implementation authority remains **SUSPENDED**.
