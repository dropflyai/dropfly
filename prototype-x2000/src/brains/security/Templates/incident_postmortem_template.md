# Incident Postmortem Template

## Incident Information

| Field | Value |
|-------|-------|
| Incident ID | SEC-[YYYY]-[NNN] |
| Incident Title | [Concise description of the incident] |
| Severity | SEV-[1/2/3/4] |
| Status | [Active / Contained / Resolved / Closed] |
| Incident Commander | [Name] |
| Technical Lead | [Name] |
| Author of This Document | [Name] |
| Date of Incident | [YYYY-MM-DD] |
| Date of Detection | [YYYY-MM-DD HH:MM UTC] |
| Date of Containment | [YYYY-MM-DD HH:MM UTC] |
| Date of Resolution | [YYYY-MM-DD HH:MM UTC] |
| Date of This Report | [YYYY-MM-DD] |
| PIR Meeting Date | [YYYY-MM-DD] |
| PIR Attendees | [List of attendees] |

---

## 1. Executive Summary

[2-4 sentence summary of what happened, what the impact was, and what was done about it. Written for executive/board audience. No jargon.]

**Example:** On [date], a security incident was detected involving [brief description]. The incident resulted in [impact: data exposure, service disruption, etc.] affecting [number] of [users/systems/records]. The incident was contained within [time] and fully resolved within [time]. Root cause was [brief root cause]. [N] action items have been identified to prevent recurrence.

---

## 2. Impact Assessment

### 2.1 Data Impact

| Question | Answer |
|----------|--------|
| Was data accessed by unauthorized parties? | [Yes / No / Unknown] |
| Was data exfiltrated? | [Yes / No / Unknown] |
| Was data modified? | [Yes / No / Unknown] |
| Was data destroyed? | [Yes / No / Unknown] |
| Data types affected | [PII / PHI / PCI / Credentials / Business confidential / None] |
| Number of records affected | [Count or estimate] |
| Number of individuals affected | [Count or estimate] |
| Geographic scope of affected individuals | [Countries/regions] |

### 2.2 System Impact

| Question | Answer |
|----------|--------|
| Systems affected | [List all affected systems] |
| Service disruption? | [Yes (duration) / No] |
| Data integrity impact? | [Yes (description) / No] |
| Availability impact? | [Yes (duration) / No] |

### 2.3 Business Impact

| Category | Impact | Estimated Cost |
|----------|--------|---------------|
| Revenue loss | [Description or N/A] | [$] |
| Response costs | [IR team hours, forensics, legal] | [$] |
| Regulatory fines | [Potential or actual] | [$] |
| Customer notifications | [Number, method, cost] | [$] |
| Reputational impact | [Assessment] | [Qualitative] |
| Total estimated impact | | [$] |

---

## 3. Timeline

Provide a detailed, timestamped timeline of events from initial compromise through resolution. All times in UTC.

| Time (UTC) | Event | Source |
|-----------|-------|--------|
| [YYYY-MM-DD HH:MM] | **Initial Compromise** — [How the adversary gained initial access] | [How we determined this] |
| [YYYY-MM-DD HH:MM] | [Adversary action — e.g., lateral movement, data access] | [Log source, forensic evidence] |
| [YYYY-MM-DD HH:MM] | **Detection** — [What triggered the detection] | [Alert source: SIEM, EDR, user report] |
| [YYYY-MM-DD HH:MM] | Incident commander assigned: [Name] | [Communication channel] |
| [YYYY-MM-DD HH:MM] | IR team assembled | |
| [YYYY-MM-DD HH:MM] | Investigation began — [first actions taken] | |
| [YYYY-MM-DD HH:MM] | Scope determined — [what was found] | |
| [YYYY-MM-DD HH:MM] | **Containment** — [actions taken to stop the incident] | |
| [YYYY-MM-DD HH:MM] | Containment verified | |
| [YYYY-MM-DD HH:MM] | Eradication began — [actions taken to remove adversary] | |
| [YYYY-MM-DD HH:MM] | **Eradication complete** | |
| [YYYY-MM-DD HH:MM] | Recovery began — [restoration actions] | |
| [YYYY-MM-DD HH:MM] | **Recovery complete** — services restored | |
| [YYYY-MM-DD HH:MM] | Enhanced monitoring period began | |
| [YYYY-MM-DD HH:MM] | Regulatory notifications sent (if applicable) | |
| [YYYY-MM-DD HH:MM] | Individual notifications sent (if applicable) | |

### Key Metrics

| Metric | Value |
|--------|-------|
| Dwell time (compromise to detection) | [duration] |
| Time to detect (alert to confirmation) | [duration] |
| Time to contain (confirmation to containment) | [duration] |
| Time to eradicate (containment to eradication) | [duration] |
| Time to recover (eradication to full recovery) | [duration] |
| Total incident duration | [duration] |

---

## 4. Root Cause Analysis

### 4.1 Root Cause

[Detailed technical description of the root cause. What was the fundamental vulnerability or weakness that enabled this incident?]

### 4.2 Contributing Factors

| Factor | Description | Category |
|--------|-------------|----------|
| [Factor 1] | [How this contributed to the incident] | [Technical / Process / People / External] |
| [Factor 2] | [How this contributed to the incident] | [Technical / Process / People / External] |
| [Factor 3] | [How this contributed to the incident] | [Technical / Process / People / External] |

### 4.3 Attack Vector Analysis

