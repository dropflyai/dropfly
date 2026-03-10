# Incident / Postmortem Report Template

> A structured template for documenting operational incidents, conducting root cause analysis, and capturing corrective actions -- applicable to production outages, process failures, security incidents, and customer-impacting events.

---

## Incident Header

| Field | Input |
|-------|-------|
| Incident Title | |
| Incident ID | INC-_____ |
| Severity | [ ] SEV-1 (Critical) [ ] SEV-2 (Major) [ ] SEV-3 (Minor) [ ] SEV-4 (Low) |
| Status | [ ] Open [ ] Investigating [ ] Mitigated [ ] Resolved [ ] Closed |
| Incident Commander | |
| Report Author | |
| Date of Incident | |
| Time Detected | |
| Time Resolved | |
| Total Duration | |
| Report Date | |
| Report Status | [ ] Draft [ ] In Review [ ] Final |

---

## Section 1: Incident Summary

### Executive Summary

*3-5 sentence summary of what happened, who was affected, how it was resolved, and what is being done to prevent recurrence.*

___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

### Impact Assessment

| Dimension | Impact |
|-----------|--------|
| Customers affected | (count or percentage) |
| Revenue impact | $ (estimated lost or at-risk revenue) |
| SLA breach | [ ] Yes [ ] No -- SLA: _____ Actual: _____ |
| Data loss | [ ] Yes [ ] No -- Scope: _____ |
| Reputation impact | [ ] None [ ] Minor [ ] Moderate [ ] Significant |
| Internal productivity impact | (hours lost across team) |
| Regulatory implications | [ ] None [ ] Reporting required [ ] Investigation triggered |

### Severity Classification

| Severity | Criteria |
|----------|----------|
| SEV-1 (Critical) | Complete service outage, data breach, widespread customer impact |
| SEV-2 (Major) | Partial service degradation, significant customer impact, SLA breach |
| SEV-3 (Minor) | Limited impact, workaround available, small customer subset affected |
| SEV-4 (Low) | Minimal impact, no customer-facing effect, internal inconvenience |

---

## Section 2: Timeline

### Detailed Timeline

| Time (UTC) | Event | Actor | Notes |
|-----------|-------|-------|-------|
| | Incident begins (actual start, may predate detection) | System/Person | |
| | Incident detected | | How was it detected? |
| | Alert/notification triggered | | What monitoring caught it? |
| | Incident commander assigned | | |
| | Investigation begins | | |
| | Root cause identified | | |
| | Mitigation applied | | |
| | Service restored | | |
| | Incident declared resolved | | |
| | Customer communication sent | | |
| | Postmortem scheduled | | |
| | Postmortem completed | | |

### Key Time Metrics

| Metric | Value | Target | Met? |
|--------|-------|--------|------|
| Time to Detect (TTD) | min | min | [ ] Yes [ ] No |
| Time to Acknowledge (TTA) | min | min | [ ] Yes [ ] No |
| Time to Mitigate (TTM) | min | min | [ ] Yes [ ] No |
| Time to Resolve (TTR) | min | min | [ ] Yes [ ] No |
| Total Downtime | min | min | [ ] Yes [ ] No |

---

## Section 3: Root Cause Analysis

### What Happened (Narrative)

*Detailed description of the incident from trigger through resolution. Be factual and specific. Avoid blame.*

___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________
___________________________________________________________________________

### 5 Whys Analysis

| Level | Why | Answer |
|-------|-----|--------|
| Why 1 | Why did the incident occur? | |
| Why 2 | Why did [answer to Why 1] happen? | |
| Why 3 | Why did [answer to Why 2] happen? | |
| Why 4 | Why did [answer to Why 3] happen? | |
| Why 5 | Why did [answer to Why 4] happen? | |

**Root cause:** ___________________________________________

### Contributing Factors

| Factor | Category | Description |
|--------|----------|-------------|
| | [ ] Technical [ ] Process [ ] Human [ ] External | |
| | [ ] Technical [ ] Process [ ] Human [ ] External | |
| | [ ] Technical [ ] Process [ ] Human [ ] External | |

### What Went Well

| Item | Details |
|------|---------|
| | |
| | |
| | |

### What Went Poorly

| Item | Details |
|------|---------|
| | |
| | |
| | |

### Where We Got Lucky

*Factors that prevented the incident from being worse -- these represent hidden risks.*

| Item | Details |
|------|---------|
| | |
| | |

---

## Section 4: Detection Analysis

| Question | Answer |
|----------|--------|
| How was the incident detected? | [ ] Monitoring alert [ ] Customer report [ ] Internal observation [ ] Automated test |
| Should it have been detected sooner? | [ ] Yes [ ] No |
| What monitoring was in place? | |
| What monitoring was missing? | |
| Was the alerting threshold appropriate? | [ ] Yes [ ] No -- Should be: _____ |
| Did the on-call process work? | [ ] Yes [ ] No |
| Were the right people notified? | [ ] Yes [ ] No |

---

