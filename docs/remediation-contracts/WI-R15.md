# WI-R15 — Preserve Provider-Originating Financial Observations Before Interpretation

**Normalized node:** R15  
**Historical finding:** `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD`  
**Severity:** MATERIAL  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R15 recovery from the confirmed material still available in the project record. It preserves only obligations recoverable with high confidence and does not regenerate missing historical finding IDs, exact enum/storage representation, migration ordinals, fixture labels/order, provider-specific schemas, audit vocabulary, or closure-evidence numbering from compressed summaries.

R15 is the raw-evidence half of the financial truth chain. It must preserve provider-originating financial facts before R16 interprets or reconciles them.

Where exact historical text is unavailable, the gap is marked rather than inferred.

## 2. Frozen root and mission

R15 exists because provider financial evidence must not be rejected, normalized, clamped, aggregated, or semantically rewritten before the original observation is durably preserved.

A provider can report cost, usage, entitlement consumption, correction, reversal-like adjustment, estimate, final value, or other financial evidence that is inconvenient, malformed, late, contradictory, or larger than the system expected. That is precisely when preserving the original observation matters most.

> **Provider-originating financial facts must be durably captured in their original observed form, with exact execution/provider/account provenance, before validation, normalization, aggregation, rejection, or policy interpretation can change how the system sees them.**

R15 therefore owns append-only provider financial observation capture. R16 later owns semantic interpretation and deterministic reconciliation.

## 3. Canonical Provider Financial Observation

R15 requires a durable Provider Financial Observation or equivalent canonical object capable of preserving, where applicable:

- exact R8 execution identity;
- provider identity;
- exact provider-account identity;
- provider-native observation / charge / usage / invoice / event identity where available;
- observation provenance sufficient to show how the system legitimately obtained the evidence;
- raw provider payload or a lossless canonical representation of the financially relevant fields;
- provider-reported amount/value without local clamping;
- original currency/unit;
- whether the observation is estimated, final, corrective, supplemental, or otherwise provider-qualified where the provider itself supplies that fact;
- provider event/effective time where available;
- provider created/issued time where available;
- system received time;
- canonical persisted time;
- raw null/absence/unparseable distinctions;
- source method / transport / response provenance where needed to establish observation legitimacy;
- provider resource/run/request identifiers needed to bind the observation to the exact execution.

The exact database schema may differ, but the semantic information must remain representable without forcing premature interpretation.

## 4. Preserve value-shape distinctions

R15 must preserve distinctions that are easy to destroy during eager normalization.

At minimum, the raw-observation layer must be able to distinguish:

- explicit zero;
- positive or negative numeric value;
- `null`;
- absent / field not supplied;
- not applicable where the provider explicitly says so;
- unknown where the system cannot determine meaning;
- unparseable raw value;
- provider-supplied string/structured value that has not yet been semantically interpreted.

A zero must not silently become “missing.” Missing must not silently become zero. Unparseable must not silently become unknown if the raw value can still be preserved.

> **Observation preservation comes before semantic convenience.**

## 5. Original currency and unit must survive capture

R15 must preserve the currency/unit actually reported by the provider.

Currency conversion, normalization to a fund currency, entitlement-to-dollar approximation, unit conversion, or other canonicalization belongs to later interpretation/reconciliation logic, not raw observation capture.

If a provider reports USD, credits, tokens, requests, seats, minutes, build units, or another scarce-resource unit, that original unit must remain recoverable even if later policy maps it to another accounting representation.

## 6. Provider time and system time are distinct

R15 must not collapse provider timing into “when Money Scout happened to receive the data.”

Where available, preserve separately:

- provider effective time;
- provider created/issued time;
- system received time;
- canonical persisted time.

A late-arriving observation may describe an earlier financial event. A correction issued today may revise a provider event from yesterday. These temporal facts must remain distinguishable so R16 can reconcile deterministically rather than infer chronology from arrival order.

## 7. Provider-native identity is preferred; synthetic fingerprint is explicit

Where the provider supplies a stable native identity for a financial observation, that identity should be preserved and preferred for deduplication/provenance.

If no provider-native identity exists and the system must derive a synthetic fingerprint, the observation must explicitly record that the identity is synthetic and which source fields/method produced it.

