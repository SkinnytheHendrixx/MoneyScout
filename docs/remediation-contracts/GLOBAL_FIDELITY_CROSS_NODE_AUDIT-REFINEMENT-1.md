# Global Fidelity & Cross-Node Audit — Refinement 1

**Status:** GOVERNING AMENDMENT TO `GLOBAL_FIDELITY_CROSS_NODE_AUDIT.md`  
**Applies immediately:** YES  
**Implementation authority:** STILL SUSPENDED

This amendment records two non-blocking methodology refinements accepted before Phase A begins. They are governing additions to the Global Fidelity & Cross-Node Audit protocol and must be consumed together with the main protocol.

## 1. `SOURCE_EXHAUSTED` requires a deliberate targeted re-read

The state:

`SOURCE_EXHAUSTED / NO FURTHER RECOVERABLE DETAIL`

may not be declared after a shallow or single-pass search.

Before declaring source exhaustion for a specific gap, the reviewer must document a deliberate targeted re-read directed at that gap, including:

- the exact missing detail being sought;
- the source material re-read;
- the terms/scenarios/sections specifically checked;
- whether neighboring confirmed material was inspected for cross-reference evidence;
- whether a second focused pass produced any new recoverable detail;
- the reason the reviewer concludes the remaining detail is not recoverable from the available source.

A source may still legitimately be exhausted. The purpose of this rule is only to distinguish genuine exhaustion from premature stopping.

> **`SOURCE_EXHAUSTED` is a documented conclusion after targeted re-read, not a synonym for “not found on first look.”**

## 2. T4 reviewer-independence sufficiency must itself be auditable

The final T4 reviewer must satisfy the independence rule in the main protocol. The sufficiency of that independence may not rest on an unsupported assertion by either reconstruction continuity chain.

Before T4 work begins, the audit must record a **T4 Reviewer Independence Assessment** containing at minimum:

- reviewer/model/provider identity at the level needed to establish independence;
- whether that reviewer materially authored, reconstructed, adjudicated, or repeatedly reviewed any part of the corpus;
- what prior conclusions, if any, the reviewer will be exposed to;
- what underlying source packet and immutable artifacts the reviewer receives;
- why the proposed reviewer is materially independent under the frozen R5 standard;
- any residual conflict or continuity risk;
- who prepared the independence assessment;
- enough concrete reasoning that a later reader can challenge the independence decision rather than merely trusting the preparer's assertion.

The Claude and ChatGPT continuity chains may prepare or comment on this assessment, but their assertion alone does not prove independence. The final audit record must make the independence reasoning inspectable.

If independence cannot be demonstrated, the review does not qualify as T4.

> **T4 independence is itself an auditable claim, not a label granted by the same chain being reviewed.**

## 3. Effect on Phase A

Neither refinement blocks beginning R4 Phase A review.

They do govern Phase A immediately:

- any R4 `SOURCE_EXHAUSTED` conclusion must meet §1 above;
- no R4 result should be described as T4 merely because the source-level recheck is adversarial;
- final T4 assignment remains deferred to the materially independent reviewer process.

## 4. Relay-contamination guard

This governing amendment terminates here. No conversational handoff text is part of the amendment body.
