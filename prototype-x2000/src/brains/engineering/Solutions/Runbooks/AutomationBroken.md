# Automation Broken -- Operational Runbook

**Purpose:** Structured response procedure when an automation recipe fails.
**Owner:** Engineering Brain
**Severity Range:** SEV-3 (minor delay) to SEV-1 (production pipeline blocked)
**Cross-reference:** `Solutions/SolutionIndex.md`, `Automations/AutomationIndex.md`

---

## 1. Triage

### 1.1 Severity Assessment

Assign severity immediately. Do not begin diagnostics without a severity tag.

| Severity | Criteria | Response Time |
|----------|----------|---------------|
| **SEV-1** | Production pipeline blocked, deploys halted, data at risk | Immediate (drop everything) |
| **SEV-2** | Non-critical automation broken, workaround exists but costly | Within 1 hour |
| **SEV-3** | Convenience automation broken, manual path is quick | Within 4 hours |
| **SEV-4** | Aesthetic or reporting automation, no user impact | Next sprint |

### 1.2 Affected Scope

Determine and document the blast radius before touching anything:

- **Which automation failed?** Name the recipe file (e.g., `Automations/Recipes/Supabase.md`).
- **What triggered it?** Manual invocation, scheduled cron, CI event, webhook.
- **What depends on it?** List downstream automations, deploys, or user flows.
- **Who is affected?** End users, developers, CI pipeline, staging, production.
- **When did it last succeed?** Check the last known good run timestamp.

Record this information in a triage note before proceeding.

---

## 2. Diagnostics

Run these checks in order. Stop at the first clear root cause.

### 2.1 Check Logs

```bash
# Check the automation's own logs first
# Replace <automation-name> with the actual name
cat logs/<automation-name>.log | tail -100

# Check CI/CD logs if automation runs in pipeline
gh run list --limit 5
gh run view <run-id> --log-failed

# Check system logs for resource issues
journalctl --since "1 hour ago" --priority err
```

Look for:
- Explicit error messages or stack traces
- Exit codes (non-zero means failure)
- Timeout messages
- Permission denied errors
- Network connectivity failures

### 2.2 Check Dependencies

Automations rarely fail in isolation. Verify:

- **External services:** Is the API endpoint reachable? Check status pages.
- **Internal services:** Is Supabase up? Is the database responding?
- **Package versions:** Did a dependency update break compatibility?
- **CLI tools:** Are required binaries installed and on PATH?

```bash
# Verify external connectivity
curl -s -o /dev/null -w "%{http_code}" https://api.supabase.com/health

# Verify required tools exist
which node && node --version
which npx && npx --version
which playwright && playwright --version
```

### 2.3 Check Environment

- **Environment variables:** Are all required vars set? Compare against `.env.example`.
- **Credentials/tokens:** Have any expired or been rotated?
- **File permissions:** Can the automation read/write where it needs to?
- **Disk space:** Is the volume full?

```bash
# Check env vars are set (do NOT print values)
env | grep -c SUPABASE_URL
env | grep -c SUPABASE_ANON_KEY

# Check disk space
df -h .

# Check file permissions on critical paths
ls -la <target-directory>
```

### 2.4 Common Failure Modes

| Failure Mode | Signature | Likely Cause |
|-------------|-----------|--------------|
| Timeout | "ETIMEDOUT", "deadline exceeded" | Network issue or resource starvation |
| Auth failure | "401", "403", "permission denied" | Expired token, rotated credentials |
| Not found | "404", "ENOENT", "no such file" | Renamed resource, missing config |
| Conflict | "409", "already exists" | State drift, duplicate run |
| Rate limit | "429", "too many requests" | Automation running too fast |
| OOM | "killed", exit code 137 | Memory limit exceeded |

---

## 3. Temporary Manual Workaround

### 3.1 The Mandatory Documentation Rule

**CRITICAL: Silent manual fallback is FORBIDDEN.**

If you must perform the automation's task manually, you MUST:

1. **Log it.** Create a manual-intervention record immediately.
2. **Tag it.** Mark the record with `MANUAL-FALLBACK` and the date.
3. **Time-box it.** Set a deadline for the automation fix (max 24 hours for SEV-1/2).
4. **Notify.** Alert the team that a manual workaround is active.

### 3.2 Manual Workaround Template

```markdown
## Manual Fallback Record

- **Automation:** [name of broken automation]
- **Date activated:** [YYYY-MM-DD HH:MM UTC]
- **Performed by:** [name]
- **Manual steps taken:**
  1. [step]
  2. [step]
  3. [step]
- **Automation fix deadline:** [YYYY-MM-DD]
- **Risks of manual path:** [what could go wrong]
- **Verification that manual step succeeded:** [evidence]
```

