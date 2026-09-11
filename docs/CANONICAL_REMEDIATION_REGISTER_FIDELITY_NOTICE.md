# Canonical Remediation Register Fidelity Notice

**Status:** IMPLEMENTATION AUTHORITY SUSPENDED PENDING FIDELITY CORRECTION  
**Date:** 2026-09-10  
**Applies to:** `docs/CANONICAL_REMEDIATION_REGISTER.md` v1.0

## Why this notice exists

A direct verification pass of the committed remediation register found two material fidelity problems:

1. **R18 was presented as contract-confirmed even though WI-R18 had not yet gone through the same full draft/adversarial-confirmation process as the other work items.** The prior claim `R1–R20 — CONTRACT-LEVEL REMEDIATION REGISTER COMPLETE` therefore overclaimed the actual confirmed state.
2. **The committed register compressed many node contracts into summary matrix entries and omitted normative detail that had been explicitly confirmed during adversarial review**, including named migrations, acceptance fixtures, vocabulary checkpoints, parallel-not-merged boundaries, exact failure states, and closure-evidence requirements.

These are different defects. The first is a fabricated confirmation. The second is incomplete fidelity.

## Correct state until this notice is superseded

- R1–R17, R19, and R20 have completed contract-level adversarial confirmation.
- R18 remains a known normalized remediation root (`C5-F3`) whose full contract still requires drafting and adversarial confirmation.
- `docs/CANONICAL_REMEDIATION_REGISTER.md` v1.0 remains historical evidence of the first freeze attempt, but **must not be used as settled implementation authority while this notice is active**.
- Implementation-batch derivation is paused.

## Correction requirements

Before remediation implementation authority is restored:

1. Draft WI-R18 from live repository evidence and the frozen normalized root.
2. Complete the same adversarial-confirmation process used for the other work items.
3. Preserve the full confirmed contract for every node in an individually addressable in-repo artifact, rather than relying on a compressed matrix as sole authority.
4. Make the corrected register an index/governance layer that incorporates those full contracts by explicit immutable reference.
5. Record amendment provenance distinguishing the original freeze attempt from the corrected, fidelity-verified authority.
6. Re-run an artifact-vs-confirmed-contract verification pass after correction.
7. Restore implementation-authority status only after that verification passes.

## Provenance rule

Do not silently overwrite this failure out of history. The corrected register must preserve that v1.0 previously overclaimed R1–R20 completion and was suspended after a fidelity audit. The correction is a new governed state, not a rewrite of what happened.
