# Architecture Decision Record (ADR) Template

Use this template to document every significant architecture decision. ADRs are immutable once accepted -- supersede with a new ADR rather than editing.

---

## ADR-[NUMBER]: [TITLE]

**Date:** YYYY-MM-DD
**Status:** Proposed | Accepted | Deprecated | Superseded by ADR-[NUMBER]
**Deciders:** [Names or roles of decision-makers]
**Technical Area:** [e.g., Backend, Frontend, Infrastructure, Database, API, Security]

---

## 1. Context and Problem Statement

Describe the architectural challenge or question that requires a decision. Include:

- **Background:** What system or feature prompted this decision?
- **Current State:** How does the system work today (if applicable)?
- **Constraints:** What technical, business, or timeline constraints exist?
- **Trigger:** What event or requirement forced this decision now?

> Be specific. "We need a database" is too vague. "We need a database that supports real-time subscriptions, row-level security, and handles 10K concurrent connections for our multi-tenant SaaS" is actionable.

---

## 2. Decision Drivers

List the factors that influence this decision, ordered by priority:

1. **[Driver 1]:** [Description and why it matters]
2. **[Driver 2]:** [Description and why it matters]
3. **[Driver 3]:** [Description and why it matters]
4. **[Driver 4]:** [Description and why it matters]

### Non-Functional Requirements

| Requirement | Target | Priority |
|-------------|--------|----------|
| Performance | [e.g., < 200ms p95 latency] | High / Medium / Low |
| Scalability | [e.g., 100K users in 12 months] | High / Medium / Low |
| Availability | [e.g., 99.9% uptime] | High / Medium / Low |
| Security | [e.g., SOC 2 compliance] | High / Medium / Low |
| Cost | [e.g., < $500/month at 10K users] | High / Medium / Low |
| Maintainability | [e.g., team of 3 can operate] | High / Medium / Low |

---

## 3. Options Considered

### Option A: [Name]

**Description:** [How this option works]

| Dimension | Assessment |
|-----------|-----------|
| Pros | [List advantages] |
| Cons | [List disadvantages] |
| Effort | [Low / Medium / High] |
| Risk | [Low / Medium / High] |
| Cost | [Estimated cost] |
| Team Familiarity | [Low / Medium / High] |

**Evidence / References:**
- [Link to documentation, benchmark, case study, or prior experience]

### Option B: [Name]

**Description:** [How this option works]

| Dimension | Assessment |
|-----------|-----------|
| Pros | [List advantages] |
| Cons | [List disadvantages] |
| Effort | [Low / Medium / High] |
| Risk | [Low / Medium / High] |
| Cost | [Estimated cost] |
| Team Familiarity | [Low / Medium / High] |

**Evidence / References:**
- [Link to documentation, benchmark, case study, or prior experience]

### Option C: [Name] (if applicable)

**Description:** [How this option works]

| Dimension | Assessment |
|-----------|-----------|
| Pros | [List advantages] |
| Cons | [List disadvantages] |
| Effort | [Low / Medium / High] |
| Risk | [Low / Medium / High] |
| Cost | [Estimated cost] |
| Team Familiarity | [Low / Medium / High] |

**Evidence / References:**
- [Link to documentation, benchmark, case study, or prior experience]

---

## 4. Decision Outcome

**Chosen Option:** [Option X]

**Rationale:** Explain why this option was selected. Reference the decision drivers above and explain how this option best satisfies them. Be explicit about tradeoffs accepted.

### Decision Matrix

| Driver | Weight | Option A | Option B | Option C |
|--------|--------|----------|----------|----------|
| [Driver 1] | [1-5] | [1-5] | [1-5] | [1-5] |
| [Driver 2] | [1-5] | [1-5] | [1-5] | [1-5] |
| [Driver 3] | [1-5] | [1-5] | [1-5] | [1-5] |
| **Weighted Total** | | **[X]** | **[X]** | **[X]** |

---

## 5. Consequences

### Positive Consequences
- [What improves as a result of this decision]
- [What becomes possible that was not before]
- [What risks are mitigated]

### Negative Consequences
- [What tradeoffs are accepted]
- [What becomes harder or impossible]
- [What new risks are introduced]

### Neutral Consequences
- [What changes but is neither clearly positive nor negative]

---

## 6. Implementation Plan

| Phase | Task | Owner | Target Date | Status |
|-------|------|-------|-------------|--------|
| 1 | [Task description] | [Owner] | YYYY-MM-DD | Not Started |
| 2 | [Task description] | [Owner] | YYYY-MM-DD | Not Started |
| 3 | [Task description] | [Owner] | YYYY-MM-DD | Not Started |

### Migration Strategy (if applicable)
- **Approach:** [Big bang / Rolling / Blue-green / Canary]
- **Rollback Plan:** [How to revert if things go wrong]
- **Data Migration:** [How existing data will be handled]

---

## 7. Validation Criteria

How will we know this decision was correct?

| Metric | Target | Measurement Method | Review Date |
|--------|--------|--------------------|-------------|
| [Metric 1] | [Target] | [How to measure] | YYYY-MM-DD |
| [Metric 2] | [Target] | [How to measure] | YYYY-MM-DD |
| [Metric 3] | [Target] | [How to measure] | YYYY-MM-DD |

### Kill Criteria
Under what conditions would we reverse this decision?
- [Condition 1]
- [Condition 2]
- [Condition 3]

---

## 8. Related Decisions

| ADR | Relationship |
|-----|-------------|
| ADR-[X] | [Supersedes / Depends on / Related to] |
| ADR-[Y] | [Supersedes / Depends on / Related to] |

---

## 9. Review Log

| Date | Reviewer | Notes |
|------|----------|-------|
| YYYY-MM-DD | [Name] | [Review notes] |

---

## Usage Notes

- One ADR per decision. Do not combine unrelated decisions.
- ADRs are append-only. To change a decision, create a new ADR that supersedes the old one.
- Link ADRs from relevant code comments and documentation.
- Review ADRs quarterly to identify decisions that should be revisited.
- Store ADRs in `engineering_brain/Decisions/` with filename `ADR-[NUMBER]-[slug].md`.
