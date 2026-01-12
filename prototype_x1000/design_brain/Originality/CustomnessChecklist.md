# Customness Checklist — Final Verification

This checklist is used before final output to verify originality.

---

## Purpose

Final check before delivering any design to ensure it passes originality standards.
This is the LAST gate before output.

---

## The Checklist

Complete this checklist for every BUILD/SHIP deliverable:

```markdown
## Customness Verification: [Project/Screen Name]

Date: [YYYY-MM-DD]
Phase: [BUILD / SHIP]

### 1. Unique Layout Structure?

- [ ] YES — Layout has intentional differences from templates
- [ ] NO — Revision needed

**If YES, describe:** [What makes the layout structure unique]

---

### 2. Unique Hierarchy Decisions?

- [ ] YES — Visual hierarchy is custom to content/users
- [ ] NO — Revision needed

**If YES, describe:** [What hierarchy decisions are specific to this project]

---

### 3. Signature Move Present and Described?

- [ ] YES — Signature move is implemented and documented
- [ ] NO — Revision needed

**Signature Move:**
- Element: [description]
- Location: [where it appears]
- Why it's memorable: [reason]

---

### 4. Brand Cues Aligned with User Vision?

- [ ] YES — Design reflects stated brand/personality goals
- [ ] NO — Revision needed
- [ ] N/A — No brand direction was provided

**Alignment notes:** [How design matches user's vision]

---

### 5. No "UI Kit" Vibes?

- [ ] YES — Design feels custom, not kit-assembled
- [ ] NO — Revision needed

**Why it's not "UI kit":** [Specific reasons]

Common UI kit red flags:
- [ ] NO generic card grids
- [ ] NO default blue + gray scheme
- [ ] NO identical repeated components
- [ ] NO centered-everything layout
- [ ] NO icon-in-circle features
- [ ] NO stock hero sections

---

### 6. Accessibility Not Sacrificed?

- [ ] YES — Originality choices maintain accessibility
- [ ] NO — Revision needed (accessibility > originality)

**Accessibility preserved:**
- [ ] Contrast ratios maintained
- [ ] Focus states visible
- [ ] Touch targets adequate
- [ ] Semantic structure intact
- [ ] Color not only differentiator

---

## Verdict

- [ ] **PASS** — All checks are YES (or N/A where appropriate)
- [ ] **FAIL** — One or more checks are NO

**If FAIL:** List items to revise before proceeding:
1. [Item]
2. [Item]
3. [Item]

---

## Sign-off

Verified by: Design Brain
Date: [YYYY-MM-DD]
```

---

## Quick Version (For Speed)

When time is limited, use this abbreviated check:

| Check | Y/N |
|-------|-----|
| Unique layout? | |
| Unique hierarchy? | |
| Signature move? | |
| Brand aligned? | |
| Not "UI kit"? | |
| A11y preserved? | |

All Y = PASS. Any N = REVISE before output.

---

## When to Use

| Situation | Use Full Checklist | Use Quick Version |
|-----------|-------------------|-------------------|
| Final delivery | YES | NO |
| Major screen | YES | NO |
| Minor update | NO | YES |
| Hotfix | NO | Consistency only |
| Review checkpoint | NO | YES |

---

## Fail Response Protocol

If checklist FAILS:

1. **Stop** — Do not deliver
2. **Identify** — Which check(s) failed
3. **Diagnose** — Why did it fail
4. **Revise** — Make specific changes
5. **Re-check** — Run checklist again
6. **Document** — Log in Memory if significant

---

## Integration with Scoring

This checklist feeds into `eval/UXScore.md`:

| Checklist Item | UXScore Dimension |
|----------------|-------------------|
| Unique layout | Originality (new dimension) |
| Unique hierarchy | Hierarchy |
| Signature move | Originality (new dimension) |
| Brand aligned | Mode Alignment |
| Not UI kit | Originality (new dimension) |
| A11y preserved | Accessibility |

**Originality score mapping:**
- 6/6 checks pass → Score 5
- 5/6 checks pass → Score 4
- 4/6 checks pass → Score 3 (minimum for BUILD)
- <4/6 checks pass → Score <3 (FAIL)

---

## Cross-References

- Gates: `Originality/AntiTemplateGates.md` — Full gate definitions
- Scoring: `eval/UXScore.md` — Quality scoring with originality
- Memory: `Memory/ExperienceLog.md` — Log significant failures

---

## END OF CUSTOMNESS CHECKLIST
