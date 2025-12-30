# Motion & Animation Design — Authoritative

Motion is not decoration. It is communication.
Animation that doesn't serve a purpose is noise.

---

## Purpose

Motion design exists to:
- communicate state changes
- guide user attention
- provide feedback on actions
- create sense of continuity
- improve perceived performance

If animation doesn't serve one of these purposes, remove it.

---

## Core Principles

### 1. Purposeful Motion
Every animation must have a reason:
- **Feedback**: Confirm an action was registered
- **Orientation**: Show where something came from/went to
- **Focus**: Direct attention to what matters
- **Delight**: Reward completion (sparingly)

### 2. Quick is Kind
Users are impatient. Fast animations respect their time.
- Most transitions: 150-300ms
- Complex animations: max 500ms
- Loading indicators: appear after 200ms delay

### 3. Natural Movement
Motion should feel physical, not robotic.
- Objects accelerate and decelerate (easing)
- Large objects move slower than small ones
- Objects don't teleport

---

## Timing Scale

```
DURATION TOKENS

--duration-instant:   0ms      # No animation
--duration-fast:      100ms    # Micro-interactions (hover, focus)
--duration-normal:    200ms    # Standard transitions
--duration-moderate:  300ms    # Emphasis, attention
--duration-slow:      400ms    # Complex reveals
--duration-slower:    500ms    # Page transitions (max)
```

### When to Use Each

| Duration | Use For | Example |
|----------|---------|---------|
| Instant (0ms) | Critical actions | Form submission |
| Fast (100ms) | Hover states, focus rings | Button hover |
| Normal (200ms) | Most transitions | Dropdown open |
| Moderate (300ms) | Modal open, drawer slide | Settings panel |
| Slow (400ms) | Page transitions, reveals | Dashboard load |
| Slower (500ms) | Hero animations, onboarding | First-run tour |

---

## Easing Functions

```
EASING TOKENS

--ease-default:      cubic-bezier(0.4, 0, 0.2, 1)   # General purpose
--ease-in:           cubic-bezier(0.4, 0, 1, 1)     # Accelerate (exit)
--ease-out:          cubic-bezier(0, 0, 0.2, 1)     # Decelerate (enter)
--ease-in-out:       cubic-bezier(0.4, 0, 0.2, 1)   # Both (move)
--ease-bounce:       cubic-bezier(0.34, 1.56, 0.64, 1) # Playful (sparingly)
--ease-spring:       cubic-bezier(0.175, 0.885, 0.32, 1.275) # Elastic
```

### Easing Guidelines

| Action | Easing | Why |
|--------|--------|-----|
| Element entering | ease-out | Decelerates into place (arriving) |
| Element exiting | ease-in | Accelerates away (leaving) |
| Element moving | ease-in-out | Natural movement |
| Attention/bounce | ease-bounce | Playful emphasis |
| Spring/elastic | ease-spring | Interactive feedback |

---

## Animation Patterns

### 1. Fade

```css
/* Fade In */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Fade Out */
@keyframes fadeOut {
  from { opacity: 1; }
  to { opacity: 0; }
}
```

**Use for:**
- Tooltips appearing
- Toast notifications
- Modal overlays
- Subtle state changes

**Duration:** 150-200ms

---

### 2. Slide

```css
/* Slide In from Right */
@keyframes slideInRight {
  from {
    transform: translateX(100%);
    opacity: 0;
  }
  to {
    transform: translateX(0);
    opacity: 1;
  }
}

/* Slide In from Bottom */
@keyframes slideInUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}
```

**Use for:**
- Drawer/panel opening
- Dropdown menus
- Mobile navigation
- List items appearing

**Duration:** 200-300ms

---

### 3. Scale

```css
/* Scale In (Grow) */
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

/* Pop In (More dramatic) */
@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
```

**Use for:**
- Modals appearing
- Popovers
- Image previews
- Success confirmations

**Duration:** 200-300ms

---

### 4. Collapse/Expand

```css
/* Accordion Expand */
@keyframes expand {
  from {
    height: 0;
    opacity: 0;
  }
  to {
    height: var(--content-height);
    opacity: 1;
  }
}
```

**Use for:**
- Accordions
- Expandable sections
- Show more/less
- Form field reveals

**Duration:** 200-300ms

---

### 5. Skeleton/Loading

```css
/* Shimmer Effect */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

.skeleton {
  background: linear-gradient(
    90deg,
    var(--gray-200) 25%,
    var(--gray-100) 50%,
    var(--gray-200) 75%
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

**Use for:**
- Content loading states
- Image placeholders
- Data fetching

**Duration:** 1.5s (continuous)

---

### 6. Spinner

```css
/* Simple Spin */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

**Use for:**
- Button loading states
- Form submission
- Data refresh

**Duration:** 1s (continuous)

---

### 7. Attention/Pulse

