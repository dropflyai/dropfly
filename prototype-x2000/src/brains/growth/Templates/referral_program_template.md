# Referral Program Template — Complete Design and Launch Framework

## How to Use This Template

This template guides the design, implementation, and measurement of a
referral program. Complete each section in order. The template covers
program design, incentive structure, user experience, implementation
requirements, and measurement framework. Adapt for your specific
product and audience.

---

## Section 1: Program Strategy

### Program Objectives

**Primary Objective:**
[ ] New user acquisition (grow user base)
[ ] Revenue growth (acquire paying customers)
[ ] Engagement (activate existing users through sharing)
[ ] Other: _______________

**Success Metrics:**
- Target: _____% of new users acquired through referral within 6 months
- Target K-factor: _____
- Target referred user LTV vs. organic user LTV: equal or higher

### Target Audience

**Who Should Refer (Referrers):**
- User segment: _______________
- Minimum engagement threshold: _______________
- Minimum tenure: _______________

**Who Should Be Referred (Referees):**
- Ideal recipient profile: _______________
- Existing user exclusion: [ ] Yes (by email) [ ] No

---

## Section 2: Incentive Design

### Incentive Structure

**Program Type:**
[ ] One-sided (referrer only receives reward)
[ ] Two-sided (both referrer and referee receive reward)
[ ] Tiered (rewards escalate with referral count)
[ ] None (product is inherently viral, no incentive needed)

### Referrer Reward

| Reward Option | Value | Trigger | Notes |
|-------------|-------|---------|-------|
| Account credit | $_____ | When referee [action] | Applied to next billing |
| Feature unlock | [feature] | When referee [action] | Time-limited or permanent |
| Extended usage | [amount] | When referee [action] | Storage, seats, credits |
| Cash/gift card | $_____ | When referee [action] | Paid via [method] |
| Swag/physical | [item] | When referee [action] | Shipped to referrer |

**Selected Reward:** _______________
**Trigger Condition:** Referee must _______________
(Choose an activation event, not just sign-up, to ensure quality)

### Referee Reward

| Reward Option | Value | When Applied | Notes |
|-------------|-------|-------------|-------|
| Extended trial | ___ extra days | At sign-up | No payment needed |
| Discount | ___% off first ___ months | At upgrade | Encourage conversion |
| Feature access | [feature] for ___ days | At sign-up | Showcase premium value |
| Account credit | $_____ | At sign-up | Immediate value |

**Selected Reward:** _______________

### Tiered Rewards (If Applicable)

| Referral Count | Referrer Reward |
|---------------|----------------|
| 1 referral | |
| 3 referrals | |
| 5 referrals | |
| 10 referrals | |
| 25 referrals | |

### Reward Economics

```
Average referral incentive cost: $_____ per successful referral
Expected referral CAC: $_____ (incentive cost / conversion rate)
Organic CAC for comparison: $_____
Referral CAC should be: [ ] Lower than organic [ ] Comparable [ ] Higher is acceptable because ___
```

---

## Section 3: User Experience

### Referral Flow — Referrer

**Discovery (How do users find the referral program?):**
[ ] Navigation menu item
[ ] In-app prompt after [trigger event]
[ ] Settings/account page
[ ] Dedicated referral page
[ ] Email invitation
[ ] Post-achievement prompt
[ ] Other: _______________

**Referral Page Elements:**
- [ ] Clear value proposition ("Give $X, Get $X")
- [ ] Unique referral link (auto-generated)
- [ ] Referral code (for verbal sharing)
- [ ] Email invite form (send from within the product)
- [ ] Social share buttons (LinkedIn, Twitter, Facebook, WhatsApp)
- [ ] Contact import (optional, with permission)
- [ ] Referral status tracker (pending, signed up, activated, rewarded)
- [ ] Total rewards earned display

**Sharing Channels:**
[ ] Unique link (copy to clipboard)
[ ] Email (pre-crafted message, editable)
[ ] SMS/WhatsApp (pre-crafted message, editable)
[ ] LinkedIn share
[ ] Twitter/X share
[ ] Facebook share
[ ] Other: _______________

### Referral Flow — Referee

**Landing Experience:**
- [ ] Custom referral landing page (not standard sign-up)
- [ ] Personalized: "Invited by [Referrer Name]"
- [ ] Clear statement of referee reward
- [ ] Social proof (how many users, key metric)
- [ ] Simplified sign-up form (pre-filled where possible)
- [ ] Mobile-optimized

