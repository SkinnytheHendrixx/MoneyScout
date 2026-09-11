# WI-R9 — Immutable Build Source Authority

**Normalized node:** R9  
**Historical finding:** C4-F4  
**Severity:** BLOCKER  
**Contract state:** CONFIRMED  
**Artifact assurance state:** `RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`  
**Implementation:** NOT STARTED  
**Closed:** NO

## 1. Recovery provenance

This artifact begins R9 recovery from the confirmed material still available in the project record. It preserves only obligations that can be recovered with high confidence and does not regenerate missing migration ordinals, audit classifications, fixture labels/order, or closure-evidence numbering from the compressed register or from later summaries.

Where exact historical text is unavailable, the gap is marked explicitly rather than inferred.

## 2. Frozen root and mission

R9 exists because a Build cannot derive its authoritative source from a mutable repository reference after the Build has been authorized.

A branch name, repository default branch, or current HEAD is context. It is not immutable Build authority.

> **Every Build must bind to an exact immutable Build Source Snapshot before consequential build execution can rely on repository state.**

The Build Source Snapshot preserves the exact source authority that the Build was authorized to consume. Later repository movement must not silently change that authority.

## 3. Build Source Snapshot

The recovered contract requires an immutable source snapshot containing, at minimum where applicable:

- repository identity;
- repository URL or canonical repository locator;
- exact base/source commit SHA;
- observed mutable ref for provenance only;
- relevant manifest/source-set identity where needed;
- Product Definition identity;
- Architecture identity/version;
- Build identity;
- exact Evaluation Lineage reference inherited under R4;
- source fingerprint / deterministic identity;
- observation/freeze time;
- provenance of how the snapshot was frozen.

The observed branch/ref may be stored for auditability, but it may not substitute for the immutable commit identity.

## 4. Branch context is never Build authority

Forbidden pattern:

1. Build is authorized while branch `main` points to commit X;
2. repository advances to Y;
3. Builder later resolves `main` and consumes Y;
4. system records the result as though the original Build had always authorized Y.

That silently rewrites Build authority after authorization.

> **Mutable repository references may locate a candidate source; only the frozen immutable source identity authorizes the Build.**

## 5. R4 exact-lineage inheritance

R9 consumes R4's immutable originating Evaluation Lineage. It must not replace that lineage with whichever evaluation cycle is current when the source snapshot is frozen or when the Build starts.

The Build Source Snapshot must preserve the exact lineage inherited from the authorized Bet/Product/Architecture chain.

R9 cannot repair stale or unknown lineage. If exact lineage is required and unavailable, R4's fail-closed semantics govern.

## 6. Repair and successor-source semantics

A repair that changes source creates new source authority.

Recovered example:

- original Build source = X;
- repair produces source state Y;
- a later governed Build/repair step produces Z.

The system must preserve X, Y, and Z as distinct historical source identities where they represent distinct source authority states. It must not mutate the original Build snapshot in place to whichever source is newest.

A successor Build or repair must receive its own immutable source snapshot.

## 7. Source ancestry and lineage violation

Where a successor source is required to descend from or otherwise be compatible with an authorized source, that relationship must be checked explicitly rather than assumed from branch membership.

Recovered failure state:

`SOURCE_LINEAGE_VIOLATION`

This applies when the exact proposed source cannot be shown to satisfy the required ancestry/compatibility relationship to its authorized predecessor.

A source on the same branch is not sufficient evidence of valid ancestry.

### 7.1 Successor routing after `SOURCE_LINEAGE_VIOLATION`

The confirmed contract distinguishes two branches:

1. **Implementation/execution failure:** if the Builder's ancestry failure is a Builder/source execution mistake rather than evidence against the frozen Product/Architecture contract, the system may create a fresh governed Builder attempt from the **same frozen Build Source Snapshot**, subject to normal R7 resource admission, R8 external-execution truth, and R20 boundary-time authority checks.
2. **Substantive upstream contradiction:** only if the Builder produces **concrete technical evidence** that the authorized source snapshot cannot satisfy the frozen Product/Architecture contract without changing upstream authority does R9 route that contradiction to R11 as an executable corrective challenge at the appropriate upstream semantic level.

The explicitly rejected shortcut is:

`non-descendant commit → automatically ARCHITECTURE_CHALLENGE`

That shortcut is forbidden because it would allow a Builder's Git/source mistake to masquerade as architectural evidence.

> **Artifact-integrity failure is not automatically design contradiction.**

## 8. Legacy source authority

Historical Builds whose exact immutable source authority cannot be proven must not be reconstructed from current HEAD.

Recovered legacy state:

`SOURCE_AUTHORITY_UNPROVEN`

A legacy Build may be deterministically reconstructed only from durable provenance sufficient to prove the exact historical source. Otherwise it remains non-authoritative for future consequential reuse.

> **Current repository state may not be used to manufacture historical Build authority.**

## 9. Source-snapshot provenance states

Confirmed provenance family:

- `FRESHLY_FROZEN`
- `DETERMINISTICALLY_RECONSTRUCTED`
- `LEGACY_UNPROVEN`

The semantic distinction is load-bearing:

