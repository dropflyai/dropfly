#!/usr/bin/env bash
# LOG EXPERIENCE - Engineering Brain Memory System
# Quick CLI tool for logging completed tasks to local SQLite database

set -e

# Database path
DB_PATH="$(dirname "$0")/brain-memory.db"

# Check if database exists
if [ ! -f "$DB_PATH" ]; then
  echo "Error: Database not found at $DB_PATH"
  echo "Run sqlite3 $DB_PATH < sqlite-migration-simple.sql to initialize"
  exit 1
fi

# Interactive prompts
echo "=== Engineering Brain - Log Experience ==="
echo

read -p "Task Title: " TASK_TITLE
read -p "Product Target (WEB_APP/WEB_SAAS/MOBILE_IOS/API_SERVICE/etc): " PRODUCT_TARGET
read -p "Execution Gear (EXPLORE/BUILD/SHIP/HOTFIX) [BUILD]: " EXECUTION_GEAR
EXECUTION_GEAR=${EXECUTION_GEAR:-BUILD}
read -p "Engineering Mode (APP/API/AGENTIC/LIB) [APP]: " ENGINEERING_MODE
ENGINEERING_MODE=${ENGINEERING_MODE:-APP}
read -p "Artifact Type (Component/Fragment/Script/Test) [optional]: " ARTIFACT_TYPE

echo
echo "--- Problem ---"
read -p "What was the challenge or requirement? " PROBLEM

echo
echo "--- Solution ---"
read -p "What worked and was shipped? " SOLUTION

echo
echo "--- Why It Worked ---"
read -p "Root cause insight or explanation: " WHY_IT_WORKED

echo
echo "--- Pattern Observed (optional) ---"
read -p "Generalizable lesson that applies beyond this task: " PATTERN_OBSERVED

echo
echo "--- Would Do Differently (optional) ---"
read -p "Retrospective - what could have been done better? " WOULD_DO_DIFFERENTLY

echo
read -p "Time Spent (minutes): " TIME_SPENT

# Insert into database
sqlite3 "$DB_PATH" <<SQL
INSERT INTO experience_log (
  task_title,
  product_target,
  execution_gear,
  engineering_mode,
  artifact_type,
  problem,
  solution,
  why_it_worked,
  pattern_observed,
  would_do_differently,
  time_spent_minutes,
  project_id
) VALUES (
  '$(echo "$TASK_TITLE" | sed "s/'/''/g")',
  '$(echo "$PRODUCT_TARGET" | sed "s/'/''/g")',
  '$(echo "$EXECUTION_GEAR" | sed "s/'/''/g")',
  '$(echo "$ENGINEERING_MODE" | sed "s/'/''/g")',
  $([ -n "$ARTIFACT_TYPE" ] && echo "'$(echo "$ARTIFACT_TYPE" | sed "s/'/''/g")'" || echo "NULL"),
  '$(echo "$PROBLEM" | sed "s/'/''/g")',
  '$(echo "$SOLUTION" | sed "s/'/''/g")',
  '$(echo "$WHY_IT_WORKED" | sed "s/'/''/g")',
  $([ -n "$PATTERN_OBSERVED" ] && echo "'$(echo "$PATTERN_OBSERVED" | sed "s/'/''/g")'" || echo "NULL"),
  $([ -n "$WOULD_DO_DIFFERENTLY" ] && echo "'$(echo "$WOULD_DO_DIFFERENTLY" | sed "s/'/''/g")'" || echo "NULL"),
  $TIME_SPENT,
  'engineering-brain'
);
SQL

echo
echo "✅ Experience logged successfully!"
echo
echo "To view recent experiences:"
echo "  sqlite3 $DB_PATH 'SELECT * FROM recent_experiences LIMIT 5;'"
echo
echo "To search for similar tasks:"
echo "  sqlite3 $DB_PATH \"SELECT task_title, solution FROM experience_log WHERE task_title LIKE '%keyword%';\""
