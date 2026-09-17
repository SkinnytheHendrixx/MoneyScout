# Money Scout — Phase-F Full Reconciliation — Review Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / NON-AUTHORITATIVE UNTIL GLOBAL REGISTER INTEGRATION  
**Applies to:** `GLOBAL_REMEDIATION_REGISTER_PHASE_F_RECONCILIATION_REVIEW_DRAFT.md`  
**Base blob:** `fc57310f03c18fa331fb1bbf8212c455023469dc`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This overlay incorporates two evidence-based corrections from adversarial review of the full 36-row Phase-F reconciliation.

Neither correction changes the canonical Phase-F denominator or finding ownership:

- 29 confirmed representability defects remain 29;
- 7 unresolved representability questions remain 7;
- 36 total primary Phase-F dispositions remain 36.

The corrections change dependency/concurrency structure only.

## 2. Correction PF-R1-01 — add `capabilities` as a known shared physical root

### 2.1 Confirmed root

The current `capabilities` persistence surface is a known shared physical root, not merely a future PAIM discovery candidate.

Phase F Batch 06 directly established that the current capability representation is one mutable row per logical capability key and that `setCapabilityAvailable()` performs an `ON CONFLICT(key) DO UPDATE` overwrite of provider, status, access level, verification method, metadata, verification time, expiry, and update time. This is the physical mechanism underlying F06-01's authority-history/cardinality defect and materially participates in F06-02's exact-binding problem.

The same physical surface is also the confirmed implementation root of `IC-G2-01` provider/account substitution behavior.

### 2.2 Known transitive consumers

Known normative/evidence consumers of this root include at minimum:

- `REP-R18` / F06-01;
- `REP-R18` / F06-02 through exact capability-binding attachment;
- `AUX-F-R6-VERIFICATION`, where current verification/provider/account authority is resolved through the same capability representation;
- `REP-F07-01` — R6 Verification Result ↔ R18 Binding;
- `REP-F07-03` — R18 Binding/Validation ↔ R20 Decision;
- `REP-F07-04` — R17 Offer/Grant ↔ R18 commercial-payment Binding;
- `REP-F07-05` — R18 Binding ↔ R19 Lineage;
- `REP-F07-06` — execution ↔ multiple exact R18 bindings;
- `IC-G2-01` — provider/account substitution defect.

This is a minimum known consumer set. PAIM-C must still expand it if a concrete amendment reveals additional evidence-reference consumers.

### 2.3 Shared-root stability rule

`capabilities` receives the same concurrency treatment already assigned to `commercial_activations`.

When an amendment-bearing node changes the `capabilities` physical representation, equality/reuse semantics, provider/account fields, verification attachment, lifecycle fields, or current-projection behavior:

1. PAIM-C must enumerate every normative/evidence consumer of that root;
2. all parallel amendment-bearing consumers whose certification depends on the changing root enter `BLOCKED_PENDING_SHARED_ROOT_STABILITY`;
3. the block is transitive through evidence references and exact-binding dependencies, not limited to nodes that directly edit the table;
4. the block clears only when the modifying node reaches `POST_AMENDMENT_BCT_PASSED` or rollback restores a known stable root;
5. prior certification evidence derived from the changed root becomes `AMENDED_PENDING_RECHECK` wherever its evidentiary basis changed.

### 2.4 Independence preserved

This shared-root declaration does not merge F06-01, F06-02, any F7 finding, or IC-G2-01.

One physical correction may affect several rows, but each row retains its own normative closure predicate and independent recheck obligation.

### 2.5 Required amendment to Phase-F reconciliation §7

The prior sentence under `Other shared roots` stating that additional roots may be discovered later remains true but is incomplete.

The corrected §7 interpretation is:

- `commercial_activations` is a known shared root with transitive locking;
- `capabilities` is a second known shared root with transitive locking;
- neither declaration is exhaustive;
- PAIM-C remains responsible for deriving further roots from the actual amendment set.

## 3. Correction PF-R1-02 — explicit RET-R17 ↔ RET-R19 compatibility coupling

### 3.1 Independence remains, but not unconstrained independence

`RET-R17` and `RET-R19` remain separate lifecycle-bearing unresolved findings because they answer different normative questions:

- `RET-R17` owns historical addressability of Offer Versions, CUSTOMER_CHARGING Grants, revocation/supersession history, customer/commercial evidence, and related authority history;
- `RET-R19` owns historical addressability of the complete Commercial Authority Lineage Reference.

