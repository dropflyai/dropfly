#!/bin/bash
# Create a demo branch for presentations/testing
# Usage: ./create-demo.sh "demo-name"

DEMO_NAME="$1"
if [ -z "$DEMO_NAME" ]; then
  echo "❌ Error: Please provide a demo name"
  echo "Usage: ./create-demo.sh 'demo-name'"
  echo ""
  echo "Examples:"
  echo "  ./create-demo.sh 'client-presentation'"
  echo "  ./create-demo.sh 'investor-pitch'"
  echo "  ./create-demo.sh 'feature-showcase'"
  exit 1
fi

TIMESTAMP=$(date +%Y%m%d)
SAFE_NAME=$(echo "$DEMO_NAME" | tr ' ' '-' | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9-]//g')
DEMO_BRANCH="demo/${SAFE_NAME}-${TIMESTAMP}"

echo "🎭 Creating Demo: ${DEMO_NAME}"
echo "=============================="
echo ""

# 1. Save current state
echo "💾 Saving current state..."
git add -A 2>/dev/null
git commit -m "🎭 Demo snapshot: ${DEMO_NAME}

Creating frozen demo state for: ${DEMO_NAME}
Branch: ${DEMO_BRANCH}
Date: $(date)" --no-verify 2>/dev/null || echo "✓ Already committed"

# 2. Create demo branch
echo "🌿 Creating demo branch: ${DEMO_BRANCH}"
git checkout -b "${DEMO_BRANCH}" 2>/dev/null

# 3. Create demo documentation
echo "📝 Creating demo documentation..."
cat > DEMO-INFO.md << EOF
# Demo: ${DEMO_NAME}

## Overview
**Created**: $(date)
**Branch**: ${DEMO_BRANCH}
**Purpose**: Frozen state for demonstration

## Quick Start
\`\`\`bash
# Switch to this demo
git checkout ${DEMO_BRANCH}

# Install and run
npm install
npm run dev

# Open browser
open http://localhost:3000
\`\`\`

## Features Included
- [List features working in this demo]
- [Key functionality to showcase]
- [Any special configurations]

## Demo Script
1. Start with homepage
2. Show feature X
3. Demonstrate workflow Y
4. Highlight benefits

## Known Limitations
- [Any features not working]
- [Things to avoid showing]
- [Workarounds if needed]

## Deployment
This demo can be deployed separately:

### Vercel Deployment
\`\`\`bash
vercel --prod --name ${SAFE_NAME}-demo
\`\`\`
URL: https://${SAFE_NAME}-demo.vercel.app

### Custom Domain
- Production: ${SAFE_NAME}.yourdomain.com
- Staging: ${SAFE_NAME}-demo.yourdomain.com

## Environment Variables
Create \`.env.${SAFE_NAME}\` with:
\`\`\`
NEXT_PUBLIC_DEMO_MODE=true
NEXT_PUBLIC_DEMO_NAME="${DEMO_NAME}"
NEXT_PUBLIC_DEMO_DATE="${TIMESTAMP}"
\`\`\`

## Restoration
To return to this exact demo state:
\`\`\`bash
git checkout ${DEMO_BRANCH}
\`\`\`

## Archive
A backup of this demo is saved in:
\`versions-archive/demo-${SAFE_NAME}-${TIMESTAMP}.zip\`
EOF

git add DEMO-INFO.md
git commit -m "📝 Add demo documentation for ${DEMO_NAME}" --no-verify

# 4. Create demo archive
echo "📦 Creating demo archive..."
BACKUP_DIR="versions-archive"
mkdir -p ${BACKUP_DIR}
git archive --format=zip --output="${BACKUP_DIR}/demo-${SAFE_NAME}-${TIMESTAMP}.zip" HEAD
echo "✓ Archive saved: ${BACKUP_DIR}/demo-${SAFE_NAME}-${TIMESTAMP}.zip"

# 5. Create or update DEMOS.md
if [ ! -f "DEMOS.md" ]; then
  cat > DEMOS.md << 'HEADER'
# Demo Catalog

This file tracks all demo branches created for presentations, testing, and client reviews.

## Active Demos

HEADER
fi

cat >> DEMOS.md << EOF
### ${DEMO_NAME}
- **Branch**: \`${DEMO_BRANCH}\`
- **Created**: $(date '+%Y-%m-%d %H:%M')
- **Purpose**: ${DEMO_NAME}
- **Access**: \`git checkout ${DEMO_BRANCH}\`
- **Deploy**: \`vercel --prod --name ${SAFE_NAME}-demo\`

EOF

# 6. Push to remote
echo "☁️  Pushing to remote..."
git push origin "${DEMO_BRANCH}" 2>/dev/null && echo "✓ Pushed to remote" || echo "⚠️  No remote configured (demo saved locally)"

# 7. Return to main branch
echo "🔄 Returning to main branch..."
git checkout main 2>/dev/null || git checkout master 2>/dev/null

echo ""
echo "✅ Demo Created Successfully!"
echo "=============================="
echo "🎭 Demo Name: ${DEMO_NAME}"
echo "🌿 Branch: ${DEMO_BRANCH}"
echo "📦 Archive: versions-archive/demo-${SAFE_NAME}-${TIMESTAMP}.zip"
echo ""
echo "📝 To switch to this demo:"
echo "  git checkout ${DEMO_BRANCH}"
echo ""
echo "🚀 To deploy this demo:"
echo "  git checkout ${DEMO_BRANCH}"
echo "  vercel --prod --name ${SAFE_NAME}-demo"
echo ""
echo "📊 To list all demos:"
echo "  git branch -a | grep demo/"
echo ""