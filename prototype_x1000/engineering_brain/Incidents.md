# INCIDENTS
**Emergency Response, Hotfixes, and Post-Incident Protocol**

---

## Purpose

Production failures require structured response.

This document defines:
- GEAR: HOTFIX workflow
- rollback procedures
- "Playwright passed but prod failed" recovery
- feature flag guidance
- postmortem requirements

Incidents are not failures. They are learning opportunities.

---

## GEAR: HOTFIX Flow

**Context:** Production is broken, users are impacted, immediate fix required.

### Step 1: Incident Declaration
- [ ] Confirm production impact (user reports, monitoring alerts, error logs)
- [ ] Declare incident severity (P0 CRITICAL or P1 HIGH)
- [ ] Notify stakeholders (if applicable)
- [ ] Switch to **Execution Gear: HOTFIX**

### Step 2: Rapid Assessment
- [ ] Identify what is broken (specific feature, page, API, workflow)
- [ ] Identify when it broke (recent deploy? external dependency?)
- [ ] Capture evidence (logs, error messages, screenshots, user reports)
- [ ] Determine if rollback is faster than hotfix

### Step 3: Choose Response

**Option A: Rollback (Fastest)**
- If recent deploy caused the issue
- If root cause is unclear
- If hotfix will take too long
- See "Rollback Strategy" below

**Option B: Hotfix (Targeted Fix)**
- If root cause is known
- If rollback is not possible (database migrations, external dependencies)
- If fix is simple and fast (< 30 minutes)
- See "Hotfix Checklist" below

### Step 4: Deploy Fix or Rollback
- [ ] Apply fix or rollback
- [ ] Deploy to production
- [ ] Verify fix resolves the reported failure (smoke test critical paths)
- [ ] Monitor for new failures introduced by hotfix

### Step 5: Post-Incident Review (Mandatory)
- [ ] Schedule postmortem within 24-48 hours
- [ ] Document what broke, why, and how it was fixed
- [ ] Identify what was skipped during hotfix (tests, cleanup, memory updates)
- [ ] Create follow-up tasks for deferred work
- [ ] Update Regressions.md if failure could have been prevented

---

## Hotfix Checklist

**Allowed shortcuts during GEAR: HOTFIX:**
- Skip Artifact Classification (if obvious from context)
- Skip SolutionIndex/Regressions consultation (defer to post-incident)
- Skip Cleanup (defer to post-incident)
- Relaxed verification (manual allowed if automation is too slow)

**Required during GEAR: HOTFIX:**
- [ ] Evidence of the failure captured
- [ ] Minimal correct fix identified (no scope creep)
- [ ] Fix does not introduce new security vulnerabilities
- [ ] Fix does not expose secrets in logs or commits
- [ ] Smoke test proves fix resolves the failure
- [ ] Smoke test proves fix does not break critical paths

**Forbidden during GEAR: HOTFIX:**
- Adding new features ("while we're here...")
- Refactoring unrelated code
- Skipping verification entirely
- Ignoring security implications

---

## Rollback Strategy

**When to Rollback:**
- Recent deploy caused the issue
- Root cause is unclear or complex
- Hotfix will take too long (> 1 hour)
- Risk of hotfix introducing new failures is high

### Rollback Procedure
1. **Identify last known good version** (git tag, commit hash, deploy timestamp)
2. **Confirm rollback is safe:**
   - [ ] No database migrations in broken deploy (or migrations are reversible)
   - [ ] No data corruption risk from rolling back
   - [ ] External dependencies still compatible
3. **Execute rollback:**
   - [ ] Deploy previous version
   - [ ] Run smoke tests on critical paths
   - [ ] Monitor logs for errors
4. **Verify rollback success:**
   - [ ] Confirm reported failure is resolved
   - [ ] Confirm no new failures introduced

### Rollback + Forward Fix
After rollback:
- Root cause analysis (why did it break?)
- Create proper fix under GEAR: BUILD (full rigor)
- Test thoroughly before re-deploying
- Update Regressions.md

---

## "Playwright Passed But Prod Failed" Checklist

**Symptom:** All tests passed, but production broke.

This indicates a gap between test environment and production reality.

### Immediate Response
1. **Rollback if critical** (see Rollback Strategy)
2. **Identify the gap:**
   - [ ] Environment difference (staging vs prod config)
   - [ ] Data difference (test data vs prod data)
   - [ ] External dependency difference (API version, CDN, third-party service)
   - [ ] Scale difference (test had 10 users, prod has 10,000)
   - [ ] Network difference (test on localhost, prod on slow networks)

### Root Cause Analysis
- [ ] What did Playwright miss?
- [ ] Why did it miss it?
- [ ] How can tests be improved to catch this?

