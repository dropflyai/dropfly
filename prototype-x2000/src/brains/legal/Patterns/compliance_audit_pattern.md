# Compliance Audit Pattern

> A systematic pattern for planning, executing, and remediating compliance audits across regulatory domains -- from data privacy to employment law to industry-specific regulations.

> **DISCLAIMER:** This pattern is for educational and informational purposes only. It does not constitute legal advice. Compliance requirements vary by jurisdiction, industry, and company size. Always consult qualified legal counsel and compliance professionals.

---

## Context

This pattern applies when you need to conduct a structured compliance review to assess adherence to applicable laws, regulations, and internal policies. It covers the full audit lifecycle from scoping through remediation tracking.

**Use this pattern for:**
- Data privacy compliance (GDPR, CCPA/CPRA, PIPEDA)
- Employment law compliance
- Industry-specific regulations (HIPAA, SOX, PCI-DSS, FINRA)
- Internal policy compliance
- Pre-acquisition due diligence compliance review
- Annual compliance health check

---

## Challenge

Compliance audits fail when scope is unclear, when coverage is incomplete, when findings are not risk-ranked, or when remediation lacks accountability. Organizations often discover compliance gaps only when a regulator comes knocking -- by then, the cost of remediation is orders of magnitude higher. This pattern ensures proactive, systematic compliance assessment.

---

## Phase 1: Audit Planning and Scoping (Weeks 1-2)

### 1.1 Regulatory Landscape Assessment

Identify all applicable regulatory frameworks:

| Framework | Jurisdiction | Applicability Trigger | Relevant If |
|-----------|-------------|----------------------|-------------|
| GDPR | EU/EEA | Processing EU resident data | You serve EU customers or have EU employees |
| CCPA/CPRA | California, US | CA consumer data, revenue thresholds | Revenue >$25M or data on 100K+ CA consumers |
| HIPAA | United States | Protected health information | Healthcare, health tech, business associates |
| SOX | United States | Public company, financial reporting | Publicly traded or preparing for IPO |
| PCI-DSS | Global | Credit card data processing | Accept, process, or store payment card data |
| SOC 2 | Global | Service organization controls | SaaS companies, data processors |
| Employment law | Multi-jurisdiction | Employer-employee relationship | You have employees in any jurisdiction |
| ADA/WCAG | United States | Digital accessibility | Public-facing digital products |

### 1.2 Audit Scope Definition

| Element | Specification |
|---------|---------------|
| Regulatory frameworks in scope | List all applicable frameworks |
| Business units in scope | Which departments, teams, or functions |
| Systems in scope | Which applications, databases, and infrastructure |
| Geographic scope | Which jurisdictions |
| Time period under review | Date range being assessed |
| Audit type | Full, targeted, follow-up, or pre-certification |
| Exclusions | What is explicitly out of scope and why |

### 1.3 Audit Team and Stakeholders

| Role | Responsibility |
|------|---------------|
| Audit lead | Plans and manages the audit, writes the report |
| Legal counsel | Advises on regulatory interpretation |
| Compliance officer | Coordinates internal cooperation, tracks remediation |
| Department representatives | Provide evidence, answer questions |
| External auditor (if applicable) | Independent assessment, certification |
| Executive sponsor | Provides authority and resources |

### 1.4 Evidence Collection Plan

For each regulatory requirement, identify:
- What evidence demonstrates compliance (policies, logs, records, screenshots).
- Who owns the evidence (department, system, individual).
- How the evidence will be collected (document request, system export, interview).
- When the evidence must be produced (deadline for each request).

---

## Phase 2: Control Assessment (Weeks 2-4)

### 2.1 Control Inventory

Map controls to regulatory requirements:

| Control ID | Control Description | Regulatory Requirement | Owner | Evidence Type |
|-----------|-------------------|----------------------|-------|--------------|
| C-001 | Privacy policy published and current | GDPR Art. 13/14, CCPA 1798.100 | Legal | URL, document |
| C-002 | Data processing records maintained | GDPR Art. 30 | Privacy team | ROPA document |
| C-003 | Consent mechanism implemented | GDPR Art. 6-7 | Engineering | System demo, logs |
| C-004 | Employee handbook updated | Employment law (multi-jurisdiction) | HR | Document, distribution records |
| C-005 | Access controls and MFA | SOC 2, PCI-DSS | IT/Security | Configuration evidence |

### 2.2 Assessment Methodology

For each control, assess:

**Design effectiveness:** Is the control designed to address the regulatory requirement if it operates as intended?

| Rating | Definition |
|--------|-----------|
| Effective | Control design fully addresses the requirement |
| Partially effective | Control addresses some but not all aspects |
| Ineffective | Control does not address the requirement |
| Missing | No control exists for this requirement |

**Operating effectiveness:** Is the control actually operating as designed in practice?

| Rating | Definition |
|--------|-----------|
| Operating | Evidence confirms control is functioning as designed |
| Intermittent | Control operates sometimes but not consistently |
| Not operating | Control exists on paper but is not functioning |
| Not implemented | Control has not been deployed |

### 2.3 Testing Procedures

| Test Type | When to Use | Example |
|----------|-------------|---------|
| Inquiry | Initial understanding | Interview the process owner |
| Observation | Verify operating procedures | Watch the process being executed |
| Inspection | Verify documentation | Review policies, logs, records |
| Re-performance | Verify accuracy | Repeat the control activity independently |
| Data analytics | Large populations | Sample and analyze system logs |

### 2.4 Finding Documentation

For every finding, document:

