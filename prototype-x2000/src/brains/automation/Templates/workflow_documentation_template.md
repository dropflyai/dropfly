# Workflow Documentation Template

## Workflow Identity

| Field | Value |
|-------|-------|
| **Workflow Name** | [Name following convention: `{domain}_{action}_{target}_v{N}`] |
| **Workflow ID** | [Platform-assigned ID or internal reference] |
| **Platform** | [n8n / Zapier / Make / Custom] |
| **Author** | [Name] |
| **Created** | [YYYY-MM-DD] |
| **Last Modified** | [YYYY-MM-DD] |
| **Version** | [1.0] |
| **Status** | [Active / Paused / Deprecated / Testing] |
| **Environment** | [Production / Staging / Development] |
| **Tags** | [e.g., sales, sync, critical, daily] |

---

## 1. Purpose and Context

### 1.1 What This Workflow Does

[2-3 sentence description of what the workflow accomplishes in business terms. Write this for someone who is not technical.]

### 1.2 Why This Workflow Exists

[Brief description of the business problem this workflow solves. Reference the original automation spec if one exists.]

**Specification Reference:** [Link to automation_spec if applicable]

### 1.3 Business Impact

| Metric | Value |
|--------|-------|
| Frequency | [How often it runs: e.g., "Every 2 hours" or "On new Salesforce contact"] |
| Volume | [Typical data volume per execution: e.g., "50-200 records"] |
| Business criticality | [Critical / High / Medium / Low] |
| Downstream dependents | [What breaks if this workflow fails] |
| SLA | [Expected completion time, e.g., "< 5 minutes from trigger"] |

---

## 2. Workflow Diagram

### 2.1 High-Level Flow

```
[Provide an ASCII diagram of the workflow]

Example:
                    ┌──────────────────┐
                    │   TRIGGER        │
                    │   Webhook: New   │
                    │   Contact in CRM │
                    └────────┬─────────┘
                             │
                    ┌────────v─────────┐
                    │   VALIDATE       │
                    │   Check required │
                    │   fields present │
                    └────────┬─────────┘
                             │
                   ┌─────────┴─────────┐
                   │                   │
          ┌────────v──────┐   ┌────────v──────┐
          │  VALID        │   │  INVALID      │
          │  Transform &  │   │  Log error &  │
          │  enrich data  │   │  notify admin │
          └────────┬──────┘   └───────────────┘
                   │
          ┌────────v──────┐
          │  LOAD         │
          │  Create in    │
          │  target system│
          └────────┬──────┘
                   │
          ┌────────v──────┐
          │  CONFIRM      │
          │  Update sync  │
          │  status       │
          └───────────────┘
```

### 2.2 Step-by-Step Breakdown

| Step # | Node/Action Name | Type | Description | Input | Output |
|--------|-----------------|------|-------------|-------|--------|
| 1 | [Trigger Name] | Trigger | [What initiates this step] | [External event] | [Trigger payload] |
| 2 | [Validation] | Function | [What this step does] | [Trigger output] | [Validated data] |
| 3 | [Branch] | IF/Switch | [Decision logic] | [Validated data] | [Routed data] |
| 4a | [Transform] | Function | [Happy path processing] | [Valid data] | [Transformed data] |
| 4b | [Error Log] | Action | [Error path processing] | [Invalid data] | [Error record] |
| 5 | [API Call] | HTTP | [External system interaction] | [Transformed data] | [API response] |
| 6 | [Update Status] | Action | [Final bookkeeping] | [API response] | [Status record] |

---

## 3. Trigger Configuration

### 3.1 Trigger Details

| Property | Value |
|----------|-------|
| Type | [Webhook / Schedule / Polling / Event / Manual] |
| Source | [System or cron expression] |
| URL/Endpoint | [Webhook URL if applicable] |
| Authentication | [How the trigger is secured] |
| Payload Format | [JSON / Form / XML] |

### 3.2 Trigger Conditions

```yaml
# Conditions that must be met for the workflow to execute
conditions:
  - field: "event_type"
    operator: "equals"
    value: "contact.created"
  - field: "contact.email"
    operator: "is_not_empty"
  - field: "contact.source"
    operator: "not_equals"
    value: "integration_sync"  # Prevent circular triggers
```

### 3.3 Sample Trigger Payload

