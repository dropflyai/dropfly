# GOVERNANCE
**Governance of the Engineering Brain Itself**

---

## Purpose

The Engineering Brain is not static.

It evolves based on:
- lessons learned
- new tools and patterns
- team feedback
- discovered edge cases

This document defines:
- who can change Brain files
- what requires review
- how to validate changes didn't break the workflow
- changelog requirements

Governance without governance-of-governance becomes chaos.

---

## Who Can Change Brain Files

### Authority Levels

**Level 1: Anyone (No Approval Required)**
- Fix typos, formatting, clarity improvements
- Add examples to existing sections
- Update links or file references
- Commit message: `docs(engineering-brain): [description]`

**Level 2: Senior Engineer (Self-Approval)**
- Add new sections to existing files
- Create new Solution/Recipe files
- Update Process Level guidance
- Log Regressions or Governance Violations
- Commit message: `feat(engineering-brain): [description]` or `chore(engineering-brain): [description]`

**Level 3: Principal Engineer (Review Required)**
- Modify Constitution.md (core rules)
- Change Authority Hierarchy
- Add/remove Process Levels
- Change Mode definitions
- Modify mandatory gate requirements
- Commit message: `BREAKING(engineering-brain): [description]`

**Level 4: Team Consensus (Required for Breaking Changes)**
- Eliminate entire sections (e.g., remove Artifact Type gate)
- Change fundamental philosophy (e.g., "automation optional")
- Deprecate Process Levels or Modes

### Default Assumption
If unclear which level applies: **escalate to next level**.

---

## What Requires Review

### No Review Required
- Typo fixes
- Formatting improvements
- Adding examples
- Logging regressions/violations
- Creating new Solution/Recipe files

### Review Required (1+ Engineer)
- Modifying Constitution.md
- Changing mandatory gates
- Adding new mandatory requirements
- Changing severity definitions (P0-P3)
- Modifying Process Level shortcuts

### Team Review Required (2+ Engineers)
- Removing mandatory requirements
- Deprecating Process Levels or Modes
- Changing Authority Hierarchy
- Major philosophical shifts

---

## Required Changelog Entries

**All Level 2+ changes must include:**

### In Commit Message
- Type: `feat`, `chore`, `BREAKING`, `fix`
- Scope: `(engineering-brain)`
- Description: Brief summary of change

Examples:
```
feat(engineering-brain): add performance budgets for WEB_SAAS
chore(engineering-brain): log governance violation for missing artifact type
BREAKING(engineering-brain): make artifact type optional for L0 EXPLORE
```

### In File (When Applicable)
Some files (e.g., Regressions.md) have inline logs. Use those.

For major changes, consider adding a "Changelog" section at the bottom of modified files.

---

## Brain Test Protocol

**How to validate Engineering Brain changes didn't break the workflow.**

### Lightweight Brain Test (Level 2+ Changes)

Run this test before committing Level 2+ changes:

1. **Simulate a task:**
   - Pick a realistic task (e.g., "add a button to signals.html")
   - Declare Process Level, Product Target, Mode, Artifact Type
   - Walk through Checklist gates

2. **Check for conflicts:**
   - [ ] Do any new rules conflict with existing rules?
   - [ ] Is the Authority Hierarchy still consistent?
   - [ ] Do Process Level shortcuts still make sense?
   - [ ] Are severity mappings consistent across files?

3. **Check for ambiguity:**
   - [ ] Is the new rule unambiguous?
   - [ ] Could two engineers interpret it differently?
   - [ ] Are examples clear (or should you add one)?

4. **Check for gaps:**
   - [ ] Does the change introduce a new gap (missing file, missing section)?
   - [ ] Does the change require updates to other Brain files?

If any check fails, revise before committing.

### Full Brain Test (Level 3+ Changes)

For breaking changes, run the Lightweight Test **plus**:

5. **Cross-file consistency check:**
   - [ ] Search all Brain files for references to changed sections
   - [ ] Update all references to remain consistent
   - [ ] Check that Constitution → Checklist → Modes flow is intact

