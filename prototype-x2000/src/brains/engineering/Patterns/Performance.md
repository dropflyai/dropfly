# Performance Engineering Patterns

## What This Enables

Performance engineering is not tuning -- it is the disciplined application of
queueing theory, computer architecture, and measurement science to reason about
system behavior under load. These patterns provide the formal foundations to
(a) predict throughput and latency before deployment, (b) identify bottlenecks
from first principles rather than guesswork, and (c) make architectural
decisions whose cost-benefit tradeoffs are quantifiable.

---

### Little's Law (L = lambda * W)

#### Formal Statement

Little's Law, proven by John D.C. Little in 1961, states that for any stable
system in steady state:

```
L = lambda * W
```

- **L** -- average number of items (requests, jobs) in the system
- **lambda** -- average arrival rate
- **W** -- average sojourn time (time each item spends in the system)

#### Derivation Sketch

Observe a system over interval [0, T]. Let A(T) be arrivals and D(T) departures.

- Time-average number in system: L_T = (1/T) * integral_0^T N(t) dt
- Average arrival rate: lambda_T = A(T) / T
- Average sojourn time: W_T = (1/A(T)) * sum_{i=1}^{A(T)} W_i

The integral of N(t) over [0, T] equals the sum of individual sojourn times for
all customers who both arrived and departed within the interval. As T approaches
infinity, boundary effects vanish and L = lambda * W. The proof requires only
stability (long-run arrival rate equals departure rate). It is distribution-free:
it holds regardless of arrival distribution, service distribution, server count,
or queueing discipline.

#### Implications for Capacity Planning

1. At lambda = 500 req/s with W = 200ms, you need L = 100 concurrent connections.
2. A pool capped at 50 sustains at most lambda = 50/0.2 = 250 req/s before
   unbounded queueing.
3. Reducing W directly reduces L, which reduces memory, file descriptors, and
   context-switching overhead.

---

### Amdahl's Law and the Universal Scalability Law

#### Amdahl's Law

Amdahl's Law (1967) bounds speedup S(N) across N processors:

```
S(N) = 1 / ( (1 - p) + p/N )
```

where p is the parallelizable fraction. As N approaches infinity, S(N) approaches
1/(1 - p). If 95% of work is parallel, maximum speedup is 20x -- regardless of
processor count.

#### Universal Scalability Law (Gunther)

Neil Gunther's USL extends Amdahl's model to account for coherence overhead --
the cost of keeping shared state consistent across parallel workers:

```
C(N) = N / ( 1 + sigma*(N - 1) + kappa*N*(N - 1) )
```

