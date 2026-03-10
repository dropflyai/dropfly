# Vendor Security Assessment Template

## Assessment Information

| Field | Value |
|-------|-------|
| Assessment ID | VENDOR-[YYYY]-[NNN] |
| Vendor Name | [Legal entity name] |
| Vendor Contact | [Name, Title, Email] |
| Product/Service | [Specific product or service being assessed] |
| Assessment Date | [YYYY-MM-DD] |
| Assessor | [Name, Title] |
| Business Owner | [Internal stakeholder requesting the vendor] |
| Assessment Type | [ ] Initial [ ] Annual Review [ ] Re-assessment (triggered by incident/change) |
| Previous Assessment | [Reference to previous assessment or "N/A — First assessment"] |

---

## 1. Vendor Classification

### 1.1 Risk Tier Determination

| Criteria | Response | Points |
|----------|----------|--------|
| Does the vendor process, store, or transmit customer PII? | [ ] Yes (4) [ ] No (0) | |
| Does the vendor process, store, or transmit PHI? | [ ] Yes (5) [ ] No (0) | |
| Does the vendor process, store, or transmit payment card data? | [ ] Yes (5) [ ] No (0) | |
| Does the vendor have access to production systems or networks? | [ ] Yes (4) [ ] No (0) | |
| Does the vendor have access to source code or intellectual property? | [ ] Yes (3) [ ] No (0) | |
| Is the vendor a single point of failure for business operations? | [ ] Yes (3) [ ] No (0) | |
| Does the vendor have physical access to our facilities? | [ ] Yes (2) [ ] No (0) | |
| Does data cross international borders? | [ ] Yes (2) [ ] No (0) | |
| **Total Points** | | **[Sum]** |

**Risk Tier:**
| Points | Tier | Assessment Depth | Review Frequency |
|--------|------|-----------------|-----------------|
| 15+ | Critical | Full assessment + on-site/virtual audit | Annual |
| 8-14 | High | Full questionnaire + evidence review | Annual |
| 4-7 | Medium | Standard questionnaire | Biennial |
| 0-3 | Low | Abbreviated questionnaire | Triennial |

**Assigned Tier:** [Critical / High / Medium / Low]

---

## 2. Vendor Information

### 2.1 Company Overview

| Question | Response |
|----------|----------|
| Year established | |
| Number of employees | |
| Annual revenue (range) | |
| Primary business location | |
| Data processing locations | |
| Number of customers | |
| Public or private company | |
| Insurance coverage (cyber liability) | [ ] Yes — Amount: ___ [ ] No |

### 2.2 Compliance Certifications

| Certification | Status | Valid Through | Report/Certificate Available? |
|--------------|--------|-------------|------------------------------|
| SOC 2 Type II | [ ] Yes [ ] No [ ] In Progress | [Date] | [ ] Yes [ ] No |
| ISO 27001 | [ ] Yes [ ] No [ ] In Progress | [Date] | [ ] Yes [ ] No |
| PCI DSS | [ ] Yes [ ] No [ ] N/A | [Date] | [ ] Yes [ ] No |
| HIPAA (BAA available) | [ ] Yes [ ] No [ ] N/A | | [ ] Yes [ ] No |
| FedRAMP | [ ] Yes [ ] No [ ] N/A | [Date] | [ ] Yes [ ] No |
| SOC 1 Type II | [ ] Yes [ ] No [ ] N/A | [Date] | [ ] Yes [ ] No |
| Other: ___ | [ ] Yes [ ] No | [Date] | [ ] Yes [ ] No |

---

## 3. Security Assessment

### 3.1 Data Protection

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.1.1 | Is data encrypted at rest? If yes, what algorithm and key length? | | |
| 3.1.2 | Is data encrypted in transit? What TLS version is minimum? | | |
| 3.1.3 | How are encryption keys managed? Is there key rotation? | | |
| 3.1.4 | Where is data physically stored (region/country)? | | |
| 3.1.5 | Is data segregated from other customers (multi-tenant architecture)? | | |
| 3.1.6 | What is the data retention policy? Can data be deleted on request? | | |
| 3.1.7 | Is data backed up? How often? Where are backups stored? | | |
| 3.1.8 | What is the data return/deletion process upon contract termination? | | |
| 3.1.9 | Is there a data classification policy? How is sensitive data identified? | | |
| 3.1.10 | Is DLP (Data Loss Prevention) implemented? | | |

### 3.2 Access Control

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.2.1 | Is multi-factor authentication required for all user access? | | |
| 3.2.2 | Is MFA required for administrative/privileged access? | | |
| 3.2.3 | How are user accounts provisioned and deprovisioned? | | |
| 3.2.4 | How often are access reviews conducted? | | |
| 3.2.5 | Is the principle of least privilege applied? How is this enforced? | | |
| 3.2.6 | How is privileged access managed (PAM)? | | |
| 3.2.7 | Is role-based access control implemented? | | |
| 3.2.8 | How are service accounts and API keys managed? | | |
| 3.2.9 | Is SSO/SAML/OIDC supported for customer authentication? | | |

### 3.3 Network Security

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.3.1 | Is the network segmented between customer environments? | | |
| 3.3.2 | Is there a WAF protecting web applications? | | |
| 3.3.3 | Is DDoS protection in place? | | |
| 3.3.4 | Is intrusion detection/prevention deployed? | | |
| 3.3.5 | How is remote access secured (VPN, ZTNA)? | | |