### 3.3 Rules for Manual Workarounds

- The manual workaround is a bridge, not a destination.
- Every manual execution must produce the same output the automation would.
- If the manual path cannot replicate automation output, escalate to SEV-1.
- Track how many times the manual workaround has been invoked. If it exceeds 3 runs, the automation fix is overdue.

---

## 4. Root Cause Analysis

Do not skip this section. Fixing the symptom without finding the cause guarantees recurrence.

### 4.1 Five Whys

Start from the failure and ask "why" five times.

```
1. Why did the automation fail?
   -> The Supabase migration timed out.
2. Why did the migration time out?
   -> The table had a long-running lock.
3. Why was there a long-running lock?
   -> A background job was holding an advisory lock.
4. Why was the background job running during migration?
   -> The migration window was not coordinated with the job scheduler.
5. Why was there no coordination?
   -> The runbook did not include a pre-migration checklist for active jobs.
```

Document all five levels. The fix targets the deepest "why" you can reach.

### 4.2 Fishbone Diagram (Ishikawa)

Categorize potential causes across six axes:

- **People:** Misconfiguration, wrong credentials, manual error
- **Process:** Missing step in runbook, no pre-check, wrong order
- **Technology:** Bug in tool, version incompatibility, API change
- **Environment:** Network, DNS, disk, memory, permissions
- **Data:** Corrupt input, unexpected schema, missing records
- **External:** Third-party outage, rate limit change, API deprecation

Pick the most likely branch and investigate first.

---

## 5. Fix Implementation

### 5.1 Fix the Automation, Not the Symptom

The goal is always to restore the automation to a working state. Acceptable fixes:

- **Update the recipe** to handle the new failure mode.
- **Add retry logic** if the failure is transient.
- **Add pre-checks** if the failure is preventable.
- **Update dependencies** if a version drift caused the break.
- **Fix the environment** if configuration was the root cause.

Unacceptable fixes:

- Permanently replacing the automation with a manual process.
- Adding a silent try/catch that swallows the error.
- Disabling the automation "temporarily" with no fix deadline.

### 5.2 Fix Checklist

Before merging the fix:

- [ ] Root cause is identified and documented
- [ ] Fix addresses the root cause, not just the symptom
- [ ] Fix includes a test or assertion that would catch recurrence
- [ ] Recipe file is updated if the automation's behavior changed
- [ ] No silent error swallowing was introduced
- [ ] The fix has been tested locally or in staging

---

## 6. Verification

### 6.1 Prove the Automation Works Again

Run the automation end-to-end after applying the fix.

```bash
# Run the specific automation recipe
# Replace with actual command for the automation
npx <automation-command> --verbose

# Verify output matches expected result
diff expected-output.json actual-output.json

# Run the full automation suite if available
npm run test:automations
```

### 6.2 Verification Criteria

- [ ] Automation runs to completion without errors
- [ ] Output matches expected results
- [ ] No manual intervention was required during the run
- [ ] Downstream systems received the expected data
- [ ] Logs show clean execution (no warnings that indicate fragility)

### 6.3 Regression Check

- Run the automation three consecutive times to confirm stability.
- If the automation is scheduled, verify the next scheduled run succeeds.
- Monitor for 24 hours after the fix is deployed.

---

## 7. Post-Incident

### 7.1 Update This Runbook

If the failure mode was not covered above, add it:

- Add the new failure mode to the Common Failure Modes table (Section 2.4).
- Add new diagnostic commands if you discovered useful ones.
- Update the Five Whys example if your case is more instructive.

### 7.2 Update SolutionIndex.md

Add an entry to `Solutions/SolutionIndex.md`:

```markdown
| AutomationBroken-<YYYYMMDD> | [brief description] | Runbooks/AutomationBroken.md | [date] |
```

### 7.3 Log to Memory

Add an entry to `Memory/ExperienceLog.md`:

```markdown
## [Date] -- Automation Failure: [automation name]

- **Failure mode:** [what broke]
- **Root cause:** [deepest why]
- **Fix applied:** [what changed]
- **Time to resolve:** [duration]
- **Prevention added:** [what stops recurrence]
```

### 7.4 Notify Stakeholders

- Close any incident tickets or alerts.
- Send a brief summary to the team channel.
- If the failure impacted production users, coordinate with Customer Success Brain.

---

## Quick Reference

```
TRIAGE -> DIAGNOSE -> WORKAROUND (documented!) -> ROOT CAUSE -> FIX -> VERIFY -> POST-INCIDENT
```

**Remember:** Silent manual fallback is forbidden. Fix the automation, not the symptom.
