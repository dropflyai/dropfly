#!/bin/bash
# UNIFIED BRAIN MEMORY MIGRATION RUNNER
# Executes the migration SQL via Supabase SQL Editor or CLI

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CREDENTIALS_DIR="$SCRIPT_DIR/credentials"
MIGRATION_FILE="$SCRIPT_DIR/unified-brain-memory-migration.sql"

echo "=== UNIFIED BRAIN MEMORY MIGRATION ==="
echo ""

# Check if migration file exists
if [ ! -f "$MIGRATION_FILE" ]; then
    echo "❌ Migration file not found: $MIGRATION_FILE"
    exit 1
fi

# Check for .env file
if [ -f "$CREDENTIALS_DIR/.env" ]; then
    echo "📁 Loading credentials from $CREDENTIALS_DIR/.env"
    export $(grep -v '^#' "$CREDENTIALS_DIR/.env" | xargs)
fi

# Check required variables
if [ -z "$SUPABASE_URL" ] || [ -z "$SUPABASE_SERVICE_KEY" ]; then
    echo ""
    echo "❌ Supabase credentials not found!"
    echo ""
    echo "SETUP REQUIRED:"
    echo ""
    echo "1. Create Supabase project at https://supabase.com/dashboard"
    echo "   - Project name: ai-brains-memory"
    echo "   - Region: Choose closest to you"
    echo ""
    echo "2. Copy credentials template:"
    echo "   cp $CREDENTIALS_DIR/.env.template $CREDENTIALS_DIR/.env"
    echo ""
    echo "3. Fill in your credentials from Supabase Dashboard > Settings > API"
    echo ""
    echo "4. Run this script again"
    echo ""
    echo "ALTERNATIVE: Run SQL directly in Supabase SQL Editor"
    echo "   - Go to: https://supabase.com/dashboard/project/YOUR_PROJECT/sql"
    echo "   - Paste contents of: $MIGRATION_FILE"
    echo "   - Click 'Run'"
    echo ""
    exit 1
fi

echo "📡 Connecting to: $SUPABASE_URL"
echo "📄 Migration file: $MIGRATION_FILE"
echo ""

# Check if psql is available for direct execution
if command -v psql &> /dev/null; then
    # Extract project ID from URL
    PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')
    DB_HOST="db.$PROJECT_ID.supabase.co"

    echo "🔄 Running migration via psql..."
    PGPASSWORD="${SUPABASE_DB_PASSWORD:-$SUPABASE_SERVICE_KEY}" psql \
        -h "$DB_HOST" \
        -U postgres \
        -d postgres \
        -f "$MIGRATION_FILE" \
        2>&1

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Migration completed successfully!"
        echo ""
        echo "NEXT STEPS:"
        echo "1. Verify tables in Supabase Dashboard > Table Editor"
        echo "2. Check: shared_experiences, shared_patterns, shared_failures"
        echo "3. Update brain configurations to use the new tables"
    else
        echo ""
        echo "❌ Migration failed via psql"
        echo ""
        echo "Try running manually in Supabase SQL Editor:"
        echo "   https://supabase.com/dashboard/project/$PROJECT_ID/sql"
    fi
else
    echo "⚠️  psql not found. Cannot run migration directly."
    echo ""
    echo "Options:"
    echo ""
    echo "1. Install psql (PostgreSQL client):"
    echo "   brew install postgresql"
    echo ""
    echo "2. Run SQL in Supabase Dashboard:"
    # Extract project ID
    PROJECT_ID=$(echo $SUPABASE_URL | sed 's/https:\/\/\([^.]*\).*/\1/')
    echo "   URL: https://supabase.com/dashboard/project/$PROJECT_ID/sql/new"
    echo "   File: $MIGRATION_FILE"
    echo ""
    echo "3. Use Supabase CLI:"
    echo "   supabase db push --db-url postgresql://postgres:[PASSWORD]@db.$PROJECT_ID.supabase.co:5432/postgres"
    echo ""
fi
