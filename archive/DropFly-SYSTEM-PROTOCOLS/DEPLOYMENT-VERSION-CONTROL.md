# DEPLOYMENT VERSION CONTROL SYSTEM
> 🚀 CRITICAL: Track and access every deployed version

## 🎯 DEPLOYMENT TRACKING PROTOCOL

### BEFORE EVERY DEPLOYMENT:
1. **Create Version Snapshot**
2. **Tag in Git**
3. **Archive Current State**
4. **Document Deployment**
5. **Save Vercel URLs**

---

## 📁 VERSION ARCHIVE STRUCTURE

```
/DEPLOYED-VERSIONS/
├── current-production/
│   ├── version.json (current live version info)
│   ├── deployment-urls.md
│   └── rollback-instructions.md
├── v1.0.0-2024-01-20/
│   ├── source-snapshot.zip
│   ├── deployment-info.json
│   ├── vercel-urls.md
│   ├── git-commit.txt
│   └── environment-vars.md
├── v1.0.1-2024-01-21/
│   └── [same structure]
└── deployment-log.md (master log)
```

---

## 🔄 DEPLOYMENT WORKFLOW

### Step 1: Pre-Deployment Snapshot
```bash
# Create version tag
VERSION="v1.0.0-$(date +%Y%m%d-%H%M%S)"
echo $VERSION > version.txt

# Create Git tag
git tag -a $VERSION -m "Deploy: $VERSION"
git push origin $VERSION

# Archive current source
zip -r DEPLOYED-VERSIONS/$VERSION/source-snapshot.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*"
```

### Step 2: Deploy to Vercel
```bash
# Deploy with version tag
vercel --prod --meta version=$VERSION

# Capture deployment URL
vercel ls --meta version=$VERSION > deployment-url.txt
```

### Step 3: Post-Deployment Documentation
```bash
# Save deployment info
cat > DEPLOYED-VERSIONS/$VERSION/deployment-info.json << EOF
{
  "version": "$VERSION",
  "deployed_at": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)",
  "vercel_url": "$(cat deployment-url.txt)",
  "node_version": "$(node -v)",
  "npm_version": "$(npm -v)"
}
EOF
```

---

## 📊 DEPLOYMENT TRACKING TEMPLATE

```markdown
## Deployment: [VERSION]
**Date**: [YYYY-MM-DD HH:MM:SS]
**Deployer**: [Name/System]
**Environment**: Production

### URLs
- **Production**: https://[your-app].vercel.app
- **Preview**: https://[your-app]-[hash].vercel.app
- **Git Tag**: https://github.com/[user]/[repo]/releases/tag/[version]

### Changes in This Version
- [Feature/Fix 1]
- [Feature/Fix 2]

### Verification
- [ ] Build successful
- [ ] Types check passed
- [ ] Lint passed
- [ ] Deployment live
- [ ] Smoke test passed

### Rollback Command
```bash
vercel rollback [deployment-id]
```
```

---

## 🔐 VERCEL ACCESS TRACKING

### Production Deployments
```markdown
| Version | Date | Vercel URL | Git Commit | Status |
|---------|------|------------|------------|--------|
| v1.0.0 | 2024-01-20 | https://app-abc123.vercel.app | a1b2c3d | Live |
| v0.9.9 | 2024-01-19 | https://app-def456.vercel.app | e4f5g6h | Archived |
```

### Preview Deployments
```markdown
| Branch | Date | Preview URL | Expires |
|--------|------|-------------|---------|
| feature/x | 2024-01-20 | https://app-ghi789.vercel.app | 30 days |
```

---

## 🛠️ VERSION RECOVERY COMMANDS

### Access Specific Version
```bash
# Checkout Git tag
git checkout tags/v1.0.0

# Or download from archive
unzip DEPLOYED-VERSIONS/v1.0.0-*/source-snapshot.zip -d recovered-version/
```

### Rollback to Previous Version
```bash
# Via Vercel CLI
vercel rollback [deployment-id]

# Via Git
git checkout tags/[previous-version]
vercel --prod
```

### Compare Versions
```bash
# Diff between versions
git diff v1.0.0 v1.0.1

# Check deployment history
vercel ls
```

---

## 🔄 AUTOMATIC VERSION BACKUP SCRIPT

Create `scripts/backup-deployment.sh`:
```bash
#!/bin/bash

# Auto-generate version
VERSION="v$(cat package.json | grep version | cut -d '"' -f 4)-$(date +%Y%m%d-%H%M%S)"
BACKUP_DIR="DEPLOYED-VERSIONS/$VERSION"

# Create backup directory
mkdir -p $BACKUP_DIR

# Save current state
echo "Backing up version $VERSION..."

# 1. Git tag
git tag -a $VERSION -m "Auto-backup: $VERSION"
git push origin $VERSION

# 2. Source snapshot
zip -r $BACKUP_DIR/source-snapshot.zip . \
  -x "node_modules/*" \
  -x ".next/*" \
  -x ".git/*" \
  -x "DEPLOYED-VERSIONS/*"

# 3. Save deployment info
cat > $BACKUP_DIR/deployment-info.json << EOF
{
  "version": "$VERSION",
  "timestamp": "$(date -u +%Y-%m-%dT%H:%M:%SZ)",
  "git_commit": "$(git rev-parse HEAD)",
  "git_branch": "$(git branch --show-current)",
  "package_version": "$(cat package.json | grep version | cut -d '"' -f 4)"
}
EOF

# 4. Deploy to Vercel
vercel --prod --meta version=$VERSION > $BACKUP_DIR/deployment.log

# 5. Save URLs
echo "## Deployment URLs" > $BACKUP_DIR/vercel-urls.md
vercel ls | head -5 >> $BACKUP_DIR/vercel-urls.md

echo "✅ Version $VERSION backed up and deployed!"
```

---

## 📝 DEPLOYMENT CHECKLIST

### Before Deploy:
- [ ] All changes committed to Git
- [ ] Version number updated in package.json
- [ ] Tests passing
- [ ] Build successful locally
- [ ] Environment variables verified

### During Deploy:
- [ ] Create Git tag
- [ ] Archive source code
- [ ] Run deployment command
- [ ] Capture deployment URLs
- [ ] Document in deployment log

### After Deploy:
- [ ] Verify site is live
- [ ] Test critical features
- [ ] Update deployment tracking
- [ ] Archive deployment info
- [ ] Notify team if needed

---

## 🚨 EMERGENCY RECOVERY

### If Vercel deployment lost:
1. Check `DEPLOYED-VERSIONS/[version]/vercel-urls.md`
2. Access via Git tag: `git checkout tags/[version]`
3. Redeploy: `vercel --prod`

### If Git repository lost:
1. Restore from `DEPLOYED-VERSIONS/[version]/source-snapshot.zip`
2. Reinitialize Git
3. Push to new repository

### If everything lost:
1. Access Vercel dashboard: https://vercel.com/dashboard
2. Download deployment source
3. Check GitHub releases page
4. Restore from local backups

---

## 🔗 INTEGRATION WITH EXISTING SYSTEMS

### Update these files after deployment:
- `/CRITICAL-RESOURCES/urls-endpoints.md` - Add production URL
- `/CRASH-RECOVERY/last-known-good-state.md` - Update with new version
- `/DEPLOYMENT-STATUS.md` - Update current status

---

Last Updated: [Auto-update on deployment]
Version Control Active: ✅