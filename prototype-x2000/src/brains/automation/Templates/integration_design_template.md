# Integration Design Template

## Document Information

| Field | Value |
|-------|-------|
| **Integration Name** | [Name: `{systemA}_{systemB}_{dataflow}_integration`] |
| **Author** | [Name and role] |
| **Date** | [YYYY-MM-DD] |
| **Version** | [1.0] |
| **Status** | [Draft / In Review / Approved / Implemented / Deprecated] |
| **Integration Type** | [Unidirectional / Bidirectional / Event-Driven / Batch] |

---

## 1. Integration Overview

### 1.1 Purpose

[One paragraph describing why this integration exists, what business value it provides, and what data flows between systems.]

### 1.2 Systems Involved

| System | Role | Version/API | Owner | Environment |
|--------|------|------------|-------|-------------|
| [System A] | Source / Target / Both | [API version] | [Team/Person] | [Prod URL] |
| [System B] | Source / Target / Both | [API version] | [Team/Person] | [Prod URL] |
| [Middleware] | Orchestrator | [Platform version] | [Team/Person] | [Prod URL] |

### 1.3 Data Flow Summary

```
[Draw the high-level data flow]

Example:
System A                    Middleware                    System B
   │                            │                            │
   │── Contact Created ────────>│                            │
   │                            │── Transform & Validate ───>│
   │                            │                            │── Create Contact
   │                            │<── Confirmation ───────────│
   │<── Update Sync Status ─────│                            │
   │                            │                            │
   │                            │── [Reconciliation Job] ───>│
   │<── Compare & Resolve ──────│<───────────────────────────│
```

---

## 2. Data Mapping

### 2.1 Entity Mapping

| Entity (System A) | Entity (System B) | Sync Direction | Match Key |
|-------------------|-------------------|---------------|-----------|
| [Contact] | [Contact] | Bidirectional | [email] |
| [Account] | [Company] | A → B | [domain] |
| [Opportunity] | [Deal] | B → A | [mapping_table_id] |

### 2.2 Field Mapping

**Entity: [Entity Name]**

| System A Field | System B Field | Direction | Transform | Conflict Rule | Notes |
|---------------|---------------|-----------|-----------|--------------|-------|
| `FirstName` | `firstname` | Bidi | None | Last modified wins | |
| `Email` | `email` | Bidi | Lowercase | System A wins | System A is email authority |
| `Phone` | `phone` | Bidi | E.164 format | Last modified wins | Apply phone normalization |
| `Status__c` | `lifecycle_stage` | A → B | Enum map (see 2.3) | N/A (unidirectional) | |
| `LeadScore` | `hubspot_score` | B → A | None | System B wins | System B is score authority |
| `CreatedAt` | `createdate` | A → B | ISO 8601 | N/A | Initial sync only |
| N/A | `hs_analytics_source` | B → A | Map to custom field | N/A | |

### 2.3 Value Mappings (Enums)

**Status → Lifecycle Stage:**

| System A Value | System B Value |
|---------------|---------------|
| `New` | `subscriber` |
| `Qualified` | `lead` |
| `Contacted` | `marketingqualifiedlead` |
| `Opportunity` | `salesqualifiedlead` |
| `Customer` | `customer` |
| `Churned` | `other` |

### 2.4 Computed Fields

| Output Field | Computation | Systems Involved |
|-------------|-------------|-----------------|
| `full_name` | `{FirstName} {LastName}` | Computed in middleware |
| `days_since_last_activity` | `NOW() - MAX(last_activity_a, last_activity_b)` | Both |

---

## 3. Sync Mechanics

### 3.1 Trigger Strategy

| Trigger | Source | Conditions | Debounce | Notes |
|---------|--------|-----------|----------|-------|
| Webhook: Contact Created | System A | New contact | None | Process immediately |
| Webhook: Contact Updated | System A | Field in mapping changed | 30 sec | Batch rapid updates |
| Webhook: Contact Created | System B | New contact | None | Process immediately |
| Schedule: Reconciliation | Cron | `0 3 * * 0` (Sunday 3 AM) | N/A | Weekly full compare |
| Manual: Full Resync | Admin trigger | On-demand | N/A | Emergency use only |

### 3.2 Sync Process Flow

**Real-Time Sync (System A → System B):**

```
1. Receive webhook from System A
2. Validate webhook signature (HMAC-SHA256)
3. Parse payload, extract entity type and change type
4. CHECK: Is sync_origin_marker = "integration_engine"?
   ├── YES → Discard (prevents circular sync). Exit.
   └── NO → Continue
5. Lookup mapping table for System B counterpart
   ├── FOUND → Fetch current System B record
   │   ├── CHECK: Has System B changed since last sync?
   │   │   ├── YES → Apply conflict resolution rules per field
   │   │   └── NO → Apply all mapped field changes
   │   └── Update System B record (set sync_origin_marker)
   └── NOT FOUND → Search System B by match key (email/domain)
       ├── MATCH → Create mapping entry, update existing record
       ├── MULTIPLE MATCHES → Flag for human review, skip
       └── NO MATCH → Create new record in System B, create mapping
6. Update mapping table (last_synced timestamp, sync_status)
7. Log sync operation (source_id, target_id, fields_changed, direction)
```