| Phase | Description | MITRE ATT&CK Technique |
|-------|-------------|----------------------|
| Initial Access | [How the adversary gained initial access] | [T-number] |
| Execution | [How the adversary ran code] | [T-number] |
| Persistence | [How the adversary maintained access] | [T-number] |
| Privilege Escalation | [How the adversary escalated privileges] | [T-number] |
| Defense Evasion | [How the adversary avoided detection] | [T-number] |
| Lateral Movement | [How the adversary moved through the environment] | [T-number] |
| Collection/Exfiltration | [How the adversary accessed/stole data] | [T-number] |

---

## 5. Detection Analysis

### 5.1 How Was This Detected?

[Description of the detection mechanism — which alert, which system, which person noticed]

### 5.2 Why Was This Not Detected Sooner?

| Gap | Description | Remediation |
|-----|-------------|------------|
| [Detection gap 1] | [Why this gap exists] | [How to close this gap] |
| [Detection gap 2] | [Why this gap exists] | [How to close this gap] |

### 5.3 Detection Improvements

| Improvement | Description | Owner | Deadline |
|------------|-------------|-------|----------|
| [New detection rule] | [What it detects, data source] | [Name] | [Date] |
| [Monitoring enhancement] | [What additional monitoring] | [Name] | [Date] |

---

## 6. Response Analysis

### 6.1 What Went Well

| Item | Description |
|------|-------------|
| [Positive 1] | [What worked effectively in the response] |
| [Positive 2] | [What worked effectively in the response] |

### 6.2 What Could Be Improved

| Item | Description | Action |
|------|-------------|--------|
| [Improvement 1] | [What did not work as well as expected] | [Specific improvement action] |
| [Improvement 2] | [What did not work as well as expected] | [Specific improvement action] |

### 6.3 Surprises / Unexpected Findings

| Finding | Implication |
|---------|------------|
| [Unexpected finding 1] | [What this means for our security posture] |

---

## 7. Regulatory and Notification Status

| Notification | Required? | Sent? | Date | Details |
|-------------|-----------|-------|------|---------|
| Supervisory authority (GDPR Art. 33) | [Yes/No/N/A] | [Yes/No] | [Date] | [Authority notified, reference number] |
| Data subjects (GDPR Art. 34) | [Yes/No/N/A] | [Yes/No] | [Date] | [Number notified, method] |
| HHS (HIPAA) | [Yes/No/N/A] | [Yes/No] | [Date] | [Reference number] |
| Card brands (PCI) | [Yes/No/N/A] | [Yes/No] | [Date] | |
| State attorneys general | [Yes/No/N/A] | [Yes/No] | [Date] | [States notified] |
| Law enforcement | [Yes/No/N/A] | [Yes/No] | [Date] | [Agency, case number] |
| Cyber insurance carrier | [Yes/No/N/A] | [Yes/No] | [Date] | [Claim number] |
| Customers/partners | [Yes/No/N/A] | [Yes/No] | [Date] | [Number notified] |
| SEC (if material) | [Yes/No/N/A] | [Yes/No] | [Date] | [8-K filing date] |

---

## 8. Action Items

### Prevention Actions (Prevent Recurrence)

| # | Action | Owner | Priority | Deadline | Status |
|---|--------|-------|----------|----------|--------|
| P.1 | [Specific action to prevent this root cause] | [Name] | [P0-P3] | [Date] | [Not Started / In Progress / Complete / Verified] |
| P.2 | | | | | |

### Detection Actions (Detect Faster)

| # | Action | Owner | Priority | Deadline | Status |
|---|--------|-------|----------|----------|--------|
| D.1 | [Specific action to improve detection] | [Name] | [P0-P3] | [Date] | |
| D.2 | | | | | |

### Response Actions (Respond Better)

| # | Action | Owner | Priority | Deadline | Status |
|---|--------|-------|----------|----------|--------|
| R.1 | [Specific action to improve response capability] | [Name] | [P0-P3] | [Date] | |
| R.2 | | | | | |

### Process Actions (Improve Processes)

| # | Action | Owner | Priority | Deadline | Status |
|---|--------|-------|----------|----------|--------|
| X.1 | [Process improvement] | [Name] | [P0-P3] | [Date] | |
| X.2 | | | | | |

---

## 9. Appendices

### A. Evidence Inventory

| Evidence ID | Description | Location | Hash (SHA-256) |
|------------|-------------|----------|----------------|
| E-001 | [Forensic image of server X] | [Secure storage path] | [hash] |
| E-002 | [Memory dump] | [Secure storage path] | [hash] |
| E-003 | [Network capture] | [Secure storage path] | [hash] |

### B. Indicators of Compromise

| Type | Value | Context |
|------|-------|---------|
| IP Address | [IP] | [C2 server / scanning source] |
| Domain | [domain] | [Phishing / C2] |
| File Hash (SHA-256) | [hash] | [Malware sample] |
| File Path | [path] | [Persistence mechanism] |

### C. Communication Log

[Reference to incident channel logs and significant communications during the incident]

---

## 10. Sign-Off

| Role | Name | Date | Approval |
|------|------|------|----------|
| Incident Commander | | | [ ] Approved |
| CISO | | | [ ] Approved |
| Engineering Lead | | | [ ] Reviewed |
| Legal Counsel | | | [ ] Reviewed |

---

## Cross-References

- `Patterns/incident_response_pattern.md` — IR process followed
- `06_operations/incident_response.md` — IR doctrine
- `eval/AccountabilityProtocol.md` — Accountability tracking