Synthetic identity must not be presented as provider-authoritative identity.

The exact original fingerprint algorithm, if separately frozen, remains `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until source review confirms it.

## 8. Append-only financial evidence

Provider financial observations are historical evidence.

Later observations may correct, supersede, refine, finalize, or contradict earlier ones, but R15 must not rewrite the earlier observation out of history merely because a newer one exists.

Examples include:

- estimate followed by final charge;
- preliminary usage followed by corrected usage;
- provider adjustment after settlement;
- duplicate-looking observations that later prove semantically distinct;
- late provider event arriving after local execution already completed.

> **Corrections append evidence; they do not erase the evidence that previously existed.**

R16 may derive a new canonical financial state from the full observation set, but that is distinct from mutating the R15 evidence layer.

## 9. Evidence-append authority comes from genuine observation

A subtle recovered requirement is that canonical observation append authority does not come merely from knowing an execution ID.

A component may append provider financial evidence only when it can prove legitimate observation of that evidence for the exact execution/provider/account context.

Examples of legitimate provenance may include:

- the worker that actually received the provider response;
- a provider callback/webhook whose authenticity and exact execution linkage are established;
- an authoritative provider reconciliation/fetch path bound to the same provider/account/execution scope;
- another governed observer whose provenance envelope proves genuine participation in or observation of the exact provider interaction.

> **Evidence-append authority is inherited from genuine observation of the exact execution, not possession of an execution ID.**

An arbitrary process that merely knows `executionId = X` must not be able to manufacture canonical provider financial evidence for X.

## 10. The stale-worker observation gap

R15 must handle the case where a worker legitimately observes provider financial evidence but loses its execution lease/claim before it can perform some later state transition.

Lease loss does **not** erase the fact that the worker genuinely observed the provider response.

If the observation provenance envelope proves legitimate participation in that exact execution, the system must still have a safe path to append the immutable provider observation, even if the worker is no longer authorized to continue executing the job.

This is distinct from granting the stale worker broader execution authority.

> **Losing execution authority after observation must not force the system to lose evidence already genuinely observed.**

Conversely, stale-worker status must not permit fabricated evidence: the observation provenance still has to prove genuine exact-execution participation.

## 11. Authorization ceilings do not clamp provider-reported facts

A provider can report a financially relevant value that exceeds the amount the system intended, reserved, expected, or authorized.

R15 must preserve the provider-reported fact as observed.

The system must not rewrite a provider-reported $12.40 charge into $10.00 merely because $10.00 was the authorization ceiling. The excess may indicate provider behavior, system defect, policy violation, duplicate execution, delayed correction, or another incident. R16/R7/R11 may need to react, but the raw evidence must remain $12.40 if that is what the provider actually reported.

> **Authorization bounds constrain what the system may authorize. They do not redefine what the provider reports happened.**

## 12. R8 boundary — exact external execution provenance

R8 owns external-execution truth. R15 owns financial observations about that exact execution.

Every provider financial observation that concerns a consequential provider operation must bind to the exact R8 execution identity where that identity exists.

A provider-side financial observation can be received even when the synchronous execution outcome was lost locally. That observation is evidence about the exact provider interaction; it does not by itself resolve every R8 execution-state question.

Likewise, R8 technical `SUCCEEDED`, `FAILED`, or uncertain states do not by themselves determine the final financial amount.

Technical execution truth and financial observation truth must coexist without one overwriting the other.

## 13. R7 boundary — reservation safety is incomplete without durable incurred evidence

R7 governs scarce-resource reservation/admission. R15 provides provider-originating financial evidence needed to know what was actually incurred or consumed.

R7 reservation amount is not a substitute for provider observation.

A reservation may be:

- larger than actual provider cost;
- smaller than provider-reported cost because something went wrong;
- cash-denominated while the provider also reports entitlement usage;
- still held because external outcome is unresolved;
- eventually releasable only after authoritative financial interpretation/reconciliation.

Absence of an R15 observation is not proof that no cost occurred.

> **Reservation safety without durable provider-originating incurred-cost evidence is incomplete safety.**

R7 must not release headroom merely because no convenient financial row exists if the provider boundary may have been crossed and financial truth remains unresolved.

## 14. R16 boundary — capture versus interpretation

R15 captures immutable evidence. R16 interprets the full evidence set under a versioned reconciliation policy.

R15 must not decide whether a value means:

- absolute total;
- delta;
- cumulative total;
- reversal/adjustment;
- informational-only amount;
- final versus provisional precedence;
- canonical incurred versus settled versus adjusted state.

Those semantics belong to R16 unless the provider itself supplies an explicit raw semantic qualifier, in which case R15 preserves the qualifier as observed while R16 decides how it affects canonical state.

> **R15 preserves what the provider said. R16 decides what the complete evidence set means.**

## 15. R7 × R8 × R15 × R16 compound

The recovered governing composition is:

> **Reservation safety without durable provider-originating incurred-cost evidence and order-independent canonical reconciliation is incomplete safety. Reserved exposure, external execution truth, and financial observation/reconciliation must compose before headroom can move safely.**

The nodes remain distinct:

- R7: what scarce resource exposure was admitted/reserved and when it may be released;
- R8: whether/how the provider boundary was crossed and what exact execution exists;
- R15: what provider-originating financial facts were durably observed;
- R16: what canonical financial state follows from the complete evidence set under the governing policy.

No one node may impersonate the others.

## 16. Entitlements and non-cash provider facts are first-class

R15 is not limited to dollar charges.

Provider observations may concern:

- subscription credits;
- build minutes;
- token/request quotas;
- seats/concurrency;
- included units;
- promotional or committed credits;
- provider-reported quota consumption;
- other scarce entitlement facts.

A zero-incremental-cash provider action can still create materially important R15 evidence because entitlement consumption affects R7 headroom and future availability.

## 17. Estimates, finals, and corrections all remain evidence

If a provider supplies an estimate and later a final amount, both observations remain preserved.

If a provider later corrects the final amount, the correction also remains preserved.

R15 must not prematurely discard the estimate merely because a final arrives, or overwrite the prior final merely because a correction arrives.

R16 decides precedence and canonical state from the full observation set.

## 18. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R15:** NO

R15 must preserve exact provider/account identity on every provider financial observation. That requirement alone does not activate DI-1's capability-substitution design input.

However, reconciliation or evidence collection must never silently fetch financial evidence from a different provider/account merely because it satisfies the same logical capability. If implementation begins allowing such substitution, DI-1 activates at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R15 observation capture:** NO

R15 may observe provider-originating evidence about refunds, voids, credits, reversals, or corrections if such events exist. Merely preserving that evidence does not activate autonomous reversal authority.

DI-2 activates when Money Scout itself dispatches an external economic refund/cancel/void/reversal operation. That operation then receives its own R8 execution identity and its own R15 financial observations.

A reversal observation must not retroactively erase the original execution or its original financial evidence.

## 19. Known migration surfaces recoverable from record

The available record confirms R15 migration scope includes, at minimum:

- canonical Provider Financial Observation schema;
- provider execution response capture;
- provider reconciliation/fetch paths that can return financial evidence;
- callback/webhook financial observation ingestion where applicable;
- provider/account/execution provenance binding;
- raw value/currency/unit preservation;
- provider-effective / provider-created / received / persisted time separation;
- estimate/final/correction append behavior;
- provider-native identity / synthetic fingerprint provenance;
- stale-worker evidence append path;
- entitlement/non-cash financial observation capture;
- financial logging paths that currently retain evidence only in ephemeral logs;
- validation paths that currently reject or discard financially relevant provider facts before canonical persistence;
- semantic audit of any provider adapter that normalizes, clamps, aggregates, or drops financial evidence before append-only capture.

Exact migration labels, ordinals, and full per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 20. Semantic sibling sweep

Search for patterns including:

- provider cost/usage value is validated before raw evidence is durably stored;
- provider amount is clamped to reservation/authorization ceiling;
- zero is collapsed into null/missing;
- null/missing/unparseable values are conflated;
- original currency/unit is discarded after conversion;
- provider event time is replaced by receive time;
- later final/correction overwrites an earlier provider observation;
- synthetic observation identity is presented as provider-native;
- financial evidence is linked to current job/provider/account rather than exact execution/provider/account provenance;
- arbitrary component can write canonical provider financial evidence merely by knowing an execution ID;
- stale worker that genuinely observed a provider response can only log it, causing evidence loss before canonical persistence;
- stale worker can append evidence without proving genuine observation provenance;
- technical R8 state is used as a substitute for actual financial evidence;
- R7 reserved amount is copied into “actual cost” without provider observation;
- absence of observation is treated as proof of zero cost;
- entitlement consumption is ignored because incremental cash cost is zero;
- reversal/correction deletes or mutates the original financial observation.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 21. Acceptance semantics recoverable from source

At minimum, R15 closure must eventually prove:

- provider-originating financial facts are persisted before validation/normalization/aggregation can discard information;
- exact R8 execution, provider, and provider-account provenance are preserved;
- explicit zero, null, absent, N/A, unknown, and unparseable observations remain distinguishable where applicable;
- original currency/unit survives capture;
- provider effective/created, received, and persisted times remain distinguishable where available;
- provider-native identity is preferred and synthetic fingerprint provenance is explicit;
- estimates, finals, and corrections append rather than overwrite history;
- an authorization ceiling does not clamp provider-reported reality;
- evidence append requires genuine observation provenance, not mere possession of an execution ID;
- a legitimately observing stale worker can durably append evidence without regaining unrelated execution authority;
- R7 reservation state is not treated as actual incurred cost;
- R8 technical outcome does not overwrite financial observation truth;
- entitlement/non-cash consumption can be represented as first-class provider evidence;
- R16 receives the complete immutable observation set needed for order-independent reconciliation;
- an externally executed reversal, if later implemented, gets its own R8/R15 history and does not erase the original execution.

Original fixture labels/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered.

## 22. Start / local closure / E2E dependency result

### START

R15 contract/schema work may proceed once exact R8 execution/provider/account identity can be referenced durably. R7 and R16 interfaces should be designed in parallel, but R15 must remain a raw-evidence layer rather than absorbing their authority or reconciliation semantics.

### LOCAL CLOSURE

R15 may locally close when canonical append-only observation identity, exact execution/provider/account provenance, raw value-shape preservation, original currency/unit, multi-time capture, provider-native/synthetic identity handling, stale-worker observation provenance, entitlement support, known migrations, audit children, and the final sibling sweep are complete.

R16 need not be locally closed for R15 evidence capture to exist, but canonical financial-state certification remains pending without R16 reconciliation. R7 headroom-release certification remains pending until R7/R8/R15/R16 compose correctly.

### E2E

Final certification must compose with at least R7, R8, R11, R16, R19, and R20 where relevant, including the full `R7 × R8 × R15 × R16` financial-safety compound.

## 23. Explicit non-goals

R15 must not:

- define final canonical financial state, which belongs to R16;
- decide release of reserved exposure, which belongs to R7 consuming authoritative downstream truth;
- infer technical provider-boundary truth, which belongs to R8;
- clamp provider evidence to authorization/reservation ceilings;
- erase earlier observations when a final/correction arrives;
- convert missing evidence into zero cost;
- let execution-ID possession alone authorize financial evidence creation;
- let lease loss erase evidence genuinely observed before the loss;
- let stale-worker evidence append become broader execution authority;
- silently substitute a different provider/account when collecting financial evidence;
- treat zero-incremental-cash entitlement use as financially irrelevant;
- treat a refund/reversal observation as retroactive erasure of the original execution or observation history.

## 24. Source gaps and assurance status

The following original R15 details are not yet recoverable from the available record and are not being invented:

1. exact historical finding ID if separately frozen;
2. exact Provider Financial Observation schema/storage representation;
3. exact provider-native/synthetic fingerprint algorithm where provider native ID is absent;
4. exact observation-provenance envelope field names;
5. exact migration child labels and ordinals;
6. exact audit name/classification vocabulary if separately frozen;
7. exact acceptance-fixture labels/order;
8. exact closure-evidence list;
9. provider-specific field mappings not represented in the recovered record;
10. exact amendment/rejected-alternative wording beyond the recovered invariants;
11. any original worked numeric examples not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R16, but it does not restore R15 implementation authority.

## 25. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
