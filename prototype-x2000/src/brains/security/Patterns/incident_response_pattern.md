# Incident Response Pattern — Detection Through Recovery

## Problem Statement

When a security incident is detected, the response must be fast, coordinated, and thorough. Without a structured pattern, incident response devolves into ad hoc firefighting where critical steps are missed, evidence is destroyed, and recovery is delayed. This pattern provides a repeatable, step-by-step approach to handling security incidents from initial detection through post-incident review.

---

## Context

Apply this pattern when:
- A security alert or report indicates a potential or confirmed security incident
- Suspicious activity is detected that may indicate compromise
- A vulnerability is being actively exploited
- A third party (researcher, customer, law enforcement) reports a security issue
- Any event that could impact the confidentiality, integrity, or availability of systems or data

---

## Solution — Step-by-Step Incident Response

### Step 1: Initial Triage (Target: 15 minutes)

**Objective:** Determine if this is a real incident and assign severity.

1. **Validate the alert** — Is this a true positive or false positive?
   - Check multiple data sources (SIEM, EDR, network logs, application logs)
   - Correlate with recent threat intelligence
   - Verify the affected system exists and is in scope

2. **Classify severity:**
   - SEV-1 (Critical): Active data breach, ransomware, production compromise
   - SEV-2 (High): Confirmed compromise, contained, no data loss confirmed
   - SEV-3 (Medium): Suspicious activity, investigation needed
   - SEV-4 (Low): Policy violation, minor event

3. **Assign incident commander** — Based on severity and availability roster

4. **Open incident channel:**
   - Create dedicated Slack channel: `#incident-SEC-YYYY-NNN`
   - Create incident ticket in tracking system
   - Begin timestamped incident log

### Step 2: Mobilize Response Team (Target: 30 minutes for SEV-1)

**Objective:** Assemble the appropriate response team.

1. **Notify required personnel** per severity:
   - SEV-1: IR team, CISO, engineering lead, legal, communications, executive sponsor
   - SEV-2: IR team, security lead, engineering lead
   - SEV-3: IR analyst, relevant system owner
   - SEV-4: IR analyst

2. **Establish communication:**
   - Primary: Dedicated Slack channel (assume corporate email may be compromised)
   - Secondary: Out-of-band communication (phone, Signal) for SEV-1
   - Bridge call for SEV-1/SEV-2

3. **Document roles:**
   - Incident Commander: [Name]
   - Technical Lead: [Name]
   - Communications Lead: [Name]
   - Scribe (maintains timeline): [Name]

### Step 3: Investigate and Scope (Target: 2 hours for SEV-1)

**Objective:** Understand the full scope of the incident.

1. **Preserve evidence before investigation:**
   - Forensic image of affected systems (memory first, then disk)
   - Network capture of relevant traffic
   - Log snapshots from all relevant sources
   - Screenshot any ephemeral evidence

2. **Answer key questions:**
   - What systems are affected?
   - What data is at risk or confirmed compromised?
   - What is the attack vector (how did the adversary get in)?
   - What is the adversary's current access (are they still in)?
   - What is the timeline (when did the compromise begin)?
   - Who is the adversary (if attributable)?

3. **Map the blast radius:**
   - Systems directly compromised
   - Systems accessible from compromised systems
   - Data accessible from compromised systems
   - Users whose credentials may be compromised
   - Third parties potentially affected

### Step 4: Contain (Target: 4 hours for SEV-1)

**Objective:** Stop the bleeding — prevent further damage.

1. **Short-term containment:**
   - Isolate affected systems (network isolation via EDR, VLAN change, security group)
   - Disable compromised accounts
   - Block known malicious indicators (IPs, domains, hashes) at firewall/WAF/DNS
   - Revoke compromised API keys and tokens

2. **Verify containment:**
   - Confirm isolated systems cannot reach the network
   - Confirm blocked indicators are enforced
   - Confirm disabled accounts cannot authenticate
   - Monitor for adversary attempting alternative access paths

3. **Long-term containment:**
   - Prepare clean replacement systems
   - Implement additional monitoring on potentially affected systems
   - Restrict access to sensitive systems during investigation

### Step 5: Eradicate

**Objective:** Remove the adversary and all artifacts of compromise.

1. Remove malware, backdoors, persistence mechanisms
2. Patch the vulnerability that enabled initial access
3. Reset all potentially compromised credentials
4. Update detection rules to catch this attack vector
5. Verify eradication with independent scanning

### Step 6: Recover

**Objective:** Restore normal operations safely.

1. Rebuild affected systems from known-good sources (IaC, clean backups)
2. Restore data from verified-clean backups
3. Gradually restore services with enhanced monitoring
4. Validate system integrity and data integrity
5. Monitor intensively for 30 days post-recovery

### Step 7: Post-Incident Review (Target: 5 business days post-recovery)

**Objective:** Learn from the incident and prevent recurrence.

1. Conduct blameless post-incident review meeting
2. Produce written PIR document (use `Templates/incident_postmortem_template.md`)
3. Identify root cause and contributing factors
4. Generate specific, actionable, assigned, time-bound action items
5. Track action items to completion
6. Update this pattern if the incident revealed gaps

---

## Implementation Checklist

- [ ] Alert validated as true/false positive
- [ ] Severity assigned
- [ ] Incident commander assigned
- [ ] Incident channel created
- [ ] Response team mobilized
- [ ] Evidence preserved (memory, disk, logs)
- [ ] Scope determined (systems, data, users, timeline)
- [ ] Containment implemented and verified
- [ ] Regulatory notification assessed (legal consulted)
- [ ] Eradication complete
- [ ] Recovery complete
- [ ] Enhanced monitoring in place
- [ ] Post-incident review scheduled
- [ ] PIR document completed
- [ ] Action items assigned and tracked

---

## Verification

This pattern is correctly applied when:
- Every phase has timestamped entries in the incident log
- Evidence is preserved with chain of custody documentation
- Containment is verified (not just implemented)
- Post-incident review produces actionable items with owners and deadlines
- All action items are tracked to completion

---

## Anti-Patterns

| Anti-Pattern | Risk | Correct Approach |
|-------------|------|-----------------|
| Rebooting compromised system immediately | Destroys memory evidence | Image memory before any action |
| Investigating on the compromised system | Contaminates evidence | Investigate forensic copies |
| Notifying before containing | Adversary may accelerate damage | Contain first, notify after |
| Declaring "all clear" without verification | Adversary may still have access | Verify eradication with independent scan |
| Skipping post-incident review | Same incident will recur | PIR is mandatory, not optional |
| Blaming individuals in PIR | Discourages reporting | Blameless retrospective |

---

## Cross-References

- `06_operations/incident_response.md` — Full incident response doctrine
- `06_operations/security_monitoring.md` — Detection feeding into this pattern
- `Templates/incident_postmortem_template.md` — PIR document format
- `eval/AccountabilityProtocol.md` — Incident accountability tracking
