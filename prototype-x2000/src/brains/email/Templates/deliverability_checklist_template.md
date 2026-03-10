# Email Deliverability Checklist Template

> A comprehensive checklist for ensuring optimal email deliverability -- covering authentication, infrastructure, list hygiene, content, and monitoring. Use this checklist before launching a new email program, migrating platforms, or diagnosing deliverability issues.

---

## Checklist Header

| Field | Input |
|-------|-------|
| Sending Domain | |
| Sending IP(s) | |
| Email Platform | |
| Assessment Date | |
| Assessor | |
| Monthly Send Volume | |
| Overall Status | [ ] Ready [ ] Issues Found [ ] Critical Issues |

---

## Section 1: Authentication

### DNS Records

| Check | Status | Details |
|-------|--------|---------|
| **SPF Record** | | |
| SPF record published on sending domain | [ ] Pass [ ] Fail | Record: _____ |
| SPF includes email provider's sending servers | [ ] Pass [ ] Fail | |
| SPF does not exceed 10 DNS lookups | [ ] Pass [ ] Fail | Lookup count: _____ |
| SPF record ends with ~all or -all | [ ] Pass [ ] Fail | |
| **DKIM** | | |
| DKIM configured for sending domain | [ ] Pass [ ] Fail | Selector: _____ |
| DKIM key is 2048-bit (not 1024-bit) | [ ] Pass [ ] Fail | |
| DKIM signing verified on test sends | [ ] Pass [ ] Fail | |
| DKIM alignment passes (d= matches From domain) | [ ] Pass [ ] Fail | |
| **DMARC** | | |
| DMARC record published | [ ] Pass [ ] Fail | Policy: _____ |
| DMARC policy at minimum p=quarantine | [ ] Pass [ ] Fail | |
| DMARC reporting configured (rua=) | [ ] Pass [ ] Fail | |
| DMARC alignment mode set (relaxed or strict) | [ ] Pass [ ] Fail | |
| **BIMI (Optional)** | | |
| BIMI record published | [ ] Pass [ ] Fail [ ] N/A | |
| VMC certificate obtained | [ ] Pass [ ] Fail [ ] N/A | |

### Verification Test

| Test | Status | Tool Used |
|------|--------|-----------|
| Send test email and verify SPF passes | [ ] Pass [ ] Fail | |
| Send test email and verify DKIM passes | [ ] Pass [ ] Fail | |
| Send test email and verify DMARC passes | [ ] Pass [ ] Fail | |
| Check authentication headers in received email | [ ] Pass [ ] Fail | |

---

## Section 2: Infrastructure

### Sending Infrastructure

| Check | Status | Notes |
|-------|--------|-------|
| **IP Configuration** | | |
| Dedicated IP for transactional email | [ ] Yes [ ] No [ ] Shared OK | |
| Dedicated IP for marketing email | [ ] Yes [ ] No [ ] Shared OK | |
| IP reputation clean (not blacklisted) | [ ] Pass [ ] Fail | Score: _____ |
| IP warmed up (if new) | [ ] Complete [ ] In progress [ ] Not needed | |
| **Domain Configuration** | | |
| Custom sending domain (not provider default) | [ ] Yes [ ] No | Domain: _____ |
| Custom return-path/bounce domain | [ ] Yes [ ] No | |
| Custom tracking domain (link/open tracking) | [ ] Yes [ ] No | |
| MX records configured for bounce handling | [ ] Yes [ ] No | |
| **Separation** | | |
| Marketing and transactional on separate IPs/subdomains | [ ] Yes [ ] No | |
| High-risk sends isolated from main domain | [ ] Yes [ ] No [ ] N/A | |

### Platform Configuration

