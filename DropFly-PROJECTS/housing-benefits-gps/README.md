# Housing & Benefits GPS

**Type:** Mobile-First Web App (Crisis Navigation)
**Status:** In Progress — Design Complete, Engineering Pending
**Created:** January 2025

---

## Overview

A mobile-first "GPS for help" that guides low-income renters and families through safety-net programs (rent relief, food assistance, cash benefits, health coverage, childcare, housing vouchers).

**Target Users:** Low-income adults, mobile-first, low digital literacy, in crisis situations.

**MVP Scope:** US nationwide, LA County deep configuration.

---

## Project Structure

```
housing-benefits-gps/
├── .claude/                    # Claude instructions (from template)
├── credentials/                # API keys, secrets (NOT in git)
├── docs/
│   └── design/                 # Design handoff from Design Brain
│       ├── DesignTokens.md     # Colors, typography, spacing
│       ├── ComponentSpec.md    # UI component specifications
│       ├── ScreenSpec.md       # Screen-by-screen layouts
│       └── HandoffChecklist.md # Engineering implementation guide
├── scripts/                    # Automation scripts
├── src/                        # Source code (pending)
└── README.md                   # This file
```

---

## Design System Summary

| Element | Choice |
|---------|--------|
| Color Palette | Sage Trust (Primary: #2D6A4F) |
| Typography | Lato (Google Fonts) |
| Icons | Phosphor Icons (Rounded) |
| Border Radius | 12px (buttons, inputs), 16px (cards) |
| Design Principles | Dignity-first, one action per screen, accessible |

---

## Key Screens

1. **Landing Page** — First impression, CTA to start
2. **Sign Up Flow** — Phone verification, consent
3. **Intake Flow** — 12 questions, one per screen
4. **Home Screen** — Personalized tiles ("Your Plan")
5. **Tile Wizards** — Step-by-step guided flows
6. **Document Upload** — Camera/gallery uploads

---

## Next Steps

1. Engineering Brain to read `docs/design/HandoffChecklist.md`
2. Set up project infrastructure (React/Next.js recommended)
3. Implement design tokens and component library
4. Build screens in order specified in checklist

---

## Brain Involvement

| Brain | Role | Status |
|-------|------|--------|
| Design Brain | UI/UX design, design system | ✅ Complete |
| Engineering Brain | Implementation | ⏳ Pending |
| Product Brain | PRD, requirements | ✅ Complete (external) |

---

## References

- PRD: Provided by user (Guided Safety-Net App spec)
- Design Research: Fresh EBT, Dave, Chime (fintech for underserved)
- Accessibility: WCAG 2.1 AA compliance target

---

**Project Owner:** Rio Allen
**Last Updated:** January 2025
