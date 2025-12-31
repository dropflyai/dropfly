# 00_CORE — Specification

**Commit ID:** COMMIT-0001
**Status:** Approved
**Last Updated:** 2025-12-19

---

## 1) Purpose

Provides foundational primitives, shared types, configuration management, logging infrastructure, timeframe abstractions, state machines, and security controls for the entire Options Trading Brain. This is the dependency root—all other folders import from here, but `00_core` imports from nothing internal.

---

## 2) Owns / Does Not Own

### Owns
- Type definitions (enums, interfaces, schemas) used across all modules
- Configuration loading, validation, and environment management
- Logging/telemetry infrastructure (structured logs, trace IDs, levels)
- Timeframe models (intraday, swing, event-driven) and their transition rules
- State machines for signals and trades (states, transitions, guards, events)
- Security primitives (secret management, key rotation, access control, audit immutability, tamper detection)
- Shared utility functions (date/time, validation, formatters, constants)

### Does Not Own
- Market data ingestion or processing
- Signal generation logic
- Risk calculations
- Strategy definitions
- Execution or order routing
- Any domain-specific business logic (those live downstream)

---

## 3) Inputs

**From external environment:**
- `EnvironmentVariables` → API keys, broker endpoints, feature flags, deployment env (prod/staging/dev)
- `ConfigFiles` → YAML/JSON for timeframe params, state machine definitions, logging levels, security policies
- `SystemClock` → Real-time or backtest-injected time source

**No inputs from other brain folders** (this is the root).

---

## 4) Outputs

**Schemas/Contracts (exported to all downstream folders):**

- `CoreTypes` → Symbol, Timestamp, Timeframe, OptionContract, UnderlyingAsset, Exchange, OrderSide, PositionType
- `ConfigContract` → Validated configuration object with typed access (broker, data sources, scan intervals, risk limits)
- `Logger` → Structured logging interface (info, warn, error, trace) with context injection
- `TimeframeModel` → Methods: `is_active(timestamp)`, `next_transition(timestamp)`, `valid_for_entry(timestamp)`
- `SignalStateMachine` → States: `nascent`, `precursor`, `armed`, `triggered`, `invalidated`, `expired`; Transitions + guards
- `TradeStateMachine` → States: `pending`, `open`, `managing`, `closing`, `closed`, `failed`; Transitions + guards
- `LifecycleEvent` → Timestamped state change records (immutable audit trail)
- `SecurityContext` → Secret retrieval, access token validation, audit log emission, tamper check results

---

## 5) Submodules

### config/
**Responsibility:** Load, parse, validate, and expose all configuration (env vars, files, secrets refs).
**Key Artifacts:**
- `config_loader.py` → Loads from env + files, validates schema
- `config_schema.py` → Pydantic models or dataclasses for type-safe config
- `defaults.yaml` → Baseline defaults (overridden by env-specific configs)

### types/
**Responsibility:** Canonical type definitions and enums used brain-wide.
**Key Artifacts:**
- `base_types.py` → Symbol, Timestamp, Decimal, Currency
- `market_types.py` → Exchange, OrderSide, OrderType, TimeInForce
- `options_types.py` → OptionType (Call/Put), Strike, Expiration, OptionContract
- `timeframe_types.py` → Timeframe enum/class (M1, M5, H1, D1, SWING, EVENT)
- `state_types.py` → SignalState, TradeState, StateTransition

### utils/
**Responsibility:** Shared utility functions (no business logic).
**Key Artifacts:**
- `time_utils.py` → Market hours check, timezone conversion, expiry calculations
- `validation.py` → Schema validators, range checks, null guards
- `formatters.py` → Price/decimal formatting, log message templates
- `constants.py` → Hard constants (market open/close, tick sizes, rate limits)

### logging/
**Responsibility:** Structured logging with trace IDs, context injection, and level control.
**Key Artifacts:**
- `logger.py` → Logger class with methods: `info()`, `warn()`, `error()`, `trace()`, `context()`
- `log_schema.py` → Standardized log message structure (timestamp, level, module, trace_id, message, metadata)
- `formatters.py` → JSON formatter, console formatter, audit formatter

### timeframe_models/
**Responsibility:** Defines behavior and constraints for each timeframe type.

#### intraday/
**Responsibility:** Models for M1, M5, M15, H1 intraday timeframes.
**Key Artifacts:**
- `intraday_model.py` → Active hours (market open only), bar alignment, lookback limits
- `intraday_transitions.py` → When to invalidate signals (e.g., end of session)

#### swing/
**Responsibility:** Models for multi-day holding periods (D1, W1).
**Key Artifacts:**
- `swing_model.py` → Active across sessions, overnight risk allowed, longer invalidation windows
- `swing_transitions.py` → Weekly rollover logic, weekend handling

#### event_driven/
**Responsibility:** Models for earnings, Fed announcements, opex, etc.
**Key Artifacts:**
- `event_model.py` → Anchored to scheduled events, validity windows (pre/post event)
- `event_transitions.py` → Auto-invalidation after event + buffer period

### state_models/
**Responsibility:** Formal state machines governing signal and trade lifecycle.

#### signal_state_machine/
**Responsibility:** Manages signal progression: nascent → precursor → armed → triggered / invalidated / expired.
**Key Artifacts:**
- `signal_fsm.py` → State definitions, allowed transitions, guard conditions
- `signal_events.py` → Event types: `PrecursorDetected`, `Armed`, `TriggerFired`, `ConditionInvalidated`, `TimeExpired`
- `signal_guards.py` → Boolean checks before state transitions (e.g., volume confirmation for armed → triggered)

