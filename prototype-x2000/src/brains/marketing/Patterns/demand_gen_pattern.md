# Demand Generation Pattern

> A full-funnel pattern for building a predictable demand generation engine -- from awareness and top-of-funnel attraction through lead capture, nurture, conversion, pipeline acceleration, and attribution modeling.

---

## Context

This pattern applies when you need to build or scale a systematic demand generation program that creates predictable, measurable pipeline for the sales team.

**Use this pattern for:**
- Building a B2B or B2C demand gen program from scratch
- Scaling an existing program that has hit a plateau
- Transitioning from outbound-only to balanced inbound/outbound
- Diagnosing pipeline shortfalls and funnel bottlenecks

**Core principle:** Demand generation is not lead generation. Lead gen captures existing demand. Demand gen creates demand where none existed, then captures and converts it. This pattern covers both.

---

## Challenge

Demand gen programs fail when they optimize for vanity metrics (MQL volume) instead of revenue outcomes, when sales and marketing alignment is absent, when attribution is ignored, and when the funnel leaks at handoff points. This pattern addresses each failure mode systematically.

---

## Phase 1: Top-of-Funnel Awareness (Demand Creation)

### 1.1 ICP and Persona Definition

**Ideal Customer Profile (ICP):**

| Attribute | Specification |
|-----------|---------------|
| Company size | Revenue range, employee count, growth stage |
| Industry | Primary verticals, secondary verticals |
| Geography | Regions, countries, languages |
| Technology stack | Tools they already use, integration needs |
| Business model | SaaS, services, marketplace, e-commerce |
| Buying triggers | Events that create urgency (funding, hiring, expansion, compliance) |

**Target personas within ICP accounts:**
- Economic buyer (signs the check)
- Technical evaluator (assesses the product)
- Champion (internal advocate driving the deal)
- End user (daily user of the product)

### 1.2 Awareness Channel Strategy

**Organic awareness:**
- Content marketing (blog, video, podcast) -- see Content Marketing Pattern.
- SEO targeting informational and problem-aware keywords.
- Social media thought leadership (founder and team personal brands).
- Community participation (forums, Slack groups, Reddit, Discord).
- Speaking engagements (conferences, webinars, podcast guest spots).
- Strategic partnerships (co-marketing, co-content, joint webinars).

**Paid awareness:**
- Social media ads (LinkedIn for B2B, Meta for B2C/prosumer).
- Content syndication (third-party distribution of gated content).
- Sponsorships (newsletters, podcasts, events, communities).
- Display and programmatic advertising (high-volume awareness).
- Search ads on category-level keywords.

### 1.3 Brand-to-Demand Connection

Connect brand awareness to demand by:
- Including clear next steps in all awareness content (subscribe, follow, download).
- Building retargeting audiences from awareness touchpoints.
- Measuring brand search volume as a leading indicator of demand.
- Tracking branded traffic trends alongside pipeline metrics.
- Creating hand-raiser CTAs that identify high-intent individuals.

---

## Phase 2: Lead Capture and Nurture (Demand Capture)

### 2.1 Lead Capture Mechanisms

| Offer Type | Best For | Typical Landing Page CVR |
|-----------|----------|--------------------------|
| Ebook or guide | Mid-funnel education | 15-25% |
| Webinar registration | Thought leadership | 20-40% |
| Template or tool | Immediate practical value | 25-40% |
| Report or research | Data-driven audiences | 15-30% |
| Free trial or freemium | Product-led, bottom-funnel | 5-15% |
| Demo request | Sales-led, bottom-funnel | 3-10% |

**Ungated capture (lower friction):**
- Email newsletter subscription.
- Blog notification signup.
- Community membership (Slack, Discord).
- Product waitlist or early access.

### 2.2 Lead Scoring Model

**Firmographic scoring (fit):**

| Attribute | Points |
|-----------|--------|
| Matches ICP company size | +20 |
| Matches ICP industry | +15 |
| Decision-maker title | +25 |
| Influencer title | +15 |
| Non-target role (student, competitor) | -50 |

**Behavioral scoring (engagement):**

| Action | Points |
|--------|--------|
| Visited pricing page | +30 |
| Attended webinar | +20 |
| Downloaded gated content | +15 |
| Opened 3+ emails in 7 days | +10 |
| Visited 5+ pages in one session | +15 |
| Requested demo | +50 |
| Started free trial | +40 |
| No engagement 30 days | -10 |
| No engagement 60 days | -25 |

**Score thresholds:**
- Below 30: Cold lead -- nurture with educational content.
- 30-60: Warm lead -- nurture with consideration content.
- 60-80: MQL -- pass to SDR for outreach.
- 80+: SQL -- fast-track to sales.

### 2.3 Nurture Sequences

| Sequence | Trigger | Duration | Emails | Goal |
|----------|---------|----------|--------|------|
| Welcome | New subscriber/lead | 14 days | 5-7 | Educate and build trust |
| Topic-based | Downloaded specific content | 21 days | 4-6 | Deepen engagement |
| Product-aware | Visited product/pricing pages | 10 days | 3-5 | Move to demo/trial |
| Re-engagement | No engagement 30+ days | 14 days | 3-4 | Reactivate or sunset |
| Post-event | Attended webinar/event | 7 days | 3-4 | Convert attendee interest |
| Trial nurture | Started free trial | 14 days | 5-7 | Convert trial to paid |

**Nurture principles:**
- Lead with value, not product pitches. 80% educational, 20% product.
- Personalize based on persona, industry, and behavior.
- One clear CTA per email.
- Test send times, subject lines, and content formats continuously.
- Respect frequency preferences.

---

## Phase 3: Conversion Optimization

### 3.1 Landing Page Optimization

