# LegalFlow Pro - API Documentation

## Complete API Reference for Law Firm Case Management

### Base URL
```
https://your-project.supabase.co
```

### Authentication
All API requests require authentication via JWT token in the Authorization header:
```
Authorization: Bearer <jwt_token>
```

## 📋 Table of Contents

1. [Authentication](#authentication)
2. [Law Firm Management](#law-firm-management)
3. [User Management](#user-management)
4. [Client Management](#client-management)
5. [Case Management](#case-management)
6. [Document Management](#document-management)
7. [Communication Management](#communication-management)
8. [Time Tracking & Billing](#time-tracking--billing)
9. [Calendar & Events](#calendar--events)
10. [Legal Research](#legal-research)
11. [Compliance & Auditing](#compliance--auditing)
12. [Edge Functions](#edge-functions)
13. [Error Handling](#error-handling)

---

## Authentication

### Login
```http
POST /auth/v1/token
Content-Type: application/json

{
  "email": "user@lawfirm.com",
  "password": "secure_password"
}
```

**Response:**
```json
{
  "access_token": "jwt_token",
  "token_type": "bearer",
  "expires_in": 3600,
  "refresh_token": "refresh_token",
  "user": {
    "id": "uuid",
    "email": "user@lawfirm.com",
    "law_firm_id": "uuid",
    "role": "attorney"
  }
}
```

### Get Current User
```http
GET /auth/v1/user
Authorization: Bearer <jwt_token>
```

### Logout
```http
POST /auth/v1/logout
Authorization: Bearer <jwt_token>
```

---

## Law Firm Management

### Get Law Firm Details
```http
GET /rest/v1/law_firms?id=eq.{law_firm_id}
Authorization: Bearer <jwt_token>
```

### Update Law Firm Settings
```http
PATCH /rest/v1/law_firms?id=eq.{law_firm_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "settings": {
    "billing_rate_default": 350.00,
    "document_retention_years": 7,
    "enable_client_portal": true
  }
}
```

---

## User Management

### List Users
```http
GET /rest/v1/users?select=*&law_firm_id=eq.{law_firm_id}
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `role=eq.attorney` - Filter by role
- `is_active=eq.true` - Filter active users
- `order=last_name.asc` - Sort by last name

### Create User
```http
POST /rest/v1/users
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "email": "newuser@lawfirm.com",
  "first_name": "Jane",
  "last_name": "Smith",
  "role": "associate",
  "bar_number": "123456",
  "hourly_rate": 275.00,
  "department": "Litigation"
}
```

### Update User
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "hourly_rate": 300.00,
  "permissions": {
    "can_create_cases": true,
    "can_approve_invoices": false
  }
}
```

### Deactivate User
```http
PATCH /rest/v1/users?id=eq.{user_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "is_active": false
}
```

---

## Client Management

### List Clients
```http
GET /rest/v1/clients?select=*,client_contacts(*)&law_firm_id=eq.{law_firm_id}
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `client_status=eq.active` - Filter by status
- `type=eq.corporation` - Filter by client type
- `name.ilike.*SearchTerm*` - Search by name

### Create Client
```http
POST /rest/v1/clients
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "name": "ABC Corporation",
  "legal_name": "ABC Corporation, Inc.",
  "type": "corporation",
  "client_number": "CL-2025-001",
  "billing_address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001"
  },
  "tax_id": "12-3456789",
  "industry": "Technology"
}
```

### Add Client Contact
```http
POST /rest/v1/client_contacts
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "client_id": "client_uuid",
  "first_name": "John",
  "last_name": "Doe",
  "title": "CEO",
  "email": "john.doe@abccorp.com",
  "phone": "+1-555-123-4567",
  "is_primary": true,
  "is_authorized_representative": true
}
```

### Conflict Check
```http
PATCH /rest/v1/clients?id=eq.{client_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "conflict_check_status": "cleared",
  "conflict_checked_by": "user_uuid",
  "conflict_checked_at": "2025-08-17T10:00:00Z"
}
```

---

## Case Management

### List Cases
```http
GET /rest/v1/cases?select=*,clients(*),users!lead_attorney_id(*)&law_firm_id=eq.{law_firm_id}
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `status=eq.open` - Filter by status
- `practice_area=eq.Litigation` - Filter by practice area
- `lead_attorney_id=eq.{user_id}` - Filter by attorney
- `order=opened_date.desc` - Sort by date

### Create Case
```http
POST /rest/v1/cases
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "client_id": "client_uuid",
  "case_number": "2025-LIT-001",
  "title": "Contract Dispute - ABC Corp vs XYZ Inc",
  "description": "Breach of contract claim regarding software licensing agreement",
  "practice_area": "Commercial Litigation",
  "case_type": "Civil Litigation",
  "court_jurisdiction": "New York State Supreme Court",
  "lead_attorney_id": "attorney_uuid",
  "billing_type": "hourly",
  "billing_rate": 350.00,
  "opened_date": "2025-08-17",
  "statute_of_limitations": "2027-08-17"
}
```

### Assign Case Team Member
```http
POST /rest/v1/case_assignments
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "user_id": "user_uuid",
  "role": "associate_attorney",
  "hourly_rate": 275.00,
  "permissions": {
    "can_edit_case": true,
    "can_view_privileged": true
  }
}
```

### Update Case Status
```http
PATCH /rest/v1/cases?id=eq.{case_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "status": "settled",
  "settlement_amount": 150000.00,
  "closed_date": "2025-08-17"
}
```

---

## Document Management

### List Documents
```http
GET /rest/v1/documents?select=*,document_categories(*)&case_id=eq.{case_id}
Authorization: Bearer <jwt_token>
```

**Query Parameters:**
- `document_type=eq.Pleading` - Filter by document type
- `is_privileged=eq.true` - Filter privileged documents
- `created_at.gte.2025-01-01` - Filter by date range

### Upload Document (via Edge Function)
```http
POST /functions/v1/document-processor
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "file": {
    "name": "motion_to_dismiss.pdf",
    "content": "base64_encoded_content",
    "mimeType": "application/pdf",
    "size": 1048576
  },
  "metadata": {
    "caseId": "case_uuid",
    "title": "Motion to Dismiss",
    "documentType": "Pleading",
    "isPrivileged": true,
    "accessLevel": "confidential"
  },
  "processingOptions": {
    "performOCR": true,
    "detectPrivilege": true,
    "extractMetadata": true
  }
}
```

### Get Document
```http
GET /rest/v1/documents?id=eq.{document_id}
Authorization: Bearer <jwt_token>
```

### Download Document
```http
GET /storage/v1/object/legal-documents/{file_path}
Authorization: Bearer <jwt_token>
```

### Document Access Audit
```http
GET /rest/v1/document_access_log?document_id=eq.{document_id}&order=created_at.desc
Authorization: Bearer <jwt_token>
```

---

## Communication Management

### List Communications
```http
GET /rest/v1/communications?select=*&case_id=eq.{case_id}&order=communication_date.desc
Authorization: Bearer <jwt_token>
```

### Create Communication
```http
POST /rest/v1/communications
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "type": "email",
  "direction": "outbound",
  "subject": "Discovery Request Response",
  "content": "Email content here...",
  "participants": [
    {
      "name": "Opposing Counsel",
      "email": "counsel@opposition.com",
      "role": "opposing_counsel"
    }
  ],
  "communication_date": "2025-08-17T14:30:00Z",
  "is_privileged": false,
  "billing_minutes": 30,
  "is_billable": true
}
```

### Mark as Privileged
```http
PATCH /rest/v1/communications?id=eq.{comm_id}
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "is_privileged": true,
  "privilege_type": "attorney-client"
}
```

---

## Time Tracking & Billing

### Record Time Entry
```http
POST /rest/v1/time_entries
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "date": "2025-08-17",
  "duration_minutes": 120,
  "description": "Research case law for motion to dismiss",
  "task_type": "Legal Research",
  "hourly_rate": 350.00,
  "is_billable": true
}
```

### List Time Entries
```http
GET /rest/v1/time_entries?select=*,cases(case_number,title)&user_id=eq.{user_id}&date.gte.2025-08-01
Authorization: Bearer <jwt_token>
```

### Create Expense
```http
POST /rest/v1/expenses
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "date": "2025-08-17",
  "amount": 75.50,
  "description": "Filing fee for motion",
  "category": "Court Fees",
  "vendor": "New York State Courts",
  "is_billable": true
}
```

### Generate Invoice
```http
POST /rest/v1/invoices
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "client_id": "client_uuid",
  "case_id": "case_uuid",
  "invoice_number": "INV-2025-001",
  "invoice_date": "2025-08-17",
  "due_date": "2025-09-16",
  "payment_terms": "Net 30"
}
```

---

## Calendar & Events

### List Calendar Events
```http
GET /rest/v1/calendar_events?select=*&start_datetime.gte.2025-08-17&start_datetime.lt.2025-08-24
Authorization: Bearer <jwt_token>
```

### Create Court Date
```http
POST /rest/v1/calendar_events
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "title": "Motion Hearing",
  "event_type": "Court Hearing",
  "start_datetime": "2025-09-15T09:00:00Z",
  "end_datetime": "2025-09-15T10:00:00Z",
  "location": "New York State Supreme Court",
  "court_room": "Part 42",
  "judge_name": "Hon. Jane Smith",
  "participants": [
    {
      "user_id": "attorney_uuid",
      "role": "attorney",
      "required": true
    }
  ]
}
```

### Set Reminder
```http
POST /rest/v1/calendar_reminders
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "event_id": "event_uuid",
  "user_id": "user_uuid",
  "reminder_type": "email",
  "reminder_time": "2025-09-14T17:00:00Z"
}
```

---

## Legal Research

### Search Case Law (via Edge Function)
```http
POST /functions/v1/case-law-research
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "search",
  "query": {
    "researchQuestion": "Contract interpretation under New York law",
    "jurisdiction": "New York",
    "practiceArea": "Commercial Law",
    "caseId": "case_uuid"
  },
  "options": {
    "maxResults": 25,
    "includeStatutes": true,
    "generateSummary": true
  }
}
```

### Generate Legal Brief
```http
POST /functions/v1/case-law-research
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "action": "generate_brief",
  "query": {
    "researchQuestion": "Motion to dismiss for failure to state a claim",
    "jurisdiction": "Federal",
    "caseId": "case_uuid"
  },
  "options": {
    "exportFormat": "pdf"
  }
}
```

### Save Citation
```http
POST /rest/v1/case_law_citations
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "research_id": "research_uuid",
  "case_id": "case_uuid",
  "citation": "Smith v. Jones, 123 F.3d 456 (2d Cir. 2020)",
  "case_name": "Smith v. Jones",
  "court": "United States Court of Appeals for the Second Circuit",
  "decision_date": "2020-03-15",
  "legal_issue": "Contract interpretation",
  "holding": "Courts must interpret contracts according to plain meaning",
  "relevance_score": 8
}
```

---

## Compliance & Auditing

### Get Audit Trail
```http
GET /rest/v1/audit_log?select=*&entity_type=eq.documents&entity_id=eq.{document_id}&order=created_at.desc
Authorization: Bearer <jwt_token>
```

### Compliance Check
```http
POST /rest/v1/compliance_checks
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "requirement_id": "requirement_uuid",
  "check_date": "2025-08-17",
  "check_type": "automated",
  "status": "compliant",
  "findings": "All documents properly classified"
}
```

### Create Legal Hold
```http
POST /rest/v1/legal_holds
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "case_id": "case_uuid",
  "hold_name": "ABC Corp Litigation Hold",
  "description": "Preserve all documents related to software licensing dispute",
  "custodians": [
    {
      "name": "John Doe",
      "email": "john.doe@abccorp.com",
      "department": "Engineering"
    }
  ],
  "scope_criteria": "All emails, documents, and communications related to XYZ software license from 2023-present",
  "issued_date": "2025-08-17"
}
```

### Data Subject Request (GDPR/CCPA)
```http
POST /rest/v1/data_subject_requests
Authorization: Bearer <jwt_token>
Content-Type: application/json

{
  "request_type": "access",
  "subject_name": "John Smith",
  "subject_email": "john.smith@email.com",
  "request_date": "2025-08-17",
  "request_details": "Request for all personal data held by the firm",
  "response_deadline": "2025-09-16"
}
```

---

## Edge Functions

### Document Processor
Process documents with OCR, privilege detection, and metadata extraction.

```http
POST /functions/v1/document-processor
Authorization: Bearer <jwt_token>
```

### Signature Validator
Manage electronic signature workflows with legal validity.

```http
POST /functions/v1/signature-validator
Authorization: Bearer <jwt_token>
```

### Case Law Research
AI-powered legal research and brief generation.

```http
POST /functions/v1/case-law-research
Authorization: Bearer <jwt_token>
```

### Health Monitor
System health monitoring and alerting.

```http
POST /functions/v1/health-monitor
Authorization: Bearer <jwt_token>
```

---

## Error Handling

### HTTP Status Codes

- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Unprocessable Entity
- `429` - Too Many Requests
- `500` - Internal Server Error

### Error Response Format
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": {
      "field": "email",
      "issue": "Invalid email format"
    },
    "hint": "Please provide a valid email address"
  }
}
```

### Common Error Codes

- `AUTHENTICATION_REQUIRED` - JWT token missing or invalid
- `INSUFFICIENT_PRIVILEGES` - User lacks required permissions
- `RESOURCE_NOT_FOUND` - Requested resource does not exist
- `VALIDATION_ERROR` - Input validation failed
- `PRIVILEGE_VIOLATION` - Attempt to access privileged content
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `SYSTEM_MAINTENANCE` - System temporarily unavailable

---

## Rate Limiting

API requests are rate limited per user:
- **Standard Users**: 1000 requests/hour
- **Admin Users**: 5000 requests/hour
- **System Users**: 10000 requests/hour

Rate limit headers are included in responses:
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 999
X-RateLimit-Reset: 1692276000
```

---

## Webhooks

Configure webhooks for real-time notifications:

### Available Events
- `document.uploaded`
- `case.created`
- `case.status_changed`
- `invoice.generated`
- `compliance.violation`
- `legal_hold.created`

### Webhook Payload Example
```json
{
  "event": "case.created",
  "timestamp": "2025-08-17T10:00:00Z",
  "data": {
    "case_id": "uuid",
    "case_number": "2025-LIT-001",
    "client_id": "uuid",
    "lead_attorney_id": "uuid"
  },
  "law_firm_id": "uuid"
}
```

---

## SDK Examples

### JavaScript/TypeScript
```typescript
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://your-project.supabase.co',
  'your-anon-key'
)

// List cases
const { data: cases, error } = await supabase
  .from('cases')
  .select(`
    *,
    clients(*),
    users!lead_attorney_id(*)
  `)
  .eq('status', 'open')
```

### Python
```python
from supabase import create_client

supabase = create_client(
    "https://your-project.supabase.co",
    "your-anon-key"
)

# Create case
case_data = {
    "client_id": "uuid",
    "title": "New Case",
    "practice_area": "Litigation"
}

result = supabase.table('cases').insert(case_data).execute()
```

---

## Best Practices

### Security
- Always use HTTPS for API requests
- Store JWT tokens securely
- Implement proper session management
- Validate all inputs
- Use role-based access control

### Performance
- Use `select` parameter to limit returned fields
- Implement pagination for large datasets
- Cache frequently accessed data
- Use indexes for search queries

### Compliance
- Log all privileged document access
- Maintain audit trails for all actions
- Implement data retention policies
- Regular compliance monitoring

---

*Last Updated: 2025-08-17*