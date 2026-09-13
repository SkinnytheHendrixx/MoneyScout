# Phase D Hard-Chain Certification — Concurrent-History Closure Supplement

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Governing protocol:** `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md` §7 and §9  
**Implementation authority:** SUSPENDED

## 1. Why this supplement exists

The canonical Phase-C closing synthesis already performs the worked hard-chain proof for:

`R4 → R9 → R10 → R17 → R19 → R20`

and proves exact historical identity, no current-state substitution, transitive direct/mediated equality, historical/current separation, and the D/X attack family.

The governing Phase-D requirement also says the hard-chain certification must prove that **concurrent historical authorities remain representable**.

The final Phase-C synthesis deliberately did **not** claim arbitrary-N schema/concurrency certification. It explicitly preserved that work for Phase F, which owns the cross-node representability and multiplicity sweep.

This supplement resolves the overlap without reopening Phase C and without stealing Phase F's job:

- **Phase D requirement:** specification-level coexistence of multiple distinct valid hard-chain histories must remain semantically representable and non-substitutable.
- **Phase F requirement:** actual schema/storage/key/cardinality representation must support arbitrary-N historical/in-flight authorities without collision, overwrite, or one-current-row assumptions.

Phase D therefore needs a worked coexistence fixture; Phase F later proves the implementation/schema can realize it.

## 2. Canonical two-chain coexistence fixture

Construct two independently valid authority paths under one higher-level Asset/Product scope where policy permits:

### Chain 1

`A1 → S1 → P1 → O1/G1 → L1 → D1`

- R4 Cycle `A1` is the originating evaluation lineage.
- R9 freezes exact source `S1` under A1.
- R10 creates exact artifact/release `P1` from S1.
- R17 freezes exact Offer/Grant `O1/G1` for P1.
- R19 freezes exact Commercial Authority Lineage Reference `L1`.
- R20 records exact boundary decision `D1` for L1.

### Chain 2

`A2 → S2 → P2 → O2/G2 → L2 → D2`

- `A2`, `S2`, `P2`, `O2/G2`, `L2`, and `D2` form a second independently valid path.
- The two chains may share an Opportunity/Product/Asset parent but remain historically distinct.

## 3. Required invariants

The specification passes this Phase-D coexistence fixture only if all of the following are true:

1. `L1 ≠ L2` as immutable historical authority identities.
2. `D1` remains bound to exact `L1`; `D2` remains bound to exact `L2`.
3. making O2/G2 current does not rewrite O1/G1 inside L1.
4. making A2 current does not rewrite A1 inside L1.
5. P2/S2 cannot satisfy any direct or mediated equality requirement belonging to L1.
6. a current convenience pointer may point to chain 2 without deleting, mutating, or becoming historical authority for chain 1.
7. historical support, reconciliation, renewal, remediation, or audit work targeting L1 can select L1 explicitly even while L2 is current.
8. R20 may independently deny D1/current reuse while allowing D2, or vice versa, without merging their histories.
9. post-hoc validity of L2 cannot retroactively repair a defect in L1.
10. same-parent membership never makes L1/L2 interchangeable.
11. the consolidated transitive-equality rules from the final Phase-C hard-chain certification apply independently inside each chain.
12. cross-chain equality is **not** required: the requirement is exact identity within each path plus coexistence without substitution.

## 4. Deliberate concurrency attacks

### D-C1 — current-pointer overwrite

O2/L2 becomes current. A historical lookup for chain 1 resolves through the current pointer and returns O2/L2.

**Expected:** FAIL.

### D-C2 — same-parent deduplication

Storage or logic treats L1 and L2 as duplicates because they share one Asset/Product/Opportunity.

**Expected:** FAIL.

### D-C3 — boundary-decision collision

D2 overwrites or is reused as D1 because both decisions belong to the same Asset or boundary class.

**Expected:** FAIL.

### D-C4 — mixed-chain reconstruction

A reconstructed chain combines A1/S1 with P2/O2/L2 because the latter are current and valid.

**Expected:** FAIL under the same transitive/path-consistency rules already certified for one chain.

### D-C5 — legitimate coexistence mistaken for mismatch

Both L1 and L2 are valid histories, but validation rejects one solely because another current valid lineage exists.

**Expected:** FAIL. Historical multiplicity is legitimate; non-substitution does not mean only one historical path may exist.

## 5. Governing evidence

This specification-level fixture consumes already-confirmed requirements rather than inventing a new multiplicity model:

- R19 M14 / N-concurrent-history requirement: multiple distinct commercial lineages for one Asset are legitimate historical authority, not duplicate state.
- R19 Commercial Authority Lineage Reference: each lineage is independently addressable by its own immutable reference/fingerprint.
- R20 A0 concurrent-multiplicity requirement: distinct authority lineages/boundary decisions must remain separately referenceable rather than collapsing into one current authority.
- final Phase-C hard-chain certification: direct/mediated equality and no-current-substitution rules apply inside each individual path.

## 6. Exact Phase-D / Phase-F boundary

A PASS here means only:

> **The recovered specification requires and semantically supports at least two simultaneously valid, independently addressable hard-chain histories without permitting identity substitution between them.**

It does **not** prove:

- the current database schema actually supports two, N, or arbitrary-N rows without collision;
- uniqueness constraints are correct;
- every current-pointer field is non-authoritative in implementation;
- Boundary Registry/decision storage supports concurrent in-flight decisions;
- all relevant tables/indexes/foreign keys preserve arbitrary-N history.

Those are Phase-F representability questions and remain fully open until Phase F.

Accordingly, this supplement must never be cited as proof that R19 M14, R20 A0, or the global multiplicity sweep has been implemented or passed.

## 7. Proposed Phase-D disposition

If adversarial review confirms the fixture and boundary above:

- the existing canonical final hard-chain certification plus this supplement satisfies the governing Phase-D hard-chain specification requirement;
- Phase D closes at the **specification/certification** level;
- Phase F remains independently required for actual schema/arbitrary-N representability;
- Phase C remains closed and is not reopened;
- no node SHA or edge classification is changed;
- implementation authority remains SUSPENDED.

## 8. Requested adversarial review

Please challenge four things specifically:

1. Does this two-chain fixture genuinely satisfy Phase D's phrase "concurrent historical authorities remain representable" at the specification level, or does the governing wording require actual schema proof before Phase D can close?
2. Is the Phase-D/Phase-F boundary drawn honestly, or does the supplement accidentally claim part of the Phase-F arbitrary-N/schema result?
3. Do D-C1 through D-C5 cover the material difference between legitimate coexistence and wrong-path substitution, or is a distinct hard-chain concurrency failure mode missing?
4. Does any existing Phase-C MRC or unresolved gap prevent the **lineage-identity coexistence** fixture itself from passing, as opposed to constraining a wider capability-bound/handoff/R5-dependent E2E scenario?

Do not accept Phase D as closed merely because the single-chain synthesis passed. The question here is specifically whether multiple valid historical chains can coexist semantically without one becoming authority for the other.