# 01_DATA_INGESTION — Specification

**Commit ID:** COMMIT-0002
**Status:** Approved
**Last Updated:** 2025-12-26
**Incorporates:** PATCH_0002

---

## 1) Purpose

Responsible for fetching, normalizing, validating, and delivering market data from external providers into a canonical format consumed by all downstream modules. This is the **data boundary layer**—all provider-specific logic, API quirks, rate limits, and data quality issues are handled here. Downstream modules receive clean, normalized, timestamped, and validated data with no knowledge of where it came from.

This module is the **canonical upstream source** for the entire Options Trading Brain. Every piece of market data enters the system through this single point.

---

## 2) Owns / Does Not Own

### Owns
- Provider adapter interfaces (market data, options chains, flow, fundamentals, events)
- Data normalization (converting provider-specific formats to canonical schemas)
- Timestamp normalization (all outputs in UTC with exchange timezone metadata)
- Session boundary handling (RTH, ETH, holidays, early closes, half days)
- Data quality validation (missing data, outliers, stale quotes, bad prints)
- Quality scoring (confidence/quality metric attached to every record)
- Backfill pipelines (historical data fetching, deterministic and replayable)
- Realtime ingestion pipelines (streaming/polling with latency tracking)
- Rate limiting, retry logic, backoff, circuit breaking
- Provenance metadata (source, fetch timestamp, latency, quality score)
- Write contract to `02_data_store` (idempotent, schema-enforced)

