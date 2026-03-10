# Incident Postmortem Report Template

Structured template for documenting production incidents, conducting root cause analysis, and defining corrective actions. Every SEV-1 and SEV-2 incident MUST produce a postmortem. SEV-3 incidents should produce a postmortem if the incident reveals a systemic issue.

---

## Incident Metadata

| Field | Value |
|-------|-------|
| **Incident ID** | INC-[YYYY]-[NUMBER] |
| **Title** | [Brief, descriptive title] |
| **Severity** | SEV-1 (Critical) / SEV-2 (Major) / SEV-3 (Minor) |
| **Status** | Draft / In Review / Accepted / Action Items Complete |
| **Date of Incident** | YYYY-MM-DD |
| **Duration** | [Total time from detection to resolution] |
| **Author** | [Name] |
| **Review Date** | YYYY-MM-DD |
| **Reviewers** | [Names] |

### Severity Definitions

| Severity | Impact | Examples |
|----------|--------|----------|
| SEV-1 | Complete service outage, data loss, security breach, revenue loss | Database down, auth broken, payment processing failed |
| SEV-2 | Degraded service, partial outage, significant feature broken | Slow response times, email delivery failed, search broken |
| SEV-3 | Minor feature broken, cosmetic issue in production, isolated errors | UI glitch, non-critical API error, edge case failure |

---

## 1. Executive Summary

Write a 3-5 sentence summary that a non-technical stakeholder can understand. Include: what happened, who was affected, how long it lasted, and the business impact.

> Example: "On 2025-06-15, our authentication service experienced a complete outage lasting 47 minutes, preventing all users from logging in. Approximately 12,000 users were affected during peak hours. The root cause was an expired TLS certificate on our auth provider. Revenue impact is estimated at $8,400 in lost transactions."

---

## 2. Impact Assessment

### User Impact
| Metric | Value |
|--------|-------|
| Users affected | [Number or percentage] |
| Requests failed | [Number] |
| Error rate during incident | [Percentage] |
| Geographic scope | [Global / Regional / Specific] |
| User-facing symptoms | [What users experienced] |

### Business Impact
| Metric | Value |
|--------|-------|
| Revenue lost | [$X or estimated range] |
| SLA violation | [Yes/No -- which SLA] |
| Data lost | [Yes/No -- what data] |
| Reputation impact | [Low / Medium / High] |
| Customer tickets generated | [Number] |
| External communication required | [Yes/No] |

### Technical Impact
| Metric | Value |
|--------|-------|
| Services affected | [List of services] |
| Dependencies impacted | [Downstream effects] |
| Data integrity | [Verified / Compromised / Unknown] |
| Backlog created | [Jobs, messages, etc. queued during outage] |

---

## 3. Timeline

Document the incident timeline in UTC. Be precise -- minutes matter.

| Time (UTC) | Event | Actor |
|------------|-------|-------|
| HH:MM | **Detection:** How the incident was first noticed | [Person/System] |
| HH:MM | **Triage:** Initial assessment and severity assignment | [Person] |
| HH:MM | **Escalation:** Who was paged/notified | [Person] |
| HH:MM | **Investigation:** Key diagnostic steps taken | [Person] |
| HH:MM | **Root Cause Identified:** When the cause was found | [Person] |
| HH:MM | **Mitigation Applied:** Temporary fix to stop bleeding | [Person] |
| HH:MM | **Resolution:** Full fix deployed and verified | [Person] |
| HH:MM | **All Clear:** Monitoring confirms stable recovery | [Person] |

### Key Metrics During Incident

| Metric | Pre-Incident | During Incident | Post-Resolution |
|--------|-------------|-----------------|-----------------|
| Error rate | [X%] | [Y%] | [Z%] |
| Latency (p95) | [X ms] | [Y ms] | [Z ms] |
| Availability | [X%] | [Y%] | [Z%] |
| Throughput | [X req/s] | [Y req/s] | [Z req/s] |

---

## 4. Root Cause Analysis

### What happened (technical)

Provide a detailed technical explanation of the failure chain. Use specific system names, error messages, and data points.

```
[Include relevant error messages, log snippets, or stack traces]
```

### 5 Whys Analysis

| Level | Question | Answer |
|-------|----------|--------|
| Why 1 | Why did [symptom] occur? | [Answer] |
| Why 2 | Why did [answer 1] happen? | [Answer] |
| Why 3 | Why did [answer 2] happen? | [Answer] |
| Why 4 | Why did [answer 3] happen? | [Answer] |
| Why 5 | Why did [answer 4] happen? | [Root cause] |

### Contributing Factors

List all factors that contributed to the incident or made it worse:

1. **[Factor 1]:** [Description and how it contributed]
2. **[Factor 2]:** [Description and how it contributed]
3. **[Factor 3]:** [Description and how it contributed]

### What went well

What worked correctly during the incident response?

1. [Thing that went well]
2. [Thing that went well]
3. [Thing that went well]

