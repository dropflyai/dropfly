# Email Program Audit Template

> A comprehensive audit framework for assessing the health, performance, and compliance of an email marketing program -- covering strategy, list health, deliverability, content, automation, and compliance.

---

## Audit Header

| Field | Input |
|-------|-------|
| Company / Product | |
| Audit Date | |
| Auditor | |
| Scope | [ ] Full program [ ] Deliverability only [ ] Compliance only [ ] Performance only |
| Email Platform | |
| Monthly Send Volume | |
| List Size (total) | |
| Last Audit Date | |
| Overall Grade | [ ] A (Excellent) [ ] B (Good) [ ] C (Needs Improvement) [ ] D (Significant Issues) [ ] F (Critical) |

---

## Section 1: Strategy Assessment

| Question | Answer | Score (1-5) |
|----------|--------|-------------|
| Is there a documented email marketing strategy? | [ ] Yes [ ] No [ ] Partial | |
| Are email goals aligned with business objectives? | [ ] Yes [ ] No [ ] Partial | |
| Is there a defined audience segmentation strategy? | [ ] Yes [ ] No [ ] Partial | |
| Is there a documented email content calendar? | [ ] Yes [ ] No [ ] Partial | |
| Is the email program role clearly defined (team/owner)? | [ ] Yes [ ] No [ ] Partial | |
| Are email KPIs defined and tracked regularly? | [ ] Yes [ ] No [ ] Partial | |
| Is email revenue/pipeline attribution in place? | [ ] Yes [ ] No [ ] Partial | |

**Strategy score:** _____ / 35

**Key finding:** ___________________________________________

**Recommendation:** ___________________________________________

---

## Section 2: List Health Assessment

### List Metrics

| Metric | Current Value | Benchmark | Status |
|--------|-------------|----------|--------|
| Total list size | | | |
| Active subscribers (engaged in 90 days) | | >50% of list | [ ] Healthy [ ] At Risk |
| Inactive subscribers (no engagement 90+ days) | | <30% of list | [ ] Healthy [ ] At Risk |
| Hard bounce rate (last 30 days) | % | <0.5% | [ ] Healthy [ ] At Risk |
| Soft bounce rate (last 30 days) | % | <2% | [ ] Healthy [ ] At Risk |
| Unsubscribe rate (avg per send) | % | <0.3% | [ ] Healthy [ ] At Risk |
| Spam complaint rate (avg per send) | % | <0.05% | [ ] Healthy [ ] At Risk |
| List growth rate (monthly net) | % | Positive | [ ] Healthy [ ] At Risk |
| Email address validity rate | % | >95% | [ ] Healthy [ ] At Risk |

### List Hygiene Practices

| Practice | Status | Notes |
|----------|--------|-------|
| Hard bounces removed automatically | [ ] Yes [ ] No | |
| Inactive subscribers sunseted regularly | [ ] Yes [ ] No | Policy: _____ |
| Re-engagement campaigns run regularly | [ ] Yes [ ] No | Cadence: _____ |
| Email verification on signup | [ ] Yes [ ] No | Tool: _____ |
| Double opt-in implemented | [ ] Yes [ ] No | |
| Preference center available | [ ] Yes [ ] No | |
| Purchased or rented lists used | [ ] Never [ ] Previously [ ] Currently | |

**List health score:** _____ / 35

---

## Section 3: Deliverability Assessment

### Authentication

| Protocol | Status | Configuration |
|----------|--------|---------------|
| SPF | [ ] Pass [ ] Fail [ ] Not configured | Record: _____ |
| DKIM | [ ] Pass [ ] Fail [ ] Not configured | Selector: _____ |
| DMARC | [ ] Pass [ ] Fail [ ] Not configured | Policy: _____ |
| Custom sending domain | [ ] Yes [ ] No | Domain: _____ |
| Dedicated IP | [ ] Yes [ ] No [ ] Shared | IP: _____ |

### Deliverability Metrics

| Metric | Current | Benchmark | Status |
|--------|---------|----------|--------|
| Inbox placement rate | % | >90% | [ ] Healthy [ ] At Risk |
| Spam folder rate | % | <5% | [ ] Healthy [ ] At Risk |
| Missing rate | % | <5% | [ ] Healthy [ ] At Risk |
| Sender reputation score | /100 | >80 | [ ] Healthy [ ] At Risk |
| Blacklist status | [ ] Clean [ ] Listed | | |

### Deliverability Practices

| Practice | Status |
|----------|--------|
| Sending volume consistent (no large spikes) | [ ] Yes [ ] No |
| Warm-up performed for new IPs/domains | [ ] Yes [ ] No [ ] N/A |
| Feedback loops configured (Gmail, Yahoo, Microsoft) | [ ] Yes [ ] No |
| Postmaster tools monitored (Google, Microsoft) | [ ] Yes [ ] No |
| Suppression file maintained | [ ] Yes [ ] No |

**Deliverability score:** _____ / 35

---

## Section 4: Content and Design Assessment

### Email Types Audit

