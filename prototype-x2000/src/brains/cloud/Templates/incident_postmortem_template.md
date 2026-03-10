# Incident Postmortem Template

## Incident Postmortem: [INC-YYYY-NNN] — [Short Title]

**Incident Date:** [YYYY-MM-DD]
**Postmortem Date:** [YYYY-MM-DD]
**Postmortem Author:** [Name]
**Postmortem Facilitator:** [Name]
**Incident Commander:** [Name during incident]
**Status:** [Draft | Under Review | Final]

---

## Executive Summary

[2-3 sentences summarizing the incident: what happened, how long it lasted, what the customer impact was, and what the root cause was. This should be readable by a non-technical executive.]

**Example:** On 2024-03-15, the order-service experienced a 47-minute outage caused by a database connection pool exhaustion following a deployment that doubled the number of ECS tasks without correspondingly increasing the RDS max_connections parameter. Approximately 12,000 customers were unable to complete orders during the incident window, resulting in an estimated $45,000 in lost revenue.

---

## 1. Incident Classification

| Field | Value |
|-------|-------|
| Severity | [SEV1 / SEV2 / SEV3 / SEV4] |
| Duration | [Total minutes from detection to resolution] |
| Time to Detect (TTD) | [Minutes from start to detection] |
| Time to Mitigate (TTM) | [Minutes from detection to mitigation] |
| Time to Resolve (TTR) | [Minutes from detection to full resolution] |
| Customer Impact | [Number of affected users/requests] |
| Revenue Impact | [$X estimated] |
| SLO Impact | [Error budget consumed: X%] |
| Data Loss | [Yes/No — if yes, describe scope] |
| Recurrence | [First occurrence / Nth recurrence of similar incident] |

### Severity Classification Criteria

| Severity | Criteria |
|----------|---------|
| SEV1 | Complete service outage, data loss, or security breach affecting production |
| SEV2 | Major feature unavailable, significant performance degradation, >10% users affected |
| SEV3 | Minor feature degraded, <10% users affected, workaround available |
| SEV4 | Cosmetic issue, no customer impact, internal tooling affected |

---

## 2. Timeline

*All times in UTC. Include every significant event, decision point, and action taken.*

| Time (UTC) | Event | Actor | Notes |
|-----------|-------|-------|-------|
| HH:MM | [Triggering event — e.g., "Deployment initiated"] | [System/Person] | [Context] |
| HH:MM | [First symptom — e.g., "Error rate begins increasing"] | [System] | [Metric value] |
| HH:MM | [Detection — e.g., "PagerDuty alert fires"] | [Monitoring] | [Alert name] |
| HH:MM | [Acknowledgment — e.g., "On-call acknowledges alert"] | [Person] | |
| HH:MM | [Investigation start — e.g., "On-call begins diagnosis"] | [Person] | [Initial hypothesis] |
| HH:MM | [Escalation — e.g., "Escalated to L2"] | [Person] | [Reason for escalation] |
| HH:MM | [Root cause identified] | [Person] | [How it was identified] |
| HH:MM | [Mitigation applied — e.g., "Rolled back deployment"] | [Person] | [Action taken] |
| HH:MM | [Partial recovery — e.g., "Error rate decreasing"] | [System] | [Metric value] |
| HH:MM | [Full recovery — e.g., "All metrics at baseline"] | [System] | [Verification method] |
| HH:MM | [Incident closed] | [Person] | |

### Timeline Visualization

```
[Triggering Event]              [Detection]        [Root Cause ID]    [Full Recovery]
       │                             │                    │                  │
───────┼─────────────────────────────┼────────────────────┼──────────────────┼───→ time
       │                             │                    │                  │
       │←── TTD: X min ──────────→│←── Diagnosis ──→│←── Fix ────────→│
       │                             │                    │                  │
       │←──────────────────── Total Duration: X min ──────────────────────→│
```

---

## 3. Impact Assessment

### Customer Impact

| Metric | Value |
|--------|-------|
| Users affected | [Number] |
| Requests failed | [Number] |
| Error rate (peak) | [X%] |
| Latency (peak p99) | [Xms] |
| Features unavailable | [List] |
| Geographic regions affected | [List] |

### Business Impact

| Metric | Value |
|--------|-------|
| Estimated revenue loss | [$X] |
| SLA credits owed | [$X] |
| Error budget consumed | [X% of monthly/quarterly budget] |
| Support tickets generated | [Number] |
| Social media mentions | [Number and sentiment] |

