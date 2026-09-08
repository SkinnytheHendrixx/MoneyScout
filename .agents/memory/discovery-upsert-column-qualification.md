---
name: Discovery upsert column qualification
description: Candidate upserts must qualify target columns when combining them with excluded values.
---

In PostgreSQL `ON CONFLICT DO UPDATE` expressions, qualify target-table columns whenever an update combines them with `excluded` columns, such as occurrence counters or array history.

**Why:** Unqualified references can become ambiguous in conflict updates and fail only when an existing Discovery candidate is revisited.

**How to apply:** Use the fully qualified target table column alongside `excluded.<column>`, and keep a zero-cost repeat-acceptance or repeat-finalization fixture that exercises the conflict path.