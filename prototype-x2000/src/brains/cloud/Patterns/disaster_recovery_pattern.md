# Disaster Recovery Pattern — Planning, Implementation, and Testing

## Problem Statement

Disasters — region outages, data corruption, ransomware, cascading failures — are not hypothetical. AWS us-east-1 has experienced multiple significant outages. Without a tested DR plan, recovery is improvised, slow, and often incomplete. This pattern provides a structured approach to DR planning, implementation of multi-AZ and multi-region failover, and regular testing to ensure the plan actually works.

---

## Context

Apply this pattern when:
- Designing a new production service that requires availability guarantees
- Establishing DR capability for existing services
- Conducting periodic DR testing (minimum semi-annually)
- Recovering from an actual disaster or significant outage
- Reviewing DR capability after architecture changes

---

## Solution — Disaster Recovery Lifecycle

### Phase 1: Requirements Definition

**1.1 Determine RTO/RPO for Each Service**

| Service | RTO Target | RPO Target | DR Strategy | Justification |
|---------|-----------|-----------|-------------|--------------|
| [Service name] | [Max downtime] | [Max data loss] | [Strategy] | [Business reason] |

**DR Strategy by RTO/RPO:**
| RTO | RPO | Strategy | Cost |
|-----|-----|----------|------|
| Hours | Hours | Backup and Restore | $ |
| 10-30 min | Minutes | Pilot Light | $$ |
| Minutes | Seconds | Warm Standby | $$$ |
| Near-zero | Near-zero | Active-Active | $$$$ |

**1.2 Identify Dependencies**
Map all dependencies for each service: databases, caches, message queues, external APIs, DNS, certificates, secrets. Each dependency needs its own DR strategy.

### Phase 2: Implementation

**2.1 Data Replication**

| Data Store | Replication Method | Target | RPO |
|-----------|-------------------|--------|-----|
| RDS | Cross-region read replica or Aurora Global | Secondary region | Seconds (async) |
| DynamoDB | Global Tables | Secondary region | Near-zero |
| S3 | Cross-region replication | Secondary region | Minutes |
| ElastiCache | Global Datastore | Secondary region | Seconds |
| Secrets | Multi-region replication | Secondary region | Near-zero |
| Terraform State | S3 cross-region replication | Secondary region | Minutes |

**2.2 Compute Recovery**

| Compute | Recovery Method | RTO |
|---------|----------------|-----|
| ECS/EKS | IaC deployment to secondary region | 10-30 minutes |
| Lambda | Multi-region deployment via CI/CD | Minutes |
| EC2 | AMI copy + IaC deployment | 30-60 minutes |

**2.3 DNS Failover**

Route 53 health checks monitor primary region. On failure:
- Failover routing policy routes traffic to secondary region
- TTL set to 60 seconds for fast propagation
- Health check interval: 10 seconds, failure threshold: 3

### Phase 3: Testing

**3.1 Test Types and Frequency**

| Test Type | Frequency | Scope | Disruption |
|-----------|-----------|-------|-----------|
| Tabletop exercise | Quarterly | Walk through DR plan verbally | None |
| Component failover | Monthly | Failover individual component (RDS, cache) | Minimal |
| Region failover | Semi-annually | Full application failover to DR region | Planned maintenance window |
| Chaos engineering | Ongoing | Random failure injection (controlled) | Controlled |
| Backup restore | Monthly | Restore from backup, verify data integrity | None (separate environment) |

**3.2 Failover Test Procedure**

1. Announce maintenance window to stakeholders
2. Capture baseline metrics (latency, error rate, throughput)
3. Initiate failover (DNS switch, database promotion, compute scaling)
4. Verify application functionality in DR region
5. Run automated integration tests against DR environment
6. Verify data consistency between regions
7. Measure actual RTO and RPO against targets
8. If test is successful, optionally run in DR mode for extended period
9. Fail back to primary region
10. Document results, update DR plan with findings

**3.3 Test Documentation**

| Metric | Target | Actual | Pass/Fail |
|--------|--------|--------|-----------|
| RTO | [target] | [measured] | |
| RPO | [measured data loss] | [actual] | |
| Data integrity | 100% | [measured] | |
| Functional tests | 100% pass | [actual] | |

### Phase 4: Continuous Improvement

After each test or actual DR event:
- Update DR plan with lessons learned
- Update IaC if infrastructure changes needed
- Update runbooks with corrected procedures
- Train team on updated procedures
- Schedule next test date

---

## Verification

This pattern is correctly applied when:
- RTO/RPO targets are met during testing
- All data stores replicate to DR region within RPO targets
- Failover can be executed by any trained team member using runbooks
- DR tests are conducted on schedule with documented results
- Actual RTO during tests is within 150% of target (allows for test conditions)

---

## Anti-Patterns

| Anti-Pattern | Risk | Correct Approach |
|-------------|------|-----------------|
| DR plan exists but is never tested | Plan may not work when needed | Test semi-annually minimum |
| DR only for compute, not data | Data loss despite successful failover | Replicate all data stores |
| Manual failover procedures | Slow, error-prone under pressure | Automate as much as possible |
| Same-region DR only | Region-wide outage defeats the plan | Cross-region DR for critical services |
| DR plan not updated after changes | Plan does not match current architecture | Update DR plan with every architecture change |

---

## Cross-References

- `06_reliability/high_availability.md` — HA architecture principles
- `06_reliability/site_reliability.md` — SLO and error budget for DR
- `05_infrastructure_as_code/iac_fundamentals.md` — IaC for DR infrastructure
- `Templates/runbook_template.md` — Failover runbook format
- `Templates/incident_postmortem_template.md` — Post-DR-event review