| Email Type | Exists | Frequency | Performance | Grade |
|-----------|--------|-----------|-------------|-------|
| Welcome sequence | [ ] Yes [ ] No | | | |
| Newsletter | [ ] Yes [ ] No | | | |
| Promotional campaigns | [ ] Yes [ ] No | | | |
| Nurture sequences | [ ] Yes [ ] No | | | |
| Re-engagement campaign | [ ] Yes [ ] No | | | |
| Transactional emails | [ ] Yes [ ] No | | | |
| Event/webinar emails | [ ] Yes [ ] No | | | |
| Product updates | [ ] Yes [ ] No | | | |

### Design Review

| Element | Status | Notes |
|---------|--------|-------|
| Responsive design (mobile-friendly) | [ ] Yes [ ] Partial [ ] No | |
| Dark mode compatible | [ ] Yes [ ] Partial [ ] No | |
| Consistent brand identity | [ ] Yes [ ] Partial [ ] No | |
| Clear visual hierarchy | [ ] Yes [ ] Partial [ ] No | |
| Accessible (alt text, contrast, font size) | [ ] Yes [ ] Partial [ ] No | |
| Load time acceptable (<3 seconds) | [ ] Yes [ ] No | |
| Images not oversized | [ ] Yes [ ] No | Total weight: _____ |

### Copy Review

| Element | Status | Notes |
|---------|--------|-------|
| Subject lines compelling and varied | [ ] Yes [ ] No | |
| Preview text optimized | [ ] Yes [ ] No | |
| Clear CTAs (one primary per email) | [ ] Yes [ ] No | |
| Personalization used effectively | [ ] Yes [ ] No | |
| Tone consistent with brand voice | [ ] Yes [ ] No | |
| Content provides genuine value | [ ] Yes [ ] No | |
| Copy scannable (headings, bullets) | [ ] Yes [ ] No | |

**Content score:** _____ / 35

---

## Section 5: Automation Assessment

| Automation | Status | Emails | Performance |
|-----------|--------|--------|------------|
| Welcome sequence | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Onboarding sequence | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Lead nurture | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Re-engagement | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Post-purchase | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Cart/browse abandonment | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Trial conversion | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |
| Renewal/upsell | [ ] Active [ ] Inactive [ ] Not built | # | Open: ___% Click: ___% |

**Automation score:** _____ / 20

---

## Section 6: Compliance Assessment

| Requirement | Status | Notes |
|------------|--------|-------|
| **CAN-SPAM** | | |
| Unsubscribe mechanism in all commercial emails | [ ] Pass [ ] Fail | |
| Physical address in all emails | [ ] Pass [ ] Fail | |
| Unsubscribe processed within 10 business days | [ ] Pass [ ] Fail | |
| Subject lines not misleading | [ ] Pass [ ] Fail | |
| **GDPR** (if applicable) | | |
| Consent records maintained | [ ] Pass [ ] Fail [ ] N/A | |
| Data processing agreement with email provider | [ ] Pass [ ] Fail [ ] N/A | |
| Right to erasure process | [ ] Pass [ ] Fail [ ] N/A | |
| Privacy policy referenced | [ ] Pass [ ] Fail [ ] N/A | |
| **CASL** (if applicable) | | |
| Express consent obtained | [ ] Pass [ ] Fail [ ] N/A | |
| Consent records include date, method, purpose | [ ] Pass [ ] Fail [ ] N/A | |
| **General** | | |
| Preference center available | [ ] Pass [ ] Fail | |
| Suppression lists maintained | [ ] Pass [ ] Fail | |

**Compliance score:** _____ / 30

---

## Section 7: Overall Assessment and Recommendations

### Scoring Summary

| Area | Score | Max | Grade |
|------|-------|-----|-------|
| Strategy | | 35 | |
| List Health | | 35 | |
| Deliverability | | 35 | |
| Content & Design | | 35 | |
| Automation | | 20 | |
| Compliance | | 30 | |
| **Total** | | **190** | |

### Grade Scale

| Grade | Score Range | Description |
|-------|-----------|-------------|
| A | 160-190 | Excellent -- optimizing at the margins |
| B | 130-159 | Good -- some improvement opportunities |
| C | 95-129 | Needs improvement -- significant gaps |
| D | 60-94 | Significant issues -- urgent remediation needed |
| F | <60 | Critical -- fundamental problems requiring overhaul |

### Top 5 Findings

| # | Finding | Severity | Area | Recommendation |
|---|---------|---------|------|---------------|
| 1 | | [ ] Critical [ ] High [ ] Medium [ ] Low | | |
| 2 | | [ ] Critical [ ] High [ ] Medium [ ] Low | | |
| 3 | | [ ] Critical [ ] High [ ] Medium [ ] Low | | |
| 4 | | [ ] Critical [ ] High [ ] Medium [ ] Low | | |
| 5 | | [ ] Critical [ ] High [ ] Medium [ ] Low | | |

### Action Plan

| Priority | Action | Owner | Deadline | Status |
|----------|--------|-------|----------|--------|
| 1 | | | | [ ] Not started [ ] In progress [ ] Complete |
| 2 | | | | [ ] Not started [ ] In progress [ ] Complete |
| 3 | | | | [ ] Not started [ ] In progress [ ] Complete |
| 4 | | | | [ ] Not started [ ] In progress [ ] Complete |
| 5 | | | | [ ] Not started [ ] In progress [ ] Complete |

---

*Template version: 1.0*
*Brain: Email Brain*
