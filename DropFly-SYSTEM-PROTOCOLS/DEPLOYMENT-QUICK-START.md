# 🚀 DEPLOYMENT QUICK START
> One-command deployment with full version tracking

## ⚡ INSTANT DEPLOYMENT

```bash
# Deploy with automatic versioning and backup
./scripts/backup-deployment.sh

# Or manual version tag first, then deploy
./scripts/git-version-tag.sh patch
vercel --prod
```

## 📋 WHAT HAPPENS AUTOMATICALLY

1. **Version created**: `v1.0.0-20240826-221500`
2. **Git tag**: Creates and pushes tag
3. **Source backup**: Saves to `DEPLOYED-VERSIONS/[version]/`
4. **Vercel deploy**: Deploys with version metadata
5. **URLs saved**: All deployment URLs documented
6. **Recovery ready**: Rollback instructions created

## 🔍 CHECK DEPLOYMENT STATUS

```bash
# See all deployments
vercel ls

# Check current production
cat DEPLOYED-VERSIONS/current-production/version.json

# View deployment log
cat DEPLOYED-VERSIONS/deployment-log.md
```

## 🔄 ROLLBACK IF NEEDED

```bash
# List available versions
ls DEPLOYED-VERSIONS/

# Rollback via Vercel
vercel rollback [deployment-url]

# Or restore from backup
cd DEPLOYED-VERSIONS/v1.0.0-[timestamp]
unzip source-snapshot.zip -d /tmp/restore
```

## 📁 WHERE EVERYTHING IS SAVED

- **All versions**: `DEPLOYED-VERSIONS/`
- **Current production**: `DEPLOYED-VERSIONS/current-production/`
- **Scripts**: `scripts/`
- **Git tags**: Available on GitHub
- **Vercel dashboard**: https://vercel.com/dashboard

---

**Ready to deploy?** Run: `./scripts/backup-deployment.sh`