#### trade_state_machine/
**Responsibility:** Manages trade lifecycle: pending → open → managing → closing → closed / failed.
**Key Artifacts:**
- `trade_fsm.py` → State definitions, transitions, failure paths
- `trade_events.py` → `OrderSubmitted`, `Filled`, `PartialFill`, `StopHit`, `ProfitTargetHit`, `ManualClose`, `OrderRejected`
- `trade_guards.py` → Pre-transition checks (e.g., sufficient capital before open, position exists before managing)

#### lifecycle_events/
**Responsibility:** Immutable event log for audit trail.
**Key Artifacts:**
- `event_log.py` → Append-only store for all state transitions (timestamp, entity_id, old_state, new_state, trigger, metadata)
- `event_schema.py` → LifecycleEvent structure

### security/
**Responsibility:** Protects secrets, enforces access control, ensures audit immutability, detects tampering.

#### secrets_management/
**Responsibility:** Secure retrieval and injection of API keys, broker credentials, encryption keys.
**Key Artifacts:**
- `secrets_store.py` → Interface to vault (e.g., AWS Secrets Manager, HashiCorp Vault, env var fallback)
- `secrets_schema.py` → Secret metadata (name, rotation_date, access_policy)

#### key_rotation/
**Responsibility:** Automated rotation policy for API keys and tokens.
**Key Artifacts:**
- `rotation_policy.py` → Rotation interval, expiry warnings, automated refresh logic
- `rotation_log.py` → Audit log of key rotations (old_key_id, new_key_id, timestamp, actor)

#### access_control/
**Responsibility:** Role-based access (e.g., read-only vs. trade execution permissions).
**Key Artifacts:**
- `roles.py` → Role definitions (VIEWER, TRADER, ADMIN)
- `permissions.py` → Permission matrix (who can do what)
- `access_guard.py` → Runtime enforcement (decorator or middleware)

#### audit_immutability/
**Responsibility:** Ensures audit logs and lifecycle events cannot be altered or deleted.
**Key Artifacts:**
- `immutable_log.py` → Append-only log with cryptographic chaining (hash of previous entry)
- `verification.py` → Chain integrity check (detects missing or altered entries)

#### tamper_detection/
**Responsibility:** Detects unauthorized modification of critical data (configs, state, logs).
**Key Artifacts:**
- `tamper_check.py` → Hash-based integrity checks, checksum validation
- `alert.py` → Emit critical alert on tamper detection (halt system if configured)

---

## 6) Interfaces

### Upstream
- **None** (this is the root dependency)

### This Folder
- Exposes all types, config, logging, timeframe models, state machines, and security primitives

### Downstream
- **All other folders** (01–18) import from `00_core`
- Example: `01_data_ingestion` imports `Logger`, `ConfigContract`, `Symbol`, `Timestamp`
- Example: `08_signal_generation` imports `SignalStateMachine`, `TimeframeModel`, `LifecycleEvent`

---

## 7) Validation & Failure Modes

### Validation Rules
- **Config validation:** All required fields present, types correct, no conflicting params (fail fast on startup)
- **Secret validation:** All required secrets retrievable, not expired, meet length/format requirements
- **Timeframe validation:** No overlapping active periods, all transitions well-defined
- **State machine validation:** All transitions have defined guards, no orphaned states
- **Audit log validation:** Chain integrity maintained, no gaps in sequence numbers

### Failure Modes

| Failure | Detection | Response |
|---------|-----------|----------|
| Missing required config | Startup | Raise exception, halt boot |
| Secret retrieval failure | Runtime | Retry 3x with backoff, then fail + alert |
| Invalid state transition | Runtime | Reject transition, log error, emit alert |
| Audit chain broken | Periodic check | Emit critical alert, lock writes, escalate |
| Tamper detected in config/logs | Hash mismatch | Halt system, emit security alert |
| Timezone/time source failure | Clock inconsistency | Fallback to UTC, log warning |

---

## 8) Minimum Acceptance Criteria

✅ **Config:**
- Config loader successfully parses valid YAML/JSON and rejects malformed files
- All required fields validated with appropriate types
- Defaults merged correctly with environment-specific overrides

✅ **Types:**
- All core types defined and importable
- Enums exhaustive (no missing states/values)
- Types are serializable (JSON-safe for logging/storage)

✅ **Logging:**
- Logger emits structured JSON logs with all required fields (timestamp, level, trace_id, message)
- Context injection works (can attach trade_id, signal_id to all downstream logs)
- Log levels configurable (DEBUG, INFO, WARN, ERROR, CRITICAL)

✅ **Timeframe Models:**
- Each timeframe model can answer: `is_active()`, `next_transition()`, `valid_for_entry()`
- Transition logic tested for market open/close, weekends, holidays
- Event-driven models correctly handle pre/post event windows

✅ **State Machines:**
- Signal FSM: all 6 states defined, transitions guarded, events logged
- Trade FSM: all 6 states defined, failure paths handled, immutable event log
- Guard conditions unit-tested (valid transitions allowed, invalid transitions rejected)

✅ **Security:**
- Secrets retrievable from vault (or env fallback in dev)
- Key rotation policy documented and testable (mock rotation in test env)
- Access control enforced (RBAC decorator works)
- Audit log append-only, cryptographic chain verifiable
- Tamper detection triggers alert on hash mismatch

✅ **Testing:**
- Unit tests for all utilities (time_utils, validation, formatters)
- State machine transition tests (valid/invalid paths)
- Config schema tests (valid/invalid inputs)
- Security tests (secret retrieval, tamper detection, chain verification)

✅ **Documentation:**
- README in `00_core/` explaining purpose, submodules, and usage
- Type annotations on all public functions
- Docstrings for all state machines and models

---

## 9) Deferred Design Notes

None for `00_core`. All design decisions resolved in-scope.
