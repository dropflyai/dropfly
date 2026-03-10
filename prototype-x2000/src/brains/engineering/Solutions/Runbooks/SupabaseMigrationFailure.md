# Supabase Migration Failure -- Operational Runbook

**Purpose:** Structured response procedure when a Supabase database migration fails.
**Owner:** Engineering Brain
**Severity Range:** SEV-2 (dev migration failure) to SEV-1 (production schema blocked)
**Cross-reference:** `Automations/Recipes/Supabase.md`, `Solutions/SolutionIndex.md`

---

## 1. Failure Modes Taxonomy

Identify which failure mode matches the error output before proceeding to diagnostics.

### 1.1 Syntax Error

**Signature:** `ERROR: syntax error at or near "..."`, `ERROR: relation "..." does not exist`
**Cause:** Typo in SQL, referencing a column/table that does not exist yet, wrong data type.
**Severity:** Low. The migration did not execute. Schema is unchanged.

### 1.2 Conflict with Existing Schema

**Signature:** `ERROR: relation "..." already exists`, `ERROR: column "..." of relation "..." already exists`
**Cause:** Migration was partially applied, re-running after a partial success, or another migration already created the object.
**Severity:** Medium. Schema may be in an intermediate state.

### 1.3 Lock Timeout

**Signature:** `ERROR: canceling statement due to lock timeout`, `ERROR: deadlock detected`
**Cause:** Another transaction holds a lock on the table. Common during ALTER TABLE on a busy table.
**Severity:** High in production. The migration did not complete but the table may be temporarily degraded.

### 1.4 Permission Denied

**Signature:** `ERROR: permission denied for table "..."`, `ERROR: must be owner of table "..."`
**Cause:** The migration is running as a role that lacks the required privileges.
**Severity:** Medium. Schema is unchanged but the migration cannot proceed without role escalation.

### 1.5 Foreign Key Violation

**Signature:** `ERROR: insert or update on table "..." violates foreign key constraint "..."`
**Cause:** Migration adds a foreign key to existing data that violates the constraint, or drops a referenced column.
**Severity:** Medium. The constraint cannot be applied until data is cleaned or the migration is restructured.

### 1.6 Data Truncation / Type Mismatch

**Signature:** `ERROR: value too long for type character varying(...)`, `ERROR: column "..." cannot be cast automatically to type "..."`
**Cause:** Changing a column type when existing data does not fit the new type.
**Severity:** Medium. Requires a data migration step before the schema migration.

---

## 2. Diagnostics

### 2.1 Check Supabase Dashboard

1. Open the Supabase project dashboard.
2. Navigate to **Database > Migrations** to see migration history.
3. Check the status of the latest migration: `applied`, `failed`, or `pending`.
4. Note the exact error message from the dashboard.

### 2.2 Check Migration Log

```bash
# List migration status via Supabase CLI
supabase migration list

# View the specific migration file
cat supabase/migrations/<timestamp>_<name>.sql

# Check the migration history table directly
supabase db execute "SELECT * FROM supabase_migrations.schema_migrations ORDER BY version DESC LIMIT 10;"
```

### 2.3 Check Active Locks

If the failure mode is lock timeout or deadlock:

```sql
-- Check for active locks on the target table
SELECT
  pid,
  usename,
  pg_blocking_pids(pid) AS blocked_by,
  query_start,
  state,
  left(query, 100) AS query_preview
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Check for advisory locks
SELECT * FROM pg_locks WHERE locktype = 'advisory';

-- Terminate a blocking query if safe (USE WITH EXTREME CAUTION)
-- SELECT pg_terminate_backend(<pid>);
```

### 2.4 Check Schema State

After a failure, verify what actually got applied:

```sql
-- Check if the table/column exists
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = '<table_name>'
ORDER BY ordinal_position;

-- Check constraints
SELECT constraint_name, constraint_type
FROM information_schema.table_constraints
WHERE table_name = '<table_name>';

-- Check indexes
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = '<table_name>';
```

---

## 3. Recovery Strategies

### 3.1 Reset (Development Only)

**When to use:** Local development or ephemeral environments only. NEVER in staging or production.

```bash
# Reset the entire local database and reapply all migrations
supabase db reset

# This drops and recreates the database from scratch
# All data will be lost
```

**Checklist before reset:**
- [ ] Confirmed this is a development environment
- [ ] No other developers are using this database instance
- [ ] Seed data will be reapplied automatically

### 3.2 Fix and Retry

**When to use:** The migration SQL has a bug but was never applied (clean failure).

1. Edit the migration file to fix the SQL error.
2. If the migration was already recorded in the history table but did not apply:
   ```bash
   # Remove the failed migration from history
   supabase db execute "DELETE FROM supabase_migrations.schema_migrations WHERE version = '<timestamp>';"
   ```
3. Reapply:
   ```bash
   supabase db push
   ```

**Checklist:**
- [ ] Verified the migration was not partially applied
- [ ] Fixed the root cause in the SQL
- [ ] Tested the fix against a local database first

### 3.3 Squash Migrations

**When to use:** Migration history is cluttered with fix-up migrations and you want a clean slate.

```bash
# Squash all pending migrations into one
supabase migration squash

# Review the squashed migration
cat supabase/migrations/<new_timestamp>_squashed.sql

# Test against local
supabase db reset
```

**Restrictions:**
- Only squash migrations that have NOT been applied to production.
- Never squash already-deployed migrations.

### 3.4 Manual SQL Fix

**When to use:** Migration was partially applied and the schema is in an intermediate state.

