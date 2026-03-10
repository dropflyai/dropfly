# Security Review Pattern — Systematic Assessment for Features and Services

## Problem Statement

Every new feature, service, architecture change, and external integration introduces potential security risk. Without a structured review process, security assessments are inconsistent, incomplete, and dependent on individual reviewer expertise. This pattern provides a repeatable, comprehensive security review process that ensures consistent coverage across all review engagements.

---

## Context

Apply this pattern when:
- A new feature is being designed that handles authentication, authorization, or sensitive data
- A new microservice or API is being deployed to production
- An existing architecture is undergoing significant changes
- A new third-party integration or dependency is being added
- A major technology stack change is planned
- Any change that crosses a trust boundary or modifies data flows
- Pre-deployment review is required by policy

---

## Solution — Security Review Process

### Phase 1: Intake and Scoping (1-2 days)

**1.1 Gather Context**
Request the following from the development team:
- Architecture diagram or Data Flow Diagram (DFD)
- Design document or technical specification
- Data classification of data handled (public/internal/confidential/restricted)
- User stories or requirements related to security
- Technology stack and dependencies
- Deployment environment (cloud, on-prem, hybrid)
- Compliance requirements applicable to this system

**1.2 Determine Review Depth**

| Criteria | Lightweight Review | Standard Review | Deep Review |
|----------|-------------------|-----------------|-------------|
| Handles PII/PHI/PCI | No | Some | Significant |
| Internet-facing | No | Yes | Yes |
| Authentication/authorization changes | No | Minor | Major |
| New external integration | No | Low-risk | High-risk |
| Architecture change | Minor | Moderate | Fundamental |
| Estimated review effort | 2-4 hours | 1-2 days | 3-5 days |

**1.3 Schedule Review**
- Lightweight: Async review, no meeting required
- Standard: 60-minute review meeting + async follow-up
- Deep: Threat modeling workshop + detailed review + follow-up sessions

### Phase 2: Threat Modeling (Standard and Deep Reviews)

**2.1 Construct or Review DFD**
- Identify all processes, data stores, data flows, external entities
- Draw trust boundaries
- Classify each data flow by sensitivity level
- Identify entry points (attack surface)

**2.2 Apply STRIDE-per-Element**
For each DFD element, systematically consider applicable STRIDE categories:
- External entities: Spoofing, Repudiation
- Processes: All six STRIDE categories
- Data stores: Tampering, Information Disclosure, Denial of Service
- Data flows: Tampering, Information Disclosure, Denial of Service

**2.3 Identify Threats**
For each applicable STRIDE category on each element:
- Is there a realistic attack scenario?
- What is the potential impact?
- What existing controls mitigate this threat?
- Are additional controls needed?

**2.4 Document Findings**
Use `Templates/threat_model_template.md` for structured output.

### Phase 3: Technical Security Assessment

**3.1 Authentication Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Authentication mechanism | Industry standard (OAuth2/OIDC, session-based) | |
| Password storage | Argon2id or bcrypt, appropriate cost factor | |
| MFA support | Available for sensitive operations | |
| Session management | HttpOnly, Secure, SameSite cookies; server-side sessions | |
| Token handling | Short-lived access tokens, secure refresh token rotation | |
| Brute force protection | Rate limiting, account lockout, CAPTCHA | |
| Password policy | Minimum length 12+, breach database check | |

**3.2 Authorization Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Access control model | RBAC or ABAC consistently applied | |
| Authorization on every endpoint | No endpoint accessible without authorization check | |
| IDOR prevention | Object-level authorization on all resource access | |
| Privilege escalation prevention | Role/permission changes require elevated authorization | |
| Default deny | Unrecognized requests are denied, not allowed | |
| Separation of duties | Critical operations require multiple authorizations | |

**3.3 Data Protection Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Encryption at rest | AES-256-GCM or equivalent for confidential/restricted data | |
| Encryption in transit | TLS 1.2+ for all connections, TLS 1.3 preferred | |
| Data classification applied | All data stores classified and labeled | |
| Data minimization | Only necessary data collected and retained | |
| Retention policy | Defined retention periods, automated purging | |
| Backup security | Backups encrypted, access-controlled, tested | |

