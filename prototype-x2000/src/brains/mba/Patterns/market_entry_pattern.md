# Market Entry Pattern

Structured workflow for entering a new market, geography, vertical, or customer segment. Applies whether you are expanding an existing product into a new market or launching a new product into an adjacent space.

---

## When to Use

- Expanding into a new geographic market (new country, new region)
- Targeting a new customer segment (moving upmarket or downmarket)
- Entering a new industry vertical with existing technology
- Launching in a new product category
- Expanding from B2C to B2B or vice versa

## When NOT to Use

- Incremental feature additions to existing market (use product roadmap instead)
- Pricing changes within existing market (use pricing analysis instead)
- Strategic pivots that abandon the existing market (use `strategic_pivot_pattern.md` instead)

---

## Prerequisites

Before starting the Market Entry Pattern, verify:

- [ ] Core business is stable (not entering new market to escape problems in existing market)
- [ ] Existing market position is defensible (not diluting focus at a critical moment)
- [ ] Capital available for 12-18 month investment horizon
- [ ] At least one hypothesis for why you can win in the new market
- [ ] Executive sponsor committed to the initiative

---

## Phase 1: Market Research and Sizing (2-4 weeks)

### Objective
Determine if the market is attractive enough to pursue and identify the specific opportunity.

### Activities

**1.1 Market Definition**
- Define the market boundaries: what is in scope, what is out
- Identify the job-to-be-done in this market
- Map the value chain: who are the players, where is value created and captured

**1.2 Market Sizing**
- Calculate TAM using both top-down and bottom-up methods
- Narrow to SAM based on your capabilities and constraints
- Estimate SOM realistically (first 12 months)
- Document all assumptions

| Method | TAM | SAM | SOM | Key Assumptions |
|--------|-----|-----|-----|-----------------|
| Top-Down | $[X] | $[X] | $[X] | [Assumptions] |
| Bottom-Up | $[X] | $[X] | $[X] | [Assumptions] |

**1.3 Competitive Landscape**
- Identify direct competitors (same product, same market)
- Identify indirect competitors (different product, same job-to-be-done)
- Map competitor strengths, weaknesses, and positioning
- Identify gaps in the competitive landscape

**1.4 Customer Discovery**
- Conduct 15-25 customer interviews in the target market
- Validate willingness to pay and purchase process
- Identify key buyer personas and decision-making units
- Document unmet needs and pain points

### Decision Gate 1: Market Attractiveness

| Criteria | Threshold | Actual | Pass? |
|----------|-----------|--------|-------|
| SOM (12-month) | > $500K revenue potential | $[X] | Y/N |
| Customer interviews conducted | >= 15 | [X] | Y/N |
| Clear unmet need identified | Yes | [Y/N] | Y/N |
| Competitive gap exists | Yes | [Y/N] | Y/N |
| No regulatory blocker | Confirmed | [Y/N] | Y/N |

**Gate result:** PROCEED to Phase 2 / STOP and document why / PIVOT market definition

---

## Phase 2: Strategy and Validation (3-6 weeks)

### Objective
Define the entry strategy, validate key assumptions, and build the business case.

### Activities

**2.1 Entry Strategy Selection**

Choose one:

| Strategy | Description | Best When | Risk Level |
|----------|-------------|-----------|------------|
| Direct entry | Launch directly in new market | Strong product-market fit signal, capital available | High |
| Partnership | Enter through local partner | Market requires local knowledge, regulatory complexity | Medium |
| Acquisition | Buy existing player in market | Speed matters, organic entry too slow | High (cost) |
| Pilot / Beta | Limited launch to validate | High uncertainty, need learning before commitment | Low |
| Licensing | License technology to local operator | Low capital, low control acceptable | Low |

**2.2 Positioning and Differentiation**
- Define positioning statement for the new market (may differ from core market)
- Identify the wedge: what specific value proposition wins first customers?
- Articulate differentiation vs. existing market options
- Define pricing strategy for new market

Positioning statement:
> For [target customer in new market], who [key unmet need], [product] is a [category] that [key benefit]. Unlike [existing alternatives], we [key differentiator].

**2.3 Business Case**
- Financial model: Year 1-3 revenue, costs, and profitability
- Required investment: people, technology, marketing, partnerships
- Break-even timeline
- Scenario analysis: base, optimistic, pessimistic

| Scenario | Year 1 Revenue | Year 1 Cost | Break-even | ROI (3-year) |
|----------|---------------|-------------|------------|-------------|
| Pessimistic | $[X] | $[X] | [Month] | [X%] |
| Base | $[X] | $[X] | [Month] | [X%] |
| Optimistic | $[X] | $[X] | [Month] | [X%] |

**2.4 Assumption Validation**
- List top 5 assumptions that must be true for this entry to succeed
- Design low-cost tests for each assumption
- Execute tests and document results

| Assumption | Test | Result | Valid? |
|-----------|------|--------|--------|
| [Assumption 1] | [Test design] | [Result] | Y/N |
| [Assumption 2] | [Test design] | [Result] | Y/N |
| [Assumption 3] | [Test design] | [Result] | Y/N |

### Decision Gate 2: Business Case Viability

| Criteria | Threshold | Actual | Pass? |
|----------|-----------|--------|-------|
| Base case ROI (3-year) | > 100% | [X%] | Y/N |
| Key assumptions validated | >= 3 of 5 | [X/5] | Y/N |
| Entry strategy selected with rationale | Yes | [Y/N] | Y/N |
| Positioning differentiated from competitors | Yes | [Y/N] | Y/N |
| Investment required within budget | Yes | [Y/N] | Y/N |

