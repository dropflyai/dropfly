# Viral Loop Pattern — Designing and Optimizing Viral Growth Mechanisms

## Context

Use this pattern when designing a new viral growth mechanism or
optimizing an existing one. Viral loops include referral programs,
inherent product virality (collaborative tools, shared content), and
incentivized sharing. This pattern ensures that viral mechanisms are
designed with measurable components, testable hypotheses, and clear
optimization paths.

---

## Pattern Overview

Every viral loop follows the same meta-structure:

```
USER → MOTIVATION → SHARE → RECIPIENT → CONVERSION → ACTIVATION → USER
```

The efficiency of this loop (K-factor) determines whether virality
amplifies or merely supplements other acquisition channels.

---

## Step 1: Identify the Viral Mechanism

**Inherent Virality:** The product requires other users to function.
- Collaborative tools (shared documents, team workspaces)
- Communication products (messaging, video calls)
- Marketplace products (buyer needs seller, and vice versa)

**Artificial Virality:** The product adds incentives for sharing.
- Referral programs (rewards for inviting friends)
- Social proof features (shareable achievements, scores)
- Content sharing (user-created content visible to non-users)

**Embedded Virality:** Product usage exposes non-users to the product.
- Branded output (watermarks, "made with" badges)
- Calendar/scheduling links (Calendly model)
- Payment requests (Venmo, PayPal)

**Selection Guidance:**
Inherent virality produces the strongest loops (K-factor closest to 1)
because sharing is integral to the value proposition. Artificial
virality produces weaker but still valuable amplification. Embedded
virality provides passive exposure with minimal user effort.

---

## Step 2: Map the Loop Components

For your specific product, map each component of the viral loop:

```
1. Trigger Point: [What motivates the user to share?]
   Current rate: ___% of active users share
   Target rate: ___%

2. Sharing Mechanism: [How does the user share?]
   Channels available: [email, link, social, in-app]
   Avg invites per sharer: ___

3. Recipient Experience: [What does the recipient see?]
   Landing page conversion: ___%
   Time from receipt to sign-up: ___

4. Activation: [Does the new user activate?]
   Referred user activation rate: ___%
   Time to first value: ___

K-Factor = Sharing Rate x Invites/Sharer x Recipient CVR x Activation Rate
Current K = ___ x ___ x ___ x ___ = ___
Target K = ___
```

---

## Step 3: Optimize Each Component

**Sharing Rate Optimization (Experiments):**
- Test different trigger points (after achievement, after value, after
  first session, after X days of usage)
- Test different prompts (ask directly, suggest casually, incentivize)
- Test different incentives (account credit, features, cash, status)
- A/B test prompt copy and design

**Branching Factor Optimization (Experiments):**
- Test contact list import vs. manual invite entry
- Test suggested contacts (AI-recommended people to invite)
- Test bulk invite features (invite entire team, share to social)
- Test invite limits (removing limits often increases volume)

**Recipient Conversion Optimization (Experiments):**
- Test referral landing pages vs. standard signup pages
- Test personalized landing pages ("Invited by [Name]")
- Test social proof on referral landing page
- Test reduced-friction sign-up for referred users
- Test two-sided incentives (recipient gets benefit too)

**Activation Rate Optimization (Experiments):**
- Test referred-user-specific onboarding (connect to referrer first)
- Test skipping non-essential onboarding steps for referred users
- Test immediate value delivery (pre-populated content, warm start)
- Test connecting referred user to referrer within the product

---

## Step 4: Reduce Cycle Time

```
Cycle Time = Time from User Action to New User Activation

Time from share → receipt: [minimize]
  - Instant delivery (push/email/SMS vs. batched)
  - Real-time notification to referrer of recipient action

Time from receipt → sign-up: [minimize]
  - One-click sign-up from invite link
  - Pre-filled registration from invite data
  - Mobile deep linking to app (skip web intermediary)

Time from sign-up → activation: [minimize]
  - Referred user fast-track onboarding
  - Immediate connection to referrer's context
  - Skip to value (template, shared workspace, pre-loaded content)
```

---

## Step 5: Prevent Gaming and Abuse

| Risk | Mitigation |
|------|-----------|
| Fake accounts for rewards | Require activation/payment before crediting reward |
| Self-referral | Block referrals to same email domain, IP, or device |
| Referral farms | Cap rewards per user per period |
| Low-quality referrals | Require referred users to reach activation milestone |
| Incentive arbitrage | Limit discount/credit to product use (not cash out) |

---

## Step 6: Measure and Iterate

**Primary Metrics:**
- K-factor (overall and per-component)
- Viral cycle time (average days from share to new active user)
- Referral-sourced users as % of total new users
- Referral user retention vs. organic user retention

**Secondary Metrics:**
- Referral prompt impression-to-share rate
- Invites sent per active referrer
- Invite-to-signup conversion rate
- Referral user LTV vs. non-referral user LTV

**Iteration Cadence:**
- Run 2–3 viral loop experiments per month
- Measure results at 30-day intervals (referral cycle time may be long)
- Optimize one component at a time (isolate variables)
- Re-calculate K-factor monthly with latest data

---

## Quality Criteria

A well-designed viral loop meets these standards:
- K-factor is measured and tracked weekly
- Each loop component has dedicated experiments in the backlog
- Referred user experience is personalized (not generic signup)
- Anti-abuse measures are active and monitored
- Referred user retention meets or exceeds non-referred retention
- Viral channel attribution is accurate and integrated with analytics

---

## Anti-Patterns

**The Spam Loop:** Aggressive sharing that annoys recipients and damages
brand. Virality at the expense of brand is negative-sum.

**The Reward-Only Loop:** Incentives so strong they attract users who
only want the reward, not the product. Track reward-user retention
separately.

**The Untracked Loop:** Viral sharing is active but not instrumented.
Cannot optimize what is not measured.

**The One-Shot Loop:** Referral prompt shown once at sign-up, never
again. The best time to ask for referrals is after value delivery,
not before.

---

## References

- Andrew Chen: Viral growth mathematics
- Brian Balfour: Growth loops (Reforge)
- Sean Ellis: Referral program optimization
- Jonah Berger, *Contagious*

---

**Viral loops are not features to ship and forget. They are systems
to design, measure, and optimize continuously.**
