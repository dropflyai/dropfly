#!/usr/bin/env bash

# Workspace Health Check Script
# Runs weekly to detect organization issues before they become problems
# Based on File Management Protocol v3.0

set -e

ROOT="/Users/rioallen/Documents/DropFly-OS-App-Builder"
PROJECTS_DIR="$ROOT/DropFly-PROJECTS"
DOCUMENTS_DIR="/Users/rioallen/Documents"

# Colors
RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

ISSUES_FOUND=0
WARNINGS_FOUND=0

echo "========================================"
echo "  WORKSPACE HEALTH CHECK"
echo "  $(date '+%Y-%m-%d %H:%M:%S')"
echo "========================================"
echo ""

# -----------------------------------------------------------------------------
# CHECK 1: Files at root level (should be minimal)
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 1] Root Level Files${NC}"

ALLOWED_ROOT_FILES=(
  "CLAUDE.md"
  "PROJECT-REGISTRY.md"
  ".gitignore"
  ".gitignore.backup"
  ".DS_Store"
)

ALLOWED_ROOT_DIRS=(
  ".git"
  ".github"
  ".claude"
  ".ideas"
  ".logs"
  ".troubleshoot"
  ".vercel"
  ".vscode"
  "archive"
  "career"
  "CRITICAL-RESOURCES"
  "docs"
  "DropFly-PROJECTS"
  "PROJECT-TEMPLATE"
  "prototype_x1000"
  "scripts"
  "test-results"
  "tests"
)

# Check for unexpected files at root
for item in "$ROOT"/*; do
  basename=$(basename "$item")

  if [[ -f "$item" ]]; then
    if [[ ! " ${ALLOWED_ROOT_FILES[@]} " =~ " ${basename} " ]]; then
      echo -e "${RED}  [ISSUE] Unexpected file at root: $basename${NC}"
      ((ISSUES_FOUND++))
    fi
  elif [[ -d "$item" ]]; then
    if [[ ! " ${ALLOWED_ROOT_DIRS[@]} " =~ " ${basename} " ]]; then
      echo -e "${RED}  [ISSUE] Unexpected folder at root: $basename${NC}"
      ((ISSUES_FOUND++))
    fi
  fi
done

if [[ $ISSUES_FOUND -eq 0 ]]; then
  echo -e "${GREEN}  [OK] Root level is clean${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 2: Projects missing credentials/KEYS.md
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 2] Projects Missing KEYS.md${NC}"

MISSING_KEYS=0
for project in "$PROJECTS_DIR"/*/; do
  project_name=$(basename "$project")

  # Skip non-project folders
  if [[ "$project_name" == "apps" || "$project_name" == "assets" || \
        "$project_name" == "docs" || "$project_name" == "ideas" || \
        "$project_name" == "infrastructure" || "$project_name" == "packages" || \
        "$project_name" == "prompts" || "$project_name" == "scripts" || \
        "$project_name" == "templates" || "$project_name" == "tools" ]]; then
    continue
  fi

  # Check if project has any .env files or API usage (likely needs KEYS.md)
  if [[ -d "$project" ]]; then
    has_env=$(find "$project" -name ".env*" -type f 2>/dev/null | head -1)
    has_package=$(find "$project" -name "package.json" -type f -maxdepth 1 2>/dev/null | head -1)

    if [[ -n "$has_env" || -n "$has_package" ]]; then
      if [[ ! -f "$project/credentials/KEYS.md" ]]; then
        echo -e "${YELLOW}  [WARNING] Missing KEYS.md: $project_name${NC}"
        ((WARNINGS_FOUND++))
        ((MISSING_KEYS++))
      fi
    fi
  fi
done

if [[ $MISSING_KEYS -eq 0 ]]; then
  echo -e "${GREEN}  [OK] All active projects have KEYS.md${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 3: Duplicate folder names
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 3] Duplicate Folder Names${NC}"

# Get all folder names in projects
DUPLICATES=0

for project in "$PROJECTS_DIR"/*/; do
  project_name=$(basename "$project")

  # Skip shared folders that intentionally exist in both places
  if [[ "$project_name" == "docs" || "$project_name" == "scripts" || \
        "$project_name" == "packages" || "$project_name" == "templates" ]]; then
    continue
  fi

  # Check if same name exists at root or in prototype_x1000
  if [[ -d "$ROOT/$project_name" ]]; then
    echo -e "${RED}  [ISSUE] Duplicate: '$project_name' exists at root AND in DropFly-PROJECTS${NC}"
    ((ISSUES_FOUND++))
    ((DUPLICATES++))
  fi

  if [[ -d "$ROOT/prototype_x1000/$project_name" ]]; then
    echo -e "${RED}  [ISSUE] Duplicate: '$project_name' exists in prototype_x1000 AND DropFly-PROJECTS${NC}"
    ((ISSUES_FOUND++))
    ((DUPLICATES++))
  fi
done

# Check for brain duplicates at root
for brain in "$ROOT/prototype_x1000"/*_brain/; do
  brain_name=$(basename "$brain")
  if [[ -d "$ROOT/$brain_name" ]]; then
    echo -e "${RED}  [ISSUE] Duplicate brain: '$brain_name' exists at root${NC}"
    ((ISSUES_FOUND++))
    ((DUPLICATES++))
  fi
done

if [[ $DUPLICATES -eq 0 ]]; then
  echo -e "${GREEN}  [OK] No duplicate folders found${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 4: .env files outside credentials/ folders
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 4] Misplaced .env Files${NC}"

MISPLACED_ENV=0
for project in "$PROJECTS_DIR"/*/; do
  project_name=$(basename "$project")

  # Find .env files not in credentials folder
  while IFS= read -r env_file; do
    if [[ -n "$env_file" ]]; then
      # Check if it's in credentials folder
      if [[ ! "$env_file" =~ /credentials/ ]]; then
        echo -e "${YELLOW}  [WARNING] .env outside credentials/: $env_file${NC}"
        ((WARNINGS_FOUND++))
        ((MISPLACED_ENV++))
      fi
    fi
  done < <(find "$project" -name ".env*" -type f ! -name ".env.example" 2>/dev/null)
