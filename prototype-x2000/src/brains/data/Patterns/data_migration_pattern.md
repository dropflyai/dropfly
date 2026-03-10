# Data Migration Pattern — Planning, Execution, and Validation

## Context

You need to migrate data between systems: warehouse-to-warehouse (e.g., Redshift
to Snowflake), schema evolution within a warehouse, database consolidation, or
platform migration. Data migrations are high-risk operations where data loss or
corruption can have severe business consequences. This pattern provides a structured
approach to planning, executing, validating, and cutting over with minimal risk.

---

## Problem Statement

Data migrations fail when they:
- Underestimate the complexity of transformation and mapping
- Lack comprehensive validation to detect silent data loss
- Have no rollback plan when things go wrong
- Disrupt downstream consumers without coordination
- Attempt a "big bang" cutover without incremental validation

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                  DATA MIGRATION                              │
│                                                              │
│  Phase 1        Phase 2         Phase 3         Phase 4     │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐│
│  │ Assess & │   │ Build &  │   │ Execute  │   │ Validate │││
│  │ Plan     │──>│ Test     │──>│ Migrate  │──>│ & Cutover│││
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘│
│       │              │              │              │         │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐│
│  │Inventory │   │Migration │   │Parallel  │   │Validation│││
│  │& Mapping │   │Scripts   │   │Run       │   │Reports   │││
│  └──────────┘   └──────────┘   └──────────┘   └──────────┘│
└─────────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Assessment and Planning (Weeks 1-3)

**1.1 Data Inventory**

Catalog every object that must be migrated:

```yaml
inventory:
  tables:
    - name: fct_orders
      source: redshift.analytics.fct_orders
      target: snowflake.analytics.fct_orders
      row_count: 145,234,567
      size_gb: 23.4
      partitioned_by: order_date
      dependencies: [dim_customer, dim_product, dim_date]
      daily_inserts: ~500,000
      criticality: P0

    - name: dim_customer
      source: redshift.analytics.dim_customer
      target: snowflake.analytics.dim_customer
      row_count: 2,345,678
      size_gb: 1.2
      scd_type: 2
      criticality: P0

  views: [...]
  stored_procedures: [...]
  scheduled_queries: [...]
  permissions: [...]
  downstream_consumers:
    - name: executive_dashboard
      type: Looker
      tables_used: [fct_orders, dim_customer]
      owner: analytics-team
    - name: churn_model
      type: ML pipeline
      tables_used: [fct_orders, dim_customer]
      owner: ml-team
```

**1.2 Schema Mapping**

Document every transformation between source and target:

```
Source (Redshift)              Target (Snowflake)            Transform
─────────────────────         ─────────────────────         ──────────
INT (order_id)                NUMBER(38,0)                  Direct
VARCHAR(256) (name)           VARCHAR(256)                  Direct
TIMESTAMPTZ                   TIMESTAMP_TZ                  Direct
DECIMAL(12,2) (amount)        NUMBER(12,2)                  Direct
BOOLEAN                       BOOLEAN                       Direct
SUPER (json_data)             VARIANT                       Parse + reformat
GEOMETRY                      GEOGRAPHY                     ST_Transform
```

**1.3 Risk Assessment**

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|-----------|
| Data loss during transfer | Low | Critical | Checksum validation per table |
| Schema incompatibility | Medium | High | Full schema mapping + test migration |
| Performance degradation | Medium | Medium | Benchmark critical queries before/after |
| Downstream breakage | High | High | Consumer notification + testing |
| Extended downtime | Low | High | Parallel-run strategy, quick rollback |

**1.4 Migration Strategy Selection**

| Strategy | Description | Risk | Downtime |
|----------|-----------|------|----------|
| Big Bang | Migrate everything at once | High | Hours-days |
| Phased | Migrate table groups incrementally | Medium | Minutes per phase |
| Parallel Run | Both systems active, sync data | Low | Zero (when ready) |
| Trickle | Continuous replication during migration | Low | Zero |

Recommendation: **Parallel Run** for critical systems.

### Phase 2: Build and Test (Weeks 3-6)

**2.1 Migration Scripts**

```python
class TableMigrator:
    def __init__(self, source, target, table_config):
        self.source = source
        self.target = target
        self.config = table_config

    def extract(self, partition=None):
        """Extract data from source, optionally by partition."""
        query = f"SELECT * FROM {self.config.source_table}"
        if partition:
            query += f" WHERE {self.config.partition_col} = '{partition}'"
        return self.source.execute(query)

    def transform(self, data):
        """Apply schema transformations."""
        for col, transform in self.config.transforms.items():
            data[col] = transform(data[col])
        return data

    def load(self, data):
        """Load into target system."""
        self.target.bulk_insert(
            table=self.config.target_table,
            data=data,
            on_conflict="replace",
        )

    def validate(self, partition=None):
        """Validate migration for a partition."""
        source_count = self.source.count(self.config.source_table, partition)
        target_count = self.target.count(self.config.target_table, partition)

        source_checksum = self.source.checksum(self.config.source_table, partition)
        target_checksum = self.target.checksum(self.config.target_table, partition)

        return {
            "count_match": source_count == target_count,
            "checksum_match": source_checksum == target_checksum,
            "source_count": source_count,
            "target_count": target_count,
        }
```

