# Money Scout — Canonical Remediation Work-Item Register v1.0

**Status:** FROZEN IMPLEMENTATION AUTHORITY  
**Scope:** Retroactive remediation roots R1–R20  
**Phase:** Contract-level specification complete; implementation not started; no node is CLOSED by this document.  
**Freeze date:** 2026-09-10

This register is the implementation authority for the normalized remediation graph R1–R20. It consolidates the contracts that survived adversarial review. Implementation may add evidence, migrations, tests, and defect children, but may not silently narrow or reinterpret the frozen root scope.

## 1. What “frozen” means

1. R1–R20 are contract-level CONFIRMED.
2. “CONFIRMED” does not mean implemented, verified, or CLOSED.
3. No implementation may narrow a node because a migration is inconvenient.
4. A scope reduction requires explicit evidence that the removed surface is not an instance of the root because it was corrected, removed, unreachable, superseded, or was never actually in scope.
5. Discovery obligations are not remediation closure. `AUDITED != DEFECT FOUND != DEFECT FIXED`.
6. Primitive existence is not closure. Every known migration and sibling surface must be addressed.
7. Finding compression must never become implementation-scope compression.
8. Historical finding IDs remain attached to normalized roots so original audit findings do not disappear through normalization.
9. Any material amendment to this register follows the Convergence Protocol v1.1 meta-finding path: pause the affected portion, adjudicate, amend explicitly, independently verify the amendment, then resume. Unaffected frozen scope remains frozen.

## 2. The three dependency graphs are distinct

Every work item has three dependency classes. They MUST remain literal fields in implementation planning.

- **START dependencies:** what must exist before implementation of this node may begin.
- **LOCAL CLOSURE dependencies:** what must be CLOSED before this node itself may be declared locally CLOSED.
- **E2E CERTIFICATION dependencies:** what must participate before the node may receive full end-to-end certification.

These are three graphs, not one waterfall. An implementation DAG must preserve the distinction mechanically.

## 3. Independent verification rule

“Independent verification” means a materially independent reviewer source, preferably a different model/provider family or an authoritative deterministic verifier where the conclusion is fully reducible to machine-checkable facts.

The following do NOT satisfy independence by themselves:

- the same implementation agent reviewing its own work under a different prompt;
- the same model/persona in a second turn;
- the same worker asserting its own completion;
- a model-generated material conclusion used as its own sole closure evidence.

Material conclusions follow R5. Workers may propose closure and provide evidence. They may not be the sole judge of material closure.

## 4. Register-level scope protection

The work-item scope invariant applies to this register itself.

Once implementation begins, an implementation PR, agent, or reviewer may not quietly edit a root definition to match what was convenient to implement. A proposed narrowing must identify the exact removed obligation and provide explicit evidence for why that obligation is no longer an instance of the frozen root. Any such amendment is a register-level change subject to independent review.

## 5. Foundational cross-cutting principles

These principles are elevated to architectural axioms because each was independently rediscovered across multiple domains rather than being copied forward from a single local rule.

### P1 — Fail-closed is incomplete if the closed state has no owner

**Rediscovered in:** R11 successor ownership; R6 POLICY_UNKNOWN; R9 SOURCE_AUTHORITY_UNPROVEN; R13 EXPECTATION_UNKNOWN; R15 redaction/financial ambiguity; R16 reconciliation conflict; R17 materiality uncertainty; R19 lineage gaps; R20 unresolved revalidation.

A blocked or unknown state must have a durable bounded disposition when correction is possible.

### P2 — Corrective ownership is not execution authority

**Rediscovered in:** R9 fresh Builder attempts; R11 successor creation; R20 successor revalidation.

R11 can decide and own what happens next. It does not authorize the successor to cross its own consequential boundaries.

### P3 — Recomputation may revise truth; it may not erase consequential authority that already executed

**Rediscovered in:** R8 external execution monotonicity; R9 immutable source snapshots; R14 runtime authority epochs; R16 financial release regression; R19/R20 historical commercial effects.

Later truth creates new state, reconciliation, regression, or successor history. It does not rewrite executed history into “never happened.”

### P4 — Bad news propagates immediately; good news requires proof

**Rediscovered in:** R7 conservative headroom; R15 lost-cost evidence; R16 regression; R20 boundary eligibility.

