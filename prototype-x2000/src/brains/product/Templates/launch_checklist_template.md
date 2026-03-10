# Launch Checklist Template

## Usage Instructions

This template provides a comprehensive checklist for launching a product feature. It covers every function that must be ready before, during, and after launch. Adapt based on your launch tier: Tier 1 requires all sections; Tier 3-4 can abbreviate or skip marketing, sales, and CS sections.

Reference: `08_launch/launch_execution.md` and `08_launch/gtm_strategy.md` for detailed guidance.
Reference: `Patterns/feature_launch_pattern.md` for the full launch pattern.

---

# Launch Checklist: [Feature/Product Name]

| Field | Value |
|-------|-------|
| **PM Owner** | [Name] |
| **Engineering Lead** | [Name] |
| **Design Lead** | [Name] |
| **Launch Tier** | [1 / 2 / 3 / 4] |
| **Target Launch Date** | [YYYY-MM-DD] |
| **Feature Flag Name** | [flag-name] |
| **PRD Link** | [Link] |
| **Design Spec Link** | [Link] |

---

## Pre-Launch Checklist

### Product Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | PRD approved with success metrics defined | PM | [ ] | |
| 2 | Design specs complete and reviewed | Design | [ ] | |
| 3 | Acceptance criteria written (Given/When/Then) | PM | [ ] | |
| 4 | Edge cases documented (empty, error, loading, overflow) | PM + Design | [ ] | |
| 5 | Kill criteria defined (when to rollback or stop) | PM | [ ] | |
| 6 | Launch tier assigned and GTM plan aligned | PM | [ ] | |
| 7 | Post-launch review scheduled | PM | [ ] | |

### Engineering Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Feature implemented behind feature flag | Engineering | [ ] | |
| 2 | Feature flag targeting rules configured | Engineering | [ ] | |
| 3 | All acceptance criteria passing | QA | [ ] | |
| 4 | Unit tests and integration tests written | Engineering | [ ] | |
| 5 | Performance requirements met (latency, throughput) | Engineering | [ ] | |
| 6 | Security review completed (if applicable) | Security | [ ] | |
| 7 | Accessibility requirements met | Design + Engineering | [ ] | |
| 8 | Error handling implemented for all failure modes | Engineering | [ ] | |
| 9 | Rollback plan documented and tested | Engineering | [ ] | |
| 10 | Rollback criteria defined (auto and manual triggers) | Engineering + PM | [ ] | |
| 11 | Database migrations tested (if applicable) | Engineering | [ ] | |
| 12 | API backward compatibility verified (if applicable) | Engineering | [ ] | |
| 13 | Load testing completed (for high-traffic features) | Engineering | [ ] | |

### Analytics Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Analytics events instrumented per tracking plan | Engineering | [ ] | |
| 2 | Event tracking verified in staging/QA environment | Analytics + QA | [ ] | |
| 3 | Monitoring dashboard built | PM + Analytics | [ ] | |
| 4 | Alert thresholds configured | Engineering | [ ] | |
| 5 | Baseline metrics recorded for comparison | PM | [ ] | |

### Design Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | All states designed (default, loading, empty, error, success) | Design | [ ] | |
| 2 | Responsive behavior verified across breakpoints | Design + QA | [ ] | |
| 3 | Design review of implemented feature complete | Design | [ ] | |
| 4 | Marketing assets created (screenshots, GIFs, hero images) | Design | [ ] | |
| 5 | In-app announcement designed (modal, banner, or tooltip) | Design | [ ] | |

### Beta Program (Tier 1-2 only)

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Beta participants recruited | PM | [ ] | Target: [N] participants |
| 2 | Beta kickoff completed | PM | [ ] | |
| 3 | Beta feedback collected and analyzed | PM | [ ] | |
| 4 | Beta exit criteria met | PM | [ ] | |
| 5 | Beta findings incorporated into final release | PM + Engineering | [ ] | |
| 6 | Beta participant testimonials collected (optional) | PM | [ ] | |

