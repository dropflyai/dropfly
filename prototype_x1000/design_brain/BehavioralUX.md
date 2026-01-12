# Behavioral UX — Marketing & Psychology Integration

This document defines psychological principles that inform UX decisions.

---

## Purpose

Design is not neutral. Every choice influences behavior.
This document ensures we use psychological principles ethically to:
- Build trust
- Reduce friction
- Enable good decisions
- Never manipulate

---

## Core Principle

**"Align user goals with business goals through clarity, not manipulation."**

---

## 1. Attention & Friction Management

### Attention Budget

Users have limited attention. Spend it wisely.

| Element | Attention Cost | When to Use |
|---------|----------------|-------------|
| Motion/animation | High | Important state changes only |
| Color accent | Medium | Primary actions, key info |
| Size increase | Medium | Hierarchy, not decoration |
| Position (top/center) | Medium | Most important elements |
| Text length | Cumulative | Only necessary words |

### Friction Types

| Type | Definition | Example |
|------|------------|---------|
| Good friction | Prevents errors | Confirmation for destructive actions |
| Bad friction | Blocks goals | Unnecessary form fields |
| Hidden friction | Unexpected blocks | Surprise requirements mid-flow |

### Friction Rules

- **Remove** bad friction ruthlessly
- **Add** good friction at high-stakes moments
- **Never hide** friction — be upfront about requirements

---

## 2. Trust-Building Patterns

### Trust Signals

| Signal | Implementation | When |
|--------|----------------|------|
| Social proof | Testimonials, logos, user counts | Landing pages, pricing |
| Authority | Certifications, press mentions | Consideration phase |
| Transparency | Clear pricing, honest limitations | Throughout |
| Predictability | Consistent behavior, no surprises | Every interaction |
| Competence | Polish, no errors, fast performance | Every screen |

### Trust Placement

```
HIGH TRUST NEED                    LOW TRUST NEED
(new users, purchase)              (existing users, free actions)
        │                                  │
        ▼                                  ▼
   More signals                      Fewer signals
   (3-4 trust cues)                  (1-2 trust cues)
```

### Trust Erosion (Avoid)

| Eroder | Effect | Prevention |
|--------|--------|------------|
| Hidden costs | Instant distrust | Show all costs upfront |
| Unexpected requirements | Abandonment | List requirements before starting |
| Broken promises | Permanent damage | Only promise what's certain |
| Inconsistency | Confusion | Design system enforcement |
| Dark patterns | Resentment + churn | See "No Dark Patterns" section |

---

## 3. Conversion Architecture

### CTA Hierarchy

Every screen should have clear action priority:

```
PRIMARY (1 per screen)
    │
    ▼
SECONDARY (0-2 per screen)
    │
    ▼
TERTIARY (as needed, de-emphasized)
```

| Level | Visual Treatment | Examples |
|-------|------------------|----------|
| Primary | Filled, accent color, prominent | "Start Free Trial", "Submit" |
| Secondary | Outlined or subtle fill | "Learn More", "See Pricing" |
| Tertiary | Text link, minimal styling | "Skip", "Maybe Later" |

### Progressive Disclosure for Conversion

Don't ask for everything upfront.

```
Step 1: Minimal ask (email only)
    ↓
Step 2: Gradual value exchange (name after first value delivered)
    ↓
Step 3: Full commitment (payment after trust established)
```

### Conversion Copy Principles

| Do | Don't |
|----|-------|
| Action verbs ("Start", "Get", "Create") | Vague verbs ("Submit", "Continue") |
| Benefit-focused ("Get your report") | Feature-focused ("Generate report") |
| Specific ("14-day free trial") | Vague ("Try it free") |
| Low-commitment language ("No credit card") | High-pressure language ("Limited time!") |

---

## 4. Retention Hooks (Ethical)

### Good Retention Patterns

| Pattern | How It Works | Ethical Use |
|---------|--------------|-------------|
| Progress indicators | Shows investment/achievement | Real progress, not fake |
| Personalization | Content feels tailored | Based on actual behavior |
| Notifications | Reminds of value | Only genuinely useful updates |
| Streaks | Encourages consistency | Don't punish breaks harshly |
| Social features | Community connection | Opt-in, not forced |

### Bad Retention Patterns (Avoid)

