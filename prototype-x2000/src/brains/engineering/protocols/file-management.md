# File Management Protocol v4.0

**Enterprise-Grade File & Credential Management**

---

## Rule 1: Every Project Gets Its Own Git Repository

**Each project MUST have its own standalone git repository. No monorepos.**

Every project is initialized with `git init`, gets its own remote on GitHub
(e.g., `dropflyai/[project-name]`), and has its own independent git history,
CI/CD, and deployment pipeline.

**Standard project folder structure:**

```
[project-name]/                   # kebab-case, lowercase
├── .git/                         # OWN git repo
├── .gitignore
├── .env.example                  # ✅ COMMITTED - template with dummy values
├── credentials/
│   ├── .env                      # ❌ NEVER COMMIT - local secrets
│   └── KEYS.md                   # ✅ COMMITTED - documents all keys
├── src/
├── docs/
│   └── PRD.md
├── tests/
├── CLAUDE.md                     # Project-specific AI instructions
├── README.md
└── package.json / pyproject.toml / Cargo.toml / etc.
```

**Forbidden:**
- Putting multiple projects in a single git repository
- Saving project files in another project's folder
- Creating project-related docs outside the project folder
- Storing `.env.production` in repo (use secrets manager)
- Sharing a `.git/` between unrelated projects

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

Maintain `PROJECT-REGISTRY.md` in the local workspace folder (not in any project repo):

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

## Rule 7: Local Workspace & GitHub Organization

**Local workspace** is where you clone/create projects. It is NOT a git repo itself.

```
~/Documents/DropFly-OS-App-Builder/     # Local workspace (NOT a git repo)
├── CLAUDE.md                           # Workspace-level AI instructions
├── PROJECT-REGISTRY.md                 # Central project list
│
├── prototype_x1000/                    # AI Brains (own repo: dropflyai/prototype_x1000)
├── dropfly-agent/                      # Own repo: dropflyai/dropfly-agent
├── fitfly/                             # Own repo: dropflyai/fitfly
├── housing-benefits-gps/               # Own repo: dropflyai/housing-benefits-gps
├── voicefly-v2/                        # Own repo: dropflyai/voicefly-v2
└── [any-new-project]/                  # Own repo: dropflyai/[project-name]
```

**GitHub organization:** `dropflyai` (or your org)
- Each project = one repo under the org
- Each repo has its own CI/CD, issues, PRs, releases
- The brain system (`prototype_x1000`) is its own repo too

**When creating a new project:**
1. Create project folder locally
2. `git init` inside it
3. `gh repo create dropflyai/[project-name] --private --source=.`
4. Set up `.gitignore`, `CLAUDE.md`, `README.md`
5. Add to local `PROJECT-REGISTRY.md`

**Forbidden:**
- Using the workspace folder as a git repo
- Putting multiple projects under a single `.git/`
- Monorepo patterns (Turborepo, Lerna, Nx) for unrelated projects
- Sharing git history between independent projects

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
[ ] 1. Is this for a specific project? → Save inside that project's own repo
[ ] 2. Is this a credential/secret? → Save in [project]/credentials/ (gitignored)
[ ] 3. Am I saving to the correct git repo? → Each project has its OWN repo
[ ] 4. Does similar file already exist? → UPDATE it, don't create new
[ ] 5. Is this a production secret? → STOP, use secrets manager instead
[ ] 6. Is the file in .gitignore (if sensitive)? → Verify before saving
[ ] 7. Am I mixing files from different projects? → STOP, that's forbidden
```

---

## Rule 13: Anti-Patterns (Forbidden Actions)

| Forbidden | Correct Action |
|-----------|----------------|
| Creating files in `/Documents/` outside root | Save in `DropFly-OS-App-Builder/` |
| Multiple `.env` files in same project | Single `.env.local` in `credentials/` |
| Production secrets in repo | Use Vercel/AWS Secrets Manager |
| Multiple projects in one git repo | Each project gets its own repo |
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

## Rule 20: Cross-Project Dependencies

**When projects need to share code:**
- Publish shared code as a private npm/pip package
- Use GitHub Packages or a private registry
- Reference by version, not by file path

**NEVER:**
- Import code from another project via relative paths (`../../other-project/`)
- Use monorepo tools (Turborepo, Lerna, Nx) to link unrelated projects
- Share `node_modules` or virtual environments between projects

---

## Rule 21: Audit Logging

Track all credential events in `CRITICAL-RESOURCES/AUDIT-LOG.md`:
- Created
- Rotated
- Accessed
- Revoked

---

**This protocol is binding and enforced.**
