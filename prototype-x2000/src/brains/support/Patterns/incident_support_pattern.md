# Pattern: Incident Support Communication

## Context

This pattern applies when a service incident (outage, degradation, security event, or
data issue) affects customers and requires coordinated support team response. It covers
the customer-facing dimension of incident management: communication strategy, mass
notification, individual ticket handling, customer recovery, and post-incident
follow-up. For technical incident response, consult the Engineering Brain.

---

## Problem

During incidents, support teams face a simultaneous surge in ticket volume, heightened
customer emotion, pressure for information that may not yet be available, coordination
challenges with engineering, and the need to maintain service for non-incident tickets.
Without a predefined playbook, the result is inconsistent communication, delayed
responses, conflicting information, and lasting customer trust damage.

---

## Solution: The Incident Support Playbook

```
TRIGGER → ACTIVATE → COMMUNICATE → MANAGE → RESOLVE → RECOVER → LEARN
```

Each phase has defined owners, actions, templates, and SLAs.

---

## Implementation

### Phase 1: Trigger and Classification

```
INCIDENT DETECTED:
  Source: Engineering monitoring, customer reports, status page alert

  SUPPORT ROLE: Classify customer impact
    Severity:  SEV-1 (critical), SEV-2 (major), SEV-3 (minor)
    Scope:     All users, subset, region, plan tier
    Channels:  Which support channels are being impacted?
    Volume:    Estimated ticket volume from this incident

  DECISION: Activate incident support protocol?
    SEV-1: Always activate (full protocol)
    SEV-2: Activate if expected volume > 20 tickets/hour
    SEV-3: Monitor only; activate if volume exceeds threshold
```

### Phase 2: Activate Incident Support Mode

```
INCIDENT COMMANDER (SUPPORT):
  Designate one support leader as incident commander
  Responsibilities:
    - Single point of contact with engineering incident team
    - Craft all customer-facing communications
    - Coordinate support agent response
    - Report to VP Support with status updates

AGENT BRIEFING (within 15 minutes of activation):
  Channels: Slack #support-incidents or equivalent
  Message:
    "INCIDENT ACTIVE: [Brief description]
     Affected: [Who is affected]
     Workaround: [If any, or 'None yet']
     Canned response: [Link to approved response]
     DO: Use the canned response for incident-related tickets
     DO: Tag all incident tickets with [incident tag]
     DO NOT: Troubleshoot incident issues individually
     DO NOT: Speculate on cause or timeline
     DO NOT: Share engineering-internal details
     UPDATES: Every [30/60] minutes in this channel"

QUEUE MANAGEMENT:
  - Create incident-specific ticket tag/category
  - Auto-tag incoming tickets matching incident keywords
  - Adjust routing: incident tickets to dedicated handlers or auto-respond
  - Protect non-incident queue: ensure other tickets still get served
```

### Phase 3: External Communication

```
COMMUNICATION SEQUENCE:

  T+15 min (SEV-1) / T+30 min (SEV-2): INITIAL ACKNOWLEDGMENT
    Channels: Status page, in-app banner, email (for subscribers)
    Template:
      "[Service] — [Issue Description]
       We are aware of an issue affecting [description of what is broken]
       for [who is affected]. Our team is investigating.
       We will provide updates every [30/60] minutes.
       [Workaround if available]"

  Every 30 min (SEV-1) / 60 min (SEV-2): PROGRESS UPDATE
    Channels: Status page update, in-app banner refresh
    Template:
      "Update [#N] at [time]:
       Status: [Investigating / Identified / Monitoring]
       What we know: [New information]
       What we are doing: [Current actions]
       Expected timeline: [ETA or 'under investigation']
       [Updated workaround if new]"

  AT RESOLUTION: RESOLUTION NOTICE
    Channels: Status page, email to all subscribers, in-app
    Template:
      "[Resolved] [Service] — [Issue Description]
       The issue has been resolved as of [time].
       Duration: [start to end]
       What happened: [Non-technical explanation]
       What we did: [How it was fixed]
       Next steps: [Any customer action needed]
       We apologize for the disruption."

  T+24-72 hours: POST-INCIDENT REPORT
    Channels: Email to affected customers, blog post (for major incidents)
    Content: Full timeline, root cause, impact, remediation, prevention
```

### Phase 4: Individual Ticket Management