| Pattern | Why It's Bad | Alternative |
|---------|--------------|-------------|
| Artificial scarcity | Manipulative pressure | Honest availability |
| FOMO notifications | Anxiety-inducing | Value-focused notifications |
| Difficult cancellation | Traps users | Easy, respectful offboarding |
| Guilt messaging | Emotional manipulation | Neutral departure messaging |
| Hidden unsubscribe | Erodes trust completely | Clear, accessible opt-out |

---

## 5. Persona Alignment & Messaging

### Message-Persona Fit

| Persona Type | Messaging Approach |
|--------------|-------------------|
| Analytical | Data, specifics, comparisons |
| Driver | Results, speed, efficiency |
| Amiable | Safety, support, community |
| Expressive | Vision, creativity, uniqueness |

### Consistency Requirements

- **Voice** stays consistent across all touchpoints
- **Promise** made in marketing = experience in product
- **Tone** may flex (more serious for errors) but character stays same

### Messaging Don'ts

- Don't promise what the product can't deliver
- Don't use insider jargon with new users
- Don't be overly casual in serious moments
- Don't be robotic in human moments

---

## 6. NO DARK PATTERNS RULE (ABSOLUTE — HARD RULE)

### Definition

Dark patterns are design choices that trick users into unintended actions.

### HARD RULE (Non-Negotiable)

**NO DARK PATTERNS:**
- No forced continuity (auto-renewal without clear notice)
- No deceptive urgency (fake timers, artificial scarcity)
- No hidden opt-outs (buried unsubscribe, confusing toggles)
- No guilt-based copy (confirmshaming, emotional manipulation)

**Design MUST optimize for:**
- Long-term trust
- Comprehension
- User agency

Violation of this rule = immediate redesign required.

### Prohibited Patterns

| Pattern | Description | Why Prohibited |
|---------|-------------|----------------|
| **Confirmshaming** | Guilt-trip decline buttons | Manipulative |
| **Roach motel** | Easy to enter, hard to leave | Traps users |
| **Bait & switch** | Promise one thing, deliver another | Deceptive |
| **Hidden costs** | Surprise fees at checkout | Dishonest |
| **Misdirection** | Attention away from important info | Manipulative |
| **Forced continuity** | Auto-renewal without clear notice | Exploitative |
| **Friend spam** | Accessing contacts without clear consent | Privacy violation |
| **Trick questions** | Confusing opt-in/opt-out | Deceptive |
| **Sneak into basket** | Adding items without consent | Theft-adjacent |
| **Privacy zuckering** | Confusing privacy settings | Privacy violation |

### Detection Questions

Before shipping, ask:
1. Would the user choose this if they fully understood?
2. Am I making the user's preferred action easy?
3. Would I be embarrassed if this was written about publicly?

If any answer is concerning → **Redesign**

---

## Application by Product Type

### MODE_SAAS (Customer-Facing)

Priority: Trust → Conversion → Retention

- Heavy trust signals early
- Clear value proposition
- Progressive commitment
- Easy cancellation (builds long-term trust)

### MODE_INTERNAL (Internal Tools)

Priority: Efficiency → Retention → Trust (internal trust is assumed)

- Minimal trust signals needed
- Focus on speed and power
- Habit formation through efficiency

### MODE_AGENTIC (AI/Automation)

Priority: Trust → Predictability → Conversion

- Extra transparency required
- Explain what AI is doing
- Show confidence levels
- Allow human override

---

## Behavioral UX Checklist

Before shipping user-facing screens:

```markdown
## Behavioral UX Check

**Attention:**
- [ ] Attention spent on most important elements
- [ ] No unnecessary distractions
- [ ] Good friction present where needed
- [ ] Bad friction removed

**Trust:**
- [ ] Appropriate trust signals for user stage
- [ ] No trust eroders present
- [ ] Promises match capability

**Conversion:**
- [ ] Clear CTA hierarchy
- [ ] Progressive disclosure where appropriate
- [ ] Benefit-focused copy

**Retention:**
- [ ] Ethical retention patterns only
- [ ] No dark patterns
- [ ] Easy exit if user wants to leave

**Messaging:**
- [ ] Consistent with brand voice
- [ ] Appropriate for persona
- [ ] Honest and clear
```

---

## Cross-References

- Playbook: `DesignPlaybook.md` — Core design rules
- Copy: `CopyTone.md` — Language guidelines
- Testing: `6-Testing/UsabilityTesting.md` — Validate behavioral assumptions
- Memory: `Memory/ExperienceLog.md` — Log behavioral learnings

---

## END OF BEHAVIORAL UX