Uncertainty may reduce permission/headroom. It may not manufacture optimistic authority or capital.

### P5 — External success and internal adoption eligibility are separate facts

**Rediscovered in:** R8 external truth; R10 expected vs observed artifact; R14 runtime ownership vs artifact authority; R17 superseded checkout preparation; R19 lineage completeness; R20 adoption fencing.

An external operation may be historically successful while its result is no longer eligible for canonical adoption.

### P6 — Identity tells you what authority you mean; lineage tells you where it came from; boundary-time fencing tells you whether you may consume it now

**Rediscovered in:** R4 exact originating cycle; R9 exact source; R10 exact artifact; R17 Offer/Grant identity; R19 lineage; R20 eligibility.

No one layer substitutes for another.

### P7 — If the data model cannot represent multiple historically distinct authorities at once, downstream lineage logic cannot make the system historically correct

**Rediscovered in:** R9 repository/source authority cardinality; R19 Commercial Activation cardinality; consumed as mandatory R20-A0 pre-check.

Before trusting versioning or lineage logic, prove the schema can represent the plurality the contract requires.

### P8 — Safety-required work is still work and consumes governed resources

**Rediscovered in:** R5 independent confirmation; R6 verification; R7 reservation/reconciliation; R8 reconciliation; R12 scheduling; R15/R16 financial reconciliation; R20 remote revalidation.

Safety work does not become “free” merely because it exists to make another action safe.

### P9 — Primitive existence is not closure

**Rediscovered in:** R7 shared reservation; R8 provider reconciliation; R10 Artifact Version; R11 successor obligations; R19 lineage primitive; R20 boundary registry.

A primitive closes nothing until all known migrations, semantic sibling surfaces, and required compound tests pass.

### P10 — Finding compression must never become implementation-scope compression

**Rediscovered in:** merged R7 root; R8 multi-surface external truth; R11 obligations; R19 commercial lineage; R20 cross-factory boundary sweep.

Normalization reduces conceptual duplication, not the number of concrete places that must be migrated.

## 6. Global work-item decomposition rules

1. Preserve exact normalized root plus historical finding IDs.
2. Do not reinterpret a confirmed root absent contradictory evidence.
3. Keep START / LOCAL CLOSURE / E2E dependencies separate.
4. Finding compression never compresses implementation scope.
5. Primitive existence is not closure.
6. Compound requirements are first-class acceptance gates.
7. Material closure uses independent confirmation as defined above.
8. Every work item records Design Input review and scope-aware consumption status.
9. Umbrella pattern: shared primitive -> named known migrations -> known-site tests -> semantic sibling sweep -> new child migrations -> repeat -> independent review.
10. A work item may not narrow scope without evidence that the removed surface is corrected, removed, unreachable, superseded, or not an instance.
11. Audits inspect. Defect children repair. `AUDITED != DEFECT FOUND != DEFECT FIXED`.
12. Safety-required secondary work consumes R7 resources where scarce.
13. Conservative defaults survive future enum/type growth. Unknown new states fail closed until policy explicitly admits them.

## 7. Normalized remediation graph

