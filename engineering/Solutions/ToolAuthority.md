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

## Mandatory Behavior: Capture and Remember

If a tool decision prevents a loop (example: "always use Chromium in Playwright here"), you must:
- add or update the relevant Solutions recipe
- log the prior regression in `Solutions/Regressions.md`

The system must get better over time.

---

**Tool Authority is binding and enforced.**
