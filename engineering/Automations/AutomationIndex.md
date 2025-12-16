# AUTOMATION INDEX
**Executable Capability Registry**

---

## Purpose

This index lists all available automations that can be executed by the Engineering Brain.

If an automation exists here:
- it is expected to be runnable
- it is preferred over manual workflows
- it must be kept up to date

This file is the execution counterpart to:
- `Engineering/Solutions/SolutionIndex.md`

---

## Usage Rules

For any task that may be automated:

1. Check this index first
2. Use the referenced automation recipe
3. Do not invent manual steps if an automation exists
4. If a new automation is created, add it here immediately

Failure to consult this index is a system violation.

---

## Available Automations

### Supabase Migrations
- Recipe: `Engineering/Automations/Recipes/Supabase.md`
- Scope: schema migrations, DB resets, pushes
- Verification: local reset + tests + push confirmation

---

## Adding a New Automation

When adding a new automation, list it using this format:

### <Automation Name>
- Recipe:
- Scope:
- Preconditions:
- Verification:

Automations without verification are invalid.

---

## Automation vs Solution

- **Solutions** define what must be done
- **Automations** define how it is executed

Both must exist for repeatable success.

---

**Automation Index is binding and enforced.**
