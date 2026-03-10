# Observability

## What This Enables

Observability is the property of a system that allows its internal states to be
inferred from its external outputs. The term originates from control theory
(Kalman, 1960), where a system is observable if and only if the current state
can be determined in finite time using only the outputs. In distributed software
systems, observability grants operators the capacity to ask arbitrary,
previously unanticipated questions about production behavior without deploying
new instrumentation -- in contrast to traditional monitoring, which answers only
the questions encoded at design time.

A well-instrumented system reduces mean time to detection (MTTD) and mean time
to resolution (MTTR) by orders of magnitude. It converts reliability from an
aspiration into a measurable, budgetable quantity and enables principled
tradeoffs between feature velocity and system stability.

---

### The Three Pillars of Observability

#### Logs

A log is an append-only, immutable record of a discrete event at a specific
point in time. Each entry is a tuple `(timestamp, severity, context, payload)`
where `context` includes trace ID, span ID, and service name. Logs provide the
highest-fidelity record of individual events but suffer combinatorial explosion
at scale, making exhaustive retention infeasible without sampling or tiered
storage.

#### Metrics

A metric is a numeric measurement aggregated over a time interval -- a time
series `M: T -> R` identified by a name and key-value label pairs. The four
fundamental types are: **Counter** (monotonically increasing cumulative total),
**Gauge** (point-in-time value), **Histogram** (client-side bucketed
aggregation for percentile estimation), and **Summary** (streaming quantiles
over a sliding window, non-aggregable across instances). Metrics answer "what
is happening" across aggregates but cannot explain "why" for individual
requests.

#### Traces

A distributed trace is a directed acyclic graph (DAG) of causally related
spans. A span is a tuple `(trace_id, span_id, parent_span_id, operation_name,
start_time, duration, attributes, events, status)`. The `trace_id` is a
globally unique 128-bit identifier shared by all spans in a request. Traces
provide the connective tissue between logs and metrics, enabling operators to
follow a single request through an entire distributed system.

---

### The RED Method

Formalized by Tom Wilkie and derived from Google's Four Golden Signals (Beyer
et al., 2016), RED defines three signals for request-driven microservices:

1. **Rate** -- Requests per second: `rate(http_requests_total[interval])`.
   A sudden drop may indicate upstream failures, not just reduced traffic.
2. **Errors** -- Failed requests as a ratio:
   `rate(http_requests_total{status=~"5.."}[interval]) / rate(http_requests_total[interval])`.
   Distinguish client errors (4xx) from server errors (5xx).
3. **Duration** -- Response latency distribution via histograms, not averages.
   Report p50, p95, and p99. Tail latencies disproportionately affect user
   experience due to fan-out amplification (Dean & Barroso, 2013).

---

### The USE Method

Developed by Brendan Gregg (2013) for resource-constrained components. For
every resource (CPU, memory, disk, network, mutex, thread pool):

1. **Utilization** -- Fraction of time busy or capacity consumed. For CPU:
   `U = 1 - idle_fraction`. The critical threshold varies by resource type;
   CPUs degrade gracefully under high utilization while mechanical disks do not.
2. **Saturation** -- Extra work the resource cannot service, measured as queue
   depth (run-queue length, I/O queue depth, transmit backlog). Sustained
   saturation above zero indicates a bottleneck.
3. **Errors** -- Resource error events: disk I/O errors, packet drops, ECC
   corrections. Frequently ignored in application monitoring yet root cause of
   a significant class of production incidents.

The method is exhaustive by design: enumerating all resources and checking U, S,
and E for each systematically eliminates bottlenecks.

---

### OpenTelemetry Architecture

OpenTelemetry (OTel) is the CNCF vendor-neutral framework for telemetry,
merging OpenTracing and OpenCensus. It defines three signal types (traces,
metrics, logs) with a fourth (profiling) under development.

**SDK pipeline**: `[Instrumentation] -> [Processor] -> [Exporter]`. The API
layer provides a no-op instrumentation surface (Tracer, Meter, Logger) ensuring
zero overhead without an SDK. The SDK implements configurable processors,
samplers (head-based for simplicity, tail-based for preserving interesting
traces), and exporters.

