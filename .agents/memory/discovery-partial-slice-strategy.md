---
name: Discovery partial-slice strategy
description: Durable acquisition decision after the Apify Store deep-offset failure.
---

Until Apify Store provides a proven exhaustive partition or reliable deep-catalog boundary, Money Scout v0 should verify a bounded reachable slice rather than claim full coverage.

**Why:** Run #296 returned an empty page at offset 15,000 while reporting a much larger total, and local evidence does not prove that category, pricing model, or agentic-user fields are exhaustive Store filters.

**How to apply:** Keep two-pass canonical membership convergence, duplicate detection, bounded retries, transactional finalization, and fail-closed behavior. Permit only observed-slice change and usage descriptions; disable thin-supply, concentration, fragmentation, and catalog-relative claims until coverage is proven.