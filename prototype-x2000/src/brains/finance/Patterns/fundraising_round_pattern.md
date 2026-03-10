# Fundraising Round Pattern — End-to-End Process Execution

## Context

You need to raise a venture capital round (seed through growth). The process
involves preparation, investor targeting, meeting management, term negotiation,
and closing. A well-executed fundraise creates competitive tension, minimizes
dilution, and selects the best partner for the company's stage.

---

## Problem Statement

Fundraising processes fail when they:
- Start without adequate preparation (materials, metrics, data room)
- Run too long (signals weakness, distracts from operations)
- Lack competitive tension (single term sheet, weak negotiating position)
- Optimize purely for valuation (ignoring partner quality and terms)
- Are run by the CEO alone without delegation (operational vacuum)

---

## Solution Architecture

```
┌─────────────────────────────────────────────────────────┐
│               FUNDRAISING PROCESS                        │
│                                                          │
│  Phase 1      Phase 2       Phase 3       Phase 4       │
│  ┌─────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│  │ Prepare │──│ Soft     │──│ Execute  │──│ Close    │ │
│  │         │  │ Launch   │  │          │  │          │ │
│  └─────────┘  └──────────┘  └──────────┘  └──────────┘ │
│  Weeks -4 to -2  Weeks -2 to 0  Weeks 1-4   Weeks 4-6  │
└─────────────────────────────────────────────────────────┘
```

---

## Implementation Steps

### Phase 1: Preparation (Weeks -4 to -2)

**1.1 Internal Readiness**
```
Financial:
  [ ] Last 12 months P&L finalized
  [ ] ARR bridge reconciled (new + expansion - churn)
  [ ] Unit economics current (CAC, LTV, payback)
  [ ] 3-year financial model built with scenarios
  [ ] Cap table clean and reconciled
  [ ] 409A valuation current

Narrative:
  [ ] Company story refined (problem, solution, why now, why us)
  [ ] Key objections identified with prepared responses
  [ ] Competitive positioning articulated
  [ ] Market size justified bottom-up
```

**1.2 Materials Preparation**

| Material | Owner | Status |
|----------|-------|--------|
| Pitch deck (15-20 slides) | CEO | [ ] |
| Metrics appendix (10 slides) | CFO | [ ] |
| Financial model (spreadsheet) | CFO | [ ] |
| Data room (due diligence docs) | CFO + Legal | [ ] |
| Product demo script | CTO/CPO | [ ] |
| Customer references (3-5) | VP Sales | [ ] |
| Teaser email (5-7 sentences) | CEO | [ ] |

**1.3 Investor Targeting**

```
Build target list of 50-80 firms:

Tier 1 (15-20 firms): Highest conviction, best fit
  - Research partner specialization
  - Confirm fund timing (new fund = more active)
  - Map warm intros for each

Tier 2 (20-30 firms): Good fit, less conviction
  - Backup options and competitive pressure

Tier 3 (15-20 firms): Relevant but lower priority
  - Fill meeting schedule, create FOMO

For each firm, document:
  - Partner name and focus areas
  - Recent investments (competitive or complementary?)
  - Typical check size and stage
  - Warm intro path (existing investor, advisor, founder)
```

### Phase 2: Soft Launch (Weeks -2 to 0)

**2.1 Test the Market**
```
Share deck with 5-10 trusted advisors and investors:
  - Existing investors (they should know first)
  - Close advisor-investors (will give honest feedback)
  - 2-3 Tier 1 investors (gauge interest early)

Collect feedback on:
  - Narrative clarity (do they understand the story?)
  - Objections (what concerns them?)
  - Valuation expectations (what range feels fair?)
  - Competitive landscape (who else are they seeing?)

Iterate on deck and narrative based on feedback.
```

**2.2 Warm Intro Campaign**
```
For each Tier 1 investor:
  - Identify best path for warm introduction
  - Brief the connector (what to say, why this investor)
  - Send teaser email through connector
  - Follow up to schedule meeting

Template for connector:
  "Hey [Partner], I'd like to introduce you to [Founder] at [Company].
  They're [one sentence on what the company does]. They're at [$X]M ARR,
  growing [X]% YoY, with [notable metric]. I think they'd be a great
  fit for [Fund]. Would you be open to a 30-minute intro call?"
```

### Phase 3: Execute (Weeks 1-4)

