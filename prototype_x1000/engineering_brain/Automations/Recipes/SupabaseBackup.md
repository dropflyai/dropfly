# SUPABASE BACKUP AUTOMATION
**Executable Project Backup and Restoration**

---

## Purpose

This document defines the **automation for backing up and restoring Supabase projects**.

Use this when:
- Archiving projects before deletion
- Creating disaster recovery snapshots
- Migrating projects between accounts
- Reducing costs by pausing unused projects

---

## Preconditions

Before running Supabase backup automation:

- PostgreSQL client installed (`psql`, `pg_dump`)
- Supabase CLI installed (optional, for storage info)
- Database password available from Supabase Dashboard
- Project ref ID known (from project URL)

If any precondition fails, stop and fix it first.

---

## Finding Project Credentials

### Project Ref
From URL: `https://supabase.com/dashboard/project/[PROJECT-REF]`
Or from `.env.local`: Look at `NEXT_PUBLIC_SUPABASE_URL`

### Database Password
1. Go to Supabase Dashboard
2. Select your project
3. Settings > Database
4. Copy the database password (or reset if forgotten)

---

## Standard Backup Workflow

### 1. Run Backup Script

```bash
./engineering_brain/Automations/scripts/supabase-backup.sh \
    <project-name> \
    <project-ref> \
    "<db-password>" \
    [source-project-path]
```

**Example:**
```bash
./engineering_brain/Automations/scripts/supabase-backup.sh \
    curriculum-pilot-mvp \
    fhopjsgiwvquayyvadaw \
    "your-db-password" \
    ./DropFly-PROJECTS/Curriculum-pilot-mvp
```

### 2. Verify Backup

Check the backup directory:
```bash
ls -la ~/supabase-backups/<project-name>/<timestamp>/
```

Required files:
- `database/full_backup.sql` - Complete database dump
- `database/schema_only.sql` - Schema structure
- `migrations/` - SQL migration files
- `BACKUP_MANIFEST.md` - Backup metadata
- `RESTORE.md` - Restoration instructions
- `restore.sh` - Quick restore script

### 3. Validate Backup Integrity

```bash
# Check SQL file is not empty
wc -l ~/supabase-backups/<project-name>/<timestamp>/database/full_backup.sql

# Should show several hundred to thousands of lines
```

---

## Restoration Workflow

### 1. Create New Supabase Project

1. Go to https://supabase.com/dashboard
2. Create new project
3. Note the new project ref and password

### 2. Restore Database

```bash
cd ~/supabase-backups/<project-name>/<timestamp>

# Using the quick restore script
./restore.sh "postgresql://postgres.[NEW-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres"
```

### 3. Update Application Config

Update `.env.local` with new credentials:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

---

## Backup Storage

All backups are stored in:
```
~/supabase-backups/
  └── <project-name>/
      └── <timestamp>/
          ├── database/
          ├── migrations/
          ├── config/
          ├── storage/
          ├── BACKUP_MANIFEST.md
          ├── RESTORE.md
          └── restore.sh
```

### Retention Policy

Recommended:
- Keep at least 2 recent backups per project
- Archive critical backups to cloud storage (S3, GCS, etc.)
- Delete backups older than 90 days for non-critical projects

---

## Deleting After Backup

Only delete a Supabase project after:

1. Backup script completed successfully
2. Backup files verified (non-zero size)
3. Backup tested on a fresh project (for critical data)
4. Backup copied to secondary location (optional but recommended)

### Safe Deletion Checklist

- [ ] Backup completed without errors
- [ ] `full_backup.sql` exists and is > 0 bytes
- [ ] Schema dump exists
- [ ] Migrations copied (if applicable)
- [ ] RESTORE.md reviewed
- [ ] Backup location noted

---

## Failure Handling

If backup fails:

1. Check database password is correct
2. Verify project ref is correct
3. Ensure project is not paused
4. Check network connectivity
5. Try direct connection vs pooler connection

Common errors:
- `connection refused` - Project may be paused
- `authentication failed` - Wrong password or user
- `permission denied` - Check database user permissions

---

## References

- Engineering/Automations/Recipes/Supabase.md
- Engineering/Solutions/Recipes/Supabase.md
- Engineering/Solutions/ToolAuthority.md

---

**This automation recipe is recommended before any project deletion.**
