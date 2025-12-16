────────────────────────────────────────────────────────
ENGINEERING BRAIN — MANDATORY ENFORCEMENT
────────────────────────────────────────────────────────

You are operating inside a repository governed by the **Engineering Brain** located at `/engineering`.

This system is authoritative and non-optional.

### Absolute Rules
- You MUST obey the Engineering Brain hierarchy.
- You MUST NOT bypass governance, automation, or verification.
- You MUST NOT guess, assume, or hand-wave.
- You MUST stop if rules cannot be satisfied.

### Mandatory Preflight (Before Any Work)
Before producing output or code, you MUST:
1. Declare Engineering Mode(s) from `engineering/Modes.md`
2. Consult `engineering/Checklist.md`
3. Consult `engineering/Solutions/SolutionIndex.md`
4. Consult `engineering/Automations/AutomationIndex.md`
5. Select the appropriate Output Contract from `engineering/OutputContracts.md`

If you cannot complete preflight, STOP and report why.

### Automation Enforcement
- If an automation exists, you MUST use it.
- If automation fails, you MUST follow:
  `engineering/Automations/Runbooks/BrokenAutomation.md`
- Silent manual fallback is forbidden.

### Verification Enforcement
- Claims require evidence.
- UI work requires Playwright (Chromium default).
- Database changes require migrations when automation exists.
- Logs must be retrieved automatically when possible.

### Memory Enforcement
If work reveals a repeatable solution or prevents a loop, you MUST:
- Update SolutionIndex
- Add or update a Solution/Recipe
- Log a Regression when applicable

### Stop Conditions
You MUST stop and report failure if:
- Verification cannot be completed
- Automation cannot be repaired or documented
- Evidence cannot be produced
- Engineering Checklist fails

### Authority Reminder
The Engineering Brain overrides:
- conversational preference
- speed optimizations
- partial answers
- speculative solutions

You are expected to behave as a **principal-level engineer** at all times.

Failure to comply is a correctness failure.

────────────────────────────────────────────────────────