**Gate result:** PROCEED to Phase 3 / STOP and document why / RETURN to Phase 1 with adjusted scope

---

## Phase 3: Launch Preparation (4-8 weeks)

### Objective
Build the operational capability to execute the market entry.

### Activities

**3.1 Product Adaptation**
- Identify product changes needed for new market (localization, features, integrations)
- Prioritize changes: must-have for launch vs. post-launch roadmap
- Execute product changes with Engineering Brain support

**3.2 Go-to-Market Preparation**
- Build marketing assets for new market (landing pages, content, campaigns)
- Establish distribution channels (direct sales, partnerships, marketplaces)
- Set up first 100 customers acquisition plan (specific, named targets if B2B)
- Prepare sales materials and objection handling

**3.3 Operations Setup**
- Establish support capability for new market (timezone, language, expertise)
- Set up billing and payments for new market (currency, tax, compliance)
- Configure analytics and reporting for new market metrics
- Establish legal and compliance requirements

**3.4 Team and Resources**
- Assign or hire market entry team lead
- Allocate engineering, design, and marketing resources
- Set up cross-functional war room cadence (weekly during launch)

### Decision Gate 3: Launch Readiness

| Criteria | Threshold | Actual | Pass? |
|----------|-----------|--------|-------|
| Product ready for new market | MVP complete | [Y/N] | Y/N |
| Go-to-market materials ready | Core assets done | [Y/N] | Y/N |
| Support capability established | Can handle first 50 customers | [Y/N] | Y/N |
| Legal/compliance cleared | No blockers | [Y/N] | Y/N |
| Team assigned and briefed | All roles filled | [Y/N] | Y/N |

**Gate result:** LAUNCH / DELAY with specific blockers / ABORT with rationale

---

## Phase 4: Launch and Iterate (Ongoing, first 90 days critical)

### Objective
Execute the launch, acquire first customers, and rapidly iterate based on market feedback.

### Activities

**4.1 Launch Execution (Week 1-2)**
- Execute launch plan (soft launch recommended over big bang)
- Activate marketing campaigns
- Begin outbound for first customers
- Monitor all systems for issues

**4.2 First 30 Days: Learn**
- Talk to every customer (literally every one)
- Track activation, engagement, and retention daily
- Identify the biggest friction point and fix it
- Adjust messaging based on what resonates

**4.3 Days 31-60: Optimize**
- Analyze channel performance and double down on what works
- Optimize onboarding based on first cohort data
- Address top 3 customer feedback themes
- Begin building repeatable sales/growth process

**4.4 Days 61-90: Scale or Adjust**
- Evaluate unit economics with real data
- Compare actual vs. projected metrics
- Decide: scale investment, maintain pace, or trigger kill criteria
- Build 6-month plan based on learnings

### Key Metrics (Track Weekly)

| Metric | Week 1 | Week 4 | Week 8 | Week 12 | Target |
|--------|--------|--------|--------|---------|--------|
| New customers | | | | | [X] |
| Revenue | | | | | $[X] |
| CAC | | | | | $[X] |
| Activation rate | | | | | [X%] |
| 30-day retention | | | | | [X%] |
| NPS | | | | | [X] |

---

## Kill Criteria

Pre-commit to these conditions for market exit:

| Condition | Trigger | Action |
|-----------|---------|--------|
| Revenue < $[X] after 6 months | Met | Review and likely exit |
| CAC > $[X] after 3 months of optimization | Met | Pivot GTM or exit |
| Retention < [X%] after 3 cohorts | Met | Product-market fit not achieved, exit |
| Key assumption invalidated | Met | Reassess entire entry thesis |
| Competitive response makes position untenable | Met | Exit or pivot positioning |

---

## Common Pitfalls

1. **Premature scaling:** Investing heavily before product-market fit is validated in the new market. Your PMF in the core market does not guarantee PMF in the new market.
2. **Ignoring local dynamics:** Assuming what works in one market will work in another. Culture, regulation, competition, and customer expectations differ.
3. **Underestimating required investment:** Market entry costs are almost always higher than projected. Budget 1.5x your estimate.
4. **Divided attention:** Trying to enter a new market while the core business is struggling. New markets require dedicated focus.
5. **No kill criteria:** Entering without pre-committed exit conditions leads to sunk cost fallacy and slow death.
6. **Wrong sequencing:** Trying to serve the entire new market at once. Start narrow, prove the model, then expand.

---

## Cross-Brain References

| Brain | Consult For |
|-------|-------------|
| Engineering Brain | Product adaptation, infrastructure for new market, technical feasibility |
| Design Brain | UX adaptation for new market, localization design, user research |
| Finance Brain | Financial modeling, scenario analysis, break-even analysis |
| Legal Brain | Regulatory compliance, entity structure, contracts |
| Marketing Brain | GTM strategy, channel selection, messaging |
| Localization Brain | Language, cultural adaptation, regional conventions |
| Data Brain | Market data analysis, customer segmentation, metric tracking |

---

## Exit Criteria

The Market Entry Pattern is complete when:
- [ ] Market has been entered (customers acquired and revenue generated) OR
- [ ] Decision made to not enter (with documented rationale)
- [ ] 90-day post-launch review completed
- [ ] Lessons learned logged in `Memory/FrameworkApplications.md`
- [ ] Decision logged in `Memory/DecisionLog.md`
