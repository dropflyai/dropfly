# DESIGN EXPERIENCE LOG
**Learning from Every Project**

---

## Purpose

This log captures every completed design task to build institutional design memory and enable pattern recognition over time.

After 50 projects, patterns emerge.
After 100 projects, pseudo-intuition develops.
After 200 projects, the agent has seen more designs than most human designers.

---

## MANDATORY LOGGING (SHIP Phase)

**After every SHIP phase, the following MUST be logged:**

| Required Field | Description |
|----------------|-------------|
| Project name | Name/identifier of the project |
| Design mode | MODE_SAAS / MODE_INTERNAL / MODE_AGENTIC |
| Reference sources | URLs or "User upload" or "None — original design" |
| Design DNA summary | Grid, typography, color, signature move |
| What worked | Successful patterns, decisions, approaches |
| What did not work | Failed approaches, issues encountered |
| What to reuse or avoid | Lessons for future projects |

**This logging is MANDATORY after SHIP phase. Failure to log = incomplete task.**

---

## Required Format

Each completed design MUST log:

```markdown
### [YYYY-MM-DD] Project/Task Title

**Context:**
- Product Type: WEB_APP | WEB_SAAS | MOBILE_IOS | MOBILE_ANDROID | MARKETING_SITE | INTERNAL_TOOL | AGENT_UI
- UI Mode: MODE_SAAS | MODE_INTERNAL | MODE_AGENTIC
- Industry: [FinTech | HealthTech | E-commerce | B2B SaaS | Consumer | etc.]
- Design Phase: DISCOVERY | RESEARCH | ARCHITECTURE | FLOWS | BRAND | PATTERNS | TESTING

**Brief:**
What was the design challenge or requirement?

**Reference Links Used:**
- [URL or "User upload: description"]
- [URL or "None — original design"]

**Design DNA Summary:**
- Grid: [key decisions]
- Typography: [key decisions]
- Color: [key decisions]
- Signature move: [what made it unique]
(Full DNA saved to: Memory/ReferenceDNA/[ProjectName]/)

**Approaches Tried:**
- Approach 1: [what was tried] → [result/feedback]
- Approach 2: [what was tried] → [result/feedback]

**Final Solution:**
What was shipped? (Include screenshot link if possible)

**Why It Worked:**
What made this solution effective?

**What Didn't Work:**
Issues encountered and how they were resolved.

**What to Reuse Next Time:**
Specific patterns, tokens, or approaches worth repeating.

**Pattern Observed:**
Generalizable lesson that applies beyond this project.

**User/Stakeholder Feedback:**
Direct quotes or paraphrased feedback.

**Would Do Differently:**
Retrospective: what could have been done better?

**Time Spent:**
Estimate (for future reference).

**Related Files:**
Links to design files, prototypes, documentation.
```

---

## How to Use This Log

### Before Starting a Design Task
1. Search this log for similar projects (by Product Type, Industry, keywords)
2. Review what worked and what failed in similar past projects
3. Apply learned patterns proactively

### After Completing a Design Task
1. Log the experience using the format above
2. If 3+ similar designs exist, propose a pattern in `DesignPatterns.md`
3. If design was rejected/failed, log in `DesignFailures.md`

---

## Search Queries

When starting a new project, search for:
```
[Industry] + [Product Type]
Example: "FinTech WEB_SAAS"

[Design Element] + [Mode]
Example: "dashboard MODE_SAAS"

[Problem Type]
Example: "onboarding" or "empty states" or "navigation"
```

---

## Growth Milestones

- **25 projects** → Start seeing repeated problems
- **50 projects** → Pseudo-intuition for common patterns
- **100 projects** → Better than junior designer in logged domains
- **200 projects** → Industry-specific design sense emerges
- **500 projects** → Institutional design authority

---

## Logged Experiences

<!-- Template for first entry:

### [2025-12-29] SaaS Dashboard Redesign

**Context:**
- Product Type: WEB_SAAS
- UI Mode: MODE_SAAS
- Industry: B2B SaaS (Project Management)
- Design Phase: PATTERNS

**Brief:**
Dashboard was overwhelming with 15+ widgets. Users couldn't find key metrics.

**Approaches Tried:**
- Approach 1: Reduced to 6 widgets → Still felt cluttered
- Approach 2: Progressive disclosure with tabs → Users missed important data
- Approach 3: Prioritized hierarchy with 3 primary + expandable secondary → Worked

**Final Solution:**
3 large KPI cards at top, expandable "More Metrics" section below.
Clear visual hierarchy with size differentiation.

**Why It Worked:**
Users scan top-to-bottom. Putting most important metrics first
and making them visually dominant matched user priority.

**Pattern Observed:**
Dashboards should have max 3-5 primary metrics visible on initial load.
Use progressive disclosure for secondary data.

**User/Stakeholder Feedback:**
"Finally I can see what matters without hunting for it."

**Would Do Differently:**
Started with user interviews about which metrics matter most.
Could have avoided the first two iterations.

**Time Spent:**
4 hours total (including iterations)

**Related Files:**
Figma: [link]

-->

<!-- All future experiences logged below this line -->
