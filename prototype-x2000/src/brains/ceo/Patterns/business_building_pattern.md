# Business Building Pattern -- From Idea to Launched Product

## Situation

This pattern applies when building a new product or business from scratch.
It covers the complete lifecycle from initial concept through launch,
coordinating all necessary brains in the correct sequence.

---

## Prerequisites

Before starting this pattern:
- A clear problem hypothesis exists (who has what problem)
- A founding team or brain system is ready to execute
- Sufficient resources (time, capital) for at least one full cycle
- CEO Brain is orchestrating the effort

---

## Approach: Six Phases

### Phase 1: Discovery (Weeks 1-3)

**Objective:** Validate the problem and define the opportunity.

```
STEP 1: Problem Validation
  Brain: Research Brain
  Activity: Customer interviews (30+), market sizing
  Output: Problem validation report, TAM/SAM/SOM
  Gate: Problem confirmed as frequent, painful, underserved

STEP 2: Competitive Analysis
  Brain: MBA Brain
  Activity: Competitive landscape mapping
  Output: Competitive analysis, positioning options
  Gate: Clear differentiation opportunity identified

STEP 3: Business Model Hypothesis
  Brain: MBA Brain
  Activity: Business model canvas, unit economics estimate
  Output: Lean Canvas, initial financial model
  Gate: Business model is viable on paper
```

**Quality Gate:** Discovery Review
- Problem validated with real customer evidence
- Market is large enough (TAM > $1B or niche-appropriate)
- Competitive differentiation is clear
- Business model is viable
- CEO Brain decision: GO / PIVOT / KILL

### Phase 2: Definition (Weeks 3-5)

**Objective:** Define what we are building and for whom.

```
STEP 4: Product Vision
  Brain: Product Brain
  Activity: PRD, user stories, feature prioritization
  Output: MVP PRD, user story map, prioritized backlog
  Gate: PRD reviewed and approved by CEO Brain

STEP 5: User Research
  Brain: Design Brain
  Activity: User research, persona creation, user flows
  Output: Personas, journey maps, information architecture
  Gate: Design aligns with PRD

STEP 6: Architecture Decision
  Brain: Engineering Brain
  Activity: Technical architecture, technology selection
  Output: Architecture document, tech stack decision
  Gate: Architecture supports product requirements
```

**Quality Gate:** Definition Review
- PRD is complete and approved
- User research validates product direction
- Architecture is feasible and scalable
- All three brains are aligned
- CEO Brain decision: GO / ITERATE

### Phase 3: Design (Weeks 5-8)

**Objective:** Create the complete design for the MVP.

```
STEP 7: UI/UX Design
  Brain: Design Brain
  Activity: Wireframes, high-fidelity mockups, prototype
  Output: Complete screen specs, component library, design tokens
  Gate: Design tested with users (5+ usability tests)

STEP 8: Design-Engineering Handoff
  Brain: Design Brain + Engineering Brain
  Activity: Design review, feasibility check, handoff
  Output: Engineering-ready specs, design token integration
  Gate: Engineering confirms feasibility of all designs
```

**Quality Gate:** Design Review
- All screens designed and specified
- Usability tested with target users
- Engineering has confirmed feasibility
- Design system established
- CEO Brain decision: GO / ITERATE

### Phase 4: Build (Weeks 8-14)

**Objective:** Implement the MVP.

```
STEP 9: Implementation
  Brain: Engineering Brain
  Activity: Backend, frontend, integrations, testing
  Output: Working product, deployed to staging
  Gate: All features implemented per PRD

STEP 10: Quality Assurance
  Brain: QA Brain
  Activity: Test plan execution, bug filing, regression
  Output: Test results, bug reports, quality assessment
  Gate: All critical bugs fixed, quality bar met

STEP 11: Infrastructure
  Brain: Cloud Brain (if needed)
  Activity: Production infrastructure setup
  Output: Production environment, monitoring, alerting
  Gate: Infrastructure load-tested and secure
```

**Quality Gate:** Build Review
- All PRD features implemented
- QA test plan passed
- Performance benchmarks met
- Security review completed
- CEO Brain decision: GO / FIX

### Phase 5: Go-to-Market (Weeks 10-14, parallel with Build)

