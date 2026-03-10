# PRD Template

## Usage Instructions

This template provides the structure for a Product Requirements Document. Fill in each section, adapting the depth to the initiative's complexity and launch tier. For Tier 3-4 features, sections 8-10 can be abbreviated. For Tier 1-2 features, all sections should be comprehensive. Delete the instructional comments (in brackets) before sharing.

Reference: `05_specifications/prd_writing.md` for detailed guidance on PRD writing.

---

# PRD: [Feature/Initiative Name]

| Field | Value |
|-------|-------|
| **Author** | [PM Name] |
| **Date** | [YYYY-MM-DD] |
| **Status** | [Draft / In Review / Approved / In Progress / Complete] |
| **Launch Tier** | [1 / 2 / 3 / 4] |
| **Target Release** | [Quarter or date range] |
| **Reviewers** | [Engineering Lead, Design Lead, stakeholders] |
| **Approval** | [Name and date of approval] |

---

## 1. Overview

### 1.1 Problem Statement

[Describe the customer problem in 2-3 sentences. Focus on the pain, not the solution. Use customer language, not internal jargon.]

**Customer quote:** "[Verbatim quote from a customer interview that captures the problem]"

### 1.2 Background and Context

[Why is this problem important now? What has changed in the market, customer behavior, or our strategy that makes this a priority? Include any relevant history — previous attempts, related features, competitive context.]

### 1.3 Customer Segment

[Who specifically has this problem? Reference the persona from `03_user_research/personas_and_segmentation.md` if applicable.]

| Attribute | Description |
|-----------|-------------|
| Primary persona | [Name and brief description] |
| Segment size | [Estimated number of users/accounts affected] |
| Current behavior | [How they solve this problem today] |
| Desired outcome | [What they want to achieve] |

### 1.4 Strategic Alignment

[How does this initiative connect to the product strategy and vision? Which strategic goal or OKR does this serve?]

| Strategic Element | Connection |
|-------------------|------------|
| Product vision | [How this advances the vision] |
| Product strategy | [Which strategic pillar this serves] |
| Quarterly OKR | [Specific OKR this contributes to] |

---

## 2. Evidence

### 2.1 Customer Evidence

[What customer research supports this initiative?]

| Evidence Type | Summary | Confidence |
|--------------|---------|------------|
| User interviews | [N interviews; key findings] | [High / Medium / Low] |
| Support tickets | [N tickets related; top themes] | [High / Medium / Low] |
| Customer requests | [N requests; frequency and urgency] | [High / Medium / Low] |
| Behavioral data | [Usage patterns indicating the problem] | [High / Medium / Low] |

### 2.2 Market Evidence

[Competitive landscape, market trends, regulatory requirements.]

### 2.3 Business Evidence

[Revenue impact estimate, retention impact, strategic value.]

### 2.4 Key Assumptions

[List assumptions that have NOT been validated yet. These are risks.]

| Assumption | Impact if Wrong | Validation Plan |
|-----------|----------------|-----------------|
| [Assumption 1] | [What happens if this is false] | [How we will test this] |
| [Assumption 2] | [What happens if this is false] | [How we will test this] |

---

## 3. Desired Outcome

### 3.1 Target Outcome

[Describe the measurable customer behavior change or business result this initiative will produce.]

### 3.2 Success Metrics

| Metric | Current Baseline | Target | Measurement Method |
|--------|-----------------|--------|--------------------|
| **Primary metric** | [Current value] | [Target value] | [How measured] |
| **Secondary metric 1** | [Current value] | [Target value] | [How measured] |
| **Secondary metric 2** | [Current value] | [Target value] | [How measured] |
| **Guardrail metric** | [Current value] | [Must not degrade below X] | [How measured] |

### 3.3 Non-Goals

[Explicitly state what this initiative is NOT trying to achieve. This prevents scope creep.]

- This initiative does NOT aim to [non-goal 1]
- This initiative does NOT aim to [non-goal 2]
- This initiative does NOT aim to [non-goal 3]

---

## 4. Solution Overview

### 4.1 Proposed Approach

[High-level description of the solution. Describe the approach, not the detailed implementation. Leave room for engineering and design to determine the best way to build it.]

### 4.2 User Experience

[Describe the key user flows. Link to design specs if available.]

```
User Flow:
1. User [action] -> sees [result]
2. User [action] -> sees [result]
3. User [action] -> outcome achieved
```

### 4.3 Technical Approach

[Architecture-level description. Not implementation detail — just enough for engineering to assess feasibility and plan.]

---

## 5. Requirements

### 5.1 Functional Requirements