### Prevention (Mandatory Post-Incident)
- [ ] Add test coverage for the failure scenario
- [ ] Update test environment to match production more closely
- [ ] Add monitoring/alerting for this failure mode
- [ ] Update Verification Semantics if tests were checking the wrong thing
- [ ] Log as regression in `Engineering/Solutions/Regressions.md`

---

## Feature Flag Guidance

**Use feature flags to reduce incident risk.**

### When to Use Feature Flags
- Risky changes (new architecture, major refactor)
- Gradual rollouts (test with 5% of users before 100%)
- A/B testing (compare old vs new implementation)
- Kill switches (disable feature remotely if it breaks)

### Feature Flag Best Practices
- **DO:**
  - Default flags to "off" for new features
  - Test both flag states (on/off)
  - Remove flags after rollout completes
  - Document flag purpose and owner

- **DON'T:**
  - Leave flags in code indefinitely (tech debt)
  - Use flags as permanent configuration
  - Nest flags deeply (creates combinatorial complexity)

### Emergency Flag Usage
If a feature breaks in production:
1. **Disable via feature flag** (if available)
2. **Verify disabling resolves the issue**
3. **Fix the feature under GEAR: BUILD**
4. **Re-enable after thorough testing**

---

## Postmortem Template

**Required within 24-48 hours of any P0/P1 incident.**

### Incident Summary
- **Date/Time:** When did it happen?
- **Duration:** How long was production impacted?
- **Severity:** P0 CRITICAL / P1 HIGH
- **User Impact:** How many users affected? What functionality was broken?

### Timeline
- **Detection:** How was the incident discovered?
- **Response:** What actions were taken?
- **Resolution:** How was it fixed (hotfix or rollback)?
- **Verification:** How was fix verified?

### Root Cause
- **What broke:** Technical description of the failure
- **Why it broke:** Underlying cause (code bug, config error, external dependency, etc.)
- **Why it wasn't caught:** Why did tests/staging not catch this?

### What Was Skipped During Hotfix
- [ ] Tests
- [ ] Cleanup
- [ ] Memory updates
- [ ] Full verification

### Follow-Up Actions
- [ ] Add test coverage for this failure scenario
- [ ] Complete deferred work (tests, cleanup, memory)
- [ ] Update Regressions.md
- [ ] Improve monitoring/alerting
- [ ] Document lessons learned

### Lessons Learned
- What went well?
- What went poorly?
- What will we do differently next time?

---

## Who Decides During Incidents

### Rollback vs Hotfix Decision
- **If unclear:** Default to rollback (safer)
- **If on-call engineer exists:** On-call decides
- **If no on-call:** Most senior available engineer decides
- **If solo engineer:** Use judgment; document decision

### Justified Violation Usage During Incidents
- Incidents are the primary use case for Justified Violations
- Shortcuts taken during GEAR: HOTFIX are pre-justified by Execution Gear
- Document all shortcuts in postmortem
- All deferred work must be tracked and completed post-incident

### Severity Escalation
- User can escalate severity if impact is worse than initially assessed
- Engineer can de-escalate if root cause is less severe than initially thought
- When in doubt, escalate (better safe than sorry)

---

## Incident Prevention

The best incident response is preventing incidents.

**Prevention strategies:**
- Full GEAR: SHIP rigor for production releases
- Gradual rollouts (feature flags, canary deploys)
- Staging environment that mirrors production
- Comprehensive test coverage (unit, integration, E2E)
- Monitoring and alerting for critical paths
- Regular security and dependency audits

---

**Incident response is mandatory. Postmortems are mandatory. Learning is mandatory.**

---

## Incident Log

### P0 CRITICAL - Exposed Secrets in Public GitHub Repository (2025-12-22)

#### Incident Summary
- **Date/Time:** December 22, 2025, ~09:00 PST
- **Duration:** ~3 hours (detection to resolution)
- **Severity:** P0 CRITICAL - Active credentials exposed in public repository
- **User Impact:** Security risk - Active AWS Access Key, AWS Secret Access Key, and OpenAI API Key exposed in public GitHub repository (dropflyai/dropfly)
- **Repository State:** 80 commits ahead of origin, unable to push due to GitHub Secret Scanning protection

