# Phase E Compound 03 — R12 × R13 × R7

**Status:** DRAFT / NON-AUTHORITATIVE / PENDING ADVERSARIAL REVIEW  
**Phase:** E — Compound Certification  
**Compound:** `R12 × R13 × R7`  
**Implementation authority:** SUSPENDED

## 1. Scope and ownership

This compound asks whether durable recovered work, truthful executor liveness, and scarce-resource admission compose safely during outage/restart and backlog recovery.

- **R12** owns durable due/runnable occurrence existence, deterministic reconstruction, and claim/retry scheduling semantics.
- **R13** owns truthful health/liveness of the exact executor/service path expected to process that work.
- **R7** owns scarce-resource reservation/admission and the normative three-way outage-recovery certification.

The three predicates are separate: runnable work does not prove executor health; executor health does not manufacture missing runnable work; neither grants scarce-resource authority.

## 2. Governing Phase-C requirements carried forward

- **C06-03 / C26-03 `R12 ↔ R13`** — durable work existence and executor health are separate bilateral predicates; generic kernel health cannot substitute for the exact expected executor path.
- **C24-03 `R7 → R12`** — live strengthening requires exact R12 occurrence ↔ R7 Economic Action/reservation/execution correspondence, including recovery without borrowing or double-reserving across distinct occurrences.
- **C38-04 `R12 → R7`** — reciprocal review preserves C24-03; backlog urgency does not create resource authority.
- **C40-04 / C40-05 `R7 ↔ R13`** — healthy/recovering executors remain subject to R7; R7 denial does not itself make an executor unhealthy if blocked work is truthfully observed and persisted.

The R7-owned normative control is: durable obligations accumulate during outage → recovery makes many due jobs runnable → R12 reconstructs them → R13 truthfully establishes the responsible execution paths → R7 admits only the aggregate-safe subset.

## 3. Canonical affirmative control

For an outage-recovery burst containing exact runnable occurrences O1…ON:

1. R12 deterministically reconstructs each logical due occurrence exactly once and preserves its exact domain/occurrence identity.
2. Each occurrence remains associated with the exact executor/service path expected to process its work class.
3. R13 supplies current truthful health/progress evidence for each required executor/service path; generic supervisor/kernel health is insufficient.
4. Any scarce execution admitted by R7 binds the exact R12 occurrence under C24-03.
5. R7 atomically admits only the subset whose complete scarce-resource vectors fit governing aggregate limits.
6. Non-admitted occurrences remain durably due/runnable/blocked; they are not dropped, completed, or reclassified merely because capacity is unavailable.
7. R13 may remain healthy/degraded while work is R7-blocked if the exact executor continues observing and durably reporting the blocked state.
8. Progression from recovered/runnable/reserved state into actual processing must not rely on stale R13 health evidence for the exact path that will execute the occurrence.

## 4. Deliberate compound attacks

### E3-1 — recovered backlog disappears under resource denial

N exact due occurrences are reconstructed; R7 admits only K < N.

**Expected:** N-K remain durably represented and recoverable. R7 denial does not cancel, complete, or erase R12 work.

### E3-2 — healthy executor masks missing durable work

R13 reports the relevant executor healthy, but one required R12 occurrence was lost during restart.

**Expected:** health cannot manufacture scheduling correctness or certify recovery completeness.

### E3-3 — runnable backlog masks dead executor

R12 correctly reconstructs all due work, but the exact required executor is `FAILED`, `STALLED`, or materially `UNKNOWN`.

**Expected:** runnable existence cannot be interpreted as successful liveness recovery.

### E3-4 — resource denial misclassified as executor failure

The exact executor is healthy and continues observing O1, but R7 denies scarce-resource admission.

**Expected:** blocked-by-R7 is not itself R13 failure. The blocked reason remains durable and the occurrence remains pending.

### E3-5 — generic-kernel health substituted for exact path health

The shared Execution Kernel or supervisor is green, but the obligation-specific executor/service path for O1 is dead or stalled.

**Expected:** recovery certification fails for O1's path; aggregate green status cannot substitute.

### E3-6 — duplicate reconstruction causes duplicate reservation demand

Repeated recovery passes or claim recovery produce multiple scheduler rows/claims for the same logical occurrence O1, and each attempts to acquire fresh R7 exposure.

**Expected:** R12 deterministic identity plus C24-03 exact occurrence↔reservation linkage prevent one logical occurrence from acquiring duplicate independent reservation authority merely because process/claim identity changed. A legitimate new successor occurrence requires explicit successor identity and fresh governed admission.

### E3-7 — stale health at progression boundary

At T1, R13 records executor X for O1 as healthy. R12/R7 recovery work proceeds. Before O1 actually resumes consequential processing at T2, X becomes stalled/failed, but the system relies on the persisted T1 health result.