| Check | Status | Notes |
|-------|--------|-------|
| Bounce handling configured (hard bounce removal) | [ ] Yes [ ] No | |
| Complaint handling configured (feedback loops) | [ ] Yes [ ] No | |
| Suppression list functional | [ ] Yes [ ] No | |
| Unsubscribe processing automated | [ ] Yes [ ] No | |
| List-Unsubscribe header included | [ ] Yes [ ] No | |
| One-click unsubscribe (RFC 8058) supported | [ ] Yes [ ] No | |
| Rate limiting configured | [ ] Yes [ ] No | Rate: _____ |

---

## Section 3: List Hygiene

### List Quality

| Check | Status | Notes |
|-------|--------|-------|
| All email addresses collected via opt-in | [ ] Yes [ ] No | |
| Double opt-in implemented (recommended) | [ ] Yes [ ] No | |
| Email verification at point of collection | [ ] Yes [ ] No | Tool: _____ |
| List cleaned of invalid/risky addresses | [ ] Yes [ ] No | Last cleaned: _____ |
| Role addresses removed (info@, admin@, sales@) | [ ] Yes [ ] No | |
| Known spam traps checked | [ ] Yes [ ] No | Tool: _____ |
| Duplicate addresses removed | [ ] Yes [ ] No | |

### List Maintenance

| Practice | Status | Cadence |
|----------|--------|---------|
| Hard bounces removed automatically | [ ] Yes [ ] No | |
| Soft bounces suppressed after _____ attempts | [ ] Yes [ ] No | Threshold: _____ |
| Inactive subscribers sunsetted | [ ] Yes [ ] No | Policy: _____ days |
| Re-engagement campaigns before sunset | [ ] Yes [ ] No | |
| New subscribers validated before first send | [ ] Yes [ ] No | |
| List segmented by engagement level | [ ] Yes [ ] No | |

---

## Section 4: Content and Sending Practices

### Content Checks

| Check | Status | Notes |
|-------|--------|-------|
| Subject lines free of spam trigger words | [ ] Yes [ ] No | |
| From name recognizable and consistent | [ ] Yes [ ] No | |
| Reply-to monitored (not no-reply@) | [ ] Yes [ ] No | |
| Text-to-image ratio reasonable (60%+ text) | [ ] Yes [ ] No | |
| Plain text version included | [ ] Yes [ ] No | |
| No URL shorteners in links (bit.ly, etc.) | [ ] Yes [ ] No | |
| Links point to reputable domains (not flagged) | [ ] Yes [ ] No | |
| HTML clean and well-formed | [ ] Yes [ ] No | |
| No embedded forms or JavaScript | [ ] Yes [ ] No | |
| No excessive use of ALL CAPS or exclamation marks | [ ] Yes [ ] No | |

### Sending Practices

| Check | Status | Notes |
|-------|--------|-------|
| Consistent sending schedule (no large volume spikes) | [ ] Yes [ ] No | |
| Sending volume appropriate for IP/domain age | [ ] Yes [ ] No | |
| Engagement-based sending (most engaged first) | [ ] Yes [ ] No | |
| Send-time optimization used | [ ] Yes [ ] No | |
| Frequency cap in place (max emails per contact per day/week) | [ ] Yes [ ] No | Cap: _____ |
| Sending to engaged segments first (for new IPs) | [ ] Yes [ ] No | |

---

## Section 5: Monitoring and Alerting

### Monitoring Setup

| Monitor | Configured | Tool | Alert Threshold |
|---------|-----------|------|----------------|
| Delivery rate | [ ] Yes [ ] No | | <98% |
| Bounce rate | [ ] Yes [ ] No | | >1% |
| Spam complaint rate | [ ] Yes [ ] No | | >0.05% |
| Blacklist monitoring | [ ] Yes [ ] No | | Any listing |
| Inbox placement rate | [ ] Yes [ ] No | | <90% |
| Domain reputation | [ ] Yes [ ] No | | Score change >10% |
| IP reputation | [ ] Yes [ ] No | | Score change >10% |

### Postmaster Tools

| Provider | Configured | URL |
|----------|-----------|-----|
| Google Postmaster Tools | [ ] Yes [ ] No | postmaster.google.com |
| Microsoft SNDS | [ ] Yes [ ] No | sendersupport.olc.protection.outlook.com |
| Yahoo Postmaster | [ ] Yes [ ] No | senders.yahooinc.com |

