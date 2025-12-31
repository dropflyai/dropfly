# Pattern: Dashboards — Authoritative

Dashboards exist to answer:
"What should I look at?"
"What should I do next?"

If a dashboard does not guide attention and action, it has failed.

---

## PURPOSE

Dashboards are not reports.
Dashboards are not landing pages.
Dashboards are not collections of widgets.

Dashboards exist to:
- summarize system state
- surface anomalies
- guide next action

---

## DEFAULT DASHBOARD STRUCTURE (NON-NEGOTIABLE)

A dashboard must include, in this order:

1. **Primary focus**
   The single most important signal or outcome.

2. **Secondary signals**
   Supporting metrics that explain or contextualize the primary focus.

3. **Next actions**
   What the user should do based on what they see.

If any of these are missing, refactor.

---

## INFORMATION HIERARCHY

Rules:
- One dominant focal area above the fold
- Secondary metrics visually grouped
- Tertiary data hidden or de-emphasized

Hierarchy must be obvious without labels or explanation.

---

## METRICS & DATA RULES

- Metrics must answer a question
- Every metric must have context
- Numbers without meaning are disallowed

### Required context (at least one):
- Time range
- Comparison (previous period, baseline)
- Status (good / warning / attention)

Avoid "vanity metrics" with no decision value.

---

## CHARTS & VISUALIZATIONS

Charts are allowed only when they:
- reveal trends
- show change over time
- make comparison easier than text

Rules:
- Prefer simple charts (line, bar)
- Label axes clearly
- Avoid decorative gradients or animations
- Do not overload charts with data

If a table or sentence communicates better, use that instead.

---

## LAYOUT RULES

- Avoid grid-for-the-sake-of-grid
- Do not make everything the same size
- Use asymmetry intentionally
- Leave breathing room around the primary focus

Cards are optional, not default.

---

## MODE-SPECIFIC RULES

### MODE_SAAS
- Emphasize value and progress
- Avoid overwhelming first-time users
- Use empty states and onboarding cues

Avoid:
- Dense operational data
- Internal-only metrics

---

### MODE_INTERNAL
- Prioritize speed and scanability
- Allow higher density
- Support keyboard navigation and bulk actions

Avoid:
- Over-sized visuals
- Excessive whitespace

---

### MODE_AGENTIC
- Show system state clearly
- Surface recent runs, statuses, and failures
- Timelines and logs are first-class
- Partial success must be visible

Avoid:
- Abstract summaries with no traceability
- "All good" dashboards that hide failure detail

---

## EMPTY DASHBOARD STATES

If no data exists:
- Explain what will appear here
- Explain why it matters
- Provide a clear next action

Never show an empty grid of placeholders.

---

## COMMON DASHBOARD FAILURES (EXPLICITLY DISALLOWED)

- Everything in equal-sized cards
- Symmetrical widget grids
- Decorative charts
- No clear primary focus
- Dashboards that require explanation
- Dashboards that try to do too much

If the dashboard looks like a template gallery, refactor.

---

## FINAL DASHBOARD CHECK

Before shipping, ask:
- What is the first thing the user should notice?
- What decision does this enable?
- What action should follow?
- Is anything here informational but not useful?

If unsure, remove or de-emphasize.

---

## END OF DASHBOARDS PATTERN
