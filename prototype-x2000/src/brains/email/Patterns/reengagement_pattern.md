# Re-Engagement Campaign Pattern

> A structured pattern for designing and executing re-engagement campaigns that win back dormant subscribers, clean inactive contacts, and maintain list health for optimal deliverability.

---

## Context

This pattern applies when you have a significant portion of your email list that has stopped engaging -- not opening, not clicking, and not converting. Re-engagement is both a revenue opportunity (reactivating dormant subscribers) and a deliverability necessity (inactive subscribers hurt sender reputation).

**Use this pattern for:**
- Subscribers inactive for 30-90+ days
- Customers who have not logged in or purchased in 60+ days
- Churned or expired trial users
- Post-event attendees who went silent
- List hygiene and sunset policy implementation

**Key principle:** Re-engagement is a two-part discipline: attempt to win them back, and if that fails, remove them cleanly. Holding onto inactive subscribers feels good but damages your deliverability for everyone else.

---

## Challenge

Re-engagement fails when companies wait too long to act (the longer someone is inactive, the harder it is to win them back), when the re-engagement message offers nothing new, or when companies refuse to sunset non-responsive contacts. This pattern ensures timely intervention, compelling offers, and disciplined list hygiene.

---

## Phase 1: Identify and Segment Inactive Contacts (Week 1)

### 1.1 Inactivity Definition

Define what "inactive" means for your context:

| Engagement Level | Definition | Timeframe | List Size |
|-----------------|-----------|-----------|----------|
| Fully active | Opens AND clicks in timeframe | Last 30 days | _____ |
| Partially active | Opens but does not click | Last 30 days | _____ |
| Recently lapsed | No opens or clicks | 30-60 days | _____ |
| Dormant | No opens or clicks | 60-90 days | _____ |
| Deep dormant | No opens or clicks | 90-180 days | _____ |
| Dead | No opens or clicks | 180+ days | _____ |

### 1.2 Inactivity Segmentation

Beyond email engagement, consider:

| Signal | Check | Action |
|--------|-------|--------|
| Product login activity | Has user logged in recently? | If yes, email disengagement only (not product disengagement) |
| Purchase history | Has user purchased recently? | If yes, they may prefer in-app communication |
| Email deliverability | Are emails bouncing? | Hard bounces: remove immediately |
| Account status | Is the account still active/paid? | Paid but not engaging: different approach than free |
| Consent status | Is consent still valid? | Expired consent: do not re-engage, re-consent instead |

### 1.3 Root Cause Analysis

Before sending a re-engagement campaign, understand why contacts went inactive:

| Possible Cause | Diagnostic | Solution |
|---------------|-----------|---------|
| Email fatigue (too many emails) | High unsubscribe rate before inactivity | Reduce frequency, improve relevance |
| Content irrelevance | Low click rates before inactivity | Better segmentation, personalization |
| Deliverability issues | Emails going to spam | Fix authentication, warm IP, clean list |
| Product churn | User stopped using product | Product-focused win-back (not just email) |
| Life change | Role change, company change | Accept natural attrition |
| Never truly engaged | Signed up but never activated | These were never real subscribers |

---

## Phase 2: Re-Engagement Campaign Design (Week 2)

### 2.1 Campaign Architecture

**Three-email re-engagement sequence:**

| Email | Day | Subject Line Approach | Content Strategy | CTA |
|-------|-----|----------------------|-----------------|-----|
| 1 | Day 0 | Value reminder | Highlight what they are missing, new features, content | Re-engage (click a link) |
| 2 | Day 7 | Personal / emotional | Personal note, "we miss you," ask what went wrong | Reply or re-engage |
| 3 | Day 14 | Final notice / incentive | Last chance offer, or "should we stop emailing?" | Confirm subscription or unsubscribe |

### 2.2 Email 1: Value Reminder

**Purpose:** Remind them why they subscribed. Show what they have missed.

**Structure:**
1. **Subject line:** "[First Name], here is what you have missed" or "We have been busy -- check out what is new."
2. **Opening:** Acknowledge the gap. "It has been a while since we connected."
3. **Value content:** 3-5 highlights of what is new (features, content, community).
4. **CTA:** One clear action to re-engage (read an article, try a feature, watch a video).
5. **Easy out:** Preference center link to adjust email frequency.

### 2.3 Email 2: Personal Outreach

**Purpose:** Create a human connection. Understand why they disengaged.

**Structure:**
1. **Subject line:** "Quick question, [First Name]" or "Can I ask you something?"
2. **From:** A real person (founder, CS lead, editor) -- not the brand.
3. **Tone:** Conversational, short, genuine.
4. **Question:** "I noticed you have not been as active lately. I would love to understand -- is there something we could do better?"
5. **CTA:** Reply to the email (not a button -- encourage actual conversation).
6. **Fallback CTA:** "If you would rather just see what is new: [link]."

### 2.4 Email 3: Final Notice

**Purpose:** Last attempt. Confirm they want to stay or remove gracefully.

**Structure:**
1. **Subject line:** "Should we stop emailing you?" or "Last chance to stay connected."
2. **Direct:** "We have sent you a few emails recently and have not heard back. We want to respect your inbox."
3. **Options:**
   - "Yes, keep me subscribed" (button -- re-confirms interest).
   - "Update my preferences" (link to preference center).
   - "Unsubscribe" (clean unsubscribe link).