**Onboarding:**
[ ] Standard onboarding (same as organic users)
[ ] Modified onboarding (connect to referrer, skip steps)
[ ] Accelerated onboarding (pre-loaded with referrer's context)

---

## Section 4: Anti-Abuse Rules

### Fraud Prevention

| Rule | Implementation |
|------|---------------|
| Self-referral prevention | Block same email domain, IP, device fingerprint |
| Fake account prevention | Require activation event before crediting reward |
| Abuse detection | Flag accounts with >X referrals per day for review |
| Reward caps | Maximum ___ rewards per referrer per [period] |
| Minimum activity | Referee must be active for ___ days before reward credits |
| Duplicate prevention | One reward per referee email address, lifetime |

### Terms and Conditions

Key terms to include:
- [ ] Program may be modified or terminated at any time
- [ ] Rewards are non-transferable and non-cashable (if applicable)
- [ ] Fraudulent activity will result in reward reversal and potential
      account suspension
- [ ] One referral reward per referee (no double-dipping)
- [ ] Company employees are [eligible / not eligible]

---

## Section 5: Implementation Requirements

### Technical Requirements

**Backend:**
- [ ] Referral link generation system (unique per user)
- [ ] Referral tracking (link click → sign-up → activation → reward)
- [ ] Reward crediting system (automated)
- [ ] Attribution system (first-click or last-click)
- [ ] Anti-fraud detection rules
- [ ] API for referral status queries

**Frontend:**
- [ ] Referral page in the product
- [ ] Referral landing page for recipients
- [ ] Referral status dashboard for referrers
- [ ] In-app prompts and triggers
- [ ] Social share integration

**Integrations:**
- [ ] Analytics tracking (Amplitude/Mixpanel events)
- [ ] Email system integration (transactional emails for referral events)
- [ ] CRM integration (tag referred users)
- [ ] Payment system integration (credit/reward fulfillment)

### Email Sequences

| Email | Trigger | Recipient | Content |
|-------|---------|-----------|---------|
| Referral invite | Referrer sends invite | Referee | Invite with referrer name and reward description |
| Sign-up confirmation | Referee signs up | Referrer | "[Name] signed up! They need to [activation event] for your reward." |
| Reward earned | Referee activates | Both | "Reward earned! [Details of reward and how to use it]" |
| Referral reminder | 7 days after first use, no referrals | Referrer | "Share [Product] with a friend — you'll both get [reward]" |
| Milestone celebration | Referrer hits tier milestone | Referrer | "You've referred [X] friends! Your new reward: [tier reward]" |

---

## Section 6: Launch Plan

### Pre-Launch (2 weeks before)

- [ ] Program design approved by stakeholders
- [ ] Terms and conditions reviewed by legal
- [ ] Technical implementation complete and tested
- [ ] Landing pages designed and built
- [ ] Email templates created and tested
- [ ] Analytics tracking verified
- [ ] Anti-fraud rules implemented
- [ ] Internal team briefed on the program

### Launch

- [ ] Enable referral program for [all users / segment: ___]
- [ ] Send launch announcement email to existing users
- [ ] In-app announcement (banner, modal, or notification)
- [ ] Blog post or help article explaining the program
- [ ] Social media announcement
- [ ] Update pricing/signup pages to mention referral benefit

### Post-Launch Monitoring (First 30 Days)

| Metric | Week 1 | Week 2 | Week 3 | Week 4 |
|--------|--------|--------|--------|--------|
| Referral page visits | | | | |
| Invites sent | | | | |
| Invites per referrer | | | | |
| Referred sign-ups | | | | |
| Referred activations | | | | |
| Rewards earned | | | | |
| Fraud flags | | | | |
| Total cost | | | | |

---

## Section 7: Measurement Framework

### Referral Funnel Metrics

```
Referral Page Impressions:          _____
Referral Link Shares:               _____ (___% share rate)
Invites Sent:                       _____ (___  per referrer)
Invite Opens/Clicks:                _____ (___% open rate)
Referred Sign-Ups:                  _____ (___% conversion)
Referred Activations:               _____ (___% activation)
Rewards Credited:                   _____ (___% reward rate)

K-Factor: Shares x Invites/Share x SignUp CVR x Activation Rate = ___
```

### Business Impact Metrics

| Metric | Value |
|--------|-------|
| Referral-sourced users (% of total new users) | ___% |
| Referral CAC | $_____ |
| Referred user 30-day retention | ___% |
| Referred user LTV | $_____ |
| Program ROI | (Revenue from referred users - Program cost) / Program cost = ___x |

### Optimization Backlog

| Experiment | Component | Expected Impact | Priority |
|-----------|-----------|----------------|----------|
| | Sharing rate | | |
| | Invites per referrer | | |
| | Recipient conversion | | |
| | Referred activation | | |

---

**A referral program is a growth machine. Design it carefully, measure
it rigorously, and optimize it continuously.**
