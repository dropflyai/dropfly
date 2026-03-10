# Template: Support QA Review and Coaching

## Purpose

This template provides the structure for conducting quality assurance reviews of
support tickets and translating those reviews into actionable coaching sessions. It
includes the QA review form, scoring rubric application, calibration worksheet,
coaching session guide, and performance tracking templates. The template ensures
consistent, fair, and development-oriented quality management across the support team.

---

## How to Use This Template

1. **QA Reviewer:** Use Part 1 for each ticket review
2. **Calibration Lead:** Use Part 2 for calibration sessions
3. **Team Lead/Manager:** Use Part 3 for coaching sessions
4. **Manager:** Use Part 4 for monthly/quarterly performance tracking

---

## Part 1: Ticket QA Review Form

### Review Header

```
TICKET QA REVIEW

Reviewer:           [Reviewer name]
Review Date:        [Date]
Ticket ID:          [#]
Agent:              [Agent name]
Channel:            [Email / Chat / Phone / Social]
Customer Tier:      [Enterprise / Professional / Standard / Free]
Issue Category:     [Category]
Priority:           [P1 / P2 / P3 / P4]
Sampling Method:    [Random / Targeted / Customer-triggered / New agent]
```

### Scoring Rubric

#### Dimension 1: Accuracy (30% weight)

```
SCORING GUIDE:
  5 — Solution technically correct; all aspects addressed; proactively
      addressed related issues; referenced documentation
  4 — Solution technically correct; primary issue fully addressed
  3 — Solution mostly correct; minor inaccuracy or missing detail
  2 — Solution partially incorrect; customer would need to contact again
  1 — Solution incorrect; could cause harm or worsened problem

SCORE: [  ] / 5

EVIDENCE:
[Specific citation from the ticket supporting this score]

NOTES:
[What was done well or what needs improvement]
```

#### Dimension 2: Communication (25% weight)

```
SCORING GUIDE:
  5 — Warm, personalized; acknowledges customer situation genuinely;
      explains "why" not just "what"; tone adapted to customer;
      grammar/formatting flawless; brand voice consistent
  4 — Professional and friendly; acknowledges issue; clear explanation;
      minor grammar/formatting issues (1-2)
  3 — Flat or overly formal tone; minimal acknowledgment; somewhat
      unclear in places; several grammar issues
  2 — Cold, dismissive, or robotic; no acknowledgment; confusing
      language; significant grammar issues
  1 — Rude, condescending, or argumentative; blames customer;
      incomprehensible; violates brand voice

SCORE: [  ] / 5

EVIDENCE:
[Specific citation from the ticket supporting this score]

NOTES:
[What was done well or what needs improvement]
```

#### Dimension 3: Process (20% weight)

```
SCORING GUIDE:
  5 — Categorization correct; tags accurate; internal notes thorough;
      SLA compliance; all process steps followed; knowledge base
      updated if applicable
  4 — Categorization correct; adequate internal notes; SLA met;
      process followed
  3 — Minor categorization error or missing tags; sparse internal
      notes; SLA met
  2 — Incorrect categorization; missing internal notes; SLA at risk;
      process steps skipped
  1 — No categorization; no internal notes; SLA breached; significant
      process violations

SCORE: [  ] / 5

EVIDENCE:
[Specific process elements that were followed or missed]

NOTES:
[What was done well or what needs improvement]
```

#### Dimension 4: Customer Effort (15% weight)

```
SCORING GUIDE:
  5 — Issue resolved in minimal interactions; no channel switching;
      proactively addressed adjacent issues; customer given clear
      self-service resources for future
  4 — Issue resolved efficiently; minimal back-and-forth; customer
      did not need to repeat information
  3 — Resolution required 2-3 back-and-forth exchanges; some
      information could have been gathered upfront
  2 — Customer had to repeat information; unnecessary transfers or
      channel switches; multiple contacts needed
  1 — Customer effort was excessive; repeated transfers, re-explanations,
      and multiple contacts required

SCORE: [  ] / 5

EVIDENCE:
[Specific aspects of the interaction that affected customer effort]

NOTES:
[What was done well or what needs improvement]
```

#### Dimension 5: Resolution (10% weight)

```
SCORING GUIDE:
  5 — Issue fully resolved; customer confirmed; proactive follow-up
      offered; knowledge captured for future reference
  4 — Issue fully resolved; clear confirmation with customer
  3 — Issue mostly resolved; minor loose ends; adequate confirmation
  2 — Issue partially resolved; significant follow-up needed;
      weak confirmation
  1 — Issue unresolved; no clear path to resolution; customer
      left hanging

SCORE: [  ] / 5

EVIDENCE:
[Resolution outcome and confirmation]

NOTES:
[What was done well or what needs improvement]
```

