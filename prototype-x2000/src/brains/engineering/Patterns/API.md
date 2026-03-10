# API Design Patterns

## What This Enables

API design theory provides the principled framework for constructing programmatic interfaces that remain correct, evolvable, and performant across organizational and temporal boundaries. It explains why certain endpoint structures degrade under scale, why versioning strategies have non-obvious compatibility implications, and why naive rate limiting fails under bursty workloads. This knowledge prevents engineers from building APIs that silently break clients, produce inconsistent state under concurrent mutation, or collapse under load patterns that proper throttling algorithms handle gracefully. Mastery of these patterns is the difference between an API that survives a decade of evolution and one that requires a ground-up rewrite within two years.

---

## Architectural Styles

### REST (Representational State Transfer)

REST is not a protocol but an architectural style defined by six constraints (Fielding, 2000):

1. **Client-Server:** Separation of concerns between UI and data storage.
2. **Stateless:** Each request contains all information necessary for processing. No session state on the server.
3. **Cacheable:** Responses must implicitly or explicitly label themselves as cacheable or non-cacheable.
4. **Uniform Interface:** Resource identification via URIs, resource manipulation through representations, self-descriptive messages, and hypermedia as the engine of application state (HATEOAS).
5. **Layered System:** Intermediaries (proxies, gateways, CDNs) may exist between client and server without the client's knowledge.
6. **Code-on-Demand (optional):** Servers may extend client functionality by transferring executable code.

**The Richardson Maturity Model** classifies REST implementations:
- **Level 0:** Single URI, single HTTP method (RPC-over-HTTP).
- **Level 1:** Multiple URIs (resources) but single HTTP method.
- **Level 2:** Multiple URIs with proper HTTP verbs and status codes.
- **Level 3:** Hypermedia controls (HATEOAS). Full REST as Fielding defined it.

Most production APIs operate at Level 2. Level 3 adoption remains limited due to tooling gaps, though it provides the strongest decoupling between client and server.

### GraphQL

GraphQL (Facebook, 2015) is a query language for APIs that inverts the control of data shape from server to client. Single endpoint, client-specified queries, strongly typed introspectable schema, no over-fetching or under-fetching.

**GraphQL vs REST Decision Framework:**

| Factor | Favor REST | Favor GraphQL |
|--------|-----------|---------------|
| Client diversity | Homogeneous clients | Heterogeneous clients (web, mobile, IoT) |
| Data relationships | Flat, resource-oriented | Deeply nested, graph-like |
| Caching needs | HTTP caching sufficient | Fine-grained, field-level caching needed |
| Team structure | Backend-driven | Frontend-driven |
| Real-time needs | SSE/WebSocket adequate | Subscriptions integral to data model |
| API surface | Stable, well-defined | Rapidly evolving, exploratory |

**Critical tradeoffs:** GraphQL shifts complexity from the network layer to the server's query execution layer. N+1 query problems, query depth attacks, and field-level authorization require solutions (DataLoader, query complexity analysis, schema directives) that REST avoids by construction.

### gRPC

gRPC (Google, 2015) is a high-performance RPC framework built on HTTP/2 and Protocol Buffers. Binary serialization (protobuf) yields significantly smaller payloads than JSON. Supports four communication patterns: unary, server streaming, client streaming, and bidirectional streaming. Code generation produces client and server stubs from `.proto` definitions. Built-in deadline propagation across service boundaries.

**Use gRPC for:** Internal service-to-service communication, polyglot environments, streaming workloads, performance-critical paths. **Avoid for:** Browser-facing APIs (requires gRPC-Web proxy), APIs needing human-readable payloads, ecosystems lacking mature gRPC tooling.

---

## Versioning Strategies

API versioning manages the tension between evolution and backward compatibility.

### URI Path Versioning

```
GET /v1/users/123
GET /v2/users/123
```

**Advantages:** Explicit, cacheable, trivially routable by API gateways.
**Disadvantages:** Violates REST's principle that a URI identifies a resource. Proliferates endpoints.

### Header Versioning

```
GET /users/123
Accept: application/vnd.api+json; version=2
```

**Advantages:** Clean URIs. Follows content negotiation semantics (RFC 7231).
**Disadvantages:** Harder to test, invisible in access logs without configuration.

### Query Parameter Versioning

