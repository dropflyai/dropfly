# Demand Gen Campaign Pattern — Integrated Pipeline Generation from Planning to Measurement

## Context

This pattern applies when:
- A specific pipeline generation target must be met within a defined timeframe
- Marketing must generate qualified leads and pipeline for the sales team
- Multiple channels must be coordinated into a cohesive campaign
- Budget has been allocated and ROI accountability is required
- The campaign is time-bound (typically 4-12 weeks of active execution)
- A clear ICP and target account list exist

Demand generation campaigns are the primary mechanism through which marketing
converts budget into pipeline. They are distinct from always-on programs (SEO,
brand advertising) in that they are time-bound, measurable, and directly tied to
pipeline targets. The best demand gen campaigns integrate brand and performance
activities into a unified narrative that moves buyers through the funnel.

---

## Challenge

Demand generation campaigns fail for specific, predictable reasons:

1. **No campaign hypothesis** — Teams launch campaigns without a clear thesis about
   which audience, message, and channel combination will drive results
2. **Channel silos** — Email, paid, content, and events execute independently with
   no narrative coherence, reducing compounding effects
3. **Measurement lag blindness** — Teams optimize for leading indicators (clicks,
   MQLs) that do not correlate with lagging indicators (pipeline, revenue)
4. **Audience mismatch** — Campaign targets a broad audience instead of a defined
   ICP segment, generating volume without quality
5. **Content-offer disconnect** — The content offer does not match the pain point
   of the target audience, producing low conversion
6. **No nurture bridge** — Leads enter the database but receive no follow-up
   between MQL and sales engagement, leading to decay
7. **Single-touch attribution** — Campaign gets credit (or blame) based on first
   or last touch, not multi-touch contribution

---

## Strategy

### Strategic Principle 1: Start with Pipeline Math, Work Backward

Every campaign should start with a pipeline target and reverse-engineer the inputs:

```
Pipeline Target: $500,000
  ÷ Average Deal Size: $50,000
  = Opportunities Needed: 10
  ÷ SQL-to-Opportunity Rate: 50%
  = SQLs Needed: 20
  ÷ MQL-to-SQL Rate: 25%
  = MQLs Needed: 80
  ÷ Lead-to-MQL Rate: 20%
  = Leads Needed: 400
  ÷ Visitor-to-Lead Conversion Rate: 3%
  = Website Visitors / Impressions Needed: 13,333
```

This math tells you whether the campaign is feasible given your budget and channels.

### Strategic Principle 2: Integrated Multi-Channel Execution

Campaigns that coordinate across channels outperform single-channel efforts by
2-3x (Forrester Research). The key is narrative coherence — every channel tells
the same story at the same time to the same audience through different modalities.

**The Channel Integration Model:**
```
            ┌─────────────────────────────────────────┐
            │       CAMPAIGN NARRATIVE LAYER           │
            │  (one story, one audience, one offer)    │
            └──────────────────┬──────────────────────┘
                               │
     ┌─────────┬──────────┬────┴─────┬──────────┬─────────┐
     │         │          │          │          │         │
   Email    Paid      Content    Events     SDR        Social
  (nurture) (acquire)  (educate)  (engage)  (activate)  (amplify)
```

### Strategic Principle 3: Campaign Offers by Funnel Stage

Different funnel stages require different content offers:

| Funnel Stage | Buyer State | Appropriate Offer | CTA |
|-------------|------------|-------------------|-----|
| Top (Awareness) | Does not know they have a problem | Research report, industry benchmark, trend analysis | Download / Read |
| Mid (Consideration) | Exploring solutions to a known problem | Solution guide, comparison framework, webinar, case study | Learn More / Register |
| Bottom (Decision) | Evaluating specific vendors | Demo, free trial, ROI calculator, assessment | Request / Start |

**Critical Rule:** Match the offer to the buyer's stage, not to your pipeline urgency.
Running bottom-funnel offers to top-funnel audiences wastes budget and annoys buyers.

### Strategic Principle 4: ABM Layering

For enterprise campaigns, overlay ABM tactics on top of broad demand gen:

| ABM Tier | Account Count | Campaign Layer |
|----------|--------------|----------------|
| Tier 1 (Strategic) | 10-25 accounts | Personalized 1:1 outreach, custom content, executive engagement |
| Tier 2 (Target) | 25-100 accounts | Industry-specific campaigns, targeted ads, SDR sequences |
| Tier 3 (Scale) | 100-1,000 accounts | Programmatic ABM, intent-based targeting, automated nurture |
| Broad | 1,000+ | Standard demand gen campaigns (non-ABM) |

---

## Execution

### Phase 1: Campaign Planning (Weeks 1-2)

**Objective:** Define the campaign hypothesis, audience, offer, and channel strategy.

