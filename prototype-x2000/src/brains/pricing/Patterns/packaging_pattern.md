# Good-Better-Best Packaging Pattern

> A structured pattern for designing tiered pricing packages that maximize revenue, simplify buyer decisions, and create natural upgrade paths -- the most proven packaging framework in SaaS and subscription businesses.

---

## Context

This pattern applies when you need to design or redesign your product packaging into tiers. Good-Better-Best (GBB) is the dominant packaging model in SaaS because it addresses the fundamental challenge of serving customers with different willingness-to-pay and different needs with a single product.

**Use this pattern for:**
- Initial pricing and packaging design for a new product
- Redesigning packaging that has become confusing or outdated
- Adding a new tier (entry-level or premium)
- Simplifying a complex packaging structure
- Moving from single-price to tiered pricing

---

## Challenge

Packaging fails when tiers are arbitrary (not based on buyer willingness-to-pay), when the "better" tier lacks a clear reason to upgrade, when features are distributed illogically across tiers, or when the number of tiers creates decision paralysis. This pattern ensures each tier serves a distinct customer segment with clear value differentiation.

---

## Phase 1: Buyer Segmentation (Weeks 1-2)

### 1.1 Segment Identification

Identify 3-4 distinct buyer segments based on:

| Dimension | Segment 1 (Good) | Segment 2 (Better) | Segment 3 (Best) |
|-----------|------------------|--------------------|--------------------|
| Company size | | | |
| Budget range | | | |
| Use case complexity | | | |
| Feature requirements | | | |
| Support needs | | | |
| Decision-maker | | | |
| Willingness to pay | | | |

### 1.2 Willingness-to-Pay Research

**Van Westendorp Price Sensitivity Meter:**

Ask four questions to a representative sample of each segment:
1. At what price would this product be so expensive that you would not consider it? (Too expensive)
2. At what price would this product be expensive but you would still consider it? (Expensive)
3. At what price would this product be a great deal? (Cheap)
4. At what price would this product be so cheap that you would question its quality? (Too cheap)

**Plot the results to find:**
- Point of Marginal Cheapness (PMC) -- intersection of too-cheap and expensive.
- Point of Marginal Expensiveness (PME) -- intersection of too-expensive and cheap.
- Optimal Price Point (OPP) -- intersection of too-cheap and too-expensive.
- Indifference Price Point (IDP) -- intersection of cheap and expensive.

### 1.3 Value Metric Selection

The value metric is the unit by which customers pay (per seat, per transaction, per GB, per API call, etc.).

**Good value metric criteria:**
- [ ] Scales with the value the customer receives.
- [ ] Is easy for the customer to understand and predict.
- [ ] Grows as the customer's usage and success grow.
- [ ] Is measurable and trackable in your system.
- [ ] Aligns with how customers think about the product.

**Common SaaS value metrics:**

| Metric Type | Examples | Best For |
|------------|---------|----------|
| Per seat/user | $X/user/month | Collaboration tools, team products |
| Per usage | $X/API call, $X/GB | Infrastructure, developer tools |
| Per feature tier | Flat monthly fee per tier | Products with clear feature differentiation |
| Per outcome | $X/transaction, $X/lead | Products with measurable business outcomes |
| Hybrid | Base fee + usage | Complex products with both platform and usage value |

---

## Phase 2: Tier Architecture (Weeks 2-4)

### 2.1 Three-Tier Framework

| Tier | Purpose | Target Segment | Price Position |
|------|---------|---------------|---------------|
| Good (Starter/Basic) | Entry point, get customers in the door | Price-sensitive, small teams, self-serve | Below market or at market |
| Better (Professional/Growth) | Core offering, where most customers land | Mid-market, growing teams, power users | At market |
| Best (Enterprise/Premium) | Maximum value, premium service | Large companies, complex needs, high-touch | Above market |

### 2.2 Feature Allocation Strategy

**Feature categorization:**

| Category | Definition | Tier Allocation |
|----------|-----------|----------------|
| Table stakes | Must-have features every customer expects | Good (all tiers) |
| Differentiators | Features that justify the upgrade | Better and Best |
| Delighters | Premium features that few need but are willing to pay for | Best only |
| Add-ons | Valuable but not tier-defining features | Available at any tier for additional fee |

**Feature allocation principles:**
1. **Good tier must be genuinely useful.** If the Good tier is crippled, it damages trust and generates negative reviews. Customers should be able to succeed with Good.
2. **Better tier must be the obvious choice for most.** 50-70% of customers should naturally land on Better. This is your revenue engine.
3. **Best tier must justify its premium.** Enterprise features (SSO, audit logs, advanced security, dedicated support, custom integrations) are natural Best-tier features.
4. **The gap between Good and Better must feel larger than the gap between Better and Best.** This makes Better feel like the best value.

### 2.3 Feature Distribution Matrix

| Feature | Good | Better | Best | Rationale |
|---------|------|--------|------|-----------|
| Core functionality | Y | Y | Y | Table stakes |
| [Feature 2] | Limited | Full | Full | Usage limit drives upgrade |
| [Feature 3] | N | Y | Y | Key differentiator |
| [Feature 4] | N | Y | Y | Key differentiator |
| [Feature 5] | N | N | Y | Enterprise requirement |
| [Feature 6] | N | N | Y | Premium differentiator |
| Support level | Community | Email | Dedicated | Support tiers drive enterprise revenue |
| SLA | None | 99.9% | 99.99% | Enterprises require SLAs |
| SSO/SAML | N | N | Y | Enterprise security requirement |
| Audit logs | N | Basic | Advanced | Compliance requirement |
| API access | Limited | Standard | Full | Developer/integration needs |
| Custom integrations | N | N | Y | Enterprise workflow needs |
| Admin controls | Basic | Standard | Advanced | Team management needs |
| Usage limits | Low | Medium | High/Unlimited | Natural scaling mechanism |

