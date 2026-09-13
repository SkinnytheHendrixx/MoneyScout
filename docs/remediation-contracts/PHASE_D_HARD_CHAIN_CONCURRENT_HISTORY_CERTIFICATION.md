# Phase D Hard-Chain Concurrent-History Certification

**Status:** FINAL / REVIEWED / ADJUDICATED / PHASE D CLOSED
**Implementation authority:** SUSPENDED

The canonical Phase-C hard-chain certification proves the single-path lineage requirements for `R4 → R9 → R10 → R17 → R19 → R20`.

This Phase-D supplement closes the remaining specification-level coexistence requirement. Two distinct valid chains may coexist under the same higher-level scope without either becoming the authority source for the other.

Canonical control:

`A1 → S1 → P1 → O1/G1 → L1 → D1`

`A2 → S2 → P2 → O2/G2 → L2 → D2`

The governing invariants are:

- each chain preserves its own exact historical identities;
- current chain-2 state does not rewrite chain-1 history;
- same-parent membership does not make the chains interchangeable;
- R20 decision semantics do not require `D1` and `D2` to be treated as one decision merely because they concern the same Asset or boundary class; this is a contract-semantics statement, not a storage-capacity claim;
- chain 2 must derive its frozen fields from chain-2 governing facts rather than inheriting authority from chain 1 merely because it is a renewal, successor, migration, or later path.

The deliberate test set is:

- D-C1 current-pointer overwrite;
- D-C2 same-parent deduplication;
- D-C3 decision-model collision;
- D-C4 mixed-chain reconstruction;
- D-C5 legitimate coexistence mistaken for conflict;
- D-C6 creation-time inheritance contamination.

D-C6 requires that chain 2 not use the prior lineage as the source of a frozen authority field merely for convenience. A predecessor/successor relationship may be recorded as relationship metadata but is not itself authority for chain-2 constituent identity.

The existing four `MISSING_REQUIRED_COMPOSITION` findings and C21-03 remain open and continue to constrain wider E2E scenarios; none blocks this narrow coexistence certification.

Phase D certifies specification semantics only. Phase F remains responsible for actual schema/storage/cardinality, decision-storage concurrency, and arbitrary-N representability.

**PHASE D: CLOSED.**

Phase C remains closed. Phase F remains open. Implementation authority remains SUSPENDED. The next governing audit stage is **Phase E — Compound Certification**.