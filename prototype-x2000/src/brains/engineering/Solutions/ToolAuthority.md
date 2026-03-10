# TOOL AUTHORITY
**Authoritative Sources and Mandatory Tooling**

---

## Purpose

This document defines what sources and tools are authoritative.

If a fact can be retrieved, it must not be assumed.

If an automated tool exists, it must be used.

Tool authority exists to eliminate:
- tool amnesia
- manual fallback loops
- incorrect assumptions
- repeated re-discovery of known solutions

---

## Non-Negotiable Rule

> **Never assume what can be retrieved. Never do manually what can be automated.**

Violations are correctness failures.

---

## Authority: Time and Date

### Rule
Current time and date must be retrieved from an authoritative source, never assumed.

### Allowed Authorities
- system command (e.g., `date`)
- language runtime call (Node/Python)
- cloud provider clock (when running in a managed environment)

### Forbidden
- guessing based on conversation context
- repeating stale dates
- "today" without a retrieved timestamp

### Output Requirement
Whenever time/date is referenced in a decision, include:
- the retrieved timestamp
- the timezone context

---

## Authority: UI Verification

### Rule
UI correctness must be verified via automation.

### Primary Tool
- Playwright is mandatory for UI verification.

### Browser Default
- Chromium is the default browser unless explicitly overridden.

### Forbidden
- asking the user to manually verify UI
- "looks good" without automation evidence
- claiming visual correctness without artifacts

### Evidence Requirement
UI verification must produce artifacts where applicable:
- screenshots
- traces
- console/network error logs

---

## Authority: Logs and Errors

### Rule
If logs can be retrieved automatically, do not ask the user to copy/paste them.

### Allowed Methods
- CLI log retrieval
- script-based extraction
- CI logs
- runtime logs (local/dev/prod, depending on access)

### Forbidden
- "paste the error here" when automated retrieval exists
- iterative guessing without inspecting logs

---

## Authority: Database Changes

### Rule
Database changes must be applied using automation-first workflows.

### Preferred
- migrations via CLI / automation scripts
- MCP-based migration workflows where configured

### Forbidden
- manual copy/paste SQL into web editors when an automated path exists
- asking the user to run manual editor steps as a default workflow

### Emergency Exception
Manual editor usage is allowed only if:
- automation is broken
- the break is documented in a runbook
- a path to restore automation is provided

---

## Authority: Automation First

### Rule
If an automation recipe exists (Engineering/Automations or Engineering/Solutions), it must be used.

If it does not exist and a new automation path is discovered:
- it must be documented as a Golden Path (see Solutions)

---

## Automation Preference Hierarchy

**Mandatory ordering from strongest to weakest automation.**

The agent MUST select the highest available level of automation.

### Hierarchy (Strongest → Weakest)

1. **Native Automation** — existing scripts, CI workflows, runbooks already in the repository
2. **CLI Tools** — official or stable command-line tools (e.g., `supabase`, `gh`, `npx`)
3. **MCP / SDK / API Automation** — programmatic interfaces, MCP servers, SDKs
4. **Headless Browser Automation** — Playwright, Chromium-based automation
5. **One-Off Scripts** — Python, Node, shell scripts created for this specific task
6. **Manual Steps** — LAST RESORT ONLY

### Selection Rules

- The agent MUST select the highest available level.
- **Manual steps are INVALID** if any higher-level automation exists.
- If manual steps are proposed, the agent MUST justify why all higher levels are impossible.
- When a new automation is created (level 5), it MUST be documented in `Engineering/Automations/` for future reuse.

### Enforcement During Preflight

Before proposing any workflow, the agent MUST:
- Consult `Engineering/Automations/AutomationIndex.md`
- Check for existing automation recipes in `Engineering/Solutions/`
- Explicitly state which automation level is being used and why
- If proposing manual steps, prove no automation exists

### Regression Logging

If the agent proposes manual steps for a task that previously had automation:
- This MUST be logged as a regression in `Engineering/Solutions/Regressions.md`
- The correct automation path MUST be re-applied
- The failure to consult prior automation MUST be documented as a governance violation

### Upgrade Path

If the agent discovers a higher-level automation is possible:
- Propose the upgrade
- Document the new automation
- Deprecate the lower-level approach

---

## Why Manual Is a Failure Mode

**Manual workflows are technical debt, not solutions.**

Every manual step:
- Must be repeated
- Can be forgotten
- Introduces human error
- Does not compound learning
- Cannot be verified automatically

Manual steps are acceptable only when:
- Automation is structurally impossible (e.g., legal review, human judgment calls)
- All automation attempts have been exhausted and documented
- A restoration path to automation is defined

Proposing manual steps without justification is a governance violation.

---

## Mandatory Behavior: Capture and Remember

If a tool decision prevents a loop (example: "always use Chromium in Playwright here"), you must:
- add or update the relevant Solutions recipe
- log the prior regression in `Solutions/Regressions.md`

The system must get better over time.

---

**Tool Authority is binding and enforced.**
