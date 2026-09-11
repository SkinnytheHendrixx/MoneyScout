# Remediation Contract Fidelity Recovery Plan

**Status:** ACTIVE RECOVERY PLAN  
**Date:** 2026-09-10  
**Purpose:** Own and sequence recovery of the full confirmed R1–R20 contracts after the v1.0 register fidelity failure.

## 1. Source of record

For R1–R17, R19, and R20, the authoritative recovery source is the **actual adversarial-confirmation conversation record that produced each contract**, including the original draft, every adversarial objection, every amendment, rejected alternatives, and the final confirmation state.

The compressed `docs/CANONICAL_REMEDIATION_REGISTER.md` v1.0 matrix is **not** an authoritative recovery source for normative contract content. Live code may be used to check citations or clarify the concrete defect surface, but it must not be used to silently re-derive or replace obligations that were already resolved in the confirmed conversation.

If the conversation record does not support an exact obligation or wording, the recovery author must not invent it. The node remains `FIDELITY_SOURCE_INCOMPLETE` for that point until the source is recovered or the uncertainty is explicitly adjudicated under the Convergence Protocol.

## 2. Ownership

`FIDELITY_SOURCE_INCOMPLETE` is an owned fail-closed state, not a passive label.

- **Recovery owner:** `architect.openai` / the active canonical-contract recovery role.
- **Verification owner:** a materially independent adversarial reviewer source, consistent with the register independence rule. The recovery author cannot self-certify fidelity.
- **Implementation owner:** none while the fidelity notice remains active. Implementation-batch derivation stays paused.

A node leaves `FIDELITY_SOURCE_INCOMPLETE` only after all of the following occur:

1. its full contract is reconstructed from the actual confirmation conversation;
2. the artifact is committed as `docs/remediation-contracts/WI-RN.md`;
3. the committed file is re-read from the repository;
4. an adversarial fidelity review compares it against the conversation record rather than against its own internal consistency or the v1.0 summary;
5. any drift is corrected and re-reviewed;
6. the artifact is marked `FIDELITY_VERIFIED`.

Contract confirmation and artifact fidelity are different states. A node may be contract-confirmed while its repository artifact remains `FIDELITY_SOURCE_INCOMPLETE`.

## 3. Recovery method

For each node:

1. Locate the complete node-specific confirmation sequence in the conversation record.
2. Recover the confirmed contract, preserving:
   - historical finding mapping and severity;
   - mission/root statement;
   - exact invariants and failure states;
   - START / LOCAL CLOSURE / E2E dependency classes;
   - named migrations and audits;
   - acceptance and compound fixtures;
   - vocabulary checkpoints;
   - parallel-not-merged boundaries;
   - Design Input decisions;
   - closure evidence requirements;
   - material amendments, rejected alternatives, and correction provenance where applicable.
3. Do **not** fill omissions from the compressed v1.0 matrix.
4. Use live repository evidence only to verify current cited surfaces or flag later code drift; do not substitute a fresh architecture derivation for the confirmed contract.
5. Commit the recovered node artifact.
6. Perform artifact-vs-conversation adversarial verification.
7. Correct any discrepancy as a new amendment, preserving the failed version in Git history.
8. Mark the node artifact `FIDELITY_VERIFIED` only after that pass succeeds.

## 4. Sequenced recovery queue

Recovery follows normalized node order because this is a fidelity reconstruction sequence, not an implementation dependency graph. This ordering minimizes cross-reference drift and makes later nodes checkable against already recovered upstream terminology.

| Sequence | Node | Contract state | Artifact fidelity state | Next owned action |
|---:|---|---|---|---|
| 1 | R1 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct from conversation, commit, adversarially verify |
| 2 | R2 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R1 artifact verification |
| 3 | R3 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R2 artifact verification |
| 4 | R4 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R3 artifact verification |
| 5 | R5 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R4 artifact verification |
| 6 | R6 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R5 artifact verification |
| 7 | R7 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R6 artifact verification |
| 8 | R8 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R7 artifact verification |
| 9 | R9 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R8 artifact verification |
| 10 | R10 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R9 artifact verification |
| 11 | R11 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R10 artifact verification |
| 12 | R12 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R11 artifact verification |
| 13 | R13 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R12 artifact verification |
| 14 | R14 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R13 artifact verification |
| 15 | R15 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R14 artifact verification |
| 16 | R16 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R15 artifact verification |
| 17 | R17 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R16 artifact verification |
| 18 | R18 | CONFIRMED | RECOVERED / PENDING GLOBAL REGISTER RE-VERIFICATION | full contract committed at `WI-R18.md`; preserve its amendment history |
| 19 | R19 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct after R17; verify against R17/R18 terminology without changing confirmed scope |
| 20 | R20 | CONFIRMED | FIDELITY_SOURCE_INCOMPLETE | reconstruct last; verify capstone references against all recovered upstream contracts |

The queue is intentionally serialized at the **artifact-verification** level: the next node should not be treated as fidelity-complete merely because a draft file was produced for the previous node. This does not imply that implementation will later be serialized in the same order.

## 5. Per-node verification standard

The reviewer must compare the committed file against the actual confirmation sequence and answer at minimum:

- Is the historical finding ID exact?
- Is severity exact?
- Are all material amendments present?
- Are rejected alternatives preserved where they constrain implementation?
- Are known migrations complete?
- Are acceptance and compound fixtures complete?
- Are START / LOCAL CLOSURE / E2E fields preserved as distinct concepts?
- Are Design Input activation/consumption states scope-correct?
- Did any summary wording silently narrow the normalized root?
- Did recovery introduce any new architecture that was never confirmed?
- Did it omit any fail-closed owner, regression state, or anti-cheat fixture established during review?

Internal coherence is not sufficient evidence of fidelity.

## 6. Global completion gate

Implementation authority remains suspended until:

1. all twenty node artifacts exist;
2. every node is `FIDELITY_VERIFIED` against the conversation record;
3. the corrected canonical register is rebuilt as an index/governance layer pointing to the verified node artifacts by immutable repository identity/reference;
4. the v1.0 failure and all correction provenance remain visible;
5. the corrected register itself is fetched from the repository and verified against the verified per-node artifacts;
6. a materially independent final review confirms there is no compression, fabricated confirmation, scope narrowing, or dependency-graph collapse.

Only then may the fidelity notice be superseded and implementation-batch derivation resume.

## 7. Standing invariant

> A recovered contract is not verified because it looks complete. It is verified only when the committed artifact is checked against the actual record that was originally confirmed.