1. Determine what was applied and what was not (see Section 2.4).
2. Write a corrective SQL script to bring the schema to the target state.
3. Apply the corrective script:
   ```bash
   supabase db execute --file fix_migration.sql
   ```
4. Mark the original migration as applied:
   ```bash
   supabase db execute "INSERT INTO supabase_migrations.schema_migrations (version) VALUES ('<timestamp>');"
   ```

**Checklist:**
- [ ] Corrective SQL reviewed by a second engineer
- [ ] Corrective SQL tested on a copy of the database
- [ ] Migration history now reflects the correct state

---

## 4. Production Handling

### 4.1 Absolute Rules for Production

- **NEVER run `supabase db reset` in production.**
- **ALWAYS take a backup before applying migrations.**
- **ALWAYS use expand-contract for breaking changes.**
- **NEVER drop columns or tables in the same migration that adds new ones.**

### 4.2 Pre-Migration Backup

```bash
# Create a backup before any production migration
supabase db dump --file backup_$(date +%Y%m%d_%H%M%S).sql

# Verify the backup is complete
wc -l backup_*.sql
head -20 backup_*.sql
```

Store backups in a secure, versioned location. Never delete the most recent backup until the migration is verified.

### 4.3 Expand-Contract Pattern

For breaking schema changes in production, always use the two-phase approach:

**Phase 1 -- Expand:**
- Add the new column/table alongside the old one.
- Deploy application code that writes to both old and new.
- Backfill existing data into the new structure.
- Verify the new structure is correct.

**Phase 2 -- Contract:**
- Deploy application code that reads from the new structure only.
- Remove the old column/table in a separate migration.
- This phase happens days or weeks after Phase 1.

```sql
-- Phase 1: Expand (safe, additive)
ALTER TABLE users ADD COLUMN display_name TEXT;
UPDATE users SET display_name = name WHERE display_name IS NULL;

-- Phase 2: Contract (separate migration, after app is updated)
ALTER TABLE users DROP COLUMN name;
```

### 4.4 Production Migration Checklist

- [ ] Backup taken and verified
- [ ] Migration tested on staging with production-like data
- [ ] Migration tested locally with `supabase db reset`
- [ ] No destructive operations in the same migration as additive ones
- [ ] Rollback plan documented
- [ ] Maintenance window scheduled if locks are expected
- [ ] Monitoring in place to detect issues post-migration

---

## 5. Verification

### 5.1 Run the Migration Again

After applying the fix:

```bash
# Push migrations
supabase db push

# Verify migration status
supabase migration list
```

All migrations should show as `applied` with no errors.

### 5.2 Verify Schema State

```sql
-- Compare actual schema against expected schema
-- Check tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public' ORDER BY table_name;

-- Check columns on modified tables
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = '<table_name>'
ORDER BY ordinal_position;

-- Check RLS policies
SELECT tablename, policyname, cmd, qual
FROM pg_policies
WHERE schemaname = 'public';
```

### 5.3 Run Application Tests

```bash
# Run the full test suite to verify nothing is broken
npm run test

# Run database-specific tests if they exist
npm run test:db

# Run Playwright tests for affected UI flows
npx playwright test --grep "database|migration"
```

### 5.4 Verification Criteria

- [ ] All migrations show as `applied`
- [ ] Schema matches the expected state (tables, columns, constraints, indexes)
- [ ] RLS policies are correct
- [ ] Application tests pass
- [ ] No orphaned data or constraint violations

---

## 6. Prevention

### 6.1 Test Migrations Locally First

Every migration must be tested locally before being pushed to any shared environment.

```bash
# Local workflow
supabase start                  # Start local Supabase
supabase db reset               # Apply all migrations from scratch
supabase migration new <name>   # Create new migration
# Edit the migration SQL
supabase db reset               # Verify it applies cleanly
npm run test                    # Verify app still works
```

### 6.2 Use a Shadow Database

Supabase CLI supports a shadow database for diffing schema changes:

```bash
# Generate a migration from schema diff
supabase db diff --schema public --file <name>

# The shadow database applies all existing migrations
# then diffs against your local database to generate the migration
```

### 6.3 Migration Authoring Rules

- One logical change per migration file.
- Name migrations descriptively: `20240115_add_user_display_name.sql`, not `20240115_fix.sql`.
- Always include comments explaining WHY the change is being made.
- Never use `IF NOT EXISTS` to mask migration ordering issues.
- Always handle both directions if rollback support is needed.
- Test with realistic data volumes, not just empty tables.

### 6.4 CI Integration

```yaml
# In CI pipeline, verify migrations apply cleanly
- name: Test migrations
  run: |
    supabase start
    supabase db reset
    npm run test:db
    supabase stop
```

---

## 7. Post-Incident

### 7.1 Update SolutionIndex.md

```markdown
| SupabaseMigration-<YYYYMMDD> | [brief description] | Runbooks/SupabaseMigrationFailure.md | [date] |
```

### 7.2 Update This Runbook

If you encountered a failure mode not listed in Section 1, add it. If you discovered a useful diagnostic query, add it to Section 2.

### 7.3 Log to Memory

```markdown
## [Date] -- Migration Failure: [migration name]

- **Failure mode:** [which category from Section 1]
- **Root cause:** [what specifically went wrong]
- **Recovery strategy used:** [which strategy from Section 3]
- **Time to resolve:** [duration]
- **Prevention added:** [what stops recurrence]
```

---

## Quick Reference

```
IDENTIFY FAILURE MODE -> DIAGNOSE -> RECOVER -> VERIFY -> PREVENT -> DOCUMENT
```

**Remember:** Never reset production. Always backup first. Use expand-contract for breaking changes.