### Infrastructure Impact

| Metric | Value |
|--------|-------|
| Services affected | [List of services] |
| Regions affected | [List of regions] |
| Cascading failures | [Yes/No — describe if yes] |
| Data integrity | [Verified intact / Describe issues] |
| Recovery actions required | [List any manual recovery steps post-incident] |

---

## 4. Root Cause Analysis

### Root Cause

[Detailed technical description of the root cause. Be specific and precise. This should explain the complete causal chain from trigger to customer impact.]

**Example:** The deployment pipeline scaled the ECS service from 4 to 8 tasks to handle increased traffic. Each task opens 50 database connections via the connection pool. The RDS instance was configured with max_connections=200. With 8 tasks x 50 connections = 400 required connections exceeding the 200 limit, half the tasks could not establish database connections. Health checks failed for connection-starved tasks, causing the ALB to return 503 errors. The auto-scaler interpreted the failing health checks as under-capacity and attempted to launch additional tasks, further exacerbating the connection exhaustion.

### Contributing Factors

| Factor | Type | Description |
|--------|------|------------|
| [Factor 1] | [Technical / Process / Human] | [How this contributed to the incident] |
| [Factor 2] | [Technical / Process / Human] | [How this contributed to the incident] |
| [Factor 3] | [Technical / Process / Human] | [How this contributed to the incident] |

**Example contributing factors:**
- **Technical:** No connection pooler (PgBouncer) between application and database
- **Process:** Deployment checklist did not include database capacity verification
- **Process:** Auto-scaler did not have a maximum task limit configured
- **Human:** On-call engineer unfamiliar with database connection architecture, delayed diagnosis

### Five Whys Analysis

| Level | Question | Answer |
|-------|----------|--------|
| Why 1 | Why did customers see errors? | ALB returned 503 because ECS tasks failed health checks |
| Why 2 | Why did tasks fail health checks? | Tasks could not connect to the database |
| Why 3 | Why could tasks not connect? | Database max_connections (200) exhausted by 400 requested connections |
| Why 4 | Why were 400 connections needed? | Deployment doubled task count without adjusting connection limits |
| Why 5 | Why was connection capacity not checked? | No automated validation of database capacity during deployment |

### Fault Tree

```
                    [Customer-Facing Errors]
                            │
                    [ALB Returns 503]
                            │
                [ECS Tasks Fail Health Checks]
                            │
            [Database Connection Exhaustion]
                     │              │
        [Task Count Doubled]  [Max Connections Static]
                     │              │
        [Auto-scaler Response]  [No Capacity Validation]
                     │              │
    [No Max Task Limit]     [Missing Deployment Check]
```

---

## 5. Detection Analysis

### How Was the Incident Detected?

| Method | Details |
|--------|---------|
| Detection mechanism | [Alert / Customer report / Manual observation] |
| Alert name | [Name of the alert that fired, or "N/A" if no alert] |
| Alert threshold | [What threshold was configured] |
| Time from incident start to detection | [X minutes] |

### Detection Effectiveness

| Question | Answer |
|----------|--------|
| Was the detection fast enough? | [Yes/No — explain] |
| Could we have detected earlier? | [Yes/No — what would have caught it sooner?] |
| Were there earlier warning signals missed? | [Describe any precursors] |
| Are existing alerts sufficient? | [Yes/No — what is missing?] |

---

## 6. Response Analysis

### What Went Well

- [Specific positive action 1 — e.g., "Incident commander established clear communication within 5 minutes"]
- [Specific positive action 2 — e.g., "Runbook for database issues was accurate and up to date"]
- [Specific positive action 3 — e.g., "Rollback was executed cleanly within 3 minutes"]

### What Could Be Improved

- [Specific improvement 1 — e.g., "On-call engineer spent 15 minutes looking at wrong service before identifying the affected component"]
- [Specific improvement 2 — e.g., "Status page was not updated until 20 minutes into the incident"]
- [Specific improvement 3 — e.g., "No pre-existing runbook for connection pool exhaustion"]

### Where We Got Lucky

- [Specific lucky break 1 — e.g., "The incident happened during low-traffic hours; during peak it would have affected 10x more customers"]
- [Specific lucky break 2 — e.g., "A senior engineer happened to be online and recognized the pattern immediately"]

