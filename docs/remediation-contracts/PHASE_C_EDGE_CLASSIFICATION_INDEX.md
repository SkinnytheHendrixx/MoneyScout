# Phase C Edge Classification Coverage Index

**Status:** ACTIVE / MECHANICALLY RECONCILED THROUGH C-22  
**Frozen inventory authority:** `CROSS_REFERENCE_EDGE_INVENTORY.md`  
**Inventory size:** 163 directed edges  
**Classified through C-22:** 66  
**Unclassified after C-22:** 97  
**Implementation authority:** SUSPENDED

## Purpose

This file is the continuous reconciliation artifact for Phase C. It maps every frozen edge to either a committed classification section or `U` (`UNCLASSIFIED`).

The governing invariant is:

> `inventory edges = classified edges ∪ unclassified edges`, with the two sets disjoint, every classified edge mapped exactly once, and every batch edge present in the frozen inventory.

From C-22 forward, a candidate edge may enter a new batch only if this index marks it `U`. After each committed batch, update this file in the same commit or an immediately following reconciliation commit.

## Mechanical checks through C-22

- Frozen inventory count: **163**.
- Batch edge occurrences C-01 through C-22: **66**.
- Unique classified edges: **66**.
- Duplicate classified edges: **0**.
- Classified edges absent from frozen inventory: **0**.
- Frozen inventory edges not yet classified: **97**.

## Compact edge map

Legend:

- `U` = `UNCLASSIFIED`.
- `Cxx-yy` = classified in section `Cxx-yy` of `PHASE_C_BATCH_xx.md`.
- Every target listed below is an edge in the frozen inventory. No omitted target exists for that declaring node.

| Declaring node | Frozen target map |
|---|---|
| `R1` | `R2=U`; `R7=C08-01`; `R8=C17-01`; `R15=C15-01`; `R16=U` |
| `R2` | `R1=U`; `R4=U`; `R6=U`; `R7=C07-01`; `R11=C17-02`; `R18=C15-02`; `R20=U` |
| `R3` | `R4=C12-01`; `R5=C01-03`; `R7=C16-01`; `R20=C05-01` |
| `R4` | `R2=U`; `R3=U`; `R5=U`; `R6=C01-01`; `R9=C06-01`; `R10=C19-03`; `R11=U`; `R17=C22-01`; `R19=C11-01`; `R20=U` |
| `R5` | `R3=U`; `R4=U`; `R6=C06-02`; `R7=U`; `R11=U`; `R20=C13-01` |
| `R6` | `R5=C16-02`; `R7=C08-02`; `R18=C02-01`; `R20=C14-01` |
| `R7` | `R1=U`; `R2=U`; `R3=U`; `R4=U`; `R5=U`; `R6=U`; `R8=C04-01`; `R12=U`; `R13=U`; `R15=C09-03`; `R16=C11-02`; `R20=C13-02` |
| `R8` | `R6=U`; `R7=U`; `R12=C22-03`; `R13=U`; `R14=C02-02`; `R15=C07-02`; `R16=C19-01`; `R20=C11-03` |
| `R9` | `R4=U`; `R7=U`; `R8=U`; `R10=C02-03`; `R11=U`; `R17=U`; `R19=C12-02`; `R20=C18-03` |
| `R10` | `R4=U`; `R7=U`; `R8=U`; `R9=U`; `R11=C20-03`; `R14=U`; `R17=C07-03`; `R19=C13-03`; `R20=C22-02` |
| `R11` | `R4=U`; `R5=U`; `R6=U`; `R7=U`; `R8=C21-03`; `R9=U`; `R10=U`; `R12=C04-02`; `R13=U`; `R14=C09-01`; `R20=C10-02` |
| `R12` | `R3=U`; `R4=U`; `R5=U`; `R6=U`; `R7=U`; `R8=U`; `R11=U`; `R13=C06-03`; `R14=U`; `R20=C18-02` |
| `R13` | `R7=U`; `R8=U`; `R11=C01-02`; `R12=U`; `R14=U`; `R20=C20-02` |
| `R14` | `R7=U`; `R8=U`; `R10=C05-02`; `R11=U`; `R12=U`; `R13=C19-02`; `R20=C15-03` |
| `R15` | `R7=U`; `R8=U`; `R11=C16-03`; `R16=C03-01`; `R19=C10-03`; `R20=C17-03` |
| `R16` | `R7=U`; `R8=U`; `R11=C18-01`; `R15=U`; `R19=U`; `R20=C12-03` |
| `R17` | `R4=U`; `R5=U`; `R7=U`; `R8=U`; `R9=U`; `R10=U`; `R15=U`; `R16=C20-01`; `R18=C09-02`; `R19=C03-02`; `R20=C14-02` |
| `R18` | `R5=U`; `R6=U`; `R7=U`; `R8=U`; `R11=U`; `R14=C10-01`; `R20=C04-03` |
| `R19` | `R4=U`; `R7=U`; `R8=U`; `R9=U`; `R10=U`; `R11=U`; `R14=C14-03`; `R15=U`; `R16=C05-03`; `R17=C21-02`; `R18=U`; `R20=C08-03` |
| `R20` | `R3=U`; `R4=U`; `R6=U`; `R7=U`; `R8=U`; `R9=U`; `R10=U`; `R11=U`; `R14=U`; `R15=U`; `R16=U`; `R17=C03-03`; `R18=C21-01`; `R19=U` |

## C-22 additions

- `R4 → R17` → `C22-01` / `PHASE_C_BATCH_22.md`.
- `R10 → R20` → `C22-02` / `PHASE_C_BATCH_22.md`.
- `R8 → R12` → `C22-03` / `PHASE_C_BATCH_22.md`.

## Maintenance rule

For every future committed batch:

1. verify each proposed edge is `U` here before adjudication;
2. verify both endpoint blob SHAs against the frozen inventory;
3. after commit, replace each selected `U` with the exact `Cxx-yy` section code;
4. recompute the six mechanical counts above;
5. fail reconciliation if an edge is duplicated, missing from inventory, mapped twice, or counted without a committed section.

## Phase C terminal reconciliation condition

Phase C edgewise coverage cannot close until this index reaches:

- 163 frozen inventory edges;
- 163 unique classified edges;
- 0 unclassified edges;
- 0 duplicate classifications;
- 0 batch edges absent from inventory;
- every classified edge mapped to one committed batch section.