# 02_DATA_STORE — Specification

**Commit ID:** COMMIT-0003
**Status:** Approved
**Last Updated:** 2025-12-19

---

## 1) Purpose

Provides persistent, queryable storage for all normalized market data, options chains, flow events, fundamentals, and engineered features. Acts as the **single source of truth** for historical and real-time data within the brain. Optimized for both time-series queries (backtesting, analysis) and low-latency point lookups (real-time signal generation). Manages data retention policies, compression, and snapshots for reproducibility.

---

## 2) Owns / Does Not Own

### Owns
- Persistent storage of all normalized data from `01_data_ingestion`
- Time-series database writes and indexed queries
- Data retention and archival policies (hot/warm/cold tiers)
- Snapshot management (point-in-time state capture for backtesting)
- Cache layer for frequently accessed data (latest bars, current chains)
- Metadata tracking (data lineage, provider source, ingestion timestamp)
- Query interfaces for downstream modules (range queries, latest value, lookback windows)
- Data compaction and compression strategies

### Does Not Own
- Data ingestion or normalization (that's `01_data_ingestion`)
- Feature engineering or indicator calculation (that's `03_feature_engineering`)
- Signal logic or strategy evaluation (downstream folders)
- Data quality validation (happens upstream in `01_data_ingestion`)
- Deciding what data to request (that's `18_realtime_scanning_and_alerting`)

---

## 3) Inputs

**From 01_data_ingestion:**
- `NormalizedBar` → OHLCV data for all timeframes
- `NormalizedQuote` → Real-time bid/ask snapshots
- `NormalizedTrade` → Individual trade ticks
- `NormalizedOptionsChain` → Full chains with greeks, IV, volume, OI
- `FlowEvent` → Unusual options activity
- `FundamentalSnapshot` → Earnings dates, dividends, sector data
- `EventCalendar` → Scheduled macro events
- `DataQualityReport` → Quality metadata for each record

**From 00_core:**
- `Logger` → Structured logging
- `ConfigContract` → Storage backend config (database type, retention policies, cache size)
- `Timestamp`, `Symbol`, `OptionContract` types

**From 03_feature_engineering (indirect):**
- Computed features to persist alongside raw data (stored, but calculation happens upstream)

---

## 4) Outputs

**Query Interfaces (exposed to all downstream folders):**

- `get_bars(symbol, timeframe, start_time, end_time)` → Returns `NormalizedBar[]`
- `get_latest_bar(symbol, timeframe)` → Returns most recent `NormalizedBar`
- `get_latest_quote(symbol)` → Returns most recent `NormalizedQuote`
- `get_options_chain(symbol, timestamp)` → Returns `NormalizedOptionsChain` at given time
- `get_flow_events(symbol, start_time, end_time)` → Returns `FlowEvent[]`
- `get_fundamentals(symbol)` → Returns latest `FundamentalSnapshot`
- `get_events(start_time, end_time, event_type=None)` → Returns `EventCalendar[]`
- `get_feature(symbol, feature_name, timeframe, start_time, end_time)` → Returns computed feature series
- `create_snapshot(timestamp, label)` → Captures point-in-time state for backtesting
- `restore_snapshot(snapshot_id)` → Restores to historical state

**Metadata:**
- `StorageMetrics` → Write throughput, query latency, disk usage, cache hit rate
- `DataLineage` → For each record: source provider, ingestion timestamp, quality score

---

## 5) Submodules

### raw/
**Responsibility:** Stores unprocessed normalized data from ingestion layer.
**Key Artifacts:**
- `bar_store.py` → Time-series storage for OHLCV bars (per timeframe)
- `quote_store.py` → Tick/quote storage (high-volume, short retention)
- `trade_store.py` → Individual trade ticks (optional, high-volume)
- `chain_store.py` → Options chain snapshots (indexed by underlying + timestamp)
- `flow_store.py` → Flow events (indexed by symbol + timestamp)
- `fundamentals_store.py` → Fundamental snapshots (low-frequency updates)
- `events_store.py` → Event calendar (indexed by event_type + scheduled_time)

### processed/
**Responsibility:** Stores engineered features and derived data.
**Key Artifacts:**
- `feature_store.py` → Multi-dimensional storage (symbol × feature × timeframe × timestamp)
- `indicator_cache.py` → Precomputed indicators (e.g., EMA, VWAP) to avoid recalculation
- `regime_state_store.py` → Historical regime classifications (from `04_market_regime`)
- `setup_store.py` → Detected setups/patterns with metadata (from `04b_setup_and_pattern_library`)

### snapshots/
**Responsibility:** Point-in-time state capture for backtesting and audit.
**Key Artifacts:**
- `snapshot_manager.py` → Create/restore snapshots (full state or incremental)
- `snapshot_metadata.py` → Snapshot registry (id, timestamp, label, size, hash)
- `snapshot_integrity.py` → Verify snapshot completeness and hash validation

### cache/
**Responsibility:** In-memory cache for hot data (latest bars, active chains).
**Key Artifacts:**
- `bar_cache.py` → LRU cache for recent bars (configurable TTL)
- `chain_cache.py` → Cache for current options chains (invalidate on new data)
- `quote_cache.py` → Latest bid/ask for actively scanned symbols
- `cache_eviction.py` → Eviction policies (LRU, TTL, size-based)
- `cache_metrics.py` → Hit rate, miss rate, eviction count

### metadata/
**Responsibility:** Tracks data lineage, quality, and storage metrics.
**Key Artifacts:**
- `lineage_tracker.py` → Records source provider, ingestion time, quality score for each record
- `retention_policy.py` → Defines hot/warm/cold tiers and auto-archival rules
- `storage_metrics.py` → Monitors write throughput, query latency, disk usage
- `query_logger.py` → Logs all queries for performance tuning and audit

---

## 6) Interfaces

### Upstream
- **01_data_ingestion** → Writes all normalized data
- **00_core** → Config, Logger, Types

### This Folder
- Persists data, serves queries, manages snapshots

### Downstream
- **03_feature_engineering** → Reads raw bars/chains, writes computed features back
- **04_market_regime** → Reads bars/features for regime classification
- **05_options_analytics** → Reads chains for IV surface, greeks, GEX/DEX
- **08_signal_generation** → Reads bars/features/regime for signal triggers
- **13_trade_lifecycle_and_monitoring** → Reads current prices for PnL tracking
- **14_learning_and_evaluation_loop** → Reads historical data for backtesting and performance attribution
- **16_governance_and_testing** → Uses snapshots for deterministic backtests

---

## 7) Validation & Failure Modes

### Validation Rules
- **Write idempotency:** Duplicate writes (same symbol + timestamp) should be deduplicated or rejected
- **Time ordering:** Bars must be stored in chronological order; out-of-order writes logged as warnings
- **Schema enforcement:** All writes must match expected schema (enforced at write time)
- **Retention compliance:** Data older than retention policy automatically archived or purged
- **Snapshot integrity:** Snapshots must be verifiable via cryptographic hash

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Disk full | Write failure / storage metrics | Trigger emergency archival, alert, halt writes if critical |
| Corrupt write | Schema validation failure | Reject write, log error, emit alert, quarantine payload |
| Query timeout | Latency > threshold | Log slow query, return partial results or error, trigger index rebuild if chronic |
| Cache miss storm | Cache hit rate < threshold | Log warning, increase cache size or TTL if memory allows |
| Snapshot creation failure | Hash mismatch or incomplete state | Abort snapshot, log error, alert, retry once |
| Out-of-order data | Bar timestamp < latest stored | Log warning, accept but flag metadata (possible backfill or late tick) |
| Retention policy failure | Archive job fails | Retry with backoff, alert if persistent, manual intervention required |
| Read-after-write inconsistency | Cache/DB mismatch | Invalidate cache, re-read from DB, log warning |

---

## 8) Minimum Acceptance Criteria

✅ **Raw Storage:**
- Bar store accepts and indexes `NormalizedBar` by symbol + timeframe + timestamp
- Quote store handles high-volume tick writes with minimal latency
- Chain store indexes options chains by underlying + timestamp
- Flow store indexes unusual activity events by symbol + timestamp
- All stores enforce schema validation on write

✅ **Processed Storage:**
- Feature store supports multi-dimensional indexing (symbol × feature × timeframe × timestamp)
- Indicator cache precomputes and serves frequently used indicators (e.g., 20-period EMA)
- Regime/setup stores documented (implementation deferred until those folders built)

✅ **Snapshots:**
- Snapshot manager can create point-in-time snapshots with labels
- Snapshots include cryptographic hash for integrity verification
- Restore functionality documented (implementation may be deferred to testing phase)

✅ **Cache:**
- In-memory cache for latest bars (per symbol + timeframe)
- Cache for active options chains (invalidate on new chain data)
- LRU eviction policy enforced
- Cache hit/miss metrics tracked

✅ **Metadata:**
- Data lineage tracked (source provider, ingestion timestamp, quality score)
- Retention policies defined (hot: 30 days, warm: 1 year, cold: archive)
- Storage metrics logged (write throughput, query latency, disk usage)

✅ **Query Interface:**
- `get_bars()` retrieves historical bars for given symbol + timeframe + range
- `get_latest_bar()` retrieves most recent bar from cache or DB
- `get_options_chain()` retrieves chain snapshot at given timestamp
- All queries return results in canonical schema format

✅ **Testing:**
- Unit tests for write/read operations (bars, quotes, chains)
- Query tests (range queries, latest value, edge cases like missing data)
- Cache tests (hit/miss, eviction, invalidation)
- Retention policy tests (archival triggers, purge logic)
- Snapshot integrity tests (create, verify hash, restore)

✅ **Documentation:**
- README in `02_data_store/` explaining purpose, storage backends, and query patterns
- Schema documentation for all stored data types
- Retention policy configuration guide
- Cache tuning recommendations (size, TTL, eviction strategy)

---

## 9) Deferred Design Notes

None for `02_data_store`. All design decisions resolved in-scope.
