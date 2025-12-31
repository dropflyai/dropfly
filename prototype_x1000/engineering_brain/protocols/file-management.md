# File Management Protocol v3.0

**Enterprise-Grade File & Credential Management**

---

## Rule 1: Project Folder Containment

**All project files MUST live inside their project folder. No exceptions.**

```
DropFly-PROJECTS/
└── [project-name]/               # kebab-case, lowercase
    ├── credentials/
    │   ├── .env.example          # ✅ COMMITTED - template with dummy values
    │   ├── .env.local            # ❌ NEVER COMMIT - your machine only
    │   ├── .env.development      # ❌ NEVER COMMIT - shared dev
    │   ├── .env.staging          # ❌ NEVER COMMIT - staging
    │   └── KEYS.md               # ✅ COMMITTED - documents all keys
    ├── src/
    ├── docs/
    │   └── PRD.md
    ├── memory/                   # Project-specific learnings
    │   ├── decisions.md
    │   ├── failures.md
    │   └── patterns.md
    ├── tests/
    ├── package.json
    └── README.md
```

**Forbidden:**
- Saving project files at root level
- Saving project files in another project's folder
- Creating project-related docs outside the project folder
- Storing `.env.production` in repo (use secrets manager)

---

## Rule 2: Environment File Hierarchy

| File | Purpose | Committed? | Location |
|------|---------|------------|----------|
| `.env.example` | Template with dummy values | ✅ YES | `credentials/` |
| `.env.local` | Your machine only | ❌ NEVER | `credentials/` |
| `.env.development` | Shared dev environment | ❌ NEVER | `credentials/` |
| `.env.staging` | Staging environment | ❌ NEVER | `credentials/` |
| `.env.production` | Production secrets | ❌ FORBIDDEN IN REPO | Secrets Manager only |
| `KEYS.md` | Documents what keys exist | ✅ YES | `credentials/` |

**Production secrets source of truth:**
- Vercel Environment Variables (for Vercel deployments)
- AWS Secrets Manager / Parameter Store
- GitHub Secrets (for CI/CD)

---

## Rule 3: Credential Documentation (Mandatory)

Every `credentials/` folder MUST contain `KEYS.md`:

```markdown
# API Keys for [project-name]

## Required Keys

| Variable | Service | Purpose | How to Get |
|----------|---------|---------|------------|
| `SUPABASE_URL` | Supabase | Database connection | Supabase Dashboard → Settings → API |
| `SUPABASE_ANON_KEY` | Supabase | Public API key | Supabase Dashboard → Settings → API |
| `OPENAI_API_KEY` | OpenAI | AI features | platform.openai.com/api-keys |

## Environment-Specific Notes
- **Local**: Use test/dev keys only
- **Staging**: Shared staging instance
- **Production**: Keys in Vercel Environment Variables

## Last Updated: YYYY-MM-DD
```

---

## Rule 4: Shared Resources

**When to use shared credentials:**
- Key is used by 3+ projects
- Key is for shared infrastructure

```
CRITICAL-RESOURCES/
├── shared-credentials/
│   ├── .env.supabase-main       # Shared Supabase instance
│   ├── .env.aws                 # AWS credentials
│   └── SHARED-KEYS.md           # Documents all shared resources
├── ios-certificates/
│   ├── certificate-base64.txt
│   ├── provisioning-profile.txt
│   └── CERTIFICATES.md
├── credential-backups/
│   ├── backup-*.enc            # GPG encrypted
│   └── BACKUP-LOG.md
├── ACCESS-CONTROL.md           # Who has access
├── ROTATION-LOG.md             # Rotation tracking
├── RECOVERY.md                 # Disaster recovery
└── AUDIT-LOG.md                # Access history
```

---

## Rule 5: Project Registry (Mandatory)

Maintain `PROJECT-REGISTRY.md` at root:

```markdown
# DropFly Project Registry

Last Updated: YYYY-MM-DD

## Active Projects

| Project | Type | Status | Deployment | Last Updated |
|---------|------|--------|------------|--------------|
| tradefly-frontend | Web App | Active | Vercel | 2024-12-31 |

## Archived Projects

| Project | Reason | Archived Date |
|---------|--------|---------------|
```

---

## Rule 6: Naming Conventions

| Element | Convention | Example |
|---------|------------|---------|
| Project folders | `kebab-case` | `trade-fly`, `pdf-editor` |
| Environment files | `.env.[environment]` | `.env.local`, `.env.staging` |
| Documentation | `UPPER-CASE.md` for important | `README.md`, `KEYS.md` |
| Source folders | `lowercase` | `src/`, `docs/`, `tests/` |

---

## Rule 7: Root Folder Structure

```
DropFly-OS-App-Builder/
├── .git/
├── .github/                      # GitHub workflows, actions
├── .gitignore
├── CLAUDE.md                     # AI instructions
├── README.md                     # Repo overview
├── PROJECT-REGISTRY.md           # Central project list
│
├── DropFly-PROJECTS/             # ALL applications
├── prototype_x1000/              # AI Brains (frozen)
├── CRITICAL-RESOURCES/           # Shared resources
├── docs/                         # General documentation
├── career/                       # Personal documents
├── archive/                      # Deprecated projects
│
├── packages/                     # Shared code (Turborepo)
├── scripts/                      # Utility scripts
├── package.json                  # Workspaces + tooling
└── turbo.json                    # Monorepo config
```

