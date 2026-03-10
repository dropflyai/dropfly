# Scaling Operations Pattern

> A structured pattern for preparing and executing operational scaling -- from audit through standardization, automation, capacity planning, and governance at scale.

---

## Context

This pattern applies when an organization is approaching or undergoing significant growth (2x-10x) and existing operations must scale without proportional headcount increase. The goal is to move from heroic, manual operations to systematic, scalable operations.

**Use this pattern when:**
- Revenue or user growth is outpacing operational capacity
- Headcount is growing linearly with volume (scaling problem)
- Processes that worked at current scale are beginning to strain or break
- Quality or delivery timelines are degrading under increasing volume
- Manual workarounds are becoming unsustainable
- The organization is preparing for a known growth event (product launch, funding round, market expansion)

**Do NOT use this pattern for:**
- Optimizing a single process in isolation (use Process Optimization Pattern)
- Responding to an active incident (use Incident Response Pattern)
- Organizational design or restructuring (consult MBA Brain)

---

## Phase 1: Scaling Audit (Weeks 1-2)

### Objective
Identify every operational process, system, and team capacity that will break at 10x current volume.

### Volume Projection

| Metric | Current | 3x | 5x | 10x | Source |
|--------|---------|----|----|-----|--------|
| Customers / users | | | | | |
| Transactions / orders per day | | | | | |
| Support tickets per day | | | | | |
| Data volume (GB/day) | | | | | |
| Revenue per month | $ | $ | $ | $ | |

### Process Scaling Assessment

For each core operational process, assess its scaling readiness:

| Process | Current Volume | Max Capacity | Scaling Limit | Breaks At | Priority |
|---------|---------------|-------------|--------------|----------|---------|
| | /day | /day | [ ] People [ ] System [ ] Process | ___x | |
| | /day | /day | [ ] People [ ] System [ ] Process | ___x | |
| | /day | /day | [ ] People [ ] System [ ] Process | ___x | |
| | /day | /day | [ ] People [ ] System [ ] Process | ___x | |

### Scaling Readiness Scorecard

| Dimension | Score (1-5) | Notes |
|-----------|------------|-------|
| Process documentation (SOPs exist and are current) | | |
| Automation level (% of manual steps automated) | | |
| Monitoring and alerting (operational visibility) | | |
| Knowledge distribution (bus factor > 1 for all processes) | | |
| System capacity (infrastructure headroom) | | |
| Team capacity (hiring pipeline, onboarding speed) | | |
| Vendor scalability (third-party capacity) | | |
| Quality systems (automated quality checks) | | |
| **Average Score** | **/5** | |

**Interpretation:**
- 4.0-5.0: Ready to scale. Minor gaps to address.
- 3.0-3.9: Partially ready. Address gaps before scaling.
- 2.0-2.9: Significant risk. Major work required before scaling.
- 1.0-1.9: Not ready. Scaling will cause operational failure.

### Bottleneck Identification

List the top 5 bottlenecks that will constrain scaling:

| Rank | Bottleneck | Current Impact | Impact at 10x | Resolution Approach |
|------|-----------|---------------|--------------|-------------------|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |
| 4 | | | | |
| 5 | | | | |

---

## Phase 2: Standardize (Weeks 2-4)

### Objective
Document, standardize, and make repeatable every critical process before scaling.

### SOP Priority Matrix

Not every process needs an SOP immediately. Prioritize based on:

| Process | Frequency | Complexity | People Involved | Variation Today | SOP Priority |
|---------|----------|-----------|----------------|----------------|-------------|
| | /day | [ ] Low [ ] Med [ ] High | | [ ] Low [ ] Med [ ] High | [ ] P0 [ ] P1 [ ] P2 |
| | /day | [ ] Low [ ] Med [ ] High | | [ ] Low [ ] Med [ ] High | [ ] P0 [ ] P1 [ ] P2 |
| | /day | [ ] Low [ ] Med [ ] High | | [ ] Low [ ] Med [ ] High | [ ] P0 [ ] P1 [ ] P2 |

**P0:** Must have SOP before scaling. High frequency, high complexity, or high variation.
**P1:** Should have SOP during scaling. Medium priority.
**P2:** Can document after initial scaling. Low frequency or low complexity.

### Standardization Checklist

For each P0 process:

