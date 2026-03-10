# SUPABASE
**Automation-First Database Migrations and Operations**

---

## Problem

Manual database changes cause:
- inconsistent environments
- broken schemas
- irreversible mistakes
- debugging loops
- loss of migration history

Pasting SQL into the Supabase editor is not a reliable workflow when automation exists.

---

## Golden Rule

> **All Supabase schema changes must be performed via automated migrations.**

Manual editor usage is forbidden unless explicitly documented as an emergency exception.

---

## Approved Automation Paths (Priority Order)

1. **Supabase CLI migrations**
2. **MCP-based migration workflows** (if configured)
3. **Scripted migration runners** (Node/Python)

One of these must be used.

---

## Canonical Workflow (CLI)

### Initialize (once per project)
```bash
supabase init
```

### Create Migration
```bash
supabase migration new <descriptive_name>
```

### Edit Migration
Write SQL in the generated migration file

Do not apply changes directly in the web editor

### Apply Locally
```bash
supabase db reset
```

### Push to Remote
```bash
supabase db push
```

---

## Verification Requirements

After applying a migration:
- schema is validated
- app starts successfully
- tests pass
- no runtime errors related to DB schema

Verification output must be recorded.

---

## Forbidden Behavior

The following is explicitly disallowed:
- pasting SQL into the Supabase web editor as a default workflow
- applying schema changes without a migration file
- making production-only changes without migration history
- "just try this SQL and see"

Any instance is a correctness failure.

---

## Emergency Exception (Strict)

Manual editor usage is allowed only if:
- automation tooling is broken
- the failure is documented in:
  - `Engineering/Automations/Runbooks/BrokenAutomation.md`
- a plan to restore automation is provided

Even in emergencies:
- migration history must be reconciled afterward

---

## Regression Handling

Any regression involving:
- manual Supabase editor usage
- missing migrations
- schema drift

must be logged in:
- `Engineering/Solutions/Regressions.md`

and reference this recipe.

---

## References

- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md
- Engineering/Solutions/SolutionIndex.md
- Engineering/Automations/Recipes/Supabase.md

---

**This recipe is mandatory and enforced.**
