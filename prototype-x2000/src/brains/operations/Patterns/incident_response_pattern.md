# Incident Response Pattern

> A structured pattern for detecting, responding to, resolving, and learning from operational incidents -- from initial detection through root cause analysis and preventive action.

---

## Context

This pattern applies when an unplanned disruption affects operational performance, service availability, data integrity, or customer experience. It covers the full incident lifecycle: detection, triage, response, resolution, communication, and post-incident learning.

**Use this pattern when:**
- A service outage or degradation is detected or reported
- A critical process failure impacts customers or revenue
- A security event requires coordinated response
- A data integrity issue is discovered
- An external dependency failure cascades into operations
- Any event triggers a severity threshold defined in operational SLAs

**Do NOT use this pattern for:**
- Planned maintenance or change management (use change management process)
- Minor bugs that do not affect service (use standard defect workflow)
- Feature requests disguised as incidents

---

## Severity Classification

| Severity | Definition | Response Time | Update Cadence | Escalation |
|----------|-----------|--------------|---------------|------------|
| SEV-1 (Critical) | Complete service outage or data loss affecting all users | Immediate (< 15 min) | Every 30 min | VP/C-level within 1 hour |
| SEV-2 (Major) | Significant degradation affecting many users, no workaround | < 30 min | Every 1 hour | Director within 2 hours |
| SEV-3 (Moderate) | Partial degradation, workaround available | < 2 hours | Every 4 hours | Manager within 4 hours |
| SEV-4 (Minor) | Cosmetic or low-impact issue, minimal user effect | < 8 hours | Daily | Standard queue |

**Escalation rule:** If an incident is not resolved within 2x the expected resolution time for its severity, escalate one level.

---

## Phase 1: Detection and Triage (Minutes 0-15)

### Objective
Identify the incident, classify severity, and activate the appropriate response team.

### Detection Sources

| Source | Signal | Typical Severity |
|--------|--------|-----------------|
| Automated monitoring / alerting | Threshold breach, health check failure | SEV-1 to SEV-3 |
| Customer reports (support tickets) | Multiple users reporting same issue | SEV-2 to SEV-3 |
| Internal team observation | Engineer or operator notices anomaly | SEV-2 to SEV-4 |
| Third-party status page | Vendor outage notification | SEV-1 to SEV-3 |
| Scheduled health checks | Periodic audit reveals degradation | SEV-3 to SEV-4 |

### Triage Checklist

- [ ] Confirm the incident is real (not a false alarm or monitoring artifact)
- [ ] Determine scope: how many users, services, or processes are affected
- [ ] Assign initial severity using the classification table above
- [ ] Identify the incident commander (IC) -- single point of accountability
- [ ] Open the incident channel (Slack, Teams, or war room)
- [ ] Log the incident in the tracking system with a unique ID
- [ ] Page the on-call team for the affected service

### Key Time Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Time to Detect (TTD) | Alert fires to human acknowledgment | < 5 min (SEV-1) |
| Time to Triage | Acknowledgment to severity assignment | < 10 min (SEV-1) |
| Time to Assemble | Severity assignment to response team assembled | < 15 min (SEV-1) |

---

## Phase 2: Response and Containment (Minutes 15-60)

### Objective
Stop the bleeding. Contain the impact and prevent the incident from spreading.

### Incident Commander Responsibilities

The IC owns the incident from triage through resolution. The IC does NOT fix the problem -- the IC coordinates.

| Responsibility | Description |
|---------------|-------------|
| Coordination | Direct the response team, assign tasks, track progress |
| Communication | Provide status updates at the defined cadence |
| Escalation | Escalate severity or bring in additional resources as needed |
| Decision-making | Make time-critical decisions (e.g., rollback vs. forward-fix) |
| Documentation | Ensure the timeline is being logged in real time |

### Containment Strategies

| Strategy | When to Use | Trade-Off |
|----------|-----------|-----------|
| Rollback | Bad deployment caused the issue | Reverts all changes, including good ones |
| Feature flag disable | Feature-specific failure | Targeted, low blast radius |
| Traffic reroute | Infrastructure or region failure | Requires redundant capacity |
| Rate limiting | Overload or abuse scenario | Degrades experience for legitimate users |
| Manual workaround | Automated process failure | Increases labor cost, may be error-prone |
| Vendor failover | Third-party dependency failure | Requires pre-configured backup |

### Containment Checklist

- [ ] Impact is contained -- incident is not spreading to new systems or users
- [ ] Workaround is available (if applicable) and communicated to affected users
- [ ] Customer-facing communication is sent (status page, email, in-app banner)
- [ ] Internal stakeholders are notified (leadership, sales, customer success)
- [ ] Timeline is being actively logged with timestamps

---

## Phase 3: Resolution (Minutes 60 to Resolution)

### Objective
Restore full service to normal operating conditions.

### Resolution Approaches

| Approach | Description | Best For |
|----------|-----------|----------|
| Root cause fix | Identify and fix the underlying issue | When root cause is known and fixable quickly |
| Workaround promotion | Make the temporary workaround permanent (short term) | When root cause fix requires extended development |
| Partial restoration | Restore most functionality, defer edge cases | When full fix is complex but core value can be restored |
| Vendor resolution | Wait for or coordinate with third-party vendor | When the issue is outside your control |

### Resolution Checklist

