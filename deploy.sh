#!/bin/bash
# One-command deployment to any environment
# Usage: ./deploy.sh [staging|production|preview]

ENVIRONMENT=${1:-"preview"}
PROJECT_NAME=$(basename $(pwd))
TIMESTAMP=$(date +%Y%m%d-%H%M%S)

echo "🚀 Deployment Pipeline"
echo "====================="
echo "Project: $PROJECT_NAME"
echo "Environment: $ENVIRONMENT"
echo "Time: $(date)"
echo ""

# Pre-deployment checks
echo "📋 Pre-deployment Checks"
echo "------------------------"

# Check for uncommitted changes
if ! git diff-index --quiet HEAD --; then
  echo "⚠️  Uncommitted changes detected!"
  read -p "Commit them first? (y/n): " -n 1 -r
  echo ""
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    git add -A
    git commit -m "🚀 Pre-deployment commit: $TIMESTAMP"
  else
    echo "❌ Deployment cancelled - commit your changes first"
    exit 1
  fi
fi

# Type checking
echo "📝 Type checking..."
if [ -f "tsconfig.json" ]; then
  npx tsc --noEmit || { echo "❌ TypeScript errors found!"; exit 1; }
  echo "✅ No type errors"
else
  echo "⏭️  No TypeScript config found, skipping"
fi

# Linting
echo "🔍 Linting..."
if [ -f "package.json" ] && grep -q '"lint"' package.json; then
  npm run lint 2>/dev/null || { echo "⚠️  Linting warnings (continuing)"; }
else
  echo "⏭️  No lint script found, skipping"
fi

# Build test
echo "🔨 Test build..."
npm run build || { echo "❌ Build failed!"; exit 1; }
echo "✅ Build successful"

# Bundle size check
if [ -d ".next" ]; then
  SIZE=$(du -sh .next | cut -f1)
  echo "📦 Bundle size: $SIZE"
fi

# Save pre-deployment version
echo ""
echo "💾 Creating deployment backup..."
./save-version.sh "Pre-deployment to $ENVIRONMENT" 2>/dev/null || git tag "deploy-backup-$TIMESTAMP"

# Environment-specific deployment
echo ""
echo "🚀 Deploying to $ENVIRONMENT..."
echo "--------------------------------"

case "$ENVIRONMENT" in
  "preview")
    echo "👁️  Creating preview deployment..."
    if command -v vercel &> /dev/null; then
      vercel --confirm
      echo "✅ Preview deployed!"
    else
      echo "Install Vercel CLI: npm i -g vercel"
      exit 1
    fi
    ;;
    
  "staging")
    echo "🌤️  Deploying to staging..."
    if [ -f ".env.staging" ]; then
      cp .env.staging .env.production
    fi
    
    if command -v vercel &> /dev/null; then
      vercel --prod --env-file=.env.staging --confirm
      DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null)
    else
      echo "Configure your staging deployment"
      exit 1
    fi
    
    # Tag the staging deployment
    git tag -a "staging-$TIMESTAMP" -m "Staging deployment: $TIMESTAMP"
    echo "✅ Staging deployed!"
    ;;
    
  "production")
    echo "🔴 PRODUCTION DEPLOYMENT"
    echo "========================"
    echo "⚠️  This will deploy to PRODUCTION!"
    echo ""
    
    # Extra safety checks for production
    echo "Final checks:"
    echo "- [ ] All tests passing?"
    echo "- [ ] Staging tested?"
    echo "- [ ] Database migrations ready?"
    echo "- [ ] Environment variables set?"
    echo ""
    
    read -p "Type 'DEPLOY TO PRODUCTION' to confirm: " confirm
    if [ "$confirm" != "DEPLOY TO PRODUCTION" ]; then
      echo "❌ Production deployment cancelled"
      exit 1
    fi
    
    # Production deployment
    if [ -f ".env.production" ]; then
      cp .env.production .env.production.local
    fi
    
    if command -v vercel &> /dev/null; then
      vercel --prod --env-file=.env.production --confirm
      DEPLOYMENT_URL=$(vercel ls --json | jq -r '.[0].url' 2>/dev/null)
    else
      echo "Configure your production deployment"
      exit 1
    fi
    
    # Tag the release
    read -p "Version number (e.g., 1.0.0): " VERSION
    git tag -a "v$VERSION" -m "Release version $VERSION

Deployed to production on $(date)
Environment: $ENVIRONMENT"
    
    git push --tags
    echo "✅ Production deployed: v$VERSION"
    ;;
    
  *)
    echo "❌ Unknown environment: $ENVIRONMENT"
    echo "Options: preview, staging, production"
    exit 1
    ;;
esac

# Post-deployment actions
echo ""
echo "📋 Post-deployment Tasks"
echo "------------------------"

# Smoke test
if [ ! -z "$DEPLOYMENT_URL" ]; then
  echo "🔍 Running smoke test..."
  HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOYMENT_URL")
  if [ "$HTTP_STATUS" = "200" ]; then
    echo "✅ Site responding (HTTP $HTTP_STATUS)"
  else
    echo "⚠️  Site returned HTTP $HTTP_STATUS"
  fi
fi

# Create deployment record
cat >> DEPLOYMENTS.md << EOF

## Deployment: $TIMESTAMP
- **Environment**: $ENVIRONMENT
- **Date**: $(date)
- **Commit**: $(git rev-parse --short HEAD)
- **Deployed by**: $(git config user.name)
- **URL**: ${DEPLOYMENT_URL:-"Check deployment platform"}
EOF

echo "📝 Deployment recorded in DEPLOYMENTS.md"

# Notification (optional)
if [ "$ENVIRONMENT" = "production" ]; then
  echo "📧 Send notification to team? (Configure in deploy.sh)"
  # curl -X POST webhook.url -d "Deployed to production"
fi

echo ""
echo "✅ Deployment Complete!"
echo "======================"
echo "Environment: $ENVIRONMENT"
echo "Time taken: $SECONDS seconds"
[ ! -z "$DEPLOYMENT_URL" ] && echo "URL: https://$DEPLOYMENT_URL"
echo ""
echo "Next steps:"
echo "1. Verify deployment at the URL above"
echo "2. Run smoke tests"
echo "3. Monitor error logs"
echo "4. Update team/stakeholders"