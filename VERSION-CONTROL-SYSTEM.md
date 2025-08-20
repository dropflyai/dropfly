# 🎯 Smart Version Control & Demo System

## The Problem
You create something perfect, then accidentally break it while trying to improve it. Need a way to save "golden versions" and create demo snapshots.

## 🏷️ Version Tagging System

### Quick Version Save (When Something Works)
```bash
# When you have something you like
./save-version.sh "Working payment flow"

# What it does:
# 1. Creates tagged version: v1.0-working-payment-flow
# 2. Creates branch: version/working-payment-flow
# 3. Takes screenshot if UI
# 4. Documents in VERSIONS.md
```

### Demo Branches (Show Different States)
```bash
# Create demo snapshot
./create-demo.sh "client-presentation"

# Creates:
# - demo/client-presentation branch
# - Deployment URL specific to this demo
# - Frozen state that won't change
```

## 📸 Version Save Script

### save-version.sh
```bash
#!/bin/bash
# Save a "golden" version you don't want to lose

DESCRIPTION="$1"
if [ -z "$DESCRIPTION" ]; then
  echo "Usage: ./save-version.sh 'description of what works'"
  exit 1
fi

# Generate version info
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
VERSION_NUM=$(git tag -l "v*" | wc -l | xargs)
VERSION_NUM=$((VERSION_NUM + 1))
SAFE_DESC=$(echo "$DESCRIPTION" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
VERSION_TAG="v${VERSION_NUM}.0-${SAFE_DESC}"
BRANCH_NAME="version/${SAFE_DESC}-${TIMESTAMP}"

echo "📸 Saving Version: ${VERSION_TAG}"
echo "================================"

# 1. Commit current state
git add -A
git commit -m "📸 Version Save: ${DESCRIPTION}" --no-verify 2>/dev/null || echo "✓ Already committed"

# 2. Create version tag
git tag -a "${VERSION_TAG}" -m "Version ${VERSION_NUM}: ${DESCRIPTION}

Saved at: $(date)
Reason: Working state to preserve"

# 3. Create version branch
git checkout -b "${BRANCH_NAME}"
git checkout main

# 4. Document in VERSIONS.md
cat >> VERSIONS.md << EOF

## ${VERSION_TAG}
- **Date**: $(date '+%Y-%m-%d %H:%M')
- **Description**: ${DESCRIPTION}
- **Branch**: ${BRANCH_NAME}
- **Restore Command**: \`git checkout ${VERSION_TAG}\`
- **View Changes**: \`git diff main ${VERSION_TAG}\`
EOF

# 5. Create snapshot archive
BACKUP_DIR="versions-archive"
mkdir -p ${BACKUP_DIR}
git archive --format=zip --output="${BACKUP_DIR}/${VERSION_TAG}.zip" HEAD
echo "📦 Archive saved: ${BACKUP_DIR}/${VERSION_TAG}.zip"

echo ""
echo "✅ Version Saved Successfully!"
echo "Tag: ${VERSION_TAG}"
echo "Branch: ${BRANCH_NAME}"
echo ""
echo "To restore this version later:"
echo "  git checkout ${VERSION_TAG}"
echo ""
```

### create-demo.sh
```bash
#!/bin/bash
# Create a demo branch for presentations/testing

DEMO_NAME="$1"
if [ -z "$DEMO_NAME" ]; then
  echo "Usage: ./create-demo.sh 'demo-name'"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d)
SAFE_NAME=$(echo "$DEMO_NAME" | tr ' ' '-' | tr '[:upper:]' '[:lower:]')
DEMO_BRANCH="demo/${SAFE_NAME}-${TIMESTAMP}"

echo "🎭 Creating Demo: ${DEMO_NAME}"
echo "=============================="

# 1. Save current state
git add -A
git commit -m "🎭 Demo snapshot: ${DEMO_NAME}" --no-verify 2>/dev/null

# 2. Create demo branch
git checkout -b "${DEMO_BRANCH}"

# 3. Document demo
cat > DEMO-INFO.md << EOF
# Demo: ${DEMO_NAME}
**Created**: $(date)
**Branch**: ${DEMO_BRANCH}
**Purpose**: Frozen state for demonstration

## Features Included
- [List what's working in this demo]
- [What to show]
- [Known limitations]

## Access
\`\`\`bash
git checkout ${DEMO_BRANCH}
npm install
npm run dev
\`\`\`

## Deployment
This demo can be deployed separately to:
- Vercel: demo-${SAFE_NAME}.vercel.app
- Custom URL: ${SAFE_NAME}.yourdomain.com
EOF

git add DEMO-INFO.md
git commit -m "Add demo documentation"

# 4. Push to remote
git push origin "${DEMO_BRANCH}" 2>/dev/null || echo "⚠️  No remote configured"

echo ""
echo "✅ Demo Created!"
echo "Branch: ${DEMO_BRANCH}"
echo ""
echo "Deploy with:"
echo "  vercel --prod --name demo-${SAFE_NAME}"
echo ""

# Return to main
git checkout main
```

## 🔄 Rollback System

