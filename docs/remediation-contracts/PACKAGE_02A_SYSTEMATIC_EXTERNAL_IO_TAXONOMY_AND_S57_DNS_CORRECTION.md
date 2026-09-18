# Representation Package 02A — Systematic External-I/O Taxonomy and S57 DNS Safety Resolution Correction

**Status:** METHODOLOGY CORRECTION / TAXONOMY-DERIVED 98-FILE RESCAN COMPLETE / S57 ADDED / AUTH + DB TRANSPORT EXCLUSIONS EXPLICIT / LEDGER PROMOTION STILL BLOCKED  
**Controls over:** All-Call-Site Ledger Candidate 1 + Corrections 1–2 where narrower  
**Implementation authority:** SUSPENDED

## 1. Why this correction exists

The prior call-site discovery process expanded its predicates reactively:

1. HTTP/fetch;
2. provider SDK calls;
3. subprocess/Git.

That history is itself evidence that a scan may be complete over a file universe while incomplete over transport categories.

Therefore zero-unmapped certification may not rely on a predicate list discovered from previously noticed call sites.

The scan taxonomy must be enumerated first.

## 2. Explicit Node/TypeScript external-I/O taxonomy

The current Package-02A source scan must account for these categories independently.

### T1 — Web-platform HTTP request APIs

- global `fetch`;
- `node-fetch`;
- `undici`;
- axios/got or equivalent request libraries.

### T2 — Native HTTP stacks

- `node:http`;
- `node:https`;
- `node:http2`.

### T3 — Raw stream sockets

- `node:net`;
- `node:tls`;
- Unix/TCP socket creation through those modules.

### T4 — Datagram sockets

- `node:dgram`.

### T5 — DNS

- `node:dns`;
- `node:dns/promises`;
- explicit lookup/resolve calls.

### T6 — Persistent/evented network transports

- WebSocket/global `WebSocket`;
- `ws`;
- socket.io client;
- EventSource/SSE client libraries.

### T7 — Child-process mediated external I/O

All `node:child_process` execution forms:

- `execFile`;
- `exec`;
- `spawn`;
- `fork`;
- sync variants.

The invoked program/arguments must then be classified. "Subprocess" is not automatically local.

### T8 — Third-party SDK mediated I/O

Every dependency capable of independently issuing external requests must be traced from dependency inventory to actual imports/call sites.

Current API-server candidates:

- `@anthropic-ai/sdk`;
- `@openai/codex-sdk`;
- `openid-client`.

Workspace-root candidate:

- `@replit/connectors-sdk`.

### T9 — Internal database transport

`@workspace/db` uses:

- `drizzle-orm/node-postgres`;
- `pg.Pool`;
- `DATABASE_URL`.

This may be network transport when Postgres is remote.

It is classified separately as the internal durable-persistence substrate, not silently ignored.

### T10 — Local filesystem / process-local I/O

Examples:

- fs/readFile/writeFile;
- temp directories;
- local Git worktree operations;
- process-local memory/IPC.

These are not external provider/business boundaries unless the target itself is externally mounted or a child process performs external work.

### T11 — Inbound server/framework transport

Express, CORS, cookie-parser, pino-http, and similar inbound request infrastructure are not outbound call sites merely because they process network traffic.

### T12 — Internal loopback HTTP

Requests to Money Scout's own current-origin or `127.0.0.1` API are internal orchestration transports.

They require recursive target tracing but do not receive provider envelopes at the loopback hop.

## 3. Dependency inventory

### API server package

`artifacts/api-server/package.json` contains:

- @anthropic-ai/sdk;
- @openai/codex-sdk;
- @workspace/api-zod;
- @workspace/db;
- cookie-parser;
- cors;
- drizzle-orm;
- express;
- openid-client;
- pino;
- pino-http.

Dev/build packages do not create runtime provider call sites by dependency presence alone.

### Workspace root

Root package includes:

`@replit/connectors-sdk`.

