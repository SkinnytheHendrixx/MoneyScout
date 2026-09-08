---
name: Discovery catalog coverage
description: Durable rules for interpreting Apify Store discovery runs and their scored candidates.
---

Discovery candidates may be scored only after a complete Apify Store traversal validates the advertised total, exact page offsets, expected page sizes, and unique normalized Actor keys. Incomplete, failed, duplicate, or interrupted traversals must produce no scored candidates.

**Why:** A partial catalog can make supply, concentration, and fragmentation look artificially scarce or correlated, so ranking output from an incomplete run is misleading.

**How to apply:** Keep traversal, persistence, and scoring as separate phases; use fixture fetchers for tests and preserve the usage-telemetry boundary in UI and accepted-opportunity text.