- **sigma** -- contention parameter (serialization, analogous to Amdahl's serial fraction)
- **kappa** -- coherency parameter (cost of maintaining consistency)

When kappa > 0, throughput C(N) reaches a maximum and then *decreases*
(retrograde scalability). This models real distributed systems where adding nodes
degrades performance due to coordination overhead (distributed lock contention,
cache invalidation storms, consensus protocol latency).

#### Practical Application

Fit the USL to benchmark data at N = 1, 2, 4, 8, 16... nodes via nonlinear
regression to obtain sigma and kappa. If kappa dominates, reduce shared mutable
state (partition data, adopt CRDTs). If sigma dominates, reduce serial sections
(database writes, global locks, leader election).

---

### Caching Hierarchy

Modern systems employ a layered caching hierarchy, trading capacity for speed:

```
Layer              Latency        Capacity       Location
------------------------------------------------------------
L1 CPU Cache       ~1 ns          64 KB          Per core
L2 CPU Cache       ~4 ns          256 KB         Per core
L3 CPU Cache       ~12 ns         8-64 MB        Shared across cores
Main Memory        ~100 ns        16-512 GB      Per machine
Application Cache  ~1-5 ms        1-100 GB       Redis, Memcached
CDN Edge Cache     ~10-50 ms      Distributed    Global edge PoPs
Browser Cache      0 ms (local)   Varies         End-user device
```

**Design principles**: Cache size must accommodate the working set (Denning,
1968) -- the set of items accessed within a given time window. If the working set
exceeds cache capacity, thrashing occurs and hit rate collapses. Cold caches
after deployment or failover cause latency spikes; implement prewarming.

---

### Cache Access Patterns

#### Cache-Aside (Lazy Loading)

Application checks cache first; on miss, reads from store, populates cache:

```
read(key):
    value = cache.get(key)
    if value is None:
        value = db.query(key)
        cache.set(key, value, ttl=300)
    return value
```

Simple but susceptible to thundering herd on expiration. Mitigate with
probabilistic early recomputation (XFetch algorithm) or distributed locking.

#### Read-Through

The cache loads from the backing store on miss. Application interacts only with
the cache interface. Simplifies application code at the cost of coupling the
cache to the data layer.

#### Write-Through

Writes go to cache and backing store synchronously. Guarantees consistency but
increases write latency. Suitable for read-heavy workloads requiring consistency.

#### Write-Behind (Write-Back)

Writes go to cache immediately; cache flushes to store asynchronously. Enables
write coalescing. Risk: data loss on cache failure before flush. Mitigate with
write-ahead logs or replicated caches.

#### Pattern Selection Matrix

```
Pattern         Consistency    Write Latency   Read Latency   Complexity
------------------------------------------------------------------------
Cache-Aside     Eventual       N/A (direct)    Miss penalty   Low
Read-Through    Eventual       N/A (direct)    Miss penalty   Medium
Write-Through   Strong         Higher          Low (warm)     Medium
Write-Behind    Eventual       Low             Low (warm)     High
```

---

### N+1 Query Detection and Resolution

#### The Problem

An N+1 query fetches N entities then issues one query per entity for a relation:

```python
orders = db.query("SELECT * FROM orders LIMIT 100")
for order in orders:
    order.customer = db.query(
        "SELECT * FROM customers WHERE id = %s", order.customer_id
    )
```

For N=100 this issues 101 queries. At 2ms network RTT each, total is 202ms
versus ~4ms for a single joined query.

#### Detection

1. **Query counting**: Instrument the ORM to log queries per request; flag any
   request exceeding a threshold (e.g., 10 queries).
2. **APM correlation**: Group queries by trace ID. N+1 appears as repeated
   identical templates with varying parameters.
3. **Static analysis**: `bullet` (Ruby), `nplusone` (Python) detect misconfigurations.

#### Resolution

1. **Eager loading (JOIN)**: Single query with JOIN.
2. **Batch loading (IN clause)**: Collect foreign keys, issue one
   `WHERE id IN (...)` -- the DataLoader pattern (Facebook, 2010).
3. **Subquery prefetching**: e.g., Django's `prefetch_related()`.
4. **Denormalization**: Store related data on the parent entity.

---

### Core Web Vitals

Google's Core Web Vitals quantify user-perceived performance. Measured in the
field (RUM) and lab (Lighthouse, WebPageTest).

#### Largest Contentful Paint (LCP)

Render time of the largest visible image or text block. Good: <= 2.5s. Poor: > 4s.
Levers: preload critical resources, modern image formats (AVIF/WebP), CDN,
eliminate render-blocking resources, SSR for above-the-fold content.

#### Interaction to Next Paint (INP)

Replaced FID in March 2024. Reports the worst interaction latency across the
page lifecycle (98th percentile for high-interaction pages). Good: <= 200ms.
Poor: > 500ms. Levers: break long tasks via `scheduler.yield()`, minimize
main-thread JS, use web workers, debounce rapid input handlers.

#### Cumulative Layout Shift (CLS)

Sum of layout shift scores for position changes not triggered by user input.
Good: <= 0.1. Poor: > 0.25. Levers: explicit `width`/`height` on images,
CSS `aspect-ratio` for dynamic content, avoid content insertion above fold.

#### Measurement Methodology

- **Field**: CrUX, `web-vitals` JS library, RUM services. Reports 75th percentile.
- **Lab**: Lighthouse (simulated throttling), WebPageTest (real device on 3G).
- Field and lab can diverge significantly. Prioritize field data for business
  decisions; use lab data for debugging and pre-deployment validation.

---

### Tail Latency and Hedged Requests

#### The Tail Latency Problem

Dean and Barroso (2013) showed that in fan-out architectures, tail latency
dominates user-perceived latency. If a request fans out to N services:

```
P(at least one exceeds p99) = 1 - (0.99)^N
```

For N=100: 63.4% of requests hit tail latency from at least one backend.

#### Hedged Requests

Issue the same request to multiple replicas; return whichever responds first.

- **Immediate hedging**: Send to two replicas simultaneously. Doubles load.
- **Delayed hedging (tied requests)**: Send to one; if no response within p95
  latency, send duplicate. Adds ~5% load, substantially reduces tail latency.
- **Cancellation tokens**: When one replica responds, cancel the other.

Appropriate when: (a) operation is idempotent, (b) system has spare capacity,
(c) tail latency stems from transient variability (GC pauses, network jitter)
rather than systematic overload.

---

### The USE Method (Brendan Gregg)

Analyze every resource through three lenses:

- **Utilization**: Percentage of time busy or capacity consumed.
- **Saturation**: Extra work queued that cannot be serviced.
- **Errors**: Count of error events on the resource.

#### Application to Common Resources

```
Resource        Utilization             Saturation              Errors
---------------------------------------------------------------------------
CPU             %usr + %sys (mpstat)    Run queue length        Machine check exceptions
Memory          Used / Total            Swap activity (si/so)   OOM kills
Disk I/O        %util (iostat)          avgqu-sz (iostat)       Device errors
Network         Bytes/s vs capacity     TCP retransmits         Interface errors
Conn Pool       Active / Max            Queue depth             Timeout errors
Thread Pool     Active / Max            Task queue size         Rejected executions
```

#### Methodology

1. Enumerate all resources (CPU, memory, disk, network, pools, FDs).
2. For each, measure utilization, saturation, and errors.
3. High utilization (>70%), non-zero saturation, or errors indicate bottlenecks.
4. Investigate highest severity first.

The USE method's power is completeness: it prevents the tunnel vision that leads
engineers to optimize the wrong component.

---

### Connection Pooling and Resource Management

#### Why Pooling Matters

TCP handshake costs ~1 RTT; TLS adds 1-2 more; databases add auth/session setup.
At 1000 req/s with 1ms connection overhead, you waste 1 full CPU-second per
second. Pools amortize establishment cost across many requests.

#### Pool Sizing

From Little's Law: pool needs L = lambda * W connections. Add headroom:

```
pool_size = ceil(lambda * W * (1 + coefficient_of_variation))
```

PostgreSQL recommends max (2 * CPU_cores + disk_count) connections per instance.
Beyond this, context-switching degrades throughput. Use a multiplexer (PgBouncer,
ProxySQL) when app-side pools exceed database limits.

#### Health Checking

- **Validate on borrow**: Test before use. Adds latency, prevents broken conns.
- **Background validation**: Periodically test idle connections; evict stale ones.
- **Max lifetime**: Evict after fixed duration for session hygiene and failover.
- **Idle timeout**: Reclaim connections held too long by slow consumers.

#### Pool Exhaustion Strategies

1. **Fail fast**: Error immediately. Preserves existing latency.
2. **Queue with timeout**: Wait up to T ms. Balances availability and latency.
3. **Circuit breaker**: After repeated exhaustion, redirect to fallback.

---

### Practical Implications

1. Always instrument before optimizing. Apply USE to identify the actual
   bottleneck before forming hypotheses.
2. Use Little's Law (L = lambda * W) as your capacity calculator. If you cannot
   measure lambda and W, you are not ready for capacity decisions.
3. Amdahl's Law sets hard ceilings. 10% serial execution caps gains at 10x. The
   USL warns that coordination can cause retrograde behavior.
4. Cache at the right layer. Do not cache at the app level what the CDN should
   handle. Each layer has different invalidation and consistency semantics.
5. Choose cache patterns by consistency needs. Write-through for strong
   consistency; write-behind for write-heavy eventual consistency; cache-aside
   for simplicity.
6. N+1 queries are the most common ORM performance defect. Instrument query
   counts per request in development; alert in production.
7. Optimize for p99, not median. A 10ms median with 5s p99 is slow in fan-out.
8. Hedged requests trade server load for reduced tail latency. Only use with
   idempotent operations and capacity headroom.
9. Right-size connection pools via Little's Law. Oversized pools cause DB
   contention; undersized pools cause application-layer queueing.
10. Core Web Vitals correlate with business metrics. Optimize LCP, INP, and CLS
    because they drive conversion and retention.

---

### Common Misconceptions

**"Adding more caching always improves performance."**
Only when hit rate offsets management overhead. A 20% hit rate on a fast store
adds complexity without benefit. E[latency] = hit_rate * cache_latency +
(1 - hit_rate) * origin_latency.

**"Horizontal scaling solves all throughput problems."**
The USL shows coordination costs (kappa) can cause throughput to *decrease*
with additional nodes. Systems with high shared mutable state often exhibit
retrograde scalability.

**"Average latency is a meaningful metric."**
A bimodal distribution at 5ms/500ms has a 252.5ms average describing neither
mode. Report percentiles: p50, p90, p95, p99, p99.9 at minimum.

**"The database is always the bottleneck."**
CPU saturation, memory pressure, network bandwidth, DNS, TLS, GC pauses, and
pool exhaustion are all common non-database bottlenecks. Apply USE first.

**"Premature optimization is always bad."**
Knuth's full quote includes: "Yet we should not pass up our opportunities in
that critical 3%." Architectural decisions -- data structures, communication
patterns, caching strategy -- are design, not premature optimization.

**"More threads means more throughput."**
Beyond CPU core count, additional threads increase context-switching and lock
contention. For I/O-bound work, async I/O (epoll, kqueue, io_uring) achieves
higher concurrency with fewer threads.

---

### Further Reading

1. Little, J.D.C. (1961). "A Proof for the Queuing Formula: L = lambda * W." *Operations Research*, 9(3), 383-387.
2. Little, J.D.C. and Graves, S.C. (2008). "Little's Law." In *Building Intuition*, Springer, pp. 81-100.
3. Amdahl, G.M. (1967). "Validity of the Single Processor Approach." *AFIPS Conference Proceedings*, 30.
4. Gunther, N.J. (2007). *Guerrilla Capacity Planning*. Springer.
5. Dean, J. and Barroso, L.A. (2013). "The Tail at Scale." *CACM*, 56(2), 74-80.
6. Gregg, B. (2020). *Systems Performance*, 2nd ed. Addison-Wesley.
7. Denning, P.J. (1968). "The Working Set Model." *CACM*, 11(5), 323-333.
8. Harchol-Balter, M. (2013). *Performance Modeling and Design of Computer Systems*. Cambridge UP.
9. Vattani, A. et al. (2015). "Optimal Probabilistic Cache Stampede Prevention." *VLDB Endowment*, 8(8).
10. Knuth, D.E. (1974). "Structured Programming with go to Statements." *Computing Surveys*, 6(4), 261-301.