The 98-file API-server source scan found no import/use of `@replit/connectors-sdk`.

Therefore:

`REPLIT_CONNECTORS_API_SERVER_RUNTIME_CALL_SITE = NONE_FOUND`.

This statement is scoped to the scanned API-server source universe.

## 4. Taxonomy-derived 98-file rescan result

The same explicit source universe remains:

`98 TypeScript files under artifacts/api-server/src`.

### Positive outbound mechanism categories found

1. T1 — `fetch`;
2. T5 — explicit DNS lookup;
3. T7 — child-process Git;
4. T8 — Anthropic SDK;
5. T8 — Codex SDK;
6. T8 — OIDC SDK;
7. T9 — Postgres persistence via @workspace/db/pg.

### Categories with no direct API-server source hit found

- native `node:http` request client;
- native `node:https` request client;
- `node:http2`;
- raw `node:tls` client;
- `node:dgram`;
- WebSocket/`ws`;
- socket.io client;
- EventSource;
- axios;
- got;
- node-fetch;
- undici as an explicitly imported request client;
- @replit/connectors-sdk.

### `node:net` nuance

`policy-checks.ts` imports `node:net`, but current use is:

`net.isIP(address)`.

That is local address classification, not socket creation.

Therefore:

`NODE_NET_CURRENT_USE = LOCAL_NON_TRANSPORT_HELPER`.

No raw TCP socket surface is established by that import.

## 5. S57 — Policy DNS Safety Resolution

### Source

`artifacts/api-server/src/routes/policy-checks.ts`

`assertPublicUrl(urlValue)` executes:

`await lookup(url.hostname, { all: true })`

using `node:dns/promises`.

This runs before policy HTTP retrieval to reject private-network destinations.

### Why it is a distinct surface

The DNS lookup is explicitly and independently invoked by Money Scout.

It is not merely an invisible transport implementation detail inside `fetch()`.

Therefore:

`EXPLICIT_DNS_LOOKUP != HTTP_FETCH_INTERNAL_TCP/TLS_MECHANICS`.

It must be represented separately from S52.

## 6. S57 topology

Correct conceptual topology:

`S57 DNS safety observation → public-address eligibility decision → S52 HTTP request`.

S57 does not replace S52.

S52 remains the actual HTTP document retrieval.

## 7. S57 C1/C2/identity

### C1

Current source does not establish that resolver queries consume no governed:

- quota;
- shared resolver capacity;
- platform entitlement;
- other scarce network resource.

Therefore:

`S57_C1 = NON_SCARCE_NOT_PROVEN`.

### C2

The DNS lookup itself does not mutate authoritative product/customer/financial/repository state.

It is a safety observation/gate for S52.

Therefore:

`S57_DIRECT_C2 = NO`.

A later HTTP request remains separately governed.

### Identity

There is no immutable per-DNS-request row before `lookup(...)`.

Therefore:

`S57_PREBOUNDARY_IDENTITY = NONE`.

### Cardinality

S57 is arbitrary-N.

Policy retrieval may resolve:

- initial source host;
- redirected hosts;
- discovered policy links;
- default terms/privacy/robots targets;
- repeated hostnames on separate request attempts.

No one-run/one-host assumption is allowed.

## 8. DNS safety-to-HTTP binding gap

Direct source order is:

1. `lookup(url.hostname, { all: true })`;
2. inspect returned addresses for private ranges;
3. later call `fetch(current, ...)`.

The explicit safety lookup result is not supplied to `fetch` as the frozen connection address.

Therefore the current code does not prove:

`DNS_SAFETY_OBSERVED_ADDRESS_SET == ACTUAL_HTTP_CONNECTION_ADDRESS_SET`.

This is a time-of-check/time-of-use binding gap.

The finding does not claim a successful exploit.

It establishes only that source code lacks an exact binding between:

- the addresses approved by the safety check; and
- the address actually used by the subsequent HTTP connection.

Package 02A/Boundary governance must not overclaim SSRF-address exactness from the current sequence.

