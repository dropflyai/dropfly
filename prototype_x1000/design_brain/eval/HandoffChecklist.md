# Handoff Checklist — Authoritative

Complete this checklist before handing off any design for implementation.
Every item must be checked. Incomplete handoffs cause rework.

---

## Pre-Handoff Requirements

Before starting this checklist, ensure:
- [ ] Design Intent Declaration is documented
- [ ] Design Review (ReviewTemplate.md) is complete
- [ ] UX Score is ≥ 4 in all categories
- [ ] All feedback has been addressed

---

## 1. Design Artifacts

### Files & Deliverables
| Item | Complete | Location |
|------|----------|----------|
| Final design files | [ ] | |
| Component specifications | [ ] | |
| Responsive breakpoints | [ ] | |
| Asset exports (if needed) | [ ] | |

### Design System Compliance
- [ ] Uses only approved colors (Tokens/Colors.md)
- [ ] Uses only approved typography (Tokens/Typography.md)
- [ ] Uses only approved spacing (Tokens/Spacing.md)
- [ ] Uses only approved icons (Tokens/Icons.md)
- [ ] Uses only approved components (ComponentSpec.md)

---

## 2. States Documentation

### All States Defined
| State | Documented | Design Complete | Notes |
|-------|------------|-----------------|-------|
| Default | [ ] | [ ] | |
| Loading | [ ] | [ ] | |
| Empty | [ ] | [ ] | |
| Error | [ ] | [ ] | |
| Success | [ ] | [ ] | |
| Disabled (if applicable) | [ ] | [ ] | |
| Hover (if applicable) | [ ] | [ ] | |
| Focus (if applicable) | [ ] | [ ] | |

### Error States Specified
- [ ] Error messages written
- [ ] Error placement defined
- [ ] Recovery actions specified
- [ ] Edge cases documented

---

## 3. Interaction Specifications

### Behaviors Documented
| Interaction | Documented |
|-------------|------------|
| Click/tap behaviors | [ ] |
| Hover states | [ ] |
| Focus states | [ ] |
| Keyboard shortcuts (if any) | [ ] |
| Form validation rules | [ ] |
| Loading behavior | [ ] |
| Success behavior | [ ] |
| Error behavior | [ ] |

### Animation & Transitions
- [ ] Entry animations specified (or noted as none)
- [ ] Exit animations specified (or noted as none)
- [ ] Transition durations defined
- [ ] Easing functions specified
- [ ] Reduced motion alternatives noted

---

## 4. Content & Copy

### All Copy Finalized
| Element | Copy Complete | Reviewed |
|---------|---------------|----------|
| Page titles | [ ] | [ ] |
| Section headers | [ ] | [ ] |
| Button labels | [ ] | [ ] |
| Form labels | [ ] | [ ] |
| Help text | [ ] | [ ] |
| Error messages | [ ] | [ ] |
| Success messages | [ ] | [ ] |
| Empty state copy | [ ] | [ ] |
| Placeholder text | [ ] | [ ] |

### Copy Compliance
- [ ] Follows CopyTone.md guidelines
- [ ] No placeholder/lorem ipsum remaining
- [ ] No marketing language in product UI
- [ ] Consistent terminology throughout

---

## 5. Responsive Design

### Breakpoints Defined
| Breakpoint | Design Complete |
|------------|-----------------|
| Mobile (< 640px) | [ ] |
| Tablet (640-1024px) | [ ] |
| Desktop (> 1024px) | [ ] |
| Large desktop (> 1280px) | [ ] N/A |

### Responsive Behavior
- [ ] Layout changes documented
- [ ] Element hiding/showing specified
- [ ] Touch targets sized correctly (44x44 min)
- [ ] Navigation behavior on mobile defined

---

## 6. Accessibility Requirements

### Compliance Documented
| Requirement | Specified |
|-------------|-----------|
| Keyboard navigation order | [ ] |
| Focus management | [ ] |
| Screen reader labels | [ ] |
| ARIA attributes needed | [ ] |
| Color contrast verified | [ ] |
| Alternative text for images | [ ] |

### Accessibility Notes for Dev
```
[Document any specific accessibility implementation notes here]


```

---

## 7. Data & Edge Cases

### Data Variations
| Scenario | Handled |
|----------|---------|
| Minimum data (1 item) | [ ] |
| Maximum data (many items) | [ ] |
| Long text/names | [ ] |
| Missing optional data | [ ] |
| International characters | [ ] |
| Numbers/currency formatting | [ ] |

### Edge Cases Documented
```
[List specific edge cases and how they should be handled]


```

---

## 8. Integration Points

### API/Backend Requirements
- [ ] Data requirements documented
- [ ] API endpoints identified
- [ ] Loading states account for latency
- [ ] Error handling for API failures defined

### Dependencies
| Dependency | Status |
|------------|--------|
| Backend ready | [ ] Yes [ ] No [ ] N/A |
| Third-party integrations | [ ] Yes [ ] No [ ] N/A |
| Feature flags needed | [ ] Yes [ ] No [ ] N/A |

---

## 9. QA Considerations

### Test Scenarios
| Scenario | Documented |
|----------|------------|
| Happy path | [ ] |
| Error cases | [ ] |
| Edge cases | [ ] |
| Accessibility testing | [ ] |
| Performance considerations | [ ] |

### Known Limitations
```
[Document any known limitations or constraints]


```

---

## 10. Handoff Meeting Notes

### Walkthrough Complete
- [ ] Design walked through with developer(s)
- [ ] Questions answered and documented
- [ ] Edge cases discussed
- [ ] Timeline agreed upon

### Open Questions
```
[List any unresolved questions]


```

### Decisions Made
```
[Document any decisions made during handoff]


```

---

## Final Sign-off

### Designer Confirmation
I confirm that:
- [ ] All design work is complete
- [ ] All states are documented
- [ ] Design system compliance verified
- [ ] Accessibility requirements specified
- [ ] All copy is finalized
- [ ] Edge cases are documented
- [ ] Handoff meeting completed

Designer: _________________ Date: _________

### Developer Acknowledgment
I confirm that:
- [ ] Design is understood
- [ ] Requirements are clear
- [ ] Questions have been answered
- [ ] Implementation can begin

Developer: _________________ Date: _________

---

## Post-Handoff

### During Implementation
- [ ] Designer available for questions
- [ ] Slack/communication channel established
- [ ] Review checkpoints scheduled

### Before Launch
- [ ] Design review of implementation
- [ ] Accessibility audit
- [ ] Cross-browser testing
- [ ] Final approval

---

## END OF HANDOFF CHECKLIST
