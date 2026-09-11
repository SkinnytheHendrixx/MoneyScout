# Canonical Remediation Register Fidelity Notice

**Status:** IMPLEMENTATION AUTHORITY SUSPENDED PENDING FULL-FIDELITY RECONSTRUCTION AND RE-VERIFICATION  
**Date:** 2026-09-10  
**Applies to:** `docs/CANONICAL_REMEDIATION_REGISTER.md` v1.0

## Why this notice exists

A direct verification pass of the committed remediation register found two material fidelity problems:

1. **R18 was presented as contract-confirmed before WI-R18 had gone through the same full draft/adversarial-confirmation process as the other work items.** The prior claim `R1–R20 — CONTRACT-LEVEL REMEDIATION REGISTER COMPLETE` was false when made.
2. **The committed register compressed many node contracts into summary matrix entries and omitted normative detail explicitly confirmed during adversarial review**, including named migrations, acceptance fixtures, vocabulary checkpoints, parallel-not-merged boundaries, exact failure states, and closure-evidence requirements.

These remain different defect classes. The first was a fabricated confirmation. The second is incomplete artifact fidelity.

## R18 correction history

R18 is now genuinely contract-confirmed, but its correction history must remain visible:

1. **v1.0 freeze attempt:** R18 was falsely presented as already confirmed and assigned the fabricated historical citation `C5-F3`.
2. **First real draft:** live repository evidence was used, but the draft still carried `C5-F3` provisionally. Adversarial review corrected the actual historical finding to `C4-F5` and identified material semantic/dependency problems.
3. **Second amended draft:** `C4-F5` was restored; DEPRECATED semantics were corrected to preserve the frozen default that already-bound work may normally continue while new selection is disallowed; full `R6 CLOSED` was removed as a local-closure prerequisite. A further pass then required the lifecycle summary to match those semantics, an explicit stronger-policy override fixture, and a mechanical requirement that R18 consume a real implemented/queryable R6 verification-result interface rather than confirmed design text or a boolean helper.
4. **Third draft:** those amendments were incorporated and WI-R18 was confirmed.

The confirmed full R18 contract now lives at:

- [`remediation-contracts/WI-R18.md`](remediation-contracts/WI-R18.md)

Historical finding: **C4-F5 / MATERIAL**.

The false `C5-F3` value is retained only in amendment history as evidence of the integrity failure. It is not alternate traceability.

## Correct state while this notice is active

- R1–R20 have now completed contract-level adversarial confirmation.
- R18 is no longer the open contract gap.
- `docs/CANONICAL_REMEDIATION_REGISTER.md` v1.0 remains historical evidence of the first freeze attempt and **must not be used as settled implementation authority**.
- Implementation-batch derivation remains paused because full per-node artifact fidelity has not yet been reconstructed and independently verified.

## Remaining correction requirements

Before remediation implementation authority is restored:

1. Preserve the full confirmed contract for **every R1–R20 node** in an individually addressable in-repo artifact. The compressed v1.0 matrix may not be sole authority.
2. Rebuild the canonical register as an index/governance layer that incorporates those full contracts by explicit immutable reference.
3. Preserve amendment provenance distinguishing the original flawed freeze from corrected authority, including the R18 correction sequence above.
4. Re-run an artifact-vs-confirmed-contract fidelity verification pass against the **actual committed files**.
5. Restore implementation-authority status only after that verification passes.

## Fidelity constraint on reconstruction

Do not reconstruct missing full contracts from the compressed v1.0 register and call them faithful. The source for each per-node artifact must be the actual confirmed contract record or other evidence sufficient to preserve every normative obligation without paraphrase drift.

If an exact full-contract source is unavailable for a node, that node's artifact must remain explicitly `FIDELITY_SOURCE_INCOMPLETE` until the source is recovered or independently reconstructed and verified under the Convergence Protocol.

## Provenance rule

Do not silently overwrite this failure out of history. The corrected register must preserve that v1.0 overclaimed R1–R20 completion, used a fabricated R18 historical ID/confirmation, and was suspended after direct fidelity audit. The correction is a new governed state, not a rewrite of what happened.
