# Operational Runbook Template

## Runbook: [Service/System Name] — [Operation Type]

**Runbook ID:** RB-[YYYY]-[NNN]
**Service:** [Service name]
**Owner:** [Team or individual]
**Last Updated:** [YYYY-MM-DD]
**Last Tested:** [YYYY-MM-DD]
**Review Cadence:** [Monthly | Quarterly]
**Severity Applicability:** [SEV1 | SEV2 | SEV3 | All]

---

## 1. Overview

### Purpose

[1-2 sentences describing what this runbook addresses. Be specific — "Restore the order-service database from backup after data corruption" not "Database recovery."]

### When to Use This Runbook

- [Trigger condition 1 — e.g., "Order service returns 5xx errors for >5 minutes"]
- [Trigger condition 2 — e.g., "Database replication lag exceeds 30 seconds"]
- [Trigger condition 3 — e.g., "Automated health check triggers PagerDuty alert"]

### When NOT to Use This Runbook

- [Exclusion 1 — e.g., "Transient errors that self-resolve within 2 minutes"]
- [Exclusion 2 — e.g., "Upstream dependency failures (use RB-2024-005 instead)"]

### Prerequisites

- [ ] Access to AWS Console with [specific IAM role/permissions]
- [ ] `kubectl` configured for [cluster name]
- [ ] Access to [monitoring tool — Datadog/Grafana/CloudWatch]
- [ ] VPN connected to [environment]
- [ ] Familiarity with [service architecture — link to architecture doc]

---

## 2. Service Architecture

### Architecture Diagram

```
[ASCII diagram of the relevant service architecture]

Example:
                    ┌──────────┐
    Users ──────→  │   ALB    │
                    └────┬─────┘
                         │
                    ┌────▼─────┐
                    │  ECS     │ ← Auto-scaling group
                    │  Service │    Min: 2, Max: 10
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              │          │          │
         ┌────▼───┐ ┌───▼────┐ ┌──▼──────┐
         │ RDS    │ │ Redis  │ │ S3      │
         │Primary │ │Cluster │ │ Bucket  │
         └────┬───┘ └────────┘ └─────────┘
              │
         ┌────▼───┐
         │ RDS    │
         │Standby │
         └────────┘
```

### Key Resources

| Resource | Identifier | Region | Notes |
|----------|-----------|--------|-------|
| ECS Cluster | [cluster-name] | [us-east-1] | [Production] |
| RDS Instance | [db-instance-id] | [us-east-1] | [Multi-AZ] |
| ALB | [alb-arn] | [us-east-1] | [Internet-facing] |
| S3 Bucket | [bucket-name] | [us-east-1] | [Versioned] |
| CloudWatch Alarm | [alarm-name] | [us-east-1] | [Error rate] |

### Key Metrics and Dashboards

| Metric | Dashboard Link | Normal Range | Alert Threshold |
|--------|---------------|-------------|----------------|
| Error rate (5xx) | [link] | < 0.1% | > 1% for 2 min |
| p99 latency | [link] | < 200ms | > 500ms for 5 min |
| CPU utilization | [link] | 20-60% | > 80% for 5 min |
| Active connections | [link] | 100-500 | > 1000 |
| Queue depth | [link] | < 100 | > 1000 |

---

## 3. Diagnostic Steps

### Step 1: Confirm the Problem

```bash
# Check service health
curl -s https://[service-url]/health | jq .

# Check recent error rate
aws cloudwatch get-metric-statistics \
  --namespace "AWS/ApplicationELB" \
  --metric-name "HTTPCode_Target_5XX_Count" \
  --dimensions Name=TargetGroup,Value=[target-group-arn] \
  --start-time $(date -u -v-30M +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Sum
```

**Expected output:** [Describe what healthy output looks like]
**Problem indicator:** [Describe what indicates the problem is real]

### Step 2: Identify Root Cause

Check each potential cause in order (most common first):

**Cause A: [Most common cause — e.g., "Application OOM"]**
```bash
# Check container memory usage
aws ecs describe-services --cluster [cluster] --services [service] | jq '.services[0].deployments'

# Check for OOM kills
kubectl logs [pod-name] --previous 2>&1 | grep -i "oom\|killed\|memory"
```
- If this is the cause, proceed to **Resolution A** in Section 4

**Cause B: [Second most common — e.g., "Database connection exhaustion"]**
```bash
# Check active database connections
aws rds describe-db-instances --db-instance-identifier [id] | jq '.DBInstances[0].DBInstanceStatus'

# Check connection count via CloudWatch
aws cloudwatch get-metric-statistics \
  --namespace "AWS/RDS" \
  --metric-name "DatabaseConnections" \
  --dimensions Name=DBInstanceIdentifier,Value=[id] \
  --start-time $(date -u -v-30M +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 60 \
  --statistics Maximum
```
- If this is the cause, proceed to **Resolution B** in Section 4

**Cause C: [Third cause — e.g., "Upstream dependency failure"]**
```bash
# Check dependency health
curl -s https://[dependency-url]/health | jq .

# Check circuit breaker status
kubectl exec [pod] -- curl -s localhost:8080/admin/circuit-breakers | jq .
```
- If this is the cause, proceed to **Resolution C** in Section 4

**Cause D: [Fourth cause — e.g., "Deployment regression"]**
```bash
# Check recent deployments
aws ecs describe-services --cluster [cluster] --services [service] | jq '.services[0].taskDefinition'

# Check deployment timeline
aws ecs list-tasks --cluster [cluster] --service [service] | jq .
```
- If this is the cause, proceed to **Resolution D** in Section 4

---

## 4. Resolution Procedures

### Resolution A: [Name — e.g., "Restart Service / Scale Up"]

