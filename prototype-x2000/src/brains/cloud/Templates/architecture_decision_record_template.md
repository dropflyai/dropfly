# Architecture Decision Record (ADR) Template

## ADR-[NUMBER]: [Title — Short Descriptive Name]

**Date:** [YYYY-MM-DD]
**Status:** [Proposed | Accepted | Deprecated | Superseded by ADR-XXX]
**Deciders:** [List of people involved in the decision]
**Technical Area:** [Networking | Compute | Storage | Database | Security | Observability | Cost | Other]

---

## 1. Context and Problem Statement

[Describe the architectural challenge or decision point in 2-4 paragraphs. Include:]

- What is the current state of the system?
- What problem or opportunity prompted this decision?
- What constraints exist (budget, timeline, team skills, compliance)?
- What is the scope of impact (single service, platform-wide, cross-team)?

**Business Context:**
[Why does this matter to the business? What business outcomes depend on this decision?]

**Technical Context:**
[What technical factors influence this decision? Dependencies, existing architecture, technical debt?]

---

## 2. Decision Drivers

List the factors that most influence this decision, in priority order:

| Priority | Driver | Weight | Notes |
|----------|--------|--------|-------|
| 1 | [e.g., Reliability — must meet 99.95% SLO] | Critical | [Context] |
| 2 | [e.g., Cost — must stay within $X/month budget] | High | [Context] |
| 3 | [e.g., Team expertise — team knows Terraform, not Pulumi] | Medium | [Context] |
| 4 | [e.g., Time to market — must launch by Q3] | Medium | [Context] |
| 5 | [e.g., Operational complexity — minimize on-call burden] | Low | [Context] |

---

## 3. Considered Options

### Option A: [Name]

**Description:** [2-3 sentence summary of this approach]

**Architecture Diagram:**
```
[ASCII diagram or reference to diagram file]
```

**Pros:**
- [Advantage 1 with specific justification]
- [Advantage 2 with specific justification]
- [Advantage 3 with specific justification]

**Cons:**
- [Disadvantage 1 with specific impact]
- [Disadvantage 2 with specific impact]

**Cost Estimate:**
| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| [Service 1] | $X | [Sizing assumptions] |
| [Service 2] | $X | [Sizing assumptions] |
| **Total** | **$X** | |

**Operational Impact:**
- Deployment complexity: [Low | Medium | High]
- Monitoring requirements: [Describe]
- On-call impact: [Describe]
- Team training needed: [Describe]

---

### Option B: [Name]

**Description:** [2-3 sentence summary of this approach]

**Architecture Diagram:**
```
[ASCII diagram or reference to diagram file]
```

**Pros:**
- [Advantage 1 with specific justification]
- [Advantage 2 with specific justification]

**Cons:**
- [Disadvantage 1 with specific impact]
- [Disadvantage 2 with specific impact]

**Cost Estimate:**
| Component | Monthly Cost | Notes |
|-----------|-------------|-------|
| [Service 1] | $X | [Sizing assumptions] |
| **Total** | **$X** | |

**Operational Impact:**
- Deployment complexity: [Low | Medium | High]
- Monitoring requirements: [Describe]
- On-call impact: [Describe]
- Team training needed: [Describe]

---

### Option C: [Name] (if applicable)

[Same structure as Options A and B]

---

## 4. Decision Outcome

### Chosen Option: [Option X — Name]

**Rationale:** [2-3 paragraphs explaining why this option was selected. Reference the decision drivers and explain how this option best satisfies them. Be specific — do not just say "it is the best option."]

**Decision Matrix:**

| Driver | Weight | Option A | Option B | Option C |
|--------|--------|----------|----------|----------|
| Reliability | 5 | 4 (20) | 5 (25) | 3 (15) |
| Cost | 4 | 5 (20) | 3 (12) | 4 (16) |
| Team Expertise | 3 | 4 (12) | 2 (6) | 5 (15) |
| Time to Market | 3 | 3 (9) | 4 (12) | 2 (6) |
| Ops Complexity | 2 | 3 (6) | 4 (8) | 3 (6) |
| **Total** | | **67** | **63** | **58** |

*Scores: 1 (poor) to 5 (excellent). Weighted score = Weight x Score.*

---

## 5. Consequences

### Positive Consequences

