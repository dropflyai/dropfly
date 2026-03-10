# Template: Incident Communication

## Purpose

This template provides ready-to-use communication templates for every phase of a
customer-facing incident: initial acknowledgment, ongoing updates, resolution
notification, post-incident report, and internal coordination messages. During an
incident, speed and accuracy of communication are critical. Having pre-written
templates eliminates the cognitive overhead of drafting under pressure. Customize
the bracketed sections with incident-specific details; the structure and tone are
ready to deploy.

---

## How to Use This Template

1. When an incident is detected, select the appropriate template
2. Fill in all `[bracketed text]` with incident-specific details
3. Review for accuracy before publishing (10-second sanity check)
4. Publish to appropriate channels (status page, email, in-app)
5. Set timer for next update (30 min for SEV-1, 60 min for SEV-2)
6. Use the internal templates to coordinate with the team

---

## Template 1: Internal Incident Alert (Slack/Teams)

### Support Team Alert

```
:rotating_light: INCIDENT ALERT — [SEV LEVEL] :rotating_light:

WHAT: [Brief description of what is broken]
WHO: [Who is affected — all users, specific plan, region]
WHEN: First detected at [time, timezone]
STATUS: [Investigating / Identified]

SUPPORT ACTIONS:
  1. All incident-related tickets → tag with [incident-tag]
  2. Use canned response: [link to canned response]
  3. DO NOT troubleshoot incident issues individually
  4. DO NOT speculate on cause or timeline with customers
  5. Continue handling non-incident tickets normally

INCIDENT COMMANDER (Support): [Name]
ENGINEERING INCIDENT: [Link to engineering incident channel]
STATUS PAGE: [Link]

Updates will be posted here every [30/60] minutes.
Questions → DM [Incident Commander Name]
```

### Management Alert

```
INCIDENT NOTIFICATION — [SEV LEVEL]

Summary: [1-2 sentence description]
Impact: [Number of affected customers / ARR at risk / feature affected]
Status: [Investigating / Identified / Fix in progress]
Support Lead: [Name]
Engineering Lead: [Name]
ETA: [Estimated resolution time or "Under investigation"]

Key Customers Affected:
  - [Customer A] — $[ARR] — [Specific impact]
  - [Customer B] — $[ARR] — [Specific impact]

Next Update: [Time]
```

---

## Template 2: Status Page — Initial Acknowledgment

### SEV-1 (Critical Outage)

```
TITLE: [Service Name] — Service Disruption

STATUS: Investigating

We are currently experiencing a service disruption affecting
[specific description of what is down or broken].

Impact:
[Description of who is affected and how]

Our engineering team has been mobilized and is actively
investigating the root cause. We are treating this as our
highest priority.

[If workaround exists:]
Workaround: [Steps customers can take]

We will provide updates every 30 minutes until this is resolved.

Posted at [time, timezone]
```

### SEV-2 (Major Degradation)

```
TITLE: [Feature/Service Name] — Performance Issues

STATUS: Investigating

We are investigating reports of [specific description of the issue]
affecting [description of who is affected].

Impact:
[What customers will experience — e.g., "Slower load times for
dashboard," "Intermittent errors when saving data"]

Our team is actively investigating. We will provide updates every
60 minutes.

[If workaround exists:]
Workaround: [Steps customers can take]

Posted at [time, timezone]
```

### SEV-3 (Minor Issue)

```
TITLE: [Feature Name] — Minor Service Issue

STATUS: Investigating

We are aware of a minor issue affecting [description].
[Impact description.]

Our team is investigating and working on a fix.
We will update this page as more information becomes available.

Posted at [time, timezone]
```

---

## Template 3: Status Page — Progress Updates

### Update — Still Investigating

```
UPDATE #[N] — [time, timezone]

STATUS: Investigating

We are continuing to investigate [the issue].

What we know so far:
- [Finding 1]
- [Finding 2]

What we are doing:
- [Action being taken]

[If scope changed:]
Updated impact: [New scope information]

[If workaround discovered:]
Workaround: [New workaround steps]

Next update in [30/60] minutes.
```

