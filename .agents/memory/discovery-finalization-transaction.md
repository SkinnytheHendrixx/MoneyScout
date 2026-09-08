---
name: Discovery finalization transaction
description: Actor, observation, derived-result, and staging writes must commit or roll back together.
---

Discovery finalization must keep actor persistence, observation links, derived snapshots/candidates, run completion, and staging cleanup within one database transaction.

**Why:** A derived-write failure after actor batching can otherwise leave durable actor history for a run that ultimately becomes FAILED.

**How to apply:** When adding finalization steps, pass the active transaction through helper functions and keep a database-local failure fixture that asserts no partial records survive.