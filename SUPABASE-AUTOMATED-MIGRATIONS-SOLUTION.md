# Supabase Automated Migrations - Permanent Solution

## Problem
Claude cannot directly execute SQL migrations on Supabase databases because:
1. Direct PostgreSQL port (5432) access is disabled by default in Supabase for security
2. Supabase REST API doesn't allow arbitrary SQL execution
3. Only the web dashboard SQL editor has full DDL/DML permissions

## Solution: One-Time Setup for Automated Migrations

### Step 1: Create Helper RPC Function (ONE TIME SETUP)

Run this SQL **ONCE** in Supabase SQL Editor to enable automated migrations:

```sql
-- Create a function that can execute arbitrary SQL
-- IMPORTANT: Only accessible with service_role key for security
CREATE OR REPLACE FUNCTION exec_sql(query text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  result json;
BEGIN
  EXECUTE query;
  RETURN json_build_object('success', true, 'message', 'Query executed successfully');
EXCEPTION WHEN OTHERS THEN
  RETURN json_build_object('success', false, 'error', SQLERRM);
END;
$$;

-- Ensure only service_role can call this function
REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_sql(text) FROM anon;
REVOKE ALL ON FUNCTION exec_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
```

### Step 2: Automated Migration Script

Once the helper function is created, Claude can run migrations automatically using this Python script:

```python
#!/usr/bin/env python3
"""
Automated Supabase Migration Script
Location: /Users/rioallen/Documents/DropFly-OS-App-Builder/run-migration.py
"""

import os
import sys
from supabase import create_client, Client

def run_migration(sql: str, project_name: str):
    """
    Execute a SQL migration on Supabase

    Args:
        sql: The SQL to execute
        project_name: Name of the project (for finding .env file)
    """
    # Find project .env file
    project_paths = [
        f"/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/{project_name}/.env",
        f"/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/{project_name}-Backend/.env",
    ]

    env_file = None
    for path in project_paths:
        if os.path.exists(path):
            env_file = path
            break

    if not env_file:
        print(f"❌ Could not find .env file for project: {project_name}")
        sys.exit(1)

    # Load environment variables
    env_vars = {}
    with open(env_file) as f:
        for line in f:
            line = line.strip()
            if line and not line.startswith('#') and '=' in line:
                key, value = line.split('=', 1)
                env_vars[key] = value

    url = env_vars.get('SUPABASE_URL')
    service_key = env_vars.get('SUPABASE_SERVICE_KEY')

    if not url or not service_key:
        print("❌ SUPABASE_URL or SUPABASE_SERVICE_KEY not found in .env")
        sys.exit(1)

    # Connect to Supabase
    print(f"📡 Connecting to Supabase: {url}")
    supabase: Client = create_client(url, service_key)

    # Execute SQL via RPC function
    print("🔄 Executing migration...")
    try:
        result = supabase.rpc('exec_sql', {'query': sql}).execute()

        if result.data and result.data.get('success'):
            print("✅ Migration executed successfully!")
            return True
        else:
            error = result.data.get('error') if result.data else 'Unknown error'
            print(f"❌ Migration failed: {error}")
            return False

    except Exception as e:
        print(f"❌ Error executing migration: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 run-migration.py <project_name> <sql_file>")
        print("Example: python3 run-migration.py TradeFly migration.sql")
        sys.exit(1)

    project_name = sys.argv[1]
    sql_file = sys.argv[2]

    if not os.path.exists(sql_file):
        print(f"❌ SQL file not found: {sql_file}")
        sys.exit(1)

    with open(sql_file) as f:
        sql = f.read()

    success = run_migration(sql, project_name)
    sys.exit(0 if success else 1)
```

### Step 3: Usage

#### For Claude:
```python
# In TradeFly-Backend directory
python3 /Users/rioallen/Documents/DropFly-OS-App-Builder/run-migration.py TradeFly migration.sql
```

#### For Manual Use:
```bash
cd /Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/TradeFly-Backend
python3 ../../run-migration.py TradeFly my-migration.sql
```

## Project Structure Requirements

**HARD RULE**: All project configuration must be in the project folder:

```
DropFly-PROJECTS/
├── ProjectName/
│   ├── .env              # All API keys, service keys, passwords here
│   └── migrations/       # Optional: SQL migration files
└── ProjectName-Backend/
    ├── .env              # Backend configuration
    └── migrations/       # Backend migrations
```

**DO NOT** store project-specific .env files in:
- `/Users/rioallen/Documents/DropFly-OS-App-Builder/.env.local` (root level)
- Any parent directories
- Shared locations

Each project must be self-contained.

## When Setup Is Required

You need to create the `exec_sql` function for each new Supabase project. This is a one-time setup per Supabase instance.

### To Check if Setup Is Complete:
```python
from supabase import create_client
supabase = create_client(url, service_key)
result = supabase.rpc('exec_sql', {'query': 'SELECT 1'}).execute()
# If this works, setup is complete
```

## Security Notes

1. The `exec_sql` function is only accessible with the `service_role` key
2. Never expose the `service_role` key in client-side code
3. Store `service_role` keys only in server-side `.env` files
4. The function uses `SECURITY DEFINER` to run with elevated privileges

## Troubleshooting

### Error: "Could not find the function public.exec_sql"
**Solution**: Run Step 1 setup SQL in Supabase dashboard

### Error: "Direct PostgreSQL connection failed"
**Solution**: This is expected - Supabase blocks direct PostgreSQL access. Use the RPC method instead.

### Error: "SUPABASE_SERVICE_KEY not found"
**Solution**: Ensure `.env` file is in the correct project directory with the service role key

## Alternative: Manual Migration (Fallback)

If automated migration fails, use this fallback:

1. Open: https://supabase.com/dashboard/project/{PROJECT_REF}/sql/new
2. Paste SQL
3. Click "Run"

This always works but requires manual intervention.

---

**Last Updated**: 2025-12-03
**Author**: Claude (Automated Migration Solution)