### Documentation Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Help documentation / knowledge base article written | PM / Tech Writer | [ ] | |
| 2 | FAQ prepared for common questions | PM | [ ] | |
| 3 | API documentation updated (if applicable) | Engineering | [ ] | |
| 4 | Changelog entry drafted | PM | [ ] | |
| 5 | Release notes drafted (for Tier 1-2) | PM | [ ] | |

### Customer Communication Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Blog post drafted and reviewed (Tier 1-2) | Marketing + PM | [ ] | |
| 2 | Email announcement drafted and reviewed (Tier 1-2) | Marketing | [ ] | |
| 3 | In-app announcement configured | PM + Engineering | [ ] | |
| 4 | Social media posts drafted (Tier 1) | Marketing | [ ] | |
| 5 | Customer-facing roadmap updated | PM | [ ] | |

### Sales Enablement (Tier 1-2 only)

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Sales team briefed on new capability | PM | [ ] | |
| 2 | Demo script / demo environment prepared | PM + Sales | [ ] | |
| 3 | Objection handling guide updated | PM + Sales | [ ] | |
| 4 | Competitive positioning updated | PM | [ ] | |
| 5 | Pricing / packaging implications communicated | PM | [ ] | |

### Customer Success Enablement (Tier 1-2 only)

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | CS team briefed on customer impact | PM + CS | [ ] | |
| 2 | Customer communication plan aligned | PM + CS | [ ] | |
| 3 | Migration support plan in place (if applicable) | CS | [ ] | |
| 4 | Training materials updated | CS | [ ] | |

### Support Readiness

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Support team briefed on new feature | PM + Support | [ ] | |
| 2 | Knowledge base updated with new feature documentation | Support | [ ] | |
| 3 | Expected support ticket categories identified | PM + Support | [ ] | |
| 4 | Escalation path defined for feature-related issues | Support + Engineering | [ ] | |

---

## Launch Day Checklist

### Launch Day Run-of-Show

| Time | Action | Owner | Status |
|------|--------|-------|--------|
| [Time] | Final deployment verification | Engineering | [ ] |
| [Time] | Feature flag enabled for internal team | Engineering | [ ] |
| [Time] | Internal dogfooding and smoke test | Team | [ ] |
| [Time] | Feature flag enabled for 1-5% (canary) | Engineering | [ ] |
| [Time] | Canary health check (errors, latency, core metrics) | Engineering + PM | [ ] |
| [Time] | Expand to 10-25% | Engineering | [ ] |
| [Time] | Monitoring review | PM + Engineering | [ ] |
| [Time] | Expand to 50-100% | Engineering | [ ] |
| [Time] | Publish blog post | Marketing | [ ] |
| [Time] | Send email announcement | Marketing | [ ] |
| [Time] | Activate in-app announcement | PM | [ ] |
| [Time] | Post on social media | Marketing | [ ] |
| [Time] | Notify sales team | PM | [ ] |
| [Time] | End-of-day status update | PM | [ ] |

### Rollback Criteria

| Trigger | Threshold | Action | Owner |
|---------|-----------|--------|-------|
| Error rate | > [X]x baseline for > 5 min | Auto-rollback | Engineering |
| P95 latency | > [X]x baseline for > 10 min | Auto-rollback | Engineering |
| Core metric drop | > [X]% below baseline | Manual review -> rollback | PM + Engineering |
| P0 bug reported | Any | Immediate rollback | Engineering |
| Support ticket spike | > [X]x baseline | Investigate -> possible rollback | PM + Support |

---

## Post-Launch Checklist

### Week 1 Post-Launch

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Daily monitoring review (errors, performance, adoption) | PM + Engineering | [ ] | |
| 2 | Customer feedback channels monitored | PM + CS | [ ] | |
| 3 | Support ticket volume reviewed | Support + PM | [ ] | |
| 4 | Initial adoption metrics compared to targets | PM | [ ] | |
| 5 | Quick fixes deployed for any issues discovered | Engineering | [ ] | |

