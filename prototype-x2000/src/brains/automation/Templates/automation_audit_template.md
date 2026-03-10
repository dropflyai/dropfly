# Automation Audit Template

## Audit Information

| Field | Value |
|-------|-------|
| **Audit ID** | [AUD-YYYY-NNN] |
| **Audit Type** | [Scheduled / Triggered / Pre-Deployment / Post-Incident] |
| **Auditor** | [Name and role] |
| **Audit Date** | [YYYY-MM-DD] |
| **Scope** | [Single workflow / Domain / Full platform] |
| **Previous Audit** | [Date and reference of previous audit] |

---

## 1. Audit Scope

### 1.1 Workflows Under Review

| Workflow Name | Platform | Status | Last Modified | Owner | Criticality |
|--------------|----------|--------|--------------|-------|-------------|
| [workflow_name_v1] | [n8n] | [Active] | [YYYY-MM-DD] | [Name] | [Critical] |
| [workflow_name_v2] | [Zapier] | [Active] | [YYYY-MM-DD] | [Name] | [High] |
| [workflow_name_v3] | [Make] | [Paused] | [YYYY-MM-DD] | [Name] | [Medium] |

### 1.2 Audit Objectives

- [ ] Verify all workflows follow naming and documentation standards
- [ ] Verify error handling is implemented and functioning
- [ ] Verify monitoring and alerting are configured
- [ ] Verify credentials are properly managed and rotated
- [ ] Verify data handling complies with privacy requirements
- [ ] Verify access controls are appropriately configured
- [ ] Identify unused, orphaned, or deprecated workflows
- [ ] Assess overall automation health and reliability

---

## 2. Governance Compliance

### 2.1 Naming Standards

| Workflow | Naming Convention Compliant | Issue | Remediation |
|----------|---------------------------|-------|-------------|
| [workflow_1] | [Pass / Fail] | [Description if fail] | [Required action] |
| [workflow_2] | [Pass / Fail] | [Description if fail] | [Required action] |

**Standard:** `{domain}_{action}_{target}_v{N}` (see `08_governance/automation_governance.md`)

**Compliance Rate:** ___/___  (___ %)

### 2.2 Documentation Standards

| Workflow | Spec Exists | Workflow Doc Exists | Doc Current | Issue | Remediation |
|----------|-----------|-------------------|------------|-------|-------------|
| [workflow_1] | [Y/N] | [Y/N] | [Y/N] | [Description] | [Action] |
| [workflow_2] | [Y/N] | [Y/N] | [Y/N] | [Description] | [Action] |

**Required Documents:**
- Automation Specification (for new workflows)
- Workflow Documentation (for all active workflows)
- Integration Design (for integration workflows)

**Documentation Compliance Rate:** ___/___  (___ %)

### 2.3 Version Control

| Workflow | Version Tracked | Change History Complete | Rollback Capable | Issue |
|----------|---------------|----------------------|-----------------|-------|
| [workflow_1] | [Y/N] | [Y/N] | [Y/N] | [Description] |
| [workflow_2] | [Y/N] | [Y/N] | [Y/N] | [Description] |

**Version Control Compliance Rate:** ___/___  (___ %)

### 2.4 Ownership and Access Control

| Workflow | Owner Assigned | Owner Active | Access Appropriate | Issue |
|----------|-------------|-------------|-------------------|-------|
| [workflow_1] | [Y/N] | [Y/N] | [Y/N] | [Description] |
| [workflow_2] | [Y/N] | [Y/N] | [Y/N] | [Description] |

**Orphaned Workflows (no active owner):** [Count]

---

## 3. Reliability Audit

### 3.1 Error Handling

| Workflow | Error Handling Implemented | Retry Logic | Dead Letter Queue | Alerting on Failure |
|----------|--------------------------|-------------|-------------------|-------------------|
| [workflow_1] | [Full / Partial / None] | [Y/N] | [Y/N] | [Y/N] |
| [workflow_2] | [Full / Partial / None] | [Y/N] | [Y/N] | [Y/N] |

**Error Handling Evaluation Criteria:**
- **Full:** All external calls have try/catch, retry with backoff, dead letter queue for unrecoverable errors, alerting configured
- **Partial:** Some error handling exists but gaps identified
- **None:** No error handling beyond platform defaults

**Error Handling Compliance Rate:** ___/___  (___ %)

### 3.2 Execution Reliability (Last 30 Days)

| Workflow | Total Executions | Successes | Failures | Success Rate | Avg Duration | P95 Duration |
|----------|-----------------|-----------|----------|-------------|-------------|-------------|
| [workflow_1] | [N] | [N] | [N] | [N%] | [Ns] | [Ns] |
| [workflow_2] | [N] | [N] | [N] | [N%] | [Ns] | [Ns] |