**3.4 Input Validation Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Input validation | All user input validated (type, length, format, range) | |
| Output encoding | Context-appropriate encoding for all output | |
| Parameterized queries | No string concatenation in database queries | |
| File upload security | Type validation, size limits, malware scanning | |
| API schema validation | Request/response validation against OpenAPI schema | |

**3.5 Logging and Monitoring Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Security events logged | Authentication, authorization, data access, admin actions | |
| No sensitive data in logs | PII, passwords, tokens not logged | |
| Log integrity | Logs shipped to centralized, tamper-resistant storage | |
| Alerting configured | Critical security events trigger alerts | |
| Audit trail | Actions attributable to specific users/services | |

**3.6 Dependency and Supply Chain Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Dependencies scanned | SCA scan with no critical/high vulnerabilities | |
| Dependencies pinned | Exact versions with integrity hashes in lock file | |
| Minimal dependencies | No unnecessary dependencies included | |
| License compliance | No copyleft license contamination | |
| SBOM generated | SBOM produced and stored with release artifact | |

**3.7 Infrastructure Review**

| Check | Criteria | Pass/Fail |
|-------|----------|-----------|
| Least privilege IAM | Service roles have minimum required permissions | |
| Network segmentation | Service isolated to appropriate network zone | |
| Secrets management | Secrets in vault/secrets manager, not in code or environment | |
| IaC scanning | Terraform/CloudFormation scanned for misconfigurations | |
| Container security | Non-root, minimal base image, scanned, signed | |

### Phase 4: Findings and Recommendations

**4.1 Classify Findings**

| Severity | Definition | SLA |
|----------|-----------|-----|
| Critical | Exploitable vulnerability with severe impact, must fix before deployment | Block deployment |
| High | Significant vulnerability, should fix before deployment or immediately after with compensating controls | Fix within 7 days |
| Medium | Moderate vulnerability, fix within normal development cycle | Fix within 30 days |
| Low | Minor issue, best practice improvement | Fix within 90 days |
| Informational | Observation, no immediate risk | Track for future improvement |

**4.2 Document Findings**
Use `Templates/security_review_template.md` for structured output. Each finding includes:
- Description of the vulnerability or weakness
- Risk rating with justification
- Specific remediation recommendation
- Verification method (how to confirm the fix)

**4.3 Review Meeting**
- Present findings to development team
- Discuss remediation options and timeline
- Agree on action items with owners and deadlines
- Schedule re-review for critical/high findings

### Phase 5: Verification and Closure

1. Development team implements fixes
2. Security team verifies critical/high findings are resolved
3. Re-scan or re-test as appropriate
4. Close the security review with documented outcome
5. Update threat model to reflect final architecture

---

## Verification

This pattern is correctly applied when:
- All Phase 3 checklists are completed (no items left blank)
- All critical and high findings have remediation plans with owners
- The review is documented using the standard template
- Critical findings block deployment until resolved
- The threat model is updated and stored with the codebase

---

## Anti-Patterns

| Anti-Pattern | Risk | Correct Approach |
|-------------|------|-----------------|
| Rubber-stamp review | Vulnerabilities ship to production | Complete all checklist items, document findings honestly |
| Review after deployment | Vulnerabilities already exposed | Review during design/development, before deployment |
| Review without threat model | Incomplete coverage | Always construct or update threat model |
| Findings without remediation | Issues identified but never fixed | Every finding needs an owner, deadline, and verification |
| One-time review | Security degrades as system evolves | Review on major changes, annual re-review minimum |

---

## Cross-References

- `03_threat_modeling/threat_modeling_methods.md` — Threat modeling methodology
- `07_secure_sdlc/security_testing.md` — Technical testing methods
- `Templates/security_review_template.md` — Review output format
- `Templates/threat_model_template.md` — Threat model format
- `eval/SecurityScore.md` — Quality criteria for reviews