| Action | Owner | Deliverable |
|--------|-------|-------------|
| Define pipeline target (reverse funnel math) | Demand Gen Lead | Pipeline math document |
| Select target audience / ICP segment | Demand Gen Lead | Audience definition |
| Define account list (if ABM) | Marketing Ops | Target account list in CRM |
| Develop campaign hypothesis | Demand Gen Lead | Campaign brief |
| Select content offer by funnel stage | Content Marketing | Content offer specification |
| Define channel mix and budget allocation | Demand Gen Lead | Channel plan with budget |
| Create measurement plan (KPIs, attribution) | Marketing Ops | Measurement framework |
| Align with SDR/Sales on lead routing and SLAs | Demand Gen + Sales Ops | Lead routing document |
| Define nurture sequence for non-MQL leads | Marketing Automation | Nurture flow diagram |

**Exit Criteria:** Campaign brief approved. Budget allocated. Target audience defined.
Content offer selected. Channel mix finalized. SDR/Sales alignment confirmed.

### Phase 2: Content and Creative Production (Weeks 2-4)

**Objective:** Create all campaign content, creative, and automation workflows.

**Content Creation:**
| Asset | Purpose | Specifications |
|-------|---------|---------------|
| Anchor content piece (guide, report, webinar) | Primary offer | 10-30 page guide or 45-min webinar |
| Landing page | Conversion | Headline, subhead, 3 value bullets, form, social proof |
| Thank-you page | Post-conversion | Delivery + next step CTA |
| Email sequence (5-7 emails) | Nurture | Cadence: Day 0, 3, 7, 14, 21, 28, 35 |
| Paid ad creative (5-8 variants) | Acquisition | 3 headlines x 2-3 images minimum |
| Social posts (10-15) | Amplification | Mix of promotional and educational |
| SDR outreach templates (3-5) | Activation | Email + LinkedIn message variants |
| Blog post(s) supporting campaign theme | SEO + organic | 1,500-2,500 words, optimized for search |

**Technical Setup:**
| Task | Owner | System |
|------|-------|--------|
| Landing page build and QA | Marketing Ops | CMS / Landing page tool |
| Form creation with progressive profiling | Marketing Ops | Marketing automation |
| Lead scoring rules update | Marketing Ops | Marketing automation / CRM |
| Email automation workflows | Marketing Ops | Marketing automation |
| UTM parameter structure | Marketing Ops | Tracking spreadsheet |
| CRM campaign object creation | Sales Ops | CRM |
| SDR sequence setup | SDR Manager | Sales engagement platform |
| Paid campaign build | Paid Media | Ad platforms |

**Exit Criteria:** All content approved. Landing page live and QA'd. Email sequences
built and tested. Paid campaigns built in draft. CRM tracking configured. UTMs defined.

### Phase 3: Campaign Launch and Active Execution (Weeks 4-8)

**Objective:** Execute across all channels with coordinated timing.

**Week 1 of Active Campaign:**
| Day | Action | Channel |
|-----|--------|---------|
| Monday | Campaign go-live: paid ads activate, first email sends | Paid, Email |
| Monday | Social promotion begins (company + personal accounts) | Social |
| Tuesday | SDR outbound blitz to target accounts | SDR |
| Wednesday | Blog post published supporting campaign theme | Content |
| Thursday | Partner cross-promotion (if applicable) | Partner |
| Friday | Week 1 performance check: adjust bids, pause underperformers | All |

**Ongoing Optimization (Weeks 2-4):**
| Cadence | Action | Decision |
|---------|--------|----------|
| Daily | Monitor ad spend and CPA | Pause ads with CPA >2x target |
| Daily | Monitor lead volume and quality | Alert SDR if volume spike |
| 2x/week | Review email engagement (open, click) | Subject line or send time adjustment |
| Weekly | Full campaign performance review | Budget reallocation between channels |
| Weekly | SDR conversion review | Template adjustment, list refinement |
| Bi-weekly | MQL quality review with Sales | Lead scoring adjustment if needed |

**Mid-Campaign Optimization Framework:**
```
IF CPA > 2x target → Pause underperforming ads, reallocate to winners
IF MQL volume < 50% of target → Expand audience, increase budget, add channels
IF MQL-to-SQL rate < 15% → Tighten targeting, adjust lead scoring, review offer
IF SQL-to-Opp rate < 30% → Align with sales on qualification criteria, improve nurture
IF all metrics on target → Scale winning channels, test new creative variants
```

### Phase 4: Lead Nurture and Handoff (Concurrent with Phase 3)

**Objective:** Convert campaign responses into qualified pipeline through nurture.

**Lead Processing Workflow:**
```
Lead captured → Lead scoring evaluation
  │
  ├── Score >= MQL threshold → Route to SDR (15-min SLA)
  │     │
  │     ├── SDR qualifies → SQL → AE assignment
  │     │
  │     └── SDR disqualifies → Return to nurture
  │
  └── Score < MQL threshold → Enter nurture sequence
        │
        ├── Engagement increases → Re-score, promote to MQL if threshold met
        │
        └── No engagement after 35 days → Move to long-term nurture
```

