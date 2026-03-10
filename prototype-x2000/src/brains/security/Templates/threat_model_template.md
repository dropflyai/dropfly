# Threat Model Template

## Document Information

| Field | Value |
|-------|-------|
| System/Feature Name | [Name of the system, service, or feature being modeled] |
| Version | [Document version number] |
| Author | [Threat model author] |
| Reviewers | [Security reviewers] |
| Date Created | [YYYY-MM-DD] |
| Last Updated | [YYYY-MM-DD] |
| Next Review Date | [YYYY-MM-DD] |
| Status | [Draft / In Review / Approved / Needs Update] |

---

## 1. System Overview

### 1.1 Business Context

**Purpose:** [What does this system do? What business problem does it solve?]

**Users:** [Who uses this system? Internal employees, external customers, partners, APIs?]

**Data Classification:** [What is the highest sensitivity level of data handled?]
- [ ] Public
- [ ] Internal
- [ ] Confidential
- [ ] Restricted

**Compliance Requirements:** [Which compliance frameworks apply?]
- [ ] SOC 2
- [ ] ISO 27001
- [ ] PCI DSS
- [ ] HIPAA
- [ ] GDPR
- [ ] Other: ___

### 1.2 Technical Architecture

**Technology Stack:**
| Component | Technology | Version |
|-----------|-----------|---------|
| Frontend | [e.g., React, Next.js] | [version] |
| Backend | [e.g., Node.js, Python] | [version] |
| Database | [e.g., PostgreSQL, DynamoDB] | [version] |
| Cache | [e.g., Redis, Memcached] | [version] |
| Message Queue | [e.g., SQS, RabbitMQ] | [version] |
| Infrastructure | [e.g., AWS ECS, Kubernetes] | [version] |

**Deployment Environment:** [AWS / GCP / Azure / On-premise / Hybrid]

**Network Zone:** [DMZ / Internal / Restricted / Multi-zone]

### 1.3 Data Flow Diagram

[Insert or reference DFD here — Level 1 minimum, Level 2 for complex systems]

**Trust Boundaries Identified:**
1. [Trust boundary 1 — e.g., Internet to application load balancer]
2. [Trust boundary 2 — e.g., Application tier to database tier]
3. [Trust boundary 3 — e.g., Internal service to third-party API]

