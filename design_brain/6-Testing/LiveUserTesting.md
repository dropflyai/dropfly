# Live User Testing Integration — Authoritative

Don't wait for scheduled tests. Observe real users continuously.
Real-time feedback accelerates learning.

---

## Purpose

Live user testing exists to:
- get immediate feedback during development
- observe real user behavior, not hypothetical
- catch usability issues before they ship
- validate designs with actual usage data
- reduce time between design and learning

Scheduled usability testing is episodic. Live testing is continuous.

---

## Live Testing Methods

### 1. Session Recording

**What:** Record user sessions automatically for later review.

**Tools:**
| Tool | Best For | Cost |
|------|----------|------|
| Hotjar | SMB, quick setup | Free tier |
| FullStory | Enterprise, deep analytics | $$ |
| LogRocket | Developers, error tracking | $$ |
| Microsoft Clarity | Free, privacy-focused | Free |
| Smartlook | Mobile + web | Free tier |
| PostHog | Open source, self-hosted | Free/Paid |

**Setup Template:**
```javascript
// Example: Hotjar setup
<script>
(function(h,o,t,j,a,r){
    h.hj=h.hj||function(){(h.hj.q=h.hj.q||[]).push(arguments)};
    h._hjSettings={hjid:YOUR_SITE_ID,hjsv:6};
    // ... rest of snippet
})(window,document,'https://static.hotjar.com/c/hotjar-','.js?sv=');
</script>
```

**What to Capture:**
- [ ] Page visits and navigation paths
- [ ] Clicks, taps, scrolls
- [ ] Form interactions
- [ ] Rage clicks (frustration indicator)
- [ ] Error occurrences
- [ ] Session duration

**Privacy Considerations:**
- [ ] Exclude sensitive fields (passwords, PII)
- [ ] Add privacy notice to site
- [ ] Allow users to opt-out
- [ ] Comply with GDPR/CCPA

---

### 2. Heatmaps

**What:** Visualize where users click, scroll, and focus.

**Types:**
```
CLICK HEATMAP          SCROLL HEATMAP         MOVE HEATMAP
┌────────────────┐     ┌────────────────┐     ┌────────────────┐
│ ████           │     │ 100% ████████ │     │                │
│    ███         │     │  80% ██████   │     │      ~~~       │
│          █████ │     │  60% █████    │     │    ~~~~        │
│                │     │  40% ███      │     │        ~~~     │
│ ██             │     │  20% ██       │     │    ~~          │
│                │     │   0% █        │     │                │
└────────────────┘     └────────────────┘     └────────────────┘
  Where clicks          Where they stop        Mouse movement
```

**What to Look For:**
- Clicks on non-clickable elements (false affordance)
- Ignored CTAs (positioning problem)
- Drop-off scroll points (content issues)
- Cluster patterns (user goals)

---

### 3. Real-Time User Surveys

**What:** Ask users questions at key moments.

**Survey Triggers:**
```
TRIGGER POINTS:

1. TASK COMPLETION
   After user completes key action
   "How easy was it to [action]?"

2. EXIT INTENT
   When user moves to leave
   "What prevented you from completing your goal?"

3. TIME ON PAGE
   After X seconds on a page
   "Are you finding what you need?"

4. SPECIFIC ELEMENT
   After interacting with feature
   "Was this feature helpful?"

5. PAGE-SPECIFIC
   On certain pages (pricing, checkout)
   "What questions do you have?"
```

**Survey Types:**
```
MICRO-SURVEY (1-2 questions)
┌────────────────────────────────────┐
│ How easy was this?                 │
│ ┌──┐ ┌──┐ ┌──┐ ┌──┐ ┌──┐         │
│ │1 │ │2 │ │3 │ │4 │ │5 │         │
│ └──┘ └──┘ └──┘ └──┘ └──┘         │
│ Very      Neutral     Very         │
│ Difficult             Easy         │
│                      [Submit]      │
└────────────────────────────────────┘

OPEN-ENDED
┌────────────────────────────────────┐
│ What almost stopped you from       │
│ signing up today?                  │
│ ┌────────────────────────────────┐ │
│ │                                │ │
│ │                                │ │
│ └────────────────────────────────┘ │
│                      [Submit]      │
└────────────────────────────────────┘
```

**Tools:**
- Hotjar Feedback
- Usabilla
- Qualaroo
- Survicate
- Custom implementation

---

### 4. Live Chat Observation

**What:** Analyze support conversations for UX issues.

