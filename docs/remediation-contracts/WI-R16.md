# WI-R16 — Order-Independent Canonical Financial Reconciliation

**Normalized node:** R16  
**Historical finding:** C3-F4  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

R16 is the interpretation/reconciliation half of the same `C3-F4` root split with R15.

R15 preserves provider-originating financial observations before normalization. R16 consumes the complete immutable R15 observation set and derives canonical financial state deterministically under a versioned reconciliation policy.

R16 must not absorb R15's capture responsibilities, and R15 must not pre-decide R16's semantic interpretation.

Where exact original migration ordinals, fixture labels, provider-specific policy mappings, audit vocabulary, or closure-evidence numbering are unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R16 exists because canonical financial truth must not depend on the order in which provider observations happened to arrive, which worker processed them first, whether a callback raced a poll, or whether a replay occurred.

> **The same complete evidence set under the same reconciliation policy must produce the same canonical financial state, independent of arrival order, retry order, or worker history.**

Full replay from immutable R15 observations is the reference semantics. Incremental reconciliation is acceptable only if it is provably equivalent to replay.

## 3. R15 boundary — immutable evidence in, interpretation out

R16 consumes R15 observations but does not rewrite them.

R16 must preserve the distinction between:

- evidence that was observed;
- semantic interpretation applied to that evidence;
- canonical financial state derived from the interpreted evidence.

A correction in canonical financial state does not retroactively alter the R15 evidence record that led to earlier state.

R16 must consume R15's exact provider/account/execution provenance, value-shape distinctions, redaction provenance, original currency/unit, temporal fields, and provider-native/synthetic identities where relevant.

## 4. Versioned reconciliation policy

Financial interpretation must be governed by an explicit reconciliation policy version.

The policy determines how the complete R15 observation set maps into canonical financial meaning without changing the raw observations themselves.

A policy change must be historically distinguishable. Recomputing under a new policy may revise canonical truth, but must not pretend that the earlier policy or earlier consequential authority never existed.

