# Phase E Compound 03 — R12 × R13 × R7 Certification

**Status:** FINAL / REVIEWED / ADJUDICATED  
**Phase:** E — Compound Certification  
**Compound:** `R12 × R13 × R7`  
**Implementation authority:** SUSPENDED

## 1. Final result

**PASS at the Phase-E specification/composition level, with two new fixture-tier strengthenings, one light aggregate-status strengthening, one carried clarification, and one new attack. No new primary cross-node defect.**

R12 owns durable due/runnable occurrence existence and deterministic reconstruction. R13 owns truthful health/liveness for the exact executor/service path expected to process that occurrence. R7 owns scarce-resource reservation/admission and the normative three-way outage-recovery certification.

The three predicates remain separate: runnable work does not prove executor health; executor health does not manufacture missing runnable work; neither grants scarce-resource authority.

All live Phase-C dependencies remain governing, especially C06-03/C26-03, C24-03, C38-04, and C40-04/C40-05.

## 2. Strengthening A — health freshness at resumed processing

> **Health evidence used to justify resumed processing of a recovered exact occurrence must be current enough at the actual progression boundary for the exact executor/service path that will process that occurrence. Earlier recovery-time health does not become perpetual authority to continue processing after that path has materially degraded.**

Required fixture:

1. R12 reconstructs exact occurrence O1.
2. At T1, R13 records exact required executor/service path X as `HEALTHY` or otherwise qualifying under policy.
3. O1 may receive or continue holding its legitimate R7 reservation under the ordinary R7 rules.
4. Before O1 actually resumes consequential processing at T2, X becomes `STALLED`, `FAILED`, or materially `UNKNOWN`.
5. The system must not consume the stale T1 health result as if X were still healthy at T2.
6. The reservation need not disappear merely because health degraded; R7's reservation lifecycle remains separately authoritative.
7. If X later recovers, a new current-enough qualifying R13 result is required for later progression.
8. Historical T1 health and subsequent degradation/recovery remain preserved rather than overwritten.

This follows the same timing shape already established by C19-02 for R14→R13 readiness at authority-epoch commit, applied here to recovered-work progression.

## 3. Strengthening B — exact occurrence-to-executor-path health correspondence in heterogeneous recovery

C26-03 already prohibits generic kernel health from substituting for the exact executor expected for an occurrence. Compound review identified a narrower batch-level extension:

> **In a recovery burst containing occurrences that require distinct executor/service paths, the R13 health evidence consumed for each exact R12 occurrence must be traceable to that occurrence's own correctly matched expected path. A specific-but-wrong executor record from the same batch cannot satisfy the occurrence's liveness predicate.**

Required fixture:

1. Recovery contains O1 requiring path X and O2 requiring path Y.
2. X is healthy; Y is failed/stalled.
3. R12 correctly reconstructs both occurrences and R7 has sufficient aggregate resource capacity for both.
4. O1 may progress if its other gates pass.
5. O2 must not consume X's health record because X is specific, healthy, in the same kernel, or in the same recovery batch.
6. Batch indexing/cache/loop mechanics must preserve O1→X and O2→Y correspondence.
7. If Y later recovers, O2 may progress only from Y's qualifying current health evidence.
8. Generic batch state such as `some required executor healthy` or `all health records present` is insufficient.

This is fixture-tier exact-correspondence strengthening, not `MISSING_REQUIRED_COMPOSITION`: R12 and R13 already compose and own determinate concepts; the missing precision is per-occurrence batch correspondence.

## 4. Light strengthening — aggregate recovery status must reflect actual backlog state

> **Any aggregate claim that outage recovery is complete/cleared must be derived from the actual R12 pending/runnable/blocked occurrence state together with truthful R13 visibility of blocked work; it may not be inferred merely because some subset of recovered work is now progressing.**

Fixture: N occurrences are recovered, only K<N are admitted/progressing, and N-K remain durably pending or blocked. Aggregate status must not report full recovery completion while those N-K still exist. This does not require inventing a new heavy state machine; it requires that any existing/computed completion status consume the authoritative underlying data rather than optimistic activity signals.

## 5. C24-03 clarification — split-brain/liveness-recovery triggers do not bypass occurrence identity