**2.2 Test Migration (Subset)**

```
Test migration sequence:
1. Migrate 1% sample of each table
2. Validate counts, checksums, and sample queries
3. Run downstream queries against target
4. Compare query results between source and target
5. Benchmark query performance on target
6. Fix any issues and repeat
```

**2.3 Validation Framework**

```python
validations = [
    # Row count validation
    RowCountValidation(tolerance_pct=0.0),  # exact match required

    # Checksum validation (sum of numeric columns)
    ChecksumValidation(
        columns=["amount", "quantity", "discount"],
        tolerance=0.001,  # float precision
    ),

    # Sample comparison (random 1000 rows, all columns)
    SampleComparison(sample_size=1000, key_column="id"),

    # Query result comparison
    QueryComparison(
        queries=[
            "SELECT COUNT(*), SUM(amount) FROM fct_orders WHERE order_date >= '2024-01-01'",
            "SELECT customer_segment, COUNT(*) FROM dim_customer GROUP BY 1",
        ],
        tolerance=0.001,
    ),

    # Schema validation
    SchemaValidation(expected_schema=TARGET_SCHEMA),
]
```

### Phase 3: Execute Migration (Week 6-7)

**3.1 Migration Order**

```
Order (respecting dependencies):
1. Dimension tables (no foreign key dependencies)
   dim_date -> dim_product -> dim_customer -> dim_store
2. Fact tables (depend on dimensions)
   fct_orders -> fct_returns -> fct_inventory
3. Aggregate tables (depend on facts)
   agg_daily_revenue -> agg_weekly_retention
4. Views (depend on tables)
5. Permissions (after all objects exist)
```

**3.2 Parallel Run Protocol**

```
Week 1: Source = primary, Target = shadow
  - All writes go to source
  - CDC replicates to target continuously
  - Run downstream queries against both, compare results
  - Fix discrepancies

Week 2: Source = primary, Target = validated
  - All validations passing
  - Downstream consumers tested against target
  - Performance benchmarks acceptable

Week 3: Cutover
  - Stop writes to source
  - Final sync to target
  - Validate final state
  - Switch consumers to target
  - Source becomes read-only backup

Week 4: Decommission
  - Monitor target for 1 week post-cutover
  - Resolve any issues
  - Decommission source (after backup retention period)
```

### Phase 4: Validate and Cutover (Week 7-8)

**4.1 Cutover Checklist**

```
Pre-cutover:
  [ ] All tables migrated and validated
  [ ] Row counts match for all tables
  [ ] Checksums match for all numeric columns
  [ ] Sample query results match within tolerance
  [ ] Downstream consumers tested and approved
  [ ] Performance benchmarks met
  [ ] Permissions configured and tested
  [ ] Rollback plan documented and tested

Cutover:
  [ ] Final data sync completed
  [ ] Source marked read-only
  [ ] Consumer connections switched to target
  [ ] Smoke tests passing on target
  [ ] Monitoring active for target

Post-cutover:
  [ ] All consumers verified operational
  [ ] No data quality alerts triggered
  [ ] Performance within benchmarks
  [ ] Stakeholders notified of completion
  [ ] Source decommission scheduled
```

**4.2 Validation Report**

```
Migration Validation Report
Date: 2024-07-15
Source: Redshift (analytics cluster)
Target: Snowflake (analytics warehouse)

Table                   | Rows Source | Rows Target | Match | Checksum
fct_orders              | 145,234,567| 145,234,567 | OK    | OK
dim_customer            | 2,345,678  | 2,345,678   | OK    | OK
dim_product             | 15,432     | 15,432      | OK    | OK
fct_returns             | 8,901,234  | 8,901,234   | OK    | OK

Query Comparison:
  Q1 (daily revenue):     Source: $1,234,567.89  Target: $1,234,567.89  MATCH
  Q2 (customer count):    Source: 234,567        Target: 234,567        MATCH
  Q3 (top products):      Source: [matches]      Target: [matches]      MATCH

Performance:
  Q1 latency: Source 4.2s, Target 1.8s (57% faster)
  Q2 latency: Source 2.1s, Target 0.9s (57% faster)

Status: PASSED - Ready for cutover
```

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Zero data loss | Extended migration timeline |
| Parallel run safety | Doubled infrastructure cost during migration |
| Comprehensive validation | Significant engineering effort |
| Rollback capability | Operational complexity |

---

## Anti-patterns

- Migrating without a complete data inventory
- Skipping validation (trusting the tool)
- Big bang cutover for critical systems
- Not testing downstream consumers
- Decommissioning source before validation period
- Ignoring data type differences between platforms

---

## Checklist

- [ ] Complete data inventory with sizes, dependencies, and criticality
- [ ] Schema mapping documented for every table
- [ ] Risk assessment completed with mitigation plans
- [ ] Migration strategy selected (parallel run recommended)
- [ ] Migration scripts built and tested on subset
- [ ] Validation framework operational (counts, checksums, queries)
- [ ] Downstream consumers identified and tested
- [ ] Rollback plan documented and tested
- [ ] Cutover executed with validation report
- [ ] Post-cutover monitoring active for 1 week minimum

---

## References

- Kleppmann (2017). Designing Data-Intensive Applications, Chapter 4.
- Snowflake Migration Guide (official documentation).
- AWS Database Migration Service best practices.