**Nurture Sequence Design:**
| Email | Timing | Content | CTA |
|-------|--------|---------|-----|
| 1 | Day 0 | Content delivery + welcome | Access content |
| 2 | Day 3 | Related insight (educational) | Read blog |
| 3 | Day 7 | Case study or customer proof | See results |
| 4 | Day 14 | Deeper dive on problem space | Watch webinar |
| 5 | Day 21 | Solution comparison or guide | Evaluate options |
| 6 | Day 28 | Social proof + peer perspective | See who uses it |
| 7 | Day 35 | Direct ask (demo or trial) | Request demo |

### Phase 5: Measurement and Optimization (Week 8-12)

**Objective:** Measure true campaign impact and extract learnings.

**Measurement Cadence:**
| Timeframe | What to Measure | Why |
|-----------|----------------|-----|
| Real-time | Spend, impressions, clicks, CPL | Optimize active channels |
| Weekly | MQLs, SQLs, conversion rates | Assess funnel health |
| 30 days post-campaign | Pipeline created, pipeline value | First pipeline impact read |
| 60 days post-campaign | Pipeline progression, win rate | Deal advancement |
| 90 days post-campaign | Revenue attributed, full ROI | Final campaign ROI |

---

## Metrics

### Campaign Performance Dashboard

| Metric | Formula | Target | Actual |
|--------|---------|--------|--------|
| Total Leads | Sum of all form submissions | Per pipeline math | |
| Cost per Lead (CPL) | Total spend / Total leads | <$100 (B2B) | |
| MQL Volume | Leads meeting scoring threshold | Per pipeline math | |
| MQL Rate | MQLs / Total leads | 20-30% | |
| Cost per MQL | Total spend / MQLs | <$300 (B2B) | |
| SQL Volume | MQLs accepted by sales | Per pipeline math | |
| MQL-to-SQL Rate | SQLs / MQLs | 25-40% | |
| Pipeline Created | Dollar value of opportunities | Per pipeline target | |
| Cost per Pipeline Dollar | Total spend / Pipeline created | <$0.10 | |
| Pipeline-to-Revenue Rate | Revenue / Pipeline | 20-35% | |
| Campaign ROI | (Revenue - Spend) / Spend | >5x at 90 days | |

### Channel Performance Comparison

| Channel | Spend | Leads | CPL | MQLs | Cost/MQL | Pipeline | ROI |
|---------|-------|-------|-----|------|----------|----------|-----|
| Paid Search | | | | | | | |
| LinkedIn Ads | | | | | | | |
| Email | | | | | | | |
| Content/SEO | | | | | | | |
| SDR Outbound | | | | | | | |
| Events | | | | | | | |
| Partner | | | | | | | |

---

## Anti-Patterns

### Anti-Pattern 1: The MQL Factory
**Symptom:** Campaign generates massive MQL volume but pipeline creation is flat.
**Root Cause:** Lead scoring is too loose, content offer attracts non-ICP audience.
**Fix:** Tighten ICP targeting, add firmographic gates to scoring, align MQL definition
with sales.

### Anti-Pattern 2: The Channel Silo
**Symptom:** Each channel runs independently with different messaging and timing.
**Root Cause:** No unified campaign brief; channel owners plan in isolation.
**Fix:** Single campaign brief governs all channels; weekly cross-channel standup.

### Anti-Pattern 3: The Launch and Leave
**Symptom:** Campaign launches with energy, then receives no optimization for weeks.
**Root Cause:** Team moves to next project; no optimization cadence established.
**Fix:** Assign dedicated campaign manager for full campaign duration; daily/weekly reviews.

### Anti-Pattern 4: The Attribution Argument
**Symptom:** Marketing and sales argue about which team created the pipeline.
**Root Cause:** No agreed attribution model; no shared measurement framework.
**Fix:** Agree on attribution model before campaign launches; use multi-touch attribution;
supplement with self-reported attribution.

### Anti-Pattern 5: The Premature Optimization
**Symptom:** Campaign paused or radically changed after 3 days of data.
**Root Cause:** Insufficient statistical significance; impatience with ramp period.
**Fix:** Define minimum viable data thresholds before making optimization decisions.
Allow 2-week ramp period for paid channels before major changes.

### Anti-Pattern 6: The Nurture Desert
**Symptom:** Leads enter database, receive one email, and are never contacted again.
**Root Cause:** No nurture sequence built; marketing automation not configured.
**Fix:** Nurture sequence must be complete and tested before campaign launches.

---

## References

| Topic | Module |
|-------|--------|
| Demand gen strategy foundations | `04_demand_generation/demand_gen_strategy.md` |
| Inbound and content offers | `04_demand_generation/inbound_marketing.md` |
| Outbound integration | `04_demand_generation/outbound_marketing.md` |
| Paid media execution | `06_paid_media/paid_search.md`, `06_paid_media/paid_social.md` |
| Content creation | `05_content_seo/content_marketing.md` |
| Attribution and measurement | `07_analytics/marketing_analytics.md` |
| Experimentation in campaigns | `07_analytics/experimentation.md` |
| Reporting framework | `07_analytics/reporting.md` |

---

**A demand gen campaign is a hypothesis about which audience, message, offer, and
channel combination will convert budget into pipeline. The best campaigns are not
the most creative — they are the most disciplined in planning, execution, measurement,
and optimization.**