## Section 5: Response Analysis

| Question | Answer |
|----------|--------|
| Was the incident response process followed? | [ ] Yes [ ] Partially [ ] No |
| Was the right incident commander assigned? | [ ] Yes [ ] No |
| Were runbooks available and helpful? | [ ] Yes [ ] Partially [ ] No [ ] No runbook exists |
| Was communication clear and timely? | [ ] Yes [ ] No |
| Were the right team members involved? | [ ] Yes [ ] No |
| Was there a handoff during the incident? | [ ] Yes (smooth) [ ] Yes (problematic) [ ] No |

---

## Section 6: Customer Communication

| Communication | Time | Channel | Audience | Content Summary |
|--------------|------|---------|----------|----------------|
| Initial notification | | [ ] Status page [ ] Email [ ] In-app [ ] Social | | |
| Update 1 | | [ ] Status page [ ] Email [ ] In-app [ ] Social | | |
| Resolution notification | | [ ] Status page [ ] Email [ ] In-app [ ] Social | | |
| Postmortem summary (if shared) | | [ ] Blog [ ] Email [ ] Status page | | |

### Communication Assessment

| Question | Answer |
|----------|--------|
| Was the customer communication timely? | [ ] Yes [ ] No |
| Was the communication accurate? | [ ] Yes [ ] No |
| Was the tone appropriate? | [ ] Yes [ ] No |
| Did customers express concerns about communication? | [ ] Yes [ ] No |

---

## Section 7: Corrective and Preventive Actions

### Action Items

| ID | Action | Type | Owner | Priority | Due Date | Status |
|----|--------|------|-------|----------|----------|--------|
| AI-1 | | [ ] Fix [ ] Prevent [ ] Detect [ ] Respond | | [ ] P0 [ ] P1 [ ] P2 | | [ ] Open [ ] In Progress [ ] Complete [ ] Verified |
| AI-2 | | [ ] Fix [ ] Prevent [ ] Detect [ ] Respond | | [ ] P0 [ ] P1 [ ] P2 | | [ ] Open [ ] In Progress [ ] Complete [ ] Verified |
| AI-3 | | [ ] Fix [ ] Prevent [ ] Detect [ ] Respond | | [ ] P0 [ ] P1 [ ] P2 | | [ ] Open [ ] In Progress [ ] Complete [ ] Verified |
| AI-4 | | [ ] Fix [ ] Prevent [ ] Detect [ ] Respond | | [ ] P0 [ ] P1 [ ] P2 | | [ ] Open [ ] In Progress [ ] Complete [ ] Verified |
| AI-5 | | [ ] Fix [ ] Prevent [ ] Detect [ ] Respond | | [ ] P0 [ ] P1 [ ] P2 | | [ ] Open [ ] In Progress [ ] Complete [ ] Verified |

**Action types:**
- **Fix:** Remediate the immediate cause.
- **Prevent:** Prevent this class of incident from recurring.
- **Detect:** Improve detection so we find it faster next time.
- **Respond:** Improve response process for faster resolution.

### Systemic Improvements

| Improvement | Category | Impact | Effort |
|------------|----------|--------|--------|
| | [ ] Monitoring [ ] Architecture [ ] Process [ ] Training [ ] Tooling | | |
| | [ ] Monitoring [ ] Architecture [ ] Process [ ] Training [ ] Tooling | | |

---

## Section 8: Postmortem Meeting Notes

| Field | Input |
|-------|-------|
| Meeting Date | |
| Attendees | |
| Duration | |
| Facilitator | |

### Key Discussion Points

1. ___________________________________________
2. ___________________________________________
3. ___________________________________________

### Decisions Made

1. ___________________________________________
2. ___________________________________________

### Follow-Up Items

| Item | Owner | Due |
|------|-------|-----|
| | | |
| | | |

---

## Section 9: Metrics and Trends

### Incident Category Tracking

| Category | This Incident | Last 30 Days | Last 90 Days | Trend |
|----------|-------------|-------------|-------------|-------|
| Total incidents (this severity) | 1 | | | |
| Similar root cause incidents | | | | |
| Mean time to detect (category avg) | min | min | min | |
| Mean time to resolve (category avg) | min | min | min | |

### Postmortem Quality Checklist

- [ ] Timeline documented with accurate timestamps
- [ ] Root cause identified (not just symptoms)
- [ ] 5 Whys analysis reaches a systemic cause
- [ ] All corrective actions have owners and deadlines
- [ ] Actions include prevention, not just fixes
- [ ] No blame assigned to individuals
- [ ] Lessons learned are actionable and specific
- [ ] Report reviewed by incident commander and stakeholders
- [ ] Report shared with the team for learning

---

**Blameless postmortems are the foundation of operational excellence. The goal is to understand what happened and prevent recurrence -- not to assign blame. If people fear punishment, they will hide problems. If problems are hidden, they cannot be fixed.**

---

*Template version: 1.0*
*Brain: Operations Brain*
*Reference: 08_excellence/, 06_metrics/*
