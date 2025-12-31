#!/bin/bash
# SUPABASE PROJECT BACKUP AUTOMATION
# Part of the Engineering Brain Automation Framework
#
# Usage: ./supabase-backup.sh <project-name> <project-ref> <db-password>
# Example: ./supabase-backup.sh curriculum-pilot-mvp fhopjsgiwvquayyvadaw "your-password"

set -euo pipefail

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging functions
log_info() { echo -e "${BLUE}[INFO]${NC} $1"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $1"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $1"; }
log_error() { echo -e "${RED}[ERROR]${NC} $1"; }

# Validate arguments
if [ "$#" -lt 3 ]; then
    echo "Usage: $0 <project-name> <project-ref> <db-password> [source-project-path]"
    echo ""
    echo "Arguments:"
    echo "  project-name       : Human readable name (e.g., curriculum-pilot-mvp)"
    echo "  project-ref        : Supabase project reference (e.g., fhopjsgiwvquayyvadaw)"
    echo "  db-password        : Database password from Supabase dashboard"
    echo "  source-project-path: (Optional) Path to local project with migrations"
    echo ""
    echo "Example:"
    echo "  $0 curriculum-pilot-mvp fhopjsgiwvquayyvadaw 'mypassword123' ./DropFly-PROJECTS/Curriculum-pilot-mvp"
    exit 1
fi

PROJECT_NAME="$1"
PROJECT_REF="$2"
DB_PASSWORD="$3"
SOURCE_PROJECT="${4:-}"

# Configuration
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_ROOT="${HOME}/supabase-backups"
BACKUP_DIR="${BACKUP_ROOT}/${PROJECT_NAME}/${TIMESTAMP}"
DB_HOST="aws-0-us-east-1.pooler.supabase.com"
DB_PORT="6543"
DB_NAME="postgres"
DB_USER="postgres.${PROJECT_REF}"

# Create backup directory structure
log_info "Creating backup directory: ${BACKUP_DIR}"
mkdir -p "${BACKUP_DIR}/database"
mkdir -p "${BACKUP_DIR}/migrations"
mkdir -p "${BACKUP_DIR}/config"
mkdir -p "${BACKUP_DIR}/storage"

# Save backup metadata
log_info "Saving backup metadata..."
cat > "${BACKUP_DIR}/BACKUP_MANIFEST.md" << EOF
# Supabase Backup Manifest

## Project Information
- **Project Name**: ${PROJECT_NAME}
- **Project Ref**: ${PROJECT_REF}
- **Backup Date**: $(date)
- **Backup Timestamp**: ${TIMESTAMP}
- **Supabase URL**: https://${PROJECT_REF}.supabase.co

