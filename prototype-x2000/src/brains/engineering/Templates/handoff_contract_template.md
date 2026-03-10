# Brain Handoff Contract Template

A handoff contract is a formal agreement between two brains when work is delegated from one specialist to another. It ensures clarity of expectations, quality standards, and escalation procedures. Every cross-brain delegation MUST use this template.

---

## Contract Fields

### 1. Routing Information

| Field | Value |
|-------|-------|
| **Contract ID** | `HC-YYYY-MM-DD-NNN` |
| **Source Brain** | _(brain initiating the handoff)_ |
| **Target Brain** | _(brain receiving the work)_ |
| **Initiated By** | _(CEO Brain / direct call)_ |
| **Date** | `YYYY-MM-DD` |
| **Priority** | `P0-Critical` / `P1-High` / `P2-Medium` / `P3-Low` |

---

### 2. Task Description

**Summary:** _(one-sentence description of the delegated work)_

**Context:** _(why this work is needed, what triggered it, and any relevant background the target brain needs to understand the request)_

**Dependencies:** _(list any upstream outputs, files, or data the target brain will need access to)_

---

### 3. Expected Deliverable

| Attribute | Specification |
|-----------|---------------|
| **Format** | _(code, document, configuration, design artifact, etc.)_ |
| **Scope** | _(what is included and what is explicitly excluded)_ |
| **Output Location** | _(file path or directory where deliverable should be placed)_ |
| **Output Contract** | _(reference to OutputContracts.md entry if applicable)_ |

---

### 4. Quality Requirements

| Requirement | Threshold |
|-------------|-----------|
| **Minimum Quality Score** | _(e.g., 8/10 per Score.md)_ |
| **Verification Level** | `L1-Spot-Check` / `L2-Standard` / `L3-Full-Verification` |
| **Must Pass Checklist** | _(reference specific Checklist.md sections)_ |
| **Automated Tests Required** | `Yes` / `No` _(if yes, specify type)_ |

---

### 5. Verification Criteria

Evidence the target brain must provide to confirm the work is complete:

- [ ] _(criterion 1 -- e.g., "All tests pass with zero failures")_
- [ ] _(criterion 2 -- e.g., "Screenshot of working UI attached")_
- [ ] _(criterion 3 -- e.g., "Migration runs successfully on staging")_
- [ ] _(criterion 4 -- e.g., "Code review checklist completed")_

**Verification Method:** _(manual review, automated test suite, Playwright, etc.)_

---

### 6. Timeout and Escalation Policy

| Condition | Action |
|-----------|--------|
| **Expected Duration** | _(estimated time to complete)_ |
| **Soft Deadline** | _(date/time -- triggers a status check)_ |
| **Hard Deadline** | _(date/time -- triggers escalation)_ |
| **Escalation Target** | CEO Brain |
| **Blocked Procedure** | If blocked, notify source brain immediately with blocker details |
| **Failure Procedure** | Document failure reason, partial outputs, and recommended next steps |

---

## Example: Filled-In Contract

**Routing:** Contract `HC-2025-01-15-001` | Engineering Brain -> Design Brain | Initiated by CEO Brain | `2025-01-15` | `P1-High`

**Task:** Design a responsive dashboard layout for the analytics module. The analytics feature is in Implementation phase. Engineering needs a finalized layout with component hierarchy, spacing tokens, and responsive breakpoints. Dependencies: `docs/PRD.md`, `design_brain/Tokens/`.

**Deliverable:** Figma export + component spec | Dashboard main view, widget cards, chart containers (excludes settings page) | Output to `design_brain/Deliverables/analytics-dashboard/`

**Quality:** Min score 8/10 | L2-Standard verification | Must pass: Accessibility (WCAG AA), Responsive (3 breakpoints)

**Verification Criteria:**
- [ ] Layout covers desktop (1440px), tablet (768px), and mobile (375px)
- [ ] All spacing uses design tokens from the token system
- [ ] Color contrast meets WCAG AA (4.5:1 minimum)
- [ ] Component spec includes all interactive states

**Timeline:** Expected 2 days | Soft deadline 2025-01-16 | Hard deadline 2025-01-17 | Escalate to CEO Brain

---

## Instructions for Use

1. **Copy this template** when initiating any cross-brain delegation.
2. **Fill in all fields.** Incomplete contracts are invalid and the target brain may reject them.
3. **Both brains acknowledge** the contract before work begins. The source brain files the contract; the target brain confirms receipt.
4. **Store completed contracts** in the source brain's `Memory/` directory for audit trail.
5. **Update the contract** if scope changes. Scope changes require re-acknowledgment from both brains.
6. **Close the contract** by marking all verification criteria as complete and recording the outcome in `Memory/ExperienceLog.md`.
7. **Escalate immediately** if a hard deadline is missed or work is blocked. Do not wait silently.

---

**A handoff without a contract is a handoff without accountability.**
