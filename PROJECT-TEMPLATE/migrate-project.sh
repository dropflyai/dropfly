#!/bin/bash
# ================================
# PROJECT MIGRATION SCRIPT
# ================================
# Applies PROJECT-TEMPLATE structure to an existing project
# Usage: ./migrate-project.sh <path-to-project>
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

# Get template and project paths
TEMPLATE_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_PATH="${1}"

if [ -z "$PROJECT_PATH" ]; then
    echo -e "${RED}Error: No project path specified${NC}"
    echo "Usage: ./migrate-project.sh <path-to-project>"
    exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
    echo -e "${RED}Error: Project directory does not exist: $PROJECT_PATH${NC}"
    exit 1
fi

PROJECT_NAME=$(basename "$PROJECT_PATH")

echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║         PROJECT MIGRATION TO TEMPLATE STRUCTURE            ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${CYAN}Project:${NC} $PROJECT_NAME"
echo -e "${CYAN}Path:${NC} $PROJECT_PATH"
echo -e "${CYAN}Template:${NC} $TEMPLATE_DIR"
echo -e ""

# ==========================================
# STEP 1: Copy .claude directory
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 1: Setting up .claude/ directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "$PROJECT_PATH/.claude" ]; then
    echo -e "${YELLOW}⚠️  .claude/ already exists - backing up to .claude.backup${NC}"
    mv "$PROJECT_PATH/.claude" "$PROJECT_PATH/.claude.backup.$(date +%Y%m%d_%H%M%S)"
fi

echo -e "${GREEN}✅ Copying .claude/ directory...${NC}"
cp -r "$TEMPLATE_DIR/.claude" "$PROJECT_PATH/.claude"
echo -e "${GREEN}   - SYSTEM-PROMPT.md${NC}"
echo -e "${GREEN}   - TRIPLE-VERIFICATION-PROTOCOL.md${NC}"
echo -e "${GREEN}   - EFFICIENCY-CHECKLIST.md${NC}"
echo -e "${GREEN}   - AUTOMATION-PLAYBOOK.md${NC}"
echo -e "${GREEN}   - DEBUGGING-LOG.md${NC}"
echo -e "${GREEN}   - COMMON-MISTAKES.md${NC}"
echo ""

# ==========================================
# STEP 2: Set up credentials directory
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 2: Setting up credentials/ directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "$PROJECT_PATH/credentials" ]; then
    echo -e "${GREEN}✅ Creating credentials/ directory...${NC}"
    mkdir -p "$PROJECT_PATH/credentials/services"
    cp "$TEMPLATE_DIR/credentials/.env.template" "$PROJECT_PATH/credentials/.env.template"
    cp "$TEMPLATE_DIR/credentials/README.md" "$PROJECT_PATH/credentials/README.md"
    cp "$TEMPLATE_DIR/credentials/services/README.md" "$PROJECT_PATH/credentials/services/README.md"
else
    echo -e "${YELLOW}⚠️  credentials/ already exists - skipping${NC}"
fi

# Migrate existing .env files
if [ -f "$PROJECT_PATH/.env" ] || [ -f "$PROJECT_PATH/.env.local" ]; then
    echo -e "${YELLOW}⚠️  Found existing .env files - migrating...${NC}"

    if [ -f "$PROJECT_PATH/.env" ] && [ ! -f "$PROJECT_PATH/credentials/.env" ]; then
        echo -e "${GREEN}   Moving .env to credentials/.env${NC}"
        mv "$PROJECT_PATH/.env" "$PROJECT_PATH/credentials/.env"
    fi

    if [ -f "$PROJECT_PATH/.env.local" ] && [ ! -f "$PROJECT_PATH/credentials/.env.local" ]; then
        echo -e "${GREEN}   Copying .env.local to credentials/.env.local${NC}"
        cp "$PROJECT_PATH/.env.local" "$PROJECT_PATH/credentials/.env.local"
    fi
fi
echo ""