**What to Track:**
```
SUPPORT TICKET ANALYSIS:

Category: [Navigation | Feature | Error | Confusion | Other]
Page/Feature: [Where issue occurred]
Frequency: [How often reported]
User Quote: [Verbatim description]
UX Implication: [What to fix]
```

**Integration:**
- Tag conversations by issue type
- Create weekly UX issue report from support
- Prioritize by frequency and impact

---

### 5. Live Usability Testing (Remote)

**What:** Watch real users in real-time with moderation.

**Tools:**
| Tool | Type | Features |
|------|------|----------|
| UserTesting | Moderated/Unmoderated | Large panel |
| Lookback | Moderated | Live conversation |
| Maze | Unmoderated | Prototype testing |
| UsabilityHub | Unmoderated | Quick tests |
| Lyssna | Unmoderated | Design tests |

**Quick Test Template:**
```
LIVE TEST SCRIPT

Duration: 15-20 minutes
Participants: 5 users

INTRO (2 min):
- Thank you for participating
- We're testing the [product], not you
- Think aloud as you work
- There are no wrong answers

TASKS (10-15 min):
1. [Primary task - most important]
   "Starting from the homepage, [goal]."

2. [Secondary task]
   "Now try to [action]."

3. [Edge case or new feature]
   "What would you do if you wanted to [scenario]?"

WRAP-UP (3 min):
- What was most confusing?
- What was easiest?
- What's missing?
- Would you use this? Why/why not?
```

---

### 6. A/B Testing

**What:** Test design variations with real traffic.

**Tools:**
| Tool | Best For | Integration |
|------|----------|-------------|
| Optimizely | Enterprise | Full stack |
| VWO | Mid-market | Visual editor |
| Google Optimize | Free/basic | GA integration |
| LaunchDarkly | Feature flags | Developer-first |
| PostHog | Open source | Self-hosted |
| Statsig | Modern | Free tier |

**Test Template:**
```
A/B TEST DOCUMENTATION

Test Name: [Descriptive name]
Hypothesis: [If we X, then Y because Z]
Primary Metric: [What we're measuring]
Secondary Metrics: [Additional data]

VARIATIONS:
Control (A): [Current design]
Variant (B): [New design]
[Variant C]: [Optional additional variant]

SAMPLE SIZE:
Required: [Calculate based on effect size]
Duration: [Estimated time to significance]

SUCCESS CRITERIA:
- [Metric] improves by [X]%
- Statistical significance: 95%
- No negative impact on [guardrail metrics]

RESULTS:
Winner: [ ] Control [ ] Variant [ ] Inconclusive
Lift: [X]%
Confidence: [X]%
Decision: [Ship / Iterate / Abandon]
```

---

### 7. Error Tracking

**What:** Monitor real errors users encounter.

**Tools:**
- Sentry
- Bugsnag
- Rollbar
- LogRocket
- TrackJS

**UX Error Categories:**
```
TECHNICAL ERRORS:
- JavaScript errors
- API failures
- Timeout errors
- 404 pages

UX ERRORS:
- Form validation failures (high frequency = bad UX)
- Abandoned forms (field drop-off)
- Rage clicks (repeated frustrated clicks)
- Dead clicks (click on non-interactive element)
```

---

## Real-Time Dashboard

### Metrics to Monitor

```
┌────────────────────────────────────────────────────────────────────────┐
│ LIVE UX DASHBOARD                                         🟢 All Good  │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│ ENGAGEMENT              FRICTION               SATISFACTION            │
│ ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
│ │ Sessions     │       │ Rage Clicks  │       │ NPS Score    │        │
│ │    1,234     │       │     23  ⚠️   │       │     67       │        │
│ │    ↑ 12%     │       │    ↑ 5%      │       │    ↓ 2%      │        │
│ └──────────────┘       └──────────────┘       └──────────────┘        │
│                                                                        │
│ CONVERSION             ERROR RATE              TASK SUCCESS            │
│ ┌──────────────┐       ┌──────────────┐       ┌──────────────┐        │
│ │ Signups      │       │ JS Errors    │       │ Form Submit  │        │
│ │     45       │       │    0.2%      │       │    89%       │        │
│ │    ↑ 8%      │       │    ↓ 0.1%    │       │    ↑ 3%      │        │
│ └──────────────┘       └──────────────┘       └──────────────┘        │
│                                                                        │
│ RECENT ISSUES                                                          │
│ ┌──────────────────────────────────────────────────────────────────┐  │
│ │ ⚠️ Rage clicks on "Pricing" CTA - 23 in last hour               │  │
│ │ ℹ️ Form abandonment up on checkout - 15% this week              │  │
│ │ ✓ 404 errors resolved - down 90%                                │  │
│ └──────────────────────────────────────────────────────────────────┘  │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Checklist

### Phase 1: Quick Wins (Day 1)

- [ ] Install session recording (Hotjar/Clarity)
- [ ] Set up heatmaps on key pages
- [ ] Add one micro-survey to primary conversion
- [ ] Configure error tracking

### Phase 2: Foundation (Week 1)

- [ ] Define key metrics to track
- [ ] Create UX dashboard
- [ ] Set up rage click alerts
- [ ] Configure form analytics
- [ ] Add exit intent survey

### Phase 3: Optimization (Week 2+)

- [ ] Run first A/B test
- [ ] Schedule weekly session reviews
- [ ] Create support → UX feedback loop
- [ ] Set up automated issue alerts
- [ ] Run first live user test

---

## Session Review Process

### Weekly Review Template

```
SESSION REVIEW: Week of [Date]