### What went poorly

What made the incident worse or slower to resolve?

1. [Thing that went poorly]
2. [Thing that went poorly]
3. [Thing that went poorly]

### Where we got lucky

What could have made this incident much worse?

1. [Lucky circumstance]
2. [Lucky circumstance]

---

## 5. Detection Analysis

How was the incident detected and how can we detect it faster next time?

| Question | Answer |
|----------|--------|
| How was it detected? | [Alert / Customer report / Manual check / Accident] |
| Time to detect (TTD) | [Minutes from incident start to detection] |
| Could monitoring have caught it sooner? | [Yes/No -- explain] |
| Were existing alerts triggered? | [Yes/No -- which ones] |
| Were alerts actionable? | [Yes/No -- explain] |

### Detection Gaps
- [Gap 1: What monitoring was missing]
- [Gap 2: What alert should have fired]

---

## 6. Resolution Details

### Immediate Mitigation
What was done to stop the bleeding?

```
[Commands run, config changes, rollbacks, etc.]
```

### Permanent Fix
What is the long-term fix?

```
[Code changes, architecture changes, process changes]
```

### Verification
How was the fix verified?

- [ ] Automated tests added covering this failure mode
- [ ] Manual verification in staging
- [ ] Manual verification in production
- [ ] Monitoring confirms metrics returned to normal
- [ ] Canary period completed without recurrence

---

## 7. Action Items

Every action item MUST have an owner and a due date. No orphan action items.

### Prevention (Stop this from happening again)

| ID | Action | Owner | Priority | Due Date | Status |
|----|--------|-------|----------|----------|--------|
| P1 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |
| P2 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |
| P3 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |

### Detection (Catch it faster next time)

| ID | Action | Owner | Priority | Due Date | Status |
|----|--------|-------|----------|----------|--------|
| D1 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |
| D2 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |

### Mitigation (Reduce impact if it happens again)

| ID | Action | Owner | Priority | Due Date | Status |
|----|--------|-------|----------|----------|--------|
| M1 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |
| M2 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |

### Process (Improve incident response)

| ID | Action | Owner | Priority | Due Date | Status |
|----|--------|-------|----------|----------|--------|
| R1 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |
| R2 | [Action description] | [Name] | P0/P1/P2 | YYYY-MM-DD | Open |

---

## 8. Communication Log

| Time | Channel | Audience | Message Summary |
|------|---------|----------|-----------------|
| HH:MM | [Slack / Email / Status Page] | [Internal / Customers / Both] | [What was communicated] |
| HH:MM | [Slack / Email / Status Page] | [Internal / Customers / Both] | [What was communicated] |

---

## 9. Lessons Learned

### Key Takeaways
1. [Lesson 1 -- actionable insight]
2. [Lesson 2 -- actionable insight]
3. [Lesson 3 -- actionable insight]

### Patterns Observed
- Is this similar to previous incidents? [Yes/No -- reference INC-YYYY-NNN]
- Does this reveal a systemic weakness? [Yes/No -- describe]
- Should this change our architecture or processes? [Yes/No -- describe]

---

## 10. Follow-Up Schedule

| Date | Activity | Owner |
|------|----------|-------|
| YYYY-MM-DD | Action items review (1 week) | [Name] |
| YYYY-MM-DD | Action items review (1 month) | [Name] |
| YYYY-MM-DD | Verify all action items complete | [Name] |
| YYYY-MM-DD | Retrospective: did fixes work? | [Name] |

---

## Appendix

### Related Incidents
| Incident | Date | Similarity |
|----------|------|-----------|
| INC-YYYY-NNN | YYYY-MM-DD | [How it relates] |

### Related ADRs
| ADR | Relationship |
|-----|-------------|
| ADR-NNN | [Created as result of this incident / Violated by this incident] |

### Raw Data and Artifacts
- [Link to dashboard screenshots]
- [Link to relevant log queries]
- [Link to Slack incident channel archive]
- [Link to relevant PRs/commits]

---

## Postmortem Culture Guidelines

- **Blameless:** Focus on systems, not individuals. "The system allowed X" not "Person Y caused X."
- **Thorough:** Invest time proportional to severity. SEV-1 deserves hours of analysis.
- **Honest:** Document what actually happened, including mistakes and confusion.
- **Actionable:** Every finding should lead to a concrete action item.
- **Shared:** Publish postmortems broadly. Transparency builds trust and prevents recurrence.
- **Followed up:** A postmortem without completed action items is theater.

---

## Usage Notes

- Complete this template within 48 hours of incident resolution for SEV-1, 1 week for SEV-2.
- Share the draft with all incident responders for factual review before publishing.
- Store completed postmortems in `engineering_brain/Incidents/` with filename `INC-YYYY-NNN-[slug].md`.
- Link the postmortem from the incident ticket and relevant Slack channels.
- Review open action items weekly until all are closed.
