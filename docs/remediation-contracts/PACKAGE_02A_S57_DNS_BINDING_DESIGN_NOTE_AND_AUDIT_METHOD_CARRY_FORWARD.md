# Representation Package 02A — S57 DNS Binding Design Note and Audit-Method Carry-Forward

**Status:** DESIGN CANDIDATE OVERLAY / NO IMPLEMENTATION AUTHORITY / METHODOLOGY RULE PROMOTED  
**Controls over:** `PACKAGE_02A_SYSTEMATIC_EXTERNAL_IO_TAXONOMY_AND_S57_DNS_CORRECTION.md` where more specific  
**Implementation authority:** SUSPENDED

## 1. Purpose

Direct review of S57 confirmed a real source-level time-of-check/time-of-use gap:

1. Money Scout explicitly resolves and validates a hostname through `dns.promises.lookup(...)`;
2. later `fetch(hostname)` performs the actual connection through its own transport resolution path;
3. current source does not bind the address approved by the safety check to the address actually contacted.

The finding remains deliberately narrow:

`DNS_SAFETY_OBSERVED_ADDRESS_SET == ACTUAL_HTTP_CONNECTION_ADDRESS_SET`

is **not proven**.

This artifact records a standard candidate remediation pattern for later design work and promotes the systematic I/O-discovery methodology into a reusable audit rule.

## 2. Candidate remediation pattern — validated-address connection pinning

A canonical candidate design is:

`RESOLVE_ONCE → VALIDATE_EXACT_ADDRESS_SET → FREEZE_SELECTED_ADDRESS/TARGET → CONNECT_TO_VALIDATED_ADDRESS`

while preserving the original hostname as the application/TLS authority.

This pattern is commonly described as:

`IP_PINNING`

for SSRF-safe outbound requests.

It is recorded as a **candidate design pattern**, not an implementation directive.

## 3. Required semantic properties of an IP-pinned design

A compliant future implementation must prove all of the following if it adopts this pattern.

### 3.1 Exact hostname

Freeze the normalized hostname being authorized.

### 3.2 Exact DNS observation

Freeze:

- exact lookup attempt identity;
- returned address set;
- address family;
- observation time;
- resolver/provenance where material.

### 3.3 Exact validated connection address

The network connection must be directed to one address from the exact validated set.

A second unconstrained hostname lookup at connection time cannot silently choose another address.

### 3.4 HTTP authority preservation

The original hostname must remain the HTTP authority/Host value required by virtual hosting.

Connecting to the numeric address must not silently rewrite the semantic destination into the IP literal.

### 3.5 TLS SNI and certificate validation preservation

For HTTPS, the original hostname must remain the TLS server-name / certificate-validation identity.

The design must not weaken TLS verification merely to permit connection to a pinned numeric IP.

Therefore:

`PINNED_IP != DISABLE_TLS_HOSTNAME_VALIDATION`.

### 3.6 Exact request linkage

The frozen DNS/address decision must bind to the exact S52 request it authorizes.

Required relation:

`S57_exact → S52_exact`.

### 3.7 Redirect restart

Every redirect to a new URL/hostname must restart:

`resolve → validate → freeze → connect`.

A redirect target may not inherit the previous hostname's DNS approval.

Therefore:

`REDIRECT_HOST_CHANGE → NEW_S57_EXACT`.

### 3.8 Multi-address handling

If DNS returns multiple public addresses, future design must define the exact policy for:

- selecting one validated address;
- failover to another validated address;
- whether a failover constitutes the same S52 attempt or a new network attempt;
- preserving exact historical connection identity.

It may not fall back to an unvalidated re-resolution.

## 4. Candidate topology

A future exact path may take the form:

`E_dns_lookup / S57_exact`

→ exact returned address set

→ validation disposition

→ frozen selected address + hostname authority

→ `E_policy_http / S52_exact`

→ actual connection evidence

with enforceable equality:

`ACTUAL_CONNECTION_IP ∈ VALIDATED_ADDRESS_SET_FOR_EXACT_S57`.

If implementation exposes connection telemetry, that evidence should be retained rather than reconstructed later.

## 5. Alternative equivalent designs remain allowed

IP pinning is a named candidate, not the only permitted implementation.

An alternative design is acceptable if it provides equivalent proof that:

- the actual connection destination was validated;
- hostname/TLS authority was preserved;
- redirects were independently validated;
- no second uncontrolled DNS resolution can alter the approved target;
- historical evidence is replayable.

Therefore:

`IP_PINNING = CANDIDATE_PATTERN / NOT_CANONICAL_IMPLEMENTATION_MANDATE`.