```css
/* Pulse */
@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

/* Bounce */
@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

/* Shake (Error) */
@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}
```

**Use for:**
- Notifications
- Error states
- New content indicators
- Onboarding highlights

**Duration:** 300-600ms

---

## State Transitions

### Hover States

```css
.button {
  transition:
    background-color 100ms ease-out,
    transform 100ms ease-out;
}

.button:hover {
  background-color: var(--primary-hover);
  transform: translateY(-1px);
}
```

**Rules:**
- Duration: 100ms
- Properties: color, background, transform
- Subtle movement only (1-2px)

---

### Focus States

```css
.input {
  transition:
    border-color 100ms ease-out,
    box-shadow 100ms ease-out;
}

.input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px var(--primary-ring);
}
```

**Rules:**
- Duration: 100ms
- Visible focus ring (accessibility)
- No movement (stability for keyboard users)

---

### Active/Pressed States

```css
.button:active {
  transform: scale(0.98);
  transition: transform 50ms ease-in;
}
```

**Rules:**
- Duration: 50ms (instant feedback)
- Scale down slightly
- Immediate response

---

## Page Transitions

### Route Changes

```css
/* Page Enter */
.page-enter {
  opacity: 0;
  transform: translateY(10px);
}

.page-enter-active {
  opacity: 1;
  transform: translateY(0);
  transition: all 300ms ease-out;
}

/* Page Exit */
.page-exit {
  opacity: 1;
}

.page-exit-active {
  opacity: 0;
  transition: opacity 150ms ease-in;
}
```

**Rules:**
- Enter: 300ms
- Exit: 150ms (faster, get out of the way)
- Direction hints at navigation (left/right for prev/next)

---

## Staggered Animations

### List Items

```css
.list-item {
  opacity: 0;
  transform: translateY(10px);
  animation: slideInUp 200ms ease-out forwards;
}

.list-item:nth-child(1) { animation-delay: 0ms; }
.list-item:nth-child(2) { animation-delay: 50ms; }
.list-item:nth-child(3) { animation-delay: 100ms; }
.list-item:nth-child(4) { animation-delay: 150ms; }
/* Max 200ms total stagger */
```

**Rules:**
- Stagger delay: 50ms per item
- Max total stagger: 200ms
- Max items to stagger: 5 (then batch)
- First item immediate

---

## Reduced Motion

**REQUIRED: Always respect user preferences.**

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Alternative for Reduced Motion

Instead of removing motion entirely, provide alternatives:
- Replace slide with instant appear
- Replace bounce with static
- Keep essential feedback (loading indicators)

---

## Mode-Specific Guidelines

### MODE_SAAS
- Smooth, polished transitions
- Micro-interactions on buttons/forms
- Subtle hover effects
- Success celebrations (brief)

### MODE_INTERNAL
- Minimal animations
- Fast transitions only
- No decorative motion
- Focus on speed

### MODE_AGENTIC
- Status change animations
- Progress indicators
- Pulse for active processes
- No distracting animations

---

## Performance Rules

### Do:
- Use `transform` and `opacity` (GPU accelerated)
- Use `will-change` sparingly for complex animations
- Keep animations under 500ms
- Use CSS over JavaScript when possible

### Don't:
- Animate `width`, `height`, `top`, `left` (layout thrashing)
- Use `will-change: all`
- Run multiple heavy animations simultaneously
- Block user interaction during animation

---

## Common Patterns by Component

| Component | Enter | Exit | Trigger |
|-----------|-------|------|---------|
| Modal | scaleIn + fade (300ms) | fade (200ms) | Button click |
| Dropdown | slideInUp (200ms) | fade (150ms) | Click/hover |
| Toast | slideInRight (300ms) | slideOutRight (200ms) | Auto/action |
| Tooltip | fade (150ms) | fade (100ms) | Hover |
| Drawer | slideInRight (300ms) | slideOutRight (200ms) | Toggle |
| Accordion | expand (250ms) | collapse (200ms) | Click |
| Button loading | spin (continuous) | fade (100ms) | Submit |

---

## Anti-Patterns (Disallowed)

```
DO NOT:

❌ Animations longer than 500ms (except loading)
❌ Bounce/elastic on everything
❌ Auto-playing animations on page load
❌ Animations that block interaction
❌ Motion that serves no purpose
❌ Inconsistent easing across similar elements
❌ Animation without reduced-motion fallback
❌ Layout-triggering properties in animations
```

---

## Implementation Checklist

Before shipping animations:

- [ ] Duration within guidelines (100-500ms)
- [ ] Appropriate easing for action type
- [ ] Reduced motion fallback
- [ ] Performance tested (no jank)
- [ ] Consistent with similar elements
- [ ] Serves a clear purpose
- [ ] Doesn't block interaction

---

## END OF MOTION DESIGN
