# Test Plan Template

## What This Enables

This template provides a standardized structure for test planning that ensures comprehensive coverage of scope, strategy, resources, schedule, and exit criteria. A completed test plan serves as the decision document that governs all testing activity for a specific release, feature, or project.

---

## Template

### 1. Document Information

| Field | Value |
|-------|-------|
| **Project/Feature** | [Name] |
| **Version** | [Document version, e.g., 1.0] |
| **Author** | [Name, role] |
| **Reviewers** | [Names, roles] |
| **Created** | [Date] |
| **Last Updated** | [Date] |
| **Status** | [Draft / In Review / Approved] |

---

### 2. Introduction

#### 2.1 Purpose
[Describe the purpose of this test plan. What release, feature, or project does it cover?]

#### 2.2 References
| Document | Location |
|----------|----------|
| Requirements/PRD | [Link] |
| Design Document | [Link] |
| Architecture Diagram | [Link] |
| Previous Test Plan | [Link] |

---

### 3. Test Scope

#### 3.1 In Scope

| Feature/Component | Priority | Rationale |
|-------------------|----------|-----------|
| [Feature 1] | High | [Why this is in scope] |
| [Feature 2] | Medium | [Why this is in scope] |

#### 3.2 Out of Scope

| Feature/Component | Rationale |
|-------------------|-----------|
| [Feature X] | [Why this is out of scope] |

#### 3.3 Assumptions
- [Assumption 1: e.g., "Test environment will be available by [date]"]
- [Assumption 2]

#### 3.4 Constraints
- [Constraint 1: e.g., "Testing must complete within 2 sprints"]
- [Constraint 2]

---

### 4. Risk Assessment

| Risk | Probability | Impact | Risk Level | Mitigation |
|------|------------|--------|------------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | Critical/High/Med/Low | [Mitigation strategy] |
| [Risk 2] | | | | |

---

### 5. Test Strategy

#### 5.1 Test Levels

| Level | Scope | Owner | Tools |
|-------|-------|-------|-------|
| Unit Testing | [Scope] | Developers | [Jest, Pytest, etc.] |
| Integration Testing | [Scope] | Dev + QA | [Testcontainers, etc.] |
| E2E Testing | [Scope] | QA | [Playwright, Cypress, etc.] |
| Performance Testing | [Scope] | QA/SRE | [k6, Locust, etc.] |
| Security Testing | [Scope] | Security/QA | [OWASP ZAP, Snyk, etc.] |

#### 5.2 Test Types

- [ ] Functional testing
- [ ] Regression testing
- [ ] Performance testing
- [ ] Security testing
- [ ] Accessibility testing
- [ ] Compatibility testing (browsers/devices)
- [ ] Exploratory testing
- [ ] User acceptance testing (UAT)

#### 5.3 Automation Strategy
[Describe what will be automated vs. manual. Justify the decision for each.]

---

### 6. Test Environment

| Environment | Purpose | Configuration | Status |
|-------------|---------|---------------|--------|
| [Dev] | Unit/integration tests | [Config details] | [Ready/Pending] |
| [Staging] | E2E/performance tests | [Config details] | [Ready/Pending] |
| [UAT] | User acceptance | [Config details] | [Ready/Pending] |

#### 6.1 Test Data Requirements
[Describe test data needs: synthetic data, anonymized production data, seed scripts]

#### 6.2 External Dependencies
| Dependency | Type | Availability | Fallback |
|-----------|------|-------------|----------|
| [Payment API] | Third-party | [Available/Mocked] | [WireMock stub] |

---

### 7. Schedule

| Phase | Start Date | End Date | Milestone |
|-------|-----------|----------|-----------|
| Test Planning | [Date] | [Date] | Plan approved |
| Test Design | [Date] | [Date] | Test cases written |
| Environment Setup | [Date] | [Date] | Environments ready |
| Test Execution - Cycle 1 | [Date] | [Date] | Initial pass complete |
| Defect Fixing | [Date] | [Date] | P1/P2 resolved |
| Test Execution - Cycle 2 | [Date] | [Date] | Regression verified |
| Sign-off | [Date] | [Date] | Release approved |

---

### 8. Entry Criteria

- [ ] Requirements are reviewed and approved
- [ ] Code is complete and merged to test branch
- [ ] Unit tests are passing (100%)
- [ ] Test environment is provisioned and accessible
- [ ] Test data is prepared and verified
- [ ] No blocking defects from previous sprint

---

### 9. Exit Criteria

| Criterion | Threshold | Measurement Method |
|-----------|-----------|-------------------|
| Test pass rate | >= 98% | Test management report |
| Code coverage (line) | >= [X]% | Coverage tool |
| Code coverage (branch) | >= [X]% | Coverage tool |
| Open P1 defects | 0 | Defect tracker |
| Open P2 defects | 0 | Defect tracker |
| Performance regression | Within [X]% of baseline | Performance test report |
| Security findings | 0 critical/high | Security scan report |

---

### 10. Resources

| Role | Name | Allocation | Responsibilities |
|------|------|-----------|-----------------|
| Test Lead | [Name] | [X]% | Test planning, coordination, reporting |
| QA Engineer | [Name] | [X]% | Test design, execution, automation |
| Developer | [Name] | [X]% | Unit tests, defect fixing |
| DevOps | [Name] | [X]% | Environment setup, CI pipeline |

---

### 11. Deliverables

| Deliverable | Format | Audience |
|-------------|--------|----------|
| Test Plan | This document | Team, stakeholders |
| Test Cases | [Test management tool] | QA team |
| Test Execution Report | [Format] | Team, management |
| Defect Report | [Defect tracker] | Team, management |
| Coverage Report | [Coverage tool] | Team |
| Release Readiness Report | [Format] | Stakeholders, management |

---

### 12. Approval

| Role | Name | Signature | Date |
|------|------|-----------|------|
| QA Lead | | | |
| Engineering Manager | | | |
| Product Manager | | | |

---

## Usage Notes

- Fill in all bracketed sections with project-specific information
- Remove sections that do not apply, but document why they were removed
- Update this plan at each phase gate (do not treat it as write-once)
- Store completed plans in version control alongside the code they govern