**Collector**: A standalone binary with `[Receivers] -> [Processors] ->
[Exporters]`. Receivers accept OTLP, Jaeger, Zipkin, Prometheus formats.
Processors handle batching, enrichment, sampling, and filtering. Exporters
send to any OTLP-compatible backend. This decouples instrumentation from
backend: migrations become configuration changes, not code changes.

**OTLP**: The wire protocol supporting gRPC and HTTP/protobuf, defining a
canonical data model that eliminates lossy format conversions.

---

### SLIs, SLOs, and SLAs

Formalized in the Google SRE literature (Beyer et al., 2016; Murphy et al.,
2018):

**SLI (Service Level Indicator)**: A ratio `SLI = (good events / total events)
* 100%`. Examples: availability (non-5xx proportion), latency (requests under
threshold), correctness (expected results). Measure at the point closest to
the user.

**SLO (Service Level Objective)**: A target for an SLI over a rolling window,
e.g., `99.9% over 30 days`. Too aggressive (99.999%) consumes engineering on
diminishing returns; too lax (95%) erodes user trust.

**SLA (Service Level Agreement)**: A contractual obligation with financial
consequences. Always less stringent than the internal SLO, providing a buffer.

---

### Error Budgets and Error Budget Policies

The error budget is the complement of the SLO: `budget = 1 - target`. For
99.9% over 30 days: `0.001 * 43,200 minutes = 43.2 minutes/month`. The budget
should be *spent* on velocity, deployments, and experiments.

An error budget policy specifies responses to consumption states:

| Budget Remaining | Response |
|------------------|----------|
| > 50% | Normal velocity. Deploy at will. |
| 25-50% | Canary deployments mandatory. |
| 5-25% | Feature freeze likely. Reliability prioritized. |
| 0% (exhausted) | Hard feature freeze. All effort on reliability. |

Policies must be pre-negotiated by product and engineering leadership.

---

### Cardinality Management

Cardinality is the Cartesian product of unique values across all label
dimensions: `|l1| * |l2| * ... * |ln|`. A metric with labels `{method(5),
endpoint(50), user_id(1M)}` produces 250 million series -- approximately
133 GB/hour at 15-second intervals.

**Mitigations**: (1) Never use unbounded identifiers (user IDs, IPs) as
metric labels; place them in logs/traces. (2) Use histogram observations
instead of per-entity metrics. (3) Apply allowlisting via OTel Collector
filter/transform processors. (4) Monitor `prometheus_tsdb_head_series` and
alert on growth. (5) Implement Prometheus `metric_relabel_configs` to drop or
bucket values at scrape time.

---

### Structured Logging vs Unstructured Logging

Unstructured logs (`ERROR Failed payment for user 12345: timeout`) require
brittle regex parsing that breaks silently on format changes.

Structured logs encode events as machine-parseable JSON with mandatory fields
(timestamp, level, service, trace_id, span_id). This enables indexed search,
trace correlation, field aggregation, schema evolution, and automated parsing
by Loki, Elasticsearch, or Splunk. Structured logging is not optional; it is a
prerequisite for observability at scale.

---

### Distributed Tracing and Context Propagation

**W3C Trace Context** (W3C Recommendation, 2021) defines two HTTP headers:
`traceparent` (`{version}-{trace-id}-{parent-id}-{trace-flags}`) and
`tracestate` (vendor-specific key-value list). Propagation occurs through HTTP
headers, message queue metadata (Kafka, AMQP, SQS), gRPC metadata, and
in-process context objects (Go `context.Context`, Java `ThreadLocal`, Python
`contextvars`).

Propagation failures are the most common source of broken traces. Every network
boundary must inject context on egress and extract on ingress. **W3C Baggage**
propagates arbitrary key-value pairs (tenant ID, feature flags) alongside trace
context; use sparingly due to per-call overhead.

---

### Alerting Philosophy

**Symptom-based** alerts fire on user-affecting conditions (error rate exceeds
burn rate, latency exceeds SLI threshold). They are durable across
architectural changes.