### Update — Root Cause Identified

```
UPDATE #[N] — [time, timezone]

STATUS: Identified

We have identified the root cause of [the issue].

Cause: [Non-technical explanation of what went wrong]

Our engineering team is [implementing a fix / deploying a patch /
rolling back the change].

Estimated time to resolution: [ETA or "We will update in 30 minutes"]

[Impact is unchanged / Impact has narrowed to: [updated scope]]
```

### Update — Fix Deployed, Monitoring

```
UPDATE #[N] — [time, timezone]

STATUS: Monitoring

A fix has been deployed for [the issue]. We are monitoring to
confirm the issue is fully resolved.

If you were affected, you should now be able to [expected behavior].

[If customer action needed:]
Action required: You may need to [refresh your browser / reconnect /
clear cache] to see the fix take effect.

We will confirm resolution within [30/60] minutes.
```

---

## Template 4: Status Page — Resolution

### Standard Resolution

```
RESOLVED — [time, timezone]

The issue affecting [description] has been resolved.

Duration: [start time] to [end time] ([total duration])

What happened:
[Clear, honest, non-technical explanation]

What we did:
[Brief description of the fix]

If you continue to experience issues, please contact our support
team at [support contact].

We apologize for the disruption and thank you for your patience.
```

### Resolution — With Prevention Note

```
RESOLVED — [time, timezone]

The issue affecting [description] has been resolved.

Duration: [start time] to [end time] ([total duration])

What happened:
[Clear, honest explanation]

What we did to fix it:
[Brief description of the fix]

What we are doing to prevent this:
[1-2 preventive measures being implemented]

We will publish a full post-incident report within [24-72] hours.

We apologize for the disruption.
```

---

## Template 5: Email — Mass Customer Notification

### Initial Notification (Email)

```
Subject: [Company] Service Alert — [Brief Issue Description]

Hi [Customer Name / there],

We want to let you know about an issue currently affecting
[description of what is impacted].

What is happening:
[Clear description of the problem]

Who is affected:
[Specific description — e.g., "All users on our Pro and Enterprise
plans" or "Users in the EU region"]

What we are doing:
Our team is actively working to resolve this. We are providing
real-time updates on our status page:
[Status page URL]

[If workaround:]
In the meantime, you can work around this by:
[Workaround steps]

We will send another email when the issue is resolved.
We apologize for the inconvenience.

— The [Company] Team
```

### Resolution Notification (Email)

```
Subject: [Resolved] [Company] — [Brief Issue Description]

Hi [Customer Name / there],

The issue affecting [description] has been resolved as of
[time, timezone].

What happened:
[Brief, honest explanation]

Duration:
[Start time] to [end time] ([total duration])

[If credit/compensation:]
As a result of this disruption, we have applied a credit of
[amount] to your account. This will be reflected on your next
invoice.

[If customer action needed:]
You may need to [specific action] for the fix to take full effect.

If you continue to experience any issues, please contact our
support team at [support email/URL].

We apologize for the disruption and appreciate your patience
and understanding.

— The [Company] Team
```

---

## Template 6: Post-Incident Report (Customer-Facing)