**Objective:** Prepare everything needed for launch.

```
STEP 12: Pricing
  Brain: Pricing Brain
  Activity: Pricing model, packaging
  Output: Pricing page, plan structure
  Gate: Pricing tested or benchmarked

STEP 13: Marketing
  Brain: Marketing Brain + Content Brain
  Activity: Launch plan, landing page, content
  Output: Launch plan, marketing assets, content calendar
  Gate: Launch plan approved

STEP 14: Sales Readiness (if applicable)
  Brain: Sales Brain
  Activity: Sales process, collateral, demo
  Output: Sales playbook, demo script
  Gate: Sales team trained

STEP 15: Support Readiness
  Brain: Support Brain
  Activity: Knowledge base, support workflow
  Output: Help docs, ticket workflow, SLA
  Gate: Support team ready
```

**Quality Gate:** Launch Readiness Review
- Pricing finalized
- Marketing assets ready
- Sales team trained (if applicable)
- Support systems operational
- CEO Brain decision: LAUNCH / DELAY

### Phase 6: Launch and Learn (Week 15+)

```
STEP 16: Launch
  Brain: CEO Brain (coordinates all)
  Activity: Execute launch plan
  Output: Product live, customers onboarding

STEP 17: Measure
  Brain: Analytics Brain
  Activity: Dashboard setup, metric tracking
  Output: Launch metrics, cohort analysis

STEP 18: Iterate
  Brain: Product Brain (leads), all brains (support)
  Activity: Customer feedback, iteration planning
  Output: Next sprint priorities
```

**Quality Gate:** 30-Day Review
- Key metrics tracked and reviewed
- Customer feedback collected and synthesized
- First iteration priorities identified
- PMF signals assessed
- CEO Brain decision: CONTINUE / PIVOT / ITERATE

---

## Brains Involved (by Phase)

| Phase | Primary Brain | Supporting Brains |
|-------|--------------|-------------------|
| Discovery | Research, MBA | CEO |
| Definition | Product | Design, Engineering, CEO |
| Design | Design | Product, Engineering |
| Build | Engineering | QA, Cloud, Security |
| Go-to-Market | Marketing | Pricing, Sales, Support, Content |
| Launch | CEO | All |

---

## Common Pitfalls

| Pitfall | Description | Prevention |
|---------|------------|-----------|
| Skipping Discovery | Jump straight to building | Mandate 30+ customer interviews |
| Over-designing MVP | Perfect design delays launch | Time-box design to 3 weeks |
| Feature creep | Scope grows during Build | Freeze scope at Build start |
| No quality gate | Skip reviews to move faster | Every phase ends with a gate |
| Launch without metrics | Cannot measure success | Analytics setup before launch |
| No iteration plan | Launch and move on | 30-day review is mandatory |

---

## Timeline

```
Phase 1: Discovery      [===========]                    (3 weeks)
Phase 2: Definition           [========]                 (2 weeks)
Phase 3: Design                    [===========]         (3 weeks)
Phase 4: Build                           [================] (6 weeks)
Phase 5: Go-to-Market                [================]  (4 weeks, parallel)
Phase 6: Launch                                      [===] (1 week)

Total: ~15 weeks from start to launch
```

---

## Example: Building a SaaS Invoicing Product

```
Discovery: 40 interviews with small business owners confirm invoicing
  is painful (8+ hours/week), existing tools are bloated and expensive.
  TAM: $12B. Differentiation: AI-powered, mobile-first.

Definition: PRD defines 5 core features: create invoice, send invoice,
  track payments, automated reminders, simple reporting. Mobile-first.

Design: 12 screens designed, tested with 7 users, 4.2/5 usability score.

Build: Next.js frontend, Supabase backend, Stripe payments. 6-week sprint.

Go-to-Market: Freemium pricing ($0/5 invoices, $15/unlimited).
  Content-led launch: "Invoice in 60 seconds" demo video.

Launch: 200 signups in first week. 30% convert to paid in month 1.
  NPS: 52. Retention at day-30: 68%.

30-Day Review: PMF signals positive. Iterate on mobile experience
  and add recurring invoices.
```

---

**This pattern is the CEO Brain's playbook for building new products.
Every business building effort follows this structure, adapted to the
specific context and scale.**