- [ ] Service is restored to normal performance levels
- [ ] All affected users can access the service normally
- [ ] Monitoring confirms metrics are back within healthy thresholds
- [ ] No secondary incidents were introduced by the fix
- [ ] Customer-facing status page updated to "Resolved"
- [ ] Internal communication sent confirming resolution

### Key Resolution Metrics

| Metric | Definition | Target by Severity |
|--------|-----------|-------------------|
| Time to Mitigate (TTM) | Detection to impact contained | SEV-1: < 30 min, SEV-2: < 1 hr |
| Time to Resolve (TTR) | Detection to full resolution | SEV-1: < 4 hr, SEV-2: < 8 hr |
| Mean Time to Recover (MTTR) | Rolling average of TTR | Track trend quarterly |

---

## Phase 4: Communication (Throughout)

### Objective
Keep all stakeholders informed with appropriate detail at appropriate frequency.

### Communication Matrix

| Audience | Channel | Frequency | Content Level |
|----------|---------|----------|--------------|
| Response team | Incident channel (Slack/Teams) | Continuous | Full technical detail |
| Engineering leadership | Incident channel + direct message | Every major update | Technical summary |
| Executive leadership | Email or direct message | Hourly (SEV-1), 4-hourly (SEV-2) | Business impact focus |
| Customer Success / Sales | Internal status channel | Every major update | Customer impact focus |
| Affected customers | Status page + email | Per severity cadence | User-friendly, no jargon |
| All customers | Status page | At start and resolution | Brief, reassuring |

### Status Update Template

```
INCIDENT UPDATE -- [Incident ID] -- [Severity]
Time: [timestamp]
Status: [Investigating | Identified | Monitoring | Resolved]
Impact: [What users are experiencing]
Current action: [What the team is doing right now]
Next update: [When the next update will be provided]
```

---

## Phase 5: Post-Incident Review (Within 48 Hours)

### Objective
Learn from the incident to prevent recurrence and improve response capability.

### Blameless Postmortem Principles

1. **Focus on systems, not individuals.** The question is "Why did the system allow this?" not "Who caused this?"
2. **Assume good intent.** Everyone was doing their best with the information they had.
3. **Seek contributing factors, not a single root cause.** Incidents are usually multi-causal.
4. **Prioritize prevention over blame.** The goal is corrective action, not punishment.
5. **Document honestly.** Sanitize for external sharing if needed, but internal records must be accurate.

### Postmortem Structure

| Section | Content |
|---------|---------|
| Summary | One paragraph: what happened, impact, duration |
| Timeline | Minute-by-minute log from detection to resolution |
| Root cause analysis | 5 Whys or Fishbone analysis |
| Contributing factors | What made it worse or delayed resolution |
| What went well | Effective detection, fast response, good communication |
| What went poorly | Missed signals, slow escalation, unclear ownership |
| Where we got lucky | Things that could have made it worse but did not |
| Action items | Specific, assigned, time-bound corrective actions |

### Action Item Categories

| Category | Description | Example |
|----------|-----------|---------|
| Fix | Repair the immediate cause | Patch the code, fix the config |
| Prevent | Stop this class of incident from recurring | Add validation, improve testing |
| Detect | Catch it faster next time | New monitoring, better alerting |
| Respond | Improve response capability | Update runbooks, add on-call rotation |

### Action Item Tracking

| ID | Action | Category | Owner | Due Date | Status |
|----|--------|----------|-------|----------|--------|
| AI-01 | | Fix / Prevent / Detect / Respond | | | [ ] Open [ ] In Progress [ ] Done |
| AI-02 | | Fix / Prevent / Detect / Respond | | | [ ] Open [ ] In Progress [ ] Done |
| AI-03 | | Fix / Prevent / Detect / Respond | | | [ ] Open [ ] In Progress [ ] Done |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| No incident commander | Response is chaotic, duplicated effort, conflicting actions | Always assign a single IC immediately |
| Blame culture | People hide information, under-report incidents | Blameless postmortems, focus on systems |
| Skipping postmortems | Same incidents recur, no organizational learning | Mandatory postmortem for SEV-1 and SEV-2 |
| Hero culture | Single responder burns out, no knowledge sharing | Rotate IC role, document runbooks |
| Silent incidents | Customers discover outages before the team communicates | Proactive communication at defined cadence |
| Gold-plating the fix | Spending too long on a perfect fix while users suffer | Contain first, then fix properly afterward |
| Changing severity mid-incident to avoid escalation | Under-reporting impact, delayed response | Escalation is a tool, not a punishment |

---

## Readiness Checklist

Operational readiness to execute this pattern:

- [ ] Severity classification is defined and agreed upon
- [ ] On-call rotation is active with clear escalation paths
- [ ] Incident tracking system is configured (PagerDuty, Opsgenie, etc.)
- [ ] Communication channels and templates are pre-configured
- [ ] Runbooks exist for the most common incident types
- [ ] Status page is operational and integrated
- [ ] Postmortem template and meeting cadence are established
- [ ] Action item tracking system is integrated with sprint planning

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Incident Report Template | `Templates/incident_report_template.md` |
| Crisis Management | `08_excellence/` |
| Operational Metrics (MTTR, MTTD) | `06_metrics/` |
| Engineering Brain (infrastructure) | `/prototype_x1000/engineering_brain/` |
| Security Brain (security incidents) | `/prototype_x1000/security_brain/` |

---

*Pattern version: 1.0*
*Brain: Operations Brain*
*Reference: 08_excellence/, 06_metrics/, 02_process/*
