# Phase C Edge Classification Coverage Index

**Status:** ACTIVE / MECHANICALLY BACKFILLED THROUGH C-21
**Frozen inventory authority:** `CROSS_REFERENCE_EDGE_INVENTORY.md`
**Inventory size:** 163 directed edges
**Classified through C-21:** 63
**Unclassified after C-21:** 100
**Implementation authority:** SUSPENDED

## Purpose

This file is the continuous reconciliation artifact for Phase C. It maps every edge in the frozen 163-edge inventory to exactly one classification location or to `UNCLASSIFIED`.

The governing reconciliation invariant is:

> `inventory edges = classified edges ∪ unclassified edges`, with the two sets disjoint, every classified edge mapped to exactly one committed batch section, and every batch edge present in the frozen inventory.

From C-22 forward, a candidate edge may enter a new batch only if this index currently marks it `UNCLASSIFIED`. After each committed batch, this file must be updated in the same commit or an immediately following reconciliation commit.

## Mechanical checks backfilled through C-21

- Frozen inventory count: **163**.
- Batch headers/declared scopes C-01 through C-21: **63 edge occurrences**.
- Unique classified edges: **63**.
- Duplicate classified edges: **0**.
- Classified edges absent from frozen inventory: **0**.
- Frozen inventory edges not yet classified: **100**.

## Edge index

