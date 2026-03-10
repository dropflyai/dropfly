# Pattern: User Research Sprint

A rapid, focused user research cycle designed to generate actionable insights within a 1-2 week timeframe, aligned with design sprints and agile development cycles.

---

## Pattern Overview

**When to use:** Validating specific user needs, testing a concept or prototype, answering a focused research question within an active product development cycle.

**Duration:** 5-10 business days.

**Team:** 1 researcher (or trained non-researcher with researcher oversight).

**Investment:** $2K-$8K (primarily participant incentives).

**Deliverables:** Topline findings within 48 hours, full insight report within 1 week of completion.

---

## Pre-Sprint Preparation (2-3 Days Before)

### Define the Research Question

The most critical step. A research sprint succeeds or fails based on the clarity of its question. The question must be specific enough to answer in a sprint but broad enough to generate meaningful insight.

**Good sprint research questions:**
- "Can users complete the new onboarding flow without assistance?"
- "What are the top 3 unmet needs for [persona] when managing [workflow]?"
- "Which of these 3 design concepts best communicates our value proposition?"

**Questions too broad for a sprint:**
- "What do our users need?" (Requires a full discovery study.)
- "Should we enter this market?" (Requires the market entry pattern.)

### Recruit Participants

**Sprint recruitment timeline is tight.** Start recruitment before the sprint begins.

**Recruitment approach:**
- Pull from internal participant panel (fastest, 1-2 day recruitment).
- Use recruitment platform (User Interviews, Respondent.io) with 3-5 day lead time.
- Use in-product intercept for quick unmoderated studies (same day).

**Sample size by method:**
| Method | Participants | Rationale |
|--------|-------------|-----------|
| Moderated usability test | 5-6 | Identifies ~80% of major usability issues |
| Concept test interviews | 6-8 | Sufficient for preference and initial reactions |
| Semi-structured interviews | 5-8 | Enough for preliminary themes |
| Unmoderated usability test | 15-25 | Larger n for more reliable task metrics |

### Prepare Materials

- Draft interview guide or task scenarios (reference `05_qualitative/qualitative_methods.md`).
- Prepare prototype or stimulus materials.
- Set up recording and note-taking tools.
- Create observation template for stakeholder observers.
- Pilot test with 1 internal participant (catch issues before real sessions).

---

## Day 1-2: Stakeholder Alignment

### Sprint Kickoff (1 hour)

**Attendees:** Researcher, product manager, designer, engineering lead (optional).

**Agenda:**
1. **Research question:** Confirm the specific question to answer.
2. **Hypotheses:** Document what the team believes (to be tested, not confirmed).
3. **Success criteria:** What findings would change our direction? What would confirm our approach?
4. **Method confirmation:** Agree on methodology and participant profile.
5. **Logistics:** Session schedule, observation protocol, communication plan.

### Hypothesis Documentation

Explicitly document team hypotheses before research begins. This prevents post-hoc rationalization (HARKing) and creates a clear baseline to measure against.

```
HYPOTHESIS LOG

H1: [We believe users will prefer concept A because...]
H2: [We believe the primary pain point is X because...]
H3: [We believe users will complete the task in under 3 minutes because...]

These will be evaluated against research evidence after data collection.
```

---

## Day 2-4: Data Collection

### Moderated Sessions (Preferred for Sprints)

**Session structure (45-60 minutes):**
1. **Welcome and context** (5 min): Rapport, consent, recording setup.
2. **Background** (5-10 min): Understand the participant's relevant context.
3. **Core activity** (25-35 min): Tasks, concept exposure, or exploratory interview.
4. **Debrief** (5-10 min): Overall reactions, preference questions, open-ended closing.

**During sessions:**
- Researcher facilitates. Does not help, judge, or lead.
- Stakeholders observe (in person or via video stream).
- Dedicated note-taker captures observations (timestamp, observation, interpretation).
- After each session, researcher and observers spend 5-10 minutes capturing key takeaways while memory is fresh.

**Cadence:** 3-5 sessions per day maximum. Build in 30-minute breaks between sessions. Mental fatigue degrades facilitation quality.

### Unmoderated Sessions (Alternative for Speed)

**When to use:** Usability testing with high-fidelity prototypes, preference testing, first-click testing, five-second tests.

**Platform setup:**
- Define tasks and instructions clearly (participants cannot ask for clarification).
- Include post-task questions (Single Ease Question, open-ended "What was difficult?").
- Set screening criteria in the platform.
- Launch and collect results within 24-48 hours.

### Stakeholder Observation

**Encourage (do not force) stakeholders to observe live sessions.** Nothing builds empathy and buy-in like watching a real user struggle with your product.

**Observation rules for stakeholders:**
- Observers are silent during sessions. No gestures, facial reactions, or coaching.
- Observers capture their own notes using the observation template.
- Observers participate in the post-session debrief.
- A dedicated observation room or separate video feed prevents observer interference.

---

## Day 4-5: Rapid Analysis

### Immediate Synthesis (After Final Session)