6. **Simulate edge cases:**
   - [ ] L0 EXPLORE + MODE: APP + Artifact: Fragment
   - [ ] L3 HOTFIX + P0 CRITICAL + MODE: API
   - [ ] L2 SHIP + MODE: AGENTIC + Test artifact

   Do the rules still make sense? Any contradictions?

7. **Review with another engineer:**
   - [ ] Walk through the change
   - [ ] Ask: "Does this create confusion or solve a real problem?"
   - [ ] Document any concerns

---

## Brain Evolution Philosophy

### What Makes a Good Change?

**Good changes:**
- Solve a real problem (not theoretical)
- Preserve existing discipline
- Add clarity, not complexity
- Are grounded in evidence (a regression happened, a gap was discovered)

**Bad changes:**
- Add process for the sake of process
- Introduce ambiguity
- Create contradictions with existing rules
- Relax discipline without justification

### When to Resist Changes

If a proposed change is:
- "Let's make [rule] optional because it's annoying"
- "Let's skip [gate] because it slows us down"
- "Let's remove [requirement] because no one follows it"

**Ask first:**
- Why is it annoying? (Is the rule wrong, or is the execution wrong?)
- Why does it slow us down? (Is there a faster automation path?)
- Why does no one follow it? (Is the rule unclear, or is it being ignored?)

Fix the root cause, not the symptom.

---

## Deprecation Policy

If a Brain file, section, or rule is no longer relevant:

### Soft Deprecation (Recommended First)
1. Add `**DEPRECATED**` label at the top of the section
2. Explain why it's deprecated
3. Link to the replacement (if applicable)
4. Set a removal date (e.g., "Remove after 2025-03-01")
5. Leave the content in place until removal date

### Hard Removal (After Deprecation Period)
1. Confirm no active tasks depend on deprecated rule
2. Remove the section/file
3. Update all cross-references
4. Commit with `BREAKING(engineering-brain)` message
5. Announce removal (if multi-engineer team)

---

## Handling Contradictions

If two Brain files contradict each other:

1. **Check Authority Hierarchy** (Constitution.md Section 1)
   - Higher authority wins
   - Constitution > Solutions > Score > Checklist > Automations > Patterns > Playbook > AntiPatterns

2. **If same authority level:**
   - File a governance violation
   - Resolve contradiction in the higher-authority file
   - Update lower-authority file to align

3. **If Authority Hierarchy is unclear:**
   - Escalate to Principal Engineer level
   - Document the resolution
   - Update Authority Hierarchy if needed

---

## Brain Maintenance Cadence

**Recommended schedule:**

### Weekly (if multi-engineer team)
- Review new Regression/Governance Violation logs
- Identify patterns (3+ similar violations → add to SolutionIndex)

### Monthly
- Review Process Level usage (is L0/L1/L2/L3 distribution sensible?)
- Check for stale Solutions/Recipes (are any obsolete?)
- Review changelog commits (any trends or concerns?)

### Quarterly
- Full Brain health check (run Full Brain Test on Constitution + core files)
- Survey team (if applicable): What's working? What's frustrating?
- Identify gaps (missing files, missing sections, unclear rules)

---

## Emergency Brain Changes

**If the Brain itself is broken (blocking work):**

1. **Declare Brain Incident**
   - What is broken? (specific file/rule causing issues)
   - What is the impact? (tasks blocked, confusion, contradictions)

2. **Hotfix the Brain**
   - Apply minimal fix to unblock work
   - Skip review if time-critical
   - Document as Justified Violation

3. **Post-Incident Brain Review**
   - Why did the Brain break?
   - How can we prevent it?
   - Update Governance.md if process was unclear

---

## Brain Version Control

**All Brain files are version-controlled via git.**

- Use semantic commit messages
- Tag major Brain releases (optional but recommended for teams)
- Use branches for experimental Brain changes (merge after validation)
- Never force-push Brain changes (preserve history)

---

## Final Principle

> **The Brain serves the engineers. Engineers do not serve the Brain.**

If a rule blocks good work without justification, **change the rule**.

If a rule prevents bad work, **enforce the rule**.

The Brain evolves to maximize correctness, clarity, and long-term system health.

---

**Governance of governance is mandatory and enforced.**
