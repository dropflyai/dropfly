# ENGINEERING CLEANUP POLICY
**Mandatory Codebase Hygiene**

---

## Purpose

Cleanup is not optional.

Every change must leave the codebase:
- cleaner
- smaller or equal in complexity
- easier to understand
- safer to modify

Failure to clean up is a failure of engineering discipline.

---

## Cleanup Is a Required Phase

Cleanup is a mandatory step in the engineering lifecycle.

No task may be considered complete unless cleanup has been performed and verified.

Cleanup applies to:
- code
- folders
- dependencies
- scripts
- documentation

---

## What Must Be Cleaned

You must actively look for and remove:

- dead or unused code
- unused files
- unused folders
- unused dependencies
- obsolete scripts
- commented-out blocks
- temporary debugging artifacts

If you touch a system, you own its cleanliness.

---

## Deletion Rules (Strict)

Deletion is allowed only when **one** of the following is true:

1. The user explicitly requests deletion
2. The item is provably unused:
   - no references
   - no imports
   - no runtime usage
   - verified via search and execution

Guessing is forbidden.

---

## Safe Deletion Process

When deleting anything, you MUST:

1. Prove it is unused
   - search references
   - explain why it is safe

2. Delete on a branch
   - never delete directly on main

3. Verify after deletion
   - run tests
   - run verification
   - ensure no regressions

4. Document the deletion
   - what was removed
   - why it was safe
   - what verification was run

---

## Folder Structure Cleanup

You are expected to:
- reorganize folders when structure degrades
- collapse unnecessary nesting
- remove empty folders
- enforce clear ownership boundaries

Structure is part of correctness.

---

## Dependency Hygiene

You must:
- remove unused dependencies
- avoid introducing unnecessary dependencies
- prefer standard libraries when possible

Any new dependency must be justified.

---

## Cleanup Enforcement

If cleanup is skipped:
- the task is incomplete
- the Engineering Score must be marked < 4
- work must continue until cleanup is done

---

## Cleanup Goal

The long-term goal of cleanup is:

> A codebase that naturally shrinks and clarifies over time.

Not one that grows indefinitely.

---

**Cleanup is mandatory and enforced.**