## Backup Contents
- \`database/\` - Full PostgreSQL dump
- \`migrations/\` - SQL migration files (if available)
- \`config/\` - Environment and configuration files
- \`storage/\` - Storage bucket inventory
- \`RESTORE.md\` - Restoration instructions

## Restore Instructions
See RESTORE.md for detailed restoration steps.
EOF

# Export database
log_info "Exporting database (this may take a moment)..."
export PGPASSWORD="${DB_PASSWORD}"

# Full database dump with all data
pg_dump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --no-owner \
    --no-acl \
    --verbose \
    2>"${BACKUP_DIR}/database/pg_dump.log" \
    > "${BACKUP_DIR}/database/full_backup.sql" || {
        log_error "Database export failed. Check ${BACKUP_DIR}/database/pg_dump.log"
        log_warn "Trying alternative connection method..."

        # Try direct connection (non-pooler)
        DB_HOST_DIRECT="db.${PROJECT_REF}.supabase.co"
        DB_PORT_DIRECT="5432"
        DB_USER_DIRECT="postgres"

        pg_dump \
            --host="${DB_HOST_DIRECT}" \
            --port="${DB_PORT_DIRECT}" \
            --username="${DB_USER_DIRECT}" \
            --dbname="${DB_NAME}" \
            --no-owner \
            --no-acl \
            2>"${BACKUP_DIR}/database/pg_dump_direct.log" \
            > "${BACKUP_DIR}/database/full_backup.sql" || {
                log_error "Both connection methods failed."
                exit 1
            }
    }

# Schema-only dump (for reference)
log_info "Exporting schema-only backup..."
pg_dump \
    --host="${DB_HOST}" \
    --port="${DB_PORT}" \
    --username="${DB_USER}" \
    --dbname="${DB_NAME}" \
    --schema-only \
    --no-owner \
    --no-acl \
    2>/dev/null \
    > "${BACKUP_DIR}/database/schema_only.sql" || log_warn "Schema-only export failed, continuing..."

unset PGPASSWORD

log_success "Database exported successfully"

# Copy migrations if source project provided
if [ -n "${SOURCE_PROJECT}" ] && [ -d "${SOURCE_PROJECT}/supabase/migrations" ]; then
    log_info "Copying migrations from ${SOURCE_PROJECT}..."
    cp -r "${SOURCE_PROJECT}/supabase/migrations/"* "${BACKUP_DIR}/migrations/" 2>/dev/null || log_warn "No migrations found"
    log_success "Migrations copied"
elif [ -n "${SOURCE_PROJECT}" ]; then
    log_warn "No migrations folder found at ${SOURCE_PROJECT}/supabase/migrations"
fi

# Save environment template (without secrets)
if [ -n "${SOURCE_PROJECT}" ] && [ -f "${SOURCE_PROJECT}/.env.local" ]; then
    log_info "Creating sanitized environment template..."
    # Copy and redact secrets
    sed -E 's/(KEY=|SECRET=|PASSWORD=)[^[:space:]]*/\1REDACTED/g' \
        "${SOURCE_PROJECT}/.env.local" > "${BACKUP_DIR}/config/env.template"

    # Also save the Supabase URL for reference
    grep "SUPABASE_URL" "${SOURCE_PROJECT}/.env.local" > "${BACKUP_DIR}/config/supabase_url.txt" 2>/dev/null || true
    log_success "Environment template saved (secrets redacted)"
fi

# Get storage bucket information via Supabase CLI if available
if command -v supabase &> /dev/null; then
    log_info "Fetching storage bucket information..."
    # This requires being linked to the project
    echo "# Storage Buckets" > "${BACKUP_DIR}/storage/BUCKETS.md"
    echo "## Note" >> "${BACKUP_DIR}/storage/BUCKETS.md"
    echo "Storage bucket files must be downloaded manually from the Supabase dashboard." >> "${BACKUP_DIR}/storage/BUCKETS.md"
    echo "" >> "${BACKUP_DIR}/storage/BUCKETS.md"
    echo "Dashboard URL: https://supabase.com/dashboard/project/${PROJECT_REF}/storage/buckets" >> "${BACKUP_DIR}/storage/BUCKETS.md"
else
    log_warn "Supabase CLI not found - storage bucket info skipped"
fi

# Create restore instructions
log_info "Creating restore instructions..."
cat > "${BACKUP_DIR}/RESTORE.md" << EOF
# Restore Instructions for ${PROJECT_NAME}

## Prerequisites
- Supabase CLI installed (\`brew install supabase/tap/supabase\`)
- PostgreSQL client (\`psql\`)
- Access to create new Supabase projects

## Step 1: Create New Supabase Project
1. Go to https://supabase.com/dashboard
2. Click "New Project"
3. Note down:
   - New Project Ref (e.g., \`abcdefghijkl\`)
   - Database Password

## Step 2: Get Connection String
From your new project dashboard:
- Go to Settings > Database
- Copy the "Connection string (URI)"

## Step 3: Restore Database

### Option A: Full Restore (Recommended)
\`\`\`bash
# Replace with your new project's connection string
psql "postgresql://postgres.[NEW-PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres" < database/full_backup.sql
\`\`\`

### Option B: Schema Only + Migrations
\`\`\`bash
# First apply schema
psql "CONNECTION_STRING" < database/schema_only.sql

# Then apply migrations in order
cd migrations
for file in *.sql; do
    psql "CONNECTION_STRING" < "\$file"
done
\`\`\`

## Step 4: Update Environment Variables
1. Copy \`config/env.template\` to your new project as \`.env.local\`
2. Update:
   - \`NEXT_PUBLIC_SUPABASE_URL\` with new project URL
   - \`NEXT_PUBLIC_SUPABASE_ANON_KEY\` from new project settings
   - \`SUPABASE_SERVICE_ROLE_KEY\` from new project settings
   - Any other API keys

## Step 5: Restore Storage (Manual)
1. Download files from old project backup or original project
2. Upload to new project via Supabase dashboard or CLI

## Step 6: Verify
\`\`\`bash
# Test connection
psql "CONNECTION_STRING" -c "SELECT COUNT(*) FROM information_schema.tables;"

# Run your application
npm run dev
\`\`\`

## Original Project Details
- **Project Ref**: ${PROJECT_REF}
- **Backup Date**: $(date)
- **Supabase URL**: https://${PROJECT_REF}.supabase.co

## Troubleshooting
If restore fails:
1. Check PostgreSQL version compatibility
2. Ensure all extensions are enabled in new project
3. Try schema-only restore first, then data

For RLS (Row Level Security) issues:
\`\`\`sql
-- Temporarily disable RLS to restore data
ALTER TABLE your_table DISABLE ROW LEVEL SECURITY;
-- After restore, re-enable
ALTER TABLE your_table ENABLE ROW LEVEL SECURITY;
\`\`\`
EOF

# Create quick restore script
cat > "${BACKUP_DIR}/restore.sh" << 'RESTORE_SCRIPT'
#!/bin/bash
# Quick Restore Script
# Usage: ./restore.sh <new-connection-string>

if [ -z "$1" ]; then
    echo "Usage: $0 <postgresql-connection-string>"
    echo "Example: $0 'postgresql://postgres.newref:password@aws-0-us-east-1.pooler.supabase.com:6543/postgres'"
    exit 1
fi

CONNECTION_STRING="$1"

echo "Restoring database from backup..."
psql "${CONNECTION_STRING}" < database/full_backup.sql

if [ $? -eq 0 ]; then
    echo "✅ Database restored successfully!"
else
    echo "❌ Restore failed. Check connection string and try again."
    exit 1
fi
RESTORE_SCRIPT
chmod +x "${BACKUP_DIR}/restore.sh"

# Calculate backup size
BACKUP_SIZE=$(du -sh "${BACKUP_DIR}" | cut -f1)

# Summary
log_success "=========================================="
log_success "BACKUP COMPLETE"
log_success "=========================================="
echo ""
echo "Project: ${PROJECT_NAME}"
echo "Location: ${BACKUP_DIR}"
echo "Size: ${BACKUP_SIZE}"
echo ""
echo "Contents:"
ls -la "${BACKUP_DIR}"
echo ""
log_info "To restore, see: ${BACKUP_DIR}/RESTORE.md"
log_info "Quick restore: ${BACKUP_DIR}/restore.sh <connection-string>"