```
INCOMING INCIDENT TICKETS:

  AUTO-RESPONSE (immediate):
    "Thank you for reaching out. We are currently aware of an issue
     affecting [description]. Our team is actively working to resolve
     it and we are providing updates on our status page: [URL].

     [If workaround: 'In the meantime, you can [workaround].']

     Your ticket is linked to this incident and will be updated when
     resolved. You do not need to take any additional action."

  FOLLOW-UP (when resolved):
    "Good news — the issue affecting [description] has been resolved
     as of [time]. [Brief explanation of what happened.]

     If you continue to experience any issues, please reply to this
     ticket and we'll investigate further.

     We apologize for the inconvenience."

  CUSTOMER ASKS FOR MORE DETAIL:
    "I understand your concern. Here is the latest information:
     [Paste status page update]

     Our engineering team is [specific action]. I'll personally
     follow up as soon as I have more information."

  ANGRY/THREATENING CUSTOMER:
    Apply de-escalation framework (05_escalation/escalation_framework.md)
    If churn threat + high ARR: escalate to support manager
    If legal threat: notify manager → legal
```

### Phase 5: Resolution and Recovery

```
IMMEDIATE (at resolution):
  1. Update status page to "Resolved"
  2. Send resolution email to all subscribers
  3. Close all auto-responded incident tickets (batch)
  4. Follow up on tickets with customer-specific issues (not auto-close)

WITHIN 24 HOURS:
  1. Credit assessment:
     - Did the incident breach SLA? → Auto-apply credit
     - Enterprise customers affected? → Proactive credit + personal email
     - Calculate credit amounts per policy
  2. High-value customer outreach:
     - Phone call or personal email to accounts > $50K ARR
     - Acknowledge the impact on their business specifically
     - Confirm the resolution and prevention measures

WITHIN 72 HOURS:
  1. Customer-facing post-incident report published
  2. All outstanding incident tickets resolved
  3. KB articles updated with any new information
  4. Canned responses updated for similar future incidents

WITHIN 2 WEEKS:
  1. Check-in with customers who expressed strong dissatisfaction
  2. Verify no recurring issues from the incident
  3. Measure CSAT for incident-related tickets
```

### Phase 6: Post-Incident Review (Support Perspective)

```
SUPPORT POST-MORTEM:

  TIMING: Within 1 week of resolution
  ATTENDEES: Support incident commander, team leads, VP Support,
             engineering incident commander (guest)

  REVIEW QUESTIONS:
    1. Detection: How quickly did support become aware?
    2. Communication: Were all SLAs met (initial, updates, resolution)?
    3. Accuracy: Was all customer communication accurate?
    4. Coverage: Were non-incident tickets adequately served?
    5. Volume: How many tickets were generated? (vs. prediction)
    6. Customer impact: What was CSAT for incident tickets?
    7. Recovery: Were credits applied correctly and promptly?
    8. Team: How did agents handle the pressure? Any burnout indicators?

  OUTPUTS:
    - List of what went well
    - List of what needs improvement
    - Action items with owners and deadlines
    - Updated incident playbook (if needed)
    - Updated templates and canned responses (if needed)
```

---

## Metrics

| Metric | Target | How to Measure |
|--------|--------|---------------|
| Time to first customer communication | <15 min (SEV-1), <30 min (SEV-2) | Timestamp comparison |
| Update cadence adherence | 100% | Were all scheduled updates sent? |
| Communication accuracy | 100% | Post-incident review |
| Incident ticket CSAT | Within 5% of overall CSAT | Survey data |
| Credit application time | <24 hours post-resolution | Billing system data |
| Non-incident SLA impact | <5% degradation | SLA compliance comparison |
| Post-incident report delivery | <72 hours | Publication timestamp |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| **Silence during investigation** | Customers assume you are unaware; trust collapses |
| **"Some users may experience issues"** | Vague; tells customer nothing useful |
| **Blaming third parties** | Looks like avoiding responsibility |
| **Different info from different agents** | Inconsistency destroys credibility |
| **Troubleshooting individual incident tickets** | Wastes agent time on systemic issue |
| **Forgetting non-incident tickets** | Other customers suffer collateral damage |
| **No post-incident follow-up** | Misses recovery opportunity; trust not restored |
| **Skipping the post-mortem** | Same mistakes repeat on next incident |

---

## Incident Readiness Checklist

```
QUARTERLY VERIFICATION:

  □ Status page operational and tested
  □ Subscriber list current
  □ Communication templates reviewed and updated
  □ Canned responses for agents reviewed
  □ Incident commander rotation schedule current
  □ Engineering escalation contacts current
  □ Credit policy and authority matrix current
  □ Agent training on incident protocol completed (last 90 days)
  □ Incident drill conducted (last 90 days)
  □ Post-incident report template current
```

---

**This pattern is authoritative for incident support within the Support Brain.**