The exact policy-schema fields are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` unless source review restores them.

## 5. Provider financial semantic classes

R16 must distinguish provider-observation semantics rather than assuming every amount means the same thing.

Recovered semantic classes include:

- `ABSOLUTE`
- `DELTA`
- `CUMULATIVE`
- `REVERSAL`
- informational / non-authoritative-for-balance observations

A provider amount that represents a cumulative total must not be added like a delta. A delta must not overwrite an absolute total. A reversal/adjustment must not be treated as a new independent charge unless the governing provider semantics say so.

The exact storage enum name for the informational class, if one was separately frozen, remains `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`.

## 6. Estimate, final, correction, and precedence semantics

R16 must interpret estimate/final/correction relationships from provider evidence without deleting earlier observations.

The canonical state may change as stronger provider evidence arrives, but precedence must be semantic and deterministic rather than arrival-order based.

Examples:

- an estimate may be superseded by a final under the governing provider policy;
- a later correction may revise a prior final;
- a late-arriving older estimate must not overwrite a stronger final merely because it arrived later;
- provider-issued effective/created times may matter differently from system receive time.

R16 must not infer precedence solely from database insertion order.

## 7. Canonical financial-state family

Recovered canonical financial-state semantics include:

- `RESERVED`
- `INCURRED`
- `SETTLED`
- `ADJUSTED`
- `UNCERTAIN`

These are semantic financial states, not substitutes for R7 reservation records or R8 external execution truth.

A provider execution can be technically successful while financial state remains `UNCERTAIN`, awaiting final provider evidence, corrected later, disputed, or partially reconciled.

## 8. Reconciliation-status family

Recovered reconciliation statuses include:

- `UNRECONCILED`
- `PARTIAL`
- `EXACT`
- `BOUNDED`
- `CONFLICT`
- `AWAITING_FINAL`
- `UNRECONCILABLE`

These statuses describe confidence/completeness of the canonical financial reconciliation, not whether R8 says the provider execution technically succeeded.

Unresolved disagreement or incomplete evidence must not be silently promoted to exact financial truth.

## 9. Deterministic replay and incremental equivalence

Given the same R15 observation set and the same reconciliation-policy version, replay must deterministically reconstruct the same canonical financial result.

Incremental updates are allowed only if repeated processing, reordered processing, duplicate delivery, or restart produces the same result as full replay.

Any incremental shortcut whose result differs from replay is not a valid optimization; it is a semantic defect.

> **Replay is the semantic oracle; incremental reconciliation is an implementation strategy.**

## 10. Idempotency and deduplication

Repeated delivery of the same provider-originating observation must not double-count economic effect.

R16 should prefer R15 provider-native observation identity where available. Synthetic R15 identities may be consumed where no provider-native identity exists, while preserving their non-provider-native provenance.

Deduplication must not collapse two genuinely distinct provider events merely because their values or timestamps resemble each other.

## 11. R8 boundary — technical and financial truth coexist

R8 answers what happened at the provider execution boundary. R16 answers what financial state follows from provider-originating evidence.

These truths are related but not interchangeable.

Examples:

- R8 `SUCCEEDED` may coexist with `AWAITING_FINAL` financial reconciliation;
- R8 uncertainty may coexist with provider-originating cost evidence;
- technical failure does not necessarily prove zero financial impact;
- reconciliation may later discover a charge associated with an execution whose synchronous outcome was lost.

R16 must bind canonical financial interpretation to the exact R8 execution identity through R15 provenance where applicable.

## 12. R7 boundary — reconciliation controls safe headroom movement, not reservation creation

R7 owns reservation/admission and headroom authority. R16 supplies canonical financial truth R7 may consume when deciding whether reserved exposure can be settled or released.

R16 must not create resource authority merely because it computed a number.

Likewise, R7 reservation state must not manufacture incurred/settled truth without R15/R16 evidence.

When financial reconciliation remains `PARTIAL`, `CONFLICT`, `AWAITING_FINAL`, `UNRECONCILED`, or otherwise unresolved, headroom must remain conservative according to R7 policy rather than increasing optimistically.

## 13. Downward corrections and release safety

A later provider correction may reduce canonical incurred or settled amount.

Where that reduction is authoritative under the governing evidence and policy, R16 may revise canonical financial truth downward.

However, downward correction does not itself authorize release of reserved exposure. R7 must consume the reconciled result under its own release rules.

Likewise, an unresolved correction must not increase available headroom merely because one candidate interpretation is lower.

## 14. Shared and unattributed financial evidence

Shared provider costs may not always be immediately attributable to a single Bet, Asset, or execution.

Recovered canonical placeholder:

`UNALLOCATED_SHARED_COST`

R16 must not invent deterministic attribution where evidence cannot support one.

Shared-cost attribution must be causal/deterministic under the governing policy. Unknown attribution remains explicitly unallocated rather than being spread optimistically across arbitrary scopes.

## 15. Projection versus canonical truth

Derived totals, dashboards, Fund summaries, per-Bet totals, and other aggregates are projections of canonical financial state.

If a projection diverges from replayed canonical truth, the discrepancy must become owned rather than silently tolerated.

Recovered owned defect state:

`FINANCIAL_PROJECTION_DRIFT`

Repairing a projection must not mutate the immutable R15 evidence that exposed the drift.

## 16. Reconciliation regression after prior release

A particularly important recovered failure mode occurs when later evidence or policy-correct replay shows that an earlier financial interpretation understated exposure after R7 had already released headroom and that headroom was subsequently redeployed.

Recovered state:

`FINANCIAL_RECONCILIATION_REGRESSION`

The system must preserve:

- the historical fact that release occurred;
- the corrected canonical incurred/settled truth;
- the executed downstream authority that may already have consumed the released headroom;
- the resulting unsupported exposure as an owned remediation condition.

> **Recomputation may revise truth. It may not retroactively erase consequential authority that already executed. Any inconsistency between revised truth and executed history becomes owned remediation.**

R11 must own the corrective disposition. R7 must reduce/freeze headroom conservatively rather than pretending the historical release never happened or increasing headroom while the regression is unresolved.

## 17. R7 × R8 × R15 × R16 compound

The governing composition remains:

> **Reservation safety without durable provider-originating incurred-cost evidence and order-independent canonical reconciliation is incomplete safety. Reserved exposure, external execution truth, and financial observation/reconciliation must compose before headroom can move safely.**

Roles remain distinct:

- R7: admission, reservation, conservative headroom, and release authority;
- R8: exact external-execution truth;
- R15: immutable provider-originating financial evidence;
- R16: deterministic canonical financial interpretation and reconciliation.

## 18. R19 boundary — financial state must retain complete commercial lineage

When financial evidence arises from commercial execution, R16 canonical state must remain linkable through R15/R8 to the complete immutable commercial lineage governed by R19.

A canonical charge without the exact transaction / offer / provider-account / execution lineage needed to explain why it exists is not sufficient for final commercial certification.

R16 does not reconstruct missing commercial authority from current Asset or Offer state.

## 19. R20 boundary — current eligibility versus historical financial truth

R20 may later determine that an execution/result is no longer eligible for new adoption or action.

That does not erase financial truth already incurred.

Historical provider charges, corrections, reversals, and settlements remain part of canonical financial history even if the underlying authority is later revoked for future action.

> **Current ineligibility stops future authority; it does not erase past economic truth.**

## 20. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R16:** NO

R16 must preserve exact provider/account scope inherited from R15 observations and must not reconcile across a different provider/account merely because it satisfies the same logical capability.

If implementation introduces cross-account/provider substitution in reconciliation, DI-1 activates at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R16 reconciliation:** NO

R16 may interpret provider-originating reversal/credit/adjustment evidence. This does not itself authorize Money Scout to dispatch an external refund/cancel/void/reversal.

If Money Scout later dispatches such an operation, DI-2 activates in that external execution scope, with its own R8 execution identity and R15/R16 financial history.

## 21. Known migration surfaces recoverable from record

The available record confirms R16 migration scope includes, at minimum:

- canonical reconciliation-policy representation/versioning;
- canonical financial-state persistence;
- reconciliation-status persistence;
- semantic classification for absolute/delta/cumulative/reversal/informational observations;
- estimate/final/correction precedence;
- deterministic full replay;
- incremental reconciliation equivalence checks;
- provider-observation deduplication/idempotency;
- exact execution/provider/account scoping inherited from R15/R8;
- R7 settlement/release consumers;
- shared/unallocated cost handling;
- projection/aggregate rebuilding and drift detection;
- reconciliation-regression detection after prior release;
- owned remediation handoff into R11;
- semantic audit of order-dependent financial code paths.

Exact migration labels, ordinals, provider-specific interpretation tables, and original per-surface wording remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 22. Semantic sibling sweep

Search for patterns including:

- canonical cost depends on observation arrival order;
- callback-before-poll and poll-before-callback produce different financial result;
- replay differs from incremental state;
- cumulative amount is added as a delta;
- delta overwrites an absolute/cumulative total;
- late estimate overwrites final merely because it arrived later;
- correction mutates R15 raw evidence instead of revising derived canonical state;
- duplicate provider observation double-counts cost;
- dedupe collapses distinct provider observations with similar values;
- R8 success/failure is copied directly into financial state without provider evidence;
- unresolved conflict increases R7 headroom optimistically;
- downward candidate interpretation releases R7 headroom before authoritative reconciliation;
- shared cost is arbitrarily assigned instead of remaining `UNALLOCATED_SHARED_COST`;
- projection drift is silently tolerated;
- replay discovers prior R7 release was too large but historical release/executed downstream authority is rewritten away;
- `FINANCIAL_RECONCILIATION_REGRESSION` has no durable R11 owner;
- current Offer/Asset/account state is used to reconstruct historical financial lineage;
- current R20 ineligibility erases already-incurred financial truth.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 23. Acceptance semantics recoverable from source

At minimum, R16 closure must eventually prove:

- same evidence set + same policy => same canonical financial state regardless of arrival order;
- full replay is deterministic;
- incremental reconciliation is equivalent to replay;
- ABSOLUTE/DELTA/CUMULATIVE/REVERSAL/informational semantics are not conflated;
- estimate/final/correction precedence is semantic rather than insertion-order based;
- canonical financial-state family can represent RESERVED/INCURRED/SETTLED/ADJUSTED/UNCERTAIN;
- reconciliation status can represent UNRECONCILED/PARTIAL/EXACT/BOUNDED/CONFLICT/AWAITING_FINAL/UNRECONCILABLE;
- duplicate delivery does not double-count while distinct events remain distinct;
- R8 technical truth and financial truth coexist without overwriting each other;
- unresolved reconciliation keeps R7 headroom conservative;
- authoritative downward corrections revise truth without themselves granting release authority;
- unknown shared attribution remains `UNALLOCATED_SHARED_COST`;
- projection drift becomes `FINANCIAL_PROJECTION_DRIFT` and is owned;
- later replay that invalidates prior release becomes `FINANCIAL_RECONCILIATION_REGRESSION` without erasing history;
- revised truth and executed history compose through R11/R7 remediation rather than retroactive fiction;
- R19 exact commercial lineage remains linkable where applicable;
- R20 current ineligibility cannot erase historical incurred financial truth.

Original fixture labels/order and exact numbered closure-evidence list remain `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 24. Start / local closure / E2E dependency result