SESSIONS REVIEWED: [X]

TOP FRICTION POINTS:
1. [Issue] - [Page/Feature] - [Frequency]
2. [Issue] - [Page/Feature] - [Frequency]
3. [Issue] - [Page/Feature] - [Frequency]

PATTERNS OBSERVED:
- [Pattern 1]
- [Pattern 2]

UNEXPECTED BEHAVIOR:
- [Behavior users exhibit that wasn't anticipated]

IMMEDIATE FIXES NEEDED:
- [ ] [Fix 1]
- [ ] [Fix 2]

NEEDS FURTHER INVESTIGATION:
- [ ] [Question 1]
- [ ] [Question 2]

POSITIVE OBSERVATIONS:
- [What's working well]
```

---

## Alerting Rules

### Automatic Alerts

```
SET UP ALERTS FOR:

🔴 CRITICAL:
- Error rate > 1%
- Page load time > 5s
- Conversion drop > 20%
- Session recording shows repeated error

🟡 WARNING:
- Rage clicks > 10/hour on single element
- Form abandonment > 50%
- Bounce rate > 70% on key pages
- Support tickets spike

🟢 INFORMATIONAL:
- A/B test reaches significance
- New user behavior pattern
- Weekly digest
```

---

## Integration with Design Process

```
DESIGN PROCESS + LIVE TESTING

1-DISCOVERY → 2-RESEARCH → 3-ARCHITECTURE → 4-FLOWS → 5-BRAND → 6-TEST
                                                               ↓
                                                    ┌─────────────────────┐
                                                    │ UsabilityTesting.md │
                                                    │         +           │
                                                    │ LiveUserTesting.md  │◄── CONTINUOUS
                                                    │    (THIS FILE)      │
                                                    └─────────────────────┘
                                                               ↓
                                           Insights feed back into design
```

---

## Reporting Template

### Monthly UX Health Report

```
UX HEALTH REPORT: [Month Year]

EXECUTIVE SUMMARY:
[2-3 sentence overview of UX health]

KEY METRICS:
| Metric | This Month | Last Month | Trend |
|--------|------------|------------|-------|
| Task Success Rate | | | ↑/↓/→ |
| Error Rate | | | |
| NPS Score | | | |
| Form Completion | | | |

TOP ISSUES IDENTIFIED:
1. [Issue] - Impact: [High/Med/Low] - Status: [Fixed/In Progress/Backlog]
2. [Issue] - Impact: [High/Med/Low] - Status: [Fixed/In Progress/Backlog]
3. [Issue] - Impact: [High/Med/Low] - Status: [Fixed/In Progress/Backlog]

IMPROVEMENTS SHIPPED:
- [Improvement 1] - Result: [Metric improvement]
- [Improvement 2] - Result: [Metric improvement]

A/B TESTS:
- [Test 1]: [Result]
- [Test 2]: [Result]

NEXT MONTH PRIORITIES:
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]
```

---

## Privacy and Ethics

### Required Disclosures

```
PRIVACY REQUIREMENTS:

[ ] Privacy policy mentions session recording
[ ] Users can opt-out of tracking
[ ] Sensitive fields are excluded
[ ] Data retention policy defined
[ ] GDPR/CCPA compliant
[ ] No recording of passwords/payment info
[ ] User consent obtained where required
```

### Ethical Guidelines

```
DO:
✓ Be transparent about tracking
✓ Use data to improve user experience
✓ Protect user privacy
✓ Delete data per retention policy
✓ Allow opt-out

DON'T:
✗ Track without disclosure
✗ Record sensitive information
✗ Share individual user data
✗ Use for purposes beyond UX improvement
✗ Manipulate users based on tracking
```

---

## END OF LIVE USER TESTING INTEGRATION
