---
name: Discovery partial unique conflicts
description: PostgreSQL partial unique indexes require a matching conflict predicate for safe upserts.
---

When a Discovery idempotency constraint is implemented as a PostgreSQL partial unique index, the insert conflict target must include the same predicate; a bare column-list target cannot infer that partial index.

**Why:** Concurrent Discovery acceptance needs database-enforced idempotency without restricting unrelated evidence rows that share the same columns.

**How to apply:** Keep the partial-index predicate aligned with the `ON CONFLICT ... WHERE` clause and cover the pair with a zero-cost concurrency fixture.