| Root | Severity | Historical finding(s) | Frozen mission |
|---|---|---|---|
| R1 | MATERIAL | C3-F2 | Make resource attribution semantically truthful before safety checks. UNKNOWN is not zero and is not every bucket. |
| R2 | MATERIAL | C4-F1 | Preserve unresolved economic/operational uncertainty through capability resolution instead of erasing it with a convenient implementation choice. |
| R3 | MATERIAL | C1-F5 | Make evidence freshness domain-aware; collection time is not source publication/update time. |
| R4 | MATERIAL | C1-F3 | Preserve exact originating Evaluation Cycle lineage; never reconstruct authority from the current cycle. |
| R5 | MATERIAL | C1-F4 | Prevent material conclusions from self-certifying closure. |
| R6 | MATERIAL | C1-F8 | Make capability readiness a canonical adjudicated claim using the strongest applicable verifier. |
| R7 | BLOCKER | C1-F1 + C2-F2 + C2-F3 + C3-F1A; C3-F1B remains conditional sibling scope | Atomically reserve every scarce resource across all relevant aggregate scopes before consequential autonomous dispatch. |
| R8 | BLOCKER | C1-F2 + C2-F1 | Preserve durable external-boundary truth and reconcile exact external effects before retry/release/adoption. |
| R9 | BLOCKER | C4-F4 | Bind every Build to an exact immutable Build Source Snapshot rather than mutable repository/branch authority. |
| R10 | BLOCKER | C4-F3 | Preserve exact Artifact identity Builder -> QA -> Release -> Asset. |
| R11 | MATERIAL | C4-F2 | Give every bounded non-terminal corrective need a durable executable owner/successor. |
| R12 | MATERIAL | C1-F7 | Make future obligations durable across process death, restart, timer loss, replacement, and downtime. |
| R13 | BLOCKER | C2-F5 | Prevent “healthy” claims when required executors are dead, stalled, wedged, or not progressing. |
| R14 | MATERIAL | C2-F4 | Make planned runtime replacement drain, quiesce, and transfer ownership without losing in-flight truth or authority identity. |
| R15 | MATERIAL | C3-F5 | Capture provider-originating financial facts durably before validation, normalization, rejection, or accounting interpretation. |
| R16 | MATERIAL | C3-F4 | Make financial reconciliation deterministic and order-independent over the same durable evidence set. |
| R17 | BLOCKER | C3-F3 | Bind commercial authority to an exact immutable Offer Version and exact Grant. |
| R18 | MATERIAL | C5-F3 | Revalidate frozen capability bindings predispatch after capability/provider/account lifecycle changes. |
| R19 | BLOCKER | C5-F1 | Preserve complete immutable commercial authority lineage from decision through customer transaction and economic evidence. |
| R20 | BLOCKER | C5-F2 | Revalidate complete authority at every consequential dispatch and result-adoption boundary. |

> Register-integrity note: historical IDs are immutable traceability metadata. Any mismatch discovered against the original frozen cluster record is a clerical/meta-finding correction, not permission to reinterpret the normalized root.

## 8. Node authority matrix

The fields below are implementation-planning authority. “Start” means implementation may begin; “Local close” means required for node-local CLOSED; “E2E” means required for full certification.

### R1 — Semantic Resource State

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** none beyond frozen schema evidence.
- **Local close:** typed resource attribution primitive; migrations across known resource surfaces; UNKNOWN semantics; UI migration; sibling sweep.
- **E2E:** R1×R2×R7 combined certification.
- **Known migrations:** source -> bucket -> unit -> committed -> consumed -> timestamp/provenance; UI/resource consumers; unknown/headroom semantics.
- **DI:** DI-1 reviewed, no generic activation; DI-2 not activated.
- **Closure core:** additional headroom cannot increase merely because a committed ceiling was not consumed; R1 defines semantics only, not reservation authority.

### R2 — Capability Resolution Preserves Uncertainty

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R1 vocabulary compatibility can proceed in parallel.
- **Local close:** Capability Resolution Outcome family; cost knowledge `KNOWN/UNKNOWN/NOT_APPLICABLE/KNOWN_ZERO`; dependency/operational uncertainty preserved; migration of all capability resolution surfaces.
- **E2E:** R1×R2×R7; R2×R11; R2×R4×R11.
- **DI:** DI-1/DI-2 not activated generically.
- **Closure core:** custom build or fallback selection cannot erase UNKNOWN. Lifecycle is provenance, not capability authority.

### R3 — Evidence Freshness

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can begin independently.
- **Local close:** canonical fields for collection/source published/source updated/temporal knowledge/freshness policy/status; Shared Evidence Consumer Audit and all defect children.
- **E2E:** R3×R20; R3×R4; R3×R4×R20; R3×R5 where material conclusions consume evidence.
- **DI:** no generic activation.
- **Closure core:** current-condition claims cannot be decision-sufficient when temporal applicability is stale or unknown.

### R4 — Exact Evaluation Lineage

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can begin independently.
- **Local close:** Evaluation Lineage Reference; exact originating cycle propagation; legacy unknown handling; downstream lineage audit.
- **E2E:** R4×R9; full R4→R9→R10→R17→R19→R20 chain; R3×R4×R20.
- **DI:** no generic activation.
- **Closure core:** stale/unknown lineage fails closed; humans cannot attest unknown history into existence.