**Team debrief workshop (90-120 minutes):**

1. **Individual reflection** (15 min): Each person reviews their notes and writes top 3-5 observations on sticky notes (one observation per note).

2. **Affinity clustering** (30 min): All observations posted on a shared board. Silently cluster related observations. Do not discuss during clustering.

3. **Theme identification** (20 min): Name each cluster. Discuss what the cluster represents. Identify the strongest themes (most evidence, most impactful).

4. **Hypothesis evaluation** (15 min): Revisit the hypothesis log. For each hypothesis: Supported, Partially Supported, Not Supported, or Insufficient Evidence.

5. **Implication mapping** (20 min): For each key finding, identify: What should we do? What should we stop doing? What should we investigate further?

6. **Priority ranking** (10 min): Dot vote or forced rank the findings by impact and confidence.

### Topline Report (Within 48 Hours)

Deliver a brief topline report while full analysis continues:

```
TOPLINE FINDINGS — [Study Name] — [Date]

Methodology: [Method, n=X, participant description]

KEY FINDINGS:
1. [Finding with 1-2 supporting observations]
2. [Finding with 1-2 supporting observations]
3. [Finding with 1-2 supporting observations]

HYPOTHESIS EVALUATION:
H1: [Supported / Not supported] — [Brief evidence]
H2: [Supported / Not supported] — [Brief evidence]

IMMEDIATE RECOMMENDATIONS:
- [Action item 1]
- [Action item 2]

FULL REPORT: [Expected date]
```

---

## Day 5-10: Full Analysis and Report

### Detailed Analysis

- Complete thematic analysis of all session data (reference `05_qualitative/qualitative_analysis.md`).
- Calculate task metrics if usability testing (success rate, time on task, error rate, SEQ scores).
- Compile key quotes and video clips.
- Create user journey or experience maps if relevant.

### Full Report Structure

1. **Executive summary** (1 page): Research question, methodology, top findings, recommendations.
2. **Methodology** (0.5 page): Method, sample, recruitment, analysis approach.
3. **Findings** (3-5 pages): Each finding with evidence (quotes, metrics, observations).
4. **Recommendations** (1-2 pages): Prioritized actions linked to findings.
5. **Appendix:** Participant profiles, full task metrics, interview guide, raw data summary.

### Insight Repository Update

Extract discrete insights and add them to the research repository (reference `08_operations/insight_management.md`).

---

## Pattern Variations

### Discovery Sprint (Exploratory)

Replace usability tasks with open-ended interviews. Focus on understanding needs, behaviors, and pain points rather than testing a specific solution.

**Adjust:** More time in background/context questions. Fewer, longer sessions (60-75 min each). Use journey mapping or JTBD frameworks.

### Validation Sprint (Evaluative)

Focus on measuring whether a solution meets user needs. Task-based usability testing with metrics.

**Adjust:** Structured tasks with clear success criteria. Include post-task ratings. Calculate confidence intervals for task success rates.

### Comparative Sprint (A/B Concept Testing)

Test 2-3 design concepts with the same participants. Counterbalance presentation order to control for sequence effects.

**Adjust:** Prepare all concepts at similar fidelity. Include preference and reasoning questions after each concept and after seeing all concepts. Watch for order effects in analysis.

### Remote Sprint

All sessions conducted via video conference. Requires additional preparation for technology testing, screen sharing setup, and recording configuration.

**Adjust:** Send technology test instructions 24 hours before. Have a backup communication method (phone) for technical issues. Allow extra time per session (5-10 minutes for setup).

---

## Sprint Anti-Patterns

### 1. Scope Creep
"While we have participants, let's also ask about..." Adding questions dilutes focus and extends sessions beyond participant tolerance. Stick to the approved research question.

### 2. Confirmation Theater
Running research to validate a decision already made. If the team is not willing to change course based on findings, the sprint is wasted. Confirm genuine openness to unexpected results in the kickoff.

### 3. Sample Bias
Recruiting only enthusiastic users who volunteer eagerly. They are not representative. Include reluctant users, infrequent users, and users who have considered switching.

### 4. Analysis by Anecdote
One memorable participant dominates the narrative. One dramatic moment overshadows systematic patterns. Insist on seeing patterns across participants, not individual stories.

### 5. Deliverable Without Action
The report is delivered, acknowledged, and forgotten. Build action items into the sprint process. Assign owners and deadlines for recommendations in the debrief workshop.

---

## Success Criteria

- [ ] Research question was specific and answerable within the sprint
- [ ] At least 5 participants from the target population
- [ ] Stakeholders observed at least 2 live sessions
- [ ] Topline findings delivered within 48 hours
- [ ] Hypotheses evaluated against evidence (not just confirmed)
- [ ] Recommendations are specific and actionable
- [ ] Insights are logged in the research repository
- [ ] Follow-up actions are assigned with owners and timelines

---

**This pattern provides the standard approach for rapid user research. Adapt timing and methods to context but maintain the discipline of focused questions and evidence-based synthesis.**
