# Security Review Template

## Review Information

| Field | Value |
|-------|-------|
| Review ID | SEC-REV-[YYYY]-[NNN] |
| System/Feature | [Name of system or feature under review] |
| Review Type | [ ] Lightweight [ ] Standard [ ] Deep |
| Reviewer(s) | [Security reviewer name(s)] |
| Development Team | [Team name and lead] |
| Review Date | [YYYY-MM-DD] |
| Review Status | [Scheduled / In Progress / Complete / Follow-up Required] |
| Threat Model Reference | [Link to threat model if exists] |

---

## 1. Scope and Context

### 1.1 What is Being Reviewed

**Description:** [Brief description of the feature, service, or change under review]

**Type of Change:**
- [ ] New service/application
- [ ] New feature in existing service
- [ ] Architecture change
- [ ] Third-party integration
- [ ] Infrastructure change
- [ ] Other: ___

**Data Handled:**
- [ ] Public data only
- [ ] Internal/business data
- [ ] Personal Identifiable Information (PII)
- [ ] Protected Health Information (PHI)
- [ ] Payment Card Data (PCI)
- [ ] Authentication credentials
- [ ] Other sensitive data: ___

**Exposure:**
- [ ] Internet-facing
- [ ] Internal network only
- [ ] API-to-API (service mesh)
- [ ] Batch/offline processing

### 1.2 Architecture Summary

[Brief architecture description or link to architecture document]

**Key Components:**
| Component | Description | Technology | Data Sensitivity |
|-----------|-------------|-----------|-----------------|
| | | | |
| | | | |

**External Dependencies:**
| Dependency | Type | Data Shared | Security Assessment |
|-----------|------|------------|-------------------|
| | | | |

---

## 2. Security Assessment Checklist

### 2.1 Authentication

| # | Check | Status | Notes |
|---|-------|--------|-------|
| A.1 | Authentication mechanism is industry-standard (OAuth2, OIDC, SAML) | [ ] Pass [ ] Fail [ ] N/A | |
| A.2 | All endpoints require authentication (unless intentionally public) | [ ] Pass [ ] Fail [ ] N/A | |
| A.3 | Password storage uses Argon2id or bcrypt with appropriate cost factor | [ ] Pass [ ] Fail [ ] N/A | |
| A.4 | Multi-factor authentication available for sensitive operations | [ ] Pass [ ] Fail [ ] N/A | |
| A.5 | Session tokens are cryptographically random, sufficient length (128+ bits) | [ ] Pass [ ] Fail [ ] N/A | |
| A.6 | Session cookies: HttpOnly, Secure, SameSite=Strict/Lax | [ ] Pass [ ] Fail [ ] N/A | |
| A.7 | Session timeout implemented (idle: 15-30min, absolute: 8-24hr) | [ ] Pass [ ] Fail [ ] N/A | |
| A.8 | Brute force protection (rate limiting, lockout, CAPTCHA) | [ ] Pass [ ] Fail [ ] N/A | |
| A.9 | Password reset flow is secure (token-based, time-limited, single-use) | [ ] Pass [ ] Fail [ ] N/A | |
| A.10 | JWT tokens: short-lived, signed (RS256/ES256), validated on every request | [ ] Pass [ ] Fail [ ] N/A | |

### 2.2 Authorization

| # | Check | Status | Notes |
|---|-------|--------|-------|
| Z.1 | Access control model defined (RBAC/ABAC) and consistently applied | [ ] Pass [ ] Fail [ ] N/A | |
| Z.2 | Every API endpoint has server-side authorization check | [ ] Pass [ ] Fail [ ] N/A | |
| Z.3 | Object-level authorization prevents IDOR | [ ] Pass [ ] Fail [ ] N/A | |
| Z.4 | Function-level authorization prevents privilege escalation | [ ] Pass [ ] Fail [ ] N/A | |
| Z.5 | Default deny — unrecognized requests are rejected | [ ] Pass [ ] Fail [ ] N/A | |
| Z.6 | Admin functions separated and additionally protected | [ ] Pass [ ] Fail [ ] N/A | |
| Z.7 | No client-side-only authorization checks | [ ] Pass [ ] Fail [ ] N/A | |

