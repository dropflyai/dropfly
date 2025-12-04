#!/usr/bin/env python3
"""
Automated Supabase Migration Script
Executes SQL migrations via Supabase RPC function

Usage:
    python3 run-migration.py <project_name> <sql_file_or_sql_string>

Example:
    python3 run-migration.py TradeFly migration.sql
    python3 run-migration.py TradeFly "ALTER TABLE users ADD COLUMN age INT;"
"""

import os
import sys

def run_migration(sql: str, project_name: str):
    """Execute a SQL migration on Supabase"""

    # Try to import supabase, install if needed
    try:
        from supabase import create_client, Client
    except ImportError:
        print("📦 Installing supabase client...")
        os.system("pip3 install supabase -q")
        from supabase import create_client, Client

    # Find project .env file
    project_paths = [
        f"/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/{project_name}/.env",
        f"/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/{project_name}-Backend/.env",
        f"/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS/{project_name}-iOS/.env",
    ]

    env_file = None
    for path in project_paths:
        if os.path.exists(path):
            env_file = path
            break

    if not env_file:
        print(f"❌ Could not find .env file for project: {project_name}")
        print(f"   Searched in:")
        for path in project_paths:
            print(f"   - {path}")
        sys.exit(1)

    print(f"📁 Using .env file: {env_file}")

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
    print(f"📝 SQL Preview: {sql[:100]}{'...' if len(sql) > 100 else ''}")

    try:
        result = supabase.rpc('exec_sql', {'query': sql}).execute()

        if result.data and result.data.get('success'):
            print("✅ Migration executed successfully!")
            return True
        else:
            error = result.data.get('error') if result.data else 'Unknown error'
            print(f"❌ Migration failed: {error}")
            print("\n💡 If error is 'Could not find the function public.exec_sql':")
            print("   You need to run the one-time setup SQL in Supabase dashboard.")
            print(f"   See: /Users/rioallen/Documents/DropFly-OS-App-Builder/SUPABASE-AUTOMATED-MIGRATIONS-SOLUTION.md")
            return False

    except Exception as e:
        error_msg = str(e)
        print(f"❌ Error executing migration: {error_msg}")

        if 'exec_sql' in error_msg and 'not found' in error_msg:
            print("\n💡 The exec_sql helper function is not set up in Supabase.")
            print("   Run this SQL in your Supabase SQL Editor (ONE TIME SETUP):")
            print("\n" + "="*60)
            print("""
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

REVOKE ALL ON FUNCTION exec_sql(text) FROM PUBLIC;
REVOKE ALL ON FUNCTION exec_sql(text) FROM anon;
REVOKE ALL ON FUNCTION exec_sql(text) FROM authenticated;
GRANT EXECUTE ON FUNCTION exec_sql(text) TO service_role;
            """)
            print("="*60)
            print(f"\nThen open: {url.replace('https://', 'https://supabase.com/dashboard/project/').replace('.supabase.co', '')}/sql/new")

        return False

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python3 run-migration.py <project_name> <sql_file_or_sql>")
        print("\nExamples:")
        print('  python3 run-migration.py TradeFly migration.sql')
        print('  python3 run-migration.py TradeFly "ALTER TABLE users ADD COLUMN age INT;"')
        sys.exit(1)

    project_name = sys.argv[1]
    sql_input = sys.argv[2]

    # Check if it's a file or raw SQL
    if os.path.exists(sql_input):
        print(f"📄 Reading SQL from file: {sql_input}")
        with open(sql_input) as f:
            sql = f.read()
    else:
        print("📝 Using inline SQL")
        sql = sql_input

    success = run_migration(sql, project_name)
    sys.exit(0 if success else 1)