### Summary

```
OVERALL SCORE:
  Accuracy:        [  ] / 5  x 0.30 = [    ]
  Communication:   [  ] / 5  x 0.25 = [    ]
  Process:         [  ] / 5  x 0.20 = [    ]
  Customer Effort: [  ] / 5  x 0.15 = [    ]
  Resolution:      [  ] / 5  x 0.10 = [    ]
                                      ─────────
  WEIGHTED TOTAL:                     [    ] / 5.0

AUTO-FAIL:  [ ] Yes  [ ] No
  If yes, reason: [                                          ]

TOP STRENGTH:
[One specific thing the agent did exceptionally well]

DEVELOPMENT AREA:
[One specific area for improvement with actionable suggestion]

TRAINING EXAMPLE:
[ ] Yes — this ticket could be used as a positive training example
[ ] Yes — this ticket could be used as a learning opportunity
[ ] No — standard review, no training use
```

---

## Part 2: Calibration Worksheet

### Calibration Session Setup

```
CALIBRATION SESSION

Date:           [Date]
Facilitator:    [Name]
Participants:   [Names of all reviewers]
Tickets:        [N] tickets selected (IDs: [list])

PREPARATION:
  All participants independently score all tickets before the session.
  Do NOT discuss scores before the calibration meeting.
```

### Calibration Comparison Matrix

```
TICKET #[ID]:

                   Reviewer A   Reviewer B   Reviewer C   Range   Consensus
Accuracy           [  ]         [  ]         [  ]         [  ]    [  ]
Communication      [  ]         [  ]         [  ]         [  ]    [  ]
Process            [  ]         [  ]         [  ]         [  ]    [  ]
Customer Effort    [  ]         [  ]         [  ]         [  ]    [  ]
Resolution         [  ]         [  ]         [  ]         [  ]    [  ]
──────────────────────────────────────────────────────────────────────────
Overall            [  ]         [  ]         [  ]         [  ]    [  ]

VARIANCE DISCUSSION:
  Dimension with largest variance: [          ]
  Reviewer A rationale: [                     ]
  Reviewer B rationale: [                     ]
  Reviewer C rationale: [                     ]
  Consensus reached:    [ ] Yes  [ ] No
  If no: [How was it resolved?]

RUBRIC CLARIFICATION NEEDED:
  [ ] Yes — Document: [What needs clarifying in the rubric]
  [ ] No
```

### Inter-Rater Reliability

```
RELIABILITY METRICS:

  Cohen's Kappa (pairwise):
    Reviewer A vs B: [    ]
    Reviewer A vs C: [    ]
    Reviewer B vs C: [    ]

  Average Kappa:    [    ]

  Interpretation:
    > 0.80:  Excellent — maintain current calibration cadence
    0.60-0.80: Good — continue weekly calibration
    0.40-0.60: Moderate — increase to 2x/week calibration
    < 0.40:  Poor — daily calibration until improvement; review rubric
```

---

## Part 3: Coaching Session Template

### Coaching Session Guide (30 minutes, bi-weekly)

```
COACHING SESSION

Agent:          [Name]
Coach:          [Name]
Date:           [Date]
Session #:      [N] (this quarter)

─────────────────────────────────────────────────────

MINUTE 0-5: CHECK-IN

  "How are you doing this week?"
  "Any wins you want to share?"
  "Any challenges or frustrations?"

  Agent notes: [                                    ]

─────────────────────────────────────────────────────

MINUTE 5-15: QA REVIEW

  Tickets reviewed this period: [N]
  Average QA score: [  ] / 5.0
  Trend: [Improving / Stable / Declining]

  STRENGTH EXAMPLE (Ticket #[ID]):
    "I really liked how you [specific positive action].
     This is a great example of [dimension]."

  DEVELOPMENT EXAMPLE (Ticket #[ID]):
    "Let's look at this ticket together. What do you think went well?"
    [Agent self-assessment]
    "I agree with [what they identified]. One area I noticed is
     [specific observation]. How might you approach this differently?"
    [Agent reflection]

─────────────────────────────────────────────────────

MINUTE 15-25: DEVELOPMENT FOCUS

  Current development goal: [From last session]
  Progress since last session: [Assessment]

  New/continued focus area: [                       ]
  Specific skill to practice: [                     ]

  Exercise:
    [Role-play scenario, mock ticket, or specific technique to practice]

  Resources:
    [KB article, training video, peer to shadow, etc.]

  Measurable goal for next session:
    [Specific, measurable target — e.g., "Improve communication dimension
     from 3.5 to 4.0 average by next session"]

─────────────────────────────────────────────────────

MINUTE 25-30: WRAP-UP

  Key takeaways:
    1. [Takeaway 1]
    2. [Takeaway 2]

  Action items:
    Agent: [                                        ]
    Coach: [                                        ]

  Next session: [Date]
```

