# SaaS Pricing Page Specification Template

> A detailed specification for designing and building a high-converting SaaS pricing page -- including information architecture, content requirements, tier presentation, and conversion optimization elements.

---

## Page Header

| Field | Input |
|-------|-------|
| Product Name | |
| Page Owner | |
| Designer | |
| Developer | |
| Date Created | |
| Last Updated | |
| Status | [ ] Spec [ ] Design [ ] Development [ ] Live |

---

## Section 1: Page Strategy

### Business Objectives

| Objective | Priority | Metric |
|-----------|----------|--------|
| Drive self-serve signups | [ ] Primary [ ] Secondary | Signup conversion rate |
| Drive sales-assisted inquiries | [ ] Primary [ ] Secondary | "Contact Sales" clicks |
| Upsell existing customers | [ ] Primary [ ] Secondary | Plan upgrade rate |
| Reduce pricing-related support | [ ] Primary [ ] Secondary | Pricing FAQ page views |
| Communicate value positioning | [ ] Primary [ ] Secondary | Time on page, scroll depth |

### Target Audience

| Audience | Expected Behavior | Design Implications |
|----------|------------------|-------------------|
| Self-serve buyer (knows what they want) | Scans tiers, picks one, signs up | Clear tier cards, prominent CTAs |
| Evaluator (comparing options) | Studies feature comparison, reads FAQ | Detailed comparison table, FAQ |
| Enterprise buyer (complex needs) | Looks for "Contact Sales" | Visible enterprise CTA, custom pricing |
| Existing customer (considering upgrade) | Compares current plan to next tier | Current plan indicator, upgrade benefits |

---

## Section 2: Information Architecture

### Page Layout (Top to Bottom)

```
1. HERO SECTION
   - Page headline
   - Subheadline
   - Annual/Monthly billing toggle

2. TIER CARDS (3 cards side-by-side)
   - Tier name, price, key features, CTA

3. FEATURE COMPARISON TABLE
   - Full feature-by-feature comparison across tiers

4. ADD-ONS (if applicable)
   - Optional add-on products with pricing

5. FAQ SECTION
   - Common pricing questions

6. SOCIAL PROOF
   - Customer logos, testimonials, trust signals

7. FINAL CTA
   - Reinforcement CTA for primary action
```

---

## Section 3: Hero Section Spec

### Content Requirements

| Element | Content | Character Limit |
|---------|---------|----------------|
| Headline | | 60 chars max |
| Subheadline | | 120 chars max |
| Billing toggle | Annual / Monthly (show annual savings) | N/A |
| Trust badge (optional) | e.g., "Trusted by 10,000+ companies" | 40 chars max |

### Billing Toggle Specification

| State | Display | Default |
|-------|---------|---------|
| Annual | Show annual price per month (e.g., "$29/mo billed annually") | [ ] Default |
| Monthly | Show monthly price (e.g., "$39/mo") | [ ] Default |
| Savings indicator | "Save 20%" badge on annual option | Always visible |

---

## Section 4: Tier Cards Spec

### Card Layout (Per Tier)

| Element | Tier 1 (Entry) | Tier 2 (Growth) | Tier 3 (Enterprise) |
|---------|---------------|-----------------|---------------------|
| **Tier name** | | | |
| **Badge** | None | "Most Popular" / "Best Value" | None |
| **Price (monthly)** | $___/mo | $___/mo | "Custom" or $___/mo |
| **Price (annual)** | $___/mo billed annually | $___/mo billed annually | "Custom" |
| **Price annotation** | per user/month, flat, etc. | per user/month, flat, etc. | Contact for pricing |
| **Description** | One sentence: who this is for | One sentence: who this is for | One sentence: who this is for |
| **Key features (4-6)** | Feature 1 | Everything in Tier 1, plus: | Everything in Tier 2, plus: |
| | Feature 2 | Feature A | Feature X |
| | Feature 3 | Feature B | Feature Y |
| | Feature 4 | Feature C | Feature Z |
| **CTA button text** | "Get Started" / "Start Free" | "Start Free Trial" | "Contact Sales" |
| **CTA button style** | Outlined / secondary | Filled / primary (highlighted) | Outlined / secondary |
| **Below CTA text** | "No credit card required" | "14-day free trial" | "Talk to our team" |

### Visual Emphasis

| Element | Specification |
|---------|---------------|
| Highlighted tier | Tier 2 (Growth) receives visual prominence |
| Highlight method | [ ] Larger card [ ] Border/shadow [ ] Badge [ ] Background color [ ] All |
| Card width | Equal width or Tier 2 slightly taller |
| Mobile layout | Stack vertically, Tier 2 first (above fold on mobile) |

---

## Section 5: Feature Comparison Table Spec

### Table Structure

