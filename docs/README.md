# Money Scout Documentation Index

Start here when entering the repository without prior conversation context.

## Canonical project knowledge

1. [`/AGENTS.md`](../AGENTS.md) — operating instructions for coding/engineering agents.
2. [`CURRENT_STATE.md`](CURRENT_STATE.md) — what is actually live/current now.
3. [`ROADMAP.md`](ROADMAP.md) — canonical build sequence and milestone exit criteria.
4. [`ARCHITECTURE.md`](ARCHITECTURE.md) — lifecycle, domain objects, subsystems, and authority model.
5. [`PRODUCT_PRINCIPLES.md`](PRODUCT_PRINCIPLES.md) — non-negotiable product invariants.
6. [`engineering-workflow.md`](engineering-workflow.md) — branch, CI, deployment, and documentation workflow.

## Historical / subsystem documentation

- `task-*.md` files document completed milestone implementation contracts.
- `EVIDENCE_ARCHITECTURE.md` documents evidence-specific architecture.
- `discovery-acquisition-strategy.md` documents Discovery acquisition strategy.
- `/.agents/memory/` contains narrow durable engineering lessons and known gotchas that should not have to be rediscovered.

## Maintenance rule

When a milestone materially changes the system, update `CURRENT_STATE.md` and `ROADMAP.md` in the same PR whenever practical. Update `ARCHITECTURE.md` when subsystem/domain boundaries change. Update `PRODUCT_PRINCIPLES.md` only when the owner explicitly changes a product invariant.
