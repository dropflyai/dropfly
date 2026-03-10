# Quality Gate Pattern

## Problem

Release decisions are subjective, inconsistent, and influenced by schedule pressure. Without objective criteria, the same quality level might be approved for release on one occasion and rejected on another, depending on who makes the decision and what deadlines are looming. This produces unpredictable production quality and erodes stakeholder trust.

## Context

This pattern applies when:
- The team deploys software to production (any cadence: daily, weekly, monthly)
- There are measurable quality attributes that can be evaluated automatically
- Multiple stakeholders (developers, QA, product, management) are involved in release decisions
- The team has experienced production incidents that could have been prevented by enforcing quality criteria

This pattern does NOT apply when:
- The system is a prototype or experiment with no production users
- Deployment is irreversible (one-time delivery, embedded systems without OTA updates)
- The team has no automated testing or quality measurement capability

## Solution

### Gate Architecture

Quality gates are layered in the deployment pipeline, each enforcing criteria appropriate to its stage:

```
Gate 1: Code Quality Gate (PR level)
├── All linting rules pass (zero violations)
├── Type checking passes (zero errors)
├── Unit test pass rate: 100%
├── Unit test coverage on changed files: >= 80% line, >= 70% branch
├── No new security vulnerabilities (dependency scan)
├── PR review approved by at least one reviewer
└── Enforcement: PR cannot be merged until gate passes

Gate 2: Integration Gate (post-merge)
├── Full unit test suite: 100% pass
├── Integration test suite: 100% pass
├── Contract tests: 100% pass
├── Database migration: up AND down successful
├── Static analysis: no new critical/high findings
└── Enforcement: Build artifact not produced until gate passes

Gate 3: Release Candidate Gate (pre-deployment)
├── E2E critical path tests: 100% pass
├── Performance regression: within 10% of baseline
├── Security scan (SAST + DAST): zero critical/high
├── Accessibility audit: zero critical violations
├── Bundle size: within 5% of baseline
├── All P1/P2 defects resolved
└── Enforcement: Deployment blocked until gate passes

Gate 4: Production Verification Gate (post-deployment)
├── Smoke tests pass against production
├── Synthetic monitoring: all checks green
├── Error rate: within baseline
├── Latency: within baseline
├── No new error patterns in logs
└── Enforcement: Auto-rollback if gate fails within 15 minutes
```

### Gate Criteria Design Principles

1. **Quantitative**: Every criterion has a numeric threshold (no "looks good" criteria)
2. **Automated**: Every criterion is evaluated by a tool, not a human
3. **Binary**: Every criterion produces pass/fail, not a score (scores invite negotiation)
4. **Immutable**: Criteria cannot be changed at deployment time (change requires a separate PR)
5. **Justified**: Each criterion documents the defect category it prevents

### Gate Override Protocol

When business urgency requires bypassing a gate:

```
1. The gate failure must be documented with specific details
2. A risk assessment must be produced:
   - What is the probability of a production defect from this bypass?
   - What is the expected user impact if that defect occurs?
   - What is the expected cost (revenue, reputation, engineering time)?
3. A designated authority (VP-level or above) must approve in writing
4. A remediation plan must be documented with a specific deadline
5. A tracking ticket must be created and linked to the override
6. The override must expire within 48 hours
7. Post-override: conduct a retrospective on why the gate failed
   and whether the gate criteria need adjustment
```

### Gate Health Monitoring

Monitor the gates themselves to ensure they remain effective:

| Metric | Target | What It Indicates |
|--------|--------|-------------------|
| Gate pass rate | > 90% | If too low, gates are too strict or code quality is poor |
| Gate duration | < 10 min (PR), < 30 min (release) | If too slow, gates become bottlenecks |
| Override rate | < 5% | If too high, gates are not respected or criteria are wrong |
| Post-bypass incident rate | Track | Validates that overrides are appropriately risk-managed |
| False positive rate | < 2% | If too high, teams lose trust and request overrides routinely |

### Progressive Gate Strictness

Gates should become stricter over time as the team matures:

| Phase | PR Gate | Release Gate |
|-------|---------|--------------|
| Phase 1 (Month 1-3) | Linting + unit tests | Unit + integration pass |
| Phase 2 (Month 3-6) | + Coverage threshold | + E2E critical path + performance |
| Phase 3 (Month 6-12) | + Security scan | + Accessibility + security scan |
| Phase 4 (Month 12+) | + Mutation score | + Chaos experiment pass + full E2E |

## Consequences

**Benefits:**
- Release decisions are objective, consistent, and defensible
- Quality criteria are enforced automatically without relying on human judgment
- Schedule pressure cannot silently degrade release quality
- Gate health metrics provide meta-quality insight

**Trade-offs:**
- Gates add time to the deployment pipeline (mitigated by parallelization)
- Overly strict gates can block legitimate deployments (mitigated by override protocol)
- Gate criteria require ongoing calibration as the system evolves
- Initial setup requires investment in tooling and CI pipeline configuration

## Related Patterns

- **Test Pyramid Pattern**: Gate criteria reference coverage at each pyramid layer
- **Regression Prevention Pattern**: Regression suite pass is a gate criterion
