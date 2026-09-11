# Money Scout Documentation Index

Start here when entering the repository without prior conversation context.

## Canonical project knowledge

1. [`/AGENTS.md`](../AGENTS.md) — operating instructions for coding/engineering agents.
2. [`CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md`](CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md) — **current remediation-authority status**. Implementation authority is suspended pending fidelity correction and completion of WI-R18.
3. [`CANONICAL_REMEDIATION_REGISTER.md`](CANONICAL_REMEDIATION_REGISTER.md) — historical v1.0 freeze attempt. Do not use as settled implementation authority while the fidelity notice is active.
4. [`CURRENT_STATE.md`](CURRENT_STATE.md) — what is actually live/current now.
5. [`ROADMAP.md`](ROADMAP.md) — canonical build sequence and milestone exit criteria.
6. [`ARCHITECTURE.md`](ARCHITECTURE.md) — lifecycle, domain objects, subsystems, and authority model.
7. [`PRODUCT_PRINCIPLES.md`](PRODUCT_PRINCIPLES.md) — non-negotiable product invariants.
8. [`engineering-workflow.md`](engineering-workflow.md) — branch, CI, deployment, and documentation workflow.

## Historical / subsystem documentation

- `task-*.md` files document completed milestone implementation contracts.
- `EVIDENCE_ARCHITECTURE.md` documents evidence-specific architecture.
- `discovery-acquisition-strategy.md` documents Discovery acquisition strategy.
- `/.agents/memory/` contains narrow durable engineering lessons and known gotchas that should not have to be rediscovered.

## Maintenance rule

When a milestone materially changes the system, update `CURRENT_STATE.md` and `ROADMAP.md` in the same PR whenever practical. Update `ARCHITECTURE.md` when subsystem/domain boundaries change. Update `PRODUCT_PRINCIPLES.md` only when the owner explicitly changes a product invariant.

While `CANONICAL_REMEDIATION_REGISTER_FIDELITY_NOTICE.md` is active, remediation implementation-batch derivation is paused. The v1.0 register must not be silently treated as authoritative. Restoring implementation authority requires WI-R18 confirmation, full per-node contract preservation, amendment provenance, and a fresh fidelity verification pass.
