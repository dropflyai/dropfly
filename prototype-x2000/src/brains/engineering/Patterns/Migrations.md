# Database Migration Patterns

## What This Enables

Database migrations are the mechanism by which a schema evolves alongside application code. Done poorly, they cause downtime, data loss, and deployment fear. Done well, they become an invisible, continuous delivery primitive -- allowing teams to ship hundreds of times per day against live production databases with zero service interruption.

This document codifies the formal patterns, tools, ordering constraints, and rollback strategies required for professional-grade migration engineering. It draws on Fowler and Sadalage's evolutionary database design (2003, revised 2016), the operational tooling ecosystem (gh-ost, pt-online-schema-change, pg_repack), and production experience with Supabase/PostgreSQL at scale.

---

## Formal Taxonomy: Schema Migrations vs Data Migrations

A migration is any versioned, ordered transformation applied to a database. The two fundamental categories are orthogonal in purpose, risk profile, and execution model.

### Schema Migrations (DDL)

Schema migrations alter the structure of the database: tables, columns, indexes, constraints, views, functions, triggers, and extensions. They are expressed as Data Definition Language (DDL) statements. Key properties:

- **Idempotent by convention.** A well-written schema migration uses `IF NOT EXISTS`, `IF EXISTS`, and conditional guards so that re-execution is safe.
- **Metadata-only in the best case.** Adding a nullable column with no default in PostgreSQL is metadata-only (no table rewrite). Adding a column with a volatile default forces a full table rewrite in versions prior to PostgreSQL 11.
- **Lock-acquiring.** Most DDL acquires an `ACCESS EXCLUSIVE` lock for at least a brief window. Duration and severity depend on the specific operation and PostgreSQL version.

### Data Migrations (DML)

Data migrations transform the contents of existing rows: backfilling a new column, reformatting stored values, merging duplicates, or splitting a table's data across a new normalized schema. Expressed as DML (INSERT, UPDATE, DELETE) or application-level scripts.

- **Potentially unbounded in duration.** A backfill across 500 million rows may take hours.
- **Row-lock-acquiring.** Each updated row takes a row-level lock, interacting with concurrent transactions.
- **Often not idempotent without explicit design.** Writing `UPDATE t SET col = f(col)` is not idempotent if `f` is not a projection. Idempotent data migrations require a sentinel check or a convergent function.

### The Critical Distinction

Schema migrations change **what can be stored**. Data migrations change **what is stored**. Conflating them in a single migration file is a common source of long-running locks, failed deployments, and confused rollbacks. The engineering rule: **separate DDL from DML into distinct, ordered migration files.**

---

## Zero-Downtime Migrations: The Expand-Contract Pattern

The expand-contract pattern (also called parallel change) is the canonical method for zero-downtime schema evolution. It decomposes a breaking change into a sequence of non-breaking steps.

### Formal Phases

**Phase 1 -- Expand.** Add the new schema element alongside the old one. Both coexist. The application writes to both old and new structures (dual-write or trigger-based replication). No application behavior changes for reads.

**Phase 2 -- Migrate.** Backfill historical data into the new structure. This is a data migration executed in batches with throttling (see "Large Table Migrations"). At completion, old and new structures contain equivalent data.

**Phase 3 -- Transition.** Switch the application to read from the new structure. The old structure continues receiving writes as a safety net. This phase may involve a feature flag or gradual traffic shift.

**Phase 4 -- Contract.** Remove the old structure. Drop the column, table, or index. This is the only destructive step and must occur only after all application versions referencing the old structure have been fully decommissioned.

### Timing Constraints

Each phase is a separate deployment. The minimum number of deployments for a breaking schema change is four. In practice, Phases 1-2 are often combined into a single deployment (expand + backfill), and Phase 4 is deferred by days or weeks to allow rollback safety.

### Formal Invariant

At no point during the expand-contract sequence does any deployed application version encounter a schema it cannot operate against. This zero-downtime invariant requires that the schema is always a superset of what any live application version expects.

---

## Online DDL Tools

When a schema change requires a table rewrite, standard DDL acquires an `ACCESS EXCLUSIVE` lock for the duration. For large tables, this means downtime. Online DDL tools perform the rewrite in the background.

### gh-ost (GitHub Online Schema Transformation)

Developed by GitHub for MySQL. Creates a ghost table with the desired schema, copies rows in controlled batches, and uses the binary log to capture ongoing changes. Final table swap uses a cooperative locking algorithm (milliseconds). **No triggers** -- reads the binary log directly, avoiding trigger overhead and lock contention. Monitors replication lag and server load for automatic throttling. Does not support foreign keys pointing to the migrated table (the rename breaks FK references).

### pt-online-schema-change (Percona Toolkit)

