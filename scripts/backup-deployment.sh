#!/bin/bash

# Deployment Backup and Version Control Script
# Usage: ./scripts/backup-deployment.sh

set -e  # Exit on error

echo "🚀 Starting Deployment Backup Process..."

# Configuration
PROJECT_ROOT="/Users/rioallen/Documents/OS-App-Builder"
DEPLOYED_VERSIONS_DIR="$PROJECT_ROOT/DEPLOYED-VERSIONS"

# Auto-generate version
if [ -f "package.json" ]; then
    PACKAGE_VERSION=$(cat package.json | grep '"version"' | cut -d '"' -f 4)
else
    PACKAGE_VERSION="1.0.0"
fi

VERSION="v${PACKAGE_VERSION}-$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="$DEPLOYED_VERSIONS_DIR/$VERSION"

echo "📦 Creating backup for version: $VERSION"

# Create backup directory
mkdir -p "$BACKUP_DIR"

# 1. Save Git information
echo "📝 Saving Git information..."
git rev-parse HEAD > "$BACKUP_DIR/git-commit.txt"
git branch --show-current > "$BACKUP_DIR/git-branch.txt"

# 2. Create Git tag (only if not exists)
if ! git rev-parse "$VERSION" >/dev/null 2>&1; then
    echo "🏷️  Creating Git tag: $VERSION"
    git tag -a "$VERSION" -m "Deployment: $VERSION"
    git push origin "$VERSION" 2>/dev/null || echo "⚠️  Could not push tag (might not have remote)"
else
    echo "ℹ️  Tag $VERSION already exists"
fi

# 3. Create source snapshot
echo "📸 Creating source snapshot..."
zip -r "$BACKUP_DIR/source-snapshot.zip" . \
    -x "node_modules/*" \
    -x ".next/*" \
    -x ".git/*" \
    -x "DEPLOYED-VERSIONS/*" \
    -x "*.log" \
    -q

# 4. Save deployment metadata
echo "💾 Saving deployment metadata..."
cat > "$BACKUP_DIR/deployment-info.json" << EOF
{
  "version": "$VERSION",
  "package_version": "$PACKAGE_VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)",
  "git_remote": "$(git remote get-url origin 2>/dev/null || echo 'no-remote')",
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)",
  "user": "$(whoami)",
  "machine": "$(hostname)"
}
EOF

# 5. Save environment variables template (without secrets)
echo "🔐 Creating environment template..."
if [ -f ".env.local" ]; then
    grep -E "^[A-Z]" .env.local | sed 's/=.*/=***/' > "$BACKUP_DIR/env-template.txt"
fi

# 6. Deploy to Vercel (if Vercel CLI is available)
if command -v vercel &> /dev/null; then
    echo "🚀 Deploying to Vercel..."
    vercel --prod --yes --meta version="$VERSION" > "$BACKUP_DIR/deployment.log" 2>&1 || {
        echo "⚠️  Vercel deployment failed, check $BACKUP_DIR/deployment.log"
    }
    
    # Save deployment URLs
    echo "📝 Saving deployment URLs..."
    echo "## Deployment URLs for $VERSION" > "$BACKUP_DIR/vercel-urls.md"
    echo "" >> "$BACKUP_DIR/vercel-urls.md"
    vercel ls 2>/dev/null | head -10 >> "$BACKUP_DIR/vercel-urls.md" || echo "Could not fetch URLs" >> "$BACKUP_DIR/vercel-urls.md"
else
    echo "⚠️  Vercel CLI not found, skipping deployment"
fi

# 7. Update current production symlink
echo "🔗 Updating current production reference..."
rm -f "$DEPLOYED_VERSIONS_DIR/current-production/version.json"
cp "$BACKUP_DIR/deployment-info.json" "$DEPLOYED_VERSIONS_DIR/current-production/version.json"

# 8. Update deployment log
echo "📋 Updating deployment log..."
cat >> "$DEPLOYED_VERSIONS_DIR/deployment-log.md" << EOF

## $VERSION - $(date '+%Y-%m-%d %H:%M:%S')
**Type**: Production
**Deployer**: $(whoami)
**Git Commit**: $(git rev-parse --short HEAD)

### URLs
- Git Tag: $VERSION
- Backup Location: $BACKUP_DIR

### Verification
- Source Backup: ✅
- Git Tag: ✅
- Metadata Saved: ✅

---
EOF

# 9. Create rollback script for this version
echo "🔄 Creating rollback script..."
cat > "$BACKUP_DIR/rollback.sh" << 'EOF'
#!/bin/bash
echo "Rolling back to version: $VERSION"
cd "$PROJECT_ROOT"
git checkout tags/$VERSION
npm install
npm run build
vercel --prod --yes
EOF
chmod +x "$BACKUP_DIR/rollback.sh"

# Summary
echo ""
echo "✅ Deployment backup completed!"
echo "📁 Backup location: $BACKUP_DIR"
echo "🏷️  Git tag: $VERSION"
echo ""
echo "To restore this version later:"
echo "  git checkout tags/$VERSION"
echo "  OR"
echo "  cd $BACKUP_DIR && unzip source-snapshot.zip -d /path/to/restore"
echo ""
echo "To rollback in Vercel:"
echo "  vercel rollback [deployment-id]"