- [ ] Current process mapped (as-is)
- [ ] Waste identified and removed (optimized before standardizing)
- [ ] SOP written using the SOP Template
- [ ] SOP reviewed by process workers and process owner
- [ ] Training materials created
- [ ] All process workers trained
- [ ] Compliance verified (workers can execute from SOP)
- [ ] SOP stored in accessible location (wiki, knowledge base)
- [ ] Review cadence established (quarterly)

### Knowledge Management

Tribal knowledge is the enemy of scaling. Extract and document it.

| Knowledge Type | Current State | Target State | Action |
|---------------|-------------|-------------|--------|
| Process knowledge | In people's heads | In SOPs and runbooks | Document |
| Decision criteria | Varies by person | Standardized decision trees | Codify |
| Escalation paths | Informal | Documented escalation matrix | Formalize |
| Vendor contacts | In individual emails | In shared CRM / wiki | Centralize |
| Troubleshooting | Senior staff only | In runbooks with decision trees | Extract and document |

---

## Phase 3: Automate (Weeks 4-8)

### Objective
Replace manual work with automation, starting with the highest-ROI opportunities.

### Automation Opportunity Assessment

| Process / Step | Manual Effort | Frequency | Error Rate | Rule-Based? | Automation ROI |
|---------------|-------------|----------|-----------|-----------|---------------|
| | hr/week | /week | % | [ ] Yes [ ] Partial [ ] No | $ saved/year |
| | hr/week | /week | % | [ ] Yes [ ] Partial [ ] No | $ saved/year |
| | hr/week | /week | % | [ ] Yes [ ] Partial [ ] No | $ saved/year |

### Automation Tier Framework

| Tier | Description | Investment | Timeline | Examples |
|------|-----------|-----------|----------|---------|
| Tier 1: No-code | Existing tools, configuration only | Low ($0-1K) | Days | Zapier/n8n workflows, spreadsheet macros, email rules |
| Tier 2: Low-code | Templates and integrations | Medium ($1-10K) | Weeks | API integrations, database triggers, custom dashboards |
| Tier 3: Custom build | Engineering effort required | High ($10K+) | Months | Custom services, ML models, platform development |

### Automation Implementation Sequence

| Priority | Automation | Tier | Owner | Start | End | Status |
|---------|-----------|------|-------|-------|-----|--------|
| 1 | | T1/T2/T3 | | | | [ ] Planned [ ] Building [ ] Testing [ ] Live |
| 2 | | T1/T2/T3 | | | | [ ] Planned [ ] Building [ ] Testing [ ] Live |
| 3 | | T1/T2/T3 | | | | [ ] Planned [ ] Building [ ] Testing [ ] Live |

### Human-in-the-Loop Design

Not everything should be fully automated. Design the right level of human oversight.

| Automation | Fully Automated? | Human Checkpoint | Why |
|-----------|-----------------|-----------------|-----|
| | [ ] Yes [ ] No | | (compliance, judgment, edge cases) |
| | [ ] Yes [ ] No | | |
| | [ ] Yes [ ] No | | |

---

## Phase 4: Scale Capacity (Weeks 4-10)

### Objective
Ensure infrastructure, team, and vendor capacity can handle projected growth.

### Infrastructure Capacity Planning

| Resource | Current Capacity | Current Usage | Projected Need (10x) | Gap | Action |
|----------|-----------------|--------------|---------------------|-----|--------|
| Compute (servers/containers) | | | | | |
| Storage (database, files) | | | | | |
| Network bandwidth | | | | | |
| API rate limits (third-party) | | | | | |
| Monitoring / logging capacity | | | | | |

### Team Capacity Planning

| Function | Current Headcount | Current Throughput | Throughput at 10x (with automation) | Headcount Needed | Hire Plan |
|----------|-----------------|-------------------|-------------------------------------|-----------------|-----------|
| | | /person/day | /person/day | | |
| | | /person/day | /person/day | | |
| | | /person/day | /person/day | | |

**Key ratio:** After automation, what is the volume-per-person ratio? The goal is sublinear headcount growth (e.g., 10x volume requires only 3-4x headcount).

### Vendor Scaling Assessment

| Vendor | Service | Current Tier/Limit | Projected Need | Can They Scale? | Action |
|--------|---------|-------------------|---------------|----------------|--------|
| | | | | [ ] Yes [ ] No [ ] Unknown | |
| | | | | [ ] Yes [ ] No [ ] Unknown | |

### Onboarding Acceleration

To scale the team, new hires must become productive faster.