```
GET /users/123?version=2
```

**Advantages:** Easy to test and share. **Disadvantages:** Pollutes query namespace, semantically incorrect.

### Evolutionary Design (Recommended)

The most resilient strategy avoids explicit versioning by designing for non-breaking evolution:

1. **Additive changes only:** New fields, new endpoints, new optional parameters.
2. **Robustness principle (Postel's Law):** Be conservative in what you send, liberal in what you accept.
3. **Deprecation with sunset headers (RFC 8594):** Signal retirement timelines programmatically.
4. **Expand-contract pattern:** Add the new form, support both, remove the old form.

When breaking changes are unavoidable, URI path versioning is the most pragmatic choice for public APIs.

---

## Rate Limiting

Rate limiting protects APIs from abuse, ensures fair resource allocation, and prevents cascade failures.

### Token Bucket

A bucket holds up to B tokens. Tokens are added at rate R per second. Each request consumes one token. If the bucket is empty, the request is rejected. **Formal model:** `tokens(t) = min(B, tokens(t-1) + R * dt) - requests_in_dt`. Permits bursts up to size B while enforcing average rate R. The most widely deployed algorithm (AWS API Gateway, Stripe, GitHub).

### Leaky Bucket

Requests enter a FIFO queue of fixed capacity. The queue drains at a constant rate. If full, incoming requests are discarded. Produces perfectly smooth output regardless of input burstiness. No burst allowance.

### Sliding Window Log

Maintain a log of timestamps per request. For window W, count entries within [now - W, now]. Reject if count exceeds limit. Precise but O(requests per window) memory per client.

### Sliding Window Counter

Combine current window count with weighted previous window count: `estimated_count = prev_count * (1 - elapsed/window_size) + current_count`. O(1) memory per client, bounded approximation error. Used by Cloudflare and Redis-based rate limiters.

### Response Headers

```
RateLimit-Limit: 100
RateLimit-Remaining: 42
RateLimit-Reset: 1625097600
Retry-After: 30
```

Return HTTP 429 (Too Many Requests) when limits are exceeded. Always include `Retry-After` (RFC 6585, draft-ietf-httpapi-ratelimit-headers).

---

## Pagination

Pagination prevents unbounded response sizes and controls database query cost.

### Offset-Based Pagination

`GET /items?offset=40&limit=20`

Simple and supports arbitrary page jumps. **Formal cost:** For offset O and limit L, database cost is O(O + L) even though only L rows are returned. Inconsistent under concurrent writes -- items may be skipped or duplicated.

### Cursor-Based (Keyset) Pagination

`GET /items?after=eyJpZCI6MTAwfQ&limit=20`

The cursor encodes the last row's sort key (base64-encoded for opacity). O(L) database cost regardless of position. Stable under concurrent writes. Cannot jump to arbitrary pages.

```sql
-- Offset (slow at depth)
SELECT * FROM items ORDER BY created_at DESC LIMIT 20 OFFSET 10000;

-- Keyset (constant performance)
SELECT * FROM items WHERE created_at < '2024-01-15T10:30:00Z'
ORDER BY created_at DESC LIMIT 20;
```

**Recommendation:** Use cursor-based pagination for all list endpoints. Reserve offset pagination only for administrative interfaces with bounded dataset sizes.

---

## Idempotency

Idempotency ensures that executing an operation multiple times produces the same result as executing it once. Essential for safe retries in unreliable networks.

**Formal definition:** A function f is idempotent if f(f(x)) = f(x) for all x.

**HTTP method idempotency (RFC 7231):**

| Method | Idempotent | Safe |
|--------|-----------|------|
| GET | Yes | Yes |
| PUT | Yes | No |
| DELETE | Yes | No |
| POST | No | No |
| PATCH | No* | No |

### Idempotency Keys

For non-idempotent operations (POST), clients supply a unique key:

```
POST /payments
Idempotency-Key: 550e8400-e29b-41d4-a716-446655440000
```

**Server-side implementation:** (1) Receive request with key. (2) Check idempotency store. (3) If found, return stored response without re-execution. (4) If not found, execute operation, store full response (status, headers, body), return response. (5) Use atomic compare-and-swap to prevent concurrent execution of the same key.

Keys should expire after a defined TTL (typically 24-72 hours). Use a persistent store -- in-memory stores risk replay on restart. Idempotency must be implemented at the outermost layer; if the API gateway retries to a different instance without forwarding the key, the guarantee is violated.

---

## Error Handling: RFC 7807 Problem Details

RFC 7807 (Nottingham & Wilde, 2016) defines a standard format for machine-readable error responses.

```json
{
  "type": "https://api.example.com/errors/insufficient-funds",
  "title": "Insufficient Funds",
  "status": 422,
  "detail": "Account 12345 has balance $10.00, but transfer requires $50.00.",
  "instance": "/transfers/abc-123"
}
```

**Required fields:** `type` (URI identifying the error type), `title` (short human-readable summary), `status` (HTTP status code). **Optional:** `detail` (occurrence-specific explanation), `instance` (URI for this occurrence). Extension members (e.g., `balance`, `required_amount`) are permitted and encouraged.

**Content type:** `application/problem+json`. Advantages over ad hoc errors: standardized parsing, self-documenting error types via URI dereferencing, consistent client handling, extensibility without breaking the base schema.

---

## Backend for Frontend (BFF) Pattern

The BFF pattern (Newman, 2015) interposes a dedicated backend between each frontend platform and downstream microservices.

```
Mobile App  --> Mobile BFF  --\
Web App     --> Web BFF     ---+--> Microservices
CLI Tool    --> CLI BFF     --/
```

Different clients have fundamentally different needs: mobile requires minimal payloads and offline support; web SPAs need richer data and WebSocket connections; third-party APIs demand stable contracts. A single general-purpose API either under-serves all clients or accumulates client-specific logic into an unmaintainable monolith.

**Design rules:** One BFF per client platform. BFFs are thin (aggregate and transform, no business logic). BFF ownership follows frontend team ownership. BFFs deploy independently.

**Avoid BFF when:** single-client system, team too small for per-client backends, or API gateway transformation plugins suffice.

---

## API Design Principles

### Contract-First Design (API-First)

Define the OpenAPI specification before writing implementation code. Review with stakeholders, generate server stubs and client SDKs, implement against the spec, validate compliance in CI. Tooling: OpenAPI 3.1, Stoplight Spectral for linting, Prism for mock servers.

### HATEOAS (Hypermedia as the Engine of Application State)

The most frequently omitted REST constraint. Responses include links describing available state transitions:

```json
{
  "id": 123, "status": "pending",
  "_links": {
    "self": { "href": "/orders/123" },
    "approve": { "href": "/orders/123/approve", "method": "POST" },
    "cancel": { "href": "/orders/123/cancel", "method": "POST" }
  }
}
```

Clients discover capabilities dynamically rather than hardcoding endpoint knowledge. This is the mechanism by which REST achieves independent evolvability -- the property Fielding considers most important. Most valuable in long-lived enterprise integrations where decoupling justifies the added complexity.

### Resource Naming Conventions

Nouns not verbs (`/users`, not `/getUsers`). Plural collections (`/users/123`). Hierarchical relationships (`/users/123/orders/456`). Actions as sub-resources when CRUD is insufficient (`/orders/123/cancel` via POST). `snake_case` for JSON fields, `kebab-case` for URI segments.

---

## Practical Implications

1. **Start with REST at Richardson Maturity Level 2.** Widest ecosystem compatibility, most mature tooling, simplest operational model. Introduce GraphQL or gRPC only when measured requirements demand it.

2. **Design for evolution, not versioning.** Additive-only changes with Postel's Law compliance eliminate most versioning needs. When breaking changes are unavoidable, URI versioning is the most operationally transparent strategy.

3. **Implement idempotency keys on all mutating endpoints from day one.** Retrofitting idempotency is architecturally expensive. The upfront cost is trivial compared to debugging duplicate charges.

4. **Use cursor-based pagination for all unbounded collections.** Offset pagination creates a latent performance cliff that manifests only at scale -- precisely when migration is most difficult.

5. **Adopt RFC 7807 problem details as the universal error format.** Standardized errors reduce client integration time and enable generic error-handling middleware.

6. **Rate limit at multiple granularities.** Per-API-key for abuse prevention; per-endpoint for expensive operations; global for infrastructure protection. Token bucket for most cases; sliding window counters when burst tolerance is unacceptable.

7. **Treat the OpenAPI specification as source of truth.** Generate documentation, SDKs, stubs, and contract tests from the spec. A specification that diverges from implementation is worse than no specification.

8. **Deploy BFFs when client requirements diverge measurably.** The trigger is when client-specific aggregation logic begins accumulating in the shared API layer.

---

## Common Misconceptions

1. **"REST means JSON over HTTP with CRUD endpoints."** REST is an architectural style with six constraints, of which most implementations satisfy only two or three. What most engineers call "REST" is more accurately described as "HTTP-based resource APIs at Richardson Maturity Level 2." True REST requires HATEOAS.

2. **"GraphQL replaces REST."** GraphQL solves specific problems (client-driven queries, reducing round trips for nested data) and introduces specific costs (query complexity management, caching difficulty, N+1 resolution). It is a complementary tool, not a successor.

3. **"PUT and PATCH are interchangeable."** PUT replaces the entire resource representation. PATCH applies a partial modification. JSON Merge Patch (RFC 7396) and JSON Patch (RFC 6902) formalize PATCH semantics.

4. **"Rate limiting is only about preventing abuse."** Rate limiting also serves as a backpressure mechanism, capacity planning signal, and fairness enforcement tool. It protects the API from its own legitimate users during traffic spikes.

5. **"API versioning means maintaining multiple live implementations."** With evolutionary design, versioning is a routing concern. Version-specific adapters translate between client format and canonical implementation. Multiple live implementations indicate a design failure.

6. **"Idempotency is a GET/PUT concern only."** The critical challenge is on POST and non-idempotent PATCH operations, which require explicit idempotency key mechanisms because the protocol provides no built-in guarantee.

7. **"Pagination is a frontend concern."** Pagination is fundamentally a database and infrastructure concern. Without it, a single API call can trigger a full table scan, exhaust server memory, and cascade-fail downstream services.

---

## Further Reading

- **Fielding, R.T.** *Architectural Styles and the Design of Network-based Software Architectures* (2000) -- Fielding's doctoral dissertation defining REST. The primary source, widely cited but rarely read in full.
- **Fielding, R.T. & Reschke, J.** RFC 7230-7235: HTTP/1.1 Specification (2014) -- The authoritative HTTP semantics. Prerequisite to correct API design.
- **Nottingham, M. & Wilde, E.** RFC 7807: Problem Details for HTTP APIs (2016) -- Standard error response format. Short, essential reading.
- **Masse, M.** *REST API Design Rulebook* (O'Reilly, 2011) -- Practical URI design, method semantics, and media type conventions.
- **Lauret, A.** *The Design of Web APIs* (Manning, 2019) -- Comprehensive treatment of API design as a discipline.
- **Siriwardena, P. & Dias, N.** *Microservices Security in Action* (Manning, 2020) -- OAuth 2.0, JWT, and API security patterns.
- **Higginbotham, J.** *Principles of Web API Design* (Addison-Wesley, 2021) -- Activity-centered design methodology for APIs.
- **Richardson, L.** "Justice Will Take Us Millions of Intricate Moves" (2008) -- The original REST maturity model presentation.
- **Sturgeon, P.** *Build APIs You Won't Hate* (2015) -- Pragmatic guide to API design tradeoffs.
- **Hartig, O. & Perez, J.** "Semantics and Complexity of GraphQL" (2018, WWW Conference) -- Formal analysis of GraphQL query semantics and computational complexity.
- **IETF Draft: RateLimit Header Fields** (draft-ietf-httpapi-ratelimit-headers) -- Emerging standard for rate limit response headers.

---

## Cross-References

- **Distributed Systems** (`theory/distributed_systems.md`) -- CAP theorem implications for API consistency guarantees; consensus protocols underlying distributed rate limiters.
- **Performance** (`Patterns/Performance.md`) -- Caching strategies, connection pooling, and serialization overhead for API optimization.
- **Observability** (`Patterns/Observability.md`) -- API metrics (latency percentiles, error rates, saturation), distributed tracing across service boundaries.
- **Testing** (`Patterns/Testing.md`) -- Contract testing, consumer-driven contracts (Pact), and API integration test strategies.
- **State Management** (`Patterns/StateManagement.md`) -- Client-side cache invalidation, optimistic updates, and server-state synchronization patterns.