### quick-rollback.sh
```bash
#!/bin/bash
# Quickly rollback to a previous version

echo "📋 Available Versions:"
echo "====================="
git tag -l "v*" --sort=-version:refname | head -10

echo ""
echo "📋 Recent Checkpoints:"
git branch -a | grep -E "(version|checkpoint|demo)" | head -10

echo ""
read -p "Enter version/branch to rollback to: " TARGET

if [ -z "$TARGET" ]; then
  echo "❌ No target specified"
  exit 1
fi

echo "⚠️  This will rollback to: ${TARGET}"
read -p "Continue? (y/n) " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
  # Create backup of current state first
  git branch "rollback-backup-$(date +%s)"
  
  # Rollback
  git checkout "${TARGET}"
  
  echo "✅ Rolled back to ${TARGET}"
  echo "Your previous state is saved in: rollback-backup-*"
else
  echo "❌ Rollback cancelled"
fi
```

## 📚 Version Management Strategy

### 1. Development Versions (Automatic)
```bash
# Every hour during active development
v1.0-dev-20240115-1400
v1.0-dev-20240115-1500
v1.0-dev-20240115-1600
```

### 2. Feature Versions (Manual)
```bash
# When a feature works
./save-version.sh "authentication complete"
# Creates: v2.0-authentication-complete
```

### 3. Demo Versions (For Clients)
```bash
# For specific presentations
./create-demo.sh "client-abc-review"
# Creates: demo/client-abc-review-20240115
```

### 4. Release Versions (Production)
```bash
# Official releases
git tag -a "release-1.0.0" -m "Production release 1.0.0"
```

## 🎯 Smart Branching Strategy

```
main
├── version/feature-complete-20240115  (golden version)
├── version/before-refactor-20240116   (safety backup)
├── demo/client-presentation-20240117  (frozen demo)
├── demo/investor-pitch-20240118       (frozen demo)
├── checkpoint/20240115-1400           (auto-checkpoint)
└── experimental/new-ui-test           (risky changes)
```

## 📝 VERSIONS.md Template

```markdown
# Version History

## v3.0-payment-integration
- **Date**: 2024-01-15 14:30
- **Description**: Working Stripe payment flow
- **Branch**: version/payment-integration-20240115
- **Restore**: `git checkout v3.0-payment-integration`
- **Notable**: First working payment implementation

## v2.0-authentication-complete  
- **Date**: 2024-01-14 16:45
- **Description**: Full auth system with social login
- **Branch**: version/authentication-complete-20240114
- **Restore**: `git checkout v2.0-authentication-complete`
- **Notable**: Google and GitHub OAuth working

## v1.0-initial-ui
- **Date**: 2024-01-13 10:00
- **Description**: Basic UI components complete
- **Branch**: version/initial-ui-20240113
- **Restore**: `git checkout v1.0-initial-ui`
- **Notable**: First stable UI version
```

## 🚀 Quick Commands

### Add to .zshrc/.bashrc
```bash
# Version management aliases
alias save-version='./save-version.sh'
alias create-demo='./create-demo.sh'
alias rollback='./quick-rollback.sh'
alias versions='git tag -l "v*" --sort=-version:refname | head -10'
alias demos='git branch -a | grep demo/'
alias checkpoints='git branch -a | grep checkpoint/'

# Quick version save
alias qvs='git add -A && git commit -m "Quick version save" && git tag "v-quick-$(date +%s)"'

# Show version info
alias vinfo='echo "=== Versions ===" && git tag -l "v*" | tail -5 && echo "=== Demos ===" && git branch -a | grep demo/ | tail -5'
```

## 🎭 Demo Deployment Strategy

### Vercel Multi-Demo Setup
```bash
# Each demo gets its own URL
vercel --prod --name demo-client-abc  # → demo-client-abc.vercel.app
vercel --prod --name demo-investor     # → demo-investor.vercel.app
vercel --prod --name demo-v2-stable    # → demo-v2-stable.vercel.app
```

### Environment Variables per Demo
```bash
# .env.demo-client
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_NAME="Client ABC Demo"
NEXT_PUBLIC_FEATURES_ENABLED="payment,chat"

# .env.demo-investor  
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_NAME="Investor Demo"
NEXT_PUBLIC_FEATURES_ENABLED="analytics,reports"
```

## 🔒 Protection Rules

### Never Lose Good Work
1. **Before any risky change**: `./save-version.sh "before [risky thing]"`
2. **When something works**: `./save-version.sh "[what works]"`
3. **Before client meeting**: `./create-demo.sh "[client-name]"`
4. **End of day**: `./save-version.sh "end-of-day"`

### Recovery is Always Possible
- Every version is tagged
- Every demo is branched
- Every checkpoint is saved
- Archives stored locally

## ✅ Setup Checklist

- [ ] Create save-version.sh script
- [ ] Create create-demo.sh script  
- [ ] Create quick-rollback.sh script
- [ ] Add aliases to shell config
- [ ] Create VERSIONS.md file
- [ ] Set up versions-archive/ directory
- [ ] Test version save and restore

---

**Remember**: The best version is the one you can actually restore when you need it.