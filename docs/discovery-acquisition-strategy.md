# Money Scout Discovery acquisition strategy

**Status:** Architecture decision  
**Date:** 2026-09-08  
**Scope:** v0 Apify Store acquisition after the deep-offset failure

## Decision

For v0, use **verified partial acquisition of a bounded reachable Store slice**. Do
not represent that slice as a complete Store catalog.

The initial operational boundary is the fifteen 1,000-item pages that were
reachable before the observed failure boundary: offsets `0` through `14,000`.
This is an observed safety boundary for Money Scout, not a claim that Apify
defines a documented 15,000-offset limit. A v0 pass must not request offset
`15,000` merely to discover whether it is empty.

Run exactly two passes over the same bounded slice. Each pass must satisfy the
existing structural invariants and the two canonical Actor sets must be
identical. Pass 2 supplies the records used for any permitted scoring, but only
after database membership comparison succeeds.

The result is useful only as an **observed-slice** dataset. It may describe
usage and changes inside the reachable slice, but it must not claim complete
catalog supply, concentration, fragmentation, or market-wide coverage.

This decision does not authorize a live run or implementation by itself. The
current schema and scoring surface do not yet have an explicit partial-slice
scope, so implementation must first make that scope visible and fail closed
for signals that require complete coverage.

## Problem boundary and evidence

Persisted Money Scout evidence:

- Run #296 received `total=70117`, `offset=15000`, `limit=1000`, and
  `items.length=0`; it persisted `item_count_mismatch`.
- The current Store request is an unpartitioned offset traversal with
  `sortBy=lastUpdate`, `includeUnrunnableActors=true`, and
  `responseFormat=full`.
- The current implementation has no query parameter for `category`,
  `pricingModel`, `allowsAgenticUsers`, or another catalog partition.
- Category and pricing model are normalized from Actor response data. They are
  not evidence that the corresponding fields are supported, exhaustive Store
  filters.
- Run #99 is not present in the current database. Its reported failure at the
  same boundary is therefore treated as supplied historical evidence, not as
  independently queryable telemetry.

Supplied external evidence, not newly fetched in this decision:

- Current `/v2/store` documentation advertises limit/offset pagination with
  pages up to 1,000 items but does not document a 15,000-offset ceiling.
- A public Apify GitHub issue dated May 28, 2026 reports pagination metadata
  whose `items[]` becomes short or empty at larger offsets, with a likely
  post-window filtering/refill defect.

The combination is sufficient to reject the current unpartitioned full-catalog
assumption. It is not sufficient to explain the upstream defect or to treat
the observed boundary as an Apify contract.

## Candidate comparison

### 1. Deterministic partitioned acquisition

**Coverage proof:** Not proven with the available evidence. The Store query
implemented by Money Scout has no documented/local partition dimensions. Even
if `category`, `pricingModel`, or `allowsAgenticUsers` were accepted as query
parameters, an exhaustive scheme would require evidence that:

1. the parameter is a supported Store filter;
2. its complete value set is known and enumerable;
3. every Actor belongs to at least one covered value, including null,
   uncategorized, or otherwise excluded values; and
4. each resulting slice has bounded, structurally valid pagination.

Category is multi-valued in normalized Actors, pricing model may be unknown or
null, and `allowsAgenticUsers` is not present in the current normalized
contract. None can currently prove those conditions. Overlap would be safe
only with canonical Actor-key deduplication; it would not repair missing
partitions.

**Valid signals:** If a future documented, exhaustive partition scheme passes
two-pass membership convergence for every partition, complete-supply metrics
could be restored. Until then, results from partitions remain partial and must
use the restrictions in the verified-partial strategy below.

**Request complexity:** At least two passes over every partition, with
`2 × Σ ceil(partition_size / 1000)` logical page requests, plus bounded retry
attempts. Overlapping categories can multiply requests and require a
run-scoped canonical membership table. Adaptive subdivision would add
complexity and is not allowed to become an unbounded search.

**Memory/database:** Application memory can remain bounded by streaming each
page into run-scoped membership/staging tables. Database writes increase with
overlap and must deduplicate on canonical Actor key. Full response records
should be retained only for the pass that becomes the verified scoring
snapshot.

**Failure modes:** Unknown filter semantics, omitted null/unknown values,
partition growth beyond the deep-offset boundary, inconsistent membership
between overlapping partitions, duplicate identities, and mutable ordering.
Any invalid page or incomplete partition invalidates the full acquisition; it
must not be converted into an apparently complete union.

**Zero-cost model:** Potentially preserves the direct, fixture-testable,
zero-cost operating model, but only if all dimensions and values are already
supported by the Store API. It is not a viable v0 architecture without that
proof.

### 2. Verified partial acquisition — selected

**Coverage proof:** Deliberately not claimed. The reachable slice is explicitly
bounded to offsets `0..14000` at the current page size. Its membership can be
verified, but membership outside the slice is unknown. A short/empty required
page within the slice remains a hard failure. An empty page at offset `15000`
is never an end-of-catalog signal because v0 never uses it as a terminator.

**Valid signals:** The following may be eligible, with explicit
“observed slice” language:

- `EMERGING_CLUSTER`, when the same bounded slice converges across both passes
  and the comparison to the prior run uses the same acquisition boundary.