#### Timeline
- **Detection:** User discovered GitHub blocking push with message about secret exposure in .env.master and AUTOMATION-GUIDE.md
- **Response:**
  1. Immediately rotated all exposed secrets (AWS keys, OpenAI API key)
  2. User confirmed old keys deactivated, new keys active
  3. Created backup branch: `backup-before-bfg`
  4. Installed BFG Repo-Cleaner
  5. Created mirror clone and ran BFG to remove .env.master (169 commits) and AUTOMATION-GUIDE.md (65 commits)
  6. Encountered issue: BFG protected HEAD commit, files still present
  7. Manually removed files from working directory, committed removal
  8. Created fresh mirror clone (clean2)
  9. Ran BFG again on clean mirror - successfully removed both files
  10. Ran aggressive git gc to purge orphaned objects
  11. Fetched cleaned history into working directory
  12. Reset working directory to cleaned main branch
- **Resolution:** Force pushed cleaned history to GitHub (successful - no secret detection)
- **Verification:**
  - Verified files removed from working directory (ls check failed as expected)
  - Verified files removed from git history (git log check returned empty)
  - Verified files not in current HEAD (git show failed as expected)
  - GitHub accepted force push without secret detection warnings
  - Added comprehensive .gitignore with security-first patterns
  - Pushed .gitignore to prevent future exposure

#### Root Cause
- **What broke:** `.env.master` (lines 34, 35, 43) and `AUTOMATION-GUIDE.md` (lines 141, 142) containing active AWS and OpenAI credentials were committed to public repository
- **Why it broke:**
  1. No pre-commit secrets detection gate in Engineering Brain governance
  2. Existing .gitignore lacked comprehensive patterns (.env.master not explicitly ignored)
  3. No automated secrets scanning in local workflow
- **Why it wasn't caught:**
  1. .gitignore had basic patterns (.env, .env.local) but not .env.* or .env.master
  2. No pre-commit hooks for secret detection
  3. GitHub Secret Scanning only activated at push time (not during commit)

#### What Was Skipped During Hotfix
- [x] Artifact Classification (not applicable for security incident)
- [x] SolutionIndex consultation (pre-commit secrets gate already existed in Checklist.md from previous incident)
- [x] Full test suite (verification limited to smoke tests of git history cleanup)
- [x] Cleanup (temporary mirror repositories left in /Users/rioallen/Documents/)

#### Follow-Up Actions
- [x] Add comprehensive .gitignore with security-first patterns (COMPLETED)
- [x] Update Checklist.md with mandatory Security Gate C.1 (ALREADY EXISTS from previous incident on 2025-12-22)
- [ ] Add pre-commit hooks for automated secrets detection (gitleaks, git-secrets, or detect-secrets)
- [ ] Clean up temporary mirror repositories (DropFly-OS-App-Builder-clean.git, DropFly-OS-App-Builder-clean2.git)
- [ ] Update Engineering/Solutions/Regressions.md if not already logged
- [ ] Audit all other environment files (.env.development, .env.production) to ensure not committed
- [ ] Consider GitHub secret scanning alerts for future prevention

#### Lessons Learned
- **What went well:**
  - Immediate secret rotation prevented unauthorized access
  - BFG Repo-Cleaner successfully removed secrets from 196 commits
  - Checklist.md already had Security Gate C.1 from previous incident (added earlier same day)
  - GitHub Secret Scanning prevented exposure of 80 commits worth of secrets
  - Systematic approach (backup → clean → verify → push) prevented data loss

- **What went poorly:**
  - BFG protected HEAD commit on first attempt, requiring second cleanup pass
  - Initial .gitignore insufficient despite being a known security critical file type
  - Security gate existed in governance but was not enforced in practice

- **What will we do differently next time:**
  - Enforce Security Gate C.1 BEFORE every commit (make it non-skippable)
  - Add automated pre-commit hooks (not just manual checklist items)
  - Audit .gitignore quarterly to ensure comprehensive coverage
  - Never commit .env.* files regardless of name (use .env.example templates instead)
  - Consider local git hooks that run automatically before commit

#### Resolution Artifacts
- **Backup branch:** `backup-before-bfg` (preserves pre-cleanup history)
- **Cleaned commits:** 196 commits cleaned, 3 object IDs changed
- **Files removed:** `.env.master` (2.5 KB), `AUTOMATION-GUIDE.md` (9.4 KB)
- **Final commit:** bbac62d (security .gitignore added)
- **Force push:** 7ecc159 (cleaned history on GitHub)

#### Security Impact Assessment
- **Exposure duration:** Unknown (repository was public)
- **Affected credentials:**
  - AWS Access Key ID (REDACTED)
  - AWS Secret Access Key (REDACTED)
  - OpenAI API Key (REDACTED)
- **Mitigation:** All credentials rotated and deactivated immediately
- **Risk:** P0 - Credentials were active and public, potential for unauthorized AWS resource usage and OpenAI API abuse
- **Post-rotation risk:** P4 - Old credentials deactivated, new credentials not exposed

---
