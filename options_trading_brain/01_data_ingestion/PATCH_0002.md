# 01_DATA_INGESTION — PATCH 0002

**Commit ID:** COMMIT-0002 (pre-commit corrections)
**Patches:** 01_data_ingestion SPEC (before initial commit)
**Date:** 2025-12-26

---

## Summary

Adds missing `DataQualityReport` schema to align with 02_data_store expectations (line 46).

---

## Changes

### 1) Add DataQualityReport Schema

**Section 4) Outputs — ADD after ProvenanceMetadata:**

```
#### DataQualityReport
(Extractable subset of ProvenanceMetadata for downstream consumers expecting quality-only metadata)

DataQualityReport:
  - quality_score: float             # 0.0–1.0 (1.0 = perfect quality)
  - quality_flags: string[]          # e.g., ["interpolated", "stale", "estimated", "wide_spread"]
  - is_valid: bool                   # True if passed all validation gates
  - validation_errors: string[]      # List of validation failures (empty if valid)

Note: DataQualityReport fields are always present within ProvenanceMetadata.
Downstream modules may consume either:
- Full ProvenanceMetadata (includes source, latency, batch_id, schema_version + quality)
- DataQualityReport only (quality subset for lightweight consumers)

The is_valid and validation_errors fields are computed during validation and attached before write.
```

---

### 2) Update Write Contract Section

**Section 9) Write Contract to 02_data_store — ADD item 4:**

```
4. **Quality Metadata**
   - Every record includes quality metadata accessible as `DataQualityReport`
   - `02_data_store` may consume `DataQualityReport` (quality-only) or `ProvenanceMetadata` (full lineage)
   - `02_data_store` may index by `quality_score` for filtering low-quality records
   - `quality_flags` enable downstream filtering (e.g., exclude "stale" records)
```

*(Subsequent items renumbered: Batched Writes → 5, Write Result → 6)*

---

### 3) Update Minimum Acceptance Criteria

**Section 11) Minimum Acceptance Criteria → Schema Completeness — ADD:**

```
- [ ] `DataQualityReport` extractable from every record's `ProvenanceMetadata`
```

**Section 11) Minimum Acceptance Criteria → Write Contract — ADD:**

```
- [ ] `DataQualityReport` available for quality-based filtering
```

---

## Rationale

02_data_store (COMMIT-0003, line 46) expects `DataQualityReport` as an input from 01_data_ingestion:

```
- `DataQualityReport` → Quality metadata for each record
```

This patch ensures the contract is satisfied by defining `DataQualityReport` as an extractable subset of `ProvenanceMetadata`, avoiding data duplication while maintaining backward compatibility.

---

## Impact

- **Breaking changes:** None
- **Downstream dependencies:** 02_data_store contract satisfied
- **Documentation:** Clarifies relationship between ProvenanceMetadata and DataQualityReport

---

## Approval Status

Incorporated into COMMIT-0002 SPEC.md before initial commit.