## 6. Explicit non-solutions

The following do not close S57 by themselves.

### DNS-NS1 — validate then ordinary fetch

`lookup(hostname) → validate → fetch(hostname)`

with no connection binding.

This is the current gap.

### DNS-NS2 — connect to IP and disable TLS validation

This trades SSRF binding for broken server authentication.

Must fail.

### DNS-NS3 — Host header only

Setting `Host: original-hostname` while TLS validates the IP literal is not equivalent HTTPS authority preservation.

Must fail.

### DNS-NS4 — cache hostname approval

Approving a hostname once and treating all later resolutions as safe.

Must fail historical-path equality.

### DNS-NS5 — redirect inheritance

Initial hostname is validated; redirected hostname is fetched without its own S57 observation.

Must fail.

### DNS-NS6 — current DNS reconstruction

Later DNS result is used as proof of the address set approved for an earlier request.

Must fail.

## 7. Additional S57 attack fixtures

### DNS-A6 — pinned IP without hostname authority

Connection is made to the approved IP, but HTTP Host/TLS SNI/certificate validation no longer bind to the original hostname.

Must fail.

### DNS-A7 — redirect bypass

Initial host is correctly pinned; a redirect reaches a private or otherwise unapproved address through a new hostname without a new S57 gate.

Must fail.

### DNS-A8 — failover re-resolution

Pinned address fails, transport silently re-resolves the hostname and connects to an address outside the frozen set.

Must fail.

### DNS-A9 — unrecorded connection address

Implementation claims exact DNS-to-connection binding but retains no replayable evidence of which IP was actually connected.

Must fail assurance/exactness.

## 8. Design status

Current classification remains:

`S57_C1 = NON_SCARCE_NOT_PROVEN`

`S57_DIRECT_C2 = NO`

`S57_PREBOUNDARY_IDENTITY = NONE`

`S57_TO_S52_BINDING_GAP = CONFIRMED`

`SUCCESSFUL_SSRF_EXPLOIT = NOT_ASSERTED`

`IP_PINNING_PATTERN = GOVERNED_CANDIDATE_DESIGN`

`IMPLEMENTATION_AUTHORITY = SUSPENDED`.

No current code change is authorized by this artifact.

## 9. Audit-method carry-forward

The transport-discovery method from the systematic taxonomy correction is promoted as a reusable audit invariant:

`SOURCE_UNIVERSE × EXPLICIT_IO_TAXONOMY × DEPENDENCY_INVENTORY`.

This rule is not specific to Package 02A.

A future audit of any execution/governance surface is incomplete if it:

- enumerates files but not transport categories;
- enumerates transports but not dependency-mediated I/O;
- enumerates dependencies but not actual imports/call sites;
- scans only categories previously known to exist;
- omits zero-hit categories from the evidence record.

## 10. Required audit structure going forward

For every audited source universe:

1. freeze the source universe;
2. enumerate I/O taxonomy before scanning;
3. inventory runtime dependencies;
4. scan every taxonomy class;
5. recursively inspect transport wrappers;
6. classify every positive hit;
7. explicitly record zero-hit classes;
8. record scope exclusions such as auth/DB/inbound infrastructure;
9. repeat on dependency/source delta;
10. prohibit closure from row/file counts alone.

## 11. Forward-governance trigger

Any change to:

- runtime dependencies;
- Node version/platform transport behavior;
- new SDK/client package;
- new subprocess command;
- new socket/WebSocket/EventSource use;
- new DNS helper;
- new externally mounted filesystem/process integration

must trigger reapplication of the explicit I/O taxonomy to the affected source universe.

Therefore:

`DEPENDENCY_OR_TRANSPORT_DELTA → IO_TAXONOMY_RECHECK`.

## 12. Disposition

`S57_IP_PINNING_CANDIDATE = ADDED`

`HOST_HEADER_PRESERVATION = REQUIRED_IF_PINNING`

`TLS_SNI_AND_CERT_HOSTNAME_PRESERVATION = REQUIRED_IF_PINNING`

`REDIRECT_REVALIDATION = REQUIRED`

`MULTI_ADDRESS_FAILOVER_POLICY = MUST_BE_EXPLICIT`

`ACTUAL_CONNECTION_IP_EVIDENCE = REQUIRED_FOR_EXACTNESS_CLAIM`

`SOURCE_UNIVERSE_X_IO_TAXONOMY_X_DEPENDENCY_INVENTORY = PROMOTED_REUSABLE_AUDIT_RULE`

`CURRENT_NUMBERED_SURFACE_FLOOR = 57`

`POSITIVE_C2_ADOPTION_FAMILIES = 6`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`