done

if [[ $MISPLACED_ENV -eq 0 ]]; then
  echo -e "${GREEN}  [OK] All .env files are in credentials/ folders${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 5: Files in Documents/ outside the repo
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 5] Leaked Files in Documents/${NC}"

LEAKED_FILES=0
KNOWN_SAFE=(
  "DropFly-OS-App-Builder"
  ".DS_Store"
  ".localized"
)

for item in "$DOCUMENTS_DIR"/*; do
  basename=$(basename "$item")

  # Skip known safe items
  if [[ " ${KNOWN_SAFE[@]} " =~ " ${basename} " ]]; then
    continue
  fi

  # Check if it looks like a project file
  if [[ "$basename" == *.md || "$basename" == *.txt || \
        "$basename" == *.json || "$basename" == *.ts || \
        "$basename" == *.js || "$basename" == *.env* ]]; then
    echo -e "${RED}  [ISSUE] Leaked file in Documents/: $basename${NC}"
    ((ISSUES_FOUND++))
    ((LEAKED_FILES++))
  fi
done

if [[ $LEAKED_FILES -eq 0 ]]; then
  echo -e "${GREEN}  [OK] No leaked files in Documents/${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 6: Empty project folders
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 6] Empty Project Folders${NC}"

EMPTY_PROJECTS=0
for project in "$PROJECTS_DIR"/*/; do
  project_name=$(basename "$project")

  # Count files (excluding hidden)
  file_count=$(find "$project" -maxdepth 1 -type f ! -name ".*" 2>/dev/null | wc -l)
  dir_count=$(find "$project" -maxdepth 1 -type d ! -name ".*" 2>/dev/null | wc -l)

  # dir_count includes the directory itself, so subtract 1
  dir_count=$((dir_count - 1))

  if [[ $file_count -eq 0 && $dir_count -eq 0 ]]; then
    echo -e "${YELLOW}  [WARNING] Empty project folder: $project_name${NC}"
    ((WARNINGS_FOUND++))
    ((EMPTY_PROJECTS++))
  fi
done

if [[ $EMPTY_PROJECTS -eq 0 ]]; then
  echo -e "${GREEN}  [OK] No empty project folders${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 7: PROJECT-REGISTRY.md is up to date
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 7] Project Registry${NC}"

if [[ -f "$ROOT/PROJECT-REGISTRY.md" ]]; then
  # Check last modified date
  last_modified=$(stat -f "%Sm" -t "%Y-%m-%d" "$ROOT/PROJECT-REGISTRY.md")
  today=$(date "+%Y-%m-%d")

  # Parse dates for comparison (macOS compatible)
  last_epoch=$(date -j -f "%Y-%m-%d" "$last_modified" "+%s" 2>/dev/null || echo "0")
  today_epoch=$(date -j -f "%Y-%m-%d" "$today" "+%s")
  days_old=$(( (today_epoch - last_epoch) / 86400 ))

  if [[ $days_old -gt 30 ]]; then
    echo -e "${YELLOW}  [WARNING] PROJECT-REGISTRY.md is $days_old days old - consider updating${NC}"
    ((WARNINGS_FOUND++))
  else
    echo -e "${GREEN}  [OK] PROJECT-REGISTRY.md is current (updated $last_modified)${NC}"
  fi
else
  echo -e "${RED}  [ISSUE] PROJECT-REGISTRY.md is missing!${NC}"
  ((ISSUES_FOUND++))
fi
echo ""

# -----------------------------------------------------------------------------
# CHECK 8: Git status (uncommitted changes)
# -----------------------------------------------------------------------------
echo -e "${BLUE}[CHECK 8] Git Status${NC}"

cd "$ROOT"
UNCOMMITTED=$(git status --porcelain | wc -l | tr -d ' ')

if [[ $UNCOMMITTED -gt 0 ]]; then
  echo -e "${YELLOW}  [WARNING] $UNCOMMITTED uncommitted changes${NC}"
  ((WARNINGS_FOUND++))
else
  echo -e "${GREEN}  [OK] Working directory is clean${NC}"
fi
echo ""

# -----------------------------------------------------------------------------
# SUMMARY
# -----------------------------------------------------------------------------
echo "========================================"
echo "  SUMMARY"
echo "========================================"

if [[ $ISSUES_FOUND -eq 0 && $WARNINGS_FOUND -eq 0 ]]; then
  echo -e "${GREEN}  HEALTHY - No issues found${NC}"
else
  if [[ $ISSUES_FOUND -gt 0 ]]; then
    echo -e "${RED}  ISSUES: $ISSUES_FOUND (require immediate action)${NC}"
  fi
  if [[ $WARNINGS_FOUND -gt 0 ]]; then
    echo -e "${YELLOW}  WARNINGS: $WARNINGS_FOUND (should be addressed)${NC}"
  fi
fi

echo ""
echo "========================================"

# Exit with error code if issues found
if [[ $ISSUES_FOUND -gt 0 ]]; then
  exit 1
fi

exit 0