### 3.3 Conflict Resolution

| Priority | Rule | Applied To |
|----------|------|-----------|
| 1 | Per-field authority (see field mapping) | Fields with explicit authority |
| 2 | Last modified wins (compare timestamps) | Fields without explicit authority |
| 3 | Human review queue | High-value records (deal > $100K) |
| 4 | Source system wins | Default fallback |

**Conflict Detection:**
```
For each mapped field:
  system_a_value = current System A field value
  system_b_value = current System B field value
  last_synced_value = value at last successful sync

  IF system_a_value != last_synced_value AND system_b_value != last_synced_value:
    CONFLICT DETECTED → Apply conflict resolution rule for this field
  ELIF system_a_value != last_synced_value:
    System A changed → Propagate A's value to B
  ELIF system_b_value != last_synced_value:
    System B changed → Propagate B's value to A
  ELSE:
    No change → Skip field
```

### 3.4 Deduplication Strategy

| Step | Method | Details |
|------|--------|---------|
| 1 | Exact match on primary key | Email (contacts), Domain (companies) |
| 2 | Fuzzy match on secondary keys | Name similarity > 90% AND same company |
| 3 | Human review | Multiple potential matches |

### 3.5 Circular Sync Prevention

**Mechanism:** Sync origin marker

- When the integration engine updates a record, it sets a custom field or metadata tag: `sync_origin = "integration_engine"`
- When receiving a webhook, the integration checks for this marker
- If present, the webhook is discarded (it was triggered by the integration itself)
- The marker is cleared after a configurable delay (60 seconds) or on the next non-integration update

---

## 4. ID Mapping Table

### 4.1 Schema

```sql
CREATE TABLE integration_mapping (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_type     VARCHAR(50) NOT NULL,
  system_a_id     VARCHAR(255) NOT NULL,
  system_b_id     VARCHAR(255),
  match_key       VARCHAR(255),
  sync_status     VARCHAR(20) DEFAULT 'pending',
  last_synced_at  TIMESTAMP,
  last_sync_direction VARCHAR(10),
  conflict_count  INTEGER DEFAULT 0,
  created_at      TIMESTAMP DEFAULT NOW(),
  updated_at      TIMESTAMP DEFAULT NOW(),

  UNIQUE(entity_type, system_a_id),
  UNIQUE(entity_type, system_b_id)
);

CREATE INDEX idx_mapping_entity_type ON integration_mapping(entity_type);
CREATE INDEX idx_mapping_sync_status ON integration_mapping(sync_status);
CREATE INDEX idx_mapping_match_key ON integration_mapping(match_key);
```

### 4.2 Status Values

| Status | Meaning | Action |
|--------|---------|--------|
| `synced` | Both systems are in sync | None |
| `pending` | Awaiting initial sync | Process in next sync cycle |
| `conflict` | Unresolved conflict | Route to human review |
| `error` | Sync failed | Retry or manual intervention |
| `orphaned` | Exists in one system only | Investigate and resolve |
| `archived` | Record deleted in one system | Archive in other system |

---

## 5. Authentication and Security

### 5.1 Credentials

| System | Auth Method | Credential Location | Rotation Schedule |
|--------|-----------|-------------------|------------------|
| [System A] | OAuth 2.0 | Credential store: `{name}` | Auto-refresh (token) / 180 days (secret) |
| [System B] | API Key | Credential store: `{name}` | 90 days |
| [Database] | Connection string | Credential store: `{name}` | 90 days |

### 5.2 Data Security

| Requirement | Implementation |
|------------|---------------|
| Encryption in transit | TLS 1.2+ for all API calls |
| Encryption at rest | AES-256 for mapping table and logs |
| PII handling | Mask email/phone in logs |
| Access control | RBAC on credential store and mapping table |
| Audit trail | All sync operations logged with actor and timestamp |

### 5.3 Webhook Security

| System | Verification Method | Implementation |
|--------|-------------------|---------------|
| [System A] | HMAC-SHA256 signature | Verify `X-Signature` header against shared secret |
| [System B] | API key in header | Verify `X-API-Key` matches configured value |

---

## 6. Error Handling

### 6.1 Error Classification

| Error Code | Category | Severity | Auto-Retry | Resolution |
|-----------|----------|----------|-----------|------------|
| E-INT-001 | Source API timeout | Medium | Yes (3x) | Exponential backoff, then alert |
| E-INT-002 | Target API timeout | Medium | Yes (3x) | Exponential backoff, then alert |
| E-INT-003 | Authentication failure | High | No | Rotate credentials, alert immediately |
| E-INT-004 | Rate limited (429) | Low | Yes | Wait for reset, then continue |
| E-INT-005 | Data validation failure | Medium | No | Log to error table, skip record |
| E-INT-006 | Mapping table unavailable | Critical | Yes (3x) | Alert, halt integration |
| E-INT-007 | Unresolvable conflict | Medium | No | Route to human review queue |
| E-INT-008 | Duplicate detected | Low | No | Merge or flag for review |
| E-INT-009 | Schema mismatch | High | No | Alert, investigate API changes |