```json
{
  "event_type": "contact.created",
  "timestamp": "2024-03-15T10:30:00Z",
  "data": {
    "id": "ct_abc123",
    "email": "jane@example.com",
    "first_name": "Jane",
    "last_name": "Doe",
    "company": "Acme Corp",
    "source": "web_form",
    "created_at": "2024-03-15T10:29:55Z"
  }
}
```

---

## 4. Node/Step Configuration

### Step [N]: [Node Name]

**Purpose:** [What this step accomplishes]

**Configuration:**

| Setting | Value |
|---------|-------|
| Node Type | [HTTP Request / Function / IF / Set / etc.] |
| Connected To | [Previous node → This node → Next node] |
| Timeout | [Seconds] |
| Retry on Failure | [Yes/No, retry count] |
| Continue on Error | [Yes/No] |

**Logic/Code:**

```javascript
// If this is a function/code node, document the logic
// Example:
const input = $input.all();
const validated = input.filter(item => {
  const email = item.json.data.email;
  return email && email.includes('@') && email.length > 5;
});

if (validated.length === 0) {
  throw new Error('No valid records in batch');
}

return validated.map(item => ({
  json: {
    email: item.json.data.email.toLowerCase().trim(),
    full_name: `${item.json.data.first_name} ${item.json.data.last_name}`,
    company: item.json.data.company,
    source_id: item.json.data.id,
    synced_at: new Date().toISOString()
  }
}));
```

