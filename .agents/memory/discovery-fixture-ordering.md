---
name: Discovery fixture ordering
description: Durable test rule for validating ordered Discovery pass telemetry from PostgreSQL.
---

Database queries do not guarantee insertion order. Any fixture assertion that compares per-pass Discovery telemetry positionally must order rows by their persisted identity or another explicit sequence.

**Why:** A database-backed convergence fixture exposed that the same correct pass records can be returned in a different order, producing a false failure.

**How to apply:** Add an explicit ascending order to pass queries before comparing pass-specific totals, drift, or membership counts.