**Estimated Time:** [5-10 minutes]
**Risk Level:** [Low — rolling restart maintains availability]

```bash
# Step 1: Scale up to handle load during restart
aws ecs update-service --cluster [cluster] --service [service] --desired-count [current + 2]

# Step 2: Wait for new tasks to become healthy
aws ecs wait services-stable --cluster [cluster] --services [service]

# Step 3: Force new deployment (rolling restart)
aws ecs update-service --cluster [cluster] --service [service] --force-new-deployment

# Step 4: Monitor rollout
watch -n 5 'aws ecs describe-services --cluster [cluster] --services [service] | jq ".services[0].deployments"'
```

**Verification:**
```bash
# Confirm error rate has returned to normal
# Check dashboard: [link]
# Confirm all tasks are healthy
aws ecs describe-services --cluster [cluster] --services [service] | jq '.services[0].runningCount'
```

---

### Resolution B: [Name — e.g., "Database Connection Reset"]

**Estimated Time:** [10-15 minutes]
**Risk Level:** [Medium — brief connection interruption possible]

```bash
# Step 1: Identify connections consuming resources
# Connect to database and run:
SELECT pid, now() - pg_stat_activity.query_start AS duration, query, state
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY duration DESC
LIMIT 20;

# Step 2: Terminate long-running queries (if safe)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE duration > interval '5 minutes'
  AND state != 'idle'
  AND query NOT LIKE '%pg_stat_activity%';

# Step 3: Restart application connection pools
aws ecs update-service --cluster [cluster] --service [service] --force-new-deployment
```

**Verification:**
```bash
# Confirm connection count has dropped
# Check CloudWatch: DatabaseConnections metric
# Confirm application can serve requests
curl -s https://[service-url]/health | jq .
```

---

### Resolution C: [Name — e.g., "Upstream Dependency Workaround"]

**Estimated Time:** [Variable — depends on upstream]
**Risk Level:** [Medium — degraded functionality until upstream recovers]

```bash
# Step 1: Enable degraded mode / circuit breaker
kubectl exec [pod] -- curl -X POST localhost:8080/admin/circuit-breakers/[dependency]/open

# Step 2: Verify fallback behavior is working
curl -s https://[service-url]/[affected-endpoint] | jq .

# Step 3: Monitor upstream status
watch -n 30 'curl -s https://[dependency-url]/health | jq .'

# Step 4: Close circuit breaker when upstream recovers
kubectl exec [pod] -- curl -X POST localhost:8080/admin/circuit-breakers/[dependency]/close
```

---

### Resolution D: [Name — e.g., "Rollback Deployment"]

**Estimated Time:** [5-10 minutes]
**Risk Level:** [Low — returns to known-good state]

```bash
# Step 1: Identify previous task definition
PREVIOUS_TD=$(aws ecs describe-services --cluster [cluster] --services [service] \
  | jq -r '.services[0].deployments[] | select(.status == "PRIMARY") | .taskDefinition' \
  | sed 's/:[0-9]*$/:PREVIOUS_VERSION/')

# Step 2: Update service to previous version
aws ecs update-service --cluster [cluster] --service [service] --task-definition $PREVIOUS_TD

# Step 3: Wait for rollback to stabilize
aws ecs wait services-stable --cluster [cluster] --services [service]

# Step 4: Verify rollback success
curl -s https://[service-url]/health | jq .
```

---

## 5. Escalation

### Escalation Criteria

Escalate if:
- Problem is not resolved within [30 minutes] of starting this runbook
- Root cause is not identified after completing all diagnostic steps
- Resolution requires actions not covered in this runbook
- Multiple services are affected simultaneously
- Data loss or corruption is suspected

### Escalation Path

| Level | Contact | Method | When |
|-------|---------|--------|------|
| L1 | On-call engineer | PagerDuty | First responder |
| L2 | Team lead / Senior engineer | PagerDuty + Slack #incidents | After 15 min without resolution |
| L3 | VP Engineering / Architect | Phone call | After 30 min, SEV1, or data loss |
| External | AWS Support (Enterprise) | AWS Console case | Infrastructure-level issues |

### Communication Template

```
INCIDENT UPDATE — [Service Name] — [SEV Level]

Status: [Investigating | Identified | Mitigating | Resolved]
Impact: [Description of customer impact]
Start time: [HH:MM UTC]
Duration: [X minutes]
Root cause: [Known | Under investigation]
Next update: [HH:MM UTC]

Actions taken:
- [Action 1]
- [Action 2]

Current assignee: [Name]
```

---

## 6. Post-Incident

After resolution:

- [ ] Confirm all metrics have returned to normal baseline
- [ ] Scale service back to normal capacity (if scaled up)
- [ ] Close any circuit breakers that were manually opened
- [ ] Update incident ticket with resolution details
- [ ] Schedule postmortem if SEV1 or SEV2
- [ ] Update this runbook if procedures were incorrect or incomplete
- [ ] Commit any configuration changes made during incident

---

## 7. Revision History

| Date | Author | Change |
|------|--------|--------|
| [YYYY-MM-DD] | [Name] | Initial creation |
| [YYYY-MM-DD] | [Name] | Added Resolution D after deployment incident |
| [YYYY-MM-DD] | [Name] | Updated escalation contacts |

---

## Cross-References

- `Patterns/microservices_deployment_pattern.md` — Deployment procedures
- `Patterns/disaster_recovery_pattern.md` — DR failover runbooks
- `06_reliability/observability.md` — Monitoring and alerting setup
- `06_reliability/site_reliability.md` — SLO and error budget context
- `Templates/incident_postmortem_template.md` — Post-incident review format