| Edge | Coverage state | Batch file | Section |
|---|---|---|---|
| `R1 → R2` | `UNCLASSIFIED` | — | — |
| `R1 → R7` | `CLASSIFIED` | `PHASE_C_BATCH_08.md` | `C08-01` |
| `R1 → R8` | `CLASSIFIED` | `PHASE_C_BATCH_17.md` | `C17-01` |
| `R1 → R15` | `CLASSIFIED` | `PHASE_C_BATCH_15.md` | `C15-01` |
| `R1 → R16` | `UNCLASSIFIED` | — | — |
| `R2 → R1` | `UNCLASSIFIED` | — | — |
| `R2 → R4` | `UNCLASSIFIED` | — | — |
| `R2 → R6` | `UNCLASSIFIED` | — | — |
| `R2 → R7` | `CLASSIFIED` | `PHASE_C_BATCH_07.md` | `C07-01` |
| `R2 → R11` | `CLASSIFIED` | `PHASE_C_BATCH_17.md` | `C17-02` |
| `R2 → R18` | `CLASSIFIED` | `PHASE_C_BATCH_15.md` | `C15-02` |
| `R2 → R20` | `UNCLASSIFIED` | — | — |
| `R3 → R4` | `CLASSIFIED` | `PHASE_C_BATCH_12.md` | `C12-01` |
| `R3 → R5` | `CLASSIFIED` | `PHASE_C_BATCH_01.md` | `C01-03` |
| `R3 → R7` | `CLASSIFIED` | `PHASE_C_BATCH_16.md` | `C16-01` |
| `R3 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_05.md` | `C05-01` |
| `R4 → R2` | `UNCLASSIFIED` | — | — |
| `R4 → R3` | `UNCLASSIFIED` | — | — |
| `R4 → R5` | `UNCLASSIFIED` | — | — |
| `R4 → R6` | `CLASSIFIED` | `PHASE_C_BATCH_01.md` | `C01-01` |
| `R4 → R9` | `CLASSIFIED` | `PHASE_C_BATCH_06.md` | `C06-01` |
| `R4 → R10` | `CLASSIFIED` | `PHASE_C_BATCH_19.md` | `C19-03` |
| `R4 → R11` | `UNCLASSIFIED` | — | — |
| `R4 → R17` | `UNCLASSIFIED` | — | — |
| `R4 → R19` | `CLASSIFIED` | `PHASE_C_BATCH_11.md` | `C11-01` |
| `R4 → R20` | `UNCLASSIFIED` | — | — |
| `R5 → R3` | `UNCLASSIFIED` | — | — |
| `R5 → R4` | `UNCLASSIFIED` | — | — |
| `R5 → R6` | `CLASSIFIED` | `PHASE_C_BATCH_06.md` | `C06-02` |
| `R5 → R7` | `UNCLASSIFIED` | — | — |
| `R5 → R11` | `UNCLASSIFIED` | — | — |
| `R5 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_13.md` | `C13-01` |
| `R6 → R5` | `CLASSIFIED` | `PHASE_C_BATCH_16.md` | `C16-02` |
| `R6 → R7` | `CLASSIFIED` | `PHASE_C_BATCH_08.md` | `C08-02` |
| `R6 → R18` | `CLASSIFIED` | `PHASE_C_BATCH_02.md` | `C02-01` |
| `R6 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_14.md` | `C14-01` |
| `R7 → R1` | `UNCLASSIFIED` | — | — |
| `R7 → R2` | `UNCLASSIFIED` | — | — |
| `R7 → R3` | `UNCLASSIFIED` | — | — |
| `R7 → R4` | `UNCLASSIFIED` | — | — |
| `R7 → R5` | `UNCLASSIFIED` | — | — |
| `R7 → R6` | `UNCLASSIFIED` | — | — |
| `R7 → R8` | `CLASSIFIED` | `PHASE_C_BATCH_04.md` | `C04-01` |
| `R7 → R12` | `UNCLASSIFIED` | — | — |
| `R7 → R13` | `UNCLASSIFIED` | — | — |
| `R7 → R15` | `CLASSIFIED` | `PHASE_C_BATCH_09.md` | `C09-03` |
| `R7 → R16` | `CLASSIFIED` | `PHASE_C_BATCH_11.md` | `C11-02` |
| `R7 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_13.md` | `C13-02` |
| `R8 → R6` | `UNCLASSIFIED` | — | — |
| `R8 → R7` | `UNCLASSIFIED` | — | — |
| `R8 → R12` | `UNCLASSIFIED` | — | — |
| `R8 → R13` | `UNCLASSIFIED` | — | — |
| `R8 → R14` | `CLASSIFIED` | `PHASE_C_BATCH_02.md` | `C02-02` |
| `R8 → R15` | `CLASSIFIED` | `PHASE_C_BATCH_07.md` | `C07-02` |
| `R8 → R16` | `CLASSIFIED` | `PHASE_C_BATCH_19.md` | `C19-01` |
| `R8 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_11.md` | `C11-03` |
| `R9 → R4` | `UNCLASSIFIED` | — | — |
| `R9 → R7` | `UNCLASSIFIED` | — | — |
| `R9 → R8` | `UNCLASSIFIED` | — | — |
| `R9 → R10` | `CLASSIFIED` | `PHASE_C_BATCH_02.md` | `C02-03` |
| `R9 → R11` | `UNCLASSIFIED` | — | — |
| `R9 → R17` | `UNCLASSIFIED` | — | — |
| `R9 → R19` | `CLASSIFIED` | `PHASE_C_BATCH_12.md` | `C12-02` |
| `R9 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_18.md` | `C18-03` |
| `R10 → R4` | `UNCLASSIFIED` | — | — |
| `R10 → R7` | `UNCLASSIFIED` | — | — |
| `R10 → R8` | `UNCLASSIFIED` | — | — |
| `R10 → R9` | `UNCLASSIFIED` | — | — |
| `R10 → R11` | `CLASSIFIED` | `PHASE_C_BATCH_20.md` | `C20-03` |
| `R10 → R14` | `UNCLASSIFIED` | — | — |
| `R10 → R17` | `CLASSIFIED` | `PHASE_C_BATCH_07.md` | `C07-03` |
| `R10 → R19` | `CLASSIFIED` | `PHASE_C_BATCH_13.md` | `C13-03` |
| `R10 → R20` | `UNCLASSIFIED` | — | — |
| `R11 → R4` | `UNCLASSIFIED` | — | — |
| `R11 → R5` | `UNCLASSIFIED` | — | — |
| `R11 → R6` | `UNCLASSIFIED` | — | — |
| `R11 → R7` | `UNCLASSIFIED` | — | — |
| `R11 → R8` | `CLASSIFIED` | `PHASE_C_BATCH_21.md` | `C21-03` |
| `R11 → R9` | `UNCLASSIFIED` | — | — |
| `R11 → R10` | `UNCLASSIFIED` | — | — |
| `R11 → R12` | `CLASSIFIED` | `PHASE_C_BATCH_04.md` | `C04-02` |
| `R11 → R13` | `UNCLASSIFIED` | — | — |
| `R11 → R14` | `CLASSIFIED` | `PHASE_C_BATCH_09.md` | `C09-01` |
| `R11 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_10.md` | `C10-02` |
| `R12 → R3` | `UNCLASSIFIED` | — | — |
| `R12 → R4` | `UNCLASSIFIED` | — | — |
| `R12 → R5` | `UNCLASSIFIED` | — | — |
| `R12 → R6` | `UNCLASSIFIED` | — | — |
| `R12 → R7` | `UNCLASSIFIED` | — | — |
| `R12 → R8` | `UNCLASSIFIED` | — | — |
| `R12 → R11` | `UNCLASSIFIED` | — | — |
| `R12 → R13` | `CLASSIFIED` | `PHASE_C_BATCH_06.md` | `C06-03` |
| `R12 → R14` | `UNCLASSIFIED` | — | — |
| `R12 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_18.md` | `C18-02` |
| `R13 → R7` | `UNCLASSIFIED` | — | — |
| `R13 → R8` | `UNCLASSIFIED` | — | — |
| `R13 → R11` | `CLASSIFIED` | `PHASE_C_BATCH_01.md` | `C01-02` |
| `R13 → R12` | `UNCLASSIFIED` | — | — |
| `R13 → R14` | `UNCLASSIFIED` | — | — |
| `R13 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_20.md` | `C20-02` |
| `R14 → R7` | `UNCLASSIFIED` | — | — |
| `R14 → R8` | `UNCLASSIFIED` | — | — |
| `R14 → R10` | `CLASSIFIED` | `PHASE_C_BATCH_05.md` | `C05-02` |
| `R14 → R11` | `UNCLASSIFIED` | — | — |
| `R14 → R12` | `UNCLASSIFIED` | — | — |
| `R14 → R13` | `CLASSIFIED` | `PHASE_C_BATCH_19.md` | `C19-02` |
| `R14 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_15.md` | `C15-03` |
| `R15 → R7` | `UNCLASSIFIED` | — | — |
| `R15 → R8` | `UNCLASSIFIED` | — | — |
| `R15 → R11` | `CLASSIFIED` | `PHASE_C_BATCH_16.md` | `C16-03` |
| `R15 → R16` | `CLASSIFIED` | `PHASE_C_BATCH_03.md` | `C03-01` |
| `R15 → R19` | `CLASSIFIED` | `PHASE_C_BATCH_10.md` | `C10-03` |
| `R15 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_17.md` | `C17-03` |
| `R16 → R7` | `UNCLASSIFIED` | — | — |
| `R16 → R8` | `UNCLASSIFIED` | — | — |
| `R16 → R11` | `CLASSIFIED` | `PHASE_C_BATCH_18.md` | `C18-01` |
| `R16 → R15` | `UNCLASSIFIED` | — | — |
| `R16 → R19` | `UNCLASSIFIED` | — | — |
| `R16 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_12.md` | `C12-03` |
| `R17 → R4` | `UNCLASSIFIED` | — | — |
| `R17 → R5` | `UNCLASSIFIED` | — | — |
| `R17 → R7` | `UNCLASSIFIED` | — | — |
| `R17 → R8` | `UNCLASSIFIED` | — | — |
| `R17 → R9` | `UNCLASSIFIED` | — | — |
| `R17 → R10` | `UNCLASSIFIED` | — | — |
| `R17 → R15` | `UNCLASSIFIED` | — | — |
| `R17 → R16` | `CLASSIFIED` | `PHASE_C_BATCH_20.md` | `C20-01` |
| `R17 → R18` | `CLASSIFIED` | `PHASE_C_BATCH_09.md` | `C09-02` |
| `R17 → R19` | `CLASSIFIED` | `PHASE_C_BATCH_03.md` | `C03-02` |
| `R17 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_14.md` | `C14-02` |
| `R18 → R5` | `UNCLASSIFIED` | — | — |
| `R18 → R6` | `UNCLASSIFIED` | — | — |
| `R18 → R7` | `UNCLASSIFIED` | — | — |
| `R18 → R8` | `UNCLASSIFIED` | — | — |
| `R18 → R11` | `UNCLASSIFIED` | — | — |
| `R18 → R14` | `CLASSIFIED` | `PHASE_C_BATCH_10.md` | `C10-01` |
| `R18 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_04.md` | `C04-03` |
| `R19 → R4` | `UNCLASSIFIED` | — | — |
| `R19 → R7` | `UNCLASSIFIED` | — | — |
| `R19 → R8` | `UNCLASSIFIED` | — | — |
| `R19 → R9` | `UNCLASSIFIED` | — | — |
| `R19 → R10` | `UNCLASSIFIED` | — | — |
| `R19 → R11` | `UNCLASSIFIED` | — | — |
| `R19 → R14` | `CLASSIFIED` | `PHASE_C_BATCH_14.md` | `C14-03` |
| `R19 → R15` | `UNCLASSIFIED` | — | — |
| `R19 → R16` | `CLASSIFIED` | `PHASE_C_BATCH_05.md` | `C05-03` |
| `R19 → R17` | `CLASSIFIED` | `PHASE_C_BATCH_21.md` | `C21-02` |
| `R19 → R18` | `UNCLASSIFIED` | — | — |
| `R19 → R20` | `CLASSIFIED` | `PHASE_C_BATCH_08.md` | `C08-03` |
| `R20 → R3` | `UNCLASSIFIED` | — | — |
| `R20 → R4` | `UNCLASSIFIED` | — | — |
| `R20 → R6` | `UNCLASSIFIED` | — | — |
| `R20 → R7` | `UNCLASSIFIED` | — | — |
| `R20 → R8` | `UNCLASSIFIED` | — | — |
| `R20 → R9` | `UNCLASSIFIED` | — | — |
| `R20 → R10` | `UNCLASSIFIED` | — | — |
| `R20 → R11` | `UNCLASSIFIED` | — | — |
| `R20 → R14` | `UNCLASSIFIED` | — | — |
| `R20 → R15` | `UNCLASSIFIED` | — | — |
| `R20 → R16` | `UNCLASSIFIED` | — | — |
| `R20 → R17` | `CLASSIFIED` | `PHASE_C_BATCH_03.md` | `C03-03` |
| `R20 → R18` | `CLASSIFIED` | `PHASE_C_BATCH_21.md` | `C21-01` |
| `R20 → R19` | `UNCLASSIFIED` | — | — |

## Maintenance rule

For every future committed batch:

1. verify each proposed edge is `UNCLASSIFIED` here before adjudication;
2. verify both endpoint blob SHAs against the frozen inventory;
3. after commit, replace each edge's `UNCLASSIFIED` row with the exact batch file and section;
4. recompute the six mechanical counts above;
5. fail reconciliation if an edge is duplicated, missing from inventory, mapped twice, or counted without a committed section.

## Phase C terminal reconciliation condition

Phase C edgewise coverage cannot close until this index reaches:

- 163 frozen inventory edges;
- 163 unique classified edges;
- 0 unclassified edges;
- 0 duplicate classifications;
- 0 batch edges absent from inventory;
- every classification mapped to one committed batch section.