# Design Review Template — Authoritative

Use this template to evaluate any UI before implementation or handoff.
Every section must be completed. Incomplete reviews are invalid.

---

## Review Header

```
Screen/Feature: ________________________________
Reviewer: ________________________________
Date: ________________________________
Mode: [ ] MODE_SAAS  [ ] MODE_INTERNAL  [ ] MODE_AGENTIC
Status: [ ] Draft  [ ] Ready for Review  [ ] Approved  [ ] Needs Revision
```

---

## 1. Design Intent Verification

### Intent Declaration Present?
[ ] Yes  [ ] No (STOP — cannot proceed without intent)

### Intent Declaration Check
```
User type: ________________________________
Primary decision: ________________________________
Excluded on purpose: ________________________________
Failure definition: ________________________________
```

### Questions
- Does the UI match the stated intent? [ ] Yes [ ] No
- Is there anything that contradicts the intent? [ ] Yes [ ] No
- Is the primary decision enabled clearly? [ ] Yes [ ] No

Notes:
```


```

---

## 2. Hierarchy & Layout

### Primary Focus
- What is the first thing users see? ________________________________
- Is this the right thing? [ ] Yes [ ] No

### Visual Hierarchy
| Check | Pass | Fail |
|-------|------|------|
| Single dominant focal point | [ ] | [ ] |
| Clear reading order | [ ] | [ ] |
| Primary action obvious | [ ] | [ ] |
| Secondary actions quieter | [ ] | [ ] |
| No competing elements | [ ] | [ ] |

### Layout
| Check | Pass | Fail |
|-------|------|------|
| Consistent spacing | [ ] | [ ] |
| Proper grouping | [ ] | [ ] |
| No arbitrary values | [ ] | [ ] |
| Follows spacing scale | [ ] | [ ] |

Notes:
```


```

---

## 3. State Completeness

### Required States
| State | Present | Clear | Notes |
|-------|---------|-------|-------|
| Default | [ ] | [ ] | |
| Loading | [ ] | [ ] | |
| Empty | [ ] | [ ] | |
| Error | [ ] | [ ] | |
| Success | [ ] | [ ] | |

### Empty State Check
- Explains what this area is? [ ] Yes [ ] No
- Explains why it matters? [ ] Yes [ ] No
- Shows clear next action? [ ] Yes [ ] No

### Error State Check
- Explains what went wrong? [ ] Yes [ ] No
- Explains how to fix? [ ] Yes [ ] No
- Non-blaming language? [ ] Yes [ ] No

Notes:
```


```

---

## 4. Component Usage

### Components Used
List all components:
```


```

### Component Compliance
| Check | Pass | Fail |
|-------|------|------|
| Only allowed variants used | [ ] | [ ] |
| States defined for each | [ ] | [ ] |
| Follows ComponentSpec.md | [ ] | [ ] |
| No custom one-off components | [ ] | [ ] |

### Buttons Check
- Single primary button? [ ] Yes [ ] No [ ] N/A
- Destructive styled correctly? [ ] Yes [ ] No [ ] N/A
- Disabled buttons explained? [ ] Yes [ ] No [ ] N/A

Notes:
```


```

---

## 5. Copy & Language

### Tone Check
| Check | Pass | Fail |
|-------|------|------|
| Direct and clear | [ ] | [ ] |
| No marketing language | [ ] | [ ] |
| No jargon | [ ] | [ ] |
| No filler words | [ ] | [ ] |
| Follows CopyTone.md | [ ] | [ ] |

### Specific Copy Review
| Element | Current | Suggested Change |
|---------|---------|------------------|
| Page title | | |
| Primary CTA | | |
| Empty state | | |
| Error message | | |

Notes:
```


```

---

## 6. Accessibility

### Basic Requirements
| Check | Pass | Fail |
|-------|------|------|
| Keyboard navigable | [ ] | [ ] |
| Visible focus states | [ ] | [ ] |
| Color contrast (4.5:1) | [ ] | [ ] |
| No color-only meaning | [ ] | [ ] |
| Semantic HTML | [ ] | [ ] |

### Form Accessibility (if applicable)
| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Labels associated | [ ] | [ ] | [ ] |
| Errors announced | [ ] | [ ] | [ ] |
| Required fields indicated | [ ] | [ ] | [ ] |

Notes:
```


```

---

## 7. Mode Alignment

### Selected Mode: ________________________________

### Mode-Specific Checks

**MODE_SAAS**
| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Approachable density | [ ] | [ ] | [ ] |
| Clear value framing | [ ] | [ ] | [ ] |
| No internal jargon | [ ] | [ ] | [ ] |
| Onboarding considered | [ ] | [ ] | [ ] |

**MODE_INTERNAL**
| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| Appropriate density | [ ] | [ ] | [ ] |
| Efficiency optimized | [ ] | [ ] | [ ] |
| Keyboard shortcuts | [ ] | [ ] | [ ] |
| Power user friendly | [ ] | [ ] | [ ] |

**MODE_AGENTIC**
| Check | Pass | Fail | N/A |
|-------|------|------|-----|
| System state visible | [ ] | [ ] | [ ] |
| Transparency prioritized | [ ] | [ ] | [ ] |
| Partial failure handled | [ ] | [ ] | [ ] |
| Logs accessible | [ ] | [ ] | [ ] |

Notes:
```


```

---

## 8. Pattern Compliance

### Patterns Used
List relevant patterns from /Patterns/:
```


```

### Pattern Compliance
| Pattern | Compliant | Deviation | Justification |
|---------|-----------|-----------|---------------|
| | [ ] Yes [ ] No | | |
| | [ ] Yes [ ] No | | |
| | [ ] Yes [ ] No | | |

Notes:
```


```

---

## 9. UX Score

Run full scoring from `/eval/UXScore.md`:

| Dimension | Score (1-5) | Notes |
|-----------|-------------|-------|
| Clarity | | |
| Hierarchy | | |
| Speed to Action | | |
| State Completeness | | |
| Cognitive Load | | |
| Copy Quality | | |
| Mode Alignment | | |
| Accessibility | | |

**Minimum passing: All scores ≥ 4**

Overall: [ ] Pass [ ] Fail (refactor required)

---

## 10. Final Verdict

### Decision
[ ] **Approved** — Ready for implementation
[ ] **Approved with Notes** — Minor changes needed
[ ] **Needs Revision** — Significant changes required
[ ] **Rejected** — Does not meet standards

### Required Changes (if any)
```


```

### Strengths
```


```

### Concerns
```


```

---

## Signatures

```
Designer: _________________ Date: _________
Reviewer: _________________ Date: _________
```

---

## END OF REVIEW TEMPLATE
