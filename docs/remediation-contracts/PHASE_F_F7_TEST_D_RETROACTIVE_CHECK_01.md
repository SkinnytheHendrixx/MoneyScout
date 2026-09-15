# Phase F F7 Test-D Retroactive Check 01

**Status:** REVIEWED / RECORDED / NO REOPENING REQUIRED  
**Phase:** F — F7 Cross-Surface N×N Reference Integrity  
**Governing rule:** `PHASE_F_F7_COUNTING_RULE_REFINEMENT_1.md`  
**Implementation authority:** SUSPENDED

## 1. Trigger

F7 Batch 03 added Test D to the standing counting protocol: endpoint-batch wording that a downstream insufficiency is a `consequence`, `downstream consequence`, `acceptance consequence`, or equivalent establishes only that the upstream object is a necessary precondition unless the record also proves it is a sufficient precondition that automatically guarantees exact downstream wiring.

The counting-rule governance requires retroactive application where an earlier F7 candidate may have been wrongly excluded because endpoint consequence language was mistaken for sufficient composition.

This check therefore re-screens the two prior F7 withdrawals.

## 2. Batch 01 — draft F07-02 execution attempt ↔ exact R18 Binding

**Result:** NO REOPENING.

The withdrawal was not based on consequence language.

F06-02 is `EXECUTION_CAPABILITY_BINDING_ATTACHMENT`. Its entire defining content is that a consequential execution must bind one exact immutable capability authority. The withdrawn candidate stated the same invariant.

This is Test B constitutive-purpose reasoning:

- if F06-02 is correctly remediated, the exact execution↔binding relationship necessarily exists;
- there is no additional third association object or independent current/latest lookup relation left outside F06-02's own definition;
- Test D therefore does not change the disposition.

The scenario remains exercised in mixed-history testing under F06-02 and F07-06 where set multiplicity applies.

## 3. Batch 02 — exact R17 Offer Version ↔ CUSTOMER_CHARGING Grant

**Result:** NO REOPENING.

The withdrawal was likewise not based on consequence language.

F05-03 is `CUSTOMER_CHARGING_GRANT_REPRESENTATION`. A compliant Grant is, by definition, immutable execution authority bound to one exact Offer Version/fingerprint plus exact provider/account/action/checkout scope and lifecycle.

This is also Test B constitutive-purpose reasoning:

- if F05-03 is correctly remediated, exact Grant↔Offer binding necessarily exists;
- a Grant wired to the wrong Offer is not a correct F05-03 remediation;
- no independent third composition remains merely because Offer and Grant are separate rows/objects;
- Test D therefore does not reopen the candidate.

The O1/G1 versus O2/G2 scenario remains mandatory in mixed-history testing under F05-03 and surviving downstream F7 relationships.

## 4. Retroactive disposition

Test D produces a **clean retroactive result** for F7 Batches 01 and 02.

Neither withdrawal depended on treating an endpoint-level downstream consequence as sufficient cross-surface proof. Both withdrawals remain valid under the newer four-test protocol because each is independently resolved by Test B's constitutive-purpose criterion.

No prior F7 finding is reopened, renumbered, or reclassified by this check.

## 5. Carry-forward rule

Future retroactive checks must distinguish the reasoning actually used to exclude a candidate:

- if exclusion rested on Test B constitutive purpose, Test D does not disturb it unless new evidence reveals an independent third wiring mechanism;
- if exclusion rested only on endpoint wording that another surface was a consequence/prerequisite of a missing object, Test D requires a fresh sufficient-precondition analysis.

Implementation authority remains **SUSPENDED**.
