# SECRETS DETECTION
**Mandatory Pre-Commit Security Gate**

---

## Problem

Secrets committed to git history cause:
- P0 CRITICAL security incidents (public repo exposure)
- GitHub push blocks
- Mandatory secret rotation
- Complex git history rewriting
- Potential data breaches

**Real Incident:** TradeFly project exposed AWS keys and OpenAI API key in public GitHub repo, blocking 80 commits.

---

## Golden Rule

> **NEVER commit secrets. Check BEFORE every commit.**

This is not optional. This is a Security Gate (Checklist C.1).

---

## Pre-Commit Checklist (MANDATORY)

Before EVERY `git commit`:

### Step 1: Visual Inspection
```bash
git diff --cached
```

**Look for:**
- API keys: `api_key=`, `API_KEY=`, `apikey`
- AWS credentials: Lines starting with `AKIA`, `aws_access_key`
- Tokens: `token=`, `TOKEN=`, `bearer`
- Passwords: `password=`, `PASSWORD=`, `pwd`
- Private keys: `-----BEGIN PRIVATE KEY-----`
- JWTs: Strings starting with `eyJ`

**If found → STOP. Do not commit.**

### Step 2: File Pattern Check
```bash
git status
```

**Should NOT see:**
- `.env` files (`.env`, `.env.local`, `.env.master`)
- Credential files (`credentials.json`, `secrets.json`)
- Key files (`*.pem`, `*.key`, `id_rsa*`)
- AWS config (`.aws/`)

**If seen → STOP. Add to .gitignore first.**

### Step 3: .gitignore Verification
```bash
# Test if .env would be ignored
touch .env.test
git status | grep .env.test
rm .env.test

# If it shows up in git status → .gitignore is incomplete
```

---

## If Secrets Are Staged

**Immediate Actions:**

1. **Unstage the file**
```bash
git reset HEAD <file-with-secrets>
```

2. **Add to .gitignore**
```bash
echo "<file-pattern>" >> .gitignore
git add .gitignore
```

3. **Verify it's ignored**
```bash
git status  # Should NOT show the secret file
```

4. **Commit .gitignore update**
```bash
git commit -m "security: add <file-pattern> to .gitignore"
```

---

## Comprehensive .gitignore

Use template: `engineering/.gitignore-template`

**Minimum patterns:**
```gitignore
# Secrets
.env
.env.*
*.env
credentials.json
secrets.json
*-credentials.*
*.pem
*.key
.aws/
*api-key*
*apikey*
```

**Copy to project root:**
```bash
cp engineering/.gitignore-template .gitignore
git add .gitignore
git commit -m "security: add comprehensive .gitignore"
```

---

## If Secrets Already Committed

**DO NOT PUSH. Fix history first.**

### Option A: Last commit only
```bash
# If secrets are in the most recent commit
git reset HEAD~1
# Remove secrets, add to .gitignore, recommit
```

### Option B: BFG Repo-Cleaner (multiple commits)
```bash
brew install bfg

# Backup
git branch backup-before-bfg

# Clone as mirror
cd ..
git clone --mirror <repo-path> repo-clean.git

# Remove secret files from ALL history
bfg --delete-files .env.master repo-clean.git
bfg --delete-files credentials.json repo-clean.git

# Clean up
cd repo-clean.git
git reflog expire --expire=now --all
git gc --prune=now --aggressive

# If not yet pushed to remote
cd <original-repo>
git fetch <path-to-clean-repo>
git reset --hard <clean-branch>
```

### Option C: git-filter-repo (most thorough)
```bash
pip install git-filter-repo

git filter-repo --path .env.master --invert-paths
git filter-repo --path AUTOMATION-GUIDE.md --invert-paths
```

**After cleaning history:**
1. Rotate ALL exposed secrets immediately
2. Force push ONLY if you control all clones
3. If public repo → assume secrets compromised, rotate first

---

## Automated Detection (Future)

**Pre-commit hook** (add to `.git/hooks/pre-commit`):
```bash
#!/bin/bash
# Detect secrets in staged files

SECRETS_FOUND=$(git diff --cached | grep -iE '(api_key|API_KEY|secret|password|token|AKIA|-----BEGIN)')

if [ ! -z "$SECRETS_FOUND" ]; then
  echo "❌ SECURITY: Potential secrets detected in staged files"
  echo "$SECRETS_FOUND"
  echo ""
  echo "Commit blocked. Remove secrets or add to .gitignore first."
  exit 1
fi
```

---

## Severity & Response

**P0 CRITICAL** - Public repo with active secrets
- Response: Immediate secret rotation + history cleaning
- Time: Within 1 hour

**P1 HIGH** - Private repo with secrets in history
- Response: Clean history before next push
- Time: Within 24 hours

**P2 MEDIUM** - Secrets in working directory but not committed
- Response: Add to .gitignore, verify not staged
- Time: Before next commit

---

## Enforcement

- Security Gate C.1 in Checklist.md is MANDATORY
- Skipping = P0 security violation
- Must be checked before EVERY commit
- No exceptions, regardless of Execution Gear

---

## References

- Engineering/Checklist.md - Security Gate C.1
- Engineering/Security.md - Secrets Handling section
- Engineering/Solutions/Regressions.md - Secrets exposure incident

---

**This recipe is mandatory and enforced.**