---

## 7. Action Items

*Every action item must have an owner, a priority, a deadline, and a tracking ticket.*

### Immediate Actions (This Sprint)

| # | Action | Type | Owner | Deadline | Ticket | Status |
|---|--------|------|-------|----------|--------|--------|
| 1 | [e.g., Add PgBouncer connection pooler] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |
| 2 | [e.g., Add deployment check for DB capacity] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |
| 3 | [e.g., Set auto-scaler max task limit] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |

### Short-Term Actions (This Quarter)

| # | Action | Type | Owner | Deadline | Ticket | Status |
|---|--------|------|-------|----------|--------|--------|
| 4 | [e.g., Add connection count alert per task] | Detect | [Name] | [Date] | [JIRA-XXX] | [Open] |
| 5 | [e.g., Create runbook for connection exhaustion] | Respond | [Name] | [Date] | [JIRA-XXX] | [Open] |
| 6 | [e.g., Load test deployment scaling scenarios] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |

### Long-Term Actions (Next Quarter)

| # | Action | Type | Owner | Deadline | Ticket | Status |
|---|--------|------|-------|----------|--------|--------|
| 7 | [e.g., Implement connection-aware auto-scaling] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |
| 8 | [e.g., Database capacity planning automation] | Prevent | [Name] | [Date] | [JIRA-XXX] | [Open] |

**Action Item Types:**
- **Prevent:** Stops this class of incident from recurring
- **Detect:** Catches this class of incident faster
- **Respond:** Improves response speed or quality
- **Process:** Changes process or policy

---

## 8. Lessons Learned

### Technical Lessons

- [Lesson 1 — e.g., "Connection pool sizing must be validated against database limits before any scaling operation"]
- [Lesson 2 — e.g., "Auto-scaler feedback loops can amplify failures when health checks fail for non-capacity reasons"]

### Process Lessons

- [Lesson 1 — e.g., "Deployment checklists must include downstream capacity verification"]
- [Lesson 2 — e.g., "Status page updates should be automated on alert trigger"]

### Organizational Lessons

- [Lesson 1 — e.g., "Cross-training on database architecture needed for on-call rotation"]

---

## 9. Metrics and Trends

### Incident Metrics Summary

| Metric | This Incident | Team Average (Last 6 Months) | Trend |
|--------|--------------|------------------------------|-------|
| TTD (Time to Detect) | [X min] | [Y min] | [Better/Worse/Same] |
| TTM (Time to Mitigate) | [X min] | [Y min] | [Better/Worse/Same] |
| TTR (Time to Resolve) | [X min] | [Y min] | [Better/Worse/Same] |
| Customer Impact Duration | [X min] | [Y min] | [Better/Worse/Same] |

### Similar Past Incidents

| Incident ID | Date | Similarity | Outcome |
|------------|------|-----------|---------|
| [INC-YYYY-NNN] | [Date] | [What was similar] | [Was it fully remediated?] |

---

## 10. Postmortem Meeting Notes

**Date:** [YYYY-MM-DD]
**Attendees:** [List of names]
**Duration:** [X minutes]

### Discussion Points

- [Key discussion point 1]
- [Key discussion point 2]
- [Key discussion point 3]

### Decisions Made

- [Decision 1]
- [Decision 2]

### Open Questions

- [Question that requires further investigation]

---

## Appendix

### A. Supporting Evidence

| Evidence | Location | Description |
|----------|----------|------------|
| Dashboard screenshot | [Link/path] | [What it shows] |
| Log samples | [Link/path] | [Relevant log entries] |
| Metric graphs | [Link/path] | [Error rate, latency, etc.] |
| Configuration diff | [Link/path] | [Change that triggered incident] |

### B. Communication Log

| Time | Channel | Message Summary |
|------|---------|----------------|
| [HH:MM] | [Slack #incidents] | [Initial report] |
| [HH:MM] | [Status page] | [Customer notification] |
| [HH:MM] | [Email] | [Stakeholder update] |

---

## Cross-References

- `Templates/runbook_template.md` — Create/update runbook based on findings
- `Patterns/microservices_deployment_pattern.md` — Update deployment procedures
- `Patterns/disaster_recovery_pattern.md` — DR improvements from findings
- `06_reliability/site_reliability.md` — SLO and error budget impact
- `06_reliability/observability.md` — Monitoring and alerting improvements

