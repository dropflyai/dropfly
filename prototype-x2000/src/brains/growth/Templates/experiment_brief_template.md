# Experiment Brief Template — Complete Specification for Growth Experiments

## How to Use This Template

Complete this document before any experiment enters development. The brief serves as the contract between the growth PM, engineer, designer, and analyst. An incomplete brief leads to ambiguous results and wasted engineering time. Every field marked (Required) must be filled before the experiment is approved for implementation.

---

## Section 1: Experiment Identity (Required)

**Experiment ID:** E-[YYYY]-[MM]-[NNN]
**Experiment Name:** [Descriptive name, e.g., "Pricing Page Social Proof"]
**Date Created:** _______________
**Owner:** _______________
**Growth Area:** [ ] Acquisition [ ] Activation [ ] Retention [ ] Revenue [ ] Referral

---

## Section 2: Hypothesis (Required)

**Structured Hypothesis:**

IF we [make this specific change]:
_______________

FOR [this specific audience]:
_______________

THEN [this specific metric] will [increase/decrease] by [amount]:
_______________

BECAUSE [this behavioral/psychological mechanism]:
_______________

**Hypothesis Source:**
[ ] Quantitative data analysis (specify: _______________)
[ ] Qualitative user research (specify: _______________)
[ ] Competitive analysis
[ ] Behavioral science principle (specify: _______________)
[ ] Previous experiment learning (experiment ID: _______________)
[ ] Team brainstorm / intuition

**Confidence Level:** [ ] High (strong evidence) [ ] Medium (some evidence) [ ] Low (educated guess)

---

## Section 3: Metrics (Required)

**Primary Metric:**
- Metric name: _______________
- Current baseline: _______________
- Minimum Detectable Effect (MDE): ___%
- Target improvement: ___%

**Secondary Metrics (2-3):**
1. Metric: _______________ Baseline: _______________
2. Metric: _______________ Baseline: _______________
3. Metric: _______________ Baseline: _______________

**Guardrail Metrics (must NOT degrade):**
1. Metric: _______________ Threshold: must not drop below _______________
2. Metric: _______________ Threshold: must not drop below _______________

**Measurement Method:**
[ ] A/B test (concurrent control and treatment)
[ ] Before/After (sequential comparison)
[ ] Holdback test (ship to most, hold back control)

---

## Section 4: Experiment Design (Required)

**Variants:**

| Variant | Description | Visual/Mockup |
|---------|------------|--------------|
| Control (A) | [Current experience] | [Link to screenshot/mockup] |
| Treatment (B) | [Modified experience] | [Link to screenshot/mockup] |
| Treatment (C) | [Optional second variant] | [Link to screenshot/mockup] |

**Traffic Allocation:**
- Control: ___%
- Treatment B: ___%
- Treatment C: ___%

**Target Audience:**
- Who: _______________
- Segment filters: _______________
- Exclusions: _______________

**Sample Size Calculation:**
- Required sample per variant: _______________
- Expected traffic rate: _______________ per day
- Estimated duration: _______________ days
- Calculation method: [ ] Pre-calculated [ ] Tool: _______________

**Randomization Unit:**
[ ] User-level (same user always sees same variant)
[ ] Session-level (variant may change between sessions)
[ ] Account-level (all users in account see same variant)

---

## Section 5: Implementation (Required)

**Engineering Effort Estimate:** _______________ hours/days
**Design Effort Estimate:** _______________ hours/days

**Technical Requirements:**
- Frontend changes: [ ] Yes [ ] No — Description: _______________
- Backend changes: [ ] Yes [ ] No — Description: _______________
- New tracking events: [ ] Yes [ ] No — Events: _______________
- Feature flag name: _______________
- Third-party dependencies: _______________

**QA Checklist:**
- [ ] Both variants render correctly on desktop
- [ ] Both variants render correctly on mobile
- [ ] Tracking events fire correctly for all variants
- [ ] Feature flag properly assigns users to variants
- [ ] Edge cases handled (logged-out users, empty states, errors)
- [ ] Performance impact assessed (load time, bundle size)

---

## Section 6: Success Criteria and Decision Rules (Required)

**Success Definition:**
This experiment is a SUCCESS if:
_______________

This experiment is a FAILURE if:
_______________

This experiment is INCONCLUSIVE if:
_______________

**Decision Rules:**

| Outcome | Action |
|---------|--------|
| Primary metric improves with significance, no guardrail breach | Ship treatment to 100% |
| Primary metric improves, but guardrail metric degrades | Investigate, iterate, re-test |
| Primary metric does not improve | Kill treatment, document learning |
| Inconclusive after max duration | Extend 1 week or kill if impractical |

**Statistical Methodology:**
[ ] Frequentist (p < 0.05, 80% power)
[ ] Bayesian (>95% probability of improvement)
[ ] Sequential testing (with stopping rules)

**Maximum Duration:** _______________ days (kill if not significant by this date)

---

## Section 7: Risk Assessment

**Potential Risks:**

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [Risk 1] | H/M/L | H/M/L | [Mitigation plan] |
| [Risk 2] | H/M/L | H/M/L | [Mitigation plan] |

**Rollback Plan:**
If the experiment causes issues, the rollback process is:
_______________

**Estimated rollback time:** _______________

---

## Section 8: Timeline (Required)

| Milestone | Target Date | Owner | Status |
|-----------|-----------|-------|--------|
| Brief approved | | | [ ] |
| Design complete | | | [ ] |
| Development complete | | | [ ] |
| QA complete | | | [ ] |
| Experiment launched | | | [ ] |
| Midpoint check | | | [ ] |
| Target sample reached | | | [ ] |
| Analysis complete | | | [ ] |
| Decision made | | | [ ] |
| Cleanup (flag removed) | | | [ ] |

---

## Section 9: Results (Post-Experiment)

**Actual Duration:** _______________
**Actual Sample Size:** Control: ___ Treatment: ___

**Primary Metric Results:**

| Variant | Value | CI | Significance |
|---------|-------|----|-------------|
| Control | | | |
| Treatment | | | |
| Relative Lift | | | |

**Secondary Metric Results:**

| Metric | Control | Treatment | Lift | Significant? |
|--------|---------|-----------|------|-------------|
| | | | | |
| | | | | |

**Guardrail Metrics:**

| Metric | Control | Treatment | Status |
|--------|---------|-----------|--------|
| | | | [ ] Within threshold [ ] Breached |
| | | | [ ] Within threshold [ ] Breached |

**Decision:** [ ] Ship [ ] Iterate [ ] Kill
**Reasoning:** _______________

**Key Learnings:**
1. _______________
2. _______________
3. _______________

**Follow-Up Experiments:**
1. _______________
2. _______________

---

**A complete experiment brief is the difference between learning and
guessing. Invest the 30 minutes upfront to save weeks of ambiguity.**