| Element | Current State | Target State | Action |
|---------|-------------|-------------|--------|
| Time to productivity (new hire) | weeks | weeks | |
| Onboarding documentation | | | |
| Buddy / mentor program | [ ] Yes [ ] No | [ ] Yes | |
| Self-service training materials | | | |

---

## Phase 5: Govern at Scale (Weeks 8-12)

### Objective
Establish the metrics, dashboards, and governance structures needed to operate reliably at scale.

### Operational Dashboard

Build a real-time operational dashboard with the following metrics:

| Metric | Target | Alert Threshold | Dashboard Location |
|--------|--------|----------------|-------------------|
| Throughput (volume processed per hour) | | < ___ triggers alert | |
| Error / defect rate | < ___% | > ___% triggers alert | |
| Queue depth / backlog | < ___ items | > ___ items triggers alert | |
| Cycle time (end-to-end) | < ___ hours | > ___ hours triggers alert | |
| System health (uptime, latency) | > ___% | < ___% triggers alert | |
| Team utilization | ___-___% | > ___% triggers alert | |

### Governance Structure

| Governance Element | Cadence | Participants | Focus |
|-------------------|---------|-------------|-------|
| Daily stand-up | Daily | Team leads | Blockers, queue health, capacity |
| Weekly operations review | Weekly | Operations manager + leads | Metrics, trends, improvement actions |
| Monthly capacity review | Monthly | Ops + Engineering + Finance | Capacity utilization, forecasting, investment |
| Quarterly strategy review | Quarterly | Leadership | Scaling roadmap, investment decisions, OKRs |

### Incident Preparedness at Scale

Higher volume means more frequent and more impactful incidents.

| Readiness Item | Status |
|---------------|--------|
| Incident response pattern deployed and tested | [ ] Done [ ] In Progress [ ] Not Started |
| On-call rotation covers all critical systems | [ ] Done [ ] In Progress [ ] Not Started |
| Runbooks exist for top 10 failure modes | [ ] Done [ ] In Progress [ ] Not Started |
| Automated alerting is configured for all critical metrics | [ ] Done [ ] In Progress [ ] Not Started |
| Communication templates are pre-configured | [ ] Done [ ] In Progress [ ] Not Started |
| Disaster recovery / failover tested in last 90 days | [ ] Done [ ] In Progress [ ] Not Started |

---

## Scaling Playbook Summary

| Growth Phase | Focus | Key Actions |
|-------------|-------|------------|
| 1x to 3x | Standardize | Document SOPs, reduce variation, establish baselines |
| 3x to 5x | Automate | Eliminate manual work, build integrations, hire selectively |
| 5x to 10x | Architect | Redesign for scale, invest in platforms, establish governance |
| 10x+ | Optimize | Continuous improvement, ML-driven optimization, distributed operations |

---

## Anti-Patterns

| Anti-Pattern | Why It Fails | Better Approach |
|-------------|-------------|-----------------|
| Hiring your way out of scaling | Headcount grows linearly with volume; margins collapse | Automate first, then hire for judgment-intensive work |
| Scaling before standardizing | Inconsistent processes produce inconsistent results at scale | Standardize, then scale |
| Automating tribal knowledge | Undocumented rules produce brittle automation | Document, then automate |
| Premature optimization | Over-engineering for 100x when you need 3x | Build for the next order of magnitude, not three ahead |
| Ignoring culture | Process changes without cultural buy-in produce resistance | Involve teams, communicate the why, celebrate wins |
| Single points of failure | Key person, single vendor, or one system with no backup | Redundancy for every critical path |
| Not measuring before scaling | No baseline means no way to know if scaling is working | Measure at current state; compare at each growth milestone |

---

## Cross-References

| Reference | Location |
|-----------|----------|
| Process Optimization Pattern | `Patterns/process_optimization_pattern.md` |
| SOP Template | `Templates/sop_template.md` |
| Operations Review Template | `Templates/operations_review_template.md` |
| Capacity Planning | `05_scaling/` |
| Operational Metrics | `06_metrics/` |
| Automation Brain | `/prototype_x1000/automation_brain/` |
| Engineering Brain | `/prototype_x1000/engineering_brain/` |
| HR Brain (hiring) | `/prototype_x1000/hr_brain/` |

---

*Pattern version: 1.0*
*Brain: Operations Brain*
*Reference: 05_scaling/, 06_metrics/, 02_process/*