The original online DDL tool for MySQL. Creates a new table, adds triggers to the original to capture INSERT, UPDATE, and DELETE operations, then copies rows in chunks. Trigger-based approach adds write overhead proportional to the table's write rate. Supports `--alter-foreign-keys-method` for FK rebuilding, though this adds complexity. Mature and battle-tested for over a decade.

### pg_repack (PostgreSQL)

PostgreSQL extension that repacks tables and indexes online. Creates a new table, copies rows, applies changes captured via a log trigger, then swaps using a brief exclusive lock (typically < 1 second even for multi-terabyte tables). Requires a primary key or unique index for row identification during the change-capture phase. Primary use cases: table bloat reclamation, CLUSTER operations, column-type changes requiring a rewrite.

### PostgreSQL Native Online DDL

PostgreSQL has progressively reduced the set of operations requiring table rewrites:

- **PG 11+:** `ALTER TABLE ADD COLUMN ... DEFAULT x` is metadata-only for constant expressions. No rewrite.
- **PG 12+:** `REINDEX CONCURRENTLY` allows index rebuilds without blocking writes.
- **PG 14+:** `ALTER TABLE ... DETACH PARTITION CONCURRENTLY`.

Always verify the lock level of a DDL statement against the PostgreSQL documentation for your specific version before assuming it is safe for online execution.

---

## Rollback Strategies

### Backward-Compatible Rollback

The preferred strategy. Every migration is written so both pre- and post-migration application code can operate against the post-migration schema. Rollback means deploying the previous application version; the schema does not need to change. This requires:

- New columns are nullable or have defaults.
- No columns are dropped (until the contract phase).
- No column types are changed in a breaking way.
- No constraints are added that the old application would violate.

### Forward-Only Migration

Some changes are inherently irreversible: dropping a column with data, merging tables, or lossy data transformations. Mitigations for forward-only migrations:

1. **Pre-migration backup.** Take a logical backup (pg_dump) or snapshot before the migration.
2. **Staged rollout.** Apply the migration to a staging environment first and soak for a defined period.
3. **Canary deployment.** If the application is horizontally scaled, migrate a single shard or partition first.

### Compensating Migrations

A compensating migration is a new forward migration that undoes a previous migration's effect. It is not a transactional rollback -- it has its own version number. Example: Migration V12 adds a NOT NULL constraint. Migration V13 (the compensating migration) drops it. The database version advances from 12 to 13; it never reverts to 11. Compensating migrations are the safest rollback strategy for production databases because they preserve the monotonically increasing version sequence and avoid the ambiguity of version regression.

---

## Migration Ordering and Dependency Graphs

Migrations form a directed acyclic graph (DAG) of dependencies. Most frameworks linearize this into a total order via sequential version numbers or timestamps.

### Ordering Invariants

1. A migration adding a foreign key must be ordered after the migration creating the referenced table.
2. A data migration backfilling a column must be ordered after the schema migration adding the column.
3. A migration dropping a column must be ordered after all application code referencing it has been removed from all deployed versions.

### Branching and Merge Conflicts

When multiple developers create migrations on separate branches, merge conflicts in the version sequence are inevitable. Strategies:

- **Timestamp-based versioning.** UTC timestamps (e.g., `20260219143022`) instead of sequential integers. Collisions are extremely unlikely.
- **Dependency declaration.** Frameworks like Alembic support explicit `depends_on` directives, allowing partial order rather than total order.
- **CI enforcement.** A CI check detecting duplicate or out-of-order migration versions fails the build.

### Topological Sort at Deploy Time

For systems with declared dependencies, the migration runner performs a topological sort of the DAG at deploy time. If a cycle is detected, the deployment fails. This is strictly preferable to implicit ordering by filename, which can mask dependency violations.

---

## Large Table Migrations

Migrating tables with hundreds of millions or billions of rows requires explicit batching and throttling to avoid overwhelming the database.

### Batching

Process rows in fixed-size batches (typically 1,000-50,000 per batch). Each batch is a separate transaction. This bounds transaction log size, limits lock duration, and allows the migration to be paused or resumed.

```sql
WITH batch AS (
  SELECT id FROM large_table
  WHERE new_column IS NULL
  ORDER BY id LIMIT 5000
  FOR UPDATE SKIP LOCKED
)
UPDATE large_table SET new_column = compute_value(old_column)
WHERE id IN (SELECT id FROM batch);
```

The `SKIP LOCKED` clause prevents the migration from blocking (or being blocked by) concurrent transactions on the same rows.

### Throttling

Insert a delay between batches to allow the database to process replication, vacuum, and serve application queries. Common throttling strategies:

- **Fixed delay.** Sleep for N milliseconds between batches.
- **Replication-lag-aware.** Monitor replication lag; pause when it exceeds a threshold (e.g., 5 seconds).
- **Load-aware.** Monitor CPU, IOPS, or active connection count and adjust batch size or delay dynamically.