- [Specific benefit 1 — what improves and by how much?]
- [Specific benefit 2]
- [Specific benefit 3]

### Negative Consequences (Accepted Tradeoffs)

- [Specific tradeoff 1 — what is sacrificed and why it is acceptable]
- [Specific tradeoff 2 — mitigation strategy if applicable]

### Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| [Risk 1] | [Low/Med/High] | [Low/Med/High] | [How to mitigate] |
| [Risk 2] | [Low/Med/High] | [Low/Med/High] | [How to mitigate] |

---

## 6. Implementation Plan

### Phase 1: [Name] (Week 1-2)

- [ ] [Task 1]
- [ ] [Task 2]
- [ ] [Task 3]

### Phase 2: [Name] (Week 3-4)

- [ ] [Task 4]
- [ ] [Task 5]

### Phase 3: [Name] (Week 5+)

- [ ] [Task 6]
- [ ] [Task 7]

**Rollback Plan:** [How to revert this decision if it does not work as expected. Include specific steps and criteria for triggering rollback.]

---

## 7. Validation Criteria

How will we know this decision was correct?

| Metric | Target | Measurement Method | Timeline |
|--------|--------|-------------------|----------|
| [e.g., p99 latency] | [< 200ms] | [CloudWatch metrics] | [30 days post-implementation] |
| [e.g., Monthly cost] | [< $5,000] | [Cost Explorer] | [60 days post-implementation] |
| [e.g., Deployment frequency] | [> 10/week] | [CI/CD metrics] | [90 days post-implementation] |
| [e.g., Error rate] | [< 0.1%] | [Application metrics] | [30 days post-implementation] |

**Review Date:** [Date to revisit this decision — typically 3-6 months after implementation]

---

## 8. Related Decisions

| ADR | Relationship | Notes |
|-----|-------------|-------|
| ADR-[X] | [Supersedes | Depends on | Related to] | [How they relate] |

---

## 9. References

- [Link to relevant documentation]
- [Link to AWS Well-Architected review]
- [Link to proof of concept results]
- [Link to benchmark data]

---

## Appendix: Decision Log

| Date | Author | Change |
|------|--------|--------|
| [YYYY-MM-DD] | [Name] | Initial proposal |
| [YYYY-MM-DD] | [Name] | Updated after architecture review |
| [YYYY-MM-DD] | [Name] | Accepted by team |

---

## Usage Guidelines

### When to Write an ADR

Write an ADR for any decision that:
- Affects system architecture or infrastructure topology
- Has cost implications exceeding $500/month
- Changes reliability or availability characteristics
- Introduces a new technology, service, or pattern
- Cannot be easily reversed (one-way door decisions)
- Affects multiple teams or services

### ADR Lifecycle

```
Proposed → Under Review → Accepted → [Implemented]
                                         ↓
                              Deprecated or Superseded
```

1. **Proposed**: Author drafts ADR, shares with team
2. **Under Review**: Team discusses, provides feedback (1-2 weeks)
3. **Accepted**: Decision is finalized, implementation begins
4. **Implemented**: Decision is fully deployed and validated
5. **Deprecated/Superseded**: Decision is replaced by a newer ADR

### Quality Checklist

Before submitting an ADR for review, verify:

- [ ] Problem statement is clear and specific
- [ ] At least two options are evaluated (including "do nothing" if applicable)
- [ ] Cost estimates are included for each option
- [ ] Operational impact is assessed for each option
- [ ] Decision matrix uses weighted scoring
- [ ] Implementation plan includes rollback strategy
- [ ] Validation criteria are measurable and time-bound
- [ ] Related ADRs are cross-referenced

### Naming Convention

```
ADR-YYYY-NNN-short-descriptive-title.md

Examples:
ADR-2024-001-database-selection-for-order-service.md
ADR-2024-002-multi-region-failover-strategy.md
ADR-2024-003-container-orchestration-platform.md
```

---

## Cross-References

- `Patterns/microservices_deployment_pattern.md` — Deployment decisions
- `Patterns/disaster_recovery_pattern.md` — DR architecture decisions
- `06_reliability/high_availability.md` — Availability architecture context
- `07_cost/cost_architecture.md` — Cost-aware architecture decisions
- `08_security/cloud_iam.md` — Security architecture decisions

