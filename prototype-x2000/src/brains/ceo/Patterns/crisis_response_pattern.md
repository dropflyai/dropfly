# Crisis Response Pattern -- Structured Response to Organizational Crises

## Situation

This pattern applies when an event threatens the viability, reputation,
or fundamental operations of the organization and requires immediate,
coordinated response beyond normal operating procedures. This includes
security breaches, system outages, PR crises, financial crises, legal
threats, key personnel departures, and market disruptions.

---

## Prerequisites

Before this pattern activates:
- Crisis has been detected or reported
- Initial severity assessment has been performed
- This is confirmed as Severity 1 (Critical) or Severity 2 (Serious)
- For Severity 3-4, use normal operational procedures instead

---

## Approach: Five Phases

### Phase 1: Activate (0-1 Hours)

```
STEP 1: Classify Severity
  Owner: CEO Brain
  Action: Assess impact, urgency, and scope
  Output: Severity level (1-4), crisis type
  Criteria: See crisis_management.md severity matrix

STEP 2: Designate Incident Commander
  Owner: CEO Brain
  Action: For Severity 1, CEO is IC. For Severity 2, delegate to
          most relevant brain leader.
  Output: Named IC with authority

STEP 3: Assemble Response Team
  Owner: Incident Commander
  Action: Identify and activate required brains
  Output: Response team with roles (Communications, Technical, Operations)

STEP 4: Establish War Room
  Owner: Incident Commander
  Action: Create dedicated communication channel, set update cadence
  Output: Active war room, communication protocol
```

**Gate:** Activation complete when IC is in command, team is assembled,
and war room is operational.

### Phase 2: Stabilize (1-4 Hours)

```
STEP 5: Contain the Damage
  Owner: Technical Lead (relevant brain)
  Action: Stop the bleeding -- prevent further damage
  Output: Containment confirmed
  Examples:
    - Security: Isolate compromised systems
    - Outage: Failover to backup, restore partial service
    - PR: Pause all public communications until message is ready
    - Financial: Freeze non-essential spending
    - People: Secure remaining team, prevent cascade departures

STEP 6: Preserve Evidence
  Owner: Technical Lead
  Action: Log everything, capture state before remediation
  Output: Evidence log for post-mortem and potential legal needs

STEP 7: Initial Communication
  Owner: Communications Lead
  Action: Notify affected stakeholders that we are aware and responding
  Output: Initial communication sent to all required audiences
  Template: "We are aware of [issue]. We are actively investigating
            and will provide an update by [time]."
```

**Gate:** Stabilization complete when damage is contained, evidence is
preserved, and stakeholders have been notified.

### Phase 3: Resolve (4-24 Hours)

```
STEP 8: Root Cause Investigation
  Owner: Technical Lead + relevant brain(s)
  Action: Identify root cause using 5 Whys or similar framework
  Output: Root cause identified (or narrowed to likely causes)

STEP 9: Implement Fix
  Owner: Technical Lead
  Action: Fix the root cause or implement robust mitigation
  Output: Fix deployed, verified, and monitored

STEP 10: Verify Resolution
  Owner: QA Brain or relevant brain
  Action: Confirm the fix works and the issue does not recur
  Output: Resolution confirmed, monitoring in place

STEP 11: Detailed Communication
  Owner: Communications Lead
  Action: Provide full update to all stakeholders
  Output: Detailed communication with what happened, what we did,
          and what happens next
```

**Gate:** Resolution complete when root cause is addressed, fix is
verified, and stakeholders are updated.

### Phase 4: Recover (1-7 Days)

```
STEP 12: Customer Remediation
  Owner: Customer Success Brain + Support Brain
  Action: Address any customer impact (credits, apologies, support)
  Output: All affected customers contacted and remediated

STEP 13: Internal Debrief
  Owner: CEO Brain
  Action: Brief the full team on what happened and what we learned
  Output: Internal communication, team alignment

STEP 14: Process Improvements
  Owner: CEO Brain + relevant brains
  Action: Identify systemic improvements to prevent recurrence
  Output: Improvement plan with owners and deadlines
```

**Gate:** Recovery complete when customers are remediated, team is
informed, and improvements are planned.

### Phase 5: Post-Mortem (7-14 Days)

```
STEP 15: Blameless Post-Mortem
  Owner: CEO Brain
  Action: Conduct formal post-mortem (see crisis_management.md template)
  Output: Post-mortem document with root cause, timeline,
          action items, and lessons learned

STEP 16: Share Learnings
  Owner: CEO Brain
  Action: Share post-mortem with full organization
  Output: Org-wide understanding of what happened and what changed

STEP 17: Track Improvements
  Owner: CEO Brain
  Action: Track all improvement action items to completion
  Output: All improvements implemented and verified

STEP 18: Update Playbooks
  Owner: CEO Brain
  Action: Update crisis playbooks with new learnings
  Output: Updated crisis_management.md, updated Patterns/
```

**Gate:** Post-mortem complete when document is published, learnings
are shared, and improvements are tracked.

---

## Brain Routing by Crisis Type

| Crisis Type | Primary Brain | Supporting Brains |
|------------|--------------|-------------------|
| Data breach | Security Brain | Engineering, Legal, Support, Marketing |
| System outage | Engineering Brain | Cloud, QA, Support |
| PR/reputation | Marketing Brain | Content, Social Media, Legal, CEO |
| Financial crisis | Finance Brain | MBA, Legal, CEO |
| Product failure | Product Brain | Engineering, QA, Support, CS |
| People crisis | HR Brain | Legal, CEO |
| Legal threat | Legal Brain | Finance, CEO |
| Competitive threat | MBA Brain | Research, Product, CEO |
| Customer exodus | CS Brain | Product, Support, Analytics, CEO |
| Regulatory action | Legal Brain | Finance, Operations, CEO |

---

## Communication Templates

### Initial Notification (External)

```
Subject: [Company] Status Update

We are aware of [brief description of the issue]. Our team is
actively investigating and working to resolve this as quickly
as possible.

We will provide an update by [specific time].

If you are affected, [specific action they should take].

[CEO Name]
```

### Resolution Communication (External)

```
Subject: [Company] Issue Resolved -- What Happened and What We
Are Doing About It

On [date] at [time], [what happened].

This affected [who/what] for approximately [duration].

Root cause: [honest, clear explanation].

What we did: [actions taken].

What we are changing: [specific improvements to prevent recurrence].

We sincerely apologize for the impact. [Specific remediation offered].

We will share a detailed post-mortem by [date].

[CEO Name]
```

---

## Common Pitfalls

| Pitfall | Description | Prevention |
|---------|------------|-----------|
| Delayed response | Waiting for complete information | Act immediately to contain |
| No IC | Nobody is clearly in charge | First action: designate IC |
| Communication vacuum | Stakeholders hear nothing | Update every 2-4 hours minimum |
| Blame culture | Focus on who instead of what | Blameless post-mortem protocol |
| No post-mortem | Move on without learning | Post-mortem is mandatory |
| Skipping customer remediation | Fix the issue but ignore impact | Customer remediation is Phase 4 |

---

## Timing

```
Phase 1: Activate     [=]         (0-1 hour)
Phase 2: Stabilize    [===]       (1-4 hours)
Phase 3: Resolve      [=======]   (4-24 hours)
Phase 4: Recover      [============] (1-7 days)
Phase 5: Post-Mortem      [======]    (7-14 days)
```

---

**This pattern is activated whenever the organization faces a crisis.
Speed, clarity, and honesty are the three pillars of effective crisis
response. The CEO Brain commands Severity 1 crises directly and
delegates Severity 2 crises with close oversight.**
