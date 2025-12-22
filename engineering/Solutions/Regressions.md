# REGRESSIONS
**Failure Memory and Loop Prevention**

---

## Purpose

This document records known failure loops and regressions.

Once a regression is logged here:
- it must never occur again
- recurrence is treated as a system failure
- the corrective solution becomes mandatory

This file exists to eliminate:
- repeated mistakes
- forgotten tooling
- manual fallback loops
- wasted time re-solving solved problems

---

## Enforcement Rule

> **A logged regression may not reoccur.**

If it does:
- the task must stop
- the failure must be acknowledged
- the Solution Index and Golden Path must be re-validated

---

## What Counts as a Regression

A regression includes (but is not limited to):

- reverting from automation to manual steps
- asking the user to copy/paste logs or errors that can be retrieved
- forgetting mandatory tooling (Playwright, Chromium, CLI workflows)
- assuming time/date instead of retrieving it
- reintroducing deleted dead code
- repeating a previously solved debugging loop

---

## Required Regression Entry Format

Each regression entry must include:

### <Regression Title>
- **Symptom:** What happened
- **Root Cause:** Why it occurred
- **Incorrect Behavior:** What was done wrong
- **Correct Solution:** What must be done instead
- **Enforced Path:** Link to Golden Path / Recipe
- **Prevention Mechanism:** How this prevents recurrence
- **Date Logged:**
- **Logged By:**

Incomplete entries are invalid.

---

## Example (Template Only)

### Manual Supabase Editor Fallback
- **Symptom:** Suggested pasting SQL into Supabase editor
- **Root Cause:** Automation path not consulted
- **Incorrect Behavior:** Manual copy/paste recommendation
- **Correct Solution:** Use CLI/MCP migration workflow
- **Enforced Path:** Engineering/Solutions/Recipes/Supabase.md
- **Prevention Mechanism:** ToolAuthority + Golden Path
- **Date Logged:** YYYY-MM-DD
- **Logged By:** Engineering Brain

---

## Mandatory Usage

Whenever a repeated failure loop is detected:
1. Stop the task
2. Log the regression here
3. Link the enforced solution
4. Update SolutionIndex if needed
5. Resume only after correction

---

## System Goal

> **No failure is allowed to happen twice without being recorded and prevented.**

Over time, this file should grow while failures disappear.

---

## Governance Violations (Auto-Log)

**Mandatory self-reporting of Engineering Brain rule violations.**

The agent MUST log governance violations when detected or corrected.

### What Qualifies as a Governance Violation

A governance violation occurs when the agent:
- Declares multiple primary modes (violates `Engineering/Modes.md`)
- Proceeds without explicit artifact type declaration (violates `Engineering/OutputContracts.md`)
- Plans verification strategy misaligned with declared artifact type
- Proposes manual verification where automated verification exists
- Makes assumptions without retrieving repo evidence (file existence, dependencies, structure)
- Makes navigation or routing assumptions later corrected by user or evidence
- Skips preflight checklist steps (violates `Engineering/Checklist.md`)
- Bypasses automation when automation exists (violates `Engineering/Automations/`)

### When Logging Is Required

Logging is **mandatory** when:
- A violation is detected mid-task and corrected
- A user corrects an architectural or planning error
- A verification strategy must be revised due to artifact type mismatch
- An assumption is proven incorrect by evidence
- A governance rule is bypassed and later enforced

### Required Entry Format

Each governance violation entry MUST include:

**### <Violation Title>**
- **Date/Time:** YYYY-MM-DD HH:MM
- **Task/Context:** Brief description of what was being attempted
- **Rule Violated:** Which Engineering Brain rule was broken (with file reference)
- **Why It Happened:** Root cause (assumption, incomplete preflight, misread requirements)
- **Corrective Action Taken:** What was done to fix the violation
- **Preventative Rule/Pattern Added:** Link to updated SolutionIndex, Recipe, or Golden Path

Incomplete entries are invalid.

### Consultation Requirement

During preflight, the agent MUST:
- Search this section for governance violations matching the current task type
- Apply preventative patterns from previous violations
- If a similar violation has occurred previously, apply the logged preventative rule immediately

### Escalation Rule

If the same governance violation occurs **more than twice**:
- A mandatory constraint MUST be added to `Engineering/Solutions/SolutionIndex.md`
- The constraint becomes a hard gate in the relevant checklist
- Further violations are treated as system corruption

---

## Logged Violations