- newly and explicitly frozen from current authorized source;
- reconstructed only from durable deterministic historical evidence;
- historical source authority not provable.

A `DETERMINISTICALLY_RECONSTRUCTED` source snapshot must additionally preserve, where applicable:

- reconstruction method;
- evidence references used to prove the historical source;
- audit/migration record identity;
- `reconstructed_at`;
- reconstruction confidence/result;
- reviewer/verification evidence where required by the governing verification policy.

Deterministic reconstruction is not permission to infer from current repository state. It requires durable evidence sufficient to prove the exact historical source authority.

## 10. R8 boundary

R9 source identity and R8 provider/external-boundary truth are separate propositions.

A Git push, repository mutation, clone/fetch, provisioning call, or other external repository operation may itself require R8 execution identity and reconciliation. R8 proves what happened externally; R9 proves which immutable source identity the Build is authorized to consume.

Successful repository mutation does not by itself authorize a Build to consume the resulting commit unless that exact commit becomes the governed Build Source Snapshot.

## 11. R7 boundary

Any resource-consuming source acquisition, repository provisioning, build preparation, source verification, or successor Build attempt remains subject to R7 reservation where scarce resources are consumed.

R9 source identity creates no resource authority.

Likewise, a valid R7 reservation does not establish valid source authority.

### 11.1 Rejected fallback when verification cannot be admitted

If the source snapshot cannot yet be proven and R7 does not admit the scarce verification work required to prove it, the Build remains blocked/pending.

The explicitly rejected fallback is:

`verification unavailable → use current branch/HEAD`

That shortcut would destroy R9's purpose by converting a resource-admission failure into mutable source authority.

Confirmed acceptance scenario:

- establishing the exact remote source/HEAD relationship requires a scarce provider call;
- R7 denies admission for that verification work;
- expected result: **no provider lookup occurs**;
- no current mutable branch/HEAD value is promoted as fallback source authority;
- the Build remains blocked/pending until governed verification can occur or another authorized disposition is produced.

## 12. R10 boundary

R9 freezes the exact source authority entering the Build.

R10 later preserves the exact built Artifact identity through QA, Release, and Asset adoption.

> **R9 answers what exact source was authorized to be built. R10 answers what exact artifact was actually built, verified, released, and adopted.**

A Build Source Snapshot must therefore be linkable to the exact Build/Artifact identity consumed by R10.

## 13. R9 × R10 × R17 commercial chain

The recovered hard-chain relationship is:

`R4 → R9 → R10 → R17 → R19 → R20`

R9 contributes immutable source authority to that chain. R17's exact Offer Version must ultimately bind to the production artifact/release derived from the exact authorized source, not merely to a current Asset or current branch.

R9 alone does not create commercial authority.

## 14. Product/Architecture impossibility vs source failure

A source lineage/identity failure is not automatically proof that the Product Definition or Architecture is impossible.

Where a fresh governed successor Build can be attempted from the same frozen source authority because the defect is an implementation/execution failure, that attempt is subject to normal R7/R8/R20 authority and safety rules.

Only concrete technical evidence that the frozen Product/Architecture contract cannot be realized from the authorized source without changing upstream authority may route into the relevant R11 corrective obligation at that higher semantic level.

> **Artifact-integrity failure is not automatically design contradiction.**

R9 must not collapse source-state failure into product impossibility by default.

## 15. Design Input review

### DI-1 — provider/account capability identity

**Reviewed:** YES  
**Activated by generic R9:** NO

R9 freezes repository/source authority and does not itself introduce provider/account capability substitution semantics. If a future source-acquisition or repository operation changes capability identity semantics so that one provider/account can substitute for another in a consequential authority path, DI-1 must be re-evaluated at that exact scope.

### DI-2 — outbound payment reversal execution

**Reviewed:** YES  
**Activated by generic R9:** NO

R9 defines immutable Build source authority. It does not dispatch autonomous refund/cancel/void/reversal operations. If later repository/source work is coupled to an autonomous economic reversal path, DI-2 activates in that reversal scope rather than through R9 source authority itself.

These dispositions preserve the original review result without inventing additional activation semantics beyond R9's confirmed scope.

## 16. Known migration surfaces recoverable from record

The available record confirms R9 migration scope includes, at minimum:

- canonical Build Source Snapshot schema/identity;
- Bet/Product/Architecture → Build source-freeze path;
- Builder/Build execution source resolution;
- repair/successor Build source handling;
- Build fingerprinting/source fingerprint consumers;
- legacy Build/source migration;
- downstream consumers that currently reconstruct source from mutable repository state;
- source ancestry/compatibility checks;
- semantic audit of all branch/HEAD/current-ref substitutions where immutable source authority should already exist.