### Does Not Own
- Data storage or caching (that's `02_data_store`)
- Feature computation or indicators (that's `03_feature_engineering`)
- Deciding what data to fetch (that's `18_realtime_scanning_and_alerting` or config-driven)
- Regime classification or signal logic (downstream folders)
- Provider API key management (that's `00_core` security primitives)
- Database schema migrations (that's `02_data_store`)

---

## 3) Inputs

**From external providers (via adapters):**
- Raw OHLCV bar data (various timeframes, provider-specific formats)
- Raw quote data (bid/ask snapshots)
- Raw trade data (time & sales, tick data)
- Raw options chain data (strikes, expirations, greeks, bid/ask)
- Raw unusual activity / flow data (sweeps, blocks, large trades)
- Raw fundamental data (earnings, dividends, splits, float, shares outstanding)
- Raw event calendar data (earnings dates, ex-dividend dates, economic events)

**From 00_core:**
- `Config` → Provider credentials (via secret manager), rate limits, retry policies, quality thresholds
- `SystemClock` → Current time (real or injected for backtest)
- `Logger` → Structured logging with trace IDs
- `ExchangeCalendar` → Holiday schedules, early close dates, session boundaries

**From external (caller/orchestrator):**
- `IngestionRequest` → Symbol(s), timeframe(s), date range, data type (bars, quotes, options, flow, fundamentals)

---

## 4) Outputs

**To 02_data_store (via write contract):**

All outputs include provenance metadata:
```
ProvenanceMetadata:
  - source_provider: string          # e.g., "polygon", "tradier", "unusual_whales"
  - fetch_timestamp_utc: datetime    # When data was fetched
  - latency_ms: int                  # Fetch latency
  - quality_score: float             # 0.0–1.0 (1.0 = perfect)
  - quality_flags: string[]          # e.g., ["interpolated", "stale", "estimated"]
  - batch_id: uuid                   # For idempotent writes
  - schema_version: string           # e.g., "1.0.0"
```

---

#### DataQualityReport
*(Extractable subset of ProvenanceMetadata for downstream consumers expecting quality-only metadata)*

```
DataQualityReport:
  - quality_score: float             # 0.0–1.0 (1.0 = perfect quality)
  - quality_flags: string[]          # e.g., ["interpolated", "stale", "estimated", "wide_spread"]
  - is_valid: bool                   # True if passed all validation gates
  - validation_errors: string[]      # List of validation failures (empty if valid)
```

**Note:** `DataQualityReport` fields are always present within `ProvenanceMetadata`. Downstream modules may consume either:
- **Full `ProvenanceMetadata`** — includes source, latency, batch_id, schema_version + quality fields
- **`DataQualityReport` only** — quality subset for lightweight consumers (e.g., `02_data_store` quality filtering)

The `is_valid` and `validation_errors` fields are computed during validation and attached before write.

---

### Canonical Schemas

---

#### NormalizedBar
```
NormalizedBar:
  - symbol: string                   # Ticker symbol (uppercase, normalized)
  - timeframe: string                # "1m", "5m", "15m", "30m", "1h", "4h", "D", "W", "M"
  - timestamp_utc: datetime          # Bar open time in UTC
  - timestamp_exchange: datetime     # Bar open time in exchange local timezone
  - exchange_timezone: string        # e.g., "America/New_York"
  - open: decimal                    # Opening price
  - high: decimal                    # High price
  - low: decimal                     # Low price
  - close: decimal                   # Closing price
  - volume: int                      # Share/contract volume
  - vwap: decimal | null             # Volume-weighted average price (if available)
  - trade_count: int | null          # Number of trades in bar (if available)
  - session: string                  # "RTH" | "ETH" | "PRE" | "POST" | "FULL"
  - is_complete: bool                # False if bar is still forming (realtime)
  - provenance: ProvenanceMetadata
```

---

#### NormalizedQuote
```
NormalizedQuote:
  - symbol: string                   # Ticker symbol
  - timestamp_utc: datetime          # Quote timestamp in UTC
  - timestamp_exchange: datetime     # Quote timestamp in exchange local timezone
  - exchange_timezone: string        # e.g., "America/New_York"
  - bid: decimal                     # Best bid price
  - bid_size: int                    # Bid size (shares/contracts)
  - ask: decimal                     # Best ask price
  - ask_size: int                    # Ask size (shares/contracts)
  - mid: decimal                     # (bid + ask) / 2 (computed)
  - spread: decimal                  # ask - bid (computed)
  - spread_pct: decimal              # spread / mid * 100 (computed)
  - exchange: string | null          # Exchange code (if available)
  - condition: string | null         # Quote condition code
  - session: string                  # "RTH" | "ETH" | "PRE" | "POST"
  - provenance: ProvenanceMetadata
```

---

#### NormalizedTrade
```
NormalizedTrade:
  - symbol: string                   # Ticker symbol
  - timestamp_utc: datetime          # Trade execution time in UTC
  - timestamp_exchange: datetime     # Trade execution time in exchange local timezone
  - exchange_timezone: string        # e.g., "America/New_York"
  - price: decimal                   # Execution price
  - size: int                        # Trade size (shares/contracts)
  - exchange: string | null          # Exchange code
  - conditions: string[]             # Trade condition codes (e.g., ["@", "F"])
  - tape: string | null              # Tape A/B/C
  - side: string | null              # "buy" | "sell" | "unknown" (if inferrable)
  - session: string                  # "RTH" | "ETH" | "PRE" | "POST"
  - provenance: ProvenanceMetadata
```

---

#### NormalizedOptionsChain
```
NormalizedOptionsChain:
  - underlying_symbol: string        # Underlying ticker
  - timestamp_utc: datetime          # Chain snapshot time in UTC
  - timestamp_exchange: datetime     # Chain snapshot time in exchange local timezone
  - exchange_timezone: string        # e.g., "America/New_York"
  - underlying_price: decimal        # Current underlying price at snapshot
  - expirations: OptionsExpiration[] # List of expirations with strikes
  - provenance: ProvenanceMetadata

OptionsExpiration:
  - expiration_date: date            # Expiration date (YYYY-MM-DD)
  - dte: int                         # Days to expiration
  - strikes: OptionsStrike[]         # List of strikes for this expiration

OptionsStrike:
  - strike: decimal                  # Strike price
  - call: OptionsContract | null     # Call contract (null if not available)
  - put: OptionsContract | null      # Put contract (null if not available)

OptionsContract:
  - contract_symbol: string          # OCC symbol (e.g., "AAPL240119C00150000")
  - option_type: string              # "call" | "put"
  - bid: decimal                     # Best bid
  - ask: decimal                     # Best ask
  - mid: decimal                     # (bid + ask) / 2
  - last: decimal | null             # Last trade price
  - volume: int                      # Daily volume
  - open_interest: int               # Open interest
  - implied_volatility: decimal | null   # IV (if provided by source)
  - delta: decimal | null            # Delta (if provided)
  - gamma: decimal | null            # Gamma (if provided)
  - theta: decimal | null            # Theta (if provided)
  - vega: decimal | null             # Vega (if provided)
  - rho: decimal | null              # Rho (if provided)
  - intrinsic_value: decimal         # max(0, underlying - strike) for calls
  - extrinsic_value: decimal         # mid - intrinsic_value
  - in_the_money: bool               # True if ITM
  - quality_flags: string[]          # e.g., ["wide_spread", "stale", "low_oi"]
```

---

#### FlowEvent
```
FlowEvent:
  - event_id: uuid                   # Unique event identifier
  - symbol: string                   # Underlying ticker
  - timestamp_utc: datetime          # Event time in UTC
  - timestamp_exchange: datetime     # Event time in exchange local timezone
  - exchange_timezone: string        # e.g., "America/New_York"
  - event_type: string               # "sweep" | "block" | "unusual_volume" | "large_oi_change"
  - contract_symbol: string          # OCC symbol
  - option_type: string              # "call" | "put"
  - strike: decimal                  # Strike price
  - expiration_date: date            # Expiration date
  - dte: int                         # Days to expiration
  - side: string                     # "buy" | "sell" | "unknown"
  - size: int                        # Contract quantity
  - premium: decimal                 # Total premium (size * price * 100)
  - price: decimal                   # Execution price
  - underlying_price: decimal        # Underlying price at time of event
  - implied_volatility: decimal | null
  - delta: decimal | null
  - sentiment: string                # "bullish" | "bearish" | "neutral" | "unknown"
  - aggressor: string                # "buyer" | "seller" | "unknown"
  - venue: string | null             # Exchange or ATS
  - is_sweep: bool                   # True if multi-exchange sweep
  - is_opening: bool | null          # True if opening position (if inferrable)
  - sector: string | null            # Sector classification
  - tags: string[]                   # Provider-specific tags
  - provenance: ProvenanceMetadata
```

---

#### FundamentalSnapshot
```
FundamentalSnapshot:
  - symbol: string                   # Ticker symbol
  - timestamp_utc: datetime          # Snapshot time in UTC
  - market_cap: decimal | null       # Market capitalization
  - shares_outstanding: int | null   # Total shares outstanding
  - float_shares: int | null         # Public float
  - short_interest: int | null       # Short interest (shares)
  - short_ratio: decimal | null      # Days to cover
  - avg_volume_10d: int | null       # 10-day average volume
  - avg_volume_30d: int | null       # 30-day average volume
  - eps_ttm: decimal | null          # Trailing 12-month EPS
  - pe_ratio: decimal | null         # Price-to-earnings ratio
  - forward_pe: decimal | null       # Forward P/E
  - dividend_yield: decimal | null   # Dividend yield (%)
  - dividend_amount: decimal | null  # Most recent dividend amount
  - ex_dividend_date: date | null    # Next/most recent ex-dividend date
  - beta: decimal | null             # Beta (vs. SPY typically)
  - fifty_two_week_high: decimal | null
  - fifty_two_week_low: decimal | null
  - sector: string | null            # GICS sector
  - industry: string | null          # GICS industry
  - provenance: ProvenanceMetadata
```

---

#### EventCalendar
```
EventCalendar:
  - symbol: string                   # Ticker symbol (or "MARKET" for economic events)
  - events: CalendarEvent[]          # List of upcoming/past events
  - provenance: ProvenanceMetadata

CalendarEvent:
  - event_id: uuid                   # Unique event identifier
  - event_type: string               # "earnings" | "dividend" | "split" | "economic" | "fda" | "conference"
  - event_date: date                 # Date of event
  - event_time: string | null        # "BMO" | "AMC" | "DMH" | specific time | null
  - timestamp_utc: datetime | null   # Exact time if known (UTC)
  - title: string                    # Event title/description
  - importance: string               # "high" | "medium" | "low"
  - expected_value: string | null    # Expected EPS, dividend amount, etc.
  - previous_value: string | null    # Previous period value
  - actual_value: string | null      # Actual value (if event has passed)
  - is_confirmed: bool               # True if date/time confirmed
```

---

## 5) Submodules

### providers/
Provider adapter implementations. Each adapter implements a common interface.

- `base_adapter.py` → Abstract base class defining adapter interface:
  - `fetch_bars(symbol, timeframe, start, end) -> NormalizedBar[]`
  - `fetch_quotes(symbol) -> NormalizedQuote`
  - `fetch_trades(symbol, start, end) -> NormalizedTrade[]`
  - `fetch_options_chain(symbol) -> NormalizedOptionsChain`
  - `fetch_flow(symbols, start, end) -> FlowEvent[]`
  - `fetch_fundamentals(symbol) -> FundamentalSnapshot`
  - `fetch_calendar(symbol, start, end) -> EventCalendar`
  - `get_rate_limits() -> RateLimitConfig`
  - `health_check() -> ProviderHealth`

- `polygon_adapter.py` → Polygon.io adapter (bars, quotes, trades, options)
- `tradier_adapter.py` → Tradier adapter (options chains, quotes)
- `unusual_whales_adapter.py` → Unusual Whales adapter (flow, unusual activity)
- `alpha_vantage_adapter.py` → Alpha Vantage adapter (fundamentals, earnings calendar)
- `provider_registry.py` → Registry for selecting provider by data type, failover config

### normalizers/
Transform provider-specific data to canonical schemas.

- `bar_normalizer.py` → Converts raw bar data to `NormalizedBar`
- `quote_normalizer.py` → Converts raw quote data to `NormalizedQuote`
- `trade_normalizer.py` → Converts raw trade data to `NormalizedTrade`
- `options_normalizer.py` → Converts raw options data to `NormalizedOptionsChain`
- `flow_normalizer.py` → Converts raw flow data to `FlowEvent`
- `fundamental_normalizer.py` → Converts raw fundamentals to `FundamentalSnapshot`
- `calendar_normalizer.py` → Converts raw calendar data to `EventCalendar`

### time_session/
Session and timezone handling.

- `timezone_handler.py` → UTC conversion, exchange timezone metadata attachment
- `session_classifier.py` → Classifies timestamps as RTH/ETH/PRE/POST based on exchange calendar
- `exchange_calendar.py` → Holiday schedules, early closes, half days per exchange
  - NYSE, NASDAQ, CBOE, CME calendars
  - Methods: `is_market_open(exchange, timestamp)`, `get_session_boundaries(exchange, date)`, `is_holiday(exchange, date)`, `is_early_close(exchange, date)`
- `session_boundaries.py` → Defines RTH/ETH boundaries per exchange:
  - NYSE RTH: 09:30–16:00 ET
  - NYSE ETH: 04:00–09:30, 16:00–20:00 ET
  - Config-driven, overridable

### validation/
Data quality validation and scoring.

- `bar_validator.py` → Validates `NormalizedBar`:
  - No negative prices or volumes
  - High >= Low, High >= Open, High >= Close, Low <= Open, Low <= Close
  - Timestamp in valid range
  - No duplicate bars (same symbol + timeframe + timestamp)
  - Detects gaps (missing bars)
  - Detects outliers (price > X% from previous close)

- `quote_validator.py` → Validates `NormalizedQuote`:
  - Bid <= Ask (crossed quotes flagged)
  - Positive bid/ask sizes
  - Staleness check (quote age vs. threshold)
  - Spread reasonableness check

- `options_validator.py` → Validates `NormalizedOptionsChain`:
  - All required strikes present for liquid names
  - Greeks in reasonable ranges (delta -1 to 1, etc.)
  - OI and volume non-negative
  - Spread reasonableness per strike
  - Chain completeness score

- `trade_validator.py` → Validates `NormalizedTrade`:
  - Price within daily range (or flagged)
  - Size > 0
  - Timestamp monotonic within batch

- `flow_validator.py` → Validates `FlowEvent`:
  - Premium calculation correct (size * price * 100)
  - Sentiment consistent with side/delta
  - Contract symbol valid format

- `quality_scorer.py` → Computes quality score (0.0–1.0) for any record:
  - Deductions for: staleness, interpolation, wide spreads, missing fields, outliers
  - Configurable weights per data type

- `outlier_detector.py` → Detects bad prints, erroneous data:
  - Z-score based detection
  - Configurable thresholds
  - Marks records with `quality_flags`

### pipelines/
Ingestion orchestration.

- `backfill_pipeline.py` → Historical data fetching:
  - Deterministic: same inputs → same outputs
  - Chunked fetching (date ranges)
  - Progress tracking, resumability
  - Deduplication before write
  - Idempotent writes to `02_data_store`

- `realtime_pipeline.py` → Live data ingestion:
  - Polling or streaming (provider-dependent)
  - Latency tracking
  - Heartbeat monitoring
  - Reconnection logic
  - Writes to `02_data_store` with `is_complete=False` for forming bars

- `replay_pipeline.py` → Backtest replay mode:
  - Reads from `02_data_store`
  - Emits data at simulated timestamps
  - No external fetches
  - Deterministic playback

### fault_tolerance/
Rate limiting and error handling.

- `rate_limiter.py` → Per-provider rate limiting:
  - Token bucket or sliding window
  - Configurable limits per endpoint
  - Queues requests when at limit

- `retry_handler.py` → Retry logic with backoff:
  - Exponential backoff with jitter
  - Max retries configurable
  - Retryable vs. non-retryable errors

- `circuit_breaker.py` → Circuit breaker pattern:
  - States: CLOSED, OPEN, HALF_OPEN
  - Opens on N consecutive failures
  - Half-open after cooldown
  - Prevents cascade failures

- `health_monitor.py` → Provider health tracking:
  - Success/failure rates
  - Latency percentiles
  - Alerts on degradation

### writer/
Write contract to 02_data_store.

- `data_writer.py` → Writes normalized data to `02_data_store`:
  - Idempotent writes (batch_id deduplication)
  - Schema validation before write
  - Provenance metadata attached
  - Batched writes for efficiency
  - Transaction semantics (all-or-nothing per batch)

- `write_contract.py` → Defines the interface to `02_data_store`:
  - `write_bars(bars: NormalizedBar[]) -> WriteResult`
  - `write_quotes(quotes: NormalizedQuote[]) -> WriteResult`
  - `write_trades(trades: NormalizedTrade[]) -> WriteResult`
  - `write_options_chain(chain: NormalizedOptionsChain) -> WriteResult`
  - `write_flow_events(events: FlowEvent[]) -> WriteResult`
  - `write_fundamentals(snapshot: FundamentalSnapshot) -> WriteResult`
  - `write_calendar(calendar: EventCalendar) -> WriteResult`

---

## 6) Validation & Failure Modes

### Validation Gates (All Data Must Pass)

| Gate | Description | Action on Failure |
|------|-------------|-------------------|
| Schema Validation | All required fields present, correct types | Reject record |
| Timestamp Validation | Valid datetime, not in future, within expected range | Reject record |
| Price Validation | Non-negative, within reasonable range | Flag or reject |
| Volume Validation | Non-negative integers | Reject record |
| Consistency Check | High >= Low, Bid <= Ask, etc. | Flag with quality penalty |
| Staleness Check | Data not older than threshold | Flag as stale, quality penalty |
| Outlier Detection | Price/volume within X std devs of recent history | Flag, do not reject |
| Completeness Check | Options chain has expected strikes/expirations | Quality penalty |

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Provider timeout | Request exceeds timeout threshold | Retry with backoff |
| Provider error (4xx) | HTTP 4xx response | Log, do not retry (bad request) |
| Provider error (5xx) | HTTP 5xx response | Retry with backoff |
| Rate limit exceeded | HTTP 429 or rate limit header | Queue, wait, retry |
| Circuit open | Too many consecutive failures | Skip provider, use fallback |
| Invalid data | Validation gate failure | Reject record, log, continue batch |
| Missing bars | Gap detected in bar sequence | Flag gap, fetch missing if possible |
| Duplicate data | Same record already exists | Skip (idempotent) |
| Stale realtime | No updates for > threshold | Alert, log, continue |

---

## 7) Time + Session Handling

### UTC Normalization
- All `timestamp_utc` fields are in UTC (timezone-naive or explicit UTC)
- All `timestamp_exchange` fields preserve the exchange's local time
- `exchange_timezone` field specifies the IANA timezone (e.g., "America/New_York")

### Session Classification

| Session | NYSE/NASDAQ Hours (ET) | Description |
|---------|------------------------|-------------|
| PRE | 04:00–09:30 | Pre-market |
| RTH | 09:30–16:00 | Regular trading hours |
| POST | 16:00–20:00 | After-hours |
| ETH | 04:00–09:30, 16:00–20:00 | Extended hours (PRE + POST) |
| FULL | 04:00–20:00 | All sessions |

### Holidays and Special Days
- Full holidays: Market closed (no data expected)
- Early closes: RTH ends at 13:00 ET (day after Thanksgiving, Christmas Eve, etc.)
- Half days: Treated as early close

### Determinism Requirement
- Session classification is deterministic given (exchange, timestamp)
- Exchange calendars are versioned and immutable per version
- Backtest replays produce identical session labels

---

## 8) Realtime vs. Backfill

### Backfill Pipeline
- **Input:** Symbol, timeframe, date range
- **Process:**
  1. Check `02_data_store` for existing data (avoid re-fetching)
  2. Chunk date range into provider-friendly segments
  3. Fetch sequentially with rate limiting
  4. Normalize, validate, score quality
  5. Write to `02_data_store` (idempotent)
  6. Track progress, support resume on failure
- **Output:** Complete historical data in `02_data_store`
- **Guarantee:** Same inputs → same outputs (deterministic)

### Realtime Pipeline
- **Input:** Symbol list, data types (bars, quotes, options, flow)
- **Process:**
  1. Subscribe or poll (provider-dependent)
  2. Normalize incoming data immediately
  3. Validate, score quality
  4. Write to `02_data_store` with latency tracking
  5. Mark forming bars as `is_complete=False`
  6. Update to `is_complete=True` on bar close
- **Output:** Live data stream to `02_data_store`
- **Latency tracking:** `fetch_timestamp - data_timestamp` logged

### Replay Mode (Backtest)
- **Input:** Symbol, timeframe, date range, playback speed
- **Process:**
  1. Read from `02_data_store` (no external fetches)
  2. Emit data at simulated timestamps
  3. Respect bar boundaries and session times
- **Output:** Deterministic data stream for backtesting
- **Guarantee:** Identical to historical ingestion (no look-ahead)

---

## 9) Write Contract to 02_data_store

### Contract Requirements

1. **Idempotent Writes**
   - Each write includes `batch_id` (UUID)
   - `02_data_store` rejects duplicate `batch_id` for same data type
   - Re-running backfill produces no duplicates

2. **Schema Enforcement**
   - `02_data_store` validates incoming data against schema
   - Rejects records that don't match expected schema version
   - Schema version included in `provenance.schema_version`

3. **Provenance Metadata**
   - Every record includes full `ProvenanceMetadata`
   - Enables data lineage tracking, debugging, quality analysis

4. **Quality Metadata**
   - Every record includes quality metadata accessible as `DataQualityReport`
   - `02_data_store` may consume `DataQualityReport` (quality-only) or `ProvenanceMetadata` (full lineage)
   - `02_data_store` may index by `quality_score` for filtering low-quality records
   - `quality_flags` enable downstream filtering (e.g., exclude "stale" records)

5. **Batched Writes**
   - Writes are batched for efficiency (configurable batch size)
   - Transaction semantics: batch succeeds or fails atomically

6. **Write Result**
   ```
   WriteResult:
     - success: bool
     - records_written: int
     - records_rejected: int
     - batch_id: uuid
     - errors: WriteError[]

   WriteError:
     - record_index: int
     - error_type: string
     - error_message: string
   ```

---

## 10) Rate Limiting + Fault Tolerance

### Rate Limiting Strategy
- Per-provider token bucket with configurable refill rate
- Separate limits per endpoint (bars, quotes, options, etc.)
- Request queuing when at limit (not immediate rejection)
- Priority queue for realtime > backfill

### Retry Policy
```
RetryPolicy:
  - max_retries: 3
  - initial_delay_ms: 1000
  - max_delay_ms: 30000
  - backoff_multiplier: 2.0
  - jitter: true
  - retryable_errors: [timeout, 429, 500, 502, 503, 504]
  - non_retryable_errors: [400, 401, 403, 404]
```

### Circuit Breaker
```
CircuitBreakerConfig:
  - failure_threshold: 5            # Consecutive failures to open
  - success_threshold: 3            # Successes in half-open to close
  - cooldown_seconds: 60            # Time in open state before half-open
  - monitored_exceptions: [timeout, 5xx]
```

### Failover
- Provider registry supports primary + fallback providers per data type
- On circuit open, automatically switch to fallback
- Log failover events for observability

---

## 11) Minimum Acceptance Criteria

### Schema Completeness
- [ ] All canonical schemas defined with explicit field types
- [ ] `NormalizedBar` supports all standard timeframes (1m through M)
- [ ] `NormalizedOptionsChain` includes full greek suite
- [ ] `FlowEvent` captures sweep, block, unusual activity patterns
- [ ] `ProvenanceMetadata` attached to every output record
- [ ] `DataQualityReport` extractable from every record's `ProvenanceMetadata`

### Provider Abstraction
- [ ] At least one adapter implemented per data type
- [ ] Provider-specific logic fully encapsulated in adapters
- [ ] Downstream modules receive only canonical schemas
- [ ] Provider failover functional

### Time Handling
- [ ] All timestamps normalized to UTC
- [ ] Exchange timezone preserved in metadata
- [ ] Session classification deterministic (RTH/ETH/PRE/POST)
- [ ] Holiday calendar covers NYSE, NASDAQ, CBOE for current year

### Data Quality
- [ ] Validation gates reject invalid records
- [ ] Quality score computed for every record
- [ ] Outliers flagged but not rejected
- [ ] Stale data flagged with quality penalty

### Pipelines
- [ ] Backfill pipeline deterministic and resumable
- [ ] Realtime pipeline tracks latency
- [ ] Replay mode reads from `02_data_store` only (no external calls)

### Fault Tolerance
- [ ] Rate limiting prevents provider throttling
- [ ] Retry with exponential backoff implemented
- [ ] Circuit breaker prevents cascade failures

### Write Contract
- [ ] Writes to `02_data_store` are idempotent
- [ ] Schema validation before write
- [ ] Provenance metadata included
- [ ] `DataQualityReport` available for quality-based filtering

---

## 12) Deferred Design Notes

### Deferred to Future Modules
- **Greeks computation:** If provider doesn't supply greeks, compute in `05_options_analytics`, not here
- **Symbol universe management:** What symbols to ingest is decided by `18_realtime_scanning_and_alerting` or config, not this module
- **Data retention policies:** Managed by `02_data_store`, not here
- **Feature derivation:** Any computed features (indicators, etc.) belong in `03_feature_engineering`

### Deferred Implementation Details
- Specific provider API implementations (actual HTTP calls, auth, parsing)
- Database connection pooling (handled by `02_data_store`)
- Distributed ingestion (horizontal scaling) — design spec only for now

### Open Questions (Resolved)
- **Q:** Should greeks be normalized if provider doesn't supply them?
- **A:** No. Pass `null` and let `05_options_analytics` compute if needed.

- **Q:** How to handle provider-specific fields not in canonical schema?
- **A:** Drop them. Canonical schema is the contract. Log dropped fields at DEBUG level.

---

## 13) Proposed Git Commit

```
[OptionsBrain] 01_data_ingestion: add canonical data schemas and ingestion spec

COMMIT-0002

Adds the upstream data boundary layer for the Options Trading Brain.
This module is the single entry point for all market data.

Canonical Schemas Defined:
- NormalizedBar (OHLCV with session, timezone, quality)
- NormalizedQuote (bid/ask with spread, staleness tracking)
- NormalizedTrade (time & sales with conditions)
- NormalizedOptionsChain (full chain with greeks, OI, quality flags)
- FlowEvent (sweeps, blocks, unusual activity)
- FundamentalSnapshot (market cap, float, earnings, dividends)
- EventCalendar (earnings, dividends, splits, economic events)
- ProvenanceMetadata (source, latency, quality score, batch ID)

Architecture:
- Provider adapters (pluggable, no provider logic leaks downstream)
- Normalizers (provider-specific → canonical)
- Time/session handling (UTC, RTH/ETH, holidays, early closes)
- Validation gates (schema, price, volume, consistency, staleness)
- Quality scoring (0.0–1.0 per record)
- Backfill pipeline (deterministic, resumable)
- Realtime pipeline (latency-tracked, streaming/polling)
- Replay pipeline (backtest-safe, no external calls)
- Rate limiting, retry, circuit breaker
- Idempotent write contract to 02_data_store

Dependencies:
- Imports from: 00_core (config, logging, security, calendar)
- Exports to: 02_data_store (all normalized data)

This is the missing COMMIT-0002 that all downstream modules depend on.
```

---

**End of Specification. Do not proceed to other folders.**