They must not be merged into one primary finding or one closure owner.

However, while R17 and R19 remain co-resident on the shared `commercial_activations` physical surface, their retention designs are physically coupled.

### 3.2 Compatibility invariant

Any retention/archive/delete policy governing shared `commercial_activations` rows must satisfy the closure predicates of `RET-R17` and `RET-R19` simultaneously.

A candidate retention design is invalid for both nodes if satisfying one node's retention rule makes the other node's required historical addressability impossible on the same physical rows.

Therefore:

- `RET-R17` must explicitly cross-reference `RET-R19` while the shared root remains in use;
- `RET-R19` must explicitly cross-reference `RET-R17` while the shared root remains in use;
- each remains independently adjudicated;
- neither may receive PASS-compatible retention closure solely from a policy whose behavior on the shared rows has not been checked against the other node's closure predicate.

### 3.3 No six-node atomic retention policy is created

This correction is intentionally narrow.

No shared atomic retention node is created across all six unresolved retention findings.

The other four retention rows remain independently resolvable on current evidence:

- `RET-R9`;
- `RET-R10`;
- `RET-R18`;
- `RET-R20`.

The only currently proven cross-retention compatibility constraint is `RET-R17 ↔ RET-R19` through their shared physical root.

### 3.4 Shared-root replacement behavior

If remediation splits R17 and R19 into separate canonical physical histories, the compatibility edge must be re-evaluated rather than automatically retained forever.

The coupling is evidence-driven:

- while the same rows/policies physically govern both histories, simultaneous compatibility is mandatory;
- after a proven split, each node's retention policy may become independently implementable, but migration/legacy-history preservation must still prove that pre-split shared records remain addressable for both normative owners.

## 4. Corrected unresolved-row interpretation

The Phase-F reconciliation statement that the six retention items are `node-specific and independent` is refined to:

> The six retention findings remain node-specific and independently lifecycle-bearing. `RET-R17` and `RET-R19` additionally carry a shared-root compatibility constraint while their required histories are governed by the same `commercial_activations` physical rows/policies. This compatibility constraint does not merge the findings, alter the denominator, or create a seventh retention finding.

The statement `No one retention row blocks an unrelated node's closure` remains valid with one qualification:

> `RET-R17` and `RET-R19` are related for shared-root retention-policy compatibility, so neither may close on a policy for the shared rows that makes the other's normative addressability unsatisfiable.

## 5. Corrected physical-root baseline

Known Phase-F/shared-audit physical roots now seeded before PAIM are:

1. `commercial_activations`
   - R17 representation/cardinality/Grant evidence;
   - R19 lineage representation/cardinality;
   - activation-linked R15/R16 evidence paths;
   - dependent commercial-lineage F7 relationships;
   - `RET-R17 ↔ RET-R19` retention compatibility while co-resident.

2. `capabilities`
   - F06-01 capability authority history/cardinality;
   - F06-02 exact execution-binding attachment through capability authority;
   - R6 verification/provider/account evidence consumed by R18;
   - F07-01/F07-03/F07-04/F07-05/F07-06;
   - IC-G2-01 provider/account substitution evidence.

Both roots use reference-transitive `BLOCKED_PENDING_SHARED_ROOT_STABILITY` locking.

## 6. Reconciliation arithmetic after corrections

No primary finding is added, removed, merged, or reclassified.

- endpoint defects: 12;
- F7 defects: 17;
- total defects: 29;
- retention unresolved: 6;
- Boundary Registry unresolved: 1;
- total unresolved: 7;
- total Phase-F primaries: 36.

## 7. Post-review disposition

`PHASE-F FULL PRIMARY RECONCILIATION REVIEW CORRECTIONS ACCEPTED / 36 OF 36 PRIMARY DISPOSITIONS UNCHANGED / CAPABILITIES ADDED AS SECOND KNOWN REFERENCE-TRANSITIVE SHARED PHYSICAL ROOT / RET-R17 AND RET-R19 REMAIN DISTINCT BUT RECEIVE EXPLICIT SHARED-ROOT RETENTION-COMPATIBILITY EDGE / NO NEW FINDINGS / NO FINDING MERGES / PHASE-F RECONCILIATION READY FOR GLOBAL-REGISTER INTEGRATION SUBJECT TO THIS OVERLAY / IMPLEMENTATION AUTHORITY REMAINS SUSPENDED`