### 3.4 Vulnerability Management

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.4.1 | How often are vulnerability scans performed? | | |
| 3.4.2 | What are the patch SLAs by severity? | | |
| 3.4.3 | Is penetration testing conducted? How often? By whom? | | |
| 3.4.4 | Is a bug bounty program in place? | | |
| 3.4.5 | When was the last penetration test? Can the executive summary be shared? | | |

### 3.5 Incident Response

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.5.1 | Is there a documented incident response plan? | | |
| 3.5.2 | What is the notification timeline for security incidents affecting our data? | | |
| 3.5.3 | Has there been a data breach in the last 3 years? If yes, describe. | | |
| 3.5.4 | How often is the IR plan tested (tabletop exercises)? | | |
| 3.5.5 | Is there a dedicated security operations center (SOC)? | | |
| 3.5.6 | What SIEM/monitoring platform is used? | | |

### 3.6 Business Continuity and Disaster Recovery

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.6.1 | Is there a documented BC/DR plan? | | |
| 3.6.2 | What are the RTO and RPO targets? | | |
| 3.6.3 | How often is the DR plan tested? | | |
| 3.6.4 | What is the uptime SLA? | | |
| 3.6.5 | Is there geographic redundancy? | | |

### 3.7 Secure Development

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.7.1 | Is there a secure SDLC process? | | |
| 3.7.2 | Is SAST/DAST/SCA used in the development pipeline? | | |
| 3.7.3 | Is code review required before production deployment? | | |
| 3.7.4 | Are developers trained on secure coding practices? | | |
| 3.7.5 | How are third-party libraries/dependencies managed? | | |

### 3.8 Personnel Security

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.8.1 | Are background checks conducted for employees with data access? | | |
| 3.8.2 | Is security awareness training conducted? How often? | | |
| 3.8.3 | What is the employee offboarding process for access revocation? | | |
| 3.8.4 | Are confidentiality/NDA agreements in place for all employees? | | |

### 3.9 Subprocessors / Fourth Parties

| # | Question | Response | Evidence |
|---|----------|----------|----------|
| 3.9.1 | Does the vendor use subprocessors that access our data? | | |
| 3.9.2 | List all subprocessors with access to our data | | |
| 3.9.3 | How are subprocessors assessed for security? | | |
| 3.9.4 | Will we be notified of subprocessor changes? | | |

---

## 4. Risk Assessment

### 4.1 Identified Risks

| # | Risk Description | Likelihood | Impact | Risk Level | Mitigation |
|---|-----------------|------------|--------|-----------|------------|
| R.1 | [Risk identified from assessment] | [H/M/L] | [H/M/L] | [C/H/M/L] | [Required mitigation or acceptance] |
| R.2 | | | | | |
| R.3 | | | | | |

### 4.2 Risk Summary

| Risk Level | Count |
|-----------|-------|
| Critical | [n] |
| High | [n] |
| Medium | [n] |
| Low | [n] |

---

## 5. Assessment Outcome

### 5.1 Overall Rating

| Rating | Definition |
|--------|-----------|
| [ ] Approved | Meets security requirements. Proceed with engagement. |
| [ ] Approved with Conditions | Meets minimum requirements with specific conditions. Document conditions below. |
| [ ] Requires Remediation | Does not meet requirements. Vendor must remediate before engagement. |
| [ ] Rejected | Does not meet requirements and remediation is not feasible. Do not engage. |

### 5.2 Conditions (if Approved with Conditions)

| # | Condition | Vendor Commitment | Deadline |
|---|-----------|-------------------|----------|
| 1 | [Required improvement] | [Vendor's response] | [Date] |
| 2 | | | |

### 5.3 Contractual Requirements

| Requirement | Status |
|------------|--------|
| Data Processing Agreement (DPA) | [ ] Required [ ] Signed [ ] N/A |
| Business Associate Agreement (BAA) | [ ] Required [ ] Signed [ ] N/A |
| Security Exhibit / Addendum | [ ] Required [ ] Signed [ ] N/A |
| Breach notification SLA in contract | [ ] Yes — [hours] [ ] No |
| Audit rights clause | [ ] Yes [ ] No |
| Data return/deletion clause | [ ] Yes [ ] No |
| Cyber insurance requirement | [ ] Yes — Min: ___ [ ] No |
| Subprocessor notification clause | [ ] Yes [ ] No |

---

## 6. Next Steps

| Action | Owner | Deadline |
|--------|-------|----------|
| [Share assessment results with business owner] | | |
| [Execute DPA/BAA if required] | | |
| [Schedule next review] | | |
| [Monitor vendor for breaches/incidents] | | |

**Next Review Date:** [YYYY-MM-DD]

---

## 7. Approval

| Role | Name | Decision | Date |
|------|------|----------|------|
| Security Assessor | | [Assessment complete] | |
| Security Lead | | [Approved / Approved with Conditions / Remediation Required / Rejected] | |
| Business Owner | | [Acknowledged] | |
| Legal (if DPA/BAA required) | | [Reviewed] | |
| Privacy (if PII involved) | | [Reviewed] | |

---

## Cross-References

- `05_compliance/supply_chain_security.md` — Third-party risk management
- `05_compliance/compliance_frameworks.md` — Compliance requirements for vendors
- `Patterns/compliance_audit_pattern.md` — Vendor audit process
