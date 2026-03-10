# Approval Workflow Pattern

## Pattern Summary

A multi-step approval process where requests are submitted, routed to appropriate approvers based on business rules, and tracked through approval, rejection, or escalation to completion. This pattern handles the complete approval lifecycle including request submission, routing logic, parallel and sequential approvals, escalation, delegation, notifications, and audit trails.

---

## 1. Problem Statement

Business processes require human approval at key decision points (purchase requests, time-off requests, content publication, access grants). The approval process must be tracked, auditable, timely, and resistant to bottlenecks from absent or unresponsive approvers.

---

## 2. Architecture

```
┌─────────────┐     ┌──────────────┐     ┌───────────────┐     ┌──────────┐
│   Request    │────>│   Routing    │────>│   Approval    │────>│ Execution│
│  Submission  │     │   Engine     │     │   Engine      │     │  Engine  │
└─────────────┘     └──────────────┘     └───────────────┘     └──────────┘
                                               │
                                               v
                                     ┌───────────────────┐
                                     │  Notification      │
                                     │  Engine            │
                                     └───────────────────┘
                                               │
                                               v
                                     ┌───────────────────┐
                                     │  Escalation        │
                                     │  Engine            │
                                     └───────────────────┘
```

---

## 3. Components

### 3.1 Request Submission

**Input Channels**: Form submission, email, Slack command, API call.

**Required Fields**:
- Request type (purchase, time-off, access, publication)
- Requester identity
- Request details (amount, dates, justification)
- Priority (standard, urgent)
- Supporting documents (if applicable)

**Validation**: Validate all required fields before accepting the request. Reject malformed requests with clear error messages.

### 3.2 Routing Engine

Route each request to the appropriate approver(s) based on business rules:

```yaml
routing_rules:
  purchase_request:
    - condition: "amount < 500"
      approvers: ["direct_manager"]
      type: "sequential"

    - condition: "amount >= 500 AND amount < 5000"
      approvers: ["direct_manager", "department_head"]
      type: "sequential"

    - condition: "amount >= 5000"
      approvers: ["direct_manager", "department_head", "finance_director"]
      type: "sequential"

  time_off_request:
    - condition: "days <= 3"
      approvers: ["direct_manager"]
      type: "sequential"

    - condition: "days > 3"
      approvers: ["direct_manager", "hr"]
      type: "parallel"
```

**Routing Types**:
- **Sequential**: Approvers approve in order. If any rejects, the request is rejected.
- **Parallel**: All approvers review simultaneously. All must approve (AND logic) or any can approve (OR logic).
- **Hierarchical**: Escalates through management levels based on request attributes.

### 3.3 Approval Engine

Manages the approval state machine:

```
SUBMITTED --> PENDING_APPROVAL --> APPROVED --> EXECUTED
                    |                |
                    v                v
               REJECTED        EXECUTION_FAILED
                    |
                    v
              RETURNED (for revision)
```

**State Transitions**:
| Current State | Action | Next State | Trigger |
|--------------|--------|------------|---------|
| SUBMITTED | Route | PENDING_APPROVAL | Automatic |
| PENDING_APPROVAL | Approve | APPROVED (or next approver) | Approver action |
| PENDING_APPROVAL | Reject | REJECTED | Approver action |
| PENDING_APPROVAL | Return | RETURNED | Approver requests changes |
| PENDING_APPROVAL | Escalate | PENDING_APPROVAL (new approver) | Timeout |
| RETURNED | Resubmit | PENDING_APPROVAL | Requester action |
| APPROVED | Execute | EXECUTED | Automatic |

### 3.4 Notification Engine

Send notifications at each state transition:

| Event | Recipient | Channel | Content |
|-------|-----------|---------|---------|
| New request | Approver | Slack + Email | Request summary + approve/reject buttons |
| Approved | Requester + next approver | Slack + Email | Approval confirmation |
| Rejected | Requester | Slack + Email | Rejection with reason |
| Returned | Requester | Slack + Email | Requested changes |
| Escalated | New approver | Slack + Email | Escalation notice + request details |
| Reminder | Approver | Slack | Pending request reminder |
| Executed | Requester | Email | Completion confirmation |

### 3.5 Escalation Engine

Handle unresponsive approvers:

```
Escalation Timeline:
  T+0: Request assigned to approver. Notification sent.
  T+4h: Reminder notification sent.
  T+24h: Second reminder sent. Flag as "overdue."
  T+48h: Escalate to approver's manager. Notify original approver.
  T+72h: Auto-approve (for low-risk) or escalate to admin (for high-risk).
```

**Delegation**: Approvers can delegate their approval authority when out of office:
- Set a delegate who receives all approval requests
- Delegate has the same approval authority as the original approver
- Delegation is time-limited (start date, end date)
- All delegated approvals are logged with both the delegate and original approver

---

## 4. Data Model

### 4.1 Request Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique request identifier |
| type | string | Request type (purchase, time_off, etc.) |
| requester_id | string | Who submitted the request |
| status | string | Current status |
| priority | string | Standard or urgent |
| data | JSON | Request-specific data |
| created_at | timestamp | Submission time |
| updated_at | timestamp | Last status change |
| completed_at | timestamp | Final resolution time |

### 4.2 Approval Table

| Field | Type | Description |
|-------|------|-------------|
| id | UUID | Unique approval step identifier |
| request_id | UUID | Reference to the request |
| approver_id | string | Assigned approver |
| delegate_id | string | Delegate who acted (if delegated) |
| sequence | integer | Order in sequential approval |
| status | string | pending, approved, rejected, skipped |
| decision_at | timestamp | When the decision was made |
| comments | text | Approver's comments |

---

## 5. Implementation by Platform

### 5.1 n8n Implementation
- Webhook trigger for request submission
- Function node for routing logic
- Wait node for approval (webhook resume)
- IF/Switch nodes for branching on approval/rejection
- Schedule trigger for escalation checks

### 5.2 Zapier Implementation
- Zapier Tables for request and approval tracking
- Webhooks for Slack button callbacks
- Paths for approval routing
- Schedule trigger for escalation checks

### 5.3 Make Implementation
- Custom webhook for submission
- Data store for request tracking
- Router for approval routing
- Scheduled scenario for escalation

---

## 6. Monitoring

| Metric | Target | Alert |
|--------|--------|-------|
| Average approval time | < 24 hours | > 48 hours |
| Escalation rate | < 10% | > 25% |
| Rejection rate | Track (no target) | Sudden increase |
| Request volume | Track trends | 3x normal volume |
| System availability | 99.9% | Any downtime |

---

## 7. Implementation Checklist

- [ ] Request submission form/endpoint configured
- [ ] Routing rules defined and implemented
- [ ] Approval state machine implemented
- [ ] Notification templates created for all events
- [ ] Escalation timeline configured
- [ ] Delegation mechanism implemented
- [ ] Audit trail logging all state transitions
- [ ] Dashboard for request tracking
- [ ] Monitoring and alerting configured
- [ ] Documentation and user training completed

---

*See `06_business_process/process_automation.md` for BPA strategy.*