---

## Part 4: Performance Tracking Template

### Monthly Agent Performance Summary

```
MONTHLY PERFORMANCE REPORT

Agent:          [Name]
Period:         [Month Year]
Manager:        [Name]

─────────────────────────────────────────────────────

METRICS SUMMARY:

  Metric              This Month   Last Month   Trend   Target   Status
  ───────────────────────────────────────────────────────────────────────
  QA Score (avg)      [  ]         [  ]         [↑↓→]   4.0      [G/Y/R]
  CSAT (avg)          [  ]%        [  ]%        [↑↓→]   88%      [G/Y/R]
  Tickets Resolved    [  ]         [  ]         [↑↓→]   [N]      [G/Y/R]
  FCR Rate            [  ]%        [  ]%        [↑↓→]   75%      [G/Y/R]
  AHT                 [  ] min     [  ] min     [↑↓→]   [N]      [Info]
  SLA Compliance      [  ]%        [  ]%        [↑↓→]   95%      [G/Y/R]
  KB Articles         [  ]         [  ]         [↑↓→]   5        [G/Y/R]
  Reopen Rate         [  ]%        [  ]%        [↑↓→]   <8%      [G/Y/R]

─────────────────────────────────────────────────────

QA DIMENSION BREAKDOWN:

  Dimension           Score   Trend (3-month)   Note
  ──────────────────────────────────────────────────────
  Accuracy            [  ]    [↑↓→]             [       ]
  Communication       [  ]    [↑↓→]             [       ]
  Process             [  ]    [↑↓→]             [       ]
  Customer Effort     [  ]    [↑↓→]             [       ]
  Resolution          [  ]    [↑↓→]             [       ]

  Auto-Fails: [N]
  Coaching Sessions: [N]

─────────────────────────────────────────────────────

PERFORMANCE TIER:

  [ ] Star (>4.5)     → Recognition, mentoring opportunities
  [ ] Solid (3.5-4.5) → Standard development
  [ ] Developing (2.5-3.5) → Intensive coaching
  [ ] At Risk (<2.5)  → PIP required

─────────────────────────────────────────────────────

DEVELOPMENT NOTES:

  Current focus area: [                              ]
  Progress this month: [                             ]
  Goal for next month: [                             ]
  Recognition/kudos: [                               ]

─────────────────────────────────────────────────────

MANAGER ASSESSMENT:

  Overall assessment: [                              ]
  Key strength: [                                    ]
  Key development area: [                            ]
  Action items: [                                    ]
```

---

## Part 5: Quarterly Team Summary

```
QUARTERLY TEAM QA SUMMARY

Period:         [Quarter Year]
Team:           [Team name]
Manager:        [Name]
Team Size:      [N] agents
Reviews Conducted: [N] total

─────────────────────────────────────────────────────

TEAM METRICS:

  Metric              Q Avg    Previous Q   Change   Target
  ─────────────────────────────────────────────────────────
  QA Score            [  ]     [  ]         [  ]     4.0
  CSAT                [  ]%    [  ]%        [  ]pp   88%
  CES                 [  ]     [  ]         [  ]     <2.5
  FCR                 [  ]%    [  ]%        [  ]pp   75%

DISTRIBUTION:

  Star (>4.5):          [N] agents ([%])
  Solid (3.5-4.5):      [N] agents ([%])
  Developing (2.5-3.5): [N] agents ([%])
  At Risk (<2.5):       [N] agents ([%])

CALIBRATION:

  Avg Kappa:            [    ]
  Calibration sessions: [N]
  Rubric updates made:  [N]

KEY INSIGHTS:

  1. [Insight about quality trends]
  2. [Insight about training needs]
  3. [Insight about process improvements]

ACTION PLAN:

  1. [Action] — Owner: [Name] — Due: [Date]
  2. [Action] — Owner: [Name] — Due: [Date]
  3. [Action] — Owner: [Name] — Due: [Date]
```

---

**This template is maintained by the Support Brain.**