4. **Incentive (optional):** Discount, exclusive content, or free trial extension.
5. **Consequence:** "If we do not hear from you, we will stop sending emails in [X days]."

---

## Phase 3: Sunset Policy Implementation (Week 3-4)

### 3.1 Sunset Policy

A sunset policy defines when inactive contacts are automatically suppressed or removed from your active sending list.

| Segment | Sunset Trigger | Action |
|---------|---------------|--------|
| No engagement after re-engagement sequence | 14 days after last re-engagement email | Suppress from active sends |
| No engagement 180+ days (never re-engaged) | Immediately | Suppress from active sends |
| Hard bounce | Immediately | Remove from list |
| Spam complaint | Immediately | Remove from list and suppress |
| Previously re-engaged but lapsed again | After second re-engagement attempt | Suppress permanently |

### 3.2 Suppression vs. Deletion

| Action | When | Reversible |
|--------|------|-----------|
| Suppress from active sends | Default sunset action | Yes -- user can re-subscribe |
| Move to low-frequency list | User was once highly engaged | Yes -- send quarterly updates |
| Delete from database | Hard bounces, spam complaints, GDPR requests | No |

### 3.3 Win-Back Timing Optimization

| Inactivity Duration | Win-Back Probability | Recommended Action |
|--------------------|--------------------|--------------------|
| 30-60 days | 15-25% | High priority re-engagement |
| 60-90 days | 8-15% | Standard re-engagement |
| 90-180 days | 3-8% | Last-effort re-engagement |
| 180+ days | <3% | Sunset (suppress), do not invest further |

---

## Phase 4: Measurement and Optimization

### 4.1 Re-Engagement Campaign Metrics

| Metric | Target | Measurement |
|--------|--------|------------|
| Re-engagement rate (opened or clicked) | 10-20% of dormant list | Unique opens + clicks / total sent |
| Re-activation rate (took meaningful action) | 5-10% of dormant list | Product login, purchase, or sustained engagement |
| Unsubscribe rate from campaign | <5% | Expected and acceptable; cleaner list is the goal |
| Deliverability impact | Improved inbox placement | Monitor inbox rate pre and post sunset |
| List reduction | 10-30% of list sunsetted | Healthy outcome; smaller engaged list outperforms larger inactive one |

### 4.2 List Health Metrics (Ongoing)

| Metric | Healthy Range | Action if Outside Range |
|--------|-------------|------------------------|
| Active engagement rate | >25% of list | Aggressive re-engagement + sunset |
| Hard bounce rate | <0.5% per send | Verify list, clean hard bounces |
| Spam complaint rate | <0.05% per send | Review content, frequency, targeting |
| List growth rate | Positive (net new > unsubscribes + sunsets) | Invest in acquisition |
| Re-engagement success rate | >10% per campaign | Test new approaches if below threshold |

### 4.3 A/B Testing for Re-Engagement

| Test | Variant A | Variant B | Key Metric |
|------|-----------|-----------|-----------|
| Subject line tone | Emotional ("We miss you") | Value-driven ("Here is what is new") | Open rate |
| Incentive | No incentive | Discount/offer | Click rate |
| From name | Brand name | Personal name | Open rate |
| Sequence length | 2 emails | 3 emails | Re-engagement rate |
| Final email approach | "Stay or go?" | Incentive offer | Re-confirm rate |

---

## Phase 5: Ongoing List Hygiene Program

### 5.1 Proactive Engagement Monitoring

| Cadence | Action |
|---------|--------|
| Weekly | Monitor engagement rates by segment |
| Monthly | Identify newly lapsed contacts (30-day window) |
| Quarterly | Run re-engagement campaign on dormant segment |
| Semi-annually | Full list audit and sunset sweep |
| Annually | Re-consent campaign for long-term subscribers (GDPR) |

### 5.2 Prevention Strategies

Reduce future inactivity by:
- Preference center at signup (frequency, topics).
- Progressive profiling to improve personalization.
- Behavioral triggers that send relevant content at the right time.
- Engagement scoring that adjusts frequency automatically.
- Welcome sequence optimization (see Welcome Sequence Pattern).

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Never sunsetting inactive contacts | Deliverability degrades for entire list | Implement sunset policy and enforce it |
| Re-engagement = guilt trip | "We noticed you have been ignoring us" creates negative sentiment | Lead with value, not guilt |
| Sending re-engagement too late | 180+ day contacts rarely come back | Start re-engagement at 30-60 days |
| No incentive ever | Some contacts need a reason to re-engage | Test incentive vs. no incentive |
| One-size-fits-all re-engagement | Different reasons for inactivity need different messages | Segment by inactivity reason |
| Removing contacts without final notice | Lost opportunity and potential GDPR issue | Always send a final confirmation email |

---

## References

- `Templates/email_audit_template.md` -- Email program health assessment
- `Templates/deliverability_checklist_template.md` -- Deliverability best practices
- `02_strategy/list_building.md` -- List growth and hygiene
- `01_foundations/deliverability.md` -- Sender reputation fundamentals

---

*Pattern version: 1.0*
*Brain: Email Brain*
*Cross-brain dependencies: Customer Success Brain (churn context), Analytics Brain (engagement data), Engineering Brain (event tracking)*