**Expected candidate rule:** health/readiness used to justify resumed processing must be current enough for the actual progression boundary. A reservation may remain held after later health degradation, but stale health must not authorize the executor to continue as though it were still healthy.

This is deliberately narrower than saying R7 reservation creation requires perpetual R13 health. The question is progression/dispatch under stale liveness evidence, not whether an already-created reservation must disappear.

### E3-8 — heterogeneous backlog/executor mismatch

Recovery contains O1 requiring executor path X and O2 requiring path Y. X is healthy; Y is failed. R12 has both occurrences and R7 has capacity for both.

**Expected:** X health cannot be applied to O2 merely because both share the same kernel, work family, or resource pool. Only work whose exact expected path satisfies its liveness predicate may progress.

This is the compound's exact-correspondence attack between occurrence class and health evidence.

### E3-9 — partial resource admission treated as recovery completion

R7 safely admits K of N recovered jobs and the K begin progressing.

**Expected:** the system must not report the entire recovery backlog as completed/cleared merely because admitted work is flowing. R12 retains N-K; R13 health reporting remains truthful about blocked backlog observation.

### E3-10 — blocked backlog becomes invisible while executor still heartbeats

R7 denies O1 repeatedly. Executor X keeps heartbeating but stops observing/updating O1's blocked state.

**Expected:** R13 must not remain indefinitely `HEALTHY` solely from heartbeat. Progress/observation semantics can drive `DEGRADED`, `STALLED`, or `FAILED` according to policy while R12 preserves O1.

### E3-11 — scarce recovery work bypasses R7 because it is safety-critical or overdue

Reconciliation, verification, repair, or other safety work becomes overdue after downtime.

**Expected:** urgency and safety purpose do not create emergency resource authority; all scarce work still passes R7.

### E3-12 — R7 admission borrowed by a different occurrence

O1 receives reservation set R1 under C24-03. O2 is another valid occurrence for the same domain obligation/work type/resource pool.

**Expected:** O2 cannot consume R1 merely because the work appears equivalent. Same-domain membership, same executor, same resource vector, or same backlog batch is not occurrence identity.

## 5. Provisional disposition

**Provisional result: PASS at the Phase-E specification/composition level, subject to live C24-03 and adversarial review of E3-7/E3-8.**

No new primary `MISSING_REQUIRED_COMPOSITION`, `UNRESOLVED_CROSS_NODE_GAP`, ownership defect, or semantic contradiction is presently identified.

The strongest compound-specific additions are:

- current-enough exact-path health must be tested at resumed processing, not inferred from earlier recovery health;
- heterogeneous backlogs must preserve occurrence→expected-executor correspondence rather than accepting any healthy executor in the same kernel;
- safe partial R7 admission is not equivalent to complete backlog recovery;
- duplicate recovery/claim mechanics must not amplify one logical occurrence into multiple independent resource reservations.

## 6. Requested adversarial review

1. **Timing/staleness:** Does E3-7 require a new fixture-tier strengthening, or do R13's progress-aware health semantics plus the R7-owned recovery compound already require health to be current enough at actual resumed processing?
2. **Exact correspondence:** Is there an explicit enough rule binding each R12 occurrence/work class to the exact R13 executor/service-path health evidence used for recovery, or does E3-8 expose a new correspondence strengthening?
3. **Reservation timing:** Is the draft correct not to require R13 `HEALTHY` as a prerequisite for merely *holding* an R7 reservation? Identify any contract text that would require stronger coupling.
4. **Duplicate recovery:** Does C24-03 fully cover E3-6/E3-12, including repeated claims/recovery passes, or is there a distinct three-node duplicate-amplification case where R12 and R7 are locally correct but R13 recovery behavior causes duplicate admission?
5. **Partial recovery accounting:** Does E3-9 require explicit certification state distinguishing `some backlog progressing` from `recovery complete`, or is that already fully entailed by R12's durable pending occurrences plus R13 blocked-work visibility?
6. **Blocked-work health:** Is E3-10 correctly scoped? R7 denial should not itself imply unhealthy, but an executor that ceases observing durable blocked work may become unhealthy even though no resource-consuming progress is possible.
7. **Open Phase-C findings:** Do any of the four MRCs or C21-03 constrain this exact three-node recovery compound, rather than only wider scenarios involving external execution, capability, runtime handoff, or commercial authority?
8. Find any three-node failure mode in which R12 reconstruction, R13 liveness, and R7 admission are each locally correct but the combined outage recovery is still unsafe or falsely reported as complete.

As with Compounds 01 and 02, do not infer the compound PASS from pairwise cleanliness. The test is whether one exact recovered occurrence stays durably present, mapped to the correct current executor health predicate, and admitted only under exact aggregate-safe resource authority throughout restart and burst recovery.