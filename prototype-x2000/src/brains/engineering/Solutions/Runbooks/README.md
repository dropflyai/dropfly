# Runbooks -- Index and Usage Guide

**Owner:** Engineering Brain
**Location:** `Solutions/Runbooks/`
**Cross-reference:** `Solutions/SolutionIndex.md`

---

## What Are Runbooks?

Runbooks are operational procedures for responding to specific failure scenarios. Each runbook provides a structured, step-by-step path from detection through resolution to prevention.

Runbooks are not tutorials. They assume the reader is a competent engineer who needs a reliable procedure under pressure.

---

## Runbook Index

| Runbook | When to Use | Severity | First Response |
|---------|-------------|----------|----------------|
| [AutomationBroken.md](AutomationBroken.md) | An automation recipe fails to execute or produces wrong output | SEV-1 to SEV-3 | Triage severity, check logs, document any manual fallback |
| [SupabaseMigrationFailure.md](SupabaseMigrationFailure.md) | A Supabase database migration fails to apply | SEV-1 to SEV-2 | Identify failure mode, check dashboard, never reset production |
| [UITestFailure.md](UITestFailure.md) | Playwright or other UI tests fail in CI or locally | SEV-1 to SEV-3 | Classify failure type (flaky/regression/env/selector), check trace artifacts |
| [TimeDrift.md](TimeDrift.md) | Time synchronization issues cause auth failures, log anomalies, or test failures | SEV-1 to SEV-3 | Measure clock offset, check NTP status, identify affected systems |

---

## How to Use a Runbook

1. **Identify the failure scenario** from the index above.
2. **Open the runbook** and follow it from top to bottom.
3. **Do not skip sections.** Each section builds on the previous one.
4. **Document your findings** as you go -- runbooks require you to record what you discover.
5. **Update the runbook** if you encounter a case it does not cover.

---

## Severity Definitions

| Severity | Definition | Response Time |
|----------|------------|---------------|
| **SEV-1** | Production blocked, users impacted, data at risk | Immediate |
| **SEV-2** | Non-critical system broken, workaround exists | Within 1 hour |
| **SEV-3** | Minor issue, no user impact, convenience feature broken | Within 4 hours |
| **SEV-4** | Cosmetic or reporting issue, no functional impact | Next sprint |

---

## Cross-References

- **SolutionIndex:** Every resolved incident should be logged in `Solutions/SolutionIndex.md` with a reference back to the runbook used.
- **AutomationIndex:** If a runbook leads to a new or updated automation, update `Automations/AutomationIndex.md`.
- **ExperienceLog:** All incidents should be logged in `Memory/ExperienceLog.md` for institutional memory.

---

## Adding a New Runbook

When you encounter a repeatable failure scenario not covered by an existing runbook:

1. Create a new file in `Solutions/Runbooks/` named after the failure scenario (e.g., `APIRateLimitExceeded.md`).
2. Follow this structure:
   - Failure mode identification and taxonomy
   - Diagnostics (what to check, what commands to run)
   - Recovery strategies (ordered from simplest to most involved)
   - Verification (prove the fix works)
   - Prevention (stop it from happening again)
   - Post-incident (update SolutionIndex, log to Memory)
3. Add the new runbook to the index table in this README.
4. Add a reference in `Solutions/SolutionIndex.md`.

---

## Principles

- **Runbooks are living documents.** Update them after every incident.
- **Silent manual fallback is forbidden.** If you work around a problem manually, document it.
- **Fix the root cause, not the symptom.** Runbooks guide you to permanent fixes.
- **Evidence over assertion.** Every fix must be verified with proof.