## 9. S57 exact-target requirement

At minimum a governed DNS safety observation must bind:

- exact requested URL;
- normalized hostname;
- exact lookup attempt identity;
- returned address set;
- observation time;
- exact S52 request it gates.

Required relationship:

`S57_exact → S52_exact`.

If implementation intends the DNS result itself to prove connection safety, it additionally needs a transport design that binds the approved address to the actual request connection or otherwise proves equivalent safety.

## 10. S57 attack fixtures

### DNS-A1 — DNS invisibility

Explicit `lookup()` is omitted because only HTTP/SDK/subprocess calls count as external I/O.

Must fail coverage.

### DNS-A2 — one DNS result reused across arbitrary-N requests

One approved host resolution is attached to several later HTTP requests/redirect targets without exact binding.

Must fail.

### DNS-A3 — current/latest DNS substitution

A later lookup is used as proof of what addresses were approved for an earlier S52 attempt.

Must fail historical-path equality.

### DNS-A4 — safety lookup asserted as connection proof

System asserts the HTTP connection used one of the previously approved IPs even though current transport does not bind `fetch` to that address set.

Must fail assurance/exactness.

### DNS-A5 — hostname equality treated as address equality

Same hostname at two different times is treated as proof of same resolved address set.

Must fail.

## 11. External-auth transport exclusion

The taxonomy scan found `openid-client` in:

- `lib/auth.ts`;
- `middlewares/authMiddleware.ts`;
- `routes/auth.ts`.

Confirmed network-capable operations include:

- `oidc.discovery(...)`;
- `oidc.authorizationCodeGrant(...)`;
- `oidc.refreshTokenGrant(...)`.

These are real external requests.

They belong to platform/user authentication, not Money Scout's autonomous opportunity/product execution graph.

Add explicit exclusion:

`IOX-01 = EXTERNAL_PLATFORM_AUTH_TRANSPORT`.

Reason:

- authenticates a human/session;
- does not itself execute a Bet/product/provider action;
- does not substitute for R18/R20 execution authority;
- remains outside the S-numbered consequential execution ledger.

This exclusion is scope classification, not a statement that the calls are local or costless.

## 12. Internal database transport exclusion

Direct source:

`lib/db/src/index.ts`

creates:

`new pg.Pool({ connectionString: process.env.DATABASE_URL })`.

Database operations can therefore be network I/O.

Add explicit exclusion:

`IOX-02 = INTERNAL_DURABLE_PERSISTENCE_SUBSTRATE`.

Reason:

- canonical DB persistence is the mechanism by which Money Scout records authority/state/evidence;
- treating every SQL query as a separate external execution attempt would recursively turn the control-plane persistence mechanism itself into the governed downstream operation;
- provider/business side effects remain the Package-02A target.

This exclusion does not waive DB security, availability, transactionality, or retention requirements.

It only prevents SQL transport from being miscounted as an R18 execution attempt.

## 13. Third-party SDK disposition

### @anthropic-ai/sdk

Used directly.

Mapped to:

- S17 Autonomous Resolution;
- S53 Policy Anthropic analysis;
- S54 Demand;
- L012 Validation Evidence;
- L013 Kill-Risk;
- other previously mapped Anthropic research surfaces.

No new SDK family.

### @openai/codex-sdk

Used by `builder-provider-driver.ts`.

Mapped into the Builder Gateway provider execution family S01.

No new family from package identity alone.

### openid-client

Used for external auth traffic.

Explicitly classified IOX-01.

### @replit/connectors-sdk

Present at workspace root.

No import/use found in the 98-file API-server runtime source universe.

No live API-server call-site surface established.

## 14. Child-process completeness

The taxonomy requirement is category-level, not only "find execFile git."

All child-process forms are in scope:

- execFile / execFileSync;
- exec / execSync;
- spawn / spawnSync;
- fork.

Current 98-file source scan found `node:child_process` only in Builder Gateway, using `execFile`.

The invoked command is `git`.

Its external operations remain mapped as:

