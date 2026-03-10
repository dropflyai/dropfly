# Analytics Brief — Template

## Purpose

This template structures the request for an analytics project. It captures the business question, context, constraints, and expected deliverables before analysis begins. A completed analytics brief prevents wasted analytical effort by ensuring alignment between what the stakeholder needs and what the analyst delivers. It is the contract between the requester and the analytics team.

---

## Document Control

| Field | Value |
|-------|-------|
| Brief Title | [Descriptive title for the analysis] |
| Requester | [Name, role] |
| Analyst | [Name — assigned analytics team member] |
| Date Submitted | [YYYY-MM-DD] |
| Due Date | [YYYY-MM-DD] |
| Priority | [P1: Urgent / P2: Important / P3: Nice-to-have] |
| Status | [Submitted / Accepted / In Progress / In Review / Complete] |

---

## 1. Business Question

### The Question
What specific question do you need answered?

> [State the question in plain language. Be as specific as possible. Bad: "How is marketing doing?" Good: "Which marketing channels generate the highest LTV customers, and how should we reallocate our $500K monthly marketing budget to maximize 12-month revenue?"]

### Why Does This Matter?
What business decision depends on the answer?

> [Example: "We are planning next quarter's marketing budget and need to understand channel-level ROI to justify a proposed reallocation of $200K from paid search to content marketing."]

### What Will You Do With the Answer?
| If the analysis shows... | We will... |
|-------------------------|-----------|
| [Scenario A: e.g., "Content marketing LTV is 2x paid search"] | [Shift $200K from paid to content] |
| [Scenario B: e.g., "LTV is similar across channels"] | [Maintain current allocation; optimize within channels] |
| [Scenario C: e.g., "Data is insufficient to determine"] | [Design a measurement experiment for next quarter] |

---

## 2. Hypothesis

### What Do You Expect the Analysis to Show?
> [State your current belief or hypothesis. This helps the analyst understand your mental model and ensures the analysis addresses the right question. Example: "We believe content marketing generates higher-LTV customers because they are more educated about our product before purchasing, but we have never validated this quantitatively."]

### What Would Surprise You?
> [What finding would challenge your assumptions? This helps the analyst know which findings require extra validation. Example: "It would surprise me if paid search customers had higher LTV, given our impression that they churn faster."]

---

## 3. Scope

### In Scope

| Dimension | Specification |
|-----------|--------------|
| Time period | [e.g., Last 12 months (Jan 2024 - Dec 2024)] |
| Customer segments | [e.g., All segments / Enterprise only / US only] |
| Channels | [e.g., Paid search, organic search, content marketing, social, referral] |
| Metrics | [e.g., CAC, LTV, LTV:CAC ratio, payback period, retention by cohort] |
| Depth | [e.g., Channel-level breakdown; no need for campaign-level granularity] |

### Out of Scope
- [Explicitly state what should NOT be analyzed to prevent scope creep]
- [e.g., "We are not analyzing brand marketing or offline channels in this project"]
- [e.g., "We do not need predictive modeling; descriptive analysis is sufficient"]

---

## 4. Data and Context

### Known Data Sources

| Source | What It Contains | Access |
|--------|-----------------|--------|
| [e.g., Google Analytics] | [Website traffic, attribution data] | [Available in data warehouse] |
| [e.g., HubSpot/Salesforce] | [Lead source, deal data, revenue] | [Available in data warehouse] |
| [e.g., Stripe] | [Subscription data, payment history] | [Available in data warehouse] |
| [e.g., Product database] | [Usage data, feature adoption] | [Requires engineering support] |

### Known Data Limitations
- [e.g., "Attribution data is only available for customers acquired after March 2024"]
- [e.g., "Some customers have multiple touchpoints; we use first-touch attribution currently"]
- [e.g., "Free trial data is not linked to marketing source in our current system"]

### Relevant Context
[Any context the analyst should know: recent changes, known issues, organizational context]

- [e.g., "We changed our paid search agency in June 2024; performance may show a dip"]
- [e.g., "Content marketing team was 1 person until August 2024; now 3 people"]

---

## 5. Deliverables

### Expected Output Format

- [ ] Dashboard (ongoing monitoring)
- [ ] Presentation (one-time analysis, presented to stakeholders)
- [ ] Written report (detailed methodology and findings)
- [ ] Email summary (brief key findings)
- [ ] Data export (raw data for further analysis)

### Audience for Deliverable

| Audience | Role | Analytics Sophistication |
|----------|------|------------------------|
| [Name/role] | [Decision-maker / Informational] | [High / Medium / Low] |
| [Name/role] | [Role] | [Level] |

### Presentation Requirements

- [ ] Findings presented live by analyst
- [ ] Written deliverable is self-contained (readable without presentation)
- [ ] Both (live presentation + written document)

---

## 6. Timeline and Resources

### Timeline

| Milestone | Date |
|-----------|------|
| Brief submitted | [Date] |
| Brief accepted / scoping meeting | [Date] |
| First findings shared (interim check-in) | [Date] |
| Draft deliverable | [Date] |
| Final deliverable | [Date] |
| Stakeholder presentation | [Date] |

### Resource Requirements

| Need | Detail |
|------|--------|
| Analyst time | [Estimated hours / days] |
| Data engineering support | [Yes / No — describe if yes] |
| Stakeholder time for context | [Hours needed for interviews/clarification] |
| Other | [Any other resources needed] |

---

## 7. Success Criteria

How will we know this analysis was successful?

| Criterion | Measurement |
|-----------|-------------|
| Question answered | [The business question is definitively answered with data] |
| Decision made | [A specific business decision is made based on findings] |
| Accuracy | [Key numbers verified against source of truth] |
| Timeliness | [Delivered by deadline] |
| Stakeholder satisfaction | [Requester confirms the analysis meets their needs] |

---

## 8. Approval

| Role | Name | Approved | Date |
|------|------|----------|------|
| Requester | [Name] | [ ] | [Date] |
| Analytics Lead | [Name] | [ ] Accepted | [Date] |

---

## For Analytics Team Use

### Scoping Notes
[Analyst's notes after reviewing the brief and conducting scoping meeting]

### Estimated Effort
| Task | Hours |
|------|-------|
| Data preparation | [#] |
| Analysis | [#] |
| Deliverable creation | [#] |
| Review and iteration | [#] |
| **Total** | **[#]** |

### Assigned To
| Analyst | Role | Start Date |
|---------|------|-----------|
| [Name] | Lead analyst | [Date] |
| [Name] | Supporting (if needed) | [Date] |

---

## Usage Notes

- Submit this brief BEFORE requesting analytical work
- Incomplete briefs will be returned for completion
- Reference `analytics_project_pattern.md` for the complete project workflow
- The scoping meeting between requester and analyst should occur within 2 business days of submission
- Briefs are archived with project deliverables for institutional memory
