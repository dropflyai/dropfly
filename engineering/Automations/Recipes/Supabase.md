# SUPABASE AUTOMATION
**Executable Migration and Schema Management**

---

## Purpose

This document defines the **actual automation commands** used to manage Supabase.

It exists so the system never falls back to:
- manual SQL pasting
- inconsistent schema changes
- environment drift

This file is the execution layer for:
- `Engineering/Solutions/Recipes/Supabase.md`

---

## Preconditions

Before running Supabase automation:

- Supabase CLI installed
- Authenticated with Supabase project
- `.env` configured with correct project credentials

If any precondition fails, stop and fix it first.

---

## Standard Automation Workflow

### 1. Initialize Supabase (Once)
```bash
supabase init
```

Creates:
- `supabase/config.toml`
- `supabase/migrations/`

### 2. Create a Migration
```bash
supabase migration new <descriptive_name>
```

Rules:
- migration names must describe intent
- never reuse migration files

### 3. Edit Migration File
Write SQL in the generated migration file

Include both forward and backward-safe operations where possible

Do not apply changes directly via UI

### 4. Apply Locally
```bash
supabase db reset
```

This ensures:
- clean state
- migrations replay correctly
- schema matches code expectations

### 5. Verify Locally
Required checks:
- app boots
- schema queries succeed
- tests referencing DB pass

### 6. Push to Remote
```bash
supabase db push
```

Rules:
- only after local verification
- never push unverified migrations

---

## Failure Handling

If any command fails:
1. Capture the full error output
2. Diagnose the root cause
3. Fix migration or configuration
4. Re-run the same command

Do not proceed until success

If CLI tooling is broken:
- log the issue in `Engineering/Automations/Runbooks/BrokenAutomation.md`
- propose a fix
- only then consider emergency paths

---

## Artifacts

Each migration run must produce:
- migration file(s)
- CLI output logs
- verification confirmation

These artifacts are evidence of correctness.

---

## Forbidden Behavior

The following is explicitly disallowed:
- skipping local reset
- pushing without verification
- editing schema via Supabase UI
- applying one-off SQL fixes

---

## References

- Engineering/Solutions/Recipes/Supabase.md
- Engineering/Solutions/ToolAuthority.md
- Engineering/Solutions/GoldenPaths.md

---

**This automation recipe is mandatory and enforced.**
