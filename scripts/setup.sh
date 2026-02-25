#!/bin/bash
#
# PX1000 WORKSPACE SETUP
# ======================
# Run this after cloning the repo to set up the full prototype_x1000 system.
#
# Usage: ./scripts/setup.sh
#

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo ""
echo "========================================"
echo -e "${BLUE}PX1000 WORKSPACE SETUP${NC}"
echo "========================================"
echo ""

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

cd "$REPO_ROOT"

# ============================================
# 1. Clone/Update prototype_x1000
# ============================================

echo -e "${YELLOW}Step 1: Setting up prototype_x1000...${NC}"

PROTO_DIR="$REPO_ROOT/DropFly-PROJECTS/prototype_x1000"
PROTO_REPO="https://github.com/dropflyai/prototype-x1000.git"

if [ -d "$PROTO_DIR/.git" ]; then
    echo "  prototype_x1000 exists, pulling latest..."
    cd "$PROTO_DIR"
    git pull origin main || echo "  Warning: Could not pull (may be offline)"
    cd "$REPO_ROOT"
    echo -e "  ${GREEN}[OK]${NC} prototype_x1000 updated"
else
    echo "  prototype_x1000 not found, cloning..."
    mkdir -p "$REPO_ROOT/DropFly-PROJECTS"

    if git clone "$PROTO_REPO" "$PROTO_DIR" 2>/dev/null; then
        echo -e "  ${GREEN}[OK]${NC} prototype_x1000 cloned"
    else
        echo -e "  ${RED}[ERROR]${NC} Could not clone prototype_x1000"
        echo "  Please clone manually:"
        echo "    git clone $PROTO_REPO $PROTO_DIR"
        echo ""
        echo "  Or ask your team lead for repository access."
    fi
fi

# ============================================
# 2. Verify CLAUDE.md exists
# ============================================

echo ""
echo -e "${YELLOW}Step 2: Verifying CLAUDE.md...${NC}"

if [ -f "$REPO_ROOT/CLAUDE.md" ]; then
    echo -e "  ${GREEN}[OK]${NC} CLAUDE.md found at repo root"
else
    echo -e "  ${RED}[ERROR]${NC} CLAUDE.md not found!"
    echo "  This file is required for the PX1000 system to work."
fi

# ============================================
# 3. Verify verification scripts
# ============================================

echo ""
echo -e "${YELLOW}Step 3: Verifying scripts...${NC}"

if [ -f "$REPO_ROOT/scripts/verify/px1000-verify.sh" ]; then
    chmod +x "$REPO_ROOT/scripts/verify/px1000-verify.sh"
    echo -e "  ${GREEN}[OK]${NC} px1000-verify.sh found and made executable"
else
    echo -e "  ${RED}[ERROR]${NC} px1000-verify.sh not found!"
fi

# ============================================
# 4. Install dependencies (optional)
# ============================================

echo ""
echo -e "${YELLOW}Step 4: Checking dependencies...${NC}"

# Check for Maestro
if command -v maestro &> /dev/null; then
    echo -e "  ${GREEN}[OK]${NC} Maestro is installed"
else
    echo -e "  ${YELLOW}[INFO]${NC} Maestro not installed (will auto-install on first verification)"
fi

# Check for Python/Playwright
if command -v python3 &> /dev/null; then
    echo -e "  ${GREEN}[OK]${NC} Python3 is installed"
    if python3 -c "import playwright" 2>/dev/null; then
        echo -e "  ${GREEN}[OK]${NC} Playwright is installed"
    else
        echo -e "  ${YELLOW}[INFO]${NC} Playwright not installed (run: pip install playwright && playwright install)"
    fi
else
    echo -e "  ${RED}[ERROR]${NC} Python3 not found"
fi

# ============================================
# 5. Summary
# ============================================

echo ""
echo "========================================"
echo -e "${GREEN}SETUP COMPLETE${NC}"
echo "========================================"
echo ""
echo "Next steps:"
echo "  1. Open this folder in Claude Code"
echo "  2. Claude will automatically read CLAUDE.md"
echo "  3. All 37 brains are available via CEO Brain orchestration"
echo ""
echo "Quick commands:"
echo "  ./scripts/verify/px1000-verify.sh [project-dir]  # Run verification"
echo "  ./scripts/setup.sh                                # Re-run this setup"
echo ""
echo "For help, see: /DropFly-PROJECTS/prototype_x1000/ceo_brain/CLAUDE.md"
echo ""
