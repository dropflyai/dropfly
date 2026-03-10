# Welcome / Onboarding Email Sequence Pattern

> A structured pattern for designing, building, and optimizing a welcome email sequence that activates new subscribers and users, builds trust, and drives first-value experience.

---

## Context

This pattern applies when designing the email sequence triggered by a new signup, subscription, or account creation. The welcome sequence is the highest-engagement email sequence you will ever send -- open rates are 2-3x higher than regular emails. Every wasted welcome email is a missed opportunity to build a lasting relationship.

**Use this pattern for:**
- New SaaS product signups (free or paid)
- Newsletter subscriber onboarding
- New customer post-purchase sequence
- Free trial onboarding emails
- Community member welcome flow

**Key principle:** The welcome sequence has one job: get the user to experience value as fast as possible. Everything in the sequence should drive toward that first "aha moment."

---

## Challenge

Welcome sequences fail when they are generic ("Welcome to our product!"), when they try to educate about everything at once, when they are too infrequent or too aggressive, or when they do not adapt to user behavior. This pattern ensures each email has a clear purpose, the sequence is behaviorally responsive, and the outcome is measurable.

---

## Phase 1: Sequence Strategy (Before Building)

### 1.1 Define the Activation Goal

| Element | Definition |
|---------|-----------|
| Aha moment | The specific action or experience that makes users "get it" |
| Activation metric | The measurable behavior that signals a user has experienced value |
| Time-to-activation target | How quickly should a new user reach the aha moment |
| Post-activation goal | What the user should do next after activation (upgrade, invite, engage) |

**Examples of aha moments by product type:**

| Product Type | Aha Moment | Activation Metric |
|-------------|-----------|------------------|
| Project management | First task completed in a project | Created project + added 3 tasks |
| Analytics | First dashboard viewed with real data | Connected data source + viewed report |
| Communication | First message sent to a teammate | Invited 1 user + sent 1 message |
| Content platform | First piece of content published | Created + published 1 item |
| Newsletter | First valuable email opened and clicked | Opened email + clicked 1 link |

### 1.2 Sequence Architecture

**Recommended structure (7 emails over 14 days):**

| Email # | Day | Type | Purpose |
|---------|-----|------|---------|
| 1 | Day 0 (immediate) | Welcome + quick start | Confirm subscription, deliver immediate value, one clear CTA |
| 2 | Day 1 | Activation push | Guide to the aha moment, step-by-step |
| 3 | Day 3 | Value reinforcement | Share a success story or tip |
| 4 | Day 5 | Feature education | Introduce a key feature they have not tried |
| 5 | Day 7 | Social proof | Customer story or community highlight |
| 6 | Day 10 | Engagement check | Ask a question, invite feedback, offer help |
| 7 | Day 14 | Next step / upgrade | Transition to regular communication or conversion ask |

### 1.3 Behavioral Branching

The sequence should adapt based on user behavior:

| If User... | Then... |
|-----------|---------|
| Has completed activation | Skip activation emails, move to engagement/upgrade |
| Has not opened first 2 emails | Try different subject line, adjust send time |
| Opened but not clicked | Simplify CTA, test different offer |
| Started trial but not activated | Focus on removing friction, offer help |
| Invited team members | Send collaboration tips, team features |
| Has visited pricing page | Move to conversion-focused emails |

---

## Phase 2: Email-by-Email Design

### Email 1: Welcome (Day 0, Immediate)

**Send timing:** Within 5 minutes of signup.

**Structure:**
1. **Subject line:** Direct and warm. "Welcome to [Product] -- here is your first step" or "You are in! Let us get you started."
2. **Greeting:** Personal, brief. Use first name.
3. **Confirmation:** What they signed up for, what to expect.
4. **One action:** The single most important thing they should do right now.
5. **Resource:** One link to getting-started guide or quick-start video.
6. **Expectation setting:** What emails they will receive and how often.

**Performance benchmarks:**
- Open rate: 50-80%
- Click rate: 20-40%
- Target action completion: 30-50%

### Email 2: Activation Push (Day 1)

**Structure:**
1. **Subject line:** Action-oriented. "Complete your setup in 3 minutes" or "One step away from [value]."
2. **Reminder of value:** One sentence on what they will achieve.
3. **Step-by-step guide:** 3-5 numbered steps to reach the aha moment.
4. **Visual:** Screenshot or GIF showing the experience.
5. **CTA:** Button linking directly to the action.
6. **Help offer:** "Stuck? Reply to this email and we will help."

**Performance benchmarks:**
- Open rate: 40-60%
- Click rate: 15-30%

### Email 3: Value Reinforcement (Day 3)

**Structure:**
1. **Subject line:** Outcome-focused. "How [Customer] saved 10 hours/week with [Product]."
2. **Story:** Brief customer success story or use case (3-4 sentences).
3. **Tip:** One specific tip they can apply today.
4. **CTA:** Try the tip (link to relevant feature).

### Email 4: Feature Education (Day 5)

**Structure:**
1. **Subject line:** Curiosity-driven. "Have you tried [Feature]?" or "The feature most users miss."
2. **Feature introduction:** What it does and why it matters (2-3 sentences).
3. **Use case:** Specific example of how to use it.
4. **CTA:** Try the feature.

