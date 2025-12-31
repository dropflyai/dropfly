#!/bin/bash
# Save a "golden" version you don't want to lose
# Usage: ./save-version.sh "description of what works"

DESCRIPTION="$1"
if [ -z "$DESCRIPTION" ]; then
  echo "❌ Error: Please provide a description"
  echo "Usage: ./save-version.sh 'description of what works'"
  echo ""
  echo "Examples:"
  echo "  ./save-version.sh 'working payment flow'"
  echo "  ./save-version.sh 'before major refactor'"
  echo "  ./save-version.sh 'demo ready for client'"
  exit 1
fi

# Generate version info
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION_NUM=$(git tag -l "v*" 2>/dev/null | wc -l | xargs)
VERSION_NUM=$((VERSION_NUM + 1))
SAFE_DESC=$(echo "$DESCRIPTION" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
VERSION_TAG="v${VERSION_NUM}.0-${SAFE_DESC}"
BRANCH_NAME="version/${SAFE_DESC}-${TIMESTAMP}"

echo "📸 Saving Version: ${VERSION_TAG}"
echo "================================"
echo "Description: ${DESCRIPTION}"
echo ""

# 1. Commit current state
echo "💾 Committing current state..."
git add -A 2>/dev/null
git commit -m "📸 Version Save: ${DESCRIPTION}

Version: ${VERSION_TAG}
Timestamp: $(date)
Reason: Preserving working state" --no-verify 2>/dev/null || echo "✓ Already committed"

# 2. Create version tag
echo "🏷️  Creating version tag..."
git tag -a "${VERSION_TAG}" -m "Version ${VERSION_NUM}: ${DESCRIPTION}

Saved at: $(date)
Reason: Working state to preserve
Branch: ${BRANCH_NAME}

To restore: git checkout ${VERSION_TAG}" 2>/dev/null

# 3. Create version branch
echo "🌿 Creating version branch..."
git checkout -b "${BRANCH_NAME}" 2>/dev/null
git checkout main 2>/dev/null || git checkout master 2>/dev/null

# 4. Initialize or update VERSIONS.md
if [ ! -f "VERSIONS.md" ]; then
  cat > VERSIONS.md << 'HEADER'
# Version History

This file tracks all saved versions of the project. Each version represents a working state that was explicitly preserved.

## How to Use Versions
- **View all versions**: `git tag -l "v*"`
- **Restore a version**: `git checkout [version-tag]`
- **Compare versions**: `git diff [version1] [version2]`
- **Create new version**: `./save-version.sh "description"`

---

HEADER
fi

# Add new version to VERSIONS.md
cat >> VERSIONS.md << EOF
## ${VERSION_TAG}
- **Date**: $(date '+%Y-%m-%d %H:%M')
- **Description**: ${DESCRIPTION}
- **Branch**: ${BRANCH_NAME}
- **Restore Command**: \`git checkout ${VERSION_TAG}\`
- **Compare with main**: \`git diff main ${VERSION_TAG}\`
- **Files changed**: $(git diff --name-only HEAD~1 2>/dev/null | wc -l | xargs) files

EOF

# 5. Create snapshot archive
echo "📦 Creating backup archive..."
BACKUP_DIR="versions-archive"
mkdir -p ${BACKUP_DIR}
git archive --format=zip --output="${BACKUP_DIR}/${VERSION_TAG}.zip" HEAD 2>/dev/null
echo "✓ Archive saved: ${BACKUP_DIR}/${VERSION_TAG}.zip"

# 6. Update SESSION-STATE.md if it exists
if [ -f "SESSION-STATE.md" ]; then
  sed -i.bak "s/## ✅ Last Completed Tasks/## ✅ Last Completed Tasks\n- Version saved: ${VERSION_TAG} - ${DESCRIPTION}/" SESSION-STATE.md 2>/dev/null
  rm SESSION-STATE.md.bak 2>/dev/null
fi

echo ""
echo "✅ Version Saved Successfully!"
echo "================================"
echo "📌 Version Tag: ${VERSION_TAG}"
echo "🌿 Branch: ${BRANCH_NAME}"
echo "📦 Archive: ${BACKUP_DIR}/${VERSION_TAG}.zip"
echo ""
echo "📝 To restore this version later:"
echo "  git checkout ${VERSION_TAG}"
echo ""
echo "📊 To see what changed since this version:"
echo "  git diff ${VERSION_TAG} main"
echo ""
echo "🔍 To list all versions:"
echo "  git tag -l 'v*'"
echo ""