### Week 2-4 Post-Launch

| # | Item | Owner | Status | Notes |
|---|------|-------|--------|-------|
| 1 | Weekly monitoring review | PM | [ ] | |
| 2 | Adoption and activation trends tracked | PM | [ ] | |
| 3 | Customer feedback synthesized | PM | [ ] | |
| 4 | Feature flag cleanup (remove flag if 100% shipped) | Engineering | [ ] | |
| 5 | Post-launch review meeting conducted | PM | [ ] | |

### Post-Launch Review

| Metric | Target | Actual | Status |
|--------|--------|--------|--------|
| Adoption (30-day) | [Target] | [Actual] | [ ] Pass [ ] Miss |
| Activation | [Target] | [Actual] | [ ] Pass [ ] Miss |
| Retention (30-day) | [Target] | [Actual] | [ ] Pass [ ] Miss |
| Primary metric | [Target] | [Actual] | [ ] Pass [ ] Miss |
| Guardrail metric | [Threshold] | [Actual] | [ ] Pass [ ] Miss |
| Revenue impact | [Target] | [Actual] | [ ] Pass [ ] Miss |
| Support impact | [< X% increase] | [Actual] | [ ] Pass [ ] Miss |
| Incidents during rollout | [0 P0/P1] | [Actual] | [ ] Pass [ ] Miss |

### Post-Launch Decision

| Decision | Check |
|----------|-------|
| [ ] **Full ship** — Feature met targets; move to maintenance | |
| [ ] **Iterate** — Specific improvements needed: ___ | |
| [ ] **Partial rollback** — Disable for segment ___ due to ___ | |
| [ ] **Full rollback** — Feature not delivering value; reason: ___ | |

### Process Learnings

| What Went Well | What Could Improve |
|---------------|-------------------|
| [Learning 1] | [Improvement 1] |
| [Learning 2] | [Improvement 2] |

### Next Steps

| Action | Owner | Due Date |
|--------|-------|----------|
| [Action item 1] | [Name] | [Date] |
| [Action item 2] | [Name] | [Date] |
| [Action item 3] | [Name] | [Date] |

---

## Launch Communication Summary

| Audience | Channel | Timing | Status |
|----------|---------|--------|--------|
| Internal team | Slack announcement | Launch day | [ ] |
| Engineering | Deployment notification | Launch day | [ ] |
| Sales | Email + enablement session | T-3 days to launch day | [ ] |
| CS | Email + training | T-3 days to launch day | [ ] |
| Support | Knowledge base + briefing | T-2 days to launch day | [ ] |
| Customers (all) | Changelog entry | Launch day | [ ] |
| Customers (targeted) | Email announcement | Launch day | [ ] |
| Customers (in-app) | In-app announcement | Launch day | [ ] |
| Public | Blog post | Launch day | [ ] |
| Social media | Social posts | Launch day | [ ] |
| Press (Tier 1 only) | Press release / briefing | Launch day | [ ] |

---

## Checklist Adaptation by Tier

### Tier 1 (Flagship Launch)
All sections required. Full cross-functional coordination. Full marketing and PR.

### Tier 2 (Significant Feature)
All sections required except PR/press. Sales and CS enablement required.

### Tier 3 (Incremental Improvement)
Product, Engineering, Analytics, and Documentation sections required. Communication limited to changelog and in-app. Sales/CS briefed but no formal enablement.

### Tier 4 (Silent Ship)
Product and Engineering sections only. Changelog entry. No external communication.

---

## Template Maintenance

This checklist should be reviewed and updated after every Tier 1-2 launch based on process learnings. Add new items that were missed. Remove items that are no longer relevant. The goal is a continuously improving launch process.

Last updated: [YYYY-MM-DD]
Updated by: [Name]
Reason: [What changed and why]