### START

R16 contract/schema work may proceed once R15 immutable observation identity/provenance is stable enough to consume and R7/R8 seams are sufficiently understood. R16 must not redesign R15 capture semantics locally.

### LOCAL CLOSURE

R16 may locally close when policy versioning, semantic classification, deterministic replay, incremental equivalence, canonical state/status, idempotency/deduplication, correction precedence, shared/unallocated handling, projection drift, reconciliation regression, known migrations, audit children, and final sibling sweep are complete.

R7 need not be globally closed for R16 reconciliation logic to exist, but headroom/release certification remains pending until R7 consumes R16 safely. R19/R20 need not be locally closed for generic reconciliation semantics, but commercial E2E certification remains pending where those lineages apply.

### E2E

Final certification must compose with at least R7, R8, R11, R15, R19, and R20 where relevant, including the full `R7 × R8 × R15 × R16` compound.

## 25. Explicit non-goals

R16 must not:

- mutate or normalize away R15 raw evidence;
- redefine R15 value-shape or redaction-provenance semantics;
- infer R8 technical execution truth from financial state;
- grant R7 resource/headroom authority merely by computing canonical state;
- make unresolved financial conflict optimistic;
- let observation arrival order decide financial truth;
- let incremental state diverge from deterministic replay;
- erase historical release/execution when later reconciliation revises truth;
- arbitrarily attribute unknown shared cost;
- reconstruct historical commercial lineage from current mutable state;
- treat current R20 ineligibility as retroactive erasure of incurred financial truth;
- dispatch an external refund/cancel/void/reversal merely because reconciliation says a reversal is economically indicated.

## 26. Source gaps and assurance status

The following original R16 details remain not fully recoverable from the available record and are not being invented:

1. exact schema/storage representation for reconciliation policies and derived state;
2. exact storage enum name for informational observation semantics if separately frozen;
3. exact provider-specific absolute/delta/cumulative/reversal mapping rules;
4. exact migration child labels and ordinals;
5. exact audit name/classification vocabulary if separately frozen;
6. exact acceptance-fixture labels/order;
7. exact closure-evidence list;
8. exact amendment/rejected-alternative wording beyond the recovered invariants;
9. original worked numeric examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R17, but it does not restore R16 implementation authority.

## 27. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