### R5 — Independent Material Closure

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can begin independently.
- **Local close:** materiality default; candidate vs confirmed; outcomes CONFIRMED/CHALLENGED/INCONCLUSIVE; durable Resolution Confirmation Record; material closure audit; legacy unconfirmed handling.
- **E2E:** R5×R11; R5×R17×R20; R3×R5.
- **DI:** no generic activation.
- **Closure core:** the actor/model producing a material conclusion may provide evidence but may not be its sole confirmer.

### R6 — Capability Verification Authority

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can begin independently.
- **Local close:** Capability Verification Policy Registry; durable evidence/result; states POLICY_UNKNOWN / VERIFICATION_PENDING / VERIFICATION_FAILED / HUMAN_AUTHORITY_CONFIRMED / AUTOMATION_READY; all capability consumers audited.
- **E2E:** R6×R7; R6×R18; R6×R20; R6×R17×R19×R20.
- **DI:** DI-1 activates only for concrete simultaneous provider/account identity scopes; otherwise scoped status remains independent.
- **Closure core:** weak evidence cannot manufacture stronger machine authority.

### R7 — Atomic Scarce-Resource Reservation

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R1/R2 contract semantics available; implementation of shared reservation primitive may start once exact scope model is frozen.
- **Local close:** aggregate scopes Fund/provider/entitlement/portfolio/Bet/stage/Asset/shared org/concurrency; deterministic lock order; atomic Economic Action + reservation + execution linkage; commit-time authority-state atomicity; all autonomous scarce-operation surfaces audited/migrated.
- **E2E:** R1×R2×R7; R7×R8; R7×R15 live-exposure certification; R7×R8×R15×R16; R7×R15×R16×R20; outage/burst scenarios.
- **DI:** DI-1 reviewed at shared identity seams; DI-2 not activated generically.
- **Closure core:** reservation states HELD / COMMITTED-IN_FLIGHT / PARTIALLY_CONSUMED / SETTLED / RELEASED / UNCERTAIN; UNKNOWN consumes headroom; stop/timeout/lease loss never proves release.

### R8 — Durable External Boundary Truth

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can implement provider-boundary primitive alongside R7, respecting R7 linkage contract.
- **Local close:** durable attempt identity; boundary transition before provider call; provider result identity; exact reconciliation classes; predispatch abandonment proof; no blind retry/release; migrations across Builder/QA/Release/remediation/repo provisioning and sibling surfaces.
- **E2E:** R7×R8; R8×R14; R7×R8×R15×R16; R8×R17×R19×R20.
- **DI:** DI-1 exact provider/account, no substitution; DI-2 activates for reversals only.
- **Closure core:** cancel request != cancelled; `EXPOSURE_COMMITTED_UNRECONCILABLE` only when provider boundary crossed, synchronous outcome lost, and provider state cannot be reconciled.

### R9 — Immutable Build Source Snapshot

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R4 exact lineage contract.
- **Local close:** immutable snapshot of repo identity/base SHA/ref/manifests/Product/Architecture/Build lineage/fingerprint; Builder proves checkout; branch context never authority; legacy branch-only rows fail closed; all source-authority surfaces migrated.
- **E2E:** R4×R9; R9×R10; full hard chain.
- **DI:** none generically.
- **Closure core:** resource unavailability never authorizes fallback to current HEAD; replacement/runtime handoff never re-resolves current branch.

### R10 — Exact Artifact Identity

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R9 source identity contract.
- **Local close:** Artifact Version / Verified Artifact Identity; QA verdict bound exact artifact; Release binds exact passing artifact; Asset stores exact production version/deployment; expected vs observed runtime artifact mismatch blocks.
- **E2E:** R9×R10×R17; full hard chain; R10×R14.
- **DI:** none generically.
- **Closure core:** rebuild creates a new identity unless authoritative equivalence is proven; observation cannot redefine expected authority.

### R11 — Durable Corrective Ownership

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** can begin after core execution-job/successor vocabulary is known; does not require R12/R13 CLOSED.
- **Local close:** durable successor obligation classes; deterministic successor identity; exact predecessor/defect provenance; unknown scope becomes owned adjudication obligation; bounded replan/termination-request semantics; independent completion predicate.
- **E2E:** R11×R12; R11×R5; R11×R8; R11×R14; R11×R20 successor-not-preauthorized fixture.
- **DI:** scope-specific review on each successor type.
- **Closure core:** deciding a successor does not grant the successor execution authority.