**Target Success Rate:** > 99%
**Workflows Below Target:** [List]

### 3.3 Failure Analysis

| Workflow | Failure Count | Top Failure Reason | Repeat Failures | Root Cause Addressed |
|----------|--------------|-------------------|----------------|---------------------|
| [workflow_1] | [N] | [Reason] | [Y/N] | [Y/N] |
| [workflow_2] | [N] | [Reason] | [Y/N] | [Y/N] |

### 3.4 Monitoring and Alerting

| Workflow | Monitoring Configured | Alert Channels | Alert Tested | Dashboard Exists |
|----------|---------------------|---------------|-------------|-----------------|
| [workflow_1] | [Y/N] | [Slack/Email/PD] | [Y/N] | [Y/N] |
| [workflow_2] | [Y/N] | [Slack/Email/PD] | [Y/N] | [Y/N] |

**Monitoring Compliance Rate:** ___/___  (___ %)

---

## 4. Security Audit

### 4.1 Credential Management

| Credential | Used By | Storage Method | Last Rotated | Rotation Overdue | Least Privilege |
|-----------|---------|---------------|-------------|-----------------|----------------|
| [cred_1] | [workflows] | [Encrypted store] | [YYYY-MM-DD] | [Y/N] | [Y/N] |
| [cred_2] | [workflows] | [Encrypted store] | [YYYY-MM-DD] | [Y/N] | [Y/N] |

**Rotation Policy:** API keys every 90 days, OAuth secrets every 180 days

**Credentials Overdue for Rotation:** [Count]

**Credentials with Excessive Permissions:** [Count]

### 4.2 Credential Security Issues

| Issue | Severity | Credential | Details | Remediation |
|-------|----------|-----------|---------|-------------|
| [Hardcoded credential] | Critical | [cred_name] | [Found in workflow config] | [Move to credential store] |
| [Rotation overdue] | High | [cred_name] | [Last rotated 200 days ago] | [Rotate immediately] |
| [Excessive permissions] | Medium | [cred_name] | [Full admin instead of read-only] | [Restrict permissions] |

### 4.3 Data Security

| Workflow | Handles PII | PII Masked in Logs | Encrypted in Transit | Data Retention Compliant |
|----------|-----------|-------------------|---------------------|------------------------|
| [workflow_1] | [Y/N] | [Y/N] | [Y/N] | [Y/N] |
| [workflow_2] | [Y/N] | [Y/N] | [Y/N] | [Y/N] |

**PII Handling Issues:**

| Issue | Workflow | Details | Remediation |
|-------|----------|---------|-------------|
| [PII in plain text logs] | [workflow_1] | [Email addresses visible in execution logs] | [Implement log masking] |

### 4.4 Webhook Security

| Webhook Endpoint | Signature Verification | IP Restriction | Rate Limiting | HTTPS Only |
|-----------------|----------------------|---------------|--------------|-----------|
| [endpoint_1] | [Y/N] | [Y/N] | [Y/N] | [Y/N] |
| [endpoint_2] | [Y/N] | [Y/N] | [Y/N] | [Y/N] |

**Webhook Security Compliance Rate:** ___/___  (___ %)

### 4.5 Platform Access

| User | Role | Last Active | MFA Enabled | Access Appropriate |
|------|------|-----------|------------|-------------------|
| [user_1] | [Admin] | [YYYY-MM-DD] | [Y/N] | [Y/N] |
| [user_2] | [Editor] | [YYYY-MM-DD] | [Y/N] | [Y/N] |

**Inactive Users (> 90 days):** [Count]
**Users Without MFA:** [Count]
**Users with Excessive Privileges:** [Count]

---

## 5. Performance Audit

### 5.1 Resource Utilization

| Metric | Current | Limit | Utilization | Risk |
|--------|---------|-------|------------|------|
| Workflow count | [N] | [N] | [N%] | [Low/Med/High] |
| Daily executions | [N] | [N] | [N%] | [Low/Med/High] |
| Concurrent executions | [N] | [N] | [N%] | [Low/Med/High] |
| Storage used | [N GB] | [N GB] | [N%] | [Low/Med/High] |
| API calls (platform) | [N/month] | [N/month] | [N%] | [Low/Med/High] |

### 5.2 Performance Issues

| Workflow | Issue | Impact | Recommendation |
|----------|-------|--------|---------------|
| [workflow_1] | [Slow execution: avg 15 min] | [Delays downstream] | [Optimize API calls, add caching] |
| [workflow_2] | [Memory spike during large batches] | [Platform instability] | [Implement pagination] |

### 5.3 Cost Analysis

| Platform/Service | Monthly Cost | Cost Trend | Optimization Opportunity |
|-----------------|-------------|-----------|------------------------|
| [Automation platform] | [$N] | [Stable/Rising/Falling] | [Description] |
| [API service A] | [$N] | [Stable/Rising/Falling] | [Description] |
| [API service B] | [$N] | [Stable/Rising/Falling] | [Description] |
| **Total** | **$N** | | |