- S56 repository remote reads;
- S03 repository push/adoption.

Local Git status/config/checkout operations remain local subprocess work.

## 15. Persistent/evented transport completeness

No current API-server runtime source hit was found for:

- WebSocket;
- ws;
- socket.io-client;
- EventSource/SSE client.

Therefore no current numbered surface arises from these categories.

This is evidence about current source, not a permanent exemption.

Forward governance must rescan these categories when dependencies/source change.

## 16. Native socket completeness

No current socket-construction call was found for:

- net.Socket/net.connect/createConnection;
- tls.connect;
- dgram.createSocket;
- http/https/http2 request clients.

`net.isIP` is specifically excluded as local computation.

S57 covers the explicit DNS lookup that did occur.

## 17. Methodological rule going forward

The scan contract is now:

`SOURCE_UNIVERSE × EXPLICIT_IO_TAXONOMY × DEPENDENCY_INVENTORY`.

A future scan is incomplete unless it records a disposition for every taxonomy class, including zero-hit classes.

Do not treat:

- row count;
- file count;
- prior known transport families;
- package presence;
- absence of `fetch`;

as proof of I/O completeness by themselves.

## 18. Ledger changes

Add:

### L067 — S57 Policy DNS safety resolution

- source: `policy-checks.ts::assertPublicUrl`;
- operation: `dns.promises.lookup(hostname, {all:true})`;
- boundary: external resolver observation;
- M: M4;
- C1: NON_SCARCE_NOT_PROVEN;
- C2: NO direct;
- identity: NONE;
- target: exact hostname/URL + exact S52 request;
- cardinality: arbitrary-N;
- evidence: DIRECT.

Add exclusions:

### IOX-01 — External platform-auth transport

OIDC discovery/token operations.

### IOX-02 — Internal durable Postgres persistence transport

pg/Drizzle DB traffic.

These are not ILE rows because they are not localhost orchestration hops.

## 19. Numbered surface floor

Prior floor:

`56`.

Add:

- S57 Policy DNS Safety Resolution.

Therefore:

`CURRENT_NUMBERED_SURFACE_FLOOR = 57`.

Positive C2 adoption family count remains:

`6`.

S57 is an observation/safety-preflight family, not a seventh positive C2 adoption family.

## 20. Promotion effect

The prior statement that the broad 98-file scan was sufficient to approach zero-unmapped certification is superseded.

The correct state is:

`TRANSPORT_TAXONOMY_METHOD = NOW_EXPLICIT`

`98_FILE_TAXONOMY_RESCAN = COMPLETE_FOR_ENUMERATED_RUNTIME_CATEGORIES`

`S57_DISCOVERED = YES`

`AUTH_NETWORK_TRAFFIC_EXPLICITLY_SCOPED = YES`

`DB_NETWORK_TRAFFIC_EXPLICITLY_SCOPED = YES`

`RAW_SOCKET_CATEGORY_ZERO_HIT = RECORDED`

`WEBSOCKET_EVENTSOURCE_CATEGORY_ZERO_HIT = RECORDED`

`CHILD_PROCESS_ALL_FORMS_IN_SCOPE = YES`

`DEPENDENCY_MEDIATED_IO_INVENTORY = RECORDED`

`CURRENT_NUMBERED_SURFACE_FLOOR = 57`

`POSITIVE_C2_ADOPTION_FAMILIES = 6`

`FINAL_LEDGER_PROMOTION = NOT YET AUTHORIZED`

`PAIM_FREEZE_READY = NO`

`PACKAGE_02A_MAY_IMPLEMENT = NO`

## 21. Next gate

Before ledger promotion:

1. integrate S57/L067 and IOX-01/IOX-02 into the consolidated ledger;
2. reconcile all S01–S57 rows against the unresolved C2/adoption queue;
3. verify zero S-number/ILE/IOX entries remain unnamed;
4. run a dependency-delta check against the exact package manifests used by this scan;
5. only then consider ledger promotion.