### R12 — Durable Future Obligations

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** Execution Kernel substrate available; can proceed in parallel with other workstreams.
- **Local close:** due/runnable obligation state durable outside process; WATCH domain + execution jobs; deterministic/idempotent successor reconstruction; wake mechanisms may multiply, canonical obligations may not.
- **E2E:** R12×R13; R12×R13×R7 outage/burst; R14 compatibility/handoff.
- **DI:** no generic activation.
- **Closure core:** correctness is a property of durable data, not of a process-local timer transaction.

### R13 — Executor Liveness

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R12 durable obligation model may be developed in parallel; expectation registry can start early.
- **Local close:** Executor Expectation Registry; runtime/executor/service-path/execution-authority health dimensions; durable heartbeats/progress/failures/counts/leases; REQUIRED/OPTIONAL/INTENTIONALLY_DISABLED/NOT_APPLICABLE; UNKNOWN conservative aggregation.
- **E2E:** R12×R13; R12×R13×R7 outage; R14 successor readiness.
- **DI:** no generic activation.
- **Closure core:** process HTTP health or generic Kernel health cannot imply every required obligation path is serviceable.

### R14 — Planned Runtime Replacement

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R8/R12/R13 contracts available; implementation can overlap once handoff substrate is identified.
- **Local close:** runtime authority epoch; incumbent ACTIVE→DRAINING→QUIESCED→HANDOFF_READY→RETIRED semantics; successor readiness; quiescence proof; compatibility predicate; bounded readiness timeout; resumability adjudication; production shutdown/drain migrations across all workers.
- **E2E:** R8×R14; R10×R14; R12×R13×R14; R14×R19×R20 runtime-handoff fixtures.
- **DI:** DI-1 narrow activation if provider/account executor identity is rebound; DI-2 not generically activated.
- **Closure core:** timeout does not itself authorize incumbent resumption; after authority transfer rollback is a new epoch, never a rewind.

### R15 — Raw Provider Financial Evidence

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R7/R8 identity contracts available; may implement before R16.
- **Local close:** append-only Provider Financial Observation; exact execution/provider/account provenance; legitimate observation-path append authority; invalid/unparseable evidence preservation; entitlement facts; estimate/final/correction identity; provider-native IDs preferred; synthetic fallback marked; redaction provenance; full provider-financial surface audit.
- **E2E:** R7×R15 live-exposure certification; R7×R8×R15; R15×R16; R7×R8×R15×R16.
- **DI:** DI-1 exact account scoping where financial evidence uses shared provider identity; DI-2 not activated by observing refunds/credits.
- **Closure core:** a worker may lose authority to mutate accounting while retaining narrow authority to append provider evidence it genuinely observed for the exact execution it legitimately handled.

### R16 — Deterministic Financial Reconciliation

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R15 durable-observation contract; implementation of interpretation/reconciliation layer may proceed once observation schema is stable.
- **Local close:** Financial Reconciliation Result; typed ABSOLUTE/DELTA/CUMULATIVE/REVERSAL semantics; policy-versioned interpretation; evidence-set recomputation; downward corrections; conflict ownership; projection rebuild; deterministic same-evidence/same-policy result; `FINANCIAL_RECONCILIATION_REGRESSION`.
- **E2E:** R15×R16 permutation certification; R7×R8×R15×R16; R16×Fund; R15+R16→R19 full certification; R7×R15×R16×R20.
- **DI:** exact provider/account scoping; DI-2 only if autonomous reversal execution is introduced.
- **Closure core:** recomputation may correct current truth but may not rewrite an R7 release already executed; unsupported released headroom becomes an owned reconciliation regression.

### R17 — Exact Offer Version and Charging Grant

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R10 exact artifact identity and R4 lineage contracts; R15/R16 may proceed in parallel.
- **Local close:** immutable Commercial Offer Version; exact Offer fingerprint/material fields; exact R10 artifact/Release and R4/Bet/Product lineage; Commercial Authority Grant bound exact Offer/provider/account; checkout configuration binding; successor Offer semantics; revocation history; recurring customer Offer identity; R5-confirmed commercial-equivalence rule.
- **E2E:** R9×R10×R17; R5×R17×R20; R17×R19; R17×R19×R20 supersession races.
- **DI:** `DI-1/COMMERCIAL_PAYMENT = ACTIVATED / CONSUMED`. Other DI-1 scopes remain independently dormant unless separately triggered. DI-2 not activated unless refund/void/cancel/reversal execution enters scope.
- **Closure core:** charging authority applies to one exact immutable Offer Version, not to an Asset, mutable activation, price provenance, or “current Offer.”