---

## 6. Workflow Lifecycle Audit

### 6.1 Active Workflows Assessment

| Workflow | Last Executed | Still Needed | Action |
|----------|-------------|-------------|--------|
| [workflow_1] | [YYYY-MM-DD] | [Yes] | [Keep active] |
| [workflow_2] | [YYYY-MM-DD] | [Uncertain] | [Review with owner] |
| [workflow_3] | [YYYY-MM-DD] | [No] | [Deprecate and archive] |

### 6.2 Deprecated Workflows

| Workflow | Deprecated Date | Replacement | Data Retained | Cleanup Complete |
|----------|----------------|-------------|--------------|-----------------|
| [old_workflow] | [YYYY-MM-DD] | [new_workflow] | [Y/N] | [Y/N] |

### 6.3 Workflow Sprawl Assessment

- **Total active workflows:** [N]
- **Workflows without recent execution (> 30 days):** [N]
- **Workflows without documentation:** [N]
- **Workflows without assigned owner:** [N]
- **Duplicate or overlapping workflows:** [N]
- **Sprawl Risk Level:** [Low / Medium / High / Critical]

---

## 7. Findings Summary

### 7.1 Critical Findings (Immediate Action Required)

| # | Finding | Affected Workflows | Risk | Remediation | Due Date |
|---|---------|-------------------|------|-------------|----------|
| C1 | [Finding description] | [workflow_list] | [Data breach / Outage] | [Action] | [Date] |

### 7.2 High Findings (Action Within 30 Days)

| # | Finding | Affected Workflows | Risk | Remediation | Due Date |
|---|---------|-------------------|------|-------------|----------|
| H1 | [Finding description] | [workflow_list] | [Risk description] | [Action] | [Date] |

### 7.3 Medium Findings (Action Within 90 Days)

| # | Finding | Affected Workflows | Risk | Remediation | Due Date |
|---|---------|-------------------|------|-------------|----------|
| M1 | [Finding description] | [workflow_list] | [Risk description] | [Action] | [Date] |

### 7.4 Low Findings (Best Practice Recommendations)

| # | Finding | Recommendation |
|---|---------|---------------|
| L1 | [Finding description] | [Recommendation] |

---

## 8. Compliance Scorecard

| Category | Items Evaluated | Pass | Fail | N/A | Score |
|----------|---------------|------|------|-----|-------|
| Naming Standards | [N] | [N] | [N] | [N] | [N%] |
| Documentation | [N] | [N] | [N] | [N] | [N%] |
| Error Handling | [N] | [N] | [N] | [N] | [N%] |
| Monitoring | [N] | [N] | [N] | [N] | [N%] |
| Credential Security | [N] | [N] | [N] | [N] | [N%] |
| Data Security | [N] | [N] | [N] | [N] | [N%] |
| Webhook Security | [N] | [N] | [N] | [N] | [N%] |
| Access Control | [N] | [N] | [N] | [N] | [N%] |
| Performance | [N] | [N] | [N] | [N] | [N%] |
| Lifecycle Management | [N] | [N] | [N] | [N] | [N%] |
| **Overall** | **[N]** | **[N]** | **[N]** | **[N]** | **[N%]** |

**Overall Health Rating:** [Excellent (>95%) / Good (85-95%) / Needs Improvement (70-85%) / Poor (<70%)]

---

## 9. Recommendations

### 9.1 Prioritized Action Items

| Priority | Action | Owner | Due Date | Estimated Effort |
|----------|--------|-------|----------|-----------------|
| 1 (Critical) | [Action] | [Name] | [Date] | [Hours/Days] |
| 2 (High) | [Action] | [Name] | [Date] | [Hours/Days] |
| 3 (Medium) | [Action] | [Name] | [Date] | [Hours/Days] |

### 9.2 Strategic Recommendations

[Longer-term recommendations for improving the automation program. These may include process changes, tool investments, training needs, or organizational changes.]

1. **[Recommendation Title]:** [Description and business justification]
2. **[Recommendation Title]:** [Description and business justification]

---

## 10. Sign-Off

| Role | Name | Date | Acknowledged |
|------|------|------|-------------|
| Auditor | [Name] | [Date] | Yes |
| Automation Lead | [Name] | [Date] | [ ] |
| Engineering Lead | [Name] | [Date] | [ ] |
| Security Lead | [Name] | [Date] | [ ] |

**Next Scheduled Audit:** [YYYY-MM-DD]

---

*This audit template follows the Automation Brain governance standards. See `08_governance/automation_governance.md` for audit schedules and `08_governance/security.md` for security requirements.*
