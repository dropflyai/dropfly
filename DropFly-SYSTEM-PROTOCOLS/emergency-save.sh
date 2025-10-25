#!/bin/bash
# EMERGENCY SAVE - Run this when VS Code feels unstable or before risky operations
# Usage: ./emergency-save.sh

echo "🚨 EMERGENCY SAVE INITIATED"
echo "=========================="

# Create timestamp for unique identification
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
BRANCH_NAME="emergency-backup-${TIMESTAMP}"

# 1. Save current work state to file
echo "📝 Saving current state..."
cat > EMERGENCY-CONTEXT-${TIMESTAMP}.md << EOF
# Emergency Save Context
**Timestamp**: $(date)
**Branch**: $(git branch --show-current)
**User**: $(whoami)
**Directory**: $(pwd)

## Git Status
\`\`\`
$(git status --short)
\`\`\`

## Recent Commits
\`\`\`
$(git log --oneline -10)
\`\`\`

## Modified Files
$(git diff --name-only)

## Current SESSION-STATE.md
$(cat SESSION-STATE.md 2>/dev/null || echo "No session state file found")
EOF

# 2. Stage all changes
echo "📦 Staging all changes..."
git add -A

# 3. Create emergency commit
echo "💾 Creating emergency commit..."
git commit -m "🚨 EMERGENCY SAVE: ${TIMESTAMP}

Automatic emergency backup triggered at $(date)
All work preserved in case of crash or data loss" --no-verify 2>/dev/null || echo "No changes to commit"

# 4. Create backup branch
echo "🌿 Creating backup branch: ${BRANCH_NAME}"
git branch ${BRANCH_NAME}

# 5. Try to push everything to remote
echo "☁️  Pushing to remote (if available)..."
git push origin --all --force-with-lease 2>/dev/null && echo "✅ Pushed to remote" || echo "⚠️  No remote configured or push failed (local backup still safe)"

# 6. Create a local backup archive
echo "🗂️  Creating local archive..."
BACKUP_DIR="${HOME}/emergency-backups"
mkdir -p ${BACKUP_DIR}
tar -czf "${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz" \
  --exclude=node_modules \
  --exclude=.next \
  --exclude=.git/objects \
  . 2>/dev/null

echo ""
echo "✅ EMERGENCY SAVE COMPLETE!"
echo "=========================="
echo "📍 Emergency branch: ${BRANCH_NAME}"
echo "📄 Context saved to: EMERGENCY-CONTEXT-${TIMESTAMP}.md"
echo "🗂️  Archive saved to: ${BACKUP_DIR}/backup-${TIMESTAMP}.tar.gz"
echo ""
echo "To recover later, run:"
echo "  git checkout ${BRANCH_NAME}"
echo ""