### Checkpointing

For migrations that may take hours, implement checkpointing: record the last processed primary key so the migration can resume after a crash or intentional pause.

```sql
CREATE TABLE IF NOT EXISTS migration_checkpoints (
  migration_name TEXT PRIMARY KEY,
  last_processed_id BIGINT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);
```

---

## Foreign Key and Constraint Considerations

### Adding Foreign Keys to Large Tables

`ALTER TABLE ADD CONSTRAINT ... FOREIGN KEY` acquires a `SHARE ROW EXCLUSIVE` lock on both the referencing and referenced tables, then validates all existing rows. For large tables, the validation scan can take minutes or hours while holding the lock.

**Safe pattern (PostgreSQL):**

```sql
-- Step 1: Add constraint as NOT VALID (metadata only, brief lock)
ALTER TABLE orders
  ADD CONSTRAINT fk_orders_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id)
  NOT VALID;

-- Step 2: Validate separately (SHARE UPDATE EXCLUSIVE -- no write blocking)
ALTER TABLE orders VALIDATE CONSTRAINT fk_orders_customer;
```

### Adding NOT NULL Constraints (PostgreSQL 12+)

```sql
-- Step 1: CHECK constraint as NOT VALID
ALTER TABLE users ADD CONSTRAINT users_email_nn CHECK (email IS NOT NULL) NOT VALID;

-- Step 2: Validate
ALTER TABLE users VALIDATE CONSTRAINT users_email_nn;

-- Step 3: Set NOT NULL (PG 12+ recognizes the validated CHECK, skips scan)
ALTER TABLE users ALTER COLUMN email SET NOT NULL;

-- Step 4: Drop redundant CHECK
ALTER TABLE users DROP CONSTRAINT users_email_nn;
```

### Dropping Constraints

Metadata-only operation, always safe from a lock perspective. The risk is semantic: once the constraint is dropped, the application must enforce the invariant itself until a replacement constraint is added.

---

## Supabase-Specific Migration Patterns

Supabase uses PostgreSQL and provides a migration framework via the CLI (`supabase migration new`, `supabase db push`, `supabase db reset`). Migrations live in `supabase/migrations/` with naming convention `<timestamp>_<description>.sql`, applied in lexicographic order.

### Row-Level Security (RLS)

Supabase enables RLS by default on new tables. Migrations must include RLS policy definitions alongside table creation:

```sql
CREATE TABLE public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own documents"
  ON public.documents FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users insert own documents"
  ON public.documents FOR INSERT WITH CHECK (auth.uid() = owner_id);
```

Failing to define RLS policies results in a table no authenticated user can access (default-deny behavior). This is the single most common Supabase migration error.

### Auth Schema

The `auth` schema is Supabase-managed. References to `auth.users` are allowed; DDL against `auth.*` tables is forbidden.

### Edge Functions and Database Functions

Database functions invoked by Edge Functions should be created in migrations. Use `SECURITY DEFINER` with extreme caution and always set `search_path` explicitly to prevent search-path injection attacks.

### Seed Data

`supabase/seed.sql` runs after all migrations during `supabase db reset`. Seeds must be idempotent (`INSERT ... ON CONFLICT DO NOTHING` or UPSERT patterns). Non-idempotent seeds break `db reset` workflows.

---

## Evolutionary Database Design (Fowler & Sadalage)

Pramod Sadalage and Martin Fowler formalized evolutionary database design in their 2003 article, expanded in *Refactoring Databases: Evolutionary Database Design* (Addison-Wesley, 2006; updated practices through 2016). The core principles:

1. **All database changes are migrations.** No ad hoc DDL against production. Every change is a versioned migration file checked into source control, establishing an audit trail and enabling reproducibility.
2. **Every migration is tested.** Migrations run in CI against a representative database (ideally a restored production snapshot or synthetic dataset of equivalent scale and shape).
3. **Database refactoring is first-class.** Schema changes are planned, reviewed, and executed with the same rigor as code changes. Sadalage and Fowler catalog 60+ named refactorings (Rename Column, Split Table, Introduce Surrogate Key), each with a defined expand-contract procedure.
4. **Transition periods are explicit.** During the expand phase, the duration of coexistence is explicitly defined and enforced. Minimum transition window equals the longest deployment cycle.
5. **Application-schema coupling is managed.** The database is a shared contract. Mechanisms: repository/DAO encapsulation, versioned database views, consumer-driven contract testing for shared databases.

---

## Practical Implications

