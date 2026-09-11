# Money Scout Documentation Index

Start here when entering the repository without prior conversation context.

## Canonical project knowledge

1. [`/AGENTS.md`](../AGENTS.md) — operating instructions for coding/engineering agents.
2. [`CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md`](CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md) — **current remediation-authority status**. R1–R20 are contract-confirmed, but implementation authority remains suspended pending full per-node artifact reconstruction and a fresh fidelity verification pass.
3. [`remediation-contracts/RECOVERY_PLAN.md`](remediation-contracts/RECOVERY_PLAN.md) — owned, sequenced recovery plan for reconstructing R1–R17, R19, and R20 from the actual adversarial-confirmation conversation record and verifying each committed artifact against that source.
4. [`remediation-contracts/WI-R18.md`](remediation-contracts/WI-R18.md) — full confirmed WI-R18 contract, including its correction/amendment provenance.
5. [`CANONICAL_REMEDIATION_REGISTER.md`](CANONICAL_REMEDIATION_REGISTER.md) — historical v1.0 freeze attempt. Do not use as settled implementation authority while the fidelity notice is active.
6. [`CURRENT_STATE.md`](CURRENT_STATE.md) — what is actually live/current now.
7. [`ROADMAP.md`](ROADMAP.md) — canonical build sequence and milestone exit criteria.
8. [`ARCHITECTURE.md`](ARCHITECTURE.md) — lifecycle, domain objects, subsystems, and authority model.
9. [`PRODUCT_PRINCIPLES.md`](PRODUCT_PRINCIPLES.md) — non-negotiable product invariants.
10. [`engineering-workflow.md`](engineering-workflow.md) — branch, CI, deployment, and documentation workflow.

## Historical / subsystem documentation

- `task-*.md` files document completed milestone implementation contracts.
- `EVIDENCE_ARCHITECTURE.md` documents evidence-specific architecture.
- `discovery-acquisition-strategy.md` documents Discovery acquisition strategy.
- `/.agents/memory/` contains narrow durable engineering lessons and known gotchas that should not have to be rediscovered.

## Maintenance rule

When a milestone materially changes the system, update `CURRENT_STATE.md` and `ROADMAP.md` in the same PR whenever practical. Update `ARCHITECTURE.md` when subsystem/domain boundaries change. Update `PRODUCT_PRINCIPLES.md` only when the owner explicitly changes a product invariant.

While `CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md` is active, remediation implementation-batch derivation is paused. The v1.0 register must not be silently treated as authoritative. Restoring implementation authority requires full R1–R20 per-node contract preservation, explicit amendment provenance, per-node artifact verification against the actual confirmation conversation, and a fresh final artifact-vs-contract fidelity verification pass against the committed files.