### 2.3 Input Validation and Injection Prevention

| # | Check | Status | Notes |
|---|-------|--------|-------|
| I.1 | All user input validated server-side (type, length, format, range) | [ ] Pass [ ] Fail [ ] N/A | |
| I.2 | Parameterized queries for all database operations (no string concatenation) | [ ] Pass [ ] Fail [ ] N/A | |
| I.3 | Output encoding applied for all dynamic content (HTML, URL, JS, CSS) | [ ] Pass [ ] Fail [ ] N/A | |
| I.4 | File uploads: type validation, size limits, stored outside webroot | [ ] Pass [ ] Fail [ ] N/A | |
| I.5 | No OS command execution with user input (or strict allowlisting if required) | [ ] Pass [ ] Fail [ ] N/A | |
| I.6 | API request schema validation (OpenAPI/JSON Schema) | [ ] Pass [ ] Fail [ ] N/A | |
| I.7 | Content-Type validation on all requests | [ ] Pass [ ] Fail [ ] N/A | |
| I.8 | XML processing disabled or secured against XXE | [ ] Pass [ ] Fail [ ] N/A | |

### 2.4 Data Protection

| # | Check | Status | Notes |
|---|-------|--------|-------|
| D.1 | Data at rest encrypted (AES-256-GCM or equivalent) | [ ] Pass [ ] Fail [ ] N/A | |
| D.2 | Data in transit encrypted (TLS 1.2+ required, 1.3 preferred) | [ ] Pass [ ] Fail [ ] N/A | |
| D.3 | Sensitive fields use field-level encryption where appropriate | [ ] Pass [ ] Fail [ ] N/A | |
| D.4 | Data classification applied to all data stores | [ ] Pass [ ] Fail [ ] N/A | |
| D.5 | Data minimization — only necessary data collected | [ ] Pass [ ] Fail [ ] N/A | |
| D.6 | Retention policy defined and enforced | [ ] Pass [ ] Fail [ ] N/A | |
| D.7 | Backup encryption and access control | [ ] Pass [ ] Fail [ ] N/A | |
| D.8 | No sensitive data in URLs, query parameters, or client-side storage | [ ] Pass [ ] Fail [ ] N/A | |

### 2.5 Security Headers and Configuration

| # | Check | Status | Notes |
|---|-------|--------|-------|
| H.1 | Content-Security-Policy configured | [ ] Pass [ ] Fail [ ] N/A | |
| H.2 | Strict-Transport-Security (HSTS) with includeSubDomains and preload | [ ] Pass [ ] Fail [ ] N/A | |
| H.3 | X-Content-Type-Options: nosniff | [ ] Pass [ ] Fail [ ] N/A | |
| H.4 | X-Frame-Options: DENY (or CSP frame-ancestors) | [ ] Pass [ ] Fail [ ] N/A | |
| H.5 | Referrer-Policy: strict-origin-when-cross-origin | [ ] Pass [ ] Fail [ ] N/A | |
| H.6 | CORS configured restrictively (no wildcard origins for authenticated APIs) | [ ] Pass [ ] Fail [ ] N/A | |
| H.7 | Error messages generic in production (no stack traces, internal paths) | [ ] Pass [ ] Fail [ ] N/A | |
| H.8 | Debug mode disabled in production | [ ] Pass [ ] Fail [ ] N/A | |
| H.9 | Server version headers removed | [ ] Pass [ ] Fail [ ] N/A | |

### 2.6 Logging and Monitoring

| # | Check | Status | Notes |
|---|-------|--------|-------|
| L.1 | Security events logged (auth success/failure, authz failures, data access) | [ ] Pass [ ] Fail [ ] N/A | |
| L.2 | No sensitive data in logs (passwords, tokens, PII, credit cards) | [ ] Pass [ ] Fail [ ] N/A | |
| L.3 | Logs shipped to centralized logging system | [ ] Pass [ ] Fail [ ] N/A | |
| L.4 | Alerting configured for critical security events | [ ] Pass [ ] Fail [ ] N/A | |
| L.5 | Log retention meets compliance requirements | [ ] Pass [ ] Fail [ ] N/A | |
| L.6 | Structured logging format (JSON) with correlation IDs | [ ] Pass [ ] Fail [ ] N/A | |