```
Subject: Post-Incident Report: [Issue Description] — [Date]

Dear [Customer Name / Valued Customer],

On [date], [Company] experienced a [duration]-long [outage /
degradation / incident] that affected [scope of impact]. We
take the reliability and availability of our service seriously,
and we owe you a clear explanation of what happened, why, and
what we are doing to prevent it from happening again.

## Summary

[2-3 sentence overview of the incident]

## Timeline (all times in [timezone])

| Time | Event |
|------|-------|
| [Time] | [First sign of issue — e.g., "Monitoring alerts triggered"] |
| [Time] | [Detection — e.g., "Engineering team began investigation"] |
| [Time] | [Key milestone — e.g., "Root cause identified"] |
| [Time] | [Key milestone — e.g., "Fix deployed to production"] |
| [Time] | [Resolution — e.g., "All services confirmed operational"] |

## Root Cause

[Honest, clear explanation of what caused the incident. Be
technical enough to be credible but accessible enough for a
non-technical reader. Avoid blame language.]

## Impact

- **Services affected:** [Which services/features]
- **Duration:** [Total duration]
- **Users affected:** [Scope — number or description]
- **Data impact:** [Any data loss or corruption, or "No data
  was lost or corrupted"]

## Resolution

[What was done to resolve the incident]

## Prevention

We are committed to preventing this from happening again.
We are implementing the following changes:

1. **[Preventive measure 1]**
   [Description of what will change]
   Expected completion: [date]

2. **[Preventive measure 2]**
   [Description of what will change]
   Expected completion: [date]

3. **[Preventive measure 3]**
   [Description of what will change]
   Expected completion: [date]

## Compensation

[If applicable:]
We have applied a [credit/extension/compensation] of [amount/
description] to affected accounts. This will be reflected in
[your next invoice / your account settings].

[If not applicable:]
While this incident did not meet our threshold for automatic
compensation, please contact our support team if you believe
your business was materially impacted and we will work with
you individually.

## Commitment

We understand that you depend on [Company] to [what customers
use the product for], and we take that responsibility seriously.
This incident fell below the standard we set for ourselves, and
we are committed to the improvements outlined above.

If you have any questions about this incident, please do not
hesitate to contact our support team at [email] or reply to
this email.

Sincerely,
[Name]
[Title — e.g., VP of Engineering, CTO, CEO]
[Company]
```

---

## Template 7: Internal Post-Incident Review (Support)

```
SUPPORT POST-INCIDENT REVIEW

Incident:       [Brief description]
Severity:       [SEV level]
Date:           [Date]
Duration:       [Start to end time]
Review Date:    [Date]
Facilitator:    [Name]
Attendees:      [Names]

─────────────────────────────────────────────

DETECTION:
  How was the incident first detected?
    [ ] Monitoring
    [ ] Customer report
    [ ] Internal discovery
    [ ] Other: [        ]

  Time from incident start to support awareness: [    ] minutes
  Could we have detected faster? [Assessment]

COMMUNICATION:
  First status page update: T+[  ] minutes (Target: T+15 for SEV-1)
  Total status page updates: [N]
  Update cadence maintained: [ ] Yes [ ] No
  Communication accuracy: [ ] All accurate [ ] Corrections needed
  Customer email sent: [ ] Yes [ ] No [ ] Not applicable

OPERATIONS:
  Total incident-related tickets: [N]
  Average FRT for incident tickets: [    ]
  Non-incident SLA impact: [Assessment]
  Agent briefing sent: T+[  ] minutes
  Canned response deployed: [ ] Yes [ ] No

RECOVERY:
  Credits applied: [ ] Yes ($[    ]) [ ] No [ ] Not applicable
  Personal outreach to VIPs: [ ] Yes ([N] customers) [ ] No
  Post-incident report published: [ ] Yes (T+[  ] hours) [ ] No

CUSTOMER IMPACT:
  CSAT for incident tickets: [  ]%
  Customer complaints post-incident: [N]
  Churn attributed to incident: [N] customers / $[  ] ARR

WHAT WENT WELL:
  1. [                              ]
  2. [                              ]
  3. [                              ]

WHAT NEEDS IMPROVEMENT:
  1. [                              ]
  2. [                              ]
  3. [                              ]

ACTION ITEMS:
  [ ] [Action] — Owner: [Name] — Due: [Date]
  [ ] [Action] — Owner: [Name] — Due: [Date]
  [ ] [Action] — Owner: [Name] — Due: [Date]

PLAYBOOK UPDATES NEEDED:
  [ ] Templates: [What to update]
  [ ] Canned responses: [What to update]
  [ ] Process: [What to change]
  [ ] Training: [What to add]
```

---

**This template is maintained by the Support Brain.**