**High-converting elements:**
- Headline matching the ad or email that drove the click (message match).
- Clear value proposition above the fold.
- Social proof (logos, testimonials, user count).
- Minimal form fields (name, email, company for TOFU; more for BOFU).
- Single CTA with action-oriented copy.
- No navigation or distracting links on dedicated landing pages.
- Mobile-optimized, load time under 3 seconds.

**Testing priorities (ordered by typical impact):**
1. Headline and value proposition.
2. CTA copy and button design.
3. Form length and fields.
4. Social proof placement and type.
5. Page layout and visual hierarchy.

### 3.2 Conversion Funnel Analysis

Map and measure every conversion point:

```
Impression --> Click --> Landing Page --> Form Fill --> Thank You
   |             |            |              |              |
   CTR          CVR       Bounce Rate   Completion     Next Step
```

**Funnel benchmarks to establish:**
- Ad CTR by channel and format.
- Landing page CVR by offer type.
- Form abandonment rate.
- MQL to SQL conversion rate.
- SQL to opportunity conversion rate.
- Opportunity to closed-won rate.

### 3.3 Sales and Marketing SLA

**Marketing commits to:**
- Deliver X MQLs per month/quarter.
- MQL quality score meets agreed threshold.
- Lead routing within 5 minutes of MQL status.
- Lead context provided (source, content consumed, score breakdown).

**Sales commits to:**
- Contact MQLs within 24 hours (ideally 1 hour).
- Minimum 3 outreach attempts before dispositioning.
- Provide feedback on lead quality within 48 hours.
- Update CRM with disposition reason for every lead.

**Joint review:** Monthly meeting to review MQL volume, quality, conversion, and pipeline.

---

## Phase 4: Attribution Modeling

### 4.1 Attribution Models

| Model | Best For | How It Works |
|-------|----------|-------------|
| First-touch | Understanding discovery | 100% credit to first interaction |
| Last-touch | Understanding conversion trigger | 100% credit to last interaction |
| Linear | Equal-weight analysis | Equal credit to every touchpoint |
| Time-decay | Long sales cycles | More credit to recent touchpoints |
| U-shaped | Valuing discovery + conversion | 40% first, 40% last, 20% middle |
| W-shaped | Complex B2B | 30% first, 30% lead creation, 30% opp creation, 10% middle |

### 4.2 Attribution Infrastructure

**Required tracking:**
- UTM parameters on every link in every campaign.
- Cookie-based website tracking for multi-session journeys.
- CRM integration connecting marketing touches to revenue.
- Offline event tracking (events, direct mail, phone calls).
- Self-reported attribution ("How did you hear about us?").

**Data requirements:**
- Marketing automation platform integrated with CRM.
- Consistent UTM taxonomy across all teams and channels.
- Regular data hygiene (deduplication, source standardization).
- Attribution reporting dashboard updated weekly.

### 4.3 Reporting and Optimization

**Weekly dashboard:** MQL volume by source/channel, pipeline by source, conversion rates at each funnel stage, cost per MQL/SQL, spend pacing.

**Monthly deep dive:** Channel-level ROI, content performance by funnel stage, nurture sequence performance, lead scoring model accuracy, attribution model comparison.

**Quarterly strategic review:** Channel mix optimization, ICP validation, funnel velocity analysis, program maturity assessment.

---

## Phase 5: Pipeline Acceleration

### 5.1 ABM Layer

For high-value target accounts, layer ABM on top of demand gen:
- Identify target account list (50-500 accounts based on capacity).
- Create account-specific content and messaging.
- Run targeted ads to buying committee members at target accounts.
- Coordinate marketing air cover with sales outreach.
- Track account-level engagement (not just individual leads).

### 5.2 Intent Data Integration

Use third-party intent signals to prioritize:
- Accounts researching your category or competitors.
- Accounts showing surge in relevant topic research.
- Accounts visiting competitor websites or review sites.

**Actions on intent signals:** Increase ad frequency to high-intent accounts. Trigger personalized SDR outreach. Serve targeted content aligned with the intent topic. Alert sales team.

### 5.3 Revenue Marketing Metrics

| Metric | Definition | Target |
|--------|-----------|--------|
| Marketing-sourced pipeline | First-touch = marketing | 40-60% of total pipeline |
| Marketing-influenced pipeline | Any marketing touch | 70-90% of total pipeline |
| Pipeline velocity | Days from first touch to opportunity | Decreasing QoQ |
| CAC (marketing contribution) | Total marketing + sales cost / new customers | Below LTV/3 |
| LTV:CAC ratio | Lifetime value / acquisition cost | Above 3:1 |
| Payback period | Months to recover CAC | Under 12 months |

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Optimizing for MQL volume only | Low-quality leads waste sales time | Measure MQL-to-SQL conversion and pipeline |
| No sales feedback loop | Marketing blind to lead quality | Weekly lead quality reviews with sales |
| Single-channel dependence | Fragile pipeline, concentration risk | Diversify across 4+ channels |
| Gating everything | Reduces reach and brand building | Gate only high-value, MOFU/BOFU content |
| Ignoring dark social | Misattributing word-of-mouth | Add self-reported attribution question |
| Over-automating nurture | Robotic, impersonal experience | Blend automation with human SDR touches |

---

## References

- `Templates/campaign_brief_template.md` -- Campaign planning
- `Templates/marketing_report_template.md` -- Performance reporting
- `Patterns/campaign_launch_pattern.md` -- Campaign execution
- `Patterns/content_marketing_pattern.md` -- Content engine
- Email Brain `Patterns/` -- Nurture sequence design

---

*Pattern version: 1.0*
*Brain: Marketing Brain*
*Cross-brain dependencies: Sales Brain (SLA, lead handoff), Analytics Brain (attribution), Engineering Brain (tracking), Email Brain (nurture), Content Brain (production)*
