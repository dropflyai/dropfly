# INCIDENTS
**Emergency Response, Hotfixes, and Post-Incident Protocol**

---

## Purpose

Production failures require structured response.

This document defines:
- L3 HOTFIX workflow
- rollback procedures
- "Playwright passed but prod failed" recovery
- feature flag guidance
- postmortem requirements

Incidents are not failures. They are learning opportunities.

---

## L3 HOTFIX Flow

**Context:** Production is broken, users are impacted, immediate fix required.

### Step 1: Incident Declaration
- [ ] Confirm production impact (user reports, monitoring alerts, error logs)
- [ ] Declare incident severity (P0 CRITICAL or P1 HIGH)
- [ ] Notify stakeholders (if applicable)
- [ ] Switch to **Process Level: L3 HOTFIX**

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

**Allowed shortcuts during L3 HOTFIX:**
- Skip Artifact Classification (if obvious from context)
- Skip SolutionIndex/Regressions consultation (defer to post-incident)
- Skip Cleanup (defer to post-incident)
- Relaxed verification (manual allowed if automation is too slow)

**Required during L3 HOTFIX:**
- [ ] Evidence of the failure captured
- [ ] Minimal correct fix identified (no scope creep)
- [ ] Fix does not introduce new security vulnerabilities
- [ ] Fix does not expose secrets in logs or commits
- [ ] Smoke test proves fix resolves the failure
- [ ] Smoke test proves fix does not break critical paths

**Forbidden during L3 HOTFIX:**
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
- Create proper fix under L1 BUILD (full rigor)
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
3. **Fix the feature under L1 BUILD**
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
- Shortcuts taken during L3 HOTFIX are pre-justified by Process Level
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
- Full L2 SHIP rigor for production releases
- Gradual rollouts (feature flags, canary deploys)
- Staging environment that mirrors production
- Comprehensive test coverage (unit, integration, E2E)
- Monitoring and alerting for critical paths
- Regular security and dependency audits

---

**Incident response is mandatory. Postmortems are mandatory. Learning is mandatory.**