Exact migration labels, ordinals, and original per-surface wording are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` at this stage.

## 17. Semantic sibling sweep

Search for patterns including:

- branch name or default branch treated as Build authority after authorization;
- `HEAD` resolved at execution time when an earlier exact source should already be frozen;
- Build source SHA omitted from immutable Build authority;
- source identity rewritten after repair rather than producing a successor snapshot;
- Build/repair source reconstructed from current repository state;
- legacy source stamped with current HEAD;
- ancestry inferred from branch membership instead of exact commit relation;
- `SOURCE_LINEAGE_VIOLATION` automatically converted into architecture/product challenge without concrete technical evidence;
- source verification denied by R7 followed by fallback to current branch/HEAD;
- Product/Architecture/Bet lineage omitted from the source snapshot;
- source fingerprint derived from mutable context;
- downstream R10/R17 consumers using current repo state rather than exact Build lineage.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 18. Acceptance semantics recoverable from source

At minimum, R9 closure must eventually prove:

- Build authority binds to an exact immutable commit/source identity before consequential build execution;
- moving the branch after authorization does not change Build source authority;
- exact R4 evaluation lineage survives into the Build Source Snapshot;
- repair/successor Builds receive new immutable source identities rather than mutating history;
- ancestry/compatibility failures produce `SOURCE_LINEAGE_VIOLATION` rather than silent substitution;
- an implementation/execution ancestry failure may produce a fresh governed attempt from the same frozen source snapshot rather than automatically escalating to upstream design contradiction;
- only concrete technical evidence of Product/Architecture impossibility routes the substantive contradiction to R11;
- source-verification work denied by R7 leaves the Build blocked and does not fall back to current branch/HEAD;
- legacy source authority is reconstructed only from durable deterministic provenance;
- `DETERMINISTICALLY_RECONSTRUCTED` records preserve reconstruction method, evidence, audit/migration identity, reconstruction time, result/confidence, and required verification evidence;
- unprovable legacy source remains `SOURCE_AUTHORITY_UNPROVEN` / equivalent fail-closed state;
- current HEAD is never used to manufacture historical source authority;
- R8 external repository-operation truth remains distinct from R9 source authority;
- R10 receives exact source/Build linkage suitable for Artifact identity propagation;
- the R4→R9→R10→R17→R19→R20 hard chain remains intact;
- DI-1 and DI-2 remain not activated unless their exact future activation conditions occur.

Original fixture names/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 19. Start / local closure / E2E dependency result

### START

R9 contract/schema work may proceed once R4's lineage interface is sufficiently stable to preserve exact originating lineage in the snapshot. R8 may proceed in parallel; R9 does not require R8 to define source identity.

### LOCAL CLOSURE

R9 may locally close when immutable Build Source Snapshot identity, exact lineage propagation, repair/successor semantics, ancestry validation and successor routing, provenance/reconstruction requirements, legacy treatment, known migrations, audit children, DI dispositions, and final sibling sweep are complete.

R10/R17/R19/R20 need not be locally closed for R9's source-freeze primitive to exist, but downstream certification remains pending until the hard chain composes correctly.

### E2E

Final certification must compose with at least R4, R7, R8, R10, R17, R19, and R20 where relevant.

## 20. Explicit non-goals

R9 must not:

- decide evaluation-cycle freshness, which belongs to R4/R20 as applicable;
- define provider/external execution truth, which is R8;
- grant scarce-resource authority, which is R7;
- define exact Artifact identity after Build, which is R10;
- define commercial Offer authority, which is R17;
- reconstruct legacy source from current HEAD;
- treat branch identity as immutable source authority;
- mutate an old Build's source snapshot to make it current;
- automatically route `SOURCE_LINEAGE_VIOLATION` into `ARCHITECTURE_CHALLENGE` or equivalent upstream contradiction without concrete technical evidence;
- fall back to mutable branch/HEAD because R7 denied source-verification work;
- infer Product/Architecture impossibility merely because one source/Build attempt fails.

## 21. Source gaps and assurance status

The following original R9 details are not yet recoverable from the available record and are not being invented:

1. exact migration child labels and ordinals;
2. exact audit name/classification vocabulary if separately frozen;
3. exact acceptance-fixture labels/order beyond the restored R7-denial scenario;
4. exact closure-evidence list;
5. exact amendment/rejected-alternative wording beyond the invariants restored through source review;
6. any additional Design Input evidence wording beyond the confirmed reviewed/not-activated dispositions preserved here;
7. any original worked examples or repository-path specifics not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R10, but it does not restore R9 implementation authority.

## 22. First source-level review disposition

The first adversarial source-level review of the initial recovered R9 artifact classified:

- mission / snapshot / branch-authority / R4 lineage / repair semantics: **ACCEPTED**;
- `SOURCE_AUTHORITY_UNPROVEN`: **ACCEPTED**;
- R8, R10, and hard-chain boundaries: **ACCEPTED**;
- provenance spelling: corrected to confirmed `DETERMINISTICALLY_RECONSTRUCTED`;
- `SOURCE_LINEAGE_VIOLATION` successor routing: **PARTIALLY ACCEPTED → AMENDED**;
- R7 verification-denial fallback: **PARTIALLY ACCEPTED → AMENDED**;
- reconstructed-source provenance fields: **PARTIALLY ACCEPTED → AMENDED**;
- Design Input section: **UNRESOLVED → RESTORED at confirmed reviewed/not-activated scope**;
- rejected findings: **NONE**.

These amendments do not remove the remaining explicit source gaps and do not upgrade implementation authority.

## 23. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
