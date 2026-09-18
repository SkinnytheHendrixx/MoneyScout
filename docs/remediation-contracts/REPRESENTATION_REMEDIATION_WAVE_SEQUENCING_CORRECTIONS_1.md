# Representation Remediation — Wave Sequencing Corrections 1

**Status:** REVIEW CORRECTION OVERLAY / CONTROLS OVER SEQUENCING CANDIDATE WHERE NARROWER  
**Base candidate:** `REPRESENTATION_REMEDIATION_WAVE_SEQUENCING_CANDIDATE.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This correction upgrades the sequencing rationale for F06-02 from a risk-reduction preference to a hard representation dependency for the later ROOT-1 redesign.

It does not change the proposed wave order.

## 2. RR-WSEQ-R1-01 — F06-02 precedence is a hard design dependency

The original candidate correctly selected F06-02 as Wave R1 but described one reason as reducing the risk that ROOT-1 would invent an ambiguous binding shape.

That is too weak.

Both landed semantic amendments now require downstream ROOT-1 objects to reference exact R18 binding identity:

- the R17 Grant-side composition ultimately needs the exact R18 binding reference required by Amendment A;
- the R19 Lineage Reference must bind the exact materially-consumed R18 binding or exact required binding set under Amendment B.

Those ROOT-1 representations cannot be finalized correctly without a stable representation-level definition of what an exact R18 binding reference is.

That reference target does not yet exist in current implementation representation.

Defining it is part of F06-02.

Therefore:

`F06-02 = REPRESENTATION_PREREQUISITE_FOR_ROOT1_DESIGN`

This is a hard design dependency, not merely a sequencing preference.

## 3. Corrected Wave-R1 rationale

Wave R1 remains F06-02 first because:

1. it participates in both Package-01 lifecycle closure paths;
2. it blocks multiple additional F07 relationships;
3. its current domain is more contained than ROOT-1's shared commercial-history surface;
4. its semantic contract is stable after Amendments A+B;
5. most importantly, ROOT-1 Grant and Lineage representation must point to the exact R18 binding identity/set model that F06-02 defines.

ROOT-1 design may research current state in parallel, but it must not freeze its own exact binding-reference fields or representation contract before the F06-02 reference model is stable/current.

## 4. ROOT-1 coordinated-program finding

The original candidate's ROOT-1 co-design conclusion remains unchanged and is strengthened by direct schema behavior already established in Phase F:

- Asset-level uniqueness/reuse can collapse legitimate arbitrary-N R19 histories;
- adding Grant-specific fields without fixing cardinality would leave F01-01 unresolved;
- fixing cardinality alone without defining an immutable Grant object would leave F05-03 unresolved;
- a single physical redesign must therefore account for both authority objects at once.

Frozen discipline remains:

`CO_DESIGN_PHYSICALLY = YES`

`CLOSE_FINDINGS_INDEPENDENTLY = YES`

## 5. Disposition

`WAVE_ORDER_CHANGED = NO`

`F06-02_FIRST = CONFIRMED`

`F06-02_PRECEDENCE_CLASS = HARD_REPRESENTATION_PREREQUISITE`

`ROOT1_COORDINATED_PHYSICAL_REDESIGN = CONFIRMED`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`
