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

## 8. Legacy source authority

Historical Builds whose exact immutable source authority cannot be proven must not be reconstructed from current HEAD.

Recovered legacy state:

`SOURCE_AUTHORITY_UNPROVEN`

A legacy Build may be deterministically reconstructed only from durable provenance sufficient to prove the exact historical source. Otherwise it remains non-authoritative for future consequential reuse.

> **Current repository state may not be used to manufacture historical Build authority.**

## 9. Source-snapshot provenance states

Recovered provenance family includes:

- `FRESHLY_FROZEN`
- `DETERMINISTICLY_RECONSTRUCTED`
- `LEGACY_UNPROVEN`

Exact spelling/storage representation should be checked against the source record during review. The semantic distinction is load-bearing:

- newly and explicitly frozen from current authorized source;
- reconstructed only from durable deterministic historical evidence;
- historical source authority not provable.

If the exact historical enum wording cannot be confirmed, it must remain source-unresolved rather than normalized by preference.

## 10. R8 boundary

R9 source identity and R8 provider/external-boundary truth are separate propositions.

A Git push, repository mutation, clone/fetch, provisioning call, or other external repository operation may itself require R8 execution identity and reconciliation. R8 proves what happened externally; R9 proves which immutable source identity the Build is authorized to consume.

Successful repository mutation does not by itself authorize a Build to consume the resulting commit unless that exact commit becomes the governed Build Source Snapshot.

## 11. R7 boundary

Any resource-consuming source acquisition, repository provisioning, build preparation, or successor Build attempt remains subject to R7 reservation where scarce resources are consumed.

R9 source identity creates no resource authority.

Likewise, a valid R7 reservation does not establish valid source authority.

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

Where a fresh governed successor Build can be attempted, that attempt is subject to normal R7/R8/R20 authority and safety rules.

Only concrete evidence that the Product/Architecture itself cannot be realized should route into the relevant R11 corrective obligation at that higher semantic level.

R9 must not collapse source-state failure into product impossibility by default.

## 15. Known migration surfaces recoverable from record

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

## 16. Semantic sibling sweep

Search for patterns including:

- branch name or default branch treated as Build authority after authorization;
- `HEAD` resolved at execution time when an earlier exact source should already be frozen;
- Build source SHA omitted from immutable Build authority;
- source identity rewritten after repair rather than producing a successor snapshot;
- Build/repair source reconstructed from current repository state;
- legacy source stamped with current HEAD;
- ancestry inferred from branch membership instead of exact commit relation;
- Product/Architecture/Bet lineage omitted from the source snapshot;
- source fingerprint derived from mutable context;
- downstream R10/R17 consumers using current repo state rather than exact Build lineage.

Every genuine sibling becomes a durable migration child. Repeat until a complete repository-wide pass returns no new semantic instance.

## 17. Acceptance semantics recoverable from source

At minimum, R9 closure must eventually prove:

- Build authority binds to an exact immutable commit/source identity before consequential build execution;
- moving the branch after authorization does not change Build source authority;
- exact R4 evaluation lineage survives into the Build Source Snapshot;
- repair/successor Builds receive new immutable source identities rather than mutating history;
- ancestry/compatibility failures produce `SOURCE_LINEAGE_VIOLATION` rather than silent substitution;
- legacy source authority is reconstructed only from durable deterministic provenance;
- unprovable legacy source remains `SOURCE_AUTHORITY_UNPROVEN` / equivalent fail-closed state;
- current HEAD is never used to manufacture historical source authority;
- R8 external repository-operation truth remains distinct from R9 source authority;
- R10 receives exact source/Build linkage suitable for Artifact identity propagation;
- the R4→R9→R10→R17→R19→R20 hard chain remains intact.

Original fixture names/order and exact numbered closure-evidence list are `SOURCE_NOT_RECOVERABLE_FROM_AVAILABLE_RECORD` until recovered from the original confirmation exchange.

## 18. Start / local closure / E2E dependency result

### START

R9 contract/schema work may proceed once R4's lineage interface is sufficiently stable to preserve exact originating lineage in the snapshot. R8 may proceed in parallel; R9 does not require R8 to define source identity.

### LOCAL CLOSURE

R9 may locally close when immutable Build Source Snapshot identity, exact lineage propagation, repair/successor semantics, ancestry validation, legacy treatment, known migrations, audit children, and final sibling sweep are complete.

R10/R17/R19/R20 need not be locally closed for R9's source-freeze primitive to exist, but downstream certification remains pending until the hard chain composes correctly.

### E2E

Final certification must compose with at least R4, R7, R8, R10, R17, R19, and R20 where relevant.

## 19. Explicit non-goals

R9 must not:

- decide evaluation-cycle freshness, which belongs to R4/R20 as applicable;
- define provider/external execution truth, which is R8;
- grant scarce-resource authority, which is R7;
- define exact Artifact identity after Build, which is R10;
- define commercial Offer authority, which is R17;
- reconstruct legacy source from current HEAD;
- treat branch identity as immutable source authority;
- mutate an old Build's source snapshot to make it current;
- infer Product/Architecture impossibility merely because one source/Build attempt fails.

## 20. Source gaps and assurance status

The following original R9 details are not yet recoverable from the available record and are not being invented:

1. exact migration child labels and ordinals;
2. exact audit name/classification vocabulary if separately frozen;
3. exact acceptance-fixture labels/order;
4. exact closure-evidence list;
5. exact amendment/rejected-alternative wording beyond the recovered invariants;
6. exact enum spelling/storage form for source-snapshot provenance if the original differs from the recovered summary;
7. any original worked examples or repository-path specifics not represented in the available record.

Status remains:

`RECOVERED TO AVAILABLE RECORD / SOURCE_INCOMPLETE / NON-IMPLEMENTATION AUTHORITY`

This state does **not** block recovery of R10, but it does not restore R9 implementation authority.

## 21. Relay-contamination guard

This artifact terminates here. No conversational handoff text is part of the contract body.
