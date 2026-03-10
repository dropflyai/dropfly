# Pattern: Support Scaling During Rapid Growth

## Context

This pattern applies when a support organization faces rapid volume growth (>30% QoQ)
due to user acquisition, product expansion, geographic expansion, or seasonal demand.
The organization must scale capacity without proportional headcount growth while
maintaining or improving customer experience quality.

---

## Problem

Support volume is growing faster than headcount can scale. SLA compliance is declining.
CSAT is at risk. Backlog is growing. Agents are burning out. The organization needs a
systematic approach to scale support capacity across multiple levers simultaneously.

---

## Solution: The Five-Lever Scaling Model

```
SCALING LEVER 1: DEFLECTION (reduce incoming volume)
SCALING LEVER 2: AUTOMATION (resolve without human)
SCALING LEVER 3: EFFICIENCY (handle faster per human interaction)
SCALING LEVER 4: CAPACITY (add human agents)
SCALING LEVER 5: QUALITY (maintain/improve despite scale)
```

Each lever is pulled in order. Deflection is highest ROI; capacity is lowest ROI.

---

## Implementation

### Phase 1: Immediate Triage (Week 1-2)

```
ASSESS THE GAP:
  Current weekly volume:        [N]
  Current weekly capacity:      [N]
  Gap (tickets/week):           [N]
  Projected gap in 3 months:    [N] (at current growth rate)
  SLA compliance current:       [%]
  CSAT current:                 [%]
```

Actions for immediate relief:
1. **Identify top 10 ticket drivers** — Pareto analysis of current volume
2. **Create/update KB articles** for top 5 ticket drivers (1-week sprint)
3. **Deploy canned responses** for repetitive issues (day 1)
4. **Adjust SLA expectations** transparently if needed (temporary)
5. **Add overtime/BPO surge** for immediate capacity (if budget allows)

### Phase 2: Deflection Lever (Week 2-6)

```
TARGET: Reduce incoming ticket volume by 20-30%

ACTIONS:
  1. Knowledge base sprint
     - Audit top 50 ticket categories against KB coverage
     - Create articles for every gap in top 20 categories
     - Improve articles with low helpfulness (<60%)
     - Add interactive troubleshooters for top 5 diagnostic flows

  2. Self-service optimization
     - Implement/improve help center search
     - Add contextual in-app help for top confusion points
     - Deploy proactive messaging for known issues
     - Create onboarding guidance to reduce early-lifecycle tickets

  3. Community forum launch/expansion
     - If no forum: launch with seeded content from top KB articles
     - If existing: gamify contributions, recruit power users as moderators

METRIC: Contact rate (tickets / active users) should decrease
```

### Phase 3: Automation Lever (Week 4-10)

```
TARGET: Resolve 20-40% of remaining volume without human

ACTIONS:
  1. Chatbot deployment or improvement
     - Level 1: Rule-based flows for top 10 FAQ (2-week build)
     - Level 2: LLM-powered bot grounded in KB (4-6 week build)
     - Level 3: Agentic bot with action capabilities (8-12 week build)

  2. Auto-resolution workflows
     - Password resets: fully automated
     - Account verification: automated with identity checks
     - Known-issue acknowledgment: auto-respond with status + workaround
     - Billing questions: automated account/invoice lookup

  3. Smart routing and triage
     - Auto-categorize incoming tickets (ML/LLM)
     - Auto-prioritize based on customer segment + issue type
     - Route to correct queue without manual triage step

METRIC: Bot containment rate, auto-resolution rate
```

### Phase 4: Efficiency Lever (Week 6-12)

```
TARGET: Reduce average handle time by 15-25%

ACTIONS:
  1. Agent assist tools
     - Suggested replies (AI-powered)
     - Auto-summarization (for escalation handoffs)
     - Context-aware KB retrieval (articles appear automatically)

  2. Macro and template optimization
     - Audit existing macros; update for current products
     - Create new macros for top 20 response types
     - Train agents on efficient macro usage

  3. Process optimization
     - Eliminate unnecessary categorization steps
     - Streamline escalation process (reduce handoff friction)
     - Improve internal tools (faster account lookup, better admin panel)

  4. Agent training
     - Product knowledge refresh (reduce research time)
     - Advanced troubleshooting techniques
     - Multi-channel efficiency (chat concurrency, async workflow)

METRIC: AHT (handle time), tickets per agent per day
```

