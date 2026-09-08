---
name: Discovery catalog coverage
description: Durable rules for interpreting Apify Store discovery runs and their scored candidates.
---

Discovery candidates may be scored only after a complete Apify Store traversal validates the advertised total, exact page offsets, expected page sizes, and unique normalized Actor keys. Incomplete, failed, duplicate, or interrupted traversals must produce no scored candidates.

**Why:** A partial catalog can make supply, concentration, and fragmentation look artificially scarce or correlated, so ranking output from an incomplete run is misleading.

**How to apply:** Keep traversal, persistence, and scoring as separate phases; use fixture fetchers for tests and preserve the usage-telemetry boundary in UI and accepted-opportunity text.

For large catalogs, stage compact normalized Actor observations per run and finalize only after coverage validation; never retain the complete raw page set while traversing.

**Why:** Complete-coverage proof requires seeing every page, but holding the raw catalog until the end creates avoidable memory pressure and makes failed runs harder to isolate.

**How to apply:** Persist one normalized page at a time, clear staging on any incomplete/failed traversal, and score only the finalized staged set.

When a pass reaches its initially advertised last page, make exactly one bounded out-of-range probe: an empty response is acceptable only outside the initial range with an unchanged total; returned growth must fit within that one extra page or the pass is unverified.

**Why:** A live catalog can grow immediately after the initial last page, so stopping exactly at the first advertised boundary cannot distinguish stable coverage from newly exposed records.

**How to apply:** Keep the probe inside the pass hard bound, treat shrinkage and short required pages as failures, and never turn the probe into an unbounded convergence loop.