- `MATERIAL_SNAPSHOT_CHANGE`, when both current and prior snapshots are
  observed-slice snapshots with compatible boundaries.
- Descriptive per-Actor usage telemetry and bounded-slice usage ranking, never
  described as validated demand or a catalog-wide percentile.

The following are unavailable and must score zero or be explicitly marked
unavailable while coverage is partial:

- `HIGH_USAGE_THIN_SUPPLY`: the observed Actor count is a lower bound, so
  scarcity may be an artifact of the unreachable tail.
- `HIGH_USAGE_CONCENTRATED`: missing Actors can materially change the HHI and
  concentration rank.
- `HIGH_USAGE_FRAGMENTED`: missing providers can materially change provider
  count, HHI, and fragmentation rank.
- Any catalog-relative percentile or complete-supply metric.

Two-pass convergence does not turn a partial slice into a complete catalog; it
only verifies that the same reachable slice was observed twice.

**Request complexity:** At most 15 logical page requests per pass and 30 for
the two-pass run, before bounded retry attempts. No request is made at
offset `15000`. The initial traversal and the extra-page probe used by the
full-catalog algorithm must be replaced by an explicit slice cap; there is no
retry-until-success or retry-until-convergence loop.

**Memory/database:** At most the bounded slice is staged per run. Compact
canonical memberships remain the authority for pass comparison; normalized
full records are staged for Pass 2 only. The database remains the durable
working set, and failed or mismatched runs clear staging. This is materially
smaller and more predictable than attempting to hold or repeatedly crawl the
reported 70k+ catalog.

**Failure modes:** A malformed page, offset/limit mismatch, item-count
mismatch, repeated page, duplicate canonical identity, timeout, retry
exhaustion, total envelope violation, or pass-set mismatch remains terminal
and unverified. The observed total is diagnostic only and cannot authorize
scoring outside the cap.

**Zero-cost model:** Preserved. It uses the existing direct Store path, bounded
fixtures, no individual Actor or dataset calls, and no paid external
acquisition source.

### 3. Public membership source

**Coverage proof:** No sitemap, catalog index, or other canonical public
membership source is identified in the project or local attachments. A future
source would need to prove canonical completeness, freshness, and stable
identity semantics. A membership index alone would not provide the usage
telemetry needed for current scoring.

**Valid signals:** Membership-only data could support convergence and
completeness checks, but not usage, concentration, fragmentation, or emergence
scoring unless it also supplies the required Actor metadata. Fetching each
Actor or dataset to fill that gap is explicitly out of scope.

**Request complexity and storage:** Unknown. A canonical index could reduce
deep Store pagination but would still require bounded ingestion, duplicate
handling, and two-pass comparison. If it only lists IDs, it adds an
unresolved metadata acquisition problem rather than replacing Store
acquisition.

**Failure modes:** Stale or incomplete indexes, undocumented URL stability,
robots/access changes, missing Actor metadata, and disagreement with Store
identity keys. These cannot be tested without external requests and are not a
v0 basis.

**Zero-cost model:** Potentially zero-cost if a documented public source
already exists, but no such source is present in local evidence. Do not add
one speculatively and do not add individual Actor crawling.

## Required safeguards for the selected strategy

The partial-slice decision preserves these safeguards:

1. Exactly two passes, both starting at offset `0` and using the same explicit
   slice boundary.
2. Exact page offset, limit, and required-page item-count validation. The
   `item_count_mismatch` invariant is not relaxed.
3. Duplicate canonical Actor identities hard-fail a pass.
4. Repeated pages, total-drift/envelope violations, request timeouts, and
   bounded retry exhaustion remain failures.
5. Database membership anti-joins are authoritative for pass equality; order
   does not matter.
6. Only converged Pass 2 records may enter derived snapshots. Failed,
   incomplete, or mismatched runs clear staging and publish no candidates.
7. Finalization remains atomic across Actors, observations, snapshots,
   candidates, run ledger, and staging.
8. Authorization, the active-run guard, conservative pacing, and finite retry
   limits remain unchanged.
9. Run telemetry must identify the acquisition as a bounded partial slice,
   record the cap and omitted boundary, and distinguish logical page requests
   from network attempts.
10. UI and candidate text must say “observed slice” or equivalent. They must
    not say full catalog, total supply, market concentration, or validated
    demand.

## Consequences and exit criteria

This decision produces a safe but intentionally narrow v0: it can surface
repeatable changes and usage patterns inside the reachable Store window, but it
cannot support supply-scarcity claims. Existing full-catalog candidates must
not be republished merely because the bounded slice converges.

Reconsider the partial boundary only after one of these is established without
weakening the invariants:

- Apify documents and demonstrates a reliable cursor/snapshot or deep-offset
  behavior for `/v2/store`;
- a documented exhaustive partition dimension and complete value universe are
  verified, with every partition bounded and convergent; or
- a documented, canonical public membership source supplies complete Actor
  membership and the metadata needed for the intended signals.

Until then, the following are explicitly rejected:

- relaxing `item_count_mismatch`;
- treating an empty deep page as end-of-catalog;
- retrying offset `15000` indefinitely;
- claiming complete coverage from the existing unpartitioned crawl; and
- adding individual Actor or dataset crawling to compensate for missing
  membership.