**Feature selection criteria:** Choose the feature that most strongly correlates with retention. This is not the newest feature -- it is the most valuable one.

### Email 5: Social Proof (Day 7)

**Structure:**
1. **Subject line:** Social proof. "[X,000] teams use [Product] for [outcome]."
2. **Community highlight:** Customer logos, testimonial, or community stat.
3. **Relatable example:** A customer similar to the recipient.
4. **CTA:** Join the community, read the full story, or try the approach.

### Email 6: Engagement Check (Day 10)

**Structure:**
1. **Subject line:** Personal. "How is it going with [Product]?" or "Can I help?"
2. **Check-in:** Genuine question about their experience.
3. **Offer:** Calendar link for a walkthrough, or reply for help.
4. **Question:** One specific question to gather feedback (reply-driven).
5. **Fallback CTA:** Link to help center or community.

### Email 7: Next Step / Conversion (Day 14)

**Structure:**
1. **Subject line:** Forward-looking. "What is next for your [Product] journey" or "Ready to unlock [next level]?"
2. **Summary:** What they have accomplished so far (use data if available).
3. **Next step:** Clear recommendation for their next action.
4. **For free users:** Introduce paid features with value framing.
5. **For paid users:** Advanced tips, invite to community, or referral ask.
6. **Transition:** Set expectations for ongoing email cadence.

---

## Phase 3: Technical Implementation

### 3.1 Compliance Requirements

- [ ] CAN-SPAM: Physical address in footer, unsubscribe link, accurate From and Subject.
- [ ] GDPR: Consent recorded, easy unsubscribe, data processing documented.
- [ ] CASL: Express consent obtained (Canada).
- [ ] Preference center: Link to manage email preferences.
- [ ] Suppression: Do not send welcome emails to users who unsubscribed from other lists.

### 3.2 Sending Configuration

| Setting | Specification |
|---------|---------------|
| From name | [Person name] from [Company] or [Company] Team |
| From email | Recognizable, reply-enabled address |
| Reply-to | Monitored inbox (not no-reply) |
| Send timing | Email 1 immediate; others based on user timezone if available |
| Frequency cap | No more than 1 email/day from all sequences combined |
| Suppression | Suppress if user converts before sequence completes |
| Exit criteria | User completes activation OR unsubscribes OR sequence ends |

### 3.3 A/B Testing Plan

| Email | Test Element | Variant A | Variant B | Metric |
|-------|-------------|-----------|-----------|--------|
| Email 1 | Subject line | Welcome + product name | Welcome + value proposition | Open rate |
| Email 2 | CTA | Button CTA | Text link CTA | Click rate |
| Email 3 | Content type | Customer story | Product tip | Click rate |
| Email 5 | Social proof type | Customer quote | Usage stats | Click rate |
| Email 7 | Conversion ask | Soft (learn more) | Direct (upgrade now) | Conversion rate |

---

## Phase 4: Measurement and Optimization

### 4.1 Sequence-Level Metrics

| Metric | Target | Measurement |
|--------|--------|------------|
| Sequence completion rate | >60% | % who receive all emails without unsubscribing |
| Overall click rate | >15% | % who click at least one link in the sequence |
| Activation rate | >30% | % who complete activation action |
| Unsubscribe rate (total sequence) | <2% | Total unsubscribes / total recipients |
| Revenue influence | Measurable | Pipeline or revenue attributed to welcome sequence |

### 4.2 Per-Email Metrics

| Email | Open Rate Target | Click Rate Target | Unsub Target |
|-------|-----------------|------------------|-------------|
| Email 1 | >50% | >20% | <0.5% |
| Email 2 | >40% | >15% | <0.5% |
| Email 3 | >35% | >10% | <0.5% |
| Email 4 | >30% | >10% | <0.3% |
| Email 5 | >30% | >8% | <0.3% |
| Email 6 | >25% | >5% | <0.3% |
| Email 7 | >25% | >8% | <0.3% |

### 4.3 Optimization Cadence

| Cadence | Action |
|---------|--------|
| Weekly | Monitor per-email metrics, pause underperformers |
| Monthly | Review A/B test results, implement winners |
| Quarterly | Full sequence audit: content freshness, metric trends, behavioral data |
| Semi-annual | Strategic review: is the aha moment still correct? Has the product changed? |

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Generic welcome ("Welcome to X!") | No differentiation, low engagement | Specific value proposition and clear first step |
| Too many CTAs per email | Decision paralysis, low click rate | One primary CTA per email |
| No behavioral branching | Activated users get activation emails | Suppress or branch based on user behavior |
| Sending from no-reply@ | Kills engagement and trust | Use a real, monitored reply address |
| Same send time for everyone | Suboptimal for global audiences | Send-time optimization or timezone-based |
| Never updating the sequence | Outdated content, wrong features highlighted | Quarterly content review |

---

## References

- `Templates/email_sequence_template.md` -- Sequence design worksheet
- `03_campaigns/drip_sequences.md` -- Drip sequence theory
- `01_foundations/email_metrics.md` -- Metric definitions and benchmarks
- `07_compliance/email_compliance.md` -- Compliance requirements

---

*Pattern version: 1.0*
*Brain: Email Brain*
*Cross-brain dependencies: Product Brain (activation metrics), Engineering Brain (event tracking), Design Brain (email template design)*
