# Microservices Deployment Pattern — Safe Production Deployments

## Problem Statement

Deploying microservices to production carries inherent risk. A bad deployment can cause cascading failures across dependent services, data corruption, or customer-facing outages. Without a structured deployment pattern, teams rely on ad hoc processes that vary in rigor, leading to inconsistent reliability. This pattern provides a repeatable, safe deployment process for microservices using rolling updates, canary deployments, and blue-green strategies with automated verification at each stage.

---

## Context

Apply this pattern when:
- Deploying a new version of a microservice to production
- Deploying infrastructure changes that affect running services
- Performing database migrations alongside code deployments
- Rolling out feature flags to production users
- Any change to production that could affect service availability

---

## Solution — Safe Deployment Process

### Phase 1: Pre-Deployment Verification

**1.1 Pipeline Gates (Automated)**
- [ ] All unit tests pass (100% required)
- [ ] Integration tests pass against staging
- [ ] SAST scan: no critical/high findings
- [ ] SCA scan: no critical vulnerabilities in dependencies
- [ ] Container image scan: no critical CVEs
- [ ] Image signed and verified
- [ ] SBOM generated and stored

**1.2 Pre-Deployment Checklist (Manual)**
- [ ] Deployment plan reviewed by on-call engineer
- [ ] Rollback plan documented and tested
- [ ] Database migration backward compatible (if applicable)
- [ ] Feature flags configured for gradual rollout
- [ ] Monitoring dashboards open and baseline established
- [ ] Communication sent to relevant stakeholders
- [ ] Deployment window appropriate (not Friday afternoon, not during peak)

### Phase 2: Deployment Strategy Selection

| Strategy | When to Use | Risk Level | Rollback Speed |
|----------|------------|-----------|----------------|
| Rolling Update | Standard deployments, stateless services | Low-Medium | 2-5 minutes |
| Canary | High-risk changes, performance-sensitive | Very Low | Seconds (shift traffic) |
| Blue-Green | Database migrations, major version changes | Low | Seconds (switch target group) |
| Feature Flag | Behavioral changes, UI changes | Very Low | Seconds (toggle flag) |

### Phase 3: Rolling Update Execution

```yaml
# Kubernetes rolling update configuration
spec:
  strategy:
    type: RollingUpdate
    rollingUpdate:
      maxUnavailable: 1    # At most 1 pod unavailable during update
      maxSurge: 1          # At most 1 extra pod during update
  minReadySeconds: 30      # Wait 30s after ready before proceeding
```

**Execution steps:**
1. Deploy new version to staging, run smoke tests
2. Begin production rolling update
3. New pods start, pass readiness probes
4. Old pods begin draining (finish in-flight requests)
5. Monitor error rate, latency, 5xx responses during rollout
6. If metrics degrade beyond threshold, automatic rollback triggers
7. Rollout completes when all pods are running new version

### Phase 4: Canary Deployment Execution

```
Traffic Split:
  Step 1: 5% → new version, 95% → old version (observe 10 minutes)
  Step 2: 25% → new version, 75% → old version (observe 10 minutes)
  Step 3: 50% → new version, 50% → old version (observe 10 minutes)
  Step 4: 100% → new version (full rollout)

At each step, verify:
  - Error rate not increased >0.1% from baseline
  - p99 latency not increased >20% from baseline
  - No new error types appearing in logs
  - Business metrics (conversion, orders) not degraded
```

### Phase 5: Post-Deployment Verification

- [ ] All health checks passing
- [ ] Error rate within SLO
- [ ] Latency within SLO
- [ ] No new error patterns in logs
- [ ] Dependent services unaffected
- [ ] Business metrics nominal
- [ ] Enhanced monitoring for 30 minutes post-deploy

### Phase 6: Rollback Procedure

**Automatic rollback triggers:**
- Error rate exceeds 2x baseline for 2 minutes
- p99 latency exceeds 3x baseline for 2 minutes
- Health check failures on >20% of pods
- Any 500-series error rate exceeding SLO

**Manual rollback:**
```bash
# Kubernetes
kubectl rollout undo deployment/order-service

# ECS
aws ecs update-service --service order-service --task-definition order-service:PREVIOUS_VERSION

# ArgoCD
argocd app rollback order-service
```

---

## Implementation Checklist

- [ ] Pipeline gates all passing
- [ ] Pre-deployment checklist completed
- [ ] Deployment strategy selected and configured
- [ ] Monitoring dashboards open with baseline
- [ ] Deployment executed per selected strategy
- [ ] Canary metrics verified at each traffic shift step
- [ ] Post-deployment verification complete
- [ ] Rollback plan validated (tested at least quarterly)
- [ ] Deployment documented in change log

---

## Verification

This pattern is correctly applied when:
- Zero customer-impacting incidents during deployment
- Deployment completes within the planned maintenance window
- All automated gates pass before production deployment
- Rollback can be executed within 2 minutes if needed
- Post-deployment metrics match or improve pre-deployment baseline

---

## Anti-Patterns

| Anti-Pattern | Risk | Correct Approach |
|-------------|------|-----------------|
| Big-bang deployment | All-or-nothing risk | Gradual rollout with canary or rolling update |
| Friday afternoon deploys | Limited support if issues arise | Deploy early in the week during business hours |
| Skip staging | No pre-production validation | Always validate in staging first |
| Manual deployment steps | Error-prone, inconsistent | Fully automated pipeline |
| No rollback plan | Stuck with broken deployment | Documented and tested rollback procedure |
| Deploy during incidents | Complicates investigation | Deploy only when system is in known-good state |

---

## Cross-References

- `04_containers/kubernetes.md` — Kubernetes deployment strategies
- `04_containers/container_orchestration.md` — GitOps deployment
- `06_reliability/site_reliability.md` — SLO-based deployment decisions
- `06_reliability/observability.md` — Monitoring during deployment
- `Templates/runbook_template.md` — Deployment runbook format