### R18 — Predispatch Capability-Binding Revalidation

- **Status:** CONFIRMED ROOT / CONTRACT TO IMPLEMENT; no reinterpretation permitted.
- **Start:** R6 canonical capability readiness and provider/account identity contracts.
- **Local close:** every frozen capability binding used by consequential work is revalidated against current provider/account/capability lifecycle immediately before dispatch; stale binding detection and owned disposition; all capability-bound execution surfaces migrated.
- **E2E:** R6×R18; R18×R20; provider/account lifecycle races.
- **DI:** scope-aware DI-1 activation wherever a binding can resolve among multiple provider/account identities; DI-2 only for reversal-capable execution paths.
- **Closure core:** capability identity captured earlier is not permanent authority to dispatch after provider/account lifecycle changes.

### R19 — Complete Commercial Authority Lineage

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** R4/R9/R10/R17 contracts; schema work may begin before R15/R16 close.
- **Local close:** Commercial Authority Lineage Reference/fingerprint; exact Evaluation Cycle/Bet/Product/source/artifact/release/Asset/Offer/Grant/provider-account edges; checkout/customer-contract/transaction lineage; per-lineage Commercial Activation cardinality; legacy reconstruction provenance; Asset operating-mode adoption lineage; full commercial lineage audit.
- **Local-close financial gate:** live full financial certification requires R15 + R16 CLOSED.
- **E2E:** R4×R9×R10×R17×R19; R15×R16×R19; R14×R19; R17×R19×R20.
- **DI:** `DI-1/COMMERCIAL_PAYMENT` continued consumption only; unrelated DI-1 scopes remain independent. DI-2 not activated by observation.
- **Closure core:** commercial authority is a chain, not a bag of compatible records. Commercial Activation must be per-lineage, not unique mutable state per Asset.

### R20 — Boundary-Time Authority Revalidation

- **Status:** CONFIRMED / NOT IMPLEMENTED.
- **Start:** boundary-registry/decision substrate may begin once upstream identity/lineage contracts are frozen; behavioral closure depends on upstream semantics.
- **Local close:** R20-A0 Authority Representability Audit first; Boundary Authority Policy Registry; Authority Boundary Decision; separate predispatch and adoption decisions; current R3/R6/R7/R17/R19/lifecycle/runtime predicates; authority regression detection; full consequential-boundary audit; all discovered representation and behavior children closed.
- **E2E:** R3×R4×R20; R5×R17×R20; R6×R17×R19×R20; R7×R15×R16×R20; R8×R17×R19×R20; R14×R19×R20; full R4→R9→R10→R17→R19→R20 chain; representative full-Factory boundary suite.
- **DI:** continue `DI-1/COMMERCIAL_PAYMENT`; every other audited DI-1 scope decided independently. Any autonomous reversal boundary activates `DI-2/COMMERCIAL_REVERSAL` before execution.
- **Closure core:** every consequential dispatch consumes fresh authority; every later adoption of an external result consumes authority again. A preflight PASS cannot authorize either later boundary.

## 9. Hard dependency chains and compounds

### 9.1 Exact authority chain

`R4 -> R9 -> R10 -> R17 -> R19 -> R20`

This is the principal end-to-end identity/authority chain.

### 9.2 Financial truth chain

`R1/R2 semantics -> R7 reservation -> R8 boundary truth -> R15 raw financial evidence -> R16 deterministic reconciliation -> Fund authority`

R15 + R16 are required for full R19 financial-lineage certification.

### 9.3 Durable obligation/liveness chain

`R11 -> R12 -> R13 -> R14`

Corrective need -> owned obligation -> durable scheduling -> executor liveness -> safe runtime handoff.

### 9.4 Mandatory compounds

The following are first-class certification gates, not optional integration tests:

