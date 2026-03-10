# Data Pipeline Pattern

## Pattern Summary

An automated ETL/ELT pipeline that extracts data from source systems, transforms it according to business rules, and loads it into a destination system for analysis or operational use. This pattern covers the complete pipeline lifecycle including incremental extraction, data transformation, quality validation, loading strategies, scheduling, monitoring, and error recovery.

---

## 1. Problem Statement

Business data scattered across multiple operational systems (CRM, ERP, support, marketing) needs to be consolidated into a central data warehouse or analytics platform. The pipeline must run reliably on a schedule, handle data quality issues, and scale with growing data volumes.

---

## 2. Architecture

```
┌─────────┐  ┌─────────┐  ┌─────────┐
│Source A  │  │Source B  │  │Source C  │
│(CRM API) │  │(Database)│  │(Files)  │
└────┬─────┘  └────┬─────┘  └────┬────┘
     │              │              │
     v              v              v
┌────────────────────────────────────┐
│         EXTRACTION LAYER           │
│  (incremental, paginated, cached)  │
└──────────────┬─────────────────────┘
               │
               v
┌────────────────────────────────────┐
│         STAGING LAYER              │
│  (raw data, as-extracted)          │
└──────────────┬─────────────────────┘
               │
               v
┌────────────────────────────────────┐
│       TRANSFORMATION LAYER         │
│  (clean, map, enrich, aggregate)   │
└──────────────┬─────────────────────┘
               │
               v
┌────────────────────────────────────┐
│         VALIDATION LAYER           │
│  (data quality checks)             │
└──────────────┬─────────────────────┘
               │
               v
┌────────────────────────────────────┐
│           LOAD LAYER               │
│  (upsert to destination)           │
└──────────────┬─────────────────────┘
               │
               v
┌────────────────────────────────────┐
│       DESTINATION                  │
│  (data warehouse / analytics DB)   │
└────────────────────────────────────┘
```

---

## 3. Components

### 3.1 Extraction Layer

**Incremental Extraction Strategy**:
```yaml
extraction:
  source_a:
    type: "api"
    method: "incremental"
    cursor_field: "updated_at"
    cursor_storage: "pipeline_state.source_a_cursor"
    batch_size: 100
    rate_limit: "10 requests/second"

  source_b:
    type: "database"
    method: "cdc"
    table: "orders"
    cdc_method: "timestamp"
    cursor_field: "modified_at"

  source_c:
    type: "file"
    method: "new_files"
    path: "s3://bucket/incoming/"
    pattern: "*.csv"
    processed_marker: "move to s3://bucket/processed/"
```

**Error Handling**: If extraction fails mid-batch, the cursor is not advanced. Next run retries from the last successful cursor position.

### 3.2 Staging Layer

Store raw extracted data before transformation:
- Preserves the original data for debugging and reprocessing
- Decouples extraction from transformation (can re-run transforms without re-extracting)
- Storage: temporary database table, S3 files, or in-memory (for small datasets)

### 3.3 Transformation Layer

**Transformation Steps** (executed in order):

1. **Deduplication**: Remove duplicate records from extraction batch
2. **Cleaning**: Standardize formats, handle nulls, fix encoding
3. **Mapping**: Rename fields, convert types, map enums
4. **Enrichment**: Join with reference data, compute derived fields
5. **Aggregation**: Summarize detail records into analytical summaries
6. **Conformity**: Ensure output matches destination schema

### 3.4 Validation Layer

Run data quality checks after transformation:

```yaml
validations:
  - name: "row_count_check"
    type: "count"
    rule: "count > 0"
    severity: "critical"  # Pipeline fails if violated

  - name: "null_check_email"
    type: "null_rate"
    field: "email"
    rule: "null_rate < 0.05"
    severity: "warning"  # Pipeline continues, alert sent

  - name: "referential_integrity"
    type: "foreign_key"
    field: "customer_id"
    reference: "customers.id"
    rule: "orphan_rate < 0.01"
    severity: "high"

  - name: "freshness_check"
    type: "max_value"
    field: "updated_at"
    rule: "max_value > now() - interval '2 hours'"
    severity: "critical"
```