### Phase 5: Capacity Lever (Parallel, Week 1-12)

```
TARGET: Add headcount to meet remaining demand after deflection,
automation, and efficiency improvements

ACTIONS:
  1. Immediate: BPO surge (1-2 week ramp)
     - Engage existing BPO partner for additional agents
     - Or engage new BPO with rapid onboarding program
     - Scope: L1 triage, known-issue resolution, simple tickets

  2. Short-term: Part-time and contract agents (2-4 week ramp)
     - Hire for peak hours and specific skills
     - Faster to recruit and onboard than full-time

  3. Medium-term: Full-time hires (6-10 week ramp)
     - Hire for sustainable long-term capacity
     - Factor in: 4-8 weeks to productive (onboarding)
     - Hire ahead of need (volume grows while you recruit)

  4. Cross-training (existing staff)
     - Train CS, sales ops, or other teams on L1 basics
     - Activate during peaks as overflow capacity

HEADCOUNT FORMULA:
  Required agents = (Projected monthly volume / tickets per agent per month)
                    * coverage factor * shrinkage factor
                    - deflection savings - automation savings - efficiency gains
```

### Phase 6: Quality Lever (Continuous)

```
TARGET: Maintain CSAT >85% and CES <3.0 during scaling

ACTIONS:
  1. QA program
     - Review sample of tickets weekly (minimum 3 per new agent)
     - Calibrate weekly during scaling period
     - Track QA score trend; intervene immediately if declining

  2. Agent coaching
     - Increase coaching frequency during scaling (weekly for new agents)
     - Focus coaching on highest-impact quality dimensions
     - Pair new agents with experienced mentors

  3. Customer feedback loop
     - Monitor CSAT daily during scaling (not monthly)
     - Investigate every CSAT < 3 within 24 hours
     - Track CES to detect effort increases early

  4. Escalation monitoring
     - Watch escalation rate; spike may indicate training gaps
     - Ensure escalation quality (context preserved, warm handoff)
     - Increase L2/L3 capacity proportionally if escalation volume grows

METRIC: CSAT, CES, QA scores, escalation rate, reopen rate
```

---

## Metrics: Scaling Scorecard

| Metric | Pre-Scaling | Target (3-month) | Target (6-month) |
|--------|------------|-------------------|-------------------|
| Volume growth | Baseline | +30-50% | +50-100% |
| Contact rate (tickets/user) | Baseline | -20% | -30% |
| Deflection rate | Baseline | +15pp | +25pp |
| Bot containment | 0% or baseline | 25% | 40% |
| AHT | Baseline | -15% | -25% |
| Tickets/agent/month | Baseline | +20% | +30% |
| SLA compliance | Current | >90% | >95% |
| CSAT | Current | Maintain | Improve |
| CES | Current | Maintain | Improve |
| Cost per ticket | Current | -15% | -25% |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails |
|-------------|-------------|
| **Hire first, optimize later** | Expensive, slow; does not address root causes of volume |
| **Hide the contact button** | Increases customer effort; destroys trust; does not reduce need |
| **Deploy chatbot without KB** | Bot has nothing to ground responses in; hallucination risk |
| **Reduce QA during scaling** | Quality degrades silently; CSAT drops; customers churn |
| **Skip BPO, wait for FTEs** | 6-10 week hiring gap while SLAs breach daily |
| **Measure only volume** | Volume is a symptom; contact rate is the real metric |

---

## Timeline Summary

```
WEEK:  1  2  3  4  5  6  7  8  9  10  11  12
       ├──┤
       Triage + BPO surge

          ├─────────────────┤
          KB sprint + self-service (deflection)

                ├──────────────────────────┤
                Chatbot build + automation

                      ├──────────────────────┤
                      Agent assist + efficiency

       ├────────────────────────────────────────┤
       Hiring pipeline (FTEs ramping by week 8-12)

       ├────────────────────────────────────────┤
       Quality monitoring (continuous)
```

---

**This pattern is authoritative for support scaling within the Support Brain.**
