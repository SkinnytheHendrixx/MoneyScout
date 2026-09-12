# Phase C Edge Classification Coverage Index

**Status:** ACTIVE / MECHANICALLY RECONCILED AND POINTER-AUDITED THROUGH C-29  
**Frozen inventory authority:** `CROSS_REFERENCE_EDGE_INVENTORY.md`  
**Inventory size:** 163 directed edges  
**Classified through C-29:** 87  
**Unclassified after C-29:** 76  
**Implementation authority:** SUSPENDED

## Purpose

This file is the continuous reconciliation artifact for Phase C. It maps every frozen edge to either a committed classification section or `U` (`UNCLASSIFIED`).

The governing invariants are:

> `inventory edges = classified edges ∪ unclassified edges`, with the two sets disjoint, every classified edge mapped exactly once, and every batch edge present in the frozen inventory.

and independently:

> **Every `Cxx-yy` pointer must resolve to a committed section whose heading classifies that exact declaring-node → target-node edge. Coverage correctness does not imply pointer correctness.**

From C-22 forward, a candidate edge may enter a new batch only if this index marks it `U`. After each committed batch, update this file in the same commit or an immediately following reconciliation commit.

## Mechanical checks through C-29

- Frozen inventory count: **163**.
- Batch edge occurrences C-01 through C-29: **87**.
- Unique classified edges: **87**.
- Duplicate classified edges: **0**.
- Classified edges absent from frozen inventory: **0**.
- Frozen inventory edges not yet classified: **76**.
- Section-pointer accuracy: **87 / 87 verified**.
- Section pointers resolving to the wrong edge: **0**.

### Full pointer audit through C-29

The original compact-map audit checked every classified pointer through C-22 against the actual committed section heading in `PHASE_C_BATCH_01.md` through `PHASE_C_BATCH_22.md`.

Batch C-23 was reconciled under the same rule:

- `C23-01 = R20 → R19`;
- `C23-02 = R9 → R17`;
- `C23-03 = R12 → R14`.

Batch C-24 was then resolved directly against the committed batch file:

- `C24-01 = R20 → R4`;
- `C24-02 = R17 → R5`;
- `C24-03 = R7 → R12`.

Batch C-25 was then resolved directly against the committed batch file:

- `C25-01 = R20 → R9`;
- `C25-02 = R18 → R11`;
- `C25-03 = R16 → R15`.

Batch C-26 was then resolved directly against the committed batch file:

- `C26-01 = R4 → R20`;
- `C26-02 = R19 → R18`;
- `C26-03 = R13 → R12`.

Batch C-27 was then resolved directly against the committed batch file:

- `C27-01 = R20 → R10`;
- `C27-02 = R11 → R5`;
- `C27-03 = R14 → R12`.

Batch C-28 was then resolved directly against the committed batch file:

- `C28-01 = R20 → R11`;
- `C28-02 = R16 → R19`;
- `C28-03 = R9 → R11`.

Batch C-29 was then resolved directly against the committed batch file:

- `C29-01 = R19 → R11`;
- `C29-02 = R14 → R11`;
- `C29-03 = R17 → R15`.

Cumulative result:

- **87 classified pointers checked**;
- **87 pointers resolve to the exact indexed edge**;
- **0 wrong-section pointers**;
- **0 missing committed sections**.

A reported concern after C-22 that Batch C-20's `C20-01` and `C20-03` pointers were swapped was checked directly against the committed batch. The committed source is:

- `C20-01 = R17 → R16`;
- `C20-02 = R13 → R20`;
- `C20-03 = R10 → R11`.