| Field | Content |
|-------|---------|
| Finding ID | Unique identifier |
| Title | Brief description of the gap |
| Regulatory reference | Specific statute, regulation, or standard section |
| Control reference | Which control is affected |
| Finding description | Detailed explanation of the gap |
| Evidence | What evidence supports this finding |
| Root cause | Why does this gap exist |
| Risk rating | CRITICAL / HIGH / MEDIUM / LOW |
| Recommendation | Specific remediation steps |
| Remediation owner | Who is responsible for fixing |
| Remediation deadline | When must this be resolved |

---

## Phase 3: Risk Assessment and Prioritization (Week 4)

### 3.1 Risk Rating Framework

Rate each finding on two dimensions:

**Likelihood of regulatory action or harm:**
- HIGH: Actively non-compliant, regulator has focus on this area
- MEDIUM: Gap exists, moderate probability of detection
- LOW: Minor gap, low probability of enforcement action

**Impact if the risk materializes:**
- HIGH: Material fines, litigation, reputational damage, business disruption
- MEDIUM: Moderate fines, required remediation, customer impact
- LOW: Administrative burden, minor penalties, no customer impact

**Risk matrix:**

| | Low Impact | Medium Impact | High Impact |
|---|-----------|--------------|-------------|
| **High Likelihood** | MEDIUM | HIGH | CRITICAL |
| **Medium Likelihood** | LOW | MEDIUM | HIGH |
| **Low Likelihood** | LOW | LOW | MEDIUM |

### 3.2 Finding Prioritization

| Priority | Criteria | Remediation Timeline |
|----------|----------|---------------------|
| CRITICAL | Material regulatory exposure, active enforcement risk | Immediate (30 days) |
| HIGH | Significant gap, probable detection | 60 days |
| MEDIUM | Moderate gap, standard compliance risk | 90 days |
| LOW | Minor gap, best-practice improvement | 180 days |

### 3.3 Executive Summary

Prepare a one-page executive summary:
- Total findings by risk rating (CRITICAL, HIGH, MEDIUM, LOW).
- Top 3 most significant findings with business impact.
- Overall compliance posture assessment (RED / YELLOW / GREEN).
- Budget and resource estimate for remediation.
- Key deadlines (regulatory filing dates, certification renewals).

---

## Phase 4: Remediation Planning and Tracking (Weeks 5-8)

### 4.1 Remediation Action Plan

For each finding, define:

| Field | Content |
|-------|---------|
| Finding reference | Link to finding documentation |
| Remediation action | Specific steps to close the gap |
| Owner | Individual responsible (not a team -- a person) |
| Resources required | Budget, tools, external counsel |
| Dependencies | What must happen first |
| Milestone checkpoints | Interim verification dates |
| Target completion | Deadline aligned with priority tier |
| Verification method | How you will confirm the gap is closed |

### 4.2 Remediation Tracking

Track remediation status weekly:

| Status | Definition |
|--------|-----------|
| Not started | No action taken |
| In progress | Active work underway, on track |
| At risk | Behind schedule, may miss deadline |
| Blocked | Cannot proceed, dependency or resource issue |
| Completed | Remediation implemented, awaiting verification |
| Verified | Independent verification confirms gap is closed |

### 4.3 Governance Cadence

| Meeting | Cadence | Attendees | Purpose |
|---------|---------|-----------|---------|
| Remediation working session | Weekly | Finding owners, compliance team | Unblock issues, track progress |
| Executive compliance update | Bi-weekly | Executive sponsor, legal, compliance | Report progress, escalate blockers |
| Board compliance report | Quarterly | Board or audit committee | Strategic compliance posture |

---

## Phase 5: Continuous Compliance (Ongoing)

### 5.1 Compliance Monitoring

After remediation, establish ongoing monitoring:
- Automated compliance checks where possible (system configurations, access reviews).
- Periodic control testing (sample testing quarterly for critical controls).
- Regulatory change monitoring (subscribe to regulatory updates, track legislative changes).
- Annual full compliance audit (repeat this pattern).

### 5.2 Compliance Calendar

Maintain a calendar of all recurring compliance obligations:
- Annual filings and certifications.
- Recurring training requirements (privacy, security, harassment).
- Policy review and update cycles.
- Audit schedules (internal and external).
- Regulatory reporting deadlines.

### 5.3 Compliance Culture

- Integrate compliance into onboarding for new employees.
- Conduct annual compliance training with attestation.
- Establish a confidential reporting channel for compliance concerns.
- Include compliance metrics in departmental OKRs.
- Celebrate compliance wins (not just remediation of failures).

---

## Anti-Patterns

| Anti-Pattern | Consequence | Better Approach |
|-------------|-------------|-----------------|
| Auditing only when forced | Gaps discovered at worst time | Annual proactive audits |
| Scope creep during audit | Delays, incomplete coverage | Lock scope at planning phase |
| Findings without owners | Nothing gets remediated | Every finding has a named individual owner |
| Compliance theater | Policies exist but are not followed | Test operating effectiveness, not just design |
| One-time audit mentality | Compliance degrades over time | Continuous monitoring program |
| Ignoring regulatory changes | New requirements missed | Active regulatory change management |

---

## References

- `Templates/compliance_checklist_template.md` -- Compliance checklist
- `Templates/legal_memo_template.md` -- Documenting legal analysis
- `04_privacy/` -- Privacy-specific compliance
- `06_compliance/` -- Compliance frameworks

---

*Pattern version: 1.0*
*Risk level: MEDIUM (pattern is educational; actual audits may surface HIGH/CRITICAL findings)*
*Brain: Legal Brain*
*Cross-brain dependencies: Engineering Brain (technical controls), Security Brain (security controls), HR Brain (employment compliance)*