### 2.4 Pricing the Tiers

**Price anchoring strategy:**

The Best tier price anchors the Better tier as reasonable value. The Good tier price anchors the product as accessible.

**Common price ratios:**

| Ratio | Good : Better : Best | When to Use |
|-------|---------------------|-------------|
| 1 : 2.5 : 5 | $29 : $79 : $149 | Strong feature differentiation |
| 1 : 3 : 8 | $19 : $59 : $149 | Enterprise-heavy, large Best premium |
| 1 : 2 : 4 | $49 : $99 : $199 | Moderate differentiation |
| 1 : 3 : 6 | $15 : $49 : $99 | Wide market, accessibility focus |

**Price point testing:**
- Test 2-3 price point variations with real traffic (A/B test if possible).
- Test with willingness-to-pay surveys before live testing.
- Monitor tier distribution -- if more than 60% choose Good, Better is not compelling enough.

---

## Phase 3: Pricing Page Design (Weeks 4-5)

### 3.1 Pricing Page Principles

- **Highlight the Better tier.** Visual emphasis (larger card, "Most Popular" badge, different color) on the tier you want most customers to choose.
- **Show annual pricing by default.** Display monthly option but default to annual (higher commitment, lower churn).
- **Display the discount for annual clearly.** "Save 20%" or show both prices.
- **Feature comparison table below.** Quick tier cards at top, detailed comparison below for evaluators.
- **CTA copy differs by tier.** Good: "Get Started" / Better: "Start Free Trial" / Best: "Contact Sales".
- **Social proof per tier.** Show logos or testimonials relevant to each tier's target segment.

### 3.2 Pricing Page Information Architecture

```
[Annual/Monthly toggle]

[Good Tier Card]  [Better Tier Card - HIGHLIGHTED]  [Best Tier Card]
   $X/mo               $Y/mo                          $Z/mo
   Key features         Key features                   Key features
   [CTA Button]         [CTA Button]                   [Contact Sales]

[Full Feature Comparison Table]

[FAQ Section]

[Social Proof / Customer Logos]
```

### 3.3 FAQ Content

Address these questions on the pricing page:
- Can I switch plans at any time?
- What happens if I exceed my plan limits?
- Do you offer discounts for annual billing?
- Do you offer discounts for nonprofits/education/startups?
- What payment methods do you accept?
- Can I cancel at any time?
- Is there a free trial?
- What is the refund policy?

---

## Phase 4: Launch and Optimization (Weeks 5-8+)

### 4.1 Launch Checklist

- [ ] Pricing page live with all tiers.
- [ ] Billing system configured for all tiers.
- [ ] Self-serve upgrade/downgrade flows built.
- [ ] Sales team trained on tier positioning and objection handling.
- [ ] Support team trained on tier-specific features and limits.
- [ ] Analytics tracking tier selection, conversion, upgrade, and downgrade events.
- [ ] Existing customer migration plan executed (if redesign).

### 4.2 Tier Distribution Monitoring

**Healthy tier distribution targets:**

| Tier | Target % of Customers | Target % of Revenue |
|------|----------------------|---------------------|
| Good | 20-30% | 5-15% |
| Better | 50-60% | 40-55% |
| Best | 15-25% | 35-50% |

**Diagnostic triggers:**

| Signal | Diagnosis | Action |
|--------|----------|--------|
| >60% on Good | Better not compelling | Improve Better tier value, raise Good price or reduce Good features |
| >70% on Better | Good may be too restrictive, Best not needed | Verify Good tier usability, test lower Best price |
| <10% on Best | Best overpriced or features not valued | Research enterprise needs, adjust pricing or features |
| High upgrade rate Good to Better | Good tier doing its job | Optimize the upgrade nudge timing |
| High downgrade rate Better to Good | Better not delivering perceived value | Investigate feature usage, survey downgraders |

### 4.3 Ongoing Optimization

**Quarterly review:**
- Tier distribution vs. targets.
- Upgrade and downgrade rates.
- Revenue per tier.
- Feature usage by tier (are differentiating features actually used?).
- Competitive pricing changes.
- Customer feedback on pricing and packaging.

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Crippled Good tier | Negative reviews, damages brand | Good tier must be genuinely useful |
| Too many tiers (4+) | Decision paralysis, operational complexity | Three tiers plus optional add-ons |
| Arbitrary feature allocation | Upgrade reasons unclear | Allocate based on segment needs, not gut feeling |
| Better tier is not the obvious choice | Revenue under-optimized | Ensure Better is clearly the best value |
| No upgrade path friction | Users never feel the need to upgrade | Usage limits, feature gates that trigger at the right moment |
| Changing packaging too frequently | Customer confusion, trust erosion | Major changes no more than once per year |

---

## References

- `Templates/pricing_page_template.md` -- Pricing page specification
- `Templates/pricing_strategy_template.md` -- Pricing strategy document
- `03_models/` -- Pricing models
- `04_psychology/` -- Price anchoring and decoy effects

---

*Pattern version: 1.0*
*Brain: Pricing Brain*
*Cross-brain dependencies: Design Brain (pricing page), Engineering Brain (billing system), Product Brain (feature allocation), Marketing Brain (positioning per tier)*