### Feedback Loops

| Provider | Configured | Status |
|----------|-----------|--------|
| Gmail (via Postmaster Tools) | [ ] Yes [ ] No | |
| Microsoft (JMRP) | [ ] Yes [ ] No | |
| Yahoo | [ ] Yes [ ] No | |
| Comcast | [ ] Yes [ ] No [ ] N/A | |
| AOL | [ ] Yes [ ] No [ ] N/A | |

---

## Section 6: IP Warm-Up Plan (If New IP)

### Warm-Up Schedule

| Day | Daily Volume | Target Segment | Notes |
|-----|------------|---------------|-------|
| 1-2 | 500 | Most engaged (opened in last 7 days) | |
| 3-4 | 1,000 | Most engaged | |
| 5-7 | 2,500 | Engaged (opened in last 30 days) | |
| 8-10 | 5,000 | Engaged | |
| 11-14 | 10,000 | Active (opened in last 60 days) | |
| 15-21 | 25,000 | Active | |
| 22-28 | 50,000 | Full list (active + less engaged) | |
| 29+ | Full volume | Full list | Monitor for 2 more weeks |

### Warm-Up Monitoring

| Day | Delivery Rate | Bounce Rate | Spam Rate | Action |
|-----|-------------|------------|----------|--------|
| | % | % | % | |
| | % | % | % | |
| | % | % | % | |

**Warm-up abort criteria:** Stop and investigate if delivery rate drops below 95% or spam complaint rate exceeds 0.1% on any day.

---

## Section 7: Troubleshooting Checklist

### If Deliverability Drops Suddenly

| Check | Status | Action |
|-------|--------|--------|
| Check blacklist status | [ ] Clean [ ] Listed | Request delisting, identify cause |
| Check authentication (SPF/DKIM/DMARC) | [ ] Passing [ ] Failing | Fix DNS records immediately |
| Check bounce rates | [ ] Normal [ ] Elevated | Clean list, investigate source |
| Check spam complaint rates | [ ] Normal [ ] Elevated | Review recent content and targeting |
| Check sending volume changes | [ ] Stable [ ] Spike | Throttle back to normal levels |
| Check for content changes | [ ] Stable [ ] Changed | Revert recent content changes |
| Check for list source changes | [ ] Stable [ ] New source | Quarantine new list source |
| Check Google Postmaster Tools | [ ] Stable [ ] Degraded | Follow Google-specific recommendations |
| Contact email provider support | [ ] Not needed [ ] In progress | |

---

## Section 8: Summary and Action Items

### Deliverability Health Score

| Area | Score | Max | Status |
|------|-------|-----|--------|
| Authentication | | 20 | [ ] Green [ ] Yellow [ ] Red |
| Infrastructure | | 20 | [ ] Green [ ] Yellow [ ] Red |
| List Hygiene | | 20 | [ ] Green [ ] Yellow [ ] Red |
| Content & Sending | | 20 | [ ] Green [ ] Yellow [ ] Red |
| Monitoring | | 20 | [ ] Green [ ] Yellow [ ] Red |
| **Total** | | **100** | |

### Priority Actions

| Priority | Action | Owner | Deadline | Status |
|----------|--------|-------|----------|--------|
| 1 (Critical) | | | | [ ] |
| 2 (High) | | | | [ ] |
| 3 (Medium) | | | | [ ] |
| 4 (Low) | | | | [ ] |

---

**Deliverability is the foundation of email marketing. Without inbox placement, nothing else matters -- no amount of great copy, beautiful design, or clever segmentation helps if the email lands in spam. Audit deliverability quarterly and after any significant change to infrastructure, volume, or sending practices.**

---

*Template version: 1.0*
*Brain: Email Brain*
*Reference: Patterns/transactional_email_pattern.md, 01_foundations/deliverability.md*
