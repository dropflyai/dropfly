# CRM Sync Pattern

## Pattern Summary

Bidirectional synchronization of contact, company, and deal records between two CRM systems. This pattern handles the complete sync lifecycle: initial data migration, ongoing incremental sync, conflict resolution, deduplication, and periodic reconciliation.

---

## 1. Problem Statement

The organization uses two CRM systems (e.g., Salesforce and HubSpot) and needs contact and deal data consistent across both. Sales updates in one system must appear in the other within minutes. Both systems can be the source of truth for different data types.

---

## 2. Architecture

```
System A (Salesforce)              Sync Engine              System B (HubSpot)
        |                              |                          |
        |-- Webhook (contact changed)->|                          |
        |                              |-- Is sync-originated? -->|
        |                              |   No: Transform -------->|
        |                              |                          |
        |                              |<- Webhook (contact) -----|
        |<- Transform -----------------|   No: Transform          |
        |                              |                          |
        |    [Reconciliation Job - Weekly]                        |
        |<----- Compare All Records ------>                       |
```

---

## 3. Components

### 3.1 Webhook Receivers
- Receive change events from both CRM systems
- Validate webhook signatures
- Parse event payload and determine entity type and change type
- Check sync origin marker (ignore changes originated by the sync engine)

### 3.2 Mapping Table
Store the relationship between record IDs across systems:

| Field | Type | Description |
|-------|------|-------------|
| entity_type | string | "contact", "company", "deal" |
| system_a_id | string | Salesforce record ID |
| system_b_id | string | HubSpot record ID |
| last_synced | timestamp | Last successful sync |
| sync_direction | string | "a_to_b", "b_to_a" |
| sync_status | string | "synced", "conflict", "error" |

### 3.3 Field Mapping

```yaml
contact_fields:
  - source_a: "FirstName"
    target_b: "firstname"
    direction: "bidirectional"
    conflict_rule: "last_modified_wins"

  - source_a: "Email"
    target_b: "email"
    direction: "bidirectional"
    conflict_rule: "system_a_wins"  # Email authority is Salesforce

  - source_a: "LeadScore__c"
    target_b: "hubspot_score"
    direction: "b_to_a"  # HubSpot is lead score authority
```

### 3.4 Conflict Resolution

When the same record is modified in both systems since the last sync:

1. Compare field-level timestamps (if available)
2. Apply per-field conflict rules from the field mapping
3. For fields without rules, apply the default rule (last-write-wins)
4. Log all conflict resolutions for audit
5. For high-value records (deals > $100K), route to human review

### 3.5 Deduplication

Before creating a new record in the target system:
1. Search for existing records matching key fields (email for contacts, domain for companies)
2. If match found: update the existing record and create a mapping entry
3. If no match: create a new record and create a mapping entry
4. If multiple matches: flag for human review

---

## 4. Workflow Steps

### 4.1 Real-Time Sync (Event-Driven)

```
1. Receive webhook from System A
2. Check: Is this change from the sync engine? (sync marker present)
   -> Yes: Ignore (prevent circular sync)
   -> No: Continue
3. Look up mapping: Does this record have a System B counterpart?
   -> Yes: Fetch current System B record
   -> No: Search System B for existing match
     -> Found: Create mapping, proceed as update
     -> Not Found: Create new record in System B, create mapping
4. For updates: Compare fields, apply field mapping
5. Detect conflicts: Has System B also changed since last sync?
   -> Yes: Apply conflict resolution rules
   -> No: Apply all changes
6. Update System B record (include sync origin marker)
7. Update mapping table with new sync timestamp
8. Log the sync operation
```

### 4.2 Reconciliation (Scheduled)

```
Weekly at 2 AM:
1. Fetch all records from System A (modified in last 7 days)
2. Fetch all records from System B (modified in last 7 days)
3. For each mapping entry:
   a. Compare key fields between System A and System B
   b. If discrepancy found: apply sync rules to resolve
4. Check for orphaned records (in one system but not the other)
5. Generate reconciliation report
6. Alert if discrepancy rate exceeds threshold
```

---

## 5. Error Handling

| Error | Recovery |
|-------|----------|
| Webhook delivery failure | Source system retries (configure retry policy) |
| Target API timeout | Retry 3x with exponential backoff |
| Target API rate limited | Queue and process at rate limit pace |
| Mapping lookup failure | Create new mapping, proceed as new record |
| Conflict cannot be resolved | Queue for human review, mark as "conflict" |
| Data validation failure | Log error, skip record, alert if threshold exceeded |

---

## 6. Monitoring

| Metric | Target | Alert |
|--------|--------|-------|
| Sync lag | < 5 minutes | > 15 minutes |
| Sync success rate | > 99% | < 95% |
| Conflict rate | < 1% | > 5% |
| Reconciliation discrepancy rate | < 0.5% | > 2% |
| Error queue depth | 0 | > 10 |

---

## 7. Implementation Checklist

- [ ] Webhook receivers configured for both systems
- [ ] Field mapping defined and documented
- [ ] Conflict resolution rules defined per field
- [ ] Mapping table created and indexed
- [ ] Sync origin marker implemented to prevent circular updates
- [ ] Deduplication logic implemented
- [ ] Error handling with retry and dead letter queue
- [ ] Reconciliation job scheduled
- [ ] Monitoring dashboard created
- [ ] Alerting configured
- [ ] Initial data migration completed
- [ ] Documentation updated

---

*See `07_data_sync/sync_patterns.md` for detailed sync pattern theory.*
