# 02_DATA_STORE — PATCH 0004

**Commit ID:** COMMIT-0004 (patch)
**Patches:** COMMIT-0003
**Date:** 2025-12-19

---

## Summary

Clarifies three critical constraints for `02_data_store`:
1. This folder does NOT compute indicators; it only stores/caches computed outputs
2. Snapshot restore is restricted to backtest-only mode
3. Retention policies are config-driven per dataset type

---

## Changes

### 1) Clarify: No Indicator Computation

**Section 2) Does Not Own — ADD:**
```
- Feature engineering or indicator calculation (that's `03_feature_engineering`) —
  this folder only stores/caches computed outputs; computation happens upstream
- Snapshot restoration in live mode (restore is backtest-only in `16_governance_and_testing`)
```

**Section 5) Submodules → processed/ — REPLACE:**

**OLD:**
```
- `indicator_cache.py` → Precomputed indicators (e.g., EMA, VWAP) to avoid recalculation
```

**NEW:**
```
- `derived_series_store.py` → Stores derived series (e.g., EMA, VWAP) computed by
  `03_feature_engineering`. This folder does NOT compute; it only caches/stores the outputs.
```

**Section 8) Minimum Acceptance Criteria → Processed Storage — REPLACE:**

**OLD:**
```
- Indicator cache precomputes and serves frequently used indicators (e.g., 20-period EMA)
```

**NEW:**
```
- Derived series store caches/stores computed outputs from `03_feature_engineering`
  (e.g., EMA, VWAP). Does NOT perform computation.
```

---

### 2) Restrict Snapshot Restore to Backtest Mode

**Section 4) Outputs — REPLACE:**

**OLD:**
```
- `restore_snapshot(snapshot_id)` → Restores to historical state
```

**NEW:**
```
- `load_snapshot(snapshot_id, context)` → Loads snapshot in isolated context (read-only).
  **Restore** (write state back) is restricted to backtest mode in `16_governance_and_testing` only.
```

**Section 5) Submodules → snapshots/ — REPLACE:**

**OLD:**
```
- `snapshot_manager.py` → Create/restore snapshots (full state or incremental)
```

**NEW:**
```
- `snapshot_manager.py` → Create/load snapshots (full state or incremental).
  **Restore** (write state back) restricted to backtest mode in `16_governance_and_testing`.
```

**Section 7) Validation & Failure Modes → Validation Rules — ADD:**
```
- **Snapshot restore restriction:** Snapshot restore (write state back) only permitted
  in backtest mode (`16_governance_and_testing`). Live mode can load snapshots read-only
  in isolated context.
```

**Section 8) Minimum Acceptance Criteria → Snapshots — REPLACE:**

**OLD:**
```
- Restore functionality documented (implementation may be deferred to testing phase)
```

**NEW:**
```
- Load functionality (read-only) implemented for isolated context access
- Restore functionality (write state back) restricted to backtest mode in `16_governance_and_testing`
```

**Section 8) Minimum Acceptance Criteria → Testing — REPLACE:**

**OLD:**
```
- Snapshot integrity tests (create, verify hash, restore)
```

**NEW:**
```
- Snapshot integrity tests (create, verify hash, load read-only, restore in backtest mode)
```

---

### 3) Config-Driven Retention Policies Per Dataset

**Section 5) Submodules → metadata/ — REPLACE:**

**OLD:**
```
- `retention_policy.py` → Defines hot/warm/cold tiers and auto-archival rules
```

**NEW:**
```
- `retention_policy.py` → Config-driven retention policies per dataset type
  (bars, quotes, chains, flow, fundamentals, events). Defines hot/warm/cold tiers
  and auto-archival rules.
```

**Section 7) Validation & Failure Modes → Validation Rules — REPLACE:**

**OLD:**
```
- **Retention compliance:** Data older than retention policy automatically archived or purged
```

**NEW:**
```
- **Retention compliance:** Data older than retention policy automatically archived or purged
  (policy is config-driven per dataset)
```

**Section 8) Minimum Acceptance Criteria → Metadata — REPLACE:**

**OLD:**
```
- Retention policies defined (hot: 30 days, warm: 1 year, cold: archive)
```

**NEW:**
```
- Retention policies config-driven per dataset type (bars, quotes, chains, flow, fundamentals,
  events). Defaults provided but fully configurable.
```

---

## Rationale

1. **No computation in storage layer:** Enforces separation of concerns. `03_feature_engineering` computes; `02_data_store` persists. Prevents scope bleed and maintains testability.

2. **Backtest-only restore:** Prevents accidental state corruption in live mode. Snapshots are for reproducibility and audit, not live rollback.

3. **Config-driven retention:** Different datasets have different lifecycles (tick data vs. fundamentals). Hardcoded durations create operational inflexibility.

---

## Impact

- **Breaking changes:** None (COMMIT-0003 was spec-only, no implementation yet)
- **Downstream dependencies:** None affected (no code written yet)
- **Documentation:** Clarifies boundaries for future implementation

---

## Approval Status

Awaiting approval for COMMIT-0004.