Therefore the compact index's C20 mappings were already correct. The discrepancy came from a secondary record of the C20 ordering rather than the committed batch or the index. This episode is the reason pointer accuracy is now a separate mechanical invariant instead of being inferred from coverage counts.

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
| `R4` | `R2=U`; `R3=U`; `R5=U`; `R6=C01-01`; `R9=C06-01`; `R10=C19-03`; `R11=U`; `R17=C22-01`; `R19=C11-01`; `R20=C26-01` |
| `R5` | `R3=U`; `R4=U`; `R6=C06-02`; `R7=U`; `R11=U`; `R20=C13-01` |
| `R6` | `R5=C16-02`; `R7=C08-02`; `R18=C02-01`; `R20=C14-01` |
| `R7` | `R1=U`; `R2=U`; `R3=U`; `R4=U`; `R5=U`; `R6=U`; `R8=C04-01`; `R12=C24-03`; `R13=U`; `R15=C09-03`; `R16=C11-02`; `R20=C13-02` |
| `R8` | `R6=U`; `R7=U`; `R12=C22-03`; `R13=U`; `R14=C02-02`; `R15=C07-02`; `R16=C19-01`; `R20=C11-03` |
| `R9` | `R4=U`; `R7=U`; `R8=U`; `R10=C02-03`; `R11=C28-03`; `R17=C23-02`; `R19=C12-02`; `R20=C18-03` |
| `R10` | `R4=U`; `R7=U`; `R8=U`; `R9=U`; `R11=C20-03`; `R14=U`; `R17=C07-03`; `R19=C13-03`; `R20=C22-02` |
| `R11` | `R4=U`; `R5=C27-02`; `R6=U`; `R7=U`; `R8=C21-03`; `R9=U`; `R10=U`; `R12=C04-02`; `R13=U`; `R14=C09-01`; `R20=C10-02` |
| `R12` | `R3=U`; `R4=U`; `R5=U`; `R6=U`; `R7=U`; `R8=U`; `R11=U`; `R13=C06-03`; `R14=C23-03`; `R20=C18-02` |
| `R13` | `R7=U`; `R8=U`; `R11=C01-02`; `R12=C26-03`; `R14=U`; `R20=C20-02` |
| `R14` | `R7=U`; `R8=U`; `R10=C05-02`; `R11=C29-02`; `R12=C27-03`; `R13=C19-02`; `R20=C15-03` |
| `R15` | `R7=U`; `R8=U`; `R11=C16-03`; `R16=C03-01`; `R19=C10-03`; `R20=C17-03` |
| `R16` | `R7=U`; `R8=U`; `R11=C18-01`; `R15=C25-03`; `R19=C28-02`; `R20=C12-03` |
| `R17` | `R4=U`; `R5=C24-02`; `R7=U`; `R8=U`; `R9=U`; `R10=U`; `R15=C29-03`; `R16=C20-01`; `R18=C09-02`; `R19=C03-02`; `R20=C14-02` |
| `R18` | `R5=U`; `R6=U`; `R7=U`; `R8=U`; `R11=C25-02`; `R14=C10-01`; `R20=C04-03` |
| `R19` | `R4=U`; `R7=U`; `R8=U`; `R9=U`; `R10=U`; `R11=C29-01`; `R14=C14-03`; `R15=U`; `R16=C05-03`; `R17=C21-02`; `R18=C26-02`; `R20=C08-03` |
| `R20` | `R3=U`; `R4=C24-01`; `R6=U`; `R7=U`; `R8=U`; `R9=C25-01`; `R10=C27-01`; `R11=C28-01`; `R14=U`; `R15=U`; `R16=U`; `R17=C03-03`; `R18=C21-01`; `R19=C23-01` |

## C-22 additions

- `R4 → R17` → `C22-01` / `PHASE_C_BATCH_22.md`.
- `R10 → R20` → `C22-02` / `PHASE_C_BATCH_22.md`.
- `R8 → R12` → `C22-03` / `PHASE_C_BATCH_22.md`.

## C-23 additions

- `R20 → R19` → `C23-01` / `PHASE_C_BATCH_23.md`.
- `R9 → R17` → `C23-02` / `PHASE_C_BATCH_23.md`.
- `R12 → R14` → `C23-03` / `PHASE_C_BATCH_23.md`.

## C-24 additions

- `R20 → R4` → `C24-01` / `PHASE_C_BATCH_24.md`.
- `R17 → R5` → `C24-02` / `PHASE_C_BATCH_24.md`.
- `R7 → R12` → `C24-03` / `PHASE_C_BATCH_24.md`.

## C-25 additions

- `R20 → R9` → `C25-01` / `PHASE_C_BATCH_25.md`.
- `R18 → R11` → `C25-02` / `PHASE_C_BATCH_25.md`.
- `R16 → R15` → `C25-03` / `PHASE_C_BATCH_25.md`.

## C-26 additions

- `R4 → R20` → `C26-01` / `PHASE_C_BATCH_26.md`.
- `R19 → R18` → `C26-02` / `PHASE_C_BATCH_26.md`.
- `R13 → R12` → `C26-03` / `PHASE_C_BATCH_26.md`.

## C-27 additions

- `R20 → R10` → `C27-01` / `PHASE_C_BATCH_27.md`.
- `R11 → R5` → `C27-02` / `PHASE_C_BATCH_27.md`.
- `R14 → R12` → `C27-03` / `PHASE_C_BATCH_27.md`.

## C-28 additions

- `R20 → R11` → `C28-01` / `PHASE_C_BATCH_28.md`.
- `R16 → R19` → `C28-02` / `PHASE_C_BATCH_28.md`.
- `R9 → R11` → `C28-03` / `PHASE_C_BATCH_28.md`.

## C-29 additions

- `R19 → R11` → `C29-01` / `PHASE_C_BATCH_29.md`.
- `R14 → R11` → `C29-02` / `PHASE_C_BATCH_29.md`.
- `R17 → R15` → `C29-03` / `PHASE_C_BATCH_29.md`.

## Maintenance rule

For every future committed batch:

1. verify each proposed edge is `U` here before adjudication;
2. verify both endpoint blob SHAs against the frozen inventory;
3. after commit, replace each selected `U` with the exact `Cxx-yy` section code;
4. recompute the coverage counts above;
5. **resolve every newly added `Cxx-yy` pointer back to the named committed batch section and verify that section heading classifies the exact same declaring-node → target-node pair;**
6. fail reconciliation if an edge is duplicated, missing from inventory, mapped twice, counted without a committed section, or points to a committed section for a different edge.

The section-pointer check is logically independent from the count checks. A mapping can preserve 163/87/76 arithmetic while still sending a reviewer to the wrong adjudication text; that state is now a reconciliation failure.

## Phase C terminal reconciliation condition

Phase C edgewise coverage cannot close until this index reaches:

- 163 frozen inventory edges;
- 163 unique classified edges;
- 0 unclassified edges;
- 0 duplicate classifications;
- 0 batch edges absent from inventory;
- every classified edge mapped to one committed batch section;
- **163 / 163 section pointers independently verified to resolve to the exact edge named by the index.**