# Solution Recipes -- Index

Recipes are step-by-step guides for solving specific technical problems. Each recipe covers a single domain and provides concrete, repeatable instructions. When a recipe exists for a task, it must be followed.

---

## Recipe Index

| Recipe | File | Domain |
|--------|------|--------|
| CI Pipeline Configuration | `CI.md` | Continuous integration setup, GitHub Actions workflows, build pipelines |
| Supabase Operations | `Supabase.md` | Database migrations, schema changes, RLS policies, Supabase client setup |
| Playwright Testing | `Playwright.md` | End-to-end UI testing, browser automation tests, test structure |
| Chromium Automation | `Chromium.md` | Browser automation, headless Chromium configuration, screenshot capture |
| Logs and Errors | `LogsAndErrors.md` | Log retrieval, error diagnosis, structured logging, log aggregation |
| Memory Logging | `MemoryLogging.md` | Experience logging, session context capture, institutional memory updates |
| Time and Date | `TimeAndDate.md` | Timezone handling, date formatting, temporal data patterns |
| Secrets Detection | `SecretsDetection.md` | Pre-commit secret scanning, credential leak prevention, remediation steps |

---

## How to Use Recipes

1. **Identify the domain** of the task you are performing.
2. **Open the matching recipe** from the table above.
3. **Follow the steps exactly.** Recipes are prescriptive, not suggestive.
4. **If a recipe fails**, document the failure and consult `Solutions/Regressions.md` for known issues.
5. **If no recipe exists**, solve the problem, then create a new recipe immediately.

---

## How to Add a New Recipe

1. Create a new `.md` file in this directory named after the domain (e.g., `Docker.md`, `Terraform.md`).
2. Follow this structure:
   - **Title** with the domain name
   - **When to use** this recipe
   - **Prerequisites** (tools, credentials, access required)
   - **Steps** numbered and concrete
   - **Verification** how to confirm the recipe worked
   - **Troubleshooting** common failure modes and fixes
3. Add the recipe to the table in this README.
4. Add a corresponding entry to `Solutions/SolutionIndex.md`.

---

## Cross-References

- **Solutions/SolutionIndex.md** -- Master index that links to these recipes
- **Solutions/GoldenPaths.md** -- Mandatory approaches that recipes implement
- **Automations/Recipes/** -- Automation-specific recipes (CI-CD, MCP, n8n, etc.)
- **Memory/ExperienceLog.md** -- Where recipe discoveries are logged

---

**If a recipe exists, follow it. If one does not exist, create it after solving the problem.**
