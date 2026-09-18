# Representation Package 02A — WATCH Direct Verification / Boundary Registry Corrections 1

**Status:** DIRECT VERIFICATION COMPLETE / C1 CONFIRMED / C2 REMAINS UNRESOLVED FOR GOVERNANCE-REPRESENTATION REASON  
**Base trace:** `PACKAGE_02A_WATCH_REVALIDATION_M4_TRACE_ADJUDICATION.md`  
**Implementation authority:** SUSPENDED

## 1. Purpose

This correction directly verifies the current WATCH implementation claims and resolves why WATCH reactivation cannot presently be frozen as either C2 or NOT_C2.

## 2. Direct implementation verification

Current file:

`artifacts/api-server/src/lib/portfolio-reconciler.ts`

Blob:

`745a7d48bb7f0bd0c3402b58eacaf9d3579f381a`

### 2.1 Local WATCH comparison

`materialDiscoveryDelta(...)`:

- reads the stored Watch baseline;
- reads the already-persisted current Discovery candidate;
- compares latest snapshot ID;
- compares occurrence count;
- requires Discovery's persisted `MATERIAL_SNAPSHOT_CHANGE` classification;
- returns local trigger evidence.

No external provider/API/model/search/telemetry call is performed by this comparator.

Therefore the prior claim is directly confirmed:

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

under R7's explicit rule that truly non-scarce locally proven zero-resource operations need no artificial reservation.

### 2.2 WATCH reactivation

`reactivateWatch(...)` directly performs the previously described sequence:

1. marks the Watch `TRIGGERED`;
2. persists exact trigger evidence;
3. clears `nextCheckAt`;
4. starts a new Evaluation Cycle with:
   - `triggerType = WATCH_MATERIAL_SIGNAL_CHANGE`;
5. updates Opportunity:
   - `verdict = RESEARCH`;
   - `policyStatus = UNKNOWN`;
   - clears kill reason;
6. sets runtime activity to:
   - `RESEARCH_QUEUED`;
7. records:
   - `WATCH_REACTIVATED_TO_RESEARCH`.

Therefore the prior current-state characterization is directly verified.

## 3. R20 applicability

Current R20 explicitly states:

> after an external operation has executed, a result may require separate current-eligibility validation before adoption into authoritative state, customer-visible behavior, financial release, lifecycle transition, or another consequential downstream state.

Therefore:

`LIFECYCLE_TRANSITION_CAN_BE_A_C2_ADOPTION_TARGET = YES`

But R20 does **not** state that every lifecycle transition is consequential.

Its named boundary examples are examples, not an exhaustive statement that every state mutation is governed.

## 4. Boundary Registry status is decisive

Current R20 requires:

> a durable Boundary Registry or equivalent governing map that identifies consequential boundary classes and the predicates each one must revalidate.

Direct Phase-F representability work already established:

`F02-02 — Boundary Registry representation remains unresolved`

and found:

- no dedicated canonical Boundary Registry table/module;
- no equivalent exhaustive durable registry representation;
- exact historical boundary-class names/fields remain source-unrecovered.

Phase H likewise records exact Boundary Registry fields/class names as source gaps.

Therefore there is currently **no authoritative implemented registry entry** that can be queried to determine:

`WATCH_MATERIAL_SIGNAL_CHANGE → RESEARCH`

as either:

- registered C2; or
- registered NOT-C2.

## 5. Consequence for the proposed NOT-C2 inference

A reasoned hypothesis based on R20's named examples is:

> WATCH reactivation appears more like conservative internal workflow routing than provider/customer/financial/release authority consumption.

That is a useful design hypothesis.

But under R20's own forward-governance rule:

> newly introduced or materially changed lifecycle or other consequential surfaces must be reviewed for R20 applicability and, if consequential, registered before implementation completeness.

Because the registry itself is unresolved, absence of a WATCH boundary entry cannot prove non-consequentiality.

Therefore:

`WATCH_REACTIVATION_LIKELY_NOT_C2 = DESIGN_HYPOTHESIS_ONLY`

and:

`WATCH_REACTIVATION_NOT_C2 = NOT_PROVEN`

## 6. Why we cannot infer C2 either

The inverse overreach is also prohibited.

R20's phrase `lifecycle transition` identifies a possible adoption target category, not a rule that every lifecycle-state change requires ADOPTION_VALIDATION.

Creating a new Evaluation Cycle and queuing Research may be conservative/internal and may ultimately be classified outside the consequential registry.

Therefore:

`WATCH_REACTIVATION_C2 = NOT_PROVEN`

The correct current state remains:

`WATCH_REACTIVATION_C2 = UNRESOLVED`

## 7. Exact blocker

The blocker is now precisely identified as:

`F02-02 / BOUNDARY_REGISTRY_REPRESENTATION_AND_CLASSIFICATION`

not:

- lack of direct code inspection;
- lack of R20 review;
- ambiguity about what `reactivateWatch()` actually does.

Those facts are now directly verified.

## 8. M3 consequence

A full M3 exclusion requires:

`NON_SCARCE_PROVEN = YES`

and:

`NOT_C2 = YES`

For the current local comparator:

`NON_SCARCE_PROVEN = YES`

For the reactivation/adoption step:

`NOT_C2 = UNPROVEN`

Therefore:

`WATCH_FULL_M3_EXCLUSION = BLOCKED`

The category remains partially resolved M4.

## 9. Required future adjudication

When the Boundary Registry is represented/frozen, WATCH reactivation must be classified explicitly.

The classification review must ask:

1. Does WATCH reactivation merely route internal analysis conservatively?
2. Does the verdict/cycle transition itself consume any authority that R20 defines as consequential?
3. Does any downstream consumer perform an immediate consequential effect from the verdict transition without another R20 boundary?
4. Is all actual scarce/external effect deferred to later Research/provider attempts with their own boundaries?
5. If NOT_C2, can that exclusion be encoded durably in the registry/governance map rather than inferred from silence?

## 10. Disposition

`PORTFOLIO_RECONCILER_DIRECT_VERIFICATION = PASS`

`MATERIAL_DISCOVERY_DELTA_LOCAL_ONLY = CONFIRMED`

`REACTIVATE_WATCH_MUTATION_SEQUENCE = CONFIRMED`

`CURRENT_WATCH_PERIODIC_CHECK_C1 = NON_SCARCE_PROVEN`

`R20_LIFECYCLE_TRANSITION_CAN_BE_C2 = YES`

`WATCH_REACTIVATION_C2 = UNRESOLVED`

`WATCH_REACTIVATION_NOT_C2 = UNRESOLVED`

`WATCH_LIKELY_NOT_C2 = NON_AUTHORITY_DESIGN_HYPOTHESIS`

`BLOCKER = F02-02_BOUNDARY_REGISTRY_REPRESENTATION/CLASSIFICATION`

`WATCH_FULL_M3_EXCLUSION = NOT_AUTHORIZED`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