| Feature Category | Feature | Tier 1 | Tier 2 | Tier 3 |
|-----------------|---------|--------|--------|--------|
| **Core Features** | | | | |
| | [Feature name] | [checkmark] / [value] / [dash] | | |
| | [Feature name] | | | |
| **Collaboration** | | | | |
| | [Feature name] | | | |
| | [Feature name] | | | |
| **Security & Admin** | | | | |
| | [Feature name] | | | |
| | [Feature name] | | | |
| **Support** | | | | |
| | [Feature name] | | | |
| | [Feature name] | | | |
| **Integrations** | | | | |
| | [Feature name] | | | |
| **Usage Limits** | | | | |
| | [Limit type] | [amount] | [amount] | [amount] |

### Table Design Notes

| Element | Specification |
|---------|---------------|
| Column headers | Sticky on scroll (desktop), collapsible on mobile |
| Feature grouping | Group by category with section headers |
| Value display | Checkmark for yes, dash for no, specific value for limits |
| Tooltips | Add (i) icon with brief feature explanation |
| CTA row | Repeat CTA buttons at bottom of table |
| Mobile behavior | [ ] Horizontal scroll [ ] Toggle between tiers [ ] Accordion |

---

## Section 6: Add-Ons Spec (If Applicable)

| Add-On | Description | Price | Available With | CTA |
|--------|------------|-------|---------------|-----|
| | | $/mo | [ ] All [ ] Tier 2+ [ ] Tier 3 | |
| | | $/mo | [ ] All [ ] Tier 2+ [ ] Tier 3 | |
| | | $/mo | [ ] All [ ] Tier 2+ [ ] Tier 3 | |

---

## Section 7: FAQ Section Spec

### Required FAQ Questions

| Question | Answer Summary |
|----------|---------------|
| Can I change plans at any time? | |
| What happens when I exceed plan limits? | |
| Do you offer annual billing discounts? | |
| Is there a free trial? | |
| What payment methods do you accept? | |
| Can I cancel at any time? | |
| Do you offer discounts for startups/nonprofits/education? | |
| How does per-seat pricing work? | |
| What is included in [Enterprise/Custom] pricing? | |
| Do you offer refunds? | |

### FAQ Design

| Element | Specification |
|---------|---------------|
| Layout | Accordion (expand/collapse) |
| Default state | All collapsed |
| Schema markup | FAQ structured data for SEO |
| Maximum questions | 10-12 (more = separate help page) |

---

## Section 8: Social Proof Spec

### Trust Elements

| Element | Content | Placement |
|---------|---------|-----------|
| Customer logos | 5-8 recognizable logos | Above or below tier cards |
| Testimonial | 1-2 customer quotes with photo, name, title | Below comparison table |
| Stats | "X customers" or "X data points processed" | Hero section or below tier cards |
| Security badges | SOC 2, GDPR, encryption badges | Footer or near CTA |
| Review scores | G2, Capterra, TrustRadius ratings | Near social proof |
| Case study link | "See how [Company] achieved [result]" | Below testimonials |

---

## Section 9: Technical Requirements

### Performance

| Requirement | Target |
|------------|--------|
| Page load time | <2 seconds |
| Core Web Vitals (LCP) | <2.5 seconds |
| Core Web Vitals (CLS) | <0.1 |
| Mobile responsive | All breakpoints (320px to 1920px+) |

### Tracking and Analytics

| Event | Trigger | Tool |
|-------|---------|------|
| Page view | Page load | Analytics |
| Billing toggle click | Annual/Monthly switch | Analytics |
| Tier CTA click | CTA button click per tier | Analytics |
| Feature table expand | Comparison table interaction | Analytics |
| FAQ expand | FAQ question click | Analytics |
| Scroll depth | 25%, 50%, 75%, 100% | Analytics |
| Time on page | Page unload | Analytics |

### SEO Requirements

| Element | Specification |
|---------|---------------|
| Page title | "[Product] Pricing - Plans & Pricing | [Company]" |
| Meta description | 150-160 chars describing pricing page |
| H1 | Page headline |
| Schema markup | Product schema with pricing, FAQ schema |
| Internal links | From homepage nav, product pages, blog |
| Canonical URL | /pricing |

### Accessibility

| Requirement | Specification |
|------------|---------------|
| WCAG compliance | Level AA minimum |
| Color contrast | 4.5:1 minimum for text |
| Keyboard navigation | Full keyboard access to all interactive elements |
| Screen reader | All images have alt text, tables have headers |
| Focus indicators | Visible focus state on all interactive elements |

---

## Section 10: A/B Testing Plan

| Test | Hypothesis | Variant A | Variant B | Metric | Duration |
|------|-----------|-----------|-----------|--------|----------|
| | | | | | |
| | | | | | |
| | | | | | |

### Testing Priority Order

1. CTA button copy and color
2. Default billing toggle (annual vs. monthly)
3. Highlighted tier visual treatment
4. Number of features shown per tier card
5. Social proof placement and type
6. Price anchoring (showing enterprise first vs. last)

---

**The pricing page is the most commercially important page on your website after the homepage. Every element should be tested, measured, and optimized. A 10% improvement in pricing page conversion often yields more revenue than a 10% improvement in traffic.**

---

*Template version: 1.0*
*Brain: Pricing Brain*
*Cross-brain dependencies: Design Brain (visual design), Engineering Brain (development), Marketing Brain (copy), Analytics Brain (tracking)*