C24-03's exact R12 occurrence ↔ R7 Economic Action/reservation/execution strengthening remains fully governing regardless of why a duplicate claim/recovery attempt was triggered.

Clarification:

> **A false R13 health-failure/recovery episode, split-brain detector, or liveness-recovery mechanism cannot cause a fresh reservation for the same logical occurrence merely because it initiates another claim attempt. Trigger mechanism does not change occurrence identity.**

If the original executor instance is still alive and a second recovery path attempts to claim O1, deterministic occurrence identity plus C24-03 must prevent duplicate independent reservation authority. A genuine successor occurrence remains a different governed case and receives its own identity/admission semantics.

## 6. Compound attacks

- **E3-1:** recovered backlog disappears under resource denial — FAIL.
- **E3-2:** healthy executor masks missing durable work — FAIL.
- **E3-3:** runnable backlog masks dead executor — FAIL.
- **E3-4:** R7 denial misclassified as executor failure — FAIL.
- **E3-5:** generic-kernel health substituted for exact path health — FAIL.
- **E3-6:** duplicate reconstruction/claim recovery produces duplicate reservation demand for one logical occurrence — FAIL under C24-03 and §5 clarification.
- **E3-7:** stale health at actual resumed-processing boundary — apply Strengthening A.
- **E3-8:** specific executor health cross-applied to another occurrence in a heterogeneous batch — apply Strengthening B.
- **E3-9:** partial resource admission treated as complete recovery — apply §4 aggregate-status strengthening.
- **E3-10:** executor heartbeats while blocked work becomes invisible/unobserved — R13 may degrade/stall/fail according to policy; R7 denial alone is not the cause.
- **E3-11:** overdue/safety-critical recovered work bypasses R7 — FAIL.
- **E3-12:** one occurrence borrows another occurrence's R7 admission/reservation — FAIL under C24-03.
- **E3-13:** concurrent multi-source recovery interference. Two independent outage/recovery bursts from unrelated causes become runnable at overlapping times and compete for the same shared R7 pool. R7's aggregate-safe admission must account for combined demand across both bursts; each burst cannot be evaluated as if it were the sole recovery event in progress.

E3-13 is a new compound attack, not a new standalone strengthening: it exercises the already-owned R7 aggregate admission rule across concurrent recovery sources instead of one recovery wave in isolation.

## 7. Pairwise-correct but compound-unsafe cases

Pairwise correctness does not exhaust this compound:

- correct R12 reconstruction + correct R13 records can still fail if O2 consumes O1's executor-health evidence;
- correct health at T1 can become stale before actual T2 progression;
- correct per-burst R7 admission can still overcommit if two independent recovery bursts are calculated independently against one shared pool;
- correct partial admission can still be falsely summarized as complete recovery;
- duplicate liveness-recovery triggers can amplify one logical occurrence unless occurrence identity remains causal and stable across trigger mechanisms.

## 8. Open Phase-C findings

The four confirmed `MISSING_REQUIRED_COMPOSITION` findings and C21-03 do not block this exact R12/R13/R7 compound:

- `R17 → R18`
- `R5 → R20`
- `R19 → R14`
- `R19 → R18`
- `R11 → R8` / C21-03

They remain open for their owning wider scenarios.

## 9. Final disposition

**R12 × R13 × R7: PASS WITH TWO NEW FIXTURE-TIER STRENGTHENINGS AND ONE LIGHT AGGREGATE-STATUS STRENGTHENING.**

The new fixture-tier strengthenings are:

1. R13 health freshness at the actual resumed-processing boundary for the exact required path;
2. exact per-occurrence occurrence→executor/service-path health correspondence in heterogeneous recovery bursts.

The lighter strengthening requires aggregate recovery-complete reporting to reflect actual R12 pending/blocked state plus R13 blocked-work visibility.

C24-03 is clarified to cover duplicate claim/reservation attempts triggered by R13 liveness-recovery or split-brain mechanisms, and E3-13 adds concurrent multi-source recovery interference as an explicit attack.

No new primary `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is established.

This certification is specification-level only. Implementation authority remains **SUSPENDED**.