**Entry Points (Attack Surface):**
| ID | Entry Point | Protocol | Authentication | Data Sensitivity |
|----|------------|----------|---------------|-----------------|
| EP-1 | [e.g., REST API /api/v1/*] | HTTPS | OAuth2 Bearer | Confidential |
| EP-2 | [e.g., WebSocket /ws] | WSS | Session cookie | Internal |
| EP-3 | [e.g., Admin panel /admin] | HTTPS | OIDC + MFA | Restricted |

---

## 2. Threat Enumeration

### 2.1 STRIDE Analysis

For each DFD element crossing a trust boundary, enumerate threats:

#### Element: [Name — e.g., User Authentication Service]

| STRIDE | Threat Description | Likelihood | Impact | Risk | Mitigation |
|--------|-------------------|------------|--------|------|-----------|
| Spoofing | [e.g., Attacker impersonates legitimate user via credential stuffing] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., Rate limiting, MFA, breach password check] |
| Tampering | [e.g., Attacker modifies JWT claims to escalate privileges] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., HMAC-SHA256 signature verification, short token lifetime] |
| Repudiation | [e.g., User denies performing a financial transaction] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., Immutable audit log with user ID, timestamp, action] |
| Info Disclosure | [e.g., Error messages expose internal database schema] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., Generic error messages in production, detailed logging server-side] |
| DoS | [e.g., Attacker floods authentication endpoint] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., Rate limiting per IP, CAPTCHA after 5 failures, WAF] |
| Elevation | [e.g., Regular user accesses admin endpoints via IDOR] | [H/M/L] | [H/M/L] | [C/H/M/L] | [e.g., Server-side authorization check on every endpoint] |

#### Element: [Name — e.g., Customer Database]

| STRIDE | Threat Description | Likelihood | Impact | Risk | Mitigation |
|--------|-------------------|------------|--------|------|-----------|
| Tampering | [e.g., SQL injection modifies customer records] | | | | |
| Info Disclosure | [e.g., IDOR allows access to other customers' data] | | | | |
| DoS | [e.g., Expensive query causes database resource exhaustion] | | | | |

[Repeat for each DFD element]

### 2.2 Additional Threat Scenarios

| ID | Threat Scenario | Attack Vector | Preconditions | Impact |
|----|----------------|---------------|---------------|--------|
| TS-1 | [e.g., Supply chain attack via compromised npm package] | [Dependency injection] | [Attacker publishes malicious version] | [RCE on build server] |
| TS-2 | [e.g., Insider threat exfiltrates customer database] | [Authorized access abuse] | [Employee with database access] | [Full PII exposure] |
| TS-3 | [e.g., Cloud account compromise via leaked AWS key] | [Credential theft] | [Key exposed in public repo] | [Full infrastructure access] |

---

## 3. Risk Assessment Summary

### 3.1 Risk Register

| ID | Threat | CVSS/Risk Score | Likelihood | Impact | Current Controls | Residual Risk | Treatment |
|----|--------|----------------|------------|--------|-----------------|---------------|-----------|
| T-001 | [Threat description] | [Score] | [H/M/L] | [H/M/L] | [Existing controls] | [C/H/M/L] | [Mitigate/Accept/Transfer/Avoid] |
| T-002 | | | | | | | |
| T-003 | | | | | | | |

### 3.2 Risk Summary

| Risk Level | Count | Requiring Mitigation | Accepted |
|-----------|-------|---------------------|----------|
| Critical | [n] | [n] | [n] |
| High | [n] | [n] | [n] |
| Medium | [n] | [n] | [n] |
| Low | [n] | [n] | [n] |

---

## 4. Mitigation Plan

### 4.1 Required Mitigations

| ID | Mitigation | Addresses Threat(s) | Owner | Deadline | Status |
|----|-----------|---------------------|-------|----------|--------|
| M-001 | [e.g., Implement rate limiting on auth endpoint] | T-001 | [Name] | [Date] | [Not Started/In Progress/Complete/Verified] |
| M-002 | [e.g., Add object-level authorization checks] | T-002, T-003 | [Name] | [Date] | |
| M-003 | [e.g., Enable encryption at rest for customer database] | T-004 | [Name] | [Date] | |

### 4.2 Accepted Risks

| ID | Threat | Residual Risk | Justification | Risk Owner | Acceptance Date | Review Date |
|----|--------|---------------|---------------|-----------|----------------|-------------|
| T-005 | [Threat description] | [M/L] | [Why this risk is acceptable] | [Name, title] | [Date] | [Date] |

---

## 5. Verification Plan

| Mitigation | Verification Method | Verifier | Verification Date |
|-----------|-------------------|---------|-------------------|
| M-001 | [e.g., DAST scan confirming rate limiting active] | [Name] | [Date] |
| M-002 | [e.g., Penetration test targeting IDOR] | [Name] | [Date] |
| M-003 | [e.g., AWS Config rule confirming encryption] | [Name] | [Date] |

---

## 6. Assumptions and Constraints

### Assumptions
1. [e.g., Cloud provider physical security is adequate (shared responsibility model)]
2. [e.g., Corporate network is not trusted (zero trust assumption)]
3. [e.g., Third-party APIs implement their documented security controls]

### Constraints
1. [e.g., Legacy system cannot be modified — compensating controls only]
2. [e.g., Budget limitation restricts WAF vendor selection]
3. [e.g., Compliance deadline requires expedited implementation]

---

## 7. Review History

| Date | Reviewer | Changes | Trigger |
|------|---------|---------|---------|
| [Date] | [Name] | Initial threat model | New service design |
| [Date] | [Name] | Updated for new API endpoints | Feature addition |
| [Date] | [Name] | Updated post-incident findings | Incident SEC-2024-042 |

---

## 8. Approval

| Role | Name | Signature/Approval | Date |
|------|------|-------------------|------|
| Security Reviewer | | | |
| Engineering Lead | | | |
| Product Owner | | | |
| Risk Owner | | | |

---

## Cross-References

- `03_threat_modeling/threat_modeling_methods.md` — Threat modeling methodologies
- `03_threat_modeling/risk_assessment.md` — Risk scoring guidance
- `Patterns/security_review_pattern.md` — Security review process
- `Templates/security_review_template.md` — Complementary review template
