# SECURITY
**Mandatory Security Practices for Engineering Work**

---

## Purpose

Security is not optional.

This document defines minimum security requirements, OWASP-aligned practices, and severity-based security enforcement.

Security failures can result in:
- data breaches
- customer trust loss
- regulatory penalties
- system compromise

---

## OWASP-Style Security Checklist (WEB_SAAS Focus)

### XSS (Cross-Site Scripting)
- [ ] All user input is sanitized before rendering
- [ ] Use framework-provided escaping (React auto-escapes JSX text)
- [ ] Never use `dangerouslySetInnerHTML` or `innerHTML` with user input
- [ ] Sanitize URLs before using in href/src attributes
- [ ] Validate and encode data from APIs before rendering

### CSRF (Cross-Site Request Forgery)
- [ ] All state-changing requests use POST/PUT/DELETE (never GET)
- [ ] CSRF tokens implemented for forms
- [ ] SameSite cookie attribute set (`SameSite=Strict` or `Lax`)
- [ ] Verify Origin/Referer headers on sensitive endpoints

### CSP (Content Security Policy)
- [ ] CSP headers configured (start with `default-src 'self'`)
- [ ] Inline scripts avoided or nonce/hash-based CSP used
- [ ] External script sources explicitly whitelisted
- [ ] Report-only mode tested before enforcement

### Authentication & Session Storage
**DO:**
- Store session tokens in httpOnly, secure cookies
- Use secure session management libraries
- Implement session expiration
- Require re-authentication for sensitive actions
- Use HTTPS everywhere

**DON'T:**
- Store tokens in localStorage (vulnerable to XSS)
- Store passwords in plain text
- Use weak session IDs
- Allow sessions to persist indefinitely
- Trust client-side auth state alone

### Input Validation
- [ ] Validate all inputs on server-side (never trust client)
- [ ] Whitelist allowed inputs (not blacklist)
- [ ] Validate data types, length, format
- [ ] Sanitize file uploads (validate MIME type, scan for malware if possible)
- [ ] Reject unexpected input rather than attempting correction

### Secrets Handling
**DO:**
- Use environment variables for secrets
- Use secret management services (e.g., Doppler, AWS Secrets Manager)
- Rotate secrets regularly
- Use different secrets per environment (dev/staging/prod)

**DON'T:**
- Commit secrets to git (`.env`, `credentials.json`, API keys)
- Log secrets in console or error messages
- Send secrets in URLs or query params
- Store secrets in client-side code

### SQL Injection (if applicable)
- [ ] Use parameterized queries or ORMs
- [ ] Never concatenate user input into SQL strings
- [ ] Validate inputs before database operations
- [ ] Use least-privilege database accounts

### Dependency Security
- [ ] Run `npm audit` or equivalent regularly
- [ ] Address high/critical vulnerabilities promptly
- [ ] Pin dependency versions in package-lock.json
- [ ] Review dependencies before adding (check maintainership, download count, security history)

---

## Security Severity Mapping (P0-P3)

### P0 CRITICAL
- Active exploit or breach
- Data exposure (PII, credentials, tokens)
- Complete authentication bypass
- Remote code execution vulnerability

**Response:** Immediate L3 HOTFIX required.

### P1 HIGH
- XSS or CSRF vulnerability in production
- Missing authentication on sensitive endpoint
- Secrets committed to git (public repo)
- High-severity dependency vulnerability with known exploit

**Response:** Fix within 24-48 hours; L1 BUILD or L3 HOTFIX depending on exposure.

### P2 MEDIUM
- CSP not configured
- Missing input validation on non-critical field
- Medium-severity dependency vulnerability
- Session management weakness (no expiration)

**Response:** Fix in next release cycle; L1 BUILD.

### P3 LOW
- Low-severity dependency vulnerability
- Missing security headers (non-critical)
- Informational security findings
- Security tech debt

**Response:** Fix when convenient; L1 BUILD or defer.

---

## Minimum Security Bar (Process Level)

### L0 EXPLORE
- **DO NOT** commit secrets
- **DO NOT** expose authentication endpoints publicly
- **Optional:** full security checklist (prototypes may skip)
- **Required:** if prototype becomes production, re-evaluate under L1

### L1 BUILD
- **Required:** XSS/CSRF/input validation checks
- **Required:** Secrets handling compliance
- **Required:** `npm audit` run; high/critical vulnerabilities addressed
- **Required:** Authentication/authorization checks for protected routes
- **Optional:** CSP, advanced security headers (recommended but not blocking)

### L2 SHIP
- **Required:** Full OWASP checklist
- **Required:** CSP configured and tested
- **Required:** Security review of authentication flows
- **Required:** All dependency vulnerabilities addressed (high/critical)
- **Required:** Secrets rotation verified
- **Required:** HTTPS enforced

### L3 HOTFIX
- **Required:** No new vulnerabilities introduced by hotfix
- **Required:** Secrets not exposed in logs or commits
- **Optional:** Full security review (defer to post-incident if time-critical)
- **Mandatory:** Post-incident security review within 48 hours

---

## Security Violations (Never Justified)

The following are **never acceptable**, regardless of Process Level or Severity:
- Committing secrets to public repositories
- Disabling authentication for convenience
- Storing passwords in plain text
- Ignoring P0/P1 security vulnerabilities
- Bypassing input validation "temporarily"

---

## Security Failure Response

If a security issue is discovered:
1. **Assess severity** (P0-P3)
2. **Escalate if P0/P1** (notify stakeholders immediately)
3. **Create hotfix** (L3 HOTFIX for P0/P1)
4. **Log incident** in `Engineering/Incidents.md` or incident log
5. **Update Regressions** to prevent recurrence

---

**Security compliance is mandatory and enforced.**