### PDF Form Field Font Sizing - Minimum Constraint Causing Overflow
- **Date/Time:** 2025-12-20 08:45
- **Task/Context:** Fixing mobile PDF form field text rendering on pdfdocsign.com
- **Rule Violated:** Made multiple font scaling changes without evidence-based testing (Checklist.md - Evidence Discipline)
- **Why It Happened:** Applied fixes based on visual inspection of screenshots rather than measuring actual field dimensions and font sizes
- **Corrective Action Taken:**
  - Created automated test on iPhone 17 Pro Max Safari WebKit
  - Measured actual field heights (5px) vs font sizes (8px = 160% overflow)
  - Removed Math.max(..., 8) minimum font constraint
  - Changed scaling from 45% to 70% of field height
  - Evidence: Field height=5.0px now gets fontSize=3.5px (70% fit)
- **Preventative Rule/Pattern Added:**
  - Always test font scaling with actual device dimensions
  - Never apply hard minimums that can override container constraints
  - Use Playwright + Safari WebKit for iOS-specific testing
  - Capture field measurements (bounding box + computed styles) before making changes

### Time/Effort Estimates in Preflight Plans
- **Date/Time:** 2025-12-16 15:27
- **Task/Context:** Trading Signals page preflight planning
- **Rule Violated:** Included time estimates in plan output (no explicit rule exists yet; identified by user correction)
- **Why It Happened:** No explicit prohibition in current OutputContracts.md; assumed estimates aid user planning
- **Corrective Action Taken:** Removed all time/effort estimates from plan sections
- **Preventative Rule/Pattern Added:** Do not include time estimates in preflight or final plans unless explicitly requested

### Mobile-Specific Changes Applied Globally - Desktop Breakage
- **Date/Time:** 2025-12-20 10:25
- **Task/Context:** Fixing mobile PDF form field responsiveness on pdfdocsign.com
- **Rule Violated:** Changed global field detection logic (constructor.name check) without testing impact on all platforms (Checklist.md - Evidence Discipline, Verification semantics)
- **Why It Happened:**
  - Task was "fix mobile responsiveness" but modified code that runs on ALL platforms
  - Added `|| fieldConstructor === 'e'` check globally (commits edf141c, fdb8bd9)
  - Did not verify desktop functionality before deploying
  - Focused only on mobile testing (iPhone 17 Pro Max Safari)
  - Violated principle: "we were just supposed to be fixing the mobile responsiveness of the webapp. trying to get it to function just like on the desktop"
- **Corrective Action Taken:**
  - GEAR: HOTFIX rollback to commit a541771 (before field type detection changes)
  - Deployed rollback to production
  - Form fields restored: 23 detected (was working state)
  - Awaiting user verification of checkbox functionality
- **Preventative Rule/Pattern Added:**
  - **MANDATORY:** When task is platform-specific (mobile, desktop, iOS, Android), changes MUST be scoped to that platform only
  - **MANDATORY:** Use responsive design patterns (media queries, viewport detection) NOT global logic changes
  - **MANDATORY:** Test ALL platforms before deployment when modifying shared code paths
  - **MANDATORY:** If mobile needs different behavior, use `window.innerWidth` or user-agent detection, NOT changing core field detection
  - Add cross-platform verification to GEAR: BUILD checklist when modifying form/PDF rendering logic

### Relying on constructor.name for Type Detection - Checkboxes Lost
- **Date/Time:** 2025-12-20 17:31
- **Task/Context:** Debugging why checkboxes don't work and SSN/EIN fields don't split on pdfdocsign.com
- **Rule Violated:** Assumed constructor.name is reliable for field type detection (Checklist.md - Evidence Discipline: "Do not assume facts that can be verified")
- **Why It Happened:**
  - Original code at line 498: `if (fieldConstructor === 'PDFTextField' || fieldConstructor === 'e')`
  - In bundled/minified production code, pdf-lib returns `constructor.name === 'e'` for ALL field types, not just text fields
  - Checkboxes also had `constructor.name === 'e'`, so they were immediately classified as text fields
  - Result: 8 checkboxes lost (extracted 15/23 fields instead of all 23)
  - User reported: "checkmarks stil dont actually make a checkmark in the box, the ssn/ein still dont have individual boxes"
- **Corrective Action Taken:**
  - Replaced constructor.name checks with try-catch field type detection (commit 7e3a14c)
  - Try `form.getCheckBox()` first (most specific)
  - Then try `form.getRadioGroup()`, `form.getDropdown()`, `form.getTextField()` in order
  - Each method throws if field is wrong type, so first successful call determines actual type
  - Evidence gathered via visible Chromium browser (test-production-evidence.js)
  - Verified on production: 23/23 fields extracted, 8 checkboxes detected and clickable