**Cause-based** alerts fire on infrastructure conditions (CPU > 90%, disk <
10%). They are fragile, encoding assumptions about failure modes, and generate
noise for non-user-affecting conditions.

**Correct approach** (Beyer et al., 2016; Sloss et al., 2017): Page on
symptoms only. Investigate with cause-based dashboards. Use multi-window,
multi-burn-rate alerts: fast burn (14.4x over 1 hour) for acute incidents,
slow burn (1x over 3 days) for gradual degradation. Burn rate is defined as
`error_rate_observed / error_rate_budget`.

---

### Practical Implications

1. Instrument every service with RED signals from day one.
2. Define SLIs before writing SLOs; the SLI definition is the critical decision.
3. Use OpenTelemetry as the instrumentation layer to avoid vendor lock-in.
4. Deploy the OTel Collector as sidecar/daemonset; never embed export logic in
   application code.
5. Enforce structured logging via shared libraries with mandatory fields.
6. Treat cardinality as a first-class concern; review label schemas in design
   review with the rigor applied to database schemas.
7. Establish error budget policies before the first SLO violation.
8. Implement W3C Trace Context at every service boundary.
9. Alert on SLO burn rates, not raw thresholds.
10. Conduct observability reviews alongside architecture reviews.
11. Use tail-based sampling to retain error traces and latency outliers.
12. Correlate all three pillars via trace ID for seamless drill-down.

---

### Common Misconceptions

**"Monitoring and observability are the same thing."** Monitoring answers
predefined questions. Observability answers arbitrary questions. A system can
be well-monitored but poorly observable.

**"More metrics means better observability."** Metric proliferation without SLI
alignment creates noise. Fifty well-chosen metrics beat ten thousand unstructured
ones.

**"Traces are only useful for microservices."** Tracing provides value in any
system with asynchronous or multi-component execution paths, including monoliths.

**"Sampling means losing data."** Sampling is statistical inference. A 10%
sample of 100K req/s yields 10K traces/s -- sufficient for distribution analysis.

**"Averages are good enough for latency."** A 50ms average can hide a 2s p99.
Latency distributions are long-tailed; percentiles are the minimum useful
representation.

**"Log verbosity equals observability."** Structured INFO logging with trace
correlation outperforms verbose unstructured DEBUG logging.

**"SLOs should be as high as possible."** 100% is unachievable and undesirable.
The error budget framework recognizes reliability has diminishing returns.

---

### Further Reading

1. Kalman, R.E. (1960). "On the General Theory of Control Systems."
   *Proceedings of the First IFAC World Congress*, pp. 481-492.
2. Beyer, B., Jones, C., Petoff, J., & Murphy, N.R. (2016). *Site Reliability
   Engineering*. O'Reilly. Chapters 4 and 6.
3. Murphy, N.R., et al. (2018). *The Site Reliability Workbook*. O'Reilly.
   Chapter 5 (Alerting on SLOs).
4. Gregg, B. (2013). "The USE Method." brendangregg.com/usemethod.html
5. Gregg, B. (2020). *Systems Performance*, 2nd ed. Addison-Wesley.
6. Dean, J. & Barroso, L.A. (2013). "The Tail at Scale." *CACM*, 56(2).
7. Majors, C., Fong-Jones, L., & Miranda, G. (2022). *Observability
   Engineering*. O'Reilly.
8. Sridharan, C. (2018). *Distributed Systems Observability*. O'Reilly.
9. W3C. (2021). "Trace Context." w3.org/TR/trace-context/
10. W3C. (2021). "Baggage." w3.org/TR/baggage/
11. Wilkie, T. (2018). "The RED Method." grafana.com/blog/
12. OpenTelemetry Authors. (2023). "OpenTelemetry Specification."
    opentelemetry.io/docs/specs/otel/
13. Sloss, B., et al. (2017). "The Calculus of Service Availability."
    *ACM Queue*, 15(2).
14. Sigelman, B.H., et al. (2010). "Dapper, a Large-Scale Distributed Systems
    Tracing Infrastructure." *Google Technical Report*.