# ==========================================
# STEP 3: Set up scripts directory
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 3: Setting up scripts/ directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ -d "$PROJECT_PATH/scripts" ]; then
    echo -e "${YELLOW}⚠️  scripts/ already exists - merging with template...${NC}"

    # Copy automation scripts if they don't exist
    if [ ! -d "$PROJECT_PATH/scripts/automation" ]; then
        echo -e "${GREEN}   Creating scripts/automation/${NC}"
        mkdir -p "$PROJECT_PATH/scripts/automation"
    fi

    # Copy each automation script if it doesn't exist
    for script in "$TEMPLATE_DIR/scripts/automation"/*; do
        script_name=$(basename "$script")
        if [ ! -f "$PROJECT_PATH/scripts/automation/$script_name" ]; then
            echo -e "${GREEN}   Adding automation/$script_name${NC}"
            cp "$script" "$PROJECT_PATH/scripts/automation/"
            chmod +x "$PROJECT_PATH/scripts/automation/$script_name"
        fi
    done

    # Copy deployment scripts if they don't exist
    if [ ! -d "$PROJECT_PATH/scripts/deployment" ]; then
        echo -e "${GREEN}   Creating scripts/deployment/${NC}"
        mkdir -p "$PROJECT_PATH/scripts/deployment"
    fi

    for script in "$TEMPLATE_DIR/scripts/deployment"/*; do
        script_name=$(basename "$script")
        if [ ! -f "$PROJECT_PATH/scripts/deployment/$script_name" ]; then
            echo -e "${GREEN}   Adding deployment/$script_name${NC}"
            cp "$script" "$PROJECT_PATH/scripts/deployment/"
            chmod +x "$PROJECT_PATH/scripts/deployment/$script_name"
        fi
    done

    # Copy database scripts if they don't exist
    if [ ! -d "$PROJECT_PATH/scripts/database" ]; then
        echo -e "${GREEN}   Creating scripts/database/${NC}"
        mkdir -p "$PROJECT_PATH/scripts/database"
    fi

    for script in "$TEMPLATE_DIR/scripts/database"/*; do
        script_name=$(basename "$script")
        if [ ! -f "$PROJECT_PATH/scripts/database/$script_name" ]; then
            echo -e "${GREEN}   Adding database/$script_name${NC}"
            cp "$script" "$PROJECT_PATH/scripts/database/"
            chmod +x "$PROJECT_PATH/scripts/database/$script_name"
        fi
    done
else
    echo -e "${GREEN}✅ Copying entire scripts/ directory...${NC}"
    cp -r "$TEMPLATE_DIR/scripts" "$PROJECT_PATH/scripts"
    chmod +x "$PROJECT_PATH/scripts"/**/*.sh
    chmod +x "$PROJECT_PATH/scripts"/**/*.py
fi
echo ""

# ==========================================
# STEP 4: Set up docs directory
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 4: Setting up docs/ directory${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -d "$PROJECT_PATH/docs" ]; then
    echo -e "${GREEN}✅ Creating docs/ directory...${NC}"
    mkdir -p "$PROJECT_PATH/docs"
    cp "$TEMPLATE_DIR/docs/README.md" "$PROJECT_PATH/docs/README.md"
else
    if [ ! -f "$PROJECT_PATH/docs/README.md" ]; then
        echo -e "${GREEN}✅ Adding docs/README.md${NC}"
        cp "$TEMPLATE_DIR/docs/README.md" "$PROJECT_PATH/docs/README.md"
    else
        echo -e "${YELLOW}⚠️  docs/README.md already exists - skipping${NC}"
    fi
fi
echo ""