**Nothing else at root level.**

---

## Rule 8: .gitignore Enforcement

**Mandatory patterns:**

```gitignore
# Environment files - NEVER COMMIT
.env
.env.*
!.env.example
credentials/.env*
!credentials/.env.example

# Shared credentials - NEVER COMMIT
CRITICAL-RESOURCES/shared-credentials/.env*
!CRITICAL-RESOURCES/shared-credentials/.env.example

# Secrets patterns
*.key
*.pem
*-credentials.json
*-secrets.json

# Build artifacts
node_modules/
.next/
out/
dist/
build/
test-results/
```

**Before saving any credential:**
1. Verify pattern is in `.gitignore`
2. Run `git check-ignore [file]` to confirm

---

## Rule 9: No Duplicate Files

**Before creating ANY file:**

1. Search for existing file: `find . -name "filename"`
2. If exists → UPDATE it
3. If doesn't exist → CREATE in correct location

---

## Rule 10: CI/CD Credential Injection

**For GitHub Actions:**
```yaml
env:
  SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
```

**For Vercel:**
- Set in Vercel Dashboard → Project → Settings → Environment Variables

**Rule:** Production credentials NEVER exist in the repo.

---

## Rule 11: Archive Policy

**When to archive:**
- Project hasn't been touched in 90+ days
- Project is replaced by newer version

**Archive process:**
1. Move to `archive/[project-name]/`
2. Add `ARCHIVED.md` with reason and date
3. Update `PROJECT-REGISTRY.md`

---

## Rule 12: Pre-Save Checklist (Mandatory)

Before saving ANY file:

```
[ ] 1. Is this for a specific project? → Save in DropFly-PROJECTS/[project]/
[ ] 2. Is this a credential/secret? → Save in [project]/credentials/
[ ] 3. Is this a shared credential (3+ projects)? → Save in CRITICAL-RESOURCES/shared-credentials/
[ ] 4. Does similar file already exist? → UPDATE it, don't create new
[ ] 5. Am I saving outside DropFly-OS-App-Builder? → STOP, forbidden
[ ] 6. Is this a production secret? → STOP, use secrets manager instead
[ ] 7. Is the file in .gitignore (if sensitive)? → Verify before saving
```

---

## Rule 13: Anti-Patterns (Forbidden Actions)

| Forbidden | Correct Action |
|-----------|----------------|
| Creating files in `/Documents/` outside root | Save in `DropFly-OS-App-Builder/` |
| Multiple `.env` files in same project | Single `.env.local` in `credentials/` |
| Production secrets in repo | Use Vercel/AWS Secrets Manager |
| Project files at monorepo root | Save in `DropFly-PROJECTS/[project]/` |
| Undocumented API keys | Add to `KEYS.md` |
| Creating new key without searching first | Search existing credentials first |
| Inconsistent folder naming | Use `kebab-case` |
| Project not in registry | Add to `PROJECT-REGISTRY.md` |

---

## Rule 14: Automated Secret Scanning

**Pre-commit Hook (Husky + Secretlint):**

```json
// package.json at root
{
  "scripts": {
    "prepare": "husky install"
  },
  "lint-staged": {
    "*": "secretlint"
  }
}
```

**Rule:** No commit succeeds if secrets are detected.

---

## Rule 15: CI/CD Secret Scanning

**GitHub Actions Workflow:**

```yaml
# .github/workflows/secret-scan.yml
name: Secret Scan
on: [push, pull_request]
jobs:
  secret-scan:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: TruffleHog Scan
        uses: trufflesecurity/trufflehog@main
        with:
          extra_args: --only-verified
      - name: Gitleaks Scan
        uses: gitleaks/gitleaks-action@v2
```

---

## Rule 16: Credential Rotation Policy

| Credential Type | Rotation Frequency |
|-----------------|-------------------|
| API Keys | 90 days |
| Database passwords | 90 days |
| JWT secrets | 180 days |
| iOS certificates | Before expiry |

Track in `CRITICAL-RESOURCES/ROTATION-LOG.md`

---

## Rule 17: Credential Backup & Recovery

**Backup Strategy:**
- Encrypted backups in `CRITICAL-RESOURCES/credential-backups/`
- Recovery procedures in `CRITICAL-RESOURCES/RECOVERY.md`

---

## Rule 18: Access Control

Track in `CRITICAL-RESOURCES/ACCESS-CONTROL.md`:
- Who has access to what
- Onboarding/offboarding procedures
- Access expiry dates

---

## Rule 19: Health Checks

**Weekly automated validation:**
- Verify credentials are still valid
- Alert on failures

---

## Rule 20: Monorepo Dependency Management

**Use Turborepo for:**
- Shared packages in `packages/`
- Coordinated builds
- Dependency caching

---

## Rule 21: Audit Logging

Track all credential events in `CRITICAL-RESOURCES/AUDIT-LOG.md`:
- Created
- Rotated
- Accessed
- Revoked

---

**This protocol is binding and enforced.**