**3.1 Meeting Schedule**
```
Week 1: 15-20 first meetings
  - 45 minutes each: pitch + Q&A
  - Track interest level: hot / warm / cold
  - Send follow-up materials within 24 hours

Week 2: 8-12 partner meetings / deep dives
  - Deeper sessions with interested firms
  - CTO joins for technical deep dive
  - Share metrics appendix and financial model

Week 3: 3-5 final round meetings
  - Meet additional partners at the firm
  - Customer reference calls initiated by investor
  - Term sheet discussions begin informally

Week 4: Term sheets
  - Target 2-3 term sheets
  - Compare terms comprehensively (not just valuation)
  - Begin negotiation
```

**3.2 Process Management**
```
CRM tracking:
  Investor | Stage | Interest | Next Step | Intro Source | Notes
  ─────────────────────────────────────────────────────────────
  Fund A   | TS    | Hot      | Negotiate | Board member | Lead TS at $X
  Fund B   | DD    | Warm     | CTO call  | Advisor      | Slow process
  Fund C   | 1st   | Cold     | Declined  | Self-sourced | Not in thesis

Weekly check-in (CEO + CFO):
  - Pipeline review: who is moving forward?
  - Which investors need follow-up materials?
  - Timeline management: are we on track?
  - Operational impact: is the company still executing?
```

### Phase 4: Close (Weeks 4-6)

**4.1 Term Sheet Evaluation**
```
Evaluation matrix:
  Factor          Weight  Fund A  Fund B  Fund C
  ──────────────────────────────────────────────
  Valuation        0.25   [/10]   [/10]   [/10]
  Partner quality  0.25   [/10]   [/10]   [/10]
  Terms (non-price)0.20   [/10]   [/10]   [/10]
  Strategic value  0.15   [/10]   [/10]   [/10]
  Fund dynamics    0.15   [/10]   [/10]   [/10]
  ──────────────────────────────────────────────
  Weighted total         [/10]   [/10]   [/10]
```

**4.2 Negotiation**
```
Priority items to negotiate:
  1. Valuation (pre-money)
  2. Option pool size and source (pre vs post)
  3. Board composition
  4. Liquidation preference (1x non-participating)
  5. Anti-dilution (broad-based weighted average)
  6. Pro-rata rights
  7. Information rights scope

Leverage tactics:
  - Multiple term sheets (strongest leverage)
  - Compressed timeline ("deciding by Friday")
  - Reference checks on the investor (your diligence on them)
```

**4.3 Closing**
```
Timeline (after term sheet signed):
  Day 1-3: Engage legal counsel (both sides)
  Day 4-14: Draft and negotiate definitive documents
  Day 15-21: Final DD items, rep and warranty review
  Day 22-28: Board approval, signing, wire transfer

Documents to execute:
  - Stock Purchase Agreement (SPA)
  - Investor Rights Agreement (IRA)
  - Right of First Refusal (ROFR)
  - Voting Agreement
  - Amended Certificate of Incorporation
  - Legal opinion letter
  - Wire instructions
```

---

## Trade-offs

| Gain | Sacrifice |
|------|----------|
| Competitive tension | Requires managing 20+ parallel conversations |
| Best possible terms | 4-6 weeks of CEO time diverted from operations |
| Strategic partner selection | Risk of fatigue and accepting suboptimal terms |
| Compressed timeline | May exclude slower-moving (but good) investors |

---

## Anti-patterns

- Starting process without polished materials
- Talking to investors one at a time (no competitive tension)
- Sharing term sheets with other investors (breach of trust)
- Optimizing only for highest valuation
- Running the process > 8 weeks (signals weakness)
- CEO doing everything alone (no delegation to CFO/team)
- Not reference-checking the lead investor partner

---

## Checklist

- [ ] Financial readiness confirmed (P&L, cap table, model)
- [ ] Pitch deck finalized and tested with trusted advisors
- [ ] Target list of 50-80 investors built with warm intros
- [ ] Data room populated and organized
- [ ] Soft launch completed with feedback incorporated
- [ ] Meeting schedule compressed into 3-4 weeks
- [ ] CRM tracking operational with weekly reviews
- [ ] Multiple term sheets received
- [ ] Terms evaluated holistically (not just valuation)
- [ ] Legal counsel engaged for closing
- [ ] Wire received and round closed

---

## References

- Kupor (2019). Secrets of Sand Hill Road.
- Feld & Mendelson (2019). Venture Deals, 4th Edition.
- YC Startup Library: Fundraising.
- First Round Review: Fundraising Best Practices.