**Notes:** [Any important context about this step's behavior, edge cases, or decisions]

[Repeat this section for each step in the workflow]

---

## 5. Data Transformations

### 5.1 Field Transformations

| Input Field | Transformation | Output Field | Example |
|------------|---------------|-------------|---------|
| `data.email` | Lowercase, trim | `email` | `" Jane@Example.COM "` → `"jane@example.com"` |
| `data.first_name` + `data.last_name` | Concatenate | `full_name` | `"Jane"` + `"Doe"` → `"Jane Doe"` |
| `data.phone` | E.164 normalization | `phone` | `"(555) 123-4567"` → `"+15551234567"` |
| `data.created_at` | Parse ISO 8601 | `created_date` | `"2024-03-15T10:29:55Z"` → `"2024-03-15"` |

### 5.2 Conditional Logic

```
IF amount > 5000:
  route = "high_value_path"
  requires_approval = true
ELIF amount > 500:
  route = "standard_path"
  requires_approval = false
ELSE:
  route = "low_value_path"
  requires_approval = false
```

### 5.3 Data Validation Rules

| Field | Rule | On Failure |
|-------|------|-----------|
| `email` | Required, valid email format | Skip record, log error |
| `first_name` | Required, max 100 chars | Skip record, log error |
| `phone` | Optional, valid phone if present | Clear field, continue |
| `amount` | Required, numeric, > 0 | Skip record, log error |

---

## 6. External System Interactions

### 6.1 API Calls

| Step | System | Endpoint | Method | Auth | Rate Limit | Timeout |
|------|--------|----------|--------|------|-----------|---------|
| 5 | [System B] | `POST /api/v3/contacts` | POST | OAuth 2.0 | 100/10s | 30s |
| 6 | [System A] | `PATCH /api/v2/contacts/{id}` | PATCH | API Key | 100/min | 30s |

### 6.2 Credential References

| Credential Name | Store Location | Used By Steps | Rotation Schedule |
|----------------|---------------|--------------|------------------|
| `salesforce_oauth` | Credential Store | Step 3, 6 | Auto-refresh / 180-day secret |
| `hubspot_api_key` | Credential Store | Step 5 | 90-day rotation |

---

## 7. Error Handling

### 7.1 Error Handling Configuration

| Step | Error Type | Handling | Notification |
|------|-----------|----------|-------------|
| All | Uncaught exception | Halt workflow, log error | Slack #automation-alerts |
| 3 | Validation failure | Skip record, continue batch | Email summary |
| 5 | API 429 (rate limited) | Wait 60s, retry 3x | None (expected) |
| 5 | API 401 (auth failure) | Halt workflow | PagerDuty |
| 5 | API 5xx (server error) | Retry 3x (exp backoff) | Slack after 3rd failure |
| 5 | API timeout | Retry 3x (30s, 60s, 120s) | Slack after 3rd failure |

### 7.2 Error Output Format

When errors are logged, they follow this format:

```json
{
  "workflow_id": "wf_sales_sync_contacts_v2",
  "execution_id": "exec_789xyz",
  "step": "5_create_contact",
  "timestamp": "2024-03-15T10:30:15Z",
  "error_type": "api_error",
  "error_code": "429",
  "error_message": "Rate limit exceeded. Retry after 60 seconds.",
  "record_id": "ct_abc123",
  "retry_count": 2,
  "resolved": true,
  "resolution": "Succeeded on retry 3"
}
```

### 7.3 Recovery Procedures

| Failure Mode | Manual Recovery Steps |
|-------------|----------------------|
| Workflow halted mid-batch | 1. Check error logs. 2. Fix root cause. 3. Re-run from last checkpoint. |
| Credential expired | 1. Rotate credential. 2. Update credential store. 3. Re-enable workflow. |
| Target system outage | 1. Pause workflow. 2. Wait for system recovery. 3. Run reconciliation. |

---

## 8. Execution Details

### 8.1 Schedule (if scheduled)

| Property | Value |
|----------|-------|
| Cron Expression | [e.g., `0 */2 * * *`] |
| Human Readable | [e.g., "Every 2 hours at minute 0"] |
| Timezone | [e.g., UTC] |
| Timeout | [e.g., 30 minutes] |
| Max Concurrent | [e.g., 1 (no overlap)] |

### 8.2 Typical Performance

| Metric | Value |
|--------|-------|
| Average execution time | [e.g., 2 min 15 sec] |
| Average records processed | [e.g., 125 records] |
| Peak records processed | [e.g., 500 records] |
| Memory usage | [e.g., 128 MB] |

### 8.3 Concurrency and Ordering

- **Concurrent executions allowed:** [Yes/No]
- **If concurrent, conflict prevention:** [Locking / partitioning / idempotency]
- **Ordering guarantees:** [FIFO / best-effort / none]

---

## 9. Monitoring

### 9.1 Alerts

| Alert | Condition | Channel | Severity |
|-------|-----------|---------|----------|
| Workflow failed | Any execution failure | Slack + Email | High |
| Slow execution | Duration > 2x average | Slack | Medium |
| High error rate | > 5% records failed in batch | Slack | Medium |
| No executions | No runs in expected window | Email | Low |
| Volume anomaly | Records > 3x or < 0.3x average | Slack | Low |

### 9.2 Dashboard Panels

- Execution timeline (success/failure)
- Duration trend (last 30 days)
- Records processed per execution
- Error rate trend
- Active alerts

---

## 10. Dependencies

### 10.1 Upstream Dependencies

| Dependency | Type | Impact if Unavailable |
|-----------|------|----------------------|
| [System A API] | External API | Workflow cannot trigger |
| [Database] | Infrastructure | Cannot read/write mapping data |

### 10.2 Downstream Dependents

| Dependent | Type | Impact if This Workflow Fails |
|-----------|------|------------------------------|
| [Report generation] | Workflow | Reports show stale data |
| [Sales dashboard] | Application | Dashboard shows incomplete contacts |

---

## 11. Change History

| Version | Date | Author | Change Description | Reviewed By |
|---------|------|--------|--------------------|-------------|
| 1.0 | [Date] | [Name] | Initial implementation | [Name] |
| 1.1 | [Date] | [Name] | Added phone normalization | [Name] |

---

## 12. Runbook

### 12.1 Common Issues

| Symptom | Likely Cause | Resolution |
|---------|-------------|------------|
| Workflow not triggering | Webhook URL changed | Update webhook configuration in source system |
| All records failing validation | Source API schema changed | Review field mapping, update transformations |
| Execution timeout | Volume spike | Increase timeout or implement batching |
| Duplicate records created | Dedup logic bypassed | Check match key configuration |

### 12.2 Emergency Procedures

**To pause this workflow:**
1. Navigate to [platform URL]
2. Find workflow: [workflow name]
3. Click "Deactivate" / "Pause"
4. Notify team in Slack #automation-alerts

**To perform emergency resync:**
1. Pause the real-time workflow
2. Trigger manual reconciliation job
3. Review reconciliation report
4. Re-enable real-time workflow

---

*This documentation follows the Automation Brain standards. See `08_governance/automation_governance.md` for documentation requirements and review schedules.*