| ID | Requirement | Priority | Notes |
|----|------------|----------|-------|
| FR-1 | [The system shall...] | Must have | |
| FR-2 | [The system shall...] | Must have | |
| FR-3 | [The system shall...] | Should have | |
| FR-4 | [The system shall...] | Nice to have | |

### 5.2 Non-Functional Requirements

| Category | Requirement | Target |
|----------|------------|--------|
| Performance | [Page load time, API latency] | [Specific target] |
| Scalability | [Concurrent users, data volume] | [Specific target] |
| Security | [Authentication, authorization, encryption] | [Specific standard] |
| Accessibility | [WCAG compliance level] | [AA or AAA] |
| Compatibility | [Browsers, devices, platforms] | [Specific list] |

### 5.3 Acceptance Criteria

[Write Given/When/Then for key scenarios.]

```
Scenario: [Happy path scenario name]
  Given [precondition]
  When [user action]
  Then [expected outcome]

Scenario: [Error scenario name]
  Given [precondition]
  When [user action with invalid input]
  Then [error handling behavior]

Scenario: [Edge case scenario name]
  Given [unusual precondition]
  When [user action]
  Then [expected behavior]
```

### 5.4 Out of Scope

[Explicitly list what is NOT included in this initiative.]

- [Out of scope item 1 — and why it is deferred]
- [Out of scope item 2 — and why it is deferred]

---

## 6. Design

### 6.1 Design Specs

[Link to Figma, design files, or include key mockups.]

### 6.2 States to Design

| State | Description | Designed? |
|-------|-------------|-----------|
| Default | Normal state | [ ] |
| Loading | Data is being fetched | [ ] |
| Empty | No data available | [ ] |
| Error | Something went wrong | [ ] |
| Success | Action completed | [ ] |
| Hover / Focus | Interactive states | [ ] |
| Disabled | Feature not available | [ ] |

### 6.3 Edge Cases

[Describe edge cases and how they should be handled.]

---

## 7. Implementation

### 7.1 Technical Dependencies

| Dependency | Owner | Status | Risk |
|-----------|-------|--------|------|
| [Dependency 1] | [Team/Person] | [Ready / In Progress / Blocked] | [Low / Medium / High] |

### 7.2 Phasing / Rollout Plan

| Phase | Scope | Timeline | Audience |
|-------|-------|----------|----------|
| Phase 1 (MVP) | [Core functionality] | [Timeline] | [Beta users] |
| Phase 2 | [Enhanced functionality] | [Timeline] | [All users] |

### 7.3 Feature Flag

| Field | Value |
|-------|-------|
| Flag name | [team-feature-date] |
| Rollout plan | [1% -> 5% -> 25% -> 50% -> 100%] |
| Rollback trigger | [Define automatic and manual triggers] |

### 7.4 Analytics Requirements

[List events to instrument. Reference `06_metrics/analytics_implementation.md`.]

| Event Name | Properties | Trigger |
|-----------|-----------|---------|
| [event_name] | [key properties] | [when the event fires] |

---

## 8. Risks and Mitigations

| Risk | Probability | Impact | Mitigation |
|------|------------|--------|------------|
| [Risk 1] | [High/Medium/Low] | [High/Medium/Low] | [How we mitigate] |
| [Risk 2] | [High/Medium/Low] | [High/Medium/Low] | [How we mitigate] |

---

## 9. Timeline and Milestones

| Milestone | Target Date | Owner |
|-----------|-------------|-------|
| PRD approved | [Date] | PM |
| Design complete | [Date] | Design |
| Development complete | [Date] | Engineering |
| QA complete | [Date] | QA |
| Beta launch | [Date] | PM |
| General availability | [Date] | PM |
| Post-launch review | [Date] | PM |

---

## 10. Kill Criteria

[Under what conditions will we stop this initiative or roll back?]

- If [primary metric] does not improve by [threshold] within [timeframe] of launch
- If [guardrail metric] degrades by more than [threshold]
- If [qualitative signal] indicates [condition]

---

## 11. Appendix

### 11.1 Research Findings

[Link to or summarize key research documents.]

### 11.2 Competitive Analysis

[Link to or summarize competitive analysis.]

### 11.3 Related Documents

| Document | Link |
|----------|------|
| Design specs | [Link] |
| Technical design doc | [Link] |
| Research report | [Link] |
| Previous PRDs | [Link] |

---

## Revision History

| Date | Author | Changes |
|------|--------|---------|
| [Date] | [Name] | Initial draft |
| [Date] | [Name] | Updated after engineering review |
| [Date] | [Name] | Approved; moved to In Progress |
