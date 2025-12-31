# VERCEL DEPLOYMENT GUIDE
> 🚀 Complete guide for deploying and tracking Vercel deployments

## 🔧 INITIAL SETUP

### 1. Install Vercel CLI
```bash
npm install -g vercel
```

### 2. Login to Vercel
```bash
vercel login
```

### 3. Link Project
```bash
vercel link
```

---

## 📋 DEPLOYMENT COMMANDS

### Production Deployment
```bash
# Basic production deployment
vercel --prod

# With version tagging
VERSION="v1.0.0-$(date +%Y%m%d-%H%M%S)"
vercel --prod --meta version=$VERSION

# With automatic backup
./scripts/backup-deployment.sh
```

### Preview Deployment
```bash
# Deploy current branch as preview
vercel

# Deploy specific branch
vercel --git-branch feature/new-feature
```

### Rollback Deployment
```bash
# List recent deployments
vercel ls

# Rollback to specific deployment
vercel rollback [deployment-url]

# Rollback using alias
vercel alias [deployment-url] [production-domain]
```

---

## 🔍 VERCEL DEPLOYMENT TRACKING

### Get Deployment Information
```bash
# List all deployments
vercel ls

# Get specific deployment details
vercel inspect [deployment-url]

# Filter by metadata
vercel ls --meta version=v1.0.0
```

### Access Deployment URLs
```bash
# Get current production URL
vercel domains ls

# Get preview URLs
vercel ls | grep Preview
```

---

## 📊 DEPLOYMENT METADATA

### Add Metadata to Deployments
```bash
vercel --prod \
  --meta version="$VERSION" \
  --meta commit="$(git rev-parse HEAD)" \
  --meta branch="$(git branch --show-current)" \
  --meta deployed_by="$(whoami)" \
  --meta timestamp="$(date -u +%Y-%m-%dT%H:%M:%SZ)"
```

### Query Deployments by Metadata
```bash
# Find all deployments of specific version
vercel ls --meta version=v1.0.0

# Find deployments by user
vercel ls --meta deployed_by=username
```

---

## 🔐 ENVIRONMENT VARIABLES

### Set Production Environment Variables
```bash
# Set single variable
vercel env add API_KEY production

# Pull all environment variables
vercel env pull .env.local

# Push environment variables
vercel env push .env.production
```

### Manage Secrets
```bash
# Add secret
vercel secrets add my-secret "secret-value"

# List secrets
vercel secrets ls

# Remove secret
vercel secrets rm my-secret
```

---

## 🏷️ GIT INTEGRATION

### Automatic Deployments
```json
// vercel.json
{
  "git": {
    "deploymentEnabled": {
      "main": true,
      "develop": true,
      "feature/*": false
    }
  }
}
```

### Tag-Based Deployments
```bash
# Create and push tag
git tag -a v1.0.0 -m "Release version 1.0.0"
git push origin v1.0.0

# Deploy specific tag
git checkout tags/v1.0.0
vercel --prod
```

---

## 📁 BACKUP BEFORE DEPLOYMENT

### Manual Backup Process
```bash
# 1. Create version directory
VERSION="v1.0.0-$(date +%Y%m%d-%H%M%S)"
mkdir -p DEPLOYED-VERSIONS/$VERSION

# 2. Save current state
zip -r DEPLOYED-VERSIONS/$VERSION/source.zip . -x "node_modules/*" -x ".next/*"

# 3. Save deployment info
echo "{
  \"version\": \"$VERSION\",
  \"timestamp\": \"$(date -u +%Y-%m-%dT%H:%M:%SZ)\",
  \"git_commit\": \"$(git rev-parse HEAD)\"
}" > DEPLOYED-VERSIONS/$VERSION/info.json

# 4. Deploy
vercel --prod --meta version=$VERSION
```

### Automated Backup (Use Our Script)
```bash
./scripts/backup-deployment.sh
```

---

## 🔄 RECOVERY PROCEDURES

### Recover from Vercel
```bash
# Download deployment source
vercel pull [deployment-url]

# Clone deployment
vercel clone [deployment-url] [local-directory]
```

### Recover from Backup
```bash
# List available backups
ls -la DEPLOYED-VERSIONS/

# Restore specific version
VERSION="v1.0.0-20240120-143022"
cd DEPLOYED-VERSIONS/$VERSION
unzip source-snapshot.zip -d /path/to/restore
```

### Recover from Git
```bash
# List all tags
git tag -l

# Checkout specific version
git checkout tags/v1.0.0

# Redeploy
vercel --prod
```

---

## 📈 MONITORING DEPLOYMENTS

### Vercel Dashboard
- **URL**: https://vercel.com/dashboard
- **Projects**: View all projects
- **Deployments**: See deployment history
- **Analytics**: Monitor performance
- **Logs**: Check function logs

### CLI Monitoring
```bash
# Check deployment status
vercel inspect [deployment-url]

# View logs
vercel logs [deployment-url]

# Check domains
vercel domains ls
```

---

## ⚠️ TROUBLESHOOTING

### Build Failures
```bash
# Check build logs
vercel logs [deployment-url] --type build

# Run build locally first
npm run build
```

### Environment Issues
```bash
# Verify environment variables
vercel env ls production

# Pull and check locally
vercel env pull .env.local
cat .env.local
```

### Domain Issues
```bash
# Check domain configuration
vercel domains inspect [domain]

# Verify DNS
dig [domain]
```

---

## 🎯 BEST PRACTICES

### Before Deployment
1. ✅ Run tests locally
2. ✅ Build successfully: `npm run build`
3. ✅ Check types: `npm run type-check`
4. ✅ Lint code: `npm run lint`
5. ✅ Update version in package.json
6. ✅ Commit all changes
7. ✅ Create Git tag
8. ✅ Run backup script

### During Deployment
1. ✅ Use version metadata
2. ✅ Monitor build logs
3. ✅ Save deployment URL
4. ✅ Document in deployment log

### After Deployment
1. ✅ Verify site is live
2. ✅ Test critical features
3. ✅ Check performance metrics
4. ✅ Update documentation
5. ✅ Archive deployment info

---

## 🔗 QUICK REFERENCE

```bash
# Deploy production with backup
./scripts/backup-deployment.sh

# Quick production deploy
vercel --prod

# List deployments
vercel ls

# Rollback
vercel rollback [url]

# Check logs
vercel logs

# Pull environment
vercel env pull
```

---

Last Updated: [Auto-update]
Vercel CLI Version: Check with `vercel --version`