# Bug Report Template

## What This Enables

This template provides a standardized structure for defect reporting that ensures every bug report contains sufficient information for reproduction, diagnosis, and resolution without requiring the reporter to be present. A well-written bug report reduces the time from discovery to fix by 50-80% compared to informal reports, based on industry studies of defect lifecycle efficiency.

---

## Template

### Bug Report: [Brief, descriptive title]

---

#### Summary

[One or two sentences describing the defect. Focus on what is wrong, not why.]

---

#### Classification

| Field | Value |
|-------|-------|
| **Severity** | Critical / High / Medium / Low |
| **Priority** | P1 / P2 / P3 / P4 |
| **Type** | Functional / Visual / Performance / Security / Accessibility / Data |
| **Component** | [Affected component, service, or module] |
| **Version** | [Application version or commit hash where the defect was found] |
| **Reporter** | [Name] |
| **Date Found** | [Date] |
| **Assigned To** | [Name or "Unassigned"] |

#### Severity Guide

| Level | Definition | Example |
|-------|-----------|---------|
| Critical | System is unusable, data loss, security breach | Payment processing fails for all users |
| High | Major feature broken, no workaround | Users cannot upload files |
| Medium | Feature partially broken, workaround exists | Search returns results in wrong order |
| Low | Minor issue, cosmetic, no functional impact | Tooltip text has typo |

#### Priority Guide

| Level | Response Time | Definition |
|-------|--------------|-----------|
| P1 | Immediate (within 4 hours) | Customer-facing impact, revenue loss, security |
| P2 | Within 1 business day | Significant user impact, but workaround exists |
| P3 | Within current sprint | Minor impact, can wait for normal development cycle |
| P4 | Backlog | Low impact, address when convenient |

---

#### Environment

| Field | Value |
|-------|-------|
| **Operating System** | [e.g., macOS 14.2, Windows 11, iOS 17.1] |
| **Browser** | [e.g., Chrome 120, Firefox 121, Safari 17] |
| **Device** | [e.g., MacBook Pro M2, iPhone 15, Pixel 8] |
| **Screen Resolution** | [e.g., 1920x1080, 390x844] |
| **Environment** | [Production / Staging / Dev / Local] |
| **User Role** | [e.g., Admin, Member, Guest] |
| **Feature Flags** | [List any active feature flags] |
| **Network** | [WiFi, 4G, etc. -- if relevant] |

---

#### Steps to Reproduce

**Preconditions**: [Any setup required before starting, e.g., "Logged in as admin user with at least one project"]

1. [Step 1: Navigate to /dashboard]
2. [Step 2: Click "Create New Project" button]
3. [Step 3: Fill in project name with "Test Project"]
4. [Step 4: Click "Save" button]
5. [Step 5: Observe the result]

**Reproducibility**: Always / Intermittent ([X] out of [Y] attempts) / One-time

---

#### Expected Result

[Describe what should happen according to the specification, design, or reasonable user expectation.]

---

#### Actual Result

[Describe what actually happens. Be specific and factual.]

---

#### Evidence

**Screenshots/Video:**
[Attach or link screenshots, screen recordings, or GIFs showing the defect]

**Console Errors:**
```
[Paste any browser console errors, if applicable]
```

**Network Errors:**
```
[Paste relevant network request/response details, if applicable]
```

**Logs:**
```
[Paste relevant server or application logs, if applicable]
```

---

#### Workaround

[If a workaround exists, describe it here. If no workaround exists, state "No known workaround."]

---

#### Impact Analysis

| Dimension | Assessment |
|-----------|-----------|
| **Users affected** | [All / Segment / Specific account] |
| **Revenue impact** | [Direct revenue loss / Indirect / None] |
| **Data impact** | [Data loss / Data corruption / None] |
| **Compliance impact** | [Regulatory violation / None] |

---

#### Related Items

| Relation | Item |
|----------|------|
| Related defects | [Links to related bug reports] |
| Related PRs | [Links to related pull requests] |
| Related incidents | [Links to related production incidents] |
| Regression of | [Link to original defect if this is a regression] |

---

#### Root Cause (filled after investigation)

[Describe the technical root cause once identified]

#### Resolution (filled after fix)

| Field | Value |
|-------|-------|
| **Fix PR** | [Link] |
| **Fix Version** | [Version where fix is included] |
| **Regression Test Added** | Yes / No (if No, explain why) |
| **Verified By** | [Name] |
| **Verified Date** | [Date] |

---

## Usage Notes

- Title should be descriptive enough to identify the defect without opening the report
- Steps to Reproduce must start from a known state and be executable by anyone on the team
- Attach evidence (screenshots, logs) whenever possible -- visual evidence reduces investigation time by 60%
- Fill Severity based on user impact; fill Priority based on business urgency (they may differ)
- The Root Cause and Resolution sections are filled after investigation, not at report time
- Every P1/P2 defect should trigger root cause analysis and a regression test
