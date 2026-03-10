# Solutions -- Institutional Memory & Operational Knowledge

The Solutions directory is the Engineering Brain's institutional memory. It contains proven solutions, approved tool choices, regression records, operational runbooks, and step-by-step recipes. Every engineering task must consult this directory before proposing new approaches.

If a solution exists here, it is mandatory. Do not reinvent what has already been solved.

---

## Overview

Solutions serve three purposes:

1. **Prevent re-solving known problems.** Once a problem is solved and recorded, the solution becomes the standard.
2. **Enforce tool and workflow consistency.** The ToolAuthority and GoldenPaths files define the only approved approaches for recurring tasks.
3. **Capture regressions and lessons learned.** The Regressions tracker ensures past failures are not repeated.

---

## Directory Contents

| Resource | Location | Purpose |
|----------|----------|---------|
| **SolutionIndex.md** | `Solutions/SolutionIndex.md` | Master index of all solved problems. First stop for any engineering task. Links to recipes, runbooks, and golden paths. |
| **GoldenPaths.md** | `Solutions/GoldenPaths.md` | Mandatory execution standards. Defines the only approved way to solve recurring problems. Deviation requires documented justification. |
| **ToolAuthority.md** | `Solutions/ToolAuthority.md` | Authoritative tool selection guide. Specifies which tools are approved for which tasks and prohibits unapproved alternatives. |
| **Regressions.md** | `Solutions/Regressions.md` | Regression tracker. Documents past failures, their root causes, and the fixes applied. Consult before making changes to areas with regression history. |
| **Runbooks/** | `Solutions/Runbooks/` | Operational runbooks for production procedures. Step-by-step guides for deployment, incident response, database operations, and recovery. |
| **Recipes/** | `Solutions/Recipes/` | How-to guides for specific technical tasks. Each recipe covers a single domain (CI, Supabase, Playwright, etc.) with concrete steps. |

---

## How to Use This Directory

1. **Before starting any task**, check `SolutionIndex.md` for an existing solution.
2. **Before selecting a tool**, check `ToolAuthority.md` for the approved choice.
3. **Before proposing a new workflow**, check `GoldenPaths.md` for an existing golden path.
4. **Before modifying a fragile area**, check `Regressions.md` for known failure patterns.
5. **For step-by-step execution**, follow the relevant recipe in `Recipes/` or runbook in `Runbooks/`.

---

## How to Add New Solutions

When you solve a new problem or discover a repeatable approach:

1. **Add an entry to `SolutionIndex.md`** with a summary, category, and link to the detailed resource.
2. **Create a Recipe** in `Recipes/` if the solution involves step-by-step procedures.
3. **Update `GoldenPaths.md`** if the solution should become the mandatory approach.
4. **Update `ToolAuthority.md`** if a new tool was evaluated and approved.
5. **Log the discovery** in `Memory/ExperienceLog.md` for audit trail.

New solutions must be added immediately upon discovery. Delaying documentation leads to knowledge loss.

---

## Cross-References

| Related Directory | Relationship |
|-------------------|-------------|
| **Memory/** | Experience logs, context snapshots, and session history. Solutions are distilled from Memory entries. |
| **Patterns/** | Reusable code and architecture patterns. Patterns implement solutions at the code level. |
| **Automations/** | Executable automation recipes. Many Solutions entries have corresponding automation recipes. |
| **Verification/** | Verification procedures. Solutions often include verification criteria that map to Verification protocols. |

---

## Governance

- Solutions are governed by the Engineering Brain hierarchy (see `CLAUDE.md`).
- `SolutionIndex.md` has authority level 5 in the hierarchy.
- Conflicting solutions are resolved by the higher-authority document.
- All changes to golden paths or tool authority require review.

---

**If it is solved, it is documented here. If it is not checked here first, the system is operating incorrectly.**