### 2.7 Dependencies and Supply Chain

| # | Check | Status | Notes |
|---|-------|--------|-------|
| S.1 | SCA scan completed with no critical/high vulnerabilities | [ ] Pass [ ] Fail [ ] N/A | |
| S.2 | All dependencies version-pinned with integrity hashes | [ ] Pass [ ] Fail [ ] N/A | |
| S.3 | No unnecessary dependencies included | [ ] Pass [ ] Fail [ ] N/A | |
| S.4 | License compliance verified (no incompatible licenses) | [ ] Pass [ ] Fail [ ] N/A | |
| S.5 | SBOM generated for the release | [ ] Pass [ ] Fail [ ] N/A | |

### 2.8 Infrastructure

| # | Check | Status | Notes |
|---|-------|--------|-------|
| F.1 | IAM roles follow least privilege principle | [ ] Pass [ ] Fail [ ] N/A | |
| F.2 | Network segmentation appropriate for data sensitivity | [ ] Pass [ ] Fail [ ] N/A | |
| F.3 | Secrets managed via secrets manager (not in code or env files) | [ ] Pass [ ] Fail [ ] N/A | |
| F.4 | IaC scanned for misconfigurations | [ ] Pass [ ] Fail [ ] N/A | |
| F.5 | Container images: minimal, non-root, scanned, signed | [ ] Pass [ ] Fail [ ] N/A | |
| F.6 | CloudTrail/audit logging enabled for relevant services | [ ] Pass [ ] Fail [ ] N/A | |

---

## 3. Findings

### Finding Summary

| Severity | Count |
|----------|-------|
| Critical | [n] |
| High | [n] |
| Medium | [n] |
| Low | [n] |
| Informational | [n] |

### Finding Details

#### Finding 1: [Title]

| Field | Value |
|-------|-------|
| ID | SEC-REV-F-001 |
| Severity | [Critical / High / Medium / Low / Informational] |
| Category | [Authentication / Authorization / Injection / Data Protection / Configuration / Supply Chain / Infrastructure] |
| Checklist Item | [Reference to checklist item, e.g., A.3] |
| Description | [Detailed description of the vulnerability or weakness] |
| Evidence | [How the finding was identified — code reference, scan result, manual test] |
| Impact | [What could happen if this vulnerability is exploited] |
| Recommendation | [Specific remediation guidance] |
| Remediation Owner | [Name] |
| Remediation Deadline | [Date based on severity SLA] |
| Status | [Open / In Progress / Resolved / Verified] |

[Repeat for each finding]

---

## 4. Recommendations

### Immediate Actions (Before Deployment)

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | [Action required before deployment] | | |

### Short-term Actions (Within 30 Days)

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | [Post-deployment improvement] | | |

### Long-term Actions (Within 90 Days)

| # | Action | Owner | Deadline |
|---|--------|-------|----------|
| 1 | [Architecture improvement, technical debt] | | |

---

## 5. Review Outcome

**Deployment Decision:**
- [ ] Approved — No critical or high findings
- [ ] Approved with conditions — High findings with compensating controls documented
- [ ] Blocked — Critical findings must be resolved before deployment
- [ ] Deferred — Additional investigation required

**Conditions for Approval (if applicable):**
[List any conditions that must be met]

**Next Review Date:** [YYYY-MM-DD or "On next major change"]

---

## 6. Sign-off

| Role | Name | Approval | Date |
|------|------|----------|------|
| Security Reviewer | | [ ] Approved | |
| Engineering Lead | | [ ] Acknowledged | |
| Product Owner | | [ ] Acknowledged | |

---

## Cross-References

- `Patterns/security_review_pattern.md` — Review process
- `Templates/threat_model_template.md` — Associated threat model
- `07_secure_sdlc/security_testing.md` — Testing methodologies