# ==========================================
# STEP 5: Update .gitignore
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 5: Updating .gitignore${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

GITIGNORE_ADDITIONS="
# ================================
# PROJECT-TEMPLATE Security
# ================================
# Credentials - NEVER commit these
credentials/.env
credentials/.env.local
credentials/services/*.env

# Verification artifacts
/tmp/verification_*
"

if [ -f "$PROJECT_PATH/.gitignore" ]; then
    # Check if already has credentials ignore
    if ! grep -q "credentials/.env" "$PROJECT_PATH/.gitignore"; then
        echo -e "${GREEN}✅ Adding credential exclusions to .gitignore${NC}"
        echo "$GITIGNORE_ADDITIONS" >> "$PROJECT_PATH/.gitignore"
    else
        echo -e "${YELLOW}⚠️  .gitignore already has credential exclusions${NC}"
    fi
else
    echo -e "${GREEN}✅ Creating .gitignore${NC}"
    echo "$GITIGNORE_ADDITIONS" > "$PROJECT_PATH/.gitignore"
fi
echo ""

# ==========================================
# STEP 6: Create project-specific README if needed
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 6: Checking project README${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

if [ ! -f "$PROJECT_PATH/README.md" ]; then
    echo -e "${GREEN}✅ Creating basic README.md${NC}"
    cat > "$PROJECT_PATH/README.md" <<EOF
# $PROJECT_NAME

## Project Overview

[Add project description here]

## Quick Start

[Add setup instructions here]

## Development

This project uses the PROJECT-TEMPLATE system for efficiency.

**For Claude:**
- Read \`.claude/SYSTEM-PROMPT.md\` on first interaction
- Read \`.claude/EFFICIENCY-CHECKLIST.md\` before every response
- Use triple verification before claiming success

**For Developers:**
- Credentials: See \`credentials/README.md\`
- Scripts: See \`scripts/\` directory
- Documentation: See \`docs/\` directory

## Testing

\`\`\`bash
# Triple verification
python3 scripts/automation/triple-verify.py https://www.yourapp.com
\`\`\`

## Deployment

\`\`\`bash
# Deploy to production
./scripts/deployment/deploy-to-vercel.sh --prod
\`\`\`

---

**Efficiency System:** 10/10 target
**Template Version:** 1.0
EOF
else
    echo -e "${YELLOW}⚠️  README.md already exists - skipping${NC}"
fi
echo ""

# ==========================================
# STEP 7: Create symbolic links (optional)
# ==========================================
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}STEP 7: Creating convenience links${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"

# Create symlink from .env to credentials/.env if .env doesn't exist
if [ ! -f "$PROJECT_PATH/.env" ] && [ -f "$PROJECT_PATH/credentials/.env" ]; then
    echo -e "${GREEN}✅ Creating .env symlink to credentials/.env${NC}"
    ln -s credentials/.env "$PROJECT_PATH/.env"
fi
echo ""

# ==========================================
# MIGRATION SUMMARY
# ==========================================
echo -e "${MAGENTA}╔════════════════════════════════════════════════════════════╗${NC}"
echo -e "${MAGENTA}║              MIGRATION COMPLETE                             ║${NC}"
echo -e "${MAGENTA}╚════════════════════════════════════════════════════════════╝${NC}"
echo -e ""
echo -e "${GREEN}✅ Successfully migrated: ${NC}$PROJECT_NAME"
echo -e ""
echo -e "${CYAN}What was added:${NC}"
echo -e "  ✅ .claude/ directory (6 instruction files)"
echo -e "  ✅ credentials/ directory (with .env.template)"
echo -e "  ✅ scripts/ directory (10 automation scripts)"
echo -e "  ✅ docs/ directory (with README.md)"
echo -e "  ✅ Updated .gitignore"
echo -e ""
echo -e "${CYAN}Next steps:${NC}"
echo -e "  1. Review credentials/.env.template"
echo -e "  2. Fill in credentials/.env with actual values"
echo -e "  3. Tell Claude: 'Read .claude/SYSTEM-PROMPT.md'"
echo -e "  4. Test triple verification:"
echo -e "     ${YELLOW}python3 scripts/automation/triple-verify.py <url>${NC}"
echo -e ""
echo -e "${GREEN}Project is now using the 10/10 efficiency system! 🎉${NC}"
echo -e ""
