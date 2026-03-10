# Drip Sequence Design Template

> A structured template for designing, documenting, and managing automated email sequences (drip campaigns) -- including welcome flows, nurture sequences, onboarding series, and lifecycle automations.

---

## Sequence Header

| Field | Input |
|-------|-------|
| Sequence Name | |
| Sequence Type | [ ] Welcome [ ] Onboarding [ ] Nurture [ ] Win-back [ ] Post-purchase [ ] Event follow-up [ ] Trial [ ] Other |
| Sequence Owner | |
| Target Audience | |
| Entry Trigger | |
| Exit Criteria | |
| Date Created | |
| Last Updated | |
| Status | [ ] Design [ ] Build [ ] Testing [ ] Live [ ] Paused [ ] Archived |

---

## Section 1: Sequence Strategy

### Objective and KPIs

| Element | Input |
|---------|-------|
| Primary objective | (activation, conversion, education, retention, re-engagement) |
| Primary KPI | |
| Target value | |
| Secondary KPI | |
| Baseline (if exists) | |

### Entry and Exit Logic

**Entry trigger:**
| Trigger Type | Specification |
|-------------|---------------|
| Event-based | (signup, purchase, download, form submit, etc.) |
| Segment-based | (criteria for inclusion) |
| Time-based | (date-triggered, e.g., subscription anniversary) |
| Manual | (list upload, one-time enrollment) |

**Exit criteria:**
| Exit Condition | Action |
|---------------|--------|
| Completed all emails | Move to next sequence or regular cadence |
| Achieved conversion goal | Remove from sequence, tag as converted |
| Unsubscribed | Remove immediately |
| Entered a conflicting sequence | Priority rules: _____ |
| Manual removal | Support or admin override |

**Suppression rules:**
- [ ] Do not send if user received another email in last _____ hours
- [ ] Do not send if user has already completed the goal action
- [ ] Do not send if user is in sequence: _____
- [ ] Do not send during hours: _____ (send during business hours only)

---

## Section 2: Sequence Map

### Visual Flow

```
[Entry Trigger]
     |
     v
[Email 1] --> Wait [X] days
     |
     v
[Decision: Did user take action?]
     |           |
    YES          NO
     |           |
     v           v
[Branch A]   [Email 2] --> Wait [X] days
                 |
                 v
            [Email 3] --> Wait [X] days
                 |
                 v
            [Decision: Did user engage?]
                 |           |
                YES          NO
                 |           |
                 v           v
            [Branch B]   [Email 4 (final)]
                              |
                              v
                         [Exit: Sunset or move to re-engagement]
```

### Email Schedule

| Email # | Name | Day | Wait After Previous | Send Time | Condition |
|---------|------|-----|-------------------|-----------|-----------|
| 1 | | Day 0 | Immediate | | Entry trigger |
| 2 | | Day __ | __ days | | |
| 3 | | Day __ | __ days | | |
| 4 | | Day __ | __ days | | |
| 5 | | Day __ | __ days | | |
| 6 | | Day __ | __ days | | |
| 7 | | Day __ | __ days | | |

---

## Section 3: Email Detail (Per Email)

### Email 1: [Name]

| Element | Content |
|---------|---------|
| **Subject line** | |
| **Preview text** | |
| **From name** | |
| **Purpose** | What this email is trying to accomplish |
| **Headline** | |
| **Body summary** | 2-3 sentences describing content |
| **Primary CTA** | Button text: _____ / Link: _____ |
| **Secondary CTA** | (if any) |
| **Personalization** | Fields used: _____ |
| **Behavioral condition** | Send if: _____ / Skip if: _____ |

### Email 2: [Name]

| Element | Content |
|---------|---------|
| **Subject line** | |
| **Preview text** | |
| **From name** | |
| **Purpose** | |
| **Headline** | |
| **Body summary** | |
| **Primary CTA** | Button text: _____ / Link: _____ |
| **Secondary CTA** | |
| **Personalization** | |
| **Behavioral condition** | |

### Email 3: [Name]

| Element | Content |
|---------|---------|
| **Subject line** | |
| **Preview text** | |
| **From name** | |
| **Purpose** | |
| **Headline** | |
| **Body summary** | |
| **Primary CTA** | Button text: _____ / Link: _____ |
| **Secondary CTA** | |
| **Personalization** | |
| **Behavioral condition** | |

*(Repeat for each email in the sequence.)*

---

## Section 4: Branching Logic

### Decision Points

| Decision # | Condition | Yes Branch | No Branch |
|-----------|----------|-----------|----------|
| 1 | | | |
| 2 | | | |
| 3 | | | |

### Behavioral Triggers Within Sequence

| Behavior | Response |
|----------|---------|
| User clicks CTA in Email 2 | Skip to Email 5 (conversion-focused) |
| User visits pricing page | Add tag, send pricing-focused follow-up |
| User starts free trial | Move to trial onboarding sequence |
| User does not open 2 consecutive emails | Adjust send time or change subject line approach |
| User unsubscribes | Exit sequence immediately |

---

## Section 5: Technical Implementation

### Platform Configuration

| Element | Specification |
|---------|---------------|
| Email platform | |
| Automation/workflow tool | |
| Entry event source | (form, API, segment, webhook) |
| Data fields required | |
| Tags applied | (entry tag, exit tag, conversion tag) |
| Integration requirements | |

### UTM Tracking

| Parameter | Value |
|-----------|-------|
| utm_source | email |
| utm_medium | drip / sequence |
| utm_campaign | [sequence name] |
| utm_content | [email name or number] |

### Testing Plan

| Test | Method | Status |
|------|--------|--------|
| Entry trigger fires correctly | Manual test enrollment | [ ] Pass [ ] Fail |
| Wait times accurate | Test with compressed timeline | [ ] Pass [ ] Fail |
| Branching logic works | Test each branch path | [ ] Pass [ ] Fail |
| Exit criteria function | Test each exit condition | [ ] Pass [ ] Fail |
| Suppression rules work | Test conflict scenarios | [ ] Pass [ ] Fail |
| Personalization renders | Send proofs with test data | [ ] Pass [ ] Fail |
| Links track correctly | Click each link, verify UTMs | [ ] Pass [ ] Fail |

---

## Section 6: Performance Tracking

### Sequence-Level Metrics

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Enrollment rate | | | |
| Completion rate | % | | |
| Overall click rate | % | | |
| Conversion rate (goal) | % | | |
| Unsubscribe rate (total) | <___% | | |
| Revenue influenced | $ | | |

### Per-Email Metrics

| Email # | Name | Sent | Open Rate | Click Rate | Unsub Rate | Conversion |
|---------|------|------|----------|-----------|-----------|-----------|
| 1 | | | % | % | % | |
| 2 | | | % | % | % | |
| 3 | | | % | % | % | |
| 4 | | | % | % | % | |
| 5 | | | % | % | % | |
| 6 | | | % | % | % | |
| 7 | | | % | % | % | |

### Optimization Log

| Date | Change Made | Reason | Result |
|------|-----------|--------|--------|
| | | | |
| | | | |
| | | | |

---

## Section 7: Review Schedule

| Review | Cadence | Focus |
|--------|---------|-------|
| Per-email performance check | Weekly (first month), then monthly | Open/click rates, unsubscribes |
| Sequence-level review | Monthly | Completion rate, conversion rate |
| Content freshness review | Quarterly | Outdated references, screenshots, data |
| Strategic review | Semi-annually | Does this sequence still align with business goals? |

---

*Template version: 1.0*
*Brain: Email Brain*
*Reference: Patterns/welcome_sequence_pattern.md, Patterns/reengagement_pattern.md*