### 6.2 Dead Letter Queue

Records that fail after all retries are placed in a dead letter queue:

```json
{
  "error_id": "err_abc123",
  "timestamp": "2024-03-15T10:30:00Z",
  "source_system": "system_a",
  "entity_type": "contact",
  "source_id": "sf_001abc",
  "error_code": "E-INT-005",
  "error_message": "Email field validation failed: invalid format",
  "payload": { "...original webhook payload..." },
  "retry_count": 3,
  "status": "failed",
  "resolution": null
}
```

---

## 7. Monitoring and Alerting

### 7.1 Key Metrics

| Metric | Target | Warning | Critical | Dashboard |
|--------|--------|---------|----------|-----------|
| Sync success rate | > 99.5% | < 99% | < 95% | [Link] |
| Sync latency (p95) | < 60 sec | > 120 sec | > 300 sec | [Link] |
| Conflict rate | < 1% | > 3% | > 10% | [Link] |
| Dead letter queue depth | 0 | > 5 | > 20 | [Link] |
| Mapping table growth | Steady | Spike > 2x | Spike > 5x | [Link] |
| Reconciliation discrepancy | < 0.5% | > 1% | > 5% | [Link] |

### 7.2 Health Check

```
Integration Health Check (runs every 5 minutes):
1. Verify System A API is reachable (GET /health)
2. Verify System B API is reachable (GET /health)
3. Verify mapping table is accessible (SELECT 1)
4. Check last successful sync was < 15 minutes ago
5. Check dead letter queue depth < threshold
6. Report: HEALTHY / DEGRADED / UNHEALTHY
```

---

## 8. Reconciliation

### 8.1 Schedule

| Job | Frequency | Window | Scope |
|-----|-----------|--------|-------|
| Incremental reconciliation | Daily at 2 AM | Last 48 hours | Recently modified records |
| Full reconciliation | Weekly (Sunday 3 AM) | All records | Complete dataset |
| Orphan detection | Monthly (1st, 4 AM) | All mappings | Identify orphaned records |

### 8.2 Reconciliation Process

```
1. Fetch all records modified since last reconciliation from System A
2. Fetch all records modified since last reconciliation from System B
3. For each mapping entry:
   a. Retrieve current state from both systems
   b. Compare mapped fields
   c. IF discrepancy found:
      - Determine which system has the authoritative value
      - Apply correction
      - Log reconciliation action
4. Identify orphaned mappings (record deleted in one system)
5. Generate reconciliation report:
   - Records compared: N
   - Discrepancies found: N
   - Auto-resolved: N
   - Flagged for review: N
   - Orphans detected: N
6. IF discrepancy rate > threshold → Alert integration team
```

---

## 9. Testing

### 9.1 Integration Test Cases

| Test ID | Scenario | Systems | Expected Result |
|---------|----------|---------|-----------------|
| IT-001 | New record sync A → B | A, B | Record created in B with correct mapping |
| IT-002 | New record sync B → A | A, B | Record created in A with correct mapping |
| IT-003 | Update sync A → B | A, B | Updated fields propagated correctly |
| IT-004 | Conflict resolution | A, B | Correct field wins per conflict rules |
| IT-005 | Circular sync prevention | A, B | Integration-originated changes ignored |
| IT-006 | Deduplication | A, B | Existing record matched, no duplicate created |
| IT-007 | Error recovery | A, B | Failed sync retried and completed |
| IT-008 | Rate limiting | A, B | Throttling applied, no data loss |
| IT-009 | Reconciliation | A, B | Discrepancies detected and resolved |
| IT-010 | Full resync | A, B | All records synchronized correctly |

---

## 10. Approval and Sign-Off

| Role | Name | Date | Approved |
|------|------|------|----------|
| System A Owner | | | [ ] |
| System B Owner | | | [ ] |
| Integration Lead | | | [ ] |
| Security | | | [ ] |

---

## Appendix

### A. API Reference

| System | Endpoint | Method | Purpose | Rate Limit |
|--------|----------|--------|---------|-----------|
| [System A] | `/api/v2/contacts` | GET | List contacts | 100/min |
| [System A] | `/api/v2/contacts/{id}` | PATCH | Update contact | 100/min |
| [System B] | `/api/v3/objects/contacts` | GET | List contacts | 100/10sec |
| [System B] | `/api/v3/objects/contacts` | POST | Create contact | 100/10sec |

### B. Change History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | [Date] | [Author] | Initial design |

---

*This template follows the Integration Design standards. See `04_api_integration/api_design.md` for API best practices and `Patterns/crm_sync_pattern.md` for sync pattern reference.*