- R1×R2×R7 truthful resources + preserved UNKNOWN + fail-closed reservation.
- R7×R8 release only after authoritative external-boundary evidence.
- R7×R15 live-exposure certification: lost observations must never manufacture headroom.
- R7×R8×R15×R16 complete money-truth chain.
- R3×R4×R20 exact originating lineage + current temporal applicability.
- R5×R17×R20 independent commercial-equivalence confirmation before authority inheritance.
- R6×R17×R19×R20 exact provider/account capability + Offer lineage + boundary eligibility.
- R9×R10×R17 exact source -> verified artifact -> commercial proposition.
- R4×R9×R10×R17×R19 full historical authority lineage before freshness.
- R8×R17×R19×R20: `SUCCEEDED` + `LINEAGE_COMPLETE` + `ADOPTION_INELIGIBLE` can all be true simultaneously.
- R12×R13×R7 outage/burst behavior.
- R14×R19×R20 runtime handoff preserves lineage but resets authority freshness.
- N-session concurrent lifecycle/kill fixture using genuinely distinct durable identities, never sequential reuse of one mutable row.

## 10. Design Inputs

### DI-1 — Multi-provider/account capability identity

Design Input status is scope-specific.

- `DI-1/COMMERCIAL_PAYMENT`: ACTIVATED and CONSUMED by R17; continued through R19/R20.
- Builder, QA, Release, and other scopes remain independently DORMANT unless their own triggering conditions occur.
- Consumption in one scope never resolves DI-1 globally.
- No generic resolver may silently substitute one provider/account for another.

### DI-2 — Outbound payment reversal execution

- DORMANT for ordinary observation/reconciliation of refunds, credits, adjustments, cancellations, or provider status.
- ACTIVATES for autonomous external refund, void, reversal, or cancellation with monetary effect.
- Once activated, must be consumed before execution and must inherit R17/R19/R20 authority lineage, R8 external-boundary truth, R7 resources, and applicable R15/R16 financial evidence semantics.

## 11. Standing implementation audits

Every implementation batch must preserve these obligations:

1. **Known migrations are named children.** Do not hide known defects inside a generic audit.
2. **Sibling sweep follows known migrations.** New defects become durable child work items.
3. **Schema plurality pre-check.** Before trusting lineage/version logic, confirm the schema can represent concurrent/historical distinctions.
4. **Boundary registration discipline.** Every newly introduced consequential action must declare a Boundary Authority Policy and invoke the canonical R20 dispatch/adoption gate before shipping.
5. **Residual limitation acknowledged.** R20 cannot runtime-enforce against future code that never calls it. Repository/CI/code-review governance must preserve coverage.
6. **New R11 successors are fresh actions.** They do not inherit boundary authorization from the adjudication that created them.

## 12. Closure protocol

A node may be marked `CLOSED` only when all of the following are satisfied:

- implementation SHA(s) identified;
- schema/migration SHA(s) identified where applicable;
- every named migration child PASS;
- node-specific mandatory audit complete;
- every discovered defect child CLOSED;
- local acceptance fixtures PASS;
- all required local compounds PASS;
- Design Input review/consumption evidence complete;
- sibling sweep returns no unresolved in-scope defect;
- closure independently verified under §3.

Full E2E certification is recorded separately from local closure. A node can be locally CLOSED while an E2E dependency remains pending; it cannot be represented as fully certified until the E2E graph passes.

## 13. Implementation-mode transition

Specification is complete. From this point the authorized sequence is:

1. derive the START graph;
2. derive the LOCAL CLOSURE graph;
3. derive the E2E CERTIFICATION graph;
4. schedule implementation batches using START dependencies without collapsing the system into an accidental waterfall;
5. implement shared primitives and named migrations;
6. run local closure suites and sibling sweeps;
7. obtain materially independent closure verification;
8. run cross-node compounds and full Factory E2E certification;
9. only then mark nodes CLOSED/certified.

No new architecture should be invented during implementation unless implementation evidence exposes a real defect, contradiction, Design Input activation, or missing representational requirement. Such discoveries become explicit governed amendments or child migrations, never quiet local reinterpretations.

---

**Frozen status:** `R1–R20 — CONTRACT-LEVEL REMEDIATION REGISTER COMPLETE`  
**Implementation status:** `NOT IMPLEMENTED / NOT CLOSED`  
**Authority:** This document governs remediation implementation until explicitly superseded through the Convergence Protocol amendment process.
