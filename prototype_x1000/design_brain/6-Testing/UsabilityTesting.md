# Usability Testing Framework — Authoritative

Design without testing is guessing.
Test early, test often, test with real users.

---

## Purpose

Usability testing exists to:
- validate design decisions with real users
- identify problems before development
- measure task success and efficiency
- gather qualitative feedback
- iterate based on evidence

Untested design ships with hidden problems.

---

## Testing Types

### 1. Moderated Testing
Facilitator guides participant through tasks.
- Rich qualitative data
- Can probe deeper
- More time-intensive
- 5-8 participants

### 2. Unmoderated Testing
Participant completes tasks independently.
- Scalable
- Natural behavior
- Less context
- 10-20+ participants

### 3. Guerrilla Testing
Quick tests with available people.
- Fast feedback
- Low fidelity
- Directional only
- 3-5 participants

### 4. A/B Testing
Compare two versions quantitatively.
- Statistical significance
- Requires traffic
- Measures behavior, not why
- Hundreds/thousands

---

## When to Test

```
DISCOVERY → DESIGN → PROTOTYPE → DEVELOPMENT → LAUNCH
    ↓          ↓          ↓            ↓           ↓
 Concept    Early     Prototype   Staging      Live
 Testing    Designs   Testing     Testing    Monitoring
```

### Test Early
- Paper prototypes
- Concept validation
- Information architecture

### Test During
- Interactive prototypes
- Key flows
- Critical decisions

### Test Before Launch
- Near-final design
- Full flows
- Edge cases

---

## Test Planning Template

```
TEST PLAN: _______________
DATE: _______________
FACILITATOR: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OBJECTIVES
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What we're trying to learn:
1.
2.
3.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

METHODOLOGY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Type: [ ] Moderated [ ] Unmoderated [ ] Guerrilla
Format: [ ] In-person [ ] Remote
Tool: _______________
Duration: ___ minutes per session
Participants: ___

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PARTICIPANTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Target profile:


Recruitment criteria:
-
-

Screener questions:
-
-

Incentive: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASKS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| # | Task | Success Criteria | Priority |
|---|------|------------------|----------|
| 1 |      |                  |          |
| 2 |      |                  |          |
| 3 |      |                  |          |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

METRICS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Metric | Target |
|--------|--------|
| Task success rate | >80% |
| Time on task | <X min |
| Error rate | <10% |
| Satisfaction (1-5) | >4 |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

PROTOTYPE/MATERIALS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Prototype link:
Fidelity: [ ] Low [ ] Medium [ ] High
Scope: _______________

```

---

## Session Guide Template

```
SESSION GUIDE: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

INTRODUCTION (3-5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

"Thank you for participating. I'm [name], and I'll be
guiding you through some tasks today.

We're testing the design, not you. There are no wrong
answers. If something is confusing, that's valuable
feedback.

Please think aloud as you go — tell me what you're
looking at, thinking, trying to do.

[Recording consent]

Any questions before we start?"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WARM-UP (2-3 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Background questions:
-
-

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASKS (bulk of session)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 1: _______________
Scenario: "Imagine you [context]..."
Task: "Please [specific action]."
Success: _______________
Follow-up questions:
- What did you expect to happen?
- How easy/difficult was that?

TASK 2: _______________
[Same structure]

TASK 3: _______________
[Same structure]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

WRAP-UP (5 min)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Overall questions:
- What was your overall impression?
- What was most confusing?
- What was most clear?
- Any other feedback?

Thank participant, explain next steps, provide incentive.

```

---

## Observation Sheet

```
PARTICIPANT: _______________
DATE: _______________
OBSERVER: _______________

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 1: _______________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Success: [ ] Complete [ ] Partial [ ] Failed
Time: ___ seconds
Errors: ___
Path taken:


Observations:


Quotes:


━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

TASK 2: _______________
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[Same structure]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

OVERALL IMPRESSIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Positive moments:


Pain points:


Key quotes:


Severity of issues: [ ] Critical [ ] Major [ ] Minor

```

---

## Results Analysis Template

```
TEST RESULTS: _______________
DATE: _______________
PARTICIPANTS: ___

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

QUANTITATIVE RESULTS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Task | Success Rate | Avg Time | Errors | Target Met? |
|------|--------------|----------|--------|-------------|
| 1    |              |          |        |             |
| 2    |              |          |        |             |

Overall satisfaction: ___/5

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

KEY FINDINGS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

CRITICAL ISSUES (Blocks completion)
1.
2.

MAJOR ISSUES (Significant friction)
1.
2.

MINOR ISSUES (Slight inconvenience)
1.
2.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

RECOMMENDATIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

| Issue | Recommendation | Priority | Effort |
|-------|----------------|----------|--------|
|       |                |          |        |

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

POSITIVE FEEDBACK
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

What worked well:
-
-

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

NEXT STEPS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1.
2.
3.

```

---

## Common Usability Issues

### Navigation
- Can't find what they're looking for
- Unclear labels
- Unexpected location

### Understanding
- Unclear purpose of page
- Confusing terminology
- Missing context

### Interaction
- Unclear affordances
- Unexpected behavior
- Missing feedback

### Forms
- Validation confusion
- Unclear requirements
- Error recovery difficulty

---

## Facilitator Best Practices

### Do
- Stay neutral
- Let participant struggle (a bit)
- Ask "what are you thinking?"
- Note non-verbal cues
- Follow interesting threads

### Don't
- Lead the participant
- Explain the design
- React to failures
- Help too quickly
- Defend decisions

---

## Issue Severity Scoring

```
CRITICAL (P0)
- User cannot complete task
- Data loss or security issue
- Must fix before launch

MAJOR (P1)
- Task completable with significant difficulty
- User expresses strong frustration
- Should fix before launch

MINOR (P2)
- Slight inconvenience
- User works around easily
- Fix when possible

COSMETIC (P3)
- Noticed but no impact
- Polish issue
- Fix if time permits
```

---

## Anti-Patterns (Avoid)

- Testing only with team members
- Leading questions
- Explaining the design
- Too many tasks (>5-7)
- Ignoring results you don't like
- Testing too late to change
- Not recording sessions
- Not sharing results with team

---

## Output Artifacts

After usability testing, you should have:
- [ ] Test plan
- [ ] Session recordings (with consent)
- [ ] Observation sheets per participant
- [ ] Quantitative results summary
- [ ] Prioritized issue list
- [ ] Recommendations
- [ ] Next steps

---

## END OF USABILITY TESTING FRAMEWORK