### 3.5 Load Layer

**Loading Strategy**:

| Strategy | SQL Pattern | When to Use |
|----------|------------|-------------|
| Upsert | `INSERT ... ON CONFLICT UPDATE` | Most operational tables |
| Append | `INSERT INTO ... SELECT ...` | Event/log tables |
| Full Replace | `TRUNCATE; INSERT INTO ...` | Small dimension tables |
| Merge | `MERGE INTO ... USING ...` | Complex update logic |

---

## 4. Scheduling

### 4.1 Schedule Configuration

```yaml
schedule:
  main_pipeline:
    cron: "0 */2 * * *"  # Every 2 hours
    timeout: 30min
    retry:
      max_attempts: 3
      delay: "5min"

  reconciliation:
    cron: "0 3 * * 0"  # Sunday 3 AM
    timeout: 2h
    retry:
      max_attempts: 1
```

### 4.2 Dependency Management

If the pipeline has multiple stages that must run in order:

```
Extract Source A ──┐
Extract Source B ──┼──> Transform ──> Validate ──> Load
Extract Source C ──┘
```

Use dependency-based scheduling (not fixed time offsets).

---

## 5. State Management

Track pipeline state for incremental processing and recovery:

```json
{
  "pipeline_id": "daily_crm_sync",
  "last_successful_run": "2024-03-15T02:00:00Z",
  "cursors": {
    "source_a": {"updated_at": "2024-03-15T01:58:42Z"},
    "source_b": {"id": 45892},
    "source_c": {"last_file": "export_20240315.csv"}
  },
  "stats": {
    "last_extracted": 1250,
    "last_transformed": 1248,
    "last_loaded": 1248,
    "last_rejected": 2
  }
}
```

---

## 6. Error Handling

| Error | Stage | Recovery |
|-------|-------|----------|
| API timeout | Extract | Retry from last cursor position |
| Rate limited | Extract | Wait for rate limit reset, retry |
| Invalid data | Transform | Log to error table, continue processing valid records |
| Validation failure (critical) | Validate | Halt pipeline, alert team |
| Validation failure (warning) | Validate | Continue, alert team |
| Load conflict | Load | Log conflict, use configured resolution strategy |
| Database connection failure | Load | Retry 3x, then halt and alert |

---

## 7. Monitoring

### 7.1 Pipeline Metrics

| Metric | Target | Alert |
|--------|--------|-------|
| Pipeline success rate | 100% | Any failure |
| Pipeline duration | < 30 min | > 1 hour |
| Records extracted | Within 20% of previous run | Deviation > 50% |
| Records rejected | < 1% | > 5% |
| Data freshness | < 4 hours | > 6 hours |
| Validation pass rate | > 99% | < 95% |

### 7.2 Pipeline Dashboard

- Run history (success/failure timeline)
- Duration trend (performance regression detection)
- Volume trend (records processed per run)
- Error breakdown (by type and stage)
- Data freshness indicator

---

## 8. Implementation Checklist

- [ ] Source system access configured (APIs, database credentials, file access)
- [ ] Incremental extraction implemented with cursor tracking
- [ ] Staging storage provisioned
- [ ] Transformation logic implemented and tested
- [ ] Data quality validation rules defined
- [ ] Loading strategy selected and implemented
- [ ] Pipeline state management implemented
- [ ] Schedule configured
- [ ] Error handling with retry and alerting
- [ ] Monitoring dashboard created
- [ ] Reconciliation job implemented
- [ ] Documentation completed
- [ ] Initial full load executed and verified

---

*See `07_data_sync/etl_automation.md` for detailed ETL theory.*
