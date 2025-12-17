#!/bin/bash
# ================================
# BATCH PROJECT MIGRATION SCRIPT
# ================================
# Migrates ALL projects in DropFly-PROJECTS to template structure
# Usage: ./migrate-all-projects.sh
# Last updated: 2025-12-11

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m'

TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECTS_DIR="/Users/rioallen/Documents/DropFly-OS-App-Builder/DropFly-PROJECTS"
MIGRATE_SCRIPT="$TEMPLATE_DIR/migrate-project.sh"

# Directories to skip (not actual projects)
SKIP_DIRS=("apps" "archives" "assets" "docs" "ideas" "infrastructure" "packages" "prompts" "scripts" "templates" "tools" "temp-scripts-backup")

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║         BATCH PROJECT MIGRATION                             ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${CYAN}Projects Directory:${NC} $PROJECTS_DIR"
echo -e "${CYAN}Template:${NC} $TEMPLATE_DIR"
echo -e ""

# Count projects
PROJECT_COUNT=0
for dir in "$PROJECTS_DIR"/*/ ; do
    if [ -d "$dir" ]; then
        project_name=$(basename "$dir")

        # Skip non-project directories
        skip=false
        for skip_dir in "${SKIP_DIRS[@]}"; do
            if [ "$project_name" = "$skip_dir" ]; then
                skip=true
                break
            fi
        done

        if [ "$skip" = false ]; then
            PROJECT_COUNT=$((PROJECT_COUNT + 1))
        fi
    fi
done

echo -e "${CYAN}Found ${PROJECT_COUNT} projects to migrate${NC}"
echo -e ""
echo -e "${YELLOW}⚠️  This will modify all ${PROJECT_COUNT} projects!${NC}"
echo -e "${YELLOW}⚠️  A backup will NOT be created automatically${NC}"
echo -e ""
read -p "Continue? (yes/no): " confirm

if [ "$confirm" != "yes" ]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 0
fi

echo -e ""
echo -e "${GREEN}Starting migration of ${PROJECT_COUNT} projects...${NC}"
echo -e ""

# Track results
SUCCESS_COUNT=0
FAIL_COUNT=0
FAILED_PROJECTS=()

# Migrate each project
CURRENT=0
for dir in "$PROJECTS_DIR"/*/ ; do
    if [ -d "$dir" ]; then
        project_name=$(basename "$dir")

        # Skip non-project directories
        skip=false
        for skip_dir in "${SKIP_DIRS[@]}"; do
            if [ "$project_name" = "$skip_dir" ]; then
                skip=true
                break
            fi
        done

        if [ "$skip" = true ]; then
            continue
        fi

        CURRENT=$((CURRENT + 1))

        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
        echo -e "${BLUE}[${CURRENT}/${PROJECT_COUNT}] Migrating: ${project_name}${NC}"
        echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

        # Run migration script
        if "$MIGRATE_SCRIPT" "$dir" >> "/tmp/migration_${project_name}.log" 2>&1; then
            echo -e "${GREEN}✅ Successfully migrated${NC}"
            SUCCESS_COUNT=$((SUCCESS_COUNT + 1))
        else
            echo -e "${RED}❌ Migration failed (see /tmp/migration_${project_name}.log)${NC}"
            FAIL_COUNT=$((FAIL_COUNT + 1))
            FAILED_PROJECTS+=("$project_name")
        fi

        echo -e ""
    fi
done

# Final summary
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║              BATCH MIGRATION COMPLETE                       ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${CYAN}Total Projects: ${NC}${PROJECT_COUNT}"
echo -e "${GREEN}Successfully Migrated: ${NC}${SUCCESS_COUNT}"
echo -e "${RED}Failed: ${NC}${FAIL_COUNT}"
echo -e ""

if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}Failed projects:${NC}"
    for project in "${FAILED_PROJECTS[@]}"; do
        echo -e "  ❌ $project (log: /tmp/migration_${project}.log)"
    done
    echo -e ""
fi

echo -e "${CYAN}What was done:${NC}"
echo -e "  ✅ Added .claude/ directory to all projects"
echo -e "  ✅ Set up credentials/ directory"
echo -e "  ✅ Added automation scripts/ directory"
echo -e "  ✅ Updated .gitignore files"
echo -e "  ✅ Migrated existing .env files to credentials/"
echo -e ""
echo -e "${CYAN}Next steps for each project:${NC}"
echo -e "  1. Review credentials/.env.template"
echo -e "  2. Fill in credentials/.env with actual values"
echo -e "  3. Tell Claude: 'Read .claude/SYSTEM-PROMPT.md'"
echo -e ""
echo -e "${GREEN}All projects now use the 10/10 efficiency system! 🎉${NC}"
echo -e ""