- **Preventative Rule/Pattern Added:**
  - **MANDATORY:** Never rely on `constructor.name` for type detection in production code (minification breaks it)
  - **MANDATORY:** Use feature detection (try-catch with type-specific methods) instead of name inspection
  - **GOLDEN PATH:** For pdf-lib field detection, always try checkbox→radio→dropdown→text in that order
  - Add to SolutionIndex: "PDF form field type detection" → use try-catch, not constructor.name
  - Add to Checklist.md Evidence Discipline: "Verify assumptions work in bundled/minified production builds"
- **Components Changed:** components/PDFEditorSimple.tsx:498-537

---

## Justified Violation Entry Template

**For GEAR: HOTFIX or systemic bypasses that warrant logging.**

Use this template when a governance rule was bypassed with justification:

### <Violation Title>
- **Date/Time:** YYYY-MM-DD HH:MM
- **Context:** Brief description of what was being attempted
- **Product Target:** WEB_SAAS | WEB_APP | MOBILE_IOS | MOBILE_ANDROID | API_SERVICE | AGENT_SYSTEM | LIBRARY | SCRIPT
- **Execution Gear:** EXPLORE | BUILD | SHIP | HOTFIX
- **Rule bypassed:** Which Engineering Brain rule was broken (with file reference)
- **Why justified:** Why it was necessary (time constraint, emergency, technical impossibility)
- **Risk introduced:** P0 | P1 | P2 | P3 (what could go wrong)
- **Preventative change:** Link to updated SolutionIndex, Recipe, or Golden Path (if systemic)
- **Follow-up plan:** How/when the bypass will be corrected (if deferred work)

### Logging Rules

**DO log if:**
- GEAR: HOTFIX violation that reveals a systemic gap
- Repeated violation (same rule bypassed 2+ times)
- Violation that changes future behavior or adds a preventative pattern

**DO NOT log if:**
- GEAR: EXPLORE violation (unless insight is permanent)
- One-off justified bypass with no systemic implications
- Violation already logged and no new information

**No spam logging.** This file should grow slowly and deliberately, not rapidly.

---

## Failure Is Data

**Governance violations are not shame. They are signal.**

Every violation logged here:
- Prevents future repetition
- Hardens the system against a specific failure mode
- Improves institutional memory
- Reduces user burden to correct the same error repeatedly

The goal is not perfection. The goal is **learning that compounds**.

Over time:
- Common violations disappear
- Rare edge cases emerge
- Patterns strengthen
- Failure becomes rarer

A system that logs its failures is a system that improves.

---

## Known Regressions (Most Recent)

### Secrets Committed to Public Repository
- **Symptom:** GitHub blocks push, secrets exposed in git history (`.env.master`, `AUTOMATION-GUIDE.md`)
- **Root Cause:** No pre-commit secrets detection gate, missing .gitignore patterns
- **Incorrect Behavior:** Committing files with API keys, AWS credentials without verification
- **Correct Solution:** Mandatory Security Gate C.1 before every commit (visual inspection + .gitignore check)
- **Enforced Path:** `Engineering/Checklist.md` - Security Gate C.1, `Engineering/Security.md` - Secrets Handling section
- **Prevention Mechanism:** Pre-commit secrets inspection, comprehensive .gitignore template
- **Severity:** P0 CRITICAL (public repo exposure of active credentials)
- **Date Logged:** 2025-12-22
- **Incident:** TradeFly project - AWS keys and OpenAI API key exposed in public GitHub history, blocked 80 commits from pushing
- **Recovery:** Rotate all exposed secrets, BFG Repo-Cleaner to remove from history, force push cleaned history

### Screenshot Content Verification Failure
- **Symptom:** Screenshots taken but show wrong content (login screen when claiming "portfolio page")
- **Root Cause:** Verification only checked "screenshot exists", not "screenshot matches claim"
- **Incorrect Behavior:** Taking screenshot without element verification, claiming success without visual description
- **Correct Solution:** 3-step protocol (element verification → screenshot → visual description)
- **Enforced Path:** `Engineering/Solutions/Recipes/Playwright.md` - Screenshot Content Verification section
- **Prevention Mechanism:** Mandatory 3-step protocol for ALL screenshots
- **Date Logged:** 2025-12-22
- **User Report:** "i asked it to take screenshot of the apps pages but it kept just bringing me back a bunch of login screenshots...it didnt have a login so it was taking pictures of what it thought was the page"

---

**Regression memory is binding and enforced.**