1. **Never mix DDL and DML in a single migration file.** Prevents data operations from holding DDL locks and makes rollback analysis tractable.
2. **Every migration must be backward-compatible with the currently deployed version.** This is the expand-contract invariant.
3. **Test migrations against production-scale data in CI.** A migration completing in 200ms on 1,000 rows may take 4 hours on 800 million rows.
4. **Use `NOT VALID` / `VALIDATE CONSTRAINT` for all constraint additions on tables > 100K rows.** The two-step pattern is always safe; the single-step pattern is a gamble.
5. **Set a lock timeout before DDL:** `SET lock_timeout = '5s';` to fail gracefully instead of queuing behind a long-running transaction indefinitely.
6. **Monitor replication lag during data migrations.** Unchecked write volume can cause replicas to fall behind or disconnect.
7. **Always `CREATE INDEX CONCURRENTLY`.** Without `CONCURRENTLY`, a `SHARE` lock blocks all writes for the entire index build duration.
8. **Foreign keys to large tables must use the two-step NOT VALID pattern.** Single-step validation on 500M rows can hold locks for 30+ minutes.
9. **Compensating migrations over version rollback.** Rolling back a migration version creates ambiguity and can break frameworks assuming monotonic progression.
10. **Seed data must be idempotent.** Use `ON CONFLICT DO NOTHING` or check-before-insert patterns.
11. **Include `IF NOT EXISTS` / `IF EXISTS` guards in all DDL.** Makes migrations re-runnable and crash-resilient.
12. **Document expected lock level and duration for every migration** in the PR description or migration file header.

---

## Common Misconceptions

**"Adding a column always requires downtime."** False. In PostgreSQL 11+, adding a nullable column or one with a constant default is metadata-only, completing in milliseconds regardless of table size. Only volatile defaults or type changes trigger a rewrite.

**"Migrations should be reversible by default."** Misleading. Requiring every migration to have a `down` function leads to poorly-tested rollback paths that fail when actually needed. Compensating migrations (forward-only) are more reliable because they are tested identically to any other migration.

**"Online DDL tools eliminate all risk."** False. They reduce lock duration but introduce failure modes: disk space exhaustion (shadow table doubles storage), replication lag amplification, and cut-over failures under high write load.

**"Foreign keys are free."** False. Every child-table write requires a parent-table index lookup. Every parent-table delete/update scans the child FK index (or performs a full scan if none exists). On write-heavy workloads, this adds measurable latency.

**"Schema migrations are instantaneous in PostgreSQL."** Only metadata-only operations. Table rewrites are proportional to table size; data validations are proportional to row count.

**"You can just wrap migrations in a transaction and rollback on failure."** Partially true. PostgreSQL supports transactional DDL, but `CREATE INDEX CONCURRENTLY` and `NOT VALID` / `VALIDATE CONSTRAINT` cannot run inside transactions -- precisely the operations most critical for large-table migrations.

**"Supabase handles migrations automatically."** False. Supabase provides tooling but the engineer is responsible for writing correct, safe, backward-compatible SQL. No auto-generation from schema diffs in production workflows.

---

## Further Reading

1. Sadalage, P. J. & Fowler, M. (2003). "Evolutionary Database Design." *martinfowler.com*. https://martinfowler.com/articles/evodb.html
2. Sadalage, P. J. & Fowler, M. (2006). *Refactoring Databases: Evolutionary Database Design.* Addison-Wesley. ISBN 978-0321293534.
3. Ambler, S. W. & Sadalage, P. J. (2006). *Refactoring Databases.* Chapter 2: "Database Refactoring Strategies."
4. Noach, S. (2016). "Introducing gh-ost: GitHub's Online Schema Migration Tool for MySQL." *GitHub Engineering Blog.* https://github.blog/engineering/introducing-gh-ost/
5. Percona. (2023). *pt-online-schema-change Documentation.* https://docs.percona.com/percona-toolkit/pt-online-schema-change.html
6. PostgreSQL Global Development Group. (2024). *PostgreSQL Documentation: ALTER TABLE.* https://www.postgresql.org/docs/current/sql-altertable.html
7. Supabase. (2024). *Database Migrations.* https://supabase.com/docs/guides/cli/managing-environments
8. Winand, M. (2012). *SQL Performance Explained.* ISBN 978-3950307825. (Index maintenance and DDL costs.)
9. Djirdeh, H. et al. (2019). "Zero-Downtime Deployments with Database Migrations." *InfoQ.*
10. Kleppmann, M. (2017). *Designing Data-Intensive Applications.* O'Reilly. ISBN 978-1449373320. Ch. 4: "Encoding and Evolution."
11. PostgreSQL Wiki. (2024). "Lock Monitoring." https://wiki.postgresql.org/wiki/Lock_Monitoring
12. Nakamura, M. et al. (2020). "pg_repack: Reorganize Tables Without Exclusive Locks." https://reorg.github.io/pg_repack/
